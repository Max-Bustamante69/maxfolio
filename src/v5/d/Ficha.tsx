import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { datosDe, useV5, v5path, type Obra, type Vista, type Viewport } from '../data'
import { ShotImg, pieDeCaptura } from '../shared/ShotImg'
import { Cabeza } from './Cabeza'
import { Enlace } from './Enlace'
import { useAjustes, useAnimaAlMontar } from './ajustes'
import { HECHO_CON, ordenar, useObras, usePeriodo } from './datos'
import { CORTE, CORTE_H, LIMPIAR, SNAP, consumirFoto, crecer, enTransicion, esPrimeraCarga, gsap, revelar, useCoreografia, volverDesde } from './movimiento'
import { llenar, useCopy } from './copy'

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Medición de laboratorio de una vista (móvil o escritorio): tres cifras con barra y el LCP. */
function Medicion({ titulo, x }: { titulo: string; x: { perf: number; a11y: number; seo: number; lcp: number | null } }) {
  const c = useCopy().ficha
  const cifras: [string, number][] = [
    [c.rendimiento, x.perf],
    [c.accesibilidad, x.a11y],
    [c.seo, x.seo],
  ]
  return (
    <div className="d-lab">
      <p className="d-cap d-lab-t">{titulo}</p>
      <ul className="d-lab-cifras">
        {cifras.map(([k, v]) => (
          <li key={k}>
            <span className="d-num">{v}</span>
            <span className="d-cap">{k}</span>
            <span className="d-barra-lh" aria-hidden="true"><i style={{ '--v': v / 100 } as CSSProperties} /></span>
          </li>
        ))}
      </ul>
      {x.lcp !== null && <p className="d-lhx">{c.lcp} {x.lcp.toLocaleString(undefined, { maximumFractionDigits: 2 })} s</p>}
    </div>
  )
}

