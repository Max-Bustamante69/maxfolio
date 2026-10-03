import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useSearchParams } from 'react-router-dom'
import { type Obra as ObraT } from '../data'
import { fechaCorta, medidasDe } from './casos'
import { capaEstado, usePlato } from './contexto'
import { control, type Ancla } from './escena/control'
import { ORDEN } from './escena/sets'
import { alScroll, aterrizar, useVista, vueloDe } from './motion'
import { alcanceDe } from './alcance'
import { Enlace, Flecha, Rod, Tarjeta, ruta } from './piezas'

const N = ORDEN.length
const acota = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
type Tipo = 'todo' | 'store' | 'product' | 'personal' | 'role'
const TIPOS: Tipo[] = ['todo', 'store', 'product', 'personal', 'role']

const etqDe = (o: ObraT, c: ReturnType<typeof usePlato>['c']) => [o.industry, o.rolLabel ?? c.kinds[o.kind], o.year].filter(Boolean).join(' • ')

/** Fila de obra sin captura (o de las listas largas): año, nombre con su historia en una línea, pila. */
function Fila({ o, c }: { o: ObraT; c: ReturnType<typeof usePlato>['c'] }) {
  return (
    <li className="pl-fila" data-pl="subir">
      <Enlace to={ruta('obra', o.slug)} className="pl-fila-a">
        <span className="pl-mono pl-fila-anio">{o.year}</span>
        <span className="pl-fila-cuerpo">
          <span className="pl-fila-n">{o.name}</span>
          {o.tagline && <span className="pl-fila-t">{o.tagline}</span>}
        </span>
        <span className="pl-mono pl-fila-pila">{o.kind === 'role' ? (o.stack[0] ?? '') : o.stack.slice(0, 3).join(' · ')}</span>
        <span className="pl-fila-f" aria-hidden="true"><Flecha /></span>
        <span className="pl-sr">{c.kinds[o.kind]}</span>
      </Enlace>
    </li>
  )
}

