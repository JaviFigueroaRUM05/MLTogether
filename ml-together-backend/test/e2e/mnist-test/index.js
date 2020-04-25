'use strict';

const MNISTTestInitializer = require('./test-initializer');
const MNISTTestWorker = require('./worker');

const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/' + PROJECT_ID + '/ir';

const runMNISTTest = async function () {

    await MNISTTestInitializer.initialize(PROJECT_ID, MODEL_HOST);
    await MNISTTestWorker.runWorker(PROJECT_ID, MODEL_HOST);
    // run worker
    // run server
};

runMNISTTest();

