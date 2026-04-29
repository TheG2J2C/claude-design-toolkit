Generate Swift / CSS / JSON code from `docs/tokens.json` into the project's `generated/` directory.

## Steps

1. Confirm we're in a project root (look for `docs/tokens.json`).
2. Symlink the build script into the project's `tools/` if not already there:
   ```bash
   ln -sf ~/.claude/plugins/design-tokens/scripts/build-tokens.js tools/build-tokens.js
   ```
3. Run:
   ```bash
   node tools/build-tokens.js
   ```
4. Surface the count + file paths the script reports.
5. If the project targets iOS, suggest adding `generated/Tokens.swift` to the Xcode project.

## Notes

- The default output dir is `generated/` (project root). To customise: `node tools/build-tokens.js --out=Frankie/Generated/`.
- For more output formats (Kotlin, Android XML, etc.), install Style Dictionary properly: `npm i -D style-dictionary` and write a `config.js` — this script is the zero-dep fallback.
- Re-run `generate-tokens` whenever `docs/tokens.json` changes. Consider wiring it into the project's build pipeline.
