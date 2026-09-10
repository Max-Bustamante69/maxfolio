# Awwwards Portfolio References — Lens C (awwwards-portfolio-c)

Source: `https://www.awwwards.com/websites/portfolio/` pages 7, 8, 9 (page 7 and 9 timed out on the
first pass and were retried to completion; all three pages resolved to 31 `/sites/<slug>` detail
links each, 93 unique candidates, 88 with a resolvable outbound live URL).

Method: Playwright/Chromium 1440x900 (390x844 on every 4th capture), real Chrome UA,
`domcontentloaded` + 2.5s settle, up to 8s loader-wait, ~1.5s between page loads, <=1 req/2s per
host, human-paced wheel-scroll to 0/35/70% before each viewport capture. The capture ran in ten
short batches, paused and resumed six times when the host's free memory dropped under the 1200MB
guard (down to as low as 314MB from other sessions sharing the machine) — each pause used `TaskStop`
on the in-flight browser and resumed once memory recovered, with a resume-safe capture script that
skipped already-finished slugs. Net effect: 12 sites/page x 3 pages = **36 live sites captured**,
all with `full.png` (capped 8000px), `vp-0.png`, `vp-35.png`, `vp-70.png` + `notes.txt`
(`document.body.innerText`), and 6 of them also with mobile `m-0.png`/`m-50.png` at 390x844.
Per-site request count / transferred bytes / WebGL-canvas presence were recorded via
`page.on('response')` and a `canvas.getContext('webgl')` probe. Screenshots saved under
`refs4/awwwards-portfolio-c/<site-slug>/`.

**Known method limitation:** one candidate (`creativcurrent`, page 9) resolved its "Visit Site" link
back to an `awwwards.com` URL instead of a real outbound domain — the detail-page selector picked an
internal nofollow link. It was captured as `awwwards-com-sites-creativcurrent-com` but is **not** a
real external site and is excluded from the index/catalog below; flagged here so a future pass knows
to re-resolve that one slug by hand.

## 1. INDEX — 35 sites (36 captured, 1 excluded as a bad resolution)

