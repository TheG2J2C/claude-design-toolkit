## Design Communication Protocol

> Append this section to your project's CLAUDE.md

### Required Skills

Two mandatory skills must be invoked for every UI change (installed at `~/.claude/skills/`):

| When | Skill | What it does |
|------|-------|-------------|
| Before any UI change | `design-edit` | Product-design confirmation (repeat back, clarify, wait for OK), DOM trace, iOS compatibility check, screenshot + measure, one change at a time |
| After any UI change | `design-verify` | Screenshot + pixel measurement, visual comparison (pixelmatch + Gemini), DOM accuracy audit, iOS compat verification, DOM_MAP.md update, plain English report |

These skills replace any separate `@ios-developer` or `@product-design` skills — iOS compat and product-design confirmation are built into the edit/verify workflow.

### Before implementing ANY UI change:

1. **Repeat back** what you think the user wants in plain English -- no CSS/code terms
2. **Ask clarifying questions:**
   - Does this overlay block interaction below?
   - What happens at the edges/boundaries?
   - Should it animate? How fast? What easing?
   - What's the closest iOS-native pattern?
   - Can you name an app that does something similar?
3. **Wait for confirmation** before writing any code
4. **Reference the DOM_MAP** -- know what contains what before touching structure
5. **One change at a time** -- never combine structural moves with styling

### How the user can communicate design intent:

| Method | When | Example |
|--------|------|---------|
| Annotated screenshot | Position/layout issues | Circle the problem, draw arrows to where things should go |
| Reference app | Interaction behaviour | "Like the Apple Maps bottom sheet" |
| Before/after sketch | New features | Rough sketch of closed + open states |
| "It should feel like..." | Motion/quality | "Like pulling down a roller blind" |
| Name an iOS pattern | Standard UI | "I want a bottom sheet with snap points" |

### When presenting options or decisions:

- Explain every option in plain English -- no code terms
- For each option, state: what it means, how long it takes, what you gain/lose, and what happens if you defer it
- Never ask the user to choose between options they don't understand
- If deferring means the user has to remember to bring it up again later, say that explicitly -- things that aren't fixed now tend to get forgotten

### Locked Elements

When the user confirms a position, size, or spacing with words like "perfect", "lock it in", "done" — that value is **LOCKED**.

- Mark locked values with ⚠️ LOCKED in DOM_MAP.md and the design command
- **Never** change a locked value unless the user explicitly requests it
- If a change you make causes a locked element to move, **you made a mistake** — revert immediately
- To adjust elements near locked ones, use `transform` (translateX/Y) which moves visually without affecting layout. Never use `margin`/`padding` changes on siblings of locked elements.

### Import & Element Tracking

When replacing or redesigning a UI pattern:
- **List every element** from the old pattern (CSS rules, pseudo-elements, SVG backgrounds, HTML nodes)
- **Confirm each is removed or repurposed** — don't leave ghost elements behind
- **Ask the user** before deleting anything that might still be needed
- Old elements left behind create invisible bugs that are extremely hard to spot

### file:// Protocol — SVG Constraints

- `<object>` tags loading SVGs from file:// will have `contentDocument` = null (cross-origin). You CANNOT manipulate SVG layers via `<object>`. You must **inline the SVG directly** in the HTML if you need layer control.
- `fetch()` does not work from file:// — use HTML tags (`<img>`, `<script src>`, `<link>`) instead.
- When matching SVG rendering across pages (e.g. same character at same zoom on two different pages), the `viewBox` calculation must include the **same layers** — even hidden ones. Otherwise zoom levels won't match.

### clip-path and Borders

CSS `border` is clipped by `clip-path` — it won't follow the clipped shape. To create a border on a clipped element:
1. Outer element: background = border colour, clip-path = shape, padding = border width
2. Inner element: background = fill colour, clip-path = slightly smaller version of same shape
3. The padding gap between outer and inner creates the visible "border"

### DESIGN_HANDOVER.md — Optional Long-Form Spec

For projects that need a comprehensive design spec (beyond DOM_MAP/IOS_COMPAT), keep a `DESIGN_HANDOVER.md` at the project root. Numbered sections; each section is a self-contained design unit.

**For any new section that contradicts or replaces existing source specs (Figma docs, gameplay docs, vision docs, etc.), end the section with a "Superseded" table:**

```markdown
### 15.X Superseded Spec Sections

The following sections in source spec docs are now superseded by §15 of this handover.
Update or remove them when those docs are next revised:

| Doc | Section | What's superseded |
|-----|---------|-------------------|
| Spec/04-master-task-list.md | §2.2.1 (Training Catalogue) | Old skills → new skills |
| Spec/05-final-dev-spec.md | §2.1 Frankie model | Add: skill ownership, bone log |
| Spec/01-vision.md | Personality seed (line 440) | **Delete** — no longer in spec |
```

