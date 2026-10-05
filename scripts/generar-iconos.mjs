// Iconos del sitio a partir de la marca «Bloque» (src/themes/shared/MarcaMB.tsx). Uso: node scripts/generar-iconos.mjs
//   public/favicon.svg          la marca, tinta según el tema claro u oscuro del navegador
//   public/favicon.ico          16, 32 y 48 px: placa oscura con la marca clara (se lee sobre cualquier fondo)
//   public/apple-touch-icon.png 180 px: la misma placa a sangre (iOS redondea las esquinas)
//   public/og-image.png         1200 × 630: la tarjeta al compartir (marca, nombre, rol y dominio), sobre el grafito de Plató
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

const TRAZO = 'M3 4H9.85L16 10.3H10.84V28H3ZM22.15 4H29V28H16.62A5.135 5.135 0 0 0 16.62 17.73H17.51A3.715 3.715 0 0 0 17.51 10.3H16Z'
const TINTA = '#111316'
const PAPEL = '#eceef0'

// Caja cuadrada de 27 centrada en el bloque (26 × 24): la marca llena la pestaña sin tocar el borde.
writeFileSync('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2.5 2.5 27 27"><style>path{fill:${TINTA}}@media (prefers-color-scheme:dark){path{fill:${PAPEL}}}</style><path d="${TRAZO}"/></svg>\n`)

// La placa: la marca ocupa el 62 % del lado, centrada ópticamente en el bloque.
const placa = (lado, radio) => `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 32 32"><rect width="32" height="32" rx="${radio}" fill="${TINTA}"/><g transform="translate(16 16) scale(0.62) translate(-16 -16)"><path fill="${PAPEL}" d="${TRAZO}"/></g></svg>`

const b = await chromium.launch()
const p = await b.newPage({ deviceScaleFactor: 1 })
const png = async (svg, lado) => {
  await p.setViewportSize({ width: lado, height: lado })
  await p.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`)
  return p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: lado, height: lado } })
}
writeFileSync('public/apple-touch-icon.png', await png(placa(180, 0), 180))
const tamanos = [16, 32, 48]
const imagenes = []
for (const t of tamanos) imagenes.push(await png(placa(t, 6), t))

// Tarjeta para redes: Host Grotesk local (la misma que Plató), sin cifras ni promesas, solo quién y dónde.
const fuente = readFileSync('public/fonts/plato/host-grotesk-latin.woff2').toString('base64')
await p.setViewportSize({ width: 1200, height: 630 })
await p.setContent(`<style>
@font-face{font-family:HG;src:url(data:font/woff2;base64,${fuente}) format('woff2');font-weight:300 800}
html,body{margin:0}
.t{width:1200px;height:630px;box-sizing:border-box;padding:76px 84px;background:#0a0b0d;color:#edeef0;font-family:HG,sans-serif;display:grid;grid-template-rows:1fr auto;position:relative}
.t svg{width:150px;height:auto;display:block}
.n{font-size:92px;line-height:1;font-weight:500;letter-spacing:-0.035em;margin:0}
.r{font-size:32px;line-height:1.3;color:rgb(237 238 240 / .66);margin:18px 0 0;letter-spacing:-0.01em}
.d{position:absolute;right:84px;bottom:84px;font-size:28px;color:#f2b04e;letter-spacing:-0.01em}
</style><div class="t"><svg viewBox="3 4 26 24"><path fill="#edeef0" d="${TRAZO}"/></svg><div><p class="n">Max Bustamante</p><p class="r">CTO &amp; Shopify Tech Lead · Medellín, Colombia</p></div><span class="d">maxfolio.dev</span></div>`)
await p.evaluate(() => document.fonts.ready)
writeFileSync('public/og-image.png', await p.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } }))
await b.close()

// ICO con entradas PNG: cabecera de 6 bytes, 16 por entrada y luego los PNG tal cual.
const cab = Buffer.alloc(6 + 16 * imagenes.length)
cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(imagenes.length, 4)
let desplazamiento = cab.length
imagenes.forEach((img, i) => {
  const o = 6 + i * 16
  cab.writeUInt8(tamanos[i] % 256, o); cab.writeUInt8(tamanos[i] % 256, o + 1)
  cab.writeUInt8(0, o + 2); cab.writeUInt8(0, o + 3); cab.writeUInt16LE(1, o + 4); cab.writeUInt16LE(32, o + 6)
  cab.writeUInt32LE(img.length, o + 8); cab.writeUInt32LE(desplazamiento, o + 12)
  desplazamiento += img.length
})
writeFileSync('public/favicon.ico', Buffer.concat([cab, ...imagenes]))
console.log('iconos: favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180), og-image.png (1200×630)')
