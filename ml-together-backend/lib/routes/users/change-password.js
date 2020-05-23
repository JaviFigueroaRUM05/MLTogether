'use strict';

const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const Boom = require('boom');

module.exports = {

    method: 'POST',
    path: '/user/changepass',
    options: {
        auth: 'jwt',
        handler: async function (request,h) {

            const db = request.mongo.db;
            const ObjectID = request.mongo.ObjectID;
            const userID = request.auth.credentials.id;
            const { oldpassword,newpassword } = request.payload;
            const user = await db.collection('users').findOne(
                { _id: new ObjectID(userID) });

            if (bcrypt.compareSync(oldpassword, user.password)) {
                console.log('passwords match!');
                bcrypt.hash(newpassword, 10, async (err, hash) => {

                    if (err) {
                        throw Boom.badRequest(err);
                    }

                    const  update = await db.collection('users').update({ _id: new ObjectID(userID) },
                        { $set: { 'password': hash } });

                });

            }
            else {

                throw Boom.badRequest('Old password does not match');
            }

            return h.response().code(201);

        },
        validate: {
            failAction: async (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            payload: Joi.object({
                oldpassword: Joi.string().min(7).required().strict(),
                newpassword: Joi.string().min(7).required().strict(),
                newpasswordconfirm: Joi.string().valid(Joi.ref('newpassword')).required().strict()
            })
        }
    }
};


