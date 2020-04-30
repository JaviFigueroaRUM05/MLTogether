'use strict';

const Schmervice = require('schmervice');

const isMapResultQueueFull = function (currentBatchIndex, batchesPerReduce) {

    return ((currentBatchIndex + 1) % batchesPerReduce === 0);
};

class TaskService extends Schmervice.Service {

    createMapTask(mapResultsId, modelURL, dataStart, dataEnd) {

        if (dataStart > dataEnd) {
            throw new RangeError(
                `dataStart-> ${dataStart} is greater than dataEnd -> ${dataEnd}`
            );
        }

        const mapTask = {
            function: 'map',
            dataStart,
            dataEnd,
            mapResultsId,
            modelURL
        };

        return mapTask;
    }

    createReduceTask(mapResultsId, modelURL, modelStoringURL, modelStoringId,
        numberOfBatches) {

        const reduce = {
            function: 'reduce',
            mapResultsId,
            modelURL,
            modelStoringURL,
            modelStoringId,
            numberOfBatches
        };

        return reduce;
    }

    createTasks(trainingSetSize, batchSize, batchesPerReduce, modelURLRoot) {

        if (trainingSetSize <= 0) {
            throw new RangeError(`trainingSetSize => ${trainingSetSize} has to be above 0`);
        }

        if (batchSize <= 0) {
            throw new RangeError(`batchSize => ${batchSize} has to be above 0`);
        }

        if (batchesPerReduce <= 0) {
            throw new RangeError(`batchesPerReduce => ${batchesPerReduce} has to be above 0`);
        }

        if (batchSize > trainingSetSize) {
            throw new RangeError(
                `batchSize => ${batchSize} has to be less than trainingSetSize => ${batchesPerReduce}`
            );
        }

        if ( (trainingSetSize / batchSize) < batchesPerReduce) {
            throw new RangeError(
                `batchesPerReduce => ${batchesPerReduce} has to be less or equal than trainingSetSize / batchSize => ${trainingSetSize/batchSize}`
            );
        }

        const tasks = [];
        const numberOfMapTasks = trainingSetSize / batchSize;

        let currentMapResultsId = 1;
        let numberOfBatches = 0;

        for (let i = 0; i < numberOfMapTasks; ++i) {
            const dataStart = i * batchSize;
            const dataEnd = (i + 1) * batchSize;
            const modelURL = `${modelURLRoot}/${currentMapResultsId}`;

            const mapTask = this.createMapTask(
                currentMapResultsId,
                modelURL, dataStart, dataEnd);
            tasks.push(mapTask);
            ++numberOfBatches;

            // Once the number of batches per queue (batches per reduce) has
            // been reached, create the reduce task that will 'reduce' all of
            // the map results
            if (isMapResultQueueFull(i, batchesPerReduce)) {
                const nextModelId = currentMapResultsId + 1;
                const modelStoringURL = `${modelURLRoot}/${nextModelId}`;
                const reduceTask = this.createReduceTask(currentMapResultsId,
                    modelURL, modelStoringURL, nextModelId, numberOfBatches);
                tasks.push(reduceTask);
                numberOfBatches = 0;
                ++currentMapResultsId;
            }
        }

        return tasks;

    }
}

module.exports = TaskService;
