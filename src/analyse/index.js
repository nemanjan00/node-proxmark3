const command = require("../command");

/**
 * Analysis utilities for checksums, CRC calculations, frequency computations,
 * LFSR operations, and other data manipulation tools.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Analyse command functions
 */
module.exports = (clientPromise) => ({
	/**
	 * Calculate the final byte value needed to produce a given LRC using a rolling XOR.
	 * Specify the bytes of a UID with a known LRC to find the missing XOR byte.
	 *
	 * @param {Object} options - LRC options
	 * @param {string} options.data - Hex bytes to calculate the missing XOR in a LRC (required)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Find the LRC byte for a UID ending with BA
	 * await analyse.lrc({ data: "04008064BA" });
	 * // Target (BA) requires final LRC XOR byte value: 5A
	 */
	lrc: async ({ data }) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data is required");
		}
		return command(client.client, ["analyse", "lrc"])(["--data", String(data)]);
	},

	/**
	 * Test different CRC implementations inside the PM3 source code.
	 * Note: determining the polynomial does not guarantee the desired output.
	 *
	 * @param {Object} options - CRC options
	 * @param {string} options.data - Hex bytes to calculate CRC over (required)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await analyse.crc({ data: "137AF00A0A0D" });
	 */
	crc: async ({ data }) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data is required");
		}
		return command(client.client, ["analyse", "crc"])(["--data", String(data)]);
	},

	/**
	 * Compute a checksum by summing bytes, applying an optional bit mask,
	 * and computing the ones' complement of the least significant bytes.
	 *
	 * @param {Object} options - Checksum options
	 * @param {string} options.data - Hex bytes to calculate checksum over (required)
	 * @param {string} [options.mask] - Hex bit mask to limit the output (4 hex bytes max)
	 * @param {boolean} [options.verbose=false] - Show verbose output
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Basic checksum
	 * await analyse.chksum({ data: "137AF00A0A0D" });
	 * // expected output: 0x61
	 *
	 * @example
	 * // Checksum with mask
	 * await analyse.chksum({ data: "137AF00A0A0D", mask: "FF" });
	 */
	chksum: async ({ data, mask, verbose }) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data is required");
		}
		const args = ["--data", String(data)];
		if (mask !== undefined && mask !== null) args.push("--mask", String(mask));
		if (verbose) args.push("--verbose");
		return command(client.client, ["analyse", "chksum"])(args);
	},

	/**
	 * Search for date/time stamps in a given array of bytes.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await analyse.dates();
	 */
	dates: async () => {
		const client = await clientPromise;
		return command(client.client, ["analyse", "dates"])([]);
	},

	/**
	 * Examine the LEGIC Prime LFSR by iterating the first 48 values from a
	 * given initialization vector, optionally searching for a specific output value.
	 *
	 * @param {Object} options - LFSR options
	 * @param {string} options.iv - Initialization vector as a single hex byte (required)
	 * @param {string} [options.find] - LFSR output value to search for (1 hex byte)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Iterate LFSR with IV 0x55
	 * await analyse.lfsr({ iv: "55" });
	 *
	 * @example
	 * // Search for a specific LFSR output
	 * await analyse.lfsr({ iv: "55", find: "AA" });
	 */
	lfsr: async ({ iv, find }) => {
		const client = await clientPromise;
		if (iv === undefined || iv === null) {
			throw new Error("iv is required");
		}
		const args = ["--iv", String(iv)];
		if (find !== undefined && find !== null) args.push("--find", String(find));
		return command(client.client, ["analyse", "lfsr"])(args);
	},

	/**
	 * Internal test command for byte manipulation (Iceman's test command).
	 *
	 * @param {Object} options - Test options
	 * @param {string} options.data - Hex bytes to manipulate (required)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await analyse.a({ data: "137AF00A0A0D" });
	 */
	a: async ({ data }) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data is required");
		}
		return command(client.client, ["analyse", "a"])(["--data", String(data)]);
	},

	/**
	 * Generate a 4-byte NUID from a 7-byte UID, or run self-tests.
	 *
	 * @param {Object} [options={}] - NUID options
	 * @param {string} [options.data] - 7-byte UID as hex to convert to NUID
	 * @param {boolean} [options.test=false] - Run self-tests
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Convert a 7-byte UID to NUID
	 * await analyse.nuid({ data: "11223344556677" });
	 *
	 * @example
	 * // Run self-tests
	 * await analyse.nuid({ test: true });
	 */
	nuid: async ({ data, test } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (data !== undefined && data !== null) args.push("--data", String(data));
		if (test) args.push("--test");
		return command(client.client, ["analyse", "nuid"])(args);
	},

	/**
	 * Load a binary string into the DemodBuffer for further analysis.
	 *
	 * @param {Object} options - Demod buffer options
	 * @param {string} options.data - Binary string to load (e.g. "0011101001001011") (required)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await analyse.demodbuff({ data: "0011101001001011" });
	 */
	demodbuff: async ({ data }) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data is required");
		}
		return command(client.client, ["analyse", "demodbuff"])(["--data", String(data)]);
	},

	/**
	 * Calculate wave lengths from frequency, capacitance, and/or inductance values.
	 * Provide any combination of two values to compute the third.
	 *
	 * @param {Object} [options={}] - Frequency calculation options
	 * @param {number} [options.frequency] - Resonating frequency in hertz (Hz)
	 * @param {number} [options.capacitance] - Capacitance in micro farads (F)
	 * @param {number} [options.inductance] - Inductance in micro henries (H)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Calculate with default values
	 * await analyse.freq();
	 *
	 * @example
	 * // Calculate with specific frequency
	 * await analyse.freq({ frequency: 125000 });
	 */
	freq: async ({ frequency, capacitance, inductance } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (frequency !== undefined && frequency !== null) args.push("--freq", String(frequency));
		if (capacitance !== undefined && capacitance !== null) args.push("--cap", String(capacitance));
		if (inductance !== undefined && inductance !== null) args.push("--ind", String(inductance));
		return command(client.client, ["analyse", "freq"])(args);
	},

	/**
	 * CLI parsing experiment command. Processes raw hex bytes.
	 *
	 * @param {Object} options - Foo options
	 * @param {string} options.raw - Raw hex bytes to process (required)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await analyse.foo({ raw: "a0000000a0002021" });
	 */
	foo: async ({ raw }) => {
		const client = await clientPromise;
		if (raw === undefined || raw === null) {
			throw new Error("raw is required");
		}
		return command(client.client, ["analyse", "foo"])(["--raw", String(raw)]);
	},

	/**
	 * Convert between HF time units: ETU (1/13.56 MHz), microseconds (us),
	 * and SSP_CLK (1/3.39 MHz). Provide one value to see its equivalents.
	 *
	 * @param {Object} [options={}] - Unit conversion options
	 * @param {number} [options.etu] - Value in ETU (Elementary Time Units)
	 * @param {number} [options.us] - Value in microseconds
	 * @param {boolean} [options.selftest=false] - Run self-tests
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Convert 10 ETU to other units
	 * await analyse.units({ etu: 10 });
	 *
	 * @example
	 * // Convert 100 microseconds to other units
	 * await analyse.units({ us: 100 });
	 *
	 * @example
	 * // Run self-tests
	 * await analyse.units({ selftest: true });
	 */
	units: async ({ etu, us, selftest } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (etu !== undefined && etu !== null) args.push("--etu", String(etu));
		if (us !== undefined && us !== null) args.push("--us", String(us));
		if (selftest) args.push("--selftest");
		return command(client.client, ["analyse", "units"])(args);
	},
});
