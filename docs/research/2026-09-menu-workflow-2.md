# Design menu (workflow 2 — 18 lenses, 160 sites)

## Archetype sequence
- hero: pull-quote/typographic-moment (Pinned Identity Line)
- stat-band: stat-band, unfilled hairline ledger
- now/marquee: marquee/ticker
- experience: narrative-with-inline-chips (Era-Grouped List)
- year-by-year: editorial-full-bleed (Raycast Ledger)
- process: sticky/pinned-scroll (Cluma one-step scene)
- shopify-index: card-grid (Grid/List Toggle, real photography)
- case-study-sheet: sticky/pinned-scroll overlay (Real Route + Floating Window)
- gallery: carousel/rail (Tap-to-Flip + Framed Slideshow)
- products/platform: sticky/pinned-scroll (Live Widget Strip variant, data-real card-grid)
- projects: editorial-full-bleed (Hairline Index + Hashtag Tags)
- skills/tech-stack: comparison-table (Fahrenheit Blueprint Ledger)
- contact: split-50/50 (Labeled Bracket-Box + Form), preceded by accordion/FAQ
- footer: pull-quote/typographic-moment (Two-Layer Signature)

## Top 12 (impact ÷ effort)
1. 1. Stat band -> Hairline Ledger (S effort) — kills the rounded-card motif in one cheap pass, real numbers unchanged.
2. 2. Gallery -> Tap-to-Flip + Framed Slideshow (S effort) — fixes a confirmed dead hover-flip interaction on touch.
3. 3. Projects -> Hairline Index + Hashtag Tags (S effort) — zero new card chrome, adds personality cheaply.
4. 4. Now/marquee -> Ticker Over Grain (S effort) — adds real motion without a rebuild.
5. 5. Process -> Cluma One-Step Scene (M effort) — the owner's #1 named complaint, clean 1:1 mobile translation.
6. 6. Skills/tech-stack -> Fahrenheit Blueprint Ledger (M effort) — the owner's #2 named complaint, distinct archetype from Process.
7. 7. Year-by-year -> Raycast Ledger + mobile chip collapse (M effort) — fixes 'same card carousel on both breakpoints.'
8. 8. Contact -> Labeled Bracket-Box + Split Form (M effort) — directly answers 'clearer contact, stronger CTAs.'
9. 9. Global -> Toggle/Language redesign + single mobile floater (M effort) — fixes a confirmed live FAB/scroll-rail collision.
10. 10. Shopify index -> Grid/List Toggle (M effort) — satisfies both 'too much info in cards' and a genuine mobile archetype change.
11. 11. Experience -> Era-Grouped List (M effort) — direct answer to 'new ways to show experience across years.'
12. 12. Footer -> Two-Layer Signature + Utility Row (M effort) — closes the CTA loop, avoids the 'page just stops' failure mode.