| # | Slug / folder | URL | Studio/author | Style family | Section types seen | What makes it good |
|---|---|---|---|---|---|---|
| 1 | `yungbld-com-projects` | yungbld.com/projects | YUNGBLD | editorial/magazine | work-bento, media-hero | Dense bento grid of glossy beauty-campaign stills reads like a fashion-magazine spread, not a portfolio list |
| 2 | `pelizzari-com` | pelizzari.com | Pelizzari Studio | minimal/apple | typographic-hero, media-hero, footer-minimal | Enormous delayed-reveal void before a giant wordmark drops in, then full-bleed architecture photography |
| 3 | `junkbranding-com` | junkbranding.com | Junk Branding | 3d/immersive | media-hero, custom-cursor | Photoreal 3D flower wrapped in a full-body glitter/particle shader over a dark teal-to-magenta gradient |
| 4 | `vshslv-com` | vshslv.com | Vlacheslav Novoseltsev | dark-mode | split-hero, skills-stack | Dramatic lit portrait with a floating HUD skill-cluster and a game-console-style debug status bar footer |
| 5 | `momentum18-com-branding-html` | momentum18.com | Momentum18 Branding Studio | editorial/magazine | work-grid, other | Dense client-logo mosaic plus an actual photographed hand-drawn pitch diagram (pen + paper) |
| 6 | `heco-partners` | heco.partners | Heco Partners | minimal/apple | typographic-hero, marquee, work-list | Hand-painted brush-stroke logo, live dual-city clock widget, scrolling news-chip ticker |
| 7 | `gregorcollienne-com` | gregorcollienne.com | Gregor Collienne | minimal/apple | media-hero, scroll-effect, custom-cursor | Tiny photos drift at scattered coordinates across a huge cream void; centered "+" custom cursor |
| 8 | `linkaproduction-com` | linkaproduction.com | LINKA Production | luxury/fashion | video-hero, media-hero | Cinematic macro watch-mechanism footage with a minimal "Showreel 1:00" video-timer overlay |
| 9 | `irisyireihu-com-work` | irisyireihu.com/work | Iris Yirei Hu | playful/illustration | work-grid | Every artwork thumbnail is clipped to a unique organic silhouette (hand, leaf, tooth, blob) |
| 10 | `andreigorskikh-digital` | andreigorskikh.digital | Andrei Gorskikh | minimal/apple | case-study-anatomy, timeline, skills-stack | Recurring barcode-icon motif beside each case; gradient-blob placeholder tiles for NDA work |
| 11 | `sohub-digital` | sohub.digital | SOHUB | maximalist | typographic-hero, 3d-hero, work-bento | Giant edge-bleeding wordmark, floating 3D robot mascot, "Chat with SOHUB" AI pill |
| 12 | `madeinmay-studio` | madeinmay.studio | Made in May | minimal/apple | loader, side-rail-nav | Full-bleed grain-texture "scroll to enter" gate into a blueprint-ruled content canvas |
| 13 | `wearedaima-framer-website` | wearedaima.framer.website | Daima Agency | dark-mode | typographic-hero, media-hero | Minimal dark wordmark hero dissolving into extreme macro texture photography |
| 14 | `akicreate-com` | akicreate.com | Aki Create | minimal/apple | typographic-hero, contact-cta | Name hidden as the only bold letters inside a faded word-search grid of random letters |
| 15 | `nithinmwarrier-com` | nithinmwarrier.com | Nithin M Warrier | playful/illustration | typographic-hero | Canary-yellow block hero, hand-drawn ink squiggle, staggered floating role-pill badges |
| 16 | `verteal-com` | verteal.com | Verteal | dark-mode | process, stats | 4-step process row where the looping "Repeat" step breaks into a warning-orange card |
| 17 | `kaiseisadatoki-v4-vercel-app-about` | kaiseisadatoki-v4.vercel.app/about | Kaisei Sadatoki | minimal/apple | about-bio, sticky-stack, footer-minimal | Tilted 3D business-card photo beside a scroll-locked values panel; bracket-labeled footer |
| 18 | `creativemarketing-peachweb-io` | creativemarketing.peachweb.io | Creative Marketing AI | glass/gradient | media-hero | Generic warm-gradient WebGL blob behind a fintech dashboard mock — template-grade, low distinctiveness |
| 19 | `bradyperron-com` | bradyperron.com | Brady Perron | minimal/apple | media-hero, custom-cursor | Scattered/pannable WebGL photo canvas at arbitrary sizes and positions |
| 20 | `meech213-com` | meech213.com | Meech (It's Meech's Time) | editorial/magazine | typographic-hero | Tilted rotated logo lockup; a compass-needle pointer selects among scattered category words |
| 21 | `live-up-co-jp` | live-up.co.jp | LIVEUP (Tokyo) | swiss/grid | services, work-grid | Clean grid services list plus a radial org-chart linking a director node to role nodes |
| 22 | `majd-portfolio-framer-website` | majd-portfolio.framer.website | Majd | minimal/apple | footer-minimal | Mostly scroll-gated Framer template; sparse static capture, tilted red-glow card at the footer |
| 23 | `billchien-net-grid` | billchien.net/grid | Bill Chien | brutalist | typographic-hero, scroll-effect | One giant slab-serif letter fills the full viewport per scroll step, spelling a word letter by letter |
| 24 | `podium-global` | podium.global | Podium | 3d/immersive | media-hero | A morphing liquid-blob shape masks the viewport as different photos flow through it |
| 25 | `abvtek-com` | abvtek.com | ABVTEK | editorial/magazine | split-hero, work-grid | Conventional but clean architecture/interiors split-hero and offset gallery |
| 26 | `mitchellhou-com` | mitchellhou.com | Mitchell Hou | 3d/immersive | skills-stack | Dozens of draggable glossy Y2K 3D toy objects (skill pills, plush figure, clock) as a physics playground |
| 27 | `ulrychkristian-cz` | ulrychkristian.cz | Kristian Ulrych | dark-mode | work-grid, testimonials, contact-cta | Conventional dark case-grid; standout giant clickable email as the entire contact section |
| 28 | `enzo-casalini-dev` | enzo-casalini.dev | Enzo Casalini | dark-mode | loader, 3d-hero | A literal animated plasma-globe/Tesla-coil WebGL toy as the loading gate before "ENTER" |
| 29 | `yeqq-com-tr` | yeqq.com.tr | Yunus Emre Korkmaz (YEQQ) | minimal/apple | media-hero | Sparse dark canvas, framed image box, "leave a thought" comment nav item |
| 30 | `breedlove-xyz` | breedlove.xyz | James Breedlove | 3d/immersive | media-hero, stats | A hand holds a circular lens against a starfield that reveals constellation lines through it |
| 31 | `ref-digital` | ref.digital | REF Digital | 3d/immersive | media-hero | Low-poly 3D biplane model floating in a framed card, part of a scroll-driven 3D-object scene |
| 32 | `irinamoi-com` | irinamoi.com | Irina Moi | dark-mode | typographic-hero, services | Mixed-weight headline pairs bold sans with italic-serif emphasis words |
| 33 | `dashcreative-co-services` | dashcreative.co | Dash Creative | dark-mode | typographic-hero, contact-cta | Persistent "Start a project" mini-CTA card pinned inside the nav bar; floating device-frame preview card |
| 34 | `paralleluniverse-com-ua-en` | paralleluniverse.com.ua | Parallel Universe | 3d/immersive | loader | An interlocking steampunk gear-cluster doubles as the "Enter the Universe" button over a nebula |
| 35 | `madrepunk-com` | madrepunk.com | Madrepunk | motion-first | work-horizontal, marquee | Horizontally scrolling case rail where every card sits in its own bold flat-color frame |

### Technical notes (nav / loader / WebGL weight)

