const client = require("../src").client;

client(process.env.PM3).then(client => {
	client.help.parseCommandList().then(data => {
		console.log(JSON.stringify(data, null, 4));
	});
});
