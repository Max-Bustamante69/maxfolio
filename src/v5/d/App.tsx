import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useV5, v5path } from '../data'
import { AjustesCtx } from './ajustes'
import { Barra } from './Barra'
import Contacto from './Contacto'
import Ficha from './Ficha'
import Inicio from './Inicio'
import Obra from './Obra'
import Trayectoria from './Trayectoria'
import { gsap, rutaPintada } from './movimiento'
import { useCopy } from './copy'
import './tokens.css'
import './estilos.css'

/** Pie mínimo: enlaces directos y la hora de Medellín (una vez por minuto, nunca un intervalo de 1 s). */
function Pie() {
  const c = useCopy()
  const { personal } = useV5()
  return (
    <footer className="d-pie">
      <p className="d-cap">{personal.name} · Medellín, Colombia</p>
      <nav aria-label={c.pie.enlaces} className="d-pie-enlaces">
        <a href={`mailto:${personal.email}`}>{c.contacto.correo}</a>
        <a href={personal.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={personal.cv} download>{c.pie.cv}</a>
      </nav>
    </footer>
  )
}

/** Dirección D · Aluminio (/v5/d): la ficha de un aparato. Cinco vistas con rutas relativas; los interruptores del aparato
 *  (movimiento y densidad) viven aquí porque afectan a toda la dirección; el idioma es el del sitio (LanguageContext). */
export default function App() {
  const t = useCopy()
  const { locale } = useLanguage()
  const { pathname } = useLocation()
  const [reducido, setReducido] = useState(false)
  const [compacta, setCompacta] = useState(false)
  const principal = useRef<HTMLElement>(null)
  const montado = useRef(false)
  const ajustes = useMemo(() => ({ reducido, compacta, setReducido, setCompacta }), [reducido, compacta])

  // Interruptor Movimiento: reducido = todo el movimiento de GSAP corre 50 veces más rápido (instantáneo) y se limpia al salir.
  useEffect(() => {
    gsap.globalTimeline.timeScale(reducido ? 50 : 1)
    return () => {
      gsap.globalTimeline.timeScale(1)
    }
  }, [reducido])

  // La ruta ya está en el DOM: libera a la View Transition para que capture la vista nueva.
  useLayoutEffect(() => {
    rutaPintada()
  }, [pathname])

  // Tras navegar dentro de la dirección el foco va al contenido (no al primer enlace).
  useEffect(() => {
    if (montado.current) principal.current?.focus({ preventScroll: true })
    montado.current = true
  }, [pathname])

  return (
    <AjustesCtx.Provider value={ajustes}>
      <link rel="preload" href="/fonts/d/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <div className="v5-root v5-d" lang={locale} data-mov={reducido ? 'reducido' : 'normal'} data-dens={compacta ? 'compacta' : 'comoda'}>
        <a className="d-saltar" href="#d-contenido" onClick={(e) => {
          e.preventDefault()
          principal.current?.focus()
        }}>{t.saltar}</a>
        <Barra />
        <main id="d-contenido" ref={principal} tabIndex={-1} className="d-main">
          <Routes>
            <Route index element={<Inicio />} />
            <Route path="obra" element={<Obra />} />
            <Route path="obra/:slug" element={<Ficha />} />
            <Route path="trayectoria" element={<Trayectoria />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="*" element={<Navigate to={v5path('d')} replace />} />
          </Routes>
        </main>
        <Pie />
      </div>
    </AjustesCtx.Provider>
  )
}
