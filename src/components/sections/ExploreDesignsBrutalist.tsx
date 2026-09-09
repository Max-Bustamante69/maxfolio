import { m } from 'framer-motion'
import { MenuPreview } from '../previews'
import { TransitionLink } from '../common'
import { useState } from 'react'
import { useI18n } from '../../hooks'
import { otherDesigns, designById, designs, MENU } from '../../data/designs'

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

  const rows = [
    ...otherDesigns('brutalist').map((d) => ({
      key: d.id,
      to: d.href,
      color: d.transitionColor,
      accentHex: d.transitionAccent,
      title: t(d.nameKey),
      subtitle: t(d.subtitleKey),
      previewBg: d.transitionColor,
      Preview: () => <d.Preview isHovered={hoveredCard === d.id} size="sm" />,
    })),
    {
      key: 'menu',
      to: MENU.route,
      color: isDark ? '#171717' : '#fafafa',
      accentHex: '#dc2626',
      title: t(MENU.labelKey),
      subtitle: t(MENU.subtitleKey),
      previewBg: isDark ? '#292524' : '#f5f5f4',
      Preview: () => <MenuPreview isHovered={hoveredCard === 'menu'} isDark={isDark} />,
    },
  ]

  return (
    <section id="explore" className={`${sectionBg}`}>
      {/* Full-width header */}
      <div className={`border-b-2 ${borderColor} py-8 md:py-12 px-4 md:px-6`}>
        <div className="max-w-[1800px] mx-auto">
          <span className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted}`}>
            Section 06
          </span>
          <h2 className={`font-editorial text-[14vw] sm:text-[10vw] md:text-[8vw] leading-[0.85] tracking-tight italic mt-4 ${textPrimary}`}>
            Other<br />
            <span className="text-red-600">{t('exploreBrutalist.styles')}</span>
          </h2>

          <div className={`mt-8 pt-6 border-t ${borderColor} max-w-2xl`}>
            <p className={`font-editorial text-xl md:text-2xl italic ${textSecondary} leading-relaxed`}>
              {t('exploreBrutalist.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Full-width rows */}
      <div className="max-w-[1800px] mx-auto">
        {rows.map((row, index) => {
          const hovered = hoveredCard === row.key
          return (
            <TransitionLink
              key={row.key}
              to={row.to}
              transitionColor={row.color}
              transitionAccent={row.accentHex}
              transitionLabel={row.title}
              onMouseEnter={() => setHoveredCard(row.key)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group block border-b-2 ${borderColor}`}
            >
              <div className="grid grid-cols-12 items-center">
                {/* Number */}
                <div className={`col-span-2 md:col-span-1 p-4 md:p-6 border-r-2 ${borderColor}`}>
                  <span
                    className={`font-editorial text-3xl md:text-5xl italic ${isDark ? 'text-stone-700' : 'text-stone-300'} transition-colors`}
                    style={{ color: hovered ? row.accentHex : undefined }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Content */}
                <div className="col-span-10 md:col-span-7 lg:col-span-8 p-4 md:p-6">
                  <h3
                    className={`font-editorial text-2xl sm:text-3xl md:text-4xl italic ${textPrimary} transition-colors`}
                    style={{ color: hovered ? row.accentHex : undefined }}
                  >
                    {row.title}
                  </h3>
                  <p className={`font-mono text-xs uppercase tracking-wider ${textMuted} mt-2`}>
                    {row.subtitle}
                  </p>
                </div>

                {/* Preview - Hidden on mobile */}
                <div className={`hidden md:block col-span-3 lg:col-span-2 border-l-2 ${borderColor} h-full`}>
                  <m.div className="h-full" style={{ backgroundColor: row.previewBg }} animate={{ opacity: hovered ? 1 : 0.7 }}>
                    <div className="aspect-square">
                      <row.Preview />
                    </div>
                  </m.div>
                </div>

                {/* Arrow */}
                <div className={`hidden lg:flex col-span-1 items-center justify-center border-l-2 ${borderColor} h-full p-4`}>
                  <m.svg
                    animate={{ x: hovered ? 4 : 0 }}
                    className={`w-6 h-6 ${textMuted} transition-colors`}
                    style={{ color: hovered ? row.accentHex : undefined }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </m.svg>
                </div>
              </div>
            </TransitionLink>
          )
        })}
      </div>

      {/* Footer */}
      <div className="py-6 px-4 md:px-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <p className={`font-mono text-xs ${textMuted} uppercase tracking-wider`}>
            {t('exploreBrutalist.viewing')} <span className="text-red-600">{t(designById('brutalist').nameKey)}</span>
          </p>
          <p className={`font-mono text-xs ${textMuted}`}>
            {designs.length} styles
          </p>
        </div>
      </div>
    </section>
  )
}
