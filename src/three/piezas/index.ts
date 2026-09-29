import type { ModuloPieza, SlugPieza } from '../tipos'

/** Cada gemela es su propio chunk: solo se descarga la de las piezas que la página monta. */
export const CARGADORES: Record<SlugPieza, () => Promise<ModuloPieza>> = {
  'monograma-mb': () => import('./monograma-mb'),
  'orbita-tiendas': () => import('./orbita-tiendas'),
  'objetos-feature': () => import('./objetos-feature'),
  'relieve-medellin': () => import('./relieve-medellin'),
  dispositivos: () => import('./dispositivos'),
}
