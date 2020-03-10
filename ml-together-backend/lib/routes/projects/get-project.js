'use strict';

module.exports = {
  method: 'GET',
  path: '/projects/{projectId}',
  options: {
    handler: async (request, h) => {
      return {
        project: {
          id: request.params.projectId,
          description: "Hey there"
        }
      }
    }
  }
};