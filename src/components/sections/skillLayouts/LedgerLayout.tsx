// Layout 1 — "ledger": a typographic register (Apple/Stripe spec-sheet register), not a grid of
// tiles. Groups appear as big numerals (real store count) with a one-line honest description; every
// tool is one row on a hairline with its real usage count right-aligned. No icons, no cards — the
// list flows into two columns once there is room, same as a printed ledger.
import { useState } from 'react'
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

  useSheetHistory(openTool, () => setOpenTool(null), {
    param: 'tool',
    open: (slug) => {
      if (toolUsageById.has(slug)) setOpenTool(slug)
    },
  })

  return (
    <div className="mt-2">
      <SkillsFilterBar skin={skin} sk={sk} groups={groups} groupLabel={groupLabel} toolsByGroup={toolsByGroup} storesPerGroup={storesPerGroup} formatGroup={formatGroup} filter={filter} />
      <div className="mt-6 sm:columns-2 sm:gap-x-12">
        {groups.map((g) => {
          const visibleCount = toolsByGroup[g].filter(filter.matchesTool).length
          const groupCollapsed = filter.isActive && visibleCount === 0
          return (
            <div key={g} className={`break-inside-avoid-column transition-opacity duration-300 ${groupCollapsed ? 'opacity-30' : 'opacity-100'}`}>
              <div className={`flex items-baseline gap-4 border-t pt-5 ${skin.line}`}>
                <p className={`text-3xl font-semibold tabular-nums leading-none md:text-4xl ${skin.title}`}>
                  <CountUp value={storesPerGroup[g]} />
                </p>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold uppercase tracking-[0.1em] ${skin.title}`}>{groupLabel[g]}</p>
                  <p className={`mt-0.5 text-xs leading-snug ${skin.muted}`}>{groupNote[g]}</p>
                </div>
              </div>
              <div className="mt-3 mb-6">
                {toolsByGroup[g].map((u) => {
                  const isOpen = openTool === u.tool
                  const visible = filter.matchesTool(u)
                  return (
                    <button
                      key={u.tool}
                      type="button"
                      aria-pressed={isOpen}
                      aria-expanded={isOpen}
                      aria-controls={DRAWER_ID}
                      aria-label={`${u.tool} — ${isOpen ? sk.orbit.collapseRow : sk.orbit.expandRow}`}
                      onClick={() => setOpenTool((prev) => (prev === u.tool ? null : u.tool))}
                      className={`flex w-full items-baseline justify-between gap-3 border-b py-2 text-left transition-opacity duration-300 ${skin.line} ${isOpen ? skin.accent : skin.body} ${visible ? 'opacity-100' : 'pointer-events-none opacity-25'}`}
                    >
                      <span className="truncate text-sm">{u.tool}</span>
                      <span className={`shrink-0 text-xs tabular-nums ${isOpen ? skin.accent : skin.muted}`}>{formatTool(u)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        {filter.isActive && groups.every((g) => toolsByGroup[g].filter(filter.matchesTool).length === 0) && (
          <p className={`py-6 text-sm ${skin.muted}`}>{sk.orbit.noMatches}</p>
        )}
      </div>
      <p className="sr-only">{sk.usage.caption}</p>

      <ToolDrawer skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} tool={openToolUsage} open={!!openTool} onClose={() => setOpenTool(null)} />
    </div>
  )
}
