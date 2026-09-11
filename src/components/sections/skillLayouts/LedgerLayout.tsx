// Layout 1 — "ledger": a typographic register (Apple/Stripe spec-sheet register), not a grid of
// tiles. Groups appear as big numerals (real store count) with a one-line honest description; every
// tool is one row on a hairline with its real usage count right-aligned. No icons, no cards — the
// list flows into two columns once there is room, same as a printed ledger.
import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useSheetHistory } from '../../../hooks'
import { toolUsageById } from '../../../data/skillUsage'
import { CountUp } from '../../gallery/charts'
import { SkillsFilterBar } from './SkillsFilterBar'
import { ToolDrawer, DRAWER_ID } from './ToolDrawer'
import { useSkillsFilter } from './useSkillsFilter'
import type { SkillsLayoutProps } from './types'

/**
 * The default sub-1024px (and reduced-motion) fallback for the orbit — also selectable directly via
 * `?skills=ledger`. Carries the same filter bar as the orbit (group/surface/text, URL-shareable) and
 * opens the very same `ToolDrawer` a dot opens there (rendered as a bottom sheet under 1024px) —
 * phones and desktop share one detail surface rather than each carrying its own (2026-09-10; this
 * layout used to dock a `SkillPanel` beside the list instead). `?tool=<slug>` deep-links it open here
 * too, independently of `OrbitLayout`'s own copy of the same wiring — the two never mount together.
 */
export function LedgerLayout({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, groupNote, storesPerGroup, toolsByGroup, formatTool, formatGroup } = data
  const [openTool, setOpenTool] = useState<string | null>(null)
  const filter = useSkillsFilter(groups)
  const openToolUsage = openTool ? (toolUsageById.get(openTool) ?? null) : null
  const reduced = useReducedMotion()
  const rowTransition = reduced ? { duration: 0 } : { type: 'spring' as const, bounce: 0.15, duration: 0.4 }

  useSheetHistory(openTool, () => setOpenTool(null), {
    param: 'tool',
    open: (slug) => {
      if (toolUsageById.has(slug)) setOpenTool(slug)
    },
  })

  return (
    <div className="mt-2">
      <SkillsFilterBar skin={skin} sk={sk} groups={groups} groupLabel={groupLabel} toolsByGroup={toolsByGroup} formatGroup={formatGroup} filter={filter} />
      <div className="mt-6 sm:columns-2 sm:gap-x-12">
        {groups.map((g) => {
          const visibleCount = toolsByGroup[g].filter(filter.matchesTool).length
          // 2026-09-11: a group with nothing left showing no longer dims as a whole block — it
          // collapses down to just its header, with the numeral itself going muted and reading "0"
          // (the real total only shows once at least one of its tools is back in view).
          const groupCollapsed = filter.isActive && visibleCount === 0
          return (
            <div key={g} className="break-inside-avoid-column">
              <div className={`flex items-baseline gap-4 border-t pt-5 ${skin.line}`}>
                <p className={`text-3xl font-semibold tabular-nums leading-none md:text-4xl ${groupCollapsed ? skin.muted : skin.title}`}>
                  {groupCollapsed ? '0' : <CountUp value={storesPerGroup[g]} />}
                </p>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold uppercase tracking-[0.1em] ${skin.title}`}>{groupLabel[g]}</p>
                  <p className={`mt-0.5 text-xs leading-snug ${skin.muted}`}>{groupNote[g]}</p>
                </div>
              </div>
              <div className="mt-3 mb-6">
                {/* `layout="position"` on each surviving row: 2026-09-11 — a row that fails the filter
                    unmounts through AnimatePresence instead of just dimming — every sibling still
                    carrying `layout="position"` slides up to close the gap on its own, no separate
                    height animation needed. */}
                <AnimatePresence initial={false}>
                  {toolsByGroup[g].map((u) => {
                    if (!filter.matchesTool(u)) return null
                    const isOpen = openTool === u.tool
                    return (
                      <m.div
                        key={u.tool}
                        layout="position"
                        initial={reduced ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        transition={rowTransition}
                      >
                        <button
                          type="button"
                          aria-pressed={isOpen}
                          aria-expanded={isOpen}
                          aria-controls={DRAWER_ID}
                          aria-label={`${u.tool} — ${isOpen ? sk.orbit.collapseRow : sk.orbit.expandRow}`}
                          onClick={() => setOpenTool((prev) => (prev === u.tool ? null : u.tool))}
                          className={`flex w-full items-baseline justify-between gap-3 border-b py-2 text-left ${skin.line} ${isOpen ? skin.accent : skin.body}`}
                        >
                          <span className="truncate text-sm">{u.tool}</span>
                          <span className={`shrink-0 text-xs tabular-nums ${isOpen ? skin.accent : skin.muted}`}>{formatTool(u)}</span>
                        </button>
                      </m.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
        {/* No-matches messaging + one-click reset lives in SkillsFilterBar's own result summary line
            above, always visible — never duplicated down here. */}
      </div>
      <p className="sr-only">{sk.usage.caption}</p>

      <ToolDrawer skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} tool={openToolUsage} open={!!openTool} onClose={() => setOpenTool(null)} />
    </div>
  )
}
