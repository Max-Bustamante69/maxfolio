import { useCallback, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

// Motor de movimiento de la dirección Ingeniería. GSAP coreografía (SplitText, timelines); el scroll es el del navegador.
// ScrollTrigger NO se usa: deja un requestAnimationFrame perpetuo y la página quieta debe pedir cero fotogramas
// (idle-frame-budget Z-1). Las escenas de scroll son UN oyente pasivo que pide un fotograma por ráfaga de scroll.
// Solo se anima transform, opacity y clip-path. El estado oculto lo escribe JS: si JS falla, nada queda escondido.
gsap.registerPlugin(SplitText)
gsap.config({ autoSleep: 30 })
export { gsap, SplitText }

/** La curva de la casa: expo-out. Reacción inmediata, aterrizaje suave (la misma que en CSS: cubic-bezier(.16,1,.3,1)). */
export const SALE = 'expo.out'

/* ------------------------------------------------------------------ escenas de scroll */

interface Escena { el: HTMLElement; tl: gsap.core.Timeline; suave: number; rango: [number, number]; top: number; alto: number; ultimo: number }
const escenas = new Set<Escena>()
let pendiente = 0
let observador: ResizeObserver | null = null

// offsetTop/offsetHeight (no getBoundingClientRect): ignoran los transform de reveal del propio nodo y de sus ancestros.
const topAbs = (el: HTMLElement) => {
  let t = 0
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop
  return t
}
const medir = (e: Escena) => { e.top = topAbs(e.el); e.alto = e.el.offsetHeight; e.ultimo = -1 }
/** 0 → 1 mientras el elemento cruza la ventana, del borde bajo al alto. */
const progreso = (e: Escena) => {
  const vh = window.innerHeight
  const bruto = Math.min(1, Math.max(0, (window.scrollY + vh - e.top) / (e.alto + vh)))
  const [a, b] = e.rango
  return Math.min(1, Math.max(0, (bruto - a) / (b - a)))
}
function pintar() {
  pendiente = 0
  escenas.forEach((e) => {
    const p = progreso(e)
    if (p === e.ultimo) return
    e.ultimo = p
    if (e.suave) gsap.to(e.tl, { progress: p, duration: e.suave, ease: 'power3.out', overwrite: true })
    else e.tl.progress(p)
  })
}
const pedir = () => { if (!pendiente) pendiente = requestAnimationFrame(pintar) }
const remedir = () => { escenas.forEach(medir); pedir() }

/** Ata una línea de tiempo al scroll. Devuelve la función que la suelta. El estado final de la línea es el diseño en reposo. */
export function escena(el: HTMLElement, tl: gsap.core.Timeline, o: { suave?: number; rango?: [number, number] } = {}) {
  const e: Escena = { el, tl: tl.pause(), suave: o.suave ?? 0.4, rango: o.rango ?? [0, 1], top: 0, alto: 1, ultimo: -1 }
  if (!escenas.size) {
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', remedir)
    observador = new ResizeObserver(remedir)
    observador.observe(document.body)
  }
  escenas.add(e)
  medir(e)
  e.tl.progress(progreso(e))
  return () => {
    escenas.delete(e)
    if (!escenas.size) {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', remedir)
      observador?.disconnect()
      if (pendiente) cancelAnimationFrame(pendiente)
      pendiente = 0
    }
  }
}

/* ------------------------------------------------------------------ revelados declarativos */

type Entrada = (retraso: number) => void
type Atar = (el: HTMLElement) => Entrada | void
const juega = (vars: gsap.TweenVars) => ({ duration: 0.85, ease: SALE, clearProps: 'transform,opacity', ...vars })

/** Titular que sube línea por línea dentro de una máscara (se re-divide si cambia el ancho; lo ya jugado no se repite). */
const lineas = (el: HTMLElement, opts: { y?: number; dur?: number; esc?: number } = {}) => {
  let tw: gsap.core.Tween | undefined
  let entro = false
  let jugado = false
  let espera = 0
  SplitText.create(el, {
    // aria 'none': las líneas son envoltorios visuales del mismo texto; 'auto' pondría aria-label en un <p>, donde está prohibido.
    type: 'lines', mask: 'lines', linesClass: 'ing-ln', autoSplit: true, aria: 'none',
    onSplit: (s) => {
      tw = gsap.from(s.lines, { yPercent: opts.y ?? 110, duration: opts.dur ?? 0.9, ease: SALE, stagger: opts.esc ?? 0.08, delay: espera, paused: !entro, onComplete: () => { jugado = true } })
      if (jugado) tw.progress(1)
      return tw
    },
  })
  return ((r) => { entro = true; espera = r; tw?.delay(r).play() }) as Entrada
}

/** Cifra que entra carácter a carácter dentro de una máscara (como un contador mecánico). */
const cifra = (el: HTMLElement) => {
  const s = SplitText.create(el, { type: 'chars', mask: 'chars', charsClass: 'ing-ch' })
  gsap.set(s.chars, { yPercent: 105 })
  return ((r) => { gsap.to(s.chars, { yPercent: 0, duration: 0.9, ease: SALE, stagger: 0.045, delay: r }) }) as Entrada
}

/** El nombre en serif de exhibición: cada letra sube dentro de su máscara, de izquierda a derecha, en ≈ 1,2 s. */
const nombre = (el: HTMLElement) => {
  const s = SplitText.create(el, { type: 'chars', mask: 'chars', charsClass: 'ing-ch' })
  gsap.set(s.chars, { yPercent: 108 })
  return ((r) => { gsap.to(s.chars, { yPercent: 0, duration: 0.8, ease: SALE, stagger: 0.02, delay: r }) }) as Entrada
}

const atar: Record<string, Atar> = {
  titular: (el) => lineas(el, { dur: 1, esc: 0.1 }),
  nombre,
  /** Cifra o retrato que se descubre de izquierda a derecha con clip-path (admite relleno degradado en el texto). */
  barrido(el) {
    gsap.set(el, { clipPath: 'inset(0 100% 0 0)' })
    return (r) => gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.inOut', delay: r, clearProps: 'clipPath' })
  },
  linea: (el) => lineas(el),
  cifra,
  subir(el) {
    gsap.set(el, { opacity: 0, y: 20 })
    return (r) => gsap.to(el, juega({ opacity: 1, y: 0, delay: r }))
  },
  /** Hijos directos con escalonado. */
  grupo(el) {
    const hijos = Array.from(el.children)
    gsap.set(hijos, { opacity: 0, y: 22 })
    return (r) => gsap.to(hijos, juega({ opacity: 1, y: 0, delay: r, stagger: 0.07 }))
  },
  /** Ventana o tarjeta que se asienta al entrar (nunca desde 0). */
  marco(el) {
    gsap.set(el, { opacity: 0, y: 56, scale: 0.97, transformOrigin: '50% 100%' })
    return (r) => gsap.to(el, juega({ opacity: 1, y: 0, scale: 1, duration: 1.1, delay: r }))
  },
  /** Barras que crecen desde su origen (la escala X de cada una; el resto de la fila queda quieto). */
  barras(el) {
    const bs = Array.from(el.querySelectorAll<HTMLElement>('[data-barra]'))
    const vertical = bs[0]?.dataset.eje === 'y'
    gsap.set(bs, vertical ? { scaleY: 0, transformOrigin: '50% 100%' } : { scaleX: 0, transformOrigin: '0 50%' })
    return (r) => gsap.to(bs, juega({ ...(vertical ? { scaleY: 1 } : { scaleX: 1 }), delay: r, stagger: vertical ? 0.02 : 0.07, duration: 1.1, clearProps: 'transform' }))
  },
  /**
   * Figura de diagrama: todo lo que lleva data-p entra en secuencia (nodos suben, conectores se dibujan con clip-path,
   * marcas «ok» se trazan). «Repetir» la rebobina y la vuelve a jugar. Queda lista para jugar cuando entra en pantalla.
   */
  figura(el) {
    const tl = gsap.timeline({ paused: true })
    el.querySelectorAll<HTMLElement>('[data-p]').forEach((n) => {
      const t = Number(n.dataset.p) * 0.26
      if ('trazo' in n.dataset) {
        const vertical = n.offsetHeight > n.offsetWidth
        const ini = vertical ? 'inset(0 0 100% 0)' : 'inset(0 100% 0 0)'
        tl.fromTo(n, { clipPath: ini }, { clipPath: 'inset(0 0% 0 0)', duration: 0.75, ease: 'power2.inOut', clearProps: 'clipPath' }, t)
      } else if ('luz' in n.dataset) {
        // El relleno de una isla se enciende en su sitio (solo opacidad).
        tl.from(n, { opacity: 0, duration: 0.9, ease: 'power2.out', clearProps: 'opacity' }, t)
      } else {
        tl.from(n, { opacity: 0, y: 14, duration: 0.65, ease: SALE, clearProps: 'transform,opacity' }, t)
      }
    })
    const repetir = el.querySelector<HTMLElement>('[data-repetir]')
    const alRepetir = () => tl.restart()
    repetir?.addEventListener('click', alRepetir)
    return (r) => { tl.delay(r).restart(true) }
  },
}

/** Busca [data-ing] dentro de `raiz`, escribe su estado oculto y lo juega cuando entra en la ventana (o ya, si está a la vista). */
function activar(raiz: HTMLElement, limpiar: Array<() => void>, ctx: gsap.Context, perezoso: boolean) {
  const pendientes = new Map<Element, Entrada>()
  const io = new IntersectionObserver((entradas) => {
    let k = 0
    entradas.forEach((en) => {
      if (!en.isIntersecting) return
      const jugar = pendientes.get(en.target)
      if (!jugar) return
      pendientes.delete(en.target)
      io.unobserve(en.target)
      const base = Number((en.target as HTMLElement).dataset.ingRetraso ?? 0)
      jugar(base + Math.min(k++, 5) * 0.06)
    })
  }, { rootMargin: '0px 0px -6% 0px' })
  const atarUno = (el: HTMLElement) => {
    try {
      const jugar = atar[el.dataset.ing ?? '']?.(el)
      if (!jugar) return
      pendientes.set(el, jugar)
      io.observe(el)
    } catch {
      gsap.set(el, { clearProps: 'all' }) // fail-open por nodo
    }
  }
  // Con `perezoso` (una vista que abre arriba) al montar solo se ata lo que está a menos de 1,5 pantallas del borde inferior: atar es
  // partir texto y escribir el estado oculto, y hacerlo con la página entera recalculaba estilo y maquetación por cada nodo. Lo demás se
  // ata al acercarse, aún fuera de la vista (no parpadea), dentro del mismo contexto para que se revierta con la vista.
  const vh = window.innerHeight
  const nodos = Array.from(raiz.querySelectorAll<HTMLElement>('[data-ing]')).map((el) => ({ el, top: el.getBoundingClientRect().top }))
  const vigia = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return
    vigia.unobserve(e.target)
    ctx.add(() => atarUno(e.target as HTMLElement))
  }), { rootMargin: '0px 0px 150% 0px' })
  nodos.forEach(({ el, top }) => (!perezoso || top < vh * 2.5 ? atarUno(el) : vigia.observe(el)))
  limpiar.push(() => { io.disconnect(); vigia.disconnect() })
}

