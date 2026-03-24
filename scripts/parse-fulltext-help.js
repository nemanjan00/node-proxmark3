#!/usr/bin/env node

/**
 * Parses the pm3 --fulltext output into a JSON map of command -> help info.
 * Input: commands-fulltext.txt
 * Output: commands-help.json
 */

const fs = require("fs");
const path = require("path");

const fulltext = fs.readFileSync(path.join(__dirname, "..", "commands-fulltext.txt"), "utf8");

const SEPARATOR = /^-{40,}$/m;

const blocks = fulltext.split(SEPARATOR).map(b => b.trim()).filter(Boolean);

const helpMap = {};

for (const block of blocks) {
	const lines = block.split("\n");

	// First line is the command name (may have trailing whitespace)
	const cmdLine = lines[0].trim();
	if (!cmdLine) continue;

	// Find usage line
	const usageIdx = lines.findIndex(l => l.trimStart().startsWith("usage:"));
	const optionsIdx = lines.findIndex(l => l.trimStart().startsWith("options:"));
	const examplesIdx = lines.findIndex(l => l.trimStart().startsWith("examples/notes:"));

	// Extract description (lines between "available offline:" and "usage:")
	const offlineIdx = lines.findIndex(l => l.includes("available offline:"));
	let description = "";
	if (offlineIdx >= 0 && usageIdx >= 0) {
		description = lines.slice(offlineIdx + 1, usageIdx)
			.map(l => l.trim())
			.filter(Boolean)
			.join("\n");
	}

	// Extract usage
	let usage = "";
	if (usageIdx >= 0) {
		const endIdx = optionsIdx >= 0 ? optionsIdx : (examplesIdx >= 0 ? examplesIdx : lines.length);
		usage = lines.slice(usageIdx + 1, endIdx)
			.map(l => l.trim())
			.filter(Boolean)
			.join("\n");
	}

	// Extract options
	let options = [];
	if (optionsIdx >= 0) {
		const endIdx = examplesIdx >= 0 ? examplesIdx : lines.length;
		const optLines = lines.slice(optionsIdx + 1, endIdx);
		for (const line of optLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			// Parse option lines like: "    -h, --help                     This help"
			const match = trimmed.match(/^(-[^\s]+(?:,\s*--?[^\s]+)?(?:\s+<[^>]+>)?)\s{2,}(.+)$/);
			if (match) {
				options.push({ flag: match[1].trim(), description: match[2].trim() });
			} else {
				// Continuation or standalone flag
				options.push({ flag: trimmed, description: "" });
			}
		}
	}

	// Extract examples
	let examples = [];
	if (examplesIdx >= 0) {
		const exLines = lines.slice(examplesIdx + 1);
		for (const line of exLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			// Stop if we hit what looks like the next command section bleeding in
			if (/^={10,}$/.test(trimmed)) break;
			if (!trimmed.startsWith(cmdLine.split(" ")[0])) {
				// Check if it's a continuation (-> description) or unrelated
				if (!trimmed.startsWith("->") && !trimmed.startsWith("//")) break;
			}
			examples.push(trimmed);
		}
	}

	// Convert command name to key (e.g. "hf 14a info" -> "hf_14a_info")
	const key = cmdLine.split(/\s+/).join("_");

	helpMap[key] = {
		command: cmdLine,
		description: description || "",
		usage: usage || "",
		options: options.filter(o => o.flag !== "-h, --help" && o.description !== "This help"),
		examples
	};
}

const outPath = path.join(__dirname, "..", "commands-help.json");
fs.writeFileSync(outPath, JSON.stringify(helpMap, null, 2));
console.log(`Parsed ${Object.keys(helpMap).length} commands`);

// Quick stats
const withOptions = Object.values(helpMap).filter(h => h.options.length > 0).length;
console.log(`Commands with options (besides -h): ${withOptions}`);
