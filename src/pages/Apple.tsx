import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
// Direct imports (not the component barrels) so the main chunk carries only what the first paint needs.
import { SEOHead, MobileMenuApple, LanguageSelectorApple, LogoSelectorApple, Magnetic, TransitionLink, SmoothScroll, ScrollRail, Ticker, RevealText } from '../components/common'
import { ContactFormModal } from '../components/modals'
import { MenuPreview } from '../components/previews'
import { Testimonials } from '../components/sections/Testimonials'
import { Experience } from '../components/sections/Experience'
import { skins } from '../components/gallery/skins'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { defaultDesign, otherDesigns, MENU } from '../data/designs'
import { track, useSectionViewTracking } from '../lib/track'

// Below the fold, each section arrives as its own chunk so the hero paints off a smaller bundle.
const Chapters = lazy(() => import('../components/sections/Chapters').then((mod) => ({ default: mod.Chapters })))
const Process = lazy(() => import('../components/sections/Process').then((mod) => ({ default: mod.Process })))
const ShopifyWork = lazy(() => import('../components/sections/ShopifyWork').then((mod) => ({ default: mod.ShopifyWork })))
// The measured-ranges graphic band that replaced the hero's old stat band — it earns its place at
// the top of the Shopify storefronts section instead, where "See the storefronts" actually lands.
const MeasuredBand = lazy(() => import('../components/sections/MeasuredBand').then((mod) => ({ default: mod.MeasuredBand })))
const Gallery = lazy(() => import('../components/sections/Gallery').then((mod) => ({ default: mod.Gallery })))
const FeaturedBuild = lazy(() => import('../components/sections/FeaturedBuild').then((mod) => ({ default: mod.FeaturedBuild })))
const BuildKit = lazy(() => import('../components/sections/BuildKit').then((mod) => ({ default: mod.BuildKit })))
const Projects = lazy(() => import('../components/sections/Projects').then((mod) => ({ default: mod.Projects })))
const Skills = lazy(() => import('../components/sections/Skills').then((mod) => ({ default: mod.Skills })))
// "How we could work together" — round 44 prototype (?proposal=models-a|b), round 46 lane "extras" made it the only implementation.
const EngagementModels = lazy(() => import('../components/sections/EngagementModels').then((mod) => ({ default: mod.EngagementModels })))
const StoreCheck = lazy(() => import('../components/sections/StoreCheck').then((mod) => ({ default: mod.StoreCheck })))
const Faq = lazy(() => import('../components/sections/Faq').then((mod) => ({ default: mod.Faq })))
const Contact = lazy(() => import('../components/sections/Contact').then((mod) => ({ default: mod.Contact })))
const CareerSubway = lazy(() => import('../components/sections/CareerSubway').then((mod) => ({ default: mod.CareerSubway })))

/** Keeps the page height stable while a section's chunk loads. Capped at 40vh: on a slow connection
 * every one of these chunks starts downloading at mount (they aren't gated behind an
 * IntersectionObserver), so a scrolling visitor can land on one before it resolves — 60vh read as a
 * dead end mid-scroll (QA v2, 2026-09-09). 40vh still holds layout for the tallest sections without
 * manufacturing that much blank space for the short ones. */
const Pending = ({ h = 'min-h-[40vh]' }: { h?: string }) => <div className={h} aria-hidden="true" />

/** Wall-clock time in Medellín, refreshed every 30 s — a real vital, not decoration. */
function useLocalTime(locale: string) {
  const fmt = () => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    setTime(fmt())
    const id = window.setInterval(() => setTime(fmt()), 30_000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])
  return time
}

