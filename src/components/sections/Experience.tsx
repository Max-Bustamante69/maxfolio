import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { CompanyLogo } from '../common'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface ExperienceProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * Split 50/50: the roles down a hairline rail on the left (a horizontal strip on phones), one
 * editorial panel on the right — no tiles. The active marker slides between roles as a shared
 * layout element; the panel crossfades in opacity only, so switching never bounces the layout.
 */
export function Experience({ skin, heading }: ExperienceProps) {
  const { strings, registry, formatPeriod } = useContent()
  const reduced = useReducedMotion()
  const x = strings.sections.experience
  const [job, setJob] = useState(registry.experience[0])
  const t = strings.experience[job.id]

  return (
    <section id="experience" className="scroll-mt-20">
      {heading(x.eyebrow, x.title, x.titleAccent)}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* rail */}
        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:col-span-4 lg:mx-0 lg:overflow-visible lg:px-0" role="tablist" aria-label={x.eyebrow}>
          <div className={`flex gap-1 border-b lg:flex-col lg:gap-0 lg:border-b-0 lg:border-l ${skin.line}`}>
            {registry.experience.map((e) => {
              const active = job.id === e.id
              return (
                <button
                  key={e.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setJob(e)}
                  className={`press relative shrink-0 py-3 pr-4 text-left transition-colors duration-150 lg:w-full lg:py-3.5 lg:pl-5 ${active ? '' : skin.muted}`}
                >
                  {active && (
                    <m.span
                      layoutId="experience-marker"
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

        {/* panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={job.id}
              role="tabpanel"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <div className="flex items-start gap-4">
                {job.logo && (
                  <div className="h-12 w-12 shrink-0 rounded-[12px] bg-white p-1.5 shadow-[0_1px_6px_rgba(0,0,0,0.08)]">
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

              <dl className={`mt-7 flex flex-wrap gap-x-10 gap-y-4 border-y py-5 ${skin.line}`}>
                {job.metrics.map((mm) => (
                  <div key={mm.id} className="flex flex-col-reverse">
                    <dt className={`${skin.muted} mt-1 text-xs`}>{t.metricLabels[mm.id]}</dt>
                    <dd className="m-0 text-3xl font-semibold leading-none tracking-[-0.03em] tabular-nums">{mm.value}</dd>
                  </div>
                ))}
              </dl>

              <p className={`mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.accent}`}>{x.achievements}</p>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed md:text-base">
                {t.highlights.map((h, i) => (
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

              <p className={`${skin.muted} mt-6 text-sm`}>
                <span className="font-semibold">{x.technologies}:</span> {job.technologies.join(' · ')}
              </p>
              {job.website && (
                <a href={job.website} target="_blank" rel="noopener noreferrer" className={`${skin.accent} mt-4 inline-block text-sm font-medium`}>
                  {x.visit} ›
                </a>
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
