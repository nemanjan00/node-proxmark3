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
			let stderrBuffer = "";
			daemon._child.stderr.on("data", (data) => {
				stderrBuffer += data;
				const lines = stderrBuffer.split("\n");
				stderrBuffer = lines.pop();

				for (const line of lines) {
					if (!line) continue;
					daemon._events.emit("line", {
						line,
						source: "stderr"
					});
				}
			});

			let stdoutBuffer = "";
			daemon._child.stdout.on("data", (data) => {
				stdoutBuffer += data;
				const lines = stdoutBuffer.split("\n");
				stdoutBuffer = lines.pop();

				for (const line of lines) {
					if (!line) continue;
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
				}
			});

			daemon._child.on("exit", (code, signal) => {
				daemon._events.emit("error", {
					message: `PM3 process exited (code: ${code}, signal: ${signal})`
				});
			});

			daemon._child.on("error", (err) => {
				daemon._events.emit("error", {
					message: err.message
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
