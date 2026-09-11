// Mobile candidate (c) — "Ranked list": `?skillsMobile=c`. Mechanism: one flat, pre-sorted list of
// every tool (stores desc, then products, then client roles, then name) instead of the accordion's
// per-group disclosure, the rail's per-group cards or the constellation's spatial clusters — the
// simplest possible answer to "what does this person actually use the most", a single scroll with the
// heaviest usage at the top. Search stays sticky above it; group chips filter without re-sorting.
import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useSheetHistory } from '../../../../hooks'
import { toolUsageById, type ToolUsage } from '../../../../data/skillUsage'
import { ToolDrawer, DRAWER_ID } from '../ToolDrawer'
import { useSkillsFilter } from '../useSkillsFilter'
import type { SkillsLayoutProps } from '../types'

const fill = (template: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), template)

const rankSort = (a: ToolUsage, b: ToolUsage) => b.stores - a.stores || b.products - a.products || b.roleWork - a.roleWork || a.tool.localeCompare(b.tool)

export function RankedListMobile({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, toolsByGroup, formatTool } = data
  const reduced = useReducedMotion()
  const filter = useSkillsFilter(groups)
  const [openTool, setOpenTool] = useState<string | null>(null)
  const openToolUsage = openTool ? (toolUsageById.get(openTool) ?? null) : null

  useSheetHistory(openTool, () => setOpenTool(null), {
    param: 'tool',
    open: (slug) => {
      if (toolUsageById.has(slug)) setOpenTool(slug)
    },
  })

  const allTools = groups.flatMap((g) => toolsByGroup[g])
  const ranked = [...allTools].sort(rankSort)
  const maxStores = Math.max(1, ...allTools.map((u) => u.stores))
  const matching = ranked.filter(filter.matchesTool)

  return (
    <div className="mt-2">
      <div className={`sticky top-16 z-20 -mx-4 px-4 pb-3 pt-1 backdrop-blur ${skin.dark ? 'bg-black/75' : 'bg-white/85'}`}>
        <label className="block">
          <span className="sr-only">{sk.orbit.searchLabel}</span>
          <input
            type="search"
            value={filter.query}
            onChange={(e) => filter.setQuery(e.target.value)}
            placeholder={sk.orbit.searchPlaceholder}
            aria-label={sk.orbit.searchLabel}
            className={`min-h-11 w-full rounded-full border bg-transparent px-4 text-sm outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${skin.line} ${skin.body}`}
          />
        </label>

        <div role="group" aria-label={sk.groupSelectorLabel} className="-mx-4 mt-2.5 flex items-center gap-1.5 overflow-x-auto px-4 no-scrollbar">
          {groups.map((g) => {
            const on = filter.groups.has(g)
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => filter.toggleGroup(g)}
                className={`compact-touch shrink-0 rounded-full px-2.5 py-1 text-[11px] ${on ? skin.chipOn : skin.chip}`}
              >
                {groupLabel[g]}
              </button>
            )
          })}
          {filter.isActive && (
            <button type="button" onClick={filter.clear} className={`compact-touch shrink-0 rounded-full px-2.5 py-1 text-[11px] underline-offset-2 hover:underline ${skin.accent}`}>
              {sk.orbit.clear}
            </button>
          )}
        </div>

        <p aria-live="polite" className={`mt-2 text-[11px] ${skin.muted}`}>
          {fill(sk.orbit.summary, { n: String(matching.length), m: String(allTools.length), k: String(new Set(matching.flatMap((u) => u.storeNames)).size) })}
        </p>
      </div>

      <ul role="list" aria-label={sk.mobile.rankedListLabel} className="mt-1 flex flex-col">
        <AnimatePresence initial={false}>
          {ranked.map((u) => {
            if (!filter.matchesTool(u)) return null
            const isOpen = openTool === u.tool
            return (
              <m.li
                key={u.tool}
                layout="position"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.16 }}
                className="list-none"
              >
                <button
                  type="button"
                  data-tool={u.tool}
                  aria-pressed={isOpen}
                  aria-expanded={isOpen}
                  aria-controls={DRAWER_ID}
                  aria-label={`${u.tool} — ${groupLabel[u.group]} — ${formatTool(u)}`}
                  onClick={() => setOpenTool((prev) => (prev === u.tool ? null : u.tool))}
                  className={`flex min-h-11 w-full items-center gap-2.5 border-b py-2.5 text-left ${skin.line} ${isOpen ? skin.accent : skin.body}`}
                >
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${skin.chip}`}>{groupLabel[u.group]}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{u.tool}</span>
                  <span className={`relative h-1.5 w-14 shrink-0 overflow-hidden rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
                    <span style={{ width: `${(u.stores / maxStores) * 100}%` }} className={`block h-full rounded-full ${skin.accentBg}`} />
                  </span>
                  <span className={`w-5 shrink-0 text-right text-xs tabular-nums ${isOpen ? skin.accent : skin.muted}`}>{u.stores}</span>
                </button>
              </m.li>
            )
          })}
        </AnimatePresence>
      </ul>

      {filter.isActive && matching.length === 0 && (
        <p className={`mt-4 text-center text-sm ${skin.muted}`}>
          {sk.orbit.noMatches}{' '}
          <button type="button" onClick={filter.clear} className={`underline-offset-2 hover:underline ${skin.accent}`}>
            {sk.orbit.clear}
          </button>
        </p>
      )}

      <ToolDrawer skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} tool={openToolUsage} open={!!openTool} onClose={() => setOpenTool(null)} />
    </div>
  )
}
