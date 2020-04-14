'use strict';
const handlers = require('../../handlers/project-handlers')

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
  path: '/projects/{projectID}',
  options: {
    handler: handlers.getProjectByID

  }
},
{
  method: 'GET',
path: '/projects/{projectID}/trained-model',
options: {
  handler: handlers.getTrainedModelbyProjectID
}
},
{
  method: 'POST',
path: '/projects/{projectID}/trained-model',
options: {
  handler: handlers.uploadTrainedModelbyProjectID
}
}
];
