'use strict';

const MNISTTestInitializer = require('./test-initializer');
const MNISTTestWorker = require('./worker');
const IRRequest = require('../../../lib/plugins/intermediate-results/tfjs-io-handler');
const TF = require('@tensorflow/tfjs-node');
const Data = require('./server/data');

const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/' + PROJECT_ID + '/ir';

const runMNISTTest = async function () {

    await MNISTTestInitializer.initialize(PROJECT_ID, MODEL_HOST);
    await MNISTTestWorker.runWorker(PROJECT_ID, MODEL_HOST);
    let model = null;
    try {
        model = await TF.loadLayersModel(
            IRRequest(`${MODEL_HOST}/2`, '2')
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

