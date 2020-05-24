'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');
const { projectModel } = require('../../utils/response-models');

module.exports = {

    method: 'GET',
    path: '/projects/{projectId}',
    options: {
        pre: [
            { method: verifyProject }
        ],
        tags: ['api', 'projects'],
        handler: async function (request,h) {

            const db = request.mongo.db;
            const ObjectID = request.mongo.ObjectID;
            const project = await db.collection('projects').findOne({  _id: new ObjectID(request.params.projectId) });

            return h.response(project).code(200);
        },
        validate: {
            params: Joi.object({
                projectId: Joi.string().example('55153a8014829a865bbf700d')
            })
        },
        response: { schema: projectModel }

    }
};
