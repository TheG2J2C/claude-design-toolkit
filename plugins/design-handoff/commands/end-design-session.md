End the design session. Be precise — drift checks, mechanical updates, lint enforcement, no vague summaries.

> Generic 14-step protocol from the doc-overhaul methodology. Adapt the slash command name (`/end-<project>-design`) and any project-specific paths per project.

## 1. Checkpoint workbench (parallel subagents)

Spawn parallel subagents for each file that may have changed:

> Diff `workbench/<artifact>.html` against the most recent `workbench/_archive/checkpoints/<artifact>_*.html` (sort by date desc). If the diff is non-trivial (>10 changed lines or any structural change), copy the current file to `workbench/_archive/checkpoints/<artifact>_$(date +%Y-%m-%d).html`. Report: `CHECKPOINTED` or `NO MEANINGFUL CHANGE`.

Same in parallel for any layout SVGs, mockup HTMLs, or other workbench artifacts.

## 2. Drift check per touched component (parallel)

For each component file touched this session, spawn the `drift-checker` subagent:

> Subagent type: `drift-checker`
> Prompt: "Check `<slug>`. Workbench: `workbench/<artifact>.html`."

Synthesise findings — surface deltas as one of:
- **Spec-side drift** (workbench is right, doc is wrong) → propose updating the spec
- **Implementation-side drift** (doc is right, workbench is wrong) → propose updating the workbench
- **Both sides agree** (no action)

Wait for user judgement on each delta. Do not auto-resolve.

## 3. Update Acceptance Criteria mechanically

For each component file touched, ask:
- Did any value listed in `locked_values` change? Update frontmatter.
- Did any new acceptance criterion become testable? Add it under VISUAL or INTEGRATION (per the Component Spec Completeness governance rule).

Be specific. No vague "updated criteria" — list each one.

## 4. Decision register update

For each spec that **graduated to `status: locked`** this session:
- Run gap-analysis Q&A if not already done
- Draft a new ADR at `docs/decisions/ADR-NNNN-<slug>.md` (next available number; MADR format — see `templates/ADR-template.md`)
- Get user accept → flip ADR `status: proposed` → `accepted`, set `accepted_date`
- Update spec frontmatter: `status: locked`, `locked_by: ADR-NNNN`, bump `last_updated`, set `ios_last_reviewed`
- Add row to `docs/decisions/README.md` index table
- Add row to vault `Idx_Decisions.md` (pointer to the ADR)

For each **cross-spec ripple** (a decision in spec X changes a value in spec Y):
- Update spec Y immediately, in the same commit (Protocol P-3)
- If Y is locked, write a new superseding ADR for Y; old ADR's status flips to `superseded` with `superseded_by:` set
- DO NOT edit the existing audit folder or existing ADR — they are immutable

For each **locked-spec revision** (a previously-locked spec gets a new decision):
- Write a new ADR that supersedes the relevant portion of the old (Protocol P-4)
- Old ADR status: `superseded`. Body never edited; only `superseded_by:` field added
- Update the live spec to match the new ADR
- DO NOT bury the revision inside another spec's body

## 5. CHANGELOG update

For each spec edited this session, add an entry under today's date in `CHANGELOG.md` (Keep-a-Changelog 1.1.0 format):
- Categorise: Added / Changed / Removed / Fixed
- One human-readable sentence + `(see ADR-NNNN)` link
- Append-only — never edit prior entries

## 6. Cross-ref propagation check

For every spec edited this session:
- List its `referenced_by:` consumers from frontmatter
- Confirm each consumer is either (a) still compatible with the change OR (b) updated in the same commit per Protocol P-3
- If any consumer needs an update that hasn't happened, add it to the commit before continuing

## 7. Index consistency

- Update `DESIGN_HANDOVER.md` index if any spec status changed (locked / draft / in-progress)
- Update `docs/decisions/README.md` if any ADR was added or changed status
- Update vault `Idx_Decisions.md` if any new ADR

## 8. DOM_MAP / IOS_COMPAT (only if structural change)

Surgical edits only — do NOT bulk-rewrite either file.

## 9. Memory updates — pointer-stub policy

For any auto-memory files maintained by the project:

- New `feedback_*.md` for genuinely new feedback (process / preference / lesson). Brief.
- `project_*_locked.md` files are **pointer-only stubs** per Protocol P-8 — they carry NO duplicated spec content; only links to the canonical ADR + spec + audit folder.
- DO NOT create new `project_*_locked.md` files with body content; new locks get an ADR (the canonical home), and the memory stub points to it.
- Maximum 3 memory file edits per session — keep memory lean.

## 10. Vault session capture

Run the vault session-capture script (if your project uses an Obsidian vault):

```bash
bash "$HOME/Documents/2nd_Brain/2nd_Brain/B_Claude/4_Claude Automation/scripts/session-capture.sh"
```

Then populate today's `Mem_<date>.md` with a 5–7 bullet summary of what changed (specs touched, decisions locked, drift findings, ADRs created).

## 11. Lint pass — BLOCKS session-end

Run:

```bash
node tools/lint-docs.js
```

**Must exit 0 to proceed.** If errors:
- Fix inline (forbidden phrases, broken cross-refs, frontmatter inconsistencies)
- Re-run until clean
- Pre-commit hook will also run on `git commit` — failing lint there blocks the commit

Warnings are advisory (e.g., draft specs without `last_updated`) — don't block but should be addressed when convenient.

## 12. Toolkit upstream check

Review the session for learnings that should land in `~/projects/claude-design-toolkit/`:

| Category | What to look for |
|----------|-----------------|
| **Workflow** | New process steps that prevented or would have prevented mistakes |
| **Tooling** | New tools, MCP issues, workarounds |
| **Rules** | New universal rules for `docs/rules.md` template |
| **Templates** | Improvements to component / ADR / DOM_MAP / IOS_COMPAT / lint-docs templates |
| **Mistakes** | What went wrong, why, what rule would prevent it |

Present findings as a numbered list; ask user which to upstream. Do NOT push without explicit OK.

## 13. Two-line summary

What changed. What's next. Done.

## 14. Git commit

```bash
git status --short
```

If anything modified, commit with a meaningful message. Pre-commit hook will run lint-docs.js automatically; commit will fail if it fails.

```bash
git add -A
git commit -m "$(cat <<'EOM'
<session summary line>

<optional bullet detail>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOM
)"
```

Do NOT push to remote — separate user decision.
