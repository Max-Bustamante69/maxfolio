import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { useLanguage, supportedLocales } from '../context/LanguageContext'
import '../styles/neo.css'
// Direct imports (not the component barrels) so the main chunk carries only what this route needs.
import { SEOHead, TransitionLink, ThemeToggle, Magnetic, RevealText, Marquee } from '../components/common'
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

const Pending = ({ h = 'min-h-[60vh]' }: { h?: string }) => <div className={h} aria-hidden="true" />

const EASE = [0.23, 1, 0.32, 1] as const

const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: EASE }}
    className={className}
  >
    {children}
  </m.div>
)

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

  // §2.8.2 — each numeral in an inset "readout" tile, lit by the accent.
  const statTile = 'neo-inset neo-sm !rounded-2xl mx-1.5 my-1 px-4'
  // §2.8.12 — the manifesto band always runs the dark palette variant, regardless of the page toggle.
  const manifestoBand = 'bg-neo-dark text-neo-darkInk'
  const manifestoEyebrow = 'text-neo-darkAccent'
  // §2.8.9 (simplified) — a Neo groove behind the usage ledger's fill bars.
  const skillsTrack = 'neo-inset neo-sm'
  // §2.8.12 — recessed form field, the shadow IS the border.
  const contactField = 'neo-field neo-md !rounded-full border-transparent focus:outline-none'

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
        {/* Nav — a raised bar, the mark a small extruded chip */}
        <nav className="fixed top-0 inset-x-0 z-40 px-3 pt-3" aria-label="Main navigation">
          <div className="neo-raised neo-sm !rounded-[20px] max-w-5xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
            <TransitionLink to="/neo" transitionColor="#e6e9ef" transitionAccent="#4453d9" transitionLabel="Neo" className="flex items-center gap-2.5 shrink-0">
              <span className="neo-raised neo-sm !rounded-[10px] flex h-8 w-8 items-center justify-center">
                <span className={`h-2 w-2 rounded-full ${skin.accentBg}`} aria-hidden="true" />
              </span>
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
                className="neo-raised neo-sm !rounded-full md:hidden flex h-9 w-9 items-center justify-center"
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
                  <button type="button" onClick={() => setMobileOpen(false)} className="neo-raised neo-sm !rounded-full flex h-9 w-9 items-center justify-center" aria-label="Close menu">
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
                      <TransitionLink key={d.id} to={d.route} transitionColor={d.transitionColor} transitionAccent={d.transitionAccent} transitionLabel={t(d.nameKey)} className={accent}>
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
          <section id="hero" className="px-4 pb-16 md:pb-24 scroll-mt-24" aria-labelledby="hero-heading">
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
                  <a href="#shopify" className={`neo-raised neo-sm neo-interactive inline-flex items-center gap-1.5 !rounded-full px-5 py-3 text-sm font-semibold`}>
                    {c.hero.ctaSecondary} {Icon.down}
                  </a>
                </div>
                <p className={`${muted} mt-4 text-xs`}>{c.hero.ctaNote}</p>
              </div>

              {/* the one ambient "breathing" panel per page (§2.7 / Idea 21) */}
              <div className="lg:col-span-5">
                <Reveal delay={0.15} className="neo-raised neo-xl neo-breathe !rounded-[36px] p-8 md:p-10">
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
                      <div key={st.id} className="neo-inset neo-sm !rounded-2xl px-3 py-3">
                        <p className={`text-2xl font-extrabold tabular-nums ${accent}`}>{st.value}</p>
                        <p className={`text-[11px] ${muted} mt-0.5 leading-snug`}>{c.stats[st.id]}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Stat band — §2.8.2: each numeral in an inset readout tile */}
          <section className="px-4 pb-16 md:pb-24">
            <div className="max-w-5xl mx-auto">
              <StatBand skin={skin} tileClassName={statTile} />
            </div>
          </section>

          {/* Now + fleet ticker — §2.8.3: inset indicator-light pill, raised marquee chips */}
          <section className="px-4 pb-16 md:pb-24" aria-label={c.sections.now.label}>
            <div className="max-w-5xl mx-auto">
              <Reveal className="neo-inset neo-sm inline-flex flex-wrap items-center gap-x-5 gap-y-2 !rounded-full px-5 py-3 text-sm">
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
              <Marquee
                items={registry.stores.filter((s) => !s.legacy).map((s) => ({ name: s.name, meta: c.stores[s.slug]?.industry, live: s.status === 'live' }))}
                dark={isDark}
                label={c.sections.now.band}
              />
            </div>
          </section>

          {/* Experience — §2.8.4: the rail's active tab already reads as pressed via the accent underline */}
          <section id="experience" className="px-4 py-16 md:py-24 scroll-mt-24">
            <div className="max-w-5xl mx-auto neo-raised neo-lg !rounded-[28px] p-6 md:p-10">
              <Experience skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Years — the unit-chart already encodes shipped work by accent-fill strength */}
          <section className="px-4 py-16 md:py-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Years skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Process — §2.8.6: the numbered badges already ride an inset groove that fills with accent */}
          <section className="px-4 py-16 md:py-24">
            <div className="max-w-5xl mx-auto neo-inset neo-lg !rounded-[28px] p-6 md:p-10">
              <Process skin={skin} heading={Heading} canvas="neo-canvas" />
            </div>
          </section>

          {/* Shopify work — §2.8.7: the index sits on a raised "screen" panel */}
          <section id="shopify" className="px-4 py-16 md:py-24 scroll-mt-24">
            <div className="max-w-5xl mx-auto neo-raised neo-lg !rounded-[28px] p-6 md:p-10">
              <Suspense fallback={<Pending />}>
                <ShopifyWork skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Gallery — §2.8.9: the wall floats inside one extruded shell around the real device frames */}
          <section id="gallery" className="px-4 py-16 md:py-24 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Gallery skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Manifesto — §2.8.10: always the dark palette variant, regardless of the page toggle */}
          <Suspense fallback={<Pending h="min-h-[40vh]" />}>
            <Manifesto skin={skin} bandClassName={manifestoBand} eyebrowClassName={manifestoEyebrow} />
          </Suspense>

          {/* Projects — index list */}
          <section id="projects" className="px-4 py-16 md:py-24 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Projects skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Skills — §2.8.11: the usage ledger's fill bars ride an inset groove */}
          <section id="skills" className="px-4 py-16 md:py-24 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Skills skin={skin} heading={Heading} trackClassName={skillsTrack} />
              </Suspense>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="px-4 py-16 md:py-24">
            <div className="max-w-5xl mx-auto neo-inset neo-lg !rounded-[28px] p-6 md:p-10">
              <Suspense fallback={<Pending h="min-h-[40vh]" />}>
                <Faq skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Contact — §2.8.12: recessed field, the boldest accent-fill CTA on the page */}
          <section id="contact" className="px-4 py-20 md:py-28 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Contact skin={skin} ctaClass={`${primaryBtn} !px-7`} onContact={openContact} fieldClassName={contactField} />
              </Suspense>
            </div>
          </section>

          {/* Explore */}
          <section className="px-4 py-16 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
              <div className="grid sm:grid-cols-3 gap-3">
                {otherDesigns('neo').map((d) => (
                  <TransitionLink
                    key={d.id}
                    to={d.route}
                    transitionColor={d.transitionColor}
                    transitionAccent={d.transitionAccent}
                    transitionLabel={t(d.nameKey)}
                    className="neo-raised neo-md neo-interactive block !rounded-[22px] overflow-hidden"
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
                <TransitionLink to={MENU.route} transitionColor="#171717" transitionAccent="#ffffff" transitionLabel={t(MENU.labelKey)} className="neo-raised neo-md neo-interactive block !rounded-[22px] overflow-hidden">
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
