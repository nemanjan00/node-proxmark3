#!/usr/bin/env node

/**
 * Generates JS module stubs with JSDoc for all pm3 command groups.
 *
 * Reads commands.json for tree structure and commands-help.json for
 * detailed help (usage, options, examples) from `pm3 --fulltext`.
 *
 * Each leaf command gets named parameters derived from its --help output,
 * with JSDoc documenting usage, options, and examples.
 *
 * Existing src/lf/index.js is preserved (has custom parsing logic).
 * LF sub-commands are generated into src/lf/commands.js.
 */

const fs = require("fs");
const path = require("path");

const commands = require("../commands.json");

let helpData = {};
const helpPath = path.join(__dirname, "..", "commands-help.json");
if (fs.existsSync(helpPath)) {
	helpData = require(helpPath);
}

const SKIP_GROUPS = new Set(["auto", "clear", "hints", "msleep", "rem", "quit", "exit"]);
const PRESERVE_MODULES = new Set(["lf"]);

const srcDir = path.join(__dirname, "..", "src");

// Reserved JS keywords that can't be used as parameter names
const RESERVED = new Set([
	"break", "case", "catch", "continue", "debugger", "default", "delete",
	"do", "else", "finally", "for", "function", "if", "in", "instanceof",
	"new", "return", "switch", "this", "throw", "try", "typeof", "var",
	"void", "while", "with", "class", "const", "enum", "export", "extends",
	"import", "super", "implements", "interface", "let", "package", "private",
	"protected", "public", "static", "yield"
]);

function needsQuoting(key) {
	return /^[0-9]/.test(key) || /[^a-zA-Z0-9_$]/.test(key);
}

/**
 * Parse an option flag string into a structured param definition.
 *
 * Examples:
 *   "--id <hex>"         -> { name: "id", flag: "--id", hasValue: true, valueType: "hex" }
 *   "-k, --key <hex>"    -> { name: "key", flag: "--key", hasValue: true, valueType: "hex" }
 *   "-v, --verbose"      -> { name: "verbose", flag: "--verbose", hasValue: false }
 *   "-a"                 -> { name: "a", flag: "-a", hasValue: false }
 *   "-0"                 -> { name: "_0", flag: "-0", hasValue: false }
 */
function parseOption(flagStr) {
	// Match value type like <dec>, <hex>, <str>, <fn>, <ms>
	const valueMatch = flagStr.match(/<([^>]+)>/);
	const hasValue = !!valueMatch;
	const valueType = valueMatch ? valueMatch[1] : null;

	// Get the canonical flag name (prefer long form)
	const parts = flagStr.replace(/<[^>]+>/, "").trim().split(",").map(s => s.trim());
	let flag, name;

	const longFlag = parts.find(p => p.startsWith("--"));
	const shortFlag = parts.find(p => p.match(/^-[^-]/));

	if (longFlag) {
		flag = longFlag.split(/\s/)[0];
		name = flag.replace(/^--/, "");
	} else if (shortFlag) {
		flag = shortFlag.split(/\s/)[0];
		name = flag.replace(/^-/, "");
	} else {
		return null;
	}

	// Sanitize name for JS identifier
	name = name.replace(/[^a-zA-Z0-9_$]/g, "_");
	if (/^[0-9]/.test(name)) name = "_" + name;
	if (RESERVED.has(name)) name = name + "_";

	return { name, flag, hasValue, valueType, shortFlag: shortFlag ? shortFlag.split(/\s/)[0] : null };
}

/**
 * Build JSDoc + function body for a leaf command.
 */
function buildLeafCode(pathParts, fallbackDesc, indent) {
	const tab = "\t".repeat(indent);
	const helpKey = pathParts.join("_");
	const help = helpData[helpKey];
	const argsStr = JSON.stringify(pathParts);

	const lines = [];
	lines.push(`${tab}/**`);

	let params = [];

	if (help) {
		const desc = (help.description || fallbackDesc || "").replace(/\*/g, "");
		if (desc) {
			for (const descLine of desc.split("\n")) {
				lines.push(`${tab} * ${descLine}`);
			}
		}

		if (help.usage) {
			lines.push(`${tab} *`);
			lines.push(`${tab} * Usage: \`${help.usage}\``);
		}

		if (help.options && help.options.length > 0) {
			lines.push(`${tab} *`);

			for (const opt of help.options) {
				const parsed = parseOption(opt.flag);
				if (parsed) {
					params.push({ ...parsed, description: opt.description });
				}
			}

			// Document each param
			for (const p of params) {
				if (p.hasValue) {
					const jsType = (p.valueType === "dec" || p.valueType === "ms") ? "number|string" : "string";
					lines.push(`${tab} * @param {${jsType}} [options.${p.name}] - ${p.description || ""}`);
				} else {
					lines.push(`${tab} * @param {boolean} [options.${p.name}] - ${p.description || ""}`);
				}
			}
		}

		if (help.examples && help.examples.length > 0) {
			lines.push(`${tab} *`);
			lines.push(`${tab} * @example`);
			for (const ex of help.examples) {
				lines.push(`${tab} * ${ex}`);
			}
		}
	} else {
		const desc = (fallbackDesc || "").replace(/\*/g, "");
		lines.push(`${tab} * ${desc}`);
	}

	lines.push(`${tab} * @returns {Promise<string>} Command output`);
	lines.push(`${tab} */`);

	// Generate function with named params
	if (params.length > 0) {
		// Build destructured parameter names
		const paramNames = params.map(p => p.name);
		const deduped = deduplicateNames(paramNames);
		// Update param names with deduped versions
		for (let i = 0; i < params.length; i++) {
			params[i].name = deduped[i];
		}

		lines.push(`${tab}async ({ ${deduped.join(", ")} } = {}) => {`);
		lines.push(`${tab}\tconst client = await clientPromise;`);
		lines.push(`${tab}\tconst args = [];`);

		for (const p of params) {
			if (p.hasValue) {
				lines.push(`${tab}\tif (${p.name} !== undefined && ${p.name} !== null) args.push("${p.flag}", String(${p.name}));`);
			} else {
				lines.push(`${tab}\tif (${p.name}) args.push("${p.flag}");`);
			}
		}

		lines.push(`${tab}\treturn command(client.client, ${argsStr})(args);`);
		lines.push(`${tab}}`);
	} else {
		lines.push(`${tab}async (args = []) => {`);
		lines.push(`${tab}\tconst client = await clientPromise;`);
		lines.push(`${tab}\treturn command(client.client, ${argsStr})(args);`);
		lines.push(`${tab}}`);
	}

	return lines.join("\n");
}

