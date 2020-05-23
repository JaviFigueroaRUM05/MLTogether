'use strict';

const Boom = require('boom');

const verifyProject = async function (request, h) {

    const db = request.mongo.db;
    const ObjectID = request.mongo.ObjectID;

    const project = await db.collection('projects').findOne(
        { _id: new ObjectID(request.params.projectId) });
    //project doesn't exist in the database

    if (!project) {
        throw Boom.badRequest('Project Not Found');
    }

    return request;
};

module.exports = {
    verifyProject
};

