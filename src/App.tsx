import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { PageTransitionProvider, usePageTransition } from './components'
import { LanguageProvider } from './context/LanguageContext'
import Home from './pages/Home'
import Design1 from './pages/Design1'
import Design4 from './pages/Design4'

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
        <Routes>
          <Route path="/" element={<Design4 />} />
          <Route path="/menu" element={<Home />} />
          <Route path="/brutalist" element={<Design1 />} />
          {/* Legacy routes */}
          <Route path="/1" element={<Design4 />} />
          <Route path="/2" element={<Design1 />} />
        </Routes>
      </PageTransitionProvider>
    </LanguageProvider>
  )
}

export default App
