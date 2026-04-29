# Adopting `claude-design-toolkit`

Two paths — pick one. The marketplace path is the 2026 default. The legacy `install.sh` path stays around for one release as a backstop.

---

## Path A — Plugin marketplace (recommended, 2026+)

In your project's `.claude/settings.json` (create if missing):

```json
{
  "extraKnownMarketplaces": {
    "claude-design-toolkit": {
      "source": {
        "type": "github",
        "repo": "TheG2J2C/claude-design-toolkit"
      }
    }
  }
}
```

Then in your Claude Code session:

```
/plugin install design-core
```

That's it. You now have:

- ✓ `design-edit` skill (auto-activates on workbench file edits)
- ✓ `design-verify` skill (auto-activates on workbench file edits)
- ✓ 6 agent role files (`design-reviewer`, `drift-checker`, `doc-extractor`, `ios-translator`, `token-auditor`, `adversarial-critic`) — usable as subagents AND Agent Team teammates
- ✓ `validate-design-files.sh` hook (auto-validates SVG/HTML on Edit/Write)
- ✓ `task-completed-acceptance-check.sh` hook (TaskCompleted gate: workbench edits must be paired with a spec-file edit; needs `jq`)
- ✓ `/design-setup` slash command for new-project bootstrap
- ✓ All templates (DOM_MAP, IOS_COMPAT, FOLDER_STRUCTURE, DOC_STRUCTURE, component-template, project-design-command, SOURCES, snippets/)

**Auto-update at session start.** When you open Claude Code in this project, the marketplace refreshes; if the toolkit has a new version, it updates automatically. You'll see a notification — run `/reload-plugins` to apply.

To pin a version (avoid auto-update):

```json
{
  "extraKnownMarketplaces": {
    "claude-design-toolkit": {
      "source": { "type": "github", "repo": "TheG2J2C/claude-design-toolkit" },
      "version": "1.0.0"
    }
  }
}
```

To enable Agent Teams (so the 6 agent files double as teammate roles):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

---

## Path B — Legacy install.sh (deprecated, removed in v2.0.0)

For projects that haven't migrated to the plugin system, the old install method still works:

```bash
git clone https://github.com/TheG2J2C/claude-design-toolkit.git ~/projects/claude-design-toolkit
cd ~/projects/claude-design-toolkit
./install.sh
```

This copies skills to `~/.claude/skills/`, the hook to your project, etc. It's manual. It doesn't auto-update. It's deprecated.

Migrate to Path A when you can.

---

## Verify the install worked

In Claude Code:

```
/plugin list
```

You should see `design-core@1.0.0` in the list.

```
/skills
```

Should include `design-edit` and `design-verify` (auto-activate enabled).

To list available agents:

```
/agents
```

Should include all 6 role files.

---

## What gets created in your project

The plugin install does NOT create any files in your project. It only enables skills/agents/hooks centrally. To bootstrap a new design project's *content* (DOM_MAP.md, IOS_COMPAT.md, etc.), run:

```
/design-setup
```

That's the interactive command that creates the project-side files using the toolkit's templates.

---

## Updating the toolkit

If `auto_update: true` in marketplace.json (default), Claude Code refreshes at session start. Otherwise:

```
/plugin update design-core
```

To check the changelog before updating, see [CHANGELOG.md](../CHANGELOG.md) in the toolkit repo.

---

## Uninstalling

```
/plugin uninstall design-core
```

Then remove the `extraKnownMarketplaces` entry from `.claude/settings.json`.
