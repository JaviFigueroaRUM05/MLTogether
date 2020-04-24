'use strict';

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';


const cleanIntermediateResultsDB = async function () {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );

    if (!client) {
        return;
    }

    try {

        const db = client.db('mldev01');

        const collection = db.collection('intermediateResults');

        await collection.deleteMany();

    }
    catch (err) {

        console.error(err);
    }

};

module.exports = { cleanIntermediateResultsDB };
