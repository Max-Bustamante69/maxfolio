import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, m, useDragControls, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { LaptopFrame, PhoneFrame } from './DeviceFrame'
import { GlassControls } from './CarouselControls'
import { carouselTokens, type Skin } from './skins'
import type { FrameShots } from './ProjectFrame'
import { Carousel } from '../../vendor/carousel'
import type { StoreMetrics } from '../../data/registry'
import type { StoreTelemetry } from '../../data/telemetry'
import type { CommerceLabels } from '../../content/types'
import { CommitsLine, CompareBars, CountUp, DiscountLadder, Gauge, PriceRangeBar, VolumeBars, WeeklyBars, type CompareRow } from './charts'

export interface CaseStudyStat {
  label: string
  value: string
}

/** Every number here traces to commerce.json (storefront public data), telemetry.json (git history)
 *  or a hand-verified registry fact — see ProjectModal's "Visualized" block. A field is omitted
 *  upstream (Gallery.caseStudyFor) whenever the real data behind it doesn't exist for this store. */
export interface CaseStudyCharts {
  compare: CompareRow[] // vs. fleet median: only metrics with a real fleet median
  onSaleShare: number | null // 0..1, share of variants with a real compare-at markdown
  ladder: number[] | null // parsed from the registry's `ladder` fact, e.g. [10, 20]
  weeklyCommits: { weeks: number[]; weekOf: string } | null
  priceRange: { min: number; max: number; median: number | null; currency: string } | null
  fetchedAt: string | null // commerce.json's fetchedAt, ISO — only set when a live commerce entry exists
}

/** One "By the numbers" tile: catalog, offer, delivery or reach — see src/data/commerceLines.ts. */
export interface CommerceTile {
  label: string
  value: string
  deltas: string[] // "vs fleet" chips, only ever populated when both sides are real measured numbers
}

export interface CaseStudyData {
  name: string
  url?: string
  meta: string // "Specialty coffee · 2026 · Built"
  badge: { text: string; className: string }
  tagline: string
  description: string
  metrics?: StoreMetrics // Lighthouse lab scores, live stores only
  trail?: { data: StoreTelemetry; range: string } // real build telemetry from the store repo's git history — collapsed, de-emphasized
  commerceTiles: CommerceTile[] // catalog / offer / delivery / reach — the sheet's lead numbers
  stats: CaseStudyStat[] // verifiable store facts (build window, ladders, modules…)
  results: CaseStudyStat[] // measured business outcomes; hidden when empty
  stack: string[]
  shots: FrameShots
  charts: CaseStudyCharts
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
  trail: string
  trailNote: string
  perWeek: string
  peak: string
  codebase: string
  liquidLines: string
  islandLines: string
  sectionsCount: string
  commits: string
  weeks: string
  copyLink: string
  copied: string
  commerce: CommerceLabels
  charts: {
    title: string
    compareLabel: string
    thisStore: string
    fleetMedian: string
    weeksMetric: string
    productsMetric: string
    priceMetric: string
    saleShare: string
    ladder: string
    priceBand: string
    min: string
    max: string
    sourceStorefront: string
    sourceGit: string
    sourceFacts: string
  }
}

interface ProjectModalProps {
  open: boolean
  data: CaseStudyData | null
  skin: Skin
  labels: CaseStudyLabels
  onClose: () => void
  /** Prev/next inside the sheet, cycling through the same ordered list the caller's index shows.
   *  Omitted (or a list of ≤1) hides the nav controls and disarms the arrow keys. */
  onPrev?: () => void
  onNext?: () => void
  /** For the price-band chart's currency formatting (Intl.NumberFormat). */
  intlLocale: string
}

const EASE = [0.23, 1, 0.32, 1] as const

