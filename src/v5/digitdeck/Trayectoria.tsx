// Trayectoria: una lista cronológica, un cargo por fila (sin barras de solape: Q14), con el periodo en texto; las cifras del CV
// van atribuidas al cargo y al periodo. El título «CTO» vive solo en la línea «hoy»; los años 2024 y 2025 salen solo con el número (Q1).
import { useV5 } from '../data'
import { useCopy } from './copy'
import { Pagina } from './Pagina'
import { Contador, Titulo } from './piezas'

export default function Trayectoria() {
  const c = useCopy()
  const { trayectoria, eras, personal, strings, storeCount, locale } = useV5()
  const anios = Object.keys(eras).sort((a, b) => Number(b) - Number(a))
  const n = Number.parseInt(storeCount, 10)
  // Las cifras del registro vienen en formato inglés («10,000+», «$45k/yr»): en español se muestran con el formato es-CO, sin cambiar el valor.
  const cifra = (v: string) => (locale === 'es' ? v.replace(/(\d),(\d{3})/g, '$1.$2').replace('/yr', '/año') : v)
  return (
    <Pagina titulo={`${c.trayectoria.titulo} · ${c.marca}`}>
      <header className="dd-cabpag">
        <Titulo as="h1" className="dd-display" lineas={[c.trayectoria.titulo]} />
        <p className="dd-eyebrow" data-in>{c.trayectoria.hoy} · {strings.hero.eyebrow}</p>
        <p className="dd-lede" data-in>{strings.hero.location}</p>
        <div className="dd-trayectoria__cifra" data-in>
          <Contador hasta={n} sufijo="+" className="dd-figura" />
          <p>{c.trayectoria.tiendas}<span className="dd-micro"> · {strings.statSources.storefronts}</span></p>
        </div>
        <a className="dd-boton" data-in href={personal.cv} download>{c.trayectoria.cv}</a>
      </header>

      <section className="dd-seccion" aria-labelledby="dd-cargos-t">
        <Titulo id="dd-cargos-t" className="dd-h2" lineas={[c.trayectoria.cargos]} />
        <ol className="dd-cargos">
          {trayectoria.map((e) => (
            <li key={e.id} className="dd-cargo" data-in="fila">
              <p className="dd-cargo__periodo dd-micro">{e.period}</p>
              <div className="dd-cargo__cuerpo">
                <h3 className="dd-cargo__empresa">{e.company}</h3>
                <p className="dd-micro">{[e.title, e.location].filter(Boolean).join(' · ')}</p>
                <p>{e.summary}</p>
                {e.highlights.length > 0 && (
                  <ul className="dd-cargo__lista">
                    {e.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                {e.metrics.length > 0 && (
                  <dl className="dd-cargo__cifras">
                    {e.metrics.map((m) => (
                      <div key={m.label}>
                        <dt className="dd-micro">{m.label}</dt>
                        <dd>{cifra(m.value)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="dd-micro dd-cargo__stack">{c.trayectoria.stack}: {e.technologies.join(' · ')}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="dd-micro dd-nota-pie" data-in>{c.trayectoria.segunCv}</p>
      </section>

      <section className="dd-seccion" aria-labelledby="dd-anios-t">
        <Titulo id="dd-anios-t" className="dd-h2" lineas={[c.trayectoria.porAnio]} />
        <ol className="dd-anios">
          {anios.map((y) => (
            <li key={y} className="dd-anio" data-in="fila">
              <span className="dd-anio__n">{y}</span>
              {eras[y] && <span className="dd-anio__era">{eras[y]}</span>}
            </li>
          ))}
        </ol>
      </section>
    </Pagina>
  )
}
