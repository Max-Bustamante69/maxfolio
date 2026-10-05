#!/usr/bin/env node
/**
 * franjas-520.mjs — la variante de 520 px de ancho de cada franja de recorrido (public/v5/plato/scroll/<slug>-<i>.webp →
 * <slug>-<i>-520.webp) para el teléfono 2D de la ficha de Plató: su pantalla mide 282 px CSS, así que a DPR ≤ 1,84 la de
 * 780 px baja el doble de bytes para nada (la franja 0 es el LCP móvil de la ficha). El lienzo 3D sigue usando la de 780.
 * Reescala con el canvas de Chromium (sin dependencias nuevas, como png-to-webp.mjs). Uso: node scripts/franjas-520.mjs
 */
import { chromium } from 'playwright'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const DIR = 'public/v5/plato/scroll'
const ANCHO = 520
const CALIDAD = 0.8
const fuentes = readdirSync(DIR).filter((f) => /^[a-z0-9-]+-\d+\.webp$/.test(f))
const b = await chromium.launch()
const p = await b.newPage()
let antes = 0, despues = 0
for (const f of fuentes) {
  const src = `data:image/webp;base64,${readFileSync(`${DIR}/${f}`).toString('base64')}`
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
  }, { src, ancho: ANCHO, calidad: CALIDAD })
  const buf = Buffer.from(url.split(',')[1], 'base64')
  writeFileSync(`${DIR}/${f.replace(/\.webp$/, `-${ANCHO}.webp`)}`, buf)
  antes += readFileSync(`${DIR}/${f}`).length
  despues += buf.length
}
await b.close()
console.log(`${fuentes.length} franjas: ${Math.round(antes / 1024)} KB a 780 px → ${Math.round(despues / 1024)} KB a ${ANCHO} px`)
