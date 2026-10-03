import { useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Obra as TObra, ObraKind } from '../data'
import { useCopy } from './copy'
import { figurasDe, GRANDES, tieneHistoria, usePublico } from './limpio'
import { gsap, useVista } from './motion'
import { EnlaceObra, Tarjeta } from './piezas'

const FILTROS = [
  ['todo', null],
  ['tiendas', 'store'],
  ['productos', 'product'],
  ['proyectos', 'personal'],
] as const satisfies ReadonlyArray<readonly [string, ObraKind | null]>
type Filtro = (typeof FILTROS)[number][0]

/** Una obra sin captura pública pero con algo que contar (catálogo, hechos o historia): una fila de registro que abre su ficha. */
function Fila({ o }: { o: TObra }) {
  const c = useCopy()
  const { locale } = usePublico()
  const esc = figurasDe(o, c.escala, locale, undefined, 2).filter((f) => f.corta)
  return (
    <li className="tk-fila" data-tk="sube" data-tk-y="14">
      <EnlaceObra o={o} className="tk-fila-a">
        <span className="tk-fila-y">{o.year}</span>
        <span className="tk-fila-n">{o.name}</span>
        <span className="tk-fila-l">{o.tagline}</span>
        <span className="tk-fila-p">{esc.length ? esc.map((f) => <span key={f.etiqueta}><b>{f.valor}</b> {f.corta}</span>) : o.stack.slice(0, 3).join(' · ')}</span>
      </EnlaceObra>
    </li>
  )
}

export default function Obra() {
  const c = useCopy()
  const { obras, personal, locale } = usePublico()
  const [params, setParams] = useSearchParams()
  const zona = useRef<HTMLDivElement>(null)
  const pedido = params.get('f') as Filtro | null
  const filtro: Filtro = FILTROS.some(([f]) => f === pedido) ? (pedido as Filtro) : 'todo'
  const kind = FILTROS.find(([f]) => f === filtro)![1]
  const visibles = obras.filter((o) => !kind || o.kind === kind)
  const conCaptura = visibles.filter((o) => o.views.length)
  const sinCaptura = visibles.filter((o) => !o.views.length)
  const filas = sinCaptura.filter(tieneHistoria)
  const tempranas = sinCaptura.filter((o) => !tieneHistoria(o))
  // Las dos salas grandes del inicio van primero y grandes (solo donde hay tiendas); el resto sigue en el orden del registro.
  const destacadas = GRANDES.map((s) => conCaptura.find((o) => o.slug === s)).filter((o): o is TObra => !!o)
  const resto = conCaptura.filter((o) => !destacadas.includes(o))
  const ref = useVista<HTMLElement>([locale])
  const usadas = new Set<string>()
  const figDest = destacadas.map((o) => figurasDe(o, c.escala, locale, usadas, 2))
  const figResto = resto.map((o) => figurasDe(o, c.escala, locale, undefined, 2))

  // La lista baja a opacidad 0 en 400 ms y vuelve en 1 200 ms (tokujin).
  const elegir = (f: Filtro) => {
    if (f === filtro) return
    const poner = () => {
      setParams(f === 'todo' ? {} : { f }, { replace: true })
      gsap.fromTo(zona.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'tk-expo', clearProps: 'opacity' })
    }
    if (zona.current) gsap.to(zona.current, { opacity: 0, duration: 0.4, ease: 'none', onComplete: poner })
    else poner()
  }

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="tk-vista">
      <title>{`${c.obra.titulo} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <header className="tk-cabecera-pagina tk-fr tk-12">
        <h1 className="tk-h1" data-tk="titulo">{c.obra.titulo}</h1>
        <p className="tk-lead" data-tk="sube" data-tk-r="0.1">{c.obra.lead}</p>
        <nav className="tk-filtros" aria-label={c.obra.filtrar} data-tk="sube" data-tk-y="12" data-tk-r="0.2">
          {FILTROS.map(([f]) => (
            <button key={f} type="button" aria-pressed={f === filtro} onClick={() => elegir(f)}>
              {c.obra.filtros[f]}
            </button>
          ))}
        </nav>
      </header>

      <div ref={zona} className="tk-zona">
        {destacadas.length > 0 && (
          <section className="tk-fr" key={`d-${filtro}`} aria-labelledby="tk-dest-t">
            <h2 id="tk-dest-t" className="tk-rotulo tk-sec-t" data-tk="sube" data-tk-y="10">{c.obra.destacadas}</h2>
            <ul className="tk-rejilla tk-rejilla-g">
              {destacadas.map((o, i) => <Tarjeta key={o.slug} o={o} prioridad={i < 2} grande figuras={figDest[i]} />)}
            </ul>
          </section>
        )}
        {resto.length > 0 && (
          <section className="tk-fr tk-resto" key={`r-${filtro}`} aria-labelledby="tk-resto-t">
            <h2 id="tk-resto-t" className={destacadas.length ? 'tk-rotulo tk-sec-t' : 'tk-sr'} data-tk={destacadas.length ? 'sube' : undefined} data-tk-y="10">{c.obra.resto}</h2>
            <ul className="tk-rejilla">
              {resto.map((o, i) => <Tarjeta key={o.slug} o={o} prioridad={!destacadas.length && i < 3} figuras={figResto[i]} />)}
            </ul>
          </section>
        )}
        {filas.length > 0 && (
          <section className="tk-mas tk-fr" aria-labelledby="tk-mas-t" key={`m-${filtro}`}>
            <div className="tk-12 tk-mas-cab">
              <h2 id="tk-mas-t" className="tk-h2" data-tk="titulo">{c.obra.mas}</h2>
              <p className="tk-nota" data-tk="sube" data-tk-y="12" data-tk-r="0.1">{c.obra.masLead}</p>
            </div>
            <ul className="tk-filas">{filas.map((o) => <Fila key={o.slug} o={o} />)}</ul>
          </section>
        )}
        {tempranas.length > 0 && (
          <p className="tk-fr tk-tempranas tk-nota" key={`t-${filtro}`}>
            {c.obra.tempranas}: {tempranas.map((o) => `${o.name} (${o.year})`).join(' · ')}.
          </p>
        )}
        {visibles.length === 0 && <p className="tk-fr tk-nota">{c.obra.vacio}</p>}
      </div>
    </main>
  )
}
