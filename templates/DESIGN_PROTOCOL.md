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

### What Claude must NEVER do:

- Start coding before confirming understanding
- Make more than one structural change at a time
- Change positioning (top to bottom or vice versa) without checking container dimensions
- Move elements between containers without updating DOM_MAP.md
- Report "done" without self-verifying via screenshot
- Assume understanding -- always confirm
