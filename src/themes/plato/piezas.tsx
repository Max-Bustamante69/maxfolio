import { useRef, type AnchorHTMLAttributes, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { evento } from '../shared/contacto'
import type { Medida } from './casos'
import { shot, v5path, type Obra } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { ID, usePlato } from './contexto'
import { despegar } from './motion'
import { indiceDe } from './escena/sets'

const BASE = v5path(ID)
export const ruta = (vista: '' | 'obra' | 'trayectoria' | 'contacto' = '', slug?: string) => v5path(ID, vista, slug)

/** Enlace interno: un <a> real (clic medio y copiar enlace funcionan) que navega con la cubierta del destino. */
export function Enlace({ to, onClick, oscuro, directo, children, ...rest }: { to: string; oscuro?: boolean; directo?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { ir, en3d } = usePlato()
  const alPulsar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return
    e.preventDefault()
    // El destino oscuro es el plató (obra y fichas con escena); lo demás se lee en luz de sala.
    const p = to.split('?')[0]
    const destinoOscuro = oscuro ?? (en3d && (p === `${BASE}/obra` || (p.startsWith(`${BASE}/obra/`) && indiceDe(p.split('/').pop() ?? '') >= 0)))
    ir(to, { oscuro: destinoOscuro, directo })
  }
  return <a href={to} onClick={alPulsar} {...rest}>{children}</a>
}

/** Texto en dos capas que ruedan en vertical al pasar el puntero (rodillo de lusion.co). */
export const Rod = ({ children }: { children: string }) => (
  <span className="pl-rod">
    <span className="pl-rod-in"><span>{children}</span><span aria-hidden="true">{children}</span></span>
  </span>
)

/** Título cuyas letras ruedan una a una al pasar el puntero (cada letra con su retraso). Las dos copias son visuales; el texto accesible es uno. */
export function Letras({ texto }: { texto: string }) {
  return (
    <span className="pl-letras">
      <span className="pl-sr">{texto}</span>
      <span aria-hidden="true" className="pl-letras-v">
        {Array.from(texto).map((ch, i) => (
          <span key={i} className="pl-letra" style={{ '--i': i } as CSSProperties}>
            <span>{ch === ' ' ? ' ' : ch}</span><span>{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </span>
    </span>
  )
}

/** Marcas de registro «+» en los extremos y tercios de una caja (lusion.co). */
export const Cruces = ({ n = 4 }: { n?: 4 | 5 }) => (
  <span className="pl-cruces" aria-hidden="true">
    {Array.from({ length: n }, (_, i) => <i key={i} style={{ left: `${(i / (n - 1)) * 100}%` }} />)}
  </span>
)

export const Flecha = ({ izq, arriba }: { izq?: boolean; arriba?: boolean }) => (
  <svg className="pl-flecha" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ transform: izq ? 'scaleX(-1)' : arriba ? 'rotate(-90deg)' : undefined }}>
    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Una fila de la hoja de datos: etiqueta mono a la izquierda, valor a la derecha, filete debajo. */
export const Dato = ({ k, children }: { k: string; children: ReactNode }) => (
  <div className="pl-dato"><dt>{k}</dt><dd>{children}</dd></div>
)

/** Calienta la caché con la captura que el siguiente destino va a pedir. */
const precargadas = new Set<string>()
export function precargar(urls: string[]) {
  urls.forEach((u) => {
    if (precargadas.has(u)) return
    precargadas.add(u)
    new Image().src = u
  })
}

/** Tarjeta de obra de lusion.co: imagen 1,54:1 sin sombra ni borde, debajo disciplinas y título. Al pulsarla, la captura cruza a la ficha. */
export function Tarjeta({ o, etq, nivel = 3, prioridad, className = '', recibe, sinHistoria, texto, medida }: { o: Obra; etq: string; nivel?: 2 | 3; prioridad?: boolean; className?: string; recibe?: boolean; sinHistoria?: boolean; texto?: string; medida?: Medida }) {
  const Titulo = nivel === 2 ? 'h2' : 'h3'
  const marco = useRef<HTMLDivElement>(null)
  const alPulsar = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const img = marco.current?.querySelector('img')
    if (marco.current && img) despegar(o.slug, marco.current, img)
    evento(ID, 'obra_open', { slug: o.slug })
  }
  return (
    <Enlace
      to={ruta('obra', o.slug)} onClick={alPulsar} directo className={`pl-tarjeta ${className}`} data-slug={o.slug}
      onPointerEnter={() => precargar([shot(o.slug, o.views[0], 'mobile')])} onFocus={() => precargar([shot(o.slug, o.views[0], 'mobile')])}
    >
      <div className="pl-tarjeta-marco" ref={marco} data-pl={recibe ? undefined : 'ventana'}>
        <ShotImg slug={o.slug} vista={o.views[0]} vp="desktop" alt="" prioridad={prioridad} />
      </div>
      <p className="pl-etq">{etq}</p>
      <Titulo className="pl-tarjeta-t"><Letras texto={o.name} /><Flecha /></Titulo>
      {!sinHistoria && (texto || o.tagline) && <p className="pl-tarjeta-h">{texto || o.tagline}</p>}
      {!sinHistoria && medida && <p className="pl-tarjeta-m"><b>{medida.valor}</b><span className="pl-mono">{medida.etq}</span></p>}
    </Enlace>
  )
}
