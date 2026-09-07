import type { ComponentType } from 'react'
import { LuxuryPreview, BrutalistPreview, ApplePreview } from '../components/previews'

export type DesignId = 'apple' | 'luxury' | 'brutalist'

export interface DesignEntry {
  id: DesignId
  route: string
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
    nameKey: 'menuPage.designNames.brutalistEditorial',
    subtitleKey: 'menuPage.designSubtitles.brutalistEditorial',
    accent: '#dc2626',
    transitionColor: '#1c1917',
    transitionAccent: '#dc2626',
    favicon: '/favicon-brutalist.svg',
    isDefault: false,
    Preview: BrutalistPreview,
  },
]

export const MENU = { route: '/menu', favicon: '/favicon-menu.svg', labelKey: 'logoSelector.designMenu', subtitleKey: 'logoSelector.allDesigns' }

export const defaultDesign = designs.find((d) => d.isDefault)!
export const otherDesigns = (current: DesignId) => designs.filter((d) => d.id !== current)
export const designById = (id: DesignId) => designs.find((d) => d.id === id)!
