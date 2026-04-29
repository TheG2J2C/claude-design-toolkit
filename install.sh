#!/bin/bash
# DEPRECATED — replaced by the Claude Code plugin marketplace.
#
# The old script copied flat skill files to ~/.claude/skills/ and symlinked
# commands. After the 2026-04-29 restructure, skills live as SKILL.md inside
# directories under plugins/design-core/skills/, which is incompatible with
# the old flat layout. The plugin system handles this automatically.

cat <<'EOF'
=== Claude Design Toolkit ===

install.sh has been retired. Adoption is now done through the Claude Code
plugin marketplace.

In your project's .claude/settings.json:

  {
    "extraKnownMarketplaces": {
      "claude-design-toolkit": {
        "source": { "type": "github", "repo": "TheG2J2C/claude-design-toolkit" }
      }
    }
  }

Then in your Claude Code session:

  /plugin install design-core

See docs/ADOPTING.md for full instructions.
EOF
exit 1
