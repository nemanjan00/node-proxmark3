const command = require("../command");

/**
 * Flash memory manipulation commands.
 *
 * Provides functions for reading, writing, and managing the Proxmark3 device
 * flash memory, including direct memory access and the SPIFFS file system.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command tree for mem
 */
module.exports = (clientPromise) => ({
	/**
	 * Set the baudrate for SPI flash memory communications.
	 * Reading Flash ID will virtually always fail under 48MHz setting.
	 * Unless you know what you are doing, please stay at 24MHz.
	 * If >= 24MHz, FASTREADS instead of READS instruction will be used.
	 *
	 * @param {number} mhz - SPI baudrate in MHz (required). Must be 24 or 48
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Set baudrate to 48MHz
	 * await mem.baudrate(48);
	 *
	 * @example
	 * // Set baudrate to 24MHz (safe default)
	 * await mem.baudrate(24);
	 */
	baudrate: async (mhz) => {
		const client = await clientPromise;
		if (mhz === undefined || mhz === null) {
			throw new Error("mhz is required (24 or 48)");
		}
		const v = Number(mhz);
		if (v !== 24 && v !== 48) {
			throw new RangeError("mhz must be 24 or 48");
		}
		return command(client.client, ["mem", "baudrate"])(["--mhz", String(v)]);
	},

	/**
	 * Dump flash memory on device into a file or view in console.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {number} [options.offset] - Offset in memory
	 * @param {number} [options.length] - Number of bytes to read
	 * @param {boolean} [options.view=false] - View dump in console
	 * @param {string} [options.file] - Filename to save dump to
	 * @param {number} [options.columns=32] - Column breaks for display
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Download all flash memory to file
	 * await mem.dump({ file: "myfile" });
	 *
	 * @example
	 * // Display 128 bytes from offset 262015 (RSA sig)
	 * await mem.dump({ view: true, offset: 262015, length: 128 });
	 *
	 * @example
	 * // Display 58 bytes from offset 241664 and save to file
	 * await mem.dump({ view: true, file: "myfile", offset: 241664, length: 58 });
	 */
	dump: async ({ offset, length, view, file, columns } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
		if (length !== undefined && length !== null) args.push("--len", String(length));
		if (view) args.push("--view");
		if (file !== undefined && file !== null) args.push("--file", String(file));
		if (columns !== undefined && columns !== null) args.push("--cols", String(columns));
		return command(client.client, ["mem", "dump"])(args);
	},

	/**
	 * Collect signature and verify it from flash memory.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.sign=false] - Create a signature
	 * @param {string} [options.flashId] - Flash memory ID, 8 hex bytes
	 * @param {string} [options.pem] - Key filename in PEM format
	 * @param {boolean} [options.verbose=false] - Verbose output (print public keys)
	 * @param {boolean} [options.write=false] - Write signature to flash memory
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Show flash memory info
	 * await mem.info();
	 *
	 * @example
	 * // Print public keys
	 * await mem.info({ verbose: true });
	 *
	 * @example
	 * // Generate and write a RSA 1024 signature
	 * await mem.info({ sign: true, pem: "pm3_generic_private_key.pem", write: true });
	 */
	info: async ({ sign, flashId, pem, verbose, write } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (sign) args.push("--sign");
		if (flashId !== undefined && flashId !== null) args.push("-d", String(flashId));
		if (pem !== undefined && pem !== null) args.push("--pem", String(pem));
		if (verbose) args.push("--verbose");
		if (write) args.push("--write");
		return command(client.client, ["mem", "info"])(args);
	},

	/**
	 * Load a binary file into flash memory on device.
	 * Warning: the memory area to be written must have been wiped first.
	 * Dictionaries are serviced as files in SPIFFS, so no wipe is needed for those.
	 *
	 * @param {string} file - File name to upload (required)
	 * @param {Object} [options={}] - Options
	 * @param {number} [options.offset] - Offset in memory
	 * @param {string} [options.dictType] - Dictionary key type: "mfc" (6-byte MIFARE Classic), "iclass" (8-byte iClass), "t55xx" (4-byte T55xx), "ulc" (16-byte MIFARE UL-C), or "aes" (16-byte MIFARE UL-AES)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Upload file at default offset 0
	 * await mem.load("myfile");
	 *
	 * @example
	 * // Upload file at offset 1024
	 * await mem.load("myfile", { offset: 1024 });
	 *
	 * @example
	 * // Upload MIFARE Classic keys
	 * await mem.load("mfc_default_keys", { dictType: "mfc" });
	 *
	 * @example
	 * // Upload T55XX passwords
	 * await mem.load("t55xx_default_pwds", { dictType: "t55xx" });
	 */
	load: async (file, { offset, dictType } = {}) => {
		const client = await clientPromise;
		if (file === undefined || file === null) {
			throw new Error("file is required");
		}
		const args = [];
		if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
		if (dictType !== undefined && dictType !== null) {
			const valid = ["mfc", "iclass", "t55xx", "ulc", "aes"];
			const d = String(dictType).toLowerCase();
			if (!valid.includes(d)) {
				throw new RangeError(`dictType must be one of: ${valid.join(", ")}`);
			}
			if (d === "mfc") args.push("--mfc");
			else if (d === "iclass") args.push("--iclass");
			else if (d === "t55xx") args.push("--t55xx");
			else if (d === "ulc") args.push("--ulc");
			else if (d === "aes") args.push("--aes");
		}
		args.push("--file", String(file));
		return command(client.client, ["mem", "load"])(args);
	},

	/**
	 * Wipe flash memory on device, filling it with 0xFF.
	 * Use with caution.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {number} [options.page] - Page number to wipe
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Wipe first page
	 * await mem.wipe({ page: 0 });
	 */
	wipe: async ({ page } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (page !== undefined && page !== null) args.push("-p", String(page));
		return command(client.client, ["mem", "wipe"])(args);
	},

	/** SPIFFS (SPI Flash File System) sub-commands */
	spiffs: {
		/**
		 * Check and try to defragment a faulty/fragmented SPIFFS file system.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.check();
		 */
		check: async () => {
			const client = await clientPromise;
			return command(client.client, ["mem", "spiffs", "check"])([]);
		},

		/**
		 * Copy a file to another (destructively) in the SPIFFS file system.
		 *
		 * @param {string} src - Source file name (required)
		 * @param {string} dest - Destination file name (required)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.copy("aaa.bin", "aaa_cpy.bin");
		 */
		copy: async (src, dest) => {
			const client = await clientPromise;
			if (src === undefined || src === null) {
				throw new Error("src is required");
			}
			if (dest === undefined || dest === null) {
				throw new Error("dest is required");
			}
			return command(client.client, ["mem", "spiffs", "copy"])(["--src", String(src), "--dest", String(dest)]);
		},

		/**
		 * Dump a device SPIFFS file to a local file.
		 * Size is handled by first sending a STAT command against the file to verify existence.
		 *
		 * @param {string} src - SPIFFS file name to download (required)
		 * @param {Object} [options={}] - Options
		 * @param {string} [options.dest] - Local file name to save to (without .bin extension)
		 * @param {boolean} [options.trace=false] - Download into trace buffer instead of file
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Download binary file from device
		 * await mem.spiffs.dump("tag.bin");
		 *
		 * @example
		 * // Download tag.bin, save as a001.bin
		 * await mem.spiffs.dump("tag.bin", { dest: "a001" });
		 *
		 * @example
		 * // Download into trace buffer
		 * await mem.spiffs.dump("tag.bin", { trace: true });
		 */
		dump: async (src, { dest, trace } = {}) => {
			const client = await clientPromise;
			if (src === undefined || src === null) {
				throw new Error("src (SPIFFS file name) is required");
			}
			const args = ["--src", String(src)];
			if (dest !== undefined && dest !== null) args.push("--dest", String(dest));
			if (trace) args.push("--trace");
			return command(client.client, ["mem", "spiffs", "dump"])(args);
		},

		/**
		 * Print SPIFFS file system info and usage statistics.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.info();
		 */
		info: async () => {
			const client = await clientPromise;
			return command(client.client, ["mem", "spiffs", "info"])([]);
		},

		/**
		 * Mount the SPIFFS file system if not already mounted.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.mount();
		 */
		mount: async () => {
			const client = await clientPromise;
			return command(client.client, ["mem", "spiffs", "mount"])([]);
		},

		/**
		 * Remove a file from the SPIFFS file system.
		 *
		 * @param {string} file - File name to remove (required)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.remove("lasttag.bin");
		 */
		remove: async (file) => {
			const client = await clientPromise;
			if (file === undefined || file === null) {
				throw new Error("file is required");
			}
			return command(client.client, ["mem", "spiffs", "remove"])(["--file", String(file)]);
		},

		/**
		 * Rename/move a file in the SPIFFS file system.
		 *
		 * @param {string} src - Source file name (required)
		 * @param {string} dest - Destination file name (required)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.rename("aaa.bin", "bbb.bin");
		 */
		rename: async (src, dest) => {
			const client = await clientPromise;
			if (src === undefined || src === null) {
				throw new Error("src is required");
			}
			if (dest === undefined || dest === null) {
				throw new Error("dest is required");
			}
			return command(client.client, ["mem", "spiffs", "rename"])(["--src", String(src), "--dest", String(dest)]);
		},

		/**
		 * Test SPIFFS operations. Requires wiping pages 0 and 1 first.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.test();
		 */
		test: async () => {
			const client = await clientPromise;
			return command(client.client, ["mem", "spiffs", "test"])([]);
		},

		/**
		 * Print the flash memory file system tree.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.tree();
		 */
		tree: async () => {
			const client = await clientPromise;
			return command(client.client, ["mem", "spiffs", "tree"])([]);
		},

		/**
		 * Unmount the SPIFFS file system.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.unmount();
		 */
		unmount: async () => {
			const client = await clientPromise;
			return command(client.client, ["mem", "spiffs", "unmount"])([]);
		},

		/**
		 * Upload a binary file into the device SPIFFS file system.
		 * Warning: the memory area to be written must have been wiped first
		 * (already taken care of for dictionaries).
		 * File names can only be 32 bytes long on device SPIFFS.
		 *
		 * @param {string} src - Local source file name (required)
		 * @param {string} dest - Destination file name on device (required)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.upload("local.bin", "dest.bin");
		 */
		upload: async (src, dest) => {
			const client = await clientPromise;
			if (src === undefined || src === null) {
				throw new Error("src is required");
			}
			if (dest === undefined || dest === null) {
				throw new Error("dest is required");
			}
			return command(client.client, ["mem", "spiffs", "upload"])(["--src", String(src), "--dest", String(dest)]);
		},

		/**
		 * View a file on flash memory on the device in console.
		 *
		 * @param {string} file - SPIFFS file name to view (required)
		 * @param {Object} [options={}] - Options
		 * @param {number} [options.columns=16] - Column breaks for display
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.view("tag.bin");
		 *
		 * @example
		 * await mem.spiffs.view("tag.bin", { columns: 32 });
		 */
		view: async (file, { columns } = {}) => {
			const client = await clientPromise;
			if (file === undefined || file === null) {
				throw new Error("file is required");
			}
			const args = ["--file", String(file)];
			if (columns !== undefined && columns !== null) args.push("--cols", String(columns));
			return command(client.client, ["mem", "spiffs", "view"])(args);
		},

		/**
		 * Wipe all files on the device SPIFFS file system.
		 * Warning: this is destructive and removes all files.
		 *
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await mem.spiffs.wipe();
		 */
		wipe: async () => {
			const client = await clientPromise;
			return command(client.client, ["mem", "spiffs", "wipe"])([]);
		},
	},
});
