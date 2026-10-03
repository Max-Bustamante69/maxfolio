import { useState } from 'react'
import type { SkillGroupId } from '../../data/registry'
import { sinPuntoFinal, v5path } from '../data'
import { DESTACADAS } from './colecciones'
import { useCopy } from './copy'
import { useVista } from './motion'
import { Enlace, ID, Marco, menos, Tri } from './piezas'
import { limpioTexto, prohibido, sinMeta, usePublico } from './publico'

/** Piezas reales de la flota que el cargo entregó, al margen del cargo (solo donde el registro las tiene). */
const FOTOS_DEL_CARGO: Record<string, string[]> = { 'digitdeck-cto': ['nos-cafe', 'the-gummy-box', 'nalua'], 'digitdeck-fe': ['saint-theory'] }

const sinComa = (s: string) => s.replace(/[,，、]\s*$/, '')
const GRUPOS: SkillGroupId[] = ['shopify', 'frontend', 'backend', 'quality', 'cro', 'ai']

export default function Trayectoria() {
  const c = useCopy()
  const v = usePublico()
  const { strings: s, personal, trayectoria, eras, obras, habilidades, obra } = v
  const y = s.sections.years
  // En móvil cada cargo se lee cerrado (título, cifras y su primer logro) y se abre con un toque; en escritorio siempre está completo.
  const [abiertos, setAbiertos] = useState<string[]>([])
  const alternar = (id: string) => setAbiertos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))
  const ordenada = (o: (typeof obras)[number]) => (DESTACADAS.includes(o.slug) ? 0 : o.kind === 'store' ? 1 : 2)
  const temporadas = Object.keys(eras).filter((k) => eras[k]).sort().reverse().map((anio) => {
    const obrasDelAnio = obras.filter((o) => String(o.year) === anio && !!o.name && o.kind !== 'role').sort((a, b) => ordenada(a) - ordenada(b))
    const cargos = [...new Set(trayectoria.filter((t) => Number(t.start.slice(0, 4)) <= Number(anio) && Number(anio) <= Number((t.end ?? '2026').slice(0, 4))).map((t) => t.company))]
    return { anio, era: eras[anio] as string, muestra: obrasDelAnio.slice(0, 4), hayMas: obrasDelAnio.length > 4, cargos }
  })
  const desde = Math.min(...trayectoria.map((t) => Number(t.start.slice(0, 4))))

  const ref = useVista<HTMLElement>([])

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="mz-vista">
      <title>{`${c.tray.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="mz-marco mz-cab-pag" aria-labelledby="mz-h1">
        <p className="mz-etq" data-mz="subir">{c.tray.eyebrow(trayectoria.length, String(desde))}</p>
        <h1 id="mz-h1" className="mz-titulo" data-mz="linea">{c.tray.h1}</h1>
        <p className="mz-nota mz-cab-pag-lead" data-mz="subir" data-mz-retraso="0.2">{sinMeta(y.lead)}</p>
        <div className="mz-acciones mz-cab-pag-acc">
          <a className="mz-btn mz-btn-vacio" href={personal.cv} download>{c.tray.cv}</a>
        </div>
      </section>

      <section className="mz-marco mz-sec mz-temporadas" aria-labelledby="mz-temp-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{c.tray.temporadas}</p>
          <h2 id="mz-temp-t" className="mz-titulo-sec" data-mz="linea"><span className="mz-bloque">{sinComa(y.title)}</span><em className="mz-bloque">{y.titleAccent}</em></h2>
        </div>
        <ol className="mz-temporadas-l">
          {temporadas.map((t) => (
            <li key={t.anio} className="mz-temporada">
              <i className="mz-filete" data-mz="trazo" aria-hidden="true" />
              <p className="mz-cifra-v mz-temporada-anio">{t.anio}</p>
              <p className="mz-temporada-era">{t.era}</p>
              <p className="mz-temporada-cargos"><span className="mz-etq">{c.tray.cargosDelAnio}</span> {t.cargos.join(' · ')}</p>
              <ul className="mz-temporada-obras">
                {t.muestra.map((o) => <li key={o.slug}><Enlace to={v5path(ID, 'obra', o.slug)}>{o.name}</Enlace></li>)}
                {t.hayMas && <li><Enlace to={v5path(ID, 'obra')}>{c.tray.mas}<Tri /></Enlace></li>}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mz-marco mz-sec mz-cargos" aria-labelledby="mz-cargos-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{s.sections.experience.eyebrow}</p>
          <h2 id="mz-cargos-t" className="mz-titulo-sec" data-mz="linea"><span className="mz-bloque">{sinComa(s.sections.experience.title)}</span><em className="mz-bloque">{s.sections.experience.titleAccent}</em></h2>
        </div>
        <ol className="mz-cargos-l">
          {trayectoria.map((t) => {
            const abierto = abiertos.includes(t.id)
            const entregables = obras.filter((o) => o.kind === 'role' && o.employer === t.id)
            return (
              <li key={t.id} className="mz-cargo" data-abierto={abierto}>
                <i className="mz-filete" data-mz="trazo" aria-hidden="true" />
                <div className="mz-cargo-quien">
                  <p className="mz-etq">{t.period}</p>
                  <h3 className="mz-cargo-emp">
                    {t.website && !prohibido(t.website) ? <a href={t.website} target="_blank" rel="noopener noreferrer">{t.company}</a> : t.company}
                  </h3>
                  <p className="mz-mini">{t.location} · {c.tray.empleoTipo[t.employment] ?? t.employment}</p>
                  {FOTOS_DEL_CARGO[t.id] && (
                    <div className="mz-cargo-fotos">
                      {FOTOS_DEL_CARGO[t.id].map(obra).map((o) => o?.views.length ? (
                        <Enlace key={o.slug} to={v5path(ID, 'obra', o.slug)} aria-label={o.name} className="mz-cargo-foto"><Marco o={o} velo={false} /></Enlace>
                      ) : null)}
                    </div>
                  )}
                </div>
                <p className="mz-display mz-cargo-tit">{t.title}</p>
                <ul className="mz-cargo-metricas">
                  {t.metrics.map((m) => (
                    <li key={m.label}>
                      <p className="mz-cifra-v mz-cifra-s">{menos(m.value)}</p>
                      <p className="mz-cifra-e">{m.label}</p>
                    </li>
                  ))}
                </ul>
                <div className="mz-cargo-cuerpo" id={`mz-cargo-${t.id}`}>
                  <p className="mz-nota mz-cargo-sum">{limpioTexto(t.summary)}</p>
                  <div className="mz-cargo-logros">
                    <p className="mz-etq">{s.sections.experience.achievements}</p>
                    <ul>{t.highlights.map((h) => <li key={h} className="mz-cuerpo">{h}</li>)}</ul>
                  </div>
                  {entregables.length > 0 && (
                    <p className="mz-mini mz-cargo-ent">
                      <span>{c.tray.entregables}.</span>{' '}
                      {entregables.map((o, i) => <span key={o.slug}>{i > 0 && ' · '}<Enlace to={v5path(ID, 'obra', o.slug)}>{o.name}</Enlace></span>)}
                    </p>
                  )}
                  <p className="mz-mini mz-cargo-stack"><span>{s.sections.experience.technologies}.</span> {t.technologies.join(' · ')}</p>
                  <button type="button" className="mz-enlace mz-cargo-boton" aria-expanded={abierto} aria-controls={`mz-cargo-${t.id}`} onClick={() => alternar(t.id)}>
                    {abierto ? c.tray.verMenos : c.tray.verTodo}<span className="mz-mas" aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="mz-marco mz-sec mz-habilidades" aria-labelledby="mz-hab-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{s.sections.skills.eyebrow}</p>
          <h2 id="mz-hab-t" className="mz-titulo-sec" data-mz="linea"><span className="mz-bloque">{sinComa(s.sections.skills.title)}</span><em className="mz-bloque">{s.sections.skills.titleAccent}</em></h2>
        </div>
        <div className="mz-habilidades-l">
          {GRUPOS.map((g) => (
            <div key={g} className="mz-habilidad">
              <i className="mz-filete" aria-hidden="true" />
              <h3 className="mz-habilidad-t">{s.sections.skills.groups[g]}</h3>
              <p className="mz-habilidad-i">{habilidades[g].join(' · ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mz-marco mz-cierre" aria-labelledby="mz-cierre-t">
        <h2 id="mz-cierre-t" className="mz-titulo" data-mz="linea"><span className="mz-bloque">{s.sections.contact.title}</span><em className="mz-bloque">{sinPuntoFinal(s.sections.contact.titleAccent)}</em></h2>
        <div className="mz-acciones">
          <a className="mz-btn" href={personal.cv} download>{c.tray.cv}</a>
          <Enlace className="mz-enlace" to={`${v5path(ID, 'contacto')}?motivo=revision`}>{s.sections.contact.cta}<Tri /></Enlace>
        </div>
      </section>
    </main>
  )
}
