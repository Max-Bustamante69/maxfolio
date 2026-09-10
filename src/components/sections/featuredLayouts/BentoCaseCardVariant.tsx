// Variant D — "bento case card": one asymmetric grid instead of a scroll-driven narrative. A large
// capture tile tilts gently toward the pointer (mouse only, `(hover: hover) and (pointer: fine)`,
// skipped under reduced motion), a facts tile counts up three real numbers from telemetry, a stack
// tile shows the real tools with their brand marks (falling back to a monogram, same rule Skills.tsx
// uses), a quote-free "what shipped" list, and a CTA tile. Every tile starts visible at rest; only the
// entrance stagger and the hover tilt animate, both transform/opacity only.
import { useRef } from 'react'
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useMediaQuery } from '../../../hooks'
import { CountUp } from '../../gallery/charts'
import { ToolMark, monogram, toolIcon } from '../skillIcons'
import { fill, type FeaturedData } from './types'

const EASE = [0.23, 1, 0.32, 1] as const

function TiltCapture({ data }: { data: FeaturedData }) {
  const { skin, fb, g, store, img } = data
  const reduced = useReducedMotion()
  const canTilt = useMediaQuery('(hover: hover) and (pointer: fine)')
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 22 })
  const sry = useSpring(ry, { stiffness: 220, damping: 22 })
  const rotateX = useTransform(srx, (v) => `${v}deg`)
  const rotateY = useTransform(sry, (v) => `${v}deg`)

  const onMove = (e: React.MouseEvent) => {
    if (!canTilt || reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 8)
    rx.set(py * -8)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 1000 }}
      className={`relative aspect-[4/3] overflow-hidden rounded-[22px] border md:aspect-auto md:h-full ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-[#f5f5f7]'}`}
    >
      <m.div style={reduced || !canTilt ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }} className="h-full w-full">
        <img src={img('home', 'desktop')} alt={`${store.name} — ${g.home}`} width={1280} height={880} loading="lazy" decoding="async" className="hidden h-full w-full object-cover object-top md:block" />
        <img src={img('home', 'mobile')} alt={`${store.name} — ${g.home}`} width={750} height={1000} loading="lazy" decoding="async" className="h-full w-full object-cover object-top md:hidden" />
      </m.div>
      <a href={store.url} target="_blank" rel="noreferrer" className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur ${skin.dark ? 'bg-black/40 text-white' : 'bg-white/80 text-[#1d1d1f]'}`}>
        {fb.visit} ›
      </a>
    </div>
  )
}

function FactsTile({ data }: { data: FeaturedData }) {
  const { skin, fb, metrics } = data
  const stats: [number, string][] = [
    [metrics.commits, fb.metricLabels.commits],
    [metrics.weeks, fb.metricLabels.weeks],
    [metrics.sections, fb.metricLabels.sections],
  ]
  return (
    <div className={`grid h-full grid-cols-3 gap-3 rounded-[22px] border p-4 md:p-5 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
      {stats.map(([value, label]) => (
        <div key={label}>
          <p className={`font-sf text-2xl font-semibold tabular-nums tracking-[-0.02em] md:text-3xl ${skin.title}`}>
            <CountUp value={value} />
          </p>
          <p className={`mt-1 text-[10px] uppercase leading-tight tracking-wide ${skin.muted}`}>{label}</p>
        </div>
      ))}
    </div>
  )
}

function StackTile({ data }: { data: FeaturedData }) {
  const { skin, fb, store } = data
  return (
    <div className={`h-full rounded-[22px] border p-4 md:p-5 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{fb.stackLabel}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {store.stack.map((tool) => (
          <span key={tool} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${skin.chip}`}>
            {toolIcon(tool) ? <ToolMark tool={tool} className="h-3.5 w-3.5" /> : <span className="text-[9px] font-bold">{monogram(tool)}</span>}
            {tool}
          </span>
        ))}
      </div>
    </div>
  )
}

function ShippedTile({ data }: { data: FeaturedData }) {
  const { skin, fb, vars } = data
  return (
    <div className={`h-full rounded-[22px] border p-4 md:p-5 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{fb.shippedLabel}</p>
      <ul className="mt-3 space-y-1.5">
        {fb.shipped.map((item) => (
          <li key={item} className={`flex gap-2 text-[13px] leading-snug`}>
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${skin.accentBg}`} aria-hidden="true" />
            <span>{fill(item, vars)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CtaTile({ data }: { data: FeaturedData }) {
  const { skin, fb, sheetHref } = data
  return (
    <a
      href={sheetHref}
      className={`flex h-full items-center justify-between rounded-[22px] border p-4 transition-colors md:p-5 ${skin.line} ${skin.dark ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-white hover:bg-black/[0.02]'}`}
    >
      <span className={`font-sf text-lg font-semibold tracking-[-0.02em] md:text-xl ${skin.title}`}>{fb.cta}</span>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${skin.accentBg} text-white`}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  )
}

// 4-column bento (2-column on phones): the large capture spans 2×2, facts fills the rest of row 1,
// stack and shipped split row 2's remaining two cells beside the capture, and the CTA closes the
// grid full-width — a clean 3-row shape at md, not the accidental 4th row a generic per-index ternary
// would produce once dense auto-placement re-flows around the capture's row-span.
const SPANS = [
  'col-span-2 md:row-span-2', // capture
  'col-span-2', // facts
  'col-span-1', // stack
  'col-span-1', // shipped
  'col-span-2 md:col-span-4', // cta
]

export function BentoCaseCardVariant({ data }: { data: FeaturedData }) {
  const reduced = useReducedMotion()
  const tiles = [
    <TiltCapture key="capture" data={data} />,
    <FactsTile key="facts" data={data} />,
    <StackTile key="stack" data={data} />,
    <ShippedTile key="shipped" data={data} />,
    <CtaTile key="cta" data={data} />,
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:auto-rows-[minmax(150px,auto)] md:grid-cols-4">
      {tiles.map((tile, i) => (
        <m.div
          key={tile.key}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
          className={SPANS[i]}
        >
          {tile}
        </m.div>
      ))}
    </div>
  )
}
