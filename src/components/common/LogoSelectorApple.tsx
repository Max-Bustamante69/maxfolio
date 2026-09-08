import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { TransitionLink } from './TransitionLink'
import { useI18n } from '../../hooks/useI18n'
import { designs, MENU, type DesignId } from '../../data/designs'

const EASE = [0.23, 1, 0.32, 1] as const

function Mark({ id, isDark }: { id: DesignId; isDark: boolean }) {
  if (id === 'brutalist') {
    return (
      <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-red-600 text-white font-mono text-[11px] font-bold leading-none">
        <span>M<br />B</span>
      </div>
    )
  }
  if (id === 'luxury') {
    return (
      <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#FAF8F5] border border-[#C9A962]/60 font-display text-[11px] tracking-wider text-[#1a1a1a]">
        MB
      </div>
    )
  }
  return (
    <div className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-[10px] ${isDark ? 'bg-white text-black' : 'bg-white text-[#1d1d1f] shadow-[0_1px_6px_rgba(0,0,0,0.12)]'} text-[11px] font-semibold`}>
      MB
    </div>
  )
}

/** The "MB" mark opens an origin-aware popover listing every experience. */
export function LogoSelectorApple({ isDark }: { isDark: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  const text = isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'
  const muted = isDark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'
  const panel = isDark ? 'bg-[#1d1d1f]/95 border-white/10' : 'bg-white/95 border-black/5'
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-black/[0.04]'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`press inline-flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} compact-touch`}
      >
        <Mark id="apple" isDark={isDark} />
        <span className={`text-sm font-semibold ${text}`}>Maxfolio</span>
        {/* the accessible name keeps the visible text and adds the purpose */}
        <span className="sr-only">, open design selector</span>
        <svg className={`w-3 h-3 ${muted} transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ transformOrigin: 'top left' }}
            className={`absolute left-0 top-full mt-2 z-50 w-72 rounded-[18px] border ${panel} backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-2`}
          >
            <p className={`px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-[0.15em] ${muted}`}>{t('logoSelector.selectYourStyle')}</p>
            {designs.map((d) => {
              const current = d.id === 'apple'
              const row = (
                <div className="flex items-center gap-3">
                  <Mark id={d.id} isDark={isDark} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${text}`}>{t(d.nameKey)}</p>
                    <p className={`text-xs ${muted} truncate`}>{t(d.subtitleKey)}</p>
                  </div>
                  {current ? (
                    <svg className={`w-4 h-4 ${isDark ? 'text-[#2997ff]' : 'text-[#0071e3]'}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={`text-sm ${muted}`}>›</span>
                  )}
                </div>
              )
              return current ? (
                <div key={d.id} role="menuitem" aria-current="page" className={`rounded-[12px] px-3 py-2 ${isDark ? 'bg-white/5' : 'bg-black/[0.04]'}`}>
                  {row}
                </div>
              ) : (
                <TransitionLink
                  key={d.id}
                  to={d.route}
                  transitionColor={d.transitionColor}
                  transitionAccent={d.transitionAccent}
                  transitionLabel={t(d.nameKey)}
                  className={`block rounded-[12px] px-3 py-2 ${rowHover} transition-colors`}
                >
                  {row}
                </TransitionLink>
              )
            })}
            <div className={`my-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
            <TransitionLink
              to={MENU.route}
              transitionColor={isDark ? '#171717' : '#fafafa'}
              transitionAccent={isDark ? '#ffffff' : '#171717'}
              transitionLabel={t(MENU.labelKey)}
              className={`block rounded-[12px] px-3 py-2 text-sm font-medium ${isDark ? 'text-[#2997ff]' : 'text-[#0071e3]'} ${rowHover} transition-colors`}
            >
              {t(MENU.subtitleKey)} ›
            </TransitionLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
