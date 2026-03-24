const client = require("./client");

module.exports = {
	client,
	analyse: require("./analyse"),
	data: require("./data"),
	emv: require("./emv"),
	hf: require("./hf"),
	hw: require("./hw"),
	lf: require("./lf"),
	mem: require("./mem"),
	nfc: require("./nfc"),
	prefs: require("./prefs"),
	script: require("./script"),
	smart: require("./smart"),
	trace: require("./trace"),
	usart: require("./usart"),
	wiegand: require("./wiegand")
};
