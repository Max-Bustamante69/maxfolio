import { useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent, type RefObject } from 'react'
import { useCambioDeTema, type Tema, type ThemeId } from '../temas'
import { useCopy } from './copy'
import { gsap } from './motion'
import './selector.css'

// Selector de temas de la dirección Apple: el panel «Apariencia» de Ajustes del Sistema. Popover de vidrio bajo el botón en
// escritorio; hoja inferior con asa en móvil. Se carga con lazy() al abrirlo: hasta entonces no hay ni imágenes ni CSS ni código.
// Movimiento: el panel brota del botón con un resorte amortiguado, las miniaturas entran escalonadas y un único anillo azul
// viaja de una a otra al elegir. Todo es GSAP dentro de un gsap.context; con el panel quieto no hay un solo fotograma.

/** Resorte amortiguado como curva de GSAP: z = amortiguación (0,6 deja un rebote del 9 %), w = rapidez. Termina en 1 sin salto. */
const resorte = (z: number, w: number) => {
  const k = Math.sqrt(1 - z * z)
  return (t: number) => (t >= 1 ? 1 : 1 - Math.exp(-z * w * t) * (Math.cos(w * k * t) + (z / k) * Math.sin(w * k * t)))
}
const MUELLE = resorte(0.62, 10)
const MUELLE_HOJA = resorte(0.8, 9)

const esMovil = () => window.matchMedia('(max-width: 767px)').matches
/** Pausa entre el toque y el cambio de tema: lo justo para ver el anillo asentarse en la elegida. */
const ASENTAR_MS = 230
/** Red de seguridad: si pasado este tiempo el tema nuevo no ha reemplazado a este (la navegación sin recarga quedó atascada),
 *  se entra al enlace de la miniatura con una carga completa; la cookie del reparto ya está escrita. */
const RESCATE_MS = 6000

const Equis = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

/** Miniatura: móvil (390×844) hasta 767 px, escritorio (720×450) desde ahí. Aparece con un fundido cuando llega. */
function Vista({ t }: { t: Tema }) {
  const img = useRef<HTMLImageElement>(null)
  const [lista, setLista] = useState(false)
  useLayoutEffect(() => { if (img.current?.complete && img.current.naturalWidth) setLista(true) }, [])
  return (
    <span className="ap-tm-vista">
      <picture>
        <source media="(max-width: 767px)" srcSet={t.previewMovil} />
        <img ref={img} src={t.preview} alt={t.nombre} width={720} height={450} loading="lazy" decoding="async" data-lista={lista || undefined} onLoad={() => setLista(true)} />
      </picture>
    </span>
  )
}

