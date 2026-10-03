import fs from 'node:fs';
const { chromium } = await import('file:///C:/Users/Usuario/Desktop/P/Github/Digitdeck/node_modules/playwright-core/index.mjs');
const stores = [
 ['the-gummy-box','The Gummy Box','https://thegummyboxwellness.com/'],
 ['mindfuel','Mindfuel','https://joinmindfuel.com/'],
 ['nalua','Nalua Skincare','https://naluaskincare.co/'],
 ['sebum','Sebum','https://www.sebumcremas.com/'],
 ['valdo-cafe','Valdo Café','https://valdocafe.co/'],
 ['factores-2x2','Factores 2x2','https://factoresdetransferenciaacc.com.co/'],
 ['luxe-shine','Luxe Shine','https://luxeshiine.com/'],
 ['atmosfera','Atmósfera Tecnológica','https://atmosferatecnologica.com/'],
 ['saint-theory','Saint Theory','https://www.saint-theory.com/'],
 ['peluna','Peluna Pets','https://pelunapets.com/'],
 ['origen-vital','Origen Vital','https://www.origenvital.com.co/'],
 ['para-machos','Para Machos','https://www.paramachos.us/'],
 ['tierramont','TierraMont','https://tierramont.com/'],
 ['alma-de-aviador','Alma de Aviador','https://almadeaviador.com/'],
];
const browser = await chromium.launch({ headless: true });
const out = {};
for (const [slug, name, url] of stores) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    out[slug] = await page.evaluate(() => {
      const vis = (e) => e.getBoundingClientRect().height > 0;
      const secs = [...document.querySelectorAll('.shopify-section')].filter(vis).map((s) => ({ k: s.id.includes('__') ? s.id.split('__')[1] : s.id.replace('shopify-section-', ''), h: Math.round(s.getBoundingClientRect().height) }));
      const islands = [...new Set([...document.querySelectorAll('[data-island]')].map((e) => e.getAttribute('data-island')))];
      const dd = [...document.querySelectorAll('[data-dd-component]')].length;
      return { theme: window.Shopify?.theme?.name, schema: window.Shopify?.theme?.schema_name, docH: document.documentElement.scrollHeight, secs, nIslas: islands.length, nDD: dd };
    });
    out[slug].name = name; out[slug].url = url;
  } catch (e) { out[slug] = { name, error: String(e).slice(0, 120) }; }
  await ctx.close();
  const o = out[slug];
  console.log(slug, o.error || `${o.theme} | ${o.schema} | docH ${o.docH} | sec ${o.secs.length} | islas ${o.nIslas} | dd ${o.nDD}`);
}
await browser.close();
fs.writeFileSync('flota-home.json', JSON.stringify(out, null, 1));
