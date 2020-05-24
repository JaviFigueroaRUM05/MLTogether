'use strict';

const Schmervice = require('schmervice');
const BCrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

class UserService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
        this.key = options.jwtKey;

    }

    createToken(id) {

        return JWT.sign({ id }, this.key, {
            algorithm: 'HS256',
            expiresIn: '1h'
        });
    }

    async hash(password) {

        return await BCrypt.hash(password,10);
    }

    async registerUser(email, password) {

        const pass = await this.hash(password);
        const user = (await this.server.mongo.db.collection('users').insertOne({ email: email.toLowerCase(),password: pass })).ops[0];
        const jwt = this.createToken(user._id);
        return jwt;
    }
}

module.exports = UserService;
