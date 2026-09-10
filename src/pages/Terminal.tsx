import { lazy, Suspense, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useLanguage, supportedLocales, type Locale } from '../context/LanguageContext'
import '../styles/terminal.css'
import { SEOHead, TransitionLink, RevealText, Ticker } from '../components/common'
import { ContactFormModal } from '../components/modals'
import { StatBand } from '../components/sections/StatBand'
import { Experience } from '../components/sections/Experience'
import { skins } from '../components/gallery/skins'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { otherDesigns, MENU } from '../data/designs'
import { fleetLiquidLines, fleetIslandLines, fleetStoreCount } from '../data/skillUsage'
import changelogData from '../data/changelog.json'

// Below the fold, each section arrives as its own chunk — same convention as every other theme.
const Years = lazy(() => import('../components/sections/Years').then((mod) => ({ default: mod.Years })))
const Process = lazy(() => import('../components/sections/Process').then((mod) => ({ default: mod.Process })))
const ShopifyWork = lazy(() => import('../components/sections/ShopifyWork').then((mod) => ({ default: mod.ShopifyWork })))
const Skills = lazy(() => import('../components/sections/Skills').then((mod) => ({ default: mod.Skills })))
const Faq = lazy(() => import('../components/sections/Faq').then((mod) => ({ default: mod.Faq })))
const Contact = lazy(() => import('../components/sections/Contact').then((mod) => ({ default: mod.Contact })))

/** Keeps the page height stable while a section's chunk loads — see neo.css's Pending for why 40vh. */
const Pending = ({ h = 'min-h-[40vh]' }: { h?: string }) => <div className={h} aria-hidden="true" />

const EASE = [0.23, 1, 0.32, 1] as const
const ACCENT_KEY = 'terminal-accent'
const BOOT_KEY = 'terminal-boot-seen'
type Accent = 'green' | 'amber'

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

/** Google Fonts (JetBrains Mono), loaded on demand only while this theme is mounted — no other theme uses it. */
function useTerminalFont() {
  useEffect(() => {
    const id = 'terminal-font-link'
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
    sheet.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap'
    document.head.append(pre1, pre2, sheet)
    return () => {
      pre1.remove()
      pre2.remove()
      sheet.remove()
    }
  }, [])
}

/** The one phosphor-accent toggle (green default, amber alternate), persisted per browser. */
function useAccent(): [Accent, (a: Accent) => void] {
  const [accent, setAccent] = useState<Accent>(() => {
    if (typeof window === 'undefined') return 'green'
    try {
      const saved = window.localStorage.getItem(ACCENT_KEY)
      return saved === 'amber' ? 'amber' : 'green'
    } catch {
      return 'green'
    }
  })
  const set = (a: Accent) => {
    setAccent(a)
    try {
      window.localStorage.setItem(ACCENT_KEY, a)
    } catch {
      /* private browsing / storage blocked — the toggle still works for this render */
    }
  }
  return [accent, set]
}

/** Real, live wall-clock in Medellín — the only "live" readout on this page, per the site-wide honesty
 *  rule (no invented counters). Ticks once a second; `aria-live="off"` so a screen reader is never
 *  interrupted every second by a clock nobody asked it to narrate. */
function useBogotaClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)
}

/** Hand-made 5x7 block-character "MB" — decorative only, aria-hidden. Never a fabricated logo asset. */
const ASCII_MB = ['█   █  █████', '██ ██  █   █', '█ █ █  █   █', '█   █  █████', '█   █  █   █', '█   █  █   █', '█   █  █████'].join('\n')

const NAV_IDS = ['shopify', 'years', 'skills', 'contact'] as const
type NavId = (typeof NAV_IDS)[number]

