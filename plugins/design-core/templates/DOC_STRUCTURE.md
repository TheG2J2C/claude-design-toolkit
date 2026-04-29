# Design Doc Structure — Atomic Components + Tokens + Index

> Pattern adopted in Frankie 2026-04-29 after the monolithic `DESIGN_HANDOVER.md` hit 125 KB / 25 sections / 2,500 lines. Mixed concerns (tokens / components / game logic / references / meta), duplicates with DOM_MAP / IOS_COMPAT / README, brittle `§22.4`-style cross-refs.
>
> Inspired by Google Labs' [DESIGN.md](https://github.com/google-labs-code/design.md) project (markdown + YAML frontmatter for human + AI consumption) and the [W3C Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) (machine-readable JSON tokens, vendor-neutral).

---

## Why split

A single big design spec has three failure modes:

1. **Token cost.** Reading 100 KB+ to find any value is wasteful. Loading the whole spec costs context budget on every session.
2. **Drift.** Sections duplicate content from DOM_MAP / IOS_COMPAT / README / commands. Update one, the others rot.
3. **Cross-ref fragility.** `§22.4` cross-references break the moment anything renumbers.

Splitting fixes all three:
- Read INDEX (~3 KB) + ONE component file (~10–30 KB) per session
- Each file has a single home for each fact
- Cross-refs by stable file slug (`components/owners-card.md`)

---

## Structure

```
project-root/
├── DESIGN_HANDOVER.md            ← INDEX (~150 lines, status table per component)
├── DOM_MAP.md                    ← + absorbed CSS class/ID/JS-var index
├── IOS_COMPAT.md                 ← + absorbed CSS quirk reference (iOS targets only)
├── README.md                     ← + absorbed files reference
│
└── docs/
    ├── tokens.md                 ← Single source for colours, type, spacing, shadows, z-index
    ├── tokens.json               ← Machine-readable mirror (W3C Design Tokens 2025.10)
    ├── naming.md                 ← System-prefix code convention
    ├── rules.md                  ← Universal rules (supersede component specs)
    ├── deferred.md               ← Restoration spec for prototyped-then-dropped features
    ├── components/               ← One file per UI component
    │   ├── <slug>.md
    │   └── ...
    ├── source-specs/             ← Original design briefs / vision (unchanged)
    └── _archive/                 ← Old monolithic spec snapshot, historical doc versions
```

---

## Component file template

Every `docs/components/<slug>.md` follows this template:

```markdown
---
name: Human-readable name
slug: kebab-case-slug
status: locked | in-progress | deferred | spec-only
locked_date: YYYY-MM-DD          # when status went LOCKED
dom_anchor: "#elementId or .class"
workbench_file: workbench/<file>.html
mockup_file: workbench/<mockup>.html  # optional
depends_on: [other-slugs]              # other component files this references
ios_components: [SwiftUI primitives]   # iOS-only projects
locked_values:                          # measurable values that may NOT change without override
  - row_width: 358
  - padding: "17.5 12"
---

# Component Name

One-paragraph purpose statement.

## DOM Anchors
| Element | Selector | Note |

## Visual Spec — Slots
Slot-focused: position / alignment / format / behaviour per named slot. Mock data goes in a separate "Mock Data Reference" section at the end, clearly labelled illustrative.

## Behaviour
Interactions, state transitions.

## iOS Implementation
SwiftUI sketch with token references — `Color("category.body")` rather than `#C49A3D`.

## Acceptance Criteria          ← KEY — pass/fail tests for px-perfect rebuild
- [ ] Measurable thing 1
- [ ] Measurable thing 2

## Mock Data Reference (illustrative, not spec)
Optional — only if the component has placeholder content.

## History
- YYYY-MM-DD: change.
```

---

## Tokens — W3C Design Tokens Format (machine-readable)

`docs/tokens.json` follows the [W3C Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/). Key conventions:

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "category": {
      "body": { "$value": "#C49A3D", "$type": "color", "$description": "..." }
    }
  }
}
```

- `$value` / `$type` / `$description` are reserved
- Token references use `{path.to.token}` syntax
- Style Dictionary or Tokens Studio can read this format and generate Swift/Kotlin/CSS code

