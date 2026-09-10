# Awwwards Portfolio References — Lens D (awwwards-portfolio-d)

Source: `https://www.awwwards.com/websites/portfolio/` pages 10, 11, 12 (31 `/sites/<slug>` links each)
plus `https://www.awwwards.com/websites/personal/` pages 1-2 (31 + 31 links) — **155 unique candidate
slugs**, all fully resolved to outbound live URLs across this and a prior session
(`refs4/awwwards-portfolio-d/site-detail-links.json`, `collect.log` — `DONE collect. total details 155`).

Method: Playwright/Chromium 1440x900 (390x844 mobile on every 4th capture), real Chrome UA,
`domcontentloaded` + 2s settle, up to 20s loader-wait before declaring a page loader-stuck, 20s
hard navigation timeout before declaring a page dead, ~1.5s between page loads, <=1 req/2s per
host, human-paced wheel-scroll to 0/35/70% before each viewport capture, PowerShell memory guard
(>=1500MB free) before launch and every 15 sites. Folders already existing under any other
`refs4/*/<slug>` lens were skipped up front (644 pre-existing slug folders checked; 1 exact dupe
skipped: `zui-ooo`). Script: `scripts/.capture-cache/refs4-awwwards-d.mjs` in the
`max-folio-skills` repo; run log `refs4/awwwards-portfolio-d/capture-run.log`, per-site metadata
`refs4/awwwards-portfolio-d/capture-meta.json`.

**Run result:** 55 candidates attempted (round-robin across the 5 source pages) → **48 captured**,
7 skipped-and-noted (1 `dead:timeout`, 1 `blocked` behind a captcha/consent wall, 3
`dead:loader-stuck` past the 20s cutoff, 2 `net::ERR_NAME_NOT_RESOLVED`) — each dead/blocked site
has a `SKIPPED-*.txt` note in its folder instead of screenshots. Of the 48 captured, **2 are
excluded from the index below** as bad resolutions, not real design references (see "Known
limitations"), leaving **46 sites** in the catalog — well past the 40-site floor. Every captured
site has `full.png` (capped 8000px), `vp-0.png`, `vp-35.png`, `vp-70.png`, `innerText.txt`
(`document.body.innerText`, capped 6000 chars); 12 of the 48 also have mobile `m-0.png`/`m-50.png`
at 390x844 (every 4th processed site). Per-site request count / transferred bytes / WebGL-canvas
presence were recorded via `page.on('response')` and a `canvas.getContext('webgl')` probe.
Screenshots saved under `refs4/awwwards-portfolio-d/<site-slug>/`.

**Known limitations:**
- `maciejbaska-com` (from `Personal Portfolio - Awwwards Honorable Mention`, listing slug
  `personal-portfolio-macbook-...`/`maciejbaska`) resolved to a domain that is no longer the
  designer's site — it now serves a Taboola/content-farm "Editor's Picks" page (Quran history,
  crypto-CFD ads, a Snap-on tools blurb). Captured but **excluded** from the index/catalog; the
  awwwards "Visit Site" link is stale.
