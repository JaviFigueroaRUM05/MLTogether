'use strict';

const AMQPInitializer = require('../../../task/amqp-initializer');

const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/' + PROJECT_ID + '/ir';

const addMapTasks = function (trainingSetSize, batchSize, taskQueueName, channel, batchesPerReduce, modelRootURL) {

    // TODO: Make sure this returns the ceil amount
    const numberOfMapTasks = trainingSetSize / batchSize;
    let mapResultsId = 1;

    for (let i = 0; i < numberOfMapTasks; ++i) {
        const dataStart = i * batchSize;
        const dataEnd = (i + 1) * batchSize;
        const modelURL = modelRootURL + '/' + mapResultsId;
        addMapTaskToQueue(mapResultsId, taskQueueName, channel, dataStart, dataEnd, modelURL);
        if (isMapResultQueueFull(i, batchesPerReduce)) {
            ++mapResultsId;
        }
    }
};


const addReduceTasks = function (trainingSetSize, batchSize, batchesPerReduce, channel, taskQueueName, modelRootURL) {

    for (let i = 0; i < (trainingSetSize / batchSize / batchesPerReduce); ++i) {
        const mapResultsId = i + 1;
        const modelURL = modelRootURL + '/' + mapResultsId;
        const modelStoringURL = modelRootURL + '/' + (mapResultsId + 1);
        const reduceTask = JSON.stringify({ function: 'reduce', mapResultsId, modelURL, modelStoringURL });
        channel.sendToQueue(taskQueueName, Buffer.from(reduceTask));
    }
};

// Data Start is inclusive
// Data end is exclusive
const addMapTaskToQueue = function (mapResultsId, queueName, amqpChannel, dataStart, dataEnd, modelURL) {

    const mapTask = {
        function: 'map',
        dataStart,
        dataEnd,
        mapResultsId,
        modelURL
    };

    const mapTaskStringified = JSON.stringify(mapTask);
    amqpChannel.sendToQueue(queueName, Buffer.from(mapTaskStringified), {
        persistent: true
    });
};

const isMapResultQueueFull = function (currentBatchIndex, batchesPerReduce) {

    return ((currentBatchIndex + 1) % batchesPerReduce === 0);
};

const initializeTaskQueue = async function (trainingSetSize, batchSize, batchesPerReduce, taskQueueName) {

    let channel = null;
    try {
        channel = await AMQPInitializer.initialize('amqp://localhost');
    }
    catch (err) {
        console.error(err);
        throw err;
    }

    channel.assertQueue(taskQueueName, {
        durable: true
    });

    const modelURLRoot = MODEL_HOST
    addMapTasks(trainingSetSize, batchSize, taskQueueName, channel, batchesPerReduce, modelURLRoot);

    addReduceTasks(trainingSetSize, batchSize, batchesPerReduce, channel, taskQueueName,modelURLRoot);

};

module.exports = { initializeTaskQueue };


