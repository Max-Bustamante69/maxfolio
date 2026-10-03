import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { formatMoney } from '../../data/commerceLines'
import { datosDe, SHOT_DATE, sinPuntoFinal, v5path } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { fechaCorta, medidasDe, periodoCorto } from './casos'
import { capaEstado, ID, usePlato } from './contexto'
import { control } from './escena/control'
import { indiceDe, ORDEN } from './escena/sets'
import { TINTES } from './escena/tintes'
import { alcanceDe } from './alcance'
import { aterrizar, despegar, gsap, useVista } from './motion'
import { Cruces, Dato, Enlace, Flecha, Rod, ruta } from './piezas'
import { partirFrase } from './publico'

const llenar = (t: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t)
const sinProtocolo = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

interface Tiempo { label: string; body?: string; lineas?: string[] }

/** La ruta monta una Ficha NUEVA por obra e idioma: «Siguiente» solo cambia el :slug y sin esta llave React reutilizaría el componente. */
export default function FichaRuta() {
  const { slug = '' } = useParams()
  const { locale } = useLanguage()
  return <Ficha key={`${slug}:${locale}`} slug={slug} />
}

function Ficha({ slug }: { slug: string }) {
  const { c, v, en3d } = usePlato()
  const { locale } = useLanguage()
  const o = v.obra(slug)
  const [elegida, setVista] = useState<'home' | 'pdp'>('home')
  const vista = o?.views.includes(elegida) ? elegida : 'home'
  const i3 = indiceDe(slug)
  const con3d = en3d && !!o && i3 >= 0

  // El pedestal: la cámara baja en grúa hasta la plataforma de esta obra y rodea el teléfono.
  useEffect(() => {
    if (!con3d) return
    control.set({ modo: 'pedestal', slug, vista })
    control.volver = i3
    capaEstado(true)
  }, [con3d, slug, vista, i3])

  const ref = useVista<HTMLElement>([con3d], (raiz, limpiar) => {
    // 2D: la captura de la tarjeta cruza hasta este marco; sin tarjeta de origen (enlace directo, Atrás) el marco simplemente entra.
    const marco = raiz.querySelector<HTMLElement>('.pl-fh-pantalla')
    if (marco && !con3d) {
      // El teléfono y el conmutador esperan a que la captura aterrice: no quedan flotando sobre una página en blanco.
      const acompana = raiz.querySelectorAll('.pl-fh-tel, .pl-fh-vitrina .pl-segm')
      if (aterrizar(slug, marco, limpiar, () => gsap.to(acompana, { opacity: 1, duration: 0.45, ease: 'pl', clearProps: 'opacity' }))) gsap.set(acompana, { opacity: 0 })
    }
  })

  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} ref={ref} className="pl-vista pl-ficha">
        <title>{`${c.ficha.noExiste} · ${v.personal.name}`}</title>
        <meta name="robots" content="noindex" />
        <section className="pl-fh pl-fh--2d" data-tono="claro">
          <div className="pl-fh-texto">
            <h1 className="pl-fh-h1">{c.ficha.noExiste}</h1>
            <Enlace className="pl-pil pl-pil--osc" to={ruta('obra')}><Rod>{c.ficha.volverObra}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>
          </div>
        </section>
      </main>
    )
  }

  const { lighthouse, comercio, git } = datosDe(o.slug)
  const periodo = o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year)
  const empresa = o.employer ? v.trayectoria.find((t) => t.id === o.employer)?.company : undefined
  const hayPdp = o.views.includes('pdp')
  const tinte = TINTES[o.slug]
  const fecha = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(v.intlLocale, { day: 'numeric', month: 'long', year: 'numeric' })
  const medidas = medidasDe(o, locale, (iso) => fechaCorta(iso, v.intlLocale), periodo)

  // El siguiente: dentro del recorrido, el lote que sigue; fuera, la siguiente obra con captura.
  const orden = con3d ? ORDEN.map((s) => v.obra(s)).filter((x): x is NonNullable<typeof x> => !!x) : v.obras
  const k = orden.findIndex((x) => x.slug === o.slug)
  const resto = [...orden.slice(k + 1), ...orden.slice(0, Math.max(0, k))]
  const siguiente = (con3d ? resto[0] : resto.find((x) => x.views.length) ?? resto[0])
  const anterior = con3d ? orden[(k - 1 + orden.length) % orden.length] : undefined

  const cat = v.strings.sections.caseStudy.commerce
  const catalogo = comercio
    ? (comercio.priceMin != null && comercio.currency
        ? llenar(cat.catalogLine, { products: comercio.products, collections: comercio.collections ?? 0, price: formatMoney(comercio.priceMin, comercio.currency, v.intlLocale) })
        : llenar(cat.catalogLineNoPrice, { products: comercio.products, collections: comercio.collections ?? 0 }))
    : null

  // La historia. The Gummy Box: los cuatro tiempos del vivo con sus cifras. Las demás tiendas: el encargo (primera frase del registro) y lo que se
  // construyó (el resto); si el registro tiene una sola frase, el titular es el alcance. Ninguna cifra nueva.
  const fb = v.strings.sections.featuredBuild
  const [primera, restoDesc] = partirFrase(o.description)
  const lhBueno = lighthouse && lighthouse.escritorio.perf >= 90 ? lighthouse : null
  const esGummy = o.slug === 'the-gummy-box' && !!git && !!lighthouse
  let kicker = c.ficha.caso
  let lead = primera || o.tagline
  let tiempos: Tiempo[] | null = null
  if (esGummy && git && lighthouse) {
    kicker = fb.eyebrow
    lead = `${fb.title} ${sinPuntoFinal(fb.titleAccent)}`
    tiempos = fb.beats.map((b) => ({
      label: b.label,
      body: llenar(b.body, {
        ladder: v.registry.stores.find((s) => s.slug === o.slug)?.facts.find((f) => f.id === 'ladder')?.value ?? '',
        sections: git.sections, blocks: git.blocks ?? 0, trackedComponents: git.trackedComponents ?? 0,
        url: o.link ? sinProtocolo(o.link) : '',
        perfDesktop: lighthouse.escritorio.perf, a11yDesktop: lighthouse.escritorio.a11y, seoDesktop: lighthouse.escritorio.seo,
        lcpDesktop: (lighthouse.escritorio.lcp ?? 0).toFixed(2),
      }),
    }))
  } else if (o.description) {
    if (restoDesc) kicker = c.ficha.encargo
    else lead = alcanceDe(o, locale)
    tiempos = [{ label: c.ficha.construi, body: restoDesc || primera }]
  }

  const etqLote = con3d ? `${c.obra.lote} ${String(i3 + 1).padStart(2, '0')} / ${ORDEN.length} · ${o.year}` : [o.industry, o.rolLabel ?? c.kinds[o.kind], o.year].filter(Boolean).join(' · ')
  const vistas = o.views
  const iVista = Math.max(0, vistas.indexOf(vista))
  // Una sola línea mono con el rol, la ventana y el rubro; lo medido va en grande justo debajo.
  const linea = [o.rolLabel ?? c.kinds[o.kind], periodoCorto(periodo), o.industry].filter(Boolean).join(' · ')
  const nombreLh = (n: number | null) => (n == null ? '' : n.toLocaleString(v.intlLocale, { maximumFractionDigits: 2 }))

  // «‹ Obra» en 2D: la captura de la ficha vuelve volando a su tarjeta (la lista la recibe con vueloDe).
  const volar = (e: MouseEvent) => {
    if (con3d || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const marco = document.querySelector<HTMLElement>('.pl-fh-pantalla')
    const img = marco?.querySelector<HTMLImageElement>('.pl-cap--on')
    if (marco && img) despegar(o.slug, marco, img)
  }

  const etiqueta = (
    <div className="pl-fh-texto" data-pl="grupo" data-pl-retraso="0.08">
      <Enlace className="pl-fh-volver pl-mono" to={ruta('obra')} directo oscuro={con3d} onClick={volar}><Flecha izq /> {con3d ? c.ficha.fachada : c.ficha.volver}</Enlace>
      <p className="pl-mono pl-fh-lote"><i aria-hidden="true" />{etqLote}</p>
      <h1 className="pl-fh-h1">{o.name}</h1>
      {o.tagline && <p className="pl-fh-sub">{o.tagline}</p>}
      <p className="pl-mono pl-fh-linea">{linea}</p>
      {medidas.length > 0 && (
        <ul className="pl-fh-medido" aria-label={c.ficha.medido}>
          {medidas.map((m) => (
            <li key={m.etq} className="pl-fh-m">
              <b>{m.valor}</b>
              <span className="pl-mono">{m.etq}</span>
              <span className="pl-mono pl-fh-m-nota">{m.nota}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="pl-fh-acc">
        {o.link && <a className={`pl-pil ${con3d ? 'pl-pil--tung' : 'pl-pil--osc'}`} href={o.link} target="_blank" rel="noopener noreferrer"><Rod>{o.kind === 'store' ? c.ficha.visitar : c.ficha.visitarSitio}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></a>}
        {o.repo && <a className="pl-pil pl-pil--clara" href={o.repo} target="_blank" rel="noopener noreferrer"><Rod>{c.ficha.repo}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></a>}
      </div>
    </div>
  )

  const nombreVista = (vv: 'home' | 'pdp') => (vv === 'home' ? c.ficha.home : c.ficha.pdp)

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className={`pl-vista pl-ficha${con3d ? ' pl-ficha--3d' : ''}`} style={tinte ? ({ '--marca': tinte } as CSSProperties) : undefined}>
      <title>{`${o.name} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className={`pl-fh ${con3d ? 'pl-fh--3d' : 'pl-fh--2d'}`} data-tono={con3d ? 'oscuro' : 'claro'} aria-label={o.name}>
        {etiqueta}
        {con3d ? (
          <div className="pl-fh-ctrl">
            <div className="pl-fh-vista">
              <span className="pl-mono pl-fh-cont">{iVista + 1} / {vistas.length}</span>
              {hayPdp && (
                <div className="pl-segm" role="group" aria-label={c.ficha.vista}>
                  <button type="button" aria-pressed={vista === 'home'} onClick={() => setVista('home')}>{c.ficha.home}</button>
                  <button type="button" aria-pressed={vista === 'pdp'} onClick={() => setVista('pdp')}>{c.ficha.pdp}</button>
                </div>
              )}
            </div>
            <div className="pl-fh-sig">
              {anterior && <Enlace to={ruta('obra', anterior.slug)} directo oscuro className="pl-redondo" aria-label={`${c.ficha.anterior}: ${anterior.name}`}><Flecha izq /></Enlace>}
              {siguiente && <Enlace to={ruta('obra', siguiente.slug)} directo oscuro className="pl-pil pl-pil--clara"><Rod>{`${c.ficha.siguiente} · ${siguiente.name}`}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>}
            </div>
          </div>
        ) : o.views.length > 0 ? (
          <div className="pl-fh-vitrina">
            <div className="pl-fh-pantalla">
              {vistas.map((vv) => <ShotImg key={vv} slug={o.slug} vista={vv} vp="desktop" alt={vv === vista ? `${o.name} · ${c.ficha.escritorio}` : ''} aria-hidden={vv === vista ? undefined : true} prioridad={vv === vistas[0]} className={vv === vista ? 'pl-cap pl-cap--on' : 'pl-cap'} />)}
            </div>
            <div className="pl-fh-tel">
              {vistas.map((vv) => <ShotImg key={vv} slug={o.slug} vista={vv} vp="mobile" alt={vv === vista ? `${o.name} · ${c.ficha.movil}` : ''} aria-hidden={vv === vista ? undefined : true} className={vv === vista ? 'pl-cap pl-cap--on' : 'pl-cap'} />)}
            </div>
            {hayPdp && (
              <div className="pl-segm pl-segm--claro" role="group" aria-label={c.ficha.vista}>
                <button type="button" aria-pressed={vista === 'home'} onClick={() => setVista('home')}>{c.ficha.home}</button>
                <button type="button" aria-pressed={vista === 'pdp'} onClick={() => setVista('pdp')}>{c.ficha.pdp}</button>
              </div>
            )}
          </div>
        ) : (
          // Sin captura pública no se inventa una: el plano del año (los anillos del pedestal) ocupa su lugar.
          <div className="pl-fh-vitrina">
            <div className="pl-plano" role="img" aria-label={`${o.name} · ${o.year}`}>
              <span className="pl-mono pl-plano-k">{c.ficha.plano}</span>
              <span className="pl-plano-anio" aria-hidden="true">{o.year}</span>
              <span className="pl-plano-n" aria-hidden="true">{o.name}</span>
              <Cruces />
            </div>
          </div>
        )}
      </section>

      <section className="pl-caso" data-tono="claro" aria-labelledby="pl-caso-t">
        <div className="pl-caso-izq">
          <h2 id="pl-caso-t" className="pl-mono pl-kicker pl-kicker--claro" data-pl="subir">{kicker}</h2>
          {lead && <p className="pl-caso-lead" data-pl="linea">{lead}</p>}
        </div>
        <div className="pl-caso-der">
          {tiempos ? (
            <ol className="pl-beats" data-pl="grupo">
              {tiempos.map((b) => (
                <li key={b.label}>
                  <p className="pl-mono pl-beat-k">{b.label}</p>
                  {b.body && <p className="pl-beat-t">{b.body}</p>}
                  {b.lineas && <ul className="pl-beat-l">{b.lineas.map((l) => <li key={l}>{l}</li>)}</ul>}
                </li>
              ))}
            </ol>
          ) : (
            <div data-pl="grupo" className="pl-caso-simple">
              {!o.views.length && !o.description && <p className="pl-caso-txt">{c.ficha.sinCaptura}</p>}
            </div>
          )}
        </div>
      </section>

      {lhBueno && (
        <section className="pl-medido-s" data-tono="claro" aria-labelledby="pl-med-t">
          <h2 id="pl-med-t" className="pl-h-m" data-pl="linea">{c.ficha.medidoTitulo}</h2>
          <table className="pl-lh-t" data-pl="subir">
            <thead>
              <tr>
                <th scope="col"><span className="pl-sr">{c.ficha.lighthouse}</span></th>
                <th scope="col" className="pl-mono">{c.ficha.rend}</th>
                <th scope="col" className="pl-mono">{c.ficha.acc}</th>
                <th scope="col" className="pl-mono">{c.ficha.seo}</th>
                <th scope="col" className="pl-mono">LCP</th>
              </tr>
            </thead>
            <tbody>
              {([[c.ficha.escritorio, lhBueno.escritorio], [c.ficha.movil, lhBueno.movil]] as const).map(([n, m]) => (
                <tr key={n}>
                  <th scope="row" className="pl-mono">{n}</th>
                  <td>{m.perf}</td><td>{m.a11y}</td><td>{m.seo}</td><td>{m.lcp != null ? `${nombreLh(m.lcp)} s` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pl-nota" data-pl="subir">{c.ficha.lhNota(fecha(lhBueno.fecha))}</p>
        </section>
      )}

      {o.views.length > 0 && (
        <section className="pl-caps" data-tono="claro" aria-labelledby="pl-caps-t">
          <h2 id="pl-caps-t" className="pl-h-m" data-pl="linea">{c.ficha.capturas}</h2>
          <div className="pl-caps-rejilla">
            {o.views.map((vv) => (
              <div key={vv} className="pl-par">
                <figure className="pl-cap-fig">
                  <div className="pl-cap-marco" data-pl="ventana"><ShotImg slug={o.slug} vista={vv} vp="desktop" alt={`${o.name} · ${nombreVista(vv)} · ${c.ficha.escritorio}`} /></div>
                  <figcaption className="pl-mono">{nombreVista(vv)} · {c.ficha.escritorioLbl}</figcaption>
                </figure>
                <figure className="pl-cap-fig pl-cap-fig--m">
                  <div className="pl-cap-marco pl-cap-marco--m" data-pl="ventana"><ShotImg slug={o.slug} vista={vv} vp="mobile" alt={`${o.name} · ${nombreVista(vv)} · ${c.ficha.movil}`} /></div>
                  <figcaption className="pl-mono">{nombreVista(vv)} · {c.ficha.movilLbl}</figcaption>
                </figure>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pl-hoja-d" data-tono="claro" aria-labelledby="pl-hoja-t">
        <h2 id="pl-hoja-t" className="pl-h-m" data-pl="linea">{c.ficha.hoja}</h2>
        <dl className="pl-datos" data-pl="subir">
          <Dato k={c.ficha.pila}>{o.stack.join(' · ')}</Dato>
          {empresa && <Dato k={c.ficha.empleo}>{empresa}</Dato>}
          {catalogo && comercio && <Dato k={c.ficha.catalogo}>{catalogo}<small>{c.ficha.catalogoNota(fecha(comercio.fecha))}</small></Dato>}
          {o.views.length > 0 && <Dato k={c.ficha.capturas}>{c.ficha.capturasDe(fecha(SHOT_DATE))}</Dato>}
          {o.repo && <Dato k={c.ficha.repo}><a className="pl-enlace" href={o.repo} target="_blank" rel="noopener noreferrer">{sinProtocolo(o.repo)}</a></Dato>}
          {o.link && <Dato k={c.ficha.visitarSitio}><a className="pl-enlace" href={o.link} target="_blank" rel="noopener noreferrer">{sinProtocolo(o.link)}</a></Dato>}
        </dl>
      </section>

      {siguiente && (
        <section className="pl-sig" data-tono="claro" aria-label={c.ficha.siguiente}>
          <Enlace className="pl-sig-a" to={v5path(ID, 'obra', siguiente.slug)} oscuro={false}>
            <span className="pl-mono">{c.ficha.siguiente}</span>
            <span className="pl-sig-n">{siguiente.name}<Flecha /></span>
            {siguiente.tagline && <span className="pl-sig-t">{siguiente.tagline}</span>}
          </Enlace>
          <Cruces />
        </section>
      )}
    </main>
  )
}
