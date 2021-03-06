const spawn = require("child_process").spawn;
const path = require("path");
const events = require("events");

module.exports.createDaemon = (...args) => {
	const daemon = {
		_child: undefined,

		_events: new events(),

		_proxmarkClientPath: undefined,

		_start: (proxmarkClientPath) => {
			return new Promise((resolve, reject) => {
				daemon._proxmarkClientPath = proxmarkClientPath;

				daemon._startChild();

				daemon.on("started", () => {
					resolve(daemon);
				});

				daemon._subscribeToMessages();
			});
		},

		_startChild: () => {
			daemon._child = spawn(daemon._proxmarkClientPath, [
				"-c",
				"script run interpreter",
				"-i"
			], {
				cwd: path.resolve(__dirname, "../../")
			});
		},

		_subscribeToMessages: () => {
			daemon._child.stderr.on("data", (data) => {
				const dataLines = (data + "").split("\n");

				dataLines.forEach(line => {
					daemon._events.emit("line", {
						line,
						source: "stderr"
					});
				});
			});

			daemon._child.stdout.on("data", (data) => {
				const dataLines = (data + "").split("\n");

				dataLines.forEach(line => {
					try {
						const message = JSON.parse(line);

						const type = message.type;

						delete message.type;

						daemon._events.emit(type, message);
					} catch(e) {
						daemon._events.emit("line", {
							line,
							source: "stdout"
						});
					}
				});
			});
		},

		on: (...args) => {
			return daemon._events.on(...args);
		},

		emit: (type, message) => {
			message = message || {};
			message.type = type;

			return daemon._child.stdin.write(JSON.stringify(message) + "\n");
		},

		removeEventListener: (...args) => {
			return daemon._events.removeListener(...args);
		}
	};

	return daemon._start(...args);
};
