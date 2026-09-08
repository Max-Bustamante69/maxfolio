import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

/** The running Lenis instance (null before mount, under reduced motion, or outside the provider). */
export const useLenis = () => useContext(LenisContext)

interface SmoothScrollProps {
  children: ReactNode
  /** Fixed-header height to keep above anchored sections. */
  offset?: number
}

/**
 * Inertial page scroll on Lenis (~10 KB gz). The window stays the scroll container, so
 * framer-motion's useScroll, scroll-snap rails and `scrollTo` keep working; anchors are routed
 * through Lenis so the nav lands smoothly under the fixed header. Off under reduced motion.
 */
export function SmoothScroll({ children, offset = 56 }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const ref = useRef<Lenis | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Construction waits for an idle frame so Lenis never sits on the cold-load critical path
    // (Lighthouse's TBT window); the page scrolls natively until then.
    let cancelled = false
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1))
    idle(() => {
      if (cancelled) return
      // Sections carry `scroll-mt` for the fixed header and Lenis honors it, so anchors need no extra offset;
      // `offset` only applies to targets without a scroll margin.
      const instance = new Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 1, anchors: true })
      ref.current = instance
      setLenis(instance)
      // Hash on load: land on the section under the header instead of behind it.
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash) as HTMLElement | null
        if (target) {
          const hasMargin = parseFloat(getComputedStyle(target).scrollMarginTop || '0') > 0
          requestAnimationFrame(() => instance.scrollTo(target, { offset: hasMargin ? 0 : -offset, immediate: true }))
        }
      }
    })
    return () => {
      cancelled = true
      ref.current?.destroy()
      ref.current = null
      setLenis(null)
    }
  }, [offset])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
