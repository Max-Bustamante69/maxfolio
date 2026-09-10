import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { m, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { useLanguage, supportedLocales } from '../context/LanguageContext'
import '../styles/neo.css'
// Direct imports (not the component barrels) so the main chunk carries only what this route needs.
import { SEOHead, TransitionLink, ThemeToggle, Magnetic, RevealText, Ticker, ScrollObject } from '../components/common'
import { ContactFormModal } from '../components/modals'
import { StatBand } from '../components/sections/StatBand'
import { Experience } from '../components/sections/Experience'
import { skins } from '../components/gallery/skins'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { otherDesigns, MENU } from '../data/designs'

// Below the fold, each section arrives as its own chunk.
const Years = lazy(() => import('../components/sections/Years').then((mod) => ({ default: mod.Years })))
const Process = lazy(() => import('../components/sections/Process').then((mod) => ({ default: mod.Process })))
const ShopifyWork = lazy(() => import('../components/sections/ShopifyWork').then((mod) => ({ default: mod.ShopifyWork })))
const Gallery = lazy(() => import('../components/sections/Gallery').then((mod) => ({ default: mod.Gallery })))
const Manifesto = lazy(() => import('../components/sections/Manifesto').then((mod) => ({ default: mod.Manifesto })))
const Projects = lazy(() => import('../components/sections/Projects').then((mod) => ({ default: mod.Projects })))
const Skills = lazy(() => import('../components/sections/Skills').then((mod) => ({ default: mod.Skills })))
const Faq = lazy(() => import('../components/sections/Faq').then((mod) => ({ default: mod.Faq })))
const Contact = lazy(() => import('../components/sections/Contact').then((mod) => ({ default: mod.Contact })))

/** Keeps the page height stable while a section's chunk loads. Capped at 40vh: on a slow connection
 * every one of these chunks starts downloading at mount (they aren't gated behind an
 * IntersectionObserver), so a scrolling visitor can land on one before it resolves — 60vh read as a
 * dead end mid-scroll (QA v2, 2026-09-09). 40vh still holds layout for the tallest sections without
 * manufacturing that much blank space for the short ones. */
const Pending = ({ h = 'min-h-[40vh]' }: { h?: string }) => <div className={h} aria-hidden="true" />

const EASE = [0.23, 1, 0.32, 1] as const

const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, delay, ease: EASE }}
    className={className}
  >
    {children}
  </m.div>
)

/** Odometer-style vertical digit-roll for the hero readout tiles (Soft UI only — the shared StatBand
 * keeps its flat count-up). Each digit is a 10-row column that spins once into place when the tile
 * scrolls into view; a non-numeric suffix ("+") stays static. Screen readers get the plain value. */
const OdometerValue = ({ value }: { value: string }) => {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const match = value.match(/^(\d+)(.*)$/)
  if (!match) return <span>{value}</span>
  const [, digitsStr, suffix] = match
  if (reduced) return <span>{value}</span>
  return (
    <span ref={ref} className="inline-flex items-baseline tabular-nums">
      <span aria-hidden="true" className="inline-flex">
        {digitsStr.split('').map((d, i) => (
          <span key={i} className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-baseline">
            <m.span
              className="absolute inset-x-0 top-0 flex flex-col"
              initial={{ y: '0%' }}
              animate={inView ? { y: `-${Number(d) * 10}%` } : { y: '0%' }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: EASE }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[1em] text-center leading-[1em]">
                  {n}
                </span>
              ))}
            </m.span>
          </span>
        ))}
        {suffix}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

/** Google Fonts (Manrope) loaded on demand, only while this theme is mounted — no other theme uses it. */
function useNeoFont() {
  useEffect(() => {
    const id = 'neo-font-link'
    if (document.getElementById(id)) return
    const pre1 = document.createElement('link')
    pre1.rel = 'preconnect'
    pre1.href = 'https://fonts.googleapis.com'
    const pre2 = document.createElement('link')
    pre2.rel = 'preconnect'
    pre2.href = 'https://fonts.gstatic.com'
    pre2.crossOrigin = 'anonymous'
    const sheet = document.createElement('link')
    sheet.id = id
    sheet.rel = 'stylesheet'
    sheet.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap'
    document.head.append(pre1, pre2, sheet)
    return () => {
      pre1.remove()
      pre2.remove()
      sheet.remove()
    }
  }, [])
}

