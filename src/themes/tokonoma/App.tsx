import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { preload } from 'react-dom'
import { en } from '../../content/en'
import { getContent } from '../../content'
import { supportedLocales, useLanguage, type Locale } from '../../context/LanguageContext'
import { useContent } from '../../hooks/useContent'
import { useV5 } from '../data'
import { useMedellinTime } from '../shared/useMedellinTime'
import Contacto from './Contacto'
import { useCopy } from './copy'
import Ficha from './Ficha'
import Inicio from './Inicio'
import { gsap } from './motion'
import Obra from './Obra'
import { Enlace, Sello, ruta } from './piezas'
import Trayectoria from './Trayectoria'
import './tokens.css'
import './tokonoma.css'

const ETIQUETA: Record<Locale, string> = { es: 'ES', en: 'EN', ja: 'JA' }
const SECCIONES = ['obra', 'trayectoria', 'contacto'] as const

// El selector de temas vive en su propio chunk: ni su código, ni su CSS, ni las ocho capturas se piden hasta que se abre
// (o hasta que se apunta al disparador, que solo adelanta el chunk de código, no las imágenes).
const cargarTemas = () => import('./Temas')
const Temas = lazy(cargarTemas)
const ID_TEMAS = 'tk-temas'

/** Selector ES · EN · JA: un solo toque, sin menú. */
function Idioma({ clase = '' }: { clase?: string }) {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`tk-idioma ${clase}`} role="group" aria-label={c.idioma}>
      {supportedLocales.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === locale} onClick={() => setLocale(l)}>{ETIQUETA[l]}</button>
      ))}
    </div>
  )
}

/** Capa blanca a pantalla completa (tokujin): fundido, los ítems suben 10 px; Esc cierra y el foco vuelve al botón. */
function Hoja({ cerrar }: { cerrar: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const c = useCopy()
  const { pathname } = useLocation()
  const actual = pathname.slice(ruta().length + 1).split('/')[0]
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, duration: 0.5, ease: 'none' })
      gsap.from('.tk-hoja a', { opacity: 0, y: 10, duration: 0.8, ease: 'tk-expo', stagger: 0.07, delay: 0.1 })
    }, ref)
    document.documentElement.style.overflow = 'hidden'
    const detras = document.querySelectorAll('.tk-vista, .tk-pie')
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
    <div className="tk-hoja" ref={ref} role="dialog" aria-modal="true" aria-label={c.principal}>
      <nav className="tk-hoja-nav" aria-label={c.principal}>
        <Enlace to={ruta()} aria-current={actual === '' ? 'page' : undefined} onClick={cerrar}>{c.nav.inicio}</Enlace>
        {SECCIONES.map((s) => (
          <Enlace key={s} to={ruta(s)} aria-current={actual === s ? 'page' : undefined} onClick={cerrar}>{c.nav[s]}</Enlace>
        ))}
      </nav>
      <div className="tk-hoja-pie"><Idioma /></div>
    </div>
  )
}

/** Cabecera de 72 px: sin fondo arriba, blanca al 80 % al bajar; se esconde al bajar más de 100 px (400 ms lineal) y vuelve al subir. */
function Cabecera() {
  const c = useCopy()
  const { personal } = useV5()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [temas, setTemas] = useState(false)
  const raiz = useRef<HTMLElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const actual = pathname.slice(ruta().length + 1).split('/')[0]
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus({ preventScroll: true }) }, [])
  // El panel de temas suelta su aislamiento antes de avisar; el foco vuelve al disparador, que ya no es inerte.
  const cerrarTemas = useCallback(() => { setTemas(false); disparador.current?.focus({ preventScroll: true }) }, [])

  useEffect(() => {
    let ultimo = window.scrollY
    const alDesplazar = () => {
      const y = window.scrollY
      const el = raiz.current
      if (!el) return
      el.dataset.fondo = y > 8 ? '1' : '0'
      if (y > 100 && y > ultimo + 2) el.dataset.oculta = '1'
      else if (y < ultimo - 2 || y <= 100) delete el.dataset.oculta
      ultimo = y
    }
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])
  useEffect(() => { setAbierto(false); setTemas(false) }, [pathname])

  return (
    <>
    <header className="tk-cab" ref={raiz} data-fondo="0" onFocus={() => raiz.current && delete raiz.current.dataset.oculta}>
      <div className="tk-fr tk-cab-in">
        <Enlace to={ruta()} className="tk-marca" aria-label={`${personal.name} · ${c.nav.inicio}`}><Sello tam={26} />{personal.name}</Enlace>
        <div className="tk-cab-der">
          <nav className="tk-nav" aria-label={c.principal}>
            {SECCIONES.map((s) => (
              <Enlace key={s} to={ruta(s)} aria-current={actual === s ? 'page' : undefined}>{c.nav[s]}</Enlace>
            ))}
            <Idioma clase="tk-idioma-cab" />
          </nav>
          <button ref={disparador} type="button" className="tk-temas-b" aria-haspopup="dialog" aria-expanded={temas} aria-controls={ID_TEMAS} onPointerEnter={cargarTemas} onFocus={cargarTemas} onClick={() => { setAbierto(false); setTemas(true) }}>{c.temas.boton}</button>
          <button ref={boton} type="button" className="tk-menu" aria-expanded={abierto} aria-label={abierto ? c.cerrarMenu : c.abrirMenu} onClick={() => (abierto ? cerrar() : (setTemas(false), setAbierto(true)))}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
    {abierto && <Hoja cerrar={cerrar} />}
    {temas && <Suspense fallback={null}><Temas id={ID_TEMAS} cerrar={cerrarTemas} /></Suspense>}
    </>
  )
}

