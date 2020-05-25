'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../../handlers/project-handlers');
const Path = require('path');

// TODO: Remove dependency on project service
module.exports = {
    method: 'GET',
    path: '/projects/{projectId}/workerfiles/{param*}',
    options: {
        pre: [
            { method: verifyProject }
        ],
        validate: {
            params: Joi.object({
                projectId: Joi.string().description('project id which the worker is from'),
                param: Joi.any().description('the file or directory you are looking for').optional()
            })
        },
        description: 'Get a worker file',
        notes: 'Returns a file for the current goal given the project id and the file.',
        tags: ['api'],
        handler: {
            directory: {
                path: function (request) {
                    // TODO: Check if project exists
                    const projectId = request.params.projectId;
                    const paramParts = request.params.param.split('/');
                    let path;
                    switch (paramParts[0]) {
                        case 'images':
                        case 'css':
                        case '':
                            path = Path.join(__dirname,'../../../../public');
                            break;
                        default:
                            path = Path.join(__dirname,'../../../../public/projects', projectId);
                    }

                    return path;
                },
                redirectToSlash: true,
                index: true
            }
        }
    }
};
