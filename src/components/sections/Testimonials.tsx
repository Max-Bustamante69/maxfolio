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
  const isApple = skin.frame === 'apple'
  const card = isApple ? `rounded-[22px] ${d ? 'bg-white/5' : 'bg-white shadow-tile'}` : skin.card

  const list = (
    <ul className={`grid gap-3 md:grid-cols-2 ${isApple ? 'lg:gap-4' : ''}`}>
      {testimonials.map((q, i) => {
        const store = q.storeSlug ? registry.stores.find((s) => s.slug === q.storeSlug) : undefined
        return (
          <m.li
            key={`${q.name}-${i}`}
            className={`${card} p-6 ${isApple ? 'lg:p-7' : ''}`}
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
  )

  const body = (
    <>
      {heading(t.eyebrow, t.title, t.titleAccent)}
      {list}
    </>
  )

  return (
    <section id="testimonials" className="scroll-mt-20">
      {/* Apple.tsx mounts this section directly (no wrapping `.frame` div, unlike every neighboring
          section) — own the frame here, around both the heading and the list, so a future real quote
          lands on the same content edge as the rest of the page instead of running full-bleed. Every
          other theme already wraps its own `<Testimonials>` call (were it ever used) in its own
          container, so this is gated off there. */}
      {isApple ? <div className="frame">{body}</div> : body}
    </section>
  )
}