function Pie() {
  const c = useCopy()
  const { personal, locale, strings } = useV5()
  const hora = useMedellinTime(locale === 'ja' ? 'ja-JP' : locale === 'es' ? 'es-CO' : 'en-US')
  return (
    <footer className="tk-pie">
      <div className="tk-fr tk-12 tk-pie-in">
        <div className="tk-pie-id">
          <p className="tk-marca tk-marca-pie"><Sello tam={30} />{personal.name}</p>
          <p className="tk-pie-rol">{strings.hero.eyebrow}</p>
          <p className="tk-pie-hora">{c.pie.medellin} · <time>{hora}</time></p>
        </div>
        <nav className="tk-pie-col tk-pie-nav" aria-label={c.principal}>
          <Enlace to={ruta()}>{c.nav.inicio}</Enlace>
          {SECCIONES.map((s) => <Enlace key={s} to={ruta(s)}>{c.nav[s]}</Enlace>)}
        </nav>
        <ul className="tk-pie-col tk-pie-redes">
          <li><a href={`mailto:${personal.email}`}>{personal.email}</a></li>
          <li><a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href={personal.cv} download>{c.cv}</a></li>
        </ul>
        <p className="tk-pie-fin">
          {c.pie.derechos} {personal.name}
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{c.pie.volver}</button>
        </p>
      </div>
    </footer>
  )
}

// Dirección «Tokonoma»: lujo silencioso japonés. Una obra a la vez, mucho aire, papel y luz.
export default function App() {
  const c = useCopy()
  const { locale } = useLanguage()
  const raiz = useRef<HTMLDivElement>(null)
  const primera = useRef(true)
  // Los textos de es/ja llegan en su propio chunk; hasta entonces useContent devuelve inglés. Se espera para no montar la vista dos veces.
  useContent() // suscribe la raíz a la llegada del chunk
  const listo = locale === 'en' || getContent(locale) !== en

  preload('/fonts/tokonoma/inter-tight-latin-300-500.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  preload('/fonts/tokonoma/jost-latin-400-500.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

  // Que el overscroll y el fondo del documento sean la misma luz de la página.
  useLayoutEffect(() => {
    document.documentElement.style.backgroundColor = getComputedStyle(raiz.current!).getPropertyValue('--luz')
    return () => { document.documentElement.style.backgroundColor = '' }
  }, [])
  // La cabecera entra con un fundido de 700 ms solo en la primera carga y el sello se estampa cuando el titular ya se ha barrido (≈ 0,9 s);
  // las vistas traen su propia entrada.
  useLayoutEffect(() => {
    if (!primera.current) return
    primera.current = false
    const ctx = gsap.context(() => {
      gsap.from('.tk-cab-in', { opacity: 0, duration: 0.7, ease: 'none', clearProps: 'opacity' })
      gsap.from('.tk-cab .tk-sello', { opacity: 0, scale: 1.6, rotate: -14, duration: 0.55, ease: 'tk-asienta', delay: 0.8, clearProps: 'opacity' })
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <div className="v5-root v5-tokonoma tk-raiz" ref={raiz}>
      <a className="tk-saltar" href="#contenido">{c.saltar}</a>
      <Cabecera />
      {listo ? (
        <Routes>
          <Route index element={<Inicio />} />
          <Route path="obra" element={<Obra />} />
          <Route path="obra/:slug" element={<Ficha />} />
          <Route path="trayectoria" element={<Trayectoria />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<Navigate to={ruta()} replace />} />
        </Routes>
      ) : (
        <main id="contenido" className="tk-vista" aria-busy="true" />
      )}
      <Pie />
    </div>
  )
}

