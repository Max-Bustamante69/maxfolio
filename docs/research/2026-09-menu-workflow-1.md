# Menu (workflow 1)

## Archetype sequence
Hero(narrative/inline-chips) → Stats band(stat band) → Now+marquee(marquee/ticker) → Experience+Year-by-year merged(sticky/pinned scroll) → Process(media-first collage · FIG_0x blueprint) → Shopify index(editorial full-bleed · hairline rows) → Case-study sheet(editorial full-bleed · anchor-nav narrative — 2nd consecutive editorial full-bleed, at the house cap) → [optional 1-screen rauno.me-style solid-color manifesto interlude: pull-quote/typographic-moment, zero imagery, palate-cleanser before two image-heavy sections] → Gallery(media-first collage · constellation) → Projects(media-first collage · headline-as-texture — 2nd consecutive media-first-collage, at the house cap) → Skills(narrative/inline-chips — mostly folded into Experience, section itself shrinks to one sentence) → Contact(pull-quote/typographic moment · rotating badge) → Explore(comparison-table-style utility pill switcher). 8 distinct archetypes across 12 beats; longest same-archetype run is exactly 2 (Shopify-index→Case-study, Gallery→Projects) — satisfies design-quality-gate-standard.md G3 (≥4 distinct archetypes, never >2 consecutive) with real headroom.

## Hero
Problem: 6 stat cards under the name/positioning read as a resume widget, not a portfolio — owner's exact 'cards drain professionalism' complaint starts here.

### Inline-prose hero — narrative/sentence-with-inline-chips — effort M — score 9
- layout: Full-bleed media/gradient background, bottom-left ContentColumn inside PageFrame gutter (50px desktop/15px mobile). Stack gaps: gap-lede 10px eyebrow→H1, gap-section 29px H1→positioning paragraph, gap-actions 20px before CTA row. Paragraph ~60ch max-width, 2-3 sentences; every stat becomes an inline <strong> span (underline + accent color) inside the prose — '7 storefronts shipped', '100 Lighthouse', 'AA everywhere' — no boxes anywhere. Bottom→top gradient scrim only over the text zone.
- from: paco.me + jhey.dev (inline-link-as-navigation prose)
- motion: Stack children fadeUp+stagger on mount (house presets.js); inline stat spans count-up in place via a small useMotionValue text swap, gated by useReducedMotion.

### Framed hero card — split 50/50 — effort M — score 7
- layout: Two-column split, 45/55, stacks on mobile. Left: plain wordmark, eyebrow, one-line pitch, single CTA. Right: one rounded 24px-radius framed card (1px --border-subtle) on a softly tinted gradient ground holding one static SVG/device composite. Stats move out of the hero entirely into the dedicated Stats band section below.
- from: lusion.co hero composition (reimplemented CSS/SVG, no WebGL)
- motion: Card drifts a few px on scroll (useScroll+useTransform), frozen under RM; gradient ground very slow CSS animation loop.

### Typographic stat row in-hero — stat band — effort S — score 8
- layout: 4-6 numerals in a single row (clamp(2.5rem,5vw,4.5rem)), 13px uppercase label beneath each, 32px gutters, no vertical rules. Floating testimonial-style snippet (40px avatar + 1-line quote) absolutely positioned top-right of the headline, rotated -2deg.
- from: charle.co.uk/work hero stat row
- motion: Stagger fadeUp per numeral; snippet card slides in from the right, 300ms ease-out.

**Pick:** Inline-prose hero — it is the owner's 'zero AI-slop, editorial' ask executed literally (paco.me/jhey.dev), keeps every sample metric but removes the boxed-widget feel, and reserves the actual stat-band archetype for its own dedicated section next so the two don't compete.

## Stats band
Problem: Formerly the 6 hero stat cards; needs to become its own honest, premium proof moment instead of 6 identical boxes.

