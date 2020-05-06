'use strict';

const Joi = require('@hapi/joi');
const Data = require('./data');
const MainServer = require('../../../../server');
const MNISTModel = require('./model');
const IRRequest = require('../../../../lib/plugins/intermediate-results/tfjs-io-handler');

const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/' + PROJECT_ID + '/ir';
const BATCH_SIZE = 10;
const BATCHES_PER_REDUCE = 20;
const TRAINING_DATA_LENGTH = 60000; //DO NOT REMOVE

const MNISTDataPlugin = {

    name: 'MNISTData',
    version: '1.0.0',
    register: async (server, options) => {

        await Data.loadData();
        server.route({
            method: 'GET',
            path: '/mnist/data',
            handler: async function (request, h) {

                const { start, end } = request.query;
                //console.log(`Got data ${start} to ${end}`);
                const data = Data.getTrainData(start, end);
                const images = data.images;
                const labels = data.labels;
                const result = {
                    images: await images.array(),
                    labels: await labels.array()
                };
                images.dispose();
                labels.dispose();
                return result;
            },
            options: {
                validate: {
                    query: Joi.object({
                        start: Joi.number().integer().required(),
                        end: Joi.number().integer().required()
                    })
                }
            }
        });



    }
};
exports.deployment = async (start) => {

    const server = await MainServer.deployment(false);
    await server.register(MNISTDataPlugin);
    await server.initialize();

    const { queueService, taskService } = server.services();

    const trainingDataLength = 100;

    const queueNames = await queueService.getProjectQueueNames(PROJECT_ID);
    await queueService.deleteQueues(queueNames);

    const tasks = taskService
        .createTasks(TRAINING_DATA_LENGTH, BATCH_SIZE, BATCHES_PER_REDUCE,
            MODEL_HOST);

    await queueService.addTasksToQueues(PROJECT_ID,tasks);


    if (!start) {
        return server;
    }

    await server.start();

    await MNISTModel.save( IRRequest(MODEL_HOST, 1) );
    MNISTModel.dispose();


    console.log(`Server started at ${server.info.uri}`);

    return server;
};

if (!module.parent) {

    let server = null;
    exports.deployment(true).then( (ser) => {

        server = ser;
    });

    process.on('unhandledRejection', (err) => {

        throw err;
    });
    process.on('SIGINT', () => {

        console.log('stopping hapi server');
        server.stop({ timeout: 10000 }).then((err) => {

            console.log('hapi server stopped');
            process.exit((err) ? 1 : 0);
        });
    });
}

// listen on SIGINT signal and gracefully stop the server



