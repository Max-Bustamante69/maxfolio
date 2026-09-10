// Layout 5 — "orbit": desktop-only radial layout. The six skill groups become concentric rings
// (fewest tools innermost, so dots never crowd), each tool a dot on its ring; hovering pulls the real
// name + usage out next to the dot, and the center shows whichever tool is active. Below 1024px, and
// under reduced motion (an orbit is inherently a motion-heavy metaphor even though the geometry itself
// is static — a pointer-only "pull the label out" affordance isn't reachable by touch either), it
// falls back to layout 1 (ledger), which is fully legible and keyboard/touch operable on its own.
import { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useMediaQuery } from '../../../hooks'
import type { SkillGroupId } from '../../../data/registry'
import { toolUsageById } from '../../../data/skillUsage'
import { toolIcon, monogram, ToolMark } from '../skillIcons'
import { LedgerLayout } from './LedgerLayout'
import type { SkillsLayoutProps } from './types'

const TAU = Math.PI * 2

export function OrbitLayout({ data }: SkillsLayoutProps) {
  const { skin, groups, groupLabel, toolsByGroup, formatTool } = data
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const active = hovered ?? locked
  const pinned = !!locked && locked === active
  const activeTool = active ? (toolUsageById.get(active) ?? null) : null

  // Fewest tools innermost so the busiest group (Shopify, 13 tools) gets the longest ring circumference.
  const ringOrder = useMemo<SkillGroupId[]>(() => [...groups].sort((a, b) => toolsByGroup[a].length - toolsByGroup[b].length), [groups, toolsByGroup])
  const radii = [13, 20.5, 28, 35.5, 43, 48.5]

  if (!isDesktop || reduced) {
    return <LedgerLayout data={data} />
  }

  return (
    <div className="mt-4">
      <div className="relative mx-auto aspect-square w-full max-w-[620px] overflow-visible">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {ringOrder.map((g, ri) => (
            <circle key={g} cx="50" cy="50" r={radii[ri]} fill="none" strokeWidth="0.3" className={skin.dark ? 'stroke-white/10' : 'stroke-black/10'} />
          ))}
        </svg>

        {ringOrder.map((g, ri) => {
          const tools = toolsByGroup[g]
          const angleOffset = ri * 0.4 - Math.PI / 2
          return tools.map((u, ti) => {
            const angle = angleOffset + (TAU * ti) / tools.length
            const r = radii[ri]
            const cx = 50 + r * Math.cos(angle)
            const cy = 50 + r * Math.sin(angle)
            const isActive = active === u.tool
            const labelBelow = Math.sin(angle) >= 0
            const labelRight = Math.cos(angle) >= 0
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
                style={{ left: `${cx}%`, top: `${cy}%` }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${skin.line} ${isActive ? `${skin.accent} ${skin.dark ? 'bg-white/10' : 'bg-black/[0.04]'}` : skin.muted}`}
                >
                  {toolIcon(u.tool) ? <ToolMark tool={u.tool} className="h-3.5 w-3.5" /> : monogram(u.tool).slice(0, 1)}
                </span>
                <span
                  className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] tabular-nums transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-focus-visible:opacity-100'} ${skin.chip} ${labelBelow ? 'top-full mt-1' : 'bottom-full mb-1'} ${labelRight ? 'left-1/2' : 'right-1/2'}`}
                >
                  {u.tool}
                </span>
              </button>
            )
          })
        })}

        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border p-3 text-center" style={{ borderColor: 'currentColor' }}>
          <div className={`flex h-full w-full flex-col items-center justify-center rounded-full border ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`}>
            {activeTool ? (
              <>
                <span className={`mb-1 flex h-7 w-7 items-center justify-center ${skin.accent}`}>
                  {toolIcon(activeTool.tool) ? <ToolMark tool={activeTool.tool} className="h-5 w-5" /> : monogram(activeTool.tool)}
                </span>
                <p className={`px-2 text-[11px] font-semibold leading-tight ${skin.title}`}>{activeTool.tool}</p>
                <p className={`mt-0.5 px-2 text-[9px] leading-tight ${skin.muted}`}>{formatTool(activeTool)}</p>
              </>
            ) : (
              <p className={`px-3 text-[10px] leading-snug ${skin.muted}`}>Hover a ring</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {ringOrder.map((g) => (
          <span key={g} className={`text-[11px] ${skin.muted}`}>
            {groupLabel[g]}
          </span>
        ))}
      </div>

      {pinned && activeTool && (
        <p className={`mt-2 text-center text-[11px] ${skin.muted}`}>
          <button type="button" className={`underline ${skin.accent}`} onClick={() => setLocked(null)}>
            Unpin
          </button>
        </p>
      )}

      <table className="sr-only">
        <caption>Tools by skill group, with real fleet usage</caption>
        <thead>
          <tr>
            <th>Group</th>
            <th>Tool</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          {groups.flatMap((g) => toolsByGroup[g].map((u) => (
            <tr key={u.tool}>
              <td>{groupLabel[g]}</td>
              <td>{u.tool}</td>
              <td>{formatTool(u)}</td>
            </tr>
          )))}
        </tbody>
      </table>
    </div>
  )
}
