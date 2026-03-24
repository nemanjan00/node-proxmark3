# node-proxmark3

Node.js library and MCP server for [Proxmark3](https://github.com/RfidResearchGroup/proxmark3).

Provides a complete JavaScript API with **789 commands** across all Proxmark3 command groups (HF, LF, HW, EMV, NFC, and more), each with JSDoc documentation, smart named parameters, and usage examples.

## Table of contents

<!-- vim-markdown-toc GFM -->

* [Install](#install)
* [Quick Start](#quick-start)
* [Module API](#module-api)
* [MCP Server](#mcp-server)
* [Available Modules](#available-modules)

<!-- vim-markdown-toc -->

## Install

```bash
yarn add node-proxmark3
```

## Quick Start

```javascript
const pm3 = require("node-proxmark3");

const clientPromise = pm3.client("/path/to/proxmark3");

// Use the high-level module API
const hw = pm3.hw(clientPromise);
const hf = pm3.hf(clientPromise);
const lf = pm3.lf(clientPromise);

// Get device info
hw.version().then(console.log);

// Read an HF tag
hf["14a"].info({ verbose: true }).then(console.log);

// Search for LF cards (with parsed output)
lf.search().then(card => {
  console.log(card); // { type: "EM410x", chipset: "...", id: "..." }
});
```

## Module API

Every command group is a factory function that takes a `clientPromise` and returns an object tree of async command functions.

```javascript
const pm3 = require("node-proxmark3");
const clientPromise = pm3.client("/path/to/proxmark3");

// Hardware commands
const hw = pm3.hw(clientPromise);
await hw.version();
await hw.dbg(2);              // Set debug level (0-4)
await hw.setmux("hipkd");     // Set ADC mux
await hw.tune();

// HF MIFARE Classic
const hf = pm3.hf(clientPromise);
await hf.mf.rdbl({ block: 0, keyType: "a", key: "FFFFFFFFFFFF" });
await hf.mf.dump({ cardSize: "1k" });
await hf.mf.autopwn();

// LF EM410x
const lf = pm3.lf(clientPromise);
await lf.em["410x"].clone({ id: "0F0368568B" });
await lf.em["410x"].reader({ continuous: true });

// T55xx programmer
await lf.t55xx.detect();
await lf.t55xx.write({ block: 0, data: "00088048" });

// Preferences
const prefs = pm3.prefs(clientPromise);
await prefs.set.barmode("mix");
await prefs.set.hints(true);
await prefs.get.color();
```

### Smart Parameters

Commands use named parameters instead of raw flag strings. Mutually exclusive flags are collapsed into single enum parameters:

```javascript
// Instead of: command(client, ["hw", "dbg"])(["-2"])
await hw.dbg(2);

// Instead of: command(client, ["hw", "setmux"])(["--hipkd"])
await hw.setmux("hipkd");

// Instead of: command(client, ["hf", "mf", "rdbl"])(["--blk", "0", "-a", "-k", "FFFFFFFFFFFF"])
await hf.mf.rdbl({ block: 0, keyType: "a", key: "FFFFFFFFFFFF" });
```

Required parameters are enforced — calling without them throws an error.

## MCP Server

The library includes an MCP (Model Context Protocol) server that exposes all Proxmark3 commands as tools for AI assistants like Claude.

### Setup

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "proxmark3": {
      "command": "node",
      "args": ["node_modules/node-proxmark3/src/mcp/index.js"],
      "env": {
        "PM3": "/path/to/proxmark3"
      }
    }
  }
}
```

Or run directly:

```bash
PM3=/path/to/proxmark3 npx pm3-mcp
```

### Features

- All commands exposed as individual MCP tools with rich descriptions
- Each tool includes usage syntax, available options, and examples
- Special `lf_search` tool returns parsed card data (type, chipset, ID)
- Special `lf_write` tool for cloning cards with verification
- Fallback `pm3_command` tool for arbitrary command execution

## Available Modules

| Module | Commands | Description |
|--------|----------|-------------|
| `hw` | 22 | Hardware: version, status, tune, reset, debug, memory |
| `hf` | 408 | High frequency: ISO 14443A/B, ISO 15693, MIFARE, iCLASS, FeliCa, DESFire, and more |
| `lf` | 213 | Low frequency: EM, HID, Indala, T55xx, Hitag, AWID, and 25+ card types |
| `data` | 47 | Plot/buffer manipulation: demod, graph, encoding |
| `prefs` | 23 | Client/device preferences (get/set) |
| `emv` | 15 | EMV ISO-14443/ISO-7816 payment card commands |
| `mem` | 18 | Device flash memory and SPIFFS filesystem |
| `nfc` | 14 | NFC forum type commands (barcode, NDEF, type1-4) |
| `analyse` | 11 | Analysis utilities: CRC, checksum, LFSR |
| `smart` | 8 | Smart card ISO-7816 commands |
| `trace` | 3 | Trace capture and analysis |
| `wiegand` | 3 | Wiegand format encode/decode |
| `script` | 2 | Lua/Python script execution |
| `usart` | 2 | Bluetooth UART configuration |

## License

MIT
