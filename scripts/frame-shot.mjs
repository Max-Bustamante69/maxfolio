// Round 47 check: screenshots of the Apple page at 390/768/1440/1920 (light + dark) and an
// alignment probe — every section's first heading must start on the frame's content edge.
//   node scripts/frame-shot.mjs --dist .check/<name> --port 4410 [--sections hero,experience] [--out shots/<name>] [--full]
// Builds are made with: npx vite build --outDir .check/<name> --emptyOutDir
import { spawn } from 'child_process';
import { mkdirSync, readFileSync } from 'fs';
import { chromium } from 'playwright';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const dist = arg('dist', 'dist');
const port = Number(arg('port', '4410'));
const out = arg('out', 'shots/frame');
const only = arg('sections', '');
const widths = arg('widths', '390,768,1440,1920').split(',').map(Number);
const full = process.argv.includes('--full');
mkdirSync(out, { recursive: true });

// vite runs as a direct child (no shell), so server.kill() stops it instead of orphaning it on the port.
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--outDir", dist, "--port", String(port), "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 3500));
// Refuse to shoot a stale server: the page on the port must be this build.
const served = await fetch(`http://localhost:${port}/`).then((r) => r.text()).catch(() => "");
if (served !== readFileSync(`${dist}/index.html`, "utf8")) { server.kill(); throw new Error(`port ${port} is not serving ${dist}`); }

const browser = await chromium.launch();
const report = [];
try {
  for (const w of widths) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 1000 }, deviceScaleFactor: 1 });
      await ctx.addInitScript((s) => { try { localStorage.setItem('apple-theme', s); localStorage.setItem('lang', 'en'); } catch {} }, scheme);
      const pg = await ctx.newPage();
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await pg.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
      // Scroll through once so lazy sections mount, then bring every section into view and let its
      // Reveal finish (0.6s + delay): measuring mid-reveal reads the scale(0.985) start as a 3-12px offset.
      await pg.evaluate(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await wait(150); }
        for (const s of document.querySelectorAll('main section')) { s.scrollIntoView({ block: 'start' }); await wait(250); }
        window.scrollTo(0, 0);
      });
      await pg.waitForTimeout(1200);
      const probe = await pg.evaluate(() => {
        const frames = [...document.querySelectorAll('.frame')];
        const cs = frames[0] ? getComputedStyle(frames[0]) : null;
        const edge = frames[0] ? frames[0].getBoundingClientRect().left + parseFloat(cs.paddingLeft) : null;
        const rows = [...document.querySelectorAll('main section')].map((s) => {
          const h = s.querySelector('h1, h2');
          return { id: s.id || s.getAttribute('aria-label') || '(anon)', headLeft: h ? Math.round(h.getBoundingClientRect().left) : null };
        });
        return { edge: edge == null ? null : Math.round(edge), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, rows };
      });
      const misaligned = probe.rows.filter((r) => r.headLeft != null && probe.edge != null && Math.abs(r.headLeft - probe.edge) > 1);
      const targets = only ? only.split(',') : [null];
      for (const id of targets) {
        if (id) {
          const el = await pg.$(`#${id}, [aria-label="${id}"]`);
          if (!el) { errors.push(`section ${id} not found`); continue; }
          await el.scrollIntoViewIfNeeded();
          await pg.waitForTimeout(500);
          await el.screenshot({ path: `${out}/${id}-${w}-${scheme}.png` });
        } else {
          await pg.screenshot({ path: `${out}/page-${w}-${scheme}.png`, fullPage: full });
        }
      }
      report.push({ w, scheme, edge: probe.edge, overflow: probe.overflow, misaligned, errors });
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
console.log('@@REPORT@@' + JSON.stringify(report));
