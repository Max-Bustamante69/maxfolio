// Round 46 (owner pick from the round-44 contact sheet, candidate "d" — "constellation"): the default
// sub-1024px "What I work with" view. Mechanism: a static, spatial map instead of a list — six group
// clusters on a 2×3 grid, each a small dot scatter sized by usage (no rotation; `OrbitLayout`'s own
// comment explains why an ambient-motion ring never fits a phone width). Tapping a cluster is a
// shared-element "magic move" (`layoutId`) into a full-width panel listing its real tools; a back
// button OR Escape returns to the map. The dots themselves are decorative at this scale — only the
// cluster (128px tall, well over the 44px minimum) and, once zoomed, each tool row (44px) and the back
// button (44px) are real tap targets.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useSheetHistory } from '../../../../hooks'
import type { SkillGroupId } from '../../../../data/registry'
import { toolUsageById, type ToolUsage } from '../../../../data/skillUsage'
import { ToolDrawer, DRAWER_ID } from '../ToolDrawer'
import { useSkillsFilter } from '../useSkillsFilter'
import type { SkillsLayoutProps } from '../types'

const fill = (template: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), template)

const DOT_MIN = 1.6
const DOT_MAX = 3.6
const sizeDot = (total: number, min: number, max: number) => (max === min ? (DOT_MIN + DOT_MAX) / 2 : DOT_MIN + ((total - min) / (max - min)) * (DOT_MAX - DOT_MIN))

// Deterministic golden-angle spiral (never random — the same tool always lands in the same spot on
// every render/build) so a small cluster's dots read as a loose scatter without ever overlapping badly.
const GOLDEN_ANGLE = 137.508 * (Math.PI / 180)
const dotPosition = (i: number, total: number) => {
  const angle = i * GOLDEN_ANGLE
  const t = total <= 1 ? 0 : Math.sqrt((i + 0.5) / total)
  return { cx: 50 + t * 36 * Math.cos(angle), cy: 52 + t * 30 * Math.sin(angle) }
}

// Zoom-into-cluster transition: a plain tween (not the panel's old spring) so the "magic move" lands
// inside the 200–300ms ease-out window the round-46 brief calls for, instead of the ~500ms spring the
// round-44 candidate used for the contact-sheet comparison.
const ZOOM_TRANSITION = { duration: 0.25, ease: 'easeOut' as const }

