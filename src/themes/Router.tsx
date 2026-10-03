import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent } from 'react'
import { track } from '../lib/track'
import type { ThemeId } from './temas'
import './palette.css'

// Cada tema vive entero en src/themes/<id>/ con un App.tsx (sus vistas, con <Routes> relativas) y un meta.ts.
const apps = import.meta.glob<{ default: ComponentType }>('./*/App.tsx')

// Un lazy por tema, creado UNA vez fuera del render. Crearlo en el render (aunque sea con useMemo) rompe el cambio de tema:
// React Router navega dentro de una transición, el render nuevo suspende, React descarta el memo y cada reintento crea
// otro lazy que vuelve a suspender, así que la URL cambia y el tema viejo se queda en pantalla.
const cache = new Map<ThemeId, LazyExoticComponent<ComponentType>>()
const temaLazy = (id: ThemeId) => {
  let App = cache.get(id)
  if (!App) cache.set(id, (App = lazy(apps[`./${id}/App.tsx`])))
  return App
}
/** Descarga el código de un tema antes de cambiar a él (los selectores lo llaman al apuntar o enfocar una opción). */
export const precargarTema = (id: ThemeId) => void apps[`./${id}/App.tsx`]?.()

/**
 * Las dos métricas del reparto que no dependen del tema: una vista por carga y, una sola vez, «interacción» cuando
 * el visitante recorre la mitad de la página o pasa 30 s con la pestaña visible después de algún gesto. Sin rAF:
 * un scroll pasivo y un temporizador que se pausa con la pestaña oculta.
 */
function useMetricasDeTema(id: ThemeId) {
  useEffect(() => {
    track('theme_view', { theme: id })
    let hecho = false
    let gesto = false
    let visible = 0
    let desde = document.visibilityState === 'visible' ? performance.now() : 0
    const marcar = () => {
      if (hecho) return
      hecho = true
      track('theme_engaged', { theme: id })
      limpiar()
    }
    const alScroll = () => {
      gesto = true
      const max = document.documentElement.scrollHeight - innerHeight
      if (max > 0 && scrollY / max >= 0.5) marcar()
    }
    const alGesto = () => { gesto = true }
    const alVisibilidad = () => {
      if (document.visibilityState === 'visible') desde = performance.now()
      else if (desde) { visible += performance.now() - desde; desde = 0 }
    }
    const reloj = setInterval(() => {
      const total = visible + (desde ? performance.now() - desde : 0)
      if (gesto && total >= 30_000) marcar()
    }, 5_000)
    addEventListener('scroll', alScroll, { passive: true })
    addEventListener('pointerdown', alGesto, { passive: true })
    addEventListener('keydown', alGesto)
    document.addEventListener('visibilitychange', alVisibilidad)
    function limpiar() {
      clearInterval(reloj)
      removeEventListener('scroll', alScroll)
      removeEventListener('pointerdown', alGesto)
      removeEventListener('keydown', alGesto)
      document.removeEventListener('visibilitychange', alVisibilidad)
    }
    return limpiar
  }, [id])
}

/** Monta un tema bajo su prefijo (`/plato/*`) y mide su vista y su interacción. */
export default function ThemeRoot({ id }: { id: ThemeId }) {
  const App = temaLazy(id)
  useMetricasDeTema(id)
  return (
    <Suspense fallback={<div className="v5-root min-h-screen" />}>
      <App />
    </Suspense>
  )
}
