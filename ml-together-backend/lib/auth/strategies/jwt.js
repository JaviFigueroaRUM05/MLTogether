
'use strict';
const Boom = require('boom');
//TODO: SET KEY IN ENV VARIABLES FILE!! IMPORTANT!!
//TODO: Better validation....
module.exports = (server, options) => ({
    scheme: 'jwt',
    options: {
        key: '1B0765FACEFF119832996A609EDC113983186AD76DA6835574B892C55EE5AF4F',
        verifyOptions: { algorithms: ['HS256'] },
        validate: async (decoded,request) => {

          console.log('i am validating')
          const db = request.mongo.db;
          const ObjectID = request.mongo.ObjectID;
          //console.log(decoded)
          const user = await db.collection('users').findOne(
              { _id: ObjectID(decoded.id)});

              if (user) {
                return { credentials: user, isValid: true }
              }else {
               return  {isValid: false }
              }
                        
      }
    }
});