const command = require("../command");

/**
 * Helper: push DESFire secure-messaging arguments that appear on almost every
 * `hf mfdes` sub-command (auth key, algo, KDF, comm mode, command set, secure
 * channel, etc.).  Only values that are explicitly supplied will be appended.
 */
function pushDesAuthArgs(args, o) {
	if (o.showApdu) args.push("--apdu");
	if (o.verbose) args.push("--verbose");
	if (o.keyNo !== undefined && o.keyNo !== null) args.push("--keyno", String(o.keyNo));
	if (o.algo) args.push("--algo", String(o.algo));
	if (o.key) args.push("--key", String(o.key));
	if (o.kdf) args.push("--kdf", String(o.kdf));
	if (o.kdfInput) args.push("--kdfi", String(o.kdfInput));
	if (o.commMode) args.push("--cmode", String(o.commMode));
	if (o.commSet) args.push("--ccset", String(o.commSet));
	if (o.secureChannel) args.push("--schann", String(o.secureChannel));
}

/**
 * Helper: push file-access-rights arguments used by createfile / createvaluefile /
 * createrecordfile / createmacfile / chfilesettings.
 */
function pushFileRightsArgs(args, o) {
	if (o.accessMode) args.push("--amode", String(o.accessMode));
	if (o.rawRights) args.push("--rawrights", String(o.rawRights));
	if (o.readRights) args.push("--rrights", String(o.readRights));
	if (o.writeRights) args.push("--wrights", String(o.writeRights));
	if (o.readWriteRights) args.push("--rwrights", String(o.readWriteRights));
	if (o.changeRights) args.push("--chrights", String(o.changeRights));
}

/**
 * MIFARE DESFire, MIFARE Plus and MIFARE Ultralight sub-commands for `hf`.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command tree containing mfdes, mfp and mfu groups
 */
