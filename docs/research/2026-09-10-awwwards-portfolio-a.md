# Lens A — Awwwards "Portfolio" listing (pages 1-3)

Source: `https://www.awwwards.com/websites/portfolio/` pages 1, 2, 3 → 93 unique `/sites/<slug>` detail pages collected → each detail page opened to resolve the live outbound URL → 32 live sites opened, screenshotted and read (target was ≥25; stopped at 32 with a 100% hit rate, no captchas/dead sites hit in this batch — the remaining 61 uncaptured slugs are listed at the bottom for a follow-up pass if needed).

Capture rig: Playwright/Chromium (`chrome-win64` build), 1440×900 viewport, real Chrome UA, domcontentloaded + 3s settle before shooting, 1.5s between page loads, ≥2s between requests to the same host. Shots saved under `refs4/awwwards-portfolio-a/<site-slug>/` as `full.png` (full page), `vp-0.png`, `vp-35.png`, `vp-70.png` (viewport at 0/35/70% scroll depth). Text pulled via `document.body.innerText`.

All screenshot paths below are relative to:
`C:\Users\Usuario\AppData\Local\Temp\claude\C--Users-Usuario-Desktop-P-Github-Digitdeck\75fa9a07-350d-4734-9d2e-ac255cc6dd8f\scratchpad\refs4\awwwards-portfolio-a\`

---

## 1. Site table (32 captured)

| # | Site slug (dir) | Live URL | Author / studio | What it is | Why it matters |
|---|---|---|---|---|---|
| 1 | `arturo-spatino` | arturospatino.com | Arturo Spatino | Product designer solo portfolio | Split hero (duotone portrait + serif/sans mixed headline); scroll-reveal sections currently empty until scrolled into view — good negative example of un-primed reveals |
| 2 | `creativeans` | creativeans.com | Creativeans (agency) | Brand/AI agency site | Marquee announcement ribbon at the very top; soft aurora/gradient blob glow behind hero type; italic serif accent word inside a sans headline; logo bar "AS FEATURED IN"; mute toggle |
| 3 | `milan-compain` | milancompain.com | Milan Compain | Design/motion/front-end freelancer | Particle constellation logo mark (canvas dust inside a picture-frame rectangle) double-exposed with giant ghost wordmark type; Awwwards "Nominee" ribbon tab pinned to viewport edge |
| 4 | `vilendesign` | vilendesign.com | Vilen Rodeski | Design-leadership portfolio (ex-PayPal) | Light/dark theme switch; case list with one-line data-viz/branding blurbs; "Archive" grid of small app-icon + thumbnail rows |
| 5 | `khanh-nguyen-portfolio` | khanhnguyen.design | Khanh Nguyen | "FOLIO — EDITION" personal site | Chapter-based structure ("CHAPTER I — QUICK INTRO"); a vertical column of years 13→26 as a visual timeline/index; live local clock (HCMC GMT+7); "open for collaborations" status pill |
| 6 | `dsgn-interior` | dsgninterior.se | dsgn Interior | Interior architecture studio | Editorial project write-ups with large environment photography; quiet, restrained type |
| 7 | `https-aquirin-com` | aquirin.com | Aquirin | Minimal single-viewport site | Essentially just a logo/contact — good "avoid" example (empty text, near-blank single screen) |
| 8 | `redouane-oumahi` | oumahi.art | Redouane Oumahi | "Cutout Citizens" art/fashion project | Full 3D drag-to-rotate scene of file folders ("FILE 001..041") you spin like a rolodex; live HH:MM:SS clock overlay; "click subject to open file" |
| 9 | `persona-studio` | persona-studio.com | Persona Studio | Agency-as-3D-city | Fully navigable Three.js **3D city**: drag to orbit/pan/zoom, "Enter First-Person" mode, buildings literally ARE the nav (About/Services/Work), an onboarding guide character ("JUNE") walks you through it |
| 10 | `huy-phan-vol-2` | huyml.co | Huy Phan | Award-magnet freelance portfolio (Vol.2) | Case index with role/launch/recognition meta block per project; numbered "01/19" project counter |
| 11 | `senawa` | senawastudio.com | Senawa | Architecture studio | **Horizontal-scroll single-viewport** hero: a filmstrip of interior photos scrolls sideways with year+category captions and an active-thumbnail progress bar at the bottom; Awwwards "W. Nominee" ribbon |
| 12 | `gionatan-nese-26` | gionatannese.com | Gionatan Nese | Multi-disciplinary designer | "Click to enable audio" gate; numbered nav (1 Projects / 2 About / 3 Contact) |
| 13 | `three-js-game-gallery-dian-noy-you-ji-chang` | amix-design.com/tl/web-g-threejs | amix-design | Free browser 3D game arcade | Full WebGL neon synthwave city with floating 3D game-cabinet screens; "3D ON/OFF" perf toggle + "Motion Gallery" fallback link; huge glowing gradient kinetic type |
| 14 | `remedy` | remedyeditorial.com | Remedy | Video production co. | Standard cookie-consent-gated agency site; unremarkable baseline |
| 15 | `allhaus` | moderncraftaz.com | AllHaus | Real-estate/build studio | **Location-picker hero**: select AZ/CO/MT to filter following content — a geographic-state switch instead of a menu |
| 16 | `mad-monkey` | gomadmonkey.com | Mad Monkey | Video/storytelling agency | Repetitive "SEE MORE WORK" CTA tiling a long case grid — good "avoid" example (label spam, no variation) |
| 17 | `grigoletti` | grigoletti.ch | Dario Grigoletti | Framer expert / freelance dev | German-language sales-page structure; duplicated nav items (SSR/CSR hydration seam, worth avoiding) |
| 18 | `maria-vasilyeva-portfolio` | mariavasilyeva.com | Maria Vasilyeva | Visual/interactive designer | Numbered chronological project index with year ranges; explicit **Sound ON/OFF** and **Annotations ON/OFF** toggles; theatrical loading sequence ("loading the playlist… finding the right tune…") |
| 19 | `grafik-4` | grafik.co.nz | Nick de Jardine (Grafik) | Solo studio, longest page captured (29,298px) | Huge split hero (mono portrait + orange kinetic headline), sound-mute icon; **live visitor counter ("12 Online")**; a "Draw Something" collaborative canvas page and a public **guestbook** — genuinely unique community features |
| 20 | `untitled` | untitledfilm.framer.website | — (Framer template) | Film-agency index | Case rows with live local-time-zone clock per row (04:01 GMT+2), duration, year, studio name — an editorial "index as spec sheet" pattern |
| 21 | `studio-merge` | studio-merge.com | Merge (Porto) | Social-magazine-turned-studio | Numbered full-bleed nav (01 Work…06 Contacts) under a huge slab headline; a **tilted, overlapping marquee of poster-style case cards** scrolling horizontally behind the fold |
| 22 | `nexstudio` | nexstudio.tech | NexStudio | Digital design studio | Giant bold headline with a **glossy chrome/liquid-metal 3D blob** (shader-morphed torus) sitting on top of and reacting through the text |
| 23 | `little-plains` | littleplains.com | Little Plains | Minimal one-pager | Extremely sparse single line of copy — "avoid" example of under-built content |
| 24 | `paul-kalkbrenner` | paulkalkbrenner.net | Paul Kalkbrenner (artist) | Musician site | Photo inlined **inside** giant wordmark type ("Paul [photo] Kalkbrenner"); persistent bottom **"Now Playing" mini audio player** with waveform bars and a Sound ON/OFF switch |
| 25 | `signal-a-studio` | signal-a.studio | Signal-A Studio | Purpose-led brand studio | Vertical **stacked single-letter kinetic headline** (one glyph per line spelling a manifesto); dual-city live clocks (Warsaw/Berlin); each case study lists "Notable Recognitions" (Awwwards HM, CSS Winner SOTD) inline |
| 26 | `the-donut-studio` | donut-studio.com | The Donut Studio | Playful dev/design duo | **ASCII-art rendered logo** (a donut drawn entirely in yellow monospace characters on black, with floating stray glyphs like sparks) plus "tap PLAY for fun or scroll for work" — literal game-menu framing |
| 27 | `twks-1` | twks.ch/en | twks | Swiss creative agency (Geneva) | Clean manifesto copy ("when every brand follows the same codes, they all end up looking alike"); standard but well-organized nav taxonomy (branding/campaign/digital/insights) |
| 28 | `see-me` | seemecreative.com | See Me Creative | Full-service creative agency | Numbered nav (001-004); client case list uses a rotated "✛" glyph as a bullet/divider between client name and project type |
| 29 | `lpas` | lpas.com | LPAS | Architecture firm | Process stepper laid out as **4 words in the four corners around a single hex/beveled-clip photo** (Listen/Plan/Analyze/Shape) rather than a linear row |
| 30 | `sasha-martynchuk` | sashamartynchuk.com | Sasha Martynchuk | Staff product designer | "Click to copy email" micro-interaction with a toast ("Copied to clipboard!"); process framed as 3 short verbs (prioritize/listen/transform) |
| 31 | `pragadheeshs-showcase` | spragadheeshraj.com | Pragadheesh S | Personal showcase | **Device-motion permission gate** — hero images tilt-parallax via phone gyroscope; playful geo-callout card (coordinates + phonetic pronunciation of home city) |
| 32 | `sokolovski-pro` | sokolovski.pro | Evgeniy Sokolovski | Product designer (RU) | RU/EN language switch + light/dark switch in the header; a **live Behance-award badge widget** (count "5") pinned top-right; a "Фрагменты" (Fragments) strip described as literal deck-slide excerpts, numbered "343" |

Not yet captured this pass (remaining detail-page slugs, ready for a follow-up run if more references are wanted): the other 61 of 93 collected links live in `site-details.json` in the same folder (e.g. `arturospatino`-adjacent names like `dian-noy`, further agency/portfolio nominees) — none were dropped for captchas or dead loaders in the 32 attempted, so a second batch of 30 should have a similarly high hit rate.

---

## 2. Catalog — 27 reusable ideas for maxfolio

Each entry: **name** · what it looks like · which maxfolio section/theme it fits · implementation sketch · perf/a11y notes · reference.

### 1. Live-city status clock in the nav
**Looks like:** small live HH:MM(:SS) clock tied to the owner's timezone, sitting quietly in the header or hero corner, ticking in real time (khanh-nguyen shows `08:59` HCMC GMT+7; signal-a-studio shows two cities at once, Warsaw/Berlin; redouane-oumahi runs a full `HH:MM:SS` overlay).
**Fits:** Apple Clean hero eyebrow, or the contact section footer, across all themes as a persistent "still building things right now" touch.
**Sketch:** `setInterval` at 1s updating a `<time>` node via `Intl.DateTimeFormat` with explicit `timeZone`, mounted client-side only (avoid SSR hydration mismatch — see AVOID list). One line of state, no library.
**Perf/a11y:** negligible cost; wrap in `aria-live="off"` (a ticking clock read aloud every second is an accessibility hazard) and expose the static local city name as the accessible label instead.
**Reference:** `khanh-nguyen-portfolio/vp-0.png`, `signal-a-studio/full.png`.

### 2. Chapter-numbered scroll narrative ("CHAPTER I")
**Looks like:** sections are framed as book chapters (CHAPTER I — QUICK INTRO, etc.) with a persistent vertical list of years (13→26) acting as a mini index/progress rail down one side.
**Fits:** replaces or augments maxfolio's "years chart" — instead of a flat chart, frame the years as chapters of a career story with a sticky rail showing which "chapter" is active.
**Sketch:** a `position: sticky` rail of year labels; toggle an `is-active` class via `IntersectionObserver` on each chapter section; framer-motion `layoutId` to slide an underline indicator between active years.
**Perf/a11y:** IntersectionObserver is cheap; make the rail a `<nav aria-label="Career timeline">` with real links (`#chapter-3`) so it's keyboard-navigable, not just decorative.
**Reference:** `khanh-nguyen-portfolio/full.png`.

