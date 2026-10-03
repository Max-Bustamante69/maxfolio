import { useRef, type MouseEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v5path } from '../data'
import { PalabrasContacto } from './Contacto'
import { useCopy } from './copy'
import { useLibro, type ObraLibro } from './datos'
import { Capturas, Datos, Texto } from './Hoja'
import { gsap, guardarCompartido, useEntrada } from './movimiento'
import { Cabeza, Flecha, Linea } from './piezas'
import { leerVolver } from './sitio'
import { Enlace } from './transicion'

/** Ficha `/obra/:slug`. Se monta por slug (key) para que cada obra tenga su propia entrada. */
export default function FichaPagina() {
  const { slug = '' } = useParams()
  return <Ficha key={slug} slug={slug} />
}

function Vecino({ o, rotulo }: { o?: ObraLibro; rotulo: string }) {
  if (!o) return <span className="a-vecino a-vecino-vacio" aria-hidden="true" />
  return (
    <Enlace className="a-vecino" to={v5path('a', 'obra', o.slug)}>
      <span className="a-sec">{rotulo}{o.n ? ` · Nº ${o.n}` : ''}</span>
      <span className="a-vecino-nombre">{o.name}</span>
      <Flecha tipo="derecha" />
    </Enlace>
  )
}

/** «← Libro»: si la ficha se abrió desde una vista del libro, vuelve a ELLA (con sus filtros, su posición y sus filas abiertas) y el
 *  nombre y la banda de tinta vuelan de regreso a su fila, el mismo gesto de la ida; si no, va al índice por la cortina. */
function VolverAlLibro({ slug }: { slug: string }) {
  const c = useCopy()
  const navigate = useNavigate()
  const volver = leerVolver()
  const destino = volver?.slug === slug ? volver.url : null
  const alTocar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!destino || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const main = document.getElementById('contenido')
    if (main) guardarCompartido(main, destino.split('?')[0])
    gsap.to('#contenido [data-a="entra"]', { opacity: 0, duration: 0.11, ease: 'none', onComplete: () => navigate(destino, { state: { sitio: true } }) })
  }
  return <Enlace to={destino ?? v5path('a', 'obra')} onClick={alTocar}><Flecha tipo="atras" />{c.ficha.libro}</Enlace>
}

function Ficha({ slug }: { slug: string }) {
  const c = useCopy()
  const L = useLibro()
  const o = L.libro(slug)
  const raiz = useRef<HTMLElement>(null)
  useEntrada(raiz)
  const { personal } = L
  if (!o) {
    return (
      <main id="contenido" tabIndex={-1} ref={raiz}>
        <Cabeza titulo={`${c.ficha.noExiste} · ${personal.name}`} />
        <div className="a-pag a-vista-cab">
          <h1 className="a-h1"><Linea>{c.ficha.noExiste}</Linea></h1>
          <p className="a-lead" data-a="entra"><Enlace className="a-enlace" to={v5path('a', 'obra')}><Flecha tipo="atras" />{c.ficha.volver}</Enlace></p>
        </div>
      </main>
    )
  }
  const { anterior, siguiente } = L.vecinos(o)
  return (
    <main id="contenido" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${o.name} · ${personal.name}`} />
      <header className="a-ficha-cab">
        <span className="a-tinta" data-a="tinta" data-flip-id="a-tinta" aria-hidden="true" />
        <div className="a-pag">
          <p className="a-ficha-ruta a-sec" data-a="entra">
            <VolverAlLibro slug={slug} />
            <span>{o.n ? `${c.ficha.no(o.n)} · ` : ''}{c.tipos[o.kind]}</span>
          </p>
          <h1 className="a-ficha-nombre"><Linea flipId="a-nombre">{o.name}</Linea></h1>
        </div>
      </header>
      <div className="a-pag a-ficha-cuerpo">
        <div className="a-ficha-izq">
          <div data-a="entra"><Capturas o={o} /></div>
          <div data-a="entra"><Texto o={o} /></div>
        </div>
        <div className="a-ficha-der" data-a="entra">
          <Datos o={o} />
          {o.link && (
            <p className="a-enlaces">
              <a className="a-boton" href={o.link} target="_blank" rel="noopener noreferrer">
                {o.kind === 'store' ? c.panel.verTienda : c.panel.verSitio}<Flecha tipo="externa" />
              </a>
            </p>
          )}
        </div>
      </div>
      <nav className="a-vecinos" aria-label={c.ficha.vecinos} data-a="entra">
        <div className="a-pag">
          <Vecino o={anterior} rotulo={c.ficha.anterior} />
          <Vecino o={siguiente} rotulo={c.ficha.siguiente} />
        </div>
      </nav>
      <div className="a-pag">
        <Enlace className="a-cierre" to={`${v5path('a', 'contacto')}?motivo=revision`} data-a="entra">
          <span className="a-cierre-txt">{c.ficha.cierre}</span>
          <Flecha tipo="derecha" />
        </Enlace>
        <PalabrasContacto />
      </div>
    </main>
  )
}
