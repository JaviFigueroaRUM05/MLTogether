
'use strict';
const Boom = require('boom');
//TODO: SET KEY IN ENV VARIABLES FILE!! IMPORTANT!!

module.exports = (server, options) => ({
    scheme: 'jwt',
    options: {
        key: '1B0765FACEFF119832996A609EDC113983186AD76DA6835574B892C55EE5AF4F',
        verifyOptions: { algorithms: ['HS256'] },
        validate: async (decoded,request) => {
          
         
          const db = request.mongo.db;
          const ObjectID = request.mongo.ObjectID;
          //console.log(decoded)
          const user = await db.collection('users').findOne(
              { _id: ObjectID(decoded.id)});
       
              if (user) {
                return { credentials: {'id': user._id}, isValid: true }
              }else {
               return  {isValid: false }
              }
                        
      },
      errorFunc:({message}) =>{
        
        throw Boom.unauthorized(message || 'Invalid or expired token')
      }
    }
});