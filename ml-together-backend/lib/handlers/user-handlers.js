'use strict';

const Boom = require('boom');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken')

//TODO: Error validation Boom


  async function verifyRegistration(request, h) {
    console.log('verifying email');
    const db = request.mongo.db;
    // Find an entry from the database that
    // matches either the email or username

    const user = await db.collection('Users').findOne(
        { email: request.payload.email });
    
    //user with that email already exists
    if (user) {
        throw Boom.badRequest("Email taken!");
    }

    return request;
 
  }

  async function verifyLogin(request, h) {
    console.log('verifying email');
    const db = request.mongo.db;
    // Find an entry from the database that
    // matches either the email or username

    const user = await db.collection('Users').findOne(
        { email: request.payload.email });
    
    //user with that email doesn't exist
    if (!user) {
        throw Boom.badRequest("Email not found");
    }

    return request;
 
  }
  
const register = async function (request,h) {
    
    const db = request.mongo.db;
    const {email,confirmpassword} = request.payload;
    //TODO: better password hashing
    bcrypt.hash(request.payload.password, 10, async function(err, hash) {
        // Store hash in database
        if (err) {
            throw Boom.badRequest(err);
        }
       
        await db.collection('Users').insertOne({email:email,password:hash});
      });
 
        return h.response().code(201);
    //return h.response(user).code(201);
};



const login = async function (request,h) {

    const db = request.mongo.db;
    const {email,password}= request.payload;
    const user = await db.collection('Users').findOne(
        { email: request.payload.email });

    
    if(bcrypt.compareSync(password, user.password)) {
        console.log('passwords match!');
        //authentication token
       } else {
        console.log('passwords dont match');
       }
       //dont return user info...
    return h.response(user).code(201);
};








module.exports = {
    register,
    login,
    verifyLogin,
    verifyRegistration
};

