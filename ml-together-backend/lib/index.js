'use strict';

const HauteCouture = require('haute-couture');
const Package = require('../package.json');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {

        await HauteCouture.using()(server, options);
        server.dependency('WorkerScriptGenerator');
    }
};
