#!/bin/bash
# TaskCompleted hook — Agent Teams quality gate.
#
# Fires when a teammate marks a task complete. Enforces:
#   "If a workbench file changed, the corresponding component spec file
#    must also have been touched in the same task."
#
# Input format (stdin JSON, per Claude Code TaskCompleted hook contract):
#   {
#     "task": { "title": "...", "description": "..." },
#     "files_changed": ["workbench/homepage.html", "docs/components/habbit-panel.md", ...]
#   }
#
# Exit codes:
#   0 — task completion approved
#   2 — block completion; STDERR is shown to the teammate as feedback
#
# To disable for a session, set env var: SKIP_ACCEPTANCE_CHECK=1

set -e

if [ "${SKIP_ACCEPTANCE_CHECK:-0}" = "1" ]; then
  exit 0
fi

INPUT=$(cat)

# Need jq for JSON parsing
if ! command -v jq >/dev/null 2>&1; then
  echo "task-completed-acceptance-check: jq not installed; skipping check" >&2
  exit 0
fi

# Files changed in this task
FILES=$(echo "$INPUT" | jq -r '.files_changed // [] | .[]' 2>/dev/null || echo "")

# If no files at all, allow (analysis-only task)
[ -z "$FILES" ] && exit 0

# Did any workbench file change?
WORKBENCH_TOUCHED=$(echo "$FILES" | grep -E '^workbench/' || true)

# Did any component spec change?
SPEC_TOUCHED=$(echo "$FILES" | grep -E '^docs/components/' || true)

# Build pipeline behaviour: if workbench/src/* was edited, the rebuilt artifacts
# (workbench/*.html) are auto-generated and don't count as a separate change.
SRC_TOUCHED=$(echo "$FILES" | grep -E '^workbench/src/' || true)

# Live workbench changes that are NOT under _archive/, NOT under src/, NOT .bak
LIVE_WORKBENCH_TOUCHED=$(echo "$WORKBENCH_TOUCHED" \
  | grep -vE '^workbench/_archive/' \
  | grep -vE '^workbench/src/' \
  | grep -vE '\.bak$' || true)

# If src/ changed, the live artifacts are build outputs — allow regardless of spec
if [ -n "$SRC_TOUCHED" ]; then
  exit 0
fi

if [ -n "$LIVE_WORKBENCH_TOUCHED" ] && [ -z "$SPEC_TOUCHED" ]; then
  cat >&2 <<EOF
ACCEPTANCE CHECK FAILED — task completion blocked.

You changed workbench files:
$LIVE_WORKBENCH_TOUCHED

…but did NOT update any docs/components/<slug>.md file.

The toolkit's sync-or-bug rule (DOC_STRUCTURE.md): when the workbench changes,
the corresponding component spec file MUST also change in the same task.

To resolve, EITHER:
  1. Update the relevant docs/components/<slug>.md file (Visual Spec, Behaviour,
     Acceptance Criteria, or History — whichever applies). Then re-attempt the
     completion.
  2. If this change is intentionally spec-free (debug-only, comment fix, etc.),
     set SKIP_ACCEPTANCE_CHECK=1 in the task's environment for one bypass, OR
     describe the rationale in the task description so a reviewer can approve.

Tip: spawn the 'drift-checker' subagent to identify which spec file matches
your workbench change.
EOF
  exit 2
fi

# All good
exit 0
