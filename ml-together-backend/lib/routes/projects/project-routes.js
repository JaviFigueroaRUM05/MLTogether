'use strict';

const handlers = require('../../handlers/project-handlers');
const Joi = require('@hapi/joi');
const Inert = require('@hapi/inert');
const Path = require('path');

//TODO: schema validation
module.exports = [
    {
        method: 'GET',
        path: '/projects/test/{param*}',
        options: {
            handler: {
                directory: {
                    path: './dist/',
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
    }

];
