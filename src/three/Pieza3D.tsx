import { Suspense, lazy } from 'react'
import { modo3dActivo } from './modo3d'
import type { Pieza3DProps } from './tipos'

// Puerta ligera: sin `?3d=1` devuelve null (el DOM del sitio no cambia) y NO descarga nada. Con el 3D activo
// carga la implementación (póster + IntersectionObserver) y, más tarde y solo si hace falta, three.
const Impl = lazy(() => import('./Pieza3DImpl'))

/** Proporción del póster de cada pieza, para reservar la caja mientras llega el chunk (cero CLS). */
const aspecto = (slug: string, estado?: string) =>
  slug === 'relieve-medellin' ? (estado === 'pequena' ? '600 / 429' : '1200 / 858') : '4 / 3'

/**
 * Pieza 3D del estudio obsidiana. Siempre pinta su póster (AVIF/WebP con alfa, dimensiones fijas) y, cuando la
 * escena persistente está lista, lo sustituye por el 3D en tiempo real en la misma caja.
 *
 * ```tsx
 * <Pieza3D slug="objetos-feature" estado="quiz" className="w-40" />
 * <Pieza3D slug="monograma-mb" acento="luxury" interactiva prioridad className="w-[420px]" />
 * <Pieza3D slug="orbita-tiendas" progreso={scrollYProgress} interactiva className="w-full max-w-xl" />
 * ```
 */
export function Pieza3D(props: Pieza3DProps) {
  if (!modo3dActivo() && props.sinFlag !== 'poster') return null
  return (
    <Suspense fallback={<div className={props.className} style={{ aspectRatio: aspecto(props.slug, props.estado), ...props.style }} />}>
      <Impl {...props} />
    </Suspense>
  )
}

export default Pieza3D
