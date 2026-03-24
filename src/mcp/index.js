#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const createClient = require("../client");
const command = require("../command");
const commands = require("../../commands.json");

let helpData = {};
try {
	helpData = require("../../commands-help.json");
} catch (e) {
	// Fall back to commands.json descriptions if help data not available
}

const pm3Path = process.env.PM3;

if (!pm3Path) {
	console.error("PM3 environment variable is required (path to proxmark3 binary)");
	process.exit(1);
}

const clientPromise = createClient(pm3Path);

const server = new McpServer({
	name: "proxmark3",
	version: "0.0.6"
});

const SKIP_COMMANDS = new Set([
	"quit", "exit", "clear", "msleep", "rem", "hints", "auto"
]);

/**
 * Build a rich tool description from commands-help.json data.
 */
function buildToolDescription(toolKey, fallbackDesc) {
	const help = helpData[toolKey];
	if (!help) return fallbackDesc;

	const parts = [help.description || fallbackDesc];

	if (help.usage) {
		parts.push("");
		parts.push("Usage: " + help.usage);
	}

	if (help.options && help.options.length > 0) {
		parts.push("");
		parts.push("Options:");
		for (const opt of help.options) {
			const desc = opt.description ? " - " + opt.description : "";
			parts.push("  " + opt.flag + desc);
		}
	}

	if (help.examples && help.examples.length > 0) {
		parts.push("");
		parts.push("Examples:");
		for (const ex of help.examples) {
			parts.push("  " + ex);
		}
	}

	return parts.join("\n");
}

/**
 * Collect leaf commands from the commands.json tree.
 */
function collectLeaves(tree, path = []) {
	const leaves = [];
	for (const [key, node] of Object.entries(tree)) {
		const currentPath = [...path, key];
		if (node.children) {
			leaves.push(...collectLeaves(node.children, currentPath));
		} else {
			leaves.push({ path: currentPath, description: node.description || key });
		}
	}
	return leaves;
}

const leaves = collectLeaves(commands);

for (const leaf of leaves) {
	const toolName = leaf.path.join("_");
	const lastSegment = leaf.path[leaf.path.length - 1];

	if (SKIP_COMMANDS.has(lastSegment)) continue;
	if (toolName === "lf_search") continue;

	const description = buildToolDescription(toolName, leaf.description);

	server.tool(
		toolName,
		description,
		{ args: z.string().optional().describe("Additional arguments for the command") },
		async ({ args }) => {
			const client = await clientPromise;
			const extraArgs = args ? args.split(" ") : [];
			const result = await command(client.client, leaf.path)(extraArgs);
			return { content: [{ type: "text", text: result }] };
		}
	);
}

// Manual tools

server.tool(
	"pm3_command",
	"Execute any arbitrary proxmark3 command",
	{ command: z.string().describe("The pm3 command to execute (e.g. 'hw version')") },
	async ({ command: cmd }) => {
		const client = await clientPromise;
		const args = cmd.split(" ");
		const result = await command(client.client, [])(args);
		return { content: [{ type: "text", text: result }] };
	}
);

// Custom LF tools with parsing logic
const createLf = require("../lf");
const lf = createLf(clientPromise);

server.tool(
	"lf_search",
	"Search for LF RFID cards on the reader. Returns parsed card info including type, chipset, and ID.",
	{},
	async () => {
		const card = await lf.search();
		if (!card) {
			return { content: [{ type: "text", text: "No LF card found" }] };
		}
		return { content: [{ type: "text", text: JSON.stringify(card, null, 2) }] };
	}
);

server.tool(
	"lf_write",
	"Clone/write a source ID to a destination card on the reader",
	{
		card_type: z.string().describe("Card type (e.g. 'EM410x')"),
		source_id: z.string().describe("Source card ID to write")
	},
	async ({ card_type, source_id }) => {
		const card = await lf.search();
		if (!card) {
			return { content: [{ type: "text", text: "No destination card found on reader" }] };
		}
		const sourceCard = { id: source_id, type: card_type };
		await lf.write(card, sourceCard);
		return { content: [{ type: "text", text: `Successfully wrote ID ${source_id} to ${card_type} card` }] };
	}
);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});

const cleanup = async () => {
	const client = await clientPromise.catch(() => null);
	if (client && client.client && client.client._child) {
		client.client._child.kill();
	}
	process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
