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

    // Hapi plugins
    await server.register({ plugin: Nes, options: { onMessage, onDisconnection, onConnection } });

    // HTTP Routes
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
        }
    });

    server.route({
        method: 'GET',
        path: '/vc',
        handler: (request, h) => {
            
            const functions = { // 
                map: (n) => { // Map = factorial(n)
                    var result = 1;
                    if (n == 0) { return result; }
                    for (var i = 1; i <= n; i += 1) {
                        result *= i;
                    }
                    return result;
                },
                reduce: (n) => { // Reduce = fibonacci(n)
                    if (n == 0) { return 0; }
                    if (n == 1) { return 1; }
                    return reduce(n-1) + reduce(n-2)
                }
            };
             
            return functions;
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