/**
 * Deduplicate parameter names by appending _2, _3, etc.
 */
function deduplicateNames(names) {
	const seen = {};
	return names.map(n => {
		if (!seen[n]) {
			seen[n] = 1;
			return n;
		}
		seen[n]++;
		return n + "_" + seen[n];
	});
}

/**
 * Generate the code for a node in the command tree.
 */
function generateNode(node, pathParts, indent) {
	const tab = "\t".repeat(indent);

	if (!node.children) {
		return buildLeafCode(pathParts, node.description || node.name || "", indent);
	}

	// Group node — object with children
	const desc = (node.description || node.name || "").replace(/\*/g, "");
	const lines = [];
	lines.push(`${tab}/** ${desc} */`);
	lines.push(`${tab}{`);

	const entries = Object.entries(node.children);
	for (let i = 0; i < entries.length; i++) {
		const [key, child] = entries[i];
		const childPath = [...pathParts, key];
		const propKey = needsQuoting(key) ? `"${key}"` : key;
		const childCode = generateNode(child, childPath, indent + 1);
		lines.push(`${tab}\t${propKey}: ${childCode.trimStart()}${i < entries.length - 1 ? "," : ""}`);
	}

	lines.push(`${tab}}`);
	return lines.join("\n");
}

/**
 * Generate the full module file for a top-level command group.
 */
function generateModule(groupName, groupNode) {
	const desc = (groupNode.description || groupName).replace(/\*/g, "");

	const lines = [];
	lines.push(`const command = require("../command");`);
	lines.push(``);
	lines.push(`/**`);
	lines.push(` * ${desc}`);
	lines.push(` * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client`);
	lines.push(` * @returns {Object} Command tree for ${groupName}`);
	lines.push(` */`);
	lines.push(`module.exports = (clientPromise) => ({`);

	if (groupNode.children) {
		const entries = Object.entries(groupNode.children);
		for (let i = 0; i < entries.length; i++) {
			const [key, child] = entries[i];
			const childPath = [groupName, key];
			const propKey = needsQuoting(key) ? `"${key}"` : key;
			const childCode = generateNode(child, childPath, 1);
			lines.push(`\t${propKey}: ${childCode.trimStart()}${i < entries.length - 1 ? "," : ""}`);
		}
	}

	lines.push(`});`);
	lines.push(``);
	return lines.join("\n");
}

/**
 * Generate LF sub-commands file.
 */
function generateLfCommands(lfNode) {
	const CUSTOM_COMMANDS = new Set(["search"]);
	const lines = [];
	lines.push(`const command = require("../command");`);
	lines.push(``);
	lines.push(`/**`);
	lines.push(` * Auto-generated LF sub-command stubs with JSDoc.`);
	lines.push(` * Merged into the main LF module alongside custom search/parse/write logic.`);
	lines.push(` * @param {Promise<Object>} clientPromise - Promise resolving to the pm3 client`);
	lines.push(` * @returns {Object} LF sub-command tree`);
	lines.push(` */`);
	lines.push(`module.exports = (clientPromise) => ({`);

	if (lfNode.children) {
		const entries = Object.entries(lfNode.children).filter(([key]) => !CUSTOM_COMMANDS.has(key));
		for (let i = 0; i < entries.length; i++) {
			const [key, child] = entries[i];
			const childPath = ["lf", key];
			const propKey = needsQuoting(key) ? `"${key}"` : key;
			const childCode = generateNode(child, childPath, 1);
			lines.push(`\t${propKey}: ${childCode.trimStart()}${i < entries.length - 1 ? "," : ""}`);
		}
	}

	lines.push(`});`);
	lines.push(``);
	return lines.join("\n");
}

let generated = 0;
let skipped = 0;

for (const [groupName, groupNode] of Object.entries(commands)) {
	if (SKIP_GROUPS.has(groupName)) {
		skipped++;
		continue;
	}

	if (PRESERVE_MODULES.has(groupName)) {
		if (groupName === "lf") {
			const code = generateLfCommands(groupNode);
			const filePath = path.join(srcDir, "lf", "commands.js");
			fs.writeFileSync(filePath, code, "utf8");
			console.log(`WROTE ${filePath} (LF sub-commands)`);
			generated++;
		} else {
			console.log(`SKIP ${groupName} (preserved, has custom logic)`);
		}
		skipped++;
		continue;
	}

	if (!groupNode.children && !groupNode.description) {
		skipped++;
		continue;
	}

	const groupDir = path.join(srcDir, groupName);
	if (!fs.existsSync(groupDir)) {
		fs.mkdirSync(groupDir, { recursive: true });
	}

	const code = generateModule(groupName, groupNode);
	const filePath = path.join(groupDir, "index.js");
	fs.writeFileSync(filePath, code, "utf8");
	console.log(`WROTE ${filePath}`);
	generated++;
}

console.log(`\nDone: ${generated} modules generated, ${skipped} skipped`);
