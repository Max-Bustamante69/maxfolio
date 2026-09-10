import { useMemo, type KeyboardEvent } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { SkillGroupId } from '../../data/registry'
import { toolUsage, groupUsage, storesPerGroup, type ToolUsage } from '../../data/skillUsage'

const EASE = [0.23, 1, 0.32, 1] as const

export type SunburstSelection = { level: 'group'; group: SkillGroupId } | { level: 'tool'; group: SkillGroupId; tool: string } | null

/** Structural equality for the two nullable selections — used to tell "hovering the locked arc" from
 *  "hovering a different one" and to toggle a lock off when the same arc is clicked/Entered again. */
export function sameSel(a: SunburstSelection, b: SunburstSelection): boolean {
  if (!a || !b) return a === b
  if (a.level !== b.level || a.group !== b.group) return false
  return a.level === 'tool' && b.level === 'tool' ? a.tool === b.tool : true
}

interface SkillsSunburstProps {
  skin: Skin
  groups: SkillGroupId[]
  groupLabel: Record<SkillGroupId, string>
  /** Transient — mouse/focus is over this arc right now (or null). */
  hovered: SunburstSelection
  /** Persistent — this arc was clicked/Entered and stays selected until toggled off or Esc. */
  locked: SunburstSelection
  onHover: (sel: SunburstSelection) => void
  onHoverEnd: () => void
  onToggleLock: (sel: SunburstSelection) => void
  onUnlock: () => void
  /** Locale-formatted, ready-to-print strings — Skills.tsx owns the wording, this component only lays out arcs. */
  format: {
    tool: (u: ToolUsage) => string
    group: (n: number) => string
    caption: string
  }
}

