import { useCallback, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

// Motor de movimiento de El Reportaje. GSAP coreografía (SplitText, CustomEase; el elemento compartido es una copia que viaja con transform) y el scroll es el del navegador.
// ScrollTrigger y Lenis NO se usan: ambos dejan un requestAnimationFrame perpetuo (idle-frame-budget Z-1) y la página
// quieta debe pedir cero fotogramas. Las escenas de scroll son un oyente pasivo que pide UN fotograma por ráfaga de
// scroll y se suelta al parar; el reloj de GSAP se duerme a los 30 fotogramas sin nada que animar.
gsap.registerPlugin(SplitText, CustomEase)
gsap.config({ autoSleep: 30 })
// Sin suavizado de tirones: con la máquina cargada el reloj de GSAP no estira las animaciones y todo termina a su hora.
gsap.ticker.lagSmoothing(0)
/** Expo-out de la casa: reacción inmediata, aterrizaje suave. */
CustomEase.create('rep', '0.16, 1, 0.3, 1')
/** La hoja de papel: arranca despacio y se va (cubre en 0,3 s, descubre en 0,44 s). */
CustomEase.create('rep-hoja', '0.6, 0, 0.1, 1')
export { gsap, SplitText }

/* ------------------------------------------------------------------ escenas de scroll */

interface Escena { el: HTMLElement; tl: gsap.core.Timeline; modo: 'pin' | 'paso' | 'lectura' | 'salida'; suave: number; rango: [number, number]; latch: boolean; top: number; alto: number; ultimo: number; max: number }
const escenas = new Set<Escena>()
let pendiente = 0
let observador: ResizeObserver | null = null

// offsetTop/offsetHeight (no getBoundingClientRect): ignora los transform de reveal del propio nodo y de sus ancestros.
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
const entre = (v: number) => Math.min(1, Math.max(0, v))
/** 0 → 1. `paso`: del borde bajo de la ventana (0) al borde alto (1). `lectura`: de que el borde alto cruce la línea de lectura (55 % de la
 *  ventana) a que la cruce el borde bajo. `salida`: de la página en su sitio (0) a que el elemento salga por arriba (1). `pin`: recorre el
 *  alto sobrante de un contenedor alto con un escenario fijo. */
const progreso = (e: Escena) => {
  const vh = window.innerHeight
  const bruto = e.modo === 'paso' ? (window.scrollY + vh - e.top) / (e.alto + vh)
    : e.modo === 'lectura' ? (window.scrollY + vh * 0.55 - e.top) / e.alto
    : e.modo === 'salida' ? window.scrollY / Math.max(1, e.top + e.alto)
    : (window.scrollY - e.top) / Math.max(1, e.alto - vh)
  const [a, b] = e.rango
  let p = entre((entre(bruto) - a) / (b - a))
  if (e.latch) { p = Math.max(p, e.max); e.max = p } // la figura, una vez dibujada, se queda dibujada
  return p
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
export function escena(el: HTMLElement, tl: gsap.core.Timeline, o: { modo?: 'pin' | 'paso' | 'lectura' | 'salida'; suave?: number; rango?: [number, number]; latch?: boolean } = {}) {
  const e: Escena = { el, tl: tl.pause(), modo: o.modo ?? 'pin', suave: o.suave ?? 0.5, rango: o.rango ?? [0, 1], latch: !!o.latch, top: 0, alto: 1, ultimo: -1, max: 0 }
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

// Cada binder escribe su estado oculto con JS (si el JS falla nada queda escondido) y devuelve la función que lo juega.
const juega = (vars: gsap.TweenVars): gsap.TweenVars => ({ duration: 0.7, ease: 'rep', clearProps: 'transform,opacity', ...vars })
const atar: Record<string, Atar> = {
  /** Titular que sube línea por línea dentro de una máscara. */
  linea(el) {
    let tw: gsap.core.Tween | undefined
    let entro = false
    let espera = 0
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'rp-ln', autoSplit: true,
      onSplit: (s) => (tw = gsap.from(s.lines, { yPercent: 108, duration: 0.85, ease: 'rep', stagger: 0.07, delay: espera, paused: !entro })),
    })
    return (r) => { entro = true; espera = r; tw?.delay(r).play() }
  },
  subir(el) {
    gsap.set(el, { opacity: 0, y: 18 })
    return (r) => gsap.to(el, juega({ opacity: 1, y: 0, delay: r }))
  },
  /** Hijos directos con escalonado de 70 ms. */
  grupo(el) {
    const hijos = Array.from(el.children)
    gsap.set(hijos, { opacity: 0, y: 18 })
    return (r) => gsap.to(hijos, juega({ opacity: 1, y: 0, delay: r, stagger: 0.07 }))
  },
  /** Una cifra sube desde la línea de base dentro de su máscara. */
  mascara(el) {
    const dentro = el.firstElementChild
    if (!dentro) return
    gsap.set(dentro, { yPercent: 108 }) // se observa la máscara, no lo que sube: un nodo recortado por su ancestro nunca «entra» en la ventana
    return (r) => gsap.to(dentro, { yPercent: 0, duration: 0.95, ease: 'rep', delay: r, clearProps: 'transform' })
  },
  /** El filete de 1 px que se traza de izquierda a derecha. */
  filete(el) {
    gsap.set(el, { scaleX: 0, transformOrigin: '0 50%' })
    return (r) => gsap.to(el, { scaleX: 1, duration: 1, ease: 'rep', delay: r, clearProps: 'transform' })
  },
  /** Las barras de un diagrama nacen una tras otra desde su origen. */
  barras(el) {
    const barras = el.querySelectorAll('[data-barra]')
    gsap.set(barras, { scaleX: 0, transformOrigin: '0 50%' })
    return (r) => gsap.to(barras, { scaleX: 1, duration: 0.9, ease: 'rep', delay: r, stagger: 0.12, clearProps: 'transform' })
  },
  /** La placa (captura con filete) se descubre de arriba abajo mientras la imagen se asienta. */
  placa(el) {
    const img = el.querySelector('img')
    gsap.set(el, { clipPath: 'inset(0 0 100% 0)' })
    if (img) gsap.set(img, { scale: 1.07 })
    return (r) => {
      gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'rep', delay: r, clearProps: 'clipPath' })
      if (img) gsap.to(img, { scale: 1, duration: 1.2, ease: 'rep', delay: r, clearProps: 'transform' })
    }
  },
}

