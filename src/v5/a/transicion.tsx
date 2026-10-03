import { createContext, useCallback, useContext, useLayoutEffect, useRef, type ComponentProps, type MouseEvent, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { v5path, useV5 } from '../data'
import { useCopy } from './copy'
import { CORTE, gsap } from './movimiento'
import { recordarSitio } from './sitio'

// Cambio de página (EX-7): un pliego de prueba. Una cortina de tinta cae desde arriba (120 ms, lineal) con el nombre de la
// vista de destino impreso en papel sobre la tinta y, cuando la vista nueva ya está montada debajo, se recoge hacia abajo
// (260 ms) descubriéndola de arriba abajo, como la inversión de una fila a escala de página. Cubierta total ≤ 450 ms,
// 0 esperas fijas: la cortina se recoge cuando la ruta cambia, y un temporizador de respaldo la suelta si no cambió.
// Se mueve con clip-path (no con scaleY) para que el rótulo no se deforme: solo se ve donde hay tinta.
// Atrás/Adelante del navegador no la usan: solo la entrada de la vista.
const Ctx = createContext<(a: string) => void>(() => {})
export const useIr = () => useContext(Ctx)

const OCULTA = 'inset(0% 0% 100% 0%)' // altura cero, pegada arriba
const CUBIERTA = 'inset(0% 0% 0% 0%)'
const RECOGIDA = 'inset(100% 0% 0% 0%)' // altura cero, pegada abajo

export function TransicionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { key, pathname, search } = useLocation()
  const nav = useCopy().nav
  const { obra } = useV5()
  const cortina = useRef<HTMLDivElement>(null)
  const rotulo = useRef<HTMLSpanElement>(null)
  const tapada = useRef(false)
  const aqui = useRef(pathname + search)
  aqui.current = pathname + search

  /** El nombre de la vista a la que se va: «Obra», «Trayectoria», «Contacto», «Inicio» o el de la obra. */
  const nombreDe = (a: string) => {
    const [vista = '', slug] = a.split('?')[0].replace(v5path('a'), '').split('/').filter(Boolean)
    return (vista === 'obra' && slug ? obra(slug)?.name : nav[vista as 'obra' | 'trayectoria' | 'contacto']) ?? nav.inicio
  }
  const nombre = useRef(nombreDe)
  nombre.current = nombreDe // el idioma activo cambia el nombre: ir() siempre lee el último

  const destapar = useCallback(() => {
    const el = cortina.current
    if (!el || !tapada.current) return
    tapada.current = false
    gsap.killTweensOf(el)
    gsap.to(el, { clipPath: RECOGIDA, duration: 0.26, ease: CORTE, onComplete: () => void gsap.set(el, { clipPath: OCULTA }) })
  }, [])

  const ir = useCallback(
    (a: string) => {
      const el = cortina.current
      if (!el) return navigate(a)
      if (a === aqui.current) return
      recordarSitio() // Atrás devuelve a este mismo sitio
      if (rotulo.current) rotulo.current.textContent = nombre.current(a)
      gsap.killTweensOf(el) // interrumpible: un segundo clic parte de donde está la cortina
      if (rotulo.current) gsap.fromTo(rotulo.current, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14, delay: 0.04, ease: 'none', overwrite: 'auto' })
      gsap.to(el, {
        clipPath: CUBIERTA,
        duration: 0.12,
        ease: 'none',
        onComplete: () => {
          tapada.current = true
          navigate(a)
          setTimeout(destapar, 600) // respaldo: la cortina nunca se queda puesta
        },
      })
    },
    [navigate, destapar],
  )

  // La vista nueva ya está en el DOM (sus efectos corrieron antes que este): se descubre.
  useLayoutEffect(destapar, [key, destapar])

  return (
    <Ctx.Provider value={ir}>
      {children}
      <div className="a-cortina" ref={cortina} aria-hidden="true">
        <span className="a-cortina-txt" ref={rotulo} />
      </div>
    </Ctx.Provider>
  )
}

type Props = Omit<ComponentProps<typeof Link>, 'to'> & { to: string; nav?: boolean }

/** Enlace interno de la dirección: pasa por la cortina; con modificadores, clic medio o destino nuevo se comporta como un enlace normal. */
export function Enlace({ to, nav, onClick, ...resto }: Props) {
  const ir = useIr()
  const alTocar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || resto.target === '_blank') return
    e.preventDefault()
    ir(to)
  }
  return nav ? <NavLink to={to} onClick={alTocar} {...(resto as object)} /> : <Link to={to} onClick={alTocar} {...resto} />
}
