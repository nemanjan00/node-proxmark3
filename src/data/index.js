const command = require("../command");

/**
 * Plot window / data buffer manipulation commands
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Data command functions
 */
module.exports = (clientPromise) => ({
	clear: /**
	 * Clear the BigBuf on device side and the graph window (GraphBuffer)
	 *
	 * @example
	 * // Clear all buffers
	 * await data.clear();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "clear"])([]);
	},

	hide: /**
	 * Hide the graph window
	 *
	 * @example
	 * // Hide the plot window
	 * await data.hide();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "hide"])([]);
	},

	load: /**
	 * Load the contents of a pm3 file into the graph window
	 *
	 * @param {Object} options - Load options
	 * @param {string} options.file - file to load
	 * @param {boolean} [options.bin=false] - load as binary file
	 * @param {boolean} [options.noFix=false] - load data without any transformations
	 * @example
	 * // Load a trace file
	 * await data.load({ file: "myfilename" });
	 * // Load a binary file without transformations
	 * await data.load({ file: "myfilename", bin: true, noFix: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ file, bin, noFix } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (file !== undefined && file !== null) args.push("--file", String(file));
		if (bin) args.push("--bin");
		if (noFix) args.push("--no-fix");
		return command(client.client, ["data", "load"])(args);
	},

	num: /**
	 * Print a number in decimal, hexadecimal, and binary representations.
	 * Will also indicate if the number is prime.
	 *
	 * @param {Object} options - Number input (provide one of dec, hex, or bin)
	 * @param {number|string} [options.dec] - decimal value
	 * @param {string} [options.hex] - hexadecimal value
	 * @param {string} [options.bin] - binary value
	 * @param {boolean} [options.invert=false] - print inverted value
	 * @param {boolean} [options.reverse=false] - print reversed value
	 * @example
	 * // Show representations of decimal 2023
	 * await data.num({ dec: 2023 });
	 * // Show representations of hex 2A
	 * await data.num({ hex: "2A" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ dec, hex, bin, invert, reverse } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (dec !== undefined && dec !== null) args.push("--dec", String(dec));
		if (hex !== undefined && hex !== null) args.push("--hex", String(hex));
		if (bin !== undefined && bin !== null) args.push("--bin", String(bin));
		if (invert) args.push("-i");
		if (reverse) args.push("-r");
		return command(client.client, ["data", "num"])(args);
	},

	plot: /**
	 * Show the graph window.
	 * Press 'h' in the window for keystroke help.
	 *
	 * @example
	 * // Open the plot window
	 * await data.plot();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "plot"])([]);
	},

	print: /**
	 * Print the data in the DemodBuffer as hex or binary.
	 * Defaults to binary output.
	 *
	 * @param {Object} [options] - Print options
	 * @param {boolean} [options.invert=false] - invert DemodBuffer before printing
	 * @param {number} [options.offset] - offset in number of bits
	 * @param {boolean} [options.strip=false] - strip leading zeroes (set offset to first 1-bit)
	 * @param {boolean} [options.hex=false] - output in hex instead of binary
	 * @example
	 * // Print demod buffer as binary
	 * await data.print();
	 * // Print demod buffer as hex, inverted
	 * await data.print({ hex: true, invert: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ invert, offset, strip, hex } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (invert) args.push("--inv");
		if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
		if (strip) args.push("--strip");
		if (hex) args.push("--hex");
		return command(client.client, ["data", "print"])(args);
	},

	save: /**
	 * Save signal trace from the graph window (GraphBuffer) to a file.
	 * Output is a text file with values -127 to 127, or a .wav file with --wave.
	 * Filename should be provided without file extension.
	 *
	 * @param {Object} options - Save options
	 * @param {string} options.file - save file name (without extension)
	 * @param {boolean} [options.wave=false] - save as wave format (.wav)
	 * @example
	 * // Save graph buffer to text file
	 * await data.save({ file: "myfilename" });
	 * // Save graph buffer to wave file
	 * await data.save({ file: "myfilename", wave: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ file, wave } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (wave) args.push("--wave");
		if (file !== undefined && file !== null) args.push("--file", String(file));
		return command(client.client, ["data", "save"])(args);
	},

	setdebugmode: /**
	 * Set debugging level on client side
	 *
	 * @param {Object} [options] - Debug options
	 * @param {number|string} [options.level] - debug level: 0 = off, 1 = debug, 2 = verbose
	 * @example
	 * // Set verbose debugging
	 * await data.setdebugmode({ level: 2 });
	 * // Disable debug messages
	 * await data.setdebugmode({ level: 0 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ level } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (level !== undefined && level !== null) args.push("-" + String(level));
		return command(client.client, ["data", "setdebugmode"])(args);
	},

	xor: /**
	 * XOR input hex data with a xor string.
	 * If no xor string is provided, tries the most recurring value to xor against.
	 *
	 * @param {Object} options - XOR options
	 * @param {string} options.data - input hex string
	 * @param {string} [options.xor] - xor hex string
	 * @example
	 * // Auto-detect XOR key
	 * await data.xor({ data: "99aabbcc8888888888" });
	 * // XOR with explicit key
	 * await data.xor({ data: "99aabbcc", xor: "88888888" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ data, xor } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (data !== undefined && data !== null) args.push("--data", String(data));
		if (xor !== undefined && xor !== null) args.push("--xor", String(xor));
		return command(client.client, ["data", "xor"])(args);
	},

	// --- Modulation commands ---

	biphaserawdecode: /**
	 * Biphase decode binary stream in DemodBuffer.
	 * Converts 10 or 01 -> 1 and 11 or 00 -> 0.
	 * Must have binary sequence in DemodBuffer (run rawdemod with mode "ar" before).
	 * Use invert for Conditional Dephase Encoding (CDP) / Differential Manchester.
	 *
	 * @param {Object} [options] - Decode options
	 * @param {boolean} [options.offset=false] - adjust decode start position
	 * @param {boolean} [options.invert=false] - invert output
	 * @param {number} [options.maxErrors] - max errors tolerated (default 20)
	 * @example
	 * // Decode biphase bitstream
	 * await data.biphaserawdecode();
	 * // Decode with offset adjustment and inverted output
	 * await data.biphaserawdecode({ offset: true, invert: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ offset, invert, maxErrors } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (offset) args.push("--offset");
		if (invert) args.push("--inv");
		if (maxErrors !== undefined && maxErrors !== null) args.push("--err", String(maxErrors));
		return command(client.client, ["data", "biphaserawdecode"])(args);
	},

	detectclock: /**
	 * Detect clock rate of wave in GraphBuffer for a given modulation type.
	 *
	 * @param {Object} [options] - Detection options
	 * @param {string} [options.modulation] - modulation type: "ask", "fsk", "nzr", or "psk"
	 * @example
	 * // Detect ASK modulation clock
	 * await data.detectclock({ modulation: "ask" });
	 * // Detect NRZ/Direct modulation clock
	 * await data.detectclock({ modulation: "nzr" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ modulation } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (modulation) args.push("--" + String(modulation));
		return command(client.client, ["data", "detectclock"])(args);
	},

	fsktonrz: /**
	 * Convert FSK2 to NRZ wave for alternate FSK demodulating (useful for weak FSK signals).
	 * Omitted values are autodetected.
	 *
	 * @param {Object} [options] - Conversion options
	 * @param {number} [options.clock] - clock rate
	 * @param {number} [options.low] - low field clock
	 * @param {number} [options.high] - high field clock
	 * @example
	 * // Autodetect all parameters
	 * await data.fsktonrz();
	 * // Specify clock and field clocks
	 * await data.fsktonrz({ clock: 32, low: 8, high: 10 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ clock, low, high } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (clock !== undefined && clock !== null) args.push("--clk", String(clock));
		if (low !== undefined && low !== null) args.push("--low", String(low));
		if (high !== undefined && high !== null) args.push("--hi", String(high));
		return command(client.client, ["data", "fsktonrz"])(args);
	},

	manrawdecode: /**
	 * Manchester decode binary stream in DemodBuffer.
	 * Converts 10 and 01 to 0 and 1 respectively.
	 * Must have binary sequence in DemodBuffer (run rawdemod with mode "ar" before).
	 *
	 * @param {Object} [options] - Decode options
	 * @param {boolean} [options.invert=false] - invert output
	 * @param {number} [options.maxErrors] - max errors tolerated (default 20)
	 * @example
	 * // Manchester decode
	 * await data.manrawdecode();
	 * // Manchester decode with inverted output
	 * await data.manrawdecode({ invert: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ invert, maxErrors } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (invert) args.push("--inv");
		if (maxErrors !== undefined && maxErrors !== null) args.push("--err", String(maxErrors));
		return command(client.client, ["data", "manrawdecode"])(args);
	},

	modulation: /**
	 * Identify LF signal clock and modulation type
	 *
	 * @example
	 * // Search for signal modulation
	 * await data.modulation();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "modulation"])([]);
	},

	rawdemod: /**
	 * Demodulate the data in the GraphBuffer and output binary.
	 *
	 * @param {Object} [options] - Demodulation options
	 * @param {string} [options.mode] - demodulation mode: "ab" (ASK/Biphase), "am" (ASK/Manchester), "ar" (ASK/Raw), "fs" (FSK), "nr" (NRZ/Direct), "p1" (PSK1), "p2" (PSK2)
	 * @example
	 * // Demod FSK with autodetect
	 * await data.rawdemod({ mode: "fs" });
	 * // Demod ASK/Manchester with autodetect
	 * await data.rawdemod({ mode: "am" });
	 * // Demod PSK1 with autodetect
	 * await data.rawdemod({ mode: "p1" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ mode } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (mode) args.push("--" + String(mode));
		return command(client.client, ["data", "rawdemod"])(args);
	},

	// --- Graph manipulation commands ---

	askedgedetect: /**
	 * Adjust graph for manual ASK demod using the length of sample differences
	 * to detect the edge of a wave.
	 *
	 * @param {Object} [options] - Detection options
	 * @param {number} [options.threshold] - threshold value, use 20-45 (default 25)
	 * @example
	 * // Detect edges with threshold 20
	 * await data.askedgedetect({ threshold: 20 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ threshold } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (threshold !== undefined && threshold !== null) args.push("--thres", String(threshold));
		return command(client.client, ["data", "askedgedetect"])(args);
	},

	autocorr: /**
	 * Autocorrelation over a window, used to detect repeating sequences.
	 * Detects how long in bits a message inside the signal is.
	 *
	 * @param {Object} [options] - Autocorrelation options
	 * @param {boolean} [options.save=false] - save result back to GraphBuffer (overwrite)
	 * @param {number} [options.window] - window length for correlation (default 4000)
	 * @example
	 * // Autocorrelate with default window
	 * await data.autocorr({ window: 4000 });
	 * // Autocorrelate and save to graph buffer
	 * await data.autocorr({ window: 4000, save: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ save, window } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (save) args.push("-g");
		if (window !== undefined && window !== null) args.push("--win", String(window));
		return command(client.client, ["data", "autocorr"])(args);
	},

	convertbitstream: /**
	 * Convert GraphBuffer's 0/1 values to 127/-127
	 *
	 * @example
	 * // Convert bitstream values
	 * await data.convertbitstream();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "convertbitstream"])([]);
	},

	cthreshold: /**
	 * Center threshold: average out all values between the up and down thresholds.
	 * Inverse of dirthreshold.
	 *
	 * @param {Object} options - Threshold options
	 * @param {number} options.down - threshold down
	 * @param {number} options.up - threshold up
	 * @example
	 * // Center threshold between -10 and 10
	 * await data.cthreshold({ up: 10, down: -10 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ down, up }) => {
		const client = await clientPromise;
		const args = [];
		args.push("--down", String(down));
		args.push("--up", String(up));
		return command(client.client, ["data", "cthreshold"])(args);
	},

	dirthreshold: /**
	 * Directional threshold: keep only rising values above up-threshold and
	 * falling values below down-threshold, keeping the rest as previous value.
	 *
	 * @param {Object} options - Threshold options
	 * @param {number} options.down - threshold down
	 * @param {number} options.up - threshold up
	 * @example
	 * // Apply directional threshold
	 * await data.dirthreshold({ up: 10, down: -10 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ down, up }) => {
		const client = await clientPromise;
		const args = [];
		args.push("--down", String(down));
		args.push("--up", String(up));
		return command(client.client, ["data", "dirthreshold"])(args);
	},

	decimate: /**
	 * Decimate samples by reducing the sample set N times in the GraphBuffer.
	 * Useful for PSK signals.
	 *
	 * @param {Object} [options] - Decimation options
	 * @param {number} [options.factor] - factor to reduce sample set (default 2)
	 * @example
	 * // Decimate by default factor (2)
	 * await data.decimate();
	 * // Decimate by factor of 4
	 * await data.decimate({ factor: 4 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ factor } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (factor !== undefined && factor !== null) args.push("-n", String(factor));
		return command(client.client, ["data", "decimate"])(args);
	},

	envelope: /**
	 * Create a square envelope of the samples in the GraphBuffer
	 *
	 * @example
	 * // Apply square envelope
	 * await data.envelope();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "envelope"])([]);
	},

	getbitstream: /**
	 * Convert GraphBuffer values to a bitstream.
	 * Values greater than or equal to 1 become 1, values less than 1 become 0.
	 *
	 * @example
	 * // Convert graph to bitstream
	 * await data.getbitstream();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "getbitstream"])([]);
	},

	grid: /**
	 * Overlay a grid on the graph plot window.
	 * Use zero or omit values to turn off grid lines.
	 *
	 * @param {Object} [options] - Grid options
	 * @param {number} [options.x] - grid X spacing
	 * @param {number} [options.y] - grid Y spacing
	 * @example
	 * // Turn off grid
	 * await data.grid();
	 * // Set grid spacing
	 * await data.grid({ x: 64, y: 50 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ x, y } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (x !== undefined && x !== null) args.push("-x", String(x));
		if (y !== undefined && y !== null) args.push("-y", String(y));
		return command(client.client, ["data", "grid"])(args);
	},

	hpf: /**
	 * Remove DC offset from trace, centralizing the signal around zero
	 *
	 * @example
	 * // Apply high-pass filter
	 * await data.hpf();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "hpf"])([]);
	},

	iir: /**
	 * Apply IIR Butterworth filter on plot data
	 *
	 * @param {Object} options - Filter options
	 * @param {number} options.factor - filter factor n
	 * @example
	 * // Apply IIR filter with factor 2
	 * await data.iir({ factor: 2 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ factor }) => {
		const client = await clientPromise;
		const args = [];
		args.push("-n", String(factor));
		return command(client.client, ["data", "iir"])(args);
	},

	ltrim: /**
	 * Trim samples from the left side of the trace
	 *
	 * @param {Object} options - Trim options
	 * @param {number} options.index - index in graph buffer; all samples from 0 to this index are removed
	 * @example
	 * // Remove samples from start up to index 300
	 * await data.ltrim({ index: 300 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ index }) => {
		const client = await clientPromise;
		const args = [];
		args.push("--idx", String(index));
		return command(client.client, ["data", "ltrim"])(args);
	},

	mtrim: /**
	 * Keep only samples between start and end indices, trimming everything outside.
	 *
	 * @param {Object} options - Trim options
	 * @param {number} options.start - start index
	 * @param {number} options.end - end index
	 * @example
	 * // Keep only samples between 1000 and 2000
	 * await data.mtrim({ start: 1000, end: 2000 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ start, end }) => {
		const client = await clientPromise;
		const args = [];
		args.push("--start", String(start));
		args.push("--end", String(end));
		return command(client.client, ["data", "mtrim"])(args);
	},

	norm: /**
	 * Normalize the GraphBuffer, scaling max/min to +/-128
	 *
	 * @example
	 * // Normalize the graph data
	 * await data.norm();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "norm"])([]);
	},

	rtrim: /**
	 * Trim samples from the right side of the trace
	 *
	 * @param {Object} options - Trim options
	 * @param {number} options.index - index in graph buffer; all samples from this index to end are removed
	 * @example
	 * // Remove samples from index 4000 to end
	 * await data.rtrim({ index: 4000 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ index }) => {
		const client = await clientPromise;
		const args = [];
		args.push("--idx", String(index));
		return command(client.client, ["data", "rtrim"])(args);
	},

	setgraphmarkers: /**
	 * Set the locations of the markers in the graph window.
	 * Called with no arguments, all markers are reset.
	 *
	 * @param {Object} [options] - Marker options
	 * @param {boolean} [options.keep=false] - keep current values for unspecified markers instead of resetting
	 * @param {number} [options.a] - yellow marker position
	 * @param {number} [options.b] - purple marker position
	 * @param {number} [options.c] - orange marker position
	 * @param {number} [options.d] - blue marker position
	 * @example
	 * // Reset all markers
	 * await data.setgraphmarkers();
	 * // Set yellow marker, reset the rest
	 * await data.setgraphmarkers({ a: 64 });
	 * // Set blue marker, keep the rest unchanged
	 * await data.setgraphmarkers({ d: 100, keep: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ keep, a, b, c, d } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (keep) args.push("--keep");
		if (a !== undefined && a !== null) args.push("-a", String(a));
		if (b !== undefined && b !== null) args.push("-b", String(b));
		if (c !== undefined && c !== null) args.push("-c", String(c));
		if (d !== undefined && d !== null) args.push("-d", String(d));
		return command(client.client, ["data", "setgraphmarkers"])(args);
	},

	shiftgraphzero: /**
	 * Shift the zero point of the graphed wave by a positive or negative amount
	 *
	 * @param {Object} options - Shift options
	 * @param {number} options.shift - number of points to shift (positive or negative)
	 * @example
	 * // Shift zero point by 10
	 * await data.shiftgraphzero({ shift: 10 });
	 * // Shift zero point by -22
	 * await data.shiftgraphzero({ shift: -22 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ shift }) => {
		const client = await clientPromise;
		const args = [];
		args.push("-n", String(shift));
		return command(client.client, ["data", "shiftgraphzero"])(args);
	},

	timescale: /**
	 * Set cursor display timescale for the graph window.
	 * Makes the differential reading between yellow and purple markers display as a time duration.
	 *
	 * @param {Object} options - Timescale options
	 * @param {number|string} options.sampleRate - timescale factor based on sampling rate
	 * @param {string} [options.unit] - time unit to display (max 10 chars, e.g. "ms", "us", "ETU")
	 * @example
	 * // LF sampled at 125 kHz, display in milliseconds
	 * await data.timescale({ sampleRate: 125, unit: "ms" });
	 * // HF with 16 samples per ETU
	 * await data.timescale({ sampleRate: 16, unit: "ETU" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ sampleRate, unit } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (sampleRate !== undefined && sampleRate !== null) args.push("--sr", String(sampleRate));
		if (unit !== undefined && unit !== null) args.push("--unit", String(unit));
		return command(client.client, ["data", "timescale"])(args);
	},

	undecimate: /**
	 * Un-decimate samples by repeating each sample N times in the GraphBuffer
	 *
	 * @param {Object} [options] - Un-decimation options
	 * @param {number} [options.factor] - factor to repeat each sample (default 2)
	 * @example
	 * // Un-decimate by default factor (2)
	 * await data.undecimate();
	 * // Un-decimate by factor of 4
	 * await data.undecimate({ factor: 4 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ factor } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (factor !== undefined && factor !== null) args.push("-n", String(factor));
		return command(client.client, ["data", "undecimate"])(args);
	},

	zerocrossings: /**
	 * Count time between zero-crossings in the GraphBuffer
	 *
	 * @example
	 * // Analyze zero crossings
	 * await data.zerocrossings();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "zerocrossings"])([]);
	},

	// --- Utility commands ---

	asn1: /**
	 * Decode an ASN.1 encoded byte array
	 *
	 * @param {Object} [options] - Decode options
	 * @param {string} [options.data] - ASN.1 encoded hex byte array
	 * @param {boolean} [options.test=false] - run self tests
	 * @example
	 * // Decode ASN.1 data
	 * await data.asn1({ data: "303381050186922305a5020500" });
	 * // Run self tests
	 * await data.asn1({ test: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ data, test } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (data !== undefined && data !== null) args.push("-d", String(data));
		if (test) args.push("--test");
		return command(client.client, ["data", "asn1"])(args);
	},

	atr: /**
	 * Look up an ATR (Answer To Reset) record from a byte array
	 *
	 * @param {Object} [options] - ATR options
	 * @param {string} [options.data] - ATR hex byte array
	 * @example
	 * // Look up ATR
	 * await data.atr({ data: "3B6B00000031C064BE1B0100079000" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ data } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (data !== undefined && data !== null) args.push("-d", String(data));
		return command(client.client, ["data", "atr"])(args);
	},

	bitsamples: /**
	 * Get raw samples from device as a bitstring
	 *
	 * @example
	 * // Fetch bitsamples from device
	 * await data.bitsamples();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "bitsamples"])([]);
	},

	bmap: /**
	 * Break down a hex value to binary according to a bit-width template.
	 *
	 * @param {Object} [options] - Bitmap options
	 * @param {string} [options.data] - hex string to break down
	 * @param {string} [options.map] - binary template as comma-separated widths (e.g. "4,4" or "2,5,1")
	 * @example
	 * // Break down hex value with default output
	 * await data.bmap({ data: "3B" });
	 * // Break down with custom bit-width template
	 * await data.bmap({ data: "3B", map: "2,5,1" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ data, map } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (data !== undefined && data !== null) args.push("-d", String(data));
		if (map !== undefined && map !== null) args.push("-m", String(map));
		return command(client.client, ["data", "bmap"])(args);
	},

	crypto: /**
	 * Encrypt or decrypt data using DES, 3DES, or AES.
	 * By default uses AES encryption. Use the des flag for DES/3DES, and decrypt to reverse.
	 *
	 * @param {Object} options - Crypto options
	 * @param {string} options.data - hex data to process
	 * @param {string} options.key - hex key to use
	 * @param {boolean} [options.decrypt=false] - decrypt instead of encrypt
	 * @param {boolean} [options.des=false] - use DES cipher instead of AES
	 * @param {boolean} [options.mac=false] - calculate AES CMAC / FeliCa Lite MAC
	 * @param {string} [options.iv] - IV value as hex (needed for DES MAC or AES)
	 * @example
	 * // Encrypt data with AES
	 * await data.crypto({ data: "00112233", key: "AABBCCDD" });
	 * // Decrypt data with DES
	 * await data.crypto({ data: "00112233", key: "AABBCCDD", des: true, decrypt: true });
	 * // Calculate AES CMAC
	 * await data.crypto({ data: "00112233", key: "AABBCCDD", mac: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ data, key, decrypt, des, mac, iv } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (data !== undefined && data !== null) args.push("--data", String(data));
		if (key !== undefined && key !== null) args.push("--key", String(key));
		if (decrypt) args.push("--rev");
		if (des) args.push("--des");
		if (mac) args.push("--mac");
		if (iv !== undefined && iv !== null) args.push("--iv", String(iv));
		return command(client.client, ["data", "crypto"])(args);
	},

	diff: /**
	 * Binary comparison of two data sources. Accepts filenames (filesystem or
	 * RDV4 flash SPIFFS), emulator memory, or magic gen1 card data.
	 *
	 * @param {Object} [options] - Diff options
	 * @param {string} [options.fileA] - input file name A (local filesystem)
	 * @param {string} [options.fileB] - input file name B (local filesystem)
	 * @param {boolean} [options.emulator=false] - use emulator memory as source B
	 * @param {string} [options.spiffsA] - input SPIFFS file name A (device flash)
	 * @param {string} [options.spiffsB] - input SPIFFS file name B (device flash)
	 * @param {number} [options.width] - output width: 4, 8, or 16
	 * @example
	 * // Compare two local files
	 * await data.diff({ fileA: "hf-mfu-01020304.bin", fileB: "hf-mfu-04030201.bin", width: 4 });
	 * // Compare local file against emulator memory
	 * await data.diff({ fileA: "dump.bin", emulator: true });
	 * // Compare two SPIFFS files
	 * await data.diff({ spiffsA: "fileA", spiffsB: "fileB" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ fileA, fileB, emulator, spiffsA, spiffsB, width } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (fileA !== undefined && fileA !== null) args.push("-a", String(fileA));
		if (fileB !== undefined && fileB !== null) args.push("-b", String(fileB));
		if (emulator) args.push("--eb");
		if (spiffsA !== undefined && spiffsA !== null) args.push("--fa", String(spiffsA));
		if (spiffsB !== undefined && spiffsB !== null) args.push("--fb", String(spiffsB));
		if (width !== undefined && width !== null) args.push("-w", String(width));
		return command(client.client, ["data", "diff"])(args);
	},

	hexsamples: /**
	 * Dump the big buffer as hex bytes
	 *
	 * @param {Object} [options] - Dump options
	 * @param {number} [options.count] - number of bytes to download
	 * @param {string} [options.offset] - offset in big buffer (hex)
	 * @param {number} [options.rowBreak] - bytes per row (default 16)
	 * @example
	 * // Dump 128 bytes from offset 0
	 * await data.hexsamples({ count: 128 });
	 * @returns {Promise<string>} Command output
	 */
	async ({ count, offset, rowBreak } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (rowBreak !== undefined && rowBreak !== null) args.push("--breaks", String(rowBreak));
		if (count !== undefined && count !== null) args.push("-n", String(count));
		if (offset !== undefined && offset !== null) args.push("--offset", String(offset));
		return command(client.client, ["data", "hexsamples"])(args);
	},

	samples: /**
	 * Get raw samples for the graph window (GraphBuffer) from device.
	 * If count is 0 or omitted, retrieves the entire big buffer.
	 *
	 * @param {Object} [options] - Sample options
	 * @param {number} [options.count] - number of samples to retrieve (512-40000)
	 * @param {boolean} [options.verbose=false] - verbose output
	 * @example
	 * // Get all samples
	 * await data.samples();
	 * // Get 10000 samples with verbose output
	 * await data.samples({ count: 10000, verbose: true });
	 * @returns {Promise<string>} Command output
	 */
	async ({ count, verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (count !== undefined && count !== null) args.push("-n", String(count));
		if (verbose) args.push("--verbose");
		return command(client.client, ["data", "samples"])(args);
	},

	qrcode: /**
	 * Generate a QR code from input data
	 *
	 * @param {Object} [options] - QR code options
	 * @param {string} [options.file] - output filename
	 * @param {string} [options.data] - message as hex bytes
	 * @example
	 * // Generate QR code to file
	 * await data.qrcode({ file: "output.png" });
	 * // Generate QR code from hex data
	 * await data.qrcode({ data: "123456789" });
	 * @returns {Promise<string>} Command output
	 */
	async ({ file, data } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (file !== undefined && file !== null) args.push("--file", String(file));
		if (data !== undefined && data !== null) args.push("--data", String(data));
		return command(client.client, ["data", "qrcode"])(args);
	},

	// --- Test commands ---

	testSs8: /**
	 * Test the implementation of Buffer Save States (8-bit buffer)
	 *
	 * @example
	 * // Run 8-bit buffer save state tests
	 * await data.testSs8();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "test_ss8"])([]);
	},

	testSs32: /**
	 * Test the implementation of Buffer Save States (32-bit buffer)
	 *
	 * @example
	 * // Run 32-bit buffer save state tests
	 * await data.testSs32();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "test_ss32"])([]);
	},

	testSs32s: /**
	 * Test the implementation of Buffer Save States (32-bit signed buffer)
	 *
	 * @example
	 * // Run 32-bit signed buffer save state tests
	 * await data.testSs32s();
	 * @returns {Promise<string>} Command output
	 */
	async () => {
		const client = await clientPromise;
		return command(client.client, ["data", "test_ss32s"])([]);
	},
});
