'use strict';

// Load modules

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const IntermediateResultsPlugin = require('../../intermediate_results').plugin;
const Package = require('../../package.json');
const Hapi = require('@hapi/hapi');
const MongoClient = require('mongodb').MongoClient;
const Model = require('../mnist-test/model/model');
const ServerInjectRequest = require('../io-handler');
// Test shortcuts

const { experiment, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;

// MongoDB Utility
const url = 'mongodb://localhost:27017';

const getIntermediateResults = async function (projectId) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.log(err) );
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

        console.log(err);
    }
    finally {

        client.close();
    }

    return res;
};

const cleanIntermediateResultsDB = async function () {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.log(err) );

    if (!client) {
        return;
    }

    try {

        const db = client.db('mldev01');

        const collection = db.collection('intermediateResults');

        collection.remove();

    }
    catch (err) {

        console.log(err);
    }
    finally {

        client.close();
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

experiment('create Intermediate Results route', { timeout: 20000 }, () => {

    let server;
    const route = '/projects/0/ir';
    const projectId = '0';
    beforeEach( async () => {

        server = Hapi.server();
        await server.register({
            plugin: IntermediateResultsPlugin
        });

        await cleanIntermediateResultsDB();
    });

    it('adds the intermediate result into the MongoDB', async () => {

        // POST call
        console.log('before post');
        await Model.save(ServerInjectRequest(server, route));

        // Check
        const results = await getIntermediateResults(projectId);

        expect(results).to.be.an.array();
        expect(results.length).to.equal(1);

        const result = results[0];

        expect(result).to.be.an.object();
        expect(result).to.include(['projectId', 'resultId', 'result']);
    });
});

