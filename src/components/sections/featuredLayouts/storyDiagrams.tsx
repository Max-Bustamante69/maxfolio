// Beat diagrams for SplitStoryVariant (variant A, default) — the owner's 2026-09-11 call for "algo más
// gráfico" on this section. Each beat gets one small inline SVG that shows the real mechanism it
// describes, not decoration: a price ladder, an integration map, a design-to-code strip, and the
// Lighthouse rings. Every diagram reads its numbers from `FeaturedData` — nothing here is invented —
// and colors entirely off `currentColor` inside a wrapper carrying the skin's own accent/muted text
// classes, so it looks right on every theme without its own token set. No external assets, no chart
// library: plain SVG, framer-motion only for the one stroke-draw effect the brief calls out (the
// integration map's connecting lines), gated on `useReducedMotion` with a fully-drawn static fallback.
import { useId } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { ScoreRingsRow, type RingMetric } from '../../gallery/charts'
import type { FeaturedData } from './types'

const EASE = [0.23, 1, 0.32, 1] as const

/** Beat 1 — the price ladder: one bar per pack size, height falling as the per-jar price drops. The
 *  real ladder (registry.ts `facts: [{ id: 'ladder', value: '10% → 20%' }]`) is exactly two steps down
 *  from full price, so three bars is the whole mechanism, not a rounded-off sample of it. */
function LadderDiagram({ skin }: { skin: FeaturedData['skin'] }) {
  const bars = [
    { h: 40, tag: null },
    { h: 33, tag: '−10%' },
    { h: 24, tag: '−20%' },
  ]
  return (
    <div className="mt-3 w-[116px]">
      <svg viewBox="0 0 116 48" className={`h-12 w-[116px] ${skin.accent}`} aria-hidden="true">
        {bars.map((b, i) => (
          <g key={i}>
            <rect x={8 + i * 38} y={48 - b.h} width={26} height={b.h} rx={4} fill="currentColor" opacity={1 - i * 0.24} />
            {b.tag && (
              <text x={8 + i * 38 + 13} y={48 - b.h - 5} textAnchor="middle" fontSize={8} fontWeight={600} fill="currentColor">
                {b.tag}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className={`mt-1 grid grid-cols-3 text-center text-[9px] uppercase leading-tight tracking-wide ${skin.muted}`}>
        <span>1 jar</span>
        <span>2 jars</span>
        <span>3+ jars</span>
      </div>
    </div>
  )
}

/** Beat 2 — the integration map: Builder → Bundles module → Function → Checkout, with Treli and the
 *  Web Pixel branching off as the two surfaces that ride along (subscriptions, tracking). The chain's
 *  three connecting arrows stroke-draw in once the diagram scrolls into view; the two branch
 *  connectors draw right after. Reduced motion (or a second view after `once` has fired) renders every
 *  path already fully drawn — never an incomplete diagram at rest. */
function IntegrationMapDiagram({ skin }: { skin: FeaturedData['skin'] }) {
  const reduced = useReducedMotion()
  const uid = useId()
  const nodes = [
    { x: 4, w: 62, label: 'Builder' },
    { x: 82, w: 84, label: 'Bundles' },
    { x: 182, w: 76, label: 'Function' },
    { x: 274, w: 74, label: 'Checkout' },
  ]
  const branches = [
    { x: 90, w: 68, label: 'Web Pixel', fromX: 124, fromY: 34 },
    { x: 246, w: 56, label: 'Treli', fromX: 274 + 37, fromY: 34 },
  ]
  const chainPaths = ['M66,21 L82,21', 'M166,21 L182,21', 'M258,21 L274,21']
  return (
    <svg viewBox="0 0 356 76" className={`mt-3 h-[76px] w-full max-w-[356px] ${skin.accent}`} role="img" aria-label="Builder to Bundles to Function to Checkout, with Treli and the Web Pixel branching off">
      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x} y={8} width={n.w} height={26} rx={7} fill="none" stroke="currentColor" strokeWidth={1.4} />
          <text x={n.x + n.w / 2} y={25} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="currentColor">
            {n.label}
          </text>
        </g>
      ))}
      {chainPaths.map((d, i) => (
        <m.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={1.6}
          markerEnd={`url(#${uid}-arrow)`}
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: i * 0.18, ease: EASE }}
        />
      ))}
      {branches.map((b, i) => (
        <g key={b.label}>
          <m.path
            d={`M${b.fromX},34 L${b.fromX},48 L${b.x + b.w / 2},48 L${b.x + b.w / 2},58`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            strokeDasharray="3 2.5"
            opacity={0.65}
            markerEnd={`url(#${uid}-arrow-branch)`}
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.65 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, delay: 0.55 + i * 0.15, ease: EASE }}
          />
          <rect x={b.x} y={58} width={b.w} height={18} rx={6} fill="none" stroke="currentColor" strokeWidth={1.1} opacity={0.85} />
          <text x={b.x + b.w / 2} y={70.5} textAnchor="middle" fontSize={8} fontWeight={600} fill="currentColor" opacity={0.85}>
            {b.label}
          </text>
        </g>
      ))}
      <defs>
        <marker id={`${uid}-arrow`} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
        </marker>
        <marker id={`${uid}-arrow-branch`} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={4.5} markerHeight={4.5} orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" opacity={0.65} />
        </marker>
      </defs>
    </svg>
  )
}

