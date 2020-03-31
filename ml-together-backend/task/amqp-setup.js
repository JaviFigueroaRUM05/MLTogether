const amqp = require('amqplib/callback_api');

/**
 * connectToMessageBroker() returns a Promise of a connection to
 * an amqp Message Broker based on the url given
 * @param {String} url
 */
async function connectToMessageBroker(url) {
  return new Promise(function (resolve, reject) {

    amqp.connect(url, function onConnect(error, connection) {
      if (error) {
        reject(error);
      }
      resolve(connection)
    })

  })
}

/**
 * createChannelToMessageBroker() creates and returns a amqp 
 * channel based on the connection parameter given
 * @param {Connection} connection 
 */
async function createChannelToMessageBroker(connection) {
  return new Promise(function (resolve, reject) {
    connection.createChannel(function onChannelCreate(error, channel) {
      if (error) {
        reject(error);
      }
      resolve(channel);
    })
  })
}

/**
 * initAMQPChannel() returns a channel to a given amqp
 * Message Broker determined by the url. This also
 * checks if a the queue exists
 * @param {String} url 
 */
async function initAMQPChannel(url) {
  let connection = await connectToMessageBroker(url);
  let channel = await createChannelToMessageBroker(connection)

  // TODO: Make the queues easier to modify as a plugin
  let queue = 'task_queue';

  channel.assertQueue(queue, {
    durable: true
  });
  channel.prefetch(1);
  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
}

module.exports = initAMQPChannel
