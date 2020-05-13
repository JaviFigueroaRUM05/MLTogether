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
    const projectId = 'testproject';
    const goalCreationRoute = `/project/${projectId}/goal`;

    const title = Faker.lorem.word();
    const description = Faker.lorem.words(50);

    // Model Information
    const modelFn = ModelFn;
    const optimizer = 'rmsprop';
    const loss = 'categoricalCrossentropy';
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

    let response;

    beforeEach( async () => {

        server = await MLTogetherServer.deployment(false);

        // Create user
        // Auth
        // Create a project
        try {
            response = await server.inject({
                method: 'POST',
                url: goalCreationRoute,
                payload
            });
        }
        catch (err) {
            console.error(err);
            return false;
        }
    });

    it('can fetch initial model', async () => {

        TF.engine().startScope();
        const route = `/projects/${projectId}/ir/0`;
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


    it('creates the Worker script via websocket');

});

experiment('create Goal route does not keep old information from previous Goal', () => {

    it('deletes tasks from previous Goal');
    it('replaces the old Worker script via websocket');


});

experiment('create Goal route error handling', () => {

    it('returns 400 if missing information');

})