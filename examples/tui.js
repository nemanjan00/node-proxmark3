#!/usr/bin/env node

/**
 * Proxmark3 Terminal UI
 *
 * Interactive TUI for browsing and executing all Proxmark3 commands.
 * Uses commands.json for instant tree loading and commands-help.json
 * for rich help display.
 *
 * Usage: PM3=/path/to/proxmark3 node examples/tui.js
 *
 * Keys:
 *   Enter     — Execute selected leaf command / expand group
 *   /         — Focus command input bar (type full commands with args)
 *   Tab       — Cycle focus: tree → output → tree
 *   Escape    — Clear input / return to tree
 *   q, Ctrl-C — Quit
 */

const blessed = require("blessed");
const contrib = require("blessed-contrib");

const createClient = require("../src/client");
const command = require("../src/command");
const commands = require("../commands.json");

let helpData = {};
try {
	helpData = require("../commands-help.json");
} catch (e) {}

const pm3Path = process.env.PM3;
if (!pm3Path) {
	console.error("PM3 environment variable is required");
	process.exit(1);
}

// ── State ──────────────────────────────────────────────────────

const clientPromise = createClient(pm3Path);
let running = false;
let connected = false;
let selectedPath = [];
let commandHistory = [];
let historyIdx = -1;

// ── Screen ─────────────────────────────────────────────────────

const screen = blessed.screen({
	smartCSR: true,
	title: "Proxmark3 TUI",
	fullUnicode: true,
});

// ── Grid layout ────────────────────────────────────────────────

const grid = new contrib.grid({ rows: 24, cols: 12, screen: screen });

// Left: command tree (full height)
const tree = grid.set(0, 0, 22, 4, contrib.tree, {
	label: " Commands ",
	fg: "white",
	selectedFg: "black",
	selectedBg: "green",
	keys: ["enter", "default"],
	vi: true,
	mouse: true,
	style: {
		fg: "white",
		border: { fg: "cyan" },
		label: { fg: "cyan", bold: true },
		selected: { fg: "black", bg: "green" },
	},
});

// Right top: help panel
const helpBox = grid.set(0, 4, 10, 8, blessed.box, {
	label: " Help ",
	tags: true,
	scrollable: true,
	alwaysScroll: true,
	keys: true,
	vi: true,
	mouse: true,
	scrollbar: { style: { bg: "blue" } },
	style: {
		border: { fg: "yellow" },
		label: { fg: "yellow", bold: true },
	},
});

// Right bottom: output log
const logBox = grid.set(10, 4, 12, 8, contrib.log, {
	label: " Output ",
	tags: true,
	keys: true,
	vi: true,
	mouse: true,
	scrollbar: { style: { bg: "blue" } },
	style: {
		border: { fg: "green" },
		label: { fg: "green", bold: true },
	},
});

// Input bar at the bottom
const inputBar = blessed.textbox({
	parent: screen,
	bottom: 1,
	left: 0,
	width: "100%",
	height: 1,
	style: { fg: "white", bg: "#333333" },
	inputOnFocus: true,
});

// Status bar
const statusBar = blessed.box({
	parent: screen,
	bottom: 0,
	left: 0,
	width: "100%",
	height: 1,
	tags: true,
	style: { fg: "white", bg: "#222222" },
});

// Header
const header = blessed.box({
	parent: screen,
	top: 0,
	left: 0,
	width: "100%",
	height: 1,
	tags: true,
	content: " {bold}PROXMARK3{/bold}  │  Connecting...",
	style: { fg: "white", bg: "blue", bold: true },
});

function updateStatus() {
	const conn = connected
		? "{green-fg}●{/green-fg} Connected"
		: "{red-fg}●{/red-fg} Offline";
	const run = running ? "  {yellow-fg}⟳ Running{/yellow-fg}" : "";
	const path = selectedPath.length > 0 ? "  │  " + selectedPath.join(" ") : "";
	statusBar.setContent(
		` ${conn}${run}${path}  │  {gray-fg}Enter:exec  /:input  Tab:switch  q:quit{/gray-fg}`
	);
	screen.render();
}

// ── Build tree from commands.json ──────────────────────────────

const SKIP = new Set(["quit", "exit"]);

function buildTreeData(cmdTree, parentPath) {
	const result = {};
	for (const [key, node] of Object.entries(cmdTree)) {
		if (SKIP.has(key)) continue;
		const myPath = [...parentPath, key];
		if (node.children) {
			result[key] = {
				extended: false,
				children: buildTreeData(node.children, myPath),
				_path: myPath,
			};
		} else {
			result[key] = {
				_path: myPath,
			};
		}
	}
	return result;
}

