// Sonda y captura de la dirección K · Radiografía del portafolio v5 (Max).
// Mide el DOM PÚBLICO de cada tienda (cada .shopify-section con su clave real, posición y alto; las islas React
// montadas con data-island; los elementos con data-dd-component y su caja) y hace UNA captura de página completa
// en la misma pasada, para que la medición y la imagen sean del mismo instante. Deja:
//   public/v5/k/placas/<slug>-<vista>-<vp>.webp   (escritorio: 1000 px de ancho; móvil: 390 px, 1x)
//   src/v5/k/data/radiografias.json               (manifiesto: secciones, islas, medidos, tema público, fecha)
// Uso: node capturar-radiografias.mjs [--movil] [slug ...]   (sin argumentos: todas las tiendas con radiografía, inicio a 1440)
//      --movil: solo el inicio a 390 (isMobile) de las tiendas pedidas, o de todas las que no lo tienen aún.
// Método heredado de quince/maquetas/K/sonda-nos.mjs, sonda-flota.mjs y captura-nos.mjs (2026-10-02).
import fs from 'node:fs'
import { createRequire } from 'node:module'
const { chromium } = await import('file:///C:/Users/Usuario/Desktop/P/Github/Digitdeck/node_modules/playwright-core/index.mjs')
const WT = 'C:/Users/Usuario/Desktop/P/Github/Personal/max-folio-wt-v5'
const sharp = createRequire(`file:///${WT}/package.json`)('sharp')

const TIENDAS = {
  'nos-cafe': 'https://cafesnos.com/',
  'the-gummy-box': 'https://thegummyboxwellness.com/',
  mindfuel: 'https://joinmindfuel.com/',
  nalua: 'https://naluaskincare.co/',
  sebum: 'https://www.sebumcremas.com/',
  'luxe-shine': 'https://luxeshiine.com/',
  atmosfera: 'https://atmosferatecnologica.com/',
  peluna: 'https://pelunapets.com/',
  'origen-vital': 'https://www.origenvital.com.co/',
  'para-machos': 'https://www.paramachos.us/',
  tierramont: 'https://tierramont.com/',
  'alma-de-aviador': 'https://almadeaviador.com/',
}
// NOS Café es la ficha de referencia: producto y móvil además del inicio.
const EXTRA = [
  { slug: 'nos-cafe', vista: 'pdp', vp: 'desktop', url: 'https://cafesnos.com/products/nuevo-villa-rica-unico-capsulas-de-cafe' },
  { slug: 'nos-cafe', vista: 'home', vp: 'mobile', url: 'https://cafesnos.com/' },
  { slug: 'nos-cafe', vista: 'pdp', vp: 'mobile', url: 'https://cafesnos.com/products/nuevo-villa-rica-unico-capsulas-de-cafe' },
]
const args = process.argv.slice(2)
const soloMovil = args.includes('--movil')
const pedidas = args.filter((a) => !a.startsWith('--'))
const jobs = soloMovil
  ? Object.entries(TIENDAS).filter(([slug]) => slug !== 'nos-cafe').map(([slug, url]) => ({ slug, vista: 'home', vp: 'mobile', url })).filter((j) => !pedidas.length || pedidas.includes(j.slug))
  : [
      ...Object.entries(TIENDAS).map(([slug, url]) => ({ slug, vista: 'home', vp: 'desktop', url })),
      ...EXTRA,
    ].filter((j) => !pedidas.length || pedidas.includes(j.slug))

const OUT_IMG = `${WT}/public/v5/k/placas`
const OUT_JSON = `${WT}/src/v5/k/data/radiografias.json`
fs.mkdirSync(OUT_IMG, { recursive: true })
fs.mkdirSync(`${WT}/src/v5/k/data`, { recursive: true })
const previo = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')) : { placas: {} }
const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())

