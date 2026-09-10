// The filter bar shared by the orbit layout (above the rings, doubling as the group legend) and the
// sub-1024px ledger fallback: group chips (multi-select), a surface radiogroup (which kind of real
// usage), free text, and Clear. One component so both surfaces filter identically and never drift.
import type { ChangeEvent } from 'react'
import type { SkillGroupId } from '../../../data/registry'
import type { ToolUsage } from '../../../data/skillUsage'
import type { Skin } from '../../gallery'
import type { SkillsStrings } from '../skillsFormat'
import { SURFACE_IDS, type SkillsFilter, type SurfaceId } from './useSkillsFilter'

interface SkillsFilterBarProps {
  skin: Skin
  sk: SkillsStrings
  groups: SkillGroupId[]
  groupLabel: Record<SkillGroupId, string>
  toolsByGroup: Record<SkillGroupId, ToolUsage[]>
  storesPerGroup: Record<SkillGroupId, number>
  formatGroup: (n: number) => string
  filter: SkillsFilter
  /** Orbit only: temporary (non-filtering) dim-preview when hovering/focusing a group chip. */
  onHoverGroup?: (g: SkillGroupId | null) => void
}

const SURFACE_LABEL: Record<SurfaceId, keyof SkillsStrings['orbit']> = {
  storefronts: 'surfaceStorefronts',
  products: 'surfaceProducts',
  roles: 'surfaceRoles',
}

export function SkillsFilterBar({ skin, sk, groups, groupLabel, toolsByGroup, storesPerGroup, formatGroup, filter, onHoverGroup }: SkillsFilterBarProps) {
  const ob = sk.orbit
  const onQueryChange = (e: ChangeEvent<HTMLInputElement>) => filter.setQuery(e.target.value)

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label={sk.groupSelectorLabel} className="flex flex-wrap justify-center gap-x-2 gap-y-1.5">
        {groups.map((g) => {
          const on = filter.groups.has(g)
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
              className={`compact-touch rounded-full px-2.5 py-1 text-[11px] transition-colors ${on ? skin.chipOn : skin.chip}`}
            >
              {groupLabel[g]} · {toolsByGroup[g].length} {sk.layoutExtra.toolsSuffix} · {formatGroup(storesPerGroup[g])}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div role="radiogroup" aria-label={ob.surfaceLabel} className="flex flex-wrap gap-1.5">
          <button
            type="button"
            role="radio"
            aria-checked={filter.surface === null}
            onClick={() => filter.setSurface(null)}
            className={`compact-touch rounded-full px-2.5 py-1 text-[11px] transition-colors ${filter.surface === null ? skin.chipOn : skin.chip}`}
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
              className={`compact-touch rounded-full px-2.5 py-1 text-[11px] transition-colors ${filter.surface === s ? skin.chipOn : skin.chip}`}
            >
              {ob[SURFACE_LABEL[s]]}
            </button>
          ))}
        </div>

        <label className="relative">
          <span className="sr-only">{ob.searchLabel}</span>
          <input
            type="search"
            value={filter.query}
            onChange={onQueryChange}
            placeholder={ob.searchPlaceholder}
            aria-label={ob.searchLabel}
            className={`w-36 rounded-full border bg-transparent px-3 py-1 text-[11px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:w-44 ${skin.line} ${skin.body}`}
          />
        </label>

        {filter.isActive && (
          <button type="button" onClick={filter.clear} className={`compact-touch rounded-full px-2.5 py-1 text-[11px] underline-offset-2 hover:underline ${skin.accent}`}>
            {ob.clear}
          </button>
        )}
      </div>
    </div>
  )
}
