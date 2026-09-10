import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m, useDragControls, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { LaptopFrame, PhoneFrame } from './DeviceFrame'
import { GlassControls } from './CarouselControls'
import { carouselTokens, sheetTokens, type Skin } from './skins'
import type { FrameShots } from './ProjectFrame'
import { Carousel } from '../../vendor/carousel'
import { CountUp, CwvStrip, DeliveryPairedBar, goodText, IndexAreaLine, LoadTimePairedBar, PerfDualRing, ScoreRingsRow, SpeedGauge, type CwvData, type RingMetric } from './charts'

/**
 * "Impact" — the sheet's entire numbers story (2026-09-10): header → captures → tagline/description →
 * Impact → stack → Visit store. Conversion, order value, revenue, revenue per visitor and the dual
 * ring's thin inner "before" arc are illustrative, deterministic per store (seeded by slug, see
 * src/data/illustrative.ts), always present, and anchored to the CV's own measured ranges. `delivery`'s
 * `weeks` is REAL (telemetry.json / the registry's build window); its `referenceWeeks` is an
 * illustrative "typical agency" reference. `rings`, `perfDual.after`, `cwv` and `speed` are REAL
 * (src/data/lighthouse.json) and null piece by piece whenever that store has no measured score for it —
 * the whole chart it feeds is then omitted, never estimated. `loadTime` pairs the real mobile LCP with
 * an illustrative "before" anchor (loadTimeSeries) and is null under the identical condition as `speed`.
 */
export interface ImpactCharts {
  conversion: { points: number[]; low: number[]; high: number[]; deltaPct: number }
  orderValue: { points: number[]; deltaPct: number }
  revenue: { points: number[]; deltaPct: number } // compounded conversion × order value × organic traffic, illustrative
  rpv: { points: number[]; deltaPct: number }
  delivery: { weeks: number; referenceWeeks: number; deltaPct: number } | null // weeks REAL, referenceWeeks illustrative
  rings: { metrics: RingMetric[]; fetchedAt: string } | null // desktop Performance/Accessibility/SEO, ≥50 only
  perfDual: { before: number; after: number; fetchedAt: string } | null // desktop performance before→after
  cwv: { data: CwvData; fetchedAt: string } | null // CrUX field data, when the origin has enough real-user traffic
  speed: { seconds: number; fetchedAt: string; form: 'mobile' | 'desktop' } | null // lab LCP gauge fallback when `cwv` is null
  loadTime: { beforeSeconds: number; afterSeconds: number; deltaPct: number; fetchedAt: string; form: 'mobile' | 'desktop' } | null
}

export interface CaseStudyData {
  name: string
  url?: string
  meta: string // "Specialty coffee · 2026 · Built"
  badge: { text: string; className: string }
  tagline: string
  description: string
  stack: string[]
  shots: FrameShots
  impact: ImpactCharts
}

