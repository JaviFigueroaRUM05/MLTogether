'use strict';

const IRRequest = require('../../../lib/plugins/intermediate-results/tfjs-io-handler');
const TF = require('@tensorflow/tfjs-node');
const Data = require('./server/data');
const Dotenv = require('dotenv');

Dotenv.config({ path: `${__dirname}/../../../server/.env` });


const PROJECT_ID = '5ed30d564c71605da9c81d58';
const HOST = process.env.HOST || 'localhost:3000';
const PORT = process.env.PORT || 3000;
const MODEL_HOST = `http://${HOST}:${PORT}/api/projects/${PROJECT_ID}/ir`;

const runMNISTTest = async function () {

    let model = null;
    try {
        model = await TF.loadLayersModel(
            IRRequest(`${MODEL_HOST}/latest`, '1')
        );
        await model.compile({
            optimizer: 'rmsprop',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }

    await Data.loadData();

    const { images: testImages, labels: testLabels } = Data.getTestData();
    const evalOutput = model.evaluate(testImages, testLabels);
    console.log(
        `\nEvaluation result:\n` +
        `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
        `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`);

    process.exit(0);

};

runMNISTTest();

