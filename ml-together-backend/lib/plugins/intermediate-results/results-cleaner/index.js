'use strict';

const MongoClient = require('mongodb').MongoClient;


const cleanIntermediateResultsDB = async function (url, projectId) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );

    if (!client) {
        return;
    }

    try {

        const db = client.db();

        const collection = db.collection('intermediateResults');

        await collection.deleteMany({ projectId });

    }
    catch (err) {

        console.error(err);
    }

};

module.exports = { cleanIntermediateResultsDB };
