'use strict';
const handlers = require('../../handlers/project-handlers')
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
}
];
