import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useRef, type ComponentType } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { LazyMotion } from 'framer-motion'
import { PageTransitionProvider, usePageTransition } from './components/transitions'
import { LanguageProvider } from './context/LanguageContext'
import { designById, MENU } from './data/designs'
import Apple from './pages/Apple'
import { attributeUrl, currentVariant, recordAb, splitActive } from './ab'
import type { VariantId } from '../ab.config'

// The default experience ships in the main bundle; the others load on demand.
const Home = lazy(() => import('./pages/Home'))
const Design1 = lazy(() => import('./pages/Design1'))
const Design4 = lazy(() => import('./pages/Design4'))
const Neo = lazy(() => import('./pages/Neo'))
const Persona = lazy(() => import('./pages/Persona'))
const Terminal = lazy(() => import('./pages/Terminal'))
const Skyline = lazy(() => import('./pages/Skyline'))

// A/B: the landing at `/` is the visitor's variant. Every theme that can be a variant is registered here;
// ab.config.ts decides which ones actually take traffic (with only `apple` listed there is no split).
const VARIANT_PAGES: Partial<Record<VariantId, ComponentType>> = { apple: Apple, neo: Neo, persona: Persona }

/** The landing at `/`: the pinned variant, or the one forced by `?v=` (theme links), resolved on every navigation. */
function Landing() {
  const { search } = useLocation()
  const variant = currentVariant()
  const Page = VARIANT_PAGES[variant] ?? Apple
  return <Page key={`${variant}${search}`} />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  const { isTransitioning } = usePageTransition()
  const prevPath = useRef(pathname)

  useEffect(() => {
    // Only scroll if path changed and NOT during a transition (transition handles its own scroll)
    if (pathname !== prevPath.current && !isTransitioning) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    prevPath.current = pathname
  }, [pathname, isTransitioning])

  return null
}

/** One exposure beacon per page load, only while a split is running. */
function AbView() {
  useEffect(() => {
    if (splitActive() && window.location.pathname === '/') recordAb('view')
  }, [])
  return null
}

function App() {
  return (
    <LanguageProvider>
      {/* `m.*` components everywhere; the feature set arrives as an async chunk instead of the eager bundle. */}
      <LazyMotion features={() => import('./motion-features').then((mod) => mod.default)}>
      <PageTransitionProvider>
        <ScrollToTop />
        <AbView />
        <Suspense fallback={null}>
          <Routes>
            <Route path={designById('apple').route} element={<Landing />} />
            <Route path={designById('luxury').route} element={<Design4 />} />
            <Route path={designById('brutalist').route} element={<Design1 />} />
            <Route path={designById('neo').route} element={<Neo />} />
            <Route path={designById('persona').route} element={<Persona />} />
            <Route path={designById('terminal').route} element={<Terminal />} />
            <Route path={designById('skyline').route} element={<Skyline />} />
            <Route path={MENU.route} element={<Home />} />
            {/* Legacy routes */}
            <Route path="/1" element={<Design4 />} />
            <Route path="/2" element={<Design1 />} />
          </Routes>
        </Suspense>
        {/* The insights script only exists on Vercel; skipping it elsewhere keeps local audits free of a 404. */}
        {typeof window !== 'undefined' && /(^|\.)maxfolio\.dev$|\.vercel\.app$/.test(window.location.hostname) && <Analytics beforeSend={(e) => ({ ...e, url: attributeUrl(e.url) })} />}
      </PageTransitionProvider>
      </LazyMotion>
    </LanguageProvider>
  )
}

export default App
