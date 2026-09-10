import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export type ScrollObjectVariant = 'luxury' | 'brutalist' | 'softui'

const Scene = lazy(() => import('./ScrollObjectScene'))

interface ScrollObjectProps {
  variant: ScrollObjectVariant
  className?: string
}

/**
 * Gate for the procedural three.js hero object (Luxury gold torus knot / Brutalist wireframed
 * dodecahedron / Soft UI matte blob). Renders nothing — leaving the theme's existing static art
 * fully visible underneath — unless ALL of: pointer+hover device (desktop, effectively excludes
 * touch/mobile), `prefers-reduced-motion: no-preference`, and the object is actually scrolled into
 * view. The three.js runtime is a separate lazily-loaded chunk (`ScrollObjectScene`) that a page
 * never downloads unless every gate above passes, so mobile/reduced-motion visitors pay zero bytes
 * for it.
 */
export function ScrollObject({ variant, className = '' }: ScrollObjectProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [everVisible, setEverVisible] = useState(false)
  const [inView, setInView] = useState(false)
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = useReducedMotion()
  const enabled = canHover && !reduced

  useEffect(() => {
    if (!enabled) return
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setEverVisible(true)
      },
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [enabled])

  return (
    // Windows Chromium sometimes promotes a WebGL canvas to a hardware "direct composition" overlay
    // that bypasses normal CSS paint order and renders above later, higher-z-index siblings — a
    // known class of bug also seen with <video>. `filter` on this wrapper forces the compositor back
    // onto the regular layer path, so ordinary z-index/isolation above it is respected again.
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ filter: 'brightness(1)' }}
      aria-hidden="true"
    >
      {enabled && everVisible && (
        <Suspense fallback={null}>
          <Scene variant={variant} active={inView} />
        </Suspense>
      )}
    </div>
  )
}
