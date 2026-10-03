import { sinPuntoFinal, v5path } from '../data'
import { useCopy } from './copy'
import { useVista } from './motion'
import { Cabecera, Enlace, Flecha, Valor, Ventana } from './piezas'
import { sinProtocolo, usePublico } from './publico'

const GRUPOS = ['shopify', 'frontend', 'backend', 'quality', 'cro', 'ai'] as const
const DESDE = 2022
const MESES = 60 // enero de 2022 a diciembre de 2026
const mes = (ym: string) => (Number(ym.slice(0, 4)) - DESDE) * 12 + Number(ym.slice(5, 7)) - 1
const HOY = '2026-10'
/** Herramientas por grupo: las primeras bastan para leer el perfil; el resto del registro vive en el CV. */
const MAX_HERRAMIENTAS = 9

export default function Trayectoria() {
  const c = useCopy()
  const { strings: s, personal, trayectoria, obras, obra, eras, habilidades } = usePublico()
  const y = s.sections.years
  const sk = s.sections.skills
  const ref = useVista<HTMLElement>([])
  const anios = Object.keys(eras).map(Number).sort((a, b) => a - b)
  const [actual, ...antes] = trayectoria
  const construye = ['digitdeck-apps', 'digitdeck-platform'].map((slug) => obra(slug)).filter((o): o is NonNullable<typeof o> => !!o && o.views.length > 0)

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ing-vista">
      <title>{`${c.tray.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="ing-cabeza">
        <div className="ing-marco ing-cabeza-in">
          <Cabecera id="ing-h1" nivel={1} anim="titular" etq={s.hero.eyebrow} titulo={`${c.tray.h1}.`} acento={`${y.title} ${sinPuntoFinal(y.titleAccent)}`} texto={y.lead} />
          <div className="ing-acciones" data-ing="grupo" data-ing-retraso="0.3">
            <a className="ing-btn ing-btn-pri" href={personal.cv} download>{c.cv}<Flecha /></a>
            <Enlace className="ing-btn ing-btn-sec" to={`${v5path('ingenieria', 'contacto')}?motivo=empleo`}>{c.tray.empleo}</Enlace>
          </div>
        </div>
      </section>

      <section className="ing-sec ing-mapa" aria-labelledby="ing-mapa-t">
        <div className="ing-marco">
          <Cabecera id="ing-mapa-t" etq={c.tray.hoy + ' · ' + s.hero.availability} titulo={c.tray.mapa} />
          <div className="ing-gantt" role="img" aria-label={c.tray.mapaAria} data-ing="barras">
            <div className="ing-gantt-anios" aria-hidden="true">
              {anios.map((a) => (
                <p key={a}><strong>{a}</strong><span>{eras[String(a)]}</span></p>
              ))}
            </div>
            {trayectoria.map((t) => {
              const a = mes(t.start)
              const b = mes(t.end ?? HOY) + 1
              return (
                <div key={t.id} className="ing-gantt-fila" aria-hidden="true">
                  <p className="ing-gantt-n"><strong>{t.company}</strong><span>{t.title}</span></p>
                  <div className="ing-gantt-pista">
                    <i data-barra className={t.end ? '' : 'is-actual'} style={{ left: `${(a / MESES) * 100}%`, width: `${((b - a) / MESES) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {actual && (
        <article className="ing-cargo ing-cargo-actual" aria-labelledby={`ing-c-${actual.id}`}>
          <div className="ing-marco ing-cargo-g">
            <div className="ing-cargo-izq">
              <p className="ing-etq" data-ing="subir">{c.tray.actual} · {actual.period}</p>
              <h2 id={`ing-c-${actual.id}`} className="ing-h2" data-ing="linea">{actual.company}</h2>
              {actual.title && <p className="ing-cargo-t" data-ing="subir">{actual.title}</p>}
              <p className="ing-cargo-lugar ing-fuente" data-ing="subir">{actual.location}</p>
            </div>
            <div className="ing-cargo-der">
              <p className="ing-lead" data-ing="subir">{actual.summary}</p>
              {actual.metrics.length > 0 && (
                <div className="ing-cargo-m" data-ing="grupo">
                  {actual.metrics.map((m) => (
                    <div key={m.label} className="ing-riel-m">
                      <p className="ing-riel-v"><Valor v={m.value} /></p>
                      <p className="ing-riel-e">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <div data-ing="subir">
                <p className="ing-etq">{c.tray.resultados}</p>
                <ul className="ing-lectura-l">{actual.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                <p className="ing-fuente ing-cargo-fuente">{c.tray.segun(actual.company, actual.period)}</p>
              </div>
              <div data-ing="subir">
                <p className="ing-etq">{c.tray.pila}</p>
                <ul className="ing-chips">{actual.technologies.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
          </div>
          {construye.length > 0 && (
            <div className="ing-marco ing-construye" data-ing="grupo">
              <p className="ing-etq">{c.tray.construye}</p>
              <div className="ing-construye-g">
                {construye.map((o) => (
                  <Enlace key={o.slug} to={v5path('ingenieria', 'obra', o.slug)} className="ing-construye-i">
                    <Ventana slug={o.slug} vistas={o.views} url={o.link ? sinProtocolo(o.link) : o.name} alt={o.name} />
                    <span className="ing-construye-t"><strong>{o.name}</strong><span>{o.tagline}</span></span>
                  </Enlace>
                ))}
              </div>
            </div>
          )}
        </article>
      )}

      <section className="ing-antes" aria-label={c.tray.antes}>
        <div className="ing-marco">
          <p className="ing-etq ing-antes-t" data-ing="subir">{c.tray.antes}</p>
          {antes.map((t) => {
            const entregables = obras.filter((o) => o.kind === 'role' && o.employer === t.id)
            return (
              <article key={t.id} className="ing-cargo ing-cargo-c" aria-labelledby={`ing-c-${t.id}`}>
                <div className="ing-cargo-g">
                  <div className="ing-cargo-izq">
                    <p className="ing-etq" data-ing="subir">{t.period}</p>
                    <h2 id={`ing-c-${t.id}`} className="ing-h3" data-ing="linea">{t.company}</h2>
                    {t.title && <p className="ing-cargo-t" data-ing="subir">{t.title}</p>}
                    <p className="ing-cargo-lugar ing-fuente" data-ing="subir">{t.location}</p>
                  </div>
                  <div className="ing-cargo-der">
                    <p className="ing-cargo-resumen" data-ing="subir">{t.summary}</p>
                    {t.highlights.length > 0 && <ul className="ing-lectura-l" data-ing="subir">{t.highlights.map((h) => <li key={h}>{h}</li>)}</ul>}
                    {t.metrics.length > 0 && (
                      <dl className="ing-cargo-cifras" data-ing="subir">
                        {t.metrics.map((m) => <div key={m.label}><dt>{m.label}</dt><dd><Valor v={m.value} /></dd></div>)}
                      </dl>
                    )}
                    <p className="ing-pila ing-fuente" data-ing="subir">{t.technologies.join(' · ')}</p>
                    {entregables.map((o) => (
                      <Enlace key={o.slug} className="ing-enlace ing-cargo-ent" to={v5path('ingenieria', 'obra', o.slug)}>{c.tray.entregable}: {o.name}<Flecha /></Enlace>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
          <p className="ing-fuente ing-antes-fuente">{c.tray.fuenteAntes}</p>
        </div>
      </section>

      <section className="ing-sec ing-habil" aria-labelledby="ing-hab-t">
        <div className="ing-marco">
          <Cabecera id="ing-hab-t" etq={sk.eyebrow} titulo={sk.title} acento={sk.titleAccent} />
          <dl className="ing-grupos" data-ing="grupo">
            {GRUPOS.map((g) => (
              <div key={g} className="ing-gr">
                <dt>{sk.groups[g]}</dt>
                <dd>{habilidades[g].slice(0, MAX_HERRAMIENTAS).join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}
