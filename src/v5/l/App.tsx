import './tokens.css'
import './styles.css'
import './vistas.css'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BarraMovil, Cabecera, Pie } from './Marco'
import { recuperarVista, registrarPluma } from './motion'
import Visor from './Visor'
import Inicio from './Inicio'
import Obra from './Obra'
import Ficha from './Ficha'
import Trayectoria from './Trayectoria'
import Contacto from './Contacto'
import { ruta, useL } from './ui'

export default function App() {
  const { c } = useL()
  const { pathname } = useLocation()
  const principal = useRef<HTMLElement>(null)
  const primera = useRef(true)

  useLayoutEffect(() => {
    recuperarVista()
  }, [pathname])

  // Cada vista nueva lleva el foco al contenido (sin desplazar); la primera carga no roba el foco.
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    principal.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="v5-l l-shell">
      <link rel="preload" as="font" type="font/woff2" href="/fonts/l/FamiljenGrotesk-latin.woff2" crossOrigin="anonymous" />
      <a
        className="l-skip"
        href="#l-main"
        onClick={(e) => {
          e.preventDefault()
          principal.current?.focus()
          principal.current?.scrollIntoView()
        }}
      >
        {c.nav.saltar}
      </a>
      <Cabecera />
      <main id="l-main" className="l-main" tabIndex={-1} ref={principal}>
        <div id="l-vista" className="l-vista">
          <Routes>
            <Route index element={<Inicio />} />
            <Route path="obra" element={<Obra />} />
            <Route path="obra/:slug" element={<Ficha />} />
            <Route path="trayectoria" element={<Trayectoria />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="*" element={<Navigate to={ruta()} replace />} />
          </Routes>
        </div>
      </main>
      <Pie />
      <BarraMovil />
      <Visor />
      <div className="l-pluma" ref={registrarPluma} aria-hidden="true">
        <span className="l-tel" />
        <span className="l-raya" />
      </div>
    </div>
  )
}
