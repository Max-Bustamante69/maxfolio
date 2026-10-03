import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { shot, useV5, v5path } from '../data'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { gsap, registrarVelo } from './motion'
import { Chevron, Enlace, precargar } from './piezas'

const BASE = v5path('reportaje')
const SECCIONES = ['', 'obra', 'trayectoria', 'contacto'] as const
const CLAVES = ['inicio', 'obra', 'trayectoria', 'contacto'] as const
const LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ja: 'JA' }
const IDIOMAS: Locale[] = ['es', 'en', 'ja']
/** Evento que abre «Fuentes y método» desde cualquier vista. */
export const ABRIR_METODO = 'rp-abrir-metodo'

/** Selector ES/EN/JA: un solo toque, sin menú. */
function Idioma({ clase = '' }: { clase?: string }) {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`rp-idioma ${clase}`} role="group" aria-label={c.idioma}>
      {IDIOMAS.map((l) => (
        <button key={l} type="button" aria-pressed={l === locale} className="rp-idioma-op" lang={l} onClick={() => setLocale(l)}>{LABEL[l]}</button>
      ))}
    </div>
  )
}

/** Hoja del menú en móvil: el índice del reportaje con sus números, entrada escalonada, Esc cierra y el foco vuelve al botón. */
function Hoja({ cerrar, actual }: { cerrar: () => void; actual: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const c = useCopy()
  const { personal } = useV5()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, duration: 0.22, ease: 'power2.out' })
      gsap.from('.rp-hoja-a, .rp-hoja-pie > *', { opacity: 0, y: 22, duration: 0.7, ease: 'rep', stagger: 0.06, delay: 0.04 })
    }, ref)
    document.documentElement.style.overflow = 'hidden'
    const detras = document.querySelectorAll('.rp-vista, .rp-pie')
    detras.forEach((el) => el.setAttribute('inert', ''))
    ref.current?.querySelector<HTMLElement>('a')?.focus()
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', tecla)
    return () => {
      window.removeEventListener('keydown', tecla)
      document.documentElement.style.overflow = ''
      detras.forEach((el) => el.removeAttribute('inert'))
      ctx.revert()
    }
  }, [cerrar])
  return (
    <div className="rp-hoja" ref={ref} role="dialog" aria-modal="true" aria-label={c.principal}>
      <nav aria-label={c.principal}>
        {SECCIONES.map((r, i) => (
          <Enlace key={r} to={r ? `${BASE}/${r}` : BASE} num={c.capitulo[CLAVES[i]]} titulo={c.nav[CLAVES[i]]} className="rp-hoja-a" aria-current={actual === r ? 'page' : undefined} onClick={cerrar}>
            <span className="rp-mono">{c.capitulo[CLAVES[i]]}</span>
            <span>{c.nav[CLAVES[i]]}</span>
          </Enlace>
        ))}
      </nav>
      <div className="rp-hoja-pie">
        <Idioma />
        <a className="rp-enlace" href={personal.cv} download>{c.cvLabel}</a>
        <Enlace to={`${BASE}/contacto?motivo=revision`} num={c.capitulo.contacto} titulo={c.nav.contacto} className="rp-btn rp-btn-pri" onClick={cerrar}>{c.pedir}</Enlace>
      </div>
    </div>
  )
}

export function Nav() {
  const c = useCopy()
  const { pathname } = useLocation()
  const { obras } = useV5()
  const [abierto, setAbierto] = useState(false)
  const lista = useRef<HTMLUListElement>(null)
  const barra = useRef<HTMLSpanElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const actual = pathname.slice(BASE.length + 1).split('/')[0]
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus({ preventScroll: true }) }, [])

  // El subrayado dorado de la sección activa viaja de un enlace al otro (solo transform).
  const ajustar = useCallback((duracion: number) => {
    const d = lista.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!d || !barra.current || !lista.current?.offsetWidth) return
    gsap.to(barra.current, { x: d.offsetLeft, scaleX: d.offsetWidth / 100, duration: duracion, ease: 'rep', overwrite: true })
  }, [])
  const colocada = useRef(false)
  useLayoutEffect(() => {
    ajustar(colocada.current ? 0.6 : 0)
    colocada.current = true
  }, [actual, ajustar])
  useEffect(() => {
    if (!lista.current) return
    const ro = new ResizeObserver(() => ajustar(0))
    ro.observe(lista.current)
    document.fonts?.ready.then(() => ajustar(0))
    return () => ro.disconnect()
  }, [ajustar])
  useEffect(() => { setAbierto(false) }, [pathname])

  const calienta = () => precargar(obras.filter((o) => o.views.length).slice(0, 4).map((o) => shot(o.slug, o.views[0], 'desktop')))

  return (
    <header className="rp-nav">
      <i className="rp-lectura" aria-hidden="true" />
      <div className="rp-nav-in">
        <Enlace to={BASE} num={c.capitulo.inicio} titulo={c.nav.inicio} className="rp-marca">Maximiliano Bustamante</Enlace>
        <nav className="rp-nav-links" aria-label={c.principal}>
          <ul ref={lista}>
            {SECCIONES.map((r, i) => (
              <li key={r}>
                <Enlace to={r ? `${BASE}/${r}` : BASE} num={c.capitulo[CLAVES[i]]} titulo={c.nav[CLAVES[i]]} aria-current={actual === r ? 'page' : undefined}
                  onPointerEnter={r === 'obra' ? calienta : undefined} onFocus={r === 'obra' ? calienta : undefined}>
                  <span className="rp-nav-num" aria-hidden="true">{c.capitulo[CLAVES[i]]}</span>{c.nav[CLAVES[i]]}
                </Enlace>
              </li>
            ))}
          </ul>
          <span className="rp-nav-barra" ref={barra} aria-hidden="true" />
        </nav>
        <div className="rp-nav-der">
          <Idioma clase="rp-idioma-nav" />
          <Enlace to={`${BASE}/contacto?motivo=revision`} num={c.capitulo.contacto} titulo={c.nav.contacto} className="rp-btn rp-btn-linea rp-btn-chico rp-nav-cta">{c.pedir}</Enlace>
          <button ref={boton} type="button" className="rp-menu-b" aria-expanded={abierto} aria-label={abierto ? c.menu.cerrar : c.menu.abrir} onClick={() => (abierto ? cerrar() : setAbierto(true))}>
            <span className="rp-mono">{c.menu.etiqueta}</span>
            <span className={abierto ? 'rp-menu-l rp-menu-l-x' : 'rp-menu-l'} aria-hidden="true" />
          </button>
        </div>
      </div>
      {abierto && <Hoja cerrar={cerrar} actual={actual} />}
    </header>
  )
}

