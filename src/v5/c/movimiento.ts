import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { Flip } from 'gsap/Flip'

// Movimiento de la Mesa de luz: «inercia y reubicación». Las diapositivas se mueven como piezas sobre una mesa: llegan,
// se asientan y, cuando cambia la disposición, cruzan la mesa hasta su sitio nuevo con la misma curva.
// Todo corre dentro de un gsap.context() que el componente revierte al desmontar; el estado final es el CSS (nada nace oculto).
// Solo transform, opacity y clip-path. Ningún lazo propio: el ticker de GSAP duerme cuando no hay nada animándose.
// ScrollTrigger NO se usa: mantiene un requestAnimationFrame perpetuo (_rafBugFix) que la sonda de reposo cuenta; los revelados usan IntersectionObserver.
gsap.registerPlugin(CustomEase, Flip)

/** La curva de la dirección (reubicación, vuelos y apertura de la mesa): cubic-bezier(.45, .05, .2, 1). */
export const CURVA = CustomEase.create('c-mesa', '.45,.05,.2,1')
const SUAVE = 'power3.out'
const CERRADA = 'inset(0% 100% 0% 0%)'
const ABIERTA = 'inset(0% 0% 0% 0%)'

/** Las diapositivas entran como película que se desliza por la mesa: cada marco se descubre de izquierda a derecha (clip-path) mientras
 *  su captura se asienta desde un 12 % más cerca. Solo clip-path, opacity y transform; al terminar no queda nada inline. */
function pelicula(tl: gsap.core.Timeline, marcos: Element[], at: number | string, escalon: gsap.StaggerVars | number) {
  if (!marcos.length) return
  const imgs = marcos.map((m) => m.querySelector('img')).filter((i): i is HTMLImageElement => !!i)
  tl.fromTo(marcos, { clipPath: CERRADA, opacity: 0.6 }, { clipPath: ABIERTA, opacity: 1, duration: 0.55, ease: CURVA, stagger: escalon, clearProps: 'clipPath,opacity' }, at)
  tl.from(imgs, { scale: 1.12, transformOrigin: '0% 50%', duration: 0.75, ease: SUAVE, stagger: escalon, clearProps: 'transform,transformOrigin' }, at)
}

const enPantalla = (el: Element, margen = 0.95) => {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight * margen
}

/** Entrada del armazón (una vez por carga): la mesa se enciende, las reglas se trazan y la cabecera asienta. */
export function entrarShell(raiz: HTMLElement) {
  const q = gsap.utils.selector(raiz)
  gsap
    .timeline({ defaults: { ease: SUAVE } })
    .from(q('.c-luz'), { opacity: 0, duration: 0.8 }, 0)
    .from(q('.c-regla--x .c-regla__tira'), { scaleX: 0, transformOrigin: '0 50%', duration: 0.7 }, 0)
    .from(q('.c-regla--y .c-regla__tira'), { scaleY: 0, transformOrigin: '50% 0', duration: 0.7 }, 0.05)
    .from(q('.c-regla__marca'), { opacity: 0, duration: 0.4, stagger: 0.04 }, 0.25)
    .from(q('.c-cab__fila > *'), { opacity: 0, y: -6, duration: 0.3, stagger: 0.05, clearProps: 'opacity,transform' }, 0)
}

/** Entrada de una vista (≤ 1,2 s): el calco baja a la mesa, su solapa asoma, las marcas de registro encajan, el lápiz traza el borde de arriba,
 *  el título sube por líneas y las diapositivas se deslizan como película. `primera` retrasa un instante para que la mesa se encienda antes.
 *  Lo que está fuera de pantalla espera su scroll. */