/** Posición de scroll por ruta, para que Atrás devuelva la lista donde estaba. */
const posiciones = new Map<string, number>()

/** Cierra el pulso de navegación: el filete de acento llega al final y se apaga. */
function cerrarPulso() {
  const p = document.querySelector<HTMLElement>('.ing-pulso')
  if (!p || p.style.opacity !== '1') return
  gsap.to(p, { scaleX: 1, duration: 0.25, ease: 'power2.out' })
  gsap.to(p, { opacity: 0, duration: 0.3, delay: 0.25 })
}

/**
 * Raíz de una vista: la entrada de página, los revelados declarativos y, si se pasa `montar`, la coreografía propia.
 * Todo lo que crea queda dentro de un gsap.context y se revierte al desmontar.
 */
export function useVista<T extends HTMLElement = HTMLElement>(deps: unknown[], montar?: (raiz: T, limpiar: Array<() => void>) => void) {
  const ref = useRef<T>(null)
  const { pathname, search } = useLocation()
  const tipo = useNavigationType()
  useLayoutEffect(() => {
    const raiz = ref.current
    if (!raiz) return
    const limpiar: Array<() => void> = []
    const guardada = tipo === 'POP' ? posiciones.get(pathname + search) : undefined
    // Cada vista nueva empieza arriba; Atrás/Adelante devuelven la lista a donde estaba.
    if (guardada !== undefined) setTimeout(() => window.scrollTo({ top: guardada, behavior: 'instant' }), 0)
    else if (tipo !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' })
    const ctx = gsap.context((self) => {
      gsap.set(raiz, { clearProps: 'transform,opacity' }) // la salida de useIr dejó y:-8 y opacidad 0 si el nodo se reutiliza
      gsap.fromTo(raiz, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: SALE, clearProps: 'transform,opacity' })
      cerrarPulso()
      activar(raiz, limpiar, self, guardada === undefined) // con scroll que restaurar se ata todo al montar, como siempre
      montar?.(raiz, limpiar)
    }, raiz)
    return () => {
      limpiar.forEach((f) => f())
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, pathname])
  return ref
}

/* ------------------------------------------------------------------ navegar con salida */

let saliendo = false
/**
 * Navega con un fundido cruzado y un filete de acento que cruza la parte alta. La vista que se va se queda como una copia
 * fija que se apaga (opacity) mientras la nueva entra por debajo: nunca hay un fotograma en blanco entre las dos.
 */
export function useIr() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return useCallback((to: string) => {
    if (to === pathname + search) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    const vista = document.querySelector<HTMLElement>('.ing-vista')
    const raiz = document.querySelector<HTMLElement>('.v5-ingenieria')
    if (!vista || !raiz || saliendo || to.split('?')[0] === pathname) { if (!saliendo) navigate(to); return }
    saliendo = true
    posiciones.set(pathname + search, window.scrollY)
    const pulso = document.querySelector<HTMLElement>('.ing-pulso')
    if (pulso) {
      gsap.killTweensOf(pulso)
      gsap.set(pulso, { scaleX: 0, opacity: 1, transformOrigin: '0 50%' })
      gsap.to(pulso, { scaleX: 0.8, duration: 0.5, ease: 'power3.out' })
    }
    // La copia: misma posición en pantalla que tiene la vista ahora (el desplazamiento se conserva en `top`).
    const r = vista.getBoundingClientRect()
    const copia = vista.cloneNode(true) as HTMLElement
    copia.removeAttribute('id')
    copia.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'))
    copia.setAttribute('aria-hidden', 'true')
    copia.setAttribute('inert', '')
    copia.removeAttribute('tabindex')
    Object.assign(copia.style, { position: 'fixed', left: '0', right: '0', top: `${r.top}px`, minHeight: '0', zIndex: '50', pointerEvents: 'none', background: getComputedStyle(raiz).backgroundColor, overflow: 'hidden', height: `${Math.max(r.height, window.innerHeight)}px` })
    raiz.appendChild(copia)
    navigate(to)
    saliendo = false
    gsap.to(copia, { opacity: 0, duration: 0.34, ease: 'power2.out', delay: 0.03, onComplete: () => copia.remove() })
  }, [navigate, pathname, search])
}

