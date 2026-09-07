# Maxfolio 2026 refresh — design spec

Date: 2026-09-07 · Repo: `Max-Bustamante69/maxfolio` (deployed at https://www.maxfolio.dev) · Branch: `feat/2026-refresh`

## Goal

Bring the portfolio up to date with everything built since March 2026 (CTO at Digitdeck, 18+ Shopify
storefronts, a production Shopify app suite, the agency platform, new personal projects), add a
dedicated **Shopify Work** section and a uniform **Gallery** of real screenshots, ship a new
**Apple-style theme as the default**, keep every section available in the three existing
experiences, and carry the same content in **EN / ES / JA**. Afterwards, standardize the LinkedIn
profile (experience + media) and publish one English post aimed at US DTC/dropshipping brands
offering Shopify CRO consulting.

## Sources of truth

| What | Where |
|---|---|
| Work timeline, titles, honest metrics | `C:\Users\Usuario\Downloads\Other\Maximiliano_Bustamante_CV_Shopify_Tech_Lead.md` (fact-mined 2026-08-29) + the sober `src/data/portfolio.ts` |
| Fleet of stores, live/dev theme ids | Digitdeck brain `tools/repo-sync/repos.json` + memory `index-stores.md`, verified 2026-09-03 |
| Public store domains | verified by HTTP 200 on 2026-09-07 (22 domains) |
| Products of the agency | `Digitdeck-Apps`, `Digitdeck-Platform`, `Digitdeck-Audit-Dashboard`, `Digitdeck-Feedback`, `packages/track` |

Honesty constraints (re-verified 2026-08-29, still true): **no Hydrogen builds**, **no Checkout UI
Extensions**; apps are production custom/multi-tenant apps, not confirmed App Store listings.
Metrics shown are only the ones in the CV or in `portfolio.ts`; the unbacked numbers currently on the
site (+200 % traffic, 99.9 % uptime, +60 % sales, 1000+ patients) are removed.

## Decisions taken with Max (2026-09-07)

1. Gallery includes **all 18 fleet stores**; the ones whose published theme is not ours (Unik,
   Origen Vital, Para Machos, TierraMont, Atmósfera, Alma de Aviador v1) are captured from the DEV
   theme preview and badged **In development**. Peluna is shown as *maintained* (the live Shrine
   theme is the one we now maintain).
2. Legacy Digitdeck stores (2023-24): Saint Theory (saint-theory.com), New Urban (newurbanisa.com),
   Joystaz (joystazjeans.com), Unik (unikjeans.com), Sebum (sebumcremas.com) get captures; Gummind
   and Rimo are listed without images (no URL).
3. Public positioning everywhere (hero, SEO, LinkedIn): **CTO & Shopify Tech Lead · Digitdeck**,
   availability line "Open for Shopify CRO consulting".
4. LinkedIn scope: experience entries + media + post, **every write shown and explicitly approved
   first**.
5. Content architecture A, Playwright captures, Apple theme light-first — see below.

## Architecture

### Content model (one source, three languages)

- `src/data/registry.ts` — everything that is **not** translated, written once: experience entries
  (id, company, dates, location, type, website, logo, technologies), Shopify storefronts (slug, name,
  domain, status live|dev, role built|maintained|migrated, year, stack, gallery paths, preview
  theme id for dev), products (Digitdeck Apps, Platform, Audit Dashboard, Feedback, Track), personal
  projects, skills lists, contact links, stats values.
- `src/content/en.ts`, `es.ts`, `ja.ts` — only strings, typed as `PortfolioContent`, keyed by the
  same ids (`experience[id].title/summary/highlights[]`, `stores[slug].tagline/industry`, section
  headings, hero, contact copy, stat labels). Missing keys fail `tsc`.
- `useContent()` hook merges registry + strings for the active locale from `LanguageContext`.
- `public/locales/*.json` stay for UI chrome; new UI strings are added there (nav items, filters,
  badges, lightbox labels).
- `src/data/portfolio.ts` and `portfolio-extended.ts` are deleted once no page imports them.

### Design registry

`src/data/designs.ts` exports the ordered list of experiences: `id`, `route`, i18n keys for name and
subtitle, `accent`, `transitionColor`, `transitionAccent`, `Preview`, `favicon`, `isDefault`.
Consumers: `App.tsx` routes, `Home.tsx` cards, `ExploreDesigns*`, `LogoSelector*`, `MobileMenu*`,
`useDynamicFavicon`. Adding the fourth theme is one entry.

Routes: `/` → Apple (new default) · `/luxury` → Luxury Minimal · `/brutalist` → Brutalist
Editorial · `/menu` → selector · legacy `/1` and `/2` kept, `/1` now points to Luxury.

### Gallery capture pipeline

`scripts/capture-gallery.mjs` (Playwright, devDependency) reads `src/data/gallery-sources.json`:

```json
{ "slug": "nos-cafe", "url": "https://cafesnos.com", "status": "live", "pdp": null,
  "previewThemeId": null, "dismiss": [] }
```

Per store: desktop 1440×900 @1x and mobile 390×844 @2x; routes `home` and `pdp`. PDP discovered via
`/products.json?limit=12` — first product with an image whose handle/title does not match
gift-card patterns — unless `pdp` is set. DEV stores use `url + ?preview_theme_id=<id>&pb=0` on the
canonical domain (never `.myshopify.com`). Before shooting: wait for `networkidle` + fonts, dismiss
popups with a shared selector list (Klaviyo, Shopify Forms, cookie banners, age gates) plus
`Escape`, scroll the page to trigger lazy images, scroll back to top, hide scrollbars, freeze CSS
animations. Output `public/gallery/<slug>/{home,pdp}-{desktop,mobile}.webp` (1200 w / 780 w, q80 via
`sharp`) plus `public/gallery/manifest.json` (capturedAt, sourceUrl, pageTitle, themeId/name read
from `Shopify.theme`, status). Also emits `public/gallery/<slug>/linkedin.webp` (1200×627 composite:
desktop left, mobile right) for LinkedIn media. Anything requiring a login is captured with the
Chrome plugin as fallback and recorded in the manifest with `source: "manual"`.

### Uniform presentation

`src/components/gallery/ProjectFrame.tsx` — CSS-only device frames: desktop browser chrome (three
dots + URL bar, radius 12 px, aspect 16:10) and phone bezel (radius 40 px, aspect 390:844). Images
`loading="lazy" decoding="async"`, desktop crossfades home→PDP on hover, badge Live / In
development, footer: store name, industry, year, role, stack chips. `GalleryLightbox.tsx` shows the
four shots with keyboard navigation. Each theme passes a `skin` prop (border, radius, typography
tokens) so the frame is shared and the look matches the experience.

### Sections (present in Apple, Luxury and Brutalist; the Menu gets the fourth card)

1. Hero — name, positioning, one-line proof, availability, CTAs (contact, download CV).
2. Stats — honest counters from the CV (18+ storefronts, 5 app modules, 2 Shopify Functions,
   91 standards, 800+ tests, 14 brand token systems).
3. Experience — 7 entries, CV order and dates: iBox (Jan–Jul 2022), Orthofix (Sep–Dec 2022),
   Digitdeck FE (Feb 2023–Jan 2024), RH (Feb 2024–Jan 2025), Digitdeck CTO (Jun 2024–present),
   ABI Data (Feb–Oct 2025), Ellamau (Nov 2025–Jan 2026).
4. Shopify Work (new) — tabs *Storefronts* (18 fleet + 5 legacy + 2 name-only) and *Apps &
   Platform* (Digitdeck Apps with its 5 modules and extensions, Platform, Audit Dashboard, Feedback
   portal, Track).
5. Gallery (new) — filters by status (all / live / in development) and type; lightbox.
6. Projects — Kotodama, Peptidos, will-you, fast-resoluciones, autofill-plugin, Pagui, scorrea.dev,
   Dr. Hugo Diazgranados, Maxfolio.
7. Skills — Shopify (Liquid, OS 2.0, metaobjects, Admin/Storefront GraphQL, Functions→WASM, Web
   Pixels, Theme App Extensions, App Proxy, Billing), Frontend, Backend, Testing/CI, CRO, AI tooling.
8. Contact — CRO consulting CTA, availability, email/phone/location, links.
9. Explore — four experiences.

### Apple theme (`src/pages/Apple.tsx`, default)

apple.com marketing language: system font stack (`-apple-system, BlinkMacSystemFont, "SF Pro
Display", "SF Pro Text", Inter, sans-serif`), display headlines 56–96 px with tight tracking, light
by default (`#fbfbfd` bg, `#1d1d1f` text, `#0071e3` accent, `#86868b` muted, `#f5f5f7` surface),
dark mode (`#000` / `#f5f5f7` / `#2997ff`), sticky 44 px frosted nav (`backdrop-blur`, 80 % white),
cards radius 18–28 px with soft shadow, bento grid of feature tiles for Shopify Work, scroll reveals
(opacity + 24 px translate, spring easing), pill buttons, "Learn more ›" links, `prefers-reduced-
motion` respected. Its own `ThemeToggle`, `LanguageSelectorApple`, `MobileMenuApple`,
`LogoSelectorApple`, `ApplePreview`, `ContactFormModal` variant `apple`, favicon
`/favicon-apple.svg`. Backed by the `emil-design-eng` and `ui-ux-pro-max` skills.

### Copy

All new copy runs through `digitdeck-copywriting` in Max's voice: first person, direct, evidence-led,
no hype. EN is the master; ES is written natively (not translated word-for-word); JA reads like a
Japanese tech résumé (tech terms in English/katakana as used in the industry, 敬体 for prose).

### SEO and assets

`index.html` + `SEOHead`: canonical and OG to `https://www.maxfolio.dev`, title "Maximiliano
Bustamante | CTO & Shopify Tech Lead", JSON-LD `jobTitle`, `worksFor: Digitdeck`, `sameAs`
corrected (`github.com/Max-Bustamante69`), `knowsAbout` updated, new OG image (`/og-image.png`
1200×630 generated from the Apple hero), `sitemap.xml` with the four routes, `public/Maximiliano-
Bustamante-CV.pdf` replaced by the current CV.

### LinkedIn (after deploy)

- Experience entries mirror the 7 CV entries with one anatomy: summary line → 3–5 bullets with a
  figure each → "Stack:" line. Titles and dates identical to the portfolio.
- Media: one `linkedin.webp` composite per store attached to the Digitdeck CTO entry (and the legacy
  ones to the Digitdeck FE entry), Digitdeck Apps/Platform composites likewise.
- Post (EN, US DTC/dropshipping audience): hook on a measurable Shopify CRO outcome → what we do
  (audits, A/B testing, AOV mechanics, speed) → proof (store count, app suite) → offer (free CRO
  audit / quotes open) → CTA (DM or maxfolio.dev). 3–5 hashtags. Shown for approval before posting.
- Every profile write and the post are confirmed by Max in chat before saving.

## Testing and verification

- `npm run build` (tsc + vite) green; `npm run lint` green.
- Content type check: all three locales satisfy `PortfolioContent`.
- Capture script run end to end; manifest lists 25 stores with 4 images each (or a documented
  exception); spot-check 3 stores by eye.
- Browser proof per theme × locale × viewport (4 × 3 × 2) via the in-app preview: screenshots of
  hero, Shopify Work, Gallery; keyboard nav on lightbox; reduced-motion.
- Lighthouse on `/` mobile: performance ≥ 85, accessibility ≥ 95 (measured on an idle machine).
- Vercel preview of the PR reviewed by Max before merge.

## Out of scope

Hydrogen/Checkout-extension claims, a blog, a CMS, analytics beyond the existing Vercel Analytics,
redesigning the Luxury/Brutalist/Menu visuals beyond adding the new sections and the fourth card.
