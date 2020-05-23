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
            pre: [
                {method: handlers.verifyProject}
            ],
            validate: {
                params: Joi.object({
                    projectId: Joi.string().description('project id which the worker is from'),
                    param: Joi.any().description('the file or directory you are looking for').optional()
                })
            },
            description: 'Get a worker file',
            notes: 'Returns a file for the current goal given the project id and the file.',
            tags: ['api'],
            handler: {
                directory: {
                    path: function (request) {
                        // TODO: Check if project exists
                        const projectId = request.params.projectId;
                        const paramParts = request.params.param.split('/');
                        let path;
                        switch (paramParts[0]) {
                            case 'images':
                            case 'css':
                            case '':
                                path = Path.join(__dirname,'../../../public');
                                break;
                            default:
                                path = Path.join(__dirname,'../../../public', projectId);
                        }

                        return path;
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
            description: 'Get all projects',
            notes: 'Returns a file for the current goal given the project id and the file.',
            tags: ['api'],
            handler: handlers.getProjects

        }
    },
    {
        method: 'POST',
        path: '/projects',
        options: {
            description: 'Create a project',
            auth: 'jwt',
            tags: ['api'],
            handler: handlers.postProject,

        }
    },
    {
        method: 'GET',
        path: '/projects/{projectId}',
        options: {
            pre: [
                {method: handlers.verifyProject}
            ],
            auth: 'jwt',
            handler: handlers.getProjectByID,
            validate: {
                params: Joi.object({
                    projectId: Joi.string()                   
                })
            },
        }
    },
    {
        method: 'GET',
        path: '/projects/owner',
        options: {
            auth: 'jwt',
            handler: handlers.getProjectsByOwner
        }
    },
    {
        method: 'GET',
        path: '/projects/{projectId}/trained-model',
        options: {
            pre: [
                {method: handlers.verifyProject}
            ],
            auth: 'jwt',
            handler: handlers.getTrainedModelbyProjectID,
            validate: {
                params: Joi.object({
                    projectId: Joi.string()                   
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/projects/{projectId}/trained-model',
        handler: handlers.postTrainedModelbyProjectID,
        options: { pre: [
            {method: handlers.verifyProject}
        ],
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
            pre: [
                {method: handlers.verifyProject}
            ],
            
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
            auth: 'jwt',
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
    }

];
