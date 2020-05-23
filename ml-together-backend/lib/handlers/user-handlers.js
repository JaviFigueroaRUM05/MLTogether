'use strict';

const Boom = require('boom');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');


async function verifyRegistration(request, h) {

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

}

async function verifyLogin(request, h) {
    //console.log('verifying email');
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

}


async function createToken(id, key) {
    console.log('Creating token');

    return JWT.sign({ id }, key, {
        algorithm: 'HS256',
        expiresIn: '1h'
    });
}

const register = async function (request,h) {

     const db = request.mongo.db;
     const { email, password} = request.payload;
     
     const pass = await bcrypt.hash(password,10)
     const user = await db.collection('users').insertOne({ email,password: pass })
     const jwt = await createToken(user._id, h.realm.pluginOptions.jwtKey);
        
    return h.response({ token_id: jwt }).code(201);

};



const login = async function (request,h) {

    const db = request.mongo.db;
    const { email,password } = request.payload;
    const user = await db.collection('users').findOne(
        { email });

    if (bcrypt.compareSync(password, user.password)) {
        console.log('passwords match!');
        //authentication token
        const jwt =  await createToken(user._id, h.realm.pluginOptions.jwtKey);
        return h.response({ token_id: jwt }).code(201);
    }

    throw Boom.unauthorized('Passwords don\'t match');


};



const changePass = async function (request,h) {

    const db = request.mongo.db;
    const ObjectID = request.mongo.ObjectID;
    const userID = request.auth.credentials.id;
    const { oldpassword,newpassword } = request.payload;
    const user = await db.collection('users').findOne(
        { _id: new ObjectID(userID) });

    if (bcrypt.compareSync(oldpassword, user.password)) {
        console.log('passwords match!');
        bcrypt.hash(newpassword, 10, async (err, hash) => {

            if (err) {
                throw Boom.badRequest(err);
            }

            const  update = await db.collection('users').update({ _id: new ObjectID(userID) },
                { $set: { 'password': hash } });

        });

    }
    else {

        throw Boom.badRequest('Old password does not match');
    }

    return h.response().code(201);

};








module.exports = {
    register,
    login,
    verifyLogin,
    verifyRegistration,
    changePass
};

