'use strict';

const AMQPInitializer = require('../../../task/amqp-initializer');

const addMapTasks = function (trainingSetSize, batchSize, taskQueueName, channel, batchesPerReduce) {

    // TODO: Make sure this returns the ceil amount
    const numberOfMapTasks = trainingSetSize / batchSize;
    let mapResultsId = 1;

    for (let i = 0; i < numberOfMapTasks; ++i) {
        const dataStart = i * batchSize;
        const dataEnd = (i + 1) * batchSize;
        addMapTaskToQueue(mapResultsId, taskQueueName, channel, dataStart, dataEnd);
        if (isMapResultQueueFull(i, batchesPerReduce)) {
            ++mapResultsId;
        }
    }
};


const addReduceTasks = function (trainingSetSize, batchSize, batchesPerReduce, channel, taskQueueName) {

    for (let i = 0; i < (trainingSetSize / batchSize / batchesPerReduce); ++i) {
        const reduceTask = JSON.stringify({ function: 'reduce', mapResultsId: i + 1 });
        channel.sendToQueue(taskQueueName, Buffer.from(reduceTask));
    }
};

// Data Start is inclusive
// Data end is exclusive
const addMapTaskToQueue = function (mapResultsId, queueName, amqpChannel, dataStart, dataEnd) {

    const mapTask = {
        function: 'map',
        dataStart,
        dataEnd,
        mapResultsId };

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

    addMapTasks(trainingSetSize, batchSize, taskQueueName, channel, batchesPerReduce);

    addReduceTasks(trainingSetSize, batchSize, batchesPerReduce, channel, taskQueueName);

};

module.exports = { initializeTaskQueue };


