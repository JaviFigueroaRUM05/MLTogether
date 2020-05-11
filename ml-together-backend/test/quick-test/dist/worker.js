'use strict';


import * as Axios from 'axios';
import * as TF from '@tensorflow/tfjs';
import {Client} from '@hapi/nes/lib/client'
import * as Base64ArrayBuffer from 'base64-arraybuffer';

const DATA_HOST = 'http://localhost:3000/mnist/data';
const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/mnist121/ir';
const MLTOGETHER_HOST = 'localhost:3000'

const mapFn = async function (data, model) {
    
    const TENSOR_NAME_PATTERN = /_[0-9]*$/i;

    const getPredictedLabels = function (x, model) {

        return TF.tidy(() => {

            return model.predictOnBatch(x);
        });
    };

    const getGradientsAndSaveActions = function (x, y, model) {

        const f = () => {

            return TF.tidy(() => {

                const labels = getPredictedLabels(x, model);
                return TF.losses.softmaxCrossEntropy(y, labels).asScalar();
            });
        };

        const results = TF.variableGrads(f);
        return results;

    };



    const trainDataX = TF.tensor(data.images);
    const trainDataY = TF.tensor(data.labels);

    // get the gradients
    const { value, grads } = getGradientsAndSaveActions(trainDataX, trainDataY, model);

    // change tensor names and add them into a new object with different names
    const tensorNames = Object.keys(grads);
    const jsonGradients = {};

    tensorNames.forEach((tensorName) => {

        let newTensorName = tensorName;
        // Actualizamos el nombre del tensor para evitar problemas del nombre autogenerado por TF
        const matched = tensorName.match(TENSOR_NAME_PATTERN);
        if (matched) {
            newTensorName = tensorName.substring(0, tensorName.indexOf(matched));
        }

        jsonGradients[newTensorName] = grads[tensorName].arraySync();
    });

    tensorNames.forEach( (tensorName) => grads[tensorName].dispose() );
    trainDataX.dispose();
    trainDataY.dispose();
    return { value, grads: jsonGradients };


}
const reduceFn = async function (data, model) {
    

    const vectorToReduce = data.map( (x) => JSON.parse(x).result);

    // TODO: check if vectorToReduce is valid
    // update model

    // compile model

    TF.tidy( () => {

        const tensors = {};
        const tensorNames = Object.keys(vectorToReduce[0].grads);
        tensorNames.forEach( (tensorName) => {

            for (let i = 0; i < vectorToReduce.length; ++i) {

                if (i === 0) {
                    tensors[tensorName] = [];
                }

                tensors[tensorName].push(TF.tensor(vectorToReduce[i].grads[tensorName]));
            }

            tensors[tensorName] = TF.addN(tensors[tensorName]);
        });
        model.optimizer.applyGradients(tensors);

        // TODO: Return Model
    });


}

'use strict';


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
        const payload = form;
        const httpRequestOptions = {
            method: 'POST',
            url,
            data: payload,
            headers: {'Content-Type': 'multipart/form-data' }

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
                form.append('modelId', this.modelId);
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
        console.log('here');
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

function irRequest(path, modelId) {

    return new IRRequest(path, modelId);
};




class ModelManager {
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




const getTask = async function (projectId, nesClient) {

    let res = -1;
    try {
        res = await nesClient.message(JSON.stringify({ event: 'next', projectId }));
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }

    if (res === null) {
        return null;
    }

    return res.payload;

};

const completeTask = async function (task, modelManager, projectId) {

    let result = null;
    let lastOperation = null;
    if      (task.function === 'map')    {
        const response = await Axios
            .get(`${DATA_HOST}?start=${task.dataStart}&end=${task.dataEnd}`);

        const modelId = task.modelId;
        const modelURL = task.modelURL;
        await modelManager.updateAndCompileModel(modelId, modelURL);
        result = { result: await mapFn(response.data, modelManager.currentModel) };
        lastOperation = 'map';
    }
    else if (task.function === 'reduce') {
        const modelId = task.modelId;
        const modelURL = task.modelURL;
        await modelManager.updateAndCompileModel(modelId, modelURL);

        result = { result: await reduceFn(task.reduceData, modelManager.currentModel) };
        lastOperation = 'reduce';

        const modelStoringURL = task.modelStoringURL;
        const modelStoringId = task.modelStoringId;
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


const sendResults = async function (nesClient, results) {

    const resultsPayload = JSON.stringify(results);
    const resultsSentAnswer = await nesClient.message(resultsPayload);
    return resultsSentAnswer;
};


const runWorker = async function (projectId, modelHost) {

    const nesClient = new Client(`ws://${MLTOGETHER_HOST}`);
    await nesClient.connect();
    const modelManager = new ModelManager(modelHost);


    // Work Loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const task = await getTask(projectId, nesClient);
        const taskResults = await completeTask(task, modelManager, projectId);

        if (taskResults === null) {
            break;
        }

        const resultsSentAnswer = await sendResults(nesClient, taskResults);
    }

    console.log('No more work!');
};

runWorker(PROJECT_ID,MODEL_HOST);