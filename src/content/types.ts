import type { ExperienceId, RoleWorkId, StatId, SkillGroupId, StoreRole } from '../data/registry'
import type { WorkKind } from '../data/timeline'

interface SectionHeading {
  eyebrow: string
  title: string
  titleAccent: string
}

/**
 * Commerce-oriented line templates — catalog/offer/delivery/reach, one sentence per angle, read from
 * the live storefront (src/data/commerce.json) and the registry. Used by the Gallery wall's captions
 * and the Shopify Work index rows (src/data/commerceLines.ts); the case-study sheet itself no longer
 * shows a commerce-tile block (superseded by the Impact block's conversion/revenue/load-time/delivery
 * story, 2026-09-10).
 */
export interface CommerceLabels {
  catalogLine: string // '{products} products · {collections} collections · from {price}'
  catalogLineNoPrice: string // '{products} products · {collections} collections'
  deliveryLine: string // 'Shipped in {weeks} weeks · live since {month}'
  reachLine: string // '{currency} · ships to {n} places'
  reachLineSingle: string // '{currency} pricing'
  offerFallback: string // generic offer line when nothing more specific is derivable
  offerKind: Record<string, string> // short offer-mechanic labels keyed by the registry fact id
}

export interface PortfolioContent {
  meta: { title: string; description: string }
  hero: {
    eyebrow: string
    positioning: string
    lead: string
    availability: string
    location: string
    ctaContact: string
    ctaPrimary: string
    ctaSecondary: string
    ctaNote: string
    ctaCv: string
  }
  stats: Record<StatId, string>
  /** One honest provenance line per stat band figure, shown on hover/tap so nothing reads as a boast without a source. */
  statSources: Record<StatId, string>
  sections: {
    experience: SectionHeading & { achievements: string; technologies: string; visit: string }
    shopify: SectionHeading & { lead: string; tabStores: string; tabProducts: string; legacyLabel: string; visit: string; showAll: string; showLess: string; filterAll: string; filters: Record<string, string> }
    gallery: SectionHeading & {
      lead: string
      filterAll: string
      filterLive: string
      filterDev: string
      viewLabel: string
      viewCarousel: string
      viewDevices: string
      viewPhones: string
      open: string
      close: string
      home: string
      pdp: string
      desktop: string
      mobile: string
    }
    now: { label: string; live: string; dev: string; band: string; local: string }
    statBand: { label: string; asOf: string; sourceLabel: string; note: string }
    careerSubway: SectionHeading & { lead: string; toggleShow: string; toggleHide: string; transferLabel: string; rowAria: string }
    process: SectionHeading & { problemLabel: string; problem: string; fixLabel: string; fix: string; stepOf: string; deliverableLabel: string; steps: { title: string; body: string; deliverable: string }[] }
    testimonials: SectionHeading
    /** "How we could work together" — three one-line cards, one per engagement model (free review,
     *  project build, ongoing collaboration), between Review and FAQ. Every `models[].body` restates
     *  a fact already stated elsewhere on this page (round 44 prototype r44/p44/extras-models,
     *  round 46 lane "extras" — the struck-through "a generic agency would..." contrast Max saw in
     *  the prototype was cut for reading as fighting agencies while he runs one; only the one-line
     *  card mechanic, positively worded, shipped). */
    engagement: SectionHeading & { lead: string; models: { title: string; body: string }[] }
    faq: SectionHeading & { items: { q: string; a: string }[] }
    manifesto: { label: string; lines: string[] }
    years: SectionHeading & { lead: string; roles: string; shipped: string; work: string; products: string; side: string; more: string; count: string; perYear: string; eras: Record<string, string> }
    /** Apple's Years replacement: a horizontal scroll-snap rail of year cards (Chapters.tsx). */
    chapters: SectionHeading & {
      lead: string
      chapterOf: string // '{n} / {total}'
      prevAria: string
      nextAria: string
      highlightsLabel: string
    }
    /** Apple's featured-build section for one storefront (FeaturedBuild.tsx + featuredLayouts/*) — the
     *  "split story" layout over real registry/commerce/telemetry data. */
    featuredBuild: SectionHeading & {
      lead: string
      visit: string
      cta: string // opens the gallery case-study sheet for the featured store
      beats: { label: string; body: string; metric: string }[] // problem -> plan -> build -> result; {placeholders} filled from the registry/commerce
      /** FeaturedImpact.tsx — the strip the story renders below it. Hero-numeral labels and the
       *  disclaimer are NOT duplicated here: they reuse caseStudy.impact.{chipConversionLabel,
       *  chipRevenueLabel, chipLoadTimeLabel, conversionLabel, revenueLabel, loadTimeLabel, before,
       *  after, disclaimer} verbatim, and the score-ring labels reuse caseStudy.{perf, a11y, seo}, so
       *  the sheet and this strip always read the same words for the same numbers. No build/commit/week
       *  tiles live here any more (2026-09-11 restructure) — only the real Lighthouse group. */
      impact: {
        heading: string // small-caps label above the real-numbers group, e.g. 'Real numbers'
        lcpLabel: string
        tbtLabel: string
        clsLabel: string
        lighthouseCaption: string // what/where/when for the rings + LCP + TBT + CLS tiles
      }
    }
    /** Apple's new section listing what the Playwright QA harness actually checks (ReviewChecklist.tsx). */
    reviewChecklist: SectionHeading & {
      lead: string
      countLabel: string // '{n}+ automated checks'
      cta: string
      groups: { label: string; items: string[] }[]
      /** Sits under the visual run: states plainly that this replays the check list, never a live result. */
      runCaption: string
      /** A group tile's status while its items are still being marked off. */
      statusChecking: string
      /** A group tile's status once every one of its items is marked off. */
      statusDone: string
      /** Alt text for the home-page capture inside the device frame, names the store. */
      screenshotAlt: string
      /** aria-label for each hotspot marker over the capture; '{group}' is replaced with that group's label. */
      hotspotAria: string
      /** aria-valuetext for a group's progress meter; '{done}' and '{total}' are replaced with counts. */
      progressAria: string
    }
    /** Luxury's Years intro: the unit chart re-narrated as one composed sentence per year. */
    fiveLines: {
      kinds: Record<WorkKind, { one: string; singular: string; plural: string }>
      numberWords: string[] // spelled 0..20, index-addressed; digits beyond that
      joiner: string // between a spelled number and its noun phrase ('' for Japanese counters)
      listJoiner: string // between phrases, all but the last
      listFinal: string // between the last two phrases
      empty: string // a year with nothing in the four kinds (defensive — every real year has at least one)
    }
    /** Brutalist's Years intro: a 60-cell (2022-01..2026-12) month calendar instead of the unit chart. */
    yearStrip: {
      legend: string
      monthAria: string // '{month} — {state}'
      activeState: string
      inactiveState: string
      currentState: string
      countUnit: string // 'active months' / 'meses activos' / '稼働月'
    }
    projects: SectionHeading & { view: string }
    skills: SectionHeading & {
      groups: Record<SkillGroupId, string>
      /** aria-label for the horizontal group-filter tabs above the tile grid. */
      groupSelectorLabel: string
      /** A one-line honest note per group — shown in the panel under whichever tool from that group is selected. */
      groupNote: Record<SkillGroupId, string>
      /** The compact depth strip above the grid: three real fleet totals, always the same three. */
      depthLabel: {
        liquid: string
        ts: string
        stores: string
      }
      usage: {
        /** Idle panel caption, before any tile is hovered/pinned. */
        caption: string
        storesUnit: string
        storesUnitOne: string
        productsUnit: string
        productsUnitOne: string
        roleUnit: string
        roleUnitOne: string
        noData: string
      }
      /** The selected-tool panel: name/group/usage come from usage.* and groupNote above. */
      panel: {
        eyebrow: string
        usageLabel: string
        pinned: string
        hint: string
      }
      /** Strings shared by the orbit and ledger layouts. */
      layoutExtra: {
        allLabel: string
        /** Caption for the "in-house products" fleet stat in `ToolDrawer`'s fleet-wide strip (moved
         *  there 2026-09-10 from the orbit's old center card; the other three stats in that strip
         *  reuse `depthLabel.*`, which is already fixed at three keys). */
        productsLabel: string
        unpin: string
        toolsSuffix: string
      }
      /** Orbit layout's filter bar + hover/press preview card + the same two pieces reused (filter
       *  chips, tap-to-expand preview) by the sub-1024px ledger fallback. `allLabel` for the surface
       *  "All" chip reuses `layoutExtra.allLabel` rather than duplicating it.
       *  2026-09-11 — "fewer filters, clearer": three controls (group chips, a 'Show:' surface
       *  control, free text) plus the result line and a Clear link. The min-stores threshold, the
       *  sort order and the active-filter chips row are gone. */
      orbit: {
        surfaceLabel: string // aria-label for the surface radiogroup ('Storefronts' / 'Apps & products' / 'Client roles')
        showLabel: string // visible 'Show:' label in front of the surface radiogroup
        surfaceStorefronts: string
        surfaceProducts: string
        surfaceRoles: string
        searchLabel: string // aria-label for the text filter input
        searchPlaceholder: string
        clear: string // resets every active filter
        noMatches: string // every group collapsed by the current filter combination
        /** 'Used at {company} · {role} · {years}' — one line per client-role deliverable in the preview. */
        usedAt: string
        openStore: string // 'Open case study — {name}' — accessible name for a store thumbnail/link
        openProduct: string // 'View product — {name}' — accessible name for a product thumbnail/link
        openRole: string // 'View role — {company}' — accessible name for a role-work line
        expandRow: string // ledger fallback: tap-to-expand a tool row
        collapseRow: string // ledger fallback: collapse an expanded tool row
        summary: string // '{n} of {m} tools · {k} stores' — live result summary line
        /** Replaces the store-count phrase in a group chip's full-sentence aria-label when that
         *  group's live facet has 0 real stores (entirely in-house products / client-role work). */
        chipAriaNoStores: string
        /** Muted 11px helper line under the result summary, explaining the three controls above it. */
        helpLine: string
        /** `ToolDrawer` (2026-09-10) — the right-side/bottom-sheet drawer a dot or ledger row opens,
         *  replacing the orbit's floating quick-look card and its big center card. */
        drawer: {
          /** Eyebrow above the fleet-wide stat strip (2026-09-10 — moved here from the orbit's old
           *  center card per the owner's call: "that data looks horrible there"). The four stats
           *  themselves reuse `depthLabel.*` (stores/liquid/ts) and `layoutExtra.productsLabel`. */
          fleetLabel: string
          capturesLabel: string // eyebrow above the captures grid ("where it ships")
          rolesLabel: string // eyebrow above the client-role rows
          showInIndex: string // footer link back to the storefront index
          close: string // close button label/aria-label
          noCaptures: string // shown when a tool has no linkable store/product at all (rare)
        }
      }
      /** `ConstellationMobile` (round 46) — the default sub-1024px view, a tap-to-zoom cluster map.
       *  Shares `groupSelectorLabel` (the group chip strip's aria-label, above) and `orbit.clear`. */
      mobile: {
        openCluster: string // aria-label for a cluster card — 'Open {group}'
        back: string // back button, from the zoomed cluster panel to the map
      }
    }
    contact: SectionHeading & {
      lead: string
      promise: string
      status: string
      note: string
      cta: string
      ctaSecondary: string
      nextLabel: string
      next: string[]
      urlLabel: string
      urlPlaceholder: string
      email: string
      phone: string
      location: string
      elsewhere: string
    }
    explore: { eyebrow: string; title: string; lead: string; viewing: string }
    caseStudy: {
      stack: string; visit: string; prev: string; next: string; sections: string; open: string; perf: string; a11y: string; seo: string; copyLink: string; copied: string
      /** Commerce line templates, still used by the Gallery wall's captions and the Shopify Work
       *  index rows — see CommerceLabels above. The case-study sheet itself no longer reads this. */
      commerce: CommerceLabels
      /**
       * The sheet's "Impact" block — as of 2026-09-10 (owner restructure) the sheet's entire numbers
       * story (header → captures → tagline/description → Impact → stack → Visit store). Fixed layout
       * order: three hero numerals (Conversion, Revenue, Load time, big figures first) → the Lighthouse
       * score rings (Performance/Accessibility/SEO, real, the before→after delta a small badge beside
       * Performance) → the speed pair (real desktop-LCP load-time bars beside the performance dual
       * ring) → the four indexed lines as a fixed 2×2 grid, each tile's label on top and its numeral
       * at the bottom under its own chart → the block-level small print. No dates and no delivery chart
       * anywhere in this block per the owner's 2026-09-10 call. Conversion, order value, revenue,
       * revenue per visitor, the dual ring's thin inner "before" arc and the load-time chart's
       * illustrative "before" seconds are illustrative (deterministic per store, see
       * src/data/illustrative.ts) and anchored to the real ranges on the CV; the score rings, the dual
       * ring's real "after" arc and the load-time chart's real "after" seconds (the desktop lab LCP,
       * preferred) are REAL (src/data/lighthouse.json). No per-chip or per-chart illustrative tag
       * anywhere in this block — `disclaimer` (the block-level small print) is the sheet's only
       * disclosure. `disclaimer` and `infoSentence` are fixed, owner-approved copy — do not paraphrase
       * them.
       */
      impact: {
        title: string // "Impact" — the block heading
        conversionLabel: string // "Conversion, indexed" — indexed-line label
        rpvLabel: string // "Revenue per visitor, indexed" — indexed-line label
        orderValueLabel: string // "Order value, indexed" — indexed-line label
        revenueLabel: string // "Revenue, indexed" — indexed-line label, the compounded headline figure
        ringsCaption: string // 'Lighthouse · desktop · measured.' — under the score rings row, no date
        ringsDelta: string // '+{n} pts' — small badge next to Performance's numeral, only when perfDual exists
        before: string // dual-ring / load-time-pair label — illustrative
        after: string // dual-ring / load-time-pair label — REAL
        perfDualLabel: string // "Performance" — the dual ring's own label
        disclaimer: string // the required small-print line, verbatim, EN/ES/JA
        infoLabel: string // aria-label for the info-affordance button (aria-expanded)
        infoSentence: string // one sentence: ranges come from measured client work 2023–2026
        // Hero numerals: three big figures above the chart grid, computed from the same data as the
        // charts below them, no per-numeral tag of their own (see ProjectModal's hero-numeral block).
        chipConversionLabel: string // "Conversion" — hero numeral label
        chipRevenueLabel: string // "Revenue" — hero numeral label
        chipLoadTimeLabel: string // "Load time" — hero numeral label
        formMobile: string // 'mobile' — lowercase form word for {form} placeholders
        formDesktop: string // 'desktop'
        loadTimeLabel: string // "Load time" — paired-bar chart heading
        loadTimeSource: string // '{form} LCP, measured.' — no date; {form} is formMobile/formDesktop
        indexChip: string // '+{pct}% conversion' — the Shopify Work index row's per-store chip
      }
    }
  }
  badges: { live: string; dev: string; current: string; completed: string; roles: Record<StoreRole, string> }
  experience: Record<
    ExperienceId,
    { title: string; summary: string; highlights: string[]; metricLabels: Record<string, string> }
  >
  roleWork: Record<RoleWorkId, string>
  stores: Record<string, { industry: string; tagline: string; description: string; factLabels?: Record<string, string> }>
  products: Record<string, { tagline: string; description: string }>
  projects: Record<string, { tagline: string; description: string }>
  footer: { tagline: string; services: string[]; servicesTitle: string; quickLinks: string; rights: string; stamp: string; backToTop: string }
  location: string
}
