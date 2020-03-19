'use strict';

const Package = require('../package.json');
const Nes = require('nes');
const nesOptions = require('./nes-options');
exports.plugin = {
    name: 'TaskBroker',
    version: '1.0.0',
    register: async (server, options) => {
      await server.register({ plugin: Nes, options: nesOptions });

    }
};
