'use strict';

// TODO: Document bit better
/**
 * Class that holds the information for a given problem to resolve
 */


// For now a project will always have their task queue assigned
class GoalTaskInfo {


    constructor(trainingSetSize, batchSize, batchesPerReduce) {

        this.trainingSetSize = trainingSetSize;
        this.batchSize = batchSize;
        this.batchesPerReduce = batchesPerReduce;

    }
}

module.exports = GoalTaskInfo;
