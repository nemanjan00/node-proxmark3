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

let clientPromise = createClient(pm3Path);

async function restartClient() {
	try {
		const old = await clientPromise.catch(() => null);
		if (old && old.client && old.client._child) {
			old.client._child.kill();
		}
	} catch (e) {}
	clientPromise = createClient(pm3Path);
	return clientPromise;
}

const server = new McpServer({
	name: "proxmark3",
	version: "0.0.11"
});

const SKIP_COMMANDS = new Set([
	"quit", "exit", "clear", "msleep", "rem", "hints", "auto"
]);

/**
 * Parse a flag string into a canonical name and metadata.
 * e.g. "-k, --key <hex>" => { name: "key", flag: "--key", hasValue: true, valueType: "hex" }
 *      "--q5"            => { name: "q5", flag: "--q5", hasValue: false }
 *      "-0"              => { name: "0", flag: "-0", hasValue: false }
 */
function parseFlag(flagStr) {
	const valueMatch = flagStr.match(/<([^>]+)>/);
	const hasValue = !!valueMatch;
	const valueType = valueMatch ? valueMatch[1] : null;

	const parts = flagStr.replace(/<[^>]+>/, "").trim().split(",").map(s => s.trim());
	const longFlag = parts.find(p => p.startsWith("--"));
	const shortFlag = parts.find(p => p.match(/^-[^-]/));

	let flag, name;
	if (longFlag) {
		flag = longFlag.split(/\s/)[0];
		name = flag.replace(/^--/, "");
	} else if (shortFlag) {
		flag = shortFlag.split(/\s/)[0];
		name = flag.replace(/^-/, "");
	} else {
		return null;
	}

	// Clean name for use as zod key
	name = name.replace(/[^a-zA-Z0-9_]/g, "_");

	return { name, flag, hasValue, valueType };
}

/**
 * Build a tool description string from help data.
 */
function buildDescription(help, fallbackDesc) {
	if (!help) return fallbackDesc;

	const parts = [help.description || fallbackDesc];

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
 * Build a zod schema and arg builder from help options.
 * Returns { schema, buildArgs } where buildArgs(params) => string[]
 */
function buildToolSchema(help) {
	if (!help || !help.options || help.options.length === 0) {
		return null;
	}

	const schema = {};
	const paramDefs = [];

	for (const opt of help.options) {
		const parsed = parseFlag(opt.flag);
		if (!parsed) continue;

		const desc = opt.description || "";

		if (parsed.hasValue) {
			schema[parsed.name] = z.string().optional().describe(desc);
		} else {
			schema[parsed.name] = z.boolean().optional().describe(desc);
		}

		paramDefs.push(parsed);
	}

	if (Object.keys(schema).length === 0) return null;

	const buildArgs = (params) => {
		const args = [];
		for (const def of paramDefs) {
			const val = params[def.name];
			if (val === undefined || val === null || val === false) continue;
			if (def.hasValue) {
				args.push(def.flag, String(val));
			} else if (val === true) {
				args.push(def.flag);
			}
		}
		return args;
	};

	return { schema, buildArgs };
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

	const help = helpData[toolName];
	const description = buildDescription(help, leaf.description);
	const toolSchema = buildToolSchema(help);

	if (toolSchema) {
		// Tool with structured parameters
		server.tool(
			toolName,
			description,
			toolSchema.schema,
			async (params) => {
				const client = await clientPromise;
				const args = toolSchema.buildArgs(params);
				const result = await command(client.client, leaf.path)(args);
				return { content: [{ type: "text", text: result }] };
			}
		);
	} else {
		// No-arg tool
		server.tool(
			toolName,
			description,
			{},
			async () => {
				const client = await clientPromise;
				const result = await command(client.client, leaf.path)([]);
				return { content: [{ type: "text", text: result }] };
			}
		);
	}
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

server.tool(
	"pm3_restart",
	"Kill the current proxmark3 client process and start a fresh one. Useful during development or when the connection is stuck.",
	{},
	async () => {
		await restartClient();
		return { content: [{ type: "text", text: "Proxmark3 client restarted" }] };
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
