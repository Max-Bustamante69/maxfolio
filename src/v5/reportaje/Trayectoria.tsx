import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { toolUsageById } from '../../data/skillUsage'
import { v5path } from '../data'
import { useCopy } from './copy'
import { Riel } from './marco'
import { useVista } from './motion'
import { Enlace, Fig, Flecha, Numeral } from './piezas'
import { sinPunto, usePublico } from './publico'

const mes = (s: string) => { const [y, m] = s.split('-').map(Number); return y * 12 + m - 1 }
const ahora = () => { const d = new Date(); return d.getFullYear() * 12 + d.getMonth() }

type Cargo = ReturnType<typeof usePublico>['trayectoria'][number]

/**
 * Fig. 1 · un diagrama de barras con una fila por cargo sobre una rejilla de años: el largo de la barra son los meses (rotulados) y la
 * fila que se lee se ilumina. En pantallas angostas queda como una cinta fija bajo la barra de capítulos, solo con las barras.
 */
function Gantt({ cargos, activo }: { cargos: Cargo[]; activo: string }) {
  const c = useCopy()
  const hoy = ahora()
  const ini = Math.min(...cargos.map((x) => mes(x.start)))
  const total = hoy - ini + 1
  const pos = (m: number) => ((m - ini) / total) * 100
  const anios = Array.from({ length: Math.floor(hoy / 12) - Math.floor(ini / 12) + 1 }, (_, i) => Math.floor(ini / 12) + i)
  return (
    <div className="rp-g" data-rp="barras">
      <div className="rp-g-rejilla" aria-hidden="true">
        {anios.map((y) => <i key={y} style={{ left: `${pos(Math.max(y * 12, ini))}%` }} />)}
      </div>
      {cargos.map((x) => {
        const a = mes(x.start)
        const b = x.end ? mes(x.end) : hoy
        const largo = b + 1 - a
        const alFinal = pos(b + 1) > 80
        return (
          <div key={x.id} className="rp-g-fila" data-id={x.id} data-on={activo === x.id}>
            <div className="rp-g-nom"><b>{x.company}</b><span>{x.title}</span></div>
            <div className="rp-g-pista">
              <i className="rp-g-barra" data-barra style={{ left: `${pos(a)}%`, width: `${(largo / total) * 100}%` }} />
              <em className="rp-g-meses rp-mono" style={alFinal ? { right: `${100 - pos(a)}%`, marginRight: 8 } : { left: `${pos(b + 1)}%`, marginLeft: 8 }}>{c.tray.meses(largo)}</em>
            </div>
          </div>
        )
      })}
      <div className="rp-g-eje" aria-hidden="true">
        <span />
        <div className="rp-g-pista">
          {anios.map((y) => <i key={y} style={{ left: `${pos(Math.max(y * 12, ini))}%` }}>{y}</i>)}
        </div>
      </div>
    </div>
  )
}

