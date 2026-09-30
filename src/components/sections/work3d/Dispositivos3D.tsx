import { useEffect, useRef } from 'react'
import { Pieza3D } from '../../../three/Pieza3D'
import { useEscena3d } from '../../../three/estado3d'

/**
 * Laptop + teléfono genéricos del estudio (asset 11) con la captura REAL del producto en pantalla. Solo se descarga con
 * `?3d=1` (Products lo importa en diferido).
 *
 * La pantalla es una textura: cambiar de producto solo cambia `captura` (URL con el ASPECTO EXACTO de la pantalla,
 * 1440:900 la laptop y 390:844 el teléfono, que es justo lo que produce el pipeline de la galería: `home-desktop.webp`
 * 1200x750 y `home-mobile.webp` 780x1688). Nunca hay que tocar Blender ni el GLB.
 *
 * Los pósters de Cycles de estos dos objetos llevan la pantalla de Factores 2x2 pintada dentro: mostrarlos aquí sería
 * enseñar otra tienda bajo el nombre de este producto. Por eso su póster se oculta siempre (`.w3d-disp picture`) y el
 * «póster» de esta zona es el marco CSS de siempre con la captura real (Products lo pone debajo y lo retira cuando el 3D
 * ya dibuja). Reduced-motion, gama baja o sin WebGL2 = ese marco, exactamente como hoy.
 */

// Las cajas de las piezas se recortan a lo que dibujan (los pósters son 4:3 con mucho margen transparente, pero el
// contenido de la vista lo decide la cámara, no el póster): laptop 1.25:1, teléfono 0.62:1. Mismo `estado` y misma cámara
// que el póster de Cycles; solo cambia cuánto margen queda alrededor.
const CSS = `
.w3d-disp picture{display:none!important}
.w3d-disp [data-estado3d="3d"] div{cursor:pointer}
`

export type EstadoDispositivos = 'espera' | '3d' | 'degradada'

export interface Dispositivos3DProps {
  /** `home-desktop.webp` del producto (1440:900). */
  capturaLaptop: string
  /** `home-mobile.webp` del producto (390:844). */
  capturaTelefono: string
  /** Capturas de los otros productos: se precargan en reposo para que el cambio de pantalla sea inmediato. */
  precarga?: string[]
  /** Abre las capturas (el mismo visor que el marco CSS). */
  alAbrir: () => void
  /** Estado del 3D para que el marco CSS de debajo se retire (`3d`) o recupere su sitio (`espera`, `degradada`). */
  alEstado: (e: EstadoDispositivos) => void
}

// Referencias vivas: una imagen sin referencia puede recogerse antes de que el navegador la guarde en caché.
const precargadas = new Set<HTMLImageElement>()

export default function Dispositivos3D({ capturaLaptop, capturaTelefono, precarga = [], alAbrir, alEstado }: Dispositivos3DProps) {
  const raiz = useRef<HTMLDivElement>(null)
  const { fase } = useEscena3d()
  const degradada = fase === 'degradada'

  useEffect(() => {
    if (degradada) return alEstado('degradada')
    const el = raiz.current
    if (!el) return
    const laptop = () => el.querySelector<HTMLElement>('[data-w3d="laptop"] [data-pieza3d]')
    const leer = () => alEstado(laptop()?.dataset.estado3d === '3d' ? '3d' : 'espera')
    leer()
    // `data-estado3d` lo escribe la propia pieza: 'poster' | 'cargando' | '3d'.
    const o = new MutationObserver(leer)
    o.observe(el, { subtree: true, attributes: true, attributeFilter: ['data-estado3d'] })
    return () => {
      o.disconnect()
      alEstado('espera')
    }
  }, [degradada, alEstado])

  const clavePrecarga = precarga.join('|')
  useEffect(() => {
    // En táctil no se precargan (datos móviles): el cambio de producto espera a su captura, como el marco CSS de siempre.
    if (degradada || !clavePrecarga || matchMedia('(pointer: coarse)').matches) return
    const pedir = () => clavePrecarga.split('|').forEach((src) => {
      const img = new Image()
      img.src = src
      precargadas.add(img)
    })
    const ocioso = typeof requestIdleCallback === 'function'
    const id = ocioso ? requestIdleCallback(pedir, { timeout: 3000 }) : setTimeout(pedir, 1500)
    return () => (ocioso ? cancelIdleCallback(id as number) : clearTimeout(id as ReturnType<typeof setTimeout>))
  }, [degradada, clavePrecarga])

  if (degradada) return null
  return (
    <div ref={raiz} className="w3d-disp" onClick={alAbrir} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style href="w3d-disp" precedence="default">
        {CSS}
      </style>
      <div data-w3d="laptop" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Pieza3D slug="dispositivos" estado="laptop" captura={capturaLaptop} interactiva alt="" style={{ position: 'absolute', inset: 0, aspectRatio: '1.25 / 1', pointerEvents: 'none' }} />
      </div>
      <div style={{ position: 'absolute', left: '1.6%', top: '43.8%', height: '53%', aspectRatio: '0.62 / 1', pointerEvents: 'none' }}>
        <Pieza3D slug="dispositivos" estado="telefono" captura={capturaTelefono} interactiva alt="" style={{ position: 'absolute', inset: 0, aspectRatio: '0.62 / 1', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}
