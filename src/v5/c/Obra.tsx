import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SHOT_DATE, v5path, type Obra } from '../data'
import { numerosDe, stackPublico, TEC_IDS, tecnologiasDe } from './datos'
import { Linea } from './Linea'
import { usarVuelo } from './Lectura'
import { Registros } from './Reglas'
import { Tira } from './Tira'
import { useAncho, useC } from './useC'

type Filtro = 'tipo' | 'anio' | 'rol' | 'tec'
const FILTROS: Filtro[] = ['tipo', 'anio', 'rol', 'tec']

/** Índice de obra: el calco con el título y los filtros (su estado va en la URL: ?tipo&anio&rol&tec) y, debajo, las filas sobre la mesa, como en la Lectura.
 *  Por debajo de 900 px los filtros se pliegan en un «Filtrar (N)» para que la primera obra quede sobre el pliegue. */
export default function ObraIndice() {
  const { t, obras, strings, personal } = useC()
  const ancho = useAncho()
  const [sp, setSp] = useSearchParams()
  const lista = useMemo(() => [...obras].sort((a, b) => b.year - a.year), [obras]) // estable: dentro de un año, el orden del registro
  const nr = useMemo(() => numerosDe(obras), [obras])
  const activo: Record<Filtro, string | null> = { tipo: sp.get('tipo'), anio: sp.get('anio'), rol: sp.get('rol'), tec: sp.get('tec') }
  const nActivos = FILTROS.filter((f) => activo[f]).length
  const hay = nActivos > 0
  const [abierto, setAbierto] = useState(hay) // móvil: el panel arranca abierto solo si la URL ya trae un filtro

  const opciones: Record<Filtro, { valor: string; etiqueta: string; n: number }[]> = useMemo(() => {
    const cuenta = (test: (o: Obra) => boolean) => lista.filter(test).length
    const tipos = (['store', 'product', 'personal', 'role'] as const).map((k) => ({ valor: k, etiqueta: t.tipos[k], n: cuenta((o) => o.kind === k) }))
    const anios = [...new Set(lista.map((o) => o.year))].sort((a, b) => b - a).map((y) => ({ valor: String(y), etiqueta: String(y), n: cuenta((o) => o.year === y) }))
    const roles = (['built', 'migrated'] as const).map((r) => ({ valor: r, etiqueta: strings.badges.roles[r], n: cuenta((o) => o.role === r) }))
    const tecs = TEC_IDS.map((id) => ({ valor: id, etiqueta: strings.sections.shopify.filters[id] ?? id, n: cuenta((o) => tecnologiasDe(o).includes(id)) }))
    return { tipo: tipos, anio: anios, rol: roles, tec: tecs }
  }, [lista, t.tipos, strings.badges.roles, strings.sections.shopify.filters])

  const visibles = lista.filter(
    (o) => (!activo.tipo || o.kind === activo.tipo) && (!activo.anio || String(o.year) === activo.anio) && (!activo.rol || o.role === activo.rol) && (!activo.tec || tecnologiasDe(o).includes(activo.tec)),
  )
  const poner = (f: Filtro, valor: string | null) =>
    setSp(
      (prev) => {
        const n = new URLSearchParams(prev)
        if (valor === null || n.get(f) === valor) n.delete(f)
        else n.set(f, valor)
        return n
      },
      { replace: true },
    )
  const etiquetas: Record<Filtro, string> = { tipo: t.obra.tipo, anio: t.obra.anio, rol: t.obra.rol, tec: t.obra.tec }

  const filtros = (
    <div className="c-filtros" role="group" aria-label={t.obra.filtros} data-c-stag>
      {FILTROS.map((f) => (
        <div key={f} className="c-filtro" role="group" aria-label={etiquetas[f]}>
          <span className="c-filtro__et c-mono" aria-hidden="true">
            {etiquetas[f]}
          </span>
          <div className="c-filtro__chips">
            {opciones[f]
              .filter((o) => o.n > 0)
              .map((o) => (
                <button key={o.valor} type="button" className="c-chip c-chip--btn" aria-pressed={activo[f] === o.valor} onClick={() => poner(f, o.valor)}>
                  <span>
                    {o.etiqueta} <span className="c-n">{o.n}</span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <title>{`${t.obra.titulo} · ${personal.name}`}</title>
      <main id="contenido" tabIndex={-1} className="c-pagina c-obra">
        <section className="c-calco c-hoja c-hoja--ancha" aria-labelledby="c-obra-h" data-c-calco>
          <span className="c-tab c-mono">{t.obra.calco}</span>
          <Registros />
          <h1 id="c-obra-h" className="c-h1" data-c-h1>
            <Linea>{t.obra.titulo}</Linea>
          </h1>
          <p className="c-nota">{t.obra.lead(SHOT_DATE)}</p>

          {ancho ? (
            filtros
          ) : (
            <details className="c-filtros-d" open={abierto} onToggle={(e) => setAbierto(e.currentTarget.open)}>
              <summary>
                <span>{t.obra.filtrar}</span>
                {hay && <span className="c-n">{nActivos}</span>}
                <svg className="c-ico" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 7l5 5 5-5" />
                </svg>
              </summary>
              {filtros}
            </details>
          )}
          <p className="c-contador" role="status">
            {hay && (
              <>
                {t.obra.mostrando(visibles.length)} ·{' '}
                <button type="button" className="c-link" onClick={() => setSp({}, { replace: true })}>
                  {t.obra.limpiar}
                </button>
              </>
            )}
          </p>
        </section>

        {visibles.length === 0 ? (
          <p className="c-vacio c-obra__vacio">{t.obra.vacio}</p>
        ) : (
          <ol className="c-filas c-filas--obra c-obra__lista">
            {visibles.map((o, i) => (
              <FilaObra key={o.slug} obra={o} nr={nr.get(o.slug) ?? ''} prioridad={i < 3} />
            ))}
          </ol>
        )}
      </main>
    </>
  )
}

function FilaObra({ obra, nr, prioridad }: { obra: Obra; nr: string; prioridad: boolean }) {
  const { t } = useC()
  const tieneCaptura = obra.views.length > 0
  return (
    <li className={tieneCaptura ? 'c-fila c-fila--obra' : 'c-fila c-fila--obra c-fila--sola'}>
      <div className="c-fila__txt">
        {tieneCaptura && <p className="c-mono c-fila__nr">{t.ficha.numero(nr)}</p>}
        <h2 className="c-fila__nombre">
          <Link to={v5path('c', 'obra', obra.slug)} className="c-fila__enlace" {...usarVuelo(obra)}>
            {obra.name}
          </Link>
        </h2>
        <p className="c-meta">{[t.tipos[obra.kind], obra.industry, obra.year, obra.rolLabel].filter(Boolean).join(' · ')}</p>
        {stackPublico(obra).length > 0 && (
          <ul className="c-tags" aria-label={t.ficha.pila}>
            {stackPublico(obra).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        {tieneCaptura ? (
          <Link className="c-link c-fila__mesa" to={`${v5path('c')}?vista=mesa&obra=${obra.slug}`}>
            {t.obra.verMesa}
          </Link>
        ) : (
          <p className="c-nota">{t.obra.sinCaptura}</p>
        )}
      </div>
      {tieneCaptura && <Tira obra={obra} nr={nr} prioridad={prioridad} />}
    </li>
  )
}
