import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { TransitionLink } from "./TransitionLink";

interface LogoSelectorLuxuryProps {
  isDark: boolean;
}

export function LogoSelectorLuxury({ isDark }: LogoSelectorLuxuryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show hint after a delay, then pulse it
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

  const menuBg = isDark ? "bg-deco-navy" : "bg-luxury-cream";
  const textPrimary = isDark ? "text-deco-cream" : "text-luxury-black";
  const textMuted = isDark ? "text-deco-cream/50" : "text-luxury-black/50";
  const accent = isDark ? "text-deco-gold" : "text-luxury-gold";
  const accentHex = isDark ? "#d4af37" : "#C9A962";
  const borderColor = isDark ? "border-deco-gold/20" : "border-luxury-black/10";
  const glowColor = isDark ? "rgba(212, 175, 55, 0.3)" : "rgba(201, 169, 98, 0.3)";

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      {/* Logo Button with Glow Effect */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 relative flex items-center justify-center group"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open design selector - click to switch portfolio styles"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Pulsing glow background on hover */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: glowColor }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1.4 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Outer frame */}
        <svg
          viewBox="0 0 40 40"
          className="absolute inset-0 w-full h-full"
          fill="none"
          aria-hidden="true"
        >
          <motion.path 
            d="M0 8 L0 0 L8 0" 
            stroke={accentHex} 
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path 
            d="M32 0 L40 0 L40 8" 
            stroke={accentHex} 
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          <motion.path 
            d="M40 32 L40 40 L32 40" 
            stroke={accentHex} 
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.path 
            d="M8 40 L0 40 L0 32" 
            stroke={accentHex} 
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <motion.path
            d="M20 8 L32 20 L20 32 L8 20 Z"
            stroke={accentHex}
            strokeWidth="0.5"
            fill="none"
            animate={{ 
              rotate: [0, 360],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 20, ease: "linear" },
              opacity: { repeat: Infinity, duration: 3 }
            }}
            style={{ transformOrigin: "center" }}
          />
        </svg>
        <span className={`font-display text-xs tracking-[0.2em] font-medium ${textPrimary} relative z-10`}>
          MB
        </span>
      </motion.button>

      {/* Animated indicator with text hint */}
      <AnimatePresence>
        {showHint && !isOpen && (
          <motion.div
            className={`flex items-center gap-1 ${accent}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated diamond */}
            <motion.div
              className="relative w-4 h-4"
              animate={{ 
                rotate: [0, 180, 360],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
            >
              <svg viewBox="0 0 16 16" className="w-full h-full" fill="none">
                <motion.path
                  d="M8 1 L15 8 L8 15 L1 8 Z"
                  stroke={accentHex}
                  strokeWidth="1"
                  fill="none"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                  }}
                />
              </svg>
            </motion.div>
            
            {/* Text hint - visible on larger screens */}
            <motion.span 
              className="hidden sm:block font-display text-[9px] tracking-[0.15em] uppercase whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Styles
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Elegant Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-full left-0 mt-4 z-50 ${menuBg} min-w-[320px] shadow-2xl overflow-hidden`}
              style={{ 
                boxShadow: isDark 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(201, 169, 98, 0.2)'
              }}
              role="menu"
              aria-orientation="vertical"
            >
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                  <path d="M0 12 L0 0 L12 0" stroke={accentHex} strokeWidth="1" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                  <path d="M12 0 L24 0 L24 12" stroke={accentHex} strokeWidth="1" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                  <path d="M0 12 L0 24 L12 24" stroke={accentHex} strokeWidth="1" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                  <path d="M12 24 L24 24 L24 12" stroke={accentHex} strokeWidth="1" />
                </svg>
              </div>

              {/* Top gold line */}
              <motion.div
                className="h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />

              {/* Header with animated diamond */}
              <div className={`px-6 py-5 border-b ${borderColor} relative overflow-hidden`}>
                <motion.div 
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                >
                  <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" stroke={accentHex} strokeWidth="1" />
                  </svg>
                </motion.div>
                <p className={`font-display text-[10px] tracking-[0.4em] uppercase ${textMuted}`}>
                  Portfolio Experience
                </p>
                <p className={`font-display text-lg ${textPrimary} mt-1`}>
                  Select Your Style
                </p>
              </div>

              {/* Options */}
              <div className="py-3">
                {/* Luxury - Active */}
                <motion.div
                  className={`mx-3 px-4 py-4 rounded-sm ${isDark ? "bg-deco-gold/10" : "bg-luxury-gold/10"} border ${isDark ? "border-deco-gold/20" : "border-luxury-gold/30"}`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  role="menuitem"
                  aria-current="page"
                >
                  <div className="flex items-start gap-4">
                    {/* Animated Mini Logo */}
                    <motion.div
                      className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center"
                      animate={{ 
                        boxShadow: [
                          `0 0 0 0 ${glowColor}`,
                          `0 0 20px 5px ${glowColor}`,
                          `0 0 0 0 ${glowColor}`
                        ]
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full" fill="none">
                        <path d="M0 8 L0 0 L8 0" stroke={accentHex} strokeWidth="2" />
                        <path d="M40 0 L48 0 L48 8" stroke={accentHex} strokeWidth="2" />
                        <path d="M48 40 L48 48 L40 48" stroke={accentHex} strokeWidth="2" />
                        <path d="M8 48 L0 48 L0 40" stroke={accentHex} strokeWidth="2" />
                        <path d="M24 10 L38 24 L24 38 L10 24 Z" stroke={accentHex} strokeWidth="0.5" opacity="0.5" />
                      </svg>
                      <span className={`font-display text-sm tracking-wider ${textPrimary}`}>MB</span>
                    </motion.div>
                    <div className="flex-1">
                      <p className={`font-display text-base ${accent}`}>Luxury Minimal</p>
                      <p className={`text-[11px] ${textMuted} mt-1 leading-relaxed`}>
                        Elegant refinement with sophisticated typography and golden accents
                      </p>
                      <motion.p 
                        className={`text-[10px] ${accent} mt-3 flex items-center gap-2`}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        Currently viewing
                      </motion.p>
                    </div>
                  </div>
                </motion.div>

                {/* Brutalist */}
                <TransitionLink
                  to="/brutalist"
                  transitionColor="#1c1917"
                  transitionAccent="#dc2626"
                  transitionLabel="Brutalist Editorial"
                  className={`block mx-3 mt-2 px-4 py-4 rounded-sm hover:${isDark ? "bg-white/5" : "bg-black/5"} transition-all cursor-pointer group`}
                >
                  <motion.div 
                    className="flex items-start gap-4" 
                    role="menuitem"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ x: 5 }}
                  >
                    {/* Mini Brutalist Logo */}
                    <div className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center bg-red-600 group-hover:bg-red-500 transition-colors">
                      <div className="absolute -bottom-1 -right-1 w-full h-full border-2 border-red-600/30" />
                      <div className="flex flex-col items-center leading-none">
                        <span className="font-mono text-sm font-bold text-white">M</span>
                        <span className="font-mono text-sm font-bold text-white -mt-1">B</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`font-display text-base ${textPrimary} group-hover:text-red-500 transition-colors`}>
                        Brutalist Editorial
                      </p>
                      <p className={`text-[11px] ${textMuted} mt-1 leading-relaxed`}>
                        Bold, raw design with editorial typography and high contrast
                      </p>
                      <p className={`text-[10px] ${textMuted} mt-3 flex items-center gap-1 group-hover:${accent} transition-colors`}>
                        Click to explore →
                      </p>
                    </div>
                  </motion.div>
                </TransitionLink>

                {/* Divider with diamond */}
                <div className="flex items-center gap-3 px-6 my-4">
                  <div className={`flex-1 border-t ${borderColor}`} />
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                    <path d="M6 0 L12 6 L6 12 L0 6 Z" stroke={accentHex} strokeWidth="0.5" opacity="0.5" />
                  </svg>
                  <div className={`flex-1 border-t ${borderColor}`} />
                </div>

                {/* All Designs */}
                <TransitionLink
                  to="/menu"
                  transitionColor={isDark ? "#171717" : "#fafafa"}
                  transitionAccent={isDark ? "#ffffff" : "#171717"}
                  transitionLabel="Design Menu"
                  className={`block mx-3 px-4 py-3 rounded-sm hover:${isDark ? "bg-white/5" : "bg-black/5"} transition-all cursor-pointer group`}
                >
                  <motion.div 
                    className="flex items-center gap-4" 
                    role="menuitem"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ x: 5 }}
                  >
                    {/* Animated grid icon */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      <motion.div 
                        className="grid grid-cols-2 gap-1.5"
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-4 h-4 bg-[#C9A962]" />
                        <div className="w-4 h-4 bg-red-600" />
                        <div className="w-4 h-4 bg-red-600/50" />
                        <div className="w-4 h-4 bg-[#C9A962]/50" />
                      </motion.div>
                    </div>
                    <div>
                      <p className={`font-display text-sm ${textPrimary}`}>View All Designs</p>
                      <p className={`text-[10px] ${textMuted}`}>Compare all portfolio experiences</p>
                    </div>
                  </motion.div>
                </TransitionLink>
              </div>

              {/* Bottom gold line */}
              <motion.div
                className="h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
