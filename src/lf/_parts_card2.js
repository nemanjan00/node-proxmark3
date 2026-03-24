const command = require("../command");

/**
 * LF card-specific command groups (part 2):
 * motorola, nedap, nexwatch, noralsy, pac, paradox, pcf7931, presco,
 * pyramid, securakey, ti, t55xx, viking, visa2000
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} LF card sub-command tree
 */
module.exports = (clientPromise) => ({

	// ==================== motorola ====================

	motorola: {
		clone: /**
		 * Clone a Motorola UID to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * Defaults to 64 bit format.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.raw - Raw hex bytes (8 bytes)
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.motorola.clone({ raw: "a0000000a0002021" });
		 * await lf.motorola.clone({ raw: "a0000000a0002021", tagType: "q5" });
		 * await lf.motorola.clone({ raw: "a0000000a0002021", tagType: "em" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--raw", String(raw));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "motorola", "clone"])(args);
		},

		demod: /**
		 * Try to find Motorola Flexpass preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.motorola.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "motorola", "demod"])([]);
		},

		reader: /**
		 * Read a Motorola Flexpass tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.motorola.reader();
		 * await lf.motorola.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "motorola", "reader"])(args);
		},

		sim: /**
		 * Simulate a Motorola card.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @example
		 * await lf.motorola.sim();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "motorola", "sim"])([]);
		},
	},

	// ==================== nedap ====================

	nedap: {
		clone: /**
		 * Clone a Nedap tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.customerCode - Customer code (0-4095)
		 * @param {number|string} options.id - ID (0-99999)
		 * @param {number|string} [options.subType] - Sub type (default 5)
		 * @param {boolean} [options.long] - Use long format (128 bit), default is short (64 bit)
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.nedap.clone({ customerCode: 101, id: 1337 });
		 * await lf.nedap.clone({ subType: 1, customerCode: 101, id: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ customerCode, id, subType, long: isLong, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (subType !== undefined && subType !== null) args.push("--st", String(subType));
			args.push("--cc", String(customerCode));
			args.push("--id", String(id));
			if (isLong) args.push("--long");
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "nedap", "clone"])(args);
		},

		demod: /**
		 * Try to find Nedap preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.nedap.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "nedap", "demod"])([]);
		},

		reader: /**
		 * Read a Nedap tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.nedap.reader();
		 * await lf.nedap.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "nedap", "reader"])(args);
		},

		sim: /**
		 * Simulate a Nedap card with specified parameters.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.customerCode - Customer code (0-4095)
		 * @param {number|string} options.id - ID (0-99999)
		 * @param {number|string} [options.subType] - Sub type (default 5)
		 * @param {boolean} [options.long] - Use long format (128 bit), default is short (64 bit)
		 *
		 * @example
		 * await lf.nedap.sim({ customerCode: 101, id: 1337 });
		 * await lf.nedap.sim({ subType: 1, customerCode: 101, id: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ customerCode, id, subType, long: isLong } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (subType !== undefined && subType !== null) args.push("--st", String(subType));
			args.push("--cc", String(customerCode));
			args.push("--id", String(id));
			if (isLong) args.push("--long");
			return command(client.client, ["lf", "nedap", "sim"])(args);
		},
	},

	// ==================== nexwatch ====================

	nexwatch: {
		clone: /**
		 * Clone a NexWatch tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * You can use raw hex values or create a credential based on id, mode
		 * and type of credential (Nexkey / Quadrakey / Honeywell).
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex data (12 bytes)
		 * @param {number|string} [options.cardNumber] - Card ID
		 * @param {number|string} [options.mode] - Mode (0-15, defaults to 1)
		 * @param {string} [options.credentialType] - Credential type: "nexkey", "quadrakey", or "honeywell"
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 * @param {string} [options.magic] - Magic hex data (1 byte)
		 * @param {boolean} [options.psk2] - Write tag in PSK2 modulation
		 *
		 * @example
		 * await lf.nexwatch.clone({ raw: "5600000000213C9F8F150C00" });
		 * await lf.nexwatch.clone({ cardNumber: 521512301, mode: 1, credentialType: "nexkey" });
		 * await lf.nexwatch.clone({ cardNumber: 521512301, mode: 1, credentialType: "quadrakey" });
		 * await lf.nexwatch.clone({ cardNumber: 521512301, mode: 1, credentialType: "honeywell" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw, cardNumber, mode, credentialType, tagType, magic, psk2 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
			if (credentialType === "nexkey") args.push("--nc");
			else if (credentialType === "quadrakey") args.push("--qc");
			else if (credentialType === "honeywell") args.push("--hc");
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			if (magic !== undefined && magic !== null) args.push("--magic", String(magic));
			if (psk2) args.push("--psk2");
			return command(client.client, ["lf", "nexwatch", "clone"])(args);
		},

		demod: /**
		 * Try to find NexWatch preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.nexwatch.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "nexwatch", "demod"])([]);
		},

		reader: /**
		 * Read a NexWatch tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.nexwatch.reader();
		 * await lf.nexwatch.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "nexwatch", "reader"])(args);
		},

		sim: /**
		 * Simulate a NexWatch card.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 * You can use raw hex values or create a credential based on id, mode
		 * and type of credential (Nexkey / Quadrakey / Honeywell).
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex data (12 bytes)
		 * @param {number|string} [options.cardNumber] - Card ID
		 * @param {number|string} [options.mode] - Mode (0-15, defaults to 1)
		 * @param {string} [options.credentialType] - Credential type: "nexkey", "quadrakey", or "honeywell"
		 * @param {string} [options.magic] - Magic hex data (1 byte)
		 * @param {boolean} [options.psk2] - Use PSK2 modulation
		 *
		 * @example
		 * await lf.nexwatch.sim({ raw: "5600000000213C9F8F150C00" });
		 * await lf.nexwatch.sim({ cardNumber: 521512301, mode: 1, credentialType: "nexkey" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw, cardNumber, mode, credentialType, magic, psk2 } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
			if (credentialType === "nexkey") args.push("--nc");
			else if (credentialType === "quadrakey") args.push("--qc");
			else if (credentialType === "honeywell") args.push("--hc");
			if (magic !== undefined && magic !== null) args.push("--magic", String(magic));
			if (psk2) args.push("--psk2");
			return command(client.client, ["lf", "nexwatch", "sim"])(args);
		},
	},

	// ==================== noralsy ====================

	noralsy: {
		clone: /**
		 * Clone a Noralsy tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.cardNumber - Noralsy card ID
		 * @param {number|string} [options.year] - Tag allocation year
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.noralsy.clone({ cardNumber: 112233 });
		 * await lf.noralsy.clone({ cardNumber: 112233, tagType: "q5" });
		 * await lf.noralsy.clone({ cardNumber: 112233, tagType: "em" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber, year, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--cn", String(cardNumber));
			if (year !== undefined && year !== null) args.push("--year", String(year));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "noralsy", "clone"])(args);
		},

		demod: /**
		 * Try to find Noralsy preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.noralsy.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "noralsy", "demod"])([]);
		},

		reader: /**
		 * Read a Noralsy tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.noralsy.reader();
		 * await lf.noralsy.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "noralsy", "reader"])(args);
		},

		sim: /**
		 * Simulate a Noralsy card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.cardNumber - Noralsy card ID
		 * @param {number|string} [options.year] - Tag allocation year
		 *
		 * @example
		 * await lf.noralsy.sim({ cardNumber: 1337 });
		 * await lf.noralsy.sim({ cardNumber: 1337, year: 2010 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber, year } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--cn", String(cardNumber));
			if (year !== undefined && year !== null) args.push("--year", String(year));
			return command(client.client, ["lf", "noralsy", "sim"])(args);
		},
	},

	// ==================== pac ====================

	pac: {
		clone: /**
		 * Clone a PAC/Stanley tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.cardNumber] - 8 byte PAC/Stanley card ID
		 * @param {string} [options.raw] - Raw hex data (16 bytes max)
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.pac.clone({ cardNumber: "CD4F5552" });
		 * await lf.pac.clone({ cardNumber: "CD4F5552", tagType: "q5" });
		 * await lf.pac.clone({ raw: "FF2049906D8511C593155B56D5B2649F" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber, raw, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "pac", "clone"])(args);
		},

		demod: /**
		 * Try to find PAC/Stanley preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.pac.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "pac", "demod"])([]);
		},

		reader: /**
		 * Read a PAC/Stanley tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.pac.reader();
		 * await lf.pac.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "pac", "reader"])(args);
		},

		sim: /**
		 * Simulate a PAC/Stanley card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 * The card ID is 8 byte number. Larger values are truncated.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.cardNumber] - 8 byte PAC/Stanley card ID
		 * @param {string} [options.raw] - Raw hex data (16 bytes max)
		 *
		 * @example
		 * await lf.pac.sim({ cardNumber: "CD4F5552" });
		 * await lf.pac.sim({ raw: "FF2049906D8511C593155B56D5B2649F" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber, raw } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			return command(client.client, ["lf", "pac", "sim"])(args);
		},
	},

	// ==================== paradox ====================

	paradox: {
		clone: /**
		 * Clone a Paradox tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex data (12 bytes max)
		 * @param {number|string} [options.facilityCode] - Facility code
		 * @param {number|string} [options.cardNumber] - Card number
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.paradox.clone({ facilityCode: 96, cardNumber: 40426 });
		 * await lf.paradox.clone({ raw: "0f55555695596a6a9999a59a" });
		 * await lf.paradox.clone({ raw: "0f55555695596a6a9999a59a", tagType: "q5" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw, facilityCode, cardNumber, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (facilityCode !== undefined && facilityCode !== null) args.push("--fc", String(facilityCode));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "paradox", "clone"])(args);
		},

		demod: /**
		 * Try to find Paradox preamble, if found decode / descramble data.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.old] - Display previous checksum version
		 *
		 * @example
		 * await lf.paradox.demod();
		 * await lf.paradox.demod({ old: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ old: useOld } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (useOld) args.push("--old");
			return command(client.client, ["lf", "paradox", "demod"])(args);
		},

		reader: /**
		 * Read a Paradox tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 * @param {boolean} [options.old] - Display previous checksum version
		 *
		 * @example
		 * await lf.paradox.reader();
		 * await lf.paradox.reader({ continuous: true });
		 * await lf.paradox.reader({ old: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous, old: useOld } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			if (useOld) args.push("--old");
			return command(client.client, ["lf", "paradox", "reader"])(args);
		},

		sim: /**
		 * Simulate a Paradox card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex data (12 bytes)
		 * @param {number|string} [options.facilityCode] - Facility code
		 * @param {number|string} [options.cardNumber] - Card number
		 *
		 * @example
		 * await lf.paradox.sim({ raw: "0f55555695596a6a9999a59a" });
		 * await lf.paradox.sim({ facilityCode: 96, cardNumber: 40426 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw, facilityCode, cardNumber } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (facilityCode !== undefined && facilityCode !== null) args.push("--fc", String(facilityCode));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			return command(client.client, ["lf", "paradox", "sim"])(args);
		},
	},

	// ==================== pcf7931 ====================

	pcf7931: {
		config: /**
		 * Set or get PCF7931 configuration used with PCF7931 commands.
		 * The time offsets can correct slew rate generated by the antenna.
		 * Calling without parameters will print the current configuration.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.reset] - Reset configuration to default values
		 * @param {string} [options.password] - Password, 7 bytes, LSB-order (hex)
		 * @param {number|string} [options.delay] - Tag initialization delay (in us)
		 * @param {number|string} [options.lowWidth] - Offset, low pulses width (in us)
		 * @param {number|string} [options.lowPosition] - Offset, low pulses position (in us)
		 *
		 * @example
		 * await lf.pcf7931.config();
		 * await lf.pcf7931.config({ reset: true });
		 * await lf.pcf7931.config({ password: "11223344556677", delay: 20000 });
		 * await lf.pcf7931.config({ password: "11223344556677", delay: 17500, lowWidth: -10, lowPosition: 30 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ reset, password, delay, lowWidth, lowPosition } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (reset) args.push("--reset");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (delay !== undefined && delay !== null) args.push("--delay", String(delay));
			if (lowWidth !== undefined && lowWidth !== null) args.push("--lw", String(lowWidth));
			if (lowPosition !== undefined && lowPosition !== null) args.push("--lp", String(lowPosition));
			return command(client.client, ["lf", "pcf7931", "config"])(args);
		},

		reader: /**
		 * Read a PCF7931 tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.pcf7931.reader();
		 * await lf.pcf7931.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "pcf7931", "reader"])(args);
		},

		write: /**
		 * Write a byte to a PCF7931 tag at a specific block and index.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.block - Block number (0-7)
		 * @param {number|string} options.index - Index of byte inside block (0-15)
		 * @param {string} options.data - One byte to be written (hex)
		 *
		 * @example
		 * await lf.pcf7931.write({ block: 2, index: 1, data: "FF" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, index, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			args.push("--idx", String(index));
			args.push("--data", String(data));
			return command(client.client, ["lf", "pcf7931", "write"])(args);
		},
	},

	// ==================== presco ====================

	presco: {
		clone: /**
		 * Clone a Presco tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.hex] - 8 digit hex card number
		 * @param {string} [options.cardId] - 9 digit Presco card ID
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.presco.clone({ cardId: "018363467" });
		 * await lf.presco.clone({ cardId: "018363467", tagType: "q5" });
		 * await lf.presco.clone({ cardId: "018363467", tagType: "em" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ hex, cardId, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (hex !== undefined && hex !== null) args.push("-c", String(hex));
			if (cardId !== undefined && cardId !== null) args.push("-d", String(cardId));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "presco", "clone"])(args);
		},

		demod: /**
		 * Try to find Presco preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.presco.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "presco", "demod"])([]);
		},

		reader: /**
		 * Read a Presco tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.presco.reader();
		 * await lf.presco.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "presco", "reader"])(args);
		},

		sim: /**
		 * Simulate a Presco card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 * Per Presco format, the card number is a 9 digit number and can contain *# chars.
		 * Larger values are truncated.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.hex] - 8 digit hex card number
		 * @param {string} [options.cardId] - 9 digit Presco card ID
		 *
		 * @example
		 * await lf.presco.sim({ cardId: "018363467" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ hex, cardId } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (hex !== undefined && hex !== null) args.push("-c", String(hex));
			if (cardId !== undefined && cardId !== null) args.push("-d", String(cardId));
			return command(client.client, ["lf", "presco", "sim"])(args);
		},
	},

	// ==================== pyramid ====================

	pyramid: {
		clone: /**
		 * Clone a Farpointe/Pyramid tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * The facility-code is 8-bit and the card number is 16-bit. Larger values are truncated.
		 * Currently only works on 26bit.
		 *
		 * @param {Object} [options] - Options
		 * @param {number|string} [options.facilityCode] - 8-bit facility code
		 * @param {number|string} [options.cardNumber] - 16-bit card number
		 * @param {string} [options.raw] - Raw hex data (16 bytes)
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.pyramid.clone({ facilityCode: 123, cardNumber: 11223 });
		 * await lf.pyramid.clone({ raw: "0001010101010101010440013223921c" });
		 * await lf.pyramid.clone({ facilityCode: 123, cardNumber: 11223, tagType: "q5" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ facilityCode, cardNumber, raw, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (facilityCode !== undefined && facilityCode !== null) args.push("--fc", String(facilityCode));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "pyramid", "clone"])(args);
		},

		demod: /**
		 * Try to find Farpointe/Pyramid preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.pyramid.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "pyramid", "demod"])([]);
		},

		reader: /**
		 * Read a Farpointe/Pyramid tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.pyramid.reader();
		 * await lf.pyramid.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "pyramid", "reader"])(args);
		},

		sim: /**
		 * Simulate a Farpointe/Pyramid card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 * The facility-code is 8-bit and the card number is 16-bit. Larger values are truncated.
		 * Currently works only on 26bit.
		 *
		 * @param {Object} [options] - Options
		 * @param {number|string} [options.facilityCode] - 8-bit facility code
		 * @param {number|string} [options.cardNumber] - 16-bit card number
		 * @param {string} [options.raw] - Raw hex data (16 bytes)
		 *
		 * @example
		 * await lf.pyramid.sim({ facilityCode: 123, cardNumber: 1337 });
		 * await lf.pyramid.sim({ raw: "0001010101010101010440013223921c" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ facilityCode, cardNumber, raw } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (facilityCode !== undefined && facilityCode !== null) args.push("--fc", String(facilityCode));
			if (cardNumber !== undefined && cardNumber !== null) args.push("--cn", String(cardNumber));
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			return command(client.client, ["lf", "pyramid", "sim"])(args);
		},
	},

	// ==================== securakey ====================

	securakey: {
		clone: /**
		 * Clone a Securakey tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.raw - Raw hex data (12 bytes)
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.securakey.clone({ raw: "7FCB400001ADEA5344300000" });
		 * await lf.securakey.clone({ raw: "7FCB400001ADEA5344300000", tagType: "q5" });
		 * await lf.securakey.clone({ raw: "7FCB400001ADEA5344300000", tagType: "em" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--raw", String(raw));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "securakey", "clone"])(args);
		},

		demod: /**
		 * Try to find Securakey preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.securakey.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "securakey", "demod"])([]);
		},

		reader: /**
		 * Read a Securakey tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.securakey.reader();
		 * await lf.securakey.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "securakey", "reader"])(args);
		},

		sim: /**
		 * Simulate a Securakey card.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex data (12 bytes)
		 *
		 * @example
		 * await lf.securakey.sim({ raw: "7FCB400001ADEA5344300000" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			return command(client.client, ["lf", "securakey", "sim"])(args);
		},
	},

	// ==================== ti ====================

	ti: {
		demod: /**
		 * Try to find TI preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.ti.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "ti", "demod"])([]);
		},

		reader: /**
		 * Read a TI tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.ti.reader();
		 * await lf.ti.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "ti", "reader"])(args);
		},

		write: /**
		 * Write to a r/w TI tag.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.raw - Raw hex data (8 bytes max)
		 * @param {string} [options.crc] - CRC value (hex)
		 *
		 * @example
		 * await lf.ti.write({ raw: "1122334455667788" });
		 * await lf.ti.write({ raw: "1122334455667788", crc: "1122" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ raw, crc } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--raw", String(raw));
			if (crc !== undefined && crc !== null) args.push("--crc", String(crc));
			return command(client.client, ["lf", "ti", "write"])(args);
		},
	},

	// ==================== t55xx ====================

	t55xx: {
		bruteforce: /**
		 * Bruteforce a T55xx password by scanning a number range.
		 * Try reading Page 0, block 7 before.
		 * WARNING: this may brick non-password protected chips!
		 *
		 * @param {Object} options - Options
		 * @param {string} options.start - Search start password (4 hex bytes)
		 * @param {string} options.end - Search end password (4 hex bytes)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding), "all" (try all, default)
		 *
		 * @example
		 * await lf.t55xx.bruteforce({ start: "aaaaaa77", end: "aaaaaa99" });
		 * await lf.t55xx.bruteforce({ start: "aaaaaa77", end: "aaaaaa99", downlink: "r2" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ start, end, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--start", String(start));
			args.push("--end", String(end));
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			else if (downlink === "all") args.push("--all");
			return command(client.client, ["lf", "t55xx", "bruteforce"])(args);
		},

		chk: /**
		 * Check T55xx tag password using a dictionary attack.
		 * For some cloners, try em option for known pwdgen algo.
		 * Try reading Page 0 block 7 before.
		 * WARNING: this may brick non-password protected chips!
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.flashMemory] - Use dictionary from flash memory (RDV4)
		 * @param {string} [options.file] - Dictionary file name
		 * @param {string} [options.em] - EM4100 ID for known pwdgen algo (5 hex bytes)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding), "all" (try all, default)
		 *
		 * @example
		 * await lf.t55xx.chk({ flashMemory: true });
		 * await lf.t55xx.chk({ file: "my_dictionary_pwds" });
		 * await lf.t55xx.chk({ em: "aa11223344" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ flashMemory, file, em, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (flashMemory) args.push("--fm");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (em !== undefined && em !== null) args.push("--em", String(em));
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			else if (downlink === "all") args.push("--all");
			return command(client.client, ["lf", "t55xx", "chk"])(args);
		},

		clonehelp: /**
		 * Display a list of available commands for cloning specific techs on T5xx tags.
		 *
		 * @example
		 * await lf.t55xx.clonehelp();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "t55xx", "clonehelp"])([]);
		},

		config: /**
		 * Set/Get T55XX configuration of the pm3 client.
		 * Configures modulation, inverted, offset, rate etc.
		 * Offset is start position to decode data.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.modulation] - Demodulation type: "FSK", "FSK1", "FSK1A", "FSK2", "FSK2A", "ASK", "PSK1", "PSK2", "PSK3", "NRZ", "BI", "BIA"
		 * @param {boolean} [options.inverted] - Set/reset data signal inversion
		 * @param {boolean} [options.q5] - Set/reset as Q5/T5555 chip instead of T55x7
		 * @param {boolean} [options.st] - Set/reset Sequence Terminator on
		 * @param {number|string} [options.rate] - Bitrate (8, 16, 32, 40, 50, 64, 100, or 128)
		 * @param {string} [options.block0] - Configuration from a block0 (4 hex bytes)
		 * @param {number|string} [options.offset] - Offset where data should start decode in bitstream (0-255)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.config({ modulation: "FSK" });
		 * await lf.t55xx.config({ modulation: "FSK", inverted: true });
		 * await lf.t55xx.config({ modulation: "FSK", inverted: true, offset: 3 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ modulation, inverted, q5, st, rate, block0, offset, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (modulation !== undefined && modulation !== null) args.push("--" + String(modulation));
			if (inverted) args.push("--inv");
			if (q5) args.push("--q5");
			if (st) args.push("--st");
			if (rate !== undefined && rate !== null) args.push("--rate", String(rate));
			if (block0 !== undefined && block0 !== null) args.push("--blk0", String(block0));
			if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "config"])(args);
		},

		dangerraw: /**
		 * Emit arbitrary raw commands on T5577 and cut the field after arbitrary duration.
		 * Uncontrolled usage can easily write an invalid configuration, activate lock bits,
		 * OTP bit, password protection bit, deactivate test-mode, lock your card forever.
		 * WARNING: this may lock definitively the tag in an unusable state!
		 *
		 * @param {Object} options - Options
		 * @param {string} options.data - Raw bit string
		 * @param {number|string} options.time - Time in microseconds before dropping the field (0-200000)
		 *
		 * @example
		 * await lf.t55xx.dangerraw({ data: "01000000000000010000100000000100000000", time: 3200 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ data, time } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--data", String(data));
			args.push("--time", String(time));
			return command(client.client, ["lf", "t55xx", "dangerraw"])(args);
		},

		detect: /**
		 * Try detecting the tag modulation from reading the configuration block.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.graphBuffer] - Extract using data from graphbuffer
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding), "all" (try all)
		 *
		 * @example
		 * await lf.t55xx.detect();
		 * await lf.t55xx.detect({ graphBuffer: true });
		 * await lf.t55xx.detect({ password: "11223344" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ graphBuffer, password, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (graphBuffer) args.push("-1");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			else if (downlink === "all") args.push("--all");
			return command(client.client, ["lf", "t55xx", "detect"])(args);
		},

		deviceconfig: /**
		 * Set T55x7 timings for direct commands.
		 * The timings are set in Field Clocks (FC), converted to microseconds on device.
		 *
		 * @param {Object} [options] - Options
		 * @param {number|string} [options.startGap] - Start gap (8-255)
		 * @param {number|string} [options.writeGap] - Write gap (8-255)
		 * @param {number|string} [options.writeZeroGap] - Write ZERO gap (8-255)
		 * @param {number|string} [options.writeOneGap] - Write ONE gap (8-255)
		 * @param {number|string} [options.readGap] - Read gap (8-255)
		 * @param {number|string} [options.writeTwoGap] - Write TWO gap, 1 of 4 only (8-255)
		 * @param {number|string} [options.writeThreeGap] - Write THREE gap, 1 of 4 only (8-255)
		 * @param {boolean} [options.persist] - Persist to flash memory (RDV4)
		 * @param {boolean} [options.defaults] - Set default T55x7 timings (use persist to save)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.deviceconfig({ startGap: 29, writeGap: 17, writeZeroGap: 15, writeOneGap: 47, readGap: 15 });
		 * await lf.t55xx.deviceconfig({ startGap: 55, writeGap: 14, writeZeroGap: 21, writeOneGap: 30 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ startGap, writeGap, writeZeroGap, writeOneGap, readGap, writeTwoGap, writeThreeGap, persist, defaults, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (startGap !== undefined && startGap !== null) args.push("-a", String(startGap));
			if (writeGap !== undefined && writeGap !== null) args.push("-b", String(writeGap));
			if (writeZeroGap !== undefined && writeZeroGap !== null) args.push("-c", String(writeZeroGap));
			if (writeOneGap !== undefined && writeOneGap !== null) args.push("-d", String(writeOneGap));
			if (readGap !== undefined && readGap !== null) args.push("-e", String(readGap));
			if (writeTwoGap !== undefined && writeTwoGap !== null) args.push("-f", String(writeTwoGap));
			if (writeThreeGap !== undefined && writeThreeGap !== null) args.push("-g", String(writeThreeGap));
			if (persist) args.push("--persist");
			if (defaults) args.push("-z");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "deviceconfig"])(args);
		},

		dump: /**
		 * Dump a T55xx card Page 0 block 0-7.
		 * Creates two files (bin/json).
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Filename (default is generated from blk 0)
		 * @param {boolean} [options.override] - Override, force pwd read despite danger to card
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {boolean} [options.noSave] - Do not save to file
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.dump();
		 * await lf.t55xx.dump({ password: "aabbccdd", override: true });
		 * await lf.t55xx.dump({ file: "my_lf_dump" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, override, password, noSave, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (override) args.push("--override");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (noSave) args.push("--ns");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "dump"])(args);
		},

		info: /**
		 * Show T55x7 configuration data (page 0 / blk 0) from reading the configuration block.
		 * Use block0 to specify config block data instead of reading from tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.graphBuffer] - Extract using data from graphbuffer
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {string} [options.block0] - Use these data instead of reading tag (4 hex bytes)
		 * @param {boolean} [options.q5] - Interpret provided data as T5555/Q5 config
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.info();
		 * await lf.t55xx.info({ graphBuffer: true });
		 * await lf.t55xx.info({ password: "11223344" });
		 * await lf.t55xx.info({ block0: "00083040" });
		 * await lf.t55xx.info({ block0: "6001805A", q5: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ graphBuffer, password, block0, q5, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (graphBuffer) args.push("-1");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (block0 !== undefined && block0 !== null) args.push("--blk0", String(block0));
			if (q5) args.push("--q5");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "info"])(args);
		},

		p1detect: /**
		 * Detect Page 1 of a T55xx chip.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.graphBuffer] - Extract using data from graphbuffer
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.p1detect();
		 * await lf.t55xx.p1detect({ graphBuffer: true });
		 * await lf.t55xx.p1detect({ password: "11223344", downlink: "r3" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ graphBuffer, password, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (graphBuffer) args.push("-1");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "p1detect"])(args);
		},

		protect: /**
		 * Set the password bit on T5577.
		 * WARNING: this locks the tag!
		 *
		 * @param {Object} options - Options
		 * @param {string} options.newPassword - New password (4 hex bytes)
		 * @param {boolean} [options.override] - Override safety check
		 * @param {string} [options.password] - Current password (4 hex bytes)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.protect({ newPassword: "01020304" });
		 * await lf.t55xx.protect({ password: "11223344", newPassword: "00000000" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ newPassword, override, password, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (override) args.push("--override");
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			args.push("--new", String(newPassword));
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "protect"])(args);
		},

		read: /**
		 * Read T55xx block data. Defaults to page 0.
		 * WARNING: Use of read with password on a tag not configured
		 * for a password can damage the tag.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.block - Block number to read (0-7)
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {boolean} [options.override] - Override safety check
		 * @param {boolean} [options.page1] - Read page 1
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.read({ block: 0 });
		 * await lf.t55xx.read({ block: 0, password: "01020304" });
		 * await lf.t55xx.read({ block: 0, password: "01020304", override: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, password, override, page1, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (override) args.push("--override");
			if (page1) args.push("--pg1");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "read"])(args);
		},

		recoverpw: /**
		 * Try to recover a mangled T55xx password using several tricks.
		 * Try reading Page 0, block 7 before.
		 * WARNING: this may brick non-password protected chips!
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding), "all" (try all, default)
		 *
		 * @example
		 * await lf.t55xx.recoverpw();
		 * await lf.t55xx.recoverpw({ password: "11223344" });
		 * await lf.t55xx.recoverpw({ password: "11223344", downlink: "r3" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			else if (downlink === "all") args.push("--all");
			return command(client.client, ["lf", "t55xx", "recoverpw"])(args);
		},

		resetread: /**
		 * Send Reset command then read the LF stream to attempt to identify
		 * the start of it. Needs a demod and/or plot after.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.graphBuffer] - Extract using data from graphbuffer
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.resetread();
		 * @returns {Promise<string>} Command output
		 */
		async ({ graphBuffer, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (graphBuffer) args.push("-1");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "resetread"])(args);
		},

		restore: /**
		 * Restore T55xx card page 0/1 n blocks from a dump file (bin/eml/json).
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Filename of dump file
		 * @param {string} [options.password] - Password if target card has password set (4 hex bytes)
		 *
		 * @example
		 * await lf.t55xx.restore({ file: "lf-t55xx-00148040-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, password } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			return command(client.client, ["lf", "t55xx", "restore"])(args);
		},

		sniff: /**
		 * Sniff LF T55xx based traffic and decode possible cmd / blocks.
		 * Lower tolerance means tighter pulses.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.graphBuffer] - Extract using data from graphbuffer
		 * @param {number|string} [options.tolerance] - Tolerance level (default 5)
		 * @param {number|string} [options.oneWidth] - Samples width for ONE pulse (default auto)
		 * @param {number|string} [options.zeroWidth] - Samples width for ZERO pulse (default auto)
		 *
		 * @example
		 * await lf.t55xx.sniff();
		 * await lf.t55xx.sniff({ graphBuffer: true, tolerance: 2 });
		 * await lf.t55xx.sniff({ graphBuffer: true, zeroWidth: 7, oneWidth: 14 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ graphBuffer, tolerance, oneWidth, zeroWidth } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (graphBuffer) args.push("-1");
			if (tolerance !== undefined && tolerance !== null) args.push("--tol", String(tolerance));
			if (oneWidth !== undefined && oneWidth !== null) args.push("--one", String(oneWidth));
			if (zeroWidth !== undefined && zeroWidth !== null) args.push("--zero", String(zeroWidth));
			return command(client.client, ["lf", "t55xx", "sniff"])(args);
		},

		special: /**
		 * Show block changes with 64 different offsets.
		 * Data taken from DemodBuffer.
		 *
		 * @example
		 * await lf.t55xx.special();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "t55xx", "special"])([]);
		},

		trace: /**
		 * Show T55x7 traceability data (page 1 / blk 0-1) from reading the tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.graphBuffer] - Extract using data from graphbuffer
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.trace();
		 * await lf.t55xx.trace({ graphBuffer: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ graphBuffer, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (graphBuffer) args.push("-1");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "trace"])(args);
		},

		view: /**
		 * Print a T55xx dump file (bin/eml/json).
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Dump file path
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await lf.t55xx.view({ file: "lf-t55xx-00000000-11111111-22222222-33333333-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["lf", "t55xx", "view"])(args);
		},

		wakeup: /**
		 * Send the Answer-On-Request command and leave the reader field ON afterwards.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {boolean} [options.verbose] - Verbose output
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.wakeup({ password: "11223344" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ password, verbose, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (verbose) args.push("--verbose");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "wakeup"])(args);
		},

		wipe: /**
		 * Wipe a T55xx tag, filling blocks 1-7 with zeros and a default configuration block.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.config] - Configuration block0 (4 hex bytes)
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {boolean} [options.q5] - Specify writing to Q5/T5555 tag using dedicated config block
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.wipe();
		 * await lf.t55xx.wipe({ q5: true });
		 * await lf.t55xx.wipe({ password: "11223344" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ config, password, q5, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (config !== undefined && config !== null) args.push("--cfg", String(config));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (q5) args.push("--q5");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "wipe"])(args);
		},

		write: /**
		 * Write T55xx block data.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.block - Block number to write (0-7)
		 * @param {string} [options.data] - Data to write (4 hex bytes)
		 * @param {string} [options.password] - Password (4 hex bytes)
		 * @param {boolean} [options.testMode] - Test mode write (danger)
		 * @param {boolean} [options.page1] - Write page 1
		 * @param {boolean} [options.verify] - Try to validate data afterward
		 * @param {string} [options.downlink] - Downlink mode: "r0" (fixed bit length, default), "r1" (long leading ref), "r2" (leading zero), "r3" (1 of 4 coding)
		 *
		 * @example
		 * await lf.t55xx.write({ block: 3, data: "11223344" });
		 * await lf.t55xx.write({ block: 3, data: "11223344", password: "01020304" });
		 * await lf.t55xx.write({ block: 3, data: "11223344", password: "01020304", verify: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ block, data, password, testMode, page1, verify, downlink } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--blk", String(block));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			if (password !== undefined && password !== null) args.push("--pwd", String(password));
			if (testMode) args.push("--tm");
			if (page1) args.push("--pg1");
			if (verify) args.push("--verify");
			if (downlink === "r0") args.push("--r0");
			else if (downlink === "r1") args.push("--r1");
			else if (downlink === "r2") args.push("--r2");
			else if (downlink === "r3") args.push("--r3");
			return command(client.client, ["lf", "t55xx", "write"])(args);
		},
	},

	// ==================== viking ====================

	viking: {
		clone: /**
		 * Clone a Viking AM tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.cardNumber - 8 digit hex Viking card number
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.viking.clone({ cardNumber: "01A337" });
		 * await lf.viking.clone({ cardNumber: "01A337", tagType: "q5" });
		 * await lf.viking.clone({ cardNumber: "112233", tagType: "em" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--cn", String(cardNumber));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "viking", "clone"])(args);
		},

		demod: /**
		 * Try to find Viking AM preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.viking.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "viking", "demod"])([]);
		},

		reader: /**
		 * Read a Viking AM tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.viking.reader();
		 * await lf.viking.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "viking", "reader"])(args);
		},

		sim: /**
		 * Simulate a Viking card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 * Per Viking format, the card number is 8 digit hex number. Larger values are truncated.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.cardNumber - 8 digit hex Viking card number
		 *
		 * @example
		 * await lf.viking.sim({ cardNumber: "01A337" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--cn", String(cardNumber));
			return command(client.client, ["lf", "viking", "sim"])(args);
		},
	},

	// ==================== visa2000 ====================

	visa2000: {
		clone: /**
		 * Clone a Visa2000 tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.cardNumber - Visa2000 card ID
		 * @param {string} [options.tagType] - Target tag type: "q5" for Q5/T5555, "em" for EM4305/4469 (default: T55x7)
		 *
		 * @example
		 * await lf.visa2000.clone({ cardNumber: 112233 });
		 * await lf.visa2000.clone({ cardNumber: 112233, tagType: "q5" });
		 * await lf.visa2000.clone({ cardNumber: 112233, tagType: "em" });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber, tagType } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--cn", String(cardNumber));
			if (tagType === "q5") args.push("--q5");
			else if (tagType === "em") args.push("--em");
			return command(client.client, ["lf", "visa2000", "clone"])(args);
		},

		demod: /**
		 * Try to find Visa2000 preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.visa2000.demod();
		 * @returns {Promise<string>} Command output
		 */
		async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "visa2000", "demod"])([]);
		},

		reader: /**
		 * Read a Visa2000 tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Enable continuous reader mode
		 *
		 * @example
		 * await lf.visa2000.reader();
		 * await lf.visa2000.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "visa2000", "reader"])(args);
		},

		sim: /**
		 * Simulate a Visa2000 card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.cardNumber - Visa2000 card ID
		 *
		 * @example
		 * await lf.visa2000.sim({ cardNumber: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		async ({ cardNumber } = {}) => {
			const client = await clientPromise;
			const args = [];
			args.push("--cn", String(cardNumber));
			return command(client.client, ["lf", "visa2000", "sim"])(args);
		},
	},
});
