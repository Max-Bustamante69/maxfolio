import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'

// Motor de Persona: GSAP lidera la coreografía (motion-engine-standard). Se registra aquí, dentro de la dirección.
// Solo transform, opacity y clip-path. Nada corre con la página quieta: GSAP duerme su ticker solo, ScrollTrigger
// despierta con el scroll y el resto (cinta, hover) es CSS o WAAPI en el compositor.
// ScrollTrigger arranca al registrarse un lazo requestAnimationFrame que no se detiene nunca («_rafBugFix», parche de
// repintado para Firefox) y la página quieta pediría 60 fotogramas por segundo (idle-frame-budget Z-1). Se traga ESE
// único pedido durante el registro: el lazo no empieza; el ticker de GSAP se duerme solo al quedar sin animaciones y
// ScrollTrigger sigue despertando con el scroll.
const rafReal = window.requestAnimationFrame
window.requestAnimationFrame = (() => 0) as typeof window.requestAnimationFrame
try {
  gsap.registerPlugin(ScrollTrigger, Flip, CustomEase)
} finally {
  window.requestAnimationFrame = rafReal
}
// Su sondeo de scroll cada 250 ms también pide un fotograma con la página quieta; con scroll nativo basta el evento `scroll`.
ScrollTrigger.config({ syncInterval: 2147483647 })
// El ticker de GSAP se duerme tras 120 fotogramas sin animaciones (≈ 2 s). Con 30 la «cola» tras la última animación es de ≈ 0,5 s.
gsap.config({ autoSleep: 30 })

/** El golpe de Persona: ataque seco, un rebote corto y asiente (letras pegadas, paneles que caen). */
CustomEase.create('pr-slam', 'M0,0 C0.14,0 0.2,1.22 0.5,1.06 0.72,0.99 0.86,1 1,1')
export const SLAM = 'pr-slam'
export const OUT = 'power3.out'
/** clip-path de rectángulo completo, en el mismo formato que los extremos de las animaciones (GSAP no interpola contra el valor computado en px). */
export const CLIP_PLENO = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'

/** gsap.context() con revert() al desmontar: sin fugas al navegar. `scope` acota los selectores. */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: () => void, deps: DependencyList = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context(setup, scope.current ?? undefined)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** ¿Ya está dentro de la vista al montar? Entonces se anima de inmediato (un ScrollTrigger por encima del borde no dispara). */
export const enVista = (el: Element) => {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight * 0.92 && r.bottom > 0
}

const PANEL_DESDE = { opacity: 0, y: 28, rotation: -2.5, scale: 0.97, transformOrigin: '0% 100%' }

/** Paneles que caen un poco girados y se asientan, una vez, al verse. Solo elementos internos: la sección nunca se oculta. */
export function revelarPaneles(scope: HTMLElement | null, selector = '[data-pr-panel]', retraso = 0.25) {
  if (!scope) return
  const todos = gsap.utils.toArray<HTMLElement>(selector, scope)
  const iniciales = todos.filter(enVista)
  const resto = todos.filter((e) => !enVista(e))
  const hasta = { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.6, ease: SLAM, clearProps: 'transform,opacity', stagger: 0.08, overwrite: 'auto' as const }
  if (iniciales.length) gsap.fromTo(iniciales, PANEL_DESDE, { ...hasta, delay: retraso })
  if (resto.length) {
    gsap.set(resto, PANEL_DESDE)
    ScrollTrigger.batch(resto, { start: 'top 92%', once: true, onEnter: (lote) => gsap.to(lote, { ...hasta }) })
  }
}

/** Parallax del fondo (0,2×): ScrollTrigger scrub, solo transform. */
export function parallaxFondo(scope: HTMLElement | null, selector = '.pr-fondo img') {
  if (!scope) return
  gsap.utils.toArray<HTMLElement>(selector, scope).forEach((img) => {
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.closest('section') ?? img, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
}

/** Letras de nota de rescate que se pegan una a una (cada una llega girada y grande y se asienta en su ángulo). */
export function pegarLetras(letras: HTMLElement[] | NodeListOf<Element>, vars: gsap.TweenVars = {}) {
  const lista = Array.from(letras) as HTMLElement[]
  if (!lista.length) return null
  return gsap.from(lista, {
    opacity: 0,
    yPercent: -70,
    rotation: () => gsap.utils.random(-32, 32),
    scale: 1.55,
    duration: 0.5,
    ease: SLAM,
    stagger: { each: 0.026, from: 'start' },
    ...vars,
  })
}

/** El último filtro de la obra: la ficha vuelve a él con «← Obra» (el filtro vive en la URL; esto solo lo recuerda entre vistas). */
export const memoria = { filtro: 'todo' }

// --- Viaje de la captura: del índice a su ficha (y de vuelta) con Flip -------------------------------------------
let viaje: { slug: string; rect: DOMRect; t: number } | null = null
/** Guarda dónde estaba la captura en el momento del clic. */
export const guardarViaje = (slug: string, el: Element) => {
  viaje = { slug, rect: el.getBoundingClientRect(), t: Date.now() }
}
/** Se lee sin borrar (StrictMode monta dos veces) y caduca a los 2 s: un Atrás tardío no dispara el viaje. */
export const leerViaje = (slug: string) => (viaje && viaje.slug === slug && Date.now() - viaje.t < 2000 ? viaje : null)
/** El viaje pendiente sea cual sea su obra (el índice busca su tarjeta al volver). */
export const viajePendiente = () => (viaje && Date.now() - viaje.t < 2000 ? viaje : null)
export const soltarViaje = () => {
  viaje = null
}

/** La captura recién montada arranca donde estaba la de la pantalla anterior y se asienta en su sitio. */
export function volarDesde(el: HTMLElement, rect: DOMRect, vars: Record<string, unknown> = {}) {
  const fantasma = document.createElement('div')
  fantasma.setAttribute('aria-hidden', 'true')
  Object.assign(fantasma.style, { position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, pointerEvents: 'none', opacity: '0' })
  document.body.appendChild(fantasma)
  const quitar = () => fantasma.remove()
  const terminar = () => {
    quitar()
    soltarViaje() // solo al terminar: StrictMode monta dos veces y la segunda necesita leer el mismo viaje
  }
  Flip.fit(el, fantasma, { scale: true, duration: 0.78, ease: 'expo.out', runBackwards: true, zIndex: 60, onComplete: terminar, onInterrupt: quitar, ...vars } as Flip.FitVars)
  return terminar
}

export { gsap, ScrollTrigger, Flip }
