const command = require("../command");

module.exports = (client) => {
	const parser = {
		parseCommandList: (tree) => {
			return new Promise((resolve, reject) => {
				tree = tree || [];

				const commandName = JSON.parse(JSON.stringify(tree));

				if(commandName.length == 0) {
					commandName.push("help");
				}

				const helpCommand = command(client.client, commandName);

				helpCommand().then(output => {
					const commands = {}

					let category = undefined;

					const promises = [];

					output
						.split("\n")
						.map(command => command.split(" ")
						.filter(space => space != ""))
						.forEach(command => {
							const commandName = command.shift();

							if(category == "notice" && (commandName == undefined || commandName[0] != "-")) {
								return;
							}

							const commandDescription = command.join(" ");

							if(commandName === undefined) {
								return;
							}

							if(commandName[0] == "-") {
								category = commandDescription.split("-").join("").trim();
								return;
							}

							if(commandName == "help" || commandName == "reveng") {
								return;
							}

							commands[commandName] = {
								description: commandDescription,
								category,
								name: commandName
							};

							if(commandDescription[0] == "{") {
								promises.push(parser.parseCommandList(tree.concat([commandName])).then(menu => {
									commands[commandName].children = menu;
								}));
							}
						});

					Promise.all(promises).then(() => {
						resolve(commands);
					});
				});
			});
		}
	};

	return parser;
};
