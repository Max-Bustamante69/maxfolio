// Ficha de una obra: la captura viaja desde el índice (elemento compartido), nombre con su punto, datos con fecha y fuente.
import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { datosDe, useV5, v5path, type Obra, type Vista } from '../data'
import { ShotImg, pieDeCaptura } from '../shared/ShotImg'
import { evento } from '../shared/contacto'
import { useCopy, type Copy } from './copy'
import { Pagina, retorno } from './Pagina'
import { Titulo } from './piezas'
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

function Datos({ o, c }: { o: Obra; c: Copy }) {
  const { formatPeriod } = useV5()
  const d = datosDe(o.slug)
  const lh = d.lighthouse
  return (
    <dl className="dd-datos">
      {o.industry && <Dato k={c.ficha.rubro}>{o.industry}</Dato>}
      {o.rolLabel && <Dato k={c.ficha.rol}>{o.rolLabel}</Dato>}
      <Dato k={c.ficha.periodo}>{o.period ? formatPeriod(o.period.start, o.period.end) : o.year}</Dato>
      {o.stack.length > 0 && <Dato k={c.ficha.pila}>{o.stack.join(' · ')}</Dato>}
      {o.facts.length > 0 && (
        <Dato k={c.ficha.hechos}>
          {o.facts.map((f) => (
            <span key={f.label} className="dd-dato__linea">{f.label}: {f.value}</span>
          ))}
        </Dato>
      )}
      {d.git && <Dato k={c.ficha.repo} nota={c.ficha.repoNota(d.git.fecha)}>{c.ficha.repoValor(d.git.commits, d.git.sections)}</Dato>}
      {d.comercio && <Dato k={c.ficha.catalogo} nota={c.ficha.catalogoNota(d.comercio.fecha)}>{c.ficha.catalogoValor(d.comercio.products, d.comercio.collections)}</Dato>}
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
          {`Nº ${String(i + 1).padStart(2, '0')} · ${c.obra.tipos[o.kind]} · ${o.year}`}
        </p>
        <Titulo as="h1" className="dd-display" lineas={[o.name]} />
        <p className="dd-lede" data-in>{o.tagline}</p>
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
      ) : (
        <p className="dd-micro dd-ficha__sin" data-in>{c.obra.sinCaptura}</p>
      )}

      <section className="dd-ficha__cuerpo">
        {o.description && <p className="dd-ficha__texto" data-in>{o.description}</p>}
        <div data-in>
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
  const { obras } = useV5()
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