### Dark numeral band — stat band — effort M — score 9
- layout: Full-bleed dark band (--surface-inverse). 3-4 numerals, clamp(3rem,6vw,5.5rem), gradient text, 13px uppercase gray label beneath each, separated by 1px hairline vertical rules at 48px gutters. Generative particle/line-wave SVG (looping 2px stroke path, low opacity) sits behind the numeral row, full-bleed within the content cap. Mobile: 2x2 grid, dividers rotate horizontal.
- from: stripe.com home '500M+/10K+/150K+' band
- motion: Count-up 0→final via IntersectionObserver, 900ms ease-out, RM shows final value with zero animation; SVG wave draws in via stroke-dashoffset over 1200ms on mount.

### Typographic stat row — stat band — effort S — score 8
- layout: Plain background, 4-6 numerals + one-line label, zero card chrome, zero icons, zero borders, generous whitespace only.
- from: charle.co.uk/work
- motion: Stagger fadeUp on view, no count-up.

### Trend-line watermark stats — stat band — effort M — score 7
- layout: Faint diagonal ascending SVG line drawn left-to-right across the section as background texture; in front, a vertical list of stats styled [2px colored left-border]+[huge numeral]+[small gray label], no boxes.
- from: attio.com 'Run at any scale'
- motion: SVG line draws in on scroll entry; stats stagger-reveal after the line finishes.

**Pick:** Dark numeral band — most premium, gives a strong visual anchor right after the hero's typography-only section, and the count-up mechanic is already a documented house pattern (digitdeck-cro-patterns D6 stat_bar) so it ships with zero new motion risk.

## Now+marquee
Problem: Currently a static pill + fleet marquee — honest but under-used; owner wants more dynamism without inventing data.

### Vitals strip — marquee/ticker — effort S — score 9
- layout: Pill extends to 3 inline segments: [live local time, Bogotá] · [status word] · [→ latest case study link]. Marquee unchanged in shape, sits full-bleed edge-to-edge directly beneath (opts out of PageFrame gutter), reuses the house Marquee primitive at its existing velocity.
- from: jhey.dev honest 'vitals' list + house Marquee component
- motion: Time segment re-renders every 30s (no animation, just accuracy); marquee ticks continuously (always-on per house spec, RM no longer pauses it); status word crossfades 200ms if it changes.

### Binary-marquee headline — marquee/ticker — effort M — score 6
- layout: Giant condensed headline flanked by binary-code marquee ticker strips above/below.
- from: wodniack.dev
- motion: Continuous marquee, two directions.

### Glitch-accent pill — marquee/ticker — effort S — score 7
- layout: Pill unchanged; marquee unchanged; add a chromatic-aberration RGB-split hover accent on the pill only.
- from: pacomepertant.com
- motion: CSS layered text-shadow RGB channels on :hover only.

**Pick:** Vitals strip — every value is real (matches the honesty constraint), cheap to build, and gives the section a distinct marquee/ticker identity instead of repeating the hero's typographic archetype.

## Experience + Year-by-year (merged)
Problem: Two sections telling the same chronological story twice — tabs+one-card Experience, then a separate carousel of year cards — duplicated information and two weak archetypes (card + carousel) instead of one strong one.

### Checkpoint-dot pinned timeline — sticky/pinned scroll — effort L — score 10
- layout: Two columns ≥md: 380px left rail / ~1.12fr right sticky panel, 64px gap. Left rail: ONE merged chronological spine (years + roles collapsed together) — each row = year (13px mono) + role/company (18px semibold) + 1-line result + 3-4 colored tech-pill row, connected by a 1px vertical line through checkpoint dots (outer ring = section bg; states: pending/dim, complete/accent-filled, current/ring scales 1.4x+glow). Right panel (sticky top:96px) cross-fades a screenshot/diagram per active entry, opacity-only. Mobile: panel dropped, one inline image per row.
- from: house pdp-solution-timeline-standard.md (Sebum→Nalua port)
- motion: Nearest-step-to-reference-line follower at REF_LINE_RATIO=0.42, rAF-throttled (one pending frame), click-lock releases on next real scroll/resize; panel cross-fade 400ms ease-standard.

### Sticky-rail Chiang layout — sticky/pinned scroll — effort L — score 9
- layout: Pinned left column (name/role + animated-underline in-page nav); right column scrolls a real chronological list, each entry with small colored tech pills.
- from: brittanychiang.com
- motion: Animated underline tracks active section on scroll; entries fadeUp-stagger.

