import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { RoleWorkId, SkillGroupId } from '../../data/registry'
import { fleetLiquidLines, fleetIslandLines, type ToolUsage } from '../../data/skillUsage'
import { personaArt } from '../../data/personaArt'
import { CountUp } from '../gallery/charts'
import { formatTool } from './skillsFormat'
import { toolIcon, monogram, ToolMark } from './skillIcons'

interface SkillPanelProps {
  skin: Skin
  /** The hovered tool, or the pinned one once the pointer leaves — `null` shows the idle caption. */
  tool: ToolUsage | null
  /** True when `tool` is the currently pinned (clicked/Enter-pressed) value, not just hovered. */
  pinned: boolean
  onUnpin: () => void
}

interface PanelTone {
  className: string
  title: string
  body: string
  muted: string
  accent: string
  /** The idle chip look, minus any clip-path skew — Persona's `skew-chip` wedges the top-left corner
   *  by a fraction of the element's own height, which eats into real text once a chip wraps to two
   *  lines (a long store/product name, or the "no fleet count yet" tag). Nothing in this panel is
   *  short enough to guarantee a one-line fit, so the panel never uses the skewed chip. */
  chip: string
  line: string
  iconWrap: string
}

/** Per-skin panel background, matching the brief's five looks. Apple/Neo sit on the page's own
 *  light/dark surface with an already AA-verified `skin.muted`, so they reuse it unchanged.
 *  Luxury's panel forces an opaque `#faf5ea` card (not the alpha `bg-white/60` the rest of the theme
 *  sits on), and the shared `skin.muted` (`text-luxury-black/50`) measures only ~3.3:1 there — short
 *  of AA's 4.5:1 for the panel's own 11px eyebrow/hint text — so the panel darkens the tint locally
 *  (measured 5.2:1) rather than touching the shared token used site-wide. Brutalist's "black slab" is
 *  a deliberate poster-style accent independent of light/dark mode (like its `badgeLive`/`chipOn`
 *  already are); its shared `muted` (`text-stone-500`) measures ~4.1:1 on the forced `stone-950`, also
 *  short of AA, so it gets its own forced-dark, contrast-safe text tokens (measured 7.8:1). Persona
 *  keeps its art-backed "case file" background (photo art from personaArt('skills', …) under a
 *  measured scrim), the one look the brief calls out to preserve as-is. */
function panelTone(skin: Skin): PanelTone {
  switch (skin.frame) {
    case 'apple':
      return {
        className: `rounded-[22px] border ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-black/[0.015]'}`,
        title: skin.title,
        body: skin.body,
        muted: skin.dark ? skin.muted : 'text-[#5c5c62]',
        accent: skin.accent,
        chip: skin.chip,
        line: skin.line,
        iconWrap: skin.dark ? 'bg-white/[0.06] text-[#2997ff]' : 'bg-[#0066cc]/[0.07] text-[#0066cc]',
      }
    case 'luxury':
      return {
        className: `border ${skin.dark ? 'border-deco-gold/25 bg-deco-navy/40' : 'border-luxury-black/10 bg-[#faf5ea]'} border-t-2 ${skin.dark ? 'border-t-deco-gold' : 'border-t-luxury-gold'}`,
        title: skin.title,
        body: skin.body,
        muted: skin.dark ? 'text-deco-cream/60' : 'text-luxury-black/65',
        accent: skin.dark ? skin.accent : 'text-[#836e40]',
        chip: skin.chip,
        line: skin.line,
        iconWrap: skin.dark ? 'bg-deco-gold/10 text-deco-gold' : 'bg-luxury-gold/10 text-[#836e40]',
      }
    case 'brutalist':
      return {
        className: 'border-2 border-t-4 border-stone-950 border-t-red-600 bg-stone-950',
        title: 'font-editorial italic text-stone-50',
        body: 'text-stone-300',
        muted: 'text-stone-400',
        accent: 'text-red-500',
        chip: 'font-mono text-[10px] px-2 py-1 bg-stone-800 text-stone-400',
        line: 'border-stone-700',
        iconWrap: 'bg-stone-800 text-red-500',
      }
    case 'neo':
      // Restraint pass: the panel is a flat, hairline-bordered surface on a faint tint (not a
      // shadowed card) — only real controls (buttons) keep the raised/inset treatment on this page.
      return {
        className: `rounded-[20px] border ${skin.line} ${skin.dark ? 'bg-neo-darkSurfaceRaised' : 'bg-neo-surfaceRaised'}`,
        title: skin.title,
        body: skin.body,
        muted: skin.muted,
        accent: skin.accent,
        chip: skin.chip,
        line: skin.line,
        iconWrap: skin.badgeLive,
      }
    case 'persona':
      return {
        className: skin.dark ? 'border-2 border-[#c8102e]/40' : 'border-2 border-[#1c6fb0]/35',
        title: skin.title,
        body: skin.body,
        muted: skin.muted,
        accent: skin.accent,
        chip: skin.chip.replace('skew-chip', '').trim(),
        line: skin.line,
        iconWrap: skin.dark ? 'bg-[#f5f2ee]/10 text-[#e8465f]' : 'bg-[#0a0f1a]/5 text-[#1c6fb0]',
      }
    case 'terminal':
      return {
        className: 'border border-[var(--term-line)] border-t-2 border-t-[var(--term-accent)] bg-[var(--term-panel)]',
        title: skin.title,
        body: skin.body,
        muted: skin.muted,
        accent: skin.accent,
        chip: skin.chip,
        line: skin.line,
        iconWrap: 'bg-[var(--term-line)]/40 text-[var(--term-accent)]',
      }
    case 'skyline':
      return {
        className: 'rounded-md border border-[#e7edf5]/10 bg-[#0d1420]',
        title: 'font-semibold text-[#eef3f9]',
        body: 'text-[#c7d2e0]',
        muted: 'text-[#8d9bb0]',
        // The pinned tool's real usage count is the one place this panel's accent is the reserved
        // cyan — every other panel here reuses `skin.accent`, which stays a neutral ice-blue.
        accent: 'text-[#4fd1ff]',
        chip: skin.chip,
        line: skin.line,
        iconWrap: 'bg-[#4fd1ff]/10 text-[#4fd1ff]',
      }
  }
}

