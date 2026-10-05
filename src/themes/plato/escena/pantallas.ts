// Recorridos de pantalla de las tiendas que sirven un tema de Digitdeck (obra.link): la home MÓVIL completa a 2x (390 → 780 px de ancho),
// recapturada desde su URL pública con un iPhone (iOS 18), sin burbujas de chat, popups ni avisos de cookies, recortada a 9 000 px y cortada
// en franjas de ≤ 4 096 px de alto (el límite de textura de un móvil) con 8 px de solape. Se descarga SOLO al abrir esa ficha.
// Generado por D:/claude-scratch-e8e5a660/maxfolio-v5/plato10/capturar.mjs (scroll). Las tiendas que no están aquí usan su captura de galería.
export const FECHA_RECORRIDO = '2026-10-03'
export const FRANJA = 4096
export const PASO = 4088

/** Alto total (px a 2x) de la página capturada de cada tienda con recorrido. */
export const PANTALLAS: Record<string, { h: number }> = {
  'the-gummy-box': { h: 9000 },
  'nos-cafe': { h: 9000 },
  millennio: { h: 9000 },
  mindfuel: { h: 9000 },
  nalua: { h: 9000 },
  sebum: { h: 9000 },
  'valdo-cafe': { h: 9000 },
  'factores-2x2': { h: 9000 },
  pixxiesx: { h: 9000 },
  'luxe-shine': { h: 9000 },
  atmosfera: { h: 9000 },
  'saint-theory': { h: 9000 },
}

export const tieneRecorrido = (slug: string) => slug in PANTALLAS
/** `ancho` 520: la variante del teléfono 2D (scripts/franjas-520.mjs); sin él, la de 780 que usa el lienzo 3D. */
export const urlFranja = (slug: string, i: number, ancho?: 520) => `/v5/plato/scroll/${slug}-${i}${ancho ? `-${ancho}` : ''}.webp`
/** Altos de cada franja: 4 096 salvo la última, que lleva el resto (con el solape de 8 px). */
export function altosFranjas(h: number): number[] {
  const out: number[] = []
  for (let y = 0; y < h; y += PASO) {
    const alto = Math.min(FRANJA, h - y)
    if (alto < 16 && out.length) break
    out.push(alto)
    if (y + alto >= h) break
  }
  return out
}
