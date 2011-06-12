var commands = require('./commands');

exports.connect = connect;
exports.disconnect = disconnect;
exports.runCommand = runCommand;

var users = {};

//****************************************************
// Public Functions
//****************************************************
function connect(client) {
	// Set the socket if it doesn't exist yet
	if (!socket) {
		socket = client.listener;
	}
	
	sessionJoin(client);
}

function disconnect(client) {
  sessionLeave(client);
}

function runCommand(command, client) {
	if (commands.validate(command)) {
		commands.run(command, client);
	}
}

//****************************************************
// Session Variables
//****************************************************
// TODO: Make this dynamic
var opentok = {
	apiKey: "413302",
	sessionId: "19af49229f0ecbcec14927d16ad2f2af9dc64d3a",
	token: "devtoken",
}

var socket;

//****************************************************
// Session Command Senders
//****************************************************
function sessionJoin(client) {
  // Choose a random start position
  var offset = {
    top: Math.floor(Math.random() * 600),
    left: Math.floor(Math.random() * 800)
  }
  
  var user = {
    id: client.sessionId,
    offset: offset
  }
  
  users[user.id] = user;
  
  var command = {
    type: "session",
    action: "join",
    params: {
      opentok: opentok,
      user: user,
      users: users
    }
  }
  
  client.send(command);
  
  command = {
    type: "user",
    action: "join",
    params: {
      user: user
    }
  }
  
  client.broadcast(command);
}

function sessionLeave(client) {
  var user = users[client.sessionId];
  
  var command = {
    type: "user",
    action: "leave",
    params: {
      user: user
    }
  }
  
  socket.broadcast(command);
  
  delete users[client.sessionId];
}

//****************************************************
// User Command Receivers
//****************************************************
var userCommands = {
	move: userMove,
	publish: userPublish
}
commands.inject("user", userCommands);

function userMove(params, client) {
  var user = users[client.sessionId];
  var offset = user.offset; // May be wrong WARNING
  
  // Calculate the new offset
  switch (params.direction) {
    case "up":
      offset.top = offset.top - params.speed;
    break;
    
    case "down":
    offset.top = offset.top + params.speed;
    break;
    
    case "left":
      offset.left = offset.left - params.speed;
    break;
    
    case "right":
      offset.left = offset.left + params.speed;
    break;
  }
  
  var command = {
    type: "user",
    action: "move",
    params: {
      user: user
    }
  }
  
  socket.broadcast(command);
}

function userPublish(params, client) {
  var user = users[client.sessionId];
  user.stream = params.stream;
  
  var command = {
    type: "user",
    action: "stream",
    params: {
      user: user
    }
  }
  
  client.broadcast(command);
}

/*
function clientInit(params, client) {
  var offset = offsets[client.sessionId];
  
  var command = {
    type: "user",
    action: "init",
    params: {
      user: params.user,
      offset: offset
    }
  }
  
  client.broadcast(command);
}*/






