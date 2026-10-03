import { useState, type MouseEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { datosDe, SHOT_DATE, v5path, useV5 } from '../data'
import { useCopy } from './copy'
import { aterrizar, despegar, escena, gsap, useVista } from './motion'
import { Chevron, Enlace, Mac, Segmentado, Telefono } from './piezas'

/** Una fila de la hoja de datos: etiqueta a la izquierda, valor a la derecha, filete debajo. */
const Dato = ({ k, children }: { k: string; children: ReactNode }) => (
  <div className="ap-dato"><dt>{k}</dt><dd>{children}</dd></div>
)

/**
 * La ruta monta una Ficha NUEVA por obra e idioma. «Siguiente» cambia solo el :slug: sin esta llave React reutilizaría el
 * componente y el revert() del efecto anterior devolvería a los titulares (SplitText) el texto de la obra de antes.
 */
export default function FichaRuta() {
  const { slug = '' } = useParams()
  const { locale } = useLanguage()
  return <Ficha key={`${slug}:${locale}`} slug={slug} />
}

function Ficha({ slug }: { slug: string }) {
  const c = useCopy()
  const v = useV5()
  const o = v.obra(slug)
  const [elegida, setVista] = useState<'home' | 'pdp'>('home')
  const vista = o?.views.includes(elegida) ? elegida : 'home'

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    const marco = raiz.querySelector<HTMLElement>('.ap-ficha-pantalla')
    const tel = raiz.querySelector<HTMLElement>('.ap-ficha-tel')
    // La captura de la tarjeta cruza hasta este marco; sin tarjeta de origen (enlace directo, Atrás) el marco simplemente entra.
    // El teléfono llega después: mientras vuela la copia, taparía la parte del teléfono que se solapa con la pantalla.
    if (marco) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      const llega = () => tel && gsap.fromTo(tel, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'apple', clearProps: 'transform,opacity' })
      if (tel) gsap.set(tel, { opacity: 0 })
      if (!aterrizar(slug, marco, limpiar, { alTerminar: llega })) {
        // Entra el dispositivo entero (bisel y pantalla juntos): solo la pantalla dejaría una losa oscura vacía mientras llega.
        gsap.from(marco.closest('.ap-mac') ?? marco, { opacity: 0, scale: 0.94, y: 40, transformOrigin: '50% 100%', duration: 1.1, ease: 'apple', delay: 0.15, clearProps: 'transform,opacity' })
        gsap.delayedCall(0.5, llega)
      }
    }
    // El teléfono sube más despacio que la página: paralaje con scrub.
    if (tel) limpiar.push(escena(tel, gsap.timeline().fromTo(tel.firstElementChild, { y: 70 }, { y: -50, ease: 'none' }), { paso: true, suave: 0.4 }))
  })

  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} ref={ref} className="ap-vista">
        <title>{`${c.ficha.noExiste} · ${v.personal.name}`}</title>
        <meta name="robots" content="noindex" />
        <section className="ap-cabeza ap-frame">
          <div>
            <h1 className="ap-titulo">{c.ficha.noExiste}</h1>
            <Enlace className="ap-enlace" to={v5path('apple', 'obra')}>{c.ficha.volverObra}<Chevron /></Enlace>
          </div>
        </section>
      </main>
    )
  }

  const { git, lighthouse } = datosDe(o.slug)
  const periodo = o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year)
  const empresa = o.employer ? v.trayectoria.find((t) => t.id === o.employer)?.company : undefined
  const siguiente = (() => {
    const i = v.obras.findIndex((x) => x.slug === o.slug)
    const resto = [...v.obras.slice(i + 1), ...v.obras.slice(0, i)]
    return resto.find((x) => x.views.length) ?? resto[0]
  })()
  const hayPdp = o.views.includes('pdp')
  // «‹ Obra»: la captura de la home vuelve volando a su tarjeta (la lista la recibe con vueloDe). Con la vista PDP a la vista no hay tarjeta que la espere.
  const volar = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || vista !== 'home') return
    const marco = document.querySelector<HTMLElement>('.ap-ficha-pantalla')
    const img = marco?.querySelector('img')
    if (marco && img) despegar(o.slug, marco, img)
  }

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ap-vista">
      <title>{`${o.name} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="ap-ficha-cab ap-frame" aria-labelledby="ap-h1">
        <div className="ap-ficha-meta" data-ap="subir">
          <Enlace className="ap-enlace ap-volver" to={v5path('apple', 'obra')} onClick={volar}><Chevron izquierda />{c.ficha.volver}</Enlace>
          <p className="ap-eyebrow">{o.rolLabel ?? c.kinds[o.kind]} · {o.year}</p>
        </div>
        <h1 id="ap-h1" className="ap-ficha-h1" data-ap="nombre">{o.name}</h1>
        <div className="ap-ficha-fila">
          <p className="ap-ficha-sub" data-ap="linea" data-ap-retraso="0.15">{o.tagline}</p>
          {o.link && (
            <div data-ap="subir" data-ap-retraso="0.25">
              <a className="ap-btn ap-btn-pri" href={o.link} target="_blank" rel="noopener noreferrer">{c.ficha.visitar}</a>
            </div>
          )}
        </div>
      </section>

      {o.views.length > 0 && (
        <section className="ap-ficha-escena ap-frame" aria-label={o.name}>
          <div className="ap-ficha-vistas">
            <Mac slug={o.slug} vistas={o.views} activa={vista} alt={`${o.name} · ${c.escena.escritorio}`} prioridad marcoClass="ap-ficha-pantalla" />
            <div className="ap-ficha-tel"><Telefono slug={o.slug} vistas={o.views} activa={vista} alt={`${o.name} · ${c.escena.movil}`} /></div>
          </div>
          <div className="ap-ficha-ctrl">
            {hayPdp && (
              <Segmentado etiqueta={c.ficha.vista} valor={vista} opciones={[['home', c.ficha.home], ['pdp', c.ficha.pdp]]} onCambio={setVista} />
            )}
            <p className="ap-tenue">{o.name} · {vista === 'home' ? 'Home' : 'PDP'} · 1440 / 390 · {SHOT_DATE}</p>
          </div>
        </section>
      )}

      <section className="ap-ficha-datos ap-frame" aria-label={c.ficha.datos}>
        {o.description && <p className="ap-ficha-desc" data-ap="linea">{o.description}</p>}
        <dl className="ap-datos" data-ap="grupo">
          {o.industry && <Dato k={c.ficha.rubro}>{o.industry}</Dato>}
          <Dato k={c.ficha.rol}>{o.rolLabel ?? c.kinds[o.kind]}</Dato>
          {empresa && <Dato k={c.ficha.empleo}>{empresa}</Dato>}
          <Dato k={o.period ? c.ficha.periodo : c.ficha.anio}>{periodo}</Dato>
          <Dato k={c.ficha.pila}>{o.stack.join(' · ')}</Dato>
          {o.facts.map((f, i) => <Dato key={i} k={f.label}>{f.value}</Dato>)}
          {git && (
            <Dato k={c.ficha.git}>
              {git.commits} {c.ficha.commits} · {git.sections} {c.ficha.secciones} · {c.ficha.primerCommit} {git.first}
              <small>{c.ficha.gitNota(git.fecha)}</small>
            </Dato>
          )}
          {lighthouse && (
            <Dato k={c.ficha.lighthouse}>
              <span>{c.ficha.movil}: {lighthouse.movil.perf} · {lighthouse.movil.a11y} · {lighthouse.movil.seo}</span>
              <span>{c.ficha.escritorio}: {lighthouse.escritorio.perf} · {lighthouse.escritorio.a11y} · {lighthouse.escritorio.seo}</span>
              <small>{c.ficha.rend} · {c.ficha.acc} · {c.ficha.seo}. {c.ficha.lhNota(lighthouse.fecha)}</small>
            </Dato>
          )}
        </dl>
      </section>

      {siguiente && (
        <section className="ap-siguiente ap-frame" aria-label={c.ficha.siguiente}>
          <Enlace className="ap-siguiente-a" to={v5path('apple', 'obra', siguiente.slug)}>
            <span className="ap-eyebrow">{c.ficha.siguiente}</span>
            <span className="ap-siguiente-n">{siguiente.name}<Chevron /></span>
          </Enlace>
        </section>
      )}
    </main>
  )
}
