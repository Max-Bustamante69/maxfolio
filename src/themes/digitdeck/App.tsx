// Dirección «A la manera de Digitdeck»: las cinco vistas con <Routes> relativas a /v5/digitdeck; cualquier otra ruta vuelve al inicio.
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { v5path } from '../data'
import { useCopy } from './copy'
import Contacto from './Contacto'
import Entrada from './Entrada'
import Ficha from './Ficha'
import Inicio from './Inicio'
import { Cabecera, Cursor, Fab, Pie } from './Marco'
import Obra from './Obra'
import Trayectoria from './Trayectoria'
import { TransicionProvider } from './transicion'
import './tokens.css'
import './estilos.css'

export default function App() {
  const c = useCopy()
  const { pathname } = useLocation()
  // El disco del botón nace en el punto por donde entra el puntero (--ox/--oy): se escribe solo al entrar, nunca al moverse.
  useEffect(() => {
    const entra = (e: PointerEvent) => {
      const b = (e.target as Element).closest<HTMLElement>('.dd-boton')
      if (!b || b.contains(e.relatedTarget as Node | null)) return
      const r = b.getBoundingClientRect()
      b.style.setProperty('--ox', `${e.clientX - r.left}px`)
      b.style.setProperty('--oy', `${e.clientY - r.top}px`)
    }
    addEventListener('pointerover', entra, { passive: true })
    return () => removeEventListener('pointerover', entra)
  }, [])
  return (
    <div className="v5-digitdeck">
      <TransicionProvider>
        <a className="dd-saltar" href="#main-content">{c.saltar}</a>
        <Entrada />
        <Cabecera />
        <Routes>
          <Route index element={<Inicio />} />
          <Route path="obra" element={<Obra />} />
          <Route path="obra/:slug" element={<Ficha />} />
          <Route path="trayectoria" element={<Trayectoria />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<Navigate to={v5path('digitdeck')} replace />} />
        </Routes>
        <Pie />
        {!pathname.endsWith('/contacto') && <Fab />}
        <Cursor />
      </TransicionProvider>
    </div>
  )
}
