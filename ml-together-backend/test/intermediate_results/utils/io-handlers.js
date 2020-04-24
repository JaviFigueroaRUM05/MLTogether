'use strict';

const Axios = require('axios');
const FormData = require('form-data');
const StreamToPromise = require('stream-to-promise');
const MongoClient = require('mongodb').MongoClient;

const ab2str = function (buffer) {

    var bufView = new Uint16Array(buffer);
    var length = bufView.length;
    var result = '';
    var addition = Math.pow(2,16) - 1;

    for (let i = 0; i < length; i += addition) {

        if (i + addition > length) {
            addition = length - i;
        }

        result += String.fromCharCode.apply(null, bufView.subarray(i,i + addition));
    }

    return result;

};

const str2ab = function (str) {

    var buff = new ArrayBuffer(str.length * 2);
    var view = new Uint16Array(buff);
    for ( var i = 0, l = str.length; i < l; i++) {
        view[i] = str.charCodeAt(i);
    }

    return buff;
};

class MongoDBRequest {
    constructor(path) {

        this.path = path;
    }

    async retrySave(form) {

        const client = await MongoClient.connect(this.path, { useNewUrlParser: true })
            .catch( (err) =>  console.error(err) );

        if (!client) {
            return;
        }

        try {

            const db = client.db('mldev01');

            const collection = db.collection('intermediateResults');
            await collection.insertOne(form);

        }
        catch (err) {

            console.error(err);
            return false;
        }
        finally {

            client.close();
        }

        return true;

    }

    async save(modelArtifacts) {

        let model;
        let form;
        let weightDataAb2;
        let formCreated = false;
        while (!formCreated) {
            try {
                weightDataAb2 = ab2str(modelArtifacts.weightData);
                model = JSON.stringify([modelArtifacts.modelTopology, weightDataAb2, modelArtifacts.weightSpecs]);
                form = { model, modelId: '0', projectId: '0' };
                formCreated = true;



            }
            catch (e) {
                console.error('Error creating form (saving model): ' + e);
                console.error(e);
            }
        }

        let saved = await this.retrySave(form);
        while (!saved) {
            saved = await this.retrySave(form);
        }
    }

    tryToLoad() {

        throw new Error('not implemented');

    }


    load() {

        throw new Error('not implemented');
    }
}

class ServerInjectRequest {
    constructor(server, path) {

        this.server = server;
        this.path = path;
    }

    async retrySave(form) {

        const headers = form.getHeaders();
        const payload = await StreamToPromise(form);
        try {
            await this.server.inject({
                method: 'POST',
                url: this.path,
                headers,
                payload
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        return true;

    }

    async save(modelArtifacts) {

        let result;
        let form;
        let weightDataAb2;
        let formCreated = false;
        while (!formCreated) {
            try {
                weightDataAb2 = ab2str(modelArtifacts.weightData);
                result = JSON.stringify([modelArtifacts.modelTopology, weightDataAb2, modelArtifacts.weightSpecs]);
                form = new FormData();
                form.append('model', result);
                form.append('modelId', '0');
                formCreated = true;



            }
            catch (e) {
                console.error('Error creating form (saving model): ' + e);
                console.error(e);
            }
        }

        let saved = await this.retrySave(form);
        while (!saved) {
            saved = await this.retrySave(form);
        }
    }

    async tryToLoad() {

        let response;
        try {
            response = await this.server.inject({
                method: 'GET',
                url: this.path
            });

            const jsonBody = JSON.parse(response.payload).model;
            const modelInfoParsed = JSON.parse(jsonBody);
            const modelTopology = modelInfoParsed[0];
            const weightData = str2ab(modelInfoParsed[1]);
            const weightSpecs = modelInfoParsed[2];
            return { modelTopology, weightSpecs, weightData };
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }


    async load() {

        let model = await this.tryToLoad();
        while (!model) {
            model = await this.tryToLoad();
        }

        return model;
    }
}

const serverInjectRequest = function (server, path) {

    return new ServerInjectRequest(server,path);
};

const mongoDBRequest = function (path) {

    return new MongoDBRequest(path);
};

module.exports = { serverInjectRequest, mongoDBRequest };
