'use strict';
/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

const Axios = require('axios');
const Model = require('./model/model');
const ModelManager = require('./model/model-manager');
const MapReduce = require('./map-reduce');
const Nes = require('nes');
const ProjectQueueManager = require('./queue-management');
const GoalTaskInfo = require('../../task/goal-task-info');
const TF = require('@tensorflow/tfjs-node');
const IRRequest = require('./io/io-handler');
const {cleanIntermediateResultsDB} = require('./mongodb');
const _ = require('lodash');
const TASK_QUEUE_NAME = 'task_queue';
const MAP_RESULTS_QUEUE_NAME = 'map_results_queue';
const REDUCE_RESULTS_QUEUE_NAME = 'reduce_results_queue';
const BATCH_SIZE = 100;
const BATCHES_PER_REDUCE = 10;
const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/' + PROJECT_ID + '/ir';

const getTask = async function (nesClient) {

    let encodedPayload = -1;
    try {
        encodedPayload = await nesClient.message(JSON.stringify({ event: 'next', projectId: PROJECT_ID }));
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


const completeTask = async function (task, modelManager) {

    let result = null;
    let lastOperation = null;
    if      (task.function === 'map')    {
        const response = await Axios
            .get(`http://localhost:3000/mnist/data?start=${task.dataStart}&end=${task.dataStart + BATCH_SIZE}`);

        const trainDataX = TF.tensor(response.data.images);
        const trainDataY = TF.tensor(response.data.labels);

        const modelId = 'NOT_USED';
        const modelURL = task.modelURL;
        await modelManager.updateAndCompileModel(modelId, modelURL);
        result = { result: MapReduce.mapFn(trainDataX, trainDataY, modelManager.currentModel) };
        console.log(result.result.grads['conv2d_Conv2D1/kernel'][0][2][0]);
        lastOperation = 'map';
    }
    else if (task.function === 'reduce') {
        const vectorToReduce = task.reduceData.map( (x) => JSON.parse(x).result);

        const modelId = 'NOT_USED';
        const modelURL = task.modelURL;
        await modelManager.updateAndCompileModel(modelId, modelURL);

        result = { result: MapReduce.reduceFn(vectorToReduce, modelManager.currentModel) };
        lastOperation = 'reduce';

        // TODO: See where to send results (if through the web socket or http api)
        await modelManager.currentModel.save( IRRequest(MODEL_HOST));
    }
    else if (task.function === 'nop')    {
        return null;
    }
    else                                   {
        console.error('Function: ' + task.function + ' is Invalid.'); process.exit(1);
    }

    return { event: 'result',
        projectId: PROJECT_ID,
        results: result,
        lastOperation,
        mapResultsId: task.mapResultsId };

};

const sendResults = async function (nesClient, results) {

    const resultsPayload = JSON.stringify(results);
    const resultsSentAnswer = await nesClient.message(resultsPayload);
    return resultsSentAnswer;
};

const runMLTogether = async function () {

    const nesClient = new Nes.Client('ws://localhost:3000');
    await nesClient.connect();

    const trainingDataLength = 1000;

    // Initialize Tasks
    const goalTaskInfo = new GoalTaskInfo(trainingDataLength, BATCH_SIZE, BATCHES_PER_REDUCE);

    await cleanIntermediateResultsDB();

    await ProjectQueueManager.purgeAllProjectQueues(PROJECT_ID,
        TASK_QUEUE_NAME,
        MAP_RESULTS_QUEUE_NAME,
        REDUCE_RESULTS_QUEUE_NAME,
        trainingDataLength / BATCH_SIZE / BATCHES_PER_REDUCE);

    await ProjectQueueManager.intializeGoalTasks(goalTaskInfo, TASK_QUEUE_NAME + '_' + PROJECT_ID);

    // Create initial model

    await Model.save(IRRequest(MODEL_HOST));

    const modelManager = new ModelManager(MODEL_HOST);

    // Work Loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const task = await getTask(nesClient);
        const taskResults = await completeTask(task, modelManager);

        if (taskResults === null) {
            break;
        }

        const resultsSentAnswer = await sendResults(nesClient, taskResults);
    }

    const response = await Axios.get(`http://localhost:3000/projects/${PROJECT_ID}/ir/1`);
    console.log(response.data);

    console.log('No more work!');
};

runMLTogether();
