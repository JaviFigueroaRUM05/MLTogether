'use strict';

// Load modules

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const IntermediateResultsPlugin = require('../../intermediate_results').plugin;
const Package = require('../../package.json');
const Hapi = require('@hapi/hapi');
const MongoClient = require('mongodb').MongoClient;
const MLModel = require('../mnist-test/model/model');

const IOHandlers = require('./utils/io-handlers');
// Test shortcuts

const { experiment, it, beforeEach, after } = exports.lab = Lab.script();
const { expect } = Code;

const TF = require('@tensorflow/tfjs-node');


const FormData = require('form-data');
const StreamToPromise = require('stream-to-promise');

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

        const db = client.db('mldev01');

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

        const db = client.db('mldev01');

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

        const db = client.db('mldev01');

        const collection = db.collection('intermediateResults');

        await collection.deleteMany();

    }
    catch (err) {

        console.error(res);
    }

};

experiment('Deployment', () => {

    let server;
    beforeEach( async () => {

        server = Hapi.server();
        await server.register({
            plugin: IntermediateResultsPlugin
        });
    });

    it('registers the IntermediateResults plugin.', () => {



        expect(server.registrations[IntermediateResultsPlugin.name]).to.exist();
    });


});

experiment('POST intermediate results route', { timeout: 20000 }, () => {

    let server;
    beforeEach( async () => {

        server = Hapi.server();
        await server.register({
            plugin: IntermediateResultsPlugin
        });

        await cleanIntermediateResultsDB();
    });

    it('saves data into MongoDB', async () => {

        const route = '/projects/0/ir';

        const form = new FormData();
        const fakeResult = 'fhaiufhiucguydgvjwhvfsfyusa';
        const modelId = '0';
        form.append('modelId', modelId);
        form.append('model', fakeResult);

        const headers = form.getHeaders();
        const payload = await StreamToPromise(form);
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

        const route = '/projects/0/ir';

        // POST call
        await MLModel.save(IOHandlers.serverInjectRequest(server, route));

        // Check
        const results = await getIntermediateResults(projectId);

        expect(results).to.be.an.array();
        expect(results.length).to.equal(1);

        const result = results[0];

        expect(result).to.be.an.object();
        expect(result).to.include(['projectId', 'modelId', 'model']);
    });

    after( async () => {

        await cleanIntermediateResultsDB();
    });

});

experiment('GET specific intermediate result route', { timeout: 20000 }, () => {

    let server;
    beforeEach( async () => {

        server = Hapi.server();
        await server.register({
            plugin: IntermediateResultsPlugin
        });

        await cleanIntermediateResultsDB();
    });

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

        const route = '/projects/0/ir/0';

        await MLModel.save(IOHandlers.mongoDBRequest('mongodb://localhost:27017'));
        const responseModel = await TF.loadLayersModel(
            IOHandlers.serverInjectRequest(server,route)
        );

        const optimizer = 'rmsprop';
        responseModel.compile({
            optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        expect(responseModel).to.be.an.object();
        expect(responseModel).to.have.length(Object.keys(MLModel).length);
        console.log(Object.keys(MLModel));
        console.log(Object.keys(responseModel));



    });

    after( async () => {

        await cleanIntermediateResultsDB();
    });
});

