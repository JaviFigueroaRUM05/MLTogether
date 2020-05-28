'use strict';

const exampleModelFn = require('./example-model-fn');
const exampleMapFn = require('./example-map-fn');
const exampleReduceFn = require('./example-reduce-fn');

const Joi = require('@hapi/joi');

const projectModel = Joi.object({
    _id: Joi.any().required().example('55153a8014829a865bbf700d'),
    title: Joi.string().required().example('Cancer Research'),
    description: Joi.string().required().example('Doing Cancer Research by using machine learning models.'),
    userID: Joi.any().strip()
}).label('Project');

const authModel = Joi.object({
    token_id: Joi.string().description('json web token '),
}).label('Auth');

const machineLearningModelInfo = Joi.object({
    modelFn: Joi.string().required()
        .description('machine learning function written in javascript that returns a non-compiled tensor flow model.')
        .example(exampleModelFn),
    optimizer: Joi.string().required()
        .description('the optimizer function used by the compile method in tensorflow.js https://js.tensorflow.org/api/latest/#tf.LayersModel.compile')
        .example('rmsprop'),
    loss: Joi.array().items(Joi.string()).required()
        .description('the object functions used by the compile method in tensorflow.js https://js.tensorflow.org/api/latest/#tf.LayersModel.compile')
        .example(['categoricalCrossentropy']),
    metrics: Joi.array().items(Joi.string()).required()
        .description('the list of metrics used by the compile method in tensorflow.js https://js.tensorflow.org/api/latest/#tf.LayersModel.compile')
        .example(['accuracy'])
}).label('MachineLearningModelInfo').description('machine learning model information');

const taskInformation = Joi.object({
    trainingSetSize: Joi.number().required()
        .description('the number of data instances you have in the Training Data Repository')
        .example(60000),
    batchSize: Joi.number().required()
        .description('how many training data instances are in a given batch. For each batch, a map task is created.')
        .example(10),
    batchesPerReduce: Joi.number().required()
        .description('how many batches will a reduce task... reduce.')
        .example(5),
    trainDataUrl: Joi.string().uri().required()
        .description('the URL which Workers can obtain the training data. This URL must be able to accept start and query params')
        .example('www.example.com/data'),
    mapFn: Joi.string().required()
        .description('map function written in javascript that returns the results to be reduced.')
        .example(exampleMapFn),
    reduceFn: Joi.string().required()
        .description('reduce function written in javascript.')
        .example(exampleReduceFn)
}).label('TaskInfo').description('information on how to train the machine learning model')
const goalModel = Joi.object({
    title: Joi.string().required().description('title of the goal'),
    description: Joi.string().optional().description('description of the goal'),
    model: machineLearningModelInfo.required(),
    taskInfo: taskInformation.required()
}).label('Goal');

module.exports = {
    projectModel,
    authModel,
    goalModel
};
