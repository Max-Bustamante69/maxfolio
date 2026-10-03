import { TINTES } from './tintes'

/** Orden del recorrido: lo que está en el aire primero, lo que se construye después, lo más antiguo al final. */
export const ORDEN = [
  'the-gummy-box', 'nos-cafe', 'millennio', 'nalua', 'mindfuel', 'sebum', 'factores-2x2', 'origen-vital', 'atmosfera', 'luxe-shine',
  'pixxiesx', 'valdo-cafe', 'unik', 'peluna', 'en-amor-a-dos', 'tierramont', 'para-machos', 'alma-de-aviador', 'saint-theory',
] as const

export interface SetDef { slug: string; x: number; z: number; yaw: number; tinte: string }
/** Cada tienda es un set: una pantalla de 6,4 × 4 m, girada hacia el eje (0,34 rad: casi de frente a la cámara, para que la captura se lea), en zigzag cada 9 m. */
export const SETS: SetDef[] = ORDEN.map((slug, i) => ({
  slug, x: i % 2 === 0 ? -6.4 : 6.4, z: -13 - 9 * i, yaw: i % 2 === 0 ? 0.34 : -0.34, tinte: TINTES[slug] ?? '#e8c9a0',
}))
export const indiceDe = (slug: string) => ORDEN.indexOf(slug as (typeof ORDEN)[number])
/** Textura de un set (WebP reducido de la captura real de public/gallery): hd/pd escritorio, hm/pm móvil. */
export const tex = (slug: string, suf: 'hd' | 'pd' | 'hm' | 'pm') => `/v5/plato/tex/${slug}-${suf}.webp`
