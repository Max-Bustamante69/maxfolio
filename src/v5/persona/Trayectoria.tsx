import { useRef } from 'react'
import { Cabeza } from './Cabeza'
import { usePersona } from './contexto'
import { entradaTitulos } from './efectos'
import { Fondo, Titulo } from './piezas'
import { gsap, OUT, parallaxFondo, revelarPaneles, ScrollTrigger, SLAM, useGsap } from './motion'

export default function Trayectoria() {
  const { v5, c } = usePersona()
  const raiz = useRef<HTMLElement>(null)
  const { trayectoria, obras, eras } = v5
  const hoy = trayectoria[0]
  const primerAnio = Number((trayectoria[trayectoria.length - 1]?.start ?? '2022').slice(0, 4))
  const ultimoAnio = Math.max(...obras.map((o) => o.year))
  const anios = Array.from({ length: ultimoAnio - primerAnio + 1 }, (_, i) => primerAnio + i)

  useGsap(raiz, () => {
    const r = raiz.current
    entradaTitulos(r)
    parallaxFondo(r)
    revelarPaneles(r)
    gsap.from('.pr-hoy', { opacity: 0, y: 22, duration: 0.55, ease: OUT, delay: 0.35 })
    // El selector del índice de cargos sigue la lectura: baja una fila cada vez que otra carta cruza la mitad de la pantalla.
    // La posición es una variable CSS (--i): la transición corre en el compositor y no hay nada que medir con la página quieta.
    const indice = r?.querySelector<HTMLElement>('.pr-linea')
    const filas = gsap.utils.toArray<HTMLElement>('.pr-linea__item', r ?? undefined)
    const marcar = (i: number) => {
      indice?.style.setProperty('--i', String(i))
      filas.forEach((f, k) => (k === i ? f.setAttribute('aria-current', 'location') : f.removeAttribute('aria-current')))
    }
    marcar(0)
    gsap.utils.toArray<HTMLElement>('.pr-cargo', r ?? undefined).forEach((carta, i) =>
      ScrollTrigger.create({ trigger: carta, start: 'top 50%', end: 'bottom 50%', onToggle: (t) => t.isActive && marcar(i) }),
    )
    // Las cifras de cada cargo entran inclinadas, una a una, al verse; las barras de «Obra por año» crecen desde la base.
    gsap.utils.toArray<HTMLElement>('.pr-cargo__metricas .pr-metrica', r ?? undefined).forEach((m) =>
      gsap.from(m, { opacity: 0, x: -18, skewX: -8, duration: 0.45, ease: SLAM, scrollTrigger: { trigger: m, start: 'top 94%', once: true } }),
    )
    gsap.utils.toArray<HTMLElement>('.pr-anio__barras', r ?? undefined).forEach((b) =>
      gsap.from(b.children, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.4, ease: SLAM, stagger: 0.012, scrollTrigger: { trigger: b, start: 'top 94%', once: true } }),
    )
  }, [v5.locale])

  return (
    <main id="contenido" className="pr-pagina" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${c.trayectoria.titulo} · ${v5.personal.name}`} />
      <section className="pr-banda pr-banda--primera" aria-labelledby="pr-trayectoria">
        <Fondo src="/v5/persona/art/years-bg-ice.webp" className="pr-fondo--rasgado" />
        <div className="pr-wrap">
          <Titulo id="pr-trayectoria" eyebrow={c.trayectoria.eyebrow} texto={c.trayectoria.titulo} />
          {hoy && (
            <div className="pr-hoy">
              <b>{c.trayectoria.hoy}</b>
              <p>{v5.strings.hero.eyebrow}</p>
              <p className="pr-texto" style={{ marginTop: 8 }}>
                {v5.strings.hero.availability}
              </p>
            </div>
          )}
          <h2 className="sr-only" id="pr-cargos">
            {c.trayectoria.cargos}
          </h2>
          <div className="pr-cargos-wrap">
            <nav className="pr-linea" aria-label={c.trayectoria.indice}>
              <span className="pr-linea__sel" aria-hidden="true" />
              {trayectoria.map((e) => (
                <a
                  key={e.id}
                  className="pr-linea__item"
                  href={`#cargo-${e.id}`}
                  onClick={(ev) => {
                    ev.preventDefault()
                    document.getElementById(`cargo-${e.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  <b>{e.company}</b>
                  <small>{e.period}</small>
                </a>
              ))}
            </nav>
            <ol className="pr-cargos" aria-labelledby="pr-cargos">
              {trayectoria.map((e, i) => (
                <li key={e.id} id={`cargo-${e.id}`} className={`pr-cargo ${i === 0 ? 'pr-cargo--actual' : ''}`} data-pr-panel>
                  <div className="pr-cargo__quien">
                    <h3>{e.company}</h3>
                    <p className="pr-cargo__periodo">{e.period}</p>
                    <p className="pr-cargo__lugar">{e.location}</p>
                    {e.title && <p className="pr-cargo__titulo">{e.title}</p>}
                  </div>
                  <div className="pr-cargo__cuerpo">
                    <p className="pr-cargo__resumen">{e.summary}</p>
                    {e.highlights.length > 0 && (
                      <ul className="pr-cargo__lista">
                        {e.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    )}
                    {e.metrics.length > 0 && (
                      <div className="pr-cargo__medidas">
                        <div className="pr-cargo__metricas">
                          {e.metrics.map((m) => (
                            <div className="pr-metrica" key={m.label}>
                              <b>{m.value}</b>
                              <span>{m.label}</span>
                            </div>
                          ))}
                        </div>
                        <small className="pr-cifras">{c.trayectoria.cifrasCv}</small>
                      </div>
                    )}
                    <div className="pr-etiquetas">
                      {e.technologies.map((t) => (
                        <span className="pr-etiqueta" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="pr-banda pr-banda--papel" aria-labelledby="pr-anios">
        <div className="pr-wrap">
          <Titulo id="pr-anios" nivel={2} eyebrow={v5.strings.sections.years.eyebrow} texto={c.trayectoria.anios} lead={c.trayectoria.aniosLead} />
          <ol className="pr-anios" aria-label={c.trayectoria.aniosAria}>
            {anios.map((y) => {
              const n = obras.filter((o) => o.year === y).length
              const era = eras[String(y)]
              return (
                <li key={y} className="pr-anio" data-pr-panel>
                  <b>{y}</b>
                  <div className="pr-anio__barras" aria-hidden="true">
                    {Array.from({ length: Math.min(n, 40) }, (_, i) => (
                      <i key={i} />
                    ))}
                  </div>
                  <p>
                    {n} {n === 1 ? c.trayectoria.obra : c.trayectoria.obras}
                  </p>
                  {era && <small>{era}</small>}
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </main>
  )
}
