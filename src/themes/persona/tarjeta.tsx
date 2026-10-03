import { v5path, type Obra } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { ID, usePersona } from './contexto'
import { limpio } from './limpio'
import { Enlace } from './piezas'
import { guardarViaje } from './motion'

/** ¿Tiene captura real? Entonces va como tarjeta; si no, como fila del archivo (nunca un cuadro vacío con «sin captura»). */
export const conCaptura = (o: Obra) => o.views.includes('home')

/** Estado honesto de una tienda: «En vivo» o «En construcción» (los rótulos del vivo). Productos y proyectos no lo llevan. */
export function Estado({ o }: { o: Obra }) {
  const { v5 } = usePersona()
  if (o.kind !== 'store' || !o.status) return null
  return (
    <span className="pr-estado-obra" data-e={o.status}>
      {v5.strings.badges[o.status]}
    </span>
  )
}

/** Tarjeta de obra: la captura real, tipo y año, estado, nombre y la frase que dice qué hizo. Abre su ficha. */
export function Tarjeta({ o, prioridad = false, oculto = false }: { o: Obra; prioridad?: boolean; oculto?: boolean }) {
  const { c } = usePersona()
  const sub = limpio(o.tagline) || limpio(o.industry)
  return (
    <li data-pr-panel data-slug={o.slug} hidden={oculto}>
      <Enlace
        to={v5path(ID, 'obra', o.slug)}
        className="pr-tile"
        sinBarrido
        aria-label={c.obra.abrir.replace('{name}', o.name)}
        onClick={(e) => {
          const img = e.currentTarget.querySelector('img')
          if (img) guardarViaje(o.slug, img)
        }}
      >
        <div className="pr-tile__vista">
          <ShotImg slug={o.slug} vista="home" vp="desktop" alt="" className="pr-tile__img" prioridad={prioridad} />
        </div>
        <div className="pr-tile__cuerpo" aria-hidden="true">
          <p className="pr-tile__meta">
            <span>
              {c.obra.tipo[o.kind]} · {o.year}
            </span>
            <Estado o={o} />
          </p>
          <h3 className="pr-tile__nombre">{o.name}</h3>
          {sub && <p className="pr-tile__sub">{sub}</p>}
        </div>
      </Enlace>
    </li>
  )
}

/** Fila del archivo: lo que no tiene captura pública, con su historia en dos líneas. Un entregable de cargo abre su cargo. */
export function Fila({ o, oculto = false }: { o: Obra; oculto?: boolean }) {
  const { v5, c } = usePersona()
  const cargo = o.kind === 'role' ? v5.trayectoria.find((e) => e.id === o.employer) : undefined
  const to = cargo ? `${v5path(ID, 'trayectoria')}#cargo-${cargo.id}` : v5path(ID, 'obra', o.slug)
  // Un entregable de cargo cuenta lo que dice su cargo (título y resumen); una obra, su frase y su historia, sin repetirse.
  const frase = limpio(o.tagline) || limpio(o.industry)
  const larga = cargo ? limpio(cargo.summary) : limpio(o.description)
  const repetida = !!larga && !!frase && larga.toLowerCase().startsWith(frase.replace(/[.。]\s*$/, '').toLowerCase())
  const tag = cargo ? limpio(cargo.title ?? '') : repetida ? '' : frase
  const historia = larga
  const meta = cargo ? `${c.obra.tipo.role} · ${cargo.company} · ${o.year}` : `${c.obra.tipo[o.kind]} · ${o.year}`
  return (
    <li data-pr-panel data-slug={o.slug} hidden={oculto}>
      <Enlace to={to} className="pr-fila" aria-label={cargo ? c.obra.verCargo.replace('{name}', o.name) : c.obra.abrir.replace('{name}', o.name)}>
        <span className="pr-fila__meta">
          {meta}
          <Estado o={o} />
        </span>
        <span className="pr-fila__nombre">{o.name}</span>
        {tag && <span className="pr-fila__tag">{tag}</span>}
        {historia && <span className="pr-fila__historia">{historia}</span>}
        <span className="pr-fila__pila" aria-hidden="true">
          {o.stack.slice(0, 4).join(' · ')}
        </span>
        <span className="pr-fila__ir" aria-hidden="true">
          ›
        </span>
      </Enlace>
    </li>
  )
}
