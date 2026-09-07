import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LaptopFrame, PhoneFrame } from './DeviceFrame'
import type { Skin } from './skins'
import type { FrameShots } from './ProjectFrame'

export interface CaseStudyStat {
  label: string
  value: string
}

export interface CaseStudyData {
  name: string
  url?: string
  meta: string // "Specialty coffee · 2026 · Built"
  badge: { text: string; className: string }
  tagline: string
  description: string
  stats: CaseStudyStat[] // real, verifiable numbers only
  results: CaseStudyStat[] // measured outcomes; hidden when empty
  stack: string[]
  shots: FrameShots
}

interface Labels {
  close: string
  prev: string
  next: string
  home: string
  pdp: string
  desktop: string
  mobile: string
  facts: string
  results: string
  stack: string
  visit: string
}

interface ProjectModalProps {
  open: boolean
  data: CaseStudyData | null
  skin: Skin
  labels: Labels
  onClose: () => void
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * Case-study sheet: a carousel of the four captures on the left, the facts on the right.
 * Esc closes, ← → move the carousel.
 */
export function ProjectModal({ open, data, skin, labels, onClose }: ProjectModalProps) {
  const [i, setI] = useState(0)
  const slides = data
    ? [
        { key: 'hd', kind: 'desktop' as const, src: data.shots.homeDesktop, label: `${labels.home} · ${labels.desktop}` },
        ...(data.shots.pdpDesktop ? [{ key: 'pd', kind: 'desktop' as const, src: data.shots.pdpDesktop, label: `${labels.pdp} · ${labels.desktop}` }] : []),
        { key: 'hm', kind: 'mobile' as const, src: data.shots.homeMobile, label: `${labels.home} · ${labels.mobile}` },
        ...(data.shots.pdpMobile ? [{ key: 'pm', kind: 'mobile' as const, src: data.shots.pdpMobile, label: `${labels.pdp} · ${labels.mobile}` }] : []),
      ]
    : []
  const n = slides.length

  useEffect(() => {
    if (open) setI(0)
  }, [open, data?.name])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % n)
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + n) % n)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, n, onClose])

  const dark = skin.frame === 'brutalist' || skin.card.includes('bg-[#1d1d1f]') || skin.card.includes('deco-navy') || skin.card.includes('stone-900')
  const panel = skin.frame === 'apple' ? 'rounded-[28px]' : skin.frame === 'luxury' ? 'rounded-none' : 'rounded-none border-2 border-stone-900'
  const panelBg = dark ? 'bg-[#141416] text-[#f5f5f7]' : 'bg-white text-[#1d1d1f]'
  const slide = slides[i]

  const content = (
    <AnimatePresence>
      {open && data && slide && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={data.name}
          className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden ${panel} ${panelBg} shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:flex-row`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* carousel */}
            <div className={`relative flex flex-col ${dark ? 'bg-[#0b0b0c]' : 'bg-[#f5f5f7]'} lg:w-[58%]`}>
              <div className="flex h-[38vh] items-center justify-center p-5 sm:h-[46vh] lg:h-[70vh] lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.key}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className={slide.kind === 'desktop' ? 'w-full max-w-[640px]' : 'h-full'}
                  >
                    {slide.kind === 'desktop' ? (
                      <LaptopFrame>
                        <img src={slide.src} alt={`${data.name} — ${slide.label}`} className="absolute inset-0 h-full w-full object-cover object-top" />
                      </LaptopFrame>
                    ) : (
                      <PhoneFrame className="mx-auto h-full" >
                        <img src={slide.src} alt={`${data.name} — ${slide.label}`} className="absolute inset-0 h-full w-full object-cover object-top" />
                      </PhoneFrame>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 pb-4 lg:px-8">
                <button type="button" onClick={() => setI((v) => (v - 1 + n) % n)} className={`press compact-touch h-9 w-9 rounded-full ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`} aria-label={labels.prev}>
                  ‹
                </button>
                <div className="flex items-center gap-2">
                  {slides.map((s, idx) => (
                    <button key={s.key} type="button" onClick={() => setI(idx)} aria-label={s.label} aria-current={idx === i} className={`h-1.5 rounded-full transition-all ${idx === i ? `w-6 ${dark ? 'bg-white' : 'bg-black'}` : `w-2 ${dark ? 'bg-white/40' : 'bg-black/30'}`}`} style={{ minHeight: 6, minWidth: 8 }} />
                  ))}
                </div>
                <button type="button" onClick={() => setI((v) => (v + 1) % n)} className={`press compact-touch h-9 w-9 rounded-full ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`} aria-label={labels.next}>
                  ›
                </button>
              </div>
              <p className={`px-5 pb-4 text-center text-xs ${skin.muted} lg:px-8`}>{slide.label}</p>
            </div>

            {/* facts */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className={`${skin.title} text-2xl`}>{data.name}</h3>
                  <p className={`${skin.muted} mt-1 text-xs`}>{data.meta}</p>
                </div>
                <button type="button" onClick={onClose} className={`press compact-touch shrink-0 rounded-full px-3 py-1.5 text-xs ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
                  {labels.close}
                </button>
              </div>
              <span className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[10px] ${data.badge.className}`}>{data.badge.text}</span>
              <p className={`${skin.accent} mt-4 text-sm font-medium`}>{data.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed">{data.description}</p>

              {data.stats.length > 0 && (
                <>
                  <p className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{labels.facts}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {data.stats.map((s) => (
                      <div key={s.label} className={`rounded-[14px] p-3 ${dark ? 'bg-white/5' : 'bg-black/[0.04]'}`}>
                        <p className="text-lg font-semibold leading-tight">{s.value}</p>
                        <p className={`${skin.muted} mt-0.5 text-[11px] leading-tight`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {data.results.length > 0 && (
                <>
                  <p className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{labels.results}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {data.results.map((s) => (
                      <div key={s.label} className={`rounded-[14px] p-3 ${dark ? 'bg-[#34c759]/15' : 'bg-[#34c759]/10'}`}>
                        <p className="text-lg font-semibold leading-tight">{s.value}</p>
                        <p className={`${skin.muted} mt-0.5 text-[11px] leading-tight`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{labels.stack}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.stack.map((t) => (
                  <span key={t} className={skin.chip}>
                    {t}
                  </span>
                ))}
              </div>

              {data.url && (
                <a href={data.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} mt-6 inline-block text-sm font-medium`}>
                  {labels.visit} ›
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
