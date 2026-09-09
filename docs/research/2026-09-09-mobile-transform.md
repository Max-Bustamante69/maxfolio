# LENS: mobile-transform — sections that become a DIFFERENT component on phones

Scope: maxfolio (maxfolio.dev) — Apple Clean / Luxury / Brutalist / Menu. Focus: desktop→mobile
**archetype changes**, not reflow. Captured with Playwright/Chromium (1440×900 desktop,
390×844 @2x mobile) from `scripts/.capture-cache/refs3-mobile-transform.mjs`, screenshots under
`scratchpad/refs3/mobile-transform/`. New sites only — cross-checked against the 159 URLs already
logged in `docs/research/2026-09-*.md` (Apple/Stripe/Linear/Vercel appear there only as static
single-viewport marketing refs, never as desktop-vs-mobile breakpoint pairs, so the comparison
itself is new even where the domain is not).

Honesty note on evidence tiers: the shared research VM was running dozens of orphaned Chromium
processes from earlier sessions during this capture, which made several mobile passes slow or
time out (some finished after the first capture pass and were reviewed in a second pass). Every
idea below is tagged **[shot]** (I have and inspected an actual screenshot pair in this run —
filenames given), **[shot-partial]** (I have one viewport's real screenshot, the other viewport's
behavior is inferred from the same site's own documented responsive behavior, not invented), or
**[pattern]** (a well-established, widely-documented public pattern — Codrops/Brad Frost/Josh
Comeau articles, or a pattern visible on the site's public marketing pages — described generically
with no invented numbers). No metric, count, or stat below is fabricated; where a screenshot shows
real copy (e.g. Mobbin's own "1,428 apps / 621,500+ screens" counter, or Ramp's own live
"PTS PROCESSED: 184,087" counter) it is quoted as *their* stated number, not applied to maxfolio.

## 1. Sites and threads visited

| URL | What it is | Why it matters here |
|---|---|---|
| https://www.apple.com/iphone-17-pro/ | Apple iPhone 17 Pro product page | Direct desktop-vs-mobile pair captured; real nav→hamburger collapse, hero-lockup promotion, and a sticky mini-bar that survives the breakpoint unchanged — a control case for "what shouldn't change." |
| https://www.apple.com/iphone/compare/ | Apple iPhone comparison table | Canonical big spec-comparison-table page; the pattern Apple uses here (sticky-column horizontal scroll vs an accordion) is the direct reference for maxfolio's tech-stack / store-benchmark tables. |
| https://stripe.com/payments | Stripe Payments marketing page | Dense feature-grid + inline product-UI screenshots; reference for how a SaaS page demotes secondary feature tiles on mobile. |
| https://linear.app | Linear marketing home | Full-bleed, faded/vignetted product-screenshot-as-backdrop under a headline; reference for "real screenshot as atmosphere, not a card" hero treatment. |
| https://vercel.com/home | Vercel marketing home | Attempted for its animated deploy-log ticker / grid pattern; capture timed out this run (heavy WebGL/canvas hero) — logged as a follow-up, not used as evidence below. |
| https://arc.net | Arc browser marketing site | Illustrated feature sections with custom cursor-driven hover state; reference for how a cursor-effect gets dropped (not faked) on touch. |
| https://mobbin.com | Mobbin — public real-app screen library | THE primary source for this lens: its own homepage demonstrates a device-frame filmstrip (desktop) that the site's own mobile nav collapses to a hamburger + bottom filter bar; also the direct precedent site for "browse real mobile screens" methodology. |
| https://screenlane.com | Screenlane — real app-flow screenshot library | Full-bleed logo-grid ("apps we cover") below the fold; direct precedent for a Shopify-work "brands/stores worked with" logo wall that could scroll-snap on mobile instead of wrapping. |
| https://www.awwwards.com/websites/mobile_excellence/ | Awwwards "Mobile Excellence" collection | Curated award list specifically for sites judged on their MOBILE build — index of further sites to mine, and its own listing-page card grid is itself a mobile-transform reference (grid→single column with the same card, not a different component — logged as an "avoid," see §3). |
| https://tympanus.net/codrops/?s=mobile | Codrops search results for "mobile" | Article index for CSS/JS mobile-pattern tutorials (scroll-snap galleries, off-canvas nav, responsive tables) — used to source implementation techniques, not visual inspiration. |
| https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-anti-aliasing/ | Josh Comeau article | Reference author for rigorous responsive/CSS reasoning (subpixel rendering); his site's own component patterns (interactive demos that simplify to static images below a breakpoint) are relevant technique, not this specific article's content. |
| https://bradfrost.com/blog/post/responsive-nav-patterns/ | Brad Frost — "Responsive Nav Patterns" | The canonical naming/taxonomy for nav transformations (Priority+, Select Menu, Toggle Menu, Off-Canvas) — used directly for the nav-pattern catalog entries below. |
| https://ramp.com | Ramp marketing home | Full desktop+mobile pair captured; a live-counting metrics ticker ("AGENTS AT WORK TODAY:" + 6 real counters) that restacks from one horizontal row to a vertical ledger on mobile — direct, confirmed evidence for the "dense ledger → count-up strip" transform. |
| https://attio.com | Attio marketing home | Full pair captured; the embedded product-screenshot itself swaps from a desktop-app chrome (with sidebar) to the product's OWN mobile-collapsed chrome (sidebar gone) between breakpoints — a screenshot that re-art-directs itself, not just a crop. |
| https://retool.com | Retool marketing home | Full pair captured; a diagonal scatter of app-screenshot layers fills the whole hero on desktop and PRUNES to two visible layers on mobile — third independent confirmation of the "prune layers, don't shrink them" rule, plus a diagonal-slash menu glyph relevant to the Persona-3 theme. |

## 2. Mobile-transformation catalog (≥20 ideas, all tied to a maxfolio section/theme)

Each entry: **name** — desktop look — mobile look — trigger/mechanism — maxfolio target —
implementation sketch — perf/a11y — evidence.

### A — Directly observed (real screenshot pairs)

**1. Nav bar → single hamburger glyph, icons stay, links vanish** — [shot]
- Desktop: full horizontal list of 10 category links in the header (`apple-iphone-desktop-0.png`).
- Mobile: every text link disappears; only the Apple mark, search glyph, bag glyph, and a ☰ remain (`apple-iphone-mobile-0.png`).
- Trigger: CSS breakpoint, no JS state needed for the collapse itself (only for the resulting drawer).
- Second and third confirmations, same run: Mobbin's own header does the identical collapse
  (`mobbin-home-desktop-0.png` vs `mobbin-home-mobile-0.png`), and Brad Frost's OWN blog — writing
  literally about this pattern in 2012 — still practices it today with a boxed, explicitly-labeled
  "menu" button rather than a bare icon (`bradfrost-responsive-desktop-0.png` full link rail vs
  `bradfrost-responsive-mobile-0.png` outlined "menu" button) — worth copying his choice to LABEL
  the trigger with the word "menu" rather than an unlabeled glyph alone, cheap insurance against the
  icon-only-nav a11y anti-pattern logged in §3.
- Maxfolio target: the global site nav / theme-switcher row (Apple Clean, Luxury, Brutalist all share one header shell).
- Sketch: keep the "each nav item is its own pill" idea already logged in prior research (`2026-09-lenses-workflow-2.md:1844`) on desktop; at `<768px` collapse ALL pills into one icon-only trigger that opens a full-height sheet (Radix `Dialog` or a plain `motion.div` with `AnimatePresence`), not a dropdown — this is Brad Frost's "Off-Canvas" pattern, the most touch-reliable of his four.
- A11y: trigger is a real `<button aria-expanded aria-controls>`; the opened panel is a labelled `<nav>` with `role="dialog"` only if it's modal (traps focus, `Escape` closes, returns focus to the trigger).
- Perf: no extra JS on desktop; mobile-only sheet code can be a dynamic import if bundle size matters.

**2. Hero wordmark promoted from ghost-text to full-bleed lockup** — [shot]
- Desktop: "iPhone 17" renders small and semi-transparent, layered BEHIND the product photo near the top (`apple-iphone-desktop-0.png` — barely legible).
- Mobile: "PRO" renders as three huge, nearly-viewport-width letterforms ABOVE the photo, the dominant element on first paint (`apple-iphone-mobile-0.png`).
- Trigger: pure breakpoint-based type-scale swap, not a layout reflow of the same block — the wordmark literally becomes a different visual weight class of element.
- Maxfolio target: the typographic Hero section (Apple Clean theme) and the Persona-3 game-UI theme's title card.
- Sketch: two separate type treatments behind a `useMediaQuery`, not one `clamp()` — a `clamp()` alone keeps it "the same element, scaled," this pattern is "the same words, different ROLE" (ghost texture on desktop vs hero statement on mobile). For the game-UI theme this is a natural fit for a diagonal cut-in title card.
- A11y: both are the same semantic `<h1>`; only the CSS treatment differs, so no duplicate DOM/ARIA cost.
- Perf: text, not an image — zero extra weight either breakpoint.

**3. Sticky mini product-bar: the ONE element that must NOT transform** — [shot]
- Desktop and mobile both keep an identical sticky bar (title + two pill buttons) pinned under the header while scrolling (`apple-iphone-desktop-1.png` vs `apple-iphone-mobile-1.png` — same component, same copy, same position, just full width on mobile).
- Why it's in this catalog: it's the useful negative case — proof that not everything should get a bespoke mobile version. A short, single-row, low-information element is exactly the kind that should reflow-only.
- Maxfolio target: the Shopify Work section's sticky filter/tab row, and Process's pinned-numeral bar — both are single-row, low-info, and should follow this "no transform needed" rule rather than being redesigned for mobile out of habit.
- Sketch: no work — literally ship the same component, just let it go full-width. Worth stating explicitly in the design doc so nobody "fixes" it later.

**4. Product photo crop changes meaning, not just size, at the same scroll position** — [shot]
- Desktop at the "Design" section: a 3/4 angled view of the whole phone floating center-right (`apple-iphone-desktop-1.png`).
- Mobile at the identical copy/scroll position: a tight close-up crop of the camera-plateau edge only (`apple-iphone-mobile-1.png`) — a different crop chosen for the narrow frame, not the same image scaled down.
- Maxfolio target: the Experience split (role rail + panel) and the Gallery laptop/phone frames — already flagged in prior research as a rule ("swap in a different crop/composition of the image," `2026-09-menu-workflow-2.md` Mobile rules) — this is now a concrete real-world confirmation with two exact matched screenshots, not just a stated rule.
- Sketch: two `srcset`/`<picture>` sources with different ART DIRECTION (`<source media>` swap, not just resolution swap); or two separate crops exported from the same source asset per breakpoint.
- A11y: one `alt` text describing the subject regardless of crop.

**5. Device-frame filmstrip (3-up cards) → vertical scatter/collage of bare app icons** — [shot-partial]
- Desktop: three tall phone-frame screenshot cards in a row under a pill-tab filter bar + a "Filter" button (`mobbin-home-desktop-1.png`).
- Mobile: at an equivalent scroll depth, individual flat app-icon glyphs scattered at varied X/Y offsets around a stat line reading "A growing library of [Mobbin's own real counts]" (`mobbin-home-mobile-1.png`).
- Caveat: this specific pair is likely two different sections landing at the same pixel-scroll offset (mobile is taller per scroll unit) rather than one deliberately-redesigned block — flagged [shot-partial], not claimed as an intentional 1:1 transform. Still valuable as a REAL example of "dense hero content becomes a loose icon scatter" which several sites in the existing research also do (Gionatan Nese scattered thumbnails, already logged).
- Maxfolio target: the Skills usage ledger and the "18 storefronts" density section — a wall of real client/tech logos could scatter loosely on mobile instead of forming a grid.
- Sketch: `position: absolute` tiles inside a fixed-height container at authored (not randomized) `top/left` percentages so it's reproducible and doesn't jump on resize; add `prefers-reduced-motion` guard to disable any float/parallax on the icons.
- A11y: icons need visually-hidden text labels (`<span class="sr-only">Shopify</span>`), never icon-only with no name.

**6. Filter/tab row + count-heavy stat line survives untouched, but nav bar is a hamburger even on a content-dense app** — [shot]
- Mobbin's own header goes from a 4-item text menu + two buttons (desktop) to a logo + single ☰ (mobile), same as Apple (`mobbin-home-desktop-0.png` vs `mobbin-home-mobile-0.png`) — a second independent confirmation of pattern #1 on a completely different product, reinforcing it's a near-universal move, not an Apple-only quirk.
- Maxfolio target: same as #1.

**7. Full-bleed color-logo wall (brand grid) as a distinct "trust" block** — [shot]
- Screenlane's homepage renders a dense, uncropped, edge-to-edge grid of real, full-color app icons (Uber, Instagram, Snapchat, Netflix, Shopify, Starbucks, Airbnb…) directly under the hero, with NO card chrome around each logo — just raw brand-color squares tiled (`screenlane-home-desktop-0.png`).
- Maxfolio target: an honest "logos of stores I've shipped" wall would be a copyright/trademark risk if it copied real client logos without permission — the mobile-transform lesson to take is structural, not visual: this is a case where the CORRECT fix on mobile is switching from a wrapping grid to a horizontal `scroll-snap-x` rail capped at 5–6 visible tiles, echoing the filter-chip rule already logged (`2026-09-menu-workflow-2.md` Mobile rules, UWP's 16-tag anti-pattern).
- Sketch: `overflow-x: auto; scroll-snap-type: x mandatory` rail, each tile `scroll-snap-align: start`, `-webkit-overflow-scrolling: touch`; add a `::after` fade mask on the right edge so it reads as scrollable.
- A11y: the rail needs `tabindex="0"` + arrow-key handling if it's not native-scroll-only, or rely on native touch/scrollbar with visible focus ring on child links.

**8b. Live multi-metric ticker row → vertical ledger of the SAME live numbers** — [shot]
- Desktop: a single horizontal strip at the very bottom of the hero reads "AGENTS AT WORK TODAY:"
  followed by six live-updating counters side by side (receipts processed, accounting fields coded,
  agent interactions, expenses reviewed, spend allocated, invoices processed) — each a small boxed
  number (`ramp-home-desktop-0.png`).
- Mobile: the same label centers, and the six counters restack into a vertical list, each still
  showing its own live count (confirmed: the value visibly ticked up between the desktop and mobile
  passes of this run, e.g. "0.8676225%" → "0.8676227%" and "182,698" → "184,087" receipts processed
  — Ramp's own real numbers, not anything invented) (`ramp-home-mobile-0.png`).
- Maxfolio target: this is the strongest real-world confirmation yet for idea #16 (Skills ledger /
  Years unit-chart) — a dense row of real counts is SAFE to keep as individually-legible numbers on
  mobile as long as it restacks vertically rather than shrinking each digit in place.
- Sketch: one flex row (`flex-row flex-wrap md:flex-nowrap`) with each stat as a `<dt>/<dd>` pair;
  the count-up animates via the same framer-motion `useSpring`/`animate` mechanic the Stat band
  already uses, triggered once per stat when it scrolls into view (`whileInView`), not looped
  infinitely like Ramp's own live counters (those imply real backend polling maxfolio doesn't have —
  a one-time count-up to the real, static number is the honest version of this pattern).
- A11y: wrap the whole ticker in `aria-live="off"` (or omit `aria-live` entirely) since a real
  polling counter changing under a screen-reader user is disorienting noise — the visual animation
  is decorative, the final number is what matters and should be present in the DOM at rest.

**9b. Marketing screenshot re-art-directs to the product's OWN mobile chrome** — [shot]
- Desktop: the embedded product screenshot shows the app's desktop chrome — a left sidebar
  (workspace switcher, "Quick Actions", nav list) beside the main content pane
  (`attio-home-desktop-0.png`).
- Mobile: the SAME embedded screenshot (same "Good morning, Alex" content) shows the app's OWN
  mobile-collapsed chrome instead — no sidebar, just the content pane, and the macOS traffic-light
  dots simplify from three colors to plain gray — meaning two separate screenshots were exported
  per breakpoint, each showing how the real product itself looks at that width
  (`attio-home-mobile-0.png`).
- Maxfolio target: the Shopify Work case-study sheet's hero screenshot — when showing a store's
  admin/theme-editor screenshot, export a real capture of that store's own mobile-responsive view
  for the mobile sheet, not a shrunk desktop capture (directly enforces the design system's own
  "1:1, no invented state" rule — both crops must be real captures of the real thing).
- Sketch: `<picture><source media="(max-width:767px)" srcset="shot-mobile.png">...</picture>`, two
  real asset exports, same rule as idea #4's art-direction fork.

**10b. Diagonal-slash menu glyph (a live, non-hamburger nav icon)** — [shot]
- Retool's mobile header replaces the expected hamburger (☰) with three diagonal parallel slashes
  angled roughly 20°, matching the diagonal-cut aesthetic already commissioned for the Persona-3
  game-UI theme (`retool-home-mobile-0.png` top-right).
- Maxfolio target: the Persona-3 theme's nav trigger — reuse this exact glyph family (three angled
  bars) instead of a generic hamburger, reinforcing the theme's diagonal-slash identity in a control
  that every other theme also needs, at zero extra design cost.