- `lucas-yalman-com` (candidate #49 in the run) resolved to a live Vercel URL but the deployment
  itself is paused (`This deployment is temporarily paused`). Captured (near-empty `full.png`,
  1 request) but **excluded** as not a real site to reference.
- Several sites gate their real content behind a scroll-jacked/GSAP-pinned intro or an explicit
  click-to-enter gate that our scripted wheel-scroll does not trigger, so their static capture is
  thin: `pedrobelleza-com` (BBS "CONNECT" gate — confirmed via `innerText.txt` that real content
  exists past the gate), `adcker-com-services` (blank at 0%, resolves by 35%), `rishabh-upadhyay-com`,
  `mystella-me-ja-book-features`, `laurentiwebdesign-it`, `aboutluca-com`, `arkon-digital`,
  `375-studio-en` (compounded by a full-viewport cookie banner). These are still listed in the
  index (their hook/loader is itself often the reusable idea) but flagged so a future pass knows to
  re-capture with an explicit click-through.

## 1. INDEX — 46 sites

| # | Slug / folder | URL | Author/Studio | Style family | Section types seen | What makes it good |
|---|---|---|---|---|---|---|
| 1 | `pedrobelleza-com` | pedrobelleza.com | Pedro Belleza | terminal/hacker | loader, typographic-hero, other | A decade-tab nav (1986-2046) re-skins the whole portfolio per era; the 1986 tab is a full green-phosphor BBS dial-up "CONNECT" gate |
| 2 | `ozgur-design` | ozgur.design | Oz Gultekin | dark-mode | typographic-hero, other | Witty first-person cookie-banner copy ("I too could do without cookie banners, but GDPR and Quebec's Law 25 want one...") |
| 3 | `adcker-com-services` | adcker.com/services | Adcker | editorial/magazine | typographic-hero, media-hero, services | A fashion photo sits nested directly inside the oversized display-type parentheses of "WHAT WE ( photo ) DO" |
| 4 | `shader-se` | shader.se | Shader Development Studio | retro/y2k | loader, other | Full CRT-monitor bezel/vignette frames the whole viewport around a VHS chromatic-aberration boot screen with a retro progress bar |
| 5 | `mylawcompany-com` | mylawcompany.com | M&Y Personal Injury Lawyers | other | media-hero, stats, contact-cta | Generic law-firm template (stock photo, teal/gold) — grouped with 2 more identical sites in Avoid |
| 6 | `mohamedshehata-net` | mohamedshehata.net | Mohamed Shehata | dark-mode | typographic-hero, about-bio | Clean `// THIS IS ME` terminal-style eyebrow tag with a single orange accent dot and underline |
| 7 | `marinkurir-com` | marinkurir.com | Marin Kurir | swiss/grid | marquee, typographic-hero, about-bio | Split-tone (solid/tint) horizontally-clipped marquee headline paired with a casual, first-person voice ("Oh, didn't see you there") |
| 8 | `picnic-katherine-le-com` | picnic.katherine-le.com | Katherine Le | 3d/immersive | 3d-hero, other | A "mini tutorial" hint card (drag to move camera / tap to interact / report bugs) precedes a WebGL drag-camera playground |
| 9 | `nonsense-that-works...mango-media.eu` | mango-media.eu/projects | Mango Media | 3d/immersive | 3d-hero, magnetic-nav, other | Services are plotted as glowing planets on animated orbit rings around a nebula core, with an explicit "Toggle to classic view" fallback |
| 10 | `shreve-one` | shreve.one | Noah Shreve | editorial/magazine | typographic-hero, logos | Mixed serif/monospace type pairing with a monospace "Now Booking Summer 2026" status pill |
| 11 | `milo-gg` | milo.gg | Milo (AI) | minimal/apple | typographic-hero, other | An LED dot-matrix wordmark is the *only* element on an otherwise fully empty, faint-grid viewport |
| 12 | `rishabh-upadhyay-com` | rishabh-upadhyay.com | Rishabh Upadhyay | minimal/apple | loader, other | Content gated behind a reveal we couldn't trigger (thin capture — see Known limitations) |
| 13 | `mors-design-tino` | mors.design/tino | Mors — Creative Studio | playful/illustration | other, footer-playful | The 404 page is a playable tic-tac-toe match against "Tino the cat," speech-bubble taunt included |
| 14 | `loloagency-com-work-sensei` | loloagency.com/work/sensei | The Agency of Love & Logic | editorial/magazine | case-study-anatomy, sticky-stack, other | A literal "LOVE / LOGIC" toggle switch sits inside the case-study copy, plus a sticky pill-tab section switcher (Strategy/Design/About/Work) |
| 15 | `darw5n-github-io-me` | darw5n.github.io/me | Darwin | retro/y2k | typographic-hero, loader | Serif wordmark distorted along a wavy arc baseline, shown twice in a bold/faded pair, over film-grain texture |
| 16 | `mystella-me-ja-book-features` | mystella.me/ja/book-features | MY STELLA | other | loader | Static capture never resolved past "Loading…" (see Known limitations) |
| 17 | `kellydev-io` | kellydev.io | Kelly (My Art Gallery) | editorial/magazine | loader, other | An architectural pencil-sketch illustration sits *behind* a stenciled-outline "LOADING" wordmark as the loading screen itself |
| 18 | `itomdev-com` | itomdev.com | Tomasz "ITom" Szmajda | playful/illustration | list-hero, other | A fully hand-drawn storefront scene ("PORTFOLIO" sign, two doors) where each door is decorated with tech-stack stickers (JS/React/Node/TS/CSS3) as the entry choice |
| 19 | `jaafaryoussef-com` | jaafaryoussef.com | Jaafar Youssef (JYO) | swiss/grid | typographic-hero, work-grid | Two-tone bold headline over a dotted grid with project thumbnails fanned out and peeking from the bottom edge |
| 20 | `laurentiwebdesign-it` | laurentiwebdesign.it | Laurenti Web Design Studio | other | loader | Static capture never resolved past a "100%" progress rule (see Known limitations) |
| 21 | `mina-massoud-com` | mina-massoud.com | Mina Massoud | cyberpunk | media-hero, side-rail-nav, marquee, other | Diagonal red hazard-tape ribbons carry bilingual (English/Japanese) slogans across a photoreal masked-samurai hero with crossed glowing katanas |
| 22 | `bbc-com-storyworks...japan...` | bbc.com/storyworks/.../japan-islands-of-worlds | BBC StoryWorks (branded content) | editorial/magazine | typographic-hero, media-hero, scroll-effect | Warm hand-illustrated regional vignettes (chef, geisha, pagoda) frame an elegant script+serif title, "Scroll down to begin your adventure" |
| 23 | `juanmora-co-about-html` | juanmora.co/about.html | Juan Mora | minimal/apple | typographic-hero, dock-nav | Soft peach gradient wash behind a rounded, friendly bold sans headline; center-anchored capsule nav |
| 24 | `375-studio-en` | 375.studio/en | Studio375 | other | loader | Bilingual "CIAO / HELLO" toggle pill visible, but a numeric % loader plus a full-width cookie banner blocked all real content (see Known limitations) |
| 25 | `danield-design` | danield.design | Daniel Destefanis | bento | work-bento, about-bio, contact-cta | Rounded bento cards: one shows a live local-time + "Currently at Anthropic" stamp over a sparkling starfield texture, the other a warm gradient-mesh CTA |
| 26 | `paulandsteve-com` | paulandsteve.com | Powell & Pisman Injury Lawyers | other | media-hero, stats, contact-cta | Generic law-firm template (navy/gold, stock photo) — grouped in Avoid |
| 27 | `northgarden-com` | northgarden.com | NorthGarden | 3d/immersive | loader, 3d-hero | A backlit 3D grass field at dusk with the wordmark glowing through the blades as the loading screen |
| 28 | `idyllic-co-nz-about` | idyllic.co.nz/about | Idyllic (Disruptive Design) | maximalist | media-hero, marquee, about-bio | A single oversized, saturated team portrait (deliberately eccentric styling) with a red service-marquee ticker cutting across it |
| 29 | `olhauzhykova-com-itg-html` | olhauzhykova.com/itg.html | Olha Uzhykova | editorial/magazine | case-study-anatomy, other | Split case-study card: sage-green copy panel with a circular "Check it live" CTA next to a tiny playful inline dachshund micro-illustration |
| 30 | `facchettilaw-com` | facchettilaw.com | Law Offices of Adrianos Facchetti | other | media-hero, stats, contact-cta | Generic law-firm template (teal, aerial-city photo, "I ❤ BURBANK" shirt) — grouped in Avoid |
| 31 | `fromanother-love` | fromanother.love | fromanother | glass/gradient | typographic-hero, media-hero | Glowing teal/blue blurred organic WebGL blob with the headline dissolving through it |
| 32 | `vivre-agency` | vivre.agency | Vivre (Hotel Marketing Agency) | luxury/fashion | media-hero, dock-nav | Full-bleed cinematic drone photography of an Italian hillside villa at golden hour as the entire hero, no overlay copy needed |
| 33 | `mschristensen-com` | mschristensen.com | Morten Stig Christensen | bento | work-bento, work-grid, other | Overlapping, tilted case-study thumbnails intentionally clip the hero headline; filter tabs show live counts ("Selected(14)/Archive(56)/Published(17)") |
| 34 | `lucasammarco-com` | lucasammarco.com | Luca Sammarco | dark-mode | typographic-hero, work-bento, stats | Three "LIVE"-badged product-dashboard preview cards with real-looking data prove working SaaS builds instead of static mockups |
| 35 | `thiswasmajor-com` | thiswasmajor.com | MAJOR (Media Agency) | luxury/fashion | media-hero, work-list, footer-minimal | Extreme macro eye-closeup photography as the work-item background, bold condensed title stamped directly on the iris, nav shows live counts |
| 36 | `rs69-dev` | rs69.dev | Rogue Signal 69 (creative developer) | maximalist | 3d-hero, media-hero, other | A live "Astronauts Absorbed" counter badge plays into a sci-fi black-hole/nebula hero with tongue-in-cheek copy |
| 37 | `plantpot-studio` | plantpot.studio | plantpot.studio | playful/illustration | 3d-hero, other | A 3D isometric floating-island diorama (cozy desk, plant, campfire, "Welcome" sign) replaces a literal photo/video hero entirely |
| 38 | `petersand-eu` | petersand.eu | Peter Sand (Interpreter) | editorial/magazine | typographic-hero, media-hero, about-bio | Newspaper-masthead layout: huge serif name split around a small heraldic crest/shield "PS" logo with a halftone-dot portrait |
| 39 | `aboutluca-com` | aboutluca.com | Luca Nardi | other | loader | Static capture never resolved past a thin "LOADING" rule (see Known limitations) |
| 40 | `amardenvox-com` | amardenvox.com | AmardenVox | maximalist | typographic-hero, media-hero, services | High-contrast red/black palette over an ambiguous morphing grayscale WebGL shape; "©17-26" long date range as a credibility cue |
| 41 | `tomsears-me` | tomsears.me | Tom Sears | minimal/apple | typographic-hero, about-bio | A complete, grammatical bio sentence ("Tom Sears is a designer and creative director from England based in New York City") *is* the giant hero headline |
| 42 | `arkon-digital` | arkon.digital | AD (Personal Portfolio) | other | loader | Static capture never resolved past a spinning arc loader (see Known limitations) |
| 43 | `codebyjesse-com` | codebyjesse.com | Code by Jesse | dark-mode | typographic-hero, dock-nav, other | Live local time + city/country stamp pinned bottom-right ("[10:38:04] [Apeldoorn] [the Netherlands]") beside an italic-accent Dutch headline |
| 44 | `silent-house-com` | silent-house.com | Silent House | motion-first | media-hero, other | The entire hero photo is skewed/tilted a few degrees within its rectangular canvas rather than shown flat |
| 45 | `infosion-de-projekte-koelnturm` | infosion.de/projekte/koelnturm | infosion | swiss/grid | case-study-anatomy, other | Clean pixel-block logo mark and a restrained blue/black Swiss case-study layout (media slot didn't finish loading in capture — see Avoid) |
| 46 | `edwardh-io` | edwardh.io | Edward H. | retro/y2k | loader, other | A pixel-font "Booting..." loader prints the literal asset it just loaded ("9 of 12 File Loaded: /fonts/chill.json") as its own loading copy |

## 2. Idea catalog — 26 reusable ideas

### 1. Decade-hopping "design history" theme switcher
- **Look:** A row of year tabs (1986, 1996, 2006, 2016, 2026, 2036, 2046) sits above the hero. Each
  year re-skins the *entire* page in that decade's dominant web aesthetic — 1986 renders as a green
  phosphor BBS terminal ("PEDRO'S BBS // NODE 1 OF 1", 1200 baud dial-up copy, a blinking
  `► CONNECT` button).
- **Fits:** A standout "about the designer" or history/timeline section for maxfolio's own
  meta-portfolio, or any case study framed as "the evolution of a craft."
- **Sketch:** One `activeEra` state driving a CSS-variable theme swap (font stack, palette, texture
  overlay) plus era-specific micro-copy; keep the underlying content/DOM identical across eras so
  only presentation changes, not information architecture.
- **Perf/a11y:** Swap themes via `data-era` attribute + CSS custom properties (no full remount);
  keep focus on the year tab after switching and announce the era change via `aria-live="polite"`.
- **Screenshot:** `pedrobelleza-com/vp-0.png`

### 2. Terminal/BBS dial-up "CONNECT" gate
- **Look:** A black viewport with green monospace CRT-style text: node status, baud rate, a phone
  number to "dial," and a glowing `► CONNECT [ PRESS TO DIAL IN ]` button standing in for a normal
  "Enter site" gate.
- **Fits:** A hacker/terminal-themed maxfolio case study, or a fun loading gate for any dev-focused
  project page.
- **Sketch:** Monospace font, `text-shadow` phosphor glow, a scanline `repeating-linear-gradient`
  overlay at low opacity, and a real button (not a decorative div) so keyboard/screen-reader users
  aren't stuck outside the gate.
- **Perf/a11y:** Provide a "Skip intro" link from the first frame — this exact gate is also why the
  capture never saw the real content (see Avoid list).
- **Screenshot:** `pedrobelleza-com/vp-0.png`

### 3. First-person, funny cookie-banner copy
- **Look:** Instead of boilerplate legal text, the consent banner speaks in the site owner's own
  voice: "I too could do without cookie banners, but GDPR and Quebec's Law 25 want one, so here it
  is. Analytics only, nothing else."
- **Fits:** Any maxfolio bio/about page — turns a mandatory annoyance into a small personality beat.
- **Sketch:** Same consent-management logic, just a rewritten string; keep the real legal disclosure
  reachable via a "learn more" link so the joke doesn't hide compliance info.
- **Perf/a11y:** No cost. Keep contrast and button labels (Accept/Decline) unambiguous regardless of
  the joke copy.
- **Screenshot:** `ozgur-design/vp-0.png`

### 4. Photo nested inside oversized display-type punctuation
- **Look:** A giant headline reads "WHAT WE ( photo ) DO" where the parentheses literally contain a
  small fashion/editorial photograph sized to the type, sitting mid-sentence like an inline glyph.
- **Fits:** An agency/services hero or a "what I do" statement on a personal portfolio.
- **Sketch:** Position the image `absolute` inside a `position:relative` text block sized to the
  parenthesis glyphs (measure via a hidden reference span or fixed `clamp()` type scale); keep the
  image behind real, selectable text via `z-index` and alt text on the image.
- **Perf/a11y:** Single optimized image; ensure the sentence still reads correctly to a screen reader
  with the image's alt describing its content, not "decorative."
- **Screenshot:** `adcker-com-services/vp-35.png`

### 5. CRT monitor bezel + VHS boot screen
- **Look:** The entire viewport is framed inside a rounded, glowing CRT-monitor bezel (dark vignette
  edges, subtle screen curvature) showing a retro splash: a serif logo with red/cyan chromatic
  aberration fringing, "Version 1.02," a blocky segmented progress bar, and a copyright line.
- **Fits:** A dev-tools or "shader/graphics studio" themed case study, or a fun Easter-egg loading
  state for a technical maxfolio section.
- **Sketch:** `border-radius` + `box-shadow: inset` for the bezel curve, a `filter: url(#chromatic)`
  SVG filter or layered `text-shadow` in red/cyan offsets for the aberration, CSS `clip-path` steps
  for the segmented progress bar.
- **Perf/a11y:** Keep the loader duration short and skippable; the aberration effect should respect
  `prefers-reduced-motion` (freeze rather than flicker).
- **Screenshot:** `shader-se/vp-0.png`

### 6. Mini-tutorial hint card before a 3D playground
- **Look:** Before any 3D interaction begins, a small card explains the controls in plain language
  ("drag around to move camera," "tap to interact with objects," "if something doesn't work, let me
  know!") with matching hand-gesture icons.
- **Fits:** Any WebGL/Three.js interactive case study or the maxfolio 3D playground section — solves
  the classic "user doesn't know they can drag" problem.
- **Sketch:** A dismissible card anchored near the canvas, auto-hides after first successful drag
  event, re-appears on a "?" help affordance.
- **Perf/a11y:** Make the same instructions available as plain text for non-pointer/keyboard users,
  and provide a keyboard-operable camera-reset control.
- **Screenshot:** `picnic-katherine-le-com/vp-0.png`

### 7. Orbit-diagram navigation with a classic-view fallback
- **Look:** Services/projects are rendered as glowing dots on animated concentric orbit rings around
  a nebula-textured core planet; a persistent "Toggle to classic view" switch swaps to a plain card
  list.
- **Fits:** A services or work-index section that wants a memorable visual metaphor without
  sacrificing scannability.
- **Sketch:** SVG/Canvas rings with CSS `@keyframes` rotation (paused on hover), each dot as a real
  `<button>` positioned via trigonometry (`cx + r*cos(θ)`); the "classic view" toggle swaps to a
  standard `<ul>` of the same links.
- **Perf/a11y:** The classic-view fallback *is* the accessibility answer — ship it by default for
  reduced-motion users and screen readers, animate the orbit only as a progressive enhancement.
- **Screenshot:** `nonsense-that-works-despite-all-known-laws-of-logic-mango-media-eu-projects/vp-0.png`

### 8. LED dot-matrix wordmark in extreme negative space
- **Look:** A name rendered as a blocky LED/dot-matrix font (rounded-square "pixels") sits centered
  on an otherwise completely empty viewport with only a faint grid texture — no nav, no copy.
- **Fits:** A confident, minimal landing moment for a maxfolio "loading the world" transition, or a
  standalone splash before revealing full content.
- **Sketch:** Build the wordmark from a `grid` of `border-radius` squares per letter (or an SVG dot
  font), animate a subtle per-dot glow-in on load; keep a real `<h1>` in the DOM for the text.
- **Perf/a11y:** Because it's so sparse, this is also one of the cheapest heroes possible — no
  images, minimal DOM. Make sure the "empty" 90% of viewport still has a way to proceed (scroll cue
  or nav) since nothing else signals interactivity.
- **Screenshot:** `milo-gg/vp-0.png`

### 9. Interactive mini-game as the 404 page
- **Look:** Instead of a static "page not found," visitors play a real tic-tac-toe match against an
  illustrated mascot ("Tino the cat"), complete with a taunting speech bubble ("Come on, make a
  move!") and a live score counter.
- **Fits:** Any maxfolio 404/empty-state — turns a dead end into a memorable, on-brand moment.
- **Sketch:** A small client-side game state machine (9-cell board, simple minimax or random AI for
  the mascot), "Reset" and "Back to home" actions always visible so the game never traps the user.
- **Perf/a11y:** Board cells are real buttons with `aria-label`s describing state (empty/X/O); the
  game is fully optional — "Back to home" must be reachable without playing.
- **Screenshot:** `mors-design-tino/vp-0.png`

### 10. Tone-toggle for case-study copy ("Love" vs "Logic")
- **Look:** A physical-looking switch labeled `LOVE`/`LOGIC` sits inside a case study's copy block,
  implying the visitor can flip between an emotional narrative and a rational/data-driven one for
  the same project.
- **Fits:** A maxfolio case-study template where both the craft story and the business-outcome story
  matter — let the reader pick which one they want first.
- **Sketch:** Two pre-written copy variants per case study, toggled via a real `<button role="switch"
  aria-checked>`, crossfaded with a short opacity transition; persist the visitor's last choice in
  `localStorage` so it holds across case studies.
- **Perf/a11y:** Both copy variants must exist in the DOM (or be announced on swap) so screen-reader
  users get the change, not just a silent visual crossfade.
- **Screenshot:** `loloagency-com-work-sensei/vp-0.png`

### 11. Wavy-baseline serif wordmark over film grain
- **Look:** A serif name is set along a gently undulating arc baseline (each letter individually
  rotated/offset) in a dusty rose tone, doubled as a bold-foreground + faded-background pair, over a
  visible photographic grain texture.
- **Fits:** A warm, editorial-feeling personal-brand hero or section divider.
- **Sketch:** Per-letter `<span>` transforms computed from a sine-wave function (`rotate` +
  `translateY` per character index), a tiled grain PNG/SVG-noise overlay at ~5-8% opacity via
  `mix-blend-mode: overlay`.
- **Perf/a11y:** Keep the real name as plain selectable text (not letters-as-images); grain overlay
  should be a small tileable file, not a large photo, to stay cheap.
- **Screenshot:** `darw5n-github-io-me/vp-0.png`

### 12. Hand-drawn illustration behind a stenciled "LOADING" wordmark
- **Look:** A pencil-sketch architectural illustration (a beach house) fills the frame at low
  contrast, with the word "LOADING" rendered as a large outlined/stencil typeface directly on top —
  the loading screen doubles as a piece of art rather than a blank spinner.
- **Fits:** Any project-reveal loader where the destination content is itself visual/architectural —
  tease the content's *medium* during the wait.
- **Sketch:** A single muted illustration as `background-image`, the stencil word as inline SVG text
  with `stroke` only (`fill: none`), a subtle opacity pulse while assets finish loading.
- **Perf/a11y:** Compress the illustration aggressively (it's a loading-screen asset — must appear
  fast); respect `prefers-reduced-motion` for the pulse.
- **Screenshot:** `kellydev-io/vp-0.png`

### 13. Illustrated storefront as a "choose your door" landing
- **Look:** A fully hand-drawn line-art scene (brick building, tree, cat, hanging "PORTFOLIO" sign,
  two front doors) where each door is decorated with stickers for a tech stack (JS, React, Node,
  TypeScript, CSS3) — clicking a door is how you choose which portfolio track to enter.
- **Fits:** A playful entry point for a maxfolio "explore by discipline" chooser (e.g. design vs.
  code vs. writing).
- **Sketch:** SVG line-art scene with each door as a real link/button with a visible focus ring;
  a small "EXPLORER" tooltip explains the interaction and states the audio toggle up front.
- **Perf/a11y:** SVG keeps this lightweight regardless of screen size; always state current audio
  state in text (not just an icon) as this site does ("Audio is currently [ON]").
- **Screenshot:** `itomdev-com/vp-0.png`

### 14. Diagonal hazard-tape slogan ribbons over a maximalist hero
- **Look:** Red diagonal "caution tape" style ribbons cross a dramatic photoreal hero (masked figure,
  crossed glowing katanas), each ribbon carrying a bilingual slogan ("PIXELS ARE A PROMISE," "CODE
  LIKE A SAMURAI," kanji characters) instead of hazard stripes.
- **Fits:** A bold, maximalist personal-brand hero for a design/dev persona that wants to feel larger
  than life.
- **Sketch:** Full-bleed `background-image` + several `position:absolute; transform: rotate(-15deg)`
  ribbon divs with repeating-text backgrounds; stagger their entrance with a scroll-linked reveal.
- **Perf/a11y:** This is a heavy, personality-driven pattern — budget one strong hero image, not
  several; make sure ribbon text has sufficient contrast against the photo behind it.
- **Screenshot:** `mina-massoud-com/vp-0.png`

### 15. Bento card with live local-time + "currently at X" stamp
- **Look:** A rounded bento card shows a moody sparkle/starfield texture photo with bio text
  overlaid, and in its corner a live-updating local clock ("03:32AM Local") paired with "Currently
  at Anthropic" — turning a static bio card into something that feels alive.
- **Fits:** Any maxfolio "about" bento grid — cheap, high-charm signal of availability/timezone.
- **Sketch:** `Intl.DateTimeFormat` with the person's IANA timezone, updated via `setInterval`
  (1x/minute is enough — don't re-render every second), rendered inside a card with
  `backdrop-filter: blur()` over the texture image for legibility.
- **Perf/a11y:** Mark the ticking clock `aria-live="off"` (it's decorative/ambient, not an
  announcement) so screen readers aren't interrupted every minute.
- **Screenshot:** `danield-design/vp-0.png`; corroborated independently by
  `codebyjesse-com/vp-0.png` ("[10:38:04] [Apeldoorn] [the Netherlands]") — two unrelated sites
  converged on the same pattern, a signal it reads well.

### 16. Backlit 3D grass-field horizon as a loader
- **Look:** A photoreal 3D field of grass blades silhouetted against a glowing dusk-orange horizon,
  with the wordmark rendered as if lit from behind the grass — atmospheric rather than a literal
  progress bar.
- **Fits:** A nature/wellness-adjacent brand's loading moment, or any hero wanting a cinematic,
  slow-burn first impression.
- **Sketch:** A Three.js/WebGL instanced-grass shader (or, cheaper, a well-lit looping video/WebM)
  with a bloom post-process on the horizon glow; wordmark as real DOM text with `mix-blend-mode:
  screen` so it reads as "glowing" against the dark grass.
- **Perf/a11y:** If using real 3D grass instancing, cap blade count and pixel ratio on mobile; offer
  a static-image fallback for `prefers-reduced-motion`/low-end GPUs.
- **Screenshot:** `northgarden-com/vp-0.png`

### 17. Circular "Check it live" CTA inside a split case-study card
- **Look:** A two-tone split card (dark panel with a tiny illustrated UI element / sage-green panel
  with serif project title and copy) ends in a perfectly circular outlined button reading "Check it
  live," with a numbered progress indicator ("1 ———— /3") for paging through more cases.
- **Fits:** A maxfolio case-study carousel or a project-detail modal.
- **Sketch:** `border-radius: 50%` button sized by `aspect-ratio: 1`, centered text via flex;
  progress indicator as a simple `<ol>` of case numbers with the active one's rule animated via
  `transform: scaleX()`.
- **Perf/a11y:** Ensure the circular CTA still has a comfortably large hit target (not just a tight
  circle around small text) — pad it well past the visible ring.
- **Screenshot:** `olhauzhykova-com-itg-html/vp-0.png`

### 18. Overlapping case-study thumbnails that clip the headline
- **Look:** Tilted, cascading project screenshots (phone notification mockups, tablet previews) are
  deliberately layered *in front of* the hero headline, clipping words like "Stay in. Lock them
  out" mid-sentence — the work is more important than a fully legible tagline.
- **Fits:** A confident, work-first personal portfolio hero.
- **Sketch:** Absolute-positioned, individually-rotated thumbnail cards with negative margins pulling
  them over the text block; z-index above the headline. Pair with filter tabs that show live counts
  ("Selected(14)/Archive(56)/Published(17)") using a small numeral badge component.
- **Perf/a11y:** Keep the *full* headline in the DOM (for SEO/screen readers) even though it's
  visually clipped — don't truncate the actual string, only its rendered visibility.
- **Screenshot:** `mschristensen-com/vp-0.png`

### 19. Extreme macro photography as a work-item background
- **Look:** A campaign case study opens with an extreme close-up (a single eye, lashes and pores
  visible) filling the entire viewport, the project name stamped in bold condensed type directly
  across the iris, with lightweight meta labels ("College Football · 2025") flanking it.
- **Fits:** Any agency/creative-studio work-list item wanting maximum visual drama for minimal
  layout effort.
- **Sketch:** One hero-quality macro photo per case (art-directed, not stock), title as an absolutely
  positioned overlay with a subtle drop-shadow or `mix-blend-mode` for legibility against skin tones;
  a slim scroll-progress bar pinned to the footer ties multiple cases together.
- **Perf/a11y:** One large photo per view — serve responsive `srcset` sizes; don't stack several
  macro photos on one page or the transfer cost compounds fast.
- **Screenshot:** `thiswasmajor-com/vp-0.png`

### 20. Playful live-counter badge on a sci-fi hero
- **Look:** A small pill badge reading "● ASTRONAUTS ABSORBED [42]" sits top-left of a full-bleed
  nebula/black-hole photo with a floating 3D astronaut figure, backed by tongue-in-cheek copy
  ("ORIGIN UNKNOWN. QUALITY UNDENIABLE.").
- **Fits:** A developer/technical persona that wants humor without undermining craft — the joke
  metric replaces a generic "visitors online" counter.
- **Sketch:** A simple incrementing counter (real page-view count, or a fun deterministic seed) in a
  pill component with a live-dot indicator (`animation: pulse`); keep the copy short enough to read
  in one glance.
- **Perf/a11y:** If the counter is real analytics data, debounce/poll it server-side rather than
  hammering an API client-side; the pulsing dot should honor `prefers-reduced-motion`.
- **Screenshot:** `rs69-dev/vp-0.png`

### 21. 3D isometric diorama replacing a literal hero photo
- **Look:** Instead of a portrait or product shot, the hero is a small 3D isometric "floating
  island" scene — a cozy desk, potted plant, campfire, easel, and a hand-painted "Welcome" sign — on
  a soft pastel gradient sky.
- **Fits:** A warm, approachable studio/freelancer hero that wants personality without showing a
  face or relying on stock photography.
- **Sketch:** Pre-rendered 3D scene exported as a single optimized image/WebP (or a lightweight
  Spline/Three.js embed if interactivity is wanted), floating via a slow CSS `translateY`
  bob-animation loop.
- **Perf/a11y:** Prefer a baked image over a live 3D engine unless real interactivity is planned —
  it's the cheaper way to get 90% of the charm; keep the bob animation subtle and pausable.
- **Screenshot:** `plantpot-studio/vp-0.png`

### 22. Newspaper masthead with a heraldic personal crest
- **Look:** A name is set in huge serif capitals split around a small ornate shield/crest logo
  bearing initials and a Latin-style motto, flanked by dotted-border info boxes ("Based in Geneva" /
  a one-line credibility statement), above a halftone-dot black-and-white portrait.
- **Fits:** A consulting/professional-services personal brand wanting old-world authority rather than
  startup energy.
- **Sketch:** An SVG crest (simple geometric shield + monogram, no need for real heraldry skill),
  `border: 1px dashed` info boxes, and a CSS `background-blend-mode` or SVG filter to fake the
  halftone-dot photo treatment from a normal photograph.
- **Perf/a11y:** The halftone filter can be pre-baked into the image asset (cheaper than a live CSS
  filter) if it won't need to change.
- **Screenshot:** `petersand-eu/vp-0.png`

### 23. Full sentence-as-headline bio
- **Look:** Rather than a name + a tagline, the entire hero is one grammatically complete sentence
  set in giant display type: "Tom Sears is a designer and creative director from England based in
  New York City," followed by a smaller "Intro" paragraph with more detail.
- **Fits:** A no-nonsense personal-portfolio hero for someone who wants the facts up front, fast.
- **Sketch:** A single `<h1>` sized with `clamp()` fluid type, line-wrapped naturally (no manual
  `<br>`s) so it degrades gracefully at any viewport width.
- **Perf/a11y:** Zero extra assets — this is one of the cheapest, most accessible hero patterns in
  the set (pure semantic text, correct heading level, no image dependency).
- **Screenshot:** `tomsears-me/vp-0.png`

### 24. Literal asset-loading progress as loader copy
- **Look:** A retro pixel-font "Booting..." screen shows a dashed-border progress bar and states
  exactly what's loading in real time: "9 of 12 File Loaded: /fonts/chill.json" — the loading copy
  *is* the actual technical progress, not a generic spinner.
- **Fits:** A technical/developer-facing maxfolio loader, paired well with the BBS and CRT loaders
  above as a recurring "retro computer boot" motif this sweep surfaced independently three times.
- **Sketch:** Hook into the actual asset-preloader's `onProgress` callback (fonts, key images, 3D
  assets) and render `${loaded} of ${total} File Loaded: ${lastAssetName}` in a monospace pixel
  font; fall back to a generic "Loading…" if the real manifest isn't available.
- **Perf/a11y:** Because it reflects real progress, it can't lie/stall — cap total preloaded assets
  so the bar reliably completes; announce completion via `aria-live="polite"` once done.
- **Screenshot:** `edwardh-io/vp-0.png`

### 25. Live-data dashboard preview cards as proof-of-work
- **Look:** Three rounded cards below the hero show *actual-looking* live product screens (a course
  membership portal, a client document area, a KPI dashboard with trend sparklines) each tagged
  "LIVE," instead of static case-study thumbnails — implying "click through and this is really
  running."
- **Fits:** A dev/agency portfolio section proving SaaS/tool-building work is real and operating, not
  just mockups.
- **Sketch:** Either embed sandboxed live iframes of real staging demos, or ship high-fidelity static
  screenshots refreshed periodically via a build step — either way, label clearly which it is so the
  "LIVE" badge stays honest.
- **Perf/a11y:** If using live iframes, lazy-load them below the fold and cap their count (three is
  already a lot of embedded app weight); never fake a "LIVE" badge on a static screenshot.
- **Screenshot:** `lucasammarco-com/vp-0.png`

### 26. Skewed full-bleed photo within a rectangular frame
- **Look:** The hero photograph itself is rotated a few degrees off-axis inside its bounding box
  (rather than the box being rotated), so the photo's horizon line cuts diagonally across an
  otherwise normal rectangular hero — a small, deliberate visual tension.
- **Fits:** A music/entertainment or motion-first brand hero wanting energy without full
  scroll-jacking or WebGL cost.
- **Sketch:** `transform: rotate(-3deg) scale(1.1)` on the image only (the `scale` compensates so no
  background shows through the rotated corners), container `overflow: hidden`.
- **Perf/a11y:** Purely CSS — no JS or extra asset cost; keep the rotation subtle (2-4deg) so the
  image content stays legible.
- **Screenshot:** `silent-house-com/vp-0.png`

## 3. Avoid list

- **Interaction-gated content invisible to any static/first-paint capture** (`pedrobelleza-com`
  stuck behind "CONNECT," `adcker-com-services` blank until ~35% scroll, `rishabh-upadhyay-com`,
  `mystella-me-ja-book-features`, `laurentiwebdesign-it`, `aboutluca-com`, `arkon-digital` all
  static/blank past their loader) — seven of the 46 index sites never painted real content in our
  capture window. If the loader/gate *is* the whole design idea (as with the BBS gate), that's fine;
  but if real content is meant to be the payoff, always ship a no-JS/reduced-motion fallback that
  paints something within the first couple of seconds, or a slow connection and every crawler sees
  nothing.
- **Cookie banner + numeric-percent loader compounding to block 100% of the viewport**
  (`375-studio-en` — an 18% loader plus a full-width GDPR banner left literally zero real content
  visible at any of our three scroll depths). Never let two blocking overlays stack; resolve consent
  before or after the loader, never during it.
- **Bad/stale outbound-link resolution** (`maciejbaska-com` now serves an unrelated Taboola
  content-farm page; `lucas-yalman-com` is a paused Vercel deployment) — both excluded from the
  index. A reminder for any future scraping pass: verify the resolved "live site" still belongs to
  the person/studio named in the listing before trusting it as a design reference.
- **Generic personal-injury-lawyer template cluster** (`mylawcompany-com`, `paulandsteve-com`,
  `facchettilaw-com` — all three came from the same "personal" tag false-positive on "personal
  injury lawyer" listings) — near-identical stock-photo-lawyer-plus-phone-number templates with
  almost no distinguishing design decisions. Useful as a reminder that a tag/keyword scrape will
  pull noise alongside signal; don't mine these for patterns.
- **Heavy transfer for a background/hero payoff** (`idyllic-co-nz-about` ~195MB, `adcker-com-services`
  ~118MB, `thiswasmajor-com` ~87MB, `silent-house-com` ~59MB, `olhauzhykova-com-itg-html` ~61MB) —
  several sites moved tens to ~200MB for a single hero image/video moment. Budget a hard per-hero
  transfer ceiling and compress/responsive-size aggressively; a single portrait or villa photo has
  no business costing 100+MB.
- **Empty media slot left in a shipped case study** (`infosion-de-projekte-koelnturm` — a bordered
  placeholder box never received its image/video within the capture window) — always verify a case
  study's hero media actually renders before publishing; an empty rounded rectangle reads as a bug,
  not a design choice.
- **Decorative-only "LIVE" badges without a real-time source** — several dashboard/counter patterns
  in this set (the astronauts-absorbed counter, the LIVE-tagged product cards, the local-time
  stamps) are genuinely charming, but only when the data backing them is real or at least plausible
  and consistently updated. A "LIVE" label on a static screenshot that never changes is a promise
  the design breaks the moment someone checks twice — borrow the visual language, keep the data
  honest.
