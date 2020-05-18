'use strict';

const Joi = require('@hapi/joi');
const Data = require('./data');
const MainServer = require('../../../../server');

const PROJECT_ID = 'mnist121';
const GOAL_TITLE = 'MNIST';
const TRAIN_DATA_URL = 'http://localhost:3000/mnist/data';
const BATCH_SIZE = 10;
const BATCHES_PER_REDUCE = 20;
const TRAINING_DATA_LENGTH = 60000; //DO NOT REMOVE
const MODEL_FN = require('./functions/model');
const MAP_FN = require('./functions/map');
const REDUCE_FN = require('./functions/reduce');

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

    const goalCreationRoute = `/project/${PROJECT_ID}/goal`;

    const title = GOAL_TITLE;

    // Model Information
    const optimizer = 'rmsprop';
    const loss = 'categoricalCrossentropy';
    const metrics = ['accuracy'];

    // Task Information
    const trainingSetSize = TRAINING_DATA_LENGTH;

    const payload = {
        title,
        model: {
            modelFn: MODEL_FN,
            optimizer,
            loss,
            metrics
        },
        taskInfo: {
            trainingSetSize,
            trainDataUrl: TRAIN_DATA_URL,
            batchSize: BATCH_SIZE,
            batchesPerReduce: BATCHES_PER_REDUCE,
            mapFn: MAP_FN,
            reduceFn: REDUCE_FN
        }
    };

    await server.inject({
        method: 'POST',
        url: goalCreationRoute,
        payload
    });

    if (!start) {
        return server;
    }

    await server.start();



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



