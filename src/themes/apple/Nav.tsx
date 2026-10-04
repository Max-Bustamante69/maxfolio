import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supportedLocales, useLanguage, type Locale } from '../../context/LanguageContext'
import { useV5, v5path } from '../data'
import { useCopy } from './copy'
import { Flip, gsap } from './motion'
import { capturasDeObra, Enlace, precargar } from './piezas'

// El selector de temas (miniaturas, GSAP del panel y su CSS) llega solo al abrirlo; al pasar el puntero o enfocar el botón se calienta el chunk.
const cargarSelector = () => import('./Selector')
const Selector = lazy(cargarSelector)
const BASE = v5path('apple')
const SECCIONES = ['', 'obra', 'trayectoria', 'contacto'] as const
const LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ja: 'JA' }

const Sol = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
  </svg>
)
const Temas = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="9" width="12.5" height="11.5" rx="3.2" />
    <path d="M8 5.7V6a3.2 3.2 0 0 1 3.2-3.2h6.6A3.2 3.2 0 0 1 21 6v6.6a3.2 3.2 0 0 1-3.2 3.2H17.5" />
  </svg>
)
const Luna = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

/** Selector ES/EN/JA: un solo toque, sin menú. */
function Idioma({ clase = '' }: { clase?: string }) {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`ap-seg ${clase}`} role="group" aria-label={c.idioma}>
      {supportedLocales.map((l) => (
        <button key={l} type="button" aria-pressed={l === locale} className="ap-seg-op" onClick={() => setLocale(l)}>{LABEL[l]}</button>
      ))}
    </div>
  )
}

/** Hoja del menú en móvil: palabras llanas, entrada escalonada, Esc cierra y el foco vuelve al botón. */
function Hoja({ cerrar, enlaces, cv, escribeme }: { cerrar: () => void; enlaces: Array<[string, string, boolean]>; cv: string; escribeme: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const c = useCopy()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, duration: 0.25, ease: 'power2.out' })
      gsap.from('.ap-hoja a, .ap-hoja .ap-btn', { opacity: 0, y: 26, duration: 0.7, ease: 'apple', stagger: 0.06, delay: 0.05 })
    }, ref)
    document.documentElement.style.overflow = 'hidden'
    const detras = document.querySelectorAll('.ap-vista, .ap-pie')
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
    <div className="ap-hoja" ref={ref} role="dialog" aria-modal="true" aria-label={c.principal}>
      <nav aria-label={c.principal}>
        {enlaces.map(([ruta, texto, activo]) => (
          <Enlace key={ruta} to={ruta} className="ap-hoja-a" aria-current={activo ? 'page' : undefined} onClick={cerrar}>{texto}</Enlace>
        ))}
      </nav>
      <div className="ap-hoja-pie">
        <Idioma />
        <a className="ap-enlace" href={cv} download>{c.cvLabel}</a>
        <Enlace to={`${BASE}/contacto#agenda`} className="ap-btn ap-btn-pri" onClick={cerrar}>{escribeme}</Enlace>
      </div>
    </div>
  )
}

export function Nav({ oscuro, alternar, cv }: { oscuro: boolean; alternar: () => void; cv: string }) {
  const c = useCopy()
  const { pathname } = useLocation()
  const { obras } = useV5()
  const [abierto, setAbierto] = useState(false)
  const [temas, setTemas] = useState(false)
  const lista = useRef<HTMLUListElement>(null)
  const barra = useRef<HTMLSpanElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const botonTemas = useRef<HTMLButtonElement>(null)
  const actual = pathname.slice(BASE.length + 1).split('/')[0] as (typeof SECCIONES)[number]
  const textos = [c.nav.inicio, c.nav.obra, c.nav.trayectoria, c.nav.contacto]
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus({ preventScroll: true }) }, [])

  // La pastilla de la sección activa viaja de un enlace al otro (Flip.fit: solo transform).
  const ajustar = useCallback((duracion: number) => {
    const destino = lista.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!destino || !barra.current || !lista.current?.offsetWidth) return
    Flip.fit(barra.current, destino, { scale: true, duration: duracion, ease: 'apple' })
  }, [])
  const colocada = useRef(false)
  useLayoutEffect(() => {
    ajustar(colocada.current ? 0.55 : 0)
    colocada.current = true
  }, [actual, ajustar])
  useEffect(() => {
    if (!lista.current) return
    const ro = new ResizeObserver(() => ajustar(0))
    ro.observe(lista.current)
    return () => ro.disconnect()
  }, [ajustar])

  useEffect(() => { setAbierto(false); setTemas(false) }, [pathname])
  const cerrarTemas = useCallback(() => setTemas(false), [])

  return (
    <header className="ap-nav">
      <div className="ap-nav-in">
        <Enlace to={BASE} className="ap-marca" aria-label="Maxfolio">
          <span className="ap-marca-sello" aria-hidden="true">MB</span>
          <span className="ap-marca-txt">Maxfolio</span>
        </Enlace>

        <nav className="ap-nav-links" aria-label={c.principal}>
          <div className="ap-nav-lista">
            <ul ref={lista}>
              {SECCIONES.map((r, i) => (
                <li key={r}>
                  <Enlace to={r ? `${BASE}/${r}` : BASE} aria-current={actual === r ? 'page' : undefined}
                    onPointerEnter={r === 'obra' ? () => precargar(capturasDeObra(obras)) : undefined} onFocus={r === 'obra' ? () => precargar(capturasDeObra(obras)) : undefined}>{textos[i]}</Enlace>
                </li>
              ))}
            </ul>
            <span className="ap-nav-barra" ref={barra} aria-hidden="true" />
          </div>
        </nav>

        <div className="ap-nav-der">
          <Idioma clase="ap-seg-idioma" />
          <button ref={botonTemas} type="button" className="ap-icono ap-temas-btn" aria-label={c.temas.boton} aria-haspopup="dialog" aria-expanded={temas} aria-controls="ap-temas"
            onPointerEnter={cargarSelector} onPointerDown={cargarSelector} onFocus={cargarSelector} onClick={() => { setAbierto(false); setTemas(!temas) }}>
            <Temas /><span className="ap-temas-txt" aria-hidden="true">{c.temas.boton}</span>
          </button>
          <button type="button" className="ap-icono" onClick={alternar} aria-label={oscuro ? c.tema.aClaro : c.tema.aOscuro}>{oscuro ? <Sol /> : <Luna />}</button>
          <Enlace to={`${BASE}/contacto`} className="ap-btn ap-btn-pri ap-btn-chico ap-nav-cta">{c.escribeme}</Enlace>
          <button ref={boton} type="button" className="ap-icono ap-burger" aria-expanded={abierto} aria-label={abierto ? c.menu.cerrar : c.menu.abrir} onClick={() => (abierto ? cerrar() : setAbierto(true))}>
            <span className="ap-burger-l" aria-hidden="true" />
          </button>
        </div>
      </div>
      {temas && <Suspense fallback={null}><Selector anclaje={botonTemas} cerrar={cerrarTemas} /></Suspense>}
      {abierto && (
        <Hoja
          cerrar={cerrar}
          cv={cv}
          escribeme={c.escribeme}
          enlaces={SECCIONES.map((r, i) => [r ? `${BASE}/${r}` : BASE, textos[i], actual === r] as [string, string, boolean])}
        />
      )}
    </header>
  )
}
