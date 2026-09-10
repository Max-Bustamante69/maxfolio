import { useMemo, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import { Ticker } from '../common'
import type { SkillGroupId } from '../../data/registry'
import { toolUsage, storesPerGroup, fleetLiquidLines, fleetIslandLines, fleetStoreCount } from '../../data/skillUsage'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { SkillsSunburst, sameSel, type SunburstSelection } from './SkillsSunburst'
import { SkillPanel } from './SkillPanel'
import { formatTool, formatGroup, type SkillsStrings } from './skillsFormat'

interface SkillsProps {
  skin: Skin
  heading: SectionHeading
  /** Overrides the usage ledger's track background, e.g. a recessed Neo groove instead of the flat tint. */
  trackClassName?: string
}

const EASE = [0.23, 1, 0.32, 1] as const
const label = (skin: Skin) => `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`

/** `skin.accent` as TEXT (not a small badge/eyebrow) for the hover/focus-highlighted tool name below.
 *  Luxury's light accent (`#C9A962` on the `#faf8f5` page) is a fill/border color tuned for large
 *  gold hairlines, not type — it measures ~2.1:1 on that surface, under WCAG AA even at this large
 *  (22px/bold) size. `#836e40` is the same gold family darkened until it clears 4.5:1 there (measured).
 *  Luxury dark (`deco-gold` on the navy surface) already clears 7.6:1 and needs no override. */
const sentenceAccentClass = (skin: Skin) => (skin.frame === 'luxury' && !skin.dark ? 'text-[#836e40]' : skin.accent)

/** What to count across the store index, keyed to the labels in the locale files. */
const USAGE: { id: string; test: RegExp }[] = [
  { id: 'liquid', test: /liquid/i },
  { id: 'react', test: /react/i },
  { id: 'framer', test: /framer/i },
  { id: 'tailwind', test: /tailwind/i },
  { id: 'metaobjects', test: /metaobject/i },
  { id: 'tracking', test: /track|pixel/i },
  { id: 'bundles', test: /bundle/i },
  { id: 'quiz', test: /quiz/i },
  { id: 'reviews', test: /review/i },
  { id: 'migration', test: /woocommerce|transfer|migrat/i },
]

interface SentenceProps {
  sk: SkillsStrings
  skin: Skin
  g: SkillGroupId
  groupTools: readonly string[]
  /** `hovered ?? locked` — drives the highlight. */
  active: SunburstSelection
  /** The persistent selection alone — drives the pinned indicator, independent of hover. */
  locked: SunburstSelection
  onToolHover: (g: SkillGroupId, tool: string) => void
  onToolHoverEnd: () => void
  onToolToggle: (g: SkillGroupId, tool: string) => void
  onToolUnlock: () => void
}

/** Hoisted to module scope (never redefined per Skills() render) so a parent re-render — a sunburst
 *  hover, a media-query flip — reconciles these spans in place instead of tearing them down: a nested
 *  component here would drop keyboard focus on every re-render and, worse, reset any child with its
 *  own mount-triggered animation state (see TriStat below). */
function Sentence({ sk, skin, g, groupTools, active, locked, onToolHover, onToolHoverEnd, onToolToggle, onToolUnlock }: SentenceProps) {
  const [before, after] = sk.narrative[g].split('{skills}')
  return (
    <>
      {before}
      {groupTools.map((tool, i) => {
        const on = active?.level === 'tool' && active.group === g && active.tool === tool
        const pinned = locked?.level === 'tool' && locked.group === g && locked.tool === tool
        return (
          <span key={tool}>
            <span
              tabIndex={0}
              role="button"
              aria-label={`${tool} — ${formatTool(sk, toolUsage.find((u) => u.group === g && u.tool === tool)!)}`}
              aria-pressed={pinned}
              onMouseEnter={() => onToolHover(g, tool)}
              onMouseLeave={onToolHoverEnd}
              onFocus={() => onToolHover(g, tool)}
              onBlur={onToolHoverEnd}
              onClick={() => onToolToggle(g, tool)}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToolToggle(g, tool)
                } else if (e.key === 'Escape') {
                  onToolUnlock()
                }
              }}
              className={`cursor-pointer font-semibold underline decoration-2 transition-colors ${pinned ? 'underline-offset-[6px]' : 'underline-offset-4'} ${on ? `${sentenceAccentClass(skin)} decoration-current` : `${skin.title} decoration-transparent`}`}
            >
              {tool}
            </span>
            {i < groupTools.length - 1 ? (i === groupTools.length - 2 ? <span className={skin.muted}> · </span> : <span className={skin.muted}>, </span>) : ''}
          </span>
        )
      })}
      {after}
    </>
  )
}

