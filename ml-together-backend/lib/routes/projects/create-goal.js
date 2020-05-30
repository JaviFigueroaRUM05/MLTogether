'use strict';

const TF = require('@tensorflow/tfjs-node');
const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');
const { goalModel, ErrorsOnPostOutputValidations, HeadersPayLoad } = require('../../utils/response-models');
const _ = require('lodash');


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
            headers: HeadersPayLoad,
            params: Joi.object({
                projectId: Joi.string().required().description('The ID of a previously created project')
            })
            ,
            payload: goalModel,
        },
        response: _.merge({}, ErrorsOnPostOutputValidations, {
            status: {
                200: Joi.object({ status: Joi.string().required().description('HTTP Status Code').equal('ok') })
            }
        })
    },
    handler: async (request, h) => {

        const { taskService, queueService,
            intermediateResultsService, scriptGeneratorService } = request.services(true);
        const port = request.server.info.port;
        const projectId = request.params.projectId;



        // Create and save tasks
        const host = h.realm.pluginOptions.modelUrl;
        const modelHost = `http://mltogether.com/api/projects/${projectId}/ir`;
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
