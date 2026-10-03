import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { SHOT_DATE, sinPuntoFinal, v5path } from '../data'
import { evento } from '../shared/contacto'
import { ANIOS, capturasDe, guardarSesion, lodSrc } from './datos'
import { Disposicion } from './Disposicion'
import { Linea } from './Linea'
import { Lectura, useHoja } from './Lectura'
import { CURVA, gsap, origenMesa, radioHasta } from './movimiento'
import { Registros } from './Reglas'
import { calentarMesa, cargarMesa, useAncho, useC, usePor, useVista } from './useC'

const Mesa = lazy(cargarMesa)

/** Home: el calco con la presentación y la Lectura (hoja de contactos). La Mesa carga perezosa solo al pedirla. */
export default function Inicio() {
  const { t, personal, storeCount, strings } = useC()
  const vista = useVista()
  const ancho = useAncho()
  const [por, setPor] = usePor()
  const [sp, setSp] = useSearchParams()
  const { conCaptura, diapositivas } = useHoja(por)
  const [salto, setSalto] = useState<number | null>(null)
  const tile = useRef<HTMLAnchorElement>(null)
  const mesa = vista === 'mesa'
  const hero = strings.hero
  const [primera, ...resto] = hero.positioning.split(/(?<=[.!?。])\s*/)
  const nota = hero.ctaNote.split(/(?<=[.!?。])\s+/)[0]
  const tiendas = conCaptura.filter((o) => o.kind === 'store').length

  // En escritorio el chunk de la Mesa se pide en reposo, tras la primera pintura: el iris nunca espera a que llegue (en el móvil solo con intención).
  useEffect(() => {
    if (!ancho) return
    const pedir = () => void cargarMesa()
    if (typeof window.requestIdleCallback !== 'function') {
      const id = window.setTimeout(pedir, 1800)
      return () => clearTimeout(id)
    }
    const id = window.requestIdleCallback(pedir, { timeout: 5000 })
    return () => window.cancelIdleCallback(id)
  }, [ancho])

  // «Cinta por año» (móvil): salta al grupo del año; si la disposición no es por año, la cambia primero.
  useEffect(() => {
    if (salto === null || por !== 'anio') return
    document.getElementById(`anio-${salto}`)?.scrollIntoView({ block: 'start' })
    setSalto(null)
  }, [salto, por])

  const salirMesa = () => {
    guardarSesion('vista', 'lectura')
    setSp(
      (prev) => {
        const n = new URLSearchParams(prev)
        n.set('vista', 'lectura')
        n.delete('obra')
        return n
      },
      { replace: true },
    )
  }
  // Al cerrarse la mesa el foco vuelve al botón que la abrió (UJ-4); la píldora móvil no es este botón, por eso se comprueba que se vea.
  const estabaMesa = useRef(false)
  useEffect(() => {
    if (estabaMesa.current && !mesa && tile.current?.getClientRects().length) tile.current.focus({ preventScroll: true })
    estabaMesa.current = mesa
  }, [mesa])

  return (
    <>
      <title>{`${personal.name} · ${t.vista.lectura}`}</title>
      <main id="contenido" tabIndex={-1} className="c-inicio" inert={mesa}>
        <div className="c-fold">
          <div className="c-col-calco">
            <section className="c-calco c-hero" aria-labelledby="c-nombre" data-c-calco>
              <span className="c-tab c-mono">{t.inicio.calco}</span>
              <Registros />
              <p className="c-eyebrow">{hero.eyebrow}</p>
              <h1 id="c-nombre" className="c-nombre" data-c-h1>
                <Linea className="c-nombre__l">{primera}</Linea>
                <Linea>{sinPuntoFinal(resto.join(' '))}</Linea>
              </h1>
              <p className="c-apoyo">{t.inicio.apoyo(storeCount)}</p>
              <div className="c-acc">
                <Link className="c-btn c-btn--tinta" to={v5path('c', 'contacto')} onClick={() => evento('c', 'contact_click', { canal: 'cta-inicio' })}>
                  {t.pedir}
                  <Flecha />
                </Link>
                <p className="c-nota">
                  {t.revisionNota} {nota}
                </p>
              </div>
              <p className="c-disponible">
                <strong>{hero.availability}</strong>
                {hero.location}
              </p>
              <dl className="c-caj" aria-label={t.inicio.cifras}>
                <div>
                  <dt>{t.inicio.tiendas}</dt>
                  <dd>{tiendas}</dd>
                </div>
                <div>
                  <dt>{t.inicio.diapositivas}</dt>
                  <dd>{diapositivas}</dd>
                </div>
                <div>
                  <dt>{t.inicio.captura}</dt>
                  <dd>{SHOT_DATE}</dd>
                </div>
                <div>
                  <dt>{t.inicio.taller}</dt>
                  <dd>{t.inicio.tallerValor}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="c-hoja" aria-labelledby="c-hoja-h">
            <div className="c-hoja__top">
              <p id="c-hoja-h" className="c-hoja__tit">
                <b>{t.inicio.sello}</b>
                <span className="c-mono">{t.inicio.hoja(conCaptura.length, diapositivas)}</span>
              </p>
              <Link ref={tile} className="c-tile" to={`${v5path('c')}?vista=mesa&por=${por}`} data-abrir-mesa onClick={() => guardarSesion('vista', 'mesa')} {...calentarMesa}>
                <span className="c-mini" aria-hidden="true">
                  {conCaptura.slice(0, 3).map((o) => (
                    <span key={o.slug} className="c-mini__r">
                      {capturasDe(o).map((c) => (
                        <i key={`${c.vista}-${c.vp}`} className={c.vp === 'desktop' ? 'c-mini__sd' : 'c-mini__sm'}>
                          <img src={lodSrc(0, o.slug, c)} alt="" loading="lazy" decoding="async" width={c.vp === 'desktop' ? 1200 : 780} height={c.vp === 'desktop' ? 750 : 1688} />
                        </i>
                      ))}
                    </span>
                  ))}
                  <span className="c-mini__cam" />
                </span>
                <span className="c-tile__tt">
                  <strong>{t.inicio.abrirMesa}</strong>
                  <em>{t.inicio.abrirMesaNota}</em>
                </span>
                <Flecha />
              </Link>
            </div>
            {!ancho && (
              <div className="c-hoja__ctl">
                <Disposicion por={por} onChange={setPor} />
                <div className="c-cinta" role="group" aria-label={t.inicio.cinta}>
                  {ANIOS.map((y) => {
                    const n = conCaptura.filter((o) => o.year === y).length
                    return (
                      <button
                        key={y}
                        type="button"
                        className="c-chip c-chip--btn"
                        disabled={n === 0}
                        title={n === 0 ? `${y}: ${t.inicio.sinCapturas}` : undefined}
                        onClick={() => {
                          setSalto(y)
                          if (por !== 'anio') setPor('anio')
                        }}
                      >
                        <span>{y}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <p className="c-nota c-hoja__lead">{t.inicio.leadLectura(SHOT_DATE)}</p>
            <Lectura por={por} />
          </section>
        </div>
      </main>
      {mesa &&
        createPortal(
          <MarcoMesa>
            <Suspense
              fallback={
                <div className="c-mesa c-mesa--carga" role="status">
                  {t.mesa.abriendo}
                </div>
              }
            >
              <Mesa por={por} onPor={setPor} onSalir={salirMesa} inicial={sp.get('obra')} />
            </Suspense>
          </MarcoMesa>,
          document.querySelector('.v5-c') ?? document.body,
        )}
    </>
  )
}

/** El marco de la mesa: se abre como un iris desde el botón que la pidió, ya mientras llega su chunk (la reacción es inmediata, EX-7). */
function MarcoMesa({ children }: { children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const { x, y } = origenMesa()
    const alto = el.current?.getBoundingClientRect().top ?? 0
    const R = radioHasta(x, y)
    const ctx = gsap.context(() => void gsap.fromTo(el.current, { clipPath: `circle(0px at ${x}px ${y - alto}px)` }, { clipPath: `circle(${R}px at ${x}px ${y - alto}px)`, duration: 0.52, ease: CURVA, clearProps: 'clipPath' }), el)
    return () => ctx.revert()
  }, [])
  return (
    <div className="c-mesa-marco" ref={el} data-marco-mesa="">
      {children}
    </div>
  )
}

const Flecha = () => (
  <svg className="c-ico" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9h12M10 4l5 5-5 5" />
  </svg>
)
