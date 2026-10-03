import type { ComponentProps, MouseEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAjustes } from './ajustes'
import { conTransicion } from './movimiento'

type Extra = { foto?: boolean }

/** Clic que navega con el barrido de la dirección (View Transition). Con modificadores, otra pestaña o la misma ruta,
 *  deja actuar al navegador. `foto`: la primera imagen del enlace viaja al visor de la vista de destino. */
function useIr(foto?: boolean) {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const { reducido } = useAjustes()
  return (e: MouseEvent<HTMLAnchorElement>, to: string, target?: string) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (target && target !== '_self')) return
    e.preventDefault()
    if (to === pathname + search || to === pathname) return
    const img = foto ? (e.currentTarget.querySelector('img') as HTMLElement | null) : null
    conTransicion(() => navigate(to), { quieto: reducido, foto: img })
  }
}

export function Enlace({ foto, to, onClick, ...resto }: ComponentProps<typeof Link> & Extra) {
  const ir = useIr(foto)
  return (
    <Link
      {...resto}
      to={to}
      onClick={(e) => {
        onClick?.(e)
        ir(e, typeof to === 'string' ? to : '', resto.target)
      }}
    />
  )
}

export function EnlaceNav({ to, onClick, ...resto }: ComponentProps<typeof NavLink>) {
  const ir = useIr()
  return (
    <NavLink
      {...resto}
      to={to}
      onClick={(e) => {
        onClick?.(e)
        ir(e, typeof to === 'string' ? to : '')
      }}
    />
  )
}
