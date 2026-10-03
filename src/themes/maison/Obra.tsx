import { v5path, type Obra as ObraT } from '../data'
import { COLECCIONES } from './colecciones'
import { useCopy } from './copy'
import { useVista } from './motion'
import { Enlace, ID, Pieza, Tri } from './piezas'
import { usePublico } from './publico'

/** Una línea del índice de «Más trabajo»: año, nombre y una frase. Sin pila, sin repetir el eslogan en la descripción. */
function Linea({ o }: { o: ObraT }) {
  return (
    <li className="mz-linea">
      <i className="mz-filete" aria-hidden="true" />
      <Enlace to={v5path(ID, 'obra', o.slug)} className="mz-linea-a">
        <span className="mz-linea-anio">{o.year}</span>
        <span className="mz-linea-h">{o.name}</span>
        <span className="mz-linea-f">{o.tagline}</span>
        <Tri />
      </Enlace>
    </li>
  )
}

export default function Obra() {
  const c = useCopy()
  const { obras, obra, personal, storeCount } = usePublico()
  const sueltas = obras.filter((o) => o.kind === 'store' && o.views.length && !COLECCIONES.some((col) => col.slugs.includes(o.slug)))
  const colecciones = COLECCIONES.map((col) => ({
    ...col,
    piezas: [...col.slugs.map(obra), ...(col.id === 'otros' ? sueltas : [])].filter((o): o is ObraT => !!o?.views.length),
  })).filter((col) => col.piezas.length)
  // Más trabajo: los productos y los proyectos propios y, de las tiendas sin capturas públicas, la que cuenta algo propio (Joystaz).
  // Las otras tres (sin más que «tienda de 2023») quedan en una línea al final: nada de filas sin información.
  const sinCaptura = obras.filter((o) => o.kind === 'store' && !o.views.length)
  const mas = [...obras.filter((o) => o.kind === 'product'), ...sinCaptura.filter((o) => o.slug === 'joystaz'), ...obras.filter((o) => o.kind === 'personal')]
  const anteriores = sinCaptura.filter((o) => o.slug !== 'joystaz')
  const secciones: Array<[string, string]> = [['tiendas', c.obra.tiendas], ['mas', c.obra.mas]]

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    // Un enlace con ancla (#coleccion-cafe desde el índice del inicio) llega ya colocado en su colección.
    const ancla = window.location.hash.slice(1)
    if (ancla) {
      const t = window.setTimeout(() => document.getElementById(ancla)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 60)
      limpiar.push(() => window.clearTimeout(t))
    }
    // La barra de secciones marca la que estás leyendo.
    const enlaces = new Map(Array.from(raiz.querySelectorAll<HTMLAnchorElement>('.mz-barra a')).map((a) => [a.hash.slice(1), a]))
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return
        enlaces.forEach((a, id) => (id === en.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')))
      })
    }, { rootMargin: '-35% 0px -60% 0px' })
    raiz.querySelectorAll('[data-seccion]').forEach((el) => io.observe(el))
    limpiar.push(() => io.disconnect())
  })

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="mz-vista">
      <title>{`${c.obra.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="mz-marco mz-cab-pag" aria-labelledby="mz-h1">
        <p className="mz-etq" data-mz="subir">{c.tiendasConstruidas(storeCount)}</p>
        <h1 id="mz-h1" className="mz-titulo" data-mz="linea">{c.obra.h1}</h1>
        <p className="mz-nota mz-cab-pag-lead" data-mz="subir" data-mz-retraso="0.2">{c.obra.lead}</p>
      </section>

      <nav className="mz-barra" aria-label={c.obra.secciones}>
        <div className="mz-marco mz-barra-in">
          <p className="mz-barra-tit">{c.obra.h1}</p>
          <ul>{secciones.map(([id, texto]) => <li key={id}><a href={`#${id}`}><Tri />{texto}</a></li>)}</ul>
        </div>
      </nav>

      <div id="tiendas" data-seccion className="mz-seccion">
        {colecciones.map((col, i) => (
          <section key={col.id} id={`coleccion-${col.id}`} className="mz-marco mz-coleccion" aria-labelledby={`col-${col.id}`}>
            <div className="mz-coleccion-cab">
              <i className="mz-filete" data-mz="trazo" aria-hidden="true" />
              <p className="mz-etq">{c.obra.coleccion} {String(i + 1).padStart(2, '0')}</p>
              <h2 id={`col-${col.id}`} className="mz-titulo-sec" data-mz="linea">{c.obra.colecciones[col.id]}</h2>
              <p className="mz-etq mz-apagado mz-coleccion-n">{c.obra.cuenta(col.piezas.length)}</p>
            </div>
            {/* El rack de Loewe: doce columnas con un canal de 2 px; la primera pieza ocupa el doble que las demás. */}
            <div className="mz-coleccion-rack" data-n={Math.min(col.piezas.length, 4)}>
              {col.piezas.map((o, k) => <Pieza key={o.slug} o={o} texto={o.tagline} clase={k === 0 || col.piezas.length === 2 ? 'mz-pieza-grande' : ''} />)}
            </div>
          </section>
        ))}
      </div>

      <section id="mas" data-seccion className="mz-marco mz-seccion mz-masobra" aria-labelledby="mz-mas-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{c.obra.masNota}</p>
          <h2 id="mz-mas-t" className="mz-titulo-sec" data-mz="linea">{c.obra.mas}</h2>
        </div>
        <ul className="mz-lineas">{mas.map((o) => <Linea key={o.slug} o={o} />)}</ul>
        {anteriores.length > 0 && (
          <p className="mz-nota-pie mz-anteriores">
            <span className="mz-etq">{c.obra.anterior}</span>{' '}
            {anteriores.map((o, i) => <span key={o.slug}>{i > 0 && ' · '}<Enlace to={v5path(ID, 'obra', o.slug)}>{o.name} ({o.year})</Enlace></span>)}
          </p>
        )}
      </section>
    </main>
  )
}
