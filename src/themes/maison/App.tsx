import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { supportedLocales, useLanguage, type Locale } from '../../context/LanguageContext'
import { en } from '../../content/en'
import { getContent } from '../../content'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useV5, v5path } from '../data'
import Contacto from './Contacto'
import { useCopy } from './copy'
import Ficha from './Ficha'
import Inicio from './Inicio'
import { escena, gsap } from './motion'
import Obra from './Obra'
import { Enlace, ID } from './piezas'
import Trayectoria from './Trayectoria'
import './tokens.css'
import './maison.css'

const BASE = v5path(ID)
const SECCIONES = ['', 'obra', 'trayectoria', 'contacto'] as const
const LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ja: 'JA' }

/** Selector ES/EN/JA: un toque, sin menú. */
function Idioma({ clase = '' }: { clase?: string }) {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`mz-idioma ${clase}`} role="group" aria-label={c.idioma}>
      {supportedLocales.map((l) => (
        <button key={l} type="button" aria-pressed={l === locale} className="mz-idioma-op" onClick={() => setLocale(l)}>{LABEL[l]}</button>
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
      gsap.fromTo(ref.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'velo', clearProps: 'clipPath' })
      gsap.from('.mz-hoja-a, .mz-hoja-pie > *', { opacity: 0, y: 24, duration: 0.7, ease: 'velo', stagger: 0.05, delay: 0.12 })
    }, ref)
    document.documentElement.style.overflow = 'hidden'
    const detras = document.querySelectorAll('.mz-vista, .mz-pie')
    detras.forEach((el) => el.setAttribute('inert', ''))
    ref.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
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
    <div className="mz-hoja" ref={ref} role="dialog" aria-modal="true" aria-label={c.principal}>
      <nav aria-label={c.principal}>
        {enlaces.map(([ruta, texto, activo]) => (
          <Enlace key={ruta} to={ruta} className="mz-hoja-a" aria-current={activo ? 'page' : undefined} onClick={cerrar}>{texto}</Enlace>
        ))}
      </nav>
      <div className="mz-hoja-pie">
        <Idioma />
        <a className="mz-enlace" href={cv} download>{c.cv}</a>
        <Enlace to={`${BASE}/contacto?motivo=revision`} className="mz-btn" onClick={cerrar}>{c.escribeme}</Enlace>
      </div>
    </div>
  )
}

function Cabecera({ cv }: { cv: string }) {
  const c = useCopy()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const actual = pathname.slice(BASE.length + 1).split('/')[0] as (typeof SECCIONES)[number]
  const textos = [c.nav.inicio, c.nav.obra, c.nav.trayectoria, c.nav.contacto]
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => { setAbierto(false) }, [pathname])
  const enlaces = SECCIONES.map((r, i) => [r ? `${BASE}/${r}` : BASE, textos[i], actual === r] as [string, string, boolean])
  return (
    <header className="mz-cab">
      <div className="mz-marco mz-cab-in">
        <Enlace to={BASE} className="mz-marca" aria-label={c.marca}>Bustamante</Enlace>
        <nav className="mz-nav" aria-label={c.principal}>
          {enlaces.map(([ruta, texto, activo]) => (
            <Enlace key={ruta} to={ruta} aria-current={activo ? 'page' : undefined}>{texto}</Enlace>
          ))}
        </nav>
        <div className="mz-cab-der">
          <Idioma clase="mz-idioma-cab" />
          <Enlace to={`${BASE}/contacto?motivo=revision`} className="mz-btn mz-btn-chico mz-cab-cta">{c.escribeme}</Enlace>
          <button ref={boton} type="button" className="mz-menu-b" aria-expanded={abierto} onClick={() => (abierto ? cerrar() : setAbierto(true))}>{abierto ? c.menu.cerrar : c.menu.abrir}</button>
        </div>
      </div>
      <i className="mz-progreso" aria-hidden="true" />
      <i className="mz-trazo-pag" aria-hidden="true" />
      {abierto && <Hoja cerrar={cerrar} enlaces={enlaces} cv={cv} />}
    </header>
  )
}

