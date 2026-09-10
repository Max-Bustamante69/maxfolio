# Lens: three-d-scroll — 3D-on-scroll for maxfolio.dev

Research pass for how the best portfolios/showcases use 3D on scroll without killing performance.
All screenshots under `refs4/three-d-scroll/<site-slug>/` (full.png, vp-0/35/70.png, mobile-390.png
for 1-in-4 sites). No captcha/login walls hit; every target loaded cleanly.

## 1. Site / shot table

| # | URL | Author / Studio | What it is | Why it matters |
|---|---|---|---|---|
| 1 | awwwards.com/websites/3d/ | Awwwards (curated) | Tag listing of ~4,600 award-winning 3D sites, filterable by award/category/tech/color | Fastest way to sample current 3D-web trends at volume; card thumbnails alone show composition patterns (oversized type over 3D render, product-float hero, dark UI chrome) |
| 2 | awwwards.com/websites/webgl/ | Awwwards (curated) | Tag listing filtered to WebGL-tech sites specifically | Narrower than "3d" tag — surfaces shader/particle-heavy sites vs. simple 3D-model sites |
| 3 | lusion.co | Lusion (studio) | Agency site famous for cinematic WebGL hero scenes or scroll-scrubbed 3D loaders | Reference for "loading %" gate pattern before a heavy 3D scene reveals — screenshot caught mid-load (numeral "006" + progress bar on black), itself a useful pattern |
| 4 | bruno-simon.com | Bruno Simon | Driveable go-kart portfolio built in three.js/Cannon.js — the canonical "3D portfolio as game" | Extreme end of the spectrum: full physics playground. Loader alone is a neon vaporwave-grid "b" logo tracing itself on a perspective floor grid — strong loading-screen idea even without adopting the whole game concept |
| 5 | threejs.org/examples/ | three.js core team | Official example gallery (500+ demos: animation, skinning, WebGPU, shaders, physics) | Ground-truth technique reference — every demo is inspectable source, MIT-licensed, and runs vanilla `three` with no framework tax |
| 6 | docs.pmnd.rs/react-three-fiber/.../examples | Poimandres (pmndrs) | Official React Three Fiber "Showcase" gallery — real production sites built with R3F | Shows what R3F actually looks like shipped (Fanbyn furniture configurator, editorial/game-prototype work) — the React-idiomatic path into three.js |
| 7 | spline.design/community | Spline | No-code 3D tool; homepage/community showcase itself is a live 3D scene (floating primitives + low-poly bunny on a wireframe ground plane) | The hero itself is the best asset: soft-shaded rounded primitives (blob, cone, hex) drifting with slow physics-like float + parallax on mouse/scroll — directly portable idea, no textures needed |
| 8 | poly.pizza | Bruno Oliveira (indie) | 10,600+ free low-poly 3D models, CC0/CC-BY, GLTF-ready | Primary asset source for Arcade theme (low-poly, comic-adjacent) and quick geometric props everywhere — confirmed license badges per model |
| 9 | sketchfab.com/features/free-3d-models | Sketchfab | Large free/CC 3D model marketplace, categorized (characters, vehicles, weapons, PBR) | Secondary asset source — higher-fidelity PBR models when a scene needs realism (e.g., a glass/metal hero object for Apple theme); always check per-model license before use |
| 10 | tympanus.net/codrops (WebGL tutorials) | Codrops / Filip Kantedal, Marek Jóźwiak et al. | Rolling tutorial feed of production-quality WebGL techniques with full code | Freshest technique intel (dated Sep 2026): "Infinite Liquid Glass Grid with Three.js, WebGPU, TSL" and "Real-Time 3D Face Mask with MediaPipe + Threlte" — both show current shader/WebGPU direction |

## 2. Catalog — ≥25 reusable ideas

### A. Hero / scroll-scrub mechanics

