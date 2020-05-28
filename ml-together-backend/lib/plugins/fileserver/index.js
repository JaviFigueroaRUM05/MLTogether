'use strict';

const HauteCouture = require('haute-couture');

exports.plugin = {
    name: 'FileServer',
    version: '1.0.0',
    register: async (server, options) => {

        await HauteCouture.using()(server, options);
    }
};
