let promise = Promise.resolve();

const command = (client, args) => {
	return (params) => {
		const oldPromise = promise;
		return promise = new Promise((resolve) => {
			oldPromise.then(() => {
				const command = args.concat(params).join(" ");

				const output = [];

				const listener = (data) => {
					output.push(data.line);
				};

				const cleanup = () => {
					client.removeEventListener("line", listener);
					client.removeEventListener("command_end", endListener);
					client.removeEventListener("error", errorListener);
				};

				const endListener = () => {
					cleanup();
					resolve(output.join("\n"));
				};

				const errorListener = (data) => {
					cleanup();
					resolve(output.join("\n") + "\nError: " + (data.message || "PM3 process died"));
				};

				client.on("line", listener);

				client.on("command_end", endListener);

				client.on("error", errorListener);

				client.emit("command", {
					command
				});
			});
		});
	};
};

module.exports = command;
