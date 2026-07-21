#!/usr/bin/env node
// scripts/text-baseline.mjs
//
// Regressions-Gate für die "Confetti Rave"-UI-Migration: extrahiert per
// TypeScript-AST allen sichtbaren Text aus den Zieldateien (JSX-Text-Kinder +
// text-tragende Attribute) und vergleicht ihn gegen eine eingefrorene Baseline.
// Ziel: Styling darf sich beliebig ändern, sichtbarer Text NIE.
//
// Aufruf:
//   node scripts/text-baseline.mjs baseline   # schreibt scripts/.text-baseline.json
//   node scripts/text-baseline.mjs check      # vergleicht, exit 1 bei Abweichung
//   node scripts/text-baseline.mjs check app/dj/page.tsx app/dj/\[slug\]/page.tsx
//                                              # check nur für die genannten Dateien
//
// Extraktionsregeln (siehe Migrationsplan Abschnitt B):
//   - jeder JsxText-Kindknoten (getrimmt, leere ignoriert)
//   - bei intrinsischen DOM-Elementen (lowercase Tag): nur die Attribute
//     aria-label/title/alt/placeholder
//   - bei eigenen Komponenten (uppercase Tag, z.B. <StepHeader title=.../>):
//     ALLE String-/Template-Literal-Attribute außer einer kleinen technischen
//     Ausschlussliste (className, style, tone, variant, color, size, type,
//     href, id, key, ref) — in dieser Codebase sind eigene Komponenten-Props
//     praktisch immer Text (label, title, sub, eyebrow, headline, description)
//   - beide Zweige von Ternaries werden erfasst, weil einfach jedes
//     String-/Template-Literal im jeweiligen Ausdrucksbaum eingesammelt wird,
//     unabhängig davon welcher Zweig zur Baseline-Zeit aktiv gerendert wird
//   - bei Template-Literalen mit Interpolation (`${x} Songs erreicht`) werden
//     nur die literalen Segmente zwischen den Ausdrücken erfasst, damit sich
//     ändernde Zahlen/Variablen keinen Diff auslösen, Wortänderungen aber schon

import ts from 'typescript';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASELINE_PATH = resolve(__dirname, '.text-baseline.json');

const TARGET_FILES = [
  'app/page.tsx',
  'app/pricing/page.tsx',
  'app/vibo-alternative/page.tsx',
  'app/brautpaar/page.tsx',
  'app/pilot/page.tsx',
  'app/start/page.tsx',
  'app/dj/page.tsx',
  'app/dj/[slug]/page.tsx',
  'app/[slug]/page.tsx',
  'app/auth/signin/page.tsx',
  'app/auth/register/page.tsx',
  'app/impressum/page.tsx',
  'app/agb/page.tsx',
  'app/datenschutz/page.tsx',
  'app/account/page.tsx',
  'app/components/PaywallModal.tsx',
  'app/not-found.tsx',
];

const DOM_TEXT_ATTRS = new Set(['aria-label', 'title', 'alt', 'placeholder']);
const COMPONENT_ATTR_EXCLUDE = new Set([
  'className', 'style', 'tone', 'variant', 'color', 'size', 'type', 'href',
  'id', 'key', 'ref', 'onClick', 'onChange', 'onSubmit', 'onKeyDown', 'disabled',
  // Pure styling/color values on non-DOM components (e.g. QRCodeSVG's
  // fgColor/bgColor) — not user-visible copy, would otherwise false-positive.
  'fgColor', 'bgColor', 'level', 'width', 'height', 'tilt', 'elevated', 'sticky',
]);

function isLowerCaseTag(tagNameNode) {
  const name = tagNameNode.getText();
  return /^[a-z]/.test(name.split('.')[0]);
}

/** Recursively collects literal text segments out of an expression tree
 *  (handles ConditionalExpression, ParenthesizedExpression, template literals
 *  with interpolation, and plain string literals). Non-literal leaves are
 *  silently skipped. */
function collectLiteralSegments(node, out) {
  if (!node) return;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const t = node.text.trim();
    if (t) out.add(t);
    return;
  }
  if (ts.isTemplateExpression(node)) {
    const head = node.head.text.trim();
    if (head) out.add(head);
    for (const span of node.templateSpans) {
      const seg = span.literal.text.trim();
      if (seg) out.add(seg);
    }
    return;
  }
  if (ts.isConditionalExpression(node)) {
    collectLiteralSegments(node.whenTrue, out);
    collectLiteralSegments(node.whenFalse, out);
    return;
  }
  if (ts.isParenthesizedExpression(node)) {
    collectLiteralSegments(node.expression, out);
    return;
  }
  if (ts.isBinaryExpression(node)) {
    // Covers `a ?? 'fallback'` / `a || 'fallback'` — only the literal side matters.
    collectLiteralSegments(node.left, out);
    collectLiteralSegments(node.right, out);
    return;
  }
  if (ts.isJsxExpression(node)) {
    collectLiteralSegments(node.expression, out);
  }
}