export default function Selector({ anclaje, cerrar }: { anclaje: RefObject<HTMLButtonElement | null>; cerrar: () => void }) {
  const c = useCopy()
  const { temas, actual, cambiar } = useCambioDeTema()
  const [elegido, setElegido] = useState<ThemeId>(actual)
  const panel = useRef<HTMLDivElement>(null)
  const velo = useRef<HTMLDivElement>(null)
  const rejilla = useRef<HTMLDivElement>(null)
  const anillo = useRef<HTMLSpanElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const marcado = useRef<ThemeId>(actual)
  const estado = useRef({ saliendo: false, eligiendo: false, restaurar: false, espera: 0, rescate: 0, y0: 0, t0: 0, dy: 0, puntero: -1 })
  // Lo que el efecto de montaje necesita de la versión más reciente del render (cambiar() cambia de identidad en cada uno).
  const vivo = useRef({ cambiar, actual })
  vivo.current = { cambiar, actual }

  /** Escritorio: el panel cuelga bajo el botón, alineado a su borde derecho y sin salirse de la ventana; el resorte nace en el centro del botón. */
  const colocar = () => {
    const p = panel.current
    if (!p) return
    if (esMovil()) { p.style.left = ''; p.style.right = ''; return }
    const r = anclaje.current?.getBoundingClientRect()
    const margen = 12
    const ancho = p.offsetWidth
    const borde = r ? r.right : window.innerWidth - margen
    const izq = Math.min(Math.max(margen, borde - ancho), window.innerWidth - ancho - margen)
    p.style.left = `${izq}px`
    p.style.right = 'auto'
    p.style.setProperty('--ap-origen', `${(r ? r.left + r.width / 2 : borde) - izq}px`)
  }

  /** Lleva el anillo a la miniatura `id` (con el resorte si `animar`, de golpe si no). Mide con offset*: ignora los transform de la entrada. */
  const moverAnillo = (id: ThemeId, animar: boolean) => {
    const v = rejilla.current?.querySelector<HTMLElement>(`[data-id="${id}"] .ap-tm-vista`)
    if (!v || !anillo.current || !rejilla.current) return
    let x = 0
    let y = 0
    for (let n: HTMLElement | null = v; n && n !== rejilla.current; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop }
    const vars = { x: x - 6, y: y - 6, width: v.offsetWidth + 12, height: v.offsetHeight + 12 }
    if (animar) ctx.current?.add(() => { gsap.to(anillo.current, { ...vars, duration: 0.65, ease: MUELLE, overwrite: 'auto' }) })
    else gsap.set(anillo.current, vars)
  }

  /** Cierra con su salida. Lo pide la persona (Esc, velo, equis, arrastre o la misma miniatura): el foco vuelve al botón. */
  const salir = () => {
    const e = estado.current
    if (e.saliendo) return
    e.saliendo = true
    e.restaurar = true
    panel.current?.setAttribute('data-saliendo', '')
    ctx.current?.add(() => {
      const p = panel.current!
      const tl = gsap.timeline({ onComplete: cerrar })
      tl.to(velo.current, { opacity: 0, duration: 0.24, ease: 'power2.in', overwrite: true }, 0)
      if (esMovil()) tl.to(p, { y: p.offsetHeight + 40, duration: 0.32, ease: 'power3.in', overwrite: 'auto' }, 0)
      else tl.to(p, { opacity: 0, scale: 0.96, y: -6, duration: 0.18, ease: 'power2.in', overwrite: 'auto' }, 0)
    })
  }

  useLayoutEffect(() => {
    const p = panel.current!
    const movil = esMovil()
    const e = estado.current

    // El resto de la página queda quieta e inerte (como la hoja del menú): foco, lectores de pantalla y toques se quedan en el panel.
    const inertos = [...document.querySelectorAll<HTMLElement>('.ap-vista, .ap-pie, .ap-saltar'), anclaje.current?.closest<HTMLElement>('.ap-nav-in')].filter((el): el is HTMLElement => !!el)
    inertos.forEach((el) => el.setAttribute('inert', ''))
    const desbordePrevio = document.documentElement.style.overflow
    if (movil) document.documentElement.style.overflow = 'hidden'

    ctx.current = gsap.context(() => {
      colocar()
      moverAnillo(actual, false)
      const tarjetas = gsap.utils.toArray<HTMLElement>('.ap-tm-li', p)
      gsap.fromTo(velo.current, { opacity: 0 }, { opacity: 1, duration: movil ? 0.45 : 0.35, ease: 'power2.out' })
      if (movil) {
        gsap.fromTo(p, { y: p.offsetHeight + 40 }, { y: 0, duration: 0.85, ease: MUELLE_HOJA, clearProps: 'transform' })
      } else {
        gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out', clearProps: 'opacity' })
        gsap.fromTo(p, { scale: 0.86, y: -12 }, { scale: 1, y: 0, duration: 0.75, ease: MUELLE, clearProps: 'transform' })
      }
      gsap.from('.ap-tm-cab', { opacity: 0, y: 8, duration: 0.6, ease: 'apple', delay: 0.08, clearProps: 'transform,opacity' })
      gsap.from(tarjetas, { opacity: 0, y: movil ? 24 : 14, scale: 0.94, duration: 0.75, ease: 'apple', delay: movil ? 0.16 : 0.1, stagger: 0.045, clearProps: 'transform,opacity' })
      gsap.from(anillo.current, { opacity: 0, scale: 1.1, duration: 0.7, ease: MUELLE, delay: 0.32 })
    }, p)

    // La miniatura del tema actual toma el foco: con el teclado, las flechas parten de ahí.
    p.querySelector<HTMLElement>('a[aria-current="true"]')?.focus({ preventScroll: true })

    const tarjetas = () => [...p.querySelectorAll<HTMLAnchorElement>('.ap-tm-op')]
    const alTeclear = (ev: KeyboardEvent) => {
      if (e.saliendo) return
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); salir(); return }
      if (ev.key === 'Tab') {
        // Trampa de foco: de la última opción vuelve a la primera control, y al revés.
        const todos = [...p.querySelectorAll<HTMLElement>('a[href], button')]
        const i = todos.indexOf(document.activeElement as HTMLElement)
        if (ev.shiftKey && i <= 0) { ev.preventDefault(); todos[todos.length - 1].focus() }
        else if (!ev.shiftKey && (i === -1 || i === todos.length - 1)) { ev.preventDefault(); todos[0].focus() }
        return
      }
      // Flechas: la rejilla se recorre como en Ajustes. Las columnas se leen de la propia rejilla (cambian con el ancho).
      const lista_ = tarjetas()
      const i = lista_.indexOf(document.activeElement as HTMLAnchorElement)
      if (i === -1 || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ev.key)) return
      const columnas = lista_.filter((a) => a.offsetTop === lista_[0].offsetTop).length || 1
      const destino = ev.key === 'ArrowRight' ? i + 1 : ev.key === 'ArrowLeft' ? i - 1 : ev.key === 'ArrowDown' ? i + columnas : ev.key === 'ArrowUp' ? i - columnas : ev.key === 'Home' ? 0 : lista_.length - 1
      ev.preventDefault()
      if (destino >= 0 && destino < lista_.length) lista_[destino].focus()
    }
    const alAjustar = () => { colocar(); moverAnillo(marcado.current, false) }
    document.addEventListener('keydown', alTeclear, true)
    window.addEventListener('resize', alAjustar)
    // Si llegan las fuentes o cambia el alto de una fila, el anillo sigue a su miniatura.
    const ro = new ResizeObserver(() => moverAnillo(marcado.current, false))
    ro.observe(rejilla.current!)

    return () => {
      document.removeEventListener('keydown', alTeclear, true)
      window.removeEventListener('resize', alAjustar)
      ro.disconnect()
      window.clearTimeout(e.espera)
      window.clearTimeout(e.rescate)
      inertos.forEach((el) => el.removeAttribute('inert'))
      document.documentElement.style.overflow = desbordePrevio
      ctx.current?.revert()
      ctx.current = null
      if (e.restaurar) anclaje.current?.focus({ preventScroll: true })
    }
    // El montaje corre una vez: lo que cambia entre renders se lee de refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const alElegir = (ev: MouseEvent<HTMLAnchorElement>, t: Tema) => {
    // Con modificadores (abrir en pestaña nueva) manda el <a>; con un clic normal, el cambio sin recargar.
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return
    ev.preventDefault()
    const e = estado.current
    if (e.saliendo || e.eligiendo) return
    if (t.id === vivo.current.actual) { salir(); return }
    e.eligiendo = true
    marcado.current = t.id
    setElegido(t.id)
    moverAnillo(t.id, true)
    panel.current?.setAttribute('data-saliendo', '')
    e.espera = window.setTimeout(() => vivo.current.cambiar(t.id), ASENTAR_MS)
    e.rescate = window.setTimeout(() => window.location.assign(t.href), ASENTAR_MS + RESCATE_MS)
  }

  // Asa de la hoja: se arrastra hacia abajo; suelta rápido o lejos y se cierra, si no vuelve con el resorte.
  const alBajar = (ev: PointerEvent<HTMLDivElement>) => {
    const e = estado.current
    if (!esMovil() || e.saliendo || e.eligiendo) return
    e.puntero = ev.pointerId
    e.y0 = ev.clientY
    e.t0 = ev.timeStamp
    e.dy = 0
    ev.currentTarget.setPointerCapture(ev.pointerId)
    gsap.killTweensOf([panel.current, velo.current])
  }
  const alMover = (ev: PointerEvent<HTMLDivElement>) => {
    const e = estado.current
    if (e.puntero !== ev.pointerId) return
    e.dy = Math.max(0, ev.clientY - e.y0)
    gsap.set(panel.current, { y: e.dy })
    gsap.set(velo.current, { opacity: 1 - Math.min(1, e.dy / (panel.current?.offsetHeight || 1)) * 0.85 })
  }
  const alSoltar = (ev: PointerEvent<HTMLDivElement>) => {
    const e = estado.current
    if (e.puntero !== ev.pointerId) return
    e.puntero = -1
    const velocidad = e.dy / Math.max(1, ev.timeStamp - e.t0)
    if (e.dy > 120 || (velocidad > 0.5 && e.dy > 24)) { salir(); return }
    ctx.current?.add(() => {
      gsap.to(panel.current, { y: 0, duration: 0.6, ease: MUELLE_HOJA, clearProps: 'transform' })
      gsap.to(velo.current, { opacity: 1, duration: 0.3 })
    })
  }

  return (
    <>
      <div ref={velo} className="ap-tm-velo" aria-hidden="true" onClick={salir} />
      <div ref={panel} id="ap-temas" className="ap-tm" role="dialog" aria-modal="true" aria-labelledby="ap-tm-tit" tabIndex={-1}>
        <div className="ap-tm-asa" aria-hidden="true" onPointerDown={alBajar} onPointerMove={alMover} onPointerUp={alSoltar} onPointerCancel={alSoltar}><i /></div>
        <div className="ap-tm-cuerpo">
          <div className="ap-tm-cab">
            <div>
              <h2 className="ap-tm-tit" id="ap-tm-tit">{c.temas.titulo}</h2>
              <p className="ap-tm-ayuda">{c.temas.ayuda}</p>
            </div>
            <button type="button" className="ap-tm-cerrar" aria-label={c.temas.cerrar} onClick={salir}><Equis /></button>
          </div>
          <div className="ap-tm-rejilla" ref={rejilla}>
          <ul className="ap-tm-lista" aria-label={c.temas.titulo}>
            {temas.map((t) => (
              <li key={t.id} className="ap-tm-li" data-id={t.id}>
                <a className="ap-tm-op" href={t.href} aria-current={t.id === actual ? 'true' : undefined} aria-labelledby={`ap-tm-n-${t.id} ap-tm-l-${t.id}`} data-marcado={t.id === elegido ? '' : undefined} onClick={(ev) => alElegir(ev, t)}>
                  <Vista t={t} />
                  <span className="ap-tm-nombre" id={`ap-tm-n-${t.id}`}><b>{t.nombre}</b></span>
                  <span className="ap-tm-lema" id={`ap-tm-l-${t.id}`}>{t.lema}</span>
                </a>
              </li>
            ))}
          </ul>
          <span className="ap-tm-anillo" ref={anillo} aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  )
}
