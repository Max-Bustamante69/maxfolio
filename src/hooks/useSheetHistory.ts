import { useEffect, useRef } from 'react'

interface SheetHistoryOptions {
  /** Query parameter that carries the open sheet, e.g. `store` → `?store=nos-cafe`. */
  param: string
  /** When given, a URL that already carries the parameter opens that sheet on mount (deep link). */
  open?: (slug: string) => void
}

/**
 * Gives an overlay sheet a place in browser history: opening pushes `?param=slug`, the browser's
 * Back button (or the swipe-back gesture on phones) closes it instead of leaving the site, and a
 * pasted link with the parameter opens the same sheet. Closing from inside the sheet pops the entry
 * it pushed; a deep-linked open only strips the parameter, so Back never jumps off the page.
 */
export function useSheetHistory(slug: string | null, close: () => void, { param, open }: SheetHistoryOptions) {
  const current = useRef<string | null>(null)
  const pushed = useRef(false)
  const closeRef = useRef(close)
  closeRef.current = close

  // Deep link: open the sheet named in the URL, marking it as not pushed by us.
  useEffect(() => {
    if (!open) return
    const wanted = new URLSearchParams(window.location.search).get(param)
    if (!wanted) return
    current.current = wanted
    pushed.current = false
    window.history.replaceState({ sheet: param, slug: wanted }, '', window.location.href)
    open(wanted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const url = (s: string | null) => {
      const u = new URL(window.location.href)
      if (s) u.searchParams.set(param, s)
      else u.searchParams.delete(param)
      return u.pathname + u.search + u.hash
    }
    if (slug && slug !== current.current) {
      if (current.current === null) {
        window.history.pushState({ sheet: param, slug }, '', url(slug))
        pushed.current = true
      } else {
        window.history.replaceState({ sheet: param, slug }, '', url(slug))
      }
      current.current = slug
    } else if (!slug && current.current !== null) {
      current.current = null
      if (pushed.current && window.history.state?.sheet === param) {
        pushed.current = false
        window.history.back()
      } else {
        pushed.current = false
        window.history.replaceState(null, '', url(null))
      }
    }
  }, [slug, param])

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.sheet === param) return
      if (current.current !== null) {
        current.current = null
        pushed.current = false
        closeRef.current()
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [param])
}
