// Layout 5 — "orbit": the section's centerpiece. Six skill groups become concentric rings (fewest
// tools innermost, so dots never crowd); every ring carries its group name along the arc and its two
// most-used tools stay labeled at rest, so the composition reads without a single interaction. Each
// ring drifts in a slow, alternating ambient rotation (transform-only CSS, pauses on hover/focus) while
// its dots counter-rotate so icons/labels stay upright; the whole orbit tilts gently toward the pointer.
// The center is a quiet, FIXED ornament — a small per-theme "MB" mark (`CenterMark`), decorative
// only — plus a light tooltip (name + group, text only) that appears above it while a dot is hovered
// or focused, visible only on devices whose primary input actually hovers (`(hover: hover)`, see
// `ORBIT_CSS` below) — a mouse convenience, never required. A filter bar above the rings (by group,
// by which real surface uses a tool, by name) doubles as the ring legend; its state lives in the URL
// so a filtered view is shareable, and a group with nothing left showing collapses its ring to a
// hairline.
//
// 2026-09-10 — "more like modals or drawers... images too... so everything is more organized" (owner
// feedback on the orbit3 preview). Pressing/Enter-ing a dot now opens `ToolDrawer`, one shared instance
// for the whole section: a right-side panel (desktop) / bottom sheet (phones) carrying the tool's real
// capture thumbnails, client-role lines and depth stat — replacing both the old floating "quick look"
// card and the big center card, neither of which exists anymore.
//
// 2026-09-10 (same day, second pass) — "for the orbit, all the numbers should go into the preview
// (the drawer), not in that card in the middle; use the middle for something different — a logo or
// something — that data looks horrible there." The six-group fleet totals that used to sit in the
// center card moved into `ToolDrawer`'s new fleet-wide strip (shown for every tool, orbit and ledger
// alike); `CenterMark` fills the vacated center instead. `?tool=<slug>` deep-links the drawer open,
// history-aware exactly like `ShopifyWork`'s `?store=` (see `useSheetHistory`).
//
// Below 1024px it falls back to layout 1 (ledger) — fully legible and keyboard/touch operable on its
// own, carrying the same filter bar and opening the very same `ToolDrawer` (as a bottom sheet) — and so
// does reduced motion (an orbit is inherently a motion-heavy metaphor even though most of its geometry
// is static). A compact mobile orbit (three rings, tap to select) was measured and cut: Shopify alone
// is 13 tools, and even the best pairing puts 20+ tools on a half-ring inside a ~340px container — ~25px
// of arc per dot, well under a 44px tap target, so nothing short of hiding most of the labels/dots stays
// legible there. The brief's own escape hatch for this ("if it stays legible — else ledger only") is
// why ledger covers all of <1024px.
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useMediaQuery, useSheetHistory } from '../../../hooks'
import type { SkillGroupId } from '../../../data/registry'
import { toolUsageById, type ToolUsage } from '../../../data/skillUsage'
import { toolIcon, monogram, ToolMark } from '../skillIcons'
import { CenterMark } from './CenterMark'
import { LedgerLayout } from './LedgerLayout'
import { SkillsFilterBar } from './SkillsFilterBar'
import { ToolDrawer, DRAWER_ID } from './ToolDrawer'
import { useSkillsFilter } from './useSkillsFilter'
import type { SkillsLayoutProps } from './types'

const DOT_MIN = 26
const DOT_MAX = 40

// Ring radii in viewBox units (0–100, center 50/50) — one ring per group, fewest tools innermost so
// the busiest group (Shopify, 13 tools) gets the longest circumference. The viewBox spans 0–100, so a
// circle centered on (50,50) only stays fully inside it up to r=50, and a ring's own text (riding the
// path via textPath) extends further still — its ascent reaches above the guide arc by roughly the
// font size. The original outermost value (51.5) put the busiest ring's own stroke AND its group-name
// label past the SVG's default `overflow: hidden` edge; "SHOPIFY" measured fully invisible (its text
// rect sat entirely above the svg's own rect). Capped at 46, which leaves the label's ascent (~2.3
// units of font-size) comfortable room inside the 50-unit bound. Durations (seconds/turn) stay in the
// 90–150s band the brief calls for; direction alternates ring to ring.
const RADII = [19, 24.4, 29.8, 35.2, 40.6, 46]
const DURATIONS = [90, 102, 114, 126, 138, 150]

