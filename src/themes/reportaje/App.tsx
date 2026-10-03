import { useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { preload } from 'react-dom'
import { useLanguage } from '../../context/LanguageContext'
import { en } from '../../content/en'
import { getContent } from '../../content'
import { useContent } from '../../hooks/useContent'
import { v5path } from '../data'
import Contacto from './Contacto'
import { useCopy } from './copy'
import Ficha from './Ficha'
import Inicio from './Inicio'
import { Nav, Pie, Velo } from './marco'
import { escena, gsap } from './motion'
import Obra from './Obra'
import Trayectoria from './Trayectoria'
import './tokens.css'
import './marco.css'
import './paginas.css'

// Dirección «El Reportaje»: la carrera de Max contada como un reportaje de datos de una sola edición.
export default function App() {
  const c = useCopy()
  const { locale } = useLanguage()
  const raiz = useRef<HTMLDivElement>(null)
  useContent() // suscribe la raíz a la llegada del idioma: sin esto la vista no sale del estado de espera
  // Los textos de es/ja llegan en su propio chunk; hasta entonces useContent devuelve inglés. Se espera para no montar la vista dos veces.
  const listo = locale === 'en' || getContent(locale) !== en

  // La serif de los titulares se pide ya: es lo que se ve primero.
  preload('/fonts/reportaje/newsreader-var-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

  useLayoutEffect(() => {
    document.documentElement.style.backgroundColor = getComputedStyle(raiz.current!).getPropertyValue('--paper')
    return () => { document.documentElement.style.backgroundColor = '' }
  }, [])

  // Hilo de lectura dorado en el borde alto: un solo elemento fijo cuyo trazo sigue el scroll de la página entera.
  useLayoutEffect(() => {
    const relleno = raiz.current?.querySelector('.rp-lectura')
    if (!raiz.current || !relleno) return
    const tl = gsap.timeline().fromTo(relleno, { scaleX: 0 }, { scaleX: 1, ease: 'none' })
    const suelta = escena(raiz.current, tl, { suave: 0.2 })
    return () => { suelta(); tl.kill() }
  }, [])

  return (
    <div className="v5-reportaje rp-raiz" ref={raiz}>
      <a className="rp-saltar" href="#contenido">{c.saltar}</a>
      <Nav />
      {listo ? (
        <Routes>
          <Route index element={<Inicio key={locale} />} />
          <Route path="obra" element={<Obra key={locale} />} />
          <Route path="obra/:slug" element={<Ficha />} />
          <Route path="trayectoria" element={<Trayectoria key={locale} />} />
          <Route path="contacto" element={<Contacto key={locale} />} />
          <Route path="*" element={<Navigate to={v5path('reportaje')} replace />} />
        </Routes>
      ) : (
        <main id="contenido" className="rp-vista" aria-busy="true" />
      )}
      <Pie />
      <Velo />
    </div>
  )
}
