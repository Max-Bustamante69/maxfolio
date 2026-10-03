import { createContext, useContext, type CSSProperties, type MouseEvent } from 'react'
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom'
import type { Capa } from './medicion'
import { useCopy } from './copy'

export interface IrOpciones { sinBarrido?: boolean }
interface Ctx {
  /** Navega con el barrido de la dirección (la línea se lleva la vista vieja y deja caer la nueva). */
  ir: (a: string, o?: IrOpciones) => void
  capa: Capa
  setCapa: (c: Capa) => void
}
export const KCtx = createContext<Ctx>({ ir: () => {}, capa: 'medicion', setCapa: () => {} })
export const useK = () => useContext(KCtx)

const normal = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

export function KLink({ to, sinBarrido, onClick, ...rest }: LinkProps & { sinBarrido?: boolean }) {
  const { ir } = useK()
  return (
    <Link
      to={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || !normal(e)) return
        e.preventDefault()
        ir(typeof to === 'string' ? to : `${to.pathname ?? ''}${to.search ?? ''}`, { sinBarrido })
      }}
    />
  )
}

export function KNavLink({ to, onClick, ...rest }: NavLinkProps) {
  const { ir } = useK()
  return (
    <NavLink
      to={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || !normal(e)) return
        e.preventDefault()
        ir(typeof to === 'string' ? to : `${to.pathname ?? ''}${to.search ?? ''}`)
      }}
    />
  )
}

const CAPAS: Capa[] = ['piel', 'esqueleto', 'medicion']

/** Control segmentado Piel | Esqueleto | Medición (la capa que se ve por encima de la línea). El indicador se desliza con transform. */
export function SegCapa({ className = '' }: { className?: string }) {
  const c = useCopy()
  const { capa, setCapa } = useK()
  return (
    <div className={`k-seg ${className}`} role="group" aria-label={c.capa.aria} style={{ '--i': CAPAS.indexOf(capa) } as CSSProperties}>
      <span className="k-seg-ind" aria-hidden="true" />
      {CAPAS.map((o) => (
        <button key={o} type="button" aria-pressed={capa === o} onClick={() => setCapa(o)}>
          {c.capa[o]}
        </button>
      ))}
    </div>
  )
}

export const Flecha = ({ dir = 'abajo' }: { dir?: 'arriba' | 'abajo' | 'izq' | 'der' }) => (
  <svg className="k-flecha" data-dir={dir} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
    <path d="M7 2v10M2.5 7.5 7 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
  </svg>
)
