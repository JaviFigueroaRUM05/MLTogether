'use strict';

const Axios = require('axios');
const FormData = require('form-data');
const StreamToPromise = require('stream-to-promise');
const Base64ArrayBuffer = require('base64-arraybuffer');
const ab2str = function (buf) {
    // var bufView = new Uint32Array(buf);
    const str = Base64ArrayBuffer.encode(buf)
    // const str = bufView.reduce((acc, i) => acc += String.fromCharCode.apply(null, [i]), '');
    return str;
};

const str2ab = function (str) {
    //var buf = Uint16Array.from([...str].map(ch => ch.charCodeAt())).buffer; // 2 bytes for each char
    // console.log(str.charCodeAt(0))
    // var buf = new ArrayBuffer(str.length*4); // 2 bytes for each char
    // var bufView = new Uint32Array(buf);
    // for (var i = 0, strLen = str.length; i < strLen; i++) {
    //     bufView[i] = str.charCodeAt(i);
    // }

    let buf = Base64ArrayBuffer.decode(str);

    return buf;

    return buf;
};

class IRRequest {
    constructor(path, mapResultsId) {

        this.path = path;
        //TODO: Change to reduce results
        this.mapResultsId = mapResultsId;
    }

    async retrySave(url, form) {

        const headers = form.getHeaders();
        const payload = await StreamToPromise(form);
        const httpRequestOptions = {
            method: 'POST',
            url,
            data: payload,
            headers
        };

        try {
            await Axios(httpRequestOptions);
            console.log('Model has been saved!');
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
                form.append('modelId', 1);
                formCreated = true;
                console.log('finished creating form');



            }
            catch (e) {
                console.error('Error creating form (saving model): ' + e);
                console.error(e);
            }
        }

        let saved = await this.retrySave(this.path, form);
        while (!saved) {
            saved = await this.retrySave(this.path, form);
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
        let model = await this.tryToLoad();
        while (!model) {
            model = await this.tryToLoad();
        }

        return model;
    }
}

const irRequest = function (path) {

    return new IRRequest(path);
};

module.exports = irRequest;
