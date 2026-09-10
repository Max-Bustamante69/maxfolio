import { useEffect, useRef, useState } from 'react'
import { useContent } from '../../hooks'
import { commerce, isLiveCommerce } from '../../data/commerce'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface FeaturedBuildProps {
  skin: Skin
  heading: SectionHeading
}

const STORE_SLUG = 'nos-cafe'
/** Which of the two real screenshots each beat crossfades to — problem/plan read the home page, build/result read the PDP with the box builder. */
const SCENE_FOR_BEAT = ['home', 'pdp', 'pdp', 'home'] as const

const fill = (tpl: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), tpl)

/**
 * "Featured build": one storefront (NOS Café — a finished Framer design ported 1:1 to Liquid, with a
 * box builder whose discount climbs with every bag) followed through four real beats. Left column
 * pins on wide screens while two real captures crossfade behind the beat currently in view; on
 * phones the media sits above the beats instead of pinning. Nothing here is gated behind a scroll
 * reveal — the pinned media always shows the first beat's scene at rest, and which beat is "active" is
 * read from `getBoundingClientRect`, the same pattern Process.tsx uses, not an IntersectionObserver
 * that can miss a fast scroll.
 */
export function FeaturedBuild({ skin, heading }: FeaturedBuildProps) {
  const { strings, registry, formatPeriod, intlLocale } = useContent()
  const fb = strings.sections.featuredBuild
  const g = strings.sections.gallery
  const store = registry.stores.find((s) => s.slug === STORE_SLUG)
  const c = commerce[STORE_SLUG]
  const [active, setActive] = useState(0)
  const beatRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const ref = window.innerHeight * 0.5
      let best = 0
      let bestD = Infinity
      beatRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - ref)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      setActive(best)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  if (!store) return null

  const ladder = store.facts.find((f) => f.id === 'ladder')?.value ?? ''
  const range = formatPeriod(store.timeline.start, store.timeline.end)
  // One currency prefix, not one per number (formatMoney on each side reads "PEN 49–PEN 209" — noisy).
  const priceRange = isLiveCommerce(c) && c.priceMin != null && c.priceMax != null && c.currency ? `${c.currency} ${Math.round(c.priceMin).toLocaleString(intlLocale)}–${Math.round(c.priceMax).toLocaleString(intlLocale)}` : ''
  const vars: Record<string, string | number> = {
    commits: store.commits ?? 0,
    sections: store.sections ?? 0,
    range,
    url: store.url.replace(/^https?:\/\//, ''),
    products: isLiveCommerce(c) ? c.products : 0,
    collections: isLiveCommerce(c) && c.collections != null ? c.collections : 0,
    priceRange,
    ladder,
  }

  const scene = SCENE_FOR_BEAT[active] ?? 'home'
  const img = (name: 'home' | 'pdp', variant: 'desktop' | 'mobile') => `/gallery/${STORE_SLUG}/${name}-${variant}.webp`

  return (
    <section id="featured-build" className="scroll-mt-20">
      {heading(fb.eyebrow, fb.title, fb.titleAccent, fb.lead)}

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Media: pinned on wide screens, plain on phones. Both scenes are always mounted (never a blank
            frame while JS is still deciding) — only opacity crossfades between them. */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className={`relative aspect-[4/3] overflow-hidden rounded-[22px] border md:aspect-[16/11] ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-[#f5f5f7]'}`}>
            {(['home', 'pdp'] as const).map((s) => (
              <div key={s} className="absolute inset-0 transition-opacity duration-500 ease-out" style={{ opacity: scene === s ? 1 : 0 }} aria-hidden={scene !== s}>
                <img src={img(s, 'desktop')} alt={`${store.name} — ${s === 'home' ? g.home : g.pdp}`} width={1280} height={880} loading="lazy" decoding="async" className="hidden h-full w-full object-cover object-top md:block" />
                <img src={img(s, 'mobile')} alt={`${store.name} — ${s === 'home' ? g.home : g.pdp}`} width={750} height={1000} loading="lazy" decoding="async" className="h-full w-full object-cover object-top md:hidden" />
              </div>
            ))}
          </div>
          <a href={store.url} target="_blank" rel="noreferrer" className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${skin.accent}`}>
            {fb.visit} ›
          </a>
        </div>

        {/* Beats: plain flow, always visible — nothing here waits on a whileInView to paint. */}
        <div>
          {fb.beats.map((beat, i) => (
            <div
              key={beat.label}
              ref={(el) => {
                beatRefs.current[i] = el
              }}
              className={`flex min-h-[45vh] flex-col justify-center border-t py-8 first:border-t-0 md:min-h-[55vh] md:py-10 ${skin.line}`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${active === i ? skin.accent : skin.muted}`}>{beat.label}</p>
              <p className={`mt-2 max-w-md text-xl leading-relaxed md:text-2xl ${active === i ? '' : skin.muted}`}>{fill(beat.body, vars)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
