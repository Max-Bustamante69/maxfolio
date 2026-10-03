import { useV5, v5path } from '../data'
import { useCopy } from './copy'
import { formatoN, placaDe, RADIOGRAFIADAS } from './medicion'
import { KLink } from './nav'

/** Anchos enteros proporcionales a la altura de cada sección (el resto va a la barra más ancha). */
function anchos(alturas: number[], total: number, gap: number) {
  const n = alturas.length
  const disp = total - gap * (n - 1)
  const suma = alturas.reduce((a, b) => a + b, 0)
  const w = alturas.map((h) => Math.max(1, Math.round((h / suma) * disp)))
  const resto = disp - w.reduce((a, b) => a + b, 0)
  w[w.indexOf(Math.max(...w))] += resto
  return w
}

/** Código de barras de una tienda: una barra por sección, grosor proporcional al alto real; salto de fila cada 12. */
export function Barcode({ alturas, w = 72, h = 44, gap = 2, salto = 12 }: { alturas: number[]; w?: number; h?: number; gap?: number; salto?: number }) {
  // Salto de fila cada 12 barras, repartidas por igual (16 → 8 + 8) para que ninguna fila quede con barras gruesas.
  const nFilas = Math.ceil(alturas.length / salto)
  const por = Math.ceil(alturas.length / nFilas)
  const filas: number[][] = []
  for (let i = 0; i < alturas.length; i += por) filas.push(alturas.slice(i, i + por))
  const fh = (h - (filas.length - 1) * gap) / filas.length
  return (
    <svg className="k-bc" width={w} height={h} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
      {filas.map((f, r) => {
        let x = 0
        return anchos(f, w, gap).map((wi, i) => {
          const rect = <rect key={`${r}-${i}`} x={x} y={r * (fh + gap)} width={wi} height={fh} />
          x += wi + gap
          return rect
        })
      })}
    </svg>
  )
}

/** Tira vertical pegada al borde de una tarjeta: una banda por sección, alto proporcional. */
export function Tira({ alturas, rayada }: { alturas: number[]; rayada?: boolean }) {
  if (rayada || !alturas.length) return <span className="k-tira k-tira--rayada" aria-hidden="true" />
  const total = alturas.reduce((a, b) => a + b, 0)
  let y = 0
  return (
    <svg className="k-tira" viewBox="0 0 16 200" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      {alturas.map((hh, i) => {
        const alto = Math.max((hh / total) * 200 - 1.2, 0.8)
        const r = <rect key={i} x={0} y={y} width={16} height={alto} />
        y += (hh / total) * 200
        return r
      })}
    </svg>
  )
}

/** La regleta: una barra de código por tienda medida. Es el índice de las placas. */
export function Regleta({ activo }: { activo?: string }) {
  const c = useCopy()
  const { obra, locale } = useV5()
  const fmt = formatoN(locale)
  const fecha = placaDe(RADIOGRAFIADAS[0])?.fecha ?? ''
  return (
    <section className="k-regleta" aria-label={c.inicio.regletaAria}>
      <div className="k-rg-l">
        <p className="k-mono k-rg-t">{c.inicio.regleta}</p>
        <p className="k-mono k-rg-s">{c.inicio.regletaNota(fecha)}</p>
      </div>
      <ul className="k-rg-u">
        {RADIOGRAFIADAS.map((slug) => {
          const p = placaDe(slug)
          const o = obra(slug)
          const nombre = o?.name ?? slug
          return (
            <li key={slug} className={slug === activo ? 'act' : undefined}>
              <KLink to={v5path('k', 'obra', slug)} title={`${nombre} · ${fmt(p.alto)} px · ${c.regleta.secciones(p.secs.length)}`} aria-current={slug === activo ? 'true' : undefined}>
                <Barcode alturas={p.secs.map((s) => s.h)} />
                <span className="nm">{nombre}</span>
              </KLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
