import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { useLanguage, supportedLocales } from '../context/LanguageContext'
import '../styles/skyline.css'
import { SEOHead, TransitionLink, Magnetic, RevealText, Ticker, ScrollObject } from '../components/common'
import type { SkylineBarDatum } from '../components/common/ScrollObject'
import { ContactFormModal } from '../components/modals'
import { StatBand } from '../components/sections/StatBand'
import { Experience } from '../components/sections/Experience'
import { skins } from '../components/gallery/skins'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { otherDesigns, MENU } from '../data/designs'
import { stores, products } from '../data/registry'
import { telemetry } from '../data/telemetry'
import type { SectionHeading } from '../components/sections/Gallery'

// Below the fold, each section arrives as its own chunk — same pattern as every other theme.
const Years = lazy(() => import('../components/sections/Years').then((mod) => ({ default: mod.Years })))
const Process = lazy(() => import('../components/sections/Process').then((mod) => ({ default: mod.Process })))
const ShopifyWork = lazy(() => import('../components/sections/ShopifyWork').then((mod) => ({ default: mod.ShopifyWork })))
const Skills = lazy(() => import('../components/sections/Skills').then((mod) => ({ default: mod.Skills })))
const Instruments = lazy(() => import('../components/sections/Instruments').then((mod) => ({ default: mod.Instruments })))
const Faq = lazy(() => import('../components/sections/Faq').then((mod) => ({ default: mod.Faq })))
const Contact = lazy(() => import('../components/sections/Contact').then((mod) => ({ default: mod.Contact })))

const Pending = ({ h = 'min-h-[40vh]' }: { h?: string }) => <div className={h} aria-hidden="true" />

const EASE = [0.23, 1, 0.32, 1] as const

const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <m.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.5, delay, ease: EASE }}
    className={className}
  >
    {children}
  </m.div>
)

/** Google Fonts (Inter) loaded on demand, only while this theme is mounted — every numeral stays on
 *  the globally-loaded JetBrains Mono (index.html), so only the copy face needs its own fetch. */
function useSkylineFont() {
  useEffect(() => {
    const id = 'skyline-font-link'
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
    sheet.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
    document.head.append(pre1, pre2, sheet)
    return () => {
      pre1.remove()
      pre2.remove()
      sheet.remove()
    }
  }, [])
}

/** The HUD corner readout: a live clock (America/Bogota), real scroll position and real viewport
 *  size — every value here is actually computed, nothing is a static prop dressed up as live data. */
function useSkylineHud() {
  const [now, setNow] = useState(() => new Date())
  const [scrollPct, setScrollPct] = useState(0)
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 0,
    h: typeof window !== 'undefined' ? window.innerHeight : 0,
  }))

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0)
    }
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    onScroll()
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const clockFmt = useMemo(() => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Bogota' }), [])
  return { time: clockFmt.format(now), scrollPct: Math.round(scrollPct), vw: viewport.w, vh: viewport.h }
}

// ---- The real fleet, laid out once at module load (registry data is static) ----------------------
interface FleetItem {
  id: string
  name: string
  year: number
  commits: number
}

/** Height = real commit count from git history (src/data/telemetry.json); 1 unit where telemetry
 *  isn't tracked yet — in-house products and pre-2026 legacy builds. Never estimated. */
const fleetItems: FleetItem[] = [
  ...stores.map((s) => ({ id: s.slug, name: s.name, year: s.year, commits: telemetry[s.slug]?.commits ?? 1 })),
  ...products.map((p) => ({ id: p.id, name: p.name, year: p.year, commits: 1 })),
].sort((a, b) => a.year - b.year || b.commits - a.commits || a.name.localeCompare(b.name))

const fleetYears = [...new Set(fleetItems.map((f) => f.year))].sort((a, b) => a - b)
const maxCommits = Math.max(1, ...fleetItems.map((f) => f.commits))
const peakId = fleetItems.reduce((a, f) => (f.commits > a.commits ? f : a), fleetItems[0]).id

/** 3D layout: one instanced bar per item, grouped into a roughly-square cluster per launch year so a
 *  year with many shipped stores (2026) reads as a dense block next to the sparser earlier years —
 *  an honest skyline of real build volume, not an invented cityscape. */
