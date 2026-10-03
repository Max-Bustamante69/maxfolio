// Motor de movimiento de la dirección: GSAP (coreografía), curvas de la casa y las ayudas pequeñas.
// Reglas: la coreografía anima transform, opacity y clip-path (los micro-gestos de CSS añaden solo grid-template-rows en la FAQ,
// background-size en el subrayado, color, box-shadow en el pulso del punto y la propiedad scale) · todo dentro de un gsap.context
// que se revierte al desmontar · cero requestAnimationFrame con la página quieta (el ticker de GSAP duerme a los 30 cuadros sin animar).
// prefers-reduced-motion NO se implementa: decisión vigente de la casa (ui-foundations §8.10, Max 2026-09-26).
import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
gsap.config({ autoSleep: 30, nullTargetWarn: false })

/** Las cuatro curvas de la dirección (tokens.css --e-*): asentarse es el defecto; la cubierta y la cortina son los dos gestos con disco y placa. */
export const EASE = {
  out: CustomEase.create('dd-out', '0.16,1,0.3,1'),
  puntual: CustomEase.create('dd-puntual', '0.23,1,0.32,1'),
  cubierta: CustomEase.create('dd-cubierta', '0.7,0,0.2,1'),
  cortina: CustomEase.create('dd-cortina', '0.77,0,0.175,1'),
}

/** Duraciones en segundos (tokens.css --d-*). */
export const D = { react: 0.12, fast: 0.18, base: 0.28, reveal: 0.64, bloom: 0.34, contract: 0.38, count: 1.2, stagger: 0.09, fila: 0.04 }

/** Cuánto sube una línea de título dentro de su máscara: 125 % (con 105 % asomaba la cabeza de los glifos). */
export const DESDE = 125

/** gsap.context ligado al ciclo de vida: crea animaciones con `fn` y las revierte (y las mata) al desmontar. */
export function useContexto(fn: (ctx: gsap.Context) => void | (() => void), scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context(fn, scope.current ?? undefined)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Media query que se actualiza sola (girar una tableta monta o suelta el 3D). */
export function useMedia(consulta: string) {
  const [coincide, setCoincide] = useState(() => matchMedia(consulta).matches)
  useEffect(() => {
    const m = matchMedia(consulta)
    const f = () => setCoincide(m.matches)
    m.addEventListener('change', f)
    f()
    return () => m.removeEventListener('change', f)
  }, [consulta])
  return coincide
}

/** Primer instante (s) en que una curva que sube de 0 a 1 en `dur` segundos alcanza `meta` (0..1): bisección sobre la curva. */
export function instanteEn(curva: (t: number) => number, dur: number, meta: number) {
  if (meta <= 0) return 0
  if (meta >= 1) return dur
  let lo = 0
  let hi = 1
  for (let k = 0; k < 24; k++) {
    const m = (lo + hi) / 2
    if (curva(m) < meta) lo = m
    else hi = m
  }
  return hi * dur
}

/** Distancia del punto (x, y) a la esquina más lejana de la barra superior (ancho de la ventana × alto `h`): lo que el disco debe alcanzar para cubrirla. */
export const distanciaALaBarra = (x: number, y: number, h: number) => Math.hypot(Math.max(x, innerWidth - x), Math.max(y, Math.abs(h - y)))

/** Ya en el primer pliegue: se anima con la entrada de la página, no con el scroll (un revelado que arranca sobre el pliegue nunca dispararía). */
export const enPrimerPliegue = (el: Element) => el.getBoundingClientRect().top < innerHeight * 0.92

/** Las filas (índice, cargos, pasos, preguntas, años) entran con la gramática del punto: el filete se dibuja de izquierda a derecha
 *  y su contenido baja descubierto por una cortina. Todo lo demás sube 22 px y aparece. */
const esFila = (el: Element) => (el as HTMLElement).dataset.in === 'fila'
const hijos = (filas: Element[]) => filas.flatMap((f) => [...f.children])

/** Estado de partida de lo que va a entrar: lo escribe JS, así que si JS no corre nada quedó oculto. */
export function ocultarParaEntrar(els: Element[]) {
  const filas = els.filter(esFila)
  gsap.set(els.filter((e) => !esFila(e)), { opacity: 0, y: 22 })
  gsap.set(filas, { clipPath: 'inset(0 100% 0 0)' })
  gsap.set(hijos(filas), { clipPath: 'inset(0 0 100% 0)' })
}

/** Línea de tiempo que lleva a su sitio lo oculto con `ocultarParaEntrar`; `escalon` separa a cada elemento del siguiente. */
export function aparecer(els: Element[], escalon = 0.06) {
  const tl = gsap.timeline()
  const filas = els.filter(esFila)
  const resto = els.filter((e) => !esFila(e))
  if (resto.length) tl.to(resto, { opacity: 1, y: 0, duration: D.reveal, ease: EASE.out, stagger: escalon, clearProps: 'transform,opacity' }, 0)
  if (filas.length) {
    tl.to(filas, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: EASE.out, stagger: D.fila, clearProps: 'clipPath' }, 0)
    tl.to(hijos(filas), { clipPath: 'inset(0 0 0% 0)', duration: D.reveal, ease: EASE.out, stagger: D.fila / 2, clearProps: 'clipPath' }, 0.12)
  }
  return tl
}

/** Revela cada elemento la primera vez que entra a la vista (IntersectionObserver: no deja ningún lazo vivo). Los que entran
 *  juntos se escalonan 40 ms. Las animaciones nacen dentro del contexto, así que se revierten con la página. */
export function revelarAlEntrar(els: Element[], ctx: gsap.Context) {
  if (!els.length) return () => undefined
  const io = new IntersectionObserver(
    (entradas) => {
      const nuevos = entradas.filter((e) => e.isIntersecting).map((e) => e.target)
      nuevos.forEach((t) => io.unobserve(t))
      if (nuevos.length) ctx.add(() => void aparecer(nuevos, D.fila))
    },
    { rootMargin: '0px 0px -8% 0px' },
  )
  els.forEach((el) => io.observe(el))
  return () => io.disconnect()
}
