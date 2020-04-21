const Boom = require('boom');

//TODO: Error validation Boom
   async function getProjects(request, h) {
        const db = request.mongo.db;
        let projects;
        projects = await db.collection('projects').find().toArray();                  
            
        return h.response(projects).code(200);
        }
  
  async function getProjectByID(request,h){
        const db = request.mongo.db;
        const ObjectID= request.mongo.ObjectID;
        let project;
      
        project = await db.collection('projects').findOne({  _id: new ObjectID(request.params.projectId) });
      
        return h.response(project).code(200);
    }

    async function postTrainedModelbyProjectID(request,h){
        const db = request.mongo.db;
        const payload = request.payload;   
        //adding the pid         
        payload.projectId = request.params.projectId;
        let model;    
      
        model = await db.collection('trainedModels').insertOne(payload)
       
        return h.response(model).code(201);
    }

    async function getTrainedModelbyProjectID(request,h){
        const db = request.mongo.db;  
        let project;
        project = await db.collection('trainedModels').find({ projectId: request.params.projectId }).toArray();
      
        return h.response(project).code(200);
    }


    

  
module.exports= {
    getProjects,
    getProjectByID,
    postTrainedModelbyProjectID,
    getTrainedModelbyProjectID
}

