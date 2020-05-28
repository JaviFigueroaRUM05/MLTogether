export const IdeTemplate = `
/**
 * Both mapFn and reduceFn have access to the Tensorflow library by using TF
 * Remember to clean up memory used by Tensorflow
 */
 
 /**
 * modelFn only has access to TF
 */

{
    mapFn: async function(data, model) { 
        return { values:{}, grads: {}}
    },
    reduceFn: async function(data, model) {
        return;
    },
    modelFn: async function(TF){
        return model; 
    }
    
    
    
}

`

