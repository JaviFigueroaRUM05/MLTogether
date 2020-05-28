'use strict';

const Joi = require('@hapi/joi');
const {HeadersPayLoad,projectModel, ErrorsOnGetOutputValidations } = require('../../utils/response-models');
const _ = require('lodash');

module.exports = {
    method: 'GET',
    path: '/projects/owner',
    options: {
        auth: 'jwt',
        description: 'Get logged-in user\'s created projects',
        notes: 'Returns information about the projects a user create',
        tags: ['api', 'projects'],
        handler: async function (request,h) {

            const db = request.mongo.db;
            const ObjectID = request.mongo.ObjectID;
            const userID = request.auth.credentials.id;
            const projects = await db.collection('projects').find({userID: new ObjectID(userID)}).toArray();
            return h.response(projects).code(200);
        },
        validate: {
            failAction: async (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            headers: HeadersPayLoad },
        response: _.merge({}, ErrorsOnGetOutputValidations, {
                status: {
                    200: Joi.array().items(projectModel)
                }
            })
    }
};
