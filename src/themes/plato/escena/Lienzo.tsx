import { useEffect, useRef } from 'react'
import { control } from './control'
import { crearMundo } from './mundo'

/**
 * El único Canvas de Plató. El <canvas> se crea y se retira a mano: un contexto WebGL perdido (el montaje doble de StrictMode, un cambio de
 * ruta) no se puede reabrir sobre el mismo elemento. Mantiene el mundo del tamaño de su capa y lo suelta al desmontar; el mundo se
 * despierta con el objetivo que escriben las vistas (control) y no pide fotogramas mientras nada se mueve.
 */
export default function Lienzo({ alListo, alFallo }: { alListo: () => void; alFallo: () => void }) {
  const cont = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    cont.current!.appendChild(canvas)
    let mundo: ReturnType<typeof crearMundo>
    try {
      mundo = crearMundo(canvas, { alListo, alFallo })
    } catch {
      canvas.remove()
      alFallo()
      return
    }
    const ro = new ResizeObserver(() => mundo.tam(canvas.clientWidth, canvas.clientHeight))
    ro.observe(canvas)
    const off = control.subscribe(mundo.pedir)
    mundo.pedir()
    return () => { off(); ro.disconnect(); mundo.dispose(); canvas.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <div ref={cont} className="pl-escena" />
}