**Why:** Without this table, the handover silently contradicts the rest of the spec corpus. Future you (or a teammate) won't know which doc is authoritative. The Superseded table keeps a single source of truth without risking corruption to historical specs the user may want to revise on their own schedule.

**Don't auto-edit source specs.** Surface them as a deferred follow-up: "Want me to push these deltas into the source specs now, or leave them for a later pass?"

### What Claude must NEVER do:

- Start coding before confirming understanding
- Make more than one structural change at a time
- Change positioning (top to bottom or vice versa) without checking container dimensions
- Move elements between containers without updating DOM_MAP.md
- Report "done" without self-verifying via screenshot
- Assume understanding -- always confirm
- Present technical options without explaining practical impact
- Move or resize a LOCKED element without explicit user request
- **Invent mock data the user didn't supply** — if a row needs a label / value / unit and the user hasn't said what it is, ASK or use a literal placeholder (`XXXX`, `9999`). Never guess.
- **Patch a structural problem with a band-aid surface** — when you see a gap in a layout where the colour underneath shows through, FIRST ask what the underneath should be. If two same-colour surfaces have a gap and a third matching surface "fixes" it, you're probably hiding a structural problem (e.g. dead content beneath that should be removed). Surface the issue to the user before patching.

### Slot-Focused Spec Convention

When documenting any UI component (in DESIGN_HANDOVER.md, DOM_MAP.md, or anywhere else), describe **slots** that get filled — not the specific user content currently filling them.

**Wrong:**
> Drink water row has the title "Drink water", time tag "PM", and target "8 CUPS"

**Right:**
> The row has a Title slot (top-left, 14px / 600 / `#2C160E`, 22-char limit), a Time Tag slot (below title, 9px / 800 / `#A8A29E` uppercase — content is `AM`/`MID`/`PM` for daily habits, deadline date for Ongoing), and a Target slot (top-right, split into number column right-aligned at x=327 and code column left-aligned at x=330).

Specific mock values (`Drink water`, `8 CUPS`, `15.MAR`, etc.) live in a separate **Mock Data Reference** table at the end of the section, clearly marked as illustrative — they are example content that fills the slots, not part of the spec itself.

**Why:** Mock content gets replaced when the real create/edit flow is built. The slot structure (positions, alignment, formatting) is permanent. Documenting `Drink water` makes the spec brittle and confuses what's locked vs what's example data.

**How to apply:**
- For each component, list its slots first (one row per slot: name, position, alignment, formatting, behaviour rules).
- For each variant, say which slots are populated and what content rule fills each — not the literal user-facing string.
- Place mock data in a separate clearly-labelled "illustrative reference" table.
- Worked examples reference slots, not literal strings.

### Mock Data Variability

If a spec says a property is **variable** (e.g. "3-10 segments", "1-5 lines"), the mock must demonstrate **at least 2 different values** to prove the variability is real. Don't pick one safe number and move on.

**Why:** Single-value mocks hide whether the variable behaviour actually works. A 10-segment bar everywhere doesn't prove a 3-segment bar will render correctly.

### Deferred Features Need Full Restoration Spec

When the user drops a feature from current scope ("park it for next phase", "drop from v1"):

1. Don't just delete the code with a vague TODO.
2. Add a new section to DESIGN_HANDOVER.md titled `## NN. Deferred to Next Phase`.
3. For each deferred feature:
   - **What it was** — visual contract, behaviour, dimensions.
   - **The HTML / CSS / JS code that was removed** — copy-paste preserved verbatim.
   - **Why dropped** — the user's stated reason.
   - **What it superseded** — section numbers in the current spec where it was previously documented.
4. Update any spec sections that previously included the dropped feature so they reflect the post-removal state.

**Why:** Vague "TBD" notes lose information. Six months later the team has no idea what the dropped pattern looked like, why it was dropped, or how to restore it. Full preservation = cheap reinstatement when the next phase begins.

### Reusable Pattern Library

When a UI pattern is used more than once and lives across projects, extract it as a snippet in `claude-design-toolkit/templates/snippets/`. Current snippets:

- **`phone-rulers.html`** — visible px rulers along the left and bottom of a phone container. Communication shorthand: `x200/y150` for absolute coords, `+5y` / `-3x` for deltas. **Should be a standard starting point for every design project.**
- **`swipe-row.html`** — Apple-Reminders-style swipe-to-reveal-actions per row. Drag left/right reveals action buttons; tap-to-fire; tap-outside dismisses. iOS equivalent: `.swipeActions(edge:)`.

Notable patterns documented in code comments:
- **Pin/active state knockout** — solid filled circle (state colour) + same-colour stroke icon "knocks out" against the row background. Clean inactive→active transition.
- **Behaviour-on-init JS-wrap** — for behaviours like swipe gestures that need a wrapper around each row, inject the wrapper via JS at init rather than hand-coding it in HTML. Keeps mock HTML clean and avoids per-row updates.

When introducing a new reusable pattern, add it to `templates/snippets/` and reference it here.
