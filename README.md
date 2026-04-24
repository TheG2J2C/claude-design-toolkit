# Claude Design Toolkit

A portable toolkit that gives Claude Code the skills, commands, and templates needed to do frontend/UI design work properly.

## Problems This Solves

- **Blind editing**: Claude edits CSS/HTML without seeing results. This toolkit enforces screenshot-before/after verification via Puppeteer MCP.
- **DOM ignorance**: Claude doesn't understand container hierarchies, stacking contexts, or overflow boundaries. The DOM_MAP template forces explicit tracking.
- **iOS translation gap**: Claude doesn't know which CSS patterns translate to SwiftUI and which are dead ends. IOS_COMPAT.md maps every pattern.
- **Premature coding**: Claude jumps to implementation without confirming understanding. The Design Protocol requires plain-English confirmation first.
- **Cascading breakage**: Claude makes multiple changes at once and breaks things. The workflow enforces one structural change at a time.
- **Jargon decisions**: Claude presents technical options without explaining practical impact. The toolkit enforces plain-English pros/cons on every decision.
- **Silent breakage**: Claude edits SVG/HTML and introduces malformed markup. The validation hook catches parse errors immediately after every edit.
- **Locked values drift**: Claude changes a value the user already approved, breaking things. The Lock Pattern marks confirmed values as immutable.
- **Ghost elements**: Claude adds new UI patterns without removing old ones, leaving invisible artifacts. The import/element tracking rule forces cleanup.
- **Visual inaccuracy**: Claude claims "looks right" but misses pixel-level differences. The optional visual comparison pipeline (Puppeteer + pixelmatch + Gemini CLI) catches what Claude's eyes can't.

## Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and working
- Node.js (required for Puppeteer MCP)
- Python 3 (required for validation hook)
- jq (required for validation hook — `brew install jq`)
- For iOS projects: Xcode with Simulator

## Installation

```bash
git clone <this-repo> ~/projects/claude-design-toolkit
cd ~/projects/claude-design-toolkit
./install.sh
```

This installs:
- `/design-setup` slash command into `~/.claude/commands/` (symlinked — auto-updates)
- `design-edit` and `design-verify` skills into `~/.claude/skills/` (copied — re-run install.sh to update)

Then install the required MCP servers in Claude Code:

```bash
# The `serve` subcommand is required — without it the process prints help and exits
claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude serve
```

For iOS projects:

```bash
claude mcp add ios-simulator -- npx ios-simulator-mcp
```

## Quick Start

1. Open your project in Claude Code
2. Run `/design-setup`
3. Answer the setup questions (project name, platform, tech stack, etc.)
4. The command creates project-specific files: DOM_MAP.md, IOS_COMPAT.md, a design command, a validation hook, and appends the Design Protocol to your CLAUDE.md
5. Start designing with the enforced workflow

## What Each File Does

### Commands

| File | Purpose |
|------|---------|
| `commands/design-setup.md` | Slash command that configures a project for design work. Creates all project-specific files, installs the validation hook, and checks MCP dependencies. |

### Skills

| File | Purpose |
|------|---------|
| `skills/design-edit.md` | Enforces a strict workflow before any CSS/HTML/UI edit: read DOM map, trace containers, screenshot before/after, confirm with user, one change at a time. Includes rules for presenting options in plain English. |
| `skills/design-verify.md` | Post-edit verification: screenshot, check DOM map accuracy, check iOS compatibility, update documentation. Includes rules for suggesting improvements clearly. |

### Templates

| File | Purpose |
|------|---------|
| `templates/DOM_MAP.md` | Template for tracking the DOM hierarchy, stacking contexts, z-index scale, and overflow boundaries. The structural truth of the page. |
| `templates/IOS_COMPAT.md` | Maps HTML/CSS patterns to SwiftUI equivalents. Prevents using CSS tricks that have no iOS translation. |
| `templates/DESIGN_PROTOCOL.md` | Rules appended to a project's CLAUDE.md that enforce confirmation-before-coding, one-change-at-a-time, plain-English decisions, and proper design communication. |
| `templates/project-design-command.md` | Template for per-project design resume commands. Filled in by /design-setup with project-specific values. |
| `templates/hooks/validate-design-files.sh` | PostToolUse hook that validates SVG (XML parse) and HTML after every Edit/Write. Catches malformed markup immediately. |

## The Workflow It Enforces

