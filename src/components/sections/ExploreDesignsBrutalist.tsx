import { motion } from 'framer-motion'
import { LuxuryPreview, MenuPreview } from '../previews'
import { TransitionLink } from '../common'
import { useState } from 'react'
import { useI18n } from '../../hooks'

interface ExploreDesignsBrutalistProps {
  isDark: boolean
}

export function ExploreDesignsBrutalist({ isDark }: ExploreDesignsBrutalistProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const { t } = useI18n()
  
  const textPrimary = isDark ? 'text-stone-100' : 'text-stone-900'
  const textSecondary = isDark ? 'text-stone-400' : 'text-stone-600'
  const textMuted = isDark ? 'text-stone-500' : 'text-stone-500'
  const borderColor = isDark ? 'border-stone-700' : 'border-stone-300'
  const sectionBg = isDark ? 'bg-stone-900' : 'bg-stone-200'

  return (
    <section id="explore" className={`${sectionBg}`}>
      {/* Full-width header */}
      <div className={`border-b-2 ${borderColor} py-8 md:py-12 px-4 md:px-6`}>
        <div className="max-w-[1800px] mx-auto">
          <span className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted}`}>
            Section 04
          </span>
          <h2 className={`font-editorial text-[14vw] sm:text-[10vw] md:text-[8vw] leading-[0.85] tracking-tight italic mt-4 ${textPrimary}`}>
            Other<br />
            <span className="text-red-600">{t('exploreBrutalist.styles')}</span>
          </h2>
          
          {/* Description - prominent position below headline */}
          <div className={`mt-8 pt-6 border-t ${borderColor} max-w-2xl`}>
            <p className={`font-editorial text-xl md:text-2xl italic ${textSecondary} leading-relaxed`}>
              {t('exploreBrutalist.description')}
            </p>
            <p className={`font-mono text-xs uppercase tracking-wider ${textMuted} mt-4`}>
              Because great developers adapt to any aesthetic
            </p>
          </div>
        </div>
      </div>

      {/* Full-width cards */}
      <div className="max-w-[1800px] mx-auto">
        
        {/* Luxury Card - Full width row */}
        <TransitionLink
          to="/"
          transitionColor="#FAF8F5"
          transitionAccent="#C9A962"
          transitionLabel={t('menuPage.designNames.luxuryMinimal')}
          onMouseEnter={() => setHoveredCard('luxury')}
          onMouseLeave={() => setHoveredCard(null)}
          className={`group block border-b-2 ${borderColor}`}
        >
          <div className="grid grid-cols-12 items-center">
            {/* Number */}
            <div className={`col-span-2 md:col-span-1 p-4 md:p-6 border-r-2 ${borderColor}`}>
              <span className={`font-editorial text-3xl md:text-5xl italic ${isDark ? 'text-stone-700' : 'text-stone-300'} group-hover:text-[#C9A962] transition-colors`}>
                01
              </span>
            </div>
            
            {/* Content */}
            <div className="col-span-10 md:col-span-7 lg:col-span-8 p-4 md:p-6">
              <h3 className={`font-editorial text-2xl sm:text-3xl md:text-4xl italic ${textPrimary} group-hover:text-[#C9A962] transition-colors`}>
                {t('menuPage.designNames.luxuryMinimal')}
              </h3>
              <p className={`font-mono text-xs uppercase tracking-wider ${textMuted} mt-2`}>
                Elegant • Refined • Gold Accents
              </p>
              <p className={`text-sm ${textSecondary} mt-3 hidden sm:block max-w-lg`}>
                Clean lines, sophisticated typography, and a premium feel for a more refined presentation.
              </p>
            </div>
            
            {/* Preview - Hidden on mobile */}
            <div className={`hidden md:block col-span-3 lg:col-span-2 border-l-2 ${borderColor} h-full`}>
              <motion.div 
                className="h-full bg-[#FAF8F5]"
                animate={{ opacity: hoveredCard === 'luxury' ? 1 : 0.7 }}
              >
                <div className="aspect-square">
                  <LuxuryPreview isHovered={hoveredCard === 'luxury'} size="sm" />
                </div>
              </motion.div>
            </div>
            
            {/* Arrow */}
            <div className={`hidden lg:flex col-span-1 items-center justify-center border-l-2 ${borderColor} h-full p-4`}>
              <motion.svg
                animate={{ x: hoveredCard === 'luxury' ? 4 : 0 }}
                className={`w-6 h-6 ${textMuted} group-hover:text-[#C9A962] transition-colors`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </div>
          </div>
        </TransitionLink>

        {/* Menu Card - Full width row */}
        <TransitionLink
          to="/menu"
          transitionColor={isDark ? '#171717' : '#fafafa'}
          transitionAccent={isDark ? '#ffffff' : '#171717'}
          transitionLabel={t('logoSelector.designMenu')}
          onMouseEnter={() => setHoveredCard('menu')}
          onMouseLeave={() => setHoveredCard(null)}
          className={`group block border-b-2 ${borderColor}`}
        >
          <div className="grid grid-cols-12 items-center">
            {/* Number */}
            <div className={`col-span-2 md:col-span-1 p-4 md:p-6 border-r-2 ${borderColor}`}>
              <span className={`font-editorial text-3xl md:text-5xl italic ${isDark ? 'text-stone-700' : 'text-stone-300'} group-hover:text-red-600 transition-colors`}>
                02
              </span>
            </div>
            
            {/* Content */}
            <div className="col-span-10 md:col-span-7 lg:col-span-8 p-4 md:p-6">
              <h3 className={`font-editorial text-2xl sm:text-3xl md:text-4xl italic ${textPrimary} group-hover:text-red-600 transition-colors`}>
                {t('logoSelector.designMenu')}
              </h3>
              <p className={`font-mono text-xs uppercase tracking-wider ${textMuted} mt-2`}>
                Compare • Select • Explore
              </p>
              <p className={`text-sm ${textSecondary} mt-3 hidden sm:block max-w-lg`}>
                View all available styles side by side and choose your preferred experience.
              </p>
            </div>
            
            {/* Preview - Hidden on mobile */}
            <div className={`hidden md:block col-span-3 lg:col-span-2 border-l-2 ${borderColor} h-full`}>
              <motion.div 
                className={`h-full ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}
                animate={{ opacity: hoveredCard === 'menu' ? 1 : 0.7 }}
              >
                <div className="aspect-square">
                  <MenuPreview isHovered={hoveredCard === 'menu'} isDark={isDark} />
                </div>
              </motion.div>
            </div>
            
            {/* Arrow */}
            <div className={`hidden lg:flex col-span-1 items-center justify-center border-l-2 ${borderColor} h-full p-4`}>
              <motion.svg
                animate={{ x: hoveredCard === 'menu' ? 4 : 0 }}
                className={`w-6 h-6 ${textMuted} group-hover:text-red-600 transition-colors`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </div>
          </div>
        </TransitionLink>
      </div>

      {/* Footer */}
      <div className={`py-6 px-4 md:px-6`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <p className={`font-mono text-xs ${textMuted} uppercase tracking-wider`}>
            {t('exploreBrutalist.viewing')} <span className="text-red-600">{t('exploreBrutalist.viewingBrutalist')}</span>
          </p>
          <p className={`font-mono text-xs ${textMuted}`}>
            2 styles
          </p>
        </div>
      </div>
    </section>
  )
}
