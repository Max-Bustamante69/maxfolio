import { useEffect, useRef } from 'react'
import { preload } from 'react-dom'
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { v5path } from '../data'
import { BarraInferior, Cabecera, Pie } from './Cabecera'
import Contacto from './Contacto'
import { useCopy } from './copy'
import FichaPagina from './FichaPagina'
import Indice from './Indice'
import Inicio from './Inicio'
import Roles from './Roles'
import { leerVolver } from './sitio'
import { TransicionProvider } from './transicion'
import './tokens.css'
import './libro.css'

// Dirección A · El Libro. Las cinco vistas con <Routes> relativas a /v5/a; cualquier otra ruta vuelve al inicio.
export default function App() {
  const c = useCopy()
  const { pathname, state } = useLocation()
  const tipo = useNavigationType()
  const primera = useRef(true)
  // Solo se precarga la fuente del h1 (Archivo 800); JetBrains Mono entra por font-display: swap.
  preload('/fonts/a/archivo-800.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  // Al cambiar de vista el foco pasa al contenido, como lo haría una carga de página; al volver de una ficha (Atrás o «← Libro»),
  // a la fila de la que se salió, que sigue abierta donde se dejó.
  useEffect(() => {
    if (primera.current) { primera.current = false; return }
    const slug = state?.sitio || tipo === 'POP' ? leerVolver()?.slug : undefined
    const fila = slug ? document.querySelector<HTMLElement>(`#contenido .a-item[data-abierta][data-clave="${slug}"] .a-fila`) : null
    ;(fila ?? document.getElementById('contenido'))?.focus({ preventScroll: true })
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="v5-root v5-a">
      <a className="a-saltar" href="#contenido">{c.saltar}</a>
      <TransicionProvider>
        <Cabecera />
        <Routes>
          <Route index element={<Inicio />} />
          <Route path="obra" element={<Indice />} />
          <Route path="obra/:slug" element={<FichaPagina />} />
          <Route path="trayectoria" element={<Roles />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<Navigate to={v5path('a')} replace />} />
        </Routes>
        <Pie />
        <BarraInferior />
      </TransicionProvider>
    </div>
  )
}
