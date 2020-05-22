'use strict';

const Boom = require('boom');

//TODO: Error validation Boom
const getProjects = async function (request, h) {

    const db = request.mongo.db;
    const projects = await db.collection('projects').find().toArray();

    return h.response(projects).code(200);
};

const postProject = async function (request,h) {
    
    const db = request.mongo.db;
    const payload = request.payload;
    payload.userID  = request.auth.credentials.id;
    
    const project = await db.collection('projects').insertOne(payload);

    return h.response(project).code(201);
};

const getProjectByID = async function (request,h) {

    const db = request.mongo.db;
    const ObjectID = request.mongo.ObjectID;
    const project = await db.collection('projects').findOne({  _id: new ObjectID(request.params.projectId) });

    return h.response(project).code(200);
};

const getProjectsByOwner = async function (request,h) {

    const db = request.mongo.db;
    const ObjectID = request.mongo.ObjectID;
    const userID = request.auth.credentials.id;
    console.log(request.auth.credentials)
    const projects = await db.collection('projects').find({ userID: new ObjectID(userID) }).toArray();
    
    return h.response(projects).code(200);
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
    console.log('here')
    const db = request.mongo.db;
    const project = await db.collection('trainedModels').find({ projectId: request.params.projectId }).toArray();

    return h.response(project).code(200);
};



async function verifyProject(request, h) {
    console.log('verifying project existence');
    const db = request.mongo.db;
    const ObjectID = request.mongo.ObjectID;

    const project = await db.collection('projects').findOne(
        { _id: new ObjectID(request.params.projectId) });
    //project doesn't exist in the database

    if (!project) {
        throw Boom.badRequest("Project Not Found");
    }

    return request;
 
  }
  

const deleteProjectTaskQueues = async function (request, h) {

    const projectId = request.params.projectId;
    const { queueService } = request.services();

    if ( request.query.all === true ) {

        const queueNames = await queueService.getProjectQueueNames(projectId);
        await queueService.deleteQueues(queueNames);
        return h.response({ deleted: queueNames }).code(200);
    }

    return h.response({}).code(501);


};





module.exports = {
    getProjects,
    getProjectByID,
    postTrainedModelbyProjectID,
    getTrainedModelbyProjectID,
    deleteProjectTaskQueues,
    getProjectsByOwner,
    verifyProject,
    postProject
};

