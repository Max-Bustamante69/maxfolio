import { datosDe, type Obra, type Vista } from '../data'
import { llenar, sinProtocolo, type usePublico } from './publico'

// Tres casos contados con un reto real (The Gummy Box, NOS Café, Nalua). Cada frase sale del registro del vivo (descripción y
// hechos de la tienda): ninguna es nueva. Las otras cuatro tiendas (Millennio, Mindfuel, Sebum, Factores 2x2) no llevan la plantilla
// Reto / Resultado: solo un resumen y «qué hice», y su ficha cuenta la historia del registro. No se escribe ninguna «decisión» ni
// «lo que cambiaría» hasta que Max las cuente con sus palabras (no están en ningún dato). Los resultados son efectos, no inventarios:
// los números (Lighthouse, catálogo, secciones) viven una sola vez, en el riel de la ficha y en «Medido».

export interface Caso {
  /** Qué hizo Max, en una línea (no el estado «Construida»). */
  rol: string
  /** La frase de la tarjeta. */
  resumen: string
  /** Momentos de la historia; el primero se compone como apertura editorial. Vacío = la ficha cuenta «La historia» del registro. */
  momentos: Array<{ label: string; body: string }>
}

type Idioma = 'es' | 'en'
interface Texto { rol: string; resumen: string; reto?: string; solucion?: string }

const ROTULOS: Record<Idioma, { reto: string; solucion: string }> = {
  es: { reto: 'El reto', solucion: 'Lo que hice' },
  en: { reto: 'The challenge', solucion: 'What I did' },
}

const TEXTOS: Record<string, Record<Idioma, Texto>> = {
  'nos-cafe': {
    es: {
      rol: 'Port 1:1 de Framer a Liquid y armador de cajas',
      resumen: 'Un diseño de Framer que no podía perder un píxel y un armador de cajas con descuento del 10% al 20%.',
      reto: 'Un diseño de Framer terminado que no podía perder un píxel en el camino a Shopify, y un tostador que necesitaba vender cajas armadas bolsa a bolsa.',
      solucion: 'Porté el diseño 1:1 a Liquid y construí el armador: hasta cinco bolsas por caja, molienda y tamaño por bolsa, y un descuento que sube del 10% al 20% a medida que la caja se llena.',
    },
    en: {
      rol: '1:1 Framer-to-Liquid port and box builder',
      resumen: 'A Framer design that could not lose a pixel, plus a box builder with a 10% to 20% discount.',
      reto: 'A finished Framer design that could not lose a pixel on its way to Shopify, and a roaster that needed to sell boxes built bag by bag.',
      solucion: 'I ported the design 1:1 to Liquid and built the box builder: up to five bags per box, grind and size per bag, and a discount that climbs from 10% to 20% as the box fills.',
    },
  },
  nalua: {
    es: {
      rol: 'Ofertas y escalones por cantidad cableados a descuentos reales',
      resumen: 'Ofertas de compra y escalones por cantidad que son descuentos automáticos reales, no carteles.',
      reto: 'El riesgo eran ofertas que solo parecían descuentos.',
      solucion: 'Conecté las ofertas de compra y los niveles por cantidad a descuentos automáticos reales de Shopify.',
    },
    en: {
      rol: 'Offers and quantity tiers wired to real discounts',
      resumen: 'Purchase offers and quantity tiers that are real automatic discounts, not banners.',
      reto: 'The risk was offers that only looked like discounts.',
      solucion: 'I wired the purchase offers and quantity tiers to real Shopify automatic discounts.',
    },
  },
  millennio: {
    es: { rol: 'Port del diseño de Framer, personalizado sobre una base comprada', resumen: 'Una perfumería con más de mil productos y su diseño de Framer, vivo en Shopify y medido.' },
    en: { rol: 'Port of the Framer design, customized on a purchased base', resumen: 'A perfumery with over a thousand products and its Framer design, live on Shopify and measured.' },
  },
  mindfuel: {
    es: { rol: 'Port React V2 sobre la plantilla Digitdeck', resumen: 'Un port React V2 en producción desde el 20 de agosto de 2026, con home, producto y quiz en una sola librería.' },
    en: { rol: 'React V2 port on the Digitdeck template', resumen: 'A React V2 port in production since August 20, 2026, with home, product and quiz on one library.' },
  },
  sebum: {
    es: { rol: 'Reconstrucción V2 con muro de reseñas extensible', resumen: 'Una reconstrucción V2 con muro de reseñas extensible y paridad total entre el repo y el tema en vivo.' },
    en: { rol: 'V2 rebuild with an extensible review wall', resumen: 'A V2 rebuild with an extensible review wall and full parity between the repo and the live theme.' },
  },
  'factores-2x2': {
    es: { rol: 'Port de Framer a Liquid y pasada de calidad web', resumen: 'De Framer a Liquid y una pasada de calidad web: 100 en accesibilidad y 100 en SEO en móvil.' },
    en: { rol: 'Framer-to-Liquid port and web-quality pass', resumen: 'From Framer to Liquid and a web-quality pass: 100 for accessibility and 100 for SEO on mobile.' },
  },
}

