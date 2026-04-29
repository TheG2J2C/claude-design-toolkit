# Design Verify Skill

After completing any UI change, run this verification before reporting "done" to the user.
This skill combines post-edit verification, measurement validation, iOS compatibility check, and DOM accuracy audit into a single mandatory gate.

## Post-Edit Verification

### 1. Screenshot and Measure

1. **SCREENSHOT** the full page using Puppeteer MCP. Capture the complete viewport, not just the changed area.
2. **MEASURE** all changed elements with `getBoundingClientRect()` via Puppeteer evaluate, relative to the phone container top. Record exact pixel numbers.
3. **COMPARE** measured values against target — never say "looks close", give exact pixel numbers and state whether each is correct or off (and by how much).

### 2. Visual Comparison (when a target exists)

If comparing against a reference screenshot or design target:

1. **pixelmatch** — run `node compare.js <target.png> <current.png> <diff.png>` for pixel-level diff
2. **Gemini CLI** — use `collaborating-with-gemini` skill to send BOTH images and ask for every visual difference. Do NOT declare "done" based on your own visual assessment alone.
3. **Report** every difference found, no matter how small

### 3. Check DOM Accuracy

**CHECK against DOM_MAP.md** — Is the hierarchy still accurate?
- Are all elements still in the containers shown in the map?
- Have any z-index values changed?
- Have any stacking contexts been created or destroyed?
- Have any overflow boundaries changed?
- Have any LOCKED values been accidentally moved?

### 4. Check iOS Compatibility

**CHECK IOS_COMPAT.md** (if it exists in the project):
- Does the pattern you just implemented have a SwiftUI equivalent?
- If you used a CSS pattern not listed in IOS_COMPAT.md, flag it as a potential translation risk.
- If the pattern has no SwiftUI equivalent, warn the user immediately and suggest an alternative.

### 5. Update Documentation

**UPDATE DOM_MAP.md** if any of the following changed:
- DOM structure (elements added, removed, or moved between containers)
- Position values (static/relative/absolute/fixed)
- Z-index values
- Overflow properties
- New stacking contexts

**UPDATE DESIGN_HANDOVER.md** following the slot-focused convention (see DESIGN_PROTOCOL "Slot-Focused Spec Convention"):
- Component sections describe slots first (position, alignment, formatting, behaviour) — not specific user content.
- Variant sections say which slots are populated and what content rule fills each.
- Mock data lives in a separate "Mock Data Reference" / "Illustrative" table at the end of the section.
- Worked examples reference slots, not literal strings.

### 5b. Mock Data Variability Check

If the spec describes a property as **variable** (e.g. "3-10 segments", "1-N children", "any of these states"), confirm the mock demonstrates the variability:

- **At least 2 different values** must appear in the mock.
- A single safe value (e.g. always 10 segments) is FAIL — it doesn't prove the variable behaviour renders correctly.
- If the mock doesn't demonstrate variability, add or change rows to cover ≥2 values BEFORE reporting "done".

### 6. Check Against Success Criteria

Go back to the success criteria stated in `design-edit` step 5. Check each one:

- For each criterion, state: **PASS** (with measurement) or **FAIL** (with actual vs expected)
- If ANY criterion fails, do NOT report "done" — loop back and fix
- If you changed anything NOT covered by the success criteria, explain why or revert it

### 7. Report

**REPORT** to the user with this format:

```
Change complete:
- What changed: [plain English description]
- Success criteria: [PASS/FAIL for each criterion stated in design-edit]
- Measurements: [key element positions in pixels — actual vs target]
- Surgical check: [only touched requested elements / WARNING: also changed X]
- DOM_MAP.md: [updated / no changes needed]
- iOS compatibility: [compatible / warning: no SwiftUI equivalent for X]
- Concerns: [none / list any issues]
```

## Verification Failures

If verification reveals a problem:

1. Do NOT report "done"
2. Describe the discrepancy to the user in plain English — what you expected vs what happened
3. Propose a fix or rollback — explain each option with pros/cons and effort level (see "Presenting Options" in design-edit skill)
4. Wait for user direction

## Suggesting Improvements

If during verification you notice something that could be improved (performance, structure, maintainability), present it clearly:
- What the improvement is, in plain English
- How long it would take
- What happens if you do it now vs later (e.g. "quick fix now" vs "you'd need to save this to memory and bring it up in a future session, which means it might get forgotten")
- Let the user decide — don't assume they want it done
