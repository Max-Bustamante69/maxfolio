#!/usr/bin/env node
/**
 * variantes-ligeras.mjs — las variantes estrechas de las imágenes que se pintan mucho más pequeñas que su archivo (medido a 390–1440 px):
 *   public/gallery/<slug>/<vista>-desktop.webp (1200 px, se pinta a 285–404 px en un móvil) → <vista>-desktop-720.webp
 *   public/gallery/<slug>/<vista>-mobile.webp  (780 px, se pinta a ≤ 300 px en cualquier ancho)  → <vista>-mobile-400.webp
 *   public/v5/plato/scroll/<slug>-<i>.webp      (780 px, el teléfono 2D de la ficha mide 282 px)  → <slug>-<i>-520.webp
 * Las sirven ShotImg y la ficha de Plató con srcset; el original sigue siendo el candidato grande (y el del lienzo 3D).
 * Reescala con el canvas de Chromium (sin dependencias nuevas, como png-to-webp.mjs). Es idempotente: rehace todas.
 * Uso: node scripts/variantes-ligeras.mjs
 */
import { chromium } from 'playwright'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'

const CALIDAD = 0.8
const trabajos = []
for (const slug of readdirSync('public/gallery')) {
  for (const vista of ['home', 'pdp']) {
    for (const [vp, ancho] of [['desktop', 720], ['mobile', 400]]) {
      const f = `public/gallery/${slug}/${vista}-${vp}.webp`
      if (existsSync(f)) trabajos.push([f, f.replace(/\.webp$/, `-${ancho}.webp`), ancho])
    }
  }
}
for (const f of readdirSync('public/v5/plato/scroll').filter((n) => /^[a-z0-9-]+-\d\.webp$/.test(n))) { // un dígito: no vuelve a tomar las -520
  trabajos.push([`public/v5/plato/scroll/${f}`, `public/v5/plato/scroll/${f.replace(/\.webp$/, '-520.webp')}`, 520])
}

const b = await chromium.launch()
const p = await b.newPage()
let antes = 0, despues = 0
for (const [origen, destino, ancho] of trabajos) {
  const bytes = readFileSync(origen)
  const url = await p.evaluate(async ({ src, ancho, calidad }) => {
    const img = new Image()
    img.src = src
    await img.decode()
    const c = document.createElement('canvas')
    c.width = ancho
    c.height = Math.round((img.naturalHeight * ancho) / img.naturalWidth)
    const g = c.getContext('2d')
    g.imageSmoothingQuality = 'high'
    g.drawImage(img, 0, 0, c.width, c.height)
    return c.toDataURL('image/webp', calidad)
  }, { src: `data:image/webp;base64,${bytes.toString('base64')}`, ancho, calidad: CALIDAD })
  const buf = Buffer.from(url.split(',')[1], 'base64')
  writeFileSync(destino, buf)
  antes += bytes.length
  despues += buf.length
}
await b.close()
console.log(`${trabajos.length} variantes: ${Math.round(antes / 1024)} KB en los originales → ${Math.round(despues / 1024)} KB en las variantes`)