### 3. Numbered-glyph nav instead of a menu bar
**Looks like:** the primary nav is rendered as `01 Work / 02 About / 03 Playground / 04 Store / 05 Blog / 06 Contact` in the same weight as the headline, not tucked into a small top-right menu (studio-merge, see-me, gionatan-nese all do variants of this).
**Fits:** Brutalist and Apple Clean theme headers; also a strong fit for maxfolio's experience-split section as an in-page anchor rail.
**Sketch:** flex row of `<a>` with a `<span class="tabular-nums">01</span>` prefix; on hover, animate the number color/weight independent of the label via two nested spans.
**Perf/a11y:** trivial; keep real `<a href="#...">`, not `<button onClick>`, so it's a working same-page nav for keyboard/screen-reader users.
**Reference:** `studio-merge/vp-0.png`, `see-me` innerText.

### 4. Chrome liquid-metal blob morphing through headline type
**Looks like:** a glossy, chromatic-aberration metaball (torus-like) sits centered over/behind giant bold headline type and slowly rotates/deforms, visually "melting" into the letterforms as it passes over them (nexstudio).
**Fits:** Arcade or a new "Metal/Chrome" theme's hero; a showpiece 3D-on-scroll moment for the case-study sheet's opening frame.
**Sketch:** Three.js `MeshTransmissionMaterial` (or a simpler custom GLSL fresnel+chromatic-aberration shader) on a metaball/blob geometry (marching-cubes or a warped icosphere), rendered to a `<canvas>` absolutely positioned over the text with `mix-blend-mode: normal` and a transparent background; rotate via `useFrame` tied to scroll progress, not just autoplay.
**Perf/a11y:** heaviest item in this catalog — gate behind `prefers-reduced-motion` and a WebGL-capability check, lazy-mount only when the hero enters the viewport, cap devicePixelRatio at 1.5, and ship a static PNG fallback for low-end/mobile.
**Reference:** `nexstudio/vp-0.png`.

