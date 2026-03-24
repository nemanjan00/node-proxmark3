const command = require("../command");

/**
 * Smart card ISO-7816 commands for interacting with contact smart cards
 * via the Proxmark3's SIM module.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Smart card command functions
 */
module.exports = (clientPromise) => ({
	/**
	 * List captured ISO-7816 smart card trace data with protocol annotations.
	 * Alias of `trace list -t 7816`. Loads trace from the device by default,
	 * or from a file if specified.
	 *
	 * @param {Object} [options={}] - Trace listing options
	 * @param {boolean} [options.buffer=false] - Use data from trace buffer instead of downloading from device
	 * @param {boolean} [options.frame=false] - Show frame delay times
	 * @param {boolean} [options.crc=false] - Mark CRC bytes in the output
	 * @param {boolean} [options.relative=false] - Show relative times (gap and duration)
	 * @param {boolean} [options.microseconds=false] - Display times in microseconds instead of clock cycles
	 * @param {boolean} [options.hexdump=false] - Show hexdump for pcap(ng) conversion or Wireshark import
	 * @param {string} [options.file] - Filename of trace file to load
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Show trace with frame delay times
	 * await smart.list({ frame: true });
	 *
	 * @example
	 * // Use trace buffer with CRC marking
	 * await smart.list({ buffer: true, crc: true });
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
		return command(client.client, ["smart", "list"])(args);
	},

	/**
	 * Bruteforce SFI (Short File Identifier) using a known list of AIDs.
	 *
	 * @param {Object} [options={}] - Brute force options
	 * @param {boolean} [options.tlv=false] - Execute TLV decoder on responses if possible
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Bruteforce with TLV decoding
	 * await smart.brute({ tlv: true });
	 */
	brute: async ({ tlv } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (tlv) args.push("--tlv");
		return command(client.client, ["smart", "brute"])(args);
	},

	/**
	 * Extract detailed information from a smart card including ATR parsing.
	 *
	 * @param {Object} [options={}] - Info options
	 * @param {boolean} [options.verbose=false] - Show verbose output with additional details
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Get smart card info
	 * await smart.info();
	 *
	 * @example
	 * // Get verbose smart card info
	 * await smart.info({ verbose: true });
	 */
	info: async ({ verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (verbose) args.push("--verbose");
		return command(client.client, ["smart", "info"])(args);
	},

	/**
	 * Make the Proxmark3 available to the host OS smartcard driver via vpcd,
	 * enabling use with other software such as GlobalPlatform Pro.
	 *
	 * @param {Object} [options={}] - PCSC bridge options
	 * @param {string} [options.host] - vpcd socket host (default: "localhost")
	 * @param {number} [options.port] - vpcd socket port (default: 35963)
	 * @param {boolean} [options.verbose=false] - Display APDU transactions between OS and card
	 * @param {string} [options.interface] - Card interface to use: "14a" (ISO 14443A contactless), "14b" (ISO 14443B contactless), or "contact" (ISO 7816 contact)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Bridge using contactless ISO 14443A interface
	 * await smart.pcsc({ interface: "14a" });
	 *
	 * @example
	 * // Bridge using contact interface with verbose APDU logging
	 * await smart.pcsc({ interface: "contact", verbose: true });
	 *
	 * @example
	 * // Bridge on a custom host and port
	 * await smart.pcsc({ host: "192.168.1.10", port: 9999, interface: "14a" });
	 */
	pcsc: async ({ host, port, verbose, interface: iface } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (host !== undefined && host !== null) args.push("--host", String(host));
		if (port !== undefined && port !== null) args.push("--port", String(port));
		if (verbose) args.push("--verbose");
		if (iface !== undefined && iface !== null) {
			const ifaceMap = { "14a": "-a", "14b": "-b", "contact": "-c" };
			const flag = ifaceMap[String(iface).toLowerCase()];
			if (!flag) {
				throw new RangeError('interface must be one of: "14a", "14b", "contact"');
			}
			args.push(flag);
		}
		return command(client.client, ["smart", "pcsc"])(args);
	},

	/**
	 * Act as a smart card reader and display card information.
	 *
	 * @param {Object} [options={}] - Reader options
	 * @param {boolean} [options.verbose=false] - Show verbose output
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Read smart card
	 * await smart.reader();
	 *
	 * @example
	 * // Read with verbose output
	 * await smart.reader({ verbose: true });
	 */
	reader: async ({ verbose } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (verbose) args.push("--verbose");
		return command(client.client, ["smart", "reader"])(args);
	},

	/**
	 * Send raw bytes to a smart card and optionally read the response.
	 *
	 * @param {Object} options - Raw command options
	 * @param {string} options.data - Hex bytes to send to the card (required)
	 * @param {boolean} [options.noResponse=false] - Do not read the response from the card
	 * @param {boolean} [options.activateNoSelect=false] - Activate smartcard without SELECT (reset SC module)
	 * @param {boolean} [options.activateWithSelect=false] - Activate smartcard with SELECT (get ATR)
	 * @param {boolean} [options.tlv=false] - Execute TLV decoder on response if possible
	 * @param {boolean} [options.t0=false] - Use protocol T=0 instead of T=1
	 * @param {number} [options.timeout] - Timeout in milliseconds waiting for SIM to respond (default: 337)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Select PPSE directory with ATR
	 * await smart.raw({ activateWithSelect: true, t0: true, data: "00a404000e315041592e5359532e4444463031" });
	 *
	 * @example
	 * // Send Mastercard AID with TLV decoding
	 * await smart.raw({ t0: true, tlv: true, data: "00a4040007a0000000041010" });
	 */
	raw: async ({ data, noResponse, activateNoSelect, activateWithSelect, tlv, t0, timeout }) => {
		const client = await clientPromise;
		if (data === undefined || data === null) {
			throw new Error("data is required");
		}
		const args = [];
		if (noResponse) args.push("-r");
		if (activateNoSelect) args.push("-a");
		if (activateWithSelect) args.push("-s");
		if (tlv) args.push("--tlv");
		if (t0) args.push("-0");
		if (timeout !== undefined && timeout !== null) args.push("--timeout", String(timeout));
		args.push("--data", String(data));
		return command(client.client, ["smart", "raw"])(args);
	},

	/**
	 * Upgrade the RDV4 SIM module firmware.
	 *
	 * WARNING: A dangerous command. Incorrect usage could brick the SIM module.
	 *
	 * @param {Object} options - Upgrade options
	 * @param {string} options.file - Firmware binary file name to flash (required)
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Flash SIM module firmware
	 * await smart.upgrade({ file: "sim014.bin" });
	 */
	upgrade: async ({ file }) => {
		const client = await clientPromise;
		if (file === undefined || file === null) {
			throw new Error("file is required");
		}
		return command(client.client, ["smart", "upgrade"])(["--file", String(file)]);
	},

	/**
	 * Set the clock speed for the smart card interface.
	 *
	 * @param {string} speed - Clock speed to set: "4mhz", "8mhz", or "16mhz"
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Set clock to 4 MHz
	 * await smart.setclock("4mhz");
	 *
	 * @example
	 * // Set clock to 16 MHz
	 * await smart.setclock("16mhz");
	 */
	setclock: async (speed) => {
		const client = await clientPromise;
		if (speed === undefined || speed === null) {
			throw new Error("speed is required");
		}
		const valid = ["4mhz", "8mhz", "16mhz"];
		const s = String(speed).toLowerCase();
		if (!valid.includes(s)) {
			throw new RangeError(`speed must be one of: ${valid.join(", ")}`);
		}
		return command(client.client, ["smart", "setclock"])(["--" + s]);
	},
});
