// Niveles de detalle de la Mesa de luz (dirección C), derivados de public/gallery con sharp.
//   LOD 0: 320 px (escritorio) / 150 px (móvil) · LOD 1: 720 / 360 px · LOD 2: el WebP original (no se copia).
// Uso: node src/v5/c/shots-lod.mjs        (idempotente: salta lo que ya existe y es más nuevo que su fuente)
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const galeria = join(raiz, 'public', 'gallery')
const salida = join(raiz, 'public', 'v5', 'c')
const ANCHOS = { 0: { desktop: 320, mobile: 150 }, 1: { desktop: 720, mobile: 360 } }
const VISTAS = ['home-desktop', 'pdp-desktop', 'home-mobile', 'pdp-mobile']

let hechas = 0
let bytes = 0
for (const slug of readdirSync(galeria)) {
  if (slug === 'audit-dashboard') continue // informe real de un cliente (Q10): no se muestra
  for (const vista of VISTAS) {
    const origen = join(galeria, slug, `${vista}.webp`)
    if (!existsSync(origen)) continue
    const vp = vista.endsWith('mobile') ? 'mobile' : 'desktop'
    for (const lod of [0, 1]) {
      const destino = join(salida, `lod${lod}`, slug, `${vista}.avif`)
      if (existsSync(destino) && statSync(destino).mtimeMs > statSync(origen).mtimeMs) { bytes += statSync(destino).size; continue }
      mkdirSync(dirname(destino), { recursive: true })
      const info = await sharp(origen).resize({ width: ANCHOS[lod][vp] }).avif({ quality: lod === 0 ? 38 : 48, effort: 4 }).toFile(destino)
      bytes += info.size
      hechas++
    }
  }
}
console.log(`LOD generados: ${hechas} · total en disco ${(bytes / 1024).toFixed(0)} KB`)
