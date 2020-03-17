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
        var msg = JSON.parse(message);

        if (msg.event == "next") { // Get next task from Task Brocker
            return JSON.stringify({ function: "reduce", data: 20 });
        }
        if (msg.event == "result") { // Push Result to Task Brocker
            
        }
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

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
