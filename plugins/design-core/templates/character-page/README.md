# Character Page Template

Reusable scaffold for any screen where a **character speaks via typewriter** inside a contained surface (e.g. a rounded rectangle on a coloured frame). Built originally for an onboarding flow but generic enough to apply to:

- Onboarding / re-foster / welcome flows
- Intervention / strike screens
- Tutorial overlays
- Any "X tells you something" moment that needs voice + atmosphere + character presence

---

## Files

| File | Purpose |
|---|---|
| `character-page.html` | The template HTML/CSS/JS scaffold. Copy to `workbench/<screen>.html` and customise. |
| `extract-silhouette.html` | Companion tool — generates the silhouette anchor table from any character SVG via a canvas pixel scan. Use whenever the character image or pose changes. |
| `README.md` | This file. |

---

## What's reusable (don't change unless you mean to)

- Cream rounded rectangle inside a coloured outer frame
- Character image anchored bottom-left, in front of the rectangle
- **`CharacterWrap` module** — per-line text wrap around the character's silhouette with configurable padding (start at 20 px). Generic — works for any anchored figure once you supply a silhouette table.
- Typewriter that types char-by-char, paragraph-by-paragraph, with `/Para` = block + 21 px margin (≈ 30 px visible at 22 px font with 1.4 line-height — the `2 × half-leading` math)
- Tap-to-skip typing
- Bottom strip: back · dots · next, with CSS chevrons for crisp icon centering
- Page indicator "n / N" inside the surface
- Reveal helpers for non-text inserts (image + heading scale-in, icon in coloured circle, staggered pop-in list)
- Debug overlay (toggle button) — fine grid + major grid + silhouette polyline + padded wrap edge + anchor labels + mouse coordinate readout

---

## Customisation points (search for `TEMPLATE:`)

When you copy the template into your workbench:

1. **Outer frame colour** — `--color-dark` in `:root`. Default in this template is `#687a89` (a calm blue/grey). Override per screen mood (warm vs intervention vs neutral).
2. **Cream / surface colour** — `--color-cream`. Tunable.
3. **Character image** — `<img class="ob-bill" src="...">`. Provide your own anchored character SVG; recommended display height ≈ 55% of phone.
4. **Silhouette table** — `CharacterWrap.silhouette.rightEdge`. Re-run `extract-silhouette.html` whenever you change the character or pose. **Class names use `ob-bill` for backwards compatibility — rename if Bill isn't your character.**
5. **`PAGES` array** — page-specific content (paragraphs, extras, multi-stage flag, required input).
6. **Reveal types** — `frankie`, `doggytalkie`, `starterkit` are example reveal slots. Rename and re-skin per character/context.
7. **Last-page CTA label** — "GO" by default; change to "Get Started", "OK", whatever fits.
8. **Rulers + grid debug** — leave as-is; they're useful for any project.

---

## Re-measuring the silhouette (when the character changes)

If you swap the character image or pose, the wrap will misbehave because it's based on the old silhouette. Re-measure with the extractor:

1. Open `extract-silhouette.html` (double-click, or via puppeteer with `--allow-file-access-from-files`).
2. Set the inputs:
   - **SVG path** — relative to the extractor file (e.g. `../../assets/rig/character-pose.svg`)
   - **Display height** — how tall the character renders on the phone in px
   - **Phone height** — typically `884` (iPhone-ish canvas)
   - **Sample step** — `10` is a good default
   - **Alpha threshold** — start at `5–10` (lower = catch anti-aliased soft edges; **`50` is too strict and will under-trace your silhouette** — known mistake)
3. Click **Extract**, verify the red dashed line traces the character's outline correctly in the preview.
4. Copy the JSON output and paste into `CharacterWrap.silhouette.rightEdge` in your screen.
5. Adjust `topY` / `bottomY` to match the character's vertical range.
6. Tune `padding` (start at 20 px; can go to 30 px for more breathing).

---

## Indent rule (the most important decision)

For each text line, decide whether and how much to indent based on the character's silhouette at that line's y. The rule that has worked in production:

> **Indent based on silhouette right at line CENTER y (plus padding). Lines whose centre is above the character's top breathing threshold flow full width.**

Why centre and not max-across-line:
- Using the **centre** y matches what the user perceives — the line "is at" its centre.
- Using **max across the line range** over-indents at sharp silhouette transitions (neck → shoulder bulge) because the line-box bottom hits the wider region even though the glyphs visually clear.
- The slight under-padding at the line box's edge (vs. centre) is invisible in practice — text glyph descenders/ascenders don't reach the box edges.

**Reveals (non-text blocks like a centred image)** are different. They use **max** silhouette right across the block's full y range, then center their content within the remaining width — because a reveal block IS a continuous area that needs to clear the character at every y it occupies.

---

## Locked design values (carry forward when adopting)

These come from production iteration; override only with a clear reason:

| Property | Value | Source |
|---|---|---|
| /Para gap (visible) | 30 px | Reading-rhythm tested |
| /Para gap (CSS) | 21 px | = visible 30 − 2 × 4.4 line-height leading at font-size 22, line-height 1.4 |
| Character height | 55% of phone | Substantial without dominating |
| Character padding (20) | 20 px breathing | Configurable; tested at 20 — bump if visual feels tight |
| Bottom strip buttons | 40 px brown circles, white CSS chevrons | Centered glyph regardless of font baseline quirks |
| Typewriter speed | 50 ms/char | "Comfortable reading pace, not snappy" |

---

## Universal lessons baked in (don't relearn the hard way)

1. **CSS visible gap ≠ CSS margin.** When the design spec says "30 px gap between text blocks", don't set `margin-top: 30px`. Line-height adds half-leading on both sides; the visible glyph-to-glyph gap is `margin + 2 × half-leading`. For 22 px / 1.4 line-height, margin should be ~21 px to *render* as 30 px visible.

2. **SVG silhouette extraction: lower your alpha threshold.** Anti-aliased edges have alpha 1–50. A 50 threshold cuts off the soft edge of every shape. Use **5–10** to catch what's actually visible.

3. **Inkscape doesn't always emit `viewBox`.** If you're rendering an SVG via canvas and getting unexpected scaling, check for `viewBox`. If missing, add it explicitly (`viewBox="0 0 W H"`).

4. **Reuse one puppeteer browser session** across multiple navigates/screenshots in a tool run. Don't `launch / navigate / screenshot / close_browser` each iteration — the per-launch overhead is significant and the close-each-time pattern produces nothing of value.

5. **Per-line indent based on line CENTRE y.** Don't use max-across-line-range — over-indents at silhouette transitions. Don't use top-of-line — under-indents at transitions. Centre y is the visual sweet spot.

6. **Don't add features the user didn't ask for.** When the user says "X needs to be included" — that does not mean "X needs its own dedicated page". Default assumption: fold X into the existing structure. If unsure, ask — don't expand scope.

7. **Use interactive multi-choice questions (with previews) for any 2+ option design decision.** Dumping option lists in chat is slow and error-prone. A short multi-choice tool call with ASCII or screenshot previews settles a design decision in one round-trip instead of three.
