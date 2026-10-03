import { useEffect, useId, useState } from 'react'
import { sinPuntoFinal } from '../data'
import type { SkillGroupId } from '../../data/registry'
import { usePlato } from './contexto'
import { useVista } from './motion'
import { Enlace, Flecha, Rod, ruta } from './piezas'
import { partirFrase } from './publico'

const GRUPOS: SkillGroupId[] = ['shopify', 'frontend', 'backend', 'quality', 'cro', 'ai']
/** Logros a la vista por cargo en pantallas estrechas; en escritorio se leen todos. */
const VISTOS = 3

function Logros({ logros }: { logros: string[] }) {
  const { c } = usePlato()
  const [abierto, setAbierto] = useState(false)
  const id = useId()
  const a = logros.slice(0, VISTOS)
  const b = logros.slice(VISTOS)
  return (
    <div className="pl-logros-caja" data-abierto={abierto}>
      <ul className="pl-logros" data-pl="grupo">{a.map((l) => <li key={l}>{l}</li>)}</ul>
      {b.length > 0 && (
        <>
          <div id={id} className="pl-logros-mas">
            <div className="pl-logros-in"><ul className="pl-logros">{b.map((l) => <li key={l}>{l}</li>)}</ul></div>
          </div>
          <button type="button" className="pl-enlace-mono pl-logros-b" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto(!abierto)}>
            {abierto ? c.tray.menosLogros : c.tray.verLogros(logros.length)} <span className="pl-mas-i pl-mas-i--s" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  )
}

/** Un grupo de habilidades: en escritorio abierto y sin botón; en móvil plegado (los seis grupos juntos eran 1.700 px de etiquetas). */
function Grupo({ id, titulo, nota, items }: { id: string; titulo: string; nota: string; items: readonly string[] }) {
  const [ancho, setAncho] = useState(() => typeof matchMedia === 'function' && matchMedia('(min-width: 900px)').matches)
  const [abierto, setAbierto] = useState(ancho)
  const cuerpo = useId()
  useEffect(() => {
    const mq = matchMedia('(min-width: 900px)')
    const f = () => { setAncho(mq.matches); setAbierto(mq.matches) }
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  return (
    <div className="pl-hab-g" data-abierto={abierto} data-grupo={id}>
      <span className="pl-hab-linea" data-pl="trazo" aria-hidden="true" />
      <h3 className="pl-hab-t">
        {ancho ? <span>{titulo}</span> : (
          <button type="button" className="pl-hab-b" aria-expanded={abierto} aria-controls={cuerpo} onClick={() => setAbierto(!abierto)}>
            <span>{titulo}</span><span className="pl-mas-i pl-mas-i--s" aria-hidden="true" />
          </button>
        )}
      </h3>
      <div id={cuerpo} className="pl-hab-cuerpo" inert={!abierto}>
        <div className="pl-hab-in">
          <p className="pl-hab-n">{nota}</p>
          <ul className="pl-fichas">{items.map((x) => <li key={x} className="pl-ficha-tag">{x}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}

export default function Trayectoria() {
  const { c, v } = usePlato()
  const { strings: s, personal } = v
  const ref = useVista<HTMLElement>([])
  const anios = Object.entries(v.eras).filter(([, e]) => e)
  const hab = s.sections.skills
  const years = s.sections.years
  // De la época: la primera frase («De componentes React en 2022 a una flota de tiendas Shopify y la plataforma detrás»).
  const [apertura] = partirFrase(years.lead)

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="pl-vista pl-tray">
      <title>{`${c.tray.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="pl-tr-cab" data-tono="claro">
        <h1 className="pl-h-xl" data-pl="linea">{c.tray.h1}</h1>
        <div className="pl-tr-cab-fila">
          <p className="pl-lista-lead" data-pl="subir" data-pl-retraso="0.15">{apertura}</p>
          <a className="pl-pil pl-pil--osc" href={personal.cv} download data-pl="subir" data-pl-retraso="0.25"><Rod>{c.cv}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></a>
        </div>
      </section>

      <section className="pl-roles" data-tono="claro" aria-label={c.tray.cargo}>
        {v.trayectoria.map((r) => {
          const obras = v.obras.filter((o) => o.employer === r.id)
          return (
            <article key={r.id} id={r.id} className="pl-rol">
              <span className="pl-rol-linea" data-pl="trazo" aria-hidden="true" />
              <div className="pl-rol-tiempo">
                <p className="pl-mono pl-rol-periodo">{r.period}</p>
                <p className="pl-mono pl-rol-lugar">{r.location}</p>
                {!r.end && <p className="pl-mono pl-rol-hoy"><i aria-hidden="true" />{c.tray.hoy}</p>}
              </div>
              <div className="pl-rol-cuerpo">
                <h2 className="pl-rol-cargo" data-pl="linea"><span>{r.title}</span> <em>{r.company}</em></h2>
                <p className="pl-rol-resumen" data-pl="subir">{r.summary}</p>
                <p className="pl-mono pl-kicker pl-kicker--claro pl-rol-k">{c.tray.logros}</p>
                <Logros logros={r.highlights} />
                <p className="pl-mono pl-rol-stack">{r.technologies.join(' · ')}</p>
                <div className="pl-rol-enlaces">
                  {r.website && !/digitdeck\.co/i.test(r.website) && <a className="pl-enlace-mono pl-rol-visitar" href={r.website} target="_blank" rel="noopener noreferrer">{c.tray.visitar} <Flecha /></a>}
                  {(obras.length > 0 || r.id === 'digitdeck-cto') && <Enlace className="pl-enlace-mono" to={obras.length === 1 ? ruta('obra', obras[0].slug) : ruta('obra')}>{c.tray.verObra} <Flecha /></Enlace>}
                </div>
              </div>
              <dl className="pl-rol-metricas" data-pl="grupo">
                {r.metrics.map((m) => (
                  <div key={m.label}><dd>{m.value}</dd><dt className="pl-mono">{m.label}</dt></div>
                ))}
              </dl>
            </article>
          )
        })}
      </section>

      <section className="pl-anios" data-tono="oscuro" aria-labelledby="pl-anios-t">
        <div className="pl-anios-cab">
          <h2 id="pl-anios-t" className="pl-h-l pl-h-l--osc" data-pl="linea">{years.title} <em>{sinPuntoFinal(years.titleAccent)}</em></h2>
        </div>
        <ol className="pl-anios-l" data-pl="grupo">
          {anios.map(([y, e]) => (
            <li key={y}><span className="pl-anio-y">{y}</span><span className="pl-anio-e">{e}</span></li>
          ))}
        </ol>
      </section>

      <section className="pl-hab" data-tono="claro" aria-labelledby="pl-hab-t">
        <div className="pl-hab-cab">
          <h2 id="pl-hab-t" className="pl-h-l" data-pl="linea">{hab.title} <em>{sinPuntoFinal(hab.titleAccent)}</em></h2>
          <p className="pl-lista-lead" data-pl="subir" data-pl-retraso="0.15">{hab.eyebrow}</p>
        </div>
        <div className="pl-hab-rej">
          {GRUPOS.map((g) => <Grupo key={g} id={g} titulo={hab.groups[g]} nota={hab.groupNote[g]} items={v.habilidades[g]} />)}
        </div>
      </section>
    </main>
  )
}
