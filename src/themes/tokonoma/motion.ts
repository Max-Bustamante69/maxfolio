import { useCallback, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

// Motor de movimiento de Tokonoma. Un solo easing en lo que no bloquea (expo, nendo y tokujin) y la curva de takram para el barrido
// del titular y el golpe del sello. GSAP solo coreografía; el scroll es el del navegador y ScrollTrigger NO se usa (deja un
// requestAnimationFrame perpetuo): las apariciones las dispara un IntersectionObserver y la página quieta pide cero fotogramas.
// Solo transform, opacity, clip-path y (una vez, en el titular) filter. prefers-reduced-motion no se implementa (decisión de la casa).
gsap.registerPlugin(CustomEase)
gsap.config({ autoSleep: 12 })
CustomEase.create('tk-expo', '.19,1,.22,1')
CustomEase.create('tk-asienta', '.6,0,.2,1.05')
export { gsap }

/* ------------------------------------------------------------------ apariciones declarativas */

type Juega = (retraso: number) => void
// Cada binder escribe su estado oculto con JS (si el JS falla nada queda escondido) y devuelve la función que lo juega.
const atar: Record<string, (el: HTMLElement) => Juega> = {
  /** Sube y aparece: 1 000 ms expo (tokujin `.js-appear`). 25 px de serie; `data-tk-y` lo cambia (las notas y etiquetas suben menos, 10 a 14 px). */
  sube(el) {
    const y = Number(el.dataset.tkY ?? 25)
    gsap.set(el, { opacity: 0, y })
    return (r) => gsap.to(el, { opacity: 1, y: 0, duration: y < 25 ? 0.9 : 1, ease: 'tk-expo', delay: r, clearProps: 'transform,opacity' })
  },
  /** Un titular de sección sale de detrás de su propia línea: el borde inferior sube y el texto asienta (cada h2 una sola vez, 1,1 s expo). */
  titulo(el) {
    gsap.set(el, { opacity: 0, y: 22, clipPath: 'inset(100% -0.05em -0.2em -0.05em)' })
    return (r) => gsap.to(el, { opacity: 1, y: 0, clipPath: 'inset(-0.1em -0.05em -0.2em -0.05em)', duration: 1.1, ease: 'tk-expo', delay: r, clearProps: 'clipPath,transform,opacity' })
  },
  /** Hijos directos con escalón de 90 ms: la cartela entra línea a línea. */
  grupo(el) {
    const hijos = Array.from(el.children)
    gsap.set(hijos, { opacity: 0, y: 16 })
    return (r) => gsap.to(hijos, { opacity: 1, y: 0, duration: 0.95, ease: 'tk-expo', delay: r, stagger: 0.08, clearProps: 'transform,opacity' })
  },
  /** El gesto firma del titular: cada bloque [data-b] se barre de izquierda a derecha (takram: 400 ms con la curva .6,0,.2,1.05, el desenfoque de .5 px cede en 600 ms). */
  barrido(el) {
    const bloques = Array.from(el.querySelectorAll<HTMLElement>('[data-b]'))
    gsap.set(bloques, { opacity: 0, clipPath: 'inset(-0.4em 100% -0.4em 0%)', filter: 'blur(0.5px)' })
    return (r) => {
      gsap.to(bloques, { opacity: 1, clipPath: 'inset(-0.4em 0% -0.4em 0%)', duration: 0.4, ease: 'tk-asienta', delay: r, stagger: 0.14, clearProps: 'clipPath,opacity' })
      gsap.to(bloques, { filter: 'blur(0px)', duration: 0.6, ease: 'power1.out', delay: r, stagger: 0.14, clearProps: 'filter' })
    }
  },
  /** La pieza del nicho cuelga y se despliega de arriba abajo; la captura se asienta desde un 8 % de más. */
  pieza(el) {
    const img = el.querySelector('img')
    gsap.set(el, { clipPath: 'inset(0% 0% 100% 0%)' })
    if (img) gsap.set(img, { scale: 1.08, transformOrigin: '50% 0%' })
    return (r) => {
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'tk-expo', delay: r, clearProps: 'clipPath' })
      if (img) gsap.to(img, { scale: 1, duration: 2, ease: 'tk-expo', delay: r, clearProps: 'transform' })
    }
  },
  /** El kakejiku: el papel se desenrolla hacia abajo y la varilla de abajo baja con el borde del recorte (misma curva, mismo recorrido). */
  rollo(el) {
    const papel = el.querySelector<HTMLElement>('.tk-rollo-papel')
    const varilla = el.querySelector<HTMLElement>('.tk-varilla-i')
    const h = papel?.offsetHeight ?? 0
    if (papel) gsap.set(papel, { clipPath: 'inset(0% 0% 100% 0%)' })
    if (varilla) gsap.set(varilla, { y: -h })
    return (r) => {
      if (papel) gsap.to(papel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'tk-expo', delay: r, clearProps: 'clipPath' })
      if (varilla) gsap.to(varilla, { y: 0, duration: 1.8, ease: 'tk-expo', delay: r, clearProps: 'transform' })
    }
  },
  /** Un filete que se dibuja de izquierda a derecha. */
  filete(el) {
    gsap.set(el, { scaleX: 0, transformOrigin: '0 50%' })
    return (r) => gsap.to(el, { scaleX: 1, duration: 1.4, ease: 'tk-expo', delay: r, clearProps: 'transform' })
  },
  /** Una cifra sube desde detrás de su máscara (el contenedor recorta): el número «se asienta» en su línea. */
  mascara(el) {
    const dentro = el.firstElementChild as HTMLElement | null
    if (!dentro) return () => undefined
    gsap.set(dentro, { y: el.offsetHeight * 1.1 })
    return (r) => gsap.to(dentro, { y: 0, duration: 1.1, ease: 'tk-expo', delay: r, clearProps: 'transform' })
  },
  /** El sello se estampa: baja un poco más grande y torcido y se asienta con el rebase de takram. */
  sello(el) {
    gsap.set(el, { opacity: 0, scale: 1.55, rotate: -12 })
    return (r) => gsap.to(el, { opacity: 1, scale: 1, rotate: -3, duration: 0.55, ease: 'tk-asienta', delay: r, clearProps: 'opacity' })
  },
}
/** Dónde dispara cada binder: % de la ventana que debe estar «despierto» por debajo del borde. 9 = el 91 % de tokujin; las piezas grandes arrancan antes (al 75 %). */
const MARGEN: Record<string, number> = { pieza: 24, rollo: 0, sello: 12 }

