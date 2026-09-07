import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { PageTransitionProvider, usePageTransition } from './components'
import { LanguageProvider } from './context/LanguageContext'
import { designById, MENU } from './data/designs'
import Apple from './pages/Apple'

// The default experience ships in the main bundle; the others load on demand.
const Home = lazy(() => import('./pages/Home'))
const Design1 = lazy(() => import('./pages/Design1'))
const Design4 = lazy(() => import('./pages/Design4'))

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

function App() {
  return (
    <LanguageProvider>
      <PageTransitionProvider>
        <ScrollToTop />
        <Suspense fallback={null}>
          <Routes>
            <Route path={designById('apple').route} element={<Apple />} />
            <Route path={designById('luxury').route} element={<Design4 />} />
            <Route path={designById('brutalist').route} element={<Design1 />} />
            <Route path={MENU.route} element={<Home />} />
            {/* Legacy routes */}
            <Route path="/1" element={<Design4 />} />
            <Route path="/2" element={<Design1 />} />
          </Routes>
        </Suspense>
        <Analytics />
      </PageTransitionProvider>
    </LanguageProvider>
  )
}

export default App
