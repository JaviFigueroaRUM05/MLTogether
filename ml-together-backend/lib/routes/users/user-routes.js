'use strict';

const handlers = require('../../handlers/user-handlers');
const schema = require('../../schemas/user-schemas');
const Joi = require('@hapi/joi');

//TODO: schema validation
module.exports = [
    {
        method: 'POST',
        path: '/register',
        options: {
            pre: [
                {method: handlers.verifyRegistration}
            ],
            handler: handlers.register,
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true
            },
            validate: {
                failAction: async (request, h, err) => {
                    //TODO: change this to appear in debug only
                    console.error(err);
                    throw err;
                },              
                payload: schema.registration
            }
        }
    },

    {
        method: 'POST',
        path: '/login',        
        options: {
            pre: [
                {method: handlers.verifyLogin}
            ],
            handler: handlers.login,
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true
            },
            validate: {
                failAction: async (request, h, err) => {
                    //TODO: change this to appear in debug only
                    console.error(err);
                    throw err;
                },              
                payload: schema.login
            }
        }
    }
    

];
