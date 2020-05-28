'use strict';

// Load modules
// TODO: make the server creation part cleaner
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const IntermediateResultsPlugin = require('../../../../lib/plugins/intermediate-results').plugin;
const Hapi = require('@hapi/hapi');
const Mongo = require('hapi-mongodb');
const { getTestIntermediateProjects,deleteTestIntermediateResults  } = require('../../../utils/mongodb-manager');
const IOHandlers = require('../../../utils/io-handlers');
// Test shortcuts

const { experiment, it, beforeEach, after } = exports.lab = Lab.script();
const { expect } = Code;

const TF = require('@tensorflow/tfjs-node');


const FormData = require('form-data');

const projectId = '0';


// MongoDB Utility
const url = 'mongodb://localhost:27017';

experiment('Test Route', () => {

    let server;
    beforeEach( async () => {

        server = Hapi.server();
        await server.register({
            plugin: Mongo,
            options: {

                settings: {
                    poolSize: 10,
                    useUnifiedTopology: true
                },
                decorate: true,
                url: 'mongodb://localhost:27017/mltest'


            } });
        await server.register({
            plugin: IntermediateResultsPlugin
        });

        await deleteTestIntermediateResults();
    });
    experiment('POST intermediate results route', { timeout: 20000 }, () => {

        it('saves data into MongoDB', async () => {

            const route = '/projects/0/ir';

            const form = new FormData();
            const fakeResult = 'fhaiufhiucguydgvjwhvfsfyusa';
            const modelId = '0';
            form.append('modelId', modelId);
            form.append('model', fakeResult);

            const headers = form.getHeaders();
            const payload = form.getBuffer();
            try {
                await server.inject({
                    method: 'POST',
                    url: route,
                    headers,
                    payload
                });
            }
            catch (err) {
                console.error(err);
                return false;
            }

            const results = await getTestIntermediateProjects();

            expect(results).to.be.an.array();
            expect(results.length).to.equal(1);

            const result = results[0];

            expect(result).to.be.an.object();
            expect(result).to.include(['projectId', 'modelId', 'model']);

            expect(result.projectId).to.equal(projectId);
            expect(result.modelId).to.equal(modelId);
            expect(result.model).to.equal(fakeResult);

        });

        it('TensorFlow.js save using route saves model into MongoDB', async () => {

            TF.engine().startScope();

            const model = TF.sequential();
            model.add(TF.layers.conv2d({
                inputShape: [28, 28, 1],
                filters: 32,
                kernelSize: 3,
                activation: 'relu'
            }));
            model.add(TF.layers.conv2d({
                filters: 32,
                kernelSize: 3,
                activation: 'relu'
            }));
            model.add(TF.layers.maxPooling2d({ poolSize: [2, 2] }));
            model.add(TF.layers.conv2d({
                filters: 64,
                kernelSize: 3,
                activation: 'relu'
            }));
            model.add(TF.layers.dense({ units: 10, activation: 'softmax' }));

            const optimizer = 'rmsprop';
            model.compile({
                optimizer,
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            const route = '/projects/0/ir';

            // POST call
            await   model.save(IOHandlers.serverInjectRequest(server, route));

            // Check
            const results = await getTestIntermediateProjects();

            expect(results).to.be.an.array();
            expect(results.length).to.equal(1);

            const result = results[0];

            expect(result).to.be.an.object();
            expect(result).to.include(['projectId', 'modelId', 'model']);

            model.dispose();
            TF.engine().endScope();
        });

    });

    after( async () => {

        await deleteTestIntermediateResults();
    });
});




