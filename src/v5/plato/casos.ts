import { datosDe, type Obra } from '../data'

// Lo medido de cada obra, con su fuente y su fecha. Cada cifra sale de un registro que ya está en el repo: el Lighthouse local
// (src/data/lighthouse.json, solo con tema de Digitdeck), el catálogo público (commerce.json) o un hecho del texto de la obra
// (src/content/*.ts). Aquí no nace ningún número: solo se elige cuál va primero y se le da nombre.
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

export interface Medida { valor: string; etq: string; nota: string; tipo: 'lh' | 'hecho' | 'cat' }

/** El hecho del registro que mejor cuenta cada obra. Donde falta, manda el Lighthouse de escritorio o el catálogo público. */
const HECHO: Record<string, { valor: string | L; etq: L }[]> = {
  'the-gummy-box': [{ valor: '10% → 20%', etq: l('Descuento del kit, automático en el checkout', 'Kit discount, automatic at checkout') }],
  'nos-cafe': [{ valor: '10% → 20%', etq: l('Descuento de la caja: sube con cada bolsa', 'Box discount: rises with every bag') }],
  millennio: [{ valor: '260+', etq: l('Elementos medidos en el dashboard Optimize', 'Elements measured in the Optimize dashboard') }],
  sebum: [{ valor: '100 %', etq: l('Paridad entre el repo y el tema en vivo', 'Parity between the repo and the live theme') }],
  'factores-2x2': [{ valor: '100 · 100', etq: l('Accesibilidad · SEO en Lighthouse móvil', 'Accessibility · SEO on mobile Lighthouse') }],
  'origen-vital': [
    { valor: '302', etq: l('Reseñas con foto, en vivo', 'Live reviews with photos') },
    { valor: '192', etq: l('Anuncios convertidos en landings', 'Ads turned into landing pages') },
  ],
  atmosfera: [{ valor: '12 h', etq: l('El catálogo se actualiza desde las listas del proveedor', 'The catalog refreshes from the supplier lists') }],
  pixxiesx: [{ valor: '6', etq: l('Tipos de metaobjeto detrás de la página de producto', 'Metaobject types behind the product page') }],
  'valdo-cafe': [{ valor: '24 h', etq: l('De la tienda de pruebas al aire', 'From the staging store to live') }],
  unik: [{ valor: '2 · 2', etq: l('Idiomas · monedas', 'Languages · currencies') }],
  peluna: [{ valor: l('Día 1', 'Day 1'), etq: l('Pruebas A/B montadas desde el primer día', 'A/B tests wired from the first day') }],
  'en-amor-a-dos': [{ valor: '57', etq: l('Secciones propias sobre islas React', 'Custom sections on React islands') }],
  tierramont: [{ valor: '81', etq: l('Issues seguidos en un tablero que el cliente lee', 'Issues tracked on a board the client can read') }],
  'alma-de-aviador': [{ valor: '35', etq: l('Secciones del diseño de Framer, componentizadas', 'Sections of the Framer design, componentized') }],
  'saint-theory': [{ valor: '2023', etq: l('Tema a medida que sigue siendo el publicado hoy', 'Custom theme that is still the live one today') }],
  'digitdeck-apps': [{ valor: '5', etq: l('Módulos en una sola instalación', 'Modules in a single install') }],
}
/** Obras donde el Lighthouse de escritorio va por delante del hecho. */
const LH_PRIMERO = new Set(['the-gummy-box', 'nalua', 'mindfuel'])

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
  const cat: Medida[] = d.comercio && d.comercio.products >= 10
    ? [{ valor: String(d.comercio.products), etq: k === 'es' ? 'Productos en el catálogo público' : 'Products in the public catalog', nota: fecha(d.comercio.fecha), tipo: 'cat' }]
    : []
  // El catálogo solo acompaña si dice algo (100 productos o más) o si es lo único medido de la obra; tres medidas como máximo.
  const propias = LH_PRIMERO.has(o.slug) ? [...lh, ...hechos] : [...hechos, ...lh]
  const catVale = cat.filter((m) => Number(m.valor) >= 100 || !propias.length)
  return [...propias, ...catVale].slice(0, 3)
}

/** La historia de las cuatro obras destacadas: el encargo y lo que cambió, con palabras del registro (sin cifras nuevas). */
export const CASO: Record<string, { encargo: L; cambio: L }> = {
  'the-gummy-box': {
    encargo: l('Una oferta de kit simple para el comprador e imposible de trampear.', 'A kit offer that is simple for the buyer and impossible to game.'),
    cambio: l('El módulo de Bundles calcula el descuento del 10 % al 20 % con una Shopify Function en el checkout: se aplica solo, sin cupón que buscar.', 'The Bundles module computes the 10% to 20% discount with a Shopify Function at checkout: it applies itself, no coupon to hunt for.'),
  },
  'nos-cafe': {
    encargo: l('Un diseño de Framer terminado que no podía perder un píxel en el camino a Shopify.', 'A finished Framer design that could not lose a pixel on its way to Shopify.'),
    cambio: l('Port 1:1 a Liquid y un armador de cajas de hasta cinco bolsas, con un descuento que sube del 10 % al 20 % a medida que se llena.', 'A 1:1 port to Liquid and a box builder of up to five bags, with a discount that climbs from 10% to 20% as it fills.'),
  },
  millennio: {
    encargo: l('Su diseño de Framer vivo en Shopify, y saber qué tocan de verdad los compradores.', 'Its Framer design alive on Shopify, and knowing what shoppers actually touch.'),
    cambio: l('Islas React sobre base Liquid; cada tarjeta, carril y CTA reporta al dashboard Optimize.', 'React islands on a Liquid base; every card, rail and CTA reports to the Optimize dashboard.'),
  },
  'origen-vital': {
    encargo: l('Una marca de suplementos que pasaba de Framer a Shopify.', 'A supplements brand moving from Framer to Shopify.'),
    cambio: l('Quiz de producto, 302 reseñas con foto, un mega menú sobre cinco colecciones y landings sintetizadas de 192 anuncios.', 'A product quiz, 302 reviews with photos, a mega menu over five collections and landing pages synthesized from 192 ads.'),
  },
}