export default function Trayectoria() {
  const c = useCopy()
  const { locale } = useLanguage()
  const v = usePublico()
  const { strings: s, trayectoria } = v
  const [activo, setActivo] = useState<string>(trayectoria[0]?.id ?? '')

  const ref = useVista<HTMLElement>([locale], (raiz, limpiar) => {
    // El cargo que cruza el centro de la ventana se ilumina en el diagrama (observador con rootMargin −45 %, como Pudding).
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActivo((e.target as HTMLElement).dataset.id ?? '') }), { rootMargin: '-45% 0px -45% 0px' })
    raiz.querySelectorAll('.rp-cargo').forEach((li) => io.observe(li))
    limpiar.push(() => io.disconnect())
  })

  const tipo = (e: Cargo['employment']) => (e === 'contract' ? c.tray.contrato : e === 'part-time' ? c.tray.parcial : c.tray.tiempoCompleto)
  const miles = (x: string) => (locale === 'es' ? x.replace(/(\d),(\d{3})/g, '$1.$2') : x)
  /** Una métrica del CV lista para componerse: «$45k/yr» se dice 45.000 USD al año en español y no se imprime tal cual. */
  const metrica = (m: { label: string; value: string }) => {
    const ahorro = m.value.match(/^\$(\d+)k\/yr$/)
    if (!ahorro) return { valor: miles(m.value), etq: m.label }
    if (locale === 'es') return { valor: `${ahorro[1]}.000`, etq: `${m.label} · USD/año` }
    return { valor: `$${ahorro[1]}k`, etq: `${m.label} · ${locale === 'ja' ? '/yr' : 'per year'}` }
  }
  const grupos = Object.keys(v.habilidades) as Array<keyof typeof v.habilidades>
  const proyectos = v.obras.filter((o) => o.kind === 'personal')
  const cargoActivo = trayectoria.find((x) => x.id === activo)
  const eras = Object.entries(v.eras).filter((e): e is [string, string] => !!e[1])

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="rp-vista">
      <title>{`${c.nav.trayectoria} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      {/* ------------------------------------------------------------ el titular a la izquierda, el diagrama de cargos a la derecha desde el primer pliegue */}
      <div className="rp-tray rp-marco">
        <header className="rp-tray-cab">
          <p className="rp-kicker rp-mono" data-rp="subir">III · {c.tray.kicker}</p>
          <h1 className="rp-h1 rp-h1-medio" data-rp="linea">{sinPunto(`${s.sections.years.title} ${s.sections.years.titleAccent}`)}</h1>
          <p className="rp-dek" data-rp="subir" data-rp-retraso="0.2">{s.sections.years.lead}</p>
          <p className="rp-estado rp-meta" data-rp="subir" data-rp-retraso="0.3"><i aria-hidden="true" />{s.hero.availability}</p>
          <ol className="rp-eras" data-rp="grupo" aria-label={c.tray.aniosKicker}>
            {eras.map(([y, era]) => <li key={y}><b>{y}</b><span>{era}</span></li>)}
          </ol>
        </header>

        <div className="rp-tray-gantt">
          <Fig n={1} titulo={c.tray.figTitulo} sub={c.tray.figSub} medida={c.tray.escala} fuente={c.tray.figFuente} className="rp-fig-gantt"
            aria={`${c.tray.figTitulo}: ${trayectoria.map((x) => `${x.company}, ${x.period}`).join('; ')}`}>
            <Gantt cargos={trayectoria} activo={activo} />
          </Fig>
          {cargoActivo && <p className="rp-g-leyendo rp-mono" aria-hidden="true"><b>{c.tray.leyendo}</b><span>{cargoActivo.company}</span></p>}
        </div>

        <ol className="rp-tray-lista">
          {trayectoria.map((x) => (
            <li key={x.id} className="rp-cargo" data-id={x.id} data-on={activo === x.id}>
              <article aria-labelledby={`rp-c-${x.id}`}>
                <p className="rp-meta rp-cargo-p">{x.period} · {tipo(x.employment)}</p>
                <h2 id={`rp-c-${x.id}`} className="rp-cargo-n"><span>{x.company}</span></h2>
                <p className="rp-cargo-t">{x.title}</p>
                <p className="rp-cuerpo" data-rp="subir">{x.summary}</p>
                {x.metrics.length > 0 && (
                  <ul className="rp-metricas" data-rp="grupo">
                    {x.metrics.map((m) => { const k = metrica(m); return <li key={m.label}><span className="rp-metrica-n"><Numeral valor={k.valor} /></span><span className="rp-metrica-e">{k.etq}</span></li> })}
                  </ul>
                )}
                <p className="rp-meta rp-cargo-sub">{c.tray.logros}</p>
                <ul className="rp-logros">{x.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                <p className="rp-lista" aria-label={c.tray.pila}>{x.technologies.slice(0, 8).join(' · ')}</p>
                {x.website && !/digitdeck\.co\b/i.test(x.website) && (
                  <a className="rp-enlace rp-cargo-web" href={x.website} target="_blank" rel="noopener noreferrer">{c.tray.visitar}<Flecha /></a>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>

      {/* ------------------------------------------------------------ con qué */}
      <section className="rp-cap rp-cap-linea rp-marco" aria-labelledby="rp-hab-t">
        <div className="rp-cap-cab">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.tray.habKicker}</p>
          <h2 id="rp-hab-t" className="rp-h2" data-rp="linea">{s.sections.skills.title} {sinPunto(s.sections.skills.titleAccent)}</h2>
          <p className="rp-lead" data-rp="subir" data-rp-retraso="0.15">{s.sections.skills.eyebrow}</p>
        </div>
        <dl className="rp-hab">
          {grupos.map((g) => (
            <div key={g} className="rp-hab-fila" data-rp="subir">
              <dt className="rp-mono">{s.sections.skills.groups[g]}</dt>
              <dd>
                <p className="rp-hab-nota">{s.sections.skills.groupNote[g]}</p>
                <p className="rp-lista">{[...v.habilidades[g]].sort((a, b) => (toolUsageById.get(b)?.stores ?? 0) - (toolUsageById.get(a)?.stores ?? 0)).join(' · ')}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------------ en mi tiempo */}
      <section className="rp-cap rp-cap-linea rp-marco" aria-labelledby="rp-proy-t">
        <div className="rp-cap-cab">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.tray.proyKicker}</p>
          <h2 id="rp-proy-t" className="rp-h2" data-rp="linea">{s.sections.projects.title} {sinPunto(s.sections.projects.titleAccent)}</h2>
        </div>
        <ul className="rp-filas">
          {proyectos.map((o) => (
            <li key={o.slug} className="rp-fila" data-rp="subir">
              <Enlace to={v5path('reportaje', 'obra', o.slug)} hoja={false} className="rp-fila-a">
                <span className="rp-fila-n"><span>{o.name}</span></span>
                <span className="rp-fila-meta rp-meta">{o.year} · {o.stack.slice(0, 3).join(' · ')}</span>
                <span className="rp-fila-t">{o.tagline}</span>
                <span className="rp-fila-ver"><span className="rp-sr">{c.tray.proyVer}</span><Flecha /></span>
              </Enlace>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-cierre rp-marco" aria-label={c.tray.cierre}>
        <div className="rp-cierre-filete" data-rp="filete" />
        <div className="rp-acciones" data-rp="subir">
          <a className="rp-btn rp-btn-pri" href={v.personal.cv} download>{c.tray.cierre}<Flecha /></a>
          <a className="rp-enlace" href={v.personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="rp-enlace" href={v.personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <Enlace to={`${v5path('reportaje', 'contacto')}?motivo=revision`} num={c.capitulo.contacto} titulo={c.nav.contacto} className="rp-enlace">{c.pedir}<Flecha /></Enlace>
        </div>
      </section>

      <Riel>
        {c.tray.metodoLineas.map((l) => <p key={l}>{l}</p>)}
      </Riel>
    </main>
  )
}
