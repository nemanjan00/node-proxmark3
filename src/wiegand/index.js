const command = require("../command");

/**
 * Wiegand format encoding, decoding and listing commands
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command functions for Wiegand operations
 */
module.exports = (clientPromise) => ({
	/**
	 * Decode raw hex or binary data to Wiegand format.
	 * At least one of raw, bin, or asn1 must be provided.
	 *
	 * @param {Object} options - Decode options
	 * @param {string} [options.raw] - Raw hex data to be decoded
	 * @param {string} [options.bin] - Binary string to be decoded
	 * @param {string} [options.asn1] - New ASN.1 encoded data as raw hex to be decoded (4-13 bytes)
	 * @param {boolean} [options.force=false] - Skip preamble checking, brute force all possible lengths for raw hex input
	 *
	 * @example
	 * const output = await pm3.wiegand.decode({ raw: "2006F623AE" });
	 * @example
	 * const output = await pm3.wiegand.decode({ asn1: "06BD88EB80" });
	 * @example
	 * const output = await pm3.wiegand.decode({ raw: "2006F623AE", force: true });
	 *
	 * @returns {Promise<string>} Decoded Wiegand data
	 */
	decode: async ({ raw, bin, asn1, force } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
		if (bin !== undefined && bin !== null) args.push("--bin", String(bin));
		if (asn1 !== undefined && asn1 !== null) args.push("--new", String(asn1));
		if (force) args.push("--force");
		return command(client.client, ["wiegand", "decode"])(args);
	},

	/**
	 * Encode Wiegand formatted number to raw hex.
	 * Provide card credentials (fc, cn, etc.) and optionally a specific format.
	 *
	 * @param {Object} [options={}] - Encode options
	 * @param {string} [options.bin] - Binary string to be encoded
	 * @param {number|string} [options.fc] - Facility code
	 * @param {number|string} [options.cn] - Card number
	 * @param {number|string} [options.issue] - Issue level
	 * @param {number|string} [options.oem] - OEM code
	 * @param {string} [options.format] - Wiegand format to use (see `wiegand list` for available formats)
	 * @param {boolean} [options.asn1=false] - Encode to new ASN.1 encoded format
	 * @param {boolean} [options.preamble=false] - Add HID ProxII preamble to Wiegand output
	 * @param {boolean} [options.verbose=false] - Verbose output
	 *
	 * @example
	 * const output = await pm3.wiegand.encode({ fc: 101, cn: 1337 });
	 * @example
	 * const output = await pm3.wiegand.encode({ format: "H10301", fc: 101, cn: 1337 });
	 * @example
	 * const output = await pm3.wiegand.encode({ format: "H10301", fc: 123, cn: 4567, asn1: true });
	 *
	 * @returns {Promise<string>} Encoded Wiegand hex data
	 */
	encode: async ({ bin, fc, cn, issue, oem, format, asn1, preamble, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (bin !== undefined && bin !== null) args.push("--bin", String(bin));
		if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
		if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
		if (issue !== undefined && issue !== null) args.push("--issue", String(issue));
		if (oem !== undefined && oem !== null) args.push("--oem", String(oem));
		if (format !== undefined && format !== null) args.push("--wiegand", String(format));
		if (asn1) args.push("--new");
		if (preamble) args.push("--pre");
		if (verbose) args.push("--verbose");
		return command(client.client, ["wiegand", "encode"])(args);
	},

	/**
	 * List all available Wiegand formats.
	 *
	 * @example
	 * const output = await pm3.wiegand.list();
	 *
	 * @returns {Promise<string>} List of available Wiegand formats
	 */
	list: async () => {
		const client = await clientPromise;
		return command(client.client, ["wiegand", "list"])([]);
	}
});
