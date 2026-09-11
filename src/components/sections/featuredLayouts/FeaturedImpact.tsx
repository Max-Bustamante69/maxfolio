// FeaturedImpact — the numbers strip every "featured build" variant renders underneath it
// (FeaturedBuild.tsx mounts this once, after whichever variant `?featured=` picked). Three
// illustrative hero numerals (conversion, revenue, load time) replicate Gallery.tsx's own
// `impactFor()` calls exactly — same generators, same order, same real desktop LCP fed into
// `loadTimeSeries` — so these always equal the case-study sheet's own hero numerals for this store
// (`?store=the-gummy-box#gallery`). Everything below the one disclaimer is real: desktop Lighthouse
// rings, LCP, TBT, and the build counts from telemetry.json, each group captioned with what was
// measured, where, and when. `[container-type:inline-size]` lets every clamp()ed numeral scale off
// this card's own width rather than the viewport's, so nothing here needs a breakpoint to stay
// readable at 390px.
import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { CountUp, ScoreRingsRow, goodText, type RingMetric } from '../../gallery/charts'
import type { FeaturedData } from './types'

const EASE = [0.23, 1, 0.32, 1] as const

function HeroStat({ value, prefix, suffix, label, dark, delay, show }: { value: number; prefix: string; suffix: string; label: string; dark: boolean; delay: number; show: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
      {show ? (
        <CountUp value={value} prefix={prefix} suffix={suffix} delay={delay} duration={0.8} className={`text-[clamp(28px,7cqw,40px)] font-semibold leading-none tabular-nums ${goodText(dark)}`} />
      ) : (
        <span className={`text-[clamp(28px,7cqw,40px)] font-semibold leading-none tabular-nums ${goodText(dark)}`}>
          {prefix}
          {value}
          {suffix}
        </span>
      )}
      <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.1em]">{label}</span>
    </div>
  )
}

interface TileProps {
  value: number
  label: string
  line: string
  dark: boolean
  title: string
  muted: string
  decimals?: number
  suffix?: string
}

/** One compact real-number tile — commits, weeks, LCP, TBT, and the rest of the "real row". Fixed
 *  `tabular-nums` + a container-relative clamp keeps a 5-digit value (29,983 lines, elsewhere) from
 *  ever overflowing its own cell at 390px; this block only ever shows 2-3 digit real counts, but the
 *  same clamp is used for consistency with every other numeral in this card. */
function Tile({ value, label, line, dark, title, muted, decimals = 0, suffix = '' }: TileProps) {
  return (
    <div className={`min-w-0 rounded-2xl border p-3 text-center ${line} ${dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
      <p className={`font-sf text-[clamp(16px,5cqw,22px)] font-semibold leading-none tabular-nums tracking-[-0.02em] ${title}`}>
        <CountUp value={value} decimals={decimals} suffix={suffix} duration={0.8} />
      </p>
      <p className={`mt-1.5 text-[10px] uppercase leading-tight tracking-wide ${muted}`}>{label}</p>
    </div>
  )
}

export function FeaturedImpact({ data }: { data: FeaturedData }) {
  const { skin, fb, cs, impact } = data
  const il = cs.impact
  const fi = fb.impact
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const show = inView || !!reduced

  const heroStats = [
    { key: 'conversion', value: impact.conversionPct, prefix: '+', suffix: '%', label: il.chipConversionLabel },
    { key: 'revenue', value: impact.revenuePct, prefix: '+', suffix: '%', label: il.chipRevenueLabel },
    { key: 'loadtime', value: impact.loadTimePct, prefix: '−', suffix: '%', label: il.chipLoadTimeLabel },
  ]

  const rings: RingMetric[] = [
    { key: 'perf', label: cs.perf, value: impact.rings.perf },
    { key: 'a11y', label: cs.a11y, value: impact.rings.a11y },
    { key: 'seo', label: cs.seo, value: impact.rings.seo },
  ].filter((r) => r.value >= 50)

  const tileProps = { line: skin.line, dark: skin.dark, title: skin.title, muted: skin.muted }

  return (
    <div ref={ref} className={`mt-8 rounded-[22px] border p-5 [container-type:inline-size] md:mt-10 md:p-6 ${skin.line} ${skin.dark ? 'bg-white/[0.02]' : 'bg-[#fafafa]'}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {heroStats.map((s, i) => (
          <HeroStat key={s.key} value={s.value} prefix={s.prefix} suffix={s.suffix} label={s.label} dark={skin.dark} delay={0.05 + i * 0.08} show={show} />
        ))}
      </div>
      <p className={`mt-3 text-center text-[11px] leading-snug ${skin.muted}`}>{il.disclaimer}</p>

      <m.div
        className={`mt-6 border-t pt-5 ${skin.line}`}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{fi.heading}</p>

        {rings.length > 0 && (
          <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-3">
            <ScoreRingsRow metrics={rings} dark={skin.dark} delay={0.1} />
            <div className="grid min-w-[140px] flex-1 grid-cols-2 gap-3">
              <Tile value={impact.lcpDesktop} label={fi.lcpLabel} decimals={2} suffix="s" {...tileProps} />
              <Tile value={Math.round(impact.tbtDesktop)} label={fi.tbtLabel} suffix="ms" {...tileProps} />
            </div>
          </div>
        )}
        <p className={`mt-2 text-[11px] leading-snug ${skin.muted}`}>{fi.lighthouseCaption}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile value={impact.build.commits} label={fb.metricLabels.commits} {...tileProps} />
          <Tile value={impact.build.weeks} label={fb.metricLabels.weeks} {...tileProps} />
          <Tile value={impact.build.sections} label={fb.metricLabels.sections} {...tileProps} />
          <Tile value={impact.build.blocks} label={fi.blocksLabel} {...tileProps} />
          <Tile value={impact.build.trackedComponents} label={fi.trackedLabel} {...tileProps} />
        </div>
        <p className={`mt-2 text-[11px] leading-snug ${skin.muted}`}>{fi.buildCaption}</p>
      </m.div>
    </div>
  )
}
