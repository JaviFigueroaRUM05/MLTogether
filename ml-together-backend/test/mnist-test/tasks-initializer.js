'use strict';

const AMQPInitializer = require('../../task/amqp-initializer');

const TRAINSET = 20;

const initializeTaskQueue = async function (taskQueueName) {

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

    const trainingSetSize = 60000;
    const batchSize = 100;
    const batchesPerReduce = 5;
    let mapResultsId = 1;
    for (let i = 0; i < TRAINSET; ++i) {
        const task = JSON.stringify({ function: 'map', dataStart: i, mapResultsId });
        channel.sendToQueue(taskQueueName, Buffer.from(task), {
            persistent: true
        });
        if ( (i + 1) % batchesPerReduce === 0 ) {
            ++mapResultsId;
        }

    }

    for (let i = 0; i < (20 / batchesPerReduce); ++i) {
        const reduceTask = JSON.stringify({ function: 'reduce', mapResultsId: i + 1 });
        channel.sendToQueue(taskQueueName, Buffer.from(reduceTask));
    }

};

const purgeQueue = async function (taskQueueName) {

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

    channel.purgeQueue(taskQueueName, (err, ok) => {

        console.log(ok);
        console.log(err);
    });
};

module.exports = { initializeTaskQueue, purgeQueue };
