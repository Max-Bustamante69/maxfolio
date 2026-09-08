import { useEffect, useState, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import {
  ContactFormModal,
  SEOHead,
  MobileMenuApple,
  LanguageSelectorApple,
  LogoSelectorApple,
  ShopifyWork,
  Gallery,
  Years,
  Process,
  Testimonials,
  StatBand,
  Experience,
  Projects,
  Skills,
  Contact,
  Faq,
  Magnetic,
  TransitionLink,
  MenuPreview,
  SmoothScroll,
  ScrollRail,
  Marquee,
  RevealText,
} from '../components'
import { skins } from '../components/gallery'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { defaultDesign, otherDesigns, MENU } from '../data/designs'

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

// Strong ease-out: instant response, soft landing.
const EASE = [0.23, 1, 0.32, 1] as const

const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <m.div
    initial={{ opacity: 0, y: 20, scale: 0.985 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-60px' }}
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
      <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${blue} mb-3`}>{eyebrow}</p>
      <h2 className="font-sf text-4xl md:text-6xl font-semibold tracking-[-0.025em] leading-[1.05]">
        <RevealText text={title} /> <RevealText text={accent} className={muted} delay={0.1} />
      </h2>
      {lead && <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed`}>{lead}</p>}
    </Reveal>
  )

  const primaryBtn = 'press inline-flex items-center justify-center rounded-full bg-apple-blue px-6 py-3 text-sm font-medium text-white hover:bg-apple-blueHover'
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
              {nav.map(([href, label]) => (
                <a key={href} href={href} className={`inline-flex items-center h-11 ${muted} hover:${blue} transition-colors duration-150`}>
                  {label}
                </a>
              ))}
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
          <section id="hero" className="px-4 pt-20 md:pt-28 pb-14 md:pb-20 text-center scroll-mt-20" aria-labelledby="hero-heading">
            <p className={`text-sm font-semibold ${blue}`}>{c.hero.eyebrow}</p>
            {/* The LCP element stays static: an entrance fade would delay the first meaningful paint. */}
            <h1
              id="hero-heading"
              className="mx-auto mt-4 max-w-4xl text-5xl md:text-7xl lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.02]"
            >
              {registry.personal.name}
            </h1>
            <p className={`mx-auto mt-5 max-w-2xl text-xl md:text-2xl ${muted} leading-snug tracking-[-0.01em]`}>{c.hero.positioning}</p>
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed">{c.hero.lead}</p>
            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            >
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
            </m.div>
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className={`${muted} mt-4 text-xs`}>
              {c.hero.ctaNote}
            </m.p>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs"
            >
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-medium ${tile}`}>
                <span className="w-2 h-2 rounded-full bg-[#34c759]" aria-hidden="true" />
                {c.hero.availability}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 ${tile} ${muted}`}>
                {Icon.globe}
                {c.hero.location}
              </span>
            </m.div>
          </section>

          {/* Stat band — numerals on hairlines */}
          <section className="px-4 pb-20 md:pb-28">
            <div className="max-w-5xl mx-auto">
              <StatBand skin={skin} />
            </div>
          </section>

          {/* Now + the fleet ticker */}
          <section className="px-4 pb-20 md:pb-28" aria-label={c.sections.now.label}>
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
            <div className="mt-10">
              <Marquee
                items={registry.stores.filter((s) => !s.legacy).map((s) => ({ name: s.name, meta: c.stores[s.slug]?.industry, live: s.status === 'live' }))}
                dark={isDark}
                label={c.sections.now.band}
              />
            </div>
          </section>

          {/* Experience — split 50/50 */}
          <section className={`px-4 py-20 md:py-28 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Experience skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Year by year — editorial timeline */}
          <section className="px-4 py-20 md:py-28">
            <div className="max-w-5xl mx-auto">
              <Years skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Process — pinned stepper */}
          <section className={`px-4 py-20 md:py-28 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Process skin={skin} heading={Heading} canvas={surface} />
            </div>
          </section>

          {/* Shopify work — the index */}
          <section className="px-4 py-20 md:py-28">
            <div className="max-w-5xl mx-auto">
              <ShopifyWork skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Gallery — media carousel */}
          <section className={`px-4 py-20 md:py-28 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Gallery skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Testimonials (absent until a real quote exists) */}
          <Testimonials skin={skin} heading={Heading} />

          {/* Projects — index list */}
          <section className="px-4 py-20 md:py-28">
            <div className="max-w-5xl mx-auto">
              <Projects skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Skills — narrative with inline chips */}
          <section className={`px-4 py-20 md:py-28 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Skills skin={skin} heading={Heading} />
            </div>
          </section>

          {/* FAQ — the objections, answered before the ask */}
          <section className="px-4 py-20 md:py-28">
            <div className="max-w-5xl mx-auto">
              <Faq skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Contact — typographic close */}
          <section className={`px-4 py-24 md:py-32 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Contact skin={skin} ctaClass={`${primaryBtn} px-7`} onContact={openContact} />
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
                    to={d.route}
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

        <footer className={`px-4 py-10 text-xs ${muted}`} role="contentinfo" aria-label="Site footer">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-3">
            <p>
              © 2026 {registry.personal.name}. {c.footer.rights}
            </p>
            <p>{c.footer.tagline}</p>
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