function layoutSkylineBars(): SkylineBarDatum[] {
  const SPACING = 0.62
  const YEAR_GAP = 0.85
  let cursor = 0
  const centers: number[] = []
  const groups = fleetYears.map((y) => fleetItems.filter((f) => f.year === y))
  groups.forEach((group) => {
    const cols = Math.ceil(Math.sqrt(group.length))
    const width = cols * SPACING
    centers.push(cursor + width / 2)
    cursor += width + YEAR_GAP
  })
  const shift = (cursor - YEAR_GAP) / 2
  const bars: SkylineBarDatum[] = []
  groups.forEach((group, gi) => {
    const cols = Math.ceil(Math.sqrt(group.length))
    const rows = Math.ceil(group.length / cols)
    group.forEach((item, ii) => {
      const col = ii % cols
      const row = Math.floor(ii / cols)
      const x = centers[gi] - shift + (col - (cols - 1) / 2) * SPACING
      const z = (row - (rows - 1) / 2) * SPACING
      const height = Math.max(0.14, (item.commits / maxCommits) * 2.6)
      bars.push({ x, z, height, peak: item.id === peakId })
    })
  })
  return bars
}
const skylineBarData = layoutSkylineBars()

/** The SVG twin: same fleet, same order, one bar per item with a gap between launch-year groups —
 *  this (plus the table beside it) is what mobile, reduced motion and assistive tech get. */
function FleetChart({ locale }: { locale: string }) {
  const barW = 6
  const gap = 2
  const groupGap = 12
  const h = 84
  const padTop = 6
  const padBottom = 16
  let x = 4
  const rects: { x: number; item: FleetItem }[] = []
  const yearLabels: { x: number; year: number }[] = []
  fleetYears.forEach((y) => {
    const group = fleetItems.filter((f) => f.year === y)
    const startX = x
    group.forEach((item) => {
      rects.push({ x, item })
      x += barW + gap
    })
    yearLabels.push({ x: (startX + x - gap) / 2, year: y })
    x += groupGap
  })
  const w = x - groupGap + 4
  const fmt = new Intl.NumberFormat(locale === 'ja' ? 'ja-JP' : locale === 'es' ? 'es-CO' : 'en-US')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label="Fleet by launch year, bar height = commits shipped">
      {rects.map(({ x: bx, item }) => {
        const barH = Math.max(3, (item.commits / maxCommits) * (h - padTop - padBottom))
        return (
          <rect
            key={item.id}
            x={bx}
            y={h - padBottom - barH}
            width={barW}
            height={barH}
            rx={1}
            fill={item.id === peakId ? '#4fd1ff' : '#3c4a68'}
          >
            <title>
              {item.name} ({item.year}): {fmt.format(item.commits)} {item.commits === 1 && !telemetry[item.id] ? '(no telemetry yet)' : 'commits'}
            </title>
          </rect>
        )
      })}
      {yearLabels.map((yl) => (
        <text key={yl.year} x={yl.x} y={h - 3} textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace" fill="#8d9bb0">
          {yl.year}
        </text>
      ))}
    </svg>
  )
}

const Icon = {
  mail: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  globe: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  down: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0-6-6m6 6 6-6" />
    </svg>
  ),
  menu: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

/**
 * Skyline — the "data-monument" register. Deep navy/graphite ground, one reserved accent (cyan)
 * that only ever lands on a real number or a real-data chart fill, technical grotesk for copy and
 * tabular mono for every numeral. Fixed dark — this theme never runs a light mode.
 */
