import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface EngagementModelsProps {
  skin: Skin
  heading: SectionHeading
  /** False when the page's own non-lazy wrapper already owns `id="engagement"` (Apple.tsx, so a hash
   *  link lands before this chunk mounts) — avoids a duplicate id in the DOM. Defaults true so any
   *  other caller keeps working without a wrapper. */
  ownId?: boolean
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * "How we could work together" — three one-line cards, one per engagement model (free review,
 * project build, ongoing collaboration), between Review and FAQ. Every `models[].body` restates a
 * fact already stated elsewhere on this page (the hero's "no pitch, no contract", the FAQ's written
 * window and QA run, the FAQ's "you keep the editor and the content") — nothing invented, no prices.
 *
 * Round 44 prototyped this behind `?proposal=models-a|b`: direction A drew a relationship diagram
 * between the three models, direction B struck through "what a generic agency does" against what
 * this practice does instead. Max picked B's card mechanic but cut the strike-through contrast — it
 * reads as fighting agencies while he runs one — so this component keeps the one-line card shape and
 * states positively what each model gives.
 */
export function EngagementModels({ skin, heading, ownId = true }: EngagementModelsProps) {
  const { strings } = useContent()
  const reduced = !!useReducedMotion()
  const e = strings.sections.engagement

  return (
    <section id={ownId ? 'engagement' : undefined} className="scroll-mt-20">
      {heading(e.eyebrow, e.title, e.titleAccent, e.lead)}
      <ul className="grid gap-4 md:grid-cols-3">
        {e.models.map((model, i) => (
          <m.li
            key={model.title}
            className={`${skin.card} p-6`}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
          >
            <h3 className={`text-lg font-semibold tracking-tight ${skin.title}`}>{model.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed md:text-base ${skin.muted}`}>{model.body}</p>
          </m.li>
        ))}
      </ul>
    </section>
  )
}
