const spawn = require("child_process").spawn;
const path = require("path");
const events = require("events");
const readline = require("readline");
const fs = require("fs");

const LOG_FILE = "/tmp/pm3-daemon.log";

function log(msg) {
	const ts = new Date().toISOString();
	fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

module.exports.createDaemon = (...args) => {
	// Clear log on new daemon creation
	fs.writeFileSync(LOG_FILE, `=== PM3 daemon started at ${new Date().toISOString()} ===\n`);

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
					log("EVENT: started — resolving clientPromise");
					resolve(daemon);
				});

				daemon.on("error", (data) => {
					log("EVENT: error — " + (data.message || "unknown"));
					reject(new Error(data.message || "PM3 process error"));
				});

				daemon._subscribeToMessages();
			});
		},

		_startChild: () => {
			log("Spawning: " + daemon._proxmarkClientPath);
			daemon._child = spawn(daemon._proxmarkClientPath, [
				"-c",
				"script run interpreter",
				"-i"
			], {
				cwd: path.resolve(__dirname, "../../")
			});
			log("Child PID: " + daemon._child.pid);
		},

		_sendCommand: () => {
			log("_sendCommand: running=" + daemon._running + " queueLen=" + daemon._queue.length);
			if (daemon._running) return;

			const command = daemon._queue.shift();

			if (command === undefined) {
				log("_sendCommand: queue empty, nothing to send");
				return;
			}

			const json = JSON.stringify(command);
			log("_sendCommand: WRITING to stdin: " + json);
			daemon._child.stdin.write(json + "\n");
			daemon._running = true;
		},

		_subscribeToMessages: () => {
			const stderrRl = readline.createInterface({ input: daemon._child.stderr });

			stderrRl.on("line", (line) => {
				if (!line) return;
				daemon._events.emit("line", {
					line,
					source: "stderr"
				});
			});

			const stdoutRl = readline.createInterface({ input: daemon._child.stdout });

			stdoutRl.on("line", (line) => {
				if (!line) return;
				try {
					const message = JSON.parse(line);

					const type = message.type;

					delete message.type;

					log("STDOUT JSON: type=" + type);
					daemon._events.emit(type, message);

					if (type === "command_end") {
						log("command_end: setting _running=false, calling _sendCommand");
						daemon._running = false;
						daemon._sendCommand();
					}
				} catch(e) {
					daemon._events.emit("line", {
						line,
						source: "stdout"
					});
				}
			});

			daemon._child.on("exit", (code, signal) => {
				log("CHILD EXIT: code=" + code + " signal=" + signal);
				daemon._events.emit("error", {
					message: `PM3 process exited (code: ${code}, signal: ${signal})`
				});
			});

			daemon._child.on("error", (err) => {
				log("CHILD ERROR: " + err.message);
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
				log("EMIT command: " + (message.command || "?") + " — pushing to queue");
				daemon._queue.push(message);
				daemon._sendCommand();
			} else {
				log("EMIT " + type + ": writing to stdin");
				daemon._child.stdin.write(JSON.stringify(message) + "\n");
			}
		},

		removeEventListener: (...args) => {
			return daemon._events.removeListener(...args);
		}
	};

	return daemon._start(...args);
};
