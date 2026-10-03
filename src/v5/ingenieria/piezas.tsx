import { Fragment, memo, useRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { ShotImg } from '../shared/ShotImg'
import { evento } from '../shared/contacto'
import { shot, v5path, type Obra, type Vista } from '../data'
import { vistaDe } from './casos'
import { useCopy } from './copy'
import { despegar, useIr } from './motion'

const precargadas = new Set<string>()
/** Calienta la caché con las capturas que el siguiente destino va a pedir (al pasar el puntero o enfocar). */
export function precargar(urls: string[]) {
  urls.forEach((u) => {
    if (precargadas.has(u)) return
    precargadas.add(u)
    new Image().src = u
  })
}
export const capturasDeObra = (obras: Obra[], n = 6) => obras.filter((o) => o.views.length).slice(0, n).map((o) => shot(o.slug, vistaDe(o), 'desktop'))

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

/** Flecha de 1,6 px de trazo (ninguna de las tres fuentes trae → ni ↗). */
export const Flecha = ({ atras }: { atras?: boolean }) => (
  <svg className={atras ? 'ing-flecha ing-flecha-atras' : 'ing-flecha'} viewBox="0 0 12 10" width="12" height="10" aria-hidden="true">
    <path d="M0 5h10.5M6.5 1 10.5 5 6.5 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Cabecera de sección: etiqueta mono, titular de dos tonos (tinta + segunda frase atenuada, dentro del mismo titular) y, a la derecha, el párrafo de apoyo. */
export function Cabecera({ id, etq, titulo, acento, texto, nivel = 2, anim = 'linea', children }: { id: string; etq?: string; titulo: string; acento?: string; texto?: ReactNode; nivel?: 1 | 2 | 3; anim?: 'linea' | 'titular'; children?: ReactNode }) {
  const H = (nivel === 1 ? 'h1' : nivel === 2 ? 'h2' : 'h3') as 'h1' | 'h2' | 'h3'
  return (
    <header className="ing-cab">
      <div className="ing-cab-t">
        {etq && <p className="ing-etq" data-ing="subir">{etq}</p>}
        <H id={id} className={nivel === 1 ? 'ing-h1' : 'ing-h2'} data-ing={anim}>
          <span>{titulo}</span>{acento && <> <em>{acento}</em></>}
        </H>
      </div>
      {texto && <div className="ing-cab-p" data-ing="subir" data-ing-retraso="0.12">{texto}</div>}
      {children}
    </header>
  )
}

/* ------------------------------------------------------------------ la cinta: cientos de hebras de 1 px */

const ANCHO = 1200
const ALTO = 600
interface Hebra { d: string; o: number }
interface Capa { N: number; c0: number; cs: number; cf: number; cph: number; w0: number; w1: number; wf: number; wph: number; wm: number; wmf: number; wmph: number; op0: number; op1: number; mix: number }
/** Dos cintas satinadas hechas de líneas de 1 px que se retuercen y casi se cierran: se calculan una vez, son SVG quieto. */
const CAPAS: Capa[] = [
  { N: 46, c0: 300, cs: 110, cf: 55, cph: 1.6, w0: 20, w1: 120, wf: 3.4, wph: 2.2, wm: 0.6, wmf: 2.6, wmph: 0.3, op0: 0.12, op1: 0.5, mix: 0.12 },
  { N: 84, c0: 330, cs: 150, cf: 70, cph: 0.4, w0: 30, w1: 190, wf: 4.2, wph: 0.7, wm: 0.55, wmf: 2.1, wmph: 1.2, op0: 0.22, op1: 0.7, mix: 0.09 },
]
let hebras: Hebra[][] | null = null
function calcular(): Hebra[][] {
  const P = 60
  return CAPAS.map((c) => Array.from({ length: c.N }, (_, i) => {
    const s = (i / (c.N - 1)) * 2 - 1
    let d = ''
    for (let k = 0; k <= P; k++) {
      const u = k / P
      const centro = c.c0 - c.cs * u + c.cf * Math.sin(u * 6.1 + c.cph)
      const ancho = c.w0 + c.w1 * Math.pow(Math.abs(Math.sin(u * c.wf + c.wph)), 0.8) * (c.wm + (1 - c.wm) * Math.sin(u * c.wmf + c.wmph))
      d += `${k ? 'L' : 'M'}${(u * ANCHO).toFixed(0)} ${(centro + ancho * (s + c.mix * Math.sin(5 * s + 7 * u))).toFixed(0)}`
    }
    return { d, o: c.op0 + c.op1 * Math.pow(1 - Math.abs(s), 1.3) }
  }))
}
const Degradado = ({ id, paradas }: { id: string; paradas: Array<[number, string, number?]> }) => (
  <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" x2={ANCHO} y1="0" y2="0">
    {paradas.map(([o, c, a]) => <stop key={o} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
  </linearGradient>
)
/** `usar`: dibuja las hebras de la cinta que ya está en la página (<use>), sin repetir sus 130 trazos en el DOM. */
export const Cinta = memo(function Cinta({ usar }: { usar?: boolean }) {
  hebras ??= calcular()
  return (
    <svg className="ing-cinta-svg" viewBox={`0 0 ${ANCHO} ${ALTO}`} fill="none" strokeWidth="1" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      {usar ? <use href="#ing-hebras" /> : (
        <>
          <defs>
            <Degradado id="ing-cg" paradas={[[0, '#536DFE', 0], [0.12, '#536DFE'], [0.36, '#00B8D4'], [0.58, '#3D5AFE'], [0.8, '#B39DDB'], [1, '#CFD8DC', 0]]} />
            <Degradado id="ing-cg2" paradas={[[0, '#B39DDB', 0], [0.2, '#B39DDB'], [0.45, '#8C9EFF'], [0.7, '#00B8D4'], [1, '#3D5AFE', 0]]} />
          </defs>
          <g id="ing-hebras">
            {hebras.map((capa, k) => (
              <g key={k} stroke={`url(#${k ? 'ing-cg' : 'ing-cg2'})`}>{capa.map((h, i) => <path key={i} d={h.d} opacity={h.o.toFixed(2)} />)}</g>
            ))}
          </g>
        </>
      )}
    </svg>
  )
})

/* ------------------------------------------------------------------ ventana de producto con la captura real */

/** Capturas reales apiladas en una pantalla: la activa se ve, las demás esperan. */
function Capturas({ slug, vistas, activa, vp, alt, prioridad }: { slug: string; vistas: Vista[]; activa: Vista; vp: 'desktop' | 'mobile'; alt: string; prioridad?: boolean }) {
  return vistas.map((v, i) => (
    <ShotImg key={v} slug={slug} vista={v} vp={vp} alt={v === activa ? alt : ''} aria-hidden={v === activa ? undefined : true} prioridad={prioridad && i === 0} className={v === activa ? 'ing-cap is-on' : 'ing-cap'} />
  ))
}

/** Un navegador de mentira (tres puntos y barra de dirección) con la captura de escritorio dentro. Las demás vistas esperan debajo. */
export function Ventana({ slug, vistas, activa = vistas[0], url, alt, prioridad, clase = '' }: { slug: string; vistas: Vista[]; activa?: Vista; url: string; alt: string; prioridad?: boolean; clase?: string }) {
  return (
    <div className={`ing-ventana ${clase}`}>
      <div className="ing-ventana-barra" aria-hidden="true">
        <i /><i /><i />
        <span className="ing-ventana-url">{url}</span>
      </div>
      <div className="ing-ventana-pantalla">
        <Capturas slug={slug} vistas={vistas} activa={activa} vp="desktop" alt={alt} prioridad={prioridad} />
      </div>
    </div>
  )
}

/** La captura móvil real dentro de un marco de línea fina. */
export function Movil({ slug, vistas, activa = vistas[0], alt }: { slug: string; vistas: Vista[]; activa?: Vista; alt: string }) {
  return (
    <div className="ing-movil">
      <div className="ing-movil-pantalla">
        <Capturas slug={slug} vistas={vistas} activa={activa} vp="mobile" alt={alt} />
      </div>
    </div>
  )
}

export function Segmentado<T extends string>({ valor, opciones, onCambio, etiqueta, clase = '' }: { valor: T; opciones: Array<[T, ReactNode]>; onCambio: (v: T) => void; etiqueta: string; clase?: string }) {
  return (
    <div className={`ing-seg ${clase}`} role="group" aria-label={etiqueta}>
      {opciones.map(([v, texto]) => (
        <button key={v} type="button" aria-pressed={v === valor} className="ing-seg-op" onClick={() => onCambio(v)}>{texto}</button>
      ))}
    </div>
  )
}

/** Texto con flechas dibujadas: ninguna de las tres fuentes trae «→», así que se parte y se dibuja (70→95+). */
export function Valor({ v }: { v: string }) {
  return (
    <>
      {v.split('→').map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <svg className="ing-flecha-n" viewBox="0 0 12 10" width="0.55em" height="0.46em" aria-hidden="true"><path d="M0 5h10.5M6.5 1 10.5 5 6.5 9" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          {p}
        </Fragment>
      ))}
    </>
  )
}

/**
 * El retrato de Max: sin foto, el monograma MB en serif de exhibición relleno con las mismas hebras de la cinta (<use> de la cinta
 * del pliegue, sin repetir sus 130 trazos). Las hebras corren por dentro de las letras con el scroll (ver Inicio).
 */
export function Retrato({ etiqueta }: { etiqueta: string }) {
  const letras = { fontFamily: 'var(--ing-serif)', fontSize: 380, fontWeight: 300, letterSpacing: '-0.012em' } as const
  return (
    <svg className="ing-retrato" viewBox="0 41 640 440" role="img" aria-label={etiqueta}>
      <defs>
        <clipPath id="ing-mb-letras"><text x="320" y="397" textAnchor="middle" style={letras}>MB</text></clipPath>
      </defs>
      <text className="ing-retrato-base" x="320" y="397" textAnchor="middle" style={letras} aria-hidden="true">MB</text>
      <g clipPath="url(#ing-mb-letras)">
        <g className="ing-retrato-hebras" fill="none" strokeWidth="1"><use href="#ing-hebras" transform="translate(-450 -270) scale(1.8)" /></g>
      </g>
      <text className="ing-retrato-contorno" x="320" y="397" textAnchor="middle" style={letras} aria-hidden="true">MB</text>
    </svg>
  )
}

/** «Construida» no se repite en cada tarjeta: solo se dice cuando la tienda NO es obra desde cero («Migrada», «Personalizada sobre Xclusive»). */
const etiquetaDe = (o: Obra, tipo: string) => (o.kind === 'store' ? (o.role === 'built' ? '' : o.rolLabel) : tipo)

/** Obra con captura: la imagen manda, el texto cuelga debajo. Al pulsarla, la captura cruza a la ficha (elemento compartido). */
export function Tarjeta({ o, resumen, prioridad, compacta, grande, compactaTexto }: { o: Obra; resumen?: string; prioridad?: boolean; compacta?: boolean; grande?: boolean; compactaTexto?: boolean }) {
  const c = useCopy()
  const marco = useRef<HTMLDivElement>(null)
  const vista = vistaDe(o)
  const alPulsar = (e: MouseEvent) => {
    evento('ingenieria', 'obra_open', { slug: o.slug })
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en otra pestaña no levanta la captura
    const img = marco.current?.querySelector('img')
    if (marco.current && img) despegar(o.slug, marco.current, img)
  }
  const aviso = () => precargar([shot(o.slug, vista, 'desktop'), shot(o.slug, vista, 'mobile')])
  return (
    <Enlace to={v5path('ingenieria', 'obra', o.slug)} onClick={alPulsar} onPointerEnter={aviso} onFocus={aviso} className={`ing-card${compacta ? ' ing-card-chica' : ''}${grande ? ' ing-card-grande' : ''}`} data-slug={o.slug}>
      <div className="ing-card-marco" ref={marco}>
        <ShotImg slug={o.slug} vista={vista} vp="desktop" alt="" prioridad={prioridad} />
      </div>
      <div className="ing-card-pie">
        <p className="ing-etq">{[o.industry, !compacta && etiquetaDe(o, c.kinds[o.kind])].filter(Boolean).join(' · ')}</p>
        <h3>{o.name}</h3>
        {!compacta && (resumen || o.tagline) && <p className="ing-card-t">{resumen || o.tagline}</p>}
        {!compacta && !compactaTexto && <span className="ing-card-ir">{c.obra.leer}<Flecha /></span>}
      </div>
    </Enlace>
  )
}
