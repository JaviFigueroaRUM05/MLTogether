'use strict';

import * as TF from '@tensorflow/tfjs';

const TENSOR_NAME_PATTERN = /_[0-9]*$/i;

const getPredictedLabels = function (x, model) {

    return TF.tidy(() => {

        return model.predictOnBatch(x);
    });
};

const getGradientsAndSaveActions = function (x, y, model) {

    const f = () => {

        return TF.tidy(() => {

            const labels = getPredictedLabels(x, model);
            return TF.losses.softmaxCrossEntropy(y, labels).asScalar();
        });
    };

    const results = TF.variableGrads(f);
    return results;

};

const mapFn = function (trainDataX, trainDataY, model) {
    // update model (in this case we don't because we are going to use one model)

    // compile model (already compiled in Model)

    // get the necessary data
    // currently the data is expected as the MNIST data from Tensorflow example
    // hence it might not work with other data


    // get the gradients
    const { value, grads } = getGradientsAndSaveActions(trainDataX, trainDataY, model);

    // change tensor names and add them into a new object with different names
    const tensorNames = Object.keys(grads);
    const jsonGradients = {};

    tensorNames.forEach((tensorName) => {

        let newTensorName = tensorName;
        // Actualizamos el nombre del tensor para evitar problemas del nombre autogenerado por TF
        const matched = tensorName.match(TENSOR_NAME_PATTERN);
        if (matched) {
            newTensorName = tensorName.substring(0, tensorName.indexOf(matched));
        }

        jsonGradients[newTensorName] = grads[tensorName].arraySync();
    });

    tensorNames.forEach( (tensorName) => grads[tensorName].dispose() );
    return { value, grads: jsonGradients };
};

const reduceFn = function (vectorToReduce, model) {

    // TODO: check if vectorToReduce is valid
    // update model

    // compile model

    TF.tidy( () => {

        const tensors = {};
        const tensorNames = Object.keys(vectorToReduce[0].grads);
        tensorNames.forEach( (tensorName) => {

            for (let i = 0; i < vectorToReduce.length; ++i) {

                if (i === 0) {
                    tensors[tensorName] = [];
                }

                tensors[tensorName].push(TF.tensor(vectorToReduce[i].grads[tensorName]));
            }

            tensors[tensorName] = TF.addN(tensors[tensorName]);
        });
        model.optimizer.applyGradients(tensors);

        // TODO: Return Model
    });
};

export { mapFn, reduceFn };
