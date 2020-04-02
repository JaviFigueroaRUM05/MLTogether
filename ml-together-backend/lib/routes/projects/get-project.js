'use strict';

module.exports = {
  method: 'GET',
  path: '/projects/{projectId}',
  options: {
    handler: async (request, h) => {
      //Sample of what projects MongoDB might return
      //TODO: add validators actual functionality with the DB 
      return {
        project: {
          id: request.params.projectId,
          name: "sample project",
          description: "this is a project",
          //save a file ? 
          model: 'model script',
          functions:{
            //not save as string
            map: 'const map = (n) => { var result = 1; return result;}',

            reduce: "reduce"
            },
          data: {
            url: "www.dataserver.com",
            apikey: "ABCDEFGHIJK"
          },
          brokerconfig: {
              chunksize: 2,
              datalength: 5,
          },
                   
        }
      }
    }
  }

};