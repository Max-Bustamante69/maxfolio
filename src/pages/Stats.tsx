// Private analytics dashboard — reads `GET /api/event` (token-gated) and `GET /api/ab` (already
// unauthenticated: it exposes only view/contact counters, nothing more sensitive than what this page
// itself now also shows). Never linked from any page, `noindex` via SEOHead, not in sitemap.xml
// (scripts/build-sitemap.mjs is an explicit route list, not a crawl). The taxonomy this reads is
// defined once in `api/event.ts` and documented in docs/analytics.md.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { SEOHead } from '../components/common'
import { CountUp } from '../components/gallery/charts'

type EventTotals = Record<string, number>
interface EventResponse {
  configured: boolean
  days?: string[]
  totals?: EventTotals
  daily?: Record<string, EventTotals>
}
interface AbResponse {
  configured: boolean
  totals?: Record<string, { view: number; contact: number; rate: number | null }>
}

const TOKEN_KEY = 'mf-stats-token'
// Page order on the Apple landing (the only page `data-track-section` is wired on today) — the
// funnel below reads `section_view:<id>` in exactly this order so it reads top-to-bottom like the
// page itself scrolls.
const SECTION_ORDER = ['hero', 'experience', 'shopify', 'gallery', 'projects', 'skills', 'review', 'faq', 'contact', 'explore']

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}
function writeToken(t: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, t)
  } catch {
    /* private window / blocked storage — the token just won't survive a reload */
  }
}
function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* see above */
  }
}

/** Every field in `ev:totals` is either a bare event name (`contact_open`) or `event:seg1[:seg2]`
 *  (`cta_click:hero:cv`, `theme_switch:luxury`). Splits the totals object once into per-event
 *  breakdowns keyed by the segment(s) after the event name, sorted by count. */
function breakdownsFor(totals: EventTotals, event: string): { key: string; count: number }[] {
  const prefix = `${event}:`
  const out: { key: string; count: number }[] = []
  for (const [k, v] of Object.entries(totals)) {
    if (k.startsWith(prefix)) out.push({ key: k.slice(prefix.length), count: v })
  }
  return out.sort((a, b) => b.count - a.count)
}
const bareTotal = (totals: EventTotals, event: string) => totals[event] ?? 0