const browser = await chromium.launch({ headless: true })
for (const j of jobs) {
  const movil = j.vp === 'mobile'
  const ctx = await browser.newContext({ viewport: movil ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil })
  const page = await ctx.newPage()
  const id = `${j.slug}-${j.vista}-${j.vp}`
  try {
    await page.goto(j.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3500)
    const H = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < H; y += 450) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(220) }
    await page.waitForTimeout(800)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(1500)
    // Lo flotante que no es una sección (WhatsApp, avisos, ventanas emergentes) no es parte de la página medida.
    const ocultos = await page.evaluate(() => {
      let n = 0
      for (const e of document.querySelectorAll('body *')) {
        if (getComputedStyle(e).position === 'fixed' && !e.closest('.shopify-section') && e.getBoundingClientRect().height > 0) { e.style.setProperty('display', 'none', 'important'); n++ }
      }
      return n
    })
    await page.waitForTimeout(500)
    const m = await page.evaluate(() => {
      const sy = window.scrollY
      const vis = (e) => e.getBoundingClientRect().height > 0
      const nombre = (s) => (s.id.includes('__') ? s.id.split('__')[1] : s.id.replace('shopify-section-', ''))
      const secs = [...document.querySelectorAll('.shopify-section')].filter(vis).map((s) => {
        const r = s.getBoundingClientRect()
        const islas = [...new Set([...s.querySelectorAll('[data-island]')].map((e) => e.getAttribute('data-island')))]
        if (s.hasAttribute('data-island')) islas.push(s.getAttribute('data-island'))
        const dd = [...s.querySelectorAll('[data-dd-component]')].map((e) => {
          const b = e.getBoundingClientRect()
          return { c: e.getAttribute('data-dd-component'), x: Math.round(b.left), y: Math.round(b.top + sy), w: Math.round(b.width), h: Math.round(b.height) }
        })
        return { k: nombre(s), y: Math.round(r.top + sy), h: Math.round(r.height), islas: [...new Set(islas)], dd }
      })
      const todasIslas = [...new Set([...document.querySelectorAll('[data-island]')].map((e) => e.getAttribute('data-island')))]
      const enSeccion = new Set(secs.flatMap((s) => s.islas))
      const dd = [...document.querySelectorAll('[data-dd-component]')]
      return {
        tema: window.Shopify?.theme?.name ?? null,
        esquema: window.Shopify?.theme?.schema_name ?? null,
        alto: document.documentElement.scrollHeight,
        ancho: document.documentElement.clientWidth,
        secs,
        cajones: todasIslas.filter((i) => !enSeccion.has(i)),
        nIslas: todasIslas.length,
        nMedidos: dd.length,
        nTipos: new Set(dd.map((e) => e.getAttribute('data-dd-component'))).size,
        titulo: document.title,
      }
    })
    const png = await page.screenshot({ fullPage: true })
    const meta = await sharp(png).metadata()
    const destAncho = movil ? meta.width : 1000
    const img = sharp(png).resize({ width: destAncho }).webp({ quality: movil ? 70 : 74 })
    const buf = await img.toBuffer()
    fs.writeFileSync(`${OUT_IMG}/${id}.webp`, buf)
    const info = await sharp(buf).metadata()
    previo.placas[id] = { slug: j.slug, vista: j.vista, vp: j.vp, url: j.url, fecha, ...m, titulo: undefined, img: `/v5/k/placas/${id}.webp`, imgAncho: info.width, imgAlto: info.height }
    console.log(`${id}: tema «${m.tema}» (${m.esquema}) alto ${m.alto} captura ${meta.width}x${meta.height}${meta.height !== m.alto ? '  ⚠ alto distinto' : ''} | ${m.secs.length} secciones, ${m.nIslas} islas, ${m.nMedidos} medidos | ocultos ${ocultos} | ${(buf.length / 1024).toFixed(0)} KB`)
  } catch (e) {
    console.log(`${id}: ERROR ${String(e).slice(0, 160)}`)
  }
  await ctx.close()
}
await browser.close()
fs.writeFileSync(OUT_JSON, JSON.stringify(previo))
console.log('fecha', fecha, '→', OUT_JSON)
