'use strict';

const Schmervice = require('schmervice');
const { MongoDBRequest } = require('../utils');

class IntermediateResultsService extends Schmervice.Service {

    async addToResults(projectId, modelId, model) {

        // TODO: Make it so it clones instead of appending the project id to the original payload
        const db = this.server.mongo.db;
        try {
            await model.save(new MongoDBRequest(db,'intermediateResults',modelId,projectId));

        }
        catch (err) {
            console.error(err);
            throw err;
        }

        return;
    }

    async getResultsIdsFromProject(projectId) {

        const db = this.server.mongo.db;
        const resultsIds = await db.collection('intermediateResults')
            .find({ projectId }).project({ _id: 0,  modelId: 1 }).toArray();
        
        console.log(resultsIds)

        return resultsIds;
    }

    async getLatestResultId(projectId) {

        const db = this.server.mongo.db;
        const result = await db.collection('intermediateResults')
            .find({ projectId }).project({ _id: 0, modelId: 1 }).sort({ _id: -1 }).limit(1).toArray();
        return result[0];
    }

    async getLatestResult(projectId) {

        const db = this.server.mongo.db;
        const result = await db.collection('intermediateResults')
            .find({ projectId }).project({ _id: 0 }).sort({ _id: -1 }).limit(1).toArray();
        return result[0];
    }

    async publishResultsIds(projectId) {

        const ids = this.getResultsIdsFromProject(projectId);
        await this.server.publish(`/models/${projectId}`, { modelIds: ids } );
    }

    async publishResultId(projectId) {

        const id = this.getLatestResultId(projectId);
        await this.server.publish(`/models/${projectId}`, { latestModelId: id } );
    }

    async clearProjectIntermediateResults(projectId) {

        const db = this.server.mongo.db;
        try {
            const collection = db.collection('intermediateResults');

            await collection.deleteMany({ projectId });
        }
        catch (err) {

            console.error(err);
        }
    }

}

module.exports = IntermediateResultsService;