/** Busca [data-tk] en `raiz`, escribe su estado oculto y lo juega al cruzar su línea de la ventana (o ya, si está a la vista). */
function activar(raiz: HTMLElement, limpiar: Array<() => void>, base = 0) {
  const pendientes = new Map<Element, Juega>()
  const observadores = new Map<number, IntersectionObserver>()
  const observador = (m: number) => {
    let io = observadores.get(m)
    if (!io) {
      io = new IntersectionObserver(
        (entradas) => {
          let k = 0
          entradas.forEach((en) => {
            const jugar = pendientes.get(en.target)
            if (!en.isIntersecting || !jugar) return
            pendientes.delete(en.target)
            io!.unobserve(en.target)
            jugar(base + Number((en.target as HTMLElement).dataset.tkR ?? 0) + Math.min(k++, 5) * 0.07)
          })
        },
        { rootMargin: `0px 0px -${m}% 0px` },
      )
      observadores.set(m, io)
    }
    return io
  }
  raiz.querySelectorAll<HTMLElement>('[data-tk]').forEach((el) => {
    try {
      const tipo = el.dataset.tk ?? ''
      const jugar = atar[tipo]?.(el)
      if (!jugar) return
      pendientes.set(el, jugar)
      observador(Number(el.dataset.tkM ?? MARGEN[tipo] ?? 9)).observe(el)
    } catch {
      gsap.set(el, { clearProps: 'all' }) // fail-open por nodo
    }
  })
  limpiar.push(() => observadores.forEach((io) => io.disconnect()))
}

/* ------------------------------------------------------------------ la cortina de papel (cambio de vista) */

let cortina: HTMLDivElement | null = null
let retrayendo = false

/** La cubierta es el papel del nicho y lleva la firma: el sello cae al llegar. Va bajo la cabecera, que no se reinicia. */
function levantarCortina(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'tk-cortina'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = '<span class="tk-sello tk-sello-c" style="--s:64px"><i>M</i><i>B</i></span>'
  ;(document.querySelector('.v5-tokonoma') ?? document.body).appendChild(el)
  return el
}

/** La vista nueva ya está montada: el papel sube y la deja a la vista (450 ms; el contenido ya es usable a los ~150). */
function retirarCortina() {
  if (!cortina || retrayendo) return
  retrayendo = true
  const c = cortina
  const seguro = gsap.delayedCall(2.5, () => fin())
  const fin = () => { seguro.kill(); c.remove(); if (cortina === c) cortina = null; retrayendo = false }
  gsap.to(c, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.45, ease: 'tk-expo', onComplete: fin })
}

/** Posición de scroll por ruta, para que Atrás devuelva la lista donde estaba. */
const posiciones = new Map<string, number>()

/**
 * Raíz de una vista: entra con un fundido (con cortina: 200 ms; sin ella, 600 ms lineal, tokujin comprimido), dispara las apariciones
 * y, si se pasa `montar`, la coreografía propia. Todo lo que crea queda dentro de un gsap.context y se revierte al desmontar.
 */
