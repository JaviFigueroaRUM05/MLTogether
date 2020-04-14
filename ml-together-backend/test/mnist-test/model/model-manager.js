'use strict';

const Axios = require('axios');

// TODO: Change for WebAPI
const TF = require('@tensorflow/tfjs-node');

class ModelManager {
    constructor(host) {

        this.host = host;
        this.currentModelId = -1;
        this.currentModel = null;
    }

    async updateAndCompileModel(modelId) {

        if (modelId !== this.currentModelId) {
            const url = this.host + '' + modelId;
            const serverResponse = await Axios.get(url);
            this.currentModel = await TF.loadLayersModel(serverResponse.data);
            this.currentModel.compile({
                optimizer: this.optimizer,
                loss: 'categoricalCrossentropy'
            });

        }
    }

}

module.exports = ModelManager;
