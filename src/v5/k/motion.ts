import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

// Motor de la dirección K: GSAP (coreografía) con el plugin registrado aquí, solo en esta dirección.
// Gramática «revelar capas»: todo se descubre con un corte (clip-path) de arriba abajo o de izquierda a derecha; nada
// aparece por fundido. Solo transform, opacity y clip-path. Sin lazos perpetuos: el ticker de GSAP duerme cuando no hay
// una animación en curso (se mide con la sonda de rAF en reposo) y los revelados con scroll usan un IntersectionObserver.
gsap.registerPlugin(CustomEase)
// El ticker de GSAP late mientras haya algo animándose y, por defecto, 120 fotogramas más antes de dormir. Con 6 duerme casi
// al instante: página quieta = cero rAF (idle-frame-budget Z-1). Despierta solo al crearse la siguiente animación.
gsap.config({ autoSleep: 6 })
/** Curva de los CONTENIDOS (entrar siempre con ease-out). La línea de escaneo NO la usa: tiene que viajar a velocidad casi constante para verse. */
CustomEase.create('k-out', '0.16,1,0.3,1')

export { gsap }

/** Barrido de página (EX-7): la línea se lleva la vista vieja (salida) y deja caer la nueva (entrada). */
export const BARRIDO = {
  salida: { duration: 0.32, ease: 'power1.inOut' },
  entrada: { duration: 0.55, ease: 'power2.out' },
} as const
/** La línea de escaneo que baja sola (entrada del inicio, de la ficha): casi constante, con arranque y llegada suaves. */
export const EASE_LINEA = 'power1.inOut'

// Gancho de sondas (solo en desarrollo): si el script de pruebas define window.__kPausa antes de cargar, el reloj de GSAP
// queda congelado y window.__kAvanzar(ms) lo mueve a mano, para capturar fotogramas exactos aunque la máquina vaya lenta.
// En producción esta rama no existe (import.meta.env.DEV es false y se elimina del bundle).
if (import.meta.env.DEV && typeof window !== 'undefined' && (window as unknown as { __kPausa?: boolean }).__kPausa) {
  gsap.globalTimeline.pause()
  // Avanza en pasos de 16 ms (como los fotogramas reales) para que lo creado a mitad de camino empiece en su momento.
  ;(window as unknown as Record<string, unknown>).__kAvanzar = (ms: number) => {
    for (let resto = ms; resto > 0; resto -= 16) gsap.globalTimeline.time(gsap.globalTimeline.time() + Math.min(resto, 16) / 1000, false)
  }
}

