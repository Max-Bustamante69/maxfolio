import { useMemo, useState } from 'react'
import { useContent } from '../../hooks'
import { Ticker } from '../common'
import type { SkillGroupId } from '../../data/registry'
import { toolUsage, storesPerGroup, fleetLiquidLines, fleetIslandLines, fleetStoreCount, type ToolUsage } from '../../data/skillUsage'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { formatTool, formatGroup, type SkillsStrings } from './skillsFormat'
import { TilesLayout, LedgerLayout, WallLayout, BentoLayout, ColumnsLayout, OrbitLayout, RowsLayout, LayoutSwitcher, isLayoutId, type LayoutId, type SkillsData } from './skillLayouts'

interface SkillsProps {
  skin: Skin
  heading: SectionHeading
}

interface DepthStatProps {
  skin: Skin
  value: number
  text: string
}

/** One typographic stat in the depth strip — a number and a caption, no card/box around it, per the
 *  brief's "compact strip... as small typographic stats, not boxes". Shared by every layout. */
function DepthStat({ skin, value, text }: DepthStatProps) {
  return (
    <div>
      <p className={`text-2xl font-semibold tabular-nums md:text-3xl ${skin.title}`}>
        <CountUp value={value} />
      </p>
      <p className={`mt-1 text-[11px] uppercase leading-tight tracking-wide ${skin.muted}`}>{text}</p>
    </div>
  )
}

const readInitialLayout = (): { layout: LayoutId; hasParam: boolean } => {
  if (typeof window === 'undefined') return { layout: 'orbit', hasParam: false }
  try {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('skills')) return { layout: 'orbit', hasParam: false }
    const v = params.get('skills')
    return { layout: isLayoutId(v) ? v : 'orbit', hasParam: true }
  } catch {
    return { layout: 'orbit', hasParam: false }  }
}

/**
 * "What I work with" — six selectable layouts (`?skills=<id>`, read once on mount) over the same real
 * data: `skillUsage.ts` (per-tool store/product/role-work counts), `skillGroups` (the six skill
 * domains) and `storeNamesByTool`-shaped names surfaced through each tool's `storeNames`. The default
 * (`tiles`) is the original grid-of-tiles-plus-panel design; the other five are comparison candidates,
 * flippable live via the switcher that only renders when `?skills=` is present in the URL at all, so
 * shoppers never see it. Every layout shares the depth strip above and the "Now" ticker below.
 */
export function Skills({ skin, heading }: SkillsProps) {
  const { strings, registry } = useContent()
  const sk: SkillsStrings = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const groupLabel = sk.groups as Record<SkillGroupId, string>
  const groupNote = sk.groupNote as Record<SkillGroupId, string>

  const [{ layout: initialLayout, hasParam }] = useState(readInitialLayout)
  const [layout, setLayout] = useState<LayoutId>(initialLayout)

  const onSelectLayout = (id: LayoutId) => {
    setLayout(id)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('skills', id)
      window.history.replaceState(null, '', url)
    } catch {
      // preview-only convenience; never block the switch on it
    }
  }

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
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      <div className={`mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3 border-b pb-6 ${skin.line}`}>
        <DepthStat skin={skin} value={fleetLiquidLines} text={sk.depthLabel.liquid} />
        <DepthStat skin={skin} value={fleetIslandLines} text={sk.depthLabel.ts} />
        <DepthStat skin={skin} value={fleetStoreCount} text={sk.depthLabel.stores} />
      </div>

      {hasParam && (
        <div className="mt-7">
          <LayoutSwitcher skin={skin} active={layout} onSelect={onSelectLayout} />
        </div>
      )}

      <div className={hasParam ? '' : 'mt-7'}>
        {layout === 'tiles' && <TilesLayout data={data} />}
        {layout === 'ledger' && <LedgerLayout data={data} />}
        {layout === 'wall' && <WallLayout data={data} />}
        {layout === 'bento' && <BentoLayout data={data} />}
        {layout === 'columns' && <ColumnsLayout data={data} />}
        {layout === 'orbit' && <OrbitLayout data={data} />}
        {layout === 'rows' && <RowsLayout data={data} />}
      </div>

      <div className="mt-14 rail-wide md:mt-16">
        <Ticker
          variant="outline-fill"
          duration={38}
          label={sk.eyebrow}
          items={allTools}
          keyOf={(t) => t}
          itemClassName="shrink-0 whitespace-nowrap px-5 py-2 font-sf text-2xl font-semibold tracking-[-0.02em] md:text-4xl"
          renderItem={(t) => t}
        />
      </div>
    </section>
  )
}
