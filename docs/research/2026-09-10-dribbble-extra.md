# Dribbble References — Lens "dribbble-extra" (120+ MORE shots, deduped)

Source: 18 Dribbble search queries (`portfolio-website`, `personal-website`, `developer-portfolio`,
`designer-portfolio`, `portfolio-dark`, `portfolio-landing-page`, `resume-website`, `case-study-page`,
`about-page`, `timeline-ui`, `experience-timeline`, `stats-cards`, `skills-section`, `tech-stack`,
`footer-design`, `contact-section`, `bento-portfolio`, `3d-portfolio`), each scrolled 5-6x for lazy
load, `/shots/<id>` links collected, then each shot page opened and its main media element
screenshotted. Two Playwright/Chromium passes (1440x900, real Chrome UA, `domcontentloaded` + 1.5s
settle, ≤1 req/2s to dribbble.com, deduped against every existing `refs4/*/<slug>` folder including
`dribbble-portfolio`'s prior 96):

1. **Main sweep** — visited the first 162 (of 594 dedup'd) candidate URLs in query-discovery order.
   Because the first 5 queries alone surfaced >160 unique shots, this pass ended up almost entirely
   `personal-website` / `developer-portfolio` / `designer-portfolio` / `portfolio-dark` /
   `portfolio-landing-page` — the later, more section-specific queries (footer, contact, timeline,
   stats, skills, tech-stack, bento, 3d, case-study, about-page, resume) got crowded out to near-zero.
2. **Supplemental sweep** (`refs4-dribbble-extra-supp.mjs`) — ran the 12 underrepresented queries
   again with a 5-per-query cap so the section-by-section gallery below has real coverage instead of
   being backfilled from unrelated shots.

**Total: 222 shots** (162 + 60), saved under `refs4/dribbble-extra/<3-digit-index>-<id>-<slug>/` as
`shot.png` (element screenshot of the shot media, falling back to full viewport when the element
selector missed) + `vp-0.png` (top-of-page viewport) + `meta.json` (title, author, Dribbble tags,
originating query, URL). No CAPTCHA/login walls hit. Index files:
`refs4/dribbble-extra/_index.json` (162) + `refs4/dribbble-extra/_index-supp.json` (60).

**Method limitation, stated plainly:** with 222 shots, this digest does not carry an individually
written note for every single one. **44 shots were opened and visually reviewed** (spread across all
18 queries, weighted toward the 12 section-specific ones so every section-gallery slot below is a
real, checked screenshot, not a guess). Those 44 make up the INDEX table in §1. The remaining 178 are
listed in §1b as a compact reference table (slug · title · originating query · URL) — real captures,
real metadata, just not individually described. Treat §1b as a lookup list, not a curated pick.

A second honest limitation: Dribbble's own "boosted" placements and mismatched carousel frames
surfaced inside otherwise-relevant searches — see §4 Avoid.

## 1. INDEX — 44 visually-reviewed shots

| # | slug | title | style family | section types seen | what makes it good / notable | screenshot |
|---|---|---|---|---|---|---|
| 1 | `006-25400316-juun-j...` | JUUN.J — Bold Minimalist Fashion About Us | minimal/apple, luxury/fashion | typographic-hero, about-bio | Huge black "KNOW JUUN.J" wordmark crossing a mono photo grid; serif pull-quote "Passion Beyond Borders" | `dribbble-extra/006-.../shot.png` |
| 2 | `007-27288946-jh-editorial...` | JH — Editorial Art Director Portfolio | swiss/grid, editorial/magazine | typographic-hero, stats, process | Baseline-locked huge type interwoven with a portrait photo; numbered 01-04 process grid with a shoe-icon motif and "Track Record of Excellence" stat cards | `dribbble-extra/007-.../shot.png` |
| 3 | `014-21066046-...neobrutalism` | Personal Website Redesign — NeoBrutalism | neo-brutalist | typographic-hero | Textbook neo-brutalist: cream bg, thick black outline browser-window frame, pastel cut-out shapes, Figma/Dribbble stickers, yellow CTA pill | `dribbble-extra/014-.../shot.png` |
| 4 | `030-2050775-personal-website-animation` | Personal Website Animation (Nathan Riley) | dark-mode, luxury/fashion | typographic-hero | Navy hero, gold constellation line-art behind a gold serif name; minimal social-icon row | `dribbble-extra/030-.../shot.png` |
| 5 | `036-24176227-kanye-west...` | Kanye West — Personal Website Concept | editorial/magazine, dark-mode | typographic-hero | Bleeding black/white wordmark overlapping a portrait on a rock-texture bg; dark editorial nav (about ye / spotify / itunes / deezer) | `dribbble-extra/036-.../shot.png` |
| 6 | `041-27265179-ai-skincare...` | AI Skincare Cosmetologist Landing Page | minimal/apple | media-hero, stats | Face close-up with live AI-scan bounding boxes + a floating white card carrying 3 stat chips (87% accuracy, 22+ concerns, 1-day routine) | `dribbble-extra/041-.../shot.png` |
| 7 | `044-27037765-streamer...` | Streamer Personal Website UI | dark-mode, playful/illustration | stats, media-hero | Purple-to-dark streamer dashboard, illustrated avatar, live follower-count row across Twitch/YouTube/Kick | `dribbble-extra/044-.../shot.png` |
| 8 | `052-27207459-high-converting...` | High-Converting Developer Portfolio Website | editorial/magazine | split-hero, skills-stack, services | Warm cream/orange split hero (portrait + tech-icon row) plus pricing-card-style "Monthly Retainer $1200 / Project-Based" service cards | `dribbble-extra/052-.../shot.png` |
| 9 | `056-26488216-brave...` | brave: Developer Portfolio Website Design | terminal/hacker | typographic-hero | Pink bg framing a dark macOS-chrome window with a literal terminal hero: `$ git commit -m "Transforming ideas into intelligent code"` | `dribbble-extra/056-.../shot.png` |
| 10 | `059-27614082-lumen-studio...` | Lumen Studio — Creative Developer Portfolio | minimal/apple | split-hero, services | Clean green/cream two-tone hero, "Design + Code" split headline, rounded orange CTA + stat row | `dribbble-extra/059-.../shot.png` |
| 11 | `064-14013010-folio...` | Folio: Designer Portfolio Kit — Animation | glass/gradient, playful/illustration | split-hero, typographic-hero | Light/purple split hero with a floating isometric cluster of pastel 3D cubes/spheres | `dribbble-extra/064-.../shot.png` |
| 12 | `066-15358440-brand-designer...` | Brand Designer — Portfolio & Science website | dark-mode | typographic-hero, media-hero | Near-black hero, huge monochrome moon-crater macro photo, lime circular menu button | `dribbble-extra/066-.../shot.png` |
| 13 | `074-25560298-fh-clean...` | FH — Clean Modern Architect Interior Designer Portfolio | editorial/magazine, luxury/fashion | work-grid, case-study-anatomy, footer-mega | Real-estate editorial layout: 3-photo strip of luxury homes with price tags, FAQ accordion, more property photography | `dribbble-extra/074-.../shot.png` |
| 14 | `079-26978697-bartkolenda...` | BartKolenda — Landspace Designer Portfolio Case Study | editorial/magazine | case-study-anatomy | Dark teal-green case-study cover: monitor mockup + business-card + mobile-screen swatch cards | `dribbble-extra/079-.../shot.png` |
| 15 | `081-22728886-maison-cherie...` | Maison Chérie — Product Designer Portfolio | dark-mode, luxury/fashion | typographic-hero | Near-black/dark-green bg, oversized lime-green serif name; top bar shows a live local-time clock widget | `dribbble-extra/081-.../shot.png` |
| 16 | `084-23852527-3m-3d...` | 3M — 3D Designer Portfolio Landing Page | dark-mode, 3d/immersive | typographic-hero, 3d-hero | Dark noise-textured ribbed CGI blob sculpture behind huge "MINIMALIST" wordmark, teal-to-orange gradient underline bar | `dribbble-extra/084-.../shot.png` |
| 17 | `087-25082887-fashion-designer...` | Fashion Designer Portfolio (Flaunt) | dark-mode, luxury/fashion | typographic-hero | Near-black hero, thin neon diagonal lines, headline text cut through a bald model portrait | `dribbble-extra/087-.../shot.png` |
| 18 | `092-27641038-sahil-kumar...` | UI/UX Designer Portfolio — Sahil Kumar | dark-mode, playful/illustration | typographic-hero | Burgundy hero, huge outline-serif "DESIGNER", circular astronaut-helmet portrait filled with flowers | `dribbble-extra/092-.../shot.png` |
| 19 | `100-27144452-crypto-portfolio...` | Crypto Portfolio Dark Mode Dashboard | dark-mode | stats | Matte-black/neon-green fintech dashboard, market-coin cards, line chart, glowing mascot-head icon | `dribbble-extra/100-.../shot.png` |
| 20 | `101-26802743-delani...` | Delani Portfolio — Dark Interactive Project Gallery | dark-mode | work-grid, services | Dark portfolio-as-SaaS-landing-page: an embedded light-mode "project preview" card sits inside the dark shell | `dribbble-extra/101-.../shot.png` |
| 21 | `102-20886816-bradley...` | Bradley — A Psychologist Portfolio Dark | dark-mode, glass/gradient | split-hero, contact-cta | Split dark/iridescent-swirl bg, seated portrait, floating "Need help? call" pill and appointment card | `dribbble-extra/102-.../shot.png` |
| 22 | `111-22843255-de-fi...` | De-fi Portfolio - Dark Mode | dark-mode | stats | Crypto-wallet dashboard, $97,921.74 balance, segmented vault-allocation bar chart, app-holdings list | `dribbble-extra/111-.../shot.png` |
| 23 | `123-20337569-solguruz...` | SolGuruz Dark Mode Design — Year in Review 2022 | dark-mode | work-bento, work-grid | Dense tiled grid of phone-screen mockups (wallet, CRM, salon booking, auction, ride-hailing) — an "app portfolio wall" | `dribbble-extra/123-.../shot.png` |
| 24 | `125-27131610-streetlight...` | Streetlight Films — Cinematic Production Studio | dark-mode, luxury/fashion | typographic-hero, testimonials, blog-notes, contact-cta | Cinematographer portrait hero, testimonial quote cards, blog/insights tiles, contact form | `dribbble-extra/125-.../shot.png` |
| 25 | `130-27655384-sneaker-resale...` | Sneaker Resale App — Portfolio Dashboard, Dark UI, 3D Data Viz | dark-mode, 3d/immersive, glass/gradient | stats, 3d-hero | Ribbed-metal green-teal gradient bg, phone mockup with italic serif price headline + soft 3D blob data-viz shape | `dribbble-extra/130-.../shot.png` |
| 26 | `138-27158301-iran-kolvac...` | Iran Kolvac — Personal Portfolio · Light & Dark · Swiss Design | swiss/grid | typographic-hero | Literal Swiss-grid minimal type: name/availability/socials in a thin top row, then giant "WEB DESIGNER" wordmark below | `dribbble-extra/138-.../shot.png` |
| 27 | `144-23446738-frameup...` | Frameup — Photographer Portfolio Landing Page | editorial/magazine, brutalist | typographic-hero, work-grid | Black/white/red trio panel, overlapping "FRAMEUP" wordmark over a portrait, rotated-polaroid masonry work grid | `dribbble-extra/144-.../shot.png` |
| 28 | `148-25069282-recognify...` | Recognify — Personal Branding Portfolio | dark-mode | typographic-hero | Muted portrait with a red facial-recognition grid-line overlay, oversized red-underlined "RECOGNIFY" wordmark | `dribbble-extra/148-.../shot.png` |
| 29 | `153-27396355-arch-living...` | Arch Living — Architectural Portfolio Landing Page | editorial/magazine, luxury/fashion | work-grid, typographic-hero | Angled floating-monitor mockup over a dark ridged surface; dark-green "CREATE & BUILD" architecture spread | `dribbble-extra/153-.../shot.png` |
| 30 | `156-25369587-zylo...` | Zylo — 3D Design Agency Portfolio Landing Page | glass/gradient, 3d/immersive | typographic-hero, services, 3d-hero | Deep-violet gradient bg, glossy chrome woven-torus 3D render, "INNOVATE / DESIGN / VISUALIZE 3D" stacked headline | `dribbble-extra/156-.../shot.png` |
| 31 | `160-27432578-nyx-alexa...` | Nyx Alexa — Influencer & Creator Portfolio | editorial/magazine, luxury/fashion | split-hero, stats, work-grid | Warm cream split-hero, sunglasses portrait, follower/engagement/impressions stat row, photo-grid strip | `dribbble-extra/160-.../shot.png` |
| 32 | `162-27150123-art-director...` | Art Director Portfolio Landing Page UI Design | editorial/magazine, minimal/apple | typographic-hero, testimonials, logos | Condensed bold headline, tag-list sidebar (B2B/POS/WEB3/AI SAAS), team-headshot trust row, testimonial cards | `dribbble-extra/162-.../shot.png` |
| 33 | `164-27382422-footer-design...` | Footer Design, Web Footer, Navigation | glass/gradient | footer-mega, contact-cta | Pastel blue-to-mint gradient band with a "Ready to Start Your Healing Journey?" CTA panel embedded inside the footer, then link columns | `dribbble-extra/164-.../shot.png` |
| 34 | `169-27643961-minima-footer...` | Minima Footer & Contact Section | dark-mode | footer-mega, contact-cta | Deep-charcoal footer, huge "Start your journey with us." headline, location/phone/hours columns, inline newsletter pill | `dribbble-extra/169-.../shot.png` |
| 35 | `174-27636847-activity-timeline...` | Activity Timeline UI for SaaS Analytics Dashboard | minimal/apple | timeline | Literal vertical activity-log timeline: timestamped entries, AI-agent-triggered email log, avatar + status chips | `dribbble-extra/174-.../shot.png` |
| 36 | `190-26449673-soft-skills...` | Soft Skills Section — Consulting Portfolio Website | swiss/grid | skills-stack | Skills-as-grid-cells: one big headline cell + bordered cells per soft skill (communication, leadership…) | `dribbble-extra/190-.../shot.png` |
| 37 | `197-27555299-modular-infra...` | Modular Infra — Isometric Tech Stack Landing Page | 3d/immersive | skills-stack, logos | Isometric 3D tablet mockup showing a node-diagram data-flow graphic ("Observe, Synthesise, Simulate, Build") + client-logo strip | `dribbble-extra/197-.../shot.png` |
| 38 | `200-25549021-bentolio...` | Bentolio (Bento Portfolio) | dark-mode, bento | work-bento, stats | Black bento grid, portrait+intro card, featured-work tiles carrying lime-green stat highlight chips | `dribbble-extra/200-.../shot.png` |
| 39 | `202-27142376-neon-terminal...` | Neon Terminal — Cyber-Bento Portfolio for Backend Engineers | dark-mode, terminal/hacker, bento | work-bento, skills-stack | Black bento grid with monospace name-block cells, tech-badge pills (Python/Django/React/TS/Tailwind), social-icon tiles | `dribbble-extra/202-.../shot.png` |
| 40 | `204-27412412-3d-portfolio...` | 3D Portfolio (+AI) — WebGL / ThreeJS / WordPress (Bersus) | minimal/apple, 3d/immersive | typographic-hero, 3d-hero | Pure white bg, giant black slab-serif "BERSUS", monochrome 3D marble-statue figure holding a bat, chess pieces scattered, "Ask Bersus Ai..." input bar | `dribbble-extra/204-.../shot.png` |
| 41 | `208-27153015-norm...` | Norm — Case Studies Page | swiss/grid | case-study-anatomy, logos | Clean B2B SaaS case-study index: bold "Case studies" headline, logo-wall row, story-card list with "Full story" links | `dribbble-extra/208-.../shot.png` |
| 42 | `216-26014911-bravio...` | Bravio — Agency About Page | editorial/magazine | about-bio, testimonials | "We take pride in delivering Exceptional results" + founder/team photo grid, "Meet the team" headshot row, Awards list, testimonial cards | `dribbble-extra/216-.../shot.png` |
| 43 | `218-20253791-cv-resume...` | CV / Resume — Website Concept 2023 (Mionsili) | swiss/grid | timeline, about-bio | Literal résumé-as-webpage: red top accent bar, photo+bio sidebar, Experience/Education/Awards/Hobby timeline columns | `dribbble-extra/218-.../shot.png` |
| 44 | `222-27567211-creative-personal...` | Creative Personal Portfolio Website (Pixiio) | luxury/fashion, editorial/magazine | typographic-hero, work-list | Warm red-orange duotone portrait hero "Crafting Digital Products.", vertical sidebar stack of project-mockup thumbnails | `dribbble-extra/222-.../shot.png` |

## 1b. Remaining 178 captured shots (not individually reviewed — real screenshots, title/query only)

Full machine-readable list: `refs4/dribbble-extra/_index.json` (162 main-sweep entries) and
`refs4/dribbble-extra/_index-supp.json` (60 supplemental entries) — each row has `slug`, `title`,
`url`, `queryTag`, and the folder holding `shot.png` + `vp-0.png` + `meta.json`. Titles alone are a
strong signal for this lens specifically: Dribbble portfolio-search results are overwhelmingly
personal-brand hero shots for developers/designers, so most of the un-reviewed 178 are additional
variations on the same handful of patterns already catalogued above (dark hero + name wordmark,
split hero + photo, template-grade "Dark Portfolio for Framer" reskins — see §4 Avoid) rather than
novel section types. Spot-check any slug directly: e.g. `refs4/dribbble-extra/050-20386054-.../shot.png`.

## 2. Style-family gallery — 5 best per family

**dark-mode**: `092-27641038-.../shot.png` (surreal flower-helmet portrait) · `148-25069282-.../shot.png` (biometric grid-overlay portrait) · `123-20337569-.../shot.png` (app-mockup wall) · `202-27142376-.../shot.png` (terminal bento) · `111-22843255-.../shot.png` (crypto dashboard)

**minimal/apple**: `041-27265179-.../shot.png` (AI skincare stat card) · `059-27614082-.../shot.png` (green/cream split hero) · `204-27412412-.../shot.png` (Bersus statue+wordmark) · `174-27636847-.../shot.png` (SaaS activity timeline) · `162-27150123-.../shot.png` (art director trust row)

**editorial/magazine**: `007-27288946-.../shot.png` (JH baseline-type hero) · `074-25560298-.../shot.png` (Fahrenheit real-estate editorial) · `144-23446738-.../shot.png` (Frameup trio-panel) · `216-26014911-.../shot.png` (Bravio team/awards) · `160-27432578-.../shot.png` (Nyx Alexa influencer split-hero)

**swiss/grid**: `138-27158301-.../shot.png` (Iran Kolvac literal Swiss type) · `190-26449673-.../shot.png` (skills-as-grid-cells) · `208-27153015-.../shot.png` (Norm case-study index) · `218-20253791-.../shot.png` (résumé-as-webpage) · `007-27288946-.../shot.png` (JH — also swiss)

**luxury/fashion**: `006-25400316-.../shot.png` (JUUN.J fashion about) · `081-22728886-.../shot.png` (Maison Chérie live-clock nav) · `087-25082887-.../shot.png` (Flaunt neon-line fashion) · `125-27131610-.../shot.png` (Streetlight Films cinematic) · `222-27567211-.../shot.png` (Pixiio duotone hero)

**3d/immersive**: `084-23852527-.../shot.png` (3M ribbed CGI blob) · `156-25369587-.../shot.png` (Zylo chrome torus) · `204-27412412-.../shot.png` (Bersus marble statue) · `197-27555299-.../shot.png` (isometric tech-stack diagram) · `130-27655384-.../shot.png` (sneaker-resale 3D data-viz)

**glass/gradient**: `064-14013010-.../shot.png` (isometric pastel-cube cluster) · `156-25369587-.../shot.png` (Zylo violet gradient) · `164-27382422-.../shot.png` (pastel footer gradient band) · `102-20886816-.../shot.png` (iridescent-swirl psychologist bg) · `130-27655384-.../shot.png` (ribbed metal gradient)

**bento**: `200-25549021-.../shot.png` (Bentolio lime-highlight tiles) · `202-27142376-.../shot.png` (Neon Terminal cyber-bento) · `123-20337569-.../shot.png` (app-mockup grid, bento-adjacent)

**terminal/hacker**: `056-26488216-.../shot.png` (literal `git commit` terminal hero) · `202-27142376-.../shot.png` (Neon Terminal bento)

**neo-brutalist / brutalist**: `014-21066046-.../shot.png` (NeoBrutalism cream/pastel outline UI) · `144-23446738-.../shot.png` (Frameup overlapping-type brutalist edge)

**playful/illustration**: `064-14013010-.../shot.png` (isometric shape cluster) · `044-27037765-.../shot.png` (illustrated streamer avatar) · `092-27641038-.../shot.png` (flower-helmet surreal portrait)

## 3. Section-by-section gallery — for each section type, best available shots

**typographic-hero** (well covered): `014-21066046-.../shot.png` · `138-27158301-.../shot.png` · `204-27412412-.../shot.png` · `092-27641038-.../shot.png` · `156-25369587-.../shot.png`

**split-hero**: `052-27207459-.../shot.png` · `059-27614082-.../shot.png` · `064-14013010-.../shot.png` · `102-20886816-.../shot.png` · `160-27432578-.../shot.png`

**media-hero**: `041-27265179-.../shot.png` · `066-15358440-.../shot.png` · `044-27037765-.../shot.png`

**3d-hero**: `084-23852527-.../shot.png` · `156-25369587-.../shot.png` · `204-27412412-.../shot.png` · `130-27655384-.../shot.png`

**about-bio**: `006-25400316-.../shot.png` · `216-26014911-.../shot.png` · `218-20253791-.../shot.png` · `033-26645851-.../shot.png` (filmstrip candid-photo about page, main sweep)

**services**: `052-27207459-.../shot.png` (pricing cards) · `059-27614082-.../shot.png` · `156-25369587-.../shot.png` · `101-26802743-.../shot.png`

**work-list**: `222-27567211-.../shot.png` (sidebar thumbnail stack)

**work-grid**: `074-25560298-.../shot.png` · `144-23446738-.../shot.png` · `153-27396355-.../shot.png` · `160-27432578-.../shot.png` · `101-26802743-.../shot.png`

**work-bento**: `200-25549021-.../shot.png` · `202-27142376-.../shot.png` · `123-20337569-.../shot.png`

**case-study-anatomy**: `079-26978697-.../shot.png` · `074-25560298-.../shot.png` · `208-27153015-.../shot.png`

**logos**: `162-27150123-.../shot.png` (trust row) · `208-27153015-.../shot.png` (logo wall) · `197-27555299-.../shot.png` (client-logo strip)

**testimonials**: `125-27131610-.../shot.png` · `162-27150123-.../shot.png` · `216-26014911-.../shot.png`

**process**: `007-27288946-.../shot.png` (numbered 01-04 process grid)

**timeline**: `174-27636847-.../shot.png` · `218-20253791-.../shot.png`

**stats**: `041-27265179-.../shot.png` · `044-27037765-.../shot.png` · `111-22843255-.../shot.png` · `100-27144452-.../shot.png` · `160-27432578-.../shot.png`

**skills-stack**: `190-26449673-.../shot.png` · `202-27142376-.../shot.png` · `197-27555299-.../shot.png` · `052-27207459-.../shot.png`

**blog-notes**: `125-27131610-.../shot.png` (insights tile row)

**contact-cta**: `164-27382422-.../shot.png` · `169-27643961-.../shot.png` · `102-20886816-.../shot.png` (floating "need help?" pill)

**footer-mega**: `164-27382422-.../shot.png` · `169-27643961-.../shot.png` · `074-25560298-.../shot.png`

**Not covered in this lens** (no real shot to point to — honest gap, not a claim these don't exist): video-hero, list-hero, magnetic-nav, dock-nav, side-rail-nav, fullscreen-menu, footer-minimal, footer-playful, loader, custom-cursor, page-transition, scroll-effect, marquee. These are portfolio-*site* interaction patterns that a static single-image Dribbble shot rarely captures — they showed up in the earlier `dribbble-portfolio` and `awwwards-portfolio-*` lenses (live sites, multi-viewport scroll capture) instead. Pull those lenses' entries for this category.

## 4. Idea catalog — 27 reusable ideas

### 1. Terminal-chrome code-commit hero
- **Look:** A dark macOS-style browser-chrome window (red/yellow/green dots, fake URL bar) framed on
  a bright flat-color background, containing a monospace terminal line that types out a headline as
  a fake shell command: `$ git commit -m "Transforming ideas into intelligent code"`.
- **Fits:** Arcade theme hero, or a terminal/hacker easter-egg mode inside Menu theme.
- **Sketch:** Static chrome-window `<div>` (border-radius, 3 dot spans), monospace font, headline
  text revealed via a CSS `steps()` typewriter animation or a small JS interval; blinking `|` cursor
  as a `::after` with `animation: blink 1s step-end infinite`.
- **Perf/a11y:** Pure CSS/DOM, near-zero cost. Put the real headline in a visually-hidden `<h1>` so
  screen readers don't get a stream of partial characters; `aria-hidden` the animated span.
- **Screenshot:** `dribbble-extra/056-26488216-.../shot.png`

### 2. Flower-filled astronaut-helmet portrait
- **Look:** A circular crop of a portrait where the subject's head is replaced/overlaid with an
  astronaut-helmet silhouette filled with real flowers — surreal, high-contrast, centered behind a
  huge outline-only serif wordmark ("DESIGNER").
- **Fits:** Arcade theme (surreal/game-art energy) or Soft UI as a single striking accent image.
- **Sketch:** A `clip-path: circle()` mask on a composited image (portrait + flower texture,
  pre-composed in the image asset — not runtime compositing), with the outline-text as an SVG
  `<text>` with `stroke` only, `fill: none`, layered behind via `z-index`.
- **Perf/a11y:** One optimized image; `alt` text describes the actual photo content, not the effect.
- **Screenshot:** `dribbble-extra/092-27641038-.../shot.png`

### 3. Biometric facial-recognition grid overlay
- **Look:** A muted-tone portrait with thin red grid lines and small corner-bracket markers overlaid
  on the face, like a facial-recognition scan UI, paired with a huge red-underlined wordmark.
- **Fits:** Brutalist or Arcade theme hero — reads as tech/surveillance aesthetic.
- **Sketch:** SVG `<line>`/`<rect>` grid absolutely positioned over the `<img>`, `mix-blend-mode:
  screen` on a red stroke color so it reads as a scan overlay without fully obscuring the photo;
  optional subtle `stroke-dashoffset` animation on load to suggest a scanning sweep.
- **Perf/a11y:** SVG lines are cheap; keep the animation under ~800ms and respect
  `prefers-reduced-motion` by skipping the sweep.
- **Screenshot:** `dribbble-extra/148-25069282-.../shot.png`

### 4. Chrome/glass woven-torus 3D hero
- **Look:** A glossy, iridescent chrome ring/torus rendered in 3D, twisted into a woven or braided
  form, floating against a deep-violet gradient background beside a bold sans headline.
- **Fits:** Luxury theme or a "3D showcase" hero variant of Apple Clean.
- **Sketch:** Pre-rendered PNG/WebP sequence or a lightweight `<model-viewer>`/three.js GLTF with an
  environment map for the chrome reflection; static image is far cheaper and nearly indistinguishable
  at hero scale — prefer that unless the object needs to rotate on scroll.
- **Perf/a11y:** If using three.js, lazy-load the canvas only after intersection; always ship a static
  poster image as the LCP element, swap to canvas after hydration.
- **Screenshot:** `dribbble-extra/156-25369587-.../shot.png`

### 5. Monochrome CGI ribbed-blob wordmark backdrop
- **Look:** A dark, noise-textured abstract 3D blob with dense parallel ribbing (like folded fabric
  or sound-wave terrain) sitting directly behind a huge flat "MINIMALIST" wordmark, with a thin
  horizontal teal-to-orange gradient bar beneath as the only color accent.
- **Fits:** Apple Clean or Luxury hero — the restraint (grayscale + one gradient bar) reads premium.
- **Sketch:** One high-res still render as a background `<img>`/`background-image`, headline as
  regular HTML text on top; gradient bar is a simple `linear-gradient` div, optionally animated with
  a slow `background-position` shift.
- **Perf/a11y:** Zero JS needed; compress the render aggressively (it's mostly grayscale noise, WebP
  handles it well).
- **Screenshot:** `dribbble-extra/084-23852527-.../shot.png`

### 6. Marble-statue + AI chat-input hero
- **Look:** A photoreal monochrome 3D classical statue (holding a bat, oddly) standing in front of a
  giant flat black slab-serif wordmark on pure white, with scattered chess pieces on the ground and a
  pill-shaped "Ask [Brand] Ai..." search/chat input floating at the bottom.
- **Fits:** Apple Clean theme — the white-space-heavy, one-object-of-interest composition suits it,
  and the chat-input pill maps directly onto an "ask my portfolio a question" AI feature.
- **Sketch:** Statue render as a transparent-background PNG/WebP layered over the wordmark text (CSS
  `z-index`); input pill is a standard rounded `<input>` with a paper-plane icon button, `border-radius:
  999px`.
- **Perf/a11y:** The chat input needs a real `<form>`, `aria-label`, and keyboard focus ring — don't
  let the decorative statue distract from making the actual input accessible.
- **Screenshot:** `dribbble-extra/204-27412412-.../shot.png`

### 7. Live local-time + city nav strip
- **Look:** A slim top bar above the main nav showing the person's city and a live-updating clock
  ("Paris · 1:35 AM"), next to the site name and a "Menu" trigger — a small humanizing detail before
  the huge hero type.
- **Fits:** Any theme's header, especially Luxury (feels bespoke/concierge) or Menu theme.
- **Sketch:** `setInterval` updating a `<time>` element via `Intl.DateTimeFormat` with an explicit
  `timeZone`, formatted client-side after hydration (never render a live clock on the server — it will
  mismatch and cause hydration warnings, see the project's own `hidratacion-react-intl-sin-zona-horaria`
  memory note).
- **Perf/a11y:** Update once per minute, not per second — no visual need for seconds and it avoids
  needless re-renders; mark the whole strip `aria-live="off"` since it's decorative, not an alert.
- **Screenshot:** `dribbble-extra/081-22728886-.../shot.png`

### 8. Real-estate-style priced work-grid
- **Look:** A 3-photo horizontal strip of projects, each captioned like a property listing: project
  name, location/client, and a bold price/value figure beneath — repurposing real-estate marketing
  conventions for a design portfolio's case list.
- **Fits:** A "selected work" section in Luxury theme, especially for architecture/interior-adjacent
  case studies.
- **Sketch:** CSS grid, 3 equal columns, each a `<figure>` with `<img>` + `<figcaption>` holding two
  text rows (name/location, then a bold stat line) — no JS required.
- **Perf/a11y:** Standard `<img loading="lazy">` for below-the-fold instances; figcaption text should
  be real content, not just visual decoration, so it reads sensibly to screen readers.
- **Screenshot:** `dribbble-extra/074-25560298-.../shot.png`

### 9. Stat-chip-over-photo AI overlay
- **Look:** A close-up portrait photo with small floating white stat cards ("87% accuracy", "22+
  concerns analyzed", "1-day personalized routine") pinned at fixed points over the image, like an
  AI-analysis readout.
- **Fits:** Soft UI theme's about/skills section, or an "impact stats" block anywhere.
- **Sketch:** Absolutely positioned `<div>` cards over a `position:relative` image wrapper, each a
  small white rounded card with a number + label; stagger their entrance with a scroll-triggered
  fade/scale via `whileInView` in framer-motion.
- **Perf/a11y:** Keep card entrance animation under 400ms per card, staggered ~80ms apart; ensure text
  contrast inside the white cards meets AA against whatever sits behind them.
- **Screenshot:** `dribbble-extra/041-27265179-.../shot.png`

### 10. Bento tile with embedded mini-metric
- **Look:** Inside a bento grid, one tile shows a slider/graph micro-UI with a highlighted numeric
  delta in lime-green ("$10,000 → $14,000", "+4,000 profit", "3% Increase") — turning a portfolio
  proof-point into a tiny interactive-looking widget rather than plain text.
- **Fits:** Directly maps to maxfolio's stated "bento" pattern family — a strong Soft UI or Apple
  Clean bento-section tile.
- **Sketch:** One bento cell = a card with a small SVG sparkline/slider track plus a bold number;
  animate the number counting up with framer-motion's `useMotionValue` + `animate()` when the tile
  scrolls into view.
- **Perf/a11y:** Count-up animations should honor `prefers-reduced-motion` (snap straight to the final
  value); the number's meaning must also exist as plain text for screen readers, not just visual.
- **Screenshot:** `dribbble-extra/200-25549021-.../shot.png`

### 11. Terminal-styled bento cells for a dev persona
- **Look:** A black bento grid where the name/headline cell uses monospace type ("BACKEND DRIVEN
  SOLUTIONS"), paired with small square cells that are literal tech-badge pills (language/framework
  logos) and social-icon tiles — the whole grid reads like a terminal dashboard.
- **Fits:** A natural fit for maxfolio's Arcade theme (or a "dev mode" toggle inside any theme) —
  it's precisely the "game-menu, comic art" energy translated into a developer-portfolio bento.
- **Sketch:** CSS grid with `grid-template-areas`, monospace font stack, tech pills as small
  `<span>` chips with a colored left-dot indicator (à la a status light); hover state brightens the
  cell border like a terminal focus ring.
- **Perf/a11y:** Chips should be real `<li>` items in a list, not divs, so the tech stack is announced
  as a list to assistive tech.
- **Screenshot:** `dribbble-extra/202-27142376-.../shot.png`

### 12. Isometric node-diagram tech-stack visual
- **Look:** An isometric 3D tablet/device mockup displaying a node-and-line data-flow diagram
  ("Observe, Synthesise, Simulate, Build") with labeled connected blocks — turns a "tech stack" list
  into a small system-architecture illustration.
- **Fits:** A "how I work" or tech-stack section in Apple Clean or Luxury themes for engineering-heavy
  portfolios.
- **Sketch:** SVG diagram (rects + connecting paths with `marker-end` arrowheads), optionally animated
  with a `stroke-dasharray`/`stroke-dashoffset` draw-in on scroll for the connecting lines.
- **Perf/a11y:** SVG is lightweight; give the diagram a text alternative (a `<figcaption>` or visually
  hidden summary) since the labeled-node meaning won't reach screen-reader users otherwise.
- **Screenshot:** `dribbble-extra/197-27555299-.../shot.png`

### 13. Skills-as-bordered-grid-cells
- **Look:** Instead of a tag cloud or icon row, soft skills are laid out as a literal CSS grid of
  bordered cells — one big cell with the section headline, then one cell per skill with its own
  bolded label + a short paragraph, all sharing hairline borders like a spreadsheet.
- **Fits:** Swiss/grid-leaning sections in Apple Clean, or a dense "about me" sub-section.
- **Sketch:** `display:grid` with `border-collapse`-style shared 1px borders (negative margin trick or
  `outline` on each cell), headline cell spans multiple columns via `grid-column: span N`.
- **Perf/a11y:** Pure CSS, no JS; make sure cells are in reading order in the DOM so grid placement
  doesn't scramble screen-reader/keyboard tab order.
- **Screenshot:** `dribbble-extra/190-26449673-.../shot.png`

### 14. SaaS-style vertical activity timeline
- **Look:** A literal product-UI vertical timeline: timestamped log entries, each with an avatar,
  a status chip ("Triggered by: AI AGENT"), and a short description — borrowed from dashboard/CRM
  design rather than typical portfolio "career timeline" treatments.
- **Fits:** A more literal, data-driven "experience timeline" section for a product-designer or
  engineer portfolio (Apple Clean or Soft UI).
- **Sketch:** A left-aligned vertical line (`::before` on a container) with circular dot markers per
  entry (`::before` on each list item), entries as a simple `<ol>` for semantic ordering.
- **Perf/a11y:** Use a real ordered list; status chips need sufficient contrast and shouldn't rely on
  color alone to convey status (pair with an icon or text label).
- **Screenshot:** `dribbble-extra/174-27636847-.../shot.png`

### 15. Résumé-as-webpage two-column layout
- **Look:** A literal print-résumé layout ported to web: photo + bio + quick-facts sidebar on the
  left, Experience / Education / Awards / Hobby columns on the right, with a thin colored accent bar
  running along the very top edge.
- **Fits:** A dedicated `/resume` page or an "about" deep-dive page in Apple Clean or Menu theme.
- **Sketch:** CSS grid, `grid-template-columns: 1fr 2fr`, each right-column section a `<section>` with
  its own heading; the top accent bar is a simple fixed-height colored div.
- **Perf/a11y:** Straightforward static markup; keep heading hierarchy correct (one `h1`, then `h2`
  per section) since this page's whole purpose is being scannable/printable.
- **Screenshot:** `dribbble-extra/218-20253791-.../shot.png`

### 16. CTA panel embedded inside a gradient footer band
- **Look:** The footer isn't just links — a pastel gradient band at the top of the footer carries a
  full CTA panel (headline + two buttons) before the standard link-column grid begins beneath it.
- **Fits:** Any theme's footer, especially Soft UI (the pastel gradient suits it) as the final
  conversion moment before the page ends.
- **Sketch:** Footer `<footer>` contains a nested CTA `<div>` with its own background gradient and
  padding, sitting above a standard multi-column nav-link grid; no special JS needed.
- **Perf/a11y:** Ensure the CTA buttons are real `<button>`/`<a>` elements with clear focus states,
  not just styled divs, since footers are a common keyboard-tab endpoint.
- **Screenshot:** `dribbble-extra/164-27382422-.../shot.png`

### 17. Dark mega-footer with inline newsletter pill
- **Look:** A deep-charcoal footer with a large "Start your journey with us." headline on the left,
  location/phone/contact/hours as small label+value columns on the right, and a pill-shaped inline
  email-capture input at the far right.
- **Fits:** A footer-mega treatment for Luxury or Apple Clean themes.
- **Sketch:** Flexbox row, headline block flex-grow, info columns as a `<dl>` (label = `<dt>`, value
  `<dd>`), newsletter as a single `<input type="email">` with an inline submit-arrow button.
- **Perf/a11y:** The `<dl>` structure makes label/value pairs genuinely accessible; the email input
  needs a visible or `aria-label`ed label even if visually just a placeholder.
- **Screenshot:** `dribbble-extra/169-27643961-.../shot.png`

### 18. Halftone-dot avatar/icon treatment
- **Look:** A circular avatar or icon rendered in a coarse halftone-dot pattern (like newsprint),
  fading from dense dots at the center to sparse at the edges, used as a minimal decorative accent
  next to a short line of text.
- **Fits:** Brutalist or comic/manga-adjacent Arcade theme accents.
- **Sketch:** CSS `radial-gradient` with a repeating dot pattern (`background-image` using multiple
  `radial-gradient`s tiled via `background-size`), or a pre-rendered halftone PNG mask over a solid
  shape.
- **Perf/a11y:** Purely decorative — mark `aria-hidden="true"` and keep the real content (name/label)
  as normal text beside it.
- **Screenshot:** `dribbble-extra/133-27534707-.../shot.png`

### 19. Duotone portrait hero with sidebar thumbnail stack
- **Look:** A warm red-orange duotone-treated portrait fills the left/majority of the hero with a
  bold headline over it, while a narrow right-hand sidebar shows a scrolling stack of small project
  thumbnails with one-line captions and a "View Work" link each.
- **Fits:** A "featured work at a glance" hero variant for Luxury or Apple Clean.
- **Sketch:** Two-column flex hero (`flex: 3` / `flex: 1`), sidebar thumbnails as a simple vertical
  list, duotone via CSS `filter: grayscale(1) sepia(1) hue-rotate()` or a pre-processed image asset
  (pre-processed is cheaper and more reliable across browsers).
- **Perf/a11y:** If using the CSS filter approach, note it costs paint time on large images — prefer a
  baked-in duotone asset for the hero photo.
- **Screenshot:** `dribbble-extra/222-27567211-.../shot.png`

### 20. Overlapping bleed-type portrait hero
- **Look:** A name/word rendered at a size that deliberately bleeds off the viewport edges, printed
  directly over (not beside) a full-bleed portrait photo, with high-contrast black/white treatment.
- **Fits:** Brutalist theme hero, or a bold moment inside Luxury.
- **Sketch:** Headline as an absolutely positioned text block with `font-size: clamp(...)` scaling
  aggressively with viewport width, `mix-blend-mode: difference` or `overlay` against the photo so it
  stays legible regardless of the underlying image tone.
- **Perf/a11y:** `mix-blend-mode` is cheap; still provide a real, readable `<h1>` in the DOM (the
  visual treatment shouldn't compromise text-to-speech or copy-paste).
- **Screenshot:** `dribbble-extra/036-24176227-.../shot.png` and `dribbble-extra/144-23446738-.../shot.png`

### 21. Pricing-card-style service tiers on a dev portfolio
- **Look:** Below a standard hero, two side-by-side cards present service tiers like SaaS pricing —
  "Monthly Retainer $1200" vs "Project-Based Custom Price" — each with a bullet feature list and its
  own CTA button, repurposing pricing-page conventions for freelance service offerings.
- **Fits:** A "hire me" or services section in any theme aimed at freelance-facing portfolios.
- **Sketch:** Two-card flex/grid row, each card a bordered `<div>` with a price headline, `<ul>` of
  features, and a CTA `<button>`; highlight one tier with a colored top border or "Popular" ribbon if
  desired.
- **Perf/a11y:** Standard semantic list markup for features; ensure both CTA buttons have distinct,
  descriptive accessible names (not just "Get started" twice).
- **Screenshot:** `dribbble-extra/052-27207459-.../shot.png`

### 22. App-mockup wall as a portfolio grid
- **Look:** Instead of desktop-site screenshots, the work-grid is a dense tiled wall of phone-screen
  mockups from many different small projects (wallet app, booking app, auction app, ride-hailing app)
  — reads as breadth/volume of shipped work rather than a few hero case studies.
- **Fits:** A "shipped work" or "year in review" section for a product-designer portfolio, any theme.
- **Sketch:** CSS grid or masonry of fixed-aspect phone-frame `<figure>`s, each a cropped screenshot
  inside a simple rounded-rect phone bezel (CSS border + border-radius, no need for a literal device
  SVG frame at this density).
- **Perf/a11y:** With many images, lazy-load aggressively and use a lower-res thumbnail grid with a
  lightbox/expand-on-click for full detail rather than loading all full-res mockups at once.
- **Screenshot:** `dribbble-extra/123-20337569-.../shot.png`

### 23. Facial-recognition-style AI scan box on a live photo
- **Look:** A real face photo with a thin animated bounding-box/corner-bracket overlay, as if an AI
  vision model is actively scanning it, paired with a plain-language benefit headline underneath.
- **Fits:** An "AI-assisted" feature callout anywhere a portfolio wants to signal ML/vision work.
- **Sketch:** SVG corner brackets (4 small L-shaped paths) positioned over the image, with a subtle
  `stroke-dashoffset` sweep or `box-shadow` pulse animation to suggest active scanning.
- **Perf/a11y:** Keep the scanning motion subtle and looping slowly (2-3s cycle); respect
  `prefers-reduced-motion` by freezing the brackets in a static "locked on" state.
- **Screenshot:** `dribbble-extra/041-27265179-.../shot.png`

### 24. Case-study index as a clean logo-wall + story list
- **Look:** A B2B-style "Case Studies" landing section: bold headline, a horizontal row of client
  logos, then a vertical list of story cards each with a one-line result stat and a "Full story"
  link — no imagery required, purely typographic and data-driven.
- **Fits:** Apple Clean or Swiss/grid-leaning case-study index page.
- **Sketch:** Logo row as a flex row with `filter: grayscale(1)` on logos that colorizes on hover;
  story list as a simple `<ul>` of link rows with a trailing arrow icon.
- **Perf/a11y:** Logo images need real `alt` text naming the client/brand, not empty alts, since this
  is meaningful content (social proof), not decoration.
- **Screenshot:** `dribbble-extra/208-27153015-.../shot.png`

### 25. Team/awards about-page composite
- **Look:** An about page combining a founder photo grid, a "Meet the team" headshot row with
  name+role captions, an awards list with year tags, and testimonial quote cards — a single page
  doing the job of about + team + social-proof + press in one scroll.
- **Fits:** A comprehensive about page for Luxury or Apple Clean agency-style portfolios.
- **Sketch:** Stack of independent sections sharing consistent vertical rhythm; awards list as a
  `<dl>` or table-like row list (award name, description, year); testimonials as a horizontal-scroll
  or grid of quote cards.
- **Perf/a11y:** With this much content on one page, use proper heading levels per sub-section so a
  screen-reader user can jump between "Team", "Awards", "Testimonials" via heading navigation.
- **Screenshot:** `dribbble-extra/216-26014911-.../shot.png`

### 26. Crypto-dashboard-style stat/portfolio-value block
- **Look:** A dark fintech-dashboard aesthetic repurposed as a portfolio "value/impact" block: a huge
  dollar-style headline number, a segmented multi-color allocation bar, and a row of smaller
  supporting metric cards beneath — borrowed wholesale from crypto-wallet UI conventions.
- **Fits:** A results/impact-metrics section for a product or growth-focused portfolio, Arcade or
  Apple Clean theme.
- **Sketch:** Big number as a `<span>` with tabular-nums font-feature; segmented bar as a flex row of
  colored divs sized by `flex-basis` percentages; metric cards as a simple 3-4 column grid below.
- **Perf/a11y:** If animating the big number counting up, ensure the final static value is what's in
  the DOM for anyone with JS disabled or reduced motion — don't leave it stuck at 0.
- **Screenshot:** `dribbble-extra/111-22843255-.../shot.png` and `dribbble-extra/100-27144452-.../shot.png`

### 27. Tag-list sidebar next to a condensed bold headline
- **Look:** A hero pairs an extra-condensed, extra-bold headline ("DESIGN PARTNER & ART DIRECTOR")
  with a small vertical sidebar list of one-word industry tags (B2B, POS, WEB3, AI SAAS, MEDICAL,
  WELLNESS) — a compact way to signal breadth of domain experience without a paragraph.
- **Fits:** Apple Clean or Swiss/grid hero for a generalist portfolio spanning many industries.
- **Sketch:** Flex row: headline block + a narrow `<ul>` sidebar with small uppercase tag text, each
  item separated by generous line-height rather than visible borders/chips.
- **Perf/a11y:** Simple semantic list; no JS needed — the restraint here is entirely typographic.
- **Screenshot:** `dribbble-extra/162-27150123-.../shot.png`

## 5. Avoid — method limitations and low-value patterns

- **Shot/title mismatch.** A handful of "shots" resolve to something other than what the title
  promises — e.g. `001-27701885-el-pato-loco-murals` (titled a portfolio-adjacent search hit but is
  actually restaurant mural photography) and `017-27535567-mila-sky-...` (title says "music artist
  personal website"; the captured media is an unrelated agency ad banner — "Techwitpro / WE ARE
  WAITING FOR YOUR MESSAGE"). Likely a Dribbble "boosted" placement injected into the shot carousel.
  Don't trust a slug's title alone for the un-reviewed §1b entries — spot-check before using one.
- **Blank/blurred element captures.** Several shots are GIF/video-driven; the element screenshot
  landed mid-transition and came out solid gray, near-black, or motion-blurred (`021-...`, `022-...`,
  `105-...`, `115-...`, `184-...`). `vp-0.png` sometimes recovers more context but not always — these
  are weak references, listed for completeness rather than as usable visual data.
- **Template saturation.** A large share of the `portfolio-dark` and `portfolio-landing-page` queries
  are the *same* Framer/Webflow template reskinned with different names — "Dark Portfolio Website
  Template for Framer (Free)" appears at least twice (`127-...`, `132-...`) with near-identical
  layouts, and generic "Personal Website" titles recur >15 times with interchangeable centered-hero +
  photo layouts. Treat repeated near-identical titles as one data point, not several.
- **Dribbble page chrome bleeding into captures.** A few `shot.png` files caught an open nav dropdown
  or the sticky promo banner instead of clean media (`068-...`, `071-...` resolved to a stray logo
  mark, not case-study content) — `vp-0.png` is the fallback to check.
- Dribbble's own "Get 20% off... WELCOME20" promo banner appears at the top of nearly every capture —
  crop it out mentally; it is not part of any referenced design.

## Digest / capture pipeline

- Scripts: `scripts/.capture-cache/refs4-dribbble-extra.mjs` (main sweep, 162 shots) and
  `scripts/.capture-cache/refs4-dribbble-extra-supp.mjs` (supplemental per-query sweep, 60 shots) in
  the `max-folio-skills` repo. Both are resume-safe / dedupe against every existing `refs4/*` folder.
- Heuristic pre-tagging: `scripts/.capture-cache/refs4-dribbble-extra-categorize.mjs` writes
  `refs4/tags-dribbble-extra-auto.json` from shot titles + Dribbble tags + originating query (weak
  signal on its own — most of the real family/section tagging above came from visual review, not the
  heuristic). Kept as a sidecar for `build-library.mjs` to pick up partial coverage on the 178
  un-reviewed shots.
