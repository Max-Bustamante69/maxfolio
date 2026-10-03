import { useId, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { v5path, type Obra, type Vista, type Viewport } from '../data'
import { evento } from '../shared/contacto'
import { ShotImg } from '../shared/ShotImg'
import { useCopy } from './copy'
import { LOOKS, lookSrc } from './looks'
import { despegar, useIr } from './motion'

export const ID = 'maison'

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

/** El triángulo ▸ de los enlaces secundarios de Loewe. */
export const Tri = ({ atras }: { atras?: boolean }) => (
  <svg className={atras ? 'mz-tri mz-tri-atras' : 'mz-tri'} viewBox="0 0 6 8" width="6" height="8" aria-hidden="true"><path d="M0 0v8l6-4z" fill="currentColor" /></svg>
)

/**
 * El marco de una pieza. Con fotografía (el recorte 4:5 del original de la tienda: sin texto ni interfaz) es una imagen a sangre
 * que el marco recorta hacia su punto de interés; sin ella (una tienda sin fotografía propia) la pantalla entera se posa sobre la losa.
 */
export function Marco({ o, alt = '', prioridad, clase = '', velo = true }: { o: Pick<Obra, 'slug' | 'views'>; alt?: string; prioridad?: boolean; clase?: string; velo?: boolean }) {
  const l = LOOKS[o.slug]
  const dv = velo ? 'velo' : undefined
  if (l) {
    return (
      <div className={`mz-foto mz-mirada ${clase}`} data-mz={dv}>
        <img className="mz-foto-1" src={lookSrc(o.slug)} width={l.w} height={l.h} data-nw={l.w} data-nh={l.h} alt={alt} style={{ objectPosition: `${l.fx}% ${l.fy}%` }}
          loading={prioridad ? 'eager' : 'lazy'} fetchPriority={prioridad ? 'high' : undefined} decoding="async" />
      </div>
    )
  }
  return (
    <div className={`mz-foto mz-losa ${clase}`} data-mz={dv}>
      <ShotImg slug={o.slug} vista={o.views[0] ?? 'home'} vp="mobile" alt={alt} prioridad={prioridad} className="mz-foto-1" />
    </div>
  )
}

/** Una captura real, entera, sobre la losa: la pantalla tal como se ve (escritorio o móvil), sin recortar. */
export function Pantalla({ slug, vista, vp, alt, clase = '' }: { slug: string; vista: Vista; vp: Viewport; alt: string; clase?: string }) {
  return (
    <div className={`mz-foto mz-losa mz-pantalla mz-pantalla-${vp === 'desktop' ? 'd' : 'm'} ${clase}`} data-mz="velo">
      <ShotImg slug={slug} vista={vista} vp={vp} alt={alt} className="mz-foto-1" />
    </div>
  )
}

/** Una pieza de la colección: su fotografía (siempre 4:5, sobre la losa) y su pie: nombre, año, rubro y una frase. Al abrirla, la imagen cruza a la ficha. */
export function Pieza({ o, texto, prioridad, clase = '', velo = true }: { o: Obra; texto?: string; prioridad?: boolean; clase?: string; velo?: boolean }) {
  const c = useCopy()
  const alPulsar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en otra pestaña no levanta la imagen
    const marco = e.currentTarget.querySelector<HTMLElement>('.mz-foto')
    const img = marco?.querySelector<HTMLImageElement>('.mz-foto-1')
    if (marco && img) despegar(o.slug, marco, img)
    evento(ID, 'obra_open', { slug: o.slug })
  }
  // «Construida» no se repite en cada pie; sí se dice cuando la tienda es una migración o una personalización de un tema ajeno.
  const linea = [o.industry ?? c.kinds[o.kind], o.role && o.role !== 'built' ? o.rolLabel : ''].filter(Boolean).join(' · ')
  return (
    <article className={`mz-pieza ${clase}`}>
      <Enlace to={v5path(ID, 'obra', o.slug)} className="mz-pieza-a" onClick={alPulsar}>
        <Marco o={o} prioridad={prioridad} velo={velo} />
        <div className="mz-pieza-pie">
          <h3 className="mz-pieza-nombre">{o.name}</h3>
          <span className="mz-pieza-anio">{o.year}</span>
          <p className="mz-pieza-linea">{linea}</p>
          {texto && <p className="mz-pieza-texto">{texto}</p>}
        </div>
      </Enlace>
    </article>
  )
}

/** Acordeón de la casa: el cuerpo se abre con la altura real (grid 0fr → 1fr) y el + se vuelve −. */
export function Acordeon({ abierto, alternar, cabeza, children, nivel = 3 }: { abierto: boolean; alternar: () => void; cabeza: ReactNode; children: ReactNode; nivel?: 2 | 3 }) {
  const id = useId()
  const H = nivel === 2 ? 'h2' : 'h3'
  return (
    <div className="mz-acc" data-abierto={abierto}>
      <H className="mz-acc-h">
        <button type="button" className="mz-acc-b" aria-expanded={abierto} aria-controls={id} onClick={alternar}>
          <span className="mz-acc-cabeza">{cabeza}</span>
          <span className="mz-mas" aria-hidden="true" />
        </button>
      </H>
      <div id={id} className="mz-acc-cuerpo" inert={!abierto}>
        <div className="mz-acc-in">{children}</div>
      </div>
    </div>
  )
}

/** «−» tipográfico en las cifras que el registro escribe con guion: «-30–40%» → «−30–40%». */
export const menos = (s: string) => s.replace(/^-/, '−')

/** Una consulta de medios como estado de React: la vista monta solo la variante que se ve (nada oculto que cargue o quede velado). */
export function useMq(consulta: string) {
  return useSyncExternalStore(
    (avisar) => { const m = window.matchMedia(consulta); m.addEventListener('change', avisar); return () => m.removeEventListener('change', avisar) },
    () => window.matchMedia(consulta).matches,
    () => true,
  )
}
