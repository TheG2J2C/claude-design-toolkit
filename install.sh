#!/bin/bash
# Claude Design Toolkit -- Install Script
# Installs commands, skills, and checks dependencies

set -e

TOOLKIT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "=== Claude Design Toolkit Installer ==="
echo ""

# Create directories
mkdir -p "$CLAUDE_DIR/commands"

# Symlink the design-setup command
ln -sf "$TOOLKIT_DIR/commands/design-setup.md" "$CLAUDE_DIR/commands/design-setup.md"
echo "Installed /design-setup command"

# Copy skills (these are referenced in commands, not directly invoked)
mkdir -p "$CLAUDE_DIR/skills"
cp "$TOOLKIT_DIR/skills/design-edit.md" "$CLAUDE_DIR/skills/design-edit.md"
cp "$TOOLKIT_DIR/skills/design-verify.md" "$CLAUDE_DIR/skills/design-verify.md"
echo "Installed design-edit and design-verify skills"

# Check dependencies
echo ""
echo "=== Checking Dependencies ==="

# Node.js
if command -v node &>/dev/null; then
    echo "Node.js $(node -v) found"
else
    echo "WARNING: Node.js not found -- required for Puppeteer MCP"
fi

# Puppeteer MCP -- just check, don't install (needs claude CLI)
echo ""
echo "=== Next Steps ==="
echo "Run these commands in Claude Code to install MCPs:"
echo ""
echo "  claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude"
echo ""
echo "For iOS projects, also install:"
echo "  claude mcp add ios-simulator -- npx ios-simulator-mcp"
echo ""
echo "Then in any project, run /design-setup to get started."
echo ""
echo "=== Installation Complete ==="
