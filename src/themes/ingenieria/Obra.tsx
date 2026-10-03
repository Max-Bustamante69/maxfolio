import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { v5path, type Obra as ObraT } from '../data'
import { CON_CASO, casoDe } from './casos'
import { useCopy } from './copy'
import { aterrizar, gsap, useVista, vueloDe } from './motion'
import { Cabecera, Enlace, Flecha, Segmentado, Tarjeta } from './piezas'
import { usePublico } from './publico'

type Tipo = 'todo' | 'store' | 'product' | 'mas'
const TIPOS: Tipo[] = ['todo', 'store', 'product', 'mas']

/** Lo que no tiene captura se muestra como texto, nunca con una imagen inventada: nombre, una línea y su año. */
function Otro({ o, tipo }: { o: ObraT; tipo: string }) {
  return (
    <li>
      <Enlace to={v5path('ingenieria', 'obra', o.slug)} className="ing-otro">
        <span className="ing-otro-n">{o.name}</span>
        <span className="ing-otro-a">{tipo} · {o.year}</span>
        <span className="ing-otro-t">{o.tagline || o.industry}</span>
        <Flecha />
      </Enlace>
    </li>
  )
}

/** Fuera de la lista: portafolios de otras personas, el propio sitio, tiendas sin historia y los entregables de cargos (viven en Trayectoria). */
const FUERA = new Set(['new-urban', 'rimo', 'scorrea', 'dr-hugo', 'maxfolio'])

function Grupo({ id, titulo, oculto, children }: { id: string; titulo: ReactNode; oculto: boolean; children: ReactNode }) {
  return (
    <section className="ing-grupo" aria-labelledby={id} hidden={oculto}>
      <h2 id={id} className="ing-h2" data-ing="linea">{titulo}</h2>
      {children}
    </section>
  )
}

export default function Obra() {
  const c = useCopy()
  const v = usePublico()
  const { locale } = useLanguage()
  const { obras, personal, storeCount, strings: s } = v
  const [params, setParams] = useSearchParams()
  const pedido = params.get('tipo') as Tipo | null
  const tipo: Tipo = pedido && TIPOS.includes(pedido) ? pedido : 'todo'
  // Si el visitante regresa de una ficha con «‹ Obra», su captura vuela a su tarjeta.
  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    const slug = vueloDe()
    const marco = slug ? raiz.querySelector<HTMLElement>(`.ing-grupo:not([hidden]) .ing-card[data-slug="${slug}"] .ing-card-marco`) : null
    if (!slug || !marco) return
    const tarjeta = marco.parentElement!
    aterrizar(slug, marco, limpiar, {
      // Con el scroll asentado: la tarjeta se centra en la ventana y se muestra sin su revelado, para que la copia aterrice donde de verdad queda.
      colocar: () => {
        gsap.set(tarjeta, { clearProps: 'transform,opacity' })
        const r = marco.getBoundingClientRect()
        window.scrollTo({ top: window.scrollY + r.top - (window.innerHeight - r.height) / 2, behavior: 'instant' })
      },
    })
  })
  const lista = useRef<HTMLDivElement>(null)
  const primera = useRef(true)

  const ver = (g: Exclude<Tipo, 'todo'>) => tipo === 'todo' || tipo === g
  const de = (kind: ObraT['kind']) => obras.filter((o) => o.kind === kind)
  const tiendas = de('store')
  const productos = de('product')
  const historias = CON_CASO.map((slug) => tiendas.find((o) => o.slug === slug)).filter((o): o is ObraT => !!o && o.views.length > 0)
  const [principal, ...otras] = historias
  const masTiendas = tiendas.filter((o) => o.views.length > 0 && !CON_CASO.includes(o.slug))
  const otros = obras.filter((o) => !FUERA.has(o.slug) && o.kind !== 'role' && !o.views.length)

  // Al cambiar de filtro lo que se queda vuelve a entrar escalonado.
  useLayoutEffect(() => {
    if (primera.current) { primera.current = false; return }
    const visibles = lista.current?.querySelectorAll<HTMLElement>('.ing-grupo:not([hidden]) :is(.ing-card, .ing-otros > li)')
    if (!visibles?.length) return
    gsap.killTweensOf(visibles)
    gsap.fromTo(visibles, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.03, clearProps: 'transform,opacity' })
  }, [tipo])

  const card = (o: ObraT, extra: { grande?: boolean; prioridad?: boolean } = {}) => {
    const caso = casoDe(v, o, locale)
    return <Tarjeta key={o.slug} o={o} resumen={caso?.resumen} {...extra} />
  }

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ing-vista">
      <title>{`${c.obra.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />
      <section className="ing-cabeza">
        <div className="ing-marco ing-cabeza-in">
          <Cabecera id="ing-h1" nivel={1} anim="titular" etq={c.tiendasConstruidas(storeCount)} titulo={`${c.obra.h1}.`} acento={c.obra.acento} />
          <div data-ing="subir" data-ing-retraso="0.2">
            <Segmentado clase="ing-seg-filtro" etiqueta={c.obra.filtrar} valor={tipo} opciones={TIPOS.map((t) => [t, c.obra.tipos[t]])} onCambio={(t) => setParams(t === 'todo' ? {} : { tipo: t }, { replace: true })} />
          </div>
        </div>
      </section>

      <div className="ing-marco ing-lista" ref={lista}>
        <Grupo id="ing-g-tiendas" titulo={s.sections.shopify.tabStores} oculto={!ver('store')}>
          <p className="ing-etq ing-grupo-sub">{c.obra.historias}</p>
          <div className="ing-cards ing-cards-hist" data-ing="grupo">
            {principal && card(principal, { grande: true, prioridad: true })}
            {otras.map((o) => card(o))}
          </div>
          {masTiendas.length > 0 && (
            <>
              <p className="ing-etq ing-grupo-sub">{c.obra.masTiendas}</p>
              <div className="ing-cards ing-cards-mas" data-ing="grupo">{masTiendas.map((o) => <Tarjeta key={o.slug} o={o} compacta />)}</div>
            </>
          )}
        </Grupo>
        <Grupo id="ing-g-productos" titulo={s.sections.shopify.tabProducts} oculto={!ver('product')}>
          <div className="ing-cards ing-cards-prod" data-ing="grupo">{productos.filter((o) => o.views.length).map((o) => card(o))}</div>
        </Grupo>
        <Grupo id="ing-g-mas" titulo={c.obra.proyectos} oculto={!ver('mas')}>
          <ul className="ing-otros" data-ing="grupo">{otros.map((o) => <Otro key={o.slug} o={o} tipo={c.kinds[o.kind]} />)}</ul>
        </Grupo>
      </div>
    </main>
  )
}
