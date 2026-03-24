const command = require("../command");

/**
 * Client and device preference commands for persistent configuration
 * of display, timing, paths, and communication settings.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Preference command functions with get/set sub-groups
 */
module.exports = (clientPromise) => ({
	/**
	 * Get (read) preference sub-commands. Each returns the current value
	 * of the named preference.
	 */
	get: {
		/**
		 * Get the current HF/LF tune bar mode display preference.
		 *
		 * @returns {Promise<string>} Command output showing current bar mode
		 *
		 * @example
		 * await prefs.get.barmode();
		 */
		barmode: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "barmode"])([]);
		},

		/**
		 * Get the current client-side debug level preference.
		 *
		 * @returns {Promise<string>} Command output showing current debug level
		 *
		 * @example
		 * await prefs.get.clientDebug();
		 */
		clientDebug: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "client.debug"])([]);
		},

		/**
		 * Get the current client command execution delay preference.
		 *
		 * @returns {Promise<string>} Command output showing current delay
		 *
		 * @example
		 * await prefs.get.clientDelay();
		 */
		clientDelay: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "client.delay"])([]);
		},

		/**
		 * Get the current client communication timeout preference.
		 *
		 * @returns {Promise<string>} Command output showing current timeout
		 *
		 * @example
		 * await prefs.get.clientTimeout();
		 */
		clientTimeout: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "client.timeout"])([]);
		},

		/**
		 * Get the current color output preference.
		 *
		 * @returns {Promise<string>} Command output showing current color setting
		 *
		 * @example
		 * await prefs.get.color();
		 */
		color: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "color"])([]);
		},

		/**
		 * Get the current file save paths preference.
		 *
		 * @returns {Promise<string>} Command output showing current save paths
		 *
		 * @example
		 * await prefs.get.savepaths();
		 */
		savepaths: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "savepaths"])([]);
		},

		/**
		 * Get the current emoji display preference.
		 *
		 * @returns {Promise<string>} Command output showing current emoji setting
		 *
		 * @example
		 * await prefs.get.emoji();
		 */
		emoji: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "emoji"])([]);
		},

		/**
		 * Get the current hint messages display preference.
		 *
		 * @returns {Promise<string>} Command output showing current hints setting
		 *
		 * @example
		 * await prefs.get.hints();
		 */
		hints: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "hints"])([]);
		},

		/**
		 * Get the current dump output style preference.
		 *
		 * @returns {Promise<string>} Command output showing current output style
		 *
		 * @example
		 * await prefs.get.output();
		 */
		output: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "output"])([]);
		},

		/**
		 * Get the current plot slider control visibility preference.
		 *
		 * @returns {Promise<string>} Command output showing current plot slider setting
		 *
		 * @example
		 * await prefs.get.plotsliders();
		 */
		plotsliders: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "plotsliders"])([]);
		},

		/**
		 * Get the current MQTT settings preference.
		 *
		 * @returns {Promise<string>} Command output showing current MQTT settings
		 *
		 * @example
		 * await prefs.get.mqtt();
		 */
		mqtt: async () => {
			const client = await clientPromise;
			return command(client.client, ["prefs", "get", "mqtt"])([]);
		},
	},

	/**
	 * Set (write) preference sub-commands. Each persists a new value
	 * for the named preference.
	 */
	set: {
		/**
		 * Set the HF/LF tune command output bar mode.
		 *
		 * @param {string} mode - Display mode: "bar" (bar only), "mix" (numbers and bar), or "val" (values only)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await prefs.set.barmode("mix");
		 *
		 * @example
		 * await prefs.set.barmode("bar");
		 */
		barmode: async (mode) => {
			const client = await clientPromise;
			if (mode === undefined || mode === null) {
				throw new Error("mode is required");
			}
			const valid = ["bar", "mix", "val"];
			const m = String(mode).toLowerCase();
			if (!valid.includes(m)) {
				throw new RangeError(`mode must be one of: ${valid.join(", ")}`);
			}
			return command(client.client, ["prefs", "set", "barmode"])(["--" + m]);
		},

		/**
		 * Set the client-side debug level.
		 *
		 * @param {string} level - Debug level: "off" (no messages), "simple" (basic messages), or "full" (all messages)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await prefs.set.clientDebug("simple");
		 *
		 * @example
		 * await prefs.set.clientDebug("off");
		 */
		clientDebug: async (level) => {
			const client = await clientPromise;
			if (level === undefined || level === null) {
				throw new Error("level is required");
			}
			const valid = ["off", "simple", "full"];
			const l = String(level).toLowerCase();
			if (!valid.includes(l)) {
				throw new RangeError(`level must be one of: ${valid.join(", ")}`);
			}
			return command(client.client, ["prefs", "set", "client.debug"])(["--" + l]);
		},

		/**
		 * Set the delay before executing a command in the client.
		 *
		 * @param {number} ms - Delay in microseconds (0 to unset any delay)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Set 1000ms delay
		 * await prefs.set.clientDelay(1000);
		 *
		 * @example
		 * // Remove delay
		 * await prefs.set.clientDelay(0);
		 */
		clientDelay: async (ms) => {
			const client = await clientPromise;
			if (ms === undefined || ms === null) {
				throw new Error("ms is required");
			}
			return command(client.client, ["prefs", "set", "client.delay"])(["--ms", String(ms)]);
		},

		/**
		 * Set the client communication timeout.
		 *
		 * @param {number} ms - Timeout in microseconds (0 to unset any timeout)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Set 500ms timeout
		 * await prefs.set.clientTimeout(500);
		 *
		 * @example
		 * // Remove timeout
		 * await prefs.set.clientTimeout(0);
		 */
		clientTimeout: async (ms) => {
			const client = await clientPromise;
			if (ms === undefined || ms === null) {
				throw new Error("ms is required");
			}
			return command(client.client, ["prefs", "set", "client.timeout"])(["--ms", String(ms)]);
		},

		/**
		 * Set the color output mode.
		 *
		 * @param {string} mode - Color mode: "ansi" (use ANSI colors) or "off" (no colors)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await prefs.set.color("ansi");
		 *
		 * @example
		 * await prefs.set.color("off");
		 */
		color: async (mode) => {
			const client = await clientPromise;
			if (mode === undefined || mode === null) {
				throw new Error("mode is required");
			}
			const valid = ["ansi", "off"];
			const m = String(mode).toLowerCase();
			if (!valid.includes(m)) {
				throw new RangeError(`mode must be one of: ${valid.join(", ")}`);
			}
			return command(client.client, ["prefs", "set", "color"])(["--" + m]);
		},

		/**
		 * Set the emoji display mode.
		 *
		 * @param {string} mode - Emoji mode: "alias" (show alias text), "emoji" (show emoji), "alttext" (show alt text), or "none" (hide all)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await prefs.set.emoji("alias");
		 *
		 * @example
		 * await prefs.set.emoji("none");
		 */
		emoji: async (mode) => {
			const client = await clientPromise;
			if (mode === undefined || mode === null) {
				throw new Error("mode is required");
			}
			const valid = ["alias", "emoji", "alttext", "none"];
			const m = String(mode).toLowerCase();
			if (!valid.includes(m)) {
				throw new RangeError(`mode must be one of: ${valid.join(", ")}`);
			}
			return command(client.client, ["prefs", "set", "emoji"])(["--" + m]);
		},

		/**
		 * Set hint message visibility.
		 *
		 * @param {boolean} enabled - Whether to show hint messages
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Enable hints
		 * await prefs.set.hints(true);
		 *
		 * @example
		 * // Disable hints
		 * await prefs.set.hints(false);
		 */
		hints: async (enabled) => {
			const client = await clientPromise;
			if (enabled === undefined || enabled === null) {
				throw new Error("enabled is required");
			}
			return command(client.client, ["prefs", "set", "hints"])([enabled ? "--on" : "--off"]);
		},

		/**
		 * Set file save paths for dumps, traces, and default output.
		 *
		 * @param {Object} [options={}] - Save path options
		 * @param {boolean} [options.create=false] - Create directories if they do not exist
		 * @param {string} [options.defaultPath] - Default file save path
		 * @param {string} [options.dumpPath] - Dump file save path
		 * @param {string} [options.tracePath] - Trace file save path
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Set dump file path
		 * await prefs.set.savepaths({ dumpPath: "/home/mydumpfolder" });
		 *
		 * @example
		 * // Set default path and create if needed
		 * await prefs.set.savepaths({ defaultPath: "/home/myfolder", create: true });
		 */
		savepaths: async ({ create, defaultPath, dumpPath, tracePath } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (create) args.push("--create");
			if (defaultPath !== undefined && defaultPath !== null) args.push("--def", String(defaultPath));
			if (dumpPath !== undefined && dumpPath !== null) args.push("--dump", String(dumpPath));
			if (tracePath !== undefined && tracePath !== null) args.push("--trace", String(tracePath));
			return command(client.client, ["prefs", "set", "savepaths"])(args);
		},

		/**
		 * Set the dump output style to condense or expand consecutive repeated data.
		 *
		 * @param {string} style - Output style: "normal" (full output) or "dense" (condensed repeated data)
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * await prefs.set.output("normal");
		 *
		 * @example
		 * await prefs.set.output("dense");
		 */
		output: async (style) => {
			const client = await clientPromise;
			if (style === undefined || style === null) {
				throw new Error("style is required");
			}
			const valid = ["normal", "dense"];
			const s = String(style).toLowerCase();
			if (!valid.includes(s)) {
				throw new RangeError(`style must be one of: ${valid.join(", ")}`);
			}
			return command(client.client, ["prefs", "set", "output"])(["--" + s]);
		},

		/**
		 * Set plot slider control visibility.
		 *
		 * @param {boolean} enabled - Whether to show plot slider controls
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Show plot sliders
		 * await prefs.set.plotsliders(true);
		 *
		 * @example
		 * // Hide plot sliders
		 * await prefs.set.plotsliders(false);
		 */
		plotsliders: async (enabled) => {
			const client = await clientPromise;
			if (enabled === undefined || enabled === null) {
				throw new Error("enabled is required");
			}
			return command(client.client, ["prefs", "set", "plotsliders"])([enabled ? "--on" : "--off"]);
		},

		/**
		 * Set MQTT server connection preferences.
		 *
		 * @param {Object} [options={}] - MQTT options
		 * @param {string} [options.server] - MQTT server hostname or IP
		 * @param {number|string} [options.port] - MQTT server port
		 * @param {string} [options.topic] - MQTT topic to publish to
		 * @returns {Promise<string>} Command output
		 *
		 * @example
		 * // Set MQTT server
		 * await prefs.set.mqtt({ server: "test.mosquito.com" });
		 *
		 * @example
		 * // Set full MQTT configuration
		 * await prefs.set.mqtt({ server: "test.mosquito.com", port: 1883, topic: "proxdump" });
		 */
		mqtt: async ({ server, port, topic } = {}) => {
			const client = await clientPromise;
			const args = [];
			if (server !== undefined && server !== null) args.push("--srv", String(server));
			if (port !== undefined && port !== null) args.push("--port", String(port));
			if (topic !== undefined && topic !== null) args.push("--topic", String(topic));
			return command(client.client, ["prefs", "set", "mqtt"])(args);
		},
	},

	/**
	 * Show all persistent preferences and their current values.
	 *
	 * @param {Object} [options={}] - Show options
	 * @param {boolean} [options.json=false] - Output preferences as JSON
	 * @returns {Promise<string>} Command output
	 *
	 * @example
	 * // Show all preferences
	 * await prefs.show();
	 *
	 * @example
	 * // Show preferences as JSON
	 * await prefs.show({ json: true });
	 */
	show: async ({ json } = {}) => {
		const client = await clientPromise;
		const args = [];
		if (json) args.push("--json");
		return command(client.client, ["prefs", "show"])(args);
	},
});