/* ------------------------------------------------------------------ tarjeta ⇄ ficha */

interface Vuelo { slug: string; desde: DOMRect; clon: HTMLImageElement; seguro: gsap.core.Tween }
let vuelo: Vuelo | null = null
/** Slug de la captura que está en vuelo (la lista lo lee para recibir a la que regresa de su ficha). */
export const vueloDe = () => vuelo?.slug

/** Levanta una copia de la captura exactamente donde se ve, para que cruce al otro lado. */
export function despegar(slug: string, marco: HTMLElement, img: HTMLImageElement) {
  vuelo?.clon.remove()
  vuelo?.seguro.kill()
  const r = marco.getBoundingClientRect()
  const clon = new Image()
  clon.src = img.currentSrc || img.src
  clon.alt = ''
  clon.setAttribute('aria-hidden', 'true')
  Object.assign(clon.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0', zIndex: '200', pointerEvents: 'none', objectFit: 'cover', objectPosition: 'top', transformOrigin: '0 0', borderRadius: getComputedStyle(marco).borderTopLeftRadius })
  document.body.appendChild(clon)
  const mio: Vuelo = { slug, desde: r, clon, seguro: gsap.delayedCall(2.5, () => { if (vuelo === mio) { mio.clon.remove(); vuelo = null } }) }
  vuelo = mio
}

/**
 * Del otro lado: la copia viaja al marco (transform, 0,9 s) y entrega el relevo a la imagen real.
 * Sobrevive a un doble montaje (StrictMode): se reclama hasta que termina y cada intento lo reinicia desde su origen.
 * `colocar` (opcional) corre en el siguiente turno, ya con el scroll asentado, y fija dónde está el destino.
 */
export function aterrizar(slug: string, marco: HTMLElement, limpiar: Array<() => void>, o: { alTerminar?: () => void; colocar?: () => void } = {}) {
  const v = vuelo
  if (!v || v.slug !== slug) return false
  gsap.set(marco, { visibility: 'hidden' })
  let tw: gsap.core.Tween | undefined
  const volar = () => {
    o.colocar?.()
    const a = marco.getBoundingClientRect()
    tw = gsap.fromTo(v.clon, { x: 0, y: 0, scaleX: 1, scaleY: 1 }, {
      x: a.left - v.desde.left, y: a.top - v.desde.top, scaleX: a.width / v.desde.width, scaleY: a.height / v.desde.height,
      duration: 0.9, ease: SALE,
      onComplete: () => { gsap.set(marco, { visibility: 'visible' }); v.clon.remove(); v.seguro.kill(); if (vuelo === v) vuelo = null; o.alTerminar?.() },
    })
  }
  const t = window.setTimeout(volar, 0)
  limpiar.push(() => { clearTimeout(t); tw?.kill(); gsap.set(marco, { clearProps: 'visibility' }) })
  return true
}
