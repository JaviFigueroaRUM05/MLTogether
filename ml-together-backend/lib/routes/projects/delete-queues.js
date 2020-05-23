'use strict';

const Joi = require('@hapi/joi');
const { verifyProject } = require('../../handlers/project-handlers');

module.exports = {
    method: 'DELETE',
    path: '/projects/{projectId}/queues',
    handler: async function (request, h) {

        const projectId = request.params.projectId;
        const { queueService } = request.services();

        if ( request.query.all === true ) {

            const queueNames = await queueService.getProjectQueueNames(projectId);
            await queueService.deleteQueues(queueNames);
            return h.response({ deleted: queueNames }).code(200);
        }

        return h.response({}).code(501);


    },
    options: {
        pre: [
            { method: verifyProject }
        ],

        validate: {
            failAction: (request, h, err) => {
                //TODO: change this to appear in debug only
                console.error(err);
                throw err;
            },
            params:
                        Joi.object({
                            projectId: Joi.string()
                        })
            ,
            query: Joi.object({
                all: Joi.bool()
            })
        }
    }
};
