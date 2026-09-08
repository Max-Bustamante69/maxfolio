import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { testimonials } from '../../data/testimonials'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface TestimonialsProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const

/** Attributed quotes. Absent from the page until `src/data/testimonials.ts` holds a real one. */
export function Testimonials({ skin, heading }: TestimonialsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  if (testimonials.length === 0) return null
  const t = strings.sections.testimonials
  const d = skin.dark
  const card = skin.frame === 'apple' ? `rounded-[22px] ${d ? 'bg-white/5' : 'bg-white shadow-tile'}` : skin.card

  return (
    <section id="testimonials" className="scroll-mt-20">
      {heading(t.eyebrow, t.title, t.titleAccent)}
      <ul className="grid gap-3 md:grid-cols-2">
        {testimonials.map((q, i) => {
          const store = q.storeSlug ? registry.stores.find((s) => s.slug === q.storeSlug) : undefined
          return (
            <m.li
              key={`${q.name}-${i}`}
              className={`${card} p-6`}
              initial={reduced ? false : { opacity: 0, y: 18, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            >
              <blockquote className="text-lg leading-relaxed">“{q.quote}”</blockquote>
              <footer className={`${skin.muted} mt-4 text-sm`}>
                <span className={skin.title}>{q.name}</span> · {q.role}, {q.company}
                {store && <> · {store.name}</>}
              </footer>
            </m.li>
          )
        })}
      </ul>
    </section>
  )
}
