'use strict';

//TODO: Error validation Boom

module.exports = {

    method: 'GET',
    path: '/projects',
    options: {
        description: 'Get all projects',
        notes: 'Returns a file for the current goal given the project id and the file.',
        tags: ['api'],
        handler: async function (request, h) {

            const db = request.mongo.db;
            const projects = await db.collection('projects').find().toArray();

            return h.response(projects).code(200);
        }

    }
};
