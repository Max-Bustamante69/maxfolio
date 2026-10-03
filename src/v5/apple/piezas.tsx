import { useRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { evento } from '../shared/contacto'
import { ShotImg } from '../shared/ShotImg'
import { shot, v5path, type Obra } from '../data'
import { despegar, useIr } from './motion'

const precargadas = new Set<string>()
/** Calienta la caché con las capturas que el siguiente destino va a pedir (al pasar el puntero o enfocar), para que lleguen ya pintadas. */
export function precargar(urls: string[]) {
  urls.forEach((u) => {
    if (precargadas.has(u)) return
    precargadas.add(u)
    new Image().src = u
  })
}
export const capturasDeObra = (obras: Obra[], n = 6) =>
  obras.filter((o) => o.views.length).slice(0, n).map((o) => shot(o.slug, o.views[0], 'desktop'))

/** Enlace interno: un <a> real (clic medio y copiar enlace funcionan) que navega con la salida de la vista. */
export function Enlace({ to, onClick, children, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ir = useIr()
  const alPulsar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return
    e.preventDefault()
    ir(to)
  }
  return <a href={to} onClick={alPulsar} {...rest}>{children}</a>
}

export const Chevron = ({ abajo, izquierda }: { abajo?: boolean; izquierda?: boolean }) => (
  <svg className={abajo ? 'ap-chev ap-chev-abajo' : izquierda ? 'ap-chev ap-chev-izq' : 'ap-chev'} viewBox="0 0 8 12" width="8" height="12" aria-hidden="true">
    <path d="M1.5 1.5 6 6l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type Vista = 'home' | 'pdp'

/** Capturas reales apiladas en una pantalla: la activa se ve, las demás esperan (la primera carga ya; las otras, al verse). */
function Capturas({ slug, vistas, activa, vp, alt, prioridad, previa }: { slug: string; vistas: Vista[]; activa: Vista; vp: 'desktop' | 'mobile'; alt: string; prioridad?: boolean; previa?: boolean }) {
  // `previa`: la captura de una escena que se verá más abajo baja en cuanto hay red libre, para no llegar vacía al scroll.
  const carga = previa ? ({ loading: 'eager', fetchPriority: 'low' } as const) : {}
  return vistas.map((v, i) => (
    <ShotImg key={v} slug={slug} vista={v} vp={vp} alt={v === activa ? alt : ''} aria-hidden={v === activa ? undefined : true} prioridad={prioridad && i === 0} {...carga} className={v === activa ? 'ap-cap ap-cap-on' : 'ap-cap'} />
  ))
}

/** Pantalla de escritorio con la captura real dentro. */
export function Mac({ slug, vistas, activa = vistas[0], alt, prioridad, previa, marcoClass = '' }: { slug: string; vistas: Vista[]; activa?: Vista; alt: string; prioridad?: boolean; previa?: boolean; marcoClass?: string }) {
  return (
    <div className="ap-mac">
      <div className={`ap-pantalla ${marcoClass}`}>
        <Capturas slug={slug} vistas={vistas} activa={activa} vp="desktop" alt={alt} prioridad={prioridad} previa={previa} />
      </div>
    </div>
  )
}

/** Teléfono con la captura móvil real dentro. */
export function Telefono({ slug, vistas, activa = vistas[0], alt, previa }: { slug: string; vistas: Vista[]; activa?: Vista; alt: string; previa?: boolean }) {
  return (
    <div className="ap-telefono">
      <div className="ap-pantalla">
        <Capturas slug={slug} vistas={vistas} activa={activa} vp="mobile" alt={alt} previa={previa} />
      </div>
    </div>
  )
}

/** Obra con captura: la imagen manda, el texto cuelga debajo (rubro y rol, nombre, su historia en una línea). Al pulsarla, la captura cruza a la ficha. */
export function Tile({ o, etq, texto, ficha, className = '', hidden, prioridad, nivel = 3 }: { o: Obra; etq?: string; texto?: string; ficha: string; className?: string; hidden?: boolean; prioridad?: boolean; nivel?: 2 | 3 }) {
  const Titulo = nivel === 2 ? 'h2' : 'h3'
  const marco = useRef<HTMLDivElement>(null)
  const alPulsar = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en otra pestaña no levanta la captura
    const img = marco.current?.querySelector('img')
    if (marco.current && img) despegar(o.slug, marco.current, img)
    evento('apple', 'obra_open', { slug: o.slug })
  }
  return (
    <Enlace to={v5path('apple', 'obra', o.slug)} onClick={alPulsar} onPointerEnter={() => precargar([shot(o.slug, o.views[0], 'mobile')])} onFocus={() => precargar([shot(o.slug, o.views[0], 'mobile')])} className={`ap-tile ${className}`} data-ap="escala" data-slug={o.slug} hidden={hidden}>
      <div className="ap-tile-marco" ref={marco}>
        <div className="ap-tile-zoom"><ShotImg slug={o.slug} vista={o.views[0]} vp="desktop" alt="" prioridad={prioridad} /></div>
      </div>
      <div className="ap-tile-pie">
        {etq && <p className="ap-tile-etq">{etq}</p>}
        <Titulo>{o.name}</Titulo>
        {texto && <p className="ap-tile-txt">{texto}</p>}
        <span className="ap-tile-ver">{ficha}<Chevron /></span>
      </div>
    </Enlace>
  )
}

export function Segmentado<T extends string>({ valor, opciones, onCambio, etiqueta }: { valor: T; opciones: Array<[T, ReactNode]>; onCambio: (v: T) => void; etiqueta: string }) {
  return (
    <div className="ap-seg" role="group" aria-label={etiqueta}>
      {opciones.map(([v, texto]) => (
        <button key={v} type="button" aria-pressed={v === valor} className="ap-seg-op" onClick={() => onCambio(v)}>{texto}</button>
      ))}
    </div>
  )
}

/** Una obra en una fila: nombre, su historia en una línea, año. Es la forma de lo que no tiene captura (nunca una imagen inventada). */
export function Fila({ o }: { o: Obra }) {
  return (
    <li>
      <Enlace to={v5path('apple', 'obra', o.slug)} className="ap-fila">
        <span className="ap-fila-n">{o.name}</span>
        <span className="ap-fila-d">{o.tagline || o.industry}</span>
        <span className="ap-fila-a">{o.year}</span>
        <Chevron />
      </Enlace>
    </li>
  )
}