| Slug | Nav pattern | Loader / gate | WebGL | Weight (reqs / transfer) |
|---|---|---|---|---|
| yungbld-com-projects | top pill bar + hamburger | none observed | no | 436 req / ~69MB (heaviest req-count in the set) |
| pelizzari-com | top-bar + hamburger, cookie banner blocks first paint | long blank-void delay before reveal | no | 140 req / ~10MB |
| junkbranding-com | minimal top-left/right text links | none observed | **yes** | 30 req / ~36MB — very dense per-request (shader-driven) |
| vshslv-com | 3 floating pill buttons (name / Portfolio / Profile) | none | no | 58 req / ~6MB |
| heco-partners | icon nav top-right (list / arrows) | none | no | 57 req / ~8MB |
| linkaproduction-com | none visible pre-scroll; cookie banner | dark hold before video/photo | no | 28 req / ~104MB (video-heavy) |
| sohub-digital | "Chat with SOHUB" pill + dark Menu pill | none | no | 80 req / ~1MB (light) |
| madeinmay-studio | side-rotated vertical labels + hamburger | full-bleed grain canvas, "SCROLL TO ENTER", spinner bottom-right | no | 65 req / ~15MB |
| akicreate-com | About / Works text links + center glyph | none | no | 19 req / ~0.3MB (lightest in the set) |
| verteal-com | top-left mark + "Let's work together" | none | no | 71 req / ~11MB |
| podium-global | none visible in capture window | blob-mask scroll transition acts as a soft loader | **yes** | 114 req / ~140MB |
| mitchellhou-com | name + yellow "Menu" pill, "Pick up an object to look around →" hint | implicit (physics settle) | **yes** | 76 req / ~1MB |
| enzo-casalini-dev | none until past gate | full-screen plasma-ball + "ENTER" button | **yes** | 19 req / ~0.1MB (very light for the effect) |
| breedlove-xyz | dot indicator top-right only | none observed | no | 51 req / ~22MB |
| ref-digital | top-left "Dash"-style wordmark, hamburger | cookie banner blocks first paint | **yes** | 168 req / ~113MB (heaviest transfer/request ratio) |
| paralleluniverse-com-ua-en | none pre-gate | "ENTER THE UNIVERSE" gear-cluster gate over starfield | no (canvas/CSS-driven) | 76 req / ~273MB (heaviest total transfer in the set — caution, see Avoid list) |
| madrepunk-com | Index / About / Framer Assets / Madrelabs text nav, "W. Winner" ribbon | none | **yes** | 53 req / ~0.3MB |
| billchien-net-grid | small badge icon top-left only | none | no | 62 req / ~31MB |
| meech213-com | none visible (all content scattered, no fixed bar) | none | no | 132 req / ~215MB (second-heaviest transfer — likely unoptimized image/video assets) |

(Remaining sites not itemized here had unremarkable nav/loader — a standard top-bar or hamburger,
no loader gate, no WebGL — see the main index for their content notes.)

## 2. Idea catalog — 32 reusable ideas

### 1. Word-search hero name reveal
- **Look:** The person's actual name (2-3 large bold black serif letters) sits centered in a
  loose grid of pale, faded random letters at the same grid size — like a word-search puzzle where
  only the real name is legible. A tiny spinning `*`/`✳` glyph sits centered top as a logo mark.
- **Fits:** Apple Clean hero, or a playful easter-egg variant of the Menu theme's landing screen.
- **Sketch:** CSS grid of `span`s, most `color: var(--ink-10)` random letters (seeded, not truly
  random, so SSR/CSR match), the name's letters `color: var(--ink-100); font-weight:700`. On
  hover/scroll-in, stagger a `filter: blur() → 0` or opacity fade on the real letters only.
- **Perf/a11y:** Pure CSS/DOM, zero JS cost; wrap the whole grid in `aria-hidden="true"` and put the
  real name in a normal visually-hidden `<h1>` so screen readers get the name, not noise-letters.
- **Screenshot:** `akicreate-com/full.png`

### 2. HUD debug-readout status bar
- **Look:** A slim fixed bar along the very bottom edge shows terminal-style readouts: viewport
  size ("1440 900"), a one-line tagline, OS name ("Windows"), and a coordinate pair — like a game
  engine's debug overlay, in a monospace font at low opacity.
- **Fits:** Arcade theme footer strip, or a persistent micro-footer on any dark hero.
- **Sketch:** `position:fixed; bottom:0` flex row, `font-family: monospace`, live values driven by
  `window.innerWidth/innerHeight` and `navigator.platform`; update on resize only (no per-frame cost).
- **Perf/a11y:** Trivial cost; mark decorative values `aria-hidden` since they add no content value.
- **Screenshot:** `vshslv-com/full.png`

### 3. Floating HUD skill-cluster over a portrait
- **Look:** Category labels ("Design", "Engineering", "Featured") each head a small vertical list
  of skill/tool names, positioned as free-floating text blocks scattered over a full-bleed dramatic
  portrait rather than in a card or sidebar.
- **Fits:** About/skills-stack section for Luxury or Brutalist themes.
- **Sketch:** `position:absolute` text blocks over a `background-image` hero, each column its own
  small `<ul>`; stagger their entrance with a scroll-linked `translateY` + opacity.
