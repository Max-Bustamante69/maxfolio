import { useLanguage } from '../../context/LanguageContext'
import { datosDe, SHOT_DATE, sinPuntoFinal, v5path } from '../data'
import { useMedellinTime } from '../shared/useMedellinTime'
import { casoDe } from './casos'
import { FigPagina } from './diagramas'
import { useCopy } from './copy'
import { escena, gsap, SALE, useVista } from './motion'
import { Cabecera, Cinta, Enlace, Flecha, Movil, Retrato, Tarjeta, Ventana } from './piezas'
import { partirFrase, sinProtocolo, usePublico } from './publico'

const HISTORIAS = ['nos-cafe', 'digitdeck-apps', 'nalua']

/** El nombre en dos líneas (cada línea en su bloque): el gesto de identidad, en serif de exhibición. */
const Nombre = ({ nombre, apellido }: { nombre: string; apellido: string }) => (
  <>
    <span className="ing-nombre-l">{nombre}</span> <span className="ing-nombre-l">{apellido}</span>
  </>
)

export default function Inicio() {
  const c = useCopy()
  const v = usePublico()
  const { locale } = useLanguage()
  const { strings: s, personal, obra, trayectoria, intlLocale } = v
  const hora = useMedellinTime(intlLocale)
  const [primera, resto] = partirFrase(s.hero.positioning)
  const tgb = obra('the-gummy-box')
  const caso = tgb ? casoDe(v, tgb, locale) : null
  const apps = obra('digitdeck-apps')
  const fb = s.sections.featuredBuild
  const actual = trayectoria[0]
  const historias = HISTORIAS.map((slug) => obra(slug)).filter((o): o is NonNullable<typeof o> => !!o)
  const proceso = s.sections.process

  // La medición del pliegue: la única vez que el LCP de laboratorio sale en la portada.
  const lh = datosDe('the-gummy-box').lighthouse
  const lcp = lh ? new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 2 }).format(lh.escritorio.lcp ?? 0) : ''
  const tripleta = lh ? `${lh.escritorio.perf} · ${lh.escritorio.a11y} · ${lh.escritorio.seo}` : ''

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    const q = (sel: string) => raiz.querySelector<HTMLElement>(sel)
    // Entrada del pliegue (≤ 1,2 s): el nombre sube letra a letra, la cinta se dibuja de izquierda a derecha y, sobre ella, la obra sube a su sitio.
    const cinta = q('.ing-escena .ing-cinta')
    const ventana = q('.ing-hero-ventana')
    const chip = q('.ing-hero-chip')
    const movil = q('.ing-hero-movil')
    const capa = q('.ing-escena-v')
    if (cinta) gsap.fromTo(cinta, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.out', delay: 0.1, clearProps: 'clipPath' })
    if (ventana) gsap.from(ventana, { y: 90, opacity: 0, duration: 0.95, ease: SALE, delay: 0.3, clearProps: 'transform,opacity' })
    if (movil) gsap.from(movil, { y: 64, opacity: 0, duration: 0.75, ease: SALE, delay: 0.5, clearProps: 'transform,opacity' })
    if (chip) gsap.from(chip, { y: 20, opacity: 0, duration: 0.6, ease: SALE, delay: 0.65, clearProps: 'transform,opacity' })
    // Al irse el pliegue, la cinta corre más despacio que la página y la obra se queda un poco atrás (escena pasiva de scroll).
    const hero = q('.ing-hero')
    if (hero && cinta) limpiar.push(escena(hero, gsap.timeline().fromTo(cinta.firstElementChild, { y: 20 }, { y: -90, ease: 'none' }), { rango: [0.5, 1], suave: 0.5 }))
    if (hero && capa) limpiar.push(escena(hero, gsap.timeline().fromTo(capa, { y: 0 }, { y: -34, ease: 'none' }), { rango: [0.5, 1], suave: 0.5 }))
    // El momento firma: las hebras de la cinta corren por dentro de las letras del monograma mientras la página pasa.
    const persona = q('.ing-persona')
    const hebras = q('.ing-retrato-hebras')
    if (persona && hebras) limpiar.push(escena(persona, gsap.timeline().fromTo(hebras, { x: 150 }, { x: -110, ease: 'none' }), { rango: [0.05, 0.95], suave: 0.7 }))
    // El eje del método se llena con el scroll.
    const pasos = q('.ing-pasos')
    const eje = pasos?.querySelector('.ing-pasos-eje i')
    if (pasos && eje) {
      const horizontal = window.matchMedia('(min-width: 1024px)').matches
      limpiar.push(escena(pasos, gsap.timeline().fromTo(eje, horizontal ? { scaleX: 0 } : { scaleY: 0 }, horizontal ? { scaleX: 1, ease: 'none' } : { scaleY: 1, ease: 'none' }), { rango: [0.25, 0.7], suave: 0.3 }))
    }
  })

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ing-vista">
      <title>{`${personal.name} · ${c.nav.inicio}`}</title>
      <meta name="robots" content="noindex" />

      <section className="ing-hero" aria-labelledby="ing-h1">
        <div className="ing-marco ing-hero-in">
          <div className="ing-hero-txt">
            <p className="ing-etq" data-ing="subir">{s.hero.eyebrow}</p>
            <h1 id="ing-h1" className="ing-nombre" data-ing="nombre"><Nombre nombre={personal.firstName} apellido={personal.lastName} /></h1>
            <p className="ing-claim" data-ing="linea" data-ing-retraso="0.25"><span>{primera}</span> <em>{sinPuntoFinal(resto)}</em></p>
            <div className="ing-acciones" data-ing="grupo" data-ing-retraso="0.45">
              <Enlace className="ing-btn ing-btn-pri" to={`${v5path('ingenieria', 'contacto')}?motivo=revision`}>{s.hero.ctaPrimary}<Flecha /></Enlace>
              <Enlace className="ing-btn ing-btn-sec" to={v5path('ingenieria', 'obra')}>{s.hero.ctaSecondary}</Enlace>
            </div>
          </div>
        </div>

        <div className="ing-escena">
          <div className="ing-cinta" aria-hidden="true"><Cinta /></div>
          <div className="ing-escena-v">
            <Ventana clase="ing-hero-ventana" slug="the-gummy-box" vistas={['home']} url="thegummyboxwellness.com" alt={c.hero.ventana} prioridad />
            {lh && (
              <div className="ing-hero-chip" role="group" aria-label={c.hero.chipEtq}>
                <p className="ing-etq">{c.hero.chipEtq}</p>
                <p className="ing-hero-chip-v">{tripleta}</p>
                <p className="ing-hero-chip-l"><span>{c.hero.chipLcp}</span> {lcp} s</p>
                <p className="ing-fuente">{c.hero.chipFuente('The Gummy Box', lh.fecha)}</p>
              </div>
            )}
            <div className="ing-hero-movil"><Movil slug="nos-cafe" vistas={['home']} alt={c.hero.movil} /></div>
          </div>
        </div>

        <div className="ing-marco ing-hero-pie">
          <div className="ing-hero-txt">
            <p className="ing-lead" data-ing="subir" data-ing-retraso="0.3">{s.hero.lead}</p>
            <p className="ing-nota" data-ing="subir" data-ing-retraso="0.4">{s.hero.ctaNote}</p>
            <p className="ing-vivo" data-ing="subir" data-ing-retraso="0.5">
              <span>{s.hero.availability}</span>
              <span className="ing-vivo-h">{c.hero.medellin(hora)}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="ing-sec ing-persona" aria-labelledby="ing-per-t">
        <div className="ing-marco ing-persona-g">
          <div className="ing-persona-txt">
            <p className="ing-etq" data-ing="subir">{c.persona.etq}</p>
            <h2 id="ing-per-t" className="ing-h2 ing-persona-h" data-ing="linea"><span>{c.persona.titulo}</span> <em>{c.persona.acento}</em></h2>
            <div className="ing-persona-cuerpo" data-ing="grupo">
              {actual && <p>{actual.summary}</p>}
              <p>{c.persona.equipo}</p>
            </div>
            <dl className="ing-hechos" data-ing="grupo">
              {c.persona.hechos.map((h) => (
                <div key={h.k}>
                  <dt>{h.k}</dt>
                  <dd>{h.v}</dd>
                </div>
              ))}
            </dl>
            <p className="ing-fuente" data-ing="subir">{c.persona.fuente}</p>
            <Enlace className="ing-enlace ing-persona-mas" to={v5path('ingenieria', 'trayectoria')}>{c.persona.mas}<Flecha /></Enlace>
          </div>
          <figure className="ing-persona-ret">
            <div className="ing-retrato-marco" data-ing="barrido"><Retrato etiqueta={c.persona.retrato} /></div>
            <figcaption className="ing-fuente">{personal.name} · {c.hero.medellin(hora)}</figcaption>
          </figure>
        </div>
      </section>

      <section className="ing-noche ing-cifras" aria-labelledby="ing-cif-t">
        <div className="ing-marco">
          <Cabecera id="ing-cif-t" etq={c.cifras.etq} titulo={c.cifras.titulo} acento={c.cifras.acento} />
          <ol className="ing-cifras-g" data-ing="grupo">
            {c.cifras.items.map((it) => {
              const cargo = trayectoria.find((t) => t.id === it.id)
              return (
                <li key={it.e} className="ing-cifra">
                  <p className="ing-cifra-v" data-ing="barrido">{it.v}</p>
                  <p className="ing-cifra-e">{it.e}</p>
                  {cargo && <p className="ing-fuente">{c.tray.segun(cargo.company, cargo.period)}</p>}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {tgb && caso && (
        <section className="ing-sec ing-caso" aria-labelledby="ing-caso-t">
          <div className="ing-marco">
            <Cabecera id="ing-caso-t" etq={fb.eyebrow} titulo={fb.title} acento={fb.titleAccent} />
            <div className="ing-caso-g">
              <div className="ing-caso-v" data-ing="marco">
                <Ventana slug={tgb.slug} vistas={tgb.views} activa="pdp" url={tgb.link ? sinProtocolo(tgb.link) : tgb.name} alt={`${tgb.name} · ${c.ficha.escritorio}`} />
                <div className="ing-caso-m"><Movil slug={tgb.slug} vistas={tgb.views} activa="pdp" alt={`${tgb.name} · ${c.ficha.movil}`} /></div>
                <p className="ing-fuente ing-caso-pie">{c.ficha.capturaPie(tgb.name, c.ficha.pdp, `1440 / 390 · ${SHOT_DATE}`)}</p>
              </div>
              <ol className="ing-beats" data-ing="grupo">
                {caso.momentos.filter((_, i) => i !== 2).map((b) => (
                  <li key={b.label}>
                    <p className="ing-etq">{b.label}</p>
                    <p className="ing-beat-t">{b.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="ing-acciones" data-ing="grupo">
              <Enlace className="ing-btn ing-btn-pri" to={v5path('ingenieria', 'obra', tgb.slug)}>{fb.cta}<Flecha /></Enlace>
              {tgb.link && <a className="ing-btn ing-btn-sec" href={tgb.link} target="_blank" rel="noopener noreferrer">{fb.visit}</a>}
            </div>
          </div>
        </section>
      )}

      <section className="ing-sec ing-hist-sec" aria-labelledby="ing-hist-t">
        <div className="ing-marco">
          <Cabecera id="ing-hist-t" etq={c.obraHome.etq} titulo={c.obraHome.titulo} acento={c.obraHome.acento}
            texto={<Enlace className="ing-btn ing-btn-sec" to={v5path('ingenieria', 'obra')}>{c.obraHome.verTodo}<Flecha /></Enlace>} />
          <div className="ing-hist" data-ing="grupo">
            {historias.map((o) => <Tarjeta key={o.slug} o={o} resumen={casoDe(v, o, locale)?.resumen} compactaTexto />)}
          </div>
        </div>
      </section>

      <section className="ing-sec ing-sistema" aria-labelledby="ing-sis-t">
        <div className="ing-marco">
          <FigPagina url={apps?.link ? sinProtocolo(apps.link) : 'cafesnos.com/pages/bundle-builder'} alt={c.sistema.fig1.pie} />

          <div className="ing-metodo">
            <div className="ing-metodo-cab">
              <p className="ing-etq" data-ing="subir">{proceso.eyebrow}</p>
              <h3 className="ing-h3" data-ing="linea"><span>{proceso.title.replace(/[,，]\s*$/, '')}</span> <em>{proceso.titleAccent}</em></h3>
            </div>
            <ol className="ing-pasos">
              <li className="ing-pasos-eje" aria-hidden="true"><i /></li>
              {proceso.steps.map((p, i) => (
                <li key={p.title} className="ing-paso" data-ing="subir">
                  <span className="ing-paso-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h4>{p.title}</h4>
                  <p>{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="ing-cierre" aria-labelledby="ing-cierre-t">
        <div className="ing-cinta ing-cinta-cierre" aria-hidden="true"><Cinta usar /></div>
        <div className="ing-marco ing-cierre-in">
          <p className="ing-etq" data-ing="subir">{c.cierre.etq}</p>
          <h2 id="ing-cierre-t" className="ing-nombre ing-nombre-cierre" data-ing="nombre"><Nombre nombre={personal.firstName} apellido={personal.lastName} /></h2>
          <p className="ing-lead ing-cierre-lead" data-ing="subir">{s.sections.contact.lead}</p>
          <div className="ing-acciones" data-ing="grupo">
            <Enlace className="ing-btn ing-btn-pri" to={`${v5path('ingenieria', 'contacto')}?motivo=revision`}>{s.sections.contact.cta}<Flecha /></Enlace>
            <a className="ing-btn ing-btn-sec" href={personal.cv} download>{c.cv}</a>
          </div>
        </div>
      </section>
    </main>
  )
}
