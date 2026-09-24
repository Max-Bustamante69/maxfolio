import { useMemo } from 'react'
import { useContent } from '../../hooks'
import { Ticker } from '../common'
import type { SkillGroupId } from '../../data/registry'
import { toolUsage, storesPerGroup, fleetLiquidLines, fleetIslandLines, type ToolUsage } from '../../data/skillUsage'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { formatTool, formatGroup, type SkillsStrings } from './skillsFormat'
import { OrbitLayout, type SkillsData } from './skillLayouts'

interface SkillsProps {
  /** False when the page's own non-lazy wrapper carries the section id (Apple), so the id stays unique and hash links land before this chunk mounts. */
  ownId?: boolean
  skin: Skin
  heading: SectionHeading
}

interface DepthStatProps {
  skin: Skin
  value: number
  text: string
  /** Round 46: the storefront count uses this to render "20+" (the fixed public claim) instead of a
   *  bare exact number — every other depth stat leaves it unset. */
  suffix?: string
}

/** One typographic stat in the depth strip — a number and a caption, no card/box around it, per the
 *  brief's "compact strip... as small typographic stats, not boxes". Shared by every layout. */
function DepthStat({ skin, value, text, suffix = '' }: DepthStatProps) {
  return (
    <div>
      <p className={`text-xl font-semibold tabular-nums sm:text-2xl md:text-3xl ${skin.title}`}>
        <CountUp value={value} suffix={suffix} />
      </p>
      <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide sm:text-[11px] ${skin.muted}`}>{text}</p>
    </div>
  )
}

/**
 * "What I work with" — the orbit: six skill groups over the same real data (`skillUsage.ts`'s
 * per-tool store/product/role-work counts, `skillGroups`'s six domains, and `storeNamesByTool`-shaped
 * names surfaced through each tool's `storeNames`). Below 1024px and under reduced motion, `OrbitLayout`
 * falls back to the ledger register on its own. Every layout shares the depth strip above and the
 * "Now" ticker below.
 */
export function Skills({ skin, heading, ownId = true }: SkillsProps) {
  const { strings, registry } = useContent()
  const sk: SkillsStrings = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const groupLabel = sk.groups as Record<SkillGroupId, string>
  const groupNote = sk.groupNote as Record<SkillGroupId, string>

  // Every tool named across the groups, deduplicated, in group order — real registry data, feeds the
  // bottom ticker so the breadth stays visible regardless of which layout/filter is active above.
  const allTools = useMemo(() => {
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

  const toolsByGroup = useMemo(
    () =>
      Object.fromEntries(groups.map((g) => [g, toolUsage.filter((u) => u.group === g)])) as Record<SkillGroupId, ToolUsage[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const data: SkillsData = {
    skin,
    sk,
    groups,
    groupLabel,
    groupNote,
    storesPerGroup,
    toolsByGroup,
    allTools,
    formatTool: (u: ToolUsage) => formatTool(sk, u),
    formatGroup: (n: number) => formatGroup(sk, n),
  }

  return (
    <section id={ownId ? 'skills' : undefined} className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      <div className={`mt-8 grid grid-cols-3 gap-3 border-b pb-6 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-10 sm:gap-y-3 ${skin.line}`}>
        <DepthStat skin={skin} value={fleetLiquidLines} text={sk.depthLabel.liquid} />
        <DepthStat skin={skin} value={fleetIslandLines} text={sk.depthLabel.ts} />
        {/* Round 46: the public storefront count is the fixed "20+" everywhere, not the real, climbing
            `fleetStoreCount` (registry.stores.length) — the other two stats here stay exact since only
            the storefront figure is a public marketing claim, not an internal line-count metric. */}
        <DepthStat skin={skin} value={registry.PUBLIC_STORE_COUNT} suffix="+" text={sk.depthLabel.stores} />
      </div>

      <div className="mt-7">
        <OrbitLayout data={data} />
      </div>

      <div className="mt-14 rail-wide md:mt-16">
        <Ticker
          variant="outline-fill"
          duration={38}
          label={sk.eyebrow}
          items={allTools}
          keyOf={(t) => t}
          itemClassName={`shrink-0 whitespace-nowrap px-5 py-2 ${skin.headingFont} text-2xl font-semibold tracking-[-0.02em] md:text-4xl`}
          renderItem={(t) => t}
        />
      </div>
    </section>
  )
}