// A full-circle path can't center text AT its own start point (SVG text can't wrap past the end of a
// path back to its start), so the invisible guide a ring's group name rides is a short OPEN arc
// straddling 12 o'clock instead of the whole ring — plenty wide for the longest label on the smallest
// ring, comfortably short of wrapping.
const LABEL_HALF_SPAN = (75 * Math.PI) / 180

/** Static, invisible arc a ring's group-name text rides via <textPath>, centered on 12 o'clock. */
const textArcPath = (r: number) => {
  const a0 = -Math.PI / 2 - LABEL_HALF_SPAN
  const a1 = -Math.PI / 2 + LABEL_HALF_SPAN
  const x0 = 50 + r * Math.cos(a0)
  const y0 = 50 + r * Math.sin(a0)
  const x1 = 50 + r * Math.cos(a1)
  const y1 = 50 + r * Math.sin(a1)
  return `M ${x0},${y0} A ${r},${r} 0 0,1 ${x1},${y1}`
}

/** Rough centering for the arc label: nudge the text's start so its estimated length centers on the
 *  label-arc's own midpoint (which is 12 o'clock — see `textArcPath`), small caps at ~1.55 viewBox
 *  units per character including letter-spacing. The label arc's length is `r * 2*LABEL_HALF_SPAN`, not
 *  the ring's full circumference. */
const arcStartOffset = (label: string, r: number) => {
  const pathLength = r * 2 * LABEL_HALF_SPAN
  const textLen = label.length * 1.55
  const pct = Math.max(2, 50 - (textLen / pathLength) * 50)
  return `${pct}%`
}

const sizeForTotal = (total: number, min: number, max: number) => {
  if (max === min) return Math.round((DOT_MIN + DOT_MAX) / 2)
  const t = (total - min) / (max - min)
  return Math.round(DOT_MIN + t * (DOT_MAX - DOT_MIN))
}

/** Pure CSS ambient motion: each ring wrapper spins slowly (`--orbit-duration`, set inline per ring);
 *  every dot's inner content counter-spins the same duration the other way so icons/labels stay upright
 *  while their position still orbits. Hovering or focusing a ring — or any dot in it — pauses both, no
 *  React state or per-frame work involved. `.mfHoverTip` (the center tooltip) is a hover-affordance
 *  only: hidden outright on any device whose primary input doesn't actually hover, so a touch visitor
 *  who focuses a dot via an external keyboard never gets a bubble they can't dismiss with another tap. */
const ORBIT_CSS = `
@keyframes mfOrbitCW { to { transform: rotate(360deg); } }
@keyframes mfOrbitCCW { to { transform: rotate(-360deg); } }
.mfOrbitRing { animation: mfOrbitCW var(--orbit-duration, 120s) linear infinite; will-change: transform; }
.mfOrbitRing.mfCCW { animation-name: mfOrbitCCW; }
.mfOrbitRing:hover, .mfOrbitRing:focus-within { animation-play-state: paused; }
.mfOrbitDot { animation: mfOrbitCCW var(--orbit-duration, 120s) linear infinite; will-change: transform; }
.mfOrbitRing.mfCCW .mfOrbitDot { animation-name: mfOrbitCW; }
.mfOrbitRing:hover .mfOrbitDot, .mfOrbitRing:focus-within .mfOrbitDot { animation-play-state: paused; }
.mfHoverTip { display: none; }
@media (hover: hover) {
  .mfHoverTip { display: block; }
}
@keyframes mfCenterBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
.mfCenterBreathe { animation: mfCenterBreathe 8s ease-in-out infinite; will-change: transform; }
@keyframes mfCenterRingSpin { to { transform: rotate(-360deg); } }
.mfCenterRing { animation: mfCenterRingSpin 90s linear infinite; will-change: transform; }
@media (prefers-reduced-motion: reduce) {
  .mfOrbitRing, .mfOrbitDot, .mfCenterBreathe, .mfCenterRing { animation: none; }
}
`

interface RingSpec {
  group: SkillGroupId
  tools: ToolUsage[]
  radius: number
  duration: number
  ccw: boolean
  startAngle: number
}

