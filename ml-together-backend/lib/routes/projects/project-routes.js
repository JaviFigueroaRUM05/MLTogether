'use strict';
const handlers = require('../../handlers/project-handlers')
const Joi = require('@hapi/joi')
//TODO: schema validation
module.exports = [
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
        }

];