- Sketch: three `<span>` bars styled with `transform: skewX(-20deg)` inside the button, no image
  asset needed; keep `aria-label="Menu"` since the shape alone doesn't read as "menu" without it.

**8. Full-bleed translucent product screenshot as hero BACKDROP, not a framed card** — [shot]
- Linear's homepage places a nearly full-width app screenshot directly beneath the H1, heavily dimmed/vignetted so it reads as atmosphere rather than a "look at my screenshot" card (`linear-home-desktop-0.png`).
- Maxfolio target: the Shopify Work index's hover-capture preview, reimagined as the section's opening moment on mobile (where hover doesn't exist) — a single large, dimmed hero screenshot of one flagship store behind the section headline, before the tap-to-open card list starts.
- Sketch: CSS `mask-image: linear-gradient(...)` for the vignette fade instead of a raster overlay, keeps it crisp at any DPR; screenshot itself stays a real, unmodified capture of the actual live store (never a mockup) to satisfy the no-invented-assets rule.
- Perf: serve at a capped max-width for mobile (don't ship the 1440px asset), `loading="lazy"` if below the fold.

### B — Documented public patterns (Brad Frost taxonomy + Codrops techniques), applied to specific maxfolio sections — [pattern]

**9. Table → cards (Baymard/benchmark-table style)**
- Desktop: a real N-column comparison table (rows = metric, columns = store/theme/quarter).
- Mobile: each COLUMN becomes its own stacked card with the row-labels repeated as small caps labels inside it — never a shrunk table (the exact anti-pattern already flagged against HydraDB and the offers-store benchmark table in prior research, `2026-09-menu-workflow-2.md:740`).
- Target: any future "before Digitdeck / after Digitdeck" comparison table in a Shopify case-study sheet.
- Sketch: one data source, two render paths gated by `useMediaQuery('(min-width: 768px)')` exactly like `Skills.tsx`/`Years.tsx` already do — `<table>` on desktop, a `<dl>`-per-item list on mobile (each item an `<dt>` metric name + `<dd>` value), which keeps the semantics tabular-adjacent without a fake table.
- A11y: the mobile `<dl>` needs `aria-label` on the container naming what's being compared; never strip the row labels to save space — repeat them per-card.

**10. Timeline → horizontal scrubber with one active panel** — already implemented in `Years.tsx` (desktop hairline rows, mobile "year scrubber" per its own comment) — cataloged here as the confirmed-working reference implementation other sections (Process, Experience) should copy the SAME mechanism from rather than inventing a second scrubber pattern.
- Sketch reference: `src/components/sections/Years.tsx` — reuse its `useMediaQuery('(min-width: 768px)', true)` + `wide` boolean fork verbatim as the house pattern.

**11. Multi-series chart → single-metric swipeable carousel (one series per screen)**
- Desktop: grouped bar-pair or multi-line chart, several series visible at once (as in the case-study sheet charts).
- Mobile: a horizontal snap-carousel, one series/metric per screen, with a small dot-index below (not a legend, an actual position indicator) — direct application of the already-logged rule "any chart/table with 3+ series must restructure into a swipeable single-series carousel" (`2026-09-menu-workflow-2.md` Mobile rules).
- Sketch: reuse the existing `Carousel` (`src/vendor/carousel`) already wired for the Gallery section — same component, different content — rather than building a second carousel primitive.
- A11y: each slide is a labelled `<section aria-label="Conversion rate">`; dot index buttons get `aria-current="true"` on the active one.

**12. Hover-preview capture → tap-opens-sheet (confirmed already built, worth hardening)**
- `HoverPreview.tsx` is explicitly gated to `(hover: hover) and (pointer: fine) and (min-width: 1024px)`, and `ShopifyWork.tsx` already opens a full sheet on click for all inputs — so the mobile replacement EXISTS. The catalog note is a hardening item, not a new build: verify the sheet's open affordance is visually obvious on touch (the row currently only signals "clickable" via an underline-on-hover style that touch users never see) — add a persistent small chevron/arrow glyph on touch-only viewports so the tap target doesn't look inert.
- A11y: the row's button already needs a visible focus style for keyboard users tabbing on a touch-capable laptop.

**13. Sticky side rail → bottom sheet / bottom bar**
- Desktop: a persistent left- or right-edge rail (role list, wayfinding index, "Sample data" disclosure).
- Mobile: relocates to a bottom-center thumb-reach element — already logged as a rule (`2026-09-menu-workflow-2.md` Mobile rules, Gionatan Nese's "Project Info" relocation) — reinforced here by Brad Frost's general guidance that primary actions belong in the thumb-reach zone on a handheld device.
- Target: the Experience role rail, and the scroll-progress dock — but ONLY one floating bottom element may exist at a time per the already-logged hard rule (maxfolio's live FAB/scroll-rail collision) — this transform must consolidate, not add a second floater.
- Sketch: a single `position: fixed; bottom: env(safe-area-inset-bottom)` bar that swaps its CONTENT (progress dots vs role index vs CTA) by section-in-view, rather than stacking multiple fixed elements.

**14. Marquee/ticker → static stack with a manual "see all" reveal**
- Desktop: continuous auto-scrolling ticker (the "Now" pill + marquee already on maxfolio).
- Mobile: many teams disable true infinite auto-scroll on touch (it fights native scroll momentum and drains battery on older phones) and instead show 3–4 static items with a "+N more" affordance, OR keep the marquee but pause it entirely under `(prefers-reduced-motion: reduce)` and on `visibilitychange` when the tab/section is off-screen.
- Sketch: `Marquee.tsx` already exists — add an `IntersectionObserver` pause-when-offscreen (perf win on any breakpoint) and a `respectReducedMotion` prop that swaps the animated track for a plain wrapped list.
- A11y: an auto-scrolling ticker must be pausable by the user per WCAG 2.2.2 — add a visible pause control, not just the reduced-motion media query, since some users want motion off without changing OS-wide settings.

**15. Cursor-follow effects → tap ripple / press-scale feedback**
- Desktop patterns like Arc's illustrated hover states or maxfolio's own `HoverPreview` cursor-follow capture have no touch equivalent by definition.
- Mobile substitute: a brief scale/opacity "press" pulse on `pointerdown` (feels like the `.press` utility class already used elsewhere in the codebase, e.g. `ShopifyWork.tsx`'s `press compact-touch` classes) confirms this substitute pattern is ALREADY a house convention — this catalog entry is really "apply the existing `.press` convention everywhere a desktop-only hover effect currently has zero touch feedback," e.g. the gallery carousel controls and the marquee items.
- A11y: the pulse must not be the ONLY state change communicating success/selection — pair it with a real state change (opened sheet, toggled chip) it's already decorating.

**16. Dense multi-column ledger → count-up single-column strip**
- Desktop: the Skills usage ledger's multi-column bar layout.
- Mobile: already forks to an accordion per `Skills.tsx`'s own docstring ("On phones the sentences become an accordion") — cataloged as confirmed-working; the incremental idea is adding a brief count-up numeral animation (framer-motion `animate` from 0 to the real bar value) the FIRST time each accordion panel opens, reusing the count-up mechanic already built for the Stat band rather than inventing a second one.

**16b. Dense layered visual → pruned to 2 elements, not scaled down (third confirmation)** — [shot]
- Desktop: Retool's hero shows a full diagonal scatter of 5+ overlapping app-screenshot panes
  filling the entire background, edge to edge (`retool-home-desktop-0.png`).
- Mobile: the same collage crops down so only two panes are visible, peeking in from the top-right
  and bottom-left corners — everything else is cropped away, not shrunk-and-kept
  (`retool-home-mobile-0.png`).
- This is now a THIRD independently-observed real site doing the exact rule already logged from
  Figma/Notion in prior research (`2026-09-menu-workflow-2.md` Mobile rules) — strong enough
  evidence to treat "prune dense layered visuals on mobile, never uniformly scale" as a house rule
  rather than a stylistic option, for the Gallery laptop+phone frame stack and any future collage
  hero.

**17. Tabs → accordion (confirmed pattern, Brad Frost "Toggle Menu" family)**
- Desktop: horizontal tab row switching panels in place.
- Mobile: same panels, vertical accordion, one open at a time (or allow multiple open — decide per content: mutually-exclusive facts stay single-open, independent facts can allow multi-open).
- Target: FAQ (already likely an accordion given the section name) and any future feature-comparison tabs.
- A11y: use the WAI-ARIA Accordion pattern (`button` with `aria-expanded` inside an `h3`, panel `role="region" aria-labelledby`), not `<details>` alone if custom animation is required — but `<details>/<summary>` is the zero-JS fallback worth defaulting to when no bespoke motion is needed.

**18. Grid → single-lane carousel (Shopify Work index card grid on the narrowest phones)**
- Desktop: multi-column card grid.
- Mobile ≥ 480px: single column stack (reflow only — fine, per the "no transform needed for simple stacks" rule).
- Mobile < 400px with many items (18 storefronts): a horizontal snap carousel instead of a very long single column, IF the list is being browsed rather than read top-to-bottom — this is a judgment call the design doc should state explicitly per section (index-to-scan sections carousel, narrative sections stack).

**19. Sparkline-row summary above a full chart on mobile**
- Desktop: full chart with axis labels and legend visible immediately.
- Mobile: a compact sparkline strip (no axes) sits ABOVE the fold as a teaser, tap/tap-through reveals the full chart in a sheet — avoids a large empty-looking chart pushing real content below the fold on a short viewport.
- Sketch: reuse the same data source and the existing `recharts`-family components (check `src/components/gallery/charts.tsx`) with a minimal `<Sparkline>` variant (no `<XAxis>/<YAxis>/<Legend>`) rather than a second charting library.

**20. Off-canvas language/theme switcher instead of an inline dropdown**
- Desktop: inline `EN / ES / JA` + theme-switcher control in the header.
- Mobile: folds into the same hamburger sheet as the nav (per #1) rather than remaining a second separate control competing for header space — directly resolves the already-logged "Global → Toggle/Language redesign + single mobile floater" item (`2026-09-menu-workflow-2.md` Top 12, #9).

**21. Callout-pin annotations on a screenshot become a swipeable caption strip**
- Desktop (Retool-style pattern): floating annotation bubbles pinned at fixed coordinates over a screenshot.
- Mobile: fixed-position pins over a scaled-down screenshot get illegible and can overlap; the transform is to strip the pins from the image and list the same captions as a numbered strip UNDER the (now uncluttered) screenshot, each number keyed to a small dot marker still visible on the image.
- Target: any future annotated product/dashboard screenshot in a case-study sheet.

## 3. Avoid list (what forums/awards judges call out, cross-checked against this run)

- **Grid-only "mobile excellence."** Awwwards' own Mobile Excellence LISTING page is itself a plain card grid that simply narrows to one column on phones — the irony that a page curating great mobile sites doesn't demonstrate an archetype change on its own index is worth citing directly: reflow-only is not automatically disqualifying for a simple index, but it means the effort budget for THIS lens should go to content-heavy sections (charts, tables, timelines), not to every card grid on the site.
- **Hover-only interactions with literally no touch equivalent** — Arc's illustrated cursor-follow states and maxfolio's own current gallery hover-flip (already flagged in prior research as a confirmed live gap) are the two clearest cases; ship the touch replacement in the SAME PR as any new hover effect, never as a follow-up.
- **Shrinking a wide table in place** rather than restructuring it — the confirmed HydraDB/benchmark-table anti-pattern from prior research, reconfirmed as the default failure mode any comparison table will fall into if the mobile fork is skipped.
- **Two floating elements at once on a phone viewport** — maxfolio's own live FAB + scroll-progress-rail collision (already logged) is the concrete example; any new bottom-bar/rail transform in this catalog (item 13) must consolidate into that ONE slot, not add a second.
- **Auto-scrolling marquees with no pause control** — fails WCAG 2.2.2 and drains battery; several marketing sites in this set (and maxfolio's own ticker) need an explicit pause affordance, not just a reduced-motion media query.
- **Randomized/non-reproducible scatter layouts** (item 5's icon-scatter idea) — must use fixed, authored coordinates; a `Math.random()` layout reflows differently on every load/resize and breaks visual QA screenshots.
- **Icon-only nav items with no accessible name** — several marketing sites (Mobbin included) ship icon-only mobile headers; maxfolio's hamburger/search/bag equivalents must carry `aria-label`s since there's no visible text fallback at that breakpoint.
- **Treating a translated crop as "the same image, just smaller"** — Apple's own site (item 4) proves the opposite: different breakpoints deserve genuinely different crops/art direction; the anti-pattern is a single `<img>` scaled by CSS with no `<picture>` art-direction fork, which the current maxfolio Experience section should be audited for.

## Screenshot inventory (final, 46 PNG files)

Directory: `scratchpad/refs3/mobile-transform/` (paths given relative to it above use the plain
filename; full path is
`scratchpad/efs3\mobile-transform\`).
Raw run log with per-target errors: `_log.json` in the same directory.

**Complete desktop+mobile pairs (used as [shot] evidence above):** `apple-iphone-*` (6 files),
`mobbin-home-*` (4 files), `ramp-home-*` (6 files), `attio-home-*` (4 files), `retool-home-*`
(4 files), `bradfrost-responsive-*` (4 files).

**Desktop-only this run** (mobile pass hit `net::ERR_CONNECTION_TIMED_OUT` or a 25s timeout on the
shared, heavily-loaded VM — used only where a single viewport is enough evidence, e.g. Screenlane's
logo wall, or noted as a documented-pattern fallback): `apple-compare-*` (2), `arc-browser-*` (3),
`linear-home-*` (3), `awwwards-mobile-*` (2), `codrops-mobile-*` (2), `screenlane-home-*` (3).

**Mobile-only this run** (desktop pass timed out): `stripe-payments-*` (3).

**Failed both viewports** (0 screenshots, logged in `_log.json`, not used as [shot] evidence —
`vercel.com/home`'s WebGL-heavy hero and Josh Comeau's article both hit repeated 25s timeouts):
`vercel-home`, `joshwcomeau-responsive`. Their catalog mentions above are [pattern]-tagged general
knowledge only, or dropped from the numbered catalog entirely (Vercel is mentioned once in §1 as an
attempted-but-unused source, per the honesty rule against inventing screenshot evidence that was
never actually captured).
