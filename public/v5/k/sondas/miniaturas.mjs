// Miniaturas de las tarjetas de «Obra»: el recorte superior (4:5) de la MISMA captura de cada placa, así la tarjeta y la
// ficha enseñan el mismo medio (EX-8) y la fecha del pie es la de la imagen. Lee src/v5/k/data/radiografias.json y deja
// public/v5/k/placas/mini/<id>.webp (560 px de ancho como máximo; 390 en las capturas móviles).
// Uso: node miniaturas.mjs      (después de capturar-radiografias.mjs)
import fs from 'node:fs'
import { createRequire } from 'node:module'
const WT = 'C:/Users/Usuario/Desktop/P/Github/Personal/max-folio-wt-v5'
const sharp = createRequire(`file:///${WT}/package.json`)('sharp')
const { placas } = JSON.parse(fs.readFileSync(`${WT}/src/v5/k/data/radiografias.json`, 'utf8'))
const out = `${WT}/public/v5/k/placas/mini`
fs.mkdirSync(out, { recursive: true })
let total = 0
for (const [id, p] of Object.entries(placas)) {
  const w = Math.min(560, p.imgAncho)
  const h = Math.round(w * 1.25)
  const buf = await sharp(`${WT}/public${p.img}`).resize({ width: w }).extract({ left: 0, top: 0, width: w, height: h }).webp({ quality: 72 }).toBuffer()
  fs.writeFileSync(`${out}/${id}.webp`, buf)
  total += buf.length
  console.log(`${id}: ${w}x${h} ${(buf.length / 1024).toFixed(0)} KB`)
}
console.log(`total ${(total / 1024).toFixed(0)} KB`)
