// First-party event ledger — the general taxonomy behind `/stats` (see docs/analytics.md). POST
// { name, props } increments one all-time HASH (`ev:totals`) and one same-day HASH
// (`ev:day:<yyyy-mm-dd>`) via HINCRBY, one field per event (`section_view`, or per event+prop when the
// prop is worth ranking on its own — `cta_click:hero:primary`, `theme_switch:luxury`). A strict
// per-event whitelist is the only thing that ever reaches Redis: fixed event names, fixed prop keys,
// and prop values that are either a closed enum or a slug pattern capped at a small length — no free
// text, no URLs beyond a real store slug (checked against the registry, the single source for that
// list), no PII, no IP address stored anywhere. Without a KV store (Upstash not added to the Vercel
// project yet) POST is a 204 no-op and GET reports `{ configured: false }` — the site never depends on
// this endpoint. GET is gated by `STATS_TOKEN` so the aggregated numbers stay private.
export const config = { runtime: 'edge' }
import { kv, pipeline, json, safeEqual } from './_kv'
import { stores } from '../src/data/registry'

const STORE_SLUGS = new Set(stores.map((s) => s.slug))
const THEMES = ['apple', 'luxury', 'brutalist', 'neo', 'persona', 'terminal'] as const
const LOCALES = ['en', 'es', 'ja'] as const
const CTA_POSITIONS = ['nav', 'hero', 'section', 'footer', 'fab', 'mobile', 'sheet'] as const
const FILTER_KINDS = ['stores', 'skills', 'gallery'] as const

// A slug/name pattern generous enough for real values in this codebase (tool names like "Shopify
// CLI", filter ids like "review-walls", section ids like "shopify-work") while still refusing free
// text, URLs or anything long enough to smuggle real content.
const isSlug = (v: unknown, max = 48): v is string => typeof v === 'string' && v.length > 0 && v.length <= max && /^[A-Za-z0-9][A-Za-z0-9 ._&/+-]*$/.test(v)
const isEnum = <T extends readonly string[]>(v: unknown, values: T): v is T[number] => typeof v === 'string' && (values as readonly string[]).includes(v)

interface EventSpec {
  /** Validates the raw `props` object; returns the field suffix(es) to HINCRBY beyond the bare event
   *  name, or `false` when props fail validation (rejects the whole event). */
  fields: (props: Record<string, unknown>) => string[] | false
}

const EVENTS: Record<string, EventSpec> = {
  section_view: { fields: (p) => (isSlug(p.section) ? [`section_view:${p.section}`] : false) },
  cta_click: {
    fields: (p) => (isSlug(p.cta) && isEnum(p.position, CTA_POSITIONS) ? [`cta_click:${p.position}:${p.cta}`] : false),
  },
  // `theme` is optional on these three (some triggers fire before a theme is known) — always counts
  // toward the bare event total, plus a per-theme breakdown field when a valid theme came along.
  contact_open: { fields: (p) => (isEnum(p.theme, THEMES) ? ['contact_open', `contact_open:${p.theme}`] : ['contact_open']) },
  contact_submit: { fields: (p) => (isEnum(p.theme, THEMES) ? ['contact_submit', `contact_submit:${p.theme}`] : ['contact_submit']) },
  cv_download: { fields: (p) => (isEnum(p.theme, THEMES) ? ['cv_download', `cv_download:${p.theme}`] : ['cv_download']) },
  theme_switch: { fields: (p) => (isEnum(p.to, THEMES) ? [`theme_switch:${p.to}`] : false) },
  locale_switch: { fields: (p) => (isEnum(p.to, LOCALES) ? [`locale_switch:${p.to}`] : false) },
  store_sheet_open: { fields: (p) => (typeof p.store === 'string' && STORE_SLUGS.has(p.store) ? [`store_sheet_open:${p.store}`] : false) },
  outbound_store_click: { fields: (p) => (typeof p.store === 'string' && STORE_SLUGS.has(p.store) ? [`outbound_store_click:${p.store}`] : false) },
  tool_drawer_open: { fields: (p) => (isSlug(p.tool) ? [`tool_drawer_open:${p.tool}`] : false) },
  filter_change: {
    fields: (p) => (isEnum(p.kind, FILTER_KINDS) && isSlug(p.value, 24) ? [`filter_change:${p.kind}:${p.value}`] : false),
  },
}

const last30Days = () => Array.from({ length: 30 }, (_, i) => new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)).reverse()

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const token = url.searchParams.get('token') ?? ''
    const expected = process.env.STATS_TOKEN ?? ''
    if (!expected || !safeEqual(token, expected)) return new Response(null, { status: 401 })
    if (!kv()) return json({ configured: false })
    const days = last30Days()
    const cmds: (string | number)[][] = [['HGETALL', 'ev:totals'], ...days.map((d) => ['HGETALL', `ev:day:${d}`])]
    const out = await pipeline(cmds)
    const toMap = (flat: unknown): Record<string, number> => {
      const arr = Array.isArray(flat) ? (flat as string[]) : []
      const m: Record<string, number> = {}
      for (let i = 0; i < arr.length; i += 2) m[arr[i]] = Number(arr[i + 1] ?? 0)
      return m
    }
    const totals = toMap(out?.[0]?.result)
    const daily: Record<string, Record<string, number>> = {}
    days.forEach((d, i) => {
      daily[d] = toMap(out?.[i + 1]?.result)
    })
    return json({ configured: true, days, totals, daily })
  }
  if (req.method !== 'POST') return new Response(null, { status: 405 })
  if (!kv()) return new Response(null, { status: 204 })
  // Every real payload here is a fixed event name plus a couple of short slug/enum props — nothing
  // this taxonomy ever sends is anywhere near this size. Rejecting an oversized body before it
  // reaches `JSON.parse` (rather than relying only on the platform's own request-size ceiling) keeps
  // a malformed or hostile POST cheap to reject.
  const MAX_BODY_BYTES = 2048
  const lenHeader = req.headers.get('content-length')
  if (lenHeader && Number(lenHeader) > MAX_BODY_BYTES) return new Response(null, { status: 413 })
  let raw: string
  try {
    raw = await req.text()
  } catch {
    return new Response(null, { status: 400 })
  }
  if (raw.length > MAX_BODY_BYTES) return new Response(null, { status: 413 })
  let body: { name?: string; props?: Record<string, unknown> }
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }
  const spec = typeof body.name === 'string' ? EVENTS[body.name] : undefined
  if (!spec) return new Response(null, { status: 400 })
  const fields = spec.fields(body.props && typeof body.props === 'object' ? body.props : {})
  if (!fields) return new Response(null, { status: 400 })
  const day = new Date().toISOString().slice(0, 10)
  const cmds: (string | number)[][] = []
  for (const f of fields) {
    cmds.push(['HINCRBY', 'ev:totals', f, 1])
    cmds.push(['HINCRBY', `ev:day:${day}`, f, 1])
  }
  try {
    await pipeline(cmds)
  } catch {
    return new Response(null, { status: 202 })
  }
  return new Response(null, { status: 204 })
}
