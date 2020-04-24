'use strict';

const QueueActions = require('./queue-actions');

const onMessage = (server) =>

    async function (socket, message) {

        server.log( ['debug'],socket.id + ' Sends:', message);

        const msg = JSON.parse(message);
        const channel = server.methods.amqp.channel();
        const projectId = msg.projectId;

        // TODO: Check if the projectId exists
        const tasksQueueName = 'task_queue_' + projectId;
        const mapResultsQueueName = 'map_results_queue_' + projectId;
        const resultsQueueName = 'reduce_results_queue_' + projectId;
        // TODO: Split into more result queues

        // TODO: Split in projects somehow
        // bring more tasks
        if (msg.event === 'next') {

            const encodedTask = await QueueActions.fetchFromQueue(channel, tasksQueueName, 5000);
            if (encodedTask === null) {
                return JSON.stringify({ function: 'nop' });
            }

            const task = JSON.parse(encodedTask);

            if (task.function === 'reduce' ) {
                const mapResultsId = task.mapResultsId;

                // TODO: Check first if all of the map results are in the queue
                const reduceData = [];
                let gotAllMapResults = false;
                while (!gotAllMapResults) {
                    const reduceDataInstance =  await QueueActions.fetchFromQueue(channel,
                        mapResultsQueueName + '_' + mapResultsId, 3000);
                    //console.log(reduceDataInstance);
                    if (reduceDataInstance === null) {
                        gotAllMapResults = true;
                    }
                    else {
                        reduceData.push(reduceDataInstance.toString());
                    }

                }

                task.reduceData = reduceData;
                console.log('Returning reduces');
                return JSON.stringify(task);
            }

            server.log(['debug'],encodedTask);

            return encodedTask.toString();

        }
        else if (msg.event === 'result') {
            //console.log(msg);
            const results = msg.results;
            console.log(results.result.grads['conv2d_Conv2D1/kernel'][0][0][0]);
            if (msg.lastOperation === 'map') {
                const mapResultsQueueFullName = mapResultsQueueName + '_' + msg.mapResultsId;
                channel.assertQueue(mapResultsQueueFullName, {
                    durable: true
                });
                await QueueActions.pushResultsToQueue(results, channel, mapResultsQueueFullName);
            }
            else {
                console.log('Done');
            }

            return { message: 'good' };

        }

        // TODO: Return error because event does not exist

    };

const onConnection = (socket) => {

    console.log('Socket Connected: ' + socket.id);
};

const onDisconnection = (socket) => {

    console.log('Socket Disconnected: ' + socket.id);
};



module.exports = function createOptions(server) {

    return {
        onMessage: onMessage(server),
        onConnection,
        onDisconnection
    };
};
