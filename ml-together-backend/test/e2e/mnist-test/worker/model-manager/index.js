'use strict';

const Axios = require('axios');

// TODO: Change for WebAPI
const TF = require('@tensorflow/tfjs-node');
const IRRequest = require('../../../../../lib/plugins/intermediate-results/tfjs-io-handler');

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
                IRRequest(url, modelId)
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

    async saveModel(modelId, modelURL) {

        const url = modelURL;
        await this.currentModel.save( IRRequest(url, modelId) );
    }

}

module.exports = ModelManager;
