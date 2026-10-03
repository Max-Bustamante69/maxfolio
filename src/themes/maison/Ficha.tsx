import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { datosDe, v5path } from '../data'
import { casoCorto, casoGummy, llenar, resultadoDe, sinProtocolo } from './caso'
import { useCopy } from './copy'
import { aterrizar, gsap, useVista, vueloDe } from './motion'
import { Enlace, ID, Marco, Pantalla, Tri } from './piezas'
import { usePublico } from './publico'

type Pestana = 'historia' | 'hechos' | 'oficio'

const Dato = ({ k, children }: { k: string; children: ReactNode }) => <div className="mz-dato"><dt>{k}</dt><dd>{children}</dd></div>
/** «2026-09-09» → «septiembre de 2026»: la fuente de un dato lleva su mes, no una marca de captura. */
const mes = (iso: string, intl: string) => new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric' }).format(new Date(`${iso.slice(0, 7)}-15T12:00:00`))
/** Precio con el símbolo de la moneda («S/ 49», no «PEN 49»). */
const dinero = (n: number, moneda: string, intl: string) => {
  try { return new Intl.NumberFormat(intl, { style: 'currency', currency: moneda, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(n) } catch { return `${Math.round(n)} ${moneda}` }
}
/** Primera frase en tinta y el resto atenuado (también en japonés). */
const partir = (s: string): [string, string] => {
  const [a = '', ...r] = s.split(/(?<=[.!?])\s+|(?<=。)/).filter(Boolean)
  return [a, r.join(/。/.test(s) ? '' : ' ')]
}

/**
 * La ruta monta una Ficha NUEVA por obra e idioma. «Siguiente pieza» cambia solo el :slug: sin esta llave React reutilizaría el
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
  const { git, lighthouse, comercio } = datosDe(slug)
  const resultado = o ? resultadoDe(o, v, c.ficha.fuente) : null
  const caso = !o ? null : o.slug === 'the-gummy-box' ? casoGummy(v, o.link) : casoCorto(o, c.ficha)
  const hayOficio = !!o && (o.stack.length > 0 || !!o.repo || !!lighthouse || !!git)
  const pestanas = (['historia', 'hechos', 'oficio'] as Pestana[]).filter((k) => (k === 'historia' ? !!o?.description : k === 'oficio' ? hayOficio : true))
  const [pestana, setPestana] = useState<Pestana>(pestanas[0])
  const lista = useRef<HTMLDivElement>(null)
  const linea = useRef<HTMLSpanElement>(null)
  const colocada = useRef(false)
  const vuela = vueloDe() === slug

  // La línea de la pestaña activa se traza hasta la nueva (transform: posición y escala de una línea de 100 px).
  useLayoutEffect(() => {
    const activa = lista.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!activa || !linea.current) return
    gsap.to(linea.current, { x: activa.offsetLeft, scaleX: activa.offsetWidth / 100, duration: colocada.current ? 0.5 : 0, ease: 'maison' })
    colocada.current = true
  }, [pestana, o])

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    // La fotografía de la pieza cruza desde el rack hasta este marco; sin pieza de origen (enlace directo, Atrás) el marco se descubre.
    const marco = raiz.querySelector<HTMLElement>('.mz-plano .mz-foto')
    const img = marco?.querySelector<HTMLImageElement>('.mz-foto-1')
    if (marco && img) aterrizar(slug, marco, img, limpiar)
    // La barra inferior aparece cuando el título sale de la ventana por arriba.
    const h1 = raiz.querySelector('h1')
    const barra = raiz.querySelector<HTMLElement>('.mz-barra-pieza')
    if (h1 && barra) {
      const io = new IntersectionObserver(([en]) => { barra.dataset.on = !en.isIntersecting && en.boundingClientRect.bottom < 0 ? '1' : '' }, { rootMargin: '-64px 0px 0px 0px' })
      io.observe(h1)
      limpiar.push(() => io.disconnect())
    }
  })

  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} ref={ref} className="mz-vista">
        <title>{`${c.ficha.noExiste} · ${v.personal.name}`}</title>
        <meta name="robots" content="noindex" />
        <section className="mz-marco mz-cab-pag">
          <h1 className="mz-titulo">{c.ficha.noExiste}</h1>
          <Enlace className="mz-enlace" to={v5path(ID, 'obra')}>{c.ficha.volverObra}<Tri /></Enlace>
        </section>
      </main>
    )
  }

  const periodo = o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year)
  const empresa = o.employer ? v.trayectoria.find((t) => t.id === o.employer)?.company : undefined
  const [primera, resto] = partir(o.description)
  const hechos = o.facts.filter((f) => f.value !== resultado?.hecho)
  const siguiente = (() => {
    const i = v.obras.findIndex((x) => x.slug === o.slug)
    const sig = [...v.obras.slice(i + 1), ...v.obras.slice(0, i)]
    return sig.find((x) => x.views.length) ?? sig[0]
  })()
  const cat = v.strings.sections.caseStudy.commerce
  // El tamaño del catálogo del cliente es un hecho de la tienda, no el resultado de Max: vive en «Hechos».
  const catalogo = comercio
    ? (comercio.priceMin != null && comercio.currency
        ? llenar(cat.catalogLine, { products: comercio.products, collections: comercio.collections ?? 0, price: dinero(comercio.priceMin, comercio.currency, v.intlLocale) })
        : llenar(cat.catalogLineNoPrice, { products: comercio.products, collections: comercio.collections ?? 0 }))
    : null
  const alTeclas = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = pestanas.indexOf(pestana)
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const sig = pestanas[(i + d + pestanas.length) % pestanas.length]
    setPestana(sig)
    lista.current?.querySelector<HTMLElement>(`#mz-tab-${sig}`)?.focus()
  }
  const nombreVista = (k: 'home' | 'pdp') => (k === 'home' ? c.ficha.home : c.ficha.pdp)
  // La medición de laboratorio y el git, si se muestran, van en una línea de 12 px al final de «Oficio»: no son el resultado.
  const par = (a: { perf: number; a11y: number; seo: number }) => `${a.perf} · ${a.a11y} · ${a.seo}`

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="mz-vista">
      <title>{`${o.name} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="mz-marco mz-ficha" aria-labelledby="mz-h1">
        {/* El plano ocupa siempre la columna fija de la mitad izquierda: la fotografía, la pantalla de la tienda sobre la losa o, sin ninguna de las dos, su alcance en tipografía. */}
        <div className="mz-plano">
          {o.views.length > 0 ? (
            <Marco o={o} alt={`${o.name} · ${c.ficha.home}`} prioridad velo={!vuela} clase="mz-foto-plano" />
          ) : (
            <div className="mz-plano-tipo" data-mz="velo">
              <p className="mz-etq">{[c.kinds[o.kind], o.year].join(' · ')}</p>
              {o.stack.length > 0 ? (
                <div className="mz-plano-tipo-pila">
                  <p className="mz-etq">{c.ficha.pila}</p>
                  <ul>{o.stack.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              ) : (
                <p className="mz-display mz-plano-tipo-t">{o.tagline}</p>
              )}
            </div>
          )}
        </div>

        <div className="mz-ficha-datos">
          <Enlace className="mz-enlace mz-volver" to={v5path(ID, 'obra')}><Tri atras />{c.ficha.volver}</Enlace>
          <p className="mz-etq" data-mz="subir">{[o.industry, o.rolLabel ?? c.kinds[o.kind], o.year, o.status === 'dev' ? c.ficha.enConstruccion : ''].filter(Boolean).join(' · ')}</p>
          <h1 id="mz-h1" className="mz-titulo mz-ficha-h1" data-mz="linea">{o.name}</h1>

          {/* En el lugar del precio: la cifra del proyecto con su fuente o, si el registro no sostiene ninguna, el alcance con las palabras del cliente. */}
          {resultado ? (
            <div className="mz-precio" data-mz="subir" data-mz-retraso="0.25">
              {o.tagline && <p className="mz-nota mz-precio-alcance">{o.tagline}</p>}
              {resultado.que && <p className="mz-etq">{resultado.que}</p>}
              <p className="mz-cifra-v mz-precio-cifra">{resultado.cifra}</p>
              {resultado.nota && <p className="mz-mini">{resultado.nota}</p>}
            </div>
          ) : o.tagline && (
            <div className="mz-precio" data-mz="subir" data-mz-retraso="0.25">
              <p className="mz-etq">{c.ficha.alcance}</p>
              <p className="mz-display mz-precio-linea">{o.tagline}</p>
            </div>
          )}

          <div className="mz-tabs" data-mz="subir" data-mz-retraso="0.3">
            <div className="mz-tabs-lista" role="tablist" aria-label={c.ficha.tabs} ref={lista} onKeyDown={alTeclas}>
              {pestanas.map((k) => (
                <button key={k} id={`mz-tab-${k}`} type="button" role="tab" aria-selected={pestana === k} aria-controls={`mz-pan-${k}`} tabIndex={pestana === k ? 0 : -1} onClick={() => setPestana(k)}>{c.ficha[k]}</button>
              ))}
              <span className="mz-tabs-linea" ref={linea} aria-hidden="true" />
            </div>
            <div className="mz-paneles">
              {pestanas.includes('historia') && <div id="mz-pan-historia" role="tabpanel" aria-labelledby="mz-tab-historia" className="mz-panel" data-on={pestana === 'historia'} inert={pestana !== 'historia'}>
                {caso ? (
                  <ol className="mz-caso-l">
                    {caso.map((b) => <li key={b.label}><p className="mz-etq">{b.label}</p><p className="mz-cuerpo">{b.body}</p></li>)}
                  </ol>
                ) : (
                  <p className="mz-nota-grande"><span>{primera}</span>{resto && <> <span className="mz-apagado">{resto}</span></>}</p>
                )}
              </div>}
              <div id="mz-pan-hechos" role="tabpanel" aria-labelledby="mz-tab-hechos" className="mz-panel" data-on={pestana === 'hechos'} inert={pestana !== 'hechos'}>
                <dl className="mz-datos">
                  {o.industry && <Dato k={c.ficha.rubro}>{o.industry}</Dato>}
                  <Dato k={c.ficha.rol}>{o.rolLabel ?? c.kinds[o.kind]}</Dato>
                  {empresa && <Dato k={c.ficha.empleo}>{empresa}</Dato>}
                  <Dato k={o.period ? c.ficha.periodo : c.ficha.anio}>{periodo}</Dato>
                  {hechos.map((f, i) => <Dato key={i} k={f.label}>{f.value}</Dato>)}
                  {catalogo && comercio && <Dato k={c.ficha.catalogo}>{catalogo}<small>{c.ficha.catalogoNota(mes(comercio.fecha, v.intlLocale))}</small></Dato>}
                </dl>
              </div>
              {hayOficio && <div id="mz-pan-oficio" role="tabpanel" aria-labelledby="mz-tab-oficio" className="mz-panel" data-on={pestana === 'oficio'} inert={pestana !== 'oficio'}>
                <dl className="mz-datos">
                  {o.stack.length > 0 && <Dato k={c.ficha.pila}>{o.stack.join(' · ')}</Dato>}
                  {o.repo && <Dato k={c.ficha.codigo}><a className="mz-enlace" href={o.repo} target="_blank" rel="noopener noreferrer">{sinProtocolo(o.repo)}<Tri /></a></Dato>}
                </dl>
                {(lighthouse || git) && (
                  <p className="mz-mini mz-medidas">
                    {lighthouse && <span>{c.ficha.medidasMovil(par(lighthouse.movil), par(lighthouse.escritorio), mes(lighthouse.fecha, v.intlLocale))} </span>}
                    {git && <span>{c.ficha.medidasGit(git.commits, git.sections, mes(git.fecha, v.intlLocale))}</span>}
                  </p>
                )}
              </div>}
            </div>
          </div>

          {(o.link || o.repo) && (
            <div className="mz-acciones">
              {o.link && <a className="mz-btn" href={o.link} target="_blank" rel="noopener noreferrer">{c.ficha.visitar}</a>}
              {o.repo && <a className="mz-btn mz-btn-vacio" href={o.repo} target="_blank" rel="noopener noreferrer">{c.ficha.verCodigo}</a>}
            </div>
          )}
        </div>
      </section>

      {o.views.length > 0 && (
        <section className="mz-mosaico-sec" aria-labelledby="mz-capt-t">
          <div className="mz-marco mz-mosaico-cab">
            <h2 id="mz-capt-t" className="mz-titulo-sec" data-mz="linea">{c.ficha.capturas}</h2>
            <p className="mz-mini">{c.ficha.capturasNota}</p>
          </div>
          <div className="mz-mosaico">
            {o.views.map((k) => (
              <div key={k} className="mz-mosaico-par">
                <figure className="mz-mosaico-d">
                  <Pantalla slug={o.slug} vista={k} vp="desktop" alt={`${o.name} · ${nombreVista(k)} · ${c.ficha.escritorio}`} />
                  <figcaption className="mz-mini">{c.ficha.pantalla(nombreVista(k), c.ficha.escritorio)}</figcaption>
                </figure>
                <figure className="mz-mosaico-m">
                  <Pantalla slug={o.slug} vista={k} vp="mobile" alt={`${o.name} · ${nombreVista(k)} · ${c.ficha.movil}`} />
                  <figcaption className="mz-mini">{c.ficha.pantalla(nombreVista(k), c.ficha.movil)}</figcaption>
                </figure>
              </div>
            ))}
          </div>
        </section>
      )}

      {siguiente && (
        <section className="mz-marco mz-siguiente" aria-label={c.ficha.siguiente}>
          <i className="mz-filete" data-mz="trazo" aria-hidden="true" />
          <Enlace className="mz-siguiente-a" to={v5path(ID, 'obra', siguiente.slug)}>
            <span className="mz-etq">{c.ficha.siguiente}</span>
            <span className="mz-titulo">{siguiente.name}<Tri /></span>
            {siguiente.tagline && <span className="mz-nota">{siguiente.tagline}</span>}
          </Enlace>
        </section>
      )}

      {(o.link || o.repo) && (
        <div className="mz-barra-pieza" data-on="">
          <div className="mz-marco mz-barra-pieza-in">
            <p className="mz-barra-pieza-n"><b>{o.name}</b> <span>{o.industry ?? c.kinds[o.kind]}</span></p>
            <a className="mz-btn mz-btn-chico" href={o.link ?? o.repo} target="_blank" rel="noopener noreferrer">{o.link ? c.ficha.visitar : c.ficha.verCodigo}</a>
          </div>
        </div>
      )}
    </main>
  )
}
