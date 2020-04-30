'use strict';

const AMQPInitializer = require('../amqp-initializer');

const addMapTasks = function (trainingSetSize, batchSize, taskQueueName, channel, batchesPerReduce, modelURLRoot) {

    // TODO: Make sure this returns the ceil amount
    console.log(trainingSetSize / batchSize)
    const numberOfMapTasks = trainingSetSize / batchSize;
    let mapResultsId = 1;

    for (let i = 0; i < numberOfMapTasks; ++i) {
        const dataStart = i * batchSize;
        const dataEnd = (i + 1) * batchSize;
        const modelURL = modelURLRoot + '/' + 1;
        addMapTaskToQueue(mapResultsId, taskQueueName, channel, dataStart, dataEnd, modelURL);
        if (isMapResultQueueFull(i, batchesPerReduce)) {
            ++mapResultsId;
        }
    }
};


const addReduceTasks = function (trainingSetSize, batchSize, batchesPerReduce, channel, taskQueueName, modelURLRoot) {

    for (let i = 0; i < (trainingSetSize / batchSize / batchesPerReduce); ++i) {
        const mapResultsId = i + 1;
        const modelURL = modelURLRoot + '/' + mapResultsId;
        const modelStoringURL = modelURLRoot;
        const modelStoringId = mapResultsId + 1;
        const reduceTask = JSON.stringify({ function: 'reduce', mapResultsId, modelURL, modelStoringURL, modelStoringId });
        console.log(reduceTask);
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
    console.log(mapTask);

    const mapTaskStringified = JSON.stringify(mapTask);
    amqpChannel.sendToQueue(queueName, Buffer.from(mapTaskStringified), {
        persistent: true
    });
};

const isMapResultQueueFull = function (currentBatchIndex, batchesPerReduce) {

    return ((currentBatchIndex + 1) % batchesPerReduce === 0);
};

const initializeTaskQueue = async function (trainingSetSize, batchSize, batchesPerReduce, taskQueueName, modelURLRoot) {

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

    addMapTasks(trainingSetSize, batchSize, taskQueueName, channel, batchesPerReduce, modelURLRoot);

    addReduceTasks(trainingSetSize, batchSize, batchesPerReduce, channel, taskQueueName,modelURLRoot);

};

module.exports = { initializeTaskQueue };