const treeData = buildTreeData(commands, []);

tree.setData({
	extended: true,
	children: treeData,
});

// ── Help display ───────────────────────────────────────────────

function showHelp(cmdPath) {
	const helpKey = cmdPath.join("_");
	const help = helpData[helpKey];

	if (!help) {
		// Group node — show sub-commands
		let node = commands;
		for (const p of cmdPath) {
			if (node[p]) {
				if (node[p].children) {
					const desc = node[p].description || "";
					node = node[p].children;
					if (cmdPath.indexOf(p) === cmdPath.length - 1) {
						const subs = Object.keys(node);
						helpBox.setContent(
							`{bold}{yellow-fg}${cmdPath.join(" ")}{/yellow-fg}{/bold}\n` +
							`${desc}\n\n` +
							`{cyan-fg}Sub-commands ({/cyan-fg}${subs.length}{cyan-fg}):{/cyan-fg}\n` +
							subs
								.map((c) => {
									const d = node[c].description || "";
									return `  {green-fg}${c}{/green-fg}  ${d}`;
								})
								.join("\n")
						);
						screen.render();
						return;
					}
				} else {
					node = node[p];
				}
			}
		}
		helpBox.setContent(`{bold}${cmdPath.join(" ")}{/bold}\n\nNo help available.`);
		screen.render();
		return;
	}

	let c = "";
	c += `{bold}{yellow-fg}${help.command}{/yellow-fg}{/bold}\n`;
	c += `${help.description || ""}\n`;

	if (help.usage) {
		c += `\n{cyan-fg}Usage:{/cyan-fg}\n  {white-fg}${help.usage}{/white-fg}\n`;
	}

	if (help.options && help.options.length > 0) {
		c += `\n{cyan-fg}Options:{/cyan-fg}\n`;
		for (const opt of help.options) {
			const d = opt.description ? `  ${opt.description}` : "";
			c += `  {green-fg}${opt.flag}{/green-fg}${d}\n`;
		}
	}

	if (help.examples && help.examples.length > 0) {
		c += `\n{cyan-fg}Examples:{/cyan-fg}\n`;
		for (const ex of help.examples) {
			c += `  {white-fg}${ex}{/white-fg}\n`;
		}
	}

	helpBox.setContent(c);
	helpBox.setScrollPerc(0);
	screen.render();
}

// ── Tree navigation ────────────────────────────────────────────

function getSelectedNodePath() {
	try {
		const node = tree.nodeLines[tree.rows.selected];
		if (!node) return [];
		// Walk up the parent chain
		const path = [];
		let cur = node;
		while (cur) {
			if (cur.name !== undefined && cur.name !== null && cur.name !== "") {
				path.unshift(cur.name);
			}
			cur = cur.parent;
		}
		return path;
	} catch (e) {
		return [];
	}
}

// Show help on navigation
tree.rows.on("select item", function () {
	const path = getSelectedNodePath();
	if (path.length > 0) {
		selectedPath = path;
		showHelp(path);
		updateStatus();
	}
});

// Execute on Enter
tree.on("select", function (node) {
	const path = getSelectedNodePath();
	if (path.length === 0) return;

	selectedPath = path;

	// Check if leaf
	let cmdNode = commands;
	for (const p of path) {
		if (!cmdNode[p]) return;
		cmdNode = cmdNode[p];
		if (cmdNode.children && path.indexOf(p) < path.length - 1) {
			cmdNode = cmdNode.children;
		}
	}

	if (cmdNode && !cmdNode.children) {
		executeCommand(path, []);
	}
});

// ── Command execution ──────────────────────────────────────────

async function executeCommand(cmdPath, args) {
	if (running) {
		logBox.log("{red-fg}⚠ Already running a command{/red-fg}");
		screen.render();
		return;
	}

	const cmdStr = cmdPath.join(" ") + (args.length > 0 ? " " + args.join(" ") : "");
	logBox.log("");
	logBox.log(`{cyan-fg}$ ${cmdStr}{/cyan-fg}`);
	screen.render();

	running = true;
	updateStatus();

	try {
		const client = await clientPromise;
		if (!connected) {
			connected = true;
			header.setContent(
				" {bold}PROXMARK3{/bold}  │  {green-fg}Connected{/green-fg}  │  Browse commands, Enter to execute"
			);
		}

		const result = await command(client.client, cmdPath)(args);

		const lines = result.split("\r").join("").trim().split("\n");
		for (const line of lines) {
			logBox.log(line);
		}

		commandHistory.unshift(cmdStr);
		if (commandHistory.length > 100) commandHistory.pop();
		historyIdx = -1;
	} catch (e) {
		logBox.log(`{red-fg}Error: ${e.message}{/red-fg}`);
	}

	running = false;
	updateStatus();
}

