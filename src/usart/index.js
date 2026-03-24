const command = require("../command");

/**
 * USART commands for Bluetooth add-on management on Proxmark3
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} Command functions for USART operations
 */
module.exports = (clientPromise) => ({
	/**
	 * Reset the BT add-on to factory settings.
	 * Requirements:
	 *   1) BTpower must be turned ON
	 *   2) BT add-on must NOT be connected (blue LED must be blinking)
	 * WARNING: only use if strictly needed!
	 *
	 * @example
	 * const output = await pm3.usart.btfactory();
	 *
	 * @returns {Promise<string>} Command output
	 */
	btfactory: async () => {
		const client = await clientPromise;
		return command(client.client, ["usart", "btfactory"])([]);
	},

	/**
	 * Change the BT add-on PIN.
	 * Requirements:
	 *   1) BTpower must be turned ON
	 *   2) BT add-on must NOT be connected (blue LED must be blinking)
	 *
	 * @param {string|number} pin - Desired PIN number (4 digits)
	 *
	 * @example
	 * const output = await pm3.usart.btpin("1234");
	 *
	 * @returns {Promise<string>} Command output
	 */
	btpin: async (pin) => {
		const client = await clientPromise;
		return command(client.client, ["usart", "btpin"])(["--pin", String(pin)]);
	}
});
