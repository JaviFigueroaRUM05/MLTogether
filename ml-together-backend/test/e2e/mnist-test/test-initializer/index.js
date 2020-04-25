'use strict';

const ProjectQueueManager = require('../../../../lib/plugins/task/queue-management');
const { cleanIntermediateResultsDB } = require('../../../../lib/plugins/intermediate-results/results-cleaner');
const GoalTaskInfo = require('../../../../lib/plugins/task/goal-task-info');
const MNISTModel = require('./model');
const IRRequest = require('../../../../lib/plugins/intermediate-results/tfjs-io-handler');

const BATCH_SIZE = 100;
const BATCHES_PER_REDUCE = 10;



const initialize = async function (projectId, modelHost) {
    // Initialize Tasks
    const trainingDataLength = 1000;
    const goalTaskInfo = new GoalTaskInfo(trainingDataLength, BATCH_SIZE, BATCHES_PER_REDUCE);

    await cleanIntermediateResultsDB('mongodb://localhost:27017/mldev01', projectId);

    await ProjectQueueManager.purgeAllProjectQueues(projectId,
        trainingDataLength / BATCH_SIZE / BATCHES_PER_REDUCE);

    await ProjectQueueManager.intializeGoalTasks(goalTaskInfo, projectId, modelHost);

    // Create initial model

    await MNISTModel.save( IRRequest(modelHost, 1) );
};

module.exports = { initialize };
