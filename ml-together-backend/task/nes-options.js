const onMessage = (socket, message) => {
  console.log(socket.id + " Sends:", message);
  var msg = JSON.parse(message);

  if (msg.event == "next") { 
    
    // Get next task from Task Broker
    
    
    return JSON.stringify({ function: "reduce", data: 20 });
  }
  if (msg.event == "result") { // Push Result to Task Broker
      
  }
};

const onConnection = (socket) => {
  console.log("Socket Connected: " + socket.id);
};

const onDisconnection = (socket) => {
  console.log("Socket Disconnected: " + socket.id);
};

module.exports = {onMessage, onConnection, onDisconnection}