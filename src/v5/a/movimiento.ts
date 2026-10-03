import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'
import { marcarImpreso, yaImpreso } from './imprimir'
import { useSitio, type Sitio } from './sitio'

// Todo el movimiento de El Libro sale de un oficio, el de imprenta: se IMPRIME (opacidad + 4 a 6 px, escalonado),
// se CORTA (clip-path: la altura cambia en el acto y el contenido entra recortado) y se ENTINTA (una banda de tinta
// que cae desde arriba, la misma inversión de la fila a cualquier escala). Solo transform, opacity y clip-path; nada
// corre en reposo: GSAP duerme su ticker cuando no hay tweens y nada pide fotogramas por su cuenta. ScrollTrigger NO se usa:
// mantiene un lazo de requestAnimationFrame perpetuo (su `_rafBugFix`) y la sonda de reposo lo cuenta (130 fotogramas en 2 s).
// Los revelados al llegar con el scroll los decide un IntersectionObserver y los mueve GSAP.
// Estado final visible si el JS falla: ningún CSS esconde nada; lo oculto lo escribe GSAP al montar, y cada tween
// limpia lo suyo al terminar (clearProps).
gsap.registerPlugin(Flip, CustomEase)
/** El corte del libro: salida rápida y asentamiento largo, la misma curva de la mecánica (cubic-bezier .2, 0, 0, 1). */
export const CORTE = 'a-corte'
CustomEase.create(CORTE, '.2,0,0,1')

export { gsap, Flip }
export type Estado = ReturnType<typeof Flip.getState>

// ── Elemento compartido: el nombre y la banda de tinta viajan entre la fila y la ficha, en los DOS sentidos ───────────
// FLIP a mano, con rectángulos del viewport: Flip.from mide en coordenadas de DOCUMENTO y, como la vista nueva nace con el
// scroll en otro sitio, haría volar la banda desde muy por debajo de la pantalla. Aquí el vuelo parte de donde se VIO.
type Vuelo = { nombre: DOMRect; tinta: DOMRect }
let guardado: { v: Vuelo; ruta: string; t: number } | null = null
/** Fotografía el nombre y la tinta de `origen` (una fila abierta o la cabecera de una ficha) para la vista de `ruta`. */
export function guardarCompartido(origen: Element, ruta: string) {
  const nombre = origen.querySelector('[data-flip-id="a-nombre"]')
  const tinta = origen.querySelector('[data-flip-id="a-tinta"]')
  if (nombre && tinta) guardado = { v: { nombre: nombre.getBoundingClientRect(), tinta: tinta.getBoundingClientRect() }, ruta, t: performance.now() }
}
/** El vuelo solo vale para la ruta a la que se navegó, durante un segundo y medio (sin consumirlo: StrictMode monta dos veces). */
const leerCompartido = (ruta: string) => (guardado && guardado.ruta === ruta && performance.now() - guardado.t < 1500 ? guardado.v : null)

function vuelo(el: Element, de: DOMRect, uniforme: boolean) {
  const a = el.getBoundingClientRect()
  const sx = de.width / a.width
  // set + to (y no fromTo): el estado de partida se escribe ya, antes de pintar, sin esperar al siguiente fotograma de GSAP.
  gsap.set(el, { x: de.left - a.left, y: de.top - a.top, scaleX: sx, scaleY: uniforme ? sx : de.height / a.height, transformOrigin: '0 0' })
  gsap.to(el, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.62, ease: CORTE, clearProps: 'transform' })
}

// ── Filas y páginas: lo que ya está a la vista entra con la entrada; lo demás, al llegar con el scroll ───────────────
/** Está en pantalla (o a punto): ni por encima del pliegue ya recorrido ni por debajo del 97 % del alto. Lo que no ocupa lugar
 *  (display: none en este ancho) entra con la entrada: nunca queda esperando un scroll que no va a llegar. */
const visto = (el: Element) => {
  const r = el.getBoundingClientRect()
  return (!r.width && !r.height) || (r.bottom > 0 && r.top < innerHeight * 0.97)
}
const NOMBRE = 'inset(-0.2em 100% -0.3em 0)' // el nombre aún sin imprimir: recortado de derecha a izquierda
const NOMBRE_FIN = 'inset(-0.2em 0% -0.3em 0)'
const esFila = (e: Element) => e.classList.contains('a-item')
const esAnio = (e: Element) => e.classList.contains('a-anio')

