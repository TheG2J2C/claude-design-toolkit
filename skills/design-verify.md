# Design Verify Skill

After completing any UI change, run this verification before reporting "done" to the user.

## Post-Edit Verification

1. **SCREENSHOT** the full page using Puppeteer MCP. Capture the complete viewport, not just the changed area.

2. **CHECK against DOM_MAP.md** — Is the hierarchy documented in DOM_MAP.md still accurate?
   - Are all elements still in the containers shown in the map?
   - Have any z-index values changed?
   - Have any stacking contexts been created or destroyed?
   - Have any overflow boundaries changed?

3. **If iOS project: CHECK IOS_COMPAT.md** — Does the pattern you just implemented have a SwiftUI equivalent?
   - If you used a CSS pattern not listed in IOS_COMPAT.md, flag it as a potential translation risk.
   - If the pattern has no SwiftUI equivalent, warn the user immediately.

4. **UPDATE DOM_MAP.md** if any of the following changed:
   - DOM structure (elements added, removed, or moved between containers)
   - Position values (static/relative/absolute/fixed)
   - Z-index values
   - Overflow properties
   - New stacking contexts

5. **REPORT** to the user with this format:

```
Change complete:
- What changed: [plain English description]
- Visual result: [describe what it looks like now]
- DOM_MAP.md: [updated / no changes needed]
- iOS compatibility: [compatible / warning: no SwiftUI equivalent for X]
- Concerns: [none / list any issues]
```

## Verification Failures

If verification reveals a problem:

1. Do NOT report "done"
2. Describe the discrepancy to the user
3. Propose a fix or rollback
4. Wait for user direction
