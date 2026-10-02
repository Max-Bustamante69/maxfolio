import { lazy, Suspense, useMemo, type ComponentType } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import Hub from './Hub'
import './palette.css'

// Cada dirección vive entera en src/v5/<id>/ con un App.tsx (sus vistas, con <Routes> relativas) y un
// meta.ts. Se descubren por carpeta: añadir o quitar una dirección no toca este archivo.
const apps = import.meta.glob<{ default: ComponentType }>('./*/App.tsx')

function Direction() {
  const { dir = '' } = useParams()
  const load = apps[`./${dir}/App.tsx`]
  const App = useMemo(() => (load ? lazy(load) : null), [load])
  if (!App) return <Hub />
  return (
    <Suspense fallback={<div className="v5-root min-h-screen" />}>
      <App />
    </Suspense>
  )
}

export default function V5Router() {
  return (
    <Routes>
      <Route index element={<Hub />} />
      <Route path=":dir/*" element={<Direction />} />
    </Routes>
  )
}
