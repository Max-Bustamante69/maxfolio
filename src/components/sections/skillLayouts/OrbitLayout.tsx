// Layout 5 — "orbit": the section's centerpiece. Six skill groups become concentric rings (fewest
// tools innermost, so dots never crowd); every ring carries its group name along the arc and its two
// most-used tools stay labeled at rest, so the composition reads without a single interaction. Each
// ring drifts in a slow, alternating ambient rotation (transform-only CSS, pauses on hover/focus) while
// its dots counter-rotate so icons/labels stay upright; the whole orbit tilts gently toward the pointer.
// The center is a real card: the six-group fleet totals at rest, the selected tool's story once one is
// hovered, focused or pinned. Below 1024px it falls back to layout 1 (ledger) — fully legible and
// keyboard/touch operable on its own — and so does reduced motion (an orbit is inherently a
// motion-heavy metaphor even though most of its geometry is static). A compact mobile orbit (three
// rings, tap to select) was measured and cut: Shopify alone is 13 tools, and even the best pairing
// puts 20+ tools on a half-ring inside a ~340px container — ~25px of arc per dot, well under a 44px
// tap target, so nothing short of hiding most of the labels/dots stays legible there. The brief's own
// escape hatch for this ("if it stays legible — else ledger only") is why ledger covers all of <1024px.
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../../hooks'
import type { RoleWorkId, SkillGroupId } from '../../../data/registry'
import { toolUsageById, fleetLiquidLines, fleetIslandLines, fleetStoreCount, fleetProductCount, type ToolUsage } from '../../../data/skillUsage'
import { toolIcon, monogram, ToolMark } from '../skillIcons'
import { CountUp } from '../../gallery/charts'
import { LedgerLayout } from './LedgerLayout'
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
 *  React state or per-frame work involved. */
