import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useV5, v5path } from '../data'
import { evento } from '../shared/contacto'
import { Cabeza } from './Cabeza'
import { useCopy } from './copy'
import { CORTE, gsap, revelar, useEscena } from './motion'
import { KLink } from './nav'

/** Meses del registro, ambos extremos incluidos (iBox 2022-01 → 2022-07 = 7). Sin fecha de cierre no hay cifra. */
const meses = (a: string, b: string | null) => {
  if (!b) return null
  const [ya, ma] = a.split('-').map(Number)
  const [yb, mb] = b.split('-').map(Number)
  return (yb - ya) * 12 + (mb - ma) + 1
}

export default function Trayectoria() {
  const c = useCopy()
  const { trayectoria, obras, strings, personal } = useV5()
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set([trayectoria[0]?.id]))
  const raiz = useRef<HTMLDivElement>(null)
  const asa = useRef<HTMLDivElement>(null)
  const tramos = useRef<(HTMLButtonElement | null)[]>([])
  const [foco, setFoco] = useState(0)
  const montado = useRef(false)

  // La línea del núcleo marca el cargo abierto: se coloca en el centro de su tramo (medida al interactuar, nunca en un lazo).
  const llevarLinea = (i: number, animar: boolean) => {
    const t = tramos.current[i]
    if (!t || !asa.current) return
    const y = t.offsetTop + t.offsetHeight / 2
    if (animar) gsap.to(asa.current, { y, duration: 0.45, ease: 'power2.inOut' })
    else gsap.set(asa.current, { y })
  }

  useLayoutEffect(() => {
    llevarLinea(foco, montado.current)
    montado.current = true
    // El núcleo cambia de alto con la ventana: la línea se recoloca sobre el cargo marcado.
    const ro = new ResizeObserver(() => llevarLinea(foco, false))
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [foco])

  useEscena(raiz, () => {
    const tl = gsap.timeline({ defaults: { ease: 'k-out', clearProps: 'clipPath,transform,opacity' } })
    tl.from('.k-h1 .k-l', { clipPath: CORTE.bloque.from, yPercent: 28, duration: 0.6 }, 0)
    tl.from('.k-bajada, .k-cv', { clipPath: CORTE.bloque.from, duration: 0.5, stagger: 0.08 }, 0.15)
    // El corte se revela de arriba abajo, capa por capa: primero el núcleo (tramo a tramo) y a su paso la lista.
    tl.from('.k-tramo', { clipPath: CORTE.bloque.from, duration: 0.45, ease: 'power1.inOut', stagger: 0.09 }, 0.2)
    tl.from('.k-nuc-asa', { clipPath: CORTE.etiqueta.from, duration: 0.4, clearProps: 'clipPath' }, 0.7)
    tl.from(gsap.utils.toArray('.k-estrato').slice(0, 5), { clipPath: CORTE.bloque.from, duration: 0.55, stagger: 0.09 }, 0.25)
    return revelar(raiz.current!, '.k-estrato')
  }, [])

  const alternar = (id: string, i: number, el: HTMLElement) => {
    const abrir = !abiertas.has(id)
    setAbiertas((s) => {
      const n = new Set(s)
      if (abrir) n.add(id)
      else n.delete(id)
      return n
    })
    if (abrir) {
      setFoco(i)
      gsap.from(el.closest('.k-estrato')!.querySelectorAll('.k-panel-i > *'), { clipPath: CORTE.bloque.from, duration: 0.5, ease: 'power2.out', stagger: 0.06, delay: 0.06, clearProps: 'clipPath' })
    }
  }

  return (
    <div ref={raiz} className="k-tray k-pag">
      <Cabeza titulo={c.tray.titulo} />
      <h1 className="k-h1 k-h1--sec"><span className="k-l">{c.tray.h1}</span></h1>
      <p className="k-bajada">{c.tray.bajada(trayectoria.length)}</p>
      <a className="k-btn k-btn--linea k-cv" href={personal.cv} target="_blank" rel="noopener noreferrer" onClick={() => evento('k', 'contact_click', { canal: 'cv' })}>{strings.hero.ctaCv}</a>

      <div className="k-corte">
        {/* Núcleo: un tramo por cargo, con el alto proporcional a sus meses; la línea marca el cargo abierto. Atajo de ratón: el equivalente accesible es la lista. */}
        <div className="k-nucleo" aria-hidden="true">
          {trayectoria.map((e, i) => {
            const m = meses(e.start, e.end)
            return (
              <button
                key={e.id}
                ref={(el) => { tramos.current[i] = el }}
                type="button"
                tabIndex={-1}
                className="k-tramo"
                data-abierta={abiertas.has(e.id)}
                data-curso={m === null || undefined}
                style={{ flexGrow: m ?? 12, '--p': i % 5 } as CSSProperties}
                title={`${e.company} · ${m ? c.tray.meses(m) : c.tray.desde}`}
                onClick={(ev) => alternar(e.id, i, ev.currentTarget)}
              >
                <span className="k-mono">{m ?? '…'}</span>
              </button>
            )
          })}
          <div ref={asa} className="k-nuc-asa" />
        </div>
        <ol className="k-estratos">
          {trayectoria.map((e, i) => {
            const m = meses(e.start, e.end)
            const abierta = abiertas.has(e.id)
            const hechos = obras.filter((o) => o.kind === 'role' && o.employer === e.id)
            return (
              <li key={e.id} className="k-estrato" data-abierta={abierta}>
                <button type="button" className="k-estrato-b" aria-expanded={abierta} aria-controls={`k-p-${e.id}`} onClick={(ev) => alternar(e.id, i, ev.currentTarget)}>
                  <span className="k-estrato-n">
                    <b>{e.company}</b>
                    {e.title && <small>{e.title}</small>}
                  </span>
                  <span className="k-estrato-p k-mono">{e.period}</span>
                  <span className="k-estrato-m k-mono">{m ? c.tray.meses(m) : c.tray.desde}</span>
                  <span className="k-mas" aria-hidden="true" />
                </button>
                <div id={`k-p-${e.id}`} className="k-panel" role="region" aria-label={e.company} inert={!abierta}>
                  <div className="k-panel-i">
                    {e.summary && <p className="k-panel-r">{e.summary}</p>}
                    <div className="k-col-1">
                      <h2 className="k-mono k-h2s">{c.tray.stack}</h2>
                      <ul className="k-claves">{e.technologies.map((t) => <li key={t} className="k-mono">{t}</li>)}</ul>
                    </div>
                    {e.highlights.length > 0 && (
                      <div className="k-col-2">
                        <h2 className="k-mono k-h2s">{c.tray.logros}</h2>
                        <ul className="k-puntos">{e.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                      </div>
                    )}
                    {e.metrics.length > 0 && (
                      <div className="k-col-1">
                        <h2 className="k-mono k-h2s">{c.tray.metricas}</h2>
                        <ul className="k-metricas">
                          {e.metrics.map((x) => <li key={x.label}><b className="k-mono">{x.value}</b> <span>{x.label}</span></li>)}
                        </ul>
                        <p className="k-fuente k-mono">{c.tray.segunCv}</p>
                      </div>
                    )}
                    {hechos.length > 0 && (
                      <div className="k-col-1">
                        <h2 className="k-mono k-h2s">{c.tray.entregables}</h2>
                        <ul className="k-puntos">
                          {hechos.map((h) => <li key={h.slug}>{h.name} <span className="k-mono">· {h.period ? `${h.period.start} → ${h.period.end}` : h.year}</span></li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="k-fin">
        <KLink className="k-btn" to={v5path('k', 'contacto')}>{c.pedir}</KLink>
        <p className="k-nota">{c.pedirNota}</p>
      </div>
    </div>
  )
}
