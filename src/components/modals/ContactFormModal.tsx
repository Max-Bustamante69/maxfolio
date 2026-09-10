import { m, AnimatePresence } from 'framer-motion'
import { useEffect, useState, FormEvent } from 'react'
import { config } from '../../config'
import { currentVariant, recordAb } from '../../ab'
import { personal as personalInfo } from '../../data/registry'
import { useI18n } from '../../hooks'

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'luxury' | 'brutalist' | 'apple' | 'neo' | 'persona' | 'terminal' | 'skyline'
  isDark?: boolean
  /** Text placed in the message field when the form opens (e.g. the store URL from the contact section). */
  initialMessage?: string
}

export function ContactFormModal({ 
  isOpen, 
  onClose, 
  variant = 'luxury',
  isDark = false,
  initialMessage,
}: ContactFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const { t } = useI18n()
  useEffect(() => {
    if (isOpen && initialMessage) setFormData((prev) => (prev.message ? prev : { ...prev, message: initialMessage }))
  }, [isOpen, initialMessage])
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: config.web3formsKey,
          name: formData.name,
          email: formData.email,
          subject: `${formData.subject || 'Portfolio Contact'} · via ${variant}/${currentVariant()}`,
          message: formData.message,
          to: personalInfo.email,
          // attribution: which landing variant and which theme the request came from
          variant: currentVariant(),
          theme: variant,
          page: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setStatus('success')
        recordAb('contact', { theme: variant })
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => {
          onClose()
          setStatus('idle')
        }, 2000)
      } else {
        throw new Error('Form submission failed')
      }
    } catch {
      const mailtoLink = `mailto:${personalInfo.email}?subject=${encodeURIComponent(formData.subject || 'Portfolio Contact')}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`
      window.open(mailtoLink, '_blank')
      setStatus('success')
      setTimeout(() => {
        onClose()
        setStatus('idle')
      }, 1000)
    }
  }

  // Luxury variant styles
  const luxuryStyles = {
    bgModal: isDark ? 'bg-deco-navy' : 'bg-luxury-cream',
    bgInput: isDark 
      ? 'bg-deco-navy/50 border-deco-gold/30 text-deco-cream placeholder:text-deco-cream/40 focus:border-deco-gold' 
      : 'bg-white border-luxury-black/20 text-luxury-black placeholder:text-luxury-black/40 focus:border-luxury-gold',
    textPrimary: isDark ? 'text-deco-cream' : 'text-luxury-black',
    textSecondary: isDark ? 'text-deco-cream/60' : 'text-luxury-black/60',
    textMuted: isDark ? 'text-deco-cream/40' : 'text-luxury-black/40',
    accent: isDark ? 'text-deco-gold' : 'text-luxury-gold',
    btnPrimary: isDark 
      ? 'bg-deco-gold text-deco-navy hover:bg-deco-cream' 
      : 'bg-luxury-black text-luxury-cream hover:bg-luxury-gold hover:text-luxury-black',
    btnSecondary: isDark 
      ? 'border-deco-gold/30 text-deco-cream hover:bg-deco-gold/10' 
      : 'border-luxury-black/20 text-luxury-black hover:bg-luxury-black/5',
  }

  // Brutalist variant styles
  const brutalistStyles = {
    bgModal: isDark ? 'bg-stone-950' : 'bg-stone-100',
    bgInput: isDark 
      ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-red-600' 
      : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-red-600',
    textPrimary: isDark ? 'text-stone-100' : 'text-stone-900',
    textSecondary: isDark ? 'text-stone-400' : 'text-stone-600',
    textMuted: isDark ? 'text-stone-500' : 'text-stone-400',
    accent: 'text-red-600',
    btnPrimary: 'bg-red-600 text-white hover:bg-red-700',
    btnSecondary: isDark 
      ? 'border-stone-600 text-stone-300 hover:bg-stone-800' 
      : 'border-stone-300 text-stone-700 hover:bg-stone-200',
  }

  // Apple variant styles
  const appleStyles = {
    bgModal: isDark ? 'bg-[#1d1d1f] rounded-[22px]' : 'bg-white rounded-[22px]',
    bgInput: isDark
      ? 'bg-white/10 border-transparent text-[#f5f5f7] placeholder:text-[#a1a1a6] focus:border-[#2997ff] rounded-[12px]'
      : 'bg-[#f5f5f7] border-transparent text-[#1d1d1f] placeholder:text-[#6e6e73] focus:border-[#0071e3] rounded-[12px]',
    textPrimary: isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]',
    textSecondary: isDark ? 'text-[#d2d2d7]' : 'text-[#424245]',
    textMuted: isDark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]',
    accent: isDark ? 'text-[#2997ff]' : 'text-[#0071e3]',
    btnPrimary: 'bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full press',
    btnSecondary: isDark
      ? 'border-white/15 text-[#f5f5f7] hover:bg-white/10 rounded-full press'
      : 'border-black/10 text-[#1d1d1f] hover:bg-black/5 rounded-full press',
  }

  // Neo variant styles: recessed (inset) fields — the shadow IS the border, no visible border color —
  // and a flat accent-fill primary button, the one deliberate style break (§2.5.2 / Idea 11).
  const neoStyles = {
    bgModal: 'neo-raised neo-xl bg-neo-surface',
    bgInput: 'neo-field neo-md border-transparent text-neo-ink placeholder:text-neo-inkMuted focus:outline-none',
    textPrimary: 'text-neo-ink',
    textSecondary: 'text-neo-inkMuted',
    textMuted: 'text-neo-inkMuted',
    accent: 'text-neo-accent',
    btnPrimary: 'neo-btn neo-btn-accent',
    btnSecondary: 'neo-raised neo-md neo-interactive border-transparent text-neo-ink',
  }

  // Persona variant: a "dialogue box" — a notch-cut name-plate corner, ink/paper ground, one accent.
  const personaStyles = {
    bgModal: isDark ? 'bg-[#111013] persona-notch' : 'bg-[#f5f2ee] persona-notch',
    bgInput: isDark
      ? 'bg-[#f5f2ee]/[0.06] border-[#f5f2ee]/20 text-[#f5f2ee] placeholder:text-[#f5f2ee]/40 focus:border-[#c8102e]'
      : 'bg-[#0a0f1a]/[0.03] border-[#0a0f1a]/15 text-[#0a0f1a] placeholder:text-[#0a0f1a]/40 focus:border-[#1c6fb0]',
    textPrimary: isDark ? 'text-[#f5f2ee]' : 'text-[#0a0f1a]',
    textSecondary: isDark ? 'text-[#f5f2ee]/70' : 'text-[#0a0f1a]/70',
    textMuted: isDark ? 'text-[#f5f2ee]/45' : 'text-[#0a0f1a]/45',
    // #e8465f (not #c8102e) for text on ink: the deep red only clears ~3.2:1 there, short of AA.
    accent: isDark ? 'text-[#e8465f]' : 'text-[#1c6fb0]',
    btnPrimary: isDark ? 'bg-[#c8102e] text-[#f5f2ee] hover:bg-[#8f0b1f]' : 'bg-[#1c6fb0] text-white hover:bg-[#0a0f1a]',
    btnSecondary: isDark ? 'border-[#f5f2ee]/20 text-[#f5f2ee] hover:bg-[#f5f2ee]/10' : 'border-[#0a0f1a]/20 text-[#0a0f1a] hover:bg-[#0a0f1a]/5',
  }

  // Terminal variant: a bordered, square-cornered console pane — no fill, the border IS the frame,
  // fields keep the same hairline border with the phosphor accent only on focus.
  const terminalStyles = {
    bgModal: 'border border-[var(--term-line)] bg-[var(--term-bg)]',
    bgInput: 'bg-transparent border-[var(--term-line)] text-[var(--term-ink)] placeholder:text-[var(--term-muted)] focus:border-[var(--term-accent)]',
    textPrimary: 'text-[var(--term-ink)]',
    textSecondary: 'text-[var(--term-muted)]',
    textMuted: 'text-[var(--term-muted)]',
    accent: 'text-[var(--term-accent)]',
    btnPrimary: 'bg-[var(--term-fill)] text-[var(--term-ink)] hover:bg-[var(--term-accent)] hover:text-[var(--term-bg)] border border-[var(--term-accent)]',
    btnSecondary: 'border-[var(--term-line)] text-[var(--term-ink)] hover:bg-[var(--term-line)]/30',
  }

  // Skyline variant: HUD panel on the theme's own deep navy, mono field labels, the reserved cyan
  // reads here as a real state signal (successful send), never as page decoration.
  const skylineStyles = {
    bgModal: 'bg-[#141d2e] border border-[#e7edf5]/10 rounded-md',
    bgInput: 'bg-[#0d1420] border-[#e7edf5]/15 text-[#eef3f9] placeholder:text-[#8d9bb0] focus:border-[#4fd1ff] font-mono text-sm rounded-[3px]',
    textPrimary: 'text-[#eef3f9]',
    textSecondary: 'text-[#c7d2e0]',
    textMuted: 'text-[#8d9bb0]',
    accent: 'text-[#4fd1ff]',
    btnPrimary: 'bg-[#4fd1ff] text-[#0d1420] hover:bg-[#7fe0ff] font-mono uppercase tracking-[0.08em] rounded-[3px]',
    btnSecondary: 'border-[#e7edf5]/20 text-[#c7d2e0] hover:bg-[#e7edf5]/10 font-mono uppercase tracking-[0.08em] rounded-[3px]',
  }

  const styles = variant === 'apple' ? appleStyles : variant === 'luxury' ? luxuryStyles : variant === 'neo' ? neoStyles : variant === 'persona' ? personaStyles : variant === 'terminal' ? terminalStyles : variant === 'skyline' ? skylineStyles : brutalistStyles
  const successCircle = variant === 'apple' ? 'bg-[#0071e3]/15' : variant === 'luxury' ? 'bg-deco-gold/20' : variant === 'neo' ? 'bg-[#4453d9]/15' : variant === 'persona' ? (isDark ? 'bg-[#c8102e]/20' : 'bg-[#1c6fb0]/15') : variant === 'terminal' ? 'bg-[var(--term-accent)]/15' : variant === 'skyline' ? 'bg-[#4fd1ff]/15' : 'bg-red-600/20'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />
          
          {/* Desktop Modal */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="hidden md:block fixed top-0 left-0 right-0 bottom-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <div className={`${styles.bgModal} w-full max-w-md p-8 relative`}>
                {/* Close button */}
                <button
                  onClick={onClose}
                  className={`absolute top-4 right-4 ${styles.textMuted} hover:${styles.textPrimary} transition-colors`}
                  aria-label="Close contact form"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Header */}
                <div className="mb-6">
                  <h3 id="contact-modal-title" className={`font-display text-2xl mb-2 ${styles.textPrimary}`}>{t('contactModal.title')}</h3>
                  <p className={`text-sm ${styles.textSecondary}`}>
                    {t('contactModal.description')}
                  </p>
                </div>

                {/* Success State */}
                {status === 'success' ? (
                  <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${successCircle} flex items-center justify-center`}>
                      <svg className={`w-8 h-8 ${styles.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className={`font-display text-xl ${styles.textPrimary}`}>{t('contactModal.sentTitle')}</p>
                    <p className={`text-sm ${styles.textSecondary} mt-2`}>{t('contactModal.sentSubtitle')}</p>
                  </m.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="sr-only">{t('common.name')}</label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${styles.bgInput}`}
                          placeholder={t('common.name')}
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="sr-only">{t('common.email')}</label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${styles.bgInput}`}
                          placeholder={t('common.email')}
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    
                    <label htmlFor="contact-subject" className="sr-only">{t('common.subject')}</label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${styles.bgInput}`}
                      placeholder={t('common.subjectOptional')}
                    />
                    
                    <label htmlFor="contact-message" className="sr-only">{t('common.yourMessageLabel')}</label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors resize-none ${styles.bgInput}`}
                      placeholder={t('common.yourMessage')}
                    />

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className={`flex-1 py-3 border text-sm transition-colors ${styles.btnSecondary}`}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className={`flex-1 py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${styles.btnPrimary}`}
                      >
                        {status === 'sending' ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t('common.sending')}
                          </>
                        ) : t('common.sendMessage')}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <p className={`text-xs ${styles.textMuted}`}>
                    {t('common.orEmailDirectly')}{' '}
                    <a href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer" className={styles.accent}>
                      {personalInfo.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </m.div>

          {/* Mobile Bottom Sheet */}
          <m.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${styles.bgModal} rounded-t-3xl max-h-[90vh] overflow-y-auto`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title-mobile"
          >
            {/* Drag handle */}
            <div className="sticky top-0 pt-3 pb-2 flex justify-center" aria-hidden="true">
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/20'}`} />
            </div>

            <div className="px-6 pb-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 id="contact-modal-title-mobile" className={`font-display text-xl mb-1 ${styles.textPrimary}`}>{t('contactModal.title')}</h3>
                  <p className={`text-xs ${styles.textSecondary}`}>{t('contactModal.sentSubtitle')}</p>
                </div>
                <button onClick={onClose} className={styles.textMuted} aria-label="Close contact form">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {status === 'success' ? (
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-full ${successCircle} flex items-center justify-center`}>
                    <svg className={`w-7 h-7 ${styles.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className={`font-display text-lg ${styles.textPrimary}`}>{t('contactModal.successSent')}</p>
                </m.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
                  <label htmlFor="contact-name-mobile" className="sr-only">{t('common.name')}</label>
                  <input
                    id="contact-name-mobile"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full border-2 px-4 py-3.5 rounded-xl text-base focus:outline-none transition-colors ${styles.bgInput}`}
                    placeholder={t('common.name')}
                    autoComplete="name"
                  />
                  
                  <label htmlFor="contact-email-mobile" className="sr-only">{t('common.email')}</label>
                  <input
                    id="contact-email-mobile"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full border-2 px-4 py-3.5 rounded-xl text-base focus:outline-none transition-colors ${styles.bgInput}`}
                    placeholder={t('common.email')}
                    autoComplete="email"
                  />
                  
                  <label htmlFor="contact-message-mobile" className="sr-only">{t('common.yourMessageLabel')}</label>
                  <textarea
                    id="contact-message-mobile"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className={`w-full border-2 px-4 py-3.5 rounded-xl text-base focus:outline-none transition-colors resize-none ${styles.bgInput}`}
                    placeholder={t('common.yourMessage')}
                  />

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 py-4 rounded-xl border-2 text-sm ${styles.btnSecondary}`}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className={`flex-1 py-4 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${styles.btnPrimary}`}
                    >
                      {status === 'sending' ? t('common.sending') : t('common.send')}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center pb-4">
                <a href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer" className={`text-xs ${styles.accent}`}>
                  {personalInfo.email}
                </a>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
