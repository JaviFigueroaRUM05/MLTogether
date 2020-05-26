'use strict';

const BCrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const Boom = require('boom');
const { authModel, ErrorsOnPostOutputValidations  } = require('../../utils/response-models');
const { verifyLogin } = require('../../handlers/user-handlers');
const _ = require('lodash');

const createToken =  function createToken(id, key) {

    return JWT.sign({ id }, key, {
        algorithm: 'HS256',
        expiresIn: '1h'
    });
};

module.exports = {
    method: 'POST',
    path: '/login',
    options: {
        pre: [
            { method: verifyLogin }
        ],
        tags: ['api', 'users'],
        description: 'Obtain an auth token',
        notes: 'Obtain an auth token using existing credentials',
        handler: async function (request,h) {

            const db = request.mongo.db;
            const { email,password } = request.payload;
            const user = await db.collection('users').findOne(
                { email });


            if (BCrypt.compareSync(password, user.password)) {
                //authentication token
                const jwt =  await createToken(user._id, h.realm.pluginOptions.jwtKey);
                return h.response({ token_id: jwt }).code(200);
            }

            throw Boom.unauthorized('Passwords don\'t match');


        },
        validate: {
            failAction: (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            payload: Joi.object({
                email: Joi.string().email().lowercase().required().example('juan@upr.edu'),
                password: Joi.string().min(7).required().strict()
            })
        },
        response: _.merge({}, ErrorsOnPostOutputValidations, {
            status: {
                200: authModel
            }
        })

    }
};
