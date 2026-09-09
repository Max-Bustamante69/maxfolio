import { m, AnimatePresence } from 'framer-motion';
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
  ShopifyWork,
  Gallery,
  StatBand,
  Process,
  Manifesto,
  Faq,
  Contact,
  Skills,
  Ticker,
} from "../components";
import { skins } from "../components/gallery";
import { Years } from "../components/sections/Years";
import { useDynamicFavicon, useI18n, useContent } from "../hooks";
import { designById, otherDesigns, MENU } from "../data/designs";

// Theme Toggle Button - Luxury Minimal Design
const ThemeToggle = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const { isDark, toggleTheme } = useTheme();

  const buttonSize = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <m.button
      onClick={toggleTheme}
      className={`relative ${buttonSize} flex items-center justify-center group`}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Elegant diamond frame */}
      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
        <m.path
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
      <m.div initial={false} animate={{ rotate: 0 }} transition={{ duration: 0.5 }}>
        {isDark ? (
          <svg className={`${iconSize} text-deco-gold`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className={`${iconSize} text-luxury-gold`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </m.div>
    </m.button>
  );
};

// Fade in animation wrapper
const FadeInUp = ({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) => (
  <m.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </m.div>
);

const MailIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

function Design4Content() {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const { strings: c, registry, formatPeriod } = useContent();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactPrefill, setContactPrefill] = useState("");
  const [activeTab, setActiveTab] = useState<"work" | "freelance">("work");
  const openContact = (prefill?: string) => {
    setContactPrefill(prefill ?? "");
    setIsContactOpen(true);
  };
  const [selectedJob, setSelectedJob] = useState(registry.experience[0]);

  // Dynamic favicon
  useDynamicFavicon("luxury");

  const skin = skins.luxury(isDark);
  const self = designById("luxury");

  // Theme-aware classes
  const bgPrimary = isDark ? "bg-deco-navy" : "bg-luxury-cream";
  const bgSecondary = isDark ? "bg-slate-950" : "bg-luxury-black";
  const textPrimary = isDark ? "text-deco-cream" : "text-luxury-black";
  const textSecondary = isDark ? "text-deco-cream/70" : "text-luxury-black/70";
  const textMuted = isDark ? "text-deco-cream/50" : "text-luxury-black/50";
  const accentCls = isDark ? "text-deco-gold" : "text-luxury-gold";
  const accentBg = isDark ? "bg-deco-gold" : "bg-luxury-gold";
  const borderColor = isDark ? "border-deco-gold/20" : "border-luxury-black/10";
  const borderAccent = isDark ? "border-deco-gold" : "border-luxury-gold";

  const navItems = [
    { label: t("nav.home"), href: "#hero" },
    { label: t("nav.experience"), href: "#experience" },
    { label: t("nav.shopify"), href: "#shopify" },
    { label: t("nav.gallery"), href: "#gallery" },
    { label: t("nav.skills"), href: "#skills" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  const LuxuryHeading = (eyebrow: string, title: string, accent: string, lead?: string) => (
    <FadeInUp>
      <div className="mb-12 md:mb-16">
        <p className={`text-xs tracking-[0.5em] uppercase ${accentCls} mb-4`}>{eyebrow}</p>
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
          {title} <span className={`italic ${accentCls}`}>{accent}</span>
        </h2>
        {lead && <p className={`${textSecondary} mt-4 max-w-2xl font-light`}>{lead}</p>}
      </div>
    </FadeInUp>
  );

  const downloadCv = () => {
    const link = document.createElement("a");
    link.href = registry.personal.cv;
    link.download = "Maximiliano-Bustamante-CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* SEO */}
      <SEOHead title={`${c.meta.title} — ${t(self.nameKey)}`} description={c.meta.description} canonical="https://www.maxfolio.dev/luxury" />

      <div className={`min-h-screen ${bgPrimary} ${textPrimary} font-body overflow-x-hidden transition-colors duration-500`} role="document">
        {/* Contact Modal */}
        <ContactFormModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} variant="luxury" isDark={isDark} initialMessage={contactPrefill} />

        {/* Decorative pattern - dark mode */}
        {isDark && (
          <div className="fixed inset-0 opacity-5 pointer-events-none" aria-hidden="true">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="deco-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#d4af37" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="20" fill="none" stroke="#d4af37" strokeWidth="0.5" />
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
              <LogoSelectorLuxury isDark={isDark} />
              <div className="hidden lg:flex items-center gap-8 h-10">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center h-10 text-xs tracking-[0.2em] uppercase leading-none ${textMuted} hover:${accentCls} transition-colors`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <m.button
                  onClick={() => setIsContactOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 ${isDark ? "bg-deco-gold/10 text-deco-gold border border-deco-gold/30" : "bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30"} hover:${isDark ? "bg-deco-gold/20" : "bg-luxury-gold/20"} transition-all text-xs tracking-[0.15em] uppercase`}
                >
                  <MailIcon />
                  <span className="hidden xl:inline">{t("common.quickEmail")}</span>
                </m.button>
                <div className="hidden lg:flex items-center gap-2">
                  <LanguageSelectorLuxury isDark={isDark} />
                  <ThemeToggle />
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                  <ThemeToggle size="sm" />
                  <LanguageSelectorLuxury isDark={isDark} size="sm" />
                  <MobileMenuLuxury isDark={isDark} onContactClick={() => setIsContactOpen(true)} navItems={navItems} />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main id="main-content">
          {/* Hero Section */}
          <section id="hero" className="min-h-screen flex items-center py-24 px-6 md:px-16" aria-labelledby="hero-heading">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-end">
                <div className="lg:col-span-8">
                  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
                    <div className="mb-6 md:mb-8">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: "60px" }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className={`h-px ${accentBg} mb-4 md:mb-6`}
                      />
                      <p className={`text-xs tracking-[0.5em] uppercase ${textMuted} mb-2`}>{t("hero.greeting")}</p>
                      <p className={`text-xs tracking-[0.3em] uppercase ${accentCls} mb-4`}>{c.hero.eyebrow}</p>
                    </div>

                    <h1 id="hero-heading" className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight mb-6 md:mb-8">
                      <m.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="block">
                        {registry.personal.firstName}
                      </m.span>
                      <m.span
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className={`block ${accentCls} italic`}
                      >
                        {registry.personal.lastName}
                      </m.span>
                    </h1>

                    <m.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className={`font-display text-xl md:text-2xl ${textPrimary} max-w-xl leading-snug mb-4`}
                    >
                      {c.hero.positioning}
                    </m.p>
                    <m.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      className={`text-base md:text-lg ${textSecondary} max-w-xl leading-relaxed font-light mb-6 md:mb-8`}
                    >
                      {c.hero.lead}
                    </m.p>

                    {/* Availability */}
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className={`border-l-2 ${borderAccent} pl-4 md:pl-6 mb-6 md:mb-8`}
                    >
                      <p className={`text-sm ${textSecondary} flex items-center gap-2`}>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {c.hero.availability}
                      </p>
                    </m.div>

                    {/* CTA Buttons */}
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <m.button
                        onClick={() => setIsContactOpen(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-6 md:px-8 py-4 ${isDark ? "bg-deco-gold text-deco-navy" : "bg-luxury-black text-luxury-cream"} hover:opacity-90 transition-all text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2`}
                      >
                        <MailIcon />
                        {c.hero.ctaContact}
                      </m.button>
                      <button
                        onClick={downloadCv}
                        className={`px-6 md:px-8 py-4 border ${borderColor} hover:${borderAccent} transition-all text-sm tracking-[0.2em] uppercase text-center flex items-center justify-center gap-2`}
                      >
                        <DownloadIcon />
                        {c.hero.ctaCv}
                      </button>
                    </m.div>
                  </m.div>
                </div>

                {/* Side Stats */}
                <div className="lg:col-span-4">
                  <m.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className={`border-l ${borderColor} pl-6 md:pl-8 grid grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-6`}
                  >
                    {registry.stats.slice(0, 4).map((stat) => (
                      <div key={stat.id}>
                        <span className={`font-display text-3xl md:text-4xl lg:text-5xl ${accentCls}`}>{stat.value}</span>
                        <p className={`text-xs tracking-[0.2em] uppercase ${textMuted} mt-2`}>{c.stats[stat.id]}</p>
                      </div>
                    ))}
                  </m.div>
                </div>
              </div>
            </div>
          </section>

          {/* Fleet ticker — a serif, reverse-hover strip of every store name, the divider between hero and experience */}
          <div className={`border-y ${borderColor} ${bgSecondary} py-6`} aria-hidden={false}>
            <Ticker
              variant="reverse-hover"
              duration={50}
              label={c.sections.now.band}
              items={registry.stores.filter((st) => !st.legacy)}
              keyOf={(st) => st.slug}
              itemClassName="flex shrink-0 items-baseline gap-3 whitespace-nowrap px-6"
              renderItem={(st) => (
                <>
                  <span className={`font-display text-2xl italic md:text-4xl ${isDark ? 'text-deco-cream' : 'text-luxury-cream'}`}>{st.name}</span>
                  <span className={`text-xs uppercase tracking-[0.3em] ${accentCls}`}>{st.status === 'live' ? c.badges.live : c.badges.dev}</span>
                </>
              )}
            />
          </div>

          {/* Experience Section */}
          {/* Stat band — the work, in numerals, on a hairline grid */}
          <section className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}>
            <div className="max-w-7xl mx-auto">
              <StatBand skin={skin} />
            </div>
          </section>

          <section id="experience" className={`py-20 md:py-32 px-6 md:px-16 ${bgSecondary} ${isDark ? "text-deco-cream" : "text-luxury-cream"}`}>
            <div className="max-w-7xl mx-auto">
              <FadeInUp>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
                  <div>
                    <p className={`text-xs tracking-[0.5em] uppercase ${accentCls} mb-4`}>{c.sections.experience.eyebrow}</p>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                      {c.sections.experience.title} <span className={`italic ${accentCls}`}>{c.sections.experience.titleAccent}</span>
                    </h2>
                  </div>
                  <div className={`hidden md:block w-24 h-px ${accentBg}`} />
                </div>
              </FadeInUp>

              {/* Tab Navigation */}
              <FadeInUp delay={0.1}>
                <div className="flex justify-center mb-8 md:mb-12">
                  <div className={`${isDark ? "bg-deco-navy/50" : "bg-white/10"} rounded-full p-1 backdrop-blur-sm border ${borderColor} flex`}>
                    {(["work", "freelance"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 md:px-6 py-2 text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase rounded-full transition-all ${
                          activeTab === tab
                            ? `${accentBg} ${isDark ? "text-deco-navy" : "text-white"}`
                            : `${isDark ? "text-deco-cream/60" : "text-white/60"} hover:text-white`
                        }`}
                      >
                        {tab === "work" ? t("sections.experienceTabWork") : t("sections.experienceTabFreelance")}
                      </button>
                    ))}
                  </div>
                </div>
              </FadeInUp>

              <AnimatePresence mode="wait">
                {activeTab === "work" && (
                  <m.div
                    key="work"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid lg:grid-cols-12 gap-6 md:gap-8"
                  >
                    {/* Job List */}
                    <div className="lg:col-span-4 space-y-3 md:space-y-4 order-2 lg:order-1">
                      {registry.experience.map((job, index) => (
                        <m.button
                          type="button"
                          key={job.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedJob(job)}
                          className={`w-full text-left cursor-pointer p-4 md:p-6 border transition-all ${
                            selectedJob.id === job.id
                              ? `${borderAccent} ${isDark ? "bg-deco-gold/10" : "bg-luxury-gold/10"}`
                              : `${borderColor} hover:${borderAccent}`
                          }`}
                        >
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${job.end === null ? "bg-green-500 animate-pulse" : accentBg}`} />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold mb-1 text-sm md:text-base">{c.experience[job.id].title}</h3>
                              <p className={`${accentCls} text-sm`}>{job.company}</p>
                              <p className={`text-xs ${isDark ? "text-deco-cream/40" : "text-white/40"} mt-1`}>{formatPeriod(job.start, job.end)}</p>
                            </div>
                          </div>
                        </m.button>
                      ))}
                    </div>

                    {/* Job Details */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                      <AnimatePresence mode="wait">
                        <m.div
                          key={selectedJob.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`border ${borderColor} ${isDark ? "bg-deco-navy/30" : "bg-white/5"} p-6 md:p-8`}
                        >
                          <div className="flex flex-wrap items-start gap-4 md:gap-6 mb-6 md:mb-8">
                            {selectedJob.logo && (
                              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl p-2 flex-shrink-0">
                                <CompanyLogo src={selectedJob.logo} alt={selectedJob.company} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                <h3 className="text-xl md:text-2xl font-display">{c.experience[selectedJob.id].title}</h3>
                                <span
                                  className={`text-xs px-2 md:px-3 py-1 ${
                                    selectedJob.end === null
                                      ? "bg-green-500/20 text-green-400"
                                      : `${isDark ? "bg-deco-gold/20 text-deco-gold" : "bg-luxury-gold/20 text-luxury-gold"}`
                                  }`}
                                >
                                  {selectedJob.end === null ? c.badges.current : c.badges.completed}
                                </span>
                              </div>
                              <p className={`${isDark ? "text-deco-cream/60" : "text-white/60"} text-sm`}>
                                {selectedJob.company} • {selectedJob.location} • {formatPeriod(selectedJob.start, selectedJob.end)}
                              </p>
                              {selectedJob.website && (
                                <a
                                  href={selectedJob.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`${accentCls} text-sm hover:underline mt-1 inline-block`}
                                >
                                  {c.sections.experience.visit} →
                                </a>
                              )}
                            </div>
                          </div>

                          <p className={`${isDark ? "text-deco-cream/70" : "text-white/70"} leading-relaxed mb-6 md:mb-8 text-sm md:text-base`}>
                            {c.experience[selectedJob.id].summary}
                          </p>

                          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                            {selectedJob.metrics.map((metric) => (
                              <div key={metric.id} className={`text-center p-3 md:p-4 ${isDark ? "bg-deco-navy/50" : "bg-white/5"} rounded-lg`}>
                                <div className={`text-lg md:text-2xl font-display ${accentCls}`}>{metric.value}</div>
                                <div className={`text-xs ${isDark ? "text-deco-cream/50" : "text-white/50"}`}>
                                  {c.experience[selectedJob.id].metricLabels[metric.id]}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mb-6 md:mb-8">
                            <h4 className={`text-xs tracking-[0.2em] uppercase ${accentCls} mb-4`}>{c.sections.experience.achievements}</h4>
                            <ul className="space-y-2 md:space-y-3">
                              {c.experience[selectedJob.id].highlights.map((highlight) => (
                                <li key={highlight} className="flex items-start gap-2 md:gap-3">
                                  <span className={`w-1.5 h-1.5 ${accentBg} rotate-45 mt-2 flex-shrink-0`} />
                                  <span className={`${isDark ? "text-deco-cream/70" : "text-white/70"} text-sm`}>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className={`text-xs tracking-[0.2em] uppercase ${accentCls} mb-4`}>{c.sections.experience.technologies}</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedJob.technologies.map((tech) => (
                                <span key={tech} className={`text-xs px-2 md:px-3 py-1 border ${borderColor} ${isDark ? "text-deco-cream/60" : "text-white/60"}`}>
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </m.div>
                      </AnimatePresence>
                    </div>
                  </m.div>
                )}

                {activeTab === "freelance" && (
                  <m.div
                    key="freelance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  >
                    {registry.personalProjects.map((project, index) => (
                      <m.a
                        key={project.id}
                        href={project.url ?? project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className={`group p-6 md:p-8 border ${borderColor} hover:${borderAccent} ${isDark ? "bg-deco-navy/30" : "bg-white/5"} transition-all`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-3xl md:text-4xl font-display ${isDark ? "text-deco-gold/20" : "text-luxury-gold/20"} group-hover:${accentCls} transition-colors`}>
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <span className={`text-xs ${isDark ? "text-deco-cream/40" : "text-white/40"}`}>{project.year}</span>
                        </div>
                        <h3 className={`text-lg md:text-xl font-display mb-2 group-hover:${accentCls} transition-colors`}>{project.name}</h3>
                        <p className={`${accentCls} text-sm mb-4`}>{c.projects[project.id]?.tagline}</p>
                        <p className={`${isDark ? "text-deco-cream/60" : "text-white/60"} text-sm mb-6`}>{c.projects[project.id]?.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.stack.map((tech) => (
                            <span key={tech} className={`text-xs px-2 md:px-3 py-1 border ${borderColor}`}>
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className={`mt-4 ${accentCls} text-sm opacity-0 group-hover:opacity-100 transition-opacity`}>{c.sections.projects.view} →</div>
                      </m.a>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Years: the career year by year, opened by the unit chart of shipped work */}
          <section className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}>
            <div className="max-w-7xl mx-auto">
              <Years skin={skin} heading={LuxuryHeading} />
            </div>
          </section>

          {/* Process: how a store ships, as a pinned stepper */}
          <section className={`py-20 md:py-32 px-6 md:px-16 ${isDark ? "bg-slate-950/60" : "bg-luxury-black/[0.03]"}`}>
            <div className="max-w-7xl mx-auto">
              <Process skin={skin} heading={LuxuryHeading} canvas={isDark ? "bg-slate-950" : "bg-luxury-black/[0.03]"} />
            </div>
          </section>

          {/* Shopify Work */}
          <section className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}>
            <div className="max-w-7xl mx-auto">
              <ShopifyWork skin={skin} heading={LuxuryHeading} />
            </div>
          </section>

          {/* Gallery */}
          <section className={`py-20 md:py-32 px-6 md:px-16 ${isDark ? "bg-slate-950/60" : "bg-luxury-black/[0.03]"}`}>
            <div className="max-w-7xl mx-auto">
              <Gallery skin={skin} heading={LuxuryHeading} />
            </div>
          </section>

          {/* Manifesto — inverted typographic band */}
          <Manifesto skin={skin} />

          {/* Skills Section — the ledger + narrative sentences */}
          <section id="skills" className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}>
            <div className="max-w-7xl mx-auto">
              <Skills skin={skin} heading={LuxuryHeading} />
            </div>
          </section>

          {/* FAQ */}
          <section className={`py-20 md:py-32 px-6 md:px-16 ${isDark ? "bg-slate-950/60" : "bg-luxury-black/[0.03]"}`}>
            <div className="max-w-7xl mx-auto">
              <Faq skin={skin} heading={LuxuryHeading} />
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}>
            <div className="max-w-5xl mx-auto">
              <Contact skin={skin} ctaClass={`press inline-flex items-center justify-center gap-2 px-8 py-4 text-sm tracking-[0.2em] uppercase ${isDark ? "bg-deco-gold text-deco-navy" : "bg-luxury-black text-luxury-cream"} hover:opacity-90 transition-all`} onContact={openContact} />
            </div>
          </section>
        </main>

        {/* Explore Other Designs Section */}
        <ExploreDesignsLuxury isDark={isDark} />

        {/* Footer */}
        <footer className={`py-8 md:py-12 px-6 md:px-16 border-t ${borderColor}`} role="contentinfo" aria-label="Site footer">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
              <div>
                <h3 className={`font-display text-lg md:text-xl mb-4 ${accentCls}`}>{registry.personal.name}</h3>
                <p className={`text-sm ${textSecondary} leading-relaxed`}>{c.footer.tagline}</p>
              </div>
              <div>
                <h4 className={`text-xs tracking-[0.2em] uppercase ${accentCls} mb-4`}>{c.footer.servicesTitle}</h4>
                <ul className={`text-sm ${textSecondary} space-y-1 md:space-y-2`}>
                  {c.footer.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={`text-xs tracking-[0.2em] uppercase ${accentCls} mb-4`}>{c.footer.quickLinks}</h4>
                <ul className={`text-sm ${textSecondary} space-y-1 md:space-y-2`}>
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className={`hover:${accentCls} transition-colors`}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                  {otherDesigns("luxury").map((d) => (
                    <li key={d.id}>
                      <TransitionLink
                        to={d.href}
                        transitionColor={d.transitionColor}
                        transitionAccent={d.transitionAccent}
                        transitionLabel={t(d.nameKey)}
                        className={`hover:${accentCls} transition-colors`}
                      >
                        {t(d.nameKey)}
                      </TransitionLink>
                    </li>
                  ))}
                  <li>
                    <TransitionLink
                      to={MENU.route}
                      transitionColor={isDark ? "#171717" : "#fafafa"}
                      transitionAccent={isDark ? "#ffffff" : "#171717"}
                      transitionLabel={t(MENU.labelKey)}
                      className={`hover:${accentCls} transition-colors`}
                    >
                      {t(MENU.subtitleKey)}
                    </TransitionLink>
                  </li>
                </ul>
              </div>
            </div>

            <div className={`pt-6 md:pt-8 border-t ${borderColor} flex flex-col md:flex-row justify-between items-center gap-4`}>
              <p className={`text-xs tracking-[0.2em] uppercase ${textMuted}`}>© 2026 {registry.personal.name}</p>
              <p className={`text-xs tracking-[0.2em] uppercase ${textMuted}`}>
                <span className={accentCls}>{t(self.nameKey)}</span> — {t(self.subtitleKey)}
              </p>
            </div>
          </div>
        </footer>

        {/* Mobile floating contact button */}
        <m.button
          onClick={() => setIsContactOpen(true)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className={`fixed bottom-6 right-6 md:hidden w-14 h-14 ${isDark ? "bg-deco-gold text-deco-navy" : "bg-luxury-black text-luxury-cream"} rounded-full shadow-lg flex items-center justify-center z-30`}
          whileTap={{ scale: 0.9 }}
          aria-label="Open contact form"
        >
          <MailIcon className="w-6 h-6" />
        </m.button>
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
