// Shared filter state for the orbit layout and its sub-1024px ledger fallback: by skill group
// (multi-select), by "surface" (which kind of real usage — storefronts / in-house products / client
// roles), and by tool name (free text). State lives in the URL (`?tools=<group>,<group>&surface=<id>
// &q=<text>`) so a filtered view is a link a visitor can share or bookmark, the same pattern
// Skills.tsx already uses for `?skills=<layout>` — read once on mount, written with `replaceState` so
// filtering never grows browser history.
import { useCallback, useMemo, useState } from 'react'
import type { SkillGroupId } from '../../../data/registry'
import type { ToolUsage } from '../../../data/skillUsage'

export type SurfaceId = 'storefronts' | 'products' | 'roles'
export const SURFACE_IDS: SurfaceId[] = ['storefronts', 'products', 'roles']

interface FilterState {
  groups: SkillGroupId[]
  surface: SurfaceId | null
  query: string
}

const PARAM_GROUPS = 'tools'
const PARAM_SURFACE = 'surface'
const PARAM_QUERY = 'q'

const isSurfaceId = (v: string | null): v is SurfaceId => !!v && (SURFACE_IDS as readonly string[]).includes(v)

const readInitial = (validGroups: readonly SkillGroupId[]): FilterState => {
  if (typeof window === 'undefined') return { groups: [], surface: null, query: '' }
  try {
    const params = new URLSearchParams(window.location.search)
    const groupsRaw = params.get(PARAM_GROUPS)
    const groups = groupsRaw
      ? (groupsRaw.split(',').filter((g) => (validGroups as readonly string[]).includes(g)) as SkillGroupId[])
      : []
    const surfaceRaw = params.get(PARAM_SURFACE)
    const surface = isSurfaceId(surfaceRaw) ? surfaceRaw : null
    const query = params.get(PARAM_QUERY) ?? ''
    return { groups, surface, query }
  } catch {
    return { groups: [], surface: null, query: '' }
  }
}

const writeUrl = (state: FilterState) => {
  try {
    const url = new URL(window.location.href)
    if (state.groups.length) url.searchParams.set(PARAM_GROUPS, state.groups.join(','))
    else url.searchParams.delete(PARAM_GROUPS)
    if (state.surface) url.searchParams.set(PARAM_SURFACE, state.surface)
    else url.searchParams.delete(PARAM_SURFACE)
    if (state.query) url.searchParams.set(PARAM_QUERY, state.query)
    else url.searchParams.delete(PARAM_QUERY)
    window.history.replaceState(null, '', url)
  } catch {
    // preview-only convenience; never block the filter on it
  }
}

export interface SkillsFilter {
  groups: Set<SkillGroupId>
  surface: SurfaceId | null
  query: string
  toggleGroup: (g: SkillGroupId) => void
  setSurface: (s: SurfaceId | null) => void
  setQuery: (q: string) => void
  clear: () => void
  isActive: boolean
  matchesTool: (u: ToolUsage) => boolean
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
  const setQuery = useCallback((q: string) => update({ ...state, query: q }), [state, update])
  const clear = useCallback(() => update({ groups: [], surface: null, query: '' }), [update])

  const groupsSet = useMemo(() => new Set(state.groups), [state.groups])
  const isActive = groupsSet.size > 0 || !!state.surface || state.query.trim().length > 0
  const queryLower = state.query.trim().toLowerCase()

  const matchesTool = useCallback(
    (u: ToolUsage) => {
      if (groupsSet.size > 0 && !groupsSet.has(u.group)) return false
      if (state.surface === 'storefronts' && u.stores <= 0) return false
      if (state.surface === 'products' && u.products <= 0) return false
      if (state.surface === 'roles' && u.roleWork <= 0) return false
      if (queryLower && !u.tool.toLowerCase().includes(queryLower)) return false
      return true
    },
    [groupsSet, state.surface, queryLower],
  )

  return { groups: groupsSet, surface: state.surface, query: state.query, toggleGroup, setSurface, setQuery, clear, isActive, matchesTool }
}
