import { useLayoutEffect, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

// Motor de movimiento de la dirección D · Aluminio. GSAP coreografía (entrada, revelados, despiece); el barrido entre
// vistas y la foto compartida son View Transitions (la tarjeta de la tabla viaja al visor de la ficha).
// Carácter «clic mecánico»: UNA curva (0,3 · 0 · 0 · 1: arranque seco, asiento firme), duraciones cortas, barridos
// de clip-path (como una pantalla que se refresca) y pasos (steps) donde el aparato es discreto.
// Reglas de la casa: solo transform, opacity y clip-path; todo dentro de gsap.context() con revert() al desmontar;
// estado final visible si el JS falla (cada coreografía va en try/catch y, si lanza, revierte a lo visible);
// cero requestAnimationFrame con la página quieta. Por eso NO se usa ScrollTrigger (su bucle _rafBugFix pide un
// fotograma sin parar mientras exista): los revelados son IntersectionObserver y el despiece lee el evento scroll.

gsap.registerPlugin(CustomEase)
// El ticker de GSAP duerme a los 20 fotogramas sin nada que mover (por defecto, 120): con la página quieta no hay rAF.
gsap.config({ autoSleep: 20 })
export const SNAP = CustomEase.get('d-snap') ? 'd-snap' : (CustomEase.create('d-snap', '0.3,0,0,1'), 'd-snap')

export { gsap }

/** Barrido de arriba abajo, como una pantalla que se refresca: lo oculto y lo mostrado. */
export const CORTE = { oculto: 'inset(0 0 100% 0)', visto: 'inset(0 0 0% 0)' }
export const CORTE_H = { oculto: 'inset(0 100% 0 0)', visto: 'inset(0 0% 0 0)' }
/** Lo único que GSAP escribe en línea y se limpia al terminar (queda el CSS de reposo, con sus :hover y :active). */
export const LIMPIAR = 'opacity,transform,clipPath,visibility'

let entradaHecha = false
/** La primera vista de la sesión hace la entrada completa; las siguientes, la corta. Se marca con un temporizador
 *  para que el doble montaje de StrictMode (desarrollo) vea lo mismo las dos veces. */
export function esPrimeraCarga() {
  if (!entradaHecha) setTimeout(() => (entradaHecha = true), 200)
  return !entradaHecha
}

/** ¿Esta vista se monta dentro de una View Transition? Entonces el barrido de la página YA es su entrada: la vista nace completa
 *  (sin `from()` de cabecera, visor ni pantalla) y solo conserva micro-pasos de ≤ 0,4 s. Sin View Transition (primera carga,
 *  atrás/adelante, Firefox < 144, Movimiento reducido) corre la entrada entera. */
export const enTransicion = () => document.documentElement.hasAttribute('data-d-vt')
export const fueraDeVista = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.94

type Limpieza = () => void
/** Limpiezas (observadores, escuchas) que registran los revelados mientras corre una coreografía. */
let limpiezas: Limpieza[] | null = null

/** Coreografía con alcance: se crea en el layout (antes de pintar, sin parpadeo), se revierte al desmontar y,
 *  si algo falla, deja el contenido visible. `activa=false` (interruptor Movimiento: reducido) no anima. */
export function useCoreografia(raiz: RefObject<HTMLElement | null>, fn: () => void | Limpieza, activa: boolean, deps: unknown[] = []) {
  useLayoutEffect(() => {
    if (!activa || !raiz.current) return
    const propias: Limpieza[] = []
    let final: void | Limpieza
    const ctx = gsap.context(() => {
      limpiezas = propias
      try {
        final = fn()
      } catch {
        propias.forEach((f) => f())
        ctx.revert()
      } finally {
        limpiezas = null
      }
    }, raiz)
    return () => {
      if (typeof final === 'function') final()
      propias.forEach((f) => f())
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activa, ...deps])
}

/** Ejecuta `fn` la primera vez que `el` entra en pantalla (IntersectionObserver, sin fotogramas en reposo). */
export function alVer(el: Element | null, fn: () => void, margen = '0px 0px -6% 0px') {
  if (!el) return
  const io = new IntersectionObserver((entradas) => {
    if (!entradas.some((e) => e.isIntersecting)) return
    io.disconnect()
    fn()
  }, { rootMargin: margen })
  io.observe(el)
  limpiezas?.push(() => io.disconnect())
}

/** Revela con scroll SOLO elementos internos: cada uno barre de arriba abajo cuando entra por el borde inferior. */
export function revelar(objetivos: gsap.TweenTarget, opciones: { y?: number; escalon?: number; margen?: string; duracion?: number } = {}) {
  const { y = 8, escalon = 0.045, margen = '0px 0px -6% 0px', duracion = 0.26 } = opciones
  const els = gsap.utils.toArray<Element>(objetivos).filter((e) => !enTransicion() || fueraDeVista(e))
  if (!els.length) return
  gsap.set(els, { clipPath: CORTE.oculto, y })
  const io = new IntersectionObserver((entradas) => {
    const lote = entradas.filter((e) => e.isIntersecting).map((e) => e.target)
    if (!lote.length) return
    lote.forEach((t) => io.unobserve(t))
    lote.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    gsap.to(lote, { clipPath: CORTE.visto, y: 0, duration: duracion, ease: SNAP, stagger: escalon, clearProps: 'clipPath,transform' })
  }, { rootMargin: margen })
  els.forEach((e) => io.observe(e))
  limpiezas?.push(() => io.disconnect())
}

/** Variante para una fila entera de la tabla: sus celdas (o solo `celdas`, las nuevas) barren a la vez cuando la fila entra. */
export function revelarFila(fila: Element, extra?: () => void, celdas: Element[] = Array.from(fila.children)) {
  if (!celdas.length || (enTransicion() && !fueraDeVista(fila))) return
  gsap.set(celdas, { clipPath: CORTE.oculto })
  alVer(fila, () => {
    gsap.to(celdas, { clipPath: CORTE.visto, duration: 0.24, ease: SNAP, stagger: 0.035, clearProps: 'clipPath' })
    extra?.()
  }, '0px 0px -4% 0px')
}

/** Barras de medida (scaleX/scaleY desde una variable CSS --v): arrancan en 0 y crecen cuando su contenedor entra. */
export function crecer(disparador: Element | null, barras: Element[], eje: 'X' | 'Y' = 'X') {
  if (!disparador || !barras.length || (enTransicion() && !fueraDeVista(disparador))) return
  const prop = eje === 'X' ? 'scaleX' : 'scaleY'
  gsap.set(barras, { [prop]: 0 })
  alVer(disparador, () => gsap.to(barras, { [prop]: (_: number, el: Element) => (eje === 'Y' ? 1 : Number(getComputedStyle(el).getPropertyValue('--v')) || 1), duration: 0.5, ease: SNAP, stagger: 0.02, clearProps: 'transform' }))
}

/** Progreso de scroll de una pista (sticky) sin bucle: se recalcula con el evento scroll (pasivo), el redimensionado y las fuentes.
 *  `alProgreso(p)` recibe 0 → 1 a lo largo de `recorrido` px desde que la escena se fija. Devuelve la limpieza y `irA(p)`. */
export function seguirPista(pista: HTMLElement, escena: HTMLElement, tope: () => number, alProgreso: (p: number) => void) {
  let inicio = 0
  let recorrido = 1
  const medir = () => {
    inicio = pista.getBoundingClientRect().top + window.scrollY - tope()
    recorrido = Math.max(1, pista.offsetHeight - escena.offsetHeight)
    leer()
  }
  const leer = () => alProgreso(Math.min(1, Math.max(0, (window.scrollY - inicio) / recorrido)))
  medir()
  window.addEventListener('scroll', leer, { passive: true })
  window.addEventListener('resize', medir)
  void document.fonts?.ready.then(medir)
  window.addEventListener('load', medir, { once: true })
  return {
    irA: (p: number) => window.scrollTo({ top: inicio + p * recorrido }),
    limpiar: () => {
      window.removeEventListener('scroll', leer)
      window.removeEventListener('resize', medir)
      window.removeEventListener('load', medir)
    },
  }
}

let fotoViaja = false
/** La vista de destino pregunta si una foto llega viajando (View Transition): si es así, no anima esa imagen. */
export function consumirFoto() {
  const v = fotoViaja
  if (v) setTimeout(() => (fotoViaja = false), 200)
  return v
}

let fotoVuelve: string | null = null
/** «Volver a la tabla»: la ficha anota qué obra deja; la tabla pone el nombre de la foto compartida en la miniatura de ESA
 *  columna y el visor regresa a su sitio (la ida viaja 380 ms; la vuelta también). Se consume una sola vez. */
export const volverDesde = (slug: string) => {
  fotoVuelve = slug
  setTimeout(() => (fotoVuelve = null), 1500)
}
export function fotoDeVuelta() {
  const s = fotoVuelve
  fotoVuelve = null
  return s && enTransicion() ? s : null
}
const quitarNombresDeFoto = () => document.querySelectorAll<HTMLElement>('.d-col-enlace img, .d-m img').forEach((i) => i.style.removeProperty('view-transition-name'))

// ── Transición entre vistas ────────────────────────────────────────────────────────────────────────────────────────
type ConVT = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } }

