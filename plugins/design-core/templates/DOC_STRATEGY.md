---
type: methodology
scope: cross-project (any design / spec-driven project)
status: canonical
last_updated: 2026-05-06
tags: [methodology, documentation, adr, doc-strategy]
---

# Design-Document Strategy

> **Generic methodology** for organising spec-driven design documentation so that decisions are traceable, drift is impossible by construction, and another agent (human or AI) can pick up the work without inheriting cruft.
>
> Born out of the Frankie 2026-05-06 doc-overhaul after multiple drift incidents. Applies to any project where design decisions span weeks/months and multiple sources can describe the same fact.

## 1. Why this exists

Three failure modes drove this methodology. Any one of them, if unmitigated, will eventually corrupt your spec set:

1. **Stale live spec.** A decision changes; the spec file used as "the spec" is not updated. A later reader (human or AI) trusts the doc labelled "spec" over a more recent decision lurking elsewhere.
2. **Lock claims without provenance.** Specs carry "locked" stamps that nobody can verify against a recorded decision event. AI agents in particular are tempted to upgrade "we discussed it" to "locked".
3. **Cross-spec drift.** A decision in spec X changes a value in spec Y. X is updated; Y silently keeps the old value because nobody enforced "now propagate to Y".

The methodology below makes each failure mode mechanically detectable or impossible.

## 2. Doc surface taxonomy

Six categories of document, each with one job. Don't blur them.

| Category | Purpose | Mutability | Cardinality |
|---|---|---|---|
| **Live spec** | What to build, current state only | Mutable; bump `last_updated` on each change | One per component |
| **ADR (Architecture Decision Record)** | Why the decision was made + the locked answer | **Immutable once accepted** — supersede via new ADR | One per decision |
| **Changelog** | Human-readable summary of what changed when | Append-only | One per project |
| **Audit folder** | Working files for a section close-off (gap analysis, Q&A, raw decisions) | Frozen historical reference once the ADR is accepted | One folder per close-off event |
| **Index / handover** | Pointer table to find specs and ADRs | Mutable; updated when status changes | One per project |
| **Cross-cutting rules** | Universal constraints that apply to every spec | Mutable; rare changes need an ADR | One per project (`rules.md`) |

A separate **memory layer** (auto-memory, vault session memory) carries learnings, preferences, and pointers — but never duplicates spec content.

## 3. Folder structure

Generic template. Adapt names but keep the structure.

```
<project>/
├── README.md                    Folder map + invariants
├── CHANGELOG.md                 Keep-a-Changelog 1.1.0
├── DESIGN_HANDOVER.md           Index of components + status (mutable)
├── DOM_MAP.md                   Structural truth (web/iOS specific)
├── IOS_COMPAT.md                CSS → SwiftUI (web/iOS specific)
│
├── docs/
│   ├── components/<slug>.md     Live specs — one per component
│   ├── decisions/
│   │   ├── README.md            ADR index + naming/pointer rules
│   │   ├── ADR-NNNN-<slug>.md   Immutable per-decision records (MADR)
│   │   └── _working/            In-flight audits not yet promoted to ADR
│   ├── tokens.md / tokens.json  Design tokens (W3C format)
│   ├── naming.md                Naming convention reference
│   ├── rules.md                 Universal rules
│   ├── deferred.md              Features dropped from current scope
│   ├── _audit/<date>_<topic>/   Section close-off folders (frozen after ADR accept)
│   ├── _archive/                Historical content (never current spec)
│   └── superpowers/specs/       Plan/strategy documents (this overhaul, design proposals)
│
├── tools/
│   ├── lint-docs.js             Enforces all rules; pre-commit hook + session-end gate
│   ├── check-ios-freshness.js   ios_last_reviewed >= last_updated
│   ├── check-spec-completeness.js  Required sections present
│   ├── check-drift.js           Workbench-vs-spec pixel/value diff
│   └── check-acceptance.js      Per-spec acceptance criteria roll-up
│
├── workbench/                   Build artifacts (the visual truth for design projects)
│   └── _archive/checkpoints/    Date-stamped snapshots
│
├── assets/                      Static dependencies
│
└── .git/hooks/pre-commit        Enforces lint-docs.js on every commit
```

**Vault side** (Obsidian — knowledge layer, not the source of truth for build):

