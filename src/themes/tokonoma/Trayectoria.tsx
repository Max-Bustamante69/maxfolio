import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toolUsageById } from '../../data/skillUsage'
import { sinPuntoFinal, useV5 } from '../data'
import { evento } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { limpio, plano, unidad } from './limpio'
import { useVista } from './motion'
import { Cifra, Enlace, ID, ruta } from './piezas'

/** En escritorio todos los cargos arrancan abiertos; en el teléfono, los dos más recientes. Plegado, cada cargo deja a la vista su mejor cifra. */
const ABIERTOS_MOVIL = 2
/** La cifra que mejor cuenta cada cargo (no la primera del registro): lo que pasó por haber estado ahí. */
const MEJOR: Record<string, string> = { 'digitdeck-cto': 'tests', ellamau: 'lighthouse', abidata: 'campaignTime', rh: 'savings', 'digitdeck-fe': 'conversion', orthofix: 'dataEntry', ibox: 'lighthouse' }

export default function Trayectoria() {
  const c = useCopy()
  const { strings: s, personal, trayectoria, eras, habilidades, registry, locale } = useV5()
  const ref = useVista<HTMLElement>([locale])
  const [params] = useSearchParams()
  const pedido = params.get('c')
  const hora = useMedellinTime(locale === 'ja' ? 'ja-JP' : locale === 'es' ? 'es-CO' : 'en-US')
  const [abiertos, setAbiertos] = useState<Set<string>>(() => {
    const ancho = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
    return new Set([...trayectoria.slice(0, ancho ? trayectoria.length : ABIERTOS_MOVIL).map((e) => e.id), ...(pedido ? [pedido] : [])])
  })
  const alternar = (id: string) => setAbiertos((a) => { const n = new Set(a); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const exp = s.sections.experience
  const anios = s.sections.chapters
  const hab = s.sections.skills
  const f = (x: string) => plano(limpio(x), locale)
  const grupos = Object.keys(habilidades) as Array<keyof typeof habilidades>

  // Un enlace del inicio puede apuntar a un cargo: se abre y se lleva a la vista.
  useEffect(() => {
    if (pedido) document.getElementById(`cargo-${pedido}`)?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [pedido])

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="tk-vista">
      <title>{`${c.trayectoria.titulo} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <header className="tk-cabecera-pagina tk-fr tk-12">
        <h1 className="tk-h1" data-tk="titulo">{c.trayectoria.titulo}</h1>
        <p className="tk-lead" data-tk="sube" data-tk-r="0.1">{anios.lead}</p>
        <p className="tk-cab-acc" data-tk="sube" data-tk-r="0.2">
          <a className="tk-ver" href={personal.cv} download onClick={() => evento(ID, 'contact_click', { canal: 'cv' })}>{c.cv}</a>
        </p>
      </header>

      <div className="tk-fr">
        <div className="tk-ahora-barra" data-tk="grupo" data-tk-r="0.25">
          <p className="tk-rotulo"><i className="tk-punto" aria-hidden="true" />{c.trayectoria.ahora}</p>
          <p className="tk-ahora-t">{s.hero.availability}</p>
          <p className="tk-nota">{s.hero.location} · {c.pie.medellin} <time>{hora}</time></p>
        </div>
      </div>

      <section className="tk-cargos tk-fr" aria-labelledby="tk-cargos-t">
        <h2 id="tk-cargos-t" className="tk-h2 tk-seccion-t" data-tk="titulo">{exp.title} <span className="tk-tenue">{exp.titleAccent}</span></h2>
        {trayectoria.map((e) => {
          const abierto = abiertos.has(e.id)
          const ids = registry.experience.find((x) => x.id === e.id)?.metrics.map((x) => x.id) ?? []
          const k = Math.max(0, ids.indexOf(MEJOR[e.id]))
          const m = e.metrics[k]
          const otras = e.metrics.filter((_, n) => n !== k)
          return (
            <article key={e.id} id={`cargo-${e.id}`} className="tk-cargo tk-12" data-abierto={abierto}>
              <div className="tk-cargo-p" data-tk="sube" data-tk-y="12">
                <p className="tk-rotulo">{e.period}</p>
                <p className="tk-cargo-lugar"><span>{e.location}</span> <span>{c.trayectoria.contrato[e.employment]}</span></p>
              </div>
              <div className="tk-cargo-c">
                <h3 className="tk-cargo-h" data-tk="sube" data-tk-y="14" data-tk-r="0.05">
                  <button type="button" aria-expanded={abierto} aria-controls={`cargo-${e.id}-c`} aria-label={`${abierto ? c.trayectoria.cerrarCargo : c.trayectoria.abrirCargo}: ${e.title}, ${e.company}`} onClick={() => alternar(e.id)}>
                    <span className="tk-rotulo tk-cargo-emp">{e.company}</span>
                    <span className="tk-cargo-t">{e.title}</span>
                    {m && <span className="tk-cargo-m"><b><Cifra valor={unidad(m.value, locale)} /></b> {m.label}</span>}
                    <i className="tk-mas-i" aria-hidden="true" />
                  </button>
                </h3>
                <div className="tk-pliega" id={`cargo-${e.id}-c`} inert={!abierto}>
                  <div className="tk-pliega-in">
                    <div className="tk-cargo-cuerpo">
                      <div className="tk-cargo-txt">
                        <p className="tk-abre">{f(e.summary)}</p>
                        <ul className="tk-logros">{e.highlights.map((h) => <li key={h}>{f(h)}</li>)}</ul>
                        <p className="tk-tec"><span className="tk-rotulo">{exp.technologies}</span>{e.technologies.map(f).join(' · ')}</p>
                      </div>
                      {otras.length > 0 && (
                        <dl className="tk-metricas">
                          {otras.map((x) => (
                            <div key={x.label}>
                              <dd><Cifra valor={unidad(x.value, locale)} /></dd>
                              <dt>{x.label}</dt>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="tk-anios tk-fr" aria-labelledby="tk-anios-t">
        <h2 id="tk-anios-t" className="tk-h2 tk-seccion-t" data-tk="titulo">{anios.title} <span className="tk-tenue">{sinPuntoFinal(anios.titleAccent)}</span></h2>
        <ol className="tk-anios-l" data-tk="grupo">
          {Object.entries(eras).filter(([, t]) => t).sort(([a], [b]) => Number(a) - Number(b)).map(([anio, texto]) => (
            <li key={anio}>
              <p className="tk-anio">{anio}</p>
              <p className="tk-anio-t">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tk-habilidades tk-fr" aria-labelledby="tk-hab-t">
        <h2 id="tk-hab-t" className="tk-h2 tk-seccion-t" data-tk="titulo">{hab.title} <span className="tk-tenue">{hab.titleAccent}</span></h2>
        <p className="tk-nota tk-uso" data-tk="sube" data-tk-y="10">{c.trayectoria.uso}</p>
        <ul className="tk-grupos" data-tk="grupo">
          {grupos.map((g) => (
            <li key={g} className="tk-grupo tk-12">
              <h3 className="tk-grupo-t">{hab.groups[g]}</h3>
              <p className="tk-grupo-n">{hab.groupNote[g]}</p>
              <ul className="tk-herr">
                {[...habilidades[g]].sort((a, b) => (toolUsageById.get(b)?.stores ?? 0) - (toolUsageById.get(a)?.stores ?? 0)).map((t) => {
                  const n = toolUsageById.get(t)?.stores ?? 0
                  return <li key={t}>{f(t)}{n > 0 && <sup>{n}</sup>}</li>
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="tk-siempre tk-fr tk-12" aria-labelledby="tk-sie-t">
        <h2 id="tk-sie-t" className="tk-h2" data-tk="titulo">{s.sections.manifesto.label}</h2>
        <ol className="tk-siempre-l" data-tk="grupo">
          {s.sections.manifesto.lines.map((l) => <li key={l}>{sinPuntoFinal(l)}</li>)}
        </ol>
      </section>

      <section className="tk-cierre tk-fr tk-12" aria-label={c.trayectoria.abrir}>
        <div className="tk-cierre-pie" data-tk="grupo">
          <p className="tk-acciones">
            <Enlace to={`${ruta('contacto')}#agenda`} className="tk-boton">{c.trayectoria.abrir}</Enlace>
            <a className="tk-enlace" href={personal.cv} download>{c.cv}</a>
          </p>
        </div>
      </section>
    </main>
  )
}
