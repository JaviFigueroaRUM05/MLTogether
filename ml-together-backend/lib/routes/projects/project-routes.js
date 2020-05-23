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
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true
            },

        }
    },
    {
        method: 'GET',
        path: '/projects/{projectId}',
        options: {
            pre: [
                {method: handlers.verifyProject}
            ],
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
    }

];
