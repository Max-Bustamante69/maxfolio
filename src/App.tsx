import { Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { LanguageProvider } from './context/LanguageContext'
import { AB, THEMES, asignar } from '../ab.config'
import ThemeRoot from './themes/Router'

// Panel privado del reparto (sin enlace, noindex, fuera del sitemap) — ver Stats.tsx.
const Stats = lazy(() => import('./pages/Stats'))

const leerCookie = () =>
  document.cookie
    .split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${AB.cookie}=`))
    ?.slice(AB.cookie.length + 1)

/** `/` en el cliente: el middleware de Vercel ya redirige en el servidor; esto cubre `vite dev`/`preview` y un fallo del edge con la misma regla. */
function Raiz() {
  const { search } = useLocation()
  const q = new URLSearchParams(search)
  const { id, fijar } = asignar(navigator.userAgent, q.get('v'), leerCookie(), Math.random())
  if (fijar) document.cookie = `${AB.cookie}=${id}; Path=/; Max-Age=${AB.maxAge}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
  q.delete('v')
  const resto = q.toString()
  return <Navigate to={`/${id}${resto ? `?${resto}` : ''}`} replace />
}

/** Las rutas de las direcciones antes de la fusión (`/v5/<tema>/…`) siguen funcionando. */
function V5Antigua() {
  const { '*': resto = '' } = useParams()
  const { search } = useLocation()
  return <Navigate to={`/${resto}${search}`} replace />
}

function App() {
  return (
    <LanguageProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Raiz />} />
          {THEMES.map((id) => (
            <Route key={id} path={`/${id}/*`} element={<ThemeRoot id={id} />} />
          ))}
          <Route path="/v5/*" element={<V5Antigua />} />
          {/* Temas retirados (2026-10-03, decisión de Max): el viejo Persona era /arcade; el resto vuelve al sorteo. */}
          <Route path="/arcade" element={<Navigate to="/persona" replace />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {/* Vercel Web Analytics por ruta: cada tema vive bajo su prefijo, así que las visitas ya salen separadas por tema. */}
      {typeof window !== 'undefined' && /(^|\.)maxfolio\.dev$|\.vercel\.app$/.test(window.location.hostname) && <Analytics />}
    </LanguageProvider>
  )
}

export default App
