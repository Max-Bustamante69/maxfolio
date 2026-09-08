import { m, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from "react";
import { TransitionLink } from "./TransitionLink";
import { useI18n } from "../../hooks/useI18n";
import { designs, MENU, type DesignId } from "../../data/designs";

interface LogoSelectorLuxuryProps {
  isDark: boolean;
}

/** Small mark for each design, in the Luxury menu's language. */
function DesignMark({ id, isDark, accentHex, textPrimary }: { id: DesignId; isDark: boolean; accentHex: string; textPrimary: string }) {
  if (id === "brutalist") {
    return (
      <div className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center bg-red-600 group-hover:bg-red-500 transition-colors">
        <div className="absolute -bottom-1 -right-1 w-full h-full border-2 border-red-600/30" />
        <div className="flex flex-col items-center leading-none">
          <span className="font-mono text-sm font-bold text-white">M</span>
          <span className="font-mono text-sm font-bold text-white -mt-1">B</span>
        </div>
      </div>
    );
  }
  if (id === "apple") {
    return (
      <div className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center rounded-[12px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
        <span className="text-[13px] font-semibold text-[#1d1d1f]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif' }}>MB</span>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full" fill="none">
        <path d="M0 8 L0 0 L8 0" stroke={accentHex} strokeWidth="2" />
        <path d="M40 0 L48 0 L48 8" stroke={accentHex} strokeWidth="2" />
        <path d="M48 40 L48 48 L40 48" stroke={accentHex} strokeWidth="2" />
        <path d="M8 48 L0 48 L0 40" stroke={accentHex} strokeWidth="2" />
        <path d="M24 10 L38 24 L24 38 L10 24 Z" stroke={accentHex} strokeWidth="0.5" opacity="0.5" />
      </svg>
      <span className={`font-display text-sm tracking-wider ${isDark ? "text-deco-cream" : textPrimary}`}>MB</span>
    </div>
  );
}

export function LogoSelectorLuxury({ isDark }: LogoSelectorLuxuryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

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
      <m.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 relative flex items-center justify-center group"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open design selector - click to switch portfolio styles"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Pulsing glow background on hover */}
        <m.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: glowColor }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1.4 }}
          transition={{ duration: 0.3 }}
        />

        {/* Outer frame */}
        <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
          <m.path d="M0 8 L0 0 L8 0" stroke={accentHex} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
          <m.path d="M32 0 L40 0 L40 8" stroke={accentHex} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1 }} />
          <m.path d="M40 32 L40 40 L32 40" stroke={accentHex} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
          <m.path d="M8 40 L0 40 L0 32" stroke={accentHex} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
          <m.path
            d="M20 8 L32 20 L20 32 L8 20 Z"
            stroke={accentHex}
            strokeWidth="0.5"
            fill="none"
            animate={{ rotate: [0, 360], opacity: [0.2, 0.5, 0.2] }}
            transition={{ rotate: { repeat: Infinity, duration: 20, ease: "linear" }, opacity: { repeat: Infinity, duration: 3 } }}
            style={{ transformOrigin: "center" }}
          />
        </svg>
        <span className={`font-display text-xs tracking-[0.2em] font-medium ${textPrimary} relative z-10`}>
          MB
        </span>
      </m.button>

      {/* Animated indicator with text hint */}
      <AnimatePresence>
        {showHint && !isOpen && (
          <m.div
            className={`flex items-center gap-1 ${accent}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.3 }}
          >
            <m.div className="relative w-4 h-4" animate={{ rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
              <svg viewBox="0 0 16 16" className="w-full h-full" fill="none">
                <m.path d="M8 1 L15 8 L8 15 L1 8 Z" stroke={accentHex} strokeWidth="1" fill="none" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
              </svg>
            </m.div>
            <m.span
              className="hidden sm:block font-display text-[9px] tracking-[0.15em] uppercase whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Styles
            </m.span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Elegant Dropdown */}
            <m.div
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-full left-0 mt-4 z-50 ${menuBg} min-w-[320px] shadow-2xl overflow-hidden`}
              style={{
                boxShadow: isDark
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(201, 169, 98, 0.2)",
              }}
              role="menu"
              aria-orientation="vertical"
            >
              {/* Decorative corner accents */}
              {[
                "M0 12 L0 0 L12 0",
                "M12 0 L24 0 L24 12",
                "M0 12 L0 24 L12 24",
                "M12 24 L24 24 L24 12",
              ].map((d, i) => (
                <div key={d} className={`absolute w-6 h-6 ${i === 0 ? "top-0 left-0" : i === 1 ? "top-0 right-0" : i === 2 ? "bottom-0 left-0" : "bottom-0 right-0"}`}>
                  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                    <path d={d} stroke={accentHex} strokeWidth="1" />
                  </svg>
                </div>
              ))}

              {/* Top gold line */}
              <m.div
                className="h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />

              {/* Header */}
              <div className={`px-6 py-5 border-b ${borderColor} relative overflow-hidden`}>
                <m.div
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                >
                  <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" stroke={accentHex} strokeWidth="1" />
                  </svg>
                </m.div>
                <p className={`font-display text-[10px] tracking-[0.4em] uppercase ${textMuted}`}>
                  {t("logoSelector.portfolioExperience")}
                </p>
                <p className={`font-display text-lg ${textPrimary} mt-1`}>
                  {t("logoSelector.selectYourStyle")}
                </p>
              </div>

              {/* Options — every design from the registry, the current one marked */}
              <div className="py-3">
                {designs.map((d, index) => {
                  const isCurrent = d.id === "luxury";
                  const inner = (
                    <m.div
                      className="flex items-start gap-4"
                      role="menuitem"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={isCurrent ? undefined : { x: 5 }}
                    >
                      <DesignMark id={d.id} isDark={isDark} accentHex={accentHex} textPrimary={textPrimary} />
                      <div className="flex-1">
                        <p className={`font-display text-base ${isCurrent ? accent : textPrimary} transition-colors`}>
                          {t(d.nameKey)}
                        </p>
                        <p className={`text-[11px] ${textMuted} mt-1 leading-relaxed`}>{t(d.subtitleKey)}</p>
                        {isCurrent ? (
                          <m.p
                            className={`text-[10px] ${accent} mt-3 flex items-center gap-2`}
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {t("logoSelector.currentlyViewing")}
                          </m.p>
                        ) : (
                          <p className={`text-[10px] ${textMuted} mt-3 flex items-center gap-1 group-hover:${accent} transition-colors`}>
                            {t("logoSelector.switchExperience")} →
                          </p>
                        )}
                      </div>
                    </m.div>
                  );

                  if (isCurrent) {
                    return (
                      <div
                        key={d.id}
                        className={`mx-3 px-4 py-4 rounded-sm ${isDark ? "bg-deco-gold/10" : "bg-luxury-gold/10"} border ${isDark ? "border-deco-gold/20" : "border-luxury-gold/30"}`}
                        aria-current="page"
                      >
                        {inner}
                      </div>
                    );
                  }

                  return (
                    <TransitionLink
                      key={d.id}
                      to={d.route}
                      transitionColor={d.transitionColor}
                      transitionAccent={d.transitionAccent}
                      transitionLabel={t(d.nameKey)}
                      className={`block mx-3 mt-2 px-4 py-4 rounded-sm hover:${isDark ? "bg-white/5" : "bg-black/5"} transition-all cursor-pointer group`}
                    >
                      {inner}
                    </TransitionLink>
                  );
                })}

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
                  to={MENU.route}
                  transitionColor={isDark ? "#171717" : "#fafafa"}
                  transitionAccent={isDark ? "#ffffff" : "#171717"}
                  transitionLabel={t(MENU.labelKey)}
                  className={`block mx-3 px-4 py-3 rounded-sm hover:${isDark ? "bg-white/5" : "bg-black/5"} transition-all cursor-pointer group`}
                >
                  <m.div
                    className="flex items-center gap-4"
                    role="menuitem"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <m.div className="grid grid-cols-2 gap-1.5" whileHover={{ rotate: 90, scale: 1.1 }} transition={{ duration: 0.3 }}>
                        <div className="w-4 h-4 bg-[#0071e3]" />
                        <div className="w-4 h-4 bg-[#C9A962]" />
                        <div className="w-4 h-4 bg-red-600" />
                        <div className="w-4 h-4 bg-[#C9A962]/50" />
                      </m.div>
                    </div>
                    <div>
                      <p className={`font-display text-sm ${textPrimary}`}>{t(MENU.labelKey)}</p>
                      <p className={`text-[10px] ${textMuted}`}>{t(MENU.subtitleKey)}</p>
                    </div>
                  </m.div>
                </TransitionLink>
              </div>

              {/* Bottom gold line */}
              <m.div
                className="h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