export function Pie() {
  const c = useCopy()
  const { personal, strings, locale } = useV5()
  const hora = useMedellinTime(locale)
  return (
    <footer className="rp-pie">
      <div className="rp-marco">
        <div className="rp-pie-filete" />
        <div className="rp-pie-grid">
          <div>
            <p className="rp-pie-nombre">{personal.name}</p>
            <p className="rp-pie-linea">{strings.hero.eyebrow}</p>
            <p className="rp-pie-linea">{strings.hero.location}</p>
          </div>
          <nav aria-label={c.principal} className="rp-pie-nav">
            {SECCIONES.slice(1).map((r, i) => (
              <Enlace key={r} to={`${BASE}/${r}`} num={c.capitulo[CLAVES[i + 1]]} titulo={c.nav[CLAVES[i + 1]]} className="rp-enlace">{c.nav[CLAVES[i + 1]]}</Enlace>
            ))}
            <a className="rp-enlace" href={personal.cv} download>{c.cvLabel}</a>
          </nav>
          <div className="rp-pie-nav">
            <a className="rp-enlace" href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="rp-enlace" href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="rp-enlace" href={`mailto:${personal.email}`}>{personal.email}</a>
          </div>
        </div>
        <div className="rp-pie-cola">
          <p className="rp-mono">© 2026 · {c.pie.medellin} · {hora} {c.pie.hora}</p>
          <button type="button" className="rp-enlace rp-pie-arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{c.pie.arriba}<Chevron /></button>
        </div>
      </div>
    </footer>
  )
}

/** La hoja de papel que cae entre vistas: lleva el número y el nombre del capítulo al que se va. */
export function Velo() {
  return (
    <div className="rp-velo" ref={registrarVelo} aria-hidden="true">
      <span className="rp-velo-num rp-mono" />
      <span className="rp-velo-tit" />
    </div>
  )
}

/**
 * Riel «Fuentes y método» (Pudding «WORD LISTS»): en escritorio, una tira fija de 32 px a la derecha que abre un panel con el
 * método; en móvil, un bloque plegable antes del pie. Aquí viven las notas de medición que no son contenido principal.
 */
export function Riel({ children }: { children: ReactNode }) {
  const c = useCopy()
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const cierra = useRef<HTMLButtonElement>(null)
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus({ preventScroll: true }) }, [])
  // Otras piezas (el apunte de la ficha) piden abrir el método: el riel en escritorio, el bloque plegable en móvil.
  useEffect(() => {
    const abrir = () => {
      const inline = document.querySelector<HTMLDetailsElement>('.rp-metodo-inline')
      if (inline && getComputedStyle(inline).display !== 'none') { inline.open = true; inline.scrollIntoView({ behavior: 'smooth', block: 'center' }) } else setAbierto(true)
    }
    window.addEventListener(ABRIR_METODO, abrir)
    return () => window.removeEventListener(ABRIR_METODO, abrir)
  }, [])
  useEffect(() => {
    if (!abierto) return
    cierra.current?.focus({ preventScroll: true })
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [abierto, cerrar])
  return (
    <>
      <aside className="rp-riel" data-abierto={abierto} aria-label={c.metodo.titulo}>
        <button ref={boton} type="button" className="rp-riel-tira" aria-expanded={abierto} aria-controls="rp-riel-panel" aria-label={c.metodo.abrir} onClick={() => setAbierto(!abierto)}>
          <span className="rp-mono rp-riel-txt">{c.metodo.titulo}</span>
          <span className="rp-mas" aria-hidden="true" />
        </button>
        <div id="rp-riel-panel" className="rp-riel-panel" inert={!abierto}>
          <div className="rp-riel-cab">
            <h2 className="rp-mono">{c.metodo.titulo}</h2>
            <button ref={cierra} type="button" className="rp-riel-x" aria-label={c.metodo.cerrar} onClick={cerrar}><span aria-hidden="true" /></button>
          </div>
          <div className="rp-riel-cuerpo">{children}</div>
        </div>
      </aside>
      <details className="rp-metodo-inline rp-marco">
        <summary className="rp-mono"><span>{c.metodo.titulo}</span><span className="rp-mas" aria-hidden="true" /></summary>
        <div className="rp-riel-cuerpo">{children}</div>
      </details>
    </>
  )
}
