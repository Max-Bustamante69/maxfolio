import { useId, useState } from 'react'
import { usePlato } from './contexto'
import { useVista } from './motion'
import { Enlace, Flecha, Rod, ruta } from './piezas'
import { partirFrase } from './publico'
import { Seo } from './seo'

/** Logros a la vista por cargo en pantallas estrechas; en escritorio se leen todos. */
const VISTOS = 4

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
            {abierto ? c.tray.menosLogros : c.tray.verLogros(b.length)} <span className="pl-mas-i pl-mas-i--s" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  )
}

export default function Trayectoria() {
  const { c, v } = usePlato()
  const { strings: s, personal } = v
  const ref = useVista<HTMLElement>([])
  const years = s.sections.years
  // De la época: la primera frase («De componentes React en 2022 a una flota de tiendas Shopify y la plataforma detrás»).
  const [apertura] = partirFrase(years.lead)

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="pl-vista pl-tray">
      <Seo ruta="/plato/trayectoria" titulo={`${c.tray.h1} · ${personal.name}`} descripcion={`${apertura}`.slice(0, 158)} />

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

      <section className="pl-tr-cierre" data-tono="claro" aria-label={c.revision}>
        <Enlace to={ruta('contacto') + '#agenda'} className="pl-pil pl-pil--osc pl-pil--grande"><Rod>{c.inicio.ctaCorto}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>
      </section>
    </main>
  )
}
