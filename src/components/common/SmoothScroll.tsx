import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type Lenis from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

/**
 * Always null now: the page scrolls natively. Consumers keep their `if (lenis) … else window.scrollTo`
 * branches, so the native path is the one that runs.
 */
export const useLenis = () => useContext(LenisContext)

interface SmoothScrollProps {
  children: ReactNode
  /** Fixed-header height to keep above anchored sections that carry no scroll margin. */
  offset?: number
}

/**
 * Native scroll (2026-09-09). Lenis used to drive an inertial scroll here; every "the scroll gets stuck"
 * report traced back to Lenis fighting something — the case-study sheet's own scroller, the gallery rail
 * that opted out of it and then jumped when the pointer left, chunks landing mid-scroll. The browser's own
 * scroll never has those seams, `scroll-behavior: smooth` in index.css keeps anchors gentle, and
 * framer-motion's useScroll/whileInView work on the window either way. The provider stays so nothing
 * else had to change; it simply never hands out an instance.
 */
export function SmoothScroll({ children, offset = 56 }: SmoothScrollProps) {
  useEffect(() => {
    // Hash on load: land on the section under the fixed header instead of behind it.
    if (!window.location.hash) return
    const target = document.querySelector(window.location.hash) as HTMLElement | null
    if (!target) return
    const hasMargin = parseFloat(getComputedStyle(target).scrollMarginTop || '0') > 0
    requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - (hasMargin ? 0 : offset)
      window.scrollTo({ top, behavior: 'auto' })
    })
  }, [offset])

  return <LenisContext.Provider value={null}>{children}</LenisContext.Provider>
}
