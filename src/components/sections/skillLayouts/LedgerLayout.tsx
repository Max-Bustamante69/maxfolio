// Layout 1 — "ledger": a typographic register (Apple/Stripe spec-sheet register), not a grid of
// tiles. Groups appear as big numerals (real store count) with a one-line honest description; every
// tool is one row on a hairline with its real usage count right-aligned. No icons, no cards — the
// list flows into two columns once there is room, same as a printed ledger.
import { useState } from 'react'
import { toolUsageById } from '../../../data/skillUsage'
import { SkillPanel } from '../SkillPanel'
import { CountUp } from '../../gallery/charts'
import type { SkillsLayoutProps } from './types'

export function LedgerLayout({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, groupNote, storesPerGroup, toolsByGroup, formatTool } = data
  const [hovered, setHovered] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const active = hovered ?? locked
  const pinned = !!locked && locked === active
  const activeTool = active ? (toolUsageById.get(active) ?? null) : null

  return (
    <div className="mt-2 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
      <div className="sm:columns-2 sm:gap-x-12">
        {groups.map((g) => (
          <div key={g} className="break-inside-avoid-column">
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
                return (
                  <button
                    key={u.tool}
                    type="button"
                    aria-pressed={locked === u.tool}
                    onMouseEnter={() => setHovered(u.tool)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(u.tool)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setLocked((prev) => (prev === u.tool ? null : u.tool))}
                    className={`flex w-full items-baseline justify-between gap-3 border-b py-2 text-left transition-colors ${skin.line} ${isActive ? skin.accent : skin.body}`}
                  >
                    <span className="truncate text-sm">{u.tool}</span>
                    <span className={`shrink-0 text-xs tabular-nums ${isActive ? skin.accent : skin.muted}`}>{formatTool(u)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 lg:sticky lg:top-24 lg:mt-0">
        <SkillPanel skin={skin} tool={activeTool} pinned={pinned} onUnpin={() => setLocked(null)} />
      </div>
      <p className={`sr-only`}>{sk.usage.caption}</p>
    </div>
  )
}