/** Se imprime al llegar al scroll, una vez, y cada pieza a su manera (nada de un fade-up genérico): la fila imprime su nombre de
 *  izquierda a derecha y traza su filete, el año se imprime con su titular y el bloque se CORTA hacia dentro de arriba abajo.
 *  Estado inicial escrito por JS (nunca por CSS) y limpiado al terminar. Un IntersectionObserver (sin lazo de fotogramas)
 *  avisa y GSAP mueve el lote con su escalón. */
function alEntrar(els: HTMLElement[], observadores: IntersectionObserver[]) {
  if (!els.length) return
  const nombre = (e: HTMLElement) => (esFila(e) ? e.querySelector('.a-nom-txt') : esAnio(e) ? e.querySelector('b') : null)
  const regla = (e: HTMLElement) => (esFila(e) ? e.querySelector('.a-regla') : null)
  const bloque = (e: HTMLElement) => !esFila(e) && !esAnio(e)
  const poner = (t: Element[], vars: gsap.TweenVars) => t.length && gsap.set(t, vars) // GSAP avisa por consola si se le da una lista vacía
  poner(els, { opacity: 0 })
  poner(els.filter(bloque), { clipPath: 'inset(0% 0% 100% 0%)' })
  poner(els.map(nombre).filter((n): n is Element => !!n), { clipPath: NOMBRE })
  poner(els.map(regla).filter((r): r is Element => !!r), { scaleX: 0, transformOrigin: '0% 50%' })
  const io = new IntersectionObserver(
    (entradas) => {
      const lote = entradas.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
      lote.forEach((e, i) => {
        io.unobserve(e)
        const delay = i * 0.04
        gsap.to(e, { opacity: 1, duration: 0.24, delay, ease: 'none', overwrite: 'auto', clearProps: 'opacity' })
        if (bloque(e)) gsap.to(e, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, delay, ease: CORTE, overwrite: 'auto', clearProps: 'clipPath' })
        const n = nombre(e)
        if (n) gsap.to(n, { clipPath: NOMBRE_FIN, duration: 0.4, delay, ease: 'power2.out', overwrite: 'auto', clearProps: 'clipPath' })
        const r = regla(e)
        if (r) gsap.to(r, { scaleX: 1, duration: 0.32, delay, ease: CORTE, overwrite: 'auto', clearProps: 'transform' })
      })
    },
    { rootMargin: '0px 0px -3% 0px' },
  )
  els.forEach((e) => io.observe(e))
  observadores.push(io)
}

/** Un `from` que sí se pinta ya: GSAP no aplica el estado inicial de un from() colocado más adelante en la línea de tiempo hasta
 *  que le toca, y el contenido se vería entero y parpadearía. Aquí el estado inicial se escribe ahora (antes de pintar) y el
 *  movimiento llega después; `clearProps` deja el CSS mandando al terminar. */
function desde(tl: gsap.core.Timeline, els: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number) {
  gsap.set(els, from)
  const limpiar = [...new Set(Object.keys(from).map((k) => (['y', 'scaleX', 'scaleY', 'transformOrigin'].includes(k) ? 'transform' : k)))].join(',')
  return tl.to(els, { ...to, clearProps: limpiar }, at)
}

/** La cabeza de impresión: la línea se descubre de izquierda a derecha y una barra de tinta la lidera; al llegar al final se va.
 *  La barra mide el ancho de la línea (CSS) y viaja en xPercent: no depende de medir antes de que llegue la fuente. */
function carro(tl: gsap.core.Timeline, linea: HTMLElement, at: number, dur: number) {
  const txt = linea.querySelector('.a-linea-txt')
  const cab = linea.querySelector('.a-cabeza')
  if (!txt || !cab) return
  desde(tl, txt, { clipPath: NOMBRE }, { clipPath: NOMBRE_FIN, duration: dur, ease: 'power2.out' }, at)
  gsap.set(cab, { xPercent: -100, opacity: 1 })
  tl.to(cab, { xPercent: 0, duration: dur, ease: 'power2.out' }, at)
  tl.to(cab, { opacity: 0, duration: 0.1, ease: 'none', clearProps: 'opacity,transform' }, at + dur)
}

