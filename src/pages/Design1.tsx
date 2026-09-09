import { m, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import {
  ContactFormModal,
  ExploreDesignsBrutalist,
  CompanyLogo,
  MobileMenuBrutalist,
  LogoSelectorBrutalist,
  SEOHead,
  LanguageSelectorBrutalist,
  ShopifyWork,
  Gallery,
  StatBand,
  Process,
  Manifesto,
  Faq,
  Contact,
  Skills,
  Ticker,
} from '../components'
import { skins } from '../components/gallery'
import { Years } from '../components/sections/Years'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { designById } from '../data/designs'

// Theme Toggle - Brutalist Design
const ThemeToggle = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
  const { isDark, toggleTheme } = useTheme()

  const buttonSize = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <m.button
      onClick={toggleTheme}
      className={`relative ${buttonSize} flex items-center justify-center group`}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <m.div
        className={`absolute inset-0 border-2 transition-colors duration-200 ${
          isDark ? 'border-red-600 bg-red-600/10' : 'border-stone-900 bg-stone-900/5'
        }`}
      />
      <m.div
        className={`absolute top-0 left-0 w-2 h-2 ${isDark ? 'bg-red-600' : 'bg-stone-900'}`}
        animate={{ scale: isDark ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      />
      <m.div className="relative z-10" animate={{ scale: [1, 0.8, 1] }} transition={{ duration: 0.3 }} key={isDark ? 'dark' : 'light'}>
        {isDark ? (
          <svg className={`${iconSize} text-red-500`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className={`${iconSize} text-stone-700`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </m.div>
    </m.button>
  )
}

const MailIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const DownloadIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

function Design1Content() {
  const { isDark } = useTheme()
  const { t } = useI18n()
  const { strings: c, registry, formatPeriod } = useContent()
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [contactPrefill, setContactPrefill] = useState('')
  const [activeTab, setActiveTab] = useState<'work' | 'freelance'>('work')
  const openContact = (prefill?: string) => {
    setContactPrefill(prefill ?? '')
    setIsContactOpen(true)
  }

  // Dynamic favicon
  useDynamicFavicon('brutalist')

  const skin = skins.brutalist(isDark)
  const self = designById('brutalist')

  // Theme-aware classes
  const bgPrimary = isDark ? 'bg-stone-950' : 'bg-stone-100'
  const bgSecondary = isDark ? 'bg-stone-900' : 'bg-stone-200'
  const bgCard = isDark ? 'bg-stone-900' : 'bg-stone-100'
  const textPrimary = isDark ? 'text-stone-100' : 'text-stone-900'
  const textSecondary = isDark ? 'text-stone-300' : 'text-stone-600'
  const textMuted = isDark ? 'text-stone-500' : 'text-stone-500'
  const borderColor = isDark ? 'border-stone-800' : 'border-stone-300'
  const borderStrong = isDark ? 'border-stone-700' : 'border-stone-900'

  const navItems = [
    { label: t('nav.work'), href: '#work' },
    { label: t('nav.shopify'), href: '#shopify' },
    { label: t('nav.gallery'), href: '#gallery' },
    { label: t('nav.skills'), href: '#about' },
    { label: t('nav.contact'), href: '#contact' },
    { label: t('nav.otherStyles'), href: '#explore' },
  ]

  let sectionNo = 1
  const nextSection = () => `Section ${String(++sectionNo).padStart(2, '0')}`

  const BrutalHeading = (eyebrow: string, title: string, accent: string, lead?: string) => (
    <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12 md:mb-16">
      <span className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted}`}>{eyebrow}</span>
      <h2 className="font-editorial text-[12vw] md:text-[8vw] leading-[0.85] tracking-tight italic mt-4">
        {title}
        <br />
        <span className="not-italic text-red-600">{accent}</span>
      </h2>
      {lead && <p className={`${textSecondary} mt-6 max-w-2xl font-editorial text-xl italic leading-relaxed`}>{lead}</p>}
    </m.div>
  )

  const downloadCv = () => {
    const link = document.createElement('a')
    link.href = registry.personal.cv
    link.download = 'Maximiliano-Bustamante-CV.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      {/* SEO */}
      <SEOHead title={`${c.meta.title} — ${t(self.nameKey)}`} description={c.meta.description} canonical="https://www.maxfolio.dev/brutalist" />

      <div className={`min-h-screen ${bgPrimary} ${textPrimary} font-body overflow-x-hidden transition-colors duration-300`} role="document">
        {/* Contact Modal */}
        <ContactFormModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} variant="brutalist" isDark={isDark} initialMessage={contactPrefill} />

        {/* Navigation */}
        <nav
          className={`fixed top-0 left-0 right-0 z-40 ${isDark ? 'bg-stone-950/90' : 'bg-stone-100/90'} backdrop-blur-sm border-b-4 ${borderStrong} transition-colors duration-300`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <LogoSelectorBrutalist isDark={isDark} />
            </div>
            <div className="hidden lg:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.2em] h-10">
              {navItems.slice(0, 5).map((item) => (
                <a key={item.href} href={item.href} className={`inline-flex items-center h-10 leading-none ${textMuted} hover:text-red-600 transition-colors`}>
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsContactOpen(true)}
                className="hidden sm:flex items-center h-10 font-mono text-xs uppercase tracking-[0.2em] leading-none text-red-600 hover:text-red-500 transition-colors gap-2"
              >
                <span className="hidden sm:inline">{t('common.quickEmail')}</span>
                <MailIcon />
              </button>
              <div className="hidden lg:flex items-center gap-2">
                <LanguageSelectorBrutalist />
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggle size="sm" />
                <LanguageSelectorBrutalist size="sm" />
                <MobileMenuBrutalist isDark={isDark} onContactClick={() => setIsContactOpen(true)} navItems={navItems} />
              </div>
            </div>
          </div>
        </nav>

        {/* Hero - Editorial Spread */}
        <main id="main-content">
          <section className="min-h-screen pt-20 relative" aria-labelledby="hero-heading">
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              {/* Masthead */}
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className={`py-8 md:py-12 border-b-2 ${borderStrong}`}>
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                  <div>
                    <p className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted} mb-2`}>{c.hero.eyebrow}</p>
                    <h1 id="hero-heading" className="font-editorial text-[15vw] md:text-[10vw] leading-[0.8] tracking-tighter font-normal italic">
                      {registry.personal.firstName}
                    </h1>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-mono text-xs uppercase tracking-wider ${textMuted}`}>{c.location}</p>
                    <p className={`font-mono text-xs uppercase tracking-wider ${textMuted}`}>Est. 2022</p>
                  </div>
                </div>
              </m.div>

              {/* Main Grid */}
              <div className="grid grid-cols-12 gap-4 md:gap-6 py-8">
                <m.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="col-span-12 lg:col-span-8"
                >
                  <h2 className="font-editorial text-[10vw] md:text-[7vw] lg:text-[5.5vw] leading-[0.9] tracking-tight font-normal">
                    <span className="block">{c.hero.positioning}</span>
                  </h2>
                  <p className={`mt-6 max-w-2xl ${textSecondary} text-base md:text-lg leading-relaxed`}>{c.hero.lead}</p>
                </m.div>

                <m.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="col-span-12 lg:col-span-4 flex flex-col justify-end"
                >
                  <div className={`border-l-4 ${borderStrong} pl-4 grid grid-cols-2 lg:grid-cols-1 gap-4`}>
                    {registry.stats.slice(0, 4).map((stat) => (
                      <div key={stat.id} className="mb-2 lg:mb-4">
                        <span className="block font-editorial text-4xl md:text-5xl italic">{stat.value}</span>
                        <span className={`font-mono text-xs uppercase tracking-wider ${textMuted}`}>{c.stats[stat.id]}</span>
                      </div>
                    ))}
                  </div>
                </m.div>
              </div>

              {/* Feature Box */}
              <m.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className={`${isDark ? 'bg-red-950' : 'bg-stone-900'} text-stone-100 p-6 md:p-8 lg:p-12 my-8`}
              >
                <div className="grid grid-cols-12 gap-6 md:gap-8">
                  <div className="col-span-12 md:col-span-8">
                    <p className={`font-mono text-xs uppercase tracking-[0.3em] ${isDark ? 'text-red-400' : 'text-stone-500'} mb-4`}>
                      {t('sections.magazineProfile')}
                    </p>
                    <p className="font-editorial text-xl md:text-2xl lg:text-3xl italic leading-relaxed">"{c.experience['digitdeck-cto'].summary}"</p>
                    <p className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-red-400">
                      <span className="w-2 h-2 bg-red-500" />
                      {c.hero.availability}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col justify-between gap-6">
                    <div>
                      <p className={`font-mono text-xs uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-stone-500'} mb-2`}>{t('nav.contact')}</p>
                      <p className="text-base md:text-lg">{registry.personal.email}</p>
                      <p className="text-base md:text-lg">{registry.personal.phone}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setIsContactOpen(true)} className="flex-1 border-2 border-red-600 px-6 py-3 hover:bg-red-600 transition-colors group">
                        <span className="font-mono text-xs uppercase tracking-wider text-red-500 group-hover:text-white">{c.hero.ctaContact}</span>
                      </button>
                      <button
                        onClick={downloadCv}
                        className="flex-1 border-2 border-stone-100 px-6 py-3 hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center justify-center gap-2"
                      >
                        <DownloadIcon />
                        <span className="font-mono text-xs uppercase tracking-wider">{c.hero.ctaCv}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </m.div>
            </div>
          </section>

          {/* Fleet ticker — two counter-rotating rows, brutalist mono stamp */}
          <div className={`overflow-hidden border-y-4 ${borderStrong} ${bgPrimary} py-5`}>
            <Ticker
              variant="stacked"
              duration={34}
              label={c.sections.now.band}
              items={registry.stores.filter((st) => !st.legacy)}
              keyOf={(st) => st.slug}
              itemClassName={`flex shrink-0 items-center gap-3 whitespace-nowrap px-6 font-mono text-lg uppercase tracking-[0.1em] md:text-2xl ${textPrimary}`}
              renderItem={(st) => (
                <>
                  <span className={`h-2.5 w-2.5 ${st.status === 'live' ? 'bg-red-600' : 'bg-stone-500'}`} aria-hidden="true" />
                  {st.name}
                </>
              )}
            />
          </div>

          {/* Stat band — the work, in numerals, on a hairline grid */}
          <section className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <StatBand skin={skin} />
            </div>
          </section>

          {/* Work Section */}
          <section id="work" className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12 md:mb-16">
                <span className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted}`}>{nextSection()}</span>
                <h2 className="font-editorial text-[12vw] md:text-[8vw] leading-[0.85] tracking-tight italic mt-4">
                  {c.sections.experience.title}
                  <br />
                  <span className="not-italic text-red-600">{c.sections.experience.titleAccent}</span>
                </h2>
              </m.div>

              {/* Tab Navigation */}
              <div className="flex gap-4 mb-8 md:mb-12">
                {(['work', 'freelance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-mono text-xs uppercase tracking-[0.2em] px-4 py-2 border-2 transition-colors ${
                      activeTab === tab ? 'bg-red-600 text-white border-red-600' : `${borderColor} ${textMuted} hover:border-red-600`
                    }`}
                  >
                    {tab === 'work' ? t('nav.companies') : t('nav.freelance')}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'work' && (
                  <m.div
                    key="work"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px ${isDark ? 'bg-stone-700' : 'bg-stone-900'}`}
                  >
                    {registry.experience.map((job, index) => (
                      <m.article
                        key={job.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={`${bgCard} p-6 md:p-8 group ${isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-200'} transition-colors relative`}
                      >
                        {job.logo && (
                          <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-lg p-2 border border-stone-200">
                            <CompanyLogo src={job.logo} alt={job.company} />
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-4 pr-16">
                          <span className={`font-mono text-xs ${textMuted} uppercase tracking-wider`}>{formatPeriod(job.start, job.end)}</span>
                        </div>
                        <span
                          className={`font-editorial text-4xl md:text-5xl italic ${isDark ? 'text-stone-700' : 'text-stone-300'} group-hover:text-red-600 transition-colors block mb-4`}
                        >
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <h3 className="font-editorial text-xl md:text-2xl italic mb-2">{c.experience[job.id].title}</h3>
                        <p className="font-mono text-sm uppercase tracking-wider text-red-600 mb-4">{job.company}</p>
                        <p className={`text-sm ${textSecondary} mb-4 leading-relaxed`}>{c.experience[job.id].summary}</p>

                        <div className="flex gap-4 mb-4">
                          {job.metrics.slice(0, 2).map((metric) => (
                            <div key={metric.id}>
                              <span className="font-editorial text-lg italic">{metric.value}</span>
                              <span className={`block text-xs ${textMuted}`}>{c.experience[job.id].metricLabels[metric.id]}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {job.technologies.slice(0, 4).map((tech) => (
                            <span key={tech} className={`font-mono text-xs px-2 py-1 ${bgSecondary} ${textMuted}`}>
                              {tech}
                            </span>
                          ))}
                        </div>

                        {job.website && (
                          <a href={job.website} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-red-600 hover:underline">
                            {c.sections.experience.visit} →
                          </a>
                        )}
                      </m.article>
                    ))}
                  </m.div>
                )}

                {activeTab === 'freelance' && (
                  <m.div key="freelance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                    {registry.personalProjects.map((project, index) => (
                      <m.a
                        key={project.id}
                        href={project.url ?? project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        className={`border-t ${borderColor} pt-6 grid grid-cols-12 gap-4 group ${isDark ? 'hover:bg-stone-900' : 'hover:bg-stone-50'} -mx-4 px-4 transition-colors`}
                      >
                        <div className="col-span-2 lg:col-span-1">
                          <span
                            className={`font-editorial text-4xl md:text-5xl italic ${isDark ? 'text-stone-700' : 'text-stone-300'} group-hover:text-red-600 transition-colors`}
                          >
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="col-span-10 lg:col-span-4">
                          <h3 className="font-editorial text-2xl md:text-3xl italic group-hover:text-red-600 transition-colors">{project.name}</h3>
                          <p className="font-mono text-xs uppercase tracking-wider text-red-600 mt-2">{c.projects[project.id]?.tagline}</p>
                        </div>
                        <div className="col-span-12 lg:col-span-5 lg:col-start-7">
                          <p className={`${textSecondary} leading-relaxed`}>{c.projects[project.id]?.description}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {project.stack.map((tech) => (
                              <span key={tech} className={`font-mono text-xs px-3 py-1 border ${borderColor} ${textMuted}`}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-12 lg:col-span-1 text-right">
                          <span className={`font-mono text-xs ${textMuted}`}>{project.year}</span>
                        </div>
                      </m.a>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Years: the career year by year, opened by the unit chart of shipped work */}
          <section className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <Years skin={skin} heading={(e, ti, a, l) => BrutalHeading(nextSection() + ' · ' + e, ti, a, l)} />
            </div>
          </section>

          {/* Process: how a store ships, as a numbered stepper */}
          <section className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <Process skin={skin} heading={(e, ti, a, l) => BrutalHeading(nextSection() + ' · ' + e, ti, a, l)} canvas={bgPrimary} />
            </div>
          </section>

          {/* Shopify Work */}
          <section className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <ShopifyWork skin={skin} heading={(e, ti, a, l) => BrutalHeading(nextSection() + ' · ' + e, ti, a, l)} />
            </div>
          </section>

          {/* Gallery */}
          <section className={`py-16 md:py-24 border-t-4 ${borderStrong} ${bgSecondary}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <Gallery skin={skin} heading={(e, ti, a, l) => BrutalHeading(nextSection() + ' · ' + e, ti, a, l)} />
            </div>
          </section>

          {/* Manifesto — inverted typographic band */}
          <Manifesto skin={skin} />

          {/* Skills Section — the ledger + narrative sentences */}
          <section id="about" className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <Skills skin={skin} heading={(e, ti, a, l) => BrutalHeading(nextSection() + ' · ' + e, ti, a, l)} />
            </div>
          </section>

          {/* FAQ */}
          <section className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <Faq skin={skin} heading={(e, ti, a, l) => BrutalHeading(nextSection() + ' · ' + e, ti, a, l)} />
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className={`py-16 md:py-24 border-t-4 ${borderStrong} bg-red-600 text-white`}>
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <Contact
                skin={{ ...skin, title: 'text-white', body: 'text-red-50', muted: 'text-red-100', accent: 'text-white underline', line: 'border-red-300/40', accentBg: 'bg-stone-900' }}
                ctaClass="press inline-flex items-center justify-center font-mono text-sm uppercase tracking-wider bg-white text-red-600 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors"
                onContact={openContact}
              />
              <div className="mt-10 flex justify-center gap-8 md:gap-12">
                <button
                  onClick={downloadCv}
                  className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider border-2 border-white px-6 py-3 hover:bg-white hover:text-red-600 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  {c.hero.ctaCv}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Explore Other Designs */}
        <ExploreDesignsBrutalist isDark={isDark} />

        {/* Footer */}
        <footer className={`py-8 border-t-4 ${borderStrong} ${bgPrimary}`} role="contentinfo" aria-label="Site footer">
          <div className="max-w-[1800px] mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`font-mono text-xs ${textMuted}`}>
              © 2026 {registry.personal.name}. {c.footer.rights}
            </p>
            <p className={`font-mono text-xs ${textMuted}`}>
              <span className="text-red-600">{t(self.nameKey)}</span> — {t(self.subtitleKey)}
            </p>
          </div>
        </footer>

        {/* Mobile FAB */}
        <m.button
          onClick={() => setIsContactOpen(true)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-30"
          whileTap={{ scale: 0.9 }}
          aria-label="Open contact form"
        >
          <MailIcon className="w-6 h-6" />
        </m.button>
      </div>
    </>
  )
}

export default function Design1() {
  return (
    <ThemeProvider storageKey="brutalist-theme" defaultTheme="dark">
      <Design1Content />
    </ThemeProvider>
  )
}
