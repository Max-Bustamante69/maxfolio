import { Fragment, type MouseEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { formatMoney } from '../../data/commerceLines'
import { datosDe, SHOT_DATE, v5path } from '../data'
import { useCopy } from './copy'
import { Medido } from './figuras'
import { ABRIR_METODO, Riel } from './marco'
import { aterrizar, despegar, escena, gsap, useVista, vueloDe } from './motion'
import { Chevron, Enlace, Fig, flechas, Flecha, Insignia, Lamina, Numeral, Tarjeta } from './piezas'
import { capacidadesDe, insignia, numerico, partirFrase, usePublico, type CapacidadId } from './publico'

const Dato = ({ k, children }: { k: string; children: ReactNode }) => (
  <div className="rp-dato"><dt className="rp-mono">{k}</dt><dd>{children}</dd></div>
)
const llenar = (t: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t)
const sinProtocolo = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
/** Productos que corren dentro de las tiendas: la capacidad que pone cada uno en producción. */
const CORRE_EN: Record<string, CapacidadId> = { 'digitdeck-apps': 'bundles' }
/** Lo que el cargo de CTO dejó en un producto propio: los puntos del CV (por posición) que lo describen. */
const DEL_CTO: Record<string, number[]> = { 'digitdeck-apps': [1, 2] }
const num2 = (n: number) => String(n).padStart(2, '0')

/** La ruta monta una Ficha NUEVA por obra e idioma: «Siguiente» cambia solo el :slug y sin esta llave React reutilizaría el componente. */
export default function FichaRuta() {
  const { slug = '' } = useParams()
  const { locale } = useLanguage()
  return <Ficha key={`${slug}:${locale}`} slug={slug} />
}

function Ficha({ slug }: { slug: string }) {
  const c = useCopy()
  const v = usePublico()
  const o = v.obra(slug)

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    const marco = raiz.querySelector<HTMLElement>('.rp-lamina-placa .rp-placa-img')
    const tel = raiz.querySelector<HTMLElement>('.rp-lamina-tel')
    // La captura de la tarjeta cruza hasta este marco; sin tarjeta de origen (enlace directo, «Siguiente») la placa se descubre sola.
    if (marco) {
      const llega = () => tel && gsap.fromTo(tel, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.9, ease: 'rep', clearProps: 'transform,opacity' })
      if (tel) gsap.set(tel, { opacity: 0 })
      if (!aterrizar(slug, marco, limpiar, { alTerminar: llega })) limpiar.push(((t) => () => t.kill())(gsap.delayedCall(0.55, llega)))
    }
    // El teléfono sube más despacio que la página: paralaje con scrub.
    if (tel) limpiar.push(escena(tel, gsap.timeline().fromTo(tel.firstElementChild, { y: 36 }, { y: -36, ease: 'none' }), { modo: 'paso', suave: 0.4 }))
  })

  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} ref={ref} className="rp-vista">
        <title>{`${c.ficha.noExiste} · ${v.personal.name}`}</title>
        <meta name="robots" content="noindex" />
        <header className="rp-encabezado rp-marco">
          <h1 className="rp-h1 rp-h1-medio">{c.ficha.noExiste}</h1>
          <Enlace className="rp-enlace" to={v5path('reportaje', 'obra')} num={c.capitulo.obra} titulo={c.nav.obra}><Chevron izquierda />{c.ficha.volverObra}</Enlace>
        </header>
      </main>
    )
  }

  const { git, lighthouse, comercio } = datosDe(o.slug)
  const periodo = o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year)
  const cargo = o.employer ? v.trayectoria.find((t) => t.id === o.employer) : undefined
  const cto = DEL_CTO[o.slug] ? v.trayectoria.find((t) => t.id === 'digitdeck-cto') : undefined
  const siguiente = (() => {
    const i = v.obras.findIndex((x) => x.slug === o.slug)
    const resto = [...v.obras.slice(i + 1), ...v.obras.slice(0, i)]
    return resto.find((x) => x.views.length) ?? resto[0]
  })()
  const pdp = o.views.includes('pdp')
  const filtros = v.strings.sections.shopify.filters as Record<string, string>
  const caps = capacidadesDe(o)
  const resultado = insignia(o.slug, v)

  // La historia: el caso completo de The Gummy Box (problema, plan, construcción, resultado: los mismos registros que el vivo) o,
  // para las demás obras, su descripción con la primera frase como entrada. Las medidas de laboratorio de la construcción y el
  // resultado no van en el flujo: viven en «Fuentes y método».
  const fb = v.strings.sections.featuredBuild
  const caso = o.slug === 'the-gummy-box' && git && lighthouse
    ? fb.beats.map((b, i) => ({
        label: b.label,
        metric: i < 2 ? llenar(b.metric, { ladder: o.facts[0]?.value ?? '' }) : '',
        body: llenar(b.body, {
          ladder: v.registry.stores.find((s) => s.slug === o.slug)?.facts.find((f) => f.id === 'ladder')?.value ?? '',
          sections: git.sections, blocks: git.blocks ?? 0, trackedComponents: git.trackedComponents ?? 0,
          url: o.link ? sinProtocolo(o.link) : '',
          perfDesktop: lighthouse.escritorio.perf, a11yDesktop: lighthouse.escritorio.a11y, seoDesktop: lighthouse.escritorio.seo,
          lcpDesktop: (lighthouse.escritorio.lcp ?? 0).toFixed(2),
        }),
      }))
    : null
  const historia = o.description || cargo?.summary || ''
  const [entrada, cuerpo] = partirFrase(historia)

  const cat = v.strings.sections.caseStudy.commerce
  const catalogo = comercio
    ? (comercio.priceMin != null && comercio.currency
        ? llenar(cat.catalogLine, { products: comercio.products, collections: comercio.collections ?? 0, price: formatMoney(comercio.priceMin, comercio.currency, v.intlLocale) })
        : llenar(cat.catalogLineNoPrice, { products: comercio.products, collections: comercio.collections ?? 0 }))
    : null

  const destacados = o.facts.filter((f) => numerico(f.value)).slice(0, 2)
  const datos = o.facts.filter((f) => !destacados.includes(f))

  // La suite de apps: sus cinco módulos, las cifras del cargo que la construyó y las tiendas donde corre.
  const suite = o.slug === 'digitdeck-apps'
  const cifrasCto = v.registry.experience.find((e) => e.id === 'digitdeck-cto')?.metrics ?? []
  const corre = CORRE_EN[o.slug]
  const dondeCorre = corre ? v.obras.filter((x) => x.kind === 'store' && x.views.length && capacidadesDe(x).includes(corre)) : []

  // Más obra con la misma capacidad (la primera del stack), con captura y distinta de esta.
  const rel = caps[0]
  const parecidas = rel ? v.obras.filter((x) => x.kind === 'store' && x.views.length && x.slug !== o.slug && capacidadesDe(x).includes(rel)).slice(0, 3) : []

  // «‹ Obra»: la captura de la home vuelve volando a su tarjeta (la lista la recibe con vueloDe).
  const volar = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const marco = document.querySelector<HTMLElement>('.rp-lamina-placa .rp-placa-img')
    const img = marco?.querySelector('img')
    if (marco && img) despegar(o.slug, marco, img)
  }

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="rp-vista">
      <title>{`${o.name} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <header className="rp-ficha-cab rp-marco">
        <p className="rp-ficha-meta rp-mono" data-rp="subir">
          <Enlace className="rp-enlace rp-volver" to={v5path('reportaje', 'obra')} hoja={false} onClick={volar}><Chevron izquierda />{c.ficha.volver}</Enlace>
          <span>{[o.industry, o.rolLabel ?? c.kinds[o.kind], o.year].filter(Boolean).join(' · ')}</span>
        </p>
        <h1 className="rp-h1 rp-ficha-h1" data-rp="linea">{o.name}</h1>
        <div className="rp-ficha-fila">
          {o.tagline && <p className="rp-dek" data-rp="subir" data-rp-retraso="0.2">{o.tagline}</p>}
          {(o.link || o.repo) && (
            <div className="rp-acciones" data-rp="subir" data-rp-retraso="0.3">
              {o.link && <a className="rp-btn rp-btn-pri" href={o.link} target="_blank" rel="noopener noreferrer">{c.ficha.visitar}<Flecha /></a>}
              {o.repo && <a className="rp-btn rp-btn-linea" href={o.repo} target="_blank" rel="noopener noreferrer">{c.ficha.repo}</a>}
            </div>
          )}
        </div>
      </header>

      {o.views.length > 0 && (
        <section className="rp-marco" aria-label={o.name}>
          <Lamina o={o} prioridad animar={vueloDe() !== o.slug} />
          <p className="rp-pie-captura rp-mono">{c.ficha.capturaDe[o.slug] ?? `${c.ficha.figHome} · ${c.ficha.capturas(o.name, SHOT_DATE)}`}</p>
        </section>
      )}

      <section className="rp-ficha-cuerpo rp-marco" aria-label={c.ficha.historia}>
        <div className="rp-historia">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.ficha.historia}</p>
          {caso ? (
            <ol className="rp-caso" data-rp="grupo">
              {caso.map((b, i) => (
                <li key={b.label}>
                  <p className="rp-mono rp-caso-e"><span>{['I', 'II', 'III', 'IV'][i]}</span>{b.label}</p>
                  <p className="rp-caso-t">{flechas(b.body)}</p>
                  {b.metric && <p className="rp-caso-m rp-mono">{flechas(b.metric)}</p>}
                </li>
              ))}
            </ol>
          ) : historia ? (
            <>
              <p className="rp-entrada" data-rp="linea">{flechas(entrada)}</p>
              {cuerpo && <p className="rp-cuerpo" data-rp="subir" data-rp-retraso="0.15">{flechas(cuerpo)}</p>}
            </>
          ) : (
            <p className="rp-cuerpo rp-tenue">{c.ficha.sinCapturaNota}</p>
          )}
          {destacados.length > 0 && (
            <ul className="rp-hechos" data-rp="grupo">
              {destacados.map((f) => (
                <li key={f.label}><span className="rp-hecho-n"><Numeral valor={f.value} /></span><span className="rp-hecho-e">{f.label}</span></li>
              ))}
            </ul>
          )}
          {suite && (
            <div className="rp-suite-ficha" data-rp="subir">
              <p className="rp-mono rp-cargo-sub">{c.ficha.suite}</p>
              <p className="rp-nota">{c.ficha.suiteNota}</p>
              <ol className="rp-modulos">{c.ficha.modulos.map((m, i) => <li key={m}><span className="rp-mono">{num2(i + 1)}</span>{m}</li>)}</ol>
              <ul className="rp-hechos">
                {cifrasCto.filter((m) => m.id === 'modules' || m.id === 'tests').map((m) => (
                  <li key={m.id}><span className="rp-hecho-n"><Numeral valor={m.value} /></span><span className="rp-hecho-e">{m.id === 'modules' ? c.ficha.suiteCifras.modulos : c.ficha.suiteCifras.pruebas}</span></li>
                ))}
              </ul>
            </div>
          )}
          {caps.length > 0 && !suite && (
            <div className="rp-cargo-nota" data-rp="subir">
              <p className="rp-mono">{c.ficha.queHace}</p>
              <ul className="rp-enlaces">
                {caps.map((id) => <li key={id}><Enlace to={`${v5path('reportaje', 'obra')}?cap=${id}`} hoja={false} className="rp-enlace">{filtros[id]}</Enlace></li>)}
              </ul>
            </div>
          )}
          {(cargo ?? cto) && (
            <div className="rp-cargo-nota" data-rp="subir">
              <p className="rp-mono">{c.ficha.delCargo} · {(cargo ?? cto)?.company}</p>
              <ul>{(cargo ?? cto)?.highlights.filter((_, i) => !cto || DEL_CTO[o.slug].includes(i)).map((h) => <li key={h}>{h}</li>)}</ul>
            </div>
          )}
        </div>

        <div className="rp-hoja-datos">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.ficha.datos}</p>
          <dl className="rp-datos" data-rp="grupo">
            {o.industry && <Dato k={c.ficha.rubro}>{o.industry}</Dato>}
            <Dato k={c.ficha.rol}>{o.rolLabel ?? c.kinds[o.kind]}</Dato>
            {resultado && !destacados.some((f) => f.value === resultado.crudo) && <Dato k={c.ficha.dato}><Insignia valor={resultado.valor} clase={resultado.clase} /></Dato>}
            {o.kind === 'store' && o.status === 'dev' && <Dato k={c.ficha.estado}>{c.enConstruccion}</Dato>}
            {cargo && <Dato k={c.ficha.empleo}>{cargo.company}</Dato>}
            <Dato k={o.period ? c.ficha.periodo : c.ficha.anio}>{periodo}</Dato>
            {o.stack.length > 0 && <Dato k={c.ficha.pila}><span className="rp-lista">{o.stack.map((x, i) => <Fragment key={x}>{i > 0 && ' · '}{flechas(x)}</Fragment>)}</span></Dato>}
            {datos.filter((f) => f.value !== resultado?.crudo).map((f) => <Dato key={f.label} k={f.label}>{flechas(f.value)}</Dato>)}
            {catalogo && comercio && <Dato k={c.ficha.catalogo}>{catalogo}<small>{c.ficha.catalogoNota(comercio.fecha)}</small></Dato>}
            {o.repo && <Dato k={c.ficha.codigo}><a className="rp-enlace" href={o.repo} target="_blank" rel="noopener noreferrer">{sinProtocolo(o.repo)}</a></Dato>}
          </dl>
          {(lighthouse || git) && (
            <button type="button" className="rp-enlace rp-apunte" onClick={() => window.dispatchEvent(new Event(ABRIR_METODO))}>{c.ficha.metodoApunte}<Flecha /></button>
          )}
        </div>
      </section>

      {dondeCorre.length > 0 && (
        <section className="rp-marco rp-cap-chica rp-parecidas" aria-labelledby="rp-corre-t">
          <p className="rp-kicker rp-mono">{c.ficha.dondeCorre}</p>
          <h2 id="rp-corre-t" className="rp-bloque-t">{filtros[corre]}</h2>
          <p className="rp-fig-sub">{c.ficha.dondeCorreNota}</p>
          <div className="rp-rejilla">{dondeCorre.map((x) => <Tarjeta key={x.slug} o={x} nivel={4} texto={x.tagline} />)}</div>
        </section>
      )}

      {lighthouse && (
        <section className="rp-marco rp-cap-chica" aria-label={c.ficha.medidoT}>
          <Fig n={1} titulo={c.ficha.medidoT} sub={c.ficha.medidoSub(lighthouse.fecha)} medida={`${c.medida}: ${lighthouse.fecha}`} fuente={`${c.ficha.lighthouse} · ${o.name}`}
            aria={`${c.ficha.medidoT}: ${c.ficha.rend} ${lighthouse.escritorio.perf}, ${c.ficha.acc} ${lighthouse.escritorio.a11y}, ${c.ficha.seo} ${lighthouse.escritorio.seo}`}>
            <Medido d={lighthouse.escritorio} />
          </Fig>
        </section>
      )}

      {pdp && (
        <section className="rp-marco rp-cap-chica" aria-label={c.ficha.figPdp}>
          <Fig n={lighthouse ? 2 : 1} titulo={c.ficha.figPdp} sub={c.ficha.pdpSub} medida={`${c.medida}: ${SHOT_DATE}`} fuente={c.ficha.capturas(o.name, SHOT_DATE)}>
            <Lamina o={o} vista="pdp" />
          </Fig>
        </section>
      )}

      {parecidas.length > 0 && !dondeCorre.length && (
        <section className="rp-marco rp-cap-chica rp-parecidas" aria-labelledby="rp-mas-t">
          <p className="rp-kicker rp-mono">{c.ficha.relacionada}</p>
          <h2 id="rp-mas-t" className="rp-bloque-t">{c.ficha.masCon(filtros[rel])}</h2>
          <div className="rp-rejilla">{parecidas.map((x) => <Tarjeta key={x.slug} o={x} nivel={4} texto={x.tagline} />)}</div>
        </section>
      )}

      {siguiente && (
        <section className="rp-siguiente rp-marco" aria-label={c.ficha.siguiente}>
          <Enlace className="rp-siguiente-a" to={v5path('reportaje', 'obra', siguiente.slug)} hoja={false}>
            <span className="rp-mono">{c.ficha.siguiente}</span>
            <span className="rp-siguiente-n">{siguiente.name}</span>
            {siguiente.tagline && <span className="rp-siguiente-t">{siguiente.tagline}</span>}
            <Flecha className="rp-flecha rp-siguiente-f" />
          </Enlace>
        </section>
      )}

      <Riel>
        <p>{c.obra.metodoLineas[0].replace('{fecha}', SHOT_DATE)}</p>
        {(lighthouse || git || catalogo) && <h3 className="rp-mono">{c.ficha.medido}</h3>}
        {lighthouse && (
          <dl className="rp-datos rp-datos-riel">
            <Dato k={c.ficha.lighthouse}>
              <span>{c.ficha.movil}: {lighthouse.movil.perf} · {lighthouse.movil.a11y} · {lighthouse.movil.seo}</span>
              <span>{c.ficha.escritorio}: {lighthouse.escritorio.perf} · {lighthouse.escritorio.a11y} · {lighthouse.escritorio.seo}</span>
              <small>{c.ficha.rend} · {c.ficha.acc} · {c.ficha.seo}. {c.ficha.lhNota(lighthouse.fecha)}</small>
            </Dato>
          </dl>
        )}
        {git && (
          <dl className="rp-datos rp-datos-riel">
            <Dato k={c.ficha.git}>
              {git.commits} {c.ficha.commits} · {git.sections} {c.ficha.secciones} · {c.ficha.primerCommit} {git.first}
              <small>{c.ficha.gitNota(git.fecha)}</small>
            </Dato>
          </dl>
        )}
        {catalogo && comercio && (
          <dl className="rp-datos rp-datos-riel"><Dato k={c.ficha.catalogo}>{catalogo}<small>{c.ficha.catalogoNota(comercio.fecha)}</small></Dato></dl>
        )}
      </Riel>
    </main>
  )
}
