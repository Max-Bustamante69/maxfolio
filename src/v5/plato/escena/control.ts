// Puente entre el DOM (las vistas) y el mundo 3D (un solo lienzo). Las vistas escriben el OBJETIVO; el mundo lo persigue con
// amortiguación y deja de pedir fotogramas al llegar. Nada aquí es estado de React: el scroll no re-renderiza nada.
export type Modo = 'poster' | 'recorrido' | 'pedestal'
export interface Objetivo {
  modo: Modo
  /** Inicio: 0 = póster, 1 = la cámara ya entró al plató (estación 0). */
  apertura: number
  /** Recorrido: estación como número real (0 … N-1). */
  t: number
  /** Pedestal: la obra sobre la plataforma y la vista de sus capturas. */
  slug: string | null
  vista: 'home' | 'pdp'
}
/** Esquina interior del set activo en pantalla (px), su lado (−1 izquierda · +1 derecha), su opacidad y su caja (x0, y0, x1, y1). */
export interface Ancla { x: number; y: number; ok: boolean; a: number; lado: number; caja: [number, number, number, number] }

const obj: Objetivo = { modo: 'poster', apertura: 0, t: 0, slug: null, vista: 'home' }
const subs = new Set<() => void>()

export const control = {
  obj,
  /** Cambia el objetivo y despierta al mundo (si ya existe). */
  set(p: Partial<Objetivo>) {
    let cambio = false
    for (const k of Object.keys(p) as Array<keyof Objetivo>) if (obj[k] !== p[k]) { (obj as unknown as Record<string, unknown>)[k] = p[k]; cambio = true }
    if (cambio) subs.forEach((f) => f())
  },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f) } },
  /** Salidas del mundo hacia el DOM: el punto de anclaje del rótulo en pantalla y la estación más cercana. */
  alAncla: null as null | ((a: Ancla) => void),
  alEstacion: null as null | ((i: number) => void),
  /** La estación a la que vuelve «Fachada» desde una ficha (la ficha la escribe, el recorrido la lee una vez). */
  volver: null as number | null,
}