const ORBIT_CSS = `
@keyframes mfOrbitCW { to { transform: rotate(360deg); } }
@keyframes mfOrbitCCW { to { transform: rotate(-360deg); } }
.mfOrbitRing { animation: mfOrbitCW var(--orbit-duration, 120s) linear infinite; will-change: transform; }
.mfOrbitRing.mfCCW { animation-name: mfOrbitCCW; }
.mfOrbitRing:hover, .mfOrbitRing:focus-within { animation-play-state: paused; }
.mfOrbitDot { animation: mfOrbitCCW var(--orbit-duration, 120s) linear infinite; will-change: transform; }
.mfOrbitRing.mfCCW .mfOrbitDot { animation-name: mfOrbitCW; }
.mfOrbitRing:hover .mfOrbitDot, .mfOrbitRing:focus-within .mfOrbitDot { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .mfOrbitRing, .mfOrbitDot { animation: none; }
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
  const { strings, registry } = useContent()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const [hoveredGroup, setHoveredGroup] = useState<SkillGroupId | null>(null)
  const tiltRef = useRef<HTMLDivElement>(null)

  const active = hovered ?? locked
  const pinned = !!locked && locked === active
  const activeTool = active ? (toolUsageById.get(active) ?? null) : null
  const emphasizedGroup = hoveredGroup ?? activeTool?.group ?? null

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

  const roleWorkName = (id: RoleWorkId) => {
    const w = registry.roleWork.find((r) => r.id === id)
    const company = w ? registry.experience.find((e) => e.id === w.role)?.company : undefined
    const label = strings.roleWork[id]
    return company ? `${label} · ${company}` : label
  }

  const centerNames = activeTool ? [...activeTool.storeNames, ...activeTool.productNames, ...activeTool.roleWorkIds.map(roleWorkName)].slice(0, 6) : []
  const centerDepth =
    activeTool?.tool === 'Liquid'
      ? { label: sk.depthLabel.liquid, value: fleetLiquidLines }
      : activeTool?.tool === 'TypeScript'
        ? { label: sk.depthLabel.ts, value: fleetIslandLines }
        : null

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
    if (e.key === 'Escape') {
      setLocked((prev) => (prev === tool ? null : prev))
      e.currentTarget.blur()
    }
  }

  return (
    <div className="mt-4">
      <style>{ORBIT_CSS}</style>

      <div className="relative mx-auto aspect-square w-full max-w-[680px] overflow-visible [perspective:1400px]">
        <div ref={tiltRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' } as CSSProperties} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
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
              const dim = emphasizedGroup !== null && !bright
              const strokeClass = bright ? `${skin.accent} stroke-current` : skin.dark ? 'stroke-white/10' : 'stroke-black/10'
              return (
                <circle
                  key={ring.group}
                  cx="50"
                  cy="50"
                  r={ring.radius}
                  fill="none"
                  strokeWidth={bright ? 0.55 : 0.3}
                  className={`transition-opacity duration-300 ${dim ? 'opacity-30' : 'opacity-100'} ${strokeClass}`}
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
                  const isActive = active === u.tool
                  const isPressed = locked === u.tool
                  const labelBelow = Math.sin(angle) >= 0
                  const showLabel = isActive || alwaysLabeled.has(u.tool)
                  const size = sizeForTotal(u.total, minTotal, maxTotal)
                  const dim = emphasizedGroup !== null && emphasizedGroup !== u.group && !isActive
                  return (
                    <button
                      key={u.tool}
                      type="button"
                      aria-pressed={isPressed}
                      aria-label={`${u.tool} — ${groupLabel[u.group]} — ${formatTool(u)}`}
                      onMouseEnter={() => setHovered(u.tool)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(u.tool)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setLocked((prev) => (prev === u.tool ? null : u.tool))}
                      onKeyDown={onDotKeyDown(u.tool)}
                      style={{ left: `${cx}%`, top: `${cy}%` }}
                      className={`group pointer-events-auto absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${dim ? 'opacity-25' : 'opacity-100'}`}
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
                        <span className={`flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-[1.15]' : ''}`}>
                          <span
                            style={{ height: size, width: size }}
                            className={`flex items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${skin.line} ${isActive ? `${skin.accent} ${skin.dark ? 'bg-white/10' : 'bg-black/[0.04]'}` : `${skin.muted} ${skin.dark ? 'bg-black/20' : 'bg-white/70'}`}`}
                          >
                            {toolIcon(u.tool) ? <ToolMark tool={u.tool} className="h-1/2 w-1/2" /> : monogram(u.tool).slice(0, 1)}
                          </span>
                        </span>
                        <span
                          className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] tabular-nums transition-opacity duration-150 ${isActive ? 'opacity-100' : showLabel ? 'opacity-90' : 'opacity-0 group-focus-visible:opacity-100'} ${isActive ? skin.chip : skin.dark ? 'text-white/70' : 'text-black/60'} ${labelBelow ? 'top-full mt-1' : 'bottom-full mb-1'} left-1/2 -translate-x-1/2`}
                        >
                          {isActive ? `${u.tool} · ${formatTool(u)}` : u.tool}
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
              const dim = emphasizedGroup !== null && !bright
              return (
                <text
                  key={`label-${ring.group}`}
                  className={`select-none text-[2.3px] font-semibold uppercase transition-opacity duration-300 ${dim ? 'opacity-20' : 'opacity-100'} ${bright ? `${skin.accent} fill-current` : skin.dark ? 'fill-white/65' : 'fill-black/60'}`}
                  style={{ letterSpacing: '0.08em' }}
                >
                  <textPath href={`#mf-orbit-arc-${ring.group}`} startOffset={arcStartOffset(groupLabel[ring.group], ring.radius)}>
                    {groupLabel[ring.group]}
                  </textPath>
                </text>
              )
            })}
          </svg>

          {/* Center card: fleet totals at rest, the selected tool's real story once one is active. */}
          <div className={`absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[28px] border p-3 text-center ${skin.line} ${skin.dark ? 'bg-white/[0.04]' : 'bg-white/70'}`} aria-live="polite">
            {activeTool ? (
              <>
                <span className={`mb-1.5 flex h-8 w-8 items-center justify-center ${skin.accent}`}>
                  {toolIcon(activeTool.tool) ? <ToolMark tool={activeTool.tool} className="h-5 w-5" /> : monogram(activeTool.tool)}
                </span>
                <p className={`px-2 text-[12px] font-semibold leading-tight ${skin.title}`}>{activeTool.tool}</p>
                <p className={`mt-0.5 text-[9px] uppercase tracking-wide ${skin.muted}`}>{groupLabel[activeTool.group]}</p>
                <p className={`mt-1.5 px-2 text-[10px] leading-tight ${skin.muted}`}>{formatTool(activeTool)}</p>
                {centerNames.length > 0 && (
                  <ul className="mt-1.5 flex max-w-full flex-wrap justify-center gap-1 px-1">
                    {centerNames.map((n) => (
                      <li key={n} className={`truncate ${skin.chip}`} style={{ maxWidth: 96 }}>
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
                {centerDepth && (
                  <div className={`mt-2 border-t pt-1.5 ${skin.line}`}>
                    <p className={`text-sm font-semibold tabular-nums ${skin.title}`}>
                      <CountUp value={centerDepth.value} />
                    </p>
                    <p className={`text-[8px] uppercase leading-tight tracking-wide ${skin.muted}`}>{centerDepth.label}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { value: fleetStoreCount, label: sk.depthLabel.stores },
                  { value: fleetProductCount, label: sk.layoutExtra.productsLabel },
                  { value: fleetLiquidLines, label: sk.depthLabel.liquid },
                  { value: fleetIslandLines, label: sk.depthLabel.ts },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className={`text-base font-semibold tabular-nums ${skin.title}`}>
                      <CountUp value={stat.value} />
                    </p>
                    <p className={`text-[7.5px] leading-tight uppercase tracking-wide ${skin.muted}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend: real per-group counts; hovering/focusing one dims every other ring's dots. */}
      <div role="group" aria-label={sk.groupSelectorLabel} className="mt-6 flex flex-wrap justify-center gap-x-2 gap-y-1.5">
        {ringOrder.map((g) => (
          <button
            key={g}
            type="button"
            onMouseEnter={() => setHoveredGroup(g)}
            onMouseLeave={() => setHoveredGroup(null)}
            onFocus={() => setHoveredGroup(g)}
            onBlur={() => setHoveredGroup(null)}
            className={`rounded-full px-2.5 py-1 text-[11px] transition-opacity duration-200 ${emphasizedGroup !== null && emphasizedGroup !== g ? 'opacity-40' : 'opacity-100'} ${emphasizedGroup === g ? skin.chipOn : skin.chip}`}
          >
            {groupLabel[g]} · {toolsByGroup[g].length} {sk.layoutExtra.toolsSuffix} · {formatGroup(storesPerGroup[g])}
          </button>
        ))}
      </div>

      {pinned && activeTool && (
        <p className={`mt-2 text-center text-[11px] ${skin.muted}`}>
          <button type="button" className={`underline ${skin.accent}`} onClick={() => setLocked(null)}>
            {sk.layoutExtra.unpin}
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
