import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { preload } from 'react-dom'
import { useLanguage } from '../../context/LanguageContext'
import { en } from '../../content/en'
import { getContent } from '../../content'
import { v5path, useV5 } from '../data'
import Contacto from './Contacto'
import { useCopy } from './copy'
import Ficha from './Ficha'
import Indice from './Indice'
import Inicio from './Inicio'
import { escena, gsap } from './motion'
import { Nav } from './Nav'
import Trayectoria from './Trayectoria'
import './tokens.css'
import './apple.css'

const CLAVE = 'v5-apple-tema'
const leerTema = () => {
  try { return localStorage.getItem(CLAVE) === 'dark' } catch { return false }
}

function Pie() {
  const c = useCopy()
  const { personal } = useV5()
  return (
    <footer className="ap-pie">
      <div className="ap-frame ap-pie-in">
        <p>© 2026 {personal.name} · {c.pie.medellin}</p>
        <p className="ap-pie-links">
          <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <button type="button" className="ap-pie-arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{c.pie.arriba}</button>
        </p>
      </div>
    </footer>
  )
}

// Dirección «Apple»: la home actual de maxfolio.dev llevada a su mejor versión, con el movimiento de una página de producto.
export default function App() {
  const c = useCopy()
  const { locale } = useLanguage()
  const { personal } = useV5()
  const [oscuro, setOscuro] = useState(leerTema)
  const raiz = useRef<HTMLDivElement>(null)
  const primera = useRef(true)
  // Los textos de es/ja llegan en su propio chunk; hasta entonces useContent devuelve inglés. Se espera para no montar la vista dos veces.
  const listo = locale === 'en' || getContent(locale) !== en

  // Inter solo se usa donde no hay SF (todo lo que no es Apple): ahí se precarga; en Mac e iOS no se pide ni un byte.
  if (typeof navigator !== 'undefined' && !/Macintosh|iPhone|iPad|iPod/.test(navigator.userAgent)) {
    preload('/fonts/apple/inter-latin-var.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  }

  useLayoutEffect(() => {
    document.documentElement.style.backgroundColor = getComputedStyle(raiz.current!).getPropertyValue('--v5-bg')
    return () => { document.documentElement.style.backgroundColor = '' }
  }, [oscuro])
  useEffect(() => {
    try { localStorage.setItem(CLAVE, oscuro ? 'dark' : 'light') } catch { /* sin almacenamiento: el tema vale para esta visita */ }
  }, [oscuro])
  // La barra baja suave en la primera carga; las vistas traen su propia entrada.
  useLayoutEffect(() => {
    if (!primera.current) return
    primera.current = false
    const ctx = gsap.context(() => { gsap.from('.ap-nav-in', { opacity: 0, y: -14, duration: 0.7, ease: 'apple', clearProps: 'transform,opacity' }) }, raiz)
    return () => ctx.revert()
  }, [])

  // Riel de progreso a la derecha (como el del vivo): un solo elemento fijo cuyo relleno sigue el scroll de la página entera.
  useLayoutEffect(() => {
    const relleno = raiz.current?.querySelector('.ap-riel i')
    if (!raiz.current || !relleno) return
    const tl = gsap.timeline().fromTo(relleno, { scaleY: 0 }, { scaleY: 1, ease: 'none' })
    const suelta = escena(raiz.current, tl, { suave: 0.2 })
    return () => { suelta(); tl.kill() }
  }, [])

  return (
    <div className="v5-apple ap-raiz" data-tema={oscuro ? 'dark' : 'light'} ref={raiz}>
      <a className="ap-saltar" href="#contenido">{c.saltar}</a>
      <div className="ap-riel" aria-hidden="true"><i /></div>
      <Nav oscuro={oscuro} alternar={() => setOscuro(!oscuro)} cv={personal.cv} />
      {listo ? (
        <Routes>
          <Route index element={<Inicio key={locale} />} />
          <Route path="obra" element={<Indice key={locale} />} />
          <Route path="obra/:slug" element={<Ficha />} />
          <Route path="trayectoria" element={<Trayectoria key={locale} />} />
          <Route path="contacto" element={<Contacto key={locale} />} />
          <Route path="*" element={<Navigate to={v5path('apple')} replace />} />
        </Routes>
      ) : (
        <main id="contenido" className="ap-vista" aria-busy="true" />
      )}
      <Pie />
    </div>
  )
}
