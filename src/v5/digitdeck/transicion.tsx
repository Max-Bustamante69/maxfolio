// Transición de página con disco (EX-7): un disco violeta crece desde el clic (340 ms), la ruta cambia debajo y el disco se
// encoge (380 ms) hasta el punto final del título de la página nueva. Reacción visible ≤150 ms (el enlace se hunde y el disco
// ya crece), cubierta ≤450 ms, 0 esperas fijas: solo se espera a que la página nueva esté montada (tope de 1,2 s).
// Abrir una obra desde el índice NO usa la cubierta: la captura viaja a su sitio en la ficha (elemento compartido, FLIP).
import { createContext, useCallback, useContext, useMemo, useRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { D, EASE, distanciaALaBarra, instanteEn } from './movimiento'

export interface Destino { x: number; y: number; d: number }
export interface InfoPagina { destino: Destino | null; entrar: () => void }
/** Lo que viaja del índice a la ficha: el rectángulo de la captura en el que se hizo clic. */
export interface Compartido { rect: DOMRect; t: number }

let compartido: Compartido | null = null
/** La ficha lo lee solo si es reciente (un clic de hace minutos no es un viaje); no se borra al leerlo, porque en desarrollo
 *  (StrictMode) el montaje se repite. Se suelta al terminar el viaje o en cuanto otra navegación usa el disco. */
export function leerCompartido(): DOMRect | null {
  return compartido && performance.now() - compartido.t < 3000 ? compartido.rect : null
}
export const soltarCompartido = () => void (compartido = null)

interface Api {
  ir: (to: string, origen: { x: number; y: number }, etiqueta: string) => void
  irFicha: (to: string, rect: DOMRect) => void
  paginaLista: (info: InfoPagina) => void
  bloquear: (p: Promise<unknown>) => void
}
const Contexto = createContext<Api | null>(null)
export const useTransicion = () => useContext(Contexto)!

/** Promesa que se cumple cuando la línea de tiempo termina (encadena con el onComplete que ya tuviera). */
const esperar = (tl: gsap.core.Timeline) =>
  new Promise<void>((r) => {
    const previo = tl.eventCallback('onComplete')
    tl.eventCallback('onComplete', () => {
      previo?.call(tl)
      r()
    })
  })

export function TransicionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const raiz = useRef<HTMLDivElement>(null)
  const disco = useRef<HTMLDivElement>(null)
  const rotulo = useRef<HTMLDivElement>(null)
  const geo = useRef({ ox: 0, oy: 0, d: 0 })
  const secuencia = useRef(0)
  const pendiente = useRef<((i: InfoPagina) => void) | null>(null)
  const bloqueo = useRef<Promise<unknown>>(Promise.resolve())
  const vivo = useRef<gsap.core.Timeline | null>(null) // la cubierta en curso: el clic siguiente la mata con sus llamadas

  /** El cromo (cabecera) pasa a tinta SOLO mientras el disco lo cubre: lo enciende y lo apaga la línea de tiempo, no el clic. */
  const tinta = (on: boolean) => void raiz.current?.closest('.v5-digitdeck')?.toggleAttribute('data-cubierta', on)
  const altoBarra = () => document.querySelector<HTMLElement>('.dd-cab')?.offsetHeight ?? 0

  const crecer = useCallback((origen: { x: number; y: number }, etiqueta: string) => {
    const dEl = disco.current!
    const l = rotulo.current!
    vivo.current?.kill()
    gsap.killTweensOf([dEl, l, raiz.current])
    const radio = Math.hypot(Math.max(origen.x, innerWidth - origen.x), Math.max(origen.y, innerHeight - origen.y))
    const d = Math.ceil(radio * 2)
    geo.current = { ox: origen.x, oy: origen.y, d }
    gsap.set(raiz.current, { opacity: 1 })
    gsap.set(dEl, { width: d, height: d, left: origen.x - d / 2, top: origen.y - d / 2, scale: 0, x: 0, y: 0, willChange: 'transform' })
    l.textContent = etiqueta
    gsap.set(l, { opacity: 0, y: 10 })
    raiz.current!.dataset.activa = 'true'
    tinta(false)
    // El disco cubre la barra cuando su radio (curva de la cubierta × d/2) alcanza la esquina más lejana de la barra: ahí, y no antes, el cromo pasa a tinta.
    const cubre = instanteEn(EASE.cubierta, D.bloom, distanciaALaBarra(origen.x, origen.y, altoBarra()) / (d / 2))
    vivo.current = gsap
      .timeline()
      .to(dEl, { scale: 1, duration: D.bloom, ease: EASE.cubierta }, 0)
      .call(tinta, [true], cubre)
      .to(l, { opacity: 1, y: 0, duration: 0.14, ease: EASE.out }, 0.2)
    return esperar(vivo.current)
  }, [])

  const encoger = useCallback((destino: Destino | null) => {
    const dEl = disco.current!
    const { ox, oy, d } = geo.current
    vivo.current?.kill()
    const tl = (vivo.current = gsap.timeline({
      onComplete: () => {
        tinta(false)
        raiz.current!.dataset.activa = 'false'
        gsap.set(dEl, { willChange: 'auto' })
      },
    }))
    tl.to(rotulo.current, { opacity: 0, duration: 0.1 }, 0)
    if (destino) {
      const s1 = Math.max(destino.d / d, 0.0001)
      tl.to(dEl, { x: destino.x - ox, y: destino.y - oy, scale: s1, duration: D.contract, ease: EASE.out }, 0)
      // El cromo vuelve a su color en el instante en que el disco (centro y radio en cada cuadro de la curva) deja de cubrir la barra.
      const h = altoBarra()
      let u = 0
      for (; u < 1; u += 1 / 60) {
        const e = EASE.out(u)
        if ((d / 2) * (1 + (s1 - 1) * e) < distanciaALaBarra(ox + (destino.x - ox) * e, oy + (destino.y - oy) * e, h)) break
      }
      tl.call(tinta, [false], u * D.contract)
    } else {
      tl.to(raiz.current, { opacity: 0, duration: 0.22, ease: EASE.out }, 0).call(tinta, [false], 0.08)
    }
    return esperar(tl)
  }, [])

  const paginaLista = useCallback((info: InfoPagina) => {
    if (pendiente.current) {
      pendiente.current(info)
      pendiente.current = null
    } else void bloqueo.current.then(info.entrar)
  }, [])

  const ir = useCallback(
    async (to: string, origen: { x: number; y: number }, etiqueta: string) => {
      if (!raiz.current) return navigate(to)
      compartido = null
      const id = ++secuencia.current // el último clic gana: crecer() mata la cubierta en curso y la anterior deja de avanzar
      await crecer(origen, etiqueta)
      if (id !== secuencia.current) return
      const llega = new Promise<InfoPagina | null>((r) => {
        pendiente.current = r
        gsap.delayedCall(1.2, () => r(null)) // tope absoluto: si la ruta no llega, se encoge igual
      })
      navigate(to)
      const info = await llega
      if (id !== secuencia.current) return
      pendiente.current = null
      info?.entrar()
      await encoger(info?.destino ?? null)
    },
    [crecer, encoger, navigate],
  )

  const irFicha = useCallback(
    async (to: string, rect: DOMRect) => {
      compartido = { rect, t: performance.now() }
      const fuera = document.querySelectorAll('[data-fuera]')
      if (fuera.length) await esperar(gsap.timeline().to(fuera, { opacity: 0, duration: 0.14, ease: 'none' }))
      navigate(to)
    },
    [navigate],
  )

  const bloquear = useCallback((p: Promise<unknown>) => {
    bloqueo.current = p
  }, [])

  const api = useMemo<Api>(() => ({ ir, irFicha, paginaLista, bloquear }), [ir, irFicha, paginaLista, bloquear])
  return (
    <Contexto.Provider value={api}>
      {children}
      <div ref={raiz} className="dd-cubierta" aria-hidden="true" data-activa="false">
        <div ref={disco} className="dd-cubierta__disco" />
        <div ref={rotulo} className="dd-cubierta__rotulo" />
      </div>
    </Contexto.Provider>
  )
}

type PropsEnlace = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string
  /** Rótulo del destino sobre el disco. */
  etiqueta?: string
  /** Devuelve el elemento cuya caja viaja a la ficha: el enlace abre la obra con elemento compartido, sin cubierta. */
  viaja?: (a: HTMLAnchorElement) => Element | null
}

/** Enlace interno con la transición de la dirección. Con teclado el disco crece desde el centro del enlace. */
export function Enlace({ to, etiqueta = '', viaja, onClick, children, ...rest }: PropsEnlace) {
  const t = useTransicion()
  const { pathname, search } = useLocation()
  const alClic = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return
    e.preventDefault()
    if (to === pathname + search) return
    const a = e.currentTarget
    const caja = viaja?.(a)
    if (caja) return t.irFicha(to, caja.getBoundingClientRect())
    const r = a.getBoundingClientRect()
    t.ir(to, e.detail === 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: e.clientX, y: e.clientY }, etiqueta)
  }
  return (
    <a href={to} onClick={alClic} {...rest}>
      {children}
    </a>
  )
}
