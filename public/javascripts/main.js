require(['commands', 'jquery-1.6.1', 'socket.io', 'TB.min'], function() {
  require.ready(function() {
    console.log('main loaded');
    
    var session;

    var myUser;
    var users;

    var socket = new io.Socket('floattok.nodester.com');
    //		var commands = require('./commands');

    var me;

    socket.on('message', function(command) {
    	if (commands.validate(command)) {
    		commands.run(command);
    	}
    });

    socket.connect();

    //****************************************************
    // Session Command Receivers
    //****************************************************
    var sessionCommands = {
    	join: sessionJoin,
    }
    commands.inject("session", sessionCommands);

    function sessionJoin(params) {
    	myUser = params.user;
    	users = params.users;

    	// Make divs at all the spots where the users are
    	$.each(users, function() {
    		userCreateDiv(this);
    	})

    	opentokInit(params.opentok, params.offset);	
    }

    //****************************************************
    // Move Command Receivers
    //****************************************************
    var userCommands = {
    	join: userJoin,
    	leave: userLeave,
    	stream: userStream,
    	move: userMove
    }
    commands.inject("user", userCommands);

    function userJoin(params) {
    	userCreateDiv(params.user);
    }

    function userLeave(params) {
    	var user = params.user;

    	$("#" + user.id).remove();
    }

    function userStream(params) {
    	console.log('stream');

    	// Subscribe to the stream
    	var user = params.user;
    	var stream = user.stream;

    	session.subscribe(stream, "stream-" + user.id);
    }

    function userMove(params) {
    	var user = params.user;

    	$("#" + user.id).offset(user.offset);
    }

    function userCreateDiv(user) {
    	var offset = user.offset;

    	var container = $('<div id=' + user.id + '></div>');
    	$(container).css("position", "absolute");
    	$(container).offset({ top: offset.top, left: offset.left });

    	var div = $('<div id="stream-' + user.id + '"></div>');

    	$(container).append(div);

    	$('body').append(container);
    }

    function userPublish(stream) {	
    	myUser.stream = stream;

    	var command = {
    		type: "user",
    		action: "publish",
    		params: {
    			stream: stream,
    		}
    	}

    	socket.send(command);
    }

    //****************************************************
    // OpenTok Functions
    //****************************************************			
    function opentokInit(opentok, offset) {
    	var apiKey = opentok.apiKey;
    	var sessionId = opentok.sessionId
    	var token = opentok.token;

    	// TB.addEventListener("exception", exceptionHandler);

    	if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
    		alert("You don't have the minimum requirements to run this application."
    			  + "Please upgrade to the latest version of Flash.");
    	} else {
    		// Initialize the session
    		session = TB.initSession(sessionId);

    		// Add event listeners to the session
    		session.addEventListener('sessionConnected', sessionConnectedHandler);
    		session.addEventListener('streamCreated', streamCreatedHandler);
    	}

    	session.connect(apiKey, token);		
    }

    function sessionConnectedHandler(event) {
    	// Subscribe to all existing streams
    	$.each(users, function() {
    		var user = this;
    		if (user.hasOwnProperty('stream')) {
    			session.subscribe(user.stream, "stream-" + user.id)
    		}				
    	})

    	var publisher = session.publish("stream-" + myUser.id);
    }

    function streamCreatedHandler(event) {
    	// Check if the stream created is ours, if so send command to other clients that we have published
    	for (var i = 0; i < event.streams.length; i++) {
    		var stream = event.streams[i];
    		if (session.connection.connectionId == stream.connection.connectionId) {
    			userPublish(stream);

    			// Initialize keyboard bindings
    			initMoveBind();
    		}
    	}
    }

    function initMoveBind() {
    	// Set up command senders
    	$(document).keydown(function(e) {

    		var command = {
    			type: "user",
    			action: "move",
    			params: {
    				user: myUser,
    				speed: 5 // TODO: Make this variable
    			}
    		}

    		switch (e.keyCode)
    		{
    			case 37:
    				// Left
    				command.params.direction = "left";
    			break;

    			case 38:
    				// Up
    				command.params.direction = "up";
    			break;

    			case 39:
    				// Right
    				command.params.direction = "right";
    			break;

    			case 40:
    				// Down
    				command.params.direction = "down";
    			break;
    		}

    		if (command.params.direction) {
    			socket.send(command);
    		}
    	})
    }
  })
})