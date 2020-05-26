'use strict';

const Joi = require('@hapi/joi');
const { ErrorsWithAuthOutputValidations, HeadersPayLoad, projectModel, ErrorsOnPostOutputValidations } = require('../../utils/response-models');
const _ = require('lodash');

module.exports = {
    method: 'POST',
    path: '/projects',
    options: {
        description: 'Lets logged in user create a project',
        auth: 'jwt',
        tags: ['api', 'projects'],
        validate: {
            payload: Joi.object({
                title: Joi.string().required().example('Cancer Research'),
                description: Joi.string().required().example('Doing Cancer Research by using machine learning models.')
            }).label('ProjectPayload'),
            headers: HeadersPayLoad 
        },
        response: _.merge({}, ErrorsWithAuthOutputValidations, ErrorsOnPostOutputValidations, {
            status: {
                200: projectModel
            }
        }),

        handler: async function (request,h) {

            const db = request.mongo.db;
            const payload = request.payload;
            payload.userID  = request.auth.credentials.id;

            const project = (await db.collection('projects').insertOne(payload)).ops[0];
            return h.response(project).code(201);
        }

    }
};
