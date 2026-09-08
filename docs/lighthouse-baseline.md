# Lighthouse baseline — default route `/`

Measured with `node scripts/lighthouse-local.mjs --runs 3` (production build served by `vite preview`,
headless Chromium, Lighthouse 13.4 defaults: mobile = simulated 4× CPU slowdown + slow 4G; desktop preset).

| Date | Commit | Mobile (perf / a11y / bp / seo) | Desktop | Notes |
|---|---|---|---|---|
| 2026-09-07 | pre-redesign (round 7) | 95 / 97 / 96 / 100 | 100 / 93 / 96 / 100 | contrast, label-in-name, 6px dot targets, missing source maps, local 404 |
| 2026-09-07 | redesign (Lenis, rail, Years, Process, charts, LazyMotion) | **97 / 100 / 100 / 100** (runs 97, 97, 95) | **100 / 100 / 100 / 100** (3/3) | mobile LCP 2.3 s, TBT 60–130 ms, CLS 0 |

Remaining mobile gap is first paint being gated on JS (client-rendered SPA): FCP ≈ 1.8 s, LCP ≈ 2.3 s.
The only lever left is prerendering `/` at build time (hydration must survive the runtime-fetched
`/locales/*.json` chrome strings). Main bundle: 172.7 → 160.7 KB gz after `LazyMotion` (features chunk
12.7 KB, async); the case-study sheet is its own chunk (4 KB).
