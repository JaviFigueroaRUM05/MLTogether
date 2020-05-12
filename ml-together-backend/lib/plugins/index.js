'use strict';

const IRPlugin = require('./intermediate-results');
const TaskBrokerPlugin = require('./task-broker');
const jwt= require('hapi-auth-jwt2')

module.exports.plugins = [TaskBrokerPlugin, IRPlugin,jwt];