export function entrarVista(raiz: HTMLElement, primera: boolean): () => void {
  gsap.set(raiz, { clearProps: 'opacity,transform' }) // la salida dejó opacidad y desplazamiento; un transform residual rompería los fixed de dentro
  const q = gsap.utils.selector(raiz)
  const t0 = primera ? 0.15 : 0
  const tl = gsap.timeline({ defaults: { ease: SUAVE } })

  const calcos = q('[data-c-calco]')
  // translateY(8 %) con tope: en una hoja larga el 8 % serían cientos de píxeles
  if (calcos.length) tl.from(calcos, { opacity: 0, y: (_, el: HTMLElement) => Math.min(el.offsetHeight * 0.08, 48), duration: 0.28, stagger: 0.06, clearProps: 'opacity,transform' }, t0)
  // La solapa («CALCO 02 · OBRA») se tira de detrás de la hoja; las cuatro marcas de registro encajan en sus esquinas;
  // el lápiz recorre el borde de arriba del calco (la señal de que la vista cambió).
  tl.fromTo(q('.c-tab'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: CURVA, clearProps: 'clipPath' }, t0 + 0.1)
  tl.from(q('.c-reg'), { scale: 1.8, opacity: 0, duration: 0.26, stagger: 0.035, clearProps: 'transform,opacity' }, t0 + 0.12)
  tl.fromTo(q('.c-lapiz'), { scaleX: 0, opacity: 1 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 0.36, ease: CURVA }, t0 + 0.05)
  tl.to(q('.c-lapiz'), { opacity: 0, duration: 0.3, ease: 'power1.out' }, t0 + 0.34)
  // Al cambiar de vista las reglas vuelven a leer la hoja: sus cifras se encienden en cascada (en la primera carga lo hace el armazón).
  if (!primera) tl.fromTo(document.querySelectorAll('.c-regla__marca'), { opacity: 0.15 }, { opacity: 1, duration: 0.3, stagger: 0.03, clearProps: 'opacity' }, t0)

  // Los títulos suben dentro de su máscara (cada .c-linea recorta; el texto sube de abajo). El DOM de React no se toca.
  const lineas = q('[data-c-h1] .c-linea__t')
  if (lineas.length) tl.from(lineas, { yPercent: 112, duration: 0.6, stagger: 0.09, ease: SUAVE }, t0 + 0.1)

  q('[data-c-stag]').forEach((g) => {
    tl.from(g.children, { opacity: 0, y: 10, duration: 0.4, stagger: 0.045, clearProps: 'opacity,transform' }, t0 + 0.22)
  })

  // Las diapositivas de una ficha: las que llegan volando desde la lista no se tocan (el vuelo mide su hueco); las demás se deslizan como película.
  pelicula(tl, q('[data-c-sd]').filter((el) => !fantasmas.some((f) => f.id === el.dataset.vuelo)), t0 + 0.12, 0.09)

  // Las filas ya a la vista se asientan con la entrada; las demás, al llegar con el scroll.
  const filas = q('.c-fila')
  const visibles = filas.filter((f) => enPantalla(f))
  pelicula(tl, visibles.flatMap((f) => [...f.querySelectorAll('.c-marco')]), t0 + 0.25, { amount: 0.3 })
  const quitar = [revelarAlVer(filas.filter((f) => !visibles.includes(f))), revelarAlVer(q('.c-anio'), '.c-cargo, .c-colgante, .c-anio__h')]
  return () => quitar.forEach((f) => f())
}

/** Salida de la vista actual: reacción de ~120 ms, sin esperas codificadas (EX-7). Si la Mesa está abierta (se navega desde ella, p. ej. «Abrir la
 *  ficha») su iris se cierra sobre las capturas que van a volar —o sobre el botón que la abrió— en vez de desaparecer de golpe. */
export function salirVista(el: HTMLElement | null) {
  const tl = gsap.timeline()
  if (el) tl.to(el, { opacity: 0, y: -6, duration: 0.12, ease: 'power1.out', overwrite: true }, 0)
  const marco = document.querySelector<HTMLElement>('[data-marco-mesa]')
  if (marco) {
    const { x, y } = centroVuelo() ?? origenMesa()
    const arriba = marco.getBoundingClientRect().top
    // ease-out: el iris se ve cerrar desde el primer fotograma (≤ 150 ms, EX-7) y se asienta sobre las capturas.
    tl.fromTo(marco, { clipPath: `circle(${radioHasta(x, y)}px at ${x}px ${y - arriba}px)` }, { clipPath: `circle(0px at ${x}px ${y - arriba}px)`, duration: 0.26, ease: 'power3.out' }, 0)
  }
  return tl.then()
}

