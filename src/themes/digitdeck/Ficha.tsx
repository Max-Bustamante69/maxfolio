// Ficha de una obra: la captura viaja desde el índice (elemento compartido), nombre con su punto, la historia del caso (qué se pidió,
// qué se hizo), los hechos reales en grande y los datos con fecha y fuente. Nada se mide aquí: todo sale de useV5() y datosDe().
import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { datosDe, useV5, v5path, type Obra, type Vista } from '../data'
import { ShotImg, pieDeCaptura } from '../shared/ShotImg'
import { evento } from '../shared/contacto'
import { useCopy, type Copy } from './copy'
import { useObras } from './limpio'
import { Pagina, retorno } from './Pagina'
import { Titulo, Valor, formatoCifra } from './piezas'
import { Enlace } from './transicion'

const OBRA = v5path('digitdeck', 'obra')

function Dato({ k, children, nota }: { k: string; children: ReactNode; nota?: string }) {
  return (
    <div className="dd-dato">
      <dt className="dd-micro">{k}</dt>
      <dd>
        {children}
        {nota && <span className="dd-dato__nota dd-micro">{nota}</span>}
      </dd>
    </div>
  )
}

/** El cargo del CV dentro del que se hizo una obra de tipo «entregable» (un sitio, una migración): da su resumen, sus logros y sus cifras. */
function useCargo(o: Obra) {
  const { trayectoria } = useV5()
  return o.kind === 'role' && o.employer ? trayectoria.find((e) => e.id === o.employer) : undefined
}

/** Los hechos reales de la obra en grande: los del registro, las cifras de su cargo (si es un entregable) y, si la tienda tiene
 *  catálogo público medido, sus productos y colecciones. */
function Hechos({ o, c }: { o: Obra; c: Copy }) {
  const { locale } = useV5()
  const cargo = useCargo(o)
  const d = datosDe(o.slug)
  const cat = d.comercio
  const cifras = [
    ...o.facts.map((f) => ({ k: f.label, v: f.value, nota: undefined as string | undefined })),
    ...(cargo?.metrics ?? []).map((m) => ({ k: m.label, v: formatoCifra(m.value, locale), nota: undefined as string | undefined })),
    ...(cat ? [{ k: c.ficha.productosU, v: String(cat.products), nota: c.ficha.catalogoNota(cat.fecha) }] : []),
    ...(cat && cat.collections != null ? [{ k: c.ficha.coleccionesU, v: String(cat.collections), nota: undefined as string | undefined }] : []),
  ]
  if (!cifras.length) return null
  return (
    <div className="dd-hechos-bloque">
      <dl className="dd-hechos" aria-label={c.ficha.hechos}>
        {cifras.map((x) => (
          <div key={x.k} className="dd-hecho" data-largo={x.v.length > 6 ? 'largo' : 'corto'}>
            <dt className="dd-micro">{x.k}</dt>
            <dd><Valor v={x.v} /></dd>
            {x.nota && <span className="dd-micro dd-hecho__nota">{x.nota}</span>}
          </div>
        ))}
      </dl>
      {cargo && cargo.metrics.length > 0 && <p className="dd-micro">{c.ficha.cifrasCv(cargo.company, cargo.period)}</p>}
    </div>
  )
}

function Datos({ o, c }: { o: Obra; c: Copy }) {
  const { formatPeriod } = useV5()
  const lh = datosDe(o.slug).lighthouse
  return (
    <dl className="dd-datos">
      {o.industry && <Dato k={c.ficha.rubro}>{o.industry}</Dato>}
      {o.rolLabel && <Dato k={c.ficha.rol}>{o.rolLabel}</Dato>}
      <Dato k={c.ficha.periodo}>{o.period ? formatPeriod(o.period.start, o.period.end) : o.year}</Dato>
      {o.stack.length > 0 && <Dato k={c.ficha.pila}>{o.stack.join(' · ')}</Dato>}
      {lh && (
        <Dato k={c.ficha.lighthouse} nota={c.ficha.lhNota(lh.fecha)}>
          {([['lhMovil', lh.movil], ['lhEscritorio', lh.escritorio]] as const).map(([k, m]) => (
            <span key={k} className="dd-dato__linea dd-lh">
              <span>{c.ficha[k]}</span>
              <span>{c.ficha.rend} <b>{m.perf}</b></span>
              <span>{c.ficha.acc} <b>{m.a11y}</b></span>
              <span>{c.ficha.seo} <b>{m.seo}</b></span>
            </span>
          ))}
        </Dato>
      )}
    </dl>
  )
}

