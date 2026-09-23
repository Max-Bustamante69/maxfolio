// Shared Upstash REST helpers for the KV-backed first-party ledgers (api/ab.ts, api/event.ts). A
// missing KV store (no Marketplace integration added to the Vercel project yet) is not an error
// anywhere that calls this — every caller treats `kv()` returning null as "not configured yet" and
// no-ops, so the site never depends on either ledger existing. Not itself a route (the leading
// underscore keeps Vercel from treating this file as an API endpoint).

export const kv = () => {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  return url && token ? { url, token } : null
}

/** Runs a batch of Redis commands through Upstash's REST `/pipeline`, or returns null with no
 *  request at all when no store is configured. Throws on a non-2xx response so callers can tell
 *  "not configured" (null) apart from "configured but the write/read actually failed". */
export async function pipeline(cmds: (string | number)[][]) {
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

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

/** Constant-time string compare for the stats dashboard's shared token — cheap due diligence against
 *  a trivial length/prefix timing leak, not a defense against a serious adversary (this guards a
 *  personal read-only analytics view, not an account). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