/** Coreografía de entrada de una vista (primera carga o cambio de página), leída del marcado: `data-a` = linea | tinta | entra.
 *  Con `sitio` (Atrás o «← Libro») la vista vuelve tal como se dejó, en su posición y con sus filas abiertas, sin imprimirse otra vez;
 *  solo el vuelo de regreso (si lo hay) se anima. */
export function entrada(raiz: HTMLElement, compartido: Vuelo | null, sitio: Sitio | null) {
  // El destino se mide con el scroll en su sitio (arriba, o donde se dejó); `instant` porque la hoja global declara smooth.
  window.scrollTo({ top: sitio?.y ?? 0, behavior: 'instant' })
  if (sitio && !compartido) return
  const primera = !yaImpreso() // se marca al terminar: StrictMode monta dos veces y la primera se revierte
  const k = primera ? 1 : 0.6 // la 1.ª vez de la sesión se imprime entera; después, más corto
  const todos = (s: string) => Array.from(raiz.querySelectorAll<HTMLElement>(s))
  const tl = gsap.timeline({ defaults: { ease: CORTE } })
  const observadores: IntersectionObserver[] = []

  const tinta = raiz.querySelector('[data-a="tinta"]')
  if (tinta && !compartido) desde(tl, tinta, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.2, ease: 'none' }, 0)

  const lineas = compartido ? [] : todos('[data-a="linea"]')
  lineas.forEach((l, i) => carro(tl, l, i * 0.1 * k + (tinta ? 0.08 : 0), 0.7 * k))

  // Lo que cuelga del nombre se imprime en orden de lectura, mientras la cabeza termina la segunda línea.
  const t = (lineas.length ? 0.26 : compartido ? 0.2 : 0.02) * (compartido ? 1 : k)
  const entra = todos('[data-a="entra"]')
  const aqui = entra.filter(visto)
  if (aqui.length) desde(tl, aqui, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.42, stagger: 0.06 * k }, t)

  // El libro: las filas visibles se imprimen de arriba abajo (escalón de 14 ms) y su filete se traza de izquierda a derecha;
  // el título de cada año entra con su grupo (ninguna etiqueta flota sola sobre la página en blanco).
  // La fila a la que regresa el vuelo (la que estaba abierta al salir) no se oculta: ahí vuela el nombre.
  const vuela = compartido ? raiz.querySelector<HTMLElement>('.a-item[data-abierta]') : null
  const filas = todos('.a-item').filter((f) => f !== vuela)
  const anios = todos('.a-anio')
  const f0 = t + 0.24 * k
  const filasAqui = filas.filter(visto).slice(0, 14)
  const aniosAqui = anios.filter(visto)
  if (filasAqui.length) {
    desde(tl, filasAqui, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.18, stagger: 0.014 * k }, f0)
    desde(tl, filasAqui.map((r) => r.querySelector('.a-regla')), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.3, stagger: 0.014 * k }, f0)
  }
  if (aniosAqui.length) {
    desde(tl, aniosAqui, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.05 * k }, f0 - 0.05)
    desde(tl, aniosAqui.map((a) => a.querySelector('b')), { clipPath: NOMBRE }, { clipPath: NOMBRE_FIN, duration: 0.35, ease: 'power2.out', stagger: 0.05 * k }, f0 - 0.05)
  }
  alEntrar([...entra.filter((e) => !aqui.includes(e)), ...anios.filter((a) => !aniosAqui.includes(a)), ...filas.filter((f) => !filasAqui.includes(f))], observadores)

  // La fila de firma del inicio nace abierta (sin salto de layout): su tinta cae justo después de imprimirse, como si se abriera sola.
  const firma = !compartido ? raiz.querySelector<HTMLElement>('.a-item[data-abierta]') : null
  if (firma) {
    const abre = aperturaDeFila(firma)
    abre.timeScale(1.2 / k)
    gsap.set(firma, { color: 'var(--v5-ink)' }) // hasta que cae la tinta, el texto sigue siendo tinta sobre papel
    tl.add(abre, f0 + 0.12 * k).set(firma, { clearProps: 'color' }, f0 + 0.12 * k)
  }

  if (compartido) {
    const nombre = raiz.querySelector('[data-flip-id="a-nombre"]')
    const banda = raiz.querySelector('[data-flip-id="a-tinta"]')
    if (nombre) vuelo(nombre, compartido.nombre, true)
    if (banda) vuelo(banda, compartido.tinta, false)
    if (vuela) desde(tl, vuela.querySelectorAll('.a-tira, .a-enlaces, .a-panel-der'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.06 }, 0.3) // en móvil .a-panel-izq es display: contents: se animan sus hijos
  }
  tl.eventCallback('onComplete', marcarImpreso)
  return () => observadores.forEach((o) => o.disconnect())
}

