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
