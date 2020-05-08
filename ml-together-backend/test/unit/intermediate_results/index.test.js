'use strict';

// Load modules
// TODO: make the server creation part cleaner
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const IntermediateResultsPlugin = require('../../../lib/plugins/intermediate-results').plugin;
const Hapi = require('@hapi/hapi');
const Mongo = require('hapi-mongodb');
const MongoClient = require('mongodb').MongoClient;
// const MNISTModel = require('./model');

const IOHandlers = require('./utils/io-handlers');
// Test shortcuts

const { experiment, it, beforeEach, after } = exports.lab = Lab.script();
const { expect } = Code;

const TF = require('@tensorflow/tfjs-node');


const FormData = require('form-data');

const projectId = '0';


// MongoDB Utility
const url = 'mongodb://localhost:27017';

const getIntermediateResults = async function (projectId) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );
    let res = null;
    if (!client) {
        return;
    }

    try {

        const db = client.db('mltest');

        const collection = db.collection('intermediateResults');
        res = await collection.find().toArray();

    }
    catch (err) {

        console.error(err);
    }
    finally {

        client.close();
    }

    return res;
};

const storeIntermediateResults = async function (results) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );
    let res = null;
    if (!client) {
        return;
    }

    try {

        // TODO: take this from a manifest or from env
        const db = client.db('mltest');

        const collection = db.collection('intermediateResults');
        res = await collection.insertOne(results);

    }
    catch (err) {

        console.error(err);
    }
    finally {

        client.close();
    }

    return res;
};

const cleanIntermediateResultsDB = async function () {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );

    if (!client) {
        return;
    }

    try {

        const db = client.db('mltest');

        const collection = db.collection('intermediateResults');

        await collection.deleteMany();

    }
    catch (err) {

        console.error(err);
    }

};

experiment('Deployment', () => {

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

    });

    it('registers the IntermediateResults plugin.', () => {



        expect(server.registrations[IntermediateResultsPlugin.name]).to.exist();
    });


});

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

        await cleanIntermediateResultsDB();
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

            const results = await getIntermediateResults(projectId);

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
            const results = await getIntermediateResults(projectId);

            expect(results).to.be.an.array();
            expect(results.length).to.equal(1);

            const result = results[0];

            expect(result).to.be.an.object();
            expect(result).to.include(['projectId', 'modelId', 'model']);

            model.dispose();
            TF.engine().endScope();
        });

    });

    experiment('GET specific intermediate result route', { timeout: 20000 }, () => {

        it('gets the intermediate result from MongoDB', async () => {

            const route = '/projects/0/ir/0';
            const modelId = '0';
            const fakeResult = 'fhaiufhiucguydgvjwhvfsfyusa';

            const storedObject  = { projectId, modelId, model: fakeResult  };
            await storeIntermediateResults(storedObject);

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

        await cleanIntermediateResultsDB();
    });
});




