import { motion } from 'framer-motion'
import { LuxuryPreview, BrutalistPreview, MenuPreview } from '../previews'
import { FadeInUp, TransitionLink } from '../common'
import { useState } from 'react'

interface ExploreDesignsProps {
  currentDesign: 'luxury' | 'brutalist'
  isDark: boolean
}

export function ExploreDesigns({ currentDesign, isDark }: ExploreDesignsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const styles = currentDesign === 'luxury' 
    ? {
        sectionBg: isDark ? 'bg-slate-950/50' : 'bg-luxury-black/5',
        accent: isDark ? 'text-deco-gold' : 'text-luxury-gold',
        textPrimary: isDark ? 'text-deco-cream' : 'text-luxury-black',
        textSecondary: isDark ? 'text-deco-cream/60' : 'text-luxury-black/60',
        textMuted: isDark ? 'text-deco-cream/40' : 'text-luxury-black/40',
        borderColor: isDark ? 'border-deco-gold/20' : 'border-luxury-black/10',
        cardBg: isDark ? 'bg-deco-navy/50' : 'bg-white/50',
      }
    : {
        sectionBg: isDark ? 'bg-stone-900' : 'bg-stone-200',
        accent: 'text-red-600',
        textPrimary: isDark ? 'text-stone-100' : 'text-stone-900',
        textSecondary: isDark ? 'text-stone-400' : 'text-stone-600',
        textMuted: isDark ? 'text-stone-500' : 'text-stone-400',
        borderColor: isDark ? 'border-stone-700' : 'border-stone-300',
        cardBg: isDark ? 'bg-stone-950' : 'bg-white',
      }

  const otherDesign = currentDesign === 'luxury' 
    ? { 
        name: 'Brutalist Editorial', 
        route: '/brutalist',
        subtitle: 'Bold & Raw',
        Preview: BrutalistPreview,
        transitionColor: '#1c1917',
        transitionAccent: '#dc2626',
      }
    : { 
        name: 'Luxury Minimal', 
        route: '/',
        subtitle: 'Elegant & Refined',
        Preview: LuxuryPreview,
        transitionColor: '#FAF8F5',
        transitionAccent: '#C9A962',
      }

  return (
    <section id="explore" className={`py-16 md:py-24 px-4 sm:px-6 md:px-16 ${styles.sectionBg}`}>
      <div className="max-w-4xl mx-auto">
        <FadeInUp>
          <div className="text-center mb-10 md:mb-14">
            <div className={`inline-flex items-center gap-2 px-3 py-1 mb-4 border ${styles.borderColor} ${styles.cardBg}`}>
              <svg className={`w-3 h-3 ${styles.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className={`text-[10px] tracking-[0.3em] uppercase ${styles.accent}`}>
                Design Menu
              </span>
            </div>
            
            <h2 className={`font-display text-2xl sm:text-3xl md:text-4xl mb-3 ${styles.textPrimary}`}>
              Switch Experience
            </h2>
            <p className={`${styles.textSecondary} max-w-md mx-auto text-sm`}>
              Same developer, different creative direction. Pick your preferred aesthetic.
            </p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Other Design Card */}
          <FadeInUp delay={0.1}>
            <TransitionLink
              to={otherDesign.route}
              transitionColor={otherDesign.transitionColor}
              transitionAccent={otherDesign.transitionAccent}
              transitionLabel={otherDesign.name}
              onMouseEnter={() => setHoveredCard('other')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group block border ${styles.borderColor} ${styles.cardBg} overflow-hidden transition-all duration-300 hover:shadow-lg`}
            >
              {/* Preview */}
              <div className="relative h-28 sm:h-32 overflow-hidden">
                <otherDesign.Preview isHovered={hoveredCard === 'other'} size="md" />
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-display text-base sm:text-lg ${styles.textPrimary} group-hover:${styles.accent} transition-colors`}>
                    {otherDesign.name}
                  </h3>
                  <motion.svg 
                    animate={{ x: hoveredCard === 'other' ? 0 : -4, opacity: hoveredCard === 'other' ? 1 : 0 }}
                    className={`w-4 h-4 ${styles.accent}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </div>
                <p className={`text-xs ${styles.textMuted}`}>
                  {otherDesign.subtitle}
                </p>
              </div>
            </TransitionLink>
          </FadeInUp>

          {/* Menu Card */}
          <FadeInUp delay={0.15}>
            <TransitionLink
              to="/menu"
              transitionColor={isDark ? '#171717' : '#fafafa'}
              transitionAccent={isDark ? '#ffffff' : '#171717'}
              transitionLabel="Design Selector"
              onMouseEnter={() => setHoveredCard('menu')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group block border ${styles.borderColor} ${styles.cardBg} overflow-hidden transition-all duration-300 hover:shadow-lg`}
            >
              {/* Preview */}
              <div className="relative h-28 sm:h-32 overflow-hidden">
                <MenuPreview isHovered={hoveredCard === 'menu'} isDark={isDark} />
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-display text-base sm:text-lg ${styles.textPrimary} group-hover:${styles.accent} transition-colors`}>
                    Design Menu
                  </h3>
                  <motion.svg 
                    animate={{ x: hoveredCard === 'menu' ? 0 : -4, opacity: hoveredCard === 'menu' ? 1 : 0 }}
                    className={`w-4 h-4 ${styles.accent}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </div>
                <p className={`text-xs ${styles.textMuted}`}>
                  View all options
                </p>
              </div>
            </TransitionLink>
          </FadeInUp>
        </div>

        <FadeInUp delay={0.2}>
          <div className="mt-8 text-center">
            <p className={`text-[11px] ${styles.textMuted}`}>
              Currently viewing: <span className={styles.accent}>
                {currentDesign === 'luxury' ? 'Luxury Minimal' : 'Brutalist Editorial'}
              </span>
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  )
}
