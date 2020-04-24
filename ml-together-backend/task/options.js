'use strict';

const QueueActions = require('./queue-actions');
const Worker = require('./worker');

var activeSessions = {};

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
                console.log('here');
                return JSON.stringify({ function: 'nop' });
            }

            const task = JSON.parse(encodedTask);
            activeSessions[socket.id].currentJob = { task: task, status: 'working' };

            if (task.function === 'reduce' ) {
                const mapResultsId = task.mapResultsId;

                // TODO: Check first if all of the map results are in the queue
                const reduceData = [];
                let gotAllMapResults = false;
                while (!gotAllMapResults) {
                    console.log('here');
                    const reduceDataInstance =  await QueueActions.fetchFromQueue(channel,
                        mapResultsQueueName + '_' + mapResultsId, 3000);

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
            activeSessions[socket.id].currentJob.status = 'done';
            activeSessions[socket.id].completedJobs += 1;
            return { message: 'good' };

        }

        // TODO: Return error because event does not exist

    };

const onConnection = (socket) => {
    activeSessions[socket.id] = new Worker.Worker(socket.id);
    console.log('Socket Connected: ' + activeSessions[socket.id].id);
    console.log('Active Sessions: ', activeSessions);
};

const onDisconnection = (socket) => {
    delete activeSessions[socket.id];
    console.log('Socket Disconnected: ' + socket.id);
};



module.exports = function createOptions(server) {

    server.route({
        method: 'GET',
        path: '/sessions',
        handler: (request, h) => {
            return activeSessions;
        }
    });

    return {
        onMessage: onMessage(server),
        onConnection,
        onDisconnection
    };
};
