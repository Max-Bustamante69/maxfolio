import { Suspense, lazy, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { resolver, urlPoster } from './catalogo'
import { invalidar3d, registrarCerca, useEscena3d } from './estado3d'
import { modo3dActivo } from './modo3d'
import type { Pieza3DProps, Puntero } from './tipos'

// three, R3F, drei y las gemelas viven en este chunk: solo se piden cuando la escena ya está lista y la caja está cerca.
const Vista = lazy(() => import('./Pieza3DVista'))

const srcSet = (carpeta: string, base: string, anchos: number[], ext: 'avif' | 'webp') =>
  anchos.map((w) => `${urlPoster(carpeta, base, w, ext)} ${w}w`).join(', ')

/**
 * El póster de Cycles SIEMPRE está: es lo que ven reduced-motion, gama baja, Save-Data, sin WebGL2 y el instante
 * previo al 3D. La caja tiene aspect-ratio fijo (cero CLS). Cuando la escena está lista y la caja a ≤ 1 pantalla,
 * monta una `<View>` en esa misma caja; al dibujar su primer cuadro el póster se desvanece bajo el 3D (la vista es un
 * recorte del Canvas compartido: no admite opacidad propia sin recompilar shaders, así que se desvanece el póster).
 */
export default function Pieza3DImpl(props: Pieza3DProps) {
  const {
    slug, estado, acento, interactiva = false, animar = interactiva, progreso, seleccionado, periodoPulsoMs, captura,
    className, style, alt, sizes = '600px', prioridad = false, soloPoster = false,
  } = props
  const def = useMemo(() => resolver(slug, estado, acento), [slug, estado, acento])
  const { fase } = useEscena3d()
  const caja = useRef<HTMLDivElement>(null)
  const puntero = useRef<Puntero>({ x: 0, y: 0 })
  const [montada, setMontada] = useState(false)
  const [dibujada, setDibujada] = useState(false)
  const quiere3d = modo3dActivo() && def.tiene3d && !soloPoster && fase !== 'degradada'

  // Cercanía: se monta a ≤ 1 pantalla y se libera (entorno, materiales) a > 2.5 pantallas; en medio conserva la vista.
  useEffect(() => {
    const el = caja.current
    if (!el || !quiere3d) {
      setMontada(false)
      setDibujada(false)
      return
    }
    const cerca = new IntersectionObserver(([e]) => e.isIntersecting && setMontada(true), { rootMargin: '100% 100%' })
    const lejos = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) {
        setMontada(false)
        setDibujada(false)
      }
    }, { rootMargin: '250% 250%' })
    cerca.observe(el)
    lejos.observe(el)
    return () => {
      cerca.disconnect()
      lejos.disconnect()
    }
  }, [quiere3d])
  useEffect(() => (montada ? registrarCerca() : undefined), [montada])

  // progreso: número o MotionValue (duck-typing: no hace falta importar framer-motion aquí)
  const leerProgreso = useMemo(() => {
    if (typeof progreso === 'number') return () => progreso
    if (progreso) return () => progreso.get()
    return () => 1
  }, [progreso])
  useEffect(() => {
    invalidar3d()
    return typeof progreso === 'object' ? progreso.on('change', invalidar3d) : undefined
  }, [progreso])

  const mover = (e: PointerEvent) => {
    const r = caja.current?.getBoundingClientRect()
    if (!r || !r.width) return
    puntero.current.x = ((e.clientX - r.left) / r.width) * 2 - 1
    puntero.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
    invalidar3d()
  }
  const soltar = () => {
    puntero.current.x = 0
    puntero.current.y = 0
    invalidar3d()
  }

  const { poster } = def
  const en3d = montada && dibujada && fase === 'lista'
  return (
    <div
      ref={caja}
      className={className}
      style={{ position: 'relative', aspectRatio: `${poster.w} / ${poster.h}`, ...style }}
      data-pieza3d={slug}
      data-estado3d={en3d ? '3d' : montada && fase === 'lista' ? 'cargando' : 'poster'}
      onPointerMove={interactiva && en3d ? mover : undefined}
      onPointerLeave={interactiva && en3d ? soltar : undefined}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(def.carpeta, poster.base, poster.anchos, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(def.carpeta, poster.base, poster.anchos, 'webp')} sizes={sizes} />
        <img
          src={urlPoster(def.carpeta, poster.base, poster.anchos[0], 'webp')}
          alt={alt ?? def.alt}
          width={poster.w}
          height={poster.h}
          loading={prioridad ? 'eager' : 'lazy'}
          fetchPriority={prioridad ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none',
            opacity: en3d ? 0 : 1, transition: 'opacity 450ms ease-out',
          }}
        />
      </picture>
      {montada && quiere3d && fase === 'lista' && (
        <Suspense fallback={null}>
          <Vista
            slug={slug} estado={estado} interactiva={interactiva} animar={animar} progreso={leerProgreso}
            puntero={puntero} acento={acento} seleccionado={seleccionado} periodoPulsoMs={periodoPulsoMs}
            captura={captura} onDibujada={() => setDibujada(true)}
          />
        </Suspense>
      )}
    </div>
  )
}