**1. Scroll-scrubbed single hero object (rotate + zoom tied to scrollY)**
- Looks like: one 3D object (product, monogram, abstract shape) rotates and dollies toward camera as the user scrolls the hero section; scroll position maps 1:1 to a rotation/position timeline, no easing lag once you release the wheel.
- Fits: Apple theme hero (glass/metal monogram), Luxury theme hero (gold ring or perfume bottle-style abstract form).
- Sketch: vanilla three.js scene mounted in a lazy React component; on scroll, read `scrollYProgress` (via a tiny IntersectionObserver-driven value or `window.scrollY / sectionHeight`), write directly to `mesh.rotation.y = progress * Math.PI * 2` and `camera.position.z = lerp(8, 3, progress)` inside `requestAnimationFrame`, not inside the scroll handler itself (throttle writes, not reads).
- Perf: cap DPR at 1.5, `powerPreference: 'high-performance'`, pause the RAF loop via `IntersectionObserver` when hero scrolls out of view; desktop-only load (`matchMedia('(min-width: 1024px) and (pointer: fine)')`).
- A11y: `prefers-reduced-motion` → freeze at a static rotation, no scroll-coupling; canvas is `aria-hidden`, real heading/CTA remain in the DOM as normal HTML behind/around it.
- Ref: lusion-co/vp-0.png (loader), spline-design-community/vp-0.png (floating primitives, same coupling idea without scroll yet).

**2. Sticky "product scrub" panel (pin section, scrub through frames/rotation)**
- Looks like: section becomes `position: sticky` for N viewport-heights while an object completes a full rotation or a multi-stage transform (assemble → explode → reassemble), classic "pin and scrub."
- Fits: process-stepper section (steps orbit around a pinned 3D object) or the years-chart section reimagined as a pinned 3D bar/line extrusion.
- Sketch: CSS `position: sticky; top:0; height: 100vh` wrapper inside a tall (`300vh`) scroll track; framer-motion `useScroll({ target: trackRef })` → `scrollYProgress` drives both the three.js camera/mesh AND any DOM captions with `useTransform`.
- Perf: only start the WebGL context when the sticky wrapper enters viewport (IntersectionObserver), destroy renderer/dispose geometries on unmount to avoid GPU memory leak across route changes (React Router SPA).
- A11y: reduced-motion → render only the final-state frame as a static image/canvas snapshot; ensure track height doesn't create a scroll-jank trap on trackpads (test momentum scroll, not just wheel ticks).

**3. Parallax depth layers using real geometry, not just CSS transforms**
- Looks like: 2-3 z-depth planes (foreground prop, midground shape, background particle field) each scroll at a different rate, but rendered as actual 3D planes at different `z`, so perspective/occlusion is physically correct instead of faked with `translateY` percentages.
- Fits: Soft UI theme (matte blobs at different depths behind cards) or gallery carousel background.
- Sketch: three orthographic-camera-friendly planes with slight z offsets; scroll progress multiplies each plane's `position.y` by a different factor (0.2/0.5/1.0).
- Perf: cheap — 3 flat planes, no lighting complexity needed if using `MeshBasicMaterial` with baked gradients.

**4. Loading-percentage gate before the 3D reveal**
- Looks like: numeral counter (e.g. "006" seen on lusion.co) + thin progress bar on black, holds the page until textures/geometry are ready, then wipes/fades to reveal the scene.
- Fits: any theme's first heavy 3D section — sets expectation so first paint doesn't jank when assets pop in.
- Sketch: track `THREE.LoadingManager.onProgress`, render the % as a normal DOM overlay (not canvas text) with a CSS transition on width; cross-fade overlay opacity to 0 on `onLoad`.
- Perf/UX: cap hold time at ~1.5s even if not fully loaded (show a spinner fallback) so slow connections don't feel broken; never block scroll during the gate for more than the hero's own height.
- Ref: lusion-co/vp-0.png, bruno-simon-com/vp-0.png (neon-grid loader variant).

