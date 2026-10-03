import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useV5, v5path, type Obra as ObraT } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { Cabeza } from './Cabeza'
import { useCopy } from './copy'
import { anillos, formatoN, miniDe, motivoDe, piezaDe, placaDe, RADIOGRAFIADAS, vpPorDefecto, type Placa as PlacaT } from './medicion'
import { CORTE, gsap, marcarOrigen, precargar, revelar, useEscena } from './motion'
import { KLink } from './nav'
import { Tira } from './Regleta'
import { useMedia } from './useMedia'

type Orden = 'anio' | 'nombre' | 'secciones'
const FILTROS = ['capa', 'rubro', 'anio', 'rol', 'pieza'] as const

/** Lo que la tarjeta insinúa de la dirección: al pasar el cursor, una línea baja por el recorte y deja el esqueleto y las
 *  cajas medidas por encima (CSS puro: clip-path y transform, sin rAF). Mismas cajas premedidas que la placa. */
function EsqueletoTarjeta({ p }: { p: PlacaT }) {
  const alto = p.ancho * 1.25
  return (
    <>
      <svg className="k-card-esq" viewBox={`0 0 ${p.ancho} ${alto}`} preserveAspectRatio="none" aria-hidden="true">
        {p.secs.filter((s) => s.y < alto).map((s, i) => (
          <g key={i}>
            <rect className="k-ce-h" x={2} y={s.y + 1} width={p.ancho - 4} height={Math.max(Math.min(s.h, alto - s.y) - 2, 1)} />
            <rect className="k-ce-i" x={2} y={s.y + 1} width={p.ancho - 4} height={Math.max(Math.min(s.h, alto - s.y) - 2, 1)} />
          </g>
        ))}
        {anillos(p.secs).filter((a) => a.y + a.h < alto && a.w > 60 && a.h > 40).map((a, i) => (
          <rect key={i} className="k-ce-a" x={a.x + 6} y={a.y + 6} width={a.w - 12} height={a.h - 12} />
        ))}
      </svg>
      <span className="k-card-lin" aria-hidden="true" />
    </>
  )
}

