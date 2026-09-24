import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface FaqProps {
  skin: Skin
  heading: SectionHeading
  /** False when the page's own non-lazy wrapper already owns `id="faq"` (Apple.tsx, so a hash link
   *  lands before this chunk mounts) — avoids a duplicate id in the DOM. Defaults true so every other
   *  caller (Design4/Design1/Neo/Persona/Terminal, none of which wrap this in their own `#faq`) keeps
   *  working exactly as before. */
  ownId?: boolean
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The objections, answered right before the ask — an accordion of hairline rows, one open at a
 * time. Every answer is a fact already on this page (plans, deliverables, handoff), not a promise.
 */
export function Faq({ skin, heading, ownId = true }: FaqProps) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const f = strings.sections.faq
  const [open, setOpen] = useState(0)
  // Already the right shape at wide widths (a capped, left-aligned measure rather than a stretched
  // full-bleed accordion) — just gives it a little more room to breathe once the frame is 1550px wide.
  const isApple = skin.frame === 'apple'

  return (
    <section id={ownId ? 'faq' : undefined} className="scroll-mt-20">
      {heading(f.eyebrow, f.title, f.titleAccent)}
      <div className={`max-w-3xl border-t ${isApple ? 'lg:max-w-[52rem]' : ''} ${skin.line}`}>
        {f.items.map((item, i) => {
          const on = open === i
          return (
            <div key={item.q} className={`border-b ${skin.line}`}>
              <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} onClick={() => setOpen(on ? -1 : i)} className={`flex w-full items-start justify-between gap-6 py-5 text-left md:py-6 ${isApple ? 'lg:py-7' : ''}`}>
                <span className={`${on ? skin.title : ''} text-lg leading-snug transition-colors md:text-xl`}>{item.q}</span>
                <m.span
                  aria-hidden="true"
                  className={`${skin.muted} mt-1 flex h-6 w-6 shrink-0 items-center justify-center`}
                  animate={{ rotate: on ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </m.span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <m.div id={`faq-${i}`} key="a" className="overflow-hidden" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                    <p className={`${skin.muted} max-w-2xl pb-6 text-base leading-relaxed md:text-lg`}>{item.a}</p>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
