'use strict';

const AMQP = require('amqplib/callback_api');

/**
 * connectToMessageBroker() returns a Promise of a connection to
 * an amqp Message Broker based on the url given
 * @param {String} url
 */
const connectToMessageBroker = function (url) {

    return new Promise(((resolve, reject) => {

        AMQP.connect(url, (error, connection) => {

            if (error) {
                reject(error);
            }

            resolve(connection);
        });

    }));
};

/**
 * createChannelToMessageBroker() creates and returns a amqp
 * channel based on the connection parameter given
 * @param {Connection} connection
 */
const createChannelToMessageBroker = function (connection) {

    return new Promise(((resolve, reject) => {

        connection.createChannel((error, channel) => {

            if (error) {
                reject(error);
            }

            resolve(channel);
        });
    }));
};

/**
 * initAMQPChannel() returns a channel to a given amqp
 * Message Broker determined by the url. This also
 * checks if a the queue exists
 * @param {String} url
 */
const initAMQPChannel = async function (url) {

    let channel = null;
    try {
        const connection = await connectToMessageBroker(url);
        channel = await createChannelToMessageBroker(connection);
    }
    catch (err) {
        throw err;
    }

    // TODO: Make the queues easier to modify as a plugin
    const queue = 'task_queue';

    channel.assertQueue(queue, {
        durable: true
    });
    channel.prefetch(1);
    return channel;
};

module.exports = { initialize: initAMQPChannel };
