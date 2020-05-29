'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../../handlers/project-handlers');
const Path = require('path');

// TODO: Remove dependency on project service
module.exports = {
    method: 'GET',
    path: '/assets/{param*}',
    options: {
        validate: {
            params: Joi.object({
                param: Joi.any().description('the file or directory you are looking for').optional()
            })
        },
        description: 'Get a worker file',
        notes: 'Returns a file for the current goal given the project id and the file.',
        tags: ['api', 'file-server'],
        handler: {
            directory: {
                path: function (request) {

                    return Path.join(__dirname,'../../../../public/assets');
                },
                redirectToSlash: true,
                index: true
            }
        }
    }
};