export function useVista<T extends HTMLElement = HTMLElement>(deps: unknown[] = [], montar?: (raiz: T, limpiar: Array<() => void>) => void) {
  const ref = useRef<T>(null)
  const { pathname, search } = useLocation()
  const tipo = useNavigationType()
  useLayoutEffect(() => {
    const raiz = ref.current
    if (!raiz) return
    const limpiar: Array<() => void> = []
    if (tipo === 'POP') {
      const guardada = posiciones.get(pathname + search)
      if (guardada !== undefined) {
        // el navegador y el efecto global de scroll también tocan la posición al volver: se reafirma en cuanto asientan
        const poner = () => window.scrollTo({ top: guardada, behavior: 'instant' })
        poner()
        const t = window.setTimeout(poner, 0)
        const t2 = window.setTimeout(poner, 150)
        limpiar.push(() => { clearTimeout(t); clearTimeout(t2) })
      }
    } else window.scrollTo({ top: 0, behavior: 'instant' })
    const conCortina = !!cortina
    const ctx = gsap.context(() => {
      gsap.fromTo(raiz, { opacity: 0 }, { opacity: 1, duration: conCortina ? 0.2 : 0.6, ease: 'none', clearProps: 'opacity' })
      activar(raiz, limpiar, conCortina ? 0.06 : 0)
      montar?.(raiz, limpiar)
    }, raiz)
    retirarCortina()
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
const enMovil = () => window.matchMedia('(max-width: 767px)').matches

interface Vuelo { slug: string; desde: DOMRect; clon: HTMLImageElement; seguro: gsap.core.Tween }
let vuelo: Vuelo | null = null
/** ¿Hay una captura en vuelo hacia esta obra? (la ficha no despliega su pieza si la recibe volando) */
export const vuelaHacia = (slug: string) => vuelo?.slug === slug

/**
 * Navega con la salida de la vista. Con una captura en vuelo (sala → ficha) la vista sale con un fundido de 280 ms y la copia viaja;
 * en el resto, la cortina de papel sube (220 ms), la ruta cambia con la vista cubierta y el papel se retira (450 ms): contenido
 * usable ≈ 0,4 s tras el clic (EX-7). Atrás y Adelante entran directo.
 */
export function useIr() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return useCallback(
    (to: string) => {
      if (to === pathname + search) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const vista = document.querySelector<HTMLElement>('.tk-vista')
      if (!vista || saliendo || to.split('?')[0] === pathname) {
        if (!saliendo) navigate(to)
        return
      }
      saliendo = true
      posiciones.set(pathname + search, window.scrollY)
      const ir = () => { saliendo = false; navigate(to) }
      if (vuelo) {
        gsap.to(vista, { opacity: 0, duration: 0.28, ease: 'none', onComplete: ir })
        return
      }
      const c = levantarCortina()
      cortina = c
      retrayendo = false
      gsap.fromTo(c, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.22, ease: 'power2.in', onComplete: ir })
      const sello = c.firstElementChild
      if (sello) gsap.fromTo(sello, { opacity: 0, scale: 1.5, rotate: -12 }, { opacity: 1, scale: 1, rotate: -3, duration: 0.26, ease: 'tk-asienta', delay: 0.04 })
    },
    [navigate, pathname, search],
  )
}

/* ------------------------------------------------------------------ la captura viaja de la sala a la ficha (EX-8: mismo medio, ≤ 1 s) */

/** Levanta una copia de la captura exactamente donde se ve (con su recorte); sigue en pantalla mientras la vista sale. En móvil no hay vuelo (la sala y la ficha encuadran distinto). */
export function despegar(slug: string, img: HTMLImageElement) {
  if (enMovil()) return
  vuelo?.clon.remove()
  vuelo?.seguro.kill()
  const r = img.getBoundingClientRect()
  const estilo = getComputedStyle(img)
  const clon = new Image()
  clon.src = img.currentSrc || img.src
  clon.alt = ''
  clon.setAttribute('aria-hidden', 'true')
  Object.assign(clon.style, {
    position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0', zIndex: '200',
    pointerEvents: 'none', transformOrigin: '0 0', objectFit: estilo.objectFit, objectPosition: estilo.objectPosition,
  })
  document.body.appendChild(clon)
  const mio: Vuelo = { slug, desde: r, clon, seguro: gsap.delayedCall(2.5, () => { if (vuelo === mio) { mio.clon.remove(); vuelo = null } }) }
  vuelo = mio
}

/** Del otro lado: la copia viaja al marco (transform, 900 ms expo) y entrega el relevo a la imagen real. */
export function aterrizar(slug: string, destino: HTMLElement, limpiar: Array<() => void>) {
  const v = vuelo
  if (!v || v.slug !== slug) return
  gsap.set(destino, { visibility: 'hidden' })
  const t = window.setTimeout(() => {
    const a = destino.getBoundingClientRect()
    const tw = gsap.fromTo(v.clon, { x: 0, y: 0, scale: 1 }, {
      x: a.left - v.desde.left, y: a.top - v.desde.top, scale: a.width / v.desde.width, duration: 0.9, ease: 'tk-expo',
      onComplete: () => { gsap.set(destino, { clearProps: 'visibility' }); v.clon.remove(); v.seguro.kill(); if (vuelo === v) vuelo = null },
    })
    limpiar.push(() => tw.kill())
  }, 0)
  limpiar.push(() => { clearTimeout(t); gsap.set(destino, { clearProps: 'visibility' }) })
}
