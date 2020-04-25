'use strict';

const Nes = require('nes');
const ModelManager = require('./model-manager');
const Axios = require('axios');
const TaskHandler = require('./task-handler');

const sendResults = async function (nesClient, results) {

    const resultsPayload = JSON.stringify(results);
    const resultsSentAnswer = await nesClient.message(resultsPayload);
    return resultsSentAnswer;
};


const runWorker = async function (projectId, modelHost) {

    const nesClient = new Nes.Client('ws://localhost:3000');
    await nesClient.connect();
    const modelManager = new ModelManager(modelHost);


    // Work Loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const task = await TaskHandler.getTask(projectId, nesClient);
        const taskResults = await TaskHandler.completeTask(task, modelManager, projectId);

        if (taskResults === null) {
            break;
        }

        const resultsSentAnswer = await sendResults(nesClient, taskResults);
    }

    const response = await Axios.get(`http://localhost:3000/projects/${projectId}/ir/2`);

    console.log('No more work!');
};

module.exports = { runWorker };