module.exports = (clientPromise) => ({
	/* ================================================================== *
	 *  MIFARE DESFire (mfdes)                                            *
	 * ================================================================== */
	mfdes: {
		list: /**
		 * List DESFire protocol trace data. Alias of `trace list -t des -c`.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.buffer]  - Use data from trace buffer
		 * @param {boolean} [options.frame]   - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.micro]    - Display times in microseconds
		 * @param {boolean} [options.hex]      - Show hexdump for pcap conversion
		 * @param {string}  [options.file]     - Filename of dictionary
		 *
		 * @example
		 * // Show frame delay times
		 * await pm3.hf.mfdes.list({ frame: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, micro, hex, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (micro) args.push("-u");
			if (hex) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "mfdes", "list"])(args);
		},

		auth: /**
		 * Select application and authenticate with the card.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes, big endian)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {boolean} [options.save]            - Save channel params to defaults on success
		 *
		 * @example
		 * // Authenticate with DES key on PICC level
		 * await pm3.hf.mfdes.auth({ keyNo: 0, algo: "des", key: "0000000000000000", kdf: "none" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, save } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (save) args.push("--save");
			return command(client.client, ["hf", "mfdes", "auth"])(args);
		},

		checkKeys: /**
		 * Check keys against a MIFARE DESFire card.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes, big endian)
		 * @param {string}  [options.key]             - Key for checking (16 hex bytes)
		 * @param {string}  [options.file]            - Filename of dictionary
		 * @param {boolean} [options.pattern1b]       - Check all 1-byte key combinations
		 * @param {boolean} [options.pattern2b]       - Check all 2-byte key combinations
		 * @param {string}  [options.startPattern2b]  - Start key (2-byte hex) for 2-byte search
		 * @param {string}  [options.jsonFile]        - JSON filename to save found keys
		 * @param {string}  [options.kdf]             - KDF: 0=None, 1=AN10922, 2=Gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 *
		 * @example
		 * // Check a specific key against app 0x123456
		 * await pm3.hf.mfdes.checkKeys({ appId: "123456", key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, appId, key, file, pattern1b, pattern2b, startPattern2b, jsonFile, kdf, kdfInput } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (appId) args.push("--aid", String(appId));
			if (key) args.push("--key", String(key));
			if (file) args.push("--file", String(file));
			if (pattern1b) args.push("--pattern1b");
			if (pattern2b) args.push("--pattern2b");
			if (startPattern2b) args.push("--startp2b", String(startPattern2b));
			if (jsonFile) args.push("--json", String(jsonFile));
			if (kdf) args.push("--kdf", String(kdf));
			if (kdfInput) args.push("--kdfi", String(kdfInput));
			return command(client.client, ["hf", "mfdes", "chk"])(args);
		},

		setDefaults: /**
		 * Set default parameters for access to MIFARE DESFire card.
		 *
		 * @param {Object}  [options]
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 *
		 * @example
		 * // Set default DES key with no KDF
		 * await pm3.hf.mfdes.setDefaults({ keyNo: 0, algo: "des", key: "0000000000000000", kdf: "none" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			return command(client.client, ["hf", "mfdes", "default"])(args);
		},

		detect: /**
		 * Detect key type and try to find one from a list.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {string}  [options.file]            - Filename of dictionary
		 * @param {boolean} [options.save]            - Save found key and parameters to defaults
		 *
		 * @example
		 * // Detect key 0 from PICC level
		 * await pm3.hf.mfdes.detect();
		 * // Detect key 2 from app 123456 and save
		 * await pm3.hf.mfdes.detect({ appId: "123456", keyNo: 2, save: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, file, save } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (file) args.push("--file", String(file));
			if (save) args.push("--save");
			return command(client.client, ["hf", "mfdes", "detect"])(args);
		},

		formatPicc: /**
		 * Format the PICC (erase all applications and data). Requires master key.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Delegated application ID (3 hex bytes)
		 *
		 * @example
		 * // Format with default factory setup
		 * await pm3.hf.mfdes.formatPicc();
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			return command(client.client, ["hf", "mfdes", "formatpicc"])(args);
		},

		freeMemory: /**
		 * Get the card's free memory.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.freeMemory();
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, noAuth, dfName } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (noAuth) args.push("--no-auth");
			if (dfName) args.push("--dfname", String(dfName));
			return command(client.client, ["hf", "mfdes", "freemem"])(args);
		},

		getUid: /**
		 * Get the real UID from the card (bypasses random UID if enabled).
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.getUid();
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			return command(client.client, ["hf", "mfdes", "getuid"])(args);
		},

		info: /**
		 * Get info from a MIFARE DESFire tag.
		 *
		 * @example
		 * await pm3.hf.mfdes.info();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "mfdes", "info"])([]);
		},

		mad: /**
		 * Read and print the MIFARE Application Directory (MAD).
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Issuer info file Application ID (3 hex bytes, non-standard)
		 * @param {boolean} [options.authenticate]    - Authenticate to get info from GetApplicationIDs (non-standard)
		 *
		 * @example
		 * await pm3.hf.mfdes.mad();
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, authenticate } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (authenticate) args.push("--auth");
			return command(client.client, ["hf", "mfdes", "mad"])(args);
		},

		setConfig: /**
		 * Set card configuration. WARNING: Danger zone! Requires master key.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.paramId]         - Parameter id (1 hex byte)
		 * @param {string}  [options.data]            - Data for parameter (1-30 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.setConfig({ paramId: "09", data: "01" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, paramId, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (paramId) args.push("--param", String(paramId));
			if (data) args.push("--data", String(data));
			return command(client.client, ["hf", "mfdes", "setconfig"])(args);
		},

		listApps: /**
		 * Show application list. Master key or --no-auth required.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 * @param {boolean} [options.noDeep]          - Do not check auth commands per application
		 * @param {boolean} [options.showFiles]       - Scan files and print file settings
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.listApps({ showFiles: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, noAuth, noDeep, showFiles, dfName } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (noAuth) args.push("--no-auth");
			if (noDeep) args.push("--no-deep");
			if (showFiles) args.push("--files");
			if (dfName) args.push("--dfname", String(dfName));
			return command(client.client, ["hf", "mfdes", "lsapp"])(args);
		},

		getAppIds: /**
		 * Get Application ID list from card. Master key or --no-auth required.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.getAppIds({ keyNo: 0, algo: "des", key: "0000000000000000", kdf: "none" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "getaids"])(args);
		},

		getAppNames: /**
		 * Get Application IDs, ISO IDs and DF names. Master key or --no-auth required.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.getAppNames({ keyNo: 0, algo: "des", key: "0000000000000000", kdf: "none" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "getappnames"])(args);
		},

		bruteforceAppId: /**
		 * Recover Application IDs by bruteforce. WARNING: This is very slow.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.start]   - Starting App ID (3 hex bytes, big endian)
		 * @param {string}  [options.end]     - Last App ID (3 hex bytes, big endian)
		 * @param {number}  [options.step]    - Increment step
		 * @param {string}  [options.preset]  - Candidate preset: full|ascii|numbers|letters|dictionary|mad
		 *
		 * @example
		 * // Search all apps
		 * await pm3.hf.mfdes.bruteforceAppId();
		 * // Search MAD range
		 * await pm3.hf.mfdes.bruteforceAppId({ preset: "mad" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ start, end, step, preset } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (start) args.push("--start", String(start));
			if (end) args.push("--end", String(end));
			if (step !== undefined && step !== null) args.push("--step", String(step));
			if (preset) args.push("--preset", String(preset));
			return command(client.client, ["hf", "mfdes", "bruteaid"])(args);
		},

		createApp: /**
		 * Create an application on the card. Master key required.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.rawData]         - Raw data to send (hex)
		 * @param {string}  [options.appId]           - Application ID to create (3 hex bytes, big endian). Mandatory.
		 * @param {string}  [options.isoFileId]       - ISO file ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - ISO DF Name (1-16 chars, string)
		 * @param {string}  [options.dfNameHex]       - ISO DF Name as hex (1-16 bytes)
		 * @param {string}  [options.keySettings1]    - Key settings 1 (1 hex byte, def: 0x0F)
		 * @param {string}  [options.keySettings2]    - Key settings 2 (1 hex byte, def: 0x0E)
		 * @param {string}  [options.destAlgo]        - Application key crypt algo: DES|2TDEA|3TDEA|AES (def: DES)
		 * @param {number}  [options.numKeys]         - Number of keys 0x00-0x0E (def: 0x0E)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.createApp({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, rawData, appId, isoFileId, dfName, dfNameHex, keySettings1, keySettings2, destAlgo, numKeys, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (rawData) args.push("--rawdata", String(rawData));
			if (appId) args.push("--aid", String(appId));
			if (isoFileId) args.push("--fid", String(isoFileId));
			if (dfName) args.push("--dfname", String(dfName));
			if (dfNameHex) args.push("--dfhex", String(dfNameHex));
			if (keySettings1) args.push("--ks1", String(keySettings1));
			if (keySettings2) args.push("--ks2", String(keySettings2));
			if (destAlgo) args.push("--dstalgo", String(destAlgo));
			if (numKeys !== undefined && numKeys !== null) args.push("--numkeys", String(numKeys));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "createapp"])(args);
		},

		deleteApp: /**
		 * Delete application by its 3-byte AID. Master key required.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID to delete (3 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.deleteApp({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			return command(client.client, ["hf", "mfdes", "deleteapp"])(args);
		},

		selectApp: /**
		 * Select an application on the card.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.dfName]          - Application DF Name (string, max 16 chars)
		 * @param {boolean} [options.masterFile]      - Select MF (master file) via ISO channel
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileIsoId]       - File ISO ID inside application (2 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.selectApp({ appId: "123456" });
		 * await pm3.hf.mfdes.selectApp({ masterFile: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, dfName, masterFile, isoId, fileIsoId } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (dfName) args.push("--dfname", String(dfName));
			if (masterFile) args.push("--mf");
			if (isoId) args.push("--isoid", String(isoId));
			if (fileIsoId) args.push("--fileisoid", String(fileIsoId));
			return command(client.client, ["hf", "mfdes", "selectapp"])(args);
		},

		selectIsoFileId: /**
		 * Select a file via ISO Select command by 2-byte ISO file identifier.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]   - Show APDU requests and responses
		 * @param {boolean} [options.verbose]     - Verbose output
		 * @param {string}  [options.appId]       - Application ID (3 hex bytes)
		 * @param {string}  [options.dfName]      - Application ISO DF Name (1-16 hex bytes)
		 * @param {string}  [options.isoFileId]   - File ISO ID (2 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.selectIsoFileId({ isoFileId: "e104" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, appId, dfName, isoFileId } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (appId) args.push("--aid", String(appId));
			if (dfName) args.push("--dfname", String(dfName));
			if (isoFileId) args.push("--isofid", String(isoFileId));
			return command(client.client, ["hf", "mfdes", "selectisofid"])(args);
		},

		changeKey: /**
		 * Change a PICC or application key.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number for authentication
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.oldAlgo]         - Old key crypto algorithm: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.oldKey]          - Old key (hex)
		 * @param {number}  [options.newKeyNo]        - Key number to change
		 * @param {string}  [options.newAlgo]         - New key crypto algorithm: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.newKey]          - New key (hex)
		 * @param {string}  [options.newKeyVersion]   - Version of new key (1 hex byte)
		 *
		 * @example
		 * await pm3.hf.mfdes.changeKey({ appId: "123456", newKeyNo: 0, newAlgo: "aes", newKey: "00000000000000000000000000000000" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, oldAlgo, oldKey, newKeyNo, newAlgo, newKey, newKeyVersion } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (oldAlgo) args.push("--oldalgo", String(oldAlgo));
			if (oldKey) args.push("--oldkey", String(oldKey));
			if (newKeyNo !== undefined && newKeyNo !== null) args.push("--newkeyno", String(newKeyNo));
			if (newAlgo) args.push("--newalgo", String(newAlgo));
			if (newKey) args.push("--newkey", String(newKey));
			if (newKeyVersion) args.push("--newver", String(newKeyVersion));
			return command(client.client, ["hf", "mfdes", "changekey"])(args);
		},

		changeKeySettings: /**
		 * Change key settings for card or application level. WARNING: card level changes may block the card!
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.data]            - Key settings (1 hex byte)
		 *
		 * @example
		 * await pm3.hf.mfdes.changeKeySettings({ data: "0f" });
		 * await pm3.hf.mfdes.changeKeySettings({ appId: "123456", data: "0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (data) args.push("--data", String(data));
			return command(client.client, ["hf", "mfdes", "chkeysettings"])(args);
		},

		getKeySettings: /**
		 * Get key settings for card or application level.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfdes.getKeySettings();
		 * await pm3.hf.mfdes.getKeySettings({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, dfName } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (dfName) args.push("--dfname", String(dfName));
			return command(client.client, ["hf", "mfdes", "getkeysettings"])(args);
		},

		getKeyVersions: /**
		 * Get key versions for card or application level.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number for authentication
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {string}  [options.targetKeyNo]     - Key number/count to query (1 hex byte, def: 0x00)
		 * @param {string}  [options.keySet]          - Keyset number (1 hex byte)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.getKeyVersions({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, targetKeyNo, keySet, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (targetKeyNo) args.push("--keynum", String(targetKeyNo));
			if (keySet) args.push("--keyset", String(keySet));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "getkeyversions"])(args);
		},

		bruteforceIsoFileId: /**
		 * Recover ISO file IDs by bruteforce. WARNING: Very slow.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]   - Show APDU requests and responses
		 * @param {boolean} [options.verbose]     - Verbose output
		 * @param {string}  [options.appId]       - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]       - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]      - Application ISO DF Name (5-16 hex bytes)
		 * @param {string}  [options.start]       - Starting File ISO ID (2 hex bytes)
		 * @param {string}  [options.end]         - Last File ISO ID (2 hex bytes)
		 * @param {number}  [options.step]        - Increment step
		 *
		 * @example
		 * await pm3.hf.mfdes.bruteforceIsoFileId({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, appId, isoId, dfName, start, end, step } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (start) args.push("--start", String(start));
			if (end) args.push("--end", String(end));
			if (step !== undefined && step !== null) args.push("--step", String(step));
			return command(client.client, ["hf", "mfdes", "bruteisofid"])(args);
		},

		getFileIds: /**
		 * Get File ID list from application. Master key or --no-auth required.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.getFileIds({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "getfileids"])(args);
		},

		getFileIsoIds: /**
		 * Get File ISO ID list from application. Master key or --no-auth required.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.getFileIsoIds({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "getfileisoids"])(args);
		},

		listFiles: /**
		 * List files inside application AID / ISO ID.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.listFiles({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "lsfiles"])(args);
		},

		dump: /**
		 * Dump all applications, file lists and file content from a DESFire card.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {string}  [options.maxLength]       - Maximum read length (3 hex bytes, big endian)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.dump({ appId: "123456" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, maxLength, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (maxLength) args.push("--length", String(maxLength));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "dump"])(args);
		},

		createFile: /**
		 * Create a Standard or Backup data file in an application.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]        - Show APDU requests and responses
		 * @param {boolean} [options.verbose]          - Verbose output
		 * @param {number}  [options.keyNo]            - Key number
		 * @param {string}  [options.algo]             - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]              - Key for authentication (hex)
		 * @param {string}  [options.kdf]              - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]         - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]         - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]          - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]    - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]            - Application ID (3 hex bytes)
		 * @param {string}  [options.fileNo]           - File ID (1 hex byte)
		 * @param {string}  [options.isoFileId]        - ISO File ID (2 hex bytes)
		 * @param {string}  [options.rawType]          - Raw file type (1 hex byte)
		 * @param {string}  [options.rawData]          - Raw file settings (hex, >5 bytes)
		 * @param {string}  [options.accessMode]       - File access mode: plain|mac|encrypt
		 * @param {string}  [options.rawRights]        - Raw access rights (2 hex bytes)
		 * @param {string}  [options.readRights]       - Read access: key0..key13|free|deny
		 * @param {string}  [options.writeRights]      - Write access: key0..key13|free|deny
		 * @param {string}  [options.readWriteRights]  - Read/Write access: key0..key13|free|deny
		 * @param {string}  [options.changeRights]     - Change settings access: key0..key13|free|deny
		 * @param {boolean} [options.noAuth]           - Execute without authentication
		 * @param {string}  [options.size]             - File size (3 hex bytes, big endian)
		 * @param {boolean} [options.backup]           - Create backup file instead of standard file
		 *
		 * @example
		 * await pm3.hf.mfdes.createFile({ appId: "123456", fileNo: "01", size: "000020" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, fileNo, isoFileId, rawType, rawData, accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights, noAuth, size, backup } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (isoFileId) args.push("--isofid", String(isoFileId));
			if (rawType) args.push("--rawtype", String(rawType));
			if (rawData) args.push("--rawdata", String(rawData));
			pushFileRightsArgs(args, { accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights });
			if (noAuth) args.push("--no-auth");
			if (size) args.push("--size", String(size));
			if (backup) args.push("--backup");
			return command(client.client, ["hf", "mfdes", "createfile"])(args);
		},

		createValueFile: /**
		 * Create a Value file in an application.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]        - Show APDU requests and responses
		 * @param {boolean} [options.verbose]          - Verbose output
		 * @param {number}  [options.keyNo]            - Key number
		 * @param {string}  [options.algo]             - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]              - Key for authentication (hex)
		 * @param {string}  [options.kdf]              - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]         - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]         - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]          - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]    - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]            - Application ID (3 hex bytes)
		 * @param {string}  [options.fileNo]           - File ID (1 hex byte)
		 * @param {string}  [options.accessMode]       - File access mode: plain|mac|encrypt
		 * @param {string}  [options.rawRights]        - Raw access rights (2 hex bytes)
		 * @param {string}  [options.readRights]       - Read access: key0..key13|free|deny
		 * @param {string}  [options.writeRights]      - Write access: key0..key13|free|deny
		 * @param {string}  [options.readWriteRights]  - Read/Write access: key0..key13|free|deny
		 * @param {string}  [options.changeRights]     - Change settings access: key0..key13|free|deny
		 * @param {boolean} [options.noAuth]           - Execute without authentication
		 * @param {string}  [options.lowerLimit]       - Lower limit (4 hex bytes, big endian)
		 * @param {string}  [options.upperLimit]       - Upper limit (4 hex bytes, big endian)
		 * @param {string}  [options.initialValue]     - Initial value (4 hex bytes, big endian)
		 * @param {number}  [options.limitedCredit]    - Limited Credit enabled (0 or 1)
		 *
		 * @example
		 * await pm3.hf.mfdes.createValueFile({ appId: "123456", fileNo: "02" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, fileNo, accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights, noAuth, lowerLimit, upperLimit, initialValue, limitedCredit } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (fileNo) args.push("--fid", String(fileNo));
			pushFileRightsArgs(args, { accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights });
			if (noAuth) args.push("--no-auth");
			if (lowerLimit) args.push("--lower", String(lowerLimit));
			if (upperLimit) args.push("--upper", String(upperLimit));
			if (initialValue) args.push("--value", String(initialValue));
			if (limitedCredit !== undefined && limitedCredit !== null) args.push("--lcredit", String(limitedCredit));
			return command(client.client, ["hf", "mfdes", "createvaluefile"])(args);
		},

		createRecordFile: /**
		 * Create a Linear or Cyclic Record file in an application.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]        - Show APDU requests and responses
		 * @param {boolean} [options.verbose]          - Verbose output
		 * @param {number}  [options.keyNo]            - Key number
		 * @param {string}  [options.algo]             - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]              - Key for authentication (hex)
		 * @param {string}  [options.kdf]              - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]         - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]         - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]          - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]    - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]            - Application ID (3 hex bytes)
		 * @param {string}  [options.fileNo]           - File ID (1 hex byte)
		 * @param {string}  [options.isoFileId]        - ISO File ID (2 hex bytes)
		 * @param {string}  [options.accessMode]       - File access mode: plain|mac|encrypt
		 * @param {string}  [options.rawRights]        - Raw access rights (2 hex bytes)
		 * @param {string}  [options.readRights]       - Read access: key0..key13|free|deny
		 * @param {string}  [options.writeRights]      - Write access: key0..key13|free|deny
		 * @param {string}  [options.readWriteRights]  - Read/Write access: key0..key13|free|deny
		 * @param {string}  [options.changeRights]     - Change settings access: key0..key13|free|deny
		 * @param {boolean} [options.noAuth]           - Execute without authentication
		 * @param {string}  [options.recordSize]       - Record size (3 hex bytes, big endian)
		 * @param {string}  [options.maxRecords]       - Max number of records (3 hex bytes, big endian)
		 * @param {boolean} [options.cyclic]           - Create cyclic record file instead of linear
		 *
		 * @example
		 * await pm3.hf.mfdes.createRecordFile({ appId: "123456", fileNo: "03", recordSize: "000010", maxRecords: "00000A" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, fileNo, isoFileId, accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights, noAuth, recordSize, maxRecords, cyclic } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (isoFileId) args.push("--isofid", String(isoFileId));
			pushFileRightsArgs(args, { accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights });
			if (noAuth) args.push("--no-auth");
			if (recordSize) args.push("--size", String(recordSize));
			if (maxRecords) args.push("--maxrecord", String(maxRecords));
			if (cyclic) args.push("--cyclic");
			return command(client.client, ["hf", "mfdes", "createrecordfile"])(args);
		},

		createMacFile: /**
		 * Create a Transaction MAC file in an application.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]        - Show APDU requests and responses
		 * @param {boolean} [options.verbose]          - Verbose output
		 * @param {number}  [options.keyNo]            - Key number
		 * @param {string}  [options.algo]             - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]              - Key for authentication (hex)
		 * @param {string}  [options.kdf]              - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]         - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]         - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]          - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]    - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]            - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]            - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileNo]           - File ID (1 hex byte)
		 * @param {string}  [options.accessMode]       - File access mode: plain|mac|encrypt
		 * @param {string}  [options.rawRights]        - Raw access rights (2 hex bytes)
		 * @param {string}  [options.readRights]       - Read access: key0..key13|free|deny
		 * @param {string}  [options.writeRights]      - Write access: key0..key13|free|deny
		 * @param {string}  [options.readWriteRights]  - Read/Write access: key0..key13|free|deny
		 * @param {string}  [options.changeRights]     - Change settings access: key0..key13|free|deny
		 * @param {boolean} [options.noAuth]           - Execute without authentication
		 * @param {string}  [options.macKey]           - AES-128 key for MAC (16 hex bytes, def: all zeros)
		 * @param {string}  [options.macKeyVersion]    - AES key version for MAC (1 hex byte, def: 0x0)
		 *
		 * @example
		 * await pm3.hf.mfdes.createMacFile({ appId: "123456", fileNo: "04" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, fileNo, accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights, noAuth, macKey, macKeyVersion } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (fileNo) args.push("--fid", String(fileNo));
			pushFileRightsArgs(args, { accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights });
			if (noAuth) args.push("--no-auth");
			if (macKey) args.push("--mackey", String(macKey));
			if (macKeyVersion) args.push("--mackeyver", String(macKeyVersion));
			return command(client.client, ["hf", "mfdes", "createmacfile"])(args);
		},

		deleteFile: /**
		 * Delete a file from an application.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileNo]          - File ID (1 hex byte)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.deleteFile({ appId: "123456", fileNo: "01" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, fileNo, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "deletefile"])(args);
		},

		getFileSettings: /**
		 * Get file settings from a file in an application.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.dfName]          - Application ISO DF Name (5-16 hex bytes)
		 * @param {string}  [options.fileNo]          - File ID (1 hex byte, def: 1)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.getFileSettings({ appId: "123456", fileNo: "01" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, dfName, fileNo, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (dfName) args.push("--dfname", String(dfName));
			if (fileNo) args.push("--fid", String(fileNo));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "getfilesettings"])(args);
		},

		changeFileSettings: /**
		 * Change file settings (access rights, comm mode) for a file.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]        - Show APDU requests and responses
		 * @param {boolean} [options.verbose]          - Verbose output
		 * @param {number}  [options.keyNo]            - Key number
		 * @param {string}  [options.algo]             - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]              - Key for authentication (hex)
		 * @param {string}  [options.kdf]              - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]         - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]         - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]          - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]    - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]            - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]            - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileNo]           - File ID (1 hex byte)
		 * @param {string}  [options.rawData]          - Raw file settings (hex, >5 bytes). Overrides other settings.
		 * @param {string}  [options.accessMode]       - File access mode: plain|mac|encrypt
		 * @param {string}  [options.rawRights]        - Raw access rights (2 hex bytes)
		 * @param {string}  [options.readRights]       - Read access: key0..key13|free|deny
		 * @param {string}  [options.writeRights]      - Write access: key0..key13|free|deny
		 * @param {string}  [options.readWriteRights]  - Read/Write access: key0..key13|free|deny
		 * @param {string}  [options.changeRights]     - Change settings access: key0..key13|free|deny
		 * @param {boolean} [options.noAuth]           - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.changeFileSettings({ appId: "123456", fileNo: "01", accessMode: "plain", readRights: "free", writeRights: "free", readWriteRights: "free", changeRights: "key0" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, fileNo, rawData, accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (rawData) args.push("--rawdata", String(rawData));
			pushFileRightsArgs(args, { accessMode, rawRights, readRights, writeRights, readWriteRights, changeRights });
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "chfilesettings"])(args);
		},

		read: /**
		 * Read data from a DESFire file.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.fileNo]          - File ID (1 hex byte)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 * @param {string}  [options.fileType]        - File type: auto|data|value|record|mac (def: auto)
		 * @param {string}  [options.offset]          - File offset / record number (3 hex bytes, def: 0)
		 * @param {string}  [options.length]          - Length to read / records count (3 hex bytes, def: 0=all)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileIsoId]       - File ISO ID (2 hex bytes)
		 * @param {boolean} [options.isoChaining]     - Use ISO chaining commands
		 *
		 * @example
		 * await pm3.hf.mfdes.read({ appId: "123456", fileNo: "01" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, fileNo, noAuth, fileType, offset, length, isoId, fileIsoId, isoChaining } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (noAuth) args.push("--no-auth");
			if (fileType) args.push("--type", String(fileType));
			if (offset) args.push("--offset", String(offset));
			if (length) args.push("--length", String(length));
			if (isoId) args.push("--isoid", String(isoId));
			if (fileIsoId) args.push("--fileisoid", String(fileIsoId));
			if (isoChaining) args.push("--isochain");
			return command(client.client, ["hf", "mfdes", "read"])(args);
		},

		write: /**
		 * Write data to a DESFire file.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.fileNo]          - File ID (1 hex byte)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 * @param {string}  [options.fileType]        - File type: auto|data|value|record|mac (def: auto)
		 * @param {string}  [options.offset]          - File offset / record number (3 hex bytes, def: 0)
		 * @param {string}  [options.data]            - Data to write (hex). For value files: credit/debit amount.
		 * @param {boolean} [options.debit]           - Use debit operation instead of credit for value files
		 * @param {boolean} [options.commit]          - Commit (needed for backup files; auto for other types)
		 * @param {number}  [options.updateRecord]    - Record number for update-record command (0=latest)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileIsoId]       - File ISO ID (2 hex bytes)
		 * @param {string}  [options.readerId]        - Reader ID for CommitReaderID command (hex)
		 * @param {string}  [options.transactionKey]  - Key for decoding previous reader ID (hex)
		 *
		 * @example
		 * await pm3.hf.mfdes.write({ appId: "123456", fileNo: "01", data: "AABBCCDD" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, fileNo, noAuth, fileType, offset, data, debit, commit, updateRecord, isoId, fileIsoId, readerId, transactionKey } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (noAuth) args.push("--no-auth");
			if (fileType) args.push("--type", String(fileType));
			if (offset) args.push("--offset", String(offset));
			if (data) args.push("--data", String(data));
			if (debit) args.push("--debit");
			if (commit) args.push("--commit");
			if (updateRecord !== undefined && updateRecord !== null) args.push("--updaterec", String(updateRecord));
			if (isoId) args.push("--isoid", String(isoId));
			if (fileIsoId) args.push("--fileisoid", String(fileIsoId));
			if (readerId) args.push("--readerid", String(readerId));
			if (transactionKey) args.push("--trkey", String(transactionKey));
			return command(client.client, ["hf", "mfdes", "write"])(args);
		},

		value: /**
		 * Perform value file operations: get, credit, limited credit, debit, or clear.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileNo]          - File ID (1 hex byte)
		 * @param {string}  [options.operation]       - Operation: get|credit|limcredit|debit|clear (def: get)
		 * @param {string}  [options.data]            - Value for operation (4 hex bytes)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * // Get value
		 * await pm3.hf.mfdes.value({ appId: "123456", fileNo: "01" });
		 * // Credit value
		 * await pm3.hf.mfdes.value({ appId: "123456", fileNo: "01", operation: "credit", data: "00000001" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, fileNo, operation, data, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (operation) args.push("--op", String(operation));
			if (data) args.push("--data", String(data));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "value"])(args);
		},

		clearRecordFile: /**
		 * Clear all records from a record file.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.showApdu]       - Show APDU requests and responses
		 * @param {boolean} [options.verbose]         - Verbose output
		 * @param {number}  [options.keyNo]           - Key number
		 * @param {string}  [options.algo]            - Crypt algo: DES|2TDEA|3TDEA|AES
		 * @param {string}  [options.key]             - Key for authentication (hex)
		 * @param {string}  [options.kdf]             - Key Derivation Function: none|AN10922|gallagher
		 * @param {string}  [options.kdfInput]        - KDF input (1-31 hex bytes)
		 * @param {string}  [options.commMode]        - Communication mode: plain|mac|encrypt
		 * @param {string}  [options.commSet]         - Communication command set: native|niso|iso
		 * @param {string}  [options.secureChannel]   - Secure channel: d40|ev1|ev2|lrp
		 * @param {string}  [options.appId]           - Application ID (3 hex bytes)
		 * @param {string}  [options.isoId]           - Application ISO ID (2 hex bytes)
		 * @param {string}  [options.fileNo]          - File ID (1 hex byte)
		 * @param {boolean} [options.noAuth]          - Execute without authentication
		 *
		 * @example
		 * await pm3.hf.mfdes.clearRecordFile({ appId: "123456", fileNo: "01" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel, appId, isoId, fileNo, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			pushDesAuthArgs(args, { showApdu, verbose, keyNo, algo, key, kdf, kdfInput, commMode, commSet, secureChannel });
			if (appId) args.push("--aid", String(appId));
			if (isoId) args.push("--isoid", String(isoId));
			if (fileNo) args.push("--fid", String(fileNo));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "mfdes", "clearrecfile"])(args);
		},

		test: /**
		 * Run DESFire self-tests.
		 *
		 * @example
		 * await pm3.hf.mfdes.test();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "mfdes", "test"])([]);
		},
	},

	/* ================================================================== *
	 *  MIFARE Plus (mfp)                                                 *
	 * ================================================================== */
	mfp: {
		list: /**
		 * List MIFARE Plus protocol trace data. Alias of `trace list -t mfp -c`.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.buffer]  - Use data from trace buffer
		 * @param {boolean} [options.frame]   - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times
		 * @param {boolean} [options.micro]    - Display times in microseconds
		 * @param {boolean} [options.hex]      - Show hexdump for pcap conversion
		 * @param {string}  [options.file]     - Filename of dictionary
		 *
		 * @example
		 * await pm3.hf.mfp.list({ frame: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, micro, hex, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (micro) args.push("-u");
			if (hex) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "mfp", "list"])(args);
		},

		auth: /**
		 * Execute AES authentication command for a MIFARE Plus card.
		 *
		 * @param {Object}  options
		 * @param {string}  options.keyIndex  - Key number (2 hex bytes). Required.
		 * @param {string}  options.key       - AES key (16 hex bytes). Required.
		 * @param {boolean} [options.verbose]  - Verbose output
		 *
		 * @example
		 * await pm3.hf.mfp.auth({ keyIndex: "4000", key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ keyIndex, key, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (keyIndex) args.push("--ki", String(keyIndex));
			if (key) args.push("--key", String(key));
			return command(client.client, ["hf", "mfp", "auth"])(args);
		},

		checkKeys: /**
		 * Check keys against a MIFARE Plus card.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose]        - Verbose output
		 * @param {string}  [options.keyType]        - Key type filter: "a" = key A only, "b" = key B only (def: both)
		 * @param {number}  [options.startSector]    - Start sector number (0-255)
		 * @param {number}  [options.endSector]      - End sector number (0-255)
		 * @param {string}  [options.key]            - Key for checking (16 hex bytes)
		 * @param {string}  [options.file]           - Dictionary filename
		 * @param {boolean} [options.pattern1b]      - Check all 1-byte key combinations
		 * @param {boolean} [options.pattern2b]      - Check all 2-byte key combinations
		 * @param {string}  [options.startPattern2b] - Start key for 2-byte search (2 hex bytes)
		 * @param {boolean} [options.dumpKeys]       - Dump found keys to JSON file
		 * @param {boolean} [options.noDefault]      - Skip checking default keys
		 *
		 * @example
		 * await pm3.hf.mfp.checkKeys({ key: "000102030405060708090a0b0c0d0e0f" });
		 * await pm3.hf.mfp.checkKeys({ startSector: 0, endSector: 6, file: "mfp_default_keys" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, keyType, startSector, endSector, key, file, pattern1b, pattern2b, startPattern2b, dumpKeys, noDefault } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (keyType === "a") args.push("--keya");
			if (keyType === "b") args.push("--keyb");
			if (startSector !== undefined && startSector !== null) args.push("--startsec", String(startSector));
			if (endSector !== undefined && endSector !== null) args.push("--endsec", String(endSector));
			if (key) args.push("--key", String(key));
			if (file) args.push("--file", String(file));
			if (pattern1b) args.push("--pattern1b");
			if (pattern2b) args.push("--pattern2b");
			if (startPattern2b) args.push("--startp2b", String(startPattern2b));
			if (dumpKeys) args.push("--dump");
			if (noDefault) args.push("--no-default");
			return command(client.client, ["hf", "mfp", "chk"])(args);
		},

		dump: /**
		 * Dump MIFARE Plus tag to file (bin/json). Supports SL1 and SL3 mixed-mode.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose]     - Verbose output
		 * @param {string}  [options.file]        - Filename for dump file
		 * @param {string}  [options.keysFile]    - AES key file from `hf mfp chk --dump` (JSON)
		 * @param {string}  [options.key]         - AES key for all sectors (16 hex bytes)
		 * @param {string}  [options.mfcKeysFile] - MFC key file for SL1 sectors (.bin)
		 * @param {boolean} [options.noSave]      - Do not save to file
		 *
		 * @example
		 * await pm3.hf.mfp.dump();
		 * await pm3.hf.mfp.dump({ key: "ffffffffffffffffffffffffffffffff" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, file, keysFile, key, mfcKeysFile, noSave } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (file) args.push("--file", String(file));
			if (keysFile) args.push("--keys", String(keysFile));
			if (key) args.push("--key", String(key));
			if (mfcKeysFile) args.push("--mfc-keys", String(mfcKeysFile));
			if (noSave) args.push("--ns");
			return command(client.client, ["hf", "mfp", "dump"])(args);
		},

		info: /**
		 * Get info from a MIFARE Plus tag.
		 *
		 * @example
		 * await pm3.hf.mfp.info();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "mfp", "info"])([]);
		},

		mad: /**
		 * Check and print the MIFARE Application Directory (MAD).
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose]     - Verbose output
		 * @param {string}  [options.appId]       - Print all sectors with this AID (hex)
		 * @param {string}  [options.key]         - Key for printing sectors (hex)
		 * @param {boolean} [options.useKeyB]     - Use key B instead of key A
		 * @param {boolean} [options.bigEndian]   - Big-endian byte order
		 * @param {boolean} [options.decodeCardHolder] - Decode Card Holder information
		 * @param {boolean} [options.overrideCrc] - Override failed CRC check
		 *
		 * @example
		 * await pm3.hf.mfp.mad();
		 * await pm3.hf.mfp.mad({ appId: "e103", key: "d3f7d3f7d3f7d3f7d3f7d3f7d3f7d3f7" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, appId, key, useKeyB, bigEndian, decodeCardHolder, overrideCrc } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (appId) args.push("--aid", String(appId));
			if (key) args.push("--key", String(key));
			if (useKeyB) args.push("--keyb");
			if (bigEndian) args.push("--be");
			if (decodeCardHolder) args.push("--dch");
			if (overrideCrc) args.push("--override");
			return command(client.client, ["hf", "mfp", "mad"])(args);
		},

		readBlock: /**
		 * Read blocks from a MIFARE Plus card.
		 *
		 * @param {Object}  options
		 * @param {number}  options.blockNo     - Block number (0-255). Required.
		 * @param {boolean} [options.verbose]    - Verbose output
		 * @param {number}  [options.count]      - Number of blocks to read (def: 1)
		 * @param {boolean} [options.useKeyB]    - Use key B instead of key A
		 * @param {boolean} [options.plain]      - Do not use encrypted communication
		 * @param {boolean} [options.noMacCmd]   - Do not append MAC to command
		 * @param {boolean} [options.noMacReply] - Do not expect MAC in reply
		 * @param {string}  [options.key]        - AES key (16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfp.readBlock({ blockNo: 0, key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNo, verbose, count, useKeyB, plain, noMacCmd, noMacReply, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (count !== undefined && count !== null) args.push("--count", String(count));
			if (useKeyB) args.push("--keyb");
			if (plain) args.push("--plain");
			if (noMacCmd) args.push("--nmc");
			if (noMacReply) args.push("--nmr");
			if (blockNo !== undefined && blockNo !== null) args.push("--blk", String(blockNo));
			if (key) args.push("--key", String(key));
			return command(client.client, ["hf", "mfp", "rdbl"])(args);
		},

		readSector: /**
		 * Read one sector from a MIFARE Plus card.
		 *
		 * @param {Object}  options
		 * @param {number}  options.sectorNo    - Sector number (0-255). Required.
		 * @param {boolean} [options.verbose]    - Verbose output
		 * @param {boolean} [options.useKeyB]    - Use key B instead of key A
		 * @param {boolean} [options.plain]      - Do not use encrypted communication
		 * @param {boolean} [options.noMacCmd]   - Do not append MAC to command
		 * @param {boolean} [options.noMacReply] - Do not expect MAC in reply
		 * @param {string}  [options.key]        - AES key (16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfp.readSector({ sectorNo: 0, key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ sectorNo, verbose, useKeyB, plain, noMacCmd, noMacReply, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (useKeyB) args.push("--keyb");
			if (plain) args.push("--plain");
			if (noMacCmd) args.push("--nmc");
			if (noMacReply) args.push("--nmr");
			if (sectorNo !== undefined && sectorNo !== null) args.push("--sn", String(sectorNo));
			if (key) args.push("--key", String(key));
			return command(client.client, ["hf", "mfp", "rdsc"])(args);
		},

		writeBlock: /**
		 * Write one block to a MIFARE Plus card.
		 *
		 * @param {Object}  options
		 * @param {number}  options.blockNo     - Block number (0-255). Required.
		 * @param {string}  options.data        - Block data (16 hex bytes). Required.
		 * @param {boolean} [options.verbose]    - Verbose output
		 * @param {boolean} [options.useKeyB]    - Use key B instead of key A
		 * @param {boolean} [options.plain]      - Do not use encrypted transmission
		 * @param {boolean} [options.noMacReply] - Do not expect MAC in response
		 * @param {string}  [options.key]        - AES key (16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfp.writeBlock({ blockNo: 1, data: "ff0000000000000000000000000000ff", key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNo, data, verbose, useKeyB, plain, noMacReply, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (useKeyB) args.push("--keyb");
			if (blockNo !== undefined && blockNo !== null) args.push("--blk", String(blockNo));
			if (plain) args.push("--plain");
			if (noMacReply) args.push("--nmr");
			if (data) args.push("--data", String(data));
			if (key) args.push("--key", String(key));
			return command(client.client, ["hf", "mfp", "wrbl"])(args);
		},

		changeKey: /**
		 * Change keys on a MIFARE Plus tag.
		 *
		 * @param {Object}  options
		 * @param {string}  options.keyIndex  - Key index (2 hex bytes). Required.
		 * @param {string}  options.data      - New key (16 hex bytes). Required.
		 * @param {boolean} [options.verbose]    - Verbose output
		 * @param {boolean} [options.noMacReply] - Do not expect MAC in response
		 * @param {string}  [options.key]        - Current sector key (16 hex bytes)
		 * @param {boolean} [options.useKeyB]    - Current sector key is key B
		 *
		 * @example
		 * await pm3.hf.mfp.changeKey({ keyIndex: "4000", data: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ keyIndex, data, verbose, noMacReply, key, useKeyB } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (noMacReply) args.push("--nmr");
			if (keyIndex) args.push("--ki", String(keyIndex));
			if (key) args.push("--key", String(key));
			if (useKeyB) args.push("--typeb");
			if (data) args.push("--data", String(data));
			return command(client.client, ["hf", "mfp", "chkey"])(args);
		},

		changeConfig: /**
		 * Change configuration on a MIFARE Plus tag. DANGER!
		 *
		 * @param {Object}  options
		 * @param {string}  options.configBlock  - Config block number (0-3, hex). Required.
		 * @param {string}  options.data         - New configuration data (16 hex bytes). Required.
		 * @param {boolean} [options.verbose]       - Verbose output
		 * @param {boolean} [options.noMacReply]    - Do not expect MAC in response
		 * @param {string}  [options.key]           - Card key (16 hex bytes)
		 * @param {boolean} [options.useConfigKey]  - Auth as Card Configuration key instead of Master Key
		 *
		 * @example
		 * await pm3.hf.mfp.changeConfig({ configBlock: "0", data: "00000000000000000000000000000000" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ configBlock, data, verbose, noMacReply, key, useConfigKey } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (noMacReply) args.push("--nmr");
			if (configBlock !== undefined && configBlock !== null) args.push("--conf", String(configBlock));
			if (key) args.push("--key", String(key));
			if (useConfigKey) args.push("--cck");
			if (data) args.push("--data", String(data));
			return command(client.client, ["hf", "mfp", "chconf"])(args);
		},

		commitPerso: /**
		 * Execute Commit Perso command. Can only be used in SL0 mode.
		 * CardConfigKey, CardMasterKey and L3SwitchKey AES keys must be written first.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await pm3.hf.mfp.commitPerso();
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mfp", "commitp"])(args);
		},

		initPerso: /**
		 * Write Perso command for all card keys. Can only be used in SL0 mode.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string}  [options.key]     - Key to fill all slots with (16 hex bytes, def: 0xFF..0xFF)
		 *
		 * @example
		 * await pm3.hf.mfp.initPerso({ key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (key) args.push("--key", String(key));
			return command(client.client, ["hf", "mfp", "initp"])(args);
		},

		writePerso: /**
		 * Execute Write Perso command. Can only be used in SL0 mode.
		 *
		 * @param {Object}  options
		 * @param {string}  options.address  - Address (2 hex bytes). Required.
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string}  [options.data]    - Data (16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfp.writePerso({ address: "4000", data: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ address, verbose, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (address) args.push("--adr", String(address));
			if (data) args.push("--data", String(data));
			return command(client.client, ["hf", "mfp", "wrp"])(args);
		},

		ndefFormat: /**
		 * Format a MIFARE Plus tag as an NFC tag with NDEF.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.keysFile] - Filename of keys
		 *
		 * @example
		 * await pm3.hf.mfp.ndefFormat();
		 * @returns {Promise<string>} Command output
		 */
		async ({ keysFile } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keysFile) args.push("--keys", String(keysFile));
			return command(client.client, ["hf", "mfp", "ndefformat"])(args);
		},

		ndefRead: /**
		 * Read and print NFC Data Exchange Format (NDEF) data.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose]     - Verbose output
		 * @param {string}  [options.appId]       - Replace default AID for NDEF
		 * @param {string}  [options.key]         - Replace default key for NDEF
		 * @param {boolean} [options.useKeyB]     - Use key B for access (def: key A)
		 * @param {string}  [options.file]        - Save raw NDEF to file
		 * @param {boolean} [options.overrideCrc] - Override failed CRC check
		 *
		 * @example
		 * await pm3.hf.mfp.ndefRead();
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, appId, key, useKeyB, file, overrideCrc } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (appId) args.push("--aid", String(appId));
			if (key) args.push("--key", String(key));
			if (useKeyB) args.push("--keyb");
			if (file) args.push("--file", String(file));
			if (overrideCrc) args.push("--override");
			return command(client.client, ["hf", "mfp", "ndefread"])(args);
		},

		ndefWrite: /**
		 * Write raw NDEF hex bytes to tag. Tag must already be NDEF formatted.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose]    - Verbose output
		 * @param {string}  [options.data]       - Raw NDEF hex bytes
		 * @param {string}  [options.file]       - Write raw NDEF file to tag
		 * @param {boolean} [options.fixHeaders] - Fix NDEF record headers / terminator block if missing
		 *
		 * @example
		 * await pm3.hf.mfp.ndefWrite({ data: "0300FE" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, data, file, fixHeaders } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (data) args.push("-d", String(data));
			if (file) args.push("--file", String(file));
			if (fixHeaders) args.push("-p");
			return command(client.client, ["hf", "mfp", "ndefwrite"])(args);
		},
	},

	/* ================================================================== *
	 *  MIFARE Ultralight (mfu)                                           *
	 * ================================================================== */
	mfu: {
		list: /**
		 * List MIFARE Ultralight protocol trace data. Alias of `trace list -t 14a -c`.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.buffer]  - Use data from trace buffer
		 * @param {boolean} [options.frame]   - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times
		 * @param {boolean} [options.micro]    - Display times in microseconds
		 * @param {boolean} [options.hex]      - Show hexdump for pcap conversion
		 * @param {string}  [options.file]     - Filename of dictionary
		 *
		 * @example
		 * await pm3.hf.mfu.list({ frame: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ buffer, frame, markCrc, relative, micro, hex, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (micro) args.push("-u");
			if (hex) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "mfu", "list"])(args);
		},

		keygen: /**
		 * Calculate MFC diversified keys from UID.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.uid]       - UID (4 or 7 hex bytes)
		 * @param {boolean} [options.readTag]   - Read UID from tag
		 * @param {number}  [options.blockNo]   - Block number
		 *
		 * @example
		 * await pm3.hf.mfu.keygen({ readTag: true });
		 * await pm3.hf.mfu.keygen({ uid: "11223344556677" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, readTag, blockNo } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid) args.push("--uid", String(uid));
			if (readTag) args.push("-r");
			if (blockNo !== undefined && blockNo !== null) args.push("--blk", String(blockNo));
			return command(client.client, ["hf", "mfu", "keygen"])(args);
		},

		pwdgen: /**
		 * Generate passwords from known pwdgen algorithms.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.uid]     - UID (7 hex bytes)
		 * @param {boolean} [options.readTag] - Read UID from tag
		 * @param {boolean} [options.selfTest] - Run self-test
		 *
		 * @example
		 * await pm3.hf.mfu.pwdgen({ readTag: true });
		 * await pm3.hf.mfu.pwdgen({ uid: "11223344556677" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, readTag, selfTest } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid) args.push("--uid", String(uid));
			if (readTag) args.push("-r");
			if (selfTest) args.push("--test");
			return command(client.client, ["hf", "mfu", "pwdgen"])(args);
		},

		otpTear: /**
		 * Tear-off test against OTP or other block.
		 *
		 * @param {Object}  [options]
		 * @param {number}  [options.blockNo]     - Target block number (def: 8)
		 * @param {number}  [options.increment]   - Increase time steps in microseconds (def: 500)
		 * @param {number}  [options.endTime]     - End time in microseconds (def: 3000)
		 * @param {number}  [options.startTime]   - Start time in microseconds (def: 0)
		 * @param {string}  [options.initData]    - Initialize data before run (4 hex bytes)
		 * @param {string}  [options.testData]    - Test write data (4 hex bytes, def: 00000000)
		 * @param {string}  [options.matchData]   - Exit when block matches this value (4 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfu.otpTear({ blockNo: 3 });
		 * await pm3.hf.mfu.otpTear({ blockNo: 3, increment: 100, startTime: 200, endTime: 2500, initData: "FFFFFFFF", testData: "EEEEEEEE" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNo, increment, endTime, startTime, initData, testData, matchData } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (blockNo !== undefined && blockNo !== null) args.push("--blk", String(blockNo));
			if (increment !== undefined && increment !== null) args.push("--inc", String(increment));
			if (endTime !== undefined && endTime !== null) args.push("--end", String(endTime));
			if (startTime !== undefined && startTime !== null) args.push("--start", String(startTime));
			if (initData) args.push("--data", String(initData));
			if (testData) args.push("--test", String(testData));
			if (matchData) args.push("--match", String(matchData));
			return command(client.client, ["hf", "mfu", "otptear"])(args);
		},

		authC: /**
		 * Test 3DES key on a MIFARE Ultralight-C tag.
		 * If no key is given, a set of known defaults will be tried.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.key]        - Authentication key (16 hex bytes)
		 * @param {boolean} [options.swapEndian] - Swap entered key's endianness
		 * @param {boolean} [options.keepField]  - Keep field on (only with a key)
		 * @param {number}  [options.retries]    - Number of retries (def: 0)
		 * @param {boolean} [options.noCheck]    - Skip checking tag answer correctness
		 * @param {boolean} [options.fastRead0]  - Use fast READ0 (skip anticollision)
		 *
		 * @example
		 * await pm3.hf.mfu.authC();
		 * await pm3.hf.mfu.authC({ key: "000102030405060708090a0b0c0d0e0f" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, swapEndian, keepField, retries, noCheck, fastRead0 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (keepField) args.push("-k");
			if (retries !== undefined && retries !== null) args.push("--retries", String(retries));
			if (noCheck) args.push("--nocheck");
			if (fastRead0) args.push("--read0");
			return command(client.client, ["hf", "mfu", "cauth"])(args);
		},

		checkKeysC: /**
		 * Check MIFARE Ultralight-C 3DES keys against a dictionary.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.file]       - Filename of dictionary
		 * @param {number}  [options.segment]    - Segment index 0-3 (full key if not specified)
		 * @param {number}  [options.retries]    - Number of retries (def: 0)
		 * @param {string}  [options.key]        - Starting key (16 hex bytes, def: zero key)
		 * @param {boolean} [options.xor]        - XOR starting key with segment candidates
		 * @param {boolean} [options.noCheck]    - Skip checking tag answer correctness
		 * @param {boolean} [options.fastRead0]  - Use fast READ0 (skip anticollision)
		 *
		 * @example
		 * await pm3.hf.mfu.checkKeysC({ file: "mfulc_default_keys.dic" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, segment, retries, key, xor, noCheck, fastRead0 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file) args.push("--file", String(file));
			if (segment !== undefined && segment !== null) args.push("--segment", String(segment));
			if (retries !== undefined && retries !== null) args.push("--retries", String(retries));
			if (key) args.push("--key", String(key));
			if (xor) args.push("--xor");
			if (noCheck) args.push("--nocheck");
			if (fastRead0) args.push("--read0");
			return command(client.client, ["hf", "mfu", "cchk"])(args);
		},

		authAes: /**
		 * Test AES key on a MIFARE Ultralight AES tag.
		 * If no key is given, null key will be tried.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.key]            - AES key (16 hex bytes)
		 * @param {number}  [options.keyIndex]       - Key index: 0=DataProtKey, 1=UIDRetrKey, 2=OriginalityKey (def: 0)
		 * @param {boolean} [options.swapEndian]     - Swap entered key's endianness
		 * @param {boolean} [options.keepField]      - Keep field on (only with a key)
		 * @param {boolean} [options.secureChannel]  - Use secure channel (requires key)
		 * @param {number}  [options.retries]        - Number of retries (def: 0)
		 * @param {boolean} [options.noCheck]        - Skip checking tag answer correctness
		 * @param {boolean} [options.fastRead0]      - Use fast READ0 (skip anticollision)
		 *
		 * @example
		 * await pm3.hf.mfu.authAes();
		 * await pm3.hf.mfu.authAes({ key: "00112233445566778899AABBCCDDEEFF", keyIndex: 0 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, keyIndex, swapEndian, keepField, secureChannel, retries, noCheck, fastRead0 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--idx", String(keyIndex));
			if (swapEndian) args.push("-l");
			if (keepField) args.push("-k");
			if (secureChannel) args.push("--schann");
			if (retries !== undefined && retries !== null) args.push("--retries", String(retries));
			if (noCheck) args.push("--nocheck");
			if (fastRead0) args.push("--read0");
			return command(client.client, ["hf", "mfu", "aesauth"])(args);
		},

		checkKeysAes: /**
		 * Check MIFARE Ultralight AES keys against a dictionary.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.file]       - Filename of dictionary
		 * @param {number}  [options.keyIndex]   - Key index: 0=DataProtKey, 1=UIDRetrKey, 2=OriginalityKey (def: 0)
		 * @param {number}  [options.segment]    - Segment index 0-3 (full key if not specified)
		 * @param {number}  [options.retries]    - Number of retries (def: 0)
		 * @param {string}  [options.key]        - Starting key (16 hex bytes, def: zero key)
		 * @param {boolean} [options.xor]        - XOR starting key with segment candidates
		 * @param {boolean} [options.noCheck]    - Skip checking tag answer correctness
		 * @param {boolean} [options.fastRead0]  - Use fast READ0 (skip anticollision)
		 *
		 * @example
		 * await pm3.hf.mfu.checkKeysAes({ file: "mfulaes_default_keys.dic" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, keyIndex, segment, retries, key, xor, noCheck, fastRead0 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file) args.push("--file", String(file));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--idx", String(keyIndex));
			if (segment !== undefined && segment !== null) args.push("--segment", String(segment));
			if (retries !== undefined && retries !== null) args.push("--retries", String(retries));
			if (key) args.push("--key", String(key));
			if (xor) args.push("--xor");
			if (noCheck) args.push("--nocheck");
			if (fastRead0) args.push("--read0");
			return command(client.client, ["hf", "mfu", "aeschk"])(args);
		},

		setKey: /**
		 * Set the 3DES key on MIFARE Ultralight-C or AES keys on Ultralight AES.
		 * Note: AUTH0 must allow unauthenticated writes to key blocks.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.key]            - New key (16 hex bytes)
		 * @param {number}  [options.keyIndex]       - New key index (0 or 1, UL-AES only, def: 0)
		 * @param {boolean} [options.swapEndian]     - Swap entered keys' endianness
		 * @param {string}  [options.currentKey]     - Current UL-C 3DES or UL-AES DataProt key (16 hex bytes)
		 * @param {boolean} [options.secureChannel]  - Use secure channel (requires currentKey)
		 *
		 * @example
		 * await pm3.hf.mfu.setKey({ key: "49454D4B41455242214E4143554F5946" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, keyIndex, swapEndian, currentKey, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--idx", String(keyIndex));
			if (swapEndian) args.push("-l");
			if (currentKey) args.push("--usekey", String(currentKey));
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "setkey"])(args);
		},

		dump: /**
		 * Dump MIFARE Ultralight/NTAG tag to file (bin/json). Autodetects card type.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.file]          - Filename for dump file
		 * @param {string}  [options.key]           - Authentication key (UL-C/UL-AES 16 bytes, EV1/NTAG 4 bytes)
		 * @param {boolean} [options.swapEndian]    - Swap entered key's endianness
		 * @param {number}  [options.startPage]     - Start page number
		 * @param {number}  [options.pageCount]     - Number of pages to dump
		 * @param {boolean} [options.noSave]        - Do not save to file
		 * @param {boolean} [options.dense]         - Dense dump output style
		 * @param {boolean} [options.secureChannel] - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.dump({ file: "myfile" });
		 * await pm3.hf.mfu.dump({ key: "AABBCCDD" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, key, swapEndian, startPage, pageCount, noSave, dense, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file) args.push("--file", String(file));
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (startPage !== undefined && startPage !== null) args.push("--page", String(startPage));
			if (pageCount !== undefined && pageCount !== null) args.push("--qty", String(pageCount));
			if (noSave) args.push("--ns");
			if (dense) args.push("--dense");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "dump"])(args);
		},

		incrementCounter: /**
		 * Increment a MIFARE Ultralight EV1 counter.
		 *
		 * @param {Object}  options
		 * @param {number}  options.counter         - Counter index (starting from 0). Required.
		 * @param {number}  options.value           - Value to increment by (0-16777215). Required.
		 * @param {string}  [options.key]           - Authentication key (UL-AES 16 bytes, EV1/NTAG 4 bytes)
		 * @param {boolean} [options.swapEndian]    - Swap entered key's endianness
		 * @param {boolean} [options.secureChannel] - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.incrementCounter({ counter: 0, value: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ counter, value, key, swapEndian, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (counter !== undefined && counter !== null) args.push("--cnt", String(counter));
			if (value !== undefined && value !== null) args.push("--val", String(value));
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "incr"])(args);
		},

		info: /**
		 * Get info about a MIFARE Ultralight family tag.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.key]           - Authentication key (UL-C 16 bytes, EV1/NTAG 4 bytes)
		 * @param {boolean} [options.swapEndian]    - Swap entered key's endianness
		 * @param {boolean} [options.force]         - Override hw dbg settings
		 * @param {boolean} [options.secureChannel] - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.info();
		 * await pm3.hf.mfu.info({ key: "AABBCCDD" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, swapEndian, force, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (force) args.push("--force");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "info"])(args);
		},

		ndefRead: /**
		 * Read and print NFC Data Exchange Format (NDEF) data.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose]        - Verbose output
		 * @param {boolean} [options.swapEndian]     - Swap entered key's endianness
		 * @param {string}  [options.file]           - Save raw NDEF to file
		 * @param {boolean} [options.secureChannel]  - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.ndefRead();
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, swapEndian, file, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (swapEndian) args.push("-l");
			if (file) args.push("--file", String(file));
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "ndefread"])(args);
		},

		readBlock: /**
		 * Read a block from a MIFARE Ultralight/NTAG tag. Autodetects card type.
		 *
		 * @param {Object}  options
		 * @param {number}  options.blockNo          - Block number to read. Required.
		 * @param {string}  [options.key]            - Authentication key (UL-C/UL-AES 16 bytes, EV1/NTAG 4 bytes)
		 * @param {boolean} [options.swapEndian]     - Swap entered key's endianness
		 * @param {boolean} [options.force]          - Force operation even if address is out of range
		 * @param {boolean} [options.secureChannel]  - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.readBlock({ blockNo: 0 });
		 * await pm3.hf.mfu.readBlock({ blockNo: 0, key: "AABBCCDD" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNo, key, swapEndian, force, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (blockNo !== undefined && blockNo !== null) args.push("--block", String(blockNo));
			if (force) args.push("--force");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "rdbl"])(args);
		},

		restore: /**
		 * Restore a MIFARE Ultralight/NTAG dump file to tag.
		 *
		 * @param {Object}  options
		 * @param {string}  options.file            - Dump file (bin/eml/json). Required.
		 * @param {string}  [options.key]           - Authentication key (UL-C 16 bytes, EV1/NTAG 4 bytes)
		 * @param {boolean} [options.swapEndian]    - Swap entered key's endianness
		 * @param {boolean} [options.specialWrite]  - Enable special write UID (magic tag only)
		 * @param {boolean} [options.writeVersion]  - Enable special write version/signature (magic NTAG 21* only)
		 * @param {boolean} [options.useDumpPwd]    - Use password from dump file (requires writeVersion)
		 * @param {boolean} [options.verbose]       - Verbose output
		 * @param {boolean} [options.dense]         - Dense dump output style
		 * @param {boolean} [options.secureChannel] - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.restore({ file: "myfile", specialWrite: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, key, swapEndian, specialWrite, writeVersion, useDumpPwd, verbose, dense, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file) args.push("--file", String(file));
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (specialWrite) args.push("-s");
			if (writeVersion) args.push("-e");
			if (useDumpPwd) args.push("-r");
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "restore"])(args);
		},

		tamper: /**
		 * Configure the NTAG 213TT tamper feature.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.mode]         - Tamper mode: "enable" or "disable"
		 * @param {string}  [options.message]      - Tamper message (4 hex bytes)
		 * @param {boolean} [options.lockMessage]  - Permanently lock the tamper message
		 *
		 * @example
		 * await pm3.hf.mfu.tamper({ mode: "enable" });
		 * await pm3.hf.mfu.tamper({ message: "0A0A0A0A" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ mode, message, lockMessage } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (mode === "enable") args.push("--enable");
			if (mode === "disable") args.push("--disable");
			if (message) args.push("--message", String(message));
			if (lockMessage) args.push("--lockmessage");
			return command(client.client, ["hf", "mfu", "tamper"])(args);
		},

		view: /**
		 * Print a MIFARE Ultralight/NTAG dump file (bin/eml/json).
		 *
		 * @param {Object}  options
		 * @param {string}  options.file     - Dump filename. Required.
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.dense]   - Dense dump output style
		 *
		 * @example
		 * await pm3.hf.mfu.view({ file: "hf-mfu-01020304-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "mfu", "view"])(args);
		},

		wipe: /**
		 * Wipe card to zeros (ignores blocks 0-3). Provide password to wipe config
		 * and set defaults.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.key]           - Authentication key (UL-C 16 bytes, EV1/NTAG 4 bytes)
		 * @param {boolean} [options.swapEndian]    - Swap entered key's endianness
		 * @param {boolean} [options.secureChannel] - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.wipe();
		 * await pm3.hf.mfu.wipe({ key: "49454D4B41455242214E4143554F5946" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, swapEndian, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "wipe"])(args);
		},

		writeBlock: /**
		 * Write a block to a MIFARE Ultralight/NTAG tag. Autodetects card type.
		 *
		 * @param {Object}  options
		 * @param {number}  options.blockNo          - Block number to write. Required.
		 * @param {string}  options.data             - Block data (4 or 16 hex bytes). Required.
		 * @param {string}  [options.key]            - Authentication key (UL-C/UL-AES 16 bytes, EV1/NTAG 4 bytes)
		 * @param {boolean} [options.swapEndian]     - Swap entered key's endianness
		 * @param {boolean} [options.force]          - Force operation even if address is out of range
		 * @param {boolean} [options.secureChannel]  - Use secure channel (requires key)
		 *
		 * @example
		 * await pm3.hf.mfu.writeBlock({ blockNo: 0, data: "01234567" });
		 * await pm3.hf.mfu.writeBlock({ blockNo: 0, data: "01234567", key: "AABBCCDD" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNo, data, key, swapEndian, force, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key) args.push("--key", String(key));
			if (swapEndian) args.push("-l");
			if (blockNo !== undefined && blockNo !== null) args.push("--block", String(blockNo));
			if (data) args.push("--data", String(data));
			if (force) args.push("--force");
			if (secureChannel) args.push("--schann");
			return command(client.client, ["hf", "mfu", "wrbl"])(args);
		},

		emuLoad: /**
		 * Load emulator memory with data from a dump file (bin/eml/json).
		 *
		 * @param {Object}  options
		 * @param {string}  options.file     - Dump filename. Required.
		 * @param {number}  [options.count]   - Number of blocks to load from eml file
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await pm3.hf.mfu.emuLoad({ file: "hf-mfu-04010203040506.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, count, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file) args.push("--file", String(file));
			if (count !== undefined && count !== null) args.push("--qty", String(count));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "mfu", "eload"])(args);
		},

		emuSave: /**
		 * Save emulator memory to a dump file (bin/json).
		 *
		 * @param {Object}  [options]
		 * @param {number}  [options.lastBlock] - Index of last block
		 * @param {string}  [options.file]      - Filename for dump file
		 *
		 * @example
		 * await pm3.hf.mfu.emuSave();
		 * await pm3.hf.mfu.emuSave({ lastBlock: 255 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ lastBlock, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (lastBlock !== undefined && lastBlock !== null) args.push("--end", String(lastBlock));
			if (file) args.push("--file", String(file));
			return command(client.client, ["hf", "mfu", "esave"])(args);
		},

		emuView: /**
		 * Display emulator memory.
		 *
		 * @param {Object}  [options]
		 * @param {number}  [options.lastBlock] - Index of last block
		 * @param {boolean} [options.dense]     - Dense dump output style
		 *
		 * @example
		 * await pm3.hf.mfu.emuView();
		 * await pm3.hf.mfu.emuView({ lastBlock: 255 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ lastBlock, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (lastBlock !== undefined && lastBlock !== null) args.push("--end", String(lastBlock));
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "mfu", "eview"])(args);
		},

		simulate: /**
		 * Simulate a MIFARE Ultralight family tag from emulator memory.
		 * Use `hf mfu eload` first to load data.
		 *
		 * @param {Object}  options
		 * @param {number}  options.type       - Simulation type (1-14). Required. Common: 2=UL, 7=NTAG 215, 13=UL-C, 14=UL-AES.
		 * @param {string}  [options.uid]       - UID (4, 7, or 10 hex bytes)
		 * @param {number}  [options.exitAfter] - Exit after N block reads (0=infinite)
		 * @param {boolean} [options.verbose]   - Verbose output
		 * @param {string}  [options.authReply1] - ULC/ULAES auth reply step 1: ek(RndB) (8 or 16 hex bytes)
		 * @param {string}  [options.authReply2] - ULC/ULAES auth reply step 2: ek(RndA') (8 or 16 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfu.simulate({ type: 2, uid: "11223344556677" });
		 * await pm3.hf.mfu.simulate({ type: 7 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ type, uid, exitAfter, verbose, authReply1, authReply2 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (type !== undefined && type !== null) args.push("--type", String(type));
			if (uid) args.push("--uid", String(uid));
			if (exitAfter !== undefined && exitAfter !== null) args.push("--num", String(exitAfter));
			if (verbose) args.push("--verbose");
			if (authReply1) args.push("--1a1", String(authReply1));
			if (authReply2) args.push("--1a2", String(authReply2));
			return command(client.client, ["hf", "mfu", "sim"])(args);
		},

		setUid: /**
		 * Set UID on a MIFARE Ultralight magic tag.
		 *
		 * @param {Object}  [options]
		 * @param {string}  [options.uid] - New UID (7 hex bytes)
		 *
		 * @example
		 * await pm3.hf.mfu.setUid({ uid: "11223344556677" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid) args.push("--uid", String(uid));
			return command(client.client, ["hf", "mfu", "setuid"])(args);
		},

		amiibo: /**
		 * Read and decrypt amiibo tag data.
		 *
		 * @param {Object}  [options]
		 * @param {boolean} [options.verbose]  - Verbose output
		 * @param {boolean} [options.decrypt]  - Decrypt memory
		 * @param {boolean} [options.encrypt]  - Encrypt memory
		 * @param {string}  [options.inFile]   - Input dump filename
		 * @param {string}  [options.outFile]  - Output dump filename
		 *
		 * @example
		 * await pm3.hf.mfu.amiibo({ decrypt: true, verbose: true });
		 * await pm3.hf.mfu.amiibo({ decrypt: true, inFile: "hf-mfu-04579DB27C4880-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, decrypt, encrypt, inFile, outFile } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (decrypt) args.push("--dec");
			if (encrypt) args.push("--enc");
			if (inFile) args.push("--in", String(inFile));
			if (outFile) args.push("--out", String(outFile));
			return command(client.client, ["hf", "mfu", "amiibo"])(args);
		},
	},
});
