import { m, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { LanguageSelectorMenu, ThemeToggle, TransitionLink, SEOHead } from '../components'
import { useDynamicFavicon, useI18n } from '../hooks'
import { personal } from '../data/registry'
import { designs, defaultDesign, type DesignId } from '../data/designs'

// One rotating word per design, in registry order (apple, luxury, brutalist).
const visionStyles: { id: DesignId; key: string; className: string }[] = [
  { id: 'apple', key: 'menuPage.visionStyles.clean', className: 'font-body font-semibold tracking-tight text-[#0071e3]' },
  { id: 'luxury', key: 'menuPage.visionStyles.elegant', className: 'font-display italic text-[#C9A962]' },
  { id: 'brutalist', key: 'menuPage.visionStyles.bold', className: 'font-editorial font-black not-italic text-red-500 tracking-tighter uppercase' },
]

function HomeContent() {
  const { isDark } = useTheme()
  const { t } = useI18n()
  const [hoveredDesign, setHoveredDesign] = useState<DesignId | null>(null)
  const [autoIndex, setAutoIndex] = useState(0)

  // Dynamic favicon
  useDynamicFavicon('menu')

  useEffect(() => {
    if (hoveredDesign !== null) return
    const interval = setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % visionStyles.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [hoveredDesign])

  const activeVisionIndex = hoveredDesign !== null
    ? Math.max(0, visionStyles.findIndex((v) => v.id === hoveredDesign))
    : autoIndex

  const bg = isDark ? 'bg-neutral-950' : 'bg-neutral-50'
  const text = isDark ? 'text-white' : 'text-neutral-900'
  const textMuted = isDark ? 'text-neutral-500' : 'text-neutral-500'
  const textSecondary = isDark ? 'text-neutral-400' : 'text-neutral-600'
  const border = isDark ? 'border-neutral-800' : 'border-neutral-200'
  const cardBg = isDark ? 'bg-neutral-900/50' : 'bg-white'

  return (
    <>
      {/* SEO */}
      <SEOHead
        title={t('menuPage.seoTitle')}
        description={t('menuPage.seoDescription')}
        canonical="https://www.maxfolio.dev/menu"
      />

      <div className={`min-h-screen ${bg} ${text} font-body transition-colors duration-300`} role="document">
        {/* Header */}
        <header className={`border-b ${border} transition-colors duration-300`} role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <TransitionLink
            to={defaultDesign.href}
            transitionColor={defaultDesign.transitionColor}
            transitionAccent={defaultDesign.transitionAccent}
            transitionLabel={t(defaultDesign.nameKey)}
            className={`inline-flex items-center h-10 text-xs uppercase tracking-[0.2em] leading-none ${textMuted} hover:${text} transition-colors`}
          >
            {t('menuPage.mainPortfolio')}
          </TransitionLink>
          <div className="flex items-center gap-4">
            <span className={`hidden sm:block text-xs leading-none ${textMuted}`}>{personal.name}</span>
            <LanguageSelectorMenu />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">

        {/* Hero Section */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 mb-6 border ${border} ${cardBg}`}
          >
            <svg className={`w-3.5 h-3.5 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className={`text-[10px] sm:text-xs tracking-[0.3em] uppercase ${textMuted}`}>
              {t('menuPage.designSelector')}
            </span>
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-medium tracking-tight leading-[1]">
              {t('menuPage.oneDeveloper')}
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-medium tracking-tight leading-[1] mt-1 sm:mt-2 h-[1.15em] flex items-center">
              <AnimatePresence mode="wait">
                <m.span
                  key={activeVisionIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className={visionStyles[activeVisionIndex].className}
                >
                  {t(visionStyles[activeVisionIndex].key)}
                </m.span>
              </AnimatePresence>
              <span className="ml-2 sm:ml-3">{t('menuPage.vision')}</span>
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-sm sm:text-base ${textSecondary} max-w-lg leading-relaxed`}
          >
            {t('menuPage.subtitle')}
          </m.p>
        </section>

        {/* Divider */}
        <m.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`h-px ${border} mb-12 sm:mb-16 origin-left`}
        />

        {/* Design Cards */}
        <section>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between gap-4 mb-6 sm:mb-8"
          >
            <h2 className={`text-xs uppercase tracking-[0.3em] ${textMuted}`}>
              {t('menuPage.availableDesigns')}
            </h2>
            <span className={`text-xs ${textMuted}`}>
              {designs.length} {t('menuPage.options')}
            </span>
          </m.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {designs.map((design, index) => {
              const isHovered = hoveredDesign === design.id
              const PreviewComponent = design.Preview
              const designName = t(design.nameKey)
              const designSubtitle = t(design.subtitleKey)

              return (
                <m.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <TransitionLink
                    to={design.href}
                    transitionColor={design.transitionColor}
                    transitionAccent={design.transitionAccent}
                    transitionLabel={designName}
                    onMouseEnter={() => setHoveredDesign(design.id)}
                    onMouseLeave={() => setHoveredDesign(null)}
                    className={`group block ${cardBg} border ${border} overflow-hidden transition-all duration-300 ${
                      isHovered ? 'shadow-xl scale-[1.01]' : ''
                    }`}
                    style={{ borderColor: isHovered ? design.accent + '60' : undefined }}
                  >
                    {/* Preview */}
                    <div className="relative h-36 sm:h-40 md:h-44 overflow-hidden">
                      <PreviewComponent isHovered={isHovered} size="lg" />

                      {design.isDefault && (
                        <div
                          className="absolute top-3 right-3 px-2 py-1 text-[9px] font-medium text-white"
                          style={{ backgroundColor: design.accent }}
                        >
                          {t('menuPage.default')}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="text-lg sm:text-xl font-display font-medium transition-colors duration-300"
                          style={{ color: isHovered ? design.accent : undefined }}
                        >
                          {designName}
                        </h3>
                        <m.svg
                          animate={{ x: isHovered ? 0 : -6, opacity: isHovered ? 1 : 0 }}
                          className="w-4 h-4"
                          style={{ color: design.accent }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </m.svg>
                      </div>

                      <p className={`text-xs sm:text-sm ${textMuted}`}>
                        {designSubtitle}
                      </p>
                    </div>
                  </TransitionLink>
                </m.div>
              )
            })}
          </div>
        </section>

        {/* Bottom Note */}
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={`mt-12 sm:mt-16 pt-8 sm:pt-10 border-t ${border}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-sm">
              <p className={`text-xs uppercase tracking-[0.2em] ${textMuted} mb-2`}>{t('menuPage.whyVersions')}</p>
              <p className={`text-sm ${textSecondary}`}>{t('menuPage.whyVersionsDesc')}</p>
            </div>
            <TransitionLink
              to={defaultDesign.href}
              transitionColor={defaultDesign.transitionColor}
              transitionAccent={defaultDesign.transitionAccent}
              transitionLabel={t(defaultDesign.nameKey)}
              className={`inline-flex items-center gap-2 text-sm ${textSecondary} hover:${text} transition-colors group`}
            >
              <span>{t('menuPage.startWithDefault')}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </TransitionLink>
          </div>
        </m.section>
      </main>

      {/* Footer */}
      <footer
        className={`border-t ${border} mt-8 sm:mt-12`}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className={`text-sm ${text} mb-1`}>{personal.name}</p>
            <a
              href={`mailto:${personal.email}`}
              className={`text-xs ${textMuted} hover:${text} transition-colors`}
              aria-label={`Email ${personal.name}`}
            >
              {personal.email}
            </a>
          </div>
          <nav aria-label="Social links">
            <div className="flex gap-6">
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs ${textMuted} hover:${text} transition-colors`}
                aria-label="LinkedIn profile (opens in new tab)"
              >
                LinkedIn
              </a>
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs ${textMuted} hover:${text} transition-colors`}
                aria-label="GitHub profile (opens in new tab)"
              >
                GitHub
              </a>
            </div>
          </nav>
        </div>
      </footer>
    </div>
    </>
  )
}

export default function Home() {
  return (
    <ThemeProvider storageKey="home-theme" defaultTheme="dark">
      <HomeContent />
    </ThemeProvider>
  )
}