export interface CaseStudyLabels {
  close: string
  prev: string
  next: string
  home: string
  pdp: string
  desktop: string
  mobile: string
  stack: string
  visit: string
  copyLink: string
  copied: string
  impact: {
    title: string
    conversionLabel: string
    rpvLabel: string
    orderValueLabel: string
    revenueLabel: string
    ringsCaption: string
    ringsCaptionWithDelta: string
    before: string
    after: string
    perfDualLabel: string
    cwvTitle: string
    cwvLcp: string
    cwvInp: string
    cwvCls: string
    cwvSource: string
    speedLabel: string
    speedTarget: string
    speedSource: string
    disclaimer: string
    infoLabel: string
    infoSentence: string
    chipConversionLabel: string
    chipRevenueLabel: string
    chipLoadTimeLabel: string
    chipDeliveryLabel: string
    deliveryWeeksUnit: string
    loadTimeLabel: string
    loadTimeSource: string
    deliveryLabel: string
    deliveryBeforeLabel: string
    deliveryAfterLabel: string
    deliverySource: string
    formMobile: string
    formDesktop: string
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
const InfoGlyph = () => (
  <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="10" cy="10" r="7.25" />
    <path d="M10 9.2v4.3M10 6.5h.01" strokeLinecap="round" />
  </svg>
)

/**
 * The small print RULE (1) requires under every illustrative figure, plus a one-sentence info
 * affordance behind an `aria-expanded` toggle. `key`-ed by the caller to the open store so the
 * disclosure always starts collapsed on a fresh sheet/prev/next instead of carrying state across stores.
 */
function ImpactDisclosure({ disclaimer, infoLabel, infoSentence, dark }: { disclaimer: string; infoLabel: string; infoSentence: string; dark: boolean }) {
  const [open, setOpen] = useState(false)
  const muted = dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'
  return (
    <div className="mt-2">
      {/* The button itself stays a true 44x44 tap target (the site-wide `button{min-height:44px}` floor
          in src/styles/index.css enforces that on any button, whatever height/width utility it carries),
          but only the inner span paints — a small, restrained 16px dot — so the affordance next to this
          tiny 11px line doesn't turn into an oversized grey disc dominating the disclosure it is labeling. */}
      <div className="flex items-center gap-1">
        <p className={`text-[11px] leading-snug ${muted}`}>{disclaimer}</p>
        <button type="button" aria-expanded={open} aria-label={infoLabel} onClick={() => setOpen((o) => !o)} className={`press inline-flex shrink-0 items-center justify-center rounded-full ${muted}`}>
          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
            <InfoGlyph />
          </span>
        </button>
      </div>
      {open && <p className={`mt-1 text-[11px] leading-snug ${muted}`}>{infoSentence}</p>}
    </div>
  )
}

/**
 * Case-study sheet: the house carousel with the four captures on the left, the Impact block on the
 * right. Header → captures → tagline/description → Impact → stack → Visit store (2026-09-10) — the
 * sheet's entire numbers story lives in Impact; there is no separate facts/results/metrics section.
 */
export function ProjectModal({ open, data, skin, labels, onClose, onPrev, onNext }: ProjectModalProps) {
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
  // Panel/backdrop/control tokens shared with the skills section's `ToolDrawer` — see `sheetTokens`
  // in `./skins` (2026-09-10 extraction, this component's original inline computation moved there).
  const { panel, panelBg, tile, label, accent, navBtn, actionBtn, neoBtnShadow } = sheetTokens(skin)

  // "Impact": conversion, order value, revenue and revenue-per-visitor are illustrative (always
  // present, seeded per store — see src/data/illustrative.ts). Everything else — the score rings, the
  // performance dual ring's real "after" arc, the Core Web Vitals strip, the LCP gauge and the delivery
  // bar's real weeks — is real, straight from src/data/lighthouse.json / src/data/telemetry.json,
  // omitted piece by piece whenever that store has no measured value for it.
  const il = labels.impact
  const impact = data?.impact
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  // Headline strip: four typographic chips computed from the same `impact` data as the charts below
  // them, never a separate number — Conversion, Revenue and Delivery are always present (conversion and
  // revenue are illustrative end to end; delivery's weeks are real); Load time only appears once its
  // real/illustrative pair exists (same condition as the load-time chart below it). No per-chip tag of
  // its own — the design's only disclosure is the small print under the whole section (ImpactDisclosure
  // below). Lighthouse's own delta moved into the score-rings caption (`ringsCaptionWithDelta` below)
  // per the owner's 2026-09-10 call, so it is no longer a headline chip.
  const headlineChips = impact
    ? [
        { key: 'conversion', value: impact.conversion.deltaPct, prefix: '+', suffix: '%', label: il.chipConversionLabel },
        { key: 'revenue', value: impact.revenue.deltaPct, prefix: '+', suffix: '%', label: il.chipRevenueLabel },
        impact.loadTime ? { key: 'loadtime', value: impact.loadTime.deltaPct, prefix: '−', suffix: '%', label: il.chipLoadTimeLabel } : null,
        impact.delivery ? { key: 'delivery', value: impact.delivery.weeks, prefix: '', suffix: il.deliveryWeeksUnit, label: il.chipDeliveryLabel } : null,
      ].filter((c): c is { key: string; value: number; prefix: string; suffix: string; label: string } => !!c)
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
                        <button type="button" onClick={onPrev} disabled={!onPrev} aria-label={labels.prev} className={navBtn} style={neoBtnShadow}>
                          <ChevronGlyph dir={-1} />
                        </button>
                        <button type="button" onClick={onNext} disabled={!onNext} aria-label={labels.next} className={navBtn} style={neoBtnShadow}>
                          <ChevronGlyph dir={1} />
                        </button>
                      </div>
                    )}
                    <button type="button" onClick={copyLink} className={actionBtn} style={neoBtnShadow} aria-live="polite">
                      <LinkGlyph />
                      <span className="hidden sm:inline">{copied ? labels.copied : labels.copyLink}</span>
                    </button>
                    <button type="button" onClick={onClose} className={actionBtn} style={neoBtnShadow}>
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

