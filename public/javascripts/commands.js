var Commands = {};

function validate(command) {
	console.log(command);
	
	// Check that the message is a command
	if (!command.hasOwnProperty("type") || !command.hasOwnProperty("action") || !command.hasOwnProperty("params")) {	
	  console.log("!!!!!!!!! INVALID COMMAND !!!!!!!!!!");
		return false;
	}
	
	// Check that the command has a valid type and action
	if (!Commands.hasOwnProperty(command.type) || !Commands[command.type].hasOwnProperty(command.action)) {
	  console.log("!!!!!!!!! INVALID COMMAND !!!!!!!!!!");
		return false;
	}
	
	return true;	
}

function run(command, client) {
	if (client) {
		Commands[command.type][command.action](command.params, client);
	} else {
		Commands[command.type][command.action](command.params);
	}	
}

function inject(type, functions) {
	Commands[type] = functions;
}

exports.validate = validate;
exports.run = run;
exports.inject = inject;