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

## Updating Commands After PM3 Firmware Update

When the Proxmark3 firmware is updated and new commands are added (or existing ones change), follow these steps to bring the JS modules and MCP tools up to date.

### Step 1: Regenerate the data files

These are the source of truth for all command metadata.

```bash
# Dump full help text from the PM3 binary (no device connection needed)
/path/to/proxmark3 --fulltext > commands-fulltext.txt

# Parse into structured JSON (usage, options, examples per command)
node scripts/parse-fulltext-help.js
# => writes commands-help.json (~900 commands parsed)
```

You also need an updated `commands.json` (the command tree structure). This requires a running device:

```bash
PM3=/path/to/proxmark3 node -e "
  const client = require('./src/client');
  client('/path/to/proxmark3').then(c => {
    c.help.parseCommandList().then(tree => {
      require('fs').writeFileSync('commands.json', JSON.stringify(tree, null, 4));
      c.client._child.kill();
    });
  });
"
```

### Step 2: Find what changed

Compare the new command tree against existing modules to see what's new/removed:

```bash
node -e "
  const commands = require('./commands.json');
  const helpData = require('./commands-help.json');
  const pm3 = require('./src');
  const fakeClient = Promise.resolve({ client: {} });

  const SKIP = new Set(['auto','clear','hints','msleep','rem','quit','exit']);

  // Collect all leaf commands from commands.json
  function collectLeaves(tree, path = []) {
    const leaves = [];
    for (const [key, node] of Object.entries(tree)) {
      if (SKIP.has(key)) continue;
      const cur = [...path, key];
      if (node.children) leaves.push(...collectLeaves(node.children, cur));
      else leaves.push(cur.join('_'));
    }
    return new Set(leaves);
  }

  // Collect all leaf functions from modules
  function collectModuleLeaves(obj, path = []) {
    const leaves = [];
    for (const [k, v] of Object.entries(obj)) {
      const cur = [...path, k];
      if (typeof v === 'function') leaves.push(cur.join('_'));
      else if (typeof v === 'object' && v !== null) leaves.push(...collectModuleLeaves(v, cur));
    }
    return new Set(leaves);
  }

  const expected = collectLeaves(commands);
  let have = new Set();
  for (const [name, factory] of Object.entries(pm3)) {
    if (name === 'client') continue;
    const mod = factory(fakeClient);
    collectModuleLeaves(mod, [name]).forEach(l => have.add(l));
  }

  const missing = [...expected].filter(x => !have.has(x));
  const extra = [...have].filter(x => !expected.has(x));
  console.log('Missing from modules (' + missing.length + '):', missing);
  console.log('Extra in modules (' + extra.length + '):', extra);
"
```

### Step 3: Regenerate stubs for new commands

The generator script reads `commands.json` + `commands-help.json` and produces module files:

```bash
node scripts/generate-stubs.js
```

**WARNING**: This overwrites ALL generated module files. It will:
- Overwrite `src/<group>/index.js` for non-LF groups
- Overwrite `src/lf/commands.js` (the LF sub-commands)
- NOT touch `src/lf/index.js` (custom search/parse/write logic is preserved)

The generated output uses smart parameters (from help data) but the quality won't match manually crafted APIs. Generated files have issues like:
- `_` as param name for `-@` (should be `continuous`)
- Some required params may get defaults when they shouldn't
- Mutually exclusive flags won't be collapsed into enums

### Step 4: Manually review and refine

For each module with changes, review the generated code and apply the design conventions:

1. **Collapse mutually exclusive flags** into a single enum param
   - Before: `async ({ _0, _1, _2, _3, _4 } = {})`
   - After: `async (level) =>` with validation

2. **Rename cryptic params** to descriptive names
   - `-@` → `continuous`, `-k` → `key`, `--blk` → `block`

3. **Enforce required params** — if usage shows `--id <hex>` without `[]`, it's required:
   - Use destructuring without defaults: `async ({ id }) =>`
   - Push unconditionally: `args.push("--id", String(id))`

4. **Preserve RFID shorthand** where it's domain-standard: `fc`, `cn`, `fmt`

For large groups (HF, LF), use the `_parts_*.js` pattern — split into manageable files and assemble via spread in `index.js`.

### Step 5: Verify

```bash
# All modules load without errors
node -e "const pm3 = require('./src'); console.log(Object.keys(pm3));"

# Count total leaf commands
node -e "
  const pm3 = require('./src');
  const fc = Promise.resolve({ client: {} });
  function count(o){let c=0;for(const v of Object.values(o)){if(typeof v==='function')c++;else if(typeof v==='object'&&v!==null)c+=count(v);}return c;}
  let t=0;for(const[n,f]of Object.entries(pm3)){if(n==='client')continue;t+=count(f(fc));}
  console.log('Total:', t);
"

# Run the diff check from Step 2 again — should show 0 missing
```

### Step 6: Update MCP server

The MCP server (`src/mcp/index.js`) auto-discovers commands from `commands.json` and uses `commands-help.json` for tool descriptions. No code changes needed — just restart the MCP server after updating the data files and it picks up everything.

### Step 7: Publish

```bash
# Bump version in package.json
# Commit and push
git add -A && git commit -m "Update commands for PM3 vX.Y" && git push

# Publish
yarn publish
```

## Environment

- `PM3` — Path to proxmark3 binary (required for MCP server and TUI)
- `PM3_DEBUG` — Set to `1` to enable daemon debug logging to `/tmp/pm3-daemon.log`. Logs raw stdout chunks, readline events, JSON parsing, command queue state, and child process lifecycle. Useful for diagnosing command hangs.
