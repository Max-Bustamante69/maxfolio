// "Métricas vivas" — the Experience section's metric-card layout (round 44, direction A; picked by
// Max and promoted to the only implementation in round 46). Rendered by Experience.tsx.
//
// Mechanism: the role rail stays (same tabs, same sliding marker), but the right panel never
// unmounts on a role switch — only a small header block crossfades. The metric cards are `key`'d by
// GRID POSITION, not by metric id, so each card's CountUp instance survives the switch and its
// internal motion value ticks from the old role's number straight to the new one; there is no blank
// frame because nothing in the metrics row ever unmounts. "What shipped" shows the first three
// bullets and expands the rest in place with the house drawer/expand spring. The role rail gets a
// scroll-snap + right edge fade on phones so it reads as "more roles this way".
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../../hooks'
import { CompanyLogo } from '../../common'
import type { Skin } from '../../gallery'
import { onRequestRole, scrollToSection } from '../../../lib/sectionLinks'
import { MetricCard } from './MetricCard'

const EASE = [0.23, 1, 0.32, 1] as const
const EXPAND_SPRING = { type: 'spring', bounce: 0, duration: 0.6 } as const
const SHOWN_BULLETS = 3

interface MetricsAliveProps {
  skin: Skin
}

export function MetricsAlive({ skin }: MetricsAliveProps) {
  const { strings, registry, formatPeriod } = useContent()
  const reduced = useReducedMotion()
  const x = strings.sections.experience
  const [job, setJob] = useState(registry.experience[0])
  const [expanded, setExpanded] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)
  const t = strings.experience[job.id]

  useEffect(
    () =>
      onRequestRole(({ id }) => {
        const role = registry.experience.find((e) => e.id === id)
        if (!role) return
        scrollToSection('experience')
        setJob(role)
      }),
    [registry.experience],
  )

  useEffect(() => setExpanded(false), [job.id])

  const selectJob = (e: typeof job) => {
    setJob(e)
    const btn = railRef.current?.querySelector<HTMLElement>(`[data-role="${e.id}"]`)
    btn?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  const bullets = t.highlights
  const alwaysShown = bullets.slice(0, SHOWN_BULLETS)
  const extra = bullets.slice(SHOWN_BULLETS)
  const hiddenCount = extra.length

  // Wide frame (round 47): the grid's default `align-items: stretch` was pulling this short rail's
  // own box down to match the taller panel's height, which just left the extra space below the last
  // role blank — no different at 1024px, but a much bigger, more obviously "empty" gap now that the
  // Apple skin's frame runs to 1550px and the panel (metrics + shipped + chips) is that much taller.
  // `self-start` lets the rail size to its own content instead of stretching, and a sticky top on top
  // of that keeps the role list in view (same `top-28` offset Process/Chapters already pin to) while
  // the panel is read — an index staying put beside its detail pane, not a column trailing off into
  // void. Apple-only: the shared grid ratio and stretch behavior stay exactly as before on every
  // other skin's narrower column, where the two sides are closer in height to begin with.
  const railSticky = skin.frame === 'apple' ? 'lg:sticky lg:top-28 lg:self-start' : ''

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* rail */}
      <div className={`relative min-w-0 -mx-4 lg:mx-0 lg:col-span-4 ${railSticky}`}>
        <div
          ref={railRef}
          className="snap-x snap-mandatory overflow-x-auto px-4 no-scrollbar max-lg:[mask-image:linear-gradient(to_right,black,black_calc(100%-28px),transparent)] max-lg:[-webkit-mask-image:linear-gradient(to_right,black,black_calc(100%-28px),transparent)] lg:overflow-visible lg:px-0"
          role="tablist"
          aria-label={x.eyebrow}
        >
          <div className={`flex gap-1 border-b lg:flex-col lg:gap-0 lg:border-b-0 lg:border-l ${skin.line}`}>
            {registry.experience.map((e) => {
              const active = job.id === e.id
              return (
                <button
                  key={e.id}
                  type="button"
                  role="tab"
                  data-role={e.id}
                  aria-selected={active}
                  onClick={() => selectJob(e)}
                  className={`press relative shrink-0 snap-start py-3 pr-4 text-left transition-colors duration-150 lg:w-full lg:py-3.5 lg:pl-5 ${active ? '' : skin.muted}`}
                >
                  {active && (
                    <m.span
                      layoutId="experience-a-marker"
                      className={`absolute bottom-0 left-0 h-0.5 w-full lg:bottom-auto lg:top-0 lg:h-full lg:w-0.5 ${skin.accentBg}`}
                      transition={reduced ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.1 }}
                    />
                  )}
                  <span className="block text-sm font-semibold leading-snug">{strings.experience[e.id].title}</span>
                  <span className={`${skin.muted} mt-0.5 block text-xs`}>
                    {e.company} · {formatPeriod(e.start, e.end)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* panel — never unmounts on role switch, so metric CountUps tick instead of resetting */}
      <m.div layout transition={reduced ? { duration: 0 } : { duration: 0.28, ease: EASE }} className="lg:col-span-8">
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            <m.div
              key={job.id}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <div className="flex items-start gap-4">
                {job.logo && (
                  <div className={`h-12 w-12 shrink-0 p-1.5 ${skin.logoChipBg} ${skin.logoChip}`}>
                    <CompanyLogo src={job.logo} alt={job.company} />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className={`${skin.title} text-2xl leading-tight md:text-3xl`}>{t.title}</h3>
                  <p className={`${skin.muted} mt-1 text-sm`}>
                    {job.company} · {job.location} · {formatPeriod(job.start, job.end)}
                    {job.end === null && <span className={`${skin.accent} ml-2 font-medium`}>· {strings.badges.current}</span>}
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">{t.summary}</p>
            </m.div>
          </AnimatePresence>

          {/* metrics — key'd by position, not by metric id, so a surviving slot ticks 0→old→new instead of remounting */}
          <div className={`mt-7 grid grid-cols-2 gap-3 border-y py-6 sm:grid-cols-3 ${skin.line}`}>
            {job.metrics.map((mm, i) => (
              <MetricCard key={i} skin={skin} id={mm.id} label={t.metricLabels[mm.id]} value={mm.value} delay={i * 0.08} />
            ))}
          </div>

          <p className={`mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.accent}`}>{x.achievements}</p>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed md:text-base">
            {alwaysShown.map((h, i) => (
              <m.li
                key={h}
                className="flex gap-3"
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease: EASE }}
              >
                <span className={`mt-[0.8em] h-px w-4 shrink-0 ${skin.accentBg}`} aria-hidden="true" />
                <span>{h}</span>
              </m.li>
            ))}
          </ul>
          <AnimatePresence initial={false}>
            {expanded && (
              <m.div
                key="extra"
                id="experience-a-shipped-extra"
                className="overflow-hidden"
                initial={reduced ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduced ? { duration: 0 } : EXPAND_SPRING}
              >
                <ul className="space-y-2.5 pt-2.5 text-sm leading-relaxed md:text-base">
                  {extra.map((h) => (
                    <li key={h} className="flex gap-3">
                      <span className={`mt-[0.8em] h-px w-4 shrink-0 ${skin.accentBg}`} aria-hidden="true" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </m.div>
            )}
          </AnimatePresence>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="experience-a-shipped-extra"
              className={`press mt-3 text-xs font-semibold ${skin.accent}`}
            >
              {expanded ? x.showLess : x.showMore.replace('{n}', String(hiddenCount))}
            </button>
          )}

          <div className="mt-7 flex flex-wrap gap-1.5">
            {job.technologies.map((tech) => (
              <span key={tech} className={skin.chip}>
                {tech}
              </span>
            ))}
          </div>
          {job.website && (
            <a href={job.website} target="_blank" rel="noopener noreferrer" className={`${skin.accent} mt-4 inline-block text-sm font-medium`}>
              {x.visit} ›
            </a>
          )}
        </div>
      </m.div>
    </div>
  )
}
