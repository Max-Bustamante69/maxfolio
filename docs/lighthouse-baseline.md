# Lighthouse baseline — default route `/`

Measured with `node scripts/lighthouse-local.mjs --runs 3` (production build served by `vite preview`,
headless Chromium, Lighthouse 13.4 defaults: mobile = simulated 4× CPU slowdown + slow 4G; desktop preset).

| Date | Commit | Mobile (perf / a11y / bp / seo) | Desktop | Notes |
|---|---|---|---|---|
| 2026-09-07 | pre-redesign (round 7) | 95 / 97 / 96 / 100 | 100 / 93 / 96 / 100 | contrast, label-in-name, 6px dot targets, missing source maps, local 404 |
| 2026-09-07 | redesign (Lenis, rail, Years, Process, charts, LazyMotion) | **97 / 100 / 100 / 100** (runs 97, 97, 95) | **100 / 100 / 100 / 100** (3/3) | mobile LCP 2.3 s, TBT 60–130 ms, CLS 0 |
| 2026-09-08 | editorial rounds 9–13 (stat band, split experience, stepper, index lists, FAQ, contact) | 91 / 97 / 100 / 100 | 100 / 97 / 100 / 100 | idle machine; a11y 97 = the 11px "· Sample data" suffix at 60% opacity (4.34:1); main bundle 173.7 KB gz |
| 2026-09-08 | rounds 14–16 (sheet in history, lazy sections + locales, static localized hero shell in index.html) | **95 / 100 / 100 / 100** (runs 83*, 95) | **100 / 100 / 100 / 100** (2/2) | *run 1 coincided with a Chrome automation job; mobile LCP 2.7 s, TBT 60 ms, CLS 0; main chunk 140.7 KB gz |

| 2026-09-09 | `feat/wt-copyseo` (JSON-LD restructure, robots.txt/sitemap fix, hreflang x-default, `will-change` scoping, 6 nav-anchor ids, FAQ/eyebrow copy; content-visibility tried and reverted — see docs/seo.md) | **95 / 100 / 100 / 100** (runs 93, 95, 96) | not run (`--mobile-only`) | mobile LCP 2.4–2.8 s, TBT 40–70 ms, CLS 0 — no regression vs the row above; same non-passing audits (FCP/LCP/TTI budget, unused JS, render-blocking) as before, none new |

The hero now ships as a static shell inside `index.html` (localized by an inline script from the saved `lang`, dark theme applied from `apple-theme`), so the largest paint no longer waits for the bundle; React's first commit replaces the shell. Remaining mobile gap is the render-blocking stylesheet on simulated slow 4G (FCP ≈ 2.1 s): the next lever would be inlining the hero's critical CSS. Main bundle: 172.7 → 160.7 KB gz after `LazyMotion` (features chunk
12.7 KB, async); the case-study sheet is its own chunk (4 KB).
