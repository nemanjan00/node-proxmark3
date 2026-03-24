# CLAUDE.md

## Project Overview

Node.js library and MCP server for Proxmark3 RFID research tool. 789 commands across 15 modules with JSDoc, smart named parameters, and an MCP server for AI integration.

## Architecture

```
src/
├── client/     — createClient(pm3Path) → Promise<{command, client, help}>
├── command/    — command(client, argsArray) → (params) => Promise<string> (serialized)
├── daemon/     — Spawns/manages proxmark3 child process
├── help/       — Parses PM3 help output into command tree
├── mcp/        — MCP server exposing all commands as tools
├── hw/         — 22 hardware commands (single file)
├── hf/         — 408 HF commands (index.js assembles 5 _parts_*.js files)
├── lf/         — 213 LF commands (custom search/parse/write + 3 _parts_*.js via commands.js)
│   └── em/     — EM410x-specific parsing/cloning logic
├── data/       — 47 data/plot commands
├── prefs/      — 23 preference commands (nested get/set)
├── emv/        — 15 EMV commands
├── mem/        — 18 memory commands (nested with spiffs)
├── nfc/        — 14 NFC commands (nested sub-groups)
├── analyse/    — 11 analysis commands
├── smart/      — 8 smart card commands
├── trace/      — 3 trace commands
├── wiegand/    — 3 wiegand commands
├── script/     — 2 script commands
└── usart/      — 2 UART/BT commands
```

## Module Pattern

Every module is a factory: `(clientPromise) => ({ commandTree })`.

```javascript
// No-arg command
name: async () => {
  const client = await clientPromise;
  return command(client.client, ["group", "cmd"])([]);
},

// Smart named params (optional)
name: async ({ param1, boolFlag } = {}) => {
  const client = await clientPromise;
  const args = [];
  if (param1 !== undefined && param1 !== null) args.push("--flag", String(param1));
  if (boolFlag) args.push("--bool");
  return command(client.client, ["group", "cmd"])(args);
},

// Required params (no default on destructuring)
name: async ({ requiredParam }) => { ... },
```

## Design Conventions

- Mutually exclusive flags → single enum param (`hw.dbg(level)`, `hw.setmux("hipkd")`)
- `-@` flag → `continuous` param
- Required params (not in `[]` in PM3 usage) → no defaults, throw if missing
- RFID shorthand preserved: `fc`, `cn`, `fmt`, `q5`, `em`
- Long flag names in args: `--port` not `-p`

## LF Module (Special)

`src/lf/index.js` has custom logic beyond stubs:
- `search()` — Parses `lf search` output → `{ type, chipset, id }`
- `parse(output)` — Raw output → structured card object
- `write(card, sourceCard)` — Clone + verify
- `src/lf/em/410x/` — EM410x-specific parse/clone

## MCP Server

`src/mcp/index.js` — walks `commands.json` tree, registers each leaf as an MCP tool with rich descriptions from `commands-help.json`. Special tools: `lf_search` (parsed), `lf_write` (clone+verify), `pm3_command` (arbitrary).

## Data Files

- `commands.json` — Command tree from PM3 help
- `commands-help.json` — Parsed `--fulltext` output (usage, options, examples)
- `commands-fulltext.txt` — Raw `pm3 --fulltext` dump

## Development

```bash
# Start MCP server
PM3=/path/to/proxmark3 node src/mcp/index.js

# Regenerate help data
/path/to/proxmark3 --fulltext > commands-fulltext.txt
node scripts/parse-fulltext-help.js

# Regenerate stubs (overwrites manual edits)
node scripts/generate-stubs.js
```

## Environment

- `PM3` — Path to proxmark3 binary (required for MCP server)