function Pie() {
  const c = useCopy()
  const { personal, intlLocale, strings: s } = useV5()
  const hora = useMedellinTime(intlLocale)
  return (
    <footer className="mz-pie">
      <div className="mz-marco">
        <div className="mz-pie-cuerpo">
          <div className="mz-pie-frase">
            <p className="mz-display">{c.pie.frase}</p>
            <a className="mz-pie-correo" href={`mailto:${personal.email}`}>{personal.email}</a>
          </div>
          <nav className="mz-pie-col" aria-label={c.pie.nav}>
            <p className="mz-etq">{c.pie.nav}</p>
            <ul>
              {SECCIONES.map((r, i) => (
                <li key={r}><Enlace to={r ? `${BASE}/${r}` : BASE}>{[c.nav.inicio, c.nav.obra, c.nav.trayectoria, c.nav.contacto][i]}</Enlace></li>
              ))}
            </ul>
          </nav>
          <div className="mz-pie-col">
            <p className="mz-etq">{c.contacto.canales}</p>
            <ul>
              <li><a href={personal.linkedin} target="_blank" rel="noopener noreferrer">{c.contacto.linkedin}</a></li>
              <li><a href={personal.github} target="_blank" rel="noopener noreferrer">{c.contacto.github}</a></li>
              <li><a href={personal.whatsappHref} target="_blank" rel="noopener noreferrer">{c.contacto.whatsapp}</a></li>
              <li><a href={personal.cv} download>{c.cv}</a></li>
            </ul>
          </div>
          <div className="mz-pie-col">
            <p className="mz-etq">{s.footer.servicesTitle}</p>
            <ul>{s.footer.services.map((x) => <li key={x}><span>{x}</span></li>)}</ul>
          </div>
        </div>
        <div className="mz-pie-legal">
          <p>{c.pie.derechos} · {c.pie.medellin} · {c.pie.hora(hora)}</p>
          <button type="button" className="mz-enlace mz-pie-arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{c.pie.arriba}</button>
        </div>
      </div>
      <p className="mz-rotulo mz-rotulo-pie" aria-hidden="true">Bustamante</p>
    </footer>
  )
}

// Dirección «Maison»: el portafolio como casa de moda. Temporadas (años), colecciones (rubros), cada tienda una pieza
// fotografiada a sangre, y en el lugar del precio, el resultado con su fuente. Lenguaje medido en Loewe, The Row y Lemaire.
export default function App() {
  const { locale } = useLanguage()
  const { personal } = useV5()
  const raiz = useRef<HTMLDivElement>(null)
  const c = useCopy()
  // Los textos de es/ja llegan en su propio chunk; hasta entonces useContent devuelve inglés. Se espera para no montar la vista dos veces.
  const listo = locale === 'en' || getContent(locale) !== en

  // El scroll es el del navegador, directo (la ficha de estilo pide scroll-behavior: auto): la escena fijada de la pasarela no puede ir con retraso.
  useLayoutEffect(() => {
    const html = document.documentElement
    html.style.backgroundColor = getComputedStyle(raiz.current!).getPropertyValue('--mz-papel')
    html.style.scrollBehavior = 'auto'
    return () => { html.style.backgroundColor = ''; html.style.scrollBehavior = '' }
  }, [])
  // El filete bajo la cabecera se llena con el scroll de la página entera (un oyente pasivo, un fotograma por ráfaga).
  useLayoutEffect(() => {
    const relleno = raiz.current?.querySelector('.mz-progreso')
    if (!raiz.current || !relleno) return
    const tl = gsap.timeline().fromTo(relleno, { scaleX: 0 }, { scaleX: 1, ease: 'none' })
    const suelta = escena(raiz.current, tl, { fijo: true, suave: 0.2 })
    return () => { suelta(); tl.kill() }
  }, [])
  // La cabecera entra con un fundido en la primera carga; las vistas traen su propia entrada.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => { gsap.from('.mz-cab-in', { opacity: 0, duration: 0.6, ease: 'maison', clearProps: 'opacity' }) }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <div className="v5-maison mz-raiz" ref={raiz}>
      <a className="mz-saltar" href="#contenido">{c.saltar}</a>
      <Cabecera cv={personal.cv} />
      {listo ? (
        <Routes>
          <Route index element={<Inicio key={locale} />} />
          <Route path="obra" element={<Obra key={locale} />} />
          <Route path="obra/:slug" element={<Ficha />} />
          <Route path="trayectoria" element={<Trayectoria key={locale} />} />
          <Route path="contacto" element={<Contacto key={locale} />} />
          <Route path="*" element={<Navigate to={BASE} replace />} />
        </Routes>
      ) : (
        <main id="contenido" className="mz-vista" aria-busy="true" />
      )}
      {listo && <Pie />}
    </div>
  )
}
