import { useLayoutEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { SHOT_DATE, v5path, type Obra as ObraT } from '../data'
import { useCopy } from './copy'
import { Riel } from './marco'
import { aterrizar, gsap, useVista, vueloDe } from './motion'
import { Enlace, flechas, Flecha, Tarjeta } from './piezas'
import { CAPACIDADES, capacidadesDe, limpioTexto, partirFrase, usePublico, type CapacidadId } from './publico'

/** Una fila de libro mayor: obra sin captura (o proyecto, entregable) con su rubro, año y una línea de historia. */
function Fila({ o, meta, tex, enlace = true }: { o: ObraT; meta: string; tex?: string; enlace?: boolean }) {
  const c = useCopy()
  const cuerpo = (
    <>
      <span className="rp-fila-n"><span>{flechas(o.name)}</span></span>
      <span className="rp-fila-meta rp-meta">{meta}</span>
      {tex && <span className="rp-fila-t">{flechas(tex)}</span>}
      <span className="rp-fila-ver"><span className="rp-sr">{c.leerCaso}</span><Flecha /></span>
    </>
  )
  return (
    <li className="rp-fila" data-rp="subir">
      {enlace ? <Enlace to={v5path('reportaje', 'obra', o.slug)} hoja={false} className="rp-fila-a">{cuerpo}</Enlace> : <div className="rp-fila-a">{cuerpo}</div>}
    </li>
  )
}

export default function Obra() {
  const c = useCopy()
  const { locale } = useLanguage()
  const v = usePublico()
  const { strings: s } = v
  const [params, setParams] = useSearchParams()
  const pedida = params.get('cap')
  const cap: CapacidadId | 'todas' = CAPACIDADES.some((x) => x.id === pedida) ? (pedida as CapacidadId) : 'todas'
  const rejilla = useRef<HTMLDivElement>(null)
  const primera = useRef(true)
  const filtros = s.sections.shopify.filters as Record<string, string>

  const [, lead] = partirFrase(limpioTexto(s.sections.shopify.lead))
  const tiendas = v.obras.filter((o) => o.kind === 'store')
  const cuenta = (id: CapacidadId) => tiendas.filter((o) => capacidadesDe(o).includes(id)).length
  const coincide = (o: ObraT) => cap === 'todas' || capacidadesDe(o).includes(cap)
  // Los grupos cuentan todas las tiendas de su estado (con y sin captura): suman lo mismo que dice el encabezado.
  const vivas = tiendas.filter((o) => o.status === 'live' && coincide(o))
  const enObra = tiendas.filter((o) => o.status === 'dev' && coincide(o))
  const productos = v.obras.filter((o) => o.kind === 'product')
  const proyectos = v.obras.filter((o) => o.kind === 'personal')
  const entregables = v.obras.filter((o) => o.kind === 'role')

  const ref = useVista<HTMLElement>([locale], (raiz, limpiar) => {
    // Si se vuelve de una ficha, su captura aterriza en su tarjeta (se acerca la tarjeta al centro antes de volar).
    const slug = vueloDe()
    const marco = slug ? raiz.querySelector<HTMLElement>(`.rp-tarjeta[data-slug="${slug}"] .rp-placa-img`) : null
    if (slug && marco) {
      aterrizar(slug, marco, limpiar, {
        colocar: () => {
          const r = marco.getBoundingClientRect()
          if (r.top < 80 || r.bottom > window.innerHeight - 20) window.scrollTo({ top: window.scrollY + r.top - (window.innerHeight - r.height) / 2, behavior: 'instant' })
        },
      })
    }
  })

  // Al filtrar, las tarjetas que quedan suben una tras otra (la primera carga ya trae su propio revelado).
  useLayoutEffect(() => {
    if (primera.current) { primera.current = false; return }
    const ctx = gsap.context(() => {
      gsap.from('.rp-tarjeta, .rp-grupo-t', { opacity: 0, y: 18, duration: 0.7, ease: 'rep', stagger: 0.05, clearProps: 'transform,opacity' })
    }, rejilla)
    return () => ctx.revert()
  }, [cap])

  const grupo = (clave: string, titulo: string, lista: ObraT[], grande = false) => lista.length > 0 && (
    <div key={clave} className="rp-familia">
      <h3 className="rp-familia-t rp-grupo-t">{titulo}<small>{lista.length}</small></h3>
      <div className={grande && cap === 'todas' ? 'rp-rejilla rp-rejilla-grande' : 'rp-rejilla'}>
        {lista.filter((o) => o.views.length).map((o) => <Tarjeta key={o.slug} o={o} nivel={4} texto={o.tagline} />)}
      </div>
      {lista.some((o) => !o.views.length) && (
        <div className="rp-familia-resto">
          <p className="rp-meta">{s.sections.shopify.legacyLabel} · {c.obra.sinCaptura}</p>
          <ul className="rp-filas">{lista.filter((o) => !o.views.length).map((o) => <Fila key={o.slug} o={o} meta={[o.industry, o.year, o.rolLabel].filter(Boolean).join(' · ')} tex={o.tagline} />)}</ul>
        </div>
      )}
    </div>
  )

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="rp-vista">
      <title>{`${c.nav.obra} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <header className="rp-encabezado rp-marco">
        <p className="rp-kicker rp-mono" data-rp="subir">II · {c.obra.kicker}</p>
        <h1 className="rp-h1 rp-h1-medio" data-rp="linea">{c.obra.h1}</h1>
        {lead && <p className="rp-dek" data-rp="subir" data-rp-retraso="0.2">{lead}</p>}
        <p className="rp-estado rp-meta" data-rp="subir" data-rp-retraso="0.28"><i aria-hidden="true" />{s.sections.now.live.replace('{n}', String(v.enVivo))} · {s.sections.now.dev.replace('{n}', String(v.enConstruccion))}</p>
        <div className="rp-filtro" data-rp="subir" data-rp-retraso="0.34" role="group" aria-label={c.obra.filtrar}>
          <button type="button" className="rp-filtro-b" aria-pressed={cap === 'todas'} onClick={() => setParams({}, { replace: true })}>{c.obra.todas}</button>
          {CAPACIDADES.map(({ id }) => cuenta(id) > 0 && (
            <button key={id} type="button" className="rp-filtro-b" aria-pressed={cap === id} onClick={() => setParams({ cap: id }, { replace: true })}>{filtros[id]}<b>{cuenta(id)}</b></button>
          ))}
        </div>
      </header>

      <section className="rp-cap-chica rp-marco" aria-labelledby="rp-tiendas-t" ref={rejilla}>
        <div className="rp-bloque-cab">
          <h2 id="rp-tiendas-t" className="rp-bloque-t" data-rp="subir">{s.sections.shopify.tabStores}</h2>
          <p className="rp-fig-sub" data-rp="subir" data-rp-retraso="0.1">{c.obra.figSub}</p>
        </div>
        <div className="rp-fig-filete" data-rp="filete" />
        {grupo('vivas', c.obra.enVivo, vivas, true)}
        {grupo('obra', c.obra.enConstruccion, enObra)}
        {!vivas.length && !enObra.length && <p className="rp-cuerpo rp-tenue" role="status">{c.obra.sinResultados}</p>}
        <p className="rp-fig-pie rp-fig-pie-solo"><span className="rp-nota">{c.fuente}: {c.obra.figFuente}</span><span className="rp-mono">{c.medida}: {SHOT_DATE}</span></p>
      </section>

      <section className="rp-cap-chica rp-marco" aria-labelledby="rp-prod-t">
        <div className="rp-bloque">
          <h2 id="rp-prod-t" className="rp-bloque-t" data-rp="subir">{c.obra.productos}</h2>
          <ul className="rp-productos">
            {productos.map((o) => (
              <li key={o.slug} className="rp-producto" data-rp="subir">
                <Enlace to={v5path('reportaje', 'obra', o.slug)} hoja={false} className="rp-producto-a">
                  <span className="rp-fila-n"><span>{flechas(o.name)}</span></span>
                  <span className="rp-producto-t">{o.tagline}</span>
                  <span className="rp-producto-d">{partirFrase(o.description)[0]}</span>
                  <span className="rp-fila-ver"><span className="rp-sr">{c.leerCaso}</span><Flecha /></span>
                </Enlace>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rp-cap-chica rp-marco" aria-labelledby="rp-proy-t">
        <div className="rp-bloque">
          <h2 id="rp-proy-t" className="rp-bloque-t" data-rp="subir">{c.obra.proyectos}</h2>
          <ul className="rp-filas">{proyectos.map((o) => <Fila key={o.slug} o={o} meta={`${o.year} · ${o.stack.slice(0, 3).join(' · ')}`} tex={o.tagline} />)}</ul>
        </div>
        <div className="rp-bloque">
          <h2 className="rp-bloque-t" data-rp="subir">{c.obra.entregables}</h2>
          <ul className="rp-filas">
            {entregables.map((o) => {
              const empleo = v.trayectoria.find((t) => t.id === o.employer)
              return <Fila key={o.slug} o={o} meta={[empleo?.company, o.period ? v.formatPeriod(o.period.start, o.period.end) : o.year].filter(Boolean).join(' · ')} tex={o.tagline} />
            })}
          </ul>
        </div>
      </section>

      <Riel>
        {c.obra.metodoLineas.map((l) => <p key={l}>{l.replace('{fecha}', SHOT_DATE)}</p>)}
      </Riel>
    </main>
  )
}
