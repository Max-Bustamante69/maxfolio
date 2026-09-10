// Layout 2 — "wall": a dense monochrome logo wall, 8-10 marks per row on desktop. Hover/focus reveals
// the tool's real name and usage chip in a fixed-height caption slot below the mark (no reflow); a
// group filter strip on top narrows the wall to one skill group at a time.
import { useMemo, useState } from 'react'
import type { SkillGroupId } from '../../../data/registry'
import { toolUsageById } from '../../../data/skillUsage'
import { SkillPanel } from '../SkillPanel'
import { toolIcon, monogram, ToolMark } from '../skillIcons'
import type { SkillsLayoutProps } from './types'

export function WallLayout({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, toolsByGroup, allTools, formatTool, formatGroup, storesPerGroup } = data
  const [filter, setFilter] = useState<SkillGroupId | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const active = hovered ?? locked
  const pinned = !!locked && locked === active
  const activeTool = active ? (toolUsageById.get(active) ?? null) : null

  const shown = useMemo(() => (filter ? toolsByGroup[filter] : groups.flatMap((g) => toolsByGroup[g])), [filter, groups, toolsByGroup])

  return (
    <div className="mt-2">
      <div className="-mx-4 flex flex-wrap gap-2 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:px-0" role="tablist" aria-label={sk.layoutExtra.wallFilterLabel}>
        <button type="button" role="tab" aria-selected={filter === null} onClick={() => setFilter(null)} className={`shrink-0 whitespace-nowrap transition-colors ${filter === null ? skin.chipOn : skin.chip}`}>
          {sk.layoutExtra.allLabel} · {allTools.length}
        </button>
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={filter === g}
            onClick={() => setFilter(g)}
            className={`shrink-0 whitespace-nowrap transition-colors ${filter === g ? skin.chipOn : skin.chip}`}
          >
            {groupLabel[g]} · {formatGroup(storesPerGroup[g])}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {shown.map((u) => {
          const icon = toolIcon(u.tool)
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
              className={`group flex flex-col items-center gap-1.5 border p-2.5 text-center transition-colors ${skin.line} ${isActive ? (skin.dark ? 'bg-white/[0.06]' : 'bg-black/[0.03]') : ''}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center text-sm font-bold transition-colors ${isActive ? skin.accent : skin.muted}`}>
                {icon ? <ToolMark tool={u.tool} className="h-6 w-6" /> : monogram(u.tool)}
              </span>
              <span className="flex h-8 flex-col items-center justify-start overflow-hidden">
                <span className={`line-clamp-1 text-[10px] leading-tight transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'} ${skin.title}`}>{u.tool}</span>
                <span className={`text-[9px] tabular-nums transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'} ${skin.muted}`}>{formatTool(u)}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <SkillPanel skin={skin} tool={activeTool} pinned={pinned} onUnpin={() => setLocked(null)} />
      </div>
    </div>
  )
}
