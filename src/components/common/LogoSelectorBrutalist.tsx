import { m, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from "react";
import { TransitionLink } from "./TransitionLink";
import { DesignMark } from "./DesignMark";
import { useI18n } from "../../hooks/useI18n";
import { designs, MENU } from "../../data/designs";
import { track } from "../../lib/track";

interface LogoSelectorBrutalistProps {
  isDark: boolean;
}

export function LogoSelectorBrutalist({ isDark }: LogoSelectorBrutalistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

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

  const Stripes = ({ reverse = false }: { reverse?: boolean }) => (
    <div className="h-3 bg-red-600 relative overflow-hidden">
      <m.div
        className="absolute inset-0 flex"
        animate={{ x: reverse ? [-20, 0] : [0, -20] }}
        transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
      >
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-5 h-full bg-red-700 transform -skew-x-12 mx-1" />
        ))}
      </m.div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      {/* Logo Button with hover effects */}
      <m.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 relative flex items-center justify-center group"
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <m.div className="absolute inset-0 bg-red-600" whileHover={{ boxShadow: "0 0 20px 5px rgba(220, 38, 38, 0.4)" }} />
        <m.div
          className="absolute -bottom-0.5 -right-0.5 w-full h-full border-2"
          style={{ borderColor: isDark ? "#fafaf9" : "#dc2626" }}
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 0.6, x: 2, y: 2 }}
          transition={{ duration: 0.2 }}
        />
        <div className="relative z-10 flex flex-col items-center leading-none">
          <m.span className="font-mono text-sm font-bold text-white" animate={{ y: [0, -1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
            M
          </m.span>
          <m.span className="font-mono text-sm font-bold text-white -mt-1" animate={{ y: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
            B
          </m.span>
          {/* the accessible name keeps the visible text ("M"+"B") and adds the purpose (matches
              LogoSelectorApple / the round-45 label-content-name-mismatch fix pattern — this sibling
              component missed it). */}
          <span className="sr-only">, open design selector — click to switch portfolio styles</span>
        </div>
      </m.button>

      {/* Animated indicator - Brutalist style */}
      <AnimatePresence>
        {showHint && !isOpen && (
          <m.div
            // text-red-600 (#dc2626) on this nav's dark register (bg-stone-950/90) measured 4.09:1
            // (Lighthouse color-contrast, desktop, 2026-09-24) -- same shortfall the "QUICK EMAIL"
            // nav button had, fixed the same way: the isDark-aware red already used elsewhere on
            // this page for dark-register text (red-400 clears 4.5+ there; light register keeps
            // red-600 against the light nav bg, where it already passes).
            className={`flex items-center gap-1 ${isDark ? "text-red-400" : "text-red-600"}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-0.5">
              {["8px", "12px", "8px"].map((w, i) => (
                <m.div
                  key={i}
                  className="h-0.5 bg-red-600"
                  animate={{ width: i === 1 ? ["12px", "8px", "12px"] : [w, "12px", w] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                />
              ))}
            </div>
            {/* Was `animate={{ opacity: [0.5, 1, 0.5] }}` — dipping this text-red-600-on-stone-950
                span to 50% opacity blends it toward the dark bg (~#af2020 at axe's sampled frame,
                Lighthouse `color-contrast`, desktop, 2026-09-24), the same opacity-dims-text-below-AA
                shape already fixed twice elsewhere in this round (ApplePreview idle fade,
                ExploreDesignsBrutalist preview tile). Full opacity always; the pulse still reads via
                the bars beside it, which are decorative (non-text) and unaffected by this rule. */}
            <m.span className="hidden sm:block font-mono text-[9px] uppercase tracking-wider whitespace-nowrap">
              Styles
            </m.span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu - Brutalist Style */}
      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <m.div
              initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "top" }}
              className={`absolute top-full left-0 mt-3 z-50 ${menuBg} border-2 ${borderColor} min-w-[340px]`}
              role="menu"
              aria-orientation="vertical"
            >
              <Stripes />

              {/* Header */}
              <div className={`px-6 py-5 border-b-2 ${borderColor} relative`}>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className={`font-editorial text-6xl italic ${isDark ? "text-stone-900" : "text-stone-200"}`}>S</span>
                </div>
                <p className={`font-mono text-[10px] uppercase tracking-[0.4em] ${textMuted}`}>
                  {t("logoSelector.switchExperience")}
                </p>
                <p className={`font-editorial text-2xl italic ${textPrimary} mt-1 relative z-10`}>
                  {t("logoSelector.selectYourStyle")}
                </p>
              </div>

              {/* Options — every design from the registry, the current one marked */}
              <div className="py-2">
                {designs.map((d, index) => {
                  const isCurrent = d.id === "brutalist";
                  const inner = (
                    <m.div
                      className="flex items-start gap-4 relative z-10"
                      role="menuitem"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={isCurrent ? undefined : { x: 8 }}
                    >
                      <DesignMark id={d.id} size="lg" isDark={isDark} />
                      <div className="flex-1">
                        <p
                          className={`font-editorial text-xl italic ${isCurrent ? "text-red-600" : textPrimary} transition-colors`}
                          style={!isCurrent ? undefined : undefined}
                        >
                          {t(d.nameKey)}
                        </p>
                        <p className={`font-mono text-[10px] ${textMuted} mt-2 leading-relaxed uppercase tracking-wide`}>
                          {t(d.subtitleKey)}
                        </p>
                        {isCurrent ? (
                          <m.div className="flex items-center gap-2 mt-3" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1 }}>
                            <span className="w-2 h-2 bg-red-600" />
                            <span className="font-mono text-[10px] text-red-600 uppercase tracking-wider">{t("logoSelector.currentlyViewing")}</span>
                          </m.div>
                        ) : (
                          <p className={`font-mono text-[10px] ${textMuted} mt-3 group-hover:text-red-600 transition-colors flex items-center gap-1`}>
                            <span>{t("logoSelector.switchExperience")}</span>
                            <m.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1 }}>→</m.span>
                          </p>
                        )}
                      </div>
                    </m.div>
                  );

                  if (isCurrent) {
                    return (
                      <div
                        key={d.id}
                        className={`mx-3 my-2 px-4 py-5 ${isDark ? "bg-red-600/15" : "bg-red-600/10"} border-l-4 border-red-600 relative overflow-hidden`}
                        aria-current="page"
                      >
                        <m.div
                          className="absolute inset-0 opacity-5"
                          style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 10px, #dc2626 10px, #dc2626 20px)" }}
                          animate={{ x: [0, 20] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                        {inner}
                      </div>
                    );
                  }

                  return (
                    <TransitionLink
                      key={d.id}
                      to={d.href}
                      transitionColor={d.transitionColor}
                      transitionAccent={d.transitionAccent}
                      transitionLabel={t(d.nameKey)}
                      onClick={() => track('theme_switch', { to: d.id })}
                      className="block mx-3 my-2 px-4 py-5 hover:bg-red-600/5 transition-all cursor-pointer group border-l-4 border-transparent hover:border-stone-400"
                    >
                      {inner}
                    </TransitionLink>
                  );
                })}

                {/* Divider */}
                <div className={`mx-6 my-3 border-t-2 ${borderColor} relative`}>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-red-600 rotate-45" />
                </div>

                {/* All Designs */}
                <TransitionLink
                  to={MENU.route}
                  transitionColor={isDark ? "#171717" : "#fafafa"}
                  transitionAccent={isDark ? "#ffffff" : "#171717"}
                  transitionLabel={t(MENU.labelKey)}
                  className="block mx-3 my-2 px-4 py-4 hover:bg-red-600/5 transition-all cursor-pointer group"
                >
                  <m.div
                    className="flex items-center gap-4"
                    role="menuitem"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ x: 8 }}
                  >
                    <m.div
                      className="w-14 h-14 flex items-center justify-center border-2 border-dashed border-stone-500 group-hover:border-red-600 transition-colors"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col gap-1.5">
                        {[20, 16, 20].map((w, i) => (
                          <m.div key={i} className="h-0.5 bg-stone-500 group-hover:bg-red-600 transition-colors" initial={{ width: w }} whileHover={{ width: 24 }} />
                        ))}
                      </div>
                    </m.div>
                    <div>
                      <p className={`font-mono text-sm uppercase tracking-wider ${textPrimary} group-hover:text-red-600 transition-colors`}>
                        {t(MENU.labelKey)}
                      </p>
                      <p className={`font-mono text-[10px] ${textMuted} uppercase tracking-wide`}>{t(MENU.subtitleKey)}</p>
                    </div>
                  </m.div>
                </TransitionLink>
              </div>

              <Stripes reverse />
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
