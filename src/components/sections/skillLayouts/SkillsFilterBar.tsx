// The filter bar shared by the orbit layout (above the rings, doubling as the group legend) and the
// sub-1024px ledger fallback: group chips (multi-select, live facet counts), a "Show:" surface
// radiogroup (which kind of real usage), free text, and a live result summary with a Clear link. One
// component so every surface that filters (orbit legend, ledger toolbar) filters identically and
// never drifts. Below `lg` the chips and the surface control each ride their own horizontally
// scrollable, snapping rail with a one-sided edge fade (mask-image driven off real scroll position,
// never a fixed two-sided mask — see `useEdgeFade`) and the search box goes full width; at `lg` and up
// chips sit left, the surface control and search sit right on the same row (wrapping to a second row
// only if it doesn't fit), and the rail's own scroll/mask machinery switches off entirely.
// 2026-09-11 — owner feedback: "fewer filters, clearer". The min-stores threshold, the sort order and
// the active-filter chips row are gone — three controls remain (group, surface, name) plus the result
// line and a Clear link.
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useMediaQuery } from '../../../hooks'
import type { SkillGroupId } from '../../../data/registry'
import type { ToolUsage } from '../../../data/skillUsage'
import { CountUp } from '../../gallery/charts'
import type { Skin } from '../../gallery'
import type { SkillsStrings } from '../skillsFormat'
import { SURFACE_IDS, type SkillsFilter, type SurfaceId } from './useSkillsFilter'

interface SkillsFilterBarProps {
  skin: Skin
  sk: SkillsStrings
  groups: SkillGroupId[]
  groupLabel: Record<SkillGroupId, string>
  toolsByGroup: Record<SkillGroupId, ToolUsage[]>
  formatGroup: (n: number) => string
  filter: SkillsFilter
  /** Orbit only: temporary (non-filtering) dim-preview when hovering/focusing a group chip. */
  onHoverGroup?: (g: SkillGroupId | null) => void
}

const SURFACE_LABEL: Record<SurfaceId, 'surfaceStorefronts' | 'surfaceProducts' | 'surfaceRoles'> = {
  storefronts: 'surfaceStorefronts',
  products: 'surfaceProducts',
  roles: 'surfaceRoles',
}

/** ARIA APG radiogroup keyboard pattern: arrow keys move focus (and, for a single-choice group,
 *  selection) between options, wrapping at the ends; Home/End jump to the first/last. Paired with
 *  roving `tabIndex` below (0 on the checked option, -1 on the rest) so Tab enters/leaves the whole
 *  group in one stop, matching how a screen reader announces and drives a native radio group. */
function onRadioGroupKeyDown(e: KeyboardEvent<HTMLDivElement>) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(e.key)) return
  const options = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'))
  if (!options.length) return
  e.preventDefault()
  const current = options.indexOf(document.activeElement as HTMLButtonElement)
  let next: number
  if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = options.length - 1
  else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % options.length
  else next = current < 0 ? options.length - 1 : (current - 1 + options.length) % options.length
  options[next].focus()
  options[next].click()
}

const CHIP = 'compact-touch shrink-0 snap-start max-lg:inline-flex max-lg:min-h-11 max-lg:min-w-11 max-lg:items-center max-lg:justify-center rounded-full px-2.5 py-1 text-[11px] transition-colors'

/** Real scroll position, not a guess: drives the rail's own one-sided `mask-image` (transparent only
 *  on the edge that still has content to reveal) so it never becomes the "fixed two-sided mask" the
 *  house filter-motion contract rules out. Off entirely at `lg`+, where the rail stops scrolling. */
// Scroll-snap containers can rest a few pixels off true zero on first paint (Chromium settling the
// first `snap-start` child against this rail's own left padding) — real scroll, but nothing a visitor
// would call "hidden content". The epsilon matches the fade width itself: anything within one fade's
// worth of an edge reads as "at that edge", so the snap settle never paints a false sliver of fade.
const FADE_PX = 20

