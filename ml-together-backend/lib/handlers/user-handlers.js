'use strict';

const Boom = require('boom');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken')


  async function verifyRegistration(request, h) {
    
    const db = request.mongo.db;
    // Find an entry from the database that
    // matches either the email or username

    const user = await db.collection('users').findOne(
        { email: request.payload.email });
    
    //user with that email already exists
    if (user) {
        throw Boom.badRequest("Email taken!");
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
        throw Boom.unauthorized("Email not found");
    }

    return request;
 
  }
//TODO: keep key secret
  async function createToken(id) {
    console.log('Creating token')
    
    return JWT.sign({ id }, '1B0765FACEFF119832996A609EDC113983186AD76DA6835574B892C55EE5AF4F', {
        algorithm: 'HS256',
        expiresIn: '1h'
    });
}
  
const register = async function (request,h) {
    
    const db = request.mongo.db;
    const {email, password,confirmPassword} = request.payload;
    //TODO: better password hashing   
    if(password == confirmPassword){
    bcrypt.hash(password, 10, async function(err, hash) {
        // Store hash in database
        if (err) {
            throw Boom.badRequest(err);
        }
       
        await db.collection('users').insertOne({email:email,password:hash});
      });
        
    }else {
        throw Boom.badRequest("Passwords don't match");
    }
        return h.response().code(201);
   
};



const login = async function (request,h) {

    const db = request.mongo.db;
    const {email,password}= request.payload;
    const user = await db.collection('users').findOne(
        { email: email });
        
    if(bcrypt.compareSync(password, user.password)) {
        console.log('passwords match!');
        //authentication token
       const jwt =  await createToken(user._id)
       return h.response({token_id: jwt}).code(201);
       } else {
       
        throw Boom.unauthorized("Passwords don't match");
       }
       //dont return user info...
   
};








module.exports = {
    register,
    login,
    verifyLogin,
    verifyRegistration
};

