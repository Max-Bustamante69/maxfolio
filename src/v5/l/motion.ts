import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'

// Movimiento de Anatomía: la gramática es «alinear y encajar» (dibujo técnico: una pluma traza la línea, las piezas se
// colocan sobre una base común). GSAP es el motor (motion-engine-standard); los plugins se registran aquí, dentro de la
// dirección. Reglas: solo transform, opacity y clip-path; sin ScrollTrigger (instala un lazo requestAnimationFrame
// perpetuo, `_rafBugFix` en gsap 3.15, que rompe «cero fotogramas en reposo»): los revelados con scroll usan un
// IntersectionObserver y GSAP solo late mientras un tween corre; estado final visible si el JS falla (fail-open).

gsap.registerPlugin(Flip, CustomEase)
CustomEase.create('l-encaje', '0.16,1,0.3,1')
CustomEase.create('l-pluma', '0.25,1,0.5,1')

export { gsap, Flip }

// Cero fotogramas en reposo (idle-frame-budget Z-1): el reloj de GSAP late mientras haya un tween vivo (también uno que espera
// su `delay`) y se DUERME explícitamente 250 ms después de que el último termina (su autosuspensión tarda hasta 2 s más y la
// sonda lo vería). Crear cualquier tween nuevo lo despierta solo.
let libreDesde = 0
gsap.ticker.add(() => {
  const vivos = gsap.globalTimeline.getChildren(false, true, true).some((t) => !t.paused() && t.progress() < 1)
  if (vivos) {
    libreDesde = 0
    return
  }
  const ahora = performance.now()
  libreDesde ||= ahora
  if (ahora - libreDesde > 250) {
    libreDesde = 0
    gsap.ticker.sleep()
  }
})

