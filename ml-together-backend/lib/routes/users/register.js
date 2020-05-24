'use strict';

const Boom = require('boom');
const BCrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const Joi = require('@hapi/joi');

const { verifyRegistration } = require('../../handlers/user-handlers');


const createToken = function (id, key) {

    return JWT.sign({ id }, key, {
        algorithm: 'HS256',
        expiresIn: '1h'
    });
};

module.exports = {
    method: 'POST',
    path: '/register',
    options: {
        pre: [
            { method: verifyRegistration }
        ],
        handler: async function (request,h) {

            const db = request.mongo.db;
            const { userService } = request.services(true);
            const { email, password } = request.payload;

            const jwt = await userService.registerUser(email, password);

            return h.response({ token_id: jwt }).code(201);
        },
        tags: ['api'],
        validate: {
            failAction: (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            payload: Joi.object({
                email: Joi.string().email().lowercase().required().example('juan@upr.edu'),
                password: Joi.string().min(7).required().strict().example('hello1234'),
                confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict().example('hello1234')
            })
        }
    }
};