### Hairline list-rows (kept separate) — editorial full-bleed — effort M — score 7
- layout: Year-by-year only: huge-type year/headline left, right-aligned category, thin divider between rows, cursor-follow preview thumbnail on hover; Experience stays as tabs+card, unmerged.
- from: dennissnellenberg.com 'RECENT WORK'
- motion: Cursor-follow fixed image tracks mousemove.

**Pick:** Checkpoint-dot pinned timeline — it is a zero-new-library, already-proven house pattern that merges both sections into one (killing the duplication Rule 5 flags), converts the page's weakest pair of archetypes into its strongest (sticky/pinned scroll), and gives the section genuine scroll-driven motion the owner is asking for.

## Process
Problem: 5 generic icon+text step cards — sits right at the STATIC-UNTIL-4 boundary and repeats the card-grid archetype used elsewhere.

### FIG_0x blueprint bento — media-first collage — effort M — score 9
- layout: 5-tile grid on a dotted graph-paper background (16px cell, 1px dot, low-contrast token), 3-col desktop/1-col mobile. Each tile: monospace corner label ('FIG_01'…'FIG_05', 11px letterspaced), centered 48px stroke-only isometric wireframe icon, 16px semibold title, 1-line monospace caption. Zero background/border per tile — separation is 40px whitespace plus the shared dotted ground.
- from: raycast.com developer/extensions bento
- motion: Tiles reveal with 60ms-per-index stagger (capped at 8), fadeUp 12px (house render-only-reveal); icon strokes draw in via stroke-dashoffset on first view.

### Sticky numbered rail — sticky/pinned scroll — effort L — score 7
- layout: Same two-column pinned mechanism as Experience, reused for the 5 process steps.
- from: house pdp-solution-timeline-standard.md (reused)
- motion: Same nearest-step-to-reference-line follower.

### Plain typographic list — editorial full-bleed — effort S — score 7
- layout: 5 steps full-width in large display type, numeral prefix, thin rule beneath each, 1-line description, no icons, no cards.
- from: locomotive.ca 'Featured work' list, adapted
- motion: FadeUp-stagger per row on view.

**Pick:** FIG_0x blueprint bento — distinctly engineer-coded and zero-AI-slop per the brain's own note, opens a fresh archetype (media-first collage) not yet used, and avoids stacking a third sticky/pinned-scroll section directly after Experience+Year-by-year.

## Shopify index
Problem: The single biggest 'too many cards' offender per the owner's complaint — list+chips+card sheet trigger.

### Hairline rows + cursor-follow — editorial full-bleed — effort L — score 9
- layout: Filter chips unchanged above. List rows: CSS grid [store name | category | metric], name in display type clamp(2rem,4vw,3.5rem) left, category/metric right-aligned 13px uppercase mono, 1px hairline border-bottom, 32px vertical row padding. Row click opens the existing case-study sheet unchanged.
- from: dennissnellenberg.com 'RECENT WORK'
- motion: Desktop hover: fixed preview image (240x160px, 8px radius) follows cursor via useSpring (stiffness~300/damping~30), fades+scales in (180ms); row text nudges 4px right; mobile/RM: no follow-image, tap opens sheet directly.

### Locomotive typographic list — editorial full-bleed — effort M — score 9
- layout: Store name full-width in large display type, thin rule below, small live screenshot revealed inline on hover instead of an always-visible thumbnail.
- from: locomotive.ca 'Featured work'
- motion: Hover reveal fade/scale; rule animates in on scroll-stagger.

### Ghost-texture cards — card-grid — effort M — score 5
- layout: Keep card grid, add Wodniack's tiled ghost-wordmark texture behind each card's screenshot.
- from: wodniack.dev 'WORK' section
- motion: Ghost text slow-scrolls behind the screenshot.

**Pick:** Hairline rows + cursor-follow — matches the owner's 'list rows, editorial, no cards' request verbatim, and the cursor-follow preview is the single most direct answer to 'more dynamic animation' in the whole menu; degrades cleanly to a static row+tap on mobile/RM.

## Case-study sheet (charts by store type)
Problem: Every store's sheet repeats the same three metrics as indexed line charts — reads templated, not evidentiary.

