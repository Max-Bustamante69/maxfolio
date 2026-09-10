import { useMemo, useState, type KeyboardEvent } from 'react'
import { useContent } from '../../hooks'
import { Ticker } from '../common'
import type { SkillGroupId } from '../../data/registry'
import { toolUsage, toolUsageById, storesPerGroup, fleetLiquidLines, fleetIslandLines, fleetStoreCount, type ToolUsage } from '../../data/skillUsage'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { SkillPanel } from './SkillPanel'
import { formatTool, formatGroup, type SkillsStrings } from './skillsFormat'
import { toolIcon, monogram, ToolMark } from './skillIcons'

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
 *  brief's "compact strip... as small typographic stats, not boxes". */
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

interface GroupTabProps {
  skin: Skin
  active: boolean
  label: string
  count: string
  onSelect: () => void
}

/** One tab in the horizontal group-filter strip. Scrolls on phones (`no-scrollbar` + `overflow-x-auto`
 *  on the parent), sits flush once the six groups fit a wider viewport — no separate mobile/desktop
 *  markup, the same row just stops needing to scroll. */
function GroupTab({ skin, active, label, count, onSelect }: GroupTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={`${label} — ${count}`}
      onClick={onSelect}
      className={`shrink-0 whitespace-nowrap transition-colors ${active ? skin.chipOn : skin.chip}`}
    >
      {label}
    </button>
  )
}

interface TileTone {
  base: string
  onBase: string
  pinnedRing: string
  icon: string
  iconOn: string
  title: string
  chip: string
}

/** Per-skin idle/hover/pinned classes for a tool tile — the five looks the brief calls for. Brutalist
 *  forces a black slab in both light and dark mode (a deliberate poster-style accent, same pattern the
 *  panel and the sunburst-era arcs already used), Neo reads its lift/press state off the shared
 *  `.neo-raised` extrusion primitive (`data-state="pressed"` in the Tile below), and Persona's skew
 *  comes from a Tailwind transform utility on the tile itself. */
