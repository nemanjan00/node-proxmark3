const command = require("../command");

/**
 * Scripting commands for running Lua, Cmd and Python scripts on Proxmark3
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command functions for script operations
 */
module.exports = (clientPromise) => ({
	/**
	 * List available Lua, Cmd and Python scripts
	 *
	 * @example
	 * const output = await pm3.script.list();
	 *
	 * @returns {Promise<string>} Command output listing available scripts
	 */
	list: async () => {
		const client = await clientPromise;
		return command(client.client, ["script", "list"])([]);
	},

	/**
	 * Run a Lua, Cmd or Python script. If no extension is provided,
	 * it will search for lua/cmd/py extensions.
	 * Use `script list` to see available scripts.
	 *
	 * @param {string} filename - Name of the script to run
	 * @param {string[]} [params=[]] - Additional parameters to pass to the script
	 *
	 * @example
	 * const output = await pm3.script.run("my_script");
	 * @example
	 * const output = await pm3.script.run("my_script", ["-h"]);
	 *
	 * @returns {Promise<string>} Command output from script execution
	 */
	run: async (filename, params = []) => {
		const client = await clientPromise;
		const args = [filename, ...params];
		return command(client.client, ["script", "run"])(args);
	}
});
