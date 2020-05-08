'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Schmervice = require('schmervice');
const Faker = require('faker');
const TaskService = require('../../../../lib/plugins/task-broker/services/task');

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

experiment('TaskService', () => {

    experiment('Deployment', () => {

        let server;
        beforeEach(async () => {

            server = Hapi.server();
            await server.register({
                plugin: Schmervice
            });

            await server.registerService(TaskService);
        });

        it('registers the TaskService.', () => {



            expect(server.services().taskService).to.exist();
        });


    });

    experiment('createMapTask', () => {


        let server;
        before(async () => {

            server = Hapi.server();
            await server.register({
                plugin: Schmervice
            });

            await server.registerService(TaskService);
        });

        it('creates map task sucessfully', () => {

            const { taskService } = server.services();
            const mapResultsId = Faker.random.number();
            const modelURL = Faker.internet.url();
            const dataStart = Faker.random.number({ min: 0, max: 30 });
            const dataEnd = Faker.random.number({ min: 30, max: 60 });

            const task = taskService.createMapTask(mapResultsId, modelURL, dataStart, dataEnd);
            expect(task).to.include(['function', 'dataStart', 'dataEnd',
                'mapResultsId', 'modelURL']);
        });
        it('throws error when dataStart > dataEnd', () => {

            const { taskService } = server.services();
            const mapResultsId = Faker.random.number();
            const modelURL = Faker.internet.url();
            const dataStart = 60;
            const dataEnd = 30;
            const func = taskService.createMapTask.bind(this,mapResultsId, modelURL,
                dataStart, dataEnd);
            expect(func).to.throw(RangeError,
                `dataStart-> ${dataStart} is greater than dataEnd -> ${dataEnd}`);

        });

    });

    experiment('createReduceTask', () => {

        let server;
        before(async () => {

            server = Hapi.server();
            await server.register({
                plugin: Schmervice
            });

            await server.registerService(TaskService);
        });

        it('creates reduce task sucessfully', () => {

            const { taskService } = server.services();
            const mapResultsId = Faker.random.number();
            const modelURL = Faker.internet.url();
            const modelStoringURL = Faker.internet.url();
            const modelStoringId = Faker.random.number();
            const numberOfBatches = Faker.random.number();

            const task = taskService.createReduceTask(mapResultsId,
                modelURL, modelStoringURL, modelStoringId,numberOfBatches);
            expect(task).to.include(['function', 'modelStoringURL',
                'modelStoringId', 'mapResultsId', 'modelURL',
                'numberOfBatches']);
        });
    });

    experiment('createTasks', () => {

        let server;
        before(async () => {

            server = Hapi.server();
            await server.register({
                plugin: Schmervice
            });

            await server.registerService(TaskService);
        });

        it('creates tasks sucessfully with multiple maps and 1 reduce', () => {

            const { taskService } = server.services();
            const trainingSetSize = 5000;
            const batchSize = 100;
            const batchesPerReduce = trainingSetSize / batchSize;
            const modelURLRoot = Faker.internet.url();

            const numberOfMapTasks = trainingSetSize / batchSize;

            const tasks = taskService.createTasks(trainingSetSize,
                batchSize, batchesPerReduce, modelURLRoot);
            expect(tasks).to.be.an.instanceOf(Array);
            expect(tasks).to.have.length(numberOfMapTasks + 1);
            for (let i = 0; i < numberOfMapTasks; ++i) {
                const task = tasks[i];
                expect(task.function).to.equal('map');
            }

            const lastTask = tasks[numberOfMapTasks];
            expect(lastTask.function).to.equal('reduce');
            expect(lastTask.numberOfBatches).to.equal(numberOfMapTasks);
        });

        it('creates tasks sucessfully with multiple maps and multiple reduce', () => {

            const { taskService } = server.services();
            const trainingSetSize = 5000;
            const batchSize = 100;
            const batchesPerReduce = 10;
            const modelURLRoot = Faker.internet.url();

            const numberOfMapTasks = trainingSetSize / batchSize;
            const numberOfReduceTasks = numberOfMapTasks / batchesPerReduce;

            const tasks = taskService.createTasks(trainingSetSize,
                batchSize, batchesPerReduce, modelURLRoot);
            expect(tasks).to.be.an.instanceOf(Array);
            expect(tasks).to.have.length(numberOfMapTasks + numberOfReduceTasks);
        });

        it('throws error if trainingSetSize is 0', () => {

            const { taskService } = server.services();
            const trainingSetSize = 0;
            const batchSize = 100;
            const batchesPerReduce = trainingSetSize / batchSize;
            const modelURLRoot = Faker.internet.url();

            const func = taskService.createTasks.bind(this,trainingSetSize,
                batchSize, batchesPerReduce, modelURLRoot);
            expect(func).to.throw(RangeError, 
                `trainingSetSize => ${trainingSetSize} has to be above 0`);
        });

        it('throws error if batchSize is 0', () => {

            const { taskService } = server.services();
            const trainingSetSize = 5000;
            const batchSize = 0;
            const batchesPerReduce = trainingSetSize / batchSize;
            const modelURLRoot = Faker.internet.url();

            const func = taskService.createTasks.bind(this,trainingSetSize,
                batchSize, batchesPerReduce, modelURLRoot);
            expect(func).to.throw(RangeError, 
                `batchSize => ${batchSize} has to be above 0`);
        });

        it('throws error if batchesPerReduce is 0', () => {

            const { taskService } = server.services();
            const trainingSetSize = 5000;
            const batchSize = 100;
            const batchesPerReduce = 0;
            const modelURLRoot = Faker.internet.url();

            const func = taskService.createTasks.bind(this,trainingSetSize,
                batchSize, batchesPerReduce, modelURLRoot);
            expect(func).to.throw(RangeError,
                `batchesPerReduce => ${batchesPerReduce} has to be above 0`);
        });

        it('throws error if batchSize > trainingSetSize', () => {

            const { taskService } = server.services();
            const trainingSetSize = 5000;
            const batchSize = trainingSetSize + 1;
            const batchesPerReduce = 50;
            const modelURLRoot = Faker.internet.url();

            const func = taskService.createTasks.bind(this,trainingSetSize,
                batchSize, batchesPerReduce, modelURLRoot);
            expect(func).to.throw(RangeError,
                `batchSize => ${batchSize} has to be less than trainingSetSize => ${batchesPerReduce}`);
        });
        it('throws error if numberOfBatches < batchesPerReduce', () => {

            const { taskService } = server.services();
            const trainingSetSize = 5000;
            const batchSize = 100;

            const numberOfBatches = trainingSetSize / batchSize;

            const batchesPerReduce = numberOfBatches + 1;
            const modelURLRoot = Faker.internet.url();

            const func = taskService.createTasks.bind(this,trainingSetSize,
                batchSize, batchesPerReduce, modelURLRoot);
            expect(func).to.throw(RangeError,
                `batchesPerReduce => ${batchesPerReduce} has to be less or equal than trainingSetSize / batchSize => ${numberOfBatches}`);
        });
    });


// End of TaskService experiment
});