function tileTone(skin: Skin): TileTone {
  switch (skin.frame) {
    case 'apple':
      return {
        base: `rounded-2xl border ${skin.line} ${skin.dark ? 'bg-white/[0.02]' : 'bg-white'}`,
        onBase: skin.dark ? 'border-[#2997ff]/60 bg-white/[0.05]' : 'border-[#0066cc]/40 bg-[#f5f9ff]',
        pinnedRing: skin.dark ? 'ring-1 ring-[#2997ff]/70' : 'ring-1 ring-[#0066cc]/45',
        icon: skin.dark ? 'bg-white/[0.06] text-[#a1a1a6]' : 'bg-black/[0.03] text-[#6e6e73]',
        iconOn: skin.dark ? 'bg-[#2997ff]/15 text-[#2997ff]' : 'bg-[#0066cc]/10 text-[#0066cc]',
        title: skin.title,
        chip: skin.chip,
      }
    case 'luxury':
      return {
        base: `border-x border-b border-t-2 ${skin.dark ? 'border-t-deco-gold/35 border-deco-gold/15 bg-deco-navy/20' : 'border-t-luxury-gold/50 border-luxury-black/10 bg-[#faf5ea]'}`,
        onBase: skin.dark ? 'border-t-deco-gold bg-deco-navy/40' : 'border-t-luxury-gold bg-[#f5ecd8]',
        pinnedRing: skin.dark ? 'ring-1 ring-deco-gold/60' : 'ring-1 ring-luxury-gold/60',
        icon: skin.dark ? 'bg-deco-cream/5 text-deco-cream/50' : 'bg-luxury-black/5 text-luxury-black/50',
        iconOn: skin.dark ? 'bg-deco-gold/15 text-deco-gold' : 'bg-luxury-gold/15 text-[#836e40]',
        title: skin.title,
        chip: skin.chip,
      }
    case 'brutalist':
      return {
        // A "black slab" like the panel's, but not literally the page's own bg-stone-950 in dark
        // mode — that would make every tile border invisible against the page. Dark mode steps one
        // shade up (stone-900/stone-700) so the grid still reads as distinct cards; light mode keeps
        // the full poster-black-on-stone-100 contrast.
        base: skin.dark ? 'border-2 border-stone-700 bg-stone-900' : 'border-2 border-stone-950 bg-stone-950',
        onBase: 'border-red-600',
        pinnedRing: 'ring-2 ring-red-600',
        icon: 'bg-stone-800 text-stone-400',
        iconOn: 'bg-red-600/15 text-red-500',
        title: 'font-mono uppercase text-stone-50',
        chip: 'font-mono text-[10px] px-2 py-1 bg-stone-800 text-stone-400',
      }
    case 'neo':
      return {
        base: 'neo-raised neo-md neo-interactive',
        onBase: '',
        pinnedRing: '',
        icon: skin.dark ? 'neo-canvas text-neo-darkInkMuted' : 'neo-canvas text-neo-inkMuted',
        iconOn: skin.dark ? 'neo-canvas text-neo-darkAccent' : 'neo-canvas text-neo-accent',
        title: skin.title,
        chip: skin.chip,
      }
    case 'persona':
      return {
        base: `border clip-corner-sm ${skin.dark ? 'border-[#c8102e]/25 bg-[#18161a]' : 'border-[#1c6fb0]/20 bg-white'}`,
        onBase: skin.dark ? 'border-[#c8102e]' : 'border-[#1c6fb0]',
        pinnedRing: skin.dark ? 'ring-2 ring-[#c8102e]/70' : 'ring-2 ring-[#1c6fb0]/55',
        icon: skin.dark ? 'bg-[#f5f2ee]/10 text-[#f5f2ee]/60' : 'bg-[#0a0f1a]/5 text-[#0a0f1a]/60',
        iconOn: skin.dark ? 'bg-[#c8102e]/15 text-[#e8465f]' : 'bg-[#1c6fb0]/10 text-[#1c6fb0]',
        title: skin.title,
        // `skin.chip`'s `skew-chip` clip-path wedges the top-left corner by a fraction of the element's
        // OWN height; a usage chip long enough to wrap to two lines ("in the toolkit, no fleet count
        // yet") turns that sliver into a real chunk that eats the first line's leading letters. Tile
        // chips can't guarantee a one-line fit (33 real tool names, several with no fleet count yet),
        // so they skip the skew and keep it on the tile container itself instead.
        chip: skin.chip.replace('skew-chip', '').trim(),
      }
  }
}

interface TileProps {
  skin: Skin
  tone: TileTone
  tool: ToolUsage
  usageChip: string
  active: boolean
  pinned: boolean
  onHover: () => void
  onHoverEnd: () => void
  onToggle: () => void
  onEscape: () => void
}

/**
 * One tool: its real brand mark (or a monogram when none exists), its name, and an honest usage chip
 * ("8 stores", "2 products" — never invented). Hover/focus lifts it and fills the panel; click/Enter
 * pins it (the halo persists after the pointer leaves); Escape releases the pin from wherever focus
 * currently sits, mirroring the sunburst-era arcs this replaces.
 */
