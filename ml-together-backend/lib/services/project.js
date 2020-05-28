'use strict';

const Schmervice = require('schmervice');
const BCrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

class ProjectService extends Schmervice.Service {

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

    async createProject(title,description) {

        try {
            const project = (await this.server.mongo.db.collection('projects')
                .insertOne({ title, description })).ops[0];

            return project;
        }
        catch (err) {
            console.error(err);
            throw err;
        }

    }
}

module.exports = ProjectService;
