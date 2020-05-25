'use strict';

const TF = require('@tensorflow/tfjs-node');
const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');
const { goalModel } = require('../../utils/response-models');


module.exports = {
    method: 'POST',
    path: '/projects/{projectId}/goal',
    options: {
        pre: [
            { method: verifyProject }
        ],
        description: 'Creates a goal for a given project',
        notes: 'Creates a goal for a given project. For more detailed information on how to use this route, visit https://www.notion.so/manuelbg/Goal-Creation-6892ecdc40fc43b8ba9eac555be39c42',
        auth: 'jwt',
        tags: ['api', 'goals'],
        validate: {
            failAction: async (request, h, err) => {

                console.error(err);
                throw err;
            },
            headers: Joi.object({
                authorization: Joi.string().required()
            }).unknown(),
            params: Joi.object({
                projectId: Joi.string().required()
            })
            ,
            payload: goalModel
        }
    },
    handler: async (request, h) => {

        const { taskService, queueService,
            intermediateResultsService, scriptGeneratorService } = request.services(true);
        const host = request.server.info.host;
        const port = request.server.info.port;
        const projectId = request.params.projectId;



        // Create and save tasks
        const modelHost = `http://${host}:${port}/api/projects/${projectId}/ir`;
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
        await intermediateResultsService.addToResults(projectId, '1', model);

        // Generate Script
        const { mapFn, reduceFn, trainDataUrl } = taskInfo;
        await scriptGeneratorService.initializeProject(projectId);
        //await scriptGeneratorService.generateIndexHTML(projectId);
        await scriptGeneratorService
            .generateWorkerScript(projectId, mapFn,reduceFn, trainDataUrl);


        return h.response({ status: 'ok' }).code(200);
    }
};