/** Busca [data-rp] dentro de `raiz`, escribe su estado oculto y lo juega cuando entra en la ventana (o ya, si está a la vista). */
function activar(raiz: HTMLElement, limpiar: Array<() => void>, espera: number) {
  const pendientes = new Map<Element, Entrada>()
  let primera = true
  const io = new IntersectionObserver((entradas) => {
    let k = 0
    entradas.forEach((en) => {
      // Un salto de ancla o una posición restaurada puede dejar el nodo ya por encima de la ventana sin que llegue a cruzarla: se juega igual.
      if (!en.isIntersecting && en.boundingClientRect.top > 0) return
      const jugar = pendientes.get(en.target)
      if (!jugar) return
      pendientes.delete(en.target)
      io.unobserve(en.target)
      const base = Number((en.target as HTMLElement).dataset.rpRetraso ?? 0)
      jugar(base + (primera ? espera : 0) + Math.min(k++, 5) * 0.06)
    })
    primera = false
  }, { rootMargin: '0px 0px -6% 0px' })
  raiz.querySelectorAll<HTMLElement>('[data-rp]').forEach((el) => {
    try {
      const jugar = atar[el.dataset.rp ?? '']?.(el)
      if (!jugar) return
      pendientes.set(el, jugar)
      io.observe(el)
    } catch {
      gsap.set(el, { clearProps: 'all' }) // fail-open por nodo
    }
  })
  limpiar.push(() => io.disconnect())
}

/** Llama a `fn` una sola vez cuando `el` entra en la ventana o ya quedó por encima (salto de ancla). Devuelve cómo soltarlo. */
export function cuando(el: Element, fn: () => void, margen = '0px 0px -6% 0px') {
  const io = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting || e.boundingClientRect.top < 0)) return
    io.disconnect()
    fn()
  }, { rootMargin: margen })
  io.observe(el)
  return () => io.disconnect()
}

