// Reduce un HDRI Radiance (.hdr, RGBE plano sin RLE) a la mitad en cada eje con un filtro de caja 2×2 en luz lineal.
//   node scripts/hdri-reducir.mjs public/3d/hdri/studio_small_09_1k.hdr public/3d/hdri/studio_small_09_512.hdr
// Uso: el entorno del estudio (studio_small_09, Poly Haven, CC0) entra a 0.35 como «mundo» de las piezas; medido con
// scripts/qa-3d.mjs, la versión 512×256 (512 KB) da la misma paridad con los pósters que la 1k (2 MB) y la 2k (6.3 MB).
import fs from 'node:fs'

const [entrada, salida] = process.argv.slice(2)
const src = fs.readFileSync(entrada)
let off = 0
let ultima = ''
while (!ultima.startsWith('-Y')) {
  const fin = src.indexOf(10, off)
  ultima = src.slice(off, fin).toString()
  off = fin + 1
}
const [, alto, , ancho] = ultima.split(' ').map((v, i) => (i % 2 ? Number(v) : v))
const pix = src.slice(off)
if (pix[0] === 2 && pix[1] === 2 && (pix[2] & 0x80) === 0) throw new Error('El HDR usa RLE; este script solo lee RGBE plano')

const aFloat = (i) => {
  const e = pix[i + 3]
  if (!e) return [0, 0, 0]
  const f = 2 ** (e - 136)
  return [pix[i] * f, pix[i + 1] * f, pix[i + 2] * f]
}
const W = ancho / 2
const H = alto / 2
const out = Buffer.alloc(W * H * 4)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const acc = [0, 0, 0]
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const c = aFloat(((2 * y + dy) * ancho + 2 * x + dx) * 4)
      for (let k = 0; k < 3; k++) acc[k] += c[k] / 4
    }
    const m = Math.max(...acc)
    if (m < 1e-32) continue
    const exp = Math.floor(Math.log2(m)) + 1
    const o = (y * W + x) * 4
    for (let k = 0; k < 3; k++) out[o + k] = Math.min(255, Math.floor((acc[k] * 256) / 2 ** exp))
    out[o + 3] = exp + 128
  }
}
fs.writeFileSync(salida, Buffer.concat([Buffer.from(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${H} +X ${W}\n`), out]))
console.log(`${W}×${H}, ${((out.length + 60) / 1024).toFixed(0)} KB → ${salida}`)
