/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
const TF = require('@tensorflow/tfjs-node');
const Model = require('./server/model');
const IRRequest = require('../../../lib/plugins/intermediate-results/tfjs-io-handler');
const PROJECT_ID = '5ed30d564c71605da9c81d58';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const MODEL_HOST = `http://${HOST}:${PORT}/api/projects/${PROJECT_ID}/ir`;
// This is a helper class for loading and managing MNIST Data specifically.
// It is a useful example of how you could create your own Data manager class
// for arbitrary Data though. It's worth a look :)
const Data = require('./server/data');

async function train() {
    await Data.loadData();
  // Now that we've defined our model, we will define our optimizer. The
  // optimizer will be used to optimize our model's weight values during
  // training so that we can decrease our training loss and increase our
  // classification accuracy.

  // We are using rmsprop as our optimizer.
  // An optimizer is an iterative method for minimizing an loss function.
  // It tries to find the minimum of our loss function with respect to the
  // model's weight parameters.
  const optimizer = 'rmsprop';

  // We compile our model by specifying an optimizer, a loss function, and a
  // list of metrics that we will use for model evaluation. Here we're using a
  // categorical crossentropy loss, the standard choice for a multi-class
  // classification problem like MNIST digits.
  // The categorical crossentropy loss is differentiable and hence makes
  // model training possible. But it is not amenable to easy interpretation
  // by a human. This is why we include a "metric", namely accuracy, which is
  // simply a measure of how many of the examples are classified correctly.
  // This metric is not differentiable and hence cannot be used as the loss
  // function of the model.
  Model.compile({
    optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  // Batch size is another important hyperparameter. It defines the number of
  // examples we group together, or batch, between updates to the model's
  // weights during training. A value that is too low will update weights using
  // too few examples and will not generalize well. Larger batch sizes require
  // more memory resources and aren't guaranteed to perform better.
  const batchSize = 100;

  // Leave out the last 15% of the training Data for validation, to monitor
  // overfitting during training.
  const validationSplit = 0.15;

  // Get number of training epochs from the UI.
  const trainEpochs = 1;

  // We'll keep a buffer of loss and accuracy values over time.
  let trainBatchCount = 0;

  const trainData = Data.getTrainData(0, 60000);
  const testData = Data.getTestData();

  const totalNumBatches =
      Math.ceil(trainData.images.shape[0] * (1 - validationSplit) / batchSize) *
      trainEpochs;

  // During the long-running fit() call for model training, we include
  // callbacks, so that we can plot the loss and accuracy values in the page
  // as the training progresses.
  let valAcc;
  await Model.fit(trainData.images, trainData.labels, {
    batchSize,
    validationSplit,
    epochs: trainEpochs });

    

  await Model.save(IRRequest(`${MODEL_HOST}`, '1'))


}
train();

