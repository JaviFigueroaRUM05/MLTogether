'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const MLTogetherServer = require('../../../server');
const Faker = require('faker');
const TF = require('@tensorflow/tfjs-node');
const IOHandlers = require('../../utils/io-handlers');
const ModelFn = require('./utils/test-model');
const MapFn = require('./utils/test-map');
const ReduceFn = require('./utils/test-reduce');
const FS = require('fs');
const Path = require('path');
const { deleteTestUsers, deleteTestProjects } = require('../../utils/mongodb-manager');

const {
    experiment,
    it,
    beforeEach,
    before,
    after
} = exports.lab = Lab.script();
const {
    expect
} = Code;

experiment('create Goal route', () => {


    let server;
    let projectId;
    let goalCreationRoute;
    let token;

    const title = Faker.lorem.word();
    const description = Faker.lorem.words(50);

    // Model Information
    const modelFn = ModelFn;
    const optimizer = 'rmsprop';
    const loss = ['categoricalCrossentropy'];
    const metrics = ['accuracy'];

    // Task Information
    const trainingSetSize = 100;
    const batchSize = 10;
    const batchesPerReduce = 10;
    const mapFn = MapFn;
    const reduceFn = ReduceFn;
    const trainDataUrl = Faker.internet.url();

    const payload = {
        title,
        description,
        model: {
            modelFn,
            optimizer,
            loss,
            metrics
        },
        taskInfo: {
            trainingSetSize,
            trainDataUrl,
            batchSize,
            batchesPerReduce,
            mapFn,
            reduceFn
        }
    };

    before( async () => {

        server = await MLTogetherServer.deployment(false);

        // Clean users collection & projects collection
        await deleteTestUsers();
        await deleteTestProjects();

        //TODO: Fix the confirm password thingy
        const registerRoute = '/api/register';

        const registerPayload = {
            fullName: "Juan Apellido",
            email: 'juan@upr.edu',
            password: 'Hello1234'
        };
        const registerRes = await server.inject({
            method: 'POST',
            url: registerRoute,
            payload: registerPayload
        });
        token = JSON.parse(registerRes.payload).token_id;
        console.log(registerRes);
        const createProjectRoute = '/api/projects';

        const createProjectPayload = {
            title: 'MNIST',
            description: 'Project for MNIST'
        };
        const createProjectRes = await server.inject({
            method: 'POST',
            url: createProjectRoute,
            payload: createProjectPayload,
            headers: {
                authorization: `${token}`
            }
        });
        projectId = JSON.parse(createProjectRes.payload)._id;
        goalCreationRoute = `/api/projects/${projectId}/goal`;
    });

    beforeEach( async () => {

        try {
            await server.inject({
                method: 'POST',
                url: goalCreationRoute,
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
    });

    it('can fetch initial model', async () => {

        TF.engine().startScope();
        const route = `/api/projects/${projectId}/ir/0`;
        const responseModel = await TF.loadLayersModel(
            IOHandlers.serverInjectRequest(server,route)
        );

        responseModel.compile({
            optimizer,
            loss,
            metrics
        });

        responseModel.dispose();


        TF.engine().endScope();

    });

    it('tasks are stored in the correspoding task queue', async () => {

        const { queueService }  = server.services();
        const task = await queueService.fetchTaskFromQueue(projectId, 5000);

        expect(task).to.be.an.object();
    });


    it('creates the Worker script', () => {

        const filePath = Path.join(__dirname, `../../tmp/public/projects/${projectId}/main.js`);
        expect(FS.existsSync(filePath)).to.be.true();
    });


    after( () => {

        FS.rmdirSync(Path.join(__dirname, '../../tmp'), { recursive: true });

    });
});
