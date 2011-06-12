var commands = function() {
  	
	var Commands;
  
  function validate(command) {
  	// Check that the message is a command
  	if (!command.hasOwnProperty("type") || !command.hasOwnProperty("action") || !command.hasOwnProperty("params")) {	
  		return false;
  	}

  	// Check that the command has a valid type and action
  	if (!this.Commands.hasOwnProperty(command.type) || !this.Commands[command.type].hasOwnProperty(command.action)) {
  		return false;
  	}

  	return true;	
  }

  function run(command, client) {
  	if (client) {
  		this.Commands[command.type][command.action](command.params, client);
  	} else {
  		this.Commands[command.type][command.action](command.params);
  	}	
  }

  function inject(type, functions) {
    if (!this.Commands) this.Commands = {};
  	this.Commands[type] = functions;
  }
  
  return {
    validate: validate,
    run: run,
    inject: inject
  }
}();