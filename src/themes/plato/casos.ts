import { datosDe, type Obra } from '../data'

// Lo medido de cada obra, con su fuente y su fecha. Cada cifra sale de un registro que ya está en el repo: el Lighthouse local
// (src/data/lighthouse.json, solo con tema de Digitdeck), el catálogo público (commerce.json), la ventana de construcción del registro o un
// hecho del texto de la obra (src/content/*.ts). Aquí no nace ningún número: solo se elige cuál va primero y se le da nombre.
// Una cifra de titular es un RESULTADO (descuento, medición, reseñas, plazo), nunca un contador de implementación (secciones, issues, tipos
// de metaobjeto): eso es telemetría del taller y no le sirve a quien contrata (crítica de la ronda 9, §2.2).
type L = { es: string; en: string }
const l = (es: string, en: string): L => ({ es, en })

/** «jul de 2026 – sept de 2026» → «jul – sept de 2026» (el año se dice una vez cuando es el mismo). */
export function periodoCorto(p: string) {
  const [a, b] = p.split(' – ')
  const ya = a?.match(/\s(?:de\s)?(\d{4})$/)
  const yb = b?.match(/\s(?:de\s)?(\d{4})$/)
  return ya && yb && ya[1] === yb[1] ? `${a.slice(0, ya.index)} – ${b}` : p
}

