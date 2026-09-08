import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
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
 * lists. Each group is one line of prose; its tools stagger in as the line scrolls into view.
 */
export function Skills({ skin, heading }: SkillsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const sk = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const chip =
    skin.frame === 'apple'
      ? `rounded-full px-3 py-1 text-[13px] font-medium md:text-sm ${skin.dark ? 'bg-white/10 text-[#f5f5f7]' : 'bg-black/[0.06] text-[#1d1d1f]'}`
      : skin.chip

  return (
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}
      <div className="max-w-4xl space-y-7 md:space-y-9">
        {groups.map((g, gi) => {
          const [before, after] = sk.narrative[g].split('{skills}')
          const tools = registry.skillGroups[g] as readonly string[]
          return (
            <m.p
              key={g}
              className="text-xl leading-[1.75] tracking-[-0.01em] md:text-[26px] md:leading-[1.8]"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: gi * 0.04, ease: EASE }}
            >
              <span className={`${skin.accent} mr-3 align-middle text-[11px] font-semibold uppercase tracking-[0.18em]`}>{sk.groups[g]}</span>
              {before}
              {tools.map((tool, i) => (
                <m.span
                  key={tool}
                  className={`${chip} mx-0.5 inline-block align-middle`}
                  initial={reduced ? false : { opacity: 0, y: 6, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.03, ease: EASE }}
                >
                  {tool}
                </m.span>
              ))}
              {after}
            </m.p>
          )
        })}
      </div>
    </section>
  )
}