**5. Neon-line/logo "draw-on" reveal on a perspective grid (loader or hero accent)**
- Looks like: a glowing curved line traces itself (stroke-dashoffset-style) over a dim perspective grid with small "×" starfield accents — moody, retro-futurist.
- Fits: Arcade theme loading screen or section divider (matches its game-menu identity).
- Sketch: SVG `stroke-dasharray`/`dashoffset` animated with framer-motion for the line (cheap, no WebGL needed for this specific effect); grid can be a repeating CSS `background-image` with perspective `transform: rotateX()` rather than true 3D.
- Perf: this one is deliberately NOT WebGL — pure CSS/SVG achieves the bruno-simon.com loader look at near-zero cost.
- Ref: bruno-simon-com/vp-0.png.

### B. Procedural / no-external-model geometries (cheap to build, no asset licensing)

**6. Torus-knot hero as a "signature shape"**
- Looks like: a single smooth, colored torus-knot slowly rotating, often with a matcap or gradient material instead of real lighting.
- Fits: Apple theme (frosted-glass matcap) or a "brand mark" moment on the homepage.
- Sketch: `new THREE.TorusKnotGeometry(1, 0.3, 200, 32)` + `MeshMatcapMaterial` (matcap texture can be a small procedurally-generated gradient PNG, ~20KB) — zero external model dependency.
- Perf: single mesh, trivial draw call; safe even on mid-tier laptops.

**7. Low-poly "crystal" cluster (icosahedron variants)**
- Looks like: 3-6 faceted crystal shapes of varying scale clustered together, refracting/reflecting subtly, often in a brand accent color.
- Fits: Luxury theme (gold/marble — swap material to a gold `MeshPhysicalMaterial` with high metalness/low roughness).
- Sketch: `THREE.IcosahedronGeometry(r, 0)` (0 detail = faceted look) instances at random offsets inside a `THREE.Group`; slow independent rotation per instance via a per-mesh random speed multiplier.
- Perf: `MeshPhysicalMaterial` with env-map reflections is the priciest part — bake a small (256px) HDR-like gradient cubemap instead of loading a real HDRI (keeps under the 300KB asset budget).