const CX = 210
const CY = 210
const R1 = 92 // ring 1 (groups) radius
const R2 = 150 // ring 2 (tools) radius
const GAP1 = 1.6 // degrees between group arcs
const GAP2 = 0.9 // degrees between tool arcs inside a group
const FLOOR = 0.38 // a zero-count arc still gets this fraction of the mean weight, never zero width

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** A circular arc (stroke-based donut segment), not a filled sector — lets every skin swap cap style. */
function arcPath(r: number, startDeg: number, endDeg: number) {
  const p0 = polar(CX, CY, r, startDeg)
  const p1 = polar(CX, CY, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`
}

/** Weights floored to a visible minimum so a real zero-count tool never draws a literal zero-width arc. */
function withFloor(counts: number[]): number[] {
  const hasSignal = counts.some((c) => c > 0)
  if (!hasSignal) return counts.map(() => 1)
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length
  const floor = mean * FLOOR
  return counts.map((c) => Math.max(c, floor))
}

/** Splits a total angular span across weighted slices, each separated by `gapDeg` (shrunk if the span is too tight to fit). */
function layout(span: number, weights: number[], gapDeg: number): { start: number; end: number }[] {
  const n = weights.length
  if (n === 0) return []
  const gap = Math.min(gapDeg, n > 1 ? span / (n * 4) : 0)
  const usable = span - gap * (n - 1)
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  let cursor = 0
  return weights.map((w) => {
    const size = (w / sum) * usable
    const start = cursor
    const end = cursor + size
    cursor = end + gap
    return { start, end }
  })
}

/** Per-skin arc geometry/typography — every difference below reads off `skin.frame`/`skin.dark`, never a
 *  hardcoded hex, so the five themes stay in sync with their own Skin tokens automatically. */
function arcStyle(frame: Skin['frame']) {
  switch (frame) {
    case 'apple':
      return { cap: 'round' as const, w1: 22, w2: 34, glow: false, skewDeg: 0, labelClass: '', baseTint: false }
    case 'luxury':
      // "Gold arcs on cream" — the idle ring reads as a soft gold, not a neutral gray, so the metal
      // carries the whole piece even before anything is hovered.
      return { cap: 'round' as const, w1: 30, w2: 46, glow: false, skewDeg: 0, labelClass: 'font-display', baseTint: true }
    case 'brutalist':
      return { cap: 'square' as const, w1: 32, w2: 48, glow: false, skewDeg: 0, labelClass: 'font-mono uppercase tracking-wide', baseTint: false }
    case 'neo':
      return { cap: 'round' as const, w1: 34, w2: 52, glow: true, skewDeg: 0, labelClass: 'font-neo', baseTint: false }
    case 'persona':
      return { cap: 'butt' as const, w1: 30, w2: 44, glow: true, skewDeg: -4, labelClass: 'font-persona-label uppercase tracking-wide', baseTint: false }
  }
}

/** Enter/Space activates the arc like a click (SVG elements get no native button semantics);
 *  Escape releases a lock from wherever focus currently sits. */
function arcKeyDownHandler(onToggle: () => void, onEscape: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    } else if (e.key === 'Escape') {
      onEscape()
    }
  }
}

/**
 * Center = the person, ring 1 = the six skill groups, ring 2 = every named tool inside them — arc
 * length is a real usage weight (stores + products + named client-role deliverables that list the
 * tool), floored to a visible minimum for the tools we own but haven't logged a fleet count for yet.
 * Precomputed once from `skillUsage.ts` (no charting runtime); arcs draw themselves in on scroll and
 * every arc is a real, keyboard-reachable control with two selection states: hover/focus previews,
 * click/Enter locks (persists after the pointer leaves — the panel above stays on the pinned tool),
 * Escape releases the lock.
 */
export function SkillsSunburst({ skin, groups, groupLabel, hovered, locked, onHover, onHoverEnd, onToggleLock, onUnlock, format }: SkillsSunburstProps) {
  const reduced = useReducedMotion()
  const { registry } = useContent()
  const style = arcStyle(skin.frame)
  const active = hovered ?? locked

  const byGroup = useMemo(() => {
    const map = new Map<SkillGroupId, ToolUsage[]>()
    groups.forEach((g) => map.set(g, toolUsage.filter((u) => u.group === g)))
    return map
  }, [groups])

  const ring1 = useMemo(() => {
    const weights = withFloor(groups.map((g) => groupUsage[g]))
    return layout(360 - GAP1 * groups.length, weights, GAP1).map((seg, i) => ({ ...seg, group: groups[i] }))
  }, [groups])

  const ring2 = useMemo(
    () =>
      ring1.flatMap((g1) => {
        const tools = byGroup.get(g1.group) ?? []
        const weights = withFloor(tools.map((t) => t.total))
        return layout(g1.end - g1.start, weights, GAP2).map((seg, i) => ({
          start: g1.start + seg.start,
          end: g1.start + seg.end,
          group: g1.group,
          usage: tools[i],
        }))
      }),
    [ring1, byGroup],
  )

  const isGroupActive = (g: SkillGroupId) => active?.group === g
  const isToolActive = (g: SkillGroupId, tool: string) => active?.level === 'tool' && active.group === g && active.tool === tool
  // Idle→hovered used to drop to 32% opacity; the brief asks for a lighter 60% so labels never dip
  // below AA even mid-hover.
  const dim = (on: boolean) => (active ? (on ? 'opacity-100' : 'opacity-60') : 'opacity-100')
  // Luxury's idle ring is a soft gold tint of its own accent rather than a neutral gray (arcStyle §baseTint).
  const idleClass = style.baseTint ? `${skin.accent} opacity-45` : skin.muted

  const initials = registry.personal.firstName[0] + registry.personal.lastName[0]

  return (
    <div>
      <div className="mx-auto max-w-[420px]" style={style.skewDeg ? { transform: `skewY(${style.skewDeg}deg)` } : undefined}>
        <svg viewBox="0 0 420 420" className="w-full" role="group" aria-label={format.caption}>
          {/* center — the person, decorative */}
          <circle cx={CX} cy={CY} r={54} className={skin.muted} fill="none" strokeWidth={1} stroke="currentColor" opacity={0.4} aria-hidden="true" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" className={`${skin.title} ${style.labelClass}`} style={{ fontSize: 26, fill: 'currentColor', fontWeight: 700 }} aria-hidden="true">
            {initials}
          </text>

          {/* ring 1 — groups */}
          {ring1.map((seg) => {
            const on = isGroupActive(seg.group)
            const sel: SunburstSelection = { level: 'group', group: seg.group }
            const isLocked = sameSel(locked, sel)
            const arcLen = ((seg.end - seg.start) / 360) * 2 * Math.PI * R1
            const mid = (seg.start + seg.end) / 2
            const labelPos = polar(CX, CY, R1, mid)
            const flip = mid > 90 && mid < 270
            const g = storesPerGroup[seg.group]
            const groupLine = `${groupLabel[seg.group]} — ${format.group(g)}`
            const haloOffset = style.w1 / 2 + 5
            const keyDown = arcKeyDownHandler(
              () => onToggleLock(sel),
              () => onUnlock(),
            )
            return (
              <g key={seg.group}>
                {isLocked && <path d={arcPath(R1 + haloOffset, seg.start, seg.end)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap={style.cap} className={`${skin.title} pointer-events-none`} aria-hidden="true" />}
                <m.path
                  d={arcPath(R1, seg.start, seg.end)}
                  fill="none"
                  strokeWidth={on ? style.w1 + 6 : style.w1}
                  strokeLinecap={style.cap}
                  className={`${on ? skin.accentBg.replace('bg-', 'stroke-') : idleClass} ${dim(on)} cursor-pointer transition-[opacity,stroke-width] duration-200`}
                  stroke="currentColor"
                  style={on && style.glow ? { filter: 'drop-shadow(0 0 6px currentColor)' } : undefined}
                  tabIndex={0}
                  role="button"
                  aria-label={groupLine}
                  aria-pressed={isLocked}
                  onMouseEnter={() => onHover(sel)}
                  onMouseLeave={onHoverEnd}
                  onFocus={() => onHover(sel)}
                  onBlur={onHoverEnd}
                  onClick={() => onToggleLock(sel)}
                  onKeyDown={keyDown}
                  initial={reduced ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
                >
                  <title>{groupLine}</title>
                </m.path>
                {arcLen > 34 && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${flip ? mid + 180 : mid}, ${labelPos.x}, ${labelPos.y})`}
                    className={`${skin.body} ${style.labelClass} pointer-events-none`}
                    style={{ fontSize: 11, fill: 'currentColor', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                    aria-hidden="true"
                  >
                    {groupLabel[seg.group]}
                  </text>
                )}
              </g>
            )
          })}

          {/* ring 2 — tools */}
          {ring2.map((seg) => {
            const u = seg.usage
            const sel: SunburstSelection = { level: 'tool', group: seg.group, tool: u.tool }
            const on = isToolActive(seg.group, u.tool) || (active?.level === 'group' && active.group === seg.group)
            const solo = isToolActive(seg.group, u.tool)
            const isLocked = sameSel(locked, sel)
            const toolLine = `${u.tool} — ${format.tool(u)}`
            const haloOffset = style.w2 / 2 + 5
            const keyDown = arcKeyDownHandler(
              () => onToggleLock(sel),
              () => onUnlock(),
            )
            return (
              <g key={`${seg.group}-${u.tool}`}>
                {isLocked && <path d={arcPath(R2 + haloOffset, seg.start, seg.end)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap={style.cap} className={`${skin.title} pointer-events-none`} aria-hidden="true" />}
                <m.path
                  d={arcPath(R2, seg.start, seg.end)}
                  fill="none"
                  strokeWidth={solo ? style.w2 + 6 : style.w2}
                  strokeLinecap={style.cap}
                  stroke="currentColor"
                  className={`${solo ? skin.accentBg.replace('bg-', 'stroke-') : on ? skin.accent : idleClass} ${dim(on)} cursor-pointer transition-[opacity,stroke-width] duration-200`}
                  style={solo && style.glow ? { filter: 'drop-shadow(0 0 5px currentColor)' } : undefined}
                  tabIndex={0}
                  role="button"
                  aria-label={toolLine}
                  aria-pressed={isLocked}
                  onMouseEnter={() => onHover(sel)}
                  onMouseLeave={onHoverEnd}
                  onFocus={() => onHover(sel)}
                  onBlur={onHoverEnd}
                  onClick={() => onToggleLock(sel)}
                  onKeyDown={keyDown}
                  initial={reduced ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                >
                  <title>{toolLine}</title>
                </m.path>
              </g>
            )
          })}
        </svg>
      </div>

      {/* readout: what's active right now, or a neutral prompt */}
      <div className={`mt-4 min-h-[2.5rem] text-center text-sm ${skin.muted}`} aria-live="polite">
        {active?.level === 'tool' ? (
          <p>
            <span className={`font-semibold ${skin.title}`}>{active.tool}</span> — {format.tool(toolUsage.find((u) => u.group === active.group && u.tool === active.tool)!)}
          </p>
        ) : active?.level === 'group' ? (
          <p>
            <span className={`font-semibold ${skin.title}`}>{groupLabel[active.group]}</span> — {format.group(storesPerGroup[active.group])}
          </p>
        ) : (
          <p>{format.caption}</p>
        )}
      </div>

      {/* visually hidden mirror of every real number the sunburst draws */}
      <table className="sr-only">
        <caption>{format.caption}</caption>
        <tbody>
          {ring2.map((seg) => (
            <tr key={`${seg.group}-${seg.usage.tool}`}>
              <th scope="row">
                {groupLabel[seg.group]} — {seg.usage.tool}
              </th>
              <td>{format.tool(seg.usage)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
