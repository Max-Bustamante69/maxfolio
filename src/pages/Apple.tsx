import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import {
  ContactFormModal,
  SEOHead,
  MobileMenuApple,
  LanguageSelectorApple,
  LogoSelectorApple,
  ShopifyWork,
  Gallery,
  CompanyLogo,
  TransitionLink,
  MenuPreview,
} from '../components'
import { skins } from '../components/gallery'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { defaultDesign, otherDesigns, MENU } from '../data/designs'
import type { SkillGroupId } from '../data/registry'

// Strong ease-out: instant response, soft landing.
const EASE = [0.23, 1, 0.32, 1] as const

const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: EASE }}
    className={className}
  >
    {children}
  </motion.div>
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
}

function AppleContent() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useI18n()
  const { strings: c, registry, formatPeriod } = useContent()
  const [contactOpen, setContactOpen] = useState(false)
  const [job, setJob] = useState(registry.experience[0])
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
        {title} <span className={muted}>{accent}</span>
      </h2>
      {lead && <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed`}>{lead}</p>}
    </Reveal>
  )

  const primaryBtn = 'press inline-flex items-center justify-center rounded-full bg-apple-blue px-6 py-3 text-sm font-medium text-white hover:bg-apple-blueHover'

  return (
    <>
      <SEOHead
        title={c.meta.title}
        description={c.meta.description}
        canonical="https://www.maxfolio.dev"
        ogImage="https://www.maxfolio.dev/og-image.png"
      />
      <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="apple" isDark={isDark} />

      <div className={`min-h-screen font-sf ${bg} transition-colors duration-300 overflow-x-hidden`} role="document">
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
          {/* Hero */}
          <section id="hero" className="px-4 pt-20 md:pt-28 pb-14 md:pb-20 text-center scroll-mt-20" aria-labelledby="hero-heading">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-sm font-semibold ${blue}`}
            >
              {c.hero.eyebrow}
            </motion.p>
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
              className="mx-auto mt-4 max-w-4xl text-5xl md:text-7xl lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.02]"
            >
              {registry.personal.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className={`mx-auto mt-5 max-w-2xl text-xl md:text-2xl ${muted} leading-snug tracking-[-0.01em]`}
            >
              {c.hero.positioning}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed"
            >
              {c.hero.lead}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button type="button" onClick={() => setContactOpen(true)} className={primaryBtn}>
                {c.hero.ctaContact}
              </button>
              <a href={registry.personal.cv} download className={`${blue} text-sm font-medium`}>
                {c.hero.ctaCv} ›
              </a>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-6 inline-flex items-center gap-2 text-xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-[#34c759]" />
              {c.hero.availability}
            </motion.p>
          </section>

          {/* Stats bento */}
          <section className="px-4 pb-20 md:pb-28" aria-label={c.sections.experience.eyebrow}>
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
              {registry.stats.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.04} className={`${surface} rounded-[22px] p-6 md:p-8`}>
                  <p className="text-4xl md:text-5xl font-semibold tracking-[-0.03em]">{s.value}</p>
                  <p className={`${muted} text-sm mt-2`}>{c.stats[s.id]}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className={`px-4 py-20 md:py-28 ${surface} scroll-mt-20`}>
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.experience.eyebrow, c.sections.experience.title, c.sections.experience.titleAccent)}
              <div className="grid lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 -mx-4 px-4 lg:mx-0 lg:px-0" role="tablist">
                  {registry.experience.map((e) => {
                    const active = job.id === e.id
                    return (
                      <button
                        key={e.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setJob(e)}
                        className={`press shrink-0 lg:shrink w-[260px] lg:w-auto text-left rounded-[16px] px-4 py-3 transition-colors duration-150 ${
                          active ? tile : isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                        }`}
                      >
                        <p className="text-sm font-semibold leading-snug">{c.experience[e.id].title}</p>
                        <p className={`${muted} text-xs mt-0.5`}>
                          {e.company} · {formatPeriod(e.start, e.end)}
                        </p>
                      </button>
                    )
                  })}
                </div>
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={`lg:col-span-8 rounded-[22px] ${tile} p-6 md:p-8`}
                  role="tabpanel"
                >
                  <div className="flex items-start gap-4">
                    {job.logo && (
                      <div className="w-12 h-12 rounded-[12px] bg-white p-1.5 shrink-0 shadow-[0_1px_6px_rgba(0,0,0,0.08)]">
                        <CompanyLogo src={job.logo} alt={job.company} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold tracking-tight leading-snug">{c.experience[job.id].title}</h3>
                      <p className={`${muted} text-sm mt-0.5`}>
                        {job.company} · {job.location} · {formatPeriod(job.start, job.end)}
                        {job.end === null && <span className={`ml-2 font-medium ${blue}`}> · {c.badges.current}</span>}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 leading-relaxed">{c.experience[job.id].summary}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {job.metrics.map((m) => (
                      <div key={m.id} className={`${surface} rounded-[14px] p-3 text-center`}>
                        <p className="text-lg md:text-xl font-semibold tracking-tight">{m.value}</p>
                        <p className={`${muted} text-[11px] leading-tight`}>{c.experience[job.id].metricLabels[m.id]}</p>
                      </div>
                    ))}
                  </div>
                  <p className={`mt-6 text-xs font-semibold tracking-[0.15em] uppercase ${blue}`}>{c.sections.experience.achievements}</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {c.experience[job.id].highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className={`${blue} mt-[3px]`}>•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {job.technologies.map((tech) => (
                      <span key={tech} className={skin.chip}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  {job.website && (
                    <a href={job.website} target="_blank" rel="noopener noreferrer" className={`${blue} text-sm mt-5 inline-block`}>
                      {c.sections.experience.visit} ›
                    </a>
                  )}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Shopify work */}
          <section className="px-4 py-20 md:py-28">
            <div className="max-w-5xl mx-auto">
              <ShopifyWork skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Gallery */}
          <section className={`px-4 py-20 md:py-28 ${surface}`}>
            <div className="max-w-5xl mx-auto">
              <Gallery skin={skin} heading={Heading} />
            </div>
          </section>

          {/* Projects */}
          <section id="projects" className="px-4 py-20 md:py-28 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.projects.eyebrow, c.sections.projects.title, c.sections.projects.titleAccent)}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {registry.personalProjects.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 0.04} className="h-full">
                    <a
                      href={p.url ?? p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`lift block h-full ${surface} rounded-[22px] p-6`}
                    >
                      <p className={`${muted} text-xs`}>{p.year}</p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight">{p.name}</h3>
                      <p className={`${blue} text-sm`}>{c.projects[p.id]?.tagline}</p>
                      <p className="mt-2 text-sm leading-relaxed">{c.projects[p.id]?.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.stack.map((s) => (
                          <span key={s} className={`${skin.chip} ${isDark ? '' : 'bg-white'}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Skills */}
          <section id="skills" className={`px-4 py-20 md:py-28 ${surface} scroll-mt-20`}>
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.skills.eyebrow, c.sections.skills.title, c.sections.skills.titleAccent)}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(registry.skillGroups) as SkillGroupId[]).map((g, i) => (
                  <Reveal key={g} delay={i * 0.04} className={`rounded-[22px] ${tile} p-6`}>
                    <h3 className={`text-xs font-semibold tracking-[0.2em] uppercase ${blue}`}>{c.sections.skills.groups[g]}</h3>
                    <ul className="mt-3 space-y-1 text-sm">
                      {registry.skillGroups[g].map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="px-4 py-20 md:py-28 scroll-mt-20">
            <Reveal className={`max-w-4xl mx-auto rounded-[28px] ${surface} p-8 md:p-14 text-center`}>
              <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${blue}`}>{c.sections.contact.eyebrow}</p>
              <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.025em] leading-[1.05]">
                {c.sections.contact.title} <span className={muted}>{c.sections.contact.titleAccent}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed">{c.sections.contact.lead}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-[#34c759]" />
                {c.sections.contact.status}
              </p>
              <p className={`${muted} text-sm mt-1`}>{c.sections.contact.note}</p>
              <div className="mt-8">
                <button type="button" onClick={() => setContactOpen(true)} className={`${primaryBtn} px-7 py-3.5`}>
                  {c.sections.contact.cta}
                </button>
              </div>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className={`${muted} text-xs`}>{c.sections.contact.email}</p>
                  <a href={`mailto:${registry.personal.email}`} className={blue}>
                    {registry.personal.email}
                  </a>
                </div>
                <div>
                  <p className={`${muted} text-xs`}>{c.sections.contact.phone}</p>
                  <a href={registry.personal.phoneHref} className={blue}>
                    {registry.personal.phone}
                  </a>
                </div>
                <div>
                  <p className={`${muted} text-xs`}>{c.sections.contact.location}</p>
                  <p>{c.location}</p>
                </div>
              </div>
              <div className="mt-8 flex justify-center gap-6 text-sm">
                <a href={registry.personal.linkedin} target="_blank" rel="noopener noreferrer" className={blue}>
                  LinkedIn ›
                </a>
                <a href={registry.personal.github} target="_blank" rel="noopener noreferrer" className={blue}>
                  GitHub ›
                </a>
              </div>
            </Reveal>
          </section>

          {/* Explore */}
          <section id="explore" className={`px-4 py-20 ${surface} scroll-mt-20`}>
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
                {c.sections.explore.viewing}: <span className={blue}>{t(defaultDesign.nameKey)}</span>
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
      <AppleContent />
    </ThemeProvider>
  )
}
