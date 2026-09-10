# maxfolio.dev design references — Dribbble portfolio lens

Captured 2026-09-09. 96 Dribbble shots from `/search/portfolio`, `/search/portfolio-website`,
`/search/developer-portfolio`, `/tags/portfolio` (206 candidate shot links collected, 96 visited).
Each shot has `full.png` (full-page, capped by Playwright's own render limits), `vp-0.png`,
`vp-35.png`, `vp-70.png` (viewport at 0/35/70% scroll — **these are the reliable images**; Dribbble
lazy-loads the actual shot media via IntersectionObserver, so `full.png` frequently shows grey
placeholder blocks for imagery below the fold that never entered the viewport during the
single-shot capture — the `vp-*` shots at each scroll depth trigger and capture the real content).
All screenshots at 1440×900, Chromium, normal desktop UA. Root:
`C:\Users\Usuario\AppData\Local\Temp\claude\C--Users-Usuario-Desktop-P-Github-Digitdeck\75fa9a07-350d-4734-9d2e-ac255cc6dd8f\scratchpad\refs4\dribbble-portfolio\<slug>\`.

Dribbble shots are **static designs** (no live motion to observe) — the catalog below extracts
layout, typography, data-display and color ideas; motion timing/easing suggestions are my own
sensible defaults for framer-motion, not something visible in a static shot.

---

## 1. Site/shot table

Legend: 🔎 = deep-dived (full visual read, multiple viewport captures inspected) for the catalog
below; the rest are catalogued by title/author/thumbnail context only (available for a follow-up
deep-dive if needed).

| # | Shot (title) | Author / studio | What it is | Why it matters | Path |
|---|---|---|---|---|---|
| 1 🔎 | Personal Portfolio Website — Animations | Dymas Alfin for Mikan Team | UI/UX designer personal site | Duotone portrait hero, outline+solid split wordmark, clean CTA/social rail | `001-.../vp-0.png` |
| 2 | Personal Portfolio Website Design | Wolfpixel UI/UX | Designer portfolio | Standard hero+grid reference | `002-.../` |
| 3 | Landing - Designer portfolio | Purrweb for Purrweb Graphics | Agency-built designer site | Dark agency landing reference | `003-.../` |
| 4 | Free Alexfolio — Portfolio template | Craftwork | Free template | Template-market baseline | `004-.../` |
| 5 | Personal Portfolio Website | Ahmad Faizien for OnPoint Studio | Designer site | Studio-built personal site | `005-.../` |
| 6 | Portfolio Website V1 | Rifayet | Personal site | Baseline v1 exploration | `006-.../` |
| 7 | Videaste — Personal Videographer Portfolio | Adhiari Subekti for One Week Wonders | Videographer site | Video-first portfolio pattern | `007-.../` |
| 8 | Portfolio Design Exploration | Devanta Ebison | Exploration | Concept-stage layout ideas | `008-.../` |
| 9 | Matthew - Personal Portfolio Website Animation | Muhammad Aseif | Personal site w/ animation | Animation-forward personal brand | `009-.../` |
| 10 | Portfolio / Animation | Mike, Creative Mints | Motion study | Animation reference | `010-.../` |
| 11 | Personal Portfolio Website | Orix Creative | Studio personal site | Studio-quality baseline | `011-.../` |
| 12 | Eraf // Portfolio Website | BL/S® | Personal/agency site | Editorial slash-naming convention | `012-.../` |
| 13 | COZYDIADORA - Personal Portfolio Website | Nija Design for Nija Works | Personal site | Warm/cozy brand voice | `013-.../` |
| 14 | Carlos - Personal Portfolio Website | Muh Salmon for One Week Wonders | Personal site | Studio-built personal brand | `014-.../` |
| 15 | Portfolio Book 2020 | Mahdis Mousavi for Love Henry | "Book"-style portfolio | Print-inspired page-turn metaphor | `015-.../` |
| 16 | Portfolio Web Site: Landing / Home Page UI | Sajon for Orix Creative | Landing page UI | Homepage layout reference | `016-.../` |
| 17 | Duwy - Personal Portfolio Website | Natasha Belova for Korsa | Personal site | Studio-built reference | `017-.../` |
| 18 🔎 | EM - Dark Minimalist Editorial Personal Portfolio | LAIN UI/UX for LAIN | Creative director site | Cinematic portrait hero, indexed work list, kinetic marquee bands, monochrome editorial system | `018-.../full.png` |
| 19 | Personal Portfolio | Rashedul Kabir | Personal site | Baseline reference | `019-.../` |
| 20 | Portfolio: Landing Page | Oğuz Yağız Kara for Flowbase | Flowbase template | No-code template reference | `020-.../` |
| 21 | Portfolio design | Mike, Creative Mints | Exploration | Motion-studio aesthetic | `021-.../` |
| 22 | Web Portfolio | Bill Kenney for Focus Lab | Agency portfolio (classic) | Well-known agency reference (Focus Lab) | `022-.../` |
| 23 🔎 | Logo design projects, 2024-2025 portfolio | Alex Tass, logo designer | Logo-only portfolio | Dense logo-wall grid as a "skills/clients" display pattern | `023-.../full.png` |
| 24 | ERP Dashboard for Warehouse Portfolio Mgmt | Shakuro | SaaS dashboard | Data-table + KPI dashboard pattern | `024-.../` |
| 25 | Logo design projects, 2025-2026 portfolio | Alex Tass, logo designer | Logo-only portfolio | Same author, later cohort — grid consistency | `025-.../` |
| 26 | Photographer Portfolio Interactions | Nathan Riley for Unseen Studio® | Photographer site | Interaction-focused photography site | `026-.../` |
| 27 | BartKolenda - Landscape Designer Portfolio | Matt Wojtaś for Moyra | Landscape designer site | Nature-industry portfolio pattern | `027-.../` |
| 28 | Portfolio/Marketing/Web Design | Shakuro | Agency site | Agency-standard layout | `028-.../` |
| 29 | Distant Harmony // Portfolio Website | BL/S® | Personal/agency site | Same studio as #12, naming convention | `029-.../` |
| 30 | ERP Dashboard for Warehouse Portfolio Mgmt | Shakuro | SaaS dashboard (dup cohort) | Same as #24, different shot | `030-.../` |
| 31 | Makeup portfolio | Helena Stretovych | Beauty portfolio | Non-tech vertical portfolio | `031-.../` |
| 32 🔎 | Investment Portfolio Dashboard | Prakash Ghodke for Never Before Seen | Fintech dashboard | Big numeral stat + gradient line chart + timeframe pills — direct analog to a "years/metrics" chart | `032-.../vp-0.png` |
| 33 | 2022-2023 logo design portfolio | Alex Tass, logo designer | Logo-only portfolio | Third cohort of the same series | `033-.../` |
| 34 | AC - Digital Consultant Personal Portfolio | LAIN UI/UX for LAIN | Consultant site | Same LAIN studio system, different persona | `034-.../` |
| 35 | Personal Portfolio Site - Bruno Erdison | Logan Dang | Personal site | Baseline reference | `035-.../` |
| 36 | Portfolio | Claire Coullon | Personal site | Minimal baseline | `036-.../` |
| 37 | VALMAX - Portfolio Landing Page | Awsmd | Personal site | Baseline reference | `037-.../` |
| 38 | InVision Studio - Photography Portfolio Concept | Daniel Korpai for InVision | Photography concept | Historic InVision reference | `038-.../` |
| 39 | Logo Portfolio 2025 | Kevin Craft | Logo portfolio | Another logo-wall example | `039-.../` |
| 40 🔎 | Mintly — Crypto Portfolio Platform | Taras Migulko | Fintech/crypto dashboard | Card-grid asset tiles with icon + circular "add" affordance | `040-.../vp-0.png` |
| 41 | Portfolio/Marketing/Web Design | Shakuro UI/UX for Shakuro | Agency site | Same cohort as #28 | `041-.../` |
| 42 | Photographer Portfolio Website | DIGI.CO | Photographer site | Baseline reference | `042-.../` |
| 43 | Purplefolio - Framer Portfolio for Web Developers | Luca Da Corte | Framer template | Direct competitor category (Framer dev portfolio template) | `043-.../` |
| 44 | Portfolio landing page for Framer, built w/ Frameblox | Solt Wagner | Framer template | Frameblox component-kit reference | `044-.../` |
| 45 | Personal Portfolio Website Design | Pixcut Studio LLC | Personal site | Baseline reference | `045-.../` |
| 46 | Website Designer Portfolio Website | Isabella Popescu for QClay | Designer site | Baseline reference | `046-.../` |
| 47 | Mrstudio - Freelancer Portfolio Website Designer | Masud Rana | Freelancer site | Baseline reference | `047-.../` |
| 48 🔎 | Cubee — Solar Energy App Redesign & Brand Identity | Dtail Studio | Case-study cover | Full-bleed environmental photo + oversized serif overlay ("When you leave") — cinematic case-study opener | `048-.../vp-0.png` |
| 49 | Portfolio Website — UX/UI — Serhii Korzhov | Evgeny UPROCK for UPROCK AGENCY | Personal site | Agency-built reference | `049-.../` |
| 50 | UI/UX Design for Design Portfolio Website | Abdul Saboor | Designer site | Baseline reference | `050-.../` |
| 51 | Personal Portfolio Website | Sahil Dobariya for Heloxone® | Personal site | Baseline reference | `051-.../` |
| 52 | Drake - Personal Portfolio, Bold Landing Page | LAIN UI/UX for LAIN | Personal site | Same LAIN system, "bold" variant | `052-.../` |
| 53 | Personal Portfolio Website | Ahmad Faizien for OnPoint Studio | Personal site (dup cohort of #5) | Same studio, second shot | `053-.../` |
| 54 | AV — Clean Editorial Photography Work Portfolio | LAIN UI/UX for LAIN | Photographer site | Editorial photography system | `054-.../` |
| 55 🔎 | PMA — Editorial Minimalist Architecture Studio | LAIN UI/UX for LAIN | Architecture studio site | Split hero (large photo + label column), hairline-ruled grid, tiny caption typography, monochrome | `055-.../vp-0.png` |
| 56 | GETZ — Photography Portfolio Website | Hrvoje Grubisic for BORNFIGHT STUDIO® | Photographer site | Baseline reference | `056-.../` |
| 57 | Yelena - Personal Portfolio Website | Dhefry Andirezha for One Week Wonders | Personal site | Studio-built reference | `057-.../` |
| 58 🔎 | DC — Futuristic Modern Minimal Metal Portfolio | LAIN UI/UX for LAIN | Material-brand "about" page | Dark 3D metal cylinders on a rock-texture background, tilted device framing | `058-.../vp-0.png` |
| 59 | Agency Portfolio Website Design UI/UX | Sahin Mia for Pixelean | Agency site | Baseline reference | `059-.../` |
| 60 | Personal Portfolio Website | Sujon Hossain for Oripio | Personal site | Baseline reference | `060-.../` |
| 61 | Photography Portfolio Website | Sahin Mia for Pixelean | Photographer site | Same studio as #59 | `061-.../` |
| 62 | Kalerion - Agency/Portfolio Website | Emon | Agency site | Baseline reference | `062-.../` |
| 63 🔎 | Industrial Designer Portfolio for Mirko Romanelli | Shakuro UI/UX for Shakuro | Product designer site | Product macro-shot hero inside a Safari browser-chrome frame — device-mockup case-study pattern | `063-.../vp-0.png` |
| 64 | Brooks - Website Designer Portfolio Website | Syahrul Falah for UI8 | Designer site | UI8-marketplace-quality reference | `064-.../` |
| 65 | Agency & Portfolio Website | Arif Mahmud | Agency site | Baseline reference | `065-.../` |
| 66 🔎 | Lane — Personal Branding / Portfolio Website | Jabel for Trexa Lab | Personal-brand/coach site | Warm photo hero (mic + bokeh studio), confident headline pairing | `066-.../vp-0.png` |
| 67 | Capture - Photography Portfolio Website | Tanvir for Yscale Studio | Photographer site | Baseline reference | `067-.../` |
| 68 🔎 | Creatiq — Premium Agency & Portfolio Template | Pixcut Studio UI/UX | Agency template | Bold red color-block background, oversized black slab type, fisheye editorial photo | `068-.../vp-0.png` |
| 69 | Fintech Investment Portfolio Website Design | Ronas IT UI/UX Team | Fintech site | Baseline reference | `069-.../` |
| 70 | DC — Elegant Aesthetic Metal Portfolio — Product Page | LAIN UI/UX for LAIN | Product page (same system as #58) | Product-page variant of the metal system | `070-.../` |
| 71 | Navarre - Portfolio Website | Emon | Personal site | Baseline reference | `071-.../` |
| 72 | DS - Personal Developer Portfolio | Logan Dang | Developer site | Baseline reference | `072-.../` |
| 73 | Developer Portfolio Landing Page | Sajon | Developer site | Baseline reference | `073-.../` |
| 74 | Developer Portfolio Website | Dejan for Devu Design® | Developer site | Baseline reference | `074-.../` |
| 75 | Sonali — Developer Portfolio & Digital Brand | Carlos Pessane | Developer site | Baseline reference | `075-.../` |
| 76 🔎 | Engineering Scalable Web Architecture — Dev Portfolio | Muhammad Jahirul Islam | Senior engineer site | High-contrast red ambient glow, dense two-column proof-points grid, milestone timeline, embedded video | `076-.../vp-0.png` |
| 77 | Lumen Studio — Creative Developer Portfolio | Hine Digital Web | Developer/studio site | Baseline reference | `077-.../` |
| 78 | Developer Portfolio — Webflow & WordPress | Nadnova | Developer site | Baseline reference | `078-.../` |
| 79 | Designer/Developer Portfolio Hero, Editorial Style | Zumur Deb for ArchAge | Hybrid designer-dev site | Editorial hero reference | `079-.../` |
| 80 | Front-end Developer Portfolio Site | Henry Desroches | Developer site | Baseline reference | `080-.../` |
| 81 | Developer Portfolio Landing Page | Orix Creative | Developer site | Baseline reference | `081-.../` |
| 82 🔎 | DevSync — Developer Portfolio Template | Tarik Eamin for WhiteFrame Creative | Developer template | Black-bezel laptop+phone device mockup pair, neon-green accent on near-black | `082-.../vp-0.png` |
| 83 | JOHN - Developer Portfolio Website | Mal | Developer site | Baseline reference | `083-.../` |
| 84 | Developer Portfolio Landing Page | Sajon | Developer site (dup cohort of #73) | Same author | `084-.../` |
| 85 | Developer Portfolio | Rashedul Kabir | Developer site (dup cohort of #19) | Same author | `085-.../` |
| 86 | Software developer portfolio website | Bruno Cardozo | Developer site | Baseline reference | `086-.../` |
| 87 | Developer Portfolio — Full Case Study | Norman Dubois for Dorfjungs. | Developer site, full case study | Deep case-study structure reference | `087-.../` |
| 88 | Developer Portfolio - V3 | Norman Dubois | Developer site (v3 of #87's author) | Iteration reference | `088-.../` |
| 89 | Stealth Mode — Backend Developer Portfolio | Shough Shariar | Backend-dev site | Backend-specific persona/voice | `089-.../` |
| 90 | Modern Developer Portfolio Website | Abhiranjan | Developer site | Baseline reference | `090-.../` |
| 91 | Developer portfolio website | Aisaa | Developer site | Baseline reference | `091-.../` |
| 92 | Frontend Developer Portfolio Homepage | sugarzero | Developer site | Baseline reference | `092-.../` |
| 93 | Web Developer portfolio Landing page | Abrar Akib | Developer site | Baseline reference | `093-.../` |
| 94 | Developer portfolio pageload | Gil | Developer site (pageload/loader focus) | Loading-screen pattern reference | `094-.../` |
| 95 🔎 | Full Stack Developer Portfolio — Dark Gradient & Modern | Maya | Developer site | Purple/pink radial-gradient dark hero, circular photo with orbiting tech-stack badge icons | `095-.../vp-0.png` |
| 96 🔎 | Developer Portfolio - Home Slider Animation | Edwin Contat | Developer site | Dot-grid background texture, huge outline "glitch"-style wordmark, black canvas | `096-.../vp-0.png` |

---

## 2. Catalog — 28 concrete reusable ideas

Section names refer to maxfolio's current structure: hero → stat band → ticker → experience split →
years chart → process stepper → storefront index + case-study sheet → gallery carousel → manifesto
band → projects index → skills → FAQ → contact → explore themes. Themes: Apple Clean (default),
Luxury, Brutalist, Soft UI, Arcade, Menu.

### 1. Duotone portrait hero with split outline/solid wordmark
**Looks like:** A large monochrome (desaturated + slight duotone tint) portrait sits centered under
the fold; the subject's name is set in one giant sans headline where the first word is stroke-only
(outline, no fill) and the second word is solid black — same size, same baseline, so the eye reads
them as one lockup. Small "available for work" pill + two-button CTA row underneath.
**Fits:** Hero (Apple Clean or a new "Editorial" theme); also fits the Luxury theme's cover slide.
**Implementation:** Tailwind `text-transparent [-webkit-text-stroke:2px_theme(colors.ink)]` for the
outline word, sibling span solid; portrait as `<img>` with `grayscale contrast-110 saturate-50`;
framer-motion `initial={{opacity:0,y:24}}` staggered per word on load, no scroll trigger needed since
it's above the fold.
**Perf/a11y:** Portrait must be a real, license-cleared photo (no invented person) — for maxfolio use
the owner's own headshot; serve as AVIF/WebP with explicit width/height to avoid CLS. Outline text
needs a solid-color fallback for `prefers-contrast: more` (stroke-only text can fail WCAG contrast).
**Reference:** `001-26995447-personal-portfolio-website-animations/vp-0.png`

### 2. Cinematic full-bleed portrait hero with two-line quote lockup
**Looks like:** A near-black, high-contrast desaturated portrait fills the entire hero at full
viewport width; a two-line all-caps headline ("BUILDING BRANDS THAT MOVE") sits over the top-left
in tight leading, small kicker line above it.
**Fits:** Hero for the Brutalist or a new "Editorial/Cinematic" theme.
**Implementation:** `background-image` or `<img class="absolute inset-0 h-full w-full object-cover
brightness-[.55] contrast-125">`; text layer with `mix-blend-difference` optional for a bit of edge;
framer-motion clip-path reveal (`clipPath: inset(0 0 100% 0)` → `inset(0 0 0% 0)`) on mount.
**Perf/a11y:** One hero image at this treatment is expensive — preload it (`<link rel=preload>`),
serve responsive `srcset`, and keep it a single decorative image with `alt=""` since the real content
is in the text layer. Respect `prefers-reduced-motion` by skipping the clip-path reveal.
**Reference:** `018-27550614-.../full.png` (top hero section)

### 3. Indexed work list with numbered rows and hover-reveal thumbnail
**Looks like:** A plain list of project names, each prefixed with a two-digit index (01, 02, 03…),
laid out as a simple table with hairline dividers; no thumbnails visible by default — implied
(common Dribbble/Awwwards pattern) that hovering a row reveals a floating thumbnail near the cursor.
**Fits:** Projects index or storefront index — replaces/augments the current card grid with a denser,
more editorial list view (could be a view-toggle: grid ⇄ list).
**Implementation:** framer-motion `useMotionValue` for cursor x/y, an absolutely-positioned thumbnail
`<motion.div>` that follows the cursor with a spring (`stiffness: 300, damping: 30`) and fades in via
`AnimatePresence` on row `onMouseEnter`.
**Perf/a11y:** Preload thumbnails lazily (only decode on first hover, not all at once). Provide a
keyboard/touch fallback: on focus or tap, show the thumbnail inline below the row instead of
cursor-following, since mouse-follow has no touch equivalent.
**Reference:** `018-27550614-.../full.png` (described in the shot's own copy as "Indexed Work List")

### 4. Kinetic marquee band with crossed diagonal tape strips
**Looks like:** Two overlapping horizontal ribbon strips run at a slight angle to the grid, each
scrolling text infinitely in opposite directions (own copy: "Crossing tape strips add motion and
personality"). One strip skews up-left, the other down-right, forming an X.
**Fits:** The existing ticker section — this is a richer version of a single-row marquee.
**Implementation:** Two absolutely-stacked `<div>`s, each `transform: rotate(-3deg)` / `rotate(3deg)`,
each containing a duplicated-content flex row animated with CSS `@keyframes marquee` (translateX
-50% loop) or framer-motion `animate={{x: [0, -itemsWidth]}}` with `repeat: Infinity, ease: "linear"`.
**Perf/a11y:** Pure CSS transform animation (GPU-friendly), pause on `prefers-reduced-motion` and on
`visibilitychange` (tab hidden). Mark the whole band `aria-hidden="true"` if it's decorative/repeats
content already in the nav or footer.
**Reference:** `018-27550614-.../full.png`

### 5. Big-numeral stat card with inline gradient sparkline
**Looks like:** A dark dashboard card: a huge numeral ("$150,000") with a small delta badge
("+12.45%" in green) beside it, and to the right a smooth gradient-stroke line chart with rounded
peaks, plus a row of timeframe pill buttons (1M/6M/1Y/3Y/All) with the active one highlighted.
**Fits:** Stat band and years chart — this is a more polished, single-card version of "years of
experience" or "shipped features" trending upward.
**Implementation:** Recharts or a hand-rolled SVG `<path>` with a `linearGradient` stroke; animate the
path drawing in with `strokeDasharray`/`strokeDashoffset` on scroll-into-view via framer-motion
`whileInView`; animate the numeral with a `useSpring`-driven count-up (real numbers only — no invented
metrics per house rule).
**Perf/a11y:** Chart is decorative + data — give it an `aria-label` summarizing the trend in words
("grew steadily over the period, ending at $150,000") since the SVG line itself isn't screen-reader
legible. Debounce timeframe-pill re-renders.
**Reference:** `032-26279304-investment-portfolio-dashboard/vp-0.png`

### 6. Dense logo-wall grid as a "worked with / stack" display
**Looks like:** A tidy 7-column grid of ~55 small colorful logo marks (client logos in the original,
but the pattern generalizes to tech-stack icons or tools), each cell equal height, generous
whitespace, no borders — just alignment doing the work.
**Fits:** Skills section — replace a plain icon row with a denser "wall" that reads as a body of
proof rather than a short list; could also work as a "clients/stores shipped for" wall if maxfolio
wants to show scale without naming NDA'd clients.
**Implementation:** CSS grid `grid-template-columns: repeat(auto-fill, minmax(80px,1fr))`; each logo
`<img>` grayscale by default, `hover:grayscale-0` transition for color-reveal on hover (nice
low-cost delight); stagger a fade/scale-in via framer-motion `staggerChildren` on scroll.
**Perf/a11y:** Use SVG logos (crisp at any size, tiny filesize) not PNGs; each needs real `alt` text
(the tool/client name) — decorative grayscale filter must not be the only way information is conveyed.
**Reference:** `023-25843369-logo-design-projects-2024-2025-portfolio/full.png`

### 7. Full-bleed environmental photo + oversized serif case-study title
**Looks like:** A warm, lifestyle photo (doorway with plant, soft light) fills the case-study cover;
a large serif headline ("When you leave") sits left-aligned over the image in white, feeling like a
film title card rather than a UI screenshot.
**Fits:** Case-study sheet opener — an alternative to a plain screenshot cover, used for storytelling
projects (brand/e-commerce work, not just UI).
**Implementation:** `<img class="object-cover h-[70vh] w-full">` + overlay `<h2 class="font-serif
text-6xl md:text-8xl">`; framer-motion `whileInView` opacity/y fade for the title; optional slow
Ken-Burns `scale: [1, 1.05]` over 8s on the background image.
**Perf/a11y:** Ken-Burns must respect `prefers-reduced-motion` (drop to a static image). Real photos
only — if maxfolio doesn't have a lifestyle photo for a given case study, use a plain product/UI
screenshot instead of stock imagery that misrepresents the work.
**Reference:** `048-27716792-cubee-solar-energy-app-redesign-brand-identity/vp-0.png`

### 8. Editorial split-hero with hairline-ruled caption column
**Looks like:** Left ~65% is a large black-and-white architectural photo; right ~35% is a plain
white column with tiny all-caps labels ("STONE, STEEL, AND GLASS…"), a thin horizontal rule, and a
small secondary image + caption below — very print-magazine, lots of negative space, 10-11px
caption type.
**Fits:** Case-study sheet body sections — a strong alternative to full-width image blocks when a
case study needs a "photo + annotation" layout.
**Implementation:** CSS grid `grid-cols-[1.6fr_1fr]`; caption column uses a condensed/mono type at
`text-[11px] tracking-wide uppercase`; hairline `border-t border-black/10`.
**Perf/a11y:** Ensure caption contrast passes AA even at 11px (small text needs ≥4.5:1, not the 3:1
large-text allowance). Real captions describing the actual work, not filler lorem ipsum.
**Reference:** `055-27159288-pma-editorial-minimalist-architecture-studio-portfolio-website/vp-0.png`

### 9. Dark 3D hero with tilted device frame over a textured environment
**Looks like:** A near-black background textured with a subtle rock/stone photo; a tablet-shaped
device mockup is tilted in 3D perspective, showing a UI with glossy, extruded 3D metal-cylinder
shapes inside it — heavy material realism (specular highlights, soft shadows).
**Fits:** A new "Luxury"/material-brand theme hero, or an Arcade-adjacent 3D showcase moment for a
specific case study needing high production value.
**Implementation:** For real 3D (not just an image), use `@react-three/fiber` with a simple extruded
`RoundedBox` geometry, an `Environment` HDRI for the specular reflections, and `ScrollControls` /
framer-motion-driven camera rotation tied to scroll progress. If budget doesn't allow WebGL, fake it
with a pre-rendered image + CSS `perspective`/`rotate3d` on the frame only.
**Perf/a11y:** Real Three.js scenes are heavy — lazy-mount only when the section scrolls near
viewport (`IntersectionObserver`), cap devicePixelRatio to 1.5–2, and provide a static poster image
fallback for reduced-motion / low-end devices. Never ship a WebGL-only hero with no fallback.
**Reference:** `058-24974265-dc-futuristic-modern-minimal-metal-portfolio-website-about-us/vp-0.png`

### 10. Product macro-shot inside a real browser-chrome frame
**Looks like:** The case-study preview is framed inside a faithful macOS Safari window (traffic-light
dots, real-looking address bar text, tab bar) containing a soft-studio product photo (a light-blue
molded lid, long soft shadow) with the project name in huge lowercase type below the fold-line.
**Fits:** Case-study sheet / storefront index thumbnails — makes a static screenshot read as "a real
live site you could visit," reinforcing credibility.
**Implementation:** A small reusable `<BrowserFrame url="mirkoromanelli.webflow.io">` component: a
rounded-top bar with three dot spans and a pill containing the URL text, `<img>` or `<iframe>` below.
**Perf/a11y:** If using `<iframe>` for a live case study, lazy-load it (`loading="lazy"`) and provide
a static screenshot poster until it's in view — iframes are expensive. The fake URL text should be
marked decorative (`aria-hidden`) since it's not a real link unless it actually is one.
**Reference:** `063-25273962-industrial-designer-portfolio-website-for-mirko-romanelli/vp-0.png`

### 11. Warm photographic hero for a "personal brand" moment
**Looks like:** A photo of the person mid-conversation at a desk with a podcast mic, warm bokeh
background (recording studio), paired with a confident two-line headline ("You're More Than a Brand.
You're a Movement.") and a single primary CTA pill.
**Fits:** An "About" moment within the manifesto band or contact section — humanizes the site with a
real photo rather than only typography, useful sparingly (once per site, not every section).
**Implementation:** Standard image+text hero grid; the only notable technique is the warm color grade
— apply a subtle `sepia-[.08] saturate-125` filter or a CSS `mix-blend-mode: multiply` amber overlay
at low opacity to unify a real photo with the rest of the palette.
**Perf/a11y:** Must be an actual photo of the real person (or omitted) — never a stock photo used to
imply a person who doesn't exist. `alt` text should describe the photo meaningfully, not "hero image."
**Reference:** `066-26304356-lane-personal-branding-website-personal-portfolio-website/vp-0.png`

### 12. Bold color-block cover with fisheye editorial photo
**Looks like:** A saturated red full-bleed background; oversized black slab-serif/grotesk wordmark
("CREATIQ") anchors the bottom; a fisheye-lens portrait (person walking, city background, extreme
lens distortion) sits inset top-left in a small frame with a caption line below it.
**Fits:** A bold variant within the Brutalist theme, or a striking cover slide for the "explore
themes" gallery itself.
**Implementation:** Solid Tailwind background color (`bg-[#E8341C]` or brand equivalent); wordmark at
`text-[14vw] leading-none font-black`; fisheye effect can be approximated with a CSS `filter:
url(#fisheye)` SVG distortion or simply cropped from a genuinely wide-angle source photo (avoid fake
distortion filters that look uncanny — prefer a real wide lens shot if photographing the owner).
**Perf/a11y:** Solid-color backgrounds are cheap; the only asset weight is the one photo — serve it
responsively. Check text-on-red contrast ratio explicitly (red backgrounds are a common AA failure
point with black text at certain saturations — verify, don't assume).
**Reference:** `068-27624225-creatiq-premium-agency-portfolio-website-template/vp-0.png`

### 13. High-contrast red ambient-glow hero for a "senior/expert" register
**Looks like:** A black background with a soft radial red glow bleeding from the edges/corners; a
tilted browser-window screenshot sits center-left showing a portrait + headline ("Engineering
scalable architecture for modern enterprises"); to the right, a 2×2 grid of small dark cards each
with an icon + one-line proof point ("Production-Grade Reliability," "Business-Driven Decisions").
**Fits:** A "senior engineer" register for the hero or a dedicated proof-points band — pairs well
with the process stepper section as a lead-in.
**Implementation:** Radial gradient via `background: radial-gradient(ellipse at 20% 30%, rgba(220,20,
20,.35), transparent 60%)` layered under a `bg-black` base; proof-point cards as a simple CSS grid
with `border border-white/10 rounded-xl p-4`.
**Perf/a11y:** A soft gradient glow is nearly free (one CSS background, no image). Keep the ambient
glow's contrast low enough that foreground text always clears AA against the darkest part of the
gradient, not just the average.
**Reference:** `076-27534133-engineering-scalable-web-architecture-developer-portfolio/vp-0.png`

### 14. Circular "orbiting" tech-stack badges around a hero portrait
**Looks like:** A circular-cropped photo of the person is surrounded by 3-4 small circular badge
icons (React, JS, CSS logos) positioned at its edge like satellites, each in its own colored pill,
set against a dark purple/pink radial gradient background.
**Fits:** Skills section or hero — a compact, visual alternative to a plain icon row for showing a
tech stack tied directly to a photo of the person.
**Implementation:** Position badges with `absolute` + trigonometric offsets (`cos/sin` of an angle)
around the circle's radius so they can be evenly distributed and re-computed if the badge count
changes; framer-motion `animate={{y: [0,-6,0]}}` per badge with staggered `delay` for a gentle float.
**Perf/a11y:** Tiny SVGs, negligible cost. Each badge needs `alt`/`aria-label` naming the technology;
floating motion must pause under `prefers-reduced-motion`.
**Reference:** `095-26578541-full-stack-developer-portfolio-website-dark-gradient-modern/vp-0.png`

### 15. Dot-grid textured background behind giant outline type
**Looks like:** A plain black canvas is covered edge-to-edge with a faint, evenly-spaced dot grid
(like graph paper); a huge outline-only wordmark sits on top, giving the impression of a technical
blueprint or CAD canvas rather than a plain solid background.
**Fits:** Hero background texture for the Arcade or a new "Technical/Blueprint" theme — cheap way to
add depth to an otherwise flat dark hero.
**Implementation:** Pure CSS: `background-image: radial-gradient(circle, rgba(255,255,255,.08) 1px,
transparent 1px); background-size: 24px 24px;` — zero images, one declaration.
**Perf/a11y:** Essentially free performance-wise (no image request, one repeating gradient). Purely
decorative — `aria-hidden` the background element if it's a separate DOM node.
**Reference:** `096-6131396-developer-portfolio-home-slider-animation/vp-0.png`

### 16. Card-grid asset tiles with icon + circular add-button
**Looks like:** Three equal-width white cards on a soft lavender-gradient dark background, each with
a bold title ("Bitcoin"), a one-line description, a simple line-art icon (concentric circles / venn
shapes), and a small black circular "+" button pinned to the bottom-right corner of the card.
**Fits:** A "services" or "capabilities" grid variant — the plus-button affordance reads as
"add/learn more," useful for a compact case-study index tile.
**Implementation:** CSS grid 3-up, `rounded-2xl bg-white p-6 shadow-sm`; the "+" button as a small
absolutely-positioned circle bottom-right, `hover:rotate-45` transition if it doubles as an
expand/collapse trigger.
**Perf/a11y:** Cheap (no heavy assets). The "+" button needs a real `aria-label` ("Add Bitcoin to
watchlist" / "View more about X") — a bare "+" glyph is meaningless to a screen reader alone.
**Reference:** `040-27368498-mintly-crypto-portfolio-platform/vp-0.png`

### 17. Black-bezel device mockup pair (laptop + phone) with neon accent
**Looks like:** A dark rounded rectangle "laptop bezel" contains a screenshot with a bold black
headline ("BUILDING FAST, SCALABLE, AND SECURE WEBSITE") and a small black-and-white portrait; a
phone-shaped device overlaps the bottom-right corner showing the same site responsively, with one
neon-green pill button ("Let's Collaborate") as the sole accent color against near-black/white.
**Fits:** Hero or gallery carousel — an effective, low-cost way to show "this design is responsive"
without needing real device photography.
**Implementation:** Two absolutely-positioned `<div>`s with `rounded-[2rem] border-8 border-black`
(laptop) and `rounded-[2.5rem] border-[6px]` (phone), each containing a real screenshot `<img>` of
maxfolio itself, offset with `translate-x/y` and a subtle `rotate-2` on the phone for depth.
**Perf/a11y:** Two extra screenshot images to maintain (must be regenerated whenever the real site
changes, or they go stale — flag this as a maintenance cost). Keep total decorative bezel markup
`aria-hidden` since the meaningful content is the real site behind it.
**Reference:** `082-26220747-devsync-developer-portfolio-template/vp-0.png`

### 18. Fintech-style timeframe pill row for any time-series display
**Looks like:** A compact horizontal row of pill buttons (1M / 6M / 1Y / 3Y / All), inactive ones in
plain grey text, the active one on a solid dark rounded pill — a very small, very reusable UI atom.
**Fits:** Years chart, or a "traffic/engagement over time" stat if maxfolio ever adds real analytics
display.
**Implementation:** A `<div role="tablist">` of `<button role="tab" aria-selected>` elements; active
state via a framer-motion `layoutId="pill"` shared element that slides between buttons on click,
rather than a hard cut.
**Perf/a11y:** Trivial cost. Must be real `role="tablist"`/`tab` semantics with keyboard arrow-key
navigation between options, not just styled `<div>`s.
**Reference:** `032-26279304-investment-portfolio-dashboard/vp-0.png`

### 19. Two-tone brand mark using a single geometric glyph
**Looks like:** Several of the fintech/crypto shots (Mintly's "≢" mark, Hill's crescent-moon glyph)
use one small custom geometric glyph as the entire logotype accent instead of an icon library glyph —
gives a bespoke, considered feel for almost no design cost.
**Fits:** maxfolio's own site-wide wordmark/favicon treatment, or a per-theme "brand mark" that
changes subtly between the six themes (Apple Clean gets a minimal one, Arcade gets a pixel-art one…).
**Implementation:** A single inline SVG path (12-24 nodes) reused as both the nav-bar mark and
favicon; theme-swap by conditionally rendering different `<path>` data per active theme.
**Perf/a11y:** Effectively free (inline SVG, no request). Mark decorative unless it's also the site's
only home-link — then it needs an accessible name via `aria-label="Home"`.
**Reference:** `040-27368498-mintly-crypto-portfolio-platform/vp-0.png`, `032-26279304-investment-portfolio-dashboard/vp-0.png`

### 20. Grayscale-to-color hover reveal for photo-based case-study grids
**Looks like:** Implied by the photography-portfolio shots (GETZ, Capture, Photographer Portfolio
Interactions) — thumbnails render desaturated by default and snap to full color on hover/focus,
reinforcing an editorial, gallery-like restraint.
**Fits:** Gallery carousel and storefront index thumbnails.
**Implementation:** `filter: grayscale(1)` by default, `transition: filter .4s ease`,
`hover:grayscale-0`; keep the transition on `filter` only (cheap, GPU-composited) not on layout
properties.
**Perf/a11y:** Very cheap. For touch devices with no hover, trigger the same effect via `:focus-visible`
or a "tap to preview" affordance so touch users aren't stuck with permanently desaturated images.
**Reference:** `056-6255556-getz-photography-portfolio-website/` (title/thumbnail context), corroborated by the grayscale treatment already seen live in #1 and #18's portrait treatments.

### 21. Vertical timeline of milestones with alternating text/photo blocks
**Looks like:** Below the engineering-portfolio's proof-points grid, a "Professional milestones &
impact" section lists role/date pairs in a compact vertical list, each with a small thumbnail
avatar — a straightforward experience-timeline pattern.
**Fits:** Directly extends the existing "years chart" / experience-split sections with a literal
timeline view option.
**Implementation:** A vertical flex column with a `border-l-2` running spine; each entry an
`<li>` with `-ml-[5px]` dot marker; framer-motion `whileInView` staggered reveal per entry as the
user scrolls down the spine (classic scrollytelling technique).
**Perf/a11y:** Cheap (text + tiny avatars). Use an ordered list (`<ol>`) semantically since order
(chronology) is meaningful information, not just visual sequence.
**Reference:** `076-27534133-engineering-scalable-web-architecture-developer-portfolio/vp-0.png`

### 22. Script logotype paired with a bold grotesk headline for personality
**Looks like:** Several shots (Alex Tass's logo signature, Norman Dubois's "Dorfjungs.", the cursive
flourishes on personal-brand shots) pair one cursive/script word (usually a name or signature) against
an otherwise strict grotesk/sans system — a classic "one flourish, everything else rigid" technique.
**Fits:** Owner's signature/name treatment in the contact section or footer sign-off.
**Implementation:** Load one script webfont (Google Fonts, self-hosted via the allowed CDN) sparingly
— a single `<span class="font-script">` wrapping just the name, nothing else in that face.
**Perf/a11y:** One additional font file — subset it to only the characters actually used (the name)
to keep it near-zero cost; `font-display: swap`.
**Reference:** `023-25843369-logo-design-projects-2024-2025-portfolio/full.png` (footer signature)

### 23. Studio-style two-line "we build X" manifesto with product photo backdrop
**Looks like:** The Cubee cover isn't alone — several shots (PMA, DC metal system) use a two-line,
oversized manifesto statement directly over a full-bleed photograph rather than on a plain
background, making the manifesto feel grounded in real work rather than abstract.
**Fits:** Manifesto band — currently likely text-only; adding a rotating/cross-fading photo backdrop
(one real project photo per statement) would tie the philosophy directly to shipped work.
**Implementation:** `AnimatePresence` cross-fade between 3-4 background photos every ~6s, synced (or
not) with the manifesto text; `overflow-hidden` container, images `object-cover` absolutely stacked.
**Perf/a11y:** Preload only the first image; lazy-load the rest. Auto-advancing content must have a
pause control per WCAG 2.2.2 (Pause, Stop, Hide) if it exceeds 5 seconds per slide — add a simple
pause-on-hover/focus at minimum.
**Reference:** `048-27716792-cubee-solar-energy-app-redesign-brand-identity/vp-0.png`, `055-27159288-pma-editorial-minimalist-architecture-studio-portfolio-website/vp-0.png`

### 24. Compact FAQ-adjacent "why partner with me" 2×2 proof grid
**Looks like:** Small square-ish cards, one icon + one bold short line each ("Performance-First
Mindset," "Business-Driven Decisions") — not really FAQ, but answers implicit questions ("why hire
you") in scannable fragments rather than paragraphs.
**Fits:** Could sit directly above the FAQ section as a "in short" primer, reducing how many people
need to open the FAQ accordion at all.
**Implementation:** Simple 2×2 (or 2×4) CSS grid, each cell `border border-white/10 rounded-xl p-5`,
icon + `<p class="text-sm font-medium">`.
**Perf/a11y:** Negligible cost. Keep headings real (`<h3>` per card) so the grid is navigable by
screen-reader users jumping by heading level.
**Reference:** `076-27534133-engineering-scalable-web-architecture-developer-portfolio/vp-0.png`

### 25. "Book" page-turn metaphor for a portfolio index
**Looks like:** Named literally "Portfolio Book 2020" — the concept of presenting the projects index
as flippable book spreads rather than a scrolling grid (title/thumbnail context; static shot doesn't
show the interaction, but the naming and cover framing strongly implies a page-turn UI).
**Fits:** An alternate "browse mode" for the projects index, or a fun easter-egg view in the Arcade
theme (a literal flip-book of shipped work).
**Implementation:** framer-motion 3D flip: `rotateY` on a `perspective`-parented container, two-sided
pages (`backface-visibility: hidden` on the reverse face), triggered by arrow-key or swipe.
**Perf/a11y:** Genuinely fun but non-trivial to build well — treat as a stretch/Arcade-only feature,
not a primary navigation mode (page-turn UIs are notoriously hard to make accessible/keyboard-friendly;
always ship a plain-list fallback alongside it, never as the only way to browse).
**Reference:** `015-14219693-portfolio-book-2020/` (title/thumbnail context)

### 26. Loading/pageload sequence as a first-impression moment
**Looks like:** Named "Developer portfolio pageload" — a dedicated loading-screen treatment (title/
thumbnail context; likely a percentage counter or wordmark animation before the real page reveals).
**Fits:** A one-time (session-scoped) intro loader for the Luxury or Arcade theme, where a moment of
ceremony on first visit is on-brand — should never gate repeat visits.
**Implementation:** A `sessionStorage` flag (`hasSeenLoader`) so the loader only plays once per
session; a simple percentage counter animated with `useSpring`/`requestAnimationFrame`, cross-fading
to the real hero via `AnimatePresence` when real assets finish loading (tie the fake progress to
actual `Promise.all` of critical asset loads, not a fixed timer, so it never lies about being "done").
**Perf/a11y:** A loader must never add real perceived latency — it should mask genuine load time, not
manufacture fake delay. Respect `prefers-reduced-motion` (skip straight to content); make sure the
loader doesn't trap keyboard focus if a user tabs during it.
**Reference:** `094-17301705-developer-portfolio-pageload/` (title/thumbnail context)

### 27. "Stealth mode" persona framing for a section, not just a name
**Looks like:** Named "⚡ Stealth Mode — Backend Developer Portfolio" — using a playful, on-brand
framing device as the literal section/page title rather than a generic "About" label (title/
thumbnail context).
**Fits:** A copy/IA idea more than a visual one — applies to how maxfolio's own section labels could
carry more personality (e.g., a hero eyebrow reading something distinctive rather than "Portfolio").
**Implementation:** N/A (copy pattern, not a component) — flag to `digitdeck-copywriting` doctrine if
adapted for a client store's About/Team section framing.
**Perf/a11y:** N/A.
**Reference:** `089-27640312-stealth-mode-backend-developer-portfolio/` (title/thumbnail context)

### 28. Full case-study long-form scroll structure
**Looks like:** "Developer Portfolio — Full Case Study" (title/thumbnail context) implies a dedicated,
long single-page case-study format distinct from a short project-card summary — problem → process →
outcome as its own scrollable narrative rather than a modal or short blurb.
**Fits:** Directly maps onto maxfolio's existing case-study sheet — validates going deeper (metrics,
process, before/after) rather than keeping case studies to a single screen.
**Implementation:** A dedicated route/sheet per case study with its own scroll-progress indicator
(thin top bar tied to `useScroll` + `scaleX` transform), section anchors for problem/process/outcome.
**Perf/a11y:** Code-split each case-study route so the main bundle doesn't grow with every new case
study added. Scroll-progress bar is decorative (`aria-hidden`); provide a real in-page table of
contents for keyboard users to jump between sections instead of relying on scroll alone.
**Reference:** `087-6823326-developer-portfolio-full-case-study/` (title/thumbnail context)

---

## 3. Avoid list

- **Fake device/browser chrome that never gets updated.** Idea #10/#17's browser/device frames go
  stale the moment the real site changes underneath them — only worth it if there's a process to
  regenerate the screenshot inside the frame whenever the real UI ships (otherwise it becomes a
  visible lie about what the product looks like today).
- **Auto-advancing carousels/manifesto cross-fades with no pause control.** Several shots imply
  rotating content (#23); WCAG 2.2.2 requires a pause/stop affordance for anything that moves
  automatically for more than 5 seconds — don't ship the idea without it.
- **Cursor-following thumbnails as the only way to preview a project (#3).** No touch equivalent —
  always ship a tap/focus fallback, never gate the preview behind hover alone.
- **Cinematic/duotone hero photography using stock people or AI-generated faces.** Multiple strong
  references here (LAIN system, personal-brand shots) work because the photo is unmistakably a real
  specific person. For maxfolio this means the owner's own photography or nothing — never a stock
  photo standing in for "a developer," and per the deterministic-placeholder-ratings house rule,
  never invent a rating/testimonial/number to go with it.
- **3D/WebGL hero (#9) with no static fallback.** A tilted 3D device scene is a strong effect but a
  real risk on low-end mobile — ship it only with a pre-rendered poster fallback and lazy-mount
  logic; never let it be the only way the hero renders.
- **Page-turn book UI (#25) as the sole navigation for the projects index.** Fun but a known
  accessibility trap (keyboard/screen-reader support for page-flip metaphors is weak industry-wide)
  — fine as an Arcade-theme bonus view, never the only way to browse projects.
- **Dense logo-walls (#6) using raster logo files at inconsistent resolutions.** The reference works
  because every mark is a clean vector at the same visual weight — a wall of mismatched PNG logo
  screenshots looks cheap immediately; source proper SVGs or don't build the wall.
- **Bold color-block red backgrounds (#12) without checking contrast per-copy-block.** Several
  reference shots pair black text directly on saturated red — verify actual contrast ratios for
  maxfolio's specific red before reusing, don't assume the reference already passed AA (Dribbble
  shots are marketing images, not accessibility-audited products).
- **Treating any Dribbble shot as a literal spec to clone.** These are static marketing images for
  freelance/agency self-promotion, not real product-analytics-informed portfolios — pull the layout/
  motion/data-display *ideas*, not literal copy, colors, or claimed metrics (several dashboard shots
  show placeholder numbers like "$150,000" that must never be copied as if they were maxfolio's own
  real figures — the CONTEXT for this task is explicit that only real numbers may appear on maxfolio).
