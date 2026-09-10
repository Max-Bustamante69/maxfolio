import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
// Direct imports (not the component barrels) so the main chunk carries only what the first paint needs.
import { SEOHead, MobileMenuApple, LanguageSelectorApple, LogoSelectorApple, Magnetic, TransitionLink, SmoothScroll, ScrollRail, Ticker, RevealText } from '../components/common'
import { ContactFormModal } from '../components/modals'
import { MenuPreview } from '../components/previews'
import { Testimonials } from '../components/sections/Testimonials'
import { StatBand } from '../components/sections/StatBand'
import { Experience } from '../components/sections/Experience'
import { skins } from '../components/gallery/skins'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { defaultDesign, otherDesigns, MENU } from '../data/designs'

// Below the fold, each section arrives as its own chunk so the hero paints off a smaller bundle.
const BuildTimeline = lazy(() => import('../components/sections/BuildTimeline').then((mod) => ({ default: mod.BuildTimeline })))
const Process = lazy(() => import('../components/sections/Process').then((mod) => ({ default: mod.Process })))
const ShopifyWork = lazy(() => import('../components/sections/ShopifyWork').then((mod) => ({ default: mod.ShopifyWork })))
const FleetMap = lazy(() => import('../components/sections/FleetMap').then((mod) => ({ default: mod.FleetMap })))
const Gallery = lazy(() => import('../components/sections/Gallery').then((mod) => ({ default: mod.Gallery })))
const Manifesto = lazy(() => import('../components/sections/Manifesto').then((mod) => ({ default: mod.Manifesto })))
const Projects = lazy(() => import('../components/sections/Projects').then((mod) => ({ default: mod.Projects })))
const Skills = lazy(() => import('../components/sections/Skills').then((mod) => ({ default: mod.Skills })))
const StackByYear = lazy(() => import('../components/sections/StackByYear').then((mod) => ({ default: mod.StackByYear })))
const Faq = lazy(() => import('../components/sections/Faq').then((mod) => ({ default: mod.Faq })))
const Contact = lazy(() => import('../components/sections/Contact').then((mod) => ({ default: mod.Contact })))
const BuildHeatmap = lazy(() => import('../components/sections/BuildHeatmap').then((mod) => ({ default: mod.BuildHeatmap })))
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
      { rootMargin: '-44px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
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
  }, [ids.join('|')])
  return active
}

// Strong ease-out: instant response, soft landing.
const EASE = [0.23, 1, 0.32, 1] as const

