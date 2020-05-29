'use strict';

const Schmervice = require('schmervice');
const Axios = require('axios');
const AMQP = require('amqplib');


/**
 * initAMQPChannel() returns a channel to a given amqp
 * Message Broker determined by the url. This also
 * checks if a the queue exists
 * @param {String} url
 */
const initConnection = async function (url) {

    try {
        const connection = await AMQP.connect(url);
        // channel.assertQueue(queue, {
        //     durable: true
        // });
        //channel.prefetch(1);
        return connection;

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
const initAMQPChannel = async function (connection) {

    try {
        const channel = await connection.createChannel();
        // channel.assertQueue(queue, {
        //     durable: true
        // });
        //channel.prefetch(1);
        return channel;

    }
    catch (err) {
        throw err;
    }

};

class QueueService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        this.taskQueueBaseName = this.options.taskQueueBaseName || 'task_queue';

        this.mapResultsQueueBaseName = this.options.mapResultsQueueBaseName ||
            'map_results_queue';
        console.log(`amqp://${this.options.amqpURL}`)
        this.amqpURL =  `amqp://${this.options.amqpURL}` || 'amqp://localhost';
        this.amqpHost = this.options.amqpURL || 'localhost';
        this.defaultMaxTimeToWait = this.options.defaultMaxTimeToWait || 5000;
    }

    async initialize() {

        this.connection = await initConnection(this.amqpURL);
    }
    async addTasksToQueues(projectId, tasks) {

        const fullTaskQueueName = `${this.taskQueueBaseName}_${projectId}`;
        const channel = await initAMQPChannel(this.connection);

        await channel.assertQueue(fullTaskQueueName, {
            durable: true
        });

        for (let i = 0; i < tasks.length; ++i) {
            const task = tasks[i];
            const stringifiedTask = JSON.stringify(task);
            await this.sendToTaskQueue(projectId, Buffer.from(stringifiedTask), channel);
        }

        await channel.close();
    }

    async fetchTaskFromQueue(projectId, maxTimeToWait) {

        maxTimeToWait = maxTimeToWait || this.defaultMaxTimeToWait;
        let channel = null;
        const fullTaskQueueName = `${this.taskQueueBaseName}_${projectId}`;
        try {
            channel = await initAMQPChannel(this.connection);
            return new Promise(async (resolve) => {

                setTimeout( () => {

                    resolve(null);
                }, maxTimeToWait);
                await channel.prefetch(1);
                await channel.consume(fullTaskQueueName, async (msg) => {


                    if (msg.content === null) {
                        return { function: 'nop' };
                    }

                    const task = JSON.parse(msg.content.toString());
                    //await channel.close();
                    resolve(task);
                    await channel.ack(msg);
                    await channel.close();
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

    async sendToTaskQueue(projectId, payload, channel) {

        try {
            const fullTaskQueueName = `${this.taskQueueBaseName}_${projectId}`;
            await channel.sendToQueue(fullTaskQueueName, payload);
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
                const channel = await initAMQPChannel(this.connection);
                await channel.assertQueue(fullMapResultsQueueName, {
                    durable: true
                });
                await channel.sendToQueue(fullMapResultsQueueName, Buffer.from(JSON.stringify(payload)), {
                    persistent: true
                });
                await channel.close();
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
                const channel = await initAMQPChannel(this.connection);

                await channel.consume(fullMapResultsQueueName, async (reduceDataInstance) => {

                    mapResults.push(reduceDataInstance.content.toString());
                    if (mapResults.length === numberOfBatches) {
                        await channel.close();
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
            const channel = await initAMQPChannel(this.connection);
            for (let i = 0; i < queueNames.length; ++i) {
                const queueName = queueNames[i];
                await channel.deleteQueue(queueName);
            }

            await channel.close();

        }
        catch (err) {
            this.server.log(['test', 'queue', 'error'], err);
            throw err;
        }

    }

    async getProjectQueueNames(projectId) {
        // TODO: Make this url modular
        const url = `http://${this.amqpHost}:15672/api/queues`;
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
