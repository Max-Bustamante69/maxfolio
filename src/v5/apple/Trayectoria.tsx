import { useMemo } from 'react'
import { fleetIslandLines, fleetLiquidLines } from '../../data/skillUsage'
import { timeline } from '../../data/timeline'
import { v5path } from '../data'
import { useCopy } from './copy'
import { gsap, SplitText, useVista } from './motion'
import { Chevron, Enlace } from './piezas'
import { usePublico } from './publico'

const GRUPOS = ['shopify', 'frontend', 'backend', 'quality', 'cro', 'ai'] as const

export default function Trayectoria() {
  const c = useCopy()
  const { strings: s, personal, trayectoria, obras, eras, habilidades, intlLocale, storeCount } = usePublico()
  const y = s.sections.years
  const sk = s.sections.skills
  const num = (n: number) => new Intl.NumberFormat(intlLocale).format(n)

  // Los años salen del mismo registro que el resto del sitio (nada tecleado a mano): lo que corría, lo que se entregó y lo que se construyó a un lado.
  const anios = useMemo(
    () => [...timeline].reverse().map((e) => {
      const nombres = [...e.stores.map((t) => t.name), ...e.positions.map((p) => `${s.experience[p.id].title} · ${p.company}`), ...e.products.map((p) => p.name)].slice(0, 3)
      const conteos: Array<[string, number]> = [[y.roles, e.positions.length], [y.shipped, e.stores.length], [y.work, e.work.length], [y.products, e.products.length], [y.side, e.personal.length]]
      return { year: e.year, era: eras[String(e.year)], nombres, conteos: conteos.filter(([, n]) => n > 0) }
    }),
    [s, y, eras],
  )

  // Columna fija a la izquierda: el cargo que cruza el centro de la ventana toma la escena (un observador, sin fotogramas).
  // La empresa cambia como un titular: la saliente sube tras su máscara de línea y la entrante llega desde abajo (desde arriba si el scroll vuelve).
  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    const fijos = Array.from(raiz.querySelectorAll<HTMLElement>('.ap-linea-act'))
    const nombres = fijos.map((f) => SplitText.create(f.querySelector('strong')!, { type: 'lines', mask: 'lines', linesClass: 'ap-ln', autoSplit: true }))
    let actual = 0
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return
        const i = Number((en.target as HTMLElement).dataset.i)
        if (i === actual || !fijos[i]) return
        const dir = i > actual ? 1 : -1
        const sale = nombres[actual].lines
        const entra = nombres[i].lines
        fijos[actual].classList.remove('on')
        fijos[i].classList.add('on')
        gsap.killTweensOf([...sale, ...entra])
        gsap.fromTo(entra, { yPercent: 112 * dir }, { yPercent: 0, duration: 0.95, ease: 'apple', stagger: 0.07, delay: 0.1 })
        gsap.to(sale, { yPercent: -112 * dir, duration: 0.5, ease: 'power3.in' })
        actual = i
      })
    }, { rootMargin: '-42% 0px -52% 0px' })
    raiz.querySelectorAll('.ap-cargo').forEach((el) => io.observe(el))
    limpiar.push(() => io.disconnect())
  })

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ap-vista">
      <title>{`${c.tray.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="ap-cabeza ap-frame">
        <div>
          <p className="ap-eyebrow" data-ap="subir">{s.hero.eyebrow}</p>
          <h1 className="ap-titulo" data-ap="nombre">{c.tray.h1}</h1>
          <p className="ap-posicion ap-hoy" data-ap="linea" data-ap-retraso="0.2"><span className="ap-tenue">{c.tray.hoy}</span>{s.hero.availability}</p>
        </div>
        <div data-ap="subir" data-ap-retraso="0.15">
          <a className="ap-btn ap-btn-sec" href={personal.cv} download>{c.cvLabel}</a>
        </div>
      </section>

      <section className="ap-anios ap-frame" aria-labelledby="ap-anios-t">
        <div className="ap-anios-cab">
          <h2 id="ap-anios-t" className="ap-subtitulo" data-ap="linea">
            <span className="ap-bloque">{y.title.replace(/[,，]\s*$/, '')}</span>
            <span className="ap-bloque ap-tenue">{y.titleAccent}</span>
          </h2>
          <p className="ap-anios-lead" data-ap="subir" data-ap-retraso="0.1">{y.lead}</p>
        </div>
        <ol className="ap-anios-l" data-ap="grupo">
          {anios.map((a) => (
            <li key={a.year} className="ap-anio">
              <p className="ap-anio-n">{a.year}</p>
              {a.era && <p className="ap-anio-e">{a.era}</p>}
              <ul className="ap-anio-c">
                {a.conteos.map(([etq, n]) => <li key={etq}><span>{etq}</span><strong>{n}</strong></li>)}
              </ul>
              <ul className="ap-anio-t">{a.nombres.map((n) => <li key={n}>{n}</li>)}</ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="ap-linea ap-frame" aria-label={c.tray.cargos}>
        <div className="ap-linea-izq" aria-hidden="true">
          {trayectoria.map((t, i) => (
            <div key={t.id} className={i === 0 ? 'ap-linea-act on' : 'ap-linea-act'}>
              <span className="ap-tenue">{t.period}</span>
              <strong>{t.company}</strong>
            </div>
          ))}
        </div>
        <ol className="ap-cargos">
          {trayectoria.map((t, i) => {
            const entregables = obras.filter((o) => o.kind === 'role' && o.employer === t.id)
            return (
              <li key={t.id} className="ap-cargo" data-i={i} data-ap="subir">
                <h2 className="ap-cargo-h">{t.company}</h2>
                <p className="ap-cargo-p">{t.period}{t.title ? ` · ${t.title}` : ''}</p>
                <p className="ap-cargo-s">{t.summary}</p>
                {t.metrics.length > 0 && (
                  <dl className="ap-cargo-m">
                    {t.metrics.map((m) => <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}
                  </dl>
                )}
                {t.highlights.length > 0 && (
                  <>
                    <p className="ap-cargo-cv ap-tenue">{c.tray.segunCv}</p>
                    <ul className="ap-cargo-l">
                      {t.highlights.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                  </>
                )}
                {entregables.map((o) => (
                  <Enlace key={o.slug} className="ap-enlace ap-cargo-ent" to={v5path('apple', 'obra', o.slug)}>{c.kinds.role}: {o.name}<Chevron /></Enlace>
                ))}
                <p className="ap-cargo-tec ap-tenue">{t.technologies.join(' · ')}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="ap-habil ap-frame" aria-labelledby="ap-hab-t">
        <div className="ap-habil-cab">
          <h2 id="ap-hab-t" className="ap-subtitulo" data-ap="linea">
            <span className="ap-bloque">{sk.title}</span>
            <span className="ap-bloque ap-tenue">{sk.titleAccent}</span>
          </h2>
        </div>
        <ul className="ap-flota" data-ap="grupo">
          <li><strong>{num(fleetLiquidLines)}</strong><span>{sk.depthLabel.liquid}</span></li>
          <li><strong>{num(fleetIslandLines)}</strong><span>{sk.depthLabel.ts}</span></li>
          <li><strong>{storeCount}</strong><span>{sk.depthLabel.stores}</span></li>
        </ul>
        <p className="ap-flota-nota">{c.tray.flotaNota('2026-09-08')}</p>
        <div className="ap-grupos">
          {GRUPOS.map((g) => (
            <div key={g} className="ap-gr" data-ap="subir">
              <div className="ap-gr-cab">
                <h3>{sk.groups[g]}</h3>
                <p>{sk.groupNote[g]}</p>
              </div>
              <ul className="ap-gr-l">
                {habilidades[g].map((tool) => <li key={tool}>{tool}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="ap-acciones" data-ap="grupo">
          <Enlace className="ap-btn ap-btn-pri" to={`${v5path('apple', 'contacto')}?motivo=revision`}>{s.hero.ctaPrimary}</Enlace>
          <Enlace className="ap-enlace" to={v5path('apple', 'obra')}>{c.verObra}<Chevron /></Enlace>
        </div>
      </section>
    </main>
  )
}
