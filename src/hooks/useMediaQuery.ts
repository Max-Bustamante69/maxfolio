import { useEffect, useState } from 'react'

/** Live `matchMedia` as state. Sections use it to render a different layout per viewport instead of hiding one with CSS. */
export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : initial))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}
