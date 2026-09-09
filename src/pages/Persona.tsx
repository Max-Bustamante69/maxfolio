import { lazy, Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { SEOHead, TransitionLink, Magnetic, Marquee, RevealText, SmoothScroll, useLenis } from '../components/common'
import { ContactFormModal } from '../components/modals'
import { MenuPreview } from '../components/previews'
import { StatBand } from '../components/sections/StatBand'
import { Experience } from '../components/sections/Experience'
import { skins } from '../components/gallery/skins'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { designById, otherDesigns, MENU } from '../data/designs'
import '../styles/persona.css'

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

// Snap-in-with-overshoot: a visible spring, not an ease curve (wf4-persona.md idea #15).
const SNAP = { type: 'spring' as const, stiffness: 420, damping: 24 }
const EASE = [0.23, 1, 0.32, 1] as const

/** Panels slam in from off-axis and overshoot slightly before settling, staggered per child. */
const SnapIn = ({ children, delay = 0, x = 0, y = 24, className = '' }: { children: ReactNode; delay?: number; x?: number; y?: number; className?: string }) => {
  const reduced = useReducedMotion()
  return (
    <m.div
      initial={reduced ? false : { opacity: 0, x, y, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...SNAP, delay }}
      className={className}
    >
      {children}
    </m.div>
  )
}

/** Hero-only headline pop: each letter jitters in with a small random rotation before settling flush. */
const LetterJitter = ({ text, className = '' }: { text: string; className?: string }) => {
  const reduced = useReducedMotion()
  const seedRef = useRef(text.split('').map(() => (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 4)))
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <m.span
          key={`${ch}-${i}`}
          aria-hidden="true"
          className="inline-block"
          initial={reduced ? false : { opacity: 0, y: 14, rotate: seedRef.current[i] }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.025, ease: EASE }}
        >
          {ch === ' ' ? ' ' : ch}
        </m.span>
      ))}
    </span>
  )
}