const Icon = {
  mail: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

/**
 * Neo — "Soft UI". Every surface is a two-shadow extrusion (raised) or its inverse (inset, the
 * universal "active"/"selected" signal); the one saturated accent breaks the mono palette only on
 * CTAs, active states and chart fills, per the accessibility fix layer in wf4-neumorphism.md §2.5.
 */
function NeoContent() {
  const { isDark } = useTheme()
  const { locale, setLocale } = useLanguage()
  const { t } = useI18n()
  const { strings: c, registry } = useContent()
  const [contactOpen, setContactOpen] = useState(false)
  const [contactPrefill, setContactPrefill] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const openContact = (prefill?: string) => {
    setContactPrefill(prefill ?? '')
    setContactOpen(true)
  }
  useDynamicFavicon('neo')
  useNeoFont()

  const skin = skins.neo(isDark)
  const muted = skin.muted
  const accent = skin.accent
  const nav = [
    ['#hero', t('nav.home')],
    ['#experience', t('nav.experience')],
    ['#shopify', t('nav.shopify')],
    ['#gallery', t('nav.gallery')],
    ['#projects', t('nav.projects')],
    ['#contact', t('nav.contact')],
  ] as const

  const Heading = (eyebrow: string, title: string, accentWord: string, lead?: string) => (
    <Reveal className="mb-10 md:mb-14">
      <p className={`text-xs font-bold tracking-[0.2em] uppercase ${accent} mb-3`}>{eyebrow}</p>
      <h2 className="font-neo text-4xl md:text-6xl font-extrabold tracking-[-0.02em] leading-[1.05]">
        <RevealText text={title} /> <RevealText text={accentWord} className={muted} delay={0.1} />
      </h2>
      {lead && <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed`}>{lead}</p>}
    </Reveal>
  )

  const primaryBtn = 'neo-btn neo-btn-accent text-sm'
  const liveCount = registry.stores.filter((s) => s.status === 'live').length
  const devCount = registry.stores.filter((s) => s.status === 'dev').length

  // Restraint pass: StatBand's numerals keep the odometer-style count-up (the theme's signature) but
  // now sit on the shared component's own plain hairline grid instead of an inset tile per number —
  // "flat-frame it" rather than dropping the readout itself. §2.8.2's inset frame survives only on
  // the hero's small readout tiles below (the "few hero tiles" the raised/inset treatment keeps).
  // §2.8.12 — the manifesto band always runs the dark palette variant, regardless of the page toggle.
  const manifestoBand = 'bg-neo-dark text-neo-darkInk'
  const manifestoEyebrow = 'text-neo-darkAccent'
  // Restraint pass — a flat, hairline-bordered field (form fields aren't in the surviving-effect
  // list: CTAs, readout tiles, the theme/language switch, the case-study sheet's nav buttons).
  const contactField = isDark
    ? 'border-white/15 bg-neo-dark text-neo-darkInk placeholder:text-neo-darkInkMuted focus:border-neo-darkAccent'
    : 'border-black/[0.12] bg-neo-surfaceRaised text-neo-ink placeholder:text-neo-inkMuted focus:border-neo-accent'

  return (
    <>
      <SEOHead
        title={`${c.meta.title} — ${t('menuPage.designNames.neo')}`}
        description={c.meta.description}
        canonical="https://www.maxfolio.dev/neo"
      />
      {/* `theme-neo` wrapper (display:contents so it never affects layout/fixed-positioning) — the modal's
          neo-* classes read --neo-* custom properties that only exist under .theme-neo, and this modal
          renders as a sibling of the main .theme-neo container below, not a descendant of it. */}
      <div className="theme-neo contents" data-theme={isDark ? 'dark' : undefined}>
        <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="neo" isDark={isDark} initialMessage={contactPrefill} />
      </div>

      <div className="theme-neo min-h-screen font-neo transition-colors duration-300 [overflow-x:clip]" data-theme={isDark ? 'dark' : undefined} role="document">
        {/* Nav — restraint pass: a flat hairline bar (the extrusion stays reserved for controls) */}
        <nav className="fixed top-0 inset-x-0 z-40 px-3 pt-3" aria-label="Main navigation">
          <div
            className={`border backdrop-blur-md !rounded-[20px] max-w-5xl mx-auto h-14 px-4 flex items-center justify-between gap-3 ${isDark ? 'bg-neo-dark/85 border-white/10' : 'bg-neo-surfaceRaised/85 border-black/[0.08]'}`}
          >
            <TransitionLink to="/neo" transitionColor="#e6e9ef" transitionAccent="#4453d9" transitionLabel="Neo" className="flex items-center gap-2.5 shrink-0">
              <span className={`h-2.5 w-2.5 rounded-full ${skin.accentBg}`} aria-hidden="true" />
              <span className="text-sm font-extrabold tracking-tight hidden sm:inline">Maxfolio</span>
            </TransitionLink>
            <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {nav.map(([href, label]) => (
                <a key={href} href={href} className={`inline-flex items-center h-8 px-3 rounded-full ${muted} hover:${accent} transition-colors duration-150`}>
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:inline-flex items-center gap-1" role="radiogroup" aria-label={t('language.selector.ariaLabel')}>
                {supportedLocales.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={opt === locale}
                    onClick={() => setLocale(opt)}
                    className={`${opt === locale ? 'neo-chip-on' : 'neo-chip'} !text-[10px]`}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
              <ThemeToggle variant="neo" size="sm" />
              <button type="button" onClick={() => setContactOpen(true)} className="neo-btn neo-btn-accent hidden sm:inline-flex !py-2 !px-4 text-xs">
                {c.hero.ctaContact}
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={`border !rounded-full md:hidden flex h-9 w-9 items-center justify-center transition-colors ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/[0.08] hover:bg-black/[0.03]'}`}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                {Icon.menu}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile sheet */}
        <AnimatePresence>
          {mobileOpen && (
            <m.div
              key="sheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] theme-neo"
              data-theme={isDark ? 'dark' : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <m.div
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="h-full flex flex-col px-6 pt-6 pb-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between h-11">
                  <span className="text-sm font-bold">{t('mobileMenu.menu')}</span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className={`border !rounded-full flex h-9 w-9 items-center justify-center transition-colors ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/[0.08] hover:bg-black/[0.03]'}`}
                    aria-label="Close menu"
                  >
                    {Icon.close}
                  </button>
                </div>
                <nav className="mt-8 flex-1">
                  {nav.map(([href, label], i) => (
                    <m.a
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i }}
                      className="block py-3 text-3xl font-extrabold tracking-[-0.02em]"
                    >
                      {label}
                    </m.a>
                  ))}
                </nav>
                <button type="button" onClick={() => { setMobileOpen(false); setContactOpen(true) }} className="neo-btn neo-btn-accent w-full">
                  {c.hero.ctaContact}
                </button>
                <div className="mt-6">
                  <p className={`text-[11px] uppercase tracking-[0.2em] ${muted} mb-3`}>{t('logoSelector.otherExperiences')}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    {otherDesigns('neo').map((d) => (
                      <TransitionLink key={d.id} to={d.href} transitionColor={d.transitionColor} transitionAccent={d.transitionAccent} transitionLabel={t(d.nameKey)} className={accent}>
                        {t(d.nameKey)} ›
                      </TransitionLink>
                    ))}
                    <TransitionLink to={MENU.route} transitionColor="#171717" transitionAccent="#ffffff" transitionLabel={t(MENU.labelKey)} className={accent}>
                      {t(MENU.subtitleKey)} ›
                    </TransitionLink>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        <main id="main-content" className="pt-24">
          {/* Hero — §2.8.1: flat headline, one xl raised panel aside, accent-fill CTA */}
          <section id="hero" data-scroll-object-track className="px-4 pb-16 md:pb-24 scroll-mt-24" aria-labelledby="hero-heading">
            <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
              <div className="lg:col-span-7">
                <p className={`text-sm font-bold ${accent}`}>{c.hero.eyebrow}</p>
                <h1 id="hero-heading" className="mt-4 text-5xl md:text-7xl font-extrabold tracking-[-0.02em] leading-[1.02]">
                  {registry.personal.name}
                </h1>
                <p className={`mt-5 max-w-xl text-xl md:text-2xl ${muted} leading-snug`}>{c.hero.positioning}</p>
                <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed">{c.hero.lead}</p>
                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Magnetic>
                    <button type="button" onClick={() => openContact()} className={primaryBtn}>
                      {Icon.mail} {c.hero.ctaPrimary}
                    </button>
                  </Magnetic>
                  <a
                    href="#shopify"
                    className={`border inline-flex items-center gap-1.5 !rounded-full px-5 py-3 text-sm font-semibold transition-colors ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/[0.08] hover:bg-black/[0.03]'}`}
                  >
                    {c.hero.ctaSecondary} {Icon.down}
                  </a>
                  <a href={registry.personal.cv} download className={`${muted} text-sm font-semibold`}>
                    {c.hero.ctaCv} ›
                  </a>
                </div>
                <p className={`${muted} mt-4 text-xs`}>{c.hero.ctaNote}</p>
              </div>

              {/* the one ambient "breathing" panel per page (§2.7 / Idea 21) — blobs art inset behind it */}
              <div className="lg:col-span-5">
                <Reveal delay={0.15} className="neo-raised neo-xl neo-breathe relative overflow-hidden !rounded-[36px] p-8 md:p-10">
                  <img
                    src="/art/softui/blobs.webp"
                    alt=""
                    aria-hidden="true"
                    width={1400}
                    height={933}
                    loading="eager"
                    decoding="async"
                    className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${isDark ? "opacity-[0.07]" : "opacity-[0.14]"}`}
                  />
                  {/* Matte pale blob, desktop+motion-ok+in-view only — idles and drifts with scroll behind the readout tiles. */}
                  <ScrollObject variant="softui" className="opacity-70" />
                  <div className="relative">
                    <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${muted}`}>{c.sections.now.label}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                        <span className="neo-pulse absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-70 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#34c759]" />
                      </span>
                      <span className="text-sm font-semibold">{c.hero.availability}</span>
                    </div>
                    <div className={`mt-4 flex items-center gap-2 text-sm ${muted}`}>
                      {Icon.globe}
                      {c.hero.location}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {registry.stats.slice(0, 4).map((st) => (
                        <div key={st.id} className="neo-inset neo-sm neo-interactive !rounded-2xl px-3 py-3">
                          <p className={`text-2xl font-extrabold ${accent}`}>
                            <OdometerValue value={st.value} />
                          </p>
                          <p className={`text-[11px] ${muted} mt-0.5 leading-snug`}>{c.stats[st.id]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Stat band — the shared plain hairline grid; the odometer digit-roll stays only in the hero tiles above */}
          <section className="px-4 pb-16 md:pb-24">
            <div className="max-w-5xl mx-auto">
              <StatBand skin={skin} />
            </div>
          </section>

          {/* Now + fleet ticker — §2.8.3: inset indicator-light pill, raised marquee chips */}
          <section className="px-4 pb-16 md:pb-24" aria-label={c.sections.now.label}>
            <div className="max-w-5xl mx-auto">
              <Reveal
                className={`border inline-flex flex-wrap items-center gap-x-5 gap-y-2 !rounded-full px-5 py-3 text-sm ${isDark ? 'border-white/10' : 'border-black/[0.08]'}`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="neo-pulse absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-70 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
                  </span>
                  {c.sections.now.label}
                </span>
                <span className={muted}>{c.sections.now.live.replace('{n}', String(liveCount))}</span>
                <span className={muted}>{c.sections.now.dev.replace('{n}', String(devCount))}</span>
              </Reveal>
            </div>
            <div className="mt-10">
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
                    <span className={`font-neo text-lg font-semibold tracking-[-0.01em] ${isDark ? 'text-neo-darkInk' : 'text-neo-ink'}`}>{s.name}</span>
                    {c.stores[s.slug]?.industry && <span className={`text-sm ${isDark ? 'text-neo-darkInkMuted' : 'text-neo-inkMuted'}`}>{c.stores[s.slug].industry}</span>}
                  </>
                )}
              />
            </div>
          </section>

          {/* Experience — restraint pass: a flat tint band (ground color, not a shadowed card) reads
              as its own surface; the rail's active tab already reads as pressed via the accent underline */}
          <section id="experience" className={`px-4 py-14 md:py-20 scroll-mt-24 ${isDark ? 'bg-neo-darkSurfaceRaised' : 'bg-neo-surfaceRaised'}`}>
            <div className="max-w-5xl mx-auto">
              <Experience skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Years — the unit chart's tiles get the depth treatment: shipped raised, empty slots inset */}
          <section className="px-4 py-14 md:py-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Years skin={skin} heading={Heading} depth />
              </Suspense>
            </div>
          </section>

          {/* Process — restraint pass: a flat tint band, like Experience above; the numbered badges
              already read as pressed via the accent-filled groove, no card needed around them */}
          <section className={`px-4 py-14 md:py-20 ${isDark ? 'bg-neo-darkSurfaceRaised' : 'bg-neo-surfaceRaised'}`}>
            <div className="max-w-5xl mx-auto">
              <Process skin={skin} heading={Heading} canvas={isDark ? 'bg-neo-darkSurfaceRaised' : 'bg-neo-surfaceRaised'} />
            </div>
          </section>

          {/* Shopify work — restraint pass: plain page ground, no card shell around the index */}
          <section id="shopify" className="px-4 py-14 md:py-20 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <ShopifyWork skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Gallery — §2.8.9: the wall floats inside one extruded shell around the real device frames */}
          {/* Gallery band — the pebbles art as a soft textured ground, tinted back to the page surface for contrast */}
          <section id="gallery" className="relative overflow-hidden px-4 py-14 md:py-20 scroll-mt-24">
            <img
              src="/art/softui/pebbles.webp"
              alt=""
              aria-hidden="true"
              width={1400}
              height={933}
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.28]"
            />
            <div className="absolute inset-0" style={{ background: 'var(--neo-surface)', opacity: 0.55 }} aria-hidden="true" />
            <div className="relative max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Gallery skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Manifesto — §2.8.10: always the dark palette variant, regardless of the page toggle */}
          <Suspense fallback={<Pending h="min-h-[40vh]" />}>
            <Manifesto skin={skin} bandClassName={manifestoBand} eyebrowClassName={manifestoEyebrow} backdropSrc="/art/softui/clay-spheres.webp" />
          </Suspense>

          {/* Projects — index list */}
          <section id="projects" className="px-4 py-14 md:py-20 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Projects skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Skills — tool tiles read their raised/inset state off the shared .neo-raised primitive */}
          <section className="px-4 py-14 md:py-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Skills skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* FAQ — restraint pass: plain page ground, the rows are already a hairline accordion */}
          <section id="faq" className="px-4 py-14 md:py-20">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending h="min-h-[40vh]" />}>
                <Faq skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Contact — §2.8.12: recessed field, the boldest accent-fill CTA on the page; a whisper of the rounded-grid ground beneath it */}
          <section id="contact" className="relative overflow-hidden px-4 py-14 md:py-20 scroll-mt-24">
            <img
              src="/art/softui/rounded-grid.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${isDark ? "opacity-[0.05]" : "opacity-[0.08]"}`}
            />
            <div className="relative max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Contact skin={skin} ctaClass={`${primaryBtn} !px-7`} onContact={openContact} fieldClassName={contactField} />
              </Suspense>
            </div>
          </section>

          {/* Explore */}
          <section className="px-4 py-14 md:py-20 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
              <div className="grid sm:grid-cols-3 gap-3">
                {otherDesigns('neo').map((d) => (
                  <TransitionLink
                    key={d.id}
                    to={d.href}
                    transitionColor={d.transitionColor}
                    transitionAccent={d.transitionAccent}
                    transitionLabel={t(d.nameKey)}
                    className={`border neo-interactive block !rounded-[22px] overflow-hidden ${isDark ? 'border-white/10' : 'border-black/[0.08]'}`}
                  >
                    <div className="h-28 overflow-hidden">
                      <d.Preview size="md" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm">{t(d.nameKey)}</p>
                      <p className={`${muted} text-xs`}>{t(d.subtitleKey)}</p>
                    </div>
                  </TransitionLink>
                ))}
                <TransitionLink
                  to={MENU.route}
                  transitionColor="#171717"
                  transitionAccent="#ffffff"
                  transitionLabel={t(MENU.labelKey)}
                  className={`border neo-interactive block !rounded-[22px] overflow-hidden ${isDark ? 'border-white/10' : 'border-black/[0.08]'}`}
                >
                  <div className="h-28 overflow-hidden bg-black/80 flex items-center justify-center text-white text-xs font-semibold">{t(MENU.labelKey)}</div>
                  <div className="p-4">
                    <p className="font-bold text-sm">{t(MENU.labelKey)}</p>
                    <p className={`${muted} text-xs`}>{t(MENU.subtitleKey)}</p>
                  </div>
                </TransitionLink>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-4 pb-10 pt-4 text-xs" role="contentinfo" aria-label="Site footer">
          <div className={`max-w-5xl mx-auto flex flex-col gap-3 border-t pt-8 md:flex-row md:items-baseline md:justify-between ${skin.line}`}>
            <p className={muted}>
              © 2026 {registry.personal.name}. {c.footer.rights}
            </p>
            <p className={`${muted} md:text-center`}>{c.footer.stamp}</p>
            <a href="#hero" className={`${accent} inline-flex items-center gap-1 font-semibold`}>
              {c.footer.backToTop} ↑
            </a>
          </div>
        </footer>

        {/* Mobile contact FAB */}
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          aria-label="Open contact form"
          className="neo-btn neo-btn-accent fixed bottom-6 right-6 md:hidden w-14 h-14 !rounded-full z-30 flex items-center justify-center"
        >
          {Icon.mail}
        </button>
      </div>
    </>
  )
}

export default function Neo() {
  return (
    <ThemeProvider storageKey="neo-theme" defaultTheme="light">
      <NeoContent />
    </ThemeProvider>
  )
}
