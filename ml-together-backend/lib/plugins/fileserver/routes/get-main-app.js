'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../../handlers/project-handlers');
const Path = require('path');

// TODO: Remove dependency on project service
module.exports = {
    method: 'GET',
    path: '/{param*}',
    options: {
        description: 'Get a worker file',
        notes: 'Returns a file for the current goal given the project id and the file.',
        tags: ['api', 'file-server'],
        handler: {
            file: {
                path: function (request) {

                    const paramParts = request.params.param.split('/');
                    const splittedFile = paramParts[0].split('.');
                    if (splittedFile[splittedFile.length-1] === 'js' || splittedFile[splittedFile.length-1] === 'css') {
                        return Path.join(__dirname,'../../../../public/main-web-app/' + paramParts[0]);
                    }

                    return Path.join(__dirname,'../../../../public/main-web-app/index.html');
                }
            }
        }
    }
};
