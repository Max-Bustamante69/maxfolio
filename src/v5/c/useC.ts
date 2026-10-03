import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useV5 } from '../data'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { en } from '../../content/en'
import { copy } from './copy'
import { guardarSesion, leerSesion, POR, type Por } from './datos'
import { capturarFilas } from './movimiento'

/** Datos reales (useV5) más las etiquetas de interfaz del idioma activo. El japonés cae a inglés (Q12). */
export function useC() {
  const v = useV5()
  return { ...v, t: copy[v.locale === 'es' ? 'es' : 'en'] }
}

/** La Mesa es un chunk aparte que solo se pide con intención (pasar el puntero, enfocar o tocar el botón que la abre) o al abrirla. */
export const cargarMesa = () => import('./Mesa')
export const calentarMesa = { onPointerEnter: cargarMesa, onFocus: cargarMesa, onPointerDown: cargarMesa } as const

/** Escritorio de la maqueta: la cabecera completa y la Lectura con el calco al lado. Por debajo, la Lectura es la experiencia móvil. */
export const useAncho = () => useMediaQuery('(min-width: 900px)')

/** Vista del inicio: la Lectura es el defecto en todos los viewports. La Mesa se abre con ?vista=mesa; en un escritorio con
 *  puntero fino, si el visitante la eligió en esta sesión, vuelve a abrirse (nunca en táctil: ahí siempre hay que pedirla). */
export function useVista(): 'lectura' | 'mesa' {
  const [sp] = useSearchParams()
  const fina = useMediaQuery('(min-width: 1024px) and (pointer: fine)')
  const pedida = sp.get('vista')
  if (pedida === 'mesa' || pedida === 'lectura') return pedida
  return fina && leerSesion('vista') === 'mesa' ? 'mesa' : 'lectura'
}

/** Disposición activa (?por=), con la última elegida en la sesión como defecto. Al cambiarla se fotografían las filas para reubicarlas. */
export function usePor(): [Por, (p: Por) => void] {
  const [sp, setSp] = useSearchParams()
  const pedida = sp.get('por') as Por | null
  const por: Por = pedida && POR.includes(pedida) ? pedida : ((leerSesion('por') as Por | null) ?? 'rubro')
  const poner = (p: Por) => {
    if (p === por) return
    capturarFilas()
    guardarSesion('por', p)
    setSp(
      (prev) => {
        const n = new URLSearchParams(prev)
        n.set('por', p)
        return n
      },
      { replace: true },
    )
  }
  return [POR.includes(por) ? por : 'rubro', poner]
}

/** El sitio sirve inglés mientras llega el chunk del idioma activo; pintar entonces la vista enseñaría un destello en otro idioma.
 *  Se espera a que el texto sea el del idioma (como mucho 0,7 s: con una red lenta la vista se pinta igual con lo que haya, y el LCP no espera más). */
export function useListo() {
  const { locale, strings } = useC()
  const [vencio, setVencio] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setVencio(true), 700)
    return () => clearTimeout(t)
  }, [])
  return vencio || locale === 'en' || strings.hero.positioning !== en.hero.positioning
}
