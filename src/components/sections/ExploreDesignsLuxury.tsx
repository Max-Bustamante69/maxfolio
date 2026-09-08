import { m } from 'framer-motion'
import { MenuPreview } from '../previews'
import { TransitionLink } from '../common'
import { useState } from 'react'
import { useI18n } from '../../hooks'
import { otherDesigns, designById, MENU } from '../../data/designs'

interface ExploreDesignsLuxuryProps {
  isDark: boolean
}

export function ExploreDesignsLuxury({ isDark }: ExploreDesignsLuxuryProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const { t } = useI18n()

  const accent = isDark ? 'text-deco-gold' : 'text-luxury-gold'
  const textPrimary = isDark ? 'text-deco-cream' : 'text-luxury-black'
  const textSecondary = isDark ? 'text-deco-cream/60' : 'text-luxury-black/60'
  const textMuted = isDark ? 'text-deco-cream/40' : 'text-luxury-black/40'
  const borderColor = isDark ? 'border-deco-gold/20' : 'border-luxury-black/10'
  const cardBg = isDark ? 'bg-deco-navy/30' : 'bg-white/60'
  const sectionBg = isDark ? 'bg-slate-950/50' : 'bg-luxury-black/[0.02]'

  const cards = [
    ...otherDesigns('luxury').map((d) => ({
      key: d.id,
      to: d.route,
      color: d.transitionColor,
      accentHex: d.transitionAccent,
      title: t(d.nameKey),
      subtitle: t(d.subtitleKey),
      Preview: () => <d.Preview isHovered={hoveredCard === d.id} />,
    })),
    {
      key: 'menu',
      to: MENU.route,
      color: isDark ? '#171717' : '#fafafa',
      accentHex: isDark ? '#ffffff' : '#171717',
      title: t(MENU.labelKey),
      subtitle: t(MENU.subtitleKey),
      Preview: () => <MenuPreview isHovered={hoveredCard === 'menu'} isDark={isDark} />,
    },
  ]

  return (
    <section id="explore" className={`py-20 md:py-28 px-6 md:px-16 ${sectionBg}`}>
      <div className="max-w-5xl mx-auto">
        {/* Elegant header with lines */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-6 mb-6">
            <m.div
              className={`h-px flex-1 max-w-[80px] ${isDark ? 'bg-deco-gold/30' : 'bg-luxury-gold/40'}`}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            <span className={`text-[10px] tracking-[0.5em] uppercase ${accent}`}>
              {t('exploreLuxury.tagline')}
            </span>
            <m.div
              className={`h-px flex-1 max-w-[80px] ${isDark ? 'bg-deco-gold/30' : 'bg-luxury-gold/40'}`}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <h2 className={`font-display text-2xl sm:text-3xl md:text-4xl mb-4 ${textPrimary}`}>
            <span className="italic">{t('exploreLuxury.headlinePrefix')}</span> {t('exploreLuxury.headlineRest')}
          </h2>
          <p className={`${textSecondary} text-sm max-w-md mx-auto`}>
            {t('exploreLuxury.description')}
          </p>
        </div>

        {/* Elegant cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <m.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <TransitionLink
                to={card.to}
                transitionColor={card.color}
                transitionAccent={card.accentHex}
                transitionLabel={card.title}
                onMouseEnter={() => setHoveredCard(card.key)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group block border ${borderColor} ${cardBg} backdrop-blur-sm overflow-hidden transition-all duration-500`}
                style={{ borderColor: hoveredCard === card.key ? `${card.accentHex}66` : undefined }}
              >
                <div className="relative h-32 overflow-hidden">
                  <card.Preview />
                </div>

                <div className="p-5 border-t border-inherit">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`font-display text-lg ${textPrimary} transition-colors duration-300`}
                        style={{ color: hoveredCard === card.key ? card.accentHex : undefined }}
                      >
                        {card.title}
                      </h3>
                      <p className={`text-xs ${textMuted} mt-1`}>{card.subtitle}</p>
                    </div>
                    <m.div
                      animate={{ x: hoveredCard === card.key ? 0 : -8, opacity: hoveredCard === card.key ? 1 : 0 }}
                      style={{ color: card.accentHex }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </m.div>
                  </div>
                </div>
              </TransitionLink>
            </m.div>
          ))}
        </div>

        {/* Elegant footer note */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className={`w-8 h-px ${isDark ? 'bg-deco-gold/20' : 'bg-luxury-black/10'}`} />
            <p className={`text-[11px] tracking-wider ${textMuted}`}>
              {t('exploreLuxury.currently')} <span className={`${accent} italic`}>{t(designById('luxury').nameKey)}</span>
            </p>
            <div className={`w-8 h-px ${isDark ? 'bg-deco-gold/20' : 'bg-luxury-black/10'}`} />
          </div>
        </div>
      </div>
    </section>
  )
}
