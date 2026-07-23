// Measured layout audit for infographic variants. Returns hard pass/fail so the
// quality gate is numbers, not opinions.
//   node daily-ai-news/audit.mjs <file-or-dir> [more...]
// Checks per variant (canvas = 1080x1350):
//   - maxGapPx   : largest empty vertical band between content blocks  (fail > MAX_GAP)
//   - minBodyPx  : smallest font-size among real body copy (text >= BODY_MIN_CHARS)
//                                                            (fail < BODY_FLOOR)
//   - overflow   : any content block spilling past the canvas edges    (fail)
// Exits non-zero if any variant fails.
import { chromium } from 'playwright';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const MAX_GAP = 70;        // px — largest allowed empty vertical band
const BODY_FLOOR = 15;     // px — minimum font-size for body copy
const BODY_MIN_CHARS = 40; // chars — text this long counts as "body copy"

function findChromium() {
  if (process.env.PW_CHROMIUM && existsSync(process.env.PW_CHROMIUM)) return process.env.PW_CHROMIUM;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    for (const d of readdirSync(root)) {
      if (!d.startsWith('chromium-')) continue;
      const p = join(root, d, 'chrome-linux', 'chrome');
      if (existsSync(p)) return p;
    }
  } catch {}
  return undefined;
}

const args = process.argv.slice(2);
if (!args.length) { console.error('Pass an HTML file or a directory.'); process.exit(2); }
const files = [];
for (const a of args) {
  const s = statSync(a);
  if (s.isDirectory()) { for (const f of readdirSync(a)) if (extname(f) === '.html') files.push(join(a, f)); }
  else if (extname(a) === '.html') files.push(a);
}
if (!files.length) { console.error('No .html files found.'); process.exit(2); }

const browser = await chromium.launch({ executablePath: findChromium() });
const page = await browser.newPage({ viewport: { width: 1128, height: 1398 } });
let anyFail = false;

for (const file of files.sort()) {
  await page.goto('file://' + join(process.cwd(), file), { waitUntil: 'networkidle' });
  const r = await page.evaluate(({ BODY_MIN_CHARS }) => {
    const canvas = document.querySelector('.canvas');
    const cb = canvas.getBoundingClientRect();
    const isTransparent = (c) => !c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)';
    const blocks = [];   // {top,bottom} relative to canvas, for gap detection
    let minBody = Infinity, minBodyText = '';
    const overflow = [];
    for (const el of canvas.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.opacity === '0') continue;
      const leaf = el.children.length === 0;
      const text = (el.textContent || '').trim();
      const hasText = leaf && text.length > 0;
      // A block "covers" its box if it paints a background or border (header, cards,
      // board, footer) — so padding inside colored containers is NOT counted as an
      // empty gap. Text leaves also count so copy in transparent areas is covered.
      const painted = el !== canvas && !isTransparent(style.backgroundColor);
      const bordered = leaf && (style.borderTopWidth !== '0px' || style.borderBottomWidth !== '0px');
      if (!hasText && !painted && !bordered) continue;
      const top = rect.top - cb.top, bottom = rect.bottom - cb.top;
      blocks.push({ top, bottom });
      if (rect.left - cb.left < -1 || rect.right - cb.right > 1 ||
          top < -1 || bottom - cb.height > 1) {
        overflow.push(el.className || el.tagName);
      }
      // Body-copy font floor — exempt footer/disclaimer meta (intentionally small).
      if (hasText && text.length >= BODY_MIN_CHARS && !el.closest('.footer')) {
        const fs = parseFloat(style.fontSize);
        if (fs < minBody) { minBody = fs; minBodyText = text.slice(0, 50); }
      }
    }
    blocks.sort((a, b) => a.top - b.top);
    const merged = [];
    for (const b of blocks) {
      const last = merged[merged.length - 1];
      if (last && b.top <= last.bottom) last.bottom = Math.max(last.bottom, b.bottom);
      else merged.push({ ...b });
    }
    let maxGap = 0, gapAt = 0, cursor = 0;
    for (const m of merged) {
      const gap = m.top - cursor;
      if (gap > maxGap) { maxGap = gap; gapAt = cursor; }
      cursor = Math.max(cursor, m.bottom);
    }
    const tailGap = cb.height - cursor;
    if (tailGap > maxGap) { maxGap = tailGap; gapAt = cursor; }
    return {
      maxGapPx: Math.round(maxGap), gapAtPx: Math.round(gapAt),
      minBodyPx: minBody === Infinity ? null : Math.round(minBody * 10) / 10,
      minBodyText, overflow: [...new Set(overflow)],
    };
  }, { BODY_MIN_CHARS });

  const fails = [];
  if (r.maxGapPx > MAX_GAP) fails.push(`gap ${r.maxGapPx}px @${r.gapAtPx}px (>${MAX_GAP})`);
  if (r.minBodyPx != null && r.minBodyPx < BODY_FLOOR) fails.push(`body font ${r.minBodyPx}px (<${BODY_FLOOR}) "${r.minBodyText}"`);
  if (r.overflow.length) fails.push(`overflow: ${r.overflow.join(', ')}`);
  const ok = fails.length === 0;
  if (!ok) anyFail = true;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${basename(file).padEnd(24)}  maxGap=${r.maxGapPx}px  minBody=${r.minBodyPx}px  overflow=${r.overflow.length}`);
  if (!ok) for (const f of fails) console.log(`        ↳ ${f}`);
}
await browser.close();
console.log(anyFail ? '\nAUDIT: FAIL — fix the HTML and re-run.' : '\nAUDIT: PASS — all variants clear.');
process.exit(anyFail ? 1 : 0);
