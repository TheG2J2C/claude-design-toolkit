# Design Edit Skill

Before making any UI/layout/CSS change, follow this workflow exactly. Do not skip steps.
This skill combines pre-edit checks, iOS compatibility review, and product-design confirmation into a single mandatory gate.

## Pre-Edit Checklist

### 1. Understand the Request (Product Design)

Before touching any code, confirm you understand what the user actually wants:

1. **REPEAT BACK** what the user wants in plain English — no CSS/code terms. Describe what it will look like and how it will behave.
2. **ASK clarifying questions** — don't assume:
   - Does this overlay block interaction below?
   - What happens at the edges/boundaries?
   - Should it animate? How fast? What easing?
   - What's the closest iOS-native pattern? Can you name an app that does something similar?
   - Is this a new element, a change to an existing one, or a replacement?
3. **WAIT for confirmation.** Do not proceed without it.

**For system-level changes** (new mechanics, currency loops, state machines, multi-screen features) expect **3+ confirmation rounds**, not 1–2. Each round asks ONE focused question — don't bundle. Examples that triggered multi-round confirmation in real sessions:
- "What happens to the existing thing this replaces?" (round 1)
- "Does the new thing interact with X — independent or linked?" (round 2)
- "What's the win condition — auto or player-triggered?" (round 3)
- "What asset budget does this imply?" (round 4)
Don't summarise prematurely — until each round resolves cleanly, you're still gathering, not designing.

### 1b. Spec Reconciliation (for major mechanic changes only)

If the user is introducing a change that contradicts existing specs (e.g. new gameplay loop, new currency, new state model):

1. **Don't write the new spec yet.** First, find what the new design conflicts with.
2. **Delegate a spec review** — use an Explore subagent to read source spec docs and surface conflicting sections (file path + heading). Provide the new design as context.
3. **Surface conflicts as a numbered question list** — for each conflict, give the user the choice (replace / coexist / something different).
4. **Get explicit answers** before writing.
5. **Write the new design into a HANDOVER doc as a new numbered section** (e.g. `DESIGN_HANDOVER.md` §15), not into source specs. End the section with a "Superseded" table naming exact files + sections that are replaced. Don't auto-edit source specs — surface that as a deferred follow-up.

This pattern keeps a single source of truth without corrupting historical specs the user may want to revise on their own schedule.

### 2. Trace the DOM

1. **READ** the project's `DOM_MAP.md`
2. **IDENTIFY** the element being changed and trace its full container chain (element -> parent -> grandparent -> root)
3. **CHECK**: Does any ancestor have `overflow: hidden`? If yes, name it and note what will be clipped.
4. **CHECK**: Does any ancestor create a stacking context (via `position` + `z-index`, `opacity < 1`, `transform`, `filter`, `will-change`)? If yes, note the impact on z-index ordering.
5. **CHECK**: If changing `position` or `z-index`, list all siblings at the same stacking level and their current z-index values.

### 3. Check iOS Compatibility

Before implementing any interaction or layout pattern:

1. **READ** `IOS_COMPAT.md` (if it exists in the project)
2. **IDENTIFY** the SwiftUI equivalent for the pattern you're about to build:
   - Positioning → GeometryReader / .offset / .position
   - Drag interactions → DragGesture + .offset
   - Pull-down / bottom sheet → .presentationDetents
   - Side drawer → .offset + DragGesture
   - Overflow clipping → .clipped() / .clipShape()
   - Z-ordering → .zIndex()
   - Animations → withAnimation / .animation
3. **FLAG** if no SwiftUI equivalent exists — warn the user before proceeding. Suggest an alternative pattern that translates.
4. **SKIP** this step for pure visual changes (colours, fonts, shadows) that always translate cleanly.

### 4. Screenshot and Measure

1. **SCREENSHOT** the current state using Puppeteer MCP — navigate to the file:// URL and capture.
2. **MEASURE** element positions with `getBoundingClientRect()` via Puppeteer evaluate, relative to the phone container top. Record exact pixel numbers.

