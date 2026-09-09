import type { ExperienceId, RoleWorkId, StatId, SkillGroupId, StoreRole } from '../data/registry'

interface SectionHeading {
  eyebrow: string
  title: string
  titleAccent: string
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
    statBand: { label: string; asOf: string }
    buildHeatmap: { label: string; headline: string; legendLow: string; legendHigh: string; cellAria: string; half1: string; half2: string }
    stackByYear: SectionHeading & { lead: string; rankAria: string; countUnit: string }
    fleetMap: SectionHeading & { lead: string; filterAll: string }
    careerSubway: SectionHeading & { lead: string; toggleShow: string; toggleHide: string; transferLabel: string; rowAria: string }
    process: SectionHeading & { problemLabel: string; problem: string; fixLabel: string; fix: string; stepOf: string; deliverableLabel: string; steps: { title: string; body: string; deliverable: string }[] }
    testimonials: SectionHeading
    faq: SectionHeading & { items: { q: string; a: string }[] }
    manifesto: { label: string; lines: string[] }
    years: SectionHeading & { lead: string; roles: string; shipped: string; work: string; products: string; side: string; more: string; count: string; perYear: string; eras: Record<string, string> }
    projects: SectionHeading & { view: string }
    skills: SectionHeading & {
      groups: Record<SkillGroupId, string>
      narrative: Record<SkillGroupId, string>
      usageLabel: string
      usageUnit: string
      usageNote: string
      usageItems: Record<string, string>
      sunburst: {
        caption: string
        storesUnit: string
        storesUnitOne: string
        productsUnit: string
        productsUnitOne: string
        roleUnit: string
        roleUnitOne: string
        noData: string
        legendLabel: string
        triLiquid: string
        triTs: string
        triStoresDefault: string
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
    caseStudy: { facts: string; results: string; stack: string; visit: string; prev: string; next: string; timeline: string; commits: string; sections: string; open: string; metrics: string; perf: string; a11y: string; bp: string; seo: string; lcp: string; measured: string; trail: string; trailNote: string; perWeek: string; peak: string; codebase: string; liquidLines: string; islandLines: string; sectionsCount: string; weeks: string; copyLink: string; copied: string }
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
