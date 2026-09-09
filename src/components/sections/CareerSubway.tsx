import { useMemo } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface CareerSubwayProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const
const NOW = '2026-09'
const monthIndex = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return (y - 2022) * 12 + (m - 1)
}
const NOW_MONTH = monthIndex(NOW)

interface Segment {
  id: string
  start: number
  end: number
  current: boolean
}
interface Transfer {
  a: number
  b: number
  start: number
  end: number
}

/** Every experience entry, grouped onto one line per employer (Digitdeck's two stints share a row, with a gap between them). */
function useLines() {
  const { registry } = useContent()
  return useMemo(() => {
    const byCompany = new Map<string, Segment[]>()
    registry.experience.forEach((e) => {
      const segs = byCompany.get(e.company) ?? []
      segs.push({ id: e.id, start: monthIndex(e.start), end: e.end ? monthIndex(e.end) : NOW_MONTH, current: e.end === null })
      byCompany.set(e.company, segs)
    })
    const lines = Array.from(byCompany.entries())
      .map(([company, segments]) => ({ company, segments: segments.sort((a, b) => a.start - b.start) }))
      .sort((a, b) => a.segments[0].start - b.segments[0].start)

    // Transfers: any two segments on different lines whose active windows overlap — derived, not hand-picked.
    const transfers: Transfer[] = []
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        lines[i].segments.forEach((sa) => {
          lines[j].segments.forEach((sb) => {
            const start = Math.max(sa.start, sb.start)
            const end = Math.min(sa.end, sb.end)
            if (start < end) transfers.push({ a: i, b: j, start, end })
          })
        })
      }
    }
    return { lines, transfers }
  }, [registry])
}

const codeOf = (company: string) => company.slice(0, 3).toUpperCase()

/**
 * The career as a subway map: one line per employer, stations at each role's start and end, a
 * transfer connector where two roles ran at once (derived from the real overlap, not staged).
 * Horizontal on wide screens, the axis rotates to vertical on phones — same data, same geometry,
 * a 90° turn.
 */
export function CareerSubway({ skin, heading }: CareerSubwayProps) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const cw = strings.sections.careerSubway
  const { lines, transfers } = useLines()
  const ROWS = lines.length

  const padStart = wide ? 118 : 26
  const padEnd = wide ? 24 : 16
  const rowPad = wide ? 24 : 34
  const timeDim = wide ? 680 : 560
  const rowDim = wide ? 30 + ROWS * 50 : 26 + ROWS * 54
  const W = wide ? timeDim : rowDim
  const H = wide ? rowDim : timeDim

  const scaleTime = (t: number) => padStart + (t / NOW_MONTH) * (timeDim - padStart - padEnd)
  const scaleRow = (r: number) => rowPad + r * ((rowDim - rowPad * 2) / Math.max(1, ROWS - 1))
  const pt = (t: number, r: number): [number, number] => (wide ? [scaleTime(t), scaleRow(r)] : [scaleRow(r), scaleTime(t)])

  const yearTicks = [2022, 2023, 2024, 2025, 2026]
  const trackWidth = 4

  return (
    <section id="career-subway" className="scroll-mt-20">
      {heading(cw.eyebrow, cw.title, cw.titleAccent, cw.lead)}

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={wide ? 'w-full min-w-[560px]' : 'mx-auto block h-auto w-full max-w-[360px]'}
          role="img"
          aria-label={lines.map((l) => `${l.company}: ${l.segments.map((s) => cw.rowAria.replace('{company}', l.company).replace('{period}', `${s.start}–${s.current ? 'now' : s.end}`)).join('; ')}`).join('. ')}
        >
          {/* year ticks along the time axis */}
          {yearTicks.map((y) => {
            const t = monthIndex(`${y}-01`)
            if (t > NOW_MONTH) return null
            const [x, yy] = wide ? [scaleTime(t), rowDim - 6] : [rowDim - 6, scaleTime(t)]
            return (
              <text key={y} x={x} y={yy} textAnchor={wide ? 'middle' : 'end'} style={{ fontSize: 10, fill: 'currentColor' }} className={skin.muted}>
                {y}
              </text>
            )
          })}

          {/* transfers, drawn first so lines sit above them */}
          {transfers.map((tr, i) => {
            const [x1, y1] = pt(tr.start, tr.a)
            const [x2, y2] = pt(tr.start, tr.b)
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray="3 3" strokeWidth={1.5} className={skin.dark ? 'stroke-white/30' : 'stroke-black/25'}>
                  <title>{cw.transferLabel}</title>
                </line>
                <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={2.5} className={skin.dark ? 'fill-white/50' : 'fill-black/40'} />
              </g>
            )
          })}

          {/* one line per employer */}
          {lines.map((line, ri) => (
            <g key={line.company}>
              <text
                x={wide ? padStart - 12 : scaleRow(ri)}
                y={wide ? scaleRow(ri) : padStart - 10}
                textAnchor={wide ? 'end' : 'middle'}
                dominantBaseline={wide ? 'middle' : undefined}
                className={skin.title}
                style={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }}
              >
                {wide ? line.company : codeOf(line.company)}
              </text>
              {line.segments.map((seg) => {
                const [x1, y1] = pt(seg.start, ri)
                const [x2, y2] = pt(seg.end, ri)
                return (
                  <g key={seg.id}>
                    <m.line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      strokeWidth={trackWidth}
                      strokeLinecap="round"
                      className={skin.accentBg.replace('bg-', 'stroke-')}
                      style={{ opacity: seg.current ? 1 : 0.55 }}
                      initial={reduced ? false : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.7, delay: 0.1 + ri * 0.08, ease: EASE }}
                    >
                      <title>{cw.rowAria.replace('{company}', line.company).replace('{period}', `${seg.start}–${seg.current ? 'now' : seg.end}`)}</title>
                    </m.line>
                    <circle cx={x1} cy={y1} r={4} className={skin.accentBg.replace('bg-', 'fill-')} />
                    <circle cx={x2} cy={y2} r={4} className={seg.current ? `${skin.accentBg.replace('bg-', 'fill-')} animate-pulse` : skin.accentBg.replace('bg-', 'fill-')} style={{ opacity: seg.current ? 1 : 0.55 }} />
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>

      {!wide && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {lines.map((l) => (
            <li key={l.company} className={skin.muted}>
              <span className={`font-semibold ${skin.title}`}>{codeOf(l.company)}</span> — {l.company}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
