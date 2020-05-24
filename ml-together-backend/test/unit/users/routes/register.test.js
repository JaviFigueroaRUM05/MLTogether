'use strict';

// Load modules
// TODO: make the server creation part cleaner
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const LibPlugin = require('../../../../lib').plugin;
const Hapi = require('@hapi/hapi');
const Mongo = require('hapi-mongodb');
const Faker = require('faker');
const BCrypt = require('bcrypt');

const { deleteTestUsers, getTestUsers } = require('../../../utils/mongodb-manager');

const { experiment, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;

experiment('Register Route', () => {

    let server;
    let email;
    let password;
    const registerRoute = '/register';

    beforeEach( async () => {

        email = Faker.internet.email();
        password = Faker.internet.password(16, false);
        server = Hapi.server();

        await server.register({
            plugin: Mongo,
            options: {
                settings: {
                    poolSize: 10,
                    useUnifiedTopology: true
                },
                decorate: true,
                url: 'mongodb://localhost:27017/mltest'
            } });
        await server.register({
            plugin: LibPlugin,
            options: {
                jwtKey: 'APP_SECRET'
            }
        });

        await deleteTestUsers();

    });

    it('registers the Lib plugin.', () => {

        expect(server.registrations[LibPlugin.pkg.name]).to.exist();
    });

    it('registers successfully with correct payload', async () => {

        const payload = {
            email,
            password,
            confirmPassword: password
        };
        let response;
        try {
            response = await server.inject({
                method: 'POST',
                url: registerRoute,
                payload
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        expect(response.statusCode).to.be.equal(201);

        const result = JSON.parse(response.payload);

        expect(result).to.include('token_id');

        const users = await getTestUsers();

        expect(users[0]).to.include(['_id', 'email', 'password']);
        expect(BCrypt.compareSync(password, users[0].password)).to.be.true();


    });


});




