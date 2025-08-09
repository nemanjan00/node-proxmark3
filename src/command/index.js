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

				const endListener = () => {
					client.removeEventListener("line", listener);
					client.removeEventListener("command_end", endListener);

					resolve(output.join("\n"));
				};

				client.on("line", listener);

				client.on("command_end", endListener);

				client.emit("command", {
					command
				});
			});
		});
	};
};

module.exports = command;
