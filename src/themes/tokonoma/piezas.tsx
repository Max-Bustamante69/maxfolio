import { useEffect, useState, type AnchorHTMLAttributes, type CSSProperties, type ImgHTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { shot, v5path, type Obra, type Vista } from '../data'
import { evento } from '../shared/contacto'
import { useCopy } from './copy'
import { periodoDe, type Fig } from './limpio'
import { despegar, useIr } from './motion'

export const ID = 'tokonoma'
export const ruta = (vista: '' | 'obra' | 'trayectoria' | 'contacto' = '', slug?: string) => v5path(ID, vista, slug)

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

/** Enlace a una obra: si lleva captura de escritorio, al pulsarla la captura levanta el vuelo hacia la ficha. */
export function EnlaceObra({ o, children, ...rest }: { o: Obra } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const alPulsar = (e: MouseEvent<HTMLAnchorElement>) => {
    evento(ID, 'obra_open', { slug: o.slug })
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const img = e.currentTarget.querySelector<HTMLImageElement>('[data-vuelo]')
    if (img) despegar(o.slug, img)
  }
  return <Enlace to={ruta('obra', o.slug)} onClick={alPulsar} {...rest}>{children}</Enlace>
}

/** Captura real: en escritorio la de 1200×750; en móvil la de 780×1688. Tamaños intrínsecos: cero CLS. El recorte lo pone el CSS (.tk-recorte). */
export function Foto({ slug, vista, alt, prioridad, solo, ...rest }: { slug: string; vista: Vista; alt: string; prioridad?: boolean; solo?: 'desktop' | 'mobile'; ref?: Ref<HTMLImageElement> } & ImgHTMLAttributes<HTMLImageElement>) {
  const vp = solo ?? 'desktop'
  const medidas = vp === 'desktop' ? { width: 1200, height: 750 } : { width: 780, height: 1688 }
  return (
    <picture>
      {!solo && <source media="(max-width: 767px)" srcSet={shot(slug, vista, 'mobile')} width={780} height={1688} />}
      <img src={shot(slug, vista, vp)} {...medidas} alt={alt} loading={prioridad ? 'eager' : 'lazy'} fetchPriority={prioridad ? 'high' : undefined} decoding="async" {...rest} />
    </picture>
  )
}

/** Dónde empieza el recorte de cada captura (% del sobrante): sube lo justo para dejar fuera las cintas de anuncios de la tienda. */
const CORTE: Record<string, { d?: string; m?: string }> = { millennio: { d: '36%' } }

/**
 * El nicho: la captura cuelga desnuda sobre el blanco de la página (sin placa, sin pared de color), recortada a su parte alta (2:1 en
 * escritorio, la captura vertical en móvil) con un filete de 1 px. Fuera de cuadro quedan las cintas de anuncios, el WhatsApp y las
 * píldoras de la tienda. Sin sombra ni radio.
 */
export function Nicho({ slug, vista, alt, prioridad, vuelo, tk = 'pieza', className = '' }: { slug: string; vista: Vista; alt: string; prioridad?: boolean; vuelo?: boolean; tk?: string; className?: string }) {
  const c = CORTE[slug]
  const estilo = c ? ({ '--cy-d': c.d, '--cy-m': c.m } as CSSProperties) : undefined
  return (
    <span className={`tk-nicho ${className}`} data-tk={tk || undefined} style={estilo}>
      <span className="tk-recorte">
        <Foto slug={slug} vista={vista} alt={alt} prioridad={prioridad} data-vuelo={vuelo ? '' : undefined} />
      </span>
    </span>
  )
}

/** Las cifras de una obra, una bajo otra: el número grande y lo que mide. */
export function Cifras({ figuras, className = '' }: { figuras: Fig[]; className?: string }) {
  return (
    <ul className={`tk-figs ${className}`}>
      {figuras.map((f, i) => (
        <li key={f.etiqueta}>
          <p className="tk-fig-v"><Mascara r={i * 0.08}><Cifra valor={f.valor} /></Mascara></p>
          <p className="tk-fig-e" data-tk="sube" data-tk-y="10" data-tk-r={0.1 + i * 0.08}>{f.etiqueta}</p>
        </li>
      ))}
    </ul>
  )
}

/** Tarjeta de una obra con captura: la pieza desnuda, su nombre, una frase, una línea de cifras y el sector. */
export function Tarjeta({ o, prioridad, grande, figuras }: { o: Obra; prioridad?: boolean; grande?: boolean; figuras?: Fig[] }) {
  const { locale } = useLanguage()
  const meta = [o.industry, o.period ? periodoDe(o.period, locale) : String(o.year), o.rolLabel].filter(Boolean).join(' · ')
  const linea = (figuras ?? []).filter((f) => f.corta).slice(0, 2)
  return (
    <li className="tk-tarjeta" data-grande={grande ? '' : undefined} data-tk="sube">
      <EnlaceObra o={o} className="tk-tarjeta-a">
        <Nicho slug={o.slug} vista={o.views[0]} alt="" prioridad={prioridad} vuelo tk="" />
        <h3 className="tk-t-nombre">{o.name}</h3>
        <p className="tk-t-lema">{o.tagline}</p>
        {linea.length > 0 && (
          <p className="tk-t-escala">
            {linea.map((f) => <span key={f.etiqueta}><b>{f.valor}</b> {f.corta}</span>)}
          </p>
        )}
        <p className="tk-t-meta">{meta}</p>
      </EnlaceObra>
    </li>
  )
}

/** El sello (hanko): las iniciales en dos líneas sobre cinabrio. Es el único acento de la página. */
export const Sello = ({ tam = 28, tk, className = '' }: { tam?: number; tk?: string; className?: string }) => (
  <span className={`tk-sello ${className}`} aria-hidden="true" data-tk={tk} style={{ '--s': `${tam}px` } as CSSProperties}>
    <i>M</i>
    <i>B</i>
  </span>
)

/** «70→95+» y «+10–20%»: la flecha y la raya de rango se dibujan con un trazo proporcional al numeral (la fuente no trae el glifo). */
export function Cifra({ valor }: { valor: string }) {
  const c = useCopy()
  return (
    <>
      {valor.replace(/^-/, '−').split(/(→|–)/).map((p, i) =>
        p === '→' ? (
          <svg key={i} className="tk-flecha" viewBox="0 0 34 16" role="img" aria-label={c.flecha}><path d="M0 8h30M23 1.6 30 8l-7 6.4" fill="none" stroke="currentColor" strokeWidth="4" /></svg>
        ) : p === '–' ? (
          <i key={i} className="tk-guion" role="img" aria-label={c.rango} />
        ) : (
          p
        ),
      )}
    </>
  )
}

/** Una cifra que sube desde detrás de su máscara al verse. */
export const Mascara = ({ children, className = '', r }: { children: ReactNode; className?: string; r?: number }) => (
  <span className={`tk-mascara ${className}`} data-tk="mascara" data-tk-r={r}>
    <span>{children}</span>
  </span>
)

/** Lista de pares (takram «Information»): etiqueta en tinta, valor en tinta secundaria, un filete por fila. */
export function Pares({ items, className = '' }: { items: Array<[string, ReactNode]>; className?: string }) {
  return (
    <dl className={`tk-pares ${className}`}>
      {items.map(([k, v]) => (
        <div key={k} className="tk-par">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export const Salida = () => (
  <svg className="tk-salida" viewBox="0 0 10 10" width="9" height="9" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
)

/** Hueco de una obra sin captura: la montura vacía en papel con su nombre. Nunca se inventa una imagen. */
export function Montura({ nombre, leyenda }: { nombre: string; leyenda: string }) {
  return (
    <div className="tk-montura">
      <p className="tk-montura-n">{nombre}</p>
      <p className="tk-rotulo">{leyenda}</p>
    </div>
  )
}

/** ¿Cumple la consulta de medios? Se actualiza con el cambio, sin sondeo. */
export function useMedia(consulta: string) {
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)
  useEffect(() => {
    const m = window.matchMedia(consulta)
    const f = () => setV(m.matches)
    f()
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [consulta])
  return v
}
