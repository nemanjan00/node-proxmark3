const spawn = require("child_process").spawn;
const path = require("path");
const events = require("events");

module.exports.createDaemon = (...args) => {
	const daemon = {
		_child: undefined,

		_events: new events(),

		_proxmarkClientPath: undefined,

		_queue: [],

		_running: false,

		_start: (proxmarkClientPath) => {
			return new Promise((resolve, reject) => {
				daemon._proxmarkClientPath = proxmarkClientPath;

				daemon._startChild();

				daemon.on("started", () => {
					resolve(daemon);
				});

				daemon.on("error", (data) => {
					reject(new Error(data.message || "PM3 process error"));
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

		_sendCommand: () => {
			if (daemon._running) return;

			const command = daemon._queue.shift();

			if (command === undefined) return;

			daemon._child.stdin.write(JSON.stringify(command) + "\n");
			daemon._running = true;
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
				const lines = stdoutBuffer.split(/\r?\n|\r/);
				stdoutBuffer = lines.pop();

				for (const line of lines) {
					if (!line) continue;
					try {
						const message = JSON.parse(line);

						const type = message.type;

						delete message.type;

						daemon._events.emit(type, message);

						if (type === "command_end") {
							daemon._running = false;
							daemon._sendCommand();
						}
					} catch(e) {
						daemon._events.emit("line", {
							line,
							source: "stdout"
						});
					}
				}

				// Check if remaining buffer contains a complete JSON message
				// (command_end may arrive without a trailing newline)
				if (stdoutBuffer) {
					try {
						const message = JSON.parse(stdoutBuffer.trim());

						const type = message.type;

						delete message.type;

						daemon._events.emit(type, message);
						stdoutBuffer = "";

						if (type === "command_end") {
							daemon._running = false;
							daemon._sendCommand();
						}
					} catch(e) {
						// Not valid JSON yet, leave in buffer
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

			if (type === "command") {
				daemon._queue.push(message);
				daemon._sendCommand();
			} else {
				daemon._child.stdin.write(JSON.stringify(message) + "\n");
			}
		},

		removeEventListener: (...args) => {
			return daemon._events.removeListener(...args);
		}
	};

	return daemon._start(...args);
};