/** A minimal 30-day trend line — deliberately NOT `IndexAreaLine` from `charts.tsx`: that primitive
 *  bakes in "every series is a seeded lift, always positive, numeral always paints green" (its own
 *  header comment), which is true for the illustrative growth series it was built for and false for
 *  raw daily event counts, which can go up or down day to day with no "good direction". Reusing it
 *  here would silently claim growth that may not exist. `CountUp` below has no such assumption baked
 *  in, so the dashboard's headline numbers do reuse it. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 280
  const h = 48
  const max = Math.max(1, ...values)
  const n = values.length
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * w : 0)
  const y = (v: number) => h - (v / max) * (h - 4) - 2
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" preserveAspectRatio="none" role="img" aria-label={`Last ${n} days, ${values.reduce((a, b) => a + b, 0)} total`}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">{title}</h2>
    {children}
  </div>
)

const RankList = ({ rows, empty }: { rows: { key: string; count: number }[]; empty: string }) => {
  if (rows.length === 0) return <p className="text-sm text-white/40">{empty}</p>
  const max = rows[0].count || 1
  return (
    <ul className="flex flex-col gap-2">
      {rows.slice(0, 8).map((r) => (
        <li key={r.key} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-white/70" title={r.key}>
            {r.key}
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full rounded-full bg-[#2997ff]" style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }} />
          </span>
          <span className="w-10 shrink-0 text-right tabular-nums text-white/50">{r.count}</span>
        </li>
      ))}
    </ul>
  )
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-white/70">
      <p className="mb-3 font-semibold text-white">Not configured yet</p>
      <p className="mb-4">
        The event ledger and the A/B ledger both use the same Redis store, and neither is connected yet. Two steps in the Vercel project:
      </p>
      <ol className="mb-2 list-decimal space-y-2 pl-5">
        <li>
          Vercel dashboard → this project → <span className="text-white">Storage</span> → <span className="text-white">Marketplace</span> → add an{' '}
          <span className="text-white">Upstash Redis</span> integration (free tier). It sets <code className="rounded bg-white/10 px-1">KV_REST_API_URL</code> and{' '}
          <code className="rounded bg-white/10 px-1">KV_REST_API_TOKEN</code> automatically.
        </li>
        <li>
          Project → <span className="text-white">Settings</span> → <span className="text-white">Environment Variables</span> → add{' '}
          <code className="rounded bg-white/10 px-1">STATS_TOKEN</code> (any long random string — this page's own password) and redeploy.
        </li>
      </ol>
      <p className="text-white/50">Until then every write is a harmless no-op — the site never depends on this page.</p>
    </div>
  )
}

function TokenGate({ onSubmit, error }: { onSubmit: (t: string) => void; error: boolean }) {
  const [value, setValue] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(value.trim())
  }
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-sm flex-col gap-3">
      <label htmlFor="stats-token" className="text-sm text-white/70">
        Token
      </label>
      <input
        id="stats-token"
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2997ff]"
        placeholder="STATS_TOKEN"
      />
      {error && <p className="text-sm text-[#ff8a80]">Wrong token.</p>}
      <button type="submit" className="rounded-lg bg-[#0071e3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0077ed]">
        View stats
      </button>
    </form>
  )
}

export default function Stats() {
  const [token, setToken] = useState(readToken)
  const [status, setStatus] = useState<'idle' | 'loading' | 'unauthorized' | 'error' | 'ready'>(token ? 'loading' : 'idle')
  const [events, setEvents] = useState<EventResponse | null>(null)
  const [ab, setAb] = useState<AbResponse | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      try {
        const [evRes, abRes] = await Promise.all([fetch(`/api/event?token=${encodeURIComponent(token)}`), fetch('/api/ab')])
        if (evRes.status === 401) {
          if (!cancelled) {
            clearToken()
            setStatus('unauthorized')
          }
          return
        }
        if (!evRes.ok) throw new Error(String(evRes.status))
        const ev = (await evRes.json()) as EventResponse
        const abJson = abRes.ok ? ((await abRes.json()) as AbResponse) : { configured: false }
        if (cancelled) return
        setEvents(ev)
        setAb(abJson)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const totals = events?.totals ?? {}
  const days = events?.days ?? []
  const daily = events?.daily ?? {}
  const seriesFor = useMemo(
    () => (event: string) => days.map((d) => daily[d]?.[event] ?? 0),
    [days, daily],
  )

  const pageViews = useMemo(() => Object.values(ab?.totals ?? {}).reduce((sum, v) => sum + (v?.view ?? 0), 0), [ab])

  if (status === 'idle') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4">
        <SEOHead title="Stats" noindex />
        <TokenGate
          onSubmit={(t) => {
            writeToken(t)
            setToken(t)
          }}
          error={false}
        />
      </div>
    )
  }

  if (status === 'unauthorized') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4">
        <SEOHead title="Stats" noindex />
        <TokenGate
          onSubmit={(t) => {
            writeToken(t)
            setToken(t)
          }}
          error
        />
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
        <SEOHead title="Stats" noindex />
        <p className="text-sm text-white/40">Loading…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4">
        <SEOHead title="Stats" noindex />
        <p className="text-sm text-[#ff8a80]">Couldn't load stats. Try reloading.</p>
      </div>
    )
  }

  if (!events?.configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4 py-16">
        <SEOHead title="Stats" noindex />
        <NotConfigured />
      </div>
    )
  }

  const contactOpen = bareTotal(totals, 'contact_open')
  const contactSubmit = bareTotal(totals, 'contact_submit')
  const conversionRate = contactOpen ? Math.round((contactSubmit / contactOpen) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0b] px-4 py-10 text-[#f5f5f7] sm:px-8">
      <SEOHead title="Stats" noindex />
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Maxfolio — stats</h1>
          <button
            type="button"
            onClick={() => {
              clearToken()
              setToken('')
              setStatus('idle')
            }}
            className="text-xs text-white/40 hover:text-white/70"
          >
            Lock
          </button>
        </div>

        {/* Totals row — the one place this page reuses `CountUp` from charts.tsx directly. */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Page views (A/B)', value: pageViews },
            { label: 'Contact opens', value: contactOpen },
            { label: 'Contact sent', value: contactSubmit },
            { label: 'Contact rate', value: conversionRate, suffix: '%' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <CountUp value={s.value} suffix={s.suffix} className="block text-2xl font-semibold tabular-nums" />
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Section reach (share of page views)">
            <ul className="flex flex-col gap-2">
              {SECTION_ORDER.map((id) => {
                const n = bareTotal(totals, `section_view:${id}`)
                const pct = pageViews ? Math.round((n / pageViews) * 100) : 0
                return (
                  <li key={id} className="flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0 text-white/70">{id}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-[#34c759]" style={{ width: `${Math.max(2, pct)}%` }} />
                    </span>
                    <span className="w-10 shrink-0 text-right tabular-nums text-white/50">{pct}%</span>
                  </li>
                )
              })}
            </ul>
            {pageViews === 0 && <p className="mt-2 text-xs text-white/30">No page views recorded yet — percentages will read 0% until then.</p>}
          </Card>

          <Card title="CTA ranking (position · id)">
            <RankList rows={breakdownsFor(totals, 'cta_click')} empty="No CTA clicks yet." />
          </Card>

          <Card title="Theme switches">
            <RankList rows={breakdownsFor(totals, 'theme_switch')} empty="No theme switches yet." />
          </Card>

          <Card title="Locale switches">
            <RankList rows={breakdownsFor(totals, 'locale_switch')} empty="No locale switches yet." />
          </Card>

          <Card title="Top stores (sheet opens)">
            <RankList rows={breakdownsFor(totals, 'store_sheet_open')} empty="No case-study sheets opened yet." />
          </Card>

          <Card title="Top stores (outbound clicks)">
            <RankList rows={breakdownsFor(totals, 'outbound_store_click')} empty="No outbound store clicks yet." />
          </Card>

          <Card title="Tools opened">
            <RankList rows={breakdownsFor(totals, 'tool_drawer_open')} empty="No tool drawers opened yet." />
          </Card>

          <Card title="Filter changes (kind · value)">
            <RankList rows={breakdownsFor(totals, 'filter_change')} empty="No filters changed yet." />
          </Card>
        </div>

        {days.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card title={`Contact opens, last ${days.length} days`}>
              <Sparkline values={seriesFor('contact_open')} color="#2997ff" />
            </Card>
            <Card title={`Contact sent, last ${days.length} days`}>
              <Sparkline values={seriesFor('contact_submit')} color="#34c759" />
            </Card>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-white/25">Private, unlisted, noindex. Taxonomy: docs/analytics.md.</p>
      </div>
    </div>
  )
}
