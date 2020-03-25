'use strict';

const QueueActions = require('./queue-actions');

const onMessage = (server) =>

    async function (socket, message) {

        server.log( ['debug'],socket.id + ' Sends:', message);

        const msg = JSON.parse(message);
        const channel = server.methods.amqp.channel();
        const tasksQueue = 'task_queue';
        const resultsQueue = 'task_queue';


        // bring more tasks
        if (msg.event === 'next') {

            const task = await QueueActions.fetchFromQueue(channel, tasksQueue);
            server.log(['debug'],task);

            // TODO: Place logic for mapping fetch results to send out the message

            return JSON.stringify({
                function: 'reduce',
                data: 20
            });

        }
        else if (msg.event === 'result') {
            // TODO: Push Result to Task Broker
            const results = 'Test';
            await QueueActions.pushResultsToQueue(results, channel, resultsQueue);

        }
        else {
            // TODO: Return error because event does not exist
        }
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
