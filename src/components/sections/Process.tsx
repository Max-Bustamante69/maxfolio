import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useContent } from '../../hooks'
import { useLenis } from '../common'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface ProcessProps {
  skin: Skin
  heading: SectionHeading
  /** Background class of the band the section sits on; the checkpoint rings punch it out of the line. */
  canvas?: string
  /** Pinned mobile progress rail under the fixed nav (round 44 prototype, `?proposal=process-a`;
   *  round 46 lane "extras" made it the only implementation). Its offset clears Apple's h-11 (44px)
   *  mobile nav PLUS `ScrollRail`'s own 2px site-wide scroll-progress bar, which is *also* fixed at
   *  `top-11 z-40 lg:hidden` (src/components/common/ScrollRail.tsx) — stacking this rail at the same
   *  44px would draw that bar directly across this rail's top edge (caught in round-46 "extras" QA:
   *  a stray blue sliver over the dot row). Neo/Persona/Terminal use a different nav height and
   *  shape, so this defaults off and only Apple.tsx opts in. Desktop (lg:hidden) is untouched either
   *  way. */
  pinnedRail?: boolean
}

const EASE = [0.23, 1, 0.32, 1] as const
/** The step whose center is nearest this line (as a share of the viewport height) is the active one. */
const REF_LINE = 0.42

/**
 * How a store ships, as a stepper you scroll through: numbered checkpoints down a line that draws
 * itself, the active step lit by the nearest-to-reference-line rule (not scroll-progress math), and
 * on wide screens a pinned numeral that crossfades as the steps pass. Each step says what you get.
 */