### 5. State Verifiable Success Criteria

Before writing any code, state the exact success criteria for this change. These must be objectively verifiable — not "looks right" or "matches design."

**Good criteria:**
- "Button moves from top:80px to top:60px. Nothing else moves."
- "Ring label text changes from '#C8C8C8' to '#A4000E'. Ring position unchanged."
- "New element appears at left:14px, top:15px, font-size:11px."

**Bad criteria:**
- "Looks better"
- "Matches the design"
- "Button is in the right place"

Write these criteria down. You will check each one in `design-verify`.

### 6. Make the Change (Surgical)

1. **Make ONE change only.** One structural change OR one styling change. Never both.
2. **Touch ONLY what you must** to achieve the stated goal. Do not:
   - "Improve" adjacent code, comments, or formatting
   - Refactor things that aren't broken
   - Add features, error handling, or abstractions not requested
   - Change existing style/naming conventions to your preference
3. **Every changed line must trace directly to the user's request.** If you can't explain why a line changed in terms of the user's request, revert it.
4. **For repeated UI inside a fixed-height container** — calculate the space-fit math BEFORE writing CSS. Formula:
   `instances × instance_height + (instances − 1) × gap + container_padding ≤ container_height`
   If the math says it overflows, surface to the user with options BEFORE coding (e.g. "10 of these at 56px tall would overflow by 100px — want me to A) shrink to 44px, B) add internal scroll, or C) accept page scroll?"). Don't code first and discover the overflow afterwards.
5. **SCREENSHOT** the new state using Puppeteer MCP.
6. **MEASURE** again — compare numbers against target. Never say "looks close."
7. **COMPARE**: Describe what actually changed vs what you expected. If anything unexpected occurred, REVERT immediately and investigate before proceeding.

## Hard Rules

These rules are non-negotiable. Violating any of them requires stopping and reassessing.

- **Never** change `top` to `bottom` or `left` to `right` (or vice versa) without first checking the container's dimensions and how the element is currently positioned. These are fundamentally different reference points.
- **Never** move elements between DOM containers without updating `DOM_MAP.md` in the same edit session.
- **Never** add `overflow: hidden` to any element without first listing every child that will be clipped and confirming with the user that clipping is acceptable.
- **Never** change `z-index` without checking all siblings at the same stacking level and confirming the new ordering is correct.
- **Never** combine repositioning with restyling. One structural change at a time.
- **Never** change `position` values (static/relative/absolute/fixed) without understanding the full impact on the element's children and siblings.
- **Never** change a LOCKED value (marked with LOCKED in DOM_MAP.md) unless the user explicitly requests it. If your change moves a locked element, you made a mistake — revert immediately.
- **Never** adjust siblings of locked elements using `margin` or `padding` — use `transform: translateX/Y()` instead, which moves visually without affecting layout flow.
- **Never present colours as hex codes alone.** Humans can't read hex. When proposing colour options or showing a palette, render visual swatches in the mockup file (or generate a quick swatch HTML and screenshot it). A hex table without colour blocks is unreadable feedback.
- **Never invent mock data the user didn't supply.** If a row/cell needs a label, value, unit, day, schedule, etc. that the user hasn't specified, ASK or use a literal placeholder (`XXXX`, `9999`, `DD.MMM`). Do NOT make up filler ("FRI", "WED", "Yoga", "$3000") — invented mock data silently changes the spec and gets baked in as if it were intentional.
- **Never patch a structural problem with a band-aid surface.** When you see a gap in a layout where the colour underneath shows through, ask what the underneath should be FIRST. If two same-colour surfaces have a gap and a third matching surface "fixes" it, you're probably hiding a structural problem (e.g. dead content beneath that should be removed). Surface the diagnosis to the user before patching.
- **Slot-first thinking when documenting components.** When updating DOM_MAP or DESIGN_HANDOVER, describe SLOTS (position, alignment, formatting, behaviour) — not specific user content. Mock content goes in a separate "illustrative reference" table. See DESIGN_PROTOCOL "Slot-Focused Spec Convention".

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
