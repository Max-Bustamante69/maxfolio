import { motion, AnimatePresence } from "framer-motion";
import { useState, ReactNode } from "react";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import {
  ContactFormModal,
  ExploreDesignsLuxury,
  CompanyLogo,
  TransitionLink,
  MobileMenuLuxury,
  LogoSelectorLuxury,
  LanguageSelectorLuxury,
  SEOHead,
} from "../components";
import { useDynamicFavicon } from "../hooks";
import { useI18n } from "../hooks";
import {
  personalInfo,
  skills,
  experience,
  freelanceProjects,
  stats,
  contact,
  footer as footerData,
} from "../data/portfolio-extended";

// Theme Toggle Button - Luxury Minimal Design
const ThemeToggle = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const { isDark, toggleTheme } = useTheme();

  const buttonSize = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative ${buttonSize} flex items-center justify-center group`}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Elegant diamond frame */}
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0 w-full h-full"
        fill="none"
        aria-hidden="true"
      >
        <motion.path
          d="M20 4 L36 20 L20 36 L4 20 Z"
          stroke={isDark ? "#d4af37" : "#C9A962"}
          strokeWidth="1"
          fill="none"
          initial={false}
          animate={{ rotate: isDark ? 45 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: "center" }}
        />
      </svg>

      {/* Icon */}
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {isDark ? (
          <svg
            className={`${iconSize} text-deco-gold`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg
            className={`${iconSize} text-luxury-gold`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
};

// Animation wrapper
const FadeInUp = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Main Design Component
function Design4Content() {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const [selectedJob, setSelectedJob] = useState(experience[0]);
  const [activeTab, setActiveTab] = useState<"work" | "freelance">("work");
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Dynamic favicon
  useDynamicFavicon("luxury");

  // Theme-aware classes
  const bgPrimary = isDark ? "bg-deco-navy" : "bg-luxury-cream";
  const bgSecondary = isDark ? "bg-slate-950" : "bg-luxury-black";
  const textPrimary = isDark ? "text-deco-cream" : "text-luxury-black";
  const textSecondary = isDark ? "text-deco-cream/60" : "text-luxury-black/60";
  const textMuted = isDark ? "text-deco-cream/40" : "text-luxury-black/40";
  const accent = isDark ? "text-deco-gold" : "text-luxury-gold";
  const accentBg = isDark ? "bg-deco-gold" : "bg-luxury-gold";
  const borderColor = isDark ? "border-deco-gold/20" : "border-luxury-black/10";
  const borderAccent = isDark ? "border-deco-gold/30" : "border-luxury-gold/30";

  return (
    <>
      {/* SEO */}
      <SEOHead 
        title="Maximiliano Bustamante | Frontend Developer - Luxury Portfolio"
        description="Frontend Developer specialized in React, Next.js, TypeScript, and e-commerce. View my luxury minimal portfolio showcasing elegant web development work."
      />
      
      <div
        className={`min-h-screen ${bgPrimary} ${textPrimary} font-body transition-colors duration-500`}
        role="document"
      >
        {/* Contact Form Modal */}
        <ContactFormModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          variant="luxury"
          isDark={isDark}
        />

      {/* Subtle texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Art Deco pattern for dark mode */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="deco-pattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M50 0L100 50L50 100L0 50Z"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#deco-pattern)" />
          </svg>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 ${isDark ? "bg-deco-navy/90" : "bg-luxury-cream/80"} backdrop-blur-sm transition-colors duration-500`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-4 md:py-6">
          <div className="flex justify-between items-center">
            {/* Logo + Design Selector */}
            <LogoSelectorLuxury isDark={isDark} />
            <div className="hidden md:flex items-center gap-8 lg:gap-12 h-10">
              <a
                href="#hero"
                className={`inline-flex items-center h-10 text-xs tracking-[0.2em] uppercase leading-none ${textMuted} hover:${accent} transition-colors`}
              >
                {t('nav.home')}
              </a>
              <a
                href="#experience"
                className={`inline-flex items-center h-10 text-xs tracking-[0.2em] uppercase leading-none ${textMuted} hover:${accent} transition-colors`}
              >
                {t('nav.experience')}
              </a>
              <a
                href="#skills"
                className={`inline-flex items-center h-10 text-xs tracking-[0.2em] uppercase leading-none ${textMuted} hover:${accent} transition-colors`}
              >
                {t('nav.skills')}
              </a>
              <a
                href="#contact"
                className={`inline-flex items-center h-10 text-xs tracking-[0.2em] uppercase leading-none ${textMuted} hover:${accent} transition-colors`}
              >
                {t('nav.contact')}
              </a>
              <a
                href="#explore"
                className={`inline-flex items-center h-10 text-xs tracking-[0.2em] uppercase leading-none ${textMuted} hover:${accent} transition-colors`}
              >
                {t('nav.explore')}
              </a>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick Email Button - Desktop */}
              <motion.button
                onClick={() => setIsContactOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 ${isDark ? "bg-deco-gold/10 text-deco-gold border border-deco-gold/30" : "bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30"} hover:${isDark ? "bg-deco-gold/20" : "bg-luxury-gold/20"} transition-all text-xs tracking-[0.15em] uppercase`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden lg:inline">{t('common.quickEmail')}</span>
              </motion.button>
              {/* Desktop Theme Toggle */}
              <div className="hidden md:flex items-center gap-2">
                <LanguageSelectorLuxury isDark={isDark} />
                <ThemeToggle />
              </div>
              {/* Mobile Theme Toggle + Menu */}
              <div className="flex items-center gap-2 md:hidden">
                <ThemeToggle size="sm" />
                <LanguageSelectorLuxury isDark={isDark} size="sm" />
                <MobileMenuLuxury
                  isDark={isDark}
                  onContactClick={() => setIsContactOpen(true)}
                  navItems={[
                    { label: t('nav.home'), href: '#hero' },
                    { label: t('nav.experience'), href: '#experience' },
                    { label: t('nav.skills'), href: '#skills' },
                    { label: t('nav.contact'), href: '#contact' },
                    { label: t('nav.explore'), href: '#explore' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
        <section
          id="hero"
          className="min-h-screen flex items-center py-24 px-6 md:px-16  "
          aria-labelledby="hero-heading"
        >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-end">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
              >
                <div className="mb-6 md:mb-8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60px" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className={`h-px ${accentBg} mb-4 md:mb-6`}
                  />
                  <p
                    className={`text-xs tracking-[0.5em] uppercase ${textMuted} mb-2`}
                  >
                    {t('hero.greeting')}
                  </p>
                  <p
                    className={`text-xs tracking-[0.5em] uppercase ${textMuted} mb-4`}
                  >
                    {t('personal.title')}
                  </p>
                </div>

                <h1 id="hero-heading" className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight mb-6 md:mb-8">
                  <motion.span
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="block"
                  >
                    {personalInfo.firstName}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className={`block ${accent} italic`}
                  >
                    Bustamante
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className={`text-base md:text-xl ${textSecondary} max-w-xl leading-relaxed font-light mb-6 md:mb-8`}
                >
                    {t('hero.description')}
                </motion.p>

                {/* Current Focus */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className={`border-l-2 ${borderAccent} pl-4 md:pl-6 mb-6 md:mb-8`}
                >
                  <p
                    className={`text-xs tracking-[0.2em] uppercase ${accent} mb-3`}
                  >
                    {t('hero.currentFocus.title')}
                  </p>
                  <ul className={`space-y-2 ${textSecondary} text-sm`}>
                    {[1, 2, 3].map((i) => {
                      const text =
                        i === 1
                          ? t('hero.currentFocus.item1')
                          : i === 2
                            ? t('hero.currentFocus.item2')
                            : t('hero.currentFocus.item3')
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 ${accentBg} rotate-45 flex-shrink-0`} />
                          {text}
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    onClick={() => setIsContactOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 md:px-8 py-4 ${isDark ? "bg-deco-gold text-deco-navy" : "bg-luxury-black text-luxury-cream"} hover:opacity-90 transition-all text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {t('hero.buttons.getInTouch')}
                  </motion.button>
                  <button
                    onClick={() => {
                      window.open("/Maximiliano-Bustamante-CV.pdf", "_blank");
                      const link = document.createElement("a");
                      link.href = "/Maximiliano-Bustamante-CV.pdf";
                      link.download = "Maximiliano-Bustamante-CV.pdf";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className={`px-6 md:px-8 py-4 border ${borderColor} hover:${borderAccent} transition-all text-sm tracking-[0.2em] uppercase text-center flex items-center justify-center gap-2`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {t('hero.buttons.downloadCV')}
                  </button>
                </motion.div>
              </motion.div>
            </div>

            {/* Side Stats */}
            <div className="lg:col-span-4 ">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className={`border-l ${borderColor} pl-6 md:pl-8 grid grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8`}
              >
                {stats.map((stat, index) => (
                  <div key={index}>
                    <span
                      className={`font-display text-3xl md:text-4xl lg:text-5xl ${accent}`}
                    >
                      {stat.value}
                    </span>
                    <p
                      className={`text-xs tracking-[0.2em] uppercase ${textMuted} mt-2`}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        className={`py-20 md:py-32 px-6 md:px-16 ${bgSecondary} ${isDark ? "text-deco-cream" : "text-luxury-cream"}`}
      >
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
              <div>
                <p
                  className={`text-xs tracking-[0.5em] uppercase ${accent} mb-4`}
                >
                  {t('sections.experience')}
                </p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  Professional{" "}
                  <span className={`italic ${accent}`}>Journey</span>
                </h2>
              </div>
              <div className={`hidden md:block w-24 h-px ${accentBg}`} />
            </div>
          </FadeInUp>

          {/* Tab Navigation */}
          <FadeInUp delay={0.1}>
            <div className="flex justify-center mb-8 md:mb-12">
              <div
                className={`${isDark ? "bg-deco-navy/50" : "bg-white/10"} rounded-full p-1 backdrop-blur-sm border ${borderColor} flex`}
              >
                <button
                  onClick={() => setActiveTab("work")}
                  className={`px-4 md:px-6 py-2 text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase rounded-full transition-all ${
                    activeTab === "work"
                      ? `${accentBg} ${isDark ? "text-deco-navy" : "text-white"}`
                      : `${isDark ? "text-deco-cream/60" : "text-white/60"} hover:text-white`
                  }`}
                >
                  {t('sections.experienceTabWork')}
                </button>
                <button
                  onClick={() => setActiveTab("freelance")}
                  className={`px-4 md:px-6 py-2 text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase rounded-full transition-all ${
                    activeTab === "freelance"
                      ? `${accentBg} ${isDark ? "text-deco-navy" : "text-white"}`
                      : `${isDark ? "text-deco-cream/60" : "text-white/60"} hover:text-white`
                  }`}
                >
                  {t('sections.experienceTabFreelance')}
                </button>
              </div>
            </div>
          </FadeInUp>

          <AnimatePresence mode="wait">
            {activeTab === "work" && (
              <motion.div
                key="work"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-12 gap-6 md:gap-8"
              >
                {/* Job List */}
                <div className="lg:col-span-4 space-y-3 md:space-y-4 order-2 lg:order-1">
                  {experience.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedJob(job)}
                      className={`cursor-pointer p-4 md:p-6 border transition-all ${
                        selectedJob.id === job.id
                          ? `${borderAccent} ${isDark ? "bg-deco-gold/10" : "bg-luxury-gold/10"}`
                          : `${borderColor} hover:${borderAccent}`
                      }`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div
                          className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                            job.type === "current"
                              ? "bg-green-500 animate-pulse"
                              : accentBg
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold mb-1 text-sm md:text-base truncate">
                            {job.title}
                          </h3>
                          <p className={`${accent} text-sm`}>{job.company}</p>
                          <p
                            className={`text-xs ${isDark ? "text-deco-cream/40" : "text-white/40"} mt-1`}
                          >
                            {job.period}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Job Details */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedJob.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`border ${borderColor} ${isDark ? "bg-deco-navy/30" : "bg-white/5"} p-6 md:p-8`}
                    >
                      {/* Header with Logo */}
                      <div className="flex flex-wrap items-start gap-4 md:gap-6 mb-6 md:mb-8">
                        {selectedJob.logo && (
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl p-2 flex-shrink-0">
                            <CompanyLogo
                              src={selectedJob.logo}
                              alt={selectedJob.company}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                            <h3 className="text-xl md:text-2xl font-display">
                              {selectedJob.title}
                            </h3>
                            <span
                              className={`text-xs px-2 md:px-3 py-1 ${
                                selectedJob.type === "current"
                                  ? "bg-green-500/20 text-green-400"
                                  : `${isDark ? "bg-deco-gold/20 text-deco-gold" : "bg-luxury-gold/20 text-luxury-gold"}`
                              }`}
                            >
                              {selectedJob.type === "current"
                                ? "Current"
                                : "Completed"}
                            </span>
                          </div>
                          <p
                            className={`${isDark ? "text-deco-cream/60" : "text-white/60"} text-sm`}
                          >
                            {selectedJob.company} • {selectedJob.location}
                          </p>
                          {selectedJob.website && (
                            <a
                              href={selectedJob.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${accent} text-sm hover:underline mt-1 inline-block`}
                            >
                              Visit Website →
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className={`${isDark ? "text-deco-cream/70" : "text-white/70"} leading-relaxed mb-6 md:mb-8 text-sm md:text-base`}
                      >
                        {selectedJob.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                        {selectedJob.metrics.map((metric, i) => (
                          <div
                            key={i}
                            className={`text-center p-3 md:p-4 ${isDark ? "bg-deco-navy/50" : "bg-white/5"} rounded-lg`}
                          >
                            <div
                              className={`text-lg md:text-2xl font-display ${accent}`}
                            >
                              {metric.value}
                            </div>
                            <div
                              className={`text-xs ${isDark ? "text-deco-cream/50" : "text-white/50"}`}
                            >
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Achievements */}
                      <div className="mb-6 md:mb-8">
                        <h4
                          className={`text-xs tracking-[0.2em] uppercase ${accent} mb-4`}
                        >
                          Key Achievements
                        </h4>
                        <ul className="space-y-2 md:space-y-3">
                          {selectedJob.highlights.map((highlight, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 md:gap-3"
                            >
                              <span
                                className={`w-1.5 h-1.5 ${accentBg} rotate-45 mt-2 flex-shrink-0`}
                              />
                              <span
                                className={`${isDark ? "text-deco-cream/70" : "text-white/70"} text-sm`}
                              >
                                {highlight}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h4
                          className={`text-xs tracking-[0.2em] uppercase ${accent} mb-4`}
                        >
                          Technologies Used
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.technologies.map((tech, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 md:px-3 py-1 border ${borderColor} ${isDark ? "text-deco-cream/60" : "text-white/60"}`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === "freelance" && (
              <motion.div
                key="freelance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              >
                {freelanceProjects.map((project, index) => (
                  <motion.a
                    key={project.id}
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group p-6 md:p-8 border ${borderColor} hover:${borderAccent} ${isDark ? "bg-deco-navy/30" : "bg-white/5"} transition-all`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`text-3xl md:text-4xl font-display ${isDark ? "text-deco-gold/20" : "text-luxury-gold/20"} group-hover:${accent} transition-colors`}
                      >
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span
                        className={`text-xs ${isDark ? "text-deco-cream/40" : "text-white/40"}`}
                      >
                        {project.year}
                      </span>
                    </div>
                    <h3
                      className={`text-lg md:text-xl font-display mb-2 group-hover:${accent} transition-colors`}
                    >
                      {project.name}
                    </h3>
                    <p className={`${accent} text-sm mb-4`}>
                      {project.description}
                    </p>
                    <p
                      className={`${isDark ? "text-deco-cream/60" : "text-white/60"} text-sm mb-6`}
                    >
                      {project.details}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 md:px-3 py-1 border ${borderColor}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`mt-4 ${accent} text-sm opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      View Project →
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
            <div className="lg:col-span-4">
              <FadeInUp>
                <p
                  className={`text-xs tracking-[0.5em] uppercase ${accent} mb-4`}
                >
                  {t('skills.about')}
                </p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight">
                  Crafting Digital
                  <br />
                  <span className={`italic ${accent}`}>Excellence</span>
                </h2>
              </FadeInUp>
            </div>

            <div className="lg:col-span-8">
              <FadeInUp delay={0.2}>
                <p
                  className={`text-base md:text-xl ${textSecondary} leading-relaxed mb-8 md:mb-12 font-light`}
                >
                  {personalInfo.summary}
                </p>
              </FadeInUp>

              <div
                className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-6 md:pt-8 border-t ${borderColor}`}
              >
                {[
                  { title: t('skills.languages'), items: skills.languages.slice(0, 4) },
                  { title: t('skills.frameworks'), items: skills.frameworks },
                  { title: t('skills.databases'), items: skills.databases.slice(0, 4) },
                  { title: t('skills.platforms'), items: skills.platforms.slice(0, 4) },
                ].map((category, index) => (
                  <FadeInUp key={index} delay={0.3 + index * 0.1}>
                    <h3
                      className={`text-xs tracking-[0.2em] uppercase ${accent} mb-3 md:mb-4`}
                    >
                      {category.title}
                    </h3>
                    <ul className="space-y-1 md:space-y-2">
                      {category.items.map((item, i) => (
                        <li key={i} className={`text-sm ${textSecondary}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </FadeInUp>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}
      >
        <div className="max-w-5xl mx-auto">
          <FadeInUp>
            <div
              className={`border ${borderColor} p-8 md:p-12 lg:p-20 text-center`}
            >
              <p
                className={`text-xs tracking-[0.5em] uppercase ${accent} mb-6 md:mb-8`}
              >
                {t('contactPage.getInTouch')}
              </p>

              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 md:mb-8">
                {contact.title.split(" ").slice(0, 2).join(" ")}
                <br />
                <span className={`italic ${accent}`}>
                  {contact.title.split(" ").slice(2).join(" ")}
                </span>
              </h2>

              <p
                className={`text-base md:text-lg ${textSecondary} mb-6 md:mb-8 max-w-xl mx-auto font-light`}
              >
                {contact.subtitle}
              </p>

              {/* Availability Badge */}
              <div
                className={`inline-flex items-center gap-3 px-4 md:px-6 py-3 ${isDark ? "bg-deco-gold/10" : "bg-luxury-gold/10"} rounded-full mb-8 md:mb-12`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className={`text-sm ${accent}`}>
                  {contact.availability.status}
                </span>
              </div>

              <div className="mb-8 md:mb-12">
                <p className={`text-sm ${textMuted} mb-6`}>
                  {contact.availability.description}
                </p>

                {/* Quick Email CTA */}
                <motion.button
                  onClick={() => setIsContactOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 ${isDark ? "bg-deco-gold text-deco-navy" : "bg-luxury-black text-luxury-cream"} hover:opacity-90 transition-all group`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm tracking-[0.2em] uppercase">
                    {t('common.quickEmail')}
                  </span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-2 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 mb-12 md:mb-16">
                <div className="text-center">
                  <p
                    className={`text-xs tracking-[0.2em] uppercase ${textMuted} mb-2`}
                  >
                    {t('contactPage.email')}
                  </p>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className={`${textSecondary} hover:${accent} transition-colors text-sm md:text-base`}
                  >
                    {personalInfo.email}
                  </a>
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs tracking-[0.2em] uppercase ${textMuted} mb-2`}
                  >
                    {t('contactPage.phone')}
                  </p>
                  <a
                    href={`tel:${personalInfo.phone}`}
                    className={`${textSecondary} hover:${accent} transition-colors text-sm md:text-base`}
                  >
                    {personalInfo.phone}
                  </a>
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs tracking-[0.2em] uppercase ${textMuted} mb-2`}
                  >
                    {t('contactPage.location')}
                  </p>
                  <p className={`${textSecondary} text-sm md:text-base`}>
                    {personalInfo.location}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-6 md:gap-8">
                {["LinkedIn", "GitHub", "Portfolio"].map((platform) => (
                  <a
                    key={platform}
                    href={
                      platform === "LinkedIn"
                        ? personalInfo.linkedin
                        : platform === "GitHub"
                          ? personalInfo.github
                          : personalInfo.portfolio
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs tracking-[0.2em] uppercase ${textMuted} hover:${accent} transition-colors`}
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      </main>

      {/* Explore Other Designs Section */}
      <ExploreDesignsLuxury isDark={isDark} />

      {/* Footer */}
      <footer 
        className={`py-8 md:py-12 px-6 md:px-16 border-t ${borderColor}`}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            <div>
              <h3 className={`font-display text-lg md:text-xl mb-4 ${accent}`}>
                {personalInfo.name}
              </h3>
              <p className={`text-sm ${textSecondary} leading-relaxed`}>
                Crafting exceptional digital experiences with modern
                technologies.
              </p>
            </div>
            <div>
              <h4
                className={`text-xs tracking-[0.2em] uppercase ${accent} mb-4`}
              >
                What I Do
              </h4>
              <ul className={`text-sm ${textSecondary} space-y-1 md:space-y-2`}>
                {footerData.services.slice(0, 4).map((service, i) => (
                  <li key={i}>{service}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className={`text-xs tracking-[0.2em] uppercase ${accent} mb-4`}
              >
                Quick Links
              </h4>
              <ul className={`text-sm ${textSecondary} space-y-1 md:space-y-2`}>
                <li>
                  <a
                    href="#hero"
                    className={`hover:${accent} transition-colors`}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#experience"
                    className={`hover:${accent} transition-colors`}
                  >
                    Experience
                  </a>
                </li>
                <li>
                  <a
                    href="#skills"
                    className={`hover:${accent} transition-colors`}
                  >
                    Skills
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className={`hover:${accent} transition-colors`}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <TransitionLink
                    to="/brutalist"
                    transitionColor="#1c1917"
                    transitionAccent="#dc2626"
                    transitionLabel="Brutalist Editorial"
                    className={`hover:${accent} transition-colors`}
                  >
                    Brutalist Design
                  </TransitionLink>
                </li>
                <li>
                  <TransitionLink
                    to="/menu"
                    transitionColor={isDark ? "#171717" : "#fafafa"}
                    transitionAccent={isDark ? "#ffffff" : "#171717"}
                    transitionLabel="Design Menu"
                    className={`hover:${accent} transition-colors`}
                  >
                    All Designs
                  </TransitionLink>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`pt-6 md:pt-8 border-t ${borderColor} flex flex-col md:flex-row justify-between items-center gap-4`}
          >
            <p className={`text-xs tracking-[0.2em] uppercase ${textMuted}`}>
              © 2026 {personalInfo.name}
            </p>
            <p className={`text-xs tracking-[0.2em] uppercase ${textMuted}`}>
              <span className={accent}>Luxury Minimal</span> — Default Design
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Quick Email FAB */}
        {/* Mobile floating contact button */}
        <motion.button
          onClick={() => setIsContactOpen(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className={`fixed bottom-6 right-6 md:hidden w-14 h-14 ${isDark ? "bg-deco-gold text-deco-navy" : "bg-luxury-black text-luxury-cream"} rounded-full shadow-lg flex items-center justify-center z-30`}
          whileTap={{ scale: 0.9 }}
          aria-label="Open contact form"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </motion.button>
      </div>
    </>
  );
}

// Wrapper with Theme Provider
export default function Design4() {
  return (
    <ThemeProvider storageKey="luxury-theme" defaultTheme="light">
      <Design4Content />
    </ThemeProvider>
  );
}
