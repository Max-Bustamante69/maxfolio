import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Obra } from '../data'
import { useCopy } from './copy'
import { aterrizar, gsap, remedirEscenas, useVista, vueloDe, zoomTarjetas } from './motion'
import { Fila, Segmentado, Tile } from './piezas'
import { usePublico } from './publico'

type Tipo = 'todo' | 'store' | 'product' | 'mas'
const TIPOS: Tipo[] = ['todo', 'store', 'product', 'mas']

/** Un grupo de la lista (tiendas, productos, proyectos): su título y lo que lleva dentro. Oculto, sigue en el DOM. */
function Grupo({ id, titulo, oculto, children }: { id: string; titulo: ReactNode; oculto: boolean; children: ReactNode }) {
  return (
    <section className="ap-grupo" aria-labelledby={id} hidden={oculto}>
      <h2 id={id} className="ap-subtitulo" data-ap="linea">{titulo}</h2>
      {children}
    </section>
  )
}

export default function Indice() {
  const c = useCopy()
  const { obras, personal, storeCount, strings: s } = usePublico()
  const [params, setParams] = useSearchParams()
  const pedido = params.get('tipo') as Tipo | null
  const tipo: Tipo = pedido && TIPOS.includes(pedido) ? pedido : 'todo'
  // Segundo scrub: la captura de cada tarjeta se asienta al entrar. Y si el visitante regresa de una ficha con «‹ Obra», su captura vuela a su tarjeta.
  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    zoomTarjetas(raiz, limpiar)
    const slug = vueloDe()
    const marco = slug ? raiz.querySelector<HTMLElement>(`.ap-grupo:not([hidden]) .ap-tile[data-slug="${slug}"] .ap-tile-marco`) : null
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

  const ver = (g: Exclude<Tipo, 'todo'>) => tipo === 'todo' || tipo === g
  const de = (kind: Obra['kind']) => obras.filter((o) => o.kind === kind)
  const tiendas = de('store')
  const productos = de('product')
  const personales = de('personal')
  const entregables = de('role')

  // Al cambiar de filtro lo que se queda vuelve a entrar escalonado.
  useLayoutEffect(() => {
    if (primera.current) { primera.current = false; return }
    remedirEscenas() // las tarjetas que vuelven a mostrarse estaban medidas a cero
    const visibles = rejilla.current?.querySelectorAll<HTMLElement>('.ap-grupo:not([hidden]) :is(.ap-tile, .ap-fila)')
    if (!visibles?.length) return
    gsap.killTweensOf(visibles)
    gsap.fromTo(visibles, { opacity: 0, y: 36, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'apple', stagger: 0.035, clearProps: 'transform,opacity' })
  }, [tipo])

  // Ritmo asimétrico dentro de cada grupo: 7·5 y 4·4·4 en ciclos de cinco; de la 7.ª en adelante, compactas en móvil.
  const tarjetas = (lista: Obra[], prioridad = 0) => (
    <div className="ap-tiles ap-tiles-indice">
      {lista.filter((o) => o.views.length).map((o, n) => (
        <Tile
          key={o.slug}
          o={o}
          className={`ap-tile-i${n % 5}${n >= 6 ? ' ap-tile-c' : ''}`}
          etq={[o.industry, o.rolLabel].filter(Boolean).join(' · ')}
          texto={o.tagline}
          ficha={c.verFicha}
          prioridad={n < prioridad}
          nivel={3}
        />
      ))}
    </div>
  )
  const filas = (lista: Obra[], titulo?: string) => {
    const sin = lista.filter((o) => !o.views.length)
    if (!sin.length) return null
    return (
      <>
        {titulo && <p className="ap-grupo-sub">{titulo}</p>}
        <ul className="ap-filas" data-ap="grupo">{sin.map((o) => <Fila key={o.slug} o={o} />)}</ul>
      </>
    )
  }

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
            opciones={TIPOS.map((t) => [t, c.obra.tipos[t]])}
            onCambio={(t) => setParams(t === 'todo' ? {} : { tipo: t }, { replace: true })}
          />
        </div>
      </section>

      <div className="ap-frame ap-indice" ref={rejilla}>
        <Grupo id="ap-g-tiendas" titulo={s.sections.shopify.tabStores} oculto={!ver('store')}>
          {tarjetas(tiendas, 6)}
          {filas(tiendas, s.sections.shopify.legacyLabel)}
        </Grupo>
        <Grupo id="ap-g-productos" titulo={s.sections.shopify.tabProducts} oculto={!ver('product')}>
          {tarjetas(productos)}
          {filas(productos)}
        </Grupo>
        <Grupo id="ap-g-mas" titulo={`${s.sections.projects.title} ${s.sections.projects.titleAccent}`} oculto={!ver('mas')}>
          <ul className="ap-filas" data-ap="grupo">{personales.map((o) => <Fila key={o.slug} o={o} />)}</ul>
          <p className="ap-grupo-sub">{c.obra.entregables}</p>
          <ul className="ap-filas" data-ap="grupo">{entregables.map((o) => <Fila key={o.slug} o={o} />)}</ul>
        </Grupo>
      </div>
    </main>
  )
}
