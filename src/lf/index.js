const client = require("../client");

const em = require("./em");
const createCommands = require("./commands");

const typeMap = {
	"EM410x": em["410x"]
};

module.exports = clientPromise => {
	const lf = {
		search: () => {
			return new Promise((resolve, reject) => {
				clientPromise.then(client => {
					client.command.lf.search.exec().then(output => {
						const card = lf.parse(output);

						resolve(card);
					});
				});
			});
		},

		parse: (output) => {
			if(output.indexOf("Valid") === -1) {
				return false;
			}

			const type = output.split("[+] Valid ")[1].split(" ID")[0];

			const chipset = output.split("Chipset detection: ")[1].split("\n")[0];

			const card = {
				type,
				chipset
			};

			const typeCard = typeMap[type];

			if(typeCard === undefined) {
				return card;
			}

			const cardType = typeCard(client);

			cardType.parse(output, card);

			return card;
		},

		write: (card, sourceCard) => {
			return new Promise((resolve, reject) => {
				clientPromise.then(client => {
					const typeCard = typeMap[card.type];

					if(typeCard === undefined) {
						return Promise.reject(`Unknown destination card ${card.type}`);
					}

					const cardType = typeCard(client);

					cardType.write(card, sourceCard).then(() => {
						lf.search(card => {
							if(card.id === sourceCard.id) {
								return resolve();
							}

							reject("Error writing card ID");
						})
					}).catch(reject);
				});
			});
		},

		// Merge in all auto-generated LF sub-command stubs
		...createCommands(clientPromise)
	};

	return lf;
};
