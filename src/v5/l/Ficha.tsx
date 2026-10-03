import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { datosDe } from '../data'
import { ShotImg, pieDeCaptura } from '../shared/ShotImg'
import { ROLES, altoDe, esFina, hex, piezasDe, pielDe, tiendasMedidas, ventanaX, type Recorte } from './datos'
import { entrada, useGsap } from './motion'
import { Recorte1, claveDe } from './Tira'
import { Enlace, Flecha, Palabras, conParam, ruta, useL } from './ui'

type Vars = CSSProperties & Record<`--${string}`, string | number>

function Piel1({ slug }: { slug: string }) {
  const { c } = useL()
  const p = pielDe(slug)
  if (!p) return null
  return (
    <dl className="l-piel">
      <div>
        <dt>{c.ficha.titulares}</dt>
        <dd className="l-mono l-t">{p.titulares}</dd>
      </div>
      <div>
        <dt>{c.ficha.cuerpo}</dt>
        <dd className="l-mono l-t">{p.cuerpo}</dd>
      </div>
      <div>
        <dt>{c.ficha.fondo}</dt>
        <dd className="l-mono l-t l-sw-l">
          <i className={p.fondo ? 'l-sw' : 'l-sw l-sw-none'} style={p.fondo ? { background: hex(p.fondo) } : undefined} />
          {p.fondo ? hex(p.fondo) : c.ficha.sinFondo}
        </dd>
      </div>
    </dl>
  )
}

/** El recorte de una pieza en una celda del comparador, con su clave real y su alto medido. */
function Celda({ r, nombre, pieza, movil }: { r: Recorte | undefined; nombre: string; pieza: string; movil: boolean }) {
  const { c } = useL()
  if (!r) return <div className="l-celda l-celda-vacia" />
  const h = altoDe(r, movil)
  const fina = esFina(r.rol)
  return (
    <div className="l-celda">
      <div className="l-fpic" data-fina={fina} style={{ '--h': h, '--x0': fina ? ventanaX(r, 520) : 0 } as Vars}>
        <Recorte1 r={r} movil={movil} tienda={nombre} pieza={pieza} />
      </div>
      <p className="l-mono l-t l-fk">
        {claveDe(r, c)} · <b>{h} px</b>
      </p>
    </div>
  )
}