```
User requests a UI change
    |
    v
Claude reads DOM_MAP.md
    |
    v
Claude traces the element's container chain
    |
    v
Claude checks stacking contexts, overflow, z-index
    |
    v
Claude screenshots the current state (Puppeteer MCP)
    |
    v
Claude describes the plan in plain English
    |
    v
User confirms  <-- GATE: no code until confirmed
    |
    v
Claude makes ONE change
    |
    v
Validation hook checks SVG/HTML is valid  <-- AUTOMATIC
    |
    v
Claude screenshots the new state
    |
    v
Claude compares expected vs actual
    |
    v
If unexpected: REVERT and investigate
If correct: update DOM_MAP.md if structure changed
    |
    v
Claude checks IOS_COMPAT.md (if iOS project)
    |
    v
Done — report in plain English with any follow-up options clearly explained
```

## Visual Comparison Pipeline (Optional)

Set up during `/design-setup` if you want pixel-level visual comparison. Uses three tools together — each catches different things:

| Tool | What it does | Catches |
|------|-------------|---------|
| **Puppeteer** | Takes screenshots | Overflow, clipping, layout shifts |
| **pixelmatch** | Pixel-level diff (red = different) | WHERE differences are |
| **Gemini CLI** | AI-powered visual analysis | WHAT the differences mean + CSS fixes |

**Important:** Do NOT use any Gemini MCP server with Claude Code — they all crash due to a `oneOf/allOf/anyOf` schema bug (Anthropic issues #4886, #10606). The `collaborating-with-gemini` skill calls the Gemini CLI directly via a Python bridge script, bypassing MCP entirely.

### Best Practices

- Launch Puppeteer at phone viewport + 50px buffer each side to reveal overflow
- Split images into thirds before comparing for more detail
- Align target and current screenshots to matching regions before pixelmatch
- Gemini Pro gives best results but has daily quota limits on free tier
- Don't screenshot after every change — batch at natural pauses when user is giving rapid instructions

## file:// Protocol (HTML Workbench Projects)

HTML workbench files are opened by double-clicking in Finder, which uses the `file://` protocol. This has one important constraint:

- **Works from file://**: `<script src="file.js">`, `<link href="styles.css">`, `<img src="image.svg">` — standard HTML tags load local files fine.
- **Does NOT work from file://**: JavaScript `fetch()` — the browser blocks it for security reasons.

This means you can split a workbench into multiple files (HTML + CSS + JS) using normal HTML tags. You do NOT need a local server for this. Never use `fetch()` to load local assets.

## Portability

This toolkit is self-contained. To use on another machine:

1. Clone the repo
2. Run `./install.sh`
3. Install the MCP servers via `claude mcp add`

The install script symlinks the command and copies skills, so updates to the toolkit repo are picked up automatically for commands (symlinked) and require re-running `./install.sh` for skills (copied).

## Templates Reference

### DOM_MAP.md Notation

- Indentation = DOM nesting
- `(relative)`, `(absolute)` = CSS position
- `z:N` = z-index value
- Warning symbol = creates stacking context or has overflow:hidden

### IOS_COMPAT.md Sections

- **Layout**: position/overflow/z-index to SwiftUI mappings
- **Interactions**: drag/pull/transition to gesture/animation mappings
- **Avoidance Checklist**: questions to ask before implementing any interaction
- **Common Patterns**: copy-paste SwiftUI code for standard UI patterns

## Troubleshooting

### Puppeteer MCP not connecting

The most common cause is a missing `serve` subcommand:

```bash
# Check current config
claude mcp list

# Remove and re-add with the correct command
claude mcp remove puppeteer-mcp-claude
claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude serve
```

**Note:** After changing MCP config, restart Claude Code for it to take effect.

### Screenshots failing for file:// URLs

Puppeteer needs the full absolute path:
```
file:///Users/you/projects/myproject/index.html
```

### Validation hook not firing

Check that:
1. The hook script exists at `.claude/hooks/validate-design-files.sh` and is executable (`chmod +x`)
2. The `PostToolUse` config is in `.claude/settings.local.json` with the correct absolute path
3. `jq` and `python3` are installed

### /design-setup not appearing

```bash
# Check the symlink exists
ls -la ~/.claude/commands/design-setup.md

# Re-run installer
cd ~/projects/claude-design-toolkit && ./install.sh
```

### Skills not being followed

Skills are advisory. If Claude isn't following the design-edit workflow, remind it:
```
Follow the design-edit skill. Read DOM_MAP.md first, screenshot before changing anything.
```
