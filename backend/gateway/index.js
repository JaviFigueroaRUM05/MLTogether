'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Nes = require('nes');

const init = async () => {
    const server = Hapi.server({ port: 3000, host: 'localhost' });
    
    await server.register(Inert);

    // WebSockets handlers
    const onMessage = (socket, message) => {
        console.log(socket.id + " Sends:", message);
        return "received!"
    };

    const onConnection = (socket) => {
        console.log("Socket Connected: " + socket.id);
    };

    const onDisconnection = (socket) => {
        console.log("Socket Disconnected: " + socket.id);
    };

    await server.register({ plugin: Nes, options: { onMessage, onDisconnection, onConnection } });

    // HTTP Routes
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
        }
    });

    // WebSocket Routes
    server.route({
        method: 'GET',
        path: '/project/next',
        config: {
            handler: (request, h) => {

                const test_payload = {
                    function: "reduce",
                    data: 20
                };

                return JSON.stringify(test_payload);
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
