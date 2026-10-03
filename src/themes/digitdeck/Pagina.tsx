// Contenedor de cada vista (<main>): al montarse vuelve arriba (o, con «Atrás», a donde estaba), mide el punto final del título
// (destino del disco de la transición) y arma la coreografía de entrada con GSAP. Lo que está bajo el pliegue se revela al entrar a la vista; lo de
// arriba entra con el título. El estado oculto lo escribe JS: si JS no corre, todo queda visible.
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import { D, DESDE, EASE, aparecer, enPrimerPliegue, ocultarParaEntrar, revelarAlEntrar } from './movimiento'
import { leerCompartido, soltarCompartido, useTransicion, type InfoPagina } from './transicion'

const lineasDe = (el: Element) => [...el.querySelectorAll('.dd-ln > span')]

/** Dónde estaba el scroll al salir de cada entrada del historial: «Atrás» vuelve ahí; una navegación nueva va arriba. */
const posiciones = new Map<string, number>()
const destinos = new Map<string, string | null>()
/** La ficha que se acaba de dejar: el índice que se abre después lleva su fila al centro. Cualquier otra página lo consume. */
export const retorno: { slug: string | null } = { slug: null }

export function Pagina({ titulo, children, className = '' }: { titulo: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const t = useTransicion()
  const { key } = useLocation()
  const tipo = useNavigationType()
  // El <title> estático del index.html convive con uno hoistado por React: se fija el título del documento a mano.
  useEffect(() => {
    document.title = titulo
  }, [titulo])
  useLayoutEffect(() => {
    const main = ref.current!
    const guardada = tipo === 'POP' ? posiciones.get(key) : undefined
    // La ficha dejada se lee una sola vez por entrada del historial: en desarrollo StrictMode repite este efecto y la segunda
    // pasada debe llegar a la misma decisión.
    if (!destinos.has(key)) destinos.set(key, retorno.slug)
    const fila = destinos.get(key)
    retorno.slug = null
    window.scrollTo({ top: guardada ?? 0, behavior: 'instant' })
    if (guardada === undefined && fila) main.querySelector(`[data-slug="${fila}"]`)?.scrollIntoView({ block: 'center', behavior: 'instant' })
    let ultimo = scrollY // el scroll que se guarda al salir (el último oyente, no el que deja la página nueva al montar)
    const alScroll = () => void (ultimo = scrollY)
    addEventListener('scroll', alScroll, { passive: true })
    const sueltas: (() => void)[] = [() => removeEventListener('scroll', alScroll), () => void posiciones.set(key, ultimo)]
    let info!: InfoPagina
    const ctx = gsap.context(() => undefined, main) // creado antes para que los observadores puedan registrar sus tweens con ctx.add
    ctx.add(() => {
      const h1 = main.querySelector('h1')
      const dot = h1?.querySelector<HTMLElement>('[data-dd-dot]') ?? null
      const r = dot?.getBoundingClientRect()
      const destino = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, d: r.width } : null
      const lineasH1 = h1 ? lineasDe(h1) : []
      const viaja = main.querySelector<HTMLElement>('[data-dd-compartido]')
      const desde = viaja ? leerCompartido() : null
      // Sin viaje desde el índice (llegada directa o por el disco) la ventana entra como cualquier otro elemento.
      const entradas = [...main.querySelectorAll('[data-in]'), ...(viaja && !desde ? [viaja] : [])]
      const arriba = entradas.filter(enPrimerPliegue)
      const abajo = entradas.filter((e) => !arriba.includes(e))
      const titulos = [...main.querySelectorAll('.dd-titulo:not(h1)')].filter((h) => !enPrimerPliegue(h))

      gsap.set(lineasH1, { yPercent: DESDE })
      ocultarParaEntrar(entradas)
      titulos.forEach((h) => gsap.set(lineasDe(h), { yPercent: DESDE }))

      const tl = gsap.timeline({ paused: true })
      let inicio = 0
      if (viaja && desde) {
        // Elemento compartido (FLIP): la captura parte de la caja que tenía en el índice y se asienta en su sitio.
        const a = viaja.getBoundingClientRect()
        gsap.set(viaja, { transformOrigin: '0 0', x: desde.left - a.left, y: desde.top - a.top, scaleX: desde.width / a.width, scaleY: desde.height / a.height })
        tl.to(viaja, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.56, ease: EASE.out, clearProps: 'transform', onComplete: soltarCompartido }, 0)
        inicio = 0.2
      }
      tl.to(lineasH1, { yPercent: 0, duration: D.reveal, ease: EASE.out, stagger: D.stagger }, inicio)
        .add(aparecer(arriba), inicio + 0.12)
        .add(() => {
          dot?.setAttribute('data-pulse', 'true')
          h1?.setAttribute('data-listo', '')
        }, '>')

      sueltas.push(revelarAlEntrar(abajo, ctx))
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return
            io.unobserve(e.target)
            ctx.add(() => {
              gsap.to(lineasDe(e.target), { yPercent: 0, duration: D.reveal, ease: EASE.out, stagger: D.stagger })
              e.target.querySelector('[data-dd-dot]')?.setAttribute('data-pulse', 'true')
              gsap.delayedCall(D.reveal + D.stagger, () => e.target.setAttribute('data-listo', ''))
            })
          }),
        { rootMargin: '0px 0px -8% 0px' },
      )
      titulos.forEach((h) => io.observe(h))
      sueltas.push(() => io.disconnect())
      info = { destino, entrar: () => void tl.play() }
    })
    // Diferido un microtask: en StrictMode (dev) el primer montaje se revierte antes y no debe avisar a la transición.
    let cancelado = false
    queueMicrotask(() => !cancelado && t.paginaLista(info))
    return () => {
      cancelado = true
      sueltas.forEach((f) => f())
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <main ref={ref} id="main-content" tabIndex={-1} className={`dd-pagina ${className}`}>
      <meta name="robots" content="noindex" />
      {children}
    </main>
  )
}
