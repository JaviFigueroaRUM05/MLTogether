'use strict';


module.exports = {
    method: 'GET',
    path: '/projects/owner',
    options: {
        auth: 'jwt',
        handler: async function (request,h) {

            const db = request.mongo.db;
            const ObjectID = request.mongo.ObjectID;
            const userID = request.auth.credentials.id;
            const projects = await db.collection('projects').find({ userID: new ObjectID(userID) }).toArray();

            return h.response(projects).code(200);
        }
    }
};
