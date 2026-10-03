import { useCallback, useSyncExternalStore } from 'react'

/** Media query reactiva (sin lazo: solo se vuelve a pintar cuando cambia el resultado). */
export function useMedia(consulta: string): boolean {
  const suscribir = useCallback(
    (cb: () => void) => {
      const m = window.matchMedia(consulta)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    [consulta],
  )
  return useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches, () => false)
}
