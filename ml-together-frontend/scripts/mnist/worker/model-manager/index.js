'use strict';

// TODO: Change for WebAPI
import * as TF from '@tensorflow/tfjs';
import {irRequest} from './ir-request'; 

export class ModelManager {
    constructor(host) {

        this.currentModelId = -1;
        this.currentModel = null;
    }

    // TODO: Check modelId before updating
    async updateAndCompileModel(modelId, modelURL) {

        const url = modelURL;
        if (this.currentModelId === modelId) {
            return;
        }

        try {
            this.currentModel = await TF.loadLayersModel(
                irRequest(url, modelId)
            );
            await this.currentModel.compile({
                optimizer: 'rmsprop',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
            this.currentModelId = modelId;

        }
        catch (err) {
            console.error(err);
        }

    }

    async saveModel(modelId, modelURL) {

        const url = modelURL;
        await this.currentModel.save( irRequest(url, modelId) );
    }

}

