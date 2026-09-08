import { useEffect, useMemo, useState } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useLenis } from './SmoothScroll'

export interface RailSection {
  id: string // element id without '#'
  label: string
}

interface ScrollRailProps {
  sections: RailSection[]
  dark: boolean
  /** Accent for the active tick / progress bar. */
  accent?: string
}

/**
 * The page's own scrollbar: a fixed rail on the right (pointer devices, ≥ lg) with a glass thumb that
 * follows the scroll on a spring, one tick per section, and the current section's name riding the
 * thumb; on touch/small screens it collapses to a 2px progress bar under the header. Clicking the
 * rail or a tick jumps there. Native scrollbar is hidden only where the rail is shown.
 */
export function ScrollRail({ sections, dark, accent = '#0071e3' }: ScrollRailProps) {
  const reduced = useReducedMotion()
  const lenis = useLenis()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })
  const thumbTop = useTransform(progress, (v) => `${Math.round(v * 1000) / 10}%`)
  const [active, setActive] = useState(sections[0]?.id ?? '')
  const [positions, setPositions] = useState<{ id: string; ratio: number }[]>([])

  // The native scrollbar hides only while the rail is mounted (see index.css).
  useEffect(() => {
    document.documentElement.classList.add('has-rail')
    return () => document.documentElement.classList.remove('has-rail')
  }, [])

  // Section offsets as a fraction of the scrollable height, recomputed on resize.
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      setPositions(
        sections
          .map((s) => {
            const el = document.getElementById(s.id)
            return el ? { id: s.id, ratio: Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY - 56) / max)) } : null
          })
          .filter((p): p is { id: string; ratio: number } => !!p),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [sections])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    let current = positions[0]?.id ?? ''
    for (const p of positions) if (v + 0.02 >= p.ratio) current = p.id
    if (current && current !== active) setActive(current)
  })

  const label = useMemo(() => sections.find((s) => s.id === active)?.label ?? '', [sections, active])

  const jumpTo = (ratio: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const top = ratio * max
    if (lenis) lenis.scrollTo(top, { duration: 1.1 })
    else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }
  const jumpToId = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el) // sections carry scroll-mt for the header; Lenis honors it
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  const glass = dark
    ? 'glass bg-white/[0.12] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_24px_rgba(0,0,0,0.45)]'
    : 'glass bg-white/70 border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.12)]'
  const ink = dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'
  const track = dark ? 'bg-white/10' : 'bg-black/10'

  return (
    <>
      {/* progress bar: touch / small screens */}
      <m.div
        aria-hidden="true"
        className="fixed left-0 top-11 z-40 h-[2px] w-full origin-left lg:hidden [@media(hover:hover)_and_(min-width:1024px)]:hidden"
        style={{ scaleX: progress, backgroundColor: accent }}
      />

      {/* the rail: pointer devices, ≥ lg */}
      <div
        className="scroll-rail fixed right-3 top-1/2 z-40 hidden h-[62vh] w-8 -translate-y-1/2 [@media(hover:hover)_and_(min-width:1024px)]:block"
        role="presentation"
      >
        <div
          className={`absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 cursor-pointer rounded-full ${track}`}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            jumpTo((e.clientY - r.top) / r.height)
          }}
        />
        {positions.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => jumpToId(p.id)}
            aria-label={sections.find((s) => s.id === p.id)?.label}
            className="group absolute left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center [&]:min-h-0 [&]:min-w-0"
            style={{ top: `${p.ratio * 100}%` }}
          >
            <span
              className={`block h-[7px] w-[7px] rounded-full transition-[transform,background-color] duration-200 ease-out-strong ${active === p.id ? 'scale-125' : dark ? 'bg-white/35 group-hover:bg-white/70' : 'bg-black/25 group-hover:bg-black/60'}`}
              style={active === p.id ? { backgroundColor: accent } : undefined}
            />
          </button>
        ))}
        {/* thumb */}
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center"
          style={{ top: thumbTop }}
        >
          <div className={`h-9 w-[14px] rounded-full ${glass}`} />
          <m.span
            key={label}
            initial={reduced ? false : { opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className={`absolute right-full mr-3 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium ${glass} ${ink}`}
          >
            {label}
          </m.span>
        </m.div>
      </div>
    </>
  )
}
