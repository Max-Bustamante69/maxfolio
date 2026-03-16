import { motion, AnimatePresence } from 'framer-motion'
import { useState, FormEvent } from 'react'
import { config } from '../../config'
import { personalInfo } from '../../data/portfolio-extended'

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'luxury' | 'brutalist'
  isDark?: boolean
}

export function ContactFormModal({ 
  isOpen, 
  onClose, 
  variant = 'luxury',
  isDark = false 
}: ContactFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

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
          subject: formData.subject || 'Portfolio Contact',
          message: formData.message,
          to: personalInfo.email,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setStatus('success')
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

  const styles = variant === 'luxury' ? luxuryStyles : brutalistStyles

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />
          
          {/* Desktop Modal */}
          <motion.div
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
                  <h3 id="contact-modal-title" className={`font-display text-2xl mb-2 ${styles.textPrimary}`}>Quick Message</h3>
                  <p className={`text-sm ${styles.textSecondary}`}>
                    Send me a message and I'll get back to you soon.
                  </p>
                </div>

                {/* Success State */}
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${variant === 'luxury' ? 'bg-deco-gold/20' : 'bg-red-600/20'} flex items-center justify-center`}>
                      <svg className={`w-8 h-8 ${styles.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className={`font-display text-xl ${styles.textPrimary}`}>Message Sent!</p>
                    <p className={`text-sm ${styles.textSecondary} mt-2`}>I'll respond as soon as possible.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="sr-only">Your name</label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${styles.bgInput}`}
                          placeholder="Name"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="sr-only">Your email</label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${styles.bgInput}`}
                          placeholder="Email"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    
                    <label htmlFor="contact-subject" className="sr-only">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${styles.bgInput}`}
                      placeholder="Subject (optional)"
                    />
                    
                    <label htmlFor="contact-message" className="sr-only">Your message</label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors resize-none ${styles.bgInput}`}
                      placeholder="Your message..."
                    />

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className={`flex-1 py-3 border text-sm transition-colors ${styles.btnSecondary}`}
                      >
                        Cancel
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
                            Sending...
                          </>
                        ) : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <p className={`text-xs ${styles.textMuted}`}>
                    Or email directly:{' '}
                    <a href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer" className={styles.accent}>
                      {personalInfo.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
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
                  <h3 id="contact-modal-title-mobile" className={`font-display text-xl mb-1 ${styles.textPrimary}`}>Quick Message</h3>
                  <p className={`text-xs ${styles.textSecondary}`}>I'll respond as soon as possible.</p>
                </div>
                <button onClick={onClose} className={styles.textMuted} aria-label="Close contact form">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-full ${variant === 'luxury' ? 'bg-deco-gold/20' : 'bg-red-600/20'} flex items-center justify-center`}>
                    <svg className={`w-7 h-7 ${styles.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className={`font-display text-lg ${styles.textPrimary}`}>Sent!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
                  <label htmlFor="contact-name-mobile" className="sr-only">Your name</label>
                  <input
                    id="contact-name-mobile"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full border-2 px-4 py-3.5 rounded-xl text-base focus:outline-none transition-colors ${styles.bgInput}`}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  
                  <label htmlFor="contact-email-mobile" className="sr-only">Your email</label>
                  <input
                    id="contact-email-mobile"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full border-2 px-4 py-3.5 rounded-xl text-base focus:outline-none transition-colors ${styles.bgInput}`}
                    placeholder="Your email"
                    autoComplete="email"
                  />
                  
                  <label htmlFor="contact-message-mobile" className="sr-only">Your message</label>
                  <textarea
                    id="contact-message-mobile"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className={`w-full border-2 px-4 py-3.5 rounded-xl text-base focus:outline-none transition-colors resize-none ${styles.bgInput}`}
                    placeholder="Your message..."
                  />

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 py-4 rounded-xl border-2 text-sm ${styles.btnSecondary}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className={`flex-1 py-4 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${styles.btnPrimary}`}
                    >
                      {status === 'sending' ? 'Sending...' : 'Send'}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
