#!/bin/bash
# Claude Design Toolkit -- Install Script
# Installs commands, skills, and checks dependencies

set -e

TOOLKIT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
ERRORS=0

echo "=== Claude Design Toolkit Installer ==="
echo ""

# --- Commands ---
mkdir -p "$CLAUDE_DIR/commands"
ln -sf "$TOOLKIT_DIR/commands/design-setup.md" "$CLAUDE_DIR/commands/design-setup.md"
if [ -L "$CLAUDE_DIR/commands/design-setup.md" ]; then
    echo "✅ /design-setup command installed (symlinked)"
else
    echo "❌ Failed to symlink design-setup command"
    ERRORS=$((ERRORS + 1))
fi

# --- Skills ---
mkdir -p "$CLAUDE_DIR/skills"
cp "$TOOLKIT_DIR/skills/design-edit.md" "$CLAUDE_DIR/skills/design-edit.md"
cp "$TOOLKIT_DIR/skills/design-verify.md" "$CLAUDE_DIR/skills/design-verify.md"
if [ -f "$CLAUDE_DIR/skills/design-edit.md" ] && [ -f "$CLAUDE_DIR/skills/design-verify.md" ]; then
    echo "✅ design-edit and design-verify skills installed"
else
    echo "❌ Failed to copy skills"
    ERRORS=$((ERRORS + 1))
fi

# --- Validation hook template ---
mkdir -p "$TOOLKIT_DIR/templates/hooks"
if [ -f "$TOOLKIT_DIR/templates/hooks/validate-design-files.sh" ]; then
    echo "✅ Validation hook template available"
else
    echo "⚠️  Validation hook template not found -- /design-setup will skip hook installation"
fi

# --- Dependencies ---
echo ""
echo "=== Checking Dependencies ==="

if command -v node &>/dev/null; then
    echo "✅ Node.js $(node -v)"
else
    echo "❌ Node.js not found -- required for Puppeteer MCP"
    ERRORS=$((ERRORS + 1))
fi

if command -v python3 &>/dev/null; then
    echo "✅ Python3 $(python3 --version 2>&1 | awk '{print $2}')"
else
    echo "⚠️  Python3 not found -- validation hook needs it for SVG/HTML checking"
fi

if command -v jq &>/dev/null; then
    echo "✅ jq installed"
else
    echo "⚠️  jq not found -- validation hook needs it (brew install jq)"
fi

# --- MCP instructions ---
# NOTE: The `serve` subcommand is required -- without it the process prints
#       help text and exits, causing "Failed to connect" in claude mcp list.
echo ""
echo "=== Next Steps ==="
echo "Run these commands in Claude Code to install MCPs:"
echo ""
echo "  claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude serve"
echo ""
echo "For iOS projects, also install:"
echo "  claude mcp add ios-simulator -- npx ios-simulator-mcp"
echo ""
echo "Then in any project, run /design-setup to get started."

# --- Summary ---
echo ""
if [ $ERRORS -eq 0 ]; then
    echo "=== Installation Complete (no errors) ==="
else
    echo "=== Installation Complete ($ERRORS error(s) -- see above) ==="
fi
