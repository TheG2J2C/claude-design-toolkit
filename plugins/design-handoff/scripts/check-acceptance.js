#!/usr/bin/env node
/**
 * Acceptance Criteria runner.
 *
 * Reads every `docs/components/<slug>.md` file. For each component:
 *   1. Extracts YAML frontmatter (dom_anchor, locked_values).
 *   2. Extracts the `## Acceptance Criteria` checklist.
 *   3. Launches headless browser, opens the workbench HTML.
 *   4. For every locked_value pair, queries the dom_anchor + computed style and
 *      compares — emits PASS / FAIL / SKIP.
 *   5. Prints each acceptance-criteria checkbox so a human can review.
 *
 * Output: `acceptance-report.md` in the project root, plus a console summary.
 *
 * Usage (from project root):
 *   node tools/check-acceptance.js                # check all components
 *   node tools/check-acceptance.js habbit-panel   # check one
 *   node tools/check-acceptance.js --workbench=workbench/homepage.html
 *
 * Requires:
 *   - puppeteer or puppeteer-core installed somewhere reachable
 *   - workbench HTML opens via file:// (no server needed)
 *
 * The script intentionally does NOT execute the natural-language acceptance-
 * criteria checkboxes — those are for a reviewer. It DOES execute the
 * frontmatter `locked_values` mechanically; those are the safety net.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const componentArg = args.find(a => !a.startsWith('--'));
const workbenchArg = (args.find(a => a.startsWith('--workbench=')) || '').split('=')[1];
const projectRoot = process.cwd();
const componentsDir = path.join(projectRoot, 'docs', 'components');
const workbenchPath = workbenchArg
  ? path.resolve(projectRoot, workbenchArg)
  : path.join(projectRoot, 'workbench', 'homepage.html');

if (!fs.existsSync(componentsDir)) {
  console.error(`Not found: ${componentsDir}\nRun from project root.`);
  process.exit(1);
}
if (!fs.existsSync(workbenchPath)) {
  console.error(`Workbench not found: ${workbenchPath}`);
  process.exit(1);
}

// --- Frontmatter parsing -------------------------------------------------

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: text };
  const frontmatter = {};
  const body = m[2];
  const lines = m[1].split('\n');
  let currentKey = null;
  let currentList = null;
  for (const ln of lines) {
    if (/^[A-Za-z_][\w-]*:/.test(ln)) {
      const [k, ...rest] = ln.split(':');
      const v = rest.join(':').trim();
      currentKey = k.trim();
      if (v === '') {
        currentList = null;  // either a list/map follows or empty
        frontmatter[currentKey] = null;
      } else if (v === '[]' || v === '{}') {
        frontmatter[currentKey] = [];
        currentList = null;
      } else {
        frontmatter[currentKey] = v.replace(/^["']|["']$/g, '');
        currentList = null;
      }
    } else if (/^\s*-\s+/.test(ln) && currentKey) {
      const item = ln.replace(/^\s*-\s+/, '').trim();
      if (!Array.isArray(frontmatter[currentKey])) frontmatter[currentKey] = [];
      frontmatter[currentKey].push(item);
    }
  }
  return { frontmatter, body };
}

// --- Acceptance Criteria parsing -----------------------------------------

function extractAcceptanceCriteria(body) {
  const m = body.match(/##+\s*Acceptance Criteria[^\n]*\n([\s\S]*?)(?=\n##+\s|\n*$)/);
  if (!m) return [];
  const lines = m[1].split('\n');
  const out = [];
  for (const ln of lines) {
    const cb = ln.match(/^\s*-\s*\[([ xX])\]\s*(.+?)\s*$/);
    if (cb) out.push({ checked: cb[1].toLowerCase() === 'x', text: cb[2] });
  }
  return out;
}

// --- locked_values parsing -----------------------------------------------
// Frontmatter `locked_values` is a list of "key: value" strings.

function parseLockedValues(items) {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => {
    const m = item.match(/^([\w-]+):\s*(.+)$/);
    if (!m) return { key: item, value: null };
    let val = m[2].trim().replace(/^["']|["']$/g, '');
    return { key: m[1], value: val };
  });
}

// --- Test runners --------------------------------------------------------
// Each test takes (page, anchorSelector, expected) and returns
//   { pass: bool, actual: string|number, message: string }

const testers = {
  // Numeric pixel value with optional "px" suffix — checks computed width / height etc.
  async _measure(page, selector, expected, axis) {
    const el = await page.$(selector);
    if (!el) return { pass: false, actual: 'not found', message: `element ${selector} not found in DOM` };
    const box = await page.evaluate(s => {
      const e = document.querySelector(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, selector);
    const actual = Math.round(box[axis]);
    const exp = parseInt(String(expected).replace(/px$/, ''), 10);
    return { pass: actual === exp, actual, message: `${axis}: expected ${exp}px, got ${actual}px` };
  },

  width: (page, sel, exp) => testers._measure(page, sel, exp, 'width'),
  height: (page, sel, exp) => testers._measure(page, sel, exp, 'height'),
  row_width: (page, sel, exp) => testers._measure(page, '.hb-item', exp, 'width'),

  async z_index(page, selector, expected) {
    const z = await page.evaluate(s => {
      const e = document.querySelector(s);
      return e ? getComputedStyle(e).zIndex : null;
    }, selector);
    return { pass: String(z) === String(expected), actual: z, message: `z-index: expected ${expected}, got ${z}` };
  },

  async overflow(page, selector, expected) {
    const o = await page.evaluate(s => {
      const e = document.querySelector(s);
      return e ? getComputedStyle(e).overflow : null;
    }, selector);
    return { pass: o === expected, actual: o, message: `overflow: expected ${expected}, got ${o}` };
  },
};

// --- Main runner ---------------------------------------------------------

(async () => {
  let puppeteer;
  // Search common install locations: project root node_modules, then tools/node_modules
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
    catch {
      try { puppeteer = require('puppeteer-core'); }
      catch {
        console.error('puppeteer (or puppeteer-core) is required.');
        console.error('Install: cd tools && npm i -D puppeteer');
        process.exit(1);
      }
    }
  }

  // Find puppeteer-mcp's bundled chrome if available
  let executablePath;
  for (const p of [
    `${process.env.HOME}/Library/Application Support/Caches/Chrome/`,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]) { if (fs.existsSync(p)) { executablePath = p.endsWith('/') ? undefined : p; break; } }

  const browser = await puppeteer.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 950 });
  await page.goto('file://' + workbenchPath, { waitUntil: 'networkidle0' });

  const components = fs.readdirSync(componentsDir)
    .filter(f => f.endsWith('.md'))
    .filter(f => !componentArg || f === componentArg + '.md');

  if (components.length === 0) {
    console.error(`No component files found${componentArg ? ' for ' + componentArg : ''}.`);
    process.exit(1);
  }

  const report = [`# Acceptance Report\n\n_Generated ${new Date().toISOString()} against \`${path.relative(projectRoot, workbenchPath)}\`_\n`];
  let totalPass = 0, totalFail = 0, totalSkip = 0, totalManual = 0;

  for (const file of components) {
    const slug = path.basename(file, '.md');
    const text = fs.readFileSync(path.join(componentsDir, file), 'utf8');
    const { frontmatter, body } = parseFrontmatter(text);
    const lockedValues = parseLockedValues(frontmatter.locked_values);
    const criteria = extractAcceptanceCriteria(body);
    const anchor = (frontmatter.dom_anchor || '').replace(/^["']|["']$/g, '');

    const sectionLines = [`## ${slug}\n`,
      `- DOM anchor: \`${anchor || '(not set)'}\``,
      `- Status: ${frontmatter.status || '(unset)'}`,
      `- Locked values: ${lockedValues.length}`,
      `- Acceptance criteria: ${criteria.length}\n`,
      `### Mechanical (locked_values)\n`,
    ];

    let pass = 0, fail = 0, skip = 0;
    for (const lv of lockedValues) {
      const tester = testers[lv.key.toLowerCase()];
      if (!tester) {
        sectionLines.push(`- SKIP \`${lv.key}: ${lv.value}\` (no tester registered for key)`);
        skip++; totalSkip++;
        continue;
      }
      try {
        const r = await tester(page, anchor || 'body', lv.value);
        if (r.pass) {
          sectionLines.push(`- PASS \`${lv.key}\` — ${r.message}`);
          pass++; totalPass++;
        } else {
          sectionLines.push(`- FAIL \`${lv.key}\` — ${r.message}`);
          fail++; totalFail++;
        }
      } catch (err) {
        sectionLines.push(`- ERROR \`${lv.key}\` — ${err.message}`);
        fail++; totalFail++;
      }
    }

    sectionLines.push(`\n### Acceptance Criteria (manual review)\n`);
    if (criteria.length === 0) {
      sectionLines.push(`_No criteria defined. Add a \`## Acceptance Criteria\` section to ${file}._`);
    } else {
      for (const c of criteria) {
        sectionLines.push(`- [${c.checked ? 'x' : ' '}] ${c.text}`);
        totalManual++;
      }
    }

    sectionLines.push('');
    report.push(sectionLines.join('\n'));
    console.log(`${slug.padEnd(20)}  pass=${pass}  fail=${fail}  skip=${skip}  manual=${criteria.length}`);
  }

  await browser.close();

  const summary = [`---\n## Summary\n`,
    `- Mechanical PASS: ${totalPass}`,
    `- Mechanical FAIL: ${totalFail}`,
    `- Mechanical SKIP: ${totalSkip}`,
    `- Manual review items: ${totalManual}`,
    `\nExit ${totalFail > 0 ? 'FAILURE' : 'SUCCESS'}\n`,
  ];
  report.push(summary.join('\n'));

  const reportPath = path.join(projectRoot, 'acceptance-report.md');
  fs.writeFileSync(reportPath, report.join('\n'));
  console.log(`\nReport written to: ${path.relative(projectRoot, reportPath)}`);
  console.log(`Mechanical: ${totalPass} pass, ${totalFail} fail, ${totalSkip} skip. Manual review: ${totalManual}.`);
  process.exit(totalFail > 0 ? 1 : 0);
})().catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
