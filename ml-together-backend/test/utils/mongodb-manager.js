'use strict';

const MongoClient = require('mongodb').MongoClient;

const DB_NAME = 'mltest';
const URL = 'mongodb://localhost:27017';


const storeToCollection = async function (url, collectionName, payload) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );
    let res = null;
    if (!client) {
        return;
    }

    try {

        // TODO: take this from a manifest or from env
        const db = client.db(DB_NAME);

        const collection = db.collection(collectionName);
        res = await collection.insertOne(payload);

    }
    catch (err) {

        console.error(err);
    }
    finally {

        client.close();
    }

    return res;
};

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

const getAllFromCollection = async function (url, collectionName) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch( (err) =>  console.error(err) );
    let res = null;
    if (!client) {
        return;
    }

    try {

        const db = client.db('mltest');

        const collection = db.collection(collectionName);
        res = await collection.find().toArray();

    }
    catch (err) {

        console.error(err);
    }
    finally {

        client.close();
    }

    return res;
};

const deleteTestUsers = async function () {

    await deleteAllFromCollection(URL, 'users');
};

const deleteTestProjects = async function () {

    await deleteAllFromCollection(URL, 'projects');
};

const deleteTestIntermediateResults = async function () {

    await deleteAllFromCollection(URL, 'intermediateResults');
};

const getTestUsers = async function () {

    return await getAllFromCollection(URL, 'users');
};

const getTestProjects = async function () {

    return await getAllFromCollection(URL, 'projects');
};

const getTestIntermediateProjects = async function () {

    return await getAllFromCollection(URL, 'intermediateResults');
};

const storeTestIntermediateResult = async function (payload) {

    return await storeToCollection(URL, 'intermediateResults', payload);

};





module.exports = {
    storeTestIntermediateResult,
    deleteTestUsers,
    deleteTestProjects,
    deleteTestIntermediateResults,
    getTestUsers,
    getTestProjects,
    getTestIntermediateProjects
};
