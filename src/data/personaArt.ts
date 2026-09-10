// Arcade theme backdrop art — own generated comic-book illustrations (see AGENTS "IMAGE GENERATION"),
// two variants per screen: "ink" (dark mode, near-black + crimson #c8102e) and "ice" (light mode,
// off-white + navy #1c6fb0), matching the theme's two-key-color law (persona.css header comment).
type ScreenId = 'home' | 'work' | 'years' | 'skills' | 'contact'

export const PERSONA_ART: Record<'menu' | ScreenId, { ink: string; ice: string }> = {
  menu: { ink: '/art/arcade/menu-bg.webp', ice: '/art/arcade/menu-bg-ice.webp' },
  home: { ink: '/art/arcade/home-bg.webp', ice: '/art/arcade/home-bg-ice.webp' },
  work: { ink: '/art/arcade/work-bg.webp', ice: '/art/arcade/work-bg-ice.webp' },
  years: { ink: '/art/arcade/years-bg.webp', ice: '/art/arcade/years-bg-ice.webp' },
  skills: { ink: '/art/arcade/skills-bg.webp', ice: '/art/arcade/skills-bg-ice.webp' },
  contact: { ink: '/art/arcade/contact-bg.webp', ice: '/art/arcade/contact-bg-ice.webp' },
}

export function personaArt(screen: 'menu' | ScreenId, isDark: boolean): string {
  const pair = PERSONA_ART[screen]
  return isDark ? pair.ink : pair.ice
}