/* ------------------------------------------------------------------ la hoja de papel entre vistas */

let velo: HTMLElement | null = null
let cubierto = false
let saliendo = false
let esperaVista = 0
/** La hoja vive en App; aquí se registra para que cualquier enlace pueda hacerla caer. */
export function registrarVelo(el: HTMLElement | null) {
  velo = el
  if (el) gsap.set(el, { yPercent: -101 })
}

/** Cubre en ≤ 0,34 s con el número y el nombre del capítulo; `luego` navega cuando la hoja ya tapa la vista vieja. */
function cubrir(num: string, titulo: string, luego: () => void) {
  if (!velo) { luego(); return }
  const v = velo
  const n = v.querySelector<HTMLElement>('.rp-velo-num')
  const t = v.querySelector<HTMLElement>('.rp-velo-tit')
  if (n) n.textContent = num
  if (t) t.textContent = titulo
  v.style.pointerEvents = 'auto'
  cubierto = true
  gsap.killTweensOf(v)
  gsap.fromTo(v, { yPercent: -101 }, { yPercent: 0, duration: 0.3, ease: 'rep', onComplete: () => { esperaVista = 0.2; luego() } })
  gsap.fromTo(v.querySelectorAll('.rp-velo-num, .rp-velo-tit'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: 'rep', delay: 0.06, stagger: 0.05 })
}

/** La vista nueva ya está montada: la hoja sigue su caída y la descubre de arriba abajo (≤ 0,5 s). */
function levantar() {
  saliendo = false
  if (!cubierto || !velo) return
  cubierto = false
  const v = velo
  gsap.to(v, {
    yPercent: 101, duration: 0.44, ease: 'rep-hoja', delay: 0.02,
    onComplete: () => { gsap.set(v, { yPercent: -101 }); v.style.pointerEvents = 'none'; esperaVista = 0 },
  })
}

/** Posición de scroll por ruta, para que Atrás devuelva la lista donde estaba. */
const posiciones = new Map<string, number>()
/** La primera vista de la sesión no roba el foco al cargar; las siguientes sí (lectores de pantalla). */
let bienvenida = true

/**
 * Raíz de una vista: la entrada de página, los revelados declarativos y, si se pasa `montar`, la coreografía propia.
 * Todo lo que crea queda dentro de un gsap.context y se revierte al desmontar (sin fugas al navegar).
 */
export function useVista<T extends HTMLElement = HTMLElement>(deps: unknown[], montar?: (raiz: T, limpiar: Array<() => void>, espera: number) => void) {
  const ref = useRef<T>(null)
  const { pathname, search } = useLocation()
  const tipo = useNavigationType()
  useLayoutEffect(() => {
    const raiz = ref.current
    if (!raiz) return
    const limpiar: Array<() => void> = []
    const espera = esperaVista
    levantar()
    gsap.set(raiz, { clearProps: 'opacity' }) // la salida sin hoja dejó la opacidad en 0 si el nodo se reutiliza
    const guardada = tipo === 'POP' ? posiciones.get(pathname + search) : undefined
    window.scrollTo({ top: guardada ?? 0, behavior: 'instant' })
    if (!bienvenida) raiz.focus({ preventScroll: true })
    bienvenida = false
    const ctx = gsap.context(() => {
      activar(raiz, limpiar, espera)
      montar?.(raiz, limpiar, espera)
    }, raiz)
    return () => {
      limpiar.forEach((f) => f())
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, pathname])
  return ref
}

/** Navega con la hoja (o, con `hoja: false`, con un fundido de 160 ms). Atrás y Adelante del navegador entran directo. */
export function useIr() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return useCallback((to: string, o: { hoja?: boolean; num?: string; titulo?: string } = {}) => {
    if (to === pathname + search) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (saliendo) return
    const vista = document.querySelector<HTMLElement>('.rp-vista')
    posiciones.set(pathname + search, window.scrollY)
    if (!vista || to.split('?')[0] === pathname) { navigate(to); return }
    saliendo = true
    gsap.delayedCall(3, () => { saliendo = false }) // seguro: una navegación que no monta nada no deja el enlace muerto
    if (o.hoja === false || !velo) {
      gsap.to(vista, { opacity: 0, duration: 0.16, ease: 'power2.out', onComplete: () => navigate(to) })
      return
    }
    cubrir(o.num ?? '', o.titulo ?? '', () => navigate(to))
  }, [navigate, pathname, search])
}

