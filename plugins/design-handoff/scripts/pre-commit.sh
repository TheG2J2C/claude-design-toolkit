#!/usr/bin/env bash
# Pre-commit hook — runs lint-docs.js to enforce the documentation rules.
#
# Installation: copy this file to .git/hooks/pre-commit and make executable:
#   cp plugins/design-handoff/scripts/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Customise PROJECT_ROOT_RELATIVE if your repo has the design content in a
# subdirectory (e.g. consolidated-vault projects where docs/ lives under
# `<project>_Design_Claude_Code/`).
#
# Bypass for emergencies (NOT recommended): git commit --no-verify
# But the lint catches real drift; bypassing means you're committing it.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

# Adjust this if your design content is in a subdirectory:
PROJECT_ROOT_RELATIVE=""        # e.g. "MyProject_Design_Claude_Code"

if [ -n "$PROJECT_ROOT_RELATIVE" ]; then
  PROJECT_ROOT="$REPO_ROOT/$PROJECT_ROOT_RELATIVE"
else
  PROJECT_ROOT="$REPO_ROOT"
fi

LINT_SCRIPT="$PROJECT_ROOT/tools/lint-docs.js"

# Only run if any docs/ or DOM_MAP.md / IOS_COMPAT.md / DESIGN_HANDOVER.md / README.md files are staged.
if [ -n "$PROJECT_ROOT_RELATIVE" ]; then
  PATTERN="(^${PROJECT_ROOT_RELATIVE}/docs/|${PROJECT_ROOT_RELATIVE}/(DOM_MAP|IOS_COMPAT|DESIGN_HANDOVER|README)\.md$)"
else
  PATTERN="(^docs/|^(DOM_MAP|IOS_COMPAT|DESIGN_HANDOVER|README)\.md$)"
fi

STAGED=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "$PATTERN" || true)

if [ -z "$STAGED" ]; then
  exit 0
fi

if [ ! -f "$LINT_SCRIPT" ]; then
  echo "pre-commit: lint-docs.js not found at $LINT_SCRIPT — skipping doc lint"
  exit 0
fi

echo "pre-commit: running lint-docs.js …"
if ! node "$LINT_SCRIPT" --quiet; then
  echo ""
  echo "pre-commit: doc lint FAILED. Fix the errors above, or run with --no-verify to bypass."
  echo "  (run 'node $LINT_SCRIPT' for full output incl. warnings)"
  exit 1
fi

exit 0