export default function Skyline() {
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
  useDynamicFavicon('skyline')
  useSkylineFont()
  const hud = useSkylineHud()
  const sh = c.sections.skylineHero

  const skin = skins.skyline(true)
  const muted = skin.muted
  const accent = skin.accent
  const nav = [
    ['#hero', t('nav.home')],
    ['#experience', t('nav.experience')],
    ['#shopify', t('nav.shopify')],
    ['#skills', t('nav.skills')],
    ['#instruments', t('nav.instruments')],
    ['#contact', t('nav.contact')],
  ] as const

  const Heading: SectionHeading = (eyebrow, title, accentWord, lead) => (
    <Reveal className="mb-10 md:mb-14">
      <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.2em] ${accent}`}>{eyebrow}</p>
      <h2 className="font-skyline mt-3 text-4xl font-bold tracking-[-0.02em] leading-[1.05] text-[#eef3f9] md:text-6xl">
        <RevealText text={title} /> <RevealText text={accentWord} className={muted} delay={0.1} />
      </h2>
      {lead && <p className={`${muted} mt-5 max-w-2xl text-lg leading-relaxed md:text-xl`}>{lead}</p>}
    </Reveal>
  )

  const liveCount = registry.stores.filter((s) => s.status === 'live').length
  const devCount = registry.stores.filter((s) => s.status === 'dev').length
  const primaryBtn = 'skyline-press inline-flex items-center gap-2 rounded-[3px] bg-[#4fd1ff] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-[#0d1420] hover:bg-[#7fe0ff]'
  const secondaryBtn = 'skyline-press inline-flex items-center gap-1.5 rounded-[3px] border border-[#e7edf5]/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#e7edf5] hover:bg-[#e7edf5]/10'

  return (
    <>
      <SEOHead title={`${c.meta.title} — ${t('menuPage.designNames.skyline')}`} description={c.meta.description} canonical="https://www.maxfolio.dev/skyline" />
      <div className="theme-skyline contents">
        <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="skyline" isDark initialMessage={contactPrefill} />
      </div>

      <div className="theme-skyline font-skyline min-h-screen [overflow-x:clip]" role="document">
        {/* Nav — a HUD bar, mono labels */}
        <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e7edf5]/10 bg-[#0d1420]/85 px-4 backdrop-blur-md" aria-label="Main navigation">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3">
            <TransitionLink to="/skyline" transitionColor="#0d1420" transitionAccent="#4fd1ff" transitionLabel="Skyline" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 items-center justify-center rounded-[2px] bg-[#4fd1ff]" aria-hidden="true" />
              <span className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#eef3f9]">Maxfolio</span>
            </TransitionLink>
            <div className="hidden items-center gap-1 font-mono text-xs uppercase tracking-[0.06em] md:flex">
              {nav.map(([href, label]) => (
                <a key={href} href={href} className={`inline-flex h-8 items-center rounded-[3px] px-3 ${muted} hover:text-[#eef3f9] transition-colors duration-150`}>
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 sm:inline-flex" role="radiogroup" aria-label={t('language.selector.ariaLabel')}>
                {supportedLocales.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={opt === locale}
                    onClick={() => setLocale(opt)}
                    className={opt === locale ? skin.chipOn : skin.chip}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setContactOpen(true)} className={`${primaryBtn} hidden !px-4 !py-2 sm:inline-flex`}>
                {c.hero.ctaContact}
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[#e7edf5]/15 text-[#e7edf5] md:hidden"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                {Icon.menu}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div className="theme-skyline fixed inset-0 z-[9999] bg-[#0d1420]" onClick={() => setMobileOpen(false)}>
            <div className="flex h-full flex-col px-6 pb-10 pt-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex h-11 items-center justify-between">
                <span className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#eef3f9]">{t('mobileMenu.menu')}</span>
                <button type="button" onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[#e7edf5]/15 text-[#e7edf5]" aria-label="Close menu">
                  {Icon.close}
                </button>
              </div>
              <nav className="mt-8 flex-1">
                {nav.map(([href, label]) => (
                  <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block py-3 font-skyline text-3xl font-bold tracking-[-0.02em] text-[#eef3f9]">
                    {label}
                  </a>
                ))}
              </nav>
              <button type="button" onClick={() => { setMobileOpen(false); setContactOpen(true) }} className={`${primaryBtn} w-full justify-center`}>
                {c.hero.ctaContact}
              </button>
              <div className="mt-6">
                <p className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${muted}`}>{t('logoSelector.otherExperiences')}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {otherDesigns('skyline').map((d) => (
                    <TransitionLink key={d.id} to={d.href} transitionColor={d.transitionColor} transitionAccent={d.transitionAccent} transitionLabel={t(d.nameKey)} className={accent}>
                      {t(d.nameKey)} ›
                    </TransitionLink>
                  ))}
                  <TransitionLink to={MENU.route} transitionColor="#171717" transitionAccent="#ffffff" transitionLabel={t(MENU.labelKey)} className={accent}>
                    {t(MENU.subtitleKey)} ›
                  </TransitionLink>
                </div>
              </div>
            </div>
          </div>
        )}

        <main id="main-content" className="pt-24">
          {/* HUD corner readout — real clock, real scroll position, real viewport, aria-live off */}
          <div
            className="skyline-hud fixed bottom-4 left-4 z-30 hidden select-none px-3 py-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-[#8d9bb0] sm:block"
            aria-live="off"
          >
            <p>
              {sh.clockLabel} <span className="text-[#eef3f9]">{hud.time}</span>
            </p>
            <p>
              {sh.scrollLabel} <span className="tabular-nums text-[#eef3f9]">{hud.scrollPct}%</span>
            </p>
            <p>
              {sh.viewportLabel} <span className="tabular-nums text-[#eef3f9]">{hud.vw}×{hud.vh}</span>
            </p>
          </div>

          {/* HERO — the "skyline": a 3D instanced bar chart of the real fleet, with an always-on
              HTML twin (SVG + table) that mobile, reduced motion and assistive tech actually get. */}
          <section id="hero" data-scroll-object-track className="relative scroll-mt-24 px-4 pb-16 md:pb-24" aria-labelledby="hero-heading">
            <div className="skyline-grid-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
            <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <p className={`font-mono text-sm font-semibold uppercase tracking-[0.12em] ${accent}`}>{c.hero.eyebrow}</p>
                <h1 id="hero-heading" className="mt-4 text-5xl font-bold leading-[1.02] tracking-[-0.02em] text-[#eef3f9] md:text-7xl">
                  {registry.personal.name}
                </h1>
                <p className={`mt-5 max-w-xl text-xl leading-snug md:text-2xl ${muted}`}>{c.hero.positioning}</p>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-[#c7d2e0] md:text-lg">{c.hero.lead}</p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Magnetic>
                    <button type="button" onClick={() => openContact()} className={primaryBtn}>
                      {Icon.mail} {c.hero.ctaPrimary}
                    </button>
                  </Magnetic>
                  <a href="#shopify" className={secondaryBtn}>
                    {c.hero.ctaSecondary} {Icon.down}
                  </a>
                  <a href={registry.personal.cv} download className={`font-mono text-sm font-semibold uppercase tracking-[0.06em] ${muted}`}>
                    {c.hero.ctaCv} ›
                  </a>
                </div>
                <p className={`mt-4 font-mono text-xs ${muted}`}>{c.hero.ctaNote}</p>
              </div>

              {/* Right: the fleet panel — 3D decoration (desktop, hover+fine pointer, motion-ok, in
                  view only) drawn OVER the always-present HTML twin, never replacing it. */}
              <div className="lg:col-span-5">
                <Reveal delay={0.15} className="relative overflow-hidden rounded-md border border-[#e7edf5]/10 bg-[#141d2e] p-6 md:p-8">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px] border border-[#e7edf5]/10 bg-[#0d1420]">
                    <ScrollObject variant="skyline" data={skylineBarData} />
                    <div className="relative flex h-full w-full items-center justify-center p-3" aria-hidden={false}>
                      <FleetChart locale={locale} />
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-snug text-[#c7d2e0]">{sh.chartCaption.replace('{n}', String(fleetItems.length))}</p>
                  <p className={`mt-1 text-[10px] leading-snug ${muted}`}>{sh.fallbackNote}</p>

                  {/* Unbounded on phones: a nested scroll region inside an already-scrolling page is a
                      real touch-scroll trap (confirmed via the first-scroll audit — it stalled the
                      page's own scroll at this element). Capped only from sm: up, where a mouse wheel
                      scrolls whichever region is under the pointer without ambiguity. */}
                  <div className="mt-4 overflow-y-auto rounded-[3px] border border-[#e7edf5]/10 sm:max-h-40">
                    <table className="w-full border-collapse text-left">
                      <caption className="sr-only">{sh.tableCaption}</caption>
                      <thead className="sticky top-0 bg-[#141d2e]">
                        <tr>
                          <th scope="col" className="border-b border-[#e7edf5]/10 px-2 py-1.5 font-mono text-[10px] font-normal uppercase tracking-[0.08em] text-[#8d9bb0]">{sh.tableYear}</th>
                          <th scope="col" className="border-b border-[#e7edf5]/10 px-2 py-1.5 font-mono text-[10px] font-normal uppercase tracking-[0.08em] text-[#8d9bb0]">{sh.tableName}</th>
                          <th scope="col" className="border-b border-[#e7edf5]/10 px-2 py-1.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.08em] text-[#8d9bb0]">{sh.tableCommits}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fleetItems.map((item) => (
                          <tr key={item.id} className="border-b border-[#e7edf5]/[0.06] last:border-0">
                            <td className="px-2 py-1 font-mono text-[11px] tabular-nums text-[#c7d2e0]">{item.year}</td>
                            <td className="px-2 py-1 text-[11px] text-[#e7edf5]">{item.name}</td>
                            <td className={`px-2 py-1 text-right font-mono text-[11px] tabular-nums ${item.id === peakId ? 'text-[#4fd1ff]' : 'text-[#c7d2e0]'}`}>{item.commits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {registry.stats.slice(0, 4).map((st) => (
                      <div key={st.id} className="rounded-[3px] border border-[#e7edf5]/10 bg-[#0d1420] px-3 py-3">
                        <p className="font-mono text-2xl font-semibold tabular-nums text-[#4fd1ff]">{st.value}</p>
                        <p className={`mt-0.5 text-[11px] leading-snug ${muted}`}>{c.stats[st.id]}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Stat band — shared, skinned */}
          <section className="px-4 pb-16 md:pb-24">
            <div className="mx-auto max-w-5xl">
              <StatBand skin={skin} tileClassName="!rounded-none" />
            </div>
          </section>

          {/* Now + fleet ticker — mono HUD readout variant */}
          <section className="px-4 pb-16 md:pb-24" aria-label={c.sections.now.label}>
            <div className="mx-auto max-w-5xl">
              <Reveal className="inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[3px] border border-[#e7edf5]/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.08em]">
                <span className="inline-flex items-center gap-2 font-semibold text-[#eef3f9]">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-70 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
                  </span>
                  {c.sections.now.label}
                </span>
                <span className={muted}>{c.sections.now.live.replace('{n}', String(liveCount))}</span>
                <span className={muted}>{c.sections.now.dev.replace('{n}', String(devCount))}</span>
              </Reveal>
            </div>
            <div className="mt-10 border-y border-[#e7edf5]/10">
              <Ticker
                variant="speed-hover"
                duration={46}
                label={c.sections.now.band}
                items={registry.stores.filter((s) => !s.legacy)}
                keyOf={(s) => s.slug}
                itemClassName="flex shrink-0 items-center gap-2.5 whitespace-nowrap px-5 py-4 font-mono"
                renderItem={(s) => (
                  <>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.status !== 'live' ? 'bg-[#ff9f0a]' : 'bg-[#34c759]'}`} aria-hidden="true" />
                    <span className="text-base font-semibold tracking-[-0.01em] text-[#eef3f9]">{s.name}</span>
                    {c.stores[s.slug]?.industry && <span className="text-sm text-[#8d9bb0]">{c.stores[s.slug].industry}</span>}
                  </>
                )}
              />
            </div>
          </section>

          {/* Experience — shared, skinned */}
          <section className="scroll-mt-24 px-4 py-12 md:py-16">
            <div className="mx-auto max-w-5xl rounded-md border border-[#e7edf5]/10 bg-[#141d2e] p-6 md:p-10">
              <Experience skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Years — shared unit chart, kept 2D and precise */}
          <section className="px-4 py-12 md:py-16">
            <div className="mx-auto max-w-5xl">
              <Suspense fallback={<Pending />}>
                <Years skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Process — shared, the pinned readout rides the HUD grid backdrop. `[overflow-x:clip]`, not
              `overflow-hidden`: `hidden` (either axis) makes this section a scroll container, which hijacked
              the Process column's `position: sticky` (measured: top tracked the page scroll 1:1, never
              pinned) even though root already used the safe `[overflow-x:clip]` idiom. The grid backdrop
              below is `absolute inset-0` — its background-image is already clipped to the section's own box
              by the box model regardless of `overflow`, so nothing here actually needed containing. */}
          <section className="relative [overflow-x:clip] px-4 py-12 md:py-16">
            <div className="skyline-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative mx-auto max-w-5xl">
              <Suspense fallback={<Pending />}>
                <Process skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Shopify work — shared index + sheet */}
          <section className="scroll-mt-24 px-4 py-12 md:py-16">
            <div className="mx-auto max-w-5xl">
              <Suspense fallback={<Pending />}>
                <ShopifyWork skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Skills — shared tool tiles, skinned navy */}
          <section className="scroll-mt-24 px-4 py-12 md:py-16">
            <div className="mx-auto max-w-5xl">
              <Suspense fallback={<Pending />}>
                <Skills skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Instruments — new: three honest gauges read off the fleet's own records */}
          <section className="px-4 py-12 md:py-16">
            <div className="mx-auto max-w-5xl">
              <Suspense fallback={<Pending />}>
                <Instruments skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-4 py-12 md:py-16">
            <div className="mx-auto max-w-5xl rounded-md border border-[#e7edf5]/10 bg-[#141d2e] p-6 md:p-10">
              <Suspense fallback={<Pending h="min-h-[40vh]" />}>
                <Faq skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* Contact — the "now" panel reads as a HUD readout: real local time + availability */}
          <section className="scroll-mt-24 px-4 py-14 md:py-20">
            <div className="mx-auto max-w-5xl">
              <Suspense fallback={<Pending />}>
                <Contact skin={skin} ctaClass={`${primaryBtn} !px-7`} onContact={openContact} fieldClassName="bg-[#0d1420] border-[#e7edf5]/15 text-[#eef3f9] placeholder:text-[#8d9bb0] focus:border-[#4fd1ff] rounded-[3px] font-mono text-sm" />
              </Suspense>
            </div>
          </section>

          {/* Explore */}
          <section className="px-4 py-16">
            <div className="mx-auto max-w-5xl">
              {Heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
              <div className="grid gap-3 sm:grid-cols-3">
                {otherDesigns('skyline').map((d) => (
                  <TransitionLink
                    key={d.id}
                    to={d.href}
                    transitionColor={d.transitionColor}
                    transitionAccent={d.transitionAccent}
                    transitionLabel={t(d.nameKey)}
                    className="block overflow-hidden rounded-md border border-[#e7edf5]/10 bg-[#141d2e] hover:border-[#e7edf5]/25"
                  >
                    <div className="h-28 overflow-hidden">
                      <d.Preview size="md" />
                    </div>
                    <div className="p-4">
                      <p className="font-mono text-sm font-semibold text-[#eef3f9]">{t(d.nameKey)}</p>
                      <p className={`text-xs ${muted}`}>{t(d.subtitleKey)}</p>
                    </div>
                  </TransitionLink>
                ))}
                <TransitionLink to={MENU.route} transitionColor="#171717" transitionAccent="#ffffff" transitionLabel={t(MENU.labelKey)} className="block overflow-hidden rounded-md border border-[#e7edf5]/10 bg-[#141d2e] hover:border-[#e7edf5]/25">
                  <div className="flex h-28 items-center justify-center bg-black/40 text-xs font-semibold text-white">{t(MENU.labelKey)}</div>
                  <div className="p-4">
                    <p className="font-mono text-sm font-semibold text-[#eef3f9]">{t(MENU.labelKey)}</p>
                    <p className={`text-xs ${muted}`}>{t(MENU.subtitleKey)}</p>
                  </div>
                </TransitionLink>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-4 pb-10 pt-4 text-xs" role="contentinfo" aria-label="Site footer">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 border-t border-[#e7edf5]/10 pt-8 font-mono md:flex-row md:items-baseline md:justify-between">
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
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-[3px] bg-[#4fd1ff] text-[#0d1420] md:hidden"
        >
          {Icon.mail}
        </button>
      </div>
    </>
  )
}