/** Beat 3 — design to code: a Figma-frame glyph, an arrow into a 72-cell grid (one cell per section —
 *  the real count, not a rounded sample) that wipes in left to right, then an arrow into a live-capture
 *  glyph. The block-count caption underneath spells out the other real number (28 blocks) the grid
 *  itself is too fine-grained to show cell-by-cell. */
function DesignToCodeDiagram({ sections, blocks, skin }: { sections: number; blocks: number; skin: FeaturedData['skin'] }) {
  const reduced = useReducedMotion()
  const uid = useId()
  const cols = 12
  const rows = Math.ceil(sections / cols)
  const cellW = 8
  const cellH = 6
  const gridX = 46
  const gridY = 6
  const gridW = cols * cellW
  const gridH = rows * cellH
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${gridX + gridW + 34} ${gridH + 12}`} className={`h-12 w-full max-w-[248px] ${skin.accent}`} aria-hidden="true">
        {/* Figma-frame glyph: a generic layered-frame mark, not the trademark — three overlapping corner brackets. */}
        <rect x={2} y={gridY} width={22} height={gridH} rx={3} fill="none" stroke="currentColor" strokeWidth={1.3} />
        <circle cx={13} cy={gridY + gridH / 2} r={4} fill="none" stroke="currentColor" strokeWidth={1.3} />
        <path d={`M28,${gridY + gridH / 2} L${gridX - 4},${gridY + gridH / 2}`} stroke="currentColor" strokeWidth={1.3} />

        <defs>
          <clipPath id={`${uid}-grid-clip`}>
            <m.rect x={gridX} y={gridY} height={gridH} initial={reduced ? false : { width: 0 }} whileInView={{ width: gridW }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.9, ease: EASE }} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}-grid-clip)`}>
          {Array.from({ length: sections }, (_, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            return <rect key={i} x={gridX + col * cellW + 0.6} y={gridY + row * cellH + 0.6} width={cellW - 1.2} height={cellH - 1.2} rx={1} fill="currentColor" opacity={0.85} />
          })}
        </g>

        <path d={`M${gridX + gridW + 4},${gridY + gridH / 2} L${gridX + gridW + 14},${gridY + gridH / 2}`} stroke="currentColor" strokeWidth={1.3} />
        {/* Live-capture glyph: a browser window. */}
        <rect x={gridX + gridW + 16} y={gridY} width={18} height={gridH} rx={2.5} fill="none" stroke="currentColor" strokeWidth={1.3} />
        <line x1={gridX + gridW + 16} y1={gridY + 3.5} x2={gridX + gridW + 34} y2={gridY + 3.5} stroke="currentColor" strokeWidth={1.3} />
      </svg>
      <p className={`mt-1.5 text-[11px] leading-snug ${skin.muted}`}>
        {sections} sections · {blocks} blocks
      </p>
    </div>
  )
}

/** Beat 4 — the real Lighthouse rings, reusing the same house component the Impact strip renders below
 *  (charts.tsx `ScoreRingsRow`), plus the LCP figure as a small chip so the one number the rings
 *  themselves don't carry (speed) still reads at a glance. */
function LighthouseDiagram({ perf, a11y, seo, lcpLabel, lcpDesktop, skin }: { perf: number; a11y: number; seo: number; lcpLabel: string; lcpDesktop: string; skin: FeaturedData['skin'] }) {
  const rings: RingMetric[] = [
    { key: 'perf', label: 'Perf', value: perf },
    { key: 'a11y', label: 'A11y', value: a11y },
    { key: 'seo', label: 'SEO', value: seo },
  ]
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      <ScoreRingsRow metrics={rings} dark={skin.dark} />
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tabular-nums ${skin.chip}`}>
        {lcpDesktop}s {lcpLabel}
      </span>
    </div>
  )
}

/** Picks the right diagram for a beat index (0-3) — problem, plan, build, result, matching
 *  `fb.beats`'s fixed order. Returns `null` past index 3 so an unexpected extra beat degrades to no
 *  diagram instead of a crash. */
export function BeatDiagram({ index, data }: { index: number; data: FeaturedData }) {
  const { skin, vars, metrics, fb } = data
  switch (index) {
    case 0:
      return <LadderDiagram skin={skin} />
    case 1:
      return <IntegrationMapDiagram skin={skin} />
    case 2:
      return <DesignToCodeDiagram sections={metrics.sections} blocks={metrics.blocks} skin={skin} />
    case 3:
      return <LighthouseDiagram perf={Number(vars.perfDesktop)} a11y={Number(vars.a11yDesktop)} seo={Number(vars.seoDesktop)} lcpLabel={fb.impact.lcpLabel} lcpDesktop={String(vars.lcpDesktop)} skin={skin} />
    default:
      return null
  }
}
