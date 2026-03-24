#!/usr/bin/env node

/**
 * Proxmark3 Terminal UI
 *
 * Interactive TUI for browsing and executing all Proxmark3 commands.
 * Uses commands.json for instant tree loading and commands-help.json
 * for rich help display with named parameter input fields.
 *
 * Usage: PM3=/path/to/proxmark3 node examples/tui.js
 *
 * Keys:
 *   Enter     — Open parameter form for selected command
 *   Tab       — Next field in form / cycle panels
 *   /         — Free-form command input
 *   Escape    — Cancel form / return to tree
 *   q, Ctrl-C — Quit (when tree focused)
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

// ── Helpers ────────────────────────────────────────────────────

function parseFlag(flagStr) {
	const valueMatch = flagStr.match(/<([^>]+)>/);
	const hasValue = !!valueMatch;
	const valueType = valueMatch ? valueMatch[1] : null;

	const cleaned = flagStr.replace(/<[^>]+>/, "").trim();
	const parts = cleaned.split(",").map((s) => s.trim());
	const longFlag = parts.find((p) => p.startsWith("--"));
	const shortFlag = parts.find((p) => /^-[^-]/.test(p));

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

	return { name, flag, hasValue, valueType };
}

// ── State ──────────────────────────────────────────────────────

const clientPromise = createClient(pm3Path);
let running = false;
let connected = false;
let selectedPath = [];
let formActive = false;
let formParams = [];
let formFocusTargets = [];
let formFocusIdx = 0;
let formCmdPath = [];

// ── Screen ─────────────────────────────────────────────────────

const screen = blessed.screen({
	smartCSR: true,
	title: "Proxmark3 TUI",
	fullUnicode: true,
});

// ── Grid layout ────────────────────────────────────────────────

const grid = new contrib.grid({ rows: 24, cols: 12, screen: screen });

// Left: command tree
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

// Parameter form overlay — positioned over helpBox, hidden by default
const formBox = blessed.box({
	parent: screen,
	top: helpBox.atop,
	left: helpBox.aleft,
	width: helpBox.width,
	height: helpBox.height,
	border: { type: "line" },
	label: " Parameters ",
	tags: true,
	scrollable: true,
	alwaysScroll: true,
	mouse: true,
	scrollbar: { style: { bg: "yellow" } },
	style: {
		border: { fg: "magenta" },
		label: { fg: "magenta", bold: true },
	},
	hidden: true,
});

// Free-form input bar
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
	const cmdPath =
		selectedPath.length > 0 ? "  │  " + selectedPath.join(" ") : "";
	let hint;
	if (formActive) {
		hint = "{gray-fg}Tab:next  Space:toggle  Enter:execute  Esc:cancel{/gray-fg}";
	} else if (screen.focused === inputBar) {
		hint = "{gray-fg}Enter:execute  Esc:cancel{/gray-fg}";
	} else {
		hint =
			"{gray-fg}Enter:open command  /:raw input  Tab:switch  q:quit{/gray-fg}";
	}
	statusBar.setContent(` ${conn}${run}${cmdPath}  │  ${hint}`);
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
			result[key] = { _path: myPath };
		}
	}
	return result;
}

tree.setData({ extended: true, children: buildTreeData(commands, []) });

// ── Help display ───────────────────────────────────────────────

function showHelp(cmdPath) {
	const helpKey = cmdPath.join("_");
	const help = helpData[helpKey];

	if (!help) {
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
		helpBox.setContent(
			`{bold}${cmdPath.join(" ")}{/bold}\n\nNo help available.`
		);
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

// ── Parameter form (overlay approach) ──────────────────────────

function clearForm() {
	// Remove all children from formBox
	while (formBox.children.length > 0) {
		formBox.remove(formBox.children[0]);
	}
	formBox.hide();
	helpBox.show();
	formParams = [];
	formFocusTargets = [];
	formFocusIdx = 0;
	formActive = false;
	formCmdPath = [];
}

function showParameterForm(cmdPath) {
	clearForm();

	const helpKey = cmdPath.join("_");
	const help = helpData[helpKey];

	if (!help || !help.options || help.options.length === 0) {
		executeCommand(cmdPath, []);
		return;
	}

	const parsed = [];
	for (const opt of help.options) {
		const p = parseFlag(opt.flag);
		if (!p) continue;
		parsed.push({ ...p, description: opt.description || "" });
	}

	if (parsed.length === 0) {
		executeCommand(cmdPath, []);
		return;
	}

	formActive = true;
	formCmdPath = cmdPath;
	formParams = [];
	formFocusTargets = [];
	formFocusIdx = 0;

	// Header text inside formBox
	const headerContent =
		`{bold}{yellow-fg}${cmdPath.join(" ")}{/yellow-fg}{/bold}  ` +
		`{gray-fg}${help.description || ""}{/gray-fg}\n` +
		(help.usage ? `{cyan-fg}Usage:{/cyan-fg} ${help.usage}\n` : "") +
		`\n{cyan-fg}Fill parameters and press Enter to execute:{/cyan-fg}\n`;

	const formHeader = blessed.text({
		parent: formBox,
		top: 0,
		left: 1,
		width: "95%",
		height: headerContent.split("\n").length,
		content: headerContent,
		tags: true,
	});

	const startRow = headerContent.split("\n").length + 1;

	for (let i = 0; i < parsed.length; i++) {
		const p = parsed[i];
		const row = startRow + i * 2;

		if (p.hasValue) {
			// Label with type hint
			const label = blessed.text({
				parent: formBox,
				top: row,
				left: 1,
				width: "95%",
				height: 1,
				content: `{green-fg}${p.name}{/green-fg} {cyan-fg}<${p.valueType}>{/cyan-fg}  {gray-fg}${p.description}{/gray-fg}`,
				tags: true,
			});

			// Text input
			const input = blessed.textbox({
				parent: formBox,
				top: row + 1,
				left: 1,
				width: "90%",
				height: 1,
				mouse: true,
				inputOnFocus: false,
				style: {
					fg: "white",
					bg: "#444444",
					focus: { bg: "#555555" },
				},
			});

			formFocusTargets.push(input);
			formParams.push({ flag: p.flag, hasValue: true, widget: input });
		} else {
			// Checkbox for boolean
			const cb = blessed.checkbox({
				parent: formBox,
				top: row,
				left: 1,
				width: "95%",
				height: 1,
				content: `{green-fg}${p.name}{/green-fg}  {gray-fg}${p.description}{/gray-fg}`,
				tags: true,
				mouse: true,
				style: {
					fg: "white",
					focus: { fg: "yellow", bold: true },
				},
			});

			// Empty spacer line for consistent 2-row spacing
			blessed.text({
				parent: formBox,
				top: row + 1,
				left: 1,
				width: 1,
				height: 1,
				content: "",
			});

			formFocusTargets.push(cb);
			formParams.push({ flag: p.flag, hasValue: false, widget: cb });
		}
	}

	// Execute button
	const btnRow = startRow + parsed.length * 2 + 1;
	const btn = blessed.button({
		parent: formBox,
		top: btnRow,
		left: 1,
		width: 20,
		height: 1,
		content: " ▶ Execute ",
		align: "center",
		mouse: true,
		style: {
			fg: "black",
			bg: "green",
			focus: { bg: "yellow", fg: "black" },
			hover: { bg: "yellow", fg: "black" },
		},
	});

	btn.on("press", function () {
		submitForm();
	});

	formFocusTargets.push(btn);

	// Show form, hide help
	helpBox.hide();
	formBox.setLabel(` ${cmdPath.join(" ")} — Parameters `);
	formBox.show();

	// Focus first field
	focusFormField(0);
	updateStatus();
	screen.render();
}

function focusFormField(idx) {
	if (formFocusTargets.length === 0) return;
	formFocusIdx = ((idx % formFocusTargets.length) + formFocusTargets.length) % formFocusTargets.length;
	const target = formFocusTargets[formFocusIdx];

	// For textbox: we need to manually start input
	if (target.type === "textbox") {
		target.focus();
		target.readInput();
	} else {
		target.focus();
	}
	screen.render();
}

function submitForm() {
	const args = [];

	for (const p of formParams) {
		if (p.hasValue) {
			const val = p.widget.getValue().trim();
			if (val) {
				args.push(p.flag, val);
			}
		} else {
			if (p.widget.checked) {
				args.push(p.flag);
			}
		}
	}

	const cmdPath = [...formCmdPath];
	clearForm();
	showHelp(cmdPath);
	executeCommand(cmdPath, args);
}

function cancelForm() {
	const cmdPath = [...formCmdPath];
	clearForm();
	if (cmdPath.length > 0) {
		showHelp(cmdPath);
	}
	tree.focus();
	updateStatus();
	screen.render();
}

// Handle Tab/Enter/Escape within form context
screen.on("keypress", function (ch, key) {
	if (!formActive) return;

	if (key.name === "tab" && !key.shift) {
		// Move to next field
		const current = formFocusTargets[formFocusIdx];
		// If current is a textbox in input mode, cancel it first
		if (current && current.type === "textbox") {
			current.cancel();
		}
		focusFormField(formFocusIdx + 1);
		return;
	}

	if (key.name === "tab" && key.shift) {
		const current = formFocusTargets[formFocusIdx];
		if (current && current.type === "textbox") {
			current.cancel();
		}
		focusFormField(formFocusIdx - 1);
		return;
	}

	if (key.name === "escape") {
		const current = formFocusTargets[formFocusIdx];
		if (current && current.type === "textbox") {
			current.cancel();
		}
		cancelForm();
		return;
	}
});

// When a textbox submits (Enter pressed while editing), move to next or execute
screen.on("element focus", function (el) {
	if (!formActive) return;
	const idx = formFocusTargets.indexOf(el);
	if (idx >= 0) formFocusIdx = idx;
});

// ── Tree navigation ────────────────────────────────────────────

function getSelectedNodePath() {
	try {
		const node = tree.nodeLines[tree.rows.selected];
		if (!node) return [];
		const path = [];
		let cur = node;
		while (cur) {
			if (
				cur.name !== undefined &&
				cur.name !== null &&
				cur.name !== ""
			) {
				path.unshift(cur.name);
			}
			cur = cur.parent;
		}
		return path;
	} catch (e) {
		return [];
	}
}

tree.rows.on("select item", function () {
	if (formActive) return;
	const path = getSelectedNodePath();
	if (path.length > 0) {
		selectedPath = path;
		showHelp(path);
		updateStatus();
	}
});

tree.on("select", function () {
	const path = getSelectedNodePath();
	if (path.length === 0) return;

	selectedPath = path;

	let cmdNode = commands;
	for (const p of path) {
		if (!cmdNode[p]) return;
		cmdNode = cmdNode[p];
		if (cmdNode.children && path.indexOf(p) < path.length - 1) {
			cmdNode = cmdNode.children;
		}
	}

	if (cmdNode && !cmdNode.children) {
		showParameterForm(path);
	}
});

// ── Command execution ──────────────────────────────────────────

async function executeCommand(cmdPath, args) {
	if (running) {
		logBox.log("{red-fg}Already running a command{/red-fg}");
		screen.render();
		return;
	}

	const cmdStr =
		cmdPath.join(" ") + (args.length > 0 ? " " + args.join(" ") : "");
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
				" {bold}PROXMARK3{/bold}  │  {green-fg}Connected{/green-fg}"
			);
		}

		const result = await command(client.client, cmdPath)(args);
		const lines = result.split("\r").join("").trim().split("\n");
		for (const line of lines) {
			logBox.log(line);
		}
	} catch (e) {
		logBox.log(`{red-fg}Error: ${e.message}{/red-fg}`);
	}

	running = false;
	tree.focus();
	updateStatus();
}

// ── Free-form input bar ────────────────────────────────────────

inputBar.on("focus", function () {
	updateStatus();
});

inputBar.on("blur", function () {
	updateStatus();
});

inputBar.on("submit", function (value) {
	const parts = value.trim().split(/\s+/);
	if (parts.length === 0 || parts[0] === "") {
		tree.focus();
		screen.render();
		return;
	}

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
	if (formActive) {
		cancelForm();
		return;
	}
	if (screen.focused === inputBar) {
		inputBar.clearValue();
		tree.focus();
		screen.render();
		return;
	}
	cleanup();
});

screen.key(["tab"], function () {
	if (formActive) return; // Handled by keypress handler
	if (screen.focused === inputBar) {
		tree.focus();
	} else if (
		screen.focused === tree.rows ||
		screen.focused === tree
	) {
		logBox.focus();
	} else {
		tree.focus();
	}
	screen.render();
});

screen.key(["/"], function () {
	if (formActive) return;
	const cmdStr =
		selectedPath.length > 0 ? selectedPath.join(" ") + " " : "";
	inputBar.setValue(cmdStr);
	inputBar.focus();
	screen.render();
});

screen.key(["escape"], function () {
	if (formActive) return; // Handled by keypress handler
	if (screen.focused === inputBar) {
		inputBar.clearValue();
		tree.focus();
		screen.render();
	}
});

// ── Startup ────────────────────────────────────────────────────

helpBox.setContent(
	"{bold}{yellow-fg}Proxmark3 Command Browser{/yellow-fg}{/bold}\n\n" +
		"Navigate the command tree on the left.\n" +
		"Press {cyan-fg}Enter{/cyan-fg} on a command to see its parameters.\n" +
		"Press {cyan-fg}/{/cyan-fg} to type a raw command.\n\n" +
		"{cyan-fg}Command groups:{/cyan-fg}\n" +
		Object.entries(commands)
			.filter(([k]) => !SKIP.has(k) && commands[k].children)
			.map(
				([k, v]) =>
					`  {green-fg}${k.padEnd(10)}{/green-fg} ${v.description || ""}`
			)
			.join("\n")
);

tree.focus();
updateStatus();
screen.render();

clientPromise
	.then(() => {
		connected = true;
		header.setContent(
			" {bold}PROXMARK3{/bold}  │  {green-fg}Connected{/green-fg}"
		);
		updateStatus();

		logBox.log("{bold}Proxmark3 TUI{/bold}");
		logBox.log("──────────────────────────────────");
		logBox.log("{cyan-fg}Enter{/cyan-fg}  Open parameter form");
		logBox.log("{cyan-fg}/{/cyan-fg}      Type raw command with flags");
		logBox.log("{cyan-fg}Tab{/cyan-fg}    Navigate fields / panels");
		logBox.log("{cyan-fg}Esc{/cyan-fg}    Cancel / back to tree");
		logBox.log("");

		executeCommand(["hw", "version"], []);
	})
	.catch((err) => {
		header.setContent(
			" {bold}PROXMARK3{/bold}  │  {red-fg}Connection failed{/red-fg}"
		);
		logBox.log(`{red-fg}Failed to connect: ${err.message}{/red-fg}`);
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
