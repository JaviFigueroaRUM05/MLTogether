'use strict';

const Nes = require('nes');
const CreateOptions = require('./options');
const Schmervice = require('schmervice');
const QueueService = require('./services/queue');
const TaskService = require('./services/task');

// TODO: Add Hodgepodge
exports.plugin = {

    name: 'TaskBroker',
    version: '1.0.0',
    register: async (server, options) => {
        // Register Websockets as plugins
        try {
            await server.register({
                plugin: Nes,
                options: CreateOptions(server)
            });

            await server.register({
                plugin: Schmervice
            });

            await server.registerService(QueueService);
            await server.registerService(TaskService);



        }
        catch (err) {

            console.error(err);
            process.exit(1);
        }

    }
};
