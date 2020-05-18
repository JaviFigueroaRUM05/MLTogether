'use strict';

const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Dotenv = require('dotenv');
const Confidence = require('confidence');
const Toys = require('toys');
const Mongo = require('hapi-mongodb');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');
const Path = require('path');

const WorkerScriptGeneratorPlugin = require('../lib/plugins/worker-script-generator');

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
                plugin: Vision,
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
            { plugin: WorkerScriptGeneratorPlugin,
                options: {
                    $filter: {
                        $env: 'NODE_ENV'
                    },
                    test: {
                        publicPath: Path.join(__dirname, '../test/tmp/public/projects'),
                        temporaryPath: Path.join(__dirname, '../test/tmp/tmp'),
                        templatesPath: Path.join(__dirname, '../test/utils')
                    },
                    $default: {
                        publicPath: Path.join(__dirname, '../public/projects'),
                        temporaryPath: Path.join(__dirname, '../tmp')
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
            },
            {
                plugin: HapiSwagger,
                options: {
                    info: {
                        title: 'MLTogether API Documentation',
                        version: Pack.version
                    }
                }
            }


        ]
    }
});
