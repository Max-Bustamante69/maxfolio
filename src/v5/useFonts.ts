import { useEffect } from 'react'

/** Carga una hoja de Google Fonts solo en la dirección que la usa (mismo patrón que useArcadeFonts: nunca en el shell). */
export function useFonts(id: string, href: string) {
  useEffect(() => {
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }, [id, href])
}
