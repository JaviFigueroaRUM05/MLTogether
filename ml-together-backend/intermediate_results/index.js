'use strict';

const Joi = require('@hapi/joi');
const Handler = require('../intermediate_results/results-handlers');

exports.plugin = {

    name: 'IntermediateResults',
    version: '1.0.0',
    register: async (server, options) => {
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
                path: '/projects/{projectId}/ir/{mapResultsId}',

                handler: Handler.GetIRByProjectID,
                options: {
                    validate: {
                        params: Joi.object({
                            mapResultsId: Joi.number(),
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
                            mapResultsId: Joi.number(),
                            results: Joi.any()
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
