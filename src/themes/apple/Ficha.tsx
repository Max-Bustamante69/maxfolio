import { useState, type MouseEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { formatMoney } from '../../data/commerceLines'
import { datosDe, SHOT_DATE, v5path } from '../data'
import { useCopy } from './copy'
import { aterrizar, despegar, escena, gsap, useVista } from './motion'
import { Chevron, Enlace, Mac, Segmentado, Telefono } from './piezas'
import { partirFrase, usePublico } from './publico'

/** Una fila de la hoja de datos: etiqueta a la izquierda, valor a la derecha, filete debajo. */
const Dato = ({ k, children }: { k: string; children: ReactNode }) => (
  <div className="ap-dato"><dt>{k}</dt><dd>{children}</dd></div>
)
const llenar = (t: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t)
const sinProtocolo = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

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
  const v = usePublico()
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

  const { git, lighthouse, comercio } = datosDe(o.slug)
  const periodo = o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year)
  const empresa = o.employer ? v.trayectoria.find((t) => t.id === o.employer)?.company : undefined
  const siguiente = (() => {
    const i = v.obras.findIndex((x) => x.slug === o.slug)
    const resto = [...v.obras.slice(i + 1), ...v.obras.slice(0, i)]
    return resto.find((x) => x.views.length) ?? resto[0]
  })()
  const hayPdp = o.views.includes('pdp')

  // La historia: el caso completo de The Gummy Box (problema, plan, construcción, resultado: los mismos registros que el vivo) o,
  // para las demás obras, su descripción con la primera frase en tinta y el resto atenuado.
  const fb = v.strings.sections.featuredBuild
  const caso = o.slug === 'the-gummy-box' && git && lighthouse
    ? fb.beats.map((b) => ({
        label: b.label,
        body: llenar(b.body, {
          ladder: v.registry.stores.find((s) => s.slug === o.slug)?.facts.find((f) => f.id === 'ladder')?.value ?? '',
          sections: git.sections, blocks: git.blocks ?? 0, trackedComponents: git.trackedComponents ?? 0,
          url: o.link ? sinProtocolo(o.link) : '',
          perfDesktop: lighthouse.escritorio.perf, a11yDesktop: lighthouse.escritorio.a11y, seoDesktop: lighthouse.escritorio.seo,
          lcpDesktop: (lighthouse.escritorio.lcp ?? 0).toFixed(2),
        }),
      }))
    : null
  // Un entregable de cargo no trae descripción propia: cuenta lo que el cargo cuenta (resumen, métricas y logros, del CV de Max).
  const cargo = o.employer ? v.trayectoria.find((t) => t.id === o.employer) : undefined
  const descripcion = o.description || cargo?.summary || ''
  const [primera, resto] = partirFrase(descripcion)

  // Catálogo público de la tienda (/products.json y /collections.json), con su fecha.
  const cat = v.strings.sections.caseStudy.commerce
  const catalogo = comercio
    ? (comercio.priceMin != null && comercio.currency
        ? llenar(cat.catalogLine, { products: comercio.products, collections: comercio.collections ?? 0, price: formatMoney(comercio.priceMin, comercio.currency, v.intlLocale) })
        : llenar(cat.catalogLineNoPrice, { products: comercio.products, collections: comercio.collections ?? 0 }))
    : null

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
          <p className="ap-eyebrow">{[o.industry, o.rolLabel ?? c.kinds[o.kind], o.year].filter(Boolean).join(' · ')}</p>
        </div>
        <h1 id="ap-h1" className="ap-ficha-h1" data-ap="nombre">{o.name}</h1>
        <div className="ap-ficha-fila">
          {o.tagline && <p className="ap-ficha-sub" data-ap="linea" data-ap-retraso="0.15">{o.tagline}</p>}
          {(o.link || o.repo) && (
            <div className="ap-ficha-acc" data-ap="subir" data-ap-retraso="0.25">
              {o.link && <a className="ap-btn ap-btn-pri" href={o.link} target="_blank" rel="noopener noreferrer">{empresa ? c.ficha.sitioDe(empresa) : c.ficha.visitar}</a>}
              {o.repo && <a className="ap-btn ap-btn-sec" href={o.repo} target="_blank" rel="noopener noreferrer">{c.ficha.repo}</a>}
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

      <section className={`ap-ficha-datos ap-frame${caso ? ' ap-ficha-caso' : ''}${!caso && !descripcion ? ' ap-ficha-sola' : ''}`} aria-label={c.ficha.datos}>
        {caso ? (
          <div className="ap-caso">
            <p className="ap-eyebrow" data-ap="subir">{fb.eyebrow}</p>
            <ol className="ap-caso-l" data-ap="grupo">
              {caso.map((b) => (
                <li key={b.label}><p className="ap-caso-e">{b.label}</p><p className="ap-caso-t">{b.body}</p></li>
              ))}
            </ol>
          </div>
        ) : (
          descripcion && (
            <div className="ap-ficha-lado" data-ap="subir">
              <p className="ap-ficha-desc">
                <span>{primera}</span>{resto && <> <span className="ap-tenue">{resto}</span></>}
              </p>
              {cargo && cargo.metrics.length > 0 && (
                <dl className="ap-cargo-m">
                  {cargo.metrics.map((m) => <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}
                </dl>
              )}
              {cargo && cargo.highlights.length > 0 && (
                <div>
                  <p className="ap-cargo-cv ap-tenue">{c.tray.segunCv}</p>
                  <ul className="ap-cargo-l">{cargo.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                </div>
              )}
            </div>
          )
        )}
        <div className="ap-hoja-datos">
          <dl className="ap-datos" data-ap="grupo">
            {o.industry && <Dato k={c.ficha.rubro}>{o.industry}</Dato>}
            <Dato k={c.ficha.rol}>{o.rolLabel ?? c.kinds[o.kind]}</Dato>
            {empresa && <Dato k={c.ficha.empleo}>{empresa}</Dato>}
            <Dato k={o.period ? c.ficha.periodo : c.ficha.anio}>{periodo}</Dato>
            <Dato k={c.ficha.pila}>{o.stack.join(' · ')}</Dato>
            {o.facts.map((f, i) => <Dato key={i} k={f.label}>{f.value}</Dato>)}
            {catalogo && comercio && <Dato k={c.ficha.catalogo}>{catalogo}<small>{c.ficha.catalogoNota(comercio.fecha)}</small></Dato>}
            {o.repo && <Dato k={c.ficha.repo}><a className="ap-enlace ap-enlace-dato" href={o.repo} target="_blank" rel="noopener noreferrer">{sinProtocolo(o.repo)}</a></Dato>}
          </dl>
          {(lighthouse || git) && (
            <>
              <h2 className="ap-datos-sub" data-ap="subir">{c.ficha.medido}</h2>
              <dl className="ap-datos" data-ap="grupo">
                {lighthouse && (
                  <Dato k={c.ficha.lighthouse}>
                    <span>{c.ficha.movil}: {lighthouse.movil.perf} · {lighthouse.movil.a11y} · {lighthouse.movil.seo}</span>
                    <span>{c.ficha.escritorio}: {lighthouse.escritorio.perf} · {lighthouse.escritorio.a11y} · {lighthouse.escritorio.seo}</span>
                    <small>{c.ficha.rend} · {c.ficha.acc} · {c.ficha.seo}. {c.ficha.lhNota(lighthouse.fecha)}</small>
                  </Dato>
                )}
                {git && (
                  <Dato k={c.ficha.git}>
                    {git.commits} {c.ficha.commits} · {git.sections} {c.ficha.secciones} · {c.ficha.primerCommit} {git.first}
                    <small>{c.ficha.gitNota(git.fecha)}</small>
                  </Dato>
                )}
              </dl>
            </>
          )}
        </div>
      </section>

      {siguiente && (
        <section className="ap-siguiente ap-frame" aria-label={c.ficha.siguiente}>
          <Enlace className="ap-siguiente-a" to={v5path('apple', 'obra', siguiente.slug)}>
            <span className="ap-eyebrow">{c.ficha.siguiente}</span>
            <span className="ap-siguiente-n">{siguiente.name}<Chevron /></span>
            {siguiente.tagline && <span className="ap-siguiente-t">{siguiente.tagline}</span>}
          </Enlace>
        </section>
      )}
    </main>
  )
}
