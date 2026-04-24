# Claude Design Toolkit

A portable toolkit that gives Claude Code the skills, commands, and templates needed to do frontend/UI design work properly.

## Problems This Solves

- **Blind editing**: Claude edits CSS/HTML without seeing results. This toolkit enforces screenshot-before/after verification via Puppeteer MCP.
- **DOM ignorance**: Claude doesn't understand container hierarchies, stacking contexts, or overflow boundaries. The DOM_MAP template forces explicit tracking.
- **iOS translation gap**: Claude doesn't know which CSS patterns translate to SwiftUI and which are dead ends. IOS_COMPAT.md maps every pattern.
- **Premature coding**: Claude jumps to implementation without confirming understanding. The Design Protocol requires plain-English confirmation first.
- **Cascading breakage**: Claude makes multiple changes at once and breaks things. The workflow enforces one structural change at a time.

## Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and working
- Node.js (required for Puppeteer MCP)
- For iOS projects: Xcode with Simulator

## Installation

```bash
git clone <this-repo> ~/projects/claude-design-toolkit
cd ~/projects/claude-design-toolkit
./install.sh
```

This installs:
- `/design-setup` slash command into `~/.claude/commands/`
- `design-edit` and `design-verify` skills into `~/.claude/skills/`

Then install the required MCP servers in Claude Code:

```bash
claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude
```

For iOS projects:

```bash
claude mcp add ios-simulator -- npx ios-simulator-mcp
```

## Quick Start

1. Open your project in Claude Code
2. Run `/design-setup`
3. Answer the setup questions (project name, platform, tech stack, etc.)
4. The command creates project-specific files: DOM_MAP.md, IOS_COMPAT.md, a design command, and appends the Design Protocol to your CLAUDE.md
5. Start designing with the enforced workflow

## What Each File Does

### Commands

| File | Purpose |
|------|---------|
| `commands/design-setup.md` | Slash command that configures a project for design work. Creates all project-specific files and checks MCP dependencies. |

### Skills

| File | Purpose |
|------|---------|
| `skills/design-edit.md` | Enforces a strict workflow before any CSS/HTML/UI edit: read DOM map, trace containers, screenshot before/after, confirm with user, one change at a time. |
| `skills/design-verify.md` | Post-edit verification: screenshot, check DOM map accuracy, check iOS compatibility, update documentation. |

### Templates

| File | Purpose |
|------|---------|
| `templates/DOM_MAP.md` | Template for tracking the DOM hierarchy, stacking contexts, z-index scale, and overflow boundaries. The structural truth of the page. |
| `templates/IOS_COMPAT.md` | Maps HTML/CSS patterns to SwiftUI equivalents. Prevents using CSS tricks that have no iOS translation. |
| `templates/DESIGN_PROTOCOL.md` | Rules appended to a project's CLAUDE.md that enforce confirmation-before-coding, one-change-at-a-time, and proper design communication. |
| `templates/project-design-command.md` | Template for per-project design resume commands. Filled in by /design-setup with project-specific values. |

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
Done
```

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

```bash
# Check it's installed
claude mcp list

# Reinstall if needed
claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude
```

### Screenshots failing for file:// URLs

Puppeteer needs the full absolute path:
```
file:///Users/you/projects/myproject/index.html
```

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
