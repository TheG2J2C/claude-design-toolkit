# Upstream Backlog

> Findings from real design-project sessions that should land in the toolkit when there's bandwidth. Each entry: source session, value, scope. Tick off as shipped.

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