interface LedgerProps {
  sk: SkillsStrings
  skin: Skin
  track: string
  reduced: boolean | null
  usage: { rows: { id: string; count: number }[]; max: number }
  storesCount: number
}

function Ledger({ sk, skin, track, reduced, usage, storesCount }: LedgerProps) {
  return (
    <div>
      <p className={label(skin)}>{sk.usageLabel}</p>
      <ol className="mt-4 space-y-3">
        {usage.rows.map((r, i) => (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span>{sk.usageItems[r.id] ?? r.id}</span>
              <span className={`${skin.muted} tabular-nums`}>
                {r.count} {sk.usageUnit}
              </span>
            </div>
            <div className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${track}`}>
              <m.div
                className={`h-full rounded-full ${skin.accentBg}`}
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: EASE }}
                style={{ width: `${(r.count / usage.max) * 100}%`, transformOrigin: 'left' }}
              />
            </div>
          </li>
        ))}
      </ol>
      <p className={`${skin.muted} mt-4 text-xs leading-relaxed`}>{sk.usageNote.replace('{n}', String(storesCount))}</p>
    </div>
  )
}

interface TriStatProps {
  sk: SkillsStrings
  skin: Skin
  active: SunburstSelection
  groupLabel: Record<SkillGroupId, string>
}

/** A compact 3-number depth readout: two fleet-wide totals (always the same, real, from telemetry)
 *  plus a third figure that reads whatever's currently active on the sunburst — a group's real
 *  store count, a tool's real usage, or the fleet's store count when nothing is focused.
 *  Hoisted to module scope: `CountUp` below only counts up once on mount, so this component's
 *  identity must stay stable across `Skills()` re-renders (a sunburst hover updates `active` on every
 *  parent render) — a nested definition here previously got redefined every render, which unmounted
 *  and remounted `CountUp` before its 1s tween ever finished, freezing both numbers at "0". */
function TriStat({ sk, skin, active, groupLabel }: TriStatProps) {
  const dynamicLabel =
    active?.level === 'tool'
      ? formatTool(sk, toolUsage.find((u) => u.group === active.group && u.tool === active.tool)!)
      : active?.level === 'group'
        ? formatGroup(sk, storesPerGroup[active.group])
        : sk.sunburst.triStoresDefault.replace('{n}', String(fleetStoreCount))
  return (
    <div className={`mt-7 grid grid-cols-3 gap-3 border-t pt-5 text-center ${skin.line}`}>
      <div>
        <p className={`text-lg font-semibold tabular-nums ${skin.title}`}>
          <CountUp value={fleetLiquidLines} />
        </p>
        <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide ${skin.muted}`}>{sk.sunburst.triLiquid}</p>
      </div>
      <div>
        <p className={`text-lg font-semibold tabular-nums ${skin.title}`}>
          <CountUp value={fleetIslandLines} />
        </p>
        <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide ${skin.muted}`}>{sk.sunburst.triTs}</p>
      </div>
      <div>
        <p className={`text-sm font-semibold leading-tight ${skin.title}`}>{dynamicLabel}</p>
        {active && <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide ${skin.muted}`}>{groupLabel[active.group]}</p>}
      </div>
    </div>
  )
}

interface RingLegendProps {
  sk: SkillsStrings
  skin: Skin
  groups: SkillGroupId[]
  groupLabel: Record<SkillGroupId, string>
  locked: SunburstSelection
  onToggleGroup: (g: SkillGroupId) => void
  onToggleTool: (g: SkillGroupId, tool: string) => void
}

/** Mobile substitute for the SVG: one horizontally scrollable row of group capsules, each carrying
 *  its own tools as small real-count chips — the ring legend the brief calls for, touch-sized. Every
 *  header and chip is a real button: tapping one locks it, feeding the same SkillPanel the ring uses
 *  on desktop (an underline marks whichever one is currently pinned). */
