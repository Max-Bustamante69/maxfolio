# Maxfolio

Portfolio of Maximiliano Bustamante — CTO & Shopify Tech Lead at Digitdeck. Four design
experiences, one content model, three languages (EN / ES / JA).

Live: **https://www.maxfolio.dev**

## Experiences

| Route | Experience | Notes |
|---|---|---|
| `/` | **Apple Clean** (default) | Light-first, system font stack, frosted nav, bento tiles |
| `/luxury` | Luxury Minimal | Serif display, gold accents, dark mode |
| `/brutalist` | Brutalist Editorial | Magazine spread, red accents, mono labels |
| `/menu` | Design selector | Previews of every experience |

Every experience renders the same sections: hero, stats, experience, **Shopify Work**
(storefronts + apps/platform), **Gallery** (uniform screenshots), projects, skills, contact,
explore. The list of experiences lives in `src/data/designs.ts`; adding one is one entry there.

## Content model

- `src/data/registry.ts` — everything that is not translated: experience entries (dates, links,
  stack, metrics), stores (slug, URL, status, role, stack), products, personal projects, stats,
  skill groups, personal links.
- `src/content/{en,es,ja}.ts` — every string a visitor reads, typed with `PortfolioContent`
  (`src/content/types.ts`) and keyed by the ids in the registry. A missing translation fails
  `tsc`.
- `src/hooks/useContent.ts` — merges registry + strings for the active locale and formats periods
  per locale.
- `public/locales/*.json` — UI chrome only (nav, buttons, menu page).

## Gallery

Screenshots are generated, never hand-made, so every project is captured the same way:

```bash
bun run gallery:capture              # every store in src/data/gallery-sources.json
bun run gallery:capture:one nos-cafe # one store
node scripts/capture-extra.mjs <slug> <url|file:///…> [waitMs]   # non-Shopify surfaces
```

Per store: home + product page (auto-discovered via `/products.json`, in-stock first), desktop
1440×900 @1x and mobile 390×844 @2x, popups dismissed, lazy images triggered, output as WebP
under `public/gallery/<slug>/` plus a 1200×627 `linkedin.webp` composite and `manifest.json`
(capture date, source URL, theme id/name read from `Shopify.theme`). Unpublished builds are
captured through `?preview_theme_id=<id>&pb=0` on the canonical domain.

`src/components/gallery/ProjectFrame.tsx` draws the CSS-only browser + phone frames; each
experience passes a `skin` (`src/components/gallery/skins.ts`).

## Stack

React 19 · Vite 6 · TypeScript · Tailwind CSS 3 · framer-motion · react-router 7 · Playwright +
sharp (captures) · Bun · Vercel (with `vercel.json` SPA rewrite).

## Development

```bash
bun install
bun dev          # http://localhost:5173
bun run build    # tsc -b && vite build
```

Contact form uses Web3Forms: set `VITE_WEB3FORMS_KEY` in `.env`.