```
(vault)/B_Claude/3_Projects/<project>/
├── <project> Config/
│   ├── 1_Memories/Mem_<date>.md         Daily session memory
│   ├── 2_Plans/Plan_pending-followups.md Open commitments index
│   ├── 5_Decisions/Idx_Decisions.md     Pointer-only mirror of repo ADR registry
│   ├── 6_References/                    External research links
│   └── 7_Tools/                         Cross-project tooling notes
├── Hubs/                                Knowledge-graph hub notes
└── MOC.md                               Map of Content
```

Vault never carries content the build agent needs. It carries the user's working notes, history, and pointers.

## 4. Naming conventions

### One name everywhere

The single most-leveraged rule. The slug for a thing is identical across:
- File name (`<slug>.md`)
- Frontmatter `slug:` field
- ADR ID (`ADR-NNNN-<slug>.md`)
- Code (Swift class root, JS module, CSS class prefix)
- UI copy (user-facing label)
- Audit folder slug
- Vault Dec_ pointer slug

If a mismatch surfaces (e.g. spec file `subscription.md` but UI says "Premium"), the inconsistent layer is the bug — rename it. No internal/external split.

### File naming

| Doc type | Pattern | Example |
|---|---|---|
| Live spec | `<slug>.md` (kebab-case) | `bone-economy.md` |
| ADR | `ADR-NNNN-<slug>.md` | `ADR-0001-bone-economy.md` |
| Audit folder | `<date>_<topic>/` | `2026-04-30_bone-economy-gap-analysis/` |
| Audit subfile | `01-source-spec-extraction.md`, …, `05-decisions-log.md` | (numbered methodology) |
| Workbench checkpoint | `<file>_<date>.<ext>` | `homepage_2026-05-06.html` |
| Pre-change rollback | `<file>_pre-<change>_<date>.<ext>` | `pulldown_pre-bodyswap_2026-04-28.html` |
| Daily memory | `Mem_<date>.md` | `Mem_2026-05-06.md` |
| Plan | `Plan_<topic>.md` | `Plan_pending-followups.md` |
| Decision pointer (vault) | `Dec_<date>_<topic>.md` (pointer-only) | `Dec_2026-04-30-bone-economy-locked.md` |

### ADR numbering

- Monotonic, never reused (even for rejected ADRs)
- Zero-padded to 4 digits (`ADR-0001`, not `ADR-1`)
- Globally unique per project

### Status values

| Spec status | Meaning |
|---|---|
| `draft` | Working on it; values may change without notice |
| `in-progress` | Active development; structure mostly settled |
| `locked` | Decision recorded in an ADR; values cannot change without a new ADR |
| `spec-only` | Conceptual reference (no buildable component) |

| ADR status | Meaning |
|---|---|
| `proposed` | Drafted; awaiting user accept |
| `accepted` | Locked, immutable |
| `superseded` | Replaced by a later ADR (link via `superseded_by:`) |
| `rejected` | Drafted but not adopted (kept for trace) |

## 5. Process flow — how docs tie together

```
                 ┌──────────────────────────────────────────────────┐
                 │  USER DECISION (Q&A session, sketch, etc.)       │
                 └──────────────────────────────────────────────────┘
                                       │
                                       ▼
              ┌────────────────────────────────────────────────┐
              │  AUDIT FOLDER (working)                        │
              │  docs/_audit/<date>_<topic>/                   │
              │   ├── 01-source-spec-extraction.md             │
              │   ├── 02-current-state-extraction.md           │
              │   ├── 03-gap-analysis.md                       │
              │   ├── 04-questions.md                          │
              │   └── 05-decisions-log.md                      │
              └────────────────────────────────────────────────┘
                                       │
                          (decisions distilled)
                                       ▼
              ┌────────────────────────────────────────────────┐
              │  ADR DRAFT  status: proposed                    │
              │  docs/decisions/ADR-NNNN-<slug>.md             │
              │  - Context · Decision · Consequences ·          │
              │    Alternatives · References                    │
              └────────────────────────────────────────────────┘
                                       │
                                 (user reviews)
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
                   ACCEPT                       REJECT / EDIT
                          │                         │
                          ▼                         ▼
              ┌─────────────────────────┐    (iterate the draft)
              │ ADR  status: accepted   │
              │ Frozen — body never     │
              │ edited again            │
              └─────────────────────────┘
                          │
                          ├─────────────────────────────────────────┐
                          ▼                                         ▼
       ┌──────────────────────────────────┐    ┌─────────────────────────────────┐
       │ LIVE SPEC                        │    │ INDEX UPDATES                   │
       │ docs/components/<slug>.md        │    │  - DESIGN_HANDOVER.md           │
       │  status: locked                  │    │  - docs/decisions/README.md     │
       │  locked_by: ADR-NNNN             │    │  - (vault) Idx_Decisions.md     │
       │  Body: current state only        │    └─────────────────────────────────┘
       │  Acceptance: VISUAL + INTEGRATION│
       └──────────────────────────────────┘
                          │
                          ▼
       ┌──────────────────────────────────┐
       │ CHANGELOG.md (append entry)      │
       │  ## YYYY-MM-DD                   │
       │  ### Added / Changed / Removed   │
       │  - One sentence (see ADR-NNNN)   │
       └──────────────────────────────────┘
                          │
                          ▼
       ┌──────────────────────────────────┐
       │ AUDIT FOLDER → frozen            │
       │ Treated as historical reference; │
       │ not edited again. ADR is now     │
       │ canonical.                        │
       └──────────────────────────────────┘
```

