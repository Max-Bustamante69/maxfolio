import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { v5path, type Obra } from '../data'
import { evento } from '../shared/contacto'
import { capturasDe, lodSrc, numerosDe } from './datos'
import { Linea } from './Linea'
import { usarVuelo } from './Lectura'
import { Registros } from './Reglas'
import { useC } from './useC'

const ANIOS = [2026, 2025, 2024, 2023, 2022]

/** Trayectoria: cada año es un tramo de la regla de la mesa (con su pin de lápiz); los cargos son calcos sobre ella y las tiendas del año
 *  cuelgan en un rollo con perforaciones. Mientras no se confirme cómo rotular el tipo de empleo (Q14) no se dibuja el solape de los
 *  cargos concurrentes: solo el periodo en texto. Una obra sin captura nunca pinta un recuadro vacío: va como etiqueta enlazada. */
export default function Trayectoria() {
  const { t, trayectoria, eras, obras, strings, personal } = useC()
  const nr = useMemo(() => numerosDe(obras), [obras])
  const tiendasDe = (y: number) => obras.filter((o) => o.kind === 'store' && o.year === y)
  return (
    <main id="contenido" tabIndex={-1} className="c-pagina c-tray">
      <title>{`${t.trayectoria.titulo} · ${personal.name}`}</title>
      <section className="c-calco c-hoja c-hoja--ancha" aria-labelledby="c-tray-h" data-c-calco>
        <span className="c-tab c-mono">{t.trayectoria.calco}</span>
        <Registros />
        <p className="c-eyebrow">{strings.hero.eyebrow}</p>
        <h1 id="c-tray-h" className="c-h1" data-c-h1>
          <Linea>{t.trayectoria.h1}</Linea>
        </h1>
        <p className="c-nota">{t.trayectoria.lead}</p>
      </section>

      <ol className="c-anios">
        {ANIOS.map((y) => {
          const cargos = trayectoria.filter((c) => Number(c.start.slice(0, 4)) === y)
          const obrasY = tiendasDe(y)
          const conCaptura = obrasY.filter((o) => capturasDe(o).length > 0)
          const sinCaptura = obrasY.filter((o) => capturasDe(o).length === 0)
          return (
            <li key={y} id={`anio-${y}`} className="c-anio">
              <h2 className="c-anio__h">
                <span className="c-anio__pin" aria-hidden="true" />
                <span className="c-anio__n c-mono">{y}</span>
                {eras[String(y)] && <span className="c-anio__era">{eras[String(y)]}</span>}
              </h2>
              <div className="c-anio__cuerpo">
                {cargos.map((c) => {
                  const entregables = obras.filter((o) => o.kind === 'role' && o.employer === c.id)
                  return (
                    <article key={c.id} className="c-cargo" aria-labelledby={`cargo-${c.id}`}>
                      <p className="c-mono c-cargo__per">{c.period}</p>
                      <h3 id={`cargo-${c.id}`} className="c-cargo__h">
                        {c.company}
                        {c.title && <span className="c-cargo__titulo"> · {c.title}</span>}
                      </h3>
                      <p className="c-meta">{c.location}</p>
                      <p className="c-cargo__resumen">{c.summary}</p>
                      {c.highlights.length > 0 && (
                        <ul className="c-cargo__lista">
                          {c.highlights.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      )}
                      {c.metrics.length > 0 && (
                        <>
                          <dl className="c-cargo__cifras">
                            {c.metrics.map((m) => (
                              <div key={m.label}>
                                <dd>{m.value}</dd>
                                <dt>{m.label}</dt>
                              </div>
                            ))}
                          </dl>
                          <p className="c-nota">{t.trayectoria.segunCv(c.period)}</p>
                        </>
                      )}
                      {entregables.length > 0 && (
                        <div className="c-cargo__entregables">
                          <p className="c-mono">{t.trayectoria.entregables}</p>
                          <ul className="c-tags">
                            {entregables.map((o) => (
                              <li key={o.slug}>{o.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  )
                })}
                <div className="c-colgantes">
                  <p className="c-mono c-colgantes__h">{t.trayectoria.tiendasDe(y)}</p>
                  {obrasY.length === 0 ? (
                    <p className="c-nota">{t.trayectoria.sinObra}</p>
                  ) : (
                    <>
                      {conCaptura.length > 0 && (
                        <div className="c-rollo">
                          <ul className="c-rollo__lista">
                            {conCaptura.map((o) => (
                              <Colgante key={o.slug} obra={o} nr={nr.get(o.slug) ?? ''} />
                            ))}
                          </ul>
                        </div>
                      )}
                      {sinCaptura.length > 0 && (
                        <ul className="c-tags c-tags--sin" aria-label={t.obra.sinCaptura}>
                          {sinCaptura.map((o) => (
                            <li key={o.slug}>
                              <Link to={v5path('c', 'obra', o.slug)} title={t.obra.sinCaptura}>
                                {o.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="c-tray__cierre">
        <Link className="c-btn c-btn--tinta" to={v5path('c', 'contacto')} onClick={() => evento('c', 'contact_click', { canal: 'cta-trayectoria' })}>
          {t.pedir}
        </Link>
        <p className="c-nota">{t.revisionNota}</p>
      </div>
    </main>
  )
}

/** Una tienda del año en el rollo: su captura de escritorio con el código de la tira. Lleva `data-vuelo` como la fila de la Lectura: vuela a su ficha. */
function Colgante({ obra, nr }: { obra: Obra; nr: string }) {
  const { t } = useC()
  const caps = capturasDe(obra)
  const c = caps.find((x) => x.vista === 'home' && x.vp === 'desktop') ?? caps.find((x) => x.vp === 'desktop') ?? caps[0]
  return (
    <li className="c-colgante">
      <Link to={v5path('c', 'obra', obra.slug)} {...usarVuelo(obra)}>
        <span className="c-colgante__img" data-vuelo={`${obra.slug}:${c.vista}-${c.vp}`}>
          <img src={lodSrc(0, obra.slug, c)} alt="" width={1200} height={750} loading="lazy" decoding="async" />
        </span>
        <span className="c-colgante__cod">
          <b className="c-mono">{t.ficha.numero(nr)}</b> {obra.name}
        </span>
      </Link>
    </li>
  )
}
