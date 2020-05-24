'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');

module.exports = {
    method: 'GET',
    path: '/projects/{projectId}/trained-model',
    options: {
        pre: [
            { method: verifyProject }
        ],
        auth: 'jwt',
        handler: async function (request,h) {
            const db = request.mongo.db;
            const project = await db.collection('trainedModels').find({ projectId: request.params.projectId }).toArray();
            return h.response(project).code(200);
        },
        validate: {
            params: Joi.object({
                projectId: Joi.string()
            }),
            headers: Joi.object({
                authorization: Joi.string().required()
            }).unknown()
        }
    }
};
