#!/bin/bash
# PostToolUse hook -- validates SVG and HTML files after Edit/Write
# Installed by /design-setup into .claude/hooks/
#
# How it works:
#   Claude Code pipes JSON to stdin after every Edit/Write tool call.
#   This script extracts the file path, checks the extension, and runs
#   a basic parse. If the parse fails, it exits 2 which blocks the edit
#   and shows the error to Claude so it can fix the problem immediately.
#
# Dependencies: python3, jq

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only validate SVG and HTML files
case "$FILE" in
  *.svg)
    python3 -c "import xml.etree.ElementTree as ET; ET.parse('$FILE')" 2>&1
    if [ $? -ne 0 ]; then
      echo "VALIDATION FAILED: $FILE is malformed XML -- fix before continuing" >&2
      exit 2
    fi
    ;;
  *.html)
    python3 -c "from html.parser import HTMLParser; HTMLParser().feed(open('$FILE').read())" 2>&1
    if [ $? -ne 0 ]; then
      echo "VALIDATION FAILED: $FILE has HTML parse errors -- fix before continuing" >&2
      exit 2
    fi
    ;;
esac

exit 0
