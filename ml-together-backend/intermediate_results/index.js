'use strict';
const Joi = require('@hapi/joi')
const handler = require('../intermediate_results/results-handlers')
exports.plugin = {

    name: 'IntermediateResults',
    version: '1.0.0',
    register: async (server, options) => {
        //TODO: better-format this plugin (separate elements)
        //TODO: review route definitions
        //TODO: Error handling
        server.route([
        {
            //testing
            method: 'GET',
            path: '/ir',
            handler: handler.getIRs
        },
        {
            method: 'GET',
            path: '/projects/{projectId}/ir/{mapResultsId}',
            
            handler: handler.GetIRByProjectID,
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
            handler: handler.createIR,
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
            handler: handler.removeProjectIRs,
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
                        
                }
            }
        }
    ]);
      
    }
};