export default function Obra() {
  const c = useCopy()
  const { obras, strings, locale } = useV5()
  const fmt = useMemo(() => formatoN(locale), [locale])
  const [sp, setSp] = useSearchParams()
  const raiz = useRef<HTMLDivElement>(null)
  const ancho = useMedia('(min-width: 768px)')
  const [abierto, setAbierto] = useState(false)

  const tiendas = useMemo(() => obras.filter((o) => o.kind === 'store'), [obras])
  const otras = useMemo(() => obras.filter((o) => o.kind === 'product'), [obras])

  // Pieza = la clave de sección (sin el sufijo del editor) que más tiendas medidas comparten.
  const piezas = useMemo(() => {
    const m = new Map<string, number>()
    for (const slug of RADIOGRAFIADAS) for (const k of new Set(placaDe(slug).secs.map((s) => piezaDe(s.k)))) m.set(k, (m.get(k) ?? 0) + 1)
    return [...m.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 14)
  }, [])
  const rubros = useMemo(() => [...new Set(tiendas.map((o) => o.industry).filter(Boolean) as string[])].sort(), [tiendas])
  const anios = useMemo(() => [...new Set(tiendas.map((o) => o.year))].sort((a, b) => b - a), [tiendas])
  const roles = useMemo(() => [...new Set(tiendas.map((o) => o.role).filter(Boolean) as string[])], [tiendas])

  const v = Object.fromEntries(FILTROS.map((f) => [f, sp.get(f) ?? ''])) as Record<(typeof FILTROS)[number], string>
  const orden = (sp.get('orden') as Orden) || 'anio'
  const poner = (k: string, val: string) =>
    setSp((prev) => {
      const n = new URLSearchParams(prev)
      if (val) n.set(k, val)
      else n.delete(k)
      return n
    }, { replace: true })

  const lista = useMemo(() => {
    const n = (o: ObraT) => placaDe(o.slug)?.secs.length ?? -1
    return tiendas
      .filter((o) => {
        const p = placaDe(o.slug)
        if (v.capa === 'con' && !p) return false
        if (v.capa === 'solo' && p) return false
        if (v.rubro && o.industry !== v.rubro) return false
        if (v.anio && String(o.year) !== v.anio) return false
        if (v.rol && o.role !== v.rol) return false
        if (v.pieza && !p?.secs.some((s) => piezaDe(s.k) === v.pieza)) return false
        return true
      })
      .sort((a, b) =>
        orden === 'nombre' ? a.name.localeCompare(b.name) : orden === 'secciones' ? n(b) - n(a) || a.name.localeCompare(b.name) : b.year - a.year || n(b) - n(a) || a.name.localeCompare(b.name),
      )
  }, [tiendas, v.capa, v.rubro, v.anio, v.rol, v.pieza, orden])
  const hayFiltros = FILTROS.some((f) => v[f]) || orden !== 'anio'
  const nFiltros = FILTROS.filter((f) => v[f]).length + (orden !== 'anio' ? 1 : 0)
  const key = lista.map((o) => o.slug).join()

  useEscena(raiz, () => {
    const tl = gsap.timeline({ defaults: { ease: 'k-out', clearProps: 'clipPath,transform,opacity' } })
    tl.from('.k-h1 .k-l', { clipPath: CORTE.bloque.from, yPercent: 28, duration: 0.6 }, 0)
    tl.from('.k-bajada', { clipPath: CORTE.bloque.from, duration: 0.5 }, 0.12)
    tl.from('.k-filtros-d', { clipPath: CORTE.etiqueta.from, duration: 0.55 }, 0.2)
    return revelar(raiz.current!, '.k-card, .k-otras')
  }, [])
  // Al filtrar, las tarjetas que quedan entran en corte (clip-path), sin mover las demás.
  const montada = useRef(false)
  useEscena(raiz, () => {
    if (!montada.current) {
      montada.current = true
      return
    }
    const vistas = gsap.utils.toArray<HTMLElement>('.k-card').filter((e) => e.getBoundingClientRect().top < window.innerHeight)
    gsap.from(vistas, { clipPath: CORTE.bloque.from, duration: 0.45, ease: 'power2.out', stagger: 0.03, clearProps: 'clipPath' })
  }, [key])

  const campo = (id: (typeof FILTROS)[number], etiqueta: string, opciones: [string, string][]) => (
    <label className="k-campo">
      <span className="k-mono">{etiqueta}</span>
      <select value={v[id]} onChange={(e) => poner(id, e.target.value)}>
        <option value="">{c.obra.todas}</option>
        {opciones.map(([val, txt]) => <option key={val} value={val}>{txt}</option>)}
      </select>
    </label>
  )

  return (
    <div ref={raiz} className="k-obra k-pag">
      <Cabeza titulo={c.obra.titulo} />
      <h1 className="k-h1 k-h1--sec"><span className="k-l">{c.obra.h1}</span></h1>
      <p className="k-bajada">{c.obra.bajada}</p>
      <details className="k-filtros-d" open={ancho || abierto} onToggle={(e) => { if (!ancho) setAbierto(e.currentTarget.open) }}>
        <summary className="k-filtros-r">
          <span>{c.obra.filtrarN(nFiltros)}</span>
          <span className="k-mas" aria-hidden="true" />
        </summary>
        <form className="k-filtros" onSubmit={(e) => e.preventDefault()} aria-label={c.obra.filtrar}>
          {campo('capa', c.obra.capa, [['con', c.obra.conRadiografia], ['solo', c.obra.soloPiel]])}
          {campo('rubro', c.obra.rubro, rubros.map((r) => [r, r]))}
          {campo('anio', c.obra.anio, anios.map((a) => [String(a), String(a)]))}
          {campo('rol', c.obra.rol, roles.map((r) => [r, strings.badges.roles[r as keyof typeof strings.badges.roles]]))}
          {campo('pieza', c.obra.pieza, piezas.map(([k, n]) => [k, `${k} · ${n}`]))}
          <label className="k-campo">
            <span className="k-mono">{c.obra.orden}</span>
            <select value={orden} onChange={(e) => poner('orden', e.target.value === 'anio' ? '' : e.target.value)}>
              <option value="anio">{c.obra.ordenAnio}</option>
              <option value="nombre">{c.obra.ordenNombre}</option>
              <option value="secciones">{c.obra.ordenSecciones}</option>
            </select>
          </label>
          <p className="k-cuenta k-mono" role="status">{c.obra.mostrando(lista.length, tiendas.length)}</p>
          {hayFiltros && <button type="button" className="k-btn k-btn--linea" onClick={() => setSp({}, { replace: true })}>{c.obra.limpiar}</button>}
        </form>
      </details>

      {lista.length === 0 ? (
        <p className="k-vacio">{c.obra.vacio}</p>
      ) : (
        <ul className="k-cards">
          {lista.map((o) => {
            // La tarjeta enseña el recorte superior de la captura de SU placa (misma imagen y misma fecha que el pie); así el
            // vuelo a la ficha lleva el mismo medio. Sin radiografía: la captura de la galería, o el motivo.
            const p = placaDe(o.slug, 'home', vpPorDefecto(o.slug)) ?? placaDe(o.slug)
            const foto = o.views.includes('home')
            return (
              <li key={o.slug} className="k-card">
                <KLink
                  to={v5path('k', 'obra', o.slug)}
                  sinBarrido
                  onPointerEnter={() => p && precargar(p.img)}
                  onFocus={() => p && precargar(p.img)}
                  onClick={(e) => {
                    const marco = e.currentTarget.querySelector<HTMLElement>('.k-card-marco')
                    if (marco && p) marcarOrigen(o.slug, marco, miniDe(p), p.img)
                  }}
                >
                  <span className="k-card-marco">
                    {p ? (
                      <>
                        <img className="k-card-img" src={miniDe(p)} width={400} height={500} alt="" loading="lazy" decoding="async" draggable={false} />
                        <EsqueletoTarjeta p={p} />
                      </>
                    ) : foto ? <ShotImg slug={o.slug} vista="home" vp="mobile" alt="" /> : <span className="k-sincap k-mono">{c.obra.sinCaptura}</span>}
                    <Tira alturas={p?.secs.map((s) => s.h) ?? []} rayada={!p} />
                  </span>
                  <span className="k-card-t">{o.name}</span>
                  <span className="k-card-s k-mono">
                    {p ? c.obra.medidas(fmt(p.secs.length), fmt(p.nIslas), fmt(p.nMedidos), p.fecha) : c.motivos[motivoDe(o.slug)]}
                  </span>
                </KLink>
              </li>
            )
          })}
        </ul>
      )}

      <section className="k-otras" aria-labelledby="k-otras-t">
        <h2 id="k-otras-t" className="k-h2">{c.obra.otras}</h2>
        <ul className="k-lista">
          {otras.map((o) => (
            <li key={o.slug}>
              <KLink to={v5path('k', 'obra', o.slug)}>
                <span className="k-lista-n">{o.name}</span>
                <span className="k-mono k-lista-k">{c.tipos.product} · {o.year}</span>
                <span className="k-lista-t">{o.tagline}</span>
              </KLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
