import { useState, type MouseEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { datosDe, SHOT_DATE, v5path, type Vista } from '../data'
import { CON_CASO, casoDe, vistaDe } from './casos'
import { useCopy } from './copy'
import { aterrizar, despegar, gsap, SALE, useVista } from './motion'
import { Fig2 } from './diagramas'
import { Cabecera, Enlace, Flecha, Movil, Segmentado, Valor, Ventana } from './piezas'
import { partirFrase, sinProtocolo, usePublico } from './publico'

/**
 * La ruta monta una Ficha NUEVA por obra e idioma. «Siguiente» cambia solo el :slug: sin esta llave React reutilizaría el
 * componente y el revert() del efecto anterior devolvería a los titulares (SplitText) el texto de la obra de antes.
 */
export default function FichaRuta() {
  const { slug = '' } = useParams()
  const { locale } = useLanguage()
  return <Ficha key={`${slug}:${locale}`} slug={slug} />
}

interface M { v: string; e: string; f: string }

function Ficha({ slug }: { slug: string }) {
  const c = useCopy()
  const v = usePublico()
  const { locale } = useLanguage()
  const o = v.obra(slug)
  const [elegida, setVista] = useState<Vista | null>(null)
  const portada = o ? vistaDe(o) : 'home'
  const vista = elegida && o?.views.includes(elegida) ? elegida : portada
  const num = new Intl.NumberFormat(v.intlLocale)

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    const pantalla = raiz.querySelector<HTMLElement>('.ing-ficha-v .ing-ventana-pantalla')
    const contenedor = raiz.querySelector<HTMLElement>('.ing-ficha-v')
    const movil = raiz.querySelector<HTMLElement>('.ing-ficha-movil')
    if (!pantalla || !contenedor) return
    // La captura de la tarjeta cruza hasta esta pantalla; sin tarjeta de origen (enlace directo, Atrás) la ventana simplemente entra.
    // El móvil llega después: mientras vuela la copia, taparía la parte que se solapa con la pantalla.
    const llega = () => movil && gsap.fromTo(movil, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.8, ease: SALE, clearProps: 'transform,opacity' })
    if (movil) gsap.set(movil, { opacity: 0 })
    if (!aterrizar(slug, pantalla, limpiar, { alTerminar: llega })) {
      gsap.from(contenedor, { opacity: 0, y: 44, duration: 1.1, ease: SALE, delay: 0.15, clearProps: 'transform,opacity' })
      gsap.delayedCall(0.55, llega)
    }
  })

  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} ref={ref} className="ing-vista">
        <title>{`${c.ficha.noExiste} · ${v.personal.name}`}</title>
        <meta name="robots" content="noindex" />
        <section className="ing-cabeza">
          <div className="ing-marco ing-cabeza-in">
            <Cabecera id="ing-h1" nivel={1} titulo={c.ficha.noExiste} />
            <Enlace className="ing-btn ing-btn-sec" to={v5path('ingenieria', 'obra')}>{c.ficha.volverObra}<Flecha /></Enlace>
          </div>
        </section>
      </main>
    )
  }

  const { git, lighthouse, comercio } = datosDe(o.slug)
  const caso = casoDe(v, o, locale)
  const periodo = o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year)
  const cargo = o.employer ? v.trayectoria.find((t) => t.id === o.employer) : undefined
  const siguiente = (() => {
    const orden = [...CON_CASO.map((s) => v.obra(s)), ...v.obras].filter((x): x is NonNullable<typeof x> => !!x)
    const unicas = orden.filter((x, i) => orden.findIndex((y) => y.slug === x.slug) === i)
    const i = unicas.findIndex((x) => x.slug === o.slug)
    const resto = [...unicas.slice(i + 1), ...unicas.slice(0, i)]
    return resto.find((x) => x.views.length) ?? resto[0]
  })()
  const [lider, resto] = partirFrase(o.description || cargo?.summary || '')
  const url = o.link ? sinProtocolo(o.link) : o.name
  const lcpFmt = (n: number | null) => (n != null ? `${new Intl.NumberFormat(v.intlLocale, { maximumFractionDigits: 2 }).format(n)} s` : '—')

  // El carril de métricas: tres como mucho, y solo las que el repo o el CV sostienen, cada cifra con su fuente. Lighthouse sale una sola vez, en «Medido».
  const candidatas: M[] = []
  const hecho = o.facts[0]
  const conCaso = !!caso?.momentos.length // lo que el relato ya dice (la escalera de descuento, las secciones) no se repite en el riel
  if (hecho && !conCaso) candidatas.push({ v: hecho.value, e: hecho.label, f: c.ficha.registro })
  if (comercio) candidatas.push({ v: num.format(comercio.products), e: `${c.ficha.productosCat} · ${num.format(comercio.collections ?? 0)} ${c.ficha.coleccionesCat}`, f: c.ficha.catalogoFuente(comercio.fecha) })
  if (git && o.slug !== 'the-gummy-box') candidatas.push({ v: String(git.sections), e: c.ficha.secciones, f: c.ficha.gitFuente(git.fecha) })
  const metricas: M[] = cargo ? cargo.metrics.slice(0, 3).map((m) => ({ v: m.value, e: m.label, f: c.tray.segun(cargo.company, cargo.period) })) : candidatas.slice(0, 3)

  // «‹ Obra»: la captura vuelve volando a su tarjeta. Con otra vista a la vista no hay tarjeta que la espere.
  const volar = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || vista !== portada) return
    const marco = document.querySelector<HTMLElement>('.ing-ficha-v .ing-ventana-pantalla')
    const img = marco?.querySelector('img')
    if (marco && img) despegar(o.slug, marco, img)
  }

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ing-vista">
      <title>{`${o.name} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="ing-ficha-cab" aria-labelledby="ing-h1">
        <div className="ing-marco">
          <nav className="ing-migas" aria-label={c.ficha.volver} data-ing="subir">
            <Enlace to={v5path('ingenieria', 'obra')} onClick={volar}><Flecha atras />{c.ficha.volver}</Enlace>
            {siguiente && <Enlace to={v5path('ingenieria', 'obra', siguiente.slug)}>{c.ficha.siguiente}: {siguiente.name}<Flecha /></Enlace>}
          </nav>
          <div className="ing-ficha-tit">
            <div>
              <p className="ing-etq" data-ing="subir">{[o.industry, o.rolLabel ?? c.kinds[o.kind], o.year].filter(Boolean).join(' · ')}</p>
              <h1 id="ing-h1" className="ing-h1 ing-ficha-h1" data-ing="titular">{o.name}</h1>
              {o.tagline && <p className="ing-lead" data-ing="subir" data-ing-retraso="0.2">{o.tagline}</p>}
              {(o.link || o.repo) && (
                <div className="ing-acciones" data-ing="grupo" data-ing-retraso="0.3">
                  {o.link && <a className="ing-btn ing-btn-pri" href={o.link} target="_blank" rel="noopener noreferrer">{cargo ? c.ficha.sitioDe(cargo.company) : c.ficha.visitar}<Flecha /></a>}
                  {o.repo && <a className="ing-btn ing-btn-sec" href={o.repo} target="_blank" rel="noopener noreferrer">{c.ficha.codigo}</a>}
                </div>
              )}
            </div>
            <aside className="ing-lado" data-ing="subir" data-ing-retraso="0.25">
              <dl>
                {o.industry && <div><dt>{c.ficha.rubro}</dt><dd>{o.industry}</dd></div>}
                {caso ? <div><dt>{c.ficha.queHice}</dt><dd>{caso.rol}</dd></div> : <div><dt>{c.ficha.tipo}</dt><dd>{o.rolLabel ?? c.kinds[o.kind]}</dd></div>}
                {cargo && <div><dt>{c.ficha.empleo}</dt><dd>{cargo.company}</dd></div>}
                <div><dt>{o.period ? c.ficha.periodo : c.ficha.anio}</dt><dd>{periodo}</dd></div>
              </dl>
              {o.stack.length > 0 && (
                <>
                  <p className="ing-etq">{c.ficha.piezas}</p>
                  <ul className="ing-chips">{o.stack.map((x) => <li key={x}>{x}</li>)}</ul>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      {o.views.length > 0 && (
        <section className="ing-ficha-escena" aria-label={o.name}>
          <div className="ing-marco">
            <div className="ing-ficha-v">
              <Ventana slug={o.slug} vistas={o.views} activa={vista} url={url} alt={`${o.name} · ${c.ficha.escritorio}`} prioridad />
              <div className="ing-ficha-movil"><Movil slug={o.slug} vistas={o.views} activa={vista} alt={`${o.name} · ${c.ficha.movil}`} /></div>
            </div>
            <div className="ing-ficha-ctrl">
              <p className="ing-fuente">{c.ficha.capturaPie(o.name, vista === 'home' ? c.ficha.home : c.ficha.pdp, `1440 / 390 · ${SHOT_DATE}`)}</p>
              {o.views.includes('pdp') && <Segmentado etiqueta={c.ficha.vista} valor={vista} opciones={[['home', c.ficha.home], ['pdp', c.ficha.pdp]]} onCambio={setVista} />}
            </div>
          </div>
        </section>
      )}

      <section className="ing-ficha-cuerpo">
        <div className={`ing-marco ing-ficha-g${metricas.length ? '' : ' ing-ficha-sola'}`}>
          {metricas.length > 0 && (
            <aside className="ing-riel" aria-label={c.ficha.metricas} data-ing="grupo">
              {metricas.map((m, i) => (
                <div key={i} className="ing-riel-m">
                  <p className="ing-riel-v"><Valor v={m.v} /></p>
                  <p className="ing-riel-e">{m.e}</p>
                  <p className="ing-fuente">{m.f}</p>
                </div>
              ))}
            </aside>
          )}
          <div className="ing-lectura">
            {caso && caso.momentos.length > 0 ? (
              <ol className="ing-lectura-beats" data-ing="grupo">
                {caso.momentos.map((b) => (
                  <li key={b.label}>
                    <h2 className="ing-etq">{b.label}</h2>
                    <p>{b.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              lider && (
                <div data-ing="subir">
                  <h2 className="ing-h3">{c.ficha.historia}</h2>
                  <p className="ing-lectura-lider">{lider}</p>
                  {resto && <p>{resto}</p>}
                </div>
              )
            )}
            {cargo && cargo.highlights.length > 0 && (
              <div data-ing="subir">
                <p className="ing-etq">{c.ficha.segunCv}</p>
                <ul className="ing-lectura-l">{cargo.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {o.slug === 'digitdeck-apps' && (
        <section className="ing-noche" aria-label={c.sistema.fig2.etq}>
          <div className="ing-marco ing-ficha-fig"><Fig2 /></div>
        </section>
      )}

      {lighthouse && (
        <section className="ing-sec ing-medido" aria-labelledby="ing-med-t">
          <div className="ing-marco">
            <Cabecera id="ing-med-t" etq={c.ficha.medido} titulo={c.ficha.medidoT} acento={c.ficha.medidoAcento} texto={c.ficha.lhNota} />
            <div className="ing-tabla-v" data-ing="subir">
              <table className="ing-tabla">
                <caption className="ing-sr">{c.ficha.lighthouse} · {o.name}</caption>
                <thead>
                  <tr>
                    <td />
                    <th scope="col">{c.ficha.rend}</th>
                    <th scope="col">{c.ficha.acc}</th>
                    <th scope="col">SEO</th>
                    <th scope="col">LCP</th>
                  </tr>
                </thead>
                <tbody>
                  {([[c.ficha.escritorio, lighthouse.escritorio], [c.ficha.movil, lighthouse.movil]] as const).map(([etq, d]) => (
                    <tr key={etq}>
                      <th scope="row">{etq}</th>
                      <td data-etq={c.ficha.rend}>{d.perf}</td>
                      <td data-etq={c.ficha.acc}>{d.a11y}</td>
                      <td data-etq="SEO">{d.seo}</td>
                      <td data-etq="LCP">{lcpFmt(d.lcp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="ing-fuente">{c.ficha.lhFuente(lighthouse.fecha)}</p>
            </div>
          </div>
        </section>
      )}

      {siguiente && (
        <section className="ing-siguiente" aria-label={c.ficha.siguiente}>
          <div className="ing-marco">
            <Enlace to={v5path('ingenieria', 'obra', siguiente.slug)} className="ing-siguiente-a">
              <span className="ing-etq">{c.ficha.siguiente}</span>
              <span className="ing-siguiente-n">{siguiente.name}<Flecha /></span>
              {siguiente.tagline && <span className="ing-siguiente-t">{siguiente.tagline}</span>}
            </Enlace>
          </div>
        </section>
      )}
    </main>
  )
}
