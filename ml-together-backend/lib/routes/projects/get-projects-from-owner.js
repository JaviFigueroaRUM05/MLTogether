'use strict';

const Joi = require('@hapi/joi');


module.exports = {
    method: 'GET',
    path: '/projects/owner',
    options: {
        auth: 'jwt',
        description: 'Get logged-in user\'s created projects',
        notes: 'Returns information about projects owned',
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
            headers: Joi.object({
                authorization: Joi.string().required()
            }).unknown()}
    }
};
