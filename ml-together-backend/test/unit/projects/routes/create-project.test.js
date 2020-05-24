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

const { deleteTestUsers, deleteTestProjects, getTestProjects } = require('../../../utils/mongodb-manager');

const { experiment, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;

experiment('Create Project', () => {

    let server;
    let email;
    let password;
    let fullName;
    let token;
    let title;
    let description;
    let project;
    const createProjectRoute = '/projects';

    beforeEach( async () => {

        fullName = Faker.name.firstName() + ' ' + Faker.name.lastName();
        email = Faker.internet.email();
        password = Faker.internet.password(16, false);

        title = Faker.lorem.words(5);
        description = Faker.lorem.words(50);


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
        await deleteTestProjects();

        const { userService } = server.services();
        token = await userService.registerUser(fullName,email, password);

    });

    it('registers the Lib plugin.', () => {

        expect(server.registrations[LibPlugin.pkg.name]).to.exist();
    });

    it('creates a project successfully with correct payload', async () => {

        const payload = {
            title,
            description
        };

        let response;
        try {
            response = await server.inject({
                method: 'POST',
                url: createProjectRoute,
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

        expect(response.statusCode).to.be.equal(201);

        const projects = await getTestProjects();

        expect(projects[0]).to.include(['_id', 'title', 'description']);
        expect(projects[0].title).to.equal(title);
        expect(projects[0].description).to.equal(description);

    });

    it('returns unauthorized because of lack of token', async () => {


        let response;
        const payload = {
            title,
            description
        };
        try {
            response = await server.inject({
                method: 'POST',
                url: createProjectRoute,
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




