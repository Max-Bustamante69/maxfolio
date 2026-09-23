# First-party analytics

Two first-party ledgers, both backed by the same optional Upstash Redis KV store — no third-party
analytics vendor beyond Vercel's own page-view Web Analytics, which this doesn't replace.

- `api/ab.ts` — the landing-page A/B test's own view/contact counters, keyed by variant. Predates
  the general taxonomy below and stays separate on purpose (it needs to answer "did variant X convert
  better", not "what happened on the page").
- `api/event.ts` — everything else: the general event taxonomy below, read by the private `/stats`
  dashboard (`src/pages/Stats.tsx`).
- `api/_kv.ts` — the shared Upstash REST helpers (`kv()`, `pipeline()`, `json()`, `safeEqual()`) both
  of the above import. Not a route itself.

Without a KV store connected, every POST to either endpoint is a harmless 204 no-op and every GET
reports `{ configured: false }` — the site never depends on either ledger existing.

A third function, `api/psi.ts`, is unrelated to the KV ledgers above (it proxies Google PageSpeed
Insights for the Apple page's "Measure your store, right now" section) but reuses `api/_kv.ts`'s
`kv()`/`pipeline()` for one thing: a soft per-IP rate limit, itself optional — see its own header
comment and the README note on `PSI_KEY`.

## Turning it on (two steps, both in the Vercel project)

1. **Storage → Marketplace → add Upstash Redis** (free tier). This sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` on the project automatically — nothing to copy by hand.
2. **Settings → Environment Variables → add `STATS_TOKEN`** — any long random string. This is the
   password `/stats` asks for once (kept in `sessionStorage` after that, never in a cookie).

Redeploy after either step for the new env vars to reach the edge functions.

## Event taxonomy (`api/event.ts`)

A strict whitelist is the only thing that ever reaches Redis: fixed event names, fixed prop keys, and
prop values that are either a closed enum or a slug pattern (letters/digits/spaces/`. _ & / + -`,
capped at 24–48 characters) — no free text, no URLs except a real store slug (checked against
`src/data/registry.ts`'s `stores`, the single source for that list), no PII, no IP address stored
anywhere.

| Event | Props | Notes |
|---|---|---|
| `section_view` | `section` (slug) | Fired once per section id per page load, off one shared `IntersectionObserver` at threshold 0.4 over every `[data-track-section]` element (see `src/lib/track.ts`'s `useSectionViewTracking`). |
| `cta_click` | `cta` (slug), `position` (`nav\|hero\|section\|footer\|fab\|mobile\|sheet`) | |
| `contact_open` | `theme?` (one of the six themes) | Fires from inside `ContactFormModal` itself — every theme's "Get in touch" trigger routes through that one shared component, so this is wired once, not per-button. |
| `contact_submit` | `theme?` | Fires next to the existing `recordAb('contact', …)` call, on a real successful submit only. |
| `cv_download` | `theme?` | |
| `theme_switch` | `to` (one of the six themes) | Switching between the six *design* themes (Apple/Luxury/Brutalist/Neo/Persona/Terminal) via a `LogoSelector*`/`DesignMark` list — not the dark/light toggle. |
| `locale_switch` | `to` (`en\|es\|ja`) | |
| `store_sheet_open` | `store` (registry slug) | The case-study sheet (`ProjectModal`) opening, from either the Shopify Work index or the Gallery wall. |
| `outbound_store_click` | `store` (registry slug) | A real "Visit store" link to the store's own domain. |
| `tool_drawer_open` | `tool` (slug) | The skills section's `ToolDrawer`, wired once in that shared component so both the orbit and ledger layouts feed it. |
| `filter_change` | `kind` (`stores\|skills\|gallery`), `value` (slug) | |
| `psi_check` | `host?` (the measured store's hostname only, never the full URL) | Fires from `StoreCheck.tsx` after a successful `api/psi.ts` run. The one event whose per-value breakdown isn't a closed set — see that file's own comment. |

Storage: `HINCRBY` on one all-time hash (`ev:totals`) and one same-day hash (`ev:day:<yyyy-mm-dd>`),
one field per event or per event+prop worth ranking on its own (`cta_click:hero:store-review`,
`theme_switch:luxury`). `GET /api/event?token=…` returns `{ configured, days, totals, daily }`; the
token is compared against `STATS_TOKEN` in constant time and a missing/wrong token is a 401 before
anything else runs.

## Client side (`src/lib/track.ts`)

`track(name, props)` is a no-op (never throws, never blocks the interaction it's attached to) when:

- `navigator.doNotTrack === '1'`
- `navigator.webdriver` is true (automated browsers — Playwright probes included)
- the page isn't on `maxfolio.dev`, `www.maxfolio.dev`, or a `*.vercel.app` preview

Otherwise it POSTs via `navigator.sendBeacon` (falling back to `fetch(..., { keepalive: true })`).

## `/stats`

Private, unlisted (no link anywhere in the site's nav or footer), `noindex` via its own `<SEOHead>`,
not in `public/sitemap.xml` (`scripts/build-sitemap.mjs` is an explicit route list, not a crawl). Asks
for the token once, then reads `GET /api/event` and `GET /api/ab` and shows totals, a 30-day trend for
contact opens/sends, the section-reach funnel (each section's share of A/B page views), CTA ranking,
theme/locale switches, top stores (by sheet-open and by outbound click), tools opened, and filter
changes — built from the chart primitives in `src/components/gallery/charts.tsx` (`CountUp` for the
headline numbers) plus one small dedicated sparkline, documented in `Stats.tsx` as to why it isn't
`IndexAreaLine` (that primitive always paints a positive delta in the "good" color, which doesn't fit
raw day-to-day event counts). Shows a clear "not configured yet" state with the two setup steps above
when no KV store is connected.

## Testing without a real Vercel/Upstash deploy

`scripts/test-event-api.mjs` (`bun scripts/test-event-api.mjs`) imports `api/event.ts`'s handler
directly and exercises it against a fake in-memory KV (a mocked `fetch` intercepting Upstash's
`/pipeline` endpoint) with real `Request` objects: the whitelist rejects unknown events and invalid
props, `GET` without a token is 401, `GET` with the right token returns the aggregated shape, and a
missing KV store makes `POST` a 204 no-op and `GET` report `configured: false`.

## Known gaps

- `section_view` and the shared-component wiring above are live on the Apple (`/`) page and every
  component it shares with the other five themes (contact modal, `LogoSelector*`/`LanguageSelector*`,
  the case-study sheet, the tool drawer, the skills filter bar, `ShopifyWork`/`Gallery`'s store links).
  Persona (`/arcade`) and Terminal (`/terminal`) each carry their own inline design-switcher markup
  (not the shared `LogoSelector*` components), so `theme_switch` isn't wired from those two pages'
  own switchers yet.
- The section-reach funnel's denominator is total A/B page views (`api/ab.ts`'s `view` counters across
  variants), which only count visits to `/`, not to the other five theme routes.
