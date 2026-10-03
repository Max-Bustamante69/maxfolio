import { useV5 } from '../data'
import { useCopy } from './copy'
import { gsap, SplitText, useVista } from './motion'

export default function Trayectoria() {
  const c = useCopy()
  const { strings: s, personal, trayectoria } = useV5()

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
          {trayectoria.map((t, i) => (
            <li key={t.id} className="ap-cargo" data-i={i} data-ap="subir">
              <h2 className="ap-cargo-h">{t.company}</h2>
              <p className="ap-cargo-p">{t.period}{t.title ? ` · ${t.title}` : ''}</p>
              <p className="ap-cargo-s">{t.summary}</p>
              {t.highlights.length > 0 && (
                <>
                  <p className="ap-cargo-cv ap-tenue">{c.tray.segunCv}</p>
                  <ul className="ap-cargo-l">
                    {t.highlights.slice(0, 2).map((h) => <li key={h}>{h}</li>)}
                  </ul>
                </>
              )}
              <p className="ap-cargo-tec ap-tenue">{t.technologies.slice(0, 7).join(' · ')}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
