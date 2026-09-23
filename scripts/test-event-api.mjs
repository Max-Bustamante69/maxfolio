// Exercises api/event.ts (and a couple of api/ab.ts's shared-helper assumptions) against a fake
// Upstash KV — real Request objects, real handler code, no network and no Vercel deploy needed. Run
// with `bun scripts/test-event-api.mjs` (the api/*.ts files use bare-specifier TS the plain Node
// resolver can't load; Bun resolves and type-strips them directly, same as `bun run build` already
// relies on Bun's own toolchain elsewhere in this repo).
import assert from 'node:assert/strict'

// ---- Fake Upstash: a real in-memory Redis-ish store, enough surface for INCR/HINCRBY/HGETALL/MGET,
// the four commands api/ab.ts and api/event.ts issue through `pipeline()`. Every test that wants a
// "configured" KV points KV_REST_API_URL at this fake server's URL via the mocked `fetch` below —
// api/_kv.ts's `kv()` only checks that both env vars are non-empty, never that the URL is reachable.
const store = new Map()
function hincrby(hash, field, by) {
  const h = store.get(hash) ?? new Map()
  const next = (h.get(field) ?? 0) + by
  h.set(field, next)
  store.set(hash, h)
  return next
}
function incr(key) {
  const next = (store.get(key) ?? 0) + 1
  store.set(key, next)
  return next
}
function hgetall(hash) {
  const h = store.get(hash)
  if (!h) return []
  const flat = []
  for (const [k, v] of h) flat.push(k, String(v))
  return flat
}
function mget(keys) {
  return keys.map((k) => {
    const v = store.get(k)
    return v === undefined ? null : String(v)
  })
}

function runCommand([cmd, ...args]) {
  switch (cmd) {
    case 'HINCRBY':
      return hincrby(args[0], args[1], Number(args[2]))
    case 'INCR':
      return incr(args[0])
    case 'HGETALL':
      return hgetall(args[0])
    case 'MGET':
      return mget(args)
    default:
      throw new Error(`fake KV: unhandled command ${cmd}`)
  }
}

const originalFetch = globalThis.fetch
function installFakeKv() {
  globalThis.fetch = async (url, init) => {
    if (typeof url === 'string' && url.endsWith('/pipeline')) {
      const cmds = JSON.parse(init.body)
      const result = cmds.map((c) => ({ result: runCommand(c) }))
      return new Response(JSON.stringify(result), { status: 200 })
    }
    throw new Error(`fake KV: unexpected fetch ${url}`)
  }
}
function restoreFetch() {
  globalThis.fetch = originalFetch
}

// ---- Tiny test harness ----
let pass = 0
let fail = 0
function ok(cond, label) {
  if (cond) {
    pass++
  } else {
    fail++
    console.error(`FAIL: ${label}`)
  }
}
async function eqStatus(promise, expected, label) {
  const res = await promise
  ok(res.status === expected, `${label} (expected ${expected}, got ${res.status})`)
  return res
}

const post = (handler, body) => handler(new Request('https://x/api/event', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }))
const get = (handler, qs = '') => handler(new Request(`https://x/api/event${qs}`, { method: 'GET' }))

async function main() {
  const { default: eventHandler } = await import('../api/event.ts')

  // --- KV not configured: every write is a no-op, GET reports configured:false regardless of token ---
  delete process.env.KV_REST_API_URL
  delete process.env.KV_REST_API_TOKEN
  process.env.STATS_TOKEN = 'test-token'
  await eqStatus(post(eventHandler, { name: 'contact_open', props: {} }), 204, 'POST with no KV configured is a no-op 204')
  const unconfigured = await get(eventHandler, '?token=test-token')
  ok(unconfigured.status === 200, 'GET with no KV configured still returns 200')
  const unconfiguredBody = await unconfigured.json()
  ok(unconfiguredBody.configured === false, 'GET with no KV configured reports { configured: false }')

  // --- KV configured from here on ---
  process.env.KV_REST_API_URL = 'https://fake-kv.local'
  process.env.KV_REST_API_TOKEN = 'fake-token'
  installFakeKv()

  // Auth: no token / wrong token / right token
  await eqStatus(get(eventHandler), 401, 'GET with no token is 401')
  await eqStatus(get(eventHandler, '?token=wrong'), 401, 'GET with wrong token is 401')
  const okRes = await eqStatus(get(eventHandler, '?token=test-token'), 200, 'GET with the right token is 200')
  const okBody = await okRes.json()
  ok(okBody.configured === true, 'GET with the right token, KV up: configured: true')
  ok(Array.isArray(okBody.days) && okBody.days.length === 30, 'GET returns exactly 30 days')
  ok(okBody.totals && typeof okBody.totals === 'object', 'GET returns an aggregated totals object')

  // Whitelist: unknown event name is rejected
  await eqStatus(post(eventHandler, { name: 'not_a_real_event', props: {} }), 400, 'POST with an unknown event name is 400')

  // Whitelist: known event, invalid/missing required prop is rejected
  await eqStatus(post(eventHandler, { name: 'section_view', props: {} }), 400, 'POST section_view with no section is 400')
  await eqStatus(post(eventHandler, { name: 'theme_switch', props: { to: 'not-a-theme' } }), 400, 'POST theme_switch with an unlisted theme is 400')
  await eqStatus(post(eventHandler, { name: 'store_sheet_open', props: { store: 'not-a-real-store' } }), 400, 'POST store_sheet_open with an unknown slug is 400')
  await eqStatus(post(eventHandler, { name: 'filter_change', props: { kind: 'not-a-kind', value: 'x' } }), 400, 'POST filter_change with an unlisted kind is 400')
  // Free text / URL-shaped values never pass the slug pattern.
  await eqStatus(post(eventHandler, { name: 'cta_click', props: { cta: 'https://evil.example/x', position: 'hero' } }), 400, 'POST cta_click with a URL-shaped value is 400')

  // Whitelist: valid event actually increments the fake store, twice, and GET reflects it
  await eqStatus(post(eventHandler, { name: 'section_view', props: { section: 'experience' } }), 204, 'POST a valid section_view is 204')
  await eqStatus(post(eventHandler, { name: 'section_view', props: { section: 'experience' } }), 204, 'POST the same valid section_view again is 204')
  const afterRes = await get(eventHandler, '?token=test-token')
  const afterBody = await afterRes.json()
  ok(afterBody.totals['section_view:experience'] === 2, `section_view:experience totals reflect both writes (got ${afterBody.totals['section_view:experience']})`)
  const todayKey = new Date().toISOString().slice(0, 10)
  ok((afterBody.daily[todayKey]?.['section_view:experience'] ?? 0) === 2, "today's daily bucket also reflects both writes")

  // A real store slug (from the registry, the single source) is accepted.
  await eqStatus(post(eventHandler, { name: 'store_sheet_open', props: { store: 'the-gummy-box' } }), 204, 'POST store_sheet_open with a real registry slug is 204')

  restoreFetch()

  console.log(`\n${pass} passed, ${fail} failed`)
  if (fail > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
