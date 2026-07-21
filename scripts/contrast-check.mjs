#!/usr/bin/env node
// Scans app/**/*.tsx for opacity-reduced text-color utility classes
// (text-fg-muted/60, text-neon-gold/40, etc.) and computes the real WCAG
// contrast ratio against the panel/base backgrounds those elements sit on.
// Flags anything below 5.5:1 (normal text) so low-contrast regressions like
// the "Zurücknehmen"-link case get caught automatically instead of by eye.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const TOKENS = {
  // hex values from app/globals.css :root (party tone)
  'fg': '#f7f3fb',
  'fg-muted': '#b9a9cc',
  'neon-gold': '#ffce54',
  'turquoise': '#22e0d0',
  'red': '#ff3547',
  'danger': '#fb7185',
  'success': '#34d399',
};

const BACKGROUNDS = {
  'bg-base': '#06030c',
  'bg-panel': '#150a26',
  'bg-panel-elevated': '#221033',
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function blend(fgHex, alpha, bgHex) {
  const [fr, fg, fb] = hexToRgb(fgHex);
  const [br, bg, bb] = hexToRgb(bgHex);
  return [
    fr * alpha + br * (1 - alpha),
    fg * alpha + bg * (1 - alpha),
    fb * alpha + bb * (1 - alpha),
  ];
}

function relLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relLuminance(rgb1);
  const l2 = relLuminance(rgb2);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

const files = execSync("git ls-files 'app/**/*.tsx'", { cwd: process.cwd() })
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

// `placeholder:text-*` is intentionally dimmed hint text, not held to body-text
// contrast — matched separately so it never counts as a violation.
const pattern = /(?<!placeholder:)text-(fg-muted|fg|neon-gold|turquoise|red|danger|success)\/(\d{1,3})\b/g;

const findings = [];
for (const file of files) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    let m;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(line))) {
      const [, tokenName, alphaStr] = m;
      const alpha = parseInt(alphaStr, 10) / 100;
      const fgHex = TOKENS[tokenName];
      if (!fgHex) continue;
      for (const [bgName, bgHex] of Object.entries(BACKGROUNDS)) {
        const blended = blend(fgHex, alpha, bgHex);
        const ratio = contrastRatio(blended, hexToRgb(bgHex));
        if (ratio < 5.5) {
          findings.push({
            file,
            line: i + 1,
            class: `text-${tokenName}/${alphaStr}`,
            bg: bgName,
            ratio: ratio.toFixed(2),
            code: line.trim().slice(0, 100),
          });
        }
      }
    }
  });
}

// One row per (file, line, class) — report the worst-case (lowest ratio) background.
const byKey = new Map();
for (const f of findings) {
  const key = `${f.file}:${f.line}:${f.class}`;
  const existing = byKey.get(key);
  if (!existing || parseFloat(f.ratio) < parseFloat(existing.ratio)) byKey.set(key, f);
}

const sorted = [...byKey.values()].sort((a, b) => parseFloat(a.ratio) - parseFloat(b.ratio));

if (sorted.length === 0) {
  console.log('✓ Keine Kontrast-Verstöße unter 5.5:1 gefunden.');
  process.exit(0);
}

console.log(`✗ ${sorted.length} Stelle(n) mit Kontrast < 5.5:1 (schlechtestes Hintergrund-Szenario):\n`);
for (const f of sorted) {
  console.log(`${f.file}:${f.line}  ${f.class} auf ${f.bg}  →  ${f.ratio}:1`);
  console.log(`  ${f.code}`);
}
process.exit(1);
