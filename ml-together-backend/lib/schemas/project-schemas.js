const Joi = require('@hapi/joi');

//TODO: Add
const project = Joi.object({
    name: Joi.string(),
    trainingData: Joi.string(),
    trainingDataLength: Joi.integer(),
    batchSize: Joi.integer(),
    batchesPerReduce: Joi.integer(),
    projectOwner: Joi.string()

});

const login = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(7).required().strict()
});



module.exports = {
    registration,
    login
};