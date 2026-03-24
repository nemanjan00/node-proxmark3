const createSmall = require("./_parts_small");
const createIso = require("./_parts_iso");
const createMf = require("./_parts_mf");
const createMfx = require("./_parts_mfx");
const createOther = require("./_parts_other");

/**
 * High Frequency (13.56 MHz) RFID commands.
 *
 * Covers ISO 14443A/B, ISO 15693, MIFARE Classic/Ultralight/DESFire/Plus,
 * iCLASS, FeliCa, CIPURSE, SEOS, Legic, LTO, Topaz, NFC forum types,
 * and many more contactless smart card technologies.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} HF command tree with nested sub-groups
 */
module.exports = (clientPromise) => ({
	...createSmall(clientPromise),
	...createIso(clientPromise),
	...createMf(clientPromise),
	...createMfx(clientPromise),
	...createOther(clientPromise),
});