function FichaDe({ o, todas }: { o: Obra; todas: Obra[] }) {
  const t = useCopy()
  const c = t.ficha
  const { intlLocale } = useV5()
  const periodo = usePeriodo()
  const { reducido } = useAjustes()
  const anima = useAnimaAlMontar()
  const nf = new Intl.NumberFormat(intlLocale)
  const tieneHome = o.views.includes('home')
  const tienePdp = o.views.includes('pdp')
  const [vista, setVista] = useState<Vista>('home')
  const [vp, setVp] = useState<Viewport>('desktop')
  const raiz = useRef<HTMLDivElement>(null)
  const visor = useRef<HTMLDivElement>(null)

  const d = datosDe(o.slug)
  const git = d.git
  const i = todas.findIndex((x) => x.slug === o.slug)
  const anterior = todas[(i - 1 + todas.length) % todas.length]
  const siguiente = todas[(i + 1) % todas.length]
  const hechoCon = [...new Set(o.stack.map((tag) => HECHO_CON[tag]).filter(Boolean))].map((slug) => todas.find((x) => x.slug === slug)).filter((x): x is Obra => Boolean(x))
  const parrafos = o.description.split(/\n+/).filter(Boolean)

  // El visor cambia de captura con el mismo barrido de la dirección (el medio nuevo se descubre de arriba abajo).
  const previo = useRef(`${vista}-${vp}`)
  useLayoutEffect(() => {
    const k = `${vista}-${vp}`
    if (previo.current === k) return
    previo.current = k
    const img = visor.current?.querySelector('img')
    if (!reducido && img) gsap.fromTo(img, { clipPath: CORTE.oculto }, { clipPath: CORTE.visto, duration: 0.26, ease: SNAP, clearProps: 'clipPath' })
  }, [vista, vp, reducido])

  // Entrada completa solo si la ficha NO llega dentro de una View Transition. Dentro de una, el barrido de la página y el viaje de
  // la foto (la miniatura de la tabla crece hasta el visor, 380 ms) YA son la entrada: la ficha nace completa, sin repetirla con
  // GSAP, y solo los bloques de más abajo se revelan al llegar.
  useCoreografia(
    raiz,
    () => {
      const viaja = consumirFoto()
      if (!enTransicion()) {
        const tl = gsap.timeline({ defaults: { ease: SNAP, clearProps: LIMPIAR }, delay: esPrimeraCarga() ? 0.12 : 0.04 })
        tl.from('.d-ficha-cab > *', { clipPath: CORTE.oculto, y: 14, duration: 0.4, stagger: 0.06 }, 0)
          .from('.d-chips-galeria', { opacity: 0, duration: 0.3 }, 0.1)
          .from('.d-visor-pie', { clipPath: CORTE_H.oculto, duration: 0.4 }, 0.3)
          .from('.d-ficha-sec', { clipPath: CORTE.oculto, y: 10, duration: 0.34, stagger: 0.07 }, 0.16)
        if (!viaja && visor.current) tl.from(visor.current.querySelector('img'), { clipPath: CORTE.oculto, duration: 0.5 }, 0.08)
      }
      revelar('.d-bloque', { escalon: 0.07 })
      const r = raiz.current
      crecer(r?.querySelector('.d-semanas') ?? null, Array.from(r?.querySelectorAll('.d-semanas i') ?? []), 'Y')
      crecer(r?.querySelector('.d-lab-dos') ?? null, Array.from(r?.querySelectorAll('.d-lab .d-barra-lh i') ?? []))
    },
    anima,
  )

  const fila = (k: string, v: ReactNode) => (
    <div className="d-spec-fila" key={k}>
      <dt className="d-cap">{k}</dt>
      <dd>{v}</dd>
    </div>
  )

  return (
    <div ref={raiz} className="d-vista d-vista-ficha">
      <Cabeza titulo={`${o.name} · ${t.titulos.obra}`} />
      <div className="d-celda d-migas">
        <Enlace to={v5path('d', 'obra')} className="d-enlace-flecha" onClick={() => volverDesde(o.slug)}>← {c.volver}</Enlace>
        <nav className="d-pn" aria-label={c.pie}>
          <Enlace to={v5path('d', 'obra', anterior.slug)} className="d-pn-b" rel="prev"><span className="d-cap">{c.anterior}</span> <b>{anterior.name}</b></Enlace>
          <Enlace to={v5path('d', 'obra', siguiente.slug)} className="d-pn-b" rel="next"><span className="d-cap">{c.siguiente}</span> <b>{siguiente.name}</b></Enlace>
        </nav>
      </div>

      <section className="d-ficha" aria-labelledby="d-h1">
        <div className="d-celda d-galeria">
          {o.views.length > 0 ? (
            <>
              <div className="d-chips-galeria">
                {tienePdp && (
                  <div className="d-filtro" role="group" aria-label={c.vista}>
                    <span className="d-cap">{c.vista}</span>
                    <div className="d-chips">
                      {tieneHome && <button type="button" className="d-chip" aria-pressed={vista === 'home'} onClick={() => setVista('home')}>{c.home}</button>}
                      <button type="button" className="d-chip" aria-pressed={vista === 'pdp'} onClick={() => setVista('pdp')}>PDP</button>
                    </div>
                  </div>
                )}
                <div className="d-filtro" role="group" aria-label={c.dispositivo}>
                  <span className="d-cap">{c.dispositivo}</span>
                  <div className="d-chips">
                    <button type="button" className="d-chip" aria-pressed={vp === 'desktop'} onClick={() => setVp('desktop')}>{c.escritorio}</button>
                    <button type="button" className="d-chip" aria-pressed={vp === 'mobile'} onClick={() => setVp('mobile')}>{c.movil}</button>
                  </div>
                </div>
              </div>
              <div className="d-visor" data-vp={vp} ref={visor}>
                <ShotImg key={`${vista}-${vp}`} slug={o.slug} vista={vista} vp={vp} alt={`${o.name} · ${vista === 'home' ? c.home : c.pdp} · ${vp === 'desktop' ? c.escritorio : c.movil}`} prioridad style={{ viewTransitionName: 'd-foto' }} />
              </div>
              <p className="d-visor-pie d-cap">{pieDeCaptura(o.name, vista, vp)}</p>
            </>
          ) : (
            <p className="d-vacio-galeria">{c.sinCapturas}</p>
          )}
        </div>

        <div className="d-celda d-ficha-datos">
          <header className="d-ficha-cab">
            <p className="d-cap">{c.migas} · {t.obra.tipoUno[o.kind]}</p>
            <h1 id="d-h1" className="d-h1 d-h1-ficha">{o.name}</h1>
            {o.tagline && <p className="d-lead d-lead-chico">{o.tagline}</p>}
            {o.link && (
              <a className="d-ter" href={o.link} target="_blank" rel="noopener noreferrer">
                {c.abrir} <span className="d-mono-chico">{host(o.link)} ↗</span>
              </a>
            )}
          </header>

          <section className="d-ficha-sec" id="d-resumen" aria-labelledby="d-t-resumen">
            <h2 id="d-t-resumen" className="d-cap d-cap-h">{c.resumen}</h2>
            {parrafos.length > 0 ? parrafos.map((p) => <p key={p}>{p}</p>) : <p>{o.tagline || '—'}</p>}
          </section>

          <section className="d-ficha-sec" id="d-specs" aria-labelledby="d-t-specs">
            <h2 id="d-t-specs" className="d-cap d-cap-h">{c.specs}</h2>
            <dl className="d-spec-lista">
              {o.industry && fila(c.rubro, o.industry)}
              {fila(c.tipo, t.obra.tipoUno[o.kind])}
              {o.rolLabel && fila(c.rol, o.rolLabel)}
              {fila(c.anio, o.year)}
              {o.period && fila(c.construccion, periodo(o.period.start, o.period.end))}
              {o.stack.length > 0 && fila(c.stack, <span className="d-etiquetas">{o.stack.map((s) => <span key={s} className="d-etiqueta-pila">{s}</span>)}</span>)}
              {o.facts.length > 0 && fila(c.hechos, <span className="d-hechos">{o.facts.map((f) => <span key={f.label}>{f.label}: <b>{f.value}</b></span>)}</span>)}
            </dl>
          </section>
        </div>
      </section>

      <section className="d-ficha-mas" aria-label={c.labTitulo}>
        {d.lighthouse ? (
          <div className="d-celda d-bloque">
            <h2 className="d-cap d-cap-h">{c.labTitulo}</h2>
            <div className="d-lab-dos">
              <Medicion titulo={c.movilLab} x={d.lighthouse.movil} />
              <Medicion titulo={c.escritorioLab} x={d.lighthouse.escritorio} />
            </div>
            <p className="d-nota-chica">{llenar(c.labNota, { fecha: d.lighthouse.fecha })}</p>
          </div>
        ) : (
          <div className="d-celda d-bloque">
            <h2 className="d-cap d-cap-h">{c.labTitulo}</h2>
            <p>{o.kind === 'store' ? (o.tema === 'cliente' ? c.temaCliente : c.sinMedicion) : c.sinMedicion}</p>
          </div>
        )}

        {git && (
          <div className="d-celda d-bloque">
            <h2 className="d-cap d-cap-h">{c.gitTitulo}</h2>
            <dl className="d-spec-lista d-spec-lista-2">
              {fila(c.commits, nf.format(git.commits))}
              {fila(c.secciones, git.sections)}
              {fila(c.lineasLiquid, nf.format(git.lines.liquid))}
              {fila(c.lineasIslas, nf.format(git.lines.islands))}
              {fila(c.primerCommit, git.first)}
              {fila(c.ultimoCommit, git.last)}
            </dl>
            {git.weeks.length > 0 && (
              <>
                <p className="d-cap">{c.semanas}</p>
                <div className="d-semanas" role="img" aria-label={`${c.semanas}: ${git.weeks.length}, ${Math.max(...git.weeks)} max`}>
                  {git.weeks.map((n, k) => <i key={k} style={{ height: `${Math.max(3, (n / Math.max(...git.weeks)) * 100)}%` }} title={String(n)} />)}
                </div>
                <p className="d-nota-chica">{llenar(c.semanasNota, { desde: git.weekOf })} {llenar(c.gitNota, { fecha: git.fecha })}</p>
              </>
            )}
          </div>
        )}

        {d.comercio && (
          <div className="d-celda d-bloque">
            <h2 className="d-cap d-cap-h">{c.catalogoTitulo}</h2>
            <dl className="d-spec-lista d-spec-lista-2">
              {fila(c.productos, nf.format(d.comercio.products))}
              {d.comercio.collections !== null && fila(c.colecciones, d.comercio.collections)}
              {d.comercio.currency && fila(c.moneda, d.comercio.currency)}
              {d.comercio.priceMin !== null && d.comercio.priceMax !== null && fila(c.precios, `${nf.format(d.comercio.priceMin)}–${nf.format(d.comercio.priceMax)}`)}
            </dl>
            <p className="d-nota-chica">{llenar(c.catalogoNota, { fecha: d.comercio.fecha })}</p>
          </div>
        )}

        <div className="d-celda d-bloque" id="d-hecho-con">
          <h2 className="d-cap d-cap-h">{c.hechoCon}</h2>
          {hechoCon.length > 0 ? (
            <>
              <p className="d-nota-chica">{c.hechoConLead}</p>
              <ul className="d-etiquetas">
                {hechoCon.map((h) => (
                  <li key={h.slug}><Enlace className="d-chip d-chip-enlace" to={v5path('d', 'obra', h.slug)}>{h.name}</Enlace></li>
                ))}
              </ul>
            </>
          ) : (
            <p>{c.hechoConNinguno}</p>
          )}
        </div>
      </section>

      <div className="d-anclas">
        <nav className="d-anclas-in" aria-label={c.anclas}>
          <a href="#d-resumen">{c.resumen}</a>
          <a href="#d-specs"><span className="d-largo">{c.specs}</span><span className="d-corto">{c.specsCorto}</span></a>
          <a href="#d-hecho-con">{c.hechoCon}</a>
        </nav>
        <Enlace className="d-cta d-cta-barra" to={v5path('d', 'contacto')}>
          <span><span className="d-largo">{c.pedirRevision}</span><span className="d-corto">{c.pedirCorto}</span></span>
          <span className="d-cta-flecha" aria-hidden="true">→</span>
        </Enlace>
      </div>
    </div>
  )
}

export default function Ficha() {
  const { slug = '' } = useParams()
  const t = useCopy()
  const obras = useObras()
  const todas = useMemo(() => ordenar(obras), [obras])
  const o = obras.find((x) => x.slug === slug)
  if (!o) {
    return (
      <div className="d-vista">
        <Cabeza titulo={`${t.ficha.noExiste} · ${t.titulos.obra}`} />
        <div className="d-celda d-pagina-cab">
          <h1 className="d-h1 d-h1-pagina">{t.ficha.noExiste}</h1>
          <Enlace className="d-ter" to={v5path('d', 'obra')}>{t.ficha.volver}</Enlace>
        </div>
      </div>
    )
  }
  return <FichaDe key={o.slug} o={o} todas={todas} />
}
