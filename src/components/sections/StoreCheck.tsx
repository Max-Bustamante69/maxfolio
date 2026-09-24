import { useEffect, useMemo, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { track } from '../../lib/track'
import { ScoreRingsRow, type RingMetric } from '../gallery/charts'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface StoreCheckProps {
  skin: Skin
  heading: SectionHeading
  onCta: (prefill?: string) => void
}

type Phase = 'idle' | 'running' | 'done' | 'error'
type ErrorKind = 'invalid' | 'quota' | 'timeout' | 'generic'

/** The server's own minimal contract (`api/psi.ts`) — category scores plus LCP/CLS/TBT only. No
 *  field/CrUX data, no per-audit opportunities: the proxy never forwards more than this. */
interface MeasureResult {
  url: string
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  lcp: number // seconds
  cls: number
  tbt: number // ms
  date: string // YYYY-MM-DD, used in the caption/prefill
}

interface PsiApiResponse {
  url: string
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  lcp: number
  cls: number
  tbt: number
  cachedAt: string
}
interface PsiApiError {
  error: 'invalid_url' | 'quota' | 'upstream'
}

const EASE = [0.23, 1, 0.32, 1] as const
// The server's own PSI call can take up to ~40s (task brief) plus network/queue time; wait a little
// past that so the server's own timeout response (a clean error) reaches us before we give up first.
const TIMEOUT_MS = 50_000

const tbtColor = (ms: number) => (ms <= 200 ? '#34c759' : ms <= 600 ? '#ff9f0a' : '#ff3b30')
const lcpColorLab = (s: number) => (s <= 2.5 ? '#34c759' : s <= 4 ? '#ff9f0a' : '#ff3b30')
const clsColorLab = (v: number) => (v <= 0.1 ? '#34c759' : v <= 0.25 ? '#ff9f0a' : '#ff3b30')

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (!u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

async function runPsi(url: string, signal: AbortSignal): Promise<MeasureResult> {
  const res = await fetch(`/api/psi?url=${encodeURIComponent(url)}`, { signal })
  if (!res.ok) {
    if (res.status === 429) throw { kind: 'quota' as ErrorKind }
    if (res.status === 400) throw { kind: 'invalid' as ErrorKind }
    throw { kind: 'generic' as ErrorKind }
  }
  const json = (await res.json()) as PsiApiResponse | PsiApiError
  if ('error' in json) {
    throw { kind: json.error === 'quota' ? 'quota' : json.error === 'invalid_url' ? 'invalid' : 'generic' }
  }
  return {
    url: json.url,
    performance: json.performance,
    accessibility: json.accessibility,
    bestPractices: json.bestPractices,
    seo: json.seo,
    lcp: json.lcp,
    cls: json.cls,
    tbt: json.tbt,
    date: (json.cachedAt || new Date().toISOString()).slice(0, 10),
  }
}

/**
 * "Measure your store, right now": a real URL field that calls Google PageSpeed Insights through the
 * server proxy `api/psi.ts` (no API key ever reaches the client) and renders the visitor's own real
 * mobile scores. No mockup, no canned demo — replaces the old review-checklist replay (round 46).
 */
export function StoreCheck({ skin, heading, onCta }: StoreCheckProps) {
  const { strings } = useContent()
  const s = strings.sections.storeCheck
  const reduced = !!useReducedMotion()
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorKind, setErrorKind] = useState<ErrorKind>('generic')
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<MeasureResult | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(
    () => () => {
      controllerRef.current?.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (tickRef.current) clearInterval(tickRef.current)
    },
    [],
  )

  const phaseText = useMemo(() => {
    const i = Math.min(s.phases.length - 1, Math.floor(elapsed / 10))
    return s.phases[i] ?? s.phases[0]
  }, [elapsed, s.phases])

  const startRun = async () => {
    const normalized = normalizeUrl(input)
    if (!normalized) {
      setErrorKind('invalid')
      setPhase('error')
      return
    }
    const controller = new AbortController()
    controllerRef.current = controller
    setPhase('running')
    setElapsed(0)
    setResult(null)
    tickRef.current = setInterval(() => setElapsed((n) => n + 1), 1000)
    timeoutRef.current = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const r = await runPsi(normalized, controller.signal)
      setResult(r)
      setPhase('done')
      // No URL PII beyond the hostname — the store's own domain, nothing from the path/query.
      try {
        track('psi_check', { host: new URL(r.url).hostname })
      } catch {
        /* best-effort */
      }
    } catch (err) {
      const kind = (err as { kind?: ErrorKind })?.kind
      const aborted = (err as { name?: string })?.name === 'AbortError'
      setErrorKind(aborted ? 'timeout' : (kind ?? 'generic'))
      setPhase('error')
    } finally {
      if (tickRef.current) clearInterval(tickRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }

  const cancelRun = () => {
    controllerRef.current?.abort()
    if (tickRef.current) clearInterval(tickRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setPhase('idle')
  }

  const errorText = errorKind === 'invalid' ? s.errorInvalid : errorKind === 'quota' ? s.errorQuota : errorKind === 'timeout' ? s.errorTimeout : s.errorGeneric

  const prefill = result ? s.prefillTemplate.replace('{url}', result.url.replace(/^https?:\/\//, '')).replace('{score}', String(result.performance)).replace('{date}', result.date) : undefined

  const rings: RingMetric[] = result
    ? [
        { key: 'performance', label: s.perfLabel, value: result.performance },
        { key: 'accessibility', label: s.a11yLabel, value: result.accessibility },
        { key: 'bestPractices', label: s.bestPracticesLabel, value: result.bestPractices },
        { key: 'seo', label: s.seoLabel, value: result.seo },
      ]
    : []

  return (
    // The wrapping <section id="proof"> in Apple.tsx owns this section's id (ownId pattern — that
    // wrapper is not lazy, so a hash link to #proof resolves before this chunk finishes loading).
    <section className="scroll-mt-20">
      {heading(s.eyebrow, s.title, s.titleAccent, s.lead)}

      <div className={`rounded-[22px] border p-5 md:p-8 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`} aria-live="polite">
        {phase !== 'running' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void startRun()
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <label className="flex-1">
              <span className="sr-only">{s.inputLabel}</span>
              <input
                type="text"
                inputMode="url"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={s.inputPlaceholder}
                className={`w-full rounded-full border px-5 py-3 text-sm outline-none transition-colors ${skin.line} ${skin.dark ? 'bg-white/5 placeholder:text-white/35 focus:border-white/40' : 'bg-black/[0.02] placeholder:text-black/35 focus:border-black/40'}`}
              />
            </label>
            <button type="submit" className={`press shrink-0 rounded-full px-6 py-3 text-sm font-medium text-white ${skin.dark ? 'bg-[#2997ff] hover:bg-[#1f87ea]' : 'bg-[#0071e3] hover:bg-[#0066cc]'}`}>
              {s.submitLabel}
            </button>
          </form>
        )}

        {phase === 'running' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <m.span
              aria-hidden="true"
              className={`h-8 w-8 rounded-full border-2 border-transparent ${skin.dark ? 'border-t-white/70' : 'border-t-black/60'}`}
              style={{ borderTopColor: skin.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
              animate={reduced ? {} : { rotate: 360 }}
              transition={reduced ? {} : { duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm font-medium tabular-nums">{s.runningLabel.replace('{s}', String(elapsed))}</p>
            <p className={`max-w-xs text-xs leading-relaxed ${skin.muted}`}>{phaseText}</p>
            <button type="button" onClick={cancelRun} className={`press mt-1 text-xs font-medium underline underline-offset-2 ${skin.muted}`}>
              {s.cancelLabel}
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="max-w-sm text-sm leading-relaxed">{errorText}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => setPhase('idle')} className={`press rounded-full border px-5 py-2.5 text-xs font-medium ${skin.line}`}>
                {s.submitLabel}
              </button>
              <button type="button" onClick={() => onCta()} className={`press rounded-full px-5 py-2.5 text-xs font-medium text-white ${skin.dark ? 'bg-[#2997ff]' : 'bg-[#0071e3]'}`}>
                {s.errorCta}
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && result && (
          <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <p className={`text-xs font-medium ${skin.muted}`}>{result.url.replace(/^https?:\/\//, '')}</p>
            <div className="mt-4">
              <ScoreRingsRow metrics={rings} caption={s.labCaption} dark={skin.dark} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <StatPill label={s.lcpLabel} value={`${result.lcp.toFixed(1)}s`} color={lcpColorLab(result.lcp)} dark={skin.dark} />
              <StatPill label={s.clsLabel} value={result.cls.toFixed(2)} color={clsColorLab(result.cls)} dark={skin.dark} />
              <StatPill label={s.tbtLabel} value={`${Math.round(result.tbt)}ms`} color={tbtColor(result.tbt)} dark={skin.dark} />
            </div>

            <div className={`mt-6 rounded-[16px] border p-4 ${skin.line} ${skin.dark ? 'bg-white/[0.02]' : 'bg-black/[0.015]'}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${skin.accent}`}>{s.addsHeading}</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                {s.addsLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden="true">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" onClick={() => onCta(prefill)} className="press mt-6 inline-flex items-center justify-center rounded-full bg-apple-blue px-6 py-3 text-sm font-medium text-white hover:bg-apple-blueHover">
              {s.cta}
            </button>
          </m.div>
        )}
      </div>
    </section>
  )
}

function StatPill({ label, value, color, dark }: { label: string; value: string; color: string; dark: boolean }) {
  return (
    <div className={`min-w-[84px] flex-1 rounded-full px-3 py-2 ${dark ? 'bg-white/5' : 'bg-black/[0.04]'}`}>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
        <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}
