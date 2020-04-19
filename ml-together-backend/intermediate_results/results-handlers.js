'use strict';

const Boom = require('boom');

//TODO: Error validation Boom
const getIRs = async function (request, h) {

    const db = request.mongo.db;
    const projects = await db.collection('intermediateResults').find().toArray();

    return h.response(projects).code(200);
};

const GetIRByProjectID = async function (request, h) {

    const db = request.mongo.db;
    const results = await db.collection('intermediateResults').find({ projectId: request.params.projectId, mapResultsId: request.params.mapResultsId }).toArray();

    return h.response(results).code(200);
};

const createIR = async function (request, h) {

    const db = request.mongo.db;
    const payload = request.payload;
    //adding the pid
    payload.projectId = request.params.projectId;
    //TODO: additional payload json validation

    console.log(request.payload);
    const results = await db.collection('intermediateResults').insertOne(payload);


    return h.response(results).code(201);
};

const removeProjectIRs = async function (request, h) {

    const db = request.mongo.db;
    //TODO: additional payload json validation


    const results = await db.collection('intermediateResults').deleteMany({ projectId: request.params.projectId });


    return h.response(results).code(200);
};





module.exports = {
    getIRs,
    GetIRByProjectID,
    createIR,
    removeProjectIRs
};
