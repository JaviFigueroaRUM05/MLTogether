'use strict';

const Schmervice = require('schmervice');
const Axios = require('axios');
const AMQP = require('amqplib');

/**
 * connectToMessageBroker() returns a Promise of a connection to
 * an amqp Message Broker based on the url given
 * @param {String} url
 */
const connectToMessageBroker = async function (url) {

    try {
        const connection = await AMQP.connect(url);
        return connection;
    }
    catch (err) {
        throw err;
    }

};

/**
 * createChannelToMessageBroker() creates and returns a amqp
 * channel based on the connection parameter given
 * @param {Connection} connection
 */
const createChannelToMessageBroker = async function (connection) {

    try {
        const channel = await connection.createChannel();
        return channel;
    }
    catch (err) {
        throw err;
    }
};

/**
 * initAMQPChannel() returns a channel to a given amqp
 * Message Broker determined by the url. This also
 * checks if a the queue exists
 * @param {String} url
 */
const initAMQPChannel = async function (url, queue) {

    let channel = null;
    try {
        const connection = await connectToMessageBroker(url);
        channel = await createChannelToMessageBroker(connection);
    }
    catch (err) {
        throw err;
    }

    channel.assertQueue(queue, {
        durable: true
    });
    channel.prefetch(1);
    return channel;
};

class QueueService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        this.taskQueueBaseName = this.options.taskQueueBaseName || 'task_queue';

        this.mapResultsQueueBaseName = this.options.mapResultsQueueBaseName ||
            'map_results_queue';

        this.amqpURL =  this.options.amqpURL || 'amqp://localhost';

        this.defaultMaxTimeToWait = this.options.defaultMaxTimeToWait || 5000;
    }

    async addTasksToQueues(projectId, tasks) {

        for (let i = 0; i < tasks.length; ++i) {
            const task = tasks[i];
            const stringifiedTask = JSON.stringify(task);
            await this.sendToTaskQueue(projectId, Buffer.from(stringifiedTask));
        }
    }

    async fetchFromQueue(projectId, maxTimeToWait) {

        maxTimeToWait = maxTimeToWait || this.defaultMaxTimeToWait;
        let channel = null;
        const fullTaskQueueName = `${this.taskQueueBaseName}_${projectId}`;
        try {
            channel = await initAMQPChannel(this.amqpURL, fullTaskQueueName);
            return new Promise((resolve) => {

                setTimeout( () => {

                    resolve(null);
                }, maxTimeToWait);

                channel.consume(fullTaskQueueName, (msg) => {

                    resolve(msg.content);
                }, {
                    noAck: false
                });

            });
        }
        catch (err) {
            this.server.log(['test', 'queue', 'error'], err);
            throw err;
        }

    }

    async sendToTaskQueue(projectId, payload) {

        let channel = null;
        try {
            const fullTaskQueueName = `${this.taskQueueBaseName}_${projectId}`;
            channel = await initAMQPChannel(this.amqpURL, fullTaskQueueName);
            channel.sendToQueue(fullTaskQueueName, payload);
        }
        catch (err) {
            this.server.log(['test', 'queue', 'error'], err);
            throw err;
        }
    }

    sendToMapResultsQueue(projectId, mapResultsId, payload) {

        const fullMapResultsQueueName = `${this.mapResultsQueueBaseName}_${projectId}_${mapResultsId}`;

        return new Promise( async (resolve) => {

            try {
                const channel = await initAMQPChannel(this.amqpURL, fullMapResultsQueueName);
                channel.sendToQueue(fullMapResultsQueueName, Buffer.from(JSON.stringify(payload)), {
                    persistent: true
                });
                resolve();
            }
            catch (err) {
                this.server.log(['test', 'queue', 'error'], err);
                throw err;
            }

        });
    }

    fetchAllFromMapResultsQueue(projectId, mapResultsId, numberOfBatches) {

        const mapResults = [];
        const fullMapResultsQueueName =
            `${this.mapResultsQueueBaseName}_${projectId}_${mapResultsId}`;


        return new Promise( async (resolve, reject) => {

            try {
                const channel = await initAMQPChannel(this.amqpURL,
                    fullMapResultsQueueName);

                channel.consume(fullMapResultsQueueName, (reduceDataInstance) => {

                    console.log(reduceDataInstance);
                    mapResults.push(reduceDataInstance.content.toString());
                    if (mapResults.length === numberOfBatches) {
                        resolve(mapResults);
                    }
                }, {
                    noAck: true
                });
            }
            catch (err) {
                this.server.log(['test', 'queue', 'error'], err);
                reject(err);
            }
        });
    }


    async deleteQueues(queueNames) {
        // TODO: also accept a single queue
        try {
            const channel = await initAMQPChannel(this.amqpURL, queueNames[0]);
            for (let i = 0; i < queueNames.length; ++i) {
                const queueName = queueNames[i];
                await channel.deleteQueue(queueName);
            }
        }
        catch (err) {
            this.server.log(['test', 'queue', 'error'], err);
            throw err;
        }

    }

    async getProjectQueueNames(projectId) {
        // TODO: Make this url modular
        const url = 'http://localhost:15672/api/queues';
        const httpRequestOptions = {
            method: 'GET',
            url,
            auth: {
                username: 'guest',
                password: 'guest'
            }
        };
        try {
            const response = await Axios(httpRequestOptions);
            const projectQueues = response.data.filter( (queue) =>  queue.name.includes(projectId));
            const projectQueueNames = projectQueues.map( (queue) => queue.name);
            return projectQueueNames;

        }
        catch (err) {
            this.server.log(['test', 'queue', 'error'], err);
            throw err;
        }
    }
}

module.exports = QueueService;
