'use strict';

const Axios = require('axios');
const FormData = require('form-data');
const Base64ArrayBuffer = require('base64-arraybuffer');

const ab2str = function (buf) {

    const str = Base64ArrayBuffer.encode(buf);
    return str;
};

const str2ab = function (str) {

    const buf = Base64ArrayBuffer.decode(str);
    return buf;

};

// TODO: The modelID isn't used in the load function because the task has the whole model id url
class IRRequest {
    constructor(path, modelId) {

        this.path = path;
        //TODO: Change to reduce results
        this.modelId = modelId;
    }

    async retrySave(url, form) {

        const headers = form.getHeaders();
        const payload = form.getBuffer();
        const httpRequestOptions = {
            method: 'POST',
            url,
            data: payload,
            headers
        };

        try {
            await Axios(httpRequestOptions);
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
                form.append('modelId', this.modelId);
                formCreated = true;



            }
            catch (e) {
                console.error('Error creating form (saving model): ' + e);
                console.error(e);
            }
        }

        let tries = 0;
        const maxTries = 2;
        let saved = await this.retrySave(this.path, form);
        while (!saved && tries < maxTries) {
            saved = await this.retrySave(this.path, form);
            ++tries;
        }
    }

    async tryToLoad() {

        let response;
        try {

            response = await Axios.get(this.path);
            const jsonBody = JSON.parse(response.data.model);
            const modelTopology = jsonBody[0];
            const weightData = str2ab(jsonBody[1]);
            const weightSpecs = jsonBody[2];

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

const irRequest = function (path, modelId) {

    return new IRRequest(path, modelId);
};

module.exports = irRequest;
