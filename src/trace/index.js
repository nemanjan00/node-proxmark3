const command = require("../command");

/**
 * Trace buffer manipulation and protocol annotation commands
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command functions for trace operations
 */
module.exports = (clientPromise) => ({
	/**
	 * Annotate trace buffer with selected protocol data.
	 * You can load a trace from file (see `trace load`) or it will be
	 * downloaded from the device by default.
	 *
	 * @param {Object} [options={}] - Options for listing trace data
	 * @param {boolean} [options.buffer=false] - Use data from trace buffer instead of downloading from device
	 * @param {boolean} [options.frame=false] - Show frame delay times
	 * @param {boolean} [options.markCRC=false] - Mark CRC bytes in the output
	 * @param {boolean} [options.relative=false] - Show relative times (gap and duration)
	 * @param {boolean} [options.microseconds=false] - Display times in microseconds instead of clock cycles
	 * @param {boolean} [options.hexdump=false] - Show hexdump to convert to pcap(ng) or import into Wireshark
	 * @param {string} [options.type] - Protocol to annotate the trace (e.g. "raw", "14a", "14b", "15", "7816", "cryptorf", "des", "felica", "ht1", "ht2", "hts", "htu", "iclass", "legic", "lto", "mf", "seos", "thinfilm", "topaz", "mfp", "fmcos20")
	 * @param {string} [options.file] - Filename of key dictionary for decryption
	 *
	 * @example
	 * const output = await pm3.trace.list({ type: "14a" });
	 * @example
	 * const output = await pm3.trace.list({ type: "mf", file: "mfc_default_keys.dic" });
	 * @example
	 * const output = await pm3.trace.list({ type: "14a", buffer: true, frame: true });
	 *
	 * @returns {Promise<string>} Annotated trace output
	 */
	list: async ({ buffer, frame, markCRC, relative, microseconds, hexdump, type, file } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (buffer) args.push("--buffer");
		if (frame) args.push("--frame");
		if (markCRC) args.push("-c");
		if (relative) args.push("-r");
		if (microseconds) args.push("-u");
		if (hexdump) args.push("-x");
		if (type !== undefined && type !== null) args.push("--type", String(type));
		if (file !== undefined && file !== null) args.push("--file", String(file));
		return command(client.client, ["trace", "list"])(args);
	},

	/**
	 * Load protocol data from a binary file into the trace buffer.
	 * File extension is .trace.
	 *
	 * @param {string} file - Trace file to load (without .trace extension)
	 *
	 * @example
	 * const output = await pm3.trace.load("mytracefile");
	 *
	 * @returns {Promise<string>} Command output
	 */
	load: async (file) => {
		const client = await clientPromise;
		return command(client.client, ["trace", "load"])(["--file", String(file)]);
	},

	/**
	 * Save protocol data from the trace buffer to a binary file.
	 * File extension is .trace.
	 *
	 * @param {string} file - Trace file to save to (without .trace extension)
	 *
	 * @example
	 * const output = await pm3.trace.save("mytracefile");
	 *
	 * @returns {Promise<string>} Command output
	 */
	save: async (file) => {
		const client = await clientPromise;
		return command(client.client, ["trace", "save"])(["--file", String(file)]);
	}
});
