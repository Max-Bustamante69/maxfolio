// A tiny cross-component event bridge: lets a component in one section (the orbit's preview card)
// open real state owned by a *different* section (ShopifyWork's case-study sheet, Products' selected
// product, Experience's active role) without lifting that state up or forking its mechanism. Each
// section keeps owning its own state; this module only carries the "please open/select X" request
// and a couple of DOM-only helpers (scroll, reduced motion) that every listener needs the same way.
//
// Why events and not context/props: Skills, ShopifyWork, Products and Experience are siblings several
// levels apart in the page tree (see src/pages/*.tsx) and rendered on all six theme pages — threading
// a prop or a context provider through every one of them to wire one hover card would touch far more
// files than the two-line listener each target section adds. `window` is already the shared surface
// these components reach for (see useSheetHistory's popstate handling right next to this).

export interface OpenStoreRequest {
  slug: string
}
export interface OpenProductRequest {
  id: string
}
export interface SelectRoleRequest {
  id: string
}

const EVENTS = {
  store: 'mf:orbit-open-store',
  product: 'mf:orbit-open-product',
  role: 'mf:orbit-select-role',
} as const

function dispatch<T>(name: string, detail: T) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<T>(name, { detail }))
}

function subscribe<T>(name: string, cb: (detail: T) => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => cb((e as CustomEvent<T>).detail)
  window.addEventListener(name, handler)
  return () => window.removeEventListener(name, handler)
}

/** Ask ShopifyWork to open the real case-study sheet for this store (pushes `?store=<slug>` through
 *  the same `useSheetHistory` the index itself uses — see ShopifyWork.tsx). */
export const requestStore = (slug: string) => dispatch<OpenStoreRequest>(EVENTS.store, { slug })
export const onRequestStore = (cb: (d: OpenStoreRequest) => void) => subscribe<OpenStoreRequest>(EVENTS.store, cb)

/** Ask ShopifyWork to switch to its "products" tab and Products to select this in-house product. */
export const requestProduct = (id: string) => dispatch<OpenProductRequest>(EVENTS.product, { id })
export const onRequestProduct = (cb: (d: OpenProductRequest) => void) => subscribe<OpenProductRequest>(EVENTS.product, cb)

/** Ask Experience to select this role in its rail. */
export const requestRole = (id: string) => dispatch<SelectRoleRequest>(EVENTS.role, { id })
export const onRequestRole = (cb: (d: SelectRoleRequest) => void) => subscribe<SelectRoleRequest>(EVENTS.role, cb)

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** Smooth-scrolls to a section by id, honoring the element's own `scroll-margin-top` (every section
 *  carries `scroll-mt-*` for the fixed header) and reduced motion. Native `window.scrollTo` per the
 *  brief — every section on every theme page scrolls the real `window`, never an inner scroller. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const rect = el.getBoundingClientRect()
  const marginTop = parseFloat(getComputedStyle(el).scrollMarginTop || '0')
  const top = rect.top + window.scrollY - marginTop
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