/** El recorrido: la cámara pasa por los 19 sets, uno por beat. El scroll es el nativo; el mundo persigue la estación más cercana. */
function Recorrido() {
  const { c, v, setModo } = usePlato()
  const [est, setEst] = useState(0)
  const rotulo = useRef<HTMLDivElement>(null)
  const guia = useRef<HTMLSpanElement>(null)
  const caja = useRef<HTMLAnchorElement>(null)
  const riel = useRef<HTMLDivElement>(null)
  const slugs = ORDEN.map((s) => s)
  const actual = v.obra(slugs[est])
  const { locale } = useLanguage()
  const alcance = actual ? alcanceDe(actual, locale) : ''
  const med = actual ? medidasDe(actual, locale, (iso) => fechaCorta(iso, v.intlLocale), actual.period ? v.formatPeriod(actual.period.start, actual.period.end) : String(actual.year))[0] : null

  useEffect(() => {
    const vh = () => window.innerHeight
    const ir = (i: number) => window.scrollTo({ top: acota(i, 0, N - 1) * vh(), behavior: 'smooth' })
    control.set({ modo: 'recorrido', slug: null })
    if (control.volver != null) { window.scrollTo({ top: acota(control.volver, 0, N - 1) * vh(), behavior: 'instant' }); control.volver = null }
    document.documentElement.classList.add('pl-snap')
    control.alEstacion = setEst
    control.alAncla = (a: Ancla) => {
      const r = rotulo.current, g = guia.current, k = caja.current
      if (!r || !g || !k) return
      const w = window.innerWidth
      const ancho = r.offsetWidth || 300
      // El rótulo cuelga del borde interior del set, hacia el eje de la sala; la guía es una línea de 1 px con un punto en la esquina.
      const x = a.x, y = Math.max(a.y, 150)
      const izq = a.lado > 0 ? Math.max(24, x - 44 - ancho) : Math.min(w - ancho - 24, x + 44)
      r.style.transform = `translate3d(${izq}px,${y - 12}px,0)`
      r.style.opacity = a.ok ? String(a.a) : '0'
      const desde = a.lado > 0 ? izq + ancho : izq
      g.style.transform = `translate3d(${Math.min(desde, x)}px,${y}px,0)`
      g.style.width = `${Math.abs(x - desde)}px`
      g.style.opacity = a.ok ? String(a.a) : '0'
      const [x0, y0, x1, y1] = a.caja
      k.style.transform = `translate3d(${x0}px,${y0}px,0)`
      k.style.width = `${Math.max(0, x1 - x0)}px`
      k.style.height = `${Math.max(0, y1 - y0)}px`
      k.style.pointerEvents = a.ok && a.a > 0.8 ? 'auto' : 'none'
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
      if (e.key === 'ArrowRight') { e.preventDefault(); ir(Math.round(window.scrollY / vh()) + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir(Math.round(window.scrollY / vh()) - 1) }
    }
    window.addEventListener('keydown', tecla)
    const suelta = alScroll((y) => {
      const t = acota(y / vh(), 0, N - 1)
      control.set({ t })
      capaEstado(y < N * vh() - 2)
      riel.current?.style.setProperty('--p', String(t / (N - 1)))
    })
    return () => {
      suelta()
      window.removeEventListener('keydown', tecla)
      document.documentElement.classList.remove('pl-snap')
      control.alAncla = null
      control.alEstacion = null
    }
  }, [])

  const ir = (i: number) => window.scrollTo({ top: acota(i, 0, N - 1) * window.innerHeight, behavior: 'smooth' })
  return (
    <section className="pl-rec" data-tono="oscuro" aria-label={c.obra.recorrido}>
      <div className="pl-rec-pega">
        <h1 className="pl-rec-h1">{c.obra.h1}</h1>
        <a className="pl-set-link" ref={caja} href={actual ? ruta('obra', actual.slug) : '#'} tabIndex={-1} aria-hidden="true" onClick={(e) => { e.preventDefault(); if (actual) document.querySelector<HTMLAnchorElement>('.pl-rotulo-abrir')?.click() }}>{null}</a>
        <span className="pl-guia" ref={guia} aria-hidden="true" />
        <div className="pl-rotulo" ref={rotulo} key={actual?.slug}>
          {actual && (
            <>
              <p className="pl-mono pl-rotulo-k">{c.obra.lote} {String(est + 1).padStart(2, '0')}</p>
              <p className="pl-rotulo-n">{actual.name}</p>
              <p className="pl-mono pl-rotulo-r">{[actual.industry, actual.year].filter(Boolean).join(' · ')}</p>
              <p className="pl-rotulo-c">{alcance}</p>
              {med && (
                <p className="pl-rotulo-m">
                  <b>{med.valor}</b>
                  <span className="pl-mono">{med.etq}</span>
                  <span className="pl-mono pl-rotulo-nota">{med.nota}</span>
                </p>
              )}
              <Enlace to={ruta('obra', actual.slug)} className="pl-rotulo-abrir pl-pil pl-pil--tung" directo oscuro>
                <Rod>{c.obra.abrir}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
              </Enlace>
            </>
          )}
        </div>

        <div className="pl-rec-pie">
          <p className="pl-hud">
            <span>{c.obra.lote} {String(est + 1).padStart(2, '0')} {c.obra.de} {N}</span><i /><span>{actual ? `${actual.name} · ${actual.year}` : ''}</span>
          </p>
          <div className="pl-rec-acc">
            <button type="button" className="pl-pil pl-pil--clara" onClick={() => setModo('lista')}>
              <Rod>{c.modo.aLista}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
            </button>
          </div>
          <div className="pl-rec-nav">
            <button type="button" className="pl-redondo" aria-label={c.obra.anterior} onClick={() => ir(est - 1)} disabled={est === 0}><Flecha izq /></button>
            <button type="button" className="pl-redondo" aria-label={c.obra.siguiente} onClick={() => ir(est + 1)} disabled={est === N - 1}><Flecha /></button>
          </div>
        </div>
        <div className="pl-riel" ref={riel} aria-hidden="true"><i /></div>
      </div>
      <div className="pl-rec-pasos" aria-hidden="true">
        {slugs.map((s) => <div key={s} className="pl-rec-paso" />)}
      </div>
      {/* Camino de teclado: la lista de lotes existe para quien no usa la rueda; enfocar un enlace lleva la cámara a su set. */}
      <ul className="pl-sr-lista" aria-label={c.obra.recorrido}>
        {slugs.map((s, i) => {
          const o = v.obra(s)
          return o ? (
            <li key={s}>
              <Enlace to={ruta('obra', s)} onFocus={() => window.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' })}>{o.name}</Enlace>
            </li>
          ) : null
        })}
      </ul>
    </section>
  )
}

/** Un tramo que se pliega con la animación de acordeón de la casa: el resto de la lista entra y sale con `grid-template-rows`. */
function Pliegue({ n, abierto, alternar, children, c }: { n: number; abierto: boolean; alternar: () => void; children: ReactNode; c: ReturnType<typeof usePlato>['c'] }) {
  const id = useId()
  return (
    <div className="pl-pliegue" data-abierto={abierto}>
      <div id={id} className="pl-pliegue-cuerpo" inert={!abierto}><div className="pl-pliegue-in">{children}</div></div>
      <button type="button" className="pl-pil pl-pil--clara pl-pliegue-b" aria-expanded={abierto} aria-controls={id} onClick={alternar}>
        <Rod>{abierto ? c.obra.verMenos : c.obra.verRestantes(n)}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
      </button>
    </div>
  )
}

export default function Obra() {
  const { c, v, en3d } = usePlato()
  const [params, setParams] = useSearchParams()
  const [mas, setMas] = useState(false)
  const pedido = params.get('tipo') as Tipo | null
  const tipo: Tipo = pedido && TIPOS.includes(pedido) ? pedido : 'todo'
  // La captura que vuelve de su ficha cruza hasta su tarjeta (la tarjeta no se revela aparte: el vuelo ya es su entrada).
  const llega = useRef(vueloDe()).current
  const riel = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const textoDe = (o: ObraT) => alcanceDe(o, locale)
  const medidaDe = (o: ObraT) => medidasDe(o, locale, (iso) => fechaCorta(iso, v.intlLocale), o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year))[0]
  const alRiel = () => {
    const r = riel.current
    if (!r) return
    r.parentElement?.style.setProperty('--p', String(r.scrollLeft / Math.max(1, r.scrollWidth - r.clientWidth)))
  }
  const ref = useVista<HTMLElement>([en3d], (raiz, limpiar) => {
    if (!llega || en3d) return
    const marco = raiz.querySelector<HTMLElement>(`.pl-tarjeta[data-slug="${llega}"] .pl-tarjeta-marco`)
    if (!marco) return
    const r = marco.getBoundingClientRect()
    window.scrollTo({ top: Math.max(0, window.scrollY + r.top - (window.innerHeight - r.height) / 2), behavior: 'instant' })
    aterrizar(llega, marco, limpiar)
  })

  const conCaptura = ORDEN.map((s) => v.obra(s)).filter((o): o is ObraT => !!o)
  const viejas = v.obras.filter((o) => o.kind === 'store' && !ORDEN.includes(o.slug as (typeof ORDEN)[number]))
  const productos = v.obras.filter((o) => o.kind === 'product')
  const propios = v.obras.filter((o) => o.kind === 'personal')
  const entregables = v.obras.filter((o) => o.kind === 'role')
  const ver = (t: Exclude<Tipo, 'todo'>) => tipo === 'todo' || tipo === t
  const tarjetas = (lista: ObraT[]) => lista.filter((o) => o.views.length)
  const sinCaptura = (lista: ObraT[]) => lista.filter((o) => !o.views.length)
  const filas = (lista: ObraT[]) => <ul className="pl-filas">{lista.map((o) => <Fila key={o.slug} o={o} c={c} />)}</ul>
  // Vista «todo»: lo que más pesa va a la vista (apps y plataforma, dos proyectos propios); el resto de las listas se pliega en un solo gesto.
  const plegar = tipo === 'todo'
  const propiosVista = plegar ? propios.slice(0, 2) : propios
  const resto = plegar ? [propios.slice(2), viejas, entregables] : []
  const nResto = resto.reduce((a, l) => a + l.length, 0)

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className={`pl-vista pl-obra${en3d ? ' pl-obra--3d' : ''}`}>
      <title>{`${c.obra.h1} · ${v.personal.name}`}</title>
      <meta name="robots" content="noindex" />

      {en3d ? (
        <Recorrido />
      ) : (
        <section className="pl-lista-cab" data-tono="oscuro">
          <h1 className="pl-h-xl" data-pl="linea">{c.obra.h1}</h1>
          <p className="pl-lista-lead" data-pl="subir" data-pl-retraso="0.15">{c.obra.lead}</p>
          <div className="pl-chips" role="group" aria-label={c.obra.filtrar} data-pl="subir" data-pl-retraso="0.25">
            {TIPOS.map((t) => (
              <button key={t} type="button" className="pl-chip" aria-pressed={t === tipo} onClick={() => setParams(t === 'todo' ? {} : { tipo: t }, { replace: true })}>{c.obra.tipos[t]}</button>
            ))}
          </div>
        </section>
      )}

      {!en3d && ver('store') && (
        <section className="pl-lista" data-tono="oscuro" aria-labelledby="pl-t-tiendas">
          <h2 id="pl-t-tiendas" className="pl-h-m" data-pl="linea">{c.obra.tiendas}</h2>
          <div className="pl-riel-caja">
            <p className="pl-mono pl-riel-meta" aria-hidden="true"><span>{c.obra.tiendasN(conCaptura.length)}</span><span>{c.obra.desliza} →</span></p>
            <div className="pl-rejilla pl-rejilla--riel" ref={riel} onScroll={alRiel}>
              {conCaptura.map((o, i) => <Tarjeta key={o.slug} o={o} etq={etqDe(o, c)} prioridad={i < 2} recibe={o.slug === llega} texto={textoDe(o)} medida={medidaDe(o)} />)}
            </div>
            <span className="pl-riel-barra" aria-hidden="true"><i /></span>
          </div>
        </section>
      )}

      <section className="pl-mas" data-tono="claro">
        <div className="pl-mas-cab">
          <h2 className="pl-h-l pl-mas-t" data-pl="linea">{c.obra.masObra}</h2>
          <p className="pl-lista-lead" data-pl="subir" data-pl-retraso="0.15">{c.obra.masObraLead}</p>
        </div>
        {ver('store') && !plegar && viejas.length > 0 && (
          <div className="pl-bloque">
            <h2 className="pl-h-m" data-pl="linea">{c.obra.tiendasAntes}</h2>
            {filas(viejas)}
          </div>
        )}
        {ver('product') && (
          <div className="pl-bloque">
            <h2 className="pl-h-m" data-pl="linea">{c.obra.productos}</h2>
            {tarjetas(productos).length > 0 && (
              <div className="pl-rejilla">{tarjetas(productos).map((o) => <Tarjeta key={o.slug} o={o} etq={[o.kind === 'product' ? c.kinds.product : '', o.year].filter(Boolean).join(' • ')} />)}</div>
            )}
            {filas(sinCaptura(productos))}
          </div>
        )}
        {ver('personal') && (
          <div className={`pl-bloque${plegar && resto[0].length ? ' pl-bloque--abre' : ''}`}>
            <h2 className="pl-h-m" data-pl="linea">{c.obra.propios}</h2>
            {filas(propiosVista)}
          </div>
        )}
        {plegar && nResto > 0 && (
          <Pliegue n={nResto} abierto={mas} alternar={() => setMas(!mas)} c={c}>
            {resto[0].length > 0 && <div className="pl-bloque pl-bloque--sigue">{filas(resto[0])}</div>}
            {resto[1].length > 0 && <div className="pl-bloque"><h2 className="pl-h-m">{c.obra.tiendasAntes}</h2>{filas(resto[1])}</div>}
            {resto[2].length > 0 && <div className="pl-bloque"><h2 className="pl-h-m">{c.obra.entregables}</h2>{filas(resto[2])}</div>}
          </Pliegue>
        )}
        {!plegar && ver('role') && (
          <div className="pl-bloque">
            <h2 className="pl-h-m" data-pl="linea">{c.obra.entregables}</h2>
            {filas(entregables)}
          </div>
        )}
      </section>
    </main>
  )
}
