import { Fragment, useId, useRef, useState, type AnchorHTMLAttributes, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { evento } from '../shared/contacto'
import { ShotImg } from '../shared/ShotImg'
import { shot, v5path, type Obra, type Vista } from '../data'
import { useCopy } from './copy'
import { despegar, useIr, vueloDe } from './motion'

const precargadas = new Set<string>()
/** Calienta la caché con las capturas que el siguiente destino va a pedir (al pasar el puntero o enfocar). */
export function precargar(urls: string[]) {
  urls.forEach((u) => {
    if (precargadas.has(u)) return
    precargadas.add(u)
    new Image().src = u
  })
}

/** Enlace interno: un <a> real (clic medio y copiar enlace funcionan) que navega con la hoja de papel. */
export function Enlace({ to, hoja, num, titulo, onClick, children, ...rest }: { to: string; hoja?: boolean; num?: string; titulo?: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ir = useIr()
  const alPulsar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return
    e.preventDefault()
    ir(to, { hoja, num, titulo })
  }
  return <a href={to} onClick={alPulsar} {...rest}>{children}</a>
}

/** Flecha dibujada: el carácter → no está en el subconjunto latino de las fuentes y cae a otra familia. */
export const Flecha = ({ className = 'rp-flecha' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 24" aria-hidden="true">
    <path d="M1 12h35M27 3l10 9-10 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
  </svg>
)

/** Un texto del registro con sus «→» dibujados: el carácter no está en el subconjunto latino de las fuentes. */
export const flechas = (s: string): ReactNode =>
  s.split('→').map((parte, i) => (i ? <Fragment key={i}><Flecha className="rp-flecha rp-flecha-txt" />{parte}</Fragment> : parte))

export const Chevron = ({ izquierda }: { izquierda?: boolean }) => (
  <svg className={izquierda ? 'rp-chev rp-chev-izq' : 'rp-chev'} viewBox="0 0 8 12" width="8" height="12" aria-hidden="true">
    <path d="M1.5 1.5 6 6l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * Una cifra del registro como número grande: «+», «%» y «~» van en un <small> a media altura (en Newsreader salen pequeños y
 * finos junto a una cifra de 150 px) y la flecha se dibuja. Lee la cadena del registro, así que nunca se desincroniza de ella.
 */
export function Numeral({ valor }: { valor: string }) {
  const partes = valor.replace(/-/g, '−').split(/([+%~→])/).filter(Boolean)
  // Ancho estimado en em (cifra ≈ 0,56; signo pequeño ≈ 0,24; flecha ≈ 0,72): el CSS fija el cuerpo para que la cifra llene su columna sin desbordar.
  const ancho = partes.reduce((a, p) => a + (p === '→' ? 0.72 : /^[+%~]$/.test(p) ? 0.24 : p.length * 0.56), 0)
  return (
    <span className="rp-num" role="img" aria-label={valor} style={{ '--ancho': ancho.toFixed(2) } as CSSProperties}>
      {partes.map((p, i) => (p === '→' ? <Flecha key={i} className="rp-num-flecha" /> : /^[+%~]$/.test(p) ? <small key={i}>{p}</small> : <span key={i}>{p}</span>))}
    </span>
  )
}

/** Marco de una figura (ficha de estilo 6): filete de 1 px, tesis como título, qué se mide, la figura y la fuente pegada. */
export function Fig({ n, titulo, sub, medida, fuente, aria, children, className = '' }: { n: number; titulo: string; sub?: string; medida?: string; fuente: string; aria?: string; children: ReactNode; className?: string }) {
  const c = useCopy()
  return (
    <figure className={`rp-fig ${className}`}>
      <div className="rp-fig-filete" data-rp="filete" />
      <header className="rp-fig-cab">
        <h3 className="rp-fig-t">{titulo}</h3>
        <span className="rp-mono rp-nowrap">{c.fig} {n}</span>
      </header>
      {sub && <p className="rp-fig-sub">{sub}</p>}
      <div className="rp-fig-cuerpo" role={aria ? 'img' : undefined} aria-label={aria}>{children}</div>
      <figcaption className="rp-fig-pie">
        <span className="rp-nota">{c.fuente}: {fuente}</span>
        {medida && <span className="rp-mono">{medida}</span>}
      </figcaption>
    </figure>
  )
}

/** Una captura de escritorio con la del móvil montada en su esquina: la lámina que lleva cada caso. */
export function Lamina({ o, vista = 'home', prioridad, animar = true, clase = '' }: { o: Obra; vista?: Vista; prioridad?: boolean; animar?: boolean; clase?: string }) {
  const c = useCopy()
  return (
    <div className={`rp-lamina ${clase}`} data-slug={o.slug}>
      <div className="rp-placa rp-lamina-placa" data-rp={animar ? 'placa' : undefined}>
        <div className="rp-placa-img"><ShotImg slug={o.slug} vista={vista} vp="desktop" alt={`${o.name} · ${c.ficha.escritorio}`} prioridad={prioridad} /></div>
      </div>
      <div className="rp-lamina-tel"><div className="rp-placa rp-placa-tel"><div className="rp-placa-img"><ShotImg slug={o.slug} vista={vista} vp="mobile" alt={`${o.name} · ${c.ficha.movil}`} /></div></div></div>
    </div>
  )
}

/** La insignia de resultado de una obra: su hecho verificable más corto («10% → 20%  ·  Escalón de descuento»). */
export const Insignia = ({ valor, clase }: { valor: string; clase: string }) => (
  <p className="rp-insignia"><b>{flechas(valor)}</b><span>{clase}</span></p>
)

/** Obra con captura: la imagen manda, el texto cuelga debajo. Al pulsarla, la captura cruza a la ficha. */
export function Tarjeta({ o, texto, nivel = 3, prioridad }: { o: Obra; texto?: string; nivel?: 2 | 3 | 4; prioridad?: boolean }) {
  const c = useCopy()
  const Titulo = (`h${nivel}`) as 'h2' | 'h3' | 'h4'
  const marco = useRef<HTMLDivElement>(null)
  const alPulsar = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en otra pestaña no levanta la captura
    const img = marco.current?.querySelector('img')
    if (marco.current && img) despegar(o.slug, marco.current, img)
    evento('reportaje', 'obra_open', { slug: o.slug })
  }
  const caluga = () => precargar(o.views.map((v) => shot(o.slug, v, 'mobile')))
  return (
    <Enlace to={v5path('reportaje', 'obra', o.slug)} hoja={false} onClick={alPulsar} onPointerEnter={caluga} onFocus={caluga} className="rp-tarjeta" data-slug={o.slug}>
      <div className="rp-placa" data-rp={vueloDe() === o.slug ? undefined : 'placa'}>
        <div className="rp-placa-img" ref={marco}><ShotImg slug={o.slug} vista={o.views[0]} vp="desktop" alt="" prioridad={prioridad} /></div>
      </div>
      <div className="rp-tarjeta-pie">
        <Titulo className="rp-tarjeta-n"><span>{o.name}</span></Titulo>
        <p className="rp-meta rp-tarjeta-meta">{[o.industry, o.year, o.rolLabel ?? c.kinds[o.kind]].filter(Boolean).join(' · ')}</p>
        {texto && <p className="rp-tarjeta-txt">{texto}</p>}
        <span className="rp-tarjeta-ver">{c.leerCaso}<Flecha /></span>
      </div>
    </Enlace>
  )
}

/** Acordeón: el cuerpo anima de 0fr a 1fr (alto real), el signo gira. */
export function Acordeon({ q, a }: { q: string; a: string }) {
  const [abierto, setAbierto] = useState(false)
  const id = useId()
  return (
    <div className="rp-acc" data-abierto={abierto}>
      <h3>
        <button type="button" className="rp-acc-b" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto(!abierto)}>
          <span>{q}</span>
          <span className="rp-mas" aria-hidden="true" />
        </button>
      </h3>
      <div id={id} className="rp-acc-cuerpo" inert={!abierto}>
        <div className="rp-acc-in"><p>{a}</p></div>
      </div>
    </div>
  )
}

/** Lleva al id sin cambiar la ruta (un <a href="#…"> dentro de la SPA cambiaría la ubicación del router). */
export const alIndice = (id: string) => (e: MouseEvent) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
