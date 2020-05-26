'use strict';

const Joi = require('@hapi/joi');
const _ = require('lodash');
const { projectModel, ErrorsOutputValidations } = require('../../utils/response-models');

module.exports = {

    method: 'GET',
    path: '/projects',
    options: {
        description: 'Get all projects',
        notes: 'Returns all projects',
        tags: ['api', 'projects'],
        handler: async function (request, h) {

            const db = request.mongo.db;
            const projects = await db.collection('projects').find().toArray();

            return h.response(projects).code(200);
        },
        response: _.merge({}, ErrorsOutputValidations, {
            status: {
                200: Joi.array().items(projectModel).label('ProjectList')
            }
        })

    }
};
