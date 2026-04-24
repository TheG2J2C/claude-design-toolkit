# Design Edit Skill

Before making any UI/layout/CSS change, follow this workflow exactly. Do not skip steps.

## Pre-Edit Checklist

1. **READ** the project's `DOM_MAP.md`
2. **IDENTIFY** the element being changed and trace its full container chain (element -> parent -> grandparent -> root)
3. **CHECK**: Does any ancestor have `overflow: hidden`? If yes, name it and note what will be clipped.
4. **CHECK**: Does any ancestor create a stacking context (via `position` + `z-index`, `opacity < 1`, `transform`, `filter`, `will-change`)? If yes, note the impact on z-index ordering.
5. **CHECK**: If changing `position` or `z-index`, list all siblings at the same stacking level and their current z-index values.
6. **SCREENSHOT** the current state using Puppeteer MCP — navigate to the file:// URL and capture.
7. **DESCRIBE** to the user in plain English what you plan to change and what you expect to happen. No CSS/code terms — describe visually.
8. **WAIT** for user confirmation. Do not proceed without it.
9. **Make ONE change only.** One structural change OR one styling change. Never both.
10. **SCREENSHOT** the new state using Puppeteer MCP.
11. **COMPARE**: Describe what actually changed vs what you expected. If anything unexpected occurred, REVERT immediately and investigate before proceeding.

## Hard Rules

These rules are non-negotiable. Violating any of them requires stopping and reassessing.

- **Never** change `top` to `bottom` or `left` to `right` (or vice versa) without first checking the container's dimensions and how the element is currently positioned. These are fundamentally different reference points.
- **Never** move elements between DOM containers without updating `DOM_MAP.md` in the same edit session.
- **Never** add `overflow: hidden` to any element without first listing every child that will be clipped and confirming with the user that clipping is acceptable.
- **Never** change `z-index` without checking all siblings at the same stacking level and confirming the new ordering is correct.
- **Never** combine repositioning with restyling. One structural change at a time.
- **Never** change `position` values (static/relative/absolute/fixed) without understanding the full impact on the element's children and siblings.

## When Things Go Wrong

If a change produces unexpected results:

1. **REVERT** the change immediately (undo the edit)
2. **SCREENSHOT** to confirm the revert worked
3. **READ** `DOM_MAP.md` again — your mental model may be wrong
4. **TRACE** the container chain again from scratch
5. **EXPLAIN** to the user what you expected vs what happened
6. **PROPOSE** a different approach
7. **WAIT** for user confirmation before trying again
