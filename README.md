# Claude Design Toolkit

A Claude Code **plugin marketplace** that gives Claude the skills, agent role files, hooks, and templates needed to do frontend/UI design work properly.

> **Restructured 2026-04-29 as a Claude Code plugin marketplace.** Adoption is now one settings.json line + `/plugin install design-core` — no more `install.sh` ritual. See [docs/ADOPTING.md](docs/ADOPTING.md). The legacy install.sh remains as a backstop for one release.

---

## What you get

Install one plugin (`design-core`); receive:

- **2 mandatory skills** — `design-edit` (pre-flight) and `design-verify` (post-flight). Auto-activate on workbench file edits.
- **6 agent role files** — `design-reviewer`, `drift-checker`, `doc-extractor`, `ios-translator`, `token-auditor`, `adversarial-critic`. Usable as subagents AND (with the experimental flag) as Agent Team teammates. Same file works both ways — see [Anthropic docs](https://code.claude.com/docs/en/agent-teams).
- **1 validation hook** — `validate-design-files.sh`. Auto-validates SVG/HTML on Edit/Write.
- **1 slash command** — `/design-setup` to bootstrap a new project's content.
- **All templates** — DOM_MAP, IOS_COMPAT, FOLDER_STRUCTURE, DOC_STRUCTURE, component-template, project-design-command, SOURCES, snippets/.

Auto-update at session start. Semver-versioned. CI-validated on every PR.

---

## Quick install (Path A — marketplace)

In your project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "claude-design-toolkit": {
      "source": { "type": "github", "repo": "TheG2J2C/claude-design-toolkit" }
    }
  }
}
```

Then in Claude Code:

```
/plugin install design-core
```

Done. See [docs/ADOPTING.md](docs/ADOPTING.md) for full details + Path B (legacy install.sh).

---

## What's in this repo

```
claude-design-toolkit/
├── .claude-plugin/
│   └── marketplace.json           ← Marketplace manifest
├── .github/workflows/
│   └── validate-plugins.yml      ← CI: validate manifests, frontmatter, hooks on every PR
├── docs/
│   ├── ADOPTING.md               ← How to install + migrate from install.sh
│   └── PLUGINS.md                ← What each plugin / skill / agent does
├── plugins/
│   └── design-core/
│       ├── .claude-plugin/plugin.json
│       ├── skills/
│       │   ├── design-edit/{SKILL.md, references/, scripts/}
│       │   └── design-verify/{SKILL.md, references/, scripts/}
│       ├── agents/                ← 6 role files
│       ├── hooks/
│       ├── commands/
│       └── templates/
├── install.sh                     ← Legacy install (deprecated, still works)
└── README.md                      ← (this file)
```

---

## Problems this solves

- **Blind editing.** `design-edit` enforces screenshot-before via Puppeteer MCP.
- **DOM ignorance.** DOM_MAP template forces explicit hierarchy tracking.
- **iOS translation gap.** IOS_COMPAT template maps every CSS pattern to its SwiftUI equivalent.
- **Premature coding.** Design Protocol requires plain-English confirmation first.
- **Cascading breakage.** One change at a time, enforced.
- **Silent SVG/HTML breakage.** Validation hook catches malformed markup immediately.
- **Locked-value drift.** Component-spec frontmatter declares `locked_values`; `drift-checker` agent verifies.
- **Visual inaccuracy.** Optional pipeline (Puppeteer + pixelmatch + Gemini CLI) catches what eyeballing misses.
- **Monolithic spec rot.** `DOC_STRUCTURE.md` template defines the atomic component-file pattern + W3C tokens.

---

## Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) v2.1.32+ (for Agent Teams support)
- Node.js (for Puppeteer MCP)
- Python 3 (for validation hook)
- jq (`brew install jq`)
- For iOS projects: Xcode

Install MCP servers:

```bash
# REQUIRED: serve subcommand — without it the process prints help and exits
claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude serve

# Optional, for iOS projects
claude mcp add ios-simulator -- npx ios-simulator-mcp
```

---

## Enabling Agent Teams (optional, experimental)

To make the 6 agent role files double as Agent Team teammates:

```json
// In ~/.claude/settings.json or your project's .claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Then ask Claude to "create an agent team to review habbit-panel from UX, iOS, and accessibility perspectives" — three teammates spawn, each loading one of the agent role files, debate findings, lead synthesises. See [plans/03-managed-agents.md](https://github.com/TheG2J2C/claude-design-toolkit/blob/main/docs/PLUGINS.md) and the [Anthropic Agent Teams docs](https://code.claude.com/docs/en/agent-teams).

---

## Versioning + auto-update

`marketplace.json` declares `auto_update: true`. Claude Code refreshes on session start; new versions install automatically. Pin a version in your settings if you don't want this.

Semver: patch releases never break existing skill/script/template paths.

---

## Contributing

PRs welcome. CI runs on every PR (validate-plugins.yml). Local dev:

```bash
git clone https://github.com/TheG2J2C/claude-design-toolkit.git
cd claude-design-toolkit
# Edit files in plugins/design-core/
# Validate locally:
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))"
for f in plugins/*/.claude-plugin/plugin.json; do python3 -c "import json; json.load(open('$f'))"; done
```

To test against a local project, point its `extraKnownMarketplaces` `source` at a local file path instead of github.

---

## Why this shape (the rationale)

See `docs/PHILOSOPHY.md` (planned). Short version:

- **Atomic plugins** beat a monolithic toolkit because Claude Code's plugin system can update them independently.
- **Agent role files** beat hardcoded subagent prompts because the same file works as a one-shot subagent OR a long-lived Agent Team teammate.
- **Skills as folders** (`SKILL.md` + `references/` + `scripts/`) beat single-file skills because they can carry assets and helpers.
- **Marketplace distribution** beats `install.sh` because it auto-updates and is discoverable in the `/plugin` UI.
- **CI on every PR** catches broken manifests before they ship to projects.

---

## Sources & reading list

See [`plugins/design-core/templates/SOURCES.md`](plugins/design-core/templates/SOURCES.md) for background reading on the W3C Design Tokens spec, atomic component docs, pixel-perfect handoff, Claude Code plugins, Agent Teams, and Vite single-file bundling for WKWebView.
