import { useMemo, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import { Ticker } from '../common'
import type { SkillGroupId } from '../../data/registry'
import { toolUsage, storesPerGroup, fleetLiquidLines, fleetIslandLines, fleetStoreCount, type ToolUsage } from '../../data/skillUsage'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { SkillsSunburst, type SunburstSelection } from './SkillsSunburst'

interface SkillsProps {
  skin: Skin
  heading: SectionHeading
  /** Overrides the usage ledger's track background, e.g. a recessed Neo groove instead of the flat tint. */
  trackClassName?: string
}

const EASE = [0.23, 1, 0.32, 1] as const

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
  const label = `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`
  const track = trackClassName ?? (skin.dark ? 'bg-white/10' : 'bg-black/[0.06]')
  const groupLabel = sk.groups as Record<SkillGroupId, string>

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many).replace('{n}', String(n))
  const formatTool = (u: ToolUsage) => {
    const parts: string[] = []
    if (u.stores) parts.push(plural(u.stores, sk.sunburst.storesUnitOne, sk.sunburst.storesUnit))
    if (u.products) parts.push(plural(u.products, sk.sunburst.productsUnitOne, sk.sunburst.productsUnit))
    if (u.roleWork) parts.push(plural(u.roleWork, sk.sunburst.roleUnitOne, sk.sunburst.roleUnit))
    return parts.length ? parts.join(' · ') : sk.sunburst.noData
  }
  const formatGroup = (n: number) => plural(n, sk.sunburst.storesUnitOne, sk.sunburst.storesUnit)

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

  const Sentence = ({ g }: { g: SkillGroupId }) => {
    const [before, after] = sk.narrative[g].split('{skills}')
    const groupTools = registry.skillGroups[g] as readonly string[]
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
                aria-label={`${tool} — ${formatTool(toolUsage.find((u) => u.group === g && u.tool === tool)!)}`}
                onMouseEnter={() => setToolActive(g, tool)}
                onMouseLeave={clearActive}
                onFocus={() => setToolActive(g, tool)}
                onBlur={clearActive}
                className={`cursor-pointer font-semibold underline decoration-2 underline-offset-4 transition-colors ${on ? `${skin.accent} decoration-current` : `${skin.title} decoration-transparent`}`}
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

  const Ledger = () => (
    <div>
      <p className={label}>{sk.usageLabel}</p>
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
      <p className={`${skin.muted} mt-4 text-xs leading-relaxed`}>{sk.usageNote.replace('{n}', String(registry.stores.length))}</p>
    </div>
  )

  /** A compact 3-number depth readout: two fleet-wide totals (always the same, real, from telemetry)
   *  plus a third figure that reads whatever's currently active on the sunburst — a group's real
   *  store count, a tool's real usage, or the fleet's store count when nothing is focused. */
  const TriStat = () => {
    const dynamicLabel =
      active?.level === 'tool'
        ? formatTool(toolUsage.find((u) => u.group === active.group && u.tool === active.tool)!)
        : active?.level === 'group'
          ? formatGroup(storesPerGroup[active.group])
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

  /** Mobile substitute for the SVG: one horizontally scrollable row of group capsules, each carrying
   *  its own tools as small real-count chips — the ring legend the brief calls for, touch-sized. */
  const RingLegend = () => (
    <div>
      <p className={label}>{sk.sunburst.legendLabel}</p>
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar" role="list" aria-label={sk.sunburst.legendLabel}>
        {groups.map((g) => {
          const groupTools = toolUsage.filter((u) => u.group === g)
          return (
            <div key={g} role="listitem" className={`w-[220px] shrink-0 rounded-2xl border p-4 ${skin.line}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-sm font-semibold ${skin.title}`}>{groupLabel[g]}</span>
                <span className={`${skin.muted} text-[11px] tabular-nums`}>{formatGroup(storesPerGroup[g])}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {groupTools.map((u) => (
                  <span key={u.tool} className={u.total > 0 ? skin.chipOn : skin.chip} title={`${u.tool} — ${formatTool(u)}`}>
                    {u.tool}
                    {u.total > 0 ? <span className="ml-1 tabular-nums opacity-80">{u.total}</span> : null}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      {wide ? (
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SkillsSunburst skin={skin} groups={groups} groupLabel={groupLabel} active={active} onSelect={setActive} format={{ tool: formatTool, group: formatGroup, caption: sk.sunburst.caption }} />
            <TriStat />
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
                    <Sentence g={g} />
                  </span>
                </m.p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <RingLegend />
          <div className="mt-10">
            <Ledger />
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
                          <Sentence g={g} />
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
