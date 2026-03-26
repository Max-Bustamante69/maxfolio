import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { ContactFormModal, ExploreDesignsBrutalist, CompanyLogo, MobileMenuBrutalist, LogoSelectorBrutalist, SEOHead, LanguageSelectorBrutalist } from '../components'
import { useDynamicFavicon, useI18n } from '../hooks'
import { 
  personalInfo, 
  hero,
  skills, 
  experience, 
  freelanceProjects, 
  stats,
  contact
} from '../data/portfolio-extended'

// Theme Toggle - Brutalist Design
const ThemeToggle = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
  const { isDark, toggleTheme } = useTheme()

  const buttonSize = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative ${buttonSize} flex items-center justify-center group`}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Bold square frame */}
      <motion.div 
        className={`absolute inset-0 border-2 transition-colors duration-200 ${
          isDark ? 'border-red-600 bg-red-600/10' : 'border-stone-900 bg-stone-900/5'
        }`}
        animate={{ rotate: isDark ? 0 : 0 }}
      />
      
      {/* Accent corner */}
      <motion.div 
        className={`absolute top-0 left-0 w-2 h-2 ${isDark ? 'bg-red-600' : 'bg-stone-900'}`}
        animate={{ scale: isDark ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Icon */}
      <motion.div
        className="relative z-10"
        animate={{ scale: [1, 0.8, 1] }}
        transition={{ duration: 0.3 }}
        key={isDark ? 'dark' : 'light'}
      >
        {isDark ? (
          <svg className={`${iconSize} text-red-500`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className={`${iconSize} text-stone-700`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  )
}


function Design1Content() {
  const { isDark } = useTheme()
  const { t } = useI18n()
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'work' | 'freelance'>('work')

  // Dynamic favicon
  useDynamicFavicon('brutalist')

  // Theme-aware classes
  const bgPrimary = isDark ? 'bg-stone-950' : 'bg-stone-100'
  const bgSecondary = isDark ? 'bg-stone-900' : 'bg-stone-200'
  const bgCard = isDark ? 'bg-stone-900' : 'bg-stone-100'
  const textPrimary = isDark ? 'text-stone-100' : 'text-stone-900'
  const textSecondary = isDark ? 'text-stone-300' : 'text-stone-600'
  const textMuted = isDark ? 'text-stone-500' : 'text-stone-500'
  const borderColor = isDark ? 'border-stone-800' : 'border-stone-300'
  const borderStrong = isDark ? 'border-stone-700' : 'border-stone-900'

  return (
    <>
      {/* SEO */}
      <SEOHead 
        title="Maximiliano Bustamante | Frontend Developer - Brutalist Portfolio"
        description="Frontend Developer specialized in React, Next.js, TypeScript, and e-commerce. View my bold brutalist editorial portfolio showcasing web development work."
      />
      
      <div className={`min-h-screen ${bgPrimary} ${textPrimary} font-body overflow-x-hidden transition-colors duration-300`} role="document">
        {/* Contact Modal */}
        <ContactFormModal 
          isOpen={isContactOpen} 
          onClose={() => setIsContactOpen(false)} 
          variant="brutalist"
          isDark={isDark} 
        />

        {/* Navigation */}
        <nav 
          className={`fixed top-0 left-0 right-0 z-40 ${isDark ? 'bg-stone-950/90' : 'bg-stone-100/90'} backdrop-blur-sm border-b-4 ${borderStrong} transition-colors duration-300`}
          role="navigation"
          aria-label="Main navigation"
        >
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Logo + Design Selector */}
            <LogoSelectorBrutalist isDark={isDark} />
          </div>
          <div className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-[0.2em]">
            <a href="#work" className={`${textMuted} hover:text-red-600 transition-colors`}>{t('nav.work')}</a>
            <a href="#about" className={`${textMuted} hover:text-red-600 transition-colors`}>{t('nav.skills')}</a>
            <a href="#contact" className={`${textMuted} hover:text-red-600 transition-colors`}>{t('nav.contact')}</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsContactOpen(true)}
              className="hidden sm:flex font-mono text-xs uppercase tracking-[0.2em] text-red-600 hover:text-red-500 transition-colors items-center gap-2"
            >
              <span className="hidden sm:inline">{t('common.quickEmail')}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            {/* Desktop Theme Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSelectorBrutalist />
              <ThemeToggle />
            </div>
            {/* Mobile Theme Toggle + Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle size="sm" />
              <LanguageSelectorBrutalist size="sm" />
              <MobileMenuBrutalist
                isDark={isDark}
                onContactClick={() => setIsContactOpen(true)}
                navItems={[
                  { label: t('nav.work'), href: '#work' },
                  { label: t('nav.skills'), href: '#about' },
                  { label: t('nav.contact'), href: '#contact' },
                  { label: t('nav.otherStyles'), href: '#explore' },
                ]}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Editorial Spread */}
      <main id="main-content">
        <section className="min-h-screen pt-20 relative" aria-labelledby="hero-heading">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          {/* Masthead */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className={`py-8 md:py-12 border-b-2 ${borderStrong}`}
          >
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
              <div>
                <p className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted} mb-2`}>
                  Portfolio Magazine
                </p>
                <h1 id="hero-heading" className="font-editorial text-[15vw] md:text-[10vw] leading-[0.8] tracking-tighter font-normal italic">
                  {personalInfo.firstName}
                </h1>
              </div>
              <div className="text-left md:text-right">
                <p className={`font-mono text-xs uppercase tracking-wider ${textMuted}`}>
                  {personalInfo.location}
                </p>
                <p className={`font-mono text-xs uppercase tracking-wider ${textMuted}`}>
                  Est. 2021
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-4 md:gap-6 py-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="col-span-12 lg:col-span-8"
            >
              <h2 className="font-editorial text-[14vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tight font-normal">
                <span className="block">{personalInfo.title.toUpperCase()}</span>
                <span className="block text-red-600 italic">& Developer</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="col-span-12 lg:col-span-4 flex flex-col justify-end"
            >
              <div className={`border-l-4 ${borderStrong} pl-4 grid grid-cols-2 lg:grid-cols-1 gap-4`}>
                {stats.map((stat, i) => (
                  <div key={i} className="mb-2 lg:mb-4">
                    <span className="block font-editorial text-4xl md:text-5xl italic">{stat.value}</span>
                    <span className={`font-mono text-xs uppercase tracking-wider ${textMuted}`}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Feature Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className={`${isDark ? 'bg-red-950' : 'bg-stone-900'} text-stone-100 p-6 md:p-8 lg:p-12 my-8`}
          >
            <div className="grid grid-cols-12 gap-6 md:gap-8">
              <div className="col-span-12 md:col-span-8">
                <p className={`font-mono text-xs uppercase tracking-[0.3em] ${isDark ? 'text-red-400' : 'text-stone-500'} mb-4`}>
                  Profile
                </p>
                <p className="font-editorial text-xl md:text-2xl lg:text-3xl italic leading-relaxed">
                  "{hero.description}"
                </p>
              </div>
              <div className="col-span-12 md:col-span-4 flex flex-col justify-between gap-6">
                <div>
                  <p className={`font-mono text-xs uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-stone-500'} mb-2`}>Contact</p>
                  <p className="text-base md:text-lg">{personalInfo.email}</p>
                  <p className="text-base md:text-lg">{personalInfo.phone}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="flex-1 border-2 border-red-600 px-6 py-3 hover:bg-red-600 transition-colors group"
                  >
                    <span className="font-mono text-xs uppercase tracking-wider text-red-500 group-hover:text-white">
                      {t('common.quickMessage')}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      window.open('/Maximiliano-Bustamante-CV.pdf', '_blank')
                      const link = document.createElement('a')
                      link.href = '/Maximiliano-Bustamante-CV.pdf'
                      link.download = 'Maximiliano-Bustamante-CV.pdf'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="flex-1 border-2 border-stone-100 px-6 py-3 hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-wider">
                      {t('common.downloadCV')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-16"
          >
            <span className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted}`}>{t('sections.section02')}</span>
            <h2 className="font-editorial text-[12vw] md:text-[8vw] leading-[0.85] tracking-tight italic mt-4">
              {t('sections.professionalExperience')}
              <br />
              <span className="not-italic text-red-600">{t('sections.experience')}</span>
            </h2>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 md:mb-12">
            <button
              onClick={() => setActiveTab('work')}
              className={`font-mono text-xs uppercase tracking-[0.2em] px-4 py-2 border-2 transition-colors ${
                activeTab === 'work' 
                  ? 'bg-red-600 text-white border-red-600' 
                  : `${borderColor} ${textMuted} hover:border-red-600`
              }`}
            >
              {t('nav.companies')}
            </button>
            <button
              onClick={() => setActiveTab('freelance')}
              className={`font-mono text-xs uppercase tracking-[0.2em] px-4 py-2 border-2 transition-colors ${
                activeTab === 'freelance' 
                  ? 'bg-red-600 text-white border-red-600' 
                  : `${borderColor} ${textMuted} hover:border-red-600`
              }`}
            >
              {t('nav.freelance')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'work' && (
              <motion.div
                key="work"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px ${isDark ? 'bg-stone-700' : 'bg-stone-900'}`}
              >
                {experience.map((job, index) => (
                  <motion.article
                    key={index}
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
                      <span className={`font-mono text-xs ${textMuted} uppercase tracking-wider`}>
                        {job.period}
                      </span>
                    </div>
                    <span className={`font-editorial text-4xl md:text-5xl italic ${isDark ? 'text-stone-700' : 'text-stone-300'} group-hover:text-red-600 transition-colors block mb-4`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className="font-editorial text-xl md:text-2xl italic mb-2">{job.title}</h3>
                    <p className="font-mono text-sm uppercase tracking-wider text-red-600 mb-4">{job.company}</p>
                    <p className={`text-sm ${textSecondary} mb-4 leading-relaxed`}>{job.description}</p>
                    
                    <div className="flex gap-4 mb-4">
                      {job.metrics.slice(0, 2).map((metric, i) => (
                        <div key={i}>
                          <span className="font-editorial text-lg italic">{metric.value}</span>
                          <span className={`block text-xs ${textMuted}`}>{metric.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.technologies.slice(0, 4).map((tech, i) => (
                        <span key={i} className={`font-mono text-xs px-2 py-1 ${bgSecondary} ${textMuted}`}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    {job.website && (
                      <a 
                        href={job.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-red-600 hover:underline"
                      >
                        Visit Website →
                      </a>
                    )}
                  </motion.article>
                ))}
              </motion.div>
            )}

            {activeTab === 'freelance' && (
              <motion.div
                key="freelance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {freelanceProjects.map((project, index) => (
                  <motion.a
                    key={index}
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`border-t ${borderColor} pt-6 grid grid-cols-12 gap-4 group ${isDark ? 'hover:bg-stone-900' : 'hover:bg-stone-50'} -mx-4 px-4 transition-colors`}
                  >
                    <div className="col-span-2 lg:col-span-1">
                      <span className={`font-editorial text-4xl md:text-5xl italic ${isDark ? 'text-stone-700' : 'text-stone-300'} group-hover:text-red-600 transition-colors`}>
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="col-span-10 lg:col-span-4">
                      <h3 className="font-editorial text-2xl md:text-3xl italic group-hover:text-red-600 transition-colors">{project.name}</h3>
                      <p className="font-mono text-xs uppercase tracking-wider text-red-600 mt-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="col-span-12 lg:col-span-5 lg:col-start-7">
                      <p className={`${textSecondary} leading-relaxed`}>{project.details}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.tech.map((tech, i) => (
                          <span key={i} className={`font-mono text-xs px-3 py-1 border ${borderColor} ${textMuted}`}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-12 lg:col-span-1 text-right">
                      <span className={`font-mono text-xs ${textMuted}`}>{project.year}</span>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Skills Section */}
      <section id="about" className={`py-16 md:py-24 border-t-4 ${borderStrong}`}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-16"
          >
            <span className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted}`}>Section 03</span>
            <h2 className="font-editorial text-[12vw] md:text-[8vw] leading-[0.85] tracking-tight italic mt-4">
              Technical<br />
              <span className="not-italic text-red-600">Arsenal</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: 'Languages', items: skills.languages, accent: false },
              { title: 'Frameworks', items: skills.frameworks, accent: true },
              { title: 'Databases', items: skills.databases, accent: false },
              { title: 'Platforms', items: skills.platforms, accent: true },
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border-l-4 ${category.accent ? 'border-red-600' : borderStrong} pl-4 md:pl-6`}
              >
                <h3 className={`font-mono text-xs uppercase tracking-wider ${textMuted} mb-4`}>{category.title}</h3>
                <div className="space-y-2">
                  {category.items.map((skill, i) => (
                    <p key={i} className="font-editorial text-lg md:text-2xl italic">{skill}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-red-600 text-white">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.5em] text-red-200 mb-6 md:mb-8">
              {contact.title}
            </p>
            <h2 className="font-editorial text-[10vw] md:text-[6vw] leading-[0.85] tracking-tight italic mb-8 md:mb-12">
              {t('contactPage.getInTouch')}
            </h2>
            
            <p className="text-red-100 max-w-xl mx-auto mb-8 md:mb-12 text-sm md:text-base">
              {contact.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 md:mb-16">
              <button
                onClick={() => setIsContactOpen(true)}
                className="inline-flex items-center justify-center gap-2 font-mono text-base md:text-lg uppercase tracking-wider bg-white text-red-600 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('common.quickEmail')}
              </button>
              <button
                onClick={() => {
                  window.open('/Maximiliano-Bustamante-CV.pdf', '_blank')
                  const link = document.createElement('a')
                  link.href = '/Maximiliano-Bustamante-CV.pdf'
                  link.download = 'Maximiliano-Bustamante-CV.pdf'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="inline-flex items-center justify-center gap-2 font-mono text-base md:text-lg uppercase tracking-wider border-4 border-white px-8 py-4 hover:bg-white hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('common.downloadCV')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-red-200 mb-2">
                  {t('contactPage.phone')}
                </p>
                <a href={`tel:${personalInfo.phone}`} className="hover:text-red-200 transition-colors">
                  {personalInfo.phone}
                </a>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-red-200 mb-2">
                  {t('contactPage.location')}
                </p>
                <p>{personalInfo.location}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-red-200 mb-2">Availability</p>
                <p>{contact.availability.status}</p>
              </div>
            </div>

            <div className="flex justify-center gap-8 md:gap-12">
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="font-mono text-sm uppercase tracking-wider hover:text-red-900 transition-colors">
                LinkedIn
              </a>
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="font-mono text-sm uppercase tracking-wider hover:text-red-900 transition-colors">
                GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      </main>

      {/* Explore Other Designs */}
      <ExploreDesignsBrutalist isDark={isDark} />

      {/* Footer */}
      <footer 
        className={`py-8 border-t-4 ${borderStrong} ${bgPrimary}`}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`font-mono text-xs ${textMuted}`}>
            © 2026 {personalInfo.name}. All rights reserved.
          </p>
          <p className={`font-mono text-xs ${textMuted}`}>
            <span className="text-red-600">Brutalist Editorial</span> — Design 02
          </p>
        </div>
      </footer>

      {/* Mobile FAB */}
      <motion.button
        onClick={() => setIsContactOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-30"
        whileTap={{ scale: 0.9 }}
        aria-label="Open contact form"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </motion.button>
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
