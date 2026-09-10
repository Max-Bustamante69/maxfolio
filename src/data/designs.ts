import type { ComponentType } from 'react'
import { LuxuryPreview, BrutalistPreview, ApplePreview, NeoPreview, PersonaPreview, TerminalPreview, SkylinePreview } from '../components/previews'

export type DesignId = 'apple' | 'luxury' | 'brutalist' | 'neo' | 'persona' | 'terminal' | 'skyline'

export interface DesignEntry {
  id: DesignId
  route: string
  /** Where links go: the route, plus `?v=` for the control so a visitor pinned to another variant can still reach it. */
  href: string
  nameKey: string // i18n key in public/locales/*.json
  subtitleKey: string
  accent: string
  transitionColor: string
  transitionAccent: string
  favicon: string
  isDefault: boolean
  Preview: ComponentType<{ isHovered?: boolean; size?: 'sm' | 'md' | 'lg' }>
}

// The single source of truth for every switchable experience. Routes, the menu page,
// explore sections, logo selectors, mobile menus and favicons all read from here.
export const designs: DesignEntry[] = [
  {
    id: 'apple',
    route: '/',
    href: '/?v=apple',
    nameKey: 'menuPage.designNames.apple',
    subtitleKey: 'menuPage.designSubtitles.apple',
    accent: '#0071e3',
    transitionColor: '#fbfbfd',
    transitionAccent: '#0071e3',
    favicon: '/favicon-apple.svg',
    isDefault: true,
    Preview: ApplePreview,
  },
  {
    id: 'luxury',
    route: '/luxury',
    href: '/luxury',
    nameKey: 'menuPage.designNames.luxuryMinimal',
    subtitleKey: 'menuPage.designSubtitles.luxuryMinimal',
    accent: '#C9A962',
    transitionColor: '#FAF8F5',
    transitionAccent: '#C9A962',
    favicon: '/favicon-luxury.svg',
    isDefault: false,
    Preview: LuxuryPreview,
  },
  {
    id: 'brutalist',
    route: '/brutalist',
    href: '/brutalist',
    nameKey: 'menuPage.designNames.brutalistEditorial',
    subtitleKey: 'menuPage.designSubtitles.brutalistEditorial',
    accent: '#dc2626',
    transitionColor: '#1c1917',
    transitionAccent: '#dc2626',
    favicon: '/favicon-brutalist.svg',
    isDefault: false,
    Preview: BrutalistPreview,
  },
  {
    id: 'neo',
    route: '/neo',
    href: '/neo',
    nameKey: 'menuPage.designNames.neo',
    subtitleKey: 'menuPage.designSubtitles.neo',
    // AA-safe shade of the theme's accent (see src/styles/neo.css) — text-safe at 6:1 on white / 4.9:1 on the surface.
    accent: '#4453d9',
    transitionColor: '#e6e9ef',
    transitionAccent: '#4453d9',
    favicon: '/favicon-neo.svg',
    isDefault: false,
    Preview: NeoPreview,
  },
  {
    id: 'persona',
    route: '/arcade',
    href: '/arcade',
    nameKey: 'menuPage.designNames.persona',
    subtitleKey: 'menuPage.designSubtitles.persona',
    accent: '#1c6fb0',
    transitionColor: '#0a0f1a',
    transitionAccent: '#3fa9dc',
    favicon: '/favicon-persona.svg',
    isDefault: false,
    Preview: PersonaPreview,
  },
  {
    id: 'terminal',
    route: '/terminal',
    href: '/terminal',
    nameKey: 'menuPage.designNames.terminal',
    subtitleKey: 'menuPage.designSubtitles.terminal',
    accent: '#39ff88',
    transitionColor: '#0a0d0a',
    transitionAccent: '#39ff88',
    favicon: '/favicon-terminal.svg',
    isDefault: false,
    Preview: TerminalPreview,
  },
  {
    id: 'skyline',
    route: '/skyline',
    href: '/skyline',
    nameKey: 'menuPage.designNames.skyline',
    subtitleKey: 'menuPage.designSubtitles.skyline',
    accent: '#4fd1ff',
    transitionColor: '#0d1420',
    transitionAccent: '#4fd1ff',
    favicon: '/favicon-skyline.svg',
    isDefault: false,
    Preview: SkylinePreview,
  },
]

export const MENU = { route: '/menu', favicon: '/favicon-menu.svg', labelKey: 'logoSelector.designMenu', subtitleKey: 'logoSelector.allDesigns' }

export const defaultDesign = designs.find((d) => d.isDefault)!
export const otherDesigns = (current: DesignId) => designs.filter((d) => d.id !== current)
export const designById = (id: DesignId) => designs.find((d) => d.id === id)!
