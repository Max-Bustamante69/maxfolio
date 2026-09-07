import { useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, ProjectModal, type Skin, type FrameShots, type LightboxItem, type CaseStudyData } from '../gallery'
import type { StoreEntry } from '../../data/registry'
import type { PortfolioContent } from '../../content/types'

export type SectionHeading = (eyebrow: string, title: string, accent: string, lead?: string) => ReactNode

type Filter = 'all' | 'live' | 'dev'
type View = 'carousel' | 'grid' | 'phones'

interface GalleryLabels {
  home: string
  pdp: string
  desktop: string
  mobile: string
}

export const shotsFor = (slug: string, withPdp = true): FrameShots => ({
  homeDesktop: `/gallery/${slug}/home-desktop.webp`,
  homeMobile: `/gallery/${slug}/home-mobile.webp`,
  ...(withPdp ? { pdpDesktop: `/gallery/${slug}/pdp-desktop.webp`, pdpMobile: `/gallery/${slug}/pdp-mobile.webp` } : {}),
})

export const lightboxItems = (slug: string, labels: GalleryLabels, withPdp = true): LightboxItem[] => [
  { key: 'hd', label: `${labels.home} · ${labels.desktop}`, src: `/gallery/${slug}/home-desktop.webp`, kind: 'desktop' },
  ...(withPdp ? [{ key: 'pd', label: `${labels.pdp} · ${labels.desktop}`, src: `/gallery/${slug}/pdp-desktop.webp`, kind: 'desktop' as const }] : []),
  { key: 'hm', label: `${labels.home} · ${labels.mobile}`, src: `/gallery/${slug}/home-mobile.webp`, kind: 'mobile' },
  ...(withPdp ? [{ key: 'pm', label: `${labels.pdp} · ${labels.mobile}`, src: `/gallery/${slug}/pdp-mobile.webp`, kind: 'mobile' as const }] : []),
]

/** Builds the case-study sheet data for a store from the registry + the active locale. */
export function caseStudyFor(
  st: StoreEntry,
  strings: PortfolioContent,
  skin: Skin,
  formatPeriod: (start: string, end: string | null) => string,
): CaseStudyData {
  const c = strings.stores[st.slug]
  const cs = strings.sections.caseStudy
  const stats = [
    { label: cs.timeline, value: formatPeriod(st.timeline.start, st.timeline.end) },
    ...(st.commits ? [{ label: cs.commits, value: st.commits.toLocaleString() }] : []),
    ...(st.sections ? [{ label: cs.sections, value: String(st.sections) }] : []),
    ...st.facts.map((f) => ({ label: c?.factLabels?.[f.id] ?? f.id, value: f.value })),
  ]
  const results = st.results.map((r) => ({ label: c?.factLabels?.[r.id] ?? r.id, value: r.value }))
  return {
    name: st.name,
    url: st.url || undefined,
    meta: `${c?.industry ?? ''} · ${st.year} · ${strings.badges.roles[st.role]}`,
    badge: { text: st.status === 'live' ? strings.badges.live : strings.badges.dev, className: st.status === 'live' ? skin.badgeLive : skin.badgeDev },
    tagline: c?.tagline ?? '',
    description: c?.description ?? '',
    stats,
    results,
    stack: st.stack,
    shots: shotsFor(st.slug, st.gallery),
  }
}

interface GalleryProps {
  skin: Skin
  heading: SectionHeading
}

/**
 * The visual wall. Three views — a carousel of laptop + phone composites (default), a grid of the same,
 * or a wall of phones — and a case-study sheet on click. The facts live in Shopify Work.
 */