// ── Input bar ──────────────────────────────────────────────────

inputBar.on("submit", function (value) {
	const parts = value.trim().split(/\s+/);
	if (parts.length === 0 || parts[0] === "") {
		tree.focus();
		screen.render();
		return;
	}

	// Find longest matching command path
	let cmdPath = [];
	let args = [];
	let node = commands;

	for (let i = 0; i < parts.length; i++) {
		if (node[parts[i]]) {
			cmdPath.push(parts[i]);
			if (node[parts[i]].children) {
				node = node[parts[i]].children;
			} else {
				args = parts.slice(i + 1);
				break;
			}
		} else {
			args = parts.slice(i);
			break;
		}
	}

	if (cmdPath.length > 0) {
		commandHistory.unshift(value.trim());
		executeCommand(cmdPath, args);
	} else {
		logBox.log(`{red-fg}Unknown command: ${value}{/red-fg}`);
	}

	inputBar.clearValue();
	tree.focus();
	screen.render();
});

inputBar.on("cancel", function () {
	inputBar.clearValue();
	tree.focus();
	screen.render();
});

// ── Key bindings ───────────────────────────────────────────────

screen.key(["q", "C-c"], function () {
	cleanup();
});

screen.key(["tab"], function () {
	if (screen.focused === tree.rows || screen.focused === tree) {
		logBox.focus();
	} else if (screen.focused === logBox) {
		tree.focus();
	} else {
		tree.focus();
	}
	screen.render();
});

screen.key(["/"], function () {
	const cmdStr = selectedPath.length > 0 ? selectedPath.join(" ") + " " : "";
	inputBar.setValue(cmdStr);
	inputBar.focus();
	screen.render();
});

screen.key(["escape"], function () {
	if (screen.focused === inputBar) {
		inputBar.clearValue();
		tree.focus();
		screen.render();
	}
});

// ── Startup ────────────────────────────────────────────────────

// Initial help content
helpBox.setContent(
	"{bold}{yellow-fg}Proxmark3 Command Browser{/yellow-fg}{/bold}\n\n" +
	"Navigate the command tree on the left.\n" +
	"Select a command to see its help here.\n\n" +
	"{cyan-fg}Command groups:{/cyan-fg}\n" +
	Object.entries(commands)
		.filter(([k]) => !SKIP.has(k) && commands[k].children)
		.map(([k, v]) => `  {green-fg}${k.padEnd(10)}{/green-fg} ${v.description || ""}`)
		.join("\n") +
	"\n\n{gray-fg}Press / to type commands with arguments{/gray-fg}"
);

tree.focus();
updateStatus();
screen.render();

// Connect in background
clientPromise
	.then((client) => {
		connected = true;
		header.setContent(
			" {bold}PROXMARK3{/bold}  │  {green-fg}Connected{/green-fg}  │  Browse commands, Enter to execute, / for input"
		);
		updateStatus();

		logBox.log("{bold}Proxmark3 TUI{/bold}");
		logBox.log("─────────────────────────────────");
		logBox.log("{cyan-fg}Enter{/cyan-fg} on a command to run it");
		logBox.log("{cyan-fg}/{/cyan-fg} to type a command with arguments");
		logBox.log("{cyan-fg}Tab{/cyan-fg} to switch panels");
		logBox.log("");

		// Auto-show version
		executeCommand(["hw", "version"], []);
	})
	.catch((err) => {
		header.setContent(
			" {bold}PROXMARK3{/bold}  │  {red-fg}Connection failed{/red-fg}"
		);
		logBox.log(`{red-fg}Failed to connect: ${err.message}{/red-fg}`);
		logBox.log("Check PM3 path and device connection.");
		updateStatus();
	});

function cleanup() {
	clientPromise
		.then((client) => {
			if (client && client.client && client.client._child) {
				client.client._child.kill();
			}
		})
		.catch(() => {});
	process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