const CHANGELOG_COPY: Record<Locale, { eyebrow: string; title: string; accent: string; lead: string; source: string }> = {
  en: {
    eyebrow: 'git log --oneline -12',
    title: 'What shipped,',
    accent: 'on this site',
    lead: 'The last 12 commits to maxfolio.dev itself, generated at build time from the real git history — never a hand-typed list.',
    source: "Source: this repo's git history, generated by scripts/build-changelog.mjs",
  },
  es: {
    eyebrow: 'git log --oneline -12',
    title: 'Lo último,',
    accent: 'en este sitio',
    lead: 'Los últimos 12 commits de maxfolio.dev, generados en el build desde el historial real de git — nunca una lista escrita a mano.',
    source: 'Fuente: historial de git de este repo, generado por scripts/build-changelog.mjs',
  },
  ja: {
    eyebrow: 'git log --oneline -12',
    title: '直近の変更、',
    accent: 'このサイトの',
    lead: 'maxfolio.dev 自体への直近12件のコミット。ビルド時に実際のgit履歴から生成しており、手入力のリストではない。',
    source: '出典: 本リポジトリのgit履歴（scripts/build-changelog.mjs が生成）',
  },
}

interface ChangelogEntry {
  hash: string
  date: string
  subject: string
}
const CHANGELOG: ChangelogEntry[] = changelogData as ChangelogEntry[]

const Icon = {
  mail: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  down: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0-6-6m6 6 6-6" />
    </svg>
  ),
}

/**
 * Terminal — the engineer-for-engineers register. One near-black ground, one phosphor accent
 * (green by default, amber via a real toggle), monospace throughout, a boot-sequence hero that
 * plays once per session and is always skippable.
 */
