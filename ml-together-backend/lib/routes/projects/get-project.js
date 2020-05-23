'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');

module.exports = {

    method: 'GET',
    path: '/projects/{projectId}',
    options: {
        pre: [
            { method: verifyProject }
        ],
        auth: 'jwt',
        handler: async function (request,h) {

            const db = request.mongo.db;
            const ObjectID = request.mongo.ObjectID;
            const project = await db.collection('projects').findOne({  _id: new ObjectID(request.params.projectId) });

            return h.response(project).code(200);
        },
        validate: {
            params: Joi.object({
                projectId: Joi.string()
            })
        }
    }
};
