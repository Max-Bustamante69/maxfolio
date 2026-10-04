import { useCallback, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

// Motor de movimiento de la dirección Maison. La gramática es una sola: el FILETE (una línea fina que se traza) y la
// PERSIANA (la imagen se descubre de arriba abajo). Todo lo demás es opacidad y una subida corta de texto.
// Solo se anima transform, opacity y clip-path. ScrollTrigger NO se usa: al registrarse deja un requestAnimationFrame
// perpetuo y la página quieta debe pedir cero fotogramas (idle-frame-budget). Las escenas de scroll son un oyente pasivo
// que pide UN fotograma por ráfaga de scroll y se calla al parar. No hay Lenis: el scroll es el del navegador.
gsap.registerPlugin(SplitText, CustomEase)
gsap.config({ autoSleep: 30 })
/** La curva de la casa (la de Loewe y Lemaire) y la larga de las entradas (expo-out). */
CustomEase.create('maison', '0, 0, 0.3, 1')
CustomEase.create('velo', '0.16, 1, 0.3, 1')
export { gsap, SplitText }

/* ------------------------------------------------------------------ escenas de scroll */

interface Escena { el: HTMLElement; tl: gsap.core.Timeline; fijo: boolean; suave: number; top: number; alto: number; ultimo: number }
const escenas = new Set<Escena>()
let pendiente = 0
let observador: ResizeObserver | null = null

// offsetTop/offsetHeight (no getBoundingClientRect): ignoran los transform de los reveals del nodo y de sus ancestros.
const topAbs = (el: HTMLElement) => {
  let t = 0
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop
  return t
}
const medir = (e: Escena) => { e.top = topAbs(e.el); e.alto = e.el.offsetHeight; e.ultimo = -1 }
/** 0 → 1. `fijo`: recorre el alto sobrante de un contenedor alto con un escenario sticky. Si no: del borde bajo al alto de la ventana. */
const progreso = (e: Escena) => {
  const vh = window.innerHeight
  const bruto = e.fijo ? (window.scrollY - e.top) / Math.max(1, e.alto - vh) : (window.scrollY + vh - e.top) / (e.alto + vh)
  return Math.min(1, Math.max(0, bruto))
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

/** Ata una línea de tiempo al scroll. Devuelve la función que la suelta. El estado final de la línea es el diseño en reposo (fail-open). */
export function escena(el: HTMLElement, tl: gsap.core.Timeline, o: { fijo?: boolean; suave?: number } = {}) {
  const e: Escena = { el, tl: tl.pause(), fijo: !!o.fijo, suave: o.suave ?? 0.4, top: 0, alto: 1, ultimo: -1 }
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

/** Juega la entrada de un nodo tras `retraso` s. `rapido`: el nodo ya quedó atrás (ancla, Atrás, salto de scroll) y se pone en su estado final sin animar. */
type Entrada = (retraso: number, rapido?: boolean) => void
type Atar = (el: HTMLElement) => Entrada | void

const juega = (vars: gsap.TweenVars) => ({ duration: 0.8, ease: 'velo', clearProps: 'transform,opacity', ...vars })

/** Texto que sube dentro de una máscara (líneas o letras). Al terminar se revierte: el texto vuelve a ser texto, con su kerning. */
function partido(el: HTMLElement, tipo: 'lines' | 'chars', o: { y: number; dur: number; paso: number }): Entrada {
  let tw: gsap.core.Tween | undefined
  let split: SplitText | undefined
  let entro = false
  let espera = 0
  let rapido = false
  SplitText.create(el, {
    type: tipo, mask: tipo, autoSplit: true, linesClass: 'mz-ln', charsClass: 'mz-ch',
    onSplit: (s) => {
      split = s
      if (rapido) { gsap.delayedCall(0, () => s.revert()); return }
      return (tw = gsap.from(tipo === 'lines' ? s.lines : s.chars, {
        yPercent: o.y, duration: o.dur, ease: 'velo', stagger: o.paso, delay: espera, paused: !entro,
        onComplete: () => { gsap.delayedCall(0, () => s.revert()) },
      }))
    },
  })
  return (r, r2) => {
    entro = true; espera = r; rapido = !!r2
    if (r2) { tw?.kill(); split?.revert(); return }
    tw?.delay(r).play()
  }
}

const atar: Record<string, Atar> = {
  /** Titular o frase: sube línea por línea. */
  linea: (el) => partido(el, 'lines', { y: 108, dur: 0.9, paso: 0.07 }),
  /** El rótulo de la casa: letra por letra, el único momento orquestado de la página. */
  letras: (el) => partido(el, 'chars', { y: 112, dur: 0.9, paso: 0.03 }),
  subir(el) {
    gsap.set(el, { opacity: 0, y: 16 })
    return (r, rapido) => (rapido ? gsap.set(el, { clearProps: 'transform,opacity' }) : gsap.to(el, juega({ opacity: 1, y: 0, delay: r })))
  },
  /** Hijos directos con escalonado corto. */
  grupo(el) {
    const hijos = Array.from(el.children)
    gsap.set(hijos, { opacity: 0, y: 14 })
    return (r, rapido) => (rapido ? gsap.set(hijos, { clearProps: 'transform,opacity' }) : gsap.to(hijos, juega({ opacity: 1, y: 0, delay: r, stagger: 0.06 })))
  },
  /** La persiana: el marco se descubre de arriba abajo y la imagen se asienta (1,08 → 1). */
  velo(el) {
    const img = el.querySelector('img')
    gsap.set(el, { clipPath: 'inset(0% 0% 100% 0%)' })
    if (img) gsap.set(img, { scale: 1.08, transformOrigin: '50% 0%' })
    return (r, rapido) => {
      if (rapido) { gsap.set(el, { clearProps: 'clipPath' }); if (img) gsap.set(img, { clearProps: 'transform' }); return }
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'velo', delay: r, clearProps: 'clipPath' })
      if (img) gsap.to(img, { scale: 1, duration: 1.5, ease: 'velo', delay: r, clearProps: 'transform' })
    }
  },
  /** Filete: se traza de izquierda a derecha. */
  trazo(el) {
    gsap.set(el, { scaleX: 0, transformOrigin: '0% 50%' })
    return (r, rapido) => (rapido ? gsap.set(el, { clearProps: 'transform' }) : gsap.to(el, { scaleX: 1, duration: 1.0, ease: 'maison', delay: r, clearProps: 'transform' }))
  },
}

/**
 * Busca [data-mz] dentro de `raiz`, escribe su estado oculto y lo juega cuando está por entrar (18 % de la ventana antes, para que
 * nunca se vea el hueco) o ya está a la vista. Lo que quedó por encima de la ventana (una ancla, Atrás, un salto de scroll) no se
 * anima: se pone directo en su estado final. El estado oculto lo escribe JS, así que sin JS todo es visible (fail-open).
 */
function activar(raiz: HTMLElement, limpiar: Array<() => void>) {
  const pendientes = new Map<Element, Entrada>()
  const io = new IntersectionObserver((entradas) => {
    let k = 0
    entradas.forEach((en) => {
      const jugar = pendientes.get(en.target)
      if (!jugar) return
      const atras = !en.isIntersecting && en.boundingClientRect.top < 0
      if (!en.isIntersecting && !atras) return
      pendientes.delete(en.target)
      io.unobserve(en.target)
      if (atras) { jugar(0, true); return }
      const base = Number((en.target as HTMLElement).dataset.mzRetraso ?? 0)
      jugar(base + Math.min(k++, 5) * 0.07)
    })
  }, { rootMargin: '0px 0px 18% 0px' })
  raiz.querySelectorAll<HTMLElement>('[data-mz]').forEach((el) => {
    try {
      const jugar = atar[el.dataset.mz ?? '']?.(el)
      if (!jugar) return
      pendientes.set(el, jugar)
      io.observe(el)
    } catch {
      gsap.set(el, { clearProps: 'all' }) // fail-open por nodo
    }
  })
  limpiar.push(() => io.disconnect())
}

/** Posición de scroll por ruta, para que Atrás devuelva la lista donde estaba. */
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
    const guardada = tipo === 'POP' ? posiciones.get(pathname + search) : undefined
    if (guardada !== undefined) setTimeout(() => window.scrollTo({ top: guardada, behavior: 'instant' }), 0)
    const ctx = gsap.context(() => {
      gsap.set(raiz, { clearProps: 'transform,opacity' }) // la salida de useIr dejó opacidad 0 si el nodo se reutiliza
      gsap.fromTo(raiz, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'maison', clearProps: 'opacity' })
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
/** Traza el filete bajo la cabecera: la firma del cambio de página. */
function trazarPagina() {
  const l = document.querySelector<HTMLElement>('.mz-trazo-pag')
  if (!l) return
  gsap.killTweensOf(l)
  gsap.fromTo(l, { scaleX: 0, opacity: 1, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.45, ease: 'maison' })
  gsap.to(l, { opacity: 0, duration: 0.35, delay: 0.5, ease: 'maison' })
}
/** Navega con la salida de la vista: reacción en 160 ms (la vista se desvanece y el filete se traza). Atrás y Adelante entran directo. */
export function useIr() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return useCallback((to: string) => {
    if (to === pathname + search) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    const vista = document.querySelector<HTMLElement>('.mz-vista')
    // Misma ruta con otra consulta o con ancla (#agenda): no hay vista que sacar, solo se navega y la vista actual atiende el ancla.
    if (!vista || saliendo || to.split(/[?#]/)[0] === pathname) { if (!saliendo) navigate(to); return }
    saliendo = true
    posiciones.set(pathname + search, window.scrollY)
    trazarPagina()
    gsap.to(vista, { opacity: 0, duration: 0.16, ease: 'power2.out', onComplete: () => { saliendo = false; navigate(to) } })
  }, [navigate, pathname, search])
}

/* ------------------------------------------------------------------ pieza ⇄ ficha (elemento compartido) */

interface Caja { x: number; y: number; w: number; h: number }
const caja = (r: DOMRect): Caja => ({ x: r.left, y: r.top, w: r.width, h: r.height })
/** Dónde cae el contenido real de una imagen: su caja, o, si el marco la recorta con object-fit: cover, la imagen ya escalada y colocada según su punto de interés. */
const contenido = (img: HTMLImageElement): Caja => {
  const r = img.getBoundingClientRect()
  const cs = getComputedStyle(img)
  const nw = img.naturalWidth || Number(img.dataset.nw)
  const nh = img.naturalHeight || Number(img.dataset.nh)
  if (cs.objectFit !== 'cover' || !nw || !nh) return caja(r)
  const k = Math.max(r.width / nw, r.height / nh)
  const [px = 0.5, py = 0.5] = cs.objectPosition.split(' ').map((v) => parseFloat(v) / 100)
  return { x: r.left + (r.width - nw * k) * px, y: r.top + (r.height - nh * k) * py, w: nw * k, h: nh * k }
}
/** inset() del marco `m` en las coordenadas locales de un contenido de `w`×`h` px locales cuyo origen cae en `o` y que se dibuja con escala `k`. */
const recorte = (m: Caja, o: { x: number; y: number }, k: number, w: number, h: number) =>
  `inset(${(m.y - o.y) / k}px ${w - (m.x + m.w - o.x) / k}px ${h - (m.y + m.h - o.y) / k}px ${(m.x - o.x) / k}px)`

interface Vuelo { slug: string; clon: HTMLImageElement; img: Caja; marco: Caja; seguro: gsap.core.Tween }
let vuelo: Vuelo | null = null
/** Slug de la captura que está en vuelo (la ficha lo lee para no velar el marco que va a recibirla). */
export const vueloDe = () => vuelo?.slug

/** Levanta una copia de la captura exactamente donde se ve (la pieza del rack) para que cruce a la ficha. */
export function despegar(slug: string, marco: HTMLElement, img: HTMLImageElement) {
  vuelo?.clon.remove()
  vuelo?.seguro.kill()
  const m = caja(marco.getBoundingClientRect())
  const c = contenido(img)
  const clon = new Image()
  clon.src = img.currentSrc || img.src
  clon.alt = ''
  clon.setAttribute('aria-hidden', 'true')
  Object.assign(clon.style, { position: 'fixed', left: `${c.x}px`, top: `${c.y}px`, width: `${c.w}px`, height: `${c.h}px`, margin: '0', maxWidth: 'none', zIndex: '90', pointerEvents: 'none', objectFit: 'fill', transformOrigin: '0 0', clipPath: recorte(m, c, 1, c.w, c.h) })
  document.body.appendChild(clon)
  const mio: Vuelo = { slug, clon, img: c, marco: m, seguro: gsap.delayedCall(2.5, () => { if (vuelo === mio) { mio.clon.remove(); vuelo = null } }) }
  vuelo = mio
}

/** Del otro lado: la copia viaja al marco de la ficha (transform y clip-path, 0,9 s) y entrega el relevo a la imagen real. */
export function aterrizar(slug: string, marco: HTMLElement, img: HTMLImageElement, limpiar: Array<() => void>) {
  const v = vuelo
  if (!v || v.slug !== slug) return false
  const m = caja(marco.getBoundingClientRect())
  const c = contenido(img)
  const k = v.img.w / c.w
  gsap.set(marco, { visibility: 'hidden' })
  Object.assign(v.clon.style, { left: `${c.x}px`, top: `${c.y}px`, width: `${c.w}px`, height: `${c.h}px` })
  const tw = gsap.fromTo(v.clon,
    { x: v.img.x - c.x, y: v.img.y - c.y, scale: k, clipPath: recorte(v.marco, v.img, k, c.w, c.h) },
    { x: 0, y: 0, scale: 1, clipPath: recorte(m, c, 1, c.w, c.h), duration: 0.9, ease: 'velo',
      onComplete: () => { gsap.set(marco, { visibility: 'visible' }); v.clon.remove(); v.seguro.kill(); if (vuelo === v) vuelo = null } })
  // El vuelo sobrevive a un doble montaje (StrictMode): al soltar solo se detiene la animación; la copia y el vuelo se reclaman de nuevo y la copia se retira al aterrizar o por el seguro.
  limpiar.push(() => { tw.kill(); gsap.set(marco, { clearProps: 'visibility' }) })
  return true
}
