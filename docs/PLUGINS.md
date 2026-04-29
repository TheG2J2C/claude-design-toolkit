# Plugins in this marketplace

| Plugin | Version | Status | Description |
|---|---|---|---|
| `design-core` | 1.0.0 | stable | Skills, 6 agents, 2 hooks (validate + TaskCompleted), commands, templates. **Required** for every design project. |
| `design-tokens` | 1.0.0 | stable | W3C Design Tokens 2025.10 + zero-dep build script generating Swift/CSS/JSON. Install when targeting iOS / Android / multi-platform. |
| `design-handoff` | 1.0.0 | stable | Acceptance-criteria runner + drift-checker CLI + handoff-validator agent + `/handoff-check` slash command. Install when project is ready to hand to an iOS engineer (or another Claude). |

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
| `task-completed-acceptance-check.sh` | TaskCompleted (Agent Teams) | Quality gate — if a workbench file changed but no `docs/components/<slug>.md` was touched, blocks task completion with feedback. Bypass: `SKIP_ACCEPTANCE_CHECK=1`. |

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

---

## design-tokens

### Templates

- `templates/tokens.json` — W3C Design Tokens Format 2025.10 starter (colours, type, spacing, shadows, radius, z-index)
- `templates/tokens.md` — human-readable mirror with rationale

### Scripts

- `scripts/build-tokens.js` — zero-dep generator. Reads `docs/tokens.json`, writes:
  - `generated/tokens.css` — CSS custom properties
  - `generated/Tokens.swift` — Swift extensions (Color + Spacing + Radius + ZIndex enums)
  - `generated/tokens.flat.json` — flattened key→value JSON for any other tool
- For richer output (Kotlin, Android XML, etc.), use Style Dictionary properly: `npm i -D style-dictionary` and write `config.js`.

### Commands

- `/generate-tokens` — symlinks the build script into `tools/` and runs it.

---

## design-handoff

### Scripts

- `scripts/check-acceptance.js` — reads every `docs/components/<slug>.md`, parses YAML frontmatter `locked_values` + `## Acceptance Criteria`, runs Puppeteer against the workbench, emits `acceptance-report.md` with mechanical PASS/FAIL/SKIP + manual review backlog.
- `scripts/check-drift.js` — diffs each component's `dom_anchor` + `locked_values` against the workbench DOM. Pass `--all` for full sweep, `<slug>` for one.

### Agents

- `handoff-validator` — runs the full sweep and writes a single `HANDOFF-READINESS.md` report. Use before handing the project off.

### Commands

- `/handoff-check` — symlinks the runner scripts into `tools/`, spawns the `handoff-validator` agent, surfaces blockers.

### Workflow

1. Install: `/plugin install design-handoff`
2. Run mechanical check anytime: `node tools/check-drift.js --all`
3. Run full audit before handoff: `/handoff-check`
4. Fix blockers, re-run until READY
