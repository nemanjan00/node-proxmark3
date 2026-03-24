# CLAUDE.md

## Project Overview

Node.js library and MCP server for Proxmark3 RFID research tool. Provides a JavaScript API with 789 commands covering all PM3 functionality, plus an MCP server for AI assistant integration.

## Architecture

### Core Modules

- `src/client/index.js` — Creates a PM3 client connection via `createClient(pm3Path)`. Returns `Promise<{command, client, help}>`
- `src/command/index.js` — Command executor. `command(client, argsArray)` returns `(params) => Promise<string>`. Serializes commands (one at a time)
- `src/daemon/index.js` — Spawns and manages the proxmark3 child process
- `src/help/index.js` — Parses PM3 help output into a command tree

### Command Modules

Each module is a factory: `(clientPromise) => ({ commandTree })`. Commands are async functions with named parameters.

| Module | File | Notes |
|--------|------|-------|
| `hw` | `src/hw/index.js` | Single file, 22 commands |
| `hf` | `src/hf/index.js` | Assembles 5 parts files (`_parts_small.js`, `_parts_iso.js`, `_parts_mf.js`, `_parts_mfx.js`, `_parts_other.js`) |
| `lf` | `src/lf/index.js` | Custom search/parse/write logic + assembles 3 parts files via `commands.js` |
| `data` | `src/data/index.js` | Single file, 47 commands |
| `prefs` | `src/prefs/index.js` | Nested get/set structure |
| `emv` | `src/emv/index.js` | Single file |
| `mem` | `src/mem/index.js` | Nested with spiffs sub-group |
| `nfc` | `src/nfc/index.js` | Nested with barcode/mf/type sub-groups |
| Others | `src/<name>/index.js` | analyse, smart, trace, wiegand, script, usart |

### LF Module (Special)

`src/lf/index.js` has custom logic beyond command stubs:
- `search()` — Calls `lf search`, parses output to extract card type, chipset, and ID
- `parse(output)` — Parses raw PM3 output into structured card objects
- `write(card, sourceCard)` — Clones a card ID and verifies the write
- Uses `src/lf/em/` for EM410x-specific parsing and cloning

### MCP Server

`src/mcp/index.js` — Exposes all commands as MCP tools. Uses `commands-help.json` for rich tool descriptions (usage, options, examples). Special tools: `lf_search` (parsed output), `lf_write` (clone with verify), `pm3_command` (arbitrary commands).

### Data Files

- `commands.json` — Command tree structure (generated from PM3 help)
- `commands-help.json` — Parsed `--fulltext` help output with usage, options, examples per command
- `commands-fulltext.txt` — Raw `pm3 --fulltext` dump

### Code Generation

`scripts/generate-stubs.js` was used for initial generation but all modules have been manually reviewed and refined. The generated files are committed as normal source code. Run `node scripts/generate-stubs.js` to regenerate from `commands.json` + `commands-help.json` (will overwrite manual edits).

## Key Patterns

### Command function pattern

```javascript
// No-arg command
commandName: async () => {
  const client = await clientPromise;
  return command(client.client, ["group", "cmd"])([]);
},

// Command with smart named params
commandName: async ({ param1, param2, boolFlag } = {}) => {
  const client = await clientPromise;
  const args = [];
  if (param1 !== undefined && param1 !== null) args.push("--flag", String(param1));
  if (boolFlag) args.push("--bool");
  return command(client.client, ["group", "cmd"])(args);
},

// Command with required params (no default on destructuring)
commandName: async ({ requiredParam }) => {
  const client = await clientPromise;
  // requiredParam pushed unconditionally
  return command(client.client, ["group", "cmd"])(["--flag", String(requiredParam)]);
},
```

### Design conventions

- Mutually exclusive flags → single string/enum param (e.g., `hw.dbg(level)` not `hw.dbg({ _0, _1, _2 })`)
- `-@` flag → `continuous` param
- Required params (not in `[]` in usage) have no defaults
- RFID domain shorthand preserved: `fc`, `cn`, `fmt`, `q5`, `em`
- Long flag names used when building args (e.g., `--port` not `-p`)

## Development

```bash
# Run tests (requires connected PM3)
PM3=/path/to/proxmark3 node -e "const pm3 = require('./src'); ..."

# Regenerate command stubs (overwrites manual edits)
node scripts/generate-stubs.js

# Regenerate help data (requires PM3 binary, no device needed)
/path/to/proxmark3 --fulltext > commands-fulltext.txt
node scripts/parse-fulltext-help.js

# Start MCP server
PM3=/path/to/proxmark3 node src/mcp/index.js
```

## Environment

- `PM3` — Path to proxmark3 client binary (required for MCP server and tests)