/**
 * The selected-tile readout the grid alone couldn't give: the tool's icon and full name, its group,
 * the real fleet usage (store/product/client-role names, never a fake number), a depth stat when the
 * tool is one telemetry actually measures (Liquid, TypeScript), and the group's one-line honest note.
 * Same content whether the selection came from a hovered/focused tile or a clicked/pinned one.
 */
export function SkillPanel({ skin, tool, pinned, onUnpin }: SkillPanelProps) {
  const { strings, registry } = useContent()
  const sk = strings.sections.skills
  const groupLabel = sk.groups as Record<SkillGroupId, string>
  const tone = panelTone(skin)
  const isPersona = skin.frame === 'persona'

  const roleWorkName = (id: RoleWorkId) => {
    const w = registry.roleWork.find((r) => r.id === id)
    const company = w ? registry.experience.find((e) => e.id === w.role)?.company : undefined
    const label = strings.roleWork[id]
    return company ? `${label} · ${company}` : label
  }

  const names = tool ? [...tool.storeNames, ...tool.productNames, ...tool.roleWorkIds.map(roleWorkName)] : []
  const hasFleetCount = (tool?.total ?? 0) > 0
  const usageText = tool ? formatTool(sk, tool) : null
  const depth =
    tool?.tool === 'Liquid' ? { label: sk.depthLabel.liquid, value: fleetLiquidLines } : tool?.tool === 'TypeScript' ? { label: sk.depthLabel.ts, value: fleetIslandLines } : null
  const note = tool ? sk.groupNote[tool.group] : null

  const art = isPersona ? personaArt('skills', skin.dark) : undefined
  const scrim = skin.dark ? 'rgba(17,16,19,0.88)' : 'rgba(238,243,247,0.9)'
  const bgStyle = art ? { backgroundImage: `linear-gradient(${scrim},${scrim}), url(${art})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined

  const icon = tool ? toolIcon(tool.tool) : undefined
  const mark = tool ? monogram(tool.tool) : ''

  return (
    <div
      className={`flex h-full min-h-[280px] flex-col p-6 ${tone.className} ${isPersona ? 'persona-torn relative overflow-hidden' : ''}`}
      style={bgStyle}
      aria-live="polite"
    >
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

      {tool ? (
        <>
          <div className="mt-4 flex items-center gap-3.5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${tone.iconWrap}`}>
              {icon ? <ToolMark tool={tool.tool} className="h-6 w-6" /> : mark}
            </span>
            <div className="min-w-0">
              <p className={`truncate text-xl font-semibold leading-tight ${tone.title}`} style={isPersona ? { fontStyle: 'oblique 6deg' } : undefined}>
                {tool.tool}
              </p>
              <p className={`mt-0.5 text-sm ${tone.muted}`}>{groupLabel[tool.group]}</p>
            </div>
          </div>

          <div className="mt-5">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.muted}`}>{sk.panel.usageLabel}</p>
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
              <span className={`mt-1.5 inline-block ${tone.chip}`}>{sk.usage.noData}</span>
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
        <p className={`mt-4 text-sm leading-relaxed ${tone.muted}`}>{sk.usage.caption}</p>
      )}

      <p className={`mt-auto pt-5 text-[11px] leading-snug ${tone.muted}`}>{sk.panel.hint}</p>
    </div>
  )
}
