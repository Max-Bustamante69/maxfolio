import type { Obra } from '../data'

// El alcance de una tienda en una frase de diez palabras o menos: lo que se pidió y lo que se hizo, con palabras del registro
// (taglines, descripciones y hechos de src/content). Nada de recuentos de catálogo ni números de laboratorio como titular.
type Par = { es: string; en: string }
const ALCANCE: Record<string, Par> = {
  'the-gummy-box': { es: 'Armador de kits con descuento automático en el checkout', en: 'Kit builder with an automatic checkout discount' },
  'nos-cafe': { es: 'Port de Framer y armador de cajas con descuento por escalera', en: 'Framer port and a box builder with a tiered discount' },
  millennio: { es: 'Port de Framer con 260+ elementos medidos', en: 'Framer port with 260+ measured elements' },
  nalua: { es: 'Ofertas por cantidad cableadas a descuentos automáticos', en: 'Quantity offers wired to automatic discounts' },
  mindfuel: { es: 'Port completo a React V2, ya en producción', en: 'Full React V2 port, now in production' },
  sebum: { es: 'Reconstrucción V2 con un muro de reseñas extensible', en: 'V2 rebuild with an extensible review wall' },
  'factores-2x2': { es: 'De Framer a Liquid, con pasada de calidad web', en: 'Framer to Liquid, then a web-quality pass' },
  'origen-vital': { es: 'Port de Framer con quiz de producto y landings promo', en: 'Framer port with a product quiz and promo landings' },
  atmosfera: { es: 'Catálogo sincronizado con las listas del proveedor', en: 'Catalog synced from the supplier price lists' },
  'luxe-shine': { es: 'Hero de video por scroll y retrofit de tracking', en: 'Scroll-driven video hero and a tracking retrofit' },
  pixxiesx: { es: 'Quiz de producto y PDP guiada por metaobjetos', en: 'Product quiz and a metaobject-driven PDP' },
  'valdo-cafe': { es: 'Transferida a la tienda real y promovida al día siguiente', en: 'Transferred to the real store, promoted the next day' },
  unik: { es: 'Tienda bilingüe en dos monedas, catálogo traducido en bloque', en: 'Bilingual two-currency store, catalog translated in bulk' },
  peluna: { es: 'Rediseño con pruebas A/B montadas desde el día uno', en: 'Redesign with A/B tests wired from day one' },
  'en-amor-a-dos': { es: '57 secciones propias sobre islas React', en: '57 custom sections on React islands' },
  tierramont: { es: 'Tema nuevo para la tienda real, issue por issue', en: 'New theme for the real store, issue by issue' },
  'para-machos': { es: 'Tema Digitdeck nuevo, en construcción', en: 'New Digitdeck theme, in progress' },
  'alma-de-aviador': { es: 'Woo → Shopify, con el diseño de Framer en 35 secciones', en: 'Woo → Shopify, with the Framer design in 35 sections' },
  'saint-theory': { es: 'Tema Liquid a medida, publicado desde 2023', en: 'Custom Liquid theme, live since 2023' },
}

const palabras = (s: string) => s.split(/\s+/).filter(Boolean).length

/** Recorta un texto largo a la última cláusula completa que cabe en `max` palabras (o en `max·3` caracteres si no hay espacios, como en japonés). */
export function recorta(texto: string, max = 10): string {
  const t = texto.replace(/[.。]\s*$/, '')
  const ja = !/\s/.test(t)
  const cabe = (s: string) => (ja ? s.length <= max * 3 : palabras(s) <= max)
  if (cabe(t)) return t
  let mejor = ''
  for (const m of t.matchAll(ja ? /、/g : /[,;]\s+|\s[—–]\s/g)) {
    const pre = t.slice(0, m.index)
    if (cabe(pre)) mejor = pre
  }
  return mejor || (ja ? t.slice(0, max * 3) : t.split(/\s+/).slice(0, max).join(' '))
}

/** El alcance de una obra en el idioma activo (japonés: la propia tagline del registro, recortada). */
export function alcanceDe(o: Obra, locale: 'es' | 'en' | 'ja'): string {
  if (locale === 'ja') return recorta(o.tagline)
  const p = ALCANCE[o.slug]
  return p ? p[locale] : recorta(o.tagline)
}
