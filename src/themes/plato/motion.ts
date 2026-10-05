import { useCallback, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

// Motor de movimiento de Plató. GSAP coreografía (SplitText, CustomEase); el scroll es el del navegador.
// ScrollTrigger NO se usa: al registrarse deja un requestAnimationFrame perpetuo y la página quieta debe pedir cero
// fotogramas (idle-frame-budget Z-1). Las escenas de scroll son UN oyente pasivo que pide un fotograma por ráfaga.
// Solo transform, opacity y clip-path. prefers-reduced-motion NO se implementa (decisión de la casa, 2026-09-26).
gsap.registerPlugin(SplitText, CustomEase)
// El reloj de GSAP se duerme a los 30 fotogramas sin nada que animar: la página quieta no pide fotogramas.
gsap.config({ autoSleep: 30 })
/** La curva principal de lusion.co: cubic-bezier(.4, 0, .1, 1). */
CustomEase.create('pl', '.4,0,.1,1')
/** La curva «de rodillo» de lusion.co (menús, cubierta de página). */
CustomEase.create('pl-rod', '.35,0,0,1')
/** Encendido de un foco: sube por encima y asienta (0 → 135 % → 100 %). */
CustomEase.create('pl-luz', '.2,.8,.2,1')
/** Arranque rápido para lo primero que se ve al llegar a una vista: el contenido ya se mueve cuando el telón empieza a irse. */
CustomEase.create('pl-fast', '.14,.86,.24,1')
export { gsap, SplitText }

/* ------------------------------------------------------------------ oyente de scroll único */

type Fn = (y: number) => void
const oyentes = new Set<Fn>()
let pendiente = 0
const latido = () => {
  pendiente = 0
  const y = window.scrollY
  oyentes.forEach((f) => f(y))
}
const pedir = () => { if (!pendiente) pendiente = requestAnimationFrame(latido) }
/** Suscribe `fn` a «scroll» y «resize» con UN solo oyente pasivo y UN fotograma por ráfaga; con la página quieta no pide nada. */
export function alScroll(fn: Fn, ahora = true) {
  if (!oyentes.size) {
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
  }
  oyentes.add(fn)
  if (ahora) fn(window.scrollY)
  return () => {
    oyentes.delete(fn)
    if (!oyentes.size) {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pendiente) cancelAnimationFrame(pendiente)
      pendiente = 0
    }
  }
}

/* ------------------------------------------------------------------ revelados declarativos */

type Entrada = (retraso: number, rapida: boolean) => void
type Atar = (el: HTMLElement) => Entrada | void
const juega = (vars: gsap.TweenVars, rapida: boolean) => ({ duration: rapida ? 0.62 : 0.78, ease: rapida ? 'pl-fast' : 'pl', clearProps: 'transform,opacity', ...vars })