### Anchor-nav editorial narrative — editorial full-bleed — effort L — score 9
- layout: Result-bearing H1 ('How the [store] rebuild cut LCP from 7.2s to 1.8s') + brand-color circular badge. Sticky anchor sub-nav (Overview | Approach | Results | Takeaways) with a 2px top-edge gradient progress bar spanning the sheet. Body: H2 sections at ~68ch, 2-3 accent-color pull-quote callouts, the store's own chart pick(s) embedded at Results (never the same trio twice — see charts catalog). Closes with 3 circled-numeral Key Takeaways.
- from: speero.com case-study detail + stripe.com/payments sub-nav
- motion: Progress bar width bound to sheet scroll fraction (CSS transform scaleX); active anchor tab underline slides via layoutId; pull-quotes/takeaways fadeUp on view.

### Illustrated bar-pair + stat band — stat band — effort M — score 8
- layout: One before/after comparative bar-pair (glass/glow CSS bars) as the sheet's centerpiece, plus a 4-up big-numeral band; no narrative prose.
- from: mercury.com '$5M vs $250K industry standard'
- motion: Bars grow-in on view (scaleY/scaleX transform); numerals count up.

### Lightweight hybrid — comparison table — effort M — score 8
- layout: Short Tinuiti-style result-bearing headline + one comparative visual + minimal supporting text, no full essay.
- from: tinuiti.com headlines + mercury.com bar-pair + attio.com trend-line
- motion: Bar/line draws in on view.

