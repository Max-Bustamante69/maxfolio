import { m, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { TransitionLink } from './TransitionLink'
import { DesignMark } from './DesignMark'
import { useI18n } from '../../hooks/useI18n'
import { designs, MENU } from '../../data/designs'

/** Neo's logo-triggered design selector — soft-UI raised popover, same contract (Escape/outside
 * click/aria-expanded) as LogoSelectorApple/Luxury/Brutalist. Neo had no reachable style selector
 * on desktop before this (the logo was a plain link back to `/neo`, and only the mobile sheet
 * listed the other experiences). */
export function LogoSelectorNeo({ isDark }: { isDark: boolean }) {
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

  const text = isDark ? 'text-neo-darkInk' : 'text-neo-ink'
  const muted = isDark ? 'text-white/50' : 'text-black/45'
  const panel = isDark ? 'bg-neo-dark border-white/10' : 'bg-neo-surfaceRaised border-black/[0.06]'
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-black/[0.03]'
  const shadow = isDark ? '8px 8px 20px #0c0d10, -8px -8px 20px #24262e' : '6px 6px 16px #b8bcc7, -6px -6px 16px #ffffff'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="press flex items-center gap-2.5 shrink-0 !rounded-full px-1 py-1 pr-3"
      >
        <span className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-neo-darkAccent' : 'bg-neo-accent'}`} aria-hidden="true" />
        <span className={`text-sm font-extrabold tracking-tight hidden sm:inline ${text}`}>Maxfolio</span>
        <span className="sr-only">, open design selector</span>
        <svg className={`w-3 h-3 ${muted} transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            style={{ transformOrigin: 'top left', boxShadow: shadow }}
            className={`absolute left-0 top-full mt-2 z-50 w-72 rounded-[20px] border ${panel} p-2`}
          >
            <p className={`px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-[0.15em] ${muted}`}>{t('logoSelector.selectYourStyle')}</p>
            {designs.map((d) => {
              const current = d.id === 'neo'
              const row = (
                <div className="flex items-center gap-3">
                  <DesignMark id={d.id} size="sm" isDark={isDark} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${text}`}>{t(d.nameKey)}</p>
                    <p className={`text-xs ${muted} truncate`}>{t(d.subtitleKey)}</p>
                  </div>
                  {current ? (
                    <svg className={`w-4 h-4 ${isDark ? 'text-neo-darkAccent' : 'text-neo-accent'}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={`text-sm ${muted}`}>›</span>
                  )}
                </div>
              )
              return current ? (
                <div key={d.id} role="menuitem" aria-current="page" className={`rounded-[14px] px-3 py-2 ${isDark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                  {row}
                </div>
              ) : (
                <TransitionLink
                  key={d.id}
                  to={d.href}
                  transitionColor={d.transitionColor}
                  transitionAccent={d.transitionAccent}
                  transitionLabel={t(d.nameKey)}
                  className={`block rounded-[14px] px-3 py-2 ${rowHover} transition-colors`}
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
              className={`block rounded-[14px] px-3 py-2 text-sm font-semibold ${isDark ? 'text-neo-darkAccent' : 'text-neo-accent'} ${rowHover} transition-colors`}
            >
              {t(MENU.subtitleKey)} ›
            </TransitionLink>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
