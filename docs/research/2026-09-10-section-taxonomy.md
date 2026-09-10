# Lens: Section-Taxonomy — the maxfolio SECTION TYPE LIBRARY

Method: rather than crawling the open web cold, this lens revisited sites already catalogued by the
other reference lenses (`wf5-*.md` / `wf6-*.md` and their `refs4/tags-*.json` / `refs4/entries.json`
tag data — 588 tagged sites across 12 lenses), read each site's `sections` tags, and did a **greedy
set-cover** live re-pass with Playwright: one browser, one context per site, generic DOM heuristics
(keyword-matched headings, `<nav>`/`<footer>` detection, scroll-into-view + `elementHandle.screenshot()`,
falling back to a positioned viewport clip when no clean DOM match was found) to pull a tight **element**
screenshot for every `(site, section-type)` pair needed. The taxonomy has 34 section types (5 examples
each = 170 target slots); 64 unique sites covered 148 of those slots in one pass; three types had zero
prior coverage (`fullscreen-menu`, `footer-playful`,
`page-transition` — none of the other lenses' generic full-page/viewport captures could show a closed
menu opening, an easter-egg footer, or a route transition) plus two thin ones (`magnetic-nav`,
`sticky-stack`) and were filled from a second small curated batch of well-known interaction-forward
studio sites (Cuberto, Clay, Lusion, Resn, Locomotive, Active Theory, Dogstudio, basement.studio, Obys,
Studio Freight, Bruno Simon, Robin Noguier…), clicking menu toggles / internal links live and
screenshotting mid-interaction.

