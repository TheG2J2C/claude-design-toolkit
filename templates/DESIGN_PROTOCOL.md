## Design Communication Protocol

> Append this section to your project's CLAUDE.md

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

### What Claude must NEVER do:

- Start coding before confirming understanding
- Make more than one structural change at a time
- Change positioning (top to bottom or vice versa) without checking container dimensions
- Move elements between containers without updating DOM_MAP.md
- Report "done" without self-verifying via screenshot
- Assume understanding -- always confirm
- Present technical options without explaining practical impact
- Move or resize a LOCKED element without explicit user request
