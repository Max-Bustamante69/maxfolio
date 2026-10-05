import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ImgHTMLAttributes, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { evento } from '../shared/contacto'
import type { Medida } from './casos'
import { shot, SHOT_SIZE, v5path, type Obra, type Viewport, type Vista } from '../data'
import { ID, usePlato } from './contexto'
import { despegar } from './motion'
import { indiceDe } from './escena/sets'

const BASE = v5path(ID)

/**
 * La captura de una obra en Plató: las 19 tiendas con set usan las capturas NUEVAS de public/v5/plato/tex (escritorio a 1536 × 960, móvil a 780 × 1688,
 * recapturadas el 2026-10-03 sin burbujas de chat, popups ni avisos); lo demás (apps, plataforma) conserva su captura de galería.
 */
export const plShot = (slug: string, vista: Vista, vp: Viewport, tarjeta = false) =>
  indiceDe(slug) >= 0 ? `/v5/plato/tex/${slug}-${tarjeta && vista === 'home' && vp === 'desktop' ? 'hc' : `${vista === 'home' ? 'h' : 'p'}${vp === 'desktop' ? 'd' : 'm'}`}.webp` : shot(slug, vista, vp)
/** GIF transparente de 1 × 1: el hueco de una imagen diferida (con width y height el espacio ya está reservado). */
const VACIA = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const PL_TAM: Record<Viewport, { w: number; h: number }> = { desktop: { w: 1536, h: 960 }, mobile: { w: 780, h: 1688 } }
/** La versión de tarjeta (960 × 600, ≈ 36 KB): las tarjetas no pasan de 640 px de ancho, no necesitan los 1536 de la escena. */
const PL_TARJETA = { w: 960, h: 600 }
export function PlShot({ slug, vista, vp, alt, prioridad, tarjeta, diferida, ...rest }: { slug: string; vista: Vista; vp: Viewport; alt: string; prioridad?: boolean; tarjeta?: boolean; diferida?: boolean } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>) {
  const { w, h } = indiceDe(slug) >= 0 ? (tarjeta && vista === 'home' && vp === 'desktop' ? PL_TARJETA : PL_TAM[vp]) : SHOT_SIZE[vp]
  // `diferida`: sin src hasta que la imagen está a 300 px de la ventana (el lazy nativo de un móvil lento carga hasta 2 500 px antes y compite con el LCP).
  const ref = useRef<HTMLImageElement>(null)
  const [ver, setVer] = useState(!diferida)
  useEffect(() => {
    if (ver || !ref.current) return
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setVer(true); io.disconnect() } }, { rootMargin: '300px 0px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [ver])
  return <img ref={ref} src={ver ? plShot(slug, vista, vp, tarjeta) : VACIA} width={w} height={h} alt={alt} loading={prioridad ? 'eager' : 'lazy'} fetchPriority={prioridad ? 'high' : undefined} decoding="async" {...rest} />
}
export const ruta = (vista: '' | 'obra' | 'trayectoria' | 'contacto' = '', slug?: string) => v5path(ID, vista, slug)

/** Enlace interno: un <a> real (clic medio y copiar enlace funcionan) que navega con la cubierta del destino. */
export function Enlace({ to, onClick, oscuro, directo, children, ...rest }: { to: string; oscuro?: boolean; directo?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { ir, en3d } = usePlato()
  const { pathname: aqui } = useLocation()
  const alPulsar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return
    e.preventDefault()
    // El destino oscuro es el plató (obra y fichas con escena); lo demás se lee en luz de sala.
    const p = to.split('?')[0]
    const conEscena = (r: string) => en3d && (r === `${BASE}/obra` || (r.startsWith(`${BASE}/obra/`) && indiceDe(r.split('/').pop() ?? '') >= 0))
    const destinoOscuro = oscuro ?? conEscena(p)
    // Entre dos vistas con escena el lienzo sigue vivo y solo el DOM cambia (View Transition).
    ir(to, { oscuro: destinoOscuro, directo, vt: conEscena(aqui) && conEscena(p) })
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
export function Tarjeta({ o, etq, nivel = 3, prioridad, className = '', recibe, sinHistoria, texto, medida, diferida }: { o: Obra; etq: string; nivel?: 2 | 3; prioridad?: boolean; className?: string; recibe?: boolean; sinHistoria?: boolean; texto?: string; medida?: Medida; diferida?: boolean }) {
  const Titulo = nivel === 2 ? 'h2' : 'h3'
  const marco = useRef<HTMLDivElement>(null)
  const { en3d } = usePlato()
  // `diferida`: la imagen se pide cuando la tarjeta está a 300 px de la ventana (el lazy nativo de un móvil lento carga hasta 2 500 px antes y compite con el LCP).
  const [ver, setVer] = useState(!diferida)
  useEffect(() => {
    if (ver || !marco.current) return
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setVer(true); io.disconnect() } }, { rootMargin: '300px 0px' })
    io.observe(marco.current)
    return () => io.disconnect()
  }, [ver])
  const alPulsar = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const img = marco.current?.querySelector('img')
    // Hacia una ficha 3D no vuela nada: allí la cámara entrando al set es la transición y la copia se quedaría congelada en pantalla.
    if (marco.current && img && !(en3d && indiceDe(o.slug) >= 0)) despegar(o.slug, marco.current, img)
    evento(ID, 'obra_open', { slug: o.slug })
  }
  return (
    <Enlace
      to={ruta('obra', o.slug)} onClick={alPulsar} directo className={`pl-tarjeta ${className}`} data-slug={o.slug}
      onPointerEnter={() => precargar([plShot(o.slug, o.views[0], 'mobile')])} onFocus={() => precargar([plShot(o.slug, o.views[0], 'mobile')])}
    >
      <div className="pl-tarjeta-marco" ref={marco} data-pl={recibe ? undefined : 'ventana'}>
        {ver && <PlShot slug={o.slug} vista={o.views[0]} vp="desktop" alt="" prioridad={prioridad} tarjeta />}
      </div>
      <p className="pl-etq">{etq}</p>
      <Titulo className="pl-tarjeta-t"><Letras texto={o.name} /><Flecha /></Titulo>
      {!sinHistoria && (texto || o.tagline) && <p className="pl-tarjeta-h">{texto || o.tagline}</p>}
      {!sinHistoria && medida && <p className="pl-tarjeta-m"><b>{medida.valor}</b><span className="pl-mono">{medida.etq}</span></p>}
    </Enlace>
  )
}
