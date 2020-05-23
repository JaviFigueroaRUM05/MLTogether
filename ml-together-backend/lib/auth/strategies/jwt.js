
'use strict';

const Boom = require('boom');

module.exports = (server, options) => ({
    scheme: 'jwt',
    options: {
        key: options.jwtKey,
        verifyOptions: { algorithms: ['HS256'] },
        validate: async (decoded,request) => {


            const db = request.mongo.db;
            const ObjectID = request.mongo.ObjectID;
            //console.log(decoded)
            const user = await db.collection('users').findOne(
                { _id: ObjectID(decoded.id) });

            if (user) {
                return { credentials: { 'id': user._id }, isValid: true };
            }

            return  { isValid: false };


        },
        errorFunc: ({ message }) => {

            throw Boom.unauthorized(message || 'Invalid or expired token');
        }
    }
});
