// Render infographic HTML files to 1080x1350 PNGs using the preinstalled Chromium.
// Usage: node daily-ai-news/render.mjs <file-or-dir> [more...]
//   - a .html file      -> writes <name>.png next to it
//   - a directory       -> renders every *.html inside it
// Requires: npm i -D playwright  (Chromium is already on disk at /opt/pw-browsers)
import { chromium } from 'playwright';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';

// Use the Chromium preinstalled in this environment instead of downloading one.
// Override with PW_CHROMIUM if your install lives elsewhere.
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
  return undefined; // fall back to Playwright's bundled path
}

const args = process.argv.slice(2);
if (!args.length) { console.error('Pass an HTML file or a directory.'); process.exit(1); }

const htmlFiles = [];
for (const a of args) {
  const s = statSync(a);
  if (s.isDirectory()) {
    for (const f of readdirSync(a)) if (extname(f) === '.html') htmlFiles.push(join(a, f));
  } else if (extname(a) === '.html') {
    htmlFiles.push(a);
  }
}
if (!htmlFiles.length) { console.error('No .html files found.'); process.exit(1); }

const browser = await chromium.launch({ executablePath: findChromium() });
const page = await browser.newPage({ viewport: { width: 1128, height: 1398 }, deviceScaleFactor: 2 });
for (const file of htmlFiles) {
  await page.goto('file://' + join(process.cwd(), file), { waitUntil: 'networkidle' });
  const el = await page.$('.canvas');
  const out = join(dirname(file), basename(file, '.html') + '.png');
  await (el ?? page).screenshot({ path: out });
  console.log('rendered', out);
}
await browser.close();