export function OrbitLayout({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, toolsByGroup, storesPerGroup, formatTool, formatGroup } = data
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = useReducedMotion()
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)
  const [openTool, setOpenTool] = useState<string | null>(null)
  const [hoveredGroup, setHoveredGroup] = useState<SkillGroupId | null>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const filter = useSkillsFilter(groups)

  const hoveredToolUsage = hoveredTool ? (toolUsageById.get(hoveredTool) ?? null) : null
  const openToolUsage = openTool ? (toolUsageById.get(openTool) ?? null) : null
  const emphasizedGroup = hoveredGroup ?? hoveredToolUsage?.group ?? openToolUsage?.group ?? null

  useSheetHistory(openTool, () => setOpenTool(null), {
    param: 'tool',
    open: (slug) => {
      if (toolUsageById.has(slug)) setOpenTool(slug)
    },
  })

  // Fewest tools innermost so the busiest group (Shopify, 13 tools) gets the longest ring circumference.
  const ringOrder = useMemo<SkillGroupId[]>(() => [...groups].sort((a, b) => toolsByGroup[a].length - toolsByGroup[b].length), [groups, toolsByGroup])

  const { min: minTotal, max: maxTotal } = useMemo(() => {
    const totals = groups.flatMap((g) => toolsByGroup[g].map((u) => u.total))
    return { min: Math.min(...totals), max: Math.max(...totals) }
  }, [groups, toolsByGroup])

  // The two busiest tools per group stay labeled permanently.
  const alwaysLabeled = useMemo(() => {
    const set = new Set<string>()
    for (const g of groups) {
      const top2 = [...toolsByGroup[g]].sort((a, b) => b.total - a.total).slice(0, 2)
      for (const u of top2) set.add(u.tool)
    }
    return set
  }, [groups, toolsByGroup])

  if (!isDesktop || reduced) {
    return <LedgerLayout data={data} />
  }

  const ringSpecs: RingSpec[] = ringOrder.map((g, ri) => ({
    group: g,
    tools: toolsByGroup[g],
    radius: RADII[ri],
    duration: DURATIONS[ri],
    ccw: ri % 2 === 1,
    startAngle: ri * 0.4 - Math.PI / 2,
  }))

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--tiltX', `${(px * 8).toFixed(2)}deg`)
    el.style.setProperty('--tiltY', `${(-py * 8).toFixed(2)}deg`)
  }
  const onPointerLeave = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.setProperty('--tiltX', '0deg')
    el.style.setProperty('--tiltY', '0deg')
  }

  const onDotKeyDown = (tool: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape' && openTool === tool) {
      setOpenTool(null)
      e.currentTarget.blur()
    }
  }
  const onDotEnter = (tool: string) => () => setHoveredTool(tool)
  const onDotLeave = () => setHoveredTool(null)
  const onDotFocus = (tool: string) => () => setHoveredTool(tool)
  const onDotBlur = (tool: string) => () => setHoveredTool((prev) => (prev === tool ? null : prev))
  const onDotClick = (tool: string) => () => setOpenTool((prev) => (prev === tool ? null : tool))

  return (
    <div className="mt-4">
      <style>{ORBIT_CSS}</style>

      <SkillsFilterBar
        skin={skin}
        sk={sk}
        groups={ringOrder}
        groupLabel={groupLabel}
        toolsByGroup={toolsByGroup}
        storesPerGroup={storesPerGroup}
        formatGroup={formatGroup}
        filter={filter}
        onHoverGroup={setHoveredGroup}
      />

      <div className="relative mx-auto mt-6 aspect-square w-full max-w-[680px] overflow-visible [perspective:1400px]">
        <div
          ref={tiltRef}
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' } as CSSProperties}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          {/* Static rings — inert decoration, never rotates itself. Group-name labels are a SEPARATE
              svg layer painted after (on top of) the rotating dots below: the ambient rotation sweeps
              every dot through the label's fixed 12-o'clock position over the course of its cycle, so
              a label that merely sat *underneath* the dot layer in paint order would go fully or
              partly unreadable for part of every rotation on any ring with more than a couple of tools
              — measured on this ring set, that's most of them. The guide path a label's text rides
              still lives here; <textPath href> resolves by id across the whole document, not just its
              own <svg>, so the second layer can reference it. */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {ringSpecs.map((ring) => {
              const bright = emphasizedGroup === ring.group
              const visibleInGroup = ring.tools.filter(filter.matchesTool).length
              const collapsed = filter.isActive && visibleInGroup === 0
              const dim = (emphasizedGroup !== null && !bright) || collapsed
              const strokeClass = bright && !collapsed ? `${skin.accent} stroke-current` : skin.dark ? 'stroke-white/10' : 'stroke-black/10'
              return (
                <circle
                  key={ring.group}
                  cx="50"
                  cy="50"
                  r={ring.radius}
                  fill="none"
                  strokeWidth={collapsed ? 0.12 : bright ? 0.55 : 0.3}
                  className={`transition-opacity duration-300 ${collapsed ? 'opacity-15' : dim ? 'opacity-30' : 'opacity-100'} ${strokeClass}`}
                />
              )
            })}
            {ringSpecs.map((ring) => (
              <path key={`guide-${ring.group}`} id={`mf-orbit-arc-${ring.group}`} d={textArcPath(ring.radius)} fill="none" opacity="0" />
            ))}
          </svg>

          {/* Rotating dot layer — one wrapper per ring, transform-only ambient spin. */}
          {/* A group of toggle buttons, not a list: aria-pressed is not allowed on a listitem (Lighthouse aria-allowed-attr). */}
          <div role="group" aria-label={sk.eyebrow} className="absolute inset-0">
            {ringSpecs.map((ring) => (
              <div
                key={ring.group}
                // Each wrapper's square bounding box is larger than the ring circle it carries — a
                // later (bigger) ring's empty corners sit on top of an earlier (smaller) ring's dots in
                // paint order and, left alone, silently swallow their hover/click. The wrapper itself
                // never needs to be a pointer target; only its dots do.
                className={`mfOrbitRing pointer-events-none absolute rounded-full ${ring.ccw ? 'mfCCW' : ''}`}
                style={
                  {
                    left: `${50 - ring.radius}%`,
                    top: `${50 - ring.radius}%`,
                    width: `${ring.radius * 2}%`,
                    height: `${ring.radius * 2}%`,
                    '--orbit-duration': `${ring.duration}s`,
                  } as CSSProperties
                }
              >
                {ring.tools.map((u, ti) => {
                  const n = ring.tools.length
                  const angle = ring.startAngle + (Math.PI * 2 * (ti + 0.5)) / n
                  const cx = 50 + 50 * Math.cos(angle)
                  const cy = 50 + 50 * Math.sin(angle)
                  const isOpen = openTool === u.tool
                  const isEmphasized = hoveredTool === u.tool || isOpen
                  const labelBelow = Math.sin(angle) >= 0
                  const showLabel = isEmphasized || alwaysLabeled.has(u.tool)
                  const size = sizeForTotal(u.total, minTotal, maxTotal)
                  const filteredOut = filter.isActive && !filter.matchesTool(u)
                  const dim = (emphasizedGroup !== null && emphasizedGroup !== u.group && !isEmphasized) || filteredOut
                  return (
                    <button
                      key={u.tool}
                      type="button"
                      aria-pressed={isOpen}
                      aria-expanded={isOpen}
                      aria-controls={DRAWER_ID}
                      aria-label={`${u.tool} — ${groupLabel[u.group]} — ${formatTool(u)}`}
                      onMouseEnter={onDotEnter(u.tool)}
                      onMouseLeave={onDotLeave}
                      onFocus={onDotFocus(u.tool)}
                      onBlur={onDotBlur(u.tool)}
                      onClick={onDotClick(u.tool)}
                      onKeyDown={onDotKeyDown(u.tool)}
                      tabIndex={filteredOut ? -1 : 0}
                      style={{ left: `${cx}%`, top: `${cy}%` }}
                      className={`group pointer-events-auto absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${dim ? 'opacity-25' : 'opacity-100'} ${filteredOut ? 'pointer-events-none' : ''}`}
                    >
                      {/* Hairline tick bridging the dot to its ring: a sibling of `mfOrbitDot`, not a
                          child of it — it must inherit ONLY the ring's own rotation (so it keeps
                          pointing radially as the ring spins), never the dot's counter-rotation, or
                          it would visibly swing away from the ring as soon as the ring turns. */}
                      <span
                        aria-hidden="true"
                        className={`absolute left-1/2 top-1/2 h-3.5 w-px ${skin.dark ? 'bg-white/20' : 'bg-black/15'}`}
                        style={{ transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI + 90}deg)` }}
                      />
                      {/* Counter-rotates so the disc/label stay upright as the ring spins — its OWN
                          transform must stay pure rotation: the hover/active scale lives one level
                          deeper (a nested span) so it never has to share the `transform` property with
                          the counter-rotation animation, which would silently drop one of the two. */}
                      <span className="mfOrbitDot relative flex items-center justify-center">
                        <span className={`flex items-center justify-center transition-transform duration-200 ${isEmphasized ? 'scale-[1.15]' : ''}`}>
                          <span
                            style={{ height: size, width: size }}
                            className={`flex items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${skin.line} ${isEmphasized ? `${skin.accent} ${skin.dark ? 'bg-white/10' : 'bg-black/[0.04]'}` : `${skin.muted} ${skin.dark ? 'bg-black/20' : 'bg-white/70'}`}`}
                          >
                            {toolIcon(u.tool) ? <ToolMark tool={u.tool} className="h-1/2 w-1/2" /> : monogram(u.tool).slice(0, 1)}
                          </span>
                        </span>
                        <span
                          className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] tabular-nums transition-opacity duration-150 ${showLabel ? 'opacity-90' : 'opacity-0 group-focus-visible:opacity-100'} ${isEmphasized ? skin.chip : skin.dark ? 'text-white/70' : 'text-black/60'} ${labelBelow ? 'top-full mt-1' : 'bottom-full mb-1'} left-1/2 -translate-x-1/2`}
                        >
                          {u.tool}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Group-name arc labels — a layer of their own, painted after (on top of) the rotating
              dots above so a label stays fully legible through the moment a dot orbits behind it,
              instead of the dot winning paint order and eating a letter or two out of the name. */}
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {ringSpecs.map((ring) => {
              const bright = emphasizedGroup === ring.group
              const visibleInGroup = ring.tools.filter(filter.matchesTool).length
              const collapsed = filter.isActive && visibleInGroup === 0
              const dim = (emphasizedGroup !== null && !bright) || collapsed
              return (
                <text
                  key={`label-${ring.group}`}
                  className={`select-none text-[2.3px] font-semibold uppercase transition-opacity duration-300 ${dim ? 'opacity-20' : 'opacity-100'} ${bright && !collapsed ? `${skin.accent} fill-current` : skin.dark ? 'fill-white/65' : 'fill-black/60'}`}
                  style={{ letterSpacing: '0.08em' }}
                >
                  <textPath href={`#mf-orbit-arc-${ring.group}`} startOffset={arcStartOffset(groupLabel[ring.group], ring.radius)}>
                    {groupLabel[ring.group]}
                  </textPath>
                </text>
              )
            })}
          </svg>

          {/* Center ornament: a quiet per-theme "MB" mark — never the fleet totals, which moved into
              `ToolDrawer`'s own fleet-wide strip (2026-09-10, owner: "that data looks horrible
              there"). The only thing that ever changes here is the small hover tooltip floating just
              above it (mouse only, see `.mfHoverTip` in `ORBIT_CSS`), which repeats nothing more than
              the tool's name and group — everything else lives in `ToolDrawer` once a dot is pressed. */}
          <CenterMark skin={skin} />

          {hoveredToolUsage && !openTool && (
            <div
              aria-hidden="true"
              className="mfHoverTip pointer-events-none absolute left-1/2 top-1/2 z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] shadow-[0_6px_18px_rgba(0,0,0,0.14)] transition-opacity duration-150"
              style={{
                transform: 'translate(-50%, calc(-50% - 5.5rem))',
                backgroundColor: skin.dark ? 'rgba(11,11,13,0.95)' : 'rgba(255,255,255,0.95)',
              }}
            >
              <span className={`flex h-3.5 w-3.5 items-center justify-center ${skin.accent}`}>
                {toolIcon(hoveredToolUsage.tool) ? <ToolMark tool={hoveredToolUsage.tool} className="h-3.5 w-3.5" /> : monogram(hoveredToolUsage.tool).slice(0, 1)}
              </span>
              <span className={`font-semibold ${skin.title}`}>{hoveredToolUsage.tool}</span>
              <span className={skin.muted}>· {groupLabel[hoveredToolUsage.group]}</span>
            </div>
          )}
        </div>
      </div>

      {filter.isActive && ringOrder.every((g) => toolsByGroup[g].filter(filter.matchesTool).length === 0) && (
        <p className={`mt-4 text-center text-sm ${skin.muted}`} aria-live="polite">
          {sk.orbit.noMatches}
        </p>
      )}

      <ToolDrawer skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} tool={openToolUsage} open={!!openTool} onClose={() => setOpenTool(null)} />

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
