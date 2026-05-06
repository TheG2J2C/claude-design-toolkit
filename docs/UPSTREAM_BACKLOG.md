# Upstream Backlog

> Findings from real design-project sessions that should land in the toolkit when there's bandwidth. Each entry: source session, value, scope. Tick off as shipped.

---

## From Frankie session — 2026-05-06 (doc-overhaul methodology) — SHIPPED

The full audit-driven / ADR-canonical / lint-enforced documentation methodology, born out of the Frankie 2026-05-06 doc-overhaul after multiple drift incidents. Generic — applies to any spec-driven design project.

### [x] DS-1. `lint-docs.js` — full enforcement tool — `plugins/design-handoff/scripts/lint-docs.js`

Single Node script with 10 rule families. Universal rules baked in (forbidden historical-language phrases, frontmatter integrity, cross-ref integrity, ios-freshness, spec-completeness, design-handover-index-matches, changelog-coverage, audit-folder-staleness, adr-related-specs-bidirectional). Project-specific rules (banned terminology, deprecated names, old slugs) loaded from optional `tools/lint-docs.config.json`. Inline `<!-- lint-allow: <reason> -->` exemption directive.

### [x] DS-2. Pre-commit hook template — `plugins/design-handoff/scripts/pre-commit.sh`

Drop-in for any project using the methodology. Calls `lint-docs.js --quiet` only when staged changes touch docs. Blocks commit on errors. Customise `PROJECT_ROOT_RELATIVE` for repos where design content lives in a subdirectory (consolidated-vault projects).

### [x] DS-3. ADR template — `plugins/design-core/templates/ADR-template.md`

MADR-format template with frontmatter for `cross_cutting:`, `supersedes:`, `superseded_by:`, `related_specs:`. Includes template usage notes (numbering rules, slug-match rule, status flow, pointer pattern). Cross-cutting flag distinguishes ADRs that capture rules-applied-to-many-specs from ADRs that lock a single component.

### [x] DS-4. Decision-register README template — `plugins/design-core/templates/decisions-README.md`

Template for `docs/decisions/README.md` — the ADR registry index. Documents the one-topic-per-ADR rule, naming rule (one-name-everywhere), pointer pattern, status workflow, ADR numbering convention.

### [x] DS-5. End-design-session command template — `plugins/design-handoff/commands/end-design-session.md`

Generic 14-step session-end protocol. Adapt the slash command name (`/end-<project>-design`) per project. Steps include: workbench checkpoints, drift checks, decision register update (ADR drafting + supersede chain), CHANGELOG update, cross-ref propagation check, index consistency, memory pointer-stub policy, vault session capture, lint pass (BLOCKS exit on errors), toolkit upstream review, git commit.

### [x] DS-6. DOC_STRATEGY methodology doc — `plugins/design-core/templates/DOC_STRATEGY.md`

The full 16-section methodology document, generic / cross-project. Covers: doc surface taxonomy, folder structure template, naming conventions, process flow, locks + history (supersede chain), the 8 protocols (P-1..P-8) for different change types, commands + hooks, tooling, backup strategy, archive strategy, memory tools scope (Smart Connections / memsearch / auto-memory), end-to-end example, anti-patterns, adoption checklist.

### [x] DS-7. Configurable lint via `lint-docs.config.json` example — `plugins/design-handoff/scripts/lint-docs.config.example.json`

Project-specific lint rules (banned terminology, deprecated names, old slugs after rename) live in this optional config file. Universal rules stay in lint-docs.js.

### Adoption notes

To adopt this methodology in a new project:

1. Copy `lint-docs.js` → `tools/lint-docs.js`
2. (Optional) Copy `lint-docs.config.example.json` → `tools/lint-docs.config.json` and customise
3. Copy `pre-commit.sh` → `.git/hooks/pre-commit`; `chmod +x`
4. Copy `ADR-template.md` → `docs/decisions/_template.md`
5. Copy `decisions-README.md` → `docs/decisions/README.md`; populate the index table
6. Copy / link `DOC_STRATEGY.md` into the project (vault location: `B_Claude/2_Config/Doc_design-doc-strategy.md`)
7. Update project's `/<project>-Design.md` and `/end-<project>-design.md` to reference `lint-docs.js` + the new method

Proven on Frankie (2026-05-06 commit `42b33ad`); methodology is self-policing once installed.

---

## From Frankie session — 2026-04-29 (toolkit + doc + workbench restructure)

### [ ] 1. Build script template (`templates/build.js`) — HIGH

Lift Frankie's `tools/build.js` into the toolkit. Zero-dep Node script that processes `<!-- INCLUDE: path -->` markers in `*.html.tmpl` files, with recursive resolution and src/ → output directory mirroring. Reusable across any HTML workbench project that needs to split a monolithic file into source components while preserving the file:// double-click contract.

