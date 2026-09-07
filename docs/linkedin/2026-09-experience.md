# LinkedIn — profile texts (September 2026)

Source of truth: `src/data/registry.ts` + `src/content/en.ts` (same titles, dates and figures as the
portfolio). Every entry follows one anatomy: **summary line → 3–5 bullets with a figure each →
Stack line**. Applied to the profile on 2026-09-07 after Max's approval: headline, About, 7 entries (4 edited, 3 created), 13 media on the CTO entry, Saint Theory on the 2023-24 entry. LinkedIn had auto-set the headline to the last created position (iBox) — overwritten with the headline below.

## Headline (220 chars max)

CTO & Shopify Tech Lead at Digitdeck · 18+ storefronts, a multi-tenant Shopify app suite, and the
delivery system behind them · Open for Shopify CRO consulting

## About

I build Shopify stores that sell — and the system that ships them.

I lead Shopify engineering at Digitdeck: 18+ client storefronts, a multi-tenant app suite on
Shopify's official Remix stack (A/B testing, reviews, bundles, referrals, back in stock, subscription
billing), Shopify Functions compiled to WASM, and the CI/QA pipeline that catches what a launch would
have broken. I set the standard, review everything that ships, and build the tooling — component
libraries, automated QA, and AI-agent workflows — that lets a two-person team deliver at agency scale.

If your Shopify store gets traffic but not enough orders, I find where it leaks (speed, offers,
checkout friction) and fix it with A/B tests you can read, not guesses. Diagnosis first, then the fix.

Open for Shopify CRO consulting and quotes — US and LATAM brands.

Portfolio with every store, home + product page, desktop + mobile: https://www.maxfolio.dev

---

## 1. CTO & Shopify Technical Lead — Digitdeck

- Employment type: Full-time · Remote (Medellín, Colombia)
- Jun 2024 – Present

I set the engineering standard for a Shopify agency and build the delivery system itself: component
libraries, automated QA, CI/CD, and AI-agent tooling.

- Standardized a hybrid Liquid + React islands architecture with a 33-component shared library and
  design tokens spanning 14 brands, across 18+ storefronts.
- Built a multi-tenant Shopify app suite on the official Remix stack — A/B testing, reviews,
  bundles, referrals, back in stock — plus a subscription billing engine with 800+ automated tests.
- Shipped 2 Shopify Functions compiled to WASM, a consent-gated Web Pixel, and Theme App Extensions.
- Led WooCommerce-to-Shopify and staging-to-production migrations; re-platformed an 11,000-line
  Liquid theme into React islands with verified visual parity.
- Built GitHub Actions pipelines and a Playwright harness that tests whole storefronts behaviorally,
  with 40+ Shopify-specific checks; researched 59 DTC brands into a 70-pattern conversion library.

Stack: Shopify, Liquid, React, Remix, Vite, Tailwind CSS, Prisma, PostgreSQL, BullMQ, Playwright,
GitHub Actions, Claude Code

Media: one 1200×627 composite per live storefront (`public/gallery/<slug>/linkedin.webp`):
The Gummy Box, NOS Café, Perfumería Millennio, Mindfuel, Nalua, Sebum, Valdo Café, Factores 2x2,
Pixxiesx, Luxe Shine, Atmósfera — plus Digitdeck Platform and Digitdeck Apps.

## 2. Lead Shopify Developer — Ellamau

- Employment type: Contract · Remote
- Nov 2025 – Jan 2026

Full Shopify storefront build for a US fashion brand, from planning to deployment.

- Modular Liquid sections with reusable blocks and configurable schemas.
- 15+ responsive templates, mobile first.
- Lighthouse above 90 after optimization.

Stack: Shopify, Liquid, JavaScript, CSS

## 3. Full Stack Developer — ABI Data

- Employment type: Full-time · Medellín, Colombia
- Feb 2025 – Oct 2025

Internal platform to create, customize, and send enterprise newsletters.

- React email editor that cut campaign creation time by about 40%.
- 10,000+ contact records and hundreds of active campaigns for 30+ internal users.
- Owned the REST APIs from design to deployment.

Stack: Django, Next.js, React Email, PostgreSQL, REST

## 4. Frontend Developer — RH

- Employment type: Full-time · Remote
- Feb 2024 – Jan 2025

Enterprise CMS migration from Adobe AEM to Contentful for a large US retailer.

- 25+ reusable components that made the migration possible.
- Accessibility work took Lighthouse from ~70 to 95+.
- Cut content-authoring costs by roughly $45,000 a year.

Stack: React, TypeScript, Contentful, Adobe AEM, Material UI, Radix UI

## 5. Frontend Developer (Shopify) — Digitdeck

- Employment type: Full-time · Remote
- Feb 2023 – Jan 2024

Built and optimized Shopify storefronts with custom Liquid themes.

- Custom sections, blocks, and snippets for 4+ storefronts.
- UX and checkout work lifted conversion 10–20%.
- Pages loaded 30–40% faster; organic traffic up 20%+.

Stack: Shopify, Liquid, JavaScript, CSS, SEO

Media: Saint Theory composite (`public/gallery/saint-theory/linkedin.webp`).

## 6. Salesforce Developer — Orthofix

- Employment type: Full-time · Remote
- Sep 2022 – Dec 2022

Internal healthcare applications for patient and operations workflows.

- Lightning Web Components used by 50+ internal users.
- Workflows over thousands of patient and device records.
- About 20% less manual data entry.

Stack: Salesforce, Lightning Web Components, Apex, SOQL

## 7. Frontend React Developer — iBox SA

- Employment type: Full-time · Medellín, Colombia
- Jan 2022 – Jul 2022

Company website for smart-locker solutions in US and LATAM markets.

- 20+ reusable React components and 10+ responsive pages.
- Lighthouse 90+ and ~35% faster loads.

Stack: React, JavaScript, CSS

## Projects section (applied 2026-09-07, round 3)

34 entries created from `docs/linkedin/2026-09-projects.json` (generator: `scripts/linkedin-projects.mjs`):
23 storefronts (`<Store> — Shopify storefront`, associated with the CTO position when the build started
after Jun 2024, otherwise with the 2023-24 Shopify developer role; DEV builds flagged "currently working
on"), 5 Digitdeck products (`<Product> — Digitdeck`) and 6 personal projects. Each carries the standard
anatomy (summary → description → bullets → Stack → Live/Dev line), up to 3 taxonomy skills, and the
1200×627 composite as media where one exists (22). Driver notes: the add form loads only through
`/in/me/add-edit/PROJECT/?profileFormEntryPoint=PROFILE_SECTION`; the file input rejects webp (JPG copies
in `scripts/.capture-cache/li/`); LinkedIn's CSP blocks `eval`, so the fill/save routines are inlined per
call; the media dialog's Save is the lowest visible "Guardar"; "Remix" resolves to the music skill
"Remixes" in the typeahead (skipped).