## 6. Locks + history

### Locks

A spec is `locked` if and only if a corresponding accepted ADR exists. The frontmatter field `locked_by: ADR-NNNN` makes this verifiable. The lint script enforces:

- Every `locked` spec has a `locked_by:` field
- `locked_by` resolves to an existing ADR with status `accepted` or `superseded` (with forward link)
- Every ADR's `related_specs:` array contains specs that point back at the ADR

There is no other way to be "locked". `locked_date: YYYY-MM-DD` claims without an ADR backing them are flagged by lint as unverifiable and demoted to `draft`.

### History — the supersede chain

When a locked decision needs to change:

1. Write a NEW ADR that captures the new decision in full.
2. Old ADR's status flips to `superseded`. Set `superseded_by: ADR-NNNN`.
3. Old ADR's body is **never edited** — it's a frozen historical record of what was decided then.
4. Live spec updates to match the new ADR's content.
5. CHANGELOG entry under today's date.

To trace history of any decision: read the live ADR. If superseded, follow the chain to current. The ADR registry is your timeline.

### What about audit folders?

Audit folders carry deeper rationale than ADRs (gap analysis, Q&A, raw decisions log). They're produced during the close-off process; once an ADR captures the decisions, the audit folder is **frozen historical reference**. Rules:

- Never edit a frozen audit folder. If a later session changes a decision, the change goes in a new ADR — not back into the old folder.
- Lint flags any audit-folder content that contradicts the current live spec (warning level — surfaces drift but doesn't block).
- Audit folders are excluded from semantic search by design (in Smart Connections / memsearch) so their content doesn't pollute current-state queries.

## 7. The change protocol — 8 protocols (P-1..P-8)

Every change falls into one of these patterns. The protocol specifies which doc surfaces must update together.

### P-1 — Single-spec edit (no decision change)

Refining wording, fixing a typo, clarifying behaviour. No ADR, no audit folder, no cross-spec touch.

| Surface | Update |
|---|---|
| The spec | the change |
| Frontmatter `last_updated` | today |
| Frontmatter `ios_last_reviewed` | only if iOS section touched |
| CHANGELOG (optional) | one-line entry if user-visible |
| Lint pre-commit | passes |

### P-2 — Spec graduates `in-progress` → `locked`

The full close-off ritual.

| Step | Surface | Action |
|---|---|---|
| 1 | Audit folder | Run gap analysis (5-step methodology) — produce decisions log |
| 2 | New ADR | Draft `ADR-NNNN-<slug>.md`, status `proposed` |
| 3 | User review | Accept / edit / reject |
| 4 | ADR | Status flipped `proposed` → `accepted`, `accepted_date` set |
| 5 | Spec frontmatter | `status: locked`, `locked_by: ADR-NNNN`, bump `last_updated`, set `ios_last_reviewed` |
| 6 | Spec body | Cleaned of any "was X / previously / earlier / superseded" residue |
| 7 | DESIGN_HANDOVER index | Status column updated |
| 8 | CHANGELOG | Dated entry under "Added" or "Changed" |
| 9 | Vault Idx_Decisions | New row pointing at the ADR (pointer-only — NOT a duplicate Dec_ file with body content) |
| 10 | Cross-spec consumers | If any `referenced_by:` spec has values that depend on this lock, update them in the same commit (see P-3) |
| 11 | Pre-commit lint | passes (lint catches missing pieces) |
| 12 | Session-end lint | passes |

### P-3 — Cross-spec ripple

A decision in spec X changes a value or rule documented in spec Y.

| Step | Action |
|---|---|
| 1 | Update spec X (the originating decision) |
| 2 | **In the same session, edit spec Y as well.** Do not "queue for later". |
| 3 | Update Y's `last_updated` |
| 4 | If Y is locked: write a new ADR superseding the relevant portion of Y's existing ADR. Old ADR `superseded_by:` set. |
| 5 | If Y is draft: just edit the spec body |
| 6 | CHANGELOG entry naming both X and Y |
| 7 | Lint verifies all `referenced_by:` slugs resolve and no orphaned cross-refs |

**Anti-pattern this kills:** flagging an "Open ripple" or "Required ripple" in a comment but never executing it. The ripple is part of the same commit.

### P-4 — Locked-spec revision

A previously-locked spec needs a new decision (e.g., the bone economy revision mid-Weekly-Check-in session).

| Step | Action |
|---|---|
| 1 | DO NOT edit the existing audit folder or existing ADR |
| 2 | Write a new ADR superseding the relevant portion of the old ADR |
| 3 | Old ADR's status flips to `superseded`. Body never edited; only `superseded_by:` field added |
| 4 | New ADR carries the current decision in full |
| 5 | Update the live spec to match the new ADR |
| 6 | CHANGELOG entry under "Changed" |
| 7 | DO NOT bury the revision in another spec file |

### P-5 — Naming change (slug rename)

| Step | Action |
|---|---|
| 1 | `git mv` all affected files |
| 2 | Update slug in frontmatter |
| 3 | Update ALL `depends_on:` and `referenced_by:` lists across other specs |
| 4 | Update all body-text `*.md` references |
| 5 | Update DESIGN_HANDOVER.md index |
| 6 | Update CLAUDE.md (or equivalent) if it referenced the old name |
| 7 | CHANGELOG entry |
| 8 | Workbench code-align (CSS classes / DOM IDs) registered as a follow-up if not done in same commit |

### P-6 — Audit folder retirement

Once an ADR captures the same content as a legacy audit folder:

| Step | Action |
|---|---|
| 1 | Audit folder gets a `RETIRED.md` stub linking to the ADR |
| 2 | Move folder to `docs/_archive/_audit/<date>_<topic>/` |
| 3 | ADR is canonical from this point forward |

### P-7 — Vault decision-pointer retirement

Each existing `Dec_*.md` becomes a pointer-only stub linking to its ADR. New entries are pointers only. `Idx_Decisions.md` mirrors the ADR registry exactly.

This eliminates the vault as a parallel decision-record stack — the vault keeps an index, the repo keeps the canonical ADRs.

### P-8 — Memory file pointer-stub policy

Memory files in auto-memory (`~/.claude/projects/<project>/memory/`):

| File type | Pattern | Body |
|---|---|---|
| `feedback_*.md` | User correction or preference | Brief — the rule, the why, when to apply |
| `reference_*.md` | Pointer to external system | Brief — what's there, when to read it |
| `project_*.md` | Project state | Mostly pointers; do NOT duplicate spec content |
| `project_*_locked.md` | Pointer-only stub | Links to canonical ADR + spec + audit folder. NO duplicated rules / values. |

This stops `project_*_locked.md` ↔ spec drift. Memory files that duplicated spec content (the failure mode) become single-link redirects.

## 8. Commands + hooks — what fires when

### Session start

A SessionStart hook injects context into every conversation:

```
- README + folder map (top 20 lines)
- Decision register (docs/decisions/README.md table)
- Latest daily Mem_<date>.md (top 40 lines)
- git status (short)
- Doc lint (--quick mode — frontmatter + cross-refs only, fast)
```

The slash command for resuming work (`/Frankie_Design` for this project, generic equivalent for others) reads:

```
- README.md
- docs/rules.md
- docs/decisions/README.md
- DESIGN_HANDOVER.md
- MEMORY.md (index only)
```

It does NOT bulk-load all component specs — lazy-load by topic.

### Mid-session

| Trigger | Tool / skill | Effect |
|---|---|---|
| Before any UI/spec change | `design-edit` skill | Pre-flight gate: confirm understanding, DOM trace, screenshot+measure BEFORE |
| After any UI/spec change | `design-verify` skill | Post-flight gate: screenshot+measure AFTER, drift check, audit DOM |
| Cross-spec ripple appears | Protocol P-3 (manual discipline + lint) | Update both specs in the same commit |

### Pre-commit hook

Installed at `.git/hooks/pre-commit`. Runs on every commit touching docs:

```bash
node tools/lint-docs.js --quiet
```

Blocks commit on errors. Pass `--no-verify` to bypass — but the lint catches real drift; bypass means committing it.

### Session end

The `/end-frankie-design` (or generic `/wrap-session`) command runs through:

1. Workbench checkpoints (parallel subagents)
2. Drift check per touched component
3. Acceptance Criteria mechanical updates
4. **Decision register update** — draft ADRs for any new locks; supersede ADRs for any revisions; pointer updates in Idx_Decisions
5. **CHANGELOG entry** for each spec edited
6. **Cross-ref propagation check** — every spec edited has its `referenced_by:` consumers validated or updated
7. **Index consistency** — DESIGN_HANDOVER + decisions/README + Idx_Decisions all reflect current state
8. DOM_MAP / IOS_COMPAT (only if structural change)
9. Memory updates — pointer-stub policy enforced (≤3 files per session)
10. Vault session capture (`Mem_<date>.md`)
11. **Lint pass** (`node tools/lint-docs.js`) — must exit 0 to proceed
12. Toolkit upstream check
13. Two-line summary
14. Git commit (pre-commit hook runs lint again)

## 9. Tooling

### `lint-docs.js` — the enforcement tool

Single Node script. Ten rule families:

| Rule | What it checks | Severity |
|---|---|---|
| **forbidden-phrases** | No "previously / formerly / superseded / earlier / no longer / used to / deprecated" in live specs. No "free trial" terminology. No retired slug names (project-specific). | error |
| **frontmatter-required** | Every spec has `status`, `slug`, `last_updated`. Locked specs have `locked_by:`. | error / warn |
| **frontmatter-locked-by-resolves** | `locked_by: ADR-NNNN` resolves to an existing ADR with status `accepted` or `superseded`. | error |
| **cross-ref-integrity** | Every `depends_on:` / `referenced_by:` slug exists in components/. | error |
| **ios-freshness** (governance Rule 2) | `ios_last_reviewed >= last_updated`. | error |
| **spec-completeness** (governance Rule 3) | Locked specs have `emits_events`, `consumes_events`, `## iOS Implementation`, `## Acceptance Criteria` with VISUAL + INTEGRATION subsections. | warn |
| **design-handover-index-matches** | Every row in `DESIGN_HANDOVER.md` showing `⚠️ LOCKED` has a corresponding spec with `status: locked` + `locked_by:` set. | error |
| **changelog-coverage** | Every spec with `last_updated` in the past 7 days has a CHANGELOG entry on or after that date. | warn |
| **audit-folder-staleness** | Legacy audit folders not retired (no `RETIRED.md` stub) whose topic matches a locked spec — flag for Protocol P-6 retirement. | warn |
| **adr-related-specs-bidirectional** | Every component-bound ADR's `related_specs:` contains specs that have `locked_by:` pointing back. Cross-cutting ADRs (`cross_cutting: true` frontmatter flag) are exempt. | warn |

Inline exemption: `<!-- lint-allow: <reason> -->` on a line. Reason required.

Cross-cutting ADRs (governance, universal-rules) carry a `cross_cutting: true` frontmatter flag. The `adr-related-specs-bidirectional` rule skips them — their `related_specs` lists "specs the rules apply to", not "specs locked by this ADR".

### `lint-docs.js --quick`

Fast subset: frontmatter + cross-refs only (skips forbidden-phrase scan). Used at startup to surface state without slowing the session.

### Supporting tools

- `check-ios-freshness.js` — original tool, integrated into lint-docs.
- `check-spec-completeness.js` — original tool, integrated into lint-docs.
- `check-drift.js` — workbench DOM vs spec values (spawned per-component as subagent in session-end).
- `check-acceptance.js` — roll up acceptance criteria across all specs.
- `compare.js` — pixelmatch + diff PNG inspection (workbench visual verification).

## 10. Backup strategy

### Git

Every change is a git commit. Pre-commit hook enforces lint. The commit message is part of the canonical record — the WCI session's bone-economy revision was captured in `97fe5da`'s commit message, and the audit found it there when the audit folder + spec had drifted.

**Rule:** commit messages for spec changes are part of the audit trail. Be specific. Don't write "WIP"; write what changed and why.

### Workbench checkpoints

Before any risky change:

```bash
cp workbench/<file>.html workbench/_archive/checkpoints/<file>_$(date +%Y-%m-%d).html
```

The session-end protocol auto-checkpoints when a non-trivial diff is detected.

### Vault

The vault may or may not be git-tracked depending on project setup:

- **If the vault is consolidated into the project repo** (the Frankie pattern from 2026-05-04 onward — vault content lives at `~/projects/<project>/vault/` as part of the project git repo): vault commits are part of the project's git history.
- **If the vault is a standalone Obsidian directory** (default — `~/Documents/2nd_Brain/`): typically NOT git-tracked. Vault content backup relies on the user's filesystem backup (Time Machine, iCloud, etc.) plus Obsidian Sync if configured.

For Frankie specifically: as of 2026-05-06, the standalone vault path (`~/Documents/2nd_Brain/`) is NOT a git repo; the consolidated path (`~/projects/Frankie/vault/` — symlinked) IS part of the project git history. Both paths are kept in sync via symlinks.

**Recommendation when bootstrapping a new project:** decide upfront — consolidated (vault content tracked in project git) or standalone (vault backup via filesystem + Obsidian Sync). Don't mix.

### What's NOT backup

- Auto-memory (`~/.claude/projects/<project>/memory/`) is not git-tracked. It's session memory; if it disappears the world doesn't end. Treat as transient.
- `.memsearch/` is regenerable from session transcripts; do not git-track.

## 11. Archive strategy

### Three categories of archived content

| Category | Location | Why |
|---|---|---|
| **Frozen audit folders** | `docs/_archive/_audit/<date>_<topic>/` | Captured rationale at the time; ADR is now canonical. Excluded from semantic search. |
| **Source-spec snapshots** | `docs/_archive/source-specs-superseded-<date>/` | Original briefs (vision, master task list, etc.) preserved for trace integrity. |
| **Pre-overhaul docs** | `docs/_archive/<original-name>_<date>.md` | E.g., the 125 KB monolithic spec from before the per-component split. |

Archive folders are:
- Read-only — never edit
- Excluded from semantic search (Smart Connections + memsearch are configured to skip `_archive/` paths)
- Not bulk-loaded by `/Frankie_Design` startup
- Loaded only on explicit research query ("what did the original brief say about X?")

### When to archive

- Audit folder retired (Protocol P-6) — when an ADR captures the same content
- Live doc deprecated (the CRITICAL_CANON case) — when its job is taken over by ADRs/specs
- Source-spec superseded — when the close-off methodology produces the per-component spec set

### What never archives

- ADRs are append-only; superseded ADRs stay in the live registry with status `superseded`. They link forward; readers follow the chain.
- The CHANGELOG is append-only; old entries stay forever.

## 12. Memory tools — scope and limits

The user's setup has THREE memory layers, each with a different job. Don't blur them.

### Auto-memory (`~/.claude/projects/<project>/memory/`)

| What it's for | What it's NOT for |
|---|---|
| User preferences ("don't use Gemini", "always use rulers") | Spec content (use `docs/components/`) |
| Process feedback ("interactive questions only") | Decision rationale (use ADR) |
| Pointers to external systems (Linear, Notion) | Duplicated values |
| `project_*_locked.md` — pointer stubs only | Body content that mirrors a locked spec |

Scope: per-project, loaded into every session via the SessionStart hook (top 20 lines of `MEMORY.md` index).

Decay: kept lean. Maximum 3 memory file edits per session. Stale memory gets pruned during `/end-frankie-design` step 9.

### Vault session memory (`(vault)/Frankie Config/1_Memories/Mem_<date>.md`)

| What it's for | What it's NOT for |
|---|---|
| Daily session summary in human English (5-7 bullets) | Long-term truth (use ADR + spec) |
| What changed today, what's next | Cross-session decisions |
| Trace integrity ("I closed off bone-economy on this date") | Operational state |

Generated by the vault session-capture script. The user reviews these; they're the human-readable trail.

### Smart Connections (Obsidian — semantic search)

Generates embeddings for every vault note. Lets you search by meaning across the knowledge graph.

| What it's for | What it's NOT for |
|---|---|
| "What did I think about X?" — surfaces past reasoning notes, refs, decisions | Current build state |
| Connecting hub notes to component specs via similarity | Ranking by recency |
| Discovery of related but not explicitly linked content | Replacing explicit cross-refs |

**Scope rules:**
- `_archive/` folders are excluded by design — they pollute current-state queries
- Indexes the vault, plus symlinked repo content (rules.md, ADRs, components — depending on setup)
- Reindex when a major restructure happens

Configured via Smart Connections plugin settings. Typical exclude patterns: `**/_archive/**`, `**/source-specs-superseded-*/**`.

### memsearch (transcript memory)

Each session's transcript is summarised into `~/projects/<project>/.memsearch/memory/<date>.md`. The `memsearch` MCP tool searches across these transcript summaries.

| What it's for | What it's NOT for |
|---|---|
| "What did the user say about X in past sessions?" — recovery of conversation context | Spec content |
| Recovering decisions buried in commit messages or quick chats | Searching current code |
| Archeology when ADR doesn't exist yet for a topic | Replacing the ADR registry |

**Scope rules:**
- Per-project transcript memory
- Regenerable from raw session transcripts (in `~/.claude/projects/<id>/<session>.jsonl`)
- The user has a kill-switch decision pending (per their own `Plan_pending-followups.md`) — memsearch may be redundant with Smart Connections + ADR registry

### Memory tool decision tree

When a question comes up, the right tool is:

| Question pattern | Tool |
|---|---|
| "What does spec X say?" | Read `docs/components/<x>.md` |
| "Why was X decided that way?" | Read `docs/decisions/ADR-NNNN-<x>.md` (and supersede chain) |
| "What changed when?" | Read `CHANGELOG.md` |
| "What did the user prefer about X (process / style)?" | auto-memory (`feedback_*.md`) |
| "What was discussed in past sessions about X?" | memsearch (if topic isn't yet captured in an ADR) |
| "What's connected to topic X across the knowledge graph?" | Smart Connections |
| "What's the latest state of project Y?" | Vault `Mem_<latest>.md` + git log |

If two layers carry conflicting information, the canonical hierarchy is:

```
ADR > Live spec > rules.md > tokens.json > CHANGELOG
   > vault Mem_<date>     (recent)
     > vault Hubs / refs  (curated)
       > Smart Connections (semantic recall)
         > memsearch       (transcript recall)
           > auto-memory   (preferences, pointers)
```

Higher = more authoritative. The lint script enforces consistency at the top of the hierarchy; the user enforces it manually for the lower layers when drift surfaces.

## 13. Complete end-to-end example

Walk through a typical change — locking a new component called `Streak Display`.

### Session N — gap analysis

- User opens design discussion on Streak Display
- AI runs gap analysis methodology, creating `docs/_audit/2026-MM-DD_streak-display-gap-analysis/` with files 01–05
- 05-decisions-log.md captures decisions SD-1 through SD-7

### Session N — ADR draft

- AI drafts `docs/decisions/ADR-0008-streak-display.md`, status `proposed`
- Sources: 05-decisions-log.md + any cross-spec impacts identified
- Body covers: Context · Decision · Consequences · Alternatives · References (pointer to audit folder)
- User reviews, accepts → status flips `accepted`, `accepted_date` set

### Session N — live spec rebuild

- AI creates / rewrites `docs/components/streak-display.md`
- Audit-driven: every section sourced from the canonical state (ADR-0008 + any cross-spec refs)
- Frontmatter: `status: locked`, `locked_by: ADR-0008`, `last_updated: 2026-MM-DD`, `ios_last_reviewed: 2026-MM-DD`, `emits_events`, `consumes_events`
- Body: current state only — no historical residue
- Acceptance Criteria: VISUAL + INTEGRATION subsections

### Session N — cross-spec ripple

- Streak Display affects how Habit Panel displays a per-row streak badge
- Per Protocol P-3, AI updates `habit-panel.md` in the same session/commit
- New event added to habit-panel's `emits_events:` list

### Session N — index updates

- DESIGN_HANDOVER.md gets a row for Streak Display
- docs/decisions/README.md gets a row for ADR-0008
- (vault) Idx_Decisions.md gets a pointer

### Session N — CHANGELOG

```markdown
## 2026-MM-DD

### Added
- **Streak Display spec locked.** (See [ADR-0008](docs/decisions/ADR-0008-streak-display.md).)

### Changed
- **Habit Panel** emits `habit.streak-milestone` for per-row streak badge rendering. (See [ADR-0008](docs/decisions/ADR-0008-streak-display.md).)
```

### Session N — memory + vault

- New auto-memory file (if a process learning emerged) — pointer-only
- vault `Mem_<date>.md` populated with the 5-7 bullet summary

### Session N — lint + commit

- `node tools/lint-docs.js` → 0 errors
- Pre-commit hook fires on `git commit`, runs lint again, passes
- Commit message describes the lock: ADR-0008 + spec + cross-spec ripple + CHANGELOG

### Session N+1 — revision (months later)

- User decides streak threshold needs to change from 3 days to 7 days
- AI does NOT edit ADR-0008 — it's immutable
- AI drafts `ADR-0009-streak-display-threshold.md` with the new decision
- Old ADR-0008's `superseded_by: ADR-0009` set; status flips to `superseded`
- Live spec updates to match ADR-0009
- CHANGELOG: "Changed: streak threshold from 3 → 7 days (see ADR-0009, supersedes ADR-0008)"
- Lint passes; commit lands

The history of the streak-display decision is now recoverable as: ADR-0008 (initial) → ADR-0009 (revised). Anyone reading the registry can follow the chain.

## 14. Anti-patterns to spot and refuse

| Symptom | Diagnosis | Fix |
|---|---|---|
| "Updated locked spec X by editing the original ADR" | Violates immutability rule | Revert the ADR edit; write a new superseding ADR (P-4) |
| "Captured the change in spec Y but spec X (which references it) is unchanged" | P-3 violation | Update spec X in the same commit |
| "Saved canonical decision in vault `Dec_*.md` instead of repo ADR" | Wrong stack | Move to repo ADR; vault Dec is pointer only (P-7) |
| "Added a `project_*_locked.md` memory file with a perks table" | P-8 violation | Strip body; replace with pointer to ADR + spec |
| "Spec body has `was X / now Y` history" | Live-spec residue | Delete; history goes in ADR + CHANGELOG |
| "Decision lives in a Slack thread / Linear ticket" | External source-of-truth | Move to repo (P-3 component spec or new ADR) |
| "Created a 'v1.5' bucket for this" | Two-state policy violation | Either v1 active/backlog OR future-release in deferred.md |
| "Workbench changed but `last_updated` not bumped" | iOS-Sync risk | Bump `last_updated`; re-review iOS section; bump `ios_last_reviewed` |

The lint script catches most of these mechanically. The discipline catches the rest.

## 15. Adopting this in a new project

Order:

1. **Bootstrap folder structure** (§3) — create `docs/`, `docs/decisions/`, `tools/`, etc.
2. **Install lint-docs.js** + pre-commit hook
3. **Write rules.md + naming.md + tokens.md** as the cross-cutting foundation
4. **Per existing component:**
   - If never locked: status `draft`, no ADR
   - If genuinely locked: write the close-off audit + ADR; clean spec
5. **Set up vault structure** (`Frankie Config/` equivalent for the project)
6. **Configure Smart Connections** to exclude `_archive/` and `source-specs-superseded-*/`
7. **Write CLAUDE.md** referencing the methodology
8. **Update slash commands** (`/<project>_Design` + `/end-<project>-design`) per §8

`bootstrap-project` skill (if available) does most of this idempotently.

## 16. Living with the methodology

- Pre-commit hook runs on every commit; lint catches drift before it's pushed.
- Session-start hook surfaces ADR status + lint state; you see drift before starting work.
- Session-end protocol enforces the propagation rules (P-3) and CHANGELOG entries; you can't end a session with inconsistent state.
- The methodology is self-reinforcing: the more it's followed, the cheaper it becomes (specs read clean, agents trust them, drift doesn't hide).

If you find yourself fighting the methodology, the bug is usually in the discipline, not the rules. Common culprits:

- Skipping CHANGELOG on "small" edits — these accumulate into invisible drift
- Editing audit folders after they're frozen — every edit erodes their trace integrity
- Burying decisions in commit messages instead of ADRs — recoverable only by archeology
- Writing `project_*_locked.md` memory files with body content — they always go stale

When unsure, check the protocols (§7) and the canonical hierarchy (§12). When still unsure, ask before changing.
