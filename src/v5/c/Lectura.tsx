import { useLayoutEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { v5path, type Obra } from '../data'
import { agrupar, capturasDe, lodSrc, numerosDe, stackPublico, type Por } from './datos'
import { precargar, prepararVuelo, reubicarFilas } from './movimiento'
import { Lupa } from './Lupa'
import { Tira } from './Tira'
import { useAncho, useC } from './useC'

/** Obras con captura, su Nº y los grupos de una disposición: lo comparten la Lectura, la cinta por año y la Mesa. */
export function useHoja(por: Por, ascendente = false) {
  const { obras, t, strings, intlLocale } = useC()
  return useMemo(() => {
    const nr = numerosDe(obras)
    const conCaptura = obras.filter((o) => o.views.length > 0)
    const grupos = agrupar(conCaptura, por, { producto: t.producto, tec: strings.sections.shopify.filters, collator: new Intl.Collator(intlLocale), ascendente }, nr)
    const diapositivas = conCaptura.reduce((s, o) => s + capturasDe(o).length, 0)
    return { nr, conCaptura, grupos, diapositivas }
  }, [obras, por, t.producto, strings.sections.shopify.filters, intlLocale, ascendente])
}

/** Pone en marcha el vuelo de la captura hacia la ficha y calienta lo que ella va a mostrar primero. */
export const usarVuelo = (obra: Obra) => ({
  onClick: () => prepararVuelo(obra.slug),
  onPointerEnter: () => precargar(capturasDe(obra).map((c) => lodSrc(1, obra.slug, c))),
  onFocus: () => precargar(capturasDe(obra).map((c) => lodSrc(1, obra.slug, c))),
})

/** La Lectura: la hoja de contactos como lista semántica (un grupo = una sección, una obra = una fila con su tira). */
export function Lectura({ por }: { por: Por }) {
  const { nr, grupos } = useHoja(por)
  const { t } = useC()
  const raiz = useRef<HTMLDivElement>(null)
  // Cambió la disposición: las filas cruzan la hoja desde donde estaban hasta su grupo nuevo.
  useLayoutEffect(() => {
    if (raiz.current) reubicarFilas(raiz.current)
  }, [por])
  const vistas = new Map<string, number>()
  let orden = 0
  return (
    <div className="c-lectura" ref={raiz}>
      {grupos.map((g) => (
        <section key={g.id} id={g.id} className="c-grupo" aria-labelledby={`h-${g.id}`}>
          <h2 id={`h-${g.id}`} className="c-grupo__h c-mono">
            {g.titulo} <span className="c-grupo__n">· {t.inicio.cuenta(g.items.length, g.items.every((o) => o.kind === 'store'))}</span>
          </h2>
          <ol className="c-filas">
            {g.items.map((o) => {
              const n = vistas.get(o.slug) ?? 0
              vistas.set(o.slug, n + 1)
              return <Fila key={o.slug} obra={o} nr={nr.get(o.slug) ?? ''} prioridad={orden++ < 3} flip={n === 0 ? `fila:${o.slug}` : `fila:${o.slug}:${n}`} />
            })}
          </ol>
        </section>
      ))}
      <Lupa raiz={raiz} />
    </div>
  )
}

function Fila({ obra, nr, prioridad, flip }: { obra: Obra; nr: string; prioridad: boolean; flip: string }) {
  const { t } = useC()
  const ancho = useAncho()
  return (
    <li className="c-fila" data-flip-id={flip}>
      <div className="c-fila__txt">
        <p className="c-mono c-fila__nr">{t.ficha.numero(nr)}</p>
        <h3 className="c-fila__nombre">
          <Link to={v5path('c', 'obra', obra.slug)} className="c-fila__enlace" {...usarVuelo(obra)}>
            {obra.name}
          </Link>
        </h3>
        {obra.industry && <p className="c-fila__rubro">{obra.industry}</p>}
        <p className="c-meta">{[obra.year, obra.rolLabel].filter(Boolean).join(' · ')}</p>
        {ancho && stackPublico(obra).length > 0 && (
          <ul className="c-tags" aria-label={t.ficha.pila}>
            {stackPublico(obra).slice(0, 3).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </div>
      <Tira obra={obra} nr={nr} prioridad={prioridad} />
    </li>
  )
}