**Source:** `~/projects/Frankie/Frankie_Design_Claude_Code/tools/build.js` (~ 80 lines)

**Where it lands:** `templates/build.js`

**Hooks needed:** `templates/project-design-command.md` Step 1 should mention "if `tools/build.js` exists, edit `workbench/src/` not `workbench/<artifact>.html`"

---

### [ ] 2. Build pipeline README template (`templates/workbench-build-pipeline.md`) — MEDIUM

Lift Frankie's `workbench/src/README.md` into the toolkit. Documents the pipeline + extraction protocol so any project adopting the build pipeline knows how to incrementally migrate from monolithic HTML.

**Source:** `~/projects/Frankie/Frankie_Design_Claude_Code/workbench/src/README.md`

**Where it lands:** `templates/workbench-build-pipeline.md`

---

### [ ] 3. Build pipeline starter snippet folder (`templates/build-pipeline/`) — MEDIUM

Create a copy-pastable starter:

```
templates/build-pipeline/
├── build.js                       (same as item 1)
├── README.md                      (same as item 2)
├── homepage.html.tmpl             (skeleton template with INCLUDE marker example)
└── components/
    ├── rulers.css                 (the rulers extraction as a working example)
    └── rulers.js
```

So adopting the pipeline is a single `cp` from the toolkit instead of hand-writing.

---

### [ ] 4. DOC_STRUCTURE.md — add "Component extraction protocol" section — MEDIUM

Append to `templates/DOC_STRUCTURE.md`:

> ## Component Extraction Protocol (when adopting the build pipeline)
>
> 1. Pick a self-contained block (CSS + matching HTML + JS) in the monolithic source
> 2. Cut to `workbench/src/components/<slug>.{css,html,js}`
> 3. Replace cut location with `<!-- INCLUDE: components/<slug>.{css,html,js} -->`
> 4. Add per-component preview at `workbench/src/preview/<slug>.html.tmpl`
> 5. Run `node tools/build.js`
> 6. Smoke test rebuilt artifact against checkpoint (Puppeteer)
> 7. Commit if green

Currently lives only in Frankie's local `workbench/src/README.md`.

---

### [ ] 5. FOLDER_STRUCTURE.md — mention `workbench/src/` as optional source layout — LOW

In `templates/FOLDER_STRUCTURE.md`, add a note under the `workbench/` block:

> Optional `workbench/src/` directory holds source files when a build pipeline is in use (see `DOC_STRUCTURE.md § Component Extraction Protocol`). The artifacts in `workbench/*.html` are then build outputs — DO NOT hand-edit; edit `src/` instead.

---

### [ ] 6. Build script regex hardening (one-line fix in template) — LOW

In `templates/build.js` (when item 1 lands), use `\S+?` for the include path matcher, NOT `[^\s-]+`. The latter excludes hyphens, which silently fails on paths like `components/modal-cards.js`.

**Bug witnessed:** Frankie session, ~3 hours wasted before the symptom (only 2 of 4 includes resolving) prompted investigation.

---

### [ ] 7. End-session command template (`templates/end-session-command.md`) — LOW

Lift Frankie's `/end-frankie-design` orchestration into a generic toolkit template:
- Parallel checkpoint subagents
- Drift-check per touched component (uses `drift-checker` agent from design-core)
- Mechanical Acceptance Criteria sync
- Surgical doc updates only on structural change
- Lazy memory updates
- Toolkit upstream review (refs THIS file)
- 2-line summary

Already partly in `templates/project-design-command.md`. Could split into a sibling `end-session-command.md` for symmetry.

---

## How this file works

- Every `/end-frankie-design` (or equivalent end-session command in another project) should add findings here, NOT push to the toolkit silently.
- A future session that opens `~/projects/claude-design-toolkit/` should read this file before doing other toolkit work.
- Tick items off as shipped: replace `[ ]` with `[x]` and add a `Shipped: <commit-sha>` line.
- When everything in a "Source" block is shipped, archive the section by moving it under `## Shipped` at the bottom.

---

## Shipped

(Empty — first version of this file, 2026-04-29.)

---

## From Frankie session — 2026-05-04 evening (Batch C — full ecosystem audit + repo consolidation)

### [ ] 9. CRITICAL_CANON.md pattern (template) — HIGH

Always-load canonical-terminology translator. Solves the "memsearch surfaces old/deprecated terms" problem. Every project drifts terminology over time (e.g., Frankie: breeder → Bill the Vet, Vitality → Routine).

**Where it lands:** `templates/CRITICAL_CANON.md` (template with frontmatter + sections: Character canon, Category canon, Naming canon, Doc hierarchy, Memsearch deprecation rule).

**Hooks needed:** `templates/project-design-command.md` should auto-load CRITICAL_CANON.md as part of session-start context. Universal session-start hook (`~/.claude/hooks/session-start.sh`) needs upstream too.

