'use strict';

const HauteCouture = require('haute-couture');
const Package = require('../package.json');
const Mongo = require('hapi-mongodb');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {

        try {
            await server.register(  {
                plugin: Mongo,
                options: { url: 'mongodb://localhost:27017/mldev01',
                    settings: {
                        poolSize: 10,
                        useUnifiedTopology: true
                    },
                    decorate: true
                }

            });
        }
        catch (err) {

            console.error(err);
            process.exit(1);
        }

        await HauteCouture.using()(server, options);
    }
};
