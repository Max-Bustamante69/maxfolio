import { datosDe, SHOT_SIZE, type Obra, type Vista, type Viewport } from '../data'

// Ayudas de datos de la dirección C. Nada se teclea aquí: todo sale de Obra (useV5) y de datosDe().

export interface Captura {
  vista: Vista
  vp: Viewport
}
const TODAS: Captura[] = [
  { vista: 'home', vp: 'desktop' },
  { vista: 'pdp', vp: 'desktop' },
  { vista: 'home', vp: 'mobile' },
  { vista: 'pdp', vp: 'mobile' },
]
/** Las capturas que una obra tiene de verdad (home y PDP, escritorio y móvil); vacío si no hay: nunca se inventa una. */
export const capturasDe = (o: Obra): Captura[] => TODAS.filter((c) => o.views.includes(c.vista))

/** LOD 0 (320 px / 150 px) y LOD 1 (720 px / 360 px) en AVIF, generados por shots-lod.mjs; el LOD 2 es el WebP original (shot()). */
export const lodSrc = (nivel: 0 | 1, slug: string, c: Captura) => `/v5/c/lod${nivel}/${slug}/${c.vista}-${c.vp}.avif`
export const LOD_ANCHO = { 0: { desktop: 320, mobile: 150 }, 1: { desktop: 720, mobile: 360 } } as const

/** Ancho de una captura a un alto dado, con la proporción real. */
export const anchoA = (vp: Viewport, alto: number) => Math.round((alto * SHOT_SIZE[vp].w) / SHOT_SIZE[vp].h)

/** Nº de cada obra con captura: posición por fecha del primer commit (telemetría) o, sin ella, por el inicio de su ventana;
 *  empate por el orden del registro. Los productos propios no tienen commits en la telemetría y van al final de su año. */
export function numerosDe(obras: Obra[]): Map<string, string> {
  const fecha = (o: Obra) => datosDe(o.slug).git?.first ?? (o.period ? `${o.period.start}-01` : `${o.year}-12-31`)
  const orden = obras
    .map((o, i) => ({ o, i, f: fecha(o) }))
    .filter((x) => x.o.views.length > 0)
    .sort((a, b) => (a.f < b.f ? -1 : a.f > b.f ? 1 : a.i - b.i))
  return new Map(orden.map((x, n) => [x.o.slug, String(n + 1).padStart(2, '0')]))
}

// Etiquetas de tecnología: las ocho de la taxonomía del sitio (FEATURES de ShopifyWork). «Islas React» sale de la telemetría
// (líneas de islas > 0), no del texto del stack: el texto daba 8 tiendas y la telemetría 15.
const TEC: { id: string; test: RegExp | null }[] = [
  { id: 'bundles', test: /bundle/i },
  { id: 'quiz', test: /quiz/i },
  { id: 'subscriptions', test: /subscription/i },
  { id: 'reviews', test: /review/i },
  { id: 'migration', test: /woocommerce|framer|migrat|port/i },
  { id: 'islands', test: null },
  { id: 'tracking', test: /track|pixel|analytics/i },
  { id: 'i18n', test: /bilingual|currency|dual/i },
]
export const TEC_IDS = TEC.map((t) => t.id)
const cacheTec = new Map<string, string[]>()
export function tecnologiasDe(o: Obra): string[] {
  let r = cacheTec.get(o.slug)
  if (!r) {
    const islas = (datosDe(o.slug).git?.lines.islands ?? 0) > 0
    r = TEC.filter((t) => (t.test ? o.stack.some((s) => t.test!.test(s)) : islas)).map((t) => t.id)
    cacheTec.set(o.slug, r)
  }
  return r
}

export type Por = 'rubro' | 'tec' | 'anio'
export const POR: Por[] = ['rubro', 'tec', 'anio']
/** Los años de la hoja: del primer cargo al actual (la mesa muestra los vacíos para que la ausencia se vea). */
export const ANIOS = [2022, 2023, 2024, 2025, 2026]
export interface Grupo {
  id: string
  titulo: string
  items: Obra[]
}

/** Agrupa las obras con captura para la Lectura y la Mesa. Una obra con varias etiquetas aparece en cada grupo que le toca. */
export function agrupar(obras: Obra[], por: Por, r: { producto: string; tec: Record<string, string>; collator: Intl.Collator; ascendente: boolean }, nr: Map<string, string>): Grupo[] {
  const mapa = new Map<string, Grupo>()
  const meter = (id: string, titulo: string, o: Obra) => {
    const g = mapa.get(id) ?? { id, titulo, items: [] }
    g.items.push(o)
    mapa.set(id, g)
  }
  for (const o of obras) {
    if (por === 'rubro') meter(`rubro-${o.industry ?? 'producto'}`, o.industry ?? r.producto, o)
    else if (por === 'anio') meter(`anio-${o.year}`, String(o.year), o)
    else for (const id of tecnologiasDe(o)) meter(`tec-${id}`, r.tec[id] ?? id, o)
  }
  const grupos = [...mapa.values()]
  for (const g of grupos) g.items.sort((a, b) => (nr.get(a.slug) ?? '').localeCompare(nr.get(b.slug) ?? ''))
  if (por === 'tec') return grupos.sort((a, b) => TEC_IDS.indexOf(a.id.slice(4)) - TEC_IDS.indexOf(b.id.slice(4)))
  if (por === 'anio') return grupos.sort((a, b) => (r.ascendente ? 1 : -1) * (Number(a.titulo) - Number(b.titulo)))
  return grupos.sort((a, b) => r.collator.compare(a.titulo, b.titulo))
}

// La capa pública de useV5 no limpia todos los textos del registro. Estas afirmaciones no tienen fuente (cifras redondas de universales,
// un método de pago, un plazo, «en vivo», un dominio sin DNS): la dirección no las imprime. Se descarta la frase, no la obra.
const SIN_FUENTE = [/\b(260|9[5-9])\s?\+/, /contra ?entrega|cash[- ]on[- ]delivery/i, /mismo d[ií]a|same-day/i, /digitdeck\.co|\ben vivo\b|\blive (at|since)\b/i, /cada (tarjeta|build)|every (build|store here)/i]
export const publico = (texto: string) =>
  texto
    .split(/(?<=[.!?。])\s+/)
    .filter((frase) => !SIN_FUENTE.some((re) => re.test(frase)))
    .join(' ')
export const stackPublico = (o: Obra) => o.stack.filter((s) => !SIN_FUENTE.some((re) => re.test(s)))
export const hechoPublico = (f: { label: string; value: string }) => !SIN_FUENTE.some((re) => re.test(f.label) || re.test(f.value))

const clave = 'v5-c'
/** Preferencia de la sesión (sessionStorage puede lanzar o estar vacío: siempre en try/catch). */
export function leerSesion(k: string): string | null {
  try {
    return sessionStorage.getItem(`${clave}:${k}`)
  } catch {
    return null
  }
}
export function guardarSesion(k: string, v: string) {
  try {
    sessionStorage.setItem(`${clave}:${k}`, v)
  } catch {
    /* sin almacenamiento: la vista funciona igual */
  }
}
