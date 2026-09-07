import { useEffect } from 'react'
import { designs, MENU, type DesignId } from '../data/designs'

type FaviconType = DesignId | 'menu' | 'default'

const favicons: Record<FaviconType, string> = {
  ...(Object.fromEntries(designs.map((d) => [d.id, d.favicon])) as Record<DesignId, string>),
  menu: MENU.favicon,
  default: '/favicon.svg',
}

const titles: Record<FaviconType, string> = {
  apple: 'MB | Portfolio',
  luxury: 'MB | Luxury Portfolio',
  brutalist: 'MB | Brutalist Portfolio',
  menu: 'MB | Design Menu',
  default: 'MB | Portfolio',
}

export function useDynamicFavicon(type: FaviconType) {
  useEffect(() => {
    // Update favicon
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

    // Update page title
    document.title = titles[type]

    // Cleanup - restore default on unmount
    return () => {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) {
        link.href = favicons.default
      }
      document.title = titles.default
    }
  }, [type])
}
