'use strict';

const Boom = require('boom');

const verifyProject = async function (request, h) {

    try {
        const db = request.mongo.db;
        const ObjectID = request.mongo.ObjectID;

        const project = await db.collection('projects').findOne(
            { _id: new ObjectID(request.params.projectId) });
        //project doesn't exist in the database

        if (!project) {
            throw Boom.notFound('Project not found');
        }

        return request;
    }
    catch (err) {
        throw Boom.notFound('Project not found');

    }

};

module.exports = {
    verifyProject
};

