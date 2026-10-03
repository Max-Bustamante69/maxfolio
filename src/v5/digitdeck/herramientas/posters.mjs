// Los pósters del MB (letras y perla por separado, más el conjunto) salen de la propia escena R3F en su pose de reposo.
// Con el servidor de la dirección en marcha: node src/v5/digitdeck/herramientas/posters.mjs <puerto> [yaw]
// Dos capturas (fondo negro y blanco, sin redibujar) recuperan el alfa exacto; salida AVIF + WebP de 1200×900 en public/v5/digitdeck/mb/.
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'
const { chromium } = await import('file:///C:/Users/Usuario/Desktop/P/Github/Digitdeck/node_modules/playwright-core/index.mjs')

const puerto = process.argv[2] ?? '5315'
const yaw = process.argv[3] ?? '-10'
const W = 1200
const H = 900
const salida = 'public/v5/digitdeck/mb'
mkdirSync(salida, { recursive: true })

const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11'] })
try {
  for (const [capa, nombre] of [['letras', 'mb-letras'], ['perla', 'mb-perla'], ['todo', 'mb-conjunto']]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 })
    await page.goto(`http://localhost:${puerto}/src/v5/digitdeck/herramientas/poster.html?yaw=${yaw}&capa=${capa}&bg=black`, { waitUntil: 'domcontentloaded', timeout: 180000 })
    await page.waitForSelector('[data-mb="3d"]', { timeout: 90000 })
    await page.waitForTimeout(900)
    const caja = await (await page.$('[data-mb]')).boundingBox()
    const clip = { x: Math.round(caja.x), y: Math.round(caja.y), width: W, height: H }
    const enNegro = await page.screenshot({ clip })
    await page.evaluate(() => { document.body.style.background = 'white' })
    await page.waitForTimeout(250)
    const enBlanco = await page.screenshot({ clip })
    const raw = (png) => sharp(png).removeAlpha().raw().toBuffer()
    const [b, w] = await Promise.all([raw(enNegro), raw(enBlanco)])
    const rgba = Buffer.alloc(W * H * 4)
    for (let i = 0, o = 0; i < W * H * 3; i += 3, o += 4) {
      const d = (w[i] - b[i] + (w[i + 1] - b[i + 1]) + (w[i + 2] - b[i + 2])) / 3
      const a = Math.min(1, Math.max(0, 1 - d / 255))
      if (a < 1 / 255) continue
      rgba[o] = Math.min(255, Math.round(b[i] / a))
      rgba[o + 1] = Math.min(255, Math.round(b[i + 1] / a))
      rgba[o + 2] = Math.min(255, Math.round(b[i + 2] / a))
      rgba[o + 3] = Math.round(a * 255)
    }
    const img = () => sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    await img().avif({ quality: 55, effort: 6 }).toFile(`${salida}/${nombre}.avif`)
    await img().webp({ quality: 82, alphaQuality: 100 }).toFile(`${salida}/${nombre}.webp`)
    console.log(`${nombre} (yaw ${yaw})`)
    await page.close()
  }
} finally {
  await browser.close()
}
