'use strict';

// Load modules
// TODO: make the server creation part cleaner
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const IntermediateResultsPlugin = require('../../../../lib/plugins/intermediate-results').plugin;
const Hapi = require('@hapi/hapi');
const Mongo = require('hapi-mongodb');
const TF = require('@tensorflow/tfjs-node');

const IOHandlers = require('../../../utils/io-handlers');
const { deleteTestIntermediateResults,storeTestIntermediateResult  } = require('../../../utils/mongodb-manager');
// Test shortcuts

const { experiment, it, beforeEach, after } = exports.lab = Lab.script();
const { expect } = Code;

const projectId = '0';


experiment('Get specific intermediate result', () => {

    let server;
    beforeEach( async () => {


        // TODO: Change url to be taken by env
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

    experiment('GET specific intermediate result route', { timeout: 20000 }, () => {

        it('gets the intermediate result from MongoDB', async () => {

            const route = '/projects/0/ir/0';
            const modelId = '0';
            const fakeResult = 'fhaiufhiucguydgvjwhvfsfyusa';

            const storedObject  = { projectId, modelId, model: fakeResult  };
            await storeTestIntermediateResult(storedObject);

            const result = await server.inject({
                method: 'GET',
                url: route
            });

            expect(result).to.be.an.object();

            const parsedPayload = JSON.parse(result.payload);

            expect(parsedPayload).to.be.an.object();
            expect(parsedPayload).to.include(['projectId', 'modelId', 'model']);

            expect(parsedPayload.projectId).to.equal(projectId);
            expect(parsedPayload.modelId).to.equal(modelId);
            expect(parsedPayload.model).to.equal(fakeResult);



        });

        it('TensorFlow.js load using route get model', async () => {

            TF.engine().startScope();
            const route = '/projects/0/ir/0';

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

            await model.save(IOHandlers.mongoDBRequest('mongodb://localhost:27017'));
            const responseModel = await TF.loadLayersModel(
                IOHandlers.serverInjectRequest(server,route)
            );

            responseModel.compile({
                optimizer,
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            expect(responseModel).to.be.an.object();
            expect(responseModel).to.have.length(Object.keys(model).length);
            responseModel.dispose();
            model.dispose();
            TF.engine().endScope();



        });


    });
    after( async () => {

        await deleteTestIntermediateResults();
    });
});




