import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useThree } from '@react-three/fiber'
import { View } from '@react-three/drei'
import * as THREE from 'three'
import { enlazarInvalidador, fijarFase } from './estado3d'

/**
 * UN Canvas persistente para todas las piezas 3D del sitio (patrón drei `View`/`View.Port`): `position: fixed`,
 * sin eventos propios (`pointer-events: none`), un solo contexto WebGL compartido por todas las cajas. Cada
 * `<Pieza3D>` de la página es un hueco del DOM (aspect-ratio fijo) y su `<View>` recorta ahí un viewport.
 * `frameloop="demand"`: no se dibuja nada hasta que algo lo pide (scroll, resize, puntero, animaciones activas).
 * Se monta en un root de React aparte (fuera de `#root`), así el sitio y su DOM no cambian sin `?3d=1`.
 */

/** Mantiene despierto el frameloop "demand" con lo que mueve las cajas (scroll y resize) y vigila el contexto. */
function Motor() {
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const pedir = () => invalidate()
    enlazarInvalidador(pedir)
    // capture: también los scrolls de contenedores internos (el laboratorio, modales con overflow).
    addEventListener('scroll', pedir, { passive: true, capture: true })
    addEventListener('resize', pedir, { passive: true })
    visualViewport?.addEventListener('resize', pedir)
    const perdido = (e: Event) => {
      e.preventDefault()
      fijarFase('degradada', 'contexto-webgl-perdido') // póster para el resto de la sesión
    }
    gl.domElement.addEventListener('webglcontextlost', perdido)
    const info = gl.getContext().getExtension('WEBGL_debug_renderer_info')
    if (info) document.documentElement.dataset.gl3d = String(gl.getContext().getParameter(info.UNMASKED_RENDERER_WEBGL))
    return () => {
      enlazarInvalidador(undefined)
      removeEventListener('scroll', pedir, { capture: true })
      removeEventListener('resize', pedir)
      visualViewport?.removeEventListener('resize', pedir)
      gl.domElement.removeEventListener('webglcontextlost', perdido)
    }
  }, [invalidate, gl])
  return null
}

export function Escena3D({ eventSource }: { eventSource: HTMLElement }) {
  const coarse = matchMedia('(pointer: coarse)').matches
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, Math.min(coarse ? 1.5 : 2, window.devicePixelRatio || 1)]}
      resize={{ scroll: false }}
      gl={{ alpha: true, antialias: true }}
      // Paridad con Cycles (Khronos PBR Neutral); el resto del renderer es el del estudio.
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        fijarFase('lista')
      }}
      eventSource={eventSource}
      style={{ pointerEvents: 'none' }}
    >
      <Motor />
      <View.Port />
    </Canvas>
  )
}

export interface OpcionesEscena {
  /** Elemento que recibe los eventos de puntero (debe contener las cajas de las piezas). Por defecto `#root`. */
  eventSource?: HTMLElement | null
  /** z-index del Canvas: por encima del contenido (30) y por debajo del nav (z-40) y los modales (z-50+). */
  z?: number
}

export function montarEscena({ eventSource, z }: OpcionesEscena = {}) {
  const contenedor = document.createElement('div')
  contenedor.setAttribute('data-escena3d', '')
  contenedor.setAttribute('aria-hidden', 'true')
  Object.assign(contenedor.style, {
    position: 'fixed',
    inset: '0',
    zIndex: z === undefined ? 'var(--escena3d-z, 30)' : String(z),
    pointerEvents: 'none',
    // Chromium en Windows puede promover un canvas WebGL a overlay de hardware que ignora el orden de pintado CSS
    // (mismo caso documentado en ScrollObject.tsx); un `filter` neutro devuelve el canvas al camino normal del compositor.
    filter: 'brightness(1)',
  })
  document.body.appendChild(contenedor)
  const root = createRoot(contenedor)
  root.render(<Escena3D eventSource={eventSource ?? document.getElementById('root') ?? document.body} />)
  return () => {
    root.unmount()
    contenedor.remove()
  }
}