/** Entrada de la vista que cuelga de `raiz`: se arma antes de pintar, se revierte al desmontar y, si algo falla, deja todo visible. */
export function useEntrada(raiz: RefObject<HTMLElement | null>) {
  const sitio = useSitio()
  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const ctx = gsap.context(() => {
      try {
        return entrada(el, leerCompartido(location.pathname), sitio) // la función que devuelve se ejecuta al revertir: suelta los observadores
      } catch (e) {
        console.error('v5/a movimiento:', e) // fail-open: se avisa y todo queda en su estado final visible
        gsap.set(el.querySelectorAll('*'), { clearProps: 'opacity,transform,clipPath,visibility,color' })
      }
    }, el)
    return () => ctx.revert()
  }, [raiz, sitio])
}

// ── Filas que se abren: la altura cambia en el acto; lo de abajo se acomoda con Flip (transform), el contenido se corta ─
/** Fotografía del flujo antes de un cambio de layout (fila que se abre o se cierra, filtro): todo lo marcado `data-a-flip`. */
export const fotoDelFlujo = () => Flip.getState('[data-a-flip]')

/** Tras el cambio de layout, lo que se movió se desliza desde donde estaba (solo transform); lo que entra se imprime. */
export function reflujo(estado: Estado) {
  Flip.from(estado, {
    targets: '[data-a-flip]', // se vuelve a consultar: lo que llegó con el cambio entra por onEnter
    duration: 0.3,
    ease: CORTE,
    prune: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.014, ease: CORTE, clearProps: 'opacity,transform' }),
  })
}

/** Lleva la fila recién abierta a la vista, justo bajo lo que queda pegado arriba (cabecera, filtros y el título del año).
 *  Solo si quedó en la mitad de abajo o tapada; con teclado, sin animar. */
export function traerAVista(li: HTMLElement, conTeclado: boolean) {
  requestAnimationFrame(() => {
    const pegado = parseFloat(getComputedStyle(li.closest('main') ?? document.body).getPropertyValue('--a-at')) || 56
    const tope = pegado + 42 // pegada al título del año, sin hueco (por el hueco asoma el final de la fila anterior)
    const r = li.getBoundingClientRect()
    if (r.top > innerHeight * 0.45 || r.top < tope) scrollBy({ top: r.top - tope, behavior: conTeclado ? 'instant' : 'smooth' })
  })
}

/** Apertura de una fila: la tinta cae (90 a 120 ms, lineal), el panel se descubre de arriba abajo y las hojas se despliegan como un pliego. */
export function aperturaDeFila(li: HTMLElement) {
  const q = (s: string) => li.querySelectorAll(s)
  const tl = gsap.timeline({ defaults: { ease: CORTE } })
  desde(tl, q('.a-tinta'), { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.12, ease: 'none' }, 0)
  desde(tl, q('.a-panel'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.3 }, 0.05)
  desde(tl, q('.a-hoja'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.34, stagger: 0.07 }, 0.12)
  desde(tl, q('.a-datos > div'), { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.22, stagger: 0.035 }, 0.14)
  desde(tl, q('.a-barra-eje > span'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.4 }, 0.1)
  return tl
}

/** Cierre: el panel se recorta de abajo arriba y la tinta se recoge hacia la fila (lineal, 140 ms); después se desmonta. */
export function cierreDeFila(li: HTMLElement, alTerminar: () => void) {
  return gsap
    .timeline({ defaults: { ease: 'none' }, onComplete: alTerminar })
    .to(li.querySelector('.a-panel'), { clipPath: 'inset(0 0 100% 0)', duration: 0.14 }, 0)
    .to(li.querySelector('.a-tinta'), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.14 }, 0)
}
