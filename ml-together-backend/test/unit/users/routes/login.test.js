'use strict';

// Load modules
// TODO: make the server creation part cleaner
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const LibPlugin = require('../../../../lib').plugin;
const Hapi = require('@hapi/hapi');
const Mongo = require('hapi-mongodb');
const Faker = require('faker');

const { deleteTestUsers } = require('../../../utils/mongodb-manager');

const { experiment, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;

experiment('Login Route', () => {

    let server;
    let email;
    let password;
    let fullName;
    const registerRoute = '/login';

    beforeEach( async () => {
        fullName = Faker.name.firstName() + ' ' + Faker.name.lastName();
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

        const { userService } = server.services();
        await userService.registerUser(fullName,email, password);

    });

    it('registers the Lib plugin.', () => {

        expect(server.registrations[LibPlugin.pkg.name]).to.exist();
    });

    it('logins successfully with correct credentials', async () => {

        const payload = {
            email,
            password
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

        expect(response.statusCode).to.be.equal(200);

        const result = JSON.parse(response.payload);

        expect(result).to.include('token_id');

    });

    it('returns unauthorized with incorrect password', async () => {

        let wrongPassword;
        do {
            wrongPassword = Faker.internet.password(16, false);
        } while (password === wrongPassword);

        const payload = {
            email,
            password: wrongPassword
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

        expect(response.statusCode).to.be.equal(401);

    });


});




