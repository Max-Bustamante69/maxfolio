import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toolUsage } from '../../data/skillUsage'
import type { SkillGroupId } from '../../data/registry'
import { v5path, type Obra } from '../data'
import { Cabeza } from './Cabeza'
import { ID, usePersona } from './contexto'
import { entradaTitulos } from './efectos'
import { limpio } from './limpio'
import { Enlace, Fondo, Titulo } from './piezas'
import { gsap, OUT, parallaxFondo, revelarPaneles, ScrollTrigger, SLAM, useGsap } from './motion'
import { llenar, Valor } from './util'

const sinDigitdeck = (url?: string) => (url && !/digitdeck\.co\b/i.test(url) ? url : undefined)
/** Obra de un año, en el orden en que se cuenta: tiendas con captura, el resto de tiendas, productos, proyectos propios. */
const ordenAnio = (o: Obra) => (o.kind === 'store' ? (o.views.length ? 0 : 1) : o.kind === 'product' ? 2 : 3)

export default function Trayectoria() {
  const { v5, c } = usePersona()
  const raiz = useRef<HTMLElement>(null)
  const { hash } = useLocation()
  const { trayectoria, obras, eras, strings } = v5
  const sec = strings.sections
  const hoy = trayectoria[0]
  const primerAnio = Number((trayectoria[trayectoria.length - 1]?.start ?? '2022').slice(0, 4))
  const ultimoAnio = Math.max(...obras.map((o) => o.year))
  const anios = Array.from({ length: ultimoAnio - primerAnio + 1 }, (_, i) => ultimoAnio - i)

  useGsap(raiz, () => {
    const r = raiz.current
    entradaTitulos(r)
    parallaxFondo(r)
    revelarPaneles(r)
    gsap.from('.pr-hoy', { opacity: 0, y: 22, duration: 0.55, ease: OUT, delay: 0.35 })
    // El selector del índice de cargos sigue la lectura: baja una fila cada vez que otra carta cruza la mitad de la pantalla.
    // La posición es una variable CSS (--i): la transición corre en el compositor y no hay nada que medir con la página quieta.
    const indice = r?.querySelector<HTMLElement>('.pr-linea')
    const filas = gsap.utils.toArray<HTMLElement>('.pr-linea__item', r ?? undefined)
    const marcar = (i: number) => {
      indice?.style.setProperty('--i', String(i))
      filas.forEach((f, k) => (k === i ? f.setAttribute('aria-current', 'location') : f.removeAttribute('aria-current')))
    }
    marcar(0)
    gsap.utils.toArray<HTMLElement>('.pr-cargo', r ?? undefined).forEach((carta, i) =>
      ScrollTrigger.create({ trigger: carta, start: 'top 50%', end: 'bottom 50%', onToggle: (t) => t.isActive && marcar(i) }),
    )
    // Las cifras de cada cargo entran inclinadas, una a una, al verse.
    gsap.utils.toArray<HTMLElement>('.pr-cargo__metricas .pr-metrica', r ?? undefined).forEach((m) =>
      gsap.from(m, { opacity: 0, x: -18, skewX: -8, duration: 0.45, ease: SLAM, scrollTrigger: { trigger: m, start: 'top 94%', once: true } }),
    )
  }, [v5.locale])

  // Un enlace con #cargo-… (los entregables de cargo de la Obra) aterriza en su cargo.
  useEffect(() => {
    if (!hash) return
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }), 120)
    return () => window.clearTimeout(t)
  }, [hash])

  return (
    <main id="contenido" className="pr-pagina" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${c.trayectoria.titulo} · ${v5.personal.name}`} />
      <section className="pr-banda pr-banda--primera" aria-labelledby="pr-trayectoria">
        <Fondo src="/v5/persona/art/years-bg-ice.webp" className="pr-fondo--rasgado" />
        <div className="pr-wrap">
          <Titulo id="pr-trayectoria" eyebrow={c.trayectoria.eyebrow} texto={c.trayectoria.titulo} />
          {hoy && (
            <div className="pr-hoy">
              <b>{c.trayectoria.hoy}</b>
              <p>{strings.hero.eyebrow}</p>
              <p className="pr-texto" style={{ marginTop: 8 }}>
                {strings.hero.availability}
              </p>
            </div>
          )}
          <h2 className="sr-only" id="pr-cargos">
            {c.trayectoria.cargos}
          </h2>
          <div className="pr-cargos-wrap">
            <nav className="pr-linea" aria-label={c.trayectoria.indice}>
              <span className="pr-linea__sel" aria-hidden="true" />
              {trayectoria.map((e) => (
                <a
                  key={e.id}
                  className="pr-linea__item"
                  href={`#cargo-${e.id}`}
                  onClick={(ev) => {
                    ev.preventDefault()
                    document.getElementById(`cargo-${e.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  <b>{e.company}</b>
                  <small>{e.period}</small>
                </a>
              ))}
            </nav>
            <ol className="pr-cargos" aria-labelledby="pr-cargos">
              {trayectoria.map((e, i) => (
                <Cargo key={e.id} e={e} actual={i === 0} />
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Cinco años, una sola dirección: por año, el rótulo de la época, cuántos roles, tiendas, productos y proyectos propios, y qué obra. */}
      <section className="pr-banda pr-banda--papel" aria-labelledby="pr-anios">
        <div className="pr-wrap">
          <Titulo id="pr-anios" nivel={2} eyebrow={sec.years.eyebrow} texto={sec.years.title} acento={sec.years.titleAccent} lead={sec.years.lead} />
          <ol className="pr-anios" aria-label={c.trayectoria.aniosAria}>
            {anios.map((y) => {
              const delAnio = obras.filter((o) => o.year === y && o.kind !== 'role').sort((a, b) => ordenAnio(a) - ordenAnio(b))
              const cuenta = (k: Obra['kind']) => delAnio.filter((o) => o.kind === k).length
              const roles = trayectoria.filter((e) => Number(e.start.slice(0, 4)) <= y && (!e.end || Number(e.end.slice(0, 4)) >= y)).length
              const nombres = delAnio.slice(0, 3)
              const resto = delAnio.length - nombres.length
              const cifras = [
                [roles, c.trayectoria.anioRoles],
                [cuenta('store'), c.trayectoria.anioTiendas],
                [cuenta('product'), c.trayectoria.anioProductos],
                [cuenta('personal'), c.trayectoria.anioPropios],
              ].filter(([n]) => Number(n) > 0)
              return (
                <li key={y} className="pr-anio" data-pr-panel>
                  <b className="pr-anio__y">{y}</b>
                  {eras[String(y)] && <p className="pr-anio__era">{eras[String(y)]}</p>}
                  <p className="pr-anio__cifras">
                    {cifras.map(([n, t]) => (
                      <span key={String(t)}>
                        <b>{n}</b> {t}
                      </span>
                    ))}
                  </p>
                  {nombres.length > 0 && (
                    <ul className="pr-anio__lista">
                      {nombres.map((o) => (
                        <li key={o.slug}>
                          <Enlace to={v5path(ID, 'obra', o.slug)}>{o.name}</Enlace>
                        </li>
                      ))}
                      {resto > 0 && <li className="pr-anio__mas">{llenar(sec.years.more, { n: resto })}</li>}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <Habilidades />
    </main>
  )
}

type Cargo = ReturnType<typeof usePersona>['v5']['trayectoria'][number]
const VISIBLES = 3

/** Un cargo: quién, cuándo, el resumen, el entregable, los primeros logros (el resto, tras «+N más»), las cifras del CV y la pila. */
function Cargo({ e, actual }: { e: Cargo; actual: boolean }) {
  const { v5, c } = usePersona()
  const [todo, setTodo] = useState(false)
  const primera = useRef(true)
  const sec = v5.strings.sections.experience
  const entregable = v5.obras.find((o) => o.kind === 'role' && o.employer === e.id)
  const web = sinDigitdeck(e.website)
  const logros = e.highlights.filter((h) => limpio(h))
  const resto = logros.length - VISIBLES

  // La carta cambia de alto: los disparadores de scroll (el índice de cargos) se recalculan.
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    ScrollTrigger.refresh()
  }, [todo])

  return (
    <li id={`cargo-${e.id}`} className={`pr-cargo ${actual ? 'pr-cargo--actual' : ''}`} data-pr-panel>
      <div className="pr-cargo__quien">
        <h3>{e.company}</h3>
        <p className="pr-cargo__periodo">{e.period}</p>
        <p className="pr-cargo__lugar">{e.location}</p>
        {e.title && <p className="pr-cargo__titulo">{e.title}</p>}
      </div>
      <div className="pr-cargo__cuerpo">
        <p className="pr-cargo__resumen">{e.summary}</p>
        {entregable && (
          <p className="pr-cargo__entregable">
            <b>{c.trayectoria.entregable}</b> {entregable.name}
          </p>
        )}
        {logros.length > 0 && (
          <>
            <p className="pr-cargo__r">{sec.achievements}</p>
            <ul className="pr-cargo__lista" id={`logros-${e.id}`}>
              {logros.map((h, k) => (
                <li key={h} hidden={!todo && k >= VISIBLES}>
                  {h}
                </li>
              ))}
            </ul>
            {resto > 0 && (
              <button type="button" className="pr-cargo__mas" aria-expanded={todo} aria-controls={`logros-${e.id}`} onClick={() => setTodo(!todo)}>
                {todo ? sec.showLess : llenar(sec.showMore, { n: resto })}
              </button>
            )}
          </>
        )}
        {e.metrics.length > 0 && (
          <div className="pr-cargo__medidas">
            <div className="pr-cargo__metricas">
              {e.metrics.map((m) => (
                <div className="pr-metrica" key={m.label}>
                  <b>
                    <Valor v={m.value} />
                  </b>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
            <small className="pr-cifras">{c.trayectoria.cifrasCv}</small>
          </div>
        )}
        <div className="pr-etiquetas">
          {e.technologies.map((t) => (
            <span className="pr-etiqueta" key={t}>
              {t}
            </span>
          ))}
        </div>
        {web && (
          <a className="pr-enlace pr-cargo__web" href={web} target="_blank" rel="noopener noreferrer">
            {sec.visit} ↗
          </a>
        )}
      </div>
    </li>
  )
}

/** Con qué trabajo: los seis grupos del registro, uno a la vez, con la nota del grupo y cuántas obras nombran cada herramienta. */
function Habilidades() {
  const { v5, c } = usePersona()
  const sk = v5.strings.sections.skills
  const grupos = Object.keys(v5.habilidades) as SkillGroupId[]
  const [grupo, setGrupo] = useState<SkillGroupId>(grupos[0])
  const panel = useRef<HTMLDivElement>(null)
  const primera = useRef(true)
  const herramientas = toolUsage.filter((t) => t.group === grupo)

  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    const ctx = gsap.context(() => {
      gsap.from('.pr-herr', { opacity: 0, y: 14, rotation: -2, duration: 0.4, ease: SLAM, stagger: 0.018, clearProps: 'transform,opacity' })
    }, panel.current ?? undefined)
    return () => ctx.revert()
  }, [grupo])

  return (
    <section className="pr-banda" aria-labelledby="pr-habilidades">
      <Fondo src="/v5/persona/art/skills-bg-ice.webp" className="pr-fondo--rasgado" carga="baja" />
      <div className="pr-wrap">
        <Titulo id="pr-habilidades" nivel={2} eyebrow={sk.eyebrow} texto={sk.title} acento={sk.titleAccent} />
        <div className="pr-filtros" role="group" aria-label={c.trayectoria.grupos}>
          {grupos.map((g) => (
            <button key={g} type="button" className="pr-filtro" aria-pressed={grupo === g} onClick={() => setGrupo(g)}>
              {sk.groups[g]}
            </button>
          ))}
        </div>
        <div className="pr-habil" ref={panel} data-pr-panel>
          <div className="pr-habil__cab">
            <h3>{sk.groups[grupo]}</h3>
            <p>{sk.groupNote[grupo]}</p>
          </div>
          <ul className="pr-herramientas" aria-label={`${sk.groups[grupo]}: ${herramientas.length} ${c.trayectoria.herramientas}`}>
            {herramientas.map((t) => (
              <li className="pr-herr" key={t.tool} data-usos={t.total || undefined}>
                {t.tool}
                {t.total > 0 && <small aria-label={String(t.total)}>{t.total}</small>}
              </li>
            ))}
          </ul>
          <p className="pr-habil__nota">{c.trayectoria.usoNota}</p>
        </div>
      </div>
    </section>
  )
}
