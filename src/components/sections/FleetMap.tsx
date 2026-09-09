import { Suspense, useMemo, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent, useSheetHistory } from '../../hooks'
import { caseStudyFor, caseStudyLabels, ProjectModal, type SectionHeading } from './Gallery'
import type { Skin } from '../gallery'
import type { StoreEntry, StoreRole } from '../../data/registry'

interface FleetMapProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const
/** Same live/dev semantics as the Years unit chart and the Shopify Work badges, just as dots. */
const DOT_COLOR = { live: '#34c759', dev: '#ff9f0a' } as const

/**
 * The 18-store fleet as a dot matrix: grouped by the industry it serves, colored by status
 * (live/dev), shape by role (a diamond marks a migration, a circle a from-scratch build). Every
 * dot opens the same case-study sheet as the Shopify Work index — real data, one click deeper.
 */
export function FleetMap({ skin, heading }: FleetMapProps) {
  const { strings, registry, formatPeriod } = useContent()
  const reduced = useReducedMotion()
  const fm = strings.sections.fleetMap
  const [role, setRole] = useState<StoreRole | null>(null)
  const [openStore, setOpenStoreState] = useState<StoreEntry | null>(null)
  const [sheetLoaded, setSheetLoaded] = useState(false)
  const setOpenStore = (st: StoreEntry | null) => {
    if (st) setSheetLoaded(true)
    setOpenStoreState(st)
  }
  // A different query param than Shopify Work's `?store=`, so the two sheets never fight over the same history entry.
  useSheetHistory(openStore?.slug ?? null, () => setOpenStoreState(null), {
    param: 'fleet',
    open: (slug) => {
      const st = registry.stores.find((x) => x.slug === slug)
      if (st) setOpenStore(st)
    },
  })

  const fleet = useMemo(() => registry.stores.filter((s) => !s.legacy), [registry.stores])
  const roles = useMemo(() => Array.from(new Set(fleet.map((s) => s.role))).sort() as StoreRole[], [fleet])
  const visible = role ? fleet.filter((s) => s.role === role) : fleet

  const groups = useMemo(() => {
    const byIndustry = new Map<string, StoreEntry[]>()
    visible.forEach((s) => {
      const industry = strings.stores[s.slug]?.industry ?? '—'
      const list = byIndustry.get(industry) ?? []
      list.push(s)
      byIndustry.set(industry, list)
    })
    return Array.from(byIndustry.entries()).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  }, [visible, strings.stores])

  const chipFor = (on: boolean) => `${on ? skin.chipOn : skin.chip} compact-touch transition-colors`

  return (
    <section id="fleet-map" className="scroll-mt-20">
      {heading(fm.eyebrow, fm.title, fm.titleAccent, fm.lead)}

      <div className="mb-8 flex flex-wrap items-center gap-2" role="radiogroup" aria-label={fm.eyebrow}>
        <button type="button" role="radio" aria-checked={role === null} onClick={() => setRole(null)} className={chipFor(role === null)}>
          {fm.filterAll}
        </button>
        {roles.map((r) => (
          <button key={r} type="button" role="radio" aria-checked={role === r} onClick={() => setRole(role === r ? null : r)} className={chipFor(role === r)}>
            {strings.badges.roles[r]}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {groups.map(([industry, stores]) => (
          <div key={industry}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>
              {industry} · {stores.length}
            </p>
            <div className="mt-3 flex flex-wrap gap-3" role="list" aria-label={industry}>
              {stores.map((st) => (
                <button
                  key={st.slug}
                  type="button"
                  role="listitem"
                  onClick={() => setOpenStore(st)}
                  aria-label={`${st.name} · ${industry} · ${st.status === 'live' ? strings.badges.live : strings.badges.dev} · ${strings.badges.roles[st.role]}`}
                  title={st.name}
                  className="press compact-touch relative flex h-9 w-9 items-center justify-center transition-transform duration-150 hover:scale-110"
                >
                  {/* framer owns this element's transform end to end (scale + the migrated diamond's rotate) — no CSS
                      transform utility shares it, or the two animation systems fight over the property and the
                      entrance animation gets stuck mid-scale. Hover growth lives on the button above instead. */}
                  <m.span
                    aria-hidden="true"
                    className={`block h-3.5 w-3.5 ${st.role === 'migrated' ? '' : 'rounded-full'}`}
                    style={{ backgroundColor: DOT_COLOR[st.status] }}
                    initial={reduced ? false : { scale: 0, rotate: st.role === 'migrated' ? 45 : 0 }}
                    whileInView={{ scale: 1, rotate: st.role === 'migrated' ? 45 : 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-1.5 text-xs" aria-hidden="true">
        <li className={`${skin.muted} inline-flex items-center gap-1.5`}>
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DOT_COLOR.live }} />
          {strings.badges.live}
        </li>
        <li className={`${skin.muted} inline-flex items-center gap-1.5`}>
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DOT_COLOR.dev }} />
          {strings.badges.dev}
        </li>
        <li className={`${skin.muted} inline-flex items-center gap-1.5`}>
          <span className={`inline-block h-2.5 w-2.5 rotate-45 ${skin.dark ? 'bg-white/40' : 'bg-black/30'}`} />
          {strings.badges.roles.migrated}
        </li>
      </ul>

      {sheetLoaded && (
        <Suspense fallback={null}>
          <ProjectModal
            open={!!openStore}
            data={openStore ? caseStudyFor(openStore, strings, skin, formatPeriod) : null}
            skin={skin}
            labels={caseStudyLabels(strings)}
            onClose={() => setOpenStore(null)}
          />
        </Suspense>
      )}
    </section>
  )
}
