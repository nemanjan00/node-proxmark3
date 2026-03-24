const command = require("../command");

/**
 * NFC (Near Field Communication) Data Exchange Format commands.
 *
 * Provides functions for reading, writing, decoding, and simulating NDEF data
 * across various NFC tag types including Type 1 (Topaz), Type 2 (MIFARE Ultralight),
 * Type 4A (ISO14443A), Type 4B (ISO14443B), MIFARE Classic/Plus, and NFC Barcode (Thinfilm).
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command tree for nfc
 */
module.exports = (clientPromise) => ({
	/**
	 * Decode and print NFC Data Exchange Format (NDEF).
	 * You must provide either data in hex or a filename, but not both.
	 *
	 * @param {Object} [options={}] - Options (provide either data or file, not both)
	 * @param {string} [options.data] - NDEF data to decode as hex string
	 * @param {string} [options.file] - File to load NDEF data from
	 * @param {boolean} [options.override=false] - Override failed CRC check
	 * @param {boolean} [options.verbose=false] - Verbose output
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Decode NDEF from hex data
	 * await nfc.decode({ data: "9101085402656e48656c6c6f5101085402656e576f726c64" });
	 *
	 * @example
	 * // Decode NDEF from file
	 * await nfc.decode({ file: "myfilename" });
	 */
	decode: async ({ data, file, override, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (data !== undefined && data !== null) args.push("--data", String(data));
		if (file !== undefined && file !== null) args.push("--file", String(file));
		if (override) args.push("--override");
		if (verbose) args.push("--verbose");
		return command(client.client, ["nfc", "decode"])(args);
	},

	/** NFC Barcode (Thinfilm) tag sub-commands */
	barcode: {
		/**
		 * Read info from Thinfilm/NFC Barcode tags.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.barcode.read();
		 */
		read: async () => {
			const client = await clientPromise;
			return command(client.client, ["nfc", "barcode", "read"])([]);
		},

		/**
		 * Simulate a Thinfilm/NFC Barcode tag.
		 *
		 * @param {string} data - Hex bytes to send (required)
		 * @param {Object} [options={}] - Options
		 * @param {boolean} [options.raw=false] - Raw mode: provided bytes should include CRC
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.barcode.sim("0102030405");
		 *
		 * @example
		 * // Raw mode with CRC included
		 * await nfc.barcode.sim("0102030405AABB", { raw: true });
		 */
		sim: async (data, { raw } = {}) => {
			const client = await clientPromise;
			if (data === undefined || data === null) {
				throw new Error("data (hex bytes) is required");
			}
			const args = ["--data", String(data)];
			if (raw) args.push("--raw");
			return command(client.client, ["nfc", "barcode", "sim"])(args);
		},
	},

	/** MIFARE Classic/Plus NFC sub-commands */
	mf: {
		/**
		 * Format a MIFARE Classic tag as an NFC tag with NDEF.
		 * If no key file is given, it will try default keys and MAD keys to detect
		 * if the tag is already formatted. If not, it will try finding a key file
		 * based on the UID (e.g., from a previous autopwn run).
		 *
		 * @param {Object} [options={}] - Options
		 * @param {string} [options.keys] - Filename of keys file
		 * @param {string} [options.cardSize="1k"] - Card size: "mini" (S20), "1k" (S50, default), "2k", or "4k" (S70)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Format with default keys
		 * await nfc.mf.cformat();
		 *
		 * @example
		 * // Format a 4k card with custom keys
		 * await nfc.mf.cformat({ keys: "mykeys.bin", cardSize: "4k" });
		 */
		cformat: async ({ keys, cardSize } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keys !== undefined && keys !== null) args.push("--keys", String(keys));
			if (cardSize !== undefined && cardSize !== null) {
				const valid = ["mini", "1k", "2k", "4k"];
				const s = String(cardSize).toLowerCase();
				if (!valid.includes(s)) {
					throw new RangeError(`cardSize must be one of: ${valid.join(", ")}`);
				}
				args.push(`--${s}`);
			}
			return command(client.client, ["nfc", "mf", "cformat"])(args);
		},

		/**
		 * Read NFC Data Exchange Format (NDEF) from a MIFARE Classic tag.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @param {string} [options.aid] - Replace default AID for NDEF
		 * @param {string} [options.key] - Replace default key for NDEF
		 * @param {boolean} [options.keyb=false] - Use key B for access sectors (default: key A)
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.override=false] - Override failed CRC check
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Read NDEF from MIFARE Classic
		 * await nfc.mf.cread();
		 *
		 * @example
		 * // Read with custom key and save to file
		 * await nfc.mf.cread({ key: "FFFFFFFFFFFF", file: "ndef_dump" });
		 */
		cread: async ({ verbose, aid, key, keyb, file, override } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyb) args.push("--keyb");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (override) args.push("--override");
			return command(client.client, ["nfc", "mf", "cread"])(args);
		},

		/**
		 * Write raw NDEF hex bytes to a MIFARE Classic tag.
		 * This command assumes the tag has already been NFC/NDEF formatted.
		 *
		 * @param {Object} [options={}] - Options (provide either data or file, not both)
		 * @param {string} [options.data] - Raw NDEF hex bytes to write
		 * @param {string} [options.file] - Write raw NDEF file to tag
		 * @param {boolean} [options.fixHeaders=false] - Fix NDEF record headers/terminator block if missing
		 * @param {string} [options.cardSize="1k"] - Card size: "mini" (S20), "1k" (S50, default), "2k", or "4k" (S70)
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Write NDEF data to a 1k card
		 * await nfc.mf.cwrite({ data: "0103d020240203e02c040300fe" });
		 *
		 * @example
		 * // Write from file to a 4k card with header fix
		 * await nfc.mf.cwrite({ file: "ndef.bin", fixHeaders: true, cardSize: "4k" });
		 */
		cwrite: async ({ data, file, fixHeaders, cardSize, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (data !== undefined && data !== null) args.push("-d", String(data));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (fixHeaders) args.push("-p");
			if (cardSize !== undefined && cardSize !== null) {
				const valid = ["mini", "1k", "2k", "4k"];
				const s = String(cardSize).toLowerCase();
				if (!valid.includes(s)) {
					throw new RangeError(`cardSize must be one of: ${valid.join(", ")}`);
				}
				args.push(`--${s}`);
			}
			if (verbose) args.push("--verbose");
			return command(client.client, ["nfc", "mf", "cwrite"])(args);
		},

		/**
		 * Read NFC Data Exchange Format (NDEF) from a MIFARE Plus tag.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @param {string} [options.aid] - Replace default AID for NDEF
		 * @param {string} [options.key] - Replace default key for NDEF
		 * @param {boolean} [options.keyb=false] - Use key B for access sectors (default: key A)
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.override=false] - Override failed CRC check
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Read NDEF from MIFARE Plus
		 * await nfc.mf.pread();
		 *
		 * @example
		 * // Read with custom key B and save to file
		 * await nfc.mf.pread({ key: "FFFFFFFFFFFF", keyb: true, file: "ndef_dump" });
		 */
		pread: async ({ verbose, aid, key, keyb, file, override } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyb) args.push("--keyb");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (override) args.push("--override");
			return command(client.client, ["nfc", "mf", "pread"])(args);
		},
	},

	/** NFC Forum Tag Type 1 (Topaz) sub-commands */
	type1: {
		/**
		 * Read info and NDEF data from NFC Type 1 (Topaz) tags.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.type1.read();
		 *
		 * @example
		 * await nfc.type1.read({ file: "ndef_type1", verbose: true });
		 */
		read: async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["nfc", "type1", "read"])(args);
		},
	},

	/** NFC Forum Tag Type 2 (MIFARE Ultralight) sub-commands */
	type2: {
		/**
		 * Read NFC Data Exchange Format (NDEF) from a Type 2 (MIFARE Ultralight) tag.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {boolean} [options.swapEndian=false] - Swap entered key's endianness
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @param {boolean} [options.secureChannel=false] - Use secure channel (must have key)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.type2.read();
		 *
		 * @example
		 * await nfc.type2.read({ file: "ndef_type2", verbose: true });
		 */
		read: async ({ swapEndian, file, verbose, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (swapEndian) args.push("-l");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["nfc", "type2", "read"])(args);
		},
	},

	/** NFC Forum Tag Type 4A (ISO14443A) sub-commands */
	type4a: {
		/**
		 * Format an ISO14443-A tag as an NFC tag with NDEF.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.type4a.format();
		 */
		format: async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["nfc", "type4a", "format"])(args);
		},

		/**
		 * Read NFC Data Exchange Format (NDEF) from a Type 4A (ISO14443A) tag.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.type4a.read();
		 *
		 * @example
		 * await nfc.type4a.read({ file: "ndef_type4a", verbose: true });
		 */
		read: async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["nfc", "type4a", "read"])(args);
		},

		/**
		 * Write raw NDEF hex bytes to a Type 4A (ISO14443A) tag.
		 * This command assumes the tag has already been NFC/NDEF formatted.
		 *
		 * @param {Object} [options={}] - Options (provide either data or file, not both)
		 * @param {string} [options.data] - Raw NDEF hex bytes to write
		 * @param {string} [options.file] - Write raw NDEF file to tag
		 * @param {boolean} [options.fixHeaders=false] - Fix NDEF record headers/terminator block if missing
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Write NDEF data
		 * await nfc.type4a.write({ data: "0103d020240203e02c040300fe" });
		 *
		 * @example
		 * // Write from file with header fix
		 * await nfc.type4a.write({ file: "ndef.bin", fixHeaders: true });
		 */
		write: async ({ data, file, fixHeaders, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (data !== undefined && data !== null) args.push("-d", String(data));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (fixHeaders) args.push("-p");
			if (verbose) args.push("--verbose");
			return command(client.client, ["nfc", "type4a", "write"])(args);
		},

		/**
		 * Read NFC Data Exchange Format (NDEF) from an ST25TA tag.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {string} [options.password] - 16 byte read password as hex
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.type4a.st25taread();
		 *
		 * @example
		 * await nfc.type4a.st25taread({ password: "00000000000000000000000000000000", file: "st25ta_ndef" });
		 */
		st25taread: async ({ password, file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["nfc", "type4a", "st25taread"])(args);
		},
	},

	/** NFC Forum Tag Type 4B (ISO14443B) sub-commands */
	type4b: {
		/**
		 * Read NFC Data Exchange Format (NDEF) from a Type 4B (ISO14443B) tag.
		 *
		 * @param {Object} [options={}] - Options
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.verbose=false] - Verbose output
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await nfc.type4b.read();
		 *
		 * @example
		 * await nfc.type4b.read({ file: "ndef_type4b", verbose: true });
		 */
		read: async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["nfc", "type4b", "read"])(args);
		},
	},
});