- **Perf/a11y:** Ensure real DOM order matches reading order regardless of visual placement; add a
  `sr-only` heading grouping the columns for screen readers.
- **Screenshot:** `vshslv-com/full.png`

### 4. Corner ribbon "Honors" peel-tab
- **Look:** A small black tab sits flush against the left edge mid-viewport, rotated text reading
  "W. / Honors" (an awwwards-nomination badge styled as a folded paper corner/ribbon).
- **Fits:** Any theme's badge/credential display — recognitions, press mentions, award nods.
- **Sketch:** `position:fixed; left:0; writing-mode:vertical-rl` box with a subtle `box-shadow` to
  read as a tab peeling off the edge; on click, expand to a small popover listing the honors.
- **Perf/a11y:** CSS-only; give it a real `<button aria-expanded>` if it opens a popover.
- **Screenshot:** `vshslv-com/full.png`, `akicreate-com/full.png` (same ribbon pattern, different site)

### 5. Full-body glitter/particle shader on a 3D hero object
- **Look:** A photoreal 3D-rendered object (here, a giant flower) is covered edge-to-edge in fine
  sparkling glitter/dust particles that catch light as the camera or object subtly moves, over a
  moody dark teal-to-magenta gradient backdrop.
- **Fits:** Luxury theme hero, or a "featured product" 3D showcase moment.
- **Sketch:** Three.js: render the model normally, then add a `Points` particle system positioned
  along the mesh surface (sample points via `MeshSurfaceSampler`) with an additive-blended sprite
  shader (`additive` blending, small size-attenuated points, slow `sin()`-based twinkle on opacity).
- **Perf/a11y:** Cap particle count (a few thousand, not tens of thousands); disable/replace with a
  static image under `prefers-reduced-motion`; this is a decorative background, mark `aria-hidden`.
- **Screenshot:** `junkbranding-com/full.png`

### 6. Custom clip-path silhouette gallery
- **Look:** Instead of rectangular thumbnails, every work-grid image is clipped to a unique organic
  outline that echoes its subject — a hand shape, a leaf, a tooth, a blob — so the gallery reads as
  a collection of cut-out objects rather than a photo grid.
- **Fits:** Work-grid for an art/illustration-flavored theme (Arcade's comic-art lane, or a future
  "editorial" theme); great for case studies with a strong single hero image each.
- **Sketch:** Per-item `clip-path: path('M...')` (hand-authored SVG paths, one per shape family —
  reuse 4-6 base silhouettes rather than one-off per image) or `mask-image: url(#svg-mask)` for
  antialiased edges; keep the underlying `<img>` a normal rectangle for lazy-loading/`srcset`.
- **Perf/a11y:** `clip-path`/`mask` are GPU-composited, cheap; masked images still need real `alt`
  text — the shape is presentational only.
- **Screenshot:** `irisyireihu-com-work/full.png`

### 7. Barcode icon as a recurring case-study motif
- **Look:** A small vertical-bar "barcode" glyph sits beside every project's title/CTA row,
  functioning purely as a decorative brand motif (not a real scannable code), tying visually into a
  retail/production sensibility.
- **Fits:** Any e-commerce-adjacent portfolio section (Shopify-work index, a "shipped" case list).
- **Sketch:** One inline SVG (a handful of random-width `rect`s) reused as a `<svg>` sprite,
  `aria-hidden="true"`, positioned at a fixed size next to each row's metadata.
- **Perf/a11y:** Trivial; decorative only, must not imply a real barcode/interaction.
- **Screenshot:** `andreigorskikh-digital/full.png`

