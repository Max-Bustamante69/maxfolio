// Shared filter state for the orbit layout and its sub-1024px ledger fallback: by skill group
// (multi-select), by "surface" (which kind of real usage — storefronts / in-house products / client
// roles), by depth (how often, derived — see skillUsage.ts), by a minimum real-stores threshold, by
// tool name (free text), plus a display-only sort order. State lives in the URL
// (`?tools=<group>,<group>&surface=<id>&depth=<id>&min=<n>&sort=<id>&q=<text>`) so a filtered view is
// a link a visitor can share or bookmark, the same pattern Skills.tsx already uses for `?skills=
// <layout>` — read once on mount, written with `replaceState` so filtering never grows browser
// history. `sort` rides the same URL for shareability but is a view preference, not a filter: it never
// counts toward `isActive` and `clear()` leaves it alone.
import { useCallback, useMemo, useState } from 'react'
import type { SkillGroupId } from '../../../data/registry'
import { DEPTH_IDS, type DepthId, type ToolUsage } from '../../../data/skillUsage'

export type SurfaceId = 'storefronts' | 'products' | 'roles'
export const SURFACE_IDS: SurfaceId[] = ['storefronts', 'products', 'roles']

export type SortId = 'usage' | 'name' | 'group'
export const SORT_IDS: SortId[] = ['usage', 'name', 'group']

/** The five stops of the "used in at least N stores" control — 0 means "any" (the control's default,
 *  never written to the URL). Fixed stops, not a free-form stepper: every stop is a real number a
 *  visitor can reason about against the orbit's own busiest tool (22 stores, see skillUsage.ts). */
export const MIN_STORES_STOPS = [0, 1, 5, 10, 15] as const
export type MinStoresStop = (typeof MIN_STORES_STOPS)[number]
const isMinStoresStop = (n: number): n is MinStoresStop => (MIN_STORES_STOPS as readonly number[]).includes(n)

interface FilterState {
  groups: SkillGroupId[]
  surface: SurfaceId | null
  depth: DepthId | null
  minStores: MinStoresStop
  query: string
  sort: SortId
}

const PARAM_GROUPS = 'tools'
const PARAM_SURFACE = 'surface'
const PARAM_DEPTH = 'depth'
const PARAM_MIN = 'min'
const PARAM_QUERY = 'q'
const PARAM_SORT = 'sort'

const isSurfaceId = (v: string | null): v is SurfaceId => !!v && (SURFACE_IDS as readonly string[]).includes(v)
const isDepthId = (v: string | null): v is DepthId => !!v && (DEPTH_IDS as readonly string[]).includes(v)
const isSortId = (v: string | null): v is SortId => !!v && (SORT_IDS as readonly string[]).includes(v)

const readInitial = (validGroups: readonly SkillGroupId[]): FilterState => {
  if (typeof window === 'undefined') return { groups: [], surface: null, depth: null, minStores: 0, query: '', sort: 'group' }
  try {
    const params = new URLSearchParams(window.location.search)
    const groupsRaw = params.get(PARAM_GROUPS)
    const groups = groupsRaw
      ? (groupsRaw.split(',').filter((g) => (validGroups as readonly string[]).includes(g)) as SkillGroupId[])
      : []
    const surfaceRaw = params.get(PARAM_SURFACE)
    const surface = isSurfaceId(surfaceRaw) ? surfaceRaw : null
    const depthRaw = params.get(PARAM_DEPTH)
    const depth = isDepthId(depthRaw) ? depthRaw : null
    const minRaw = Number(params.get(PARAM_MIN))
    const minStores: MinStoresStop = isMinStoresStop(minRaw) ? minRaw : 0
    const query = params.get(PARAM_QUERY) ?? ''
    const sortRaw = params.get(PARAM_SORT)
    const sort = isSortId(sortRaw) ? sortRaw : 'group'
    return { groups, surface, depth, minStores, query, sort }
  } catch {
    return { groups: [], surface: null, depth: null, minStores: 0, query: '', sort: 'group' }
  }
}

const writeUrl = (state: FilterState) => {
  try {
    const url = new URL(window.location.href)
    if (state.groups.length) url.searchParams.set(PARAM_GROUPS, state.groups.join(','))
    else url.searchParams.delete(PARAM_GROUPS)
    if (state.surface) url.searchParams.set(PARAM_SURFACE, state.surface)
    else url.searchParams.delete(PARAM_SURFACE)
    if (state.depth) url.searchParams.set(PARAM_DEPTH, state.depth)
    else url.searchParams.delete(PARAM_DEPTH)
    if (state.minStores > 0) url.searchParams.set(PARAM_MIN, String(state.minStores))
    else url.searchParams.delete(PARAM_MIN)
    if (state.query) url.searchParams.set(PARAM_QUERY, state.query)
    else url.searchParams.delete(PARAM_QUERY)
    if (state.sort !== 'group') url.searchParams.set(PARAM_SORT, state.sort)
    else url.searchParams.delete(PARAM_SORT)
    window.history.replaceState(null, '', url)
  } catch {
    // preview-only convenience; never block the filter on it
  }
}

