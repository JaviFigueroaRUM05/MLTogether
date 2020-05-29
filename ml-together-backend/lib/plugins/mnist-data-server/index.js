'use strict';

const Data = require('./data');
const Joi = require('@hapi/joi');

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
module.exports = MNISTDataPlugin;