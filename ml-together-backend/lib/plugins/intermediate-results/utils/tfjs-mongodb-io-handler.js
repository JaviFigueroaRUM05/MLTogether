'use strict';

const { ab2str } = require('./array-buffer');

class MongoDBRequest {
    constructor(db, collection, modelId, projectId) {

        this.db = db;
        this.collection = collection;
        this.modelId = modelId;
        this.projectId = projectId;
    }

    async retrySave(form) {

        try {

            const collection = this.db.collection(this.collection);
            await collection.insertOne(form);

        }
        catch (err) {

            console.error(err);
            return false;
        }

        return true;

    }

    async save(modelArtifacts) {

        let model;
        let form;
        let weightDataAb2;
        let formCreated = false;
        while (!formCreated) {
            try {
                weightDataAb2 = ab2str(modelArtifacts.weightData);
                model = JSON.stringify([modelArtifacts.modelTopology, weightDataAb2, modelArtifacts.weightSpecs]);
                form = { model, modelId: this.modelId, projectId: this.projectId };
                formCreated = true;



            }
            catch (e) {
                console.error('Error creating form (saving model): ' + e);
                console.error(e);
            }
        }

        let tries = 0;
        const maxTries = 2;
        let saved = await this.retrySave(form);
        while (!saved && tries < maxTries) {
            saved = await this.retrySave(form);
            ++tries;
        }
    }

    tryToLoad() {

        throw new Error('not implemented');

    }


    load() {

        throw new Error('not implemented');
    }
}

module.exports = MongoDBRequest;
