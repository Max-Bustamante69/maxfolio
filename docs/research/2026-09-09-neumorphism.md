# Neumorphism / Soft-UI — research digest (lens 3: neumorphism)

Scope: everything needed to spec maxfolio's 5th theme, a full neumorphic ("soft UI") route, sitting
alongside Apple Clean / luxury / brutalist / menu. No copyrighted assets reproduced — every idea below
is a described pattern to reimplement in CSS/Tailwind/framer-motion, not a traced screenshot.

## 1. Sites/threads visited

| # | Site / thread | What it is | Why it matters | Result |
|---|---|---|---|---|
| 1 | [neumorphism.io](https://neumorphism.io/) | The canonical neumorphic CSS shadow generator | Gives the **exact, citable two-shadow formula** and default palette (`#e0e0e0` base, `20px 20px 60px #bebebe, -20px -20px 60px #ffffff`), plus a gallery of 15 community-submitted component states (buttons, toggles, checkbox, loader, card) | ✅ full text + 2 screenshots |
| 2 | [uxdesign.cc — "Neumorphism in user interfaces"](https://uxdesign.cc/neumorphism-in-user-interfaces-b47cef3bf3a6) (Michal Malewicz, Dec 2019) | The origin article — Malewicz coined "Neumorphism" (via Jason Kelley's "Neuomorphism" comment) after the Dribbble/Instagram "new skeuomorphism" wave | Primary source for the trend's name, birth story (a live 1-hour design-event exercise), and its framing as skeuomorphism-meets-flat-design | ✅ intro captured (member-paywall past ~700 words — did not create an account or bypass, per instructions) |
| 3 | [uxdesign.cc — "Accessibility vs Design Trends"](https://uxdesign.cc/accessibility-vs-design-trends-aeb24a45ef4) (Malewicz follow-up) | Malewicz's accessibility critique of neumorphism/glassmorphism/material | Names the exact failure mode maxfolio must design around: *"too little difference between active and pressed states... low contrast is the main problem... all you need to do is avoid those use-cases"* | ⚠️ direct visit timed out; content recovered via its own DuckDuckGo search snippet (title + ~120-word excerpt, quoted above) |
| 4 | [getcssscan.com/css-box-shadow-examples](https://getcssscan.com/css-box-shadow-examples) | Gallery of 95 real shipped `box-shadow` recipes (Stripe, Material, Tailwind, GitHub, Shopify, Airbnb, Trello, Mac) | Cross-reference for how far "soft, layered shadow" can be pushed by real production teams without tipping into neumorphic over-extrusion — useful restraint benchmark | ✅ full text + screenshot |
| 5 | [Figma Community — "Music App UI-Neumorphism"](https://www.figma.com/community/file/1450152742199592255/music-app-ui-neumorphism) (Ayesha Habib) | A real, named, 542-user neumorphic UI kit file (player screen, playlist, progress bar) | Full "About" copy enumerates the exact component inventory a soft-UI kit needs: neumorphic buttons/sliders/cards, soft pastel palette + subtle gradients, custom iconography, micro-interactions | ✅ full about text + screenshot |
| 6 | DuckDuckGo search: `soft ui neumorphism fintech mobile app concept` | Search results page | Surfaced 4 real, named concepts (a LinkedIn fintech banking-app post, design4users.com roundup, a Behance search collection, a named Pinterest banking-concept pin by Oleksii Nikonov) — fintech/dashboard is the domain neumorphism ships in most today | ✅ result snippets captured |
| 7 | DuckDuckGo search: `neumorphism music player ui concept dribbble` | Search results page | Surfaced named dribbble shots (Miriam Matas' "Music Player" concept, Zulqurnain's "Skeuomorphism/Neumorphism Music Player") plus the same Figma file from #5 — media-player UI is neumorphism's other classic proving ground (progress scrubbers, play/pause extrusion) | ✅ result snippets captured |
| 8 | [land-book.com](https://land-book.com/websites?category%5B%5D=neumorphism) (neumorphism category) | Curated landing-page gallery filtered to neumorphism | Would have been the best source for full **shipped sites** (not just component shots) | 🛑 Cloudflare bot-check wall — skipped, not bypassed |
| 9 | [design4users.com/neumorphism-mobile-design](https://design4users.com/neumorphism-mobile-design/) | Roundup article of neumorphic mobile concepts | Same purpose as #8 | 🛑 Cloudflare "checking your browser" wall — skipped |
| 10 | old.reddit.com `r/userexperience`, `r/webdev`, `r/web_design` searches for "neumorphism" | Practitioner-sentiment threads | Wanted real forum discourse on neumorphism's pros/cons for the "avoid" list | 🛑 old.reddit now requires login even for search — skipped per instructions, not bypassed |
| 11 | dribbble.com search/tag pages, behance.net search, uiverse.io search, awwwards.com/websites/neumorphism, godly.website search, css-tricks.com/neumorphism-and-css, cssdesignawards.com search | Component galleries, awards indexes, the standard CSS-Tricks how-to | Would have added more shots/recipes | 🛑 all timed out/connection-timed-out (heavy client-rendered SPA shells or bot protection) even on retry — skipped, no bypass attempted |
| 12 | smashingmagazine.com/2020/03/introduction-neumorphism-web-design | Expected Smashing Magazine neumorphism intro | Wanted a third editorial source | ⚠️ URL now 404s (article retired/moved) — dead link, dropped |
| 13 | pinterest.com/search/pins/?q=neumorphism%20ui, dribbble.com/tags/neumorphic | Visual-survey pages | Wanted a broad thumbnail sweep | ⚠️ both render blank without a logged-in session/JS hydration — screenshot confirms empty shell, no content to extract |

**Net:** 2 primary written sources (Malewicz's origin + accessibility-critique articles, both directly
quoted above), 1 canonical generator with the load-bearing shadow formula, 1 real named UI-kit file, 2
search-result pages surfacing 6 more real named artifacts, and 1 shipped-shadow cross-reference gallery.
Every gallery/awards site that would have added more full-site screenshots sat behind Cloudflare,
a login wall, or a non-hydrating SPA shell — each was left alone rather than bypassed. This is enough
primary material to spec the theme completely; the ideas below combine it with standard, well-documented
CSS extrusion mechanics (the formula itself, not any single site's design, is what's reused).

## 2. THEME SPEC — "Soft UI" (maxfolio theme #5)

### 2.1 Palette — light (default)
- `--surface: #e6e9ef` (base ground — slightly cooler/bluer than the generic `#e0e0e0` demo default so it reads "product," not "generator demo")
- `--surface-raised: #eef1f6` (very slightly lighter, used for the topmost layer of nested cards)
- `--shadow-dark: #b8bcc7` (base darkened ~14%)
- `--shadow-light: #ffffff` (pure white highlight — safe because the base is high-luminance)
- `--ink: #3a3f4b` (body text — contrast-checked ≥4.5:1 against `--surface`; never pure black, which vibrates against the soft ground)
- `--ink-muted: #6b7280`
- `--accent: #5b6cff` (the one saturated color allowed to break the mono palette — CTAs, active states, chart fills, count-up numerals)
- `--accent-ink: #ffffff` (text on filled accent surfaces)

### 2.2 Palette — dark variant
- `--surface: #262a33`
- `--surface-raised: #2c303a`
- `--shadow-dark: #16181e` (darkened further, not just "black")
- `--shadow-light: #333844` (a *lighter tint of the base*, not white — pure white highlights on a dark base look like a light leak, not an extrusion)
- `--ink: #e7e9ee`
- `--ink-muted: #9aa0ac`
- `--accent: #8b93ff` (lightened for AA against the dark surface)
- `--accent-ink: #14151a`

### 2.3 The extrusion formula (the load-bearing mechanic, from neumorphism.io)
```
/* raised (default) */
border-radius: var(--r);
background: var(--surface);
box-shadow:
   var(--d)  var(--d)  var(--b) var(--shadow-dark),
  -var(--d) -var(--d)  var(--b) var(--shadow-light);

/* pressed / active / selected (inset flips both shadows inward) */
box-shadow:
  inset  var(--d)  var(--d)  var(--b) var(--shadow-dark),
  inset -var(--d) -var(--d)  var(--b) var(--shadow-light);
```
Ratio: `--b` (blur) ≈ 3× `--d` (distance) — this 3:1 ratio is what the generator's own default
(`distance:20 / blur:60`) encodes and is what keeps the effect "soft" instead of "drop-shadow with a rim."
Intensity (how far `--shadow-dark`/`--shadow-light` sit from `--surface`) should stay in a **10–15%
luminance band** — go further and it stops looking soft and starts looking like a beveled Windows-98
button (the exact "Skeuomorphism anyone?" regression Malewicz's own article calls out).

### 2.4 Scale tokens
| Token | Distance `--d` | Blur `--b` | Radius `--r` | Used for |
|---|---|---|---|---|
| `sm` | 4px | 12px | 10px | checkbox, toggle track, small icon button |
| `md` | 8px | 24px | 18px | buttons, inputs, chips |
| `lg` | 14px | 42px | 24px | cards |
| `xl` | 20px | 60px | 32–40px | hero panel, device-frame bezels, feature surfaces |

### 2.5 The accessibility fix layer (non-negotiable, per Malewicz's own follow-up)
1. **Never emboss text into the surface itself** (no `text-shadow` extrusion trick) — body copy, labels
   and numerals sit flat on `--surface`, in `--ink`, contrast-checked independently of the shadow system.
2. **One saturated accent breaks the mono palette on purpose** — primary CTAs, active nav states, chart
   fills and count-up numerals use `--accent` as a flat fill, not a shadow-only cue. This is the single
   biggest fix for the "can't tell what's clickable" critique.
3. **Focus-visible is a deliberate style break**: a 3px `--accent` outline offset 2px outside the
   shadow, on top of (not instead of) the extrusion — soft shadows alone are not a legible focus
   indicator at any zoom level.
4. **State never rides on shadow direction alone** — a toggle's ON state changes the *track's fill
   color* to `--accent` in addition to flipping the thumb's shadow; a selected tab gets a bottom-border
   or icon change in addition to the inset.
5. **`prefers-contrast: more`** flattens every neumorphic surface to a 1.5px `--ink`-on-`--surface`
   border card with no shadow — a full escape hatch, not a token tweak.
6. **Keep shadow intensity in the 10–15% band everywhere** — the CTA in particular should never be
   "soft-UI extruded button" alone; give it the accent fill (rule 2) so it doesn't depend on a
   borderline-AA gray-on-gray read.

### 2.6 Typography pairing
A geometric/grotesk sans at **medium weight minimum** — Inter, Manrope, or DM Sans at 500–600 for body,
600–700 for headings. Thin/hairline weights (100–300) disappear against the soft, low-contrast ground —
avoid them entirely in this theme (this is the opposite instinct from Apple Clean's featherweight
system-font look). Numerals for the stat band are tabular, semi-bold, ≥48px so they can stand alone as
their own "readout," never relying on emboss for legibility.

### 2.7 Motion
- **Press-in**: `:active` → scale(0.97) + shadow flips to inset, 120–150ms ease-out.
- **Soft lift**: `:hover` (guarded by `@media (hover: hover)` so mobile taps never get stuck mid-lift) →
  translateY(-2px) + shadow distance/blur grow ~15%, 200ms ease.
- **Toggle**: thumb slides 200–250ms cubic-bezier(0.4,0,0.2,1); track background crossfades to
  `--accent` in the same duration.
- **Ambient breathing**: reserved for exactly one hero/feature surface per page — shadow intensity
  pulses ±10% over an 8–12s loop, `prefers-reduced-motion: reduce` freezes it at the raised rest state.

### 2.8 Twelve section treatments (maxfolio → soft UI)
1. **Hero** — headline stays flat on `--surface`; one large `xl`-scale panel floats aside holding an
   animated chip; CTA is a pill button with the accent-fill fix (2.5) and press-in motion.
2. **Stat band** — each numeral sits in an **inset** "readout" tile (recessed like an LCD), numerals in
   `--accent`, count-up plays inside the inset frame.
3. **Now pill + marquee** — the "Now" pill is a small inset indicator-light pill; marquee items become
   raised chips scrolling continuously, each lifts and pauses on hover.
4. **Experience split** — role rail is a vertical segmented control (raised = inactive, inset = active
   role, matching the generator's own checkbox/radio examples); panel content sits on a flat inset
   "screen" zone so long text stays legible (rule 1).
5. **Years unit chart** — shipped-project tiles are **raised**; empty/planned year slots are **inset** —
   depth itself encodes the data, a treatment unique to this theme (no other maxfolio theme can do this).
6. **Process stepper** — numbered circular badges connected by an inset "groove" track that fills with
   flat `--accent` as the user scrolls, like a real analog dial.
7. **Shopify work index** — case rows are `lg`-radius raised cards that lift further on hover; the hover
   preview capture sits inside an inset "screen," literally reusing the device-bezel metaphor.
8. **Case-study charts** — bars/lines render as inset channels with a raised handle/fill riding inside
   (a soft-UI slider, repurposed as a chart) — legend items are small pill toggles.
9. **Gallery carousel** — laptop/phone frames ARE soft-UI extruded shells: bezel = raised surface,
   screen = inset flat panel holding the actual screenshot — the most literal, on-brand use of the style.
10. **Manifesto band** — switches to the **dark** palette variant for contrast against the light theme
    default; pull-quote text stays flat, never embossed.
11. **Skills ledger** — each tool is a small toggle-shaped chip; usage frequency shows as an inset
    "fill level" inside the chip, echoing a battery/progress indicator.
12. **Contact + FAQ** — form fields are inset recessed channels; the submit button is the boldest
    accent-fill moment on the page (rule 2); FAQ rows are raised bars that flip to inset when expanded,
    like a pressed accordion tab.

## 3. Idea catalog (≥20, standalone from the theme spec above)

### Idea 1 — Two-shadow extrusion primitive
- **Looks like**: a flat-colored surface reads as puffed out from the page via a dark shadow on one
  diagonal and a light "highlight" on the opposite diagonal, both the same blur/offset magnitude.
- **Section/theme**: the base primitive for the entire Soft-UI theme (every card, button, chip).
- **Implementation**: CSS custom properties per §2.3/2.4; expose `--d/--b/--r` per size token so
  Tailwind utility classes (`.soft-sm`, `.soft-md`, `.soft-lg`, `.soft-xl`) can be composed.
- **Perf/a11y**: pure CSS, zero JS cost; two shadows per element is cheap for GPU compositing as long
  as `blur` values stay ≤60px and the count of simultaneously-shadowed elements on screen stays modest
  (don't neumorphic-ify every grid cell in a dense table — see Avoid list).
- **Screenshot**: `neumorphism-io-generator_full.png`, `neumorphism-io-generator_scroll.png`

### Idea 2 — Pressed/inset state as the universal "active" signal
- **Looks like**: the same element with both shadows flipped to `inset` — it looks pushed into the
  page rather than popped out of it.
- **Section/theme**: toggle thumbs off-state, selected tabs, pressed buttons, active accordion headers.
- **Implementation**: a single `[data-state="pressed"]` attribute selector toggles the `box-shadow`
  from raised to inset; pair with the accent-fill rule (§2.5.4) so state never rides on shadow alone.
- **Perf/a11y**: instant CSS swap, no layout shift; must be paired with a non-shadow cue for
  colorblind/low-vision users.
- **Screenshot**: `neumorphism-io-generator_full.png` (toggle/checkbox row)

### Idea 3 — Recessed "readout" stat tiles
- **Looks like**: an LCD-style sunken panel with a bright accent numeral floating inside it, as if lit
  from within.
- **Section/theme**: Stat band.
- **Implementation**: inset extrusion + `--accent` numeral color + count-up via IntersectionObserver
  (existing house pattern); numeral font-variant-numeric: tabular-nums.
- **Perf/a11y**: no motion beyond the count-up; count-up itself already gated by reduced-motion in the
  house pattern.
- **Screenshot**: `neumorphism-io-generator_full.png` (as visual analog to the "content here" panel)

### Idea 4 — Segmented-control role rail
- **Looks like**: a vertical stack of pill segments, one visibly pressed-in (the active role) among
  several raised ones.
- **Section/theme**: Experience split.
- **Implementation**: radio-group semantics under the hood (real `role="tablist"`/`aria-selected`) with
  the raised/inset visual bound to `aria-selected`.
- **Perf/a11y**: keep real ARIA roles — the visual metaphor must not replace correct semantics.
- **Screenshot**: `neumorphism-io-generator_full.png` (toggle row), `figma-community-music-app-neumorphism_full.png`

### Idea 5 — Depth-encodes-data year tiles
- **Looks like**: a grid where "shipped" tiles visibly pop forward and "empty" tiles sink back, purely
  through shadow direction — no color or icon needed to read the difference at a glance.
- **Section/theme**: Years unit chart — a treatment no other maxfolio theme can produce, since it needs
  the extrusion metaphor to mean something.
- **Implementation**: map `hasShippedProject(year, kind)` → raised vs inset class; keep both states
  labeled in text for screen readers (depth is a bonus visual, not the only signal).
- **Perf/a11y**: static per-tile class, no motion required; must ship a text/aria equivalent since depth
  alone is not perceivable non-visually.
- **Screenshot**: `neumorphism-io-generator_full.png` (raised-vs-inset contrast reference)

### Idea 6 — Analog dial process stepper
- **Looks like**: a groove (inset channel) running between numbered circular badges, with a solid
  accent-colored "fill" creeping along the groove as you scroll — like a real analog progress dial.
- **Section/theme**: Process stepper.
- **Implementation**: framer-motion `useScroll` + `useTransform` drives a `clip-path` or `stroke-dashoffset`
  fill inside the inset groove; badges themselves swap raised→inset as the fill passes them.
- **Perf/a11y**: transform/clip-path only (no layout thrash); reduced-motion shows the final fill state
  immediately without the scroll-tied animation.
- **Screenshot**: `neumorphism-io-generator_full.png` (loader/spinner example as a depth reference)

### Idea 7 — Device-bezel-as-extrusion gallery frames
- **Looks like**: the laptop/phone frames in the gallery carousel are literally rendered as raised
  soft-UI shells, with the screenshot living inside a flat inset "screen" cutout.
- **Section/theme**: Gallery carousel.
- **Implementation**: reuse the existing laptop/phone frame SVGs/components, but swap their fill/shadow
  treatment to the `xl` extrusion token instead of a flat vector bezel.
- **Perf/a11y**: same DOM cost as today's frames — only the shadow/fill styling changes.
- **Screenshot**: `figma-community-music-app-neumorphism_full.png` (device-frame + inset screen reference)

### Idea 8 — Slider-as-chart
- **Looks like**: a bar or line chart rendered as a physical slider — an inset channel with a raised
  round handle riding at the data value, rather than a flat filled bar.
- **Section/theme**: Case-study sheet charts.
- **Implementation**: SVG/CSS inset track (§2.3) + a `md`-scale raised circle positioned via
  `left/top` percentage from the data value; animate the handle's position on scroll-into-view.
- **Perf/a11y**: provide the underlying numeric value in an adjacent text/`aria-valuenow` slider role
  even though it's not an interactive control, so screen readers get the number, not just a shape.
- **Screenshot**: `neumorphism-io-generator_full.png` (slider/toggle track reference)

### Idea 9 — Battery-fill skill chips
- **Looks like**: a pill-shaped chip per skill/tool where an inset "fill level" (like a battery
  indicator) shows relative usage frequency, without any numeric label needed at a glance.
- **Section/theme**: Skills usage ledger.
- **Implementation**: nested div — outer raised pill, inner inset track, an accent-fill bar inside the
  track sized to `%usage`; add `aria-label="{tool}: used in {n} of {total} projects"` for the real number.
- **Perf/a11y**: static widths, no animation required beyond a one-time fill-in on scroll.
- **Screenshot**: `neumorphism-io-generator_full.png` (checkbox/switch depth reference)

### Idea 10 — Indicator-light "Now" pill
- **Looks like**: a small inset pill (recessed, like a real indicator light socket) with a tiny raised
  accent dot inside it that pulses gently — read as "live."
- **Section/theme**: Now pill + marquee.
- **Implementation**: inset pill container + a `sm`-scale raised circle with a slow opacity pulse
  (2.5–3s loop), reduced-motion freezes at full opacity.
- **Perf/a11y**: single CSS animation, negligible cost.
- **Screenshot**: `neumorphism-io-generator_full.png`

### Idea 11 — Accent-fill CTA as the deliberate style break
- **Looks like**: every other interactive element is monochrome-extruded, but the single primary CTA
  on any given screen is a flat, saturated `--accent` pill — it visually "wins" the eye immediately.
- **Section/theme**: every section with a CTA (hero, contact, work-index "view case study").
- **Implementation**: a `.cta-primary` class that opts OUT of the extrusion mixin entirely and uses a
  flat fill + the focus-ring rule (§2.5.3); this is the accessibility fix, not just an accent choice.
- **Perf/a11y**: solves the AA-contrast failure mode named by Malewicz's own follow-up article directly.
- **Screenshot**: `neumorphism-io-generator_full.png` (the "Add to cart" colorful button example)

### Idea 12 — Dark-mode manifesto interlude
- **Looks like**: the one section that swaps to the dark palette variant (§2.2) — a deliberately
  higher-contrast, moodier beat between two light soft-UI sections.
- **Section/theme**: Manifesto inverted band.
- **Implementation**: wrap the section in a `data-theme="dark"`-scoped subtree reusing the same
  extrusion mixin, just with dark tokens (`--shadow-light` becomes a lighter tint of the dark base, not
  white — §2.2 note).
- **Perf/a11y**: verify AA contrast independently for the dark token set — dark neumorphism needs its
  own contrast audit, inheriting the light variant's ratios is not safe.
- **Screenshot**: n/a (token spec only, no direct dark-neumorphism screenshot captured this pass)

### Idea 13 — Recessed form fields
- **Looks like**: text inputs sit inset into the page, like a keyway machined into a plastic panel,
  rather than the usual flat-bordered box.
- **Section/theme**: Contact form.
- **Implementation**: inset extrusion on the input wrapper; the input itself has no visible border of
  its own (the shadow IS the border); focus state adds the accent outline (§2.5.3) on top.
- **Perf/a11y**: verify placeholder text contrast independently — recessed fields tend to use lighter
  placeholder grays that can fail AA inside the shadow gradient.
- **Screenshot**: `neumorphism-io-generator_full.png` (input/content-panel reference)

### Idea 14 — Accordion rows that physically depress
- **Looks like**: a closed FAQ row is a raised bar; opening it visibly presses it into the page (inset)
  while the answer content unfolds beneath, flat.
- **Section/theme**: FAQ.
- **Implementation**: `<details>`/`<summary>` semantics for correctness, styled with raised→inset swap
  on `[open]`; content itself is flat, never inset (rule 1, no embossed reading text).
- **Perf/a11y**: native disclosure semantics keep screen-reader/keyboard behavior correct for free.
- **Screenshot**: `neumorphism-io-generator_full.png`

### Idea 15 — Circular-dot loader as an ambient hero accent
- **Looks like**: a ring of small extruded dots (from the generator's own "Praashoo7" example) fading
  in sequence — read as a physical spinning mechanism, not a flat spinner.
- **Section/theme**: a small ambient loop behind the hero panel or as a page-transition moment.
- **Implementation**: 8–12 small raised circles arranged in a ring via CSS `transform: rotate()` +
  `nth-child` animation-delay stagger, opacity/scale pulsing around the ring.
- **Perf/a11y**: pure CSS keyframes, cheap; must fully pause under reduced-motion (it's decorative only).
- **Screenshot**: `neumorphism-io-generator_full.png` (bottom-right loader example)

### Idea 16 — Toggle track color-crossfade (the anti-monochrome fix)
- **Looks like**: a switch's thumb slides via shadow-flip as usual, but the track itself crossfades
  from neutral gray to `--accent` when ON — so state reads even in grayscale/low-vision simulation.
- **Section/theme**: any settings-like control (theme switcher on the Explore-themes page, filter
  toggles).
- **Implementation**: `background-color` transition on the track alongside the thumb's `left`/inset
  transition, same 200–250ms timing.
- **Perf/a11y**: directly answers Malewicz's "too little difference between active/pressed states"
  critique — this is the fix, not just a nice-to-have.
- **Screenshot**: `neumorphism-io-generator_full.png` (orange-track toggle example)

### Idea 17 — Soft-shadow restraint benchmark from real shipped products
- **Looks like**: Stripe/Material/Tailwind/GitHub/Airbnb all use *layered, soft* shadows for elevation
  — but at far lower intensity and without the light-highlight half of the neumorphic pair.
- **Section/theme**: a calibration reference, not a section — use this to keep the theme's shadow
  intensity from drifting into kitsch as work progresses (see Avoid list item 3).
- **Implementation**: n/a — a design-review checklist item: compare any new component's shadow blur/
  opacity against the Stripe/Material presets in the gallery before shipping.
- **Perf/a11y**: n/a
- **Screenshot**: `uigradients-related-soft-shadow_full.png`

### Idea 18 — Fintech "readout card" composition (from the DDG fintech-concept sweep)
- **Looks like**: a dashboard-style card stacking a large recessed numeral readout, a raised action
  button row beneath it, and small inset mini-charts — the layout grammar real neumorphic fintech
  concepts converge on.
- **Section/theme**: Case-study sheet (store-performance snapshot cards).
- **Implementation**: compose Ideas 3 + 8 + 11 into one card template: inset numeral header, inset
  slider-chart body, flat accent-fill CTA footer.
- **Perf/a11y**: same as its constituent ideas.
- **Screenshot**: `ddg-soft-ui-fintech-app_full.png` (search-result reference only — no single site traced)

### Idea 19 — Media-player scrubber grammar (from the DDG music-player sweep)
- **Looks like**: named concepts (Miriam Matas' and Zulqurnain's dribbble shots, the Figma "Music App
  UI-Neumorphism" kit) converge on: circular raised play/pause button, an inset horizontal scrubber
  track with a raised round handle, and raised small icon buttons flanking it (skip/shuffle).
- **Section/theme**: could skin the ReviewVideoPlayer's scrubber when the Soft-UI theme is active.
- **Implementation**: Idea 8's slider-as-chart mechanic, reused literally as a real seek control this
  time (so it must be a genuine `<input type="range">` under a custom-styled thumb/track, not a div).
- **Perf/a11y**: using a real range input keeps keyboard/screen-reader seek behavior correct; only the
  thumb/track paint is replaced.
- **Screenshot**: `ddg-neumorphism-music-player_full.png` (search-result reference), `figma-community-music-app-neumorphism_full.png`

### Idea 20 — "prefers-contrast: more" flat fallback mode
- **Looks like**: on request (OS-level high-contrast preference), every soft-UI surface instantly
  becomes a plain bordered card — same layout, zero shadows, `--ink`-on-`--surface` 1.5px border.
- **Section/theme**: a cross-cutting theme-level rule, not one section.
- **Implementation**: `@media (prefers-contrast: more) { .soft-sm, .soft-md, .soft-lg, .soft-xl { box-shadow: none; border: 1.5px solid var(--ink); } }`
- **Perf/a11y**: this is the theme's actual accessibility escape hatch — ship it from day one, not as
  a follow-up fix.
- **Screenshot**: n/a (spec-only)

### Idea 21 — Ambient "breathing" hero panel
- **Looks like**: exactly one hero-scale panel per page has its shadow intensity slowly pulse ±10%
  over 8–12s — subtle enough to read as "alive," not distracting.
- **Section/theme**: Hero.
- **Implementation**: `@keyframes breathe { 0%,100% { --d: 20px; --b: 60px } 50% { --d: 22px; --b: 66px } }`
  driving the CSS custom properties that feed the box-shadow.
- **Perf/a11y**: CSS-variable-driven keyframes on box-shadow are more expensive than transform/opacity —
  cap this to ONE element per page and disable entirely under reduced-motion.
- **Screenshot**: `neumorphism-io-generator_full.png` (card baseline reference)

### Idea 22 — Radius scale as a depth-cue ladder
- **Looks like**: small controls (checkbox/toggle) use tight 10px radii, cards use 24px, hero/device
  panels use 32–40px — radius itself grows with the visual "importance"/scale of the surface, echoing
  what the generator's own example gallery does implicitly across its 15 samples.
- **Section/theme**: cross-cutting design-system rule.
- **Implementation**: the 4-row token table in §2.4 — enforce it via a lint rule/Tailwind plugin so no
  component invents its own one-off radius.
- **Perf/a11y**: n/a (consistency rule)
- **Screenshot**: `neumorphism-io-generator_full.png`

## 4. Avoid list (what forums/critics/judges call out)

1. **Embossed/extruded body text.** The generator's own "YOUR CONTENT HERE" demo card is the cautionary
   example: text carved into the surface via shadow tricks reads as a gimmick and is close to
   unreadable. Text is always flat, on `--ink`, independent of the shadow system.
2. **All-monochrome, zero-accent surfaces.** This is Malewicz's own named critique across both
   articles: without a real color/fill signal, users can't tell what's interactive, and pressed vs.
   active states blur together. Every theme instance must keep §2.5's accent-fill rule.
3. **Shadow intensity creeping past ~15%.** Once the dark/light shadow values sit far from the base
   luminance, the effect stops reading as "soft" and starts reading as a Windows-98 bevel — the exact
   regression the trend's own name ("new *skeuomorphism*") warns against.
4. **Hover-only affordance.** A raised→lifted hover transition that never explains itself on touch
   devices leaves mobile users with no equivalent cue — always pair hover lift with a state that also
   works via tap (press-in, then settled raised).
5. **Applying it wall-to-wall with no flat "reset" zones.** A page that embosses literally everything
   is visually fatiguing over a long scroll; the strongest real examples (the fintech/music-player
   concepts surveyed) use it as the primary control language, not as texture applied to every pixel —
   body copy, long-form text, and dense tables should stay flat regardless of theme.
6. **Naively inverting the formula for dark mode.** Just swapping black/white shadow values on a dark
   base produces a washed-out, "light leak" look — the dark variant needs its own tuned highlight color
   (a lighter *tint* of the base, not white) as specified in §2.2.
7. **Skipping the focus-visible override.** Soft shadows alone do not meet WCAG's non-text-contrast
   requirement for focus indicators — every interactive element needs the accent outline layered on top
   (§2.5.3), not instead of, the extrusion.
8. **No `prefers-contrast` escape hatch.** Given the style's own well-documented AA-contrast weakness,
   shipping without Idea 20's flat fallback is shipping a known accessibility gap on day one.
9. **Using it for dense, data-heavy UI.** The style's shadow-based depth cues do not scale to large
   tables or many-row lists where a user needs to scan many pieces of state at once — reserve it for
   card/tile/control-level compositions (as the 12 section treatments in §2.8 do), not for anything
   resembling a spreadsheet.

## Screenshot count and location
20 PNGs saved under `refs3/neumorphism/` (see `_results.json`, `_results2.json`, `_results3.json` for
the full per-target text/metadata this digest draws from).
