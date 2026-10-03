// Trayectoria: los cinco años en una fila, un cargo por fila (sin barras de solape: Q14) con lo que se entregó y las cifras que
// dejó, y las habilidades por grupo. Las cifras salen del CV de Max y van atribuidas a su cargo y periodo. El título «CTO» vive en
// la línea «hoy» y en su cargo; todo viene de useV5().
import { useV5 } from '../data'
import { useCopy } from './copy'
import { Pagina } from './Pagina'
import { Titulo, Valor, enfasisFinal, formatoCifra } from './piezas'

export default function Trayectoria() {
  const c = useCopy()
  const { trayectoria, eras, personal, strings, habilidades, locale } = useV5()
  const anios = Object.keys(eras).sort((a, b) => Number(a) - Number(b))
  const x = strings.sections.experience
  const y = strings.sections.years
  const s = strings.sections.skills
  return (
    <Pagina titulo={`${c.trayectoria.titulo} · ${c.marca}`}>
      <header className="dd-cabpag">
        <Titulo as="h1" className="dd-display" lineas={[c.trayectoria.titulo]} />
        <p className="dd-eyebrow" data-in>{c.trayectoria.hoy} · {strings.hero.eyebrow}</p>
        <p className="dd-lede" data-in>{strings.hero.location}</p>
        <a className="dd-boton" data-in href={personal.cv} download>{c.trayectoria.cv}</a>
      </header>

      <section className="dd-seccion" aria-labelledby="dd-anios-t">
        <div className="dd-seccion__cab">
          <Titulo id="dd-anios-t" className="dd-h2" lineas={[y.title, enfasisFinal(y.titleAccent)]} />
          <p className="dd-lede" data-in>{y.lead}</p>
        </div>
        <ol className="dd-anios">
          {anios.map((a) => (
            <li key={a} className="dd-anio" data-in="fila">
              <span className="dd-anio__n">{a}</span>
              {eras[a] && <span className="dd-anio__era">{eras[a]}</span>}
            </li>
          ))}
        </ol>
      </section>

      <section className="dd-seccion" aria-labelledby="dd-cargos-t">
        <div className="dd-seccion__cab">
          <p className="dd-eyebrow" data-in>{x.eyebrow}</p>
          <Titulo id="dd-cargos-t" className="dd-h2" lineas={[x.title, enfasisFinal(x.titleAccent)]} />
        </div>
        <ol className="dd-cargos">
          {trayectoria.map((e) => (
            <li key={e.id} className="dd-cargo" data-in="fila">
              <p className="dd-cargo__periodo dd-micro">{e.period}</p>
              <div className="dd-cargo__cuerpo">
                <h3 className="dd-cargo__empresa">{e.company}</h3>
                <p className="dd-micro">{[e.title, e.location].filter(Boolean).join(' · ')}</p>
                <p className="dd-cargo__resumen">{e.summary}</p>
                {e.metrics.length > 0 && (
                  <dl className="dd-cargo__cifras">
                    {e.metrics.map((m) => (
                      <div key={m.label}>
                        <dt className="dd-micro">{m.label}</dt>
                        <dd><Valor v={formatoCifra(m.value, locale)} /></dd>
                      </div>
                    ))}
                  </dl>
                )}
                {e.highlights.length > 0 && (
                  <div className="dd-cargo__logros">
                    <p className="dd-eyebrow">{c.trayectoria.queSeEntrego}</p>
                    <ul className="dd-cargo__lista">
                      {e.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <ul className="dd-etiquetas" aria-label={c.trayectoria.stack}>
                  {e.technologies.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <p className="dd-micro dd-nota-pie" data-in>{c.trayectoria.segunCv}</p>
      </section>

      <section className="dd-seccion" aria-labelledby="dd-skills-t">
        <div className="dd-seccion__cab">
          <p className="dd-eyebrow" data-in>{s.eyebrow}</p>
          <Titulo id="dd-skills-t" className="dd-h2" lineas={[s.title, enfasisFinal(s.titleAccent)]} />
        </div>
        <div className="dd-habilidades">
          {(Object.keys(habilidades) as (keyof typeof habilidades)[]).map((g) => (
            <section key={g} className="dd-habilidad" data-in="fila" aria-labelledby={`dd-hab-${g}`}>
              <div>
                <h3 id={`dd-hab-${g}`} className="dd-habilidad__t">{s.groups[g]}</h3>
                <p className="dd-micro">{s.groupNote[g]}</p>
              </div>
              <ul className="dd-etiquetas">
                {habilidades[g].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </Pagina>
  )
}