/** Contexto GSAP con revert() al desmontar. Si la fábrica lanza, se revierte todo y el contenido queda en su estado final visible. */
export function useGsap(scope: RefObject<HTMLElement | null>, fn: (root: HTMLElement) => void | (() => void), deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    let limpiar: void | (() => void)
    const ctx = gsap.context(() => {
      try {
        limpiar = fn(root)
      } catch {
        ctx.revert()
      }
    }, root)
    return () => {
      try {
        limpiar?.()
      } finally {
        ctx.revert()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Las palabras del titular suben desde su línea base, una tras otra (máscara por clip-path en .l-w). */
function titular(root: HTMLElement, retraso = 0.06) {
  const palabras = root.querySelectorAll<HTMLElement>('.l-h1 .l-w > span')
  if (!palabras.length) return
  gsap.from(palabras, { y: (_i, el: HTMLElement) => el.offsetHeight * 1.3, duration: 0.8, ease: 'l-encaje', stagger: 0.032, delay: retraso })
}

/** Filetes que se dibujan de izquierda a derecha, como una pluma. */
function reglas(root: HTMLElement, retraso = 0.2) {
  const filas = root.querySelectorAll<HTMLElement>('[data-regla]')
  if (!filas.length) return
  gsap.from(filas, { scaleX: 0, transformOrigin: '0 50%', duration: 0.75, ease: 'l-pluma', stagger: 0.07, delay: retraso })
}

/**
 * Revelado de elementos INTERNOS ([data-rv]): los que ya están a la vista entran en cascada al montar; los de más abajo,
 * cuando el IntersectionObserver los ve. Nunca se oculta una sección entera y el estado final es el de la hoja de estilos.
 * `alMostrar` avisa cuando la cascada inicial terminó (la firma de Inicio espera a que los tiles se vean sobre su suelo).
 * Red de seguridad: si algo sigue pendiente a los 8 s (sin scroll: impresión, modo lectura), se muestra con una transición
 * CSS, que no pide un solo fotograma de JS.
 */
function revelar(root: HTMLElement, retraso = 0.25, alMostrar?: () => void): () => void {
  const todos = Array.from(root.querySelectorAll<HTMLElement>('[data-rv]'))
  if (!todos.length) {
    alMostrar?.()
    return () => {}
  }
  const vh = window.innerHeight
  const vistos = todos.filter((e) => e.getBoundingClientRect().top < vh * 0.96)
  const resto = todos.filter((e) => !vistos.includes(e))
  gsap.set(todos, { opacity: 0, y: 14 })
  // La cascada completa dura como máximo 0,4 s: con muchos elementos a la vista el escalonado se comprime, nunca se alarga.
  gsap.to(vistos, { opacity: 1, y: 0, duration: 0.6, ease: 'l-encaje', stagger: { amount: Math.min(0.4, vistos.length * 0.045) }, delay: retraso, clearProps: 'opacity,transform', onComplete: alMostrar })
  if (!vistos.length) alMostrar?.()
  if (!resto.length) return () => {}
  const pendientes = new Set(resto)
  const io = new IntersectionObserver(
    (entradas) => {
      const ahora = entradas.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
      if (!ahora.length) return
      ahora.forEach((e) => {
        io.unobserve(e)
        pendientes.delete(e)
      })
      gsap.to(ahora, { opacity: 1, y: 0, duration: 0.65, ease: 'l-encaje', stagger: 0.05, clearProps: 'opacity,transform' })
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  resto.forEach((e) => io.observe(e))
  const seguro = window.setTimeout(() => {
    io.disconnect()
    pendientes.forEach((e) => {
      e.style.transition = 'opacity 0.5s var(--l-encaje), transform 0.5s var(--l-encaje)'
      e.style.opacity = '1'
      e.style.transform = 'none'
    })
  }, 8000)
  return () => {
    io.disconnect()
    window.clearTimeout(seguro)
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Transición entre vistas: una raya de tinta de 2 px nace en el borde de la cabecera y baja por la pantalla como la cabeza de un
// plotter. Al salir, deja tras de sí un telón del color del campo que cubre la vista; al entrar, vuelve a bajar y lo descubre
// de arriba abajo, desde esa misma raya. Solo clip-path y transform: sin coste en reposo. Cuando la salida lleva un elemento
// compartido (miniatura → ficha) la vista se desvanece sin telón y la raya solo la cruza, para no tapar el vuelo.
// ---------------------------------------------------------------------------------------------------------------------
let marco: HTMLElement | null = null
export const registrarPluma = (el: HTMLElement | null) => {
  marco = el
}
const parte = (cual: 'tel' | 'raya') => marco?.querySelector<HTMLElement>(cual === 'tel' ? '.l-tel' : '.l-raya') ?? null

/** Qué dejó la salida: el telón tapando la vista, o solo la raya cruzada. Lo consume la vista que entra. */
let cubierto: 'telon' | 'raya' | null = null
let seq = 0
let saliendo: Promise<void> | null = null

/** Vuelo de un elemento compartido (tarjeta → ficha): se captura el rectángulo de origen y la vista nueva lo recoge al montar. */
let vuelo: { id: string; rect: DOMRect; t: number } | null = null
export function marcarVuelo(el: Element | null, id?: string) {
  vuelo = el ? { id: id ?? el.getAttribute('data-vuelo') ?? '', rect: el.getBoundingClientRect(), t: performance.now() } : null
}

/**
 * Lleva `el` desde el rectángulo `de` hasta su sitio con ESCALA UNIFORME: el elemento se agranda hasta cubrir el rectángulo de
 * origen y un clip-path recorta la diferencia de proporción, que se abre mientras viaja. Así nada se estira.
 */
function desde(el: HTMLElement, de: DOMRect, vars: gsap.TweenVars) {
  const a = el.getBoundingClientRect()
  if (!a.width || !a.height) return
  const sc = Math.max(de.width / a.width, de.height / a.height)
  const sobraX = Math.max(0, a.width - de.width / sc)
  const sobraY = Math.max(0, a.height - de.height / sc)
  return gsap.fromTo(
    el,
    { x: de.left - a.left, y: de.top - a.top, scale: sc, transformOrigin: '0 0', zIndex: 5, clipPath: `inset(0px ${sobraX}px ${sobraY}px 0px)` },
    { x: 0, y: 0, scale: 1, clipPath: 'inset(0px 0px 0px 0px)', duration: 0.62, ease: 'l-encaje', clearProps: 'transform,zIndex,clipPath', ...vars },
  )
}
function volar(root: HTMLElement) {
  // No se consume al leerlo: React (StrictMode en desarrollo) monta, revierte y vuelve a montar la vista, y la segunda pasada
  // también debe volar. Caduca a los 2,5 s.
  const v = vuelo
  if (!v || !v.id || performance.now() - v.t > 2500) return
  const destino = root.querySelector<HTMLElement>(`[data-vuelo="${v.id}"]`)
  if (destino) desde(destino, v.rect, { delay: 0.04 })
}

export const consumirVuelo = volar

/** Vuelo de regreso: el elemento viaja hasta el rectángulo de su destino (la tarjeta de la que salió), a escala uniforme. */
export function volverA(el: HTMLElement, destino: Element, vars: gsap.TweenVars = {}) {
  const a = el.getBoundingClientRect()
  const b = destino.getBoundingClientRect()
  const sc = Math.max(b.width / a.width, b.height / a.height)
  return gsap.to(el, {
    x: b.left - a.left,
    y: b.top - a.top,
    scale: sc,
    transformOrigin: '0 0',
    clipPath: `inset(0px ${Math.max(0, a.width - b.width / sc)}px ${Math.max(0, a.height - b.height / sc)}px 0px)`,
    duration: 0.42,
    ease: 'l-encaje',
    ...vars,
  })
}

function salida(compartido: boolean): Promise<void> {
  const vista = document.getElementById('l-vista')
  const tel = parte('tel')
  const raya = parte('raya')
  if (!marco || !vista || !tel || !raya) return Promise.resolve()
  return new Promise((resolve) => {
    try {
      gsap.killTweensOf([tel, raya, marco])
      const cab = document.querySelector('.l-hdr')
      marco!.style.top = `${Math.max(0, Math.round(cab?.getBoundingClientRect().bottom ?? 0))}px`
      marco!.style.visibility = 'visible'
      const alto = marco!.getBoundingClientRect().height
      const fin = () => {
        // Red de seguridad: si la vista nueva no llega a recoger el telón, se descubre sola.
        window.setTimeout(() => desvelar(), 1800)
        resolve()
      }
      const tl = gsap.timeline({ onComplete: fin })
      if (compartido) {
        cubierto = 'raya'
        gsap.set(tel, { clipPath: 'inset(100% 0 0 0)' })
        gsap.set(raya, { transformOrigin: '0 50%', scaleX: 0, y: 0, opacity: 1 })
        tl.to(raya, { scaleX: 1, duration: 0.17, ease: 'power3.out' }, 0)
        tl.to(vista, { opacity: 0, y: -8, duration: 0.15, ease: 'power2.out' }, 0)
      } else {
        cubierto = 'telon'
        gsap.set(tel, { clipPath: 'inset(0 0 100% 0)' })
        gsap.set(raya, { transformOrigin: '50% 50%', scaleX: 1, y: 0, opacity: 1 })
        tl.to(tel, { clipPath: 'inset(0 0 0% 0)', duration: 0.24, ease: 'l-encaje' }, 0)
        tl.to(raya, { y: alto - 2, duration: 0.24, ease: 'l-encaje' }, 0)
      }
    } catch {
      cubierto = null
      resolve()
    }
  })
}

/**
 * Empieza a sacar la vista actual; resuelve `true` cuando se puede navegar. Varios clics seguidos comparten la misma salida y
 * solo el último resuelve `true`: el último clic gana.
 */
export function salir(origen?: Element | null, idVuelo?: string): Promise<boolean> {
  const n = ++seq
  marcarVuelo(origen ?? null, idVuelo)
  if (!saliendo) {
    const p = salida(!!origen)
    saliendo = p
    void p.then(() => {
      if (saliendo === p) saliendo = null
    })
  }
  return saliendo.then(() => n === seq)
}

/** La salida con vuelo deja el contenedor de vistas a opacidad 0: al montar la vista nueva se recupera, antes del primer pintado. */
export function recuperarVista() {
  const vista = document.getElementById('l-vista')
  if (vista) gsap.set(vista, { clearProps: 'opacity,transform' })
}

/** La vista que entra descubre lo que dejó la salida: el telón se abre de arriba abajo con la raya, o la raya se retira. */
function desvelar() {
  const modo = cubierto
  const tel = parte('tel')
  const raya = parte('raya')
  if (!modo || !marco || !tel || !raya) return
  const limpiar = () => {
    cubierto = null
    marco!.style.visibility = 'hidden'
    gsap.set([tel, raya], { clearProps: 'all' })
  }
  if (modo === 'telon') {
    const alto = marco.getBoundingClientRect().height
    gsap.set(raya, { y: 0, scaleX: 1, opacity: 1 })
    gsap.to(tel, { clipPath: 'inset(100% 0 0 0)', duration: 0.55, ease: 'l-encaje', onComplete: limpiar })
    gsap.to(raya, { y: alto - 2, duration: 0.55, ease: 'l-encaje' })
  } else {
    gsap.set(raya, { transformOrigin: '100% 50%' })
    gsap.to(raya, { scaleX: 0, duration: 0.5, ease: 'power3.out', delay: 0.05, onComplete: limpiar })
  }
}

/**
 * Coreografía de entrada de una vista: telón o raya de la salida, titular por palabras, filetes, vuelo del elemento compartido
 * y revelados. Total ≤ 1,2 s hasta que lo visible está en su sitio. `alMostrar` avisa cuando la cascada inicial terminó.
 */
export function entrada(root: HTMLElement, alMostrar?: () => void): () => void {
  desvelar()
  titular(root)
  reglas(root)
  volar(root)
  return revelar(root, 0.25, alMostrar)
}

/** Escalonado de un conjunto de elementos que aparecen de golpe (por ejemplo, las filas de un panel que se abre). */
export function cascada(els: ArrayLike<Element> | Element | null, vars: gsap.TweenVars = {}) {
  if (!els) return
  gsap.fromTo(els, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'l-encaje', stagger: 0.04, clearProps: 'opacity,transform', ...vars })
}
