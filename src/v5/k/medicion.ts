import raw from './data/radiografias.json'

// Datos medidos del DOM público de cada tienda (sonda propia, capturar-radiografias.mjs; ver public/v5/k/sondas/).
// Cada «placa» es una página (inicio o producto) a un ancho (1440 o 390) con su captura de página completa y, medido
// en el mismo instante: cada .shopify-section (clave real, y y alto en px), las islas React montadas (data-island) y
// los elementos con data-dd-component y su caja. Nada de esto se calcula en pantalla: las cajas vienen premedidas.

export type Capa = 'piel' | 'esqueleto' | 'medicion'
export type Vista = 'home' | 'pdp'
export type Disp = 'desktop' | 'mobile'

export interface Caja { c: string; x: number; y: number; w: number; h: number }
export interface Seccion { k: string; y: number; h: number; islas: string[]; dd: Caja[] }
export interface Placa {
  slug: string
  vista: Vista
  vp: Disp
  url: string
  fecha: string
  tema: string | null
  esquema: string | null
  alto: number
  ancho: number
  secs: Seccion[]
  cajones: string[]
  nIslas: number
  nMedidos: number
  nTipos: number
  img: string
  imgAncho: number
  imgAlto: number
}

export const PLACAS = (raw as { placas: Record<string, Placa> }).placas
export const placaId = (slug: string, vista: Vista, vp: Disp) => `${slug}-${vista}-${vp}`
export const placaDe = (slug: string, vista: Vista = 'home', vp: Disp = 'desktop') => PLACAS[placaId(slug, vista, vp)]
export const placasDe = (slug: string) => Object.values(PLACAS).filter((p) => p.slug === slug)
/** Miniatura de la tarjeta: el recorte superior (4:5) de la MISMA captura de la placa (public/v5/k/sondas/miniaturas.mjs). */
export const miniDe = (p: Placa) => p.img.replace('/placas/', '/placas/mini/')
/** Id de la tabla del inspector de una placa (el asa de la línea lo declara en aria-controls). */
export const idTabla = (p: Placa) => `k-tabla-${placaId(p.slug, p.vista, p.vp)}`
/** Dispositivo con el que se abre la placa de una tienda: móvil bajo 768 px si existe esa captura; si no, escritorio. */
export const vpPorDefecto = (slug: string): Disp =>
  typeof window !== 'undefined' && window.innerWidth < 768 && placaDe(slug, 'home', 'mobile') ? 'mobile' : 'desktop'

/** Tiendas con radiografía, en el orden de la regleta (NOS Café primero: es la placa 01). */
export const RADIOGRAFIADAS = [
  'nos-cafe', 'the-gummy-box', 'mindfuel', 'nalua', 'sebum', 'luxe-shine', 'atmosfera', 'peluna', 'origen-vital', 'para-machos', 'tierramont', 'alma-de-aviador',
].filter((s) => PLACAS[placaId(s, 'home', 'desktop')])

/** Por qué una tienda no tiene radiografía (se muestra con la barra rayada: ni escondida ni inventada). */
export type Motivo = 'cliente' | 'tercero' | 'sinMarcas' | 'sinDominio'
export const SIN_RADIOGRAFIA: Record<string, Motivo> = {
  unik: 'cliente', 'en-amor-a-dos': 'cliente', joystaz: 'cliente', 'new-urban': 'cliente',
  millennio: 'tercero', pixxiesx: 'tercero',
  'valdo-cafe': 'sinMarcas', 'factores-2x2': 'sinMarcas', 'saint-theory': 'sinMarcas',
  gummind: 'sinDominio', rimo: 'sinDominio',
}
export const motivoDe = (slug: string): Motivo => SIN_RADIOGRAFIA[slug] ?? 'sinMarcas'

/** Clave sin el sufijo aleatorio que el editor de Shopify añade (hero_YfrPPi → hero) para agrupar «Pieza». */
export const piezaDe = (k: string) => k.replace(/_[A-Za-z0-9]{6}$/, '')

/** Una caja medida; dos elementos sobre la misma geometría se dibujan como un solo anillo ×2. */
export interface Anillo { x: number; y: number; w: number; h: number; n: number; nombres: string[] }
export function anillos(secs: Seccion[]): Anillo[] {
  const m = new Map<string, Anillo>()
  for (const s of secs) {
    for (const e of s.dd) {
      const key = `${e.x}|${e.y}|${e.w}|${e.h}`
      const a = m.get(key) ?? { x: e.x, y: e.y, w: e.w, h: e.h, n: 0, nombres: [] }
      a.n += 1
      a.nombres.push(e.c)
      m.set(key, a)
    }
  }
  return [...m.values()].filter((a) => a.w > 0 && a.h > 0)
}

/** Sección bajo una posición de página: si dos se solapan (cabecera sobre el hero) gana la de menor alto. */
export function seccionEn(secs: Seccion[], y: number): number {
  let mejor = -1
  for (let i = 0; i < secs.length; i++) {
    const s = secs[i]
    if (y >= s.y && y < s.y + s.h && (mejor < 0 || s.h <= secs[mejor].h)) mejor = i
  }
  if (mejor >= 0) return mejor
  // Huecos entre secciones: la más cercana por encima.
  let cerca = 0
  for (let i = 0; i < secs.length; i++) if (secs[i].y <= y) cerca = i
  return cerca
}

/** Posición de página (px) donde se coloca la línea para «estar en» una sección. */
export function centroDe(secs: Seccion[], i: number): number {
  const s = secs[i]
  const c = s.y + Math.floor(s.h / 2)
  return seccionEn(secs, c) === i ? c : s.y + 1
}

/** Miles con punto en español y coma en inglés, también de 4 cifras (Intl no agrupa 8406 en es). */
export const formatoN = (locale: string) => {
  const sep = locale === 'es' ? '.' : ','
  return (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep)
}
