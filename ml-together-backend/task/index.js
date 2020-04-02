'use strict';

const Nes = require('nes');
const CreateOptions = require('./options');
const AMQPInitializer = require('./amqp-initializer');

exports.plugin = {

    name: 'TaskBroker',
    version: '1.0.0',
    register: async (server, options) => {

        // Adds the amqp channel as a method to the server
        let channel = null;
        try {
            channel = await AMQPInitializer.initialize('amqp://0.0.0.0');
        }
        catch (err) {
            server.log(['error'], err.message);
            throw err;
        }

        // Must not be an arrow function due to scoping
        // eslint-disable-next-line @hapi/hapi/scope-start, brace-style
        server.method('amqp.channel', function () { return this; }, { bind: channel });

        // Register Websockets as plugins
        await server.register({
            plugin: Nes,
            options: CreateOptions(server)
        });
    }
};
