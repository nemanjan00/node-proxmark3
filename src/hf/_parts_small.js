// Auto-generated HF sub-module parts
// These are assembled into the main hf/index.js

const command = require("../command");

module.exports = (clientPromise) => ({
	// ==================== Root HF commands ====================

	list: /**
	 * List HF trace buffer with protocol annotations.
	 * Alias of `trace list -t raw` - downloads trace from device by default
	 * or uses data already in the trace buffer.
	 *
	 * @param {Object} [options] - Options
	 * @param {boolean} [options.buffer] - Use data from trace buffer instead of downloading from device
	 * @param {boolean} [options.frame] - Show frame delay times
	 * @param {boolean} [options.markCrc] - Mark CRC bytes in the output
	 * @param {boolean} [options.relative] - Show relative times (gap and duration)
	 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
	 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
	 * @param {string} [options.file] - Filename of trace file to load
	 *
	 * @example
	 * // Show frame delay times
	 * await hf.list({ frame: true });
	 * // Use trace buffer
	 * await hf.list({ buffer: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (buffer) args.push("--buffer");
		if (frame) args.push("--frame");
		if (markCrc) args.push("-c");
		if (relative) args.push("-r");
		if (microseconds) args.push("-u");
		if (hexdump) args.push("-x");
		if (file !== undefined && file !== null) args.push("--file", String(file));
		return command(client.client, ["hf", "list"])(args);
	},

	plot: /**
	 * Plot HF signal after RF signal path and A/D conversion.
	 * Displays the HF antenna signal graphically.
	 *
	 * @example
	 * await hf.plot();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["hf", "plot"])([]);
	},

	tune: /**
	 * Continuously measure HF antenna tuning.
	 * Press pm3 button or Enter to interrupt.
	 *
	 * @param {Object} [options] - Options
	 * @param {number} [options.iterations] - Number of iterations (0 = infinite, default: 0)
	 * @param {string} [options.displayStyle] - Display style: "bar", "mix", or "value"
	 * @param {boolean} [options.verbose] - Verbose output
	 *
	 * @example
	 * await hf.tune();
	 * await hf.tune({ displayStyle: "mix" });
	 * await hf.tune({ iterations: 10 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ iterations, displayStyle, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (iterations !== undefined && iterations !== null) args.push("--iter", String(iterations));
		if (displayStyle === "bar") args.push("--bar");
		else if (displayStyle === "mix") args.push("--mix");
		else if (displayStyle === "value") args.push("--value");
		if (verbose) args.push("--verbose");
		return command(client.client, ["hf", "tune"])(args);
	},

	search: /**
	 * Search for unknown HF tags.
	 * Tries all known HF protocols to identify the tag on the antenna.
	 *
	 * @param {Object} [options] - Options
	 * @param {boolean} [options.verbose] - Verbose output
	 *
	 * @example
	 * await hf.search();
	 * await hf.search({ verbose: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (verbose) args.push("--verbose");
		return command(client.client, ["hf", "search"])(args);
	},

	sniff: /**
	 * Sniff HF antenna signal, storing raw samples to device memory.
	 * Uses all available device memory for captured data.
	 * Use `data samples` to download and `data plot` to visualize.
	 * Press button to stop sniffing.
	 *
	 * @param {Object} [options] - Options
	 * @param {number} [options.skipPairs] - Number of sample pairs to skip
	 * @param {number} [options.skipTriggers] - Number of triggers to skip
	 * @param {string} [options.skipMode] - Skip mode: "none", "drop", "min", "max", or "avg"
	 * @param {number} [options.skipRatio] - Skip ratio in ms; applies the skip function to (ratio * 2) samples
	 *
	 * @example
	 * await hf.sniff();
	 * await hf.sniff({ skipPairs: 1000, skipTriggers: 0 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ skipPairs, skipTriggers, skipMode, skipRatio } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (skipPairs !== undefined && skipPairs !== null) args.push("--sp", String(skipPairs));
		if (skipTriggers !== undefined && skipTriggers !== null) args.push("--st", String(skipTriggers));
		if (skipMode !== undefined && skipMode !== null) args.push("--smode", String(skipMode));
		if (skipRatio !== undefined && skipRatio !== null) args.push("--sratio", String(skipRatio));
		return command(client.client, ["hf", "sniff"])(args);
	},

	// ==================== waveshare ====================

	waveshare: {
		load: /**
		 * Load an image file to a Waveshare NFC ePaper tag.
		 * Supports various ePaper display models via the model parameter.
		 *
		 * Model values:
		 *   0 = 2.13 inch (122x250)
		 *   1 = 2.9 inch (296x128)
		 *   2 = 4.2 inch (400x300)
		 *   3 = 7.5 inch (800x480)
		 *   4 = 2.7 inch (176x276)
		 *   5 = 2.13 inch B with red (104x212)
		 *   6 = 1.54 inch B with red (200x200)
		 *   7 = 7.5 inch HD (880x528)
		 *
		 * @param {Object} options - Options (all required)
		 * @param {number} options.model - Model number 0-7 for your ePaper tag
		 * @param {string} options.file - Image file path to upload to the tag
		 * @param {string} [options.save] - Save paletized version to file
		 *
		 * @example
		 * // Load image to 2.13 inch ePaper
		 * await hf.waveshare.load({ model: 0, file: "myimage.bmp" });
		 * // Load image to 7.5 inch HD ePaper and save paletized copy
		 * await hf.waveshare.load({ model: 7, file: "myimage.bmp", save: "paletized.bmp" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ model, file, save } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("-m", String(model));
			args.push("--file", String(file));
			if (save !== undefined && save !== null) args.push("--save", String(save));
			return command(client.client, ["hf", "waveshare", "load"])(args);
		},
	},

	// ==================== thinfilm ====================

	thinfilm: {
		info: /**
		 * Get info from a Thinfilm NFC tag.
		 *
		 * @example
		 * await hf.thinfilm.info();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "thinfilm", "info"])([]);
		},

		list: /**
		 * List Thinfilm trace buffer with protocol annotations.
		 * Alias of `trace list -t thinfilm` - downloads trace from device by default.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Filename of trace file to load
		 *
		 * @example
		 * await hf.thinfilm.list({ frame: true });
		 * await hf.thinfilm.list({ buffer: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "thinfilm", "list"])(args);
		},

		sim: /**
		 * Simulate a Thinfilm NFC tag with provided data.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.data - Hex bytes to send as tag data
		 * @param {boolean} [options.raw] - Treat data as raw (bytes should include CRC)
		 *
		 * @example
		 * await hf.thinfilm.sim({ data: "B70470726f786d61726b2e636f6d" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, raw } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--data", String(data));
			if (raw) args.push("--raw");
			return command(client.client, ["hf", "thinfilm", "sim"])(args);
		},
	},

	// ==================== epa ====================

	epa: {
		collectNonces: /**
		 * Collect nonces during part of the PACE protocol.
		 * All parameters are required.
		 *
		 * @param {Object} options - Options (all required)
		 * @param {number} options.nonceSize - Nonce size in bytes
		 * @param {number} options.count - Number of nonces to collect
		 * @param {number} options.delay - Delay between attempts in ms
		 *
		 * @example
		 * await hf.epa.collectNonces({ nonceSize: 4, count: 4, delay: 1 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ nonceSize, count, delay } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--size", String(nonceSize));
			args.push("--num", String(count));
			args.push("--delay", String(delay));
			return command(client.client, ["hf", "epa", "cnonces"])(args);
		},

		replay: /**
		 * Perform PACE protocol by replaying given APDUs.
		 * All five APDU parameters are required.
		 *
		 * @param {Object} options - Options (all required)
		 * @param {string} options.mseApdu - MSE:Set AT APDU (hex)
		 * @param {string} options.getApdu - General Authenticate nonce APDU (hex)
		 * @param {string} options.mapApdu - General Authenticate map APDU (hex)
		 * @param {string} options.pkaApdu - General Authenticate key agreement APDU (hex)
		 * @param {string} options.maApdu - General Authenticate mutual auth APDU (hex)
		 *
		 * @example
		 * await hf.epa.replay({
		 *   mseApdu: "0022C1A4",
		 *   getApdu: "1068000000",
		 *   mapApdu: "1086000002",
		 *   pkaApdu: "1234ABCDEF",
		 *   maApdu: "1A2B3C4D"
		 * });
		 * @returns {Promise<string>} Command output
		 */
		async ({ mseApdu, getApdu, mapApdu, pkaApdu, maApdu } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--mse", String(mseApdu));
			args.push("--get", String(getApdu));
			args.push("--map", String(mapApdu));
			args.push("--pka", String(pkaApdu));
			args.push("--ma", String(maApdu));
			return command(client.client, ["hf", "epa", "replay"])(args);
		},

		sim: /**
		 * Simulate PACE protocol with a given password.
		 * The crypto can be performed on the PC or on the Proxmark device.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.password - PACE password (hex)
		 * @param {string} options.passwordType - Password type (hex)
		 * @param {boolean} [options.cryptoOnPc] - Perform crypto on PC instead of Proxmark
		 *
		 * @example
		 * await hf.epa.sim({ password: "112233445566", passwordType: "1" });
		 * await hf.epa.sim({ password: "112233445566", passwordType: "1", cryptoOnPc: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password, passwordType, cryptoOnPc } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cryptoOnPc) args.push("--pc");
			args.push("--pty", String(passwordType));
			args.push("--pwd", String(password));
			return command(client.client, ["hf", "epa", "sim"])(args);
		},
	},

	// ==================== emrtd ====================

	emrtd: {
		dump: /**
		 * Dump all files from an eMRTD (electronic Machine Readable Travel Document).
		 * Provide document details for BAC authentication, or omit for PACE-only documents.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.documentNumber] - Document number, up to 9 alphanumeric chars
		 * @param {string} [options.dateOfBirth] - Date of birth in YYMMDD format
		 * @param {string} [options.expiry] - Document expiry in YYMMDD format
		 * @param {string} [options.mrz] - Full 2nd line of MRZ, 44 chars (alternative to individual fields)
		 * @param {string} [options.directory] - Directory path to save dump files
		 *
		 * @example
		 * await hf.emrtd.dump();
		 * await hf.emrtd.dump({ documentNumber: "123456789", dateOfBirth: "890101", expiry: "250401" });
		 * await hf.emrtd.dump({ directory: "../dump" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ documentNumber, dateOfBirth, expiry, mrz, directory } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (documentNumber !== undefined && documentNumber !== null) args.push("--doc", String(documentNumber));
			if (dateOfBirth !== undefined && dateOfBirth !== null) args.push("--date", String(dateOfBirth));
			if (expiry !== undefined && expiry !== null) args.push("--expiry", String(expiry));
			if (mrz !== undefined && mrz !== null) args.push("--mrz", String(mrz));
			if (directory !== undefined && directory !== null) args.push("--dir", String(directory));
			return command(client.client, ["hf", "emrtd", "dump"])(args);
		},

		info: /**
		 * Display information about an eMRTD tag.
		 * Can read from a live tag or from an offline dump directory.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.documentNumber] - Document number, up to 9 alphanumeric chars
		 * @param {string} [options.dateOfBirth] - Date of birth in YYMMDD format
		 * @param {string} [options.expiry] - Document expiry in YYMMDD format
		 * @param {string} [options.mrz] - Full 2nd line of MRZ, 44 chars (passports only)
		 * @param {string} [options.directory] - Directory path for offline dump
		 * @param {boolean} [options.showImages] - Show embedded images
		 *
		 * @example
		 * await hf.emrtd.info();
		 * await hf.emrtd.info({ documentNumber: "123456789", dateOfBirth: "890101", expiry: "250401" });
		 * await hf.emrtd.info({ directory: "../dumps" });
		 * await hf.emrtd.info({ documentNumber: "123456789", dateOfBirth: "890101", expiry: "250401", showImages: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ documentNumber, dateOfBirth, expiry, mrz, directory, showImages } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (documentNumber !== undefined && documentNumber !== null) args.push("--doc", String(documentNumber));
			if (dateOfBirth !== undefined && dateOfBirth !== null) args.push("--date", String(dateOfBirth));
			if (expiry !== undefined && expiry !== null) args.push("--expiry", String(expiry));
			if (mrz !== undefined && mrz !== null) args.push("--mrz", String(mrz));
			if (directory !== undefined && directory !== null) args.push("--dir", String(directory));
			if (showImages) args.push("--images");
			return command(client.client, ["hf", "emrtd", "info"])(args);
		},

		list: /**
		 * List eMRTD (ISO 7816) trace buffer with protocol annotations.
		 * Alias of `trace list -t 7816`.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Filename of trace file to load
		 *
		 * @example
		 * await hf.emrtd.list({ frame: true });
		 * await hf.emrtd.list({ buffer: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "emrtd", "list"])(args);
		},
	},

	// ==================== jooki ====================

	jooki: {
		clone: /**
		 * Write a Jooki token to an Ultralight or NTAG tag.
		 * Provide data as either base64 URL parameter or raw NDEF hex bytes.
		 *
		 * @param {Object} [options] - Options (provide base64 or data)
		 * @param {string} [options.base64] - Base64 URL parameter to encode
		 * @param {string} [options.data] - Raw NDEF bytes (hex)
		 * @param {string} [options.password] - Authentication password for EV1/NTAG (4 bytes hex)
		 *
		 * @example
		 * await hf.jooki.clone({ base64: "7WzlgEzqLgwTnWNy" });
		 * await hf.jooki.clone({ data: "AABBCCDD..." });
		 * @returns {Promise<string>} Command output
		 */
		async ({ base64, data, password } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (base64 !== undefined && base64 !== null) args.push("--b64", String(base64));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "jooki", "clone"])(args);
		},

		decode: /**
		 * Decode a base64-encoded Jooki token from NDEF URI format.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.data - Base64 URL parameter to decode
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await hf.jooki.decode({ data: "7WzlgEzqLgwTnWNy" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--data", String(data));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "jooki", "decode"])(args);
		},

		encode: /**
		 * Encode a Jooki token to base64 NDEF URI format.
		 * Specify a figurine via the `figurine` param or use custom `figurineTypeId`/`figurineId`.
		 *
		 * Figurine names: "dragon", "fox", "ghost", "knight", "whale",
		 *   "blackdragon", "blackfox", "blackknight", "blackwhale",
		 *   "whitedragon", "whitefox", "whiteknight", "whitewhale"
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.uid] - Tag UID hex bytes (e.g. "04010203040506")
		 * @param {boolean} [options.readUid] - Read UID from tag on antenna instead of providing it
		 * @param {boolean} [options.test] - Run self-test
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.figurine] - Figurine name (see list above)
		 * @param {number} [options.figurineTypeId] - Custom figurine type ID (use instead of figurine name)
		 * @param {number} [options.figurineId] - Custom figurine ID (use with figurineTypeId)
		 *
		 * @example
		 * await hf.jooki.encode({ test: true });
		 * await hf.jooki.encode({ readUid: true, figurine: "dragon" });
		 * await hf.jooki.encode({ uid: "04010203040506", figurine: "dragon" });
		 * await hf.jooki.encode({ uid: "04010203040506", figurineTypeId: 1, figurineId: 1 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, readUid, test, verbose, figurine, figurineTypeId, figurineId } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (readUid) args.push("-r");
			if (test) args.push("--test");
			if (verbose) args.push("--verbose");
			if (figurine !== undefined && figurine !== null) args.push("--" + String(figurine).toLowerCase());
			if (figurineTypeId !== undefined && figurineTypeId !== null) args.push("--tid", String(figurineTypeId));
			if (figurineId !== undefined && figurineId !== null) args.push("--fid", String(figurineId));
			return command(client.client, ["hf", "jooki", "encode"])(args);
		},

		sim: /**
		 * Simulate a Jooki token.
		 * Either load data first with `hf mfu eload` or provide base64 data directly.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.base64] - Base64 URL parameter for the Jooki token
		 *
		 * @example
		 * // Simulate using emulator memory (loaded previously)
		 * await hf.jooki.sim();
		 * // Simulate with base64 data
		 * await hf.jooki.sim({ base64: "7WzlgEzqLgwTnWNy" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ base64 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (base64 !== undefined && base64 !== null) args.push("--b64", String(base64));
			return command(client.client, ["hf", "jooki", "sim"])(args);
		},
	},

	// ==================== fido ====================

	fido: {
		list: /**
		 * List FIDO/U2F (ISO 14443-A) trace buffer with protocol annotations.
		 * Alias of `trace list -t 14a`.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Filename of trace file to load
		 *
		 * @example
		 * await hf.fido.list({ frame: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "fido", "list"])(args);
		},

		info: /**
		 * Get info from a FIDO/U2F token.
		 *
		 * @example
		 * await hf.fido.info();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "fido", "info"])([]);
		},

		register: /**
		 * Initiate a U2F token registration.
		 * Needs challenge parameter (32b) and application parameter (32b).
		 * Parameters can be plain strings (1-16 chars, padded) or full 32-byte hex.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output (use twice for full certificate data)
		 * @param {boolean} [options.showTlv] - Show DER certificate contents in TLV representation
		 * @param {string} [options.file] - JSON input file for parameters (default: fido2_defparams.json)
		 * @param {string} [options.challenge] - Challenge parameter as plain string (1-16 chars)
		 * @param {string} [options.application] - Application parameter as plain string (1-16 chars)
		 * @param {string} [options.challengeHex] - Challenge parameter as 32 bytes hex
		 * @param {string} [options.applicationHex] - Application parameter as 32 bytes hex
		 *
		 * @example
		 * // Register with default (zero-filled) parameters
		 * await hf.fido.register();
		 * // Register with plain string parameters
		 * await hf.fido.register({ challenge: "s0", application: "s1" });
		 * // Register with custom JSON config
		 * await hf.fido.register({ file: "fido2-params" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, showTlv, file, challenge, application, challengeHex, applicationHex } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (showTlv) args.push("--tlv");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (challenge !== undefined && challenge !== null) args.push("--cp", String(challenge));
			if (application !== undefined && application !== null) args.push("--ap", String(application));
			if (challengeHex !== undefined && challengeHex !== null) args.push("--cpx", String(challengeHex));
			if (applicationHex !== undefined && applicationHex !== null) args.push("--apx", String(applicationHex));
			return command(client.client, ["hf", "fido", "reg"])(args);
		},

		authenticate: /**
		 * Initiate a U2F token authentication.
		 * Needs key handle and two 32-byte hash numbers (challenge + application parameters).
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.presenceMode] - User presence mode: "default" (dont-enforce), "enforce" (enforce-user-presence), or "check" (check-only)
		 * @param {string} [options.file] - JSON file for parameters
		 * @param {string} [options.publicKey] - Public key to verify signature (hex)
		 * @param {string} [options.keyHandle] - Key handle (0-255 bytes hex)
		 * @param {string} [options.challenge] - Challenge parameter as plain string (1-16 chars)
		 * @param {string} [options.application] - Application parameter as plain string (1-16 chars)
		 * @param {string} [options.challengeHex] - Challenge parameter as 32 bytes hex
		 * @param {string} [options.applicationHex] - Application parameter as 32 bytes hex
		 *
		 * @example
		 * await hf.fido.authenticate();
		 * await hf.fido.authenticate({ keyHandle: "000102030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, presenceMode, file, publicKey, keyHandle, challenge, application, challengeHex, applicationHex } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (presenceMode === "enforce") args.push("--user");
			else if (presenceMode === "check") args.push("--check");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (publicKey !== undefined && publicKey !== null) args.push("--key", String(publicKey));
			if (keyHandle !== undefined && keyHandle !== null) args.push("--kh", String(keyHandle));
			if (challenge !== undefined && challenge !== null) args.push("--cp", String(challenge));
			if (application !== undefined && application !== null) args.push("--ap", String(application));
			if (challengeHex !== undefined && challengeHex !== null) args.push("--cpx", String(challengeHex));
			if (applicationHex !== undefined && applicationHex !== null) args.push("--apx", String(applicationHex));
			return command(client.client, ["hf", "fido", "auth"])(args);
		},

		makeCredential: /**
		 * Execute a FIDO2 Make Credential command.
		 * Uses a JSON parameters file (default: fido2_defparams.json).
		 * For YubiKey, there must be only one option: "rk": true or false.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output (use twice for full certificate data)
		 * @param {boolean} [options.showTlv] - Show DER certificate contents in TLV representation
		 * @param {boolean} [options.showCbor] - Show CBOR decoded data
		 * @param {string} [options.file] - Parameter JSON file name
		 *
		 * @example
		 * // Use default parameters file
		 * await hf.fido.makeCredential();
		 * // Use custom parameters file
		 * await hf.fido.makeCredential({ file: "test.json" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, showTlv, showCbor, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (showTlv) args.push("--tlv");
			if (showCbor) args.push("--cbor");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "fido", "make"])(args);
		},

		getAssertion: /**
		 * Execute a FIDO2 Get Assertion command.
		 * Uses a JSON parameters file (default: fido2_defparams.json).
		 * Needed when `rk` option is false (authenticator does not store credential).
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output (use twice for full certificate data)
		 * @param {boolean} [options.showCbor] - Show CBOR decoded data
		 * @param {boolean} [options.addCredentialToAllowList] - Add CredentialId from JSON to allowList
		 * @param {string} [options.file] - Parameter JSON file name
		 *
		 * @example
		 * // Use default parameters file
		 * await hf.fido.getAssertion();
		 * // Use custom file and add credential to allow list
		 * await hf.fido.getAssertion({ file: "test.json", addCredentialToAllowList: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, showCbor, addCredentialToAllowList, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (showCbor) args.push("--cbor");
			if (addCredentialToAllowList) args.push("--list");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "fido", "assert"])(args);
		},
	},

	// ==================== st25ta ====================

	st25ta: {
		info: /**
		 * Get info about an ST25TA NFC tag.
		 *
		 * @example
		 * await hf.st25ta.info();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "st25ta", "info"])([]);
		},

		list: /**
		 * List ST25TA (ISO 7816) trace buffer with protocol annotations.
		 * Alias of `trace list -t 7816`.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Filename of trace file to load
		 *
		 * @example
		 * await hf.st25ta.list({ frame: true });
		 * await hf.st25ta.list({ buffer: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "st25ta", "list"])(args);
		},

		ndefRead: /**
		 * Read NFC Data Exchange Format (NDEF) file from an ST25TA tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.password] - 16-byte read password (hex)
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await hf.st25ta.ndefRead({ password: "82E80053D4CA5C0B656D852CC696C8A1" });
		 * await hf.st25ta.ndefRead({ file: "myfilename" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password, file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "st25ta", "ndefread"])(args);
		},

		protect: /**
		 * Change read or write protection for the NDEF file on an ST25TA tag.
		 * Mutually exclusive protections: enable/disable and read/write are controlled
		 * via the `action` and `target` params.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.password - 16-byte write password (hex)
		 * @param {string} [options.action] - "enable" or "disable" protection (default: "disable")
		 * @param {string} [options.target] - "read" or "write" protection target (default: "write")
		 *
		 * @example
		 * // Enable read protection
		 * await hf.st25ta.protect({ password: "82E80053D4CA5C0B656D852CC696C8A1", target: "read", action: "enable" });
		 * // Disable write protection
		 * await hf.st25ta.protect({ password: "82E80053D4CA5C0B656D852CC696C8A1", target: "write", action: "disable" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password, action, target } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (action === "enable") args.push("--enable");
			else if (action === "disable") args.push("--disable");
			if (target === "read") args.push("--read");
			else if (target === "write") args.push("--write");
			args.push("--password", String(password));
			return command(client.client, ["hf", "st25ta", "protect"])(args);
		},

		changePassword: /**
		 * Change the read or write password for the NDEF file on an ST25TA tag.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.currentPassword - Current 16-byte write password (hex)
		 * @param {string} options.newPassword - New 16-byte password (hex)
		 * @param {string} [options.target] - "read" or "write" password to change (default: "read")
		 *
		 * @example
		 * // Change read password
		 * await hf.st25ta.changePassword({
		 *   currentPassword: "82E80053D4CA5C0B656D852CC696C8A1",
		 *   newPassword: "00000000000000000000000000000000",
		 *   target: "read"
		 * });
		 * // Change write password
		 * await hf.st25ta.changePassword({
		 *   currentPassword: "82E80053D4CA5C0B656D852CC696C8A1",
		 *   newPassword: "00000000000000000000000000000000",
		 *   target: "write"
		 * });
		 * @returns {Promise<string>} Command output
		 */
		async ({ currentPassword, newPassword, target } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (target === "write") args.push("--write");
			else args.push("--read");
			args.push("--password", String(currentPassword));
			args.push("--new", String(newPassword));
			return command(client.client, ["hf", "st25ta", "pwd"])(args);
		},

		sim: /**
		 * Emulate an ST25TA512B tag with a 7-byte UID.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.uid - 7-byte UID (hex)
		 *
		 * @example
		 * await hf.st25ta.sim({ uid: "02E2007D0FCA4C" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--uid", String(uid));
			return command(client.client, ["hf", "st25ta", "sim"])(args);
		},
	},

	// ==================== topaz ====================

	topaz: {
		list: /**
		 * List Topaz trace buffer with protocol annotations.
		 * Alias of `trace list -t topaz -c`.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Filename of trace file to load
		 *
		 * @example
		 * await hf.topaz.list({ frame: true });
		 * await hf.topaz.list({ buffer: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "topaz", "list"])(args);
		},

		dump: /**
		 * Dump a Topaz tag to file (bin/json).
		 * Uses the tag UID as filename if none is specified.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Filename for the dump file
		 * @param {boolean} [options.noSave] - Do not save to file (display only)
		 *
		 * @example
		 * await hf.topaz.dump();
		 * await hf.topaz.dump({ file: "mydump" });
		 * await hf.topaz.dump({ noSave: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, noSave } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (noSave) args.push("--ns");
			return command(client.client, ["hf", "topaz", "dump"])(args);
		},

		info: /**
		 * Get info from a Topaz tag, optionally saving raw NDEF data.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Save raw NDEF to file
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await hf.topaz.info();
		 * await hf.topaz.info({ file: "myfilename" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "topaz", "info"])(args);
		},

		raw: /**
		 * Send raw hex data to a Topaz tag.
		 * Note: this command currently takes no parameters.
		 *
		 * @example
		 * await hf.topaz.raw();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "topaz", "raw"])([]);
		},

		readBlock: /**
		 * Read a single block from a Topaz tag.
		 *
		 * @param {Object} options - Options
		 * @param {number} options.block - Block number to read
		 *
		 * @example
		 * await hf.topaz.readBlock({ block: 7 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ block } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			return command(client.client, ["hf", "topaz", "rdbl"])(args);
		},

		reader: /**
		 * Read UID from a Topaz tag. Optionally run in continuous mode.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.continuous] - Continuous reader mode (press pm3 button to stop)
		 *
		 * @example
		 * await hf.topaz.reader();
		 * await hf.topaz.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "topaz", "reader"])(args);
		},

		sim: /**
		 * Simulate a Topaz tag (not yet implemented in firmware).
		 *
		 * @example
		 * await hf.topaz.sim();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "topaz", "sim"])([]);
		},

		sniff: /**
		 * Sniff Topaz reader-tag communication.
		 *
		 * @example
		 * await hf.topaz.sniff();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "topaz", "sniff"])([]);
		},

		view: /**
		 * Print a Topaz tag dump file (bin/eml/json).
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Dump file path to display
		 *
		 * @example
		 * await hf.topaz.view({ file: "hf-topaz-04010203-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			return command(client.client, ["hf", "topaz", "view"])(args);
		},

		writeBlock: /**
		 * Write 8 hex bytes of data to a Topaz block.
		 *
		 * @param {Object} options - Options
		 * @param {number} options.block - Block number to write
		 * @param {string} options.data - Block data as 8 hex bytes (16 hex chars)
		 *
		 * @example
		 * await hf.topaz.writeBlock({ block: 7, data: "1122334455667788" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			args.push("--data", String(data));
			return command(client.client, ["hf", "topaz", "wrbl"])(args);
		},
	},

	// ==================== lto ====================

	lto: {
		dump: /**
		 * Dump data from an LTO-CM tag to file.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Filename for the dump file
		 *
		 * @example
		 * await hf.lto.dump({ file: "myfile" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "lto", "dump"])(args);
		},

		info: /**
		 * Get info from an LTO-CM tag.
		 *
		 * @example
		 * await hf.lto.info();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "lto", "info"])([]);
		},

		list: /**
		 * List LTO trace buffer with protocol annotations.
		 * Alias of `trace list -t lto -c`.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Filename of trace file to load
		 *
		 * @example
		 * await hf.lto.list({ frame: true });
		 * await hf.lto.list({ buffer: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "lto", "list"])(args);
		},

		readBlock: /**
		 * Read blocks from an LTO-CM tag by specifying a range.
		 *
		 * @param {Object} [options] - Options
		 * @param {number} [options.firstBlock] - First block number to read
		 * @param {number} [options.lastBlock] - Last block number to read
		 *
		 * @example
		 * await hf.lto.readBlock({ firstBlock: 0, lastBlock: 254 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ firstBlock, lastBlock } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (firstBlock !== undefined && firstBlock !== null) args.push("--first", String(firstBlock));
			if (lastBlock !== undefined && lastBlock !== null) args.push("--last", String(lastBlock));
			return command(client.client, ["hf", "lto", "rdbl"])(args);
		},

		reader: /**
		 * Act as an LTO-CM reader. Looks for tags until Enter or pm3 button is pressed.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await hf.lto.reader();
		 * await hf.lto.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "lto", "reader"])(args);
		},

		restore: /**
		 * Restore data from a dump file to an LTO-CM tag.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Dump file path to restore from (bin/eml)
		 *
		 * @example
		 * await hf.lto.restore({ file: "hf-lto-92C7842CFF.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			return command(client.client, ["hf", "lto", "restore"])(args);
		},

		writeBlock: /**
		 * Write 32 bytes of data to a block on an LTO-CM tag.
		 *
		 * @param {Object} options - Options
		 * @param {number} options.block - Block number to write
		 * @param {string} options.data - 32 bytes of data (64 hex chars, no spaces)
		 *
		 * @example
		 * await hf.lto.writeBlock({ block: 128, data: "0001020304050607080910111213141516171819202122232425262728293031" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--data", String(data));
			args.push("--blk", String(block));
			return command(client.client, ["hf", "lto", "wrbl"])(args);
		},
	},

	// ==================== legic ====================

	legic: {
		dump: /**
		 * Read all memory from a LEGIC Prime tag and save to file (bin/json).
		 * Auto-detects card type: MIM22, MIM256, or MIM1024.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Dump filename (defaults to UID-based name)
		 * @param {boolean} [options.deobfuscate] - Deobfuscate dump data (XOR with MCC)
		 *
		 * @example
		 * await hf.legic.dump();
		 * await hf.legic.dump({ file: "myfile" });
		 * await hf.legic.dump({ deobfuscate: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, deobfuscate } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (deobfuscate) args.push("--de");
			return command(client.client, ["hf", "legic", "dump"])(args);
		},

		info: /**
		 * Get information from a LEGIC Prime tag including system area, user areas, etc.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await hf.legic.info();
		 * await hf.legic.info({ verbose: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "legic", "info"])(args);
		},

		list: /**
		 * List LEGIC trace buffer with protocol annotations.
		 * Alias of `trace list -t legic`.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Filename of trace file to load
		 *
		 * @example
		 * await hf.legic.list({ frame: true });
		 * await hf.legic.list({ buffer: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "legic", "list"])(args);
		},

		readBlock: /**
		 * Read data from a LEGIC Prime tag at a given offset.
		 *
		 * @param {Object} [options] - Options
		 * @param {number} [options.offset] - Offset in bytes to start reading from
		 * @param {number} [options.length] - Number of bytes to read
		 * @param {string} [options.iv] - Initialization vector (hex, must be odd, 7 bits max)
		 *
		 * @example
		 * // Read 16 bytes of system header
		 * await hf.legic.readBlock({ offset: 0, length: 16 });
		 * // Read with custom IV
		 * await hf.legic.readBlock({ offset: 0, length: 4, iv: "55" });
		 * // Read 256 bytes
		 * await hf.legic.readBlock({ offset: 0, length: 256, iv: "55" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ offset, length, iv } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
			if (length !== undefined && length !== null) args.push("--length", String(length));
			if (iv !== undefined && iv !== null) args.push("--iv", String(iv));
			return command(client.client, ["hf", "legic", "rdbl"])(args);
		},

		reader: /**
		 * Read UID and type information from a LEGIC Prime tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await hf.legic.reader();
		 * await hf.legic.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "legic", "reader"])(args);
		},

		restore: /**
		 * Restore a dump file to a LEGIC Prime tag.
		 * Reads bin/eml/json file, auto-detects card type, verifies size match,
		 * then writes all bytes except the first 7 (UID + MCC + DCF).
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Dump file to restore from
		 * @param {boolean} [options.obfuscate] - Obfuscate data before writing (XOR with MCC)
		 *
		 * @example
		 * await hf.legic.restore({ file: "myfile" });
		 * await hf.legic.restore({ file: "myfile", obfuscate: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, obfuscate } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			if (obfuscate) args.push("--ob");
			return command(client.client, ["hf", "legic", "restore"])(args);
		},

		wipe: /**
		 * Fill a LEGIC Prime tag memory with zeros from byte 7 to end.
		 * Auto-detects card type.
		 *
		 * @example
		 * await hf.legic.wipe();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "legic", "wipe"])([]);
		},

		writeBlock: /**
		 * Write data to a LEGIC Prime tag at a given offset.
		 * Auto-detects tag size to ensure proper write boundaries.
		 *
		 * @param {Object} options - Options
		 * @param {number} options.offset - Offset in bytes to start writing
		 * @param {string} options.data - Data to write (hex)
		 * @param {boolean} [options.dangerousNoConfirm] - Auto-confirm dangerous operations
		 *
		 * @example
		 * await hf.legic.writeBlock({ offset: 0, data: "11223344" });
		 * await hf.legic.writeBlock({ offset: 10, data: "DEADBEEF" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ offset, data, dangerousNoConfirm } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--offset", String(offset));
			args.push("--data", String(data));
			if (dangerousNoConfirm) args.push("--danger");
			return command(client.client, ["hf", "legic", "wrbl"])(args);
		},

		sim: /**
		 * Simulate a LEGIC Prime tag.
		 * Supports MIM22, MIM256, and MIM1024 card types.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.cardType] - Card type to simulate: "mim22", "mim256" (default), or "mim1024"
		 *
		 * @example
		 * await hf.legic.sim({ cardType: "mim22" });
		 * await hf.legic.sim({ cardType: "mim1024" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardType === "mim22") args.push("--22");
			else if (cardType === "mim256") args.push("--256");
			else if (cardType === "mim1024") args.push("--1024");
			return command(client.client, ["hf", "legic", "sim"])(args);
		},

		emulatorLoad: /**
		 * Load a LEGIC Prime dump file into emulator memory.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Filename to load
		 * @param {boolean} [options.obfuscate] - Obfuscate dump data (XOR with MCC)
		 *
		 * @example
		 * await hf.legic.emulatorLoad({ file: "myfile" });
		 * await hf.legic.emulatorLoad({ file: "myfile", obfuscate: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, obfuscate } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			if (obfuscate) args.push("--obfuscate");
			return command(client.client, ["hf", "legic", "eload"])(args);
		},

		emulatorSave: /**
		 * Save emulator memory to a dump file (bin/json).
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Filename to save (defaults to UID-based name)
		 * @param {string} [options.cardType] - Card type: "mim22", "mim256" (default), or "mim1024"
		 * @param {boolean} [options.deobfuscate] - Deobfuscate data before saving (XOR with MCC)
		 *
		 * @example
		 * await hf.legic.emulatorSave();
		 * await hf.legic.emulatorSave({ file: "myfile", cardType: "mim22" });
		 * await hf.legic.emulatorSave({ file: "myfile", cardType: "mim22", deobfuscate: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, cardType, deobfuscate } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (cardType === "mim22") args.push("--22");
			else if (cardType === "mim256") args.push("--256");
			else if (cardType === "mim1024") args.push("--1024");
			if (deobfuscate) args.push("--de");
			return command(client.client, ["hf", "legic", "esave"])(args);
		},

		emulatorView: /**
		 * Display emulator memory contents for a LEGIC Prime tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.cardType] - Card type: "mim22", "mim256" (default), or "mim1024"
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await hf.legic.emulatorView();
		 * await hf.legic.emulatorView({ cardType: "mim22" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardType, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardType === "mim22") args.push("--22");
			else if (cardType === "mim256") args.push("--256");
			else if (cardType === "mim1024") args.push("--1024");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "legic", "eview"])(args);
		},

		emulatorInfo: /**
		 * Decode and display emulator memory contents for a LEGIC Prime tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.cardType] - Card type: "mim22", "mim256" (default), or "mim1024"
		 *
		 * @example
		 * await hf.legic.emulatorInfo();
		 * await hf.legic.emulatorInfo({ cardType: "mim22" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardType === "mim22") args.push("--22");
			else if (cardType === "mim256") args.push("--256");
			else if (cardType === "mim1024") args.push("--1024");
			return command(client.client, ["hf", "legic", "einfo"])(args);
		},

		crc: /**
		 * Calculate LEGIC CRC8 or CRC16 on the given data.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.data - Hex bytes to calculate CRC over
		 * @param {string} [options.mcc] - MCC hex byte (UID CRC)
		 * @param {number} [options.crcType] - CRC type: 8 (default) or 16
		 *
		 * @example
		 * await hf.legic.crc({ data: "deadbeef1122" });
		 * await hf.legic.crc({ data: "deadbeef1122", mcc: "9A", crcType: 16 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, mcc, crcType } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--data", String(data));
			if (mcc !== undefined && mcc !== null) args.push("--mcc", String(mcc));
			if (crcType !== undefined && crcType !== null) args.push("--type", String(crcType));
			return command(client.client, ["hf", "legic", "crc"])(args);
		},

		view: /**
		 * Print a LEGIC Prime dump file (bin/eml/json).
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Dump file path to display
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await hf.legic.view({ file: "hf-legic-01020304-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "legic", "view"])(args);
		},
	},
});
