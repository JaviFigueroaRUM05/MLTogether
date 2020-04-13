const Boom = require('boom');


   async function getProjects(request, h) {
            const db = request.mongo.db;
            let projects;
            try{
            projects = await db.collection('projects').find().toArray();
            } catch(err){
                console.error(err)
                throw Boom.badImplementation('Error');
            }

            return h.response(projects).code(200);
          }
  
  async function getProjectByID(request,h){
        const db = request.mongo.db;
        const ObjectID= request.mongo.ObjectID;
        let project;
        try{
            project = await db.collection('projects').findOne({  _id: new ObjectID(request.params.projectId) });
            } catch(err){
                console.error(err)
                throw Boom.badImplementation('Error');
            }

            return h.response(project).code(200);
          }


    

  
module.exports= {
    getProjects,
    getProjectByID  
}