/** Los slugs con caso escrito, en el orden en que la obra los presenta. */
export const CON_CASO = ['the-gummy-box', 'nos-cafe', 'millennio', 'mindfuel', 'nalua', 'sebum', 'factores-2x2']

/** Vista que mejor presenta cada obra (la home de NOS termina en un corte con la píldora «Club NOS» tapando el titular; su ficha de producto no). */
const PORTADA: Record<string, Vista> = { 'nos-cafe': 'pdp' }
export const vistaDe = (o: Pick<Obra, 'slug' | 'views'>): Vista => (PORTADA[o.slug] && o.views.includes(PORTADA[o.slug]) ? PORTADA[o.slug] : o.views[0] ?? 'home')

/** Cada afirmación sale una vez: «40+ pruebas» ya está en el cargo de Digitdeck, y la medición de Lighthouse vive en el pliegue y en «Medido». */
const RETOQUES: Array<[RegExp, string]> = [
  [/,\s*y más de 40 pruebas de Playwright antes de cada lanzamiento/, ''], [/,\s*and 40\+ Playwright checks before launch/, ''], [/、さらにPlaywrightのチェックを40件以上通過してから公開する/, ''],
  [/Lighthouse de escritorio .*?s,\s*el descuento/, 'El descuento'], [/Desktop Lighthouse .*?LCP,\s*the/, 'The'], [/デスクトップのLighthouseは.*?秒。/, ''],
]
const sinRepetir = (s: string) => RETOQUES.reduce((acc, [re, por]) => acc.replace(re, por), s)

export function casoDe(v: ReturnType<typeof usePublico>, o: Obra, locale: string): Caso | null {
  const l: Idioma = locale === 'es' ? 'es' : 'en'
  const r = ROTULOS[l]

  if (o.slug === 'the-gummy-box') {
    const { git, lighthouse } = datosDe(o.slug)
    if (!git || !lighthouse) return null
    const ladder = v.registry.stores.find((s) => s.slug === o.slug)?.facts.find((f) => f.id === 'ladder')?.value ?? ''
    const vars = {
      ladder, sections: git.sections, blocks: git.blocks ?? 0, trackedComponents: git.trackedComponents ?? 0,
      url: o.link ? sinProtocolo(o.link) : '',
      perfDesktop: lighthouse.escritorio.perf, a11yDesktop: lighthouse.escritorio.a11y, seoDesktop: lighthouse.escritorio.seo,
      lcpDesktop: new Intl.NumberFormat(v.intlLocale, { maximumFractionDigits: 2 }).format(lighthouse.escritorio.lcp ?? 0),
    }
    return {
      rol: l === 'es' ? 'Armador de kits cableado a Bundles, suscripciones y tracking propio' : 'Kit builder wired to Bundles, subscriptions and first-party tracking',
      resumen: l === 'es' ? 'Un armador de kits que descuenta solo al pagar: del 10% al 20%, sin cupón.' : 'A kit builder that discounts by itself at checkout: 10% to 20%, no coupon.',
      momentos: v.strings.sections.featuredBuild.beats.map((b) => ({ label: b.label, body: sinRepetir(llenar(b.body, vars)) })),
    }
  }

  const t = TEXTOS[o.slug]?.[l]
  if (!t) return null
  return {
    rol: t.rol,
    resumen: t.resumen,
    momentos: t.reto && t.solucion ? [{ label: r.reto, body: t.reto }, { label: r.solucion, body: t.solucion }] : [],
  }
}

