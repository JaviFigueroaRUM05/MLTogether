'use strict';


const Dotenv = require('dotenv');
const Confidence = require('confidence');
const Toys = require('toys');
const Mongo = require('hapi-mongodb');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');
const Path = require('path');

const WorkerScriptGeneratorPlugin = require('../lib/plugins/worker-script-generator');
const TaskBrokerPlugin = require('../lib/plugins/task-broker');
const IRPlugin = require('../lib/plugins/intermediate-results');
const FileServerPlugin = require('../lib/plugins/fileserver');



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
                        url: 'mongodb://localhost/mltest'
                    },
                    $default: {
                        url: {
                            $env: 'MONGO_URL',
                            $default: 'mongodb://localhost/mldev01'
                        }
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
                        templatesPath: Path.join(__dirname, '../test/utils'),
                        doBundle: false
                    },
                    $default: {
                        publicPath: Path.join(__dirname, '../public/projects'),
                        temporaryPath: Path.join(__dirname, '../tmp')
                    }
                }
            },
            {   plugin: TaskBrokerPlugin,
                options: {
                    taskQueueBaseName: 'task_queue',
                    mapResultsQueueBaseName: 'map_results_queue',
                    amqpURL: {
                        $env: 'AMQP_URL',
                        $default: 'amqp://localhost'
                    },
                    defaultMaxTimeToWait: 5000
                }
            },
            {   plugin: IRPlugin,
                options: {},
                routes: {
                    prefix: '/api'
                }
            },
            {   plugin: FileServerPlugin,
                options: {}
            },
            {
                plugin: '../lib', // Main plugin
                routes: {
                    prefix: '/api'
                },
                options: {
                    jwtKey: {
                        $filter: { $env: 'NODE_ENV' },
                        $default: {
                            $env: 'APP_SECRET',
                            $default: '1B0765FACEFF119832996A609EDC113983186AD76DA6835574B892C55EE5AF4F'
                        },
                        production: {           // In production do not default to "app-secret"
                            $env: 'APP_SECRET'
                        }
                    }
                }
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
                    },
                    grouping: 'tags',
                    tags: [
                        {
                            name: 'users',
                            description: 'Users data'
                        },
                        {
                            name: 'projects',
                            description: 'Projects data'
                        },
                        {
                            name: 'goals',
                            description: 'Creation of goals',
                            externalDocs: {
                                description: 'Find out more about how to create a goal',
                                url: 'https://www.notion.so/manuelbg/Goal-Creation-6892ecdc40fc43b8ba9eac555be39c42'
                            }
                        }
                    ]
                }
            }


        ]
    }
});
