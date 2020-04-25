'use strict';

const IRPlugin = require('./intermediate-results');
const TaskBrokerPlugin = require('./task');


module.exports.plugins = [TaskBrokerPlugin, IRPlugin];
