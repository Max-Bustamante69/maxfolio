import { useRef, useState } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useContent, useMediaQuery } from '../../../hooks'
import { RevealText } from '../../common'
import type { Skin } from '../../gallery'
import { timeline, WORK_KINDS, workCount, workTotal } from '../../../data/timeline'
import { CountUp } from '../../gallery/charts'
import { EASE, useHighlights, useKindMaps } from './shared'

interface Props {
  skin: Skin
}

const PIN_VH = 340

/** One digit place (1000s/100s/10s/1s) of a year value, wrapped 0–9. The ones place gets the raw
 *  continuous value so its fractional part drives the roll (2026.3 → 6.3, mid-roll between 6 and 7);
 *  every other place gets an already-rounded integer year, so it needs `floor` before `%10` — dividing
 *  2026 by 10 is 202.6, and `202.6 % 10` is 2.6, not the tens digit 2 — `floor(202.6) % 10` is. */
const digitAt = (value: number, place: number) => {
  const scaled = value / place
  const digit = place === 1 ? scaled % 10 : Math.floor(scaled) % 10
  return ((digit % 10) + 10) % 10
}

// Each digit cell is taller than the visible window (1.3em of "1em" of glyph, not 1em) — most
// numeral fonts' combined ascent+descent already exceeds a nominal 1em line box, so a tight 1em
// window lets a neighboring digit's ink bleed into the visible cell at the top/bottom edge. The
// extra 0.3em is pure buffer: both the window and each stacked cell use the same unit, so the
// translate math (a plain fraction of the stack's own height) is unaffected by the choice.
const DIGIT_CELL_EM = 1.3

/** A single rolling digit: ten stacked glyphs behind an overflow-hidden window, translated by the
 *  digit's own continuous 0–9 value — the real odometer mechanic (Google/Braun countdown pattern),
 *  not a crossfade between two numbers. */
function DigitRoller({ mv, className }: { mv: MotionValue<number>; className: string }) {
  const y = useTransform(mv, (v) => `${-(v / 10) * 100}%`)
  return (
    <span className={`relative inline-block overflow-hidden align-top ${className}`} style={{ height: `${DIGIT_CELL_EM}em` }}>
      <m.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y }}>
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="flex items-center justify-center" style={{ height: `${DIGIT_CELL_EM}em` }}>
            {d}
          </span>
        ))}
      </m.span>
    </span>
  )
}

/** The pinned, scroll-driven odometer numeral for a 4-digit year — thousands/hundreds/tens stay put
 *  across 2022–2026 (they're the same digits the whole span), only the ones place actually rolls,
 *  exactly like a real trip odometer where most wheels are still turning underneath. */
function YearOdometer({ yearFloat, className }: { yearFloat: MotionValue<number>; className: string }) {
  const d3 = useTransform(yearFloat, (v) => digitAt(Math.round(v), 1000))
  const d2 = useTransform(yearFloat, (v) => digitAt(Math.round(v), 100))
  const d1 = useTransform(yearFloat, (v) => digitAt(Math.round(v), 10))
  const d0 = useTransform(yearFloat, (v) => digitAt(v, 1))
  return (
    <span className={`inline-flex tabular-nums ${className}`} aria-hidden="true">
      <DigitRoller mv={d3} className="w-[0.62em]" />
      <DigitRoller mv={d2} className="w-[0.62em]" />
      <DigitRoller mv={d1} className="w-[0.62em]" />
      <DigitRoller mv={d0} className="w-[0.62em]" />
    </span>
  )
}

/** Static vertical fallback: reduced motion, and phones (a 5-screen scroll-pin reads janky at that
 *  size) get the same real records as a plain, animated-on-enter list instead of the pinned rig. */
