import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { skillGroups } from '../../data/registry'
import { cascada, entrada, gsap, useGsap } from './motion'
import { Flecha, Palabras, useL } from './ui'

// «Pieza × cargo»: una matriz con los cargos en columnas (orden cronológico) y las herramientas del registro en filas, agrupadas
// como skillGroups. Un punto aparece SOLO si el stack declarado de ese cargo nombra la herramienta (nombre exacto).

const GRUPO_EXTRA: Record<string, string> = { Shopify: 'shopify', JavaScript: 'frontend', CSS: 'frontend', 'Material UI': 'frontend', 'Radix UI': 'frontend', 'React Email': 'frontend', Django: 'backend', REST: 'backend' }
const ORDEN_GRUPOS = ['shopify', 'frontend', 'backend', 'quality', 'cro', 'ai', 'otras']

/** `desde`: en el teléfono, el cargo cuya fila trae el chip que se tocó (el detalle de la herramienta se abre justo debajo). */
type Sel = { tipo: 'cargo' | 'herramienta'; id: string; desde?: string } | null

export default function Trayectoria() {
  const { c, v5, movil } = useL()
  const raiz = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const [sel, setSel] = useState<Sel>({ tipo: 'cargo', id: 'digitdeck-cto' })

  useGsap(raiz, entrada, [])

  const cargos = useMemo(() => [...v5.trayectoria].sort((a, b) => a.start.localeCompare(b.start)), [v5.trayectoria])
  const { grupos, sinCargo } = useMemo(() => {
    const grupoDe = new Map<string, string>()
    for (const [g, tools] of Object.entries(skillGroups)) for (const t of tools) grupoDe.set(t.toLowerCase(), g)
    const nombradas = new Map<string, Set<string>>()
    for (const cg of cargos) for (const t of cg.technologies) (nombradas.get(t) ?? nombradas.set(t, new Set()).get(t)!).add(cg.id)
    const porGrupo = new Map<string, { tool: string; ids: Set<string> }[]>()
    for (const [tool, ids] of nombradas) {
      const g = grupoDe.get(tool.toLowerCase()) ?? GRUPO_EXTRA[tool] ?? 'otras'
      ;(porGrupo.get(g) ?? porGrupo.set(g, []).get(g)!).push({ tool, ids })
    }
    const lista = ORDEN_GRUPOS.filter((g) => porGrupo.has(g)).map((g) => ({ id: g, filas: porGrupo.get(g)!.sort((a, b) => b.ids.size - a.ids.size || a.tool.localeCompare(b.tool)) }))
    const enRegistro = Object.values(skillGroups).flat()
    const sin = enRegistro.filter((t) => !nombradas.has(t)).length
    return { grupos: lista, sinCargo: sin }
  }, [cargos])

  // Tocar una columna o una herramienta lleva el detalle a la vista: sin esto el panel quedaba fuera de pantalla bajo la matriz.
  const [salto, setSalto] = useState(0)
  const elegir = (s: Sel) => {
    setSel(s)
    setSalto((n) => n + 1)
  }
  useLayoutEffect(() => {
    if (salto) panel.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [salto])
  const alaMatriz = () => document.getElementById('l-mx-t')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  // Cada cambio de selección: el detalle encaja (cascada) y su filete se dibuja como con pluma.
  const anterior = useRef(sel)
  useLayoutEffect(() => {
    if (anterior.current === sel) return
    anterior.current = sel
    const p = panel.current
    if (!p) return
    const ctx = gsap.context(() => {
      cascada(p.querySelectorAll('.l-pn-it'), { delay: 0.04 })
      gsap.fromTo(p.querySelector('.l-pn-rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'l-pluma', transformOrigin: '0 50%' })
    }, p)
    return () => ctx.revert()
  }, [sel])
  const cargoSel = sel?.tipo === 'cargo' ? cargos.find((x) => x.id === sel.id) : undefined
  const herrSel = sel?.tipo === 'herramienta' ? sel.id : undefined
  const entregables = (id: string) => v5.obras.filter((o) => o.kind === 'role' && o.employer === id)
  const nombranTool = herrSel ? cargos.filter((x) => x.technologies.includes(herrSel)) : []
  const tiendasTool = herrSel ? v5.obras.filter((o) => o.kind === 'store' && o.stack.includes(herrSel)) : []

  const detalleCargo = cargoSel && (
    <>
      <h3 className="l-pn-h l-pn-it">
        {cargoSel.company}
        {cargoSel.title ? ` · ${cargoSel.title}` : ''}
      </h3>
      <button type="button" className="l-lnk l-pn-up" onClick={alaMatriz}>
        <Flecha dir="arriba" />
        {c.tray.volver}
      </button>
      <span className="l-pn-rule" aria-hidden="true" />
      <p className="l-mono l-t l-pn-it">
        {cargoSel.period} · {cargoSel.location}
      </p>
      <p className="l-pn-sum l-pn-it">{cargoSel.summary}</p>
      <div className="l-pn-cols">
        <div className="l-pn-it">
          <h4 className="l-mono">{c.tray.logros}</h4>
          <ul className="l-pn-ul">
            {cargoSel.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div className="l-pn-it">
          {cargoSel.metrics.length > 0 && (
            <>
              <h4 className="l-mono">{c.tray.metricas}</h4>
              <dl className="l-pn-met">
                {cargoSel.metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {entregables(cargoSel.id).length > 0 && (
            <>
              <h4 className="l-mono">{c.tray.entregables}</h4>
              <ul className="l-pn-ul">
                {entregables(cargoSel.id).map((o) => (
                  <li key={o.slug}>{o.name}</li>
                ))}
              </ul>
            </>
          )}
          <h4 className="l-mono">{c.tray.stack}</h4>
          <ul className="l-chips-s">
            {cargoSel.technologies.map((t) => (
              <li key={t}>
                <button type="button" className="l-chip l-chip-s" onClick={() => elegir({ tipo: 'herramienta', id: t, desde: cargoSel.id })}>
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
  const detalleTool = herrSel && (
    <>
      <h3 className="l-pn-h l-pn-it">{c.tray.nombran(herrSel)}</h3>
      <button type="button" className="l-lnk l-pn-up" onClick={alaMatriz}>
        <Flecha dir="arriba" />
        {c.tray.volver}
      </button>
      <span className="l-pn-rule" aria-hidden="true" />
      {nombranTool.length ? (
        <div className="l-pn-cols">
          <div className="l-pn-it">
            <h4 className="l-mono">{c.tray.cargosLista}</h4>
            <ul className="l-pn-ul">
              {nombranTool.map((x) => (
                <li key={x.id}>
                  <button type="button" className="l-lnk l-t" onClick={() => elegir({ tipo: 'cargo', id: x.id })}>
                    {x.company}
                  </button>{' '}
                  <span className="l-mono l-t l-ink2">{x.period}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="l-pn-it">
            <h4 className="l-mono">{c.tray.tiendasLista}</h4>
            {tiendasTool.length ? (
              <ul className="l-pn-ul">
                {tiendasTool.map((o) => (
                  <li key={o.slug}>{o.name}</li>
                ))}
              </ul>
            ) : (
              <p className="l-mono l-t l-ink2">—</p>
            )}
          </div>
        </div>
      ) : (
        <p className="l-pn-it">{c.tray.ninguno}</p>
      )}
    </>
  )

  return (
    <div ref={raiz}>
      <title>{`${c.tray.titulo} · ${v5.personal.name}`}</title>
      <meta name="robots" content="noindex" />
      <section className="l-hero l-hero-s">
        <p className="l-mono l-eyebrow" data-rv>
          {v5.strings.hero.eyebrow}
        </p>
        <h1 className="l-h1 l-h1-s">
          <Palabras texto={c.tray.titulo} />
        </h1>
        <span className="l-rule" data-regla aria-hidden="true" />
        <p className="l-lead" data-rv>
          {v5.strings.hero.location}
        </p>
      </section>

      <section className="l-sheet l-mxsec" aria-labelledby="l-mx-t">
        <div className="l-sheet-hd">
          <h2 id="l-mx-t" className="l-mono l-sheet-t">
            {c.tray.matriz}
          </h2>
          <span className="l-mono l-ink2 l-hide-m">{c.tray.nota}</span>
        </div>

        {movil ? (
          <ul className="l-mx-m">
            {cargos.map((cg) => {
              const tools = grupos.flatMap((g) => g.filas.filter((f) => f.ids.has(cg.id)).map((f) => f.tool))
              const cargoAbierto = sel?.tipo === 'cargo' && sel.id === cg.id
              const herrAbierta = sel?.tipo === 'herramienta' && (sel.desde ?? cargos.find((x) => x.technologies.includes(sel.id))?.id) === cg.id
              return (
                <li key={cg.id} data-rv>
                  <button type="button" className="l-mx-cg" aria-expanded={cargoAbierto} onClick={() => elegir({ tipo: 'cargo', id: cg.id })} aria-label={c.tray.abrirCargo(cg.company)}>
                    <span className="l-mx-co">{cg.company}</span>
                    <span className="l-mono l-t">{cg.title ? `${cg.title} · ${cg.period}` : cg.period}</span>
                  </button>
                  <ul className="l-chips-s" aria-label={c.tray.stack}>
                    {tools.map((t) => (
                      <li key={t}>
                        <button type="button" className="l-chip l-chip-s" aria-pressed={herrSel === t} onClick={() => elegir({ tipo: 'herramienta', id: t, desde: cg.id })}>
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {(cargoAbierto || herrAbierta) && (
                    <article className="l-pn" ref={panel as React.RefObject<HTMLElement>} aria-live="polite">
                      {cargoAbierto ? detalleCargo : detalleTool}
                    </article>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="l-mx-wrap">
            <table className="l-mx">
              <caption className="l-sr">{c.tray.matriz}</caption>
              <thead>
                <tr>
                  <th scope="col" className="l-mx-corner l-mono">
                    {c.tray.herramienta}
                  </th>
                  {cargos.map((cg) => (
                    <th key={cg.id} scope="col" className={sel?.tipo === 'cargo' && sel.id === cg.id ? 'l-on' : undefined}>
                      <button type="button" aria-pressed={sel?.tipo === 'cargo' && sel.id === cg.id} aria-label={c.tray.abrirCargo(cg.company)} onClick={() => elegir({ tipo: 'cargo', id: cg.id })}>
                        <span className="l-mx-co">{cg.company}</span>
                        {cg.title && <span className="l-mx-ti">{cg.title}</span>}
                        <span className="l-mono l-t">{cg.period}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grupos.map((g) => (
                  <Fragment key={g.id}>
                    <tr className="l-mx-g" data-rv>
                      <th scope="rowgroup" colSpan={cargos.length + 1} className="l-mono">
                        {c.tray.grupos[g.id]}
                      </th>
                    </tr>
                    {g.filas.map((f) => (
                      <tr key={f.tool} data-rv className={herrSel === f.tool ? 'l-on' : undefined}>
                        <th scope="row">
                          <button type="button" aria-pressed={herrSel === f.tool} aria-label={c.tray.abrirHerramienta(f.tool)} onClick={() => elegir({ tipo: 'herramienta', id: f.tool })}>
                            {f.tool}
                          </button>
                        </th>
                        {cargos.map((cg) => (
                          <td key={cg.id} className={sel?.tipo === 'cargo' && sel.id === cg.id ? 'l-on' : undefined}>
                            {f.ids.has(cg.id) ? (
                              <>
                                <span className="l-dot" aria-hidden="true" />
                                <span className="l-sr">{c.tray.punto}</span>
                              </>
                            ) : (
                              <span className="l-sr">{c.tray.sinPunto}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="l-mono l-ink2 l-mx-foot">
          {c.tray.nota} {c.tray.sinCargo(sinCargo)}
        </p>
      </section>

      {!movil && (
        <section className="l-pn-sec" aria-label={c.tray.cargo}>
          <article className="l-pn" ref={panel as React.RefObject<HTMLElement>} aria-live="polite">
            {sel ? (cargoSel ? detalleCargo : detalleTool) : <p className="l-mono">{c.tray.elige}</p>}
          </article>
        </section>
      )}
    </div>
  )
}
