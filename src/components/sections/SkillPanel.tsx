import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { RoleWorkId, SkillGroupId } from '../../data/registry'
import { toolUsage, groupStoreNames, storesPerGroup, fleetLiquidLines, fleetIslandLines } from '../../data/skillUsage'
import { CountUp } from '../gallery/charts'
import { formatTool, formatGroup } from './skillsFormat'
import type { SunburstSelection } from './SkillsSunburst'

interface SkillPanelProps {
  skin: Skin
  /** What to display — the parent resolves `hovered ?? locked` before passing this down. */
  selection: SunburstSelection
  /** True when `selection` is the currently locked (clicked/Enter-pressed) value, not just hovered. */
  pinned: boolean
  onUnpin: () => void
  /** Escape hatch for a future skin whose card/text tokens don't read well as a standalone panel. */
  panelClassName?: string
}

interface PanelTone {
  className: string
  title: string
  body: string
  muted: string
  accent: string
  chip: string
  line: string
}

/** Per-skin panel background, matching the brief's four looks. Apple/Luxury/Neo/Persona sit on the
 *  page's own light/dark surface, so they reuse the skin's own text tokens unchanged. Brutalist's
 *  "black slab" is a deliberate poster-style accent independent of light/dark mode (like its
 *  `badgeLive`/`chipOn` already are) — it needs its own forced-dark text tokens for contrast. */
function panelTone(skin: Skin): PanelTone {
  switch (skin.frame) {
    case 'apple':
      return {
        className: `rounded-[22px] border ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-black/[0.015]'}`,
        title: skin.title,
        body: skin.body,
        muted: skin.muted,
        accent: skin.accent,
        chip: skin.chip,
        line: skin.line,
      }
    case 'luxury':
      return {
        className: `border ${skin.dark ? 'border-deco-gold/25 bg-deco-navy/40' : 'border-luxury-black/10 bg-[#faf5ea]'} border-t-2 ${skin.dark ? 'border-t-deco-gold' : 'border-t-luxury-gold'}`,
        title: skin.title,
        body: skin.body,
        muted: skin.muted,
        accent: skin.accent,
        chip: skin.chip,
        line: skin.line,
      }
    case 'brutalist':
      return {
        className: 'border-2 border-t-4 border-stone-950 border-t-red-600 bg-stone-950',
        title: 'font-editorial italic text-stone-50',
        body: 'text-stone-300',
        muted: 'text-stone-500',
        accent: 'text-red-500',
        chip: 'font-mono text-[10px] px-2 py-1 bg-stone-800 text-stone-400',
        line: 'border-stone-700',
      }
    case 'neo':
      return {
        className: 'neo-inset neo-lg',
        title: skin.title,
        body: skin.body,
        muted: skin.muted,
        accent: skin.accent,
        chip: skin.chip,
        line: skin.line,
      }
    case 'persona':
      return {
        className: skin.card,
        title: skin.title,
        body: skin.body,
        muted: skin.muted,
        accent: skin.accent,
        chip: skin.chip,
        line: skin.line,
      }
  }
}

/**
 * The selected-skill readout the sunburst alone couldn't give: a full name, its group, the real
 * fleet usage (store/product/client-role names, never a fake number), a depth stat when the tool
 * is one telemetry actually measures, and the group's one-line honest note. Same content whether the
 * selection came from a hovered/focused arc, a clicked sentence tool, or a tapped mobile chip.
 */
export function SkillPanel({ skin, selection, pinned, onUnpin, panelClassName }: SkillPanelProps) {
  const { strings, registry } = useContent()
  const sk = strings.sections.skills
  const groupLabel = sk.groups as Record<SkillGroupId, string>
  const tone = panelTone(skin)

  const roleWorkName = (id: RoleWorkId) => {
    const w = registry.roleWork.find((r) => r.id === id)
    const company = w ? registry.experience.find((e) => e.id === w.role)?.company : undefined
    const label = strings.roleWork[id]
    return company ? `${label} · ${company}` : label
  }

  const tool = selection?.level === 'tool' ? toolUsage.find((u) => u.group === selection.group && u.tool === selection.tool) : undefined
  const group: SkillGroupId | undefined = selection?.group

  const names = tool
    ? [...tool.storeNames, ...tool.productNames, ...tool.roleWorkIds.map(roleWorkName)]
    : selection?.level === 'group'
      ? groupStoreNames[selection.group]
      : []

  const hasFleetCount = selection?.level === 'tool' ? (tool?.total ?? 0) > 0 : selection?.level === 'group' ? storesPerGroup[selection.group] > 0 : false
  const usageText = selection?.level === 'tool' && tool ? formatTool(sk, tool) : selection?.level === 'group' ? formatGroup(sk, storesPerGroup[selection.group]) : null

  const depth =
    selection?.level === 'tool' && selection.tool === 'Liquid'
      ? { label: sk.sunburst.triLiquid, value: fleetLiquidLines }
      : selection?.level === 'tool' && selection.tool === 'TypeScript'
        ? { label: sk.sunburst.triTs, value: fleetIslandLines }
        : null

  const note = group ? sk.groupNote[group] : null

  return (
    <div className={`flex h-full min-h-[260px] flex-col p-6 ${tone.className} ${panelClassName ?? ''}`} aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.muted}`}>{sk.panel.eyebrow}</p>
        {pinned && (
          <button
            type="button"
            onClick={onUnpin}
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone.accent} ${tone.line}`}
          >
            {sk.panel.pinned} ✕
          </button>
        )}
      </div>

      {selection ? (
        <>
          <p className={`mt-3 text-2xl font-semibold leading-tight ${tone.title}`}>{selection.level === 'tool' ? selection.tool : groupLabel[selection.group]}</p>
          {selection.level === 'tool' && <p className={`mt-1 text-sm ${tone.muted}`}>{groupLabel[selection.group]}</p>}

          <div className="mt-5">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.muted}`}>{sk.usageLabel}</p>
            {hasFleetCount ? (
              <>
                <p className={`mt-1.5 text-sm font-medium ${tone.body}`}>{usageText}</p>
                {names.length > 0 && (
                  <ul className="mt-2.5 flex flex-wrap gap-1.5">
                    {names.map((n) => (
                      <li key={n} className={tone.chip}>
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <span className={`mt-1.5 inline-block ${tone.chip}`}>{sk.sunburst.noData}</span>
            )}
          </div>

          {depth && (
            <div className={`mt-5 border-t pt-4 ${tone.line}`}>
              <p className={`text-lg font-semibold tabular-nums ${tone.title}`}>
                <CountUp value={depth.value} />
              </p>
              <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide ${tone.muted}`}>{depth.label}</p>
            </div>
          )}

          {note && <p className={`mt-5 border-t pt-4 text-sm leading-relaxed ${tone.body} ${tone.line}`}>{note}</p>}
        </>
      ) : (
        <p className={`mt-4 text-sm leading-relaxed ${tone.muted}`}>{sk.sunburst.caption}</p>
      )}

      <p className={`mt-auto pt-5 text-[11px] leading-snug ${tone.muted}`}>{sk.panel.hint}</p>
    </div>
  )
}