function Tile({ skin, tone, tool, usageChip, active, pinned, onHover, onHoverEnd, onToggle, onEscape }: TileProps) {
  const icon = toolIcon(tool.tool)
  const isPersona = skin.frame === 'persona'
  const isNeo = skin.frame === 'neo'
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') onEscape()
  }
  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={`${tool.tool} — ${usageChip}`}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onFocus={onHover}
      onBlur={onHoverEnd}
      onClick={onToggle}
      onKeyDown={onKeyDown}
      data-state={isNeo && pinned ? 'pressed' : undefined}
      className={`relative flex flex-col items-start gap-2.5 p-3.5 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 ${tone.base} ${active ? tone.onBase : ''} ${pinned ? tone.pinnedRing : ''} ${isPersona ? '-skew-x-6' : ''}`}
    >
      <span className={isPersona ? 'flex w-full flex-col items-start gap-2.5 skew-x-6' : 'contents'}>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors ${active ? tone.iconOn : tone.icon}`}>
          {icon ? <ToolMark tool={tool.tool} className="h-5 w-5" /> : monogram(tool.tool)}
        </span>
        <span className={`text-sm font-semibold leading-tight ${tone.title}`}>{tool.tool}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${tone.chip}`}>{usageChip}</span>
      </span>
    </button>
  )
}

/**
 * "What I work with" — a grid of real tool tiles grouped by the six skill groups, replacing the old
 * sunburst (a live audit found it read as decoration, not information). Hovering/focusing a tile fills
 * the panel on the side; clicking/pressing Enter pins it. A compact depth strip above the grid carries
 * the three fleet-wide totals that never change with selection (Liquid lines, TypeScript lines, stores),
 * and a horizontal group-filter strip — scrollable on phones, flush once it fits — switches which
 * group's tiles the grid shows. Every number traces to `skillUsage.ts`; a tool with no fleet count yet
 * says so honestly instead of a fabricated figure.
 */
export function Skills({ skin, heading }: SkillsProps) {
  const { strings, registry } = useContent()
  const sk: SkillsStrings = strings.sections.skills
  const groups = Object.keys(registry.skillGroups) as SkillGroupId[]
  const groupLabel = sk.groups as Record<SkillGroupId, string>
  const tone = tileTone(skin)

  const [activeGroup, setActiveGroup] = useState<SkillGroupId>(groups[0])
  const [hovered, setHovered] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const active = hovered ?? locked
  const pinned = !!locked && locked === active

  // Every tool named across the groups, deduplicated, in group order — real registry data, feeds the
  // bottom ticker so the breadth stays visible even while the grid above is filtered to one group.
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

  const groupTools = useMemo(() => toolUsage.filter((u) => u.group === activeGroup), [activeGroup])
  const activeTool = active ? (toolUsageById.get(active) ?? null) : null

  const onHover = (tool: string) => setHovered(tool)
  const onHoverEnd = () => setHovered(null)
  const onToggle = (tool: string) => setLocked((prev) => (prev === tool ? null : tool))
  const onUnlock = () => setLocked(null)

  return (
    <section id="skills" className="scroll-mt-20">
      {heading(sk.eyebrow, sk.title, sk.titleAccent)}

      <div className={`mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3 border-b pb-6 ${skin.line}`}>
        <DepthStat skin={skin} value={fleetLiquidLines} text={sk.depthLabel.liquid} />
        <DepthStat skin={skin} value={fleetIslandLines} text={sk.depthLabel.ts} />
        <DepthStat skin={skin} value={fleetStoreCount} text={sk.depthLabel.stores} />
      </div>

      <div className="-mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label={sk.groupSelectorLabel}>
        {groups.map((g) => (
          <GroupTab key={g} skin={skin} active={g === activeGroup} label={groupLabel[g]} count={formatGroup(sk, storesPerGroup[g])} onSelect={() => setActiveGroup(g)} />
        ))}
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {groupTools.map((u) => (
            <Tile
              key={u.tool}
              skin={skin}
              tone={tone}
              tool={u}
              usageChip={formatTool(sk, u)}
              active={active === u.tool}
              pinned={locked === u.tool}
              onHover={() => onHover(u.tool)}
              onHoverEnd={onHoverEnd}
              onToggle={() => onToggle(u.tool)}
              onEscape={onUnlock}
            />
          ))}
        </div>
        <div className="mt-6 lg:sticky lg:top-24 lg:mt-0">
          <SkillPanel skin={skin} tool={activeTool} pinned={pinned} onUnpin={onUnlock} />
        </div>
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
