// The filter bar shared by the orbit layout (above the rings, doubling as the group legend) and the
// sub-1024px ledger fallback: group chips (multi-select, live facet counts), a surface radiogroup
// (which kind of real usage), a depth radiogroup (derived — see skillUsage.ts), a "used in at least N
// stores" radiogroup, a sort radiogroup, free text, Clear, an active-filter chips row and a live result
// summary. One component so every surface that filters (orbit legend, ledger toolbar) filters
// identically and never drifts. Below `lg` every toggle-style control rides one horizontally
// scrollable, snapping rail with a one-sided edge fade (mask-image driven off real scroll position,
// never a fixed two-sided mask — see `useEdgeFade`); at `lg` and up the same controls wrap into
// centered rows and the rail's own scroll/mask machinery switches off entirely.
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useMediaQuery } from '../../../hooks'
import type { SkillGroupId } from '../../../data/registry'
import { DEPTH_IDS, type DepthId, type ToolUsage } from '../../../data/skillUsage'
import { CountUp } from '../../gallery/charts'
import type { Skin } from '../../gallery'
import type { SkillsStrings } from '../skillsFormat'
import { MIN_STORES_STOPS, SORT_IDS, SURFACE_IDS, type MinStoresStop, type SkillsFilter, type SortId, type SurfaceId } from './useSkillsFilter'

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

const SORT_LABEL: Record<SortId, 'sortUsage' | 'sortName' | 'sortGroup'> = {
  usage: 'sortUsage',
  name: 'sortName',
  group: 'sortGroup',
}

const fill = (template: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), template)

const CHIP = 'compact-touch shrink-0 snap-start max-lg:inline-flex max-lg:min-h-11 max-lg:min-w-11 max-lg:items-center max-lg:justify-center rounded-full px-2.5 py-1 text-[11px] transition-colors'

/** Real scroll position, not a guess: drives the rail's own one-sided `mask-image` (transparent only
 *  on the edge that still has content to reveal) so it never becomes the "fixed two-sided mask" the
 *  house filter-motion contract rules out. Off entirely at `lg`+, where the rail stops scrolling. */
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
      setEdge({ start: el.scrollLeft > 2, end: el.scrollLeft < max - 2 })
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
    ? `linear-gradient(to right, ${edge.start ? 'transparent, black 20px' : 'black 0'}, ${edge.end ? 'black calc(100% - 20px), transparent' : 'black 100%'})`
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

function Divider({ skin }: { skin: Skin }) {
  return <span aria-hidden="true" className={`mx-0.5 h-5 w-px shrink-0 ${skin.dark ? 'bg-white/10' : 'bg-black/10'}`} />
}

const SUMMARY_TOKEN = /(\{n\}|\{m\}|\{k\})/

function Summary({ template, n, m, k }: { template: string; n: number; m: number; k: number }) {
  return (
    <>
      {template.split(SUMMARY_TOKEN).map((part, i) => {
        if (part === '{n}') return <CountUp key={`n-${i}`} value={n} duration={0.2} className="tabular-nums" />
        if (part === '{m}') return <span key={`m-${i}`} className="tabular-nums">{m}</span>
        if (part === '{k}') return <CountUp key={`k-${i}`} value={k} duration={0.2} className="tabular-nums" />
        return <span key={`t-${i}`}>{part}</span>
      })}
    </>
  )
}