### 8. Gradient-blob placeholder tiles for undocumented work
- **Look:** Case studies without a real screenshot (NDA'd or in-progress work) get a full-color
  gradient-mesh tile (a different hue per project) with a small centered icon, instead of a broken
  image or an apologetic empty state.
- **Fits:** Shopify-work index items still under NDA — pairs well with the "honest empty-state copy"
  idea already in the house catalog (scope-only case cards).
- **Sketch:** CSS `radial-gradient`/`conic-gradient` per tile keyed by a hash of the project name (so
  colors stay stable across reloads), one shared small icon centered via flex.
- **Perf/a11y:** Zero image weight — pure CSS, actively *better* for performance than a placeholder
  image. Give the tile a descriptive `aria-label` ("Case study preview unavailable — NDA").
- **Screenshot:** `andreigorskikh-digital/full.png`

### 9. Oversized bleeding wordmark
- **Look:** The site's name renders at a type size so large it clips off both left and right
  viewport edges, overflowing the container on purpose (`sohub` reads as `ohu` mid-crop until you
  realize it's meant to bleed).
- **Fits:** A bold maximalist or brutalist hero moment, or a section-break slide in the Menu theme.
- **Sketch:** `font-size: clamp(8rem, 20vw, 20rem); white-space:nowrap; overflow: hidden` on the
  parent, text horizontally centered so it crops symmetrically on both sides.
- **Perf/a11y:** Free (CSS type only); keep a normal-sized `<h1>` for the real accessible name if the
  visual one is split across decorative fragments.
- **Screenshot:** `sohub-digital/full.png`

### 10. Floating 3D mascot creature
- **Look:** A small rendered 3D character/creature (here, a stylized robot) hovers just below the
  hero headline, adding personality without becoming the whole hero.
- **Fits:** A playful personal-brand moment in Apple Clean or Soft UI — a mascot that can react to
  scroll position or cursor proximity.
- **Sketch:** A pre-rendered looping WebM/Lottie of the creature (cheaper than live 3D) floating via
  a slow `translateY` `sin()` bob; swap for a static PNG under reduced motion.
- **Perf/a11y:** Prefer a baked video/Lottie over a live 3D model unless real interaction is planned
  — much lighter. Mark decorative, `aria-hidden`.
- **Screenshot:** `sohub-digital/full.png`

### 11. Inline colored keyword highlights in a headline
- **Look:** A sentence-length headline is mostly one weight/color, but 1-2 specific words ("diligent",
  "unusual") get an accent color, drawing the eye to the value-prop keywords without a full color
  block.
- **Fits:** Any headline needing emphasis without breaking type rhythm — works in every theme.
- **Sketch:** Wrap the emphasis words in a `<span class="accent">`; keep it as real text (not an
  image) so it stays selectable/translatable.
- **Perf/a11y:** Free; ensure the accent color still meets contrast minimums against the section bg.
- **Screenshot:** `sohub-digital/full.png`

### 12. Grain-texture "scroll to enter" full-bleed gate
- **Look:** A pure black canvas with a fine film-grain/noise texture and a tiny centered "SCROLL TO
  ENTER" label plus a subtle rotating dashed-circle loader in the corner — no imagery yet, just
  atmosphere, until the user scrolls past it into the real content.
- **Fits:** A moody Luxury or Brutalist theme's landing gate.
- **Sketch:** A tiled/animated noise `<canvas>` or a repeating grain PNG at low opacity over `#000`;
  the dashed-circle loader is an SVG `<circle>` with `stroke-dasharray` + a slow CSS `rotate`.
- **Perf/a11y:** Keep the grain texture small and tiled (not a huge unique noise image); respect
  `prefers-reduced-motion` for the spinner; make sure keyboard/scroll-wheel both dismiss the gate.
- **Screenshot:** `madeinmay-studio/full.png`

### 13. Vertical blueprint-ruler grid guides
- **Look:** Thin vertical lines run the full height of a content section at regular intervals, like
  a technical drawing's margin guides, giving an otherwise plain section a structured, drafting-table
  feel.
- **Fits:** A Swiss/grid-leaning section of any theme, or the Menu theme's structural chrome.
- **Sketch:** A `repeating-linear-gradient(to right, transparent Npx, var(--rule) Npx (N+1)px)`
  background on the section, or literal absolutely-positioned 1px divs at column-grid positions.
- **Perf/a11y:** Pure CSS, free; purely decorative, no a11y concern.
- **Screenshot:** `madeinmay-studio/full.png`

### 14. Side-rotated vertical nav labels
- **Look:** Primary nav items run in a single vertical column flush to the left or right viewport
  edge, each label rotated 90° (`writing-mode: vertical-rl`) rather than in a conventional top bar.
- **Fits:** Side-rail-nav pattern for a portfolio favoring full-bleed imagery with minimal top chrome.
- **Sketch:** `writing-mode: vertical-rl; text-orientation: mixed` on a fixed-position `<nav>` column;
  active-state indicator as a small dot or underline that slides between items.
- **Perf/a11y:** Keep real `<nav><a>` semantics despite the rotation; test focus-ring visibility at
  the rotated orientation.
- **Screenshot:** `madeinmay-studio/full.png`

### 15. Hand-painted brush-stroke wordmark
- **Look:** The logo isn't typeset — it's rendered as a loose, confident ink/brush stroke shape that
  still reads as the studio's initials, giving an artisanal, handmade signature feel.
- **Fits:** A boutique agency's About/hero mark in any warm, editorial-leaning theme.
- **Sketch:** Commission or trace a real brush-stroke as an SVG path (`M...C...` bezier), inline as
  the `<svg>` logo mark; can be animated with `stroke-dasharray`/`dashoffset` draw-on on first load.
- **Perf/a11y:** Tiny SVG, cheap; give the `<svg>` a `<title>` and `role="img"` with the real name.
- **Screenshot:** `heco-partners/full.png`

### 16. Live dual-city clock widget
- **Look:** Two small analog-clock icons sit side by side, each labeled with a city name and a
  live-updating local time — a compact "we work across time zones" team-location signal.
- **Fits:** About/team section for any multi-location agency theme.
- **Sketch:** Small SVG clock face per city with hour/minute hands rotated via `Intl.DateTimeFormat`
  + `setInterval` (update once per minute, not per second — no need for finer granularity).
- **Perf/a11y:** Negligible cost at 1/min updates; expose the time as real text alongside the icon
  for screen readers, not just via hand rotation.
- **Screenshot:** `heco-partners/full.png`

### 17. Scrolling news-chip ticker under the hero
- **Look:** A horizontal row of small rounded pill "chips" lists recent announcements/press items
  right under the hero headline, each chip a short label with an optional external-link arrow.
- **Fits:** Any agency/studio About page that wants a lightweight "what's new" signal without a full
  blog section.
- **Sketch:** A flex row of `<a class="chip">` pills, `overflow-x:auto` on mobile (or a slow
  auto-scrolling marquee on desktop, pausable on hover/focus).
- **Perf/a11y:** Plain links, no JS required unless auto-scrolling; if it auto-scrolls, provide a
  pause control per WCAG 2.2.2.
- **Screenshot:** `heco-partners/full.png`

### 18. Scattered-photo drift gallery
- **Look:** Small photo thumbnails sit at seemingly random x/y coordinates across a huge, mostly
  empty canvas, with the site name centered partway down — browsing feels like drifting through a
  loosely pinned corkboard rather than scrolling a grid.
- **Fits:** A photographer/artist gallery section for a minimal or art-directed theme.
- **Sketch:** Absolutely-position each thumbnail with hand-tuned or seeded-random `top`/`left`
  offsets inside a tall `position:relative` container; apply a subtle parallax (`translateY` at a
  fraction of scroll speed) per image so drift feels organic, not static.
- **Perf/a11y:** Real DOM order should follow a sensible reading sequence (e.g. chronological) even
  though the visual placement is scattered, so keyboard/AT users get a coherent tab order.
- **Screenshot:** `gregorcollienne-com/full.png`

### 19. Minimal video-timer overlay on a showreel hero
- **Look:** A full-bleed cinematic video/photo hero carries a tiny "Showreel · 1:00" label in the
  corner, mimicking a video player's timestamp without any visible player chrome.
- **Fits:** A video-hero for a production/creative-studio About or Work-intro section.
- **Sketch:** Absolutely-positioned small text label over a `<video autoplay muted loop>`; update the
  displayed duration from `video.duration`/`currentTime` if you want it to be a real live counter.
- **Perf/a11y:** Always provide a visible mute/play control and captions/transcript link — a
  timestamp-only overlay isn't sufficient media control on its own.
- **Screenshot:** `linkaproduction-com/full.png`

### 20. Compass-needle category selector
- **Look:** Category words (Fashion, Magazine, Beauty, Artist, Brands) are scattered loosely around
  a point, and a thin needle/pointer line rotates to "point at" the active or hovered category — like
  a compass dial choosing a filter instead of a row of tabs.
- **Fits:** A playful filter UI for a work-list/work-grid section with a handful of categories.
- **Sketch:** Position category labels at fixed angles around a center point (`transform:
  rotate(θ) translate(r) rotate(-θ)`); the needle is a single absolutely-positioned line whose
  `transform: rotate()` animates (CSS transition or a spring) to the angle of the hovered/active label.
- **Perf/a11y:** The needle is decorative; the actual filter state must also be exposed as a normal
  `aria-pressed` toggle group so it's operable without hover/pointer precision.
- **Screenshot:** `meech213-com/full.png`

### 21. Tilted rotated logo lockup
- **Look:** The site name + tagline sit at a jaunty rotated angle (a few degrees off-axis) in the
  corner rather than perfectly horizontal — a small, cheap way to inject personality into an
  otherwise minimal mark.
- **Fits:** Any personal-brand hero wanting a hand-set, less corporate feel.
- **Sketch:** `transform: rotate(-8deg)` on the logo lockup only (not the whole nav), anchored so it
  doesn't collide with adjacent nav items at narrow widths.
- **Perf/a11y:** Free; make sure the rotated text doesn't drop below body-text contrast/size minimums.
- **Screenshot:** `meech213-com/full.png`

### 22. Radial team org-chart
- **Look:** A single circular "Director" node sits above a row of role nodes (Cinematographer,
  Photographer, Editor, etc.), connected by thin straight lines fanning down from the center — a
  minimal, non-corporate org chart.
- **Fits:** A Team/About section that wants to show structure without a heavy hierarchy diagram.
- **Sketch:** One central circle absolutely positioned, N role-circles evenly spaced along a row
  below; connect each with an SVG `<line>` from the center node's anchor to each role node's anchor,
  computed from `getBoundingClientRect()` on mount/resize.
- **Perf/a11y:** Recompute connector lines only on resize (debounced); the chart should also read as
  a normal nested list in the DOM for screen readers, independent of the visual lines.
- **Screenshot:** `live-up-co-jp/full.png`

### 23. Giant letter-per-viewport scroll intro
- **Look:** A single oversized slab-serif letter fills the entire viewport width/height in a bold
  color on black; scrolling reveals the next letter, so a short word (e.g. "GRID") becomes its own
  multi-screen typographic intro sequence.
- **Fits:** A brutalist theme's opening sequence, or a section-transition slide in the Menu theme.
- **Sketch:** One `<section>` per letter, each `height:100vh`, giant `font-size: 60vh` letter
  centered/cropped so only part shows per screen; no JS needed — pure scroll-snap sections
  (`scroll-snap-type: y mandatory` on the container) give the "one letter per screen" feel for free.
- **Perf/a11y:** Zero JS cost with scroll-snap; provide the full word as a normal heading text
  elsewhere in the DOM (each giant letter section can carry `aria-hidden` with the real word in a
  `sr-only` heading before the sequence).
- **Screenshot:** `billchien-net-grid/full.png`

### 24. Liquid blob-mask media transition
- **Look:** An organic, softly-morphing blob shape (like a lava-lamp metaball) acts as a mask/window
  that different photos flow and blend through as the page scrolls, rather than a hard-edged image
  swap.
- **Fits:** A 3D/immersive hero or case-study transition moment.
- **Sketch:** An SVG `<filter>` with `feTurbulence` + `feDisplacementMap` animated over time to warp
  a circular/blob `<clipPath>`, with two stacked `<img>`s cross-fading inside it as scroll progress
  changes which photo is "current."
- **Perf/a11y:** SVG filters can be GPU-heavy on some browsers — test on mid-range mobile and provide
  a simple crossfade fallback under `prefers-reduced-motion` or low-end detection.
- **Screenshot:** `podium-global/full.png`

### 25. Draggable 3D toy-object skills board
- **Look:** Dozens of glossy Y2K-chrome 3D objects (a CD, a plush figure, a digital clock reading
  live time, capsule pills labeled with skill names like "Typography"/"Prototyping") are scattered
  across the viewport as a physics-based playground — "Pick up an object to look around."
- **Fits:** A standout skills-stack reinterpretation for a maximalist or playful/illustration theme.
- **Sketch:** React Three Fiber + `@react-three/rapier` (physics): each skill/fact becomes a small
  primitive mesh with a text-decal or canvas-texture label, given initial random velocity/rotation
  and basic collision so they settle naturally; drag via a physics "grab" constraint on pointerdown.
- **Perf/a11y:** This is genuinely GPU/CPU-heavy — cap object count (~20-30), use instancing where
  shapes repeat, and ship a static illustrated fallback image for reduced-motion/low-end devices.
  Also expose the same skill list as a plain text list for accessibility, since the 3D scene isn't
  operable by keyboard alone.
- **Screenshot:** `mitchellhou-com/full.png`

### 26. Plasma-globe loading gate
- **Look:** A literal animated Tesla-coil/plasma-ball toy (a glowing sphere with branching electric
  filaments reaching toward its glass edge, in pink/purple/blue) fills the pre-content screen, with a
  simple bordered "ENTER" button below it.
- **Fits:** A perfect, on-the-nose loading gate for the Arcade/game-menu theme.
- **Sketch:** A GLSL fragment shader rendering animated Lissajous-like branching filaments from a
  center point to a sphere's edge (classic plasma-globe demoscene effect), composited over a dark
  background; the "ENTER" button is a plain styled `<button>` that fades the gate out on click.
- **Perf/a11y:** Shader cost is modest at hero size; always provide a static/animated-GIF fallback
  for `prefers-reduced-motion` and a `Skip intro` affordance that's keyboard-reachable immediately.
- **Screenshot:** `enzo-casalini-dev/full.png`

### 27. Lens peek-through overlay reveal
- **Look:** A hand holds up a circular "glass" against a background scene (a starfield), and looking
  through the glass reveals a different overlay layer — here, constellation lines connecting the
  visible stars — that isn't visible outside the lens's circular boundary.
- **Fits:** A magical/editorial hero moment, or a before/after-style reveal for case studies.
- **Sketch:** Two stacked full-bleed layers (base photo + overlay layer); the overlay is clipped to a
  circular `clip-path` whose center follows the "lens" prop's screen position (scroll-driven or
  cursor-driven), giving the peek-through effect without any actual lens distortion/refraction.
- **Perf/a11y:** Pure `clip-path` + two images, cheap; if cursor-driven, also support a fixed/'tap to
  reveal' mode for touch and keyboard users who can't hover.
- **Screenshot:** `breedlove-xyz/full.png`

### 28. Steampunk gear-cluster ENTER button
- **Look:** An interlocking cluster of mechanical gears (one large center gear plus several smaller
  meshed gears around it) forms the "Enter the Universe" button, sitting over a deep-space nebula
  background — the button itself looks like it's part of the illustrated world.
- **Fits:** A themed loading gate for any "enter a world" landing moment (Arcade, or a game-menu
  intro), especially with a steampunk/mechanical or space motif.
- **Sketch:** A single SVG group of gear shapes (each gear a `<path>` with teeth generated via a
  simple polar-coordinate script, done once and reused as a component with a `teeth`/`radius` prop);
  a slow idle CSS `rotate` on each gear at a different speed for a "meshing machinery" feel at rest.
- **Perf/a11y:** SVG + CSS only, cheap; make sure the whole cluster is one real `<button>` with a
  clear accessible name ("Enter the site"), not just a clickable decorative graphic.
- **Screenshot:** `paralleluniverse-com-ua-en/full.png`

### 29. Color-blocked horizontal case-study rail
- **Look:** A horizontally-scrolling row of project cards, where each card sits inside its own bold,
  saturated flat-color frame (neon yellow-green, red, gold, blue) rather than a shared neutral
  background — every card feels like its own poster.
- **Fits:** A work-horizontal section for a motion-first or maximalist theme's case-study index.
- **Sketch:** A CSS scroll-snap flex row (`scroll-snap-type: x mandatory`), each card's background
  color pulled from that project's brand palette (a per-project CSS variable), with small dot/tick
  markers above the rail showing scroll position.
- **Perf/a11y:** Provide visible prev/next controls in addition to drag/scroll, and make the dot
  markers real `aria-label`led buttons so keyboard users can jump between cards.
- **Screenshot:** `madrepunk-com/full.png`

### 30. Sticky quick-contact card inside the nav bar
- **Look:** Instead of (or in addition to) a "Contact" nav link, a small persistent card sits inside
  the nav bar itself with a tiny avatar, a one-line headline ("Start a project"), and a short
  subline+arrow — a mini always-visible CTA rather than a plain text link.
- **Fits:** A high-intent B2B/agency header for any theme, especially Apple Clean or Soft UI.
- **Sketch:** A small flex card (`avatar + 2-line text + chevron`) positioned in the nav's flex row,
  same fixed/sticky behavior as the rest of the nav; opens a contact form/modal on click.
- **Perf/a11y:** Trivial; ensure it doesn't crowd out other nav items at narrow viewports (collapse
  to just the avatar + chevron on mobile, expanding the label in a tooltip/on tap).
