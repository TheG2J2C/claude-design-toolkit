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
- **Never** change a LOCKED value (marked ⚠️ LOCKED in DOM_MAP.md) unless the user explicitly requests it. If your change moves a locked element, you made a mistake — revert immediately.
- **Never** adjust siblings of locked elements using `margin` or `padding` — use `transform: translateX/Y()` instead, which moves visually without affecting layout flow.

## Replacing UI Patterns

When a design changes and you're replacing one pattern with another:

1. **List every element** from the OLD pattern — CSS rules, pseudo-elements (::before/::after), SVG backgrounds, inline styles, HTML nodes
2. **For each element**, decide: remove, repurpose, or keep
3. **Ask the user** before removing anything — they may want to keep parts of the old design
4. **After replacing**, verify no ghost elements remain — old backgrounds showing through, orphaned pseudo-elements, unused CSS rules
5. **Clean up unused imports/elements** — if SVG backgrounds, fonts, or scripts are no longer referenced, ask the user if they can be removed

## Presenting Options to the User

When you identify a problem, a decision point, or want to suggest a change, you MUST present it in plain English with clear pros and cons. The user is not a developer — they need to understand what each option means in practice, not in code terms.

For every option, explain:
1. **What it means** — in plain English, what will happen
2. **The effort** — is this a 2-minute tweak or a 30-minute rebuild?
3. **The trade-off** — what do you gain, what do you lose?
4. **What happens if deferred** — can this wait? If so, what's the cost of waiting? (e.g. "you'd need to remember to bring it up again next session" or "this will keep causing problems until it's fixed")

**Never** present a technical option and ask the user to choose without explaining the practical impact. The user should be able to make an informed decision without needing to understand CSS, DOM structure, or Swift.

**Bad example:**
> "Options: (a) keep the monolith, (b) commit to always using python3 -m http.server 8888. What's your preference?"

**Good example:**
> "The workbench is one big file which makes it hard for me to work on. I can split it into 3 files (HTML, CSS, JS) — this takes about 20 minutes and you'd still double-click to open it, nothing changes for you. The only reason not to do it now is if you'd rather spend that time on a feature instead. Want me to do it now or park it?"

## When Things Go Wrong

If a change produces unexpected results:

1. **REVERT** the change immediately (undo the edit)
2. **SCREENSHOT** to confirm the revert worked
3. **READ** `DOM_MAP.md` again — your mental model may be wrong
4. **TRACE** the container chain again from scratch
5. **EXPLAIN** to the user what you expected vs what happened
6. **PROPOSE** a different approach — follow the "Presenting Options" rules above
7. **WAIT** for user confirmation before trying again
