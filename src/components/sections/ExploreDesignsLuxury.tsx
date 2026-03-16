import { motion } from 'framer-motion'
import { BrutalistPreview, MenuPreview } from '../previews'
import { TransitionLink } from '../common'
import { useState } from 'react'

interface ExploreDesignsLuxuryProps {
  isDark: boolean
}

export function ExploreDesignsLuxury({ isDark }: ExploreDesignsLuxuryProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const accent = isDark ? 'text-deco-gold' : 'text-luxury-gold'
  const textPrimary = isDark ? 'text-deco-cream' : 'text-luxury-black'
  const textSecondary = isDark ? 'text-deco-cream/60' : 'text-luxury-black/60'
  const textMuted = isDark ? 'text-deco-cream/40' : 'text-luxury-black/40'
  const borderColor = isDark ? 'border-deco-gold/20' : 'border-luxury-black/10'
  const cardBg = isDark ? 'bg-deco-navy/30' : 'bg-white/60'
  const sectionBg = isDark ? 'bg-slate-950/50' : 'bg-luxury-black/[0.02]'

  return (
    <section id="explore" className={`py-20 md:py-28 px-6 md:px-16 ${sectionBg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Elegant header with lines */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-6 mb-6">
            <motion.div 
              className={`h-px flex-1 max-w-[80px] ${isDark ? 'bg-deco-gold/30' : 'bg-luxury-gold/40'}`}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            <span className={`text-[10px] tracking-[0.5em] uppercase ${accent}`}>
              Alternative Views
            </span>
            <motion.div 
              className={`h-px flex-1 max-w-[80px] ${isDark ? 'bg-deco-gold/30' : 'bg-luxury-gold/40'}`}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
          </div>
          
          <h2 className={`font-display text-2xl sm:text-3xl md:text-4xl mb-4 ${textPrimary}`}>
            <span className="italic">Explore</span> Other Aesthetics
          </h2>
          <p className={`${textSecondary} text-sm max-w-md mx-auto`}>
            The same professional journey, expressed through different design languages.
          </p>
        </div>

        {/* Elegant cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Brutalist Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <TransitionLink
              to="/brutalist"
              transitionColor="#1c1917"
              transitionAccent="#dc2626"
              transitionLabel="Brutalist Editorial"
              onMouseEnter={() => setHoveredCard('brutalist')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group block border ${borderColor} ${cardBg} backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-red-600/30`}
            >
              <div className="relative h-32 overflow-hidden">
                <BrutalistPreview isHovered={hoveredCard === 'brutalist'} />
              </div>
              
              <div className="p-5 border-t border-inherit">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-display text-lg ${textPrimary} group-hover:text-red-600 transition-colors duration-300`}>
                      Brutalist Editorial
                    </h3>
                    <p className={`text-xs ${textMuted} mt-1`}>Bold & Impactful</p>
                  </div>
                  <motion.div
                    animate={{ x: hoveredCard === 'brutalist' ? 0 : -8, opacity: hoveredCard === 'brutalist' ? 1 : 0 }}
                    className="text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </TransitionLink>
          </motion.div>

          {/* Menu Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <TransitionLink
              to="/menu"
              transitionColor={isDark ? '#171717' : '#fafafa'}
              transitionAccent={isDark ? '#ffffff' : '#171717'}
              transitionLabel="Design Menu"
              onMouseEnter={() => setHoveredCard('menu')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group block border ${borderColor} ${cardBg} backdrop-blur-sm overflow-hidden transition-all duration-500 hover:${isDark ? 'border-deco-gold/40' : 'border-luxury-gold/40'}`}
            >
              <div className="relative h-32 overflow-hidden">
                <MenuPreview isHovered={hoveredCard === 'menu'} isDark={isDark} />
              </div>
              
              <div className="p-5 border-t border-inherit">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-display text-lg ${textPrimary} group-hover:${accent} transition-colors duration-300`}>
                      Design Menu
                    </h3>
                    <p className={`text-xs ${textMuted} mt-1`}>Compare Options</p>
                  </div>
                  <motion.div
                    animate={{ x: hoveredCard === 'menu' ? 0 : -8, opacity: hoveredCard === 'menu' ? 1 : 0 }}
                    className={accent}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </TransitionLink>
          </motion.div>
        </div>

        {/* Elegant footer note */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className={`w-8 h-px ${isDark ? 'bg-deco-gold/20' : 'bg-luxury-black/10'}`} />
            <p className={`text-[11px] tracking-wider ${textMuted}`}>
              Currently: <span className={`${accent} italic`}>Luxury Minimal</span>
            </p>
            <div className={`w-8 h-px ${isDark ? 'bg-deco-gold/20' : 'bg-luxury-black/10'}`} />
          </div>
        </div>
      </div>
    </section>
  )
}