/** "Crash" tap primitive + "Breakout" shard burst on click, for the primary CTA. */
const CrashButton = ({ onClick, className = '', children }: { onClick: () => void; className?: string; children: ReactNode }) => {
  const [burst, setBurst] = useState(0)
  const reduced = useReducedMotion()
  const shards = [0, 1, 2, 3, 4, 5]
  return (
    <span className="relative inline-flex">
      <m.button
        type="button"
        onClick={() => {
          setBurst((n) => n + 1)
          onClick()
        }}
        whileTap={reduced ? undefined : { scale: 1.06 }}
        transition={SNAP}
        className={className}
      >
        {children}
      </m.button>
      {!reduced && (
        <AnimatePresence>
          {burst > 0 &&
            shards.map((i) => (
              <m.span
                key={`${burst}-${i}`}
                className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 bg-current"
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{ opacity: 0, x: Math.cos((i / shards.length) * Math.PI * 2) * 46, y: Math.sin((i / shards.length) * Math.PI * 2) * 46 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            ))}
        </AnimatePresence>
      )}
    </span>
  )
}

const Icon = {
  mail: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
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
  down12: (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

/** Writes the page's own scroll offset to `--p-scroll-y` (Lenis when running, window scroll otherwise) — one listener for the whole parallax system. Off under reduced motion. */
function useScrollVar(rootRef: RefObject<HTMLElement | null>) {
  const lenis = useLenis()
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    const el = rootRef.current
    if (!el) return
    const setVar = (y: number) => el.style.setProperty('--p-scroll-y', String(y))
    if (lenis) return lenis.on('scroll', (l) => setVar(l.scroll))
    const onWinScroll = () => setVar(window.scrollY)
    window.addEventListener('scroll', onWinScroll, { passive: true })
    onWinScroll()
    return () => window.removeEventListener('scroll', onWinScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis, reduced])
}

function PersonaContent() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useI18n()
  const { strings: c, registry } = useContent()
  const [contactOpen, setContactOpen] = useState(false)
  const [contactPrefill, setContactPrefill] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useDynamicFavicon('persona')
  useScrollVar(rootRef)

  const skin = skins.persona(isDark)
  const self = designById('persona')

  // Ice (light, default) vs Ink (dark) — two-key-color law: ink/paper neutrals plus one hero accent.
  const bg = isDark ? 'bg-[#111013] text-[#f5f2ee]' : 'bg-[#eef3f7] text-[#0a0f1a]'
  const surface = isDark ? 'bg-[#18161a]' : 'bg-white'
  const muted = skin.muted
  const accentCls = skin.accent
  const accentBg = skin.accentBg
  const line = skin.line

  const openContact = (prefill?: string) => {
    setContactPrefill(prefill ?? '')
    setContactOpen(true)
  }

  const nav = [
    ['#hero', t('nav.home')],
    ['#experience', t('nav.experience')],
    ['#shopify', t('nav.shopify')],
    ['#gallery', t('nav.gallery')],
    ['#skills', t('nav.skills')],
    ['#contact', t('nav.contact')],
  ] as const

  const Heading = (eyebrow: string, title: string, accent: string, lead?: string) => (
    <SnapIn className="mb-10 md:mb-14">
      <p className={`font-persona-label text-xs font-semibold uppercase tracking-[0.35em] ${accentCls} mb-3 before:content-['—'] before:mr-2`}>{eyebrow}</p>
      <h2 className="font-persona-display text-4xl md:text-6xl uppercase leading-[0.95]" style={{ fontStyle: 'oblique 6deg' }}>
        <RevealText text={title} /> <RevealText text={accent} className={muted} delay={0.1} />
      </h2>
      {lead && <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed font-sf`}>{lead}</p>}
    </SnapIn>
  )

  const primaryBtn = `persona-skew-btn inline-flex items-center justify-center ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} px-7 py-3.5 text-sm font-persona-label font-semibold uppercase tracking-[0.15em]`
  const secondaryLink = `${accentCls} inline-flex items-center gap-1.5 text-sm font-persona-label font-semibold uppercase tracking-[0.1em]`
  // Both branches are written out in full (not `hover:${accentCls}`) so Tailwind's static scanner can see the class.
  const navLink = `inline-flex items-center h-10 font-persona-label text-xs font-semibold uppercase tracking-[0.15em] ${muted} transition-transform duration-150 hover:-skew-x-6 ${isDark ? 'hover:text-[#e8465f]' : 'hover:text-[#1c6fb0]'}`

  const liveCount = registry.stores.filter((s) => s.status === 'live').length
  const devCount = registry.stores.filter((s) => s.status === 'dev').length

  const mobileSheet = (
    <AnimatePresence>
      {mobileOpen && (
        <m.div
          key="sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          className={`fixed inset-0 z-[9999] ${isDark ? 'bg-[#111013]/95' : 'bg-[#eef3f7]/95'} backdrop-blur-xl`}
          onClick={() => setMobileOpen(false)}
        >
          <m.div
            initial={{ x: '8%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '4%', opacity: 0, transition: { duration: 0.15 } }}
            transition={SNAP}
            className="h-full flex flex-col px-6 pt-4 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-11">
              <span className="font-persona-label text-sm font-semibold uppercase tracking-[0.2em]">{t('mobileMenu.menu')}</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center" aria-label="Close menu">
                {Icon.close}
              </button>
            </div>
            <nav className="mt-8 flex-1">
              {nav.map(([href, label], i) => (
                <m.a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}
                  className="block py-3 font-persona-display text-3xl uppercase"
                  style={{ fontStyle: 'oblique 6deg' }}
                >
                  {label}
                </m.a>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                setContactOpen(true)
              }}
              className={`persona-skew-btn w-full ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} py-3.5 text-sm font-persona-label font-semibold uppercase tracking-[0.15em]`}
            >
              {c.hero.ctaContact}
            </button>
            <div className="mt-6">
              <p className={`text-[11px] font-persona-label uppercase tracking-[0.2em] ${muted} mb-3`}>{t('logoSelector.otherExperiences')}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {otherDesigns('persona').map((d) => (
                  <TransitionLink key={d.id} to={d.route} transitionColor={d.transitionColor} transitionAccent={d.transitionAccent} transitionLabel={t(d.nameKey)} className={accentCls}>
                    {t(d.nameKey)} ›
                  </TransitionLink>
                ))}
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <SEOHead title={`${c.meta.title} — ${t(self.nameKey)}`} description={c.meta.description} canonical="https://www.maxfolio.dev/arcade" />
      <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="persona" isDark={isDark} initialMessage={contactPrefill} />

      <div ref={rootRef} className={`theme-persona min-h-screen font-sf ${bg} transition-colors duration-300 [overflow-x:clip]`} role="document">
        {/* Nav */}
        <nav className={`fixed top-0 inset-x-0 z-40 h-14 ${isDark ? 'bg-[#111013]/90' : 'bg-[#eef3f7]/90'} backdrop-blur-xl border-b ${line}`} aria-label="Main navigation">
          <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-3">
            <TransitionLink to="/arcade" transitionColor={self.transitionColor} transitionAccent={self.transitionAccent} transitionLabel={t(self.nameKey)} className="inline-flex items-center gap-2">
              <span className={`persona-skew-btn w-8 h-8 flex items-center justify-center ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} font-persona-label text-[11px] font-bold`}>MB</span>
              <span className="font-persona-label text-sm font-semibold uppercase tracking-[0.2em]">Maxfolio</span>
            </TransitionLink>
            <div className="hidden md:flex items-center gap-7">
              {nav.map(([href, label]) => (
                <a key={href} href={href} className={navLink}>
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className={`hidden sm:inline-flex h-9 items-center persona-skew-btn ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} px-4 text-xs font-persona-label font-semibold uppercase tracking-[0.15em]`}
              >
                {c.hero.ctaContact}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`w-8 h-8 flex items-center justify-center ${muted}`}
              >
                {isDark ? Icon.sun : Icon.moon}
              </button>
              <button type="button" onClick={() => setMobileOpen(true)} className="md:hidden w-8 h-8 flex items-center justify-center" aria-label="Open menu">
                {Icon.menu}
              </button>
            </div>
          </div>
        </nav>
        {typeof document !== 'undefined' && createPortal(mobileSheet, document.body)}

        <main id="main-content" className="pt-14">
          {/* Hero — "menu screen": ghost wordmark, ring motif, eyebrow dash, stacked headline, CTA pair */}
          {/* pb-28 on mobile keeps the availability pills clear of the fixed mobile contact FAB. */}
          <section id="hero" className="relative min-h-[92vh] flex items-center px-4 pt-16 pb-28 md:pt-20 md:pb-16 overflow-hidden scroll-mt-14" aria-labelledby="hero-heading">
            <div aria-hidden="true" className="persona-ghost-wordmark" data-parallax="back">
              MB
            </div>
            <svg className="persona-ring absolute w-[70vw] max-w-[620px] aspect-square opacity-25 pointer-events-none" style={{ left: '50%', top: '48%', transform: 'translate(-50%,-50%)' }} viewBox="0 0 200 200" aria-hidden="true" data-parallax="back">
              <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" className={accentCls} strokeWidth="0.6" strokeDasharray="2 5" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" className={muted} strokeWidth="0.4" />
            </svg>
            <div aria-hidden="true" className={`persona-halftone ${accentCls}`} />

            <div className="max-w-6xl mx-auto w-full relative z-10">
              <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className={`font-persona-label text-sm font-semibold uppercase tracking-[0.35em] ${accentCls} before:content-['—'] before:mr-2`}>
                {c.hero.eyebrow}
              </m.p>
              {/* Sized so the longest name (11 chars, Anton condensed) never orphan-wraps mid-word on a 390px phone. */}
              <h1 id="hero-heading" className="mt-4 font-persona-display uppercase leading-[0.86] text-[11vw] sm:text-[9.5vw] md:text-[8vw]" style={{ fontStyle: 'oblique 6deg' }}>
                <span className="block whitespace-nowrap">
                  <LetterJitter text={registry.personal.firstName} />
                </span>
                <span className={`block whitespace-nowrap ${accentCls}`}>{registry.personal.lastName}</span>
              </h1>
              <m.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-6 max-w-2xl text-xl md:text-2xl font-sf leading-snug">
                {c.hero.positioning}
              </m.p>
              <m.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.85 }} className={`mt-4 max-w-2xl text-base md:text-lg ${muted} font-sf leading-relaxed`}>
                {c.hero.lead}
              </m.p>
              <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }} className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
                <Magnetic>
                  <CrashButton onClick={() => openContact()} className={primaryBtn}>
                    {c.hero.ctaPrimary}
                  </CrashButton>
                </Magnetic>
                <a href="#shopify" className={secondaryLink}>
                  {c.hero.ctaSecondary} {Icon.down}
                </a>
                <a href={registry.personal.cv} download className={`${muted} text-sm font-persona-label font-semibold uppercase tracking-[0.1em]`}>
                  {c.hero.ctaCv} ›
                </a>
              </m.div>
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.2 }} className="mt-7 flex flex-wrap items-center gap-3 text-xs">
                <span className={`inline-flex items-center gap-2 skew-chip px-3.5 py-1.5 font-persona-label uppercase tracking-[0.1em] ${surface} border ${line}`}>
                  <span className="w-2 h-2 rounded-full bg-[#34c759]" aria-hidden="true" />
                  {c.hero.availability}
                </span>
                <span className={`inline-flex items-center gap-2 skew-chip px-3.5 py-1.5 font-persona-label uppercase tracking-[0.1em] ${surface} border ${line} ${muted}`}>{c.hero.location}</span>
              </m.div>
            </div>
          </section>

          {/* One-time diagonal screen-wipe between hero and the status band (wf4-persona.md idea #20). */}
          <div aria-hidden="true" className="relative h-3 overflow-hidden">
            <m.div
              className={`absolute inset-0 ${accentBg}`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 94% 100%, 0% 100%)' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: [0, 1, 0] }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, ease: EASE, times: [0, 0.55, 1] }}
            />
          </div>

          {/* Stat band — "status cards" */}
          <section className={`relative px-4 py-16 md:py-24 ${surface} overflow-hidden`}>
            <div aria-hidden="true" className={`persona-halftone ${accentCls}`} />
            <div className="max-w-5xl mx-auto relative">
              <p className={`font-persona-label text-xs font-semibold uppercase tracking-[0.35em] ${accentCls} mb-6`}>[ {c.sections.statBand.label} ]</p>
              <StatBand skin={skin} />
            </div>
          </section>

          {/* Now + fleet ticker */}
          <section className="px-4 py-16 md:py-24" aria-label={c.sections.now.label}>
            <div className="max-w-5xl mx-auto">
              <SnapIn className={`inline-flex flex-wrap items-center gap-x-5 gap-y-2 skew-chip px-5 py-2.5 text-sm ${surface} border ${line}`}>
                <span className="inline-flex items-center gap-2 font-persona-label font-semibold uppercase tracking-[0.1em]">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
                  </span>
                  {c.sections.now.label}
                </span>
                <span className={muted}>{c.sections.now.live.replace('{n}', String(liveCount))}</span>
                <span className={muted}>{c.sections.now.dev.replace('{n}', String(devCount))}</span>
              </SnapIn>
            </div>
            <div className="mt-10">
              <Marquee items={registry.stores.filter((s) => !s.legacy).map((s) => ({ name: s.name, meta: c.stores[s.slug]?.industry, live: s.status === 'live' }))} dark={isDark} label={c.sections.now.band} />
            </div>
          </section>

          {/* Experience — a torn diagonal ink panel frames the section from behind */}
          <section id="experience-wrap" className={`relative px-4 py-16 md:py-24 ${surface} overflow-hidden`}>
            <div aria-hidden="true" className={`persona-torn absolute right-0 top-0 h-full w-1/3 ${isDark ? 'bg-[#f5f2ee]/[0.03]' : 'bg-[#0a0f1a]/[0.03]'}`} data-parallax="back" />
            <div className="max-w-5xl mx-auto relative">
              <Experience skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Years — reskinned as a bracketed calendar timeline */}
          <section className="px-4 py-16 md:py-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Years skin={skin} heading={(e, ti, a, l) => Heading(`[ ${e} ]`, ti, a, l)} />
              </Suspense>
            </div>
          </section>

          {/* Process — the ring motif drifts as ambient background */}
          <section className={`relative px-4 py-16 md:py-24 ${surface} overflow-hidden`}>
            <svg className="persona-ring absolute w-[50vw] max-w-[440px] aspect-square opacity-[0.08] pointer-events-none" style={{ right: '-8%', top: '10%' }} viewBox="0 0 200 200" aria-hidden="true" data-parallax="back">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className={accentCls} strokeWidth="0.8" strokeDasharray="1 6" />
            </svg>
            <div className="max-w-5xl mx-auto relative">
              <Suspense fallback={<Pending />}>
                <Process skin={skin} heading={Heading} canvas={surface} />
              </Suspense>
            </div>
          </section>

          {/* Shopify work — the index, in the skin's skewed row/chip vocabulary */}
          <section className="px-4 py-16 md:py-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <ShopifyWork skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Gallery — a sticker callout label pinned above the frame */}
          <section className={`relative px-4 py-16 md:py-24 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <span className={`persona-sticker inline-block skew-chip ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} px-3 py-1 text-[11px] font-persona-label font-bold uppercase tracking-[0.1em] mb-4`}>
                — {c.sections.gallery.viewLabel} —
              </span>
              <Suspense fallback={<Pending />}>
                <Gallery skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Manifesto — two accent shards crash together ahead of the inverted band */}
          <div aria-hidden="true" className="relative h-6 overflow-hidden flex items-center justify-center gap-1">
            <m.span className={`h-1.5 w-10 ${accentBg}`} style={{ clipPath: 'polygon(0 0,100% 0,80% 100%,0 100%)' }} initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={SNAP} />
            <m.span className={`h-1.5 w-10 ${accentBg}`} style={{ clipPath: 'polygon(20% 0,100% 0,100% 100%,0 100%)' }} initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={SNAP} />
          </div>
          <Suspense fallback={<Pending h="min-h-[40vh]" />}>
            <Manifesto skin={skin} />
          </Suspense>

          {/* Projects — index list */}
          <section className="px-4 py-16 md:py-24">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Projects skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Skills — own-glyph tag pattern via the skin's skewed chips */}
          <section id="skills" className={`px-4 py-16 md:py-24 ${surface} scroll-mt-14`}>
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Skills skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* FAQ — dialogue-box panel (notch-cut corner) */}
          <section className="px-4 py-16 md:py-24">
            <div className={`max-w-5xl mx-auto persona-notch border ${line} ${surface} p-6 md:p-10`}>
              <Suspense fallback={<Pending h="min-h-[40vh]" />}>
                <Faq skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Contact — the same dialogue-box, this time for the ask */}
          <section className={`px-4 py-20 md:py-28 ${surface}`}>
            <div className={`max-w-5xl mx-auto persona-notch border ${line} ${bg} p-6 md:p-12`}>
              <Suspense fallback={<Pending />}>
                <Contact skin={skin} ctaClass={primaryBtn} onContact={openContact} />
              </Suspense>
            </div>
          </section>

          {/* Explore — the other four experiences, cursor-tracking selector energy via skewed hover */}
          <section id="explore" className="px-4 py-16 md:py-24 scroll-mt-14">
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
              <div className="grid sm:grid-cols-3 gap-4">
                {otherDesigns('persona').map((d) => (
                  <TransitionLink
                    key={d.id}
                    to={d.route}
                    transitionColor={d.transitionColor}
                    transitionAccent={d.transitionAccent}
                    transitionLabel={t(d.nameKey)}
                    className={`block clip-corner-sm overflow-hidden border ${line} ${surface} transition-transform duration-150 hover:-skew-x-1`}
                  >
                    <div className="h-28 overflow-hidden">
                      <d.Preview size="md" />
                    </div>
                    <div className="p-4">
                      <p className="font-persona-label text-sm font-semibold uppercase tracking-[0.1em]">{t(d.nameKey)}</p>
                      <p className={`${muted} text-xs`}>{t(d.subtitleKey)}</p>
                    </div>
                  </TransitionLink>
                ))}
                <TransitionLink
                  to={MENU.route}
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel={t(MENU.labelKey)}
                  className={`block clip-corner-sm overflow-hidden border ${line} ${surface} transition-transform duration-150 hover:-skew-x-1`}
                >
                  <div className="h-28 overflow-hidden">
                    <MenuPreview isDark={isDark} />
                  </div>
                  <div className="p-4">
                    <p className="font-persona-label text-sm font-semibold uppercase tracking-[0.1em]">{t(MENU.labelKey)}</p>
                    <p className={`${muted} text-xs`}>{t(MENU.subtitleKey)}</p>
                  </div>
                </TransitionLink>
              </div>
              <p className={`${muted} text-xs mt-8 text-center font-persona-label uppercase tracking-[0.1em]`}>
                {c.sections.explore.viewing}: <span className={accentCls}>{t(self.nameKey)}</span>
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className={`px-4 pb-10 pt-8 text-xs ${muted}`} role="contentinfo" aria-label="Site footer">
          <div className={`max-w-5xl mx-auto flex flex-col gap-3 border-t pt-8 md:flex-row md:items-baseline md:justify-between font-persona-label uppercase tracking-[0.1em] ${line}`}>
            <p>
              © 2026 {registry.personal.name}. {c.footer.rights}
            </p>
            <p className="md:text-center">
              <span className={accentCls}>{t(self.nameKey)}</span> — {t(self.subtitleKey)}
            </p>
            <a href="#hero" className={`${accentCls} inline-flex items-center gap-1 font-semibold`}>
              {c.footer.backToTop} ↑
            </a>
          </div>
        </footer>

        {/* Front parallax shards — sparse, capped, decorative only */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden md:block">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              data-parallax="front"
              className={`absolute h-3 w-3 ${accentBg} opacity-[0.12]`}
              style={{ clipPath: 'polygon(50% 0,100% 100%,0 100%)', left: `${12 + i * 24}%`, top: `${18 + i * 20}%` }}
            />
          ))}
        </div>

        {/* Mobile contact FAB */}
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          aria-label="Open contact form"
          className={`fixed bottom-6 right-6 md:hidden w-14 h-14 persona-skew-btn ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} shadow-lg z-30 flex items-center justify-center`}
        >
          {Icon.mail}
        </button>
      </div>
    </>
  )
}

export default function Persona() {
  return (
    <ThemeProvider storageKey="persona-theme" defaultTheme="light">
      <SmoothScroll offset={56}>
        <PersonaContent />
      </SmoothScroll>
    </ThemeProvider>
  )
}