/** Revela con el scroll SOLO los elementos internos de cada bloque (nunca la sección entera): IntersectionObserver, una vez por bloque.
 *  Lo que ya está a la vista o por encima no se esconde, y sin IntersectionObserver todo queda visible. Devuelve la limpieza. */
export function revelarAlVer(bloques: Element[], hijos = '.c-marco'): () => void {
  if (typeof IntersectionObserver === 'undefined' || !bloques.length) return () => {}
  const por = new Map<Element, Element[]>()
  bloques.forEach((b) => {
    const r = b.getBoundingClientRect()
    if (r.bottom < 0 || r.top < window.innerHeight) return
    const h = [...b.querySelectorAll(hijos)]
    if (!h.length) return
    gsap.set(h, { clipPath: CERRADA, opacity: 0.6 })
    por.set(b, h)
  })
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return
        io.unobserve(e.target)
        const h = por.get(e.target) ?? []
        gsap.to(h, { clipPath: ABIERTA, opacity: 1, duration: 0.55, stagger: 0.07, ease: CURVA, clearProps: 'clipPath,opacity' })
        const imgs = h.map((m) => m.querySelector('img')).filter((i): i is HTMLImageElement => !!i)
        if (imgs.length) gsap.fromTo(imgs, { scale: 1.12, transformOrigin: '0% 50%' }, { scale: 1, duration: 0.75, stagger: 0.07, ease: SUAVE, clearProps: 'transform,transformOrigin' })
      })
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  por.forEach((_, b) => io.observe(b))
  return () => io.disconnect()
}

/* ---- Reubicación de la Lectura: las filas cruzan la hoja hasta su grupo nuevo (FLIP 520 ms, escalón de 6 ms) ---- */
const pendiente: { estado: ReturnType<typeof Flip.getState> | null } = { estado: null }
export const capturarFilas = () => {
  if (document.querySelector('.c-mesa')) return // con la mesa abierta la Lectura queda debajo, inerte: no se anima
  pendiente.estado = Flip.getState('.c-lectura [data-flip-id]')
}
export function reubicarFilas(raiz: HTMLElement) {
  const estado = pendiente.estado
  pendiente.estado = null
  if (!estado) return
  Flip.from(estado, {
    targets: raiz.querySelectorAll('.c-lectura [data-flip-id]'),
    duration: 0.52,
    ease: CURVA,
    stagger: { each: 0.006 },
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: SUAVE, clearProps: 'opacity,transform' }),
  })
  gsap.from(raiz.querySelectorAll('.c-grupo__h'), { opacity: 0, duration: 0.3, stagger: 0.03, ease: SUAVE, clearProps: 'opacity' })
}

/* ---- Vuelo de la captura: de la fila (o de la mesa) a su ficha ---- */
// Se clonan las diapositivas visibles de la obra en una capa fija; al montar la ficha vuelan hasta sus huecos (el destino
// espera oculto) y se retiran. Es el mismo medio en origen y destino (EX-8): LOD 0 que crece hasta el LOD 1/2 ya precargado.
interface Fantasma {
  g: HTMLElement
  id: string
  r: DOMRect
}
let fantasmas: Fantasma[] = []
let limpiador: ReturnType<typeof setTimeout> | undefined

/** `paq`: el paquete de la Mesa de donde sale el vuelo. Con la Mesa abierta el origen es SU paquete: la Lectura sigue en el DOM debajo, inerte,
 *  con las mismas capturas, y de ahí nacían los fantasmas (a 600 px de la diapositiva elegida). */
