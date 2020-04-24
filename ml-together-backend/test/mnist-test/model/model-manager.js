'use strict';

const Axios = require('axios');

// TODO: Change for WebAPI
const TF = require('@tensorflow/tfjs-node');
const IRRequest = require('../io/io-handler');

class ModelManager {
    constructor(host) {

        this.currentModelId = -1;
        this.currentModel = null;
    }

    // TODO: Check modelId before updating
    async updateAndCompileModel(modelId, modelURL) {

        const url = modelURL;
        try {
            this.currentModel = await TF.loadLayersModel(
                IRRequest(url)
            );
            await this.currentModel.compile({
                optimizer: 'rmsprop',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
        }
        catch (err) {
            console.error(err);
        }

    }

}

module.exports = ModelManager;
