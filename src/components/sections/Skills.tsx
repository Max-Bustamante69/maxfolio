import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import type { SkillGroupId } from '../../data/registry'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface SkillsProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The stack as sentences with the tools inline — narrative with chips, not six boxes of bullet
 * lists. On phones the six sentences become an accordion (one group open at a time), so the
 * section costs one screen instead of four.
 */
export function Skills({ skin, heading }: SkillsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const sk = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const [open, setOpen] = useState<SkillGroupId>(groups[0])
  const chip =
    skin.frame === 'apple'
      ? `rounded-full px-3 py-1 text-[13px] font-medium md:text-sm ${skin.dark ? 'bg-white/10 text-[#f5f5f7]' : 'bg-black/[0.06] text-[#1d1d1f]'}`
      : skin.chip

  const Sentence = ({ g, animate }: { g: SkillGroupId; animate: boolean }) => {
    const [before, after] = sk.narrative[g].split('{skills}')
    const tools = registry.skillGroups[g] as readonly string[]
    return (
      <>
        {before}
        {tools.map((tool, i) => (
          <m.span
            key={tool}
            className={`${chip} mx-0.5 inline-block align-middle`}
            initial={reduced || !animate ? false : { opacity: 0, y: 6, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.03, ease: EASE }}
          >
            {tool}
          </m.span>
        ))}
        {after}
      </>
    )
  }

  return (
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      {wide ? (
        <div className="max-w-4xl space-y-7 md:space-y-9">
          {groups.map((g, gi) => (
            <m.p
              key={g}
              className="text-xl leading-[1.75] tracking-[-0.01em] md:text-[26px] md:leading-[1.8]"
              initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: gi * 0.05, ease: EASE }}
            >
              <span className={`${skin.accent} mr-3 align-middle text-[11px] font-semibold uppercase tracking-[0.18em]`}>{sk.groups[g]}</span>
              <Sentence g={g} animate />
            </m.p>
          ))}
        </div>
      ) : (
        <div className={`border-t ${skin.line}`}>
          {groups.map((g) => {
            const on = open === g
            const count = registry.skillGroups[g].length
            return (
              <div key={g} className={`border-b ${skin.line}`}>
                <button type="button" aria-expanded={on} aria-controls={`skills-${g}`} onClick={() => setOpen(g)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                  <span className={`${on ? skin.title : skin.muted} text-lg font-semibold transition-colors`}>{sk.groups[g]}</span>
                  <span className={`${skin.muted} flex items-center gap-2 text-xs tabular-nums`}>
                    {count}
                    <m.svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" animate={{ rotate: on ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }}>
                      <path d="m4 6 4 4 4-4" />
                    </m.svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <m.div id={`skills-${g}`} key="panel" className="overflow-hidden" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                      <p className="pb-5 text-lg leading-[1.8]">
                        <Sentence g={g} animate={false} />
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
