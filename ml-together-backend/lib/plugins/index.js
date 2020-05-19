'use strict';

const IRPlugin = require('./intermediate-results');
const TaskBrokerPlugin = require('./task-broker');
<<<<<<< HEAD
const jwt= require('hapi-auth-jwt2')

module.exports.plugins = [TaskBrokerPlugin, IRPlugin,jwt];
=======
const WorkerScriptGeneratorPlugin = require('./worker-script-generator');
const Path = require('path');

module.exports.plugins = [
    TaskBrokerPlugin,
    IRPlugin
    // { plugin: WorkerScriptGeneratorPlugin,
    //     options: {
    //         publicPath: Path.join(__dirname, '../../public/projects'),
    //         temporaryPath: Path.join(__dirname, '../../tmp')
    //     }
    // }
];
>>>>>>> develop
