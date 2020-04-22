'use strict';

const Boom = require('boom');

//TODO: Error validation Boom
const getProjects = async function (request, h) {

    const db = request.mongo.db;
    const projects = await db.collection('projects').find().toArray();

    return h.response(projects).code(200);
};

const getProjectByID = async function (request,h) {

    const db = request.mongo.db;
    const ObjectID = request.mongo.ObjectID;
    const project = await db.collection('projects').findOne({  _id: new ObjectID(request.params.projectId) });

    return h.response(project).code(200);
};

const postTrainedModelbyProjectID = async function (request,h) {

    const db = request.mongo.db;
    const payload = request.payload;
    //adding the pid
    payload.projectId = request.params.projectId;

    const model = await db.collection('trainedModels').insertOne(payload);

    return h.response(model).code(201);
};

const getTrainedModelbyProjectID = async function (request,h) {

    const db = request.mongo.db;
    const project = await db.collection('trainedModels').find({ projectId: request.params.projectId }).toArray();

    return h.response(project).code(200);
};





module.exports = {
    getProjects,
    getProjectByID,
    postTrainedModelbyProjectID,
    getTrainedModelbyProjectID
};