/** La historia del caso. The Gummy Box lleva la del vivo (el problema y el plan); las demás, el relato del registro. */
function Historia({ o, c }: { o: Obra; c: Copy }) {
  const { strings } = useV5()
  const cargo = useCargo(o)
  const caso = o.slug === 'the-gummy-box' ? strings.sections.featuredBuild.beats.slice(0, 2) : []
  const escalera = o.facts[0]?.value ?? ''
  if (!caso.length && !o.description && !cargo) return null
  return (
    <div className="dd-historia" data-in>
      <p className="dd-eyebrow">{c.ficha.historia}</p>
      {caso.length ? (
        <div className="dd-historia__casos">
          {caso.map((b) => (
            <div key={b.label} className="dd-historia__caso">
              <p className="dd-historia__etiqueta">{b.label}</p>
              <p className="dd-ficha__texto">{b.body.replace(/\{ladder\}/g, escalera)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="dd-ficha__texto">{o.description || cargo?.summary}</p>
      )}
      {cargo && cargo.highlights.length > 0 && (
        <ul className="dd-cargo__lista">
          {cargo.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FichaObra({ o, i, anterior, siguiente }: { o: Obra; i: number; anterior: Obra; siguiente: Obra }) {
  const c = useCopy()
  // Al dejar la ficha (la limpieza corre antes de que monte la página siguiente), el índice que se abra lleva su fila al centro.
  useLayoutEffect(
    () => () => {
      retorno.slug = o.slug
    },
    [o.slug],
  )
  const [vista, setVista] = useState<Vista>('home')
  const [cambio, setCambio] = useState(false) // el fundido de la captura solo al cambiar de vista, no en la llegada
  const hay = o.views.length > 0
  const v = o.views.includes(vista) ? vista : o.views[0]
  const nombreVista = (x: Vista) => (x === 'home' ? c.ficha.home : c.ficha.pdp)
  return (
    <Pagina titulo={`${o.name} · ${c.obra.titulo} · ${c.marca}`} className="dd-ficha">
      <header className="dd-ficha__cab">
        <p className="dd-eyebrow" data-in>
          <Enlace to={OBRA} etiqueta={c.nav.obra} className="dd-enlace">{c.ficha.volver}</Enlace>
          <span aria-hidden="true"> · </span>
          {`${c.obra.nombreDe(i + 1)} · ${c.obra.tipos[o.kind]} · ${o.year}`}
        </p>
        <Titulo as="h1" className="dd-display" lineas={[o.name]} />
        {o.tagline && <p className="dd-lede" data-in>{o.tagline}</p>}
        {o.link && (
          <a className="dd-boton" data-in href={o.link} target="_blank" rel="noopener noreferrer" onClick={() => evento('digitdeck', 'obra_open', { obra: o.slug })}>
            {c.ficha.visitar} <span aria-hidden="true">↗</span>
          </a>
        )}
      </header>

      {hay ? (
        <section className="dd-ficha__medios" aria-label={c.ficha.ficha}>
          {o.views.length > 1 && (
            <div className="dd-filtros" role="group" aria-label={c.ficha.vistas} data-in>
              {o.views.map((x) => (
                <button key={x} type="button" className="dd-chip" aria-pressed={v === x} onClick={() => (setVista(x), setCambio(true))}>{nombreVista(x)}</button>
              ))}
            </div>
          )}
          <div className="dd-ficha__par">
            <figure className="dd-ficha__fig">
              <div className="dd-ficha__ventana" data-dd-compartido="" data-cambio={cambio || undefined} style={{ backgroundImage: `url(/v5/digitdeck/mini/${o.slug}.webp)` }}>
                <ShotImg key={v} slug={o.slug} vista={v} vp="desktop" alt={`${o.name} · ${nombreVista(v)} · ${c.ficha.escritorio}`} prioridad decoding="sync" />
              </div>
              <figcaption className="dd-micro" data-in>{pieDeCaptura(o.name, v, 'desktop')}</figcaption>
            </figure>
            <figure className="dd-ficha__fig dd-ficha__fig--movil">
              <div className="dd-ficha__ventana dd-ficha__ventana--movil" data-cambio={cambio || undefined} data-in>
                <ShotImg key={v} slug={o.slug} vista={v} vp="mobile" alt={`${o.name} · ${nombreVista(v)} · ${c.ficha.movil}`} />
              </div>
              <figcaption className="dd-micro" data-in>{pieDeCaptura(o.name, v, 'mobile')}</figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      <section className="dd-ficha__cuerpo">
        <Historia o={o} c={c} />
        <div className="dd-ficha__lado" data-in>
          <Hechos o={o} c={c} />
          <Datos o={o} c={c} />
        </div>
      </section>

      <nav className="dd-ficha__sig" aria-label={c.ficha.ficha} data-in>
        {([[anterior, c.ficha.anterior], [siguiente, c.ficha.siguiente]] as const).map(([x, k]) => (
          <Enlace key={k} to={v5path('digitdeck', 'obra', x.slug)} etiqueta={x.name} className="dd-sig">
            <span className="dd-micro">{k}</span>
            <span className="dd-sig__nombre">{x.name}</span>
          </Enlace>
        ))}
      </nav>
    </Pagina>
  )
}

export default function Ficha() {
  const c = useCopy()
  const { slug = '' } = useParams()
  const obras = useObras()
  const i = obras.findIndex((o) => o.slug === slug)
  if (i < 0)
    return (
      <Pagina titulo={`${c.ficha.noExiste} · ${c.marca}`}>
        <header className="dd-cabpag">
          <Titulo as="h1" className="dd-display" lineas={[c.ficha.noExiste]} />
          <Enlace to={OBRA} etiqueta={c.nav.obra} className="dd-boton" data-in>{c.ficha.ver}</Enlace>
        </header>
      </Pagina>
    )
  return <FichaObra key={slug} o={obras[i]} i={i} anterior={obras[(i - 1 + obras.length) % obras.length]} siguiente={obras[(i + 1) % obras.length]} />
}
