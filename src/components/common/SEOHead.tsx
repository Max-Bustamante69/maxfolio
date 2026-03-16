import { useEffect } from 'react'

interface SEOHeadProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  noindex?: boolean
}

export function SEOHead({
  title = 'Maximiliano Bustamante | Frontend Developer',
  description = 'Frontend Developer specialized in React, Next.js, TypeScript, and e-commerce development.',
  canonical = 'https://maxfolio.co',
  ogImage = 'https://maxfolio.co/og-image.jpg',
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
      if (element) {
        element.content = content
      } else {
        element = document.createElement('meta')
        element.setAttribute(attr, name)
        element.content = content
        document.head.appendChild(element)
      }
    }

    updateMeta('description', description)
    updateMeta('og:title', title, true)
    updateMeta('og:description', description, true)
    updateMeta('og:image', ogImage, true)
    updateMeta('og:url', canonical, true)
    updateMeta('twitter:title', title)
    updateMeta('twitter:description', description)
    updateMeta('twitter:image', ogImage)

    if (noindex) {
      updateMeta('robots', 'noindex, nofollow')
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (canonicalLink) {
      canonicalLink.href = canonical
    }
  }, [title, description, canonical, ogImage, noindex])

  return null
}
