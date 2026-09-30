// Genera el póster `apple-oscuro` del monograma MB: una captura de la propia gemela en tiempo real (con el `realce` que
// FirmaHero le da sobre negro) en su pose de reposo, con alfa. Es una derivación declarada, no un render de Cycles: sirve
// para que el póster (móviles, scroll rápido, instante previo al 3D) y la gemela sean el mismo dibujo. Se regenera si cambia
// `REALCE_OSCURO` (FirmaHero.tsx), la luz del estudio (`estudio.tsx`) o el GLB.
//   bun run build && node scripts/poster-realce.mjs [--port 4423]
//   → public/3d/monograma-mb/apple-oscuro-1200.{avif,webp}   (después: bun run build para que `dist/` los lleve)
// Cómo: la vista 3D se saca de la página (tema oscuro, hero de `/`), se agranda a 1200x900 (el tamaño del póster) y se
// captura dos veces, sobre negro y sobre blanco, SIN redibujar el lienzo (solo cambia el fondo CSS que hay debajo):
//   fondo negro  B = a·C            fondo blanco  W = a·C + (1-a)·255   →   a = 1 - (W-B)/255,  C = B / a
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
import sharp from 'sharp'

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const port = Number(arg('port', '4423'))
const DIR = 'public/3d/monograma-mb'
const W = 1200
const H = 900

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--outDir', 'dist', '--port', String(port), '--strictPort'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 3000))
const browser = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11'] })
try {
  const ctx = await browser.newContext({ viewport: { width: W + 100, height: H + 100 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${port}/?3d=1`, { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: /dark mode/i }).first().click()
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo(0, 0))
  // Fuera lo que no es la pieza (nav, riel, halo) y la caja de la firma a 1200x900 fija en la esquina.
  await page.addStyleTag({
    content: `nav, .scroll-rail, .firma-hero__caja::before { display: none !important }
      .firma-hero__caja { position: fixed !important; left: 50px !important; top: 50px !important; right: auto !important; width: ${W}px !important; z-index: 31 }`,
  })
  await page.mouse.move(2, 2)
  await page.waitForFunction(() => document.querySelector('[data-pieza3d=monograma-mb]')?.dataset.estado3d === '3d', null, { timeout: 30000 })
  await page.waitForTimeout(12500) // la flotación se asienta en la pose del póster
  // Tapa de color entre el contenido (z < 30) y el lienzo (z 30); lo fijo con z-index alto y ajeno al lienzo se esconde.
  await page.evaluate(() => {
    for (const e of document.querySelectorAll('body *')) {
      const s = getComputedStyle(e)
      if (s.position === 'fixed' && !e.closest('[data-escena3d]') && !e.classList.contains('firma-hero__caja') && !e.closest('.firma-hero__caja')) e.style.display = 'none'
    }
    const t = document.createElement('div')
    t.id = 'tapa-poster'
    t.style.cssText = 'position:fixed;inset:0;z-index:29;background:#000'
    document.body.appendChild(t)
  })
  const clip = { x: 50, y: 50, width: W, height: H }
  const enNegro = await page.screenshot({ clip })
  await page.evaluate(() => { document.getElementById('tapa-poster').style.background = '#fff' })
  await page.waitForTimeout(300)
  const enBlanco = await page.screenshot({ clip })
  const estado = await page.evaluate(() => document.querySelector('[data-pieza3d=monograma-mb]')?.dataset.estado3d)
  if (estado !== '3d') throw new Error(`la pieza no estaba en 3D al capturar (${estado})`)

  const raw = async (png) => (await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true }))
  const b = await raw(enNegro)
  const w = await raw(enBlanco)
  if (b.info.width !== W || b.info.height !== H) throw new Error(`captura de ${b.info.width}x${b.info.height}, se esperaba ${W}x${H}`)
  const out = Buffer.alloc(W * H * 4)
  let cubiertos = 0
  for (let i = 0, o = 0; i < W * H * 3; i += 3, o += 4) {
    const d = ((w.data[i] - b.data[i]) + (w.data[i + 1] - b.data[i + 1]) + (w.data[i + 2] - b.data[i + 2])) / 3
    const a = Math.min(1, Math.max(0, 1 - d / 255))
    if (a < 1 / 255) continue
    out[o] = Math.min(255, Math.round(b.data[i] / a))
    out[o + 1] = Math.min(255, Math.round(b.data[i + 1] / a))
    out[o + 2] = Math.min(255, Math.round(b.data[i + 2] / a))
    out[o + 3] = Math.round(a * 255)
    if (a > 0.5) cubiertos++
  }
  const img = () => sharp(out, { raw: { width: W, height: H, channels: 4 } })
  await img().webp({ quality: 82, alphaQuality: 100 }).toFile(`${DIR}/apple-oscuro-1200.webp`)
  await img().avif({ quality: 55, effort: 6 }).toFile(`${DIR}/apple-oscuro-1200.avif`)
  console.log(`apple-oscuro-1200: ${cubiertos} px con alfa > 0.5 (${((cubiertos / (W * H)) * 100).toFixed(1)} %)`)
} finally {
  await browser.close()
  server.kill()
}
