'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../../handlers/project-handlers');
const { intermediateResultModel, ErrorsOnGetOutputValidations } = require('../../../utils/response-models');
const _ = require('lodash');

module.exports = {

    method: 'GET',
    path: '/projects/{projectId}/ir/latest',
    options: {
        pre: [
            // TODO: Maybe move this in order for verify project to work
            // { method: verifyProject }
        ],
        description: 'Get the last added intermediate result',
        notes: 'Returns the last intermediate result added into a project',
        tags: ['api', 'projects'],
        handler: async function (request,h) {

            try {
                const { intermediateResultsService } = request.services();
                const projectId = request.params.projectId;

                const result = await intermediateResultsService
                    .getLatestResult(projectId);
                console.log(Object.keys(result));

                return h.response(result).code(200);
            }
            catch (err) {
                console.error(err);
                throw err;
            }

        },
        validate: {
            params: Joi.object({
                projectId: Joi.string().example('55153a8014829a865bbf700d')
            })
        },
        response: _.merge({}, ErrorsOnGetOutputValidations, {
            status: {
                200: intermediateResultModel
            }
        })
    }
};
