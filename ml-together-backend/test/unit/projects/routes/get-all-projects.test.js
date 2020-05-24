'use strict';

// Load modules
// TODO: make the server creation part cleaner
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const LibPlugin = require('../../../../lib').plugin;
const Hapi = require('@hapi/hapi');
const Mongo = require('hapi-mongodb');
const Faker = require('faker');

const { deleteTestUsers, deleteTestProjects, getTestProjects } = require('../../../utils/mongodb-manager');

const { experiment, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;

experiment('Get Projects', () => {

    let server;
    let email;
    let password;
    let fullName;
    let title1;
    let description1;
    let title2;
    let description2;
    let getProjectsRoute;

    beforeEach( async () => {

        fullName = Faker.name.firstName() + ' ' + Faker.name.lastName();
        email = Faker.internet.email();
        password = Faker.internet.password(16, false);

        title1 = Faker.lorem.words(5);
        description1 = Faker.lorem.words(50);
        title2 = Faker.lorem.words(5);
        description2 = Faker.lorem.words(50);


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

        const { userService, projectService } = server.services();
        await userService.registerUser(fullName,email, password);
        await projectService.createProject(title1, description1);
        await projectService.createProject(title2, description2);
        getProjectsRoute = `/projects`;

    });

    it('registers the Lib plugin.', () => {

        expect(server.registrations[LibPlugin.pkg.name]).to.exist();
    });

    it('gets both projects successfully', async () => {

        let response;
        try {
            response = await server.inject({
                method: 'GET',
                url: getProjectsRoute
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        expect(response.statusCode).to.be.equal(200);

        const projects = await getTestProjects();
        expect(projects).to.have.length(2);
        expect(projects[0]).to.include(['_id', 'title', 'description']);
        expect(projects[0].title).to.equal(title1);
        expect(projects[0].description).to.equal(description1);
        expect(projects[1].title).to.equal(title2);
        expect(projects[1].description).to.equal(description2);

    });
});




