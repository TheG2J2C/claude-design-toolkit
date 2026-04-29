# Plugins in this marketplace

| Plugin | Version | Status | Description |
|---|---|---|---|
| `design-core` | 1.0.0 | stable | Skills, agents, hooks, commands, templates. Required for every design project. |
| `design-tokens` | — | planned | W3C Design Tokens 2025.10 + Style Dictionary integration. Will spin out when first project hits the iOS build phase. |
| `design-handoff` | — | planned | Acceptance-criteria runner + automated drift checker against built apps. Will spin out when first project ships. |

## design-core

The mandatory plugin. Every design project should install this.

### Skills (auto-activate on workbench file edits)

| Skill | When it fires | What it does |
|---|---|---|
| `design-edit` | Before editing any `workbench/**/*.html`, `workbench/**/*.css`, or `assets/layout/**/*.svg` | Pre-flight gate — confirms understanding, traces DOM, checks iOS compat, screenshots & measures BEFORE, enforces one change at a time |
| `design-verify` | After editing the same files | Post-flight gate — screenshots & measures AFTER, runs pixel diff, audits DOM_MAP accuracy, checks no LOCKED values moved, updates docs if structure changed |

### Agent role files (subagents AND Agent Team teammates)

| Agent | Job |
|---|---|
| `design-reviewer` | Critiques a component vs its Acceptance Criteria. No measuring. |
| `drift-checker` | Diffs one workbench DOM element vs its component spec. Plain-English delta. |
| `doc-extractor` | Pulls a component out of a monolithic spec into a properly-structured `docs/components/<slug>.md`. |
| `ios-translator` | Maps one component spec to SwiftUI primitives. Flags untranslatable patterns. |
| `token-auditor` | Scans workbench HTML/CSS for raw hex / bare px values that should be token references. |
| `adversarial-critic` | Devil's advocate. Stress-tests a design from user / accessibility / cognitive-load / failure-mode perspectives. |

Use as subagent: `Agent({ subagent_type: "drift-checker", prompt: "Check habbit-panel" })`.

When `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set, the same files double as Agent Team teammate role definitions. Same file works both ways — see [Anthropic docs](https://code.claude.com/docs/en/agent-teams#use-subagent-definitions-for-teammates).

### Hooks

| Hook | Event | What it does |
|---|---|---|
| `validate-design-files.sh` | PostToolUse on Edit/Write | Validates SVG (XML parse) and HTML (basic parse) immediately after each edit. Blocks on parse failure. |

### Commands

| Command | What it does |
|---|---|
| `/design-setup` | Interactive bootstrap for a new design project — creates DOM_MAP.md, IOS_COMPAT.md, folder structure, README, etc., from the templates. |

### Templates (for `/design-setup` and ad-hoc copy)

- `DOM_MAP.md` — DOM hierarchy template
- `IOS_COMPAT.md` — CSS → SwiftUI translation table template
- `FOLDER_STRUCTURE.md` — recommended project folder layout
- `DOC_STRUCTURE.md` — atomic component-file pattern
- `component-template.md` — frontmatter + sections for a single component file
- `DESIGN_PROTOCOL.md` — universal workflow rules
- `project-design-command.md` — template for the project's resume-session slash command
- `SOURCES.md` — reading list (W3C tokens, DESIGN.md, pixel-perfect handoff, etc.)
- `snippets/phone-rulers.html` — drop-in phone reference rulers
- `snippets/swipe-row.html` — Apple-Reminders-style swipe-action row template
