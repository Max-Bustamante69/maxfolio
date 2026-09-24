// Round 47 before/after: the same viewport shots of production (before) and a local build (after).
//   node scripts/before-after.mjs --dist .check/final --port 4432 --out shots/r47-ba
import { spawn } from 'child_process';
import { mkdirSync, readFileSync } from 'fs';
import { chromium } from 'playwright';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const dist = arg('dist', 'dist');
const port = Number(arg('port', '4432'));
const out = arg('out', 'shots/r47-ba');
mkdirSync(out, { recursive: true });

// vite runs as a direct child (no shell), so server.kill() stops it instead of orphaning it on the port.
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--outDir", dist, "--port", String(port), "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 3500));
// Refuse to shoot a stale server: the page on the port must be this build.
const served = await fetch(`http://localhost:${port}/`).then((r) => r.text()).catch(() => "");
if (served !== readFileSync(`${dist}/index.html`, "utf8")) { server.kill(); throw new Error(`port ${port} is not serving ${dist}`); }

// Section to frame after the hero: the manifesto band before, its replacement after.
const shots = [
  { name: 'hero', target: null },
  { name: 'kit', target: { before: 'section[aria-label="What every build does"]', after: '#build-kit' } },
  { name: 'gallery', target: { before: '#gallery', after: '#gallery' } },
];
const sites = { before: 'https://maxfolio.dev/', after: `http://localhost:${port}/` };
const browser = await chromium.launch();
const found = [];
try {
  for (const [when, url] of Object.entries(sites)) {
    for (const w of [1440, 390]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(() => { try { localStorage.setItem('apple-theme', 'light'); localStorage.setItem('lang', 'en'); } catch {} });
      const pg = await ctx.newPage();
      await pg.goto(url, { waitUntil: 'networkidle' });
      await pg.evaluate(async () => { const wait = (ms) => new Promise((r) => setTimeout(r, ms)); for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await wait(150); } for (const n of document.querySelectorAll("main section")) { n.scrollIntoView({ block: "start" }); await wait(250); } window.scrollTo(0, 0); });
      await pg.waitForTimeout(1200);
      for (const s of shots) {
        const vh = w < 800 ? 844 : 900;
        if (s.target) {
          // The page scrolls through Lenis, which fights programmatic scrolls; clip the full-page
          // render at the section's document offset instead (the scroll-through above already fired its reveals).
          const el = await pg.$(s.target[when]);
          found.push({ when, w, shot: s.name, found: !!el });
          if (!el) continue;
          const top = await el.evaluate((n) => Math.round(n.getBoundingClientRect().top + window.scrollY));
          await pg.screenshot({ path: `${out}/${s.name}-${w}-${when}.png`, fullPage: true, clip: { x: 0, y: top, width: w, height: vh } });
          continue;
        }
        await pg.evaluate(() => window.scrollTo(0, 0));
        await pg.waitForTimeout(1500);
        await pg.screenshot({ path: `${out}/${s.name}-${w}-${when}.png` });
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(JSON.stringify(found));
