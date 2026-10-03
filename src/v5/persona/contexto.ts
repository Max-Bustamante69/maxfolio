import { createContext, useContext } from 'react'
import type { useV5 } from '../data'
import type { Copy } from './copy'

export const ID = 'persona'

export interface Ir {
  (to: string, opciones?: { sinBarrido?: boolean; retraso?: number }): void
}

/** Datos reales (useV5) y etiquetas de interfaz del idioma activo, una sola vez para toda la dirección. */
export interface Persona {
  v5: ReturnType<typeof useV5>
  c: Copy
  ir: Ir
}

export const PersonaCtx = createContext<Persona | null>(null)
export const usePersona = () => {
  const p = useContext(PersonaCtx)
  if (!p) throw new Error('usePersona fuera de la dirección Persona')
  return p
}
