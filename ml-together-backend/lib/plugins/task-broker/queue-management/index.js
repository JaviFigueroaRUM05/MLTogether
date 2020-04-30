'use strict';


const TasksInitializer = require('./tasks-initializer');
const QueuePurger = require('./queue-purger');

const TASK_QUEUE_NAME = 'task_queue';
const MAP_RESULTS_QUEUE_NAME = 'map_results_queue';
const REDUCE_RESULTS_QUEUE_NAME = 'reduce_results_queue';

const purgeAllProjectQueues = async function (projectId, numberOfMapQueues) {

    const fullTaskQueueName = TASK_QUEUE_NAME + '_' + projectId;
    const fullMapResultsQueueName = MAP_RESULTS_QUEUE_NAME + '_' + projectId;
    const fullReduceResultsQueueName = REDUCE_RESULTS_QUEUE_NAME + '_' + projectId;

    await QueuePurger.purgeQueue(fullTaskQueueName);
    await QueuePurger.purgeMapResultsQueues(fullMapResultsQueueName, numberOfMapQueues);
    await QueuePurger.purgeQueue(fullReduceResultsQueueName);
};

/**
 *
 * @param {TaskInfo} tasksInformation
 */
const intializeGoalTasks = async function (taskInfo, projectId, modelURLRoot) {

    const { trainingSetSize, batchSize, batchesPerReduce } = taskInfo;
    await TasksInitializer.initializeTaskQueue(trainingSetSize,
        batchSize,
        batchesPerReduce,
        TASK_QUEUE_NAME + '_' + projectId,
        modelURLRoot
    );
};



module.exports = { purgeAllProjectQueues, intializeGoalTasks };




