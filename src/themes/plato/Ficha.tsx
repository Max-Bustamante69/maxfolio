import { lazy, Suspense, useEffect, useState, type CSSProperties, type UIEvent, type KeyboardEvent as TeclaEvento, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { formatMoney } from '../../data/commerceLines'
import { datosDe, SHOT_DATE, sinPuntoFinal, v5path, type Obra } from '../data'
import { CASO, contextoMovil, fechaCorta, medidasDe, periodoCorto, type Medida } from './casos'
import { capaEstado, ID, usePlato } from './contexto'
import { control } from './escena/control'
import { altosFranjas, FECHA_RECORRIDO, PANTALLAS, tieneRecorrido, urlFranja } from './escena/pantallas'
import { puedeVisor } from './escena/puerta'
import { indiceDe, ORDEN } from './escena/sets'
import { TINTES } from './escena/tintes'
import { alcanceDe } from './alcance'
import { aterrizar, alScroll, despegar, gsap, useVista } from './motion'
import { Cruces, Dato, Enlace, Flecha, PlShot, Rod, ruta } from './piezas'
import { partirFrase } from './publico'
import { Seo } from './seo'

const llenar = (t: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t)
const sinProtocolo = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
const acota = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
/** Alto de la ventana del teléfono en filas de página a 2x (390 × 844 → 780 × 1688). */
const VENTANA = 1688

interface Tiempo { label: string; body?: string; medidas?: Medida[] }

const Visor = lazy(() => import('./escena/Visor'))

/** La ruta monta una Ficha NUEVA por obra e idioma: «Siguiente» solo cambia el :slug y sin esta llave React reutilizaría el componente. */
export default function FichaRuta() {
  const { slug = '' } = useParams()
  const { locale } = useLanguage()
  return <Ficha key={`${slug}:${locale}`} slug={slug} />
}

/** El teléfono en CSS de la ficha 2D (móvil y «Lista»): la home completa de la tienda dentro de un marco, con su propio scroll nativo. */
function TelefonoCss({ o, vista, alt, etiqueta }: { o: Obra; vista: 'home' | 'pdp'; alt: string; etiqueta: string }) {
  const info = PANTALLAS[o.slug]
  const altos = info && vista === 'home' ? altosFranjas(info.h) : null
  // Solo la primera franja se pide al abrir; las siguientes, cuando el lector empieza a recorrer el teléfono (el lazy nativo las traería todas de golpe).
  const [n, setN] = useState(1)
  const alScrollInterno = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (altos && n < altos.length && el.scrollTop + el.clientHeight * 2.2 >= el.scrollHeight) setN(n + 1)
  }
  return (
    <div className="pl-tel2d">
      <div className="pl-tel2d-pant" tabIndex={0} role="group" aria-label={etiqueta} onScroll={alScrollInterno}>
        {altos
          ? altos.slice(0, n).map((h, i) => <img key={i} src={urlFranja(o.slug, i)} width={780} height={h} alt={i === 0 ? alt : ''} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable={false} />)
          : <PlShot slug={o.slug} vista={vista} vp="mobile" alt={alt} draggable={false} />}
      </div>
    </div>
  )
}

