// QA del 3D (`?3d=1`): paridad póster vs gemela en tiempo real + compuertas de carga. Chromium con GPU real.
//   bun run build && node scripts/qa-3d.mjs [--out shots/3d] [--port 4421] [--dpr 1] [--width 1480]
// Comprueba, contra `vite preview` de `dist/`:
//   1. Sin ?3d=1: cero peticiones de src/three y de three (el sitio no cambia).
//   2. Con ?3d=1 y sin ninguna <Pieza3D> (home): solo el chunk `arrancar`; three NO se descarga.
//   3. prefers-reduced-motion / gama baja (deviceMemory 2) / Save-Data: laboratorio con pósters y nada de three.
//   4. Laboratorio (?3d=1&lab&forzar): un único <canvas> WebGL, cada tarjeta 3D dibuja su vista y se compara con
//      su póster (diferencia media de píxeles y de luminancia en la zona con contenido), sin errores de consola.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import sharp from 'sharp'

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const out = arg('out', 'shots/3d')
const port = Number(arg('port', '4421'))
const dpr = Number(arg('dpr', '1'))
const width = Number(arg('width', '1480'))
mkdirSync(out, { recursive: true })

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--outDir', 'dist', '--port', String(port), '--strictPort'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 3000))
const base = `http://localhost:${port}`
const GPU = ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11']
const browser = await chromium.launch({ headless: true, args: GPU })
const informe = { gl: null, compuertas: {}, tarjetas: [], errores: [] }
const es3d = (u) => /\/assets\/(View|Pieza3DVista|Escena3D|Laboratorio3D|monograma-mb|orbita-tiendas|objetos-feature|relieve-medellin|dispositivos)-/.test(u)

async function pagina(ctxOpts = {}, init) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr, ...ctxOpts })
  if (init) await ctx.addInitScript(init)
  const page = await ctx.newPage()
  const peticiones = []
  page.on('request', (r) => peticiones.push(r.url()))
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') informe.errores.push(`[${m.type()}] ${m.text()}`) })
  page.on('pageerror', (e) => informe.errores.push(`[pageerror] ${e.message}`))
  return { ctx, page, peticiones }
}

