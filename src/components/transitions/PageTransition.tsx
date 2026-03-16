import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, createContext, useContext, useState, useCallback, useEffect } from 'react'

interface TransitionConfig {
  color: string
  accentColor: string
  label: string
}

interface TransitionContextType {
  startTransition: (config: TransitionConfig, callback: () => void) => void
  isTransitioning: boolean
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined)

export function usePageTransition() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider')
  }
  return context
}

interface PageTransitionProviderProps {
  children: ReactNode
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [config, setConfig] = useState<TransitionConfig | null>(null)
  const [callback, setCallback] = useState<(() => void) | null>(null)

  const startTransition = useCallback((newConfig: TransitionConfig, cb: () => void) => {
    setConfig(newConfig)
    setCallback(() => cb)
    setIsTransitioning(true)
    setShowContent(false)
  }, [])

  // Handle the transition sequence
  useEffect(() => {
    if (!isTransitioning || !callback) return

    // After background expands, show content and scroll
    const showTimer = setTimeout(() => {
      setShowContent(true)
      // Scroll to top instantly while covered
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 400)

    // Navigate after showing the label
    const navTimer = setTimeout(() => {
      callback()
    }, 1200)

    // Hide transition after navigation
    const hideTimer = setTimeout(() => {
      setIsTransitioning(false)
      setShowContent(false)
      setConfig(null)
      setCallback(null)
    }, 1400)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(navTimer)
      clearTimeout(hideTimer)
    }
  }, [isTransitioning, callback])

  return (
    <TransitionContext.Provider value={{ startTransition, isTransitioning }}>
      {children}
      
      <AnimatePresence>
        {isTransitioning && config && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background that expands */}
            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: config.color }}
              initial={{ scale: 0, borderRadius: '100%' }}
              animate={{ scale: 3, borderRadius: '0%' }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1]
              }}
            />
            
            {/* Center content - appears after background */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  className="relative z-10 text-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Accent line */}
                  <motion.div
                    className="w-16 h-[2px] mx-auto mb-5"
                    style={{ backgroundColor: config.accentColor }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                  
                  {/* Label */}
                  <motion.p
                    className="text-sm tracking-[0.4em] uppercase font-medium"
                    style={{ color: config.accentColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {config.label}
                  </motion.p>
                  
                  {/* Subtle line below */}
                  <motion.div
                    className="w-16 h-[2px] mx-auto mt-5"
                    style={{ backgroundColor: config.accentColor }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  )
}
