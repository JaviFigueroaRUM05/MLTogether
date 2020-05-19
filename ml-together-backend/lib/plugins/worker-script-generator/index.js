'use strict';

const Schmervice = require('schmervice');
const ScriptGeneratorService = require('./services/script-generator');

// TODO: Add Hodgepodge
exports.plugin = {

    name: 'WorkerScriptGenerator',
    version: '1.0.0',
    register: async (server, options) => {
        // Register Websockets as plugins
        try {

            await server.register({
                plugin: Schmervice
            });

            await server.registerService(ScriptGeneratorService);

            const { scriptGeneratorService } = server.services();
            await scriptGeneratorService.initialize();

        }
        catch (err) {

            console.error(err);
            process.exit(1);
        }

    }
};
