// FeaturedImpact — the numbers strip every "featured build" variant renders underneath it
// (FeaturedBuild.tsx mounts this once, after whichever variant `?featured=` picked). A 6-cell bento,
// not a card wall (2026-09-11 owner call: "esta sección sí está bien, tal vez no tantas cards, y algo
// más de bento y de gráficas allí"): three illustrative chart cells (conversion, revenue, load time)
// replicate Gallery.tsx's own `impactFor()` calls exactly — same generators, same order, same real
// desktop LCP fed into `loadTimeSeries` — so these always draw identically to the case-study sheet's
// own charts for this store (`?store=the-gummy-box#gallery`), plus two real cells (Lighthouse rings,
// LCP/TBT/CLS chips) straight from lighthouse.json. No build/commit/week tiles here any more —
// sections/blocks now live in the story above (SplitStoryVariant's design-to-code diagram, the other
// variants' own copy). `[container-type:inline-size]` on EACH cell (not just the outer card) lets every
// clamp()ed numeral and chart scale off that cell's own width rather than the outer card's, so nothing
// here overflows once the bento's cells stop being uniform-width at 390px.
import { useRef, type ReactNode } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { CountUp, IndexAreaLine, LoadTimePairedBar, ScoreRingsRow, type RingMetric } from '../../gallery/charts'
import { sheetTokens } from '../../gallery/skins'
import type { FeaturedData } from './types'

const EASE = [0.23, 1, 0.32, 1] as const

interface TileProps {
  value: number
  label: string
  line: string
  dark: boolean
  title: string
  muted: string
  decimals?: number
  suffix?: string
  show: boolean
}

/** One compact real-number tile — LCP, TBT, CLS. Fixed `tabular-nums` + a container-relative clamp
 *  keeps any of these from ever overflowing its own cell at 390px. `show` gates the count-up on the
 *  same in-view flag the rest of the strip uses: without it, this tile's CountUp would mount (and
 *  finish its 0.8s animation) the instant the whole strip rendered, below the fold, at page load —
 *  long before a normal scroll reaches it, so the motion never actually played. The static fallback
 *  still prints the exact final value, so nothing is ever missing for a11y. */
function Tile({ value, label, line, dark, title, muted, decimals = 0, suffix = '', show }: TileProps) {
  return (
    <div className={`min-w-0 rounded-2xl border p-3 text-center [container-type:inline-size] ${line} ${dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
      <p className={`font-sf text-[clamp(16px,7cqw,22px)] font-semibold leading-none tabular-nums tracking-[-0.02em] ${title}`}>
        {show ? <CountUp value={value} decimals={decimals} suffix={suffix} duration={0.8} /> : `${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`}
      </p>
      <p className={`mt-1.5 text-[10px] uppercase leading-tight tracking-wide ${muted}`}>{label}</p>
    </div>
  )
}

/** A bento cell wrapper: the shared card chrome (radius, border, fill) plus its own container-query
 *  scope, so a chart or numeral inside sizes off THIS cell's width, not the strip's outer width — the
 *  two widths diverge the moment cells stop being uniform (a 2-span cell beside a 3-span cell). */
function Cell({ skin, span, children }: { skin: FeaturedData['skin']; span: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 rounded-2xl border p-4 [container-type:inline-size] md:p-5 ${span} ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
      {children}
    </div>
  )
}

export function FeaturedImpact({ data }: { data: FeaturedData }) {
  const { skin, fb, cs, impact } = data
  const il = cs.impact
  const fi = fb.impact
  const accent = sheetTokens(skin).accent
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const show = inView || !!reduced

  const rings: RingMetric[] = [
    { key: 'perf', label: cs.perf, value: impact.rings.perf },
    { key: 'a11y', label: cs.a11y, value: impact.rings.a11y },
    { key: 'seo', label: cs.seo, value: impact.rings.seo },
  ].filter((r) => r.value >= 50)

  const tileProps = { line: skin.line, dark: skin.dark, title: skin.title, muted: skin.muted, show }

  return (
    <m.div
      ref={ref}
      data-testid="featured-impact"
      className="mt-8 md:mt-10"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
        {/* Row 1 — three illustrative charts, one shared disclaimer under all three (no per-cell tag).
            Each chart only MOUNTS once `show` flips true: IndexAreaLine/LoadTimePairedBar animate the
            instant they mount (not on their own scroll trigger), so mounting them eagerly would draw
            the whole strip in at page load, below the fold, long before a real scroll reaches it — the
            same reason Tile/CountUp above gate on `show`. A fixed min-height placeholder before that
            keeps the grid from jumping once the real chart mounts. */}
        <Cell skin={skin} span="md:col-span-2">
          <div className="min-h-[118px]">
            {show && (
              <IndexAreaLine
                points={impact.conversion.points}
                band={{ low: impact.conversion.low, high: impact.conversion.high }}
                label={il.conversionLabel}
                deltaPct={impact.conversion.deltaPct}
                color={accent}
                dark={skin.dark}
                delay={0.05}
              />
            )}
          </div>
        </Cell>
        <Cell skin={skin} span="md:col-span-2">
          <div className="min-h-[118px]">{show && <IndexAreaLine points={impact.revenue.points} label={il.revenueLabel} deltaPct={impact.revenue.deltaPct} color={accent} dark={skin.dark} delay={0.12} big />}</div>
        </Cell>
        <Cell skin={skin} span="col-span-2 md:col-span-2">
          <div className="min-h-[96px]">
            {show && (
              <LoadTimePairedBar
                beforeSeconds={impact.loadTime.beforeSeconds}
                afterSeconds={impact.loadTime.afterSeconds}
                deltaPct={impact.loadTime.deltaPct}
                beforeLabel={il.before}
                afterLabel={il.after}
                label={il.loadTimeLabel}
                dark={skin.dark}
                delay={0.19}
              />
            )}
          </div>
        </Cell>

        {/* Row 2 — the two real cells: Lighthouse rings, then the LCP/TBT/CLS chips beside them. */}
        {rings.length > 0 && (
          <Cell skin={skin} span="col-span-2 md:col-span-3">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{fi.heading}</p>
            <div className="mt-3 min-h-[44px]">{show && <ScoreRingsRow metrics={rings} dark={skin.dark} delay={0.26} />}</div>
          </Cell>
        )}
        <Cell skin={skin} span="col-span-2 md:col-span-3">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>
            {fi.lcpLabel} · {fi.tbtLabel} · {fi.clsLabel}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Tile value={impact.lcpDesktop} label={fi.lcpLabel} decimals={2} suffix="s" {...tileProps} />
            <Tile value={Math.round(impact.tbtDesktop)} label={fi.tbtLabel} suffix="ms" {...tileProps} />
            <Tile value={impact.clsDesktop} label={fi.clsLabel} decimals={4} {...tileProps} />
          </div>
        </Cell>
      </div>

      <p className={`mt-3 text-center text-[11px] leading-snug ${skin.muted}`}>{il.disclaimer}</p>
      <p className={`mt-1 text-center text-[11px] leading-snug ${skin.muted}`}>{fi.lighthouseCaption}</p>
    </m.div>
  )
}
