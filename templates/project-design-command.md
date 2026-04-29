Resume the {{PROJECT_NAME}} Design workbench. Complete each step before moving to the next.

## 1. Load Context (LAZY — load only what's needed)

**Always load (small, ~15 KB total):**
- `README.md` — folder map
- `DESIGN_HANDOVER.md` — INDEX of component specs (NOT a monolith — see `DOC_STRUCTURE.md`)
- `docs/rules.md` — universal rules
- `MEMORY.md` index ONLY (do NOT bulk-load all memory files)

**Load when needed (per task):**
- `docs/tokens.md` — when colour / size / shadow / z-index values are involved
- `DOM_MAP.md` — when structural change is involved
- `IOS_COMPAT.md` — when iOS translation matters
- `docs/components/<slug>.md` — ONLY the file for the component the user wants to work on (and its `depends_on`)
- Memory files — lazy-load by topic, not bulk

**Do NOT load:**
- All component files (16+ at once)
- Old monolithic spec snapshots in `docs/_archive/`

## 2. Verify Workbench Files
Confirm the key project files exist. If any are missing, flag immediately.

## 3. Audit Folder (housekeeping)
- `ls -la` the project root, every subfolder, and `_archive/`
- Compare against the README map. Anything that does NOT fit one of these categories is "out of place":
  - Live files in their owning folders (workbench/, assets/, docs/, tools/, .claude/, root-level canonical docs, README, .mcp.json — adapt to the project's actual layout)
  - Per-folder `_archive/` (e.g. workbench/_archive/, assets/<x>/_archive/)
  - Top-level `_archive/` (cross-cutting historicals)
- Treat as out of place: stray files at root, unprefixed `*_checkpoint.*` or `*_pre-*.*` files, `.DS_Store` files, files in folders they don't belong to (e.g. PNGs at root, HTMLs in assets/, PDFs in workbench/), files older than 14 days in active folders that aren't referenced anywhere.
- For each out-of-place item: state it briefly, propose where it should live (or whether to archive/delete), wait for user confirmation. Do NOT auto-move.
- If everything looks tidy, say so in one line and continue.

## 4. Verify Tools
- Check Puppeteer MCP is connected (try a test screenshot)
- Check any other required MCPs

## 5. Current State
Present a brief summary of:
- What's working
- What's in progress
- What's next

## 6. Rules (always follow)
1. **Confirm understanding** before coding -- repeat back in plain English
2. **Check DOM_MAP.md** before any structural change
3. **Screenshot before and after** every change (Puppeteer MCP) — unless user is giving rapid instructions, then batch at pauses
4. **One change at a time** -- never combine structural and styling changes
5. **Check IOS_COMPAT.md** -- don't use patterns that won't translate
6. **Update DOM_MAP.md** after any structural DOM change
7. **Respect LOCKED values** (⚠️ LOCKED in DOM_MAP) -- never change unless user explicitly requests. If your change moves a locked element, revert immediately. Use `transform` to adjust nearby elements.
8. **Track imports and elements** -- when replacing a UI pattern, list every element from the old pattern and confirm each is removed or repurposed. Don't leave ghost elements behind.
9. **Clean up unused elements** -- if old backgrounds, pseudo-elements, or imports are no longer needed, ask the user before removing
10. **Slot-focused docs** — when documenting components, describe SLOTS (position/alignment/formatting/behaviour) — not specific user content. Mock data lives in a separate "Mock Data Reference" table clearly marked illustrative.
11. **Never invent mock data** the user didn't supply — use placeholders (`XXXX`, `9999`, `DD.MMM`) or ask. Made-up filler silently changes the spec.
12. **Reference rulers** — if the workbench has visible px rulers (see `templates/snippets/phone-rulers.html`), use the shorthand: `x200/y150` for absolute coords, `+5y` / `-3x` for deltas.
13. **Mock data variability** — if a spec property is variable (e.g. "3-10 segments"), the mock must show ≥2 different values to demonstrate.
14. **Deferred features need full restoration spec** — when dropping something for now, preserve the HTML/CSS/JS verbatim in a "Deferred to Next Phase" section, not a vague TODO.

## 7. Toolkit Sync Check
At natural breakpoints (end of feature, checkpoint, or ~2 hours of work), review:
- New rules, skills, or workflow patterns discovered in this project
- Improvements to DOM_MAP notation, iOS compat findings, or communication techniques
- Mistakes made and lessons learned that should become universal rules
Suggest upstreaming anything universal to the claude-design-toolkit repo (~/projects/claude-design-toolkit). Ask user before pushing.

## 8. Ready
- Present status
- Ask what the user wants to work on
