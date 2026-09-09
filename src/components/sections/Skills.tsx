import { useMemo, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import type { SkillGroupId } from '../../data/registry'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface SkillsProps {
  skin: Skin
  heading: SectionHeading
  /** Overrides the usage ledger's track background, e.g. a recessed Neo groove instead of the flat tint. */
  trackClassName?: string
}

const EASE = [0.23, 1, 0.32, 1] as const

/** What to count across the store index, keyed to the labels in the locale files. */
const USAGE: { id: string; test: RegExp }[] = [
  { id: 'liquid', test: /liquid/i },
  { id: 'react', test: /react/i },
  { id: 'framer', test: /framer/i },
  { id: 'tailwind', test: /tailwind/i },
  { id: 'metaobjects', test: /metaobject/i },
  { id: 'tracking', test: /track|pixel/i },
  { id: 'bundles', test: /bundle/i },
  { id: 'quiz', test: /quiz/i },
  { id: 'reviews', test: /review/i },
  { id: 'migration', test: /woocommerce|transfer|migrat/i },
]

/**
 * The stack two ways, neither a grid of tiles: a ledger of what the fleet actually runs on (bars
 * sized by a real count over the store index), and the tools as sentences with the names set bold
 * inline. On phones the sentences become an accordion so the section costs one screen.
 */
export function Skills({ skin, heading, trackClassName }: SkillsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const sk = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const [open, setOpen] = useState<SkillGroupId>(groups[0])
  const label = `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`
  const track = trackClassName ?? (skin.dark ? 'bg-white/10' : 'bg-black/[0.06]')

  const usage = useMemo(() => {
    const rows = USAGE.map((u) => ({ id: u.id, count: registry.stores.filter((s) => s.stack.some((t) => u.test.test(t))).length }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    return { rows, max: rows[0]?.count ?? 1 }
  }, [registry.stores])

  const Sentence = ({ g }: { g: SkillGroupId }) => {
    const [before, after] = sk.narrative[g].split('{skills}')
    const tools = registry.skillGroups[g] as readonly string[]
    return (
      <>
        {before}
        {tools.map((tool, i) => (
          <span key={tool}>
            <span className={`font-semibold ${skin.title}`}>{tool}</span>
            {i < tools.length - 1 ? (i === tools.length - 2 ? <span className={skin.muted}> · </span> : <span className={skin.muted}>, </span>) : ''}
          </span>
        ))}
        {after}
      </>
    )
  }

  const Ledger = () => (
    <div>
      <p className={label}>{sk.usageLabel}</p>
      <ol className="mt-4 space-y-3">
        {usage.rows.map((r, i) => (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span>{sk.usageItems[r.id] ?? r.id}</span>
              <span className={`${skin.muted} tabular-nums`}>
                {r.count} {sk.usageUnit}
              </span>
            </div>
            <div className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${track}`}>
              <m.div
                className={`h-full rounded-full ${skin.accentBg}`}
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: EASE }}
                style={{ width: `${(r.count / usage.max) * 100}%`, transformOrigin: 'left' }}
              />
            </div>
          </li>
        ))}
      </ol>
      <p className={`${skin.muted} mt-4 text-xs leading-relaxed`}>{sk.usageNote.replace('{n}', String(registry.stores.length))}</p>
    </div>
  )

  return (
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Ledger />
        </div>

        <div className="lg:col-span-8">
          {wide ? (
            <div className="space-y-7 md:space-y-8">
              {groups.map((g, gi) => (
                <m.p
                  key={g}
                  className="text-lg leading-[1.7] tracking-[-0.01em] md:text-[22px] md:leading-[1.7]"
                  initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: gi * 0.05, ease: EASE }}
                >
                  <span className={`${skin.accent} mr-3 align-middle text-[11px] font-semibold uppercase tracking-[0.18em]`}>{sk.groups[g]}</span>
                  <span className={skin.muted}>
                    <Sentence g={g} />
                  </span>
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
                          <p className={`${skin.muted} pb-5 text-base leading-[1.7]`}>
                            <Sentence g={g} />
                          </p>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