let alTerminarNavegacion: (() => void) | null = null
/** La llama App cuando la ruta ya se pintó: libera a la View Transition para que capture la vista nueva. */
export const rutaPintada = () => {
  alTerminarNavegacion?.()
  alTerminarNavegacion = null
}

/** Navega con un barrido de clip-path (240 ms) sobre la vista; si el navegador no tiene View Transitions, corta.
 *  `foto` es el elemento que viaja (la captura de la tabla al visor de la ficha). Mientras dura, `html[data-d-vt]` avisa a
 *  la vista nueva de que NO repita su entrada: el barrido ya lo es (`enTransicion`). */
export function conTransicion(navegar: () => void, opciones: { quieto: boolean; foto?: HTMLElement | null }) {
  const doc = document as ConVT
  if (!doc.startViewTransition || opciones.quieto) {
    navegar()
    return
  }
  quitarNombresDeFoto()
  if (opciones.foto) {
    opciones.foto.style.setProperty('view-transition-name', 'd-foto')
    fotoViaja = true
  }
  // Los estilos de la transición (estilos.css) se activan solo con este atributo: el resto del sitio no los hereda.
  const raiz = document.documentElement
  raiz.setAttribute('data-d-vt', '')
  const vt = doc.startViewTransition(
    () =>
      new Promise<void>((listo) => {
        // La captura de la vista vieja ya está hecha: se sube al inicio ANTES de montar la nueva, para que sus revelados
        // sepan qué queda a la vista. React Router pinta su actualización en una transición de React: esperamos a que la ruta
        // nueva esté en el DOM (con tope de 400 ms, para que una vista nunca deje la página congelada).
        window.scrollTo({ top: 0, behavior: 'instant' })
        const tope = setTimeout(() => (alTerminarNavegacion = null, listo()), 400)
        alTerminarNavegacion = () => {
          clearTimeout(tope)
          listo()
        }
        flushSync(navegar)
      }),
  )
  void vt.finished.finally(() => {
    raiz.removeAttribute('data-d-vt')
    quitarNombresDeFoto()
  })
}
