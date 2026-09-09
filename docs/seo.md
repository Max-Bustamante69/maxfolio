# SEO & perf — decisions and what's generated

Lane: `feat/wt-copyseo`. Grounded in `docs/research/wf4-seo-perf.md` (copied into the lane's scratchpad
research set) and the repo as it actually behaves — every item below cites the file it changed or the
measurement that ruled a change out.

## Structured data (JSON-LD)

`index.html` no longer hand-types its `Person`/`WebSite` JSON-LD. `scripts/build-jsonld.mjs` reads
`src/data/registry.ts` (the same untranslated-facts source the React app reads) and generates two
`<script type="application/ld+json">` blocks between `<!-- JSON-LD:START -->` / `<!-- JSON-LD:END -->`
markers, plus `public/jsonld.json` for offline inspection:

1. **`ProfilePage`** wrapping a **`Person`** as `mainEntity` (was a separate `Person` + `WebSite` pair) —
   `ProfilePage` is the type Google's Profile-page rich result keys on for a personal homepage, per
   schema.org's own reference. Added `hasOccupation` (with `occupationLocation`) alongside the fields
   the old block already had (`jobTitle`, `worksFor`, `address`, `knowsAbout`, `alumniOf`, `sameAs`).
2. **`ItemList`** of **`CreativeWork`** — one entry per storefront in `registry.stores` whose
   `status === 'live'` and `url` is non-empty (14 of the 22 entries; the rest are `dev`-status or have
   no public URL, e.g. Gummind/Rimo). Each item is `{ name, url, creator }` only — no invented
   `dateCreated`/`image` per item, since the registry doesn't carry a per-store og-image yet.

Run `node scripts/build-jsonld.mjs` (wired into `"prebuild"` in `package.json`, so `bun run build` /
`npm run build` regenerate it automatically) whenever a store is added, removed, or changes `status`/`url`
in the registry — the block will drift from the Shopify Work section otherwise. `node
scripts/check-jsonld.mjs` is a structural sanity check (valid JSON, required `@type`s present,
`numberOfItems` matches the array length and is non-zero) — it is not a schema.org validator, but it
does fail loudly on the two failure modes that actually happened during development (a markers typo,
and a filter that silently produced an empty list). Both `build-jsonld.mjs` and `check-jsonld.mjs`
parse `registry.ts` with a scoped regex per store line rather than importing the TypeScript module,
matching the convention `scripts/store-telemetry.mjs` already uses for the same file (this repo's
scripts run under plain `node`, which cannot `import` a `.ts` file directly).

## hreflang — chose the honest minimum, not the full pattern

