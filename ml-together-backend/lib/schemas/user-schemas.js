const Joi = require('@hapi/joi');

//TODO: Add
const registration = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(7).required().strict(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
});

const login = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(7).required().strict()
});



module.exports = {
    registration,
    login
};