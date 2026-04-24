# /design-setup — Configure a Project for Design Work

You are running the design-setup command. Follow these steps in order. Ask each question one at a time and wait for the user's answer before proceeding.

## Step 1: Gather Project Information

Ask these questions one at a time. Wait for each answer before asking the next.

1. **Project name?** (This will be used for naming the project-specific design command, e.g. "Frankie" becomes `Frankie_Design.md`)
2. **Platform?** (iOS / Web / Cross-platform)
3. **Tech stack?** (SwiftUI + WKWebView / React / Vue / HTML/CSS/JS / Other)
4. **Prototype format?** (HTML workbench / React app / Figma-only / Other)
5. **Device size?** (iPhone 15 Pro 393x852 / iPad 1024x1366 / custom WxH — provide width and height)
6. **Colour palette?** (Paste hex values, or say "not yet" to skip)
7. **Figma file URL?** (Paste the URL, or say "none")

Store all answers for use in the steps below.

## Step 2: Check MCP Dependencies

### Puppeteer MCP (required for all projects)
Check if Puppeteer MCP is available by attempting to list available MCP tools. If it is not installed, tell the user:

> Puppeteer MCP is required for screenshot verification. Install it by running:
> ```
> claude mcp add puppeteer-mcp-claude -- npx puppeteer-mcp-claude serve
> ```
> **Important:** The `serve` subcommand is required. Without it, the process prints help text and exits, which causes "Failed to connect" errors.
> Then restart Claude Code and run /design-setup again.

### iOS Simulator MCP (if platform is iOS or Cross-platform)
If the user selected iOS or Cross-platform, check for ios-simulator MCP. If not installed, suggest:

> For iOS projects, install the iOS Simulator MCP:
> ```
> claude mcp add ios-simulator -- npx ios-simulator-mcp
> ```

### Figma MCP (if Figma URL provided)
If the user provided a Figma URL, check that the Figma MCP is configured. If not, suggest:

> To pull designs from Figma, ensure the Figma MCP is configured. Check your .mcp.json or install via:
> ```
> claude mcp add figma -- npx @anthropic/claude-figma-mcp
> ```

## Step 3: Create Project Files

Use the toolkit templates to create project-specific files. The templates are located at:
- `~/projects/claude-design-toolkit/templates/DOM_MAP.md`
- `~/projects/claude-design-toolkit/templates/IOS_COMPAT.md`
- `~/projects/claude-design-toolkit/templates/DESIGN_PROTOCOL.md`
- `~/projects/claude-design-toolkit/templates/project-design-command.md`

### 3a. Create DOM_MAP.md
Read the template from `~/projects/claude-design-toolkit/templates/DOM_MAP.md` and copy it to the current project directory as `DOM_MAP.md`. If there are existing HTML files in the project, attempt to populate the DOM structure from them.

### 3b. Create IOS_COMPAT.md (if iOS or Cross-platform)
If the platform is iOS or Cross-platform, read the template from `~/projects/claude-design-toolkit/templates/IOS_COMPAT.md` and copy it to the current project directory as `IOS_COMPAT.md`.

### 3c. Append Design Protocol to CLAUDE.md
Read the template from `~/projects/claude-design-toolkit/templates/DESIGN_PROTOCOL.md`. Append its contents to the project's `CLAUDE.md` file. If no `CLAUDE.md` exists, create one with the protocol as its content.

### 3d. Create Project Design Command
Read the template from `~/projects/claude-design-toolkit/templates/project-design-command.md`. Replace these placeholders:
- `{{PROJECT_NAME}}` — the project name from Step 1

Write the filled template to `.claude/commands/<ProjectName>_Design.md` in the project directory (create the `.claude/commands/` directory if it doesn't exist).

### 3e. Install Validation Hook
Copy the validation hook from `~/projects/claude-design-toolkit/templates/hooks/validate-design-files.sh` into the project's `.claude/hooks/` directory. Make it executable.

Then add the hook configuration to the project's `.claude/settings.local.json`. If the file already exists, merge the hooks into the existing config. The hook config should be:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "<absolute-path-to-project>/.claude/hooks/validate-design-files.sh"
          }
        ]
      }
    ]
  }
}
```

This automatically validates SVG files (XML parse) and HTML files (basic parse) after every edit, catching malformed markup before it causes problems.

### 3f. File Protocol Guidance (HTML workbench projects only)
If the user selected "HTML workbench" as prototype format, add this note to the project's CLAUDE.md:

> **file:// Protocol Constraints:** The workbench must open by double-clicking (file:// protocol). Standard `<script src="file.js">` and `<link href="styles.css">` tags work fine from file://. JavaScript `fetch()` does NOT work from file://. Never use fetch() to load local assets — use HTML tags instead.

## Step 4: Report

Tell the user what was created. Use this format:

```
Design toolkit configured for [PROJECT_NAME]:

Created files:
  - DOM_MAP.md (in project root)
  - IOS_COMPAT.md (in project root) [if iOS]
  - .claude/commands/[ProjectName]_Design.md (project design command)
  - Appended Design Protocol to CLAUDE.md

MCP status:
  - Puppeteer: [installed/not installed]
  - iOS Simulator: [installed/not installed/not needed]
  - Figma: [configured/not configured/not needed]

Next steps:
  - Run /[ProjectName]_Design to start a design session
  - Populate DOM_MAP.md with your actual page structure
  - Review IOS_COMPAT.md before implementing interactions [if iOS]

Toolkit sync:
  - At natural breakpoints, review learnings from this project
  - Suggest upstreaming universal improvements to claude-design-toolkit repo
  - The toolkit grows from real project experience — every project makes the next one better
```
