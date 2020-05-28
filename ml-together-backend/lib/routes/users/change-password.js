'use strict';

const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const _ = require('lodash');
const Joi = require('@hapi/joi');
const Boom = require('boom');
const { HeadersPayLoad, ErrorsOnPostOutputValidations } = require('../../utils/response-models');

module.exports = {

    method: 'POST',
    path: '/user/changepass',
    options: {
        auth: 'jwt',
        tags: ['api','users'],
        description: 'Change the password of an account',
        handler: async function (request,h) {

            const db = request.mongo.db;
            const ObjectID = request.mongo.ObjectID;
            const userID = request.auth.credentials.id;
            const { userService } = request.services(true);
            const { oldpassword,newpassword } = request.payload;
            const user = await db.collection('users').findOne(
                { _id: new ObjectID(userID) });
            if (bcrypt.compareSync(oldpassword, user.password)) {
                const hash = await userService.hash(newpassword);
                const update = await (db.collection('users').updateOne(
                    { _id: new ObjectID(userID) },{ $set: { 'password': hash } }));

            }
            else {

                throw Boom.badRequest('Old password does not match');
            }

            return h.response({ status: 'ok', message: 'Password changed sucessfully!' }).code(200);

        },
        validate: {
            failAction: async (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            headers: HeadersPayLoad,
            payload: Joi.object({
                oldpassword: Joi.string().min(7).required().strict().example('oldpassword'),
                newpassword: Joi.string().min(7).required().strict().example('new password')
            })
        },
        response: _.merge({}, ErrorsOnPostOutputValidations, {
            status: {
                200: Joi.object({
                    status: Joi.string().required().equal('ok'),
                    message: Joi.string().required().equal('Password changed sucessfully!')
                })
            }
        })
    }
};


