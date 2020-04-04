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

            const task = await QueueActions.fetchFromQueue(channel, tasksQueueName, 5000);
            if (task === null) {
                return { function: 'nop' };
            }

            if (JSON.parse(task).function === 'reduce' ) {

                return task.toString();
            }

            server.log(['debug'],task);

            return task.toString();

        }
        else if (msg.event === 'result') {
            console.log(msg);
            const results = msg.results;
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
