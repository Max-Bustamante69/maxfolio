import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, m, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import { RevealText } from '../common'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { WORK_KINDS, timeline, workCount, workTotal, type WorkKind } from '../../data/timeline'
import { CountUp } from '../gallery/charts'

interface ChaptersProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const
const PIN_VH = 340

/** The year-strip pill's idle text sits on the pill's own faint fill (`bg-black/5` light / `bg-white/5`
 *  dark), not the page background `skin.muted` was tuned against. Apple light's shared `#6e6e73`
 *  measures 4.37:1 there (Lighthouse `color-contrast`, 2026-09-24 audit) — short of AA's 4.5:1 for
 *  this 11px label. Same local-override value as MetricCard.tsx/SkillPanel.tsx's own Apple-light fix
 *  (`#5c5c62`, measured 5.73:1 on this pill); this component only ever renders for Apple today, so
 *  every other frame keeps `skin.muted` unchanged.
 */
function yearPillMuted(skin: Skin): string {
  return skin.frame === 'apple' && !skin.dark ? 'text-[#5c5c62]' : skin.muted
}

/** Up to 3 real, named things that touched a year — stores first (the most concrete build), then roles, then products. */
function useHighlights() {
  const { strings, registry } = useContent()
  return useMemo(() => {
    const out = new Map<number, string[]>()
    for (const entry of timeline) {
      const items: string[] = []
      for (const s of entry.stores) {
        if (items.length >= 3) break
        items.push(s.name)
      }
      for (const p of entry.positions) {
        if (items.length >= 3) break
        items.push(`${strings.experience[p.id].title} · ${p.company}`)
      }
      for (const p of entry.products) {
        if (items.length >= 3) break
        items.push(p.name)
      }
      out.set(entry.year, items)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry, strings])
}

/** One accent, four opacity strengths, so a unit block reads as "the same accent, this kind of work" everywhere it appears (Years.tsx uses the identical map). */
function useKindMaps(skin: Skin) {
  const { strings } = useContent()
  const y = strings.sections.years
  const kindFill: Record<WorkKind, string> = { stores: skin.accentBg, work: `${skin.accentBg} opacity-70`, products: `${skin.accentBg} opacity-45`, personal: `${skin.accentBg} opacity-25` }
  const kindLabel: Record<WorkKind, string> = { stores: y.shipped, work: y.work, products: y.products, personal: y.side }
  return { kindFill, kindLabel }
}

/** Slow near a whole digit (0 and 1), fast through the middle — a plain smoothstep. Applied to a
 *  digit's fractional roll position so the numeral rests on a fully-formed glyph for most of the
 *  scroll distance and only "flips" quickly through the empty gutter between two stacked digit
 *  cells (see DIGIT_CELL_EM below for why that gutter exists at all): the same rest-then-flip motion
 *  a real mechanical counter wheel has, weighted by momentum, never a bare linear reveal. */
function easeDigitRoll(v: number): number {
  const whole = Math.floor(v)
  const frac = v - whole
  return whole + frac * frac * (3 - 2 * frac)
}

/** One digit place (1000s/100s/10s/1s) of a year value, wrapped 0–9 and passed through
 *  `easeDigitRoll`. The ones place gets the raw continuous value so its fractional part drives the
 *  roll (2026.3 → 6.3, mid-roll between 6 and 7); every other place gets an already-rounded integer
 *  year, so it needs `floor` before `%10` — dividing 2026 by 10 is 202.6, and `202.6 % 10` is 2.6, not
 *  the tens digit 2 — `floor(202.6) % 10` is. Those three places never actually have a fractional part
 *  in this timeline (2022–2026 shares the same thousands/hundreds/tens), so easing is a no-op for
 *  them today; it only starts mattering, correctly, the day a future year crosses a tens boundary. */
const digitAt = (value: number, place: number) => {
  const scaled = value / place
  const digit = place === 1 ? scaled % 10 : Math.floor(scaled) % 10
  return easeDigitRoll(((digit % 10) + 10) % 10)
}

// Each digit cell is taller than the visible window (1.3em of "1em" of glyph, not 1em) — most
// numeral fonts' combined ascent+descent already exceeds a nominal 1em line box, so a tight 1em
// window lets a neighboring digit's ink bleed into the visible cell at the top/bottom edge. The
// extra 0.3em is pure buffer: both the window and each stacked cell use the same unit, so the
// translate math (a plain fraction of the stack's own height) is unaffected by the choice. That
// buffer is exactly what `easeDigitRoll` above and the edge mask below exist to hide: without them
// a scroll-linked linear roll spends a visible fraction of every digit change showing nothing but
// blank gutter, top glyph gone, bottom glyph not yet in — "loose" digits, not a mechanical roll.
const DIGIT_CELL_EM = 1.3
const DIGIT_MASK = 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)'

