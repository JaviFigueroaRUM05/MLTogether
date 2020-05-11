'use strict';

const TF = require('@tensorflow/tfjs-node');
const Worker = require('./worker');

const activeSessions = {};

const onMessage = (server) =>

    async function (socket, message) {

        //server.log( ['debug'],socket.id + ' Sends:' + message);
        const { queueService } = server.services();
        const msg = JSON.parse(message);
        const projectId = msg.projectId;

        // TODO: Check if the projectId exists
        // TODO: Split in projects somehow
        // bring more tasks
        if (msg.event === 'next') {

            const task = await queueService.fetchTaskFromQueue(projectId);
            activeSessions[socket.id].currentJob = { task, status: 'working' };

            if (task.function === 'reduce' ) {
                const mapResultsId = task.mapResultsId;

                const reduceData = await queueService
                    .fetchAllFromMapResultsQueue(projectId, mapResultsId,
                        task.numberOfBatches);

                task.reduceData = reduceData;
                server.log(['debug'],'Returning reduces');
                return task;
            }

            server.log(['memory'],
                `The script uses approximately 
                    ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);

            return task;

        }
        else if (msg.event === 'result') {
            const results = msg.results;
            if (msg.lastOperation === 'map') {
                await queueService.sendToMapResultsQueue(projectId, msg.mapResultsId, results);
            }
            else {
                server.log(['debug'], 'Done');
            }

            activeSessions[socket.id].currentJob.status = 'done';
            activeSessions[socket.id].completedJobs += 1;
            return { message: 'good' };

        }

        // TODO: Return error because event does not exist

    };

const onConnection = (server) =>

    function (socket) {

        activeSessions[socket.id] = new Worker.Worker(socket.id);
        // server.log([debug],'Socket Connected: ' + activeSessions[socket.id].id);
        // server.log('Worker: ', activeSessions[socket.id]);
    };


const onDisconnection = (server) =>

    function (socket) {

        // server.log(['debug'],'Worker: ' + activeSessions[socket.id]);
        delete activeSessions[socket.id];
        // server.log(['debug'],'Socket Disconnected: ' + socket.id);
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
        onConnection: onConnection(server),
        onDisconnection: onDisconnection(server)
    };
};