/* ------------------------------------------------------------------ tarjeta ⇄ ficha (elemento compartido) */

interface Vuelo { slug: string; desde: DOMRect; clon: HTMLImageElement; nw: number; nh: number; seguro: gsap.core.Tween }
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
  Object.assign(clon.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0', zIndex: '200', pointerEvents: 'none', objectFit: 'cover', objectPosition: 'top', transformOrigin: '0 0' })
  document.body.appendChild(clon)
  const nw = img.naturalWidth || Number(img.getAttribute('width')) || 1200
  const nh = img.naturalHeight || Number(img.getAttribute('height')) || 750
  const mio: Vuelo = { slug, desde: new DOMRect(r.left, r.top, r.width, r.height), clon, nw, nh, seguro: gsap.delayedCall(2.5, () => { if (vuelo === mio) { mio.clon.remove(); vuelo = null } }) }
  vuelo = mio
}

/**
 * Del otro lado: la copia viaja al marco y entrega el relevo a la imagen real (0,85 s). Se anima con transform y clip-path: la copia se
 * redimensiona a la captura entera tal como se verá en el destino, y arranca escalada y recortada para verse idéntica al marco de
 * origen (así una miniatura cuadrada se abre en la lámina ancha sin deformarse). Sobrevive a un doble montaje (StrictMode): se reclama
 * hasta que termina y cada intento lo reinicia desde su origen. `colocar` fija dónde está el destino.
 */
export function aterrizar(slug: string, marco: HTMLElement, limpiar: Array<() => void>, o: { alTerminar?: () => void; colocar?: () => void } = {}) {
  const v = vuelo
  if (!v || v.slug !== slug) return false
  const { desde: d, clon, nw, nh } = v
  gsap.set(marco, { visibility: 'hidden' })
  let tw: gsap.core.Tween | undefined
  const volar = () => {
    o.colocar?.()
    const a = marco.getBoundingClientRect()
    // Escala de cobertura (object-fit: cover, arriba y al centro) en el destino (st) y en el origen (so).
    const st = Math.max(a.width / nw, a.height / nh)
    const so = Math.max(d.width / nw, d.height / nh)
    const W = nw * st
    const H = nh * st
    const k = so / st
    const ox = (a.width - W) / 2
    const ox0 = (d.width - nw * so) / 2
    const px = (n: number) => `${n.toFixed(2)}px`
    Object.assign(clon.style, { left: px(a.left + ox), top: px(a.top), width: px(W), height: px(H), objectFit: 'fill' })
    // De la copia con el aspecto del marco de origen (escala k, recorte al marco) a la captura entera en su sitio: un solo progreso 0 → 1.
    const de = { x: d.left + ox0 - (a.left + ox), y: d.top - a.top, r: W - (d.width - ox0) / k, b: H - d.height / k, l: -ox0 / k }
    const a1 = { r: (W - a.width) / 2, b: H - a.height, l: (W - a.width) / 2 }
    const p = { v: 0 }
    const pintar = () => {
      const m = (u: number, w: number) => u + (w - u) * p.v
      clon.style.transform = `translate(${px(m(de.x, 0))}, ${px(m(de.y, 0))}) scale(${m(k, 1).toFixed(4)})`
      clon.style.clipPath = `inset(0px ${px(m(de.r, a1.r))} ${px(m(de.b, a1.b))} ${px(m(de.l, a1.l))})`
    }
    pintar()
    tw = gsap.to(p, {
      v: 1, duration: 0.85, ease: 'rep', onUpdate: pintar,
      onComplete: () => { gsap.set(marco, { visibility: 'visible' }); clon.remove(); v.seguro.kill(); if (vuelo === v) vuelo = null; o.alTerminar?.() },
    })
  }
  const t = window.setTimeout(volar, 0)
  limpiar.push(() => { clearTimeout(t); tw?.kill(); gsap.set(marco, { clearProps: 'visibility' }) })
  return true
}