`src/context/LanguageContext.tsx` keeps locale in `localStorage['lang']` + `navigator.language`
sniffing; there is **no URL that is distinct per language** (no `/es/`, no `?lang=`). Google's hreflang
mechanism requires a distinct, crawlable URL per declared alternate — declaring `hreflang="es"` pointing
at `https://www.maxfolio.dev/` would be a lie the moment a crawler with no saved locale and
`navigator.language: en-US` (Googlebot's default) hits that URL and gets English content back. That's
the exact "hreflang without matching content parity" misconfiguration Search Central flags.

**Decision:** ship only the honest, self-referential tag:
```html
<link rel="alternate" hreflang="x-default" href="https://www.maxfolio.dev/" />
```
No `hreflang="es"` / `hreflang="ja"` alternates. The lower-risk, cheap fix from the research digest
(`?lang=es` query-param routing wired into `LanguageContext`, then real `hreflang` alternates) was
**not** implemented this pass — it touches the locale-detection code path that `ab.config.ts` /
`middleware.ts`'s edge A/B split also reads, and retrofitting it correctly is more surface area than a
copy/SEO/perf lane should carry in one pass without its own review. Follow-up, in priority order if the
owner wants real hreflang: (1) read `?lang=` in `LanguageContext` before `localStorage`, (2) declare
`en`/`es`/`ja` alternates, (3) longer-term, path-prefix routing (`/es/`, `/ja/`) is what Google's own
docs prefer over query-params. Until one of those ships, `x-default` alone is the truthful state of the
site: one URL, locale detected client-side.

## Canonical under the A/B test

Verified, not changed: `Apple.tsx`'s `<SEOHead canonical="https://www.maxfolio.dev" .../>` call is not
conditioned on the A/B variant — every variant self-referentially canonicalizes to the same URL, which
is the standard pattern for avoiding split ranking signals across test cells. `Design1.tsx`/`Design4.tsx`
canonicalize to their own `/brutalist`/`/luxury` (correct — those are real, distinct, permanent routes,
not A/B cells).

## Title tag — found and fixed a real bug, not just verified

Building the Playwright proof for this lane surfaced a live defect: `src/hooks/useDynamicFavicon.ts`
was also writing `document.title = titles[type]` (a short static label like `"MB | Portfolio"`) in
its own `useEffect`, racing `SEOHead`'s `document.title = title` (the real, locale/description-aware
SEO title). React commits a child component's effects (`SEOHead`) before the parent's own hook
effects (`useDynamicFavicon('apple')`, called directly in `Apple.tsx`'s body) — so on every route,
`useDynamicFavicon` wrote *after* `SEOHead` and silently won.

For the English locale specifically (the only locale bundled eagerly — see
`src/content/index.ts`'s `loaded = { en }` — everyone else is a lazy import) the component rendered
in one synchronous pass, so `SEOHead`'s effect never got a second chance to re-fire and re-assert the
real title. **The live tab/crawler title for the default English visit to every one of the four
routes was the six-character label, not the SEO title** — confirmed with a Playwright trace that
timestamps every `document.title` write (`TITLESET 79.0 "Maximiliano Bustamante | CTO & Shopify Tech
Lead"` then `TITLESET 130.0 "MB | Portfolio"`, final = the short label). Spanish/Japanese visits
happened to end up correct only by accident: their content loads asynchronously, so `SEOHead`'s
effect re-fires on the later re-render (its `description` dependency differs from the English
placeholder shown on the first paint) and overwrites the favicon hook's write a second time.

**Fix:** `useDynamicFavicon` now only touches the favicon `<link>`; `document.title` has exactly one
owner (`SEOHead`) on every route. Verified after the fix with the same title-write trace (`en`/`es`/`ja`
all end on the correct title, single write per locale) and with the full Playwright proof's
`perThemeTitles` check.

## Per-theme titles — verified distinct

- `/` → `SEOHead title={c.meta.title}` → "Maximiliano Bustamante | CTO & Shopify Tech Lead"
- `/luxury`, `/brutalist` → `` `${c.meta.title} — ${t(self.nameKey)}` `` → same base + the theme's own name
- `/menu` → `t('menuPage.seoTitle')`, its own string in `public/locales/*.json`, not derived from `c.meta.title`

All four resolve to different `<title>` text at runtime (confirmed by reading the rendered
`document.title` per route in the Playwright proof below).

## robots.txt / sitemap.xml

`public/robots.txt` pointed its `Sitemap:` line at `https://maxfolio.co/sitemap.xml` while every
canonical/OG/JSON-LD URL in the repo is `https://www.maxfolio.dev` — a live domain mismatch, not
hypothetical. Fixed to `https://www.maxfolio.dev/sitemap.xml`.

`public/sitemap.xml` is now generated by `scripts/build-sitemap.mjs` (also wired into `"prebuild"`):
`lastmod` per route comes from `git log -1 --format=%cd -- <page file>`, so it can't go stale relative
to an actual content edit the way a hand-typed date can.

## OG image / Twitter card

Already correct, verified rather than changed: `public/og-image.png` is 1200×630 (checked with
`sharp`'s `metadata()`), and `index.html` already carries `og:image:width`/`og:image:height` (1200/630)
and `twitter:card: summary_large_image`. One shared image across all four themes is a known gap (the
research digest's `@vercel/og` per-theme-card idea) — not built this pass; flagged as a follow-up, not
silently dropped.

## `will-change` hygiene

`grep -rn "will-change" src` found exactly two hits, both in `src/components/gallery/ProjectFrame.tsx`
— `will-change-transform` applied unconditionally to the tilting laptop card in every gallery/Shopify
Work tile (up to 18 of them mounted at once). That's the permanent-`will-change`-on-many-layers
antipattern the research digest's §3.11 names. Changed to apply the class only while `hover` is true
(the only state in which the card's `scale`/`rotate` transform actually animates), so the GPU layer
promotion is scoped to the card currently under the pointer, not every card on the page. No other
`will-change` in the codebase; framer-motion's own `motion.*` components manage their own layer
promotion internally and weren't touched.

## `content-visibility: auto` — tried, measured, reverted

The plan (per the research digest) was `content-visibility: auto` + a measured `contain-intrinsic-size`
on the Years/Gallery/Projects/Skills section wrappers in `src/pages/Apple.tsx`. Executed the "measure
first" step the house rule requires:

1. Added `id="years"`/`id="gallery"`/`id="projects"`/`id="skills"` to the four `<section>` wrappers
   (kept — see "bonus fix" below) and measured real rendered height at 1440×900 and 390×844 via a
   production `vite preview` build. Desktop: 1354 / 1273 / 1215 / 837px. Mobile: 1516 / 876 / 1262 /
   1272px.
2. Applied `content-visibility: auto` + `contain-intrinsic-size: 0 <max-of-the-two>px` to all four,
   rebuilt, reloaded.
3. Re-measured the same four elements on the same loaded page. Heights had moved to 1744 / 1504 / 1494
   / 1504px — already inconsistent with the input measurement. Toggling `content-visibility` back to
   `visible` via `element.style.contentVisibility = 'visible'` **in the same page load, without any
   scroll or reload**, then produced a *third* set of heights: 2804 / 915 / 1215 / 1089px.
4. That range (Years alone: 1354 → 1744 → 2804px across three measurements of the identical build) is
   not `content-visibility` behaving as documented — it's these sections' own internals (Years is a
   pinned/scroll-driven timeline; Gallery is a carousel; both likely read their own `getBoundingClientRect`
   or run a `ResizeObserver` to size themselves) reacting unpredictably to the containment change.
   Shipping this against `docs/lighthouse-baseline.md`'s current **CLS 0** would be a real, measured
   regression risk, not a hypothetical one — the opposite of what §3.7 of the research digest asks for.

**Decision: reverted.** The four sections keep their `id` (useful on its own, see below) but not
`content-visibility`/`contain-intrinsic-size`. Follow-up, if the owner wants this win: instrument Years
and Gallery's internal height/position logic first (are they using `ResizeObserver` against an ancestor
that itself changes size under containment?), fix that coupling, then re-run this same before/after
height check before shipping `content-visibility` on those two specifically. Skills and Projects are
simpler (no scroll-pinning) and are more likely safe candidates for a future retry in isolation.

**Bonus fix found while measuring:** `src/pages/Apple.tsx`'s in-page nav (`ScrollRail` + the header nav
list) links to `#experience`, `#shopify`, `#gallery`, `#projects`, `#contact` — none of those ids existed
on any element before this pass (only `#hero` and `#explore` did), so `ScrollRail`'s
`document.getElementById(s.id)` silently returned `null` for five of six sections and those nav
links/rail ticks did nothing. Added the missing `id` + `scroll-mt-20` (matching the existing
`#hero`/`#explore` pattern) to all six section wrappers — a one-attribute change with no visual or
behavioral side effect beyond making the existing nav actually navigate, verified in the Playwright
proof below.

## Lighthouse — before/after

`docs/lighthouse-baseline.md` already has a recent baseline (2026-09-08, mobile 95/100/100/100). Ran
`node scripts/lighthouse-local.mjs --runs 3 --mobile-only` after this lane's changes (content-visibility
reverted, so the delta here is: JSON-LD restructure, robots.txt fix, sitemap regeneration, hreflang tag,
`will-change` scoping, 6 new nav-anchor ids, FAQ/eyebrow copy). See the table appended to
`docs/lighthouse-baseline.md` for the numbers — reported as medians of 3 runs, on an otherwise-idle
machine per the house Lighthouse rule, and noted as noisy like every other row in that file.
