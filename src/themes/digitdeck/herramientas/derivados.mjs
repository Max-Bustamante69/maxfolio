// Derivados ligeros de las capturas reales de public/gallery (la fuente no se toca):
//  - mini/<slug>.webp  480×300  (home-desktop): miniatura de la fila del índice en móvil
//  - cinta/<slug>.webp 366×792  (home-mobile): ventana de la cinta del hero (alto 396 px a 2×)
// Uso: node src/v5/digitdeck/herramientas/derivados.mjs
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import sharp from 'sharp'

const origen = 'public/gallery'
const salida = 'public/v5/digitdeck'
mkdirSync(`${salida}/mini`, { recursive: true })
mkdirSync(`${salida}/cinta`, { recursive: true })
let n = 0
// audit-dashboard: su captura es un informe de cliente (v5/data.ts lo deja sin vistas), así que no se deriva.
for (const slug of readdirSync(origen, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'audit-dashboard').map((d) => d.name)) {
  const desktop = `${origen}/${slug}/home-desktop.webp`
  const movil = `${origen}/${slug}/home-mobile.webp`
  if (existsSync(desktop)) await sharp(desktop).resize(480, 300, { fit: 'cover', position: 'top' }).webp({ quality: 70 }).toFile(`${salida}/mini/${slug}.webp`), n++
  if (existsSync(movil)) await sharp(movil).resize(366, 792, { fit: 'cover', position: 'top' }).webp({ quality: 68 }).toFile(`${salida}/cinta/${slug}.webp`), n++
}
console.log(`${n} derivados`)
