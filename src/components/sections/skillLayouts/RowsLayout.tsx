// Layout 6 — "rows": each skill group is one horizontal row of logo+name pills, auto-scrolling
// slowly and pausing on hover/focus — the same `Ticker` engine used everywhere else on the page (real
// pattern, not a bespoke one), so reduced motion already falls back to a plain wrapped static list for
// free. The group label sits fixed at the left of its row; clicking it opens that group's real tool
// list (with usage) below the rows — the inline detail this layout has room for.
import { useState } from 'react'
import { Ticker } from '../../common'
import type { SkillGroupId } from '../../../data/registry'
import type { ToolUsage } from '../../../data/skillUsage'
import { toolIcon, monogram, ToolMark } from '../skillIcons'
import type { SkillsLayoutProps } from './types'

export function RowsLayout({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, storesPerGroup, groupNote, toolsByGroup, formatTool, formatGroup } = data
  const [openGroup, setOpenGroup] = useState<SkillGroupId | null>(null)

  return (
    <div className="mt-4">
      {groups.map((g) => {
        const isOpen = openGroup === g
        const duration = Math.max(18, toolsByGroup[g].length * 5)
        return (
          <div key={g} className={`flex items-center gap-4 border-b py-3 ${skin.line}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenGroup((prev) => (prev === g ? null : g))}
              className={`w-24 shrink-0 text-left transition-colors md:w-32 ${isOpen ? skin.accent : skin.title}`}
            >
              <span className="block text-xs font-semibold uppercase leading-tight tracking-[0.08em]">{groupLabel[g]}</span>
              <span className={`block text-[10px] tabular-nums ${isOpen ? skin.accent : skin.muted}`}>{formatGroup(storesPerGroup[g])}</span>
            </button>
            <div className="min-w-0 flex-1">
              <Ticker
                variant="stock-ticker"
                duration={duration}
                label={`${groupLabel[g]} ${sk.layoutExtra.toolsSuffix}`}
                items={toolsByGroup[g]}
                keyOf={(u: ToolUsage) => u.tool}
                itemClassName="shrink-0 pr-2.5"
                renderItem={(u: ToolUsage) => (
                  <span className={`flex items-center gap-2 rounded-full border px-2.5 py-1 ${skin.line}`}>
                    <span className={`flex h-5 w-5 items-center justify-center text-[9px] font-bold ${skin.muted}`}>
                      {toolIcon(u.tool) ? <ToolMark tool={u.tool} className="h-4 w-4" /> : monogram(u.tool)}
                    </span>
                    <span className={`whitespace-nowrap text-xs font-medium ${skin.body}`}>{u.tool}</span>
                    <span className={`whitespace-nowrap text-[10px] tabular-nums ${skin.muted}`}>{formatTool(u)}</span>
                  </span>
                )}
              />
            </div>
          </div>
        )
      })}

      {openGroup && (
        <div className={`mt-6 border-t pt-5 ${skin.line}`}>
          <p className={`text-sm leading-relaxed ${skin.body}`}>{groupNote[openGroup]}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {toolsByGroup[openGroup].map((u) => (
              <li key={u.tool} className={skin.chip}>
                {u.tool} · {formatTool(u)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!openGroup && <p className={`mt-4 text-[11px] ${skin.muted}`}>{sk.usage.caption}</p>}
    </div>
  )
}