// Cada binder escribe su estado oculto con JS (si el JS falla nada queda escondido) y devuelve la función que lo juega.
const atar: Record<string, Atar> = {
  /** Titular que sube línea a línea dentro de una máscara (el escalonado de lusion.co: 0,02 / 0,06 / 0,08 s). */
  linea(el) {
    let tw: gsap.core.Tween | undefined
    let entro = false
    let espera = 0
    let veloz = false
    const lenta = gsap.parseEase('pl')
    const viva = gsap.parseEase('pl-fast')
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'pl-ln', autoSplit: true, aria: 'none',
      onSplit: (s) => (tw = gsap.from(s.lines, { yPercent: 110, duration: veloz ? 0.66 : 0.8, ease: (p: number) => (veloz ? viva(p) : lenta(p)), stagger: 0.06, delay: espera, paused: !entro })),
    })
    // Al llegar tras el telón el titular ya asoma desde el primer fotograma (arranca al 20 % de su recorrido): no queda un tramo en blanco.
    return (r, rapida) => { entro = true; espera = r; veloz = rapida; tw?.duration(rapida ? 0.66 : 0.8); if (rapida) tw?.progress(0.2); tw?.delay(r).play() }
  },
  subir(el) {
    gsap.set(el, { opacity: 0, y: 22 })
    return (r, rapida) => gsap.to(el, juega({ opacity: 1, y: 0, delay: r }, rapida))
  },
  /** Hijos directos, escalonados. */
  grupo(el) {
    const hijos = Array.from(el.children)
    gsap.set(hijos, { opacity: 0, y: 22 })
    return (r, rapida) => gsap.to(hijos, juega({ opacity: 1, y: 0, delay: r, stagger: rapida ? 0.05 : 0.07 }, rapida))
  },
  /** Ventana en paralelogramo: la imagen se abre con un borde inclinado, y su contenido se asienta desde 1,12×. El marco redondeado no cambia. */
  ventana(el) {
    const dentro = el.firstElementChild as HTMLElement | null
    gsap.set(el, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' })
    if (dentro) gsap.set(dentro, { scale: 1.14, transformOrigin: '50% 100%' })
    return (r, rapida) => {
      gsap.to(el, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: rapida ? 0.85 : 1.0, ease: rapida ? 'pl-fast' : 'pl', delay: r, clearProps: 'clipPath' })
      if (dentro) gsap.to(dentro, { scale: 1, duration: rapida ? 1.1 : 1.3, ease: rapida ? 'pl-fast' : 'pl', delay: r, clearProps: 'transform' })
    }
  },
  /** Lighthouse de la ficha: el bloque sube, cada anillo se traza hasta su valor y la marca del LCP corre hasta su punto (una vez, y termina). */
  anillos(el) {
    const arcos = el.querySelectorAll<SVGCircleElement>('.pl-anillo-a')
    const marcas = el.querySelectorAll<HTMLElement>('.pl-lcp-marca')
    gsap.set(el, { opacity: 0, y: 22 })
    gsap.set(arcos, { strokeDashoffset: 100 })
    gsap.set(marcas, { left: '0%' })
    return (r, rapida) => {
      gsap.to(el, juega({ opacity: 1, y: 0, delay: r }, rapida))
      gsap.to(arcos, { strokeDashoffset: (_: number, a: SVGCircleElement) => 100 - Number(a.dataset.v), duration: 1.3, ease: 'pl', delay: r + 0.15, stagger: 0.07, clearProps: 'strokeDashoffset' })
      gsap.to(marcas, { left: (_: number, m: HTMLElement) => `${Number(m.dataset.p) * 100}%`, duration: 1.3, ease: 'pl', delay: r + 0.3, clearProps: 'left' })
    }
  },
  /** Filete que se traza de izquierda a derecha. */
  trazo(el) {
    gsap.set(el, { scaleX: 0, transformOrigin: '0% 50%' })
    return (r) => gsap.to(el, { scaleX: 1, duration: 1.0, ease: 'pl', delay: r, clearProps: 'transform' })
  },
}

/** Retardo de la primera vista mientras la cortina de entrada se abre (lo fija App una vez por sesión). */
export const entrada = { retraso: 0 }

/** Busca [data-pl] dentro de `raiz`, escribe su estado oculto y lo juega cuando entra en la ventana (o ya, si está a la vista). */
function activar(raiz: HTMLElement, limpiar: Array<() => void>, base: number, ctx: gsap.Context, perezoso: boolean) {
  const pendientes = new Map<Element, Entrada>()
  const t0 = performance.now()
  const io = new IntersectionObserver((entradas) => {
    // El primer lote (lo que ya estaba a la vista al llegar) arranca rápido; lo que entra al hacer scroll usa la curva de lusion.co.
    const rapida = performance.now() - t0 < 160
    let k = 0
    entradas.forEach((en) => {
      if (!en.isIntersecting) return
      const jugar = pendientes.get(en.target)
      if (!jugar) return
      pendientes.delete(en.target)
      io.unobserve(en.target)
      const extra = Number((en.target as HTMLElement).dataset.plRetraso ?? 0)
      jugar(base + extra + Math.min(k++, 5) * (rapida ? 0.045 : 0.06), rapida)
    })
  }, { rootMargin: '0px 0px -6% 0px' })
  const atarUno = (el: HTMLElement) => {
    try {
      const jugar = atar[el.dataset.pl ?? '']?.(el)
      if (!jugar) return
      pendientes.set(el, jugar)
      io.observe(el)
    } catch {
      gsap.set(el, { clearProps: 'all' }) // fail-open por nodo
    }
  }
  // Primero se LEEN todas las posiciones (una sola maquetación) y después se escribe: atar y jugar uno por uno, leyendo entre medias,
  // recalculaba el estilo de la página entera por cada elemento. Con `perezoso` (una vista que abre arriba) al montar solo se ata lo que
  // está a menos de 1,5 pantallas del borde inferior; lo demás se ata cuando se acerca, aún fuera de la vista (esconderlo no parpadea),
  // dentro del mismo contexto para que se revierta con la vista. Sin atar, un nodo se ve tal cual.
  const vh = window.innerHeight
  const nodos = Array.from(raiz.querySelectorAll<HTMLElement>('[data-pl]')).map((el) => ({ el, r: el.getBoundingClientRect() }))
  const cerca = perezoso ? nodos.filter((n) => n.r.top < vh * 2.5) : nodos
  cerca.forEach((n) => atarUno(n.el))
  const vigia = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return
    vigia.unobserve(e.target)
    ctx.add(() => atarUno(e.target as HTMLElement))
  }), { rootMargin: '0px 0px 150% 0px' })
  if (perezoso) nodos.forEach((n) => { if (n.r.top >= vh * 2.5) vigia.observe(n.el) })
  // Lo que ya está a la vista al llegar arranca en el mismo fotograma (sin esperar la primera llamada del observador): es lo primero que se ve tras el telón.
  let k0 = 0
  cerca.forEach(({ el, r }) => {
    const jugar = pendientes.get(el)
    if (!jugar || r.bottom <= 0 || r.top >= vh * 0.94) return
    pendientes.delete(el)
    io.unobserve(el)
    jugar(base + Number(el.dataset.plRetraso ?? 0) + Math.min(k0++, 5) * 0.045, true)
  })
  // Fail-open (invariante de la casa): nada se queda escondido. A los 3 s lo que ya quedó a la vista o por encima (salto de ancla, scroll restaurado,
  // Ctrl+F) se muestra, y al imprimir se muestra todo.
  const liberar = (todo: boolean) => pendientes.forEach((jugar, el) => {
    if (!todo && el.getBoundingClientRect().top > window.innerHeight) return
    pendientes.delete(el)
    io.unobserve(el)
    jugar(0, false)
  })
  const seguro = window.setTimeout(() => liberar(false), 3000)
  const imprimir = () => liberar(true)
  window.addEventListener('beforeprint', imprimir)
  limpiar.push(() => { clearTimeout(seguro); window.removeEventListener('beforeprint', imprimir); io.disconnect(); vigia.disconnect() })
}

