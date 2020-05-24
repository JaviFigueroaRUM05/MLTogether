'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');


module.exports = {
    method: 'POST',
    path: '/projects/{projectId}/trained-model',
    handler: async function (request,h) {

        const db = request.mongo.db;
        const payload = request.payload;
        //adding the pid
        payload.projectId = request.params.projectId;

        const model = await db.collection('trainedModels').insertOne(payload);

        return h.response(model).code(201);
    },
    options: { pre: [
        { method: verifyProject }
    ],
    
    payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        multipart: true
    },
    validate: {
        failAction: (request, h, err) => {
            //TODO: change this to appear in debug only
            console.error(err);
            throw err;
        },
        params: Joi.object({
            projectId: Joi.string()
        }),
        payload: Joi.object({
            trainedModel: Joi.any()
        })
    }
    }
};
