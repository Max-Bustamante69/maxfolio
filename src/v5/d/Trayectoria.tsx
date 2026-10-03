import { useMemo, useRef, type CSSProperties } from 'react'
import { skillGroups } from '../../data/registry'
import { toolUsageById } from '../../data/skillUsage'
import { useV5 } from '../data'
import { Cabeza } from './Cabeza'
import { useAnimaAlMontar } from './ajustes'
import { CORTE, LIMPIAR, SNAP, alVer, crecer, enTransicion, esPrimeraCarga, fueraDeVista, gsap, revelar, useCoreografia } from './movimiento'
import { llenar, useCopy } from './copy'
import { publico } from './datos'

type Grupo = keyof typeof skillGroups

/** Los puntos del cargo sin las frases que la dirección no imprime (cifras sin fuente citable). */
const cambios = (hs: string[]) => hs.map(publico).filter(Boolean)

/** Trayectoria: el historial de versiones. Cada cargo es una nota de versión (empresa y periodo en la cabecera, nunca un
 *  título con fecha de inicio); a la derecha, Compatibilidad: cuántas fichas del registro nombran cada herramienta. */
export default function Trayectoria() {
  const t = useCopy()
  const c = t.trayectoria
  const { trayectoria, eras, strings, personal } = useV5()
  const anima = useAnimaAlMontar()
  const raiz = useRef<HTMLDivElement>(null)

  // Más reciente primero: por fin del cargo (el vigente arriba) y luego por inicio.
  const notas = useMemo(() => [...trayectoria].sort((a, b) => (b.end ?? '9999-99').localeCompare(a.end ?? '9999-99') || b.start.localeCompare(a.start)), [trayectoria])
  const maximo = useMemo(() => Math.max(1, ...Object.values(skillGroups).flat().map((tool) => toolUsageById.get(tool)?.total ?? 0)), [])
  // Compatibilidad: por grupo, de más a menos fichas que la nombran. Una herramienta que las fichas no nombran pero el CV de Max sí
  // (en las tecnologías de un cargo) se rotula con esa fuente; el resto va plegado en un solo bloque con una nota neutra.
  const cvNombra = (tool: string) => trayectoria.some((e) => e.technologies.some((x) => x.toLowerCase() === tool.toLowerCase()))
  const compat = (Object.keys(skillGroups) as Grupo[]).map((g) => {
    const todas = skillGroups[g].map((tool) => ({ tool, n: toolUsageById.get(tool)?.total ?? 0 }))
    const cv = (x: { tool: string; n: number }) => x.n === 0 && cvNombra(x.tool)
    return {
      g,
      vistas: [...todas.filter((x) => x.n > 0).sort((a, b) => b.n - a.n), ...todas.filter(cv)],
      plegadas: todas.filter((x) => x.n === 0 && !cv(x)).map((x) => x.tool),
    }
  })
  const totalPlegadas = compat.reduce((n, x) => n + x.plegadas.length, 0)
  const anios = Object.entries(eras).filter((par): par is [string, string] => Boolean(par[1]))

  useCoreografia(
    raiz,
    () => {
      const bajoVT = enTransicion()
      if (!bajoVT) {
        const tl = gsap.timeline({ defaults: { ease: SNAP, clearProps: LIMPIAR }, delay: esPrimeraCarga() ? 0.12 : 0.04 })
        tl.from('.d-pagina-cab > *', { clipPath: CORTE.oculto, y: 18, duration: 0.45, stagger: 0.07 }, 0)
          .from('.d-anios li', { clipPath: CORTE.oculto, duration: 0.3, stagger: 0.05 }, 0.3)
      }
      // Cada nota llega con su tramo de riel: el hilo de versiones se extiende hacia abajo a medida que se lee. Dentro de una
      // View Transition, las notas que ya están a la vista nacen completas (el barrido de la página es su entrada).
      gsap.utils.toArray<HTMLElement>('.d-version').forEach((nota) => {
        if (bajoVT && !fueraDeVista(nota)) return
        const riel = nota.querySelector('.d-riel')
        const cuerpo = nota.querySelectorAll('.d-version-cuerpo > *')
        gsap.set(riel, { scaleY: 0 })
        gsap.set(cuerpo, { clipPath: CORTE.oculto, y: 8 })
        alVer(nota, () => {
          gsap.timeline({ defaults: { ease: SNAP } })
            .to(riel, { scaleY: 1, duration: 0.5, clearProps: 'transform' }, 0)
            .to(cuerpo, { clipPath: CORTE.visto, y: 0, duration: 0.3, stagger: 0.05, clearProps: 'clipPath,transform' }, 0.05)
        }, '0px 0px -10% 0px')
      })
      revelar('.d-compat-grupo', { escalon: 0.06 })
      crecer(raiz.current?.querySelector('.d-compat') ?? null, Array.from(raiz.current?.querySelectorAll('.d-compat-barra i') ?? []))
    },
    anima,
  )

  return (
    <div ref={raiz} className="d-vista">
      <Cabeza titulo={`${t.titulos.trayectoria} · ${t.nav.trayectoria[1]} · ${personal.name}`} />
      <section className="d-banda" aria-labelledby="d-h1">
        <div className="d-celda d-pagina-cab">
          <p className="d-cap">{t.nav.trayectoria[1]}</p>
          <h1 id="d-h1" className="d-h1 d-h1-pagina">{t.titulos.trayectoria}</h1>
          <p className="d-lead d-lead-chico">{c.lead}</p>
          <ul className="d-anios" aria-label={c.aniosAria}>
            {anios.map(([anio, texto]) => (
              <li key={anio}><b>{anio}</b> {texto}</li>
            ))}
          </ul>
        </div>

        <div className="d-trayectoria-grid">
          <ol className="d-versiones" aria-label={c.riel}>
            {notas.map((e, i) => (
              <li key={e.id} className="d-version" data-actual={e.end === null}>
                <i className="d-riel" aria-hidden="true" />
                <span className="d-nodo" aria-hidden="true" />
                <div className="d-version-cuerpo">
                  <p className="d-cap d-version-cab">
                    <span>{llenar(c.nota, { n: i + 1, t: notas.length })}</span>
                    <time>{e.period}</time>
                    {e.end === null && <span className="d-actual"><span className="d-led-fijo" aria-hidden="true" />{c.actual}</span>}
                  </p>
                  <h2 className="d-h2 d-h2-nota">{e.company}</h2>
                  {e.title && <p className="d-nota-t">{e.title}</p>}
                  <p className="d-lead d-lead-chico">{e.summary}</p>
                  {cambios(e.highlights).length > 0 && (
                    <div>
                      <p className="d-cap">{c.cambios}</p>
                      <ul className="d-cambios">
                        {cambios(e.highlights).map((h) => <li key={h}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                  {e.metrics.length > 0 && (
                    <div>
                      <p className="d-cap">{c.cifras}</p>
                      <ul className="d-cifras">
                        {e.metrics.map((m) => (
                          <li key={m.label}><b>{m.value}</b> <span>{m.label}</span></li>
                        ))}
                      </ul>
                      <p className="d-nota-chica">{c.segunCv}</p>
                    </div>
                  )}
                  {e.technologies.length > 0 && (
                    <ul className="d-etiquetas" aria-label={strings.sections.experience.technologies}>
                      {e.technologies.map((tec) => <li key={tec} className="d-etiqueta-pila">{tec}</li>)}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <aside className="d-compat" aria-labelledby="d-compat-t">
            <div className="d-compat-cab">
              <h2 id="d-compat-t" className="d-h2">{c.compatibilidad}</h2>
              <p className="d-nota-chica">{c.compatLead}</p>
            </div>
            {compat.map(({ g, vistas }) => (
              <section key={g} className="d-compat-grupo" aria-labelledby={`d-g-${g}`}>
                <h3 id={`d-g-${g}`} className="d-cap d-cap-h">{strings.sections.skills.groups[g]}</h3>
                <ul>
                  {vistas.map(({ tool, n }) => (
                    <li key={tool} className="d-compat-fila">
                      <span className="d-compat-t">{tool}</span>
                      <span className="d-compat-n">{n === 0 ? c.delCv : n === 1 ? c.mencionadaUna : llenar(c.mencionada, { n })}</span>
                      {n > 0 && <span className="d-compat-barra" aria-hidden="true"><i style={{ '--v': n / maximo } as CSSProperties} /></span>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {totalPlegadas > 0 && (
              <details className="d-compat-plegadas">
                <summary className="d-compat-resumen">{llenar(c.plegadas, { n: totalPlegadas })}</summary>
                <p className="d-nota-chica">{c.plegadasNota}</p>
                {compat.filter((x) => x.plegadas.length > 0).map(({ g, plegadas }) => (
                  <p key={g} className="d-compat-lista"><span className="d-cap">{strings.sections.skills.groups[g]}</span> {plegadas.join(' · ')}</p>
                ))}
              </details>
            )}
            <p className="d-nota-chica d-compat-nota">{c.compatNota}</p>
          </aside>
        </div>
      </section>
    </div>
  )
}