/**
 * Section-aware nav: whichever section's band crosses a line just under the fixed header is
 * "active" — an IntersectionObserver, not scroll-position math. Several targets (shopify, gallery,
 * projects, contact) are behind `Suspense`/`lazy()` and may not exist in the DOM yet on mount, so a
 * `ResizeObserver` on the document (the same trick `ScrollRail` uses for its own positions) re-scans
 * for and attaches any section that has since mounted.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  const activeRef = useRef(active)
  activeRef.current = active
  // The nav is 44px through tablet widths, 56px from lg up (more breathing room, same 1024px cutoff
  // the drawer/sheet split uses) — the observer's top margin has to track that or "active" flips a
  // beat early/late right at the lg boundary.
  const [navHeight, setNavHeight] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? 56 : 44))
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setNavHeight(mq.matches ? 56 : 44)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  useEffect(() => {
    const ratios = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        let best = activeRef.current
        let bestRatio = 0
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        }
        if (bestRatio > 0) setActive(best)
      },
      { rootMargin: `-${navHeight}px 0px -55% 0px`, threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    const attached = new Set<string>()
    const attach = () => {
      for (const id of ids) {
        if (attached.has(id)) continue
        const el = document.getElementById(id)
        if (el) {
          attached.add(id)
          observer.observe(el)
        }
      }
    }
    attach()
    const ro = new ResizeObserver(attach)
    ro.observe(document.documentElement)
    return () => {
      observer.disconnect()
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|'), navHeight])
  return active
}

// Strong ease-out: instant response, soft landing.
const EASE = [0.23, 1, 0.32, 1] as const

const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => {
  // Reduced motion: fade only, no travel or scale.
  const reduce = useReducedMotion()
  return (
    <m.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </m.div>
  )
}

const Icon = {
  mail: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  sun: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  ),
  moon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
  globe: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  down: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0-6-6m6 6 6-6" />
    </svg>
  ),
}

/**
 * Apple Clean. The page runs through distinct layouts on purpose — typographic hero, stat band,
 * ticker, split tabs, editorial timeline, pinned stepper, index list, media carousel, index list,
 * narrative chips, typographic close — so no two neighboring bands are "another grid of cards".
 */
