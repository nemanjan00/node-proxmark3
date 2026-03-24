const command = require("../command");

/**
 * LF root-level commands for Proxmark3: sampling configuration, reading,
 * simulation, sniffing, and antenna tuning.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} LF root command functions
 */
module.exports = (clientPromise) => ({
	config:
	/**
	 * Get or set LF sampling configuration.
	 * Controls bits per sample, decimation, frequency, trigger threshold, and skip count.
	 * These changes are temporary and will be reset after a power cycle.
	 * Called with no options, returns the current configuration.
	 *
	 * @param {Object} [options]
	 * @param {boolean} [options.reset] - Reset all values to defaults
	 * @param {boolean} [options.freq125] - Set frequency to 125 kHz
	 * @param {boolean} [options.freq134] - Set frequency to 134 kHz
	 * @param {number} [options.averaging] - Averaging when decimating: 0 = off, 1 = on
	 * @param {number} [options.bitsPerSample] - Resolution in bits per sample (1-8)
	 * @param {number} [options.decimation] - Decimation factor; saves 1 in N samples (1-8)
	 * @param {number} [options.divisor] - Manually set frequency divisor (19-255). 88 -> 134 kHz, 95 -> 125 kHz
	 * @param {number} [options.frequency] - Manually set frequency in kHz (47-600)
	 * @param {number} [options.skip] - Number of samples to skip before capture
	 * @param {number} [options.trigger] - Trigger threshold (0-128). 0 means no threshold
	 * @example
	 * // Show current config
	 * await pm3.lf.config();
	 * @example
	 * // Sample at 125 kHz, 8 bits per sample
	 * await pm3.lf.config({ bitsPerSample: 8, freq125: true });
	 * @example
	 * // Sample at 134 kHz, decimate by 3, 4 bits per sample
	 * await pm3.lf.config({ bitsPerSample: 4, freq134: true, decimation: 3 });
	 * @example
	 * // Set trigger and skip
	 * await pm3.lf.config({ trigger: 20, skip: 10000 });
	 * @example
	 * // Reset to defaults
	 * await pm3.lf.config({ reset: true });
	 * @returns {Promise<string>} Current or updated LF sampling configuration
	 */
	async ({ reset, freq125, freq134, averaging, bitsPerSample, decimation, divisor, frequency, skip, trigger } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (reset) args.push("--reset");
		if (freq125) args.push("--125");
		if (freq134) args.push("--134");
		if (averaging !== undefined && averaging !== null) args.push("--avg", String(averaging));
		if (bitsPerSample !== undefined && bitsPerSample !== null) args.push("--bps", String(bitsPerSample));
		if (decimation !== undefined && decimation !== null) args.push("--dec", String(decimation));
		if (divisor !== undefined && divisor !== null) args.push("--divisor", String(divisor));
		if (frequency !== undefined && frequency !== null) args.push("--freq", String(frequency));
		if (skip !== undefined && skip !== null) args.push("--skip", String(skip));
		if (trigger !== undefined && trigger !== null) args.push("--trig", String(trigger));
		return command(client.client, ["lf", "config"])(args);
	},

	cmdread:
	/**
	 * Modulate LF reader field to send a command before reading.
	 * All timing periods are specified in microseconds.
	 * Use `lf config` to set additional sampling parameters.
	 *
	 * @param {Object} [options]
	 * @param {number} [options.delay] - Delay OFF period in microseconds (0 for bitbang mode)
	 * @param {string} [options.cmd] - Command symbols to send (e.g. "W00110")
	 * @param {string|string[]} [options.extra] - Extra symbol definition(s) and duration (up to 4)
	 * @param {number} [options.one] - ONE time period in microseconds
	 * @param {number} [options.zero] - ZERO time period in microseconds
	 * @param {number} [options.samples] - Number of samples to collect
	 * @param {boolean} [options.verbose] - Verbose output
	 * @param {boolean} [options.keep] - Keep signal field ON after receive
	 * @param {boolean} [options.crcHt] - Calculate and append CRC-8/HITAG (also for ZX8211)
	 * @param {boolean} [options.continuous] - Continuous reading mode
	 * @example
	 * // Probe for Hitag 1/S
	 * await pm3.lf.cmdread({ delay: 50, zero: 116, one: 166, extra: "W3000", cmd: "W00110" });
	 * @example
	 * // Probe for Hitag 2/S in continuous oscilloscope style
	 * await pm3.lf.cmdread({ delay: 50, zero: 116, one: 166, extra: "W3000", cmd: "W11000", samples: 2000, continuous: true });
	 * @example
	 * // Probe for Hitag micro with multiple extra symbols
	 * await pm3.lf.cmdread({ delay: 48, zero: 112, one: 176, extra: ["W3000", "S240", "E336"], cmd: "W0S00000010000E" });
	 * @returns {Promise<string>} Command read output
	 */
	async ({ delay, cmd, extra, one, zero, samples, verbose, keep, crcHt, continuous } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (delay !== undefined && delay !== null) args.push("--duration", String(delay));
		if (cmd !== undefined && cmd !== null) args.push("--cmd", String(cmd));
		if (extra !== undefined && extra !== null) {
			const extras = Array.isArray(extra) ? extra : [extra];
			for (const e of extras) {
				args.push("--extra", String(e));
			}
		}
		if (one !== undefined && one !== null) args.push("--one", String(one));
		if (zero !== undefined && zero !== null) args.push("--zero", String(zero));
		if (samples !== undefined && samples !== null) args.push("--samples", String(samples));
		if (verbose) args.push("--verbose");
		if (keep) args.push("--keep");
		if (crcHt) args.push("--crc-ht");
		if (continuous) args.push("-@");
		return command(client.client, ["lf", "cmdread"])(args);
	},

	read:
	/**
	 * Read (sniff with active field) a low frequency tag.
	 * Use `lf config` to set sampling parameters beforehand.
	 * If the number of samples exceeds device memory (~40000), real-time sampling mode is used.
	 *
	 * @param {Object} [options]
	 * @param {number} [options.samples] - Number of samples to collect
	 * @param {boolean} [options.verbose] - Verbose output
	 * @param {boolean} [options.continuous] - Continuous reading mode (oscilloscope style)
	 * @example
	 * // Read 12000 samples with verbose output
	 * await pm3.lf.read({ samples: 12000, verbose: true });
	 * @example
	 * // Oscilloscope style continuous reading
	 * await pm3.lf.read({ samples: 3000, continuous: true });
	 * @returns {Promise<string>} Raw LF read output
	 */
	async ({ samples, verbose, continuous } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (samples !== undefined && samples !== null) args.push("--samples", String(samples));
		if (verbose) args.push("--verbose");
		if (continuous) args.push("-@");
		return command(client.client, ["lf", "read"])(args);
	},

	sim:
	/**
	 * Simulate a low frequency tag from the graph buffer.
	 * Use `lf config` to set parameters before simulating.
	 *
	 * @param {Object} [options]
	 * @param {number} [options.gap] - Start gap in microseconds
	 * @example
	 * // Simulate with default settings
	 * await pm3.lf.sim();
	 * @example
	 * // Simulate with a 240 us start gap
	 * await pm3.lf.sim({ gap: 240 });
	 * @returns {Promise<string>} Simulation output
	 */
	async ({ gap } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (gap !== undefined && gap !== null) args.push("--gap", String(gap));
		return command(client.client, ["lf", "sim"])(args);
	},

	simask:
	/**
	 * Simulate an ASK-modulated LF tag from DemodBuffer or provided data.
	 * Supports Manchester, Biphase, and Raw ASK encoding modes.
	 *
	 * @param {Object} [options]
	 * @param {string} [options.encoding] - ASK encoding mode: "manchester" (default), "biphase", or "raw"
	 * @param {boolean} [options.invert] - Invert data
	 * @param {number} [options.clock] - Clock rate (default 64); can autodetect from DemodBuffer
	 * @param {boolean} [options.stt] - Add T55xx Sequence Terminator gap (only for manchester)
	 * @param {string} [options.data] - Hex data to simulate; omit to use DemodBuffer
	 * @param {boolean} [options.verbose] - Verbose output
	 * @example
	 * // Simulate ASK/Manchester at rf/32
	 * await pm3.lf.simask({ clock: 32, encoding: "manchester", data: "0102030405" });
	 * @example
	 * // Simulate ASK/Biphase at rf/32
	 * await pm3.lf.simask({ clock: 32, encoding: "biphase", data: "0102030405" });
	 * @example
	 * // Simulate EM410x tag
	 * await pm3.lf.simask({ clock: 64, encoding: "manchester", data: "ffbd8001686f1924" });
	 * @example
	 * // Simulate VISA2K tag with STT
	 * await pm3.lf.simask({ clock: 64, encoding: "manchester", stt: true, data: "5649533200003F340000001B" });
	 * @returns {Promise<string>} Simulation output
	 */
	async ({ encoding, invert, clock, stt, data, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (encoding !== undefined && encoding !== null) {
			const enc = String(encoding).toLowerCase();
			if (enc === "biphase") args.push("--bi");
			else if (enc === "raw") args.push("--ar");
			else args.push("--am");
		}
		if (invert) args.push("--inv");
		if (clock !== undefined && clock !== null) args.push("--clk", String(clock));
		if (stt) args.push("--stt");
		if (data !== undefined && data !== null) args.push("--data", String(data));
		if (verbose) args.push("--verbose");
		return command(client.client, ["lf", "simask"])(args);
	},

	simfsk:
	/**
	 * Simulate an FSK-modulated LF tag from DemodBuffer or provided data.
	 * Common FSK modulations:
	 *   FSK1:  highFC=8,  lowFC=5  (inverted: highFC=5, lowFC=8)
	 *   FSK2:  highFC=10, lowFC=8  (inverted: highFC=8, lowFC=10)
	 * NOTE: if you set one clock value manually, set them all manually.
	 *
	 * @param {Object} [options]
	 * @param {number} [options.clock] - Clock rate (default 64); can autodetect from DemodBuffer
	 * @param {number} [options.lowFC] - Larger field clock value
	 * @param {number} [options.highFC] - Smaller field clock value
	 * @param {boolean} [options.stt] - Enable gap between playback repetitions
	 * @param {string} [options.data] - Hex data to simulate; omit to use DemodBuffer
	 * @param {boolean} [options.verbose] - Verbose output
	 * @example
	 * // Simulate FSK1 rf/40
	 * await pm3.lf.simfsk({ clock: 40, highFC: 8, lowFC: 5, data: "010203" });
	 * @example
	 * // Simulate FSK2 rf/64
	 * await pm3.lf.simfsk({ clock: 64, highFC: 10, lowFC: 8, data: "010203" });
	 * @example
	 * // Simulate HID Prox tag
	 * await pm3.lf.simfsk({ clock: 50, highFC: 10, lowFC: 8, data: "1D5559555569A9A555A59569" });
	 * @example
	 * // Simulate AWID tag with STT
	 * await pm3.lf.simfsk({ clock: 50, highFC: 10, lowFC: 8, stt: true, data: "011DB2487E8D811111111111" });
	 * @returns {Promise<string>} Simulation output
	 */
	async ({ clock, lowFC, highFC, stt, data, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (clock !== undefined && clock !== null) args.push("--clk", String(clock));
		if (lowFC !== undefined && lowFC !== null) args.push("--low", String(lowFC));
		if (highFC !== undefined && highFC !== null) args.push("--high", String(highFC));
		if (stt) args.push("--stt");
		if (data !== undefined && data !== null) args.push("--data", String(data));
		if (verbose) args.push("--verbose");
		return command(client.client, ["lf", "simfsk"])(args);
	},

	simpsk:
	/**
	 * Simulate a PSK-modulated LF tag from DemodBuffer or provided data.
	 * Supports PSK1 (default), PSK2, and PSK3 modulation types.
	 *
	 * @param {Object} [options]
	 * @param {number|string} [options.modulation] - PSK modulation type: 1 (PSK1, default), 2 (PSK2), or 3 (PSK3)
	 * @param {boolean} [options.invert] - Invert data
	 * @param {number} [options.clock] - Clock rate (default 32); can autodetect from DemodBuffer
	 * @param {number} [options.carrier] - Carrier frequency: 2 (default), 4, or 8
	 * @param {string} [options.data] - Hex data to simulate; omit to use DemodBuffer
	 * @param {boolean} [options.verbose] - Verbose output
	 * @example
	 * // Simulate PSK1 rf/40 fc/4
	 * await pm3.lf.simpsk({ modulation: 1, clock: 40, carrier: 4, data: "01020304" });
	 * @example
	 * // Simulate Indala tag
	 * await pm3.lf.simpsk({ modulation: 1, clock: 32, carrier: 2, data: "a0000000bd989a11" });
	 * @returns {Promise<string>} Simulation output
	 */
	async ({ modulation, invert, clock, carrier, data, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (modulation !== undefined && modulation !== null) {
			const mod = Number(modulation);
			if (mod === 1) args.push("--psk1");
			else if (mod === 2) args.push("--psk2");
			else if (mod === 3) args.push("--psk3");
		}
		if (invert) args.push("--inv");
		if (clock !== undefined && clock !== null) args.push("--clk", String(clock));
		if (carrier !== undefined && carrier !== null) args.push("--fc", String(carrier));
		if (data !== undefined && data !== null) args.push("--data", String(data));
		if (verbose) args.push("--verbose");
		return command(client.client, ["lf", "simpsk"])(args);
	},

	simbidir:
	/**
	 * Simulate a bidirectional LF tag.
	 * Simulates LF tag with bidirectional data transmission between reader and tag.
	 * Takes no parameters.
	 *
	 * @example
	 * await pm3.lf.simbidir();
	 * @returns {Promise<string>} Simulation output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["lf", "simbidir"])([]);
	},

	sniff:
	/**
	 * Sniff low frequency traffic (passive, no active field).
	 * Configure trigger and skip samples with `lf config` beforehand.
	 * If the number of samples exceeds device memory (~40000), real-time sampling mode is used.
	 *
	 * @param {Object} [options]
	 * @param {number} [options.samples] - Number of samples to collect
	 * @param {boolean} [options.verbose] - Verbose output
	 * @param {boolean} [options.continuous] - Continuous sniffing mode (oscilloscope style)
	 * @example
	 * // Sniff with verbose output
	 * await pm3.lf.sniff({ verbose: true });
	 * @example
	 * // Oscilloscope style continuous sniffing
	 * await pm3.lf.sniff({ samples: 3000, continuous: true });
	 * @returns {Promise<string>} Sniffed LF signal data
	 */
	async ({ samples, verbose, continuous } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (samples !== undefined && samples !== null) args.push("--samples", String(samples));
		if (verbose) args.push("--verbose");
		if (continuous) args.push("-@");
		return command(client.client, ["lf", "sniff"])(args);
	},

	tune:
	/**
	 * Measure LF antenna tuning.
	 * Continuously measures until button press, Enter key, or iteration limit is reached.
	 *
	 * @param {Object} [options]
	 * @param {number} [options.iterations] - Number of iterations (default 0 = infinite)
	 * @param {number} [options.divisor] - Frequency divisor (88 -> 134 kHz, 95 -> 125 kHz)
	 * @param {number} [options.frequency] - Frequency in kHz
	 * @param {string} [options.style] - Display style: "bar", "mix", or "value"
	 * @param {boolean} [options.verbose] - Verbose output
	 * @example
	 * // Default tuning measurement
	 * await pm3.lf.tune();
	 * @example
	 * // Mixed display style
	 * await pm3.lf.tune({ style: "mix" });
	 * @example
	 * // Run 100 iterations at 125 kHz
	 * await pm3.lf.tune({ iterations: 100, frequency: 125 });
	 * @returns {Promise<string>} Antenna tuning measurements
	 */
	async ({ iterations, divisor, frequency, style, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (iterations !== undefined && iterations !== null) args.push("--iter", String(iterations));
		if (divisor !== undefined && divisor !== null) args.push("--divisor", String(divisor));
		if (frequency !== undefined && frequency !== null) args.push("--freq", String(frequency));
		if (style !== undefined && style !== null) {
			const s = String(style).toLowerCase();
			if (s === "bar") args.push("--bar");
			else if (s === "mix") args.push("--mix");
			else if (s === "value") args.push("--value");
		}
		if (verbose) args.push("--verbose");
		return command(client.client, ["lf", "tune"])(args);
	},
});