**Pick:** Anchor-nav editorial narrative — it is the only option that both diversifies chart types per store (owner's explicit ask) and gives every sheet a distinct editorial ending instead of trailing off on a chart; the sub-nav progress bar also fixes the current one-long-scroll's total lack of wayfinding.

## Gallery
Problem: 3D device composites in a plain carousel — functional but generic, same shape as every other slider on the site.

### CSS constellation — media-first collage — effort L — score 9
- layout: Device-composite tiles (180-260px) absolute-positioned at hand-tuned, deterministic (non-random/SSR-safe) organic coordinates, each rotated -6° to 6°, on a plain ground. Small pill tab-switcher above swaps which store-vertical set is shown. Mobile falls back to a simple 1-up static stack (scattered layouts don't reflow safely narrow).
- from: gionatannese.com
- motion: Tiles fade+scale in on mount with deterministic per-tile stagger; hover-lift (translateY -6px + shadow) desktop-only; pill-tab swap crossfades sets (200ms); RM shows final positions with no entrance animation.

### Carousel with embedded stat footer — carousel/rail — effort S — score 7
- layout: Keep the existing Carousel primitive and edge-bleed rule; add a tiny 2-3 stat footer specific to that store inside each device mockup's own frame instead of a separate stat card.
- from: vercel.com Zapier mockup + house Carousel component
- motion: House velocity-seeded drag-release spring (stiffness:90, damping:26).

### Irregular masonry — media-first collage — effort M — score 8
- layout: Mixed single/double-width tiles, full-bleed photography, caption overlay (client name + service tag) on hover, no card chrome.
- from: eastsideco.com
- motion: Staggered fade/slide-in per tile on scroll.

**Pick:** CSS constellation — freshest, most editorial option in the set, explicitly named as a Lighthouse-safe alternative to a slider, and gives the page a second media-first-collage instance that pairs cleanly (2 consecutive max) with Projects right after it.

## Projects
Problem: 6 plain project cards — generic grid, no personality, competes visually with every other card section on the page.

### Headline-as-texture — media-first collage — effort M — score 9
- layout: Background layer: project/client names tiled at ~90-110px, 6-8% opacity, loose grid rotated -3°, pointer-events:none. Foreground: real clickable list — plain text rows (no card bg/border), project name (28px semibold) + 1-line result + arrow icon, hairline divider, capped to content-max-width.
- from: henry.codes 'SELECTED WORKS'
- motion: Ghost background scrolls slowly via CSS translateX loop (house Marquee velocity, ~8px/s); foreground rows fadeUp-stagger on view; arrow nudges 4px on row hover.

### Full-bleed photo masonry — media-first collage — effort M — score 7
- layout: Uniform-height full-bleed photography, no card borders, tiny caption overlay (icon + name) bottom-left on hover.
- from: charle.co.uk/work
- motion: Hover caption fade-in, subtle image scale.

### Irregular masonry (incremental) — media-first collage — effort S — score 6
- layout: Same 6 items, mixed tile widths instead of a uniform grid — smallest change from current state.
- from: eastsideco.com
- motion: None beyond existing hover states.

**Pick:** Headline-as-texture — turns a plain 6-card grid into a fully designed section with zero new UI chrome, most directly answers 'editorial, varied layouts', and is visually distinct enough from Gallery's constellation that the two consecutive media-first-collage instances don't feel repetitive.

## Skills
Problem: 6 skill cards make claims with no evidence attached — the section the brain audit and the owner both flag first for 'cards drain professionalism'.

### Fold into Experience + narrative remainder — narrative/sentence-with-inline-chips — effort M — score 9
- layout: Standalone 6-card grid removed entirely; each tool becomes a small colored pill attached to the Experience+Year-by-year row where it was actually used (already specified there, max 3-4 pills/row). What remains at the old Skills position: one short paragraph (~50ch) with 2-3 tool names as inline colored chips inside the sentence itself, e.g. '...that means Shopify Liquid [chip] for the storefront, React 19 [chip] for the islands, Playwright [chip] for the QA gate before anything ships.'
- from: brittanychiang.com (evidence-in-context fold) + jhey.dev (inline chips as navigation)
- motion: Chips pop in with a small spring (scale 0.9→1, bounce:0.3, 200ms), staggered 40ms as the sentence enters view.

### Borderless feature grid — card-grid (chrome removed) — effort S — score 7
- layout: 6 items, icon + bold title + 2-line description, zero backgrounds/borders, whitespace-only separation — kept as a fallback if the fold proves too disruptive to the content model.
- from: resend.com 3x3 feature grid
- motion: FadeUp-stagger on scroll.

### Narrative-only (no fold) — narrative/sentence-with-inline-chips — effort S — score 8
- layout: Same one-paragraph inline-chip sentence as the pick, but skills are NOT also duplicated onto Experience rows.
- from: jhey.dev + paco.me
- motion: Same chip pop-in.

**Pick:** Fold into Experience + narrative remainder — directly satisfies Rule 5 ('fold, don't duplicate') and the owner's literal complaint by removing the standalone card grid outright; skills survive as evidence attached to real roles plus one honest sentence, not six unverifiable claims in boxes.

## Contact
Problem: One big contact card — generic, and the owner explicitly wants clearer contact + stronger CTAs, which a single undifferentiated card can't deliver.

### Rotating badge + expect-list + dual CTA — pull-quote/typographic moment — effort M — score 9
- layout: Centered column, max-width 640px. Circular rotating-text CTA badge (140px, SVG textPath, 1px outer ring) above a 2-line headline (clamp(2rem,5vw,3.5rem)). Beneath: 'Here's what happens next' + 4-item numbered list (accent-filled circle numerals, 16px row gap: reply time → assessment → call → written plan). Two CTAs side by side (stack mobile): primary solid pill 'Book a 20-min call', secondary text-link 'Email me instead'.
- from: dennissnellenberg.com (badge) + blendcommerce.com (expect-list) + wemakewebsites.com (dual CTA)
- motion: Badge text rotates via CSS @keyframes (20s linear), pauses on hover/focus and under RM; list items fadeUp-stagger (80ms each); primary CTA scale(1.03) on hover.

### Floating photo collage on black — pull-quote/typographic moment — effort L — score 8
- layout: Full-bleed black background, giant 2-line headline, small unrelated work photos floating asymmetrically around/behind it, centered paragraph + single pill CTA.
- from: charle.co.uk contact/CTA section
- motion: Each photo drifts at a different scroll-linked speed (useScroll+useTransform), frozen under RM.

### Single oversized pull-quote CTA — pull-quote/typographic moment — effort S — score 7
- layout: No card — headline + one honest microcopy line ('free 20-min teardown, no pitch') + generous negative space + single button.
- from: resend.com closing testimonial, adapted to CTA
- motion: FadeUp on view only.

**Pick:** Rotating badge + expect-list + dual CTA — most concretely answers 'clearer contact + stronger CTAs': the numbered list removes the anxiety of what happens after clicking, the dual CTA gives a low-friction path for people not ready to book, and the badge is a distinct memorable shape instead of 'another card'.

## Explore
Problem: Design-switcher cards compete for attention with real portfolio content even though this is a meta/utility control, not a content section.

### Solid-fill active pill switcher — comparison table — effort S — score 8
- layout: Card grid replaced by one horizontal pill row (inline-flex, 4px container padding, 8px/16px per pill), one pill per theme name. Active pill gets a solid-fill background that physically slides between pills rather than each pill re-styling itself.
- from: danielspatzek.com active-pill nav
- motion: Active fill is a single absolutely-positioned element driven by a shared layoutId, spring (stiffness 300/damping 30) on selection change; snaps instantly under RM.

### Thumbnail rail — carousel/rail — effort S — score 6
- layout: Each theme becomes a small thumbnail+label tile in a horizontal scroll-rail instead of a static grid.
- from: generic, adjacent to Gallery's carousel option
- motion: House drag-release spring if made draggable.

### Manifesto panel + pills — pull-quote/typographic moment — effort S — score 7
- layout: One solid-color typographic panel with a short declarative line ('Apple Clean. Or something else. Your call.') sitting above the same pill-switcher row from Option A.
- from: rauno.me manifesto panel + danielspatzek.com pills
- motion: Panel text fadeUp on view; pill fill as in Option A.

**Pick:** Solid-fill active pill switcher — Explore is a utility control, not portfolio content, so it should recede into a lightweight nav-like element rather than compete with the cards-only-where-they-earn-it rule everywhere else; this also removes the site's last lingering plain card-grid instance.

## charts
- {"type": "Illustrated before/after bar-pair (glass/glow CSS bars, not a chart-library chart)", "bestFor": "Bundle/subscription store (AOV before/after a bundle launch) or rebuild-with-reviews store (conversion rate before/after redesign) — exactly one comparative pair, that store's own story.", "from": "mercury.com '$5M Mercury vs $250K industry standard'", "storeExamples": "NOS Café (AOV lift from the 5-bag bundle), TGB (checkout completion before/after the recurring-checkout fix)"}
- {"type": "Indexed line chart (trend over time) — kept, but rationed", "bestFor": "Only stores where a trend genuinely matters over months: catalog-sync retailer (sync latency/freshness) or a migration store (traffic recovery post-migration).", "from": "existing maxfolio pattern, explicitly reserved per research note ('reserve the indexed line chart only for stores where a trend genuinely matters')", "storeExamples": "Millennio (traffic recovery after the fused-branch deploy), TierraMont (post-migration collection freshness)"}
- {"type": "Small-multiples sparkline grid", "bestFor": "Catalog-sync retailer with many SKUs/collections — one mini sparkline per collection instead of one aggregate line.", "from": "research idea, generalized from Attio/Stripe small-metric patterns", "storeExamples": "TGB catalog sync, Atmósfera (primaria-by-blocks rollout across templates)"}
- {"type": "Parallel-column period comparison (aligned colored blocks)", "bestFor": "Framer port stores — same layout/metric compared across pre-port, post-port, and 3-months-later columns.", "from": "calendar.notion.so timezone-comparison tile", "storeExamples": "Peluna landing PDP (1:1 fidelity + performance across periods), Millennio (Framer-to-Liquid port)"}
- {"type": "Diagonal ascending trend-line watermark + left-border-tick stat list", "bestFor": "Rebuild-with-reviews or any 'growth since launch' story where several stats moved together, without a literal line chart.", "from": "attio.com 'Run at any scale'", "storeExamples": "NOS Café (reviews + repeat-purchase growth since the rebuild), Para Machos"}
- {"type": "Labeled dot-strip milestone timeline", "bestFor": "Migration store — dummy-to-real content migration milestones, or any store-transfer engagement timeline.", "from": "research idea, adapted from award-site 'field notes' dot timelines", "storeExamples": "Alma de Aviador V2 (port + promotion milestones), general digitdeck-store-transfer projects"}
- {"type": "Count-up stat_bar with inline methodology caveat", "bestFor": "The opening proof line on every sheet regardless of store type — one honestly-labeled animated number, not a chart.", "from": "house digitdeck-cro-patterns D6 stat_bar pattern", "storeExamples": "Used once per sheet as the header stat (e.g. TGB recurring-checkout volume) before the store-specific comparative chart takes over"}

## copy
- Hero positioning (2nd person, outcome-first): "Your Shopify store gets a Tech Lead's build discipline — reviewed, measured, and rolled back if the number doesn't move, not a freelancer's best guess."
- Hero inline-stat sentence: "You get a build that ships in weeks, holds a 100 on Lighthouse, and survives its first Black Friday without a rollback — because that exact pattern has already shipped across 7 storefronts before yours."
- Stats-band honesty caption (pairs with every sample number, per digitdeck-copywriting's specific-beats-vague rule): "Every number here is dated and sourced on the store it came from — sample metrics say so, right on the number, not in a footnote."
- Contact CTA primary: "Book a 20-minute teardown — I'll name the one change that moves your conversion first, whether or not you hire me."
- Contact CTA secondary (low-commitment path, per We Make Websites' dual-CTA pattern): "Not ready to talk? Read the last case study I shipped instead."
- Contact expect-list intro: "Here's exactly what happens after you click:"
- Contact expect-list items: "1. You hear back within one business day. 2. I skim your store for the one bottleneck worth fixing first. 3. We get on a call — 20 minutes, no deck. 4. You leave with a written plan, whether or not we end up working together."
- Shopify-index row microcopy pattern (Tinuiti-style, result-bearing, per store): "How the NOS Café rebuild closed the repo-vs-live gap in one pass" / "How TGB's bundle checkout stopped losing recurring orders" — every row states the specific outcome, never a generic descriptive title.

## motionSystem
- Every section entrance uses fadeUp + staggerContainer + viewportOnce(amount:0.3) from the house packages/components/Motion/presets.js contract — no ad hoc framer-motion variants per section.
- Count-up numerals (Stats band, case-study headers): IntersectionObserver-gated 0→final over ~900ms; the true final value is always present in the DOM so a JS failure or prefers-reduced-motion fails open to the correct number, never a blank or stuck '0'.
- Carousel/rail drag release (Gallery fallback, any remaining rail): the house velocity-seeded overdamped spring — animate(from,target,{type:'spring',velocity,stiffness:90,damping:26}) — never inertia+modifyTarget or CSS scroll-smooth.
- Sticky/pinned timeline follower (Experience+Year-by-year, optional Process variant): nearest-step-to-reference-line at REF_LINE_RATIO=0.42, rAF-throttled to one pending frame, click-lock mode releasing on the next real scroll/resize — never the rejected start-to-finish scroll-progress formula.
- Case-study sheet scroll-progress: a 2px top-edge bar whose width is bound to the sheet's own scroll fraction via CSS transform:scaleX, pure CSS/JS, no chart library.
- Cursor-follow preview (Shopify index rows): a fixed-position element tracked with useSpring (stiffness~300/damping~30), opacity+scale in on hover; fully replaced by a static inline thumbnail on touch devices and under prefers-reduced-motion.
- Rotating circular CTA badge (Contact): pure CSS @keyframes on an SVG textPath, animation-play-state:paused on :hover/:focus and unconditionally under prefers-reduced-motion.
- Ghost-marquee background text (Projects headline-as-texture, Now+marquee): the house Marquee primitive's velocity-based (px/s) loop, opacity 0.06-0.1, pointer-events:none, static single row under reduced motion.
- Shared-element active-state transitions (Explore pill switcher, case-study anchor-nav tabs): framer-motion layoutId for the sliding fill/underline, springed (stiffness 300/damping 30), snapping instantly under reduced motion instead of animating.
- Four house invariants enforced on every effect above: reduced-motion is a true no-op with content already in its final state; each node fails open (never hidden via CSS-only opacity:0 without a guaranteed JS reveal); re-binds are idempotent; all listeners are MutationObserver/remount-safe.
