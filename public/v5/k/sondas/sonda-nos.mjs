import fs from 'node:fs';
const { chromium } = await import('file:///C:/Users/Usuario/Desktop/P/Github/Digitdeck/node_modules/playwright-core/index.mjs');
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('https://cafesnos.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3500);
// scroll through the page to trigger lazy content
const H = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(250); }
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
  const vis = (e) => e.getBoundingClientRect().height > 0;
  const sy = window.scrollY;
  const secs = [...document.querySelectorAll('.shopify-section')].filter(vis).map((s) => {
    const r = s.getBoundingClientRect();
    const isl = [...new Set([...s.querySelectorAll('[data-island]')].map((e) => e.getAttribute('data-island')))];
    if (s.hasAttribute('data-island')) isl.push(s.getAttribute('data-island'));
    const dd = [...s.querySelectorAll('[data-dd-component]')].map((e) => { const b = e.getBoundingClientRect(); return { c: e.getAttribute('data-dd-component'), x: Math.round(b.left), y: Math.round(b.top + sy), w: Math.round(b.width), h: Math.round(b.height) }; });
    return { k: s.id.includes('__') ? s.id.split('__')[1] : s.id.replace('shopify-section-', ''), y: Math.round(r.top + sy), h: Math.round(r.height), islas: isl, dd };
  });
  const ddAll = [...document.querySelectorAll('[data-dd-component]')].map((e) => ({ c: e.getAttribute('data-dd-component'), inSection: !!e.closest('.shopify-section') }));
  return { theme: window.Shopify?.theme?.name, docH: document.documentElement.scrollHeight, secs, ddAll, fecha: new Date().toISOString() };
});
fs.writeFileSync('nos-home-manifiesto.json', JSON.stringify(data, null, 1));
await page.screenshot({ path: 'assets/nos-home-full.png', fullPage: true });
console.log(data.theme, data.docH, data.secs.length, data.ddAll.length);
for (const s of data.secs) console.log(s.k, s.y, s.h, s.islas.join('|'), s.dd.length);
await browser.close();
