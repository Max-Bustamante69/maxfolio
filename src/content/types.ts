import type { ExperienceId, StatId, SkillGroupId, StoreRole } from '../data/registry'

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
    ctaContact: string
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
    now: { label: string; live: string; dev: string; band: string }
    process: SectionHeading & { lead: string; steps: { title: string; body: string }[] }
    testimonials: SectionHeading
    years: SectionHeading & { lead: string; roles: string; shipped: string; products: string; side: string; more: string }
    projects: SectionHeading & { view: string }
    skills: SectionHeading & { groups: Record<SkillGroupId, string> }
    contact: SectionHeading & {
      lead: string
      status: string
      note: string
      cta: string
      email: string
      phone: string
      location: string
    }
    explore: { eyebrow: string; title: string; lead: string; viewing: string }
    caseStudy: { facts: string; results: string; stack: string; visit: string; prev: string; next: string; timeline: string; commits: string; sections: string; open: string; metrics: string; perf: string; a11y: string; bp: string; seo: string; lcp: string; measured: string; story: string; sampleBadge: string; sampleNote: string; measuredFrom: string; before: string; after: string; metric: Record<'cr' | 'aov' | 'revenue' | 'lcp' | 'checkout', string> }
  }
  badges: { live: string; dev: string; current: string; completed: string; roles: Record<StoreRole, string> }
  experience: Record<
    ExperienceId,
    { title: string; summary: string; highlights: string[]; metricLabels: Record<string, string> }
  >
  stores: Record<string, { industry: string; tagline: string; description: string; factLabels?: Record<string, string> }>
  products: Record<string, { tagline: string; description: string }>
  projects: Record<string, { tagline: string; description: string }>
  footer: { tagline: string; services: string[]; servicesTitle: string; quickLinks: string; rights: string }
  location: string
}
