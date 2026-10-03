import { useLocation, useNavigate } from 'react-router-dom'
import { AB, THEMES, DEFAULT_THEME, isTheme, type ThemeId } from '../../ab.config'
import { track } from '../lib/track'
import type { DirectionMeta } from './data'

// Contrato del selector de temas: cada tema dibuja su propio selector con su lenguaje, pero todos leen la misma lista
// y cambian de tema con la misma función, así que el cambio conserva la vista y queda medido igual en los ocho.

const metas = import.meta.glob<{ default: DirectionMeta }>('./*/meta.ts', { eager: true })

export interface Tema {
  id: ThemeId
  nombre: string
  idea: string
  /** Primer pliegue del tema a 1440 (public/themes/<id>.webp) y a 390 (<id>-m.webp), para las vistas previas del selector. */
  preview: string
  previewMovil: string
  href: string
}

export const TEMAS: Tema[] = THEMES.map((id) => {
  const m = metas[`./${id}/meta.ts`]?.default
  return { id, nombre: m?.nombre ?? id, idea: m?.idea ?? '', preview: `/themes/${id}.webp`, previewMovil: `/themes/${id}-m.webp`, href: `/${id}` }
})
export { DEFAULT_THEME, isTheme, type ThemeId }

/** Tema actual (por el prefijo de la ruta) y cambio de tema que conserva la vista: /apple/obra/nos-cafe → /plato/obra/nos-cafe. */
export function useCambioDeTema() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [, primero = '', ...resto] = pathname.split('/')
  const actual: ThemeId = isTheme(primero) ? primero : DEFAULT_THEME
  const cambiar = (id: ThemeId) => {
    if (id === actual) return
    // La elección explícita manda sobre el sorteo: la próxima visita a `/` vuelve aquí.
    document.cookie = `${AB.cookie}=${id}; Path=/; Max-Age=${AB.maxAge}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    track('theme_switch', { from: actual, to: id })
    navigate(`/${id}${resto.length ? `/${resto.join('/')}` : ''}${search}`)
  }
  return { temas: TEMAS, actual, cambiar }
}
