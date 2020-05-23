'use strict';

const MongoClient = require('mongodb').MongoClient;

const DB_NAME = 'mltest';
const URL = 'mongodb://localhost:27017';

const deleteAllFromCollection = async function (url, collectionName) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );

    if (!client) {
        return;
    }

    try {

        const db = client.db(DB_NAME);

        const collection = db.collection(collectionName);

        await collection.deleteMany();

    }
    catch (err) {

        console.error(err);
    }
};

const deleteTestUsers = async function () {

    await deleteAllFromCollection(URL, 'users');
};

const deleteTestProjects = async function () {

    await deleteAllFromCollection(URL, 'projects');
};



module.exports = {
    deleteTestUsers,
    deleteTestProjects
};
