import { useEffect } from 'react'

type FaviconType = 'luxury' | 'brutalist' | 'menu' | 'default'

const favicons: Record<FaviconType, string> = {
  luxury: '/favicon-luxury.svg',
  brutalist: '/favicon-brutalist.svg',
  menu: '/favicon-menu.svg',
  default: '/favicon.svg',
}

const titles: Record<FaviconType, string> = {
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
