// First-party A/B ledger. POST {type: 'view'|'contact', variant, theme?} increments per-variant counters
// (totals and per day) in the KV store Vercel exposes as KV_REST_API_URL / KV_REST_API_TOKEN (Upstash
// Redis from the Marketplace). GET returns the totals and the last 30 days so a private dashboard can read
// the conversion per variant. Without a store both are harmless no-ops, so the site never depends on it.
export const config = { runtime: 'edge' }

const VARIANTS = ['apple', 'neo', 'persona']
const TYPES = ['view', 'contact']
const THEMES = ['apple', 'luxury', 'brutalist', 'neo', 'persona', 'menu']

const kv = () => {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  return url && token ? { url, token } : null
}

async function pipeline(cmds: (string | number)[][]) {
  const store = kv()
  if (!store) return null
  const res = await fetch(`${store.url}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${store.token}`, 'content-type': 'application/json' },
    body: JSON.stringify(cmds),
  })
  if (!res.ok) throw new Error(`kv ${res.status}`)
  return (await res.json()) as { result: unknown }[]
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    if (!kv()) return json({ configured: false, variants: VARIANTS })
    const days = Array.from({ length: 30 }, (_, i) => new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)).reverse()
    const keys: string[] = []
    for (const v of VARIANTS) for (const t of TYPES) keys.push(`ab:${t}:${v}`)
    for (const v of VARIANTS) for (const t of TYPES) for (const d of days) keys.push(`ab:${t}:${v}:${d}`)
    const out = await pipeline([['MGET', ...keys]])
    const values = ((out?.[0]?.result as (string | null)[]) ?? []).map((x) => Number(x ?? 0))
    let i = 0
    const totals: Record<string, { view: number; contact: number; rate: number | null }> = {}
    for (const v of VARIANTS) {
      const view = values[i++]
      const contact = values[i++]
      totals[v] = { view, contact, rate: view ? contact / view : null }
    }
    const daily: Record<string, Record<string, number[]>> = {}
    for (const v of VARIANTS) {
      daily[v] = {}
      for (const t of TYPES) daily[v][t] = values.slice(i, (i += days.length))
    }
    return json({ configured: true, days, totals, daily })
  }
  if (req.method !== 'POST') return new Response(null, { status: 405 })
  if (!kv()) return new Response(null, { status: 204 })
  let body: { type?: string; variant?: string; theme?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(null, { status: 400 })
  }
  const type = TYPES.includes(body.type ?? '') ? body.type! : null
  const variant = VARIANTS.includes(body.variant ?? '') ? body.variant! : null
  if (!type || !variant) return new Response(null, { status: 400 })
  const day = new Date().toISOString().slice(0, 10)
  const cmds: (string | number)[][] = [
    ['INCR', `ab:${type}:${variant}`],
    ['INCR', `ab:${type}:${variant}:${day}`],
  ]
  if (type === 'contact' && THEMES.includes(body.theme ?? '')) cmds.push(['INCR', `ab:contact:theme:${body.theme}`])
  try {
    await pipeline(cmds)
  } catch {
    return new Response(null, { status: 202 })
  }
  return new Response(null, { status: 204 })
}
