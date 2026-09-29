// Deriva los pósters del monograma MB para las skins que NO tienen render de Cycles (brutalist, neo, persona,
// terminal: FICHA p1 del estudio, solo gemela en tiempo real). Parte del póster de Cycles de `apple` (AVIF/WebP con
// alfa) y recolorea SOLO los píxeles con croma (el punto de acento): cambia el matiz al del acento de la skin y
// reescala saturación/luminosidad con la relación acento-skin / acento-apple; la losa de obsidiana (gris) no se toca.
// Es una derivación declarada, no un render: el póster exacto de esas skins queda pendiente en el estudio.
//   node scripts/poster-acento.mjs        → public/3d/monograma-mb/apple-<skin>-1200.{avif,webp}
import sharp from 'sharp'

const DIR = 'public/3d/monograma-mb'
const ACENTOS = { apple: '#0071e3', brutalist: '#dc2626', neo: '#4453d9', persona: '#1c6fb0', terminal: '#39ff88' }

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
function rgb2hsl([r, g, b]) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn
  if (!d) return [0, 0, l]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, s, l]
}
function hsl2rgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [r + m, g + m, b + m]
}
const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t) }

const { data, info } = await sharp(`${DIR}/apple-1200.webp`).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const base = rgb2hsl(hex(ACENTOS.apple))
for (const [skin, color] of Object.entries(ACENTOS)) {
  if (skin === 'apple') continue
  const t = rgb2hsl(hex(color))
  const out = Buffer.from(data)
  for (let p = 0; p < out.length; p += 4) {
    const px = [out[p], out[p + 1], out[p + 2]].map((v) => v / 255)
    const chroma = Math.max(...px) - Math.min(...px)
    const w = smooth(0.08, 0.24, chroma)
    if (!w) continue
    const [, s, l] = rgb2hsl(px)
    const rec = hsl2rgb([t[0], Math.min(1, s * (t[1] / base[1])), Math.min(0.97, l * (t[2] / base[2]))])
    for (let k = 0; k < 3; k++) out[p + k] = Math.round((px[k] * (1 - w) + rec[k] * w) * 255)
  }
  const img = () => sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  await img().webp({ quality: 82, alphaQuality: 100 }).toFile(`${DIR}/apple-${skin}-1200.webp`)
  await img().avif({ quality: 55, effort: 6 }).toFile(`${DIR}/apple-${skin}-1200.avif`)
  console.log('+', skin)
}
