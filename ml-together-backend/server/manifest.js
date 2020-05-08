'use strict';

const Inert = require('@hapi/inert');
const Dotenv = require('dotenv');
const Confidence = require('confidence');
const Toys = require('toys');
const Mongo = require('hapi-mongodb');


// Pull .env into process.env
Dotenv.config({
    path: `${__dirname}/.env`
});

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: '0.0.0.0',
        port: {
            $env: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        routes: {
            cors: true
        },
        debug: {
            $filter: {
                $env: 'NODE_ENV'
            },
            $default: {
                log: ['error', 'debug'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: Inert,
                options: {}
            },
            {
                plugin: Mongo,
                options: {
                    $filter: {
                        $env: 'NODE_ENV'
                    },
                    $base: {
                        settings: {
                            poolSize: 10,
                            useUnifiedTopology: true
                        },
                        decorate: true
                    },
                    test: {
                        url: 'mongodb://localhost:27017/mltest'
                    },
                    $default: {
                        url: 'mongodb://localhost:27017/mldev01'
                    }


                }
            },
            {
                plugin: '../lib', // Main plugin
                options: {}
            },

            {
                plugin: {
                    $filter: {
                        $env: 'NODE_ENV'
                    },
                    $default: 'hpal-debug',
                    production: Toys.noop
                }
            }

        ]
    }
});