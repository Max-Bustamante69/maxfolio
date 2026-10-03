import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { v5path } from '../data'
import { useCopy } from './copy'
import { useFiltros, useLibro, type Orden } from './datos'
import { Libro } from './Libro'
import { CORTE, fotoDelFlujo, gsap, reflujo, useEntrada } from './movimiento'
import { Cabeza, Linea } from './piezas'

const TIPOS = ['store', 'product', 'role', 'personal'] as const
const TEC = ['bundles', 'quiz', 'subscriptions', 'reviews', 'migration', 'islands', 'tracking', 'i18n'] as const

function useMedia(consulta: string) {
  const [si, setSi] = useState(() => matchMedia(consulta).matches)
  useEffect(() => {
    const m = matchMedia(consulta)
    const al = () => setSi(m.matches)
    m.addEventListener('change', al)
    return () => m.removeEventListener('change', al)
  }, [consulta])
  return si
}

/** Índice de obra: el mismo libro con filtros (tipo, año, rol, tecnología) y orden en la URL. Móvil: los filtros viven en una hoja.
 *  En escritorio el título es la primera etiqueta de la franja de estado (como la maqueta de firma: filtros y primera fila arriba);
 *  en móvil sigue siendo el titular grande. Es el mismo <h1> único en los dos casos. */
export default function Indice() {
  const c = useCopy()
  const L = useLibro()
  const { personal, strings } = L
  const { pathname, search } = useLocation()
  const raiz = useRef<HTMLElement>(null)
  const barra = useRef<HTMLDivElement>(null)
  const hoja = useRef<HTMLDialogElement>(null)
  useEntrada(raiz)
  const f = useFiltros(L.obras)
  const movil = useMedia('(max-width: 767px)')
  const escritorio = useMedia('(min-width: 1024px)')
  const [qs, setQs] = useSearchParams()

  // Cada cambio de filtro reacomoda el libro: lo que se queda se desliza, lo nuevo se imprime (Flip, solo transform).
  const mover = (cambio: () => void) => { const foto = fotoDelFlujo(); cambio(); reflujo(foto) }

  // Los títulos de año se pegan justo debajo de la barra de filtros, sea cual sea su alto.
  useLayoutEffect(() => {
    const el = barra.current
    const poner = () => raiz.current?.style.setProperty('--a-at', `${56 + (el && getComputedStyle(el).position === 'sticky' ? el.offsetHeight : 0)}px`)
    poner()
    if (!el) return
    const ro = new ResizeObserver(poner)
    ro.observe(el)
    return () => ro.disconnect()
  }, [movil])

  const abrirHoja = () => {
    const d = hoja.current
    if (!d || d.open) return
    d.showModal()
    gsap.fromTo(d, { yPercent: 100 }, { yPercent: 0, duration: 0.32, ease: CORTE, clearProps: 'transform' })
  }
  const cerrarHoja = () => {
    const d = hoja.current
    if (!d?.open) return
    gsap.to(d, { yPercent: 100, duration: 0.16, ease: 'none', onComplete: () => { d.close(); gsap.set(d, { clearProps: 'transform' }) } })
  }
  useEffect(() => {
    // La hoja siempre está montada; el cierre del sistema (Esc) lo maneja el <dialog>.
    addEventListener('a-filtrar', abrirHoja)
    return () => removeEventListener('a-filtrar', abrirHoja)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // «Filtrar» de la barra inferior, desde otra vista, llega con ?filtrar=1: la hoja se abre sola y el parámetro se va de la URL.
    if (!qs.has('filtrar')) return
    setQs((p) => { const n = new URLSearchParams(p); n.delete('filtrar'); return n }, { replace: true })
    if (movil) abrirHoja()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const anios = [...new Set(L.obras.map((o) => o.year))].sort()
  const roles = (['built', 'maintained', 'migrated'] as const).filter((r) => L.obras.some((o) => o.role === r))
  const grupo = (k: 'tipo' | 'anio' | 'rol' | 'tec', titulo: string, opciones: [string, string][]) => (
    <div className="a-grupo" role="group" aria-label={titulo} key={k}>
      <span className="a-sec">{titulo}</span>
      {opciones.map(([valor, texto]) => {
        const activo = f.valor[k] === valor
        return (
          <button key={valor} type="button" className="a-chip" aria-pressed={activo} onClick={() => mover(() => f.fijar(k, valor))}>
            {texto}
            {activo && <svg className="a-x" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 2l8 8M10 2l-8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg>}
          </button>
        )
      })}
    </div>
  )
  const grupos: ReactNode[] = [
    grupo('tipo', c.indice.tipo, TIPOS.filter((k) => L.obras.some((o) => o.kind === k)).map((k) => [k, c.tipos[k]])),
    grupo('anio', c.indice.anio, anios.map((y) => [String(y), String(y)])),
    grupo('rol', c.indice.rol, roles.map((r) => [r, strings.badges.roles[r]])),
    grupo('tec', c.indice.tec, TEC.filter((t) => L.obras.some((o) => o.tec.includes(t))).map((t) => [t, c.tec[t]])),
  ]
  const orden = (o: Orden, texto: string) => (
    <button type="button" className="a-orden" aria-pressed={f.orden === o} onClick={() => mover(() => f.ordenar(o))}>{texto}</button>
  )

  const titulo = <h1 className="a-h1"><Linea>{c.indice.h1}</Linea></h1>
  return (
    <main id="contenido" tabIndex={-1} ref={raiz} className="a-indice">
      <Cabeza titulo={`${c.indice.h1} · ${personal.name}`} />
      {!escritorio && <div className="a-pag">{titulo}</div>}
      <div className="a-filtros" ref={barra} data-a="entra">
        <div className="a-pag">
          {!movil && <div className="a-filtros-grupos">{grupos}</div>}
          <div className="a-cont">
            {escritorio && titulo}
            <p className="a-sec" role="status" aria-live="polite">
              {f.activos > 0 && (
                <>
                  {c.indice.mostrando(f.resultado.length)} · {c.indice.filtros(f.activos)} ·{' '}
                  <button type="button" className="a-enlace" onClick={() => mover(f.limpiar)}>{c.indice.limpiar}</button>
                </>
              )}
            </p>
            <p className="a-sec a-ordenes">{c.indice.orden} · {orden('anio', c.indice.ordenAnio)} · {orden('nombre', c.indice.ordenNombre)}</p>
            {f.activos > 0 && <p className="a-url a-sec" aria-hidden="true">{pathname.replace(v5path('a'), '')}{search}</p>}
          </div>
        </div>
      </div>
      <div className="a-pag">
        <Libro obras={f.resultado} agrupar={f.orden === 'anio'} />
      </div>
      <dialog ref={hoja} className="a-hoja-filtros" aria-labelledby="a-h-filtros" onClick={(e) => e.target === e.currentTarget && cerrarHoja()} onCancel={(e) => { e.preventDefault(); cerrarHoja() }}>
        <div className="a-hoja-cab">
          <h2 id="a-h-filtros" className="a-sec">{c.indice.filtrar}</h2>
          <button type="button" className="a-enlace" onClick={cerrarHoja}>{c.panel.cerrar}</button>
        </div>
        {movil && grupos}
        <button type="button" className="a-boton" onClick={cerrarHoja}>{c.indice.ver(f.resultado.length)}</button>
      </dialog>
    </main>
  )
}
