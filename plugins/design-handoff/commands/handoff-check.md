Run the full handoff-readiness check on this project. Produces `HANDOFF-READINESS.md` at the project root.

## Steps

1. Confirm we're in a project root (look for `docs/components/` and `workbench/`).
2. Ensure the runner scripts are reachable. They live in the design-handoff plugin:
   - `~/.claude/plugins/design-handoff/scripts/check-acceptance.js`
   - `~/.claude/plugins/design-handoff/scripts/check-drift.js`

   Symlink them into the project's `tools/` directory if not already there:
   ```bash
   ln -sf ~/.claude/plugins/design-handoff/scripts/check-acceptance.js tools/check-acceptance.js
   ln -sf ~/.claude/plugins/design-handoff/scripts/check-drift.js tools/check-drift.js
   ```
3. Spawn the `handoff-validator` agent with the prompt:
   > Run the full handoff-readiness sweep. Produce HANDOFF-READINESS.md at project root.
4. Surface the agent's findings to the user. Highlight blockers in red.

## Hard rules

- Do NOT auto-fix anything the validator surfaces — present the list and wait for user direction
- Do NOT mark the project handoff-ready if there are any FAIL items — that's what NOT READY means
