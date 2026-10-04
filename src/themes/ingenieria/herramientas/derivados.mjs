// Derivados ligeros de las dos capturas que viven en el primer pliegue del inicio (la fuente de public/gallery no se toca):
//  - the-gummy-box-home-desktop-720.webp  720×450: la ventana del héroe, que se ve a 370–740 px de ancho
//  - nos-cafe-home-mobile-{160,260}.webp  160×346 y 260×563: el teléfono del héroe, que se ve a 84–138 px de ancho
// Van junto al tema y las importa Vite (nombre con hash, caché inmutable); piezas.tsx los ofrece en el srcset junto al original.
// Uso: node src/themes/ingenieria/herramientas/derivados.mjs
import sharp from 'sharp'

const HECHOS = [
  { de: 'public/gallery/the-gummy-box/home-desktop.webp', a: 'src/themes/ingenieria/img/the-gummy-box-home-desktop-720.webp', w: 720, h: 450, q: 78 },
  { de: 'public/gallery/nos-cafe/home-mobile.webp', a: 'src/themes/ingenieria/img/nos-cafe-home-mobile-160.webp', w: 160, h: 346, q: 74 },
  { de: 'public/gallery/nos-cafe/home-mobile.webp', a: 'src/themes/ingenieria/img/nos-cafe-home-mobile-260.webp', w: 260, h: 563, q: 74 },
]
for (const { de, a, w, h, q } of HECHOS) {
  const r = await sharp(de).resize(w, h, { fit: 'cover', position: 'top' }).webp({ quality: q }).toFile(a)
  console.log(a, `${r.width}×${r.height}`, `${(r.size / 1024).toFixed(1)} KB`)
}
