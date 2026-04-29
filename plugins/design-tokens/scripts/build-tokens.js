#!/usr/bin/env node
/**
 * Token build script — minimal Style-Dictionary-compatible exporter.
 *
 * Reads `docs/tokens.json` (W3C Design Tokens Format 2025.10) and writes:
 *   - generated/tokens.css       — CSS custom properties
 *   - generated/Tokens.swift     — Swift extensions (Color, Font, etc.)
 *   - generated/tokens.flat.json — flattened key→value JSON for any other tool
 *
 * Run from project root:
 *   node tools/build-tokens.js
 *   node tools/build-tokens.js --out=Frankie/Generated/  # custom output dir
 *
 * To use Style Dictionary instead (more output formats, more features):
 *   npm i -D style-dictionary
 *   Add a config.js — see https://amzn.github.io/style-dictionary/
 *   This script is the zero-dep fallback.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const outArg = (args.find(a => a.startsWith('--out=')) || '').split('=')[1];
const projectRoot = process.cwd();
const tokensPath = path.join(projectRoot, 'docs', 'tokens.json');
const outDir = outArg ? path.resolve(projectRoot, outArg) : path.join(projectRoot, 'generated');

if (!fs.existsSync(tokensPath)) {
  console.error(`Not found: ${tokensPath}`);
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// --- Flatten to dot-path → value -----------------------------------------

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue; // skip $schema, $description on root
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && '$value' in v) {
      out[key] = { value: v.$value, type: v.$type, description: v.$description };
    } else if (v && typeof v === 'object') {
      flatten(v, key, out);
    }
  }
  return out;
}

const flat = flatten(tokens);

// --- CSS output ---------------------------------------------------------

function toCssVarName(key) {
  return '--' + key.replace(/\./g, '-');
}

function cssOutput(flat) {
  const lines = ['/* Auto-generated from docs/tokens.json. DO NOT EDIT. */', ':root {'];
  for (const [key, t] of Object.entries(flat)) {
    if (t.type === 'shadow' && typeof t.value === 'object') {
      const s = t.value;
      lines.push(`  ${toCssVarName(key)}: ${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread || '0'} ${s.color};`);
    } else {
      lines.push(`  ${toCssVarName(key)}: ${t.value};`);
    }
  }
  lines.push('}');
  return lines.join('\n') + '\n';
}

// --- Swift output -------------------------------------------------------

function pascal(s) {
  return s.split(/[.\-_/]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function camel(s) {
  const p = pascal(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function hexToColorInit(hex) {
  // accept #RRGGBB or #RGB
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return `Color(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)})`;
}

function swiftOutput(flat) {
  const lines = [
    '// Auto-generated from docs/tokens.json. DO NOT EDIT.',
    '// To regenerate: node tools/build-tokens.js',
    '',
    'import SwiftUI',
    '',
    '// MARK: - Color tokens',
    'extension Color {',
  ];
  for (const [key, t] of Object.entries(flat)) {
    if (t.type !== 'color') continue;
    const name = camel(key.replace(/^color\./, ''));
    lines.push(`    /// ${t.description || ''}  Token: \`${key}\``);
    lines.push(`    static let ${name} = ${hexToColorInit(t.value)}`);
  }
  lines.push('}', '');
  lines.push('// MARK: - Spacing tokens');
  lines.push('enum Spacing {');
  for (const [key, t] of Object.entries(flat)) {
    if (t.type !== 'dimension' || !key.startsWith('spacing.')) continue;
    const name = camel(key.replace(/^spacing\./, ''));
    const v = String(t.value).replace(/px$/, '');
    lines.push(`    static let ${name}: CGFloat = ${v}`);
  }
  lines.push('}', '');
  lines.push('// MARK: - Border radius');
  lines.push('enum Radius {');
  for (const [key, t] of Object.entries(flat)) {
    if (t.type !== 'dimension' || !key.startsWith('radius.')) continue;
    const name = camel(key.replace(/^radius\./, ''));
    const v = String(t.value).replace(/px$/, '');
    if (v.endsWith('%')) continue; // skip 50% — use Circle() in SwiftUI
    lines.push(`    static let ${name}: CGFloat = ${v}`);
  }
  lines.push('}', '');
  lines.push('// MARK: - Z-index');
  lines.push('enum ZIndex {');
  for (const [key, t] of Object.entries(flat)) {
    if (t.type !== 'number' || !key.startsWith('z-index.')) continue;
    const name = camel(key.replace(/^z-index\./, ''));
    lines.push(`    static let ${name}: Double = ${t.value}`);
  }
  lines.push('}', '');
  return lines.join('\n');
}

// --- Flat JSON output ---------------------------------------------------

function flatJsonOutput(flat) {
  const out = {};
  for (const [k, v] of Object.entries(flat)) out[k] = v.value;
  return JSON.stringify(out, null, 2) + '\n';
}

// --- Write files --------------------------------------------------------

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tokens.css'), cssOutput(flat));
fs.writeFileSync(path.join(outDir, 'Tokens.swift'), swiftOutput(flat));
fs.writeFileSync(path.join(outDir, 'tokens.flat.json'), flatJsonOutput(flat));

console.log(`Generated ${Object.keys(flat).length} tokens →`);
console.log(`  ${path.relative(projectRoot, path.join(outDir, 'tokens.css'))}`);
console.log(`  ${path.relative(projectRoot, path.join(outDir, 'Tokens.swift'))}`);
console.log(`  ${path.relative(projectRoot, path.join(outDir, 'tokens.flat.json'))}`);