function extractFromFile(absPath, relPath) {
  const source = readFileSync(absPath, 'utf-8');
  const sf = ts.createSourceFile(relPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = new Set();

  function visitAttributes(attrs, isComponent) {
    for (const attr of attrs) {
      if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
      const name = attr.name.getText();
      if (isComponent) {
        if (COMPONENT_ATTR_EXCLUDE.has(name)) continue;
      } else if (!DOM_TEXT_ATTRS.has(name)) {
        continue;
      }
      if (ts.isStringLiteral(attr.initializer)) {
        const t = attr.initializer.text.trim();
        if (t) found.add(t);
      } else if (ts.isJsxExpression(attr.initializer)) {
        collectLiteralSegments(attr.initializer.expression, found);
      }
    }
  }

  function visit(node) {
    if (ts.isJsxText(node)) {
      const t = node.text.replace(/\s+/g, ' ').trim();
      if (t) found.add(t);
    } else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      visitAttributes(node.attributes.properties, !isLowerCaseTag(node.tagName));
    } else if (ts.isJsxExpression(node) && !(node.parent && ts.isJsxAttribute(node.parent))) {
      // Top-level `{cond ? 'a' : 'b'}` sitting directly in JSX children.
      // The parent-check excludes attribute-initializer expressions (e.g.
      // className={`...${cond ? 'a' : 'b'}`}) — visitAttributes() already
      // handles those with correct per-attribute-name filtering; without
      // this guard, forEachChild's generic descent re-visits the same
      // JsxExpression from inside a className/style attribute and
      // incorrectly captures CSS class strings as "visible text".
      collectLiteralSegments(node.expression, found);
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return Array.from(found).sort();
}

function buildSnapshot(files) {
  const snapshot = {};
  for (const rel of files) {
    const abs = resolve(ROOT, rel);
    if (!existsSync(abs)) {
      console.error(`✗ Datei fehlt: ${rel}`);
      process.exitCode = 1;
      continue;
    }
    snapshot[rel] = extractFromFile(abs, rel);
  }
  return snapshot;
}

function main() {
  const [, , mode, ...rest] = process.argv;
  const files = rest.length > 0 ? rest : TARGET_FILES;

  if (mode === 'baseline') {
    const full = buildSnapshot(TARGET_FILES);
    writeFileSync(BASELINE_PATH, JSON.stringify(full, null, 2) + '\n', 'utf-8');
    const total = Object.values(full).reduce((n, arr) => n + arr.length, 0);
    console.log(`✓ Baseline geschrieben: ${BASELINE_PATH} (${Object.keys(full).length} Dateien, ${total} Text-Strings)`);
    return;
  }

  if (mode === 'check') {
    if (!existsSync(BASELINE_PATH)) {
      console.error('✗ Keine Baseline gefunden — zuerst `node scripts/text-baseline.mjs baseline` ausführen.');
      process.exit(1);
    }
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
    const current = buildSnapshot(files);

    let hasDiff = false;
    for (const rel of files) {
      const before = new Set(baseline[rel] ?? []);
      const after = new Set(current[rel] ?? []);
      if (!(rel in baseline)) {
        console.error(`⚠ ${rel}: nicht in Baseline enthalten — evtl. neue Datei, Baseline aktualisieren falls beabsichtigt.`);
        continue;
      }
      const missing = [...before].filter((s) => !after.has(s));
      const added = [...after].filter((s) => !before.has(s));
      if (missing.length || added.length) {
        hasDiff = true;
        console.error(`\n✗ Text-Abweichung in ${rel}:`);
        for (const s of missing) console.error(`  - FEHLT (war vorher da):     "${s}"`);
        for (const s of added) console.error(`  + NEU (war vorher nicht da): "${s}"`);
      }
    }

    if (hasDiff) {
      console.error('\n✗ Regressions-Check fehlgeschlagen: sichtbarer Text hat sich geändert.');
      process.exit(1);
    }
    console.log(`✓ Kein Text-Diff in ${files.length} Datei(en). Nur Styling darf sich geändert haben.`);
    return;
  }

  console.error('Nutzung: node scripts/text-baseline.mjs <baseline|check> [datei...]');
  process.exit(1);
}

main();
