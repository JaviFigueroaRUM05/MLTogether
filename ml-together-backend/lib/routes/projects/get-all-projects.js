'use strict';

module.exports = {

    method: 'GET',
    path: '/projects',
    options: {
        description: 'Get all projects',
        notes: 'Returns all projects',
        tags: ['api'],
        handler: async function (request, h) {

            const db = request.mongo.db;
            const projects = await db.collection('projects').find().toArray();

            return h.response(projects).code(200);
        }

    }
};
