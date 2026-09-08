# LENS 1: tech-stack (agent a580525b80584c944)

## Lee Robinson (leerob.com) — https://leerob.com · long-running personal site, active 2026 (posts dated July 2026)
- **desktop**:
  - Two-column layout: left column is plain-text bio + two lists ('Notes' essays, 'Blogs' with right-aligned dates); right column is one tall editorial illustration, no card, no border.
  - Zero UI chrome around the tech/company mentions: 'Cursor', 'Vercel', 'SpaceX' appear as plain underlined words INSIDE the bio sentence ('I work on ML at SpaceX (formerly at Cursor)... Previously, I worked at Vercel on Next.js') — this is the whole 'stack/experience' section. No badges, no logos, no grid.
  - 'Notes' section is two columns of a bare bullet list (square bullet, underlined link, nothing else) — an index, not a card grid.
  - 'Blogs' list uses a plain flex row: title left, month/year right, a 1px hairline could separate rows but here it's just line-height spacing.
- **mobile**:
  - Two-column layout collapses to a single column; the full-bleed illustration drops out of the top screenshot (scrolls below or shrinks) so mobile leads with pure text.
  - The two 'Notes' columns collapse into one vertical list — no accordion, no truncation, just re-flowed bullets.
  - Nothing about the layout is device-specific beyond standard reflow — proof that a stack/experience section this text-light doesn't need a mobile redesign at all.
- **motion**:
  - No motion observed — static typographic page (a Default/Long toggle switches bio length with what is likely a simple height crossfade, not verified).
- **steal**: For maxfolio's Experience or Skills, replace the 'What I work with' card grid with ONE prose paragraph per era where every tool/company is an inline underlined link (no chip, no icon) — 'I run Shopify Functions on WASM, ship App Proxy backends on Node/Prisma, and instrument everything through Web Pixels' — the stack becomes evidence attached to a sentence about what it did, not a list of nouns.
- screenshots: tech-stack-leerob-desktop-top.png | tech-stack-leerob-mobile-top.png

## Delba de Oliveira (delba.dev) — https://delba.dev · active DX/education portfolio, 2026
- **desktop**:
  - Two-column split (no sidebar chrome): left = 'Portfolio' intro + 'Work' + 'Personal' sections as bulleted index lists; right = a small circular headshot, one short 'About me' paragraph, then a plain hairline-separated row of social text-links (LinkedIn · YouTube · GitHub · X).
  - Every project name IS the tech-stack evidence: 'Next.js Docs: Built, authored, and maintained.' / 'Remotion Framework (Unnamed): A framework built on top of Remotion...' — the stack (Next.js, Remotion, Figma) surfaces only as bold inline terms inside one-line accomplishment statements, never isolated as a list of nouns.
  - No card, no border, no icon anywhere on the page — the entire 'stack' story is two ragged bullet lists in a serif font.
- **mobile**:
  - The two columns stack vertically in reading order: Portfolio -> Work -> Personal -> About me -> social links. Nothing is hidden, collapsed, or turned into an accordion — because there was never a card to break.
  - Long bullet paragraphs simply wrap to 3-4 lines instead of 1-2; the small headshot moves from a top-right thumbnail to sitting above the About paragraph.
  - This is the cleanest proof in the set that an editorial/index-list section needs ZERO mobile-specific redesign — its mobile version is just its desktop version narrower.
- **motion**:
  - None observed — a static, serif, text-only page; the entire page is under 900px tall on desktop.
- **steal**: Turn maxfolio's 'Storefronts, apps, and the platform behind them' index rows into this pattern: instead of a filter-chip toolbar + card list, write one sentence per store where the CRO feature IS the bolded/linked term ('The Currey Box: built the bundle-box merge engine and 3 Klaviyo flows that lifted AOV') so the tech stack reads as proof-of-work, not a spec sheet.
- screenshots: tech-stack-delba-desktop-full.png | tech-stack-delba-mobile-full.png

## Cassidy Williams (cassidoo.co) — https://cassidoo.co · active dev-advocate blog, posts through Aug 2026
- **desktop**:
  - Single centered column, capped ~600px wide, set entirely in a monospace font (true 'terminal manifest' aesthetic) with a circular photo up top.
  - No stack section at all in the conventional sense — instead every blog post carries inline colored '#hashtag' text-tags ( #technical #learning #project ) directly under its one-line description, and the footer repeats the full tag vocabulary as a flat wrapped row of the same hashtag links: '#personal #musings #advice #recommendation #learning #work #meta #technical #events #project'.
  - Nav itself is plain underlined lowercase words in a row: home newsletter blog github socials — no pills, no active-state background.
- **mobile**:
  - Identical single-column layout at 390px — this site never had a second column to collapse. The only visible change is the nav row and the tag row both wrap onto 2 lines instead of 1 because monospace hashtags don't compress.
  - Photo, headline, and body text scale down proportionally with no restructuring; this is a genuinely 'mobile-first because it was never desktop-heavy' site.
- **motion**:
  - None observed — no transitions, no hover states beyond underline (implied by consistent monospace/underline convention across dev blogs of this style).
- **steal**: Give maxfolio's skill tags a monospace '#hashtag' treatment attached to PROJECTS instead of a separate skills section: under each store case study put '#shopify-functions #wasm #klaviyo #ab-testing' in Cassidy's exact typographic register (colored underline, no pill background) — tags become retrieval/filter affordances tied to real work, not a static inventory card.
- screenshots: tech-stack-cassidoo-desktop-full.png | tech-stack-cassidoo-mobile-full.png

## Shawn 'swyx' Wang (swyx.io) — https://www.swyx.io · active, posts through March 2026
- **desktop**:
  - Top band is the only card-like archetype on the page: a 3-cell bento (bio card / 'Latent Space' + 'AI Engineer' project tiles / a dark 'book ad' tile) — everything BELOW it abandons cards entirely.
  - 'Things worth thinking about' is a 4-up row of essay tiles with small hand-drawn ink illustrations instead of tech logos or photos — a stylistic alternative to stock icons.
  - The real density lives in 'The rest of the library': a two-column plain-text index — 'Popular writing' bullet list (12 essay links, each with a 1-line italic description underneath) beside 'Popular speaking' (grouped under bold era headers: 'The modern era:' / 'The JS/Beginner Era:'), then a full-width 'More recent entries' table-like list with dates right-aligned, no zebra striping, no borders — 15+ rows readable as one continuous scan.
  - This is a dense-information page that stays scannable purely through typographic hierarchy (bold link + italic sub-line + hanging indent) rather than cards or a table.
- **mobile**:
  - The 3-cell bento header stacks to 3 full-width tiles top to bottom.
  - The 4-up essay row becomes a vertical stack (each tile full width, illustration same size — no cropping).
  - The two-column 'Popular writing / Popular speaking' split becomes fully sequential single-column reading order; the right-aligned-date list keeps its date on the same line at 390px (font just shrinks) rather than wrapping to a second line — a deliberate width budget decision worth copying.
- **motion**:
  - No animation observed; a 'Live readers' counter pill in the top-right is likely a live-updating text badge (dynamic content, not motion).
- **steal**: For 'Year by year' or 'Projects', borrow swyx's era-grouped list pattern: instead of individual numbered rows, group projects under bold section headers by year-range ('2024–2026: Platform era', '2022–2023: Storefront era') each followed by a plain bullet index — turns a long flat list into a skimmable outline without adding any card chrome.
- screenshots: tech-stack-swyx-desktop-full.png | tech-stack-swyx-mobile-full.png

## Samuel Kraft (samuelkraft.com) — https://samuelkraft.com · active, 2026
- **desktop**:
  - Extremely narrow single column (~600px, left-aligned on a wide canvas) opens with a one-line role statement carrying tiny inline glyph icons before each company name: 'Design Engineer at ✺ Raycast currently working on ⌗ Glaze.' — a 2-3px monochrome pictogram substitutes for a full logo, kept inline at text size.
  - 'Projects' section is a vertical stack of full-bleed 16:9 dark preview tiles (product screenshots/icons on black), each followed by a plain title + 1-2 line caption — visually a 'media-first collage' feed, not a card grid (no borders, no shadow, no grid columns, just stacked rectangles).
  - Ends in a plain 'Posts' list: title left, date right, 4 rows, 'See all ->' — same dense-index pattern as swyx/leerob.
- **mobile**:
  - Not fully captured this pass, but the single-column desktop layout (already mobile-width) implies a near-identical mobile view — full-bleed project tiles likely stay full-bleed edge-to-edge instead of getting a margin.
- **motion**:
  - None observed.
- **steal**: Steal the inline-glyph-before-company-name device for maxfolio's Experience rail: instead of a text-only role line, prefix 'Digitdeck', 'client store names' etc. with a tiny 1-color glyph (not a full logo) sitting inline in the sentence — cheap to make, reads as considered rather than corporate-logo-wall.
- screenshots: tech-stack-samuelkraft-desktop-top.png | tech-stack-samuelkraft-desktop-full.png

## Josh W. Comeau (joshwcomeau.com) — https://www.joshwcomeau.com · long-running, active 2026
- **desktop**:
  - This is a blog homepage (his /about 404'd during this pass), so the 'stack' surface here is the 'Browse by category' widget: a 2-column wrap of rounded pill tags (CSS, React, Animation, Career, JavaScript, SVG, Next.js, General) in a light-blue sidebar card — the one site in this set that DOES use literal chip/pill UI for tech terms.
  - Notably the chips are topic tags for content discovery (a filter), not a personal skills inventory — a meaningfully different job than maxfolio's 'I know these 40 tools' card grid.
- **mobile**:
  - Not captured this pass (homepage only); the pill-wrap pattern is inherently mobile-safe since flex-wrap needs no breakpoint logic.
- **motion**:
  - A small illustrated character sits above the fold with scattered animated-looking dots around it (static in the screenshot, plausibly a subtle CSS float/parallax on scroll given his known animation-heavy blog content — not confirmed by this capture).
- **steal**: Confirms a pattern to AVOID copying literally: don't reuse 'pill chip' UI for a personal stack list the way maxfolio's project cards already do (see 'Sebastian Correa portfolio' tags on maxfolio itself) — chips read correctly as topic filters, not as a badge of expertise; keep chips reserved for actual filtering UI (e.g. maxfolio's Shopify-work feature filter) and get the personal 'what I use' section OUT of chip form entirely.
- screenshots: tech-stack-joshwcomeau-desktop-top.png

## Dinesh Revunuru (dineshrevunuru.com) — https://dineshrevunuru.com · 2026 (project dated 'Jul 2026' inside a screenshot)
- **desktop**:
  - Hero is split: bold headline + 3-line bio (with company names bolded inline: 'Neudesic, an IBM company') beside a portrait photo on a soft pink field — narrative-with-inline-emphasis rather than chips.
  - Directly under the hero sits a full-width light-blue banner: a chat-bubble icon, 'Meet my best friend LOREM!' and an 'Ask Lorem ->' button — an embedded AI chat entry point whose placeholder copy is literally 'Ask about my Gen AI work at Neudesic' — i.e. the stack/experience surface is answered CONVERSATIONALLY on demand instead of pre-listed.
  - 'Enterprise work at Neudesic' section (the closest thing to a stack/skills area) is 4 colored tiles, each headed by the CLIENT'S OWN LOGO (Microsoft, Adani, Learning Care Group, Jira) plus one sentence — logo-as-evidence-of-scale rather than a tools list.
- **mobile**:
  - The 2x2 'Enterprise work' logo-tile grid collapses to a single stacked column, full width, same tile styling — straightforward reflow, no archetype change.
  - The 4 color-block project cards (desktop 2x2) also stack to 1-per-row; nothing is hidden or summarized, just reflowed — this whole page stays a card-grid site end-to-end and does NOT change archetype on mobile, worth noting as a miss to avoid.
- **motion**:
  - Not verified; the AI chat entry point implies a runtime interaction (not decorative motion).
- **steal**: The 'Ask Lorem' pattern generalizes well: maxfolio could add a small persistent 'Ask about my stack/an actual project' affordance near Skills/Experience that opens a scoped chat pulling from real case-study data — turns a static tool inventory into an interactive Q&A, which is the single most 'not-AI-slop, not-a-card' way to present deep tool/version detail without dumping it all on the page.
- screenshots: tech-stack-dineshrevunuru-desktop-top.png | tech-stack-dineshrevunuru-desktop-full.png | tech-stack-dineshrevunuru-mobile-full.png

## Gionatan Nese '26 (gionatannese.com) — https://www.gionatannese.com · Awwwards Site of the Day, Sep 05 2026
- **desktop**:
  - Pure typographic-identity opener: giant serif name split across two lines, tiny role label, a numbered footer counter ('080'), everything on a plain white field — a custom-scroll (locomotive-style) experience that ignores native window.scrollTo, meaning content reveals only on real wheel/touch input.
  - No stack/skills section exists on this kind of site at all — it's a pure hero/identity + case-study-gallery structure (motion-and-craft portfolio, not a tools inventory).
- **mobile**:
  - Same custom-scroll behavior blocks programmatic capture; the two name lines likely stack the same way, just smaller — genuinely unverifiable further without manual scroll interaction in this pass.
- **motion**:
  - Custom smooth-scroll engine (confirmed indirectly: native scrollTo produced zero movement across 12000px of attempted scroll, a signature of GSAP ScrollSmoother / Lenis-style hijacked scroll).
- **steal**: Negative-space lesson, not a stack pattern: award-winning 2026 motion portfolios in this design-only tier skip a tech-stack section entirely and let one bold identity line carry the whole hero — confirms maxfolio should NOT try to cram a tools inventory into the hero; keep Skills as its own later section.
- screenshots: tech-stack-gionatannese-desktop-top.png

## Khanh Nguyen (khanhnguyen.design) — https://khanhnguyen.design · 2026 (footer copyright '© 2026')
- **desktop**:
  - Dark charcoal full-bleed typographic hero: huge serif 'KHANH NGUYEN' stacked two lines, a vertical rotated wordmark pinned to the left edge, short italic-sans intro copy top-right, a bottom info row (city/timezone, availability, a 'SCROLL' hint) — an editorial full-bleed archetype with zero UI chrome.
  - Also custom-scroll driven (programmatic scrollTo did not advance content), consistent with the Awwwards-tier motion-portfolio convention seen across this set.
- **mobile**:
  - Unverified beyond the hero due to custom-scroll; the vertical side wordmark and bottom info row would need to be confirmed manually.
- **motion**:
  - Locomotive/Lenis-style hijacked scroll (same signature as gionatannese.com).
- **steal**: Borrow the rotated vertical wordmark + bottom metadata row (timezone, availability dot, scroll cue) as a low-cost 'alive' detail for maxfolio's hero — cheap CSS writing-mode + a live local-time string, no JS animation library needed, stays inside the Lighthouse-safe CSS/transform budget.
- screenshots: tech-stack-khanhnguyen-desktop-top.png

## ideas
- Kill the 'What I work with' card grid entirely (currently 7 white boxes x up to 13 bare bullet items each — confirmed in tech-stack-maxfolio-desktop-skills-zoom.png). Replace with delba.dev/leerob.com-style prose: 2-3 short paragraphs, one per domain (Shopify engineering / Frontend & motion / Data & AI), where every tool name is an inline bold or underlined word inside a sentence about what it actually shipped.
- For any tool names you still want scannable outside prose, use Cassidy Williams' '#hashtag' monospace tag style (colored underline text, no pill background, no border) attached under each Shopify-work case study row instead of a standalone Skills section — tags become retrieval affordances tied to real projects.
- Adopt swyx.io's era-grouped index for 'Year by year': bold year-range headers ('2024-2026 - Platform era') each followed by a plain bullet list of what shipped, collapsing 5 card panels into one continuously-scannable outline.
- Steal Samuel Kraft's inline-glyph-before-name device for the Experience rail: a tiny 1-color pictogram sitting inline before 'Digitdeck' / client names in the role sentence, cheaper and less corporate than a logo wall.
- Add a scoped 'Ask about my stack on this project' chat affordance near Skills or inside each case-study sheet, modeled on dineshrevunuru.com's 'Ask Lorem' bubble — converts a static tool inventory into an interactive surface without adding more visual density, and doubles as a strong, non-generic CTA moment.
- For the Process section (5 steps), drop the card-stepper and take the editorial-index route these dev sites use everywhere: a single vertical rule with 5 plain text blocks (numeral + bold verb + 1-line description), pinned/sticky only via the numeral changing color as you scroll past its block-no card border, no icon tile.
- Turn 'Skills' into a single continuous horizontal monospace terminal-style manifest (Cassidy-style font) at the very bottom near Contact, e.g. 'stack.txt' printed as `shopify.liquid · react19 · vite · tailwind · framer-motion · postgres · redis · bullmq` — one line, wraps naturally on mobile, zero JS.
- Reserve literal pill/chip UI (Josh Comeau's usage) exclusively for the Shopify-work feature FILTER that already exists — never reuse chip styling for a personal skills inventory again, since that visual language now reads as 'topic filter' not 'expertise proof' once you've seen joshwcomeau.com.
- For the mobile-specific archetype change Max wants: make 'What I work with' the one section that TRULY becomes something else on mobile - e.g. desktop = the new prose/era-grouped layout, mobile = a single monospace terminal block users can tap to expand by category (accordion), rather than the current behavior where mobile is just the same 7 cards stacked full-width (confirmed in tech-stack-maxfolio-mobile-full.png, contributing heavily to the 13480px mobile page height).
- Borrow Khanh Nguyen's rotated vertical wordmark + bottom metadata row (local time, availability dot) as a hero detail - pure CSS writing-mode, stays inside the Lighthouse-safe no-JS-library budget, adds a felt-alive touch without WebGL/GSAP.
- Borrow delba.dev's zero-chrome two-column split (index list left, small photo+about+plain-text social row right, hairline separator) as an alternate Contact-adjacent 'About' layout, replacing any card treatment still lingering around the bio/photo.
- When you do want icons at all (e.g. for the Shopify/Frontend/Backend groupings), take swyx.io's approach of small hand-drawn/monochrome ink marks instead of brand-color tech logos - avoids the 'logo soup' look that reads as templated.
- Use swyx's right-aligned-date list pattern (title left, date right, no zebra striping) for the Year-by-year or Projects index if you keep any date-stamped list, since it stayed legible and didn't wrap even at 390px in his mobile capture.
- Note for copy: three of the reference bios (leerob, delba, samuelkraft) open with a single declarative role sentence naming the CURRENT employer/project before any history - maxfolio's hero already does a version of this; keep any Skills-section rewrite matching that same directness rather than a resume-style list.
## avoid
- Do not reuse rounded 'pill' chip styling for a personal skills/tools inventory - joshwcomeau.com shows chips read as content-topic filters, and maxfolio's own project cards already use pill tags for tech stacks (Astro/TypeScript/Tailwind etc. under 'Sebastian Correa portfolio') so a second chip treatment for the main Skills section would just be more of the exact card-and-chip density the owner is complaining about.
- Do not adopt hijacked/custom smooth-scroll (Lenis/Locomotive/GSAP ScrollSmoother) purely for aesthetic parity with gionatannese.com or khanhnguyen.design - it breaks native scrollTo/anchor behavior (measured directly: this capture's native scrollTo produced zero movement on both sites) and risks Lighthouse/accessibility regressions maxfolio cannot afford.
- Do not build a literal AI-chat widget as a Skills replacement without real backing data - dineshrevunuru.com's 'Ask Lorem' works because it is scoped to one real project; a generic chatbot with no verified answers would read as exactly the 'AI slop' Max wants to avoid.
- Do not just single-column-stack the existing 7 skill cards for mobile and call it a redesign - that is what maxfolio already does today (confirmed: mobile page runs to 13480px partly from this section) and produces a wall of near-identical white boxes scrolling for a long time, the opposite of 'sections that completely change on mobile'.
- Do not add tech-logo walls/marquees copying big brand icons (React, Node, Shopify) at full color - none of the credible developer sites in this set do this; the ones that use any iconography at all (samuelkraft.com, swyx.io) use tiny monochrome glyphs or hand-drawn marks, not brand logo soup, to avoid the generic-template look.
- Do not port Awwwards-style typographic-identity heroes (gionatannese.com, khanhnguyen.design) as-is expecting them to double as a stack/skills display - those sites deliberately carry NO tools inventory anywhere; keep hero and Skills as separate, purpose-built sections rather than trying to merge them for 'efficiency'.

# LENS 2: motion-catalog (agent ab119a65f132b7a11)

## Gionatan Nese — Multi-Disciplinary Designer — https://www.gionatannese.com/ · Awwwards Site of the Day, 2026-09-05
- **desktop**:
  - Entire page is a single fixed-height canvas (documentElement.scrollHeight ≈ viewport height, i.e. no real scroll) — no header/footer nav at all.
  - ~11 small square project thumbnails float in open whitespace around a centered wordmark 'GN .D', with 'Gionatan Nese' at left baseline and 'Multi-Disciplinary Designer' at right baseline.
  - No cards, no grid — it reads as objects scattered mid-air on a blank page.
- **mobile**:
  - Same floating-collage concept genuinely re-composed into a narrower portrait arrangement (tiles re-stack around a vertical center column) rather than being simplified or dropped into a plain list — proof the collage is a responsive layout, not a fixed pixel scene.
- **motion**:
  - Comparing two captures taken ~3s apart (page never scrolled, since content height = viewport) shows every single thumbnail in a different x/y position and slightly different rotation each time — continuous ambient drift/float of the whole collage, most likely independent slow keyframe loops or a cursor-repulsion field, not a scroll trigger.
  - Cost/benefit: cheap (transform-only loops, framer-motion `animate` with `repeat: Infinity` or CSS keyframes) — Lighthouse-safe. Mobile-safe if drift amplitude is reduced and paused off-screen (IntersectionObserver).
- **steal**: For 'OTHER ways to display the tech stack' or the Shopify-work index: replace a segment of the current index list with a single-viewport ambient collage of small square tiles (store screenshots/logos) that drift slowly and gently repel from the cursor on desktop only — zero new dependencies, transform/opacity only.
- screenshots: motion-catalog-gionatannese-desktop-top.png | motion-catalog-gionatannese-desktop-mid.png | motion-catalog-gionatannese-mobile-top.png | motion-catalog-gionatannese-mobile-mid.png

## ERA Residence (Estepona) — https://www.era-residence.com/ · Awwwards + FWA + CSSDA Site of the Day
- **desktop**:
  - Full-bleed dark maroon hero with a giant reversed-out cursive wordmark watermark behind the small serif logotype 'ERA RESIDENCE', flanked by tracked-out labels 'COSTA' / 'DEL SOL'.
  - A hero photo (pool/courtyard) sits inside a tall gothic-arch mask. At the very top of the page only a sliver of the arch is visible (mostly cropped above the fold); ~2600px further down the same arch is fully grown into a large, complete archway framing the same photo.
  - This is a scroll-scrubbed clip-path/mask GROWTH, not a one-shot on-load reveal — the mask geometry is tied to scroll offset.
- **mobile**:
  - Collapses to a static single-column hero: small flower emblem, then centered 'ERA RESIDENCE / Estepona' (script) wordmark, a thin vertical divider line, and a footer tagline 'ERA RESIDENCE — A PLACE TO RETURN TO.' — no arch/photo visible yet at the very top or one further scroll step, meaning the ceremonial per-screen pacing of the desktop version is preserved rather than compressed.
- **motion**:
  - Scroll-driven mask/clip-path expansion of an architectural arch around a hero photo — feels like walking through a doorway as you scroll. CSS-only (clip-path percentage keyed to scroll fraction via `useScroll`+`useTransform` in framer-motion, or a plain `scroll-timeline`). Cost: low; mobile-safe if the arch shape is simplified to a plain rounded-rect on narrow viewports to avoid GPU-heavy path clipping.
- **steal**: For the Contact section's giant typographic line: reveal a placeholder headshot photo through a mask (arch, or a simple rounded doorway) that grows as the visitor scrolls the final screen — turns the CTA moment into a small ceremony instead of a flat block, and doubles as the 'photo placeholder' the brief already allows.
- screenshots: motion-catalog-era-residence-desktop-top.png | motion-catalog-era-residence-desktop-mid.png | motion-catalog-era-residence-mobile-top.png | motion-catalog-era-residence-mobile-mid.png

## Illoca (Unseen Studio) — https://illoca.unseen.co/ · Awwwards Site of the Day, 2026-09 (via Unseen Studio)
- **desktop**:
  - Blueprint/graph-paper canvas background (fine grid + a small x/y coordinate readout in the corner, reinforcing 'architectural' positioning) sits behind an editorial hero.
  - The H1 'Design at the speed of thought' has small hand-drawn, marker-style annotation labels with curved arrows pointing at specific words: 'ARCHITECTURAL' pointing at the top line, 'NOT SOFTWARE' pointing at 'thought' — like sticky-note callouts layered over set type.
  - Below, a duotone (navy-blue/tan) line illustration of an architect at a drafting desk, with a one-line strap 'The intelligent canvas that thinks with you, not for you.'
- **mobile**:
  - Same grid background persists edge-to-edge. Nav bar collapses from a pill-button row + 'Try for free' button to a compact logo + single 'Try for free' pill + a text 'Menu' + hamburger icon on the far right — a true nav-to-menu transform, not just smaller buttons.
  - Annotation labels shrink and re-wrap tight against the headline instead of floating further out, so the callout device survives the breakpoint rather than being dropped.
- **motion**:
  - Best explained by a known, attributable technique: hand-drawn SVG callout arrows/labels drawn on with `stroke-dashoffset` animated from full length to 0, triggered on `whileInView` (framer-motion) or `IntersectionObserver` — the 'draw itself on' effect popularized on Codrops and in Emil Kowalski-style micro-interaction writeups.
  - Cost/benefit: very low cost (one SVG path + a duration/ease), high perceived craft. Mobile-safe as long as the stroke length is capped so the draw finishes quickly on small screens.
- **steal**: Annotate the Process steps or Skills chips with small hand-drawn arrow+label call-outs ('shipped in 3 days', 'Digitdeck house pattern') that self-draw on scroll — a concrete, non-generic way to 'illustrate long/bulky info' without another card, and it reads as intentional craft rather than AI-slop decoration.
- screenshots: motion-catalog-illoca-fix-desktop-wait11s.png | motion-catalog-illoca-fix-mobile-wait11s.png | motion-catalog-illoca-desktop-top.png

## Aardvark Book Club — https://www.aardvarkbookclub.com/ · Awwwards Site of the Day, 2026-08-30
- **desktop**:
  - Maximalist color-blocked hero: yellow background with orange/cream wavy blob shapes, giant black display headline 'Unbox stories worth talking about', tilted book-cover photography composited at odd angles (not in a grid).
  - Below the fold, four tilted, alternating-color full panels — 'Explore our books' (cyan), 'Build your box' (magenta), 'Check your doorstop' (yellow), 'Share your reads' (purple) — each with a flat hand-drawn doodle illustration, overlapping a wavy blob shape that transitions into the next (cyan) full-bleed section.
- **mobile**:
  - Sticky header collapses hero's inline nav into a persistent orange 'Menu' pill + hamburger icon that stays fixed while scrolling (confirmed present at both a top and a mid-scroll capture).
  - The four-panel process row reads as giant single-column color bands rather than a card grid — i.e., what would be a 4-up card grid on a generic site is one full-bleed color panel per step, stacked vertically, each bleeding into the next via a rounded/blob transition rather than a hard cut.
- **motion**:
  - Organic blob-shaped dividers between the hero and the process row (and, per the Awwwards writeup, 'custom 3D, interactive elements' elsewhere on the site) suggest scroll-tied scale/skew or path-morph transforms on the blob dividers, plus a color crossfade as each full-bleed panel enters.
  - Cost/benefit: an SVG blob path with a `d` morph on scroll is moderate cost if animated every frame; cheaper version is a static blob mask with only the color panel it wraps crossfading — still very Lighthouse-friendly.
- **steal**: Turn the current 5-step Process (scroll stepper with a pinned numeral) into 5 full-bleed alternating-brand-color bands, each with its own hand-drawn-style numeral, separated by a wavy blob mask instead of a hairline — directly answers the brief's 'the five-steps section needs a clearer non-card layout' without abandoning the pinned-numeral idea, just changing what surrounds it.
- screenshots: motion-catalog-aardvark-desktop-top.png | motion-catalog-aardvark-desktop-mid.png | motion-catalog-aardvark-mobile-top.png | motion-catalog-aardvark-mobile-mid.png

## Uncommon (Studio, Australia) — https://uncommonstudio.com.au/ · Awwwards Site of the Day + Developer Award + FWA
- **desktop**:
  - Near-black hero. Mid-scroll capture caught the animation in flight: the H1 'We design for impact. See for yourself' fading up from near-zero opacity, while a wall of rotated, overlapping project thumbnails (a poster, a green bubble/network chart, a navy 'Woman of the year' cover, an olive poster, a cyan bold-type tile reading 'WORK ABOUT MEDIA PLAYGROUND') fades in behind/around the headline like photos scattered on a desk.
- **mobile**:
  - Same scattered-photo-wall idea, genuinely re-collaged (not just shrunk) into a portrait stack of ~7 tilted rectangles behind the 'UNCOMMON' wordmark and a 'WORK WITH US' CTA.
  - Further down (still mobile), the studio's differentiators render as a vertical list — 'Hyper-collaboration', 'Specialist minds', 'Diverse skill…' — where each successive line sits at a visibly lower opacity in our still (top line ~full opacity, following lines fading toward transparent), consistent with a staggered scroll-triggered opacity/blur reveal that resolves each line to full strength as it crosses a threshold.
- **motion**:
  - Staggered fade/blur-up list reveal, one item per scroll-threshold crossing — framer-motion `whileInView` + a small stagger delay per child, or a scroll-linked opacity map. Cost: low; very mobile-safe (it's exactly how it appeared on our 390px capture).
- **steal**: For Skills' six prose sentences: replace the static block with this staggered-opacity reveal — each sentence (and its inline tool chips) starts low-opacity/blurred and resolves to full clarity as it enters the viewport, adding forward motion to a section the owner wants reimagined without turning it into more cards.
- screenshots: motion-catalog-uncommon-desktop-top.png | motion-catalog-uncommon-desktop-mid.png | motion-catalog-uncommon-mobile-top.png | motion-catalog-uncommon-mobile-mid.png

## Aralesk — Collages & Motion — https://aralesk.es/en/ · Awwwards Illustration/Art category nominee
- **desktop**:
  - Full-bleed, autoplaying background video: a grainy, horizontal-scanline collage texture with rust-colored stains drifting across the frame (looks like an old CRT/photocopier scan loop).
  - A centered wordmark logo 'ARALESK' sits on top; directly beneath it, a horizontal filmstrip of ~14 narrow vertical swatches alternates solid magenta bars with cropped texture-photo thumbnails.
- **mobile**:
  - Identical composition scaled to a portrait frame — background video, wordmark, and swatch strip all persist with no layout change beyond width/height, plus a small mute/unmute icon appears top-left (absent in the desktop crop) — confirming audio is part of the experience and is muted-by-default with an explicit toggle, a good accessibility default to copy.
- **motion**:
  - The swatch strip reads as a marquee/ticker (a classic horizontally-looping row of fixed-width tiles); paired with the looping background video this gives near-continuous ambient motion with zero interaction — both are CSS/`<video>`-only, no WebGL, so it is fully in-bounds for the Lighthouse-100 constraint.
- **steal**: Upgrade the existing 'fleet marquee' band: instead of a flat logo row, tick a strip that alternates solid brand-color bars with tiny cropped store-screenshot swatches, layered over a very subtle looping grain/noise loop (or a CSS-only animated noise texture) instead of flat white — keeps the marquee archetype but gives it the same ambient-motion feel at near-zero performance cost.
- screenshots: motion-catalog-aralesk-desktop-top.png | motion-catalog-aralesk-mobile-top.png

## ideas
- Ambient drifting collage (Gionatan Nese pattern): swap a slice of the Shopify-work index or Gallery for a single-viewport canvas of small store-screenshot tiles that slowly drift and repel from the cursor — desktop-only, transform/opacity keyframes, no library beyond framer-motion.
- Scroll-scrubbed mask reveal (ERA Residence pattern): reveal Max's placeholder headshot through a growing shape mask (arch, doorway, or a simple rounded rect) as the visitor scrolls the final Contact screen — a CSS clip-path tied to scroll fraction, cheap and dramatic.
- Self-drawing SVG annotations (Illoca pattern): add small hand-drawn arrow+label call-outs next to Process steps or Skills chips that draw themselves on with stroke-dashoffset when scrolled into view — a concrete 'other way to illustrate bulky info' that reads as intentional craft, not decoration.
- Full-bleed alternating-color process bands (Aardvark pattern): rebuild the 5-step Process as 5 full-bleed brand-color bands (not cards) separated by a soft blob/wave mask, keeping the pinned scroll-numeral but removing the card chrome entirely — a direct fix for 'the five-steps section needs a clearer non-card layout.'
- Staggered opacity/blur-up reveal (Uncommon pattern): rewrite Skills' six prose sentences so each sentence (with its inline tool chips) starts low-opacity/blurred and resolves to full clarity as it enters the viewport, one at a time — motion without another card.
- Ticker-strip marquee over ambient texture (Aralesk pattern): upgrade the fleet marquee to alternate solid brand-color bars with tiny store-screenshot swatches, ticking over a subtle looping grain/noise background instead of flat white.
- Horizontal year-scrubber for Year-by-year: replace (or offer as the desktop mode) a horizontal drag/scroll rail where a giant year numeral moves and a role card slides in beneath it — a 'NEW way to show experience across years' that is explicitly a different archetype (rail) from the current vertical hairline timeline; on mobile this collapses to a swipeable snap-carousel of year cards, giving the section a genuine mobile-specific transformation.
- Comparison small-multiples for Shopify-work charts: add one shared small-multiples strip (12–19 tiny sparklines, one per store, same metric) alongside the existing per-store indexed-line/gauge/bar mix, so the case-study sheets keep varied chart types per store while the index page also offers one true comparison view across the whole roster.
- Magnetic CTA button on 'Get the free 20-minute review': cursor-attraction physics (a documented Codrops/emilkowal.ski pattern) via a framer-motion spring on mouse position within a bounding box — cheap, no new dependency, strengthens the primary CTA the owner wants punched up.
- Cursor-follow preview thumbnails on the Shopify-work index list: hovering a store name on desktop floats a small screenshot next to the cursor (classic editorial-list hover, seen in spirit in Uncommon's scattered project wall); on mobile this hover behavior doesn't exist, so mobile instead shows the thumbnail inline under the row — a genuine, purposeful mobile-vs-desktop split rather than just hiding the effect.
- Word-level mask reveal for the typographic hero: stagger each word's baseline-mask-up on load (~40–60ms per word) instead of (or in addition to) the current static hero, matching the strong opening-type-animation moment seen at Illoca and Aardvark.
- Spring-overshoot count-up for the stat band: swap the current linear/eased count-up for a framer-motion `useSpring` with slight overshoot so each numeral settles with a tiny bounce — a one-line change that reads as more dynamic per the brief's 'more dynamic animation' ask.
- Mobile-only chip ticker for tech stack: on mobile, replace the six prose sentences' inline chip lists with a slow auto-scrolling horizontal ticker of just the chips (pausable on touch) — a section that completely changes shape on mobile rather than just reflowing.
- Parallax curtain in Contact: give the giant typographic contact line and the hairline info row (email/phone/location/social) different scroll speeds so the section feels like two layers sliding past each other — CSS `transform: translateY` tied to scroll fraction, no JS scroll libraries needed.
- Shared-element morph for case-study sheets: when a store name is tapped, animate that row itself (via framer-motion `layoutId`) scaling up into the header of the case-study sheet, so the transition reads as one continuous surface stretching rather than a card popping open — softens the 'too much information in cards' complaint by making the card metaphor itself disappear into the motion.
## avoid
- Gated 'click START to enter' intros (seen at minhpham.design) — hides all content behind an interaction and reads as slow/precious; never gate the page behind a click.
- Pure canvas/WebGL kinetic-type heroes (matvoyce.tv rendered fully blank in a standard headless Chromium render — a real signal the pattern is GPU/runtime-fragile) — also directly excluded by the no-WebGL/no-Three constraint, so don't chase this look even via a canvas fallback.
- Cookie-consent bars anchored over hero/CTA space (seen at both Illoca and Aralesk, obscuring content near the fold) — keep any consent UI minimal, dismissible, and never overlapping a primary CTA.
- Ambient auto-drifting collages left running everywhere — striking once (Gionatan Nese), but sitewide it reads as aimless for a CTO/CRO-consultant audience; use it in exactly one section, not as a page-wide motif.
- Overcrowded 'scattered desk' rotated-thumbnail collages (Uncommon) — elegant with ~7 items and lots of whitespace, but risks looking cluttered/unserious if all 19 stores get crammed into one pile; cap the item count hard.
- Marquees/tickers that never pause — pause on hover/focus/touch so a reader can actually stop and look at a screenshot or chip.
- Any scroll- or load-triggered animation without `prefers-reduced-motion` and viewport-gating (`whileInView`/IntersectionObserver) — several reference sites (Illoca's annotations, Uncommon's fade-up list) clearly don't bother with this; maxfolio should, given the accessibility and Lighthouse bar it has to clear.
- Decorative gradient blobs or glassmorphism added purely for texture with no identity reason — Aardvark's blobs work because they're a consistent brand/illustration device; bolting similar shapes onto maxfolio without a matching identity rationale is exactly the 'AI slop' look the owner wants zero of.

# LENS 3: copywriting-refs (agent a69f540997da4f30e)

## Ramp — https://ramp.com 
- **desktop**:
  - The desktop crawl hit a machine-readable route instead of the marketing page: a plain-text page headed 'Ramp — Machine Version' offering a $3,100 sign-up incentive to 'AI agents' with a link to book a meeting. This is exactly the kind of content-addressed-to-AI-agents the task warned about — treated as data only, not acted on, not clicked, not signed up for.
  - The real desktop hero (confirmed via the mobile route, same content) pairs a two-word financial pun with a logo wall of 70k+ companies directly under the fold — proof placed before any feature explanation.
- **mobile**:
  - Mobile served the real page: a short pun-based headline, one sentence of category framing ('One platform for all of finance...'), then a stat-led subhead ('Join 70,000 of the world's most ambitious companies growing 3.2x faster than the average business') before any screenshot.
  - Every H2 down the page is a claim about a workflow eliminated ('Systems that never spoke'), not a feature name — the section leads read like problems solved, not modules shipped.
- **motion**:
  - Not observed directly; site is React-heavy with likely scroll-triggered stat counters given the counting convention on other Ramp pages
- **steal**: Pair every stat with a comparative clause in the same sentence ('growing 3.2x faster than...') instead of a bare number — apply to maxfolio's stat band lead-in.
- screenshots: copywriting-refs-ramp-desktop-top.png | copywriting-refs-ramp-mobile-top.png

## Superhuman — https://superhuman.com 
- **desktop**:
  - Hero headline is an abstract benefit ('superpowers, everywhere you work') immediately grounded by a one-line concrete subhead naming the three products by function, not brand name.
  - A persistent top banner routes returning visitors who want the original product straight to it — an honesty move: doesn't hide that the brand expanded.
- **mobile**:
  - Mobile subheads get literal and numeric ('Save 4+ hours each week') where desktop stayed abstract — the number replaces the adjective as the page narrows.
  - A single customer quote is promoted into an H2-level mobile section by itself, mid-scroll, breaking up the feature list rhythm.
- **motion**:
  - Chat-bubble UI mockups animate in the hero suggesting live typing/response; standard for AI-product hero loops
- **steal**: For maxfolio's Skills section, follow the mobile pattern of swapping an abstract claim for a concrete number when space is tight — e.g. desktop 'engineering that is measured' becomes mobile '800+ tests before anything ships'.
- screenshots: copywriting-refs-superhuman-desktop-top.png | copywriting-refs-superhuman-mobile-top.png

## Basecamp — https://basecamp.com 
- **desktop**:
  - Left rail is a plain link list doing double duty as a table of contents and copy teaser ('Reliable to the core', 'And BC5 is all new for 2026') — each link is itself a mini headline.
  - Below the fold, section leads talk like a founder, not a marketer: 'Remember when companies cared about service? We still do.' — first person plural, conversational, zero jargon.
  - A live counter ('X people are working in Basecamp right now') sits inline with prose, not boxed as a stat card.
- **mobile**:
  - The left-rail link list collapses into the same list but stacked full-width above the hero image, which drops below it — nav-as-teaser becomes the first thing read on mobile, ahead of any visual.
  - Customer-quote rows (desktop: a horizontal band of star ratings) become a vertical stack, one per row, same star-rating convention kept identical rather than simplified.
- **motion**:
  - Screenshot mockups have subtle cursor/hover state baked into the static image rather than live animation — low-cost motion illusion worth copying for Lighthouse-safe builds
- **steal**: Give maxfolio's nav or section index the Basecamp treatment: each nav label doubles as a one-line teaser of what's in that section, so scanning the top of the page previews the whole story before scrolling.
- screenshots: copywriting-refs-basecamp-desktop-top.png | copywriting-refs-basecamp-mobile-top.png

## HEY (37signals) — https://www.hey.com 
- **desktop**:
  - Hero opens with three real customer star-quotes ABOVE the headline, not below it — social proof leads, not trails.
  - Headline names the competitor category directly ('Gmail, Outlook, and Apple got complacent') — confident, adversarial framing rare in B2B SaaS.
  - Single CTA button carries a built-in offer ('Try HEY free for 30-days') instead of a generic 'Get started', with a one-line reassurance directly under it ('No obligation, no CC required.').
- **mobile**:
  - Identical structure to desktop kept intact — three-quote row stacks into a single row still visible above the fold rather than being cut, because the quotes are short.
- **steal**: Move maxfolio's reassurance micro-copy pattern under every CTA, not just style — button text carries the offer itself ('Get your free 20-minute review'), and a one-line trust sentence sits directly beneath, matching HEY's button+reassurance pairing.
- screenshots: copywriting-refs-hey-desktop-top.png | copywriting-refs-hey-mobile-top.png

## PM Digital Design — https://www.pmdigitaldesign.com 
- **desktop**:
  - Eyebrow line mixes plain text with a Shopify-bag icon inline ('The Full-Funnel CRO [icon] Performance Agency') then a colorful two-word identity pill directly under it ('CRO Obsessed.') before the real headline even appears — three layers of positioning before one sentence of benefit.
  - Body copy names the exact team composition per client ('One dedicated pod, strategist, designer, developer, QA') — specificity as a trust signal instead of an adjective.
  - Closing line of the hero paragraph is a contrast pair ('Not a ticket system. Not a fixed test count.') — negative framing to rule out competitor models before naming its own.
- **mobile**:
  - Entire hero stack (eyebrow, pill, headline, two paragraphs, two buttons) is preserved in the same order and length on mobile — no cutting, just narrower line-wrap. Proof that dense but well-chunked hero copy survives 390px if broken into short paragraphs.
- **steal**: Adopt the eyebrow-then-identity-pill-then-headline stack for maxfolio's hero: 'CTO & Shopify Tech Lead · Digitdeck' (eyebrow, exists) → a short identity pill like 'Store-Side, Not Agency-Side.' → then the outcome headline.
- screenshots: copywriting-refs-pmdigitaldesign-desktop-top.png | copywriting-refs-pmdigitaldesign-mobile-top.png

## Convertibles — https://convertibles.dev 
- **desktop**:
  - Giant two-line typographic wordmark of the core offer ('CRO+ for Shopify+') functions as the actual H1 — no separate smaller headline underneath explaining it further.
  - Immediately below, three inline bracketed tag-chips run in a row as proof points ('[ EXITED FOUNDERS, NOT ACCOUNT REPS ]', a test count, a client-size band) — same visual language as the nav's bracket styling, so proof and navigation share one typographic system.
  - Closing section (footer-adjacent) restates the core promise a second time in plain prose plus a live local-time clock — urgency without a countdown timer.
- **mobile**:
  - The two-line typographic wordmark shrinks but stays two lines and full-width — never becomes three lines or gets a smaller treatment; the three tag-chips stack vertically into a single column instead of a row.
- **steal**: For maxfolio's stat band, replace plain numeral tiles with bracket-styled inline tag-chips directly under the hero paragraph ('[ 18+ LIVE STOREFRONTS ]', '[ 800+ TESTS ]') — proof reads as part of the sentence, not a separate card grid the owner is trying to get away from.
- screenshots: copywriting-refs-convertibles-desktop-top.png | copywriting-refs-convertibles-mobile-top.png

## Netalico — https://netalico.com/pages/shopify-cro-agency 
- **desktop**:
  - Split 50/50 hero: real laptop photo of an actual client storefront on the left, positioning statement + one paragraph + single CTA on the right — the paragraph closes with a real named client and a real before/after number ('helped Lovey & Grink lift conversion from 1.75% to 2.4%').
  - A marquee ticker of trust badges (Clutch reviews, Shopify Plus Premier Partner, a press mention) runs above the nav, before the logo even loads.
- **mobile**:
  - The 50/50 split collapses top-to-bottom: photo first, full width, then text below — order preserved, ratio abandoned. The marquee ticker keeps running above the mobile nav too, just narrower text.
- **steal**: Close the Shopify-work section lead with one real named before/after number pulled from an actual case (clearly labeled where it's sample data), the way Netalico closes its hero paragraph — replaces vague 'bundles priced by Functions, quizzes, review walls' listing with one concrete proof sentence.
- screenshots: copywriting-refs-netalico-desktop-top.png | copywriting-refs-netalico-mobile-top.png

## KNR Agency — https://knr.agency/shopify-cro-agency/ 
- **desktop**:
  - Small-caps category label ('SHOPIFY CRO AGENCY') sits alone above a three-line headline naming the exact outcome ('...into measurable revenue'), then a hairline rule, then two short sentences ending on a negative-framing pair ('No unnecessary redesigns. No generic solutions.') before the single CTA.
  - Further down, the page literally splits into two labeled halves: 'The Diagnosis.' (bullet list of symptoms: stagnant conversion, AOV plateau, visitors leaving) followed by 'The KNR Promise.' — problem and promise as two named, sequential sections instead of one blended pitch.
- **mobile**:
  - Same three-line headline, same hairline rule, same negative-framing pair — nothing shortened. The 'Diagnosis / Promise' two-part structure stacks as two full-width sections in the same order, each keeping its own label, rather than merging into one paragraph.
- **motion**:
  - Subtle animated light-streak background behind the hero text, low-contrast so it doesn't fight legibility — CSS-gradient-safe, no WebGL needed
- **steal**: Restructure maxfolio's Process section lead as a named two-part sequence — 'The Bottleneck.' (what's usually broken: speed, offers, checkout friction — already in the contact copy) followed by 'The Fix.' (the five-step list) — gives the non-card layout the owner wants a narrative spine instead of a bare list.
- screenshots: copywriting-refs-knragency-desktop-top.png | copywriting-refs-knragency-mobile-top.png

## growth.design — https://growth.design 
- **desktop**:
  - Headline is a plain outcome statement over a dark ground; the subhead is the one doing all the differentiation work by naming the exact format ('fun weekly comics... in just 5 minutes') rather than the topic — format-as-differentiator.
  - Two competing CTAs are both framed as free and both use the same verb ('Sign up with Google (Free)' / 'Sign up with Email (Free)') — no primary/secondary hierarchy games, just two paths to the same low-friction action.
  - A trust row directly under the CTAs names a real headcount ('132,793 people') plus a recognizable logo wall — proof sits inside the hero, not in a separate section.
- **mobile**:
  - Illustration moves from beside the headline (desktop, split layout) to below both paragraphs and both buttons on mobile — text-first ordering, image demoted to confirmation rather than led with.
- **steal**: Put maxfolio's proof number ('16 storefronts live now') inside the hero block itself, directly under the CTA row, the way growth.design keeps its headcount proof inline rather than pushed to a separate stat band the owner already finds card-heavy.
- screenshots: copywriting-refs-growthdesign-desktop-top.png | copywriting-refs-growthdesign-mobile-top.png

## Fantasy (creative agency) — https://fantasy.co 
- **desktop**:
  - Hero is almost entirely non-verbal: a slow-morphing abstract shape on black, with only a two-word mood line in the corner ('Lead by Design') — copy is withheld until the second scroll, where the actual positioning paragraph appears naming real client work (LIV Golf) and ending with a direct invitation to talk.
- **mobile**:
  - The withheld-copy hero pattern is kept — same shape animation, same two-word corner line — because it costs almost nothing to render at any width; only the paragraph below reflows.
- **motion**:
  - Continuous slow morph/breathing animation on the central shape, CSS/SVG-plausible, no text motion in the hero itself
- **steal**: Do not copy the withheld-copy approach for maxfolio (it works for a brand-name agency with existing reputation, not for a consultant who needs to state the offer immediately) — noted here specifically as a pattern to avoid, not to steal, given the owner's complaint that a prior pass on the site's info density was already too vague in places.
- screenshots: copywriting-refs-fantasy-desktop-top.png | copywriting-refs-fantasy-mobile-top.png

## Retool — https://retool.com 
- **desktop**:
  - Headline speaks to a very current, very specific fear ('Secure your vibe-coded apps') rather than a timeless benefit — proof that a portfolio/product hero can name a 2026-specific anxiety and still read as premium, not gimmicky.
  - Nav nests solution categories as a four-word product lifecycle ('Build / Launch / Scale / Govern') used consistently as section anchors down the whole page, not just nav labels.
- **mobile**:
  - Identical headline kept verbatim; the four-word lifecycle nav collapses into a hamburger but resurfaces as the literal H2 sequence down the page, so the site's structure is legible even with the nav hidden.
- **steal**: Give maxfolio's Process section the same lifecycle-word treatment already partially present ('Discovery / Pattern map / Build / QA / Handoff') by repeating those five words as visible anchors elsewhere on the page (e.g. in the Shopify-work section subheads), so the vocabulary reinforces itself across sections instead of living only in the stepper.
- screenshots: copywriting-refs-retool-desktop-top.png | copywriting-refs-retool-mobile-top.png

## ideas
- Hero: replace the current declarative opener with a diagnostic second-person line borrowed from the KNR/Convertibles pattern — name the reader's problem (traffic not converting) before naming what Max does about it.
- Add a short identity pill under the eyebrow (PM Digital Design pattern) — one line like 'Store-side, not agency-side.' or 'Built the stores I audit.' — before the main headline, giving the hero three positioning layers instead of one.
- Retire the six-tile stat-band card grid per the owner's complaint; replace with the Convertibles bracket-chip pattern — inline tag-chips run directly under the hero paragraph or as a single horizontal marquee line, each chip one real number plus its label, no boxes.
- Give the stat band a one-sentence editorial lead before any numeral shows, e.g. 'Eighteen months of shipping, counted honestly' — so numbers read as evidence for a claim already made, not decoration (Basecamp's 'Big numbers. Highly-trusted.' convention).
- Turn the Process section into a two-part named sequence ('The Bottleneck.' then 'The Fix.') per KNR's Diagnosis/Promise split — this directly answers the owner's ask for a clearer non-card five-step layout by giving it a narrative spine instead of a bare numbered list.
- Reuse the five process-step vocabulary (Discovery, Pattern map, Build, QA, Handoff) as visible subhead anchors inside the Shopify-work case sheets, the way Retool repeats its Build/Launch/Scale/Govern words across the whole page — reinforces the system without adding new copy.
- Shopify-work section lead: close with one specific named before/after number from a real case (clearly tagged 'Sample data' where synthetic) instead of the current feature-listing sentence — mirrors Netalico's hero-closing proof line.
- Every CTA gets a reassurance line directly beneath it, not just the primary one (HEY/Basecamp convention) — 'Get your free 20-minute review' pairs with 'No pitch, no contract — just where you're leaking revenue,' and the same treatment extends to 'Download CV' and any tertiary link.
- Gallery section lead: tighten to name the actual proof mechanism already built into the section (hover-to-flip to the PDP) as the sentence's subject, e.g. lead with what the visitor is about to do, not a general design-philosophy statement.
- Contact section: keep the existing strong headline but restructure the promise line into the button+reassurance pairing convention seen across every reviewed site rather than a separate paragraph above the button.
- For mobile, apply the Superhuman abstraction-to-number swap systematically: wherever desktop copy uses an adjective ('measured', 'rock-solid'), mobile copy should swap in the concrete number that adjective stands for, since space is scarcer and numbers scan faster than adjectives.
- Nav-as-teaser (Basecamp): make each top-nav label do double duty by pairing it, on hover/focus only, with a three-to-five-word preview of that section's actual content — costs nothing on mobile since hover doesn't exist there, so it's a desktop-only enhancement that doesn't compete with the mobile-first rule.
- Nothing in the reviewed set uses more than two consecutive sentences per hero paragraph — audit maxfolio's current hero body (currently one three-line sentence) and consider splitting it the way PM Digital Design and KNR both do: one sentence naming who's served, one sentence naming what's different about the approach.
- For the 'Now' pill, borrow the marquee-ticker convention from Netalico/Convertibles (trust badges or a live local-time readout run continuously above the nav) as an option for showing '16 live / 7 in development' with more visual energy than a static pill, while staying within the marquee/ticker archetype already on the design-gate list.
- Avoid literal machine translation for ES/JA CTAs — Colombian Spanish audiences respond to explicit no-commitment language ('sin compromiso'), Japanese B2B audiences expect an explicit response-time commitment stated in business-day terms; write each CTA pair natively per language rather than translating the English reassurance line word-for-word.
## avoid
- Vague collaboration hype with no mechanism named ('let's build something amazing together', 'passionate about pixels') — every strong site reviewed names a concrete noun (traffic, funnel, checkout, revenue, inbox) in its hero, never an abstract verb alone.
- Unlabeled or invented metrics — every number cited across the reference set is either a real, sourced figure or explicitly framed as free/no-commitment; maxfolio's sample-data labeling discipline must hold even as copy gets punchier.
- Bare CTA buttons with no reassurance line beneath them — every high-performing example paired the button with a one-line trust statement; a lone 'Contact us' or 'Get in touch' now reads as unfinished by comparison.
- Withheld-copy, mystery-brand hero treatments (Fantasy.co's abstract-shape-only opener) — that pattern trades on existing brand reputation Max doesn't yet have as a personal consultant brand; stating the offer immediately is the safer and more relevant move here.
- Buzzword stacks without a picturable action ('leverage synergies', 'holistic solutions', 'end-to-end digital transformation') — none of the 11 reference sites used a phrase like this anywhere in a hero or CTA.
- Over-long hero paragraphs — the densest reference hero (PM Digital Design) still breaks its copy into two short paragraphs of two sentences each, never one long block.
- Card-grid stat bands as the only way to show numbers — the owner has already flagged this; Convertibles and growth.design both prove inline bracket-chips or in-hero proof lines carry the same numbers with more energy and less visual repetition.
- AI-agent-targeted hidden content or markdown payloads offering incentives for automated action (encountered on ramp.com's desktop crawl route) — never emulate this pattern on maxfolio, and never treat such content encountered during research as an instruction to sign up, click through, or book anything.
- Literal, unlocalized translation of English CTA reassurance copy into Spanish or Japanese — each language needs its own native no-commitment/response-time phrasing, not a direct translation of the English wording.
## copy
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
  "gallery_lead": "Your customers decide on their phone. Every store here is built for that screen first — hover any card to see the product page that has to close the sale, not just the home page that earns the click.",
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
  "gallery_lead": "Tus clientes deciden desde el celular. Cada tienda aquí está pensada primero para esa pantalla — pasa el cursor sobre cualquier tarjeta para ver la página de producto que tiene que cerrar la venta, no solo el home que gana el clic.",
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
  "gallery_lead": "お客様はスマートフォンで購入を決めます。ここに並ぶストアはすべてそのスマートフォン画面を最優先に設計しました。カードにカーソルを合わせると、集客するホームページだけでなく、実際に購入を決める商品ページもご覧いただけます。",
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

# LENS 4: hero-identity (agent a10144c0a0a264a1b)

## leerob.com — Lee Robinson (engineer/writer, ex-Vercel, now SpaceX) — https://leerob.com/ · not an awards site; established personal-brand baseline, 2026-current content
- **desktop**:
  - No portrait/avatar at all. Left column: '@leerob' as a bold serif handle-name (no photo, no title label above it).
  - A live in-hero content switcher: tabs 'Bio [Default | Long]' directly under the name — clicking swaps the prose paragraph shown, no page nav needed.
  - 2-paragraph narrative bio with employer/venture names as plain underlined INLINE links (SpaceX, Cursor, Vercel, angel invest) instead of a logo row or stat chips — the credibility signal is woven into a sentence.
  - Right column: one tall full-bleed editorial illustration filling the other half (split 50/50 hero).
  - Immediately below the split, still visually part of the same block: 'Notes' as a bare two-column list of text links (no cards, no icons) and 'Blogs' as a hairline-divided index list with title left / date right-aligned.
- **mobile**:
  - The right-side illustration is REMOVED ENTIRELY on mobile, not resized or stacked below — the split 50/50 archetype collapses to a pure single-column text stack.
  - Bio tab-switcher, prose, Notes list and Blogs list all keep the same order and structure, just full-width.
- **motion**:
  - Inferred only: the Bio Default/Long tab implies a text swap/crossfade on click; nothing else animated visibly in a static capture.
- **steal**: Steal the 'Bio: Default / Long' inline tab-toggle inside the hero itself — let one visitor read a punchy one-liner and another expand to the fuller CTO narrative without adding a card or leaving the hero — plus the pattern of citing real employer/store names as inline underlined text inside a sentence instead of a logo/chip row.
- screenshots: hero-identity-leerob-desktop-top.png | hero-identity-leerob-desktop-full.png | hero-identity-leerob-mobile-top.png

## gionatannese.com — Gionatan Nese, Multi-Disciplinary Designer — https://www.gionatannese.com/ · Awwwards Site of the Day + Developer Award, Sep 5-6, 2026 (fresh, not in exclusion list)
- **desktop**:
  - Pure typographic hero with NO photo, NO nav bar, NO CTA button: three text elements pinned to three separate horizontal positions instead of stacked as one block.
  - 'Gionatan Nese' flush far-left; a small stacked monogram/initials lockup ('N .D') sitting dead-center at the hero's vertical midline; 'Multi-Disciplinary Designer' flush far-right.
  - A tiny page-index numeral '001' centered at the very bottom; a single dot/menu toggle top-right is the only UI chrome.
- **mobile**:
  - Collapses to almost nothing: only the small centered monogram ('GN .D') survives, floating in a mostly blank screen with large negative space above and below.
  - The flush-left name and flush-right role labels that anchored the desktop hero are DROPPED ENTIRELY on mobile, not just restacked underneath each other — an edit-down decision, not a shrink.
- **motion**:
  - Cannot confirm animation from a static capture; the three-part pinned composition (name / mark / role at three screen positions) strongly suggests a GSAP-driven intro/scroll assembly on a normal connection — flagged as inferred, not observed.
- **steal**: Steal the idea of pinning name / identity-mark / role-label to three independent positions across the hero width instead of one centered stacked block — buildable with plain CSS grid + a staggered fade-in (no WebGL needed) — and steal the mobile move of dropping secondary text rather than shrinking all three elements onto one small screen.
- screenshots: hero-identity-gionatannese-desktop-top.png | hero-identity-gionatannese-mobile-top.png

## pacomepertant.com — Pacôme Pertant, motion & sound designer — https://pacomepertant.com/ · Awwwards Site of the Day, 2026 (fresh, not in exclusion list)
- **desktop**:
  - Hero IS a gate: full-bleed black canvas, small rotating 3D sphere/avatar icon, one-line role+location ('motion & sound designer / based in paris'), a pill button 'enter with sound ●' plus a smaller text link 'enter without sound' below it.
  - Past the gate, the 'hero' becomes a kinetic 3D wall of dozens of tilted, differently-colored project-thumbnail cards floating in a black grid — a 'spiral / list' view toggle sits top-center and a mute button bottom-right; identity moment and work-index are fused into one screen.
- **mobile**:
  - The gate screen is pixel-for-pixel the same composition, just narrower — no mobile rethink of the gate itself.
  - Post-gate, the same floating card wall persists (not swapped for a grid or list) but cards overlap more densely and the '2025 showreel' badge rotates from mid-screen into the bottom-left corner — a density change, not an archetype change.
- **motion**:
  - Gate sphere shows a live-looking gradient/shader distortion; post-gate cards sit at varied 3D rotations consistent with a drag/inertia explore interaction (inferred from the non-grid scatter, not directly interacted with).
- **steal**: Not the WebGL (blocked by the no-Three/no-GSAP, Lighthouse-100 constraint) — steal the CONCEPT of a first-paint preference choice reframed with zero 3D: e.g. a lightweight 'Recruiter / Brand owner' toggle in Max's hero that reorders emphasis on the rest of the page, giving a personalization beat without gating anything.
- screenshots: hero-identity-pacomepertant-desktop-top.png | hero-identity-pacomepertant-mobile-top.png

## leoparpeix.com — Léo Parpeix, Art Director / Interactive Designer — https://www.leoparpeix.com/ · Awwwards Honorable Mention, Portfolio 2026 (fresh, not in exclusion list)
- **desktop**:
  - A slim identity bar pinned to the very top hairline of the viewport: name far-left, role ('Art director, Interactive designer') center-left, nav links (Work/About/Playground) right, a live-status word with a small spinner dot far-right (not shown in top capture but present on scroll — status-style micro-copy).
  - Sits on top of a full-bleed, photoreal 3D-rendered editorial scene (a giant sculptural white flower + gallery plinths in a sunlit room) — not a flat photo, a staged 'set'.
  - A punchy two-line statement ('Driven by detail. Obsessed with seamless motion.') plus a 'Scroll down' link sit lower-LEFT overlapping the image, not centered.
- **mobile**:
  - The same 3D scene is KEPT (not swapped for a static crop or removed) but framed tighter so the flower fills almost the whole screen.
  - The top identity bar shrinks from 3 text items + nav to just the name plus two ICON buttons ('…' menu and hamburger) — labels become icons to save width rather than wrapping text.
  - The statement + scroll-cue block moves to sit directly UNDER the cropped image instead of overlapping it, avoiding text-on-image legibility issues at small size.
- **motion**:
  - The still frame shows floating dust motes and soft cloud texture in the background sky, consistent with an ambient looping animation ('living photograph') rather than a static hero image — inferred from visual cues, not confirmed via interaction.
- **steal**: Steal the top identity bar as three independent hairline items (name / role / live-status-with-dot) instead of one centered headline block — directly portable to Max's hero as a slim strip, with the 'status + pulsing dot' pattern mapping perfectly onto a CTO's 'Currently shipping X at Digitdeck' line, all CSS-only.
- screenshots: hero-identity-leoparpeix-desktop-top.png | hero-identity-leoparpeix-mobile-top.png

## samuelkraft.com — Samuel Kraft, Design Engineer at Raycast — https://samuelkraft.com/ · established personal site, not an awards entry
- **desktop**:
  - No big headline: a small circular avatar, name, then 4 short prose paragraphs (current role @ Raycast + side project Glaze, career history, interests/obsessions, location) with employer/project names as plain underlined inline links — same narrative-with-inline-links approach as leerob, denser.
  - Ends in a bare text row of social links (X / Email / GitHub / Strava) — no icons, no buttons.
  - The hero is deliberately SHORT — it does not fill the viewport; 'Projects' with a full-bleed dark video/image card begins almost immediately below.
- **mobile**:
  - Identical structure and copy at the same relative sizes, just single-column reflow — essentially no content-level change from desktop, which is itself the useful data point (a text-first hero survives mobile with minimal rework).
- **motion**:
  - None observable in the capture.
- **steal**: Steal the compact, non-full-viewport hero: end it after 3-4 lines of specific narrative + a bare link row, then let real proof (case studies / stat band) start almost immediately — this shortens time-to-proof for a recruiter skimming on mobile, instead of a giant hero + a second full-viewport stat band stacking two big beats back to back.
- screenshots: hero-identity-samuelkraft-desktop-top.png | hero-identity-samuelkraft-mobile-top.png

## kentcdodds.com — Kent C. Dodds, educator/consultant — https://kentcdodds.com/ · established personal site
- **desktop**:
  - Classic split 50/50: left = value-prop headline ('Helping people make the world a better place through quality software.'), two stacked CTAs (solid black primary 'Read the blog', outline secondary 'Take a course'), plus a text-link scroll-cue '↓ Learn more about Kent'.
  - Right = a large 3D-rendered mascot (a koala, mid-action on skis) surrounded by floating icons of his personal causes (solar panel, recycling symbol, reusable cup, snowboard, one-wheel) — an illustrated identity mark standing in for a portrait.
- **mobile**:
  - Content ORDER FLIPS rather than a straight stack: the illustrated character moves ABOVE the headline (image-first), where on desktop the headline leads and the image sits beside it.
  - The two CTAs and scroll-cue compress toward the very bottom of the mobile hero.
- **motion**:
  - The floating icons around the koala sit at varied individual rotations, consistent with each having its own idle float/rotate loop — inferred, not confirmed by interaction.
- **steal**: Steal the mobile REORDER, not just reflow: on mobile, lead with a strong illustrated/photo identity beat first, THEN the typographic value statement, then CTAs — worth A/B-style testing against Max's current text-first mobile hero for which hooks a stranger faster on a 390px screen.
- screenshots: hero-identity-kentcdodds-desktop-top.png | hero-identity-kentcdodds-mobile-top.png

## swizec.com — Swizec Teller, indie engineering consultant/author — https://swizec.com/ · established personal/consultant site
- **desktop**:
  - Hero sits in a full-bleed lavender band: bold condensed headline stating the newsletter's value prop, an informal identity line ('Hi I'm Swizec 👋'), then a REAL photograph of him mid-talk at a conference lectern (action/authority shot, not a posed headshot).
  - A sidebar module 'Books by Swizec' runs beside the hero showing two book covers as social-proof/products.
  - Persistent yellow 'Get the newsletter 💌' pill lives in the header nav, separate from any in-hero CTA.
- **mobile**:
  - The sidebar 'Books by Swizec' module (beside the hero on desktop) is pushed BELOW the fold entirely rather than reflowing underneath the hero card — the mobile hero stays tight (headline + intro line + photo + first paragraph only).
- **motion**:
  - None observed; this is a content/CTA pattern, not a motion pattern.
- **steal**: Steal the always-visible header CTA pill kept separate from the in-hero content, plus the use of a real in-action photo (speaking on stage) instead of a staged headshot — directly usable for Max as an authentic 'presenting/whiteboarding a Shopify architecture' placeholder shot rather than a studio portrait or no photo at all.
- screenshots: hero-identity-swizec-desktop-top.png | hero-identity-swizec-mobile-top.png

## adamwathan.me — Adam Wathan, creator of Tailwind CSS (indie consultant baseline) — https://adamwathan.me/ · established personal site
- **desktop**:
  - Small circular headshot + name, then a single question as the only heading ('Who the hell am I?'), followed by 4 short prose paragraphs (identity, what he shares, career-pivot story, current project) — no buttons, no imagery beyond the avatar.
- **mobile**:
  - IDENTICAL layout and copy to desktop, just reflowed — zero content-level adaptation at all.
- **motion**:
  - None.
- **steal**: The direct, informal question-as-heading ('Who the hell am I?') is a sharper hook than a flat 'About me' label — worth borrowing the TONE, not the layout.
- screenshots: hero-identity-adamwathan-desktop-top.png | hero-identity-adamwathan-mobile-top.png

## Framer Marketplace — 'Freelancer' one-pager template (AVOID baseline) — https://www.framer.com/marketplace/templates/freelancer-one-pager/ · commercial template, no award
- **desktop**:
  - Preview shows the generic freelancer-hero cliché: circular avatar + 'Hey, I'm Joseph Parker / Graphic designer' + one sentence of vague copy ('An aspiring web designer with a passion for creativity and innovation') + an email-capture-style input + a 'Let's do it' pill button, then a 2x2 grid of colorful gradient-blob thumbnails labeled 'Recent work' — everything is a rounded-corner card floating on a black canvas with a purple/orange glow.
- **mobile**:
  - The card stack simply narrows into one column; the 2x2 thumbnail grid becomes a swipeable carousel with dot indicators — a shrink, not a rethink.
- **motion**:
  - Not applicable (marketplace listing page, not the live template).
- **steal**: Nothing to steal — this is the exact 'template energy' / AI-slop aesthetic the owner said to avoid.
- screenshots: hero-identity-framertemplate-desktop-top.png | hero-identity-framertemplate-mobile-top.png

## Contra — 'Cape Town' portfolio template (AVOID baseline) — https://contra.com/portfolios/cape-town · commercial platform template, no award
- **desktop**:
  - Generic interchangeable-mood hero: the SAME headline ('Crafting visual experiences for modern brands') and the SAME two-tile gradient-blob thumbnail rendered as 5 side-by-side color-theme swatches (Dawn/Morning/Midday/Dusk/Midnight) sitting above the 'real' hero, which is itself boxed inside a bordered, rounded CARD (avatar + name + nav pills Projects/Services/About + outline 'Work with me' button).
- **mobile**:
  - The theme-swatch row becomes horizontally scrollable; the bordered hero card keeps its rounded-card chrome and just narrows — no structural change.
- **motion**:
  - None observed.
- **steal**: Nothing — reinforces the avoid list.
- screenshots: hero-identity-contratemplate-desktop-top.png | hero-identity-contratemplate-mobile-top.png

## ideas
- Add a slim identity strip pinned to the very top hairline of the hero — name / current role / live-status-with-a-pulsing-CSS-dot (e.g. '● Currently shipping the Peluna port at Digitdeck') — borrowed from leoparpeix, replacing part of the single giant centered headline.
- Give the hero copy an inline 'Bio: Short / Long' or 'For recruiters / For founders' text-tab toggle (leerob-style) so one visitor gets a punchy one-liner and another can expand the fuller CTO narrative in place, with no card and no page nav.
- Cite real employer/store names as plain underlined inline links inside a narrative sentence in the hero ('...led CRO across 19+ Shopify stores including Peluna, NOS Café...') instead of only a stat number — gives the metrics a face and teases the case-study section.
- Use a real action/authority placeholder photo (whiteboarding architecture, on a store floor, presenting) instead of a studio headshot or no photo — swizec's lectern-shot pattern reads more credible to DTC brand owners than a posed portrait.
- On mobile, REORDER rather than reflow: promote a strong visual identity beat (photo or one stat) above the headline, mirroring kentcdodds' image-first mobile flip, and test it against the current text-first mobile hero.
- Try a three-point pinned hero layout (name flush-left / current focus centered / availability flush-right along one hairline, gionatannese-style) as an alternative to the single centered manifesto line — visually distinct from the template-hero cliché.
- On mobile, DROP secondary hero elements entirely instead of stacking all of them (gionatannese's mobile move) — e.g. keep only the headline + one CTA on mobile, and defer the 'Now' pill / fleet marquee to their own section rather than cramming three hero-level messages onto one small screen.
- Shorten the hero itself (samuelkraft-style): end it after 3-4 lines of specific narrative + one CTA, so the existing stat band doesn't repeat the same 'big full-viewport wow' beat immediately after — currently two consecutive full-viewport moments risk feeling like the same archetype twice.
- Give the scroll-cue specific, identity-flavored copy tied to what's below ('Scroll for the receipts' / 'Scroll to see 19 stores') rather than a generic arrow, following kentcdodds' 'Learn more about Kent' and leoparpeix's contextual 'Scroll down'.
- Add a lightweight, non-gating 'Speaking as: Recruiter / Brand owner' toggle in the hero that reorders emphasis on the rest of the page (which stat or CTA leads) — takes the spirit of Pacôme's entry-choice gate without any friction or 3D.
- Put a strong, specific CTA directly in the hero itself (not only at the bottom Contact section) — none of the researched sites bury their primary action; echoes the owner's ask for stronger CTAs.
- Consider a subtle ambient background loop behind or beside the typographic hero (slow CSS-only pan/gradient-mesh drift, no WebGL) referencing leoparpeix's 'living photograph' feel, scaled down to stay Lighthouse-100-safe.
- Make the hero's opening line a direct, informal question or statement rather than a flat label (adamwathan's 'Who the hell am I?' energy, toned to Max's voice) — sharper hook than a generic headline.
## avoid
- Circular-avatar + 'Hey, I'm X, a [vague adjective] designer/developer' boilerplate opener (Framer marketplace template cliché).
- Colorful gradient-blob thumbnails standing in for real work or case studies.
- Wrapping the hero identity in a literal bordered/rounded 'card' component (Contra template) — the owner is already fighting card overload elsewhere on the page; the hero must not reintroduce it.
- Interchangeable color 'mood' themes as a substitute for one considered design decision (Contra's Dawn/Morning/Midday/Dusk/Midnight swatch gimmick).
- A hero that is pixel-identical on mobile and desktop with zero content adaptation (adamwathan.me) — plain reflow only is the opposite of the owner's explicit ask for sections that completely change on mobile.
- Any WebGL/3D/shader-driven hero (pacomepertant, leoparpeix's rendered scene, gionatannese's likely GSAP rig) as a literal build target — inspirational for text POSITIONING and STATUS-LINE ideas only; none of the rendering technique is compatible with the no-Three/no-GSAP, Lighthouse-100-on-desktop constraint.
- A sound-gate or any interstitial 'enter site' screen before the real hero renders — adds friction that a recruiter or brand owner with seconds to spare will not tolerate.
- Generic, vague hero copy ('An aspiring web designer with a passion for creativity and innovation') — every hero line should carry a specific, real detail (a number, a store name, a current project), per the owner's copywriting ask.
- An input-field-in-hero as a fake personalization gimmick (Framer template's email box) with no real function.

# LENS 5: results-charts (agent a26c7deb3b7a32ca0)

## Baymard Institute — UX Benchmark — https://baymard.com/ux-benchmark 
- **desktop**:
  - Hero: H1 + description left, gray callout box right ("Case studies: click the colored dots...") — split 50/50
  - Main body is a nested, collapsible TREE TABLE: category rows (Overall UX Performance, Desktop Web, Homepage/Nav, On-Site Search, Cart & Checkout...) each expandable via chevron
  - Every row shares ONE horizontal axis (POOR / MEDIOCRE / DECENT / GOOD / PERFECT) and plots a colored dot-strip/swarm chart of 183 sites' scores along it — same axis reused for every nested row, red=poor to yellow-green=perfect
  - Below the chart: 4-column plain-text link index (Industry / Thematic / Region / by-type) — no cards, just grouped text links
- **mobile**:
  - Identical collapsible tree table, just narrower — categories stack the same, dot-swarms compress into a smaller lane
  - No real re-architecture: it is the desktop chart literally squeezed into 390px, dots get harder to individually parse
  - Hero split becomes stacked (headline, then callout box)
- **motion**:
  - No animation observed in static captures; chevrons imply click-driven expand/collapse but not confirmed to animate
- **steal**: Reuse ONE shared horizontal scale across a whole index instead of separate charts per item: for maxfolio's 19-store Shopify index, plot every store as a small colored dot along one shared axis (e.g. a 0–100 CRO-impact or before/after scale), nested under expandable categories (Conversion / Performance / Retention) — turns the plain index list into a single data-driven visualization instead of 19 repeated chart kits.
- screenshots: results-charts-baymard-desktop-top.png | results-charts-baymard-desktop-y1400.png | results-charts-baymard-mobile-y700.png | results-charts-baymard-mobile-y1600.png

## Plausible Analytics — https://plausible.io 
- **desktop**:
  - Hero: centered headline (mixed color emphasis on "Google Analytics") + 2 CTAs, then one big embedded dashboard screenshot below (browser-chrome framed)
  - That dashboard screenshot itself is a chart pattern worth noting: a KPI row (Unique visitors 952k / Total visits 1.6M / Total pageviews 6M / Views per visit 3.78 / Bounce rate 42% / Visit duration 7m 26s, each with a tiny green/red % delta) sitting directly ABOVE a single wavy area/line chart
  - Icon+text checkmark feature grid (2 rows x 4, no card borders)
  - Stat band: 3 giant purple numerals (20k paying subscribers / 313B pageviews tracked / 99.99% uptime), no cards
  - Testimonial avatar grid 2x3, long-form narrative prose sections with subheads, 4-tier pricing table, mega-footer
- **mobile**:
  - Dashboard screenshot goes full width, KPI row presumably wraps (can't fully confirm at screenshot resolution)
  - Feature grid drops to single column
  - Testimonial 2x3 avatar grid becomes a single stacked column
  - 4-tier pricing table becomes stacked full-width cards
- **motion**:
  - None observed — dashboard is a static screenshot, not a live/animated chart
- **steal**: The KPI-row-directly-above-the-chart pattern (numeral + tiny delta chip, six of them in a row, sitting on the SAME card as the line chart) — use this to redesign maxfolio's case-study charts: put 2-3 delta chips inline right above each chart instead of the current separate stat treatment.
- screenshots: results-charts-plausible-desktop-full.png | results-charts-plausible-mobile-full.png

## Fathom Analytics — https://usefathom.com 
- **desktop**:
  - Hero split: headline+CTA left, a SMALL comparison snippet right (Fathom Analytics numeric row vs a competitor icon row) — comparison table embedded IN the hero, not a separate section
  - Icon+text 3-col grid (no cards)
  - Large embedded dark dashboard screenshot: KPI row + soft-gradient area chart + a data table underneath (countries/pages)
  - Editorial pull-quote band on light gray, 6-card testimonial grid, numbered 3-step "getting started" list with small screenshot mockups, 2-col feature list, logo marquee, another 3-col testimonial row, CTA band
- **mobile**:
  - Hero's inline comparison snippet collapses to a small stacked 2-row card under the headline
  - 3-col testimonial grids become single-column stacks
  - Feature+mockup two-column rows become stacked (image on top, text below)
- **motion**:
  - None observed — all dashboard imagery is static
- **steal**: Put a tiny inline comparison table directly IN the hero (not a separate section) — for maxfolio's Contact/hero, a 2-row "this build vs typical dev portfolio" micro-table (Lighthouse 100 vs ~70-80, sample-labeled) sitting right next to the primary CTA reinforces credibility at the point of action.
- screenshots: results-charts-fathom-desktop-full.png | results-charts-fathom-mobile-full.png

## Lifetimely — https://lifetimely.io 
- **desktop**:
  - Dark hero: headline + 3 floating, tilted dashboard-card mockups stacked behind/beside the headline (KPI tiles + a peeking line chart)
  - "Meet the Profit Agent" AI-chat mockup panel (dark chat bubbles)
  - THREE big feature blocks, each with a genuinely DIFFERENT chart type matched to a different metric: (1) grouped bar-pair chart ($166,538/$12,798/$36,000/$84,899 cost-change comparison), (2) an ANNOTATED multi-line chart with a callout bubble ("Oct 22, 11:59am — Anomaly Detected, +25% jump in daily spend") plus small per-platform ROAS cards (Google/Meta/TikTok logos, ROAS 8.4, +27.5% delta chip), (3) a cohort/LTV dashboard screenshot for customer retention
  - Plain text feature index (label+link rows, no cards), light-lavender accordion FAQ, closing CTA
- **mobile**:
  - Hero's 3 floating tilted cards collapse into one flat screenshot
  - The three feature blocks stay full-bleed and stacked, each KEEPING its own distinct chart type (bar-pair, annotated line, cohort table) rather than repeating one chart — this is the one site in the set that visibly avoids the "same metric everywhere" trap on both breakpoints
  - Accordion FAQ unchanged (already mobile-shaped)
- **motion**:
  - None confirmed from static screenshots; dark UI suggests possible hover states, unverified
- **steal**: Match ONE distinct chart grammar to each headline metric instead of a repeated kit: grouped bar-pair for cost/margin, annotated line + callout bubble for a traffic/spend event, small-multiple logo+number+delta cards for channel-level performance. Port this triad directly into maxfolio's Shopify case-study sheets, choosing the chart type per store's actual story instead of the same 4-chart kit for all 19.
- screenshots: results-charts-lifetimely-desktop-full.png | results-charts-lifetimely-mobile-full.png

## Amplitude — https://amplitude.com 
- **desktop**:
  - Hero: 2-col (headline/CTA left, tabbed product screenshot right: Agent Analytics/Global Chat/AI-powered Replays/AI Data Governance)
  - "One interface" split panel: chat-UI mock left, an inline mini insight-card mock right ("Why are users dropping before setup? 67% of signups never complete setup...")
  - 3x3-ish MCP integration icon grid
  - ONE index-line chart (task success rate climbing across quarters, dot markers per quarter, shaded area under the line) immediately followed by 4 PLAIN inline stat numerals (41.7% / 1.34M / 29.2k / 1.21M) — no card borders, no chrome, just numeral+label
  - 4-col icon feature grid, 3-col video-thumbnail customer-story cards, mixed-size resource cards, closing CTA stat band
- **mobile**:
  - Hero tab-switcher screenshot becomes one full-width frame
  - The 2-panel "one interface" split stacks vertically
  - The line-chart + stat-numeral row stays inline/row-like but compressed rather than restructured
  - Icon grids all drop to single/double column
- **motion**:
  - None confirmed from static captures
- **steal**: Pair a single index-100-style annotated line chart directly with plain, chrome-less inline stat numerals right beneath it — apply to maxfolio's existing stat band: add one small sparkline/trend line above or beside the 6 count-up numerals so the numbers read as a trend, not isolated digits.
- screenshots: results-charts-amplitude-desktop-full.png | results-charts-amplitude-mobile-full.png

## Northbeam — https://northbeam.io 
- **desktop**:
  - Dark cosmic hero: headline + an abstract network visual used AS the hero image — two overlapping translucent glowing rings labeled "Incrementality" / "MMM" connected by light trails
  - Logo marquee, then a BIG stat trio ($130 billion / $25 billion / 2.1 trillion) as giant plain numerals on the dark background, no cards
  - 3 white feature cards (Multi-touch attribution / Media mix modeling / Apex)
  - Alternating image-left/right editorial rows: a multi-line spend/ROAS chart mock, a node-and-arrow attribution flowchart, a colored budget-allocation bar comparison, two overlapping circular platform-integration icons
  - Ad-platform logo grid, then a RESULTS band of 3 DELTA CHIPS in plain white cards, each tagged with a customer logo: "31% Increase in ROAS", "11% Increase in CVR", "16% Decrease in CAC"
  - 3-col testimonials, newsletter signup with a phone-mockup chart preview, closing network-orb footer graphic
- **mobile**:
  - Could not capture — page timed out loading on mobile in this pass; only the desktop layout is verified
- **motion**:
  - Not verified from static captures; the glowing overlapping rings and light-trails strongly suggest an animated hero, but this is inferred, not confirmed
- **steal**: The "delta chip = big % + direction word + tiny client logo" results row (31%/11%/16%) is the cleanest before/after proof pattern in the set — reuse verbatim as a proof-row at the TOP of each maxfolio case-study sheet (sample-labeled), giving the headline metric before the detailed charts.
- screenshots: results-charts-northbeam-desktop-full.png

## HydraDB — https://hydradb.com · Awwwards Honorable Mention, Aug 8 2026
- **desktop**:
  - Black/orange dev-tool hero: headline + "Data connectors now live" ticker line + a faint particle/ASCII-dot "tree" graphic used as background illustration
  - Funding stat band: "$4.5M Raised" badge + 4 numeral tiles (98.73% / 300% / >30% / 115K) each on ITS OWN solid color block (orange/black/red) instead of uniform styling
  - Numbered feature list (01 Agent Memory...05 Context Engineering) beside a code/checklist mockup panel
  - "Without Graphs vs With HydraDB" 2-column comparison cards (red-tinted "without" vs orange "with")
  - Small multi-line chart: "Recall Degradation As A Bottleneck" comparing HydraDB vs baseline on a sparse dark chart
  - A VERTICAL STAT RAIL: alternating badge+numeral pairs (1 Billion / 1 Million / 92% / 2k devs) running down a dotted center line — a vertical timeline purely for scale stats
  - "State Of The Art On Various Benchmarks": a 4-column COMPARISON TABLE (HydraDB / Neo4j OSS / ZEP / Full Context) x 7 metric rows, HydraDB's column highlighted solid orange so it visually wins every row
  - 3-tier pricing cards, accordion FAQ
- **mobile**:
  - "Without/With" comparison becomes 2 stacked full-width cards
  - The vertical dotted stat-rail keeps its exact vertical layout (it was already mobile-shaped)
  - The 4-column benchmark table is NOT restructured — it just shrinks in place; numbers become nearly unreadable at 390px (a real anti-pattern to avoid)
- **motion**:
  - Not confirmed animated from static captures; the particle graphic could be canvas-driven but this is inferred only
- **steal**: The vertical stat rail (alternating numeral+badge pairs down a dotted center line, each numeral in its own color block) is a genuinely different way to present a sequence of scale stats — adapt it for maxfolio's Year-by-year or stat-band section as an alternative to the flat hairline row, letting 2-3 specific years carry a colored outcome-stat block instead of uniform text.
- screenshots: results-charts-hydradb-desktop-full.png | results-charts-hydradb-mobile-full.png

## State of AI Design 2026 (Designer Fund x Foundation Capital) — https://stateofaidesign.com · Awwwards Site of the Day + Developer Award, Aug 26 2026
- **desktop**:
  - Full-bleed MEDIA-COLLAGE hero: grunge gradient blobs, rotated torn-photo cutouts, a big black "AI in Design 2026" wordmark badge overlapping the imagery
  - Byline line, then giant magazine-style display type headline
  - Long-form justified intro paragraph (pure prose, no cards), a full-width documentary photo
  - PULL-QUOTE band: split black/sage-green panel, giant quote mark + large-type quote + headshot + name/title ("Katie Dill, Head of Design, Stripe")
  - CHAPTER INDEX: alternating FULL-BLEED SOLID-COLOR bands (orange, then lavender), each pairing a duotone-treated photo with a plain bullet list ("In this chapter, we'll cover: ...") and a black pill "Read the [X] Chapter →" button
- **mobile**:
  - Same color-block chapter bands stack full-width, photo-on-top / bullet-list-below (layout was already close to single-column on desktop)
  - The black/sage pull-quote panel stacks black-on-top, sage-below
- **motion**:
  - Not verified from static scroll captures; large-type editorial sites of this kind often use scroll-fade/parallax, but this is inferred, not observed
- **steal**: The alternating full-bleed SOLID-COLOR "chapter" bands (no card, just color-block + duotone photo + bullet list + one CTA pill) — use this to break up bulky content (Skills or Projects) into 2-3 visually distinct colored chapters instead of another card grid or uniform prose block.
- screenshots: results-charts-stateofaidesign-desktop-top.png | results-charts-stateofaidesign-desktop-y3200.png | results-charts-stateofaidesign-desktop-y4600.png | results-charts-stateofaidesign-mobile-top.png

## Level2 ("Redesigning Trust: Level2") — https://www.trylevel2.com · Awwwards-featured dataviz collection, 2026
- **desktop**:
  - Dark hero: headline + CTA + an embedded code-block-style strategy-builder screenshot
  - Broker/tech logo marquee, split editorial (text left, laptop-mockup chart image right)
  - 3-COLUMN feature strip, each card a DIFFERENT chart widget: (1) a RADIAL GAUGE dial (59.84% Win Rate, colored arc, small +/- deltas below), (2) a multi-line comparison chart with a timeframe dropdown, (3) a share/collaborate card with social icons
  - 9-question accordion FAQ (plain rows, chevron expand)
  - Dark split contact panel: form fields left, an abstract crumpled-paper "2" numeral graphic right
  - Closing dashboard graphic: ascending green BAR CHART overlaid with a dashed benchmark/threshold line, plus a secondary line chart with a shaded confidence band beneath it
- **mobile**:
  - 3-column feature strip (gauge/line/social) stacks to 3 full-width cards in the same order
  - FAQ accordion is unchanged (already mobile-native)
  - The closing bar+line dashboard graphic shrinks in place as one flat image — labels become tiny, not restructured (anti-pattern, same mistake as HydraDB's benchmark table)
- **motion**:
  - Not verified from static captures; radial gauge and line widgets look built for load-in animation given the product type, but unconfirmed here
- **steal**: Pair a RADIAL GAUGE (single %) with a multi-line comparison chart AND a bar+dashed-benchmark-line chart in one feature strip — three different chart grammars side by side. For maxfolio, key the chart grammar to the metric type per case study: conversion-rate → radial gauge, revenue-over-time → annotated line, before/after redesign → grouped bar with a dashed target line.
- screenshots: results-charts-trylevel2-desktop-full.png | results-charts-trylevel2-mobile-full.png

## ideas
- Give each of the 19 Shopify case-study sheets ONE matched chart grammar keyed to its real metric instead of the same 4-chart kit: radial gauge for a conversion-rate story, annotated index-100 line with an event marker for a Framer-port-with-tracking store, grouped bar-pair for a before/after redesign, small-multiple logo+number+delta cards for a paid-media/quiz store, and a light comparison table for a migration store — sample-labeled throughout.
- Redesign the existing stat band using Amplitude's pairing: add one small annotated index-line/sparkline directly above or beside the 6 count-up numerals so they read as a trend, not orphaned digits on hairlines.
- Add a Northbeam-style delta-chip proof row (big % + direction word + tiny store logo, e.g. '+18% conversion — sample') at the very TOP of each case-study sheet, before the detailed charts, so the headline result lands in one glance.
- Rebuild the Process section's 5 steps as a vertical stat rail (HydraDB pattern): alternating left/right callouts down a dotted center line, each step's numeral in its own colored block, replacing the current pinned-numeral card feel with a genuinely non-card layout.
- Turn the Shopify 'index list of 19 stores' into a Baymard-style shared-axis visualization: one horizontal 0-100 CRO-impact scale, each store plotted as a colored dot along it, nested under expandable categories (Conversion / Performance / Retention) instead of a plain text list plus separate charts.
- Give one real chart per case study an annotated-line-with-callout-bubble treatment (Lifetimely pattern): flag an actual named event (redesign launch date, feature ship date) with a labeled bubble on the line.
- Break the Skills section's six prose sentences into 2-3 alternating full-bleed SOLID-COLOR chapter bands (StateOfAiDesign pattern) — each block pairing a duotone placeholder photo/texture with a short bullet list of tools (keep tool names as inline chips), instead of treating all six sentences identically.
- For 'other ways to show the tech stack': build a 3-widget strip (Level2 pattern) — one radial dial for a single meta-stat (e.g. Lighthouse 100), one small restrained comparison table (this build vs a typical Shopify dev site), one colored timeline dot for years-of-experience-per-tool — instead of another chip list.
- For 'new ways to show experience across years': let 2-3 specific years on the existing Year-by-year hairline timeline carry a small colored outcome-stat tile (HydraDB-style numeral block) marking a concrete result from that year, rather than uniform text-only year entries.
- Add a Fathom-style micro comparison table directly in the Contact section beside the primary CTA: 'this portfolio vs a typical dev site' — Lighthouse 100 vs ~70-80, load time, etc., sample-labeled where needed, to reinforce the pitch at the point of conversion.
- Add one-line inline delta chips under each Gallery carousel composite ('+14% AOV — sample') instead of caption-only text, borrowing Plausible's KPI-chip-next-to-visual idea.
- Enforce a hard mobile-transform rule for every chart: nothing wider than ~3 series may simply shrink at 390px (the failure mode seen in HydraDB's benchmark table and Level2's closing dashboard) — it must become either a swipeable single-series carousel or a stacked one-metric-per-screen sequence.
- Introduce a comparison-table archetype into one case-study sheet (currently missing from maxfolio's archetype set): a restrained 2-column 'before Digitdeck / after Digitdeck' table, inspired by HydraDB's Without/With cards but in a subtler two-tone rather than aggressive neon contrast.
- Since almost every reference site's 'chart' is actually a static screenshot presented as live, make maxfolio's charts more honest AND more dynamic than the field: use framer-motion to actually draw one real (not screenshotted) chart per case study on scroll-into-view, with a visible 'Sample data' label per the existing convention.
- Avoid chaining more than 2 icon+text feature grids in a row anywhere in the redesign (Amplitude and Plausible both stack 3+) — audit the final page against this specific failure mode since it's the single most 'AI slop'-coded pattern found across the set.
## avoid
- Reusing the identical 4-chart kit (indexed line, slope, gauge, before/after bars) for every one of the 19 stores — every reference site here instead matches ONE chart grammar to ONE real metric.
- Letting a dense multi-column comparison table or multi-series chart simply shrink at 390px — Baymard's benchmark dot-table, HydraDB's 4-column benchmark table, and Level2's closing dashboard all do this and become unreadable; always restructure for mobile instead.
- Chaining 3+ icon+text feature grids back to back — Amplitude and Plausible both do this and it reads as generic SaaS filler, exactly the 'AI slop' Max wants zero of.
- Presenting a static dashboard SCREENSHOT as if it were a live chart (Fathom, Level2, Lifetimely, Amplitude all do this) — maxfolio's honesty and motion goals both argue for at least one real, small, animated chart instead of a screenshot-of-a-chart.
- Copying State of AI Design's very heavy, large, uncompressed-looking editorial photography treatment directly — full-bleed duotone imagery at that scale risks LCP under the Lighthouse-100 constraint unless built as carefully optimized assets.
- Adding a WebGL/particle hero like HydraDB's dot-particle tree or Northbeam's glowing rings — violates the no-WebGL/Three hard constraint; if chasing a similar mood, use CSS/SVG only.
- Using aggressive neon color contrast to declare a 'winner' in a comparison table (HydraDB's solid-orange winning column) — keep any before/after or comparison table restrained per the existing design-quality gate.
- Shipping a generic headline+photo+email-capture hero with nothing else distinctive (the fragment recovered from Triple Whale before its Cloudflare block showed exactly this) — too generic for a portfolio meant to stand out.

# LENS 6: contact-cta (agent a247fdcda87365596)

## Josh W. Comeau (joshwcomeau.com) — https://www.joshwcomeau.com 
- **desktop**:
  - Two-column blog homepage: article list left, 'Popular content' rail right (arrow-bulleted links, no cards)
  - Footer is a full-bleed illustrated wave scene (light-blue sky-to-water gradient) with a 3D clay mascot character sitting at the top edge of the wave, marking the page's true end
  - Inside the wave: a single-field newsletter capture ('svetlana@kim.dev' placeholder + arrow-button, no label clutter) sits above a plain 3-column footer sitemap (Browse by category / Interactive courses / General)
  - 'Contact' is not a dedicated section — it's one text link buried in the footer's 'General' column
- **mobile**:
  - Two-column article/rail layout collapses to a single stacked column, rail content moves below the fold
  - Wave-footer illustration recomposes: mascot and wave crest scale down but stay full-bleed; footer sitemap drops to 2 columns instead of 3
  - Newsletter input keeps full width; icon row (search/sound/theme/RSS/social) wraps to one horizontal strip above the copyright line
- **motion**:
  - Not interaction-tested this pass; the character/wave illustration reads as a static SVG scene, not an animation, in both captures
- **steal**: Not the contact form (there isn't a real one) — the move is ending the page with one illustrated, personality-driven full-bleed moment instead of a generic dark footer band, and reducing the final ask to a single input field with zero surrounding label noise.
- screenshots: contact-cta-joshcomeau-desktop-bottom.png | contact-cta-joshcomeau-mobile-bottom.png | contact-cta-joshcomeau-desktop-top.png

## Paul Stamatiou (paulstamatiou.com) — https://paulstamatiou.com 
- **desktop**:
  - Fixed vertical icon rail pinned to the far left edge (home / profile / gear / camera / theme) acting as the entire primary nav — no header bar at all
  - Content is a stack of independent rounded-corner panels on a warm paper background (bio panel, 'Recent gear' panel, 'Photosets' carousel panel, blog-post-list panel) — each panel reads like a widget on a personal dashboard rather than a page section
  - Bio panel is prose with inline bold text and one inline link ('Read more'), plus a bulleted fact list (Georgia Tech, Y Combinator, Twitter) collapsed behind a 'More' toggle
  - Page ends on an understated one-line credit ('Handcrafted by Stammy for 21.00 years') — no footer sitemap, no contact CTA at all
- **mobile**:
  - Vertical icon rail stays fixed at the same position/size (does not collapse to a hamburger) — it's small enough to survive at 390px
  - Panels stack full-width, corner radius and padding preserved; the photoset row becomes a horizontally-cropped strip (partial third tile peeking off-screen) instead of an explicit carousel
- **motion**:
  - Not interaction-tested; layout suggests no scroll-triggered motion — panels are static
- **steal**: The fixed icon-only nav rail as an alternative to a hamburger/pill nav, and framing supporting content (gear, photos, posts) as separate bordered 'panels' rather than a card grid — reads as organized without reading as e-commerce-style cards.
- screenshots: contact-cta-stamatiou-desktop-top.png | contact-cta-stamatiou-desktop-bottom.png | contact-cta-stamatiou-mobile-bottom.png

## Significa (significa.co) — https://significa.co 
- **desktop**:
  - Header carries a two-tier CTA: solid black pill 'Get a quote' next to a smaller circular ghost icon-button ('...' overflow menu) — primary action visually heavier than the secondary
  - Homepage stacks: giant serif/sans mixed headline ('Think. Design. Develop. Launch. Scale.') -> 4-item text link list (case-study teasers, no thumbnails required) -> full-bleed 4-panel color band of award badges (iF, Red Dot, German Design, European Design) each holding a cropped phone mockup
  - Near the footer: client-logo row ('Proud to have worked with' + 6 wordmarks) directly above a 2-column FAQ accordion ('Why should I work with Significa?', 'What if I don't like the final results?') — objection-handling placed as the very last thing before the footer
  - Directly under the FAQ: 'Ask ChatGPT and Claude about Significa' with two branded round icon-buttons that deep-link into a pre-loaded AI chat — a trust device, not a chatbot widget
  - Footer itself is a plain 3-column text sitemap plus B-Corp/1%-for-the-planet/Clutch badges — no form, no email address show
- **mobile**:
  - Two-tier header CTA collapses to the solid 'Get a quote' pill only; the ghost icon becomes a plain hamburger
  - FAQ accordion drops from 2 columns to 1, same disclosure triangles
  - The two 'Ask ChatGPT/Claude' icon buttons stay side-by-side (don't stack) since they're small enough to survive at 390px
  - Footer sitemap collapses from 3 columns to 1 long stacked list; badges move below it instead of beside it
- **motion**:
  - Not interaction-tested; accordion chevrons imply an expand/collapse transition but state change wasn't captured
- **steal**: Put an objection-handling FAQ accordion immediately before Contact/footer (not buried elsewhere on the page) — it does double duty as the FAQ archetype the design gate wants AND as trust-building copy right before the ask, and pair it with a verifiable 'ask an AI about me' link as the 2026-native trust signal instead of a testimonial carousel.
- screenshots: contact-cta-significa-desktop-top.png | contact-cta-significa-desktop-precta.png | contact-cta-significa-mobile-precta.png | contact-cta-significa-desktop-bottom.png | contact-cta-significa-mobile-bottom.png

## Humbleteam (humbleteam.com) — https://humbleteam.com 
- **desktop**:
  - Dedicated Contact section is a true split 50/50: left = giant 'Let's talk' headline + 3 circular team headshots + an 'Ask AI' panel (ChatGPT/Claude/Perplexity buttons that open a pre-loaded chat about the agency) + social icons + office addresses; right = a real embedded form on a white card floating over the dark red hero image
  - Form fields are conversational, not generic: 'How did you find us?' (dropdown pre-populated with a specific referral like 'Clutch (TOP 20 Best UX agencies)'), 'Your email', 'Tell us a bit about your project' (textarea)
  - Directly under the submit button: a concrete response-time promise — 'We'll reply within 24 hours with case studies, a timeline, and an estimate' — followed by a secondary lower-friction path, 'Prefer email? Write to hi@humbleteam.com'
  - Submit button is solid orange 'GET IN TOUCH', matching the header's own CTA button so the ask feels continuous with the rest of the site
- **mobile**:
  - Split 50/50 becomes fully stacked and re-ordered: white form card first (full-width), THEN the red 'Ask AI' panel, THEN the address block, THEN footer nav — the giant 'Let's talk' headline and team headshots scroll out of view above, so the form is what mobile visitors see first when they reach Contact
  - Nav 'GET IN TOUCH' button in the header stays visible at all breakpoints as a hamburger-adjacent pill
- **motion**:
  - Not interaction-tested; static capture shows no visible transition, but the red curtain/fabric hero background photo itself suggests the brand generally favors bold color over motion for trust
- **steal**: The two-tier response promise + fallback line ('reply within 24h with case studies, timeline, estimate' / 'prefer email? write to...') turns a vague 'you'll hear back soon' into a concrete deliverable, and the pre-filled 'how did you find us' dropdown is a cheap trust/social-proof trick worth adapting (e.g., prefill with a real referral channel).
- screenshots: contact-cta-humbleteam-desktop-top.png | contact-cta-humbleteam-desktop-bottom.png | contact-cta-humbleteam-mobile-bottom.png

## Jonas Downey (jonas.do) — https://jonas.do 
- **desktop**:
  - Hero is exactly the 'narrative with inline chips' archetype done well: full prose sentences ('I'm a software designer, developer, and writer. Currently I'm a design director at [Superhuman icon] Superhuman...') with a small circular headshot inline mid-sentence, and small brand icons (Figma, Twitter bird, Hello Weather sun) inline before each bolded company/product name — reads as a sentence, not a chip row or a card
  - Below the fold, a bright yellow 'PAGE NOT FOUND ->' easter-egg banner sits on a white ground, then a hard diagonal-skew cut (clip-path) drops into a full-bleed black band
  - Inside the black band: 'Keep in touch:' heading over 5 stacked bordered rows, each with a small-caps label and the actual value in italic script-like type — EMAIL/hello@jonas.do, SKEET/Bluesky, TOOT/Mastodon, CONNECT/LinkedIn, SUBSCRIBE/Newsletter — playful labels replace generic platform names
  - A small smiley-chat icon closes the band; no visible footer sitemap
- **mobile**:
  - Prose hero keeps its inline-icon sentence structure at 390px — text just reflows, icons stay inline (doesn't fall back to a plain paragraph or a chip list)
  - The diagonal skew transition and the 5 bordered contact rows persist unchanged in structure, just narrower — this section does NOT redesign for mobile, it just reflows, which is itself notable (a section can stay a single archetype across breakpoints if the archetype is already text-based and lightweight)
- **motion**:
  - Not interaction-tested this pass
- **steal**: The literal 'narrative-with-inline-chips' hero (prose sentence + inline company icon + inline headshot) is the direct answer to Max's stack/skills section — his current site abandoned this pattern for a 3-column card grid, and this is proof the inline-sentence version reads as more premium, not less clear. Also steal the personality-relabeled contact rows (SKEET/TOOT instead of 'Bluesky/Mastodon icons') and the diagonal-skew section break as a free, Lighthouse-safe way to separate two flat-color bands.
- screenshots: contact-cta-jonasdo-desktop-top.png | contact-cta-jonasdo-desktop-bottom.png | contact-cta-jonasdo-mobile-bottom.png

## REF Digital (ref.digital) — https://ref.digital · Awwwards Site of the Day, June 2 2026
- **desktop**:
  - Hero: enormous cropped 'REF' wordmark top-left, a 2-sentence mission statement top-right, and a single big line 'Move fast, build to last.' below it — no image, no button, pure typography
  - Header pairs 'CONTACT' (bordered button) with a small circular accessibility-toggle icon button beside it — dual-button header, not a single CTA
  - Footer's decorative element is an ambient node-and-thread diagram (like a mind-map/graph visualization) with two labeled nodes ('DESIGN', 'TECHNOLOGY') radiating faint connecting lines from a center point — replaces the usual footer background texture with something that reads as 'systems thinking' branding
  - Footer link list uses a terminal/checklist bracket prefix on every item ('[ ] WORK', '[ ] CONTACT', '[ ] INSTAGRAM') instead of plain text links
  - Address/phone/email block uses single-letter row labels (A / P / E) for a compact, non-labeled-paragraph contact block
- **mobile**:
  - The node-diagram graphic gets visually clipped/cut off at the viewport edges (lines run off-screen) rather than being re-centered or simplified for the narrow screen — reads as an unfixed responsive bug, not a deliberate mobile treatment
  - Footer link labels visibly truncate at 390px ('INSTAG', 'LINKED', 'BLUESK', 'AWWWAR', 'MONTRE...') — a genuine overflow/clipping problem, not intentional design
  - Bracket-prefixed link list otherwise stacks in the same single column as desktop's second column
- **motion**:
  - Not interaction-tested; the thin connecting lines in the node diagram look like they're meant to animate/pulse given the agency's motion-forward positioning, but this wasn't verified
- **steal**: The bracket-checklist link style ('[ ] CONTACT') as a distinctive footer nav typographic treatment, and the compact single-letter A/P/E contact block as a denser alternative to Max's current 3-column Email/Phone/Location row.
- screenshots: contact-cta-refdigital-desktop-top.png | contact-cta-refdigital-desktop-bottom.png | contact-cta-refdigital-mobile-bottom.png

## Podium (podium.global) — https://podium.global · Awwwards Site of the Day, June 28 2026
- **desktop**:
  - Hero: an amorphous animated blob/mask shape filled with cross-fading photo/video tiles, headline copy pinned bottom-left ('WE OFFER CREATIVE DIRECTION & PRODUCTION FOR ATHLETICISM.') and a 'SCROLL DOWN' hint bottom-right — all black-on-white, no nav CTA button, just WORK/ABOUT/CONTACT text links
  - Closing/contact band flips to pure black: a rendered 3D stone/rock sits center stage, flanked left/right by tiny italic reframe copy — 'NOT THE FINISH LINE.' / 'IT'S STEP ONE.' — with the actual CTA being oversized typography with no button chrome at all: 'LET'S BUILD YOUR VISION' (static) over 'WORK WITH US' (underlined, i.e., the underline IS the button)
  - Footer under that CTA is reduced to a single dotted hairline with just '©PODIUM 2026' left and 'WEBSITE BY [credit]' right — zero link directory
- **mobile**:
  - Text nav (WORK/ABOUT/CONTACT) collapses to a 'MENU' word plus a small checkered-flag icon button (a sport-themed hamburger substitute, not a generic 3-line icon)
  - The blob-hero and stone-CTA visuals both scale down but keep their exact desktop composition — no re-flow to a different layout, just a smaller canvas
- **motion**:
  - The homepage blob is very likely WebGL/canvas-driven (photo tiles appear masked into an organic moving shape) — visually confirmed as a shaped media collage, but actual animation/interaction wasn't exercised in this static capture; flagged as inferred, and this technique is out of scope anyway given the no-WebGL constraint
- **steal**: Not the 3D object — the copy pattern: replace a generic 'Get in touch' button with one bold typographic double-line (bold static line + underlined action line acting as the literal link) flanked by two short reframing microcopy lines that defuse the 'this is scary/final' feeling of reaching out ('not the finish line, it's step one'). And the almost-empty single-hairline footer is the clearest anti-Baymard proof that a consultant site needs zero link directory at the bottom.
- screenshots: contact-cta-podium-desktop-top.png | contact-cta-podium-desktop-bottom.png | contact-cta-podium-mobile-bottom.png

## Pacôme Pertant Portfolio (pacomepertant.com) — https://pacomepertant.com · Awwwards Site of the Day, June 9 2026 (Portfolio Honors + Developer Award, May 2026)
- **desktop**:
  - Gated by a full-screen splash before any content loads: black background, a small glossy 3D sphere with a smiley face, centered copy 'motion & sound designer / based in paris' — no visible entry button captured on desktop in our pass (page never advanced past the gate in the automated crawl)
  - LIMITATION: this is a real WebGL/Three.js + GSAP experience per external write-ups (3D effects, sound-reactive scroll); our headless capture could not get past the intro gate to see the actual case-study or contact layout, so desktop/mobile section-by-section content below the splash is NOT verified firsthand
- **mobile**:
  - The same splash screen adds an explicit two-path choice not shown on desktop: a pill button 'enter with sound •' and a plain text link 'enter without sound' beneath it — an accessibility/preference fork placed on the very first interaction, mobile-specific in our capture
- **motion**:
  - Inferred only (not directly observed): external sources describe GSAP + Three.js scroll-driven 3D and sound design throughout — explicitly the kind of stack maxfolio's Lighthouse-100/no-WebGL constraint rules out, so this site is a 'look, don't build like this' reference
- **steal**: Not a layout steal (blocked by our own constraints) — the useful idea is the sound on/off fork offered explicitly at entry on mobile, which is a small, honest pattern: never force audio, always give a silent path, and say so in words rather than a tiny speaker icon.
- screenshots: contact-cta-pacome-desktop-top.png | contact-cta-pacome-mobile-top.png

## Baymard Institute (baymard.com) — https://baymard.com 
- **desktop**:
  - Header two-tier CTA done B2B-SaaS style: 'Log In' (plain text) + 'Contact Sales' (ghost/outlined button) + 'Sign Up for Free' (solid blue button) — three tiers of commitment side by side, ordered lightest to heaviest
  - Hero pairs headline/subhead/single CTA ('GET STARTED FOR FREE') with an actual annotated product screenshot (browser chrome, a real-looking product page with red/yellow/green severity-rated UX guideline rows) rather than an abstract illustration
  - Directly below the fold: one proof sentence with an inline stat ('used by 29,000+ UX professionals and by 71% of all Fortune 500 ecommerce companies') sitting right above a horizontal row of real client wordmarks (Amazon, Nike, Shopify, Adidas, Lenovo, Sears) — stat and logos read as one unit, not two separate sections
  - Footer is a sprawling multi-column sitemap: 4 columns of 'Industry' links (30+ items), a 'Theme' column, a 'UX Training' column, then a second row of Company/Support/Resources columns plus a newsletter signup box — an enormous link directory
- **mobile**:
  - 3-tier header CTA collapses to a hamburger; the ghost/solid button distinction is lost entirely behind the menu
  - The giant footer sitemap collapses to a single long stacked column that keeps every one of the 40+ links (industries, themes, training, company, support, resources) — nothing is cut, just re-flowed, producing a very long scroll of plain text links before the copyright line
  - Newsletter box keeps full width and sits between the link columns and the final contact-info row (phone/phone/email) — same content order as desktop, just stacked
- **motion**:
  - Not interaction-tested
- **steal**: Pairing one concrete social-proof sentence with logos as a single visual unit (not a generic 'trusted by' logo strip with no numbers) — worth doing right above Max's own Contact CTA, referencing a real case-study number from his existing stat band.
- screenshots: contact-cta-baymard-desktop-top.png | contact-cta-baymard-desktop-bottom.png | contact-cta-baymard-mobile-bottom.png

## ideas
- Rebuild Contact as a true split 50/50 (Humbleteam pattern): left = giant headline + Max's real photo + social icons + an 'Ask AI about me' panel; right = a real inline form or Cal.com embed — not just a centered single-column block with one mailto button like today.
- Add a single-field 'Send me your store URL' input as the primary, lowest-friction conversion action, sitting above or instead of the current 'Send a message' mailto button — this is the exact single-field pattern the brief calls out and maxfolio has zero equivalent of today.
- Introduce a genuine two-tier CTA: solid 'Book a 20-min review' (Cal.com inline embed, not a popup) as primary + a lighter ghost/text 'or just email me' as fallback — replacing the single undifferentiated blue pill button.
- Rewrite the response-time line from vague ('You hear back within one business day') to concrete and deliverable-specific, Humbleteam-style: what exactly arrives in that reply (e.g., '2-3 concrete leaks I found, free, within 24 hours').
- Add a 3-step 'What happens next' numbered list directly in Contact (send URL -> get a short audit -> talk if it's a fit) — the brief explicitly asks for this pattern and it doesn't exist anywhere on the current page.
- Add a short objection-handling FAQ accordion immediately before Contact (Significa pattern): 'What if my store already converts fine?', 'Do I need Shopify Plus?', 'What if you don't find anything?' — this simultaneously satisfies the design gate's missing accordion/FAQ archetype and does real persuasion work.
- Replace the abandoned 'narrative-with-inline-chips' Skills section (currently a 3-column card grid, contradicting the brief) with Jonas Downey's actual pattern: full prose sentences with inline tool/company icons and one inline headshot — this is a direct, low-risk fix since the archetype is already named in the brief but not actually built.
- Give the Contact section its own proof line pulled from the existing case-study stat band, Baymard-style, e.g. 'Same audit that found a 34% checkout leak on [store]. First look is free.' — ties Contact back into the rest of the page instead of living in isolation.
- Use a CSS clip-path diagonal skew (Jonas Downey) as a free, GPU-cheap, Lighthouse-safe transition between two flat-color bands (e.g., between Explore/theme-switcher and Contact, or Contact and the footer) instead of another hard flat divider.
- Add an 'Ask AI about Max' trust device: 2-3 small icon buttons (ChatGPT/Claude/Perplexity) that deep-link to a pre-loaded prompt referencing his public case studies — genuinely novel, zero AI-slop risk since it's a functional verification link, not decorative AI imagery.
- On mobile specifically, collapse the two-tier CTA + FAQ into a single sticky bottom bar with ONE action ('Book 20-min review') that only appears once the Contact section scrolls into view — a real mobile-only transformation, distinct from the desktop split-panel.
- Retire or repurpose the floating scroll-progress 'Contact' pill/rail on both breakpoints once inside the Contact section itself — right now it duplicates the nav and eats vertical space right next to the CTA button.
- Replace generic 'Email / Phone / Location' hairline labels with slightly voiced labels (not gimmicky, just less boilerplate) — small copy-only change, no layout risk.
- Pair a single social-proof sentence with real logos as one visual unit near Contact (Baymard's stat+logos block) using Digitdeck's actual store roster, instead of a bare logo strip or nothing.
- Explicitly avoid any modal/popup booking overlay that auto-triggers on scroll-into-view; any Cal.com/Calendly embed must be inline in the page flow, matching the 'tasteful' requirement in the brief.
## avoid
- Baymard's sprawling multi-column mega-footer (40+ links across Industry/Theme/Training/Company/Support/Resources) — the opposite of what Max asked for; more lists is not the fix for 'too many cards.'
- REF Digital's footer failure mode: link labels visibly truncating on mobile ('INSTAG', 'BLUESK', 'MONTRE...') and a decorative node-diagram graphic clipped off-screen at 390px — never ship a responsive contact/footer element that literally cuts off text or art.
- Pacôme Pertant's WebGL/Three.js/GSAP-driven splash gate and scroll experience — visually striking but directly incompatible with the Lighthouse-100/no-WebGL/no-GSAP-3D constraint; don't chase this aesthetic even as inspiration for 'more dynamic animation.'
- Any popup/modal booking widget that auto-opens on scroll or page load — none of the tasteful examples here do this; keep booking embeds inline and user-triggered.
- Repeating the same trust device (e.g., an 'Ask AI about me' link) in header, footer, AND contact section the way Humbleteam does in two places — pick one placement to avoid the exact card/element repetition Max is already complaining about.
- A single undifferentiated CTA button with no fallback path — every strong reference here pairs the primary ask with an explicit lower-friction alternative (email/text link), which the current maxfolio Contact section lacks entirely.
- Generic 'Trusted by' logo strips with zero accompanying number/sentence — Baymard shows the stronger version is one proof sentence plus logos as a single unit.
## copy
{
 "en": {
  "headline": "Send me your store. I'll show you where it's leaking.",
  "cta_primary": "Book a 20-min review",
  "cta_secondary": "or just email me",
  "reassurance": "I read every store personally. You'll hear back within 24 hours with 2-3 concrete leaks, free.",
  "steps": [
   "Send your store URL",
   "I record a 5-minute audit",
   "We talk if it's a fit"
  ],
  "microcopy_examples": [
   "GET IN TOUCH -> We'll reply within 24 hours with case studies, a timeline, and an estimate. (Humbleteam)",
   "Prefer email? Write to hi@humbleteam.com (Humbleteam)",
   "GET STARTED FOR FREE -> used by 29,000+ UX professionals and 71% of Fortune 500 ecommerce companies (Baymard)",
   "Contact Sales / Sign Up for Free -- two-tier B2B CTA (Baymard)",
   "Get a quote -- paired with 'What if I don't like the final results?' FAQ right before it (Significa)",
   "Ask ChatGPT and Claude about Significa (Significa)",
   "EMAIL / SKEET / TOOT / CONNECT / SUBSCRIBE -- personality-labeled contact rows (Jonas Downey)",
   "Send a message -> Available for consulting. US and LATAM brands. You hear back within one business day. (current maxfolio)",
   "WORK WITH US (underlined, no button chrome) flanked by 'NOT THE FINISH LINE.' / 'IT'S STEP ONE.' (Podium)",
   "Have questions? Ask AI -> Opens a new chat with context about us pre-loaded, ask anything (Humbleteam)"
  ]
 },
 "es": {
  "headline": "Mándame tu tienda. Te muestro dónde se está fugando la plata.",
  "cta_primary": "Agenda una revisión de 20 min",
  "cta_secondary": "o simplemente escríbeme",
  "reassurance": "Reviso cada tienda personalmente. Tienes respuesta en 24 horas con 2-3 fugas concretas, gratis.",
  "steps": [
   "Envía la URL de tu tienda",
   "Grabo una auditoría de 5 minutos",
   "Hablamos si tiene sentido"
  ]
 },
 "ja": {
  "headline": "ストアのURLを送ってください。どこで機会を失っているかお見せします。",
  "cta_primary": "20分の無料レビューを予約",
  "cta_secondary": "またはメールで直接連絡",
  "reassurance": "すべてのストアを私自身が確認します。24時間以内に、具体的な改善点を2〜3件、無料でお伝えします。",
  "steps": [
   "ストアのURLを送る",
   "5分間の監査動画を録画",
   "合いそうであれば話しましょう"
  ]
 }
}
# LENS: scrollytelling-products-apple (agent a49254280ade49731)

## Apple — iPhone 17 Pro — https://www.apple.com/iphone-17-pro/ · evergreen reference
- **desktop**:
  - Hero opens on a giant product render (back-of-phone camera bump) with the model name ghosted in oversized type behind it, then crossfades into lifestyle photography as you scroll — classic pinned-hero-to-photo handoff.
  - A slim secondary nav bar ('iPhone 17 Pro' + Explore/Buy pills) becomes sticky under the main nav the moment the hero ends and stays pinned for the ENTIRE rest of the page, regardless of which feature section is showing.
  - Feature sections alternate: full-bleed dark video/photo bands with a one-line claim ('Any more pro and it would need an agent'), then a horizontal CAROUSEL of camera-sample photos with manual prev/next arrows nested inside a black band — a rail archetype embedded mid-narrative, not just at the top.
  - A 3-up device-mockup band ('All the must-haves. All on iPhone.') shows three iPhones side by side each running a different OS feature (Calendar event, Lock Screen, Satellite SOS) — one visual grammar (phone frame) reused to compare three unrelated features at a glance.
- **mobile**:
  - The sticky secondary nav bar survives untouched — same pinned strip, same Explore/Buy buttons, just narrower.
  - The 2-up camera-sample carousel becomes a single full-bleed slide (one photo fills the whole viewport) with swipe instead of click-arrows — carousel item count effectively drops from 'see 2 at once' to 'see 1, imply more via edge-crop'.
  - The 3-phone comparison band collapses to one phone at a time, stacked vertically, each with its own caption directly beneath it instead of a shared caption row.
- **motion**:
  - Camera-bump hero crossfades from render to lifestyle photo mid-scroll (observed: hero photo desaturates/dissolves into next photo across mid25→mid50 captures).
  - Carousel arrows are always-visible circular buttons (not hover-only) — implies manual, not autoplay, motion.
- **steal**: Copy Apple's persistent contextual mini-nav: a slim sticky bar that appears once you scroll past maxfolio's hero and stays pinned through Shopify work / Projects / Skills, always showing a one-line context label + the 'Get the free 20-minute review' button — so the CTA is never more than a click away no matter how deep the visitor has scrolled, instead of only living in the Contact section at the bottom.
- screenshots: scrollytelling-products-apple-iphone-desktop-mid25.png | scrollytelling-products-apple-iphone-desktop-mid50.png | scrollytelling-products-apple-iphone-mobile-mid25.png

## Apple — MacBook Pro — https://www.apple.com/macbook-pro/ · evergreen reference
- **desktop**:
  - Full-bleed lifestyle photography hero (people at a party) with no product visible at all for a full viewport — pure mood before any hardware appears.
  - A looping product demo VIDEO sits above an interactive TAB SWITCHER ('Center Stage' / 'Desk View') — clicking a tab swaps the caption below the video, effectively an inline product-mode toggle rather than a separate section per mode.
  - Near the footer, cards for 'Apple Upgrade' / 'Ways to Buy' fade in from near-zero opacity as they enter the viewport (caught mid-fade in a capture) — confirms Apple uses simple opacity/scroll-reveal, not just static content, even on a page built for Lighthouse-grade performance.
- **mobile**:
  - The tab switcher survives as a mobile-width segmented control directly under the video, video goes full-bleed edge-to-edge instead of being inset in a rounded frame.
  - The two-card 'Ways to Buy' band stacks to one column, same fade-in behavior.
- **motion**:
  - Opacity fade-in on scroll for the late-page upsell cards, caught at a partial-opacity frame.
  - Tab click swaps caption text under a persistently-playing video (no video reload) — a cheap, high-value interaction.
- **steal**: For maxfolio's case-study sheets, replace the static 'screenshots + charts' block with an inline tab switcher above ONE embedded demo (e.g. 'Before' / 'After' or 'Desktop' / 'Mobile' tabs that swap the caption and the visible screenshot beneath a single frame) instead of showing every state at once — cuts the 'too much in cards' problem directly.
- screenshots: scrollytelling-products-apple-macbook-desktop-mid75.png | scrollytelling-products-apple-macbook-desktop-mid50.png | scrollytelling-products-apple-macbook-mobile-mid50.png

## Warp.dev — https://www.warp.dev/ · current 2026 product site
- **desktop**:
  - Every section sits on a continuous DOT-GRID 'graph paper' background (like blueprint paper), giving the whole page one coherent engineering aesthetic instead of card borders/shadows.
  - Each visual is framed as a labeled 'figure' in monospace type on a hairline rule — '[ fig. 1 – the factory ]', '[ fig. 3 – open at every layer ]', '[ fig. 4 – quality loop – sample run ]' — with a tiny terminal-prompt icon and a grid-toggle icon at each end of the rule, like documentation captions.
  - Chart types are DIFFERENT every time and never repeated: fig.1 is a scattered pixel/heatmap grid of colored squares (activity map) with a live task counter; fig.3 is four full-width colored 'LAYER' bars stacked with deepening blue shade, each carrying pill tags (warp/claude code/cursor) and a plain-English line; fig.4 is a 3-up panel where each column pairs one small labeled STAT BADGE ('PASS 96%', 'BEST 1.00x', 'AUTO-FIX +3.7') with its own line chart AND a below-the-fold data table of raw rows (model, pass/fail, score, cost) underneath.
  - Full-bleed SOLID COLOR BLOCKS switch per chapter (white dot-grid hero → saturated blue 'quality loop' section → white 'open at every layer' section) — chapters are demarcated by background color change, not by card boundaries.
  - Tiny monospace 'code comment' eyebrows appear above every H2 ('# quality loop', '# no lock-in') reinforcing the engineering identity typographically.
- **mobile**:
  - The 3-column stat/chart panel collapses to a single full-width column, but each card KEEPS its own chart + data table intact (nothing gets summarized away) — just re-stacked top to bottom.
  - The sticky top nav bar's background color swaps to match whatever full-bleed color block is currently behind it (white nav on the white hero, solid blue nav once you're inside the blue chapter) — the chrome itself participates in the chapter-color system.
  - The 4-layer stacked diagram keeps its full width and color-depth progression even at 390px — it isn't simplified, just narrowed.
- **motion**:
  - Live-updating counters ('112 tasks · 8 agents active · 1,423 PRs shipped') visible in the hero grid — implied count-up/ticking behavior similar to maxfolio's own stat band.
  - Persistent audio-mute icon bottom-left across every scroll position, implying an ambient looping sound design tied to scroll position (not verified playing, but the control is sticky).
- **steal**: This is the direct fix for the owner's 'charts should include comparatives and other chart types, never the same metrics for every store' complaint: give every Shopify case-study a 'fig. N' monospace caption system on a shared dot-grid backdrop, and mandate that each store's 3 metrics use 3 DIFFERENT visual forms (one heatmap/activity-grid, one stat-badge+line-chart+data-table combo, one stacked-bar comparison) rather than the current identical indexed-line/slope/gauge trio repeated for all 19 stores.
- screenshots: scrollytelling-products-warp-desktop-top.png | scrollytelling-products-warp-desktop-mid25.png | scrollytelling-products-warp-desktop-mid50.png | scrollytelling-products-warp-mobile-top.png | scrollytelling-products-warp-mobile-mid25.png

## Shopify Editions — Winter '26 — https://www.shopify.com/editions/winter2026 · 2026 (One Page Love award, published Dec 2025 / live through 2026)
- **desktop**:
  - A single continuous Renaissance-oil-painting collage (flying classical figures in a landscape) runs as the full-bleed art direction across MANY chapters, mutating each time: a hot-pink skateboard and shopping bag are collaged into the classical figures' hands, a skater is later composited onto the same painted landscape holding a laptop-store screenshot.
  - A PERSISTENT LEFT-EDGE STICKY INDEX lists all 12 chapters by name with roman numerals (Sidekick I, Agentic II, Online III … Developer XII); as you scroll, the current chapter's label goes bold/solid white while all others dim to translucent gray — a live wayfinding rail baked into the page itself.
  - Each chapter opens with an oversized single-word title dropped directly onto the painting ('Marketing') paired with a cursive drop-cap-style opening word for the subhead ('Grow your sales with a first-of-its-kind product network') — a strong pull-quote/typographic moment used as a chapter cover, repeated 12 times with variation.
  - Chapter transitions use a jagged TORN-PAPER edge (a white ripped-cloud shape) instead of a straight color block boundary, then drop into real Shopify admin UI screenshots with a caption + 'Read help doc' link — grounding the fantastical art with literal product proof.
- **mobile**:
  - The persistent left roman-numeral index DISAPPEARS ENTIRELY on mobile — there is no wayfinding rail at all in the 390px captures, it's a straight linear stack of full-bleed art + screenshot sections with no visible chapter progress indicator.
  - The chapter title art keeps its full-bleed collage treatment (nothing simplified), just recropped taller/narrower so the painting fills the mobile viewport differently per chapter.
- **motion**:
  - The sticky index's bold/dim state change is direct visual evidence of scroll-position-driven text-color interpolation tied to which chapter's scrollTop range is active — implementable with a simple IntersectionObserver + CSS opacity, no GSAP needed.
  - Torn-edge SVG masks between sections imply a static asset, not a computed animation — cheap to replicate.
- **steal**: For 'Year by year', replace the current plain hairline timeline with a persistent left-edge index of years (like Shopify's roman-numeral rail) that bolds the active year as you scroll past its section — turns a passive timeline into a live 'you are here' wayfinding device, and gives Max's 15+ years a much stronger sense of scale than static hairlines.
- screenshots: scrollytelling-products-shopify-editions-desktop-top.png | scrollytelling-products-shopify-editions-desktop-mid25.png | scrollytelling-products-shopify-editions-desktop-mid50.png | scrollytelling-products-shopify-editions-mobile-top.png | scrollytelling-products-shopify-editions-mobile-mid25.png

## Elva (elvalabs.ai) — https://elvalabs.ai/ · 2026 (OnePageLove, published Sept 6 2026)
- **desktop**:
  - A single phone mockup is PINNED dead-center of the viewport (position sticks in place) while, behind and in front of it, giant white headline text and feature captions ('Real-time Guidance', 'Flow Arcs', 'Lighting Spot', 'Scene Sense') crossfade/scrub past it as you keep scrolling — confirmed by full-page and mid-scroll captures showing multiple caption layers overlapping at the same screen position (proof the phone genuinely stays fixed while text scrubs through it).
  - Each feature caption is paired with a small icon-button directly under it, and the phone's own screen content changes to match whichever caption is currently in focus.
  - Footer content (contact emails, social icons) is visible baked into the same fixed viewport almost immediately, implying a very short total scroll distance for a surprisingly dense narrative — the whole 'pinned product' sequence plays out in under 1500px of scroll.
- **mobile**:
  - The pinned-phone-with-scrubbing-captions mechanic is PRESERVED on mobile at 390px — same sticky phone, same crossfading captions — Elva does NOT simplify this pattern away, it just scales the phone and type down.
  - Caption copy gets denser/more overlapping-looking at mobile width in the captures (more text competing for the same narrow column), suggesting the pattern needs tighter copy at mobile widths than what Elva shipped.
- **motion**:
  - Direct evidence of position:sticky/fixed phone + scroll-scrubbed opacity crossfade on the caption stack — a textbook framer-motion useScroll + opacity transform pattern, zero WebGL required.
- **steal**: The 'one product mockup pinned center-screen while captions scrub through it' mechanic is the cleanest non-WebGL way to narrate a feature list without cards — apply it to maxfolio's Shopify-app-suite or Platform product intro: pin one dashboard screenshot and scrub 4-5 one-line capability captions past it instead of a feature grid.
- screenshots: scrollytelling-products-elva-desktop-full.png | scrollytelling-products-elva-desktop-mid75.png | scrollytelling-products-elva-mobile-mid50.png

## Cursor.com — https://cursor.com/ · current 2026 product site
- **desktop**:
  - Hero is a MEDIA-FIRST COLLAGE of the product itself: three overlapping app windows (task sidebar, chat/agent panel, code editor) layered and overhung against a muted landscape-painting background, deliberately cropped by the section edges rather than fit neatly inside a device frame.
  - Feature sections repeat a split 50/50 pattern (real app screenshot on one side, one-paragraph capability claim + 'Learn about X' link on the other), alternating which side the screenshot sits on.
  - A 6-tile testimonial CARD-GRID ('The new way to build software') quotes named execs (Jensen Huang/NVIDIA, Andrej Karpathy) with headshot, name, and title — plain text cards, no photos of screenshots, pure social-proof grid.
- **mobile**:
  - The hero's layered app-window collage doesn't get simplified to one screenshot — it keeps all three overlapping windows but lets them bleed off the RIGHT edge of the 390px viewport uncropped-to-fit, so part of the code editor panel is simply cut off by the frame instead of being resized to fit.
  - The 3-column testimonial grid collapses to a single column, one quote card at a time, full width.
- **motion**:
  - No obvious autoplay/animated motion caught in captures beyond standard hover states implied by cursor-icon branding — this site leans on static layered-collage density rather than movement.
- **steal**: Cursor's 'let the screenshot bleed off the mobile edge instead of shrinking it to fit' is a legitimate, deliberate mobile technique worth trying on maxfolio's Gallery carousel composites on mobile — a laptop+phone composite that's allowed to crop at the edge can read as more confident/full-bleed than one forced to shrink-to-fit inside safe margins.
- screenshots: scrollytelling-products-cursor-desktop-top.png | scrollytelling-products-cursor-desktop-mid50.png | scrollytelling-products-cursor-mobile-top.png

## Clay.com — https://www.clay.com/ · current 2026 product site
- **desktop**:
  - Hero replaces any screenshot with a whimsical CLAYMATION-STYLE 3D illustration: a 'playground' scene where each object (funnel, mailbox, pencil-and-easel, magnifying glass, curling megaphone-horn, stacked books) is a hand-modeled visual metaphor for one product capability, all sitting on the same green-hill set.
  - Below the hero, the entire rest of the page is a series of full-bleed, edge-padded ROUNDED COLOR PANELS, each one 50/50 split (copy+pill-badge on one side, a small claymation vignette photo on the other), and each panel has its OWN solid background tint (light blue for 'DATA', pink for 'GTM plays', cream for 'AGENTS') so the page reads as distinct colored chapters rather than a white page with cards.
  - Every panel carries a colored pill label (DATA / AGENTS / GTM INFRASTRUCTURE) plus a 3-dot gradient icon next to it, and a row of small partner/integration logo chips beneath the copy.
- **mobile**:
  - 50/50 split panels stack to full-width single column: illustration goes on top full-bleed within the panel, pill badge + headline + copy + logo row below it.
  - The rounded-panel-with-margin treatment survives at mobile width (panels don't go edge-to-edge full-bleed, they keep a visible page margin/rounded corner even on a 390px screen) — a deliberate 'floating card, not full-bleed' choice even on mobile.
- **motion**:
  - No looping animation caught in static captures; motion is implied by the CTA hover states ('Start free trial') and rounded-pill micro-interactions typical of this design language — treat as a comparison point for a NON-chart, NON-carousel way to make a stack of features feel alive.
- **steal**: For the 'other ways to display the tech stack' problem, replace inline text chips with small custom vignette illustrations per skill category (à la Clay's funnel/pencil/magnifying-glass) inside colored full-bleed panels — one distinct color per skill area (Shopify/Liquid = one tint, React/frontend = another, ops/security = another) instead of six prose paragraphs with inline chips.
- screenshots: scrollytelling-products-clay-desktop-top.png | scrollytelling-products-clay-desktop-mid25.png | scrollytelling-products-clay-mobile-top.png | scrollytelling-products-clay-mobile-mid25.png

## Notion Calendar — https://www.notion.com/product/calendar · current 2026 product site
- **desktop**:
  - Hero scatters small colorful icon-tiles asymmetrically around a centered logo/headline (laptop, basketball, cat glyph, coffee cup, bike, checklist, notepad) — a playful 'floating glyph field' rather than a single hero image.
  - Below the hero, a device mockup (laptop+phone) sits inside a light-gray rounded frame with a centered PLAY BUTTON overlay, signaling a looping product video rather than a static screenshot.
  - Feature content is a 2-COLUMN CARD GRID on gray card backgrounds (not full-bleed) — each card: small icon eyebrow, bold headline, one-sentence description, then a real UI screenshot/mock embedded at the bottom of the same card (scheduling calendar, timezone view, command palette, project-timeline drag-and-drop).
  - A pull-quote typographic break ('Work and life, playing nice.') interrupts the grid rhythm between two groups of cards — prevents the grid from running on for too long.
- **mobile**:
  - 2-column card grid collapses to single column; each card keeps its full internal structure (icon, headline, copy, screenshot) rather than stripping detail.
  - Hero's floating icon glyphs reduce in count and reposition tighter around the narrower headline column instead of spreading across full width.
- **motion**:
  - Play-button overlay on the hero device mockup implies a click-to-play looping demo video, a lighter-weight alternative to autoplay video for LCP/perf.
  - Keyboard-shortcut chips (⌘/Ctrl + K) rendered as literal UI inside a command-palette mock — a static-but-convincing way to imply interactivity without scripting it.
- **steal**: The pull-quote interruption breaking up a card grid (rather than 19 store cards running on for a full screen) is a cheap, high-value fix: insert one large typographic statement between every ~6 stores in the Shopify-work index list to reset pacing and satisfy G3's 'never more than two consecutive bands of the same archetype' rule.
- screenshots: scrollytelling-products-notioncal-desktop-top.png | scrollytelling-products-notioncal-desktop-mid25.png | scrollytelling-products-notioncal-desktop-mid50.png | scrollytelling-products-notioncal-mobile-top.png

## Supaste — https://supaste.com/ · 2026 (OnePageLove, published June 13 2026; Product Hunt + Honors badges shown on-page)
- **desktop**:
  - A single continuous sky-blue-to-white gradient photograph (rolling green hills) runs behind the hero AND bleeds down into the first feature section, visually stitching two sections together instead of a hard section break.
  - A vertical rotated 'W. Honors' award-badge tab is FIXED to the right edge of the viewport and stays visible across every scroll position captured (hero through deep scroll) — a persistent trust-badge ribbon rather than a footer logo wall.
  - Feature sections are full-bleed light-gray rounded panels, headline centered above a screenshot that shows the actual macOS menu-bar app UI in context (e.g. dragging an asset out of the notch into Sketch) rather than an isolated cropped screenshot.
- **mobile**:
  - The vertical fixed 'Honors' ribbon DISAPPEARS as a sticky element and instead becomes a row of 3 circular badge icons (Product Hunt / Honors / M.) placed inline beneath the hero CTA — vertical persistent ribbon → horizontal static badge row.
  - Panels go single-column, headline still centered, screenshot still shown in-context (not cropped to just the UI).
- **motion**:
  - No autoplay motion caught; the 'drag from notch' screenshot implies a demo GIF/video that may be present but not captured mid-loop.
- **steal**: The 'vertical fixed award-badge ribbon on desktop → horizontal badge row on mobile' is a concrete, literal answer to the brief's demand for sections that completely change shape on mobile, applicable to maxfolio's Explore/theme-switcher or a future 'as seen in' trust strip.
- screenshots: scrollytelling-products-supaste-desktop-top.png | scrollytelling-products-supaste-desktop-mid25.png | scrollytelling-products-supaste-mobile-top.png | scrollytelling-products-supaste-mobile-mid25.png

## Avec — https://www.avec.ai/ · 2026 (OnePageLove, published May 25 2026)
- **desktop**:
  - Extremely short single-viewport landing hero: split layout, oversized headline + one sentence + single CTA on the left, one large phone mockup with an app-UI screenshot on a solid saturated-blue rounded backdrop on the right — no scroll narrative at all in the captured page (page height ≈ viewport height).
  - A pause/play control sits top-right of the phone mockup, implying the on-screen app content loops/updates (e.g. a swipe-to-triage email animation) even though the page itself doesn't scroll further.
- **mobile**:
  - The split collapses to stacked: headline+CTA first, phone mockup full-width below, same solid-blue backdrop card treatment preserved (not simplified to a flat screenshot).
- **motion**:
  - Visible pause/play button on the phone mockup is direct evidence of a looping in-mockup animation (e.g., a swipe gesture demo) rather than a static screenshot.
- **steal**: A confident, ultra-short single-viewport hero with ONE looping in-device animation (not a full scrollytelling page) is a legitimate model for a lightweight 'Now' section refresh on maxfolio — proves you don't need a long scroll to feel alive if the one visual you show is actually moving.
- screenshots: scrollytelling-products-avec-desktop-top.png | scrollytelling-products-avec-mobile-top.png

## Framer.com — https://www.framer.com/ · current 2026 product site
- **desktop**:
  - Hero is a dark chat-UI screenshot (an 'agent' composing a prompt) rather than a canvas/design-tool screenshot, immediately reframing Framer as an AI product.
  - Mid-page splits into a 2-panel layout: a code/canvas preview on the left (e.g. a draggable 'ImageWheel' component demo) paired with a live chat transcript on the right showing the agent 'thinking' and writing code in real time — pairing a static preview with a simulated live process.
  - A 3-column feature grid embeds genuinely data-styled LIVE WIDGETS instead of screenshots: an animated analytics line-chart with a hover tooltip showing a specific date/value, an A/B-test results table with a 'WINNER' badge, and thin progress-bar tiles for SEO/Localization/Security.
- **mobile**:
  - The 3-column live-widget grid collapses to single column; the Core Web Vitals card becomes three full-width stacked progress bars (LCP/INP/CLS) each with its own colored fill and numeric value — the exact 'card-grid becomes stacked stat list' transformation.
  - The chat-transcript panel becomes a compact, cropped preview (partial text visible, implying a 'view more' or continued scroll) rather than showing the full conversation at once.
- **motion**:
  - Hover tooltip on the analytics line chart showing a specific date/pageview/visitor value is directly observed — confirms real interactive charting, not a flat image.
- **steal**: Framer's 'live widget' feature grid (real animated chart + real progress bars, not screenshots of charts) is the highest-fidelity model available for fixing the case-study charts problem while keeping Lighthouse 100 — build maxfolio's per-store metrics as small live SVG/CSS components (hoverable line chart, colored progress bars) rather than embedding chart images.
- screenshots: scrollytelling-products-framer-desktop-mid25.png | scrollytelling-products-framer-desktop-mid50.png | scrollytelling-products-framer-mobile-mid25.png

## ideas
- Process (5 steps): replace the current scroll-stepper-with-pinned-numeral with Shopify Editions' persistent left-edge index pattern — list all 5 step names down the left margin, bold/brighten the active step as it's scrolled past, and pair each with ONE oversized word + one sentence on the right (no card, no icon tile) — solves 'clearer non-card layout' directly.
- Shopify-work case studies: adopt Warp's 'fig. N' monospace caption system on a shared subtle dot-grid backdrop, and mandate 3 DIFFERENT chart forms per store rotation (activity heatmap, stat-badge+line+table combo, stacked comparison bars) instead of the current identical indexed-line/slope/gauge/before-after set for every one of the 19 stores.
- Case-study 'before/after': steal Apple MacBook's inline tab-switcher-above-one-frame pattern (e.g. 'Before' / 'After' or 'Desktop' / 'Mobile' tabs swap one screenshot + one caption) instead of showing both bars/screens simultaneously in a card.
- Tech stack: replace the six prose-with-inline-chips sentences with Clay-style small custom vignette illustrations grouped into 3-4 full-bleed color-tinted panels (one tint per domain: Shopify/Liquid, React/frontend, Ops/Security, Data/Analytics) — each panel gets its own pill label and a tiny bespoke icon set instead of generic chip pills.
- Fleet marquee / 'Now' pill: borrow Notion Calendar's scattered floating-glyph hero technique — small icon tiles (Shopify bag, terminal, chart) loosely orbiting the 'Now' headline with slight parallax on scroll, replacing the flat ticker with something that has depth without WebGL.
- Experience section: use Elva's pinned-center-mockup-with-scrubbing-captions mechanic — pin one dashboard/device screenshot of the Digitdeck platform dead center while 4-5 one-line role/impact captions crossfade past it, as an alternative 'narrative with inline chips' treatment for the split role-rail.
- Year by year: give it a persistent roman-numeral or year-number index rail (Shopify Editions technique) so the active year bolds as the reader scrolls, instead of a passive hairline list — turns it into a live wayfinding device.
- Contact/CTA: add Apple's persistent contextual mini-nav — a slim bar that appears after the hero and stays sticky through every section, always showing a short label + the 'Get the free 20-minute review' button, so the primary CTA is reachable from anywhere on the page, not just the bottom.
- Gallery carousel: try Cursor's 'let it bleed off the mobile edge' technique for the laptop+phone composites at 390px instead of shrinking them to fit inside safe margins — crop confidently rather than resize.
- Long list sections (Shopify work index, Projects index): insert a large typographic pull-quote moment (Notion Calendar technique) every 5-6 items to break up what would otherwise be 2+ consecutive card-grid/index-list bands, satisfying the G3 rule.
- Skills section 'zero AI slop' fix: avoid glossy AI-orb/gradient-blob imagery (seen in Elva) — instead use flat, custom, on-brand vignette icons (Clay's approach) or literal product-UI crops (Framer's approach), never generic 3D stock renders.
- Trust/press strip (if added later): use Supaste's 'vertical fixed ribbon on desktop → horizontal badge row on mobile' as the literal mobile-transformation template — a concrete instance of a section that fully changes shape rather than just reflowing.
- Explore/theme-switcher cards: reduce visual weight by using Clay's full-bleed color-tinted panel treatment (each theme gets its own background tint + one illustration) instead of neutral bordered cards, making the theme choice itself feel more like a chapter than a settings screen.
- Motion budget: none of the steals above require WebGL/GSAP — sticky/pinned index rails, opacity crossfades, tab-switch caption swaps, and hover tooltips on inline SVG charts are all achievable with framer-motion's useScroll/useTransform + CSS, preserving the Lighthouse 100 constraint.
## avoid
- Elva's glossy 'AI glow orb + liquid glass on dark background' surface treatment — reads as generic AI-slop even though the underlying pinned-mockup MECHANIC is worth stealing; execute the mechanic with maxfolio's own flat/editorial visual language instead.
- Cursor's celebrity-name testimonial-quote wall (Jensen Huang, Andrej Karpathy) — maxfolio has no equivalent real quotes to show, and a fabricated or vague 'client feedback' card grid would violate the honesty constraint and read as filler.
- Shopify Editions' mobile choice to remove the persistent chapter index ENTIRELY rather than adapting it — don't just delete wayfinding on mobile for maxfolio's Year-by-year or Process sections; replace it with a mobile-appropriate equivalent (e.g. a horizontal progress dots row) instead of dropping it.
- Apple's interstitial country/region banner pattern — irrelevant chrome, ignore.
- Clay's generic-looking stock-3D-icon-pack aesthetic if not custom-modeled to match Max's own brand — a purchased/generic Blender icon set would read as template-y for a CTO-level portfolio; only worth it if genuinely bespoke.
- Warp's ambient-audio control (mute icon) — cute for a dev tool, out of place and potentially annoying on a portfolio; skip the audio angle entirely.
- Avec's near-zero scroll depth as a MODEL for a full section — fine as inspiration for a compact 'Now' refresh, but should not be used as an excuse to shorten sections that need real narrative depth (Process, Shopify work, Year by year).

# LENS: dense-info-editorial (agent a8c90c079499ab7ca)

## gwern.net — "Sidenotes In Web Design" essay — https://gwern.net/sidenote · long-running reference site, essay dated 2020–2025
- **desktop**:
  - Two-column reading layout right under the title block: a numbered outline (1 Examples, 2 Implementation Strategies, 3 Comparison, 4 Implementations with nested 4.1–4.10 sub-links) sits beside the opening paragraph in a plain hairline-bordered box — no shadow, no card chrome.
  - Citation-style metadata row (date range, 'finished' status, certainty/importance with dotted-underline popovers, backlinks/similar/bibliography) reads as inline text links, never icon buttons.
  - True margin sidenotes float in the right gutter keyed to superscript numbers, keeping the main column narrow while dense citations sit beside it without breaking the argument.
  - Nested topic lists (Tufte-CSS, sidenotes.js, Ink & Switch...) are plain indented lists — indentation alone carries the hierarchy.
- **mobile**:
  - The two-column ToC-beside-paragraph layout collapses to one column: the outline prints first as a flat vertical list (nesting kept via indent), then the essay follows underneath.
  - Right-margin sidenotes convert to inline collapsible footnotes — tapping the dotted-underlined marker expands the note directly below that sentence, pushing text down instead of floating beside it.
  - The metadata row simply wraps to two lines; nothing is hidden behind a hamburger or accordion.
- **motion**:
  - Hovering/tapping a footnote marker fades a note in beside (desktop) or below (mobile) the sentence — an opacity+offset transition used purely functionally, not decoratively.
  - No scroll-triggered reveals anywhere on the page — density here is handled with zero animation, which is itself the lesson.
- **steal**: For maxfolio's 'Experience'/'Year by year' panel: a slim sticky outline of years/roles at left with full prose at right on desktop, collapsing to outline-first-then-prose on mobile; and convert every 'Sample data' chart caveat into a real Gwern-style sidenote (hover-card on desktop, tap-to-expand inline on mobile) instead of a small gray disclaimer tag.
- screenshots: dense-info-editorial-gwern-desktop-top.png | dense-info-editorial-gwern-mobile-top.png | dense-info-editorial-gwern-desktop-full.png | dense-info-editorial-gwern-mobile-full.png

## Tufte CSS (canonical demo) — https://edwardtufte.github.io/tufte-css/ 
- **desktop**:
  - Single centered ~55ch serif text column on a cream ground; headings are plain type, zero boxes anywhere on the page.
  - Sidenotes sit in a dedicated right margin column keyed to superscript numbers, so citations/asides never break the main column's measure.
  - A 'fullwidth' class is the only escape hatch for figures/tables that need to break out of the text column — used sparingly, as an explicit exception, not the default.
  - No nav chrome above the fold at all: title, byline, straight into text; hierarchy is 100% typographic.
- **mobile**:
  - Sidenotes lose the margin entirely and fall back to numbered inline footnotes at point of reference (a checkbox-toggle pattern in the framework, CSS-only, no JS needed).
  - The single text column just narrows to fill the viewport — there is no structural reflow because the whole page was always one column.
- **motion**:
  - None whatsoever — deliberately static; proves density can win on typography and measure alone with zero animation.
- **steal**: Adopt this exact CSS-only sidenote mechanic for maxfolio's Shopify case-study charts: a superscript beside 'Sample data' that opens a real margin explanation on desktop and an inline toggle on mobile, replacing the current gray disclaimer tag with an actual, readable methodology note.
- screenshots: dense-info-editorial-tuftecss-desktop-top.png | dense-info-editorial-tuftecss-mobile-top.png

## The Pudding — index + "Why some people mow a lawn better than others" — https://pudding.cool/2026/06/mow/ · story published June 2026
- **desktop**:
  - HONEST NOTE: the pudding.cool homepage index is itself a numbered colorful card grid (#224, #223…) with a chart-thumbnail per tile — flagged because it contradicts the 'no cards' brief, even though the brand is otherwise a lens exemplar.
  - Individual essay page is full-bleed dark background, single centered column, a mixed serif/sans giant headline, and a byline row of plain inline linked author names (no avatar chips, no card).
  - A playable inline game sits directly in the text flow (not framed in a card/modal) with a plain text link ('SKIP TO RESULTS') offered right below it for readers who don't want to interact — progressive disclosure via a link, not a UI control.
- **mobile**:
  - Identical single-column full-bleed layout at any width — the game/embed just scales to the viewport; byline wraps to two lines. There was never a multi-column structure to collapse.
- **motion**:
  - The interactive lawn-mowing game animates the mower path as you drag/click moves — interaction-driven, not scroll-driven; consistent with Pudding's known scrollytelling annotation reveals elsewhere in the piece.
- **steal**: For the Shopify case-study sheets: put the byline as plain inline links, then let the 'Sample data' chart/gauge sit directly in the full-width reading column with a plain caption underneath, like a figure — not inside the current bordered, shadowed card.
- screenshots: dense-info-editorial-pudding-desktop-full.png | dense-info-editorial-puddingstory-desktop-top.png | dense-info-editorial-puddingstory-mobile-top.png

## Are.na — https://www.are.na 
- **desktop**:
  - Opens with a lettered definitional list instead of a paragraph — 'Are.na is: a. Online software..., b. A toolkit..., c. [+]' — the '+' literally invites the reader to add their own definition. Zero cards.
  - 'How it works' pairs a live product screenshot on the left with a plain vertical step list on the right (Capture / Arrange / Search / Connect / Network); only the active step is bold black, the rest are pale gray.
  - 'The secret' section is a numbered list (1–4), each item a bold mini-headline plus 1–2 sentence body, run as plain vertical text with no boxes or icons.
  - Long-term-vision/API/no-ads sections are just headline+paragraph blocks separated by whitespace, never cards.
- **mobile**:
  - Everything drops to one column and restacks in the same order; the screenshot+step-list pair becomes screenshot-on-top, list-below.
  - Text-heavy nav row collapses to a 4-icon bottom bar; the lettered and numbered lists are untouched because they were never boxed.
- **motion**:
  - The step list's active/inactive state appears to advance in sync with scroll position past the screenshot — a lightweight scroll-linked highlight, not a full scroll-jack.
- **steal**: Replace maxfolio's 'Five steps, no surprises' card row with an Are.na-style pairing: a pinned diagram/screenshot of the real QA pipeline on one side, a plain vertical 5-item list on the other where only the in-view step is bold and the rest are dimmed — collapsing on mobile to visual-then-list, no cards.
- screenshots: dense-info-editorial-arena-desktop-top.png | dense-info-editorial-arena-mobile-top.png | dense-info-editorial-arena-desktop-full.png | dense-info-editorial-arena-mobile-full.png

## Basecamp — "Shape Up" (free online book) — https://basecamp.com/shapeup 
- **desktop**:
  - The entire book is one page: a cover block (title, author, two pill CTAs), then a table of contents that IS the page body — bold 'Part 1: Shaping' section headers, bold linked chapter titles underneath, and under each chapter a plain italic sub-list of every named idea inside it (e.g. 'Fixed time, variable scope', 'Narrow down the problem'), each a real jump-link.
  - Hairline rules separate Parts; there is no sidebar, no accordion, no card anywhere — density is handled purely through heading scale (Part > Chapter > topic) and vertical rhythm.
- **mobile**:
  - Identical structure at a narrower measure — nothing collapses or hides. The layout was never chrome-dependent, so there is nothing to shed on mobile.
- **motion**:
  - None — pure typographic hierarchy, no transitions of any kind observed.
- **steal**: Use this as the model for a genuinely new, non-card 'Process' or 'Year by year' structure: each step/year as a bold heading with 2–4 named sub-moves in a plain italic list underneath, hairline rule between entries — naturally identical on mobile and desktop, satisfying the 'clearer non-card layout' complaint directly.
- screenshots: dense-info-editorial-shapeup-desktop-top.png | dense-info-editorial-shapeup-mobile-top.png | dense-info-editorial-shapeup-desktop-full.png | dense-info-editorial-shapeup-mobile-full.png

## Increment magazine — https://increment.com/ 
- **desktop**:
  - Article index is a flowing 2-column list of hairline-separated rows: small-caps author eyebrow + headline (type size varies by editorial weight) + a 1-line dek — no thumbnails, no borders, no card backgrounds; a few rows get bigger 'feature' type to create rhythm without boxes.
  - Footer holds a literal topic tag-cloud (~20 pills: Planning, Mobile, Containers, Reliability, Remote, APIs, Frontend, Testing, Open Source, Security, Documentation, Programming Languages, Energy & Environment, Development, Cloud, On-Call) where pill font-SIZE encodes how many articles exist per topic.
  - A torn-paper 'increment' ribbon banner sits pinned above a hairline-bordered 'Issue N / Month Year / Title' plate at the top of the page.
- **mobile**:
  - The 2-column article grid becomes 1 column; hairline rows just stack in the same order.
  - The tag cloud shrinks pill sizes proportionally and wraps into more rows — same element, only reflowed, not restructured.
- **motion**:
  - No animation observed beyond a static CSS rotation on the ribbon banner (decorative, not triggered).
- **steal**: Replace maxfolio's 'What I work with' chip grid with an Increment-style tag cloud sized by REAL usage frequency across the 18+ stores (Shopify Liquid/React render huge, one-off tools render tiny) — and strip the remaining card-like borders from the already-list-based 'Shopify work' index so it reads exactly like this hairline article list (eyebrow=store name, headline=feature, dek=metric).
- screenshots: dense-info-editorial-increment-desktop-top.png | dense-info-editorial-increment-mobile-top.png | dense-info-editorial-increment-desktop-full.png | dense-info-editorial-increment-mobile-full.png

## "AI in Design Report 2026" (Designer Fund × Foundation Capital) — https://stateofaidesign.com/ · Awwwards Site of the Day, Aug 26 2026
- **desktop**:
  - Hero is a mesh-gradient collage of blurred practitioner headshots labeled by role ('BRAND DESIGNER', 'PRODUCT DESIGNER') via small mono caption tags pinned to each photo's corner — a collage of overlapping, variously-sized photos on a shared abstract gradient background, not a grid of equal cards.
  - Body alternates full-bleed SOLID-COLOR section bands (a saturated orange band holding a bulleted 'toolstack shakeup' list) with white text-only sections holding one giant pull-quote plus a small circular headshot.
  - 'Seven companies, seven ways' is a horizontal filmstrip of photos with prev/next arrows below a headline — a rail, not a grid.
  - Report closes with a giant multi-line typographic wordmark ('AI in Design / 2026') filling the viewport, with a hairline stat row above it ('0 Survey responses / 0+ Companies interviewed / 0+ Public sources') captured pre-animation at zero — a count-up closing moment that mirrors maxfolio's own opening stat band.
- **mobile**:
  - Hero collage recomputes to fewer, larger overlapping photo tiles stacked vertically instead of scattered across the width; the full-bleed orange band keeps its full-bleed treatment rather than becoming boxed.
  - The horizontal company filmstrip appears built to collapse to one visible item at a time on narrow viewports rather than showing 3-across.
- **motion**:
  - Corner role-tags on hero photos are positioned consistent with a staggered fade-in as the collage assembles; the closing stat row is a count-up (rendered at 0 pre-trigger in the capture), matching a pattern maxfolio already uses.
- **steal**: Insert a full-bleed SOLID-COLOR section band (not gray, not white) between two of maxfolio's existing hairline sections — e.g. a saturated one-color panel holding a single stat or the Contact pull-quote — and consider ending the page with an oversized closing wordmark before the Explore switcher, giving the CTA more visual weight than the current single-line typographic band.
- screenshots: dense-info-editorial-stateofaidesign-desktop-top.png | dense-info-editorial-stateofaidesign-mobile-top.png | dense-info-editorial-stateofaidesign-desktop-full.png

## Mosby's Files — "American Modernism" (Tubik Studio) — https://www.mosbyfiles.com/ · Awwwards Site of the Day, Aug 13 2026
- **desktop**:
  - Below a plain dark hero (huge condensed headline, no image), architect names sit inside colored wavy 'ribbon' bands (jagged-edge highlighter-stroke shapes) instead of boxes: a blue ribbon labeled 'Organic & Early Modernism' holds Frank Lloyd Wright and Irving Gill; a teal ribbon 'Expressive' holds Louis Kahn/I. M. Pei/Paul Rudolph; a purple ribbon 'Monumental Modernism' holds Mary Colter/Louis Sullivan; a final red full-width band is shown already expanded with a paragraph of era description in monospace type, plus a row of tiny compass/protractor line-icons as a decorative footer.
  - Ribbons overlap vertically (each name-pill straddles two rows) so architects who bridge movements visually bridge two colors — showing category overlap without a table or card.
- **mobile**:
  - Ribbons stack more tightly with less overlap but keep the same wavy-band-as-category-container idea; only one band (the last) shows its expanded description text in both captures — consistent with an accordion-by-color-band where opening one closes the others, rather than an accordion-by-card.
- **motion**:
  - Implied hover/tap-to-expand per ribbon band (only one band's paragraph is open at a time in both viewport captures).
- **steal**: Rebuild maxfolio's 'Year by year' timeline as colored ribbon-bands per CAREER ERA instead of per-year cards — e.g. one wavy band per phase ('Shopify Tech Lead era', 'Full-stack era') holding the relevant year-numerals as pills, expanding on tap to reveal that era's role details in monospace — replacing the 2026/2025/2024 card row with a single accordion-by-band structure that is naturally mobile-first.
- screenshots: dense-info-editorial-mosbyfiles2-desktop-top.png | dense-info-editorial-mosbyfiles2-mobile-top.png | dense-info-editorial-mosbyfiles2-desktop-full.png

## mesh3d.gallery — "The State of the Gallery" (Majo Puterka) — https://mesh3d.gallery/the-state-of-the-gallery · Awwwards Site of the Day, Aug 22 2026
- **desktop**:
  - CAVEAT: built on a pinned WebGL/Three.js canvas — page height doesn't reflect real scroll-jacked content, so only the intro moment was actually captured; included for one typographic idea only, not the tech (excluded by maxfolio's no-WebGL/Lighthouse-100 constraint).
  - Split-line giant headline ('The state' anchored top-left, 'of the gallery' anchored bottom-right) straddling a full-bleed animated aurora/particle background, with a centered one-sentence dek in small caps mid-page, and utility labels (SCROLL TO DIVE IN / AUDIO OFF / SHARE / MADE BY) pinned to all four true corners of the viewport.
- **mobile**:
  - Same split-corner-headline idea compresses to two big stacked lines at top and bottom of the viewport with the dek between them; the four corner utility labels are kept at true corners rather than being dropped or merged into a menu.
- **motion**:
  - Particle/aurora field animates continuously in the background (two same-moment captures show slightly different particle positions); real content beyond the hero is disclosed via scroll-jacking, which is out of scope to reproduce.
- **steal**: Borrow only the CSS-safe idea — a hero with two giant headline halves anchored to opposite corners (top-left / bottom-right) plus small utility labels pinned to all four corners — as an alternate typographic hero or section-divider treatment for maxfolio, using a CSS gradient/noise background instead of a WebGL particle field to stay inside Lighthouse 100.
- screenshots: dense-info-editorial-mesh3d-desktop-top.png | dense-info-editorial-mesh3d-mobile-top.png

## ideas
- Rebuild 'Five steps, no surprises' as an Are.na-style pairing: a pinned/sticky visual of the real QA pipeline (diagram or screenshot) on one side, a plain vertical list of the 5 steps where only the in-view step is bold black and the rest are dimmed gray — zero cards, zero numbered squares.
- Replace 'Five years, one direction' year-cards with a Shape-Up-style flat index: each year as a bold heading, 2-4 role/achievement bullets in a plain italic list underneath, hairline rule between years — identical structure on mobile and desktop.
- Alternative for the timeline: Mosby's-Files-style colored ribbon bands per CAREER ERA (not per year) that expand on tap to reveal role details in monospace — makes mobile naturally an accordion instead of stacked cards.
- Turn 'What I work with' into an Increment-style tag cloud sized by REAL usage frequency across the 18+ stores (Shopify Liquid/React huge, one-off tools tiny) — replace the six-column chip grid with one glanceable typographic block.
- Add Tufte/Gwern-style sidenotes to every 'Sample data' label in the case-study charts — a superscript opening a real methodology note in the margin (desktop) or inline on tap (mobile), turning a disclaimer into honest disclosure.
- Give case-study charts a Pudding-style treatment: full-width figure directly in the text column with a plain caption underneath, instead of a boxed, shadowed card.
- Add an Are.na-style lettered list ('a. / b. / c.') to the hero or About copy for defining what Max does — a distinctive editorial device that reads as human-written, not templated AI bullet slop.
- Insert a full-bleed SOLID-COLOR section band (stateofaidesign-style) between two existing hairline-gray sections — one saturated panel holding a single stat or the Contact pull-quote — to break the current all-gray monotony without adding a card.
- Badge each Shopify store's role in the store index with an Increment-style rotated hairline plate ('LEAD DEV', 'CRO AUDIT') instead of a colored chip pill.
- Simplify the fleet marquee into an Are.na-style plain text row with inline links for stores without a strong logo, reducing visual noise versus logo chips.
- End the Contact section with an oversized closing wordmark (stateofaidesign-style) before the Explore switcher, giving the primary CTA more visual weight than the current single-line typographic band.
- Strip the remaining card-like borders/backgrounds from 'Storefronts, apps, and the platform' (already list-based) so it matches Increment's pure hairline-row index exactly (eyebrow=store name, headline=feature, dek=metric).
- Use gwern-style dotted-underline inline glosses for Shopify jargon in case studies (e.g. 'WASM Functions', 'App Proxy') so non-technical DTC founders can hover/tap for a plain-English definition without a glossary page.
- Adopt Tufte's 'fullwidth' breakout class for the one or two data visuals per case study that deserve more room than the text column — an explicit occasional widen, not a default card width for everything.
- General mobile rule observed across all 9 references: paired content (visual+list, screenshot+steps) should stack in the SAME order as desktop (visual first), not reorder or hide by default — reserve real structural change for accordion-by-band content where showing everything expanded would be too long.
## avoid
- Pudding's own homepage index (numbered colorful card grid, #224/#223…) — contradicts the 'fewer cards' brief; don't copy the index even while stealing the story-page pattern.
- mesh3d.gallery's pinned WebGL/Three.js scroll-jacked canvas — directly excluded by the no-WebGL/Lighthouse-100 hard constraint; steal only the corner-anchored typography, never the rendering technique.
- Autoplaying background video/particle fields for hero atmosphere (mesh3d, implied on stateofaidesign) — expensive for Lighthouse; recreate the mood with a static CSS gradient or subtle noise instead.
- Generic 3-or-4-across icon-topped 'feature card' grids — none of the 9 reference sites use this pattern; if it shows up in any competitor mood board, it's exactly the archetype the owner is trying to escape.
- Applying Shape Up's zero-motion, type-only approach to EVERY section of maxfolio — fine for one dense section (Process or Timeline) but site-wide it would flatten the site's personality and contradict the 'more dynamic animation' ask.
- Sizing a tag cloud or ribbon-band width by an invented/eyeballed frequency — any size-encodes-importance device must map to a REAL count (actual usage across the 18 stores), never a guess, per the honesty constraint.
- Shrinking sidenote/footnote type below ~13px to cram more into a margin — Tufte/gwern deliberately keep sidenote text readable-sized; density should never come at the cost of legibility.

# LENS: mobile-transforms (agent aeb149ec4f4caa01e)

## maxfolio.dev (current site — baseline) — https://www.maxfolio.dev · n/a — client's own site, captured as baseline
- **desktop**:
  - Hero: centered typographic hero, then a 3-col x 2-row grid of ROUNDED GRAY CARDS for the 6 stat numerals (18+, 5, 2 / 91, 800+, 14).
  - Year by year: a horizontal CARD carousel — each year is a rounded white card (Roles / Storefronts pills / Products / On my own time), with dot pagination + prev/next arrows.
  - Shopify work: index list + filter chips, opens a case-study sheet with charts.
  - Gallery: laptop+phone composite carousel, hover-to-flip to product page.
  - Skills: ALSO a 3-col card grid (e.g. a white card titled 'AI ENGINEERING' with a plain bullet list) — not the 'six prose sentences' the brief described; the live site has already drifted to cards here too.
  - Contact: one big rounded card containing the giant headline, CTA and email/phone/location row.
  - A vertical dot/segment progress rail is pinned to the right edge for in-page scroll position.
- **mobile**:
  - Every section keeps the SAME archetype as desktop — cards stay cards, the carousel stays a carousel — only the column count drops (3-col stat cards -> 2-col, 3-col Skills cards -> 1-col stack). No section changes archetype.
  - Nav collapses text links to a hamburger; a floating round email FAB appears bottom-right and overlaps content (seen sitting on top of stat cards and CTA text).
  - The right-edge scroll-progress rail survives on mobile as a tiny floating pill ('Home' / 'Experience' / 'Contact') that is cramped against the 390px viewport edge and competes with the email FAB.
  - Year-by-year carousel becomes single-card-per-view but is still literally the same card component, just narrower.
- **motion**:
  - Count-up numerals on the stat band (observed unanimated final state only, based on brief)
  - 3D tilt on gallery composites is described in the brief but not something the static captures can confirm as still active
- **steal**: This is the CONTROL, not a steal — it is the evidence for the owner's complaint: nearly the entire page reuses one 'rounded gray card' primitive for stats, years, skills AND contact, and mobile only ever reflows column counts rather than changing structure.
- screenshots: mobile-transforms-maxfolio-desktop-top.png | mobile-transforms-maxfolio-mobile-top.png | mobile-transforms-maxfolio-desktop-scroll1.png | mobile-transforms-maxfolio-mobile-scroll1.png | mobile-transforms-maxfolio-desktop-scroll2.png | mobile-transforms-maxfolio-mobile-scroll2.png | mobile-transforms-maxfolio-desktop-scroll3.png | mobile-transforms-maxfolio-mobile-scroll3.png

## Apple — iPhone / MacBook Pro / Compare — https://www.apple.com/iphone/  |  https://www.apple.com/macbook-pro/  |  https://www.apple.com/iphone/compare/ 
- **desktop**:
  - iPhone hub: persistent horizontal model rail (9 models incl. Compare/Accessories) shown in full as a static row of image tiles under the 'iPhone' H1.
  - Product page has a full inline tab bar in the sub-header: Overview | Tech Specs | Compare | Switch from PC to Mac | Buy — all visible as plain text tabs.
  - Compare tool: exactly 3 model columns side by side, each with its own dropdown selector, own 'Buy'/price block, and rows of specs (USB-C, MagSafe wattage, Capacity, Display...) running in perfect horizontal alignment across all 3.
  - 'Explore the lineup' section is an edge-bleed horizontal image rail with visible next/prev chevrons.
- **mobile**:
  - The 9-item model rail becomes a SWIPEABLE RAIL showing only 3 tiles + a '>' chevron — content is truncated, not wrapped.
  - The 5-item product tab bar (Overview/Tech Specs/Compare/Switch/Buy) collapses into a single dropdown chevron next to the product wordmark in the sticky header — a full tab bar becomes one disclosure control.
  - COMPARE TABLE TRANSFORM (the big one): the 3-column spec table does NOT become an accordion. It becomes a horizontally-swipeable set of self-contained column-cards — mobile shows only 2 of the 3 models at a time, each card repeating its OWN row labels stacked vertically (no shared left-hand label column like desktop has), so you swipe sideways to bring the 3rd model into view. There is no visible arrow/hint that a 3rd column exists off-screen — a real usability miss.
  - Long legal/footnote text at the bottom stays as one dense unstyled paragraph block on both breakpoints (not transformed at all — an area Apple itself left un-optimized).
- **motion**:
  - Standard Apple parallax/scroll-reveal on hero product shots (not directly capturable in a static screenshot, but visible easing in partial-load states between scroll captures)
- **steal**: For maxfolio's Shopify case-study sheets: replace the fixed chart set with an Apple-Compare-style swipeable 2-up comparison (Store A vs Store B side by side, swipe for a 3rd), but FIX Apple's flaw by adding a visible dot/arrow affordance so the hidden 3rd column isn't lost.
- screenshots: mobile-transforms-apple-iphone-desktop-top.png | mobile-transforms-apple-iphone-mobile-top.png | mobile-transforms-apple-macbook-desktop-scroll1.png | mobile-transforms-apple-macbook-mobile-scroll1.png | mobile-transforms-compare-iphone-desktop-top.png | mobile-transforms-compare-iphone-mobile-top.png | mobile-transforms-compare-iphone-desktop-scroll1.png | mobile-transforms-compare-iphone-mobile-scroll1.png

## Stripe — https://stripe.com 
- **desktop**:
  - Hero: split — left headline+CTA column, right full-bleed rainbow-ribbon 3D render bleeding off the top nav.
  - Logo marquee (OpenAI, Amazon, Nvidia, Ford, Coinbase, Google, Shopify...) as one static full-width row.
  - 'Powering businesses of all sizes' section is a 2-col split: headline/CTA left, supporting stat paragraph right, divided by a hairline.
  - 3-icon feature row (Get to market faster / Grow new lines of revenue / Manage platform risk) laid out side by side with hairline dividers.
- **mobile**:
  - Nav dropdown menu -> hamburger icon.
  - Logo marquee crops to 2-3 logos visible per screen (same static row, just clipped by viewport, no re-flow to grid).
  - The 2-col split (headline / stat) STACKS to a single column, hairline divider becomes a horizontal rule between the two stacked blocks.
  - The case-study stat row (160 countries / 11K+ locations / products used) collapses from a horizontal row into a vertical list of 3 lines.
  - 3-icon feature row stacks to 3 full-width blocks, icon-then-headline-then-copy, each separated by generous whitespace instead of hairlines.
- **motion**:
  - Rainbow ribbon appears to be a static/looping gradient render, not obviously scroll-triggered in the captures
- **steal**: The 2-col split-with-hairline-divider -> stacked-with-horizontal-rule pattern is a clean, cheap way to make maxfolio's Experience split (role rail left / editorial right) collapse on mobile without losing the hairline motif already in maxfolio's design language.
- screenshots: mobile-transforms-stripe-desktop-top.png | mobile-transforms-stripe-mobile-top.png | mobile-transforms-stripe-desktop-scroll1.png | mobile-transforms-stripe-mobile-scroll1.png | mobile-transforms-stripe-desktop-scroll2.png | mobile-transforms-stripe-mobile-scroll2.png

## Linear — https://linear.app 
- **desktop**:
  - Hero: dark full-bleed, big headline, then a REAL-SCALE product screenshot showing sidebar + kanban board + a floating AI-chat overlay window layered on top of it.
  - Below the fold: a 4-up horizontal feature showcase (Intake and integrations / Planning and monitoring / AI and automations / Build, review and ship), each its own dark panel with its own screenshot, laid out so you scan across.
- **mobile**:
  - Full nav text row -> hamburger.
  - The real-scale product screenshot is scaled down uniformly to fit 390px AND the floating AI-chat overlay window is dropped/hidden entirely rather than shrunk further — mobile shows only the base app UI.
  - THE 4-UP FEATURE SHOWCASE FULLY CHANGES ARCHETYPE: on desktop it reads as a horizontal multi-column comparison; on mobile it becomes a full-bleed, one-feature-per-screen vertical stack — each feature gets its own full-width dark panel with its own screenshot, title and 'Learn more' link, stacked top to bottom with generous breathing room. This is a genuine card-grid/split -> editorial-full-bleed-stack transform, not just a reflow.
- **motion**:
  - AI chat thread shows simulated typed messages/timestamps suggesting a scripted playback loop on the hero screenshot
- **steal**: Steal this exact pattern for maxfolio's Skills section: instead of the current 3-col 'AI ENGINEERING' card grid, make each skill category (AI Engineering, Shopify/Liquid, Frontend, etc.) its own full-bleed panel with a real screenshot/diagram and inline tool chips — on desktop it can sit in a horizontal multi-panel rail, on mobile it becomes Linear's vertical full-bleed stack. Directly answers the owner's 'other ways to display the tech stack' ask.
- screenshots: mobile-transforms-linear-desktop-top.png | mobile-transforms-linear-mobile-top.png | mobile-transforms-linear-desktop-scroll1.png | mobile-transforms-linear-desktop-scroll2.png | mobile-transforms-linear-mobile-full.png

## Vercel — https://vercel.com 
- **desktop**:
  - Hero: centered headline + white dot pyramid render, with a 3-line stat/positioning list ('For coding agents / To ship apps and agents / Automated by agents') pinned to the right margin.
  - Logo marquee row of customers under the hero.
  - Customer proof blocks each pair a real product screenshot with a 4-item plain-text 'Features' list underneath (no card border).
- **mobile**:
  - The 3-line right-margin positioning list collapses to just the FIRST line visible under the headline — the other two lines are effectively dropped from the immediate view rather than stacked below.
  - Logo marquee crops to partial logos at the viewport edge (same static-row-gets-clipped pattern as Stripe).
  - Customer proof blocks keep the exact same borderless screenshot + plain feature-list structure, just full width — no archetype change here, a good example of a section that does NOT need to change.
- **steal**: The borderless 'screenshot + plain feature list, no card' pattern is a direct antidote to maxfolio's card-everywhere problem — use it for the Shopify work index entries instead of a rounded-card sheet trigger.
- screenshots: mobile-transforms-vercel-desktop-top.png | mobile-transforms-vercel-mobile-full.png

## Framer — https://www.framer.com 
- **desktop**:
  - Hero: dark, giant headline + a live-styled AI chat box mock ('New Chat' -> prompt -> Opus 4.8 model picker) with a glowing blue border.
  - Split section further down: left a large 'Code with an agent' image tile, right a terminal-style agent panel (Claude/Cursor/Codex tabs) — a true split 50/50.
  - Below that: an asymmetric masonry/collage grid of project image tiles at different sizes.
- **mobile**:
  - Cookie banner persists as a bottom sheet on both breakpoints.
  - Notably, ONE section renders performance data as a vertical STACK OF PROGRESS-BAR METERS: 'Core Web Vitals' with a green 'GOOD' pill, then LCP / INP / CLS each as a labeled horizontal progress bar with the value right-aligned — a chart type maxfolio has not used at all (it currently only does indexed-line/slope/gauge/before-after-bars).
  - The masonry collage on mobile appears to reduce to fewer simultaneous tiles rather than wrapping the full grid (consistent with the general 'drop density on mobile' pattern seen across sites).
- **motion**:
  - Terminal panel shows a red/amber/green traffic-light window chrome with tab switcher (Claude/Cursor/Codex) suggesting a looping product demo
- **steal**: Add the LCP/INP/CLS-style progress-bar-meter chart as a NEW chart type inside maxfolio's Shopify case-study sheets (e.g. for Lighthouse before/after, or CRO metric confidence) — it's compact, reads instantly, and is a completely different visual language from the existing indexed-line/gauge/bar charts, directly answering 'other chart types.'
- screenshots: mobile-transforms-framer-desktop-top.png | mobile-transforms-framer-mobile-top.png | mobile-transforms-framer-desktop-scroll1.png | mobile-transforms-framer-mobile-scroll1.png

## Shopify.com (marketing + pricing) — https://www.shopify.com  |  https://www.shopify.com/pricing 
- **desktop**:
  - Homepage hero: full-bleed video/photo background with overlaid headline + 2 CTAs.
  - 'Sell everywhere people shop' section: 3-col feature grid (Sell on every channel / Sell face to face / Sell to 250M+ shoppers with Shop), each with its own illustration and copy, side by side.
  - Pricing page: 4-col pricing card grid (Basic/Grow/Advanced/Plus) side by side, each a full dark card with its own CTA and feature bullets.
  - 'Compare all features' further down is a classic full-width comparison TABLE with 4 plan columns and dozens of feature rows.
- **mobile**:
  - 3-col feature grid on the homepage becomes full-width stacked panels, each with its OWN standalone image above the text (not a shrunk grid — a real content reflow with new imagery per panel).
  - PRICING CARD GRID -> SNAP-SCROLL CAROUSEL WITH PEEK: the 4-col pricing grid does not stack vertically at all. Instead mobile shows ONE plan card at nearly full width with a visible sliver of the next card peeking at the right edge, inviting a horizontal swipe — a textbook 'card-grid -> horizontal snap rail' transform.
  - COMPARISON TABLE -> SEGMENTED TABS + SINGLE-COLUMN LIST: the 4-column feature table becomes a 'Basic | Grow | Advanced | Plus' segmented tab bar; below it, only the SELECTED plan's features are listed as a simple two-column list (feature name left, checkmark/value right). This is the clean 'N-column table -> tabs + list' pattern the brief was fishing for with 'table becomes an accordion' — Shopify's version uses tabs instead of an accordion, and it's arguably better because there's no long scroll to expand/collapse.
- **steal**: Use the pricing-card 'peek carousel' for maxfolio's stat band on mobile (instead of a 2-col card grid, show one stat full-width with the next one peeking), AND use the 'segmented tabs + single-column list' pattern for a future store-comparison view inside the Shopify work section (e.g. compare 2-3 stores' metrics by tapping between them instead of a dense table).
- screenshots: mobile-transforms-shopify-desktop-scroll1.png | mobile-transforms-shopify-mobile-scroll1.png | mobile-transforms-shopify-pricing-desktop-top.png | mobile-transforms-shopify-pricing-mobile-top.png | mobile-transforms-shopify-pricing-desktop-scroll1.png | mobile-transforms-shopify-pricing-mobile-scroll1.png

## Nike (localized nike.com.co landing) — https://www.nike.com 
- **desktop**:
  - Split 50/50 hero: left a lifestyle photo, right a red color-blocked panel with bold condensed headline + one CTA pill.
- **mobile**:
  - The 50/50 split stacks vertically: photo on top (cropped to a different, tighter portrait image, not just the desktop photo resized), color-blocked text panel below — confirms sites often swap the actual IMAGE ASSET for mobile, not just its dimensions.
  - Top-nav (Buscar tienda / Únete / Iniciar sesión links) collapses to a bare account-icon + hamburger.
- **steal**: When maxfolio's Experience split (role rail / editorial panel) stacks on mobile, swap in a differently-cropped or differently-composed visual for the top block rather than just shrinking the desktop one — costs nothing extra since it's already a placeholder photo slot.
- screenshots: mobile-transforms-nike-desktop-top.png | mobile-transforms-nike-mobile-top.png

## Airbnb — https://www.airbnb.com 
- **desktop**:
  - Header: 4 category tabs with icons+labels (All/Homes/Experiences/Services) plus a 3-field inline search bar (Where/When/Who) all visible in one row.
  - 'Inspiration for future getaways' is a plain 6-col x 3-row TEXT LINK grid (city name + rental type) under a row of text-tab filters (Popular/Arts & culture/Beach...).
- **mobile**:
  - 3-FIELD SEARCH BAR -> SINGLE PILL: 'Where/When/Who' collapses into one tappable pill labeled 'Start your search' — a full multi-field form becomes a single entry point that presumably opens a full-screen flow (classic mobile search-bar consolidation).
  - Category tabs shrink to icon-first pills in a horizontal scroll row, losing most text labels except the active one.
  - The plain text-link destination grid is REPLACED by actual PHOTO CARDS ('Popular homes in Bogotá' with guest-favorite badges, price, rating) in a horizontal swipe rail — mobile shows richer visual cards where desktop showed plain text links, the opposite direction from the usual 'simplify for mobile' assumption.
- **steal**: The '3-field form -> one pill that opens a flow' pattern is exactly what maxfolio's Contact section could do differently on mobile: instead of showing the full contact card, show one pill ('Send a message ->') that expands or routes to a focused contact view, keeping the initial mobile viewport lighter.
- screenshots: mobile-transforms-airbnb-desktop-top.png | mobile-transforms-airbnb-mobile-top.png

## Notion — https://www.notion.so 
- **desktop**:
  - Hero: centered headline with decorative floating avatar icons ABOVE it and small decorative doodle/badge icons floating in the left and right margins around the fold.
  - A full-scale, detailed browser-chrome product screenshot (sidebar + calendar widget + agent list) sits directly under the hero CTA.
- **mobile**:
  - ALL of the margin decorative doodles/badges (the hand-drawn arrow, the GitHub/checklist icon cluster) are fully REMOVED on mobile, not shrunk — only the centered avatar row and headline survive.
  - The detailed multi-pane product screenshot is deferred: mobile instead shows the logo marquee immediately after the CTAs, THEN a simplified 'AI where your team works' text section with a plain 'Capture knowledge' card BEFORE any complex screenshot appears — content is reordered, not just resized, to put simpler elements first.
- **steal**: Confirms a real technique: don't try to cram maxfolio's most detail-dense visual (e.g. the case-study charts) at the same scroll position on mobile as desktop — on mobile, put a simpler proof point (a headline stat or short list) first and push the dense chart later, rather than shrinking it in place.
- screenshots: mobile-transforms-notion-desktop-top.png | mobile-transforms-notion-mobile-top.png

## Figma — https://www.figma.com 
- **desktop**:
  - Hero: media-first collage of 4+ overlapping app-screenshot tiles at different rotations/depths (event poster, video timeline editor, a fitness-stats widget, a star-icon card) fanned out behind the headline.
- **mobile**:
  - The collage is drastically pruned rather than shrunk-and-kept: mobile shows only 2 of the original 4+ layers (the event poster + the star-icon card), with the video-editor and fitness-widget tiles dropped entirely — reducing visual complexity by removing layers, not by scaling everything down proportionally.
- **steal**: If maxfolio ever builds a layered/collage hero moment (e.g. for the Gallery section opener), prune layers for mobile rather than shrinking all of them — 2 well-composed tiles read better at 390px than 4 tiny ones.
- screenshots: mobile-transforms-figma-desktop-top.png | mobile-transforms-figma-mobile-top.png

## Arc (Dia) — https://arc.net 
- **desktop**:
  - Full-bleed blue band with a scalloped/wavy bottom edge, headline inside a lighter gradient card, product screenshot (browser sidebar UI) beneath the CTA, then another full-bleed blue quote band below.
- **mobile**:
  - The scalloped-edge full-bleed band motif is PRESERVED exactly (not simplified to a straight edge) — confirms a strong brand motif can survive the breakpoint unchanged while everything inside it stacks.
  - Nav collapses to hamburger only; the product screenshot scales down proportionally with no cropping or layer removal (contrast with Figma's collage-pruning above — a simple single screenshot just scales).
- **steal**: n/a — mainly useful as a control showing that decorative full-bleed shapes (scallops, blob backgrounds) are cheap to keep on mobile since they're pure CSS, unlike complex layered screenshots which do need pruning.
- screenshots: mobile-transforms-arc-desktop-top.png | mobile-transforms-arc-mobile-top.png

## Gionatan Nese '26 (Awwwards SOTD + Developer Award, Sep 5 2026) — https://www.gionatannese.com · Awwwards Site of the Day + Developer Award, 2026-09-05
- **desktop**:
  - Entire homepage is a single fixed-viewport CANVAS (not a scrolling page): small project thumbnails are scattered at irregular positions across a blank white field, with the name lower-left, a small wordmark centered, and 'Multi-Disciplinary Designer' lower-right.
- **mobile**:
  - The scattered-canvas layout is KEPT almost verbatim at 390px — thumbnails are repositioned/rescaled slightly but the free-form scatter is not linearized into a list or grid. This is a rare counter-example to 'sections completely change on mobile': a deliberately art-directed layout that stays structurally identical across breakpoints because changing it would destroy the concept.
  - No visible scroll on either breakpoint in the captures — this looks like an interaction-driven (click/drag) single-screen piece rather than a scrolling multi-section site, consistent with Awwwards' note about 'subtle WebGL and 3D interactions.'
- **motion**:
  - Site is described by outside sources as using subtle WebGL/3D interactions and sound design — not confirmable from static screenshots, and WebGL is explicitly off-limits for maxfolio anyway
- **steal**: Borrow the CONCEPT, not the tech: an opening moment where small project thumbnails sit scattered at fixed CSS positions (percentage-based, no WebGL) with a subtle framer-motion float/parallax-on-scroll, as an alternative opener for the Gallery or Projects section — explicitly flagged in the ideas list as needing a linearized mobile fallback if the scatter gets too cramped below ~430px.
- screenshots: mobile-transforms-gionatan-nese-desktop-top.png | mobile-transforms-gionatan-nese-mobile-top.png

## Illoca (Awwwards Honorable Mention, Sep 5 2026) — https://illoca.com · Awwwards Honorable Mention, 2026-09-05
- **desktop**:
  - Hero rendered blank in the headless capture (only the nav bar was visible) — the hero content is almost certainly a canvas/WebGL element that needs an interaction or longer settle time than a static screenshot allows, which is itself a useful cautionary data point about heavy-canvas heroes and crawlers/first paint.
- **mobile**:
  - Mobile DID render: headline 'Imagination, made editable' sits above a thin, tall VERTICAL graphic strip with small blue tick-marks along it — this reads like a wide horizontal diagram/timeline on desktop that has been rotated/collapsed into a single vertical rail for mobile, though the blank desktop capture means this can't be fully confirmed against the desktop original.
- **steal**: Flagged as a LOW-CONFIDENCE idea only (desktop source unverified): a wide horizontal diagram collapsing into one vertical strip is a genuine archetype change worth testing for maxfolio's 'Year by year' visual, but should be validated against the live site with real interaction before committing, not copied blind from this capture.
- screenshots: mobile-transforms-illoca-desktop-top.png | mobile-transforms-illoca-mobile-top.png

## Pacôme Pertant Portfolio (Awwwards SOTD, year not confirmable) — https://pacomepertant.com · Awwwards Site of the Day — exact year not confirmed by search results, flagged honestly rather than guessed as 2026
- **desktop**:
  - Full-bleed black entry gate: centered gradient orb icon, 'motion & sound designer based in paris' subhead, and a pill-shaped 'enter with sound' CTA plus a smaller 'enter without sound' text link below.
- **mobile**:
  - The entry gate is reproduced almost pixel-for-pixel at 390px, just recentered and slightly smaller — a full-bleed centered-content gate needs essentially zero mobile-specific transformation, since it's already just typography + one button on a blank field.
- **steal**: Not a structural steal (see avoid list — gates add friction), but confirms that a single full-bleed typographic moment (candidate for maxfolio's Contact section headline) genuinely needs no mobile-specific rework beyond font-size scaling if it's kept minimal enough.
- screenshots: mobile-transforms-pacome-pertant-desktop-top.png | mobile-transforms-pacome-pertant-mobile-top.png

## ideas
- Year-by-year: stop using the SAME horizontal card carousel on both breakpoints (current maxfolio behavior). Desktop keeps a horizontal snap-scroll year rail; mobile switches to a vertical hairline timeline with the year running down the left edge and roles/storefronts branching right, git-log style — a real archetype change, not a reflow, and it directly kills the 'same cards everywhere' complaint.
- Five steps (Process): make it genuinely non-card on desktop by using a pinned numeral with a moving hairline progress spine (steal Linear's connecting-line motif) instead of stacked white rounded cards; on mobile, swap the pinned-scroll for a horizontal swipeable step rail with snap points and a segmented-dot progress indicator (steal Shopify's pricing-carousel peek pattern) — sticky/pinned-scroll on desktop genuinely becomes carousel/rail on mobile.
- Stat band: replace the 3-col/2-col rounded-card grid with an Apple/Stripe-style hairline-divided numeral row on desktop; on mobile, use Shopify's pricing-card 'peek carousel' (one stat full width, next one peeking at the edge) instead of a 2-col card grid.
- Skills section: replace the current 3-col card grid ('AI ENGINEERING' box etc.) with Linear's full-bleed feature-panel pattern — each tool category gets its own panel with a small diagram/screenshot and inline chips; horizontal rail on desktop, vertical full-bleed stack on mobile. Answers the owner's 'other ways to display the tech stack' directly.
- Case-study charts: add a Framer-style vertical progress-bar-meter chart (like their LCP/INP/CLS block) as a genuinely new chart type for metrics like Lighthouse scores or CRO confidence — visually distinct from the existing indexed-line/slope/gauge/before-after-bar set, and cheap to build with pure CSS width transitions (no chart library needed, protects the Lighthouse-100 budget).
- Case-study comparisons: add an Apple-Compare-style swipeable 2-up column view for comparing two stores' metrics side by side (with a THIRD store reachable by swipe) — but unlike Apple, include a visible dot/arrow affordance so the hidden column isn't lost (this was an observed real flaw in Apple's own mobile compare tool).
- Shopify work index: keep the text index list (it's already efficient), but move the filter chip row to a horizontal scroll-snap rail on mobile instead of wrapping to multiple lines (steal Airbnb's category-pill treatment).
- Contact section: drop the big rounded-card wrapper; let the giant headline run full-bleed edge-to-edge like Stripe/Vercel do, and consider an Airbnb-style single-pill entry point on mobile ('Send a message ->') that expands into the full contact block, rather than showing everything immediately.
- Experience split (role rail / editorial panel): when it stacks on mobile, follow Stripe's 'hairline divider becomes horizontal rule' pattern, and follow Nike's lead by swapping in a different crop/composition of the placeholder photo for the stacked mobile version instead of just shrinking the desktop one.
- Gallery carousel: since hover-to-flip cannot exist on touch, replace it on mobile with either a tap-to-flip or a slow autoplay crossfade between home/product shots, rather than silently disabling the flip interaction.
- Right-edge scroll-progress dock: it currently survives on mobile as a cramped floating pill competing with the email FAB (seen overlapping in captures) — either hide it below ~768px or convert it into a slim top progress bar, consistent with the 'in-page nav collapses on mobile' pattern seen across every reference site.
- Hero and dense visuals: apply Notion's technique — don't shrink the most detail-dense element (e.g. a full case-study chart) in place on mobile; reorder so a simpler proof point (one headline stat) appears first, and push the dense chart later in the scroll.
- If a layered/collage moment is ever built (e.g. a new Gallery opener), follow Figma's mobile technique of PRUNING layers (show 2 well-composed tiles) rather than shrinking every layer proportionally.
- Consider a CSS/framer-motion-only 'scattered thumbnails' opening moment (inspired by Gionatan Nese '26, without any WebGL) for the Projects index — small project tiles at fixed percentage positions with a subtle parallax float, linearizing into a simple stack only below a defined breakpoint (e.g. under 430px) to avoid the cramped-scatter problem.
- Full-bleed decorative shapes (a scalloped band edge, a soft blob background) are cheap to keep verbatim across breakpoints since they're pure CSS (confirmed by Arc) — use one as a section-divider motif instead of another rounded-card boundary.
## avoid
- Do not replicate any WebGL/3D/canvas hero (Gionatan Nese, Illoca) literally — maxfolio's hard constraint rules out Three.js/WebGL; only borrow the compositional idea and rebuild it in CSS/framer-motion.
- Do not copy entry gates like Pacôme Pertant's 'enter with sound' — they add a click of friction before a recruiter or brand owner sees any content, which actively works against maxfolio's goal of a fast, clear pitch.
- Do not copy geo/consent interstitials that block first paint (Apple's country picker, Nike's location modal, Airbnb's pricing-disclosure sheet) — these are legal/compliance necessities for those companies, not a pattern worth introducing to a portfolio.
- Do not repeat Apple's Compare-tool flaw of truncating a 3rd column off-screen with zero visible affordance (no arrow, no dot, no hint) — any swipeable comparison on maxfolio must show it can be swiped.
- Do not adopt Linear/Framer's very long single-scroll marketing-page length (9,000-14,000+ px in these captures) — maxfolio is a portfolio for busy recruiters/founders, it should stay tighter, not grow to SaaS-homepage length just because the visual patterns are appealing.
- Do not simply delete decorative content on mobile with nothing in its place (Notion drops its margin doodles outright) unless the section still feels intentional afterward — an accidental empty margin reads as unfinished, not minimal.
- Do not keep reskinning every new section as a rounded-gray-card (the exact failure mode already present in maxfolio's stat band, year-by-year, Skills, and Contact) — the whole point of this research is archetype variety, so a new 'card with rounded corners' anywhere should be treated as a smell, not a default.
- Do not let the floating email FAB and the right-edge scroll-progress pill compete for the same mobile screen corner as currently observed — pick one persistent floating element on mobile, not two.

# LENS: experience-timelines-raycast (agent abe9b9cab3b8bd87c)

## Raycast — Changelog — https://www.raycast.com/changelog · live product changelog, active 2026
- **desktop**:
  - Two-column ledger repeated for every release: a narrow LEFT rail carries only a version pill (e.g. 'v2.2') and the date ('September 3, 2026'), the wide RIGHT column carries a dark hero image, a colored H2 ('Bring Your Own Model'), and multi-paragraph prose with inline colored links to the specific features shipped.
  - The pattern repeats dozens of times down one continuous page (confirmed scrolling through v2.2, Inline Emoji Picker, Screen Awareness, AI Chat Notifications, Cloud Sync, AI Message Editing, Content Indexing) — no card borders, no boxes, just hairline-separated blocks.
  - A pill tab-bar at the top switches the whole feed by platform (macOS / Windows / iOS / macOS V1).
- **mobile**:
  - The left rail disappears entirely. The version pill and date collapse into a small horizontal row stacked directly ABOVE the hero image and headline, inline in the same column as the prose — rail-and-column becomes one linear stack.
  - Platform switcher becomes a horizontally scrollable icon-pill row instead of a text tab bar.
- **motion**:
  - Not verified via scroll-linked observation in this capture (no JS timeline probing done) — hero images appear static; treat any parallax/reveal claim as unconfirmed.
- **steal**: For 'Year by year': replace maxfolio's bordered year CARDS with this exact device — a persistent slim date/role marker (year + company chip, no box) sitting to the left of a wide editorial column of prose+screenshot per year; on mobile the marker collapses to an inline chip stacked above that year's block instead of becoming a horizontal-scroll card row. Zero border-radius, zero fill — kills the 'too many cards' complaint outright while keeping strict reverse-chronological scannability.
- screenshots: experience-timelines-raycast-changelog-desktop-top.png | experience-timelines-raycast-changelog-desktop-full.png | experience-timelines-raycast-changelog-mobile-top.png

## swyx.io (Shawn Wang) — https://www.swyx.io/ · personal site, active 2026
- **desktop**:
  - Top third is a dense bento: a bio card (photo, name, one-line bio, location toggle chips 'SG / SF') sits beside two small project-logo cards ('Latent Space', 'AI Engineer') and a tall book-ad card ('The Coding Career Handbook is now free') — three unequal columns, no uniform card grid.
  - Next band, 'Things worth thinking about', is FOUR essay tiles in a single horizontal row with a caption 'Eleven starting points, scroll for the rest' — confirming it's a horizontal-scroll rail, not a wrapped grid, with a small icon + eyebrow number ($01, $02...) per tile.
  - Below that: a 3-column row (Latest writing & appearances / Selected talks / Stay in correspondence), each just a plain hairline-separated LIST, not cards.
  - Then 'The rest of the library' splits into two text columns — 'Popular writing' and 'Popular speaking' — and inside 'Popular speaking' the list is grouped under prose sub-headers by CAREER ERA: 'The modern era:' then 'The JS/Beginner Era:' — literally era-labeled chronological groupings with zero visual chrome, just a heading and a bulleted list with one-line descriptions under each linked title.
  - Final band is 'More recent entries' — a dense two-column ledger table, title left / ISO date (2026-03-08 style) right-aligned, dozens of rows, ordered newest-first.
- **mobile**:
  - The entire bento (bio + project cards + book ad) collapses to ONE stacked column, each element full-width in sequence.
  - The 4-across horizontal scroll-rail of essay tiles stays horizontal-scroll on mobile (same swipeable rail, just narrower viewport showing ~1.2 cards) rather than becoming a vertical list — one of the few sections that keeps its desktop mechanic.
  - The 3-column list row and the 2-column 'Popular writing / Popular speaking' split both fully stack into one long single column, writing above speaking, era-headers preserved as plain text dividers.
  - The dense date-ledger table stays a simple two-line stack per row (title, then date beneath it) instead of a left/right split.
- **motion**:
  - Not scroll-probed in this pass; layout evidence only, no animation claims made.
- **steal**: The 'grouped by career era, zero cards' list under 'Popular speaking' (The modern era / The JS/Beginner Era) is the single best answer to 'other ways to show experience across years' for maxfolio: label each of Max's real career phases (e.g. 'Digitdeck CTO era', 'Freelance Shopify era', 'Learning era') as a plain text sub-header, then list roles/shipped-work underneath as a bulleted, one-line-description list — no boxes, no numerals-as-hero, just typographic hierarchy and grouping.
- screenshots: experience-timelines-swyx-desktop-full.png | experience-timelines-swyx-mobile-full.png

## Wikipedia — infobox + prose (used as a pattern reference, not a portfolio) — https://en.wikipedia.org/wiki/Guillermo_Rauch (redirects to the company article, which is the useful example) · reference pattern, not a competitor site
- **desktop**:
  - Article prose runs full-width on the left (~65%); a fixed-width gray-bordered infobox table FLOATS top-right of the first paragraphs: a bold title row, then a plain key/value table (Formerly, Type, Industry, Founded, Founder, Headquarters, Area served, Key people, Employees, Website) with hairline row dividers, no color, no icons.
  - A left sidebar table-of-contents (History, Architecture, Controversy…) sits pinned far-left, separate from both the prose and the infobox.
- **mobile**:
  - The floated-right infobox becomes a full-width block INSERTED INLINE in the reading flow, right after the opening paragraph and before the 'History' heading — sidebar-float becomes stacked-inline card, same key/value table just full width.
  - The desktop's far-left table-of-contents disappears completely and is replaced by a collapsible 'Contents' hamburger.
- **motion**:
  - None — static reference site, no animation.
- **steal**: For the Skills/Stack section or a compact 'CTO at a glance' moment on Contact/Hero: one small infobox-style key/value table (Role, Based in, Stack, Storefronts shipped, Years) floated beside the opening hero paragraph on desktop, dropping to a full-width inline block right after the h1 on mobile — an instantly-scannable, zero-card way to front-load facts without a stat-band of filled tiles.
- screenshots: experience-timelines-wiki-infobox-desktop-top.png | experience-timelines-wiki-infobox-mobile-top.png

## leerob.com (Lee Robinson) — https://leerob.com/ · personal site, active 2026
- **desktop**:
  - Two-column split: LEFT is bio text with a tab switch ('Bio' / 'Long') and a two-column 'Notes' link list below it; RIGHT is a single tall editorial illustration (no photo, an illustrated cityscape).
  - Below the split, a 'Blogs' section is a plain hairline-divided ledger: title left, publish month+year right-aligned ('July 2026' … 'November 2021'), strictly reverse-chronological, no cards, no thumbnails.
- **mobile**:
  - The bio/illustration split fully stacks: text first, illustration image below it, full-width.
  - The 'Notes' two-column link list collapses to one column.
  - The 'Blogs' ledger keeps title-then-date but drops the date to a second line under the title (right-alignment abandoned) instead of a left/right row — one clear, deliberate mobile-only formatting change.
- **motion**:
  - None observed; static typographic page.
- **steal**: The 'Blogs' ledger's mobile move (right-aligned date row → date drops to its own line beneath the title) is a cheap, honest pattern for maxfolio's Shopify-work index list on mobile: keep title+date pairs but stack them instead of trying to force a left/right row into 390px.
- screenshots: experience-timelines-leerob-desktop-full.png | experience-timelines-leerob-mobile-full.png

## Khanh Nguyen — portfolio — https://khanhnguyen.design/ · Awwwards-listed portfolio, 2026
- **desktop**:
  - CAUTION: the automated full-page capture rendered almost entirely blank white below the hero — this site clearly uses GSAP ScrollTrigger-pinned reveals that never painted during the scripted scroll-and-screenshot pass. I could NOT confirm the desktop layout beyond the hero band (giant serif wordmark 'KHANH NGUYEN', a one-line bio top-right, a 'SCROLL' cue bottom-right).
- **mobile**:
  - Mobile rendered its real content (the mobile browser context apparently doesn't gate the same pinned animation): the page is structured as literal numbered 'CHAPTER I / II / III / IV' section labels in small caps, each introducing a block — Chapter I opens 'THE WORK' with a 'More about me' link; Chapter III lists four numbered work categories (01 Product Design, 02 Digital Experiences, 03 Art Direction, 04 Development), each a big numeral + label + one-line description + a single project photo, stacked full-bleed one after another, no card borders anywhere.
  - Chapter IV closes with plain footer-style contact/social links.
- **motion**:
  - Inferred only from the failed desktop capture and the GSAP/ScrollTrigger convention common to this style of site — NOT independently confirmed; flag as inference, not observation.
- **steal**: The 'numbered Chapter, one big numeral + label + one photo, full-bleed, one at a time' structure is a strong non-card model for maxfolio's 5-step Process section: 'Chapter I / 01 Discovery' instead of a 5-tile card grid — each step gets its own full-bleed band with a giant numeral, not a bordered box.
- screenshots: experience-timelines-khanhnguyen-desktop-top.png | experience-timelines-khanhnguyen-mobile-full.png

## basement.studio — https://basement.studio/ · agency site, active 2026
- **desktop**:
  - 'Trusted by Visionaries' client-logo band is a DENSE, evenly-gridded wall of ~30 logo tiles (6 columns × 5 rows), each a plain hairline-bordered cell with just a wordmark/logo — no marquee scroll, a static grid instead.
  - 'Featured Projects' is a vertically stacked full-bleed list: giant project video/still, title top-right, one-line description, tag row underneath — one project at a time, no side-by-side cards.
  - Closes on a giant condensed wordmark band 'BSMNT.26' filling the full viewport width before the footer.
- **mobile**:
  - The logo wall drops from 6 columns to 2 columns, same static grid device, just far taller (many more rows) — logos keep their tile treatment rather than switching to a marquee.
  - The full-bleed project list keeps the same one-at-a-time stacked structure, just narrower — no structural change there.
  - The giant 'BSMNT.26' wordmark band shrinks its type but keeps full-bleed treatment.
- **motion**:
  - Not scroll-probed; static screenshots only, no animation claims.
- **steal**: For the 'Now / fleet marquee' band: an evenly gridded, static wall of the 19-store logos (not a scrolling ticker) is a legitimate, calmer alternative archetype — but note G3 already wants a marquee/ticker archetype present somewhere, so use this grid idea only if swapping which section owns the marquee slot.
- screenshots: experience-timelines-basement-desktop-full.png | experience-timelines-basement-mobile-full.png

## cassidoo.co (Cassidy Williams) — https://cassidoo.co/ · personal site, active 2026
- **desktop**:
  - Single centered column even at 1440px (roughly 640px measure) — header is name + role + circular photo side by side, then a plain text nav row, then bio prose, then a 'recent posts' list: title (linked, underlined) + date on the same line, one-line description beneath, then inline hashtag chips (#events, #learning) — repeated ~5 times, newest first.
  - Footer is a plain 'View posts by tag' hashtag cloud, all inline text links, no chips-as-buttons styling beyond simple color.
- **mobile**:
  - No structural change at all — same single centered column, same list, just reflows narrower; title+date that shared a line on desktop wraps to two lines on mobile instead of any deliberate stacking choice.
  - This is the control case: proof that a personal site can legitimately do almost nothing differently on mobile because it never used a multi-column layout to begin with.
- **motion**:
  - None; plain static text site, monospace-leaning type.
- **steal**: Not a steal for structure, but a useful calibration data-point: hashtag-style tags inline after a one-line post description (not as bordered pills) is a lightweight way to show 'what kind of year/work this was' without adding another card treatment.
- screenshots: experience-timelines-cassidoo-desktop-full.png | experience-timelines-cassidoo-mobile-full.png

## De Ruien (Antwerp underground rivers heritage site) — https://en.ruien.be/ · Awwwards-tagged 'horizontal scrolling timeline', 2026 tag
- **desktop**:
  - IMPORTANT CAVEAT: the specific award-tagged 'horizontal scrolling timeline' component lives behind a deep-link anchor (#1250 = year 1250) that a cookie-consent modal blocked from firing during automated capture, so I could NOT see the actual year-scrubber mechanic — only the general homepage.
  - What I could confirm: a full-bleed illustrated parallax hero (flat-illustration city skyline in teal, giant serif wordmark overlaid), followed by full-bleed editorial bands mixing illustration and real underground-tunnel photography with short punchy headlines ('Secrets flow under the city', 'We take you on a special walk in the underbelly of Antwerp'), closing on a 'Back in time' CTA band with a dark overlay and a 'Visit The Ruien' two-option split (In group / As an individual).
- **mobile**:
  - Same full-bleed illustrated-hero-then-photo-bands structure, single column, no visible restructuring beyond narrower images — could not evaluate the timeline-specific mobile behavior because the timeline component itself never loaded.
- **motion**:
  - Not observed — blocked by the cookie wall before the relevant component rendered. Treat this site's 'timeline' claim as unverified in this pass; the Awwwards tag is real but I have no first-hand screenshot of the mechanic.
- **steal**: Even without seeing the year-scrubber itself, the surrounding pattern is worth taking: pairing illustrated silhouette imagery with real photography in alternating full-bleed bands, each with a two-to-four-word punch headline, is a strong 'editorial full-bleed' treatment for a 'Year by year' retrospective that wants texture beyond plain typography.
- screenshots: experience-timelines-deruien-desktop-full.png | experience-timelines-deruien-mobile-top.png

## samuelkraft.com — https://www.samuelkraft.com/ · personal site, active 2026
- **desktop**:
  - Single centered column, roughly 640px measure, at full 1440px viewport — deliberately does NOT use the extra width, everything stays narrow and centered.
  - Bio paragraph up top, then a vertical stack of ~9 dark, rounded-corner project thumbnails (app icons or screenshots on near-black backgrounds), each with a title + one-line caption beneath, one per row, no side-by-side grid.
  - Closes with a 'Posts' ledger: title left, date right-aligned ('10 Dec 2025'), 4 rows plus a 'See all' link — same device as leerob's Blogs list.
- **mobile**:
  - Zero structural change — the desktop layout was already mobile-width-equivalent (narrow centered column), so mobile is pixel-for-pixel the same pattern just full-viewport-width instead of centered-with-margins.
  - This is a second control case showing that 'design for mobile efficiency' doesn't always mean a different pattern per breakpoint — sometimes it means never over-widening on desktop in the first place.
- **motion**:
  - Not observed; static screenshots only.
- **steal**: Not a structural steal, but a useful counter-example to cite to the owner: a narrow, centered, single-column 'zine' layout is itself a valid archetype distinct from split/grid/editorial-full-bleed, and it happens to solve mobile-efficiency for free.
- screenshots: experience-timelines-samuelkraft-desktop-full.png | experience-timelines-samuelkraft-mobile-full.png

## ideas
- Kill the 'Year by year' bordered-card grid entirely. Replace with the Raycast-changelog device: a slim, unboxed year+role marker on the left (e.g. '2026 — CTO & Shopify Tech Lead') paired with a wide editorial column of 2-3 sentences + one supporting screenshot per year, separated only by hairlines — never a filled card.
- On mobile, that same year section should NOT become a horizontal-scroll row of cards (what it does today, per the maxfolio-current-mobile-full.png capture) — collapse the left marker into a small inline chip stacked directly above each year's paragraph block, exactly like Raycast's mobile changelog. This alone kills the '5 identical horizontal cards' complaint and gives mobile a genuinely different, more scannable structure than desktop.
- Steal swyx.io's 'career eras' grouping for a NEW top-of-page or Experience-adjacent moment: 3-4 plain text sub-headers ('Freelance era', 'Digitdeck founding era', 'CTO era') each followed by a short bulleted list of what shipped that era, zero cards, zero numerals-as-hero — pure typographic hierarchy. This directly answers the 'new ways to show experience across years' ask without inventing a single new UI widget.
- Rebuild the 5-step Process section around khanhnguyen.design's mobile pattern: 'Chapter I / 01 Discovery' as a full-bleed band per step (giant numeral, label, one line, one supporting image), stacked one at a time — this is a 'sticky/pinned scroll' or plain 'narrative-with-inline-chips' archetype, either way it's the opposite of the current 5-tile card row and satisfies the owner's explicit ask for a clearer non-card Process layout.
- Add a compact Wikipedia-style infobox next to the hero or inside Contact: a plain key/value table (Role, Based in, Stack, Storefronts shipped since, Years active) floated right of the opening paragraph on desktop, dropping to a full-width inline block right after the H1 on mobile. This gives recruiters an instant scan without another stat-band of filled tiles.
- For the stat band specifically: drop the filled rounded-rect background on every numeral (visible in maxfolio-current-desktop-top.png) and go back to the theme's own stated pattern — 'numerals on hairlines' — no fill at all, just a hairline rule above/below each stat, closer to the infobox's plain key/value rows than to a card.
- Use samuelkraft.com's and cassidoo.co's 'ledger with date' device (title left, date right, one-line description, optional hashtags) for the Shopify-work index list's mobile view specifically: instead of the current card-ish rows, drop to title+tags on one line, date on the next — same content, less chrome.
- Borrow De Ruien's alternating illustrated-silhouette / real-photography full-bleed band idea for a 'then vs now' moment inside Year-by-year — e.g. an early flat illustration/sketch of Max's first freelance setup vs a real photo of the current Digitdeck setup, each full-bleed with a 3-4 word headline, giving the timeline visual texture instead of only typography.
- Basement.studio's static, evenly-gridded logo wall (6 cols desktop -> 2 cols mobile, no scroll) is a legitimate alternative to a scrolling marquee for the 'Now + fleet' band — but only use it if the marquee/ticker archetype requirement (G3) is satisfied elsewhere on the page, e.g. by a ticker of stats or client names in the footer.
- For the tech-stack ('What I work with') section: replace the current six-category prose-chip layout with an infobox-adjacent 'stack ledger' — one row per category (Frontend / Backend / Testing / Infra), category name left, tool chips right-aligned inline, hairline-separated rows, no card container — visually related to but distinct from the year ledger so it doesn't repeat the same archetype twice in a row (G3 compliance).
- Give the 'Five years, one direction' headline literal teeth: instead of a subhead promising direction, add ONE inline sparkline-style rule (a thin horizontal line with small tick marks at each year, no chart library, pure CSS/SVG) running behind the year markers — a lightweight nod to 'career as chart' without needing Recharts or any new dependency, keeping Lighthouse 100 intact.
- Test a 'currently' status line near the top of Experience (styled like swyx.io's 'CURRENTLY CAUSING INTERESTING TROUBLE' eyebrow) — one honest, present-tense sentence about what Max is doing right now at Digitdeck, reinforcing the CTA without another card.
- Consider a compact 'era switch' control (segmented control: Freelance / Digitdeck / Platform) that filters the same flat, unboxed year ledger rather than three separate cramped panels — satisfies 'sections that completely change on mobile' by making the control itself the thing that adapts (tabs on desktop -> a native-feeling bottom sheet or accordion on mobile).
- Wherever a numeral is used as a section's hero device (stat band, year band), standardize on the infobox's restraint: black text, no color fill, no card background — let hairlines and whitespace do the separating work; this is the throughline that ties Wikipedia-infobox, Raycast-changelog, and swyx-ledger together and is the most repeatable fix across the whole page.
## avoid
- Do not literally clone Persona Studio's isometric-3D-city navigation (fun but WebGL-heavy, off-brief for a CTO/CRO-consulting audience, and violates the no-WebGL/Three constraint).
- Do not chase De Ruien's actual WebGL/particle horizontal timeline mechanic even if you find a way to see it later — it's built with cookie-gated deep-link anchors and (per its Awwwards tag) WebGL/particles, both against the Lighthouse-100 / no-WebGL constraint.
- Do not copy Awwwards-style portfolios (gionatannese.com, aquirin.com, huyml.co) that rely on GSAP-pinned scroll sequences that render blank without careful JS — several of these failed to paint at all in a standard headless capture, which is itself a warning sign for real-world crawlability, SEO, and first-paint performance on a page that needs Lighthouse 100.
- Do not adopt cleverfranke.com's full-bleed animated blob hero with a cookie banner overlapping the headline — a real usability miss (the cookie banner covers the CTA text) worth avoiding even as inspiration.
- Do not use khanhnguyen.design's numbered-chapter idea with GSAP ScrollTrigger pinning exactly as built — recreate the VISUAL result (giant numeral, one at a time, full-bleed) with plain CSS scroll-snap or simple opacity/transform-on-scroll, never pinned WebGL/GSAP-timeline choreography, to stay inside the framer-motion + CSS constraint.
- Do not invent fake 'skill percentages' the way adhamdannaway.com does (Figma 95%, Calisthenics 40%) for anything that reads as a real credential — that device only works there because it's explicitly self-deprecating humor; on a page selling CRO consulting to DTC owners, any invented number is a credibility risk and conflicts with the hard 'no invented numbers' constraint.
- Do not let the 'grouped by era' text list (swyx.io) sprawl into an undifferentiated wall of bullets — it works there because each entry still has a bold linked title; keep entries short and titled, not paragraph-dense, or it stops being scannable on mobile.
- Do not replicate cassidoo.co's/samuelkraft.com's 'no mobile change at all' approach as the ANSWER to the mobile-efficiency ask — it's a valid pattern for a text-only zine site, but the owner explicitly wants sections that completely change on mobile, so reserve this move (if used at all) for a section that's already minimal enough not to need one.

# LENS: process-sections (agent aade063e56e88de6a)

## Instrument — https://www.instrument.com/services · Campaign US 'Design Studio Agency of the Year 2026' (banner on homepage)
- **desktop**:
  - Homepage: giant duotone wordmark hero that mask-reveals a second color band on scroll, then a 2-up autoplay video split (client work), then a filterable work grid (chips: All/Brand/Marketing/Product), then a giant pale-gray serif pull-quote ('Shape / A better Future.') that overlaps two lines, then a press/news grid.
  - /services page: each offering (Brand, Marketing, Product) gets its OWN near-full-viewport editorial band on a moody duotone-tinted background (purple->plum->near-black progression down the page) — big serif category word on the left ~1/3, 2-line description + pill 'LEARN MORE' button, and 1-2 real case-study images on the right that alternate size/position per band.
  - No dedicated numbered 'process' ladder found on homepage or /services; process/method info is folded into these offering bands instead of a discrete stepper.
- **mobile**:
  - Not deeply verified section-by-section on mobile for /services (time-boxed), but the homepage hero and pull-quote type scale down proportionally and the work grid becomes a single column; the cookie banner is the main mobile friction point (covers CTA row).
- **motion**:
  - Hero wordmark cross-fades/masks into a second duotone copy on scroll (observed: two overlapping 'INSTRUMENT' wordmarks at different scroll offsets, one lavender-tinted)
  - Homepage video tiles autoplay muted with a visible pause control
- **steal**: For a 'What I do' or expanded Experience overview, use Instrument's alternating full-height editorial band per offering: one huge serif category word + 2-line description + pill CTA on one side, one real screenshot on the other, background tint shifting per band — this replaces a flat services list with something that reads as five distinct 'chapters' instead of one more split-50/50 clone of the Experience section.
- screenshots: process-sections-instrument-desktop-q0.png | process-sections-instrument-services-q1.png | process-sections-instrument-services-q2.png | process-sections-instrument-services-q3.png | process-sections-instrument-desktop-q3.png

## Ramotion — https://www.ramotion.com/process/ · current (accessed 2026-09-07)
- **desktop**:
  - Homepage: hero + logo wall of clients + case-study tiles (Rizzle, Firefox, Clearbit, Turo...) laid out as an irregular masonry-ish grid on tilted background swatches, then an editorial headline ('At the intersection of product and brand'), then a RADIAL SERVICES CLUSTER: dashed concentric arcs with pill tags ('brand strategy', 'ui/ux design', 'web design', 'web app development' highlighted in black; 'pr campaigns', 'gtm strategy', 'smm' etc. grayed-out/inactive) fanning under 'Brand' and 'Product' column headers, then a testimonial carousel ('What our partners say', 1/11 with arrows).
  - Dedicated /process/ page: a giant black hero titled 'Process' with intro copy, then THREE separate named methodologies stacked (Branding Funnel Process, Branding Process for Startups, Web & Product Design Process), each rendered as a FLAT GRAY ACCORDION list of 8-14 'Stage N: ...' rows (plus/minus toggles), all visually identical gray bars — no imagery, no numerals, no color coding between stages.
- **mobile**:
  - Homepage radial services cluster: the SAME absolute-positioned arcs/pills are just scaled down — pill labels get clipped/truncated at the 390px edges ('web app dev', 'roductions', 'sign') because it wasn't rebuilt for narrow width, just shrunk.
  - /process/ accordion: literally NO transformation — same full-width flat gray 'Stage N' bars stacked, just narrower. This is the 'avoid' case: a long text list that reads exactly as tedious on mobile as desktop.
- **motion**:
  - Accordion rows expand/collapse on click (+/- icon flips)
  - Testimonial carousel has manual prev/next arrows, no visible autoplay
- **steal**: The homepage's radial/orbital services cluster (dashed concentric arcs fanning out from a center point, active pills in solid black vs. inactive pills ghosted gray) is a genuinely different way to show a tech-stack or skills taxonomy than chips-in-a-row or a card grid — steal the CONCEPT (arcs + active/inactive pill contrast) but rebuild it to actually reflow on mobile instead of just scaling.
- screenshots: process-sections-ramotion-desktop-q4.png | process-sections-ramotion-mobile-q3.png | process-sections-ramotion-processpage-desktop-q0.png | process-sections-ramotion-processpage-desktop-q1.png | process-sections-ramotion-processpage-mobile-q1.png

## Cluma — https://cluma.design/ · 2026 (self-badged 'Award Winning Design Agency' on hero; SaaS design-subscription agency)
- **desktop**:
  - Hero: playful headline ('Monsters under your bed? Sleep easy.') over a gradient, plush monster mascots at the bottom, an orange 'Award Winning' badge top-right.
  - 'A senior-led process' section: NOT a card grid — a single wide scene per step: full-bleed photo top-right, a GIANT outlined numeral ('01') bottom-left next to a 3-line headline ('A senior-led process that keeps moving.'), a thin hairline rule above it, and round prev/next arrow buttons to step through — one step visible at a time, not five at once.
  - Elsewhere: services shown as big single-column full-bleed photo blocks (eyebrow label + heading + 1-line description + 'Explore' link) rather than a tight card grid — each 'card' is closer to a full editorial slide.
- **mobile**:
  - The process stepper keeps the exact same idea stacked: full-width photo, then a row with the giant '01' numeral beside the (now 3-line) headline, then the same round prev/next arrows below — a clean 1:1 translation, no clipping.
  - The full-bleed service blocks go from side-by-side-ish desktop rhythm to one full-height block per screen, each still eyebrow+heading+description+link — no card chrome added for mobile.
- **motion**:
  - Prev/next arrows imply a manual step-through (not autoplay) for the process section — could not confirm easing/transition without interacting live
- **steal**: Replace maxfolio's 5-equal-width-card 'Five steps, no surprises' row with Cluma's one-step-at-a-time scene: giant ghost numeral + short headline + one supporting image, stepped via arrows (or scroll-linked snap) instead of showing all 5 cards flattened side by side — it's the same content, presented as a sequence instead of a wall.
- screenshots: process-sections-cluma-desktop-q3.png | process-sections-cluma-mobile-q2.png | process-sections-cluma-mobile-q3.png | process-sections-cluma-desktop-q0.png

## fahrenheit (Web-Strategen) — https://fahrenheit.ch/ · 2026 (found via Awwwards agency inspiration search, not in exclusion list)
- **desktop**:
  - German-language Swiss web agency. Hero: large serif headline over an abstract folded-ribbon orange graphic, short intro paragraph, one outlined CTA button.
  - Case-study strip: alternating image/caption pairs with small pill tags under each ('WordPress-Theme', 'Programmierung', etc.), a big serif mission statement, then a rotated vertical eyebrow label ('Webagentur Services').
  - SERVICES LEDGER (the key find): a full-bleed 4-COLUMN layout divided by thin vertical hairlines. Each column has a HUGE outlined ghost numeral (1, 2, 3, 4) as background texture, a bold all-caps category title (WEBDESIGN / WORDPRESS / SEO / WEB-APPLIKATIONEN), and a short list of specific sub-services in caps underneath. A large serif quote ('Match? Cool, freu uns!...') overlaps the middle two columns, breaking the grid intentionally.
- **mobile**:
  - The 4-column ledger becomes a FULL VERTICAL STACK of the same blocks in order — each block keeps its own giant ghost numeral + bold caps category + wrapped inline sub-service list, just one full-width column instead of four side by side. No card chrome added; the 'blueprint' feel survives the breakpoint change intact.
- **motion**:
  - Not confirmed live (static capture only); layout suggests the ghost numerals and hairline dividers are prime candidates for scroll-reveal/fade-in given the print-ledger aesthetic
- **steal**: This is the clearest 'FIG_01 blueprint' pattern in the set: vertical hairline columns + oversized ghost numerals + bold caps category + tight caps sub-list. Use this exact structure for maxfolio's Skills/stack section instead of six prose sentences with inline chips — e.g. columns for 'SHOPIFY', 'FRONTEND', 'BACKEND/DATA', 'TOOLING', each with a giant ghost numeral and a caps list of real tools (Liquid, React, Remix, PostgreSQL, Playwright, etc.) — and it already has a proven, non-card mobile fallback (stack in order).
- screenshots: process-sections-fahrenheit-desktop-q4.png | process-sections-fahrenheit-mobile-q4.png | process-sections-fahrenheit-mobile-q3.png | process-sections-fahrenheit-desktop-q0.png

## Displace — https://displace.agency/ · 2026 (Awwwards agency inspiration search, not in exclusion list)
- **desktop**:
  - Entire homepage is styled as a fake macOS desktop: a menu bar (traffic-light dots, 'File Edit Explore Window Help'), a left Finder-style sidebar with nav items 'Overview / Work / Features / Commerce / Process / Investment / Start', a live-looking clock/weather widget, desktop icons, and a Dock at the bottom. The actual homepage COPY (Shopify engineering agency pitch, stat row, tool-badge pills, a 'selected project' window) sits inside this desktop chrome as if it were an open app window.
- **mobile**:
  - Not captured — the OS-desktop metaphor is unlikely to survive narrow viewports gracefully and was not verified
- **motion**:
  - Sidebar items appear to be client-side routed panels inside the fixed-size 'window' rather than real page navigations
- **steal**: The desktop-OS METAPHOR (Finder sidebar as nav, one nav item literally labeled 'Process') is a novel way to frame 'long/bulky info' as an explorable app rather than a scrolling page — worth borrowing the METAPHOR (windowed panel, sidebar-as-index) for a small self-contained module (e.g. a 'peek inside my toolkit' widget), not as primary site navigation.
- screenshots: process-sections-displace-desktop-top.png

## Metalab — https://www.metalab.com/ · current (accessed 2026-09-07)
- **desktop**:
  - Homepage renders as a SINGLE full-viewport hero and nothing else: giant serif wordmark ('We Make Interfaces') with a tall rounded rectangle of an iridescent liquid-metal animation overlapping the text, 'EST. 2006' label, no visible nav beyond the hero, no scroll cue found in the captured height (document height equalled the viewport height, 900px).
- **mobile**:
  - Same single-hero-only behavior at 390px — content does not extend past the first screen in this capture
- **motion**:
  - The liquid-metal texture inside the rounded rectangle appears to be an animated/video texture (shifting highlights across two captures taken seconds apart)
- **steal**: N/A — flagged as a caution, not a steal (see avoid list)
- screenshots: process-sections-metalab-desktop-top.png | process-sections-metalab-mobile-top.png

## ideas
- BASELINE FACT (captured live from maxfolio.dev, desktop 1440): the current 'Five steps, no surprises' Process section is exactly the flat 5-equal-card row the owner is complaining about — five identical white rounded cards side by side, each with a black circle numeral, bold title and one paragraph, separated by thin vertical dividers. Screenshot: process-sections-maxfolio-desktop-q6.png. This directly confirms the brief's complaint and is the section to redesign first.
- BASELINE FACT: mobile ALREADY does better than desktop for Process — it renders as a vertical rail with a progress dot (solid blue = current step, hollow gray = others) and includes an extra 'You get: ...' outcome line per step that the desktop cards drop entirely. Screenshots: process-sections-maxfolio-mobile-p0.png / p1.png. Don't throw this away — animate and upgrade it, and bring its 'You get' line to desktop too.
- BASELINE FACT: 'Year by year' is also a card carousel on desktop (dot pagination + prev/next arrows, boxed white cards) but on MOBILE it already drops the card chrome for a plain hairline-divided stack (big year numeral, thin rule, role list) — screenshots process-sections-maxfolio-desktop-q3/q4.png vs process-sections-maxfolio-mobile-q1/q2.png. Recommendation: bring the mobile hairline treatment to desktop instead of the card carousel, then add a genuinely different desktop-only enhancement (horizontal scroll-linked year scrubber) rather than keeping two different-but-still-card-ish patterns.
- Rebuild Process as a one-scene-at-a-time stepper (steal from Cluma): giant outlined numeral + short headline + one supporting image/diagram, advanced by scroll-snap or arrows, with the numeral pinned/sticky while the text content crossfades underneath it — this literally is the 'sticky/pinned scroll with a pinned numeral' the brief already asked for but the live build never actually implemented.
- Rebuild the Skills/tech-stack section as a Fahrenheit-style blueprint ledger: vertical hairline columns, oversized ghost numerals (01/02/03/04) as background texture, bold caps category labels (SHOPIFY, FRONTEND, DATA/BACKEND, TOOLING/QA) each with a tight caps list of real tool names — replaces the current six-prose-sentences-with-inline-chips with something scannable in 3 seconds, and has a proven graceful mobile fallback (stack the same blocks vertically, keep the ghost numerals).
- For a secondary services/skills view, borrow Ramotion's radial arc-cluster (dashed concentric arcs, active pills solid vs. inactive pills ghosted) as an alternate 'map' of capabilities — but actually rebuild the mobile layout instead of naively scaling it down (Ramotion's own mobile version clips pill text at the edges — an explicit thing to avoid replicating).
- Give the Experience section's 'What shipped' content an Instrument-style alternating full-height treatment for a few flagship engagements: giant serif category word + 2-line description + pill CTA on one side, a real screenshot on the other, alternating left/right with a shifting background tint per row — visually distinct from the existing role-rail-plus-panel split so it doesn't read as a third copy of the same split-50/50 archetype.
- Add a consistent 'FIG. 01' / 'FIG. 02' caption-style micro-label to any diagram-like section (stack ledger, process stepper, year timeline) to unify them under one 'editorial technical drawing' visual voice — cheap to add, makes the site feel authored rather than templated.
- Turn the pinned numeral in the new Process stepper into the literal fixed/sticky element while only the surrounding card content changes — CSS position:sticky + opacity/transform crossfade on the text block satisfies the Lighthouse-100/no-WebGL constraint while still feeling 'dynamic'.
- Steal Cluma's plain-English, slightly playful headline voice for Process step titles/subheads (their hero: 'Monsters under your bed? Sleep easy.') to sharpen maxfolio's current fairly dry labels ('Discovery', 'Pattern map'...) into something with more personality without losing clarity for a CRO-buyer audience.
- Where a numbered sequence needs an optional deeper layer (e.g. 'see the full 14-point checklist for QA'), keep the primary view visual/short and put the exhaustive detail behind a single 'expand' — do NOT default to Ramotion's wall-of-14-identical-gray-accordion-rows pattern, which reads as bureaucratic homework and (confirmed) does not transform at all on mobile.
- None of Basic/Dept, Clay, or the (mis-resolved) rally.co homepage showed a distinct, well-designed process section at all — process info was either absent or folded into an About paragraph. Take this as evidence that a strong, dedicated Process section is itself a differentiator worth investing real design effort in, not a section to minimize.
- For mobile-specific transformation credit: confirm every redesigned section follows the pattern already proven twice on the live site (Process's card-row -> vertical rail-with-dot; Year-by-year's card-carousel -> hairline stack) — i.e., the house move for 'this must completely change on mobile' should usually be 'drop the card/carousel chrome for a plain hairline vertical rhythm with a persistent progress indicator', since that's already working well on this exact site today.
- Consider a compact 'macOS window' easter-egg module (inspired by Displace, used sparingly) for something self-contained like 'peek at my toolchain' — a single small draggable-looking window with a fake title bar, NOT the whole site's navigation, to avoid Displace's real flaw: content that 404s on direct load/refresh because it's not truly linkable.
## avoid
- Ramotion's dedicated /process/ page: a 40+ row, three-methodology, flat gray accordion ('Stage 1' through 'Stage 14', repeated for three process types) with zero visual differentiation between rows and literally NO mobile transformation (same full-width accordion, just narrower) — reads as compliance documentation, not craft.
- Metalab's current homepage: a single full-viewport hero (liquid-metal animated blob + wordmark) with nothing else reachable in the captured page height on desktop OR mobile — reads as unfinished/broken on first load; also would violate the no-WebGL/Lighthouse-100 constraint if replicated literally.
- Displace's fake-desktop-OS content panels break under direct navigation (guessed URLs like /process and /how-we-work both 404, and clicking the sidebar's 'How We Work' item from a fresh load triggered a client-side crash/'This page couldn't load' error in testing) — never hide primary content behind non-linkable, fragile client-side-only routing.
- Ramotion's homepage radial services cluster on mobile: the exact same absolute-positioned arcs/pills as desktop just scaled down, causing pill text to clip at the 390px edges ('web app dev', 'roductions') — a caution against 'shrink the desktop layout' as a substitute for an actual mobile redesign.
- Rally.co (as referenced in the source agency list) actually resolves to a bus-rideshare-to-concerts consumer product, not a design agency — flagging so it isn't cited as an agency process reference; no usable process-section pattern was found there for this brief.
- Confirmed on maxfolio.dev itself: a flat, equal-width 5-card grid for a 5-step process (no pinned numeral, no scroll-driven change at rest) and a boxed-card carousel-with-dots for a chronological timeline are both live today and are the exact 'too much information in cards' pattern the owner is asking to move away from — do not carry either forward unchanged into the redesign.

# LENS: galleries-2026 (agent a6cadad0f308c879b)

## Khanh Nguyen — Folio Edition — https://khanhnguyen.design/ · ©2026, listed on Siteinspire 5 days ago
- **desktop**:
  - Hero: giant overlapping serif wordmark 'KHANH NGUYEN' cropped top-to-bottom; a thin vertical sidebar running the full left edge holds rotated text ('FOLIO — EDITION', rotated name mark, '© 2026') like a book spine; hamburger icon replaces a normal nav row entirely.
  - Body is structured as literal 'chapters': full-bleed photographic/textured panels slide apart like diptych doors between chapter title cards ('CHAPTER III', 'CHAPTER IV' in huge serif on a dark stone/wood photo).
  - Inside a chapter, services appear as numbered full-bleed panels (01/02/03/04) — each discipline name (ART DIRECTION, DEVELOPMENT) is overlaid on a photo where the discipline is depicted in-scene (a plaque on a wall, a laptop showing a live site on a table), with one caption line beneath each panel.
  - CTA is a plain text link with an arrow ('More about me →'), no button chrome anywhere observed.
- **mobile**:
  - The always-visible rotated sidebar labels collapse behind the hamburger icon (top-left), leaving just the icon + the stacked two-line wordmark and a slim vertical rule.
- **motion**:
  - Chapter panels appear to slide/pan horizontally like opening doors as you progress (inferred from two adjacent scroll captures showing the same photo at different crop/scroll positions with a new chapter numeral sliding in).
- **steal**: Turn 'Year by year' into full-bleed CHAPTER panels: each career era gets one full-bleed textured/photo panel with a giant roman-numeral heading that slides open like a diptych door into the next era, instead of a hairline-timeline list of numerals.
- screenshots: galleries-2026-khanhnguyen-desktop-top.png | galleries-2026-khanhnguyen-desktop-y6000.png | galleries-2026-khanhnguyen-desktop-y8000.png | galleries-2026-khanhnguyen-mobile-top.png

## Eugene Sokolovski — https://sokolovski.pro/ · current, Awwwards-jury badge shown on page
- **desktop**:
  - Header band: avatar+name, one-line positioning, then loose text columns (What I design / Services list) plus an 'Awwwards jury' widget with dot-carousel — no card borders anywhere, just plain text columns.
  - 'Фрагменты' (Fragments) section: 343 raw thumbnails of wildly different aspect ratios (square, tall poster, wide banner) placed edge-to-edge with small gutters — a true masonry contact-sheet with zero card chrome (no border/shadow/label).
  - 'Кейсы' (Cases) index: numbered rows, each a big 2-col layout — large device/browser screenshot left, project name + 1-line description + literal ribbon-icon award badges (colored ribbon SVGs with counts) + a pill CTA ('View case') right.
  - A process/approach moment renders as a converging-V line diagram: two thin diagonal lines meeting at a dot, labeled with one step name + description ('Frontend — to match mocks 100%'), repeating per step scrolled.
  - A literal comparison table for awards: columns for award name / abbreviation / description / count, plain rows with hairlines.
- **mobile**:
  - Header condenses to a slim bar (avatar+name, hamburger); the varied-aspect-ratio Fragments masonry compresses into a tighter, more uniform small-tile grid.
- **motion**:
  - Dot-carousel cycles the awards widget; ribbon badges appear to be hover/reveal elements.
- **steal**: Rebuild the 'Process' 5-step section as a converging-line schematic (thin diagonal connector lines meeting each numbered step label as you scroll) instead of the pinned-numeral card stepper — and consider a raw contact-sheet masonry (no card chrome, mixed real aspect ratios) as an alternate dense entry point into the Shopify work.
- screenshots: galleries-2026-sokolovski-desktop-top.png | galleries-2026-sokolovski-desktop-y3600.png | galleries-2026-sokolovski-desktop-y7200.png | galleries-2026-sokolovski-desktop-y9000.png | galleries-2026-sokolovski-mobile-top.png

## Abhay Singh — https://www.abhaysingh.in/ · current
- **desktop**:
  - Hero: pill-shaped floating nav (name+logo, Email, Instagram icon) above a centered hand-drawn line-art icon, a bold 2-line headline ('Design rescue for noteworthy brands'), one paragraph of bio copy, and a plain pill 'See ↓' scroll cue.
  - Case index is NOT small cards: each project is a full-viewport-width saturated color block (navy, lavender, burnt orange) holding a large real product photo, project name, one sentence, and a pill 'Case study' link; the quantified result line sits OUTSIDE the color block in small gray caption text below it.
  - Two smaller projects appear as a 2-up row (the only card-like moment), still full-bleed photography with overlaid text.
  - Personal section: 'Intuition is underrated' headline + a real photo of the person + 3 short bio paragraphs with plain inline text links, then a hand-drawn icon before the closing 'Send project enquiries' email pill.
- **mobile**:
  - Same full-bleed saturated color blocks stack full-width (never shrink into a card), same off-block gray result caption pattern preserved.
- **motion**:
  - Hand-drawn icon accents (peace hand, fist bump) read as if line-drawn/animated-in; no aggressive page transitions observed.
- **steal**: Rebuild the Shopify case-study reveal as one full-bleed saturated color panel per store (real product photo, store name, one sentence) with the 'Sample data' quantified line placed OUTSIDE the panel in small gray caption text underneath — turns honesty-labeling into a structural habit, not just a footnote.
- screenshots: galleries-2026-abhaysingh-desktop-top.png | galleries-2026-abhaysingh-desktop-full.png | galleries-2026-abhaysingh-mobile-top.png

## Robert Feasley — https://rfeasley.io/ · current
- **desktop**:
  - Split 50/50 hero: left is plain background with 'Robert Feasley / Work' stacked; center is a real iPhone device frame showing an actual app UI screen (fitness app, then a 'Readiness score 89' blue screen moments later); far right holds a 2-line editorial statement ('Language is the interface. / I design systems that shape how products communicate.') in a distinct, smaller type size than the device.
  - Tiny gray credit line under the hero: 'Built with Claude · Codex · Vercel'.
- **mobile**:
  - Hero strips down to name + one tagline line + a plain arrow-down cue; the device mockup and split layout drop below the fold rather than resizing in place.
- **motion**:
  - The phone bezel's screen content changed between two captures seconds apart (a fitness card → a 'Readiness score 89' screen) — an in-place content swap inside the device frame, not a page-level transition.
- **steal**: Show real product/UI in an actual device bezel instead of an abstract line chart for at least one case study — a phone frame mid-interaction with the 'sample data' label literally inside the mock screen, paired with a short 2-line mission statement in a contrasting, smaller typeface off to the side.
- screenshots: galleries-2026-rfeasley-desktop-top.png | galleries-2026-rfeasley-desktop-y0.png | galleries-2026-rfeasley-mobile-top.png

## Jordan Robson (Panconesi — Facets case) — https://jordandrobson.com/ · current
- **desktop**:
  - A literal film-strip metaphor: a horizontal strip of small thumbnail frames runs across the very top like a contact strip/timeline scrubber.
  - Below it, an asymmetric grid of full-bleed photo/video tiles at different sizes, each with its own small 'OFF' toggle pill in the corner (reads like per-scene annotation/lighting toggles from a video editor).
  - A persistent bottom bar holds the project title + a running timecode ('00:03:07', later '00:03:53', '00:03:99'), a Credits link, category tabs (Editorial/Advertising), and the name.
- **mobile**:
  - The asymmetric grid COLLAPSES into a single full-width column of large stacked images; each still carries its numbered label (1.1, 1.2...) and its 'OFF' toggle pill, and the bottom bar (title/timecode/credits/tabs) persists as a slim fixed footer — the interactive chrome survives even though the grid itself becomes a plain vertical scroll.
- **motion**:
  - The on-screen timecode advances across captures, implying a running counter tied to scroll/hover/interaction rather than a static label.
- **steal**: For the Gallery section, replace the 3D-tilt carousel with a 'film strip' concept: a slim persistent bottom bar (project/store title, a real running counter, category tabs) over a stack of full-bleed images each carrying a tiny numbered tag instead of a card caption — collapses cleanly to one column on mobile without losing the chrome.
- screenshots: galleries-2026-jordanrobson-desktop-top.png | galleries-2026-jordanrobson-mobile-y900.png | galleries-2026-jordanrobson-mobile-y1800.png

## Jakub Jakubik — https://jakubjakubik.com/ · ©2025 mark shown on page
- **desktop**:
  - Nav is a cluster of SEPARATE rounded pill buttons — '(JJ)', 'Index of Work', 'Information', 'Email', 'Instagram' — each its own hit target rather than one shared bar.
  - The rest of the first viewport is empty white space with one centered line of type ('Independent designer and developer') and a tiny handwritten-style blue '©2025' mark near the bottom.
- **steal**: Adopt 'each nav item is its own separate pill' (instead of one shared nav bar) for Max's main nav or the Explore theme-switcher — a cheap, distinctive way to avoid a templated-looking header.
- screenshots: galleries-2026-jakubjakubik-desktop-top.png

## jackentee.com — https://jackentee.com/ · current
- **desktop**:
  - Zero-card editorial index: each project is a plain text title row ('RUFUS WAINWRIGHT, I'M A STRANGER HERE MYSELF — Print', right-aligned 'CALL OF DUTY, BLACK OPS 6 — Visual Identity, Digital, Apparel') sitting directly above 1-3 full-bleed photos of different aspect ratios placed side by side, separated only by a hairline — no borders, shadows, or rounded corners anywhere.
  - Footer renders a full-width taxonomy TABLE: category names (All/Creative Direction/Visual Identity/Digital Design/Campaign/Motion Design/Strategy/Print) each with a bracketed count like '[14]', plus a second row of page links (Home/List/Info/Garden) — functions as both filter UI and sitemap, styled as plain text columns with a hairline rule.
- **mobile**:
  - Not captured (site timed out under the mobile viewport during this pass) — worth a manual re-check before committing to it as a primary reference.
- **motion**:
  - None observed at first paint (static reveal).
- **steal**: Turn the Shopify-work filter chips into a full-width taxonomy TABLE at the foot of the index (category name + bracketed count, plain hairline grid) instead of pill chips up top — doubles as an at-a-glance stat and avoids the 'chip = mini card' look entirely.
- screenshots: galleries-2026-jackmcentee-desktop-top.png

## sashamartynchuk.com (current live content: a Staff Product Designer hero, contact iamvisp@gmail.com — domain content may have changed since indexing) — https://www.sashamartynchuk.com/ · current
- **desktop**:
  - Full-bleed near-black hero; top nav is plain text links (Home/Approach/Works/About) with the contact email flush right in the same thin sans.
  - Hero pairs a small eyebrow line ('I design complex software products 0→1') with a MASSIVE bold condensed headline that intentionally bleeds past the viewport edge, and directly beneath it a completely different display face — a loose cursive/handwritten script — for the location line, creating a deliberate two-typeface hero instead of one uniform headline.
- **mobile**:
  - Same black background and same two-typeface pairing preserved at smaller scale: the condensed headline wraps to two lines, the script line stays on one line beneath it.
- **motion**:
  - Not deeply observed at this depth.
- **steal**: Give Max's hero a second, contrasting display face for ONE line only — keep the giant role headline in the current grotesque, but set his location or title-modifier line in a loose script for one beat of personality, exactly the bold-condensed + handwritten-script pairing seen here.
- screenshots: galleries-2026-sashamartynchuk-desktop-top.png | galleries-2026-sashamartynchuk-mobile-top.png

## Gionatan Nese ('26) — https://www.gionatannese.com/ · Awwwards Site of the Day, Sep 05 2026
- **desktop**:
  - Opens on a plain typographic hero: name, an initials mark 'GN.D', role 'Multi-Disciplinary Designer', and a page counter ('090') bottom-center.
  - On interaction the viewport becomes a scattered photo corkboard: dozens of small torn-paper/polaroid-style images of objects (a phone, a rock, a tool, a plant) pinned at organic, non-grid positions and rotations, labeled 'Creative Space' with numbered tabs (1/2/3) to switch boards — a genuine moodboard-on-a-wall feel, not a grid or carousel.
- **mobile**:
  - Not captured at this depth.
- **motion**:
  - The scattered, individually-rotated placement of each image implies a physics- or randomized-on-load scatter animation consistent with 2026 SOTD-level craft.
- **steal**: Offer a 'moodboard' alternate view of the Gallery: scatter the laptop/phone store composites at organic angles on a plain canvas with numbered 'Board 1/2/3' tabs instead of always the 3D-tilt carousel — satisfies the brief's demand for a non-card, non-carousel archetype.
- screenshots: galleries-2026-gionatannese-desktop-top.png | galleries-2026-gionatannese-desktop-retop.png

## Maria Vasilyeva — https://www.mariavasilyeva.com/ · current
- **desktop**:
  - Full-bleed cinematic dark hero built as a fixed-viewport 'player': rotated vertical name label top-left, 'MENU' label top-right, and on the right edge two stacked, explicitly-labeled toggle switches — 'SOUND: ON/OFF' and 'ANNOTATIONS: ON/OFF' — over a slowly reframing close-up portrait photo revealed through a black film-gate mask top and bottom.
- **mobile**:
  - Not captured at this depth.
- **motion**:
  - Real-time parallax/crop reveal of the background photo tied to scroll/wheel input, with a film-gate masking effect top and bottom.
- **steal**: Add a literal, labeled ON/OFF rocker toggle to Max's case-study sheets for something honestly binary — e.g. a 'Sample data' switch — turning the honesty-labeling requirement into a designed UI control instead of small print.
- screenshots: galleries-2026-mariavasilyeva-desktop-retop.png

## Kenj Pena — https://kenjpena.com/ · current
- **desktop**:
  - A case-study 'title card' reveal: full-bleed near-black screen, small close/X icon top-left, a centered logo/loading glyph, and a footer-style credit row spanning the full width — client wordmark + descriptor bottom-left ('CONFIRMED® adidas'), an underlined 'Info' link + discipline/year tag bottom-right ('Product Design, 2024') — functions like a film title card rather than a card thumbnail.
- **mobile**:
  - Not captured at this depth.
- **motion**:
  - A brief loading/name-transition state was observed across repeated captures before the title card settled.
- **steal**: Open Max's case-study sheet with a full-bleed black 'title card' (store name bottom-left, discipline+year bottom-right, one Info link) before the charts/screenshots load, instead of jumping straight into a light card with a header.
- screenshots: galleries-2026-kenjpena-desktop-retop.png

## Leonardo Moreira — https://leonardomoreira.com.br/ · current
- **desktop**:
  - The entire first load renders as an authentic-looking 1999 PC BIOS boot screen (monospace green/amber text: 'Award Modular BIOS v4.51PG', an AOpen chipset ID line, an Energy Star badge, 'Press DEL to enter SETUP'), with the owner's handle worked into the fake hardware ID string ('@leonardomoreira') before (presumably) the real portfolio appears.
- **mobile**:
  - Not captured.
- **motion**:
  - Presumed timed boot sequence before transitioning to the real site (not confirmed beyond the boot screen itself within this capture pass).
- **steal**: Not a direct steal (flagged in avoid list) — but the PRINCIPLE of a bespoke, on-brand loading moment instead of a generic spinner is worth a restrained version: a few lines of monospace 'boot log' text referencing Max's real stack (React 19, Vite, Tailwind, Shopify Liquid) that self-types for under a second before the hero settles.
- screenshots: galleries-2026-leonardomoreira-desktop-retop.png

## Angela Ricciardi — https://angelaricciardi.com/ · current
- **desktop**:
  - Ultra-minimal white canvas; header is plain text (name left, 'Projects, Information, Archive' center, an image counter '001 of 029' right); the entire body is empty white except a horizontal strip of small, heavily blurred/faded thumbnails pinned to the very bottom edge of the viewport, teasing the gallery without showing it clearly.
- **mobile**:
  - Transforms completely into a single large square 'framed print' photograph centered in the viewport with a visible border/mat, plain-text 'Prev / 001 of 029 / Next' controls beneath it, and a small filmstrip of thumbnails underneath that — desktop's edge-peeking strip becomes mobile's one-frame slideshow with an honest numeric counter.
- **motion**:
  - Implied blur-to-sharp resolve of thumbnails on interaction, based on the blurred state captured on desktop.
- **steal**: On mobile, turn any Gallery/case-study image sequence into this exact pattern: one large 'framed' image + Prev/Next text controls + a numeric counter ('001 of 029') + a mini filmstrip beneath — instead of a swipeable card carousel.
- screenshots: galleries-2026-angelaricciardi-desktop-top.png | galleries-2026-angelaricciardi-mobile-top.png

## ideas
- Rebuild 'Year by year' as full-bleed CHAPTER panels (khanhnguyen.design): each career era = one full-bleed textured/photo panel with a giant roman-numeral heading that slides open like a diptych door into the next era, replacing the hairline-timeline list.
- Rebuild 'Process' (5 steps) as a converging-line schematic (sokolovski.pro): thin diagonal connector lines meeting each numbered step label as the section scrolls, instead of the pinned-numeral card stepper — satisfies the owner's explicit 'clearer non-card layout' complaint.
- Add a two-typeface hero moment (sashamartynchuk.com pattern): keep the giant grotesque role headline, but set ONE line (e.g. 'CTO & Shopify Tech Lead' or a location tag) in a contrasting loose script for a single beat of personality.
- Open each Shopify case-study sheet with a full-bleed black 'title card' (kenjpena.com): store name bottom-left, discipline + year bottom-right, one 'Info' link — before any chart or screenshot loads.
- Show real product/UI in an actual device bezel for at least one case study (rfeasley.io): a phone frame mid-interaction with the 'Sample data' label literally inside the mock screen, next to a 2-line mission statement in a contrasting smaller typeface.
- Add a moodboard alternate view for the Gallery (gionatannese.com): scatter laptop/phone store composites at organic angles on a plain canvas with numbered 'Board 1/2/3' tabs — a genuinely new, non-card, non-carousel archetype.
- On mobile, convert any image sequence (Gallery, case-study screenshots) into angelaricciardi.com's pattern: one large 'framed' image + Prev/Next text + a numeric counter ('001 of 029') + a mini filmstrip beneath.
- Restyle the Shopify-work index as full-bleed saturated color panels per store (abhaysingh.in): one dominant color per store, real product/theme photography, store name + one sentence, with the quantified stat placed OUTSIDE the panel in small gray caption text below — makes 'Sample data' labeling structural.
- Replace filter pill-chips with a full-width taxonomy TABLE at the foot of the Shopify-work index (jackentee.com): category name + bracketed count in a plain hairline grid — doubles as a stat band and removes the last 'card-like' chip.
- Give the main nav or the Explore theme-switcher cards each-their-own-pill treatment (jakubjakubik.com) instead of one shared bar/one shared grid, for a cheap dose of distinctiveness.
- Add a labeled ON/OFF rocker toggle to case-study sheets (mariavasilyeva.com) for something honestly binary — e.g. a real 'Sample data' switch — turning the honesty requirement into a designed control, not a caption.
- Use a running counter/timecode readout as a decorative-but-honest touch on the Gallery or stat band (jordandrobson.com), tied to something real (e.g. years of experience ticking, or a store-count) instead of an arbitrary count-up.
- For long editorial indexes (Projects, Shopify work), drop card borders/shadows entirely: plain text title row + hairline rule + full-bleed photography abutting edge-to-edge (jackentee.com) reads curated, not templated.
- Try a raw, uncarded contact-sheet masonry (sokolovski.pro 'Fragments') as a dense, scannable alternate entry into the 19-store index — real screenshots at real aspect ratios, zero card chrome, capped to Max's own verified work only.
- Adopt a restrained 'boot log' loading moment (in the spirit of, but far more subdued than, leonardomoreira.com.br): a few self-typing monospace lines naming the real stack (React 19 · Vite · Tailwind · Shopify Liquid) for under a second before the hero settles, instead of a generic spinner.
## avoid
- Fixed-viewport scroll-hijacking with a custom scroll engine (mariavasilyeva.com, gionatannese.com's overflow:hidden 'player' pattern) — conflicts with the no-WebGL/no-GSAP, Lighthouse-100 constraint; any borrowed motion must run on framer-motion + CSS transform/opacity only.
- Long or ambiguous forced loading states before real content appears (observed on kenjpena.com and mariavasilyeva.com during capture, and by design on leonardomoreira.com.br) — a CTO/recruiter audience needs fast first-meaningful-paint; skip forced intros or cap them under ~1s and make them instantly skippable.
- Gimmicky retro-computer boot screens or long novelty intros (leonardomoreira.com.br) as a literal copy — charming once for a personal dev toy site, but reads as a delay tactic on a B2B-facing CRO consultant's site.
- Audio/sound toggles (mariavasilyeva.com's 'SOUND: ON/OFF') — inappropriate for a portfolio browsed at a desk in a work context; do not add audio at all.
- Dense 300+ item raw masonries (sokolovski.pro's 343-tile Fragments grid) without grouping or labels — risks overwhelming a recruiter looking for the Shopify CRO story; if adopted, cap the count and keep it to Max's own verified work, never mixed with unrelated exploratory noise.
- Tiny multi-pill nav clusters (jakubjakubik.com) without verifying real touch-target size — confirm ≥44px hit areas before adapting the 'separate pill per nav item' idea to mobile.
- Lifting any site's literal copy, photography, or exact type pairing wholesale — steal structure and interaction pattern only; never reuse the actual images or sentences seen in these captures.

# LENS: gallery-media (agent a438c44f86602a435)

## Domaine (formerly Half Helix + Tomorrow) — https://domaineworldwide.com/work · Largest independent Shopify Plus partner, 2026 merged entity
- **desktop**:
  - Header reads 'PROJECTS [51]' next to a one-sentence intro, then a 'Filter Projects' bar — no category chips shown by default, just a single expandable filter control that keeps the header uncluttered.
  - Below that: a strict 3-column uniform grid of 51 tiles. Every tile is a real lifestyle/product photo (not a screenshot) with the client's wordmark logo stamped small in a corner — Gaia Herbs, Hunter Douglas, Peloton, Bandier, Assouline, Creed, etc.
  - Tiny metadata line under each photo (client name, one-line category tag, small icon) — deliberately terse, no case-study paragraph on the index itself.
  - Zero card borders/shadows/rounded corners — the grid reads as an editorial photo wall, not a SaaS card grid.
- **mobile**:
  - 3-col grid collapses to a SINGLE column feed (not 2-col) — each project becomes a full-width photo with the logo overlay, followed directly by a short one-sentence outcome line ('Turning organic authority into higher-converting traffic and a growing AI search channel') instead of the desktop's terse tag.
  - The single-column feed is very long (51 full-bleed photos stacked) — mobile trades density for large, high-quality imagery per project.
- **motion**:
  - Static reveal-on-scroll grid; no carousel or hover-video observed in the captures.
- **steal**: For the Shopify-work section: replace card borders/shadows entirely — each of the 19 stores becomes a full-bleed lifestyle/product photo with the store's wordmark stamped small in a corner and ONE outcome sentence beneath (mobile) or a tiny tag line (desktop), dropping the chart/KPI clutter from the index view entirely (charts stay inside the case-study sheet, which maxfolio already has).
- screenshots: gallery-media-domaine-desktop-top.png | gallery-media-domaine-desktop-full.png | gallery-media-domaine-mobile-scroll1.png | gallery-media-domaine-mobile-scroll2.png

## Fuel Made — https://fuelmade.com/ 
- **desktop**:
  - Hero: conversion-metrics promise headline + 'SEE HOW' / 'View case studies' CTAs.
  - 'Brands that trust us' — a flat 4x5 monochrome wordmark grid (20 logos, no boxes, no color) directly under the services row.
  - KEY SECTION: a full-bleed dark-navy band titled 'Uncover and capture unrealized revenue' with a horizontal TAB STRIP of 5 client logos (The Office Oasis, BK Beauty, Turbie Twist, Smidge, Super7). Clicking a tab swaps the whole panel below: a labeled BEFORE/AFTER pair of full theme screenshots side by side, plus a 2x2 stat grid (Desktop conversion +59%, New visitor conversion +57%, Mobile conversion +62%, PageSpeed +47%) and a 'Full case study' button.
  - Below: a 3-up testimonial-style row with real headshot photos + 1-line result captions (not cards — just image + name + sentence).
- **mobile**:
  - The tab strip of 5 client logos stays as a horizontally-scrollable row (same visual language, no dropdown) — tapping still swaps the Before/After panel beneath it, so the 'one big feature + selector' pattern survives mobile intact rather than being replaced.
  - Before/After device pair stacks vertically instead of side-by-side.
  - Logo trust-wall reflows from 4 columns to 2.
- **motion**:
  - A small inline sparkline/line-chart appears next to the mobile hero headline (2.5%→4.1%) as a decorative proof element, not present on desktop.
- **steal**: Replace maxfolio's flat case-study index with Fuel Made's tabbed spotlight: one dark full-bleed band, a row of 5-6 store-logo tabs, and selecting a tab swaps a Before/After pair + a 2x2 real-metric stat grid in place — this gives 'one big + thumbs' spotlight depth without needing 19 separate card panels on screen at once.
- screenshots: gallery-media-fuelmade-desktop-full.png | gallery-media-fuelmade-mobile-full.png

## Underwater Pistol (UWP) — https://www.underwaterpistol.com/work 
- **desktop**:
  - Long, dense FILTER BAR of 16 real tags in a row (Design, Development, Internationalisation, Migration, UK, Platform consolidation, Systems architecture, Subscription, SEO, Branding, Business Transformation, ERP Integration, B2B, AR direction, Loyalty, CRO, D2C) — much richer taxonomy than the usual 4-5 chips.
  - 3-col card grid: each tile is a real product/lifestyle photo with the client wordmark bottom-left, a 2-line description paragraph, its own tag list, and a 'VIEW PROJECT' button.
  - Grid rhythm is broken every 6 cards by a full-bleed EDITORIAL band (e.g. LYMA: 3 women product photo full width + giant wordmark caption underneath) before returning to cards — this is the exact 'don't stack more than 2 of the same archetype' fix the owner asked for.
  - Bottom: a 4-up blog/insights row with dark overlay photo cards.
- **mobile**:
  - 3-col grid becomes a single column; cards keep full description text (not truncated).
  - 16-tag filter bar collapses into a vertically WRAPPING stack of outline pill buttons (each own line/pair) — takes real estate but stays fully visible text rather than hiding behind a 'Filters' modal.
- **steal**: Insert one full-bleed editorial photo band (client wordmark + hero shot, no card chrome) after every 5-6 store tiles in the Shopify-work grid — a rhythm-breaker between card rows that also gives Max's biggest win (e.g. the highest lift %) a moment of its own.
- screenshots: gallery-media-uwp-desktop-full.png | gallery-media-uwp-mobile-top.png | gallery-media-uwp-mobile-full.png

## Swanky — https://swankyagency.com/portfolio/ 
- **desktop**:
  - Directly under the hero headline: an auto-scrolling horizontal FILMSTRIP of raw mobile PDP screenshots (no device frame, just cropped mobile screens edge-to-edge) — 'Bloom & Blossom', a breastfeeding lifestyle photo, 'Introducing Sandalnut Bloom', a coffee subscription box — mixed content types in one continuous marquee.
  - Below the filmstrip: a plain 4x2 flat monochrome logo grid (no boxes) titled 'Our Shopify Plus portfolio'.
  - Then a 3-col case-study card row with vivid product photography (whiskey glass, colorful pills, perfume) — each with a 'view project' link.
  - Then a full-bleed dark AWARD-BADGE + pull-quote band ('...transformational...') before repeating logo-grid / quote-band / logo-grid rhythm all the way down — cards never appear more than once in a row before a non-card interstitial breaks it up.
  - Ecommerce vertical logos section further down, segmented by vertical, all flat monochrome.
- **mobile**:
  - The filmstrip strip becomes a fixed floating bottom-right 'FEATURED LAUNCH' pill/badge instead of an auto-scroll marquee at the top — the horizontal filmstrip pattern doesn't survive mobile, it's replaced by a small persistent CTA chip.
  - Card rows go single column; logo grids reflow to 2-3 per row.
- **motion**:
  - Filmstrip auto-scrolls continuously (marquee/ticker) at the top of the page on desktop.
- **steal**: Alternate the Shopify-work section's card rows with plain flat logo-grid interludes AND at least one full-bleed pull-quote/award band between every 2 rows of cards — directly solves 'too much info in cards' by giving the eye a rest beat that carries zero data, just typography and a client name.
- screenshots: gallery-media-swanky-desktop-top.png | gallery-media-swanky-desktop-full.png | gallery-media-swanky-mobile-top.png

## MadeByShape — https://madebyshape.co.uk/work/ · 2026-referenced Manchester Shopify/web agency
- **desktop**:
  - Filter control is NOT chips/buttons — it's a typographic sentence-cloud: 'explore all‑47  fashion‑8  fitness & sport‑3  education‑4  health‑5  property‑10  corporate‑6  food & drink‑6  agency‑10  ecommerce‑18  b2b‑23  b2c‑14  shopify‑6  archive‑19' rendered as one running paragraph, bold+black for the active term, muted gray for the rest, small subscript counts after each word — a genuine 'hover-preview typographic list' filter.
  - Below: a true MASONRY with mixed widths/heights — full-bleed portrait photo (Gary Neville shouting, 'G—N' logotype overlay), a landscape laptop-mockup shot, a browser screenshot bled straight into the photo with no device frame, an architecture render, alternating rhythm with no fixed grid.
  - A floating round badge bottom-right with circular rotating text ('Let's talk websites • Let's talk SEO • Let's talk branding') persists across scroll as a roaming CTA.
  - Mid-grid Easter egg: 'You're still here?! You must really like us... [Contact us]' — a personality/copy break placed deliberately deep in the scroll, addressing 'zero AI slop' by injecting an obviously human, funny aside.
- **mobile**:
  - Typographic tag-cloud filter wraps naturally as a paragraph (same treatment, no chip conversion) with a dark-mode toggle and hamburger menu replacing desktop's inline nav.
  - Masonry becomes a single column but each tile keeps small pill tags (e.g. 'Branding', 'Website', '+1') overlaid directly on the photo's top-left corner, image corners rounded.
- **steal**: Turn the tech-stack / feature-filter row into a typographic sentence-cloud instead of pill chips — words sized/weighted by relevance, counts as subscript, bold-black for selected — reads as an editorial moment rather than a UI control, and doubles as a way to show 'many things' (skills, tags) without a grid of boxes.
- screenshots: gallery-media-madebyshape-desktop-top.png | gallery-media-madebyshape-mobile-top.png | gallery-media-madebyshape-desktop-y1600.png | gallery-media-madebyshape-desktop-y3200.png

## Diff (WPP Enterprise Solutions) — https://diff.agency/ 
- **desktop**:
  - Full-bleed video/photo hero, headline over a blurred lifestyle photo, flat white-logo strip (DavidsTea, Effy, Fashion Nova, Gorjana, Matt & Nat, Psycho Bunny, Gymshark) baked directly into the hero image bottom edge.
  - 'Real Clients, Real Results' section: a tight, gapless 3x4 grid (12 tiles) of pure editorial lifestyle/product photography — no logos, no captions overlaid on the image, just a small 2-line caption underneath each — reads like a fashion magazine spread, not a portfolio grid.
  - Two more full-bleed cinematic photo bands (a man in a coat walking a desert horizon; an interior) sandwich a plain-text services list rendered as inline rows, not cards.
  - Footer-area integrations/tool badge grid (Shopify, Klaviyo, Gorgias, Nosto, Loop, Recharge, Yotpo) in a clean bordered tile grid — this is the 'tools we integrate' pattern, useful reference for a stack section even though maxfolio's stack is personal tools not integrations.
- **mobile**:
  - Hero keeps full-bleed image; adds a persistent floating dark pill bottom-right reading 'FEATURED LAUNCH' as a roaming CTA (same idea as MadeByShape's rotating badge, different execution).
  - The 3x4 photo grid collapses to a single-column full-bleed stack, images still edge-to-edge with zero gap — the magazine feel survives the collapse because there was never a card border to lose.
- **steal**: For the Gallery/media section, drop the current carousel's card framing in favor of a tight, gapless, edge-to-edge grid of pure product/lifestyle photography (no captions on the image itself) — on mobile it becomes a single-column full-bleed feed, so the transformation is 'grid → feed' with zero chrome lost either way.
- screenshots: gallery-media-diff-desktop-top.png | gallery-media-diff-desktop-grid.png | gallery-media-diff-mobile-top.png | gallery-media-diff-mobile-full.png

## Studio K95 — https://k95.it/en/works · Awwwards Site of the Day, 11 Aug 2026
- **desktop**:
  - Electric-blue background with a visible warped 3D perspective grid (fine dark-blue gridlines curving toward a vanishing point) behind the whole works list — the 'floor' itself feels alive even though tiles are static images.
  - A floating pill segmented control top-center: 'GRID | LIST' — a genuine view-mode switcher, not just a filter.
  - A floating pill top-right: '● ALL WORKS' plus a second floating pill lower-center reading '● ALL (20)' with a live count badge — filter state is shown as a roaming HUD element instead of a fixed sidebar/topbar.
  - Tiles are 4-across but each column is vertically offset from its neighbors (row 2 sits noticeably higher/lower than row 1) producing a genuine CONSTELLATION-SCATTER feel rather than a rigid grid, even though there's an underlying column structure.
  - Tile content mixes photography, product shots, and pure typographic/poster tiles (a red poster with reversed Latin-looking type) — visual variety keeps 20 tiles from feeling repetitive.
- **mobile**:
  - 4-col scatter collapses to a clean 2-col grid, offset/scatter effect removed (tiles align in strict rows) — the constellation feel is desktop-only, mobile trades it for scannability.
  - The floating GRID/LIST and ALL(20) pills move from top-center/mid-page down to a docked position near the bottom of the viewport, closer to the thumb — filter controls relocate for reachability rather than disappearing.
- **motion**:
  - Background grid appears to have subtle perspective/parallax distortion tied to scroll or cursor (visible curvature suggests a shader or CSS 3D transform, not a flat image) — verify only as an SVG/CSS transform if replicated, per the no-WebGL constraint.
- **steal**: For 19 stores shown as more than a plain list: offer a GRID/LIST segmented toggle (two floating pill buttons) plus a floating '● ALL (19)' count pill instead of a static header — cheap to build in React state, and it reframes the index as an explorable collection rather than a fixed page.
- screenshots: gallery-media-k95work-desktop-top.png | gallery-media-k95work-mobile-top.png | gallery-media-k95-desktop-top.png | gallery-media-k95-mobile-top.png

## Produx — https://www.produx.design/ · Awwwards Site of the Day, 9 Aug 2026
- **desktop**:
  - Giant slashed-zero wordmark hero ('PRØDUX') on pure black, '[SCROLL DOWN]' hint top-left, cookie-consent styled as in-world copy: 'A long time ago, in a browser far far away... [MAY THE COOKIES BE WITH YOU]'.
  - 'Selected projects' is an ASYMMETRIC MOSAIC, not a grid: two small square thumbnails side-by-side (Yoga Network, Gothic AI), then one full-width wide banner project (jurni, an orange gradient brand), then two more squares (a colorful arcade-poster brand, Nolana) — each project gets a different aspect ratio based on how it should be seen, not a fixed template.
  - A pinned/sticky moment: scrolling through the hero text reveals a large tilted photographic card (a mossy floating rock with the PRØDUX wordmark composited on it) that overlays the text beneath it before settling.
  - Client-logo marquee rendered as a horizontal row of individually BOXED dark tiles (Google, Nolana, Geviti, HealwellAI) rather than a flat borderless strip — each logo gets its own dark card with padding.
  - A glitch-text moment: 'Where intent meets execution / identity takes shape' rendered with a duplicated, slightly offset, chromatic-aberration-style layered second copy of the same text (readable as intentional glitch, not a rendering bug).
- **mobile**:
  - Asymmetric mosaic collapses to a plain single-column stack — each project still full width with a small 'View project' link beneath, but the aspect-ratio variety and the wide-banner treatment are lost; mobile normalizes everything to portrait tiles.
- **motion**:
  - Glitch/chromatic-split text treatment on a header line; pinned photo-card reveal over hero text while scrolling; boxed logo marquee auto-scrolls.
- **steal**: For Skills/tech-stack, box each tool logo/name in its own small dark tile in a horizontal auto-scrolling marquee (rather than the current inline-chip sentences) — gives visual weight and rhythm without adding real information density, and it is pure CSS transform/opacity so it survives the Lighthouse-100 constraint.
- screenshots: gallery-media-produx-desktop-top.png | gallery-media-produx-mobile-top.png | gallery-media-produx-desktop-projects.png | gallery-media-produx-desktop-y8600.png | gallery-media-produx-desktop-y9400.png | gallery-media-produx-mobile-full.png

## Vero (Rodeo Studio + Pluto for Vero/Noonlight) — https://www.verostudio.com/ · Awwwards Site of the Day, 8 Aug 2026
- **desktop**:
  - Full-bleed portrait hero photo (bride in gown) with 'VERO' wordmark overlaid, into 3 stacked full-bleed cinematic product photos (dress on a mannequin bust lit orange, a completed white sculpture on a plinth, a woman beside the sculpture) — pure editorial full-bleed, no grid at all for the hero sequence.
  - A PINNED/STICKY typographic moment: serif+italic mixed headline 'WHERE your WEDDING / DRESS BECOMES art.' stays fixed on screen with a live scroll-progress '100%' counter bottom-right while the background settles — confirmed pinned because two different scroll offsets rendered the identical frame.
  - Near the base of the page: a dense CONTACT-SHEET grid of ~35 small square thumbnails (process shots, sculpture details, behind-the-scenes) directly beneath the big pull-quote — a deliberate scale-down from full-bleed hero photography to tiny uniform squares, the opposite move of most portfolios.
  - Closing pull-quote in large serif type: 'I HELD A MOMENT IN MY HAND BRILLIANT AS A STAR...' — pure typographic moment with no imagery.
- **mobile**:
  - Full-bleed portrait hero and photo sequence survive untouched (already portrait-oriented, so no mobile-specific redesign needed there) — a rare case where desktop and mobile hero are nearly identical because the content was shot for portrait from the start.
- **motion**:
  - Scroll-progress percentage counter pinned bottom-right during the sticky typographic section — a small, cheap, CSS/JS-only motion detail that reinforces 'this is a considered scroll moment', not a wall of text.
- **steal**: Add a live scroll-progress indicator (a simple '00–100%' counter, bottom-right, framer-motion useScroll-driven) during maxfolio's Year-by-year or Process section to signal 'this is a paced narrative, not a long page' — cheap, transform/opacity only, no WebGL.
- screenshots: gallery-media-vero-mobile-top.png | gallery-media-vero-desktop-full.png | gallery-media-vero-desktop-thumbgrid.png

## ideas
- Replace the Shopify-work section's uniform card grid with a Domaine-style filterable wall: full-bleed real photography (product/lifestyle, not screenshots) with the store's wordmark stamped small in a corner and a one-line outcome sentence — mobile collapses to a single full-width column, desktop stays 3-col.
- Build a Fuel Made-style tabbed spotlight ABOVE the 19-store index: 5-6 logo tabs, selecting one swaps a Before/After device pair plus a labeled 2x2 real-metric stat grid — gives the strongest 3-4 case studies a dedicated feature moment instead of parity treatment with all 19.
- Break up every 2 rows of store cards with a non-card interstitial — a full-bleed editorial photo + wordmark (UWP-style) or a flat monochrome logo wall + pull-quote band (Swanky-style) — this is the single most direct fix for 'too much information in cards'.
- Turn the tech-stack section into a typographic sentence-cloud (MadeByShape-style): tool names sized/weighted by how much Max uses them, muted-gray by default, bold-black on hover/active, small subscript counts (years used, projects shipped) — replaces the current 'six prose sentences with inline chips' with something more scannable AND more editorial.
- Offer a GRID/LIST segmented toggle (Studio K95-style) on the Shopify-work index — two floating pill buttons plus a live '● ALL (19)' count pill — cheap React state, reframes the index as explorable rather than fixed, and gives mobile a reason to relocate the control near the thumb.
- Give the Shopify-work grid a constellation-scatter feel on desktop only: vertically offset alternating columns (not a rigid row grid) so it doesn't read as a spreadsheet, collapsing to a clean aligned 2-col grid on mobile — desktop gets personality, mobile gets scannability, which is exactly the 'sections that completely change on mobile' the owner asked for.
- Add a Produx-style boxed logo marquee for tools/partners (Klaviyo, GA4, Shopify, etc. — things Max has real depth in): each logo in its own small dark tile, auto-scrolling horizontally, CSS-only transform.
- Add a live scroll-progress percentage counter (Vero-style) during the Year-by-year timeline or the Process stepper — bottom-right, framer-motion useScroll, reinforces pacing without adding new visual noise.
- For the Process section (owner's 5 steps complaint): drop the card/numeral-stepper hybrid and try Produx's asymmetric mosaic logic instead — step 1 gets a wide full-bleed band, steps 2-5 get smaller alternating tiles, so the steps feel like a narrative sequence rather than 5 equal boxes.
- Steal Swanky's floating rotating-text CTA badge (a small circular badge with text running around its edge, 'Let's talk Shopify • Let's talk CRO • Let's talk Growth') as a persistent bottom-right contact nudge that appears after the hero — directly serves the 'stronger CTAs' complaint without adding a sticky bar.
- For the Gallery/media section replacing the current laptop+phone carousel: try Diff's tight gapless edge-to-edge grid of pure store photography (no device frames, no captions on-image) — mobile becomes a single-column full-bleed feed, desktop a magazine-style 3-col grid; much less 'AI slop 3D tilt' feeling than the current carousel.
- Borrow MadeByShape's mid-scroll Easter-egg copy break ('You're still here?! [Contact us]') as a one-off moment somewhere deep in the Shopify-work index — a human, funny aside that directly answers 'zero AI slop' by being something a template generator would never write.
- Consider a small contact-sheet thumbnail grid (Vero-style, ~20-30 tiny uniform squares) as a closing coda after the main Shopify-work section — process shots, behind-the-scenes screenshots, Slack-thread snippets — the scale-DOWN move (big photos → tiny grid) reads as confident rather than padded.
- Use Fuel Made's real labeled stat grid (4 KPIs with %, each captioned in caps: 'DESKTOP CONVERSION RATE') as the template for maxfolio's per-store metrics instead of a chart-heavy sheet — keep 'Sample data' labeling exactly as it is now, just present 2-4 numbers big and bold before showing any chart.
- Borrow Studio K95's mixed-content-type tile logic for the 19-store grid: not every tile needs to be a photo — mix in 1-2 pure-typographic 'poster' tiles (store name in huge type on a flat color) among the photo tiles to break visual monotony across 19 entries.
## avoid
- Don't copy Domaine's cookie-consent modal pattern that fully occludes the hero content until dismissed and reflows scroll position — capture/UX friction, not a design idea worth stealing.
- Don't adopt UWP's 16-tag filter bar wrapping into 8+ stacked lines on mobile — it eats a full screen of vertical space before any content is visible; cap any store-work filter to 5-6 tags max on mobile or hide extras behind a single 'more' toggle.
- Don't use Produx's asymmetric mosaic literally with WebGL/3D tilt effects (the pinned mossy-rock reveal looks GPU-shader-driven) — the Lighthouse-100/no-WebGL constraint rules this out; achieve the visual variety with pure CSS grid-column/row spans and framer-motion opacity/transform only.
- Don't let Studio K95's floating filter pills (GRID/LIST, ALL count) overlap actual content the way they did in one capture (a pill sat on top of a project thumbnail on mobile) — any floating control needs a safe-zone margin from tile edges.
- Don't use Swanky's or Diff's auto-scrolling logo/photo marquees as the ONLY motion in a section — on their own these read as generic 'agency template' motion; pair any marquee with at least one non-marquee moment nearby (a stat, a quote, a mosaic) so it doesn't feel like stock Awwwards-kit motion.
- Don't literally reuse '404 - I guess you guys aren't ready for that yet' joke copy or any other site's specific wording — write maxfolio-original copy in the same spirit, never lift phrasing.
- Don't chase Vero's fully custom Rodeo-Studio-grade production values (museum-quality product photography, custom typeface pairing) as a literal template — maxfolio's placeholder photos won't carry that same weight, so the STEAL should be the structural moves (pinned typographic band, scroll-progress counter, contact-sheet coda), not the art direction.
- Don't add more chips/pills purely to look busy — several of these sites (Domaine, Diff) win by removing chrome entirely (no card borders, no logo boxes) rather than adding more filter UI; resist the urge to bolt a filter bar onto every section just because competitors have one.

# LENS: awwwards-2026-dev-ryan (agent a6ea9f2d36e2acf35)

## Ryan Ritzenthaler Portfolio V2 — https://www.ryanritzenthaler.com/ · Awwwards Honorable Mention, Jul 06 2026 — full-stack web developer, NextJS/Shopify freelancer (closest persona match to Max)
- **desktop**:
  - Hero: two-line blackletter wordmark 'Ryan Ritzenthaler' with a circular rotating badge ('WEB DEVELOPER / FULL-STACK') top-right, short bio + underlined 'reach out here' link, no chips/cards at all.
  - Work index: as you scroll, his name card goes STICKY/pinned (white card, fixed position) while real embedded/screenshotted CLIENT SITES scroll continuously behind it edge-to-edge (Red Robin, skincare DTC sites, med-practice sites) with floating pill tags ('SEO','Performance','Flexibility') and 'Trusted by leading employers' + logo row — the sticky info card + scrolling live-site backdrop replaces a static hero image.
  - Full case-study grid: 2-col cards, each a full-bleed live-site screenshot + a headline over image ('A new standard of personalized care for women') + stack chips (NextJS/Tailwind CSS/Prismic CMS/category) + 'Completed: Dec 2025' + linked project name below the image (image-first, caption below, not a bordered card).
  - Interstitial pull-quote bands break up the grid: a full-bleed black starfield+sun background with giant blackletter 'It This Far!' sits between grid rows; later a huge italic 'SPEED' headline section appears before a 'Shopify Development' category block and a plain text services LIST (not cards).
  - Persistent vertical sidebar tab reading 'W. / Honors' stays fixed on the right edge through the entire scroll (Awwwards honors badge).
  - Footer: giant blackletter 'Let's Build!' CTA next to two plain link columns (Work / Learn) and Reach Out (Inquire, Email) — no card, just a typographic moment + text nav.
- **mobile**:
  - Hero collapses to single centered column: circular rotating badge shrinks and sits above the stacked two-line name; hamburger icon replaces the desktop nav bar.
  - The 2-col case-study grid becomes a single-column stack of the SAME cards (full width, same chips/caption pattern) — a straightforward reflow, not a re-architecture; the sticky 'W. Honors' tab stays fixed in the same corner at every breakpoint.
  - Footer 'Let's Build!' becomes a mobile-width blackletter headline stacked over three plain link columns (Work/Learn/Reach Out) — same content, single column.
- **motion**:
  - Sticky-position pinning of the name card while background content scrolls past (pure CSS position:sticky + scroll, no WebGL).
  - Chips/badges appear to be simple opacity/translate reveals on scroll (typical scroll-reveal, no exotic physics).
  - Circular text badge likely a slow CSS/SVG rotation loop around a static diamond icon.
- **steal**: For maxfolio's 'Shopify work' section: pin a small fixed info card (store name + 2 rotating metric chips) while the actual store screenshot/site preview scrolls edge-to-edge behind it — replaces the current card-grid case-study sheet with a much lower-chrome, higher-immersion browsing mechanic, and the floating chips give you a place to vary which metric shows per store (solves 'never the same metrics for every store').
- screenshots: awwwards-2026-dev-ryan-ritzenthaler-desktop-seg0.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg1.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg2.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg3.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg4.png | awwwards-2026-dev-ryan-ritzenthaler-mobile-seg0.png | awwwards-2026-dev-ryan-ritzenthaler-mobile-seg2.png | awwwards-2026-dev-ryan-ritzenthaler-mobile-seg4.png

## Roshan Sahu — folio — https://roshan-sahu.com/ · Awwwards Honorable Mention, Jul 2026 — creative developer/engineer personal portfolio
- **desktop**:
  - Hero: parenthetical quote-bubble intro '(Hello! I'm Roshan Sahu, a web developer and engineer...)' floating top-center, then huge wide-tracked stacked wordmark 'creative DEV' with a small photo of his desk setup embedded MID-WORD, breaking the letterforms — narrative-with-inline-media hero, no chips.
  - Work index is NOT a grid: it's a sequence of alternating SPLIT 50/50 rows — full-bleed live-site screenshot on one side, solid-black panel on the other with a large serif project title ('JAYESH PORTFOLIO [OPEN]'), a 2-line stack of plain tags (WEBFLOW, GSAP, SCROLL-EFFECT / ROLE: WEB DESIGN & DEVELOPMENT) and no card border at all.
  - Each case screenshot sits inside a custom colored/textured backdrop matching that brand's palette (floral yellow/red backdrop bleeding around a fashion-store screenshot) rather than a neutral card background.
  - 'PLAYGROUND' section: header row with 'EXPERIMENTS / ANIMATIONS / 3D' filter labels, then a loose, unevenly-spaced horizontal row of small experiment thumbnails at different sizes — not a uniform grid.
  - About: split 50/50 — huge justified all-caps bio paragraph on black background (left) + portrait photo (right), single '[KNOW MORE]' link, no bullet chips.
  - Contact: full-bleed near-black band, giant 'LET'S WORK TOGETHER' typographic line, footer nav column list (HOME/WORK/SERVICES/FAQ/ABOUT ME), email + 'QUICK CHAT' (WhatsApp icon) + live local time ('IST - 09:07:55'), social row, persistent 'W. / Honors' vertical sidebar tab visible on every screen.
- **mobile**:
  - The desktop split 50/50 work rows become STACKED verticals: full-bleed screenshot on top, black text panel directly below, full width — same visual language, no re-design needed, and the persistent 'W. Honors' tab shrinks to a small tab pinned mid-right edge.
  - Hero's giant 2-word wordmark collapses to plain stacked lines ('ENGINEERING / IMMERSIVE / WEB EXPERIENCES') dropping the inline embedded photo entirely on the smallest viewport — text-only mobile hero variant.
  - Nav bar (Work/Services/FAQ/About Me links) becomes a hamburger; a persistent 'EXPLORE ALL WORK' underlined link sits fixed at the very top of the work list on mobile as a quick jump-back affordance.
- **motion**:
  - Case-study images likely have a subtle scroll-linked reveal/scale (typical intersection-observer reveal); no evidence of WebGL — pure image + CSS.
  - Live IST clock ticks in real time in the footer (small JS interval, not a heavy animation).
  - Filter labels (EXPERIMENTS/ANIMATIONS/3D) look like simple hover-underline toggles for the playground grid.
- **steal**: Replace maxfolio's uniform white/gray case-study card background with a backdrop color/texture pulled from each store's own brand palette bleeding around the screenshot — cheap, per-store visual variety across 19 stores without inventing new layout, and it directly answers 'never the same treatment for every store.'
- screenshots: awwwards-2026-dev-roshan-sahu-desktop-seg0.png | awwwards-2026-dev-roshan-sahu-desktop-seg1.png | awwwards-2026-dev-roshan-sahu-desktop-seg2.png | awwwards-2026-dev-roshan-sahu-desktop-seg3.png | awwwards-2026-dev-roshan-sahu-desktop-seg4.png | awwwards-2026-dev-roshan-sahu-mobile-seg0.png | awwwards-2026-dev-roshan-sahu-mobile-seg1.png | awwwards-2026-dev-roshan-sahu-mobile-seg3.png

## Léo Parpeix Portfolio 2026 — https://leoparpeix.com/ · Awwwards Honorable Mention, Aug 2026 — Art Director / Interactive Designer personal portfolio
- **desktop**:
  - Hero: full-bleed 3D-rendered 'artist studio' scene (giant plush flower sculpture, arched windows, ladder) with a tiny 'Click to feed the bee' Easter-egg prompt top-center and plain name/role text top-left — no cards, purely environmental/illustrative.
  - 'Bonjour' intro: split 50/50 — friendly first-person paragraph left, a plain business-card mockup ('LÉO PARPEIX' on white) right.
  - Work display is a literal 3D BOOKSHELF: laptop/phone/tablet mockups of each project sit physically ON shelves among books and decor, as if browsing a real shelf — a media-first collage that replaces the work grid entirely with a spatial metaphor.
  - Work index also offers a VIEW-SWITCH TOGGLE in the header (two icon buttons: a small bar-chart/thumbnail icon and a hamburger/list icon) that flips the SAME 29 projects between a visual shelf/grid view and a plain numbered TEXT LIST ('12 L'Oréal — Digital magazine', '13 TOUGO', … each with a chevron to expand) — no images at all in list mode.
  - Footer: full-bleed pale background, giant 'LET'S CREATE A REMARKABLE JOURNEY' headline with a cartoon bee icon literally replacing the 'O' in 'Create', Instagram/email/LinkedIn row, Credits link, © 2026.
- **mobile**:
  - The view-toggle icons persist on mobile and the plain numbered TEXT LIST mode (no images, just number + name + category + chevron) becomes the default-feeling, highly scannable pattern — proof that 'switch to a plain list' is a legitimate, good-looking way to shrink a heavy visual index down for small screens.
  - 3D bookshelf hero scene reflows to a narrower vertical crop but keeps the same spatial/shelf metaphor rather than swapping to a flat grid.
  - Header condenses to name + hamburger; the two view-icons stay visible next to the hamburger even on mobile (kept as a persistent utility, not hidden in a menu).
- **motion**:
  - 3D WebGL scene (flower, shelf, bee) with camera drift/parallax on scroll — this exact tech is off-limits for Max (Three.js/WebGL) but the CONCEPT (spatial/physical metaphor for 'my work sits on a shelf') is portable via a flat illustrated SVG/CSS parallax collage.
  - Toggle between grid/list view snaps instantly (likely a simple state swap with a fade, not physics-based).
- **steal**: Add a persistent icon-pair TOGGLE ('grid view' / 'list view') to the header of the 'Shopify work' index so visitors — and specifically mobile visitors — can collapse the current heavy screenshot-cards into a plain numbered text list (store name + one-line feature + chevron); ship list-view as the mobile default and grid as desktop default, which literally satisfies 'sections that completely change on mobile.'
- screenshots: awwwards-2026-dev-leo-parpeix-desktop-seg0.png | awwwards-2026-dev-leo-parpeix-desktop-seg1.png | awwwards-2026-dev-leo-parpeix-desktop-seg3.png | awwwards-2026-dev-leo-parpeix-desktop-seg5.png | awwwards-2026-dev-leo-parpeix-mobile-seg2.png | awwwards-2026-dev-leo-parpeix-mobile-seg4.png

## HAOQI.DESIGN — https://haoqi.design/ · Awwwards Site of the Day, Aug 14 2026 (score 7.36) — product designer & design engineer at TikTok
- **desktop**:
  - Single full-viewport 'business card' landing screen (no scroll to more sections on the homepage): 3-column header row — wordmark + 'Design & Engineering' left, 2-line manifesto 'Thinking in systems. Designing with care.' center, first-person bio blurb + WORK/CONTACT/THEME/SOUND nav right.
  - Center of the screen: a huge glossy 3D-rendered cursive 'hello' wordmove (looks like inflated balloon type) sitting over a soft sky-blue/cream gradient with diagonal light-beam streaks and a halftone dot pattern in the corners.
  - Below-left: bold condensed all-caps headline 'I BRING CRAFT & TASTE TO DIGITAL WORK' where the last couple of characters are LIVE, cursor-reactive glitch/placeholder characters ('%N>') that change as the mouse moves — a tiny generative-type Easter egg.
  - Bottom bar: live-feeling utility readouts — 'GMT+8 CN 22:35 28°C' (timezone/local weather) on the left, cursor coordinates '0720 X 0450 Y' center, a small globe icon + theme toggle right — decorative 'HUD' framing rather than content.
  - Sticky scrollbar-style indicator on the right edge (small pill) suggests the real case-study content lives behind a THEME[dark/light] toggle or on separate WORK route rather than a long homepage scroll.
- **mobile**:
  - 3-column header collapses to a single stacked column: wordmark+role top-left, hamburger top-right, headline stack moves below the 'hello' 3D wordmark instead of beside it, and the manifesto/bio text drops to below the fold as a simple paragraph — same components, fully restacked.
  - The cursor-reactive glitch characters and coordinate HUD readouts are simplified/removed on touch (no cursor to react to), leaving a cleaner static headline — evidence that a cursor-driven Easter egg should degrade gracefully to nothing on mobile rather than faking it.
- **motion**:
  - Glossy 3D cursive word looks pre-rendered/baked (a 3D render or Spline/GLB export composited as an image or lightweight WebGL canvas) rather than a full 3D scene — visually rich but likely cheap to render statically.
  - Cursor-position-driven text substitution ('%N>' style) is a lightweight JS mousemove listener, not physics — directly reproducible with CSS/JS only (no WebGL) for Max's hard constraints.
  - Diagonal light-beam streaks look like a static or slow CSS gradient animation, not real-time lighting.
- **steal**: Steal the 2-line manifesto eyebrow ('Thinking in systems. Designing with care.') pattern for maxfolio's hero: a short, punchy 2-line CTO-voice statement placed beside the name, plus a tiny cursor-reactive character-glitch detail on one headline word (pure JS mousemove + text swap, zero WebGL) to add 'dynamic' personality points cheaply.
- screenshots: awwwards-2026-dev-haoqi-desktop-seg0.png | awwwards-2026-dev-haoqi-desktop-seg1.png | awwwards-2026-dev-haoqi-desktop-seg2.png | awwwards-2026-dev-haoqi-mobile-top.png | awwwards-2026-dev-haoqi-mobile-full.png

## Minh Pham — https://minhpham.design/ · Awwwards Site of the Day, 2023 (not 2026, kept for the client-wordmark and gated-hero patterns) — Design Lead at Fantasy (Ford/UFC/NFL work)
- **desktop**:
  - Gated entry: black screen with a small logo mark and a 'START' pill button — nothing renders until clicked (a real UX cost, flagged in Avoid).
  - Hero after entry: bold condensed headline 'MAKING GOOD SHIT SINCE 2009' with a big flat orange CIRCLE overlapping/occluding part of the word 'GOOD' at an angle, VR-headset portrait photo behind, persistent LEFT-EDGE icon rail (globe/Instagram/play/LinkedIn) docked for the whole session, small vertical 'SOUND ON' toggle right edge.
  - Scroll reveals a duotone giant-text pull-quote over a photo: 'Over a decade of experience in interactive design and working with some of the most talented people in the business' with the phrase 'a decade' highlighted in orange — text doubles as the transition, no separate stat card.
  - Client roster shown as GIANT overlapping stacked wordmarks ('FORD / UFC / LINCOLN / ROYAL CARIBBEAN / SLEEPIQ / NFL') layered directly over a slowly rotating monochrome globe graphic with a single orange location pin — replaces a logo-strip/marquee with oversized typography.
  - Footer: 'GOOD DESIGN IS HONEST — Dieter Rams' quote over a portrait, two-column 'Connect' link list (Dribbble/YouTube/LinkedIn, Instagram/Facebook/Behance) each with a small red diagonal arrow icon, email + phone.
- **mobile**:
  - The gated 'START' screen is replaced by an inline circular 'PRESS' dial (dashed circular text reading PRESS/PRESS/PRESS) with a finger-tap icon in the center — the exact same gate mechanic is re-skinned as an explicit touch affordance instead of relying on an invisible click target.
  - The orange-circle text-occlusion trick is REMOVED on mobile — headline lines simply alternate color (tan/orange/tan) top-to-bottom with no overlap, i.e. a decorative collision effect is dropped rather than forced onto a small screen.
  - Giant overlapping client-name typography carries over almost unchanged to mobile (still oversized, still overlapping the globe graphic) — proof this specific component needs no mobile-specific redesign, just smaller type.
- **motion**:
  - Orange circle-on-text overlap is a simple z-index/mix-blend-mode trick (no interaction needed) — CSS-only and Lighthouse-safe.
  - Globe graphic rotation is a slow, probably canvas or looping-image animation — reproducible as CSS transform rotate or a lightweight looping video/WebM instead of WebGL.
  - Circular 'PRESS' text likely animates via SVG textPath + CSS rotation, a common, cheap technique.
- **steal**: Replace maxfolio's 'fleet marquee' ticker with Minh Pham's giant overlapping client/store-name typography treatment layered over a subtle slow-rotating world outline — bigger visual impact than a scrolling logo strip, ties directly into Max's 'CTO working across LATAM/US stores' story, and is pure CSS/SVG (no WebGL).
- screenshots: awwwards-2026-dev-minh-pham-desktop-seg0.png | awwwards-2026-dev-minh-pham-desktop-seg1.png | awwwards-2026-dev-minh-pham-desktop-seg2.png | awwwards-2026-dev-minh-pham-desktop-seg4.png | awwwards-2026-dev-minh-pham-mobile-seg0.png | awwwards-2026-dev-minh-pham-mobile-seg2.png

## Pacôme Pertant Portfolio — https://pacomepertant.com/ · Awwwards Portfolio Honors, Jun 2026 — motion & sound designer, Paris
- **desktop**:
  - Sound-gate splash screen ('enter with sound' / 'enter without sound') before anything else loads.
  - Main work view is a 3D 'SPIRAL' of floating project cards/thumbnails tumbling in space at different depths/rotations against a black dot-grid background — a literal alternative to a grid: work items scattered as tilted cards in a loose cluster, each a small motion/branding thumbnail, with a top-center 'spiral / list' TOGGLE (so, like Léo Parpeix, it can flip to a plain LIST view) and a top-right 'menu' pill.
  - A small circular animated logo-avatar sits top-left at all times; a mute/unmute icon bottom-right; a small year/label tag ('2025 • showreel') pinned bottom-left of the cluster.
- **mobile**:
  - The same tumbling 3D card cluster renders at mobile width nearly unchanged (cards just get visually denser/overlap more) — spiral/list toggle and menu pill persist in the same corners — this one did NOT redesign for mobile, it just let the 3D scene reflow, which is a cautionary example (see Avoid) since dense overlapping cards are harder to tap accurately on a small touchscreen.
- **motion**:
  - 3D WebGL card cluster with per-card tilt/rotation and presumably slow drift — off-limits tech for Max, but the compositional idea (loosely scattered, rotated project tiles instead of a grid) is achievable with CSS transforms + framer-motion (random rotate/translate per tile, subtle parallax on scroll) without any 3D engine.
  - 'spiral ↔ list' toggle again reinforces the same pattern seen at Léo Parpeix: give a dense visual index an instant plain-list escape hatch.
- **steal**: Borrow the 'scattered, tilted tile cluster' compositional idea (not the WebGL) for a small side-project or 'experiments' rail on maxfolio: render 6-8 small preview tiles at slightly randomized rotation/offset using CSS transform + framer-motion drag, as a livelier alternative to a straight row for lower-stakes content (Gallery or Projects section).
- screenshots: awwwards-2026-dev-pacome-pertant-desktop-top.png | awwwards-2026-dev-pacome-pertant-mobile-top.png

## Gionatan Nese '26 — https://www.gionatannese.com/ · Awwwards Site of the Day + Developer Award, Sep 05 2026 — multi-disciplinary designer, Milan
- **desktop**:
  - Entire homepage appears to be a single, non-scrolling full-viewport screen (scrollHeight equals viewport height): plain 3-column header (name / small monogram 'GN.D' / role) on an all-white ground, a small page-index numeral ('030') centered at the bottom — extremely minimal, almost blank 'business card' landing, with real work presumably behind nav/subpages.
  - No visible chips, cards, or imagery on the main screen at desktop width — all restraint, purely typographic.
- **mobile**:
  - Mobile reveals content the desktop capture did not (likely a scroll-triggered or viewport-conditional layout): a 'Creative Space' label with numbered filter tabs (1/2/3) sits under the monogram, followed by a loosely SCATTERED, organically-arranged COLLAGE of small square product/lifestyle photos at varied sizes and vertical offsets — not aligned to any grid, more like pins on a corkboard.
  - This scattered-collage mobile pattern is a genuine 'section completely changes on mobile' example: the desktop shows almost nothing, the mobile view shows a rich, informal moodboard-style index instead of a formal grid.
- **motion**:
  - Given the extreme minimalism captured, motion is likely limited to hover states and a subtle intro fade — no strong evidence of heavy scroll-triggered animation on the homepage itself (deeper interaction likely lives on sub-pages not captured here).
- **steal**: For maxfolio's Gallery/Skills sections, replace an aligned image grid with a loosely scattered, corkboard-style collage of tool icons or store screenshots at varied rotation and vertical offset (framer-motion stagger-in on scroll) — reads as far less 'templated card grid' than a uniform grid while staying simple CSS/JS.
- screenshots: awwwards-2026-dev-gionatan-nese-desktop-top.png | awwwards-2026-dev-gionatan-nese-mobile-top.png | awwwards-2026-dev-gionatan-nese-mobile-full.png

## Julien Calot — https://www.juliencalot.com/ · Awwwards Site of the Day, Jul 08 2026 — visual artist / multidisciplinary creative (fine-art e-commerce, lower relevance to a dev/CRO persona but included for the full-bleed browsing pattern)
- **desktop**:
  - Full-bleed single artwork fills the entire viewport as the 'hero' (a large painted portrait) with minimal chrome: wordmark top-left, a 'BY SERIES / BY COLORS' filter-toggle top-center-left, ARTWORK/DRAWINGS/EMBROIDERIES nav top-right, ABOUT/CONTACT/PANIER(0) far right.
  - Series metadata is overlaid directly on the artwork itself in small caps: year + series title bottom-left ('2024 — MEDITANTS'), piece count bottom-right ('21 — PIECES') — captions live ON the full-bleed image rather than below it in a card.
- **mobile**:
  - Not independently verified beyond the same full-bleed single-artwork treatment (capture did not advance past the first artwork on either breakpoint within the wait window) — treat the 'BY SERIES / BY COLORS' filter toggle and on-image caption placement as the transferable ideas rather than a confirmed mobile transformation.
- **motion**:
  - No motion evidence captured (five consecutive scroll positions returned an identical frame, suggesting either a very slow transition, a click/arrow-driven artwork browser rather than scroll, or a stalled load) — flagged rather than asserted.
- **steal**: Steal the caption-on-image placement (small caps metadata sitting directly on the full-bleed photo, not in a card below it) for maxfolio's Gallery carousel captions — removes one more 'card' from the page.
- screenshots: awwwards-2026-dev-julien-calot-desktop-seg0.png

## ideas
- Give the 'Shopify work' index a persistent grid/list VIEW TOGGLE (two small icon buttons, à la Léo Parpeix and Pacôme Pertant): grid/visual mode for desktop default, plain numbered text-list mode (store name + one-line result + chevron, zero screenshots) as the mobile default — this alone satisfies both 'too much info in cards' and 'sections that completely change on mobile.'
- Rebuild the case-study reveal so a small pinned info card (store name + 2 metric chips, rotating per store) stays fixed while the actual store screenshot/site scrolls past behind it edge-to-edge (Ryan Ritzenthaler's sticky-name-over-live-sites trick) — replaces the current screenshot+chart sheet with something that feels like browsing real sites, not a dashboard.
- Vary the metric chips shown per store instead of the same repeated stack tags — pull whichever 1-2 metrics are genuinely most interesting for that store (a Roshan Sahu / Ryan Ritzenthaler pattern where tags differ) so the owner's 'never the same metrics for every store' complaint is structurally impossible to violate.
- Replace the flat white/gray card background behind each case-study screenshot with a backdrop tint/texture pulled from that store's own brand palette (Roshan Sahu) — instant per-store personality with zero new layout code.
- Rework the Process (5 steps) section away from a scroll-stepper-with-pinned-numeral toward Minh Pham's giant duotone pull-quote treatment: one big sentence per step scrolling over a full-bleed photo/gradient, with the key phrase in an accent color — no cards, no numerals-as-cards, just typography-in-motion.
- Replace the fleet/'Now' marquee ticker with oversized overlapping store-name typography layered over a slow-rotating world-outline graphic (pure CSS/SVG, Minh Pham's client-wordmark treatment) — bigger, more 'CTO working across LATAM/US' than a scrolling logo strip.
- Add a small persistent vertical sidebar tab (Roshan Sahu / Ryan Ritzenthaler's 'W. Honors' tab) reading something like 'Available' or 'CTO @ Digitdeck' pinned to the viewport edge through the whole scroll — a low-cost, always-visible trust/CTA signal that isn't a card.
- Give Skills/tech-stack a scattered corkboard-style collage of tool icons at slight random rotation/offset (Gionatan Nese's mobile moodboard) instead of inline chips, staggered in with framer-motion on scroll — reads as designed, not templated.
- Add ONE small cursor-reactive text glitch on a hero headline word (Haoqi's '%N>' trick) — pure JS mousemove + character swap, degrades to nothing on touch — cheap 'dynamic animation' credit without WebGL.
- Insert full-bleed typographic pull-quote interstitials (Ryan Ritzenthaler's 'SPEED' / 'It This Far!') between any two sections that would otherwise both read as card-grid-shaped, satisfying the 'never 2 consecutive same archetype' rule for free.
- For Year-by-year experience, try replacing the hairline timeline with a sequence of single giant duotone statement-scrolls (one per era, Minh Pham style: 'Over a decade of...') instead of a list of years — turns a dense timeline into a narrative you scroll through.
- Put a small live micro-detail in the footer/contact area — local time + one honest live stat (not invented) — mirroring Haoqi's 'GMT+8 CN 22:35' and Roshan Sahu's 'IST - 09:07:55' ticking clock, for a 'this is a real working developer' feel.
- On mobile, let the Gallery carousel captions sit directly on the image (Julien Calot) rather than below it in a caption bar, freeing vertical space on small screens.
- For the Contact section, add one small playful cursor/touch Easter egg near the primary CTA (Léo Parpeix's 'click to feed the bee') implemented as a CSS/framer-motion sprite reacting to hover/tap — reinforces 'more dynamic animation' + 'zero AI slop' by being a genuinely bespoke, non-generic detail.
- When switching the work index to list-mode on mobile, keep the desktop grid/visual mode reachable via the same toggle rather than removing it — so power users (recruiters skimming on desktop) still get the rich version while mobile DTC-owner visitors get the fast scan.
## avoid
- Never gate real content behind a 'START' / 'enter with sound' / click-to-continue splash (Minh Pham, Pacôme Pertant, Léo Parpeix all did this) — kills first-impression speed and directly conflicts with Max's Lighthouse-100 and honesty goals.
- Never rely on a heavy WebGL/3D hero scene (Léo Parpeix's 3D room, Pacôme Pertant's tumbling card cluster, Haoqi's likely-3D 'hello') — explicitly excluded by the hard constraint (no WebGL/Three/GSAP); steal the compositional idea, not the tech.
- Don't let a dense, tilted/overlapping tile cluster (Pacôme Pertant) reach mobile completely unchanged — it just gets more cramped and harder to tap; any 'scattered tile' idea needs an explicit, simplified mobile layout, not just a narrower viewport.
- Don't repeat the same 2-3 stack chips (NextJS / Tailwind CSS / Prismic CMS) on every single project card the way Ryan Ritzenthaler does — it reads as templated rather than differentiated, which is exactly the owner's complaint about 'never the same metrics for every store.'
- Avoid a page that appears to never scroll or advance past its first frame (Julien Calot's five identical scroll captures) — if a surface needs click/arrow navigation instead of scroll, make that obviously interactive, not silently static.
- Avoid heavy blackletter/gothic display type for Max's positioning — striking on Ryan Ritzenthaler's personal-brand site, but risks reading as costume/novelty rather than CTO-credible for a DTC-owner and recruiter audience.
- Avoid decorative live-readout HUD chrome (timezone/weather/cursor-coordinates) unless it is genuinely real and purposeful — used tastefully it adds personality (Haoqi, Roshan Sahu), but it tips into AI-slop/gimmick territory fast if the numbers are fake or the detail has no connection to the content.
- Don't force a cute cursor/touch Easter egg (the bee, the 'PRESS' dial) to be the ONLY way to reveal key content — every one of these examples still exposed the core message even before the Easter egg fired; a playful detail should be additive, never load-bearing.

# CRITIC

- **footer-design-patterns**: No lens does dedicated footer research. Footers appear only as incidental mobile-collapse notes inside other lenses (Baymard's 40+-link footer stacking to one column, joshwcomeau's wave-footer, jonas.do's bracket-checklist footer links, Podium's near-empty single-hairline footer) — none of it aimed at answering what maxfolio's OWN footer should be (sitemap vs minimal, social links, legal/credits, language switch placement, a closing CTA repeat). Given the owner wants clearer CTAs and zero card soup end-to-end, the footer is the one full section of the page with no primary research pass. — Find 6-8 2025-2026 dev/design portfolio and small-agency sites with a deliberately designed footer (not a default template stub) and capture footer treatment at both 1440 and 390px: link density (minimal vs full sitemap), whether a CTA repeats there, social/contact icon treatment, legal/credits microcopy tone, and any language/theme switcher placed in the footer. Good galleries to pull from: Awwwards SOTD/Honorable Mention Sept 2026, Godly, Lapa Ninja 'footer' category, and the same portfolio set already used in hero-identity/contact-cta (leerob.com, delba.dev, samuelkraft.com, swyx.io, jonas.do) since their footers weren't the focus there.
- **dark-mode-and-theme-toggle**: Dark mode is never mentioned in any of the 14 lenses — no site was checked for a light/dark toggle, no pattern for how a toggle should look/behave, and no mobile-specific behavior for one (does the toggle survive the hamburger collapse? does it respect prefers-color-scheme? is there a third 'system' option?). This matters directly for 'zero AI slop' and 'more dynamic' since a well-executed theme transition is a cheap, real animation opportunity the sweep never surfaced. — Research 6-8 2025-2026 developer/design portfolios that ship a real light/dark toggle (not just OS-level prefers-color-scheme with no UI control) — check leerob.com, swyx.io, samuelkraft.com, kentcdodds.com, and 3-4 Awwwards dev-site winners for a toggle. Capture: toggle placement/iconography, transition mechanics (crossfade vs instant vs animated icon morph), whether toggle position/behavior changes on mobile (390px), and whether any site re-tints photography/screenshots per theme rather than just swapping background/text colors.
- **language-switcher-ux**: Maxfolio's content is typed in EN/ES/JA (per memory: 'contenido EN/ES/JA tipado') but not one lens investigated how any reference site implements a language switcher — placement, flag-vs-text-code convention, dropdown vs inline toggle, and critically its mobile transform (does it collapse into the hamburger menu, become a bottom-sheet picker, or stay a persistent pill?). copywriting-refs only touched translated CTA COPY tone, not the switcher UI itself. — Find 5-6 multilingual portfolio/agency/SaaS marketing sites (dev portfolios rarely localize, so widen to agency sites serving LATAM/Japan/EU markets, or docs sites like Vercel/Stripe/Shopify.com with a language picker) and capture the language-switcher pattern at 1440 and 390px: is it a flag icon, a 2-3 letter code, or a full language name; dropdown, modal, or inline segmented control; where it sits in the header/footer; and whether it persists as a floating control or moves into a mobile menu.
- **case-study-sheet-modal-mobile-mechanics**: Multiple lenses (awwwards-2026-dev, galleries-2026, scrollytelling-products) reference a 'case-study sheet' or 'card opening into a detail view' conceptually, but none actually captured how a modal/sheet/overlay panel behaves on mobile specifically: full-screen takeover vs bottom-sheet drag-to-dismiss, whether the URL updates for deep-linking/back-button support, scroll-lock behavior on the page behind it, and the close affordance's placement/size for thumb reach. This is explicitly one of maxfolio's core interaction patterns (opening a store's case study) and it has zero direct mobile evidence. — Find 5-6 sites where clicking/tapping a project or case-study tile opens a detail view as an overlay (not a full page navigation) — check Ryan Ritzenthaler, Jordan Robson (Panconesi/Facets), Framer marketplace templates, Linear's changelog entries, or any Awwwards portfolio with a project-detail modal — and specifically test at 390px: does it become a full-screen sheet, a bottom drawer with a drag handle, or stay a centered modal; how is it dismissed (X button placement, swipe-down, back-button/back-gesture, tap-outside); does the browser URL/history update; and is background scroll locked.
weak: tech-stack / Samuel Kraft: mobile behavior explicitly 'Not fully captured this pass' — the steal recommendation (inline-glyph device) is inferred from the desktop-only capture, not verified against real mobile rendering. | tech-stack / Gionatan Nese '26: mobile marked 'genuinely unverifiable further without manual scroll interaction' — the negative-space lesson drawn from it (skip a tech-stack section in the hero) rests on an unconfirmed capture. | tech-stack / Khanh Nguyen: mobile 'unverified beyond the hero due to custom-scroll' — the vertical wordmark + metadata row steal is not confirmed to exist/work at 390px. | experience-timelines / De Ruien: 'could not evaluate the timeline-specific mobile behavior because the timeline component itself never loaded' — the steal is about surrounding page texture, not the timeline pattern the lens was supposed to investigate. | mobile-transforms / Displace: mobile 'Not captured' entirely, yet a steal (windowed-panel/sidebar-as-index metaphor) is still offered speculatively. | mobile-transforms / Metalab: mobile 'Same single-hero-only behavior... content does not extend past the first screen in this capture' with steal marked N/A — effectively a null finding included as a full row. | results-charts / Northbeam: mobile 'Could not capture — page timed out loading on mobile in this pass' — the before/after delta-chip steal is based on desktop only, no mobile evidence despite results-charts being a lens explicitly about chart presentation across breakpoints. | awwwards-2026-dev / Pacôme Pertant: mobile note admits 'this one did NOT redesign for mobile' and is explicitly flagged as a cautionary/avoid example, but is still formatted identically to positive steals, risking it being read as a recommended pattern. | galleries-2026 / jackentee.com: 'Not captured (site timed out under the mobile viewport during this pass)' with an explicit 'worth a manual re-check before committing to it as a primary reference' — yet its steal (taxonomy table) appears in the final ideas list without that caveat carried forward. | galleries-2026 / Julien Calot: 'Not independently verified beyond the same full-bleed single-artwork treatment... capture did not advance past the first artwork on either breakpoint' — a real mobile transform claim is not actually demonstrated. | galleries-2026 / Gionatan Nese, Maria Vasilyeva, Kenj Pena, Leonardo Moreira: all four marked 'Not captured at this depth' yet each still contributes a steal to the final ideas list — four of the lens's ~12 sources have zero visual evidence behind their recommendation. | process-sections / Instrument: 'Not deeply verified section-by-section on mobile for /services (time-boxed)' — the alternating full-height editorial band steal is generalized from the homepage, not the /services page it's attributed to. | process-sections / Displace-style note under Metalab and Displace rows: both are effectively non-findings (unverified / N/A) padding out the source count for the lens. | hero-identity: several steals read as generic best-practice advice restated in reference-specific language (e.g. 'put a strong CTA in the hero,' 'shorten the hero') rather than a specific mechanism tied to a screenshot — low information density relative to the length of the ideas list. | copywriting-refs: no screenshots/visual evidence anywhere in this lens (it's pure text/copy analysis) — findings about mobile copy reflow (e.g. Superhuman's abstraction-to-number swap) are asserted without a captured before/after image, unlike the visual lenses.
# LENS: galleries-2026 (agent a6cadad0f308c879b)

## Khanh Nguyen — Folio Edition — https://khanhnguyen.design/ · ©2026, listed on Siteinspire 5 days ago
- **desktop**:
  - Hero: giant overlapping serif wordmark 'KHANH NGUYEN' cropped top-to-bottom; a thin vertical sidebar running the full left edge holds rotated text ('FOLIO — EDITION', rotated name mark, '© 2026') like a book spine; hamburger icon replaces a normal nav row entirely.
  - Body is structured as literal 'chapters': full-bleed photographic/textured panels slide apart like diptych doors between chapter title cards ('CHAPTER III', 'CHAPTER IV' in huge serif on a dark stone/wood photo).
  - Inside a chapter, services appear as numbered full-bleed panels (01/02/03/04) — each discipline name (ART DIRECTION, DEVELOPMENT) is overlaid on a photo where the discipline is depicted in-scene (a plaque on a wall, a laptop showing a live site on a table), with one caption line beneath each panel.
  - CTA is a plain text link with an arrow ('More about me →'), no button chrome anywhere observed.
- **mobile**:
  - The always-visible rotated sidebar labels collapse behind the hamburger icon (top-left), leaving just the icon + the stacked two-line wordmark and a slim vertical rule.
- **motion**:
  - Chapter panels appear to slide/pan horizontally like opening doors as you progress (inferred from two adjacent scroll captures showing the same photo at different crop/scroll positions with a new chapter numeral sliding in).
- **steal**: Turn 'Year by year' into full-bleed CHAPTER panels: each career era gets one full-bleed textured/photo panel with a giant roman-numeral heading that slides open like a diptych door into the next era, instead of a hairline-timeline list of numerals.
- screenshots: galleries-2026-khanhnguyen-desktop-top.png | galleries-2026-khanhnguyen-desktop-y6000.png | galleries-2026-khanhnguyen-desktop-y8000.png | galleries-2026-khanhnguyen-mobile-top.png

## Eugene Sokolovski — https://sokolovski.pro/ · current, Awwwards-jury badge shown on page
- **desktop**:
  - Header band: avatar+name, one-line positioning, then loose text columns (What I design / Services list) plus an 'Awwwards jury' widget with dot-carousel — no card borders anywhere, just plain text columns.
  - 'Фрагменты' (Fragments) section: 343 raw thumbnails of wildly different aspect ratios (square, tall poster, wide banner) placed edge-to-edge with small gutters — a true masonry contact-sheet with zero card chrome (no border/shadow/label).
  - 'Кейсы' (Cases) index: numbered rows, each a big 2-col layout — large device/browser screenshot left, project name + 1-line description + literal ribbon-icon award badges (colored ribbon SVGs with counts) + a pill CTA ('View case') right.
  - A process/approach moment renders as a converging-V line diagram: two thin diagonal lines meeting at a dot, labeled with one step name + description ('Frontend — to match mocks 100%'), repeating per step scrolled.
  - A literal comparison table for awards: columns for award name / abbreviation / description / count, plain rows with hairlines.
- **mobile**:
  - Header condenses to a slim bar (avatar+name, hamburger); the varied-aspect-ratio Fragments masonry compresses into a tighter, more uniform small-tile grid.
- **motion**:
  - Dot-carousel cycles the awards widget; ribbon badges appear to be hover/reveal elements.
- **steal**: Rebuild the 'Process' 5-step section as a converging-line schematic (thin diagonal connector lines meeting each numbered step label as you scroll) instead of the pinned-numeral card stepper — and consider a raw contact-sheet masonry (no card chrome, mixed real aspect ratios) as an alternate dense entry point into the Shopify work.
- screenshots: galleries-2026-sokolovski-desktop-top.png | galleries-2026-sokolovski-desktop-y3600.png | galleries-2026-sokolovski-desktop-y7200.png | galleries-2026-sokolovski-desktop-y9000.png | galleries-2026-sokolovski-mobile-top.png

## Abhay Singh — https://www.abhaysingh.in/ · current
- **desktop**:
  - Hero: pill-shaped floating nav (name+logo, Email, Instagram icon) above a centered hand-drawn line-art icon, a bold 2-line headline ('Design rescue for noteworthy brands'), one paragraph of bio copy, and a plain pill 'See ↓' scroll cue.
  - Case index is NOT small cards: each project is a full-viewport-width saturated color block (navy, lavender, burnt orange) holding a large real product photo, project name, one sentence, and a pill 'Case study' link; the quantified result line sits OUTSIDE the color block in small gray caption text below it.
  - Two smaller projects appear as a 2-up row (the only card-like moment), still full-bleed photography with overlaid text.
  - Personal section: 'Intuition is underrated' headline + a real photo of the person + 3 short bio paragraphs with plain inline text links, then a hand-drawn icon before the closing 'Send project enquiries' email pill.
- **mobile**:
  - Same full-bleed saturated color blocks stack full-width (never shrink into a card), same off-block gray result caption pattern preserved.
- **motion**:
  - Hand-drawn icon accents (peace hand, fist bump) read as if line-drawn/animated-in; no aggressive page transitions observed.
- **steal**: Rebuild the Shopify case-study reveal as one full-bleed saturated color panel per store (real product photo, store name, one sentence) with the 'Sample data' quantified line placed OUTSIDE the panel in small gray caption text underneath — turns honesty-labeling into a structural habit, not just a footnote.
- screenshots: galleries-2026-abhaysingh-desktop-top.png | galleries-2026-abhaysingh-desktop-full.png | galleries-2026-abhaysingh-mobile-top.png

## Robert Feasley — https://rfeasley.io/ · current
- **desktop**:
  - Split 50/50 hero: left is plain background with 'Robert Feasley / Work' stacked; center is a real iPhone device frame showing an actual app UI screen (fitness app, then a 'Readiness score 89' blue screen moments later); far right holds a 2-line editorial statement ('Language is the interface. / I design systems that shape how products communicate.') in a distinct, smaller type size than the device.
  - Tiny gray credit line under the hero: 'Built with Claude · Codex · Vercel'.
- **mobile**:
  - Hero strips down to name + one tagline line + a plain arrow-down cue; the device mockup and split layout drop below the fold rather than resizing in place.
- **motion**:
  - The phone bezel's screen content changed between two captures seconds apart (a fitness card → a 'Readiness score 89' screen) — an in-place content swap inside the device frame, not a page-level transition.
- **steal**: Show real product/UI in an actual device bezel instead of an abstract line chart for at least one case study — a phone frame mid-interaction with the 'sample data' label literally inside the mock screen, paired with a short 2-line mission statement in a contrasting, smaller typeface off to the side.
- screenshots: galleries-2026-rfeasley-desktop-top.png | galleries-2026-rfeasley-desktop-y0.png | galleries-2026-rfeasley-mobile-top.png

## Jordan Robson (Panconesi — Facets case) — https://jordandrobson.com/ · current
- **desktop**:
  - A literal film-strip metaphor: a horizontal strip of small thumbnail frames runs across the very top like a contact strip/timeline scrubber.
  - Below it, an asymmetric grid of full-bleed photo/video tiles at different sizes, each with its own small 'OFF' toggle pill in the corner (reads like per-scene annotation/lighting toggles from a video editor).
  - A persistent bottom bar holds the project title + a running timecode ('00:03:07', later '00:03:53', '00:03:99'), a Credits link, category tabs (Editorial/Advertising), and the name.
- **mobile**:
  - The asymmetric grid COLLAPSES into a single full-width column of large stacked images; each still carries its numbered label (1.1, 1.2...) and its 'OFF' toggle pill, and the bottom bar (title/timecode/credits/tabs) persists as a slim fixed footer — the interactive chrome survives even though the grid itself becomes a plain vertical scroll.
- **motion**:
  - The on-screen timecode advances across captures, implying a running counter tied to scroll/hover/interaction rather than a static label.
- **steal**: For the Gallery section, replace the 3D-tilt carousel with a 'film strip' concept: a slim persistent bottom bar (project/store title, a real running counter, category tabs) over a stack of full-bleed images each carrying a tiny numbered tag instead of a card caption — collapses cleanly to one column on mobile without losing the chrome.
- screenshots: galleries-2026-jordanrobson-desktop-top.png | galleries-2026-jordanrobson-mobile-y900.png | galleries-2026-jordanrobson-mobile-y1800.png

## Jakub Jakubik — https://jakubjakubik.com/ · ©2025 mark shown on page
- **desktop**:
  - Nav is a cluster of SEPARATE rounded pill buttons — '(JJ)', 'Index of Work', 'Information', 'Email', 'Instagram' — each its own hit target rather than one shared bar.
  - The rest of the first viewport is empty white space with one centered line of type ('Independent designer and developer') and a tiny handwritten-style blue '©2025' mark near the bottom.
- **steal**: Adopt 'each nav item is its own separate pill' (instead of one shared nav bar) for Max's main nav or the Explore theme-switcher — a cheap, distinctive way to avoid a templated-looking header.
- screenshots: galleries-2026-jakubjakubik-desktop-top.png

## jackentee.com — https://jackentee.com/ · current
- **desktop**:
  - Zero-card editorial index: each project is a plain text title row ('RUFUS WAINWRIGHT, I'M A STRANGER HERE MYSELF — Print', right-aligned 'CALL OF DUTY, BLACK OPS 6 — Visual Identity, Digital, Apparel') sitting directly above 1-3 full-bleed photos of different aspect ratios placed side by side, separated only by a hairline — no borders, shadows, or rounded corners anywhere.
  - Footer renders a full-width taxonomy TABLE: category names (All/Creative Direction/Visual Identity/Digital Design/Campaign/Motion Design/Strategy/Print) each with a bracketed count like '[14]', plus a second row of page links (Home/List/Info/Garden) — functions as both filter UI and sitemap, styled as plain text columns with a hairline rule.
- **mobile**:
  - Not captured (site timed out under the mobile viewport during this pass) — worth a manual re-check before committing to it as a primary reference.
- **motion**:
  - None observed at first paint (static reveal).
- **steal**: Turn the Shopify-work filter chips into a full-width taxonomy TABLE at the foot of the index (category name + bracketed count, plain hairline grid) instead of pill chips up top — doubles as an at-a-glance stat and avoids the 'chip = mini card' look entirely.
- screenshots: galleries-2026-jackmcentee-desktop-top.png

## sashamartynchuk.com (current live content: a Staff Product Designer hero, contact iamvisp@gmail.com — domain content may have changed since indexing) — https://www.sashamartynchuk.com/ · current
- **desktop**:
  - Full-bleed near-black hero; top nav is plain text links (Home/Approach/Works/About) with the contact email flush right in the same thin sans.
  - Hero pairs a small eyebrow line ('I design complex software products 0→1') with a MASSIVE bold condensed headline that intentionally bleeds past the viewport edge, and directly beneath it a completely different display face — a loose cursive/handwritten script — for the location line, creating a deliberate two-typeface hero instead of one uniform headline.
- **mobile**:
  - Same black background and same two-typeface pairing preserved at smaller scale: the condensed headline wraps to two lines, the script line stays on one line beneath it.
- **motion**:
  - Not deeply observed at this depth.
- **steal**: Give Max's hero a second, contrasting display face for ONE line only — keep the giant role headline in the current grotesque, but set his location or title-modifier line in a loose script for one beat of personality, exactly the bold-condensed + handwritten-script pairing seen here.
- screenshots: galleries-2026-sashamartynchuk-desktop-top.png | galleries-2026-sashamartynchuk-mobile-top.png

## Gionatan Nese ('26) — https://www.gionatannese.com/ · Awwwards Site of the Day, Sep 05 2026
- **desktop**:
  - Opens on a plain typographic hero: name, an initials mark 'GN.D', role 'Multi-Disciplinary Designer', and a page counter ('090') bottom-center.
  - On interaction the viewport becomes a scattered photo corkboard: dozens of small torn-paper/polaroid-style images of objects (a phone, a rock, a tool, a plant) pinned at organic, non-grid positions and rotations, labeled 'Creative Space' with numbered tabs (1/2/3) to switch boards — a genuine moodboard-on-a-wall feel, not a grid or carousel.
- **mobile**:
  - Not captured at this depth.
- **motion**:
  - The scattered, individually-rotated placement of each image implies a physics- or randomized-on-load scatter animation consistent with 2026 SOTD-level craft.
- **steal**: Offer a 'moodboard' alternate view of the Gallery: scatter the laptop/phone store composites at organic angles on a plain canvas with numbered 'Board 1/2/3' tabs instead of always the 3D-tilt carousel — satisfies the brief's demand for a non-card, non-carousel archetype.
- screenshots: galleries-2026-gionatannese-desktop-top.png | galleries-2026-gionatannese-desktop-retop.png

## Maria Vasilyeva — https://www.mariavasilyeva.com/ · current
- **desktop**:
  - Full-bleed cinematic dark hero built as a fixed-viewport 'player': rotated vertical name label top-left, 'MENU' label top-right, and on the right edge two stacked, explicitly-labeled toggle switches — 'SOUND: ON/OFF' and 'ANNOTATIONS: ON/OFF' — over a slowly reframing close-up portrait photo revealed through a black film-gate mask top and bottom.
- **mobile**:
  - Not captured at this depth.
- **motion**:
  - Real-time parallax/crop reveal of the background photo tied to scroll/wheel input, with a film-gate masking effect top and bottom.
- **steal**: Add a literal, labeled ON/OFF rocker toggle to Max's case-study sheets for something honestly binary — e.g. a 'Sample data' switch — turning the honesty-labeling requirement into a designed UI control instead of small print.
- screenshots: galleries-2026-mariavasilyeva-desktop-retop.png

## Kenj Pena — https://kenjpena.com/ · current
- **desktop**:
  - A case-study 'title card' reveal: full-bleed near-black screen, small close/X icon top-left, a centered logo/loading glyph, and a footer-style credit row spanning the full width — client wordmark + descriptor bottom-left ('CONFIRMED® adidas'), an underlined 'Info' link + discipline/year tag bottom-right ('Product Design, 2024') — functions like a film title card rather than a card thumbnail.
- **mobile**:
  - Not captured at this depth.
- **motion**:
  - A brief loading/name-transition state was observed across repeated captures before the title card settled.
- **steal**: Open Max's case-study sheet with a full-bleed black 'title card' (store name bottom-left, discipline+year bottom-right, one Info link) before the charts/screenshots load, instead of jumping straight into a light card with a header.
- screenshots: galleries-2026-kenjpena-desktop-retop.png

## Leonardo Moreira — https://leonardomoreira.com.br/ · current
- **desktop**:
  - The entire first load renders as an authentic-looking 1999 PC BIOS boot screen (monospace green/amber text: 'Award Modular BIOS v4.51PG', an AOpen chipset ID line, an Energy Star badge, 'Press DEL to enter SETUP'), with the owner's handle worked into the fake hardware ID string ('@leonardomoreira') before (presumably) the real portfolio appears.
- **mobile**:
  - Not captured.
- **motion**:
  - Presumed timed boot sequence before transitioning to the real site (not confirmed beyond the boot screen itself within this capture pass).
- **steal**: Not a direct steal (flagged in avoid list) — but the PRINCIPLE of a bespoke, on-brand loading moment instead of a generic spinner is worth a restrained version: a few lines of monospace 'boot log' text referencing Max's real stack (React 19, Vite, Tailwind, Shopify Liquid) that self-types for under a second before the hero settles.
- screenshots: galleries-2026-leonardomoreira-desktop-retop.png

## Angela Ricciardi — https://angelaricciardi.com/ · current
- **desktop**:
  - Ultra-minimal white canvas; header is plain text (name left, 'Projects, Information, Archive' center, an image counter '001 of 029' right); the entire body is empty white except a horizontal strip of small, heavily blurred/faded thumbnails pinned to the very bottom edge of the viewport, teasing the gallery without showing it clearly.
- **mobile**:
  - Transforms completely into a single large square 'framed print' photograph centered in the viewport with a visible border/mat, plain-text 'Prev / 001 of 029 / Next' controls beneath it, and a small filmstrip of thumbnails underneath that — desktop's edge-peeking strip becomes mobile's one-frame slideshow with an honest numeric counter.
- **motion**:
  - Implied blur-to-sharp resolve of thumbnails on interaction, based on the blurred state captured on desktop.
- **steal**: On mobile, turn any Gallery/case-study image sequence into this exact pattern: one large 'framed' image + Prev/Next text controls + a numeric counter ('001 of 029') + a mini filmstrip beneath — instead of a swipeable card carousel.
- screenshots: galleries-2026-angelaricciardi-desktop-top.png | galleries-2026-angelaricciardi-mobile-top.png

## ideas
- Rebuild 'Year by year' as full-bleed CHAPTER panels (khanhnguyen.design): each career era = one full-bleed textured/photo panel with a giant roman-numeral heading that slides open like a diptych door into the next era, replacing the hairline-timeline list.
- Rebuild 'Process' (5 steps) as a converging-line schematic (sokolovski.pro): thin diagonal connector lines meeting each numbered step label as the section scrolls, instead of the pinned-numeral card stepper — satisfies the owner's explicit 'clearer non-card layout' complaint.
- Add a two-typeface hero moment (sashamartynchuk.com pattern): keep the giant grotesque role headline, but set ONE line (e.g. 'CTO & Shopify Tech Lead' or a location tag) in a contrasting loose script for a single beat of personality.
- Open each Shopify case-study sheet with a full-bleed black 'title card' (kenjpena.com): store name bottom-left, discipline + year bottom-right, one 'Info' link — before any chart or screenshot loads.
- Show real product/UI in an actual device bezel for at least one case study (rfeasley.io): a phone frame mid-interaction with the 'Sample data' label literally inside the mock screen, next to a 2-line mission statement in a contrasting smaller typeface.
- Add a moodboard alternate view for the Gallery (gionatannese.com): scatter laptop/phone store composites at organic angles on a plain canvas with numbered 'Board 1/2/3' tabs — a genuinely new, non-card, non-carousel archetype.
- On mobile, convert any image sequence (Gallery, case-study screenshots) into angelaricciardi.com's pattern: one large 'framed' image + Prev/Next text + a numeric counter ('001 of 029') + a mini filmstrip beneath.
- Restyle the Shopify-work index as full-bleed saturated color panels per store (abhaysingh.in): one dominant color per store, real product/theme photography, store name + one sentence, with the quantified stat placed OUTSIDE the panel in small gray caption text below — makes 'Sample data' labeling structural.
- Replace filter pill-chips with a full-width taxonomy TABLE at the foot of the Shopify-work index (jackentee.com): category name + bracketed count in a plain hairline grid — doubles as a stat band and removes the last 'card-like' chip.
- Give the main nav or the Explore theme-switcher cards each-their-own-pill treatment (jakubjakubik.com) instead of one shared bar/one shared grid, for a cheap dose of distinctiveness.
- Add a labeled ON/OFF rocker toggle to case-study sheets (mariavasilyeva.com) for something honestly binary — e.g. a real 'Sample data' switch — turning the honesty requirement into a designed control, not a caption.
- Use a running counter/timecode readout as a decorative-but-honest touch on the Gallery or stat band (jordandrobson.com), tied to something real (e.g. years of experience ticking, or a store-count) instead of an arbitrary count-up.
- For long editorial indexes (Projects, Shopify work), drop card borders/shadows entirely: plain text title row + hairline rule + full-bleed photography abutting edge-to-edge (jackentee.com) reads curated, not templated.
- Try a raw, uncarded contact-sheet masonry (sokolovski.pro 'Fragments') as a dense, scannable alternate entry into the 19-store index — real screenshots at real aspect ratios, zero card chrome, capped to Max's own verified work only.
- Adopt a restrained 'boot log' loading moment (in the spirit of, but far more subdued than, leonardomoreira.com.br): a few self-typing monospace lines naming the real stack (React 19 · Vite · Tailwind · Shopify Liquid) for under a second before the hero settles, instead of a generic spinner.
## avoid
- Fixed-viewport scroll-hijacking with a custom scroll engine (mariavasilyeva.com, gionatannese.com's overflow:hidden 'player' pattern) — conflicts with the no-WebGL/no-GSAP, Lighthouse-100 constraint; any borrowed motion must run on framer-motion + CSS transform/opacity only.
- Long or ambiguous forced loading states before real content appears (observed on kenjpena.com and mariavasilyeva.com during capture, and by design on leonardomoreira.com.br) — a CTO/recruiter audience needs fast first-meaningful-paint; skip forced intros or cap them under ~1s and make them instantly skippable.
- Gimmicky retro-computer boot screens or long novelty intros (leonardomoreira.com.br) as a literal copy — charming once for a personal dev toy site, but reads as a delay tactic on a B2B-facing CRO consultant's site.
- Audio/sound toggles (mariavasilyeva.com's 'SOUND: ON/OFF') — inappropriate for a portfolio browsed at a desk in a work context; do not add audio at all.
- Dense 300+ item raw masonries (sokolovski.pro's 343-tile Fragments grid) without grouping or labels — risks overwhelming a recruiter looking for the Shopify CRO story; if adopted, cap the count and keep it to Max's own verified work, never mixed with unrelated exploratory noise.
- Tiny multi-pill nav clusters (jakubjakubik.com) without verifying real touch-target size — confirm ≥44px hit areas before adapting the 'separate pill per nav item' idea to mobile.
- Lifting any site's literal copy, photography, or exact type pairing wholesale — steal structure and interaction pattern only; never reuse the actual images or sentences seen in these captures.

# LENS: gallery-media (agent a438c44f86602a435)

## Domaine (formerly Half Helix + Tomorrow) — https://domaineworldwide.com/work · Largest independent Shopify Plus partner, 2026 merged entity
- **desktop**:
  - Header reads 'PROJECTS [51]' next to a one-sentence intro, then a 'Filter Projects' bar — no category chips shown by default, just a single expandable filter control that keeps the header uncluttered.
  - Below that: a strict 3-column uniform grid of 51 tiles. Every tile is a real lifestyle/product photo (not a screenshot) with the client's wordmark logo stamped small in a corner — Gaia Herbs, Hunter Douglas, Peloton, Bandier, Assouline, Creed, etc.
  - Tiny metadata line under each photo (client name, one-line category tag, small icon) — deliberately terse, no case-study paragraph on the index itself.
  - Zero card borders/shadows/rounded corners — the grid reads as an editorial photo wall, not a SaaS card grid.
- **mobile**:
  - 3-col grid collapses to a SINGLE column feed (not 2-col) — each project becomes a full-width photo with the logo overlay, followed directly by a short one-sentence outcome line ('Turning organic authority into higher-converting traffic and a growing AI search channel') instead of the desktop's terse tag.
  - The single-column feed is very long (51 full-bleed photos stacked) — mobile trades density for large, high-quality imagery per project.
- **motion**:
  - Static reveal-on-scroll grid; no carousel or hover-video observed in the captures.
- **steal**: For the Shopify-work section: replace card borders/shadows entirely — each of the 19 stores becomes a full-bleed lifestyle/product photo with the store's wordmark stamped small in a corner and ONE outcome sentence beneath (mobile) or a tiny tag line (desktop), dropping the chart/KPI clutter from the index view entirely (charts stay inside the case-study sheet, which maxfolio already has).
- screenshots: gallery-media-domaine-desktop-top.png | gallery-media-domaine-desktop-full.png | gallery-media-domaine-mobile-scroll1.png | gallery-media-domaine-mobile-scroll2.png

## Fuel Made — https://fuelmade.com/ 
- **desktop**:
  - Hero: conversion-metrics promise headline + 'SEE HOW' / 'View case studies' CTAs.
  - 'Brands that trust us' — a flat 4x5 monochrome wordmark grid (20 logos, no boxes, no color) directly under the services row.
  - KEY SECTION: a full-bleed dark-navy band titled 'Uncover and capture unrealized revenue' with a horizontal TAB STRIP of 5 client logos (The Office Oasis, BK Beauty, Turbie Twist, Smidge, Super7). Clicking a tab swaps the whole panel below: a labeled BEFORE/AFTER pair of full theme screenshots side by side, plus a 2x2 stat grid (Desktop conversion +59%, New visitor conversion +57%, Mobile conversion +62%, PageSpeed +47%) and a 'Full case study' button.
  - Below: a 3-up testimonial-style row with real headshot photos + 1-line result captions (not cards — just image + name + sentence).
- **mobile**:
  - The tab strip of 5 client logos stays as a horizontally-scrollable row (same visual language, no dropdown) — tapping still swaps the Before/After panel beneath it, so the 'one big feature + selector' pattern survives mobile intact rather than being replaced.
  - Before/After device pair stacks vertically instead of side-by-side.
  - Logo trust-wall reflows from 4 columns to 2.
- **motion**:
  - A small inline sparkline/line-chart appears next to the mobile hero headline (2.5%→4.1%) as a decorative proof element, not present on desktop.
- **steal**: Replace maxfolio's flat case-study index with Fuel Made's tabbed spotlight: one dark full-bleed band, a row of 5-6 store-logo tabs, and selecting a tab swaps a Before/After pair + a 2x2 real-metric stat grid in place — this gives 'one big + thumbs' spotlight depth without needing 19 separate card panels on screen at once.
- screenshots: gallery-media-fuelmade-desktop-full.png | gallery-media-fuelmade-mobile-full.png

## Underwater Pistol (UWP) — https://www.underwaterpistol.com/work 
- **desktop**:
  - Long, dense FILTER BAR of 16 real tags in a row (Design, Development, Internationalisation, Migration, UK, Platform consolidation, Systems architecture, Subscription, SEO, Branding, Business Transformation, ERP Integration, B2B, AR direction, Loyalty, CRO, D2C) — much richer taxonomy than the usual 4-5 chips.
  - 3-col card grid: each tile is a real product/lifestyle photo with the client wordmark bottom-left, a 2-line description paragraph, its own tag list, and a 'VIEW PROJECT' button.
  - Grid rhythm is broken every 6 cards by a full-bleed EDITORIAL band (e.g. LYMA: 3 women product photo full width + giant wordmark caption underneath) before returning to cards — this is the exact 'don't stack more than 2 of the same archetype' fix the owner asked for.
  - Bottom: a 4-up blog/insights row with dark overlay photo cards.
- **mobile**:
  - 3-col grid becomes a single column; cards keep full description text (not truncated).
  - 16-tag filter bar collapses into a vertically WRAPPING stack of outline pill buttons (each own line/pair) — takes real estate but stays fully visible text rather than hiding behind a 'Filters' modal.
- **steal**: Insert one full-bleed editorial photo band (client wordmark + hero shot, no card chrome) after every 5-6 store tiles in the Shopify-work grid — a rhythm-breaker between card rows that also gives Max's biggest win (e.g. the highest lift %) a moment of its own.
- screenshots: gallery-media-uwp-desktop-full.png | gallery-media-uwp-mobile-top.png | gallery-media-uwp-mobile-full.png

## Swanky — https://swankyagency.com/portfolio/ 
- **desktop**:
  - Directly under the hero headline: an auto-scrolling horizontal FILMSTRIP of raw mobile PDP screenshots (no device frame, just cropped mobile screens edge-to-edge) — 'Bloom & Blossom', a breastfeeding lifestyle photo, 'Introducing Sandalnut Bloom', a coffee subscription box — mixed content types in one continuous marquee.
  - Below the filmstrip: a plain 4x2 flat monochrome logo grid (no boxes) titled 'Our Shopify Plus portfolio'.
  - Then a 3-col case-study card row with vivid product photography (whiskey glass, colorful pills, perfume) — each with a 'view project' link.
  - Then a full-bleed dark AWARD-BADGE + pull-quote band ('...transformational...') before repeating logo-grid / quote-band / logo-grid rhythm all the way down — cards never appear more than once in a row before a non-card interstitial breaks it up.
  - Ecommerce vertical logos section further down, segmented by vertical, all flat monochrome.
- **mobile**:
  - The filmstrip strip becomes a fixed floating bottom-right 'FEATURED LAUNCH' pill/badge instead of an auto-scroll marquee at the top — the horizontal filmstrip pattern doesn't survive mobile, it's replaced by a small persistent CTA chip.
  - Card rows go single column; logo grids reflow to 2-3 per row.
- **motion**:
  - Filmstrip auto-scrolls continuously (marquee/ticker) at the top of the page on desktop.
- **steal**: Alternate the Shopify-work section's card rows with plain flat logo-grid interludes AND at least one full-bleed pull-quote/award band between every 2 rows of cards — directly solves 'too much info in cards' by giving the eye a rest beat that carries zero data, just typography and a client name.
- screenshots: gallery-media-swanky-desktop-top.png | gallery-media-swanky-desktop-full.png | gallery-media-swanky-mobile-top.png

## MadeByShape — https://madebyshape.co.uk/work/ · 2026-referenced Manchester Shopify/web agency
- **desktop**:
  - Filter control is NOT chips/buttons — it's a typographic sentence-cloud: 'explore all‑47  fashion‑8  fitness & sport‑3  education‑4  health‑5  property‑10  corporate‑6  food & drink‑6  agency‑10  ecommerce‑18  b2b‑23  b2c‑14  shopify‑6  archive‑19' rendered as one running paragraph, bold+black for the active term, muted gray for the rest, small subscript counts after each word — a genuine 'hover-preview typographic list' filter.
  - Below: a true MASONRY with mixed widths/heights — full-bleed portrait photo (Gary Neville shouting, 'G—N' logotype overlay), a landscape laptop-mockup shot, a browser screenshot bled straight into the photo with no device frame, an architecture render, alternating rhythm with no fixed grid.
  - A floating round badge bottom-right with circular rotating text ('Let's talk websites • Let's talk SEO • Let's talk branding') persists across scroll as a roaming CTA.
  - Mid-grid Easter egg: 'You're still here?! You must really like us... [Contact us]' — a personality/copy break placed deliberately deep in the scroll, addressing 'zero AI slop' by injecting an obviously human, funny aside.
- **mobile**:
  - Typographic tag-cloud filter wraps naturally as a paragraph (same treatment, no chip conversion) with a dark-mode toggle and hamburger menu replacing desktop's inline nav.
  - Masonry becomes a single column but each tile keeps small pill tags (e.g. 'Branding', 'Website', '+1') overlaid directly on the photo's top-left corner, image corners rounded.
- **steal**: Turn the tech-stack / feature-filter row into a typographic sentence-cloud instead of pill chips — words sized/weighted by relevance, counts as subscript, bold-black for selected — reads as an editorial moment rather than a UI control, and doubles as a way to show 'many things' (skills, tags) without a grid of boxes.
- screenshots: gallery-media-madebyshape-desktop-top.png | gallery-media-madebyshape-mobile-top.png | gallery-media-madebyshape-desktop-y1600.png | gallery-media-madebyshape-desktop-y3200.png

## Diff (WPP Enterprise Solutions) — https://diff.agency/ 
- **desktop**:
  - Full-bleed video/photo hero, headline over a blurred lifestyle photo, flat white-logo strip (DavidsTea, Effy, Fashion Nova, Gorjana, Matt & Nat, Psycho Bunny, Gymshark) baked directly into the hero image bottom edge.
  - 'Real Clients, Real Results' section: a tight, gapless 3x4 grid (12 tiles) of pure editorial lifestyle/product photography — no logos, no captions overlaid on the image, just a small 2-line caption underneath each — reads like a fashion magazine spread, not a portfolio grid.
  - Two more full-bleed cinematic photo bands (a man in a coat walking a desert horizon; an interior) sandwich a plain-text services list rendered as inline rows, not cards.
  - Footer-area integrations/tool badge grid (Shopify, Klaviyo, Gorgias, Nosto, Loop, Recharge, Yotpo) in a clean bordered tile grid — this is the 'tools we integrate' pattern, useful reference for a stack section even though maxfolio's stack is personal tools not integrations.
- **mobile**:
  - Hero keeps full-bleed image; adds a persistent floating dark pill bottom-right reading 'FEATURED LAUNCH' as a roaming CTA (same idea as MadeByShape's rotating badge, different execution).
  - The 3x4 photo grid collapses to a single-column full-bleed stack, images still edge-to-edge with zero gap — the magazine feel survives the collapse because there was never a card border to lose.
- **steal**: For the Gallery/media section, drop the current carousel's card framing in favor of a tight, gapless, edge-to-edge grid of pure product/lifestyle photography (no captions on the image itself) — on mobile it becomes a single-column full-bleed feed, so the transformation is 'grid → feed' with zero chrome lost either way.
- screenshots: gallery-media-diff-desktop-top.png | gallery-media-diff-desktop-grid.png | gallery-media-diff-mobile-top.png | gallery-media-diff-mobile-full.png

## Studio K95 — https://k95.it/en/works · Awwwards Site of the Day, 11 Aug 2026
- **desktop**:
  - Electric-blue background with a visible warped 3D perspective grid (fine dark-blue gridlines curving toward a vanishing point) behind the whole works list — the 'floor' itself feels alive even though tiles are static images.
  - A floating pill segmented control top-center: 'GRID | LIST' — a genuine view-mode switcher, not just a filter.
  - A floating pill top-right: '● ALL WORKS' plus a second floating pill lower-center reading '● ALL (20)' with a live count badge — filter state is shown as a roaming HUD element instead of a fixed sidebar/topbar.
  - Tiles are 4-across but each column is vertically offset from its neighbors (row 2 sits noticeably higher/lower than row 1) producing a genuine CONSTELLATION-SCATTER feel rather than a rigid grid, even though there's an underlying column structure.
  - Tile content mixes photography, product shots, and pure typographic/poster tiles (a red poster with reversed Latin-looking type) — visual variety keeps 20 tiles from feeling repetitive.
- **mobile**:
  - 4-col scatter collapses to a clean 2-col grid, offset/scatter effect removed (tiles align in strict rows) — the constellation feel is desktop-only, mobile trades it for scannability.
  - The floating GRID/LIST and ALL(20) pills move from top-center/mid-page down to a docked position near the bottom of the viewport, closer to the thumb — filter controls relocate for reachability rather than disappearing.
- **motion**:
  - Background grid appears to have subtle perspective/parallax distortion tied to scroll or cursor (visible curvature suggests a shader or CSS 3D transform, not a flat image) — verify only as an SVG/CSS transform if replicated, per the no-WebGL constraint.
- **steal**: For 19 stores shown as more than a plain list: offer a GRID/LIST segmented toggle (two floating pill buttons) plus a floating '● ALL (19)' count pill instead of a static header — cheap to build in React state, and it reframes the index as an explorable collection rather than a fixed page.
- screenshots: gallery-media-k95work-desktop-top.png | gallery-media-k95work-mobile-top.png | gallery-media-k95-desktop-top.png | gallery-media-k95-mobile-top.png

## Produx — https://www.produx.design/ · Awwwards Site of the Day, 9 Aug 2026
- **desktop**:
  - Giant slashed-zero wordmark hero ('PRØDUX') on pure black, '[SCROLL DOWN]' hint top-left, cookie-consent styled as in-world copy: 'A long time ago, in a browser far far away... [MAY THE COOKIES BE WITH YOU]'.
  - 'Selected projects' is an ASYMMETRIC MOSAIC, not a grid: two small square thumbnails side-by-side (Yoga Network, Gothic AI), then one full-width wide banner project (jurni, an orange gradient brand), then two more squares (a colorful arcade-poster brand, Nolana) — each project gets a different aspect ratio based on how it should be seen, not a fixed template.
  - A pinned/sticky moment: scrolling through the hero text reveals a large tilted photographic card (a mossy floating rock with the PRØDUX wordmark composited on it) that overlays the text beneath it before settling.
  - Client-logo marquee rendered as a horizontal row of individually BOXED dark tiles (Google, Nolana, Geviti, HealwellAI) rather than a flat borderless strip — each logo gets its own dark card with padding.
  - A glitch-text moment: 'Where intent meets execution / identity takes shape' rendered with a duplicated, slightly offset, chromatic-aberration-style layered second copy of the same text (readable as intentional glitch, not a rendering bug).
- **mobile**:
  - Asymmetric mosaic collapses to a plain single-column stack — each project still full width with a small 'View project' link beneath, but the aspect-ratio variety and the wide-banner treatment are lost; mobile normalizes everything to portrait tiles.
- **motion**:
  - Glitch/chromatic-split text treatment on a header line; pinned photo-card reveal over hero text while scrolling; boxed logo marquee auto-scrolls.
- **steal**: For Skills/tech-stack, box each tool logo/name in its own small dark tile in a horizontal auto-scrolling marquee (rather than the current inline-chip sentences) — gives visual weight and rhythm without adding real information density, and it is pure CSS transform/opacity so it survives the Lighthouse-100 constraint.
- screenshots: gallery-media-produx-desktop-top.png | gallery-media-produx-mobile-top.png | gallery-media-produx-desktop-projects.png | gallery-media-produx-desktop-y8600.png | gallery-media-produx-desktop-y9400.png | gallery-media-produx-mobile-full.png

## Vero (Rodeo Studio + Pluto for Vero/Noonlight) — https://www.verostudio.com/ · Awwwards Site of the Day, 8 Aug 2026
- **desktop**:
  - Full-bleed portrait hero photo (bride in gown) with 'VERO' wordmark overlaid, into 3 stacked full-bleed cinematic product photos (dress on a mannequin bust lit orange, a completed white sculpture on a plinth, a woman beside the sculpture) — pure editorial full-bleed, no grid at all for the hero sequence.
  - A PINNED/STICKY typographic moment: serif+italic mixed headline 'WHERE your WEDDING / DRESS BECOMES art.' stays fixed on screen with a live scroll-progress '100%' counter bottom-right while the background settles — confirmed pinned because two different scroll offsets rendered the identical frame.
  - Near the base of the page: a dense CONTACT-SHEET grid of ~35 small square thumbnails (process shots, sculpture details, behind-the-scenes) directly beneath the big pull-quote — a deliberate scale-down from full-bleed hero photography to tiny uniform squares, the opposite move of most portfolios.
  - Closing pull-quote in large serif type: 'I HELD A MOMENT IN MY HAND BRILLIANT AS A STAR...' — pure typographic moment with no imagery.
- **mobile**:
  - Full-bleed portrait hero and photo sequence survive untouched (already portrait-oriented, so no mobile-specific redesign needed there) — a rare case where desktop and mobile hero are nearly identical because the content was shot for portrait from the start.
- **motion**:
  - Scroll-progress percentage counter pinned bottom-right during the sticky typographic section — a small, cheap, CSS/JS-only motion detail that reinforces 'this is a considered scroll moment', not a wall of text.
- **steal**: Add a live scroll-progress indicator (a simple '00–100%' counter, bottom-right, framer-motion useScroll-driven) during maxfolio's Year-by-year or Process section to signal 'this is a paced narrative, not a long page' — cheap, transform/opacity only, no WebGL.
- screenshots: gallery-media-vero-mobile-top.png | gallery-media-vero-desktop-full.png | gallery-media-vero-desktop-thumbgrid.png

## ideas
- Replace the Shopify-work section's uniform card grid with a Domaine-style filterable wall: full-bleed real photography (product/lifestyle, not screenshots) with the store's wordmark stamped small in a corner and a one-line outcome sentence — mobile collapses to a single full-width column, desktop stays 3-col.
- Build a Fuel Made-style tabbed spotlight ABOVE the 19-store index: 5-6 logo tabs, selecting one swaps a Before/After device pair plus a labeled 2x2 real-metric stat grid — gives the strongest 3-4 case studies a dedicated feature moment instead of parity treatment with all 19.
- Break up every 2 rows of store cards with a non-card interstitial — a full-bleed editorial photo + wordmark (UWP-style) or a flat monochrome logo wall + pull-quote band (Swanky-style) — this is the single most direct fix for 'too much information in cards'.
- Turn the tech-stack section into a typographic sentence-cloud (MadeByShape-style): tool names sized/weighted by how much Max uses them, muted-gray by default, bold-black on hover/active, small subscript counts (years used, projects shipped) — replaces the current 'six prose sentences with inline chips' with something more scannable AND more editorial.
- Offer a GRID/LIST segmented toggle (Studio K95-style) on the Shopify-work index — two floating pill buttons plus a live '● ALL (19)' count pill — cheap React state, reframes the index as explorable rather than fixed, and gives mobile a reason to relocate the control near the thumb.
- Give the Shopify-work grid a constellation-scatter feel on desktop only: vertically offset alternating columns (not a rigid row grid) so it doesn't read as a spreadsheet, collapsing to a clean aligned 2-col grid on mobile — desktop gets personality, mobile gets scannability, which is exactly the 'sections that completely change on mobile' the owner asked for.
- Add a Produx-style boxed logo marquee for tools/partners (Klaviyo, GA4, Shopify, etc. — things Max has real depth in): each logo in its own small dark tile, auto-scrolling horizontally, CSS-only transform.
- Add a live scroll-progress percentage counter (Vero-style) during the Year-by-year timeline or the Process stepper — bottom-right, framer-motion useScroll, reinforces pacing without adding new visual noise.
- For the Process section (owner's 5 steps complaint): drop the card/numeral-stepper hybrid and try Produx's asymmetric mosaic logic instead — step 1 gets a wide full-bleed band, steps 2-5 get smaller alternating tiles, so the steps feel like a narrative sequence rather than 5 equal boxes.
- Steal Swanky's floating rotating-text CTA badge (a small circular badge with text running around its edge, 'Let's talk Shopify • Let's talk CRO • Let's talk Growth') as a persistent bottom-right contact nudge that appears after the hero — directly serves the 'stronger CTAs' complaint without adding a sticky bar.
- For the Gallery/media section replacing the current laptop+phone carousel: try Diff's tight gapless edge-to-edge grid of pure store photography (no device frames, no captions on-image) — mobile becomes a single-column full-bleed feed, desktop a magazine-style 3-col grid; much less 'AI slop 3D tilt' feeling than the current carousel.
- Borrow MadeByShape's mid-scroll Easter-egg copy break ('You're still here?! [Contact us]') as a one-off moment somewhere deep in the Shopify-work index — a human, funny aside that directly answers 'zero AI slop' by being something a template generator would never write.
- Consider a small contact-sheet thumbnail grid (Vero-style, ~20-30 tiny uniform squares) as a closing coda after the main Shopify-work section — process shots, behind-the-scenes screenshots, Slack-thread snippets — the scale-DOWN move (big photos → tiny grid) reads as confident rather than padded.
- Use Fuel Made's real labeled stat grid (4 KPIs with %, each captioned in caps: 'DESKTOP CONVERSION RATE') as the template for maxfolio's per-store metrics instead of a chart-heavy sheet — keep 'Sample data' labeling exactly as it is now, just present 2-4 numbers big and bold before showing any chart.
- Borrow Studio K95's mixed-content-type tile logic for the 19-store grid: not every tile needs to be a photo — mix in 1-2 pure-typographic 'poster' tiles (store name in huge type on a flat color) among the photo tiles to break visual monotony across 19 entries.
## avoid
- Don't copy Domaine's cookie-consent modal pattern that fully occludes the hero content until dismissed and reflows scroll position — capture/UX friction, not a design idea worth stealing.
- Don't adopt UWP's 16-tag filter bar wrapping into 8+ stacked lines on mobile — it eats a full screen of vertical space before any content is visible; cap any store-work filter to 5-6 tags max on mobile or hide extras behind a single 'more' toggle.
- Don't use Produx's asymmetric mosaic literally with WebGL/3D tilt effects (the pinned mossy-rock reveal looks GPU-shader-driven) — the Lighthouse-100/no-WebGL constraint rules this out; achieve the visual variety with pure CSS grid-column/row spans and framer-motion opacity/transform only.
- Don't let Studio K95's floating filter pills (GRID/LIST, ALL count) overlap actual content the way they did in one capture (a pill sat on top of a project thumbnail on mobile) — any floating control needs a safe-zone margin from tile edges.
- Don't use Swanky's or Diff's auto-scrolling logo/photo marquees as the ONLY motion in a section — on their own these read as generic 'agency template' motion; pair any marquee with at least one non-marquee moment nearby (a stat, a quote, a mosaic) so it doesn't feel like stock Awwwards-kit motion.
- Don't literally reuse '404 - I guess you guys aren't ready for that yet' joke copy or any other site's specific wording — write maxfolio-original copy in the same spirit, never lift phrasing.
- Don't chase Vero's fully custom Rodeo-Studio-grade production values (museum-quality product photography, custom typeface pairing) as a literal template — maxfolio's placeholder photos won't carry that same weight, so the STEAL should be the structural moves (pinned typographic band, scroll-progress counter, contact-sheet coda), not the art direction.
- Don't add more chips/pills purely to look busy — several of these sites (Domaine, Diff) win by removing chrome entirely (no card borders, no logo boxes) rather than adding more filter UI; resist the urge to bolt a filter bar onto every section just because competitors have one.

# LENS: awwwards-2026-dev-ryan (agent a6ea9f2d36e2acf35)

## Ryan Ritzenthaler Portfolio V2 — https://www.ryanritzenthaler.com/ · Awwwards Honorable Mention, Jul 06 2026 — full-stack web developer, NextJS/Shopify freelancer (closest persona match to Max)
- **desktop**:
  - Hero: two-line blackletter wordmark 'Ryan Ritzenthaler' with a circular rotating badge ('WEB DEVELOPER / FULL-STACK') top-right, short bio + underlined 'reach out here' link, no chips/cards at all.
  - Work index: as you scroll, his name card goes STICKY/pinned (white card, fixed position) while real embedded/screenshotted CLIENT SITES scroll continuously behind it edge-to-edge (Red Robin, skincare DTC sites, med-practice sites) with floating pill tags ('SEO','Performance','Flexibility') and 'Trusted by leading employers' + logo row — the sticky info card + scrolling live-site backdrop replaces a static hero image.
  - Full case-study grid: 2-col cards, each a full-bleed live-site screenshot + a headline over image ('A new standard of personalized care for women') + stack chips (NextJS/Tailwind CSS/Prismic CMS/category) + 'Completed: Dec 2025' + linked project name below the image (image-first, caption below, not a bordered card).
  - Interstitial pull-quote bands break up the grid: a full-bleed black starfield+sun background with giant blackletter 'It This Far!' sits between grid rows; later a huge italic 'SPEED' headline section appears before a 'Shopify Development' category block and a plain text services LIST (not cards).
  - Persistent vertical sidebar tab reading 'W. / Honors' stays fixed on the right edge through the entire scroll (Awwwards honors badge).
  - Footer: giant blackletter 'Let's Build!' CTA next to two plain link columns (Work / Learn) and Reach Out (Inquire, Email) — no card, just a typographic moment + text nav.
- **mobile**:
  - Hero collapses to single centered column: circular rotating badge shrinks and sits above the stacked two-line name; hamburger icon replaces the desktop nav bar.
  - The 2-col case-study grid becomes a single-column stack of the SAME cards (full width, same chips/caption pattern) — a straightforward reflow, not a re-architecture; the sticky 'W. Honors' tab stays fixed in the same corner at every breakpoint.
  - Footer 'Let's Build!' becomes a mobile-width blackletter headline stacked over three plain link columns (Work/Learn/Reach Out) — same content, single column.
- **motion**:
  - Sticky-position pinning of the name card while background content scrolls past (pure CSS position:sticky + scroll, no WebGL).
  - Chips/badges appear to be simple opacity/translate reveals on scroll (typical scroll-reveal, no exotic physics).
  - Circular text badge likely a slow CSS/SVG rotation loop around a static diamond icon.
- **steal**: For maxfolio's 'Shopify work' section: pin a small fixed info card (store name + 2 rotating metric chips) while the actual store screenshot/site preview scrolls edge-to-edge behind it — replaces the current card-grid case-study sheet with a much lower-chrome, higher-immersion browsing mechanic, and the floating chips give you a place to vary which metric shows per store (solves 'never the same metrics for every store').
- screenshots: awwwards-2026-dev-ryan-ritzenthaler-desktop-seg0.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg1.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg2.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg3.png | awwwards-2026-dev-ryan-ritzenthaler-desktop-seg4.png | awwwards-2026-dev-ryan-ritzenthaler-mobile-seg0.png | awwwards-2026-dev-ryan-ritzenthaler-mobile-seg2.png | awwwards-2026-dev-ryan-ritzenthaler-mobile-seg4.png

## Roshan Sahu — folio — https://roshan-sahu.com/ · Awwwards Honorable Mention, Jul 2026 — creative developer/engineer personal portfolio
- **desktop**:
  - Hero: parenthetical quote-bubble intro '(Hello! I'm Roshan Sahu, a web developer and engineer...)' floating top-center, then huge wide-tracked stacked wordmark 'creative DEV' with a small photo of his desk setup embedded MID-WORD, breaking the letterforms — narrative-with-inline-media hero, no chips.
  - Work index is NOT a grid: it's a sequence of alternating SPLIT 50/50 rows — full-bleed live-site screenshot on one side, solid-black panel on the other with a large serif project title ('JAYESH PORTFOLIO [OPEN]'), a 2-line stack of plain tags (WEBFLOW, GSAP, SCROLL-EFFECT / ROLE: WEB DESIGN & DEVELOPMENT) and no card border at all.
  - Each case screenshot sits inside a custom colored/textured backdrop matching that brand's palette (floral yellow/red backdrop bleeding around a fashion-store screenshot) rather than a neutral card background.
  - 'PLAYGROUND' section: header row with 'EXPERIMENTS / ANIMATIONS / 3D' filter labels, then a loose, unevenly-spaced horizontal row of small experiment thumbnails at different sizes — not a uniform grid.
  - About: split 50/50 — huge justified all-caps bio paragraph on black background (left) + portrait photo (right), single '[KNOW MORE]' link, no bullet chips.
  - Contact: full-bleed near-black band, giant 'LET'S WORK TOGETHER' typographic line, footer nav column list (HOME/WORK/SERVICES/FAQ/ABOUT ME), email + 'QUICK CHAT' (WhatsApp icon) + live local time ('IST - 09:07:55'), social row, persistent 'W. / Honors' vertical sidebar tab visible on every screen.
- **mobile**:
  - The desktop split 50/50 work rows become STACKED verticals: full-bleed screenshot on top, black text panel directly below, full width — same visual language, no re-design needed, and the persistent 'W. Honors' tab shrinks to a small tab pinned mid-right edge.
  - Hero's giant 2-word wordmark collapses to plain stacked lines ('ENGINEERING / IMMERSIVE / WEB EXPERIENCES') dropping the inline embedded photo entirely on the smallest viewport — text-only mobile hero variant.
  - Nav bar (Work/Services/FAQ/About Me links) becomes a hamburger; a persistent 'EXPLORE ALL WORK' underlined link sits fixed at the very top of the work list on mobile as a quick jump-back affordance.
- **motion**:
  - Case-study images likely have a subtle scroll-linked reveal/scale (typical intersection-observer reveal); no evidence of WebGL — pure image + CSS.
  - Live IST clock ticks in real time in the footer (small JS interval, not a heavy animation).
  - Filter labels (EXPERIMENTS/ANIMATIONS/3D) look like simple hover-underline toggles for the playground grid.
- **steal**: Replace maxfolio's uniform white/gray case-study card background with a backdrop color/texture pulled from each store's own brand palette bleeding around the screenshot — cheap, per-store visual variety across 19 stores without inventing new layout, and it directly answers 'never the same treatment for every store.'
- screenshots: awwwards-2026-dev-roshan-sahu-desktop-seg0.png | awwwards-2026-dev-roshan-sahu-desktop-seg1.png | awwwards-2026-dev-roshan-sahu-desktop-seg2.png | awwwards-2026-dev-roshan-sahu-desktop-seg3.png | awwwards-2026-dev-roshan-sahu-desktop-seg4.png | awwwards-2026-dev-roshan-sahu-mobile-seg0.png | awwwards-2026-dev-roshan-sahu-mobile-seg1.png | awwwards-2026-dev-roshan-sahu-mobile-seg3.png

## Léo Parpeix Portfolio 2026 — https://leoparpeix.com/ · Awwwards Honorable Mention, Aug 2026 — Art Director / Interactive Designer personal portfolio
- **desktop**:
  - Hero: full-bleed 3D-rendered 'artist studio' scene (giant plush flower sculpture, arched windows, ladder) with a tiny 'Click to feed the bee' Easter-egg prompt top-center and plain name/role text top-left — no cards, purely environmental/illustrative.
  - 'Bonjour' intro: split 50/50 — friendly first-person paragraph left, a plain business-card mockup ('LÉO PARPEIX' on white) right.
  - Work display is a literal 3D BOOKSHELF: laptop/phone/tablet mockups of each project sit physically ON shelves among books and decor, as if browsing a real shelf — a media-first collage that replaces the work grid entirely with a spatial metaphor.
  - Work index also offers a VIEW-SWITCH TOGGLE in the header (two icon buttons: a small bar-chart/thumbnail icon and a hamburger/list icon) that flips the SAME 29 projects between a visual shelf/grid view and a plain numbered TEXT LIST ('12 L'Oréal — Digital magazine', '13 TOUGO', … each with a chevron to expand) — no images at all in list mode.
  - Footer: full-bleed pale background, giant 'LET'S CREATE A REMARKABLE JOURNEY' headline with a cartoon bee icon literally replacing the 'O' in 'Create', Instagram/email/LinkedIn row, Credits link, © 2026.
- **mobile**:
  - The view-toggle icons persist on mobile and the plain numbered TEXT LIST mode (no images, just number + name + category + chevron) becomes the default-feeling, highly scannable pattern — proof that 'switch to a plain list' is a legitimate, good-looking way to shrink a heavy visual index down for small screens.
  - 3D bookshelf hero scene reflows to a narrower vertical crop but keeps the same spatial/shelf metaphor rather than swapping to a flat grid.
  - Header condenses to name + hamburger; the two view-icons stay visible next to the hamburger even on mobile (kept as a persistent utility, not hidden in a menu).
- **motion**:
  - 3D WebGL scene (flower, shelf, bee) with camera drift/parallax on scroll — this exact tech is off-limits for Max (Three.js/WebGL) but the CONCEPT (spatial/physical metaphor for 'my work sits on a shelf') is portable via a flat illustrated SVG/CSS parallax collage.
  - Toggle between grid/list view snaps instantly (likely a simple state swap with a fade, not physics-based).
- **steal**: Add a persistent icon-pair TOGGLE ('grid view' / 'list view') to the header of the 'Shopify work' index so visitors — and specifically mobile visitors — can collapse the current heavy screenshot-cards into a plain numbered text list (store name + one-line feature + chevron); ship list-view as the mobile default and grid as desktop default, which literally satisfies 'sections that completely change on mobile.'
- screenshots: awwwards-2026-dev-leo-parpeix-desktop-seg0.png | awwwards-2026-dev-leo-parpeix-desktop-seg1.png | awwwards-2026-dev-leo-parpeix-desktop-seg3.png | awwwards-2026-dev-leo-parpeix-desktop-seg5.png | awwwards-2026-dev-leo-parpeix-mobile-seg2.png | awwwards-2026-dev-leo-parpeix-mobile-seg4.png

## HAOQI.DESIGN — https://haoqi.design/ · Awwwards Site of the Day, Aug 14 2026 (score 7.36) — product designer & design engineer at TikTok
- **desktop**:
  - Single full-viewport 'business card' landing screen (no scroll to more sections on the homepage): 3-column header row — wordmark + 'Design & Engineering' left, 2-line manifesto 'Thinking in systems. Designing with care.' center, first-person bio blurb + WORK/CONTACT/THEME/SOUND nav right.
  - Center of the screen: a huge glossy 3D-rendered cursive 'hello' wordmove (looks like inflated balloon type) sitting over a soft sky-blue/cream gradient with diagonal light-beam streaks and a halftone dot pattern in the corners.
  - Below-left: bold condensed all-caps headline 'I BRING CRAFT & TASTE TO DIGITAL WORK' where the last couple of characters are LIVE, cursor-reactive glitch/placeholder characters ('%N>') that change as the mouse moves — a tiny generative-type Easter egg.
  - Bottom bar: live-feeling utility readouts — 'GMT+8 CN 22:35 28°C' (timezone/local weather) on the left, cursor coordinates '0720 X 0450 Y' center, a small globe icon + theme toggle right — decorative 'HUD' framing rather than content.
  - Sticky scrollbar-style indicator on the right edge (small pill) suggests the real case-study content lives behind a THEME[dark/light] toggle or on separate WORK route rather than a long homepage scroll.
- **mobile**:
  - 3-column header collapses to a single stacked column: wordmark+role top-left, hamburger top-right, headline stack moves below the 'hello' 3D wordmark instead of beside it, and the manifesto/bio text drops to below the fold as a simple paragraph — same components, fully restacked.
  - The cursor-reactive glitch characters and coordinate HUD readouts are simplified/removed on touch (no cursor to react to), leaving a cleaner static headline — evidence that a cursor-driven Easter egg should degrade gracefully to nothing on mobile rather than faking it.
- **motion**:
  - Glossy 3D cursive word looks pre-rendered/baked (a 3D render or Spline/GLB export composited as an image or lightweight WebGL canvas) rather than a full 3D scene — visually rich but likely cheap to render statically.
  - Cursor-position-driven text substitution ('%N>' style) is a lightweight JS mousemove listener, not physics — directly reproducible with CSS/JS only (no WebGL) for Max's hard constraints.
  - Diagonal light-beam streaks look like a static or slow CSS gradient animation, not real-time lighting.
- **steal**: Steal the 2-line manifesto eyebrow ('Thinking in systems. Designing with care.') pattern for maxfolio's hero: a short, punchy 2-line CTO-voice statement placed beside the name, plus a tiny cursor-reactive character-glitch detail on one headline word (pure JS mousemove + text swap, zero WebGL) to add 'dynamic' personality points cheaply.
- screenshots: awwwards-2026-dev-haoqi-desktop-seg0.png | awwwards-2026-dev-haoqi-desktop-seg1.png | awwwards-2026-dev-haoqi-desktop-seg2.png | awwwards-2026-dev-haoqi-mobile-top.png | awwwards-2026-dev-haoqi-mobile-full.png

## Minh Pham — https://minhpham.design/ · Awwwards Site of the Day, 2023 (not 2026, kept for the client-wordmark and gated-hero patterns) — Design Lead at Fantasy (Ford/UFC/NFL work)
- **desktop**:
  - Gated entry: black screen with a small logo mark and a 'START' pill button — nothing renders until clicked (a real UX cost, flagged in Avoid).
  - Hero after entry: bold condensed headline 'MAKING GOOD SHIT SINCE 2009' with a big flat orange CIRCLE overlapping/occluding part of the word 'GOOD' at an angle, VR-headset portrait photo behind, persistent LEFT-EDGE icon rail (globe/Instagram/play/LinkedIn) docked for the whole session, small vertical 'SOUND ON' toggle right edge.
  - Scroll reveals a duotone giant-text pull-quote over a photo: 'Over a decade of experience in interactive design and working with some of the most talented people in the business' with the phrase 'a decade' highlighted in orange — text doubles as the transition, no separate stat card.
  - Client roster shown as GIANT overlapping stacked wordmarks ('FORD / UFC / LINCOLN / ROYAL CARIBBEAN / SLEEPIQ / NFL') layered directly over a slowly rotating monochrome globe graphic with a single orange location pin — replaces a logo-strip/marquee with oversized typography.
  - Footer: 'GOOD DESIGN IS HONEST — Dieter Rams' quote over a portrait, two-column 'Connect' link list (Dribbble/YouTube/LinkedIn, Instagram/Facebook/Behance) each with a small red diagonal arrow icon, email + phone.
- **mobile**:
  - The gated 'START' screen is replaced by an inline circular 'PRESS' dial (dashed circular text reading PRESS/PRESS/PRESS) with a finger-tap icon in the center — the exact same gate mechanic is re-skinned as an explicit touch affordance instead of relying on an invisible click target.
  - The orange-circle text-occlusion trick is REMOVED on mobile — headline lines simply alternate color (tan/orange/tan) top-to-bottom with no overlap, i.e. a decorative collision effect is dropped rather than forced onto a small screen.
  - Giant overlapping client-name typography carries over almost unchanged to mobile (still oversized, still overlapping the globe graphic) — proof this specific component needs no mobile-specific redesign, just smaller type.
- **motion**:
  - Orange circle-on-text overlap is a simple z-index/mix-blend-mode trick (no interaction needed) — CSS-only and Lighthouse-safe.
  - Globe graphic rotation is a slow, probably canvas or looping-image animation — reproducible as CSS transform rotate or a lightweight looping video/WebM instead of WebGL.
  - Circular 'PRESS' text likely animates via SVG textPath + CSS rotation, a common, cheap technique.
- **steal**: Replace maxfolio's 'fleet marquee' ticker with Minh Pham's giant overlapping client/store-name typography treatment layered over a subtle slow-rotating world outline — bigger visual impact than a scrolling logo strip, ties directly into Max's 'CTO working across LATAM/US stores' story, and is pure CSS/SVG (no WebGL).
- screenshots: awwwards-2026-dev-minh-pham-desktop-seg0.png | awwwards-2026-dev-minh-pham-desktop-seg1.png | awwwards-2026-dev-minh-pham-desktop-seg2.png | awwwards-2026-dev-minh-pham-desktop-seg4.png | awwwards-2026-dev-minh-pham-mobile-seg0.png | awwwards-2026-dev-minh-pham-mobile-seg2.png

## Pacôme Pertant Portfolio — https://pacomepertant.com/ · Awwwards Portfolio Honors, Jun 2026 — motion & sound designer, Paris
- **desktop**:
  - Sound-gate splash screen ('enter with sound' / 'enter without sound') before anything else loads.
  - Main work view is a 3D 'SPIRAL' of floating project cards/thumbnails tumbling in space at different depths/rotations against a black dot-grid background — a literal alternative to a grid: work items scattered as tilted cards in a loose cluster, each a small motion/branding thumbnail, with a top-center 'spiral / list' TOGGLE (so, like Léo Parpeix, it can flip to a plain LIST view) and a top-right 'menu' pill.
  - A small circular animated logo-avatar sits top-left at all times; a mute/unmute icon bottom-right; a small year/label tag ('2025 • showreel') pinned bottom-left of the cluster.
- **mobile**:
  - The same tumbling 3D card cluster renders at mobile width nearly unchanged (cards just get visually denser/overlap more) — spiral/list toggle and menu pill persist in the same corners — this one did NOT redesign for mobile, it just let the 3D scene reflow, which is a cautionary example (see Avoid) since dense overlapping cards are harder to tap accurately on a small touchscreen.
- **motion**:
  - 3D WebGL card cluster with per-card tilt/rotation and presumably slow drift — off-limits tech for Max, but the compositional idea (loosely scattered, rotated project tiles instead of a grid) is achievable with CSS transforms + framer-motion (random rotate/translate per tile, subtle parallax on scroll) without any 3D engine.
  - 'spiral ↔ list' toggle again reinforces the same pattern seen at Léo Parpeix: give a dense visual index an instant plain-list escape hatch.
- **steal**: Borrow the 'scattered, tilted tile cluster' compositional idea (not the WebGL) for a small side-project or 'experiments' rail on maxfolio: render 6-8 small preview tiles at slightly randomized rotation/offset using CSS transform + framer-motion drag, as a livelier alternative to a straight row for lower-stakes content (Gallery or Projects section).
- screenshots: awwwards-2026-dev-pacome-pertant-desktop-top.png | awwwards-2026-dev-pacome-pertant-mobile-top.png

## Gionatan Nese '26 — https://www.gionatannese.com/ · Awwwards Site of the Day + Developer Award, Sep 05 2026 — multi-disciplinary designer, Milan
- **desktop**:
  - Entire homepage appears to be a single, non-scrolling full-viewport screen (scrollHeight equals viewport height): plain 3-column header (name / small monogram 'GN.D' / role) on an all-white ground, a small page-index numeral ('030') centered at the bottom — extremely minimal, almost blank 'business card' landing, with real work presumably behind nav/subpages.
  - No visible chips, cards, or imagery on the main screen at desktop width — all restraint, purely typographic.
- **mobile**:
  - Mobile reveals content the desktop capture did not (likely a scroll-triggered or viewport-conditional layout): a 'Creative Space' label with numbered filter tabs (1/2/3) sits under the monogram, followed by a loosely SCATTERED, organically-arranged COLLAGE of small square product/lifestyle photos at varied sizes and vertical offsets — not aligned to any grid, more like pins on a corkboard.
  - This scattered-collage mobile pattern is a genuine 'section completely changes on mobile' example: the desktop shows almost nothing, the mobile view shows a rich, informal moodboard-style index instead of a formal grid.
- **motion**:
  - Given the extreme minimalism captured, motion is likely limited to hover states and a subtle intro fade — no strong evidence of heavy scroll-triggered animation on the homepage itself (deeper interaction likely lives on sub-pages not captured here).
- **steal**: For maxfolio's Gallery/Skills sections, replace an aligned image grid with a loosely scattered, corkboard-style collage of tool icons or store screenshots at varied rotation and vertical offset (framer-motion stagger-in on scroll) — reads as far less 'templated card grid' than a uniform grid while staying simple CSS/JS.
- screenshots: awwwards-2026-dev-gionatan-nese-desktop-top.png | awwwards-2026-dev-gionatan-nese-mobile-top.png | awwwards-2026-dev-gionatan-nese-mobile-full.png

## Julien Calot — https://www.juliencalot.com/ · Awwwards Site of the Day, Jul 08 2026 — visual artist / multidisciplinary creative (fine-art e-commerce, lower relevance to a dev/CRO persona but included for the full-bleed browsing pattern)
- **desktop**:
  - Full-bleed single artwork fills the entire viewport as the 'hero' (a large painted portrait) with minimal chrome: wordmark top-left, a 'BY SERIES / BY COLORS' filter-toggle top-center-left, ARTWORK/DRAWINGS/EMBROIDERIES nav top-right, ABOUT/CONTACT/PANIER(0) far right.
  - Series metadata is overlaid directly on the artwork itself in small caps: year + series title bottom-left ('2024 — MEDITANTS'), piece count bottom-right ('21 — PIECES') — captions live ON the full-bleed image rather than below it in a card.
- **mobile**:
  - Not independently verified beyond the same full-bleed single-artwork treatment (capture did not advance past the first artwork on either breakpoint within the wait window) — treat the 'BY SERIES / BY COLORS' filter toggle and on-image caption placement as the transferable ideas rather than a confirmed mobile transformation.
- **motion**:
  - No motion evidence captured (five consecutive scroll positions returned an identical frame, suggesting either a very slow transition, a click/arrow-driven artwork browser rather than scroll, or a stalled load) — flagged rather than asserted.
- **steal**: Steal the caption-on-image placement (small caps metadata sitting directly on the full-bleed photo, not in a card below it) for maxfolio's Gallery carousel captions — removes one more 'card' from the page.
- screenshots: awwwards-2026-dev-julien-calot-desktop-seg0.png

## ideas
- Give the 'Shopify work' index a persistent grid/list VIEW TOGGLE (two small icon buttons, à la Léo Parpeix and Pacôme Pertant): grid/visual mode for desktop default, plain numbered text-list mode (store name + one-line result + chevron, zero screenshots) as the mobile default — this alone satisfies both 'too much info in cards' and 'sections that completely change on mobile.'
- Rebuild the case-study reveal so a small pinned info card (store name + 2 metric chips, rotating per store) stays fixed while the actual store screenshot/site scrolls past behind it edge-to-edge (Ryan Ritzenthaler's sticky-name-over-live-sites trick) — replaces the current screenshot+chart sheet with something that feels like browsing real sites, not a dashboard.
- Vary the metric chips shown per store instead of the same repeated stack tags — pull whichever 1-2 metrics are genuinely most interesting for that store (a Roshan Sahu / Ryan Ritzenthaler pattern where tags differ) so the owner's 'never the same metrics for every store' complaint is structurally impossible to violate.
- Replace the flat white/gray card background behind each case-study screenshot with a backdrop tint/texture pulled from that store's own brand palette (Roshan Sahu) — instant per-store personality with zero new layout code.
- Rework the Process (5 steps) section away from a scroll-stepper-with-pinned-numeral toward Minh Pham's giant duotone pull-quote treatment: one big sentence per step scrolling over a full-bleed photo/gradient, with the key phrase in an accent color — no cards, no numerals-as-cards, just typography-in-motion.
- Replace the fleet/'Now' marquee ticker with oversized overlapping store-name typography layered over a slow-rotating world-outline graphic (pure CSS/SVG, Minh Pham's client-wordmark treatment) — bigger, more 'CTO working across LATAM/US' than a scrolling logo strip.
- Add a small persistent vertical sidebar tab (Roshan Sahu / Ryan Ritzenthaler's 'W. Honors' tab) reading something like 'Available' or 'CTO @ Digitdeck' pinned to the viewport edge through the whole scroll — a low-cost, always-visible trust/CTA signal that isn't a card.
- Give Skills/tech-stack a scattered corkboard-style collage of tool icons at slight random rotation/offset (Gionatan Nese's mobile moodboard) instead of inline chips, staggered in with framer-motion on scroll — reads as designed, not templated.
- Add ONE small cursor-reactive text glitch on a hero headline word (Haoqi's '%N>' trick) — pure JS mousemove + character swap, degrades to nothing on touch — cheap 'dynamic animation' credit without WebGL.
- Insert full-bleed typographic pull-quote interstitials (Ryan Ritzenthaler's 'SPEED' / 'It This Far!') between any two sections that would otherwise both read as card-grid-shaped, satisfying the 'never 2 consecutive same archetype' rule for free.
- For Year-by-year experience, try replacing the hairline timeline with a sequence of single giant duotone statement-scrolls (one per era, Minh Pham style: 'Over a decade of...') instead of a list of years — turns a dense timeline into a narrative you scroll through.
- Put a small live micro-detail in the footer/contact area — local time + one honest live stat (not invented) — mirroring Haoqi's 'GMT+8 CN 22:35' and Roshan Sahu's 'IST - 09:07:55' ticking clock, for a 'this is a real working developer' feel.
- On mobile, let the Gallery carousel captions sit directly on the image (Julien Calot) rather than below it in a caption bar, freeing vertical space on small screens.
- For the Contact section, add one small playful cursor/touch Easter egg near the primary CTA (Léo Parpeix's 'click to feed the bee') implemented as a CSS/framer-motion sprite reacting to hover/tap — reinforces 'more dynamic animation' + 'zero AI slop' by being a genuinely bespoke, non-generic detail.
- When switching the work index to list-mode on mobile, keep the desktop grid/visual mode reachable via the same toggle rather than removing it — so power users (recruiters skimming on desktop) still get the rich version while mobile DTC-owner visitors get the fast scan.
## avoid
- Never gate real content behind a 'START' / 'enter with sound' / click-to-continue splash (Minh Pham, Pacôme Pertant, Léo Parpeix all did this) — kills first-impression speed and directly conflicts with Max's Lighthouse-100 and honesty goals.
- Never rely on a heavy WebGL/3D hero scene (Léo Parpeix's 3D room, Pacôme Pertant's tumbling card cluster, Haoqi's likely-3D 'hello') — explicitly excluded by the hard constraint (no WebGL/Three/GSAP); steal the compositional idea, not the tech.
- Don't let a dense, tilted/overlapping tile cluster (Pacôme Pertant) reach mobile completely unchanged — it just gets more cramped and harder to tap; any 'scattered tile' idea needs an explicit, simplified mobile layout, not just a narrower viewport.
- Don't repeat the same 2-3 stack chips (NextJS / Tailwind CSS / Prismic CMS) on every single project card the way Ryan Ritzenthaler does — it reads as templated rather than differentiated, which is exactly the owner's complaint about 'never the same metrics for every store.'
- Avoid a page that appears to never scroll or advance past its first frame (Julien Calot's five identical scroll captures) — if a surface needs click/arrow navigation instead of scroll, make that obviously interactive, not silently static.
- Avoid heavy blackletter/gothic display type for Max's positioning — striking on Ryan Ritzenthaler's personal-brand site, but risks reading as costume/novelty rather than CTO-credible for a DTC-owner and recruiter audience.
- Avoid decorative live-readout HUD chrome (timezone/weather/cursor-coordinates) unless it is genuinely real and purposeful — used tastefully it adds personality (Haoqi, Roshan Sahu), but it tips into AI-slop/gimmick territory fast if the numbers are fake or the detail has no connection to the content.
- Don't force a cute cursor/touch Easter egg (the bee, the 'PRESS' dial) to be the ONLY way to reveal key content — every one of these examples still exposed the core message even before the Easter egg fired; a playful detail should be additive, never load-bearing.

# CRITIC

- **footer-design-patterns**: No lens does dedicated footer research. Footers appear only as incidental mobile-collapse notes inside other lenses (Baymard's 40+-link footer stacking to one column, joshwcomeau's wave-footer, jonas.do's bracket-checklist footer links, Podium's near-empty single-hairline footer) — none of it aimed at answering what maxfolio's OWN footer should be (sitemap vs minimal, social links, legal/credits, language switch placement, a closing CTA repeat). Given the owner wants clearer CTAs and zero card soup end-to-end, the footer is the one full section of the page with no primary research pass. — Find 6-8 2025-2026 dev/design portfolio and small-agency sites with a deliberately designed footer (not a default template stub) and capture footer treatment at both 1440 and 390px: link density (minimal vs full sitemap), whether a CTA repeats there, social/contact icon treatment, legal/credits microcopy tone, and any language/theme switcher placed in the footer. Good galleries to pull from: Awwwards SOTD/Honorable Mention Sept 2026, Godly, Lapa Ninja 'footer' category, and the same portfolio set already used in hero-identity/contact-cta (leerob.com, delba.dev, samuelkraft.com, swyx.io, jonas.do) since their footers weren't the focus there.
- **dark-mode-and-theme-toggle**: Dark mode is never mentioned in any of the 14 lenses — no site was checked for a light/dark toggle, no pattern for how a toggle should look/behave, and no mobile-specific behavior for one (does the toggle survive the hamburger collapse? does it respect prefers-color-scheme? is there a third 'system' option?). This matters directly for 'zero AI slop' and 'more dynamic' since a well-executed theme transition is a cheap, real animation opportunity the sweep never surfaced. — Research 6-8 2025-2026 developer/design portfolios that ship a real light/dark toggle (not just OS-level prefers-color-scheme with no UI control) — check leerob.com, swyx.io, samuelkraft.com, kentcdodds.com, and 3-4 Awwwards dev-site winners for a toggle. Capture: toggle placement/iconography, transition mechanics (crossfade vs instant vs animated icon morph), whether toggle position/behavior changes on mobile (390px), and whether any site re-tints photography/screenshots per theme rather than just swapping background/text colors.
- **language-switcher-ux**: Maxfolio's content is typed in EN/ES/JA (per memory: 'contenido EN/ES/JA tipado') but not one lens investigated how any reference site implements a language switcher — placement, flag-vs-text-code convention, dropdown vs inline toggle, and critically its mobile transform (does it collapse into the hamburger menu, become a bottom-sheet picker, or stay a persistent pill?). copywriting-refs only touched translated CTA COPY tone, not the switcher UI itself. — Find 5-6 multilingual portfolio/agency/SaaS marketing sites (dev portfolios rarely localize, so widen to agency sites serving LATAM/Japan/EU markets, or docs sites like Vercel/Stripe/Shopify.com with a language picker) and capture the language-switcher pattern at 1440 and 390px: is it a flag icon, a 2-3 letter code, or a full language name; dropdown, modal, or inline segmented control; where it sits in the header/footer; and whether it persists as a floating control or moves into a mobile menu.
- **case-study-sheet-modal-mobile-mechanics**: Multiple lenses (awwwards-2026-dev, galleries-2026, scrollytelling-products) reference a 'case-study sheet' or 'card opening into a detail view' conceptually, but none actually captured how a modal/sheet/overlay panel behaves on mobile specifically: full-screen takeover vs bottom-sheet drag-to-dismiss, whether the URL updates for deep-linking/back-button support, scroll-lock behavior on the page behind it, and the close affordance's placement/size for thumb reach. This is explicitly one of maxfolio's core interaction patterns (opening a store's case study) and it has zero direct mobile evidence. — Find 5-6 sites where clicking/tapping a project or case-study tile opens a detail view as an overlay (not a full page navigation) — check Ryan Ritzenthaler, Jordan Robson (Panconesi/Facets), Framer marketplace templates, Linear's changelog entries, or any Awwwards portfolio with a project-detail modal — and specifically test at 390px: does it become a full-screen sheet, a bottom drawer with a drag handle, or stay a centered modal; how is it dismissed (X button placement, swipe-down, back-button/back-gesture, tap-outside); does the browser URL/history update; and is background scroll locked.
weak: tech-stack / Samuel Kraft: mobile behavior explicitly 'Not fully captured this pass' — the steal recommendation (inline-glyph device) is inferred from the desktop-only capture, not verified against real mobile rendering. | tech-stack / Gionatan Nese '26: mobile marked 'genuinely unverifiable further without manual scroll interaction' — the negative-space lesson drawn from it (skip a tech-stack section in the hero) rests on an unconfirmed capture. | tech-stack / Khanh Nguyen: mobile 'unverified beyond the hero due to custom-scroll' — the vertical wordmark + metadata row steal is not confirmed to exist/work at 390px. | experience-timelines / De Ruien: 'could not evaluate the timeline-specific mobile behavior because the timeline component itself never loaded' — the steal is about surrounding page texture, not the timeline pattern the lens was supposed to investigate. | mobile-transforms / Displace: mobile 'Not captured' entirely, yet a steal (windowed-panel/sidebar-as-index metaphor) is still offered speculatively. | mobile-transforms / Metalab: mobile 'Same single-hero-only behavior... content does not extend past the first screen in this capture' with steal marked N/A — effectively a null finding included as a full row. | results-charts / Northbeam: mobile 'Could not capture — page timed out loading on mobile in this pass' — the before/after delta-chip steal is based on desktop only, no mobile evidence despite results-charts being a lens explicitly about chart presentation across breakpoints. | awwwards-2026-dev / Pacôme Pertant: mobile note admits 'this one did NOT redesign for mobile' and is explicitly flagged as a cautionary/avoid example, but is still formatted identically to positive steals, risking it being read as a recommended pattern. | galleries-2026 / jackentee.com: 'Not captured (site timed out under the mobile viewport during this pass)' with an explicit 'worth a manual re-check before committing to it as a primary reference' — yet its steal (taxonomy table) appears in the final ideas list without that caveat carried forward. | galleries-2026 / Julien Calot: 'Not independently verified beyond the same full-bleed single-artwork treatment... capture did not advance past the first artwork on either breakpoint' — a real mobile transform claim is not actually demonstrated. | galleries-2026 / Gionatan Nese, Maria Vasilyeva, Kenj Pena, Leonardo Moreira: all four marked 'Not captured at this depth' yet each still contributes a steal to the final ideas list — four of the lens's ~12 sources have zero visual evidence behind their recommendation. | process-sections / Instrument: 'Not deeply verified section-by-section on mobile for /services (time-boxed)' — the alternating full-height editorial band steal is generalized from the homepage, not the /services page it's attributed to. | process-sections / Displace-style note under Metalab and Displace rows: both are effectively non-findings (unverified / N/A) padding out the source count for the lens. | hero-identity: several steals read as generic best-practice advice restated in reference-specific language (e.g. 'put a strong CTA in the hero,' 'shorten the hero') rather than a specific mechanism tied to a screenshot — low information density relative to the length of the ideas list. | copywriting-refs: no screenshots/visual evidence anywhere in this lens (it's pure text/copy analysis) — findings about mobile copy reflow (e.g. Superhuman's abstraction-to-number swap) are asserted without a captured before/after image, unlike the visual lenses.
# GAP LENS: gap-footer-design-patterns (agent af56eefe231048c91)

## Mosby's Files (Tubik Studio) — https://www.mosbyfiles.com/
- **desktop**:
  - The footer is a full-bleed color-block band (saturated red) that visually continues the site's stacked-folder-tab motif from the body — the colored tabs (Frank Gehry / Louis Kahn / etc.) run right up to the top edge of the footer, so there's no hairline break between content and footer, just a color change.
  - Inside the red field: a short descriptive paragraph (context copy, not boilerplate) top-left; a row of custom line-drawn architectural-blueprint icons (compass rose, drafting circle, protractor, cross-hatch swatch, north arrow) instead of any social icons — these are literal glyphs invented for this content domain, not generic Twitter/LinkedIn marks.
  - Bottom-most row: a hand-drawn ruler/scale-bar graphic (0 4 8 16 32) on the left, centered '© 2026' plain text, and right-aligned 'CRAFTED WITH ♥ BY TUBIK STUDIO' credit line (studio name underlined/linked) with a small circular brand mark logo next to it.
  - No sitemap, no legal links, no newsletter — the footer's only 'utility' content is the credit line; everything else is atmosphere/branding.
- **mobile**:
  - Tabs stack to two visible rows instead of three (the colored folder tabs wrap and compress, losing the far-right category labels that existed on desktop).
  - The icon row drops from 7 icons to 5 (some blueprint icons are cut to fit width) and shrinks; the ruler graphic, © line, and credit line collapse into a single centered wrapped block instead of a 3-way spread row.
  - Overall it's a reflow/prune, not a structural rebuild: same red field, same icon-as-social-replacement idea, just fewer icons and tighter stacking.
- **motion**:
  - Not directly observed in the static captures; the folder-tab overlap and colored bands suggest a stacked z-index reveal earlier in the page, but the footer band itself reads as a static closing plate.
- **steal**: Replace generic social icons with 4-6 custom line-drawn glyphs invented for Max's domain (a cart icon, a Liquid tag, a Lighthouse-100 badge, a theme-file icon, a CRO-chart glyph) instead of stock LinkedIn/GitHub marks — turns the footer from boilerplate into a signature, and gives a full-bleed color-band footer archetype (not just dark-on-dark) that maxfolio currently lacks anywhere on the page.

## Podium — https://podium.global/
- **desktop**:
  - The footer IS the closing CTA moment: a giant floating 3D-rendered rock/artifact sits above a two-line typographic statement — 'LET'S BUILD YOUR VISION' in bold sans, then 'WORK WITH US' underlined as the literal clickable link (no separate button chrome, the underline is the affordance).
  - Two tiny flanking captions sit at the rock's shoulder height: 'NOT THE FINISH LINE.' (left) / 'IT'S STEP ONE.' (right) — a copywriting flourish that reframes the CTA as a beginning, not an ask.
  - Below that: one dashed hairline, then a minimal legal row — '©PODIUM 2026' left, 'WEBSITE BY SAN RITA' (linked) right. No sitemap, no social icons, no newsletter at all.
- **mobile**:
  - Top nav (WORK/ABOUT/CONTACT) collapses into a single 'MENU' + checkerboard-pattern hamburger glyph.
  - The 3D rock, headline, and underlined CTA link stack in the same vertical order, just narrower — no new layout, straight reflow.
  - The dashed hairline + legal row stays identical in structure (copyright left, credit right), just tighter.
- **motion**:
  - The 3D object is almost certainly a slow auto-rotating/idle-drifting render (typical of this WebGL-hero pattern), but the static captures only prove its presence and position, not the rotation itself — flagged as inferred, not confirmed.
- **steal**: Pair maxfolio's giant typographic Contact CTA line with a two-word micro-copy frame directly beside it (e.g. small caption left 'NOT A SALES CALL.' / right 'JUST 20 MINUTES.') so the CTA gets a persuasive frame without adding a card or paragraph — pure typography, zero new UI chrome.

## SOHub Digital — https://sohub.digital/
- **desktop**:
  - Footer opens with an oversized lowercase wordmark ('sohub') that bleeds off both edges of the viewport, with a sci-fi 3D rendered object (a metallic capsule/device with glowing teal panels) layered on top of the type — the logo isn't a small mark, it's the dominant visual.
  - Below the overlap: centered '© SOHub Digital' in large outline-weight type plus a tagline 'Award-Winning Digital Agency', then a row of 5 circular dark pill icons for socials — but 2 of the 5 are custom abstract 'sparkle/asterisk' glyphs (not brand logos), mixed with real LinkedIn/Instagram/X icons.
  - A visually SEPARATE lower bar (lighter background, breaking from the dark footer field above it) holds the real sitemap: three pill-shaped nav buttons with arrow icons ('STUDIO →', 'WORK →', 'CONTACT →') left-aligned, and a 'GO UP ↑' pill far right — navigation disguised as CTA buttons instead of plain text links.
  - A floating 'CHAT WITH SOHUB' pill (with a chat-bubble icon) sits fixed near the top-right of the footer zone, functioning like a persistent contact affordance rather than a mailto link.
- **mobile**:
  - The floating chat CTA duplicates: 'CHAT WITH SOHUB' AND a second pill 'BOOK A MEETING' (with calendar icon) stack full-width above the bled wordmark — two distinct contact CTAs instead of one, both immediately actionable without scrolling further.
  - The oversized wordmark and 3D object shrink proportionally but keep the same bleed/overlap treatment (not simplified to a small static logo).
  - The pill-button sitemap row (STUDIO/WORK/CONTACT/GO UP) that sat in its own lighter bar on desktop reflows to presumably stack vertically below the fold (confirmed present, exact stacking beyond the captured frame).
- **motion**:
  - Not confirmed from static frames — the 3D object treatment and 'GO UP' pill strongly suggest a scroll-triggered or idle-loop animation on the object, and a smooth-scroll-to-top on click, but neither is directly observed moving in these screenshots.
- **steal**: Turn maxfolio's footer sitemap-as-plain-links into pill buttons with directional arrows (STUDIO→/WORK→/CONTACT→ style) that echo the primary CTA's button style, and add a second, lower-commitment CTA pill ('Book a 15-min call') alongside the primary 'Get the free 20-minute review' button — two calls to action of different weight, directly addressing the owner's 'stronger CTAs' complaint.

## Pensatori Irrazionali — https://pensatori-irrazionali.com/
- **desktop**:
  - The footer opens with a huge two-layer typographic signature: a bold serif 'PENSATORI' sits in front of, and overlapping, a lighter-weight cursive/script 'Irrazionali' behind it, with faint decorative flourish linework in the background — a monogram/wordmark moment rather than a plain logo repeat.
  - A thin green-and-red rule (echoing the Italian flag, since the studio is Italy-rooted) underlines exactly the 'PENSATORI' half of the wordmark, tying the brand mark to national identity without a literal flag graphic.
  - Below the wordmark, a clean 3-column utility footer: 'Menu' (Home / Clients / Work / Universe / Contact Us as plain text links), 'Contact' (Dubai, UAE address + two email addresses), and a lone 'Back to top' link at the far right — genuinely useful sitemap content, not just decoration.
  - Bottom-most hairline row: 'Cookie Policy' / 'Privacy Policy' (small, muted) on the left-center, '©2026 All Copyrights Reserved by Aeva' (credit, linked) on the right — legal microcopy kept small and out of the way.
  - Two capsule icon buttons float top-right of the footer zone: one looks like a sound-wave/audio toggle, one is a hamburger menu — a persistent utility bar riding above the footer content.
- **mobile**:
  - Could not confirm — mobile load stalled on the brand's splash/loading screen (a centered lion-crest logo lockup on a white card over black letterbox bars) even after an extended wait, so the actual mobile footer transformation is unverified from this capture. Flagged as unconfirmed rather than guessed.
- **motion**:
  - Not observed (static captures only); the overlapping serif/script wordmark treatment strongly implies a scroll-reveal or parallax separation between the two type layers, but this is inferred from the layout, not measured.
- **steal**: Build maxfolio's footer signature out of Max's own name using the same two-layer trick — a bold sans 'MAX BUSTAMANTE' with a lighter, smaller descriptor word (e.g. 'shopify.' or 'CTO.') overlapping behind it — as the transition between the Contact section's giant CTA line and a small, genuinely useful closing row (email / LinkedIn / 'Back to top' / a one-line credit), rather than repeating the same typographic hero treatment used at the top of the page.

## jonas.do — https://jonas.do/
- **desktop**:
  - Footer is introduced by a full-width diagonal/skewed color-block transition (white content area cuts down at an angle into a near-black footer field) instead of a straight hairline — the footer literally has a different silhouette than the page above it.
  - Inside the dark field: a centered 'Keep in touch:' label, then a vertical stack of bordered rectangular boxes styled like labeled form fields — each has a small uppercase micro-label (EMAIL / SKEET / TOOT / CONNECT / SUBSCRIBE) and a large italic handwritten-style value underneath that IS the clickable action (hello@jonas.do, Bluesky, Mastodon, LinkedIn, Newsletter).
  - No icon row at all — every contact method is its own full-width bracket/box, so there's exactly one thing to do per box (this replaces the 'row of tiny icons' pattern entirely).
  - Closes with a small chat-bubble smiley glyph, no legal text, no copyright line, no sitemap — the footer's only job is 'here's how to reach me,' nothing else.
- **mobile**:
  - Structurally identical — same diagonal color transition, same stacked labeled-boxes, same order — just full-width boxes at the mobile column width. This is one of the few footers in the set that needs ZERO mobile-specific restructuring because it was already single-column on desktop.
- **motion**:
  - Not observed directly; the boxes read as static bordered elements in both captures — no hover/press state visible in a static shot.
- **steal**: The single strongest footer steal for maxfolio: replace the current hairline row of email/phone/location/social icons with 3-4 labeled bracket-boxes (EMAIL / CALL / LINKEDIN / CALENDAR) each showing the actual value in a distinct display font, stacked full-width on mobile and as a tight row on desktop — turns 'contact info as afterthought row' into a deliberate, scannable, zero-icon-guessing block that directly answers the owner's 'clearer contact' complaint.

## swyx.io — https://www.swyx.io/
- **desktop**:
  - No visual footer band or color change at all — the footer is just a hairline rule after the last blog-post list, immediately followed by a single text-link row: 'Home · About · Podcasts · Newsletter · RSS · Portfolio · Twitter · GitHub · YouTube' — sitemap and socials merged into ONE middot-separated line, no icons anywhere.
  - Below that: an honesty/transparency line — '~3.6K views [hide]' — a live page-view counter with a toggle to hide it, presented as plain small text, not a stat card.
  - Then a one-line personal easter egg/signature: '* GNU Terry Pratchett' (an in-joke HTTP-header tradition among developers) — pure personality, zero marketing copy.
  - A separate floating pill, NOT part of the footer flow, sits fixed bottom-right: '● Live readers · 👋' — a real-time presence indicator showing how many people are on the page right now.
- **mobile**:
  - Everything reflows to the same narrow column, same order, same middot-separated link line wrapping to two lines.
  - The floating live-readers pill shrinks and its copy changes from 'Live readers' to a literal count ('1 here · 👋') — the desktop pill is a generic label, the mobile pill states the actual number, a small but deliberate copy change for the cramped width.
- **motion**:
  - The live-readers pill implies a websocket/polling-driven live update (the count itself is dynamic by definition), though a single static capture cannot show it changing in real time — the counting mechanism is inferred from the feature, not directly observed animating.
- **steal**: Add ONE small honesty/personality line under maxfolio's main contact block — not a fake live-visitor widget (would read as invented data, which the project's constraints forbid), but something true and low-effort like a build/version stamp ('Rebuilt Sept 2026 · React 19 + Vite, Lighthouse 100') — gives the same 'a real person maintains this, not a template' signal without inventing metrics.

## delba.dev — https://delba.dev/
- **desktop**:
  - Extremely minimal: after the last content list ('Personal' projects), a single thin hairline, then one small text-link row on the right column only: 'LinkedIn · YouTube · GitHub · X' — middot-separated, no icons, no labels, no legal text, no copyright, no sitemap.
  - That's the entire footer — four words functioning as both the social presence AND the page's closing element.
- **mobile**:
  - The 'About me' bio block (photo + 2-sentence intro) that sat ABOVE the social-link footer in the right column on desktop moves to directly ABOVE the link row in the single mobile column — content that was side-by-side (bio right rail / project list left) becomes strictly sequential, with the social-link footer staying pinned as the very last element in the stack either way.
- **motion**:
  - Not observed — static text links, no visible hover/transition state in the captures.
- **steal**: Confirms a viable minimum: a footer does not need icons, legal copy, or a sitemap to feel finished — for maxfolio, this validates keeping the closing social row down to plain text links (no generic icon set) IF the rest of the footer (CTA + labeled contact boxes per the jonas.do steal) already carries the visual weight; don't stack a heavy icon row on top of an already-strong contact block.

## leerob.com (contrast/avoid case — no designed footer) — https://leerob.com/
- **desktop**:
  - There is NO closing footer band at all — the page simply ends after the last content module (a 'Blogs' list with dates) next to a decorative illustration. No hairline, no copyright, no social row, no CTA repeat, nothing signals 'this is the end of the page.'
- **mobile**:
  - Same absence carries over — the Blogs list and illustration stack vertically and the page just stops; no footer content appears at any breakpoint.
- **motion**:
  - None applicable — nothing to animate.
- **steal**: This is an AVOID, not a steal, but worth naming explicitly: given the owner's complaint about wanting clearer CTAs and a stronger close, letting maxfolio's page 'run out' the way leerob.com does (ending on the last content section with no closing statement, no repeated CTA, no contact reminder) would be a regression relative to even the current Apple Clean theme's contact section — every version of the redesign should end on a deliberate footer, not just stop.

## ideas
- Build maxfolio's footer in two visually distinct layers like Pensatori Irrazionali: a signature typographic moment (overlapping 'MAX BUSTAMANTE' + a lighter descriptor word) as the transition INTO the footer, then a small, genuinely useful utility block below it — gives the page a proper closing 'archetype' (pull-quote/typographic moment) distinct from the stat band and hero typographic moments already used earlier.
- Replace the current hairline row of email/phone/location/social icons with jonas.do's labeled bracket-boxes: EMAIL / CALL / LINKEDIN / BOOK-A-CALL, each a bordered box with a micro-label and the actual value in a distinct display font — stacks full-width on mobile, sits as a tight 4-up row on desktop.
- Add a second, lower-commitment CTA pill next to the primary 'Get the free 20-minute review' button (SOHub's dual-CTA pattern) — e.g. 'Book 15 min on my calendar' — so recruiters and DTC owners each get a CTA weight that matches their intent.
- Frame the primary CTA with two-word micro-copy captions left/right of the headline (Podium's 'NOT THE FINISH LINE. / IT'S STEP ONE.') to reduce the pressure of the ask without adding any new component — pure copywriting, zero layout cost.
- Give the footer a full-bleed color-block field (not just a darker shade of the existing background) the way Mosby's Files does, so it reads as a genuinely separate closing section rather than a continuation of the Contact band — satisfies the 'distinct archetype, not a repeat' rule for G3.
- Design 4-6 custom line-drawn glyphs specific to Max's domain (cart, Liquid braces, a Lighthouse-100 badge, a theme/file icon) to replace generic LinkedIn/GitHub icons in the footer's social row, echoing Mosby's Files' blueprint-icon trick — reinforces 'zero AI slop' since these can't be mistaken for a template's stock icon set.
- Keep the closing social-link row itself minimal and text-only (delba.dev / swyx.io pattern: 'LinkedIn · GitHub · X', middot-separated, no icons) if the contact-box block above it already carries visual weight — avoids double-emphasizing the same info in two different visual styles.
- Add ONE honest, non-invented personality/trust line near the bottom of the footer — e.g. a real 'Last rebuilt: Sept 2026 · React 19 + Vite, Lighthouse 100' stamp — swyx.io's 'view count + easter egg' shows a footer can carry personality through TRUE small facts instead of decoration, and this doubles as a credibility signal for the CRO/perf audience.
- Use a diagonal/skewed transition edge (jonas.do) instead of a straight hairline between the Contact section and the footer band, to make the footer read as a deliberately different zone rather than 'more of the same page.'
- Turn the footer's secondary navigation (if any is added) into arrow-suffixed pill buttons matching the primary CTA's button style (SOHub's 'STUDIO →' pattern) rather than plain text links, so footer nav doesn't visually regress to 'default template list.'
- Never let the page simply stop after the last content section (leerob.com's failure mode) — always land on a deliberate footer band, even a minimal one, given the owner's explicit ask for stronger, clearer CTAs.
- For the Explore/theme-switcher section that currently sits after Contact, consider folding its function into the diagonal-transition footer zone as a tertiary, small-type option ('Prefer a different look? Switch theme') rather than a full separate card section — keeps the page from ending on a low-stakes utility feature after the high-stakes CTA.
- If a live-visitor or view-count widget is ever added, it must show a REAL number sourced from real analytics (swyx.io's ~3.6K views is presumably real traffic) — never a placeholder or invented figure, per the project's honesty constraint.
- Keep legal/credit microcopy (if any — e.g. 'Built by Max, 2026') genuinely tiny and low-contrast in a corner, the way Pensatori Irrazionali and Podium both do, rather than giving it equal visual weight to the contact information above it.
## avoid
- Do not let the footer become a second card-grid — none of the deliberately-designed footers in this set use cards; they use typography, bordered field-boxes, pill buttons, or plain text links.
- Do not invent a live-visitor counter or view count if there's no real backing data (swyx.io's works because it's real; a fake one would violate the project's honesty constraint and read as slop).
- Do not use a generic 6-icon social row (Twitter/LinkedIn/GitHub/Instagram/Dribbble/Email) with default brand-color icons — every strong footer here either drops icons entirely (delba.dev, swyx.io) or replaces them with custom on-brand glyphs (Mosby's Files) or labeled boxes (jonas.do).
- Do not let the footer repeat the exact same typographic-hero treatment as the page's opening hero — vary the type pairing/scale/color so it reads as a distinct closing statement, not a copy-paste of the top.
- Do not end the page on a content list with no closing signal at all (leerob.com, samuelkraft.com both do this) — reads as unfinished relative to what the owner is asking for.
- Do not overload the footer with a full sitemap of every page/section — Pensatori Irrazionali's 5-link menu is the upper bound in this set; most sites here intentionally keep it to contact + socials only.
