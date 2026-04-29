---
name: {{Human-Readable Name}}
slug: {{kebab-case-slug}}
status: in-progress  # locked | in-progress | deferred | spec-only
locked_date:         # YYYY-MM-DD when status went LOCKED
dom_anchor: "#{{elementId}} or .{{class}}"
workbench_file: workbench/{{file}}.html
mockup_file:         # optional, only if iterated separately
depends_on: []       # other component slugs this references
ios_components: []   # SwiftUI primitives — iOS-only projects
locked_values: []    # measurable values that may NOT change without override
---

# {{Component Name}}

One-paragraph purpose: what this component is, where it sits, when the user sees it.

## DOM Anchors

| Element | Selector | Note |
|---|---|---|
| Container | `#{{id}}` | |

## Visual Spec — Slots

> Slot-focused. Each row is a layout of named slots; this section locks each slot's position, formatting, alignment, and behaviour. Variants describe **which slots are populated and how**, not specific user content.

### Slot: {{Slot Name}}

| Property | Value |
|---|---|
| Position | |
| Size | |
| Style | |

(repeat per slot)

## Behaviour

State transitions, interactions, edge cases.

## iOS Implementation

```swift
// SwiftUI sketch — use token references, not raw hex/px
```

## Acceptance Criteria

> Pass/fail tests for px-perfect rebuild. The iOS engineer (or Claude with the built app) will check the implementation against these.

- [ ] Measurable test 1
- [ ] Measurable test 2

## Mock Data Reference (illustrative, not spec)

Optional — only if the component has placeholder content that's NOT part of the spec.

## History

- YYYY-MM-DD: Initial.
