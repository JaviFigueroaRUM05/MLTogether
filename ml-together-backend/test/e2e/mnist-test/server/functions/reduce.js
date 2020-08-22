'use strict';

const reduceFn = `

    const vectorToReduce = data.map( (x) => JSON.parse(x).result);
    const response = await Axios.get('http://192.168.100.117:3000/mnist/data?start=0&end=40');
    console.log(vectorToReduce);
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
    
    // TODO: check if vectorToReduce is valid
    // update model

    // compile model

    TF.tidy( () => {

        const data = response.data;
        const trainDataX = TF.tensor(data.images);
        const trainDataY = TF.tensor(data.labels);
        const labels = getPredictedLabels(trainDataX, model);
        let loss = TF.losses.softmaxCrossEntropy(trainDataY, labels).asScalar();
        loss.print();

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
        console.log(tensors)
        model.optimizer.applyGradients(tensors);
        const newLabels = getPredictedLabels(trainDataX, model);
        loss = TF.losses.softmaxCrossEntropy(trainDataY, newLabels).asScalar();
        loss.print();


        // TODO: Return Model
    });

`;
module.exports = reduceFn;