const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <m.div
    initial={{ opacity: 0, y: 20, scale: 0.985 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, delay, ease: EASE }}
    className={className}
  >
    {children}
  </m.div>
)

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
  const activeSection = useActiveSection(nav.map(([href]) => href.slice(1)))
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
        {/* Nav — 44px, frosted */}
        <nav
          className={`fixed top-0 inset-x-0 z-40 h-11 ${isDark ? 'bg-black/70' : 'bg-white/70'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}
          aria-label="Main navigation"
        >
          <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between gap-3">
            <LogoSelectorApple isDark={isDark} />
            <div className="hidden md:flex items-center gap-6 text-xs">
              {nav.map(([href, label]) => {
                const on = activeSection === href.slice(1)
                return (
                  <a
                    key={href}
                    href={href}
                    aria-current={on ? 'true' : undefined}
                    className={`relative inline-flex items-center h-11 transition-colors duration-150 ${on ? blue : `${muted} hover:${blue}`}`}
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
            <div className="flex items-center gap-2">
              <LanguageSelectorApple isDark={isDark} />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`press compact-touch w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-[#1d1d1f]'}`}
              >
                {isDark ? Icon.sun : Icon.moon}
              </button>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="press compact-touch hidden sm:inline-flex h-8 items-center rounded-full bg-apple-blue px-3.5 text-xs font-medium text-white hover:bg-apple-blueHover"
              >
                {c.hero.ctaContact}
              </button>
              <MobileMenuApple
                isDark={isDark}
                onContactClick={() => setContactOpen(true)}
                contactLabel={c.hero.ctaContact}
                navItems={nav.map(([href, label]) => ({ href, label }))}
              />
            </div>
          </div>
        </nav>

        <main id="main-content" className="pt-11">
          {/* Hero — typographic */}
          <section id="hero" className="px-4 pt-16 md:pt-24 pb-10 md:pb-14 text-center scroll-mt-20" aria-labelledby="hero-heading">
            <p className={`text-sm font-semibold ${blue}`}>{c.hero.eyebrow}</p>
            {/* The LCP element stays static: an entrance fade would delay the first meaningful paint. */}
            <h1
              id="hero-heading"
              className="mx-auto mt-4 max-w-4xl text-5xl md:text-7xl lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.02]"
            >
              {registry.personal.name}
            </h1>
            <p className={`mx-auto mt-5 max-w-2xl text-xl md:text-2xl ${muted} leading-snug tracking-[-0.01em]`}>{c.hero.positioning}</p>
            {/* Static (no entrance): index.html carries the same hero markup before React mounts. A `trigger="load"` RevealText
                here was tried and reverted -- it starts every word at opacity:0, so the lead line (already painted, readable,
                by the static shell) vanished for ~1-2s on every load before re-animating in word by word, a real flash/regression
                against the exact static-shell duplication this comment is about. */}
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed">{c.hero.lead}</p>
            {/* Static (no entrance): index.html carries the same hero markup before React mounts, so an entrance fade would flash. */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Magnetic>
                <button type="button" onClick={() => openContact()} className={primaryBtn}>
                  {c.hero.ctaPrimary}
                </button>
              </Magnetic>
              <a href="#shopify" className={`${blue} inline-flex items-center gap-1.5 text-sm font-medium`}>
                {c.hero.ctaSecondary} {Icon.down}
              </a>
              <a href={registry.personal.cv} download className={`${muted} text-sm font-medium`}>
                {c.hero.ctaCv} ›
              </a>
            </div>
            <p className={`${muted} mt-4 text-xs`}>{c.hero.ctaNote}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-medium ${tile}`}>
                <span className="w-2 h-2 rounded-full bg-[#34c759]" aria-hidden="true" />
                {c.hero.availability}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 ${tile} ${muted}`}>
                {Icon.globe}
                {c.hero.location}
              </span>
            </div>
          </section>

          {/* Stat band — numerals on hairlines, then the fleet's build activity as a second row */}
          <section className="px-4 pb-14 md:pb-20">
            <div className="max-w-5xl mx-auto">
              <StatBand skin={skin} />
              <Suspense fallback={<Pending h="min-h-[8vh]" />}>
                <BuildHeatmap skin={skin} />
              </Suspense>
            </div>
          </section>

          {/* Now + the fleet ticker */}
          <section className="px-4 pb-14 md:pb-20" aria-label={c.sections.now.label}>
            <div className="max-w-5xl mx-auto">
              <Reveal className={`inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-full px-5 py-2.5 text-sm ${tile}`}>
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
                  </span>
                  {c.sections.now.label}
                </span>
                <span className={muted}>{c.sections.now.live.replace('{n}', String(liveCount))}</span>
                <span className={muted}>{c.sections.now.dev.replace('{n}', String(devCount))}</span>
                <span className={muted}>{c.sections.now.local.replace('{time}', localTime)}</span>
              </Reveal>
            </div>
            <div className="mt-10 rail-wide">
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
            </div>
          </section>

          {/* Experience — split 50/50, with an optional subway-map view of the same roles */}
          <section id="experience" className={`px-4 py-14 md:py-20 scroll-mt-20 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Experience skin={skin} heading={Heading} />
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

          {/* Year by year — a Gantt ribbon (BuildTimeline), not the shared Years.tsx: employer lanes,
              storefront builds stacked by year, products/side projects as dots. content-visibility:auto
              was tried and reverted here — see docs/seo.md "content-visibility" for the measured instability. */}
          <section className="px-4 py-14 md:py-20 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <BuildTimeline skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Process — pinned stepper */}
          <section className={`px-4 py-14 md:py-20 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Process skin={skin} heading={Heading} canvas={surface} />
              </Suspense>
            </div>
          </section>

          {/* Shopify work — the index */}
          <section id="shopify" className="px-4 py-14 md:py-20 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <ShopifyWork skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Fleet map — the same 18 stores, grouped by industry as a dot matrix */}
          <section className={`px-4 py-14 md:py-20 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <FleetMap skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Gallery — media carousel. content-visibility:auto tried and reverted — docs/seo.md. */}
          <section id="gallery" className={`px-4 py-14 md:py-20 scroll-mt-20 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Gallery skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Manifesto — an inverted typographic band between two media-heavy sections, grounded on a very quiet frosted-glass gradient */}
          <Suspense fallback={<Pending h="min-h-[40vh]" />}>
            <Manifesto skin={skin} backdropSrc="/art/apple/frosted-glass.webp" />
          </Suspense>

          {/* Testimonials (absent until a real quote exists) */}
          <Testimonials skin={skin} heading={Heading} />

          {/* Projects — index list. content-visibility:auto tried and reverted — docs/seo.md. */}
          <section id="projects" className="px-4 py-14 md:py-20 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Projects skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Skills — narrative with inline chips. content-visibility:auto tried and reverted — docs/seo.md. */}
          <section id="skills" className={`px-4 py-14 md:py-20 scroll-mt-20 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Skills skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Stack by year — the same tools, ranked as a bump chart */}
          <section className="px-4 py-14 md:py-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <StackByYear skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* FAQ — the objections, answered before the ask */}
          <section className="px-4 py-14 md:py-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending h="min-h-[40vh]" />}>
                <Faq skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Contact — typographic close, a mesh gradient at 30% opacity so the last section isn't flat */}
          <section id="contact" className={`relative overflow-hidden px-4 py-24 md:py-32 scroll-mt-20 ${surface}`}>
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
            <div className="relative max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Contact skin={skin} ctaClass={`${primaryBtn} px-7`} onContact={openContact} />
              </Suspense>
            </div>
          </section>

          {/* Explore */}
          <section id="explore" className="px-4 py-20 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
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
        <footer className={`px-4 pb-10 pt-4 text-xs ${muted}`} role="contentinfo" aria-label="Site footer">
          <div className={`max-w-5xl mx-auto flex flex-col gap-3 border-t pt-8 md:flex-row md:items-baseline md:justify-between ${skin.line}`}>
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
          onClick={() => setContactOpen(true)}
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
