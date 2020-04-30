'use strict';

const AMQPInitializer = require('../amqp-initializer');

const purgeQueue = async function (queueName) {

    console.log('Purging: ' + queueName);
    let channel = null;
    try {
        channel = await AMQPInitializer.initialize('amqp://localhost');
    }
    catch (err) {
        console.error(err);
        throw err;
    }

    channel.assertQueue(queueName, {
        durable: true
    });

    channel.purgeQueue(queueName, (err, ok) => {

        console.log(ok);
        console.log(err);
    });
};

const purgeMapResultsQueues = async function (mapResultsQueueName, numberOfQueues) {

    for (let i = 0; i < numberOfQueues; ++i) {
        const fullMapResultsQueueName = (mapResultsQueueName + '_' + (i + 1));
        await purgeQueue(fullMapResultsQueueName);
    }
};

module.exports = { purgeQueue, purgeMapResultsQueues };
