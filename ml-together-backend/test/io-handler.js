'use strict';

const Axios = require('axios');
const FormData = require('form-data');
const StreamToPromise = require('stream-to-promise');

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

    const buf = new ArrayBuffer(str.length * 4); // 2 bytes for each char
    const bufView = new Uint32Array(buf);
    const strLen = str.length;
    for (let i = 0; i < strLen; ++i) {
        bufView[i] = str.charCodeAt(i);
    }

    return buf;
};

class ServerInjectRequest {
    constructor(server, path) {

        this.server = server;
        this.path = path;
    }

    async retrySave(form) {

        const headers = form.getHeaders();
        const payload = await StreamToPromise(form);
        try {
            const res = await this.server.inject({
                method: 'POST',
                url: this.path,
                headers,
                payload
            });
            console.log('DONE!');
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
                form.append('result', result);
                form.append('resultId', 1);
                formCreated = true;
                console.log('finished creating form');



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

            response = await Axios.get(this.path);
            const jsonBody = JSON.parse(response.data);
            const modelTopology = jsonBody[0];
            const weightData = str2ab(jsonBody[1]);
            const weightSpecs = jsonBody[2];
            return { modelTopology, weightSpecs, weightData };
        }
        catch (err) {

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

module.exports = serverInjectRequest;
