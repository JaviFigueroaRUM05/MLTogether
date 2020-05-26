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

experiment('Change Password', () => {

    let server;
    let email;
    let password;
    let fullName;
    let newpassword;
    let token;
    const changepass = '/user/changepass';

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
        token = await userService.registerUser(fullName,email, password);

    });

    it('registers the Lib plugin.', () => {

        expect(server.registrations[LibPlugin.pkg.name]).to.exist();
    });

    it('changes password succesfully', async () => {

        newpassword = Faker.internet.password(16, false);
        const oldpassword = password;
        const payload = {
            oldpassword,
            newpassword
        };

        let response;
        try {
            response = await server.inject({
                method: 'POST',
                url: changepass,
                payload,
                headers: {
                    authorization: `${token}`
                }
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        expect(response.statusCode).to.be.equal(200);

        const users = await getTestUsers();

        expect(BCrypt.compareSync(newpassword, users[0].password)).to.be.true();


    });

    it('returns unauthorized because of lack of token', async () => {

        newpassword = Faker.internet.password(16, false);
        const oldpassword = password;
        const payload = {
            oldpassword,
            newpassword
        };

        let response;
        try {
            response = await server.inject({
                method: 'POST',
                url: changepass,
                payload
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        expect(response.statusCode).to.be.equal(401);


    });

    it('original password does not match the one in the database', async () => {

        newpassword = Faker.internet.password(16, false);
        const oldpassword = Faker.internet.password(16, false);
        const payload = {
            oldpassword,
            newpassword
        };

        let response;
        try {
            response = await server.inject({
                method: 'POST',
                url: changepass,
                payload,
                headers: {
                    authorization: `${token}`
                }
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        expect(response.statusCode).to.be.equal(400);


    });



});




