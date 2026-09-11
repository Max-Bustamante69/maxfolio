// Mobile candidate (a) — "Accordion by group": `?skillsMobile=a`. Mechanism: disclosure, not a list —
// every group starts collapsed to one header row (the first one open) and a tap expands it into a
// wrapped cloud of chips sized by real usage (bigger chip, more stores), rather than a flat scroll of
// rows (the ledger) or a spatial map (orbit/constellation). The owner's own house accordion spring
// (`{ type: 'spring', bounce: 0, duration: 0.6 }`, height only) drives the expand/collapse; filters sit
// in a sticky compact bar above so they stay reachable while the list below scrolls past them.
import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useSheetHistory } from '../../../../hooks'
import type { SkillGroupId } from '../../../../data/registry'
import { toolUsageById } from '../../../../data/skillUsage'
import { CountUp } from '../../../gallery/charts'
import { toolIcon, monogram, ToolMark } from '../../skillIcons'
import { SkillsFilterBar } from '../SkillsFilterBar'
import { ToolDrawer, DRAWER_ID } from '../ToolDrawer'
import { useSkillsFilter } from '../useSkillsFilter'
import type { SkillsLayoutProps } from '../types'

const fill = (template: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), template)

// A chip's own font-size stands in for the usage-sized "bigger chip = more stores" cloud — scaled
// per group (not globally) so every open group gets its own full visual range instead of the busiest
// group (Shopify) flattening every other group's chips to one size.
const CHIP_FONT_MIN = 11
const CHIP_FONT_MAX = 16
const sizeChipFont = (total: number, min: number, max: number) => (max === min ? Math.round((CHIP_FONT_MIN + CHIP_FONT_MAX) / 2) : Math.round(CHIP_FONT_MIN + ((total - min) / (max - min)) * (CHIP_FONT_MAX - CHIP_FONT_MIN)))

const ACCORDION_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.6 }

export function AccordionMobile({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, groupNote, storesPerGroup, toolsByGroup, formatTool, formatGroup } = data
  const reduced = useReducedMotion()
  const filter = useSkillsFilter(groups)
  const [openGroups, setOpenGroups] = useState<Set<SkillGroupId>>(() => new Set(groups.slice(0, 1)))
  const [openTool, setOpenTool] = useState<string | null>(null)
  const openToolUsage = openTool ? (toolUsageById.get(openTool) ?? null) : null

  useSheetHistory(openTool, () => setOpenTool(null), {
    param: 'tool',
    open: (slug) => {
      if (toolUsageById.has(slug)) setOpenTool(slug)
    },
  })

  const toggleGroupOpen = (g: SkillGroupId) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  return (
    <div className="mt-2">
      <div className={`sticky top-16 z-20 -mx-4 px-4 pb-3 pt-1 backdrop-blur ${skin.dark ? 'bg-black/75' : 'bg-white/85'}`}>
        <SkillsFilterBar skin={skin} sk={sk} groups={groups} groupLabel={groupLabel} toolsByGroup={toolsByGroup} formatGroup={formatGroup} filter={filter} />
      </div>

      <div className="mt-1">
        {groups.map((g) => {
          const tools = toolsByGroup[g]
          const totals = tools.map((u) => u.total)
          const min = Math.min(...totals)
          const max = Math.max(...totals)
          const visibleCount = tools.filter(filter.matchesTool).length
          const isOpen = openGroups.has(g)
          const panelId = `accordion-panel-${g}`
          return (
            <div key={g} className={`border-t ${skin.line}`}>
              <button
                type="button"
                id={`accordion-header-${g}`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={fill(isOpen ? sk.mobile.collapseGroup : sk.mobile.expandGroup, { group: groupLabel[g] })}
                onClick={() => toggleGroupOpen(g)}
                className="flex w-full items-center justify-between gap-3 py-4 text-left"
              >
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className={`text-2xl font-semibold tabular-nums leading-none ${skin.title}`}>
                    <CountUp value={storesPerGroup[g]} />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold uppercase tracking-[0.1em] ${skin.title}`}>{groupLabel[g]}</span>
                    <span className={`mt-0.5 block truncate text-xs leading-snug ${skin.muted}`}>{groupNote[g]}</span>
                  </span>
                </div>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 ${skin.muted} ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <m.div
                    id={panelId}
                    role="region"
                    aria-labelledby={`accordion-header-${g}`}
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduced ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={reduced ? { duration: 0 } : ACCORDION_SPRING}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex flex-wrap gap-2 pb-5">
                      <AnimatePresence initial={false}>
                        {tools.map((u) => {
                          if (!filter.matchesTool(u)) return null
                          const isToolOpen = openTool === u.tool
                          const fontSize = sizeChipFont(u.total, min, max)
                          return (
                            <m.button
                              key={u.tool}
                              type="button"
                              data-tool={u.tool}
                              aria-pressed={isToolOpen}
                              aria-controls={DRAWER_ID}
                              aria-label={`${u.tool} — ${formatTool(u)}`}
                              onClick={() => setOpenTool((prev) => (prev === u.tool ? null : u.tool))}
                              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                              transition={reduced ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
                              style={{ fontSize }}
                              className={`inline-flex min-h-11 items-center gap-1.5 ${isToolOpen ? skin.chipOn : skin.chip}`}
                            >
                              {toolIcon(u.tool) ? <ToolMark tool={u.tool} className="h-4 w-4 shrink-0" /> : <span className="shrink-0 text-[0.7em] font-bold">{monogram(u.tool)}</span>}
                              <span>{u.tool}</span>
                            </m.button>
                          )
                        })}
                      </AnimatePresence>
                      {visibleCount === 0 && <p className={`text-xs ${skin.muted}`}>{sk.orbit.noMatches}</p>}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <ToolDrawer skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} tool={openToolUsage} open={!!openTool} onClose={() => setOpenTool(null)} />
    </div>
  )
}
