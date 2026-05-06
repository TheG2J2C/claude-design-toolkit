#!/usr/bin/env node
/**
 * lint-docs.js — Frankie design-spec documentation linter.
 *
 * Enforces the rules locked in:
 *   - docs/decisions/ADR-0006 (governance: iOS-Sync, Component Spec Completeness)
 *   - docs/decisions/ADR-0007 (universal product rules: Trial banned, etc.)
 *   - docs/decisions/README.md § One-topic-per-ADR + Naming rule
 *   - docs/rules.md
 *   - docs/superpowers/specs/2026-05-06-doc-surface-audit.md (Protocol P-1..P-8)
 *
 * Exit codes:
 *   0 — clean
 *   1 — errors found
 *   2 — warnings only (when --warn-as-error not set; default still 0)
 *
 * Usage:
 *   node tools/lint-docs.js                # lint everything
 *   node tools/lint-docs.js --quick        # frontmatter + cross-refs only (fast)
 *   node tools/lint-docs.js --quiet        # errors only, no warnings
 *   node tools/lint-docs.js path/to/file.md   # lint one file
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(REPO_ROOT, 'docs/components');
const DECISIONS_DIR = path.join(REPO_ROOT, 'docs/decisions');
const RULES_FILE = path.join(REPO_ROOT, 'docs/rules.md');
const TOKENS_MD = path.join(REPO_ROOT, 'docs/tokens.md');
const NAMING_MD = path.join(REPO_ROOT, 'docs/naming.md');
const DOM_MAP = path.join(REPO_ROOT, 'DOM_MAP.md');
const IOS_COMPAT = path.join(REPO_ROOT, 'IOS_COMPAT.md');
const HANDOVER = path.join(REPO_ROOT, 'DESIGN_HANDOVER.md');
const README = path.join(REPO_ROOT, 'README.md');

const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const QUIET = args.includes('--quiet');
const FILE_ARG = args.find(a => !a.startsWith('--'));

const errors = [];
const warnings = [];

function err(file, line, rule, msg) {
  errors.push({ file: path.relative(REPO_ROOT, file), line, rule, msg });
}
function warn(file, line, rule, msg) {
  warnings.push({ file: path.relative(REPO_ROOT, file), line, rule, msg });
}

// ── Frontmatter parser (minimal, no deps) ──────────────────────────────

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return { frontmatter: null, bodyStart: 0 };
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return { frontmatter: null, bodyStart: 0 };
  const fmText = content.slice(4, end);
  const fm = {};
  const lines = fmText.split('\n');
  let currentKey = null;
  let currentList = null;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line) continue;
    if (line.startsWith('  - ') && currentKey) {
      const val = line.slice(4).trim();
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(val.replace(/^["']|["']$/g, ''));
      continue;
    }
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!m) continue;
    currentKey = m[1];
    const rawVal = m[2];
    if (!rawVal) {
      fm[currentKey] = [];
      continue;
    }
    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      fm[currentKey] = rawVal.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      fm[currentKey] = rawVal.replace(/^["']|["']$/g, '').replace(/\s+#.*$/, '').trim();
    }
  }
  return { frontmatter: fm, bodyStart: end + 5 };
}

// ── Forbidden phrases ─────────────────────────────────────────────────
//
// UNIVERSAL rules apply to every project using this methodology.
// PROJECT-SPECIFIC rules (deprecated names, old slugs, banned terminology)
// are loaded from `tools/lint-docs.config.json` if present.

const UNIVERSAL_FORBIDDEN = [
  // Historical-language (current-state-only rule)
  { pattern: /\bpreviously\b/i, msg: 'forbidden phrase "previously" (current-state-only rule)' },
  { pattern: /\bformerly\b/i, msg: 'forbidden phrase "formerly"' },
  { pattern: /\bwas previously\b/i, msg: 'forbidden phrase "was previously"' },
  { pattern: /\bused to (be|have)\b/i, msg: 'forbidden phrase "used to be/have"' },
  { pattern: /\bno longer\b/i, msg: 'forbidden phrase "no longer"' },
  { pattern: /\bsuperseded\b/i, msg: 'forbidden phrase "superseded" (use ADR supersede chain instead)' },
  { pattern: /\bdeprecated\b/i, msg: 'forbidden phrase "deprecated"' },
  { pattern: /\bretired\s+\d{4}-\d{2}-\d{2}\b/i, msg: 'forbidden phrase "retired YYYY-MM-DD" (history goes in ADR + CHANGELOG, not live spec)' },
];

// Load project-specific rules from config file
let PROJECT_FORBIDDEN = [];
const CONFIG_FILE = path.join(REPO_ROOT, 'tools/lint-docs.config.json');
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (Array.isArray(cfg.forbidden_phrases)) {
      PROJECT_FORBIDDEN = cfg.forbidden_phrases.map(rule => ({
        pattern: new RegExp(rule.pattern, rule.flags || 'i'),
        msg: rule.msg,
        allowInBreadcrumb: rule.allowInBreadcrumb || false,
      }));
    }
  } catch (e) {
    console.error(`lint-docs: failed to parse ${CONFIG_FILE}: ${e.message}`);
  }
}

const FORBIDDEN_PHRASES = [...UNIVERSAL_FORBIDDEN, ...PROJECT_FORBIDDEN];

// Allow lint-allow inline directive: <!-- lint-allow: <reason> -->
const LINT_ALLOW_RE = /<!--\s*lint-allow:[^>]*-->/;

function checkForbiddenPhrases(file, content, isLockedSpec) {
  if (!isLockedSpec) return; // Drafts get exemptions
  const lines = content.split('\n');
  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip code blocks
    if (line.trim().startsWith('```')) inCodeBlock = !inCodeBlock;
    if (inCodeBlock) continue;
    // Skip frontmatter (already parsed)
    if (i < 100 && line === '---') continue;
    // Skip lines with lint-allow directive
    if (LINT_ALLOW_RE.test(line)) continue;
    for (const { pattern, msg, allowInBreadcrumb } of FORBIDDEN_PHRASES) {
      if (pattern.test(line)) {
        // Allow workbench-rename breadcrumbs in ADR-0005 / specs that explicitly note pending workbench code-align
        if (allowInBreadcrumb && /workbench code-align|old slug|rename pending|spec_rename_queued/i.test(line)) continue;
        err(file, i + 1, 'forbidden-phrase', `${msg} — line: ${line.trim().slice(0, 100)}`);
      }
    }
  }
}

// ── Frontmatter integrity ─────────────────────────────────────────────

function checkFrontmatter(file, fm, content) {
  if (!fm) {
    err(file, 1, 'frontmatter-missing', 'no frontmatter');
    return;
  }
  if (!fm.slug) err(file, 1, 'frontmatter-required', 'missing `slug`');
  if (!fm.status) err(file, 1, 'frontmatter-required', 'missing `status`');
  if (!fm.last_updated) warn(file, 1, 'frontmatter-recommended', 'missing `last_updated`');

  if (fm.status === 'locked') {
    if (!fm.locked_by) {
      err(file, 1, 'frontmatter-locked-by-required', 'spec is `locked` but missing `locked_by: ADR-NNNN`');
    } else if (!/^ADR-\d{4}$/.test(fm.locked_by)) {
      err(file, 1, 'frontmatter-locked-by-format', `locked_by must match ADR-NNNN; got "${fm.locked_by}"`);
    }
  }

  // iOS-Sync rule
  if (fm.last_updated && fm.ios_last_reviewed) {
    const lu = fm.last_updated;
    const ir = fm.ios_last_reviewed;
    if (ir < lu) {
      err(file, 1, 'ios-freshness', `ios_last_reviewed (${ir}) < last_updated (${lu})`);
    }
  } else if (fm.status === 'locked' && !fm.ios_last_reviewed) {
    warn(file, 1, 'ios-freshness', 'locked spec missing `ios_last_reviewed`');
  }
}

// ── Cross-ref integrity (depends_on / referenced_by / locked_by) ──────

let allComponentSlugs = null;
let allADRSlugs = null;

function loadAllSlugs() {
  if (allComponentSlugs) return;
  allComponentSlugs = new Set();
  for (const f of fs.readdirSync(COMPONENTS_DIR).filter(n => n.endsWith('.md'))) {
    allComponentSlugs.add(f.replace(/\.md$/, ''));
  }
  allADRSlugs = new Map();
  for (const f of fs.readdirSync(DECISIONS_DIR).filter(n => /^ADR-\d{4}-/.test(n))) {
    const id = f.match(/^ADR-(\d{4})-/)[0].replace(/-$/, '');
    const fmContent = fs.readFileSync(path.join(DECISIONS_DIR, f), 'utf8');
    const { frontmatter } = parseFrontmatter(fmContent);
    allADRSlugs.set(id, { file: f, status: frontmatter?.status });
  }
}

function checkCrossRefs(file, fm) {
  loadAllSlugs();
  const checkSlugList = (key) => {
    const list = fm[key];
    if (!Array.isArray(list)) return;
    for (const slug of list) {
      const cleaned = slug.replace(/[\[\]"']/g, '').trim().split(/\s+/)[0]; // strip quotes/brackets
      if (!cleaned || cleaned === 'tokens' || cleaned === 'naming' || cleaned === 'kennel') continue; // tokens.md / naming.md / future kennel
      if (!allComponentSlugs.has(cleaned)) {
        err(file, 1, 'cross-ref-integrity', `${key}: "${cleaned}" does not resolve to a component spec`);
      }
    }
  };
  checkSlugList('depends_on');
  checkSlugList('referenced_by');

  // locked_by must resolve to accepted ADR
  if (fm.locked_by) {
    const adr = allADRSlugs.get(fm.locked_by);
    if (!adr) {
      err(file, 1, 'frontmatter-locked-by-resolves', `locked_by "${fm.locked_by}" does not exist in docs/decisions/`);
    } else if (adr.status && adr.status !== 'accepted' && adr.status !== 'superseded') {
      err(file, 1, 'frontmatter-locked-by-resolves', `locked_by "${fm.locked_by}" has status "${adr.status}" — expected accepted or superseded`);
    }
  }
}

// ── Component Spec Completeness rule (ADR-0006 Rule 3) ────────────────

function checkSpecCompleteness(file, fm, content) {
  if (fm.status !== 'locked') return; // Only enforce on locked specs

  // Required frontmatter
  if (!('emits_events' in fm)) warn(file, 1, 'spec-completeness', 'missing frontmatter `emits_events:`');
  if (!('consumes_events' in fm)) warn(file, 1, 'spec-completeness', 'missing frontmatter `consumes_events:`');

  // Required body sections
  const required = [
    { re: /^## (?:iOS Implementation|.*iOS )/m, name: '## iOS Implementation' },
    { re: /^## Acceptance Criteria/m, name: '## Acceptance Criteria' },
  ];
  for (const { re, name } of required) {
    if (!re.test(content)) {
      warn(file, 1, 'spec-completeness', `missing required section: ${name}`);
    }
  }

  // VISUAL + INTEGRATION acceptance-criteria split
  if (/^## Acceptance Criteria/m.test(content)) {
    const acSection = content.split(/^## Acceptance Criteria/m)[1] || '';
    const hasVisual = /###\s+VISUAL/i.test(acSection) || /VISUAL.*rebuild/i.test(acSection);
    const hasIntegration = /###\s+INTEGRATION/i.test(acSection) || /INTEGRATION.*XCTest/i.test(acSection);
    if (!hasVisual) warn(file, 1, 'spec-completeness', 'Acceptance Criteria missing VISUAL subsection (per ADR-0006)');
    if (!hasIntegration) warn(file, 1, 'spec-completeness', 'Acceptance Criteria missing INTEGRATION subsection (per ADR-0006)');
  }
}

// ── Project-wide rules (run once per lint-all, not per file) ──────────

function checkDesignHandoverIndexMatches() {
  // Rule: every component listed as "⚠️ LOCKED" in DESIGN_HANDOVER.md
  // must have a corresponding spec with status: locked + locked_by: ADR-NNNN.
  if (!fs.existsSync(HANDOVER)) return;
  const content = fs.readFileSync(HANDOVER, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match table rows: `| <component> | [components/<slug>.md](...) | ⚠️ LOCKED | ... |`
    if (!/⚠️\s*LOCKED/.test(line)) continue;
    const m = line.match(/components\/([a-z0-9-]+)\.md/);
    if (!m) continue;
    const slug = m[1];
    const specPath = path.join(COMPONENTS_DIR, `${slug}.md`);
    if (!fs.existsSync(specPath)) {
      err(HANDOVER, i + 1, 'design-handover-index-matches', `LOCKED row for "${slug}" but spec docs/components/${slug}.md does not exist`);
      continue;
    }
    const specFm = parseFrontmatter(fs.readFileSync(specPath, 'utf8')).frontmatter;
    if (!specFm) continue;
    if (specFm.status !== 'locked') {
      err(HANDOVER, i + 1, 'design-handover-index-matches', `DESIGN_HANDOVER says "${slug}" is LOCKED but spec frontmatter says status=${specFm.status}`);
    }
    if (!specFm.locked_by) {
      err(HANDOVER, i + 1, 'design-handover-index-matches', `DESIGN_HANDOVER says "${slug}" is LOCKED but spec has no locked_by:`);
    }
  }
}

function checkChangelogCoverage() {
  // Rule: every spec with last_updated in this week (Mon-Sun) should have a
  // corresponding CHANGELOG entry on or after that date.
  if (!fs.existsSync(path.join(REPO_ROOT, 'CHANGELOG.md'))) return;
  const changelog = fs.readFileSync(path.join(REPO_ROOT, 'CHANGELOG.md'), 'utf8');
  const datedSections = new Set();
  for (const m of changelog.matchAll(/^##\s+(\d{4}-\d{2}-\d{2})/gm)) {
    datedSections.add(m[1]);
  }
  // "This week" — 7 days back from today
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  for (const f of fs.readdirSync(COMPONENTS_DIR).filter(n => n.endsWith('.md'))) {
    const filePath = path.join(COMPONENTS_DIR, f);
    const fm = parseFrontmatter(fs.readFileSync(filePath, 'utf8')).frontmatter;
    if (!fm || !fm.last_updated) continue;
    const lu = new Date(fm.last_updated);
    if (isNaN(lu.getTime())) continue;
    if (lu < weekAgo) continue; // older than a week — don't enforce coverage
    // Check: any CHANGELOG date on or after this last_updated?
    const hasEntry = [...datedSections].some(d => d >= fm.last_updated);
    if (!hasEntry) {
      warn(filePath, 1, 'changelog-coverage', `last_updated=${fm.last_updated} but no CHANGELOG entry on or after that date`);
    }
  }
}

function checkAuditFolderStaleness() {
  // Rule: legacy audit folders not yet retired (no RETIRED.md stub) should
  // not contradict the current live spec for the same topic.
  // Simple heuristic: if the audit folder's slug overlaps with a locked spec,
  // and the audit folder doesn't have a RETIRED.md stub, warn that it should
  // either be retired (P-6) or its content reviewed for staleness.
  const auditRoot = path.join(REPO_ROOT, 'docs/_audit');
  if (!fs.existsSync(auditRoot)) return;
  for (const folder of fs.readdirSync(auditRoot)) {
    const folderPath = path.join(auditRoot, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const retired = fs.existsSync(path.join(folderPath, 'RETIRED.md'));
    // Extract slug-like topics from folder name (e.g. "2026-05-05_premium-lock" → "premium")
    const topicMatch = folder.match(/^\d{4}-\d{2}-\d{2}_(.+?)(?:-gap-analysis|-lock)?$/);
    if (!topicMatch) continue;
    const topic = topicMatch[1].replace(/-(gap-analysis|lock)$/, '');
    // Find any locked spec whose slug is similar to this topic
    const candidateSlugs = [topic, topic.replace(/s$/, ''), topic + 's'];
    for (const slug of candidateSlugs) {
      const specPath = path.join(COMPONENTS_DIR, `${slug}.md`);
      if (!fs.existsSync(specPath)) continue;
      const fm = parseFrontmatter(fs.readFileSync(specPath, 'utf8')).frontmatter;
      if (fm && fm.status === 'locked' && fm.locked_by && !retired) {
        warn(folderPath, 0, 'audit-folder-staleness', `audit folder for topic "${topic}" not retired but spec ${slug} is locked by ${fm.locked_by} — consider Protocol P-6 retirement (move to docs/_archive/_audit/)`);
      }
    }
  }
}

function checkADRRelatedSpecsBidirectional() {
  // Rule: every component-bound ADR's related_specs[] must contain at least
  // one spec that has locked_by: pointing back at this ADR.
  // Cross-cutting ADRs (frontmatter: cross_cutting: true) are exempt — their
  // related_specs lists "specs this ADR's rules apply to", which is a different
  // relationship than "specs locked by this ADR".
  loadAllSlugs();
  for (const [adrId, info] of allADRSlugs.entries()) {
    if (info.status !== 'accepted') continue;
    const adrPath = path.join(DECISIONS_DIR, info.file);
    const fm = parseFrontmatter(fs.readFileSync(adrPath, 'utf8')).frontmatter;
    if (!fm || !Array.isArray(fm.related_specs)) continue;
    if (fm.cross_cutting === 'true' || fm.cross_cutting === true) continue;
    // Find specs that point back via locked_by
    let backRefs = [];
    for (const spec of fs.readdirSync(COMPONENTS_DIR).filter(n => n.endsWith('.md'))) {
      const specFm = parseFrontmatter(fs.readFileSync(path.join(COMPONENTS_DIR, spec), 'utf8')).frontmatter;
      if (specFm && specFm.locked_by === adrId) {
        backRefs.push(spec.replace(/\.md$/, ''));
      }
    }
    const componentRelated = fm.related_specs.filter(s => allComponentSlugs.has(s.replace(/[\[\]"']/g, '').trim()));
    if (componentRelated.length > 0 && backRefs.length === 0) {
      warn(adrPath, 1, 'adr-related-specs-bidirectional', `${adrId} has component-bound related_specs (${componentRelated.join(', ')}) but no spec has locked_by: ${adrId} (set cross_cutting: true if this is intentional)`);
    }
  }
}

// ── Linting one file ──────────────────────────────────────────────────

function lintFile(file) {
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (e) {
    err(file, 0, 'read', `cannot read file: ${e.message}`);
    return;
  }
  const { frontmatter } = parseFrontmatter(content);
  const isLockedSpec = frontmatter && frontmatter.status === 'locked';

  checkFrontmatter(file, frontmatter, content);
  if (frontmatter) checkCrossRefs(file, frontmatter);
  if (!QUICK) checkForbiddenPhrases(file, content, isLockedSpec);
  if (frontmatter && frontmatter.status === 'locked') checkSpecCompleteness(file, frontmatter, content);
}

// ── Main ──────────────────────────────────────────────────────────────

function lintAll() {
  // Component specs
  for (const f of fs.readdirSync(COMPONENTS_DIR).filter(n => n.endsWith('.md'))) {
    lintFile(path.join(COMPONENTS_DIR, f));
  }
  // Cross-cutting docs (forbidden-phrase check only — they don't have spec frontmatter)
  for (const f of [RULES_FILE, TOKENS_MD, NAMING_MD, DOM_MAP, IOS_COMPAT, HANDOVER, README]) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      if (!QUICK) checkForbiddenPhrases(f, content, true);
    }
  }
}

if (FILE_ARG) {
  lintFile(path.resolve(FILE_ARG));
} else {
  lintAll();
  // Project-wide rules — only run on full lint, not single-file
  if (!QUICK) {
    checkDesignHandoverIndexMatches();
    checkChangelogCoverage();
    checkAuditFolderStaleness();
    checkADRRelatedSpecsBidirectional();
  }
}

// ── Output ────────────────────────────────────────────────────────────

function reportItems(items, label) {
  if (items.length === 0) return;
  console.log(`\n${label} (${items.length}):`);
  for (const i of items) {
    console.log(`  ${i.file}:${i.line}  [${i.rule}]  ${i.msg}`);
  }
}

reportItems(errors, 'ERRORS');
if (!QUIET) reportItems(warnings, 'WARNINGS');

if (errors.length > 0) {
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
} else if (warnings.length > 0 && !QUIET) {
  console.log(`\n0 errors, ${warnings.length} warning(s).`);
  process.exit(0);
} else {
  console.log('\nlint-docs.js: clean.');
  process.exit(0);
}
