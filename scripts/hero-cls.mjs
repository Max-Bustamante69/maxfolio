// Round 47 (hero): measures the layout-shift cost of the static shell -> React swap in the redesigned
// hero (src/pages/Apple.tsx + index.html). A PerformanceObserver('layout-shift') is installed via
// addInitScript BEFORE any navigation, so it catches shifts from the very first paint through
// hydration settling -- exactly the window the static-shell-parity work is trying to protect.
//   node scripts/hero-cls.mjs --dist .check/<name> --port 4421 [--widths 390,1440,1920]
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { chromium } from 'playwright';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const dist = arg('dist', '.check/hero');
const port = Number(arg('port', '4421'));
const widths = arg('widths', '390,1440,1920').split(',').map(Number);

// vite runs as a direct child (no shell), so server.kill() stops it instead of orphaning it on the port.
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--outDir", dist, "--port", String(port), "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 3500));
const served = await fetch(`http://localhost:${port}/`).then((r) => r.text()).catch(() => "");
if (served !== readFileSync(`${dist}/index.html`, "utf8")) { server.kill(); throw new Error(`port ${port} is not serving ${dist}`); }

const browser = await chromium.launch();
const results = [];
try {
  for (const w of widths) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 1000 }, deviceScaleFactor: 1 });
      await ctx.addInitScript((s) => {
        try {
          localStorage.setItem('apple-theme', s);
          localStorage.setItem('lang', 'en');
        } catch {}
        // Installed before any script on the page runs, so it observes the static shell's own
        // paint and every shift hydration causes as React replaces it.
        window.__shifts = [];
        try {
          const po = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) window.__shifts.push({ value: entry.value, time: entry.startTime, sources: (entry.sources || []).map((src) => src.node ? src.node.nodeName : null) });
            }
          });
          po.observe({ type: 'layout-shift', buffered: true });
          window.__po = po;
        } catch (e) {
          window.__poError = String(e);
        }
      }, scheme);
      const pg = await ctx.newPage();
      const consoleErrors = [];
      pg.on('pageerror', (e) => consoleErrors.push(String(e)));
      await pg.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
      // Give hydration + webfont swap (the other known CLS source on this page, already mitigated
      // elsewhere) time to settle before reading the total.
      await pg.waitForTimeout(2000);
      const shifts = await pg.evaluate(() => window.__shifts || []);
      const poError = await pg.evaluate(() => window.__poError || null);
      const total = shifts.reduce((sum, s) => sum + s.value, 0);
      results.push({ w, scheme, total: Math.round(total * 10000) / 10000, shiftCount: shifts.length, shifts, poError, errors: consoleErrors });
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}

const worst = results.reduce((m, r) => Math.max(m, r.total), 0);
console.log('@@CLS@@' + JSON.stringify({ results, worst, pass: worst < 0.02 }, null, 2));
