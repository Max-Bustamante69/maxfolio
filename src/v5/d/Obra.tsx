import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { datosDe, useV5, v5path, type Obra } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { Cabeza } from './Cabeza'
import { Enlace } from './Enlace'
import { useAnimaAlMontar } from './ajustes'
import { TECNOLOGIAS, TIPOS, fechasDeDatos, ordenar, rolDe, tieneTecnologia, useObras, usePeriodo } from './datos'
import { CORTE, CORTE_H, LIMPIAR, SNAP, enTransicion, esPrimeraCarga, fotoDeVuelta, gsap, revelarFila, useCoreografia } from './movimiento'
import { llenar, useCopy } from './copy'

const PASO = 6 // la tabla crece de 6 en 6
const MAX = 12 // y nunca pasa de 12 columnas a la vez: más allá, «Ver otras 6» las sustituye
/** Tecnologías siempre a la vista; el resto, tras «+ N». */
const TEC_A_LA_VISTA = ['islands', 'bundles', 'reviews']
const FILAS = ['rubro', 'tipo', 'anio', 'construccion', 'rol', 'pila', 'git', 'lhMovil', 'lhEscritorio', 'catalogo', 'capturas'] as const
type Fila = (typeof FILAS)[number]


type Opciones = [string, string][]
/** Un grupo de filtros: botones que conmutan (pulsar el activo lo quita). Vive FUERA de la vista: dentro, cada render crearía un
 *  componente nuevo, React lo montaría de cero y la tecla pulsada perdería el foco y parpadearía. */
function Chips({ id, etiqueta, opciones, actual, fijar }: { id: string; etiqueta: string; opciones: Opciones; actual: string | null; fijar: (k: string, v: string | null) => void }) {
  return (
    <div className="d-filtro" role="group" aria-label={etiqueta}>
      <span className="d-cap">{etiqueta}</span>
      <div className="d-chips">
        {opciones.map(([valor, nombre]) => (
          <button key={valor} type="button" className="d-chip" aria-pressed={actual === valor} onClick={() => fijar(id, valor)}>{nombre}</button>
        ))}
      </div>
    </div>
  )
}

