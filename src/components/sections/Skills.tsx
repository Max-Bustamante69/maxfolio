import { useMemo, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import { Ticker } from '../common'
import type { SkillGroupId } from '../../data/registry'
import { toolUsage, storesPerGroup, storeNamesByTool, fleetLiquidLines, fleetIslandLines, fleetStoreCount, type ToolUsage } from '../../data/skillUsage'
import { personaArt } from '../../data/personaArt'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { SkillsSunburst, type SunburstSelection } from './SkillsSunburst'
import type { PortfolioContent } from '../../content/types'

interface SkillsProps {
  skin: Skin
  heading: SectionHeading
  /** Overrides the usage ledger's track background, e.g. a recessed Neo groove instead of the flat tint. */
  trackClassName?: string
}

type SkillsStrings = PortfolioContent['sections']['skills']

const EASE = [0.23, 1, 0.32, 1] as const
const label = (skin: Skin) => `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many).replace('{n}', String(n))
const formatTool = (sk: SkillsStrings, u: ToolUsage) => {
  const parts: string[] = []
  if (u.stores) parts.push(plural(u.stores, sk.sunburst.storesUnitOne, sk.sunburst.storesUnit))
  if (u.products) parts.push(plural(u.products, sk.sunburst.productsUnitOne, sk.sunburst.productsUnit))
  if (u.roleWork) parts.push(plural(u.roleWork, sk.sunburst.roleUnitOne, sk.sunburst.roleUnit))
  return parts.length ? parts.join(' · ') : sk.sunburst.noData
}
const formatGroup = (sk: SkillsStrings, n: number) => plural(n, sk.sunburst.storesUnitOne, sk.sunburst.storesUnit)

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
  active: SunburstSelection
  onToolEnter: (g: SkillGroupId, tool: string) => void
  onToolLeave: () => void
}

/** Hoisted to module scope (never redefined per Skills() render) so a parent re-render — a sunburst
 *  hover, a media-query flip — reconciles these spans in place instead of tearing them down: a nested
 *  component here would drop keyboard focus on every re-render and, worse, reset any child with its
 *  own mount-triggered animation state (see TriStat below). */
function Sentence({ sk, skin, g, groupTools, active, onToolEnter, onToolLeave }: SentenceProps) {
  const [before, after] = sk.narrative[g].split('{skills}')
  return (
    <>
      {before}
      {groupTools.map((tool, i) => {
        const on = active?.level === 'tool' && active.group === g && active.tool === tool
        return (
          <span key={tool}>
            <span
              tabIndex={0}
              role="button"
              aria-label={`${tool} — ${formatTool(sk, toolUsage.find((u) => u.group === g && u.tool === tool)!)}`}
              onMouseEnter={() => onToolEnter(g, tool)}
              onMouseLeave={onToolLeave}
              onFocus={() => onToolEnter(g, tool)}
              onBlur={onToolLeave}
              className={`cursor-pointer font-semibold underline decoration-2 underline-offset-4 transition-colors ${on ? `${sentenceAccentClass(skin)} decoration-current` : `${skin.title} decoration-transparent`}`}
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
  // Persona/Arcade gets its own comic device on these three numbers: a thick-bordered tilted panel
  // per cell, alternating tilt direction (never a plain grid line like the other four themes).
  const persona = skin.frame === 'persona'
  const cell = (i: number) => (persona ? `persona-num-panel px-2 py-3 ${i === 1 ? '' : i === 0 ? '-rotate-2' : 'rotate-2'}` : '')
  return (
    <div className={`mt-7 grid grid-cols-3 ${persona ? 'gap-2.5' : 'gap-3 border-t pt-5'} text-center ${persona ? '' : skin.line}`}>
      <div className={cell(0)}>
        <p className={`text-lg font-semibold tabular-nums ${skin.title}`}>
          <CountUp value={fleetLiquidLines} />
        </p>
        <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide ${skin.muted}`}>{sk.sunburst.triLiquid}</p>
      </div>
      <div className={cell(1)}>
        <p className={`text-lg font-semibold tabular-nums ${skin.title}`}>
          <CountUp value={fleetIslandLines} />
        </p>
        <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide ${skin.muted}`}>{sk.sunburst.triTs}</p>
      </div>
      <div className={cell(2)}>
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
  /** Persona only: tapping/focusing a chip drives the same `active` selection the sunburst/panel use. */
  onToolSelect?: (g: SkillGroupId, tool: string) => void
  active?: SunburstSelection
}

/** Mobile substitute for the SVG: one horizontally scrollable row of group capsules, each carrying
 *  its own tools as small real-count chips — the ring legend the brief calls for, touch-sized. */
function RingLegend({ sk, skin, groups, groupLabel, onToolSelect, active }: RingLegendProps) {
  return (
    <div>
      <p className={label(skin)}>{sk.sunburst.legendLabel}</p>
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar" role="list" aria-label={sk.sunburst.legendLabel}>
        {groups.map((g) => {
          const groupTools = toolUsage.filter((u) => u.group === g)
          return (
            <div key={g} role="listitem" className={`w-[220px] shrink-0 rounded-2xl border p-4 ${skin.line}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-sm font-semibold ${skin.title}`}>{groupLabel[g]}</span>
                <span className={`${skin.muted} text-[11px] tabular-nums`}>{formatGroup(sk, storesPerGroup[g])}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {groupTools.map((u) =>
                  onToolSelect ? (
                    <button
                      key={u.tool}
                      type="button"
                      onClick={() => onToolSelect(g, u.tool)}
                      onFocus={() => onToolSelect(g, u.tool)}
                      className={`${u.total > 0 ? skin.chipOn : skin.chip} ${active?.level === 'tool' && active.tool === u.tool ? 'ring-2 ring-current' : ''}`}
                      title={`${u.tool} — ${formatTool(sk, u)}`}
                    >
                      {u.tool}
                      {u.total > 0 ? <span className="ml-1 tabular-nums opacity-80">{u.total}</span> : null}
                    </button>
                  ) : (
                    <span key={u.tool} className={u.total > 0 ? skin.chipOn : skin.chip} title={`${u.tool} — ${formatTool(sk, u)}`}>
                      {u.tool}
                      {u.total > 0 ? <span className="ml-1 tabular-nums opacity-80">{u.total}</span> : null}
                    </span>
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface PersonaSkillPanelProps {
  sk: SkillsStrings
  skin: Skin
  active: SunburstSelection
  groupLabel: Record<SkillGroupId, string>
}

/** Arcade/Persona-only "selected skill" panel: a slanted ink panel with the Skills-screen comic art
 *  behind it, naming whichever tool or group is hovered/focused/tapped on the sunburst (desktop) or
 *  the ring legend (phones) — the tool's display name, its group, its real fleet usage (and which
 *  stores, by name, from `skillUsage.ts`), and a depth stat in the theme's own thick-bordered number
 *  panel. Idle, it shows the fleet-wide caption instead of an empty box. */
function PersonaSkillPanel({ sk, skin, active, groupLabel }: PersonaSkillPanelProps) {
  const art = useMemo(() => personaArt('skills', skin.dark), [skin.dark])
  const tool = active?.level === 'tool' ? toolUsage.find((u) => u.group === active.group && u.tool === active.tool) : undefined
  const storeNames = tool ? storeNamesByTool[tool.tool] ?? [] : []
  const scrim = skin.dark ? 'rgba(17,16,19,0.88)' : 'rgba(238,243,247,0.9)'

  return (
    <div
      className={`persona-torn relative overflow-hidden border-2 p-5 md:p-6 ${skin.dark ? 'border-[#c8102e]/40' : 'border-[#1c6fb0]/35'}`}
      style={{ backgroundImage: `linear-gradient(${scrim},${scrim}), url(${art})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <p className={label(skin)}>{sk.sunburst.legendLabel}</p>
      {tool ? (
        <div className="mt-3">
          <p className={`font-persona-display text-2xl uppercase leading-tight md:text-3xl ${skin.title}`} style={{ fontStyle: 'oblique 6deg' }}>
            {tool.tool}
          </p>
          <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.15em] ${skin.accent}`}>{groupLabel[tool.group]}</p>
          <p className={`mt-3 text-sm ${skin.body}`}>{formatTool(sk, tool)}</p>
          {storeNames.length > 0 && <p className={`mt-1.5 text-xs leading-relaxed ${skin.muted}`}>{storeNames.join(' · ')}</p>}
          <div className="persona-num-panel mt-4 inline-flex items-baseline gap-2 px-3 py-1.5">
            <span className={`text-xl font-semibold tabular-nums ${skin.title}`}>{tool.total}</span>
            <span className={`text-[10px] uppercase tracking-wide ${skin.muted}`}>{sk.sunburst.depthLabel}</span>
          </div>
        </div>
      ) : active?.level === 'group' ? (
        <div className="mt-3">
          <p className={`font-persona-display text-2xl uppercase leading-tight md:text-3xl ${skin.title}`} style={{ fontStyle: 'oblique 6deg' }}>
            {groupLabel[active.group]}
          </p>
          <p className={`mt-3 text-sm ${skin.body}`}>{formatGroup(sk, storesPerGroup[active.group])}</p>
        </div>
      ) : (
        <p className={`mt-3 text-sm ${skin.muted}`}>{sk.sunburst.caption}</p>
      )}
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
 */
export function Skills({ skin, heading, trackClassName }: SkillsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const sk = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const [open, setOpen] = useState<SkillGroupId>(groups[0])
  const [active, setActive] = useState<SunburstSelection>(null)
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

  const setToolActive = (g: SkillGroupId, tool: string) => setActive({ level: 'tool', group: g, tool })
  const clearActive = () => setActive(null)

  return (
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      {wide ? (
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SkillsSunburst
              skin={skin}
              groups={groups}
              groupLabel={groupLabel}
              active={active}
              onSelect={setActive}
              format={{ tool: (u) => formatTool(sk, u), group: (n) => formatGroup(sk, n), caption: sk.sunburst.caption }}
            />
            <TriStat sk={sk} skin={skin} active={active} groupLabel={groupLabel} />
            {skin.frame === 'persona' && (
              <div className="mt-6">
                <PersonaSkillPanel sk={sk} skin={skin} active={active} groupLabel={groupLabel} />
              </div>
            )}
          </div>
          <div className="lg:col-span-7">
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
                    <Sentence sk={sk} skin={skin} g={g} groupTools={registry.skillGroups[g] as readonly string[]} active={active} onToolEnter={setToolActive} onToolLeave={clearActive} />
                  </span>
                </m.p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <RingLegend sk={sk} skin={skin} groups={groups} groupLabel={groupLabel} onToolSelect={skin.frame === 'persona' ? setToolActive : undefined} active={active} />
          {skin.frame === 'persona' && (
            <div className="mt-5">
              <PersonaSkillPanel sk={sk} skin={skin} active={active} groupLabel={groupLabel} />
            </div>
          )}
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
                          <Sentence sk={sk} skin={skin} g={g} groupTools={registry.skillGroups[g] as readonly string[]} active={active} onToolEnter={setToolActive} onToolLeave={clearActive} />
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