/** A single rolling digit: ten stacked glyphs behind an overflow-hidden window, translated by the
 *  digit's own continuous 0–9 value — the real odometer mechanic (Google/Braun countdown pattern),
 *  not a crossfade between two numbers. Fixed-width, tabular figures so all four columns line up
 *  glyph to glyph regardless of which digits are showing, and a soft top/bottom mask instead of a
 *  hard clip so a glyph entering or leaving the window fades instead of guillotining. */
function DigitRoller({ mv, className }: { mv: MotionValue<number>; className: string }) {
  const y = useTransform(mv, (v) => `${-(v / 10) * 100}%`)
  return (
    <span
      className={`relative inline-block overflow-hidden text-center align-top tabular-nums ${className}`}
      style={{ height: `${DIGIT_CELL_EM}em`, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: "'tnum' 1, 'lnum' 1", maskImage: DIGIT_MASK, WebkitMaskImage: DIGIT_MASK }}
    >
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
  // The anti-bleed gutter between two stacked digits (see DIGIT_CELL_EM) has no ink in it by
  // construction — no amount of easing removes that, only shortens how long a frame can land there.
  // A fast-scrolling visitor can still catch one. A real spinning wheel photographed at that instant
  // reads as motion blur, never as a crisp disconnected fragment — so blur here, scaled by how fast
  // the numeral is actually moving (raw px/s off the year value, not a fixed decorative amount), and
  // zero at rest: the ones digit is sharp whenever it's still enough to matter for reading it.
  const velocity = useVelocity(yearFloat)
  const blurPx = useTransform(velocity, (v) => Math.min(2.2, Math.abs(v) * 0.22))
  const filter = useTransform(blurPx, (b) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none'))
  return (
    <m.span className={`inline-flex tabular-nums ${className}`} style={{ filter }} aria-hidden="true">
      <DigitRoller mv={d3} className="w-[0.62em]" />
      <DigitRoller mv={d2} className="w-[0.62em]" />
      <DigitRoller mv={d1} className="w-[0.62em]" />
      <DigitRoller mv={d0} className="w-[0.62em]" />
    </m.span>
  )
}

/** Static vertical fallback: reduced motion, and phones (a several-screen scroll-pin reads janky and
 *  can trap the scroll gesture at that size) get the same real records as a plain, animated-on-enter
 *  list instead of the pinned rig. */
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
            <div className="mt-4 flex h-2.5 flex-wrap content-start gap-[2px]" role="img" aria-label={`${workTotal(entry)} ${y.perYear}`}>
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
 * "Chapters": the same per-year records as Years.tsx (registry-derived, nothing hand-typed). On
 * desktop the section pins for a tall scroll track and a giant odometer numeral rolls from 2026 back
 * to 2022 as the visitor scrolls through it, driven by real scroll progress (a spring over
 * `scrollYProgress`, not a timer) — the era line, up to three highlights, a unit chart that rebuilds
 * block by block for whichever year is active, three ticking counters (roles / storefronts /
 * products), and a vertical rail of five clickable year ticks sit beside it. No trailing empty
 * scroll: the track's own height is exactly what the pin needs, and the rail can jump straight to any
 * year without scrolling through the others.
 *
 * Below 768px the pin is skipped entirely — several screens of pinned scroll reads janky at phone
 * size and risks trapping the scroll gesture — in favor of `StackedYears`, a plain animated-on-enter
 * list with the same records. Reduced motion gets the same static fallback.
 */
export function Chapters({ skin, heading }: ChaptersProps) {
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

  // The numeral follows `rawIndex` directly while the visitor is actively scrolling, but once
  // scrolling stops it snaps to the nearest whole year over a short spring. Without this, resting
  // scroll position (this pinned section exists precisely so people can pause and read the era/
  // highlights beside it) leaves the ones-digit roller frozen mid-flip — a real odometer's wheels
  // always come to rest aligned, never frozen between two numbers.
  const displayIndex = useMotionValue(rawIndex.get())
  // `rawIndex` keeps emitting 'change' events for as long as ITS OWN backing spring (`smooth`) is
  // still converging — that has nothing to do with whether the visitor is still scrolling. Forwarding
  // it unconditionally would fight the snap spring below forever (each rawIndex frame re-pulls
  // displayIndex toward the raw fractional target right after we start animating it to an integer),
  // so forwarding is gated off for as long as we're in "settled" mode.
  const followingRawRef = useRef(true)
  useMotionValueEvent(rawIndex, 'change', (v) => {
    if (!reduced && followingRawRef.current) displayIndex.set(v)
  })
  // `active` (era, highlights, unit chart, counters, the sidebar tick) is derived from `displayIndex`
  // — the SAME value the giant numeral reads — never from `rawIndex` directly. Two independent
  // roundings of two values that can differ by a frame or a fraction (one is a live physics spring,
  // the other a snap-settled one) previously let the numeral show one year while every other piece
  // of text on screen showed the adjacent one.
  const [active, setActive] = useState(0)
  useMotionValueEvent(displayIndex, 'change', (v) => {
    const clamped = Math.round(Math.max(0, Math.min(total - 1, v)))
    setActive((prev) => (prev === clamped ? prev : clamped))
  })
  useEffect(() => {
    if (reduced) return
    let idleTimer: ReturnType<typeof setTimeout>
    let controls: ReturnType<typeof animate> | undefined
    const settle = () => {
      idleTimer = setTimeout(() => {
        followingRawRef.current = false
        controls?.stop()
        const nearest = Math.round(displayIndex.get())
        controls = animate(displayIndex, nearest, { type: 'spring', bounce: 0, duration: 0.4 })
      }, 160)
    }
    const onScroll = () => {
      followingRawRef.current = true
      controls?.stop()
      clearTimeout(idleTimer)
      settle()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    settle()
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(idleTimer)
      controls?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])
  const yearFloat = useTransform(displayIndex, (v) => years[0].year - v)

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
    return (
      <section id="chapters" className="scroll-mt-20">
        {heading(c.eyebrow, c.title, c.titleAccent, c.lead)}
        <StackedYears skin={skin} />
      </section>
    )
  }

  const entry = years[active]
  const filled = WORK_KINDS.flatMap((k) => Array.from({ length: workCount(entry, k) }, (_, u) => ({ k, u })))
  const items = highlights.get(entry.year) ?? []

  return (
    <section id="chapters" className="scroll-mt-20">
      {heading(c.eyebrow, c.title, c.titleAccent, c.lead)}
      <div ref={wrapRef} style={{ height: `${PIN_VH}vh` }} className="relative">
        <div className="sticky top-24 flex min-h-[70vh] items-center lg:top-28">
          {/* Round 47 (1550px frame): the old `[1fr_auto]` split gave the numeral column nearly the
              whole row and let the year rail sit as a tiny content-hugging sliver right after it —
              at the old ~1024px column the leftover was easy to miss, at 1550px it read as a few
              hundred px of dead air between two small things. A proportional 12-col split bounds the
              numeral column to a sane width and hands the rail column real, guaranteed space, which
              is what lets it grow from five bare dots into an actual year index below. */}
          <div className="grid w-full items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="min-w-0 md:col-span-7">
              <div className={`${skin.headingFont} text-[20vw] font-semibold leading-none tracking-[-0.05em] md:text-[9rem] xl:text-[10rem] 2xl:text-[11rem]`}>
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

            {/* Year index — was five bare 32px dots (content-hugging, `auto` column width); now a
                real row per year (year + its era name, same data StackedYears/the mobile fallback
                already show) filling the column the 12-col split above guarantees it. The connecting
                rail no longer hardcodes a height to match the old fixed dot spacing — `self-stretch`
                inside this flex row tracks however tall five real rows turn out to be. */}
            <div className="hidden md:col-span-5 md:flex md:items-stretch md:gap-5" role="group" aria-label={c.eyebrow}>
              <div className={`relative w-0.5 shrink-0 self-stretch overflow-hidden rounded-full ${skin.dark ? 'bg-white/15' : 'bg-black/10'}`}>
                <m.div className={`absolute inset-x-0 top-0 rounded-full ${skin.accentBg}`} style={{ height: `${((active + 1) / total) * 100}%` }} transition={{ ease: EASE }} />
              </div>
              {/* `min-w-0`: this `ol` is itself a flex item of the row above (progress rail + list),
                  so it needs the same shrink override as the era span below it — otherwise ITS
                  default `min-width: auto` is what actually stops the era text from truncating,
                  regardless of the span's own `min-w-0`. */}
              <ol className="flex min-w-0 flex-1 flex-col gap-1.5">
                {years.map((e, i) => {
                  const on = i === active
                  const era = y.eras[String(e.year)]
                  return (
                    <li key={e.year}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={i === active}
                        aria-label={e.year.toString()}
                        className={`press flex w-full items-baseline gap-3 rounded-xl px-3.5 py-3 text-left transition-colors duration-200 ${on ? (skin.dark ? 'bg-white/[0.06]' : 'bg-black/[0.04]') : ''}`}
                      >
                        <span className={`shrink-0 text-xl font-semibold tabular-nums ${on ? skin.title : yearPillMuted(skin)}`}>{e.year}</span>
                        {/* `min-w-0`: a flex item's default `min-width: auto` refuses to shrink below its
                            text's intrinsic width, which silently defeats `truncate`'s ellipsis — without
                            it this era label just ran past the column at narrower (md/lg) widths instead
                            of clipping. */}
                        {era && <span className={`min-w-0 truncate text-sm ${on ? skin.accent : skin.muted}`}>{era}</span>}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
