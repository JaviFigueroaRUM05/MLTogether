'use strict';


const TasksInitializer = require('./tasks-initializer');
const QueuePurger = require('./queue-purger');

const purgeAllProjectQueues = async function (projectID, taskQueueName, mapResultsQueueName, reduceResultQueueName, numberOfMapQueues) {

    const fullTaskQueueName = taskQueueName + '_' + projectID;
    const fullMapResultsQueueName = mapResultsQueueName + '_' + projectID;
    const fullReduceResultsQueueName = reduceResultQueueName + '_' + projectID;

    await QueuePurger.purgeQueue(fullTaskQueueName);
    await QueuePurger.purgeMapResultsQueues(fullMapResultsQueueName, numberOfMapQueues);
    await QueuePurger.purgeQueue(fullReduceResultsQueueName);
};

/**
 *
 * @param {TaskInfo} tasksInformation
 */
const intializeGoalTasks = async function (taskInfo, taskQueueName) {

    const { trainingSetSize, batchSize, batchesPerReduce } = taskInfo;
    await TasksInitializer.initializeTaskQueue(trainingSetSize,
        batchSize,
        batchesPerReduce,
        taskQueueName);
};



module.exports = { purgeAllProjectQueues, intializeGoalTasks };