Maintain a parallel human-readable `docs/tokens.md` with the same data + rationale + usage notes.

---

## Acceptance Criteria — the secret weapon

Every component file ends with `## Acceptance Criteria` — a checklist of measurable, pixel-perfect tests.

```markdown
## Acceptance Criteria
- [ ] Row width = 358 px exactly
- [ ] Checkbox border colour matches category (body=#C49A3D, mind=#3D8B8B, routine=#7B6E9E)
- [ ] Status bar centred at phone x=195, width 150 px
- [ ] Swipe right reveals Pin (auto-detects PINNED section)
```

Why this matters:
- **Hand to another Claude:** they can recreate the spec mechanically, not interpretively
- **Hand to the iOS engineer (or Claude with the built iOS app):** every checkbox is a test that passes or fails
- **Mechanical drift detection:** a script can compare workbench DOM against criteria and flag deltas

This is the single biggest improvement over a freeform spec. Add it to every component file from day one.

---

## What goes where

| Concern | File |
|---|---|
| A specific colour / size / shadow value | `docs/tokens.md` (+ tokens.json) |
| A naming-convention rule (CSS prefix, Swift symbol pattern) | `docs/naming.md` |
| A universal rule that applies everywhere | `docs/rules.md` |
| The DOM hierarchy / z-stack / overflow boundaries | `DOM_MAP.md` |
| A CSS pattern's SwiftUI equivalent | `IOS_COMPAT.md` |
| A folder-structure or restore-procedure note | `README.md` |
| A specific component's visual layout | `docs/components/<slug>.md` Visual Spec section |
| A specific component's behaviour / state transitions | Same file, Behaviour section |
| Acceptance criteria for px-perfect rebuild | Same file, Acceptance Criteria section |
| Game / domain logic (training loop, mood calc) | `docs/components/<domain>.md` |
| Removed-but-restorable code | `docs/deferred.md` |
| The original vision / brief docs | `docs/source-specs/` (unchanged) |
| Historical snapshots of moved/superseded content | `docs/_archive/` |

---

## Read order (for new sessions)

1. README.md (folder map)
2. DESIGN_HANDOVER.md (status index — never the whole spec)
3. docs/rules.md (universal rules)
4. docs/tokens.md (only when colours/sizes are involved)
5. DOM_MAP.md (when structural change)
6. IOS_COMPAT.md (when iOS translation matters)
7. **ONLY** the relevant `docs/components/<slug>.md` — do NOT bulk-load all component files

---

## Migration from a monolithic spec

| Step | What | Effort |
|---|---|---|
| 0 | Backup the existing spec (tar/zip) | 1 min |
| 1 | Extract tokens (colours, type, sizes, shadows) → `tokens.md` + `tokens.json` | 30 min |
| 2 | Extract naming convention → `naming.md` | 15 min |
| 3 | Extract universal rules → `rules.md` | 15 min |
| 4 | One component at a time → `docs/components/<slug>.md` | 15-45 min each |
| 5 | Merge superseded sections into the component's History block | inline with #4 |
| 6 | Move §HTML-Map / §iOS-Notes / §Files into DOM_MAP / IOS_COMPAT / README | 30 min |
| 7 | Replace original spec with thin INDEX (~150 lines) | 30 min |
| 8 | Update slash commands + memory references | 30 min |
| 9 | Add Acceptance Criteria block to each component file (start with stubs, fill over future sessions) | 1-3 hrs |

Total: half a day's focused work for a 16-component project.

---

## Sources

- [Google Labs — DESIGN.md spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) — markdown + YAML frontmatter design system spec for human + AI
- [W3C Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) — stable JSON token format, vendor-neutral
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/) — context on the W3C effort
- [UXPin — Design System Documentation in 9 Easy Steps](https://www.uxpin.com/studio/blog/design-system-documentation-guide/)
- [LogRocket — Tips for design system documentation you'll actually use](https://blog.logrocket.com/ux-design/design-system-documentation/)
- [Pixel Point — Handoffs Guide for Pixel Perfect Design](https://medium.com/pixelpoint/handoffs-guide-for-pixel-perfect-design-part-i-8bbd95d8ffcd) — acceptance-criteria pattern
