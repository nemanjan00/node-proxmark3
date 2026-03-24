const command = require("../command");

/**
 * Helper to map a cardSize value ("mini", "1k", "2k", "4k") to its CLI flag.
 * @param {string} size
 * @returns {string}
 */
function cardSizeFlag(size) {
	const map = { mini: "--mini", "1k": "--1k", "1k+": "--1k+", "2k": "--2k", "4k": "--4k" };
	return map[String(size).toLowerCase()] || "--1k";
}

/**
 * Helper to map a SIMD instruction set name to its CLI flag.
 * @param {string} simd - one of "none", "mmx", "sse2", "avx", "avx2", "avx512"
 * @returns {string|undefined}
 */
function simdFlag(simd) {
	const map = { none: "--in", mmx: "--im", sse2: "--is", avx: "--ia", avx2: "--i2", avx512: "--i5" };
	return simd ? map[String(simd).toLowerCase()] : undefined;
}

/**
 * MIFARE Classic (mf) subgroup commands for Proxmark3 high-frequency module.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command tree for hf mf
 */
module.exports = (clientPromise) => ({
	mf: {
		acl:
		/**
		 * Print decoded MIFARE Classic access rights (ACL).
		 * A = key A, B = key B, AB = both. ACCESS = access bytes in sector trailer.
		 * Increment, decrement, transfer, restore is for value blocks.
		 *
		 * @param {Object} options
		 * @param {string} options.data - ACL bytes specified as 3 hex bytes
		 * @example
		 * // Decode access rights
		 * await pm3.hf.mf.acl({ data: "FF0780" });
		 * @returns {Promise<string>} Decoded ACL output
		 */
		async ({ data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "acl"])(args);
		},

		auth4:
		/**
		 * Execute AES authentication command in ISO14443-4.
		 *
		 * @param {Object} options
		 * @param {string} options.keyNum - Key number, 2 hex bytes
		 * @param {string} options.key - AES key, 16 hex bytes
		 * @example
		 * await pm3.hf.mf.auth4({ keyNum: "4000", key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Authentication result
		 */
		async ({ keyNum, key }) => {
			const client = await clientPromise;
			const args = [];
			args.push("-n", String(keyNum));
			args.push("--key", String(key));
			return command(client.client, ["hf", "mf", "auth4"])(args);
		},

		autopwn:
		/**
		 * Automate the key recovery process on MIFARE Classic cards.
		 * Uses fchk, chk, darkside, nested, hardnested, and staticnested to recover keys.
		 * If all keys are found, dumps card content to file and emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {string|string[]} [options.key] - Known key(s), 12 hex bytes each
		 * @param {number} [options.sector] - Input sector number
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {string} [options.file] - Filename of dictionary
		 * @param {string} [options.suffix] - Suffix added to generated files
		 * @param {boolean} [options.slow] - Slower acquisition (required by some non-standard cards)
		 * @param {boolean} [options.legacy] - Legacy mode (use the slow `hf mf chk`)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.mem] - Use dictionary from flash memory
		 * @param {boolean} [options.noSave] - No save to file
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {string} [options.simd] - SIMD instruction set: "none", "mmx", "sse2", "avx", "avx2", "avx512"
		 * @example
		 * // Full autopwn on 1K card
		 * await pm3.hf.mf.autopwn();
		 * // With known key on sector 0
		 * await pm3.hf.mf.autopwn({ sector: 0, keyType: "a", key: "FFFFFFFFFFFF", cardSize: "1k" });
		 * @returns {Promise<string>} Key recovery and dump results
		 */
		async ({ key, sector, keyType, file, suffix, slow, legacy, verbose, mem, noSave, cardSize, simd } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) {
				const keys = Array.isArray(key) ? key : [key];
				for (const k of keys) args.push("--key", String(k));
			}
			if (sector !== undefined && sector !== null) args.push("--sector", String(sector));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (suffix !== undefined && suffix !== null) args.push("--suffix", String(suffix));
			if (slow) args.push("--slow");
			if (legacy) args.push("--legacy");
			if (verbose) args.push("--verbose");
			if (mem) args.push("--mem");
			if (noSave) args.push("--ns");
			if (cardSize) args.push(cardSizeFlag(cardSize));
			const sf = simdFlag(simd);
			if (sf) args.push(sf);
			return command(client.client, ["hf", "mf", "autopwn"])(args);
		},

		brute:
		/**
		 * Smart bruteforce attack, exploiting common patterns, bugs, and bad designs in key generators.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.emu] - Fill simulator keys from found keys
		 * @param {boolean} [options.dump] - Dump found keys to binary file
		 * @example
		 * await pm3.hf.mf.brute({ cardSize: "1k" });
		 * @returns {Promise<string>} Bruteforce results
		 */
		async ({ cardSize, emu, dump } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (emu) args.push("--emu");
			if (dump) args.push("--dump");
			return command(client.client, ["hf", "mf", "brute"])(args);
		},

		cgetblk:
		/**
		 * Get block data from magic Chinese Gen1a card.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.cgetblk({ block: 0 });
		 * @returns {Promise<string>} Block data
		 */
		async ({ block, verbose, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (verbose) args.push("--verbose");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "cgetblk"])(args);
		},

		cgetsc:
		/**
		 * Get sector data from magic Chinese Gen1a card.
		 *
		 * @param {Object} options
		 * @param {number} options.sector - Sector number
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.cgetsc({ sector: 0 });
		 * @returns {Promise<string>} Sector data
		 */
		async ({ sector, verbose, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--sec", String(sector));
			if (verbose) args.push("--verbose");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "cgetsc"])(args);
		},

		chk:
		/**
		 * Check keys on a MIFARE Classic card.
		 *
		 * @param {Object} [options]
		 * @param {string|string[]} [options.key] - Key(s) specified as 12 hex symbols
		 * @param {number} [options.targetBlock] - Target block number
		 * @param {string} [options.keyType] - Key type: "a", "b", or "all" (default)
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.emu] - Fill simulator keys from found keys
		 * @param {boolean} [options.dump] - Dump found keys to binary file
		 * @param {string} [options.file] - Filename of dictionary
		 * @param {boolean} [options.noDefault] - Skip checking default keys
		 * @example
		 * await pm3.hf.mf.chk({ cardSize: "1k", key: "FFFFFFFFFFFF" });
		 * @returns {Promise<string>} Key check results
		 */
		async ({ key, targetBlock, keyType, cardSize, emu, dump, file, noDefault } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) {
				const keys = Array.isArray(key) ? key : [key];
				for (const k of keys) args.push("--key", String(k));
			}
			if (targetBlock !== undefined && targetBlock !== null) args.push("--tblk", String(targetBlock));
			if (keyType === "a") args.push("-a");
			else if (keyType === "b") args.push("-b");
			else if (keyType === "all") args.push("--all");
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (emu) args.push("--emu");
			if (dump) args.push("--dump");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (noDefault) args.push("--no-default");
			return command(client.client, ["hf", "mf", "chk"])(args);
		},

		cload:
		/**
		 * Load magic Gen1a card with data from a dump file (bin/eml/json) or from emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.file] - Filename for dump file
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "1k+", "2k", or "4k"
		 * @param {boolean} [options.emu] - Load from emulator memory
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.cload({ emu: true });
		 * await pm3.hf.mf.cload({ file: "hf-mf-01020304.eml" });
		 * @returns {Promise<string>} Load result
		 */
		async ({ file, cardSize, emu, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (emu) args.push("--emu");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "cload"])(args);
		},

		csave:
		/**
		 * Save magic Gen1a card memory to file (bin/json) or into emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.file] - Filename for dump file
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.emu] - Save to emulator memory
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.csave();
		 * await pm3.hf.mf.csave({ cardSize: "4k" });
		 * @returns {Promise<string>} Save result
		 */
		async ({ file, cardSize, emu, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (emu) args.push("--emu");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "csave"])(args);
		},

		csetblk:
		/**
		 * Set block data on a magic Gen1a card.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {string} [options.data] - Bytes to write, 16 hex bytes
		 * @param {boolean} [options.wipe] - Wipe card with backdoor command before writing
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.csetblk({ block: 1, data: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Write result
		 */
		async ({ block, data, wipe, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (wipe) args.push("--wipe");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "csetblk"])(args);
		},

		csetuid:
		/**
		 * Set UID, ATQA, and SAK for magic Gen1a card.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.uid] - UID, 4 or 7 hex bytes
		 * @param {string} [options.atqa] - ATQA, 2 hex bytes
		 * @param {string} [options.sak] - SAK, 1 hex byte
		 * @param {boolean} [options.wipe] - Wipe card with backdoor command
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.csetuid({ uid: "01020304" });
		 * await pm3.hf.mf.csetuid({ wipe: true, uid: "01020304", atqa: "0004", sak: "08" });
		 * @returns {Promise<string>} Set UID result
		 */
		async ({ uid, atqa, sak, wipe, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (wipe) args.push("--wipe");
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (atqa !== undefined && atqa !== null) args.push("--atqa", String(atqa));
			if (sak !== undefined && sak !== null) args.push("--sak", String(sak));
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "csetuid"])(args);
		},

		cview:
		/**
		 * View magic Gen1a card memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.cview();
		 * await pm3.hf.mf.cview({ cardSize: "4k" });
		 * @returns {Promise<string>} Card memory contents
		 */
		async ({ cardSize, verbose, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (verbose) args.push("--verbose");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "cview"])(args);
		},

		cwipe:
		/**
		 * Wipe Gen1 magic Chinese card.
		 * Sets UID / ATQA / SAK / Data / Keys / Access to default values.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.uid] - UID, 4 hex bytes
		 * @param {string} [options.atqa] - ATQA, 2 hex bytes
		 * @param {string} [options.sak] - SAK, 1 hex byte
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.cwipe();
		 * await pm3.hf.mf.cwipe({ uid: "09080706", atqa: "0004", sak: "18" });
		 * @returns {Promise<string>} Wipe result
		 */
		async ({ uid, atqa, sak, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (atqa !== undefined && atqa !== null) args.push("--atqa", String(atqa));
			if (sak !== undefined && sak !== null) args.push("--sak", String(sak));
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "cwipe"])(args);
		},

		darkside:
		/**
		 * Perform the Darkside attack to recover a key from a MIFARE Classic card.
		 *
		 * @param {Object} [options]
		 * @param {number} [options.block] - Target block number
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {number} [options.keyOffset] - Target key type is key A + this offset
		 * @example
		 * await pm3.hf.mf.darkside();
		 * await pm3.hf.mf.darkside({ block: 16, keyType: "b" });
		 * @returns {Promise<string>} Recovered key
		 */
		async ({ block, keyType, keyOffset } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			if (keyOffset !== undefined && keyOffset !== null) args.push("-c", String(keyOffset));
			return command(client.client, ["hf", "mf", "darkside"])(args);
		},

		decrypt:
		/**
		 * Decrypt Crypto-1 encrypted bytes given known state of crypto.
		 * Use trace log to gather the needed nonce values.
		 *
		 * @param {Object} options
		 * @param {string} options.nt - Tag nonce (hex)
		 * @param {string} options.ar - Encrypted reader response (hex)
		 * @param {string} options.at - Encrypted tag response (hex)
		 * @param {string} options.data - Encrypted data (hex), taken directly after at_enc
		 * @example
		 * await pm3.hf.mf.decrypt({ nt: "b830049b", ar: "9248314a", at: "9280e203", data: "41e586f9" });
		 * @returns {Promise<string>} Decrypted data
		 */
		async ({ nt, ar, at, data }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--nt", String(nt));
			args.push("--ar", String(ar));
			args.push("--at", String(at));
			args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "decrypt"])(args);
		},

		dump:
		/**
		 * Dump MIFARE Classic tag to file (bin/json).
		 * If no filename given, UID will be used as filename.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.file] - Filename for dump file
		 * @param {string} [options.keys] - Filename of keys file
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.noSave] - No save to file
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.dump({ cardSize: "1k" });
		 * await pm3.hf.mf.dump({ cardSize: "4k", keys: "hf-mf-066C8B78-key.bin" });
		 * @returns {Promise<string>} Dump result
		 */
		async ({ file, keys, cardSize, noSave, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (keys !== undefined && keys !== null) args.push("--keys", String(keys));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (noSave) args.push("--ns");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "dump"])(args);
		},

		ecfill:
		/**
		 * Dump card and transfer data to emulator memory.
		 * Keys must already be in the emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {number} [options.keyOffset] - Key type is key A + this offset
		 * @param {string} [options.key] - Key, 6 hex bytes (only for keyOffset option)
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @example
		 * await pm3.hf.mf.ecfill();
		 * await pm3.hf.mf.ecfill({ cardSize: "4k", keyType: "b" });
		 * @returns {Promise<string>} Fill result
		 */
		async ({ keyType, keyOffset, key, cardSize } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (keyOffset !== undefined && keyOffset !== null) args.push("-c", String(keyOffset));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			return command(client.client, ["hf", "mf", "ecfill"])(args);
		},

		eclr:
		/**
		 * Clear card emulator memory - sets all data blocks to zeros and keys A/B to FFFFFFFFFFFF.
		 *
		 * @example
		 * await pm3.hf.mf.eclr();
		 * @returns {Promise<string>} Clear result
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "mf", "eclr"])([]);
		},

		egetblk:
		/**
		 * Get a block from emulator memory.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {boolean} [options.verbose] - Verbose output (decode sector trailer)
		 * @example
		 * await pm3.hf.mf.egetblk({ block: 0 });
		 * await pm3.hf.mf.egetblk({ block: 3, verbose: true });
		 * @returns {Promise<string>} Block data
		 */
		async ({ block, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "egetblk"])(args);
		},

		egetsc:
		/**
		 * Get a sector from emulator memory.
		 *
		 * @param {Object} options
		 * @param {number} options.sector - Sector number
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.egetsc({ sector: 0 });
		 * @returns {Promise<string>} Sector data
		 */
		async ({ sector, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--sec", String(sector));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "egetsc"])(args);
		},

		ekeyprn:
		/**
		 * Download and print the keys from emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.write] - Write keys to binary file `hf-mf-<UID>-key.bin`
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @example
		 * await pm3.hf.mf.ekeyprn({ cardSize: "1k" });
		 * await pm3.hf.mf.ekeyprn({ write: true });
		 * @returns {Promise<string>} Key listing
		 */
		async ({ write, cardSize } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (write) args.push("--write");
			if (cardSize) args.push(cardSizeFlag(cardSize));
			return command(client.client, ["hf", "mf", "ekeyprn"])(args);
		},

		eload:
		/**
		 * Load emulator memory with data from a dump file (bin/eml/json).
		 *
		 * @param {Object} options
		 * @param {string} options.file - Filename for dump file
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", "4k", or "ul" (Ultralight)
		 * @param {boolean} [options.mem] - Use RDV4 SPIFFS
		 * @param {number} [options.numBlocks] - Manually set number of blocks (overrides auto-detect)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.eload({ file: "hf-mf-01020304.bin" });
		 * await pm3.hf.mf.eload({ file: "hf-mf-01020304.eml", cardSize: "4k" });
		 * @returns {Promise<string>} Load result
		 */
		async ({ file, cardSize, mem, numBlocks, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			if (cardSize === "ul") args.push("--ul");
			else if (cardSize) args.push(cardSizeFlag(cardSize));
			if (mem) args.push("--mem");
			if (numBlocks !== undefined && numBlocks !== null) args.push("--qty", String(numBlocks));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "eload"])(args);
		},

		encodehid:
		/**
		 * Encode HID/Wiegand data to a MIFARE Classic card.
		 * Use one of bin, raw, newHex, or wiegand + facilityCode + cardNumber.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.bin] - Binary string (e.g. "0001001001")
		 * @param {string} [options.raw] - HID raw hex with sentinel bit already present
		 * @param {string} [options.newHex] - New ASN.1 PACS hex from `wiegand encode --new`
		 * @param {number} [options.facilityCode] - Facility code
		 * @param {number} [options.cardNumber] - Card number
		 * @param {string} [options.wiegand] - Wiegand format (see `wiegand list`)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.encodehid({ wiegand: "H10301", facilityCode: 31, cardNumber: 337 });
		 * await pm3.hf.mf.encodehid({ raw: "063E02A3" });
		 * @returns {Promise<string>} Encode result
		 */
		async ({ bin, raw, newHex, facilityCode, cardNumber, wiegand, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (bin !== undefined && bin !== null) args.push("--bin", String(bin));
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (newHex !== undefined && newHex !== null) args.push("--new", String(newHex));
			if (facilityCode !== undefined && facilityCode !== null) args.push("--fc", String(facilityCode));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (wiegand !== undefined && wiegand !== null) args.push("--wiegand", String(wiegand));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "encodehid"])(args);
		},

		esave:
		/**
		 * Save emulator memory to file (bin/json).
		 *
		 * @param {Object} [options]
		 * @param {string} [options.file] - Filename for dump file
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @example
		 * await pm3.hf.mf.esave();
		 * await pm3.hf.mf.esave({ cardSize: "4k", file: "hf-mf-01020304.eml" });
		 * @returns {Promise<string>} Save result
		 */
		async ({ file, cardSize } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			return command(client.client, ["hf", "mf", "esave"])(args);
		},

		esetblk:
		/**
		 * Set a block in emulator memory.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {string} [options.data] - Bytes to write, 16 hex bytes
		 * @example
		 * await pm3.hf.mf.esetblk({ block: 1, data: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Write result
		 */
		async ({ block, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "esetblk"])(args);
		},

		eview:
		/**
		 * Display emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.saveKeys] - Save extracted keys to binary file
		 * @example
		 * await pm3.hf.mf.eview();
		 * await pm3.hf.mf.eview({ cardSize: "4k" });
		 * @returns {Promise<string>} Emulator memory contents
		 */
		async ({ cardSize, verbose, saveKeys } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (verbose) args.push("--verbose");
			if (saveKeys) args.push("--sk");
			return command(client.client, ["hf", "mf", "eview"])(args);
		},

		fchk:
		/**
		 * Fast check keys on a MIFARE Classic card against a dictionary.
		 * Improved checkkeys method with better speed.
		 *
		 * @param {Object} [options]
		 * @param {string|string[]} [options.key] - Key(s) specified as 12 hex symbols
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.emu] - Fill simulator keys from found keys
		 * @param {boolean} [options.dump] - Dump found keys to binary file
		 * @param {boolean} [options.mem] - Use dictionary from flash memory
		 * @param {string} [options.file] - Filename of dictionary
		 * @param {number} [options.block] - Block number (single block recovery mode)
		 * @param {string} [options.keyType] - Key type for single block recovery: "a" or "b"
		 * @param {boolean} [options.noDefault] - Skip checking default keys
		 * @example
		 * await pm3.hf.mf.fchk({ cardSize: "1k", key: "FFFFFFFFFFFF" });
		 * await pm3.hf.mf.fchk({ cardSize: "1k", file: "mfc_default_keys.dic" });
		 * @returns {Promise<string>} Key check results
		 */
		async ({ key, cardSize, emu, dump, mem, file, block, keyType, noDefault } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) {
				const keys = Array.isArray(key) ? key : [key];
				for (const k of keys) args.push("--key", String(k));
			}
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (emu) args.push("--emu");
			if (dump) args.push("--dump");
			if (mem) args.push("--mem");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (keyType === "a") args.push("-a");
			else if (keyType === "b") args.push("-b");
			if (noDefault) args.push("--no-default");
			return command(client.client, ["hf", "mf", "fchk"])(args);
		},

		gchpwd:
		/**
		 * Change access password for Gen4 GTU card.
		 * WARNING: If you do not know the password, you cannot access the card!
		 *
		 * @param {Object} [options]
		 * @param {string} [options.password] - Current password, 4 hex bytes
		 * @param {string} [options.newPassword] - New password, 4 hex bytes
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.gchpwd({ password: "00000000", newPassword: "01020304" });
		 * @returns {Promise<string>} Password change result
		 */
		async ({ password, newPassword, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (newPassword !== undefined && newPassword !== null) args.push("--newpwd", String(newPassword));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "gchpwd"])(args);
		},

		gdmcfg:
		/**
		 * Get configuration data from magic Gen4 GDM card.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.key] - Key, 6 hex bytes (only for regular wakeup)
		 * @param {boolean} [options.gen1a] - Use Gen1a (40/43) magic wakeup
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.gdmcfg();
		 * @returns {Promise<string>} Configuration data
		 */
		async ({ key, gen1a, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (gen1a) args.push("--gen1a");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "gdmcfg"])(args);
		},

		gdmparsecfg:
		/**
		 * Parse configuration data from a magic Gen4 GDM card.
		 *
		 * @param {Object} options
		 * @param {string} options.data - Configuration bytes, 16 hex bytes
		 * @example
		 * await pm3.hf.mf.gdmparsecfg({ data: "850000000000000000005A5A00000008" });
		 * @returns {Promise<string>} Parsed configuration
		 */
		async ({ data }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "gdmparsecfg"])(args);
		},

		gdmsetblk:
		/**
		 * Set block data on a magic Gen4 GDM card.
		 * Use `force` to override warnings like bad ACL writes.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {string} [options.data] - Bytes to write, 16 hex bytes
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {boolean} [options.force] - Override warnings
		 * @example
		 * await pm3.hf.mf.gdmsetblk({ block: 1, data: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Write result
		 */
		async ({ block, data, key, force } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (force) args.push("--force");
			return command(client.client, ["hf", "mf", "gdmsetblk"])(args);
		},

		gdmsetcfg:
		/**
		 * Set configuration data on a magic Gen4 GDM card.
		 *
		 * @param {Object} options
		 * @param {string} options.data - Configuration bytes, 16 hex bytes
		 * @param {string} [options.key] - Key, 6 hex bytes (only for regular wakeup)
		 * @param {boolean} [options.gen1a] - Use Gen1a (40/43) magic wakeup
		 * @param {boolean} [options.gdm] - Use GDM alt (20/23) magic wakeup
		 * @example
		 * await pm3.hf.mf.gdmsetcfg({ data: "850000000000000000005A5A00000008" });
		 * @returns {Promise<string>} Set configuration result
		 */
		async ({ data, key, gen1a, gdm } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--data", String(data));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (gen1a) args.push("--gen1a");
			if (gdm) args.push("--gdm");
			return command(client.client, ["hf", "mf", "gdmsetcfg"])(args);
		},

		gen3blk:
		/**
		 * Overwrite full manufacturer block for magic Gen3 card.
		 * You can specify part of the manufacturer block as 4/7 bytes for UID change only.
		 * BCC and ATQA are calculated automatically; SAK defaults if not specified.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.data] - Manufacturer block data, up to 16 hex bytes
		 * @example
		 * await pm3.hf.mf.gen3blk(); // print current data
		 * await pm3.hf.mf.gen3blk({ data: "01020304" }); // set 4-byte UID
		 * @returns {Promise<string>} Block 0 data
		 */
		async ({ data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "gen3blk"])(args);
		},

		gen3freeze:
		/**
		 * Permanently lock UID changes on a magic Gen3 card.
		 * WARNING: This operation is irreversible!
		 *
		 * @param {Object} options
		 * @param {boolean} options.confirm - Must be true to confirm the lock operation
		 * @example
		 * await pm3.hf.mf.gen3freeze({ confirm: true });
		 * @returns {Promise<string>} Lock result
		 */
		async ({ confirm }) => {
			const client = await clientPromise;
			const args = [];
			if (confirm) args.push("--yes");
			return command(client.client, ["hf", "mf", "gen3freeze"])(args);
		},

		gen3uid:
		/**
		 * Set UID for magic Gen3 card without changes to manufacturer block 0.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.uid] - UID, 4 or 7 hex bytes
		 * @example
		 * await pm3.hf.mf.gen3uid({ uid: "01020304" });
		 * await pm3.hf.mf.gen3uid({ uid: "01020304050607" });
		 * @returns {Promise<string>} Set UID result
		 */
		async ({ uid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			return command(client.client, ["hf", "mf", "gen3uid"])(args);
		},

		ggetblk:
		/**
		 * Get block data from magic Gen4 GTU card.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.password] - Password, 4 hex bytes
		 * @example
		 * await pm3.hf.mf.ggetblk({ block: 0 });
		 * await pm3.hf.mf.ggetblk({ block: 3, verbose: true });
		 * @returns {Promise<string>} Block data
		 */
		async ({ block, verbose, password } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (verbose) args.push("--verbose");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "mf", "ggetblk"])(args);
		},

		ginfo:
		/**
		 * Read info about a magic Gen4 GTU card.
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.password] - Password, 4 hex bytes
		 * @param {string} [options.data] - Config bytes, 32 hex bytes (for decoding without card)
		 * @example
		 * await pm3.hf.mf.ginfo();
		 * await pm3.hf.mf.ginfo({ password: "01020304" });
		 * @returns {Promise<string>} Card info
		 */
		async ({ verbose, password, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "ginfo"])(args);
		},

		gload:
		/**
		 * Load magic Gen4 GTU card with data from a dump file (bin/eml/json) or emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "1k+", "2k", or "4k"
		 * @param {string} [options.password] - Password, 4 hex bytes
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.file] - Filename for dump file
		 * @param {boolean} [options.emu] - Load from emulator memory
		 * @param {number} [options.startBlock] - Index of block to start writing (default 0)
		 * @param {number} [options.endBlock] - Index of block to end writing (default last block)
		 * @example
		 * await pm3.hf.mf.gload({ emu: true });
		 * await pm3.hf.mf.gload({ file: "hf-mf-01020304.eml", cardSize: "4k", password: "AABBCCDD" });
		 * @returns {Promise<string>} Load result
		 */
		async ({ cardSize, password, verbose, file, emu, startBlock, endBlock } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (verbose) args.push("--verbose");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (emu) args.push("--emu");
			if (startBlock !== undefined && startBlock !== null) args.push("--start", String(startBlock));
			if (endBlock !== undefined && endBlock !== null) args.push("--end", String(endBlock));
			return command(client.client, ["hf", "mf", "gload"])(args);
		},

		gsave:
		/**
		 * Save magic Gen4 GTU card memory to file (bin/json) or into emulator memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {string} [options.password] - Password, 4 hex bytes
		 * @param {string} [options.file] - Filename for dump file
		 * @param {boolean} [options.emu] - Save to emulator memory
		 * @example
		 * await pm3.hf.mf.gsave();
		 * await pm3.hf.mf.gsave({ cardSize: "4k", password: "DEADBEEF", file: "hf-mf-01020304.json" });
		 * @returns {Promise<string>} Save result
		 */
		async ({ cardSize, password, file, emu } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (emu) args.push("--emu");
			return command(client.client, ["hf", "mf", "gsave"])(args);
		},

		gsetblk:
		/**
		 * Set block data on a magic Gen4 GTU card.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {string} [options.data] - Bytes to write, 16 hex bytes
		 * @param {string} [options.password] - Password, 4 hex bytes
		 * @example
		 * await pm3.hf.mf.gsetblk({ block: 1, data: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Write result
		 */
		async ({ block, data, password } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "mf", "gsetblk"])(args);
		},

		gview:
		/**
		 * View magic Gen4 GTU card memory.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {string} [options.password] - Password, 4 hex bytes
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.gview();
		 * await pm3.hf.mf.gview({ cardSize: "4k" });
		 * @returns {Promise<string>} Card memory contents
		 */
		async ({ cardSize, password, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "gview"])(args);
		},

		hardnested:
		/**
		 * Nested attack for hardened MIFARE Classic cards.
		 * Can detect and use known keys on EV1 cards.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.key] - Known key, 12 hex bytes
		 * @param {number} [options.block] - Input block number (known key block)
		 * @param {string} [options.keyType] - Input key type: "a" (default) or "b"
		 * @param {number} [options.targetBlock] - Target block number
		 * @param {string} [options.targetKeyType] - Target key type: "a" or "b"
		 * @param {string} [options.targetKey] - Known target key to verify, 12 hex bytes
		 * @param {string} [options.uid] - UID for nonce file naming
		 * @param {string} [options.file] - Custom nonce filename
		 * @param {boolean} [options.read] - Read nonce file and start attack
		 * @param {boolean} [options.slow] - Slower acquisition (for non-standard cards)
		 * @param {boolean} [options.tests] - Run tests
		 * @param {boolean} [options.writeNonces] - Acquire nonces and write to file
		 * @param {string} [options.simd] - SIMD instruction set: "none", "mmx", "sse2", "avx", "avx2", "avx512"
		 * @example
		 * await pm3.hf.mf.hardnested({ block: 0, keyType: "a", key: "FFFFFFFFFFFF", targetBlock: 4, targetKeyType: "a" });
		 * await pm3.hf.mf.hardnested({ targetBlock: 4, targetKeyType: "a" }); // EV1 auto-detect
		 * await pm3.hf.mf.hardnested({ read: true, targetKey: "a0a1a2a3a4a5" });
		 * @returns {Promise<string>} Attack result with recovered key
		 */
		async ({ key, block, keyType, targetBlock, targetKeyType, targetKey, uid, file, read, slow, tests, writeNonces, simd } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (targetBlock !== undefined && targetBlock !== null) args.push("--tblk", String(targetBlock));
			if (targetKeyType === "a") args.push("--ta");
			else if (targetKeyType === "b") args.push("--tb");
			if (targetKey !== undefined && targetKey !== null) args.push("--tk", String(targetKey));
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (read) args.push("--read");
			if (slow) args.push("--slow");
			if (tests) args.push("--tests");
			if (writeNonces) args.push("--wr");
			const sf = simdFlag(simd);
			if (sf) args.push(sf);
			return command(client.client, ["hf", "mf", "hardnested"])(args);
		},

		info:
		/**
		 * Display information and check vulnerabilities in a MIFARE Classic card.
		 * Some cards may require specifying a key for information extraction.
		 *
		 * @param {Object} [options]
		 * @param {number} [options.block] - Block number
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {boolean} [options.nack] - Perform NACK test
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.info();
		 * await pm3.hf.mf.info({ key: "FFFFFFFFFFFF", nack: true, verbose: true });
		 * @returns {Promise<string>} Card information and vulnerability status
		 */
		async ({ block, keyType, key, nack, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (nack) args.push("--nack");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "info"])(args);
		},

		isen:
		/**
		 * Investigate Static Encrypted Nonce (SEN) properties of a MIFARE Classic card.
		 * Includes FM11RF08S-specific collection options.
		 *
		 * @param {Object} [options]
		 * @param {number} [options.block] - Block number
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {number} [options.keyOffset] - Key type is key A + this offset
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {number} [options.nestedBlock] - Nested block number (default same as block)
		 * @param {string} [options.nestedKeyType] - Nested key type: "a" or "b"
		 * @param {number} [options.nestedKeyOffset] - Nested key type offset
		 * @param {string} [options.nestedKey] - Nested key, 6 hex bytes
		 * @param {number} [options.numNonces] - Number of nonces (default 2)
		 * @param {boolean} [options.reset] - Reset between attempts even if auth was successful
		 * @param {boolean} [options.hardReset] - Hard reset (RF off/on) between attempts
		 * @param {boolean} [options.addRead] - auth(blk)-read(blk)-auth(blk2)
		 * @param {boolean} [options.addAuth] - auth(blk)-auth(blk)-auth(blk2)
		 * @param {boolean} [options.incBlock2] - auth(blk)-auth(blk2)-auth(blk2+4)-...
		 * @param {boolean} [options.corruptNrAr] - Corrupt {nR}{aR} but with correct parity
		 * @param {boolean} [options.corruptNrArParity] - Correct {nR}{aR} but with corrupted parity
		 * @param {boolean} [options.collectFm11rf08s] - Collect all nT/{nT}/par_err (FM11RF08S)
		 * @param {boolean} [options.collectFm11rf08sWithData] - Collect nT/{nT}/par_err and data blocks (FM11RF08S)
		 * @param {boolean} [options.collectFm11rf08sWithoutBackdoor] - Collect without backdoor, requires first auth keytype and block
		 * @param {string} [options.file] - Filename for collected data
		 * @example
		 * await pm3.hf.mf.isen();
		 * @returns {Promise<string>} SEN analysis results
		 */
		async ({ block, keyType, keyOffset, key, nestedBlock, nestedKeyType, nestedKeyOffset, nestedKey, numNonces, reset, hardReset, addRead, addAuth, incBlock2, corruptNrAr, corruptNrArParity, collectFm11rf08s, collectFm11rf08sWithData, collectFm11rf08sWithoutBackdoor, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (keyOffset !== undefined && keyOffset !== null) args.push("-c", String(keyOffset));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (nestedBlock !== undefined && nestedBlock !== null) args.push("--blk2", String(nestedBlock));
			if (nestedKeyType === "a") args.push("--a2");
			else if (nestedKeyType === "b") args.push("--b2");
			if (nestedKeyOffset !== undefined && nestedKeyOffset !== null) args.push("--c2", String(nestedKeyOffset));
			if (nestedKey !== undefined && nestedKey !== null) args.push("--key2", String(nestedKey));
			if (numNonces !== undefined && numNonces !== null) args.push("-n", String(numNonces));
			if (reset) args.push("--reset");
			if (hardReset) args.push("--hardreset");
			if (addRead) args.push("--addread");
			if (addAuth) args.push("--addauth");
			if (incBlock2) args.push("--incblk2");
			if (corruptNrAr) args.push("--corruptnrar");
			if (corruptNrArParity) args.push("--corruptnrarparity");
			if (collectFm11rf08s) args.push("--collect_fm11rf08s");
			if (collectFm11rf08sWithData) args.push("--collect_fm11rf08s_with_data");
			if (collectFm11rf08sWithoutBackdoor) args.push("--collect_fm11rf08s_without_backdoor");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "mf", "isen"])(args);
		},

		keygen:
		/**
		 * Generate key table for known Key Derivation Functions (KDFs).
		 * Available KDFs: 0=Saflok/Maid, 1=MIZIP, 2=Disney Infinity, 3=Skylanders,
		 * 4=Bambu Lab Filament Spool, 5=Snapmaker Filament Spool, 6=Vanderbilt ACT.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.uid] - UID, 4 or 7 hex bytes
		 * @param {boolean} [options.readUid] - Read UID from tag
		 * @param {boolean} [options.dump] - Dump keys to file
		 * @param {number} [options.kdf] - KDF algorithm number (0-6)
		 * @example
		 * await pm3.hf.mf.keygen({ readUid: true, kdf: 0 });
		 * await pm3.hf.mf.keygen({ uid: "11223344", kdf: 1 });
		 * @returns {Promise<string>} Generated keys
		 */
		async ({ uid, readUid, dump, kdf } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (readUid) args.push("-r");
			if (dump) args.push("-d");
			if (kdf !== undefined && kdf !== null) args.push("--kdf", String(kdf));
			return command(client.client, ["hf", "mf", "keygen"])(args);
		},

		list:
		/**
		 * List MIFARE Classic protocol data from trace buffer.
		 * Alias of `trace list -t mf -c` with MIFARE Classic protocol annotations.
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.crc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 * @example
		 * await pm3.hf.mf.list({ frame: true });
		 * await pm3.hf.mf.list({ buffer: true });
		 * @returns {Promise<string>} Trace listing
		 */
		async ({ buffer, frame, crc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (crc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "mf", "list"])(args);
		},

		mad:
		/**
		 * Check and print MIFARE Application Directory (MAD).
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.aid] - Print all sectors with specified AID (hex)
		 * @param {string} [options.key] - Key for printing sectors
		 * @param {boolean} [options.useKeyB] - Use key B for access (default: key A)
		 * @param {boolean} [options.bigEndian] - BigEndian mode
		 * @param {boolean} [options.decodeCardHolder] - Decode Card Holder information
		 * @param {string} [options.file] - Load dump file and decode MAD
		 * @param {boolean} [options.force] - Force decode (skip key check)
		 * @example
		 * await pm3.hf.mf.mad();
		 * await pm3.hf.mf.mad({ aid: "e103", key: "ffffffffffff", useKeyB: true });
		 * @returns {Promise<string>} MAD information
		 */
		async ({ verbose, aid, key, useKeyB, bigEndian, decodeCardHolder, file, force } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (useKeyB) args.push("--keyb");
			if (bigEndian) args.push("--be");
			if (decodeCardHolder) args.push("--dch");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (force) args.push("--force");
			return command(client.client, ["hf", "mf", "mad"])(args);
		},

		nack:
		/**
		 * Test a MIFARE Classic card for the NACK bug.
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.nack();
		 * @returns {Promise<string>} NACK test result
		 */
		async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "nack"])(args);
		},

		ndefformat:
		/**
		 * Format a MIFARE Classic tag as an NFC tag with NDEF Data Exchange Format.
		 * Tries default and MAD keys to detect if tag is already formatted.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.keys] - Filename of keys
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @example
		 * await pm3.hf.mf.ndefformat();
		 * await pm3.hf.mf.ndefformat({ cardSize: "1k", keys: "hf-mf-01020304-key.bin" });
		 * @returns {Promise<string>} Format result
		 */
		async ({ keys, cardSize } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keys !== undefined && keys !== null) args.push("--keys", String(keys));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			return command(client.client, ["hf", "mf", "ndefformat"])(args);
		},

		ndefread:
		/**
		 * Print NFC Data Exchange Format (NDEF) data from a MIFARE Classic card.
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.aid] - Replace default AID for NDEF
		 * @param {string} [options.key] - Replace default key for NDEF
		 * @param {boolean} [options.useKeyB] - Use key B for access (default: key A)
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.override] - Override failed CRC check
		 * @example
		 * await pm3.hf.mf.ndefread();
		 * await pm3.hf.mf.ndefread({ aid: "e103", key: "ffffffffffff", useKeyB: true });
		 * @returns {Promise<string>} NDEF data
		 */
		async ({ verbose, aid, key, useKeyB, file, override } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (useKeyB) args.push("--keyb");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (override) args.push("--override");
			return command(client.client, ["hf", "mf", "ndefread"])(args);
		},

		ndefwrite:
		/**
		 * Write raw NDEF hex bytes to a MIFARE Classic tag.
		 * Assumes the tag has already been NFC/NDEF formatted.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.data] - Raw NDEF hex bytes
		 * @param {string} [options.file] - Write raw NDEF file to tag
		 * @param {boolean} [options.fixHeaders] - Fix NDEF record headers / terminator block if missing
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.ndefwrite({ data: "0300FE" }); // write empty record
		 * await pm3.hf.mf.ndefwrite({ file: "myfilename" });
		 * @returns {Promise<string>} Write result
		 */
		async ({ data, file, fixHeaders, cardSize, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (data !== undefined && data !== null) args.push("-d", String(data));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (fixHeaders) args.push("-p");
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "ndefwrite"])(args);
		},

		nested:
		/**
		 * Execute Nested attack against a MIFARE Classic card for key recovery.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.key] - Known key, 12 hex bytes
		 * @param {string} [options.cardSize] - Card type: "mini", "1k", "2k", or "4k"
		 * @param {number} [options.block] - Input block number (known key block)
		 * @param {string} [options.keyType] - Input key type: "a" (default) or "b"
		 * @param {number} [options.keyOffset] - Input key type is key A + this offset
		 * @param {number} [options.targetBlock] - Target block number (single sector recovery)
		 * @param {string} [options.targetKeyType] - Target key type: "a" (default) or "b"
		 * @param {number} [options.targetKeyOffset] - Target key offset (requires single block)
		 * @param {boolean} [options.emu] - Fill simulator keys from found keys
		 * @param {boolean} [options.dump] - Dump found keys to file
		 * @param {boolean} [options.mem] - Use dictionary from flash memory
		 * @param {boolean} [options.ignoreStaticNonce] - Ignore static encrypted nonces
		 * @example
		 * await pm3.hf.mf.nested({ cardSize: "1k", block: 0, keyType: "a", key: "FFFFFFFFFFFF" });
		 * await pm3.hf.mf.nested({ block: 0, keyType: "a", key: "FFFFFFFFFFFF", targetBlock: 4, targetKeyType: "a" });
		 * @returns {Promise<string>} Attack result with recovered keys
		 */
		async ({ key, cardSize, block, keyType, keyOffset, targetBlock, targetKeyType, targetKeyOffset, emu, dump, mem, ignoreStaticNonce } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (keyOffset !== undefined && keyOffset !== null) args.push("-c", String(keyOffset));
			if (targetBlock !== undefined && targetBlock !== null) args.push("--tblk", String(targetBlock));
			if (targetKeyType === "a") args.push("--ta");
			else if (targetKeyType === "b") args.push("--tb");
			if (targetKeyOffset !== undefined && targetKeyOffset !== null) args.push("--tc", String(targetKeyOffset));
			if (emu) args.push("--emu");
			if (dump) args.push("--dump");
			if (mem) args.push("--mem");
			if (ignoreStaticNonce) args.push("-i");
			return command(client.client, ["hf", "mf", "nested"])(args);
		},

		personalize:
		/**
		 * Personalize the UID of a MIFARE Classic EV1 card.
		 * Only possible for 7-byte UID cards that are not already personalized.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.keyType] - Key type to authenticate sector 0: "a" (default) or "b"
		 * @param {string} [options.key] - Key (default FFFFFFFFFFFF)
		 * @param {string} [options.uidFormat] - UID format: "f0" (double UID), "f1" (double + shortcut), "f2" (single random), "f3" (single NUID)
		 * @example
		 * await pm3.hf.mf.personalize({ uidFormat: "f0" });
		 * await pm3.hf.mf.personalize({ keyType: "b", key: "B0B1B2B3B4B5", uidFormat: "f3" });
		 * @returns {Promise<string>} Personalization result
		 */
		async ({ keyType, key, uidFormat } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (uidFormat) {
				const fmap = { f0: "--f0", f1: "--f1", f2: "--f2", f3: "--f3" };
				const flag = fmap[String(uidFormat).toLowerCase()];
				if (flag) args.push(flag);
			}
			return command(client.client, ["hf", "mf", "personalize"])(args);
		},

		rdbl:
		/**
		 * Read a MIFARE Classic block.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {number} [options.keyOffset] - Key type is key A + this offset
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {boolean} [options.verbose] - Verbose output (decode sector trailer)
		 * @example
		 * await pm3.hf.mf.rdbl({ block: 0 });
		 * await pm3.hf.mf.rdbl({ block: 0, key: "A0A1A2A3A4A5" });
		 * await pm3.hf.mf.rdbl({ block: 3, verbose: true });
		 * @returns {Promise<string>} Block data
		 */
		async ({ block, keyType, keyOffset, key, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (keyOffset !== undefined && keyOffset !== null) args.push("-c", String(keyOffset));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "rdbl"])(args);
		},

		rdsc:
		/**
		 * Read a MIFARE Classic sector.
		 *
		 * @param {Object} options
		 * @param {number} options.sector - Sector number
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {number} [options.keyOffset] - Key type is key A + this offset
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {boolean} [options.verbose] - Verbose output
		 * @example
		 * await pm3.hf.mf.rdsc({ sector: 0 });
		 * await pm3.hf.mf.rdsc({ sector: 0, key: "A0A1A2A3A4A5" });
		 * @returns {Promise<string>} Sector data
		 */
		async ({ sector, keyType, keyOffset, key, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (keyOffset !== undefined && keyOffset !== null) args.push("-c", String(keyOffset));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			args.push("--sec", String(sector));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mf", "rdsc"])(args);
		},

		restore:
		/**
		 * Restore a MIFARE Classic dump file to a tag.
		 * By default, authenticates with key 0xFFFFFFFFFFFF.
		 * If access rights in dump file are all zeros, replaced with defaults.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {string} [options.uid] - UID for filename template (4/7/10 hex bytes)
		 * @param {string} [options.file] - Filename for dump file
		 * @param {string} [options.keyFile] - Key filename
		 * @param {boolean} [options.useKeyFile] - Use specified keyfile to authenticate
		 * @param {boolean} [options.force] - Override warnings (allow bad ACL writes)
		 * @example
		 * await pm3.hf.mf.restore();
		 * await pm3.hf.mf.restore({ cardSize: "1k", uid: "04010203" });
		 * await pm3.hf.mf.restore({ cardSize: "1k", uid: "04010203", keyFile: "hf-mf-AABBCCDD-key.bin" });
		 * @returns {Promise<string>} Restore result
		 */
		async ({ cardSize, uid, file, keyFile, useKeyFile, force } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (keyFile !== undefined && keyFile !== null) args.push("--kfn", String(keyFile));
			if (useKeyFile) args.push("--ka");
			if (force) args.push("--force");
			return command(client.client, ["hf", "mf", "restore"])(args);
		},

		setmod:
		/**
		 * Set the load modulation strength of a MIFARE Classic EV1 card.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.modulation] - Modulation strength: "normal" (weak) or "strong" (default)
		 * @param {string} [options.key] - Key A for Sector 0, 6 hex bytes
		 * @example
		 * await pm3.hf.mf.setmod({ key: "ffffffffffff", modulation: "normal" });
		 * @returns {Promise<string>} Modulation change result
		 */
		async ({ modulation, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (modulation === "normal") args.push("-0");
			else if (modulation === "strong") args.push("-1");
			if (key !== undefined && key !== null) args.push("--key", String(key));
			return command(client.client, ["hf", "mf", "setmod"])(args);
		},

		sim:
		/**
		 * Simulate a MIFARE Classic card from emulator memory.
		 * Supports 4, 7, or 10 byte UID. Uses emulator UID if not specified.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.uid] - UID, 4/7/10 hex bytes
		 * @param {string} [options.cardSize] - Card type: "mini", "1k" (default), "2k", or "4k"
		 * @param {string} [options.atqa] - Explicit ATQA, 2 hex bytes
		 * @param {string} [options.sak] - Explicit SAK, 1 hex byte
		 * @param {number} [options.exitAfterReads] - Exit after N blocks read (0 = infinite)
		 * @param {boolean} [options.interactive] - Console waits until simulation finishes
		 * @param {boolean} [options.readerAttack] - Perform reader attack (nr/ar)
		 * @param {boolean} [options.nestedReaderAttack] - Perform nested reader attack (requires preloaded nt/nt_enc)
		 * @param {boolean} [options.emuKeys] - Fill simulator keys from found keys (requires readerAttack/nestedReaderAttack)
		 * @param {boolean} [options.allowKeyB] - Allow key B even if readable
		 * @param {boolean} [options.allowOver] - Allow auth attempts out of range for selected card type
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.cve] - Trigger CVE 2021_0430
		 * @example
		 * await pm3.hf.mf.sim({ cardSize: "1k" });
		 * await pm3.hf.mf.sim({ cardSize: "1k", uid: "0a0a0a0a" });
		 * await pm3.hf.mf.sim({ cardSize: "1k", uid: "11223344", interactive: true, readerAttack: true });
		 * @returns {Promise<string>} Simulation result
		 */
		async ({ uid, cardSize, atqa, sak, exitAfterReads, interactive, readerAttack, nestedReaderAttack, emuKeys, allowKeyB, allowOver, verbose, cve } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (atqa !== undefined && atqa !== null) args.push("--atqa", String(atqa));
			if (sak !== undefined && sak !== null) args.push("--sak", String(sak));
			if (exitAfterReads !== undefined && exitAfterReads !== null) args.push("--num", String(exitAfterReads));
			if (interactive) args.push("--interactive");
			if (readerAttack) args.push("-x");
			if (nestedReaderAttack) args.push("-y");
			if (emuKeys) args.push("--emukeys");
			if (allowKeyB) args.push("--allowkeyb");
			if (allowOver) args.push("--allowover");
			if (verbose) args.push("--verbose");
			if (cve) args.push("--cve");
			return command(client.client, ["hf", "mf", "sim"])(args);
		},

		staticnested:
		/**
		 * Execute static nested attack against a MIFARE Classic card with static nonce.
		 * Supply a known key from one block to recover all keys.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.key] - Known key, 12 hex bytes
		 * @param {string} [options.cardSize] - Card type: "mini", "1k", "2k", or "4k"
		 * @param {number} [options.block] - Input block number
		 * @param {string} [options.keyType] - Input key type: "a" (default) or "b"
		 * @param {boolean} [options.emuKeys] - Fill simulator keys from found keys
		 * @param {boolean} [options.dumpKeys] - Dump found keys to file
		 * @example
		 * await pm3.hf.mf.staticnested({ cardSize: "1k", block: 0, keyType: "a", key: "FFFFFFFFFFFF" });
		 * @returns {Promise<string>} Attack result with recovered keys
		 */
		async ({ key, cardSize, block, keyType, emuKeys, dumpKeys } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (cardSize) args.push(cardSizeFlag(cardSize));
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (emuKeys) args.push("--emukeys");
			if (dumpKeys) args.push("--dumpkeys");
			return command(client.client, ["hf", "mf", "staticnested"])(args);
		},

		supercard:
		/**
		 * Extract info from a super card.
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.reset] - Reset card
		 * @param {string} [options.uid] - New UID, 4 hex bytes
		 * @param {boolean} [options.furui] - Furui detection card mode
		 * @example
		 * await pm3.hf.mf.supercard(); // recover key
		 * await pm3.hf.mf.supercard({ reset: true });
		 * await pm3.hf.mf.supercard({ uid: "11223344" });
		 * @returns {Promise<string>} Super card info or operation result
		 */
		async ({ reset, uid, furui } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (reset) args.push("--reset");
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (furui) args.push("--furui");
			return command(client.client, ["hf", "mf", "supercard"])(args);
		},

		value:
		/**
		 * MIFARE Classic value block operations: get, set, increment, decrement, restore, transfer.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {number} [options.block] - Block number
		 * @param {number} [options.increment] - Increment value by X (0 - 2147483647)
		 * @param {number} [options.decrement] - Decrement value by X (0 - 2147483647)
		 * @param {number} [options.set] - Set value to X (-2147483647 - 2147483647)
		 * @param {number} [options.transfer] - Transfer value to other block number (after inc/dec/restore)
		 * @param {string} [options.transferKey] - Transfer key, 6 hex bytes (if transferring to other sector)
		 * @param {string} [options.transferKeyType] - Transfer key type: "a" (default) or "b"
		 * @param {boolean} [options.get] - Get value from block
		 * @param {boolean} [options.restore] - Restore (copy value to card buffer, use with transfer)
		 * @param {string} [options.data] - Block data to extract values from (16 hex bytes)
		 * @example
		 * await pm3.hf.mf.value({ block: 16, key: "FFFFFFFFFFFF", set: 1000 });
		 * await pm3.hf.mf.value({ block: 16, key: "FFFFFFFFFFFF", increment: 10 });
		 * await pm3.hf.mf.value({ block: 16, key: "FFFFFFFFFFFF", keyType: "b", get: true });
		 * await pm3.hf.mf.value({ get: true, data: "87D612007829EDFF87D6120011EE11EE" });
		 * @returns {Promise<string>} Value operation result
		 */
		async ({ key, keyType, block, increment, decrement, set, transfer, transferKey, transferKeyType, get, restore, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (block !== undefined && block !== null) args.push("--blk", String(block));
			if (increment !== undefined && increment !== null) args.push("--inc", String(increment));
			if (decrement !== undefined && decrement !== null) args.push("--dec", String(decrement));
			if (set !== undefined && set !== null) args.push("--set", String(set));
			if (transfer !== undefined && transfer !== null) args.push("--transfer", String(transfer));
			if (transferKey !== undefined && transferKey !== null) args.push("--tkey", String(transferKey));
			if (transferKeyType === "a") args.push("--ta");
			else if (transferKeyType === "b") args.push("--tb");
			if (get) args.push("--get");
			if (restore) args.push("--res");
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "value"])(args);
		},

		view:
		/**
		 * Print a MIFARE Classic dump file (bin/eml/json).
		 *
		 * @param {Object} options
		 * @param {string} options.file - Filename for dump file
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.saveKeys] - Save extracted keys to binary file
		 * @example
		 * await pm3.hf.mf.view({ file: "hf-mf-01020304-dump.bin" });
		 * @returns {Promise<string>} Dump file contents
		 */
		async ({ file, verbose, saveKeys } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			if (saveKeys) args.push("--sk");
			return command(client.client, ["hf", "mf", "view"])(args);
		},

		wipe:
		/**
		 * Wipe a MIFARE Classic card to zeros with default keys and access rights.
		 * New A/B keys: FFFFFFFFFFFF, new access rights: FF0780, new GPB: 69.
		 *
		 * @param {Object} [options]
		 * @param {string} [options.file] - Key filename
		 * @param {boolean} [options.gen2] - Force write to Sector 0, Block 0 (GEN2)
		 * @example
		 * await pm3.hf.mf.wipe();
		 * await pm3.hf.mf.wipe({ gen2: true });
		 * await pm3.hf.mf.wipe({ file: "mykey.bin" });
		 * @returns {Promise<string>} Wipe result
		 */
		async ({ file, gen2 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (gen2) args.push("--gen2");
			return command(client.client, ["hf", "mf", "wipe"])(args);
		},

		wrbl:
		/**
		 * Write 16 hex bytes to a MIFARE Classic block.
		 * Use `force` to override warnings for bad ACL and Block 0 writes.
		 *
		 * @param {Object} options
		 * @param {number} options.block - Block number
		 * @param {string} [options.keyType] - Key type: "a" (default) or "b"
		 * @param {number} [options.keyOffset] - Key type is key A + this offset
		 * @param {boolean} [options.force] - Override warnings (bad ACL, block 0 writes)
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {string} [options.data] - Bytes to write, 16 hex bytes
		 * @example
		 * await pm3.hf.mf.wrbl({ block: 1, data: "000102030405060708090a0b0c0d0e0f" });
		 * await pm3.hf.mf.wrbl({ block: 1, key: "A0A1A2A3A4A5", data: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Write result
		 */
		async ({ block, keyType, keyOffset, force, key, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (keyType === "b") args.push("-b");
			else if (keyType === "a") args.push("-a");
			if (keyOffset !== undefined && keyOffset !== null) args.push("-c", String(keyOffset));
			if (force) args.push("--force");
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "mf", "wrbl"])(args);
		},
	}
});
