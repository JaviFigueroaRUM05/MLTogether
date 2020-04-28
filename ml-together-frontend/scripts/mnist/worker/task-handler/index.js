'use strict';


import * as Axios from 'axios';
import * as TF from '@tensorflow/tfjs';
import * as MapReduce from './map-reduce/index';

const getTask = async function (projectId, nesClient) {

    let encodedPayload = -1;
    try {
        encodedPayload = await nesClient.message(JSON.stringify({ event: 'next', projectId }));
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }

    if (encodedPayload === null) {
        return null;
    }

    return JSON.parse(encodedPayload.payload);

};

const completeTask = async function (task, modelManager, projectId) {

    let result = null;
    let lastOperation = null;
    if      (task.function === 'map')    {
        const response = await Axios
            .get(`http://mltogether:3000/mnist/data?start=${task.dataStart}&end=${task.dataEnd}`);

        const trainDataX = TF.tensor(response.data.images);
        const trainDataY = TF.tensor(response.data.labels);

        const modelId = '1';
        const modelURL = task.modelURL;
        await modelManager.updateAndCompileModel(modelId, modelURL);
        result = { result: MapReduce.mapFn(trainDataX, trainDataY, modelManager.currentModel) };
        lastOperation = 'map';

        trainDataX.dispose();
        trainDataY.dispose();
    }
    else if (task.function === 'reduce') {
        const vectorToReduce = task.reduceData.map( (x) => JSON.parse(x).result);

        const modelId = '1';
        const modelURL = task.modelURL;
        await modelManager.updateAndCompileModel(modelId, modelURL);

        result = { result: MapReduce.reduceFn(vectorToReduce, modelManager.currentModel) };
        lastOperation = 'reduce';

        const modelStoringURL = task.modelStoringURL;
        const modelStoringId = task.modelStoringId;
        // TODO: See where to send results (if through the web socket or http api)
        await modelManager.saveModel(modelStoringId, modelStoringURL);
    }
    else if (task.function === 'nop')    {
        return null;
    }
    else                                   {
        console.error('Function: ' + task.function + ' is Invalid.'); process.exit(1);
    }

    return { event: 'result',
        projectId,
        results: result,
        lastOperation,
        mapResultsId: task.mapResultsId };

};

export { getTask ,completeTask };
