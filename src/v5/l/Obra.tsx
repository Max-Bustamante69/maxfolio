import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Obra as ObraT } from '../data'
import { FECHAS, ROLES, escalaTexto, fechaDe, piezasDe, recortesDe, tiendasMedidas, type Recorte, type RolId } from './datos'
import { Flechas, InterruptorAlinear } from './Inicio'
import { cascada, entrada, Flip, useGsap } from './motion'
import { Tira } from './Tira'
import { Enlace, Flecha, Palabras, conParam, ruta, useL } from './ui'

const esRol = (q: string | null): q is RolId => !!q && (ROLES as string[]).includes(q)

/** Por qué una obra no tiene recortes: se deriva del dato, nunca se inventa. */
function razonDe(o: ObraT, c: ReturnType<typeof useL>['c']) {
  if (o.kind === 'product') return c.obra.razon.producto
  if (o.kind === 'role') return c.obra.razon.cargo
  if (o.kind === 'personal') return c.obra.razon.personal
  if (o.tema === 'cliente') return c.obra.razon.cliente
  if (o.tema === 'por-confirmar') return c.obra.razon['por-confirmar']
  if (o.tema === 'sin-medicion') return c.obra.razon['sin-medicion']
  return c.obra.razon.pendiente
}

export default function Obra() {
  const { c, v5, movil } = useL()
  const raiz = useRef<HTMLDivElement>(null)
  const [sp, setSp] = useSearchParams()
  const vista = sp.get('vista') === 'tienda' ? 'tienda' : 'pieza'
  const rubro = sp.get('rubro') ?? ''
  const anio = sp.get('anio') ?? ''
  const foco = esRol(sp.get('pieza')) ? (sp.get('pieza') as RolId) : null

  const medidas = tiendasMedidas()
  const info = (slug: string) => v5.obra(slug)
  const universo = vista === 'pieza' ? medidas.map((s) => info(s)).filter((o): o is ObraT => !!o) : v5.obras
  const rubros = useMemo(() => [...new Set(universo.map((o) => o.industry).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b)), [universo])
  const anios = useMemo(() => [...new Set(universo.map((o) => o.year))].sort((a, b) => b - a), [universo])
  const pasa = (slug: string) => {
    const o = info(slug)
    return !!o && (!rubro || o.industry === rubro) && (!anio || String(o.year) === anio)
  }
  const cambiar = (k: string, v: string | null) => setSp((p) => { const n = new URLSearchParams(p); if (v) n.set(k, v); else n.delete(k); return n }, { replace: true, preventScrollReset: true })

  const totalRecortes = ROLES.reduce((n, r) => n + recortesDe(r).length, 0)
  const visibles = ROLES.reduce((n, r) => n + recortesDe(r).filter((x) => pasa(x.slug)).length, 0)

  useGsap(raiz, entrada, [])
  // La pieza pedida por URL (?pieza=hero) se trae a la vista al abrir.
  useLayoutEffect(() => {
    if (!foco || movil) return
    const fila = raiz.current?.querySelector<HTMLElement>(`[data-fila="${foco}"]`)
    if (fila) window.scrollTo({ top: fila.getBoundingClientRect().top + window.scrollY - 8, behavior: 'instant' as ScrollBehavior })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={raiz}>
      <title>{`${c.obra.titulo} · ${v5.personal.name}`}</title>
      <meta name="robots" content="noindex" />
      <div className="l-tools">
        <h1 className="l-h1 l-h1-s">
          <Palabras texto={c.obra.titulo} />
        </h1>
        <div className="l-seg" role="group" aria-label={c.obra.vista} data-rv>
          <button type="button" aria-pressed={vista === 'pieza'} onClick={() => cambiar('vista', null)}>
            <span className="l-mono">{ROLES.length}</span>
            {c.obra.porPieza}
          </button>
          <button type="button" aria-pressed={vista === 'tienda'} onClick={() => cambiar('vista', 'tienda')}>
            <span className="l-mono">{v5.obras.length}</span>
            {c.obra.porTienda}
          </button>
        </div>
        <span className="l-sp" />
        <label className="l-flt" data-rv>
          <span className="l-mono">{c.obra.rubro}</span>
          <select value={rubro} onChange={(e) => cambiar('rubro', e.target.value || null)}>
            <option value="">{c.obra.todos}</option>
            {rubros.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="l-flt" data-rv>
          <span className="l-mono">{c.obra.anio}</span>
          <select value={anio} onChange={(e) => cambiar('anio', e.target.value || null)}>
            <option value="">{c.obra.todos}</option>
            {anios.map((a) => (
              <option key={a} value={String(a)}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <p className="l-mono l-cnt" role="status" data-rv>
          {vista === 'pieza' ? c.obra.contador(visibles, totalRecortes) : c.obra.obras(v5.obras.filter((o) => (!rubro || o.industry === rubro) && (!anio || String(o.year) === anio)).length)}
          <span className="l-hide-m">· {c.obra.sonda(FECHAS.join(' / '), medidas.length)}</span>
        </p>
      </div>

      {vista === 'pieza' ? (
        movil ? (
          <AtlasMovil pasa={pasa} foco={foco} />
        ) : (
          <div className="l-rows">
            {ROLES.map((rol, i) => (
              <FilaPieza key={rol} rol={rol} indice={i} items={recortesDe(rol).filter((r) => pasa(r.slug))} total={recortesDe(rol).length} foco={foco === rol} />
            ))}
          </div>
        )
      ) : (
        <ListaTiendas pasa={(o) => (!rubro || o.industry === rubro) && (!anio || String(o.year) === anio)} />
      )}
    </div>
  )
}

/** Una pieza del atlas en escritorio: celda de título sobre el campo y, a la derecha, su tira sobre la crema. */
function FilaPieza({ rol, indice, items, total, foco }: { rol: RolId; indice: number; items: Recorte[]; total: number; foco: boolean }) {
  const { c, tw } = useL()
  const [alineado, setAlineado] = useState(false)
  const [expandido, setExpandido] = useState(foco)
  const fila = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const estado = useRef<Flip.FlipState | null>(null)
  const nombre = c.piezas[rol].nombre

  // La pieza pedida por URL llega sobre su suelo y encaja en la línea común al aparecer: la firma de la dirección.
  useEffect(() => {
    if (!foco) return
    const t = window.setTimeout(() => setAlineado(true), 520)
    return () => window.clearTimeout(t)
  }, [foco])

  // Ver todas / ver menos: los tiles viajan a su nueva posición (Flip) en lugar de saltar.
  useLayoutEffect(() => {
    if (!estado.current) return
    const e = estado.current
    estado.current = null
    Flip.from(e, { duration: 0.55, ease: 'l-encaje', stagger: 0.018, absolute: false, scale: false })
  }, [expandido])
  const alternarExpandido = () => {
    estado.current = Flip.getState(fila.current?.querySelectorAll('.l-tile') ?? [])
    setExpandido((v) => !v)
  }

  return (
    <section ref={fila} className="l-row" data-fila={rol} aria-labelledby={`l-p-${rol}`}>
      <div className="l-tcell">
        <div className="l-t1">
          <span className="l-mono">{c.obra.fila(indice + 1, ROLES.length)}</span>
          {items.length > 0 && <InterruptorAlinear activo={alineado} onClick={() => setAlineado((v) => !v)} etiqueta={c.inicio.alinear} />}
        </div>
        <h2 id={`l-p-${rol}`} className="l-t-h" data-rv>
          {nombre}
        </h2>
        <p className="l-mono l-meta" data-rv>
          {items.length === total ? c.tira.recortes(total) : c.obra.contador(items.length, total)} · {c.tira.escala} {escalaTexto(rol, tw, expandido)} · {c.inicio.cota(fechaDe(rol)).split(' · ')[1]}
        </p>
        <p className="l-sub" data-rv>
          {c.piezas[rol].nota}
        </p>
        {alineado && (
          <dl className="l-leg">
            <div>
              <dt>{c.obra.leyenda.isla}</dt>
              <dd>{c.obra.leyendaIsla}</dd>
            </div>
            <div>
              <dt>{c.obra.leyenda.piel}</dt>
              <dd>{c.obra.leyendaPiel}</dd>
            </div>
            <div>
              <dt>{c.obra.leyenda.cota}</dt>
              <dd>{c.obra.leyendaCota}</dd>
            </div>
          </dl>
        )}
        <div className="l-t3">
          {items.length > 1 && (
            <button type="button" className="l-lnk" aria-expanded={expandido} onClick={alternarExpandido}>
              {expandido ? c.tira.verMenos : c.tira.verTodas}
              <Flecha dir={expandido ? 'arriba' : 'der'} />
            </button>
          )}
          {!expandido && items.length > 2 && <Flechas el={scroller} c={c} />}
        </div>
      </div>
      <div className="l-panel">
        {items.length ? (
          <Tira rol={rol} items={items} alineado={alineado} expandido={expandido} scrollRef={scroller} />
        ) : (
          <p className="l-empty l-mono">{total ? c.obra.sinResultados : c.inicio.sinRecortes}</p>
        )}
      </div>
    </section>
  )
}

/** Teléfono: un riel de chips de 44 px fija la pieza y las tiendas se apilan debajo, alineadas, con su cota y su piel. */
function AtlasMovil({ pasa, foco }: { pasa: (slug: string) => boolean; foco: RolId | null }) {
  const { c } = useL()
  const [sp] = useSearchParams()
  const q = sp.get('pieza')
  const pieza: RolId = foco ?? (esRol(q) ? q : 'hero')
  const items = recortesDe(pieza).filter((r) => pasa(r.slug))
  const hoja = useRef<HTMLDivElement>(null)
  const anterior = useRef(pieza)
  useGsap(
    hoja,
    (el) => {
      if (anterior.current === pieza) return
      anterior.current = pieza
      cascada(el.querySelectorAll('.l-mrow'))
    },
    [pieza],
  )
  return (
    <>
      <nav className="l-idxnav l-idxnav-o" aria-label={c.inicio.indice}>
        <ol className="l-idx">
          {ROLES.map((rol, i) => (
            <li key={rol}>
              <Link to={{ search: conParam(sp.toString() ? `?${sp.toString()}` : '', 'pieza', rol) }} replace preventScrollReset aria-current={rol === pieza ? 'true' : undefined}>
                <span className="l-mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="l-idx-t">{c.piezas[rol].nombre}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <section className="l-sheet" ref={hoja} aria-label={c.piezas[pieza].nombre}>
        <div className="l-sheet-hd">
          <h2 className="l-mono l-sheet-t">{c.inicio.numero(ROLES.indexOf(pieza) + 1, c.piezas[pieza].nombre, true)}</h2>
        </div>
        <p className="l-sub l-sub-m">{c.piezas[pieza].nota}</p>
        {items.length ? <Tira rol={pieza} items={items} alineado /> : <p className="l-empty l-mono">{c.obra.sinResultados}</p>}
        <p className="l-mono l-ink2 l-foot-sheet">{c.inicio.cota(fechaDe(pieza))}</p>
      </section>
    </>
  )
}

/** «Por tienda»: todas las obras en filas de 56 px para llegar directo a una; las que no tienen recortes dicen por qué. */
function ListaTiendas({ pasa }: { pasa: (o: ObraT) => boolean }) {
  const { c, v5, movil } = useL()
  const filas = v5.obras.filter(pasa)
  return (
    <div className="l-panelc">
      <ul className="l-lista">
        {filas.map((o) => {
          const piezas = piezasDe(o.slug)
          const hero = piezas.find((p) => p.rol === 'hero') ?? piezas[0]
          const rubro = o.industry ?? (o.kind === 'product' ? c.obra.razon.producto : o.kind === 'role' ? c.obra.razon.cargo : o.kind === 'personal' ? c.obra.razon.personal : '')
          return (
            <li key={o.slug} data-rv>
              <Enlace className="l-fila" to={ruta('obra', o.slug)} origen={() => document.querySelector(`[data-vuelo="foto.${o.slug}"]`)} aria-label={c.obra.abrir(o.name)}>
                <span className="l-th" data-vuelo={`foto.${o.slug}`} aria-hidden="true">
                  {hero ? <img src={`/v5/l/d/${hero.slug}-${hero.rol}.webp`} width={hero.d!.imgW} height={hero.d!.imgH} alt="" loading="lazy" decoding="async" /> : null}
                </span>
                <span className="l-fn">{o.name}</span>
                {!movil && <span className="l-fr">{rubro}</span>}
                <span className="l-fmeta">
                  <span className="l-mono l-fy">{o.year}</span>
                  {!movil && <span className="l-fr l-fro">{o.rolLabel ?? ''}</span>}
                  <span className="l-mono l-fp">{piezas.length ? c.obra.piezasDe(piezas.length) : razonDe(o, c)}</span>
                </span>
                <Flecha />
              </Enlace>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