/** Small header glyphs — same stroke language as the collapsed-trail disclosure chevron below. */
const ChevronGlyph = ({ dir }: { dir: 1 | -1 }) => (
  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d={dir < 0 ? 'M12 5l-6 5 6 5' : 'M8 5l6 5-6 5'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const LinkGlyph = () => (
  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M8.5 11.5l3-3M7 13l-1.7 1.7a2.6 2.6 0 01-3.7-3.7L3.3 9.3M12.7 7.7L14.5 6a2.6 2.6 0 013.7 3.7L16.5 11.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const CloseGlyph = () => (
  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
  </svg>
)

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
export function ProjectModal({ open, data, skin, labels, onClose, onPrev, onNext, intlLocale }: ProjectModalProps) {
  const slides = data
    ? [
        { key: 'hd', kind: 'desktop' as const, src: data.shots.homeDesktop, label: `${labels.home} · ${labels.desktop}` },
        ...(data.shots.pdpDesktop ? [{ key: 'pd', kind: 'desktop' as const, src: data.shots.pdpDesktop, label: `${labels.pdp} · ${labels.desktop}` }] : []),
        { key: 'hm', kind: 'mobile' as const, src: data.shots.homeMobile, label: `${labels.home} · ${labels.mobile}` },
        ...(data.shots.pdpMobile ? [{ key: 'pm', kind: 'mobile' as const, src: data.shots.pdpMobile, label: `${labels.pdp} · ${labels.mobile}` }] : []),
      ]
    : []

  // Keep the latest prev/next in refs so the one keydown listener attached for the sheet's whole
  // open lifetime always calls the current handlers (the caller's ordered list may reflow underneath).
  const prevRef = useRef(onPrev)
  const nextRef = useRef(onNext)
  prevRef.current = onPrev
  nextRef.current = onNext

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prevRef.current?.()
      else if (e.key === 'ArrowRight') nextRef.current?.()
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
  const reduced = useReducedMotion()
  // Scroll-progress hairline for the numbers column: its own scroller, not the page.
  const scrollerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollerRef })
  const readProgress = useSpring(scrollYProgress, { stiffness: 300, damping: 40, mass: 0.3 })
  // Phones: the sheet is a bottom sheet with a grabber; dragging it down past a threshold dismisses it.
  const drag = useDragControls()
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable: the URL bar already carries the link */
    }
  }
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

  // No `.compact-touch` here: these are primary navigation/action controls (not decorative dots),
  // so they keep the app-wide 44px tap-target floor even though the glyph inside stays small.
  const navBtn = `press inline-flex h-11 w-11 items-center justify-center rounded-full transition-opacity disabled:pointer-events-none disabled:opacity-25 ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`
  const actionBtn = `press inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`

  // "Visualized" charts, built once per open store from `data.charts` (real numbers only — see
  // Gallery.caseStudyFor, which omits any field the underlying data doesn't actually have).
  const ch = data?.charts
  const cl = labels.charts
  const compareRows =
    ch?.compare.map((r) => ({
      ...r,
      label: r.key === 'weeks' ? cl.weeksMetric : r.key === 'products' ? cl.productsMetric : cl.priceMetric,
    })) ?? []
  const fetchedDate = ch?.fetchedAt ? new Date(ch.fetchedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null
  const chartSources = [
    (ch?.compare.length || ch?.onSaleShare != null || ch?.priceRange) && fetchedDate ? cl.sourceStorefront.replace('{date}', fetchedDate) : null,
    ch?.weeklyCommits ? cl.sourceGit : null,
    ch?.ladder ? cl.sourceFacts : null,
  ].filter((s): s is string => !!s)
  const hasCharts = !!ch && (compareRows.length > 0 || ch.onSaleShare != null || !!ch.ladder || !!ch.weeklyCommits || !!ch.priceRange)

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
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* grabber (phones): the only drag surface, so the inner scroll and the carousel keep their gestures */}
            <div className="flex shrink-0 justify-center py-2 sm:hidden" onPointerDown={(e) => drag.start(e)} style={{ touchAction: 'none' }} aria-hidden="true">
              <span className={`h-1.5 w-10 rounded-full ${dark ? 'bg-white/25' : 'bg-black/20'}`} />
            </div>
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
            <div className="relative flex min-h-0 flex-1 flex-col">
              {/* Two-row header: name + status on top, meta + prev/next + actions beneath. It sits
                  outside the scroller below (a plain flex sibling, `shrink-0`) so it never scrolls
                  with the content — simpler and more robust than `position: sticky` inside the pane. */}
              <header className={`relative shrink-0 border-b px-6 py-6 lg:px-8 ${dark ? 'border-white/10' : 'border-black/10'}`}>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <h3 className={`${skin.title} min-w-0 truncate text-2xl md:text-3xl`}>{data.name}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${data.badge.className}`}>{data.badge.text}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
                  <p className={`${skin.muted} text-xs`}>{data.meta}</p>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {(onPrev || onNext) && (
                      <div className="flex items-center gap-1.5" role="group" aria-label={`${labels.prev} / ${labels.next}`}>
                        <button type="button" onClick={onPrev} disabled={!onPrev} aria-label={labels.prev} className={navBtn}>
                          <ChevronGlyph dir={-1} />
                        </button>
                        <button type="button" onClick={onNext} disabled={!onNext} aria-label={labels.next} className={navBtn}>
                          <ChevronGlyph dir={1} />
                        </button>
                      </div>
                    )}
                    <button type="button" onClick={copyLink} className={actionBtn} aria-live="polite">
                      <LinkGlyph />
                      <span className="hidden sm:inline">{copied ? labels.copied : labels.copyLink}</span>
                    </button>
                    <button type="button" onClick={onClose} className={actionBtn}>
                      <CloseGlyph />
                      <span className="hidden sm:inline">{labels.close}</span>
                    </button>
                  </div>
                </div>
                {!reduced && (
                  <m.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-left" style={{ scaleX: readProgress, backgroundColor: accent }} />
                )}
              </header>

              {/* Lenis's own wheel listener lives on `window` and drives page scroll; with the body locked
                  (overflow: hidden, above) while this sheet is open, a plain wheel gesture here would be
                  captured by Lenis and try to scroll a page that cannot move — dead-ending the sheet's own
                  scroll under a mouse wheel (touch was never affected: Lenis's `syncTouch` defaults off, so
                  touch scroll here was always native). `data-lenis-prevent` opts this scroller out so the
                  wheel reaches its native `overflow-y-auto` behavior instead. */}
              <div ref={scrollerRef} className="relative flex-1 overflow-y-auto p-6 lg:p-8" data-lenis-prevent>
                <p className={`${skin.accent} text-sm font-medium`}>{data.tagline}</p>
                <p className="mt-2 text-sm leading-relaxed">{data.description}</p>

                {/* Commerce-oriented, not engineering telemetry: catalog, offer, delivery, reach — the
                    same four angles the index chip and gallery caption each show one slice of. */}
                <p className={`mt-6 ${label}`}>{labels.commerce.title}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {data.commerceTiles.map((t) => (
                    <div key={t.label} className={tile}>
                      <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${skin.muted}`}>{t.label}</p>
                      <p className="mt-1 text-[13px] font-medium leading-snug">{t.value}</p>
                      {t.deltas.length > 0 && <p className={`mt-1 text-[11px] leading-tight ${skin.muted}`}>{t.deltas.join(' · ')}</p>}
                    </div>
                  ))}
                </div>

                {/* "Visualized": the same commerce/telemetry numbers above, drawn as charts. Every
                    number traces to a real source (storefront public data, git history, or a
                    hand-verified registry fact) — nothing here is a conversion/AOV figure, which the
                    owner does not have measured for these stores. Omitted piece by piece when a store
                    doesn't have that particular real number (see Gallery.caseStudyFor). */}
                {hasCharts && (
                  <>
                    <p className={`mt-6 ${label}`}>{cl.title}</p>
                    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      {compareRows.length > 0 && (
                        <div className={`${tile} sm:col-span-2`}>
                          <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${skin.muted}`}>{cl.compareLabel}</p>
                          <div className="mt-3">
                            <CompareBars rows={compareRows} thisLabel={cl.thisStore} fleetLabel={cl.fleetMedian} color={accent} dark={dark} delay={0.1} />
                          </div>
                        </div>
                      )}
                      {ch!.onSaleShare != null && (
                        <div className={tile}>
                          <Gauge value={ch!.onSaleShare * 100} label={cl.saleShare} color={accent} dark={dark} delay={0.15} />
                        </div>
                      )}
                      {ch!.ladder && (
                        <div className={tile}>
                          <DiscountLadder steps={ch!.ladder} label={cl.ladder} color={accent} dark={dark} delay={0.15} />
                        </div>
                      )}
                      {ch!.weeklyCommits && (
                        <div className={tile}>
                          <CommitsLine weeks={ch!.weeklyCommits.weeks} caption={labels.perWeek} peakLabel={labels.peak.replace('{n}', String(Math.max(...ch!.weeklyCommits.weeks)))} color={accent} dark={dark} delay={0.15} />
                        </div>
                      )}
                      {ch!.priceRange && (
                        <div className={`${tile} ${ch!.weeklyCommits || ch!.ladder || ch!.onSaleShare != null ? '' : 'sm:col-span-2'}`}>
                          <PriceRangeBar
                            min={ch!.priceRange.min}
                            max={ch!.priceRange.max}
                            median={ch!.priceRange.median}
                            currency={ch!.priceRange.currency}
                            intlLocale={intlLocale}
                            minLabel={cl.min}
                            maxLabel={cl.max}
                            medianLabel={cl.fleetMedian}
                            label={cl.priceBand}
                            color={accent}
                            dark={dark}
                            delay={0.2}
                          />
                        </div>
                      )}
                    </div>
                    {chartSources.length > 0 && <p className={`${skin.muted} mt-2 text-[11px] leading-snug`}>{chartSources.join(' · ')}</p>}
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

              {/* The real build trail (commits, weekly shape, codebase volume) — kept, just de-emphasized
                  behind a native disclosure so the commerce numbers above lead the sheet. */}
              {data.trail && (
                <details className="group mt-8 border-t pt-4" style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <summary className={`press cursor-pointer list-none ${label}`}>
                    <span className="inline-flex items-center gap-1.5">
                      {labels.commerce.engineering}
                      <svg viewBox="0 0 20 20" className="h-3 w-3 shrink-0 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M7 5l6 5-6 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-3">
                    {/* the headline is real: commits in the store repo, then the shape of the build week by week */}
                    <p className="flex items-baseline gap-3">
                      <CountUp value={data.trail.data.commits} delay={0.05} className="text-3xl font-semibold tabular-nums tracking-[-0.03em]" />
                      <span className={`${skin.muted} text-sm`}>
                        {labels.commits} · {data.trail.data.weeks.length} {labels.weeks}
                      </span>
                    </p>
                    <div className="mt-4">
                      <WeeklyBars weeks={data.trail.data.weeks} weekOf={data.trail.data.weekOf} caption={labels.perWeek} peakLabel={labels.peak.replace('{n}', String(data.trail.data.busiestWeek.commits))} color={accent} dark={dark} delay={0.1} />
                    </div>
                    <p className={`mt-5 ${label}`}>{labels.codebase}</p>
                    <div className="mt-2">
                      <VolumeBars
                        rows={[
                          { label: labels.sectionsCount, value: data.trail.data.sections },
                          { label: labels.liquidLines, value: data.trail.data.lines.liquid },
                          ...(data.trail.data.lines.islands > 0 ? [{ label: labels.islandLines, value: data.trail.data.lines.islands }] : []),
                        ]}
                        color={accent}
                        dark={dark}
                        delay={0.2}
                      />
                    </div>
                    <p className={`${skin.muted} mt-3 text-[11px] leading-snug`}>{labels.trailNote.replace('{n}', String(data.trail.data.commits)).replace('{range}', data.trail.range)}</p>
                  </div>
                </details>
              )}
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
