import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, m, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { LaptopFrame, PhoneFrame } from './DeviceFrame'
import { GlassControls } from './CarouselControls'
import { carouselTokens, type Skin } from './skins'
import type { FrameShots } from './ProjectFrame'
import { Carousel } from '../../vendor/carousel'
import type { StoreMetrics } from '../../data/registry'
import type { ResultMetricId, StoreResults } from '../../data/results'
import { CompareTable, CountUp, Gauge, IndexLine, MetricBars, SlopeChart } from './charts'

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
  metrics?: StoreMetrics // Lighthouse lab scores, live stores only
  story?: StoreResults // indexed before/after metrics — sample shapes until measured
  stats: CaseStudyStat[] // verifiable store facts (build window, ladders, modules…)
  results: CaseStudyStat[] // measured business outcomes; hidden when empty
  stack: string[]
  shots: FrameShots
}

export interface CaseStudyLabels {
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
  metrics: string
  perf: string
  a11y: string
  bp: string
  seo: string
  lcp: string
  measured: string
  story: string
  sampleBadge: string
  sampleNote: string
  measuredFrom: string
  before: string
  after: string
  metric: Record<ResultMetricId, string>
}

interface ProjectModalProps {
  open: boolean
  data: CaseStudyData | null
  skin: Skin
  labels: CaseStudyLabels
  onClose: () => void
}

const EASE = [0.23, 1, 0.32, 1] as const

/** Lighthouse's own bands: 90+ green, 50–89 orange, below red. */
const band = (score: number) => (score >= 90 ? '#34c759' : score >= 50 ? '#ff9f0a' : '#ff3b30')

const RING_R = 22
const RING_C = 2 * Math.PI * RING_R

/**
 * One Lighthouse category as an animated gauge: the arc fills and the number counts up when the
 * sheet opens (one second, strong ease-out — a data reveal, not a UI transition). Reduced motion
 * shows the final state at once.
 */