function Ficha({ slug }: { slug: string }) {
  const { c, v, en3d, puede3d, setModo } = usePlato()
  const { locale } = useLanguage()
  const k = locale === 'es' ? 'es' : 'en'
  const o = v.obra(slug)
  const [visor, setVisor] = useState(false)
  const [hay3d] = useState(puedeVisor)
  const [elegida, setVista] = useState<'home' | 'pdp'>('home')
  const vista = o?.views.includes(elegida) ? elegida : 'home'
  const i3 = indiceDe(slug)
  const con3d = en3d && !!o && i3 >= 0
  const recorrido = !!o && o.views.length > 0 && tieneRecorrido(slug)

  // El pedestal: la cámara entra por la pantalla del set y asienta junto a la plataforma; el lienzo es el mismo de la fachada.
  useEffect(() => {
    if (!con3d) return
    control.set({ modo: 'pedestal', slug, vista, t: i3 })
    control.volver = i3
    capaEstado(true)
    // Al salir (a la obra, a otra ficha o a una vista sin escena) el pedestal baja y se sueltan las franjas; si llega otra ficha, vuelve a subir en el mismo vaciado de efectos.
    return () => control.set({ modo: 'recorrido', slug: null })
  }, [con3d, slug, vista, i3])
  useEffect(() => { if (con3d) control.set({ pantalla: 0 }) }, [con3d, slug])

  const ref = useVista<HTMLElement>([con3d], (raiz, limpiar) => {
    if (con3d) {
      // La pantalla del teléfono recorre la tienda a medida que se baja por el caso; la rueda, el arrastre y las flechas sobre el teléfono suman lo suyo.
      const stage = raiz.querySelector<HTMLElement>('.pl-fh--3d')
      const zona = raiz.querySelector<HTMLElement>('.pl-tel-zona')
      const barra = raiz.querySelector<HTMLElement>('.pl-fh-prog')
      if (!stage) return
      let p = 0
      let extra = 0
      const rango = () => Math.max(1, stage.offsetHeight - window.innerHeight)
      const aplicar = () => { const t = acota(p + extra); extra = t - p; control.set({ pantalla: t }); barra?.style.setProperty('--p', String(t)) }
      if (recorrido) limpiar.push(alScroll((y) => { p = acota(y / rango()); aplicar() }))
      const fino = matchMedia('(hover: hover) and (pointer: fine)').matches
      const mover = (e: PointerEvent) => {
        if (!fino || e.pointerType !== 'mouse') return
        const r = stage.getBoundingClientRect()
        control.puntero = { x: acota(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1), y: acota(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1) }
        control.estimulo()
      }
      const salir = () => { control.puntero = null; control.estimulo() }
      stage.addEventListener('pointermove', mover, { passive: true })
      stage.addEventListener('pointerleave', salir)
      limpiar.push(() => { stage.removeEventListener('pointermove', mover); stage.removeEventListener('pointerleave', salir); control.puntero = null; control.alTelefono = null })
      if (zona && recorrido) {
        const rangoFilas = () => Math.max(1, PANTALLAS[slug].h - VENTANA)
        const filasPorPx = () => VENTANA / Math.max(200, zona.offsetHeight)
        const sumar = (filas: number) => { extra += filas / rangoFilas(); aplicar() }
        const rueda = (e: WheelEvent) => {
          const dy = e.deltaY * (e.deltaMode === 1 ? 32 : 1)
          const t = acota(p + extra)
          if ((dy > 0 && t >= 0.9995) || (dy < 0 && t <= 0.0005)) return // en los extremos la rueda sigue con la página
          e.preventDefault()
          sumar(dy * filasPorPx())
        }
        let arrastre: number | null = null
        const abajo = (e: PointerEvent) => { if (e.pointerType === 'mouse' && e.button !== 0) return; arrastre = e.clientY; zona.setPointerCapture(e.pointerId); zona.dataset.arrastra = 'si' }
        const mueve = (e: PointerEvent) => { if (arrastre == null) return; sumar(-(e.clientY - arrastre) * filasPorPx()); arrastre = e.clientY }
        const suelta = () => { arrastre = null; delete zona.dataset.arrastra }
        zona.addEventListener('wheel', rueda, { passive: false })
        zona.addEventListener('pointerdown', abajo)
        zona.addEventListener('pointermove', mueve)
        zona.addEventListener('pointerup', suelta)
        zona.addEventListener('pointercancel', suelta)
        control.alTelefono = (cj) => {
          const [x0, y0, x1, y1] = cj.caja
          zona.style.transform = `translate3d(${x0}px,${y0}px,0)`
          zona.style.width = `${Math.max(0, x1 - x0)}px`
          zona.style.height = `${Math.max(0, y1 - y0)}px`
          zona.style.pointerEvents = cj.ok ? 'auto' : 'none'
        }
        limpiar.push(() => {
          zona.removeEventListener('wheel', rueda); zona.removeEventListener('pointerdown', abajo); zona.removeEventListener('pointermove', mueve)
          zona.removeEventListener('pointerup', suelta); zona.removeEventListener('pointercancel', suelta)
        })
      }
      return
    }
    // 2D: la captura de la tarjeta cruza hasta este marco; sin tarjeta de origen (enlace directo, Atrás) el marco simplemente entra.
    const marco = raiz.querySelector<HTMLElement>('.pl-fh-pantalla')
    if (marco) {
      // El teléfono y el conmutador esperan a que la captura aterrice: no quedan flotando sobre una página en blanco.
      const acompana = raiz.querySelectorAll('.pl-tel2d, .pl-fh-vitrina .pl-segm')
      if (aterrizar(slug, marco, limpiar, () => gsap.to(acompana, { opacity: 1, duration: 0.45, ease: 'pl', clearProps: 'opacity' }))) gsap.set(acompana, { opacity: 0 })
    }
  })

  // Teclas sobre el teléfono: las flechas recorren la tienda (la zona táctil es un grupo enfocable).
  const teclas = (e: TeclaEvento<HTMLDivElement>) => {
    const paso = e.key === 'ArrowDown' ? 0.05 : e.key === 'ArrowUp' ? -0.05 : e.key === 'PageDown' || e.key === ' ' ? 0.3 : e.key === 'PageUp' ? -0.3 : e.key === 'Home' ? -1 : e.key === 'End' ? 1 : 0
    if (!paso) return
    e.preventDefault()
    control.set({ pantalla: acota(control.obj.pantalla + paso) })
  }

  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} ref={ref} className="pl-vista pl-ficha">
        <Seo ruta={ruta('obra', slug)} titulo={`${c.ficha.noExiste} · ${v.personal.name}`} descripcion={c.ficha.noExiste} indexar={false} />
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
  const alcance = alcanceDe(o, locale)

  // El siguiente: dentro del recorrido, el lote que sigue; fuera, la siguiente obra con captura.
  const orden = con3d ? ORDEN.map((s) => v.obra(s)).filter((x): x is NonNullable<typeof x> => !!x) : v.obras
  const kk = orden.findIndex((x) => x.slug === o.slug)
  const resto = [...orden.slice(kk + 1), ...orden.slice(0, Math.max(0, kk))]
  const siguiente = (con3d ? resto[0] : resto.find((x) => x.views.length) ?? resto[0])
  const anterior = con3d ? orden[(kk - 1 + orden.length) % orden.length] : undefined

  const cat = v.strings.sections.caseStudy.commerce
  const catalogo = comercio
    ? (comercio.priceMin != null && comercio.currency
        ? llenar(cat.catalogLine, { products: comercio.products, collections: comercio.collections ?? 0, price: formatMoney(comercio.priceMin, comercio.currency, v.intlLocale) })
        : llenar(cat.catalogLineNoPrice, { products: comercio.products, collections: comercio.collections ?? 0 }))
    : null

  // La historia. The Gummy Box: los cuatro tiempos del vivo con sus cifras. Las cuatro destacadas: qué se pidió, qué se construyó, qué cambió y qué se midió.
  // El resto: lo que se construyó y, donde hay más de una medida, qué se midió. Ningún tiempo se inventa: sin dato, no hay tiempo.
  const fb = v.strings.sections.featuredBuild
  const [primera] = partirFrase(o.description)
  const lhBueno = lighthouse && lighthouse.escritorio.perf >= 90 ? lighthouse : null
  const esGummy = o.slug === 'the-gummy-box' && !!git && !!lighthouse
  const ca = CASO[o.slug]
  const kicker = esGummy ? fb.eyebrow : c.ficha.caso
  const lead = esGummy ? `${fb.title} ${sinPuntoFinal(fb.titleAccent)}` : alcance || primera || o.tagline
  const tiempos: Tiempo[] = []
  if (esGummy && git && lighthouse) {
    fb.beats.forEach((b) => tiempos.push({
      label: b.label,
      body: llenar(b.body, {
        ladder: v.registry.stores.find((s) => s.slug === o.slug)?.facts.find((f) => f.id === 'ladder')?.value ?? '',
        sections: git.sections, blocks: git.blocks ?? 0, trackedComponents: git.trackedComponents ?? 0,
        url: o.link ? sinProtocolo(o.link) : '',
        perfDesktop: lighthouse.escritorio.perf, a11yDesktop: lighthouse.escritorio.a11y, seoDesktop: lighthouse.escritorio.seo,
        lcpDesktop: (lighthouse.escritorio.lcp ?? 0).toFixed(2),
      }),
    }))
  } else {
    if (ca) {
      tiempos.push({ label: c.ficha.pidio, body: ca.encargo[k] }, { label: c.ficha.cambio, body: ca.cambio[k] })
    } else if (o.description) {
      tiempos.push({ label: c.ficha.construi, body: o.description })
    }
    // El Lighthouse tiene su propia sección más abajo: aquí no se repite.
    const otras = medidas.slice(1).filter((m) => !(lhBueno && m.tipo === 'lh'))
    if (otras.length) tiempos.push({ label: c.ficha.midio, medidas: otras })
  }

  const etqLote = con3d ? `${c.obra.lote} ${String(i3 + 1).padStart(2, '0')} / ${ORDEN.length} · ${o.year}` : [o.industry, o.rolLabel ?? c.kinds[o.kind], o.year].filter(Boolean).join(' · ')
  const vistas = o.views
  const iVista = Math.max(0, vistas.indexOf(vista))
  // Una sola línea mono con el rol, la ventana y el rubro; la cifra principal va en grande justo debajo (una vez en toda la página).
  const linea = [o.rolLabel ?? c.kinds[o.kind], periodoCorto(periodo), o.industry].filter(Boolean).join(' · ')
  const nombreLh = (n: number | null) => (n == null ? '' : n.toLocaleString(v.intlLocale, { maximumFractionDigits: 2 }))
  const principal = medidas[0]
  const contexto = lhBueno ? contextoMovil(lhBueno.movil, locale) : null
  const nombreVista = (vv: 'home' | 'pdp') => (vv === 'home' ? c.ficha.home : c.ficha.pdp)
  const descripcion = (o.tagline || alcance || o.name).slice(0, 158)

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
      {principal && (
        <p className="pl-fh-medido" aria-label={c.ficha.medido}>
          <b>{principal.valor}</b>
          <span className="pl-mono">{principal.etq}</span>
          <span className="pl-mono pl-fh-m-nota">{principal.nota}</span>
        </p>
      )}
      <div className="pl-fh-acc">
        {o.link && <a className={`pl-pil ${con3d ? 'pl-pil--tung' : 'pl-pil--osc'}`} href={o.link} target="_blank" rel="noopener noreferrer"><Rod>{o.kind === 'store' ? c.ficha.visitar : c.ficha.visitarSitio}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></a>}
        {o.repo && <a className="pl-pil pl-pil--clara" href={o.repo} target="_blank" rel="noopener noreferrer"><Rod>{c.ficha.repo}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></a>}
      </div>
      {con3d && recorrido && (
        <p className="pl-mono pl-fh-baja">
          <span>{c.ficha.baja}</span>
          <small>{c.ficha.recorridoDe(fechaCorta(FECHA_RECORRIDO, v.intlLocale))}</small>
        </p>
      )}
    </div>
  )

  const conmutador = (claro: boolean) => hayPdp && (
    <div className={`pl-segm${claro ? ' pl-segm--claro' : ''}`} role="group" aria-label={c.ficha.vista}>
      <button type="button" aria-pressed={vista === 'home'} onClick={() => setVista('home')}>{c.ficha.home}</button>
      <button type="button" aria-pressed={vista === 'pdp'} onClick={() => setVista('pdp')}>{c.ficha.pdp}</button>
    </div>
  )

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className={`pl-vista pl-ficha${con3d ? ' pl-ficha--3d' : ''}`} style={tinte ? ({ '--marca': tinte } as CSSProperties) : undefined}>
      <Seo ruta={ruta('obra', o.slug)} titulo={`${o.name} · ${v.personal.name}`} descripcion={descripcion} />

      {con3d ? (
        <section className={`pl-fh pl-fh--3d${recorrido ? ' pl-fh--rec' : ''}`} data-tono="oscuro" aria-label={o.name}>
          <div className="pl-fh-pega">
            {etiqueta}
            {recorrido && <div className="pl-tel-zona" tabIndex={0} role="group" aria-label={c.ficha.zonaTel} onKeyDown={teclas} />}
            <div className="pl-fh-ctrl">
              <div className="pl-fh-vista">
                <span className="pl-mono pl-fh-cont">{iVista + 1} / {vistas.length}</span>
                {conmutador(false)}
              </div>
              <div className="pl-fh-sig">
                {anterior && <Enlace to={ruta('obra', anterior.slug)} directo oscuro className="pl-redondo" aria-label={`${c.ficha.anterior}: ${anterior.name}`}><Flecha izq /></Enlace>}
                {siguiente && <Enlace to={ruta('obra', siguiente.slug)} directo oscuro className="pl-pil pl-pil--clara"><Rod>{`${c.ficha.siguiente} · ${siguiente.name}`}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>}
              </div>
            </div>
            {recorrido && <div className="pl-fh-prog" aria-hidden="true"><i /></div>}
          </div>
        </section>
      ) : (
        <section className="pl-fh pl-fh--2d" data-tono="claro" aria-label={o.name}>
          {etiqueta}
          {o.views.length > 0 ? (
            <div className={`pl-fh-vitrina${recorrido ? ' pl-fh-vitrina--tel' : ''}`}>
              <div className="pl-fh-pantalla">
                {/* Solo la vista activa: la otra se pide al cambiar (en un móvil lento, dos capturas de escritorio compiten con el LCP). */}
                <PlShot key={vista} slug={o.slug} vista={vista} vp="desktop" alt={`${o.name} · ${c.ficha.escritorio}`} prioridad tarjeta className="pl-cap pl-cap--on" />
              </div>
              <TelefonoCss o={o} vista={vista} alt={`${o.name} · ${c.ficha.movil}`} etiqueta={c.ficha.telefonoCss} />
              {(hayPdp || hay3d) && (
                <div className="pl-fh-conm">
                  {conmutador(true)}
                  {hay3d && (
                    <button type="button" className="pl-pil pl-pil--osc pl-ver3d" onClick={() => (puede3d ? setModo('3d') : setVisor(true))}>
                      <Rod>{c.ficha.ver3d}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
                    </button>
                  )}
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
      )}

      {visor && createPortal(
        <Suspense fallback={null}>
          <Visor slug={o.slug} vista={vista} etiqueta={c.ficha.visor} recorrer={c.ficha.recorrer} arrastra={c.ficha.arrastra} cerrarEtq={c.ficha.cerrarVisor} cerrar={() => setVisor(false)} />
        </Suspense>,
        document.querySelector('.v5-plato') ?? document.body,
      )}

      <section className="pl-caso" data-tono="claro" aria-labelledby="pl-caso-t">
        <div className="pl-caso-izq">
          <h2 id="pl-caso-t" className="pl-mono pl-kicker pl-kicker--claro" data-pl="subir">{kicker}</h2>
          {lead && <p className="pl-caso-lead" data-pl="linea">{lead}</p>}
        </div>
        <div className="pl-caso-der">
          {tiempos.length > 0 ? (
            <ol className="pl-beats" data-pl="grupo">
              {tiempos.map((b) => (
                <li key={b.label}>
                  <p className="pl-mono pl-beat-k">{b.label}</p>
                  {b.body && <p className="pl-beat-t">{b.body}</p>}
                  {b.medidas && (
                    <ul className="pl-beat-m">
                      {b.medidas.map((m) => (
                        <li key={m.etq}><b>{m.valor}</b><span>{m.etq}</span><small className="pl-mono">{m.nota}</small></li>
                      ))}
                    </ul>
                  )}
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
          <div className="pl-lh" data-pl="subir">
            {([[c.ficha.escritorio, lhBueno.escritorio], [c.ficha.movil, lhBueno.movil]] as const).map(([n, m]) => (
              <section key={n} className="pl-lh-d" aria-label={`${c.ficha.lighthouse} · ${n}`}>
                <h3 className="pl-mono pl-lh-n">{n}</h3>
                <dl className="pl-lh-g">
                  <div><dt className="pl-mono">{c.ficha.rend}</dt><dd>{m.perf}</dd></div>
                  <div><dt className="pl-mono">{c.ficha.acc}</dt><dd>{m.a11y}</dd></div>
                  <div><dt className="pl-mono">{c.ficha.seo}</dt><dd>{m.seo}</dd></div>
                  <div><dt className="pl-mono">LCP</dt><dd>{m.lcp != null ? `${nombreLh(m.lcp)} s` : '—'}</dd></div>
                </dl>
              </section>
            ))}
          </div>
          <p className="pl-nota" data-pl="subir">{c.ficha.lhNota(fecha(lhBueno.fecha))}</p>
          {contexto && <p className="pl-lh-ctx" data-pl="subir">{contexto}</p>}
        </section>
      )}

      {o.views.length > 0 && (
        <section className="pl-caps" data-tono="claro" aria-labelledby="pl-caps-t">
          <h2 id="pl-caps-t" className="pl-h-m" data-pl="linea">{c.ficha.capturas}</h2>
          <div className="pl-caps-rejilla">
            {o.views.map((vv) => (
              <div key={vv} className={`pl-par${recorrido ? ' pl-par--solo' : ''}`}>
                <figure className="pl-cap-fig">
                  <div className="pl-cap-marco" data-pl="ventana"><PlShot slug={o.slug} vista={vv} vp="desktop" alt={`${o.name} · ${nombreVista(vv)} · ${c.ficha.escritorio}`} diferida /></div>
                  <figcaption className="pl-mono">{nombreVista(vv)} · {c.ficha.escritorioLbl}</figcaption>
                </figure>
                {!recorrido && (
                  <figure className="pl-cap-fig pl-cap-fig--m">
                    <div className="pl-cap-marco pl-cap-marco--m" data-pl="ventana"><PlShot slug={o.slug} vista={vv} vp="mobile" alt={`${o.name} · ${nombreVista(vv)} · ${c.ficha.movil}`} diferida /></div>
                    <figcaption className="pl-mono">{nombreVista(vv)} · {c.ficha.movilLbl}</figcaption>
                  </figure>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pl-hoja-d" data-tono="claro" aria-labelledby="pl-hoja-t">
        <h2 id="pl-hoja-t" className="pl-h-m" data-pl="linea">{c.ficha.hoja}</h2>
        <dl className="pl-datos" data-pl="subir">
          <Dato k={c.ficha.rol}>{o.rolLabel ?? c.kinds[o.kind]}</Dato>
          {o.kind === 'store' && o.status && <Dato k={c.ficha.estado}>{c.ficha.estadoVal[o.status === 'live' ? 'live' : 'dev']}</Dato>}
          <Dato k={c.ficha.periodo}>{periodo}</Dato>
          <Dato k={c.ficha.pila}>{o.stack.join(' · ')}</Dato>
          {empresa && <Dato k={c.ficha.empleo}>{empresa}</Dato>}
          {catalogo && comercio && <Dato k={c.ficha.catalogo}>{catalogo}<small>{c.ficha.catalogoNota(fecha(comercio.fecha))}</small></Dato>}
          {git && git.commits > 0 && <Dato k={c.ficha.historial}>{c.ficha.historialVal(git.commits, fecha(git.fecha))}</Dato>}
          {o.views.length > 0 && <Dato k={c.ficha.capturas}>{c.ficha.capturasDe(fecha(indiceDe(o.slug) >= 0 ? FECHA_RECORRIDO : SHOT_DATE))}</Dato>}
          {o.repo && <Dato k={c.ficha.repo}><a className="pl-enlace" href={o.repo} target="_blank" rel="noopener noreferrer">{sinProtocolo(o.repo)}</a></Dato>}
          {o.link && <Dato k={c.ficha.visitarSitio}><a className="pl-enlace" href={o.link} target="_blank" rel="noopener noreferrer">{sinProtocolo(o.link)}</a></Dato>}
        </dl>
      </section>

      {siguiente && (
        <section className="pl-sig" data-tono="claro" aria-label={c.ficha.siguiente}>
          <Enlace className="pl-sig-a" to={v5path(ID, 'obra', siguiente.slug)} oscuro={con3d} directo={con3d}>
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
