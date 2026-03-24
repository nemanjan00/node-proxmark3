const command = require("../command");

/**
 * EMV (Europay, Mastercard, Visa) payment card commands.
 *
 * Provides functions for interacting with EMV contactless and contact
 * payment cards via ISO-14443 / ISO-7816 protocols, including applet
 * selection, transaction execution, record reading, and vulnerability testing.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command tree for emv
 */
module.exports = (clientPromise) => ({
	/**
	 * Alias of `trace list -t 7816` with selected protocol data to annotate trace buffer.
	 * You can load a trace from file (see `trace load -h`) or it will be downloaded from device by default.
	 * It accepts all other arguments of `trace list`. Note that some might not be relevant for this specific protocol.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.buffer=false] - Use data from trace buffer
	 * @param {boolean} [options.frame=false] - Show frame delay times
	 * @param {boolean} [options.crc=false] - Mark CRC bytes
	 * @param {boolean} [options.relative=false] - Show relative times (gap and duration)
	 * @param {boolean} [options.microseconds=false] - Display times in microseconds instead of clock cycles
	 * @param {boolean} [options.hexdump=false] - Show hexdump to convert to pcap(ng) or import into Wireshark
	 * @param {string} [options.file] - Filename of dictionary
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Show frame delay times
	 * await emv.list({ frame: true });
	 *
	 * @example
	 * // Use trace buffer
	 * await emv.list({ buffer: true });
	 */
	list: async ({ buffer, frame, crc, relative, microseconds, hexdump, file } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (buffer) args.push("--buffer");
		if (frame) args.push("--frame");
		if (crc) args.push("-c");
		if (relative) args.push("-r");
		if (microseconds) args.push("-u");
		if (hexdump) args.push("-x");
		if (file !== undefined && file !== null) args.push("--file", String(file));
		return command(client.client, ["emv", "list"])(args);
	},

	/**
	 * Execute EMV test suite.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.ignore=false] - Ignore timing tests for VM
	 * @param {boolean} [options.long=false] - Run long tests too
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Run tests, ignoring timing
	 * await emv.test({ ignore: true });
	 *
	 * @example
	 * // Run all tests including long ones
	 * await emv.test({ long: true });
	 */
	test: async ({ ignore, long } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (ignore) args.push("--ignore");
		if (long) args.push("--long");
		return command(client.client, ["emv", "test"])(args);
	},

	/**
	 * Execute Generate Challenge command. Returns a 4 or 8-byte random number from card.
	 * Needs an EMV applet to be selected and GPO to be executed.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Get challenge
	 * await emv.challenge();
	 *
	 * @example
	 * // Get challenge and keep field ON
	 * await emv.challenge({ keep: true });
	 */
	challenge: async ({ keep, apdu, wired } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (keep) args.push("--keep");
		if (apdu) args.push("--apdu");
		if (wired) args.push("--wired");
		return command(client.client, ["emv", "challenge"])(args);
	},

	/**
	 * Execute EMV contactless transaction.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.select=false] - Activate field and select card
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results
	 * @param {boolean} [options.jload=false] - Load transaction parameters from `emv_defparams.json` file
	 * @param {boolean} [options.force=false] - Force search AID instead of executing PPSE
	 * @param {string} [options.transactionType="msd"] - Transaction type: "msd" (default), "qvsdc" (qVSDC or M/Chip), "qvsdccda" (qVSDC or M/Chip plus CDA), or "vsdc" (VSDC, test only)
	 * @param {boolean} [options.acgpo=false] - VISA: generate AC from GPO
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Select card and execute MSD transaction, show APDU and TLV
	 * await emv.exec({ select: true, apdu: true, tlv: true });
	 *
	 * @example
	 * // Select card and execute CDA transaction
	 * await emv.exec({ select: true, apdu: true, tlv: true, transactionType: "qvsdccda" });
	 */
	exec: async ({ select, apdu, tlv, jload, force, transactionType, acgpo, wired } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (select) args.push("--select");
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (jload) args.push("--jload");
		if (force) args.push("--force");
		if (transactionType !== undefined && transactionType !== null) {
			const valid = ["msd", "qvsdc", "qvsdccda", "vsdc"];
			const t = String(transactionType).toLowerCase();
			if (!valid.includes(t)) {
				throw new RangeError(`transactionType must be one of: ${valid.join(", ")}`);
			}
			if (t === "qvsdc") args.push("--qvsdc");
			else if (t === "qvsdccda") args.push("--qvsdccda");
			else if (t === "vsdc") args.push("--vsdc");
			// "msd" is default, no flag needed
		}
		if (acgpo) args.push("--acgpo");
		if (wired) args.push("--wired");
		return command(client.client, ["emv", "exec"])(args);
	},

	/**
	 * Generate Application Cryptogram command. Returns data in TLV format.
	 * Needs an EMV applet to be selected and GPO to be executed.
	 *
	 * @param {string} data - CDOLdata/CDOL hex bytes (required)
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {boolean} [options.cda=false] - Execute CDA transaction (needs SDAD in results)
	 * @param {string} [options.decision] - Terminal decision: "aac" (declined), "tc" (approved), or "arqc" (online authorisation requested)
	 * @param {boolean} [options.params=false] - Load parameters from `emv_defparams.json` for CDOLdata making from CDOL
	 * @param {boolean} [options.make=false] - Make CDOLdata from CDOL (tag 8C and 8D) and parameters
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results of selected applets
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Generate AC with 2-byte CDOLdata, keep field ON
	 * await emv.genac("0102", { keep: true });
	 *
	 * @example
	 * // Generate AC with terminal decision 'declined'
	 * await emv.genac("01020304", { decision: "aac" });
	 *
	 * @example
	 * // Load params, make CDOL data, generate AC, show TLV
	 * await emv.genac("9F 37 04", { params: true, make: true, tlv: true });
	 */
	genac: async (data, { keep, cda, decision, params, make, apdu, tlv, wired } = {}) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data (CDOLdata/CDOL hex) is required");
		}
		const args = [];
		if (keep) args.push("--keep");
		if (cda) args.push("--cda");
		if (decision !== undefined && decision !== null) {
			const valid = ["aac", "tc", "arqc"];
			const d = String(decision).toLowerCase();
			if (!valid.includes(d)) {
				throw new RangeError(`decision must be one of: ${valid.join(", ")}`);
			}
			args.push("--decision", d);
		}
		if (params) args.push("--params");
		if (make) args.push("--make");
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (wired) args.push("--wired");
		args.push(...String(data).split(/\s+/));
		return command(client.client, ["emv", "genac"])(args);
	},

	/**
	 * Execute Get Processing Options command. Returns data in TLV format (0x77 - format2)
	 * or plain format (0x80 - format1). Needs an EMV applet to be selected.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {string} [options.data] - PDOLdata/PDOL hex bytes
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {boolean} [options.params=false] - Load parameters from `emv_defparams.json` for PDOLdata making from PDOL
	 * @param {boolean} [options.make=false] - Make PDOLdata from PDOL (tag 9F38) and parameters
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results of selected applets
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Execute GPO
	 * await emv.gpo({ keep: true });
	 *
	 * @example
	 * // Execute GPO with 4-byte PDOL data, show TLV
	 * await emv.gpo({ data: "01020304", tlv: true });
	 *
	 * @example
	 * // Load params, make PDOL data, execute GPO, show TLV
	 * await emv.gpo({ data: "9F 37 04", params: true, make: true, tlv: true });
	 */
	gpo: async ({ data, keep, params, make, apdu, tlv, wired } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (keep) args.push("--keep");
		if (params) args.push("--params");
		if (make) args.push("--make");
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (wired) args.push("--wired");
		if (data !== undefined && data !== null) {
			args.push(...String(data).split(/\s+/));
		}
		return command(client.client, ["emv", "gpo"])(args);
	},

	/**
	 * Generate Internal Authenticate command. Usually needs a 4-byte random number.
	 * Returns data in TLV format. Needs an EMV applet to be selected and GPO to be executed.
	 *
	 * @param {string} data - DDOLdata/DDOL hex bytes (required)
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {boolean} [options.params=false] - Load parameters from `emv_defparams.json` for DDOLdata making from DDOL
	 * @param {boolean} [options.make=false] - Make DDOLdata from DDOL (tag 9F49) and parameters
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results of selected applets
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Execute Internal Authenticate with 4-byte DDOLdata, keep field ON
	 * await emv.intauth("01020304", { keep: true });
	 *
	 * @example
	 * // Load params, make DDOL data, Internal Authenticate, show TLV
	 * await emv.intauth("9F 37 04", { params: true, make: true, tlv: true });
	 */
	intauth: async (data, { keep, params, make, apdu, tlv, wired } = {}) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data (DDOLdata/DDOL hex) is required");
		}
		const args = [];
		if (keep) args.push("--keep");
		if (params) args.push("--params");
		if (make) args.push("--make");
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (wired) args.push("--wired");
		args.push(...String(data).split(/\s+/));
		return command(client.client, ["emv", "intauth"])(args);
	},

	/**
	 * Execute PSE/PPSE select command. Returns a list of applets on the card.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.select=false] - Activate field and select card
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {string} [options.mode="ppse"] - Selection mode: "pse" (1PAY.SYS.DDF01) or "ppse" (2PAY.SYS.DDF01, default)
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results of selected applets
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Select card and get PSE
	 * await emv.pse({ select: true, mode: "pse" });
	 *
	 * @example
	 * // Select card, get PPSE, show TLV
	 * await emv.pse({ select: true, tlv: true });
	 */
	pse: async ({ select, keep, mode, apdu, tlv, wired } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (select) args.push("--select");
		if (keep) args.push("--keep");
		if (mode !== undefined && mode !== null) {
			const m = String(mode).toLowerCase();
			if (m === "pse") args.push("--pse");
			else if (m === "ppse") args.push("--ppse");
			else throw new RangeError('mode must be "pse" or "ppse"');
		}
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (wired) args.push("--wired");
		return command(client.client, ["emv", "pse"])(args);
	},

	/**
	 * Act as an EMV reader to identify tags. Looks for EMV tags until Enter or the pm3 button is pressed.
	 * In verbose mode it will also try to extract and decode transaction logs stored on the card.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @param {boolean} [options.verbose=false] - Verbose output, extract and decode transaction logs
	 * @param {boolean} [options.continuous=false] - Continuous reader mode
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Basic reader mode
	 * await emv.reader();
	 *
	 * @example
	 * // Verbose reader mode
	 * await emv.reader({ verbose: true });
	 *
	 * @example
	 * // Continuous reader mode
	 * await emv.reader({ continuous: true });
	 */
	reader: async ({ wired, verbose, continuous } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (wired) args.push("--wired");
		if (verbose) args.push("--verbose");
		if (continuous) args.push("-@");
		return command(client.client, ["emv", "reader"])(args);
	},

	/**
	 * Execute Read Record command. Returns data in TLV format.
	 * Needs a bank applet to be selected and sometimes needs GPO to be executed.
	 *
	 * @param {string} data - SFI and record number as hex bytes (e.g. "0101" for SFI=01, SFIrec=01) (required)
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results of selected applets
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Read file SFI=01, SFIrec=01
	 * await emv.readrec("0101", { keep: true });
	 *
	 * @example
	 * // Read file 0201 and show result in TLV
	 * await emv.readrec("0201", { keep: true, tlv: true });
	 */
	readrec: async (data, { keep, apdu, tlv, wired } = {}) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data (SFI + record hex) is required");
		}
		const args = [];
		if (keep) args.push("--keep");
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (wired) args.push("--wired");
		args.push(...String(data).split(/\s+/));
		return command(client.client, ["emv", "readrec"])(args);
	},

	/**
	 * Try to extract public keys from the card and run the ROCA vulnerability test against them.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.test=false] - Perform self tests
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Test contactless card
	 * await emv.roca();
	 *
	 * @example
	 * // Test contact card
	 * await emv.roca({ wired: true });
	 */
	roca: async ({ test, apdu, wired } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (test) args.push("--test");
		if (apdu) args.push("--apdu");
		if (wired) args.push("--wired");
		return command(client.client, ["emv", "roca"])(args);
	},

	/**
	 * Scan an EMV card and save its contents to a file.
	 * Executes an EMV contactless transaction and saves the result to a file for emulation.
	 *
	 * @param {string} file - JSON output file name (required)
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results
	 * @param {boolean} [options.extract=false] - Extract TLV elements and fill Application Data
	 * @param {boolean} [options.jload=false] - Load transaction parameters from `emv_defparams.json` file
	 * @param {string} [options.transactionType="msd"] - Transaction type: "msd" (default), "qvsdc", "qvsdccda", or "vsdc"
	 * @param {boolean} [options.acgpo=false] - VISA: generate AC from GPO
	 * @param {boolean} [options.merge=false] - Merge output file with card data (warning: may corrupt the file)
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Scan MSD transaction, show APDU and TLV
	 * await emv.scan("card_dump.json", { apdu: true, tlv: true });
	 *
	 * @example
	 * // Scan CDA transaction
	 * await emv.scan("card_dump.json", { transactionType: "qvsdccda" });
	 */
	scan: async (file, { apdu, tlv, extract, jload, transactionType, acgpo, merge, wired } = {}) => {
		const client = await clientPromise;
		if (file === undefined || file === null) {
			throw new Error("file (JSON output filename) is required");
		}
		const args = [];
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (extract) args.push("--extract");
		if (jload) args.push("--jload");
		if (transactionType !== undefined && transactionType !== null) {
			const valid = ["msd", "qvsdc", "qvsdccda", "vsdc"];
			const t = String(transactionType).toLowerCase();
			if (!valid.includes(t)) {
				throw new RangeError(`transactionType must be one of: ${valid.join(", ")}`);
			}
			if (t === "qvsdc") args.push("--qvsdc");
			else if (t === "qvsdccda") args.push("--qvsdccda");
			else if (t === "vsdc") args.push("--vsdc");
		}
		if (acgpo) args.push("--acgpo");
		if (merge) args.push("--merge");
		if (wired) args.push("--wired");
		args.push(String(file));
		return command(client.client, ["emv", "scan"])(args);
	},

	/**
	 * Try to select all applets from the applet list.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.select=false] - Activate field and select card
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results of selected applets
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Select card and search for applets
	 * await emv.search({ select: true });
	 *
	 * @example
	 * // Select card, search, show TLV results
	 * await emv.search({ select: true, tlv: true });
	 */
	search: async ({ select, keep, apdu, tlv, wired } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (select) args.push("--select");
		if (keep) args.push("--keep");
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (wired) args.push("--wired");
		return command(client.client, ["emv", "search"])(args);
	},

	/**
	 * Execute select applet command.
	 *
	 * @param {string} aid - Applet AID as hex string (required)
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.select=false] - Activate field and select card
	 * @param {boolean} [options.keep=false] - Keep field ON for next command
	 * @param {boolean} [options.apdu=false] - Show APDU requests and responses
	 * @param {boolean} [options.tlv=false] - TLV decode results
	 * @param {boolean} [options.wired=false] - Send data via contact (iso7816) interface instead of contactless
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Select card and select applet
	 * await emv.select("a00000000101", { select: true });
	 *
	 * @example
	 * // Select card, select applet, show TLV
	 * await emv.select("a00000000101", { select: true, tlv: true });
	 */
	select: async (aid, { select, keep, apdu, tlv, wired } = {}) => {
		const client = await clientPromise;
		if (aid === undefined || aid === null) {
			throw new Error("aid (Applet AID hex) is required");
		}
		const args = [];
		if (select) args.push("--select");
		if (keep) args.push("--keep");
		if (apdu) args.push("--apdu");
		if (tlv) args.push("--tlv");
		if (wired) args.push("--wired");
		args.push(String(aid));
		return command(client.client, ["emv", "select"])(args);
	},

	/**
	 * Execute ISO14443a payment TX using ISO7816 interface for authentication.
	 *
	 * @param {Object} [options={}] - Options
	 * @param {boolean} [options.test=false] - Test that the attached card is working (must be VISA)
	 * @param {string} [options.uid] - Optional 7 hex byte UID
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Test that the attached card is working
	 * await emv.smart2nfc({ test: true });
	 */
	smart2nfc: async ({ test, uid } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (test) args.push("--test");
		if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
		return command(client.client, ["emv", "smart2nfc"])(args);
	},
});
