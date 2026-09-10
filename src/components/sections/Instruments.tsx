import { useMemo } from 'react'
import { useContent } from '../../hooks'
import { Gauge } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { stores } from '../../data/registry'
import { commerce, isLiveCommerce } from '../../data/commerce'
import { telemetry } from '../../data/telemetry'

interface InstrumentsProps {
  skin: Skin
  heading: SectionHeading
}

// The one place cyan reads a percentage that isn't a headline stat — every ring below traces to a
// real registry/commerce/git field, never a fabricated score (see skins.ts's split for why this is
// the reserved color and not `skin.accent`).
const CYAN = '#4fd1ff'

interface SaleShareRow {
  name: string
  share: number
}

interface WeekRow {
  week: string
  commits: number
}

/**
 * INSTRUMENTS — three honest gauges read off the fleet's own records: live/dev split, average
 * on-sale share and the busiest build week as a share of every commit the fleet has ever made.
 * Each ring sits over the table it was computed from, so the number is never the only thing shown.
 */
export function Instruments({ skin, heading }: InstrumentsProps) {
  const { strings, locale } = useContent()
  const i = strings.sections.instruments
  const fmt = (n: number) => `${Math.round(n * 10) / 10}%`

  const { liveCount, devCount, liveSharePct } = useMemo(() => {
    const fleet = stores.filter((s) => !s.legacy)
    const live = fleet.filter((s) => s.status === 'live').length
    const dev = fleet.filter((s) => s.status === 'dev').length
    return { liveCount: live, devCount: dev, liveSharePct: fleet.length ? (live / fleet.length) * 100 : 0 }
  }, [])

  const { saleRows, avgSaleShare, highestSale, lowestSale } = useMemo(() => {
    const fleet = stores.filter((s) => !s.legacy)
    const rows: SaleShareRow[] = []
    for (const s of fleet) {
      const c = commerce[s.slug]
      if (isLiveCommerce(c) && c.onSaleShare !== null) rows.push({ name: s.name, share: c.onSaleShare * 100 })
    }
    const avg = rows.length ? rows.reduce((a, r) => a + r.share, 0) / rows.length : 0
    const highest = rows.reduce((a, r) => (!a || r.share > a.share ? r : a), null as SaleShareRow | null)
    const lowest = rows.reduce((a, r) => (!a || r.share < a.share ? r : a), null as SaleShareRow | null)
    return { saleRows: rows, avgSaleShare: avg, highestSale: highest, lowestSale: lowest }
  }, [])

  const { top5, busiest, busiestSharePct, totalCommits } = useMemo(() => {
    const weekMap = new Map<string, number>()
    for (const t of Object.values(telemetry)) {
      const start = new Date(`${t.weekOf}T12:00:00Z`)
      t.weeks.forEach((n, idx) => {
        const d = new Date(start.getTime() + idx * 7 * 86400000)
        const key = d.toISOString().slice(0, 10)
        weekMap.set(key, (weekMap.get(key) ?? 0) + n)
      })
    }
    const weeks: WeekRow[] = [...weekMap.entries()].map(([week, commits]) => ({ week, commits })).sort((a, b) => b.commits - a.commits)
    const total = weeks.reduce((a, w) => a + w.commits, 0)
    const first = weeks[0] ?? { week: '', commits: 0 }
    return { top5: weeks.slice(0, 5), busiest: first, busiestSharePct: total ? (first.commits / total) * 100 : 0, totalCommits: total }
  }, [])

  const dateFmt = (iso: string) => (iso ? new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : locale === 'es' ? 'es-CO' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T12:00:00Z`)) : '—')

  const panel = `${skin.card} p-5 md:p-6`
  const th = `py-1.5 pr-3 text-left font-mono text-[10px] font-normal uppercase tracking-[0.1em] ${skin.muted}`
  const td = `py-1.5 pr-3 font-mono text-[12px] tabular-nums ${skin.title}`
  const table = `mt-4 w-full border-collapse border-t ${skin.line} text-left`
  const rowBorder = `border-t ${skin.line}`
  const source = `mt-3 text-[10px] font-mono uppercase tracking-[0.08em] ${skin.muted}`

  return (
    <section id="instruments" className="scroll-mt-20">
      {heading(i.eyebrow, i.title, i.titleAccent, i.lead)}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 1 — live vs dev */}
        <div className={panel}>
          <Gauge value={liveSharePct} label={i.liveShare.label} color={CYAN} dark delay={0} />
          <p className={source}>{i.liveShare.source}</p>
          <table className={table}>
            <caption className="sr-only">{i.liveShare.tableCaption}</caption>
            <tbody>
              <tr>
                <th scope="row" className={th}>{i.liveShare.live}</th>
                <td className={td}>{liveCount}</td>
              </tr>
              <tr>
                <th scope="row" className={th}>{i.liveShare.dev}</th>
                <td className={td}>{devCount}</td>
              </tr>
              <tr className={rowBorder}>
                <th scope="row" className={th}>{i.liveShare.total}</th>
                <td className={td}>{liveCount + devCount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2 — sale share */}
        <div className={panel}>
          <Gauge value={avgSaleShare} label={i.saleShare.label} color={CYAN} dark delay={0.1} />
          <p className={source}>{i.saleShare.source}</p>
          <table className={table}>
            <caption className="sr-only">{i.saleShare.tableCaption}</caption>
            <tbody>
              <tr>
                <th scope="row" className={th}>{i.saleShare.counted}</th>
                <td className={td}>{saleRows.length}</td>
              </tr>
              <tr>
                <th scope="row" className={th}>{i.saleShare.average}</th>
                <td className={td}>{fmt(avgSaleShare)}</td>
              </tr>
              {highestSale && (
                <tr className={rowBorder}>
                  <th scope="row" className={th}>{i.saleShare.highest}</th>
                  <td className={td}>
                    {fmt(highestSale.share)} <span className={skin.muted}>· {highestSale.name}</span>
                  </td>
                </tr>
              )}
              {lowestSale && (
                <tr>
                  <th scope="row" className={th}>{i.saleShare.lowest}</th>
                  <td className={td}>
                    {fmt(lowestSale.share)} <span className={skin.muted}>· {lowestSale.name}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3 — busiest build week, as a share of every commit the fleet has ever made */}
        <div className={panel}>
          <Gauge value={busiestSharePct} label={i.busiestWeek.label} color={CYAN} dark delay={0.2} />
          <p className={`mt-3 text-[12px] leading-snug ${skin.body}`}>
            {i.busiestWeek.value.replace('{n}', String(busiest.commits)).replace('{date}', dateFmt(busiest.week)).replace('{pct}', String(Math.round(busiestSharePct * 10) / 10))}
          </p>
          <p className={source}>{i.busiestWeek.source}</p>
          <table className={table}>
            <caption className="sr-only">{i.busiestWeek.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col" className={th}>{i.busiestWeek.week}</th>
                <th scope="col" className={th}>{i.busiestWeek.commits}</th>
                <th scope="col" className={th}>{i.busiestWeek.shareOfAll}</th>
              </tr>
            </thead>
            <tbody>
              {top5.map((w) => (
                <tr key={w.week} className={rowBorder}>
                  <td className={td}>{dateFmt(w.week)}</td>
                  <td className={td}>{w.commits}</td>
                  <td className={td}>{fmt(totalCommits ? (w.commits / totalCommits) * 100 : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
