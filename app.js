
/**
 * Module dependencies.
 */

var express = require('express');
var io = require('socket.io');
var controller = require('./controller');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
	app.use(express.logger());
	app.use(require('browserify')({
	  base: __dirname + "/public/javascripts",
	  mount: '/javascripts/browserify.js',
	}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(7000);
  console.log("Express server listening on port %d", app.address().port);
}


var socket = io.listen(app);

var connections = 0;
socket.on('connection', function(client) {
  
  controller.connect(client);
  
  client.on('message', function(message) {
    console.log(message);
    controller.runCommand(message, client);
  })
  
  client.on('disconnect', function() {
    controller.disconnect(client);
  })
});

