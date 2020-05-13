'use strict';

const handlers = require('../../handlers/project-handlers');
const Joi = require('@hapi/joi');
const Inert = require('@hapi/inert');
const Path = require('path');
const TF = require('@tensorflow/tfjs-node');

//TODO: schema validation
module.exports = [
    {
        method: 'GET',
        path: '/projects/{projectId}/workerfiles/{param*}',
        options: {
            handler: {
                directory: {
                    path: function (request) {

                        const projectId = request.params.projectId;
                        if (!request.params.param) {
                            return Path.join(__dirname,'../../../public/projects', projectId);
                        }

                        const paramParts = request.params.param.split('/');
                        if (paramParts[0] === 'images' || paramParts[0] === 'css') {
                            return Path.join(__dirname,'../../../public');

                        }

                        return Path.join(__dirname,'../../../public/projects', projectId);

                    },
                    redirectToSlash: true,
                    index: true
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/projects',
        options: {
            handler: handlers.getProjects
        }
    },
    {
        method: 'GET',
        path: '/projects/{projectId}',
        options: {
            handler: handlers.getProjectByID
        }
    },
    {
        method: 'GET',
        path: '/projects/{projectId}/trained-model',
        options: {
            handler: handlers.getTrainedModelbyProjectID
        }
    },
    {
        method: 'POST',
        path: '/projects/{projectId}/trained-model',
        handler: handlers.postTrainedModelbyProjectID,
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true
            },
            validate: {
                failAction: async (request, h, err) => {
                    //TODO: change this to appear in debug only
                    console.error(err);
                    throw err;
                },
                params:
                            Joi.object({
                                projectId: Joi.string()
                            })
                ,
                payload: Joi.object({
                    trainedModel: Joi.any()
                })
            }
        }
    },
    {
        method: 'DELETE',
        path: '/projects/{projectId}/queues',
        handler: handlers.deleteProjectTaskQueues,
        options: {
            validate: {
                failAction: (request, h, err) => {
                    //TODO: change this to appear in debug only
                    console.error(err);
                    throw err;
                },
                params:
                            Joi.object({
                                projectId: Joi.string()
                            })
                ,
                query: Joi.object({
                    all: Joi.bool()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/project/{projectId}/goal',
        options: {
            validate: {
                failAction: async (request, h, err) => {
                    //TODO: change this to appear in debug only
                    console.error(err);
                    throw err;
                },
                params:
                            Joi.object({
                                projectId: Joi.string()
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
                intermediateResultsService, scriptGeneratorService } = request.services();
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
    }

];