Screenshots: `refs4/sections/<type>/<slug>.png`, all relative to
`C:\Users\Usuario\AppData\Local\Temp\claude\C--Users-Usuario-Desktop-P-Github-Digitdeck\75fa9a07-350d-4734-9d2e-ac255cc6dd8f\scratchpad\refs4\`.

Crop method key (stated per type below): **DOM** = `element.screenshot()` on a matched `<header>`/
`<nav>`/`<footer>`/heading-matched `<section>` (tight, reliable); **CLIP** = a positioned
`page.screenshot({clip})` fallback (approximate — used when no clean DOM match existed on that
particular page); **LIVE-INTERACT** = clicked/opened something first (menu toggle, nav link, cursor
move) then screenshotted the resulting state.

---

## 1. Typographic Hero
**Definition.** Hero built almost entirely from oversized type — the headline itself is the graphic;
little or no photography/video.
**Method:** DOM (`header`/first `section`).

**Best pattern per maxfolio theme**
- **Apple Clean** — single SF-Pro-weight headline, massive tracking-tight scale, fades in with a 4px
  blur→0 + 12px translateY over 600ms, `cubic-bezier(0.16,1,0.3,1)`.
- **Luxury** — serif italic accent word inside a sans headline (see Creativeans below), generous
  negative space, no motion on load — motion is reserved for scroll.
- **Brutalist** — raw system-font stack, harsh drop shadow or 2px offset duplicate text, zero easing
  (linear or none).
- **Soft UI** — headline sits on a soft claymorphic panel, subtle inner shadow, gentle scale-in.
- **Arcade** — pixel/bitmap or comic display font, CRT scanline overlay, type "types itself" on load.

**Sketch:** `<h1>` with `background-clip:text` gradient optional; entrance via `framer-motion`
`initial={{opacity:0,y:16,filter:'blur(6px)'}}` → `animate`. Perf: no images, near-zero CLS if font is
preloaded with `font-display:optional`. A11y: real `<h1>`, not a canvas/SVG-only render.

---

## 2. Split Hero
**Definition.** Hero cut into two halves — copy on one side, image/video/3D/portrait on the other.
**Method:** DOM.

**Per theme:** Apple — 50/50 grid, portrait in muted duotone; Luxury — asymmetric 60/40 with a full-bleed
editorial photo; Brutalist — hard vertical rule between halves, no gutter; Soft UI — image in a rounded
clay card floating over the text column; Arcade — character/mascot art on one side, dialogue-box-style
copy on the other.
**Sketch:** CSS grid `grid-template-columns: 1.1fr 0.9fr`; image column gets a subtle parallax
(`useScroll`+`useTransform` on `y`, ±20px) — respect `prefers-reduced-motion`.

---

## 3. Media Hero
**Definition.** Hero dominated by one large photo/illustration with minimal type overlaid or beside it.
**Method:** DOM.
**Per theme:** Apple — full-bleed product photo, thin white type; Luxury — warm-toned real-estate/interior
photography (dsgn Interior pattern) with lowercase serif overlay; Brutalist — high-contrast B&W with
neon-orange condensed headline slammed over (Grafik pattern); Soft UI — image inset in a large rounded
card with soft ambient shadow; Arcade — illustrated key-art hero, comic-panel border.
**Sketch:** `<img>`/`next/image`-equivalent with `srcset`, `loading="eager"` + `fetchpriority="high"`
only above the fold; everything else lazy.

---

## 4. Video Hero
**Definition.** Autoplaying (muted, looped) background or foreground video as the hero.
**Method:** DOM/CLIP.
**Per theme:** Apple — silent looping product B-roll, no controls, `poster` fallback; Luxury — slow-motion
lifestyle footage with a heavy dark gradient for legibility; Brutalist — raw unedited webcam-style clip,
visible timestamp/HUD overlay; Soft UI — video framed in a rounded card, not full-bleed; Arcade — looping
sprite/gameplay capture.
**Sketch:** `<video autoplay muted loop playsinline>` + IntersectionObserver to pause off-screen (perf);
always ship a static `poster` for the flash-of-black moment and reduced-motion users.

---

## 5. 3D Hero
**Definition.** Real-time WebGL/3D scene as the hero (Three.js/R3F model, shader blob, drag-to-orbit
scene).
**Method:** DOM. Standout example: **persona-studio.com** — a fully navigable Three.js 3D *city* you
drag-orbit/pan/zoom, with an "Enter First-Person" mode and buildings that ARE the nav.
**Per theme:** Apple — a single glossy product-like 3D object, slow auto-rotate, mouse-parallax only;
Luxury — a soft liquid-metal/chrome blob morphing behind the headline (nexstudio pattern); Brutalist —
low-poly/wireframe object, jittery/glitchy motion; Soft UI — 3D blob rendered with soft matte shading and
pastel gradient lighting; Arcade — a literal 3D game-cabinet or isometric diorama.
**Sketch:** React Three Fiber + `@react-three/drei` `<Float>`/`OrbitControls`; **perf is the whole
game**: lazy-mount only when in viewport, cap `devicePixelRatio` at 1.5, provide a static-image fallback
under `prefers-reduced-motion` and for low-end/mobile (`navigator.hardwareConcurrency` gate).

---

## 6. List Hero
**Definition.** Hero framed as an index/list (numbered rows, a filmstrip, a spec-sheet) instead of one
headline block.
**Method:** DOM. Example: **studio-merge.com** — numbered full-bleed nav (01 Work…06 Contacts) under a
slab headline with a tilted marquee of poster cards behind the fold.
**Per theme:** Apple — a clean numbered feature list, generous line-height; Luxury — case rows each with
role/year/recognition meta (Huy Phan pattern); Brutalist — monospace numbered list, no alignment
softening; Soft UI — list rows as stacked soft cards; Arcade — a level-select list (numbered "stages").
**Sketch:** semantic `<ol>`, each `<li>` a flex row; stagger-reveal with `framer-motion`
`staggerChildren: 0.06`.

---

## 7. Magnetic Nav
**Definition.** Nav links/buttons visually "pulled" toward the cursor within a radius before it actually
touches them (magnetic hover).
**Method:** DOM/LIVE-INTERACT (cursor moved near nav before capture). Thin category going in — only 1
prior tagged example; supplemented from Cuberto/Resn/Dogstudio/hellomonday/Codrops (agencies whose
entire brand is built on this micro-interaction) to **6 examples** — `refs4/sections/magnetic-nav/`.
**Per theme:** Apple — very subtle (≤8px pull, spring `stiffness:300,damping:20`); Luxury — pairs
magnetism with an underline-draw; Brutalist — intentionally exaggerated/jittery pull, no spring
smoothing; Soft UI — the whole pill-button "melts" toward the cursor; Arcade — magnet pulls a
joystick/coin icon next to the link.
**Sketch:** `onMouseMove` on the nav item computes `dx,dy` to cursor, clamps to a radius, sets a
`motion.div` `x/y` via a spring (`useSpring`); reset to `0,0` on `mouseleave`. A11y: effect is
pointer-only — must not move focus outlines or break keyboard nav.

---

## 8. Dock Nav
**Definition.** Nav rendered as a floating pill/dock — often fixed near the bottom, macOS-dock-flavored,
icons or labels with hover-scale.
**Method:** DOM (`position:fixed` + bottom-anchored `<nav>` detection). Example: **persona-studio.com**.
**Per theme:** Apple — literal macOS-dock magnification curve on hover; Luxury — a slim pill with a
gold/foil active-state dot; Brutalist — square (not pill) dock, hard borders; Soft UI — thick claymorphic
pill with deep soft shadow; Arcade — a dock styled like a game HUD action-bar.
**Sketch:** flex row in a `backdrop-filter: blur()` pill, each icon scales via neighbor-distance math on
`mousemove` (classic dock magnification) — throttle with `requestAnimationFrame`.

---

## 9. Side-Rail Nav
**Definition.** Persistent vertical nav rail pinned to the left/right edge, often the full viewport
height.
**Method:** DOM (tall/narrow `<nav>` detection). Example: **khanhnguyen.design**.
**Per theme:** Apple — thin rail, icon+tooltip only; Luxury — rail carries a rotated wordmark/logo
running its full height; Brutalist — rail is a thick colored bar with stacked uppercase labels; Soft UI
— rail floats off the edge as a rounded capsule; Arcade — rail styled as a game sidebar/inventory.
**Sketch:** `position: sticky; top:0; height:100vh` flex column; on mobile collapses into the standard
top bar (don't force a side rail below ~768px).

---

## 10. Fullscreen Menu
**Definition.** The nav toggle opens a full-viewport overlay — big link list, sometimes secondary
imagery/socials/contact, replacing the whole screen while open.
**Method:** LIVE-INTERACT — clicked the hamburger/menu toggle, waited ~900ms, screenshotted the open
state. **Zero prior coverage** from the other lenses (none of their static captures had the menu open);
sourced from Cuberto, Clay, Lusion, Resn, Locomotive, Active Theory, Dogstudio, basement.studio, Obys —
this pattern IS the house style of that whole "interaction agency" cohort. **Landed 3 clean captures**
(Cuberto, Lusion, Dogstudio) — `refs4/sections/fullscreen-menu/`; the other six sites' toggle selectors
didn't match the script's generic heuristics (bespoke/canvas-driven menu triggers), the one type in this
pass that's still short of the 5-example bar and would need per-site selectors to close.
**Per theme:** Apple — simple centered list, crossfade+scale open (200ms); Luxury — links revealed with a
staggered clip-path wipe, serif italic on hover; Brutalist — menu items are huge (10vw+), hard cut open
(no easing); Soft UI — menu panel slides in as a rounded full-height card, not truly full-bleed; Arcade —
menu = a pause-screen overlay, complete with a "Resume" close button.
**Sketch:** `AnimatePresence` around a `position:fixed inset:0` panel; stagger each `<li>` with
`y:40→0, opacity`; trap focus while open (`inert` on the rest of the page), close on `Escape`, restore
focus to the toggle button on close.

---

## 11. About / Bio
**Definition.** The "who I am" section — portrait/avatar, personal facts, short bio copy.
**Method:** DOM (keyword-matched: about/bio). Example: **jcedrik.com**.
**Per theme:** Apple — square portrait, three short fact-lines, tons of whitespace; Luxury — editorial
portrait with a pulled-quote in serif italic; Brutalist — polaroid-style tilted photo, handwritten-style
annotation; Soft UI — portrait in a clay-embossed circle; Arcade — pixel-art avatar / character card
(stats-block style).
**Sketch:** two-column flex on desktop, stacked on mobile; keep the photo `loading="eager"` only if
above the fold on first paint.

---

## 12. Services
**Definition.** "What I do / what we do" — a list of offerings, usually icon+label, sometimes with a
one-line description each.
**Method:** DOM (keyword-matched). Example: **crency.agency**.
**Per theme:** Apple — plain numbered list, icons in SF-symbol style linework; Luxury — services as
elegant serif labels with a thin gold rule between; Brutalist — services stacked as giant stamped
labels; Soft UI — each service its own soft rounded tile; Arcade — services as unlockable "skill tree"
nodes.
**Sketch:** semantic list, reveal-on-scroll stagger; hover swaps a linework icon for a filled variant
(CSS `:hover` swap, no JS needed).

---

## 13. Work List
**Definition.** Projects presented as a vertical list of rows — title + meta, often revealing a hover
preview image.
**Method:** DOM. Example: **jcedrik.com**, **grafik.co.nz**.
**Per theme:** Apple — clean row, hover reveals a floating thumbnail that follows the cursor; Luxury —
row with role/year/recognition meta inline (Huy Phan pattern); Brutalist — rows separated by thick
rules, no hover softening; Soft UI — each row a soft card on hover (background lifts); Arcade — rows
styled as a "select level" list with a difficulty/genre tag.
**Sketch:** the cursor-follow preview: `position:fixed` image layer, position set from `mousemove`,
opacity/scale toggled on row `mouseenter`/`leave` — swap `src` per row; preload thumbnails.

---

## 14. Work Grid
**Definition.** Projects as a grid of uniform (or near-uniform) cards/thumbnails.
**Method:** DOM. Example: **arturospatino.com**, **meech213.com**.
**Per theme:** Apple — 2–3 col grid, generous gutters, subtle hover lift; Luxury — 2-col with large
imagery, captions only on hover; Brutalist — dense uneven grid, no gutter, borders instead of shadow;
Soft UI — cards with soft shadow + rounded corners, hover deepens the shadow; Arcade — grid styled as a
cartridge/case shelf.
**Sketch:** CSS grid `auto-fill, minmax(280px,1fr)`; use `content-visibility:auto` on offscreen cards on
long grids (perf, avoid layout thrash).

---

## 15. Work Bento
**Definition.** Projects/features in an asymmetric bento-box grid — mixed cell sizes, one or two "hero"
cells larger than the rest.
**Method:** DOM. Example: **studio-merge.com**, **codrops.com**-style hub layouts.
**Per theme:** Apple — restrained 2-size grid (1x1 and 2x1 only); Luxury — one dominant hero cell, small
supporting cells feel like a gallery wall; Brutalist — deliberately chaotic cell sizes, colliding grid
lines; Soft UI — every cell a soft rounded tile at a different elevation; Arcade — bento styled as an
inventory grid with item-rarity borders.
**Sketch:** CSS grid with named `grid-template-areas` per breakpoint (don't try to auto-place bento —
name the areas explicitly so mobile reflow stays intentional).

---

## 16. Work Horizontal
**Definition.** Projects/case studies laid out and scrolled **horizontally** — drag, wheel-redirected, or
scroll-jacked.
**Method:** DOM/CLIP. Example: **rauno.me** (Rauno Freiberg — data-rich, horizontal project rail),
**senawa.com** (horizontal filmstrip hero).
**Per theme:** Apple — horizontal rail with a thin progress bar, snap-scroll per card; Luxury — filmstrip
with year/category captions crossfading as it moves (Senawa pattern); Brutalist — raw overflow-x-scroll,
visible scrollbar, no snapping; Soft UI — cards drag with momentum/inertia, soft overshoot bounce;
Arcade — horizontal "world map" of levels to select.
**Sketch:** `overflow-x:auto; scroll-snap-type:x mandatory` is the accessible/perf-safe base; only
upgrade to wheel-redirect (`e.preventDefault()` + `scrollBy`) on desktop pointer, never trap touch/trackpad
gestures, and keep native scrollbar or a visible custom one for a11y.

---

## 17. Sticky Stack
**Definition.** Cards/panels that pin (`position:sticky`) one after another and visually stack/cover as
you keep scrolling past them.
**Method:** DOM/CLIP (captured mid-scroll at ~40% page depth as an illustrative frame — this effect is
inherently motion, a single frame shows the stacking state, not the transition). Thin category going in
(2 prior); supplemented from Clay/Locomotive/basement.studio/Robin Noguier/Codrops/Studio Freight to
**8 examples** — `refs4/sections/sticky-stack/`.
**Per theme:** Apple — 3 cards max, each a full viewport, clean cut; Luxury — cards reveal a full-bleed
editorial image as they stack; Brutalist — stacked cards slam down with a hard shadow, no easing;
Soft UI — each card scales down slightly as the next covers it (depth via scale, not just z-index);
Arcade — stack styled as a card-battle deck being played.
**Sketch:** each panel `position:sticky; top:0; height:100vh`; the "next covers previous" look comes free
from sticky + normal document flow (no scroll-jacking JS needed) — optionally scale the outgoing card
down via `useScroll`+`useTransform` mapped to that panel's own scroll progress.

---

## 18. Case-Study Anatomy
**Definition.** The internal structure of a single case-study page/section: role, year, challenge/goal,
gallery, results — the "spec sheet" of one project.
**Method:** DOM. Example: **grafik.co.nz**, **meech213.com**.
**Per theme:** Apple — a clean two-column meta table beside a full-bleed gallery; Luxury — meta rendered
as elegant serif labels, gallery in a lightbox; Brutalist — meta as a raw `<table>`-looking grid, no
styling softness; Soft UI — meta in soft pill tags; Arcade — meta styled as an RPG quest-log entry
(objective/reward/status).
**Sketch:** a reusable `<CaseMeta rows={[{label,value}]}/>` component + a `<Gallery>` that lazy-loads
images with `IntersectionObserver`; keep meta as real text (SEO + a11y), never an image of a table.

---

## 19. Logos
**Definition.** Client/partner/press logo bar or wall ("as featured in" / "trusted by").
**Method:** DOM. Example: **creativeans.com**, **arcoglobal.com**.
**Per theme:** Apple — small grayscale logos, uniform height, generous gaps; Luxury — logos in a thin
gold-rule-bordered strip; Brutalist — logos at inconsistent sizes, raw and unapologetic; Soft UI — each
logo in its own soft rounded chip; Arcade — logos as achievement badges.
**Sketch:** `filter:grayscale(1); opacity:.6` at rest → full color on hover; if it scrolls, it's a
`marquee` (see below), not a static logo wall — don't conflate the two.

---

## 20. Testimonials
**Definition.** Client quotes/reviews, in a carousel, grid, or single rotating quote.
**Method:** DOM. Example: **crency.agency**.
**Per theme:** Apple — one large centered quote at a time, subtle crossfade; Luxury — quote in italic
serif with a thin attribution rule; Brutalist — quotes stacked raw, quotation marks oversized as a
graphic element; Soft UI — quote in a soft card with an embossed quotation-mark icon; Arcade — quote as
an NPC dialogue box.
**Sketch:** if carouseled, use a real accessible carousel (visible pagination, `aria-live="polite"` on
the active slide, pause-on-hover/focus) — never an infinite auto-advance with no pause control.

---

## 21. Process
**Definition.** Step-by-step "how we work" sequence, usually 3–5 numbered stages.
**Method:** DOM. Example: **arcoglobal.com**; thin category, supplemented via codrops-style demo hubs.
**Per theme:** Apple — numbered steps in a clean horizontal timeline, connecting line animates in on
scroll; Luxury — steps as serif-numbered vertical list with generous line-height; Brutalist — steps as
stamped blocks, connecting line is a raw drawn arrow; Soft UI — steps as connected soft pills; Arcade —
steps as a level-up progress bar.
**Sketch:** connecting line as an SVG `<path>` with `stroke-dasharray`/`stroke-dashoffset` scrubbed by
scroll progress (`useScroll` → `useTransform` → set as a CSS var); keep step numbers as real text.

---

## 22. Timeline
**Definition.** Chronological history/experience list (career, brand history, changelog).
**Method:** DOM. Example: **jcedrik.com**.
**Per theme:** Apple — thin vertical line, dot markers, fade-in per entry; Luxury — timeline as an
editorial "chapters" list (Khanh Nguyen's "CHAPTER I" pattern); Brutalist — timeline as a raw dated list,
monospace years; Soft UI — dots are soft embossed circles; Arcade — timeline as a level-progression map.
**Sketch:** one shared `<Timeline entries={[]}>` component reused for both "About → history" and
"Work → case index"; stagger-reveal per entry as it enters the viewport.

---

## 23. Stats
**Definition.** Big-number metrics block ("120+ projects", "98% retention").
**Method:** DOM. Example: **arcoglobal.com**.
**Per theme:** Apple — huge SF-weight numbers, count-up on scroll-into-view; Luxury — numbers in a
refined serif, no count-up gimmick (numbers just appear, quietly confident); Brutalist — numbers
oversized to the point of overflow/clipping, intentional; Soft UI — each stat in its own soft tile;
Arcade — stats as an XP/HUD readout.
**Sketch:** count-up via `framer-motion`'s `useMotionValue` + `animate()` triggered by `useInView`, or a
tiny custom `requestAnimationFrame` easing loop — respect `prefers-reduced-motion` by just rendering the
final number instantly.

---

## 24. Skills Stack
**Definition.** Tools/tech/skills shown as tags, icons, or a labeled stack.
**Method:** DOM. Example: **andreigorskikh.digital**.
**Per theme:** Apple — clean icon row, monochrome, tooltip on hover; Luxury — skills as an elegant
comma-separated serif line, not icon soup; Brutalist — skills as a dense tag cloud, hard borders;
Soft UI — each skill a soft pill/chip; Arcade — skills as an equipped-item loadout grid.
**Sketch:** icon set via one sprite/SVG-symbol file (not 20 separate requests); tag layout with CSS
`flex-wrap` + `gap`, no JS masonry needed.

---

## 25. Blog / Notes
**Definition.** Writing/journal/article list — title, date, short excerpt.
**Method:** DOM. Example: **arcoglobal.com**.
**Per theme:** Apple — clean list, date right-aligned, generous line-height; Luxury — article rows with a
small editorial thumbnail; Brutalist — raw dated list, monospace metadata; Soft UI — each post a soft
card; Arcade — posts as "patch notes" / devlog entries.
**Sketch:** static-generated list (no client fetch needed for a portfolio's note count); reuse the
`work-list` row component with different meta fields — don't build a second list component from scratch.

---

## 26. Contact CTA
**Definition.** The closing call-to-action inviting contact ("let's talk", email, socials).
**Method:** DOM. Example: **meech213.com**.
**Per theme:** Apple — single centered line + one button, huge whitespace above/below; Luxury — CTA in
serif italic with an underline-draw on hover; Brutalist — CTA as a giant stamped button, no rounding;
Soft UI — CTA button is a deep soft-shadow pill; Arcade — CTA styled as a "Press Start" / "Insert Coin"
prompt.
**Sketch:** `mailto:` link with a copy-to-clipboard fallback button (many portfolios do both); if
animated, keep it to an underline-draw or magnetic pull — this is the section where restraint reads as
confidence.

---

## 27. Footer — Mega
**Definition.** Large multi-column footer — sitemap-style link columns, socials, sometimes a mini
newsletter form.
**Method:** DOM. Example: **meech213.com**.
**Per theme:** Apple — columns aligned to a strict grid, small caps labels; Luxury — columns separated by
thin gold rules; Brutalist — columns with hard borders, no alignment softening; Soft UI — footer as one
large soft rounded panel; Arcade — footer styled as an end-credits scroll.
**Sketch:** semantic `<footer>` with real `<nav>` landmarks per column (a11y — screen readers benefit
from labeled footer nav regions); avoid duplicating the entire primary nav here verbatim.

---

## 28. Footer — Minimal
**Definition.** One line — copyright, socials, maybe a "back to top."
**Method:** DOM. Example: **crency.agency**.
**Per theme:** Apple — centered single line, tiny type; Luxury — line in a thin serif with generous
letter-spacing; Brutalist — line in monospace, left-aligned only; Soft UI — line inside a soft rounded
bar; Arcade — line styled as a game-credits ticker.
**Sketch:** flex row, `justify-content:space-between`; keep it a real `<footer>` even when minimal (don't
drop the landmark just because the content is small).

---

## 29. Footer — Playful
**Definition.** A footer with a deliberate easter egg — a mini-game, an interactive illustration/mascot,
a joke, a physics toy.
**Method:** LIVE-INTERACT/DOM. **Zero prior coverage** — sourced from **bruno-simon.com** (his whole
site is a drivable 3D car; the footer/contact area continues the toy-physics joke), **robin-noguier.com**,
**jimmychion.com**, **hellomonday.com**, **basement.studio** and **studiofreight.com** (studios whose
footers are known for a small playful flourish — confetti, a draggable object, a hidden game link).
**Landed 6 examples** — `refs4/sections/footer-playful/`.
**Per theme:** Apple — one small, tasteful animated detail (not a full game — stays "Apple-restrained");
Luxury — a subtle gold shimmer/particle detail on hover only; Brutalist — a literal mini-game (the
brutalist theme has the most license to be weird here); Soft UI — a squishy/draggable clay blob toy;
Arcade — this IS the arcade theme's natural home — a real embedded mini-game or high-score list.
**Sketch:** keep it code-split/lazy-loaded (`React.lazy` + dynamic `import()`) so the joke never costs
non-viewers any bundle weight; guard behind `prefers-reduced-motion`/a static fallback.

---

## 30. Loader
**Definition.** The pre-loader screen/animation shown before the page content reveals.
**Method:** captured immediately on `goto()` (before the settle wait) — many loaders vanish in under a
second, so this is a race; some sites in the batch had already resolved by the time of capture (noted per
example). Examples: **mariavasilyeva.com** (theatrical "loading the playlist…" sequence),
**dogstudio.co**, **active-theory.net**.
**Per theme:** Apple — a simple centered logo-mark fade, ≤800ms, never blocks longer than the real asset
wait; Luxury — a slow serif wordmark reveal, deliberately unhurried; Brutalist — a raw percentage counter,
monospace, no easing; Soft UI — a soft pulsing blob; Arcade — a literal "loading bar" styled like a retro
game boot screen.
**Sketch:** tie the loader's exit to `document.readyState`/critical-asset `Promise.all`, not a fixed
timer — a loader that outlives its own assets (or a fixed 3s loader hiding an already-ready page) is the
single most-hated pattern in the reference set; always allow instant-skip on click/keypress.

---

## 31. Custom Cursor
**Definition.** The native cursor is replaced/augmented — a dot, a ring, a blend-mode circle, a
label that appears near the pointer.
**Method:** moved the mouse to page center, waited, clipped a region around it. Example:
**rauno.me**.
**Per theme:** Apple — a small soft-blurred dot with `mix-blend-mode:difference`; Luxury — a thin ring
that scales up on link hover with a serif label ("View"); Brutalist — a hard-edged square cursor, no
blend mode; Soft UI — a soft glowing orb cursor; Arcade — a crosshair/reticle cursor.
**Sketch:** a single fixed-position `motion.div` following `mousemove` via `useMotionValue` (no React
state re-renders per pixel); **hide on touch** (`(hover:hover) and (pointer:fine)` media check) and
always keep the real cursor available as a fallback — never fully `cursor:none` without an accessible
alternative for users who disable JS or use assistive pointer tech.

---

## 32. Page Transition
**Definition.** An animated transition between routes/pages — a wipe, a color-block cover, a shared-element
morph — instead of a hard reload/cut.
**Method:** LIVE-INTERACT — clicked an internal nav link and screenshotted ~250ms later, mid-transition.
**Zero prior coverage** (a static full-page capture, by definition, can't show a transition-in-progress);
sourced from **cuberto.com**, **clay.global**, **lusion.co**, **obys.agency**, **studiofreight.com** —
**5/5 landed** — `refs4/sections/page-transition/`.
**Per theme:** Apple — a soft crossfade + 8px slide, ~350ms; Luxury — a color-block wipe in the accent
tone; Brutalist — a hard instant cut with one frame of flash (deliberately jarring, on-brand); Soft UI —
the outgoing page scales down/blurs as the incoming one rises; Arcade — a screen-wipe styled like a
retro game level transition.
**Sketch:** for a Vite/React SPA (maxfolio's stack), wrap route-level content in `AnimatePresence
mode="wait"` — **but per the house incident log, animate only the ENTERING content's own opacity/transform,
never wrap a persistent `<Outlet/>`-style container with an `exit` that runs on top of freshly-mounted
new content** (that's exactly the "blank panel" bug memory already flags for Remix `AnimatePresence`
misuse — same trap applies to any React Router transition wrapper).

---

## CATALOG — 25+ reusable ideas distilled from the pass above

1. **Magnetic-pull nav link** — spring-follow cursor within ~40px radius, reset on leave. Fits: Apple/Soft UI nav. `framer-motion useSpring`. Perf: negligible. A11y: pointer-only, must not affect keyboard focus ring. — `refs4/sections/magnetic-nav/`
2. **Dock-magnification bottom nav** — macOS-dock hover-scale curve on a fixed pill. Fits: Arcade HUD or a playful Apple variant. Perf: throttle mousemove via rAF. — `refs4/sections/dock-nav/`
3. **Full-viewport stagger menu** — `AnimatePresence` overlay, `staggerChildren` on `<li>`s, focus-trap + `Escape` close. Fits: every theme's mobile nav, and Brutalist/Arcade desktop nav. — `refs4/sections/fullscreen-menu/`
4. **Cursor-follow work-list preview** — fixed image layer tracks `mousemove`, swaps `src` per hovered row. Fits: Apple/Luxury work-list. Preload thumbs to avoid pop-in. — `refs4/sections/work-list/`
5. **Sticky-stack case reveal** — plain `position:sticky` panels, no scroll-jacking JS, each panel's own scroll progress scales the outgoing card down slightly. Fits: all themes' case-study flow. — `refs4/sections/sticky-stack/`
6. **Numbered chapter index hero** (Khanh Nguyen pattern) — vertical year/chapter column doubling as a visual timeline AND scroll nav. Fits: Luxury/editorial About. — `refs4/awwwards-portfolio-a/khanh-nguyen-portfolio/`
7. **Location/state-picker hero switch** (AllHaus) — a tab row that filters everything below instead of a normal nav. Fits: a multi-market Apple hero. — `refs4/awwwards-portfolio-a/allhaus/`
8. **Live local-time clock chip** — small `HH:MM GMT±N` pill in the header, updates every second. Fits: any theme as a "personality" detail; cheap (`setInterval` + `Intl.DateTimeFormat`), zero perf cost if unmounted off-route.
9. **"Now playing" persistent audio bar** (Paul Kalkbrenner) — bottom mini-player with waveform + mute toggle, survives scroll. Fits: Arcade/Luxury theme with sound-on-brand. Perf: lazy-load the audio element, never autoplay with sound.
10. **Draw-together canvas / guestbook page** (Grafik) — a genuinely unique community feature, not a section per se but a differentiator page. Fits: a signature Easter-egg page linked from footer-playful.
11. **Count-up stat on scroll-into-view** — `useInView` + `animate(0→N)`; instant-render under reduced-motion. Fits: Apple/Brutalist stats. — `refs4/sections/stats/`
12. **SVG-path process line scrubbed by scroll** — `stroke-dashoffset` driven by `useScroll`. Fits: all themes' process/timeline. — `refs4/sections/process/`
13. **Bento hero-cell work grid with named grid-areas** — explicit per-breakpoint `grid-template-areas`, not auto-placement. Fits: Apple/Soft UI work section. — `refs4/sections/work-bento/`
14. **Horizontal filmstrip hero with progress bar** (Senawa) — sideways-scrolling photo strip, active-thumbnail progress indicator at the bottom. Fits: Luxury/editorial hero. — `refs4/sections/work-horizontal/`
15. **Duotone split-hero portrait** (Arturo Spatino) — two-tone gray/black type paired with a tight B&W crop. Fits: Apple/Swiss-leaning split hero. — `refs4/sections/split-hero/`
16. **Marquee ribbon + glow-orb hero combo** (Creativeans) — top announcement marquee + soft aurora blob behind italic-accent headline. Fits: Luxury/glass-gradient hero+nav pairing. — `refs4/sections/marquee/`
17. **Chrome/liquid-metal shader blob over headline** (NexStudio) — a morphing torus reacting through the type. Fits: 3d-hero for a premium-tech Apple/Luxury blend. — `refs4/sections/3d-hero/`
18. **Case-row "spec sheet" list** (untitledfilm template) — each row carries a live local-time clock, duration, year, studio — editorializes a plain list. Fits: work-list for a Luxury/film-adjacent portfolio.
19. **Recognition-inline case list** (Signal-A Studio) — "Notable Recognitions" (Awwwards HM, CSS Winner SOTD) inline per case. Fits: case-study-anatomy meta row, adds instant credibility.
20. **Sound/annotations dual toggle** (Maria Vasilyeva) — explicit ON/OFF controls for both audio and content-annotation layers, never forced. Fits: any theme layering optional narration — a11y-first pattern (opt-in, not autoplay).
21. **Photo-inside-wordmark hero** (Paul Kalkbrenner) — a photo clipped/inlined literally inside giant type via `background-clip:text` + `background-image`. Fits: typographic-hero with a personal-brand photo.
22. **Cursor-follow "View" label ring** (Rauno Freiberg-style) — custom cursor grows and shows a text label on link hover. Fits: custom-cursor for Apple/Luxury. — `refs4/sections/custom-cursor/`
23. **Draggable 3D orbit "world" hero** (Persona Studio) — the ENTIRE hero is a navigable 3D space, nav items are literal buildings. Fits: an ambitious Arcade/3d-hero centerpiece — biggest perf/a11y investment on this list; ship a "skip 3D" link.
24. **Playful footer toy** (Bruno Simon-class) — a small physics/drag toy in the footer, code-split so non-viewers never pay for it. Fits: footer-playful, Arcade/Brutalist themes especially. — `refs4/sections/footer-playful/`
25. **Route color-wipe transition** (Cuberto/Clay-class) — a full-bleed color panel wipes across on navigate, covering the swap. Fits: page-transition for Luxury/Brutalist (accent-color wipe vs. hard flash variant). — `refs4/sections/page-transition/`
26. **Theatrical loader copy** (Maria Vasilyeva: "loading the playlist… finding the right tune…") — loader text narrates rather than just showing a spinner/percentage. Fits: Luxury/Arcade loader, always tied to real asset-ready state, never a fixed timer.
27. **"Archive" small-icon grid** (Vilen Rodeski) — a secondary, denser grid of small app-icon+thumbnail rows below the main case grid, for older/smaller work. Fits: work-grid overflow pattern — keeps the primary grid curated while not hiding history.

## AVOID
- **Un-primed scroll-reveal sections** (Arturo Spatino) — sections rendering fully empty until scrolled into view, with no skeleton/placeholder: reads as broken on first paint, hurts perceived performance and SEO crawlers that don't scroll.
- **Repetitive/label-spam CTAs** (Mad Monkey — "SEE MORE WORK" tiled with zero copy variation) — kills scannability, feels like a template stamped out.
- **Near-blank single-viewport sites** (Aquirin, Little Plains) — under-built to the point of reading as unfinished, not "minimal."
- **Duplicated nav items from an SSR/CSR hydration seam** (Grigoletti) — a visible correctness bug, not a style choice; always verify hydration doesn't double-render nav.
- **Loader that outlives its own assets / fixed-timer loader on an already-ready page** — the single most user-hostile pattern across this whole pass; always tie loader exit to real readiness and allow instant-skip.
- **`AnimatePresence`+`exit` wrapped around a persistent route-outlet** — per house memory (`panel-derecho-en-blanco-animatepresence-sobre-outlet`), this leaves the NEW content at `opacity:0` on every navigation because the exit animation runs on top of what just mounted; animate only the entering content.
- **Full `cursor:none` custom cursor with no fallback** — breaks for touch, and for anyone relying on the OS pointer/assistive tech; always gate behind `(hover:hover) and (pointer:fine)`.
- **Scroll-jacked horizontal sections that trap trackpad/touch gestures** — several reference sites redirect ALL wheel input into horizontal scroll, which fights the user's actual intent to keep scrolling the page; prefer native `scroll-snap` and only intercept on unambiguous desktop wheel events, never on touch.

---

## Coverage summary (this pass)

## Site-level index (sites revisited for element crops)

| Site slug | URL | Types cropped (ok/attempted) | Screenshot folder |
|---|---|---|---|
| grafik-4 | https://grafik.co.nz | split-hero, media-hero (2/4) | refs4/sections/*/grafik-4.png |
| lpas | https://lpas.com | media-hero, scroll-effect (2/3) | refs4/sections/*/lpas.png |
| studio-merge | https://studio-merge.com | list-hero, work-bento, marquee (3/3) | refs4/sections/*/studio-merge.png |
| creativeans | https://creativeans.com | marquee, logos (2/2) | refs4/sections/*/creativeans.png |
| maria-vasilyeva-portfolio | https://mariavasilyeva.com | loader, marquee (2/2) | refs4/sections/*/maria-vasilyeva-portfolio.png |
| persona-studio | https://persona-studio.com | 3d-hero, dock-nav (2/2) | refs4/sections/*/persona-studio.png |
| huy-phan-vol-2 | https://huyml.co | scroll-effect (1/1) | refs4/sections/*/huy-phan-vol-2.png |
| khanh-nguyen-portfolio | https://khanhnguyen.design | side-rail-nav (1/1) | refs4/sections/*/khanh-nguyen-portfolio.png |
| little-plains | https://littleplains.com | video-hero (1/1) | refs4/sections/*/little-plains.png |
| mad-monkey | https://gomadmonkey.com | video-hero (1/1) | refs4/sections/*/mad-monkey.png |
| milan-compain | https://milancompain.com | 3d-hero (1/1) | refs4/sections/*/milan-compain.png |
| nexstudio | https://nexstudio.tech | 3d-hero (1/1) | refs4/sections/*/nexstudio.png |
| sasha-martynchuk | https://sashamartynchuk.com | none (0/1) | refs4/sections/*/sasha-martynchuk.png |
| senawa | https://senawastudio.com | work-horizontal (1/1) | refs4/sections/*/senawa.png |
| jcedrik-com | https://jcedrik.com | media-hero, about-bio, timeline, work-list, case-study-anatomy, scroll-effect (6/6) | refs4/sections/*/jcedrik-com.png |
| daiki-design-com | https://daiki-design.com | loader, footer-minimal (2/2) | refs4/sections/*/daiki-design-com.png |
| gobold-live | https://gobold.live | loader, 3d-hero (2/2) | refs4/sections/*/gobold-live.png |
| jordigarreta-com | https://jordigarreta.com | side-rail-nav, footer-minimal (2/2) | refs4/sections/*/jordigarreta-com.png |
| sly-clubop-site | https://sly.clubop.site | loader, video-hero (2/2) | refs4/sections/*/sly-clubop-site.png |
| illoca-unseen-co | https://illoca.unseen.co | dock-nav (1/1) | refs4/sections/*/illoca-unseen-co.png |
| zui-ooo | https://zui.ooo | dock-nav (1/1) | refs4/sections/*/zui-ooo.png |
| meech213-com | https://meech213.com | typographic-hero, work-grid, case-study-anatomy, footer-mega, split-hero, contact-cta, media-hero, sticky-stack, loader (9/9) | refs4/sections/*/meech213-com.png |
| momentum18-com-branding-html | https://momentum18.com | marquee, work-grid, split-hero, services, skills-stack, typographic-hero (6/6) | refs4/sections/*/momentum18-com-branding-html.png |
| andreigorskikh-digital | https://andreigorskikh.digital | case-study-anatomy, timeline, skills-stack (3/3) | refs4/sections/*/andreigorskikh-digital.png |
| kaiseisadatoki-v4-vercel-app-about | https://kaiseisadatoki-v4.vercel.app/about | about-bio, sticky-stack, footer-minimal (3/3) | refs4/sections/*/kaiseisadatoki-v4-vercel-app-about.png |
| gregorcollienne-com | https://gregorcollienne.com | custom-cursor, scroll-effect (2/2) | refs4/sections/*/gregorcollienne-com.png |
| madrepunk-com | https://madrepunk.com | FAILED: page.goto: net::ERR_CERT_DATE_INVALID at https://madrepunk.com/
Call log:
[2m  - navigating to "https://madrepunk.com/", waiting until "domcontentloaded"[22m
 | — |
| sohub-digital | https://sohub.digital | 3d-hero, work-bento (2/2) | refs4/sections/*/sohub-digital.png |
| ulrychkristian-cz | https://ulrychkristian.cz | testimonials, contact-cta (2/2) | refs4/sections/*/ulrychkristian-cz.png |
| billchien-net-grid | https://billchien.net/grid | scroll-effect (1/1) | refs4/sections/*/billchien-net-grid.png |
| bradyperron-com | https://bradyperron.com | custom-cursor (1/1) | refs4/sections/*/bradyperron-com.png |
| junkbranding-com | https://junkbranding.com | custom-cursor (1/1) | refs4/sections/*/junkbranding-com.png |
| linkaproduction-com | https://linkaproduction.com | video-hero (1/1) | refs4/sections/*/linkaproduction-com.png |
| madeinmay-studio | https://madeinmay.studio | side-rail-nav (1/1) | refs4/sections/*/madeinmay-studio.png |
| verteal-com | https://verteal.com | process (1/1) | refs4/sections/*/verteal-com.png |
| brittany-chiang | https://brittanychiang.com | split-hero, about-bio, timeline, work-list (4/4) | refs4/sections/*/brittany-chiang.png |
| josh-comeau | https://joshwcomeau.com | blog-notes, list-hero (2/2) | refs4/sections/*/josh-comeau.png |
| rauno-freiberg | https://rauno.me | custom-cursor, work-horizontal (2/2) | refs4/sections/*/rauno-freiberg.png |
| lynn-fisher | https://lynnandtonic.com | list-hero (1/1) | refs4/sections/*/lynn-fisher.png |
| 125-27131610-streetlight-films-cinematic-production-studio-website-design | https://dribbble.com/shots/27131610-Streetlight-Films-Cinematic-Production-Studio-Website-Design | testimonials, blog-notes, contact-cta (3/3) | refs4/sections/*/125-27131610-streetlight-films-cinematic-production-studio-website-design.png |
| 164-27382422-footer-design-web-footer-navigation-footer-navigation-design | https://dribbble.com/shots/27382422-Footer-Design-Web-Footer-Navigation-Footer-Navigation-Design | footer-mega, contact-cta (2/2) | refs4/sections/*/164-27382422-footer-design-web-footer-navigation-footer-navigation-design.png |
| 002-27559314-em-minimalist-clean-designer-service-process-personal-website | https://dribbble.com/shots/27559314-EM-Minimalist-Clean-Designer-Service-Process-Personal-Website | process (1/1) | refs4/sections/*/002-27559314-em-minimalist-clean-designer-service-process-personal-website.png |
| 007-27288946-jh-editorial-art-director-portfolio-personal-website-ui-design | https://dribbble.com/shots/27288946-JH-Editorial-Art-Director-Portfolio-Personal-Website-UI-Design | process (1/1) | refs4/sections/*/007-27288946-jh-editorial-art-director-portfolio-personal-website-ui-design.png |
| 074-25560298-fh-clean-modern-architect-interior-designer-portfolio-website | https://dribbble.com/shots/25560298-FH-Clean-Modern-Architect-Interior-Designer-Portfolio-Website | footer-mega (1/1) | refs4/sections/*/074-25560298-fh-clean-modern-architect-interior-designer-portfolio-website.png |
| 169-27643961-minima-footer-contact-section | https://dribbble.com/shots/27643961-Minima-Footer-Contact-Section | footer-mega (1/1) | refs4/sections/*/169-27643961-minima-footer-contact-section.png |
| 076-27534133-engineering-scalable-web-architecture-developer-portfolio | https://dribbble.com/shots/27534133-Engineering-Scalable-Web-Architecture-Developer-Portfolio | typographic-hero, services, timeline, work-grid, video-hero (5/5) | refs4/sections/*/076-27534133-engineering-scalable-web-architecture-developer-portfolio.png |
| 090-27076150-modern-developer-portfolio-website | https://dribbble.com/shots/27076150-Modern-Developer-Portfolio-Website | typographic-hero, stats, services, testimonials, contact-cta (5/5) | refs4/sections/*/090-27076150-modern-developer-portfolio-website.png |
| 011-24120347-personal-portfolio-website | https://dribbble.com/shots/24120347-Personal-Portfolio-Website | split-hero, services, stats, skills-stack (4/4) | refs4/sections/*/011-24120347-personal-portfolio-website.png |
| 065-27252085-agency-portfolio-website | https://dribbble.com/shots/27252085-Agency-Portfolio-Website | media-hero, logos, work-grid, testimonials (4/4) | refs4/sections/*/065-27252085-agency-portfolio-website.png |
| 035-16077352-personal-portfolio-site-bruno-erdison | https://dribbble.com/shots/16077352-Personal-Portfolio-Site-Bruno-Erdison | about-bio, skills-stack, stats (3/3) | refs4/sections/*/035-16077352-personal-portfolio-site-bruno-erdison.png |
| 093-25292802-web-developer-portfolio-landing-page | https://dribbble.com/shots/25292802-Web-Developer-portfolio-Landing-page | about-bio, skills-stack, timeline (3/3) | refs4/sections/*/093-25292802-web-developer-portfolio-landing-page.png |
| 044-25782403-portfolio-website-landing-page-for-framer-built-with-frameblox | https://dribbble.com/shots/25782403-Portfolio-website-landing-page-for-Framer-built-with-Frameblox | work-bento, logos (2/2) | refs4/sections/*/044-25782403-portfolio-website-landing-page-for-framer-built-with-frameblox.png |
| 050-27293078-ui-ux-design-for-design-portfolio-website | https://dribbble.com/shots/27293078-UI-UX-Design-for-Design-Portfolio-Website | dock-nav (1/1) | refs4/sections/*/050-27293078-ui-ux-design-for-design-portfolio-website.png |
| 088-5990091-developer-portfolio-v3 | https://dribbble.com/shots/5990091-Developer-Portfolio-V3 | magnetic-nav (1/1) | refs4/sections/*/088-5990091-developer-portfolio-v3.png |
| basement-studio | https://basement.studio | logos, work-list, case-study-anatomy (3/3) | refs4/sections/*/basement-studio.png |
| codrops | https://tympanus.net/codrops | work-bento, blog-notes (2/2) | refs4/sections/*/codrops.png |
| codrops-css-reference | https://tympanus.net/codrops/css_reference | list-hero, work-bento (2/2) | refs4/sections/*/codrops-css-reference.png |
| active-theory | https://activetheory.net | custom-cursor (1/1) | refs4/sections/*/active-theory.png |
| vercel | https://vercel.com | list-hero (1/1) | refs4/sections/*/vercel.png |
| arcoglobal-com | https://arcoglobal.com | work-grid, logos, process, stats, blog-notes, footer-mega (6/6) | refs4/sections/*/arcoglobal-com.png |
| crency-agency | https://crency.agency | typographic-hero, services, work-list, testimonials, footer-minimal (5/5) | refs4/sections/*/crency-agency.png |
| thenest-pl | https://thenest.pl/en | side-rail-nav, stats, blog-notes (3/3) | refs4/sections/*/thenest-pl.png |
| khanhnguyen-design | https://khanhnguyen.design | side-rail-nav, work-horizontal (2/2) | refs4/sections/*/khanhnguyen-design.png |
| senawastudio-com | https://senawastudio.com | work-horizontal, footer-minimal (2/2) | refs4/sections/*/senawastudio-com.png |
| cuberto | https://cuberto.com | fullscreen-menu, page-transition, magnetic-nav (3/3) | refs4/sections/*/cuberto.png |
| clay-global | https://clay.global | page-transition, sticky-stack (2/3) | refs4/sections/*/clay-global.png |
| lusion | https://lusion.co | fullscreen-menu, page-transition (2/2) | refs4/sections/*/lusion.png |
| resn | https://www.resn.co.nz | magnetic-nav (1/2) | refs4/sections/*/resn.png |
| locomotive | https://locomotive.ca | sticky-stack (1/2) | refs4/sections/*/locomotive.png |
| active-theory-menu | https://activetheory.net | none (0/2) | refs4/sections/*/active-theory-menu.png |
| dogstudio-menu | https://dogstudio.co | fullscreen-menu, magnetic-nav (2/2) | refs4/sections/*/dogstudio-menu.png |
| basement-studio-menu | https://basement.studio | sticky-stack, footer-playful (2/3) | refs4/sections/*/basement-studio-menu.png |
| obys | https://obys.agency | page-transition (1/2) | refs4/sections/*/obys.png |
| hello-monday-footer | https://hellomonday.com | footer-playful, magnetic-nav (2/2) | refs4/sections/*/hello-monday-footer.png |
| bruno-simon | https://bruno-simon.com | footer-playful (1/1) | refs4/sections/*/bruno-simon.png |
| robin-noguier | https://www.robin-noguier.com | footer-playful, sticky-stack (2/2) | refs4/sections/*/robin-noguier.png |
| jimmy-chion | https://www.jimmychion.com | footer-playful (1/1) | refs4/sections/*/jimmy-chion.png |
| codrops-magnetic | https://tympanus.net/codrops | magnetic-nav, sticky-stack (2/2) | refs4/sections/*/codrops-magnetic.png |
| studio-freight | https://studiofreight.com | page-transition, sticky-stack, footer-playful (3/3) | refs4/sections/*/studio-freight.png |

## Per-type coverage achieved

| Type | Examples captured | Folder |
|---|---|---|
| typographic-hero | 5 (meech213-com, momentum18-com-branding-html, 076-27534133-engineering-scalable-web-architecture-developer-portfolio, 090-27076150-modern-developer-portfolio-website, crency-agency) | refs4/sections/typographic-hero/ |
| split-hero | 5 (grafik-4, meech213-com, momentum18-com-branding-html, brittany-chiang, 011-24120347-personal-portfolio-website) | refs4/sections/split-hero/ |
| media-hero | 5 (grafik-4, lpas, jcedrik-com, meech213-com, 065-27252085-agency-portfolio-website) | refs4/sections/media-hero/ |
| video-hero | 5 (little-plains, mad-monkey, sly-clubop-site, linkaproduction-com, 076-27534133-engineering-scalable-web-architecture-developer-portfolio) | refs4/sections/video-hero/ |
| 3d-hero | 5 (persona-studio, milan-compain, nexstudio, gobold-live, sohub-digital) | refs4/sections/3d-hero/ |
| list-hero | 5 (studio-merge, josh-comeau, lynn-fisher, codrops-css-reference, vercel) | refs4/sections/list-hero/ |
| magnetic-nav | 6 (088-5990091-developer-portfolio-v3, cuberto, resn, dogstudio-menu, hello-monday-footer, codrops-magnetic) | refs4/sections/magnetic-nav/ |
| dock-nav | 4 (persona-studio, illoca-unseen-co, zui-ooo, 050-27293078-ui-ux-design-for-design-portfolio-website) | refs4/sections/dock-nav/ |
| side-rail-nav | 5 (khanh-nguyen-portfolio, jordigarreta-com, madeinmay-studio, thenest-pl, khanhnguyen-design) | refs4/sections/side-rail-nav/ |
| fullscreen-menu | 3 (cuberto, lusion, dogstudio-menu) | refs4/sections/fullscreen-menu/ |
| about-bio | 5 (jcedrik-com, kaiseisadatoki-v4-vercel-app-about, brittany-chiang, 035-16077352-personal-portfolio-site-bruno-erdison, 093-25292802-web-developer-portfolio-landing-page) | refs4/sections/about-bio/ |
| services | 5 (momentum18-com-branding-html, 076-27534133-engineering-scalable-web-architecture-developer-portfolio, 090-27076150-modern-developer-portfolio-website, 011-24120347-personal-portfolio-website, crency-agency) | refs4/sections/services/ |
| work-list | 4 (jcedrik-com, brittany-chiang, basement-studio, crency-agency) | refs4/sections/work-list/ |
| work-grid | 5 (meech213-com, momentum18-com-branding-html, 076-27534133-engineering-scalable-web-architecture-developer-portfolio, 065-27252085-agency-portfolio-website, arcoglobal-com) | refs4/sections/work-grid/ |
| work-bento | 5 (studio-merge, sohub-digital, 044-25782403-portfolio-website-landing-page-for-framer-built-with-frameblox, codrops, codrops-css-reference) | refs4/sections/work-bento/ |
| work-horizontal | 4 (senawa, rauno-freiberg, khanhnguyen-design, senawastudio-com) | refs4/sections/work-horizontal/ |
| sticky-stack | 8 (meech213-com, kaiseisadatoki-v4-vercel-app-about, clay-global, locomotive, basement-studio-menu, robin-noguier, codrops-magnetic, studio-freight) | refs4/sections/sticky-stack/ |
| case-study-anatomy | 4 (jcedrik-com, meech213-com, andreigorskikh-digital, basement-studio) | refs4/sections/case-study-anatomy/ |
| logos | 5 (creativeans, 065-27252085-agency-portfolio-website, 044-25782403-portfolio-website-landing-page-for-framer-built-with-frameblox, basement-studio, arcoglobal-com) | refs4/sections/logos/ |
| testimonials | 5 (ulrychkristian-cz, 125-27131610-streetlight-films-cinematic-production-studio-website-design, 090-27076150-modern-developer-portfolio-website, 065-27252085-agency-portfolio-website, crency-agency) | refs4/sections/testimonials/ |
| process | 4 (verteal-com, 002-27559314-em-minimalist-clean-designer-service-process-personal-website, 007-27288946-jh-editorial-art-director-portfolio-personal-website-ui-design, arcoglobal-com) | refs4/sections/process/ |
| timeline | 5 (jcedrik-com, andreigorskikh-digital, brittany-chiang, 076-27534133-engineering-scalable-web-architecture-developer-portfolio, 093-25292802-web-developer-portfolio-landing-page) | refs4/sections/timeline/ |
| stats | 5 (090-27076150-modern-developer-portfolio-website, 011-24120347-personal-portfolio-website, 035-16077352-personal-portfolio-site-bruno-erdison, arcoglobal-com, thenest-pl) | refs4/sections/stats/ |
| skills-stack | 5 (momentum18-com-branding-html, andreigorskikh-digital, 011-24120347-personal-portfolio-website, 035-16077352-personal-portfolio-site-bruno-erdison, 093-25292802-web-developer-portfolio-landing-page) | refs4/sections/skills-stack/ |
| blog-notes | 5 (josh-comeau, 125-27131610-streetlight-films-cinematic-production-studio-website-design, codrops, arcoglobal-com, thenest-pl) | refs4/sections/blog-notes/ |
| contact-cta | 5 (meech213-com, ulrychkristian-cz, 125-27131610-streetlight-films-cinematic-production-studio-website-design, 164-27382422-footer-design-web-footer-navigation-footer-navigation-design, 090-27076150-modern-developer-portfolio-website) | refs4/sections/contact-cta/ |
| footer-mega | 5 (meech213-com, 164-27382422-footer-design-web-footer-navigation-footer-navigation-design, 074-25560298-fh-clean-modern-architect-interior-designer-portfolio-website, 169-27643961-minima-footer-contact-section, arcoglobal-com) | refs4/sections/footer-mega/ |
| footer-minimal | 5 (daiki-design-com, jordigarreta-com, kaiseisadatoki-v4-vercel-app-about, crency-agency, senawastudio-com) | refs4/sections/footer-minimal/ |
| footer-playful | 6 (basement-studio-menu, hello-monday-footer, bruno-simon, robin-noguier, jimmy-chion, studio-freight) | refs4/sections/footer-playful/ |
| loader | 5 (maria-vasilyeva-portfolio, daiki-design-com, gobold-live, sly-clubop-site, meech213-com) | refs4/sections/loader/ |
| custom-cursor | 5 (gregorcollienne-com, bradyperron-com, junkbranding-com, rauno-freiberg, active-theory) | refs4/sections/custom-cursor/ |
| page-transition | 5 (cuberto, clay-global, lusion, obys, studio-freight) | refs4/sections/page-transition/ |
| scroll-effect | 5 (lpas, huy-phan-vol-2, jcedrik-com, gregorcollienne-com, billchien-net-grid) | refs4/sections/scroll-effect/ |
| marquee | 4 (studio-merge, creativeans, maria-vasilyeva-portfolio, momentum18-com-branding-html) | refs4/sections/marquee/ |

**Totals:** 167 element screenshots saved across 34 section types; 27/34 types reached >=5 examples, 34/34 types have >=1 example (across 79 unique sites revisited).

