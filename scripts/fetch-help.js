#!/usr/bin/env node

/**
 * Fetches --help output for every leaf command from the connected pm3 device.
 * Saves results to commands-help.json.
 *
 * Usage: PM3=/path/to/proxmark3 node scripts/fetch-help.js
 */

const createClient = require("../src/client");
const command = require("../src/command");
const commands = require("../commands.json");
const fs = require("fs");
const path = require("path");

const pm3Path = process.env.PM3;

if (!pm3Path) {
	console.error("PM3 environment variable is required");
	process.exit(1);
}

const SKIP = new Set(["auto", "clear", "hints", "msleep", "rem", "quit", "exit"]);

function collectLeaves(tree, pathArr = []) {
	const leaves = [];
	for (const [key, node] of Object.entries(tree)) {
		if (SKIP.has(key)) continue;
		const cur = [...pathArr, key];
		if (node.children) {
			leaves.push(...collectLeaves(node.children, cur));
		} else {
			leaves.push(cur);
		}
	}
	return leaves;
}

async function main() {
	const client = await createClient(pm3Path);
	const leaves = collectLeaves(commands);

	console.log(`Fetching help for ${leaves.length} commands...`);

	const helpData = {};
	let done = 0;

	for (const leafPath of leaves) {
		const key = leafPath.join("_");
		try {
			const result = await command(client.client, leafPath)(["-h"]);
			helpData[key] = result;
			done++;
			if (done % 50 === 0) {
				console.log(`  ${done}/${leaves.length}`);
			}
		} catch (err) {
			console.error(`  ERROR ${key}: ${err.message}`);
			helpData[key] = null;
		}
	}

	const outPath = path.join(__dirname, "..", "commands-help.json");
	fs.writeFileSync(outPath, JSON.stringify(helpData, null, 2));
	console.log(`\nDone. Saved ${done} help entries to ${outPath}`);

	// Kill the pm3 process
	if (client.client && client.client._child) {
		client.client._child.kill();
	}
	process.exit(0);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
