import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { TransitionLink } from "./TransitionLink";

interface LogoSelectorBrutalistProps {
  isDark: boolean;
}

export function LogoSelectorBrutalist({ isDark }: LogoSelectorBrutalistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show hint after a delay
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const menuBg = isDark ? "bg-stone-950" : "bg-stone-100";
  const textPrimary = isDark ? "text-stone-100" : "text-stone-900";
  const textMuted = isDark ? "text-stone-500" : "text-stone-500";
  const borderColor = isDark ? "border-stone-800" : "border-stone-300";

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      {/* Logo Button with hover effects */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 relative flex items-center justify-center group"
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open design selector - click to switch portfolio styles"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bold square background with hover glow */}
        <motion.div 
          className="absolute inset-0 bg-red-600"
          whileHover={{ 
            boxShadow: "0 0 20px 5px rgba(220, 38, 38, 0.4)"
          }}
        />
        {/* Animated offset accent square */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-full h-full border-2"
          style={{ borderColor: isDark ? "#fafaf9" : "#dc2626" }}
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 0.6, x: 2, y: 2 }}
          transition={{ duration: 0.2 }}
        />
        {/* Stacked initials */}
        <div className="relative z-10 flex flex-col items-center leading-none">
          <motion.span 
            className="font-mono text-sm font-bold text-white"
            animate={{ y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          >
            M
          </motion.span>
          <motion.span 
            className="font-mono text-sm font-bold text-white -mt-1"
            animate={{ y: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          >
            B
          </motion.span>
        </div>
      </motion.button>

      {/* Animated indicator - Brutalist style */}
      <AnimatePresence>
        {showHint && !isOpen && (
          <motion.div
            className="flex items-center gap-1 text-red-600"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated bars */}
            <div className="flex flex-col gap-0.5">
              <motion.div
                className="h-0.5 bg-red-600"
                animate={{ width: ["8px", "12px", "8px"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
              <motion.div
                className="h-0.5 bg-red-600"
                animate={{ width: ["12px", "8px", "12px"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
              <motion.div
                className="h-0.5 bg-red-600"
                animate={{ width: ["8px", "12px", "8px"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            </div>
            
            {/* Text hint */}
            <motion.span 
              className="hidden sm:block font-mono text-[9px] uppercase tracking-wider whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Styles
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu - Brutalist Style */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Bold Brutalist Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "top" }}
              className={`absolute top-full left-0 mt-3 z-50 ${menuBg} border-2 ${borderColor} min-w-[340px]`}
              role="menu"
              aria-orientation="vertical"
            >
              {/* Bold red top bar with stripe pattern */}
              <div className="h-3 bg-red-600 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 flex"
                  animate={{ x: [0, -20] }}
                  transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                >
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-5 h-full bg-red-700 transform -skew-x-12 mx-1" />
                  ))}
                </motion.div>
              </div>

              {/* Header */}
              <div className={`px-6 py-5 border-b-2 ${borderColor} relative`}>
                {/* Large background letter */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className={`font-editorial text-6xl italic ${isDark ? "text-stone-900" : "text-stone-200"}`}>
                    S
                  </span>
                </div>
                <p className={`font-mono text-[10px] uppercase tracking-[0.4em] ${textMuted}`}>
                  Switch Experience
                </p>
                <p className={`font-editorial text-2xl italic ${textPrimary} mt-1 relative z-10`}>
                  Choose Style
                </p>
              </div>

              {/* Options */}
              <div className="py-2">
                {/* Brutalist - Active */}
                <motion.div
                  className={`mx-3 my-2 px-4 py-5 ${isDark ? "bg-red-600/15" : "bg-red-600/10"} border-l-4 border-red-600 relative overflow-hidden`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  role="menuitem"
                  aria-current="page"
                >
                  {/* Animated background stripe */}
                  <motion.div 
                    className="absolute inset-0 opacity-5"
                    style={{ 
                      background: `repeating-linear-gradient(45deg, transparent, transparent 10px, #dc2626 10px, #dc2626 20px)` 
                    }}
                    animate={{ x: [0, 20] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                  
                  <div className="flex items-start gap-4 relative z-10">
                    {/* Mini Logo */}
                    <motion.div
                      className="w-14 h-14 relative flex-shrink-0 flex items-center justify-center bg-red-600"
                      animate={{ 
                        boxShadow: [
                          "4px 4px 0 0 rgba(220, 38, 38, 0.3)",
                          "6px 6px 0 0 rgba(220, 38, 38, 0.4)",
                          "4px 4px 0 0 rgba(220, 38, 38, 0.3)"
                        ]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <div className="absolute -bottom-1 -right-1 w-full h-full border-2 border-red-600/40" />
                      <div className="flex flex-col items-center leading-none">
                        <span className="font-mono text-base font-bold text-white">M</span>
                        <span className="font-mono text-base font-bold text-white -mt-1">B</span>
                      </div>
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-editorial text-xl italic text-red-600">
                        Brutalist Editorial
                      </p>
                      <p className={`font-mono text-[10px] ${textMuted} mt-2 leading-relaxed uppercase tracking-wide`}>
                        Bold, raw design with editorial typography and high-contrast elements
                      </p>
                      <motion.div 
                        className="flex items-center gap-2 mt-3"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <span className="w-2 h-2 bg-red-600" />
                        <span className="font-mono text-[10px] text-red-600 uppercase tracking-wider">
                          Active
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Luxury */}
                <TransitionLink
                  to="/"
                  transitionColor="#FAF8F5"
                  transitionAccent="#C9A962"
                  transitionLabel="Luxury Minimal"
                  className="block mx-3 my-2 px-4 py-5 hover:bg-red-600/5 transition-all cursor-pointer group border-l-4 border-transparent hover:border-stone-400"
                >
                  <motion.div 
                    className="flex items-start gap-4" 
                    role="menuitem"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ x: 8 }}
                  >
                    {/* Mini Luxury Logo */}
                    <div className="w-14 h-14 relative flex-shrink-0 flex items-center justify-center bg-luxury-cream group-hover:bg-luxury-cream/90 transition-colors">
                      <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full" fill="none">
                        <path d="M0 10 L0 0 L10 0" stroke="#C9A962" strokeWidth="2" />
                        <path d="M46 0 L56 0 L56 10" stroke="#C9A962" strokeWidth="2" />
                        <path d="M56 46 L56 56 L46 56" stroke="#C9A962" strokeWidth="2" />
                        <path d="M10 56 L0 56 L0 46" stroke="#C9A962" strokeWidth="2" />
                      </svg>
                      <span className="font-display text-sm tracking-wider text-luxury-black">MB</span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-editorial text-xl italic ${textPrimary} group-hover:text-[#C9A962] transition-colors`}>
                        Luxury Minimal
                      </p>
                      <p className={`font-mono text-[10px] ${textMuted} mt-2 leading-relaxed uppercase tracking-wide`}>
                        Elegant refinement with sophisticated typography and golden accents
                      </p>
                      <p className={`font-mono text-[10px] ${textMuted} mt-3 group-hover:text-red-600 transition-colors flex items-center gap-1`}>
                        <span>Explore</span>
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          →
                        </motion.span>
                      </p>
                    </div>
                  </motion.div>
                </TransitionLink>

                {/* Divider */}
                <div className={`mx-6 my-3 border-t-2 ${borderColor} relative`}>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-red-600 rotate-45" />
                </div>

                {/* All Designs */}
                <TransitionLink
                  to="/menu"
                  transitionColor={isDark ? "#171717" : "#fafafa"}
                  transitionAccent={isDark ? "#ffffff" : "#171717"}
                  transitionLabel="Design Menu"
                  className="block mx-3 my-2 px-4 py-4 hover:bg-red-600/5 transition-all cursor-pointer group"
                >
                  <motion.div 
                    className="flex items-center gap-4" 
                    role="menuitem"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ x: 8 }}
                  >
                    {/* Animated menu icon */}
                    <motion.div 
                      className="w-14 h-14 flex items-center justify-center border-2 border-dashed border-stone-500 group-hover:border-red-600 transition-colors"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col gap-1.5">
                        <motion.div 
                          className="h-0.5 bg-stone-500 group-hover:bg-red-600 transition-colors"
                          initial={{ width: 20 }}
                          whileHover={{ width: 24 }}
                        />
                        <motion.div 
                          className="h-0.5 bg-stone-500 group-hover:bg-red-600 transition-colors"
                          initial={{ width: 16 }}
                          whileHover={{ width: 24 }}
                        />
                        <motion.div 
                          className="h-0.5 bg-stone-500 group-hover:bg-red-600 transition-colors"
                          initial={{ width: 20 }}
                          whileHover={{ width: 24 }}
                        />
                      </div>
                    </motion.div>
                    <div>
                      <p className={`font-mono text-sm uppercase tracking-wider ${textPrimary} group-hover:text-red-600 transition-colors`}>
                        All Designs
                      </p>
                      <p className={`font-mono text-[10px] ${textMuted} uppercase tracking-wide`}>
                        Compare all experiences
                      </p>
                    </div>
                  </motion.div>
                </TransitionLink>
              </div>

              {/* Bold red bottom bar */}
              <div className="h-3 bg-red-600 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 flex"
                  animate={{ x: [-20, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                >
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-5 h-full bg-red-700 transform -skew-x-12 mx-1" />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
