const Boom = require('boom');

//TODO: Error validation Boom
   async function getIRs(request, h) {
        const db = request.mongo.db;
        let projects;
        projects = await db.collection('intermediateResults').find().toArray();                  
            
        return h.response(projects).code(200);
        }
  
  async function GetIRByProjectID(request,h){
        const db = request.mongo.db;               
        let results;

        results = await db.collection('intermediateResults').find({projectId: request.params.projectId,mapResultsId: request.params.mapResultsId }).toArray();
        
    return h.response(results).code(200);
    }

    async function createIR(request,h){
        const db = request.mongo.db;
        const payload = request.payload;   
        //adding the pid         
        payload.projectId = request.params.projectId;
         let results;
         //TODO: additional payload json validation
             
         console.log(request.payload)
         results = await db.collection('intermediateResults').insertOne(payload);
            
 
         return h.response(results).code(201);
    }

    async function removeProjectIRs(request,h){
        const db = request.mongo.db;           
        let results;
        //TODO: additional payload json validation
            
       
        results = await db.collection('intermediateResults').deleteMany({projectId: request.params.projectId});
           

        return h.response(results).code(200);
    }


    

  
module.exports= {
    getIRs,
    GetIRByProjectID,
    createIR,
    removeProjectIRs
}