# LENS: parallax-scroll — scroll-driven effects that stay tasteful

Context: maxfolio.dev (React 19 + Vite + Tailwind 3 + framer-motion via LazyMotion, Lenis smooth
scroll, EN/ES/JA, 4 route-themes: Apple Clean default / luxury / brutalist / menu). Goal: catalog
concrete, implementable scroll-driven motion ideas — NOT WebGL/shader spectacle — that add restraint
plus polish to sections that already exist (hero, stat band, marquee, experience split, years unit
chart, process stepper, Shopify index + case-study sheet, gallery carousel, manifesto band, projects
index, skills ledger, FAQ, contact). Cross-checked against the four prior research digests in
`docs/research/` to avoid repeating sites (Speero, Blend Commerce, Charle, Eastside Co, Locomotive,
Tinuiti, We Make Websites, Obys, rauno.me, paco.me, wodniack.dev, dennissnellenberg.com, henry.codes,
brittanychiang.com, jhey.dev, lusion.co, danielspatzek.com, gionatannese.com, pacomepertant.com,
juliencalot.com, Stripe home/payments, Linear, Vercel, Attio, Resend, Raycast, Arc, Mercury, Notion
Calendar, PostHog, leerob.com, delba.dev, cassidoo.co, swyx.io, samuelkraft.com, joshwcomeau.com,
ERA Residence, Illoca, Aardvark Book Club, Uncommon Studio, Aralesk, Ramp, Superhuman, Basecamp, HEY,
Baymard, Plausible, Fathom, Lifetimely, Amplitude, Northbeam, HydraDB, State of AI Design, Level2,
Apple iPhone/MacBook Pro/Compare pages already visited generically — this pass uses AirPods Pro 3 and
Vision Pro specifically, which were not — Warp.dev, Shopify Editions, Elva, Cursor, Clay, Framer.com,
Are.na, Basecamp Shape Up, Increment, Mosby's Files, mesh3d.gallery).

## 1. Sites/threads visited this pass

| URL | What it is | Why it matters |
|---|---|---|
| https://tympanus.net/codrops/tag/scroll-effects/ | Codrops tag feed for scroll-tagged tutorials/playground demos | Current (Sep 2026) demo feed; mostly WebGL/Three.js spectacle pieces (3D face mask, "infinite loom" thread weave, ASCII renderer, datamosh, Eiffel Tower catapult) — useful as a **calibration point for what NOT to copy** (too heavy, too gimmicky for a hire-me portfolio), but the vocabulary of "unraveling," "weaving," "morphing on scroll" can be toned down into CSS-only equivalents |
| https://tympanus.net/codrops/2024/01/16/an-introduction-to-css-scroll-driven-animations/ | Codrops CSS scroll-driven-animations intro (article redirected to the tag feed live, so no unique content this pass) | Confirms Codrops treats `animation-timeline` as current canon; content superseded by the dedicated site below |
| https://developer.chrome.com/docs/css-ui/scroll-driven-animations | Chrome DevRel canonical docs for the CSS Scroll-driven Animations spec | Names the exact API surface: **Scroll Progress Timeline** (`animation-timeline: scroll()`) vs **View Progress Timeline** (`animation-timeline: view()`), both driven off the *compositor thread* (no scroll-jank, no JS `scroll` listener). This is the fallback/CSS-only tier for every idea below |
| https://scroll-driven-animations.style/ | Bramus Van Damme's dedicated demo hub for the CSS spec | Confirms browser support status + links to a live demo gallery |
| https://scroll-driven-animations.style/demos/ | Demo gallery — every demo ships a **CSS-only version AND a JS/GSAP version** side by side | Direct catalog of production-ready CSS-only patterns: stacking cards, horizontal-scroll section ("with CSS view-timeline"), 3D shoe explorer (rotate-on-scroll), list entries that translate+fade in/out of the scroller, an "flick through album covers" carousel, and an image carousel that slides fully across the viewport as it enters/exits — **this is the most directly reusable source in the whole pass** |
| https://lenis.darkroom.engineering/ | Official Lenis (darkroom.engineering) marketing/showcase site | Since maxfolio already runs Lenis, this is the "eat your own dog food" reference: dark starfield background, oversized display headline with a vertical accent rule, a glowing particle-trail illustration hand-drawn in a warm accent color — restrained dark theme, not WebGL-heavy |
| https://gsap.com/showcase/ | Official GSAP showcase reel page | Center-focus 3D carousel (peeking side panels, prev/next circular arrow buttons) sitting directly above a **horizontal marquee ticker on a solid lime-green band** ("SUBMIT YOUR SITE TO THE SHOWCASE" repeating) — a clean two-tone motion module worth lifting for the Now/marquee section |
| https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | Official ScrollTrigger plugin docs | Confirms the exact JS-tier params to reach for when CSS `animation-timeline` isn't expressive enough: `pin`, `scrub` (boolean or a smoothing duration in seconds), `start`/`end` keyword strings (e.g. `"top top"`), `snap` |
| https://motion.dev/docs/react-use-scroll | Motion (framer-motion) `useScroll`/`useTransform` docs | maxfolio already imports framer-motion via LazyMotion — this is the exact hook pair to keep using: `useScroll({ target, offset })` → a `MotionValue` → `useTransform(value, [0,1], [from,to])` piped into a `style` prop, no re-render per scroll tick |
| https://examples.motion.dev/react/scroll-progress | Motion.dev official React example: scroll-progress bar | Reference implementation for a top-of-viewport progress bar driven by `useScroll` with no target (whole-page progress) |
| https://examples.motion.dev (category filter) | Motion.dev's filterable example library (204 React examples, a "MotionScore" quality rating S/A/B/C/D/F per example) | Confirms a dedicated "Parallax" example category exists alongside "Skeleton Shimmer" and "Confetti" — validates parallax as a first-class, well-trodden Motion pattern, not a hack |
| https://www.awwwards.com/websites/parallax/ | Awwwards sites tagged "parallax" | General award-site sourcing page; mostly business/agency sites with cookie banners and card-grid site listings — used to sanity-check the trend is current, not for deep visual capture this pass |
| https://www.apple.com/airpods-pro/ | Apple AirPods Pro 3 product page | Four reusable pinned-scroll patterns confirmed live: (a) circular photo card with an animated **chromatic-aberration ring** that thickens/refracts as you approach the pinned moment, paired with a horizontal dot-pagination pill; (b) a **sticky feature-accordion** — a vertical list of pill-shaped labels on the left lights up sequentially while a 3D product render rotates/scrubs in sync on the right, purely from scroll position; (c) a full-bleed **audio-waveform halo** (concentric rainbow-fringed rings) that draws in sync with a two-line headline reveal, with an explicit play/pause control bottom-right confirming it's a scrubbed video/canvas, not a GIF | 
| https://www.apple.com/apple-vision-pro/ | Apple Vision Pro product page | A "Take a closer look" heading sits directly above a **horizontal card rail** (multiple squarish preview tiles bleeding off the right edge) that previews the sections below — a low-cost, high-clarity scroll-affordance pattern |
| https://stripe.com/sessions | Stripe Sessions conference page | A card carousel (talk thumbnails, prev/next circular arrows, dotted-grid background) — competent but conventional; included as a negative-ish control: proves that even Stripe doesn't need exotic effects to look premium |

## 2. Idea catalog (≥20)

Each idea: name → what it looks like → target section/theme → implementation sketch → perf/a11y →
screenshot.

### A. Pinned / scrubbed / progress-driven

1. **Sticky feature-accordion scrub** (from AirPods Pro)
   Looks like: a two-column pinned section — left column is a vertical stack of pill labels; as the
   user scrolls through the pinned range, each pill activates in turn (bold + filled) while the right
   column's image/illustration crossfades or rotates to match.
   Section: Experience split (role rail + panel) — replace/augment the current hover-driven panel with
   a **scroll-driven** version on desktop so the panel changes as you scroll instead of only on hover.
   Sketch: `position: sticky; top: 0; height: 100vh` on the section wrapper, inner content scrolls
   inside a taller (e.g. `300vh`) container; drive active-index with `useScroll({ target: sectionRef })`
   → `useTransform(scrollYProgress, [0, .33, .66, 1], [0,1,2,3])` rounded to an int for the active
   pill; CSS-only fallback via `animation-timeline: view()` toggling `opacity`/`font-weight` per pill
   with staggered `animation-range`.
   Perf: sticky + compositor-only transforms (`opacity`/`transform`), no layout thrash; a11y: keep DOM
   order matching visual order, use `aria-current` on the active pill, respect `prefers-reduced-motion`
   by disabling the scrub and just deep-linking to the last pill's state.
   Screenshot: `apple-airpods-pro-vp-1-1440.png`.

2. **Chromatic-aberration reveal ring** (from AirPods Pro)
   Looks like: a circular framed hero image/portrait with a thin multicolor (red/cyan/yellow) fringe
   ring around its edge that intensifies then resolves to clean color as the section centers in the
   viewport, synced to a horizontal dot-pager.
   Section: Gallery carousel (laptop+phone frames) — use as the *transition* between slides instead of
   a plain crossfade; or a one-off moment in the typographic hero.
   Sketch: two stacked `<img>`/`<canvas>` copies offset by 1–3px with `mix-blend-mode: screen` and
   `filter: blur()` scaled by `scrollYProgress` (framer `useTransform` → `filter: blur(${v}px)`), or a
   single SVG `feColorMatrix`/`feOffset` filter whose offset is bound to scroll.
   Perf: SVG filters are GPU-cheap at this scale but test on Safari (filter perf can dip); cap the
   effect to a single per-slide transition rather than continuous scroll to avoid always-on filter
   cost; a11y: purely decorative, `aria-hidden`, never carries meaning.
   Screenshot: `apple-airpods-pro-vp-0-1440.png`.

3. **Waveform-halo headline reveal with scrub-pause control** (from AirPods Pro)
   Looks like: concentric rainbow-fringed rings "draw" outward (like an audio waveform) in lockstep
   with a two-line headline that reveals word-by-word; a small pause button bottom-right signals the
   sequence is a scrubbed clip, giving the user control.
   Section: typographic hero (a one-time "signature moment" on first load, OR retriggerable on
   Contact) — could double as an animated version of the site's own wordmark/monogram.
   Sketch: pre-render as a short WebM/APNG or Lottie and scrub its `currentTime` via
   `useScroll`+`useTransform` mapped to `video.currentTime` (native `<video>` scrubbing is
   compositor-cheap and works today without waiting on `animation-timeline` video support); add a
   real pause/replay control for reduced-motion users, matching Apple's own affordance.
   Perf: pre-encode short (\<2s) muted video at small dimensions; avoid canvas-per-frame JS drawing;
   a11y: expose the pause control to keyboard, respect `prefers-reduced-motion` by defaulting to
   paused/static end-frame.
   Screenshot: `apple-airpods-pro-vp-2-1440.png`.

4. **Horizontal card-rail scroll affordance under a heading** (from Vision Pro)
   Looks like: a bold "Take a closer look." heading sits directly above a peeking horizontal rail of
   square preview tiles that bleed off the right edge, hinting more content without an explicit arrow.
   Section: Shopify Work index / Projects index — a compact "browse more" rail above or below the main
   list, especially useful on mobile where the full grid doesn't fit.
   Sketch: `overflow-x: auto` flex row with `scroll-snap-type: x mandatory`, first/last child padding
   equal to the page gutter so the bleed reads intentional; optionally sync a hairline progress bar
   underneath via `scrollLeft`/`scrollWidth` (no library needed).
   Perf: native scroll-snap is free (browser-implemented); a11y: it's a real scroll container so
   keyboard arrow-key scrolling and screen-reader landmark navigation work by default — just add
   `role="region" aria-label`.
   Screenshot: `apple-vision-pro-vp-1-1440.png`.

5. **CSS-only 3D "explorer" rotate-on-scroll** (from scroll-driven-animations.style demos)
   Looks like: a single product/object image (their demo: a shoe) rotates continuously and smoothly as
   you scroll past its pinned range — no JS.
   Section: a Shopify case-study sheet hero shot (rotate a hero product photo or phone mockup) or the
   Skills usage ledger (rotate an icon/badge).
   Sketch: pure CSS — `@keyframes spin { to { transform: rotate(360deg); } }` +
   `animation-timeline: view(); animation-range: entry 0% cover 100%;` on the element; JS fallback with
   GSAP `ScrollTrigger` (`scrub: true`) for browsers without `animation-timeline` (currently
   Chrome/Edge only — Safari/Firefox need the JS/Motion fallback).
   Perf: zero JS on supporting browsers, runs off main thread; a11y: `prefers-reduced-motion` should
   freeze at a static frame via a media-query override on `animation-play-state`.
   Screenshot: `scroll-driven-style-demos-vp-2-1440.png`.

6. **Stacking cards (CSS `position: sticky` overlap)** (from scroll-driven-animations.style demos)
   Looks like: a deck of cards where each new card slides up and "stacks" on top of the previous one,
   which stays pinned peeking out from behind — pure scroll, no snapping required.
   Section: Years (unit chart) editorial rows, or the case-study sheet's chart cards — years/case
   studies as tactile stacked cards rather than a flat list.
   Sketch: each card `position: sticky; top: <index * 24px>` inside a normal-flow parent; z-index
   increasing per card so later cards sit on top; add a subtle `scale()`/`opacity` dip on the
   previous card driven by `animation-timeline: scroll()` for depth.
   Perf: sticky-based, compositor-friendly, no scroll listeners; a11y: order in DOM = reading order,
   works fine with a screen reader since it's just normal document flow visually offset.
   Screenshot: `scroll-driven-style-demos-vp-2-1440.png`.

7. **Horizontal-scroll section built from vertical scroll (`view-timeline`)** (same source)
   Looks like: a "Horizontal scroll section" label with the sub-line "With CSS view-timeline" — content
   slides left-to-right as the *page* scrolls down, without hijacking the scroll wheel.
   Section: Process stepper (self-drawing line) — steps could translate horizontally across a fixed
   band while the page scrolls vertically, echoing a filmstrip.
   Sketch: pin the band with `position: sticky`, and inside it, translateX an inner track bound to
   `animation-timeline: scroll()` (`animation-range` covering the sticky duration) or, for the
   already-used tool, `useScroll` + `useTransform(scrollYProgress, [0,1], ["0%","-70%"])`.
   Perf: transform-only, compositor thread; a11y: this pattern famously breaks find-in-page and
   keyboard tabbing if not careful — keep all steps as normal tab-order DOM elements, never remove
   them from flow with `visibility: hidden` mid-track.
   Screenshot: `scroll-driven-style-demos-vp-2-1440.png`.

8. **List entries that translate + fade in/out of the scroller** (same source)
   Looks like: rows entering a list container from a slight vertical/horizontal offset with a fade,
   and correspondingly fading+sliding out as they leave — driven purely by each row's own position in
   the viewport (`view()` timeline), not a shared parent scrub.
   Section: Skills usage ledger rows, FAQ list, or Shopify index rows — a cheap, tasteful reveal that
   doesn't need `IntersectionObserver`.
   Sketch: `@keyframes reveal { from { opacity: 0; transform: translateY(12px); } to { opacity:1;
   transform: none; } } .row { animation: reveal linear; animation-timeline: view();
   animation-range: entry 0% entry 40%; }` — each row is independently driven, no JS needed at all;
   Motion fallback: `whileInView` + `viewport={{ once: true, margin: "-10%" }}`.
   Perf: this is the cheapest idea in the whole list — genuinely zero JS, zero listeners; a11y: keep
   `animation-range` short (entry-only) so content isn't hidden for long scroll distances, and always
   guard with `@media (prefers-reduced-motion: reduce) { animation: none; }`.
   Screenshot: `scroll-driven-style-demos-vp-2-1440.png`.

9. **Scroll-progress bar (whole-page or per-section)** (from motion.dev example + Chrome docs' "View
   Progress Timeline")
   Looks like: a hairline bar pinned to the top (or bottom) of the viewport that fills 0→100% as the
   user scrolls the page or a specific long section (e.g. the case-study sheet).
   Section: case-study sheet (long-form) and/or Years unit chart — orient the reader in a long
   scroll.
   Sketch: `const { scrollYProgress } = useScroll()` (no target = whole page) →
   `<motion.div style={{ scaleX: scrollYProgress }} className="origin-left" />`; CSS-only alternative:
   `@keyframes grow { to { transform: scaleX(1); } } html::before { animation: grow linear;
   animation-timeline: scroll(); }` via a pseudo-element bar.
   Perf: single compositor-only transform, negligible cost; a11y: purely decorative — do not rely on
   it as the only progress indicator for assistive tech; pair with a text "Section 3 of 6" for real
   wayfinding if the case-study sheet is long.
   Screenshot: n/a (documented pattern, `chrome-scroll-driven-docs-vp-0-1440.png` names the API).

### B. Parallax / depth / layered motion

10. **Multi-layer depth parallax in the hero** (general parallax pattern, confirmed current via Motion's
    dedicated "Parallax" example category)
    Looks like: 2–3 image/type layers move at different scroll speeds (background slowest, subject
    mid, foreground text fastest) to fake depth without 3D.
    Section: typographic hero — move the hairline grid background slower than the headline type.
    Sketch: one `useScroll` at the section level, two `useTransform` outputs mapped to different
    ranges (e.g. background `[0,300]→[0,60]`, headline `[0,300]→[0,-40]`); keep magnitudes small
    (≤80px) to stay "tasteful" per the brief.
    Perf: 2–3 `transform: translateY()` layers is trivial; a11y: disable entirely under
    `prefers-reduced-motion`, since parallax is a common vestibular-disorder trigger.
    Screenshot: n/a (pattern-level; validated as current via `framer-motion-scroll-examples-vp-0-1440.png`
    showing a dedicated "Parallax" tile in Motion's example library).

11. **Section-background color/tone shift on scroll** (pattern named in the task brief, validated by the
    Apple/Stripe "different bands, different tone" convention seen across both captures)
    Looks like: the page background subtly shifts hue/lightness as you cross section boundaries — e.g.
    off-white → deep charcoal for the Manifesto inverted band — via a smooth transition rather than a
    hard cut.
    Section: transition into/out of the Manifesto inverted band.
    Sketch: bind `document.documentElement.style.setProperty('--bg', interpolatedColor)` from a
    `useScroll` + `useTransform(scrollYProgress, [0,1], ["#fafafa","#111111"])` (framer motion can
    interpolate color strings directly); CSS-only rough equivalent: animate a custom property with
    `@property` + `animation-timeline: view()`.
    Perf: setting a CSS custom property per frame is cheap if throttled to rAF (framer already batches
    via rAF); a11y: verify contrast at every interpolated step, not just the two endpoints.
    Screenshot: n/a (pattern; cross-referenced against Apple/Lenis dark-mode band captures this pass).

12. **Ticker-over-grain marquee hover** (adapted from GSAP showcase's lime marquee band + prior digest's
    "Ticker Over Grain" idea, extended with a NEW interaction not previously cataloged: **per-word
    hover skew**)
    Looks like: the existing Now/marquee ticker, but each word in the ticker skews/scales slightly
    toward the cursor on hover-proximity (magnetic-adjacent, not full magnetic pull), and the marquee
    speed subtly slows while the pointer is anywhere over the strip.
    Section: "Now" pill + marquee ticker.
    Sketch: keep the existing CSS/JS marquee translate loop; add a `pointermove` listener (throttled)
    computing distance from cursor to each word's bounding box, driving a small `scale`/`skewX` via
    a `MotionValue` per word (framer `useMotionValue` + `animate()` spring back to 0 on leave); slow
    the marquee's base duration via a CSS custom property toggled on `pointerenter`/`pointerleave` of
    the strip.
    Perf: throttle `pointermove` to rAF; limit to desktop (`@media (hover: hover)`) since touch has no
    hover; a11y: marquees should already have a pause-on-hover/focus affordance — this extends rather
    than replaces that.
    Screenshot: `gsap-scrolltrigger-showcase-vp-0-1440.png` (marquee band reference).

13. **Center-focus 3D carousel with peeking neighbors** (from GSAP showcase)
    Looks like: the active slide sits large and center, with the previous/next slides partially visible
    at reduced scale/opacity on either side, plus circular prev/next arrow buttons.
    Section: Gallery carousel (laptop+phone frames) — an alternative arrangement to the current
    layout for the /luxury or /brutalist theme variant.
    Sketch: CSS `scroll-snap-type: x mandatory` track with `scale()`/`opacity` on non-active children
    driven by each child's own `animation-timeline: view(inline)` (horizontal view-timeline is part of
    the same spec); JS fallback via Embla/Framer drag + `useMotionValue` distance-from-center mapping.
    Perf: `view(inline)` is compositor-driven like its block-axis counterpart; a11y: ensure prev/next
    buttons are real buttons with `aria-label`, and the whole track remains keyboard-scrollable.
    Screenshot: `gsap-scrolltrigger-showcase-vp-0-1440.png`.

### C. Text / number / reveal choreography

14. **Word-by-word headline reveal synced to a visual moment** (generalized from AirPods Pro's waveform
    headline)
    Looks like: a multi-line headline where each word/line brightens or unmasks in sequence as a
    companion visual element (chart line, product shot) completes its own reveal — the two are
    visibly synced to the *same* scroll range, not independently animated.
    Section: Process stepper intro line, or a new "signature quote" moment in Manifesto.
    Sketch: split text into `<span>` words at build time (already common in the codebase's motion
    system per the menu-workflow digests' "split-text reveals" idea); drive per-word opacity/blur off
    the *same* `scrollYProgress` MotionValue that drives the visual, via staggered `useTransform`
    input ranges (`[i/n, (i+1)/n]`) — the shared driver is what makes it read as "synced" rather than
    "two separate animations."
    Perf: pre-split text server-side/at-build if possible to avoid layout shift from JS-inserted spans;
    a11y: keep the full sentence in the accessible tree as one text node (`aria-hidden` on the
    per-word spans, a visually-hidden full-sentence sibling) so screen readers don't hear word
    fragments.
    Screenshot: `apple-airpods-pro-vp-2-1440.png`.

15. **Number scrubber tied to scroll position, not just count-up-once** (extends the existing stat band's
    count-up-on-hairlines with a scroll-scrubbed variant)
    Looks like: instead of counting up once when scrolled into view, a stat's numeral scrubs
    forward/backward as the user scrolls up/down through its pinned range — reversible, tactile.
    Section: stat band, and/or the Years unit chart's year label.
    Sketch: `useScroll({ target })` → `useTransform(scrollYProgress, [0,1], [0, targetValue])` → feed
    into a `useSpring`-smoothed value → render via `useMotionValueEvent`/`.on("change")` writing to a
    ref'd `<span>`'s `textContent` (avoids React re-render per frame, same technique the current
    count-up presumably already needs at 60fps).
    Perf: writing `textContent` directly bypasses React reconciliation — essential for smoothness;
    a11y: ensure the *final* resting value is what's announced (use `aria-live="off"` during scroll,
    only exposing the number via a static `aria-label` on the container).
    Screenshot: n/a (extension of existing pattern; validated via Motion's official
    `useScroll`/`useTransform` docs).

16. **Clip-path "curtain" wipe between sections** (named directly in the task brief's effect list)
    Looks like: the next section's background sweeps up/across over the current one via an animated
    `clip-path`, like a curtain or blinds opening, rather than a hard scroll-past.
    Section: transition from Gallery carousel into Manifesto inverted band (light → dark moment).
    Sketch: `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` driven by `animation-timeline: view()` on
    the incoming section's wrapper (CSS-only, since `clip-path` is animatable and compositor-eligible
    when using `inset()`/`polygon()` without filters); Motion fallback: `useTransform` mapping
    scrollYProgress to a template-literal `clip-path` string.
    Perf: prefer `inset()` shapes over complex `polygon()` for GPU-friendliness; a11y: purely visual,
    `prefers-reduced-motion` → swap to a simple crossfade.
    Screenshot: n/a (pattern named in brief; CSS mechanism confirmed via Chrome docs' `view()` timeline).

17. **Scroll-velocity skew on fast scroll** (named in brief; classic Lenis+GSAP combo pattern, confirmed
    conceptually appropriate since maxfolio already runs Lenis)
    Looks like: images/cards skew slightly along the scroll axis proportional to scroll *speed* (not
    position) — pronounced during a fast flick, settling to 0° when scrolling stops or slows.
    Section: Gallery carousel images, Projects index thumbnails.
    Sketch: Lenis exposes velocity in its `scroll` event callback; feed that into a spring
    (`useSpring(0, { damping, stiffness })` set from `lenis.on('scroll', ({velocity}) => spring.set(
    clamp(velocity * k, -maxDeg, maxDeg)))`) and apply as `transform: skewY(${v}deg)` on the image
    wrapper (not the image itself, to avoid distorting content inside).
    Perf: this is a continuous per-frame effect — keep it to `transform` only, and clamp the max skew
    (≤6–8°) to avoid nausea-inducing distortion; a11y: `prefers-reduced-motion` → disable entirely,
    since velocity-linked motion is one of the more aggressive vestibular triggers on this list.
    Screenshot: n/a (mechanism-level; no direct screenshot needed, Lenis site confirms the library is
    the right foundation — `lenis-darkroom-showcase-vp-0-1440.png`).

18. **Album-cover "flick" carousel** (from scroll-driven-animations.style demos: "Recreation of a famous
    effect where you can flick through a list of album covers")
    Looks like: a stack of square covers that fan/cascade as you scroll/flick, each new one settling
    into the "current" slot with a slight rotation and offset from the rest of the stack.
    Section: Shopify Work index hover-capture preview — an alternative "flick through stores" browsing
    mode, particularly nice on mobile as a swipeable stack instead of a vertical list.
    Sketch: track is a horizontal `scroll-snap` list; each card's `rotate`/`translateY` computed from
    its offset-from-center via `animation-timeline: view(inline)` (or JS scroll-fraction calc), both
    versions exist as reference on the source page (labeled "CSS VERSION" / "JS VERSION" buttons).
    Perf: identical compositor-only cost to idea 13; a11y: this is the densest idea on mobile — ensure
    each card remains a real focusable/swipeable element, not a decorative canvas.
    Screenshot: `scroll-driven-style-demos-vp-2-1440.png`.

19. **Full-bleed image carousel that slides across as it enters/exits** (same source, third demo:
    "images in this carousel slide across the screen as they enter/exit the scrollport")
    Looks like: rather than a fixed carousel track, each image travels the *entire* viewport width on
    its own timeline as it scrolls past — so images from a distance feel like they're "passing by".
    Section: the horizontal card-rail idea (#4) or Projects index masonry, as a more kinetic variant.
    Sketch: each image `animation-timeline: view(); animation-range: cover 0% cover 100%;` animating
    `transform: translateX()` from `100vw` to `-100vw` (or a smaller multiple for subtlety);
    per-image, independent, no shared JS scroll listener.
    Perf: same CSS-only compositor cost; caution — at full-bleed 100vw travel this can feel *very*
    fast on short viewports, so tune `animation-range` to the element's own height, not a fixed
    distance.
    Screenshot: `scroll-driven-style-demos-vp-2-1440.png`.

20. **"Get inspired" cross-promo card pattern → adapt as an internal cross-link module** (from Codrops'
    sidebar "Webxibition" card — not a scroll effect per se, but a reusable layout micro-pattern)
    Looks like: a compact card with a dark textured background photo, small kicker + one-line pitch +
    an arrow-suffixed CTA link, sitting in a sidebar/rail.
    Section: could reuse this card shape for a small "Explore other themes" teaser embedded partway
    down the Apple Clean homepage (in addition to the existing dedicated Explore-themes section),
    nudging the visitor toward /luxury, /brutalist, /menu without waiting for the page end.
    Sketch: static card, no scroll-driven motion needed beyond the reveal-on-view idea (#8) applied to
    it; keep effort low (S).
    Perf: negligible; a11y: standard link semantics, ensure sufficient contrast over the photo (use a
    gradient scrim).
    Screenshot: `codrops-scroll-tag-vp-0-1440.png` (top-right "Webxibition" card).

21. **Pinned mini-map / section-jump rail keyed to scroll fraction** (extends idea 9's progress bar into
    a navigational element, inspired by Chrome docs' "View Progress Timeline" + the existing Explore
    themes / pill-switcher patterns already in the menu-workflow digests)
    Looks like: a slim vertical rail of dots (one per major section) fixed to the right edge on
    desktop; the dot for the current section fills/grows as its `view()` timeline crosses ~50%
    visibility, and clicking a dot smooth-scrolls (via Lenis) to that section.
    Section: global chrome for the Apple Clean theme (long single-page scroll) — desktop only,
    hidden on mobile in favor of the existing hairline stat-band wayfinding.
    Sketch: each dot's fill/scale bound to its own section `animation-timeline: view();
    animation-range: cover 30% cover 70%` (no JS needed for the *visual* state); the click-to-scroll
    handler calls `lenis.scrollTo(sectionRef)` (Lenis's own API, already a dependency).
    Perf: per-dot CSS animation only; the click handler is a normal event listener, not a scroll
    listener; a11y: dots are real `<a href="#section">` elements or buttons with `aria-current`, so
    keyboard/screen-reader section jumping works without any JS at all as a baseline.
    Screenshot: n/a (pattern; consistent with Chrome docs' terminology in
    `chrome-scroll-driven-docs-vp-0-1440.png`).

## 3. CSS-only today vs needs-JS-fallback

| Idea | CSS-only (`animation-timeline`) today? | Fallback |
|---|---|---|
| #5 rotate-on-scroll, #6 stacking cards, #7 horizontal-scroll band, #8 list reveal, #13/#18 carousels, #16 curtain wipe, #19 full-bleed slide, #21 progress dots | Yes, in Chromium/Edge (per Chrome docs + scroll-driven-animations.style) | Firefox/Safari (as of this capture) need GSAP ScrollTrigger `scrub` or Motion `useScroll`+`useTransform` doing the same math in JS — ship both, feature-detect with `CSS.supports('animation-timeline: scroll()')` and gate which code path mounts |
| #1 sticky accordion, #10 layered parallax, #14 synced text reveal, #15 number scrubber, #17 velocity skew | No (need per-element scroll math beyond simple linear range, or Lenis velocity) | Motion `useScroll`/`useTransform`/`useSpring` is the primary implementation, not a fallback |
| #2 chromatic aberration, #3 waveform reveal | No (filter/video scrubbing) | Motion-driven filter or native `<video>` `currentTime` scrub |
| #9 progress bar | Yes (`scroll()` timeline + pseudo-element) | Motion `useScroll` (already the simplest possible JS version, near-equal cost) |
| #11 bg color shift | Partially (`@property` + `animation-timeline`, limited browser support for animating custom properties this way) | Motion interpolated color via `useTransform` |
| #12 marquee hover, #20 cross-promo card | N/A (interaction-driven, not scroll-position-driven) | Plain JS/React event handlers |

## 4. Avoid list (what forums/judges criticize)

- **WebGL/shader spectacle for its own sake.** The Codrops tag feed this pass skewed heavily toward
  Three.js face masks, datamosh transitions, and "turn the Eiffel Tower into a catapult" playground
  pieces — impressive as demos, wrong register for a hire-me portfolio; judges and hiring managers
  read unrelated 3D flourishes as "portfolio for portfolio's sake" rather than craft applied to the
  actual content.
- **Parallax/skew strong enough to trigger vestibular discomfort.** Multiple sources (Chrome docs'
  own accessibility notes, general awwwards critique culture) call out uncapped parallax and
  velocity-linked skew as the most common accessibility complaint in scroll-heavy sites — always cap
  magnitude and gate behind `prefers-reduced-motion`.
  
- **Scroll-jacking that breaks native scroll semantics.** The GSAP `ScrollTrigger` docs and the CSS
  spec's own framing exist specifically because JS-scroll-listener animation used to cause jank and
  broke find-in-page/keyboard scrolling; any horizontal-scroll-from-vertical-scroll idea (#7, #13,
  #18, #19) must keep the content in normal DOM flow and tab order, never remove elements from
  accessibility tree mid-animation.
- **Animating too many independent layers at once.** Apple's own pages (AirPods Pro, Vision Pro)
  isolate one hero effect per pinned section rather than stacking chromatic aberration + parallax +
  text reveal simultaneously — restraint (one dominant effect per section) reads as more expensive,
  not less.
- **Decorative motion with no pause/reduced-motion escape hatch.** Apple's waveform reveal ships an
  explicit pause button even on their own site — the bar for "acceptable" continuous motion in 2026
  includes user control, not just a media-query fallback.
- **Cookie/consent banners eating the first viewport on inspiration sites** (seen on the Awwwards
  parallax listing) — a reminder for maxfolio itself: never let a modal or banner block the very
  motion you're showcasing above the fold.

## Top ideas (one-line each)

1. Sticky feature-accordion scrub for Experience split (Apple AirPods pattern).
2. CSS-only `view()`-timeline row reveals — zero-JS list/row entrance, cheapest win in the catalog.
3. Stacking-card sections for Years/case-study cards via `position: sticky` overlap.
4. Scroll-progress hairline bar for the long case-study sheet, `useScroll`+`scaleX`.
5. Horizontal card-rail teaser under headings (Vision Pro "Take a closer look" pattern).
6. Word-by-word headline reveal synced to the same scrollYProgress driving a companion visual.
7. Clip-path curtain wipe at the light→dark transition into the Manifesto band.
8. Marquee ticker gets per-word cursor-proximity skew + hover-slow (extends existing Now/marquee).
9. Center-focus 3D carousel with peeking neighbors for the Gallery section (GSAP showcase pattern).
10. Scroll-velocity skew (via Lenis's own velocity event) on Gallery/Projects images, capped and
    reduced-motion-gated.
