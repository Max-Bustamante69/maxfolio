import { useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, GalleryLightbox, type Skin, type FrameShots, type LightboxItem } from '../gallery'

export type SectionHeading = (eyebrow: string, title: string, accent: string, lead?: string) => ReactNode

type Filter = 'all' | 'live' | 'dev'

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

interface GalleryProps {
  skin: Skin
  heading: SectionHeading
}

export function Gallery({ skin, heading }: GalleryProps) {
  const { strings, registry } = useContent()
  const g = strings.sections.gallery
  const [filter, setFilter] = useState<Filter>('all')
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  const items = useMemo(
    () => registry.stores.filter((s) => s.gallery && (filter === 'all' || s.status === filter)),
    [filter, registry.stores],
  )
  const open = openSlug ? registry.stores.find((s) => s.slug === openSlug) : null

  return (
    <section id="gallery" className="scroll-mt-20">
      {heading(g.eyebrow, g.title, g.titleAccent, g.lead)}

      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label={g.eyebrow}>
        {(['all', 'live', 'dev'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`${filter === f ? skin.chipOn : skin.chip} compact-touch transition-colors`}
          >
            {f === 'all' ? g.filterAll : f === 'live' ? g.filterLive : g.filterDev}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((s, idx) => (
          <motion.article
            key={s.slug}
            layout
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: (idx % 3) * 0.05, duration: 0.5 }}
            className={`${skin.card} p-4`}
          >
            <ProjectFrame
              name={s.name}
              url={s.url || undefined}
              shots={shotsFor(s.slug)}
              skin={skin}
              onOpen={() => setOpenSlug(s.slug)}
              alt={g.open}
            />
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className={`${skin.title} text-base truncate`}>{s.name}</h3>
                <p className={`${skin.muted} text-xs mt-0.5`}>
                  {strings.stores[s.slug]?.industry} · {s.year} · {strings.badges.roles[s.role]}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${s.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>
                {s.status === 'live' ? strings.badges.live : strings.badges.dev}
              </span>
            </div>
          </motion.article>
        ))}
      </motion.div>

      <GalleryLightbox
        open={!!open}
        title={open?.name ?? ''}
        items={open ? lightboxItems(open.slug, g) : []}
        onClose={() => setOpenSlug(null)}
        closeLabel={g.close}
      />
    </section>
  )
}
