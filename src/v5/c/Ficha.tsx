import { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { datosDe, SHOT_DATE, v5path } from '../data'
import { capturasDe, hechoPublico, numerosDe, publico, stackPublico } from './datos'
import { Linea } from './Linea'
import { Lod } from './Lod'
import { Registros } from './Reglas'
import { usarVuelo } from './Lectura'
import { useC } from './useC'

/** Ficha de una obra: sus cuatro diapositivas en LOD 2 y, al lado, el calco con los datos. En una obra sin captura queda solo la ficha de datos. */
export default function Ficha() {
  const { slug = '' } = useParams()
  const { t, obras, obra, personal, formatPeriod } = useC()
  const navigate = useNavigate()
  const { state } = useLocation()
  const o = obra(slug)
  const desdeMesa = (state as { desde?: string } | null)?.desde === 'mesa'
  const atras = desdeMesa ? `${v5path('c')}?vista=mesa&obra=${slug}` : v5path('c', 'obra')
  const lista = useMemo(() => [...obras].sort((a, b) => b.year - a.year), [obras])
  const nr = useMemo(() => numerosDe(obras), [obras])
  const i = lista.findIndex((x) => x.slug === slug)
  const previa = i > 0 ? lista[i - 1] : undefined
  const siguiente = i >= 0 && i < lista.length - 1 ? lista[i + 1] : undefined

  // ← → van a la obra vecina del índice y Esc vuelve a donde se estaba (el índice o la mesa).
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)) return
      if (e.key === 'Escape') navigate(atras)
      else if (e.key === 'ArrowLeft' && previa) navigate(v5path('c', 'obra', previa.slug))
      else if (e.key === 'ArrowRight' && siguiente) navigate(v5path('c', 'obra', siguiente.slug))
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [atras, previa, siguiente, navigate])

  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} className="c-pagina">
        <title>{`${t.ficha.noExiste} · ${personal.name}`}</title>
        <section className="c-calco c-hoja" data-c-calco>
          <h1 className="c-h1" data-c-h1>
            <Linea>{t.ficha.noExiste}</Linea>
          </h1>
          <Link className="c-btn c-btn--tinta" to={v5path('c', 'obra')}>
            {t.ficha.volver}
          </Link>
        </section>
      </main>
    )
  }

  const caps = capturasDe(o)
  const d = datosDe(o.slug)
  const linea = publico(o.tagline)
  const texto = publico(o.description)
  const hechos = o.facts.filter(hechoPublico)
  return (
    <main id="contenido" tabIndex={-1} className="c-pagina c-ficha">
      <title>{`${o.name} · ${personal.name}`}</title>
      <nav className="c-ficha__nav" aria-label={t.ficha.navegacion}>
        <Link className="c-link" to={atras}>
          <span aria-hidden="true">←</span> {desdeMesa ? t.ficha.verMesa : t.ficha.volver}
        </Link>
        <span className="c-ficha__vecinas">
          {previa && (
            <Link className="c-link" to={v5path('c', 'obra', previa.slug)} rel="prev" {...usarVuelo(previa)}>
              {t.ficha.anterior}: {previa.name}
            </Link>
          )}
          {siguiente && (
            <Link className="c-link" to={v5path('c', 'obra', siguiente.slug)} rel="next" {...usarVuelo(siguiente)}>
              {t.ficha.siguiente}: {siguiente.name}
            </Link>
          )}
        </span>
      </nav>

      <div className={caps.length ? 'c-ficha__grid' : 'c-ficha__grid c-ficha__grid--sola'}>
        {caps.length > 0 && (
          <figure className="c-rail c-ficha__rail">
            <div className="c-ficha__slides">
              {caps.map((c, k) => (
                <span key={`${c.vista}-${c.vp}`} className={`c-marco c-marco--${c.vp} c-ficha__sd c-ficha__sd--${c.vista}-${c.vp}`} data-vuelo={`${o.slug}:${c.vista}-${c.vp}`} data-c-sd>
                  <Lod slug={o.slug} c={c} nivel={2} alt={t.capturaAlt(o.name, t.vistas[c.vista], t.vps[c.vp], SHOT_DATE)} prioridad={k === 0} />
                </span>
              ))}
            </div>
            <figcaption className="c-cod">
              <span>
                <b>{t.ficha.numero(nr.get(o.slug) ?? '')}</b> · {o.name}
              </span>
              <span>{SHOT_DATE}</span>
            </figcaption>
          </figure>
        )}

        <article className="c-calco c-ficha__calco" aria-labelledby="c-ficha-h" data-c-calco>
          <span className="c-tab c-mono">{t.ficha.calco}</span>
          <Registros />
          <p className="c-eyebrow">{[t.tipos[o.kind], o.industry].filter(Boolean).join(' · ')}</p>
          <h1 id="c-ficha-h" className="c-h1" data-c-h1>
            <Linea>{o.name}</Linea>
          </h1>
          {linea && <p className="c-ficha__linea">{linea}</p>}
          {texto && <p className="c-ficha__texto">{texto}</p>}

          <dl className="c-dl">
            {o.rolLabel && <Fila k={t.ficha.rol} v={o.rolLabel} />}
            <Fila k={t.ficha.anio} v={String(o.year)} />
            {o.period && <Fila k={t.ficha.construccion} v={formatPeriod(o.period.start, o.period.end)} />}
            {stackPublico(o).length > 0 && <Fila k={t.ficha.pila} v={stackPublico(o).join(' · ')} />}
          </dl>
          {hechos.length > 0 && (
            <dl className="c-dl c-dl--hechos" aria-label={t.ficha.hechos}>
              {hechos.map((f) => (
                <Fila key={f.label} k={f.label} v={f.value} />
              ))}
            </dl>
          )}

          {(d.git || d.lighthouse) && (
            <section className="c-medido" aria-labelledby="c-medido-h">
              <h2 id="c-medido-h" className="c-h3 c-mono">
                {t.ficha.medido}
              </h2>
              {d.git && <p className="c-nota">{t.ficha.git(d.git.commits, d.git.sections, d.git.fecha)}</p>}
              {d.lighthouse && (
                <>
                  <table className="c-tabla">
                    <caption className="c-sr">{t.ficha.lh}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{t.ficha.lh}</th>
                        <th scope="col">{t.ficha.rendimiento}</th>
                        <th scope="col">{t.ficha.accesibilidad}</th>
                        <th scope="col">{t.ficha.seo}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        [t.ficha.movil, d.lighthouse.movil],
                        [t.ficha.escritorio, d.lighthouse.escritorio],
                      ] as const).map(([et, m]) => (
                        <tr key={et}>
                          <th scope="row">{et}</th>
                          <td>{m.perf}</td>
                          <td>{m.a11y}</td>
                          <td>{m.seo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="c-nota">{t.ficha.lhNota(d.lighthouse.fecha)}</p>
                </>
              )}
            </section>
          )}

          <div className="c-ficha__acc">
            {o.link && (
              <a className="c-btn c-btn--tinta" href={o.link} target="_blank" rel="noopener noreferrer">
                {o.kind === 'store' ? t.ficha.abrir : t.ficha.abrirSitio}
                <span className="c-sr"> ({t.ficha.nuevaPestana})</span>
              </a>
            )}
            {caps.length > 0 && (
              <Link className="c-btn c-btn--linea" to={`${v5path('c')}?vista=mesa&obra=${o.slug}`}>
                {t.ficha.verMesa}
              </Link>
            )}
          </div>
          {caps.length === 0 && <p className="c-nota">{t.ficha.sinCaptura}</p>}
        </article>
      </div>
    </main>
  )
}

const Fila = ({ k, v }: { k: string; v: string }) => (
  <div>
    <dt className="c-mono">{k}</dt>
    <dd>{v}</dd>
  </div>
)