export interface SkillsFilter {
  groups: Set<SkillGroupId>
  surface: SurfaceId | null
  depth: DepthId | null
  minStores: MinStoresStop
  query: string
  sort: SortId
  toggleGroup: (g: SkillGroupId) => void
  setSurface: (s: SurfaceId | null) => void
  setDepth: (d: DepthId | null) => void
  setMinStores: (n: MinStoresStop) => void
  setQuery: (q: string) => void
  setSort: (s: SortId) => void
  clear: () => void
  isActive: boolean
  matchesTool: (u: ToolUsage) => boolean
  /** Every facet except group membership — the basis for a group chip's own live count: "how many
   *  tools in this group would show if this chip were the only group toggled on", i.e. everything
   *  BUT the current group selection, so a chip always reports a real, checkable number regardless of
   *  which other groups happen to be active right now (see SkillsFilterBar). */
  matchesWithoutGroup: (u: ToolUsage) => boolean
  /** Applies the current `sort` to a list without mutating it — 'group' is a no-op (registry/document
   *  order), 'usage' is real total descending (ties broken alphabetically), 'name' is alphabetical.
   *  Shared by the orbit (dot order per ring) and the ledger (row order per group). */
  sortTools: (list: ToolUsage[]) => ToolUsage[]
}

export function useSkillsFilter(validGroups: readonly SkillGroupId[]): SkillsFilter {
  const [state, setState] = useState<FilterState>(() => readInitial(validGroups))

  const update = useCallback((next: FilterState) => {
    setState(next)
    writeUrl(next)
  }, [])

  const toggleGroup = useCallback(
    (g: SkillGroupId) => {
      update({ ...state, groups: state.groups.includes(g) ? state.groups.filter((x) => x !== g) : [...state.groups, g] })
    },
    [state, update],
  )
  const setSurface = useCallback((s: SurfaceId | null) => update({ ...state, surface: state.surface === s ? null : s }), [state, update])
  const setDepth = useCallback((d: DepthId | null) => update({ ...state, depth: state.depth === d ? null : d }), [state, update])
  const setMinStores = useCallback((n: MinStoresStop) => update({ ...state, minStores: n }), [state, update])
  const setQuery = useCallback((q: string) => update({ ...state, query: q }), [state, update])
  const setSort = useCallback((s: SortId) => update({ ...state, sort: s }), [state, update])
  // Sort is a view preference, not a filter: Clear resets every facet but leaves it exactly as it was.
  const clear = useCallback(() => update({ ...state, groups: [], surface: null, depth: null, minStores: 0, query: '' }), [state, update])

  const groupsSet = useMemo(() => new Set(state.groups), [state.groups])
  const isActive = groupsSet.size > 0 || !!state.surface || !!state.depth || state.minStores > 0 || state.query.trim().length > 0
  const queryLower = state.query.trim().toLowerCase()

  const matchesWithoutGroup = useCallback(
    (u: ToolUsage) => {
      if (state.surface === 'storefronts' && u.stores <= 0) return false
      if (state.surface === 'products' && u.products <= 0) return false
      if (state.surface === 'roles' && u.roleWork <= 0) return false
      if (state.depth && u.depth !== state.depth) return false
      if (state.minStores > 0 && u.stores < state.minStores) return false
      if (queryLower && !u.tool.toLowerCase().includes(queryLower)) return false
      return true
    },
    [state.surface, state.depth, state.minStores, queryLower],
  )

  const matchesTool = useCallback(
    (u: ToolUsage) => {
      if (groupsSet.size > 0 && !groupsSet.has(u.group)) return false
      return matchesWithoutGroup(u)
    },
    [groupsSet, matchesWithoutGroup],
  )

  const sortTools = useCallback(
    (list: ToolUsage[]) => {
      if (state.sort === 'usage') return [...list].sort((a, b) => b.total - a.total || a.tool.localeCompare(b.tool))
      if (state.sort === 'name') return [...list].sort((a, b) => a.tool.localeCompare(b.tool))
      return list
    },
    [state.sort],
  )

  return {
    groups: groupsSet,
    surface: state.surface,
    depth: state.depth,
    minStores: state.minStores,
    query: state.query,
    sort: state.sort,
    toggleGroup,
    setSurface,
    setDepth,
    setMinStores,
    setQuery,
    setSort,
    clear,
    isActive,
    matchesTool,
    matchesWithoutGroup,
    sortTools,
  }
}
