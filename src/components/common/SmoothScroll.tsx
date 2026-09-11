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
    // Two things the naive version got wrong (measured 2026-09-11 on /#experience and /#projects):
    // `window.scrollTo` ignores `scroll-margin-top`, so a section that carries one landed flush under
    // the bar; and the landing ran once, before the lazy sections ABOVE the target had mounted, so
    // every chunk that arrived afterwards pushed the target away from where the page had scrolled.
    // Now the margin is subtracted explicitly and the landing repeats on each page-height change for a
    // bounded window, unless the visitor has started scrolling on their own.
    const id = window.location.hash.slice(1)
    if (!id) return
    let cancelled = false
    const cancel = () => {
      cancelled = true
    }
    const land = () => {
      if (cancelled) return
      const target = document.getElementById(id)
      if (!target) return
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop || '0')
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - (margin > 0 ? margin : offset))
      if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: 'auto' })
    }
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('keydown', cancel)
    const frame = requestAnimationFrame(land)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => land()) : null
    observer?.observe(document.body)
    const stop = window.setTimeout(() => observer?.disconnect(), 4000)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(stop)
      observer?.disconnect()
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', cancel)
    }
  }, [offset])

  return <LenisContext.Provider value={null}>{children}</LenisContext.Provider>
}