function StackedYears({ skin }: { skin: Skin }) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const y = strings.sections.years
  const highlights = useHighlights()
  const { kindFill, kindLabel } = useKindMaps(skin)
  const years = [...timeline].reverse()
  return (
    <ol className={`space-y-8 border-t ${skin.line}`}>
      {years.map((entry, i) => {
        const filled = WORK_KINDS.flatMap((k) => Array.from({ length: workCount(entry, k) }, (_, u) => ({ k, u })))
        const items = highlights.get(entry.year) ?? []
        return (
          <m.li
            key={entry.year}
            className={`border-b pb-8 ${skin.line}`}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
          >
            <p className={`${skin.headingFont} text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums`}>
              <RevealText text={String(entry.year)} />
            </p>
            {y.eras[String(entry.year)] && <p className={`${skin.accent} mt-2 text-sm font-medium`}>{y.eras[String(entry.year)]}</p>}
            <div
              className="mt-4 flex h-2.5 flex-wrap content-start gap-[2px]"
              role="img"
              aria-label={`${workTotal(entry)} ${y.perYear}`}
            >
              {filled.length > 0 ? filled.map(({ k, u }) => <span key={`${k}-${u}`} className={`inline-block h-2.5 w-1.5 shrink-0 rounded-[1px] ${kindFill[k]}`} />) : <span className={`text-xs ${skin.muted}`}>—</span>}
            </div>
            {items.length > 0 && (
              <ul className="mt-4 space-y-1">
                {items.map((h) => (
                  <li key={h} className="text-sm leading-snug">
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex gap-5 text-sm">
              <span>
                <span className="font-semibold tabular-nums">{entry.positions.length}</span> <span className={skin.muted}>{y.roles}</span>
              </span>
              <span>
                <span className="font-semibold tabular-nums">{workCount(entry, 'stores')}</span> <span className={skin.muted}>{kindLabel.stores}</span>
              </span>
              <span>
                <span className="font-semibold tabular-nums">{workCount(entry, 'products')}</span> <span className={skin.muted}>{kindLabel.products}</span>
              </span>
            </div>
          </m.li>
        )
      })}
    </ol>
  )
}

/**
 * Direction A — "Odómetro": the section pins for a tall scroll track, and a giant odometer numeral
 * rolls from 2026 back to 2022 as the visitor scrolls through it, driven by real scroll progress
 * (a spring over `scrollYProgress`, not a timer). Beside it: the era line, up to three highlights, a
 * unit chart that rebuilds block by block for whichever year is active, three ticking counters
 * (roles / storefronts / products), and a vertical rail of five clickable year ticks. No trailing
 * empty scroll: the track's own height is exactly what the pin needs, and the rail can jump straight
 * to any year without scrolling through the others.
 */
export function OdometerLayout({ skin }: Props) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const c = strings.sections.chapters
  const y = strings.sections.years
  const highlights = useHighlights()
  const { kindFill, kindLabel } = useKindMaps(skin)
  const years = [...timeline].reverse() // 2026 → 2022
  const total = years.length
  const wrapRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.5 })
  const rawIndex = useTransform(smooth, [0, 1], [0, total - 1])
  const yearFloat = useTransform(rawIndex, (v) => years[0].year - v)
  const [active, setActive] = useState(0)
  useMotionValueEvent(rawIndex, 'change', (v) => {
    const clamped = Math.round(Math.max(0, Math.min(total - 1, v)))
    setActive((prev) => (prev === clamped ? prev : clamped))
  })

  const pinned = wide && !reduced

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(total - 1, i))
    const wrap = wrapRef.current
    if (!wrap) return
    const trackable = wrap.offsetHeight - window.innerHeight
    const top = wrap.offsetTop + (trackable > 0 ? (clamped / (total - 1)) * trackable : 0)
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }

  if (!pinned) {
    return <StackedYears skin={skin} />
  }

  const entry = years[active]
  const filled = WORK_KINDS.flatMap((k) => Array.from({ length: workCount(entry, k) }, (_, u) => ({ k, u })))
  const items = highlights.get(entry.year) ?? []

  return (
    <div ref={wrapRef} style={{ height: `${PIN_VH}vh` }} className="relative">
      <div className="sticky top-24 flex min-h-[70vh] items-center lg:top-28">
        <div className="grid w-full gap-10 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0">
            <div className={`${skin.headingFont} text-[20vw] font-semibold leading-none tracking-[-0.05em] md:text-[9rem]`}>
              <YearOdometer yearFloat={yearFloat} className="text-inherit" />
            </div>
            <p className="sr-only" aria-live="polite">
              {entry.year}
            </p>
            {y.eras[String(entry.year)] && <p className={`${skin.accent} mt-3 text-base font-medium`}>{y.eras[String(entry.year)]}</p>}

            <div className="mt-6 flex h-3 flex-wrap content-start gap-[2px]" role="img" aria-label={`${workTotal(entry)} ${y.perYear}`}>
              {filled.length > 0 ? (
                filled.map(({ k, u }) => (
                  <m.span
                    key={`${active}-${k}-${u}`}
                    className={`inline-block h-3 w-2 shrink-0 rounded-[1px] ${kindFill[k]}`}
                    style={{ transformOrigin: 'bottom' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.28, delay: u * 0.015, ease: EASE }}
                  />
                ))
              ) : (
                <span className={`text-xs ${skin.muted}`}>—</span>
              )}
            </div>

            {items.length > 0 && (
              <ul className="mt-5 space-y-1">
                {items.map((h) => (
                  <li key={h} className="text-base leading-snug md:text-lg">
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <CountUp key={`roles-${active}`} value={entry.positions.length} duration={0.5} className="block text-2xl font-semibold tabular-nums" />
                <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{y.roles}</p>
              </div>
              <div>
                <CountUp key={`stores-${active}`} value={workCount(entry, 'stores')} duration={0.5} className="block text-2xl font-semibold tabular-nums" />
                <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{kindLabel.stores}</p>
              </div>
              <div>
                <CountUp key={`products-${active}`} value={workCount(entry, 'products')} duration={0.5} className="block text-2xl font-semibold tabular-nums" />
                <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{kindLabel.products}</p>
              </div>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex" role="group" aria-label={c.eyebrow}>
            <div className={`relative h-48 w-0.5 overflow-hidden rounded-full ${skin.dark ? 'bg-white/15' : 'bg-black/10'}`}>
              <m.div className={`absolute inset-x-0 top-0 rounded-full ${skin.accentBg}`} style={{ height: `${((active + 1) / total) * 100}%` }} transition={{ ease: EASE }} />
            </div>
            <ol className="flex flex-col gap-3">
              {years.map((e, i) => (
                <li key={e.year}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active}
                    aria-label={e.year.toString()}
                    className={`press flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-colors duration-150 ${i === active ? `${skin.accentBg} text-white` : `${skin.muted} ${skin.dark ? 'bg-white/5' : 'bg-black/5'}`}`}
                  >
                    {String(e.year).slice(2)}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