export default function Ficha() {
  const { slug = '' } = useParams()
  const { c, v5, movil } = useL()
  const raiz = useRef<HTMLDivElement>(null)
  const [sp, setSp] = useSearchParams()
  const [lado, setLado] = useState<'A' | 'B'>('A')
  const o = v5.obra(slug)

  const medidas = tiendasMedidas()
  const propias = piezasDe(slug)
  const comparable = propias.length > 0
  const otros = medidas.filter((s) => s !== slug)
  const porDefecto = useMemo(() => {
    const i = medidas.indexOf(slug)
    const siguientes = [...medidas.slice(i + 1), ...medidas.slice(0, Math.max(i, 0))].filter((s) => s !== slug)
    return siguientes.find((s) => o?.industry && v5.obra(s)?.industry === o.industry) ?? siguientes[0] ?? ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, o?.industry])
  const conSlug = sp.get('con')
  const b = conSlug && otros.includes(conSlug) ? conSlug : porDefecto
  const ob = b ? v5.obra(b) : undefined
  const piezasB = b ? piezasDe(b) : []

  const comunes = ROLES.filter((rol) => propias.some((r) => r.rol === rol) && piezasB.some((r) => r.rol === rol))

  useGsap(raiz, entrada, [slug])

  if (!o) return <Navigate to={ruta('obra')} replace />

  const datos = datosDe(slug)
  const portada = propias.find((r) => r.rol === 'hero') ?? propias[0]
  const portadaB = piezasB.find((r) => r.rol === 'hero') ?? piezasB[0]
  const host = o.link ? new URL(o.link).hostname.replace(/^www\./, '') : ''
  const razon = o.kind === 'product' ? c.obra.razon.producto : o.kind === 'role' ? c.obra.razon.cargo : o.kind === 'personal' ? c.obra.razon.personal : o.tema === 'cliente' ? c.obra.razon.cliente : o.tema === 'por-confirmar' ? c.obra.razon['por-confirmar'] : c.obra.razon.pendiente
  const filas: [string, React.ReactNode][] = [
    [c.ficha.rubro, o.industry ?? (o.kind === 'product' ? c.obra.razon.producto : o.kind === 'role' ? c.obra.razon.cargo : o.kind === 'personal' ? c.obra.razon.personal : '')],
    ...(o.rolLabel ? ([[c.ficha.rol, o.rolLabel]] as [string, React.ReactNode][]) : []),
    ...(o.period ? ([[c.ficha.periodo, v5.formatPeriod(o.period.start, o.period.end)]] as [string, React.ReactNode][]) : [[c.ficha.periodo, String(o.year)] as [string, React.ReactNode]]),
    ...(o.stack.length ? ([[c.ficha.pila, o.stack.join(' · ')]] as [string, React.ReactNode][]) : []),
    ...(datos.git ? ([[c.ficha.git, c.ficha.gitValor(datos.git.commits, datos.git.sections, datos.git.fecha)]] as [string, React.ReactNode][]) : []),
    ...(datos.lighthouse ? ([[c.ficha.lighthouse, c.ficha.lhValor(datos.lighthouse.movil.perf, datos.lighthouse.escritorio.perf, datos.lighthouse.fecha)]] as [string, React.ReactNode][]) : []),
    ...o.facts.map((f) => [f.label, f.value] as [string, React.ReactNode]),
    ...(o.link ? ([[c.ficha.enlace, <a key="l" href={o.link} target="_blank" rel="noopener noreferrer" className="l-lnk l-t">{host}</a>]] as [string, React.ReactNode][]) : []),
  ]

  return (
    <div ref={raiz}>
      <title>{`${o.name} · ${v5.personal.name}`}</title>
      <meta name="robots" content="noindex" />
      <section className="l-fhd">
        <Enlace className="l-lnk l-back" to={ruta('obra')}>
          <Flecha dir="izq" />
          {c.ficha.volver}
        </Enlace>
        <h1 className="l-h1 l-h1-s">
          <Palabras texto={o.name} />
        </h1>
        <span className="l-rule" data-regla aria-hidden="true" />
        <div className="l-fsub">
          <p className="l-fshort" data-rv>
            {o.tagline}
          </p>
          <p className="l-mono l-fyear" data-rv>
            {[o.rolLabel, o.year].filter(Boolean).join(' · ')}
          </p>
        </div>
      </section>

      {comparable ? (
        <section className="l-sheet l-comp" aria-labelledby="l-comp-t">
          <div className="l-sheet-hd">
            <h2 id="l-comp-t" className="l-mono l-sheet-t">
              {c.ficha.comparador} · {c.ficha.piezasComunes}
            </h2>
          </div>
          {movil && (
            <div className="l-ab" role="group" aria-label={c.ficha.lado}>
              <button type="button" aria-pressed={lado === 'A'} onClick={() => setLado('A')}>
                {c.ficha.ladoA} · {o.name}
              </button>
              <button type="button" aria-pressed={lado === 'B'} onClick={() => setLado('B')}>
                {c.ficha.ladoB} · {ob?.name ?? '—'}
              </button>
            </div>
          )}
          <div className="l-cmp" data-lado={movil ? lado : undefined}>
            <div className="l-cmp-hd">
              <div className="l-cmp-lab" aria-hidden="true" />
              <div className="l-cmp-col l-cmp-a">
                <div className="l-cover" data-vuelo={`foto.${slug}`}>
                  {portada && <img src={`/v5/l/d/${portada.slug}-${portada.rol}.webp`} width={portada.d!.imgW} height={portada.d!.imgH} alt="" decoding="async" />}
                </div>
                <p className="l-cmp-n">
                  <span className="l-mono">{c.ficha.ladoA}</span> {o.name}
                </p>
                <Piel1 slug={slug} />
              </div>
              <div className="l-cmp-col l-cmp-b">
                <div className="l-cover">{portadaB && <img src={`/v5/l/d/${portadaB.slug}-${portadaB.rol}.webp`} width={portadaB.d!.imgW} height={portadaB.d!.imgH} alt="" decoding="async" />}</div>
                <label className="l-cmp-n l-pick">
                  <span className="l-mono">{c.ficha.ladoB}</span> <span className="l-sr">{c.ficha.con}</span>
                  <select value={b} onChange={(e) => setSp((p) => { const n = new URLSearchParams(p); n.set('con', e.target.value); return n }, { replace: true, preventScrollReset: true })}>
                    {otros.map((s) => (
                      <option key={s} value={s}>
                        {v5.obra(s)?.name ?? s}
                      </option>
                    ))}
                  </select>
                </label>
                {b && <Piel1 slug={b} />}
              </div>
            </div>
            {comunes.length ? (
              comunes.map((rol) => {
                const ra = propias.find((r) => r.rol === rol)
                const rb = piezasB.find((r) => r.rol === rol)
                const pieza = c.piezas[rol].nombre
                return (
                  <div className="l-cmp-row" key={rol} data-rv>
                    <h3 className="l-cmp-lab">{pieza}</h3>
                    <div className="l-cmp-col l-cmp-a">
                      <Celda r={ra} nombre={o.name} pieza={pieza} movil={movil} />
                    </div>
                    <div className="l-cmp-col l-cmp-b">
                      <Celda r={rb} nombre={ob?.name ?? ''} pieza={pieza} movil={movil} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="l-empty l-mono">{c.ficha.ningunaComun}</p>
            )}
          </div>
        </section>
      ) : (
        <p className="l-nocmp" data-rv>
          {c.ficha.sinRecortes(razon)}
        </p>
      )}

      <section className="l-datos l-panelc" aria-labelledby="l-datos-t">
        <h2 id="l-datos-t" className="l-mono l-sheet-t" data-rv>
          {c.ficha.datos}
        </h2>
        <dl className="l-dl">
          {filas.map(([k, v]) => (
            <div key={k} data-rv>
              <dt className="l-mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {o.description && (
          <p className="l-desc" data-rv>
            {o.description}
          </p>
        )}
      </section>

      {o.views.length > 0 && (
        <section className="l-caps" aria-labelledby="l-caps-t">
          <h2 id="l-caps-t" className="l-mono l-sheet-t" data-rv>
            {c.ficha.capturas} · {c.ficha.home}{o.views.includes('pdp') ? ` | ${c.ficha.pdp}` : ''} × {c.ficha.escritorio} | {c.ficha.movil}
          </h2>
          <div className="l-caps-grid">
            {(['desktop', 'mobile'] as const).map((vp) =>
              o.views.map((vista) => (
                <figure key={`${vp}-${vista}`} className="l-shot" data-vp={vp} data-rv>
                  <ShotImg slug={slug} vista={vista} vp={vp} alt={pieDeCaptura(o.name, vista, vp)} />
                  <figcaption className="l-mono l-t">{pieDeCaptura(o.name, vista, vp)}</figcaption>
                </figure>
              )),
            )}
          </div>
        </section>
      )}

      {comparable && (
        <section className="l-cierre" aria-labelledby="l-cierre-t">
          <h2 id="l-cierre-t" className="l-mono l-sheet-t" data-rv>
            {c.ficha.verPieza}
          </h2>
          <ul className="l-chips" data-rv>
            {propias.map((r) => (
              <li key={r.rol}>
                <Enlace className="l-chip" to={`${ruta('obra')}${conParam('', 'pieza', r.rol)}`}>
                  {c.piezas[r.rol].nombre}
                  <Flecha />
                </Enlace>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
