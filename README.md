# node-proxmark3

Node.js library and MCP server for [Proxmark3](https://github.com/RfidResearchGroup/proxmark3).

Provides a complete JavaScript API with **789 commands** across all Proxmark3 command groups, each with JSDoc documentation, smart named parameters, and usage examples. Includes an MCP server for AI-assisted RFID research with Claude.

## Table of contents

<!-- vim-markdown-toc GFM -->

* [Install](#install)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
* [Use Cases](#use-cases)
  * [Identify an Unknown Card](#identify-an-unknown-card)
  * [Clone an LF Access Card](#clone-an-lf-access-card)
  * [Audit MIFARE Classic Security](#audit-mifare-classic-security)
  * [Read NFC/NDEF Data](#read-nfcndef-data)
  * [Dump and Restore a Card](#dump-and-restore-a-card)
  * [Emulate a Card](#emulate-a-card)
  * [Sniff Card-Reader Communication](#sniff-card-reader-communication)
  * [Work with T55xx Blank Cards](#work-with-t55xx-blank-cards)
  * [Device Diagnostics](#device-diagnostics)
* [API Design](#api-design)
  * [Smart Parameters](#smart-parameters)
  * [Module Structure](#module-structure)
* [Terminal UI](#terminal-ui)
* [MCP Server for AI-Assisted RFID Research](#mcp-server-for-ai-assisted-rfid-research)
  * [Setup](#setup)
  * [What You Can Do](#what-you-can-do)
* [Available Modules](#available-modules)
* [Updating Command Definitions](#updating-command-definitions)
* [License](#license)

<!-- vim-markdown-toc -->

## Install

As a library in your project:

```bash
yarn add node-proxmark3
```

For MCP server use (global install, works from any project):

```bash
yarn global add node-proxmark3
```

## Prerequisites

- **Node.js** 14+
- **Proxmark3 client binary** — built from the [RRG/Iceman repo](https://github.com/RfidResearchGroup/proxmark3)
- **Proxmark3 device** — connected via USB

## Getting Started

```javascript
const pm3 = require("node-proxmark3");

// Connect to device
const clientPromise = pm3.client("/path/to/proxmark3");

// Initialize the modules you need
const hw = pm3.hw(clientPromise);
const hf = pm3.hf(clientPromise);
const lf = pm3.lf(clientPromise);

// Check device is alive
const version = await hw.version();
console.log(version);
```

## Use Cases

### Identify an Unknown Card

Don't know what kind of card you have? The search commands try all known protocols automatically.

```javascript
// Try all HF (13.56 MHz) protocols
const hfResult = await hf.search();
console.log(hfResult); // Shows detected tag type, UID, and protocol

// Try all LF (125/134 kHz) protocols — returns a parsed object
const card = await lf.search();
console.log(card);
// => { type: "EM410x", chipset: "T55x7", id: "0F0368568B" }

// Check antenna tuning if you're not getting reads
await hw.tune();
```

### Clone an LF Access Card

Read a card, then write its data to a blank T55x7 card.

```javascript
// 1. Read the source card
const source = await lf.search();
console.log(`Found ${source.type} with ID ${source.id}`);

// 2. Place blank T55x7 on reader, clone the ID
await lf.em["410x"].clone({ id: source.id });

// 3. Or use the high-level write() which verifies after writing
await lf.write(destinationCard, source);

// Works for many LF card types:
await lf.hid.clone({ raw: "200670012D" });
await lf.indala.clone({ raw: "A0000000A0" });
await lf.awid.clone({ fmt: 26, fc: 123, cn: 456 });
await lf.pyramid.clone({ fc: 123, cn: 456 });
```

### Audit MIFARE Classic Security

Test the security of MIFARE Classic cards — find default keys, run attack algorithms, dump card contents.

```javascript
// Automated attack — tries everything
await hf.mf.autopwn();

// Or step by step:

// 1. Get card info
await hf["14a"].info();

// 2. Check for default/known keys
await hf.mf.chk({ cardSize: "1k" });

// 3. If you have one key, recover the rest
await hf.mf.nested({ block: 0, keyType: "a", key: "FFFFFFFFFFFF" });

// 4. For hardened cards, try advanced attacks
await hf.mf.hardnested({
  blockKnown: 0, keyTypeKnown: "a", keyKnown: "FFFFFFFFFFFF",
  blockTarget: 4, keyTypeTarget: "a"
});

// 5. Last resort — darkside attack (no keys needed)
await hf.mf.darkside();

// 6. Dump the full card once you have keys
await hf.mf.dump({ cardSize: "1k" });
```

### Read NFC/NDEF Data

Read NDEF records from NFC tags (URLs, text, vCards, etc.).

```javascript
// Auto-detect and read
await hf["14a"].ndefread();

// Type-specific reads
await nfc.type2.read();      // NTAG/Ultralight
await nfc.type4a.read();     // DESFire-based NFC
await hf.mfu.ndefRead();     // MIFARE Ultralight NDEF
await hf.mf.ndefread();      // MIFARE Classic NDEF (with MAD)
```

### Dump and Restore a Card

Back up a card to a file and restore it later — works for most card types.

```javascript
// HF cards
await hf.mf.dump();                              // Dump MIFARE Classic
await hf.mf.restore({ file: "backup.bin", cardSize: "1k" }); // Restore
await hf.mfu.dump();                             // Dump Ultralight/NTAG
await hf.mfu.restore({ file: "backup.bin" });
await hf.iclass.dump();                          // Dump iCLASS
await hf["15"].dump();                           // Dump ISO 15693

// LF cards
await lf.em["4x05"].dump();                      // Dump EM4x05
await lf.t55xx.dump();                           // Dump T55xx
await lf.hitag.dump();                           // Dump Hitag

// View dumps without a card
await hf.mf.view({ file: "backup.bin" });
```

### Emulate a Card

Load a card dump into the Proxmark3's emulator and present it as if it were a real card.

```javascript
// MIFARE Classic emulation
await hf.mf.eload({ file: "card.bin" });         // Load dump to emulator
await hf.mf.sim({ uid: "01020304", cardSize: "1k" }); // Start emulation

// iCLASS emulation
await hf.iclass.eload({ file: "card.bin" });
await hf.iclass.sim();

// LF emulation
await lf.em["410x"].sim({ id: "0F0368568B" });
await lf.hid.sim({ raw: "200670012D" });

// View/edit emulator memory before simulating
await hf.mf.eview({ cardSize: "1k" });
await hf.mf.esetblk({ block: 0, data: "..." });
```

### Sniff Card-Reader Communication

Capture traffic between a card and a legitimate reader for analysis.

```javascript
// Sniff HF traffic
await hf["14a"].sniff();           // ISO 14443A
await hf.iclass.sniff();           // iCLASS
await hf.felica.sniff();           // FeliCa

// Sniff LF traffic
await lf.sniff();
await lf.t55xx.sniff();
await lf.hitag.sniff();

// View captured trace
await trace.list({ protocol: "14a" });
await trace.save({ file: "capture.trc" });
```

### Work with T55xx Blank Cards

T55x7/T5577 are programmable LF cards used as blank targets for cloning.

```javascript
// Detect card configuration
await lf.t55xx.detect();

// Read/write individual blocks
await lf.t55xx.read({ block: 0 });
await lf.t55xx.write({ block: 0, data: "00088048" });

// Wipe to factory defaults (useful if a card is misconfigured)
await lf.t55xx.wipe();

// Password-protected cards
await lf.t55xx.detect({ password: "51243648" });
await lf.t55xx.read({ block: 0, password: "51243648" });
await lf.t55xx.bruteforce();         // Find password
await lf.t55xx.recoverpw();          // Recover from trace
```

### Device Diagnostics

```javascript
// Device info
await hw.version();                   // Firmware version
await hw.status();                    // Runtime status

// Antenna performance
await hw.tune();                      // Measure tuning (both LF and HF)
await lf.tune({ style: "mix" });      // Continuous LF tuning with bar+value display
await hf.tune();                      // HF tuning

// Debug
await hw.dbg(2);                      // Set debug level (0=off, 4=max)
await hw.ping({ length: 32 });        // Test connectivity
```

## API Design

### Smart Parameters

The API transforms raw CLI flags into idiomatic JavaScript:

| Raw CLI | JS API | Why |
|---------|--------|-----|
| `hw dbg -2` | `hw.dbg(2)` | 5 mutually exclusive flags → single level param |
| `hw setmux --hipkd` | `hw.setmux("hipkd")` | 4 exclusive flags → single enum |
| `hf mf rdbl --blk 0 -a -k FFFFFFFFFFFF` | `hf.mf.rdbl({ block: 0, keyType: "a", key: "..." })` | Descriptive names |
| `lf awid reader -@` | `lf.awid.reader({ continuous: true })` | Cryptic flag → clear boolean |
| `hf mf dump --1k` | `hf.mf.dump({ cardSize: "1k" })` | Card size flags → enum |

Required parameters throw if missing. All 789 commands have full JSDoc with `@param`, `@example`, and `@returns`.

### Module Structure

```
pm3.client(path)     → clientPromise
pm3.hw(clientPromise) → { version, status, tune, dbg, ... }
pm3.hf(clientPromise) → { search, "14a": { info, reader, ... }, mf: { rdbl, dump, ... }, ... }
pm3.lf(clientPromise) → { search, parse, write, em: { "410x": { ... } }, hid: { ... }, ... }
pm3.data(clientPromise) → { plot, rawdemod, load, save, ... }
...
```

## Terminal UI

Interactive terminal interface for browsing and executing all Proxmark3 commands. Features a command tree, help panel with usage/options/examples, and named parameter forms for each command.

```bash
yarn global add node-proxmark3
PM3=/path/to/proxmark3 pm3-tui
```

**Layout:**
- **Left panel** — command tree (loaded instantly from `commands.json`)
- **Top right** — help panel showing usage, options, and examples for the selected command
- **Bottom right** — command output log

**Workflow:**
1. Navigate the tree with arrow keys
2. Press **Enter** on a command — a parameter form appears with labeled input fields for each option (text inputs for values like `<hex>`, `<dec>`, checkboxes for boolean flags)
3. **Tab** / **Shift-Tab** to move between fields
4. **Enter** to execute with filled parameters
5. **Escape** to cancel back to the tree
6. **/** to type a raw command with flags directly

Commands with no parameters execute immediately on Enter.

## MCP Server for AI-Assisted RFID Research

The library includes an MCP server that lets AI assistants like Claude directly interact with your Proxmark3. Install globally and use `pm3-mcp` from any project — no need to add it as a dependency to whatever you're working on.

### Install

```bash
yarn global add node-proxmark3
# or
npm install -g node-proxmark3
```

### Setup with Claude Code

Add to your `~/.claude/settings.json` (applies to all projects):

```json
{
  "mcpServers": {
    "proxmark3": {
      "command": "pm3-mcp",
      "env": {
        "PM3": "/path/to/proxmark3"
      }
    }
  }
}
```

Or use `npx` without installing globally:

```json
{
  "mcpServers": {
    "proxmark3": {
      "command": "npx",
      "args": ["-y", "node-proxmark3", "--mcp"],
      "env": {
        "PM3": "/path/to/proxmark3"
      }
    }
  }
}
```

### Setup with Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "proxmark3": {
      "command": "pm3-mcp",
      "env": {
        "PM3": "/path/to/proxmark3"
      }
    }
  }
}
```

### What You Can Do

With the MCP server connected, you can ask Claude things like:

- *"What card is on the reader?"* — runs `hf search` and `lf search`
- *"Dump this MIFARE Classic card"* — runs autopwn, then dump
- *"Clone this card to a blank"* — reads the card, identifies the type, writes to T55x7
- *"Check the security of this access card"* — runs key checks and attacks
- *"What's the antenna tuning look like?"* — runs `hw tune` and interprets results

Each MCP tool has rich descriptions with usage, options, and examples so the AI knows exactly what arguments to pass.

## Available Modules

| Module | Commands | Description |
|--------|----------|-------------|
| `hw` | 22 | Hardware: version, status, tune, reset, debug, memory |
| `hf` | 408 | High frequency: ISO 14443A/B, ISO 15693, MIFARE (Classic/Ultralight/DESFire/Plus), iCLASS, FeliCa, CIPURSE, SEOS, Legic, LTO, Topaz, FIDO, eMRTD, and more |
| `lf` | 213 | Low frequency: EM410x/4x05/4x50/4x70, HID, Indala, T55xx, Hitag, AWID, Pyramid, Gallagher, and 20+ other card types |
| `data` | 47 | Plot/buffer: demodulation, graph manipulation, encoding, signal analysis |
| `prefs` | 23 | Preferences: display, timing, paths, MQTT (get/set) |
| `emv` | 15 | EMV: payment card reading, transaction simulation, vulnerability testing |
| `mem` | 18 | Memory: flash dump/load, SPIFFS filesystem management |
| `nfc` | 14 | NFC: NDEF read/decode, forum types 1-4, NFC barcode |
| `analyse` | 11 | Analysis: CRC, checksum, LFSR, frequency calculation |
| `smart` | 8 | Smart card: ISO 7816 contact interface, raw APDU |
| `trace` | 3 | Trace: capture list, load, save |
| `wiegand` | 3 | Wiegand: format encode/decode/list |
| `script` | 2 | Scripts: Lua/Python script execution |
| `usart` | 2 | Bluetooth: PIN config, factory reset |

## Updating Command Definitions

If your PM3 firmware has new commands:

```bash
# Generate help dump (no device needed)
/path/to/proxmark3 --fulltext > commands-fulltext.txt

# Parse into structured JSON
node scripts/parse-fulltext-help.js

# Regenerate module stubs (overwrites manual edits to generated files)
node scripts/generate-stubs.js
```

## License

MIT
