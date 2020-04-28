'use strict';

import {Client} from '@hapi/nes/lib/client'
import {ModelManager} from './model-manager/index';
import * as Axios from 'axios';
import * as TaskHandler from './task-handler/index'

const sendResults = async function (nesClient, results) {

    const resultsPayload = JSON.stringify(results);
    const resultsSentAnswer = await nesClient.message(resultsPayload);
    return resultsSentAnswer;
};


const runWorker = async function (projectId, modelHost) {

    const nesClient = new Client('ws://localhost:3000');
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
const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/' + PROJECT_ID + '/ir';
runWorker(PROJECT_ID,MODEL_HOST);