## Mobile rules
- Card/carousel sections must become a DIFFERENT archetype on mobile, not just fewer columns — Year-by-year's card carousel becomes a hairline ledger with an inline year-chip (Raycast pattern), because reflow-only mobile is confirmed live today (7 skill cards just stack to ~13480px) and is the owner's core complaint.
- Any chart/table with 3+ series must restructure into a swipeable single-series carousel or a one-metric-per-screen stack on mobile — never shrink in place — because HydraDB's and Baymard's benchmark tables prove a shrunk table becomes unreadable at 390px.
- Dense multi-layer visuals (collages, layered screenshots) get layers PRUNED on mobile (show 2 well-composed elements, not 4 tiny ones) rather than uniformly scaled down — proven by Figma's hero collage and Notion's content reordering.
- Secondary in-page controls (a disclosure toggle, a 'Sample data' note) relocate from a desktop corner to a bottom-center thumb-reach pill on mobile, not just resize in place — proven by Gionatan Nese's 'Project Info' control relocation.
- Only ONE persistent floating element is allowed on the mobile viewport at a time — maxfolio's current build already violates this with an email FAB overlapping the scroll-progress dock; pick CTA or progress rail, never both.
- When a split-50/50 stacks on mobile, swap in a different crop/composition of the image (Nike's tighter portrait) and deliberately choose image-first vs text-first per section intent (Notion defers dense visuals; Kent C. Dodds promotes the illustration first) rather than defaulting to one rule everywhere.
- Filter/tab rows become a horizontal scroll-snap rail on mobile instead of wrapping to multiple stacked lines — UWP's 16-tag filter wrapping to 8 lines is the explicit anti-pattern; cap any store-work filter to 5-6 visible tags on mobile.
- A hover-only interaction (gallery hover-to-flip, chart hover-tooltips) must get an explicit touch replacement (tap-to-flip, tap-to-reveal) on mobile rather than being silently dropped — maxfolio's current gallery hover-flip has no touch equivalent today, a confirmed real gap.

## Chart per store archetype
- **bundle store** → grouped bar-pair (cost/AOV before vs after) · metric: AOV lift from the bundle-box merge engine · why: a bundle-pricing change is fundamentally two summed baskets compared side by side — a bar-pair reads the delta instantly, unlike a line chart. · ref: lifetimely.io
- **Framer port with tracking** → annotated index-100 line with an event-marker callout bubble · metric: conversion rate indexed to 100 at the port launch date, with the launch flagged · why: a port is a single named before/after moment in time; an annotated line lets the launch event carry the story instead of a bare number. · ref: lifetimely.io (annotated line)
- **review-wall rebuild** → radial gauge (single %) · metric: review submission rate or aggregate trust/star-rating score · why: trust is inherently a single fill level — a gauge communicates 'how full' faster than a line or bar for a one-number story. · ref: trylevel2.com
- **catalog-sync retailer** → shared-axis dot-swarm across categories · metric: catalog sync accuracy % per product category · why: many categories need ONE shared scale to compare at a glance instead of 19 separate mini-charts — the dot-swarm turns the whole catalog into one visualization. · ref: baymard.com/ux-benchmark
- **migration** → restrained two-tone comparison table (before Digitdeck / after Digitdeck) · metric: page speed, uptime, and theme file count before vs after the migration · why: a migration is inherently a state-A-vs-state-B story across several named dimensions — a table names every axis that changed, which a single chart can't. · ref: hydradb.com (Without/With cards, subdued not neon)
- **quiz store** → stat-badge + line + data-table combo (funnel view) · metric: quiz completion rate and recommendation-to-purchase conversion · why: a quiz is a multi-step funnel; showing only an end number hides where users drop off, which is the actual optimization story. · ref: warp.dev (fig. 4 pattern)
- **offers/COD store** → stacked comparison bars with a dashed benchmark/target line · metric: COD order completion rate vs a target threshold · why: COD/offers stores are judged against a completion threshold, not an open-ended trend — the dashed line makes the goal explicit next to actual performance. · ref: trylevel2.com (bar + dashed benchmark closing graphic)

## Tech-stack display options
- **Fahrenheit Blueprint Ledger** — desktop: Vertical hairline columns per domain, each with an oversized outline ghost numeral (01-04) as background texture, bold caps category label, and a tight caps list of real tools underneath. · mobile: Full vertical stack of the same blocks in the same order; ghost numerals persist rather than being dropped — a proven graceful fallback. · ref: fahrenheit.ch · shot: process-sections-fahrenheit-desktop-q0.png
- **Prose + Inline Links** — desktop: 2-3 short paragraphs, one per domain (Shopify engineering / Frontend & motion / Data & AI), every tool name an inline bold/underlined word inside a sentence about what it actually shipped. · mobile: Plain reflow only — leerob.com and delba.dev both prove this pattern needs zero mobile-specific redesign. · ref: leerob.com · shot: tech-stack-leerob-desktop-top.png
- **Frequency Tag Cloud** — desktop: A running typographic tag cloud where tool-name font size encodes REAL usage frequency across the 18+ stores (Shopify/Liquid/React huge, one-off tools tiny), muted-gray default, bold-black on hover. · mobile: Same cloud; pill sizes shrink proportionally and wrap into more rows — no restructuring needed. · ref: increment.com · shot: dense-info-editorial-increment-desktop-top.png
- **Boxed Logo Marquee** — desktop: Each tool/logo boxed in its own small dark tile inside a horizontal auto-scrolling marquee — pure CSS transform, no library. · mobile: Same marquee, narrower tiles, pausable on touch (add a visible pause affordance since it auto-scrolls). · ref: produx.design · shot: gallery-media-produx-desktop-top.png

## Experience display options
- **Era-Grouped List** — desktop: Bold plain-text sub-headers per real career era ('Digitdeck CTO era', 'Freelance Shopify era') each followed by a bulleted, one-line-description list — zero cards, zero numerals-as-hero. · mobile: Fully sequential single column; era headers survive as plain typographic dividers, nothing collapses. · ref: swyx.io · shot: experience-timelines-swyx-desktop-full.png
- **Raycast Ledger** — desktop: A slim, unboxed year+role marker on the left paired with a wide editorial column of 2-3 sentences and one screenshot per year, separated only by hairlines. · mobile: The marker collapses into a small inline chip stacked directly above each year's paragraph block — a genuine archetype change from the desktop version. · ref: raycast.com/changelog · shot: experience-timelines-raycast-changelog-desktop-full.png
- **Pinned Mockup Scrub** — desktop: One real dashboard/product screenshot pinned dead-center of the viewport while 4-5 one-line role/impact captions crossfade past it as the visitor scrolls. · mobile: The exact same pinned-mockup-with-scrubbing-captions mechanic is preserved — Elva's own mobile keeps it unsimplified. · ref: elvalabs.ai · shot: scrollytelling-products-elva-desktop-full.png
- **Persistent Roman-Numeral Rail** — desktop: A sticky left-edge index listing every year, with the current year bolding to solid white while others dim as the reader scrolls past — a live wayfinding device baked into the page. · mobile: The rail is replaced (never simply deleted, unlike Shopify Editions' own mobile) with a horizontal progress-dots row so wayfinding survives the breakpoint. · ref: shopify.com/editions/winter2026 · shot: scrollytelling-products-shopify-editions-desktop-top.png

## Hero
Problem: Current hero is a generic centered typographic block with no identity ritual, no proof, and a status line that doesn't exist yet — the owner wants stronger CTAs and copy, and a hero that isn't 'AI template' shaped.

### Pinned Identity Line — pull-quote/typographic-moment — effort M — score 8
- desktop: Three text anchors on one hairline (name flush-left, live-status word + pulsing CSS dot centered, role flush-right) with a short 2-line manifesto beneath, echoing leoparpeix's top identity bar and gionatannese's three-point pin.
- mobile: Drop secondary elements entirely rather than stack them: keep only headline + one CTA; defer the Now-pill/marquee to its own section below (gionatannese's mobile move).
- motion: Staggered opacity/transform fade-in per anchor on load; framer-motion, no WebGL.
- honesty_notes: Status line must name a real, currently-shipping engagement — never a placeholder claim.
- refs: gionatannese.com, leoparpeix.com
- shots: hero-identity-gionatannese-desktop-top.png, hero-identity-leoparpeix-desktop-top.png

### Bio Tab Toggle — narrative-with-inline-chips — effort S — score 7
- desktop: leerob-style split with a Default/Long bio tab switch; store/employer names appear as inline underlined links inside the sentence, not as chips or a logo row.
- mobile: Drop the illustration/visual half entirely, keep pure text stack (leerob's exact mobile move).
- motion: Text crossfade on tab click only.
- honesty_notes: Only cite real stores/employers inline; no invented client names.
- refs: leerob.com
- shots: hero-identity-leerob-desktop-full.png, hero-identity-leerob-mobile-top.png

### Compact Proof Hero — split-50/50 — effort M — score 7.5
- desktop: samuelkraft-style short hero ending after 3-4 lines, one real proof number inline right under the CTA (growth.design pattern) instead of pushed to the stat band.
- mobile: Reorder image-before-text on mobile per Kent C. Dodds' flip test (worth A/B'ing against text-first).
- motion: One cursor-reactive character glitch on a single headline word (Haoqi trick), degrades to nothing on touch.
- honesty_notes: Inline proof number must match the (labeled) stat band, not a separate invented figure.
- refs: samuelkraft.com, growth.design, kentcdodds.com, haoqi.design
- shots: hero-identity-samuelkraft-desktop-top.png, hero-identity-kentcdodds-mobile-top.png

**Recommended:** Pinned Identity Line, shortened to samuelkraft's 3-4 line length — kills the generic-hero-cliché risk and gives mobile a real edit-down instead of a shrink.

## Stat band
Problem: Six numerals sit in rounded gray cards (3x2 grid) — the exact 'card everywhere' primitive the owner is complaining about, and mobile just drops to 2-col, same archetype both ways.

### Hairline Ledger — stat-band — effort S — score 9
- desktop: Flat key/value hairline rows (no fill), Apple/Stripe/Wikipedia-infobox restraint — no rounded background anywhere.
- mobile: Shopify pricing-card 'peek carousel': one stat full width, next one peeking at the edge, swipe to advance.
- motion: framer-motion useSpring count-up with slight overshoot instead of linear easing.
- honesty_notes: Numbers stay real (18+, 5, 2, 91, 800+, 14) — only the container changes.
- refs: apple.com/compare, stripe.com, shopify.com/pricing, wikipedia infobox pattern
- shots: mobile-transforms-shopify-pricing-mobile-top.png, mobile-transforms-shopify-pricing-desktop-top.png

### Vertical Stat Rail — stat-band — effort M — score 7
- desktop: HydraDB-style alternating badge+numeral pairs down a dotted center line, each numeral in its own color block.
- mobile: Already vertical-shaped, survives with no restructuring, just narrower.
- motion: Stagger reveal on scroll, one pair at a time.
- honesty_notes: Color blocks are decorative only — don't let saturation imply a ranking that isn't real.
- refs: hydradb.com
- shots: results-charts-hydradb-desktop-full.png, results-charts-hydradb-mobile-full.png

### Sparkline Numerals — stat-band — effort M — score 7
- desktop: Pair one small index-line sparkline directly above/beside the 6 numerals so they read as a trend (Amplitude pattern).
- mobile: Sparkline shrinks but stays inline with numerals, no restructuring.
- motion: Line draws in on scroll-into-view via stroke-dashoffset.
- honesty_notes: Sparkline must plot a real trend (e.g. stores shipped per year), not decoration.
- refs: amplitude.com
- shots: results-charts-amplitude-desktop-full.png

**Recommended:** Hairline Ledger — lowest effort, kills the card motif outright, and gives mobile a genuinely different mechanic (peek-carousel) instead of a column drop.

## Now/marquee
Problem: The 'Now' pill + fleet marquee is a flat static ticker with little motion or personality — owner wants more dynamic animation, zero AI slop.

### Ticker Over Grain — marquee/ticker — effort S — score 7.5
- desktop: Alternate solid brand-color bars with tiny cropped store-screenshot swatches in a continuous horizontal tick, over a subtle looping CSS grain/noise texture instead of flat white.
- mobile: Identical marquee, narrower tiles, add a visible mute/pause icon (accessibility default) since it never stops.
- motion: CSS transform translateX loop, pausable on hover/touch.
- honesty_notes: Only real, currently-live store names in the tick.
- refs: aralesk.es
- shots: motion-catalog-aralesk-desktop-top.png, motion-catalog-aralesk-mobile-top.png

### Overlapping Client Wordmark — marquee/ticker — effort M — score 8
- desktop: Minh Pham-style giant overlapping store-name typography layered over a slow-rotating CSS/SVG world outline (LATAM/US story).
- mobile: Wordmarks stay oversized/overlapping (needs no mobile redesign per Minh Pham's own site), globe simplifies to a flat arc.
- motion: Slow CSS transform: rotate on the globe only.
- honesty_notes: Store list must match the real current fleet count in the stat band.
- refs: minhpham.design
- shots: awwwards-2026-dev-minh-pham-desktop-seg2.png, awwwards-2026-dev-minh-pham-mobile-seg2.png

### Ambient Drift Collage — media-first-collage — effort M — score 7
- desktop: Store-screenshot tiles drift slowly and repel from the cursor in open whitespace (gionatannese pattern), desktop only.
- mobile: Reduced-amplitude drift, paused via IntersectionObserver off-screen, or a static reflowed collage.
- motion: transform-only keyframe loops, framer-motion animate repeat:Infinity.
- honesty_notes: Tiles must be real screenshots from the store roster, not stock imagery.
- refs: gionatannese.com
- shots: motion-catalog-gionatannese-desktop-top.png

**Recommended:** Ticker Over Grain for the cheapest reliable fix; upgrade to Overlapping Client Wordmark if a second design pass is approved — it better tells the LATAM/US CTO story.

## Experience
Problem: Current split (role rail left / editorial panel right) is a competent split-50/50 but static and doesn't show 'new ways to see experience across years' as the owner explicitly asked.

### Era-Grouped List — narrative-with-inline-chips — effort M — score 8.5
- desktop: swyx-style plain bold sub-headers per career era ('Digitdeck CTO era', 'Freelance Shopify era') each followed by a bulleted, one-line-description list — zero cards, zero numerals-as-hero.
- mobile: Fully sequential single column, era headers survive as plain typographic dividers.
- motion: Staggered opacity/blur-up reveal per era as it enters viewport (Uncommon pattern).
- honesty_notes: Era boundaries and shipped-work bullets must be real, dated facts.
- refs: swyx.io, uncommonstudio.com.au
- shots: experience-timelines-swyx-desktop-full.png, experience-timelines-swyx-mobile-full.png

### Pinned Mockup Scrub — sticky/pinned-scroll — effort L — score 7.5
- desktop: Elva mechanic — one Digitdeck Platform/dashboard screenshot pinned center-screen while 4-5 one-line capability captions crossfade past it.
- mobile: Same pinned-phone-with-scrubbing-captions mechanic is preserved (Elva does not simplify it away).
- motion: framer-motion useScroll + opacity transform crossfade, zero WebGL.
- honesty_notes: Captions must describe real capabilities/roles, not generic feature copy.
- refs: elvalabs.ai
- shots: scrollytelling-products-elva-desktop-full.png, scrollytelling-products-elva-mobile-mid50.png

### Inline Glyph Sentence — narrative-with-inline-chips — effort S — score 7
- desktop: Samuel Kraft's tiny 1-color pictogram inline before each company/store name inside the role sentence, cheaper than a logo wall.
- mobile: Plain reflow, glyph stays inline at any width.
- motion: None required.
- honesty_notes: Glyph shouldn't imply a client logo/endorsement that wasn't given.
- refs: samuelkraft.com
- shots: tech-stack-samuelkraft-desktop-top.png

**Recommended:** Era-Grouped List — cheapest, kills the split-50/50 sameness with the archetypes above/below it, and answers 'new ways to show experience' directly.

## Year by year
Problem: A horizontal card carousel with dot pagination that mobile just narrows to single-card — same archetype on both breakpoints, the exact complaint the owner raised about the site overall.

### Raycast Ledger — editorial-full-bleed — effort M — score 9
- desktop: Unboxed year+role marker on the left, wide editorial column of 2-3 sentences + one screenshot per year, hairline-separated, zero fill.
- mobile: Marker collapses into a small inline chip stacked directly above each year's paragraph block — a genuine archetype change, not a reflow.
- motion: Simple fade/slide per row on scroll.
- honesty_notes: Screenshots per year must be real dated proof, not decorative stock.
- refs: raycast.com/changelog
- shots: experience-timelines-raycast-changelog-desktop-full.png, experience-timelines-raycast-changelog-mobile-top.png

### Chapter Panels — editorial-full-bleed — effort L — score 7.5
- desktop: khanhnguyen.design full-bleed textured panels per era with a giant roman-numeral heading that slides open like a diptych door.
- mobile: Same full-bleed chapter treatment, transition simplified to opacity crossfade (no WebGL doors).
- motion: CSS clip-path/opacity, no shader.
- honesty_notes: Needs real photography per era or it reads as filler texture.
- refs: khanhnguyen.design
- shots: galleries-2026-khanhnguyen-desktop-y6000.png, galleries-2026-khanhnguyen-mobile-top.png

### Persistent Roman-Numeral Rail — sticky/pinned-scroll — effort L — score 8
- desktop: Shopify Editions-style left-edge sticky index of years, bolding the active year as you scroll past it.
- mobile: Rail is replaced (never just deleted) with a horizontal progress-dots row.
- motion: IntersectionObserver-driven opacity interpolation on the index labels.
- honesty_notes: n/a
- refs: shopify.com/editions/winter2026
- shots: scrollytelling-products-shopify-editions-desktop-top.png, scrollytelling-products-shopify-editions-mobile-top.png

**Recommended:** Raycast Ledger — lowest effort of the three genuine-archetype-change options and the most direct fix for 'mobile is currently just narrower cards.'

## Process
Problem: EXPLICIT owner complaint: five equal white rounded cards in a row on desktop; live mobile is already better (vertical rail + progress dot + a 'You get' line desktop drops) but still card-flavored.

### Cluma One-Step Scene — sticky/pinned-scroll — effort M — score 9
- desktop: One giant outlined ghost numeral + short headline + one supporting image/diagram at a time, advanced by scroll-snap or prev/next arrows — never all 5 visible together.
- mobile: 1:1 translation: full-width photo, numeral+3-line headline, same round arrows below — Cluma's own mobile needs no clipping fixes.
- motion: Pinned numeral, crossfade/slide on step change.
- honesty_notes: Bring the live mobile's real 'You get:' outcome line into every step on both breakpoints.
- refs: cluma.design
- shots: process-sections-cluma-desktop-q3.png, process-sections-cluma-mobile-q2.png

### Upgrade Existing Mobile Rail to Desktop — sticky/pinned-scroll — effort S — score 8.5
- desktop: Drop the 5-card row; bring the vertical rail + progress-dot + 'You get' line already live on mobile up to desktop, add a pinned numeral with a moving hairline spine (Linear-style connecting line).
- mobile: Keep current vertical rail, just add the connecting-line motion.
- motion: CSS/JS scroll-position-driven dot fill + line growth.
- honesty_notes: n/a
- refs: linear.app
- shots: scrollytelling-products-linear-desktop-top.png

### Fahrenheit-Style Ledger (alt) — comparison-table — effort M — score 8
- desktop: Vertical hairline columns, oversized ghost numerals as texture, bold caps step name + tight description — if Skills doesn't claim this pattern first.
- mobile: Full vertical stack of the same blocks, numerals persist.
- motion: Scroll-reveal fade per column.
- honesty_notes: n/a
- refs: fahrenheit.ch
- shots: process-sections-fahrenheit-desktop-q0.png

**Recommended:** Cluma One-Step Scene — strongest 'clearer non-card' fix with the cleanest proven mobile 1:1 translation; use Fahrenheit's blueprint ledger for Skills instead so the two sections don't share an archetype.

## Shopify index
Problem: 19-store index + filter chips repeats the same card-ish treatment for every entry and the same 4-chart kit; chips risk wrapping into many lines on mobile.

### Grid/List Toggle — card-grid — effort M — score 9
- desktop: Domaine-style full-bleed real-photo wall (wordmark stamped small, one outcome sentence, zero card borders), 3-col.
- mobile: Persistent grid/list icon toggle defaults mobile to a plain numbered TEXT LIST (store name + one-line feature + chevron, zero images) — Léo Parpeix's proven pattern.
- motion: Instant state swap with fade; grid stays reachable on desktop for power users.
- honesty_notes: Outcome sentences must vary per store, never the same repeated metric.
- refs: domaineworldwide.com, leoparpeix.com
- shots: gallery-media-domaine-desktop-top.png, awwwards-2026-dev-leo-parpeix-mobile-seg2.png

### Sticky Name Over Live Site — sticky/pinned-scroll — effort L — score 7.5
- desktop: Ryan Ritzenthaler pinned info-card + rotating metric chips while the real store screenshot scrolls edge-to-edge behind it.
- mobile: Reflows to a stacked single column of the same cards — a straightforward reflow, not a full archetype change.
- motion: CSS position:sticky, opacity/translate reveal on chips.
- honesty_notes: Chips must show genuinely different metrics per store, never the same 2-3 repeated.
- refs: ryanritzenthaler.com
- shots: awwwards-2026-dev-ryan-ritzenthaler-desktop-seg1.png

### Taxonomy Table + Editorial Interstitials — comparison-table — effort S — score 7
- desktop: Replace filter chips with a full-width taxonomy table (category + bracketed count) at the foot of the index; break every 5-6 store cards with one full-bleed editorial photo band.
- mobile: Table stacks to one column; interstitial band stays full-bleed.
- motion: None required.
- honesty_notes: n/a
- refs: jackentee.com, underwaterpistol.com
- shots: gallery-media-uwp-desktop-full.png

**Recommended:** Grid/List Toggle — directly satisfies both 'too much info in cards' and 'sections that completely change on mobile' at moderate effort.

## Case-study sheet (desktop + mobile)
Problem: The sheet likely has no real URL, shows an identical 4-chart kit for all 19 stores, and mobile mechanics for a sheet like this commonly get stubbed out or left as a shrunk desktop modal — a real usability risk for a mobile-first audience.

### Real Route + Floating Window — sticky/pinned-scroll (overlay) — effort L — score 9.5
- desktop: Real client-side route (/work/:slug), a centered floating 'window' card (Aristide Benoist chrome: traffic-light dots, mini nav) over a dimmed index, small × top-center returning to the index, a vertical prev/next thumbnail rail, and a one-tap Copy-link/Share button (Linear pattern).
- mobile: The SAME route becomes a genuine full-screen bottom sheet (100dvh, safe-area padding, spring slide-up, swipe-down-to-dismiss via framer-motion drag), close control ≥44px pinned top-left, a full-width prev/next pager, correct iOS scroll-lock — never a 'visit on desktop' stub.
- motion: CSS clip-path/opacity/scale route transition, no WebGL shader wipe.
- honesty_notes: 'Sample data' disclosure relocates to a bottom-center thumb-reach pill on mobile (Gionatan Nese pattern) — never shrunk to unreadable caption text.
- refs: aristidebenoist.com, linear.app/changelog, killerportfolio.com
- shots: gap-case-study-sheet-modal-mobile-mechanics-aristide-desktop-opened.png, gap-case-study-sheet-modal-mobile-mechanics-linear-mobile-opened.png

### Eyebrow + Big Headline Lead — editorial-full-bleed — effort M — score 7.5
- desktop: Cuberto-style eyebrow label + oversized outcome headline before any screenshot/chart, plus a Ryan Ritzenthaler-style inline tech-stack chip row under the description instead of a specs table.
- mobile: Straight reflow, single column, headline-first order preserved.
- motion: None required beyond standard fade-in.
- honesty_notes: Headline outcome number must be labeled Sample data where synthetic.
- refs: cuberto.com, ryanritzenthaler.com
- shots: gap-case-study-sheet-modal-mobile-mechanics-cuberto-desktop-opened.png

### Tabbed Spotlight Above Index — split-50/50 — effort M — score 7
- desktop: Fuel Made-style dark band with 5-6 store-logo tabs; selecting one swaps a labeled Before/After device pair + a 2x2 real-metric stat grid.
- mobile: Tab strip stays horizontally scrollable; Before/After stacks vertically.
- motion: Panel content swap on tab click, no page transition.
- honesty_notes: Only the 5-6 strongest, verifiable stores get a spotlight slot.
- refs: fuelmade.com
- shots: gallery-media-fuelmade-desktop-full.png, gallery-media-fuelmade-mobile-full.png

**Recommended:** Real Route + Floating Window as the mechanic, with Eyebrow + Big Headline Lead as the content pattern inside it — this is the section most likely hiding a real regression (URL-less modal, stubbed mobile) if not audited directly.

## Gallery
Problem: 3D-tilt hover-to-flip carousel has a confirmed dead interaction on touch (hover doesn't exist), and the treatment reads as generic 'AI portfolio' carousel chrome.

### Tap-to-Flip + Framed Slideshow — carousel/rail — effort S — score 8.5
- desktop: Keep the laptop+phone composite rail but swap hover-flip for tap-to-flip; add a live scroll-progress % counter (Vero pattern) to signal a paced sequence.
- mobile: Replace the carousel entirely with angelaricciardi.com's framed slideshow: one large 'framed' image + Prev/Next text controls + a numeric counter ('001 of 19') + a mini filmstrip beneath — a genuine archetype change.
- motion: Tap-triggered flip transform; scroll-driven % counter via useScroll.
- honesty_notes: Directly fixes a confirmed real bug (silently dead hover-flip on touch).
- refs: angelaricciardi.com, verostudio.com
- shots: galleries-2026-angelaricciardi-mobile-top.png, gallery-media-vero-desktop-thumbgrid.png

### Edge-to-Edge Photo Feed — media-first-collage — effort S — score 8
- desktop: Diff-style tight, gapless grid of pure product/lifestyle photography, no captions on the image itself, no device frames.
- mobile: Single-column full-bleed feed, zero chrome lost since there was never a card border.
- motion: Optional fade-in per tile on scroll.
- honesty_notes: n/a
- refs: diff.agency
- shots: gallery-media-diff-desktop-grid.png, gallery-media-diff-mobile-full.png

### Moodboard Alt View — media-first-collage — effort M — score 7.5
- desktop: Gionatannese-style scattered organic-angle composites on a plain canvas with numbered Board 1/2/3 tabs, offered alongside the main carousel.
- mobile: Prune to 2 well-composed tiles per board rather than shrinking all (Figma's mobile technique).
- motion: framer-motion stagger scatter on load.
- honesty_notes: n/a
- refs: gionatannese.com, figma.com
- shots: galleries-2026-gionatannese-desktop-top.png

**Recommended:** Tap-to-Flip + Framed Slideshow — cheapest fix, addresses a confirmed touch-interaction bug, and gives mobile a genuinely different mechanic than desktop.

## Products/Platform
Problem: No strong pattern currently showcases the Digitdeck app suite / Platform as a product — risk of defaulting to another feature-card grid if left unaddressed.

### Live Widget Strip — card-grid (data-real) — effort M — score 8.5
- desktop: Framer-style 3-widget grid: one real animated line chart with hover tooltip, colored Core-Web-Vitals-style progress bars, and a small restrained comparison table — for Platform metrics like Lighthouse 100, module count, uptime.
- mobile: 3-col collapses to single-column stacked stat list, each widget kept intact (not summarized away).
- motion: Real SVG/CSS widgets (not chart screenshots), animated on scroll-into-view.
- honesty_notes: Every widget number must be independently verifiable (Lighthouse 100 is checkable live).
- refs: framer.com
- shots: scrollytelling-products-framer-desktop-mid25.png, scrollytelling-products-framer-mobile-mid25.png

### Pinned Phone + Scrubbing Captions — sticky/pinned-scroll — effort L — score 8
- desktop: One dashboard/app screenshot pinned center while 4-5 capability captions crossfade past it (Elva mechanic).
- mobile: Same pinned mechanic preserved (Elva's own mobile keeps it).
- motion: useScroll + opacity transform crossfade.
- honesty_notes: n/a
- refs: elvalabs.ai
- shots: scrollytelling-products-elva-desktop-full.png

### Colored Chapter Panels — card-grid (full-bleed color) — effort M — score 7.5
- desktop: Clay.com-style full-bleed rounded color panels, one per module (Brain/Financial/CRM/etc.), small custom vignette illustration + pill label per panel.
- mobile: Stacks full-width, panel keeps its rounded/margin treatment even at 390px (Clay's own choice).
- motion: None required, hover/pill micro-interactions only.
- honesty_notes: Illustrations must be custom, not generic 3D icon-pack stock (explicit avoid across the sweep).
- refs: clay.com
- shots: scrollytelling-products-clay-desktop-top.png, scrollytelling-products-clay-mobile-top.png

**Recommended:** Live Widget Strip — most honest and CRO/perf-credible option, all real verifiable data, Lighthouse-safe.

## Projects
Problem: Currently a plain numbered index list — not complained about directly, but flat and at risk of feeling like an afterthought next to the redesigned sections around it.

### Hairline Index + Hashtag Tags — editorial-full-bleed — effort S — score 8
- desktop: jackentee.com-style plain-text title rows over 1-3 full-bleed photos of mixed aspect ratios, zero card chrome, with Cassidy-Williams-style monospace hashtag tags underneath each project.
- mobile: Same list stacks; tags wrap to two lines, nothing hidden.
- motion: None required.
- honesty_notes: Tags must reflect real tech used per project.
- refs: jackentee.com, cassidoo.co
- shots: galleries-2026-jackmcentee-desktop-top.png, tech-stack-cassidoo-desktop-full.png

### Era-Grouped Outline — narrative-with-inline-chips — effort S — score 7.5
- desktop: swyx-style bold year-range headers, each followed by a plain bullet index of shipped projects.
- mobile: Fully sequential, headers as plain dividers.
- motion: None required.
- honesty_notes: n/a
- refs: swyx.io
- shots: experience-timelines-swyx-desktop-full.png

### Scattered Corkboard Teaser — media-first-collage — effort M — score 7
- desktop: Gionatan Nese-style small tiles at fixed percentage positions with a subtle parallax float.
- mobile: Linearize into a simple stack below ~430px (explicit mobile-safety rule from the sweep).
- motion: framer-motion stagger-in on scroll.
- honesty_notes: n/a
- refs: gionatannese.com
- shots: awwwards-2026-dev-gionatan-nese-mobile-full.png

**Recommended:** Hairline Index + Hashtag Tags — cheapest, adds zero new card chrome, and gives the list a searchable/retrieval feel that ties into Skills' tag language.

## Skills / tech stack
Problem: EXPLICIT owner complaint and confirmed live drift: currently a 3-col card grid of 7 white boxes with bare bullet lists (not the 'six prose sentences' the spec described), and mobile just stacks all 7 full-width, contributing ~13480px of page height.

### Fahrenheit Blueprint Ledger — comparison-table — effort M — score 9
- desktop: Vertical hairline columns (SHOPIFY / FRONTEND / DATA-BACKEND / TOOLING-QA), each with an oversized outline ghost numeral (01-04) as background texture, bold caps category, tight caps sub-list of real tools.
- mobile: Full vertical stack of the same blocks in the same order, ghost numerals persist — a proven graceful fallback, not a naive shrink.
- motion: Scroll-reveal fade per column.
- honesty_notes: Tool lists must be real and current, not aspirational.
- refs: fahrenheit.ch
- shots: process-sections-fahrenheit-desktop-q0.png, process-sections-fahrenheit-mobile-q4.png

### Prose + Inline Links — narrative-with-inline-chips — effort S — score 8
- desktop: leerob/delba-style 2-3 short paragraphs, one per domain (Shopify engineering / Frontend & motion / Data & AI), every tool name inline bold/underlined inside a sentence about what it shipped.
- mobile: Reflow only — leerob/delba prove this genuinely needs zero mobile redesign.
- motion: None required.
- honesty_notes: n/a
- refs: leerob.com, delba.dev
- shots: tech-stack-leerob-desktop-top.png, tech-stack-delba-desktop-full.png

### Frequency Tag Cloud — narrative-with-inline-chips — effort S — score 7.5
- desktop: Increment-style tag cloud sized by REAL usage frequency across the 18+ stores (Shopify/Liquid/React huge, one-off tools tiny), muted-gray default, bold-black on hover.
- mobile: Pill sizes shrink proportionally, wraps into more rows — same element, needs no redesign.
- motion: None required.
- honesty_notes: Sizing MUST map to an actual counted frequency across real stores, never eyeballed.
- refs: increment.com
- shots: dense-info-editorial-increment-desktop-top.png

**Recommended:** Fahrenheit Blueprint Ledger — the strongest direct answer to 'other ways to display the tech stack,' kills the card grid entirely, and reads as a distinct archetype (comparison-table) from Process's own recommendation.

## Contact
Problem: One big rounded card containing the giant headline, CTA and email/phone/location row — owner wants clearer contact and stronger CTAs/copy.

### Labeled Bracket-Box Contact + Split Form — split-50/50 — effort M — score 9
- desktop: Humbleteam-style true split: left = giant headline + real photo + social + a scoped 'Ask AI about me' link; right = a real inline form (single-field 'send your store URL' primary, Cal.com embed fallback). Replace the hairline info row with jonas.do-style labeled bracket-boxes (EMAIL / CALL / LINKEDIN / BOOK-A-CALL).
- mobile: Form card renders FIRST (Humbleteam's mobile reorder), then headline/photo, then bracket-boxes stacked full-width.
- motion: Diagonal clip-path skew transition into the section; a reassurance line under every CTA button (HEY pattern).
- honesty_notes: Response-time promise must be a commitment Max can actually keep (e.g. 24h/1 business day), never a vague 'soon'.
- refs: humbleteam.com, jonas.do, hey.com
- shots: contact-cta-humbleteam-desktop-top.png, contact-cta-humbleteam-mobile-bottom.png, gap-footer-design-patterns-jonasdo-desktop-footer-viewport.png

### Typographic CTA + Two-Word Frame — pull-quote/typographic-moment — effort S — score 7.5
- desktop: Podium-style oversized static line + an underlined 'WORK WITH US' link acting as the button itself, flanked by two short reframing captions ('NOT A SALES CALL.' / 'JUST 20 MINUTES.').
- mobile: Same stack narrower; a single sticky CTA bar appears once the section scrolls into view.
- motion: None required beyond entrance fade.
- honesty_notes: n/a
- refs: podium.global
- shots: contact-cta-podium-desktop-bottom.png

### FAQ Then Ask — accordion/FAQ — effort S — score 7.5
- desktop: Significa-style objection-handling FAQ accordion immediately before Contact ('What if my store already converts fine?'), paired with the 'Ask AI about me' trust link.
- mobile: Single-column accordion, same order.
- motion: Standard expand/collapse chevron transition.
- honesty_notes: n/a
- refs: significa.co
- shots: contact-cta-significa-desktop-precta.png

**Recommended:** Labeled Bracket-Box Contact + Split Form as the primary section, with FAQ Then Ask placed directly above it — the pair also supplies the design gate's missing accordion/FAQ archetype for free.

## Footer
Problem: No distinctly designed footer confirmed on maxfolio; risk of either 'running out' with no closing signal (leerob failure mode) or becoming a second card grid.

### Two-Layer Signature + Utility Row — pull-quote/typographic-moment — effort M — score 8.5
- desktop: Pensatori Irrazionali-style overlapping bold 'MAX BUSTAMANTE' + a lighter descriptor word as the transition into the footer, then a small 3-column utility block (Menu / labeled contact bracket-boxes / Back-to-top) and a tiny legal row.
- mobile: Same two-layer signature scaled down, utility stacks to one column.
- motion: Diagonal skew transition edge into the footer (jonas.do).
- honesty_notes: Never let the page simply stop after Contact — always land on a deliberate footer band.
- refs: pensatori-irrazionali.com, jonas.do
- shots: gap-footer-design-patterns-pensatori-desktop-footer-viewport.png, gap-footer-design-patterns-jonasdo-desktop-footer-viewport.png

### Full-Bleed Color Band + Custom Glyphs — editorial-full-bleed — effort M — score 7.5
- desktop: Mosby's Files-style saturated color-block footer with 4-6 custom line-drawn glyphs (cart, Liquid braces, a Lighthouse-100 badge) replacing generic social icons, plus a ruler-graphic + credit line.
- mobile: Fewer icons, tighter stacking, same color field survives.
- motion: None required.
- honesty_notes: n/a
- refs: mosbyfiles.com
- shots: gap-footer-design-patterns-mosbyfiles-desktop-footer-viewport.png

### Minimal Honest Line — narrative-with-inline-chips — effort S — score 7
- desktop: swyx.io/delba.dev-style minimal text-link row + one honest build-stamp line ('Rebuilt Sept 2026 · React 19 + Vite, Lighthouse 100') — no icons, no legal sprawl.
- mobile: Identical reflow, zero redesign needed.
- motion: None required.
- honesty_notes: The build-stamp fact must be true and current, never invented.
- refs: swyx.io, delba.dev
- shots: gap-footer-design-patterns-swyx-desktop-footer-viewport.png

**Recommended:** Two-Layer Signature + Utility Row — closes the CTA loop with a deliberate ending and avoids both the 'page just stops' and 'more cards' failure modes.

## Global (nav, scroll rail, dark mode, language)
Problem: Confirmed live bug: the floating email FAB and the right-edge scroll-progress pill overlap on mobile; dark-mode toggle contrast/motion is unverified as best-practice; the EN|ES|JA switcher's active state is faint and disappears once scrolled past the hero.

### Redesigned Toggle + Fixed Language Pill + Single Mobile Floater — global chrome — effort M — score 9
- desktop: Dark-mode toggle gets a real SVG mask morph (Josh Comeau sun-to-crescent) and a text label state ('dark'/'light'); language control gets bolder active-segment contrast plus a subtle browser-language pre-highlight hint (Booking's 'suggested for you' idea, scaled to one hint, not a whole row).
- mobile: Pick ONE persistent floating element only, never both CTA-FAB and scroll-rail; the language segmented control docks as a small fixed pill once scrolled past the hero (Notion pattern) instead of only living in the header.
- motion: 200-400ms eased CSS custom-property transition on theme tokens; active-segment slide transform on language switch.
- honesty_notes: No flags for EN/ES/JA (Spanish spans 20+ countries); add an honesty tooltip near JA if it is machine-assisted.
- refs: joshwcomeau.com, notion.com, booking.com, antfu.me
- shots: gap-dark-mode-and-theme-toggle-joshwcomeau-desktop-toggle-zoom.png, gap-language-switcher-ux-notion-desktop-switcher-open.png, gap-language-switcher-ux-maxfolio-mobile-top.png

### Wrap, Don't Collapse Nav — global chrome — effort S — score 6.5
- desktop: Full icon row visible inline.
- mobile: Row wraps to a second line under the logo, no hamburger at all.
- motion: None required.
- honesty_notes: Only viable if maxfolio's nav stays short — risks clutter if the nav grows.
- refs: antfu.me
- shots: gap-dark-mode-and-theme-toggle-antfu-mobile-after.png

### Bespoke Theme-Aware Illustration Accent — global chrome — effort M — score 7.5
- desktop: Wire ONE bespoke graphic's fill/stroke tokens (stat-band hairline glow or marquee background) to the theme state so switching modes visibly re-paints real art, not just background/text.
- mobile: Same token wiring, no extra work needed.
- motion: Synced with the main 200-400ms theme transition.
- honesty_notes: n/a
- refs: joshwcomeau.com
- shots: gap-dark-mode-and-theme-toggle-joshwcomeau-desktop-mid.png

**Recommended:** Redesigned Toggle + Fixed Language Pill + Single Mobile Floater — fixes a confirmed live bug (FAB/rail collision) and brings the toggle/language controls to best practice at moderate effort.

## Copy
{
 "en": {
  "hero_eyebrow": "CTO & Shopify Tech Lead · Digitdeck",
  "hero_identity_pill": "Store-side, not agency-side.",
  "hero_headline": "Your Shopify store has traffic. I find where it stops turning into orders.",
  "hero_lead": "18+ live storefronts, a 5-module app suite, 2 checkout-level Shopify Functions, 800+ automated tests behind every launch. You get engineering measured against your numbers — not agency guesswork.",
  "statband_lead": "Eighteen months of shipping, counted honestly — not rounded up.",
  "process_lead_pair": {
   "part1_label": "The bottleneck.",
   "part1": "Speed, offers, or checkout friction — most stores leak revenue in one of three places, and most agencies guess which.",
   "part2_label": "The fix.",
   "part2": "Five checkpoints, same order every time, so you know what happens next and what you get at the end."
  },
  "shopify_index_lead": "Open any store below and you're one click from its real checkout — not a mockup. 18+ storefronts, bundles priced by Shopify Functions, product quizzes, review walls, dual-currency catalogs, migrations from Framer and WooCommerce.",
  "gallery_lead": "Your customers decide on their phone. Every store here is built for that screen first — tap any card to see the product page that has to close the sale, not just the home page that earns the click.",
  "contact_headline": "Your store gets traffic. Let's turn more of it into orders.",
  "contact_promise": "Diagnosis first, then the fix. US and LATAM brands — you hear back within one business day.",
  "cta_pairs": [
   {
    "button": "Get your free 20-minute store review",
    "reassurance": "No pitch, no contract — just where you're leaking revenue."
   },
   {
    "button": "See the 18 stores I've shipped",
    "reassurance": "Real checkouts, real screenshots. Sample metrics are always labeled."
   },
   {
    "button": "Download the CV",
    "reassurance": "Same facts as this page, one PDF, nothing added."
   }
  ]
 },
 "es": {
  "hero_eyebrow": "CTO y Líder Técnico Shopify · Digitdeck",
  "hero_identity_pill": "Del lado de la tienda, no de la agencia.",
  "hero_headline": "Tu tienda Shopify tiene tráfico. Yo encuentro dónde deja de convertirse en pedidos.",
  "hero_lead": "18+ tiendas en vivo, una suite de 5 módulos, 2 Shopify Functions a nivel de checkout, 800+ pruebas automatizadas detrás de cada lanzamiento. Ingeniería medida contra tus números, no adivinada por una agencia.",
  "statband_lead": "Dieciocho meses de trabajo entregado, contados con honestidad — sin redondear para arriba.",
  "process_lead_pair": {
   "part1_label": "El cuello de botella.",
   "part1": "Velocidad, ofertas o fricción en el checkout — casi toda tienda pierde ingresos en uno de estos tres puntos, y casi toda agencia adivina cuál.",
   "part2_label": "La solución.",
   "part2": "Cinco pasos, siempre en el mismo orden, para que sepas qué sigue y qué obtienes al final."
  },
  "shopify_index_lead": "Abre cualquier tienda de abajo y estás a un clic de su checkout real — no de una simulación. 18+ tiendas, combos con precio calculado por Shopify Functions, quizzes de producto, muros de reseñas, catálogos en varias monedas, migraciones desde Framer y WooCommerce.",
  "gallery_lead": "Tus clientes deciden desde el celular. Cada tienda aquí está pensada primero para esa pantalla — toca cualquier tarjeta para ver la página de producto que tiene que cerrar la venta, no solo el home que gana el clic.",
  "contact_headline": "Tu tienda ya tiene tráfico. Convirtamos más de ese tráfico en pedidos.",
  "contact_promise": "Primero el diagnóstico, después la solución. Marcas de EE. UU. y Latinoamérica — te respondo dentro de un día hábil, sin compromiso.",
  "cta_pairs": [
   {
    "button": "Pide tu revisión gratis de 20 minutos",
    "reassurance": "Sin propuesta comercial, sin contrato — solo dónde estás perdiendo ingresos."
   },
   {
    "button": "Mira las 18 tiendas que he construido",
    "reassurance": "Checkouts reales, capturas reales. Las métricas de muestra siempre están marcadas."
   },
   {
    "button": "Descarga la hoja de vida",
    "reassurance": "Los mismos datos de esta página, en un PDF, sin nada de más."
   }
  ]
 },
 "ja": {
  "hero_eyebrow": "CTO件Shopifyテックリード・Digitdeck",
  "hero_identity_pill": "代理店側ではなく、ストア側の視点で。",
  "hero_headline": "アクセスはあるのに、注文につながらない。その原因を突き止めます。",
  "hero_lead": "稼働中のShopifyストア18店舗以上、5モジュールのアプリスイート、決済に関わるShopify Functionsを2件、リリースのたびに800件以上の自動テストを実施。勘に頼らず、御社の数字で測るエンジニアリングをご提供します。",
  "statband_lead": "この18ヶ月間の実績を、誇張せずそのまま数字でお見せします。",
  "process_lead_pair": {
   "part1_label": "ボトルネック",
   "part1": "表示速度、オファー設計、決済時の離脱——売上が漏れる原因はたいていこの3つのどこかにあります。多くの代理店はそこを推測で済ませています。",
   "part2_label": "解決の手順",
   "part2": "毎回同じ順序の5ステップで進めます。次に何が起きるか、最終的に何が手に入るかが、最初から分かります。"
  },
  "shopify_index_lead": "下のどのストアを開いても、モックアップではなく実際のチェックアウトまで一クリックです。18店舗以上、Shopify Functionsで価格計算するバンドル、商品診断クイズ、レビューウォール、複数通貨対応カタログ、FramerやWooCommerceからの移行実績。",
  "gallery_lead": "お客様はスマートフォンで購入を決めます。ここに並ぶストアはすべてそのスマートフォン画面を最優先に設計しました。カードをタップすると、集客するホームページだけでなく、実際に購入を決める商品ページもご覧いただけます。",
  "contact_headline": "アクセスはすでにある。それをもっと注文に変えましょう。",
  "contact_promise": "まず診断、それから改善。米国・中南米のブランドに対応し、1営業日以内にご返信します。",
  "cta_pairs": [
   {
    "button": "無料20分ストア診断を申し込む",
    "reassurance": "営業トークも契約も不要です。売上が漏れている箇所だけをお伝えします。"
   },
   {
    "button": "手がけた18店舗を見る",
    "reassurance": "実際のチェックアウトと画面キャプチャです。サンプルデータには必ず明記しています。"
   },
   {
    "button": "職務経歴書をダウンロード",
    "reassurance": "このページと同じ内容を1つのPDFにまとめただけです。"
   }
  ]
 }
}