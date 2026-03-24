const command = require("../command");

/**
 * LF card-specific command stubs for AWID, COTAG, Destron, EM, FDX-B,
 * Gallagher, G-Prox II, HID, Hitag, Idteck, Indala, ioProx, Jablotron, KERI.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} LF card sub-command tree
 */
module.exports = (clientPromise) => ({

	// ==================== AWID ====================

	awid: {
		/**
		 * Try to find AWID Prox preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.awid.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "awid", "demod"])([]);
		},

		/**
		 * Read an AWID Prox tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.awid.reader();
		 * await lf.awid.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "awid", "reader"])(args);
		},

		/**
		 * Clone an AWID Prox tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.fmt - Format length 26|34|37|50
		 * @param {number|string} options.fc - 8|16-bit facility code
		 * @param {number|string} options.cn - 16|32-bit card number
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.awid.clone({ fmt: 26, fc: 123, cn: 1337 });
		 * await lf.awid.clone({ fmt: 26, fc: 123, cn: 1337, q5: true });
		 * await lf.awid.clone({ fmt: 26, fc: 123, cn: 1337, em: true });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ fmt, fc, cn, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (fmt !== undefined && fmt !== null) args.push("--fmt", String(fmt));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "awid", "clone"])(args);
		},

		/**
		 * Simulate an AWID card with specified facility code and card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.fmt - Format length 26|32|36|40
		 * @param {number|string} options.fc - 8-bit facility code
		 * @param {number|string} options.cn - 16-bit card number
		 *
		 * @example
		 * await lf.awid.sim({ fmt: 26, fc: 123, cn: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ fmt, fc, cn }) => {
			const client = await clientPromise;
			const args = [];
			if (fmt !== undefined && fmt !== null) args.push("--fmt", String(fmt));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			return command(client.client, ["lf", "awid", "sim"])(args);
		},

		/**
		 * Bruteforce AWID reader with specified facility code.
		 * Attack against reader. If card number is given, starts from it and goes up/down one step.
		 * If not given, starts with 1 and goes up to 65535.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.fmt - Format length 26|50
		 * @param {number|string} options.fc - 8|16-bit facility code
		 * @param {number|string} [options.cn] - Card number to start with, max 65535
		 * @param {number|string} [options.delay] - Delay between attempts in ms (default 1000)
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await lf.awid.brute({ fmt: 26, fc: 224 });
		 * await lf.awid.brute({ fmt: 50, fc: 2001, delay: 2000 });
		 * await lf.awid.brute({ fmt: 50, fc: 2001, cn: 200, delay: 2000, verbose: true });
		 * @returns {Promise<string>} Command output
		 */
		brute: async ({ fmt, fc, cn, delay, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (fmt !== undefined && fmt !== null) args.push("--fmt", String(fmt));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (delay !== undefined && delay !== null) args.push("--delay", String(delay));
			if (verbose) args.push("--verbose");
			return command(client.client, ["lf", "awid", "brute"])(args);
		},

		/**
		 * Enable AWID compatible reader mode printing details of scanned AWID26 or AWID50 tags.
		 * Runs until the button is pressed or another USB command is issued.
		 *
		 * @example
		 * await lf.awid.watch();
		 * @returns {Promise<string>} Command output
		 */
		watch: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "awid", "watch"])([]);
		},
	},

	// ==================== COTAG ====================

	cotag: {
		/**
		 * Try to find COTAG preamble, if found decode / descramble data.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await lf.cotag.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["lf", "cotag", "demod"])(args);
		},

		/**
		 * Read a COTAG tag. Current support for COTAG is limited.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.mode - Reader mode: "1" (HIGH/LOW signal), "2" (manchester translation), "3" (raw signal)
		 *
		 * @example
		 * await lf.cotag.reader({ mode: "2" });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ mode }) => {
			const client = await clientPromise;
			const args = [];
			if (mode !== undefined && mode !== null) args.push("-" + String(mode));
			return command(client.client, ["lf", "cotag", "reader"])(args);
		},
	},

	// ==================== DESTRON ====================

	destron: {
		/**
		 * Clone a Destron FDX-A tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.uid - UID, 5 hex bytes max
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.destron.clone({ uid: "1A2B3C4D5E" });
		 * await lf.destron.clone({ uid: "1A2B3C4D5E", q5: true });
		 * await lf.destron.clone({ uid: "1A2B3C4D5E", em: true });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ uid, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "destron", "clone"])(args);
		},

		/**
		 * Try to find Destron preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.destron.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "destron", "demod"])([]);
		},

		/**
		 * Read a Destron FDX-A tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.destron.reader();
		 * await lf.destron.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "destron", "reader"])(args);
		},

		/**
		 * Simulate a Destron FDX-A tag.
		 *
		 * @example
		 * await lf.destron.sim();
		 * @returns {Promise<string>} Command output
		 */
		sim: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "destron", "sim"])([]);
		},
	},

	// ==================== EM (nested sub-groups) ====================

	em: {
		// -------------------- EM 410x --------------------
		"410x": {
			/**
			 * Bruteforce by emulating EM 410x tags from a file of IDs.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.file - File with EM Tag IDs, one ID per line
			 * @param {number|string} [options.clk] - Clock: 32 or 64 (default 64)
			 * @param {number|string} [options.delay] - Pause delay in ms between UID simulations (default 1000)
			 * @param {number|string} [options.gap] - Gap (0's) between ID repeats (default 20)
			 *
			 * @example
			 * await lf.em["410x"].brute({ file: "ids.txt" });
			 * await lf.em["410x"].brute({ file: "ids.txt", clk: 32, delay: 3000 });
			 * @returns {Promise<string>} Command output
			 */
			brute: async ({ file, clk, delay, gap } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (clk !== undefined && clk !== null) args.push("--clk", String(clk));
				if (delay !== undefined && delay !== null) args.push("--delay", String(delay));
				if (gap !== undefined && gap !== null) args.push("--gap", String(gap));
				return command(client.client, ["lf", "em", "410x", "brute"])(args);
			},

			/**
			 * Clone an EM410x ID to a T55x7, Q5/T5555, EM4305/4469, Hitag S/8211/8268/8310 or Hitag u/8265 tag.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.id - EM Tag ID number (5 hex bytes)
			 * @param {number|string} [options.clk] - Clock: 16|32|40|64 (default 64)
			 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
			 * @param {boolean} [options.em] - Write to EM4305/4469 tag
			 * @param {boolean} [options.hts] - Write to Hitag S/8211/8268/8310 tag
			 * @param {boolean} [options.htu] - Write to Hitag u/8265 tag
			 * @param {boolean} [options.electra] - Add Electra blocks to tag
			 *
			 * @example
			 * await lf.em["410x"].clone({ id: "0F0368568B" });
			 * await lf.em["410x"].clone({ id: "0F0368568B", q5: true });
			 * await lf.em["410x"].clone({ id: "0F0368568B", hts: true });
			 * @returns {Promise<string>} Command output
			 */
			clone: async ({ id, clk, q5, em, hts, htu, electra } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (id !== undefined && id !== null) args.push("--id", String(id));
				if (clk !== undefined && clk !== null) args.push("--clk", String(clk));
				if (q5) args.push("--q5");
				if (em) args.push("--em");
				if (hts) args.push("--hts");
				if (htu) args.push("--htu");
				if (electra) args.push("--electra");
				return command(client.client, ["lf", "em", "410x", "clone"])(args);
			},

			/**
			 * Try to find EM 410x preamble, if found decode / descramble data.
			 *
			 * @param {Object} [options] - Options
			 * @param {number|string} [options.clk] - Clock (default autodetect)
			 * @param {number|string} [options.err] - Maximum allowed errors (default 100)
			 * @param {number|string} [options.len] - Maximum length
			 * @param {boolean} [options.invert] - Invert output
			 * @param {boolean} [options.amp] - Amplify signal
			 * @param {string} [options.bin] - Binary string (e.g. "0001001001")
			 *
			 * @example
			 * await lf.em["410x"].demod();
			 * await lf.em["410x"].demod({ clk: 32, invert: true });
			 * @returns {Promise<string>} Command output
			 */
			demod: async ({ clk, err, len, invert, amp, bin } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (clk !== undefined && clk !== null) args.push("--clk", String(clk));
				if (err !== undefined && err !== null) args.push("--err", String(err));
				if (len !== undefined && len !== null) args.push("--len", String(len));
				if (invert) args.push("--invert");
				if (amp) args.push("--amp");
				if (bin !== undefined && bin !== null) args.push("--bin", String(bin));
				return command(client.client, ["lf", "em", "410x", "demod"])(args);
			},

			/**
			 * Read an EM 410x tag.
			 *
			 * @param {Object} [options] - Options
			 * @param {number|string} [options.clk] - Clock (default autodetect)
			 * @param {number|string} [options.err] - Maximum allowed errors (default 100)
			 * @param {number|string} [options.len] - Maximum length
			 * @param {boolean} [options.invert] - Invert output
			 * @param {boolean} [options.amp] - Amplify signal
			 * @param {boolean} [options.breakOnFirst] - Break on first found
			 * @param {boolean} [options.continuous] - Continuous reader mode
			 * @param {boolean} [options.verbose] - Verbose output
			 *
			 * @example
			 * await lf.em["410x"].reader();
			 * await lf.em["410x"].reader({ continuous: true });
			 * await lf.em["410x"].reader({ clk: 32, invert: true });
			 * @returns {Promise<string>} Command output
			 */
			reader: async ({ clk, err, len, invert, amp, breakOnFirst, continuous, verbose } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (clk !== undefined && clk !== null) args.push("--clk", String(clk));
				if (err !== undefined && err !== null) args.push("--err", String(err));
				if (len !== undefined && len !== null) args.push("--len", String(len));
				if (invert) args.push("--invert");
				if (amp) args.push("--amp");
				if (breakOnFirst) args.push("-b");
				if (continuous) args.push("-@");
				if (verbose) args.push("--verbose");
				return command(client.client, ["lf", "em", "410x", "reader"])(args);
			},

			/**
			 * Simulate an EM 410x card.
			 * Simulation runs until the button is pressed or another USB command is issued.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.id - EM Tag ID number (5 hex bytes)
			 * @param {number|string} [options.clk] - Clock: 32|64 (default 64)
			 * @param {number|string} [options.gap] - Gap (0's) between ID repeats (default 0)
			 *
			 * @example
			 * await lf.em["410x"].sim({ id: "0F0368568B" });
			 * await lf.em["410x"].sim({ id: "0F0368568B", clk: 32 });
			 * @returns {Promise<string>} Command output
			 */
			sim: async ({ id, clk, gap } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (id !== undefined && id !== null) args.push("--id", String(id));
				if (clk !== undefined && clk !== null) args.push("--clk", String(clk));
				if (gap !== undefined && gap !== null) args.push("--gap", String(gap));
				return command(client.client, ["lf", "em", "410x", "sim"])(args);
			},

			/**
			 * Watch 'nd Spoof: activates reader, waits until an EM 410x tag is presented,
			 * then starts simulating the found EM Tag ID.
			 *
			 * @example
			 * await lf.em["410x"].spoof();
			 * @returns {Promise<string>} Command output
			 */
			spoof: async () => {
				const client = await clientPromise;
				return command(client.client, ["lf", "em", "410x", "spoof"])([]);
			},

			/**
			 * Enable Electro Marine (EM) compatible reader mode printing details of scanned tags.
			 * Runs until the button is pressed or another USB command is issued.
			 *
			 * @example
			 * await lf.em["410x"].watch();
			 * @returns {Promise<string>} Command output
			 */
			watch: async () => {
				const client = await clientPromise;
				return command(client.client, ["lf", "em", "410x", "watch"])([]);
			},
		},

		// -------------------- EM 4x05 --------------------
		"4x05": {
			/**
			 * Bruteforce the password of a EM4205/4305/4469/4569.
			 * The loop runs on the device side; press the Proxmark3 button to abort.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.start] - Start bruteforce from this password value (hex)
			 * @param {number|string} [options.n] - Stop after finding n candidates (0 = infinite, default 0)
			 *
			 * @example
			 * await lf.em["4x05"].brute();
			 * await lf.em["4x05"].brute({ start: "00000000" });
			 * @returns {Promise<string>} Command output
			 */
			brute: async ({ start, n } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (start !== undefined && start !== null) args.push("--start", String(start));
				if (n !== undefined && n !== null) args.push("-n", String(n));
				return command(client.client, ["lf", "em", "4x05", "brute"])(args);
			},

			/**
			 * Dictionary attack against EM4205/4305/4469/4569.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.file] - Dictionary file (*.dic)
			 * @param {string} [options.emPwd] - Try calculated password from some cloners based on EM4100 ID
			 *
			 * @example
			 * await lf.em["4x05"].chk();
			 * await lf.em["4x05"].chk({ emPwd: "000022B8" });
			 * await lf.em["4x05"].chk({ file: "t55xx_default_pwds" });
			 * @returns {Promise<string>} Command output
			 */
			chk: async ({ file, emPwd } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (emPwd !== undefined && emPwd !== null) args.push("--em", String(emPwd));
				return command(client.client, ["lf", "em", "4x05", "chk"])(args);
			},

			/**
			 * Display a list of available commands for cloning specific techs on EM4305/4469 tags.
			 *
			 * @example
			 * await lf.em["4x05"].clonehelp();
			 * @returns {Promise<string>} Command output
			 */
			clonehelp: async () => {
				const client = await clientPromise;
				return command(client.client, ["lf", "em", "4x05", "clonehelp"])([]);
			},

			/**
			 * Create common configuration blocks for EM4x05.
			 *
			 * @example
			 * await lf.em["4x05"].config();
			 * @returns {Promise<string>} Command output
			 */
			config: async () => {
				const client = await clientPromise;
				return command(client.client, ["lf", "em", "4x05", "config"])([]);
			},

			/**
			 * Try to find EM 4x05 preamble, if found decode / descramble data.
			 *
			 * @example
			 * await lf.em["4x05"].demod();
			 * @returns {Promise<string>} Command output
			 */
			demod: async () => {
				const client = await clientPromise;
				return command(client.client, ["lf", "em", "4x05", "demod"])([]);
			},

			/**
			 * Dump EM4x05/EM4x69 tag memory. Tag must be on the antenna.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.pwd] - Password (4 hex bytes, e.g. "00000000")
			 * @param {string} [options.file] - Override filename prefix (default based on UID)
			 * @param {boolean} [options.ns] - No save to file
			 *
			 * @example
			 * await lf.em["4x05"].dump();
			 * await lf.em["4x05"].dump({ pwd: "11223344" });
			 * await lf.em["4x05"].dump({ file: "myfile", pwd: "11223344" });
			 * @returns {Promise<string>} Command output
			 */
			dump: async ({ pwd, file, ns } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (ns) args.push("--ns");
				return command(client.client, ["lf", "em", "4x05", "dump"])(args);
			},

			/**
			 * Tag information for EM4205/4305/4469/4569 tags. Tag must be on the antenna.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.pwd] - Password (4 hex bytes)
			 * @param {boolean} [options.verbose] - Verbose output
			 *
			 * @example
			 * await lf.em["4x05"].info();
			 * await lf.em["4x05"].info({ pwd: "11223344" });
			 * @returns {Promise<string>} Command output
			 */
			info: async ({ pwd, verbose } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				if (verbose) args.push("--verbose");
				return command(client.client, ["lf", "em", "4x05", "info"])(args);
			},

			/**
			 * Read a single address from EM4x05/EM4x69. Tag must be on the antenna.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} options.addr - Memory address to read (0-15)
			 * @param {string} [options.pwd] - Password (4 hex bytes)
			 *
			 * @example
			 * await lf.em["4x05"].read({ addr: 1 });
			 * await lf.em["4x05"].read({ addr: 1, pwd: "11223344" });
			 * @returns {Promise<string>} Command output
			 */
			read: async ({ addr, pwd } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (addr !== undefined && addr !== null) args.push("--addr", String(addr));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				return command(client.client, ["lf", "em", "4x05", "read"])(args);
			},

			/**
			 * Sniff EM4x05 commands sent from a programmer.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.buf] - Use data already in the buffer
			 * @param {boolean} [options.rev] - Reverse the bit order for data blocks
			 *
			 * @example
			 * await lf.em["4x05"].sniff();
			 * await lf.em["4x05"].sniff({ buf: true });
			 * await lf.em["4x05"].sniff({ rev: true });
			 * @returns {Promise<string>} Command output
			 */
			sniff: async ({ buf, rev } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (buf) args.push("--buf");
				if (rev) args.push("--rev");
				return command(client.client, ["lf", "em", "4x05", "sniff"])(args);
			},

			/**
			 * Execute tear-off attack against EM4205/4305/4469/4569.
			 *
			 * @param {Object} [options] - Options
			 * @param {number|string} [options.n] - Steps to skip
			 * @param {number|string} [options.start] - Start scan from delay (us)
			 * @param {number|string} [options.end] - End scan at delay (us)
			 * @param {string} [options.pwd] - Password (default 00000000)
			 * @param {boolean} [options.verbose] - Verbose output
			 *
			 * @example
			 * await lf.em["4x05"].unlock();
			 * await lf.em["4x05"].unlock({ start: 4100, end: 4100 });
			 * await lf.em["4x05"].unlock({ n: 10, start: 3000, end: 4400 });
			 * @returns {Promise<string>} Command output
			 */
			unlock: async ({ n, start, end, pwd, verbose } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (n !== undefined && n !== null) args.push("-n", String(n));
				if (start !== undefined && start !== null) args.push("--start", String(start));
				if (end !== undefined && end !== null) args.push("--end", String(end));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				if (verbose) args.push("--verbose");
				return command(client.client, ["lf", "em", "4x05", "unlock"])(args);
			},

			/**
			 * Print a EM4205/4305/4369/4469 dump file.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.file - Dump filename
			 * @param {boolean} [options.verbose] - Verbose output
			 *
			 * @example
			 * await lf.em["4x05"].view({ file: "lf-4x05-01020304-dump.json" });
			 * @returns {Promise<string>} Command output
			 */
			view: async ({ file, verbose } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (verbose) args.push("--verbose");
				return command(client.client, ["lf", "em", "4x05", "view"])(args);
			},

			/**
			 * Wipe EM4x05/EM4x69 tag. Tag must be on the antenna.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.chipType] - Target chip type: "4205"|"4305"|"4369"|"4469" (default "4305")
			 * @param {string} [options.pwd] - Password (4 hex bytes)
			 *
			 * @example
			 * await lf.em["4x05"].wipe({ chipType: "4305", pwd: "11223344" });
			 * await lf.em["4x05"].wipe({ chipType: "4205" });
			 * @returns {Promise<string>} Command output
			 */
			wipe: async ({ chipType, pwd } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (chipType !== undefined && chipType !== null) args.push("--" + String(chipType));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				return command(client.client, ["lf", "em", "4x05", "wipe"])(args);
			},

			/**
			 * Write to EM4x05/EM4x69. Tag must be on the antenna.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} [options.addr] - Memory address to write to (0-13)
			 * @param {string} options.data - Data to write (4 hex bytes)
			 * @param {string} [options.pwd] - Password (4 hex bytes)
			 * @param {boolean} [options.po] - Protect operation
			 *
			 * @example
			 * await lf.em["4x05"].write({ addr: 1, data: "deadc0de" });
			 * await lf.em["4x05"].write({ addr: 1, pwd: "11223344", data: "deadc0de" });
			 * await lf.em["4x05"].write({ po: true, pwd: "11223344", data: "deadc0de" });
			 * @returns {Promise<string>} Command output
			 */
			write: async ({ addr, data, pwd, po } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (addr !== undefined && addr !== null) args.push("--addr", String(addr));
				if (data !== undefined && data !== null) args.push("--data", String(data));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				if (po) args.push("--po");
				return command(client.client, ["lf", "em", "4x05", "write"])(args);
			},
		},

		// -------------------- EM 4x50 --------------------
		"4x50": {
			/**
			 * Bruteforce the password of a EM4x50 card.
			 * Can be stopped by pressing the pm3 button.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.mode - Bruteforce mode: "range"|"charset"|"smart"
			 * @param {string} [options.begin] - Range mode - start of key range (hex)
			 * @param {string} [options.end] - Range mode - end of key range (hex)
			 * @param {boolean} [options.digits] - Charset mode - include ASCII codes for digits
			 * @param {boolean} [options.uppercase] - Charset mode - include ASCII codes for uppercase letters
			 *
			 * @example
			 * await lf.em["4x50"].brute({ mode: "range", begin: "12330000", end: "12340000" });
			 * await lf.em["4x50"].brute({ mode: "charset", digits: true, uppercase: true });
			 * await lf.em["4x50"].brute({ mode: "smart" });
			 * @returns {Promise<string>} Command output
			 */
			brute: async ({ mode, begin, end, digits, uppercase } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
				if (begin !== undefined && begin !== null) args.push("--begin", String(begin));
				if (end !== undefined && end !== null) args.push("--end", String(end));
				if (digits) args.push("--digits");
				if (uppercase) args.push("--uppercase");
				return command(client.client, ["lf", "em", "4x50", "brute"])(args);
			},

			/**
			 * Run dictionary key recovery against EM4x50 card.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.file] - Dictionary filename
			 *
			 * @example
			 * await lf.em["4x50"].chk();
			 * await lf.em["4x50"].chk({ file: "my.dic" });
			 * @returns {Promise<string>} Command output
			 */
			chk: async ({ file } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				return command(client.client, ["lf", "em", "4x50", "chk"])(args);
			},

			/**
			 * Read all blocks/words from EM4x50 tag and save dump in bin/json format.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.file] - Dump filename
			 * @param {string} [options.pwd] - Password (4 hex bytes, lsb)
			 * @param {boolean} [options.ns] - No save to file
			 *
			 * @example
			 * await lf.em["4x50"].dump();
			 * await lf.em["4x50"].dump({ file: "mydump", pwd: "12345678" });
			 * @returns {Promise<string>} Command output
			 */
			dump: async ({ file, pwd, ns } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				if (ns) args.push("--ns");
				return command(client.client, ["lf", "em", "4x50", "dump"])(args);
			},

			/**
			 * Load EM4x50 tag dump (bin/eml/json) into emulator memory on device.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.file - Dump filename
			 *
			 * @example
			 * await lf.em["4x50"].eload({ file: "mydump.bin" });
			 * @returns {Promise<string>} Command output
			 */
			eload: async ({ file }) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				return command(client.client, ["lf", "em", "4x50", "eload"])(args);
			},

			/**
			 * Save bin/json dump file of emulator memory.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.file] - Filename (default uses UID)
			 *
			 * @example
			 * await lf.em["4x50"].esave();
			 * await lf.em["4x50"].esave({ file: "mydump" });
			 * @returns {Promise<string>} Command output
			 */
			esave: async ({ file } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				return command(client.client, ["lf", "em", "4x50", "esave"])(args);
			},

			/**
			 * Display EM4x50 content of emulator memory.
			 *
			 * @example
			 * await lf.em["4x50"].eview();
			 * @returns {Promise<string>} Command output
			 */
			eview: async () => {
				const client = await clientPromise;
				return command(client.client, ["lf", "em", "4x50", "eview"])([]);
			},

			/**
			 * Tag information for EM4x50.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.pwd] - Password (4 hex bytes, lsb)
			 * @param {boolean} [options.verbose] - Verbose output
			 *
			 * @example
			 * await lf.em["4x50"].info();
			 * await lf.em["4x50"].info({ pwd: "12345678", verbose: true });
			 * @returns {Promise<string>} Command output
			 */
			info: async ({ pwd, verbose } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				if (verbose) args.push("--verbose");
				return command(client.client, ["lf", "em", "4x50", "info"])(args);
			},

			/**
			 * Login into EM4x50 tag.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.pwd - Password (4 hex bytes, lsb)
			 *
			 * @example
			 * await lf.em["4x50"].login({ pwd: "12345678" });
			 * @returns {Promise<string>} Command output
			 */
			login: async ({ pwd }) => {
				const client = await clientPromise;
				const args = [];
				if (pwd !== undefined && pwd !== null) args.push("--passsword", String(pwd));
				return command(client.client, ["lf", "em", "4x50", "login"])(args);
			},

			/**
			 * Read a single block/word from EM4x50.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} options.block - Block/word address
			 * @param {string} [options.pwd] - Password (4 hex bytes, lsb)
			 *
			 * @example
			 * await lf.em["4x50"].rdbl({ block: 3 });
			 * await lf.em["4x50"].rdbl({ block: 32, pwd: "12345678" });
			 * @returns {Promise<string>} Command output
			 */
			rdbl: async ({ block, pwd } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (block !== undefined && block !== null) args.push("--block", String(block));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				return command(client.client, ["lf", "em", "4x50", "rdbl"])(args);
			},

			/**
			 * Show standard read data of EM4x50 tag.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.continuous] - Continuous reader mode
			 *
			 * @example
			 * await lf.em["4x50"].reader();
			 * await lf.em["4x50"].reader({ continuous: true });
			 * @returns {Promise<string>} Command output
			 */
			reader: async ({ continuous } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (continuous) args.push("-@");
				return command(client.client, ["lf", "em", "4x50", "reader"])(args);
			},

			/**
			 * Restore data from dump file (bin/eml/json) onto an EM4x50 tag.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.uid] - UID (4 hex bytes, msb) - uses template filename if provided
			 * @param {string} [options.file] - Dump filename
			 * @param {string} [options.pwd] - Password (4 hex bytes, lsb)
			 *
			 * @example
			 * await lf.em["4x50"].restore({ uid: "1b5aff5c" });
			 * await lf.em["4x50"].restore({ file: "mydump.eml" });
			 * await lf.em["4x50"].restore({ file: "mydump.eml", pwd: "12345678" });
			 * @returns {Promise<string>} Command output
			 */
			restore: async ({ uid, file, pwd } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				return command(client.client, ["lf", "em", "4x50", "restore"])(args);
			},

			/**
			 * Simulate an EM4x50 tag. First upload data using `lf em 4x50 eload`.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.pwd] - Password (4 hex bytes, lsb)
			 *
			 * @example
			 * await lf.em["4x50"].sim();
			 * await lf.em["4x50"].sim({ pwd: "27182818" });
			 * @returns {Promise<string>} Command output
			 */
			sim: async ({ pwd } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (pwd !== undefined && pwd !== null) args.push("--passsword", String(pwd));
				return command(client.client, ["lf", "em", "4x50", "sim"])(args);
			},

			/**
			 * Print a EM4x50 dump file.
			 *
			 * @param {Object} [options] - Options
			 * @param {string} [options.file] - Dump filename
			 *
			 * @example
			 * await lf.em["4x50"].view({ file: "lf-4x50-01020304-dump.json" });
			 * @returns {Promise<string>} Command output
			 */
			view: async ({ file } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (file !== undefined && file !== null) args.push("--file", String(file));
				return command(client.client, ["lf", "em", "4x50", "view"])(args);
			},

			/**
			 * Wipe EM4x50 tag by filling with zeros, including new password.
			 * Must provide the current password.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.pwd - Password (4 hex bytes, lsb)
			 *
			 * @example
			 * await lf.em["4x50"].wipe({ pwd: "12345678" });
			 * @returns {Promise<string>} Command output
			 */
			wipe: async ({ pwd }) => {
				const client = await clientPromise;
				const args = [];
				if (pwd !== undefined && pwd !== null) args.push("--passsword", String(pwd));
				return command(client.client, ["lf", "em", "4x50", "wipe"])(args);
			},

			/**
			 * Write a single block/word to EM4x50 tag.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} options.block - Block/word address
			 * @param {string} options.data - Data (4 hex bytes, lsb)
			 * @param {string} [options.pwd] - Password (4 hex bytes, lsb)
			 *
			 * @example
			 * await lf.em["4x50"].wrbl({ block: 3, data: "4f22e7ff" });
			 * await lf.em["4x50"].wrbl({ block: 3, data: "4f22e7ff", pwd: "12345678" });
			 * @returns {Promise<string>} Command output
			 */
			wrbl: async ({ block, data, pwd } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (block !== undefined && block !== null) args.push("--block", String(block));
				if (data !== undefined && data !== null) args.push("--data", String(data));
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				return command(client.client, ["lf", "em", "4x50", "wrbl"])(args);
			},

			/**
			 * Write a new password to EM4x50.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.pwd - Current password (4 hex bytes, lsb)
			 * @param {string} options.newPwd - New password (4 hex bytes, lsb)
			 *
			 * @example
			 * await lf.em["4x50"].wrpwd({ pwd: "4f22e7ff", newPwd: "12345678" });
			 * @returns {Promise<string>} Command output
			 */
			wrpwd: async ({ pwd, newPwd }) => {
				const client = await clientPromise;
				const args = [];
				if (pwd !== undefined && pwd !== null) args.push("--pwd", String(pwd));
				if (newPwd !== undefined && newPwd !== null) args.push("--new", String(newPwd));
				return command(client.client, ["lf", "em", "4x50", "wrpwd"])(args);
			},
		},

		// -------------------- EM 4x70 --------------------
		"4x70": {
			/**
			 * Authenticate against an EM4x70 by sending random number (RN) and F(RN).
			 * If F(RN) is correct, the tag gives a 20-bit response.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.rnd - Random 56-bit value (hex)
			 * @param {string} options.frn - F(RN) 28-bit as 4 hex bytes
			 *
			 * @example
			 * await lf.em["4x70"].auth({ rnd: "45F54ADA252AAC", frn: "4866BB70" });
			 * @returns {Promise<string>} Command output
			 */
			auth: async ({ rnd, frn }) => {
				const client = await clientPromise;
				const args = [];
				if (rnd !== undefined && rnd !== null) args.push("--rnd", String(rnd));
				if (frn !== undefined && frn !== null) args.push("--frn", String(frn));
				return command(client.client, ["lf", "em", "4x70", "auth"])(args);
			},

			/**
			 * Perform automatic recovery of the key from a writable EM4x70 tag.
			 * Requires rnd/frn/grn from a single known-good authentication.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.rnd - Random 56-bit from known-good authentication (hex)
			 * @param {string} options.frn - F(RN) 28-bit as 4 hex bytes
			 * @param {string} options.grn - G(RN) 20-bit as 3 hex bytes
			 *
			 * @example
			 * await lf.em["4x70"].autorecover({ rnd: "45F54ADA252AAC", frn: "4866BB70", grn: "9BD180" });
			 * @returns {Promise<string>} Command output
			 */
			autorecover: async ({ rnd, frn, grn }) => {
				const client = await clientPromise;
				const args = [];
				if (rnd !== undefined && rnd !== null) args.push("--rnd", String(rnd));
				if (frn !== undefined && frn !== null) args.push("--frn", String(frn));
				if (grn !== undefined && grn !== null) args.push("--grn", String(grn));
				return command(client.client, ["lf", "em", "4x70", "autorecover"])(args);
			},

			/**
			 * Optimized partial key-update brute force of 16-bit key block 7, 8 or 9 of an EM4x70.
			 * Does NOT write anything to the tag. Before starting, 0000 must be written to the target block.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} options.block - Block/word address (7, 8, or 9)
			 * @param {string} options.rnd - Random 56-bit (hex)
			 * @param {string} options.frn - F(RN) 28-bit as 4 hex bytes
			 * @param {string} [options.start] - Start bruteforce from this key value (hex)
			 *
			 * @example
			 * await lf.em["4x70"].brute({ block: 9, rnd: "45F54ADA252AAC", frn: "4866BB70" });
			 * @returns {Promise<string>} Command output
			 */
			brute: async ({ block, rnd, frn, start } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (block !== undefined && block !== null) args.push("--block", String(block));
				if (rnd !== undefined && rnd !== null) args.push("--rnd", String(rnd));
				if (frn !== undefined && frn !== null) args.push("--frn", String(frn));
				if (start !== undefined && start !== null) args.push("--start", String(start));
				return command(client.client, ["lf", "em", "4x70", "brute"])(args);
			},

			/**
			 * Calculate both reader and tag challenge for a user-provided key and rnd.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.key - Key 96-bit as 12 hex bytes
			 * @param {string} options.rnd - 56-bit random value (hex)
			 *
			 * @example
			 * await lf.em["4x70"].calc({ key: "F32AA98CF5BE4ADFA6D3480B", rnd: "45F54ADA252AAC" });
			 * @returns {Promise<string>} Command output
			 */
			calc: async ({ key, rnd }) => {
				const client = await clientPromise;
				const args = [];
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (rnd !== undefined && rnd !== null) args.push("--rnd", String(rnd));
				return command(client.client, ["lf", "em", "4x70", "calc"])(args);
			},

			/**
			 * Tag information for EM4x70. Variants include ID48 automotive transponder.
			 *
			 * @example
			 * await lf.em["4x70"].info();
			 * @returns {Promise<string>} Command output
			 */
			info: async () => {
				const client = await clientPromise;
				return command(client.client, ["lf", "em", "4x70", "info"])([]);
			},

			/**
			 * Recover key bits 47..00 after obtaining key bits 95..48 (e.g. via brute).
			 * By default does NOT require a tag to be present.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.key - Upper key as 6 hex bytes
			 * @param {string} options.rnd - Random 56-bit (hex)
			 * @param {string} options.frn - F(RN) 28-bit as 4 hex bytes
			 * @param {string} options.grn - G(RN) 20-bit as 3 hex bytes
			 *
			 * @example
			 * await lf.em["4x70"].recover({ key: "F32AA98CF5BE", rnd: "45F54ADA252AAC", frn: "4866BB70", grn: "9BD180" });
			 * @returns {Promise<string>} Command output
			 */
			recover: async ({ key, rnd, frn, grn }) => {
				const client = await clientPromise;
				const args = [];
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (rnd !== undefined && rnd !== null) args.push("--rnd", String(rnd));
				if (frn !== undefined && frn !== null) args.push("--frn", String(frn));
				if (grn !== undefined && grn !== null) args.push("--grn", String(grn));
				return command(client.client, ["lf", "em", "4x70", "recover"])(args);
			},

			/**
			 * Write new 96-bit key to EM4x70 tag.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.key - Key as 12 hex bytes
			 *
			 * @example
			 * await lf.em["4x70"].setkey({ key: "F32AA98CF5BE4ADFA6D3480B" });
			 * @returns {Promise<string>} Command output
			 */
			setkey: async ({ key }) => {
				const client = await clientPromise;
				const args = [];
				if (key !== undefined && key !== null) args.push("--key", String(key));
				return command(client.client, ["lf", "em", "4x70", "setkey"])(args);
			},

			/**
			 * Write new PIN to EM4x70 tag.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.pin - PIN (4 hex bytes)
			 *
			 * @example
			 * await lf.em["4x70"].setpin({ pin: "11223344" });
			 * @returns {Promise<string>} Command output
			 */
			setpin: async ({ pin }) => {
				const client = await clientPromise;
				const args = [];
				if (pin !== undefined && pin !== null) args.push("--pin", String(pin));
				return command(client.client, ["lf", "em", "4x70", "setpin"])(args);
			},

			/**
			 * Unlock EM4x70 by sending PIN.
			 *
			 * @param {Object} options - Options
			 * @param {string} options.pin - PIN (4 hex bytes)
			 *
			 * @example
			 * await lf.em["4x70"].unlock({ pin: "11223344" });
			 * @returns {Promise<string>} Command output
			 */
			unlock: async ({ pin }) => {
				const client = await clientPromise;
				const args = [];
				if (pin !== undefined && pin !== null) args.push("--pin", String(pin));
				return command(client.client, ["lf", "em", "4x70", "unlock"])(args);
			},

			/**
			 * Write data to EM4x70 block.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} options.block - Block/word address
			 * @param {string} options.data - Data (2 hex bytes)
			 *
			 * @example
			 * await lf.em["4x70"].write({ block: 15, data: "c0de" });
			 * @returns {Promise<string>} Command output
			 */
			write: async ({ block, data }) => {
				const client = await clientPromise;
				const args = [];
				if (block !== undefined && block !== null) args.push("--block", String(block));
				if (data !== undefined && data !== null) args.push("--data", String(data));
				return command(client.client, ["lf", "em", "4x70", "write"])(args);
			},
		},
	},

	// ==================== FDX-B ====================

	fdxb: {
		/**
		 * Clone a FDX-B animal tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.country - Country code
		 * @param {number|string} options.national - National code
		 * @param {string} [options.extended] - Extended data (hex)
		 * @param {boolean} [options.animal] - Set animal bit
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.fdxb.clone({ country: 999, national: 1337, animal: true });
		 * await lf.fdxb.clone({ country: 999, national: 1337, extended: "016A" });
		 * await lf.fdxb.clone({ country: 999, national: 1337, q5: true });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ country, national, extended, animal, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (country !== undefined && country !== null) args.push("--country", String(country));
			if (national !== undefined && national !== null) args.push("--national", String(national));
			if (extended !== undefined && extended !== null) args.push("--extended", String(extended));
			if (animal) args.push("--animal");
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "fdxb", "clone"])(args);
		},

		/**
		 * Try to find FDX-B preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.fdxb.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "fdxb", "demod"])([]);
		},

		/**
		 * Read a FDX-B animal tag. Continuous mode is less verbose.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.fdxb.reader();
		 * await lf.fdxb.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "fdxb", "reader"])(args);
		},

		/**
		 * Simulate a FDX-B animal tag.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.country - Country code
		 * @param {number|string} options.national - National code
		 * @param {string} [options.extended] - Extended data (hex)
		 * @param {boolean} [options.animal] - Set animal bit
		 *
		 * @example
		 * await lf.fdxb.sim({ country: 999, national: 1337, animal: true });
		 * await lf.fdxb.sim({ country: 999, national: 1337, extended: "016A" });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ country, national, extended, animal } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (country !== undefined && country !== null) args.push("--country", String(country));
			if (national !== undefined && national !== null) args.push("--national", String(national));
			if (extended !== undefined && extended !== null) args.push("--extended", String(extended));
			if (animal) args.push("--animal");
			return command(client.client, ["lf", "fdxb", "sim"])(args);
		},
	},

	// ==================== GALLAGHER ====================

	gallagher: {
		/**
		 * Clone a Gallagher tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * Can encode from raw hex or from decoded fields (rc/fc/cn/il).
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex data (12 bytes max)
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 * @param {number|string} [options.rc] - Region code (4 bits max)
		 * @param {number|string} [options.fc] - Facility code (2 bytes max)
		 * @param {number|string} [options.cn] - Card number (3 bytes max)
		 * @param {number|string} [options.il] - Issue level (4 bits max)
		 *
		 * @example
		 * await lf.gallagher.clone({ raw: "0FFD5461A9DA1346B2D1AC32" });
		 * await lf.gallagher.clone({ rc: 0, fc: 9876, cn: 1234, il: 1 });
		 * await lf.gallagher.clone({ raw: "0FFD5461A9DA1346B2D1AC32", q5: true });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ raw, q5, em, rc, fc, cn, il } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			if (rc !== undefined && rc !== null) args.push("--rc", String(rc));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (il !== undefined && il !== null) args.push("--il", String(il));
			return command(client.client, ["lf", "gallagher", "clone"])(args);
		},

		/**
		 * Try to find Gallagher preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.gallagher.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "gallagher", "demod"])([]);
		},

		/**
		 * Read a Gallagher tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.gallagher.reader();
		 * await lf.gallagher.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "gallagher", "reader"])(args);
		},

		/**
		 * Simulate a Gallagher card. Can use raw hex or decoded fields.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex data (12 bytes max)
		 * @param {number|string} [options.rc] - Region code (4 bits max)
		 * @param {number|string} [options.fc] - Facility code (2 bytes max)
		 * @param {number|string} [options.cn] - Card number (3 bytes max)
		 * @param {number|string} [options.il] - Issue level (4 bits max)
		 *
		 * @example
		 * await lf.gallagher.sim({ raw: "0FFD5461A9DA1346B2D1AC32" });
		 * await lf.gallagher.sim({ rc: 0, fc: 9876, cn: 1234, il: 1 });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ raw, rc, fc, cn, il } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (rc !== undefined && rc !== null) args.push("--rc", String(rc));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (il !== undefined && il !== null) args.push("--il", String(il));
			return command(client.client, ["lf", "gallagher", "sim"])(args);
		},
	},

	// ==================== G-PROX II ====================

	gproxii: {
		/**
		 * Clone a Guardall G-Prox II tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * Currently works only on 26|36 bit format.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.xor - 8-bit XOR value (installation dependent)
		 * @param {number|string} options.fmt - Format length 26|32|36|40
		 * @param {number|string} options.fc - 8-bit facility code
		 * @param {number|string} options.cn - 16-bit card number
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.gproxii.clone({ xor: 141, fmt: 26, fc: 123, cn: 1337 });
		 * await lf.gproxii.clone({ xor: 141, fmt: 26, fc: 123, cn: 1337, q5: true });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ xor, fmt, fc, cn, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (xor !== undefined && xor !== null) args.push("--xor", String(xor));
			if (fmt !== undefined && fmt !== null) args.push("--fmt", String(fmt));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "gproxii", "clone"])(args);
		},

		/**
		 * Try to find Guardall G-Prox II preamble, if found decode / descramble data.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex bytes
		 *
		 * @example
		 * await lf.gproxii.demod();
		 * await lf.gproxii.demod({ raw: "fb8ee718ee3b8cc785c11b92" });
		 * @returns {Promise<string>} Command output
		 */
		demod: async ({ raw } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			return command(client.client, ["lf", "gproxii", "demod"])(args);
		},

		/**
		 * Read a Guardall G-Prox II tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.gproxii.reader();
		 * await lf.gproxii.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "gproxii", "reader"])(args);
		},

		/**
		 * Simulate a Guardall G-Prox II card.
		 * Currently works only on 26|36 bit format.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.xor - 8-bit XOR value (installation dependent)
		 * @param {number|string} options.fmt - Format length 26|32|36|40
		 * @param {number|string} options.fc - 8-bit facility code
		 * @param {number|string} options.cn - 16-bit card number
		 *
		 * @example
		 * await lf.gproxii.sim({ xor: 141, fmt: 26, fc: 123, cn: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ xor, fmt, fc, cn }) => {
			const client = await clientPromise;
			const args = [];
			if (xor !== undefined && xor !== null) args.push("--xor", String(xor));
			if (fmt !== undefined && fmt !== null) args.push("--fmt", String(fmt));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			return command(client.client, ["lf", "gproxii", "sim"])(args);
		},
	},

	// ==================== HID ====================

	hid: {
		/**
		 * Bruteforce HID readers with specified facility code or card number.
		 * This is an attack against the reader.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.wiegand - Wiegand format (e.g. "H10301"). See `wiegand list`.
		 * @param {string} options.field - Field to bruteforce: "fc" or "cn"
		 * @param {number|string} [options.fc] - Facility code
		 * @param {number|string} [options.cn] - Card number
		 * @param {number|string} [options.issue] - Issue level
		 * @param {number|string} [options.oem] - OEM code
		 * @param {number|string} [options.delay] - Delay between attempts in ms (default 1000)
		 * @param {boolean} [options.up] - Increment direction only
		 * @param {boolean} [options.down] - Decrement direction only
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await lf.hid.brute({ wiegand: "H10301", field: "fc", fc: 224, cn: 6278 });
		 * await lf.hid.brute({ wiegand: "H10301", field: "cn", fc: 21, delay: 2000 });
		 * await lf.hid.brute({ wiegand: "H10301", field: "fc", fc: 21, cn: 200, delay: 2000, up: true, verbose: true });
		 * @returns {Promise<string>} Command output
		 */
		brute: async ({ wiegand, field, fc, cn, issue, oem, delay, up, down, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (wiegand !== undefined && wiegand !== null) args.push("--wiegand", String(wiegand));
			if (field !== undefined && field !== null) args.push("--field", String(field));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (issue !== undefined && issue !== null) args.push("--issue", String(issue));
			if (oem !== undefined && oem !== null) args.push("--oem", String(oem));
			if (delay !== undefined && delay !== null) args.push("--delay", String(delay));
			if (up) args.push("--up");
			if (down) args.push("--down");
			if (verbose) args.push("--verbose");
			return command(client.client, ["lf", "hid", "brute"])(args);
		},

		/**
		 * Clone a HID Prox tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * Tag must be on the antenna when issuing this command.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.wiegand] - Wiegand format (e.g. "H10301"). See `wiegand list`.
		 * @param {number|string} [options.fc] - Facility code
		 * @param {number|string} [options.cn] - Card number
		 * @param {number|string} [options.issue] - Issue level
		 * @param {number|string} [options.oem] - OEM code
		 * @param {string} [options.raw] - Raw hex bytes
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 * @param {string} [options.bin] - Binary string (e.g. "0001001001")
		 * @param {string} [options.newPacs] - New ASN.1 PACS hex from `wiegand encode --new`
		 *
		 * @example
		 * await lf.hid.clone({ raw: "2006ec0c86" });
		 * await lf.hid.clone({ wiegand: "H10301", fc: 118, cn: 1603 });
		 * await lf.hid.clone({ wiegand: "H10301", fc: 118, cn: 1603, q5: true });
		 * await lf.hid.clone({ bin: "10001111100000001010100011" });
		 * await lf.hid.clone({ newPacs: "068F80A8C0" });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ wiegand, fc, cn, issue, oem, raw, q5, em, bin, newPacs } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (wiegand !== undefined && wiegand !== null) args.push("--wiegand", String(wiegand));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (issue !== undefined && issue !== null) args.push("-i", String(issue));
			if (oem !== undefined && oem !== null) args.push("--oem", String(oem));
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			if (bin !== undefined && bin !== null) args.push("--bin", String(bin));
			if (newPacs !== undefined && newPacs !== null) args.push("--new", String(newPacs));
			return command(client.client, ["lf", "hid", "clone"])(args);
		},

		/**
		 * Try to find HID Prox preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.hid.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "hid", "demod"])([]);
		},

		/**
		 * Read a HID Prox tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.hid.reader();
		 * await lf.hid.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "hid", "reader"])(args);
		},

		/**
		 * Simulate a HID card. Can use raw hex, Wiegand format fields, binary, or PACS encoding.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.wiegand] - Wiegand format (e.g. "H10301"). See `wiegand list`.
		 * @param {number|string} [options.fc] - Facility code
		 * @param {number|string} [options.cn] - Card number
		 * @param {number|string} [options.issue] - Issue level
		 * @param {number|string} [options.oem] - OEM code
		 * @param {string} [options.raw] - Raw hex bytes
		 * @param {string} [options.bin] - Binary string (e.g. "0001001001")
		 * @param {string} [options.newPacs] - New ASN.1 PACS hex from `wiegand encode --new`
		 *
		 * @example
		 * await lf.hid.sim({ raw: "2006ec0c86" });
		 * await lf.hid.sim({ wiegand: "H10301", fc: 118, cn: 1603 });
		 * await lf.hid.sim({ bin: "10001111100000001010100011" });
		 * await lf.hid.sim({ newPacs: "068F80A8C0" });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ wiegand, fc, cn, issue, oem, raw, bin, newPacs } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (wiegand !== undefined && wiegand !== null) args.push("--wiegand", String(wiegand));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (issue !== undefined && issue !== null) args.push("-i", String(issue));
			if (oem !== undefined && oem !== null) args.push("--oem", String(oem));
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (bin !== undefined && bin !== null) args.push("--bin", String(bin));
			if (newPacs !== undefined && newPacs !== null) args.push("--new", String(newPacs));
			return command(client.client, ["lf", "hid", "sim"])(args);
		},

		/**
		 * Enable HID compatible reader mode printing details.
		 * Runs until the button is pressed or another USB command is issued.
		 *
		 * @example
		 * await lf.hid.watch();
		 * @returns {Promise<string>} Command output
		 */
		watch: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "hid", "watch"])([]);
		},
	},

	// ==================== HITAG ====================

	hitag: {
		/**
		 * Check challenges: load a file with saved Hitag crypto challenges and test them all.
		 * The file should be 8*60 bytes long, extension defaults to `.cc`.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Filename to load (without extension)
		 *
		 * @example
		 * await lf.hitag.cc({ file: "my_hitag_challenges" });
		 * @returns {Promise<string>} Command output
		 */
		cc: async ({ file }) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["lf", "hitag", "cc"])(args);
		},

		/**
		 * Run dictionary key or password recovery against Hitag card.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.file] - Dictionary filename
		 * @param {boolean} [options.pwd] - Password mode
		 * @param {boolean} [options.crypto] - Crypto mode
		 *
		 * @example
		 * await lf.hitag.chk();
		 * await lf.hitag.chk({ crypto: true });
		 * await lf.hitag.chk({ pwd: true, file: "my.dic" });
		 * @returns {Promise<string>} Command output
		 */
		chk: async ({ file, pwd, crypto } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (pwd) args.push("--pwd");
			if (crypto) args.push("--crypto");
			return command(client.client, ["lf", "hitag", "chk"])(args);
		},

		/**
		 * Try to recover 2048 bits of Hitag 2 crypto stream data.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.nrar] - Nonce / answer as 8 hex bytes
		 *
		 * @example
		 * await lf.hitag.crack2({ nrar: "73AA5A62EAB8529C" });
		 * @returns {Promise<string>} Command output
		 */
		crack2: async ({ nrar } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
			return command(client.client, ["lf", "hitag", "crack2"])(args);
		},

		/**
		 * Read all Hitag 2 card memory and save to file.
		 * Supports password mode (default key 4D494B52) and crypto mode (default key 4F4E4D494B52).
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.pwd] - Password mode
		 * @param {string} [options.nrar] - Nonce / answer reader (8 hex bytes)
		 * @param {boolean} [options.crypto] - Crypto mode
		 * @param {string} [options.key] - Key (4 or 6 hex bytes)
		 * @param {string} [options.file] - Filename
		 * @param {boolean} [options.ns] - No save to file
		 *
		 * @example
		 * await lf.hitag.dump({ pwd: true });
		 * await lf.hitag.dump({ key: "4D494B52" });
		 * await lf.hitag.dump({ crypto: true });
		 * await lf.hitag.dump({ key: "4F4E4D494B52" });
		 * await lf.hitag.dump({ nrar: "0102030411223344" });
		 * @returns {Promise<string>} Command output
		 */
		dump: async ({ pwd, nrar, crypto, key, file, ns } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (pwd) args.push("--pwd");
			if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
			if (crypto) args.push("--crypto");
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (ns) args.push("--ns");
			return command(client.client, ["lf", "hitag", "dump"])(args);
		},

		/**
		 * Load Hitag tag dump into emulator memory on device.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Dump filename
		 * @param {string} [options.cardType] - Card type: "ht1" (Hitag 1), "ht2" (Hitag 2), "hts" (Hitag S), "htm" (Hitag u)
		 *
		 * @example
		 * await lf.hitag.eload({ file: "lf-hitag-11223344-dump.bin", cardType: "ht2" });
		 * @returns {Promise<string>} Command output
		 */
		eload: async ({ file, cardType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (cardType === "ht1") args.push("--ht1");
			else if (cardType === "ht2") args.push("--ht2");
			else if (cardType === "hts") args.push("--hts");
			else if (cardType === "htm") args.push("--htm");
			return command(client.client, ["lf", "hitag", "eload"])(args);
		},

		/**
		 * Display Hitag emulator memory.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await lf.hitag.eview();
		 * @returns {Promise<string>} Command output
		 */
		eview: async ({ verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			return command(client.client, ["lf", "hitag", "eview"])(args);
		},

		/**
		 * Hitag 2 tag information.
		 *
		 * @example
		 * await lf.hitag.info();
		 * @returns {Promise<string>} Command output
		 */
		info: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "hitag", "info"])([]);
		},

		/**
		 * List Hitag 2 trace buffer with protocol annotations.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.buffer] - Use data from trace buffer
		 * @param {boolean} [options.frame] - Show frame delay times
		 * @param {boolean} [options.markCrc] - Mark CRC bytes
		 * @param {boolean} [options.relative] - Show relative times (gap and duration)
		 * @param {boolean} [options.microseconds] - Display times in microseconds
		 * @param {boolean} [options.hexdump] - Show hexdump for pcap(ng) / Wireshark import
		 * @param {string} [options.file] - Dictionary filename
		 *
		 * @example
		 * await lf.hitag.list({ frame: true });
		 * await lf.hitag.list({ buffer: true });
		 * @returns {Promise<string>} Command output
		 */
		list: async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (buffer) args.push("--buffer");
			if (frame) args.push("--frame");
			if (markCrc) args.push("-c");
			if (relative) args.push("-r");
			if (microseconds) args.push("-u");
			if (hexdump) args.push("-x");
			if (file !== undefined && file !== null) args.push("--file", String(file));
			return command(client.client, ["lf", "hitag", "list"])(args);
		},

		/**
		 * Recover a Hitag 2 crypto key from sniffed trace data.
		 * Verify NR/AR against a known crypto key or dictionary.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.uid - UID as 4 hex bytes
		 * @param {string} [options.file] - Dictionary filename
		 * @param {string} [options.key] - Known cryptokey as 6 hex bytes
		 * @param {string} [options.nr] - Nonce as 4 hex bytes
		 * @param {string} [options.ar] - Answer as 4 hex bytes
		 * @param {string} [options.nrar] - Nonce / answer as 8 hex bytes
		 *
		 * @example
		 * await lf.hitag.lookup({ uid: "11223344", nr: "73AA5A62", ar: "EAB8529C", key: "010203040506" });
		 * await lf.hitag.lookup({ uid: "11223344", nr: "73AA5A62", ar: "EAB8529C" });
		 * await lf.hitag.lookup({ uid: "11223344", nrar: "73AA5A62EAB8529C" });
		 * @returns {Promise<string>} Command output
		 */
		lookup: async ({ uid, file, key, nr, ar, nrar } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (uid !== undefined && uid !== null) args.push("--uid", String(uid));
			if (nr !== undefined && nr !== null) args.push("--nr", String(nr));
			if (ar !== undefined && ar !== null) args.push("--ar", String(ar));
			if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
			return command(client.client, ["lf", "hitag", "lookup"])(args);
		},

		/**
		 * Read Hitag memory. Supports Hitag 2.
		 * Password mode default key: 4D494B52 (MIKR).
		 * Crypto mode default key: 4F4E4D494B52 (ONMIKR).
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.ht2] - Hitag 2
		 * @param {boolean} [options.pwd] - Password mode
		 * @param {string} [options.nrar] - Nonce / answer writer (8 hex bytes)
		 * @param {boolean} [options.crypto] - Crypto mode
		 * @param {string} [options.key] - Key (4 or 6 hex bytes)
		 *
		 * @example
		 * await lf.hitag.read({ ht2: true, pwd: true });
		 * await lf.hitag.read({ ht2: true, key: "4D494B52" });
		 * await lf.hitag.read({ ht2: true, crypto: true });
		 * await lf.hitag.read({ ht2: true, nrar: "0102030411223344" });
		 * @returns {Promise<string>} Command output
		 */
		read: async ({ ht2, pwd, nrar, crypto, key } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (ht2) args.push("--ht2");
			if (pwd) args.push("--pwd");
			if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
			if (crypto) args.push("--crypto");
			if (key !== undefined && key !== null) args.push("--key", String(key));
			return command(client.client, ["lf", "hitag", "read"])(args);
		},

		/**
		 * Act as a Hitag 2 reader. Look for Hitag 2 tags until Enter or pm3 button is pressed.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.hitag.reader();
		 * await lf.hitag.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "hitag", "reader"])(args);
		},

		/**
		 * Simulate a Hitag transponder. Requires `lf hitag eload` first.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.cardType] - Card type to simulate: "ht1" (Hitag 1) or "ht2" (Hitag 2)
		 *
		 * @example
		 * await lf.hitag.sim({ cardType: "ht2" });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ cardType } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cardType === "ht1") args.push("--ht1");
			else if (cardType === "ht2") args.push("--ht2");
			return command(client.client, ["lf", "hitag", "sim"])(args);
		},

		/**
		 * Sniff the communication between reader and tag.
		 * Use `lf hitag list` to view collected data.
		 *
		 * @example
		 * await lf.hitag.sniff();
		 * @returns {Promise<string>} Command output
		 */
		sniff: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "hitag", "sniff"])([]);
		},

		/**
		 * Perform self tests of Hitag crypto engine.
		 *
		 * @example
		 * await lf.hitag.test();
		 * @returns {Promise<string>} Command output
		 */
		test: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "hitag", "test"])([]);
		},

		/**
		 * Print a Hitag dump file (bin/eml/json).
		 *
		 * @param {Object} options - Options
		 * @param {string} options.file - Dump filename
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await lf.hitag.view({ file: "lf-hitag-01020304-dump.bin" });
		 * @returns {Promise<string>} Command output
		 */
		view: async ({ file, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (file !== undefined && file !== null) args.push("--file", String(file));
			if (verbose) args.push("--verbose");
			return command(client.client, ["lf", "hitag", "view"])(args);
		},

		/**
		 * Write a page in Hitag memory. Supports Hitag 2.
		 * Password mode default key: 4D494B52 (MIKR).
		 * Crypto mode default key: 4F4E4D494B52 (ONMIKR).
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.page - Page address to write to
		 * @param {string} options.data - Data (4 hex bytes)
		 * @param {boolean} [options.ht2] - Hitag 2
		 * @param {boolean} [options.pwd] - Password mode
		 * @param {string} [options.nrar] - Nonce / answer writer (8 hex bytes)
		 * @param {boolean} [options.crypto] - Crypto mode
		 * @param {string} [options.key] - Key (4 or 6 hex bytes)
		 *
		 * @example
		 * await lf.hitag.wrbl({ ht2: true, page: 6, data: "01020304", pwd: true });
		 * await lf.hitag.wrbl({ ht2: true, page: 6, data: "01020304", key: "4D494B52" });
		 * await lf.hitag.wrbl({ ht2: true, page: 6, data: "01020304", crypto: true });
		 * @returns {Promise<string>} Command output
		 */
		wrbl: async ({ ht2, pwd, nrar, crypto, key, page, data } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (ht2) args.push("--ht2");
			if (pwd) args.push("--pwd");
			if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
			if (crypto) args.push("--crypto");
			if (key !== undefined && key !== null) args.push("--key", String(key));
			if (page !== undefined && page !== null) args.push("--page", String(page));
			if (data !== undefined && data !== null) args.push("--data", String(data));
			return command(client.client, ["lf", "hitag", "wrbl"])(args);
		},

		// -------------------- Hitag S (hts) --------------------

		hts: {
			/**
			 * Read all Hitag S memory and save to file.
			 * Crypto mode default key: 4F4E4D494B52 (ONMIKR).
			 * 8268/8310 password mode default: BBDD3399.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.mode82xx] - 8268/8310 mode
			 * @param {string} [options.nrar] - Nonce / answer writer (8 hex bytes)
			 * @param {boolean} [options.crypto] - Crypto mode
			 * @param {string} [options.key] - Password or key (4 or 6 hex bytes)
			 * @param {number|string} [options.mode] - Response protocol mode: 0 (Standard), 1 (Advanced 11000), 2 (Advanced 11001), 3 (Fast Advanced, default)
			 * @param {string} [options.file] - Filename
			 * @param {boolean} [options.ns] - No save to file
			 *
			 * @example
			 * await lf.hitag.hts.dump({ mode82xx: true });
			 * await lf.hitag.hts.dump({ crypto: true });
			 * await lf.hitag.hts.dump({ key: "4F4E4D494B52" });
			 * @returns {Promise<string>} Command output
			 */
			dump: async ({ mode82xx, nrar, crypto, key, mode, file, ns } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
				if (crypto) args.push("--crypto");
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (ns) args.push("--ns");
				return command(client.client, ["lf", "hitag", "hts", "dump"])(args);
			},

			/**
			 * List Hitag S trace buffer with protocol annotations.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.buffer] - Use data from trace buffer
			 * @param {boolean} [options.frame] - Show frame delay times
			 * @param {boolean} [options.markCrc] - Mark CRC bytes
			 * @param {boolean} [options.relative] - Show relative times
			 * @param {boolean} [options.microseconds] - Display times in microseconds
			 * @param {boolean} [options.hexdump] - Show hexdump for Wireshark import
			 * @param {string} [options.file] - Dictionary filename
			 *
			 * @example
			 * await lf.hitag.hts.list({ frame: true });
			 * await lf.hitag.hts.list({ buffer: true });
			 * @returns {Promise<string>} Command output
			 */
			list: async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (buffer) args.push("--buffer");
				if (frame) args.push("--frame");
				if (markCrc) args.push("-c");
				if (relative) args.push("-r");
				if (microseconds) args.push("-u");
				if (hexdump) args.push("-x");
				if (file !== undefined && file !== null) args.push("--file", String(file));
				return command(client.client, ["lf", "hitag", "hts", "list"])(args);
			},

			/**
			 * Read Hitag S memory block(s).
			 * Crypto mode default key: 4F4E4D494B52 (ONMIKR).
			 * 8268/8310 password mode default: BBDD3399.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.mode82xx] - 8268/8310 mode
			 * @param {string} [options.nrar] - Nonce / answer writer (8 hex bytes)
			 * @param {boolean} [options.crypto] - Crypto mode
			 * @param {string} [options.key] - Password or key (4 or 6 hex bytes)
			 * @param {number|string} [options.mode] - Response protocol mode (0-3, default 3)
			 * @param {number|string} [options.page] - Page address to read from
			 * @param {number|string} [options.count] - Number of pages to read (0 = all, default 1)
			 *
			 * @example
			 * await lf.hitag.hts.rdbl({ page: 1 });
			 * await lf.hitag.hts.rdbl({ page: 1, mode82xx: true, key: "BBDD3399" });
			 * await lf.hitag.hts.rdbl({ page: 1, crypto: true });
			 * @returns {Promise<string>} Command output
			 */
			rdbl: async ({ mode82xx, nrar, crypto, key, mode, page, count } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
				if (crypto) args.push("--crypto");
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
				if (page !== undefined && page !== null) args.push("--page", String(page));
				if (count !== undefined && count !== null) args.push("--count", String(count));
				return command(client.client, ["lf", "hitag", "hts", "rdbl"])(args);
			},

			/**
			 * Act as a Hitag S reader. Look for tags until Enter or pm3 button is pressed.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.continuous] - Continuous reader mode
			 *
			 * @example
			 * await lf.hitag.hts.reader();
			 * await lf.hitag.hts.reader({ continuous: true });
			 * @returns {Promise<string>} Command output
			 */
			reader: async ({ continuous } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (continuous) args.push("-@");
				return command(client.client, ["lf", "hitag", "hts", "reader"])(args);
			},

			/**
			 * Restore a dump file onto a Hitag S tag.
			 * Crypto mode default key: 4F4E4D494B52 (ONMIKR).
			 * 8268/8310 password mode default: BBDD3399.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.mode82xx] - 8268/8310 mode
			 * @param {string} [options.nrar] - Nonce / answer writer (8 hex bytes)
			 * @param {boolean} [options.crypto] - Crypto mode
			 * @param {string} [options.key] - Password or key (4 or 6 hex bytes)
			 * @param {number|string} [options.mode] - Response protocol mode (0-3, default 3)
			 * @param {string} [options.file] - Dump filename
			 *
			 * @example
			 * await lf.hitag.hts.restore({ file: "myfile", mode82xx: true });
			 * await lf.hitag.hts.restore({ file: "myfile", crypto: true });
			 * await lf.hitag.hts.restore({ file: "myfile", key: "4F4E4D494B52" });
			 * @returns {Promise<string>} Command output
			 */
			restore: async ({ mode82xx, nrar, crypto, key, mode, file } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
				if (crypto) args.push("--crypto");
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
				if (file !== undefined && file !== null) args.push("--file", String(file));
				return command(client.client, ["lf", "hitag", "hts", "restore"])(args);
			},

			/**
			 * Simulate Hitag S transponder. Requires `lf hitag hts eload` first.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.mode82xx] - Simulate 8268/8310
			 * @param {number|string} [options.threshold] - Edge detect threshold (default 127)
			 *
			 * @example
			 * await lf.hitag.hts.sim();
			 * await lf.hitag.hts.sim({ mode82xx: true });
			 * await lf.hitag.hts.sim({ threshold: 30 });
			 * @returns {Promise<string>} Command output
			 */
			sim: async ({ mode82xx, threshold } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (threshold !== undefined && threshold !== null) args.push("--threshold", String(threshold));
				return command(client.client, ["lf", "hitag", "hts", "sim"])(args);
			},

			/**
			 * Write a page in Hitag S memory.
			 * Crypto mode default key: 4F4E4D494B52 (ONMIKR).
			 * 8268/8310 password mode default: BBDD3399.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} options.page - Page address to write to
			 * @param {string} options.data - Data (4 hex bytes)
			 * @param {boolean} [options.mode82xx] - 8268/8310 mode
			 * @param {string} [options.nrar] - Nonce / answer writer (8 hex bytes)
			 * @param {boolean} [options.crypto] - Crypto mode
			 * @param {string} [options.key] - Password or key (4 or 6 hex bytes)
			 * @param {number|string} [options.mode] - Response protocol mode (0-3, default 3)
			 *
			 * @example
			 * await lf.hitag.hts.wrbl({ page: 6, data: "01020304" });
			 * await lf.hitag.hts.wrbl({ page: 6, data: "01020304", mode82xx: true, key: "BBDD3399" });
			 * await lf.hitag.hts.wrbl({ page: 6, data: "01020304", crypto: true });
			 * @returns {Promise<string>} Command output
			 */
			wrbl: async ({ mode82xx, nrar, crypto, key, mode, page, data } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (nrar !== undefined && nrar !== null) args.push("--nrar", String(nrar));
				if (crypto) args.push("--crypto");
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (mode !== undefined && mode !== null) args.push("--mode", String(mode));
				if (page !== undefined && page !== null) args.push("--page", String(page));
				if (data !== undefined && data !== null) args.push("--data", String(data));
				return command(client.client, ["lf", "hitag", "hts", "wrbl"])(args);
			},
		},

		// -------------------- Hitag u (htu) --------------------

		htu: {
			/**
			 * Read all Hitag u memory and save to file.
			 * 82xx password mode default: 00000000.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.mode82xx] - 82xx mode
			 * @param {string} [options.key] - Password (4 hex bytes)
			 * @param {string} [options.file] - Filename
			 * @param {boolean} [options.ns] - No save to file
			 *
			 * @example
			 * await lf.hitag.htu.dump({ mode82xx: true });
			 * await lf.hitag.htu.dump({ mode82xx: true, key: "9AC4999C" });
			 * @returns {Promise<string>} Command output
			 */
			dump: async ({ mode82xx, key, file, ns } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (file !== undefined && file !== null) args.push("--file", String(file));
				if (ns) args.push("--ns");
				return command(client.client, ["lf", "hitag", "htu", "dump"])(args);
			},

			/**
			 * List Hitag u trace buffer with protocol annotations.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.buffer] - Use data from trace buffer
			 * @param {boolean} [options.frame] - Show frame delay times
			 * @param {boolean} [options.markCrc] - Mark CRC bytes
			 * @param {boolean} [options.relative] - Show relative times
			 * @param {boolean} [options.microseconds] - Display times in microseconds
			 * @param {boolean} [options.hexdump] - Show hexdump for Wireshark import
			 * @param {string} [options.file] - Dictionary filename
			 *
			 * @example
			 * await lf.hitag.htu.list({ frame: true });
			 * await lf.hitag.htu.list({ buffer: true });
			 * @returns {Promise<string>} Command output
			 */
			list: async ({ buffer, frame, markCrc, relative, microseconds, hexdump, file } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (buffer) args.push("--buffer");
				if (frame) args.push("--frame");
				if (markCrc) args.push("-c");
				if (relative) args.push("-r");
				if (microseconds) args.push("-u");
				if (hexdump) args.push("-x");
				if (file !== undefined && file !== null) args.push("--file", String(file));
				return command(client.client, ["lf", "hitag", "htu", "list"])(args);
			},

			/**
			 * Read Hitag u memory block(s).
			 * 82xx password mode default: 00000000.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.mode82xx] - 82xx mode
			 * @param {string} [options.key] - Password (4 hex bytes)
			 * @param {number|string} [options.page] - Block address to read from (default 0)
			 * @param {number|string} [options.count] - Number of blocks to read (0 = all, default 1)
			 *
			 * @example
			 * await lf.hitag.htu.rdbl({ page: 1 });
			 * await lf.hitag.htu.rdbl({ page: 1, mode82xx: true });
			 * await lf.hitag.htu.rdbl({ page: 1, mode82xx: true, key: "9AC4999C" });
			 * @returns {Promise<string>} Command output
			 */
			rdbl: async ({ mode82xx, key, page, count } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (page !== undefined && page !== null) args.push("--page", String(page));
				if (count !== undefined && count !== null) args.push("--count", String(count));
				return command(client.client, ["lf", "hitag", "htu", "rdbl"])(args);
			},

			/**
			 * Act as a Hitag u reader. Look for tags until Enter or pm3 button is pressed.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.continuous] - Continuous reader mode
			 *
			 * @example
			 * await lf.hitag.htu.reader();
			 * await lf.hitag.htu.reader({ continuous: true });
			 * @returns {Promise<string>} Command output
			 */
			reader: async ({ continuous } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (continuous) args.push("-@");
				return command(client.client, ["lf", "hitag", "htu", "reader"])(args);
			},

			/**
			 * Simulate Hitag u transponder. Requires `lf hitag htu eload` first.
			 *
			 * @param {Object} [options] - Options
			 * @param {boolean} [options.mode82xx] - Simulate 82xx
			 * @param {number|string} [options.threshold] - Edge detect threshold (default 127)
			 *
			 * @example
			 * await lf.hitag.htu.sim();
			 * await lf.hitag.htu.sim({ mode82xx: true });
			 * await lf.hitag.htu.sim({ threshold: 30 });
			 * @returns {Promise<string>} Command output
			 */
			sim: async ({ mode82xx, threshold } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (threshold !== undefined && threshold !== null) args.push("--threshold", String(threshold));
				return command(client.client, ["lf", "hitag", "htu", "sim"])(args);
			},

			/**
			 * Write a block in Hitag u memory.
			 * 82xx password mode default: 00000000.
			 *
			 * @param {Object} options - Options
			 * @param {number|string} options.page - Block address to write to
			 * @param {string} options.data - Data (4 hex bytes)
			 * @param {boolean} [options.mode82xx] - 82xx mode
			 * @param {string} [options.key] - Password (4 hex bytes)
			 *
			 * @example
			 * await lf.hitag.htu.wrbl({ page: 6, data: "01020304" });
			 * await lf.hitag.htu.wrbl({ page: 6, data: "01020304", mode82xx: true });
			 * await lf.hitag.htu.wrbl({ page: 6, data: "01020304", mode82xx: true, key: "9AC4999C" });
			 * @returns {Promise<string>} Command output
			 */
			wrbl: async ({ mode82xx, key, page, data } = {}) => {
				const client = await clientPromise;
				const args = [];
				if (mode82xx) args.push("--82xx");
				if (key !== undefined && key !== null) args.push("--key", String(key));
				if (page !== undefined && page !== null) args.push("--page", String(page));
				if (data !== undefined && data !== null) args.push("--data", String(data));
				return command(client.client, ["lf", "hitag", "htu", "wrbl"])(args);
			},
		},
	},

	// ==================== IDTECK ====================

	idteck: {
		/**
		 * Clone an Idteck tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * Tag must be on the antenna.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.raw - Raw hex bytes
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.idteck.clone({ raw: "4944544B351FBE4B" });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ raw, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "idteck", "clone"])(args);
		},

		/**
		 * Try to find Idteck preamble, if found decode / descramble data.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex bytes
		 *
		 * @example
		 * await lf.idteck.demod();
		 * await lf.idteck.demod({ raw: "4944544B351FBE4B" });
		 * @returns {Promise<string>} Command output
		 */
		demod: async ({ raw } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			return command(client.client, ["lf", "idteck", "demod"])(args);
		},

		/**
		 * Read an Idteck tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.idteck.reader();
		 * await lf.idteck.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "idteck", "reader"])(args);
		},

		/**
		 * Simulate an Idteck card.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.raw - Raw hex bytes
		 *
		 * @example
		 * await lf.idteck.sim({ raw: "4944544B351FBE4B" });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ raw }) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			return command(client.client, ["lf", "idteck", "sim"])(args);
		},
	},

	// ==================== INDALA ====================

	indala: {
		/**
		 * Try to PSK demodulate the graphbuffer as Indala using an alternative method.
		 * This legacy method is considered obsolete but sometimes has advantages.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.long] - Demod as 224-bit long format
		 *
		 * @example
		 * await lf.indala.altdemod();
		 * await lf.indala.altdemod({ long: true });
		 * @returns {Promise<string>} Command output
		 */
		altdemod: async ({ long } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (long) args.push("--long");
			return command(client.client, ["lf", "indala", "altdemod"])(args);
		},

		/**
		 * Bruteforce INDALA readers with specified facility code.
		 * Attack against reader. If card number is given, starts from it and goes up/down.
		 *
		 * @param {Object} [options] - Options
		 * @param {number|string} [options.fc] - Facility code
		 * @param {number|string} [options.cn] - Card number to start with
		 * @param {number|string} [options.delay] - Delay between attempts in ms (default 1000)
		 * @param {boolean} [options.up] - Increment direction only
		 * @param {boolean} [options.down] - Decrement direction only
		 * @param {boolean} [options.fmt4041x] - Specify Indala 4041X format
		 * @param {boolean} [options.verbose] - Verbose output
		 *
		 * @example
		 * await lf.indala.brute({ fc: 224 });
		 * await lf.indala.brute({ fc: 21, cn: 200, delay: 2000, verbose: true });
		 * await lf.indala.brute({ fc: 21, cn: 200, delay: 2000, up: true });
		 * @returns {Promise<string>} Command output
		 */
		brute: async ({ fc, cn, delay, up, down, fmt4041x, verbose } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (verbose) args.push("--verbose");
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (delay !== undefined && delay !== null) args.push("--delay", String(delay));
			if (up) args.push("--up");
			if (down) args.push("--down");
			if (fmt4041x) args.push("--4041x");
			return command(client.client, ["lf", "indala", "brute"])(args);
		},

		/**
		 * Clone an Indala UID to a T55x7, Q5/T5555 or EM4305/4469 tag using different known formats.
		 * Warning: encoding with FC/CN does not always work.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex bytes
		 * @param {number|string} [options.heden] - Card number for Heden 2L format
		 * @param {number|string} [options.fc] - Facility code (26-bit H10301 format)
		 * @param {number|string} [options.cn] - Card number (26-bit H10301 format)
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 * @param {boolean} [options.fmt4041x] - Indala 4041X format (must use with fc and cn)
		 *
		 * @example
		 * await lf.indala.clone({ heden: 888 });
		 * await lf.indala.clone({ fc: 123, cn: 1337 });
		 * await lf.indala.clone({ fc: 123, cn: 1337, fmt4041x: true });
		 * await lf.indala.clone({ raw: "a0000000a0002021" });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ raw, heden, fc, cn, q5, em, fmt4041x } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (heden !== undefined && heden !== null) args.push("--heden", String(heden));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			if (fmt4041x) args.push("--4041x");
			return command(client.client, ["lf", "indala", "clone"])(args);
		},

		/**
		 * Try to PSK demodulate the graphbuffer as Indala.
		 *
		 * @param {Object} [options] - Options
		 * @param {number|string} [options.clock] - Clock (default autodetect)
		 * @param {number|string} [options.maxerr] - Maximum allowed errors (default 100)
		 * @param {boolean} [options.invert] - Invert output
		 *
		 * @example
		 * await lf.indala.demod();
		 * await lf.indala.demod({ clock: 32 });
		 * await lf.indala.demod({ clock: 32, invert: true });
		 * @returns {Promise<string>} Command output
		 */
		demod: async ({ clock, maxerr, invert } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (clock !== undefined && clock !== null) args.push("--clock", String(clock));
			if (maxerr !== undefined && maxerr !== null) args.push("--maxerr", String(maxerr));
			if (invert) args.push("--invert");
			return command(client.client, ["lf", "indala", "demod"])(args);
		},

		/**
		 * Read an Indala tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {number|string} [options.clock] - Clock (default autodetect)
		 * @param {number|string} [options.maxerr] - Maximum allowed errors (default 100)
		 * @param {boolean} [options.invert] - Invert output
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.indala.reader();
		 * await lf.indala.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ clock, maxerr, invert, continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (clock !== undefined && clock !== null) args.push("--clock", String(clock));
			if (maxerr !== undefined && maxerr !== null) args.push("--maxerr", String(maxerr));
			if (invert) args.push("--invert");
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "indala", "reader"])(args);
		},

		/**
		 * Simulate an Indala card with specified facility code and card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} [options] - Options
		 * @param {string} [options.raw] - Raw hex bytes
		 * @param {number|string} [options.heden] - Card number for Heden 2L format
		 * @param {number|string} [options.fc] - Facility code (26-bit H10301 format)
		 * @param {number|string} [options.cn] - Card number (26-bit H10301 format)
		 * @param {boolean} [options.fmt4041x] - Indala 4041X format (must use with fc and cn)
		 *
		 * @example
		 * await lf.indala.sim({ heden: 888 });
		 * await lf.indala.sim({ fc: 123, cn: 1337 });
		 * await lf.indala.sim({ fc: 123, cn: 1337, fmt4041x: true });
		 * await lf.indala.sim({ raw: "a0000000a0002021" });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ raw, heden, fc, cn, fmt4041x } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (raw !== undefined && raw !== null) args.push("--raw", String(raw));
			if (heden !== undefined && heden !== null) args.push("--heden", String(heden));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (fmt4041x) args.push("--4041x");
			return command(client.client, ["lf", "indala", "sim"])(args);
		},
	},

	// ==================== ioProx ====================

	io: {
		/**
		 * Clone an ioProx card to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * Tag must be on the antenna.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.vn - 8-bit version
		 * @param {number|string} options.fc - 8-bit facility code
		 * @param {number|string} options.cn - 16-bit card number
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.io.clone({ vn: 1, fc: 101, cn: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ vn, fc, cn, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (vn !== undefined && vn !== null) args.push("--vn", String(vn));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "io", "clone"])(args);
		},

		/**
		 * Try to find ioProx preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.io.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "io", "demod"])([]);
		},

		/**
		 * Read an ioProx tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.io.reader();
		 * await lf.io.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "io", "reader"])(args);
		},

		/**
		 * Simulate an ioProx card with specified facility code and card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.vn - 8-bit version
		 * @param {number|string} options.fc - 8-bit facility code
		 * @param {number|string} options.cn - 16-bit card number
		 *
		 * @example
		 * await lf.io.sim({ vn: 1, fc: 101, cn: 1337 });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ vn, fc, cn }) => {
			const client = await clientPromise;
			const args = [];
			if (vn !== undefined && vn !== null) args.push("--vn", String(vn));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			return command(client.client, ["lf", "io", "sim"])(args);
		},

		/**
		 * Enable ioProx compatible reader mode printing details.
		 * Runs until the button is pressed or another USB command is issued.
		 *
		 * @example
		 * await lf.io.watch();
		 * @returns {Promise<string>} Command output
		 */
		watch: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "io", "watch"])([]);
		},
	},

	// ==================== JABLOTRON ====================

	jablotron: {
		/**
		 * Clone a Jablotron tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 * Tag must be on the antenna.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.cn - Jablotron card ID (5 hex bytes max)
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.jablotron.clone({ cn: "01b669" });
		 * await lf.jablotron.clone({ cn: "01b669", q5: true });
		 * await lf.jablotron.clone({ cn: "01b669", em: true });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ cn, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "jablotron", "clone"])(args);
		},

		/**
		 * Try to find Jablotron preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.jablotron.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "jablotron", "demod"])([]);
		},

		/**
		 * Read a Jablotron tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.jablotron.reader();
		 * await lf.jablotron.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "jablotron", "reader"])(args);
		},

		/**
		 * Simulate a Jablotron card with specified card number.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {string} options.cn - Jablotron card ID (5 hex bytes max)
		 *
		 * @example
		 * await lf.jablotron.sim({ cn: "01b669" });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ cn }) => {
			const client = await clientPromise;
			const args = [];
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			return command(client.client, ["lf", "jablotron", "sim"])(args);
		},
	},

	// ==================== KERI ====================

	keri: {
		/**
		 * Clone a KERI tag to a T55x7, Q5/T5555 or EM4305/4469 tag.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.cn - KERI card ID
		 * @param {string} [options.type] - Type: "m" (MS) or "i" (Internal ID)
		 * @param {number|string} [options.fc] - Facility code (for MS type)
		 * @param {boolean} [options.q5] - Write to Q5/T5555 tag
		 * @param {boolean} [options.em] - Write to EM4305/4469 tag
		 *
		 * @example
		 * await lf.keri.clone({ type: "i", cn: 12345 });
		 * await lf.keri.clone({ type: "m", fc: 6, cn: 12345 });
		 * @returns {Promise<string>} Command output
		 */
		clone: async ({ cn, type, fc, q5, em } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (type !== undefined && type !== null) args.push("--type", String(type));
			if (fc !== undefined && fc !== null) args.push("--fc", String(fc));
			if (cn !== undefined && cn !== null) args.push("--cn", String(cn));
			if (q5) args.push("--q5");
			if (em) args.push("--em");
			return command(client.client, ["lf", "keri", "clone"])(args);
		},

		/**
		 * Try to find KERI preamble, if found decode / descramble data.
		 *
		 * @example
		 * await lf.keri.demod();
		 * @returns {Promise<string>} Command output
		 */
		demod: async () => {
			const client = await clientPromise;
			return command(client.client, ["lf", "keri", "demod"])([]);
		},

		/**
		 * Read a KERI tag.
		 *
		 * @param {Object} [options] - Options
		 * @param {boolean} [options.continuous] - Continuous reader mode
		 *
		 * @example
		 * await lf.keri.reader();
		 * await lf.keri.reader({ continuous: true });
		 * @returns {Promise<string>} Command output
		 */
		reader: async ({ continuous } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (continuous) args.push("-@");
			return command(client.client, ["lf", "keri", "reader"])(args);
		},

		/**
		 * Simulate a KERI card with internal ID.
		 * Simulation runs until the button is pressed or another USB command is issued.
		 *
		 * @param {Object} options - Options
		 * @param {number|string} options.id - KERI card ID
		 *
		 * @example
		 * await lf.keri.sim({ id: 112233 });
		 * @returns {Promise<string>} Command output
		 */
		sim: async ({ id }) => {
			const client = await clientPromise;
			const args = [];
			if (id !== undefined && id !== null) args.push("--id", String(id));
			return command(client.client, ["lf", "keri", "sim"])(args);
		},
	},
});
