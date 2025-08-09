const client = require("../src").client;

const blessed = require("blessed");
const contrib = require("blessed-contrib");

const clientPromise = client(process.env.PM3);

const screen = blessed.screen({
	smartCSR: true
});

screen.key(["escape", "q", "C-c"], function(ch, key) {
	return process.exit(0);
});

const grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

const tree = grid.set(0, 0, 12, 4, contrib.tree, {fg: "green"});
const log = grid.set(0, 4, 12, 12, contrib.log, {});

tree.focus()

let running = false;

tree.on("select",function(node){
	if(node.children) {
		return;
	}

	return clientPromise.then(client => {
		let command = client.command;

		node.stack.forEach(el => {
			command = command[el];
		});

		if(running) {
			log.log("# already running a command");
			screen.render();
			return;
		}

		log.log("$ " + node.stack.join(" "))
		screen.render();

		running = true;

		return command.exec().then(result => {
			running = false
			result.split("\r").join("").trim().split("\n").forEach(line => {
				log.log(line);
			});

			screen.render();
		});
	});
});

clientPromise.then(client => {
	client.help.parseCommandList().then(commands => {
		const walk = (el, stack) => {
			el.stack = [...stack];

			if(el.children) {
				Object.keys(el.children).forEach(key => {
					walk(el.children[key], [...stack, key]);
				});
			}
		};

		walk({children: commands}, []);

		tree.setData({
			extended: true,
			children: commands
		});

		screen.render();
	});
});

screen.append(tree);
