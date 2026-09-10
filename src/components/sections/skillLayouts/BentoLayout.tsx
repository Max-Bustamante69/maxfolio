// Layout 3 — "bento": one asymmetrical grid, each of the six skill groups sized by its real store
// count (the group with the most real deployments gets the biggest card). Inside a card the top two
// tools by usage print as big type; the rest sit as small chips. Clicking any tool reveals its real
// usage line inline, inside that same card — no separate panel to scan across.
import { useMemo, useState } from 'react'
import type { SkillGroupId } from '../../../data/registry'
import { CountUp } from '../../gallery/charts'
import type { SkillsLayoutProps } from './types'

// Six preset spans on a 4-column grid (area sums to 4×3 = 12 cells): the biggest group gets the 2×2
// corner, the next two get wide 2×1 strips, the smallest three stay single cells.
const SPANS = [
  { col: 'md:col-span-2', row: 'md:row-span-2' },
  { col: 'md:col-span-2', row: 'md:row-span-1' },
  { col: 'md:col-span-1', row: 'md:row-span-1' },
  { col: 'md:col-span-1', row: 'md:row-span-1' },
  { col: 'md:col-span-2', row: 'md:row-span-1' },
  { col: 'md:col-span-2', row: 'md:row-span-1' },
]

export function BentoLayout({ data }: SkillsLayoutProps) {
  const { skin, groupLabel, groupNote, storesPerGroup, toolsByGroup, formatTool } = data
  const [expanded, setExpanded] = useState<Record<string, string | null>>({})

  const ranked = useMemo(() => {
    const groups = Object.keys(toolsByGroup) as SkillGroupId[]
    return [...groups].sort((a, b) => storesPerGroup[b] - storesPerGroup[a])
  }, [toolsByGroup, storesPerGroup])

  return (
    <div className="mt-2 grid grid-cols-1 gap-3 md:grid-flow-dense md:auto-rows-[minmax(150px,auto)] md:grid-cols-4">
      {ranked.map((g, i) => {
        const tools = [...toolsByGroup[g]].sort((a, b) => b.total - a.total)
        const [top1, top2, ...rest] = tools
        const span = SPANS[i] ?? SPANS[SPANS.length - 1]
        const openTool = expanded[g] ? tools.find((t) => t.tool === expanded[g]) : null
        return (
          <div key={g} className={`flex flex-col border p-4 ${skin.line} ${span.col} ${span.row}`}>
            <div className="flex items-baseline justify-between gap-2">
              <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${skin.title}`}>{groupLabel[g]}</p>
              <p className={`text-lg font-semibold tabular-nums ${skin.accent}`}>
                <CountUp value={storesPerGroup[g]} />
              </p>
            </div>
            <p className={`mt-1 text-[11px] leading-snug ${skin.muted}`}>{groupNote[g]}</p>

            <div className="mt-3 space-y-1">
              {[top1, top2].filter(Boolean).map((u) => (
                <button
                  key={u!.tool}
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [g]: prev[g] === u!.tool ? null : u!.tool }))}
                  className={`block text-left text-base font-semibold leading-tight transition-colors md:text-lg ${expanded[g] === u!.tool ? skin.accent : skin.title}`}
                >
                  {u!.tool}
                </button>
              ))}
            </div>

            {rest.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {rest.map((u) => (
                  <button
                    key={u.tool}
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [g]: prev[g] === u.tool ? null : u.tool }))}
                    className={`rounded-full px-2 py-0.5 text-[10px] transition-colors ${expanded[g] === u.tool ? skin.chipOn : skin.chip}`}
                  >
                    {u.tool}
                  </button>
                ))}
              </div>
            )}

            <p className={`mt-auto pt-2 text-[11px] tabular-nums ${skin.muted}`} aria-live="polite">
              {openTool ? `${openTool.tool} — ${formatTool(openTool)}` : ' '}
            </p>
          </div>
        )
      })}
    </div>
  )
}
