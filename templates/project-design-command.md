Resume the {{PROJECT_NAME}} Design workbench. Complete each step before moving to the next.

## 1. Load Context
- Read ALL memory files listed in MEMORY.md
- Read the DOM_MAP.md in the project folder
- Read the IOS_COMPAT.md if it exists
- Read the DESIGN_HANDOVER.md if it exists

## 2. Verify Workbench Files
Confirm the key project files exist. If any are missing, flag immediately.

## 3. Verify Tools
- Check Puppeteer MCP is connected (try a test screenshot)
- Check any other required MCPs

## 4. Current State
Present a brief summary of:
- What's working
- What's in progress
- What's next

## 5. Rules (always follow)
1. **Confirm understanding** before coding -- repeat back in plain English
2. **Check DOM_MAP.md** before any structural change
3. **Screenshot before and after** every change (Puppeteer MCP) — unless user is giving rapid instructions, then batch at pauses
4. **One change at a time** -- never combine structural and styling changes
5. **Check IOS_COMPAT.md** -- don't use patterns that won't translate
6. **Update DOM_MAP.md** after any structural DOM change
7. **Respect LOCKED values** (⚠️ LOCKED in DOM_MAP) -- never change unless user explicitly requests. If your change moves a locked element, revert immediately. Use `transform` to adjust nearby elements.
8. **Track imports and elements** -- when replacing a UI pattern, list every element from the old pattern and confirm each is removed or repurposed. Don't leave ghost elements behind.
9. **Clean up unused elements** -- if old backgrounds, pseudo-elements, or imports are no longer needed, ask the user before removing

## 6. Toolkit Sync Check
At natural breakpoints (end of feature, checkpoint, or ~2 hours of work), review:
- New rules, skills, or workflow patterns discovered in this project
- Improvements to DOM_MAP notation, iOS compat findings, or communication techniques
- Mistakes made and lessons learned that should become universal rules
Suggest upstreaming anything universal to the claude-design-toolkit repo (~/projects/claude-design-toolkit). Ask user before pushing.

## 7. Ready
- Present status
- Ask what the user wants to work on
