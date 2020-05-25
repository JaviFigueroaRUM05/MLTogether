'use strict';

const Joi = require('@hapi/joi');
const Handler = require('./results-handlers');
const Nes = require('nes');
const Mongo = require('hapi-mongodb');
const Schmervice = require('schmervice');
const IntermediateResultsService = require('./services/intermediate-results');

exports.plugin = {

    name: 'IntermediateResults',
    version: '1.0.0',
    register: async (server, options) => {

        try {
            await server.register({
                plugin: Schmervice
            });

            await server.registerService(IntermediateResultsService);
            server.dependency('hapi-mongodb');
            server.dependency('nes');

            try {

                server.subscription('/models/{projectId}', {
                    onSubscribe: async function (socket, path, params) {

                        try {
                            const { intermediateResultsService } = server.services();
                            const projectId = params.projectId;
                            const ids = await intermediateResultsService.getResultsIdsFromProject(projectId);
                            await socket.publish(`/models/${projectId}`,{ modelIds: ids });
                        }
                        catch (err) {
                            console.error(err);
                        }

                    }
                });
            }
            catch (err) {
                console.warn('No Nes plugin has been detected while registering Intermediate Results, not registering \'/models/{projectId}\'. ');
            }


        }
        catch (err) {

            console.error(err);
            process.exit(1);
        }

        //TODO: better-format this plugin (separate elements)
        //TODO: review route definitions
        //TODO: Error handling
        await server.route([
            {
            //testing
                method: 'GET',
                path: '/ir',
                handler: Handler.getIRs
            },
            {
                method: 'GET',
                path: '/projects/{projectId}/ir/{modelId}',

                handler: Handler.GetIRByProjectID,
                options: {
                    validate: {
                        params: Joi.object({
                            modelId: Joi.string(),
                            projectId: Joi.string()
                        })
                    }
                }
            },
            {
                method: 'POST',
                path: '/projects/{projectId}/ir',
                handler: Handler.createIR,
                options: {
                    payload: {
                        output: 'stream',
                        parse: true,
                        allow: 'multipart/form-data',
                        multipart: true,
                        maxBytes: 100 * 1024 * 1024 //100 mb
                    },
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
                        payload: Joi.object({
                            modelId: Joi.string(),
                            model: Joi.any()
                        })
                    }
                }


            },

            {
                method: 'DELETE',
                path: '/projects/{projectId}/ir',
                //delete all intermediate results linked to a project
                handler: Handler.removeProjectIRs,
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

                    }
                }
            }
        ]);

    }
};
