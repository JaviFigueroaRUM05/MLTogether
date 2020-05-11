'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Schmervice = require('schmervice');
const Faker = require('faker');
const ScriptGeneratorService = require('../../../../lib/plugins/worker-script-generator/services/script-generator');
const FS = require('fs');
const Path = require('path');

const { experiment, it, beforeEach,
    before,
    after
} = exports.lab = Lab.script();
const {
    expect
} = Code;

experiment('ScriptGeneratorService', () => {

    const publicPath = Path.resolve(__dirname, 'public');
    const templatesPath = Path.resolve(__dirname, 'templates');
    const temporaryPath = Path.resolve(__dirname, 'temporary');

    let server;

    const wrapperPlugin = {
        name: 'wrapperPlugin',
        version: '1.0.0',
        register: async function (server, options) {

            await server.register({
                plugin: Schmervice
            });
            await server.registerService(ScriptGeneratorService);

        }
    };

    beforeEach(async () => {

        server = Hapi.server();
        await server.register({ plugin: wrapperPlugin, options: { publicPath, templatesPath, temporaryPath } });


        FS.rmdirSync(publicPath, { recursive: true });
        FS.rmdirSync(templatesPath, { recursive: true });

    });
    experiment('Deployment', () => {

        it('registers the ScriptGeneratorService.', () => {

            expect(server.services().scriptGeneratorService).to.exist();
        });


    });

    experiment('initialize', () => {

        it('creates the public folder', async () => {

            const { scriptGeneratorService } = server.services();
            await scriptGeneratorService.initialize();
            expect(FS.existsSync(publicPath)).to.be.true();
        });

        it('creates the temporary folder', async () => {

            const { scriptGeneratorService } = server.services();
            await scriptGeneratorService.initialize();
            expect(FS.existsSync(temporaryPath)).to.be.true();
        });

        it('will not initialize more than once');


    });


// End of ScriptGeneratorService experiment
});

