import { useId, useRef, type MouseEvent } from 'react'
import { useV5 } from '../data'
import { useCopy } from './copy'
import { Panel, useDespliegue } from './Libro'
import { useEntrada } from './movimiento'
import { Cabeza, Chevron, Flecha, Linea } from './piezas'
import { evento } from '../shared/contacto'

type Cargo = ReturnType<typeof useV5>['trayectoria'][number]

function FilaCargo({ e, abierto, alTocar, animar }: { e: Cargo; abierto: boolean; alTocar: (ev: MouseEvent<HTMLButtonElement>) => void; animar: boolean }) {
  const c = useCopy().roles
  const { obras } = useV5()
  const id = useId()
  const entregables = obras.filter((o) => o.kind === 'role' && o.employer === e.id)
  return (
    <li className="a-item" data-a-flip data-abierta={abierto || undefined}>
      {abierto && <span className="a-tinta" aria-hidden="true" />}
      <button type="button" className="a-fila a-fila-cargo" aria-expanded={abierto} aria-controls={abierto ? id : undefined} onClick={alTocar}>
        <span className="a-periodo a-sec">{e.period}</span>
        <span className="a-nom"><span className="a-nom-txt">{e.company}</span></span>
        <span className="a-meta">
          {e.title && <span className="a-titulo-cargo">{e.title}</span>}
          <span className="a-resumen">{e.summary}</span>
        </span>
        <Chevron />
      </button>
      {abierto && (
        <Panel id={id} etiqueta={e.company} animar={animar} clase="a-panel-cargo">
          <div className="a-panel-izq">
            <ul className="a-vinetas">{e.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
          <div className="a-panel-der">
            {e.metrics.length > 0 && (
              <dl className="a-datos">
                {e.metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd>{m.value}<small>{c.segunCv(e.period)}</small></dd>
                  </div>
                ))}
              </dl>
            )}
            {entregables.length > 0 && (
              <div className="a-entregables">
                <p className="a-sec">{c.entregables}</p>
                <ul>{entregables.map((o) => <li key={o.slug}>{o.name}</li>)}</ul>
              </div>
            )}
          </div>
        </Panel>
      )}
      <span className="a-regla" aria-hidden="true" />
    </li>
  )
}

/** Trayectoria: «el libro de roles». La misma gramática de fila que la obra, un cargo por fila, del más reciente al más viejo. */
export default function Roles() {
  const c = useCopy()
  const { trayectoria, eras, personal, strings } = useV5()
  const raiz = useRef<HTMLElement>(null)
  useEntrada(raiz)
  const { abiertas, alternar, animar } = useDespliegue()
  const cargos = [...trayectoria].sort((a, b) => b.start.localeCompare(a.start))
  const anios = [...new Set(cargos.map((e) => e.start.slice(0, 4)))]
  return (
    <main id="contenido" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${c.roles.h1} · ${personal.name}`} />
      <div className="a-pag">
        <header className="a-vista-cab">
          <h1 className="a-h1"><Linea>{c.roles.h1}</Linea></h1>
          <p className="a-lead" data-a="entra"><span className="a-sec">{c.roles.hoy}</span><br />{strings.hero.eyebrow}</p>
        </header>
        <section className="a-libro" aria-label={c.roles.h1}>
          {anios.map((y) => (
            <div className="a-grupo-anio" key={y}>
              <div className="a-anio a-sec" data-a-flip>
                <h2>
                  <b>{y}</b>
                  {eras[y] && <span>{eras[y]}</span>}
                </h2>
              </div>
              <ol className="a-lista">
                {cargos.filter((e) => e.start.startsWith(y)).map((e) => (
                  <FilaCargo key={e.id} e={e} abierto={abiertas.has(e.id)} animar={animar.current} alTocar={(ev) => alternar(e.id, ev, () => evento('a', 'obra_open', { slug: e.id, via: 'cargo' }))} />
                ))}
              </ol>
            </div>
          ))}
        </section>
        <p className="a-mas" data-a="entra">
          <a className="a-boton" href={personal.cv} target="_blank" rel="noopener noreferrer" onClick={() => evento('a', 'contact_click', { canal: 'cv' })}>{strings.hero.ctaCv}<Flecha tipo="abajo" /></a>
        </p>
      </div>
    </main>
  )
}
