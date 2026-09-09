// Real commerce facts per storefront, read from each store's PUBLIC Shopify storefront endpoints
// (never typed by hand, never estimated): /meta.json (shop name, currency, country, published
// counts), /products.json (catalog size, price band, sale share, variants/product, product types)
// and /collections.json (collections count). No conversion rate, revenue or AOV is fetched or
// invented here — those are not measured for these stores and this script cannot produce them.
//
// Output: src/data/commerce.json  { [slug]: { status: 'live'|'protected'|'unreachable', fetchedAt,
//   shopName?, currency?, country?, products, collections, priceMin, priceMax, onSaleShare,
//   variantsPerProduct, productTypes: [{ type, count }] } }
//
// Usage: node scripts/store-commerce.mjs   (re-runnable; skips stores with no public `url` in the
// registry and records `unreachable`/`protected` gracefully instead of throwing)
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const REGISTRY = path.join(ROOT, 'src/data/registry.ts')
const OUT = path.join(ROOT, 'src/data/commerce.json')
const TIMEOUT_MS = 15000
const PAGE_LIMIT = 250
const MAX_PAGES = 10 // 2,500 products ceiling — every fleet store is well under this

// Same convention as scripts/build-jsonld.mjs / store-telemetry.mjs: one object literal per line
// in registry.ts, pulled out with a scoped regex rather than a full TS parser.
const registrySrc = fs.readFileSync(REGISTRY, 'utf8')
const storesBlock = registrySrc.match(/export const stores: StoreEntry\[\] = \[([\s\S]*?)\n\]/)
if (!storesBlock) throw new Error('Could not find `stores` array in registry.ts')
const storeLines = storesBlock[1].split('\n').filter((l) => l.trim().startsWith('{'))
const stores = storeLines
  .map((line) => ({
    slug: line.match(/slug: '([^']*)'/)?.[1] ?? '',
    url: line.match(/url: '([^']*)'/)?.[1] ?? '',
  }))
  .filter((s) => s.url)

const fetchJson = async (url) => {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0 (maxfolio commerce-fetch)' }, redirect: 'follow' })
    if (res.status === 401 || res.status === 403) return { kind: 'protected' }
    if (!res.ok) return { kind: 'error', status: res.status }
    const text = await res.text()
    try {
      return { kind: 'ok', data: JSON.parse(text) }
    } catch {
      // A password-gated store serves its HTML splash page (200) even for a JSON path.
      return { kind: 'protected' }
    }
  } catch (err) {
    return { kind: 'unreachable', message: err?.message ?? String(err) }
  } finally {
    clearTimeout(t)
  }
}

/** Paginates a Shopify public JSON list endpoint (?limit=250&page=N) until an empty page or MAX_PAGES. */
const fetchAllPages = async (base, key) => {
  const items = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const r = await fetchJson(`${base}?limit=${PAGE_LIMIT}&page=${page}`)
    if (r.kind !== 'ok') return { kind: r.kind, message: r.message, status: r.status, items }
    const batch = r.data?.[key] ?? []
    items.push(...batch)
    if (batch.length < PAGE_LIMIT) break
  }
  return { kind: 'ok', items }
}

const round2 = (n) => Math.round(n * 100) / 100

async function fetchStore({ slug, url }) {
  const base = url.replace(/\/$/, '')
  const meta = await fetchJson(`${base}/meta.json`)
  const productsRes = await fetchAllPages(`${base}/products.json`, 'products')

  if (productsRes.kind === 'protected') return { status: 'protected', fetchedAt: new Date().toISOString() }
  if (productsRes.kind === 'unreachable' || productsRes.kind === 'error') {
    return { status: 'unreachable', fetchedAt: new Date().toISOString(), note: productsRes.message ?? `HTTP ${productsRes.status ?? '?'}` }
  }

  const collectionsRes = await fetchAllPages(`${base}/collections.json`, 'collections')

  const products = productsRes.items
  let priceMin = null
  let priceMax = null
  let variantCount = 0
  let onSaleVariants = 0
  let pricedVariants = 0
  const typeCounts = new Map()
  for (const p of products) {
    const type = (p.product_type ?? '').trim()
    typeCounts.set(type || 'Uncategorized', (typeCounts.get(type || 'Uncategorized') ?? 0) + 1)
    const variants = p.variants ?? []
    variantCount += variants.length
    for (const v of variants) {
      const price = Number(v.price)
      if (!Number.isFinite(price)) continue
      pricedVariants++
      const compareAt = v.compare_at_price ? Number(v.compare_at_price) : null
      if (compareAt !== null && Number.isFinite(compareAt) && compareAt > price) onSaleVariants++
      // A $0 variant is a bundle-builder container product priced by a Shopify Function at checkout
      // (e.g. NOS Café's "Mi caja", TierraMont's "Mi kit") — not a real shelf price, so it's excluded
      // from the band a shopper actually pays.
      if (price <= 0) continue
      if (priceMin === null || price < priceMin) priceMin = price
      if (priceMax === null || price > priceMax) priceMax = price
    }
  }

  const metaData = meta.kind === 'ok' ? meta.data : null

  return {
    status: 'live',
    fetchedAt: new Date().toISOString(),
    shopName: metaData?.name ?? null,
    currency: metaData?.currency ?? null,
    country: metaData?.country ?? null,
    shipsToCount: Array.isArray(metaData?.ships_to_countries) ? metaData.ships_to_countries.length : null,
    products: products.length,
    collections: collectionsRes.kind === 'ok' ? collectionsRes.items.length : (metaData?.published_collections_count ?? null),
    priceMin,
    priceMax,
    onSaleShare: pricedVariants > 0 ? round2(onSaleVariants / pricedVariants) : null,
    variantsPerProduct: products.length > 0 ? round2(variantCount / products.length) : null,
    productTypes: [...typeCounts.entries()]
      .filter(([type]) => type !== 'Uncategorized')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([type, count]) => ({ type, count })),
  }
}

const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
const out = { ...previous }

for (const store of stores) {
  process.stdout.write(`${store.slug.padEnd(18)} `)
  try {
    const result = await fetchStore(store)
    out[store.slug] = result
    if (result.status === 'live') {
      console.log(`live    products=${result.products} collections=${result.collections} price=${result.priceMin}-${result.priceMax} ${result.currency ?? '?'} sale=${result.onSaleShare ?? '?'}`)
    } else {
      console.log(`${result.status}${result.note ? ` (${result.note})` : ''}`)
    }
  } catch (err) {
    out[store.slug] = { status: 'unreachable', fetchedAt: new Date().toISOString(), note: err?.message ?? String(err) }
    console.log(`unreachable (${err?.message ?? err})`)
  }
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
const live = Object.values(out).filter((s) => s.status === 'live').length
console.log(`\nwrote ${OUT} — ${Object.keys(out).length} stores, ${live} live`)