                {/* "Impact": the sheet's entire numbers story (2026-09-10). Fixed order: headline chips
                    (Conversion, Revenue, Load time, Delivery) → score rings row (caption carries the
                    Lighthouse before→after delta when it exists) → performance dual ring (+ Core Web
                    Vitals or the LCP gauge) → the "time to launch" delivery bar → the four indexed lines
                    (conversion, order value, revenue, revenue per visitor) → the block-level small
                    print, the sheet's only illustrative disclosure (no per-chip/per-chart tag anywhere
                    in this block). Score rings, the dual ring's real "after" arc, the CWV strip, the LCP
                    gauge and the delivery bar's real weeks are real, measured numbers
                    (src/data/lighthouse.json, src/data/telemetry.json); conversion, order value,
                    revenue, revenue per visitor, the dual ring's thin inner "before" arc and the
                    delivery bar's "typical agency" reference are illustrative representations anchored
                    to the CV's own measured ranges. */}
                {impact && (
                  <>
                    <p className={`mt-6 ${label}`}>{il.title}</p>
                    {/* Fixed 2-column grid, not flex-wrap: with up to 4 chips (Conversion/Revenue always,
                        Load time/Delivery conditional) a wrap-based row could leave an odd chip out
                        stretched to the full row width on its own line — a grid keeps every chip the
                        same size and settles into an even 2×2 (or a plain 2×1/lone left-aligned cell)
                        however many of the four are present for this store. */}
                    {headlineChips.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {headlineChips.map((c, i) => (
                          <div key={c.key} className={`${tile} flex flex-col gap-0.5`}>
                            <CountUp value={c.value} prefix={c.prefix} suffix={c.suffix} delay={0.05 + i * 0.05} duration={0.8} className={`text-xl font-semibold leading-none tabular-nums ${goodText(dark)}`} />
                            <span className="text-[11px] leading-tight">{c.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {impact.rings && (
                      <div className={`${tile} mt-3`}>
                        <ScoreRingsRow
                          metrics={impact.rings.metrics}
                          caption={
                            impact.perfDual
                              ? il.ringsCaptionWithDelta.replace('{delta}', String(Math.round(impact.perfDual.after - impact.perfDual.before))).replace('{date}', fmtDate(impact.rings.fetchedAt))
                              : il.ringsCaption.replace('{date}', fmtDate(impact.rings.fetchedAt))
                          }
                          dark={dark}
                          delay={0.05}
                        />
                      </div>
                    )}

                    {(impact.perfDual || impact.cwv || impact.speed || impact.loadTime || impact.delivery) && (
                      <div key={`${data.name}-impact-real`} className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                        {impact.perfDual && (
                          <div className={`${tile} ${impact.cwv || impact.speed || impact.loadTime ? '' : 'sm:col-span-2'}`}>
                            <PerfDualRing before={impact.perfDual.before} after={impact.perfDual.after} label={il.perfDualLabel} beforeLabel={il.before} afterLabel={il.after} dark={dark} delay={0.15} />
                          </div>
                        )}
                        {impact.cwv ? (
                          <div className={`${tile} ${impact.perfDual ? '' : 'sm:col-span-2'}`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${skin.muted}`}>{il.cwvTitle}</p>
                            <div className="mt-3">
                              <CwvStrip data={impact.cwv.data} lcpLabel={il.cwvLcp} inpLabel={il.cwvInp} clsLabel={il.cwvCls} dark={dark} delay={0.25} />
                            </div>
                            <p className={`${skin.muted} mt-2 text-[11px] leading-snug`}>{il.cwvSource.replace('{date}', fmtDate(impact.cwv.fetchedAt))}</p>
                          </div>
                        ) : (
                          impact.speed && (
                            <div className={`${tile} ${impact.perfDual ? '' : 'sm:col-span-2'}`}>
                              <SpeedGauge seconds={impact.speed.seconds} label={il.speedLabel.replace('{form}', impact.speed.form === 'mobile' ? il.formMobile : il.formDesktop)} targetLabel={il.speedTarget.replace('{n}', '2.5')} dark={dark} delay={0.25} />
                              <p className={`${skin.muted} mt-2 text-[11px] leading-snug`}>{il.speedSource.replace('{form}', impact.speed.form === 'mobile' ? il.formMobile : il.formDesktop).replace('{date}', fmtDate(impact.speed.fetchedAt))}</p>
                            </div>
                          )
                        )}
                        {impact.loadTime && (
                          <div className={`${tile} sm:col-span-2`}>
                            <LoadTimePairedBar
                              beforeSeconds={impact.loadTime.beforeSeconds}
                              afterSeconds={impact.loadTime.afterSeconds}
                              deltaPct={impact.loadTime.deltaPct}
                              beforeLabel={il.before}
                              afterLabel={il.after}
                              label={il.loadTimeLabel}
                              dark={dark}
                              delay={0.3}
                            />
                            <p className={`${skin.muted} mt-2 text-[11px] leading-snug`}>{il.loadTimeSource.replace('{form}', impact.loadTime.form === 'mobile' ? il.formMobile : il.formDesktop).replace('{date}', fmtDate(impact.loadTime.fetchedAt))}</p>
                          </div>
                        )}
                        {impact.delivery && (
                          <div className={`${tile} sm:col-span-2`}>
                            <DeliveryPairedBar
                              beforeWeeks={impact.delivery.referenceWeeks}
                              afterWeeks={impact.delivery.weeks}
                              deltaPct={impact.delivery.deltaPct}
                              beforeLabel={il.deliveryBeforeLabel}
                              afterLabel={il.deliveryAfterLabel}
                              label={il.deliveryLabel}
                              weekUnit={il.deliveryWeeksUnit}
                              color={accent}
                              dark={dark}
                              delay={0.3}
                            />
                            <p className={`${skin.muted} mt-2 text-[11px] leading-snug`}>{il.deliverySource}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Capped at 2 columns, not 4: the sheet is a side panel on desktop, not the full
                        1440 viewport, so a `lg:` breakpoint (keyed to viewport width) fires while the
                        panel itself is still only ~450px wide — four columns there crushed a label like
                        "Order value, indexed" onto three lines pressed against its own numeral. Two
                        columns gives every indexed line, including the wider "Revenue" tile, the same
                        room the headline-chip grid above it uses. */}
                    <div key={`${data.name}-impact-indexed`} className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <div className={tile}>
                        <IndexAreaLine
                          points={impact.conversion.points}
                          band={{ low: impact.conversion.low, high: impact.conversion.high }}
                          label={il.conversionLabel}
                          deltaPct={impact.conversion.deltaPct}
                          color={accent}
                          dark={dark}
                          delay={0.35}
                        />
                      </div>
                      <div className={tile}>
                        <IndexAreaLine points={impact.orderValue.points} label={il.orderValueLabel} deltaPct={impact.orderValue.deltaPct} color={accent} dark={dark} delay={0.4} />
                      </div>
                      {/* Revenue: the compounded headline figure, right next to revenue per visitor — a
                          bigger numeral than its neighbors (`big`) since it's the block's summary claim. */}
                      <div className={tile}>
                        <IndexAreaLine points={impact.revenue.points} label={il.revenueLabel} deltaPct={impact.revenue.deltaPct} color={accent} dark={dark} delay={0.45} big />
                      </div>
                      <div className={tile}>
                        <IndexAreaLine points={impact.rpv.points} label={il.rpvLabel} deltaPct={impact.rpv.deltaPct} color={accent} dark={dark} delay={0.5} />
                      </div>
                    </div>

                    <ImpactDisclosure key={data.name} disclaimer={il.disclaimer} infoLabel={il.infoLabel} infoSentence={il.infoSentence} dark={dark} />
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
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