function ScoreRing({ value, label, delay, dark, tile }: { value: number; label: string; delay: number; dark: boolean; tile: string }) {
  const reduced = useReducedMotion()
  const mv = useMotionValue(reduced ? value : 0)
  const shown = useTransform(mv, (v) => Math.round(v))
  const dash = useTransform(mv, (v) => RING_C - (Math.max(0, Math.min(100, v)) / 100) * RING_C)
  useEffect(() => {
    if (reduced) {
      mv.set(value)
      return
    }
    const ctrl = animate(mv, value, { duration: 1, delay, ease: [0.23, 1, 0.32, 1] })
    return () => ctrl.stop()
  }, [value, delay, reduced, mv])
  return (
    <div className={`${tile} flex items-center gap-3`}>
      <svg viewBox="0 0 56 56" className="h-14 w-14 shrink-0" aria-hidden="true">
        <circle cx="28" cy="28" r={RING_R} fill="none" strokeWidth="5" stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <m.circle
          cx="28"
          cy="28"
          r={RING_R}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          stroke={band(value)}
          strokeDasharray={RING_C}
          style={{ strokeDashoffset: dash }}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <div className="min-w-0">
        <m.p className="text-2xl font-semibold leading-none tabular-nums" aria-label={`${label}: ${value}`}>
          {shown}
        </m.p>
        <p className={`mt-1 text-[11px] leading-tight ${dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>{label}</p>
      </div>
    </div>
  )
}

/**
 * Case-study sheet: the house carousel with the four captures on the left, the numbers on the right.
 * Metrics first (Lighthouse, then any measured outcome), store facts second, the engineering trail
 * last as a footnote. The carousel is enclosed, one slide at a time, glass controls on every viewport.
 */
export function ProjectModal({ open, data, skin, labels, onClose }: ProjectModalProps) {
  const slides = data
    ? [
        { key: 'hd', kind: 'desktop' as const, src: data.shots.homeDesktop, label: `${labels.home} · ${labels.desktop}` },
        ...(data.shots.pdpDesktop ? [{ key: 'pd', kind: 'desktop' as const, src: data.shots.pdpDesktop, label: `${labels.pdp} · ${labels.desktop}` }] : []),
        { key: 'hm', kind: 'mobile' as const, src: data.shots.homeMobile, label: `${labels.home} · ${labels.mobile}` },
        ...(data.shots.pdpMobile ? [{ key: 'pm', kind: 'mobile' as const, src: data.shots.pdpMobile, label: `${labels.pdp} · ${labels.mobile}` }] : []),
      ]
    : []

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const dark = skin.dark
  const panel = skin.frame === 'apple' ? 'rounded-[28px]' : skin.frame === 'luxury' ? 'rounded-none' : 'rounded-none border-2 border-stone-900'
  const panelBg = dark ? 'bg-[#141416] text-[#f5f5f7]' : 'bg-white text-[#1d1d1f]'
  const radius = skin.frame === 'apple' ? 'rounded-[14px]' : 'rounded-none'
  const tile = `${radius} p-3 ${dark ? 'bg-white/5' : 'bg-black/[0.04]'}`
  const label = `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`
  const accent = skin.frame === 'apple' ? (dark ? '#2997ff' : '#0071e3') : skin.frame === 'luxury' ? '#C9A962' : '#dc2626'

  const scores = data?.metrics
    ? [
        { key: 'perf', label: labels.perf, value: data.metrics.perf },
        { key: 'a11y', label: labels.a11y, value: data.metrics.a11y },
        { key: 'bp', label: labels.bp, value: data.metrics.bp },
        { key: 'seo', label: labels.seo, value: data.metrics.seo },
      ]
    : []

  const content = (
    <AnimatePresence>
      {open && data && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label={data.name}
          className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <m.div
            className={`relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden ${panel} ${panelBg} shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:flex-row`}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15, ease: EASE } }}
            transition={{ type: 'spring', duration: 0.55, bounce: 0.14 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* captures — the house carousel, enclosed */}
            <div className={`flex flex-col justify-center p-5 lg:w-[56%] lg:p-8 ${dark ? 'bg-[#0b0b0c]' : 'bg-[#f5f5f7]'}`} style={carouselTokens(skin.frame, dark)}>
              <Carousel
                slidesPerView={1}
                peek={0}
                mobilePeek={0}
                gap={16}
                edgeBleed={false}
                controlsOnMobile
                reveal={false}
                ariaLabel={data.name}
                renderControls={(state) => <GlassControls state={state} skin={skin} labels={{ prev: labels.prev, next: labels.next }} />}
              >
                {slides.map((slide) => (
                  <figure key={slide.key} className="m-0 flex h-[36vh] flex-col items-center justify-center sm:h-[44vh] lg:h-[62vh]">
                    {slide.kind === 'desktop' ? (
                      <div className="w-full max-w-[640px]">
                        <LaptopFrame>
                          <img src={slide.src} alt={`${data.name} — ${slide.label}`} className="absolute inset-0 h-full w-full object-cover object-top" draggable={false} />
                        </LaptopFrame>
                      </div>
                    ) : (
                      <div className="h-full">
                        <PhoneFrame className="mx-auto h-full">
                          <img src={slide.src} alt={`${data.name} — ${slide.label}`} className="absolute inset-0 h-full w-full object-cover object-top" draggable={false} />
                        </PhoneFrame>
                      </div>
                    )}
                    <figcaption className={`${skin.muted} mt-3 text-center text-xs`}>{slide.label}</figcaption>
                  </figure>
                ))}
              </Carousel>
            </div>

            {/* numbers */}
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

              {data.story && data.story.charts.length > 0 && (
                <>
                  <div className="mt-6 flex items-center gap-2">
                    <p className={label}>{labels.story}</p>
                    {data.story.sample && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${dark ? 'bg-[#ff9f0a]/20 text-[#ffbf4d]' : 'bg-[#ff9f0a]/15 text-[#8a5300]'}`}>{labels.sampleBadge}</span>
                    )}
                  </div>
                  {/* One chart per story beat, and a different chart per kind of beat: a line for a trend,
                      a slope for a before/after comparison, gauges for shares, bars for units of time or count. */}
                  {/* the headline result, one glance before the detail */}
                  {(() => {
                    const lead = data.story.charts.flatMap((ch) => ch.metrics).find((mm) => mm.before > 0)
                    if (!lead) return null
                    const d = Math.round(((lead.after - lead.before) / lead.before) * 100)
                    const good = lead.invert ? d <= 0 : d >= 0
                    return (
                      <p className="mt-3 flex items-baseline gap-3">
                        <CountUp value={Math.abs(d)} prefix={d >= 0 ? '+' : '−'} suffix="%" delay={0.15} className={`text-4xl font-semibold tabular-nums tracking-[-0.03em] ${good ? 'text-[#34c759]' : 'text-[#ff3b30]'}`} />
                        <span className={`${skin.muted} text-sm`}>{labels.metric[lead.id]}</span>
                      </p>
                    )
                  })()}
                  <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    {data.story.charts.map((ch, i) => {
                      const key = `${ch.kind}-${ch.metrics.map((mm) => mm.id).join('-')}`
                      const common = { color: accent, dark, labels: { metric: labels.metric, before: labels.before, after: labels.after }, delay: 0.2 + i * 0.12 }
                      if (ch.kind === 'slope')
                        return (
                          <div key={key} className="sm:col-span-2">
                            <SlopeChart metrics={ch.metrics} {...common} />
                          </div>
                        )
                      if (ch.kind === 'gauge')
                        return (
                          <div key={key} className="flex flex-wrap gap-x-8 gap-y-4 sm:col-span-2">
                            {ch.metrics.map((mm, j) => (
                              <Gauge key={mm.id} metric={mm} {...common} delay={common.delay + j * 0.1} />
                            ))}
                          </div>
                        )
                      if (ch.kind === 'bars') return <MetricBars key={key} metrics={ch.metrics} {...common} />
                      if (ch.kind === 'table' && ch.rows)
                        return (
                          <div key={key} className="sm:col-span-2">
                            <CompareTable rows={ch.rows} dark={dark} labels={common.labels} delay={common.delay} />
                          </div>
                        )
                      return <IndexLine key={key} metric={ch.metrics[0]} {...common} />
                    })}
                  </div>
                  <p className={`${skin.muted} mt-3 text-[11px] leading-snug`}>
                    {data.story.sample ? labels.sampleNote : labels.measuredFrom.replace('{source}', data.story.source ?? '').replace('{period}', data.story.period ?? '')}
                  </p>
                </>
              )}

              {data.metrics && (
                <>
                  <p className={`mt-6 ${label}`}>{labels.metrics}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {scores.map((s, i) => (
                      <ScoreRing key={`${data.name}-${s.key}`} value={s.value} label={s.label} delay={0.15 + i * 0.08} dark={dark} tile={tile} />
                    ))}
                  </div>
                  <p className={`${skin.muted} mt-2 text-[11px] leading-snug`}>
                    {data.metrics.lcp ? `${labels.lcp} ${data.metrics.lcp} · ` : ''}
                    {labels.measured.replace('{date}', data.metrics.measured).replace('{runs}', String(data.metrics.runs))}
                  </p>
                </>
              )}

              {data.results.length > 0 && (
                <>
                  <p className={`mt-6 ${label}`}>{labels.results}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {data.results.map((s) => (
                      <div key={s.label} className={`${radius} p-3 ${dark ? 'bg-[#34c759]/15' : 'bg-[#34c759]/10'}`}>
                        <p className="text-lg font-semibold leading-tight">{s.value}</p>
                        <p className={`${skin.muted} mt-0.5 text-[11px] leading-tight`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {data.stats.length > 0 && (
                <>
                  <p className={`mt-6 ${label}`}>{labels.facts}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {data.stats.map((s) => (
                      <div key={s.label} className={tile}>
                        <p className="text-base font-semibold leading-tight">{s.value}</p>
                        <p className={`${skin.muted} mt-0.5 text-[11px] leading-tight`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className={`mt-6 ${label}`}>{labels.stack}</p>
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
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
