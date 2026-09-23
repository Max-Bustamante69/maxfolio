// Client side of the first-party event ledger (`api/event.ts`, taxonomy in docs/analytics.md).
// `track()` is the one call every themed page and shared component uses; it never throws and never
// blocks the interaction it's attached to. `useSectionViewTracking` wires `section_view` once per
// section per page load off a single shared IntersectionObserver, so N sections cost one observer,
// not N.
import { useEffect } from 'react'

const ALLOWED_HOSTS = [/^maxfolio\.dev$/, /^www\.maxfolio\.dev$/, /\.vercel\.app$/]

function allowed(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  if (navigator.doNotTrack === '1') return false
  if (navigator.webdriver) return false
  const host = window.location.hostname
  // localhost/dev previews (bunx vite preview, `vite dev`) are deliberately excluded too — this
  // guard is "real host" allow-listed, not "known-bad" denied, so a probe run against a `localhost`
  // preview never writes into the production ledger by accident.
  return ALLOWED_HOSTS.some((re) => re.test(host))
}

/** Fires a whitelisted event at `/api/event`. Silent no-op on any guard failure or transport error —
 *  this is best-effort telemetry, never something a visitor's flow can fail on. */
export function track(name: string, props: Record<string, string> = {}): void {
  if (!allowed()) return
  try {
    const body = JSON.stringify({ name, props })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))
    } else {
      void fetch('/api/event', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } })
    }
  } catch {
    /* best-effort */
  }
}

/** Mounts one IntersectionObserver (threshold 0.4, matching the taxonomy doc) over every element
 *  carrying `data-track-section="<id>"` currently in the DOM, and fires `section_view` the first time
 *  each crosses that threshold — once per id per page load, tracked in a `Set` so a section that
 *  re-enters view on scroll-back never double-counts. Call once per page (Apple.tsx mounts it at the
 *  top level); sections behind `Suspense`/`lazy()` that mount later are picked up by a `MutationObserver`
 *  on `document.body`, the same "attach late-mounting targets" trick `useActiveSection` already uses. */
export function useSectionViewTracking(): void {
  useEffect(() => {
    if (!allowed()) return
    const seen = new Set<string>()
    const attached = new WeakSet<Element>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = (entry.target as HTMLElement).dataset.trackSection
          if (!id || seen.has(id)) continue
          seen.add(id)
          track('section_view', { section: id })
          io.unobserve(entry.target)
        }
      },
      { threshold: 0.4 },
    )
    const attach = () => {
      document.querySelectorAll<HTMLElement>('[data-track-section]').forEach((el) => {
        if (attached.has(el)) return
        attached.add(el)
        io.observe(el)
      })
    }
    attach()
    const mo = new MutationObserver(attach)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
