import { useRef, type CSSProperties, type MouseEvent, type RefObject } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { altoDe, escalaDe, esFina, hex, pielDe, reglaDe, ventanaX, zoomDe, type Recorte, type RolId } from './datos'
import { gsap, marcarVuelo, useGsap } from './motion'
import { conParam, useL } from './ui'

// La tira de una pieza: el recorte real de esa pieza en cada tienda, con su cota (alto medido) y su piel medida.
// Estados: «natural» (las piezas descansan sobre una línea, cada una con su alto) y «alineado» (cuelgan de la misma línea,
// con una regla de cotas). El paso de uno a otro es un BARRIDO: una raya vertical cruza la tira de izquierda a derecha y cada
// tile encaja en la línea común cuando la raya lo alcanza (transición CSS de `translate` con un asentamiento de unos píxeles).
// Las piezas finas se enseñan a 1:1,25 en una ventana de doble ancho; FAQ y pie, al doble de ancho (ver datos.ts).

type Vars = CSSProperties & Record<`--${string}`, string | number>

/** Velocidad de la raya del barrido en px por ms: la misma fija el retraso de cada tile, así encajan al paso de la raya. */
const VEL = 1.8

export const useNombreDe = () => {
  const { v5 } = useL()
  return (slug: string) => v5.obra(slug)?.name ?? slug
}

/** Recorte (imagen) de una pieza en el viewport activo. Las piezas finas se enseñan a 1:1 recortadas por el centro. */
export function Recorte1({ r, movil, tienda, pieza, prioridad }: { r: Recorte; movil: boolean; tienda: string; pieza: string; prioridad?: boolean }) {
  const { c } = useL()
  const v = movil && r.m ? r.m : r.d!
  const src = `/v5/l/${movil && r.m ? 'm' : 'd'}/${r.slug}-${r.rol}.webp`
  return (
    <img
      src={src}
      width={v.imgW}
      height={v.imgH}
      alt={c.tira.alt(pieza, tienda, v.h)}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
    />
  )
}

/** Líneas de piel medida de una tienda: fuentes de titulares y cuerpo, y el fondo leído del CSS. */
export function Piel({ slug }: { slug: string }) {
  const { c } = useL()
  const p = pielDe(slug)
  if (!p) return null
  const fuentes = p.titulares === p.cuerpo ? p.titulares : `${p.titulares} · ${p.cuerpo}`
  return (
    <>
      <span className="l-mono l-t">{fuentes}</span>
      <span className="l-mono l-t l-sw-l">
        <i className={p.fondo ? 'l-sw' : 'l-sw l-sw-none'} style={p.fondo ? { background: hex(p.fondo) } : undefined} />
        {p.fondo ? `${c.tira.fondo} ${hex(p.fondo)}` : c.tira.sinFondo}
      </span>
    </>
  )
}

export const claveDe = (r: Recorte, c: ReturnType<typeof useL>['c']) => (r.isla ? c.tira.isla(r.isla) : c.tira.seccion(r.clave))

interface TiraProps {
  rol: RolId
  items: Recorte[]
  alineado: boolean
  expandido?: boolean
  /** Primera imagen: carga con prioridad si está a la vista al abrir. */
  prioridad?: boolean
  scrollRef?: RefObject<HTMLDivElement | null>
}

