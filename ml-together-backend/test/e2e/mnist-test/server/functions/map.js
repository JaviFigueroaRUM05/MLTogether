'use strict';

const mapFn = `
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
                const loss = TF.losses.softmaxCrossEntropy(y, labels).asScalar();
                return loss
            });
        };

        const results = TF.variableGrads(f);
        return results;

    };



    const trainDataX = TF.tensor(data.images);
    const trainDataY = TF.tensor(data.labels);

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
    trainDataX.dispose();
    trainDataY.dispose();
    return { value: value.asScalar().dataSync()[0], grads: jsonGradients };

`;

module.exports = mapFn;
