import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface ProcessProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * How a store gets built, in five client-facing steps (the agency's build gates, said plainly).
 * A connector line draws itself as the list scrolls into view; steps stagger in.
 */
export function Process({ skin, heading }: ProcessProps) {
  const { strings } = useContent()
  const p = strings.sections.process
  const reduced = useReducedMotion()
  const d = skin.dark
  const card = skin.frame === 'apple' ? `rounded-[22px] ${d ? 'bg-white/5' : 'bg-white shadow-tile'}` : skin.card

  return (
    <section id="process" className="scroll-mt-20">
      {heading(p.eyebrow, p.title, p.titleAccent, p.lead)}
      <ol className="relative grid gap-3 md:grid-cols-5 md:gap-4">
        {/* connector: draws left → right on desktop */}
        <m.span
          aria-hidden="true"
          className={`absolute left-0 top-7 hidden h-px w-full origin-left md:block ${d ? 'bg-white/15' : 'bg-black/10'}`}
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.2, ease: EASE }}
        />
        {p.steps.map((step, i) => (
          <m.li
            key={step.title}
            className={`relative ${card} p-5`}
            initial={reduced ? false : { opacity: 0, y: 18, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
          >
            <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-semibold tabular-nums ${skin.chipOn}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className={`${skin.title} mt-3 text-base`}>{step.title}</h3>
            <p className={`${skin.muted} mt-1.5 text-sm leading-relaxed`}>{step.body}</p>
          </m.li>
        ))}
      </ol>
    </section>
  )
}
