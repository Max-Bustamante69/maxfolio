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
}

const EASE = [0.23, 1, 0.32, 1] as const
/** The step whose center is nearest this line (as a share of the viewport height) is the active one. */
const REF_LINE = 0.42

/**
 * How a store ships, as a stepper you scroll through: numbered checkpoints down a line that draws
 * itself, the active step lit by the nearest-to-reference-line rule (not scroll-progress math), and
 * on wide screens a pinned numeral that crossfades as the steps pass. Each step says what you get.
 */
export function Process({ skin, heading, canvas = '' }: ProcessProps) {
  const { strings } = useContent()
  const lenis = useLenis()
  const reduced = useReducedMotion()
  const p = strings.sections.process
  const total = p.steps.length
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const mode = useRef<'scroll' | 'click'>('scroll')

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
    <section id="process" className="scroll-mt-20">
      {heading(p.eyebrow, p.title, p.titleAccent)}
      {/* the narrative spine: the bottleneck, then the fix */}
      <div className="-mt-2 mb-12 grid max-w-4xl gap-5 md:-mt-4 md:mb-16 md:grid-cols-2 md:gap-10">
        <p className="text-lg leading-relaxed md:text-xl">
          <span className={`font-semibold ${skin.accent}`}>{p.problemLabel}</span> <span className={skin.muted}>{p.problem}</span>
        </p>
        <p className="text-lg leading-relaxed md:text-xl">
          <span className={`font-semibold ${skin.title}`}>{p.fixLabel}</span> <span className={skin.muted}>{p.fix}</span>
        </p>
      </div>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* pinned readout (wide screens) */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{p.stepOf.replace('{n}', String(active + 1)).replace('{total}', String(total))}</p>
            <div className="relative mt-2 h-[150px] overflow-hidden">
              <AnimatePresence initial={false}>
                <m.p
                  key={active}
                  className="absolute inset-x-0 top-0 font-sf text-[150px] font-semibold leading-none tracking-[-0.06em] tabular-nums"
                  initial={reduced ? false : { opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40, transition: { duration: 0.25, ease: EASE } }}
                  transition={{ duration: 0.45, ease: EASE }}
                  aria-hidden="true"
                >
                  {num(active)}
                </m.p>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <m.p
                key={`t-${active}`}
                className={`${skin.title} mt-4 text-2xl`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.3 }}
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
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] tabular-nums ${on ? skin.accent : skin.muted}`}>{num(i)}</p>
                  <h3 className={`mt-1 text-2xl font-semibold tracking-tight transition-colors duration-300 md:text-3xl ${on ? skin.title : skin.muted}`}>{step.title}</h3>
                  <p className={`mt-2 max-w-xl text-base leading-relaxed transition-colors duration-300 md:text-lg ${on ? '' : skin.muted}`}>{step.body}</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed">
                    <span className={`font-semibold ${on ? skin.accent : skin.muted}`}>{p.deliverableLabel}</span> <span className={skin.muted}>{step.deliverable}</span>
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
