const createCard = require("./_parts_card");
const createCard2 = require("./_parts_card2");
const createRoot = require("./_parts_root");

/**
 * All LF sub-command stubs with JSDoc.
 * Merged into the main LF module alongside custom search/parse/write logic.
 *
 * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client
 * @returns {Object} LF sub-command tree
 */
module.exports = (clientPromise) => ({
	...createCard(clientPromise),
	...createCard2(clientPromise),
	...createRoot(clientPromise),
});