/** Tecnología: tres a la vista y el resto plegado en un <details> «+ N» (la que esté activa nunca se esconde). */
function ChipsTec({ etiqueta, mas, opciones, actual, fijar }: { etiqueta: string; mas: string; opciones: Opciones; actual: string | null; fijar: (k: string, v: string | null) => void }) {
  const visibles = opciones.filter(([v]) => TEC_A_LA_VISTA.includes(v) || v === actual)
  const resto = opciones.filter(([v]) => !visibles.some(([x]) => x === v))
  return (
    <div className="d-filtro" role="group" aria-label={etiqueta}>
      <span className="d-cap">{etiqueta}</span>
      <div className="d-chips">
        {visibles.map(([valor, nombre]) => (
          <button key={valor} type="button" className="d-chip" aria-pressed={actual === valor} onClick={() => fijar('tec', valor)}>{nombre}</button>
        ))}
        {resto.length > 0 && (
          <details className="d-mas-tec">
            <summary className="d-chip">{llenar(mas, { n: resto.length })}</summary>
            <div className="d-mas-panel">
              {resto.map(([valor, nombre]) => (
                <button key={valor} type="button" className="d-chip" aria-pressed={actual === valor} onClick={(e) => { fijar('tec', valor); e.currentTarget.closest('details')?.removeAttribute('open') }}>{nombre}</button>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

/** Obra: la tabla de comparación de modelos. Las obras son columnas y sus atributos son filas; lo que no existe se escribe «—». */
export default function ObraVista() {
  const t = useCopy()
  const c = t.obra
  const { strings, intlLocale } = useV5()
  const periodo = usePeriodo()
  const obras = useObras()
  const anima = useAnimaAlMontar()
  const movil = useMediaQuery('(max-width: 767px)')
  const compacto = useMediaQuery('(max-width: 1023px)')
  const [params, setParams] = useSearchParams()
  const [marcadas, setMarcadas] = useState<string[]>([])
  const [visibles, setVisibles] = useState(PASO)
  const [desde, setDesde] = useState(0)
  const [actual, setActual] = useState(0)
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const marco = useRef<HTMLDivElement>(null)
  const tabla = useRef<HTMLTableElement>(null)
  const previas = useRef<Set<string>>(new Set())
  const busqueda = useRef<HTMLInputElement>(null)
  const nf = new Intl.NumberFormat(intlLocale)

  const tipo = params.get('tipo')
  const anio = params.get('anio')
  const rol = params.get('rol')
  const tec = params.get('tec')
  const q = (params.get('q') ?? '').trim().toLowerCase()
  const comparar = (params.get('comparar') ?? '').split(',').filter(Boolean).slice(0, 3)
  const hayFiltro = Boolean(tipo || anio || rol || tec || q)

  const todas = useMemo(() => ordenar(obras), [obras])
  const fechas = useMemo(() => fechasDeDatos(obras), [obras])
  const filtradas = todas.filter(
    (o) => (!tipo || o.kind === tipo) && (!anio || String(o.year) === anio) && (!rol || rolDe(o, strings.badges.roles) === rol) && (!tec || tieneTecnologia(o, tec)) && (!q || o.name.toLowerCase().includes(q)),
  )
  const anios = [...new Set(obras.map((o) => o.year))].sort((a, b) => b - a)
  const roles = [...new Set(obras.map((o) => rolDe(o, strings.badges.roles)).filter((r): r is NonNullable<typeof r> => Boolean(r)))]
  const rolNombre = (r: string) => (r === 'custom' ? c.rolCustom : strings.badges.roles[r as keyof typeof strings.badges.roles])

  const porSlug = (s: string) => obras.find((o) => o.slug === s)
  const columnas: Obra[] = comparar.length ? comparar.map(porSlug).filter((o): o is Obra => Boolean(o)) : filtradas.slice(desde, desde + visibles)
  const clave = columnas.map((o) => o.slug).join(',')
  const primeraSlug = columnas[0]?.slug ?? ''
  const hayMas = !comparar.length && desde + visibles < filtradas.length
  const proximas = Math.min(PASO, filtradas.length - desde - visibles)

  const reiniciar = () => {
    setVisibles(PASO)
    setDesde(0)
  }
  const fijar = (k: string, valor: string | null) => {
    reiniciar()
    setParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        if (!valor || n.get(k) === valor) n.delete(k)
        else n.set(k, valor)
        n.delete('comparar')
        return n
      },
      { replace: true },
    )
  }
  /** La búsqueda guarda su texto en un estado local (el campo no pierde teclas) y lo refleja en la URL. */
  const buscarTexto = (v: string) => {
    setTexto(v)
    reiniciar()
    setParams((prev) => {
      const n = new URLSearchParams(prev)
      if (v.trim()) n.set('q', v)
      else n.delete('q')
      n.delete('comparar')
      return n
    }, { replace: true })
  }
  const limpiar = () => {
    reiniciar()
    setTexto('')
    setParams({}, { replace: true })
  }
  const alternar = (slug: string) => setMarcadas((m) => (m.includes(slug) ? m.filter((x) => x !== slug) : m.length < 3 ? [...m, slug] : m))
  const aplicarComparacion = () => setParams((prev) => ({ ...Object.fromEntries(prev), comparar: marcadas.join(',') }), { replace: true })
  const quitarComparacion = () => {
    setMarcadas([])
    setParams((prev) => {
      const n = new URLSearchParams(prev)
      n.delete('comparar')
      return n
    }, { replace: true })
  }

  // ENTRADA (una sola vez al montar): el título barre, el LCD enciende y la barra de filtros aparece. Un filtro, la búsqueda o
  // «Mostrar 6 más» NO vuelven a ejecutarla: un interruptor no enciende de nuevo la máquina. Si la vista llega dentro de una View
  // Transition, el barrido de la página ya es su entrada y solo queda el parpadeo del LCD.
  useCoreografia(
    raiz,
    () => {
      const tl = gsap.timeline({ defaults: { ease: SNAP, clearProps: LIMPIAR }, delay: esPrimeraCarga() ? 0.12 : 0.04 })
      if (enTransicion()) {
        tl.from('.d-ttl .d-lcd', { opacity: 0, duration: 0.09, ease: 'steps(3)' }, 0.08)
        return
      }
      tl.from('.d-ttl h1', { clipPath: CORTE.oculto, y: 24, duration: 0.5 }, 0)
        .from('.d-ttl .d-dek', { clipPath: CORTE.oculto, y: 8, duration: 0.36 }, 0.14)
        .from('.d-ttl .d-lcd', { opacity: 0, duration: 0.09, ease: 'steps(3)' }, 0.22)
        .from('.d-ttl .d-lcd p', { clipPath: CORTE_H.oculto, duration: 0.34, ease: 'steps(16)', stagger: 0.1 }, 0.28)
        .from('.d-flt', { opacity: 0, duration: 0.3 }, 0.2)
    },
    anima,
    [],
  )

  // TABLA (cada vez que cambian las columnas): solo lo NUEVO se anima. Las cabeceras nuevas barren en cascada y cada fila barre
  // únicamente sus celdas nuevas al entrar en pantalla (la tabla se imprime como una hoja de datos). Lo que ya estaba no se toca,
  // y si ya había columnas el contador del LCD parpadea en tres pasos: así se nota que el dato cambió, sin repetir la página.
  useCoreografia(
    raiz,
    () => {
      const t = tabla.current
      if (!t) return
      if (t.querySelector('th.d-col:not([data-nueva])')) gsap.fromTo('.d-ttl .d-lcd-l1', { opacity: 0 }, { opacity: 1, duration: 0.09, ease: 'steps(3)', clearProps: 'opacity' })
      const nuevas = t.querySelectorAll('thead th[data-nueva]')
      if (nuevas.length && !enTransicion()) gsap.from(nuevas, { clipPath: CORTE.oculto, duration: 0.3, ease: SNAP, stagger: 0.05, delay: esPrimeraCarga() ? 0.3 : 0, clearProps: 'clipPath' })
      t.querySelectorAll('tbody tr').forEach((fila) => {
        const celdas = Array.from(fila.querySelectorAll('td[data-nueva]'))
        revelarFila(fila, () => {
          gsap.from(fila.querySelectorAll('td[data-nueva] .d-barra-lh i'), { scaleX: 0, duration: 0.5, ease: SNAP, stagger: 0.05, clearProps: 'transform' })
        }, celdas)
      })
    },
    anima,
    [clave],
  )
  // Recuerda qué columnas ya se vieron (después de la coreografía, que lee `data-nueva`).
  useLayoutEffect(() => {
    previas.current = new Set(columnas.map((o) => o.slug))
  })

  // «Volver a la tabla» desde una ficha: la foto regresa a la columna de la obra que se deja (nombre de transición compartido).
  useLayoutEffect(() => {
    const slug = fotoDeVuelta()
    if (slug) raiz.current?.querySelector<HTMLElement>(`[data-slug="${slug}"] img`)?.style.setProperty('view-transition-name', 'd-foto')
  }, [])

  // Móvil: la comparación es el gesto. La tabla desliza de columna en columna (scroll-snap) y el control «‹ M03 · Nombre ›» dice
  // cuál es la primera a la vista y salta a la anterior o la siguiente. Al cambiar de primera columna, vuelve al inicio.
  const anchoColumna = () => marco.current?.querySelector<HTMLElement>('th.d-col')?.offsetWidth || 168
  const alDeslizar = () => {
    if (marco.current && movil) setActual(Math.min(columnas.length - 1, Math.max(0, Math.round(marco.current.scrollLeft / anchoColumna()))))
  }
  const irAColumna = (i: number) => marco.current?.scrollTo({ left: Math.min(columnas.length - 1, Math.max(0, i)) * anchoColumna(), behavior: 'smooth' })
  useLayoutEffect(() => {
    if (marco.current) marco.current.scrollLeft = 0
    setActual(0)
  }, [primeraSlug])

  const dato = (k: Fila, o: Obra): ReactNode => {
    const d = datosDe(o.slug)
    const lh = (v: 'movil' | 'escritorio') => {
      const x = d.lighthouse?.[v]
      if (!x) return k === 'lhMovil' && o.tema === 'cliente' ? c.temaCliente : '—'
      return (
        <>
          <span className="d-lh">
            <span className="d-num">{x.perf}</span>
            <small>{c.rend}</small>
            <span className="d-barra-lh"><i style={{ '--v': x.perf / 100 } as CSSProperties} /></span>
          </span>
          <span className="d-lhx">{c.acc} {x.a11y} · SEO {x.seo}</span>
        </>
      )
    }
    switch (k) {
      case 'rubro':
        return o.industry ?? '—'
      case 'tipo':
        return c.tipoUno[o.kind]
      case 'anio':
        return o.year
      case 'construccion':
        return o.period ? periodo(o.period.start, o.period.end) : '—'
      case 'rol':
        return o.rolLabel ?? '—'
      case 'pila':
        return o.stack.length ? o.stack.join(' · ') : '—'
      case 'git':
        return d.git ? llenar(c.gitCelda, { commits: nf.format(d.git.commits), secciones: d.git.sections }).split(' · ').map((x) => <span className="d-linea" key={x}>{x}</span>) : '—'
      case 'lhMovil':
        return lh('movil')
      case 'lhEscritorio':
        return lh('escritorio')
      case 'catalogo': {
        const m = d.comercio
        if (!m) return '—'
        return (
          <>
            <span className="d-linea">{llenar(c.catalogoCelda, { p: nf.format(m.products), c: m.collections ?? '—' })}</span>
            {m.priceMin !== null && m.priceMax !== null && <span className="d-linea">{m.currency} {nf.format(m.priceMin)}–{nf.format(m.priceMax)}</span>}
          </>
        )
      }
      case 'capturas':
        return o.views.length ? `✓ ${o.views.map((v) => (v === 'home' ? t.ficha.home : 'PDP')).join(' · ')}` : '—'
    }
  }
  const pista = (k: Fila) =>
    k === 'git' ? fechas.git : k === 'lhMovil' || k === 'lhEscritorio' ? `${c.lhOrden} · ${fechas.lh}` : k === 'catalogo' ? fechas.catalogo : ''

  // Resalta la columna bajo el puntero (un solo atributo en la tabla, sin estado de React).
  const resaltar = (e: PointerEvent<HTMLTableElement>) => {
    const col = (e.target as HTMLElement).closest('[data-c]')?.getAttribute('data-c') ?? ''
    if (tabla.current && tabla.current.dataset.hot !== col) tabla.current.dataset.hot = col
  }
  // Atajos del catálogo (WCAG 2.1.4): solo con el foco dentro de él y sin escribir en un campo. K busca, C salta a la tabla.
  const atajos = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return
    if (e.key === 'k' || e.key === 'K') {
      e.preventDefault()
      busqueda.current?.focus()
    }
    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault()
      tabla.current?.closest<HTMLElement>('.d-tabla-marco')?.focus()
    }
  }

  const grupos = (
    <>
      <div className="d-flt-fila">
        <Chips id="tipo" etiqueta={c.tipo} actual={tipo} fijar={fijar} opciones={TIPOS.map((k) => [k, c.tipos[k]])} />
        <Chips id="anio" etiqueta={c.anio} actual={anio} fijar={fijar} opciones={anios.map((a) => [String(a), String(a)])} />
        <Chips id="rol" etiqueta={c.rol} actual={rol} fijar={fijar} opciones={roles.map((r) => [r, rolNombre(r)])} />
      </div>
      <div className="d-flt-fila">
        <ChipsTec etiqueta={c.tecnologia} mas={c.masFiltros} actual={tec} fijar={fijar} opciones={TECNOLOGIAS.map((f) => [f.id, strings.sections.shopify.filters[f.id]])} />
      </div>
    </>
  )

  const modoComparar = comparar.length > 0
  const lcdL2 = movil ? c.lcdMovil : modoComparar ? llenar(c.lcdComparando, { n: comparar.length }) : c.lcdLibre
  const aqui = columnas[actual]

  return (
    <div ref={raiz} className="d-vista" onKeyDown={atajos}>
      <Cabeza titulo={`${t.titulos.obra} · ${t.nav.obra[1]} · ${strings.hero.eyebrow.split(' · ')[0]}`} />
      <section className="d-banda" aria-labelledby="d-h1">
        <div className="d-celda d-ttl">
          <div>
            <h1 id="d-h1" className="d-h1 d-h1-pagina d-h1-obra">{t.titulos.obra}</h1>
            <p className="d-dek">{c.lead}</p>
          </div>
          <div className="d-lcd d-lcd-chico" role="group" aria-label={c.tablaAria}>
            <p className="d-lcd-l1"><span className="d-led" aria-hidden="true" />{llenar(c.lcdContador, { n: columnas.length, t: filtradas.length })}</p>
            <p className="d-lcd-l2">{lcdL2}</p>
          </div>
        </div>

        <div className="d-flt">
          {compacto && (
            <button type="button" className="d-chip d-chip-filtros" aria-expanded={filtrosAbiertos} aria-controls="d-grupos" onClick={() => setFiltrosAbiertos((v) => !v)}>
              {c.filtrosAbrir}{hayFiltro ? ` · ${filtradas.length}` : ''}
            </button>
          )}
          <div id="d-grupos" className="d-grupos" hidden={compacto && !filtrosAbiertos}>{grupos}</div>
          <label className="d-buscar">
            <span className="d-cap">{c.buscar} <kbd>K</kbd></span>
            <input ref={busqueda} type="search" value={texto} onChange={(e) => buscarTexto(e.target.value)} autoComplete="off" />
          </label>
          <div className="d-estado">
            {hayFiltro && (
              <p role="status" className="d-dato">
                {llenar(c.mostrando, { n: filtradas.length })} ·{' '}
                <button type="button" className="d-enlace-btn" onClick={limpiar}>{c.limpiar}</button>
              </p>
            )}
            {modoComparar && (
              <p className="d-dato">
                {llenar(c.comparando, { n: comparar.length })} ·{' '}
                <button type="button" className="d-enlace-btn" onClick={quitarComparacion}>{c.quitarComparacion}</button>
              </p>
            )}
            {!movil && !modoComparar && (
              marcadas.length >= 2 ? (
                <button type="button" className="d-ter d-ter-btn" onClick={aplicarComparacion}>{llenar(c.comparaAncho, { n: marcadas.length })} →</button>
              ) : (
                <p className="d-dato d-oculto-tablet">{c.columnaFija}</p>
              )
            )}
          </div>
        </div>

        {movil && aqui && columnas.length > 1 && (
          <div className="d-celda d-modelo-nav" role="group" aria-label={c.modelo}>
            <button type="button" className="d-chip d-flecha" onClick={() => irAColumna(actual - 1)} disabled={actual === 0} aria-label={t.ficha.anterior}>‹</button>
            <p className="d-modelo-actual" aria-live="polite">
              <span className="d-cap">{llenar(c.modeloN, { n: String(todas.indexOf(aqui) + 1).padStart(2, '0') })}</span>
              <b>{aqui.name}</b>
            </p>
            <button type="button" className="d-chip d-flecha" onClick={() => irAColumna(actual + 1)} disabled={actual >= columnas.length - 1} aria-label={t.ficha.siguiente}>›</button>
          </div>
        )}

        {columnas.length === 0 ? (
          <p className="d-celda d-vacio" role="status">{c.sinResultados}</p>
        ) : (
          <div className="d-tabla-marco" ref={marco} tabIndex={0} role="region" aria-label={c.tablaAria} onScroll={alDeslizar}>
            <table ref={tabla} className="d-tabla" style={{ '--cols': columnas.length } as CSSProperties} onPointerOver={resaltar} onPointerLeave={() => tabla.current && (tabla.current.dataset.hot = '')}>
              <caption className="d-solo-lector">{c.tablaAria}</caption>
              <thead>
                <tr>
                  <th scope="col" className="d-esquina">
                    <div className="d-esquina-in">
                      <span className="d-cap">{c.atributo}</span>
                      <b>{llenar(c.lcdContador, { n: columnas.length, t: filtradas.length }).toLowerCase()}</b>
                    </div>
                  </th>
                  {columnas.map((o, i) => (
                    <th key={o.slug} scope="col" className="d-col" data-c={i} data-slug={o.slug} data-sel={marcadas.includes(o.slug) || modoComparar} data-nueva={previas.current.has(o.slug) ? undefined : ''}>
                      <span className="d-col-tope">
                        <span className="d-cap">{llenar(c.modeloN, { n: String(todas.indexOf(o) + 1).padStart(2, '0') })}</span>
                        {!movil && !modoComparar && (
                          <label className="d-casilla" title={c.elegir}>
                            <input type="checkbox" checked={marcadas.includes(o.slug)} onChange={() => alternar(o.slug)} aria-label={`${c.comparar}: ${o.name}`} />
                          </label>
                        )}
                      </span>
                      <Enlace foto to={v5path('d', 'obra', o.slug)} className="d-col-enlace">
                        {o.views.includes('home') ? <ShotImg slug={o.slug} vista="home" vp="desktop" alt="" /> : <span className="d-sin-captura" aria-hidden="true">—</span>}
                        <span className="d-col-nombre">{o.name}</span>
                      </Enlace>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FILAS.map((k) => (
                  <tr key={k}>
                    <th scope="row">
                      <span className="d-cap">{c.filas[k]}</span>
                      {pista(k) && <small>{pista(k)}</small>}
                    </th>
                    {columnas.map((o, i) => <td key={o.slug} data-c={i} data-nueva={previas.current.has(o.slug) ? undefined : ''}>{dato(k, o)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!modoComparar && (desde > 0 || hayMas) && (
          <div className="d-celda d-mas">
            {desde > 0 && (
              <button type="button" className="d-ter d-ter-btn" onClick={() => setDesde((d) => Math.max(0, d - PASO))}>← {llenar(c.anteriores, { n: Math.min(PASO, desde) })}</button>
            )}
            {hayMas && (
              <button type="button" className="d-ter d-ter-btn" onClick={() => (visibles < MAX ? setVisibles((n) => n + PASO) : setDesde((d) => d + PASO))}>
                {llenar(visibles < MAX ? c.masModelos : c.otras, { n: proximas })}{visibles < MAX ? '' : ' →'}
              </button>
            )}
          </div>
        )}
        <div className="d-celda d-notas">
          <p className="d-nota-chica">{c.pieGit}</p>
          <p className="d-nota-chica">{c.pieLighthouse}</p>
          <p className="d-nota-chica">{c.pieCatalogo}</p>
        </div>
      </section>
    </div>
  )
}
