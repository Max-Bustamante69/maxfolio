// Layout 1 — "ledger": a typographic register (Apple/Stripe spec-sheet register), not a grid of
// tiles. Groups appear as big numerals (real store count) with a one-line honest description; every
// tool is one row on a hairline with its real usage count right-aligned. No icons, no cards — the
// list flows into two columns once there is room, same as a printed ledger.
import { useState } from 'react'
import { toolUsageById } from '../../../data/skillUsage'
import { SkillPanel } from '../SkillPanel'
import { CountUp } from '../../gallery/charts'
import { SkillsFilterBar } from './SkillsFilterBar'
import { useSkillsFilter } from './useSkillsFilter'
import type { SkillsLayoutProps } from './types'

const PANEL_ID = 'skills-ledger-panel'

/**
 * The default sub-1024px (and reduced-motion) fallback for the orbit — also selectable directly via
 * `?skills=ledger`. Carries the same filter bar as the orbit (group/surface/text, URL-shareable) and
 * the same real-links preview: tapping/focusing a row expands the docked panel below/beside the list
 * with that tool's thumbnails and "used at" lines (`ToolUsageLinks`, via `SkillPanel`) — one detail
 * surface rather than a card per row, since 20+ rows per group leaves no room for one inline expansion
 * each without burying the list (the same legibility tradeoff `OrbitLayout`'s own header comment
 * documents for why a compact mobile *orbit* was cut in favor of this layout in the first place).
 */
export function LedgerLayout({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, groupNote, storesPerGroup, toolsByGroup, formatTool, formatGroup } = data
  const [hovered, setHovered] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const filter = useSkillsFilter(groups)
  const active = hovered ?? locked
  const pinned = !!locked && locked === active
  const activeTool = active ? (toolUsageById.get(active) ?? null) : null

  return (
    <div className="mt-2">
      <SkillsFilterBar skin={skin} sk={sk} groups={groups} groupLabel={groupLabel} toolsByGroup={toolsByGroup} storesPerGroup={storesPerGroup} formatGroup={formatGroup} filter={filter} />
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
        <div className="sm:columns-2 sm:gap-x-12">
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
                    const isActive = active === u.tool
                    const visible = filter.matchesTool(u)
                    return (
                      <button
                        key={u.tool}
                        type="button"
                        aria-pressed={locked === u.tool}
                        aria-expanded={isActive}
                        aria-controls={PANEL_ID}
                        aria-label={`${u.tool} — ${isActive ? sk.orbit.collapseRow : sk.orbit.expandRow}`}
                        onMouseEnter={() => setHovered(u.tool)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(u.tool)}
                        onBlur={() => setHovered(null)}
                        onClick={() => setLocked((prev) => (prev === u.tool ? null : u.tool))}
                        className={`flex w-full items-baseline justify-between gap-3 border-b py-2 text-left transition-opacity duration-300 ${skin.line} ${isActive ? skin.accent : skin.body} ${visible ? 'opacity-100' : 'pointer-events-none opacity-25'}`}
                      >
                        <span className="truncate text-sm">{u.tool}</span>
                        <span className={`shrink-0 text-xs tabular-nums ${isActive ? skin.accent : skin.muted}`}>{formatTool(u)}</span>
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
        <div id={PANEL_ID} className="mt-8 lg:sticky lg:top-24 lg:mt-0">
          <SkillPanel skin={skin} tool={activeTool} pinned={pinned} onUnpin={() => setLocked(null)} />
        </div>
      </div>
      <p className="sr-only">{sk.usage.caption}</p>
    </div>
  )
}