function useEdgeFade(active: boolean) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [edge, setEdge] = useState({ start: false, end: false })
  useEffect(() => {
    const el = ref.current
    if (!el || !active) {
      setEdge({ start: false, end: false })
      return
    }
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth
      setEdge({ start: el.scrollLeft > FADE_PX, end: el.scrollLeft < max - FADE_PX })
    }
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [active])
  const mask = active && (edge.start || edge.end)
  const maskImage = mask
    ? `linear-gradient(to right, ${edge.start ? `transparent, black ${FADE_PX}px` : 'black 0'}, ${edge.end ? `black calc(100% - ${FADE_PX}px), transparent` : 'black 100%'})`
    : 'none'
  return { ref, maskImage }
}

interface RailProps {
  ariaLabel: string
  children: ReactNode
}

/** One row of toggle-style controls: a snapping horizontal scroller below `lg`, a centered wrapped
 *  row at `lg`+. `role="group"` here — each interactive child owns its own `aria-pressed`/role. */
function Rail({ ariaLabel, children }: RailProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { ref, maskImage } = useEdgeFade(!isDesktop)
  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 py-0.5 no-scrollbar snap-x snap-proximity lg:mx-0 lg:flex-wrap lg:justify-center lg:overflow-visible lg:px-0"
      style={{ WebkitMaskImage: maskImage, maskImage }}
    >
      {children}
    </div>
  )
}

const SUMMARY_TOKEN = /(\{n\}|\{m\}|\{k\})/
const fillSummary = (template: string, n: number, m: number, k: number) =>
  template.replace('{n}', String(n)).replace('{m}', String(m)).replace('{k}', String(k))

/** The visible counters tween through several intermediate values on every filter change (measured:
 *  ~16 DOM mutations per toggle, e.g. 39 -> 28 -> 20 -> 15 -> 7 -> ... -> 3) — fine to watch, but
 *  inside a live region a screen reader queues and reads out each intermediate value in turn, which
 *  is real noise on every single interaction. `aria-hidden` on the animating span keeps it out of the
 *  accessibility tree (it still renders and animates visually) while a plain `sr-only` sibling carries
 *  the one, already-settled sentence a live region should actually announce. */
function Summary({ template, n, m, k }: { template: string; n: number; m: number; k: number }) {
  return (
    <>
      <span aria-hidden="true">
        {template.split(SUMMARY_TOKEN).map((part, i) => {
          if (part === '{n}') return <CountUp key={`n-${i}`} value={n} duration={0.2} className="tabular-nums" />
          if (part === '{m}') return <span key={`m-${i}`} className="tabular-nums">{m}</span>
          if (part === '{k}') return <CountUp key={`k-${i}`} value={k} duration={0.2} className="tabular-nums" />
          return <span key={`t-${i}`}>{part}</span>
        })}
      </span>
      <span className="sr-only">{fillSummary(template, n, m, k)}</span>
    </>
  )
}