/* ------------------------------------------------------------------ View Transitions entre vistas con escena */

/** La View Transition en curso espera a que la vista nueva esté montada Y con su scroll puesto: la vista que llega llama a resolverVT(). */
let esperaVT: (() => void) | null = null
export const resolverVT = () => { const f = esperaVT; esperaVT = null; if (f) performance.mark('pl-vt-resuelta'); f?.() }

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
    const base = entrada.retraso
    entrada.retraso = 0
    const guardada = tipo === 'POP' ? posiciones.get(pathname + search) : undefined
    if (guardada !== undefined) setTimeout(() => window.scrollTo({ top: guardada, behavior: 'instant' }), 0)
    // Un enlace con ancla (#rh, #pl-proceso) lleva al bloque una vez montada la vista.
    const ancla = location.hash.slice(1)
    if (ancla) {
      const t = window.setTimeout(() => document.getElementById(ancla)?.scrollIntoView({ block: 'start' }), 90)
      limpiar.push(() => clearTimeout(t))
    }
    const ctx = gsap.context((self) => {
      gsap.set(raiz, { clearProps: 'transform,opacity' })
      // Con scroll que restaurar o ancla la vista no abre arriba: se ata todo al montar, como siempre.
      activar(raiz, limpiar, base, self, guardada === undefined && !ancla)
      montar?.(raiz, limpiar)
    }, raiz)
    resolverVT() // una View Transition en curso espera a esta vista montada (y con su scroll puesto)
    return () => {
      limpiar.forEach((f) => f())
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, pathname])
  return ref
}

/* ------------------------------------------------------------------ navegar con cubierta */

let cubierta: HTMLElement | null = null
let saliendo = false
export const registrarCubierta = (el: HTMLElement | null) => { cubierta = el }
const OCULTA = 'polygon(0% 112%, 100% 100%, 100% 100%, 0% 100%)'
const PLENA = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
const SALIDA = 'polygon(0% 112%, 100% 100%, 100% 100%, 0% 100%)'

/**
 * La cubierta de la transición: un telón del color del DESTINO (plató o sala) que sube con un borde inclinado, la ruta cambia
 * bajo él y se retira hacia abajo, dejando ver la vista nueva en orden de lectura. Reacción inmediata; cubre en 0,32 s y descubre en 0,44 s (usable ≈ 0,8 s).
 * `directo` navega sin telón (la captura que vuela de la tarjeta a la ficha ya es la transición).
 */
