// Layout 4 — "columns": six vertical columns, one per skill group, each a ranked list of tools with a
// real usage bar (length = tool.total against the fleet-wide max, so bars are comparable across
// columns). Collapses to a one-open-at-a-time accordion under 768px, same interaction pattern as the
// FAQ section, so six columns never get squeezed into unreadable slivers on a phone.
import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useMediaQuery } from '../../../hooks'
import type { SkillGroupId } from '../../../data/registry'
import type { ToolUsage } from '../../../data/skillUsage'
import type { SkillsLayoutProps, SkillsData } from './types'

const EASE = [0.23, 1, 0.32, 1] as const

function ColumnRows({ data, group, maxTotal }: { data: SkillsData; group: SkillGroupId; maxTotal: number }) {
  const { skin, toolsByGroup, formatTool } = data
  const [open, setOpen] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const ranked = [...toolsByGroup[group]].sort((a, b) => b.total - a.total)
  return (
    <ul>
      {ranked.map((u: ToolUsage) => {
        const isOpen = open === u.tool
        const pct = maxTotal > 0 ? Math.max(4, Math.round((u.total / maxTotal) * 100)) : 0
        return (
          <li key={u.tool} className={`border-b py-2 ${skin.line}`}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen((p) => (p === u.tool ? null : u.tool))} className="block w-full text-left">
              <span className="flex items-baseline justify-between gap-2">
                <span className={`truncate text-sm ${isOpen ? skin.accent : skin.body}`}>{u.tool}</span>
                <span className={`shrink-0 text-[11px] tabular-nums ${skin.muted}`}>{u.total}</span>
              </span>
              <span className={`mt-1.5 block h-1 w-full overflow-hidden rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
                <span className={`block h-full rounded-full ${skin.accentBg}`} style={{ width: `${pct}%` }} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: EASE }} className="overflow-hidden">
                  <p className={`pt-1.5 text-[11px] leading-snug ${skin.muted}`}>{formatTool(u)}</p>
                </m.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}

export function ColumnsLayout({ data }: SkillsLayoutProps) {
  const { skin, groups, groupLabel, storesPerGroup, toolsByGroup, formatGroup } = data
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [openGroup, setOpenGroup] = useState<SkillGroupId | null>(groups[0])
  const reduced = useReducedMotion()
  const maxTotal = Math.max(1, ...groups.flatMap((g) => toolsByGroup[g].map((u) => u.total)))

  if (isDesktop) {
    return (
      <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-8 lg:grid-cols-6">
        {groups.map((g) => (
          <div key={g}>
            <div className={`border-b pb-2 ${skin.line}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${skin.title}`}>{groupLabel[g]}</p>
              <p className={`mt-0.5 text-[11px] ${skin.muted}`}>{formatGroup(storesPerGroup[g])}</p>
            </div>
            <ColumnRows data={data} group={g} maxTotal={maxTotal} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-2">
      {groups.map((g) => {
        const isOpen = openGroup === g
        return (
          <div key={g} className={`border-b ${skin.line}`}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpenGroup(isOpen ? null : g)} className="flex w-full items-center justify-between gap-3 py-3.5 text-left">
              <span>
                <span className={`block text-sm font-semibold uppercase tracking-[0.1em] ${skin.title}`}>{groupLabel[g]}</span>
                <span className={`block text-[11px] ${skin.muted}`}>{formatGroup(storesPerGroup[g])}</span>
              </span>
              <m.span aria-hidden="true" className={`${skin.muted} flex h-6 w-6 shrink-0 items-center justify-center`} animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25, ease: EASE }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </m.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
                  <div className="pb-4">
                    <ColumnRows data={data} group={g} maxTotal={maxTotal} />
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
