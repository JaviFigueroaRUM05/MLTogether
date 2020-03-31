'use strict';

const Nes = require('nes');
const createOptions = require('./options');
const initAMQPChannel = require('./amqp-setup')

exports.plugin = {
  
  name: 'TaskBroker',
  version: '1.0.0',
  register: async (server, options) => {
    
    // Adds the amqp channel as a method to the server
    let channel = await initAMQPChannel('amqp://localhost')
    server.method('amqp.channel', function(){ return this }, {bind:channel})
    
    // Register Websockets as plugins
    await server.register({
      plugin: Nes,
      options: createOptions(server)
    });
  }
};