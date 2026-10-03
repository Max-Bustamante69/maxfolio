// Qué pieza va en qué colección (rubro). Las colecciones se agrupan por slug, nunca por el texto del rubro: ese texto cambia con el
// idioma. Los nombres de cada colección viven en copy.ts. La primera pieza de cada colección es la grande del rack.
export type ColeccionId = 'bienestar' | 'cafe' | 'moda' | 'belleza' | 'joyeria' | 'otros'

export const COLECCIONES: Array<{ id: ColeccionId; slugs: string[] }> = [
  { id: 'bienestar', slugs: ['the-gummy-box', 'mindfuel', 'origen-vital', 'factores-2x2'] },
  { id: 'cafe', slugs: ['nos-cafe', 'valdo-cafe'] },
  { id: 'moda', slugs: ['tierramont', 'alma-de-aviador', 'unik', 'saint-theory', 'pixxiesx'] },
  { id: 'belleza', slugs: ['nalua', 'sebum', 'luxe-shine', 'para-machos'] },
  { id: 'joyeria', slugs: ['millennio', 'en-amor-a-dos'] },
  { id: 'otros', slugs: ['peluna', 'atmosfera'] },
]

/** Las dos piezas del díptico de la portada y las de la pasarela: obra terminada, en vivo, con su caso contado en la ficha. */
export const DIPTICO = ['nalua', 'luxe-shine']
export const PASARELA = ['the-gummy-box', 'nos-cafe', 'millennio', 'mindfuel']
export const DESTACADAS = [...DIPTICO, ...PASARELA]
