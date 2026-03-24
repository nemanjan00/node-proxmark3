const command = require("../command");

/**
 * Hardware commands for Proxmark3 device management.
 *
 * Provides low-level control over the Proxmark3 hardware including device
 * connectivity, debug levels, antenna tuning, memory access, FPGA control,
 * LCD interaction, mux configuration, and standalone mode management.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Hardware command functions
 */
module.exports = (clientPromise) => ({
	/**
	 * Send a break command to stop the current operation loop on the device.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.break();
	 */
	break: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "break"])([]);
	},

	/**
	 * Reboot the Proxmark3 into bootloader mode for firmware flashing.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.bootloader();
	 */
	bootloader: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "bootloader"])([]);
	},

	/**
	 * Connect to a Proxmark3 device via a serial port.
	 * Baudrate is only relevant for physical UART or UART-BT connections,
	 * not for USB-CDC or Blue Shark add-on.
	 *
	 * @param {Object} [options={}] - Connection options
	 * @param {string} [options.port] - Serial port to connect to (e.g. "/dev/ttyACM0"). If omitted, retries the last used port
	 * @param {number} [options.baud] - Baudrate for UART/BT connections (e.g. 115200)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Connect to a specific port
	 * await hw.connect({ port: "/dev/ttyACM0" });
	 *
	 * @example
	 * // Connect with explicit baudrate
	 * await hw.connect({ port: "/dev/ttyACM0", baud: 115200 });
	 *
	 * @example
	 * // Reconnect to last used port
	 * await hw.connect();
	 */
	connect: async ({ port, baud } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (port !== undefined && port !== null) args.push("--port", String(port));
		if (baud !== undefined && baud !== null) args.push("--baud", String(baud));
		return command(client.client, ["hw", "connect"])(args);
	},

	/**
	 * Set or get the device-side debug level.
	 *
	 * Debug levels:
	 * - 0: No debug messages
	 * - 1: Error messages only
	 * - 2: Error + information messages
	 * - 3: Error + information + debug messages
	 * - 4: All messages including timing-critical debug (may cause malfunctions
	 *       by introducing delays in time-critical functions like simulation or sniffing)
	 *
	 * When called without a level, returns the current debug level.
	 *
	 * @param {number} [level] - Debug level (0-4). Omit to query the current level
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Get current debug level
	 * await hw.dbg();
	 *
	 * @example
	 * // Set debug level to errors only
	 * await hw.dbg(1);
	 *
	 * @example
	 * // Enable full debug output (may affect timing)
	 * await hw.dbg(4);
	 */
	dbg: async (level) => {
		const client = await clientPromise;
		const args = [];
		if (level !== undefined && level !== null) {
			const l = Number(level);
			if (l < 0 || l > 4 || !Number.isInteger(l)) {
				throw new RangeError("Debug level must be an integer between 0 and 4");
			}
			args.push(`-${l}`);
		}
		return command(client.client, ["hw", "dbg"])(args);
	},

	/**
	 * Measure HF antenna decay after field-off.
	 * Captures how quickly the peak-detect capacitor voltage drops after
	 * the 13.56 MHz field is turned off. Different antenna loading conditions
	 * (unloaded, booster board, damaged) produce different decay profiles.
	 *
	 * @param {Object} [options={}] - Decay measurement options
	 * @param {number} [options.stabilizationMs=50] - Field stabilization time in milliseconds before measurement
	 * @param {number} [options.windowUs=2000] - Measurement window duration in microseconds
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Run with defaults (50ms stabilization, 2000us window)
	 * await hw.decay();
	 *
	 * @example
	 * // Longer stabilization and wider measurement window
	 * await hw.decay({ stabilizationMs: 100, windowUs: 5000 });
	 */
	decay: async ({ stabilizationMs, windowUs } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (stabilizationMs !== undefined && stabilizationMs !== null) args.push("--ms", String(stabilizationMs));
		if (windowUs !== undefined && windowUs !== null) args.push("--us", String(windowUs));
		return command(client.client, ["hw", "decay"])(args);
	},

	/**
	 * Detect the presence of an external reader field.
	 * Without options, detects both LF and HF fields.
	 *
	 * @param {Object} [options={}] - Detection options
	 * @param {string} [options.frequency] - Limit detection to a specific frequency band: "LF" (125/134 kHz) or "HF" (13.56 MHz)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Detect both LF and HF reader fields
	 * await hw.detectreader();
	 *
	 * @example
	 * // Detect only LF reader fields
	 * await hw.detectreader({ frequency: "LF" });
	 *
	 * @example
	 * // Detect only HF reader fields
	 * await hw.detectreader({ frequency: "HF" });
	 */
	detectreader: async ({ frequency } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (frequency !== undefined && frequency !== null) {
			const f = String(frequency).toUpperCase();
			if (f !== "LF" && f !== "HF") {
				throw new RangeError('Frequency must be "LF" or "HF"');
			}
			args.push(`--${f}`);
		}
		return command(client.client, ["hw", "detectreader"])(args);
	},

	/**
	 * Turn off the FPGA and antenna field.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.fpgaoff();
	 */
	fpgaoff: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "fpgaoff"])([]);
	},

	/**
	 * Send command/data to the device LCD.
	 *
	 * @param {Object} options - LCD command options
	 * @param {string} options.data - Hex data byte to send (e.g. "AA")
	 * @param {number} options.count - Number of times to send the data
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Send 0xAA three times
	 * await hw.lcd({ data: "AA", count: 3 });
	 */
	lcd: async ({ data, count }) => {
		const client = await clientPromise;
		const args = [];
		if (data === undefined || data === null) {
			throw new Error("data is required");
		}
		if (count === undefined || count === null) {
			throw new Error("count is required");
		}
		args.push("--raw", String(data));
		args.push("--cnt", String(count));
		return command(client.client, ["hw", "lcd"])(args);
	},

	/**
	 * Perform a hardware reset of the LCD.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.lcdreset();
	 */
	lcdreset: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "lcdreset"])([]);
	},

	/**
	 * Ping the Proxmark3 to test if it is responsive.
	 *
	 * @param {Object} [options={}] - Ping options
	 * @param {number} [options.length] - Length of the payload to send in the ping
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Simple ping
	 * await hw.ping();
	 *
	 * @example
	 * // Ping with a 32-byte payload
	 * await hw.ping({ length: 32 });
	 */
	ping: async ({ length } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (length !== undefined && length !== null) args.push("--len", String(length));
		return command(client.client, ["hw", "ping"])(args);
	},

	/**
	 * Read processor flash memory into a file or display on console.
	 *
	 * @param {Object} [options={}] - Memory read options
	 * @param {number} [options.address] - Flash address to start reading from
	 * @param {number} [options.length] - Number of bytes to read (default: 32 for display, 512KB for file)
	 * @param {string} [options.file] - File path to save the memory dump to
	 * @param {number} [options.columns] - Number of columns for console display formatting
	 * @param {boolean} [options.raw=false] - Use raw address mode to read from anywhere, not just flash
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Save full 512KB flash to file
	 * await hw.readmem({ file: "myfile" });
	 *
	 * @example
	 * // Display 512 bytes starting at offset 8192
	 * await hw.readmem({ address: 8192, length: 512 });
	 *
	 * @example
	 * // Read from arbitrary address using raw mode
	 * await hw.readmem({ address: 0x20000000, length: 256, raw: true });
	 */
	readmem: async ({ address, length, file, columns, raw } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (address !== undefined && address !== null) args.push("--adr", String(address));
		if (length !== undefined && length !== null) args.push("--len", String(length));
		if (file !== undefined && file !== null) args.push("--file", String(file));
		if (columns !== undefined && columns !== null) args.push("--cols", String(columns));
		if (raw) args.push("--raw");
		return command(client.client, ["hw", "readmem"])(args);
	},

	/**
	 * Reset the Proxmark3 device.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.reset();
	 */
	reset: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "reset"])([]);
	},

	/**
	 * Set the LF antenna divisor. The antenna is driven at 12 MHz / (divisor + 1).
	 * For example, divisor 95 gives 125 kHz (the standard LF frequency).
	 *
	 * @param {number} divisor - Divisor value (19-255). Standard LF is 95 (125 kHz)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Set LF frequency to ~136 kHz (12MHz / 89)
	 * await hw.setlfdivisor(88);
	 */
	setlfdivisor: async (divisor) => {
		const client = await clientPromise;
		if (divisor === undefined || divisor === null) {
			throw new Error("divisor is required");
		}
		return command(client.client, ["hw", "setlfdivisor"])(["--div", String(divisor)]);
	},

	/**
	 * Set thresholds for HF/14a and Legic mode operation.
	 *
	 * @param {Object} [options={}] - Threshold options
	 * @param {number} [options.reader=7] - Threshold used in 14a reader mode
	 * @param {number} [options.sniff=20] - High threshold used in 14a sniff mode
	 * @param {number} [options.legic=8] - Threshold used in Legic mode
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Set all thresholds
	 * await hw.sethfthresh({ reader: 7, sniff: 20, legic: 8 });
	 *
	 * @example
	 * // Adjust only the reader threshold
	 * await hw.sethfthresh({ reader: 10 });
	 */
	sethfthresh: async ({ reader, sniff, legic } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (reader !== undefined && reader !== null) args.push("--thresh", String(reader));
		if (sniff !== undefined && sniff !== null) args.push("--high", String(sniff));
		if (legic !== undefined && legic !== null) args.push("--legic", String(legic));
		return command(client.client, ["hw", "sethfthresh"])(args);
	},

	/**
	 * Set the ADC mux to a specific input.
	 * Exactly one mux value should be specified.
	 *
	 * @param {string} mux - Mux input to select: "lopkd" (low peak), "loraw" (low raw), "hipkd" (high peak), or "hiraw" (high raw)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Set mux to high peak detect
	 * await hw.setmux("hipkd");
	 *
	 * @example
	 * // Set mux to low raw
	 * await hw.setmux("loraw");
	 */
	setmux: async (mux) => {
		const client = await clientPromise;
		if (mux === undefined || mux === null) {
			throw new Error("mux is required");
		}
		const valid = ["lopkd", "loraw", "hipkd", "hiraw"];
		const m = String(mux).toLowerCase();
		if (!valid.includes(m)) {
			throw new RangeError(`mux must be one of: ${valid.join(", ")}`);
		}
		return command(client.client, ["hw", "setmux"])([`--${m}`]);
	},

	/**
	 * Start standalone mode on the device.
	 *
	 * @param {Object} [options={}] - Standalone mode options
	 * @param {number} [options.arg] - Argument byte to pass to the standalone mode
	 * @param {string} [options.unisniff] - UniSniff protocol argument: "14a", "14b", "15", or "iclass"
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Start standalone mode
	 * await hw.standalone();
	 *
	 * @example
	 * // Start with argument byte 1
	 * await hw.standalone({ arg: 1 });
	 *
	 * @example
	 * // Start UniSniff for ISO 14443A
	 * await hw.standalone({ unisniff: "14a" });
	 */
	standalone: async ({ arg, unisniff } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (arg !== undefined && arg !== null) args.push("--arg", String(arg));
		if (unisniff !== undefined && unisniff !== null) args.push("-b", String(unisniff));
		return command(client.client, ["hw", "standalone"])(args);
	},

	/**
	 * Show runtime status information about the connected Proxmark3.
	 *
	 * @param {Object} [options={}] - Status options
	 * @param {number} [options.timeout] - Speed test timeout in microseconds
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Get device status
	 * await hw.status();
	 *
	 * @example
	 * // Get status with 1000ms speed test timeout
	 * await hw.status({ timeout: 1000 });
	 */
	status: async ({ timeout } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (timeout !== undefined && timeout !== null) args.push("--ms", String(timeout));
		return command(client.client, ["hw", "status"])(args);
	},

	/**
	 * Configure a tear-off hook for the next write command that supports it.
	 * The hook triggers a power cut after a specified delay, useful for testing
	 * write-interrupt scenarios. After being triggered, the hook is automatically deactivated.
	 *
	 * @param {Object} [options={}] - Tear-off configuration options
	 * @param {number} [options.delay] - Delay in microseconds before triggering tear-off (1-43000). Precision is ~1/3 us
	 * @param {boolean} [options.on=false] - Activate (or reactivate) a previously defined tear-off hook
	 * @param {boolean} [options.off=false] - Deactivate a previously activated but not yet triggered hook
	 * @param {number} [options.skip] - Number of triggers to skip before activating the hook
	 * @param {boolean} [options.silent=false] - Produce less verbose output
	 * @param {boolean} [options.list=false] - List all commands that implement tear-off hooks
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Set a tear-off delay of 1200 microseconds
	 * await hw.tearoff({ delay: 1200 });
	 *
	 * @example
	 * // Reactivate a previously defined delay
	 * await hw.tearoff({ on: true });
	 *
	 * @example
	 * // Deactivate the hook
	 * await hw.tearoff({ off: true });
	 *
	 * @example
	 * // List commands that support tear-off
	 * await hw.tearoff({ list: true });
	 */
	tearoff: async ({ delay, on, off, skip, silent, list } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (delay !== undefined && delay !== null) args.push("--delay", String(delay));
		if (on) args.push("--on");
		if (off) args.push("--off");
		if (skip !== undefined && skip !== null) args.push("--skip", String(skip));
		if (silent) args.push("--silent");
		if (list) args.push("--list");
		return command(client.client, ["hw", "tearoff"])(args);
	},

	/**
	 * Set or show the client-side communication timeout.
	 * Called without options, displays the current timeout value.
	 *
	 * @param {Object} [options={}] - Timeout options
	 * @param {number} [options.ms] - Timeout value in microseconds
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Show current timeout
	 * await hw.timeout();
	 *
	 * @example
	 * // Set timeout to 500 microseconds
	 * await hw.timeout({ ms: 500 });
	 */
	timeout: async ({ ms } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (ms !== undefined && ms !== null) args.push("--ms", String(ms));
		return command(client.client, ["hw", "timeout"])(args);
	},

	/**
	 * Trigger a Timing Interval Acquisition to re-adjust the RealTimeCounter divider.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.tia();
	 */
	tia: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "tia"])([]);
	},

	/**
	 * Measure antenna tuning and display results.
	 * This is an informational command that measures voltage generated by the antennas;
	 * it does not actively tune them.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.tune();
	 */
	tune: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "tune"])([]);
	},

	/**
	 * Show version information about the client and the connected Proxmark3 device.
	 *
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * await hw.version();
	 */
	version: async () => {
		const client = await clientPromise;
		return command(client.client, ["hw", "version"])([]);
	},
});
