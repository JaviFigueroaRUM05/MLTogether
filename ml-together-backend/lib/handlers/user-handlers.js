'use strict';

const Boom = require('boom');


const verifyRegistration = async function (request, h) {

    const db = request.mongo.db;
    // Find an entry from the database that
    // matches either the email or username

    const user = await db.collection('users').findOne(
        { email: request.payload.email });

    //user with that email already exists
    if (user) {
        throw Boom.badRequest('Email taken!');
    }

    return request;

};

const verifyLogin = async function (request, h) {
    const db = request.mongo.db;
    // Find an entry from the database that
    // matches either the email or username

    const user = await db.collection('users').findOne(
        { email: request.payload.email });
    //user with that email doesn't exist
    if (!user) {
        throw Boom.unauthorized('Email not found');
    }

    return request;
};

module.exports = {
    verifyLogin,
    verifyRegistration
};