export function Tira({ rol, items, alineado, expandido = false, prioridad = false, scrollRef }: TiraProps) {
  const { c, movil, tw } = useL()
  const loc = useLocation()
  const nombreDe = useNombreDe()
  const fina = esFina(rol)
  const propio = useRef<HTMLDivElement>(null)
  const scroll = scrollRef ?? propio
  const placa = useRef<HTMLDivElement>(null)
  const ya = useRef(alineado)
  const pieza = c.piezas[rol].nombre
  const verHref = (r: Recorte) => ({ pathname: loc.pathname, search: conParam(loc.search, 'ver', `${r.rol}.${r.slug}`) })

  const altos = items.map((r) => altoDe(r, movil))
  const maxh = Math.max(0, ...altos)
  const s = escalaDe(rol, tw, expandido)
  const ancho = tw * zoomDe(rol, expandido)
  const paso = ancho + 16

  // El barrido: al alinear, una raya vertical cruza la tira a la velocidad que fija el retraso de cada tile.
  useGsap(
    placa,
    (el) => {
      const antes = ya.current
      ya.current = alineado
      const raya = el.querySelector<HTMLElement>('.l-datum')
      const tiles = el.querySelectorAll<HTMLElement>('.l-tile')
      if (!alineado || antes || !raya || tiles.length < 1) return
      const fin = tiles[tiles.length - 1].offsetLeft + 12
      const dur = fin / VEL / 1000
      const tl = gsap.timeline()
      tl.fromTo(raya, { x: 0, opacity: 1 }, { x: fin, duration: dur, ease: 'none' })
      tl.to(raya, { opacity: 0, duration: 0.28, ease: 'power2.out' })
    },
    [alineado],
  )

  if (movil) return <PilaMovil rol={rol} items={items} verHref={verHref} nombreDe={nombreDe} fina={fina} prioridad={prioridad} />

  const regla = reglaDe(maxh, s)
  const vars: Vars = { '--maxh': maxh, '--rmax': regla.max, '--s': s, '--z': zoomDe(rol, expandido) }

  return (
    <div className="l-plate" ref={placa} data-alineado={alineado} data-expandido={expandido} data-fina={fina} style={vars}>
      <div className="l-ruler" aria-hidden="true">
        <span className="l-spine" />
        {regla.menores.map((v) => (
          <i key={`m${v}`} style={{ '--v': v } as Vars} />
        ))}
        {regla.mayores.map((v) => (
          <i key={`M${v}`} className="l-mj" style={{ '--v': v } as Vars} />
        ))}
        {regla.mayores.map((v) => (
          <em key={`e${v}`} style={{ '--v': v } as Vars}>
            {v}
          </em>
        ))}
        <b>px</b>
      </div>
      <div className="l-scroll" ref={scroll}>
        <span className="l-datum" aria-hidden="true" />
        <ul className="l-strip" aria-label={pieza}>
          {items.map((r, i) => {
            const h = altos[i]
            const v = r.d!
            const nombre = nombreDe(r.slug)
            const li: Vars = { '--h': h, '--i': i, '--dl': `${Math.round((i * paso) / VEL)}ms`, ...(fina ? { '--x0': ventanaX(r, ancho / s) } : {}) }
            return (
              <li key={r.slug} className="l-tile" style={li} data-rv>
                <Link className="l-tl" to={verHref(r)} data-tile={`${r.rol}.${r.slug}`} aria-label={`${nombre}, ${pieza}, ${h} px`} onClick={recordar}>
                  <span className="l-top">
                    <span className="l-dim" aria-hidden="true" />
                    <span className="l-leader" aria-hidden="true" />
                    <span className="l-pic" data-vuelo={`${r.rol}.${r.slug}`}>
                      <Recorte1 r={r} movil={false} tienda={nombre} pieza={pieza} prioridad={prioridad && i < 4} />
                    </span>
                    <b className="l-cota" aria-hidden="true">
                      {v.h} {c.tira.alto}
                    </b>
                  </span>
                  <span className="l-cap">
                    <span className="l-nm">{nombre}</span>
                    <span className="l-mono l-t">{fina ? `${r.clave} · ${v.h} ${c.tira.alto}` : claveDe(r, c)}</span>
                    {!fina && <Piel slug={r.slug} />}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** Pila vertical de teléfono: «bajar y comparar». Cada tienda es una fila con su cota a la izquierda y la piel debajo. */
function PilaMovil({ rol, items, verHref, nombreDe, fina, prioridad }: { rol: RolId; items: Recorte[]; verHref: (r: Recorte) => { pathname: string; search: string }; nombreDe: (s: string) => string; fina: boolean; prioridad: boolean }) {
  const { c } = useL()
  const pieza = c.piezas[rol].nombre
  return (
    <ul className="l-stack" aria-label={pieza} data-fina={fina}>
      {items.map((r, i) => {
        const v = r.m ?? r.d!
        const nombre = nombreDe(r.slug)
        const to = verHref(r)
        return (
          <li key={r.slug} className="l-mrow" style={{ '--h': v.h, '--i': i } as Vars} data-rv>
            <Link className="l-tl" to={to} data-tile={`${r.rol}.${r.slug}`} aria-label={`${nombre}, ${pieza}, ${v.h} px`} onClick={recordar}>
              <span className="l-mtop">
                <span className="l-dim" aria-hidden="true" />
                <span className="l-pic" data-vuelo={`${r.rol}.${r.slug}`}>
                  <Recorte1 r={r} movil tienda={nombre} pieza={pieza} prioridad={prioridad && i < 2} />
                </span>
              </span>
              <span className="l-mcap">
                <b className="l-big">
                  {v.h}
                  <small>{c.tira.alto.toUpperCase()}</small>
                </b>
                <span className="l-nm">{nombre}</span>
                <span className="l-mono l-t">{fina ? r.clave : claveDe(r, c)}</span>
                {!fina && <Piel slug={r.slug} />}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Clic en un tile: se recuerda el rectángulo de su imagen para que el visor la recoja (elemento compartido tile → visor). */
const recordar = (e: MouseEvent<HTMLAnchorElement>) => marcarVuelo(e.currentTarget.querySelector('.l-pic'))