- **Screenshot:** `dashcreative-co-services/full.png`

### 31. Hand-drawn diagram as persuasive collateral
- **Look:** A "why work with us" section uses an actual photographed hand-drawn Venn-diagram
  sketch (pen, paper, drafting tools visible in frame) instead of a vector graphic — the visible
  imperfection reads as authentic strategic thinking rather than a stock icon set.
- **Fits:** A services/process section wanting a more human, less templated pitch moment.
- **Sketch:** A real (or convincingly faked) photographed/scanned sketch image, paired with clean
  typeset copy beside it — the contrast between rough sketch and crisp type is the point.
- **Perf/a11y:** One optimized image; give it real alt text describing the diagram's content, not
  just "sketch."
- **Screenshot:** `momentum18-com-branding-html/full.png`

### 32. Giant clickable email as the entire contact section
- **Look:** The contact section skips a form entirely — the whole section is just the email address
  rendered as the single largest piece of text on the page, doubling as a `mailto:` link.
- **Fits:** A confident, minimal contact-cta for any theme that wants to reduce friction to zero.
- **Sketch:** `<a href="mailto:..." class="text-[clamp(2rem,8vw,6rem)]">email@domain.com</a>`; add a
  copy-to-clipboard icon button beside it for users who'd rather paste than launch a mail client.
