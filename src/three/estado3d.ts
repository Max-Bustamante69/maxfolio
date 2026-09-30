import { useSyncExternalStore } from 'react'

/** apagada: sin decidir · cargando: capacidad OK, esperando pieza/idle/chunk · lista: Canvas montado · degradada: póster para todos. */
export type FaseEscena = 'apagada' | 'cargando' | 'lista' | 'degradada'

interface Estado {
  fase: FaseEscena
  /** Por qué se degradó (gama baja, reduced-motion, contexto perdido...). */
  motivo?: string
  /** Piezas montadas a ≤ 1 pantalla del viewport: la primera dispara la carga de three. */
  cerca: number
  /** Scroll rápido: el Canvas fijo va ~1 cuadro por detrás del DOM, así que mientras dura se enseña el póster (que es DOM). */
  rapido: boolean
}

let estado: Estado = { fase: 'apagada', cerca: 0, rapido: false }
const oyentes = new Set<() => void>()
const poner = (p: Partial<Estado>) => {
  estado = { ...estado, ...p }
  oyentes.forEach((f) => f())
}

export const leerEstado = () => estado
export const suscribir = (f: () => void) => {
  oyentes.add(f)
  return () => void oyentes.delete(f)
}
export function fijarFase(fase: FaseEscena, motivo?: string) {
  poner({ fase, motivo })
  if (typeof document !== 'undefined') document.documentElement.dataset.fase3d = fase
}
export const fijarRapido = (rapido: boolean) => estado.rapido !== rapido && poner({ rapido })
export function registrarCerca() {
  poner({ cerca: estado.cerca + 1 })
  return () => poner({ cerca: estado.cerca - 1 })
}

let invalidador: (() => void) | undefined
/** Escena3D enlaza el `invalidate()` de R3F aquí; el DOM lo usa para despertar el frameloop (puntero, progreso). */
export const enlazarInvalidador = (f: (() => void) | undefined) => {
  invalidador = f
}
export const invalidar3d = () => invalidador?.()

export const useEscena3d = () => useSyncExternalStore(suscribir, leerEstado, leerEstado)
