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

const ArgParse = require('argparse');
const Data = require('./data');
const Model = require('./model');
const MapReduce = require('./map-reduce');
const Nes = require('nes');
const ProjectQueueManager = require('./queue-management');
const GoalTaskInfo = require('../../task/goal-task-info');

const TASK_QUEUE_NAME = 'task_queue';
const MAP_RESULTS_QUEUE_NAME = 'map_results';
const REDUCE_RESULTS_QUEUE_NAME = 'queue_results';
const BATCH_SIZE = 100;
const BATCHES_PER_REDUCE = 100;
const PROJECT_ID = 'mnist121';
const runMLTogether = async function () {

    const nesClient = new Nes.Client('ws://localhost:3000');
    await nesClient.connect();
    await Data.loadData();

    // Initialize Tasks
    const goalTaskInfo = new GoalTaskInfo(Data.trainSize, BATCH_SIZE, BATCHES_PER_REDUCE);
    await ProjectQueueManager.purgeAllProjectQueues(PROJECT_ID, TASK_QUEUE_NAME, MAP_RESULTS_QUEUE_NAME, REDUCE_RESULTS_QUEUE_NAME);
    await ProjectQueueManager.intializeGoalTasks(goalTaskInfo, TASK_QUEUE_NAME);

    // Work Loop
    while (true) {
        let encodedPayload = null;
        try {
            encodedPayload = await nesClient.message(JSON.stringify({ event: 'next', projectId: '1' }));
        }
        catch (err) {
            console.error(err);
            process.exit(1);
        }

        console.log('Working');
        console.log(encodedPayload);
        const payload = JSON.parse(encodedPayload.payload);
        let result = null;
        let lastOperation = null;
        if      (payload.function === 'map')    {
            const { images: trainDataX, labels: trainDataY } = Data.getTrainData(BATCH_SIZE, payload.dataStart);
            result = { result: MapReduce.mapFn(trainDataX, trainDataY, Model) };
            lastOperation = 'map';
        }
        else if (payload.function === 'reduce') {
            //result = { result: MapReduce.reduceFn(payload.data) };
            console.log('NEED TO IMPLEMENT REDUCE');
            result = 'reduce';
            lastOperation = 'reduce';
        }
        else if (payload.function === 'nop')    {
            break;
        }
        else                                   {
            console.log('Function: ' + payload.function + ' is Invalid.'); process.exit(1);
        }

        const resultsPayload = JSON
            .stringify({ event: 'result', projectId: '1', results: result, lastOperation, mapResultsId: payload.mapResultsId });


        const resultsSentAnswer = await nesClient
            .message(resultsPayload);
        console.log(resultsSentAnswer);
    }

    console.log('No more work!');
};

const parser = new ArgParse.ArgumentParser({
    description: 'TensorFlow.js-Node MNIST Example.',
    addHelp: true
});
parser.addArgument('--epochs', {
    type: 'int',
    defaultValue: 20,
    help: 'Number of epochs to train the model for.'
});
parser.addArgument('--batch_size', {
    type: 'int',
    defaultValue: 128,
    help: 'Batch size to be used during model training.'
});
parser.addArgument('--model_save_path', {
    type: 'string',
    help: 'Path to which the model will be saved after training.'
});
const args = parser.parseArgs();

//run(args.epochs, args.batch_size, args.model_save_path);
//runMapReduce(args.model_save_path);
runMLTogether();
