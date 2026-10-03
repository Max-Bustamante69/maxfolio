import { useCallback, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'

// Motor de movimiento de la dirección Apple. GSAP coreografía (SplitText, Flip, CustomEase); el scroll es el del
// navegador. ScrollTrigger NO se usa: al registrarse deja un requestAnimationFrame perpetuo ("_rafBugFix", ver
// node_modules/gsap/ScrollTrigger.js) y la página quieta debe pedir cero fotogramas (idle-frame-budget Z-1).
// Las escenas de scroll son un oyente pasivo que pide UN fotograma por ráfaga de scroll y se suelta al parar.
gsap.registerPlugin(SplitText, Flip, CustomEase)
// El reloj de GSAP se duerme a los 30 fotogramas sin nada que animar (por defecto 120): la página quieta no pide fotogramas.
gsap.config({ autoSleep: 30 })
/** La curva de la casa (expo-out): reacción inmediata, aterrizaje suave. */
CustomEase.create('apple', '0.16, 1, 0.3, 1')
export { gsap, Flip, SplitText }

/* ------------------------------------------------------------------ escenas de scroll */

interface Escena { el: HTMLElement; tl: gsap.core.Timeline; paso: boolean; suave: number; rango: [number, number]; top: number; alto: number; ultimo: number }
const escenas = new Set<Escena>()
let pendiente = 0
let observador: ResizeObserver | null = null

// Se mide con offsetTop/offsetHeight (no getBoundingClientRect): ignora los transform de reveal del propio nodo y de sus ancestros.
const topAbs = (el: HTMLElement) => {
  let t = 0
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop
  return t
}
const medir = (e: Escena) => {
  e.top = topAbs(e.el)
  e.alto = e.el.offsetHeight
  e.ultimo = -1
}
/** 0 → 1. `pin` (por defecto): recorre el alto sobrante de un contenedor alto con un escenario sticky. `paso`: del borde bajo al alto de la ventana. */
const progreso = (e: Escena) => {
  const vh = window.innerHeight
  const bruto = e.paso ? (window.scrollY + vh - e.top) / (e.alto + vh) : (window.scrollY - e.top) / Math.max(1, e.alto - vh)
  const [a, b] = e.rango
  return Math.min(1, Math.max(0, (Math.min(1, Math.max(0, bruto)) - a) / (b - a)))
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
/** Vuelve a medir todas las escenas (p. ej. tras un filtro que muestra tarjetas que estaban ocultas). */
export const remedirEscenas = remedir

/** Ata una línea de tiempo al scroll. Devuelve la función que la suelta. El estado final de la línea es el diseño en reposo (fail-open). */
export function escena(el: HTMLElement, tl: gsap.core.Timeline, o: { paso?: boolean; suave?: number; rango?: [number, number] } = {}) {
  const e: Escena = { el, tl: tl.pause(), paso: !!o.paso, suave: o.suave ?? 0.5, rango: o.rango ?? [0, 1], top: 0, alto: 1, ultimo: -1 }
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

/**
 * Segunda escena de scroll de la dirección: la captura de cada tarjeta se asienta (zoom 1,14 → 1) mientras la tarjeta
 * entra por el borde bajo de la ventana. Comparte el oyente único de `escena()`: la página quieta sigue en cero fotogramas.
 */
export function zoomTarjetas(raiz: HTMLElement, limpiar: Array<() => void>) {
  raiz.querySelectorAll<HTMLElement>('.ap-tile-zoom').forEach((z) => {
    const tl = gsap.timeline().fromTo(z, { scale: 1.14, yPercent: -4 }, { scale: 1, yPercent: 0, ease: 'none' })
    limpiar.push(escena(z.parentElement!, tl, { paso: true, suave: 0.3, rango: [0, 0.3] }))
  })
}

/* ------------------------------------------------------------------ revelados declarativos */

type Entrada = (retraso: number) => void
type Atar = (el: HTMLElement) => Entrada | void

// Cada binder escribe su estado oculto con JS (si el JS falla nada queda escondido) y devuelve la función que lo juega.
const juega = (vars: gsap.TweenVars) => ({ duration: 0.85, ease: 'apple', clearProps: 'transform,opacity', ...vars })
const atar: Record<string, Atar> = {
  /** Titular que sube línea por línea dentro de una máscara. */
  linea(el) {
    let tw: gsap.core.Tween | undefined
    let entro = false
    let espera = 0
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'ap-ln', autoSplit: true,
      onSplit: (s) => (tw = gsap.from(s.lines, { yPercent: 112, duration: 0.95, ease: 'apple', stagger: 0.08, delay: espera, paused: !entro })),
    })
    return (r) => { entro = true; espera = r; tw?.delay(r).play() }
  },
  /** El nombre del hero: palabra por palabra. */
  nombre(el) {
    let tw: gsap.core.Tween | undefined
    let entro = false
    let espera = 0
    SplitText.create(el, {
      type: 'words', mask: 'words', wordsClass: 'ap-pl', autoSplit: true,
      onSplit: (s) => (tw = gsap.from(s.words, { yPercent: 118, duration: 1.0, ease: 'apple', stagger: 0.1, delay: espera, paused: !entro })),
    })
    return (r) => { entro = true; espera = r; tw?.delay(r).play() }
  },
  subir(el) {
    gsap.set(el, { opacity: 0, y: 26 })
    return (r) => gsap.to(el, juega({ opacity: 1, y: 0, delay: r }))
  },
  /** Hijos directos con escalonado de 70 ms. */
  grupo(el) {
    const hijos = Array.from(el.children)
    gsap.set(hijos, { opacity: 0, y: 24 })
    return (r) => gsap.to(hijos, juega({ opacity: 1, y: 0, delay: r, stagger: 0.07 }))
  },
  /** Tarjeta o captura que escala al entrar (nunca desde 0). */
  escala(el) {
    gsap.set(el, { opacity: 0, scale: 0.93, y: 52, transformOrigin: '50% 100%' })
    return (r) => gsap.to(el, juega({ opacity: 1, scale: 1, y: 0, duration: 1, delay: r }))
  },
}

/** Busca [data-ap] dentro de `raiz`, escribe su estado oculto y lo juega cuando entra en la ventana (o ya, si está a la vista). */
function activar(raiz: HTMLElement, limpiar: Array<() => void>) {
  const pendientes = new Map<Element, Entrada>()
  const io = new IntersectionObserver((entradas) => {
    let k = 0
    entradas.forEach((en) => {
      if (!en.isIntersecting) return
      const jugar = pendientes.get(en.target)
      if (!jugar) return
      pendientes.delete(en.target)
      io.unobserve(en.target)
      const base = Number((en.target as HTMLElement).dataset.apRetraso ?? 0)
      jugar(base + Math.min(k++, 5) * 0.07)
    })
  }, { rootMargin: '0px 0px -6% 0px' })
  raiz.querySelectorAll<HTMLElement>('[data-ap]').forEach((el) => {
    try {
      const jugar = atar[el.dataset.ap ?? '']?.(el)
      if (!jugar) return
      pendientes.set(el, jugar)
      io.observe(el)
    } catch {
      gsap.set(el, { clearProps: 'all' }) // fail-open por nodo
    }
  })
  limpiar.push(() => io.disconnect())
}

/** Posición de scroll por ruta, para que Atrás devuelva la lista donde estaba (EX-8). */
const posiciones = new Map<string, number>()

/**
 * Raíz de una vista: la entrada de página, los revelados declarativos y, si se pasa `montar`, la coreografía propia.
 * Todo lo que crea queda dentro de un gsap.context y se revierte al desmontar (sin fugas al navegar).
 */
export function useVista<T extends HTMLElement = HTMLElement>(deps: unknown[], montar?: (raiz: T, limpiar: Array<() => void>) => void) {
  const ref = useRef<T>(null)
  const { pathname, search } = useLocation()
  const tipo = useNavigationType()
  useLayoutEffect(() => {
    const raiz = ref.current
    if (!raiz) return
    const limpiar: Array<() => void> = []
    // Atrás/Adelante devuelven la lista a donde estaba; el efecto global de scroll corre después, por eso el 0 ms.
    const guardada = tipo === 'POP' ? posiciones.get(pathname + search) : undefined
    if (guardada !== undefined) setTimeout(() => window.scrollTo({ top: guardada, behavior: 'instant' }), 0)
    const ctx = gsap.context(() => {
      gsap.set(raiz, { clearProps: 'transform,opacity' }) // la salida de useIr dejó y:-10 y opacidad 0 si el nodo se reutiliza
      gsap.fromTo(raiz, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'apple', clearProps: 'transform,opacity' })
      activar(raiz, limpiar)
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
/** Navega con la salida de la vista (160 ms, la cubierta entra en ≤ 150 ms de reacción). Atrás y Adelante del navegador entran directo. */
export function useIr() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return useCallback((to: string) => {
    if (to === pathname + search) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    const vista = document.querySelector<HTMLElement>('.ap-vista')
    // Misma ruta con otra búsqueda (filtros) o sin vista que sacar: navegar directo, sin salida.
    if (!vista || saliendo || to.split('?')[0] === pathname) { if (!saliendo) navigate(to); return }
    saliendo = true
    posiciones.set(pathname + search, window.scrollY)
    gsap.to(vista, { opacity: 0, y: -10, duration: 0.16, ease: 'power2.out', onComplete: () => { saliendo = false; navigate(to) } })
  }, [navigate, pathname, search])
}

/* ------------------------------------------------------------------ tarjeta ⇄ ficha */

interface Vuelo { slug: string; desde: DOMRect; clon: HTMLImageElement; radio: number; recorte: string; seguro?: gsap.core.Tween }
let vuelo: Vuelo | null = null
/** Slug de la captura que está en vuelo (la lista lo lee para recibir a la que regresa de su ficha). */
export const vueloDe = () => vuelo?.slug

/**
 * Levanta una copia de la captura exactamente donde se ve (tarjeta o ficha), para que cruce al otro lado.
 * Si la captura está a medio zoom de scroll o bajo el hover, la copia nace con ese mismo encuadre: caja agrandada y recortada al marco.
 */
export function despegar(slug: string, marco: HTMLElement, img: HTMLImageElement) {
  vuelo?.clon.remove()
  vuelo?.seguro?.kill()
  const r = marco.getBoundingClientRect()
  const radio = parseFloat(getComputedStyle(marco).borderTopLeftRadius) || 0
  const z = img.closest<HTMLElement>('.ap-tile-zoom')
  const s = Math.max(1, (z ? Number(gsap.getProperty(z, 'scale')) || 1 : 1) * new DOMMatrix(getComputedStyle(img).transform).a)
  const dy = z ? (Number(gsap.getProperty(z, 'yPercent')) || 0) / 100 : 0
  const w = r.width * s
  const h = r.height * s
  const left = r.left - (w - r.width) / 2
  const top = r.top - (h - r.height) / 2 + dy * r.height
  const recorte = `inset(${r.top - top}px ${left + w - r.right}px ${top + h - r.bottom}px ${r.left - left}px round ${radio}px)`
  const clon = new Image()
  clon.src = img.currentSrc || img.src
  clon.alt = ''
  clon.setAttribute('aria-hidden', 'true')
  Object.assign(clon.style, { position: 'fixed', left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px`, margin: '0', zIndex: '200', pointerEvents: 'none', objectFit: 'cover', objectPosition: 'top', transformOrigin: '0 0', clipPath: recorte })
  document.body.appendChild(clon)
  const mio: Vuelo = { slug, desde: new DOMRect(left, top, w, h), clon, radio, recorte }
  vuelo = mio
  // Seguro: si el otro lado nunca la reclama (ruta inválida), la copia no se queda en pantalla.
  mio.seguro = gsap.delayedCall(2.5, () => { if (vuelo === mio) { mio.clon.remove(); vuelo = null } })
}

/**
 * Del otro lado: la copia viaja al marco (transform y clip-path, 0,85 s) y entrega el relevo a la imagen real.
 * El vuelo sobrevive a un doble montaje (StrictMode): se reclama hasta que termina y cada intento lo reinicia desde su origen.
 * `colocar` (opcional) corre en el siguiente turno, ya con el scroll de la vista asentado, y fija dónde está el destino.
 * El bisel del dispositivo se dibuja al llegar la copia, no antes: sin losa gris vacía mientras vuela.
 */
export function aterrizar(slug: string, marco: HTMLElement, limpiar: Array<() => void>, o: { alTerminar?: () => void; colocar?: () => void } = {}) {
  const v = vuelo
  if (!v || v.slug !== slug) return false
  const { desde, clon, recorte } = v
  const radioFinal = parseFloat(getComputedStyle(marco).borderTopLeftRadius) || 0
  const mac = marco.closest('.ap-mac')
  let tw: gsap.core.Tween | undefined
  let bisel: gsap.core.Tween | undefined
  gsap.set(marco, { visibility: 'hidden' })
  mac?.classList.add('ap-mac-vacio')
  const volar = () => {
    o.colocar?.()
    const a = marco.getBoundingClientRect()
    const sx = a.width / desde.width
    const sy = a.height / desde.height
    tw = gsap.fromTo(clon, { x: 0, y: 0, scaleX: 1, scaleY: 1, clipPath: recorte }, {
      x: a.left - desde.left, y: a.top - desde.top, scaleX: sx, scaleY: sy, clipPath: `inset(0px 0px 0px 0px round ${radioFinal / sx}px)`,
      duration: 0.85, ease: 'apple',
      onComplete: () => { gsap.set(marco, { visibility: 'visible' }); mac?.classList.remove('ap-mac-vacio'); clon.remove(); v.seguro?.kill(); if (vuelo === v) vuelo = null; o.alTerminar?.() },
    })
    bisel = gsap.delayedCall(0.4, () => mac?.classList.remove('ap-mac-vacio'))
  }
  const t = o.colocar ? window.setTimeout(volar, 0) : (volar(), 0)
  limpiar.push(() => { clearTimeout(t); tw?.kill(); bisel?.kill(); mac?.classList.remove('ap-mac-vacio'); gsap.set(marco, { clearProps: 'visibility' }) })
  return true
}
