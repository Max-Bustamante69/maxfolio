// Layout 0 (default) — the original "What I work with" grid of real tool tiles, grouped by the six
// skill groups. Unchanged behavior: hovering/focusing a tile fills the side panel, clicking/Enter pins
// it, Escape releases the pin. Kept byte-for-byte equivalent to the pre-options implementation so the
// default experience never regresses while the other five layouts are compared against it.
import { useMemo, useState, type KeyboardEvent } from 'react'
import type { Skin } from '../../gallery'
import { toolUsage, toolUsageById, type ToolUsage } from '../../../data/skillUsage'
import { SkillPanel } from '../SkillPanel'
import { toolIcon, monogram, ToolMark } from '../skillIcons'
import type { SkillsLayoutProps } from './types'

interface GroupTabProps {
  skin: Skin
  active: boolean
  label: string
  count: string
  onSelect: () => void
}

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
        chip: skin.chip.replace('skew-chip', '').trim(),
      }
    case 'terminal':
      return {
        base: 'border border-[var(--term-line)] bg-transparent',
        onBase: 'border-[var(--term-accent)] bg-[var(--term-accent)]/[0.06]',
        pinnedRing: 'ring-1 ring-[var(--term-accent)]',
        icon: 'bg-[var(--term-line)]/40 text-[var(--term-muted)]',
        iconOn: 'bg-[var(--term-accent)]/10 text-[var(--term-accent)]',
        title: skin.title,
        chip: skin.chip,
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

export function TilesLayout({ data }: SkillsLayoutProps) {
  const { skin, sk, groups, groupLabel, storesPerGroup, formatTool, formatGroup } = data
  const tone = useMemo(() => tileTone(skin), [skin])
  const [activeGroup, setActiveGroup] = useState(groups[0])
  const [hovered, setHovered] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const active = hovered ?? locked
  const pinned = !!locked && locked === active

  const groupTools = useMemo(() => toolUsage.filter((u) => u.group === activeGroup), [activeGroup])
  const activeTool = active ? (toolUsageById.get(active) ?? null) : null

  const onHover = (tool: string) => setHovered(tool)
  const onHoverEnd = () => setHovered(null)
  const onToggle = (tool: string) => setLocked((prev) => (prev === tool ? null : tool))
  const onUnlock = () => setLocked(null)

  return (
    <>
      <div className="-mx-4 mt-1 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label={sk.groupSelectorLabel}>
        {groups.map((g) => (
          <GroupTab key={g} skin={skin} active={g === activeGroup} label={groupLabel[g]} count={formatGroup(storesPerGroup[g])} onSelect={() => setActiveGroup(g)} />
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
              usageChip={formatTool(u)}
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
    </>
  )
}
