// Mobile candidate (b) — "Group cards rail": `?skillsMobile=b`. Mechanism: a horizontal draggable rail
// (the same `useDragRail` feel `Chapters.tsx`/`StoryboardRailVariant` use), one card per group, bleeding
// to the screen edges — spatial, browse-by-swipe, versus the accordion's vertical disclosure or the
// ranked list's single flat scroll. Each card carries a mini bar chart of its own top 5 tools (real
// store counts); "See all N" expands the rest into a bottom sheet.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useDragRail, useSheetHistory } from '../../../../hooks'
import type { SkillGroupId } from '../../../../data/registry'
import { toolUsageById } from '../../../../data/skillUsage'
import { CountUp } from '../../../gallery/charts'
import { SkillsFilterBar } from '../SkillsFilterBar'
import { ToolDrawer, DRAWER_ID } from '../ToolDrawer'
import { useSkillsFilter } from '../useSkillsFilter'
import type { SkillsLayoutProps } from '../types'

const fill = (template: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), template)

export function RailMobile({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, groupNote, storesPerGroup, toolsByGroup, formatTool, formatGroup } = data
  const reduced = useReducedMotion()
  const filter = useSkillsFilter(groups)
  const [active, setActive] = useState(0)
  const [seeAllGroup, setSeeAllGroup] = useState<SkillGroupId | null>(null)
  const [openTool, setOpenTool] = useState<string | null>(null)
  const openToolUsage = openTool ? (toolUsageById.get(openTool) ?? null) : null
  const railRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const { handlers: allDragHandlers, isDragging } = useDragRail(railRef, { centerSnapBelow: 1024 })
  const { onDragStart: killNativeGhostDrag, ...dragHandlers } = allDragHandlers

  useSheetHistory(openTool, () => setOpenTool(null), {
    param: 'tool',
    open: (slug) => {
      if (toolUsageById.has(slug)) setOpenTool(slug)
    },
  })

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const listener = (e: globalThis.DragEvent) => killNativeGhostDrag(e as unknown as React.DragEvent<HTMLDivElement>)
    rail.addEventListener('dragstart', listener)
    return () => rail.removeEventListener('dragstart', listener)
  }, [killNativeGhostDrag])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const ratios = new Map<number, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.idx)
          ratios.set(idx, Math.round(entry.intersectionRatio * 100) / 100)
        }
        let best = 0
        let bestRatio = 0
        ratios.forEach((ratio, idx) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = idx
          }
        })
        if (bestRatio > 0) setActive(best)
      },
      { root: rail, threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(groups.length - 1, i))
    const el = cardRefs.current[clamped]
    const rail = railRef.current
    if (!el || !rail) return
    const left = el.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft
    rail.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className="mt-2">
      {/* 2026-09-11 review fix: this candidate had no filter UI at all — the "every option reuses the
          same SkillsFilterBar (or a compact variant)" requirement wasn't met, so a visitor landing on
          the rail had no way to filter cards/tools through the UI. Sticky, matching the accordion and
          constellation candidates' own bar placement above their content. */}
      <div className={`sticky top-16 z-20 -mx-4 px-4 pb-3 pt-1 backdrop-blur ${skin.dark ? 'bg-black/75' : 'bg-white/85'}`}>
        <SkillsFilterBar skin={skin} sk={sk} groups={groups} groupLabel={groupLabel} toolsByGroup={toolsByGroup} formatGroup={formatGroup} filter={filter} />
      </div>
      <div style={{ perspective: 1200 }}>
        <div
          ref={railRef}
          data-dragging={isDragging}
          {...dragHandlers}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              goTo(active + 1)
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault()
              goTo(active - 1)
            }
          }}
          tabIndex={0}
          role="group"
          aria-label={sk.eyebrow}
          className="drag-rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 outline-none no-scrollbar"
        >
          {groups.map((g, i) => {
            const tools = toolsByGroup[g]
            const top5 = [...tools].filter(filter.matchesTool).sort((a, b) => b.stores - a.stores || b.total - a.total).slice(0, 5)
            const maxStores = Math.max(1, ...top5.map((u) => u.stores))
            const visibleTotal = tools.filter(filter.matchesTool).length
            return (
              <div
                key={g}
                data-idx={i}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className={`w-[82%] shrink-0 snap-center overflow-hidden rounded-[22px] border p-5 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}
              >
                <p className={`text-3xl font-semibold tabular-nums leading-none ${skin.title}`}>
                  <CountUp value={storesPerGroup[g]} />
                </p>
                <p className={`mt-2 text-sm font-semibold uppercase tracking-[0.1em] ${skin.title}`}>{groupLabel[g]}</p>
                <p className={`mt-1 text-xs leading-snug ${skin.muted}`}>{groupNote[g]}</p>

                <div className="mt-4">
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{sk.mobile.topToolsLabel}</p>
                  <div className="mt-2.5 flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {top5.map((u) => (
                        <m.div
                          key={u.tool}
                          layout="position"
                          initial={reduced ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={reduced ? { opacity: 0 } : { opacity: 0 }}
                          transition={reduced ? { duration: 0 } : { duration: 0.18 }}
                          className="flex items-center gap-2"
                        >
                          <span className={`w-20 shrink-0 truncate text-[11px] ${skin.body}`}>{u.tool}</span>
                          <span className={`h-1.5 flex-1 overflow-hidden rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
                            <span style={{ width: `${(u.stores / maxStores) * 100}%` }} className={`block h-full rounded-full ${skin.accentBg}`} />
                          </span>
                          <span className={`w-4 shrink-0 text-right text-[11px] tabular-nums ${skin.muted}`}>{u.stores}</span>
                        </m.div>
                      ))}
                    </AnimatePresence>
                    {top5.length === 0 && <p className={`text-xs ${skin.muted}`}>{sk.orbit.noMatches}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSeeAllGroup(g)}
                  disabled={visibleTotal === 0}
                  className={`press mt-5 inline-flex min-h-11 items-center gap-1 rounded-full px-3.5 text-xs font-medium disabled:opacity-30 ${skin.dark ? 'bg-white/10' : 'bg-black/5'} ${skin.body}`}
                >
                  {fill(sk.mobile.seeAll, { n: String(visibleTotal) })}
                </button>
              </div>
            )
          })}
          <div aria-hidden="true" className="w-[9%] shrink-0" />
        </div>
      </div>

      <div role="group" aria-label={sk.groupSelectorLabel} className="mt-4 flex items-center justify-center gap-1.5">
        {groups.map((g, i) => (
          <button
            key={g}
            type="button"
            aria-label={groupLabel[g]}
            aria-current={active === i}
            onClick={() => goTo(i)}
            className="flex h-11 w-11 items-center justify-center"
          >
            <span aria-hidden="true" className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? `w-5 ${skin.accentBg}` : `w-1.5 ${skin.dark ? 'bg-white/20' : 'bg-black/15'}`}`} />
          </button>
        ))}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {seeAllGroup && (
              <m.div
                className="fixed inset-0 z-[9990] flex items-end justify-center bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                onClick={() => setSeeAllGroup(null)}
              >
                <m.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={groupLabel[seeAllGroup]}
                  onClick={(e) => e.stopPropagation()}
                  className={`max-h-[75vh] w-full overflow-y-auto rounded-t-[24px] p-5 pb-8 ${skin.dark ? 'bg-[#141416] text-[#f5f5f7]' : 'bg-white text-[#1d1d1f]'}`}
                  initial={reduced ? { y: 0 } : { y: '100%' }}
                  animate={{ y: 0 }}
                  exit={reduced ? { y: 0 } : { y: '100%' }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.5 }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className={`text-lg font-semibold ${skin.title}`}>{groupLabel[seeAllGroup]}</p>
                    <button
                      type="button"
                      onClick={() => setSeeAllGroup(null)}
                      aria-label={sk.mobile.seeAllClose}
                      className={`press flex h-11 w-11 items-center justify-center rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <AnimatePresence initial={false}>
                      {toolsByGroup[seeAllGroup].map((u) => {
                        if (!filter.matchesTool(u)) return null
                        const isOpen = openTool === u.tool
                        return (
                          <m.button
                            key={u.tool}
                            layout="position"
                            initial={reduced ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
                            transition={reduced ? { duration: 0 } : { duration: 0.15 }}
                            type="button"
                            data-tool={u.tool}
                            aria-pressed={isOpen}
                            aria-controls={DRAWER_ID}
                            onClick={() => setOpenTool(u.tool)}
                            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border-b px-1.5 py-2.5 text-left ${skin.line}`}
                          >
                            <span className={`text-sm ${skin.body}`}>{u.tool}</span>
                            <span className={`shrink-0 text-xs tabular-nums ${skin.muted}`}>{formatTool(u)}</span>
                          </m.button>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <ToolDrawer skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} tool={openToolUsage} open={!!openTool} onClose={() => setOpenTool(null)} />
    </div>
  )
}
