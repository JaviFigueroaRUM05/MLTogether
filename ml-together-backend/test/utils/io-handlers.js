'use strict';

const Axios = require('axios');
const FormData = require('form-data');
const MongoClient = require('mongodb').MongoClient;

const Base64ArrayBuffer = require('base64-arraybuffer');

const ab2str = function (buf) {

    const str = Base64ArrayBuffer.encode(buf);
    return str;
};

const str2ab = function (str) {

    const buf = Base64ArrayBuffer.decode(str);
    return buf;

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

            const db = client.db('mltest');

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

        let tries = 0;
        const maxTries = 2;
        let saved = await this.retrySave(form);
        while (!saved && tries < maxTries) {
            saved = await this.retrySave(form);
            ++tries;
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
        const payload = form.getBuffer();
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

        let tries = 0;
        const maxTries = 2;
        let model = await this.tryToLoad();
        while (!model && tries < maxTries) {
            model = await this.tryToLoad();
            ++tries;
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
