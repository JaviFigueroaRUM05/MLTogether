'use strict';
const Joi = require('@hapi/joi')
exports.plugin = {

    name: 'IntermediateResults',
    version: '1.0.0',
    register: async (server, options) => {
        //TODO: better-format this plugin (separate elements)
        //TODO: review route definitions
        //TODO: Error validation Boom
        server.route([

        {

            //testing
            method: 'GET',
            path: '/ir',
            handler: async function (request, h) {
                const db = request.mongo.db;
                           
                return db.collection('intermediateResults').find().toArray();
            }
        },
        {
            method: 'GET',
            path: '/projects/{projectId}/ir/{mapResultsId}',
            
            handler: async function (request, h) {
                const db = request.mongo.db;               
                let project;

                project = await db.collection('intermediateResults').find({projectId: request.params.projectId,mapResultsId: request.params.mapResultsId }).toArray();
                    
                return h.response(project).code(200);
            },
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
            handler: async function (request, h) {
                const db = request.mongo.db;
                const payload = request.payload;   
                //adding the pid         
                payload.projectId = request.params.projectId;
               
                let results;
                //TODO: additional payload json validation
                    
                console.log(request.payload)
                results = await db.collection('intermediateResults').insertOne(payload);
                   
        
                return h.response(results).code(201);
            },
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
                            results: Joi.string()
                        })
                }
            }
        }
    ]);



      
    }
};