export function SkillsFilterBar({ skin, sk, groups, groupLabel, toolsByGroup, formatGroup, filter, onHoverGroup }: SkillsFilterBarProps) {
  const ob = sk.orbit
  const onQueryChange = (e: ChangeEvent<HTMLInputElement>) => filter.setQuery(e.target.value)

  // Facet counting (deliverable a): a group chip's own count ignores the group facet itself so it
  // always answers "how many tools in this group would show if this chip were toggled on", given every
  // OTHER active filter (surface/query) — never affected by which other groups happen to be selected
  // right now.
  const groupFacet = useMemo(
    () =>
      Object.fromEntries(
        groups.map((g) => {
          const matching = toolsByGroup[g].filter(filter.matchesWithoutGroup)
          return [g, { tools: matching.length, stores: new Set(matching.flatMap((u) => u.storeNames)).size }]
        }),
      ) as Record<SkillGroupId, { tools: number; stores: number }>,
    [groups, toolsByGroup, filter.matchesWithoutGroup],
  )

  const allTools = useMemo(() => groups.flatMap((g) => toolsByGroup[g]), [groups, toolsByGroup])
  const matchingTools = useMemo(() => allTools.filter(filter.matchesTool), [allTools, filter.matchesTool])
  const matchingStores = useMemo(() => new Set(matchingTools.flatMap((u) => u.storeNames)).size, [matchingTools])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <Rail ariaLabel={sk.groupSelectorLabel}>
          {groups.map((g) => {
            const on = filter.groups.has(g)
            const facet = groupFacet[g]
            // Full-sentence accessible name ('Shopify, 13 tools, 22 stores') — the visible chip only
            // ever shows the group name and the tool count. A group whose tools carry no real store
            // usage (entirely in-house products / client-role work) never announces "0 stores": the
            // sentence names what it IS used in instead.
            const storesPhrase = facet.stores > 0 ? formatGroup(facet.stores) : ob.chipAriaNoStores
            const chipAriaLabel = `${groupLabel[g]}, ${facet.tools} ${sk.layoutExtra.toolsSuffix}, ${storesPhrase}`
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                aria-label={chipAriaLabel}
                onClick={() => filter.toggleGroup(g)}
                onMouseEnter={() => onHoverGroup?.(g)}
                onMouseLeave={() => onHoverGroup?.(null)}
                onFocus={() => onHoverGroup?.(g)}
                onBlur={() => onHoverGroup?.(null)}
                className={`${CHIP} ${on ? skin.chipOn : skin.chip}`}
              >
                {groupLabel[g]} · <span className="tabular-nums">{facet.tools}</span>
              </button>
            )
          })}
        </Rail>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
          <Rail ariaLabel={ob.surfaceLabel}>
            <span className={`mr-0.5 shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] ${skin.muted}`}>{ob.showLabel}</span>
            <div role="radiogroup" aria-label={ob.surfaceLabel} onKeyDown={onRadioGroupKeyDown} className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                role="radio"
                aria-checked={filter.surface === null}
                tabIndex={filter.surface === null ? 0 : -1}
                onClick={() => filter.setSurface(null)}
                className={`${CHIP} ${filter.surface === null ? skin.chipOn : skin.chip}`}
              >
                {sk.layoutExtra.allLabel}
              </button>
              {SURFACE_IDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={filter.surface === s}
                  tabIndex={filter.surface === s ? 0 : -1}
                  onClick={() => filter.setSurface(s)}
                  className={`${CHIP} ${filter.surface === s ? skin.chipOn : skin.chip}`}
                >
                  {ob[SURFACE_LABEL[s]]}
                </button>
              ))}
            </div>
          </Rail>

          <label className="relative block w-full lg:w-44 lg:shrink-0">
            <span className="sr-only">{ob.searchLabel}</span>
            <input
              type="search"
              value={filter.query}
              onChange={onQueryChange}
              placeholder={ob.searchPlaceholder}
              aria-label={ob.searchLabel}
              className={`min-h-11 w-full rounded-full border bg-transparent px-3 py-1.5 text-[11px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current lg:min-h-0 lg:py-1 ${skin.line} ${skin.body}`}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p aria-live="polite" className={`text-center text-[11px] ${skin.muted}`}>
          <Summary template={ob.summary} n={matchingTools.length} m={allTools.length} k={matchingStores} />
          {filter.isActive && matchingTools.length === 0 && (
            <>
              {' — '}
              {ob.noMatches}
            </>
          )}
          {filter.isActive && (
            <>
              {' '}
              <button type="button" onClick={filter.clear} className={`underline-offset-2 hover:underline ${skin.accent}`}>
                {ob.clear}
              </button>
            </>
          )}
        </p>
        <p className={`text-center text-[11px] ${skin.muted}`}>{ob.helpLine}</p>
      </div>
    </div>
  )
}