export function useIr() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return useCallback((to: string, o: { oscuro?: boolean; directo?: boolean; vt?: boolean } = {}) => {
    if (to === pathname + search) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (saliendo) return
    const ir = () => { window.scrollTo({ top: 0, behavior: 'instant' }); navigate(to) }
    // Entre vistas con escena (obra ↔ ficha ↔ ficha) el lienzo no se desmonta: solo el DOM cambia, con una View Transition. El título de la obra viaja
    // del rótulo a la ficha como elemento compartido y el lienzo (que sigue vivo) queda fuera de las capturas. Sin soporte, cae al fundido de siempre.
    if (o.vt && typeof document.startViewTransition === 'function') {
      saliendo = true
      posiciones.set(pathname + search, window.scrollY)
      const raiz = document.documentElement
      raiz.dataset.plvt = '1'
      const fin = () => { delete raiz.dataset.plvt; saliendo = false }
      performance.mark('pl-vt-inicio')
      const t = document.startViewTransition(() => new Promise<void>((resolver) => {
        performance.mark('pl-vt-callback')
        esperaVT = resolver
        window.setTimeout(resolverVT, 1500) // red de seguridad: si la vista nueva no avisa, la transición no se queda colgada
        window.scrollTo({ top: 0, behavior: 'instant' })
        navigate(to)
      }))
      t.ready.then(() => performance.mark('pl-vt-lista'), () => {})
      t.finished.then(fin, fin)
      return
    }
    if (o.directo || !cubierta) {
      const vista = document.querySelector<HTMLElement>('.pl-vista')
      if (!vista || to.split('?')[0] === pathname) { ir(); return }
      saliendo = true
      posiciones.set(pathname + search, window.scrollY)
      gsap.to(vista, { opacity: 0, duration: 0.18, ease: 'power2.out', onComplete: () => { saliendo = false; ir() } })
      return
    }
    saliendo = true
    posiciones.set(pathname + search, window.scrollY)
    const el = cubierta
    el.style.background = o.oscuro ? 'var(--plato)' : 'var(--sala)'
    gsap.killTweensOf(el)
    gsap.set(el, { clipPath: OCULTA, visibility: 'visible' })
    gsap.to(el, {
      clipPath: PLENA, duration: 0.25, ease: 'pl-rod',
      onComplete: () => {
        entrada.retraso = 0 // la vista nueva juega su entrada mientras el telón se va (de arriba abajo, en orden de lectura), no antes
        ir()
        gsap.to(el, { clipPath: SALIDA, duration: 0.38, ease: 'pl-rod', onComplete: () => { gsap.set(el, { visibility: 'hidden' }); saliendo = false } })
      },
    })
  }, [navigate, pathname, search])
}

/* ------------------------------------------------------------------ tarjeta → ficha (elemento compartido) */

interface Vuelo { slug: string; desde: DOMRect; clon: HTMLImageElement; radio: number; seguro?: gsap.core.Tween }
let vuelo: Vuelo | null = null
/** Levanta una copia de la captura exactamente donde se ve (la tarjeta), para que cruce al marco de la ficha. */
export function despegar(slug: string, marco: HTMLElement, img: HTMLImageElement) {
  vuelo?.clon.remove()
  vuelo?.seguro?.kill()
  const r = marco.getBoundingClientRect()
  const radio = parseFloat(getComputedStyle(marco).borderTopLeftRadius) || 0
  const clon = new Image()
  clon.src = img.currentSrc || img.src
  clon.alt = ''
  clon.setAttribute('aria-hidden', 'true')
  Object.assign(clon.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0', zIndex: '200', pointerEvents: 'none', objectFit: 'cover', objectPosition: 'top', transformOrigin: '0 0', borderRadius: `${radio}px` })
  document.body.appendChild(clon)
  const mio: Vuelo = { slug, desde: r, clon, radio }
  vuelo = mio
  // Seguro: si el otro lado nunca la reclama (ruta inválida), la copia no se queda en pantalla.
  mio.seguro = gsap.delayedCall(2.5, () => { if (vuelo === mio) { mio.clon.remove(); vuelo = null } })
}
/** Slug de la captura que está en vuelo (la lista lee esto para recibir a la que regresa de su ficha). */
export const vueloDe = () => vuelo?.slug

/** Del otro lado: la copia viaja al marco (transform y borde, 0,9 s) y entrega el relevo a la imagen real. Con la tarjeta inclinada −3° al salir, como en lusion.co. */
export function aterrizar(slug: string, marco: HTMLElement, limpiar: Array<() => void>, alTerminar?: () => void) {
  const v = vuelo
  if (!v || v.slug !== slug) return false
  const { desde, clon } = v
  const radioFinal = parseFloat(getComputedStyle(marco).borderTopLeftRadius) || 0
  gsap.set(marco, { visibility: 'hidden' })
  const volar = () => {
    const a = marco.getBoundingClientRect()
    const sx = a.width / desde.width
    const sy = a.height / desde.height
    tw = gsap.fromTo(clon, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, borderRadius: v.radio }, {
      x: a.left - desde.left, y: a.top - desde.top, scaleX: sx, scaleY: sy, borderRadius: radioFinal / Math.min(sx, sy),
      duration: 0.9, ease: 'pl',
      onComplete: () => { gsap.set(marco, { visibility: 'visible' }); clon.remove(); v.seguro?.kill(); if (vuelo === v) vuelo = null; alTerminar?.() },
    })
  }
  let tw: gsap.core.Tween | undefined
  const t = window.setTimeout(volar, 0)
  limpiar.push(() => { clearTimeout(t); tw?.kill(); gsap.set(marco, { clearProps: 'visibility' }) })
  return true
}
