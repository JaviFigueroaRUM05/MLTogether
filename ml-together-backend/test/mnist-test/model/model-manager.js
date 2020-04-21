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
        this.currentModel = await TF.loadLayersModel(
            IRRequest(modelURL)
        );
        this.currentModel.compile({
            optimizer: this.optimizer,
            loss: 'categoricalCrossentropy'
        });

    }

}

module.exports = ModelManager;