### 5. Full WebGL 3D scene as literal navigation ("3D city")
**Looks like:** the entire site is a navigable 3D environment (drag to orbit/pan, "Enter First-Person") where distinct buildings/objects ARE the About/Work/Contact destinations, with a friendly guide character walking new visitors through it (persona-studio).
**Fits:** far too heavy for the whole site, but the *idea* — an explorable diorama — fits a single showcase Easter-egg page ("Explore Themes" could literally be a tiny isometric room you walk through to pick a theme) rather than the main flow.
**Sketch:** react-three-fiber scene, orbit controls constrained to a small arc, raycasting on named meshes to trigger route changes, a single low-poly "guide" sprite with a canned dialogue sequence.
**Perf/a11y:** only justify this for a genuinely optional, clearly-labeled Easter egg; always ship a plain link list as the real, indexable, accessible navigation underneath/alongside it.
**Reference:** `persona-studio/vp-0.png`.

### 6. ASCII-art rendered logotype
**Looks like:** the brand mark (a donut) is drawn entirely out of monospace characters (`#`, `$`, `e`, `*`, `.`) in a single accent color on black, with a scattering of stray glyphs drifting around it like sparks — paired with playful copy: "tap PLAY for fun or scroll for work" (the-donut-studio).
**Fits:** Arcade theme hero — a perfect, on-brand, cheap-to-render alternative to a 3D model for a retro/game-menu identity.
<br>**Sketch:** precompute the ASCII map once (sample a source image's luminance into a character ramp, e.g. canvas `getImageData` → nearest char), render as a `<pre>` with a monospace font; animate by re-sampling a slowly-rotating source render or by shader-driven pseudo-random glyph swaps on a subset of cells each frame (CSS `content` swap via a tiny JS loop, throttled to 8-12fps to sell the "old terminal" feel cheaply).
**Perf/a11y:** cheap even on low-end devices (it's just text); mark the `<pre>` `aria-hidden="true"` and provide the real logo as an accessible-name image or text sibling.
**Reference:** `the-donut-studio/vp-0.png`.

### 7. Sound/annotations toggle pair (not just mute)
**Looks like:** two independent, clearly-labeled switches — "SOUND: ON/OFF" and "ANNOTATIONS: ON/OFF" — let the visitor opt into ambient music AND into extra contextual captions on hover (maria-vasilyeva); several other sites (grafik, creativeans, gionatan-nese, paul-kalkbrenner) gate audio behind an explicit click rather than autoplaying.
**Fits:** any theme's global header; "annotations" maps neatly onto maxfolio's stepper/skills sections as an optional "explain this decision" layer for recruiters who want more depth without cluttering the default view.
**Sketch:** two boolean atoms in context/localStorage; annotations toggle conditionally renders a `<Tooltip>`/inline caption layer already in the DOM (just class-toggled), so there's no layout shift when switched.
**Perf/a11y:** never autoplay audio (browsers block it anyway); toggles must be real `<button aria-pressed>` elements, and the annotation layer must not fight `prefers-reduced-motion`/screen readers when off.
**Reference:** `maria-vasilyeva-portfolio` innerText.

### 8. "Now Playing" persistent mini audio player with waveform
**Looks like:** a slim bar pinned to the bottom of the viewport shows "Now playing — Time To Dance" with small animated waveform bars and a Sound ON/OFF switch on the opposite corner, present on every scroll position (paul-kalkbrenner).
**Fits:** a personality touch for the contact/footer band across themes — e.g. "currently building: <project>" or a soft ambient soundtrack per theme (Arcade could use 8-bit chiptune bars).
**Sketch:** fixed-position flex bar, CSS-only animated bars (`@keyframes` scaleY on 4-5 `<span>`s with staggered `animation-delay`), driven by real `<audio>` element state, not decorative-only.
**Perf/a11y:** must be fully optional/off by default per the sound-toggle pattern above; waveform bars are decorative (`aria-hidden`), the real state is announced via the button's `aria-pressed`/label text.
**Reference:** `paul-kalkbrenner/vp-0.png`.

### 9. Marquee announcement ribbon above the header
**Looks like:** a horizontally auto-scrolling ticker sits above the actual navbar carrying a promo/status line, distinct from the in-page project ticker (creativeans: "Brand Transformation for Businesses… Limited Time Only").
**Fits:** maxfolio's existing ticker section, but repositioned as a slim always-on strip above the header carrying rotating one-liners ("Open to senior Shopify/Remix roles" / "Last shipped: <date>") rather than a mid-page block.
**Sketch:** duplicate the content once, animate `transform: translateX` in a seamless loop via CSS `@keyframes` (no JS needed) at ~40-60s per loop for legibility; pause on hover/focus.
**Perf/a11y:** pure CSS transform is compositor-only (cheap); must pause automatically under `prefers-reduced-motion: reduce` and expose the same content statically for reduced-motion users, not hide it.
**Reference:** `creativeans/vp-0.png`.

### 10. Tilted, overlapping marquee of poster-style case cards
**Looks like:** below the fold, a horizontal band of case-study cards — each a full-bleed photo/poster treatment, some rotated a few degrees off-axis, overlapping their neighbors — scrolls continuously as a ticker rather than sitting in a static grid (studio-merge).
**Fits:** maxfolio's gallery carousel — swap the current flat carousel for this "stacked, tilted deck" treatment for extra visual energy in Brutalist/Luxury themes.
**Sketch:** flex row with `will-change: transform`, each card `rotate(var(--tilt))` where `--tilt` is a small per-card CSS custom property (`-3deg, 2deg, -1deg…`), infinite marquee via translateX keyframes; z-index/negative margins create the overlap.
**Perf/a11y:** GPU-composited transforms only; duplicate the node list for seamless looping instead of resetting scroll position (avoids jank); ensure the underlying case list still exists as a normal, tab-reachable grid for reduced-motion/keyboard users.
**Reference:** `studio-merge/vp-0.png`.

### 11. Live visitor counter + guestbook + collaborative canvas
**Looks like:** a small "12 Online." live count sits in the footer nav alongside links to a public "Draw Something" collaborative canvas and a guestbook page (grafik).
**Fits:** a genuinely differentiated Digitdeck-portfolio touch — a tiny "N engineers browsing this portfolio right now" counter, or a lightweight guestbook for recruiters/peers to leave a note.
**Sketch:** counter via a WebSocket or polling presence endpoint (Platform already has infra for this — reuse rather than building a new backend, per the "check before building" house rule); guestbook as a simple moderated form → stored entries list.
**Perf/a11y:** presence pings should be low-frequency (10-30s), not a busy socket; guestbook needs basic spam protection (honeypot/rate-limit) before any public write path ships.
**Reference:** `grafik-4` innerText, `grafik-4/full.png`.

### 12. Case-row "spec sheet" index (index-as-metadata table)
**Looks like:** each project in an index list is captioned like a film credit or spec sheet: live local time for that project's location, medium ("FILM"/"COLLABORATION"), duration, year, and studio name, all in a single dense row (untitled/Framer template); huy-phan pairs each case with Role/Launch/Recognition meta.
**Fits:** maxfolio's storefront index + case-study sheet — replace plain title+thumbnail rows with this denser metadata line (stack, launch date, role, recognitions) for a more "production credits" feel that reads as senior/considered.
**Sketch:** CSS grid row template `[title][location][medium][duration][year]`, each project's data comes from existing case-study frontmatter — no new content model needed, just a richer row renderer.
**Perf/a11y:** static markup, zero extra cost; make sure the dense row still passes as one semantic `<li>`/link so screen readers announce it as one item, not five fragments.
**Reference:** `untitled/vp-0.png` (innerText), `huy-phan-vol-2` innerText.

### 13. Notable-recognitions inline badge list per case study
**Looks like:** under each case study, a compact list of the actual awards it won ("AWWWARDS: HONORABLE MENTION", "CSS WINNER: SITE OF THE DAY") rendered as plain tagged text, not fake badges (signal-a-studio).
**Fits:** maxfolio's case-study sheet — a place to honestly list real, verifiable outcomes per project (metrics, launches, press) rather than invented praise — consistent with the "real numbers only" brief and the house's anti-fabrication stance.
**Sketch:** a small `recognitions: string[]` field per case entry, rendered as a plain unordered list styled as inline chips.
**Perf/a11y:** none — this is content, not effect; only ever populate with true, sourced facts.
**Reference:** `signal-a-studio` innerText.

### 14. Corner-quadrant process stepper (not a linear row)
**Looks like:** a 4-step process is laid out as one word in each of the four corners around a single centered photo with a beveled/clipped edge, rather than 4 boxes in a horizontal row (lpas: Listen / Plan / Analyze / Shape).
**Fits:** maxfolio's process stepper section — an alternate, more editorial layout option for the Luxury/Soft UI themes.
**Sketch:** CSS grid `grid-template-areas` with the photo spanning the center 2×2 and each word absolutely/grid-placed in a corner cell; the photo uses a `clip-path: polygon(...)` bevel cut on one corner.
**Perf/a11y:** static layout, no extra cost; keep the DOM order logical (step 1→4) even though the visual placement is a diamond, so tab order matches reading order.
**Reference:** `lpas/vp-0.png`.

### 15. "Click to copy email" micro-interaction with toast
**Looks like:** the contact email itself is the click target; clicking copies it to the clipboard and shows a small inline "Copied to clipboard!" confirmation (sasha-martynchuk).
**Fits:** maxfolio's contact section, replacing/augmenting a plain `mailto:` link.
**Sketch:** `navigator.clipboard.writeText`, with a `mailto:` `href` still present as the real link (so it still "just works" if JS/clipboard API is unavailable); toast via a simple timed state flag.
**Perf/a11y:** trivial cost; announce the copy confirmation via `aria-live="polite"`, and never remove the underlying real link (progressive enhancement, not replacement).
**Reference:** `sasha-martynchuk` innerText.

### 16. Device-motion tilt-parallax hero (mobile only)
**Looks like:** on a phone, the hero images shift with a gyroscope-driven parallax; the effect is gated behind an explicit "ENABLE MOTION / SKIP" permission prompt because iOS requires a user gesture to request `DeviceOrientationEvent` permission (pragadheesh's-showcase).
**Fits:** maxfolio's mobile experience-split or hero, as an opt-in enhancement layer only on the 390×844 mobile lens, never forced.
**Sketch:** feature-detect `DeviceOrientationEvent.requestPermission` (iOS 13+), show the prompt only there; map `beta`/`gamma` to small `translate3d` offsets on 2-3 layered images (parallax depth), clamp the range so it never causes layout shift.
**Perf/a11y:** must have a `SKIP` path that leaves the static hero fully functional (never gate content behind granting motion access); heavy on battery if unthrottled — sample at ~15-20fps via `requestAnimationFrame` gating, not on every event.
**Reference:** `pragadheeshs-showcase` innerText.

### 17. Geo-callout micro-card (coordinates + phonetic pronunciation)
**Looks like:** a small card states the owner's home city with its lat/long coordinates and a phonetic pronunciation guide ("koh · im · buh · tore") — a charming, specific personal detail (pragadheesh's-showcase).
**Fits:** maxfolio's contact/about area as a small personality beat, using Max's real city/coordinates — real facts only, not decoration for its own sake.
**Sketch:** a static small card component, no interactivity required.
**Perf/a11y:** none.
**Reference:** `pragadheeshs-showcase` innerText.

### 18. Geographic-state picker as the primary hero interaction
**Looks like:** instead of a menu, the hero itself asks you to pick a state (AZ/CO/MT) and the whole page's content set changes accordingly (allhaus).
**Fits:** a novel pattern for a "choose your theme" landing framing — instead of a plain theme switcher, invite the visitor to pick a working style/mood (Apple Clean / Brutalist / Arcade / …) as the very first hero interaction rather than a settings menu.
**Sketch:** the picker itself is just large toggle buttons; selecting one crossfades/re-renders the section below via a controlled state, reusing the same "explore themes" routing maxfolio already has.
**Perf/a11y:** ensure the picker is real `<button role="radio">`/`<a>` elements with clear focus states, not click-only divs.
**Reference:** `allhaus/vp-0.png`.

### 19. Dual live-clock header for a two-city studio
**Looks like:** two ticking local-time clocks side by side, each labeled by city (Warsaw / Berlin), communicating "we work across time zones" without a paragraph of text (signal-a-studio).
**Fits:** if maxfolio ever frames Max as available across time zones for remote roles, this is a compact, factual way to say so.
**Sketch:** same clock primitive as idea #1, rendered twice with different `timeZone` values.
**Perf/a11y:** same as #1 — `aria-live="off"`, real facts only.
**Reference:** `signal-a-studio/full.png`.

### 20. Behance/GitHub live badge widget
**Looks like:** a small pinned card in the header shows a live external-platform stat (Behance "5 awards") with a link out (sokolovski.pro).
**Fits:** a real, verifiable stat widget for maxfolio's stat band — e.g. live GitHub contribution count, a real Shopify Partner badge, or actual client-count/years-shipped number pulled from a real source, not invented.
**Sketch:** server-side fetch (cached, revalidated periodically) of the public API for the platform in question, rendered as a small static card; never fake the number client-side.
**Perf/a11y:** cache aggressively (don't hit the third-party API on every page view); the badge must be a real link, and the count must reflect the real, current value or be clearly dated.
**Reference:** `sokolovski-pro/vp-0.png`.

### 21. Deck-slide "fragments" micro-gallery
**Looks like:** a strip of literal presentation-slide screenshots ("Фрагменты — slides from project presentations I worked on") with a running total count (343) next to the section title (sokolovski.pro).
**Fits:** a low-effort but high-signal proof-of-work section — real screenshots of real deliverables/decks, counted honestly, instead of another polished mockup grid.
**Sketch:** a horizontally scrollable strip of thumbnails (native `overflow-x: auto` + `scroll-snap-type`, matching maxfolio's native-scroll philosophy — no carousel library needed).
**Perf/a11y:** lazy-load thumbnails (`loading="lazy"`), provide real alt text per slide, ensure snap points are keyboard-scrollable.
**Reference:** `sokolovski-pro/vp-0.png`.

### 22. Photo inlined mid-wordmark
**Looks like:** a small photo sits literally inside a giant headline, between two words, at the same baseline height as the text ("Paul [photo] Kalkbrenner").
**Fits:** a striking, cheap hero variant for the Apple Clean or Luxury theme's typographic hero — inline a real headshot or a signature project screenshot mid-name.
**Sketch:** flex row with the photo as a fixed-height inline block matching the cap-height of the surrounding type, `object-fit: cover`, rounded or squared to match brand.
**Perf/a11y:** single optimized image, no JS; alt text describes the image meaningfully (not "photo").
**Reference:** `paul-kalkbrenner/vp-0.png`.

### 23. Particle-constellation logo double-exposed with ghost type
**Looks like:** a canvas of drifting light particles is contained inside a picture-frame rectangle, forming a glowing star/diamond mark, while a huge low-opacity "ghost" wordmark of the full name sits behind/through it at full page width (milan-compain).
**Fits:** a moody, premium hero option for the Luxury theme.
**Sketch:** a small particle system (a few hundred points, canvas 2D or a minimal WebGL point-cloud) confined to a bounded rect via clipping, layered under a large `opacity: 0.15-0.25` text element using `mix-blend-mode: screen` for the glow read.
**Perf/a11y:** cap particle count (≤300) and use canvas `requestAnimationFrame` with a visibility check to pause when scrolled off-screen; ghost text is decorative — mark `aria-hidden` with the real heading present as an accessible sibling.
**Reference:** `milan-compain/vp-0.png`.

### 24. Vertical stacked single-letter kinetic manifesto
**Looks like:** a manifesto phrase is rendered one letter per line, stacked vertically down the full page height, each letter potentially animating in as it scrolls into view (signal-a-studio).
**Fits:** a strong transition moment between two maxfolio sections — e.g. between the hero and the stat band — as a scroll-triggered manifesto break.
**Sketch:** split the phrase into a `<span>` per character stacked with `display:block`, animate `opacity`/`y` per-letter via framer-motion `whileInView` with a small stagger (`delayChildren`/`staggerChildren` ~0.03-0.05s).
**Perf/a11y:** small stagger animations on transform/opacity are compositor-cheap; ensure the phrase is still readable as one accessible string (`aria-label` on the wrapping element, individual letter spans `aria-hidden`).
**Reference:** `signal-a-studio` innerText.

### 25. Horizontal-scroll single-viewport project filmstrip
**Looks like:** the whole "portfolio index" is one 100vh section where the camera pans horizontally through project images as you scroll vertically, with a thin active-item progress bar fixed at the bottom (senawa).
**Fits:** directly matches the brain's canonical `horizontal-rail-carousel-standard.md` pattern — a strong candidate to reuse/extend for maxfolio's storefront index or gallery carousel as a scroll-hijack alternative to the current carousel.
**Sketch:** pin the section (`position: sticky`, height = N×100vh), map vertical scroll progress to horizontal `translateX` on the filmstrip via a `useScroll`+`useTransform` (framer-motion) or CSS `scroll-timeline` where supported; bottom progress bar width bound to the same progress value.
**Perf/a11y:** scroll-hijacking sections must still allow normal keyboard/Tab navigation to reach every project link in DOM order; provide a `prefers-reduced-motion` fallback that renders the same items as a normal vertical or native horizontal-scroll list instead of a pinned/hijacked one.
**Reference:** `senawa/vp-0.png`.

### 26. Autoplay-gated hero with explicit "enter/skip" gate
**Looks like:** an "ENTER" gate or an audio permission click-through sits before the main experience loads, rather than autoplaying music/motion immediately (redouane-oumahi's "ENTER", gionatan-nese's "Click to enable audio", maria-vasilyeva's loading sequence).
**Fits:** any theme that wants an ambient soundtrack or a heavier intro animation — this is the correct, consent-respecting way to gate it rather than forcing it.
**Sketch:** a single full-screen overlay button; on click, start audio/animation and unmount the overlay; persist the choice in `sessionStorage` so repeat visits in the same session don't re-gate.
**Perf/a11y:** the gate itself must be reachable and operable via keyboard/Enter, and the site must be fully usable (readable, navigable) for a visitor who declines/skips.
**Reference:** `redouane-oumahi` innerText, `gionatan-nese-26` innerText.

### 27. "As featured in" trust-logo strip pinned above the fold
**Looks like:** immediately below the hero CTA, a row of real press-mention logos (The Straits Times, Channel NewsAsia, detikcom, Tempo) sits quietly, not styled as a big "wall of logos" section further down the page (creativeans).
**Fits:** if/when maxfolio has real press or notable-employer logos to show, place a compact instance directly under the hero rather than only in a dedicated late section — this is a placement idea, not a truth-inflation one.
**Sketch:** a simple flex row of grayscale/monochrome SVG logos, `filter: grayscale(1)` with a hover color reveal.
**Perf/a11y:** SVGs with real `<title>`/alt text; only ever real, verifiable logos with permission to display them — never fabricated client/press marks (matches the house's hard rule against inventing claims/ratings).
**Reference:** `creativeans/vp-0.png`.

---

## 3. Avoid list

- **Empty scroll-reveal sections captured mid-transition** (`arturo-spatino`): "Info" and "Services" sections rendered as large blank white gaps in the first-load screenshot because their reveal animation hadn't triggered yet. Lesson for maxfolio: never let a section be visually empty before its trigger fires — reserve space with a low-opacity static placeholder, or trigger reveals earlier (larger IntersectionObserver rootMargin) so first paint never shows dead whitespace.
- **Near-blank single-viewport sites** (`aquirin.com`, `little-plains.com`): 26-116 characters of total page text, essentially just a logo and a contact link. Reads as unfinished, not minimal — a real portfolio needs enough substance to justify a visit even if the visual language is spare.
- **Repetitive, unvaried CTA labels tiling the whole page** (`mad-monkey`): "SEE MORE WORK" appears roughly 20+ times identically down the case grid. Vary CTA copy per project or drop the redundant repeated label entirely — it reads as templated rather than curated.
- **Duplicated nav items from an SSR/CSR hydration seam** (`grigoletti`): every nav label and CTA button appears twice in the extracted text (SERVICES/SERVICES, GESPRÄCH BUCHEN/GESPRÄCH BUCHEN) — almost certainly a hydration/duplicate-render bug rather than intentional design. Lesson: always diff `innerText` output for suspicious exact duplicates before shipping — it's a cheap, high-signal QA check maxfolio's own build should run.
- **Forced/blocking gates with no skip path**: several sites gate content behind ENTER/audio prompts; only acceptable when a genuine, reachable SKIP exists (see idea #26) — anything that traps the visitor behind a gate with no way past it is a hard usability failure, not a style choice.
- **Autoplaying sound or motion without consent**: none of the captured sites actually autoplayed audio (browsers block it), but several visibly build UI assuming it might — always ship muted-by-default with an explicit opt-in, never rely on the browser's autoplay block as the only safeguard.
- **Ticking live clocks announced to assistive tech**: a real risk if implemented carelessly — a `aria-live` region updating every second is one of the more disruptive screen-reader experiences possible. Any live-clock feature (#1, #19) must explicitly suppress live-region announcement.
- **Scroll-hijacked horizontal sections that break keyboard/Tab order**: the horizontal-filmstrip pattern (#25) and the tilted-marquee pattern (#10) are only worth adopting if the underlying DOM order still lets a keyboard user Tab through every item in a sane sequence — several of the observed sites likely fail this (not verifiable from screenshots alone; must be checked with an actual keyboard pass before shipping either pattern).
- **Heavy WebGL 3D as the *only* navigation** (`persona-studio`): impressive as a demo, but a fully 3D-only nav with no flat/indexable fallback is an SEO and accessibility dead end for a professional portfolio whose job is to get found and read quickly by recruiters — keep any such experience strictly additive/optional (see idea #5's caveat).
- **Inventing stats or badges**: every "real numbers only" instruction in this brief matters doubly here — ideas #13, #20, #21, #27 above are only legitimate with real, sourced, currently-true numbers/logos/awards. Never fabricate a counter, award, or client logo to match the aesthetic of what these sites show.