function TerminalContent() {
  const { locale, setLocale } = useLanguage()
  const { t } = useI18n()
  const { strings: c, registry } = useContent()
  const [accent, setAccent] = useAccent()
  const [contactOpen, setContactOpen] = useState(false)
  const [contactPrefill, setContactPrefill] = useState('')
  const openContact = (prefill?: string) => {
    setContactPrefill(prefill ?? '')
    setContactOpen(true)
  }
  useDynamicFavicon('terminal')
  useTerminalFont()
  const reduced = useReducedMotion()
  const clock = useBogotaClock()

  const skin = skins.terminal(true)
  const muted = skin.muted
  const accentCls = skin.accent

  // Boot sequence: sessionStorage-gated (plays once per browser session), always skippable
  // (Esc / any key / the [skip] control), reduced motion shows the final state immediately. The
  // full text of every line is always in the DOM — only a `clip-path` transition (set inline
  // below) reveals it, never re-typed via innerHTML.
  const bootLines = [
    { key: 'name', label: 'SYS.NAME', value: registry.personal.name },
    { key: 'role', label: 'SYS.ROLE', value: c.hero.eyebrow },
    { key: 'location', label: 'SYS.LOCATION', value: 'Medellín, CO' },
    { key: 'status', label: 'STATUS', value: c.hero.availability },
  ]
  const alreadySeen = typeof window !== 'undefined' && window.sessionStorage.getItem(BOOT_KEY) === '1'
  const [bootDone, setBootDone] = useState(reduced || alreadySeen)
  const [revealCount, setRevealCount] = useState(reduced || alreadySeen ? bootLines.length : 0)
  useEffect(() => {
    if (bootDone) return
    if (revealCount >= bootLines.length) {
      setBootDone(true)
      try {
        window.sessionStorage.setItem(BOOT_KEY, '1')
      } catch {
        /* private browsing — the boot just replays next load, harmless */
      }
      return
    }
    const id = window.setTimeout(() => setRevealCount((n) => n + 1), 480)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealCount, bootDone])
  const skipBoot = () => {
    setRevealCount(bootLines.length)
    setBootDone(true)
    try {
      window.sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      /* ignore */
    }
  }
  useEffect(() => {
    if (bootDone) return
    const onKey = () => skipBoot()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootDone])

  // Active-bracket tracking: an IntersectionObserver on the four shared sections' own ids (they
  // already carry one — see ShopifyWork/Years/Skills/Contact). Sections are lazy chunks, so this
  // retries on a short timer until all four have mounted rather than giving up after one pass.
  const [activeNav, setActiveNav] = useState<NavId>('shopify')
  useEffect(() => {
    let obs: IntersectionObserver | null = null
    let timer = 0
    const tryAttach = () => {
      const els = NAV_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
      if (els.length === NAV_IDS.length) {
        obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) setActiveNav(e.target.id as NavId)
            })
          },
          { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
        )
        els.forEach((el) => obs!.observe(el))
      } else {
        timer = window.setTimeout(tryAttach, 400)
      }
    }
    tryAttach()
    return () => {
      obs?.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  const navItems: { id: NavId; label: string }[] = [
    { id: 'shopify', label: t('nav.work') },
    { id: 'years', label: t('nav.years') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'contact', label: t('nav.contact') },
  ]

  const BracketNav = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
    <nav aria-label={t('nav.work')} className={`flex flex-wrap items-center ${size === 'sm' ? 'gap-x-4 gap-y-1 text-xs' : 'gap-x-3 gap-y-2 text-sm sm:gap-x-6 md:text-base'}`}>
      {navItems.map((item) => {
        const active = activeNav === item.id
        return (
          <a key={item.id} href={`#${item.id}`} className="term-bracket font-mono whitespace-nowrap transition-colors" data-active={active}>
            [{active ? '·' : ' '}] {item.label.toUpperCase()}
          </a>
        )
      })}
    </nav>
  )

  const Heading = (eyebrow: string, title: string, accentWord: string, lead?: string) => (
    <Reveal className="mb-10 md:mb-14">
      <p className={`text-xs font-mono font-semibold tracking-[0.18em] uppercase ${accentCls} mb-3`}>// {eyebrow}</p>
      <h2 className="font-mono text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
        <RevealText text={title} /> <RevealText text={accentWord} className={muted} delay={0.1} />
      </h2>
      {lead && <p className={`${muted} text-base md:text-lg mt-5 max-w-2xl leading-relaxed`}>{lead}</p>}
    </Reveal>
  )

  const liveCount = registry.stores.filter((s) => s.status === 'live').length
  const cc = CHANGELOG_COPY[locale]
  const changelogTotal = CHANGELOG.length

  return (
    <>
      <SEOHead title={`${c.meta.title} — ${t('menuPage.designNames.terminal')}`} description={c.meta.description} canonical="https://www.maxfolio.dev/terminal" />
      {/* sibling wrapper for the modal, same reasoning as Neo: fixed positioning needs to escape any
          ancestor transform, so it renders outside the main `.theme-terminal` tree but still scoped
          under it (display:contents) so the modal's --term-* var reads resolve. */}
      <div className="theme-terminal contents" data-accent={accent}>
        <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="terminal" initialMessage={contactPrefill} />
      </div>

      <div className="theme-terminal term-grid-bg min-h-screen font-mono [overflow-x:clip]" data-accent={accent} role="document">
        {/* Top bar: brand mark, bracket nav (desktop), language + accent toggle + contact CTA. The
            same bracket nav repeats, smaller, on its own scrollable row for phones. */}
        <header className="fixed top-0 inset-x-0 z-40 border-b border-[var(--term-line)] bg-[var(--term-bg)]/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex h-14 items-center justify-between gap-4 px-4">
            <TransitionLink to="/terminal" transitionColor="#0a0d0a" transitionAccent="#39ff88" transitionLabel="Terminal" className={`text-sm font-bold ${accentCls}`}>
              MB<span className={muted}>$</span>
            </TransitionLink>
            <div className="hidden md:block">
              <BracketNav size="sm" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language selector stays visible at every width (390px included) — a phone visitor
                  can switch locale exactly like a desktop one; only the accent label and the
                  contact CTA's text shrink away below `sm` to keep the row on one line. */}
              <div className="inline-flex items-center gap-1" role="radiogroup" aria-label={t('language.selector.ariaLabel')}>
                {supportedLocales.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={opt === locale}
                    onClick={() => setLocale(opt)}
                    className={`border px-1.5 py-0.5 text-[10px] font-mono transition-colors ${opt === locale ? `border-[var(--term-accent)] ${accentCls}` : `border-[var(--term-line)] ${muted}`}`}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAccent(accent === 'green' ? 'amber' : 'green')}
                aria-label={accent === 'green' ? 'Switch to amber phosphor' : 'Switch to green phosphor'}
                aria-pressed={accent === 'amber'}
                className="flex items-center gap-1.5 border border-[var(--term-line)] px-2 py-1 text-[10px] font-mono uppercase"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--term-accent)' }} aria-hidden="true" />
                <span className="hidden sm:inline">{accent}</span>
              </button>
              <button type="button" onClick={() => openContact()} aria-label={c.hero.ctaContact} className={`inline-flex items-center gap-1.5 border border-[var(--term-accent)] px-2 sm:px-3 py-1.5 text-xs font-semibold ${accentCls}`}>
                {Icon.mail} <span className="hidden sm:inline">{c.hero.ctaContact}</span>
              </button>
            </div>
          </div>
          <div className="md:hidden overflow-x-auto no-scrollbar border-t border-[var(--term-line)] px-4">
            <div className="py-2">
              <BracketNav size="sm" />
            </div>
          </div>
        </header>

        <main id="main-content" className="pt-24 md:pt-16">
          {/* HERO — boot sequence, ASCII logotype, bracket nav echo + CTAs */}
          <section id="hero" className="term-scanlines px-4 pb-16 pt-10 md:pb-24 md:pt-16" aria-labelledby="hero-heading">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-start">
                <div className="lg:col-span-8">
                  <h1 id="hero-heading" className="sr-only">
                    {registry.personal.name} — {c.hero.eyebrow}
                  </h1>
                  {!bootDone && (
                    <button type="button" onClick={skipBoot} className={`mb-4 border border-[var(--term-line)] px-2 py-1 text-[11px] uppercase ${muted}`}>
                      [skip]
                    </button>
                  )}
                  <div className="space-y-2.5 text-lg md:text-xl" aria-label={`${registry.personal.name}. ${c.hero.eyebrow}. Medellín, CO. ${c.hero.availability}.`}>
                    {bootLines.map((line, i) => {
                      const revealed = i < revealCount
                      return (
                        <div
                          key={line.key}
                          className="term-boot-line"
                          style={{ clipPath: revealed ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)', transition: reduced || bootDone ? 'none' : `clip-path 0.6s steps(28, end)` } as CSSProperties}
                          aria-hidden={i >= revealCount ? true : undefined}
                        >
                          <span className={muted}>{line.label}</span> <span>{line.value}</span>
                          {line.key === 'location' && (
                            <span className={`${muted} ml-2`} aria-live="off">
                              {clock}
                            </span>
                          )}
                          {i === revealCount - 1 && !bootDone && <span className="term-cursor blink" aria-hidden="true" />}
                        </div>
                      )
                    })}
                  </div>

                  <div className={`mt-8 transition-opacity duration-500 ${bootDone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <BracketNav />
                    <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <button type="button" onClick={() => openContact()} className={`inline-flex items-center gap-2 border border-[var(--term-accent)] px-5 py-3 text-sm font-semibold ${accentCls}`}>
                        {Icon.mail} {c.hero.ctaPrimary}
                      </button>
                      <a href={registry.personal.cv} download className={`inline-flex items-center gap-1.5 border border-[var(--term-line)] px-5 py-3 text-sm font-semibold ${muted}`}>
                        {c.hero.ctaCv}
                      </a>
                      <a href="#shopify" className={`inline-flex items-center gap-1 text-sm font-semibold ${accentCls}`}>
                        {c.hero.ctaSecondary} {Icon.down}
                      </a>
                    </div>
                    <p className={`${muted} mt-4 text-xs max-w-md`}>{c.hero.ctaNote}</p>
                  </div>
                </div>

                <div className={`lg:col-span-4 transition-opacity duration-700 delay-150 ${bootDone ? 'opacity-100' : 'opacity-0'}`}>
                  <pre className="term-ascii text-[9px] leading-tight sm:text-xs md:text-sm" aria-hidden="true">
                    {ASCII_MB}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* STAT BAND — data-terminal readout, real registry.stats */}
          <section className="px-4 pb-16 md:pb-24">
            <div className="max-w-5xl mx-auto">
              <StatBand skin={skin} />
            </div>
          </section>

          {/* TICKER — tail -f style log of the storefront fleet */}
          <section className="px-4 pb-16 md:pb-24" aria-label={c.sections.now.label}>
            <div className="max-w-5xl mx-auto mb-6 flex items-center gap-2 text-xs">
              <span className={muted}>$</span>
              <span>tail -f fleet.log</span>
              <span className={muted}>— {c.sections.now.live.replace('{n}', String(liveCount))}</span>
            </div>
            <Ticker
              variant="stock-ticker"
              duration={40}
              label={c.sections.now.band}
              items={registry.stores.filter((s) => !s.legacy)}
              keyOf={(s) => s.slug}
              itemClassName="flex shrink-0 items-baseline gap-2 whitespace-nowrap px-5 py-2 text-sm"
              renderItem={(s) => (
                <>
                  <span className={muted}>$</span>
                  <span>deploy</span>
                  <span className="font-semibold">{s.name}</span>
                  <span className={accentCls}>[{s.status === 'live' ? 'OK' : 'DEV'}]</span>
                </>
              )}
            />
          </section>

          {/* EXPERIENCE */}
          <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto border border-[var(--term-line)] p-6 md:p-10">
              <Experience skin={skin} heading={Heading} />
            </div>
          </section>

          {/* YEARS — ascii unit bars */}
          <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Years skin={skin} heading={Heading} variant="ascii" />
              </Suspense>
            </div>
          </section>

          {/* PROCESS */}
          <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending />}>
                <Process skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* SHOPIFY INDEX + SHEET */}
          <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto border border-[var(--term-line)] p-6 md:p-10">
              <Suspense fallback={<Pending />}>
                <ShopifyWork skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* SKILLS — a df -h style usage readout above the shared tool-tile grid */}
          <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <Reveal className="mb-8 max-w-xl overflow-x-auto no-scrollbar">
                <p className={`text-xs mb-2 ${muted}`}>$ df -h</p>
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className={`${muted} text-left`}>
                      <th className="pr-4 py-1 font-normal">FILESYSTEM</th>
                      <th className="pr-4 py-1 font-normal">SIZE</th>
                      <th className="py-1 font-normal">MOUNTED ON</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--term-line)]">
                      <td className="pr-4 py-1">liquid</td>
                      <td className={`pr-4 py-1 tabular-nums ${accentCls}`}>{fleetLiquidLines.toLocaleString('en-US')} ln</td>
                      <td className="py-1">/shopify/theme</td>
                    </tr>
                    <tr className="border-t border-[var(--term-line)]">
                      <td className="pr-4 py-1">typescript</td>
                      <td className={`pr-4 py-1 tabular-nums ${accentCls}`}>{fleetIslandLines.toLocaleString('en-US')} ln</td>
                      <td className="py-1">/app/islands</td>
                    </tr>
                    <tr className="border-t border-[var(--term-line)]">
                      <td className="pr-4 py-1">fleet</td>
                      <td className={`pr-4 py-1 tabular-nums ${accentCls}`}>{fleetStoreCount}</td>
                      <td className="py-1">/stores</td>
                    </tr>
                  </tbody>
                </table>
              </Reveal>
              <Suspense fallback={<Pending />}>
                <Skills skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* CHANGELOG — this site's own real git history, generated at build time */}
          <section id="changelog" className="px-4 py-12 md:py-16 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
              {Heading(cc.eyebrow, cc.title, cc.accent, cc.lead)}
              <ol className={`border-t divide-y ${skin.line} ${skin.divider}`}>
                {CHANGELOG.map((entry, i) => (
                  <m.li
                    key={entry.hash}
                    className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-4"
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04, ease: EASE }}
                  >
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${accentCls}`}>v{changelogTotal - i}</span>
                    <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{entry.date}</span>
                    <span className="text-sm">{entry.subject}</span>
                    <span className={`ml-auto shrink-0 text-xs tabular-nums ${muted}`}>{entry.hash}</span>
                  </m.li>
                ))}
              </ol>
              <p className={`${muted} mt-4 text-xs`}>{cc.source}</p>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<Pending h="min-h-[40vh]" />}>
                <Faq skin={skin} heading={Heading} />
              </Suspense>
            </div>
          </section>

          {/* CONTACT — a decorative command-line affordance above the real form */}
          <section className="px-4 py-14 md:py-20">
            <div className="max-w-5xl mx-auto">
              <p className={`mb-6 font-mono text-sm ${muted}`} aria-hidden="true">
                <span className={accentCls}>{'>'}</span> send_message --to=max
                <span className="term-cursor blink" aria-hidden="true" />
              </p>
              <Suspense fallback={<Pending />}>
                <Contact skin={skin} ctaClass={`inline-flex items-center gap-2 border border-[var(--term-accent)] px-6 py-3 text-sm font-semibold ${accentCls}`} onContact={openContact} fieldClassName={`border-[var(--term-line)] bg-transparent placeholder:text-[var(--term-muted)] focus:border-[var(--term-accent)] !rounded-none`} />
              </Suspense>
            </div>
          </section>

          {/* Explore */}
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
              <div className="grid sm:grid-cols-3 gap-3">
                {otherDesigns('terminal').map((d) => (
                  <TransitionLink key={d.id} to={d.href} transitionColor={d.transitionColor} transitionAccent={d.transitionAccent} transitionLabel={t(d.nameKey)} className="border border-[var(--term-line)] block overflow-hidden">
                    <div className="h-28 overflow-hidden">
                      <d.Preview size="md" />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm">{t(d.nameKey)}</p>
                      <p className={`${muted} text-xs`}>{t(d.subtitleKey)}</p>
                    </div>
                  </TransitionLink>
                ))}
                <TransitionLink to={MENU.route} transitionColor="#171717" transitionAccent="#ffffff" transitionLabel={t(MENU.labelKey)} className="border border-[var(--term-line)] block overflow-hidden">
                  <div className="h-28 overflow-hidden bg-black flex items-center justify-center text-white text-xs font-semibold">{t(MENU.labelKey)}</div>
                  <div className="p-4">
                    <p className="font-semibold text-sm">{t(MENU.labelKey)}</p>
                    <p className={`${muted} text-xs`}>{t(MENU.subtitleKey)}</p>
                  </div>
                </TransitionLink>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-4 pb-10 pt-4 text-xs" role="contentinfo" aria-label="Site footer">
          <div className={`max-w-5xl mx-auto flex flex-col gap-3 border-t pt-8 md:flex-row md:items-baseline md:justify-between border-[var(--term-line)]`}>
            <p className={muted}>
              &copy; 2026 {registry.personal.name}. {c.footer.rights}
            </p>
            <p className={`${muted} md:text-center`}>{c.footer.stamp}</p>
            <a href="#hero" className={`${accentCls} inline-flex items-center gap-1 font-semibold`}>
              {c.footer.backToTop} ↑
            </a>
          </div>
        </footer>
      </div>
    </>
  )
}

export default function Terminal() {
  return <TerminalContent />
}
