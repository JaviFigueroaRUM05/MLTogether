'use strict';

const reduceFn = `

    const vectorToReduce = data.map( (x) => JSON.parse(x).result);

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

`;
module.exports = reduceFn;