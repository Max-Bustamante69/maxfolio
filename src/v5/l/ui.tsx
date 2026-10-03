import { Fragment, useCallback, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useV5, v5path } from '../data'
import { copyFor } from './copy'
import { salir } from './motion'

export const DIR = 'l'
export const ruta = (vista: '' | 'obra' | 'trayectoria' | 'contacto' = '', slug?: string) => v5path(DIR, vista, slug)

/** Contenido real (useV5), textos propios (copy) y si la pantalla es de teléfono (la pila vertical de la dirección). */
export function useL() {
  const v5 = useV5()
  const c = copyFor(v5.locale)
  const movil = useMediaQuery('(max-width: 760px)')
  const ancho = useMediaQuery('(min-width: 1280px)')
  const xl = useMediaQuery('(min-width: 1680px)')
  /** Ancho de tile en px (el mismo que --l-tw en tokens.css). */
  const tw = movil ? 160 : xl ? 380 : ancho ? 320 : 300
  return { v5, c, movil, tw, locale: v5.locale }
}

/** Navegar entre vistas con la raya y el telón; el mismo trayecto (solo cambia la consulta) corta sin transición. Si se pulsan dos enlaces seguidos, gana el último. */
export function useIr() {
  const navigate = useNavigate()
  return useCallback(
    (e: MouseEvent | null, to: string, origen?: Element | null, idVuelo?: string) => {
      if (e && (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return
      e?.preventDefault()
      const destino = new URL(to, window.location.origin)
      if (destino.pathname === window.location.pathname) {
        navigate(to)
        return
      }
      void salir(origen, idVuelo).then((vaAhora) => vaAhora && navigate(to))
    },
    [navigate],
  )
}

type EnlaceProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; origen?: () => Element | null | undefined; vuelo?: string; children: ReactNode }
/** Enlace real (href, clic central, teclado) que además dispara la transición de la dirección. */
export function Enlace({ to, origen, vuelo, onClick, children, ...rest }: EnlaceProps) {
  const ir = useIr()
  return (
    <Link
      to={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) ir(e, to, origen?.(), vuelo)
      }}
    >
      {children}
    </Link>
  )
}

/** Titular partido en frases y palabras: cada frase es un bloque en escritorio y cada palabra sube desde su línea base. El texto sigue siendo un solo h1 legible. */
export function Palabras({ texto }: { texto: string }) {
  const frases = texto.split(/(?<=[.!?])\s+/)
  return (
    <>
      {frases.map((f, k) => (
        <Fragment key={k}>
          <span className="l-sent">
            {f.split(' ').map((p, i, a) => (
              <Fragment key={i}>
                <span className="l-w">
                  <span>{p}</span>
                </span>
                {i < a.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </span>
          {k < frases.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

export function Flecha({ dir = 'der' }: { dir?: 'der' | 'izq' | 'arriba' }) {
  const d = dir === 'der' ? 'M3 8h10M9 4l4 4-4 4' : dir === 'izq' ? 'M13 8H3M7 4L3 8l4 4' : 'M8 13V3M4 7l4-4 4 4'
  return (
    <svg className="l-flecha" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

export function Equis() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  )
}

/** Parámetros de consulta de una URL con un valor cambiado (o quitado si es null). */
export function conParam(search: string, clave: string, valor: string | null) {
  const p = new URLSearchParams(search)
  if (valor === null) p.delete(clave)
  else p.set(clave, valor)
  const s = p.toString()
  return s ? `?${s}` : ''
}
