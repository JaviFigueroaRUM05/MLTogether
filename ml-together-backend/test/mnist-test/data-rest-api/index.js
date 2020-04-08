'use strict';

const Joi = require('@hapi/joi');
const Data = require('./data');
const MainServer = require('../../../server');

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
                console.log(start);
                console.log(end);
                const data = Data.getTrainData(start, end);
                const result = {
                    images: await data.images.array(),
                    labels: await data.labels.array()
                };
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