/** Escena GSAP ligada a un nodo: todo lo creado dentro se revierte al desmontar (sin fugas al navegar). */
export function useEscena(scope: RefObject<HTMLElement | null>, fn: () => void | (() => void), deps: unknown[] = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context(fn, scope.current ?? undefined)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Cortes de la dirección: lo que es un bloque baja descubierto de arriba a abajo; lo que es una etiqueta, de izquierda a derecha. */
export const CORTE = {
  bloque: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' },
  etiqueta: { from: 'inset(0 100% 0 0)', to: 'inset(0% 0 0 0)' },
} as const

/** Revelado con scroll SOLO de elementos internos que están bajo el pliegue; los que ya se ven no se tocan
 *  (nunca queda una sección entera oculta) y, si el JS no corre, nada llegó a esconderse. Corte, no fundido. */
export function revelar(scope: Element, selector: string, opts: { stagger?: number } = {}): () => void {
  const todos = gsap.utils.toArray<HTMLElement>(selector, scope)
  const fuera = todos.filter((e) => e.getBoundingClientRect().top > window.innerHeight * 0.94)
  if (!fuera.length) return () => {}
  gsap.set(fuera, { clipPath: CORTE.bloque.from })
  const io = new IntersectionObserver(
    (entradas) => {
      const ver = entradas.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
      if (!ver.length) return
      for (const v of ver) io.unobserve(v)
      gsap.to(ver, { clipPath: CORTE.bloque.to, duration: 0.6, ease: 'power2.out', stagger: opts.stagger ?? 0.06, clearProps: 'clipPath' })
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  for (const e of fuera) io.observe(e)
  return () => {
    io.disconnect()
    gsap.set(fuera, { clearProps: 'clipPath' })
  }
}

/** Las filas del inspector se descubren cuando la línea cruza su sección (la tabla se lee al paso de la línea). `resto()`
 *  muestra las que la línea no alcanzó; se llama al terminar la coreografía, para que ninguna fila quede escondida. */
export function filasAlPaso(scope: Element, alTrazar: (f: ((i: number) => void) | null) => void) {
  const filas = gsap.utils.toArray<HTMLElement>('.k-insp tbody tr', scope)
  const vistas = new Set<number>()
  const mostrar = (ii: number | number[]) => {
    const lista = (Array.isArray(ii) ? ii : [ii]).filter((i) => filas[i] && !vistas.has(i))
    for (const i of lista) vistas.add(i)
    if (lista.length) gsap.to(lista.map((i) => filas[i]), { clipPath: CORTE.etiqueta.to, duration: 0.3, ease: 'power2.out', stagger: 0.025, clearProps: 'clipPath' })
  }
  gsap.set(filas, { clipPath: CORTE.etiqueta.from })
  alTrazar((i) => mostrar(i))
  return {
    resto: () => {
      alTrazar(null)
      mostrar(filas.map((_, i) => i))
    },
    limpiar: () => {
      alTrazar(null)
      gsap.set(filas, { clearProps: 'clipPath' })
    },
  }
}

// ---------------------------------------------------------------- vuelo tarjeta → ficha (EX-8)
// El elemento compartido es el MISMO medio: la tarjeta del índice muestra el recorte superior de la captura de la placa,
// y la ficha abre esa misma captura en su ventana. El clon se coloca ya en el rectángulo de destino y viaja con una escala
// uniforme (sin estirar nunca) más un clip-path que lo recorta al tamaño de la tarjeta al empezar. Debajo, el marco de la
// placa se descubre con un corte descendente: la línea de la dirección hace de cortina.
interface Origen { slug: string; rect: DOMRect; mini: string; src: string; at: number }
let origen: Origen | null = null
/** Guarda el marco de la tarjeta antes de navegar. `mini` ya está en caché (es la imagen de la tarjeta); `src` es la captura entera. */
export function marcarOrigen(slug: string, marco: HTMLElement, mini: string, src: string) {
  origen = { slug, rect: marco.getBoundingClientRect(), mini, src, at: Date.now() }
}
/** Lee el origen sin consumirlo: en desarrollo StrictMode monta dos veces y la segunda tiene que verlo también.
 *  Se borra cuando el vuelo termina o caduca (5 s). */
export function tomarOrigen(slug: string): Origen | null {
  return origen && origen.slug === slug && Date.now() - origen.at < 5000 ? origen : null
}
/** Precarga la captura entera de una placa (al pasar o enfocar la tarjeta), para que el clon la tenga al despegar. */
export function precargar(src: string) {
  const i = new Image()
  i.decoding = 'async'
  i.src = src
}
export function volar(o: Origen, ventana: HTMLElement, marco: HTMLElement): () => void {
  const d = ventana.getBoundingClientRect()
  const s = Math.max(o.rect.width / d.width, o.rect.height / d.height)
  const clon = document.createElement('div')
  clon.className = 'k-vuelo'
  clon.setAttribute('aria-hidden', 'true')
  Object.assign(clon.style, { left: `${d.left}px`, top: `${d.top}px`, width: `${d.width}px`, height: `${d.height}px`, backgroundImage: `url(${o.mini})` })
  const img = document.createElement('img')
  img.src = o.src
  img.alt = ''
  clon.appendChild(img)
  ;(document.querySelector('.v5-k') ?? document.body).appendChild(clon)
  marco.style.clipPath = CORTE.bloque.from
  // La ventana de la placa espera al clon (misma imagen, mismo sitio): así no se ve la captura dos veces mientras el clon aterriza.
  ventana.style.visibility = 'hidden'
  // El clon se anima con un escalar (0 → 1) y escribe transform y clip-path a mano: así no depende de cómo el navegador
  // normaliza «inset(...)» al leerlo (lo colapsa a 3 valores y GSAP emparejaba mal los números).
  const dx = o.rect.left - d.left
  const dy = o.rect.top - d.top
  const der = d.width - o.rect.width / s
  const aba = d.height - o.rect.height / s
  const pinta = (v: number) => {
    const k = 1 - v
    clon.style.transform = `translate3d(${k * dx}px,${k * dy}px,0) scale(${s + (1 - s) * v})`
    clon.style.clipPath = `inset(0px ${k * der}px ${k * aba}px 0px)`
  }
  pinta(0)
  const p = { v: 0 }
  const tl = gsap.timeline({
    onComplete: () => {
      ventana.style.visibility = ''
      clon.remove()
      if (origen === o) origen = null
    },
  })
  tl.to(p, { v: 1, duration: 0.7, ease: 'power3.inOut', onUpdate: () => pinta(p.v) }, 0)
  const q = { v: 0 }
  tl.to(q, { v: 1, duration: 0.45, ease: 'power2.out', onUpdate: () => { marco.style.clipPath = `inset(0 0 ${(1 - q.v) * 100}% 0)` }, onComplete: () => { marco.style.clipPath = '' } }, 0.3)
  return () => {
    tl.kill()
    clon.remove()
    ventana.style.visibility = ''
    marco.style.clipPath = ''
  }
}
