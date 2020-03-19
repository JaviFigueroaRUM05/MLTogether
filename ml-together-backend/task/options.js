async function fetchFromQueue(channel, queue) {
  return new Promise((resolve, reject) => {
    channel.consume(queue, function onConsume(msg) {
      var secs = msg.content.toString().split('.').length - 1;

      console.log(" [x] Received %s", msg.content.toString());
      resolve(msg.content)
    }, {
      noAck: false
    });

  })
}

async function pushResultsToQueue(results, channel, queue) {
  // TODO: Place results to the queue
  return new Promise((resolve, reject) => {
    setTimeout(function onTimeout() {
      resolve()
    }, 1000);
  })
}

const onMessage = (server) => async (socket, message) => {
  console.log(socket.id + " Sends:", message);

  let msg = JSON.parse(message);
  let channel = server.methods.amqp.channel();
  let tasksQueue = 'task_queue';
  let resultsQueue = 'task_queue';


  // bring more tasks
  if (msg.event == "next") {

    let task = await fetchFromQueue(channel, tasksQueue)

    // TODO: Place logic for mapping fetch results to send out the message

    return JSON.stringify({
      function: "reduce",
      data: 20
    });

  } else if (msg.event == "result") {
    // TODO: Push Result to Task Broker
    let results = "Test"
    await pushResultsToQueue(results, channel, resultsQueue);

  } else {
    // TODO: Return error because event does not exist
  }
};

const onConnection = (socket) => {
  console.log("Socket Connected: " + socket.id);
};

const onDisconnection = (socket) => {
  console.log("Socket Disconnected: " + socket.id);
};



module.exports = function createOptions(server) {
  return {
    onMessage: onMessage(server),
    onConnection,
    onDisconnection
  }
}