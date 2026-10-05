import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supportedLocales, useLanguage, type Locale } from '../../context/LanguageContext'
import { useV5, v5path } from '../data'
import { BotonTemas, cargarPanel } from './BotonTemas'
import { useCopy } from './copy'
import { gsap } from './motion'
import { capturasDeObra, Enlace, Flecha, precargar } from './piezas'
import MarcaMB from '../shared/MarcaMB'

const BASE = v5path('ingenieria')
const SECCIONES = ['', 'obra', 'trayectoria', 'contacto'] as const
const LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ja: 'JA' }
// El selector de temas es otro chunk: no se descarga ni monta una imagen hasta que alguien lo abre.
const PanelTemas = lazy(cargarPanel)

/** Selector ES/EN/JA: un solo toque, sin menú. */
function Idioma({ clase = '' }: { clase?: string }) {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`ing-seg ${clase}`} role="group" aria-label={c.idioma}>
      {supportedLocales.map((l) => (
        <button key={l} type="button" aria-pressed={l === locale} className="ing-seg-op" onClick={() => setLocale(l)}>{LABEL[l]}</button>
      ))}
    </div>
  )
}

/** Hoja del menú en móvil: palabras llanas, entrada escalonada, Esc cierra y el foco vuelve al botón. */
function Hoja({ cerrar, enlaces, cv }: { cerrar: () => void; enlaces: Array<[string, string, boolean]>; cv: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const c = useCopy()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, duration: 0.22, ease: 'power2.out' })
      gsap.from('.ing-hoja nav a, .ing-hoja-pie > *', { opacity: 0, y: 18, duration: 0.6, ease: 'expo.out', stagger: 0.05, delay: 0.04 })
    }, ref)
    document.documentElement.style.overflow = 'hidden'
    const detras = document.querySelectorAll('.ing-vista, .ing-pie')
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
    <div className="ing-hoja" ref={ref} role="dialog" aria-modal="true" aria-label={c.principal}>
      <nav aria-label={c.principal}>
        {enlaces.map(([ruta, texto, activo]) => (
          <Enlace key={ruta} to={ruta} aria-current={activo ? 'page' : undefined} onClick={cerrar}>{texto}<Flecha /></Enlace>
        ))}
      </nav>
      <div className="ing-hoja-pie">
        <Idioma />
        <a className="ing-enlace" href={cv} download>{c.cv}</a>
        <Enlace to={`${BASE}/contacto?motivo=revision`} className="ing-btn ing-btn-pri" onClick={cerrar}>{c.revision}<Flecha /></Enlace>
      </div>
    </div>
  )
}

export function Nav({ cv }: { cv: string }) {
  const c = useCopy()
  const { pathname } = useLocation()
  const { obras } = useV5()
  const [abierto, setAbierto] = useState(false)
  const lista = useRef<HTMLUListElement>(null)
  const barra = useRef<HTMLSpanElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const [temas, setTemas] = useState(false)
  const disparador = useRef<HTMLButtonElement>(null)
  const abiertoAntes = useRef(false)
  const actual = pathname.slice(BASE.length + 1).split('/')[0] as (typeof SECCIONES)[number]
  const textos = [c.nav.inicio, c.nav.obra, c.nav.trayectoria, c.nav.contacto]
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus({ preventScroll: true }) }, [])

  // El subrayado de la sección activa viaja de un enlace al otro (solo transform).
  const ajustar = useCallback((duracion: number) => {
    const destino = lista.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!barra.current || !lista.current?.offsetWidth) return
    if (!destino) { gsap.set(barra.current, { scaleX: 0 }); return }
    gsap.to(barra.current, { x: destino.offsetLeft + 12, scaleX: destino.offsetWidth - 24, duration: duracion, ease: 'expo.out', overwrite: true })
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
    return () => ro.disconnect()
  }, [ajustar])
  useEffect(() => { setAbierto(false); setTemas(false) }, [pathname])
  const abrirTemas = useCallback(() => { setAbierto(false); setTemas(true) }, [])
  const cerrarTemas = useCallback(() => setTemas(false), [])
  // Al cerrar el selector el foco vuelve al disparador (ya sin inert: el panel lo quita al desmontarse).
  useEffect(() => {
    if (abiertoAntes.current && !temas) disparador.current?.focus({ preventScroll: true })
    abiertoAntes.current = temas
  }, [temas])
  // La barra baja suave en la primera carga.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => { gsap.from('.ing-nav-in', { opacity: 0, y: -10, duration: 0.7, ease: 'expo.out', clearProps: 'transform,opacity' }) })
    return () => ctx.revert()
  }, [])

  return (
    <header className="ing-nav">
      <div className="ing-nav-in">
        <Enlace to={BASE} className="ing-marca" aria-label="Maxfolio">
          <span className="ing-marca-sello" aria-hidden="true"><MarcaMB /></span>
          <span className="ing-marca-txt">Maxfolio</span>
        </Enlace>

        <nav className="ing-nav-links" aria-label={c.principal}>
          <ul ref={lista}>
            {SECCIONES.map((r, i) => (
              <li key={r}>
                <Enlace to={r ? `${BASE}/${r}` : BASE} aria-current={actual === r ? 'page' : undefined}
                  onPointerEnter={r === 'obra' ? () => precargar(capturasDeObra(obras)) : undefined} onFocus={r === 'obra' ? () => precargar(capturasDeObra(obras)) : undefined}>{textos[i]}</Enlace>
              </li>
            ))}
          </ul>
          <span className="ing-nav-barra" ref={barra} aria-hidden="true" />
        </nav>

        <div className="ing-nav-der">
          <BotonTemas ref={disparador} abierto={temas} alPulsar={abrirTemas} />
          <Idioma clase="ing-seg-idioma" />
          <Enlace to={`${BASE}/contacto?motivo=revision`} className="ing-btn ing-btn-pri ing-btn-chico ing-nav-cta">{c.revision}<Flecha /></Enlace>
          <button ref={boton} type="button" className="ing-burger" aria-expanded={abierto} aria-label={abierto ? c.menu.cerrar : c.menu.abrir} onClick={() => (abierto ? cerrar() : setAbierto(true))}>
            <span className="ing-burger-l" aria-hidden="true" />
          </button>
        </div>
      </div>
      {temas && <Suspense fallback={null}><PanelTemas cerrar={cerrarTemas} /></Suspense>}
      {abierto && (
        <Hoja cerrar={cerrar} cv={cv} enlaces={SECCIONES.map((r, i) => [r ? `${BASE}/${r}` : BASE, textos[i], actual === r] as [string, string, boolean])} />
      )}
    </header>
  )
}
