import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, GalleryLightbox, type Skin } from '../gallery'
import { shotsFor, lightboxItems, type SectionHeading } from './Gallery'
import type { StoreEntry, ProductEntry } from '../../data/registry'

interface ShopifyWorkProps {
  skin: Skin
  heading: SectionHeading
}

export function ShopifyWork({ skin, heading }: ShopifyWorkProps) {
  const { strings, registry } = useContent()
  const s = strings.sections.shopify
  const g = strings.sections.gallery
  const [tab, setTab] = useState<'stores' | 'products'>('stores')
  const [open, setOpen] = useState<{ id: string; name: string; withPdp: boolean } | null>(null)

  const fleet = registry.stores.filter((x) => !x.legacy)
  const legacy = registry.stores.filter((x) => x.legacy)

  const StoreCard = ({ st }: { st: StoreEntry }) => (
    <article className={`${skin.card} p-4 flex flex-col`}>
      {st.gallery ? (
        <ProjectFrame
          name={st.name}
          url={st.url || undefined}
          shots={shotsFor(st.slug)}
          skin={skin}
          onOpen={() => setOpen({ id: st.slug, name: st.name, withPdp: true })}
          alt={g.open}
        />
      ) : (
        <div className={`aspect-[16/10] flex items-center justify-center rounded-[12px] border border-dashed border-current/20 ${skin.muted} text-xs`}>
          {strings.badges.roles[st.role]} · {st.year}
        </div>
      )}
      <div className="mt-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`${skin.title} text-base`}>{st.name}</h3>
          <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${st.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>
            {st.status === 'live' ? strings.badges.live : strings.badges.dev}
          </span>
        </div>
        <p className={`${skin.muted} text-xs mt-0.5`}>
          {strings.stores[st.slug]?.industry} · {st.year} · {strings.badges.roles[st.role]}
        </p>
        <p className={`${skin.body} text-sm mt-2 leading-relaxed`}>{strings.stores[st.slug]?.tagline}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {st.stack.map((t) => (
            <span key={t} className={skin.chip}>
              {t}
            </span>
          ))}
        </div>
        {st.url && (
          <a href={st.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} text-sm mt-auto pt-3 inline-block`}>
            {s.visit} ›
          </a>
        )}
      </div>
    </article>
  )

  const ProductCard = ({ p }: { p: ProductEntry }) => (
    <article className={`${skin.card} p-4`}>
      {p.gallery && (
        <ProjectFrame
          name={p.name}
          url={p.url}
          shots={shotsFor(p.id, false)}
          skin={skin}
          onOpen={() => setOpen({ id: p.id, name: p.name, withPdp: false })}
          alt={g.open}
        />
      )}
      <div className={p.gallery ? 'mt-3' : ''}>
        <h3 className={`${skin.title} text-lg`}>{p.name}</h3>
        <p className={`${skin.accent} text-sm`}>{strings.products[p.id]?.tagline}</p>
        <p className={`${skin.body} text-sm mt-2 leading-relaxed`}>{strings.products[p.id]?.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {p.stack.map((t) => (
            <span key={t} className={skin.chip}>
              {t}
            </span>
          ))}
        </div>
        {p.url && (
          <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} text-sm mt-3 inline-block`}>
            {s.visit} ›
          </a>
        )}
      </div>
    </article>
  )

  return (
    <section id="shopify" className="scroll-mt-20">
      {heading(s.eyebrow, s.title, s.titleAccent, s.lead)}

      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label={s.eyebrow}>
        {(['stores', 'products'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`${tab === k ? skin.chipOn : skin.chip} compact-touch transition-colors`}
          >
            {k === 'stores' ? s.tabStores : s.tabProducts}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'stores' ? (
          <motion.div key="stores" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleet.map((st) => (
                <StoreCard key={st.slug} st={st} />
              ))}
            </div>
            <p className={`${skin.muted} text-xs tracking-[0.2em] uppercase mt-12 mb-4`}>{s.legacyLabel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {legacy.map((st) => (
                <StoreCard key={st.slug} st={st} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {registry.products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <GalleryLightbox
        open={!!open}
        title={open?.name ?? ''}
        items={open ? lightboxItems(open.id, g, open.withPdp) : []}
        onClose={() => setOpen(null)}
        closeLabel={g.close}
      />
    </section>
  )
}