/** «10 sept 2026»: la fecha de una medición, en el idioma activo (nunca el ISO crudo). */
export const fechaCorta = (iso: string, intl: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(intl, { day: 'numeric', month: 'short', year: 'numeric' })

export interface Medida { valor: string; etq: string; nota: string; tipo: 'lh' | 'hecho' | 'cat' | 'ventana' }

/** El hecho del registro que mejor cuenta cada obra. Donde no hay un resultado, manda el Lighthouse, el catálogo grande o la ventana de construcción. */
const HECHO: Record<string, { valor: string | L; etq: L }[]> = {
  'the-gummy-box': [{ valor: '10% → 20%', etq: l('Descuento del kit: sube a medida que se llena', 'Kit discount: rises as the kit fills') }],
  'nos-cafe': [{ valor: '10% → 20%', etq: l('Descuento de la caja: sube con cada bolsa', 'Box discount: rises with every bag') }],
  millennio: [{ valor: '260+', etq: l('Elementos medidos en el dashboard Optimize', 'Elements measured in the Optimize dashboard') }],
  'factores-2x2': [{ valor: '100 · 100', etq: l('Accesibilidad · SEO en Lighthouse móvil', 'Accessibility · SEO on mobile Lighthouse') }],
  'origen-vital': [
    { valor: '302', etq: l('Reseñas con foto, en vivo', 'Live reviews with photos') },
    { valor: '192', etq: l('Anuncios convertidos en landings', 'Ads turned into landing pages') },
  ],
  atmosfera: [{ valor: '12 h', etq: l('Entre una sincronización del catálogo y la siguiente', 'Between one catalog sync and the next') }],
  'valdo-cafe': [{ valor: '24 h', etq: l('De la tienda de pruebas a la real, ya promovida', 'From the staging store to the real one, already promoted') }],
  unik: [{ valor: '2 · 2', etq: l('Idiomas · monedas', 'Languages · currencies') }],
  'digitdeck-apps': [{ valor: '5', etq: l('Módulos en una sola instalación', 'Modules in a single install') }],
}
/** Obras donde el Lighthouse de escritorio va por delante del hecho. */
const LH_PRIMERO = new Set(['nalua', 'mindfuel'])

const meses = (p?: { start: string; end: string }) => {
  if (!p) return 0
  const [sy, sm] = p.start.split('-').map(Number)
  const [ey, em] = p.end.split('-').map(Number)
  return (ey - sy) * 12 + (em - sm) + 1
}

/** Las medidas de una obra, la principal primero. `fecha` formatea un ISO en el idioma activo. */
export function medidasDe(o: Obra, locale: 'es' | 'en' | 'ja', fecha: (iso: string) => string, periodo?: string): Medida[] {
  const k = locale === 'es' ? 'es' : 'en'
  const d = datosDe(o.slug)
  const num = (n: number | null | undefined) => (n == null ? '' : n.toLocaleString(locale === 'es' ? 'es-CO' : 'en-US', { maximumFractionDigits: 2 }))
  const lh: Medida[] = d.lighthouse && d.lighthouse.escritorio.perf >= 90
    ? [{
        valor: String(d.lighthouse.escritorio.perf),
        etq: k === 'es' ? 'Lighthouse de escritorio' : 'Desktop Lighthouse',
        nota: `${d.lighthouse.escritorio.lcp != null ? `LCP ${num(d.lighthouse.escritorio.lcp)} s · ` : ''}${fecha(d.lighthouse.fecha)}`,
        tipo: 'lh',
      }]
    : []
  const hechos: Medida[] = (HECHO[o.slug] ?? []).map((h) => ({
    valor: typeof h.valor === 'string' ? h.valor : h.valor[k],
    etq: h.etq[k],
    nota: periodo ? periodoCorto(periodo) : String(o.year),
    tipo: 'hecho',
  }))
  // El catálogo solo acompaña si dice algo (100 productos o más): 12 o 18 productos no son un resultado.
  const cat: Medida[] = d.comercio && d.comercio.products >= 100
    ? [{ valor: String(d.comercio.products), etq: k === 'es' ? 'Productos en el catálogo público' : 'Products in the public catalog', nota: fecha(d.comercio.fecha), tipo: 'cat' }]
    : []
  const propias = LH_PRIMERO.has(o.slug) ? [...lh, ...hechos] : [...hechos, ...lh]
  const todas = [...propias, ...cat]
  // Sin resultado que contar, el tiempo de construcción (tiendas hechas en una ventana de 1 a 6 meses; las antiguas de un año entero no entran).
  const n = meses(o.period)
  if (!todas.length && o.kind === 'store' && !o.legacy && n >= 1 && n <= 6) {
    todas.push({
      valor: k === 'es' ? `${n} ${n === 1 ? 'mes' : 'meses'}` : `${n} ${n === 1 ? 'month' : 'months'}`,
      etq: o.role === 'migrated' ? (k === 'es' ? 'Ventana de la migración' : 'Migration window') : (k === 'es' ? 'Ventana de construcción' : 'Build window'),
      nota: periodo ? periodoCorto(periodo) : String(o.year),
      tipo: 'ventana',
    })
  }
  return todas.slice(0, 3)
}

/**
 * La línea que acompaña a un Lighthouse móvil bajo: qué pesa (leído de las propias métricas de la medición) y por dónde empezaría.
 * Nada de diagnóstico inventado: solo se nombra la métrica que está mal y el siguiente paso general que le corresponde.
 */
export function contextoMovil(m: { perf: number; lcp: number | null; tbt: number | null }, locale: 'es' | 'en' | 'ja'): string | null {
  if (m.perf >= 70) return null
  const es = locale === 'es'
  const n = (x: number, d = 2) => x.toLocaleString(es ? 'es-CO' : 'en-US', { maximumFractionDigits: d })
  const pesa: string[] = []
  const paso: string[] = []
  if (m.lcp != null && m.lcp > 4) {
    pesa.push(es ? 'el contenido principal tarda en pintarse (LCP)' : 'the main content takes long to paint (LCP)')
    paso.push(es ? 'las imágenes y las fuentes del primer pliegue' : 'the first-fold images and fonts')
  }
  if (m.tbt != null && m.tbt > 300) {
    pesa.push(es ? `el hilo principal queda ocupado ${n(m.tbt, 0)} ms (TBT): hay más JavaScript del que el primer pliegue necesita` : `the main thread stays busy for ${n(m.tbt, 0)} ms (TBT): there is more JavaScript than the first fold needs`)
    paso.push(es ? 'diferir los scripts que el primer pliegue no usa' : 'deferring the scripts the first fold does not use')
  }
  if (!pesa.length) return null
  return es
    ? `Lo que más pesa en móvil: ${pesa.join(' y ')}. Por dónde empezaría: ${paso.join(' y ')}, y volver a medir con el mismo método.`
    : `What weighs most on mobile: ${pesa.join(' and ')}. Where I would start: ${paso.join(' and ')}, then measure again the same way.`
}

/** La historia de las cuatro obras destacadas: el encargo y lo que cambió, con palabras del registro (sin cifras nuevas). */
export const CASO: Record<string, { encargo: L; cambio: L }> = {
  'the-gummy-box': {
    encargo: l('Una oferta de kit simple para el comprador e imposible de trampear.', 'A kit offer that is simple for the buyer and impossible to game.'),
    cambio: l('El módulo de Bundles calcula el descuento con una Shopify Function en el checkout: se aplica solo, sin cupón que buscar.', 'The Bundles module computes the discount with a Shopify Function at checkout: it applies itself, no coupon to hunt for.'),
  },
  'nos-cafe': {
    encargo: l('Un diseño de Framer terminado que no podía perder un píxel en el camino a Shopify.', 'A finished Framer design that could not lose a pixel on its way to Shopify.'),
    cambio: l('Port 1:1 a Liquid y un armador de cajas de hasta cinco bolsas, con un descuento que sube a medida que se llena.', 'A 1:1 port to Liquid and a box builder of up to five bags, with a discount that climbs as it fills.'),
  },
  millennio: {
    encargo: l('Su diseño de Framer vivo en Shopify, y saber qué tocan de verdad los compradores.', 'Its Framer design alive on Shopify, and knowing what shoppers actually touch.'),
    cambio: l('Islas React sobre base Liquid; cada tarjeta, carril y CTA reporta al dashboard Optimize.', 'React islands on a Liquid base; every card, rail and CTA reports to the Optimize dashboard.'),
  },
  'origen-vital': {
    encargo: l('Una marca de suplementos que pasaba de Framer a Shopify.', 'A supplements brand moving from Framer to Shopify.'),
    cambio: l('Quiz de producto, reseñas con foto, un mega menú sobre cinco colecciones y landings sintetizadas a partir de los anuncios.', 'A product quiz, reviews with photos, a mega menu over five collections and landing pages synthesized from the ads.'),
  },
}
