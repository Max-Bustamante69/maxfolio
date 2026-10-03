import { ANCLAS } from './anclas'
import { RECORTES, PIEL, PLANTILLA } from './manifiesto'

// Atlas por pieza: el dato son recortes REALES (una .shopify-section por elemento) con su clave real, su isla y su alto medido.
// La tabla que agrupa claves de varias tiendas en siete piezas es editorial (la aprueba Max): cada tile enseña la clave real y
// los recuentos salen de este manifiesto, nunca de un número escrito a mano.

export type RolId = 'anuncio' | 'cabecera' | 'hero' | 'carrusel' | 'resenas' | 'faq' | 'pie'
export const ROLES: RolId[] = ['anuncio', 'cabecera', 'hero', 'carrusel', 'resenas', 'faq', 'pie']

export interface MedidaVp {
  /** Alto real de la sección en px CSS al medir (1440 de ancho en escritorio, 390 en móvil). */
  h: number
  /** Ancho de la captura (1440 o 780 = 390 a 2x) y tamaño del WebP servido. */
  w: number
  imgW: number
  imgH: number
  kb: number
}
export interface Recorte {
  slug: string
  rol: RolId
  /** Clave real de la sección (el final del id `shopify-section-…__<clave>`). */
  clave: string
  /** `data-island` real, si la sección tiene isla. */
  isla: string | null
  /** Fecha de la medición de este recorte. */
  fecha: string
  d: MedidaVp | null
  m: MedidaVp | null
}
export interface Piel {
  titulares: string
  cuerpo: string
  /** Fondo del body leído de getComputedStyle, `null` si la tienda no declara uno (transparente). */
  fondo: [number, number, number] | null
}

export { PLANTILLA }

/** Orden fijo de tiendas dentro de cada tira: la misma tienda cae en la misma posición en todas las piezas. */
const ORDEN = ['nos-cafe', 'nalua', 'mindfuel', 'para-machos', 'tierramont', 'peluna', 'the-gummy-box', 'alma-de-aviador', 'atmosfera']

export const recortesDe = (rol: RolId): Recorte[] =>
  RECORTES.filter((r) => r.rol === rol && r.d).sort((a, b) => ORDEN.indexOf(a.slug) - ORDEN.indexOf(b.slug))

export const recorteDe = (rol: RolId, slug: string) => RECORTES.find((r) => r.rol === rol && r.slug === slug)

/** Piezas que tiene una tienda, en el orden del atlas. */
export const piezasDe = (slug: string): Recorte[] => ROLES.map((rol) => recorteDe(rol, slug)).filter((r): r is Recorte => !!r && !!r.d)

export const tiendasMedidas = (): string[] => ORDEN.filter((s) => RECORTES.some((r) => r.slug === s))

export const pielDe = (slug: string): Piel | null => PIEL[slug] ?? null

/** Fechas de medición distintas del atlas, de la más antigua a la más reciente. */
export const FECHAS = [...new Set(RECORTES.map((r) => r.fecha))].sort()

/** Fecha más reciente entre los recortes de una pieza (cada recuento lleva su fuente y su fecha). */
export const fechaDe = (rol: RolId) => recortesDe(rol).map((r) => r.fecha).sort().pop() ?? ''

/** Las piezas finas (anuncio, cabecera) se enseñan a 1:1,25 en una ventana de doble ancho; las demás, a todo el ancho del tile. */
export const esFina = (rol: RolId) => rol === 'anuncio' || rol === 'cabecera'

/** Escala fija de las piezas finas: a 1:1,25 un texto de 13 px sigue legible. */
export const FINA_K = 0.8
/** Multiplicador del ancho del tile: las finas y las altas (FAQ, pie) se leen al doble; en «ver todas» las altas vuelven a 1 para que quepan tres por fila. */
export const zoomDe = (rol: RolId, expandido = false) => (esFina(rol) ? 2 : rol === 'faq' || rol === 'pie' ? (expandido ? 1 : 2) : 1)
/** Escala (px de pantalla por px de la sección) a la que se dibuja una pieza, para el ancho de tile base dado. */
export const escalaDe = (rol: RolId, tw: number, expandido = false) => (esFina(rol) ? FINA_K : (tw * zoomDe(rol, expandido)) / 1440)

/** Px de la imagen (1440 de ancho) donde arranca la ventana de una barra fina: centrada en su texto, o en la primera palabra entera si es un marquee. */
export function ventanaX(r: Recorte, ancho: number) {
  const a = ANCLAS[`${r.rol}.${r.slug}`]
  if (!a) return 0
  const x = a.cw < ancho * 0.7 ? a.cx - ancho / 2 : a.g0
  return Math.round(Math.min(Math.max(x, 0), Math.max(0, 1440 - ancho)))
}

export const hex = (c: [number, number, number]) => '#' + c.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()

/** Alto de una pieza para el viewport activo. */
export const altoDe = (r: Recorte, movil: boolean) => (movil ? r.m?.h : r.d?.h) ?? r.d?.h ?? 0

/**
 * Regla de cotas: el paso es el menor «redondo» cuya separación en pantalla (paso × escala) deja leer la etiqueta;
 * el rango es el menor múltiplo del paso que cubre el alto máximo. Las marcas menores caen a mitad de paso.
 */
export function reglaDe(maxH: number, escala: number) {
  const paso = [10, 20, 25, 50, 100, 200, 250, 500].find((p) => p * escala >= 34) ?? 500
  const max = Math.max(paso, Math.ceil(maxH / paso) * paso)
  const mayores: number[] = []
  const menores: number[] = []
  for (let v = 0; v <= max; v += paso / 2) (v % paso === 0 ? mayores : menores).push(v)
  return { paso, max, mayores, menores }
}

/** «Escala 1:N» que se rotula en el título de la pieza para el ancho de tile dado. */
export const escalaTexto = (rol: RolId, tw: number, expandido = false) => {
  const n = 1 / escalaDe(rol, tw, expandido)
  return `1:${+n.toFixed(2)}`
}
