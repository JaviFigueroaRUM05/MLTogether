'use strict';

const handlers = require('../../handlers/user-handlers');
const schema = require('../../schemas/user-schemas');
const Joi = require('@hapi/joi');


module.exports = [
    {
        method: 'POST',
        path: '/register',
        options: {
            pre: [
                { method: handlers.verifyRegistration }
            ],
            handler: handlers.register,
            tags: ['api'],
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
                { method: handlers.verifyLogin }
            ],
            tags: ['api'],
            handler: handlers.login,
            validate: {
                failAction: async (request, h, err) => {
                    //TODO: change this to appear in debug only
                    console.error(err);
                    throw err;
                },
                payload: schema.login
            }
        }
    },
    {
        method: 'POST',
        path: '/user/changepass',
        options: {
            auth: 'jwt',
            handler: handlers.changePass,
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
                payload: schema.changePassword
            }
        }
    }


];