export function prepararVuelo(slug: string, paq?: string) {
  limpiarVuelo()
  const capa = document.querySelector<HTMLElement>('.v5-c')
  if (!capa) return
  const mesa = document.querySelector('.c-mesa:not(.c-mesa--carga)')
  const origenes = mesa ? mesa.querySelectorAll<HTMLElement>(`[data-paq="${paq ?? `${slug}~0`}"] [data-vuelo]`) : document.querySelectorAll<HTMLElement>(`[data-vuelo^="${slug}:"]`)
  const vistos = new Set<string>()
  origenes.forEach((el) => {
    const id = el.dataset.vuelo!
    const r = el.getBoundingClientRect()
    if (el.closest('[inert]') || vistos.has(id) || r.width < 8 || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return
    vistos.add(id)
    const g = el.cloneNode(true) as HTMLElement
    g.removeAttribute('data-vuelo')
    g.setAttribute('aria-hidden', 'true')
    g.classList.add('c-fantasma')
    Object.assign(g.style, { width: `${r.width}px`, height: `${r.height}px` })
    capa.appendChild(g)
    gsap.set(g, { x: r.left, y: r.top, transformOrigin: '0 0' })
    fantasmas.push({ g, id, r })
  })
  limpiador = setTimeout(limpiarVuelo, 2500)
}

/** El centro de las capturas que van a volar (hacia él se cierra el iris de la Mesa). */
function centroVuelo() {
  if (!fantasmas.length) return null
  const x0 = Math.min(...fantasmas.map((f) => f.r.left))
  const x1 = Math.max(...fantasmas.map((f) => f.r.right))
  const y0 = Math.min(...fantasmas.map((f) => f.r.top))
  const y1 = Math.max(...fantasmas.map((f) => f.r.bottom))
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
}

function limpiarVuelo() {
  clearTimeout(limpiador)
  fantasmas.forEach((f) => f.g.remove())
  fantasmas = []
}

export function aterrizarVuelo(raiz: HTMLElement) {
  if (!fantasmas.length) return
  const lote = fantasmas
  fantasmas = []
  clearTimeout(limpiador)
  lote.forEach(({ g, id, r }) => {
    const destino = raiz.querySelector<HTMLElement>(`[data-vuelo="${id}"]`)
    if (!destino) {
      gsap.to(g, { opacity: 0, duration: 0.2, onComplete: () => g.remove() })
      return
    }
    const t = destino.getBoundingClientRect()
    destino.style.visibility = 'hidden'
    gsap.to(g, {
      x: t.left,
      y: t.top,
      scaleX: t.width / r.width,
      scaleY: t.height / r.height,
      duration: 0.52,
      ease: CURVA,
      onComplete: () => {
        // El fantasma (un LOD bajo agrandado) cede el sitio con un fundido sobre la captura nítida, sin salto.
        destino.style.visibility = ''
        gsap.to(g, { opacity: 0, duration: 0.18, ease: 'power1.out', onComplete: () => g.remove() })
      },
    })
  })
}

/** Radio con el que un círculo centrado en (x, y) de la ventana la cubre entera. */
export const radioHasta = (x: number, y: number) => Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

/** El botón que pidió la mesa (el primero visible): de él nace y a él regresa el iris. */
export const origenMesa = () => {
  const el = [...document.querySelectorAll<HTMLElement>('[data-abrir-mesa]')].find((e) => e.getClientRects().length > 0)
  const r = el?.getBoundingClientRect()
  return { x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.top + r.height / 2 : window.innerHeight / 2 }
}

/** Precarga lo que la ficha va a mostrar primero (al pasar el puntero o al enfocar): la imagen del vuelo ya está lista (EX-8). */
const precargadas = new Set<string>()
export function precargar(urls: string[]) {
  urls.forEach((u) => {
    if (precargadas.has(u)) return
    precargadas.add(u)
    const i = new Image()
    i.decoding = 'async'
    i.src = u
  })
}

export { gsap }