try {
  // 1. Sin flag
  {
    const { ctx, page, peticiones } = await pagina()
    await page.goto(`${base}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    informe.compuertas.sinFlag = {
      chunks3d: peticiones.filter(es3d).length,
      dataset: await page.evaluate(() => document.documentElement.dataset.fase3d ?? null),
      canvasEscena: await page.evaluate(() => document.querySelectorAll('[data-escena3d]').length),
    }
    await ctx.close()
  }
  // 2. Con flag, sin piezas en la página
  {
    const { ctx, page, peticiones } = await pagina()
    await page.goto(`${base}/?3d=1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    informe.compuertas.flagSinPiezas = {
      chunks3d: peticiones.filter(es3d).map((u) => u.split('/').pop()),
      fase: await page.evaluate(() => document.documentElement.dataset.fase3d ?? null),
      persistido: await page.evaluate(() => localStorage.getItem('maxfolio:3d')),
    }
    // el interruptor persiste: sin parámetro sigue activo; ?3d=0 lo apaga y lo borra
    await page.goto(`${base}/luxury`, { waitUntil: 'networkidle' })
    informe.compuertas.flagSinPiezas.fasePersistida = await page.evaluate(() => document.documentElement.dataset.fase3d ?? null)
    await page.goto(`${base}/?3d=0`, { waitUntil: 'networkidle' })
    informe.compuertas.flagSinPiezas.trasApagar = await page.evaluate(() => [document.documentElement.dataset.fase3d ?? null, localStorage.getItem('maxfolio:3d')])
    await ctx.close()
  }
  // 3. Compuertas de gama baja / accesibilidad (el laboratorio pinta pósters y NO descarga three)
  for (const [nombre, opts, init] of [
    ['reduced-motion', { reducedMotion: 'reduce' }, undefined],
    ['memoria-2GB', {}, () => Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 })],
    ['save-data', {}, () => Object.defineProperty(navigator, 'connection', { get: () => ({ saveData: true, effectiveType: '4g' }) })],
  ]) {
    const { ctx, page, peticiones } = await pagina(opts, init)
    await page.goto(`${base}/?3d=1&lab`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    informe.compuertas[nombre] = {
      fase: await page.evaluate(() => document.documentElement.dataset.fase3d),
      three: peticiones.filter((u) => /\/assets\/(View|Pieza3DVista|Escena3D)-/.test(u)).length,
      postersPintados: await page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth > 0 && i.closest('[data-pieza3d]')).length),
      canvas: await page.evaluate(() => document.querySelectorAll('canvas').length),
    }
    await ctx.close()
  }
  // 4. Laboratorio con GPU
  const { ctx, page, peticiones } = await pagina()
  const t0 = Date.now()
  await page.goto(`${base}/?3d=1&lab&forzar`, { waitUntil: 'load' })
  await page.waitForSelector('html[data-fase3d="lista"]', { timeout: 30000 })
  informe.gl = await page.evaluate(() => document.documentElement.dataset.gl3d)
  informe.msHastaEscenaLista = Date.now() - t0
  const tarjetas = await page.$$('[data-lab-item]')
  const media = (b) => { let s = 0; for (let i = 0; i < b.length; i++) s += b[i]; return s / b.length }
  for (const [i, t] of tarjetas.entries()) {
    const nombre = await t.getAttribute('data-lab-item')
    await t.scrollIntoViewIfNeeded()
    await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), t)
    const caja3d = await t.$('[data-col="3d"] [data-pieza3d]')
    // espera a que la vista dibuje (o a que se confirme que esa variante es solo póster)
    const soloPoster = /solo póster/.test((await t.innerText()).slice(0, 120))
    if (!soloPoster) await page.waitForFunction((el) => el.dataset.estado3d === '3d', caja3d, { timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(700) // fundido del póster (450 ms) + margen
    const estado = await caja3d.getAttribute('data-estado3d')
    const bp = await (await t.$('[data-col="poster"] [data-pieza3d]')).boundingBox()
    const b3 = await caja3d.boundingBox()
    const png = await page.screenshot({ clip: await t.boundingBox() })
    const f = `${out}/tarjeta-${String(i).padStart(2, '0')}-${nombre.replace(/[^a-z0-9]+/gi, '_')}.png`
    writeFileSync(f, png)
    const clip = (b) => ({ left: Math.round(b.x * dpr), top: Math.round(b.y * dpr), width: Math.round(b.width * dpr), height: Math.round(b.height * dpr) })
    const shot = await page.screenshot()
    const a = await sharp(shot).extract(clip(bp)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const b = await sharp(shot).extract(clip(b3)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const n = Math.min(a.data.length, b.data.length)
    const bg = [8, 9, 12]
    let suma = 0, cont = 0, lumA = 0, lumB = 0, difC = 0
    for (let p = 0; p + 2 < n; p += 3) {
      const d = (Math.abs(a.data[p] - b.data[p]) + Math.abs(a.data[p + 1] - b.data[p + 1]) + Math.abs(a.data[p + 2] - b.data[p + 2])) / 3
      suma += d
      const ca = Math.max(...[0, 1, 2].map((k) => Math.abs(a.data[p + k] - bg[k])))
      const cb = Math.max(...[0, 1, 2].map((k) => Math.abs(b.data[p + k] - bg[k])))
      if (ca > 10 || cb > 10) {
        cont++
        difC += d
        lumA += 0.2126 * a.data[p] + 0.7152 * a.data[p + 1] + 0.0722 * a.data[p + 2]
        lumB += 0.2126 * b.data[p] + 0.7152 * b.data[p + 1] + 0.0722 * b.data[p + 2]
      }
    }
    informe.tarjetas.push({
      pieza: nombre, estado, soloPoster,
      difMediaCaja: +(suma / (n / 3)).toFixed(2),
      difMediaContenido: cont ? +(difC / cont).toFixed(2) : 0,
      luminanciaPoster: cont ? +(lumA / cont).toFixed(1) : 0,
      luminancia3d: cont ? +(lumB / cont).toFixed(1) : 0,
      pixelesContenido: cont, archivo: f,
    })
  }
  informe.canvasWebgl = await page.evaluate(() => document.querySelectorAll('[data-escena3d] canvas').length)
  informe.canvasTotales = await page.evaluate(() => document.querySelectorAll('canvas').length)
  informe.chunks3dPedidos = peticiones.filter(es3d).map((u) => u.split('/').pop())
  informe.glbPedidos = peticiones.filter((u) => /\.(glb|hdr|webp|wasm)$/.test(u) && !/\/3d\/.*-(1200|2400|600)\.webp$/.test(u)).map((u) => u.split('/').slice(-2).join('/'))
  await ctx.close()

  // 5. Comportamiento: frameloop "demand" (cuadros dibujados en reposo), animar, interactiva y progreso.
  {
    const c5 = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr })
    await c5.addInitScript(() => {
      window.__draws = 0
      const P = WebGL2RenderingContext.prototype
      for (const fn of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const o = P[fn]
        P[fn] = function (...a) { window.__draws++; return o.apply(this, a) }
      }
    })
    const p5 = await c5.newPage()
    p5.on('pageerror', (e) => informe.errores.push(`[pageerror] ${e.message}`))
    await p5.goto(`${base}/?3d=1&lab&forzar`, { waitUntil: 'load' })
    await p5.waitForSelector('html[data-fase3d="lista"]', { timeout: 30000 })
    const sel = (n) => `[data-lab-item="${n}"]`
    const ir = async (n) => {
      const t = await p5.$(sel(n))
      await p5.evaluate((el) => el.scrollIntoView({ block: 'center' }), t)
      await p5.waitForFunction((q) => document.querySelector(q + ' [data-col="3d"] [data-pieza3d]')?.dataset.estado3d === '3d', sel(n), { timeout: 20000 })
      await p5.waitForTimeout(800)
      return t
    }
    const dibujos = async (ms) => { await p5.evaluate(() => { window.__draws = 0 }); await p5.waitForTimeout(ms); return p5.evaluate(() => window.__draws) }
    const cajaPng = async (t, col) => {
      const b = await (await t.$(`[data-col="${col}"] [data-pieza3d]`)).boundingBox()
      return sharp(await p5.screenshot()).extract({ left: Math.round(b.x * dpr), top: Math.round(b.y * dpr), width: Math.round(b.width * dpr), height: Math.round(b.height * dpr) }).removeAlpha().raw().toBuffer()
    }
    const dif = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return +(s / a.length).toFixed(2) }
    const check = async (cual) => (await p5.$$('input[type="checkbox"]'))[cual === 'interactiva' ? 0 : 1]
    const rango = (v) => p5.$eval('input[type="range"]', (el, val) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, val); el.dispatchEvent(new Event('input', { bubbles: true })) }, v)
    const contenido = (buf) => { let n = 0; for (let i = 0; i + 2 < buf.length; i += 3) if (Math.max(Math.abs(buf[i] - 8), Math.abs(buf[i + 1] - 9), Math.abs(buf[i + 2] - 12)) > 24) n++; return n }
    const comp = {}
    const t1 = await ir('monograma-mb · apple')
    comp.dibujosEn2sEstatico = await dibujos(2000)
    await (await check('animar')).check()
    comp.dibujosEn1sAnimando = await dibujos(1000)
    const a1 = await cajaPng(t1, '3d')
    await p5.waitForTimeout(700)
    comp.difMonogramaFlotando = dif(a1, await cajaPng(t1, '3d'))
    await (await check('animar')).uncheck()
    await p5.waitForTimeout(600)
    comp.dibujosEn2sTrasApagarAnimar = await dibujos(2000)
    // interactiva: el puntero a izquierda y a derecha del quiz debe inclinar la pieza
    await (await check('interactiva')).check()
    const tq = await ir('objetos-feature · quiz')
    const bq = await (await tq.$('[data-col="3d"] [data-pieza3d]')).boundingBox()
    await p5.mouse.move(bq.x + bq.width * 0.1, bq.y + bq.height * 0.5, { steps: 4 })
    await p5.waitForTimeout(900)
    const q1 = await cajaPng(tq, '3d')
    await p5.mouse.move(bq.x + bq.width * 0.9, bq.y + bq.height * 0.5, { steps: 4 })
    await p5.waitForTimeout(900)
    comp.difQuizPunteroIzqDer = dif(q1, await cajaPng(tq, '3d'))
    await p5.waitForTimeout(2500) // el resorte del tilt se asienta
    comp.dibujosEn2sQuietoTrasPuntero = await dibujos(2000)
    await p5.mouse.move(5, 5)
    await p5.waitForTimeout(900)
    // progreso de la órbita: al 40 % la flota está menos abierta que al 100 %
    const to = await ir('orbita-tiendas')
    comp.orbitaPixelesProgreso100 = contenido(await cajaPng(to, '3d'))
    await rango('0.4')
    await p5.waitForTimeout(900)
    comp.orbitaPixelesProgreso40 = contenido(await cajaPng(to, '3d'))
    await rango('1')
    await p5.waitForTimeout(900)
    // hover sobre las cuentas (interactiva): barrido por filas; la perla (violeta) debe cambiar de cuenta y volver al salir
    const ob = await (await to.$('[data-col="3d"] [data-pieza3d]')).boundingBox()
    const perla = async () => {
      const w = Math.round(ob.width * dpr)
      const buf = await sharp(await p5.screenshot()).extract({ left: Math.round(ob.x * dpr), top: Math.round(ob.y * dpr), width: w, height: Math.round(ob.height * dpr) }).removeAlpha().raw().toBuffer()
      let sx = 0, sy = 0, n = 0
      for (let i = 0; i + 2 < buf.length; i += 3) if (buf[i + 2] > 150 && buf[i] > 60 && buf[i] < 160 && buf[i + 1] < 90) { const px = i / 3; sx += px % w; sy += Math.floor(px / w); n++ }
      return n ? `${Math.round(sx / n)},${Math.round(sy / n)}` : 'sin-perla'
    }
    let ultima = await perla()
    let cambios = 0
    for (let fy = 0.1; fy < 0.95; fy += 0.08) {
      for (let fx = 0.1; fx < 0.9; fx += 0.02) await p5.mouse.move(ob.x + ob.width * fx, ob.y + ob.height * fy)
      await p5.waitForTimeout(250)
      const v = await perla()
      if (v !== ultima) { cambios++; ultima = v }
    }
    comp.cambiosDePerlaAlBarrerLaOrbita = cambios
    informe.comportamiento = comp
    await p5.screenshot({ path: `${out}/comportamiento-orbita.png` })
    await c5.close()
  }
} finally {
  await browser.close()
  server.kill()
}
writeFileSync(`${out}/informe.json`, JSON.stringify(informe, null, 2))
console.log(JSON.stringify({ ...informe, tarjetas: undefined }, null, 2))
console.table(informe.tarjetas.map(({ archivo: _a, ...r }) => r))
