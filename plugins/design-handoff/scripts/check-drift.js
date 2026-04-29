#!/usr/bin/env node
/**
 * Drift checker CLI — diffs one workbench DOM element against its component spec.
 *
 * Reads `docs/components/<slug>.md` to find the dom_anchor + locked_values, then
 * launches Puppeteer, queries the workbench, and reports any deltas.
 *
 * The agent equivalent is `agents/drift-checker.md` in the design-core plugin.
 * Use the agent for ad-hoc queries; use this script for batch / scripted runs
 * (CI, pre-commit, end-of-session sweep).
 *
 * Usage (from project root):
 *   node tools/check-drift.js habbit-panel
 *   node tools/check-drift.js --all
 *   node tools/check-drift.js habbit-panel --workbench=workbench/homepage.html
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const slugArg = args.find(a => !a.startsWith('--'));
const allFlag = args.includes('--all');
const workbenchArg = (args.find(a => a.startsWith('--workbench=')) || '').split('=')[1];

if (!slugArg && !allFlag) {
  console.error('Usage: check-drift.js <slug> [--workbench=path]');
  console.error('       check-drift.js --all');
  process.exit(1);
}

const projectRoot = process.cwd();
const componentsDir = path.join(projectRoot, 'docs', 'components');
const workbenchPath = workbenchArg
  ? path.resolve(projectRoot, workbenchArg)
  : path.join(projectRoot, 'workbench', 'homepage.html');

if (!fs.existsSync(workbenchPath)) {
  console.error(`Workbench not found: ${workbenchPath}`);
  process.exit(1);
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: {} };
  const fm = {};
  let key = null;
  for (const ln of m[1].split('\n')) {
    if (/^[A-Za-z_][\w-]*:/.test(ln)) {
      const [k, ...rest] = ln.split(':');
      const v = rest.join(':').trim().replace(/^["']|["']$/g, '');
      key = k.trim();
      if (v === '' || v === '[]' || v === '{}') fm[key] = v === '' ? null : [];
      else fm[key] = v;
    } else if (/^\s*-\s+/.test(ln) && key) {
      const item = ln.replace(/^\s*-\s+/, '').trim();
      if (!Array.isArray(fm[key])) fm[key] = [];
      fm[key].push(item);
    }
  }
  return { frontmatter: fm };
}

(async () => {
  let puppeteer;
  const searchPaths = [
    path.join(projectRoot, 'node_modules', 'puppeteer'),
    path.join(projectRoot, 'tools', 'node_modules', 'puppeteer'),
    path.join(projectRoot, 'node_modules', 'puppeteer-core'),
    path.join(projectRoot, 'tools', 'node_modules', 'puppeteer-core'),
  ];
  for (const p of searchPaths) {
    if (fs.existsSync(p)) { puppeteer = require(p); break; }
  }
  if (!puppeteer) {
    try { puppeteer = require('puppeteer'); }
    catch { console.error('puppeteer required. Install: cd tools && npm i -D puppeteer'); process.exit(1); }
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 950 });
  await page.goto('file://' + workbenchPath, { waitUntil: 'networkidle0' });

  const slugs = allFlag
    ? fs.readdirSync(componentsDir).filter(f => f.endsWith('.md')).map(f => path.basename(f, '.md'))
    : [slugArg];

  let totalDelta = 0;

  for (const slug of slugs) {
    const filePath = path.join(componentsDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP ${slug} — file not found`);
      continue;
    }
    const text = fs.readFileSync(filePath, 'utf8');
    const { frontmatter } = parseFrontmatter(text);
    const anchor = (frontmatter.dom_anchor || '').replace(/^["']|["']$/g, '');

    if (!anchor) {
      console.log(`SKIP ${slug} — no dom_anchor in frontmatter`);
      continue;
    }

    const present = await page.$(anchor);
    if (!present) {
      console.log(`FAIL ${slug} — dom_anchor "${anchor}" not found in workbench`);
      totalDelta++;
      continue;
    }

    const data = await page.evaluate((sel) => {
      const e = document.querySelector(sel);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return {
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
        background: cs.backgroundColor,
        color: cs.color,
        zIndex: cs.zIndex,
        overflow: cs.overflow,
        padding: cs.padding,
      };
    }, anchor);

    const lockedValues = (frontmatter.locked_values || []).map(v => {
      const m = String(v).match(/^([\w-]+):\s*(.+)$/);
      return m ? { key: m[1], value: m[2].trim() } : null;
    }).filter(Boolean);

    const deltas = [];
    for (const lv of lockedValues) {
      let actual = null;
      const k = lv.key.toLowerCase();
      if (k === 'width' || k === 'height') actual = data[k];
      else if (k === 'z_index' || k === 'z-index') actual = data.zIndex;
      else if (k === 'overflow') actual = data.overflow;
      else continue; // not testable mechanically — skip
      if (String(actual) !== String(lv.value).replace(/px$/, '')) {
        deltas.push(`${lv.key}: spec=${lv.value}, workbench=${actual}`);
        totalDelta++;
      }
    }

    if (deltas.length === 0) {
      console.log(`OK   ${slug} — no drift on testable locked values`);
    } else {
      console.log(`DRIFT ${slug}:`);
      for (const d of deltas) console.log(`       ${d}`);
    }
  }

  await browser.close();
  process.exit(totalDelta > 0 ? 1 : 0);
})().catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
