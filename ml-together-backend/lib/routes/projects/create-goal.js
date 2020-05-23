'use strict';

const TF = require('@tensorflow/tfjs-node');
const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');


module.exports = {
    method: 'POST',
    path: '/project/{projectId}/goal',
    options: {
        pre: [
            { method: verifyProject }
        ],
        validate: {
            failAction: async (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            params: Joi.object({
                projectId: Joi.string().required()
            })
            ,
            payload: Joi.object({
                title: Joi.string().required(),
                description: Joi.string().optional(),
                model: Joi.object({
                    modelFn: Joi.string().required(),
                    optimizer: Joi.string().required(),
                    loss: Joi.string().required(),
                    metrics: Joi.array().items(Joi.string()).required()
                }).required(),
                taskInfo: Joi.object({
                    trainingSetSize: Joi.number().required(),
                    batchSize: Joi.number().required(),
                    batchesPerReduce: Joi.number().required(),
                    trainDataUrl: Joi.string().uri().required(),
                    mapFn: Joi.string().required(),
                    reduceFn: Joi.string().required()
                }).required()
            })
        }
    },
    handler: async (request, h) => {

        const { taskService, queueService,
            intermediateResultsService } = request.services();
        const { scriptGeneratorService } = request.services(true);
        const host = request.server.info.host;
        const port = request.server.info.port;
        const projectId = request.params.projectId;



        // Create and save tasks
        const modelHost = `http://${host}:${port}/projects/${projectId}/ir`;
        const taskInfo = request.payload.taskInfo;
        const { trainingSetSize, batchSize, batchesPerReduce } = taskInfo;

        const queueNames = await queueService
            .getProjectQueueNames(projectId);
        await queueService.deleteQueues(queueNames);

        const tasks = taskService.createTasks(trainingSetSize, batchSize,
            batchesPerReduce, modelHost);

        await queueService.addTasksToQueues(projectId,tasks);

        // Save model
        const { modelFn } = request.payload.model;

        const modelFunction = new Function('TF',modelFn);
        const model = modelFunction(TF);
        await intermediateResultsService.addToResults(projectId, '0', model);

        // Generate Script
        const { mapFn, reduceFn, trainDataUrl } = taskInfo;
        await scriptGeneratorService.initializeProject(projectId);
        //await scriptGeneratorService.generateIndexHTML(projectId);
        await scriptGeneratorService
            .generateWorkerScript(projectId, mapFn,reduceFn, trainDataUrl);


        return h.response({ status: 'ok' }).code(200);
    }
};