**Source:** `~/Documents/2nd_Brain/2nd_Brain/B_Claude/3_Projects/Frankie/CRITICAL_CANON.md`

---

### [ ] 10. Hub note + alias + MOC pattern (templates) — HIGH

Wikilink-aliased entity hubs serving as graph-view centroids. Each hub has frontmatter `aliases: [variant terms]` so backlinks gather all variants. MOC (Map of Content) is the project-level entry point linking all hubs.

**Where it lands:**
- `templates/Hub_<entity>.md` (template)
- `templates/MOC_<project>.md` (template)
- `templates/HUB_NOTE_PATTERN.md` documentation

**Source:** `~/Documents/2nd_Brain/2nd_Brain/B_Claude/3_Projects/Frankie/Frankie Config/Hubs/` (11 examples — Bill, Frankie, Irene, Habits, MoodSystem, BoneEconomy, StrikeLadder, Training, Onboarding, WalkieTalkie, MOC_Frankie)

**Why it matters:** Without hub notes, knowledge-graph queries hit fragmented refs across many notes. Bill in habit-panel.md, Bill in voices.md, Bill in onboarding.md → no canonical Bill page. Hub note + aliases unifies.

---

### [ ] 11. Plan_pending-followups.md pattern (template) — HIGH

Consolidated tracker for every "until X happens" / "deferred" / "next session" commitment. Stops promises scattering across daily memory files where they get lost.

**Where it lands:** `templates/Plan_pending-followups.md` with sections: §A auto-mode-blocked safety, §B time-sensitive decisions, §C build phase triggers, §D upstream queue pointer, §E open gap-analysis questions, §F design backlog, §G cross-section dependencies, §H stale items.

**Source:** `~/Documents/2nd_Brain/2nd_Brain/B_Claude/3_Projects/Frankie/Frankie Config/2_Plans/Plan_pending-followups.md`

---

### [ ] 12. Lint-ecosystem script pattern — MEDIUM

9-section health check: MCP connectivity, Smart Connections index health (orphan/dup embeddings, folder exclusions), Obsidian IndexedDB stale paths, repo state (required files, no stale path refs), auto-memory (file count, age), hub-note coverage, CRITICAL_CANON freshness, pending-followup deadlines, hook executability.

**Where it lands:** `templates/lint-ecosystem.sh` + `templates/Doc_lint.md` (when to run, how to extend).

**Source:** `~/.claude/scripts/lint-frankie-ecosystem.sh`

---

### [ ] 13. Task assignee convention — MEDIUM

`👤 Gareth` / `🤖 Claude` emoji prefix on every `- [ ]` task. Distinguishes user-actionable from agent-actionable at a glance.

**Where it lands:** `templates/Doc_task-conventions.md`. Update `templates/DOC_STRUCTURE.md` to mention the convention.

**Source:** `~/Documents/2nd_Brain/2nd_Brain/B_Claude/2_Config/13_Reference-Docs/Doc_task-conventions.md`

---

### [ ] 14. Tilde-folder MCP gotcha — LOW (but easy)

Document: MCP server `DATA_DIR` and similar path env vars must use absolute paths, NOT `~/mcp-data/...`. Tilde isn't expanded by MCP servers; literal `~/mcp-data` directories get created in cwd, leading to recursive `cwd/~/mcp-data/~/mcp-data/...` mess.

**Where it lands:** Add a "MCP gotchas" section to `plugins/design-core/SKILL.md` or a new `templates/MCP_SETUP_GOTCHAS.md`.

**Fix that worked:** Change `~/mcp-data/...` → `/Users/<username>/mcp-data/...` (absolute).

---

### [ ] 15. Single-repo-per-scope (vault content INSIDE repo) — MEDIUM

Architectural pattern: when a project has BOTH a code repo AND vault knowledge graph content, the vault content moves INTO the repo as a `vault/` subfolder. Symlink at `<vault>/B_Claude/3_Projects/<name>/` → `<repo>/vault/`. Single git history covers both.

**Where it lands:** `templates/CONSOLIDATION_PATTERN.md` documenting the migration steps + when to use it (vs separate vault folder).

**Source:** Frankie consolidation 2026-05-04 (commits f805ba4, 038260c).

---

### [ ] 16. AskUserQuestion default — LOW (rule, not template)

Universal communication rule: always use the `AskUserQuestion` tool for decisions, never plain-text prompts. Provide background then options with descriptions.

**Where it lands:** Append to `plugins/design-core/SKILL.md` design-edit / design-verify communication-protocol sections. Update `templates/project-design-command.md` Step 1 to mention.

**Source:** `~/.claude/projects/-Users-garethcook-projects-Frankie/memory/feedback_interactive_questions.md`