export function SkillsFilterBar({ skin, sk, groups, groupLabel, toolsByGroup, formatGroup, filter, onHoverGroup }: SkillsFilterBarProps) {
  const ob = sk.orbit
  const reduced = useReducedMotion()
  const onQueryChange = (e: ChangeEvent<HTMLInputElement>) => filter.setQuery(e.target.value)

  // Facet counting (deliverable a): a group chip's own count ignores the group facet itself so it
  // always answers "how many tools in this group would show if this chip were toggled on", given every
  // OTHER active filter (surface/depth/min-stores/query) — never affected by which other groups happen
  // to be selected right now.
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

  interface ActiveChip {
    id: string
    label: string
    onRemove: () => void
  }
  const activeChips: ActiveChip[] = []
  for (const g of groups) {
    if (filter.groups.has(g)) activeChips.push({ id: `g-${g}`, label: groupLabel[g], onRemove: () => filter.toggleGroup(g) })
  }
  if (filter.surface) activeChips.push({ id: 'surface', label: ob[SURFACE_LABEL[filter.surface]], onRemove: () => filter.setSurface(null) })
  if (filter.depth) activeChips.push({ id: 'depth', label: ob.depthGroups[filter.depth], onRemove: () => filter.setDepth(null) })
  if (filter.minStores > 0) activeChips.push({ id: 'min', label: fill(ob.minStoresOption, { n: String(filter.minStores) }), onRemove: () => filter.setMinStores(0) })
  if (filter.query.trim()) activeChips.push({ id: 'q', label: fill(ob.filterQueryLabel, { query: filter.query.trim() }), onRemove: () => filter.setQuery('') })

  return (
    <div className="flex flex-col gap-3">
      <Rail ariaLabel={sk.groupSelectorLabel}>
        {groups.map((g) => {
          const on = filter.groups.has(g)
          const facet = groupFacet[g]
          return (
            <button
              key={g}
              type="button"
              aria-pressed={on}
              onClick={() => filter.toggleGroup(g)}
              onMouseEnter={() => onHoverGroup?.(g)}
              onMouseLeave={() => onHoverGroup?.(null)}
              onFocus={() => onHoverGroup?.(g)}
              onBlur={() => onHoverGroup?.(null)}
              className={`${CHIP} ${on ? skin.chipOn : skin.chip}`}
            >
              {groupLabel[g]} · {facet.tools} {sk.layoutExtra.toolsSuffix} · {formatGroup(facet.stores)}
            </button>
          )
        })}
      </Rail>

      <Rail ariaLabel={ob.surfaceLabel}>
        <div role="radiogroup" aria-label={ob.surfaceLabel} className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            role="radio"
            aria-checked={filter.surface === null}
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
              onClick={() => filter.setSurface(s)}
              className={`${CHIP} ${filter.surface === s ? skin.chipOn : skin.chip}`}
            >
              {ob[SURFACE_LABEL[s]]}
            </button>
          ))}
        </div>

        <Divider skin={skin} />

        <div role="radiogroup" aria-label={ob.depthFilterLabel} className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            role="radio"
            aria-checked={filter.depth === null}
            onClick={() => filter.setDepth(null)}
            className={`${CHIP} ${filter.depth === null ? skin.chipOn : skin.chip}`}
          >
            {ob.depthAny}
          </button>
          {DEPTH_IDS.map((d: DepthId) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={filter.depth === d}
              onClick={() => filter.setDepth(d)}
              className={`${CHIP} ${filter.depth === d ? skin.chipOn : skin.chip}`}
            >
              {ob.depthGroups[d]}
            </button>
          ))}
        </div>

        <Divider skin={skin} />

        <div role="radiogroup" aria-label={ob.minStoresLabel} className="flex shrink-0 items-center gap-1.5">
          {MIN_STORES_STOPS.map((stop: MinStoresStop) => (
            <button
              key={stop}
              type="button"
              role="radio"
              aria-checked={filter.minStores === stop}
              aria-label={stop === 0 ? ob.minStoresAny : fill(ob.minStoresOptionAria, { n: String(stop) })}
              onClick={() => filter.setMinStores(stop)}
              className={`${CHIP} ${filter.minStores === stop ? skin.chipOn : skin.chip}`}
            >
              {stop === 0 ? ob.minStoresAny : fill(ob.minStoresOption, { n: String(stop) })}
            </button>
          ))}
        </div>

        <Divider skin={skin} />

        <div role="radiogroup" aria-label={ob.sortLabel} className="flex shrink-0 items-center gap-1.5">
          {SORT_IDS.map((s: SortId) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={filter.sort === s}
              onClick={() => filter.setSort(s)}
              className={`${CHIP} ${filter.sort === s ? skin.chipOn : skin.chip}`}
            >
              {ob[SORT_LABEL[s]]}
            </button>
          ))}
        </div>

        <Divider skin={skin} />

        <label className="relative shrink-0 snap-start">
          <span className="sr-only">{ob.searchLabel}</span>
          <input
            type="search"
            value={filter.query}
            onChange={onQueryChange}
            placeholder={ob.searchPlaceholder}
            aria-label={ob.searchLabel}
            className={`w-36 max-lg:min-h-11 rounded-full border bg-transparent px-3 py-1 text-[11px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:w-44 ${skin.line} ${skin.body}`}
          />
        </label>

        {filter.isActive && (
          <button type="button" onClick={filter.clear} className={`${CHIP} underline-offset-2 hover:underline ${skin.accent}`}>
            {ob.clear}
          </button>
        )}
      </Rail>

      <m.div layout="position" transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0.15, duration: 0.4 }} className="flex flex-col items-center gap-2">
        <AnimatePresence initial={false}>
          {activeChips.length > 0 && (
            <m.div
              key="active-chips"
              layout
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.16 }}
              role="group"
              aria-label={ob.activeFiltersLabel}
              className="flex flex-wrap justify-center gap-1.5 overflow-hidden"
            >
              {activeChips.map((chip) => (
                <m.button
                  key={chip.id}
                  layout
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.16 }}
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={fill(ob.removeFilter, { label: chip.label })}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${skin.chipOn}`}
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                </m.button>
              ))}
            </m.div>
          )}
        </AnimatePresence>

        <p aria-live="polite" className={`text-center text-[11px] ${skin.muted}`}>
          <Summary template={ob.summary} n={matchingTools.length} m={allTools.length} k={matchingStores} />
          {filter.isActive && matchingTools.length === 0 && (
            <>
              {' — '}
              {ob.noMatches}{' '}
              <button type="button" onClick={filter.clear} className={`underline-offset-2 hover:underline ${skin.accent}`}>
                {ob.clear}
              </button>
            </>
          )}
        </p>
      </m.div>
    </div>
  )
}
