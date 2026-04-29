# Design Project — Folder Structure & Naming Convention

A clean, scalable layout for any HTML/CSS design workbench project. Adopted in the Frankie project on 2026-04-29 after the root flattened to ~30 files and made things hard to find.

---

## Principles

1. **A new contributor (or future Claude) should be able to find anything in under 30 seconds.**
2. **Live files at the top of their folder, history below.** Per-folder `_archive/` keeps history co-located with the live versions it relates to.
3. **`_archive/` underscore prefix** so it sorts to the top of the folder and is visually distinct from live files.
4. **The 3-4 most-touched docs (DESIGN_HANDOVER.md, DOM_MAP.md, IOS_COMPAT.md, README.md) stay at root** — they're touched every session and don't deserve a `cd`.
5. **No mixing of file types at root.** Root is for canonical docs only. PDFs/PNGs/HTMLs/SVGs go into typed folders.
6. **Naming is `lowercase-with-hyphens`** for files and folders. CSS class / SVG label naming is unrelated and uses whatever the project established.

---

## Recommended layout

```
.
├── README.md                       ← Folder map + restore-from-archive procedure (REQUIRED)
├── DESIGN_HANDOVER.md              ← INDEX of component specs (~150 lines, NOT a monolith — see DOC_STRUCTURE.md)
├── DOM_MAP.md                      ← Structural truth + CSS class/ID/JS-var indexes
├── IOS_COMPAT.md                   ← iOS / SwiftUI translation reference (optional, for iOS targets)
│
├── workbench/                      ← Live HTML files (double-click to open)
│   ├── <main>.html
│   ├── <feature>.html              ← One file per major screen / mockup
│   ├── _components/                ← Sub-mockups for individual components
│   └── _archive/
│       ├── checkpoints/            ← Last-known-good snapshots, date-stamped
│       └── rollbacks/              ← Pre-major-change snapshots
│
├── assets/                         ← Static dependencies referenced by workbench
│   ├── layout/
│   │   ├── <name>.svg              ← LIVE, modified versions
│   │   ├── <name>-source.svg       ← Original exports, untouched
│   │   └── _archive/
│   ├── rig/                        ← Animation / character rigs (if applicable)
│   │   ├── <rig>.svg
│   │   └── _archive/
│   ├── palette/
│   │   ├── full-palette.png
│   │   └── ...
│   └── shapes/                     ← Reusable shape references
│
├── docs/                           ← Atomic design specs — see DOC_STRUCTURE.md
│   ├── tokens.md / tokens.json    ← W3C Design Tokens 2025.10 — colours, type, sizes, shadows, z-index
│   ├── naming.md                   ← System-prefix code convention
│   ├── rules.md                    ← Universal rules (supersede component specs)
│   ├── deferred.md                 ← Restoration spec for prototyped-then-dropped features
│   ├── components/                 ← One file per UI component (template at templates/component-template.md)
│   │   └── <slug>.md
│   ├── source-specs/               ← Source design documents (vision, brief, etc.)
│   └── _archive/                   ← Historical doc snapshots
│
├── tools/                          ← CLI helpers + JS deps
│   ├── compare.js                  ← e.g. pixelmatch
│   ├── package.json
│   └── node_modules/
│
├── .claude/                        ← Project Claude config (commands, hooks, settings)
│
└── _archive/                       ← Cross-folder historicals
    ├── docs/                       ← Snapshots of moved/superseded docs
    ├── reference-pdfs/             ← Early-phase PDFs
    ├── reference-images/           ← Older target/reference images
    └── gemini-runs/                ← Burst comparison-image sessions, by topic+date
```

Adapt to project specifics. The `assets/rig/` folder only exists for projects with animation/character rigs; the `IOS_COMPAT.md` only for iOS targets; etc.

---

## Naming convention

| Layer | Convention | Example |
|---|---|---|
| Folders | `lowercase-with-hyphens` | `assets/layout/` |
| Active files | `lowercase-with-hyphens.ext` | `homepage.html`, `pill-cloud.svg` |
| Checkpoints | `<file>_YYYY-MM-DD.<ext>` | `homepage_2026-04-29.html` |
| Pre-change rollbacks | `<file>_pre-<change>_YYYY-MM-DD.<ext>` | `pulldown_pre-bodyswap_2026-04-28.html` |
| Iteration runs | `YYYY-MM-DD_<topic>/` | `2026-04-26_owners-card-iteration/` |
| `_archive/` folders | Underscore prefix | Sorts to top of folder |
| CSS classes / SVG labels | UNCHANGED — project's existing system-prefix shorthand | Project-specific |

---

## file:// constraint

If the workbench must open by double-clicking (no local server required), keep these in mind:

- **Relative `<img src>` and `<link href>` work fine** from file://.
- **JavaScript `fetch()` does NOT work** from file:// — use `<img>`, inline SVG, or `<script src>` instead.
- **Inline complex SVGs** (Frankie rig, etc.) directly in the HTML rather than loading them, so they have no external dependencies.
- **Reference layout SVGs as `<img>`** with relative paths like `<img src="../assets/layout/homepage.svg">`.

---

## Restoring from archive

The README **must** document this. Pattern:

> To restore an archived workbench HTML:
> 1. `cp workbench/_archive/checkpoints/<file>_<date>.html workbench/<file>.html`
> 2. **Verify the asset paths** — checkpoint files were saved with whatever path was active at the time. Pre-restructure checkpoints may use bare filenames (`layout.svg` instead of `../assets/layout/homepage.svg`). Fix before opening.

---

## When to apply this structure

- **Starting a new design project** — adopt the structure from day one. Empty `_archive/` folders are fine.
- **Restructuring a flat project** — when root has more than ~10 files mixed across types, restructure. Backup first (`tar czf <project>.before-restructure_<date>.tar.gz <project>/`), update path references in HTML/MD/commands/memory, smoke test after.
- **Audit at every session start** — the project's `Frankie_Design`-style command should include an "Audit Folder" step that surfaces out-of-place items and asks the user where they should live.

See `templates/project-design-command.md` Step 3 for the audit step.