**8. Metaball blob field (Soft UI signature)**
- Looks like: 2-4 soft, merging, gooey blobs that slowly drift and combine/separate — the literal 3D version of Soft UI's neumorphic softness.
- Fits: Soft UI theme background ambience behind cards.
- Sketch: three.js `MarchingCubes` example (bundled in three's `examples/jsm/objects/MarchingCubes.js`) — no external assets, purely procedural implicit-surface geometry recalculated per frame at low resolution (e.g. 28³ grid) to stay cheap.
- Perf: resolution is the main cost lever — 28-32 grid resolution is enough for a soft blob look at hero scale and stays well within budget on integrated GPUs; skip on mobile entirely (render a static blurred PNG blob instead).

**9. Particle field with scroll-linked density/spread**
- Looks like: a sparse point cloud that's tight/still at rest and expands/swirls outward as you scroll past a section, like a subtle "dust" reveal.
- Fits: transition moment between sections (e.g., between hero and stat band), or Arcade's comic "impact burst" on a CTA.
- Sketch: `THREE.Points` with `BufferGeometry` positions randomized in a sphere; scroll progress drives a uniform `uSpread` in a custom `ShaderMaterial` vertex shader that displaces each point outward along its own direction vector.
- Perf: GPU-instanced, thousands of points cost almost nothing versus mesh geometry — the cheapest "3D" effect in this whole catalog; good candidate to keep on for reduced-motion users too since it's ambient, not disorienting, if you keep max displacement small.

**10. Wireframe ground grid with perspective (Spline/Tron aesthetic)**
- Looks like: a horizon-line wireframe plane with a subtle glow/fade toward the vanishing point, objects appear to "sit" on this surface.
- Fits: Arcade theme (retro-arcade grid), or as a section-divider motif tying multiple sections together visually.
- Sketch: `THREE.GridHelper` with a custom shader for distance-based opacity fade, OR pure CSS: a `repeating-linear-gradient` background on a `transform: perspective(600px) rotateX(60deg)` div — the CSS version is nearly free and indistinguishable at a glance.
- Ref: spline-design-community/vp-0.png (grid floor under floating shapes).

### C. Interaction & motion patterns

**11. Mouse-parallax tilt on the hero 3D object (no scroll needed, but compounds with it)**
- Looks like: the object subtly leans toward the cursor position (max ~10-15° tilt), adds a "living" feel at rest before any scroll happens.
- Fits: any theme's hero.
- Sketch: track normalized mouse position, spring-interpolate (`framer-motion`'s `useSpring` or manual lerp) toward target rotation each frame; combine additively with the scroll-driven rotation from Idea 1 rather than replacing it.
- A11y: skip entirely on touch (no persistent pointer) — feature-detect `matchMedia('(pointer: fine)')`.

**12. Scroll-velocity-reactive material (e.g., chromatic aberration or distortion spikes on fast scroll)**
- Looks like: object/shader subtly glitches or smears when the user scrolls fast, settles when they slow down — reinforces "this responds to you."
- Fits: Brutalist theme (glitch fits its raw aesthetic) or Arcade (juice/game-feel).
- Sketch: compute scroll delta per frame, feed into a shader uniform (e.g. RGB-channel UV offset), decay the value exponentially each frame (`velocity *= 0.9`) so it self-settles without extra logic.
- Perf: shader-only cost, negligible.

**13. Depth-of-field focus pull tied to section entry**
- Looks like: background blurs while foreground 3D object sharpens as a section scrolls into center-viewport, mimicking camera focus racking.
- Fits: case-study sheet reveal, or storefront index cards "focusing in" as they center.
- Sketch: three.js `EffectComposer` + a bokeh/DoF pass, drive focus distance with the same IntersectionObserver ratio used for section-active state.
- Perf: postprocessing passes are the single most expensive addition in this catalog — reserve for ONE hero moment, never running compositor passes on more than one canvas at a time, and skip on mobile/low-tier GPU (`navigator.gpu` check or simple GPU-tier heuristic via `renderer.info`).

**14. "Explode/assemble" on scroll for a multi-part object**
- Looks like: a composed object (e.g., a stylized laptop/device made of a few primitives, or an abstract logo built from separate pieces) separates into its component parts as you scroll in, reassembles as you scroll back.
- Fits: process-stepper (each step = one piece locking into place) or an "about the stack" moment showing tools as parts of one whole.
- Sketch: each child mesh stores a `restPosition` and an `explodedOffset`; on each frame set `mesh.position.lerpVectors(rest, exploded, scrollProgress)`.
- Perf: same cost as any low-poly scene; the only work is authoring reasonable "explode" offsets by hand.

**15. Cursor-following 3D "spotlight" or point light**
- Looks like: a single point light in the scene tracks the 2D cursor projected into 3D space, so highlights/specular sweep across the object as the mouse moves — cheap way to make a static-looking object feel alive without animating the mesh itself.
- Fits: Apple theme (glass material really sells this), Luxury (gold specular sweep).
- Sketch: raycast mouse position onto an invisible plane at the object's depth, move `pointLight.position` there each frame.
- Perf: one extra light, trivial.

### D. Data-as-3D (real-numbers-only, per the brief)

**16. 3D bar/column extrusion for the years-chart section**
- Looks like: instead of a flat 2D bar chart, each year's bar is an extruded 3D column with a slight isometric camera angle; scroll reveals bars growing from 0 to real height in sequence (staggered), camera does a slow orbit as it settles.
- Fits: replaces/upgrades the existing years chart section directly.
- Sketch: `THREE.BoxGeometry` per data point, scale.y animated from 0→value with a spring/easing keyed to scroll-into-view (stagger via index * 80ms delay); label sprites (`THREE.Sprite` with canvas-drawn text texture) or, simpler, overlay real HTML labels positioned via `camera.project()`math each frame.
- Data integrity: heights map directly and only to the real metric (years of experience / project counts) — no decorative scaling, keep axis/labels legible as HTML overlays, not baked into geometry, so numbers stay screen-reader-accessible.
- A11y: always pair with a genuine `<table>` or list of the same values in the DOM (visually hidden or in a "view as table" toggle) — this is a hard requirement whenever data moves into canvas.

**17. Rotating "stat ring" — a torus divided into arcs by percentage**
- Looks like: a 3D ring/torus where each arc segment's length maps to a share of 100% (e.g., skill split, time allocation), slowly rotating, camera slightly tilted for a coin-like read.
- Fits: skills section (recast as proportional skill-time allocation if real data exists) — only build this if there's a genuine percentage breakdown to show, never invented ratios.
- Sketch: `THREE.RingGeometry` or a custom extruded arc per segment using `THREE.Shape` + `ExtrudeGeometry`, arc length = `percentage/100 * Math.PI*2`.

**18. Particle-count visualization (literal 1 particle = 1 unit)**
- Looks like: a real countable metric (e.g., total commits, projects shipped, lines of a specific real stat) rendered as an actual particle count in a `THREE.Points` cloud, so the density itself is honest data, not decoration.
- Fits: stat-band section, if/when a real per-unit countable metric exists.
- Sketch: generate exactly N points (capped for perf, e.g. subsample above ~20k with a clear "×100 per point" legend if the real number is huge), arrange in a pleasing 3D distribution (sphere/spiral), reveal via scroll-scrubbed opacity/scale.
- Data integrity: label the scale factor explicitly if subsampled — never let visual density imply a different number than the real one.

### E. Section-composition & layout ideas

**19. Oversized flat-type-over-3D-render hero (Awwwards top pattern)**
- Looks like: huge editorial wordmark/headline sits directly over a photoreal or stylized 3D render that fills the whole viewport, both scroll together with the type layer moving slightly slower (a text/render parallax split).
- Fits: typographic hero section already in maxfolio — a natural upgrade path without replacing the section's structure.
- Sketch: type stays real DOM `<h1>` (never bake text into canvas — keeps SEO/a11y), 3D canvas is a fixed/absolute background layer with `position: fixed` inside the hero's scroll range only.
- Ref: awwwards 3D-tag cards throughout www-awwwards-com-websites-3d/vp-0.png (e.g. "PARADISE IN EVERY SIP" coconut render, "IMMERSIVE" liquid-glass droplet render).

**20. Card-grid where each tile is a mini interactive 3D viewport (R3F showcase pattern)**
- Looks like: a grid of project/skill cards where hovering one activates a small embedded 3D scene inside just that card (not full-bleed), rest of the grid stays static images.
- Fits: storefront index / projects index — could give each case study a tiny signature 3D icon that only "wakes up" on hover/focus.
- Sketch: one shared `WebGLRenderer` with multiple scenes rendered to different viewport rects (three.js multi-view technique) rather than one canvas per card — critical for perf, since N canvases each with their own context is the #1 way to tank frame rate on a grid page.
- Perf: this shared-renderer approach is the single most important perf lesson from R3F showcase-style grids — never instantiate more than one WebGL context per page.

**21. Full-bleed "world-building" abstract product shot as case-study cover (Metabole/basement-studio pattern)**
- Looks like: case-study cover art is a single moody, atmospheric 3D render (foggy terrain, submerged object, oversized product) rather than a screenshot — sets tone before any content loads.
- Fits: case-study sheet covers.
- Sketch: this can be a pre-rendered image (Blender/Spline export to PNG/WebP) rather than live WebGL — often the smarter perf trade when the shot doesn't need to be interactive.
- Ref: www-awwwards-com-websites-3d/vp-0.png ("basement studio" jet-over-terrain card, "Ocean Autonomy" boats-at-sea card).

**22. AI-prompt-to-3D "create" affordance as a playful empty state or Easter egg**
- Looks like: a text input styled like a command bar ("Describe what you want to create...") sitting inside/near the 3D scene, implying generative interactivity even if not literally wired to an AI backend.
- Fits: Arcade theme (game-menu identity loves a "console command" affordance) as a decorative, honest (non-functional or genuinely functional if scoped) detail.
- Sketch: pure UI chrome — a styled `<input>` overlay; if made functional, keep scope tiny (e.g., swap a preset material/color, not real generation) and label it clearly.
- Ref: spline-design-community/vp-0.png hero input bar.

**23. Sticky sidebar example-picker next to a live canvas (three.js/R3F docs pattern)**
- Looks like: left sidebar lists items (examples, in maxfolio's case maybe "themes" or "case studies"), right pane is a live-updating canvas/preview that swaps content on selection without a page reload.
- Fits: "explore themes" section — could become a real live 3D/visual preview per theme instead of a static thumbnail.
- Sketch: single canvas instance, swap scene/material config via state on sidebar item click, keep transitions to a quick cross-fade to avoid jarring pops.
- Ref: threejs-org-examples/vp-0.png, docs-pmnd-rs.../vp-0.png sidebars.

**24. Marquee/ticker section rendered with subtle 3D letter extrusion instead of flat text**
- Looks like: the existing ticker section's text gets a thin extrusion + slight rotation on scroll (letters tilt as they cross center), rather than a flat CSS marquee.
- Fits: ticker section upgrade.
- Sketch: three.js `TextGeometry` (needs a loaded font JSON, ~30-80KB) + `ExtrudeGeometry` bevel; alternative cheaper route: fake the extrusion with a CSS `text-shadow` stack of offset layers + `perspective` on the container — much lighter than real 3D text and often visually close enough.
- Perf note: real 3D `TextGeometry` is one of the pricier assets to font-load; prefer the CSS-fake version unless the extrusion needs to interact with lighting/shadows.

**25. Layered SVG/3D hybrid "gallery carousel" where the active slide's product lifts into a subtle 3D tilt**
- Looks like: carousel slides are flat images at rest, but the centered/active slide gets a subtle 3D card-tilt (perspective transform, not full WebGL) responding to scroll or drag velocity.
- Fits: existing gallery carousel section — a lightweight, purely-CSS 3D touch rather than full WebGL, appropriate since this section already has many images.
- Sketch: `transform: perspective(1000px) rotateY()` driven by drag/scroll delta, framer-motion `useMotionValue` + `useTransform`; no three.js needed at all.
- Perf: essentially free — GPU-accelerated CSS transform only.

**26. "Build-in-public" wireframe reveal transition between sections (three.js edges-only pass)**
- Looks like: as one section scrolls out, its hero object dissolves into a wireframe/edges-only version before the next section's object solidifies from wireframe — ties sections together as "the same 3D world continuing."
- Fits: transition between hero and stat-band, or between experience-split and years-chart.
- Sketch: `THREE.EdgesGeometry` + `LineBasicMaterial` swapped in via opacity cross-fade with the solid `MeshStandardMaterial` version, both meshes share the same geometry so the silhouette matches exactly.
- Perf: negligible extra cost since it reuses existing geometry.

**27. Procedural gradient "matcap" library instead of downloaded HDRI/textures**
- Looks like: N different look/materials (chrome, matte clay, iridescent, brand-color glass) that all read as high-production 3D lighting, generated from tiny (64-128px) canvas-drawn radial gradients rather than photographed light probes.
- Fits: every theme, as the actual technique underlying ideas 6/7/16 — this is the "how" that keeps all of them under the ≤300KB budget.
- Sketch: draw a radial/conic gradient to an offscreen `<canvas>` at build time (or runtime once, cached), feed as `THREE.CanvasTexture` into `MeshMatcapMaterial.matcap`.
- Perf: each matcap texture costs a few KB versus 200KB+ for a real HDRI environment map — this is the single highest-leverage perf trick in the whole catalog for "looking expensive."

## 3. Implementation notes that apply across the catalog

- **Lazy-load pattern (React):** every 3D component should be `React.lazy()` + `Suspense`, imported only after (a) `matchMedia('(min-width: 1024px)')` passes, AND (b) an `IntersectionObserver` confirms the section is within ~1 viewport of the current scroll position. Combine with `import('three')` dynamic import so the ~150KB three.js core never ships to mobile or to a visitor who never scrolls that far.
- **Budget:** keep any single 3D section's total added JS+asset weight ≤ 300KB gzipped (three.js core is already ~150KB min+gzip on its own, so procedural geometry + matcaps, not GLTF models, is usually the right call for a portfolio where every KB matters against Lighthouse).
- **Fallback for `prefers-reduced-motion` and low-tier devices:** always render a static, art-directed poster frame (a pre-exported PNG/WebP of the scene) instead of the live canvas — never simply hide the section, since the visual composition is often load-bearing for the layout.
- **Context hygiene:** exactly one `WebGLRenderer` per page at a time; dispose geometries/materials/renderer on route change (React Router unmount) or you leak GPU memory across SPA navigation — this bit real production sites in the R3F/three.js community and is the most common cause of "site gets slower the longer you browse it."
- **Testing:** verify actual frame time (not just Lighthouse score) via Chrome Performance panel with 4x CPU throttle on a mid-tier device profile; a 3D hero that hits 60fps on your dev machine can easily drop to 15fps on real visitor hardware.

## 4. Avoid list

- **Do not** ship a full physics/game-controller portfolio (bruno-simon.com style) as the DEFAULT experience — it's a legitimate genre but wrong for a Shopify-engineer portfolio whose audience wants to quickly assess skills, not play a game; at most, reference the idea for ONE playful Arcade-theme easter egg, opt-in.
- **Do not** load real GLTF/GLB model files from Sketchfab/Poly Pizza into the main scroll path without checking license terms per-model AND compressing via `gltf-transform`/Draco — raw exports are frequently multi-MB.
- **Do not** run more than one live `WebGLRenderer` context simultaneously on one page (kills mobile Safari especially — it silently drops contexts past ~8-16 concurrent WebGL contexts, causing scenes to go black).
- **Do not** couple 3D rotation/position updates directly inside the native `scroll` event handler — always read the scroll value in the handler (or via `IntersectionObserver`/`ScrollTimeline`) but write to Three.js objects inside `requestAnimationFrame`, or you'll get scroll-jank on every device.
- **Do not** invent chart data or exaggerate 3D bar-chart heights/particle counts for visual drama — every data-as-3D idea (16-18) must map 1:1 to a real number, with a genuine HTML-table equivalent for accessibility and honesty.
- **Do not** bake informational text into canvas/WebGL (3D `TextGeometry` for real headings, stats, or nav) — it breaks SEO, screen readers, and text-selection; reserve 3D text for pure decoration with a real HTML duplicate underneath/around it.
- **Do not** enable heavy postprocessing (bloom, DoF, SSAO stacks) on more than one section — pick a single hero moment; stacking multiple full-screen passes across several sections is the fastest way to tank Core Web Vitals (LCP/INP) on a portfolio that should load in well under 2s.
- **Do not** autoplay a 3D scene's animation loop when the section is scrolled out of view — always pause the RAF loop via IntersectionObserver; an off-screen canvas still burning GPU/CPU is a common, invisible battery/perf drain.
- **Do not** skip the `prefers-reduced-motion` and mobile fallback — a static poster-frame image is mandatory, not optional, for every 3D section in this catalog.
- **Do not** treat awwwards.com's own "502 Bad Gateway" text visible in one capture as a real technique reference — it's their own transient server error banner overlapping the page chrome, not part of the design (noted for the record so it isn't mistaken for an intentional glitch-text pattern).