function RingLegend({ sk, skin, groups, groupLabel, locked, onToggleGroup, onToggleTool }: RingLegendProps) {
  return (
    <div>
      <p className={label(skin)}>{sk.sunburst.legendLabel}</p>
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar" role="list" aria-label={sk.sunburst.legendLabel}>
        {groups.map((g) => {
          const groupTools = toolUsage.filter((u) => u.group === g)
          const groupPinned = locked?.level === 'group' && locked.group === g
          return (
            <div key={g} role="listitem" className={`w-[220px] shrink-0 rounded-2xl border p-4 ${skin.line}`}>
              <button type="button" onClick={() => onToggleGroup(g)} aria-pressed={groupPinned} className="flex w-full items-baseline justify-between gap-2 text-left">
                <span className={`text-sm font-semibold underline decoration-2 underline-offset-4 ${groupPinned ? 'decoration-current' : 'decoration-transparent'} ${skin.title}`}>{groupLabel[g]}</span>
                <span className={`${skin.muted} text-[11px] tabular-nums`}>{formatGroup(sk, storesPerGroup[g])}</span>
              </button>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {groupTools.map((u) => {
                  const toolPinned = locked?.level === 'tool' && locked.group === g && locked.tool === u.tool
                  return (
                    <button
                      type="button"
                      key={u.tool}
                      onClick={() => onToggleTool(g, u.tool)}
                      aria-pressed={toolPinned}
                      title={`${u.tool} — ${formatTool(sk, u)}`}
                      className={`${u.total > 0 || toolPinned ? skin.chipOn : skin.chip} ${toolPinned ? 'underline decoration-2 underline-offset-2' : ''}`}
                    >
                      {u.tool}
                      {u.total > 0 ? <span className="ml-1 tabular-nums opacity-80">{u.total}</span> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The stack three ways, none a grid of tiles: a radial sunburst of the real skillGroups/usage data
 * (center = the person, ring 1 = the six groups, ring 2 = every tool, arc length = a real usage count),
 * the tools as sentences with the names set bold inline and wired to the same hover/focus state as the
 * arcs, and — on phones, where the sunburst can't hold touch precision — a horizontally scrollable ring
 * legend plus the original bar ledger. Every number either comes from `skillUsage.ts` (real fleet
 * counts) or is explicitly labeled as not yet counted; nothing here is a placeholder.
 *
 * Selection has two layers: `hovered` (mouse/focus, transient) and `locked` (click/tap/Enter,
 * persists until toggled off or Esc) — `active = hovered ?? locked` is what every arc/sentence/chip
 * highlights, so pinning a tool keeps the panel on it even after the pointer moves away.
 */
export function Skills({ skin, heading, trackClassName }: SkillsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const sk = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const [open, setOpen] = useState<SkillGroupId>(groups[0])
  const [hovered, setHovered] = useState<SunburstSelection>(null)
  const [locked, setLocked] = useState<SunburstSelection>(null)
  const active = hovered ?? locked
  const track = trackClassName ?? (skin.dark ? 'bg-white/10' : 'bg-black/[0.06]')
  const groupLabel = sk.groups as Record<SkillGroupId, string>

  // Every tool named across the groups, deduplicated, in group order — real registry data, not a curated highlight reel.
  const tools = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const g of groups) {
      for (const tool of registry.skillGroups[g] as readonly string[]) {
        if (!seen.has(tool)) {
          seen.add(tool)
          out.push(tool)
        }
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry.skillGroups])

  const usage = useMemo(() => {
    const rows = USAGE.map((u) => ({ id: u.id, count: registry.stores.filter((s) => s.stack.some((t) => u.test.test(t))).length }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    return { rows, max: rows[0]?.count ?? 1 }
  }, [registry.stores])

  const onHover = (sel: SunburstSelection) => setHovered(sel)
  const onHoverEnd = () => setHovered(null)
  const onToggleLock = (sel: SunburstSelection) => setLocked((prev) => (sameSel(prev, sel) ? null : sel))
  const onUnlock = () => setLocked(null)
  const onToolHover = (g: SkillGroupId, tool: string) => onHover({ level: 'tool', group: g, tool })
  const onToolToggle = (g: SkillGroupId, tool: string) => onToggleLock({ level: 'tool', group: g, tool })
  const onGroupToggle = (g: SkillGroupId) => onToggleLock({ level: 'group', group: g })
  const pinned = !!locked && sameSel(locked, active)

  return (
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      {wide ? (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SkillsSunburst
              skin={skin}
              groups={groups}
              groupLabel={groupLabel}
              hovered={hovered}
              locked={locked}
              onHover={onHover}
              onHoverEnd={onHoverEnd}
              onToggleLock={onToggleLock}
              onUnlock={onUnlock}
              format={{ tool: (u) => formatTool(sk, u), group: (n) => formatGroup(sk, n), caption: sk.sunburst.caption }}
            />
            <TriStat sk={sk} skin={skin} active={active} groupLabel={groupLabel} />
          </div>
          <div className="lg:col-span-3">
            <SkillPanel skin={skin} selection={active} pinned={pinned} onUnpin={onUnlock} />
          </div>
          <div className="lg:col-span-5">
            <div className="space-y-7 md:space-y-8">
              {groups.map((g, gi) => (
                <m.p
                  key={g}
                  className="text-lg leading-[1.7] tracking-[-0.01em] md:text-[22px] md:leading-[1.7]"
                  initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: gi * 0.05, ease: EASE }}
                >
                  <span className={`${skin.accent} mr-3 align-middle text-[11px] font-semibold uppercase tracking-[0.18em]`}>{groupLabel[g]}</span>
                  <span className={skin.muted}>
                    <Sentence
                      sk={sk}
                      skin={skin}
                      g={g}
                      groupTools={registry.skillGroups[g] as readonly string[]}
                      active={active}
                      locked={locked}
                      onToolHover={onToolHover}
                      onToolHoverEnd={onHoverEnd}
                      onToolToggle={onToolToggle}
                      onToolUnlock={onUnlock}
                    />
                  </span>
                </m.p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <RingLegend sk={sk} skin={skin} groups={groups} groupLabel={groupLabel} locked={locked} onToggleGroup={onGroupToggle} onToggleTool={onToolToggle} />
          <div className="mt-6">
            <SkillPanel skin={skin} selection={active} pinned={pinned} onUnpin={onUnlock} />
          </div>
          <div className="mt-10">
            <Ledger sk={sk} skin={skin} track={track} reduced={reduced} usage={usage} storesCount={registry.stores.length} />
          </div>
          <div className={`mt-10 border-t ${skin.line}`}>
            {groups.map((g) => {
              const on = open === g
              const count = registry.skillGroups[g].length
              return (
                <div key={g} className={`border-b ${skin.line}`}>
                  <button type="button" aria-expanded={on} aria-controls={`skills-${g}`} onClick={() => setOpen(g)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                    <span className={`${on ? skin.title : skin.muted} text-lg font-semibold transition-colors`}>{groupLabel[g]}</span>
                    <span className={`${skin.muted} flex items-center gap-2 text-xs tabular-nums`}>
                      {count}
                      <m.svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" animate={{ rotate: on ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }}>
                        <path d="m4 6 4 4 4-4" />
                      </m.svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <m.div id={`skills-${g}`} key="panel" className="overflow-hidden" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                        <p className={`${skin.muted} pb-5 text-base leading-[1.7]`}>
                          <Sentence
                            sk={sk}
                            skin={skin}
                            g={g}
                            groupTools={registry.skillGroups[g] as readonly string[]}
                            active={active}
                            locked={locked}
                            onToolHover={onToolHover}
                            onToolHoverEnd={onHoverEnd}
                            onToolToggle={onToolToggle}
                            onToolUnlock={onUnlock}
                          />
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-14 rail-wide md:mt-16">
        <Ticker
          variant="outline-fill"
          duration={38}
          label={sk.usageLabel}
          items={tools}
          keyOf={(t) => t}
          itemClassName="shrink-0 whitespace-nowrap px-5 py-2 font-sf text-2xl font-semibold tracking-[-0.02em] md:text-4xl"
          renderItem={(t) => t}
        />
      </div>
    </section>
  )
}