export function ConstellationMobile({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, groupNote, toolsByGroup, formatTool } = data
  const reduced = useReducedMotion()
  const filter = useSkillsFilter(groups)
  const [zoomed, setZoomed] = useState<SkillGroupId | null>(null)
  const [openTool, setOpenTool] = useState<string | null>(null)
  const openToolUsage = openTool ? (toolUsageById.get(openTool) ?? null) : null

  useSheetHistory(openTool, () => setOpenTool(null), {
    param: 'tool',
    open: (slug) => {
      if (toolUsageById.has(slug)) setOpenTool(slug)
    },
  })

  // Focus follows the "magic move" the same way `ToolDrawer` follows its own open/close (review fix):
  // without this, the grid button that had focus unmounts the instant `zoomed` is set (AnimatePresence
  // removes the whole grid), and the browser silently drops focus to `<body>` — a keyboard user who
  // just activated a cluster loses their place on the page entirely, on both directions of the trip.
  const clusterRefs = useRef<Partial<Record<SkillGroupId, HTMLButtonElement | null>>>({})
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const lastZoomedRef = useRef<SkillGroupId | null>(null)
  const closeZoom = () => {
    if (zoomed) lastZoomedRef.current = zoomed
    setZoomed(null)
  }
  useEffect(() => {
    if (zoomed) {
      backButtonRef.current?.focus()
    } else if (lastZoomedRef.current) {
      clusterRefs.current[lastZoomedRef.current]?.focus()
      lastZoomedRef.current = null
    }
  }, [zoomed])

  // Esc closes the zoomed cluster panel and returns to the map — the keyboard equivalent of the back
  // button, and independent of ToolDrawer's own Escape handling (a nested, later concern: with a tool
  // open, Escape closes the drawer first, matching the visual stacking order).
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !openTool) closeZoom()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed, openTool])

  return (
    <div className="mt-2">
      <div className={`sticky top-16 z-20 -mx-4 mb-4 px-4 pb-3 pt-1 backdrop-blur ${skin.dark ? 'bg-black/75' : 'bg-white/85'}`}>
        <div role="group" aria-label={sk.groupSelectorLabel} className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 no-scrollbar">
          {groups.map((g) => {
            const on = filter.groups.has(g)
            return (
              <button key={g} type="button" aria-pressed={on} onClick={() => filter.toggleGroup(g)} className={`compact-touch shrink-0 rounded-full px-2.5 py-1 text-[11px] ${on ? skin.chipOn : skin.chip}`}>
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
      </div>

      {/* 2026-09-11 review fix: `mode="popLayout"` pulls the exiting grid out of document flow the
          instant it starts fading, instead of leaving its full box (and all six cluster cards) sitting
          in normal flow underneath the panel for the whole exit — measured overlap where the entering
          panel's text sat on top of the still-laid-out grid cards mid-transition. */}
      <AnimatePresence initial={false} mode="popLayout">
        {!zoomed ? (
          <m.div key="grid" exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.15 }} className="grid grid-cols-2 gap-3">
            {groups.map((g) => {
              const tools = toolsByGroup[g]
              const visible = tools.filter(filter.matchesTool)
              const totals = tools.map((u) => u.total)
              const min = Math.min(...totals)
              const max = Math.max(...totals)
              const allFiltered = filter.isActive && visible.length === 0
              const top2 = [...tools].sort((a, b) => b.total - a.total).slice(0, 2)
              return (
                <m.button
                  key={g}
                  ref={(el) => {
                    clusterRefs.current[g] = el
                  }}
                  layoutId={`cluster-${g}`}
                  type="button"
                  aria-expanded={false}
                  aria-label={fill(sk.mobile.openCluster, { group: groupLabel[g] })}
                  // A filter that leaves nothing in this cluster can't be tapped into an empty panel —
                  // same "can't open" convention `OrbitLayout`'s own filtered-out dots follow (see this
                  // file's header comment / that file's 2026-09-11 review fix), so it also leaves the
                  // tab order like a filtered-out dot does.
                  disabled={allFiltered}
                  aria-disabled={allFiltered}
                  onClick={() => setZoomed(g)}
                  transition={ZOOM_TRANSITION}
                  className={`relative h-32 overflow-hidden rounded-2xl border p-3 text-left disabled:cursor-default ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}
                >
                  <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full">
                    <AnimatePresence initial={false}>
                      {visible.map((u) => {
                        const idx = tools.indexOf(u)
                        const { cx, cy } = dotPosition(idx, tools.length)
                        const r = sizeDot(u.total, min, max)
                        return (
                          <m.circle
                            key={u.tool}
                            cx={cx}
                            cy={cy}
                            r={r}
                            initial={reduced ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduced ? 0 : 0.18 }}
                            className={skin.dark ? 'fill-white/35' : 'fill-black/30'}
                          />
                        )
                      })}
                    </AnimatePresence>
                  </svg>
                  <div className="relative z-10">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] transition-opacity duration-300 ${allFiltered ? 'opacity-30' : 'opacity-100'} ${skin.title}`}>{groupLabel[g]}</p>
                    <p className={`mt-0.5 text-[9px] leading-tight ${skin.muted}`}>{top2.map((u) => u.tool).join(' · ')}</p>
                  </div>
                </m.button>
              )
            })}
          </m.div>
        ) : (
          <m.div
            key="panel"
            layoutId={`cluster-${zoomed}`}
            transition={reduced ? { duration: 0 } : ZOOM_TRANSITION}
            className={`rounded-2xl border p-5 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <button
                ref={backButtonRef}
                type="button"
                onClick={closeZoom}
                aria-label={sk.mobile.back}
                className={`press flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${skin.dark ? 'bg-white/10' : 'bg-black/5'} ${skin.body}`}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {sk.mobile.back}
              </button>
              <div className="min-w-0">
                <p className={`truncate text-base font-semibold ${skin.title}`}>{groupLabel[zoomed]}</p>
                <p className={`truncate text-xs ${skin.muted}`}>{groupNote[zoomed]}</p>
              </div>
            </div>
            <div className="mt-1 flex flex-col">
              <AnimatePresence initial={false}>
                {toolsByGroup[zoomed].map((u: ToolUsage) => {
                  if (!filter.matchesTool(u)) return null
                  const isOpen = openTool === u.tool
                  return (
                    <m.button
                      key={u.tool}
                      layout="position"
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.15 }}
                      type="button"
                      data-tool={u.tool}
                      aria-pressed={isOpen}
                      aria-controls={DRAWER_ID}
                      onClick={() => setOpenTool(u.tool)}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 border-b py-2.5 text-left ${skin.line} ${isOpen ? skin.accent : skin.body}`}
                    >
                      <span className="text-sm">{u.tool}</span>
                      <span className={`shrink-0 text-xs tabular-nums ${isOpen ? skin.accent : skin.muted}`}>{formatTool(u)}</span>
                    </m.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <ToolDrawer skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} tool={openToolUsage} open={!!openTool} onClose={() => setOpenTool(null)} />
    </div>
  )
}
