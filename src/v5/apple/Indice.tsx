import { useLayoutEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { v5path, useV5, type Obra } from '../data'
import { useCopy } from './copy'
import { aterrizar, gsap, remedirEscenas, useVista, vueloDe, zoomTarjetas } from './motion'
import { Chevron, Enlace, Segmentado, Tile } from './piezas'

type Tipo = 'todo' | 'store' | 'product' | 'mas'
const TIPOS: Tipo[] = ['todo', 'store', 'product', 'mas']
const grupoDe = (o: Obra): Tipo => (o.kind === 'store' ? 'store' : o.kind === 'product' ? 'product' : 'mas')

/** Obra sin captura: una fila de texto. Nunca una imagen inventada. */
function Fila({ o }: { o: Obra }) {
  const c = useCopy()
  return (
    <li>
      <Enlace to={v5path('apple', 'obra', o.slug)} className="ap-fila">
        <span className="ap-fila-n">{o.name}</span>
        <span className="ap-fila-d">{o.kind === 'personal' ? c.kinds.personal : (o.industry ?? o.tagline)}</span>
        <span className="ap-fila-a">{o.year}</span>
        <Chevron />
      </Enlace>
    </li>
  )
}

export default function Indice() {
  const c = useCopy()
  const { obras, personal, storeCount } = useV5()
  const [params, setParams] = useSearchParams()
  const pedido = params.get('tipo') as Tipo | null
  const tipo: Tipo = pedido && TIPOS.includes(pedido) ? pedido : 'todo'
  // Segundo scrub: la captura de cada tarjeta se asienta al entrar. Y si el visitante regresa de una ficha con «‹ Obra», su captura vuela a su tarjeta.
  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    zoomTarjetas(raiz, limpiar)
    const slug = vueloDe()
    const marco = slug ? raiz.querySelector<HTMLElement>(`.ap-tile[data-slug="${slug}"]:not([hidden]) .ap-tile-marco`) : null
    if (!slug || !marco) return
    const tarjeta = marco.parentElement!
    aterrizar(slug, marco, limpiar, {
      // Con el scroll ya asentado: la tarjeta se centra en la ventana y se muestra sin su revelado, para que la copia aterrice donde de verdad queda.
      colocar: () => {
        gsap.set(tarjeta, { clearProps: 'transform,opacity' })
        const r = marco.getBoundingClientRect()
        window.scrollTo({ top: window.scrollY + r.top - (window.innerHeight - r.height) / 2, behavior: 'instant' })
      },
    })
  })
  const rejilla = useRef<HTMLDivElement>(null)
  const primera = useRef(true)

  const entra = (o: Obra) => tipo === 'todo' || grupoDe(o) === tipo
  const conCaptura = obras.filter((o) => o.views.length)
  const sinCaptura = obras.filter((o) => !o.views.length)
  // Ritmo asimétrico entre las tarjetas VISIBLES (nth-child no sirve: las filtradas siguen en el DOM, ocultas): 7·5 y 4·4·4 en ciclos de cinco, y de la 7.ª en adelante, compactas en móvil.
  const lugar = new Map(conCaptura.filter(entra).map((o, i) => [o.slug, i]))

  // Al cambiar de filtro las obras que se quedan vuelven a entrar escalonadas (las que ya estaban a la vista no se esconden antes).
  useLayoutEffect(() => {
    if (primera.current) { primera.current = false; return }
    remedirEscenas() // las tarjetas que vuelven a mostrarse estaban medidas a cero
    const visibles = rejilla.current?.querySelectorAll<HTMLElement>('.ap-tile:not([hidden]), .ap-fila')
    if (!visibles?.length) return
    gsap.killTweensOf(visibles)
    gsap.fromTo(visibles, { opacity: 0, y: 36, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'apple', stagger: 0.035, clearProps: 'transform,opacity' })
  }, [tipo])

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ap-vista">
      <title>{`${c.obra.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />
      <section className="ap-cabeza ap-frame">
        <div>
          <p className="ap-eyebrow" data-ap="subir">{c.tiendasConstruidas(storeCount)}</p>
          <h1 className="ap-titulo" data-ap="nombre">{c.obra.h1}</h1>
        </div>
        <div data-ap="subir" data-ap-retraso="0.15">
          <Segmentado
            etiqueta={c.obra.filtrar}
            valor={tipo}
            opciones={TIPOS.map((t) => [t, c.obra.tipos[t === 'mas' ? 'mas' : t]])}
            onCambio={(t) => setParams(t === 'todo' ? {} : { tipo: t }, { replace: true })}
          />
        </div>
      </section>

      <div className="ap-frame ap-indice" ref={rejilla}>
        <div className="ap-tiles ap-tiles-indice">
          {conCaptura.map((o, i) => {
            const n = lugar.get(o.slug) ?? 0
            return <Tile key={o.slug} o={o} className={`ap-tile-i${n % 5}${n >= 6 ? ' ap-tile-c' : ''}`} rubro={o.industry ?? o.tagline} ficha={c.verFicha} hidden={!entra(o)} prioridad={i < 6} nivel={2} />
          })}
        </div>
        {sinCaptura.some(entra) && (
          <>
            <h2 className="ap-subtitulo" data-ap="linea">{c.obra.masTitulo}</h2>
            <ul className="ap-filas" data-ap="grupo">
              {sinCaptura.filter(entra).map((o) => <Fila key={o.slug} o={o} />)}
            </ul>
          </>
        )}
        {!conCaptura.some(entra) && !sinCaptura.some(entra) && <p className="ap-tenue">{c.obra.vacio}</p>}
      </div>
    </main>
  )
}
