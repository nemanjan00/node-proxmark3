const command = require("../command");

module.exports = (clientPromise) => ({
	felica: {
		list: /**
		 * List trace buffer for FeliCa protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf felica list --frame         -> show frame delay times
		 * hf felica list -1              -> use trace buffer
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
			return command(client.client, ["hf", "felica", "list"])(args);
		},
		info: /**
		 * Reader for FeliCa based tags. Detects and prints tag information.
		 *
		 * @example
		 * hf felica info
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "felica", "info"])([]);
		},
		seacinfo: /**
		 * Get info about FeliCa SEAC cards
		 *
		 * @example
		 * hf felica seacinfo
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "felica", "seacinfo"])([]);
		},
		raw: /**
		 * Send raw hex data to a FeliCa tag
		 *
		 * @param {Object} options - Options object
		 * @param {boolean} [options.activateField] - Active signal field ON without select
		 * @param {boolean} [options.crc] - Calculate and append CRC
		 * @param {boolean} [options.keepField] - Keep signal field ON after receive
		 * @param {number|string} [options.numberOfBits] - Number of bits
		 * @param {boolean} [options.noResponse] - Do not read response
		 * @param {boolean} [options.select] - Active signal field ON with select
		 * @param {string} options.data - Raw hex bytes to send
		 *
		 * @example
		 * hf felica raw -cs 20
		 * hf felica raw -cs 2008
		 * @returns {Promise<string>} Command output
		 */
		async ({ activateField, crc, keepField, numberOfBits, noResponse, select, data }) => {
			const client = await clientPromise;
			const args = [];
			if (activateField) args.push("-a");
			if (crc) args.push("-c");
			if (keepField) args.push("-k");
			if (numberOfBits !== undefined && numberOfBits !== null) args.push("-n", String(numberOfBits));
			if (noResponse) args.push("-r");
			if (select) args.push("-s");
			args.push(String(data));
			return command(client.client, ["hf", "felica", "raw"])(args);
		},
		rdbl: /**
		 * Read block data from authentication-not-required FeliCa Service.
		 * Mode shall be Mode0. Successful response returns block data.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.allBlocks] - Get all block list elements 00 -> FF
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {boolean} [options.longBlockList] - Use 3 byte block list element block number
		 * @param {string} [options.serviceNumber] - Number of service (hex)
		 * @param {string} [options.serviceCodeList] - Service code list (hex)
		 * @param {string} [options.blockNumber] - Number of block (hex)
		 * @param {string} [options.blockListElement] - Block list element, 2 or 3 bytes (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf felica rdbl --sn 01 --scl 8B00 --bn 01 --ble 8000
		 * hf felica rdbl --sn 01 --scl 4B18 --bn 01 --ble 8000 -b
		 * @returns {Promise<string>} Command output
		 */
		async ({ allBlocks, idm, longBlockList, serviceNumber, serviceCodeList, blockNumber, blockListElement, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (allBlocks) args.push("-b");
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (longBlockList) args.push("--long");
			if (serviceNumber !== undefined && serviceNumber !== null) args.push("--sn", String(serviceNumber));
			if (serviceCodeList !== undefined && serviceCodeList !== null) args.push("--scl", String(serviceCodeList));
			if (blockNumber !== undefined && blockNumber !== null) args.push("--bn", String(blockNumber));
			if (blockListElement !== undefined && blockListElement !== null) args.push("--ble", String(blockListElement));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "felica", "rdbl"])(args);
		},
		reader: /**
		 * Act as a FeliCa reader. Look for FeliCa tags until Enter or the pm3 button is pressed.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.silent] - Silent (no messages)
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * hf felica reader -@            -> Continuous mode
		 * @returns {Promise<string>} Command output
		 */
		async ({ silent, continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (silent) args.push("--silent");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "felica", "reader"])(args);
		},
		sniff: /**
		 * Collect data from the field and save into command buffer.
		 * Buffer accessible from `hf felica list`.
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.samplesToSkip] - Samples to skip
		 * @param {number|string} [options.triggersToSkip] - Triggers to skip
		 *
		 * @example
		 * hf felica sniff
		 * hf felica sniff -s 10 -t 19
		 * @returns {Promise<string>} Command output
		 */
		async ({ samplesToSkip, triggersToSkip } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (samplesToSkip !== undefined && samplesToSkip !== null) args.push("--samples", String(samplesToSkip));
			if (triggersToSkip !== undefined && triggersToSkip !== null) args.push("--trig", String(triggersToSkip));
			return command(client.client, ["hf", "felica", "sniff"])(args);
		},
		wrbl: /**
		 * Write block data to authentication-not-required FeliCa Service.
		 * Mode shall be Mode0.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.data] - Data to write, 16 hex bytes
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {string} [options.serviceNumber] - Number of service (hex)
		 * @param {string} [options.serviceCodeList] - Service code list (hex)
		 * @param {string} [options.blockNumber] - Number of block (hex)
		 * @param {string} [options.blockListElement] - Block list element, 2 or 3 bytes (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf felica wrbl --sn 01 --scl CB10 --bn 01 --ble 8001 -d 0102030405060708090A0B0C0D0E0F10
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, idm, serviceNumber, serviceCodeList, blockNumber, blockListElement, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (serviceNumber !== undefined && serviceNumber !== null) args.push("--sn", String(serviceNumber));
			if (serviceCodeList !== undefined && serviceCodeList !== null) args.push("--scl", String(serviceCodeList));
			if (blockNumber !== undefined && blockNumber !== null) args.push("--bn", String(blockNumber));
			if (blockListElement !== undefined && blockListElement !== null) args.push("--ble", String(blockListElement));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "felica", "wrbl"])(args);
		},
		dump: /**
		 * Dump all existing Area Code and Service Code from a FeliCa tag.
		 * Only works on services that do not require authentication.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.noAuth] - Read public services
		 * @param {number|string} [options.retries] - Number of retries
		 * @param {string} [options.idm] - Use custom IDm (hex)
		 *
		 * @example
		 * hf felica dump
		 * hf felica dump --retry 5
		 * hf felica dump --idm 11100910C11BC407
		 * @returns {Promise<string>} Command output
		 */
		async ({ noAuth, retries, idm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (noAuth) args.push("--no-auth");
			if (retries !== undefined && retries !== null) args.push("--retry", String(retries));
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			return command(client.client, ["hf", "felica", "dump"])(args);
		},
		discnodes: /**
		 * Discover FeliCa nodes by dumping all Area Code and Service Code.
		 * Methods: auto | request_code_list | search_service_code | request_service | read_without_encryption
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.retries] - Number of retries
		 * @param {string} [options.method] - Node discovery method (auto|request_code_list|search_service_code|request_service|read_without_encryption)
		 * @param {string} [options.idm] - Use custom IDm (hex)
		 *
		 * @example
		 * hf felica discnodes
		 * hf felica discnodes --method request_service
		 * @returns {Promise<string>} Command output
		 */
		async ({ retries, method, idm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (retries !== undefined && retries !== null) args.push("--retry", String(retries));
			if (method !== undefined && method !== null) args.push("--method", String(method));
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			return command(client.client, ["hf", "felica", "discnodes"])(args);
		},
		rqservice: /**
		 * Verify the existence of Area and Service and acquire Key Version.
		 * When the specified Area or Service exists, the card returns Key Version.
		 * When it does not exist, the card returns FFFFh.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.all] - Auto node number mode, iterates through all nodes 1 < n < 32
		 * @param {string} [options.nodeNumber] - Number of Node (hex)
		 * @param {string} [options.nodeCodeList] - Node Code List, little endian (hex)
		 * @param {string} [options.idm] - Use custom IDm (hex)
		 *
		 * @example
		 * hf felica rqservice --node 01 --code FFFF
		 * hf felica rqservice -a --code FFFF
		 * @returns {Promise<string>} Command output
		 */
		async ({ all, nodeNumber, nodeCodeList, idm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (all) args.push("--all");
			if (nodeNumber !== undefined && nodeNumber !== null) args.push("--node", String(nodeNumber));
			if (nodeCodeList !== undefined && nodeCodeList !== null) args.push("--code", String(nodeCodeList));
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			return command(client.client, ["hf", "felica", "rqservice"])(args);
		},
		rqresponse: /**
		 * Verify the existence of a card and return its current Mode.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 *
		 * @example
		 * hf felica rqresponse --idm 11100910C11BC407
		 * @returns {Promise<string>} Command output
		 */
		async ({ idm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			return command(client.client, ["hf", "felica", "rqresponse"])(args);
		},
		scsvcode: /**
		 * Dump all existing Area Code and Service Code using Search Service Code.
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.retries] - Number of retries
		 * @param {string} [options.idm] - Use custom IDm (hex)
		 *
		 * @example
		 * hf felica scsvcode
		 * hf felica scsvcode --retry 5
		 * @returns {Promise<string>} Command output
		 */
		async ({ retries, idm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (retries !== undefined && retries !== null) args.push("--retry", String(retries));
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			return command(client.client, ["hf", "felica", "scsvcode"])(args);
		},
		rqsyscode: /**
		 * Acquire System Code registered to the card. If divided into multiple Systems,
		 * this command acquires the System Code of each System.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 *
		 * @example
		 * hf felica rqsyscode
		 * hf felica rqsyscode --idm 11100910C11BC407
		 * @returns {Promise<string>} Command output
		 */
		async ({ idm } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			return command(client.client, ["hf", "felica", "rqsyscode"])(args);
		},
		auth1: /**
		 * Initiate mutual authentication (Phase 1). Must be executed before Auth2.
		 * EXPERIMENTAL COMMAND.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.areaNumber] - Number of areas, 1 byte (hex)
		 * @param {string} [options.areaCodeList] - Area code list, 2 bytes (hex)
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {string} [options.serviceNumber] - Number of service, 1 byte (hex)
		 * @param {string} [options.serviceCodeList] - Service code list, 2 bytes (hex)
		 * @param {string} [options.key] - 3DES key, 16 bytes (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf felica auth1 --an 01 --acl 0000 --sn 01 --scl 8B00 --key AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB
		 * @returns {Promise<string>} Command output
		 */
		async ({ areaNumber, areaCodeList, idm, serviceNumber, serviceCodeList, key, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (areaNumber !== undefined && areaNumber !== null) args.push("--an", String(areaNumber));
			if (areaCodeList !== undefined && areaCodeList !== null) args.push("--acl", String(areaCodeList));
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (serviceNumber !== undefined && serviceNumber !== null) args.push("--sn", String(serviceNumber));
			if (serviceCodeList !== undefined && serviceCodeList !== null) args.push("--scl", String(serviceCodeList));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "felica", "auth1"])(args);
		},
		auth2: /**
		 * Complete mutual authentication (Phase 2). Must follow Auth1.
		 * EXPERIMENTAL COMMAND - M2c/P2c will not be checked.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {string} [options.cardChallenge] - M3c card challenge, 8 bytes (hex)
		 * @param {string} [options.key] - 3DES M3c decryption key, 16 bytes (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf felica auth2 --cc 0102030405060708 --key AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB
		 * @returns {Promise<string>} Command output
		 */
		async ({ idm, cardChallenge, key, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (cardChallenge !== undefined && cardChallenge !== null) args.push("--cc", String(cardChallenge));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "felica", "auth2"])(args);
		},
		rqspecver: /**
		 * Acquire the version of the card OS.
		 * Returns format version, basic version, and option version list in BCD notation.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {string} [options.reserve] - Set custom reserve (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf felica rqspecver
		 * hf felica rqspecver --idm 11100910C11BC407
		 * @returns {Promise<string>} Command output
		 */
		async ({ idm, reserve, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (reserve !== undefined && reserve !== null) args.push("-r", String(reserve));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "felica", "rqspecver"])(args);
		},
		resetmode: /**
		 * Reset Mode to Mode 0.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {string} [options.reserve] - Set custom reserve (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf felica resetmode
		 * hf felica resetmode --idm 11100910C11BC407
		 * @returns {Promise<string>} Command output
		 */
		async ({ idm, reserve, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (reserve !== undefined && reserve !== null) args.push("-r", String(reserve));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "felica", "resetmode"])(args);
		},
		litesim: /**
		 * Emulate an ISO/18092 FeliCa Lite tag
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.uid - UID/NDEF2 as 8 hex bytes
		 *
		 * @example
		 * hf felica litesim -u 1122334455667788
		 * @returns {Promise<string>} Command output
		 */
		async ({ uid }) => {
			const client = await clientPromise;
			const args = ["--uid", String(uid)];
			return command(client.client, ["hf", "felica", "litesim"])(args);
		},
		liteauth: /**
		 * Authenticate a FeliCa Lite tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.key] - Set card key, 16 bytes (hex)
		 * @param {string} [options.challenge] - Set random challenge, 16 bytes (hex)
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {boolean} [options.keepField] - Keep signal field ON after receive
		 *
		 * @example
		 * hf felica liteauth --key 46656c69436130313233343536616263
		 * hf felica liteauth -c 701185c59f8d30afeab8e4b3a61f5cc4 --key 46656c69436130313233343536616263
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, challenge, idm, keepField } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (challenge !== undefined && challenge !== null) args.push("-c", String(challenge));
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (keepField) args.push("-k");
			return command(client.client, ["hf", "felica", "liteauth"])(args);
		},
		litedump: /**
		 * Dump ISO/18092 FeliCa Lite tag. Timeout after 200 seconds.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.idm] - Set custom IDm (hex)
		 * @param {string} [options.key] - Set card key, 16 bytes (hex)
		 *
		 * @example
		 * hf felica litedump
		 * @returns {Promise<string>} Command output
		 */
		async ({ idm, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (idm !== undefined && idm !== null) args.push("--idm", String(idm));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			return command(client.client, ["hf", "felica", "litedump"])(args);
		},
	},

	iclass: {
		list: /**
		 * List trace buffer for iCLASS protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf iclass list --frame         -> show frame delay times
		 * hf iclass list -1              -> use trace buffer
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
			return command(client.client, ["hf", "iclass", "list"])(args);
		},
		dump: /**
		 * Dump all memory from an iCLASS tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Save filename
		 * @param {string} [options.key] - Debit key or NR/MAC for replay as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Debit key index to select key from memory
		 * @param {string} [options.creditKey] - Credit key as 8 hex bytes
		 * @param {number|string} [options.creditKeyIndex] - Credit key index to select key from memory
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - Key is interpreted as raw block 3/4
		 * @param {boolean} [options.nrMacReplay] - Replay of NR/MAC
		 * @param {boolean} [options.dense] - Dense dump output style
		 * @param {boolean} [options.force] - Force unsecure card read
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 * @param {boolean} [options.noSave] - No save to file
		 *
		 * @example
		 * hf iclass dump -k 001122334455667B
		 * hf iclass dump -k AAAAAAAAAAAAAAAA --credit 001122334455667B
		 * hf iclass dump --ki 0
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, key, keyIndex, creditKey, creditKeyIndex, elite, raw, nrMacReplay, dense, force, shallow, noSave } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			if (creditKey !== undefined && creditKey !== null) args.push("--credit", String(creditKey));
			if (creditKeyIndex !== undefined && creditKeyIndex !== null) args.push("--ci", String(creditKeyIndex));
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (nrMacReplay) args.push("--nr");
			if (dense) args.push("--dense");
			if (force) args.push("--force");
			if (shallow) args.push("--shallow");
			if (noSave) args.push("--ns");
			return command(client.client, ["hf", "iclass", "dump"])(args);
		},
		info: /**
		 * Act as an iCLASS reader. Reads and fingerprints an iCLASS tag.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 *
		 * @example
		 * hf iclass info
		 * @returns {Promise<string>} Command output
		 */
		async ({ shallow } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (shallow) args.push("--shallow");
			return command(client.client, ["hf", "iclass", "info"])(args);
		},
		rdbl: /**
		 * Read a block from an iCLASS tag
		 *
		 * @param {Object} options - Options object
		 * @param {string} [options.key] - Access key as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Key index to select key from memory
		 * @param {number|string} options.block - Block number
		 * @param {boolean} [options.credit] - Key is assumed to be the credit key
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {boolean} [options.nrMacReplay] - Replay of NR/MAC
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 * @param {boolean} [options.continuous] - Continuous mode
		 *
		 * @example
		 * hf iclass rdbl --blk 6 -k 0011223344556677
		 * hf iclass rdbl --blk 27 -k 0011223344556677 --credit
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, keyIndex, block, credit, elite, raw, nrMacReplay, verbose, shallow, continuous }) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			args.push("--blk", String(block));
			if (credit) args.push("--credit");
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (nrMacReplay) args.push("--nr");
			if (verbose) args.push("--verbose");
			if (shallow) args.push("--shallow");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "iclass", "rdbl"])(args);
		},
		reader: /**
		 * Act as an iCLASS reader. Look for iCLASS tags until Enter or the pm3 button is pressed.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 *
		 * @example
		 * hf iclass reader -@            -> continuous reader mode
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous, shallow } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			if (shallow) args.push("--shallow");
			return command(client.client, ["hf", "iclass", "reader"])(args);
		},
		restore: /**
		 * Restore data from dumpfile (bin/eml/json) onto an iCLASS tag
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.file - Specify a filename to restore
		 * @param {string} [options.key] - Access key as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Key index to select key from memory
		 * @param {number|string} options.firstBlock - The first block number to restore
		 * @param {number|string} options.lastBlock - The last block number to restore
		 * @param {boolean} [options.credit] - Key is assumed to be the credit key
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 * @param {boolean} [options.nrMacReplay] - Replay of NR/MAC with privilege escalation
		 *
		 * @example
		 * hf iclass restore -f hf-iclass-AA162D30F8FF12F1-dump.bin --first 6 --last 18 --ki 0
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, key, keyIndex, firstBlock, lastBlock, credit, elite, raw, verbose, shallow, nrMacReplay }) => {
			const client = await clientPromise;
			const args = ["--file", String(file)];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			args.push("--first", String(firstBlock));
			args.push("--last", String(lastBlock));
			if (credit) args.push("--credit");
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (verbose) args.push("--verbose");
			if (shallow) args.push("--shallow");
			if (nrMacReplay) args.push("--nr");
			return command(client.client, ["hf", "iclass", "restore"])(args);
		},
		sniff: /**
		 * Sniff the communication between reader and iCLASS tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.jam] - Jam (prevent) e-purse updates
		 *
		 * @example
		 * hf iclass sniff
		 * hf iclass sniff -j             -> jam e-purse updates
		 * @returns {Promise<string>} Command output
		 */
		async ({ jam } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (jam) args.push("--jam");
			return command(client.client, ["hf", "iclass", "sniff"])(args);
		},
		view: /**
		 * Print an iCLASS tag dump file (bin/eml/json)
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.file - Specify a filename for dump file
		 * @param {number|string} [options.firstBlock] - Begin printing from this block
		 * @param {number|string} [options.lastBlock] - End printing at this block (0 = ALL)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.dense] - Dense dump output style
		 *
		 * @example
		 * hf iclass view -f hf-iclass-AA162D30F8FF12F1-dump.bin
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, firstBlock, lastBlock, verbose, dense }) => {
			const client = await clientPromise;
			const args = ["--file", String(file)];
			if (firstBlock !== undefined && firstBlock !== null) args.push("--first", String(firstBlock));
			if (lastBlock !== undefined && lastBlock !== null) args.push("--last", String(lastBlock));
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "iclass", "view"])(args);
		},
		wrbl: /**
		 * Write data to an iCLASS tag block
		 *
		 * @param {Object} options - Options object
		 * @param {string} [options.key] - Access key as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Key index to select key from memory
		 * @param {number|string} options.block - Block number
		 * @param {string} options.data - Data to write as 8 hex bytes
		 * @param {string} [options.mac] - Replay mac data (4 hex bytes)
		 * @param {boolean} [options.credit] - Key is assumed to be the credit key
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {boolean} [options.nrMacReplay] - Replay of NR/MAC or use privilege escalation if mac is empty
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 * @param {boolean} [options.continuous] - Continuous mode
		 *
		 * @example
		 * hf iclass wrbl --blk 10 -d AAAAAAAAAAAAAAAA -k 001122334455667B
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, keyIndex, block, data, mac, credit, elite, raw, nrMacReplay, verbose, shallow, continuous }) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			args.push("--blk", String(block));
			args.push("--data", String(data));
			if (mac !== undefined && mac !== null) args.push("--mac", String(mac));
			if (credit) args.push("--credit");
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (nrMacReplay) args.push("--nr");
			if (verbose) args.push("--verbose");
			if (shallow) args.push("--shallow");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "iclass", "wrbl"])(args);
		},
		creditepurse: /**
		 * Credit the epurse on an iCLASS tag. The provided key must be the credit key.
		 * The first two bytes of the epurse are the debit value (big endian).
		 * The remaining two bytes are the credit value and must be smaller than the previous value.
		 *
		 * @param {Object} options - Options object
		 * @param {string} [options.key] - Credit key as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Key index to select key from memory
		 * @param {string} options.data - Data to write as 4 hex bytes
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 *
		 * @example
		 * hf iclass creditepurse --ki 0 -d FEFFFEFF
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, keyIndex, data, elite, raw, verbose, shallow }) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			args.push("--data", String(data));
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (verbose) args.push("--verbose");
			if (shallow) args.push("--shallow");
			return command(client.client, ["hf", "iclass", "creditepurse"])(args);
		},
		tear: /**
		 * Tear off an iCLASS tag block. Typically used for e-purse attacks.
		 * Make sure you know the target card credit key.
		 * WARNING: may brick the card.
		 *
		 * @param {Object} options - Options object
		 * @param {string} [options.key] - Access key as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Key index to select key from memory
		 * @param {number|string} options.block - Block number
		 * @param {string} [options.data] - Data to write as 8 hex bytes
		 * @param {string} [options.mac] - Replay mac data (4 hex bytes)
		 * @param {boolean} [options.credit] - Key is assumed to be the credit key
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {boolean} [options.nrMacReplay] - Replay of NR/MAC
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 * @param {number|string} options.delayStart - Tearoff delay start in microseconds (1-43000)
		 * @param {number|string} [options.delayIncrement] - Tearoff delay increment in microseconds (default 10)
		 * @param {number|string} [options.delayEnd] - Tearoff delay end in microseconds
		 * @param {number|string} [options.loopCount] - Number of times to loop per tearoff time
		 * @param {number|string} [options.sleepBetween] - Sleep between each tear in ms
		 * @param {boolean} [options.arm] - Runs the commands on device side and tries to stabilize tears
		 *
		 * @example
		 * hf iclass tear --blk 10 -d AAAAAAAAAAAAAAAA -k 001122334455667B -s 300 -e 600
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, keyIndex, block, data, mac, credit, elite, raw, nrMacReplay, verbose, shallow, delayStart, delayIncrement, delayEnd, loopCount, sleepBetween, arm }) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			args.push("--blk", String(block));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (mac !== undefined && mac !== null) args.push("--mac", String(mac));
			if (credit) args.push("--credit");
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (nrMacReplay) args.push("--nr");
			if (verbose) args.push("--verbose");
			if (shallow) args.push("--shallow");
			args.push("-s", String(delayStart));
			if (delayIncrement !== undefined && delayIncrement !== null) args.push("-i", String(delayIncrement));
			if (delayEnd !== undefined && delayEnd !== null) args.push("-e", String(delayEnd));
			if (loopCount !== undefined && loopCount !== null) args.push("--loop", String(loopCount));
			if (sleepBetween !== undefined && sleepBetween !== null) args.push("--sleep", String(sleepBetween));
			if (arm) args.push("--arm");
			return command(client.client, ["hf", "iclass", "tear"])(args);
		},
		chk: /**
		 * Check iCLASS keys from a dictionary file against a tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Dictionary file with default iclass keys
		 * @param {boolean} [options.credit] - Key is assumed to be the credit key
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key (raw)
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 * @param {boolean} [options.vb6kdf] - Use the VB6 elite KDF instead of a file
		 *
		 * @example
		 * hf iclass chk -f iclass_default_keys.dic
		 * hf iclass chk -f iclass_elite_keys.dic --elite
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, credit, elite, raw, shallow, vb6kdf } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (credit) args.push("--credit");
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (shallow) args.push("--shallow");
			if (vb6kdf) args.push("--vb6kdf");
			return command(client.client, ["hf", "iclass", "chk"])(args);
		},
		loclass: /**
		 * Execute the offline part of loclass attack.
		 * An iclass dumpfile is assumed to consist of malicious CSNs and their protocol responses.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Filename with nr/mac data from `hf iclass sim -t 2`
		 * @param {boolean} [options.test] - Perform self test
		 * @param {boolean} [options.long] - Perform self test, including long ones
		 *
		 * @example
		 * hf iclass loclass -f iclass_dump.bin
		 * hf iclass loclass --test
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, test, long } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (test) args.push("--test");
			if (long) args.push("--long");
			return command(client.client, ["hf", "iclass", "loclass"])(args);
		},
		lookup: /**
		 * Recover an iCLASS Standard or Elite key from sniffed trace data
		 *
		 * @param {Object} options - Options object
		 * @param {string} [options.file] - Dictionary file with default iclass keys
		 * @param {string} options.csn - Specify CSN as 8 hex bytes
		 * @param {string} options.epurse - Specify ePurse as 8 hex bytes
		 * @param {string} options.macs - MACs (hex)
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {boolean} [options.vb6rng] - Use the VB6 rng for elite keys instead of a dictionary file
		 *
		 * @example
		 * hf iclass lookup --csn 9655a400f8ff12e0 --epurse f0ffffffffffffff --macs 0000000089cb984b -f iclass_default_keys.dic
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, csn, epurse, macs, elite, raw, vb6rng }) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			args.push("--csn", String(csn));
			args.push("--epurse", String(epurse));
			args.push("--macs", String(macs));
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (vb6rng) args.push("--vb6rng");
			return command(client.client, ["hf", "iclass", "lookup"])(args);
		},
		legrec: /**
		 * Attempt to recover the diversified key of a specific iCLASS card.
		 * This may take several days. The card must remain on the PM3 antenna.
		 * WARNING: This process may brick the card.
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.macs - AA1 Authentication MACs (hex)
		 * @param {number|string} [options.startIndex] - Where to start from to retrieve the key (default 0)
		 * @param {number|string} [options.loopCount] - Number of key retrieval cycles, max 10000 (default 100)
		 * @param {boolean} [options.debug] - Re-enables tracing for debugging, limits cycles to 1
		 * @param {boolean} [options.performWrites] - Perform real writes on the card (notest)
		 * @param {boolean} [options.allNight] - Loops the loop for 10 times
		 * @param {boolean} [options.fast] - Increases speed (higher risk to brick)
		 * @param {boolean} [options.speedLow] - Lower card comms delay times for further speed increase
		 * @param {boolean} [options.estimate] - Estimate key updates based on CSN assuming standard key
		 * @param {boolean} [options.credit] - EXPERIMENTAL: Recover the credit key using KD 0
		 *
		 * @example
		 * hf iclass legrec --macs 0000000089cb984b
		 * hf iclass legrec --macs 0000000089cb984b --index 0 --loop 100 --notest
		 * @returns {Promise<string>} Command output
		 */
		async ({ macs, startIndex, loopCount, debug, performWrites, allNight, fast, speedLow, estimate, credit }) => {
			const client = await clientPromise;
			const args = ["--macs", String(macs)];
			if (startIndex !== undefined && startIndex !== null) args.push("--index", String(startIndex));
			if (loopCount !== undefined && loopCount !== null) args.push("--loop", String(loopCount));
			if (debug) args.push("--debug");
			if (performWrites) args.push("--notest");
			if (allNight) args.push("--allnight");
			if (fast) args.push("--fast");
			if (speedLow) args.push("--sl");
			if (estimate) args.push("--est");
			if (credit) args.push("--credit");
			return command(client.client, ["hf", "iclass", "legrec"])(args);
		},
		legbrute: /**
		 * Brute force the remaining 40 bits of a partial raw iCLASS key from sniffed trace data
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.epurse - Specify ePurse as 8 hex bytes
		 * @param {string} options.macs1 - MACs captured from the reader (hex)
		 * @param {string} options.macs2 - Second set of MACs captured (different, same CSN/ePurse)
		 * @param {string} options.partialKey - Partial Key from legrec or starting key of keyblock
		 * @param {number|string} [options.startIndex] - Where to start, in millions (default 0)
		 * @param {number|string} [options.threads] - Number of threads (max 16)
		 *
		 * @example
		 * hf iclass legbrute --epurse feffffffffffffff --macs1 1306cad9b6c24466 --macs2 f0bf905e35f97923 --pk B4F12AADC5301225
		 * @returns {Promise<string>} Command output
		 */
		async ({ epurse, macs1, macs2, partialKey, startIndex, threads }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--epurse", String(epurse));
			args.push("--macs1", String(macs1));
			args.push("--macs2", String(macs2));
			args.push("--pk", String(partialKey));
			if (startIndex !== undefined && startIndex !== null) args.push("--index", String(startIndex));
			if (threads !== undefined && threads !== null) args.push("--threads", String(threads));
			return command(client.client, ["hf", "iclass", "legbrute"])(args);
		},
		unhash: /**
		 * Reverse the hash0 function used to generate iCLASS diversified keys after DES encryption.
		 * Returns the DES crypted CSN for bruteforcing.
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.diversifiedKey - Card diversified key (hex)
		 *
		 * @example
		 * hf iclass unhash -k B4F12AADC5301A2D
		 * @returns {Promise<string>} Command output
		 */
		async ({ diversifiedKey }) => {
			const client = await clientPromise;
			const args = ["--divkey", String(diversifiedKey)];
			return command(client.client, ["hf", "iclass", "unhash"])(args);
		},
		blacktears: /**
		 * Tear off the iCLASS (new-silicon only) configuration block to set non-secure page mode.
		 * Make sure you know the target card credit key.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.key] - Access key as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Key index to select key from memory
		 * @param {boolean} [options.credit] - Key is assumed to be the credit key
		 * @param {number|string} [options.delayStart] - Tearoff delay start in microseconds (1-43000)
		 * @param {number|string} [options.delayIncrement] - Tearoff delay increment in microseconds (default 10)
		 * @param {number|string} [options.delayEnd] - Tearoff delay end in microseconds
		 * @param {string} [options.otpValue] - Custom OTP value as 2 hex bytes
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 *
		 * @example
		 * hf iclass blacktears -k 001122334455667B
		 * hf iclass blacktears --credit --ki 1
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, keyIndex, credit, delayStart, delayIncrement, delayEnd, otpValue, raw, verbose, shallow } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			if (credit) args.push("--credit");
			if (delayStart !== undefined && delayStart !== null) args.push("-s", String(delayStart));
			if (delayIncrement !== undefined && delayIncrement !== null) args.push("-i", String(delayIncrement));
			if (delayEnd !== undefined && delayEnd !== null) args.push("-e", String(delayEnd));
			if (otpValue !== undefined && otpValue !== null) args.push("--otp", String(otpValue));
			if (raw) args.push("--raw");
			if (verbose) args.push("--verbose");
			if (shallow) args.push("--shallow");
			return command(client.client, ["hf", "iclass", "blacktears"])(args);
		},
		sim: /**
		 * Simulate an iCLASS legacy/standard tag
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.simType - Simulation type (0-4, 6, 7)
		 * @param {string} [options.csn] - Specify CSN as 8 hex bytes (for sim type 0)
		 *
		 * @example
		 * hf iclass sim -t 0 --csn 031FEC8AF7FF12E0         -> simulate with specified CSN
		 * hf iclass sim -t 1                                -> simulate with default CSN
		 * hf iclass sim -t 2                                -> execute loclass attack online part
		 * @returns {Promise<string>} Command output
		 */
		async ({ simType, csn }) => {
			const client = await clientPromise;
			const args = ["--type", String(simType)];
			if (csn !== undefined && csn !== null) args.push("--csn", String(csn));
			return command(client.client, ["hf", "iclass", "sim"])(args);
		},
		eload: /**
		 * Load emulator memory with data from (bin/json) iCLASS dump file
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.file - Specify a filename for dump file
		 * @param {boolean} [options.useSpiffs] - Use RDV4 spiffs
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf iclass eload -f hf-iclass-AA162D30F8FF12F1-dump.json
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, useSpiffs, verbose }) => {
			const client = await clientPromise;
			const args = ["--file", String(file)];
			if (useSpiffs) args.push("--mem");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "iclass", "eload"])(args);
		},
		esave: /**
		 * Save emulator memory to file (bin/json).
		 * If filename is not supplied, CSN will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Specify a filename for dump file
		 * @param {number|string} [options.size] - Number of bytes to save: 256 or 2048 (default 256)
		 *
		 * @example
		 * hf iclass esave
		 * hf iclass esave -f hf-iclass-dump -s 2048
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, size } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (size !== undefined && size !== null) args.push("--size", String(size));
			return command(client.client, ["hf", "iclass", "esave"])(args);
		},
		esetblk: /**
		 * Set an individual block in emulator memory
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.block - Block number
		 * @param {string} [options.data] - Bytes to write, 8 hex bytes
		 *
		 * @example
		 * hf iclass esetblk --blk 7 -d 0000000000000000
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, data }) => {
			const client = await clientPromise;
			const args = ["--blk", String(block)];
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "iclass", "esetblk"])(args);
		},
		eview: /**
		 * Display emulator memory. Defaults to 256 bytes, also supports 2048.
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.size] - Number of bytes to display: 256 or 2048 (default 256)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.dense] - Dense dump output style
		 *
		 * @example
		 * hf iclass eview
		 * hf iclass eview -s 2048
		 * @returns {Promise<string>} Command output
		 */
		async ({ size, verbose, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (size !== undefined && size !== null) args.push("--size", String(size));
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "iclass", "eview"])(args);
		},
		configcard: /**
		 * Manage reader configuration card via Cardhelper or internal database.
		 * The generated config card will be uploaded to device emulator memory.
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.configOption] - Use config option number
		 * @param {number|string} [options.keyIndex] - Card Key index to select key from memory
		 * @param {number|string} [options.eliteKeyIndex] - Elite Key index to select key from memory
		 * @param {number|string} [options.masterKeyIndex] - Standard Master Key index to select key from memory
		 * @param {boolean} [options.elite] - Use elite key for the Card Key
		 * @param {boolean} [options.printCards] - Print available cards
		 *
		 * @example
		 * hf iclass configcard -p                 -> print all config cards in the database
		 * hf iclass configcard --g 0              -> generate config file with option 0
		 * @returns {Promise<string>} Command output
		 */
		async ({ configOption, keyIndex, eliteKeyIndex, masterKeyIndex, elite, printCards } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (configOption !== undefined && configOption !== null) args.push("--g", String(configOption));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			if (eliteKeyIndex !== undefined && eliteKeyIndex !== null) args.push("--eki", String(eliteKeyIndex));
			if (masterKeyIndex !== undefined && masterKeyIndex !== null) args.push("--mrki", String(masterKeyIndex));
			if (elite) args.push("--elite");
			if (printCards) args.push("-p");
			return command(client.client, ["hf", "iclass", "configcard"])(args);
		},
		calcnewkey: /**
		 * Calculate new keys for updating iCLASS blocks 3 and 4
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.oldKey] - Old key as 8 hex bytes
		 * @param {number|string} [options.oldKeyIndex] - Old key index to select from memory
		 * @param {string} [options.newKey] - New key as 8 hex bytes
		 * @param {number|string} [options.newKeyIndex] - New key index to select from memory
		 * @param {string} [options.csn] - Card Serial Number for diversification (8 hex bytes)
		 * @param {boolean} [options.elite] - Elite computations applied to new key
		 * @param {boolean} [options.eliteBoth] - Elite computations applied to both old and new key
		 * @param {boolean} [options.oldElite] - Elite computations applied only to old key
		 *
		 * @example
		 * hf iclass calcnewkey --old 1122334455667788 --new 2233445566778899 --csn deadbeafdeadbeaf --elite2
		 * @returns {Promise<string>} Command output
		 */
		async ({ oldKey, oldKeyIndex, newKey, newKeyIndex, csn, elite, eliteBoth, oldElite } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (oldKey !== undefined && oldKey !== null) args.push("--old", String(oldKey));
			if (oldKeyIndex !== undefined && oldKeyIndex !== null) args.push("--oki", String(oldKeyIndex));
			if (newKey !== undefined && newKey !== null) args.push("--new", String(newKey));
			if (newKeyIndex !== undefined && newKeyIndex !== null) args.push("--nki", String(newKeyIndex));
			if (csn !== undefined && csn !== null) args.push("--csn", String(csn));
			if (elite) args.push("--elite");
			if (eliteBoth) args.push("--elite2");
			if (oldElite) args.push("--oldelite");
			return command(client.client, ["hf", "iclass", "calcnewkey"])(args);
		},
		encode: /**
		 * Encode binary wiegand to iCLASS blocks 7, 8, 9.
		 * Use either binary string or wiegand format with facility/card number.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.binaryString] - Binary string (e.g. 0001001001)
		 * @param {number|string} [options.keyIndex] - Key index to select key from memory
		 * @param {boolean} [options.credit] - Key is assumed to be the credit key
		 * @param {boolean} [options.elite] - Elite computations applied to key
		 * @param {boolean} [options.raw] - No computations applied to key
		 * @param {string} [options.encryptionKey] - 3DES transport key, 16 hex bytes
		 * @param {number|string} [options.facilityCode] - Facility code
		 * @param {number|string} [options.cardNumber] - Card number
		 * @param {number|string} [options.issueLevel] - Issue level
		 * @param {string} [options.wiegandFormat] - Wiegand format (see `wiegand list`)
		 * @param {boolean} [options.emulator] - Write to emulation memory instead of card
		 * @param {boolean} [options.shallow] - Use shallow (ASK) reader modulation instead of OOK
		 * @param {boolean} [options.verbose] - Verbose (print encoded blocks)
		 *
		 * @example
		 * hf iclass encode --bin 10001111100000001010100011 --ki 0
		 * hf iclass encode -w H10301 --fc 31 --cn 337 --ki 0
		 * @returns {Promise<string>} Command output
		 */
		async ({ binaryString, keyIndex, credit, elite, raw, encryptionKey, facilityCode, cardNumber, issueLevel, wiegandFormat, emulator, shallow, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (binaryString !== undefined && binaryString !== null) args.push("--bin", String(binaryString));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			if (credit) args.push("--credit");
			if (elite) args.push("--elite");
			if (raw) args.push("--raw");
			if (encryptionKey !== undefined && encryptionKey !== null) args.push("--enckey", String(encryptionKey));
			if (facilityCode !== undefined && facilityCode !== null) args.push("--fc", String(facilityCode));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (issueLevel !== undefined && issueLevel !== null) args.push("--issue", String(issueLevel));
			if (wiegandFormat !== undefined && wiegandFormat !== null) args.push("--wiegand", String(wiegandFormat));
			if (emulator) args.push("--emu");
			if (shallow) args.push("--shallow");
			if (verbose) args.push("-v");
			return command(client.client, ["hf", "iclass", "encode"])(args);
		},
		encrypt: /**
		 * 3DES encrypt data. Requires 'iclass_decryptionkey.bin' in resources directory.
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - Data to encrypt (hex)
		 * @param {string} [options.key] - 3DES transport key (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf iclass encrypt -d 0102030405060708
		 * hf iclass encrypt -d 0102030405060708 -k 00112233445566778899AABBCCDDEEFF
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, key, verbose }) => {
			const client = await clientPromise;
			const args = ["--data", String(data)];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "iclass", "encrypt"])(args);
		},
		decrypt: /**
		 * 3DES decrypt data. Tries to decrypt every block after block 6.
		 * Requires 'iclass_decryptionkey.bin' in resources directory or a cardhelper in sim module.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Specify a filename for dump file
		 * @param {string} [options.data] - 3DES encrypted data (hex)
		 * @param {string} [options.key] - 3DES transport key (hex)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.decodeBlock6] - Decode as block 6
		 * @param {boolean} [options.dense] - Dense dump output style
		 * @param {boolean} [options.noSave] - No save to file
		 *
		 * @example
		 * hf iclass decrypt -f hf-iclass-AA162D30F8FF12F1-dump.bin
		 * hf iclass decrypt -d 1122334455667788 -k 000102030405060708090a0b0c0d0e0f
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, data, key, verbose, decodeBlock6, dense, noSave } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (verbose) args.push("--verbose");
			if (decodeBlock6) args.push("--d6");
			if (dense) args.push("--dense");
			if (noSave) args.push("--ns");
			return command(client.client, ["hf", "iclass", "decrypt"])(args);
		},
		managekeys: /**
		 * Manage iCLASS keys in client memory
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Specify a filename for load/save operations
		 * @param {string} [options.key] - Access key as 8 hex bytes
		 * @param {number|string} [options.keyIndex] - Specify key index to set key in memory
		 * @param {boolean} [options.save] - Save keys in memory to file
		 * @param {boolean} [options.load] - Load keys to memory from file
		 * @param {boolean} [options.print] - Print keys loaded into memory
		 *
		 * @example
		 * hf iclass managekeys --ki 0 -k 1122334455667788       -> set key at index 0
		 * hf iclass managekeys -f mykeys.bin --save             -> save key file
		 * hf iclass managekeys -p                               -> print keys
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, key, keyIndex, save, load, print } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			if (save) args.push("--save");
			if (load) args.push("--load");
			if (print) args.push("--print");
			return command(client.client, ["hf", "iclass", "managekeys"])(args);
		},
		permutekey: /**
		 * Permute function from 'heart of darkness' paper
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.key - Input key, 8 hex bytes
		 * @param {boolean} [options.reverse] - Reverse permuted key
		 *
		 * @example
		 * hf iclass permutekey --key ff55330f0055330f
		 * hf iclass permutekey --reverse --key 0123456789abcdef
		 * @returns {Promise<string>} Command output
		 */
		async ({ key, reverse }) => {
			const client = await clientPromise;
			const args = ["--key", String(key)];
			if (reverse) args.push("--reverse");
			return command(client.client, ["hf", "iclass", "permutekey"])(args);
		},
		sam: /**
		 * Extract PACS via a HID SAM
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.keepField] - Keep the field active after command executed
		 * @param {boolean} [options.noDetect] - Skip selecting the card and sending card details to SAM
		 * @param {boolean} [options.decodeTlv] - Decode TLV
		 * @param {boolean} [options.breakOnNrMac] - Stop tag interaction on nr-mac
		 * @param {boolean} [options.fakeEpurse] - Fake epurse update
		 * @param {boolean} [options.shallow] - Shallow mod
		 * @param {string} [options.data] - DER encoded command to send to SAM (hex)
		 * @param {boolean} [options.snmpFormat] - Data is in SNMP format without headers
		 * @param {boolean} [options.samInfo] - Get SAM infos (version, serial number)
		 *
		 * @example
		 * hf iclass sam
		 * hf iclass sam -p -d a005a103800104       -> get PACS data, prevent epurse update
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, keepField, noDetect, decodeTlv, breakOnNrMac, fakeEpurse, shallow, data, snmpFormat, samInfo } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (keepField) args.push("--keep");
			if (noDetect) args.push("--nodetect");
			if (decodeTlv) args.push("--tlv");
			if (breakOnNrMac) args.push("--break");
			if (fakeEpurse) args.push("--prevent");
			if (shallow) args.push("--shallow");
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (snmpFormat) args.push("--snmp");
			if (samInfo) args.push("--info");
			return command(client.client, ["hf", "iclass", "sam"])(args);
		},
	},

	cipurse: {
		info: /**
		 * Get info from CIPURSE tags
		 *
		 * @example
		 * hf cipurse info
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "cipurse", "info"])([]);
		},
		select: /**
		 * Select a CIPURSE application or file
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {boolean} [options.decodeTlv] - TLV decode returned data
		 * @param {string} [options.aid] - Application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - Top level file (or application) ID (FID) 2 bytes (hex)
		 * @param {boolean} [options.masterFile] - Select masterfile by empty id
		 * @param {string} [options.childFileId] - Child file ID (EF under application/master file) 2 bytes (hex)
		 *
		 * @example
		 * hf cipurse select --aid A0000005070100       -> Select PTSE application by AID
		 * hf cipurse select --fid 3f00                 -> Select master file by FID
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, decodeTlv, aid, fileId, masterFile, childFileId } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (decodeTlv) args.push("--tlv");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (masterFile) args.push("--mfd");
			if (childFileId !== undefined && childFileId !== null) args.push("--chfid", String(childFileId));
			return command(client.client, ["hf", "cipurse", "select"])(args);
		},
		auth: /**
		 * Authenticate with CIPURSE key ID and key.
		 * If no key is supplied, default key of 737373...7373 will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {string} [options.aid] - Application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - Top file/application ID (FID) 2 bytes (hex)
		 * @param {boolean} [options.masterFile] - Select masterfile by empty id
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 *
		 * @example
		 * hf cipurse auth                -> Authenticate with keyID 1, default key
		 * hf cipurse auth -n 2 -k 65656565656565656565656565656565
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, aid, fileId, masterFile, keyId, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (masterFile) args.push("--mfd");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			return command(client.client, ["hf", "cipurse", "auth"])(args);
		},
		read: /**
		 * Read file in the CIPURSE application by file ID with key ID and key.
		 * If no key is supplied, default key of 737373...7373 will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {string} [options.aid] - Application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - File ID (hex)
		 * @param {number|string} [options.offset] - Offset for reading data from file
		 * @param {boolean} [options.noAuth] - Read file without authentication
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 *
		 * @example
		 * hf cipurse read --fid 2ff7     -> Authenticate with keyID 1, read file
		 * hf cipurse read --aid 4144204631 --fid 0102
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, aid, fileId, offset, noAuth, requestSecurity, responseSecurity } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
			if (noAuth) args.push("--noauth");
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			return command(client.client, ["hf", "cipurse", "read"])(args);
		},
		write: /**
		 * Write file in the CIPURSE application by file ID with key ID and key.
		 * If no key is supplied, default key of 737373...7373 will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {string} [options.aid] - Application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - File ID (hex)
		 * @param {number|string} [options.offset] - Offset for writing data to file
		 * @param {boolean} [options.noAuth] - Write without authentication
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 * @param {string} [options.data] - Data to write (hex)
		 * @param {boolean} [options.commit] - Commit after write
		 *
		 * @example
		 * hf cipurse write --fid 2ff7 -d aabb
		 * hf cipurse write --fid 0102 -d aabb --commit
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, aid, fileId, offset, noAuth, requestSecurity, responseSecurity, data, commit } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
			if (noAuth) args.push("--noauth");
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (commit) args.push("--commit");
			return command(client.client, ["hf", "cipurse", "write"])(args);
		},
		aread: /**
		 * Read file attributes by file ID with key ID and key.
		 * If no key is supplied, default key of 737373...7373 will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {boolean} [options.masterFile] - Show info about master file
		 * @param {string} [options.aid] - Select application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - File ID (hex)
		 * @param {string} [options.childFileId] - Child file ID (EF under application/master file) 2 bytes (hex)
		 * @param {boolean} [options.noAuth] - Read file attributes without authentication
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 *
		 * @example
		 * hf cipurse aread --fid 2ff7
		 * hf cipurse aread --mfd
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, masterFile, aid, fileId, childFileId, noAuth, requestSecurity, responseSecurity } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (masterFile) args.push("--mfd");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (childFileId !== undefined && childFileId !== null) args.push("--chfid", String(childFileId));
			if (noAuth) args.push("--noauth");
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			return command(client.client, ["hf", "cipurse", "aread"])(args);
		},
		awrite: /**
		 * Write file attributes by file ID with key ID and key.
		 * If no key is supplied, default key of 737373...7373 will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {boolean} [options.masterFile] - Show info about master file
		 * @param {string} [options.aid] - Select application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - File ID (hex)
		 * @param {string} [options.childFileId] - Child file ID (EF under application/master file) 2 bytes (hex)
		 * @param {boolean} [options.noAuth] - Write attributes without authentication
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 * @param {string} [options.data] - File attributes (hex)
		 * @param {boolean} [options.commit] - Commit after write
		 *
		 * @example
		 * hf cipurse awrite --fid 2ff7 -d 080000C1C1C1C1C1C1C1C1C1
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, masterFile, aid, fileId, childFileId, noAuth, requestSecurity, responseSecurity, data, commit } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (masterFile) args.push("--mfd");
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (childFileId !== undefined && childFileId !== null) args.push("--chfid", String(childFileId));
			if (noAuth) args.push("--noauth");
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (commit) args.push("--commit");
			return command(client.client, ["hf", "cipurse", "awrite"])(args);
		},
		formatall: /**
		 * Format CIPURSE card. Erases ALL data at the card level.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 * @param {boolean} [options.noAuth] - Execute without authentication
		 *
		 * @example
		 * hf cipurse formatall           -> Format card with default key
		 * hf cipurse formatall --no-auth -> Format card without authentication (perso state)
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, requestSecurity, responseSecurity, noAuth } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			if (noAuth) args.push("--no-auth");
			return command(client.client, ["hf", "cipurse", "formatall"])(args);
		},
		create: /**
		 * Create CIPURSE application/file/key by providing appropriate DGI.
		 * If no key is supplied, default key of 737373...7373 will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {string} [options.aid] - Application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - File ID (FID) 2 bytes (hex)
		 * @param {boolean} [options.masterFile] - Select masterfile by empty id
		 * @param {string} [options.data] - Data with DGI for create (hex)
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 * @param {boolean} [options.noAuth] - Execute without authentication
		 * @param {boolean} [options.commit] - Commit after create
		 *
		 * @example
		 * hf cipurse create -d 9200123F00200008000062098407A0000005070100
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, aid, fileId, masterFile, data, requestSecurity, responseSecurity, noAuth, commit } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (masterFile) args.push("--mfd");
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			if (noAuth) args.push("--no-auth");
			if (commit) args.push("--commit");
			return command(client.client, ["hf", "cipurse", "create"])(args);
		},
		delete: /**
		 * Delete CIPURSE file by file ID with key ID and key.
		 * If no key is supplied, default key of 737373...7373 will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose mode
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {string} [options.fileId] - File/application ID under MF for delete (hex)
		 * @param {string} [options.aid] - Application ID (AID) for delete, 1..16 bytes (hex)
		 * @param {string} [options.childFileId] - Child file ID (EF under application/master file) 2 bytes (hex)
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 * @param {boolean} [options.noAuth] - Execute without authentication
		 * @param {boolean} [options.commit] - Commit after delete
		 *
		 * @example
		 * hf cipurse delete --fid 2ff7
		 * hf cipurse delete --aid 4144204631 --chfid 0102
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, fileId, aid, childFileId, requestSecurity, responseSecurity, noAuth, commit } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (childFileId !== undefined && childFileId !== null) args.push("--chfid", String(childFileId));
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			if (noAuth) args.push("--no-auth");
			if (commit) args.push("--commit");
			return command(client.client, ["hf", "cipurse", "delete"])(args);
		},
		updkey: /**
		 * Update a CIPURSE key
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Show technical data
		 * @param {number|string} [options.keyId] - Key ID for authentication
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {string} [options.aid] - Application ID (AID) (hex)
		 * @param {string} [options.fileId] - File ID (FID) (hex)
		 * @param {boolean} [options.masterFile] - Select masterfile by empty id
		 * @param {number|string} [options.targetKeyId] - Target key ID
		 * @param {string} [options.newKey] - New key, 16 hex bytes
		 * @param {string} [options.newKeyAdditional] - New key additional info, 1 hex byte (default: 0x00)
		 * @param {number|string} [options.encryptKeyId] - Encrypt key ID (must match card key)
		 * @param {string} [options.encryptKey] - Encrypt key, 16 hex bytes (must match card key)
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 * @param {boolean} [options.noAuth] - Execute without authentication
		 * @param {boolean} [options.commit] - Commit
		 *
		 * @example
		 * hf cipurse updkey --aid 4144204631 --newkeyn 2 --newkeya 00 --newkey 73737373737373737373737373737373
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, aid, fileId, masterFile, targetKeyId, newKey, newKeyAdditional, encryptKeyId, encryptKey, requestSecurity, responseSecurity, noAuth, commit } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (masterFile) args.push("--mfd");
			if (targetKeyId !== undefined && targetKeyId !== null) args.push("--newkeyn", String(targetKeyId));
			if (newKey !== undefined && newKey !== null) args.push("--newkey", String(newKey));
			if (newKeyAdditional !== undefined && newKeyAdditional !== null) args.push("--newkeya", String(newKeyAdditional));
			if (encryptKeyId !== undefined && encryptKeyId !== null) args.push("--enckeyn", String(encryptKeyId));
			if (encryptKey !== undefined && encryptKey !== null) args.push("--enckey", String(encryptKey));
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			if (noAuth) args.push("--no-auth");
			if (commit) args.push("--commit");
			return command(client.client, ["hf", "cipurse", "updkey"])(args);
		},
		updakey: /**
		 * Update CIPURSE key attributes. Factory default is 0x02.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Show technical data
		 * @param {number|string} [options.keyId] - Key ID for authentication
		 * @param {string} [options.key] - Auth key (hex)
		 * @param {string} [options.aid] - Application ID (AID) (hex)
		 * @param {string} [options.fileId] - File ID (FID) (hex)
		 * @param {boolean} [options.masterFile] - Select masterfile by empty id
		 * @param {number|string} [options.targetKeyId] - Target key ID
		 * @param {string} [options.attributes] - Key attributes 1 hex byte
		 * @param {string} [options.requestSecurity] - Reader-PICC security level (plain|mac|encode, default: mac)
		 * @param {string} [options.responseSecurity] - PICC-reader security level (plain|mac|encode, default: mac)
		 * @param {boolean} [options.noAuth] - Execute without authentication
		 * @param {boolean} [options.commit] - Commit
		 *
		 * @example
		 * hf cipurse updakey --trgkeyn 2 --attr 80      -> block key 2 for lifetime (WARNING!)
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu, verbose, keyId, key, aid, fileId, masterFile, targetKeyId, attributes, requestSecurity, responseSecurity, noAuth, commit } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			if (masterFile) args.push("--mfd");
			if (targetKeyId !== undefined && targetKeyId !== null) args.push("--trgkeyn", String(targetKeyId));
			if (attributes !== undefined && attributes !== null) args.push("--attr", String(attributes));
			if (requestSecurity !== undefined && requestSecurity !== null) args.push("--sreq", String(requestSecurity));
			if (responseSecurity !== undefined && responseSecurity !== null) args.push("--sresp", String(responseSecurity));
			if (noAuth) args.push("--no-auth");
			if (commit) args.push("--commit");
			return command(client.client, ["hf", "cipurse", "updakey"])(args);
		},
		default: /**
		 * Set default parameters for access to CIPURSE card
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.clear] - Resets to defaults
		 * @param {number|string} [options.keyId] - Key ID
		 * @param {string} [options.key] - Authentication key (hex)
		 * @param {string} [options.aid] - Application ID (AID) 1..16 bytes (hex)
		 * @param {string} [options.fileId] - File ID 2 bytes (hex)
		 *
		 * @example
		 * hf cipurse default --reset     -> reset parameters to default
		 * hf cipurse default -n 1 -k 65656565656565656565656565656565 --fid 2ff7
		 * @returns {Promise<string>} Command output
		 */
		async ({ clear, keyId, key, aid, fileId } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (clear) args.push("--clear");
			if (keyId !== undefined && keyId !== null) args.push("-n", String(keyId));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (fileId !== undefined && fileId !== null) args.push("--fid", String(fileId));
			return command(client.client, ["hf", "cipurse", "default"])(args);
		},
		test: /**
		 * Run CIPURSE regression tests
		 *
		 * @example
		 * hf cipurse test
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "cipurse", "test"])([]);
		},
	},

	seos: {
		list: /**
		 * List trace buffer for SEOS protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf seos list --frame           -> show frame delay times
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
			return command(client.client, ["hf", "seos", "list"])(args);
		},
		sam: /**
		 * Extract PACS information via a HID SAM.
		 * Make sure you have a SAM inserted in your sim module.
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.keepField] - Keep the field active after command executed
		 * @param {boolean} [options.noDetect] - Skip selecting the card and sending card details to SAM
		 * @param {boolean} [options.decodeTlv] - Decode TLV
		 * @param {string} [options.data] - DER encoded command to send to SAM (hex)
		 *
		 * @example
		 * hf seos sam
		 * hf seos sam -d a005a103800104      -> get PACS data
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, keepField, noDetect, decodeTlv, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (keepField) args.push("--keep");
			if (noDetect) args.push("--nodetect");
			if (decodeTlv) args.push("--tlv");
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "seos", "sam"])(args);
		},
		info: /**
		 * Request unauthenticated information from the default ADF of a SEOS card.
		 * Detects static RND.ICC keys, encryption and hashing algorithms.
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.privacyKeySlot] - Privacy key slot index for ADF handling
		 * @param {number|string} [options.authKeySlot] - Auth key slot index for card challenge/authentication
		 * @param {string} [options.aid] - Use a custom SEOS AID (hex)
		 *
		 * @example
		 * hf seos info
		 * hf seos info --privacy-key 8 --auth-key 9
		 * @returns {Promise<string>} Command output
		 */
		async ({ privacyKeySlot, authKeySlot, aid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (privacyKeySlot !== undefined && privacyKeySlot !== null) args.push("--privacy-key", String(privacyKeySlot));
			if (authKeySlot !== undefined && authKeySlot !== null) args.push("--auth-key", String(authKeySlot));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			return command(client.client, ["hf", "seos", "info"])(args);
		},
		pacs: /**
		 * Make a GET DATA request to an ADF of a SEOS card for PACS data
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.oid] - OID hex bytes (default: 2B0601040181E438010102011801010202)
		 * @param {number|string} [options.privacyKeySlot] - Privacy key slot index
		 * @param {number|string} [options.authKeySlot] - Auth key slot index
		 * @param {string} [options.aid] - Use a custom SEOS AID (hex)
		 *
		 * @example
		 * hf seos pacs
		 * hf seos pacs --privacy-key 8 --auth-key 9
		 * @returns {Promise<string>} Command output
		 */
		async ({ oid, privacyKeySlot, authKeySlot, aid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (oid !== undefined && oid !== null) args.push("--oid", String(oid));
			if (privacyKeySlot !== undefined && privacyKeySlot !== null) args.push("--privacy-key", String(privacyKeySlot));
			if (authKeySlot !== undefined && authKeySlot !== null) args.push("--auth-key", String(authKeySlot));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			return command(client.client, ["hf", "seos", "pacs"])(args);
		},
		write: /**
		 * Make a PUT DATA request to an ADF of a SEOS card
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.oid] - OID hex bytes (default: 2B0601040181E438010102011801010202)
		 * @param {number|string} [options.privacyKeySlot] - Privacy key slot index
		 * @param {number|string} [options.authKeySlot] - Auth key slot index
		 * @param {string} [options.aid] - Use a custom SEOS AID (hex)
		 * @param {string} [options.data] - Data, 0-128 hex bytes (must be valid BER-TLV)
		 *
		 * @example
		 * hf seos write -d 12345678
		 * hf seos write --privacy-key 8 --auth-key 9 -d 12345678
		 * @returns {Promise<string>} Command output
		 */
		async ({ oid, privacyKeySlot, authKeySlot, aid, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (oid !== undefined && oid !== null) args.push("--oid", String(oid));
			if (privacyKeySlot !== undefined && privacyKeySlot !== null) args.push("--privacy-key", String(privacyKeySlot));
			if (authKeySlot !== undefined && authKeySlot !== null) args.push("--auth-key", String(authKeySlot));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "seos", "write"])(args);
		},
		adf: /**
		 * Make a GET DATA request to an Application Data File (ADF) of a SEOS tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.tag] - Tag to read, hex bytes (default: FF00)
		 * @param {string} [options.oid] - OID hex bytes (default: 2B0601040181E438010102011801010202)
		 * @param {number|string} [options.privacyKeySlot] - Privacy key slot index
		 * @param {number|string} [options.authKeySlot] - Auth key slot index
		 * @param {string} [options.aid] - Use a custom SEOS AID (hex)
		 *
		 * @example
		 * hf seos adf
		 * hf seos adf -o 2B0601040181E438010102011801010202 -t FF41 --privacy-key 8 --auth-key 9
		 * @returns {Promise<string>} Command output
		 */
		async ({ tag, oid, privacyKeySlot, authKeySlot, aid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (tag !== undefined && tag !== null) args.push("--tag", String(tag));
			if (oid !== undefined && oid !== null) args.push("--oid", String(oid));
			if (privacyKeySlot !== undefined && privacyKeySlot !== null) args.push("--privacy-key", String(privacyKeySlot));
			if (authKeySlot !== undefined && authKeySlot !== null) args.push("--auth-key", String(authKeySlot));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			return command(client.client, ["hf", "seos", "adf"])(args);
		},
		gdf: /**
		 * Get Global Data File (GDF) from a SEOS card
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.privacyKeySlot] - Privacy key slot index (default: 3)
		 * @param {string} [options.aid] - Use a custom SEOS AID (hex)
		 *
		 * @example
		 * hf seos gdf
		 * hf seos gdf --privacy-key 3
		 * @returns {Promise<string>} Command output
		 */
		async ({ privacyKeySlot, aid } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (privacyKeySlot !== undefined && privacyKeySlot !== null) args.push("--privacy-key", String(privacyKeySlot));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			return command(client.client, ["hf", "seos", "gdf"])(args);
		},
		sim: /**
		 * Simulate a SEOS card with the provided keys and data
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.tag] - Tag to simulate, hex bytes (default: FF00)
		 * @param {string} [options.oid] - OID hex bytes (default: 2B0601040181E438010102011801010202)
		 * @param {number|string} [options.privacyKeySlot] - Privacy key slot index
		 * @param {number|string} [options.authKeySlot] - Auth key slot index
		 * @param {string} [options.diversifier] - Diversifier hex bytes (equivalent of UID)
		 * @param {string} [options.data] - Data, 0-128 hex bytes (must be valid BER-TLV)
		 * @param {string} [options.uid] - UID, 0-10 hex bytes (must be a RID, i.e. [0]=0x08)
		 * @param {boolean} [options.legacy] - Use legacy algorithms (3DES/SHA1)
		 *
		 * @example
		 * hf seos sim -d 12345678
		 * hf seos sim --privacy-key 8 --auth-key 9 -d 12345678
		 * @returns {Promise<string>} Command output
		 */
		async ({ tag, oid, privacyKeySlot, authKeySlot, diversifier, data, uid, legacy } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (tag !== undefined && tag !== null) args.push("--tag", String(tag));
			if (oid !== undefined && oid !== null) args.push("--oid", String(oid));
			if (privacyKeySlot !== undefined && privacyKeySlot !== null) args.push("--privacy-key", String(privacyKeySlot));
			if (authKeySlot !== undefined && authKeySlot !== null) args.push("--auth-key", String(authKeySlot));
			if (diversifier !== undefined && diversifier !== null) args.push("--div", String(diversifier));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (legacy) args.push("--legacy");
			return command(client.client, ["hf", "seos", "sim"])(args);
		},
		managekeys: /**
		 * Manage SEOS keys in client memory. Keys are required to authenticate with SEOS cards.
		 *
		 * @param {Object} [options] - Options object
		 * @param {number|string} [options.keyIndex] - Specify key index to set key in memory
		 * @param {string} [options.privacyKey] - Privacy key as 32 hex bytes (enc || mac)
		 * @param {string} [options.authKey] - Auth key as 16 hex bytes
		 * @param {string} [options.file] - Specify a filename for load/save operations
		 * @param {boolean} [options.save] - Save keys in memory to file
		 * @param {boolean} [options.load] - Load keys to memory from file
		 * @param {boolean} [options.print] - Print keys loaded into memory
		 * @param {boolean} [options.verbose] - Verbose (print all key info)
		 *
		 * @example
		 * hf seos managekeys -p
		 * hf seos managekeys --ki 8 --privacy 0000000000000000000000000000000000000000000000000000000000000000
		 * @returns {Promise<string>} Command output
		 */
		async ({ keyIndex, privacyKey, authKey, file, save, load, print, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keyIndex !== undefined && keyIndex !== null) args.push("--ki", String(keyIndex));
			if (privacyKey !== undefined && privacyKey !== null) args.push("--privacy", String(privacyKey));
			if (authKey !== undefined && authKey !== null) args.push("--auth", String(authKey));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (save) args.push("--save");
			if (load) args.push("--load");
			if (print) args.push("--print");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "seos", "managekeys"])(args);
		},
	},

	gallagher: {
		reader: /**
		 * Read a Gallagher tag from the Card Application Directory (CAD).
		 * Specify site key if using non-default key.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.aid] - Application ID to read (3 bytes hex). If specified, CAD is not used.
		 * @param {string} [options.siteKey] - Site key to compute diversified keys (16 bytes hex)
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.classic] - Read Gallagher MIFARE Classic card
		 *
		 * @example
		 * hf gallagher reader -@         -> DESFIRE: continuous reader mode
		 * hf gallagher reader -c -@      -> CLASSIC: continuous reader mode
		 * @returns {Promise<string>} Command output
		 */
		async ({ aid, siteKey, continuous, showApdu, verbose, classic } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (siteKey !== undefined && siteKey !== null) args.push("--sitekey", String(siteKey));
			if (continuous) args.push("--continuous");
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (classic) args.push("--classic");
			return command(client.client, ["hf", "gallagher", "reader"])(args);
		},
		clone: /**
		 * Clone Gallagher credentials to a writable DESFire or MIFARE Classic card.
		 * Use -c for MIFARE Classic cards.
		 *
		 * @param {Object} options - Options object
		 * @param {boolean} [options.classic] - Write to MIFARE Classic card instead of DESFire
		 * @param {number|string} [options.piccKeyNumber] - DESFire PICC key number (default 0)
		 * @param {string} [options.cryptoAlgorithm] - DESFire PICC crypt algo (DES|2TDEA|3TDEA|AES)
		 * @param {string} [options.key] - DESFire Key for PICC authentication (hex)
		 * @param {number|string} options.regionCode - Region code (4 bits max)
		 * @param {number|string} options.facilityCode - Facility code (2 bytes max)
		 * @param {number|string} options.cardNumber - Card number (3 bytes max)
		 * @param {number|string} options.issueLevel - Issue level (4 bits max)
		 * @param {string} [options.aid] - DESFire Application ID to write (3 bytes hex, default auto)
		 * @param {string} [options.siteKey] - Site key to compute diversified keys (16 bytes hex)
		 * @param {string} [options.cadKey] - DESFire Custom AES key 0 for CAD (16 bytes hex)
		 * @param {boolean} [options.noCadUpdate] - DESFire: Don't modify the CAD
		 * @param {boolean} [options.noAppCreate] - DESFire: Don't create the app
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {number|string} [options.sector] - Classic: Sector number (default 15)
		 * @param {number|string} [options.cadSector] - Classic: CAD sector number (default 0, skip)
		 * @param {boolean} [options.noMes] - Classic: Don't include MIFARE Enhanced Security block
		 * @param {boolean} [options.noMad] - Classic: Don't update the MAD
		 *
		 * @example
		 * hf gallagher clone --rc 1 --fc 22 --cn 3333 --il 4 --sitekey 00112233445566778899aabbccddeeff
		 * hf gallagher clone -c --rc 1 --fc 22 --cn 3333 --il 4
		 * @returns {Promise<string>} Command output
		 */
		async ({ classic, piccKeyNumber, cryptoAlgorithm, key, regionCode, facilityCode, cardNumber, issueLevel, aid, siteKey, cadKey, noCadUpdate, noAppCreate, showApdu, verbose, sector, cadSector, noMes, noMad }) => {
			const client = await clientPromise;
			const args = [];
			if (classic) args.push("--classic");
			if (piccKeyNumber !== undefined && piccKeyNumber !== null) args.push("--keynum", String(piccKeyNumber));
			if (cryptoAlgorithm !== undefined && cryptoAlgorithm !== null) args.push("--algo", String(cryptoAlgorithm));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			args.push("--rc", String(regionCode));
			args.push("--fc", String(facilityCode));
			args.push("--cn", String(cardNumber));
			args.push("--il", String(issueLevel));
			if (aid !== undefined && aid !== null) args.push("--aid", String(aid));
			if (siteKey !== undefined && siteKey !== null) args.push("--sitekey", String(siteKey));
			if (cadKey !== undefined && cadKey !== null) args.push("--cadkey", String(cadKey));
			if (noCadUpdate) args.push("--nocadupdate");
			if (noAppCreate) args.push("--noappcreate");
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			if (sector !== undefined && sector !== null) args.push("--sector", String(sector));
			if (cadSector !== undefined && cadSector !== null) args.push("--cadsector", String(cadSector));
			if (noMes) args.push("--nomes");
			if (noMad) args.push("--nomad");
			return command(client.client, ["hf", "gallagher", "clone"])(args);
		},
		delete: /**
		 * Delete Gallagher application from a DESFire card
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.aid - Application ID to delete (3 bytes hex)
		 * @param {string} [options.siteKey] - Site key to compute diversified keys (16 bytes hex)
		 * @param {string} [options.cadKey] - Custom AES key 0 for CAD (16 bytes hex)
		 * @param {boolean} [options.noCadUpdate] - Don't modify the CAD (only deletes the app)
		 * @param {boolean} [options.noAppDelete] - Don't delete the application (only modifies the CAD)
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf gallagher delete --aid 2081f4 --sitekey 00112233445566778899aabbccddeeff
		 * @returns {Promise<string>} Command output
		 */
		async ({ aid, siteKey, cadKey, noCadUpdate, noAppDelete, showApdu, verbose }) => {
			const client = await clientPromise;
			const args = ["--aid", String(aid)];
			if (siteKey !== undefined && siteKey !== null) args.push("--sitekey", String(siteKey));
			if (cadKey !== undefined && cadKey !== null) args.push("--cadkey", String(cadKey));
			if (noCadUpdate) args.push("--nocadupdate");
			if (noAppDelete) args.push("--noappdelete");
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "gallagher", "delete"])(args);
		},
		diversifykey: /**
		 * Diversify a Gallagher key
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.aid - Application ID for diversification (3 bytes hex)
		 * @param {number|string} [options.keyNumber] - Key number (default 0)
		 * @param {string} [options.uid] - Card UID (4 or 7 bytes hex)
		 * @param {string} [options.siteKey] - Site key to compute diversified keys (16 bytes hex)
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf gallagher diversify --uid 11223344556677 --aid 2081f4
		 * @returns {Promise<string>} Command output
		 */
		async ({ aid, keyNumber, uid, siteKey, showApdu }) => {
			const client = await clientPromise;
			const args = ["--aid", String(aid)];
			if (keyNumber !== undefined && keyNumber !== null) args.push("--keynum", String(keyNumber));
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (siteKey !== undefined && siteKey !== null) args.push("--sitekey", String(siteKey));
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "gallagher", "diversifykey"])(args);
		},
		decode: /**
		 * Decode a Gallagher credential block (with or without bitwise inverse)
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - Credential block (8 or 16 bytes hex)
		 *
		 * @example
		 * hf gallagher decode --data A3B4B0C151B0A31B
		 * @returns {Promise<string>} Command output
		 */
		async ({ data }) => {
			const client = await clientPromise;
			const args = ["--data", String(data)];
			return command(client.client, ["hf", "gallagher", "decode"])(args);
		},
		encode: /**
		 * Encode a Gallagher credential block
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.regionCode - Region code (4 bits max)
		 * @param {number|string} options.facilityCode - Facility code (2 bytes max)
		 * @param {number|string} options.cardNumber - Card number (3 bytes max)
		 * @param {number|string} options.issueLevel - Issue level (4 bits max)
		 *
		 * @example
		 * hf gallagher encode --rc 1 --fc 22153 --cn 1253518 --il 1
		 * @returns {Promise<string>} Command output
		 */
		async ({ regionCode, facilityCode, cardNumber, issueLevel }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--rc", String(regionCode));
			args.push("--fc", String(facilityCode));
			args.push("--cn", String(cardNumber));
			args.push("--il", String(issueLevel));
			return command(client.client, ["hf", "gallagher", "encode"])(args);
		},
		test: /**
		 * Test the function of Gallagher MIFARE Core
		 *
		 * @example
		 * hf gallagher test
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "gallagher", "test"])([]);
		},
	},

	fudan: {
		reader: /**
		 * Read a Fudan tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * hf fudan reader
		 * hf fudan reader -@             -> continuous reader mode
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "fudan", "reader"])(args);
		},
		dump: /**
		 * Dump FUDAN tag to file (bin/json).
		 * If no filename given, UID will be used.
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Specify a filename for dump file
		 * @param {boolean} [options.noSave] - No save to file
		 *
		 * @example
		 * hf fudan dump -f mydump
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, noSave } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (noSave) args.push("--ns");
			return command(client.client, ["hf", "fudan", "dump"])(args);
		},
		rdbl: /**
		 * Read a Fudan block
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.block - Block number
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf fudan rdbl --blk 0 -k FFFFFFFFFFFF
		 * hf fudan rdbl --blk 3 -v
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, key, verbose }) => {
			const client = await clientPromise;
			const args = ["--blk", String(block)];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "fudan", "rdbl"])(args);
		},
		view: /**
		 * Print a FUDAN dump file (bin/eml/json)
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.file - Specify a filename for dump file
		 *
		 * @example
		 * hf fudan view -f hf-fudan-01020304-dump.bin
		 * @returns {Promise<string>} Command output
		 */
		async ({ file }) => {
			const client = await clientPromise;
			const args = ["--file", String(file)];
			return command(client.client, ["hf", "fudan", "view"])(args);
		},
		wrbl: /**
		 * Write 4 hex bytes of data to a Fudan block
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.block - Block number
		 * @param {string} [options.key] - Key, 6 hex bytes
		 * @param {string} [options.data] - Bytes to write, 4 hex bytes
		 *
		 * @example
		 * hf fudan wrbl --blk 1 -k FFFFFFFFFFFF -d 01020304
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, key, data }) => {
			const client = await clientPromise;
			const args = ["--blk", String(block)];
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "fudan", "wrbl"])(args);
		},
	},

	ksx6924: {
		select: /**
		 * Select KS X 6924 application and leave field up
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf ksx6924 select
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "ksx6924", "select"])(args);
		},
		info: /**
		 * Get info about a KS X 6924 transit card (T-Money, Snapper+)
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.keepField] - Keep field ON for next command
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf ksx6924 info
		 * @returns {Promise<string>} Command output
		 */
		async ({ keepField, showApdu } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keepField) args.push("--keep");
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "ksx6924", "info"])(args);
		},
		balance: /**
		 * Get the current purse balance from a KS X 6924 card
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.keepField] - Keep field ON for next command
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf ksx6924 balance
		 * @returns {Promise<string>} Command output
		 */
		async ({ keepField, showApdu } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (keepField) args.push("--keep");
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "ksx6924", "balance"])(args);
		},
		init: /**
		 * Perform transaction initialization with Mpda (Money of Purchase Transaction)
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.mpda - Mpda value, 4 bytes hex
		 * @param {boolean} [options.keepField] - Keep field ON for next command
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf ksx6924 init 000003e8       -> Mpda
		 * @returns {Promise<string>} Command output
		 */
		async ({ mpda, keepField, showApdu }) => {
			const client = await clientPromise;
			const args = [];
			if (keepField) args.push("--keep");
			if (showApdu) args.push("--apdu");
			args.push(String(mpda));
			return command(client.client, ["hf", "ksx6924", "init"])(args);
		},
		prec: /**
		 * Execute proprietary read record command. Data format is unknown.
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.record - Record number, 1 byte hex
		 * @param {boolean} [options.keepField] - Keep field ON for next command
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf ksx6924 prec 0b             -> read proprietary record 0x0b
		 * @returns {Promise<string>} Command output
		 */
		async ({ record, keepField, showApdu }) => {
			const client = await clientPromise;
			const args = [];
			if (keepField) args.push("--keep");
			if (showApdu) args.push("--apdu");
			args.push(String(record));
			return command(client.client, ["hf", "ksx6924", "prec"])(args);
		},
	},

	xerox: {
		list: /**
		 * List trace buffer for Xerox (ISO 14443B) protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf xerox list --frame
		 * hf xerox list -1
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
			return command(client.client, ["hf", "xerox", "list"])(args);
		},
		info: /**
		 * Get tag information for Fuji Xerox based tags (ISO/IEC 14443 type B)
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf xerox info
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "xerox", "info"])(args);
		},
		dump: /**
		 * Dump all memory from a Fuji/Xerox tag (ISO/IEC 14443 type B)
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.file] - Filename to save dump to
		 * @param {boolean} [options.decrypt] - Decrypt secret blocks
		 * @param {boolean} [options.noSave] - No save to file
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.dense] - Dense dump output style
		 *
		 * @example
		 * hf xerox dump
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, decrypt, noSave, verbose, dense } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (decrypt) args.push("--decrypt");
			if (noSave) args.push("--ns");
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "xerox", "dump"])(args);
		},
		reader: /**
		 * Act as a 14443B reader to identify a Fuji Xerox based tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * hf xerox reader
		 * hf xerox reader -@
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "xerox", "reader"])(args);
		},
		view: /**
		 * Print a Fuji/Xerox dump file (bin/eml/json).
		 * The filename must contain a UID to determine card memory type.
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.file - Specify a filename for dump file
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.dense] - Dense dump output style
		 *
		 * @example
		 * hf xerox view -f hf-xerox-0102030405060708-dump.bin
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose, dense }) => {
			const client = await clientPromise;
			const args = ["--file", String(file)];
			if (verbose) args.push("--verbose");
			if (dense) args.push("--dense");
			return command(client.client, ["hf", "xerox", "view"])(args);
		},
		rdbl: /**
		 * Read a Fuji/Xerox tag block
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.block - Page number (0-255)
		 *
		 * @example
		 * hf xerox rdbl -b 1
		 * @returns {Promise<string>} Command output
		 */
		async ({ block }) => {
			const client = await clientPromise;
			const args = ["--blk", String(block)];
			return command(client.client, ["hf", "xerox", "rdbl"])(args);
		},
	},

	ntag424: {
		info: /**
		 * Get info about NXP NTAG424 DNA Family styled tag
		 *
		 * @example
		 * hf ntag424 info
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "ntag424", "info"])([]);
		},
		view: /**
		 * Print a NTAG 424 DNA dump file (bin/eml/json)
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.file - Specify a filename for dump file
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf ntag424 view -f hf-ntag424-01020304-dump.bin
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose }) => {
			const client = await clientPromise;
			const args = ["--file", String(file)];
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "ntag424", "view"])(args);
		},
		auth: /**
		 * Authenticate with selected key against NTAG424
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.keyNumber - Key number
		 * @param {string} options.key - Key for authenticate (16 bytes hex)
		 *
		 * @example
		 * hf ntag424 auth --keyno 0 -k 00000000000000000000000000000000
		 * @returns {Promise<string>} Command output
		 */
		async ({ keyNumber, key }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--keyno", String(keyNumber));
			args.push("--key", String(key));
			return command(client.client, ["hf", "ntag424", "auth"])(args);
		},
		read: /**
		 * Read and print data from file on NTAG424 tag.
		 * Will authenticate if key information is provided.
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.fileNumber - File number (1, 2, or 3)
		 * @param {number|string} [options.keyNumber] - Key number
		 * @param {string} [options.key] - Key for authentication (16 bytes hex)
		 * @param {number|string} [options.offset] - Offset to read in file (default 0)
		 * @param {number|string} options.length - Number of bytes to read
		 * @param {string} [options.communicationMode] - Communication mode (plain|mac|encrypt)
		 *
		 * @example
		 * hf ntag424 read --fileno 1 --keyno 0 -k 00000000000000000000000000000000 -o 0 -l 32
		 * hf ntag424 read --fileno 3 --keyno 3 -k 00000000000000000000000000000000 -o 0 -l 128 -m encrypt
		 * @returns {Promise<string>} Command output
		 */
		async ({ fileNumber, keyNumber, key, offset, length, communicationMode }) => {
			const client = await clientPromise;
			const args = ["--fileno", String(fileNumber)];
			if (keyNumber !== undefined && keyNumber !== null) args.push("--keyno", String(keyNumber));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
			args.push("--length", String(length));
			if (communicationMode !== undefined && communicationMode !== null) args.push("--cmode", String(communicationMode));
			return command(client.client, ["hf", "ntag424", "read"])(args);
		},
		write: /**
		 * Write data to file on NTAG424 tag.
		 * Will authenticate if key information is provided.
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.fileNumber - File number (1, 2, or 3)
		 * @param {number|string} [options.keyNumber] - Key number
		 * @param {string} [options.key] - Key for authentication (16 bytes hex)
		 * @param {number|string} [options.offset] - Offset to write in file (default 0)
		 * @param {string} options.data - Data to write (hex)
		 * @param {string} [options.communicationMode] - Communication mode (plain|mac|encrypt)
		 *
		 * @example
		 * hf ntag424 write --fileno 2 --keyno 0 -k 00000000000000000000000000000000 -o 0 -d 1122334455667788
		 * @returns {Promise<string>} Command output
		 */
		async ({ fileNumber, keyNumber, key, offset, data, communicationMode }) => {
			const client = await clientPromise;
			const args = ["--fileno", String(fileNumber)];
			if (keyNumber !== undefined && keyNumber !== null) args.push("--keyno", String(keyNumber));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
			args.push("--data", String(data));
			if (communicationMode !== undefined && communicationMode !== null) args.push("--cmode", String(communicationMode));
			return command(client.client, ["hf", "ntag424", "write"])(args);
		},
		getfs: /**
		 * Read and print file settings for an NTAG424 file
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.fileNumber - File number
		 *
		 * @example
		 * hf ntag424 getfs --fileno 2
		 * @returns {Promise<string>} Command output
		 */
		async ({ fileNumber }) => {
			const client = await clientPromise;
			const args = ["--fileno", String(fileNumber)];
			return command(client.client, ["hf", "ntag424", "getfs"])(args);
		},
		changefs: /**
		 * Update file settings for an NTAG424 file. Must be authenticated.
		 * See AN12196 for SDM settings documentation.
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.fileNumber - File number
		 * @param {number|string} options.keyNumber - Key number
		 * @param {string} options.key - Key for authentication (16 bytes hex)
		 * @param {string} [options.fileOptions] - File options byte (1 hex byte)
		 * @param {string} [options.accessRights] - File access settings (2 hex bytes)
		 * @param {string} [options.sdmOptions] - SDM options (1 hex byte)
		 * @param {string} [options.sdmAccess] - SDM access settings (2 hex bytes)
		 * @param {string} [options.sdmData1] - SDM data (3 hex bytes)
		 * @param {string} [options.sdmData2] - SDM data (3 hex bytes)
		 * @param {string} [options.sdmData3] - SDM data (3 hex bytes)
		 * @param {string} [options.sdmData4] - SDM data (3 hex bytes)
		 * @param {string} [options.sdmData5] - SDM data (3 hex bytes)
		 * @param {string} [options.sdmData6] - SDM data (3 hex bytes)
		 * @param {string} [options.sdmData7] - SDM data (3 hex bytes)
		 * @param {string} [options.sdmData8] - SDM data (3 hex bytes)
		 *
		 * @example
		 * hf ntag424 changefs --fileno 2 --keyno 0 -k 00000000000000000000000000000000 -o 40 -a 00E0 -s C1 -c F000 --data1 000020 --data2 000043 --data3 000043
		 * @returns {Promise<string>} Command output
		 */
		async ({ fileNumber, keyNumber, key, fileOptions, accessRights, sdmOptions, sdmAccess, sdmData1, sdmData2, sdmData3, sdmData4, sdmData5, sdmData6, sdmData7, sdmData8 }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--fileno", String(fileNumber));
			args.push("--keyno", String(keyNumber));
			args.push("--key", String(key));
			if (fileOptions !== undefined && fileOptions !== null) args.push("--options", String(fileOptions));
			if (accessRights !== undefined && accessRights !== null) args.push("--access", String(accessRights));
			if (sdmOptions !== undefined && sdmOptions !== null) args.push("--sdmoptions", String(sdmOptions));
			if (sdmAccess !== undefined && sdmAccess !== null) args.push("--sdmaccess", String(sdmAccess));
			if (sdmData1 !== undefined && sdmData1 !== null) args.push("--data1", String(sdmData1));
			if (sdmData2 !== undefined && sdmData2 !== null) args.push("--data2", String(sdmData2));
			if (sdmData3 !== undefined && sdmData3 !== null) args.push("--data3", String(sdmData3));
			if (sdmData4 !== undefined && sdmData4 !== null) args.push("--data4", String(sdmData4));
			if (sdmData5 !== undefined && sdmData5 !== null) args.push("--data5", String(sdmData5));
			if (sdmData6 !== undefined && sdmData6 !== null) args.push("--data6", String(sdmData6));
			if (sdmData7 !== undefined && sdmData7 !== null) args.push("--data7", String(sdmData7));
			if (sdmData8 !== undefined && sdmData8 !== null) args.push("--data8", String(sdmData8));
			return command(client.client, ["hf", "ntag424", "changefs"])(args);
		},
		changekey: /**
		 * Change an NTAG424 key. Authentication key must currently be different
		 * to the one being changed.
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.keyNumber - Key number to change
		 * @param {string} [options.oldKey] - Old key (only needed for keys 1-4, 16 bytes hex)
		 * @param {string} options.newKey - New key (16 bytes hex)
		 * @param {string} options.authKey - Authentication key (must be key 0, 16 bytes hex)
		 * @param {number|string} options.keyVersion - New key version number
		 *
		 * @example
		 * hf ntag424 changekey --keyno 1 --oldkey 00000000000000000000000000000000 --newkey 11111111111111111111111111111111 --key0 00000000000000000000000000000000 --kv 1
		 * @returns {Promise<string>} Command output
		 */
		async ({ keyNumber, oldKey, newKey, authKey, keyVersion }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--keyno", String(keyNumber));
			if (oldKey !== undefined && oldKey !== null) args.push("--oldkey", String(oldKey));
			args.push("--newkey", String(newKey));
			args.push("--key0", String(authKey));
			args.push("--kv", String(keyVersion));
			return command(client.client, ["hf", "ntag424", "changekey"])(args);
		},
	},

	saflok: {
		read: /**
		 * Read a Saflok card (MIFARE Classic only)
		 *
		 * @example
		 * hf saflok read
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "saflok", "read"])([]);
		},
		provision: /**
		 * Provision a Saflok card
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - 17-byte encrypted hex block
		 *
		 * @example
		 * hf saflok provision -d <17-byte encrypted hex block>
		 * @returns {Promise<string>} Command output
		 */
		async ({ data }) => {
			const client = await clientPromise;
			const args = ["-d", String(data)];
			return command(client.client, ["hf", "saflok", "provision"])(args);
		},
		encode: /**
		 * Encode Saflok data with all card parameters
		 *
		 * @param {Object} options - Options object
		 * @param {number|string} options.level - Card Level
		 * @param {number|string} options.type - Card Type
		 * @param {number|string} options.id - Card ID
		 * @param {number|string} options.openingBits - Opening Bits
		 * @param {number|string} options.lockId - Lock ID
		 * @param {number|string} options.passNumber - Pass Number
		 * @param {number|string} options.sequenceCombo - Sequence and Combination
		 * @param {number|string} options.deadboltOverride - Deadbolt Override
		 * @param {number|string} options.restrictedDays - Restricted Days
		 * @param {string} options.expireDate - Expire Date Offset (YYYY-MM-DDTHH:mm)
		 * @param {string} options.createdDate - Card Creation Date (YYYY-MM-DDTHH:mm)
		 * @param {number|string} options.propertyId - Property ID
		 *
		 * @example
		 * hf saflok encode
		 * @returns {Promise<string>} Command output
		 */
		async ({ level, type, id, openingBits, lockId, passNumber, sequenceCombo, deadboltOverride, restrictedDays, expireDate, createdDate, propertyId }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--level", String(level));
			args.push("--type", String(type));
			args.push("--id", String(id));
			args.push("--open", String(openingBits));
			args.push("--lock_id", String(lockId));
			args.push("--pass_num", String(passNumber));
			args.push("--seq_combo", String(sequenceCombo));
			args.push("--deadbolt", String(deadboltOverride));
			args.push("--days", String(restrictedDays));
			args.push("--expire", String(expireDate));
			args.push("--created", String(createdDate));
			args.push("--prop_id", String(propertyId));
			return command(client.client, ["hf", "saflok", "encode"])(args);
		},
		decode: /**
		 * Decode Saflok encrypted data
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - Encrypted 17 byte card data
		 *
		 * @example
		 * hf saflok decode -d <encrypted data>
		 * @returns {Promise<string>} Command output
		 */
		async ({ data }) => {
			const client = await clientPromise;
			const args = ["-d", String(data)];
			return command(client.client, ["hf", "saflok", "decode"])(args);
		},
		modify: /**
		 * Modify Saflok card data. All fields are optional -- only specified fields are changed.
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - Encrypted 17 byte card data
		 * @param {number|string} [options.level] - Card Level
		 * @param {number|string} [options.type] - Card Type
		 * @param {number|string} [options.id] - Card ID
		 * @param {number|string} [options.openingBits] - Opening Bits
		 * @param {number|string} [options.lockId] - Lock ID
		 * @param {number|string} [options.passNumber] - Pass Number
		 * @param {number|string} [options.sequenceCombo] - Sequence and Combination
		 * @param {number|string} [options.deadboltOverride] - Deadbolt Override
		 * @param {number|string} [options.restrictedDays] - Restricted Days
		 * @param {string} [options.expireDate] - Expire Date Offset (YYYY-MM-DDTHH:mm)
		 * @param {string} [options.createdDate] - Card Creation Date (YYYY-MM-DDTHH:mm)
		 * @param {number|string} [options.propertyId] - Property ID
		 *
		 * @example
		 * hf saflok modify
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, level, type, id, openingBits, lockId, passNumber, sequenceCombo, deadboltOverride, restrictedDays, expireDate, createdDate, propertyId }) => {
			const client = await clientPromise;
			const args = ["-d", String(data)];
			if (level !== undefined && level !== null) args.push("--level", String(level));
			if (type !== undefined && type !== null) args.push("--type", String(type));
			if (id !== undefined && id !== null) args.push("--id", String(id));
			if (openingBits !== undefined && openingBits !== null) args.push("--open", String(openingBits));
			if (lockId !== undefined && lockId !== null) args.push("--lock_id", String(lockId));
			if (passNumber !== undefined && passNumber !== null) args.push("--pass_num", String(passNumber));
			if (sequenceCombo !== undefined && sequenceCombo !== null) args.push("--seq_combo", String(sequenceCombo));
			if (deadboltOverride !== undefined && deadboltOverride !== null) args.push("--deadbolt", String(deadboltOverride));
			if (restrictedDays !== undefined && restrictedDays !== null) args.push("--days", String(restrictedDays));
			if (expireDate !== undefined && expireDate !== null) args.push("--expire", String(expireDate));
			if (createdDate !== undefined && createdDate !== null) args.push("--created", String(createdDate));
			if (propertyId !== undefined && propertyId !== null) args.push("--prop_id", String(propertyId));
			return command(client.client, ["hf", "saflok", "modify"])(args);
		},
		encrypt: /**
		 * Encrypt a 17-byte Saflok block
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - 17-byte unencrypted hex block
		 *
		 * @example
		 * hf saflok encrypt -d <17 byte hex>
		 * @returns {Promise<string>} Command output
		 */
		async ({ data }) => {
			const client = await clientPromise;
			const args = ["-d", String(data)];
			return command(client.client, ["hf", "saflok", "encrypt"])(args);
		},
		decrypt: /**
		 * Decrypt a 17-byte Saflok block
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - 17-byte encrypted hex block
		 *
		 * @example
		 * hf saflok decrypt -d <17 byte hex>
		 * @returns {Promise<string>} Command output
		 */
		async ({ data }) => {
			const client = await clientPromise;
			const args = ["-d", String(data)];
			return command(client.client, ["hf", "saflok", "decrypt"])(args);
		},
		interrogate: /**
		 * Interrogate a Saflok card
		 *
		 * @example
		 * hf saflok interrogate
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "saflok", "interrogate"])([]);
		},
		cksum: /**
		 * Generate Saflok checksum and append to block
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.data - 16-byte decrypted Saflok block (hex)
		 *
		 * @example
		 * hf saflok cksum -d <16 byte hex>
		 * @returns {Promise<string>} Command output
		 */
		async ({ data }) => {
			const client = await clientPromise;
			const args = ["-d", String(data)];
			return command(client.client, ["hf", "saflok", "cksum"])(args);
		},
		selftest: /**
		 * Validate internal functionality of Saflok routines
		 *
		 * @example
		 * hf saflok selftest
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "saflok", "selftest"])([]);
		},
	},

	tesla: {
		info: /**
		 * Get info about a TESLA Key tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.parseCertificates] - Parse the certificates as ASN.1
		 *
		 * @example
		 * hf tesla info
		 * @returns {Promise<string>} Command output
		 */
		async ({ parseCertificates } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (parseCertificates) args.push("--parse");
			return command(client.client, ["hf", "tesla", "info"])(args);
		},
		list: /**
		 * List trace buffer for Tesla (ISO 7816) protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf tesla list --frame
		 * hf tesla list -1
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
			return command(client.client, ["hf", "tesla", "list"])(args);
		},
	},

	texkom: {
		reader: /**
		 * Read a Texkom tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.offlineMode] - Use data from Graphbuffer (offline mode)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * hf texkom reader
		 * hf texkom reader -@            -> continuous reader mode
		 * @returns {Promise<string>} Command output
		 */
		async ({ offlineMode, verbose, continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (offlineMode) args.push("-1");
			if (verbose) args.push("--verbose");
			if (continuous) args.push("-@");
			return command(client.client, ["hf", "texkom", "reader"])(args);
		},
		sim: /**
		 * Simulate a Texkom tag
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {boolean} [options.useTk17] - Use TK-17 modulation (TK-13 by default)
		 * @param {string} [options.rawData] - Raw data for texkom card, 8 hex bytes (manual modulation select)
		 * @param {string} [options.id] - Tag ID, 4 hex bytes
		 * @param {number|string} [options.timeout] - Simulation timeout in ms (0 = infinite)
		 *
		 * @example
		 * hf texkom sim --raw FFFF638C7DC45553      -> simulate TK13 tag
		 * hf texkom sim --id 8C7DC455               -> simulate TK13 tag with id
		 * hf texkom sim --id 8C7DC455 --tk17        -> simulate TK17 tag with id
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose, useTk17, rawData, id, timeout } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (useTk17) args.push("--tk17");
			if (rawData !== undefined && rawData !== null) args.push("--raw", String(rawData));
			if (id !== undefined && id !== null) args.push("--id", String(id));
			if (timeout !== undefined && timeout !== null) args.push("--timeout", String(timeout));
			return command(client.client, ["hf", "texkom", "sim"])(args);
		},
	},

	aliro: {
		list: /**
		 * List trace buffer for ALIRO (ISO 7816) protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf aliro list --frame          -> show frame delay times
		 * hf aliro list -1               -> use trace buffer
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
			return command(client.client, ["hf", "aliro", "list"])(args);
		},
		info: /**
		 * Select ALIRO applet and print capabilities
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf aliro info
		 * hf aliro info -a
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "aliro", "info"])(args);
		},
		read: /**
		 * Execute ALIRO expedited flow and optional step-up document retrieval
		 *
		 * @param {Object} options - Options object
		 * @param {string} [options.persistentKey] - Kpersistent (32 bytes hex, optional, for fast cryptogram verification)
		 * @param {string} options.readerGroupId - Reader group identifier (16 bytes hex)
		 * @param {string} [options.readerSubGroupId] - Reader subgroup identifier (16 bytes hex, default: all zeroes)
		 * @param {string} options.readerPrivateKey - Reader private key (P-256): PEM, DER hex, scalar, or file path
		 * @param {string} [options.transactionId] - Transaction identifier (16 bytes hex, random if omitted)
		 * @param {string} [options.endpointPublicKey] - Endpoint public key for AUTH0 fast verification (32-byte X or 65-byte uncompressed, hex)
		 * @param {string} [options.flow] - Transaction flow (step-up|standard|fast, default: step-up)
		 * @param {string} [options.stepUpScopes] - Comma-separated step-up scopes (default: matter1)
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf aliro read --reader-group-id 00112233445566778899AABBCCDDEEFF --reader-private-key 00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF
		 * @returns {Promise<string>} Command output
		 */
		async ({ persistentKey, readerGroupId, readerSubGroupId, readerPrivateKey, transactionId, endpointPublicKey, flow, stepUpScopes, showApdu }) => {
			const client = await clientPromise;
			const args = [];
			if (persistentKey !== undefined && persistentKey !== null) args.push("--key-persistent", String(persistentKey));
			args.push("--reader-group-id", String(readerGroupId));
			if (readerSubGroupId !== undefined && readerSubGroupId !== null) args.push("--reader-sub-group-id", String(readerSubGroupId));
			args.push("--reader-private-key", String(readerPrivateKey));
			if (transactionId !== undefined && transactionId !== null) args.push("--transaction-id", String(transactionId));
			if (endpointPublicKey !== undefined && endpointPublicKey !== null) args.push("--endpoint-public-key", String(endpointPublicKey));
			if (flow !== undefined && flow !== null) args.push("--flow", String(flow));
			if (stepUpScopes !== undefined && stepUpScopes !== null) args.push("--step-up-scopes", String(stepUpScopes));
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "aliro", "read"])(args);
		},
	},

	vas: {
		info: /**
		 * Select VAS applet and print capabilities
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf vas info
		 * hf vas info -a
		 * @returns {Promise<string>} Command output
		 */
		async ({ showApdu } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "vas", "info"])(args);
		},
		reader: /**
		 * Read and decrypt Value Added Services (VAS) message
		 *
		 * @param {Object} [options] - Options object
		 * @param {string|string[]} [options.passTypeId] - PID, pass type id (can repeat for multiple)
		 * @param {string|string[]} [options.readerPrivateKey] - Terminal private key (PEM, DER, scalar, or file path; can repeat)
		 * @param {string} [options.url] - URL to provide to the mobile device
		 * @param {string} [options.mode] - VAS mode (vasorpay|vasandpay|vasonly)
		 * @param {boolean} [options.continuous] - Continuous mode
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf vas reader --url https://example.com         -> URL Only mode
		 * hf vas reader --pid pass.com.passkit.pksamples.nfcdemo -k vas.passkit.der -@
		 * @returns {Promise<string>} Command output
		 */
		async ({ passTypeId, readerPrivateKey, url, mode, continuous, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (passTypeId !== undefined && passTypeId !== null) {
				const pids = Array.isArray(passTypeId) ? passTypeId : [passTypeId];
				pids.forEach(p => args.push("--pid", String(p)));
			}
			if (readerPrivateKey !== undefined && readerPrivateKey !== null) {
				const keys = Array.isArray(readerPrivateKey) ? readerPrivateKey : [readerPrivateKey];
				keys.forEach(k => args.push("--key", String(k)));
			}
			if (url !== undefined && url !== null) args.push("--url", String(url));
			if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
			if (continuous) args.push("-@");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "vas", "reader"])(args);
		},
		decrypt: /**
		 * Decrypt a previously captured VAS cryptogram
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.passTypeId] - PID, pass type id
		 * @param {string} [options.readerPrivateKey] - Terminal private key (PEM, DER, scalar, or file path)
		 * @param {string} [options.data] - Cryptogram to decrypt (hex)
		 *
		 * @example
		 * hf vas decrypt --pid pass.com.passkit.pksamples.nfcdemo -k vas.passkit.der -d c0b77375...
		 * @returns {Promise<string>} Command output
		 */
		async ({ passTypeId, readerPrivateKey, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (passTypeId !== undefined && passTypeId !== null) args.push("--pid", String(passTypeId));
			if (readerPrivateKey !== undefined && readerPrivateKey !== null) args.push("--key", String(readerPrivateKey));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["hf", "vas", "decrypt"])(args);
		},
	},

	gst: {
		list: /**
		 * List trace buffer for Google Smart Tap (ISO 7816) protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf gst list --frame
		 * hf gst list -1
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
			return command(client.client, ["hf", "gst", "list"])(args);
		},
		test: /**
		 * Perform Google Smart Tap self tests
		 *
		 * @example
		 * hf gst test
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "gst", "test"])([]);
		},
		info: /**
		 * Select OSE / Smart Tap applet and print capabilities
		 *
		 * @param {Object} [options] - Options object
		 * @param {string} [options.selectSmartTap2] - Whether to perform Smart Tap applet select (auto|yes|no, default: auto)
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 *
		 * @example
		 * hf gst info
		 * hf gst info --select-smarttap2 yes -a
		 * @returns {Promise<string>} Command output
		 */
		async ({ selectSmartTap2, showApdu } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (selectSmartTap2 !== undefined && selectSmartTap2 !== null) args.push("--select-smarttap2", String(selectSmartTap2));
			if (showApdu) args.push("--apdu");
			return command(client.client, ["hf", "gst", "info"])(args);
		},
		read: /**
		 * Execute Google Smart Tap read flow and print parsed pass objects
		 *
		 * @param {Object} options - Options object
		 * @param {string} options.collectorId - Collector identifier (32-bit value, hex or decimal)
		 * @param {string} options.readerPrivateKey - Reader private key: PEM, DER hex, scalar hex/base64, or file path
		 * @param {string} [options.keyVersion] - Long-term key version (hex or decimal, default: 1)
		 * @param {string} [options.sessionId] - Session id (8 bytes hex, random if omitted)
		 * @param {string} [options.readerNonce] - Reader nonce (32 bytes hex, random if omitted)
		 * @param {string} [options.ephemeralPrivateKey] - Reader ephemeral private key (32 bytes hex, random if omitted)
		 * @param {string} [options.mode] - Reader mode (pass-only|payment-only|pass-and-payment|pass-over-payment, default: pass-over-payment)
		 * @param {string} [options.selectSmartTap2] - Whether to perform Smart Tap applet select (auto|yes|no, default: auto)
		 * @param {boolean} [options.noLiveAuth] - Use zeroed handset nonce for reader signature
		 * @param {boolean} [options.continuous] - Continuous mode
		 * @param {boolean} [options.showApdu] - Show APDU requests and responses
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf gst read --cid 20180608 --rpk gst.google.der
		 * hf gst read --cid 20180608 --rpk gst.google.der -@
		 * @returns {Promise<string>} Command output
		 */
		async ({ collectorId, readerPrivateKey, keyVersion, sessionId, readerNonce, ephemeralPrivateKey, mode, selectSmartTap2, noLiveAuth, continuous, showApdu, verbose }) => {
			const client = await clientPromise;
			const args = [];
			args.push("--collector-id", String(collectorId));
			args.push("--reader-private-key", String(readerPrivateKey));
			if (keyVersion !== undefined && keyVersion !== null) args.push("--key-version", String(keyVersion));
			if (sessionId !== undefined && sessionId !== null) args.push("--session-id", String(sessionId));
			if (readerNonce !== undefined && readerNonce !== null) args.push("--reader-nonce", String(readerNonce));
			if (ephemeralPrivateKey !== undefined && ephemeralPrivateKey !== null) args.push("--reader-ephemeral-private-key", String(ephemeralPrivateKey));
			if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
			if (selectSmartTap2 !== undefined && selectSmartTap2 !== null) args.push("--select-smarttap2", String(selectSmartTap2));
			if (noLiveAuth) args.push("--no-live-auth");
			if (continuous) args.push("-@");
			if (showApdu) args.push("--apdu");
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "gst", "read"])(args);
		},
	},

	ict: {
		credential: /**
		 * Read ICT sector from tag and decode
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * hf ict credential
		 * @returns {Promise<string>} Command output
		 */
		async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["hf", "ict", "credential"])(args);
		},
		info: /**
		 * Get info from ICT encoded credential tags (MIFARE Classic / DESfire)
		 *
		 * @example
		 * hf ict info
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "ict", "info"])([]);
		},
		list: /**
		 * List trace buffer for ICT (ISO 14443A) protocol annotations
		 *
		 * @param {Object} [options] - Options object
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds instead of clock cycles
		 * @param {boolean} [options.hexdump] - Show hexdump to convert to pcap(ng)
		 * @param {string} [options.file] - Filename of dictionary
		 *
		 * @example
		 * hf ict list --frame
		 * hf ict list -1
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
			return command(client.client, ["hf", "ict", "list"])(args);
		},
		reader: /**
		 * Act as an ICT reader
		 *
		 * @example
		 * hf ict reader
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["hf", "ict", "reader"])([]);
		},
	},
});
