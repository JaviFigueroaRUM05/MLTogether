'use strict';

const IRPlugin = require('./intermediate-results');
const TaskBrokerPlugin = require('./task-broker');


module.exports.plugins = [TaskBrokerPlugin, IRPlugin];