export function Gallery({ skin, heading }: GalleryProps) {
  const { strings, registry, formatPeriod } = useContent()
  const g = strings.sections.gallery
  const cs = strings.sections.caseStudy
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('carousel')
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const rail = useRef<HTMLDivElement>(null)

  const items = useMemo(
    () => registry.stores.filter((s) => s.gallery && (filter === 'all' || s.status === filter)),
    [filter, registry.stores],
  )
  const open = openSlug ? registry.stores.find((s) => s.slug === openSlug) : null
  const chip = (active: boolean) => `${active ? skin.chipOn : skin.chip} compact-touch transition-colors`

  const scrollRail = (dir: 1 | -1) => {
    const el = rail.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const Caption = ({ s }: { s: StoreEntry }) => (
    <figcaption className="mt-3 flex items-center justify-between gap-3">
      <span className={`${skin.title} truncate text-sm`}>{s.name}</span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${s.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>
        {s.status === 'live' ? strings.badges.live : strings.badges.dev}
      </span>
    </figcaption>
  )

  return (
    <section id="gallery" className="scroll-mt-20">
      {heading(g.eyebrow, g.title, g.titleAccent, g.lead)}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={g.eyebrow}>
            {(['all', 'live', 'dev'] as Filter[]).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={chip(filter === f)}>
                {f === 'all' ? g.filterAll : f === 'live' ? g.filterLive : g.filterDev}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={g.viewLabel}>
            {(['carousel', 'grid', 'phones'] as View[]).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={chip(view === v)}>
                {v === 'carousel' ? g.viewCarousel : v === 'grid' ? g.viewDevices : g.viewPhones}
              </button>
            ))}
          </div>
        </div>
        {view === 'carousel' && (
          <div className="flex gap-2">
            <button type="button" onClick={() => scrollRail(-1)} className={`${skin.chip} compact-touch h-9 w-9 rounded-full !px-0 text-base`} aria-label={cs.prev}>
              ‹
            </button>
            <button type="button" onClick={() => scrollRail(1)} className={`${skin.chip} compact-touch h-9 w-9 rounded-full !px-0 text-base`} aria-label={cs.next}>
              ›
            </button>
          </div>
        )}
      </div>

      {view === 'carousel' && (
        <div
          ref={rail}
          className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((s) => (
            <figure key={s.slug} data-card className="m-0 w-[86%] shrink-0 snap-start sm:w-[62%] lg:w-[46%]">
              <ProjectFrame name={s.name} shots={shotsFor(s.slug)} skin={skin} onOpen={() => setOpenSlug(s.slug)} alt={g.open} />
              <Caption s={s} />
            </figure>
          ))}
        </div>
      )}

      {view === 'grid' && (
        <motion.div layout className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, idx) => (
            <motion.figure
              key={s.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (idx % 3) * 0.05, duration: 0.5 }}
              className="m-0"
            >
              <ProjectFrame name={s.name} shots={shotsFor(s.slug)} skin={skin} onOpen={() => setOpenSlug(s.slug)} alt={g.open} />
              <Caption s={s} />
            </motion.figure>
          ))}
        </motion.div>
      )}

      {view === 'phones' && (
        <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((s, idx) => (
            <motion.figure
              key={s.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (idx % 5) * 0.04, duration: 0.5 }}
              className="m-0"
            >
              <ProjectFrame name={s.name} shots={shotsFor(s.slug)} skin={skin} onOpen={() => setOpenSlug(s.slug)} alt={g.open} variant="phone" />
              <figcaption className={`${skin.muted} mt-2 truncate text-center text-xs`}>{s.name}</figcaption>
            </motion.figure>
          ))}
        </motion.div>
      )}

      <ProjectModal
        open={!!open}
        data={open ? caseStudyFor(open, strings, skin, formatPeriod) : null}
        skin={skin}
        labels={{ close: g.close, prev: cs.prev, next: cs.next, home: g.home, pdp: g.pdp, desktop: g.desktop, mobile: g.mobile, facts: cs.facts, results: cs.results, stack: cs.stack, visit: cs.visit }}
        onClose={() => setOpenSlug(null)}
      />
    </section>
  )
}