export function Process({ skin, heading, canvas = '', pinnedRail = false }: ProcessProps) {
  const { strings } = useContent()
  // Luxury's `skin.accent` (#c9a962) is tuned for its own dark surfaces (7.3:1 there) — this
  // section sits on the page's light cream instead, where it measures 2.0:1 as text (Lighthouse
  // `color-contrast`, 2026-09-23). #6b5730 is a darker "text-safe" gold (6.1:1 on this section's
  // own background); scoped to this component's own accent text, not the shared token, since other
  // Luxury surfaces (Design4's dark "inverted" band) still need the brighter original.
  const accentSafe = skin.frame === 'luxury' && !skin.dark ? 'text-[#6b5730]' : skin.accent
  const lenis = useLenis()
  const reduced = useReducedMotion()
  const p = strings.sections.process
  const total = p.steps.length
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const mode = useRef<'scroll' | 'click'>('scroll')
  const sectionRef = useRef<HTMLElement>(null)
  const [railVisible, setRailVisible] = useState(false)

  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.72', 'end 0.5'] })
  const drawn = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.6 })

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const ref = window.innerHeight * REF_LINE
      let best = 0
      let bestD = Infinity
      items.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - ref)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      setActive(best)
    }
    const onScroll = () => {
      // A click holds its step until the next real scroll, which hands control back to the follower.
      if (mode.current === 'click') {
        mode.current = 'scroll'
        return
      }
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Pinned mobile rail visibility: on while any part of the section is past the fixed mobile nav +
  // ScrollRail's progress bar (44px + 2px = 46px) and hasn't yet scrolled 90% out the top — an
  // IntersectionObserver, same house pattern Apple.tsx's own nav-active tracking uses, not
  // scroll-position math.
  useEffect(() => {
    if (!pinnedRail) return
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setRailVisible(entry.isIntersecting), { rootMargin: '-46px 0px -90% 0px', threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [pinnedRail])

  const go = (i: number) => {
    mode.current = 'click'
    setActive(i)
    const el = items.current[i]
    if (!el) return
    const offset = -Math.round(window.innerHeight * REF_LINE - el.offsetHeight / 2)
    if (lenis) lenis.scrollTo(el, { offset })
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduced ? 'auto' : 'smooth' })
  }

  const num = (i: number) => String(i + 1).padStart(2, '0')
  const track = skin.dark ? 'bg-white/15' : 'bg-black/10'

  return (
    <section id="process" ref={sectionRef} className="scroll-mt-20">
      {/* Pinned progress rail (mobile only, Apple opt-in) — the desktop numeral above has no phone
          equivalent, so the step someone is reading is otherwise invisible below lg. Fixed under the
          mobile nav (44px), same active-step rule as the desktop numeral (nearest to REF_LINE),
          tapping a dot reuses the same `go` handler as the stepper below. */}
      {pinnedRail && (
        <div
          className={`fixed inset-x-0 top-[46px] z-30 border-b backdrop-blur-xl transition-opacity duration-300 lg:hidden ${skin.dark ? 'bg-black/80' : 'bg-white/80'} ${skin.line} ${railVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-hidden={!railVisible}
        >
          <div className="mx-auto flex max-w-5xl items-stretch">
            {p.steps.map((step, i) => {
              const on = active === i
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => go(i)}
                  tabIndex={railVisible ? 0 : -1}
                  aria-current={on ? 'step' : undefined}
                  aria-label={`${num(i)} · ${step.title}`}
                  className="press flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5"
                >
                  <span className={`block h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${on ? skin.accentBg : track}`} aria-hidden="true" />
                  <span className={`w-full truncate text-center text-[9px] font-medium leading-tight transition-colors duration-300 ${on ? skin.title : skin.muted}`}>{step.title}</span>
                </button>
              )
            })}
          </div>
          <div className={`h-[2px] w-full ${track}`} aria-hidden="true">
            <m.div
              className={`h-full origin-left ${skin.accentBg}`}
              animate={{ scaleX: (active + 1) / total }}
              transition={reduced ? { duration: 0 } : { duration: 0.35, ease: EASE }}
            />
          </div>
        </div>
      )}
      {heading(p.eyebrow, p.title, p.titleAccent)}
      {/* the narrative spine: the bottleneck, then the fix */}
      <div className="-mt-2 mb-12 grid max-w-4xl gap-5 md:-mt-4 md:mb-16 md:grid-cols-2 md:gap-10">
        <p className="text-lg leading-relaxed md:text-xl">
          <span className={`font-semibold ${accentSafe}`}>{p.problemLabel}</span> <span className={skin.muted}>{p.problem}</span>
        </p>
        <p className="text-lg leading-relaxed md:text-xl">
          <span className={`font-semibold ${skin.title}`}>{p.fixLabel}</span> <span className={skin.muted}>{p.fix}</span>
        </p>
      </div>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* pinned readout (wide screens) */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            {/* Crossfades on the same `key={active}` cycle, TIMED TO MATCH the numeral below exactly (was
                plain, unanimated text) — it used to update the instant `active` changed while the numeral
                was still mid-exit, so a scroll could land on a frame reading e.g. "Step 5 of 5" next to the
                still-exiting step 4's numeral and title (reported: "01" shown with "QA"). Matching durations
                isn't optional here: even a *faster* crossfade (which the title below used too) still settles
                on the new step before the numeral does, reopening the same window. */}
            <AnimatePresence mode="wait" initial={false}>
              <m.p
                key={`s-${active}`}
                className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, transition: { duration: 0.25, ease: EASE } }}
                transition={reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }}
              >
                {p.stepOf.replace('{n}', String(active + 1)).replace('{total}', String(total))}
              </m.p>
            </AnimatePresence>
            <div className="relative mt-2 h-[150px] overflow-hidden">
              {/* `mode="wait"` (matching the title's AnimatePresence below) so the outgoing numeral finishes
                  unmounting before the next one mounts — the default "sync" mode let both coexist mid-crossfade,
                  which is what let a scroll land mid-transition and read a numeral that didn't match the title
                  underneath it (reported: "01" shown with "QA"). */}
              <AnimatePresence initial={false} mode="wait">
                <m.p
                  key={active}
                  className={`absolute inset-x-0 top-0 ${skin.headingFont} text-[150px] font-semibold leading-none tracking-[-0.06em] tabular-nums`}
                  initial={reduced ? false : { opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -40, transition: { duration: 0.25, ease: EASE } }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                  aria-hidden="true"
                >
                  {num(active)}
                </m.p>
              </AnimatePresence>
            </div>
            {/* Timed to match the numeral above exactly — see the stepOf AnimatePresence comment for why. */}
            <AnimatePresence mode="wait" initial={false}>
              <m.p
                key={`t-${active}`}
                className={`${skin.title} mt-4 text-2xl`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, transition: { duration: 0.25, ease: EASE } }}
                transition={reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                aria-hidden="true"
              >
                {p.steps[active].title}
              </m.p>
            </AnimatePresence>
            <div className="mt-8 flex gap-1.5" aria-hidden="true">
              {p.steps.map((_, i) => (
                <button key={i} type="button" tabIndex={-1} onClick={() => go(i)} className="compact-touch flex h-8 flex-1 items-center" style={{ minWidth: 0 }}>
                  <span className={`block h-1 w-full rounded-full transition-colors duration-300 ${i <= active ? skin.accentBg : track}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* stepper */}
        <ol ref={listRef} className="relative lg:col-span-7">
          <span className={`absolute bottom-6 left-4 top-6 w-px -translate-x-1/2 ${track}`} aria-hidden="true" />
          <m.span className={`absolute bottom-6 left-4 top-6 w-px origin-top -translate-x-1/2 ${skin.accentBg}`} style={{ scaleY: reduced ? 1 : drawn }} aria-hidden="true" />
          {p.steps.map((step, i) => {
            const on = active === i
            return (
              <li
                key={step.title}
                ref={(el) => {
                  items.current[i] = el
                }}
                className="relative py-6 pl-14 md:py-8 md:pl-16"
                aria-current={on ? 'step' : undefined}
              >
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${num(i)} · ${step.title}`}
                  className={`compact-touch absolute left-0 top-6 flex h-8 w-8 items-center justify-center rounded-full md:top-8 ${canvas}`}
                >
                  <m.span
                    className={`block rounded-full ${on ? skin.accentBg : track}`}
                    animate={{ width: on ? 12 : 8, height: on ? 12 : 8, boxShadow: on ? `0 0 0 6px ${skin.dark ? 'rgba(41,151,255,0.18)' : 'rgba(0,102,204,0.14)'}` : '0 0 0 0px rgba(0,0,0,0)' }}
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                </button>
                {/* Inactive steps recede by color, not opacity, so every state keeps AA contrast. */}
                <div className="transition-colors duration-300">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] tabular-nums ${on ? accentSafe : skin.muted}`}>{num(i)}</p>
                  <h3 className={`mt-1 text-2xl font-semibold tracking-tight transition-colors duration-300 md:text-3xl ${on ? skin.title : skin.muted}`}>{step.title}</h3>
                  <p className={`mt-2 max-w-xl text-base leading-relaxed transition-colors duration-300 md:text-lg ${on ? '' : skin.muted}`}>{step.body}</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed">
                    <span className={`font-semibold ${on ? accentSafe : skin.muted}`}>{p.deliverableLabel}</span> <span className={skin.muted}>{step.deliverable}</span>
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
