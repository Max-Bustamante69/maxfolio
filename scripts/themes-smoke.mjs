// Every theme route at phone and desktop width: horizontal overflow and console/page errors.
// Shared sections changed in round 47 (Gallery, Skills chip rail, Testimonials) render on all of them.
//   node scripts/themes-smoke.mjs --dist .check/<name> --port 4436
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { chromium } from 'playwright';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const dist = arg('dist', 'dist');
const port = Number(arg('port', '4436'));
const routes = ['/', '/luxury', '/brutalist', '/neo', '/arcade', '/terminal', '/menu'];

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--outDir', dist, '--port', String(port), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 3500));
const served = await fetch(`http://localhost:${port}/`).then((r) => r.text()).catch(() => '');
if (served !== readFileSync(`${dist}/index.html`, 'utf8')) { server.kill(); throw new Error(`port ${port} is not serving ${dist}`); }

const browser = await chromium.launch();
const rows = [];
try {
  for (const route of routes) {
    for (const w of [390, 1440]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 } });
      const pg = await ctx.newPage();
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
      pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
      await pg.goto(`http://localhost:${port}${route}`, { waitUntil: 'networkidle' });
      await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
      await pg.waitForTimeout(600);
      const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      rows.push({ route, w, overflow, errors });
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
for (const r of rows) console.log(`${r.route.padEnd(11)} ${String(r.w).padEnd(5)} overflow ${r.overflow}  errors ${r.errors.length ? JSON.stringify(r.errors) : 0}`);
process.exitCode = rows.some((r) => r.overflow > 0 || r.errors.length) ? 1 : 0;