function AppleContent() {
  const { isDark, toggleTheme } = useTheme()
  const { t, locale } = useI18n()
  const { strings: c, registry } = useContent()
  const localTime = useLocalTime(locale === 'ja' ? 'ja-JP' : locale === 'es' ? 'es-CO' : 'en-US')
  const [contactOpen, setContactOpen] = useState(false)
  const [contactPrefill, setContactPrefill] = useState('')
  const [showCareerMap, setShowCareerMap] = useState(false)
  const openContact = (prefill?: string) => {
    setContactPrefill(prefill ?? '')
    setContactOpen(true)
  }
  useDynamicFavicon('apple')
  // `contact_open` itself fires from inside `ContactFormModal` (one shared component, every theme) —
  // this page only needs `section_view` wired at the page level, and `data-track-section` on each
  // section id below is what feeds it.
  useSectionViewTracking()

  const skin = skins.apple(isDark)
  const bg = isDark ? 'bg-apple-dark text-apple-darkText' : 'bg-apple-bg text-apple-text'
  const surface = isDark ? 'bg-apple-darkSurface' : 'bg-apple-surface'
  const tile = isDark ? 'bg-white/5' : 'bg-white shadow-tile'
  const muted = isDark ? 'text-apple-darkMuted' : 'text-apple-muted'
  const blue = isDark ? 'text-apple-blueDark' : 'text-apple-blue'
  const nav = [
    ['#hero', t('nav.home')],
    ['#experience', t('nav.experience')],
    ['#shopify', t('nav.shopify')],
    ['#gallery', t('nav.gallery')],
    ['#projects', t('nav.projects')],
    ['#contact', t('nav.contact')],
  ] as const

  const Heading = (eyebrow: string, title: string, accent: string, lead?: string) => (
    <Reveal className="mb-10 md:mb-14">
      {/* 12px eyebrow on the gray surface: the brand blue reads 4.31:1 there, the darker shade clears AA (5.1:1). */}
      <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${isDark ? 'text-apple-blueDark' : 'text-[#0066cc]'} mb-3`}>{eyebrow}</p>
      <h2 className="font-sf text-4xl md:text-6xl font-semibold tracking-[-0.025em] leading-[1.05]">
        <RevealText text={title} /> <RevealText text={accent} className={muted} delay={0.1} />
      </h2>
      {lead && <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed`}>{lead}</p>}
    </Reveal>
  )

  const primaryBtn = 'press inline-flex items-center justify-center rounded-full bg-apple-blue px-6 py-3 text-sm font-medium text-white hover:bg-apple-blueHover'
  // Tracks more bands than the nav shows links for (skills, proof, engagement, faq) so "Projects"
  // doesn't stay lit through them (the nav's `on` check only matches the 6 href ids below, so an id
  // outside that list simply shows nothing active — which is the fix: no longer the *wrong* thing
  // staying active).
  const activeSection = useActiveSection([...nav.map(([href]) => href.slice(1)), 'skills', 'proof', 'engagement', 'faq'])
  const liveCount = registry.stores.filter((s) => s.status === 'live').length
  const devCount = registry.stores.filter((s) => s.status === 'dev').length

  return (
    <>
      <SEOHead
        title={c.meta.title}
        description={c.meta.description}
        canonical="https://www.maxfolio.dev"
        ogImage="https://www.maxfolio.dev/og-image.png"
      />
      <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="apple" isDark={isDark} initialMessage={contactPrefill} />

      <div className={`theme-apple min-h-screen font-sf ${bg} transition-colors duration-300 [overflow-x:clip]`} role="document">
        <ScrollRail sections={nav.map(([href, label]) => ({ id: href.slice(1), label }))} dark={isDark} accent={isDark ? '#2997ff' : '#0071e3'} />
        {/* Nav — 44px through tablet widths, 56px from lg (1024px, the same desktop cutoff the
            drawer/sheet split already uses) up for more breathing room, frosted. The 6-link row
            plus language selector, theme toggle and CTA together are wider than any md
            (768-1023px, e.g. iPad portrait/landscape) viewport has room for — measured: at
            exactly 768px the CTA's right edge sat 4-7px past the viewport edge, clipped (round-45
            nav768 fix). Below lg the links row gives way to the same MobileMenuApple sheet phones
            use, matching how Brutalist/Luxury already split; logo + language + theme toggle + CTA
            + hamburger fit that range with room to spare once the links aren't also competing. */}
        <nav
          className={`fixed top-0 inset-x-0 z-40 h-11 lg:h-14 ${isDark ? 'bg-black/70' : 'bg-white/70'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}
          aria-label="Main navigation"
        >
          {/* Three-column grid, not absolute centering: `minmax(max-content,1fr)` on both side
              columns means each grows to share the leftover space equally once there's room for
              both, which lands the links group exactly on the container's midpoint; when the
              container is too narrow for that (e.g. the right cluster's own content is wider than
              half the remaining space) the wider side freezes at its content width and the links
              shift instead of sliding underneath either cluster — never an overlap. */}
          <div className="frame h-full grid grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] items-center gap-3">
            <div className="justify-self-start min-w-0">
              <LogoSelectorApple isDark={isDark} />
            </div>
            <div className="hidden lg:flex items-center gap-4 lg:gap-6 text-xs lg:text-[13px]">
              {nav.map(([href, label]) => {
                const on = activeSection === href.slice(1)
                return (
                  <a
                    key={href}
                    href={href}
                    aria-current={on ? 'true' : undefined}
                    className={`relative inline-flex items-center h-11 lg:h-14 transition-colors duration-150 ${on ? blue : `${muted} hover:${blue}`}`}
                  >
                    {label}
                    {on && (
                      <m.span
                        layoutId="apple-nav-active"
                        className={`absolute -bottom-px left-0 right-0 h-[2px] rounded-full ${isDark ? 'bg-apple-blueDark' : 'bg-apple-blue'}`}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </a>
                )
              })}
            </div>
            <div className="flex items-center gap-1.5 lg:gap-2 justify-self-end">
              <LanguageSelectorApple isDark={isDark} />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`press compact-touch w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-[#1d1d1f]'}`}
              >
                {isDark ? Icon.sun : Icon.moon}
              </button>
              <button
                type="button"
                onClick={() => {
                  track('cta_click', { cta: 'contact', position: 'nav' })
                  setContactOpen(true)
                }}
                className="press compact-touch hidden sm:inline-flex h-8 lg:h-9 items-center rounded-full bg-apple-blue px-3 lg:px-3.5 text-xs font-medium text-white hover:bg-apple-blueHover"
              >
                {c.hero.ctaContact}
              </button>
              <MobileMenuApple
                isDark={isDark}
                onContactClick={() => {
                  track('cta_click', { cta: 'contact', position: 'mobile' })
                  setContactOpen(true)
                }}
                contactLabel={c.hero.ctaContact}
                navItems={nav.map(([href, label]) => ({ href, label }))}
              />
            </div>
          </div>
        </nav>

        <main id="main-content" className="pt-11 lg:pt-14">
          {/* Hero — editorial, left-aligned on the frame's 12-col grid (round 47: replaces the
              centered stack Max called "desorganizada, cosas no alineadas"). `items-start` on the
              grid is a deliberate alignment choice: the Now card's top sits flush with the eyebrow's
              top — the column's first line either way, so the two columns read as one baseline. */}
          <section id="hero" data-track-section="hero" className="pt-16 md:pt-24 pb-10 md:pb-12 scroll-mt-20 lg:scroll-mt-[92px]" aria-labelledby="hero-heading">
            <div className="frame">
              {/* Two rows on the frame's 12-col grid: the name runs across the whole frame, then the
                  message (7 cols) sits beside the Now card (4 cols, right edge). Both start on the same
                  line, so the two columns end near each other instead of leaving a hole under the card.
                  The card stays top-aligned: React appends rows to it on hydration, and a bottom- or
                  center-aligned card would move what the static shell already painted. */}
              <div className="grid gap-y-8 gap-x-10 lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-10">
                <div className="lg:col-span-12">
                  <p className={`text-sm font-semibold ${blue}`}>{c.hero.eyebrow}</p>
                  {/* The LCP element stays static: an entrance fade would delay the first meaningful
                      paint. Two lines below lg, one line from lg up, where the frame is wide enough;
                      sizes stay under the frame's content width at each breakpoint (≈9.3em for the name). */}
                  <h1
                    id="hero-heading"
                    className="mt-4 font-semibold tracking-[-0.03em] leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[7rem] 2xl:text-[8rem]"
                  >
                    <span className="block lg:inline">{registry.personal.firstName}</span>{' '}
                    <span className="block lg:inline">{registry.personal.lastName}</span>
                  </h1>
                </div>
                <div className="lg:col-span-7">
                  <p className="max-w-xl text-xl md:text-2xl font-medium leading-snug tracking-[-0.01em]">{c.hero.positioning}</p>
                  {/* Static (no entrance): index.html carries the same hero markup before React mounts. A `trigger="load"` RevealText
                      here was tried and reverted -- it starts every word at opacity:0, so the lead line (already painted, readable,
                      by the static shell) vanished for ~1-2s on every load before re-animating in word by word, a real flash/regression
                      against the exact static-shell duplication this comment is about. Capped at ~60ch (design-system measure), not
                      the column's own width — at xl the left column runs well past a readable line length. */}
                  <p className={`mt-5 max-w-[60ch] text-base md:text-lg leading-relaxed ${muted}`}>{c.hero.lead}</p>
                  {/* Static (no entrance): index.html carries the same hero markup before React mounts, so an entrance fade would
                      flash. All three items share an explicit h-11 (the 44px touch floor) and items-center, so the filled pill and
                      the two plain-text links sit on one visual baseline instead of three different box heights. */}
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <Magnetic>
                      <button
                        type="button"
                        onClick={() => {
                          track('cta_click', { cta: 'store-review', position: 'hero' })
                          openContact()
                        }}
                        className={`${primaryBtn} h-11`}
                      >
                        {c.hero.ctaPrimary}
                      </button>
                    </Magnetic>
                    <a href="#shopify" className={`h-11 inline-flex items-center gap-1.5 text-sm font-medium ${blue}`}>
                      {c.hero.ctaSecondary} {Icon.down}
                    </a>
                    <a
                      href={registry.personal.cv}
                      download
                      onClick={() => track('cv_download', { theme: 'apple' })}
                      className={`h-11 inline-flex items-center text-sm font-medium ${muted}`}
                    >
                      {c.hero.ctaCv} ›
                    </a>
                  </div>
                  <p className={`${muted} mt-4 text-xs`}>{c.hero.ctaNote}</p>
                </div>

                {/* Now — one Apple tile that absorbs the old availability/location pills and the
                    separate "Now" pill that used to float under the ticker below. Availability and
                    location come first (deliberately, not the brief's own listed order): they're the
                    only rows the static shell in index.html can pre-render (fixed copy, no runtime
                    value), so putting them first means React only ever APPENDS the live/dev/local-time
                    rows below on hydration — it never inserts above already-painted text, so the swap
                    can't shift it. */}
                {/* The availability line is the card's title, flush left; every other row keeps a 14px leading slot (dot, globe or blank) so their text lines up. */}
                <div className="lg:col-span-4 lg:col-start-9">
                  <div className={`${skin.card} p-6 md:p-7`}>
                    <div className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${muted}`}>
                      <span className="relative flex h-3.5 w-3.5 items-center justify-center" aria-hidden="true">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#34c759] opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
                      </span>
                      {c.sections.now.label}
                    </div>
                    <p className="mt-3 text-base font-semibold leading-snug">{c.hero.availability}</p>
                    <p className={`mt-2 flex items-center gap-2.5 text-sm ${muted}`}>
                      {Icon.globe}
                      {c.hero.location}
                    </p>
                    <div className={`mt-5 space-y-2 border-t pt-5 text-sm ${skin.line}`}>
                      <p className="flex items-center gap-2.5">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center" aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" /></span>
                        {c.sections.now.live.replace('{n}', String(liveCount))}
                      </p>
                      <p className="flex items-center gap-2.5">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center" aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-[#ff9f0a]" /></span>
                        {c.sections.now.dev.replace('{n}', String(devCount))}
                      </p>
                      <p className={`flex items-center gap-2.5 ${muted}`}>
                        <span className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {c.sections.now.local.replace('{time}', localTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fleet ticker — full width, edge to edge of the viewport; the Now pill that used to sit
              above it now lives in the hero's status card. `.ticker-mask` (index.css) already fades
              both edges to transparent and the strip carries no width constraint of its own, so it
              never hard-cuts a name mid-word the way the old 1400px `rail-wide` rail could. */}
          <section className="pt-6 md:pt-8 pb-12 md:pb-16">
            {/* Speed-hover (accelerates ×2.5 under the cursor) layered with a skew tied to page-scroll velocity — the two Now-band effects the ticker spec asked for on the same strip. */}
            <Ticker
              variant="speed-hover"
              skew
              duration={46}
              label={c.sections.now.band}
              items={registry.stores.filter((s) => !s.legacy)}
              keyOf={(s) => s.slug}
              itemClassName="flex shrink-0 items-center gap-2.5 whitespace-nowrap px-5 py-3"
              renderItem={(s) => (
                <>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.status !== 'live' ? 'bg-[#ff9f0a]' : 'bg-[#34c759]'}`} aria-hidden="true" />
                  <span className={`font-sf text-lg font-semibold tracking-[-0.02em] ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>{s.name}</span>
                  {c.stores[s.slug]?.industry && <span className={`text-sm ${muted}`}>{c.stores[s.slug].industry}</span>}
                </>
              )}
            />
          </section>

          {/* Experience — split 50/50, with an optional subway-map view of the same roles */}
          {/* This non-lazy wrapper owns id="experience" (so a hash link lands before the chunk mounts) and the Apple-only lg offset; the inner section renders no id here. */}
          <section id="experience" data-track-section="experience" className={`py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px] ${surface}`}>
            <div className="frame">
              <Experience ownId={false} skin={skin} heading={Heading} />
              <div className="mt-10 md:mt-14">
                <button
                  type="button"
                  onClick={() => setShowCareerMap((v) => !v)}
                  aria-expanded={showCareerMap}
                  aria-controls="career-subway"
                  className={`${showCareerMap ? skin.chipOn : skin.chip} compact-touch press transition-colors`}
                >
                  {showCareerMap ? c.sections.careerSubway.toggleHide : c.sections.careerSubway.toggleShow}
                </button>
                {showCareerMap && (
                  <div className="mt-8">
                    <Suspense fallback={<Pending h="min-h-[30vh]" />}>
                      <CareerSubway skin={skin} heading={Heading} />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Chapters — a horizontal scroll-snap rail of five year cards, not the shared Years.tsx
              editorial list or the old Gantt ribbon. content-visibility:auto was tried and reverted
              here — see docs/seo.md "content-visibility" for the measured instability. */}
          <section className="py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px]">
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <Chapters skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Process — pinned stepper */}
          <section className={`py-14 md:py-20 ${surface}`}>
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <Process skin={skin} heading={Heading} canvas={surface} pinnedRail />
              </Suspense>
            </div>
          </section>

          {/* Shopify work — the index */}
          <section id="shopify" data-track-section="shopify" className="py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px]">
            <div className="frame">
              {/* Measured ranges — the hero's old stat band, moved here and re-drawn as small graphics:
                  where "See the storefronts" actually lands, not stacked on top of the hero's own claim. */}
              <Suspense fallback={<Pending h="min-h-[24vh]" />}>
                <MeasuredBand skin={skin} />
              </Suspense>
              <Suspense fallback={<Pending />}>
                <ShopifyWork ownId={false} skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Gallery — media carousel. content-visibility:auto tried and reverted — docs/seo.md. */}
          <section id="gallery" data-track-section="gallery" className={`py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px] ${surface}`}>
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <Gallery ownId={false} skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Featured build — The Gummy Box, told through one of four selectable design variants
              (?featured=a|b|c|d). Tighter rhythm than its neighbors on purpose — the brief asked for
              denser spacing than the site's usual py-14/py-20 band. */}
          <section className="py-12 md:py-16 scroll-mt-20 lg:scroll-mt-[92px]">
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <FeaturedBuild skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Every build ships with — four concrete deliverables (repo, checks, editable sections, tracking); replaced the Manifesto band in round 47 */}
          <Suspense fallback={<Pending h="min-h-[40vh]" />}>
            <BuildKit skin={skin} />
          </Suspense>

          {/* Testimonials (absent until a real quote exists) */}
          <Testimonials skin={skin} heading={Heading} />

          {/* Projects — index list. content-visibility:auto tried and reverted — docs/seo.md. */}
          <section id="projects" data-track-section="projects" className="py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px]">
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <Projects ownId={false} skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Skills — narrative with inline chips. content-visibility:auto tried and reverted — docs/seo.md. */}
          {/* This non-lazy wrapper owns id="skills" (so a hash link lands before the chunk mounts) and the Apple-only lg offset; the inner section renders no id here. */}
          <section id="skills" data-track-section="skills" className={`py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px] ${surface}`}>
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <Skills ownId={false} skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Store check — a real URL field that measures the visitor's own store live via the
              server-side PSI proxy. Owns its own id so useActiveSection can track it separately from
              Projects above it (round 46, replaces the old review-checklist replay). */}
          <section id="proof" data-track-section="proof" className="py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px]">
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <StoreCheck skin={skin} heading={Heading} onCta={(prefill) => openContact(prefill)} />
              </Suspense>
            </div>
          </section>

          {/* Engagement models — "how we could work together". Owns its own id for the same reason. */}
          <section id="engagement" data-track-section="engagement" className={`py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px] ${surface}`}>
            <div className="frame">
              <Suspense fallback={<Pending />}>
                <EngagementModels ownId={false} skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* FAQ — the objections, answered before the ask. Owns its own id for the same reason. */}
          <section id="faq" data-track-section="faq" className="py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px]">
            <div className="frame">
              <Suspense fallback={<Pending h="min-h-[40vh]" />}>
                <Faq ownId={false} skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Contact — typographic close, a mesh gradient at 30% opacity so the last section isn't flat */}
          <section id="contact" data-track-section="contact" className={`relative overflow-hidden py-24 md:py-32 scroll-mt-20 lg:scroll-mt-[92px] ${surface}`}>
            <img
              src="/art/apple/mesh.webp"
              alt=""
              aria-hidden="true"
              width={1400}
              height={933}
              loading="lazy"
              decoding="async"
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 ${isDark ? "mix-blend-screen" : ""}`}
            />
            <div className="relative frame">
              <Suspense fallback={<Pending />}>
                <Contact
                  ownId={false}
                  skin={skin}
                  ctaClass={`${primaryBtn} px-7`}
                  onContact={openContact}
                  fieldClassName={isDark ? 'border-white/15 bg-white/5 placeholder:text-[#6e6e73] focus:border-[#2997ff]' : 'border-black/15 bg-white placeholder:text-[#a1a1a6] focus:border-[#0071e3]'}
                />
              </Suspense>
            </div>
          </section>

          {/* Explore */}
          <section id="explore" data-track-section="explore" className="py-20 scroll-mt-20 lg:scroll-mt-[92px]">
            <div className="frame">
              {Heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
              <div className="grid sm:grid-cols-3 gap-3">
                {otherDesigns('apple').map((d) => (
                  <TransitionLink
                    key={d.id}
                    to={d.href}
                    transitionColor={d.transitionColor}
                    transitionAccent={d.transitionAccent}
                    transitionLabel={t(d.nameKey)}
                    className={`lift block rounded-[22px] overflow-hidden ${tile}`}
                  >
                    <div className="h-28 overflow-hidden">
                      <d.Preview size="md" />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm">{t(d.nameKey)}</p>
                      <p className={`${muted} text-xs`}>{t(d.subtitleKey)}</p>
                    </div>
                  </TransitionLink>
                ))}
                <TransitionLink
                  to={MENU.route}
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel={t(MENU.labelKey)}
                  className={`lift block rounded-[22px] overflow-hidden ${tile}`}
                >
                  <div className="h-28 overflow-hidden">
                    <MenuPreview isDark={isDark} />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-sm">{t(MENU.labelKey)}</p>
                    <p className={`${muted} text-xs`}>{t(MENU.subtitleKey)}</p>
                  </div>
                </TransitionLink>
              </div>
              <p className={`${muted} text-xs mt-8 text-center`}>
                {c.sections.explore.viewing}: <span className="font-medium">{t(defaultDesign.nameKey)}</span>
              </p>
            </div>
          </section>
        </main>

        {/* Footer — a deliberate close: rights, an honest build stamp, back to top */}
        <footer className={`pb-10 pt-4 text-xs ${muted}`} role="contentinfo" aria-label="Site footer">
          <div className={`frame flex flex-col gap-3 border-t pt-8 md:flex-row md:items-baseline md:justify-between ${skin.line}`}>
            <p>
              © 2026 {registry.personal.name}. {c.footer.rights}
            </p>
            <p className="md:text-center">{c.footer.stamp}</p>
            <a href="#hero" className={`${blue} inline-flex items-center gap-1 font-medium`}>
              {c.footer.backToTop} ↑
            </a>
          </div>
        </footer>

        {/* Mobile contact FAB */}
        <button
          type="button"
          onClick={() => {
            track('cta_click', { cta: 'contact', position: 'fab' })
            setContactOpen(true)
          }}
          aria-label="Open contact form"
          className="press fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-apple-blue text-white shadow-[0_10px_30px_rgba(0,113,227,0.35)] z-30 flex items-center justify-center"
        >
          {Icon.mail}
        </button>
      </div>
    </>
  )
}

export default function Apple() {
  return (
    <ThemeProvider storageKey="apple-theme" defaultTheme="light">
      <SmoothScroll offset={56}>
        <AppleContent />
      </SmoothScroll>
    </ThemeProvider>
  )
}
