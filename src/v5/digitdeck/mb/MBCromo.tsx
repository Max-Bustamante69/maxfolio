// Puerta ligera (SIN three): pósters por capas siempre; el 3D solo en escritorio, si el equipo lo merece, la caja está cerca y el navegador está ocioso.
import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { evaluarEquipo, evaluarWebgl } from './capacidad'
import type { Capa } from './tipos'

const Escena = lazy(() => import('./MBEscena'))

export const POSTER = { letras: '/v5/digitdeck/mb/mb-letras', perla: '/v5/digitdeck/mb/mb-perla' } as const

/** Una capa del póster (letras o perla): AVIF con WebP de respaldo, con su tamaño (cero CLS). Se apilan en la misma caja 4:3. */
export function CapaPoster({ capa, prioridad = true }: { capa: Exclude<Capa, 'todo'>; prioridad?: boolean }) {
  return (
    <picture>
      <source srcSet={`${POSTER[capa]}.avif`} type="image/avif" />
      <img className="dd-mb__capa" data-capa={capa} src={`${POSTER[capa]}.webp`} width={1200} height={900} alt="" draggable={false} decoding="async" loading={prioridad ? 'eager' : 'lazy'} />
    </picture>
  )
}

interface Props {
  /** Pose de reposo, en grados. */
  yaw: number
  /** Apaga el 3D a mano: solo póster y three no se pide nunca (móvil y tableta). */
  soloPoster?: boolean
}

/** memo: un cambio de idioma vuelve a pintar el inicio entero, pero el lienzo no debe re-hornear su entorno (salía oscuro unos cuadros). */
export default memo(function MBCromo({ yaw, soloPoster = false }: Props) {
  const caja = useRef<HTMLDivElement>(null)
  const [monta, setMonta] = useState(false)
  const [dibujada, setDibujada] = useState(false)
  const alDibujar = useCallback(() => setDibujada(true), [])
  const visible = useRef(true) // ¿la caja está en pantalla? El lienzo ignora el puntero mientras no
  useEffect(() => {
    const el = caja.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => void (visible.current = e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    const el = caja.current
    if (!el || soloPoster || !evaluarEquipo().ok) return // Save-Data, 2G/3G, <4 GB, <4 núcleos = solo póster
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        if (!evaluarWebgl().ok) return // sin WebGL2 o render por software = solo póster
        const listo = () => setMonta(true)
        if ('requestIdleCallback' in window) requestIdleCallback(listo, { timeout: 900 })
        else setTimeout(listo, 250)
      },
      { rootMargin: '100% 100%' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [soloPoster])
  return (
    <div ref={caja} className="dd-mb" data-mb={dibujada ? '3d' : monta ? 'cargando' : 'poster'}>
      <CapaPoster capa="letras" />
      <CapaPoster capa="perla" />
      {monta && (
        <Suspense fallback={null}>
          <Escena yaw={yaw} animar interactiva alDibujar={alDibujar} visible={visible} />
        </Suspense>
      )}
    </div>
  )
})
