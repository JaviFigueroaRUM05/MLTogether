'use strict';

const Joi = require('@hapi/joi');
const { authModel } = require('../../utils/response-models');
const { verifyRegistration } = require('../../handlers/user-handlers');

module.exports = {
    method: 'POST',
    path: '/register',
    options: {
        pre: [
            { method: verifyRegistration }
        ],
        handler: async function (request,h) {

            const { userService } = request.services(true);
            const { fullName,email, password } = request.payload;

            const jwt = await userService.registerUser(fullName,email, password);

            return h.response({ token_id: jwt }).code(201);
        },
        tags: ['api','users'],
        description: 'Register an account with the system',
        validate: {
            failAction: (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            payload: Joi.object({
                fullName: Joi.string().required('Juan Apellido'),
                email: Joi.string().email().lowercase().required().example('juan@upr.edu'),
                password: Joi.string().min(7).required().strict().example('hello1234')
            })
        },
        response: { schema: authModel }

    }
};
