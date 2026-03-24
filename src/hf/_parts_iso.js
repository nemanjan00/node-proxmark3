const command = require("../command");

/**
 * HF ISO standard sub-commands: 14443A, 14443B, and 15693.
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command tree for hf 14a, 14b, and 15 subgroups
 */
module.exports = (clientPromise) => ({
	"14a": {
		list: /**
		 * List ISO 14443A trace data. Alias of `trace list -t 14a -c`.
		 * Downloads trace from device by default, or use a loaded trace file.
		 *
		 * Usage: `hf 14a list [-h1crux] [--frame] [-f <fn>]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.buffer] - use data from trace buffer
		 * @param {boolean} [options.frame] - show frame delay times
		 * @param {boolean} [options.crc] - mark CRC bytes
		 * @param {boolean} [options.relative] - show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - filename of dictionary
		 *
		 * @example
		 * // Show frame delay times
		 * await hf["14a"].list({ frame: true });
		 * // Use trace buffer
		 * await hf["14a"].list({ buffer: true });
		 * @returns {Promise<string>} Command output
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
			return command(client.client, ["hf", "14a", "list"])(args);
		},

		antifuzz: /**
		 * Fuzz the ISO 14443A anticollision phase.
		 * Tries to fuzz with a UID of the specified length.
		 *
		 * Usage: `hf 14a antifuzz [-h47] [--10]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.uidLength] - UID byte length: "4", "7", or "10"
		 *
		 * @example
		 * // Fuzz with 4-byte UID
		 * await hf["14a"].antifuzz({ uidLength: "4" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uidLength } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uidLength === "4") args.push("-4");
			else if (uidLength === "7") args.push("-7");
			else if (uidLength === "10") args.push("--10");
			return command(client.client, ["hf", "14a", "antifuzz"])(args);
		},

		apdu: /**
		 * Send an ISO 7816-4 APDU via ISO 14443-4 block transmission protocol (T=CL).
		 * Works with all APDU types from ISO 7816-4:2013.
		 * Use `make` + `data` together, or `data` alone with the full APDU.
		 *
		 * Usage: `hf 14a apdu [-hskte] [--decode] [-m <hex>] [-l <dec>] -d <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.data - full APDU hex bytes, or data portion when `make` is provided
		 * @param {boolean} [options.select] - activate field and select card
		 * @param {boolean} [options.keep] - keep signal field ON after receive
		 * @param {boolean} [options.tlv] - decode TLV
		 * @param {boolean} [options.decode] - decode APDU request
		 * @param {string} [options.make] - APDU header, 4 bytes hex (CLA INS P1 P2)
		 * @param {boolean} [options.extended] - make extended length APDU (requires `make`)
		 * @param {number|string} [options.le] - Le APDU parameter (requires `make`)
		 *
		 * @example
		 * // Select and send full APDU with TLV decode
		 * await hf["14a"].apdu({ select: true, tlv: true, data: "00A404000E325041592E5359532E444446303100" });
		 * // Encode standard APDU with header and data
		 * await hf["14a"].apdu({ select: true, make: "00A40400", data: "325041592E5359532E4444463031", le: 256 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, select, keep, tlv, decode, make, extended, le } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (select) args.push("--select");
			if (keep) args.push("--keep");
			if (tlv) args.push("--tlv");
			if (decode) args.push("--decode");
			if (make !== undefined && make !== null) args.push("--make", String(make));
			if (extended) args.push("--extended");
			if (le !== undefined && le !== null) args.push("--le", String(le));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "14a", "apdu"])(args);
		},

		apdufind: /**
		 * Enumerate ISO 7816 APDUs to find valid CLS/INS/P1/P2 commands.
		 * Loops all 256 possible values for each byte in order INS -> P1/P2 -> CLA.
		 * Tag must be on antenna before running.
		 *
		 * Usage: `hf 14a apdufind [-hlv] [-c <hex>] [-i <hex>] [--p1 <hex>] [--p2 <hex>] [-r <number>] [-e <number>] [-s <hex>]...`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.cla] - start value of CLASS (1 hex byte)
		 * @param {string} [options.ins] - start value of INSTRUCTION (1 hex byte)
		 * @param {string} [options.p1] - start value of P1 (1 hex byte)
		 * @param {string} [options.p2] - start value of P2 (1 hex byte)
		 * @param {number|string} [options.resetInterval] - minimum seconds before resetting tag (default 300)
		 * @param {number|string} [options.errorLimit] - max times a non-9000/6D00 status is shown (default 512)
		 * @param {string[]} [options.skipIns] - instruction byte(s) to skip (array of hex strings)
		 * @param {boolean} [options.withLe] - also search APDUs with Le=0 (case 2S)
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * // Basic APDU enumeration
		 * await hf["14a"].apdufind();
		 * // Start from CLA 80, skip some instructions
		 * await hf["14a"].apdufind({ cla: "80", errorLimit: 20, skipIns: ["a4", "b0"], withLe: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cla, ins, p1, p2, resetInterval, errorLimit, skipIns, withLe, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cla !== undefined && cla !== null) args.push("--cla", String(cla));
			if (ins !== undefined && ins !== null) args.push("--ins", String(ins));
			if (p1 !== undefined && p1 !== null) args.push("--p1", String(p1));
			if (p2 !== undefined && p2 !== null) args.push("--p2", String(p2));
			if (resetInterval !== undefined && resetInterval !== null) args.push("--reset", String(resetInterval));
			if (errorLimit !== undefined && errorLimit !== null) args.push("--error-limit", String(errorLimit));
			if (Array.isArray(skipIns)) {
				skipIns.forEach((v) => args.push("--skip-ins", String(v)));
			}
			if (withLe) args.push("--with-le");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "14a", "apdufind"])(args);
		},

		chaining: /**
		 * Enable or disable ISO 14443A input chaining.
		 * Maximum input length is derived from ATS. Called with no args shows current state.
		 *
		 * Usage: `hf 14a chaining [-h10]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.state] - "on" to enable, "off" to disable, omit to query
		 *
		 * @example
		 * // Query current state
		 * await hf["14a"].chaining();
		 * // Disable chaining
		 * await hf["14a"].chaining({ state: "off" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ state } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (state === "on") args.push("--on");
			else if (state === "off") args.push("--off");
			return command(client.client, ["hf", "14a", "chaining"])(args);
		},

		config: /**
		 * Show or set ISO 14443A configuration.
		 *
		 * Usage: `hf 14a config`
		 *
		 * @example
		 * await hf["14a"].config();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "14a", "config"])([]);
		},

		cuids: /**
		 * Collect multiple ISO 14443A UIDs in one go.
		 *
		 * Usage: `hf 14a cuids [-h] [-n <dec>]`
		 *
		 * @param {Object} [options={}]
		 * @param {number|string} [options.count] - number of UIDs to collect
		 *
		 * @example
		 * // Collect 5 UIDs
		 * await hf["14a"].cuids({ count: 5 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ count } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (count !== undefined && count !== null) args.push("--num", String(count));
			return command(client.client, ["hf", "14a", "cuids"])(args);
		},

		info: /**
		 * Run extensive tests against an ISO 14443A tag to collect information.
		 *
		 * Usage: `hf 14a info [-hvns]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.verbose] - verbose output
		 * @param {boolean} [options.nackTest] - test for NACK bug
		 * @param {boolean} [options.aidSearch] - check if AIDs from aidlist.json are present on card
		 *
		 * @example
		 * // Full info with all tests
		 * await hf["14a"].info({ verbose: true, nackTest: true, aidSearch: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, nackTest, aidSearch } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (nackTest) args.push("--nacktest");
			if (aidSearch) args.push("--aidsearch");
			return command(client.client, ["hf", "14a", "info"])(args);
		},

		ndefformat: /**
		 * Format an ISO 14443A tag as a NFC tag with NDEF Data Exchange Format.
		 *
		 * Usage: `hf 14a ndefformat [-hv]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["14a"].ndefformat();
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "14a", "ndefformat"])(args);
		},

		ndefread: /**
		 * Read NFC Data Exchange Format (NDEF) file on a Type 4 NDEF tag.
		 *
		 * Usage: `hf 14a ndefread [-hv] [-f <fn>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.file] - save raw NDEF to file
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["14a"].ndefread();
		 * // Save raw NDEF to file
		 * await hf["14a"].ndefread({ file: "myfilename" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "14a", "ndefread"])(args);
		},

		ndefwrite: /**
		 * Write raw NDEF hex bytes to tag. Assumes tag is already NFC/NDEF formatted.
		 *
		 * Usage: `hf 14a ndefwrite [-hpv] [-d <hex>] [-f <fn>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.data] - raw NDEF hex bytes
		 * @param {string} [options.file] - write raw NDEF file to tag
		 * @param {boolean} [options.fixHeaders] - fix NDEF record headers / terminator block if missing
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * // Write empty NDEF record
		 * await hf["14a"].ndefwrite({ data: "0300FE" });
		 * // Write from file
		 * await hf["14a"].ndefwrite({ file: "myfilename" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, file, fixHeaders, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (data !== undefined && data !== null) args.push("-d", String(data));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (fixHeaders) args.push("-p");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "14a", "ndefwrite"])(args);
		},

		raw: /**
		 * Send raw bytes over ISO 14443A. Supports TOPAZ mode, crypto1, and secure channel.
		 *
		 * Usage: `hf 14a raw [-hack3rsv] [-t <ms>] [-b <dec>] [-w <us>] [--topaz] [--crypto1] [--schann] <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.data - raw hex bytes to send
		 * @param {boolean} [options.activateField] - active signal field ON without select
		 * @param {boolean} [options.appendCrc] - calculate and append CRC
		 * @param {boolean} [options.keepField] - keep signal field ON after receive
		 * @param {boolean} [options.selectOnly] - ISO14443-3 select only (skip RATS)
		 * @param {boolean} [options.noResponse] - do not read response
		 * @param {boolean} [options.select] - active signal field ON with select
		 * @param {number|string} [options.timeout] - timeout in milliseconds
		 * @param {number|string} [options.bitCount] - number of bits to send (for partial bytes)
		 * @param {boolean} [options.verbose] - verbose output
		 * @param {number|string} [options.wait] - wait in microseconds between select and command
		 * @param {boolean} [options.topaz] - use Topaz protocol
		 * @param {boolean} [options.crypto1] - use crypto1 session
		 * @param {boolean} [options.secureChannel] - use secure channel (must have key)
		 *
		 * @example
		 * // Select, CRC, read block 00
		 * await hf["14a"].raw({ select: true, appendCrc: true, data: "3000" });
		 * // Send 7-bit byte
		 * await hf["14a"].raw({ activateField: true, keepField: true, bitCount: 7, data: "40" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, activateField, appendCrc, keepField, selectOnly, noResponse, select, timeout, bitCount, verbose, wait, topaz, crypto1, secureChannel } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (activateField) args.push("-a");
			if (appendCrc) args.push("-c");
			if (keepField) args.push("-k");
			if (selectOnly) args.push("-3");
			if (noResponse) args.push("-r");
			if (select) args.push("-s");
			if (timeout !== undefined && timeout !== null) args.push("--timeout", String(timeout));
			if (bitCount !== undefined && bitCount !== null) args.push("-b", String(bitCount));
			if (verbose) args.push("--verbose");
			if (wait !== undefined && wait !== null) args.push("--wait", String(wait));
			if (topaz) args.push("--topaz");
			if (crypto1) args.push("--crypto1");
			if (secureChannel) args.push("--schann");
			if (data !== undefined && data !== null) args.push(String(data));
			return command(client.client, ["hf", "14a", "raw"])(args);
		},

		reader: /**
		 * Act as an ISO 14443A reader to identify a tag.
		 * Looks for tags until Enter or the pm3 button is pressed.
		 *
		 * Usage: `hf 14a reader [-hks@w] [--drop] [--skip]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.keep] - keep field active after command
		 * @param {boolean} [options.silent] - silent (no messages)
		 * @param {boolean} [options.drop] - just drop the signal field
		 * @param {boolean} [options.skip] - ISO14443-3 select only (skip RATS)
		 * @param {boolean} [options.continuous] - continuous reader mode
		 * @param {boolean} [options.wait] - wait for card
		 *
		 * @example
		 * await hf["14a"].reader();
		 * // Continuous mode
		 * await hf["14a"].reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ keep, silent, drop, skip, continuous, wait } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keep) args.push("--keep");
			if (silent) args.push("--silent");
			if (drop) args.push("--drop");
			if (skip) args.push("--skip");
			if (continuous) args.push("-@");
			if (wait) args.push("--wait");
			return command(client.client, ["hf", "14a", "reader"])(args);
		},

		sim: /**
		 * Simulate an ISO/IEC 14443 type A tag with 4, 7, or 10 byte UID.
		 * Simulation types: 1=MIFARE Classic 1k, 2=Ultralight, 3=Desfire, 4=ISO/IEC 14443-4,
		 * 5=MIFARE Tnp3xxx, 6=MIFARE Mini, 7=MFU EV1/NTAG215 Amiibo, 8=MIFARE Classic 4k,
		 * 9=FM11RF005SH Shanghai Metro, 10=ST25TA IKEA Rothult, 11=Javacard (JCOP),
		 * 12=4K Seos, 13=MF Ultralight C, 14=MF Ultralight AES, 15=MIFARE Plus.
		 *
		 * Usage: `hf 14a sim [-hxv] -t <1-15> [-u <hex>] [-n <dec>] [--sk] [--1a1 <hex>] [--1a2 <hex>]`
		 *
		 * @param {Object} options
		 * @param {number|string} options.type - simulation type (1-15)
		 * @param {string} [options.uid] - 4, 7, or 10 hex byte UID
		 * @param {number|string} [options.exitAfter] - exit after N blocks read (0 = infinite)
		 * @param {boolean} [options.readerAttack] - perform reader attack (nr/ar attack)
		 * @param {boolean} [options.fillKeys] - fill simulator keys from found keys
		 * @param {boolean} [options.verbose] - verbose output
		 * @param {string} [options.authReply1] - 8 or 16 hex byte ULC/ULAES auth reply step 1: ek(RndB)
		 * @param {string} [options.authReply2] - 8 or 16 hex byte ULC/ULAES auth reply step 2: ek(RndA')
		 *
		 * @example
		 * // Simulate MIFARE Classic 1k
		 * await hf["14a"].sim({ type: 1, uid: "11223344" });
		 * // Simulate MIFARE Ultralight
		 * await hf["14a"].sim({ type: 2 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ type, uid, exitAfter, readerAttack, fillKeys, verbose, authReply1, authReply2 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (type !== undefined && type !== null) args.push("--type", String(type));
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (exitAfter !== undefined && exitAfter !== null) args.push("--num", String(exitAfter));
			if (readerAttack) args.push("-x");
			if (fillKeys) args.push("--sk");
			if (verbose) args.push("--verbose");
			if (authReply1 !== undefined && authReply1 !== null) args.push("--1a1", String(authReply1));
			if (authReply2 !== undefined && authReply2 !== null) args.push("--1a2", String(authReply2));
			return command(client.client, ["hf", "14a", "sim"])(args);
		},

		simaid: /**
		 * Simulate an ISO/IEC 14443 type A tag with AID filtering.
		 * Respond to specific AID values with custom APDU responses.
		 *
		 * Usage: `hf 14a simaid [-hx] -t <1-12> [-u <hex>] [-r <hex>] [-a <hex>] [-e <hex>] [-p <hex>]`
		 *
		 * @param {Object} options
		 * @param {number|string} options.type - simulation type (1-12)
		 * @param {string} [options.uid] - 4, 7, or 10 hex byte UID
		 * @param {string} [options.ats] - 0-20 hex byte ATS
		 * @param {string} [options.aid] - 0-30 hex byte AID to respond to (default: A000000000000000000000)
		 * @param {string} [options.selectResponse] - 0-100 hex byte APDU response to AID Select (default: 9000)
		 * @param {string} [options.getDataResponse] - 0-100 hex byte APDU response to Get Data after AID (default: 9000)
		 * @param {boolean} [options.enumerate] - enumerate all AID values via returning Not Found
		 *
		 * @example
		 * // Simulate Desfire
		 * await hf["14a"].simaid({ type: 3 });
		 * // Custom AID and responses
		 * await hf["14a"].simaid({ type: 3, aid: "a000000000000000000000", selectResponse: "9000", getDataResponse: "9000" });
		 * // Enumerate AID values
		 * await hf["14a"].simaid({ type: 3, ats: "0578817222", enumerate: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ type, uid, ats, aid, selectResponse, getDataResponse, enumerate } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (type !== undefined && type !== null) args.push("--type", String(type));
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (ats !== undefined && ats !== null) args.push("--ats", String(ats));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (selectResponse !== undefined && selectResponse !== null) args.push("--selectaid_response", String(selectResponse));
			if (getDataResponse !== undefined && getDataResponse !== null) args.push("--getdata_response", String(getDataResponse));
			if (enumerate) args.push("--enumerate");
			return command(client.client, ["hf", "14a", "simaid"])(args);
		},

		sniff: /**
		 * Sniff communication between reader and ISO 14443A tag.
		 * Use `hf 14a list` to view collected data.
		 *
		 * Usage: `hf 14a sniff [-hcri]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.triggerOnCard] - triggered by first data from card
		 * @param {boolean} [options.triggerOnReader] - triggered by first 7-bit request from reader (REQ, WUP)
		 * @param {boolean} [options.interactive] - console waits until sniff finishes or is aborted
		 *
		 * @example
		 * // Sniff with both triggers
		 * await hf["14a"].sniff({ triggerOnCard: true, triggerOnReader: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ triggerOnCard, triggerOnReader, interactive } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (triggerOnCard) args.push("--card");
			if (triggerOnReader) args.push("--reader");
			if (interactive) args.push("--interactive");
			return command(client.client, ["hf", "14a", "sniff"])(args);
		},
	},

	"14b": {
		apdu: /**
		 * Send an ISO 7816-4 APDU via ISO 14443B-4 block transmission protocol (T=CL).
		 * Works with all APDU types from ISO 7816-4:2013.
		 *
		 * Usage: `hf 14b apdu [-hskte] [--decode] [-m <hex>] [-l <int>] -d <hex> [--timeout <dec>]`
		 *
		 * @param {Object} options
		 * @param {string} options.data - full APDU hex bytes, or data portion when `make` is provided
		 * @param {boolean} [options.select] - activate field and select card
		 * @param {boolean} [options.keep] - keep signal field ON after receive
		 * @param {boolean} [options.tlv] - decode TLV
		 * @param {boolean} [options.decode] - decode APDU request
		 * @param {string} [options.make] - APDU header, 4 bytes hex (CLA INS P1 P2)
		 * @param {boolean} [options.extended] - make extended length APDU (requires `make`)
		 * @param {number|string} [options.le] - Le APDU parameter (requires `make`)
		 * @param {number|string} [options.timeout] - timeout in milliseconds
		 *
		 * @example
		 * // Select and send APDU
		 * await hf["14b"].apdu({ select: true, data: "94a40800043f000002" });
		 * // Encode standard APDU
		 * await hf["14b"].apdu({ select: true, make: "00A40400", le: 256, data: "325041592E5359532E4444463031" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, select, keep, tlv, decode, make, extended, le, timeout } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (select) args.push("--select");
			if (keep) args.push("--keep");
			if (tlv) args.push("--tlv");
			if (decode) args.push("--decode");
			if (make !== undefined && make !== null) args.push("--make", String(make));
			if (extended) args.push("--extended");
			if (le !== undefined && le !== null) args.push("--le", String(le));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (timeout !== undefined && timeout !== null) args.push("--timeout", String(timeout));
			return command(client.client, ["hf", "14b", "apdu"])(args);
		},

		calypso: /**
		 * Read out the contents of an ISO 14443B Calypso card.
		 *
		 * Usage: `hf 14b calypso [-h]`
		 *
		 * @example
		 * await hf["14b"].calypso();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "14b", "calypso"])([]);
		},

		config: /**
		 * Show or set ISO 14443B configuration.
		 *
		 * Usage: `hf 14b config`
		 *
		 * @example
		 * await hf["14b"].config();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "14b", "config"])([]);
		},

		dump: /**
		 * Dump contents of an ISO 14443B tag and save to file.
		 * Tries to autodetect card type; memory size defaults to SRI4K.
		 *
		 * Usage: `hf 14b dump [-hz] [-f <fn>] [--ns]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.file] - filename for dump (default: UID-based)
		 * @param {boolean} [options.noSave] - do not save to file
		 * @param {boolean} [options.dense] - dense dump output style
		 *
		 * @example
		 * await hf["14b"].dump();
		 * await hf["14b"].dump({ file: "myfilename" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, noSave, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (noSave) args.push("--ns");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "14b", "dump"])(args);
		},

		info: /**
		 * Display tag information for ISO/IEC 14443 type B tags.
		 *
		 * Usage: `hf 14b info [-hsv]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.aidSearch] - check if AIDs from aidlist.json are present
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["14b"].info();
		 * @returns {Promise<string>} Command output
		 */
		async ({ aidSearch, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (aidSearch) args.push("--aidsearch");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "14b", "info"])(args);
		},

		list: /**
		 * List ISO 14443B trace data. Alias of `trace list -t 14b -c`.
		 *
		 * Usage: `hf 14b list [-h1crux] [--frame] [-f <fn>]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.buffer] - use data from trace buffer
		 * @param {boolean} [options.frame] - show frame delay times
		 * @param {boolean} [options.crc] - mark CRC bytes
		 * @param {boolean} [options.relative] - show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - filename of dictionary
		 *
		 * @example
		 * await hf["14b"].list({ frame: true });
		 * await hf["14b"].list({ buffer: true });
		 * @returns {Promise<string>} Command output
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
			return command(client.client, ["hf", "14b", "list"])(args);
		},

		mobib: /**
		 * Read out the contents of an ISO 14443B Mobib card.
		 *
		 * Usage: `hf 14b mobib [-ho]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.old] - for old cards
		 *
		 * @example
		 * await hf["14b"].mobib();
		 * @returns {Promise<string>} Command output
		 */
		async ({ old } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (old) args.push("--old");
			return command(client.client, ["hf", "14b", "mobib"])(args);
		},

		ndefread: /**
		 * Read and print NFC Data Exchange Format (NDEF) from an ISO 14443B tag.
		 *
		 * Usage: `hf 14b ndefread [-hv] [-f <fn>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.file] - save raw NDEF to file
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["14b"].ndefread();
		 * await hf["14b"].ndefread({ file: "myfilename" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "14b", "ndefread"])(args);
		},

		raw: /**
		 * Send raw bytes over ISO 14443B to card. Activates field by default.
		 * Supports multiple select modes: standard, SRx ST, ASK C-ticket, Fuji/Xerox, Picopass.
		 *
		 * Usage: `hf 14b raw [-hackrsv] [-d <hex>] [-t <dec>] [--sr] [--cts] [--xrx] [--pico]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.data] - hex bytes to send
		 * @param {boolean} [options.activateField] - active signal field ON without select
		 * @param {boolean} [options.appendCrc] - calculate and append CRC
		 * @param {boolean} [options.keep] - keep signal field ON after receive
		 * @param {boolean} [options.noResponse] - do not read response from card
		 * @param {number|string} [options.timeout] - timeout in milliseconds
		 * @param {string} [options.selectMode] - select mode: "std", "sr", "cts", "xrx", or "pico"
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * // Standard select with CRC
		 * await hf["14b"].raw({ appendCrc: true, keep: true, selectMode: "std", data: "0200a40400" });
		 * // SRx select
		 * await hf["14b"].raw({ appendCrc: true, keep: true, selectMode: "sr", data: "0200a40400" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, activateField, appendCrc, keep, noResponse, timeout, selectMode, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (activateField) args.push("-a");
			if (appendCrc) args.push("--crc");
			if (keep) args.push("--keep");
			if (noResponse) args.push("-r");
			if (timeout !== undefined && timeout !== null) args.push("--timeout", String(timeout));
			if (selectMode === "std") args.push("--std");
			else if (selectMode === "sr") args.push("--sr");
			else if (selectMode === "cts") args.push("--cts");
			else if (selectMode === "xrx") args.push("--xrx");
			else if (selectMode === "pico") args.push("--pico");
			if (verbose) args.push("--verbose");
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "14b", "raw"])(args);
		},

		rdbl: /**
		 * Read a single block from a SRI512 or SRIX4K tag.
		 *
		 * Usage: `hf 14b rdbl [-h] [-b <dec>]`
		 *
		 * @param {Object} [options={}]
		 * @param {number|string} [options.blockNumber] - block number to read
		 *
		 * @example
		 * await hf["14b"].rdbl({ blockNumber: 6 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNumber } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (blockNumber !== undefined && blockNumber !== null) args.push("--block", String(blockNumber));
			return command(client.client, ["hf", "14b", "rdbl"])(args);
		},

		reader: /**
		 * Act as a 14443B reader to identify a tag.
		 *
		 * Usage: `hf 14b reader [-hv@] [--plot]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.plot] - show anticollision signal trace in plot window
		 * @param {boolean} [options.verbose] - verbose output
		 * @param {boolean} [options.continuous] - continuous reader mode
		 *
		 * @example
		 * await hf["14b"].reader();
		 * await hf["14b"].reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ plot, verbose, continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (plot) args.push("--plot");
			if (verbose) args.push("--verbose");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "14b", "reader"])(args);
		},

		restore: /**
		 * Restore data from a dump file (bin/eml/json) to an ISO 14443B tag.
		 * Ignores the special block at the end of the dump file if present.
		 *
		 * Usage: `hf 14b restore [-h] [-f <fn>] [--512] [--4k]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.file] - filename for dump (default: UID-based)
		 * @param {string} [options.tagType] - target tag type: "512" for SRI 512 or "4k" for SRIX 4K (default)
		 *
		 * @example
		 * await hf["14b"].restore({ tagType: "4k", file: "myfilename" });
		 * await hf["14b"].restore({ tagType: "512", file: "myfilename" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (tagType === "512") args.push("--512");
			else if (tagType === "4k") args.push("--4k");
			return command(client.client, ["hf", "14b", "restore"])(args);
		},

		setuid: /**
		 * Set UID on a magic ISO 14443B card (only works with magic cards).
		 *
		 * Usage: `hf 14b setuid [-h] -u <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.uid - UID, 4 hex bytes
		 *
		 * @example
		 * await hf["14b"].setuid({ uid: "11223344" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			return command(client.client, ["hf", "14b", "setuid"])(args);
		},

		sim: /**
		 * Simulate an ISO/IEC 14443 type B tag with a 4-byte UID/PUPI.
		 *
		 * Usage: `hf 14b sim [-h] -u hex`
		 *
		 * @param {Object} options
		 * @param {string} options.uid - 4-byte UID/PUPI hex string
		 *
		 * @example
		 * await hf["14b"].sim({ uid: "11AA33BB" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			return command(client.client, ["hf", "14b", "sim"])(args);
		},

		sniff: /**
		 * Sniff communication between reader and ISO 14443B tag.
		 * Use `hf 14b list` to view collected data.
		 *
		 * Usage: `hf 14b sniff [-h]`
		 *
		 * @example
		 * await hf["14b"].sniff();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "14b", "sniff"])([]);
		},

		tearoff: /**
		 * Use tear-off technique to manipulate ST25TB/SRx monotonic counter blocks.
		 * Exploits EEPROM tearing to increment counters that normally can only be decremented.
		 * The attack sends a write command and cuts RF at a precise moment for a partial write.
		 * NOTE: 0xFFFFFFFE values may be unstable. Keep tag positioned steadily on antenna.
		 *
		 * Usage: `hf 14b tearoff [-h] -b <dec> -d <hex> [--adj <dec>] [--safety <dec>] [--start <dec>]`
		 *
		 * @param {Object} options
		 * @param {number|string} options.blockNumber - block number (typically 5 or 6 for ST25TB counters)
		 * @param {string} options.targetValue - target counter value, 4 hex bytes (e.g. "FFFFFFFE")
		 * @param {number|string} [options.timingStep] - tear-off timing step in microseconds (default: 25)
		 * @param {number|string} [options.safetyThreshold] - safety threshold value (default: 0x1000)
		 * @param {number|string} [options.initialDelay] - initial tear-off delay in microseconds (default: 150)
		 *
		 * @example
		 * await hf["14b"].tearoff({ blockNumber: 5, targetValue: "FFFFFFFE" });
		 * await hf["14b"].tearoff({ blockNumber: 5, targetValue: "FFFFFFFE", initialDelay: 5000, timingStep: 50 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNumber, targetValue, timingStep, safetyThreshold, initialDelay } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (blockNumber !== undefined && blockNumber !== null) args.push("--block", String(blockNumber));
			if (targetValue !== undefined && targetValue !== null) args.push("--data", String(targetValue));
			if (timingStep !== undefined && timingStep !== null) args.push("--adj", String(timingStep));
			if (safetyThreshold !== undefined && safetyThreshold !== null) args.push("--safety", String(safetyThreshold));
			if (initialDelay !== undefined && initialDelay !== null) args.push("--start", String(initialDelay));
			return command(client.client, ["hf", "14b", "tearoff"])(args);
		},

		valid: /**
		 * Run SRIX checksum validation test.
		 *
		 * Usage: `hf 14b valid [-h]`
		 *
		 * @example
		 * await hf["14b"].valid();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "14b", "valid"])([]);
		},

		view: /**
		 * Print a ISO 14443B dump file (bin/eml/json).
		 * Filename should contain a UID to determine card memory type.
		 *
		 * Usage: `hf 14b view [-hvz] -f <fn>`
		 *
		 * @param {Object} options
		 * @param {string} options.file - filename for dump file
		 * @param {boolean} [options.verbose] - verbose output
		 * @param {boolean} [options.dense] - dense dump output style
		 *
		 * @example
		 * await hf["14b"].view({ file: "hf-14b-01020304-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "14b", "view"])(args);
		},

		wrbl: /**
		 * Write data to a SRI512 or SRIX4K block.
		 * Use `--force` to override out-of-range block checks.
		 * The special block at end denotes OTP and lock bits.
		 *
		 * Usage: `hf 14b wrbl [-h] [-b <dec>] -d <hex> [--512] [--4k] [--sb] [--force]`
		 *
		 * @param {Object} options
		 * @param {string} options.data - 4 hex bytes to write
		 * @param {number|string} [options.blockNumber] - block number
		 * @param {string} [options.tagType] - target tag type: "512" for SRI 512 or "4k" for SRIX 4K (default)
		 * @param {boolean} [options.specialBlock] - write to special block at end of memory (0xFF)
		 * @param {boolean} [options.force] - override block range checks
		 *
		 * @example
		 * await hf["14b"].wrbl({ tagType: "4k", blockNumber: 100, data: "11223344" });
		 * // Special block write
		 * await hf["14b"].wrbl({ tagType: "4k", specialBlock: true, data: "11223344" });
		 * await hf["14b"].wrbl({ tagType: "512", blockNumber: 15, data: "11223344" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, blockNumber, tagType, specialBlock, force } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (blockNumber !== undefined && blockNumber !== null) args.push("--block", String(blockNumber));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (tagType === "512") args.push("--512");
			else if (tagType === "4k") args.push("--4k");
			if (specialBlock) args.push("--sb");
			if (force) args.push("--force");
			return command(client.client, ["hf", "14b", "wrbl"])(args);
		},
	},

	"15": {
		list: /**
		 * List ISO 15693 trace data. Alias of `trace list -t 15 -c`.
		 *
		 * Usage: `hf 15 list [-h1crux] [--frame] [-f <fn>]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.buffer] - use data from trace buffer
		 * @param {boolean} [options.frame] - show frame delay times
		 * @param {boolean} [options.crc] - mark CRC bytes
		 * @param {boolean} [options.relative] - show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - filename of dictionary
		 *
		 * @example
		 * await hf["15"].list({ frame: true });
		 * await hf["15"].list({ buffer: true });
		 * @returns {Promise<string>} Command output
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
			return command(client.client, ["hf", "15", "list"])(args);
		},

		demod: /**
		 * Demodulate / decode ISO 15693 from downloaded samples.
		 * Gather samples with `hf 15 samples` or `hf 15 sniff` first.
		 *
		 * Usage: `hf 15 demod [-h]`
		 *
		 * @example
		 * await hf["15"].demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "15", "demod"])([]);
		},

		dump: /**
		 * Dump contents of an ISO 15693 tag and save to file (bin/json).
		 *
		 * Usage: `hf 15 dump [-h*2ovz] [-u <hex>] [--ua] [-f <fn>] [--bs <dec>] [--ns]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 * @param {string} [options.file] - filename for dump file
		 * @param {number|string} [options.blockSize] - block size (default 4)
		 * @param {boolean} [options.noSave] - do not save to file
		 * @param {boolean} [options.verbose] - verbose output
		 * @param {boolean} [options.dense] - dense dump output style
		 *
		 * @example
		 * await hf["15"].dump();
		 * await hf["15"].dump({ scan: true });
		 * await hf["15"].dump({ uid: "E011223344556677", file: "hf-15-my-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, unaddressed, scan, slowMode, optionFlag, file, blockSize, noSave, verbose, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (blockSize !== undefined && blockSize !== null) args.push("--bs", String(blockSize));
			if (noSave) args.push("--ns");
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "15", "dump"])(args);
		},

		findafi: /**
		 * Brute force AFI of an ISO 15693 tag.
		 * Estimated execution time is around 2 minutes.
		 *
		 * Usage: `hf 15 findafi [-h2]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 *
		 * @example
		 * await hf["15"].findafi();
		 * @returns {Promise<string>} Command output
		 */
		async ({ slowMode } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (slowMode) args.push("-2");
			return command(client.client, ["hf", "15", "findafi"])(args);
		},

		info: /**
		 * Get system information from an ISO 15693 tag using the `get_systeminfo` command (0x2B).
		 *
		 * Usage: `hf 15 info [-h*2o] [-u <hex>] [--ua]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 *
		 * @example
		 * await hf["15"].info();
		 * await hf["15"].info({ scan: true });
		 * await hf["15"].info({ uid: "E011223344556677" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, unaddressed, scan, slowMode, optionFlag } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			return command(client.client, ["hf", "15", "info"])(args);
		},

		raw: /**
		 * Send raw bytes over ISO 15693 to card.
		 *
		 * Usage: `hf 15 raw [-hack2rw] -d <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.data - raw hex bytes to send
		 * @param {boolean} [options.activateField] - activate field
		 * @param {boolean} [options.appendCrc] - calculate and append CRC
		 * @param {boolean} [options.keepField] - keep signal field ON after receive
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.noResponse] - do not read response
		 * @param {boolean} [options.waitLonger] - wait longer for response (for writes)
		 *
		 * @example
		 * // Activate, add CRC
		 * await hf["15"].raw({ activateField: true, appendCrc: true, data: "260100" });
		 * // Activate, add CRC, keep field, skip response
		 * await hf["15"].raw({ activateField: true, keepField: true, noResponse: true, appendCrc: true, data: "260100" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, activateField, appendCrc, keepField, slowMode, noResponse, waitLonger } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (activateField) args.push("-a");
			if (appendCrc) args.push("--crc");
			if (keepField) args.push("-k");
			if (slowMode) args.push("-2");
			if (noResponse) args.push("-r");
			if (waitLonger) args.push("--wait");
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "15", "raw"])(args);
		},

		rdbl: /**
		 * Read a single page/block from an ISO 15693 tag.
		 *
		 * Usage: `hf 15 rdbl [-h*2ov] [-u <hex>] [--ua] -b <dec> [--bs <dec>]`
		 *
		 * @param {Object} options
		 * @param {number|string} options.blockNumber - page number (0-255)
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 * @param {number|string} [options.blockSize] - block size (default 4)
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["15"].rdbl({ scan: true, blockNumber: 12 });
		 * await hf["15"].rdbl({ uid: "E011223344556677", blockNumber: 12 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNumber, uid, unaddressed, scan, slowMode, optionFlag, blockSize, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			if (blockNumber !== undefined && blockNumber !== null) args.push("--blk", String(blockNumber));
			if (blockSize !== undefined && blockSize !== null) args.push("--bs", String(blockSize));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "15", "rdbl"])(args);
		},

		rdmulti: /**
		 * Read multiple pages/blocks from an ISO 15693 tag.
		 *
		 * Usage: `hf 15 rdmulti [-h*2ov] [-u <hex>] [--ua] -b <dec> --cnt <dec> [--bs <dec>]`
		 *
		 * @param {Object} options
		 * @param {number|string} options.blockNumber - first page number (0-255)
		 * @param {number|string} options.count - number of pages to read (1-6)
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 * @param {number|string} [options.blockSize] - block size (default 4)
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * // Read 6 blocks starting from block 1
		 * await hf["15"].rdmulti({ scan: true, blockNumber: 1, count: 6 });
		 * await hf["15"].rdmulti({ uid: "E011223344556677", blockNumber: 12, count: 3 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNumber, count, uid, unaddressed, scan, slowMode, optionFlag, blockSize, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			if (blockNumber !== undefined && blockNumber !== null) args.push("-b", String(blockNumber));
			if (count !== undefined && count !== null) args.push("--cnt", String(count));
			if (blockSize !== undefined && blockSize !== null) args.push("--bs", String(blockSize));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "15", "rdmulti"])(args);
		},

		reader: /**
		 * Act as an ISO 15693 reader. Looks for tags until Enter or pm3 button is pressed.
		 *
		 * Usage: `hf 15 reader [-h@]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.continuous] - continuous reader mode
		 *
		 * @example
		 * await hf["15"].reader();
		 * await hf["15"].reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "15", "reader"])(args);
		},

		restore: /**
		 * Restore contents of a dump file (bin/eml/json) onto an ISO 15693 tag.
		 *
		 * Usage: `hf 15 restore [-h*2ov] [-u <hex>] [--ua] [-f <fn>] [-r <dec>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 * @param {string} [options.file] - filename for dump file
		 * @param {number|string} [options.retries] - number of retries (default 3)
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["15"].restore();
		 * await hf["15"].restore({ scan: true });
		 * await hf["15"].restore({ uid: "E011223344556677", file: "hf-15-my-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, unaddressed, scan, slowMode, optionFlag, file, retries, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (retries !== undefined && retries !== null) args.push("--retry", String(retries));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "15", "restore"])(args);
		},

		samples: /**
		 * Acquire samples as reader (enables carrier, sends inquiry, downloads to graph buffer).
		 * Use `hf 15 demod` afterwards to demodulate/decode.
		 *
		 * Usage: `hf 15 samples [-h]`
		 *
		 * @example
		 * await hf["15"].samples();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "15", "samples"])([]);
		},

		sim: /**
		 * Simulate an ISO 15693 tag.
		 *
		 * Usage: `hf 15 sim [-h] [-u <hex>] [-b <dec>] [-t <dec>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.uid] - UID, 8 hex bytes
		 * @param {number|string} [options.blockSize] - block size (default 4)
		 * @param {number|string} [options.timeout] - timeout in ms (-1 = until button press)
		 *
		 * @example
		 * await hf["15"].sim();
		 * await hf["15"].sim({ uid: "E011223344556677" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, blockSize, timeout } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (blockSize !== undefined && blockSize !== null) args.push("--blocksize", String(blockSize));
			if (timeout !== undefined && timeout !== null) args.push("--timeout", String(timeout));
			return command(client.client, ["hf", "15", "sim"])(args);
		},

		sniff: /**
		 * Sniff ISO 15693 activity without enabling carrier.
		 *
		 * Usage: `hf 15 sniff [-h]`
		 *
		 * @example
		 * await hf["15"].sniff();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "15", "sniff"])([]);
		},

		view: /**
		 * Print an ISO 15693 tag dump file (bin/eml/json).
		 *
		 * Usage: `hf 15 view [-hz] -f <fn>`
		 *
		 * @param {Object} options
		 * @param {string} options.file - filename for dump file
		 * @param {boolean} [options.dense] - dense dump output style
		 *
		 * @example
		 * await hf["15"].view({ file: "hf-15-1122334455667788-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "15", "view"])(args);
		},

		wipe: /**
		 * Wipe an ISO 15693 tag by filling memory with zeros.
		 *
		 * Usage: `hf 15 wipe [-h*2ov] [-u <hex>] [--ua] [--bs <dec>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 * @param {number|string} [options.blockSize] - block size (default 4)
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["15"].wipe();
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, unaddressed, scan, slowMode, optionFlag, blockSize, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			if (blockSize !== undefined && blockSize !== null) args.push("--bs", String(blockSize));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "15", "wipe"])(args);
		},

		wrbl: /**
		 * Write a block/page on an ISO 15693 tag.
		 *
		 * Usage: `hf 15 wrbl [-h*2ov] [-u <hex>] [--ua] -b <dec> -d <hex>`
		 *
		 * @param {Object} options
		 * @param {number|string} options.blockNumber - page number (0-255)
		 * @param {string} options.data - data to write, 4 hex bytes
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["15"].wrbl({ scan: true, blockNumber: 12, data: "AABBCCDD" });
		 * await hf["15"].wrbl({ uid: "E011223344556677", blockNumber: 12, data: "AABBCCDD" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ blockNumber, data, uid, unaddressed, scan, slowMode, optionFlag, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			if (blockNumber !== undefined && blockNumber !== null) args.push("--blk", String(blockNumber));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "15", "wrbl"])(args);
		},

		eload: /**
		 * Load a memory dump from file into emulator memory for use with `hf 15 sim`.
		 *
		 * Usage: `hf 15 eload [-h] -f <fn>`
		 *
		 * @param {Object} options
		 * @param {string} options.file - filename of dump
		 *
		 * @example
		 * await hf["15"].eload({ file: "hf-15-01020304.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "15", "eload"])(args);
		},

		esave: /**
		 * Save emulator memory into files (bin/json).
		 *
		 * Usage: `hf 15 esave [-h] -f <fn>`
		 *
		 * @param {Object} options
		 * @param {string} options.file - filename for dump file
		 *
		 * @example
		 * await hf["15"].esave({ file: "hf-15-01020304" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["hf", "15", "esave"])(args);
		},

		eview: /**
		 * Display emulator memory contents.
		 *
		 * Usage: `hf 15 eview [-hz]`
		 *
		 * @param {Object} [options={}]
		 * @param {boolean} [options.dense] - dense dump output style
		 *
		 * @example
		 * await hf["15"].eview();
		 * await hf["15"].eview({ dense: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "15", "eview"])(args);
		},

		slixwritepwd: /**
		 * Write a password on a SLIX family ISO 15693 tag.
		 * Some tags do not support all password types.
		 *
		 * Usage: `hf 15 slixwritepwd [-h] -t <read|write|privacy|destroy|easafi> [-o <hex>] -n <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.passwordType - which password field: "read", "write", "privacy", "destroy", or "easafi"
		 * @param {string} options.newPassword - new password, 4 hex bytes
		 * @param {string} [options.oldPassword] - old password (if present), 4 hex bytes
		 *
		 * @example
		 * await hf["15"].slixwritepwd({ passwordType: "read", oldPassword: "00000000", newPassword: "12131415" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ passwordType, newPassword, oldPassword } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (passwordType !== undefined && passwordType !== null) args.push("--type", String(passwordType));
			if (oldPassword !== undefined && oldPassword !== null) args.push("--old", String(oldPassword));
			if (newPassword !== undefined && newPassword !== null) args.push("--new", String(newPassword));
			return command(client.client, ["hf", "15", "slixwritepwd"])(args);
		},

		slixeasdisable: /**
		 * Disable EAS mode on a SLIX ISO 15693 tag.
		 *
		 * Usage: `hf 15 slixeasdisable [-h] [-p <hex>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.password] - optional password, 4 hex bytes
		 *
		 * @example
		 * await hf["15"].slixeasdisable({ password: "0F0F0F0F" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "15", "slixeasdisable"])(args);
		},

		slixeasenable: /**
		 * Enable EAS mode on a SLIX ISO 15693 tag.
		 *
		 * Usage: `hf 15 slixeasenable [-h] [-p <hex>]`
		 *
		 * @param {Object} [options={}]
		 * @param {string} [options.password] - optional password, 4 hex bytes
		 *
		 * @example
		 * await hf["15"].slixeasenable({ password: "0F0F0F0F" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "15", "slixeasenable"])(args);
		},

		slixprivacydisable: /**
		 * Disable privacy mode on a SLIX ISO 15693 tag.
		 *
		 * Usage: `hf 15 slixprivacydisable [-h] -p <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.password - password, 4 hex bytes
		 *
		 * @example
		 * await hf["15"].slixprivacydisable({ password: "0F0F0F0F" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "15", "slixprivacydisable"])(args);
		},

		slixprivacyenable: /**
		 * Enable privacy mode on a SLIX ISO 15693 tag.
		 *
		 * Usage: `hf 15 slixprivacyenable [-h] -p <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.password - password, 4 hex bytes
		 *
		 * @example
		 * await hf["15"].slixprivacyenable({ password: "0F0F0F0F" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "15", "slixprivacyenable"])(args);
		},

		slixprotectpage: /**
		 * Define protection pointer address of user memory and access conditions for pages.
		 *
		 * Usage: `hf 15 slixprotectpage [-h] [-r <hex>] [-w <hex>] [-p <dec>] -l <dec> -i <dec>`
		 *
		 * @param {Object} options
		 * @param {number|string} options.loPageFlags - protection flags for lo page (0=None, 1=ReadPR, 2=WritePR)
		 * @param {number|string} options.hiPageFlags - protection flags for hi page (0=None, 1=ReadPR, 2=WritePR)
		 * @param {string} [options.readPassword] - read password, 4 hex bytes
		 * @param {string} [options.writePassword] - write password, 4 hex bytes
		 * @param {number|string} [options.protectionPointer] - protection pointer page (0-78), 0 = entire user memory
		 *
		 * @example
		 * await hf["15"].slixprotectpage({ writePassword: "deadbeef", protectionPointer: 3, loPageFlags: 0, hiPageFlags: 3 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ loPageFlags, hiPageFlags, readPassword, writePassword, protectionPointer } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (readPassword !== undefined && readPassword !== null) args.push("--readpw", String(readPassword));
			if (writePassword !== undefined && writePassword !== null) args.push("--writepw", String(writePassword));
			if (protectionPointer !== undefined && protectionPointer !== null) args.push("--ptr", String(protectionPointer));
			if (loPageFlags !== undefined && loPageFlags !== null) args.push("--lo", String(loPageFlags));
			if (hiPageFlags !== undefined && hiPageFlags !== null) args.push("--hi", String(hiPageFlags));
			return command(client.client, ["hf", "15", "slixprotectpage"])(args);
		},

		passprotectafi: /**
		 * Enable password protection of AFI on a SLIX ISO 15693 tag.
		 * WARNING: This action cannot be undone!
		 *
		 * Usage: `hf 15 passprotectafi [-h] -p <hex> [--force]`
		 *
		 * @param {Object} options
		 * @param {string} options.password - EAS/AFI password, 4 hex bytes
		 * @param {boolean} [options.force] - force execution (irreversible action)
		 *
		 * @example
		 * await hf["15"].passprotectafi({ password: "00000000", force: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password, force } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (force) args.push("--force");
			return command(client.client, ["hf", "15", "passprotectafi"])(args);
		},

		passprotecteas: /**
		 * Enable password protection of EAS on a SLIX ISO 15693 tag.
		 * WARNING: This action cannot be undone!
		 *
		 * Usage: `hf 15 passprotecteas [-h] -p <hex> [--force]`
		 *
		 * @param {Object} options
		 * @param {string} options.password - EAS/AFI password, 4 hex bytes
		 * @param {boolean} [options.force] - force execution (irreversible action)
		 *
		 * @example
		 * await hf["15"].passprotecteas({ password: "00000000", force: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password, force } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (force) args.push("--force");
			return command(client.client, ["hf", "15", "passprotecteas"])(args);
		},

		writeafi: /**
		 * Write AFI value on an ISO 15693 tag.
		 *
		 * Usage: `hf 15 writeafi [-h] [-u <hex>] --afi <dec> [-p <hex>]`
		 *
		 * @param {Object} options
		 * @param {number|string} options.afi - AFI number (0-255)
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {string} [options.password] - optional AFI/EAS password, 4 hex bytes
		 *
		 * @example
		 * await hf["15"].writeafi({ afi: 12 });
		 * await hf["15"].writeafi({ uid: "E011223344556677", afi: 12, password: "0F0F0F0F" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ afi, uid, password } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (afi !== undefined && afi !== null) args.push("--afi", String(afi));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["hf", "15", "writeafi"])(args);
		},

		writedsfid: /**
		 * Write DSFID value on an ISO 15693 tag.
		 *
		 * Usage: `hf 15 writedsfid [-h*2ov] [-u <hex>] [--ua] --dsfid <dec>`
		 *
		 * @param {Object} options
		 * @param {number|string} options.dsfid - DSFID number (0-255)
		 * @param {string} [options.uid] - full UID, 8 hex bytes
		 * @param {boolean} [options.unaddressed] - unaddressed mode
		 * @param {boolean} [options.scan] - scan for tag
		 * @param {boolean} [options.slowMode] - use slower '1 out of 256' mode
		 * @param {boolean} [options.optionFlag] - set OPTION flag (needed for TI)
		 * @param {boolean} [options.verbose] - verbose output
		 *
		 * @example
		 * await hf["15"].writedsfid({ scan: true, dsfid: 12 });
		 * await hf["15"].writedsfid({ uid: "E011223344556677", dsfid: 12 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ dsfid, uid, unaddressed, scan, slowMode, optionFlag, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (unaddressed) args.push("--ua");
			if (scan) args.push("-*");
			if (slowMode) args.push("-2");
			if (optionFlag) args.push("--opt");
			if (dsfid !== undefined && dsfid !== null) args.push("--dsfid", String(dsfid));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "15", "writedsfid"])(args);
		},

		csetuid: /**
		 * Set UID on a magic Chinese ISO 15693 card (only works with such cards).
		 *
		 * Usage: `hf 15 csetuid [-h2] -u <hex>`
		 *
		 * @param {Object} options
		 * @param {string} options.uid - UID, 8 hex bytes
		 * @param {boolean} [options.gen2] - use gen2 magic command
		 *
		 * @example
		 * // Gen1 command
		 * await hf["15"].csetuid({ uid: "E011223344556677" });
		 * // Gen2 command
		 * await hf["15"].csetuid({ uid: "E011223344556677", gen2: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid, gen2 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (gen2) args.push("--v2");
			return command(client.client, ["hf", "15", "csetuid"])(args);
		},
	},
});