- **Perf/a11y:** Free; make sure the link text itself (not just an icon) carries the address so it's
  readable/selectable by everyone, including screen readers and copy-paste users.
- **Screenshot:** `ulrychkristian-cz/full.png`

## 3. Avoid list

- **Cookie-banner-blocks-hero first paint** (`pelizzari-com`, `ref-digital`, `linkaproduction-com`) —
  three separate sites had their entire hero invisible or half-obscured behind a consent banner on
  first load. Never let a legal-compliance overlay compete with the hero for the first viewport;
  keep the banner low-profile (bottom strip, not a blocking modal) or defer it a beat.
- **Heavy transfer for a single small payoff** (`paralleluniverse-com-ua-en` ~273MB / `ref-digital`
  ~113MB for a handful of 3D assets, `meech213-com` ~215MB) — several 3D/immersive sites moved
  hundreds of megabytes for one hero moment. Budget a hard transfer ceiling per hero (a few MB, not
  hundreds) and compress/instance geometry and textures aggressively before shipping anything this
  heavy.
- **Generic SaaS-template gradient-blob hero** (`creativemarketing-peachweb-io`) — a warm gradient
  WebGL blob behind a stock dashboard screenshot is now a recognizable template cliché; it reads as
  "AI startup landing page #4021," not a distinctive portfolio identity. Skip unless paired with a
  genuinely custom dashboard/illustration.
- **Content that never resolves in a static/short capture window** (`majd-portfolio-framer-website`,
  `yeqq-com-tr`) — pages that gate almost all content behind long scroll-triggered reveals leave
  nothing for a first-impression screenshot, a slow crawler, or a user on a flaky connection. Always
  make sure *something* substantive paints before the first scroll-triggered animation fires.
- **Bad outbound-link resolution** (`creativcurrent` → resolved to an internal `awwwards.com` URL
  instead of the real site) — a reminder for any future scraping pass: verify the resolved "live
  site" URL's hostname differs from the listing site's own hostname before trusting it, or the
  capture silently screenshots the wrong thing.
- **Decorative-only interaction with no accessible fallback** — the compass-needle selector, the
  lens peek-through, and the 3D toy-skills board are all genuinely great *visually*, but as observed
  they lean on hover/drag precision with no visible fallback state. Borrow the visual language, not
  the interaction gap — always ship a keyboard/tap-operable equivalent alongside the flourish.
