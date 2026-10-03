import type { Obra } from '../data'
import { ANIOS, capturasDe, type Grupo, type Por } from './datos'

// Coordenadas de mundo de la Mesa (unidad de 8 px). Una diapositiva conserva su proporción real: escritorio 480×300, móvil 139×300.
// Un paquete es la fila home-D · pdp-D · home-M · pdp-M con 16 px entre piezas, dentro de un marco oscuro con un pie para el código.
export const SD = { w: 480, h: 300 }
export const SM = { w: 139, h: 300 }
export const HUECO = 16
export const PAD = 14
export const PIE = 48
export const ALTO_PAQ = PAD + SD.h + PIE
/** En el móvil el pie del marco es más alto: con el zoom de lectura (≈ 0,28) su código a 12 px de pantalla cabe dentro del marco. */
export const PIE_M = 84

export const anchoPaquete = (o: Obra) => {
  const caps = capturasDe(o)
  return PAD * 2 + caps.reduce((s, c) => s + (c.vp === 'desktop' ? SD.w : SM.w), 0) + HUECO * Math.max(0, caps.length - 1)
}

const COL = PAD * 2 + 2 * SD.w + 2 * SM.w + 3 * HUECO + 64 // paso entre columnas de paquetes
const CABEZA = 64 // hueco entre el borde del bloque y su primer paquete
const POR_COLUMNA = 6 // «2026 va en tres columnas de seis paquetes»

export interface Pieza {
  id: string
  slug: string
  copia: number
  grupo: string
  x: number
  y: number
  w: number
  h: number
}
export interface Etiqueta {
  id: string
  titulo: string
  n: number
  x: number
  y: number
}
export interface Hueco {
  id: string
  titulo: string
  x: number
  y: number
  w: number
  h: number
}
export interface Mundo {
  piezas: Pieza[]
  etiquetas: Etiqueta[]
  huecos: Hueco[]
  /** El borde discontinuo de cada grupo con capturas (la maqueta enmarca los grupos como zonas de la mesa). */
  cajas: Hueco[]
  w: number
  h: number
}

/** Reparte los grupos de una disposición en estantes (filas de bloques); cada bloque llena columnas de seis paquetes.
 *  Una obra con varias etiquetas aparece en cada grupo que le toca: la primera vez es la diapositiva completa y el resto, copias ligeras.
 *  El ancho del estante se elige para que la mesa entera tenga la proporción de la pantalla (así «ver todo» aprovecha el espacio).
 *  En el móvil (`movil`) cada grupo es UNA columna y los grupos se apilan: el zoom de lectura es el ancho de una columna (≈ 0,28) y las etiquetas nunca se pisan. */
export function disponer(grupos: Grupo[], por: Por, obras: Map<string, Obra>, titulos: (anio: number) => string, aspecto = 1.9, movil = false): Mundo {
  const lista: (Grupo & { vacio?: boolean })[] = [...grupos]
  if (por === 'anio') {
    for (const y of ANIOS) if (!lista.some((g) => g.id === `anio-${y}`)) lista.push({ id: `anio-${y}`, titulo: String(y), items: [], vacio: true })
    lista.sort((a, b) => Number(a.titulo) - Number(b.titulo))
  }
  if (movil) return colocar(lista, obras, titulos, COL, true)
  const candidatos = por === 'anio' ? [Infinity] : [2, 3, 4, 5, 6, 7, 8, 10].map((n) => n * COL)
  let mejor: Mundo | null = null
  let error = Infinity
  for (const maxAncho of candidatos) {
    const m = colocar(lista, obras, titulos, maxAncho)
    const e = Math.abs(Math.log(m.w / m.h / aspecto))
    if (e < error - 1e-9) {
      error = e
      mejor = m
    }
  }
  return mejor!
}

function colocar(lista: (Grupo & { vacio?: boolean })[], obras: Map<string, Obra>, titulos: (anio: number) => string, maxAncho: number, movil = false): Mundo {
  const visto = new Map<string, number>()
  const mundo: Mundo = { piezas: [], etiquetas: [], huecos: [], cajas: [], w: 0, h: 0 }
  const porColumna = movil ? Infinity : POR_COLUMNA
  const altoPaq = movil ? PAD + SD.h + PIE_M : ALTO_PAQ
  const fila = altoPaq + 40
  const entreEstantes = movil ? 120 : 200
  let x = 0
  let y = 0
  let altoEstante = 0
  for (const g of lista) {
    const cols = Math.max(1, Math.ceil(g.items.length / porColumna))
    const filas = Math.max(1, Math.min(g.items.length, porColumna))
    const ancho = cols * COL - 64
    const alto = CABEZA + filas * fila - 40
    if (x > 0 && x + ancho > maxAncho) {
      x = 0
      y += altoEstante + entreEstantes
      altoEstante = 0
    }
    mundo.etiquetas.push({ id: g.id, titulo: g.titulo, n: g.items.length, x, y: y + CABEZA - 16 }) // la etiqueta se apoya sobre sus paquetes y crece hacia arriba
    if (g.vacio) mundo.huecos.push({ id: g.id, titulo: titulos(Number(g.titulo)), x, y: y + CABEZA, w: COL - 64, h: altoPaq })
    else mundo.cajas.push({ id: g.id, titulo: g.titulo, x: x - 24, y: y + 4, w: ancho + 48, h: alto + 20 })
    g.items.forEach((o, i) => {
      const copia = visto.get(o.slug) ?? 0
      visto.set(o.slug, copia + 1)
      mundo.piezas.push({
        id: `${o.slug}~${copia}`,
        slug: o.slug,
        copia,
        grupo: g.titulo,
        x: x + Math.floor(i / porColumna) * COL,
        y: y + CABEZA + (i % porColumna) * fila,
        w: anchoPaquete(obras.get(o.slug)!),
        h: altoPaq,
      })
    })
    x += ancho + 160
    altoEstante = Math.max(altoEstante, alto)
    mundo.w = Math.max(mundo.w, x - 160)
  }
  mundo.h = y + altoEstante
  return mundo
}
