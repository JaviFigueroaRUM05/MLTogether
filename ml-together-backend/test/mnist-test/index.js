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
const QueueManager = require('./tasks-initializer');

const run = async function (epochs, batchSize, modelSavePath) {

    await Data.loadData();

    const { images: trainImages, labels: trainLabels } = Data.getTrainData();
    Model.summary();

    let epochBeginTime;
    let millisPerStep;
    const validationSplit = 0.15;
    const numTrainExamplesPerEpoch =
      trainImages.shape[0] * (1 - validationSplit);
    const numTrainBatchesPerEpoch =
      Math.ceil(numTrainExamplesPerEpoch / batchSize);
    await Model.fit(trainImages, trainLabels, {
        epochs,
        batchSize,
        validationSplit
    });

    const { images: testImages, labels: testLabels } = Data.getTestData();
    const evalOutput = Model.evaluate(testImages, testLabels);

    console.log(
        `\nEvaluation result:\n` +
      `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
      `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`);

    if (modelSavePath !== null) {
        await Model.save(`file://${modelSavePath}`);
        console.log(`Saved model to path: ${modelSavePath}`);
    }
};

const runMapReduce = async function (modelSavePath) {

    await Data.loadData();
    console.log(Data.trainSize);
    const batchSize = 100;
    //const numberOfBatches = Data.trainSize/batchSize;
    const numberOfBatches = 5;
    const vectors = [];
    for (let i = 0; i < numberOfBatches; ++i) {

        const { images: trainDataX, labels: trainDataY } = Data.getTrainData(batchSize, i);
        const vectorToReduce = MapReduce.mapFn(trainDataX, trainDataY, Model);
        trainDataX.dispose();
        trainDataY.dispose();
        vectors.push(vectorToReduce);
    }

    MapReduce.reduceFn(vectors,Model);

    console.log(vectors);

    // // Test
    const { images: testImages, labels: testLabels } = Data.getTestData();
    const evalOutput = Model.evaluate(testImages, testLabels);

    console.log(
        `\nEvaluation result:\n` +
      `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
      `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`);

    if (modelSavePath !== null) {
        await Model.save(`file://${modelSavePath}`);
        console.log(`Saved model to path: ${modelSavePath}`);
    }
};

const runMLTogether = async function () {

    const batchSize = 100;
    const client = new Nes.Client('ws://localhost:3000');
    await client.connect();
    await Data.loadData();
    console.log(Data.trainSize);
    // Initialize Tasks
    await QueueManager.purgeQueue('task_queue_project_1');
    await QueueManager.initializeTaskQueue('task_queue_project_1');
    await QueueManager.purgeQueue('results_queue_project_1');


    for (let i = 0; i < 4; ++i) {
        const mapResultsQueueName = 'map_results_queue_project_' + 1 + '_' + (i + 1);
        await QueueManager.purgeQueue(mapResultsQueueName);
    }
    // Work Loop

    while (true) {
        let encodedPayload = null;
        try {
            encodedPayload = await client.message(JSON.stringify({ event: 'next', projectId: '1' }));
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
            const { images: trainDataX, labels: trainDataY } = Data.getTrainData(batchSize, payload.dataStart);
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


        const resultsSentAnswer = await client
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
