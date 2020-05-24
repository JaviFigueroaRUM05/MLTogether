const Joi = require('@hapi/joi');

//TODO: Add
const registration = Joi.object({
    name: Joi.string().email().lowercase().required().example('juan@upr.edu'),
    description: Joi.string().min(7).required().strict().example('hello1234'),
    userID: Joi.string().valid(Joi.ref('password')).required().strict().example('hello1234')
});