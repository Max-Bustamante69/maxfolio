import { useEffect } from 'react'
import { designs, MENU, type DesignId } from '../data/designs'

type FaviconType = DesignId | 'menu' | 'default'

const favicons: Record<FaviconType, string> = {
  ...(Object.fromEntries(designs.map((d) => [d.id, d.favicon])) as Record<DesignId, string>),
  menu: MENU.favicon,
  default: '/favicon.svg',
}

// document.title is owned by SEOHead only (locale-, description- and canonical-aware). This hook
// used to also set a short static title per theme ('MB | Portfolio', etc.) in the same effect
// tick — on routes where content loads synchronously (the default English locale, since only `en`
// is bundled eagerly per src/content/index.ts) that write landed AFTER SEOHead's and silently
// replaced the real <title> with the short label for every crawler and tab. Confirmed via a
// Playwright title trace (see docs/seo.md "title tag" for the reproduction) before removing it.
export function useDynamicFavicon(type: FaviconType) {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (link) {
      link.href = favicons[type]
    } else {
      const newLink = document.createElement('link')
      newLink.rel = 'icon'
      newLink.type = 'image/svg+xml'
      newLink.href = favicons[type]
      document.head.appendChild(newLink)
    }

    return () => {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) {
        link.href = favicons.default
      }
    }
  }, [type])
}
