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

### Visual Comparison Pipeline (optional — ask the user)

Ask the user:
> **Do you want visual comparison tools?** These let me compare screenshots against target designs and catch pixel-level differences. Requires Gemini API key (free tier). Say "yes" to set up, or "skip" to add later.

If yes:

1. **Install Gemini CLI:**
   ```
   npm install -g @google/gemini-cli
   ```
   Verify: `gemini --version`

2. **Install the bridge skill:**
   ```
   npx skillfish add bnufw/lear_by_ai collaborating-with-gemini
   ```
   This installs to `~/.claude/skills/collaborating-with-gemini/`

3. **Get API key:** Ask the user for their Gemini API key (get one free at https://aistudio.google.com/apikey). Store in macOS Keychain:
   ```
   security add-generic-password -s "gemini-api-key" -a "$USER" -w "THE_KEY"
   ```

4. **Install pixelmatch** in the project:
   ```
   npm init -y && npm install pngjs pixelmatch
   ```

5. **Create `.gemini_uploads/` directory** in the project root for image handoff.

6. **DO NOT install any Gemini MCP server** (`aliargun/mcp-server-gemini`, `@houtini/gemini-mcp`, `@rlabs-inc/gemini-mcp` — they ALL crash Claude Code due to a `oneOf/allOf/anyOf` schema bug that Anthropic won't fix).

**Visual comparison workflow (add to project design command):**
```
## Visual Comparison
- **Puppeteer** — take screenshots. Launch at phone viewport + 50px buffer each side to reveal overflow.
- **pixelmatch** — `node compare.js <target.png> <current.png> <diff.png>` for pixel-level diff. Red = different.
- **Split into thirds** — crop both images into top/mid/bot thirds before comparing for more detail.
- **Gemini CLI bridge** — for AI-powered "describe every difference":
  ```bash
  export GEMINI_API_KEY=$(security find-generic-password -s "gemini-api-key" -w)
  export GEMINI_CLI_TRUST_WORKSPACE=true
  cp screenshot.png .gemini_uploads/
  python3 ~/.claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
    --cd "." --model "gemini-2.5-pro" --PROMPT "Compare images..."
  ```
- **Align framing** — always crop target and current screenshots to matching regions before comparing.
- **Don't screenshot after every change** unless needed — when user is giving rapid instructions, batch at natural pauses.
- **Free tier limits** — Gemini Pro has daily quota. Flash is faster but inconsistent with vision. Pro resets daily.
```

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

### 3g. Screenshots Folder Convention

Recommend the user designate a screenshots folder for the project. Two options:

1. **Per-project folder (preferred):** `<project-root>/screenshots/` — keeps reference images alongside the project, survives reorganisation, no system-path dependency.
2. **Shared workspace folder:** e.g. `~/projects/ScreenShots/` if the user prefers all screenshots in one place across projects.

Avoid using iCloud Drive folders (`~/Library/Mobile Documents/com~apple~CloudDocs/Screen Shots/`) as the primary path — they require `brctl download` for files not yet synced, and can rot when the user reorganises their Mac.

Add a note to the project's design command (Section 6 — Available Tools):

```
- **User screenshots ("ss" shorthand)** — when user says "ss", fetch the latest screenshot from `<configured-screenshots-folder>` and Read it directly. Files are typically named `SCR-YYYYMMDD-xxxx.png`.
```

Save the chosen path as a memory entry (`feedback_ss_shorthand.md`) so it's recoverable across sessions.

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
