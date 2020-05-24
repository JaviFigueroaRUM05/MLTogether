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

experiment('Get Project', () => {

    let server;
    let email;
    let password;
    let fullName;
    let token;
    let title;
    let description;
    let project;
    let getProjectRoute;

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

        const { userService, projectService } = server.services();
        token = await userService.registerUser(fullName,email, password);
        project = await projectService.createProject(title, description);
        getProjectRoute = `/projects/${project._id}`;

    });

    it('registers the Lib plugin.', () => {

        expect(server.registrations[LibPlugin.pkg.name]).to.exist();
    });

    it('gets a project successfully with existing project id', async () => {

        let response;
        try {
            response = await server.inject({
                method: 'GET',
                url: getProjectRoute
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        expect(response.statusCode).to.be.equal(200);

        const projects = await getTestProjects();

        expect(projects[0]).to.include(['_id', 'title', 'description']);
        expect(projects[0].title).to.equal(title);
        expect(projects[0].description).to.equal(description);

    });

    it('returns not found when project does not exist', async () => {

        const nonexistantProjectId = Faker.random.alphaNumeric(12);

        const getNonexistantProjectRoute = `/projects/${nonexistantProjectId}`;

        console.log(nonexistantProjectId);
        let response;
        try {
            response = await server.inject({
                method: 'GET',
                url: getNonexistantProjectRoute
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }

        expect(response.statusCode).to.be.equal(404);


    });
});




